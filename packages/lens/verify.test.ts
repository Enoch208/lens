import { test } from "node:test";
import assert from "node:assert/strict";
import type { Baseline, KaneRun, LensConfig, Observations } from "./types.ts";
import { runVerify } from "./verify.ts";
import { formatBlockReason } from "./report.ts";

const CONFIG: LensConfig = {
  appUrl: "http://localhost:3000",
  variablesFile: ".testmuai/variables/local.json",
  perTestTimeoutS: 420,
  hookBudgetS: 1200,
  maxAttempts: 3,
  fallbackFlow: "member-removal",
  ignore: ["packages/lens/**", "docs/**"],
  flows: {
    "member-removal": {
      test: ".testmuai/tests/remove-member_test.md",
      label: "Member removal",
      risk: "HIGH",
      protect: ["active_members", "billable_seats", "monthly_total"],
      observe: [],
    },
    billing: {
      test: ".testmuai/tests/annual-billing_test.md",
      label: "Billing",
      risk: "HIGH",
      protect: ["billable_seats", "price_per_seat"],
      observe: ["annual_discount"],
    },
  },
};

const BASELINE: Baseline = {
  commit: "abc1234",
  createdAt: "2026-08-21T18:00:00.000Z",
  flows: {
    "member-removal": {
      test: ".testmuai/tests/remove-member_test.md",
      status: "passed",
      state: { active_members: "4", billable_seats: "4", monthly_total: "$80.00" },
      runDir: null,
      shareUrl: null,
      durationS: 40,
    },
    billing: {
      test: ".testmuai/tests/annual-billing_test.md",
      status: "passed",
      state: { billable_seats: "5", price_per_seat: "$20.00", annual_discount: "$0.00" },
      runDir: null,
      shareUrl: null,
      durationS: 40,
    },
  },
};

const FLOW_MAP = { "lib/seatline.ts": ["billing", "member-removal"] };

function stubRun(observed: Observations, overrides: Partial<KaneRun> = {}): KaneRun {
  return {
    status: "passed",
    observed,
    runDir: "/runs/0",
    shareUrl: "https://test-manager.lambdatest.com/share/xyz",
    durationS: 30,
    credits: null,
    replayed: true,
    reason: null,
    failedStep: null,
    screenshot: null,
    exitCode: 0,
    infraError: null,
    ...overrides,
  };
}

function verifyWith(byFlow: Record<string, KaneRun>, flows = ["member-removal", "billing"]) {
  return runVerify({
    config: CONFIG,
    baseline: BASELINE,
    flowMap: FLOW_MAP,
    changeRequest: "Add annual billing with a 10% discount",
    agent: "Claude Code",
    attempt: 1,
    budgetS: 600,
    flows,
    log: () => {},
    persist: false,
    runner: async (testPath) => {
      const name = Object.keys(CONFIG.flows).find((flow) => testPath.endsWith(CONFIG.flows[flow].test));
      return byFlow[name ?? ""] ?? stubRun({});
    },
  });
}

test("the whole loop: the feature lands, an unrelated seat count moves, LENS blocks", async () => {
  const report = await verifyWith({
    // The annual discount is exactly what was asked for — and it is allowed to move.
    billing: stubRun({ billable_seats: "5", price_per_seat: "$20.00", annual_discount: "$10.00" }),
    // Removal still looks right on screen, but the workspace is billed for a seat it gave up.
    "member-removal": stubRun({ active_members: "4", billable_seats: "5", monthly_total: "$100.00" }),
  });

  assert.equal(report.verdict, "blocked");
  assert.equal(report.unexpectedCount, 2, "billable_seats and monthly_total both moved");

  const billing = report.flows.find((flow) => flow.flow === "billing")!;
  assert.equal(billing.deltas.find((d) => d.key === "annual_discount")?.verdict, "EXPECTED_CHANGE");
  assert.equal(billing.deltas.find((d) => d.key === "billable_seats")?.verdict, "SAME");

  const reason = formatBlockReason(report, CONFIG);
  assert.match(reason, /LENS BLOCKED COMPLETION/);
  assert.match(reason, /Observable\s+billable_seats/);
  assert.match(reason, /Known-good\s+4/);
  assert.match(reason, /Candidate\s+5/);
  assert.match(reason, /Kane run\s+https:\/\//, "the agent gets the evidence link, not just a claim");
  assert.match(reason, /Attempt 1 of 3/);
  assert.ok(!/annual_discount/.test(reason), "the authorized change must not be reported as a regression");
});

test("after the repair, the same flows verify green", async () => {
  const report = await verifyWith({
    billing: stubRun({ billable_seats: "5", price_per_seat: "$20.00", annual_discount: "$10.00" }),
    "member-removal": stubRun({ active_members: "4", billable_seats: "4", monthly_total: "$80.00" }),
  });

  assert.equal(report.verdict, "passed");
  assert.equal(report.unexpectedCount, 0);
  assert.ok(report.timeline.some((entry) => entry.kind === "proof"));
});

test("an infrastructure failure is never reported as a regression", async () => {
  const report = await verifyWith(
    { "member-removal": stubRun({}, { status: "error", infraError: "kane-cli exited 2 (auth)" }) },
    ["member-removal"],
  );

  assert.equal(report.verdict, "error", "LENS could not tell — so it must not claim a regression");
  assert.equal(report.unexpectedCount, 0);
});

test("a browser-level failure blocks and names the step that broke", async () => {
  const report = await verifyWith(
    {
      "member-removal": stubRun(
        {},
        { status: "failed", failedStep: "Remove Maya Chen", reason: "the Remove button was not found" },
      ),
    },
    ["member-removal"],
  );

  assert.equal(report.verdict, "blocked");
  const reason = formatBlockReason(report, CONFIG);
  assert.match(reason, /Failed step\s+Remove Maya Chen/);
  assert.match(reason, /the Remove button was not found/);
});

test("a flow that does not fit the budget is reported as skipped, never as verified", async () => {
  const report = await runVerify({
    config: CONFIG,
    baseline: BASELINE,
    flowMap: FLOW_MAP,
    changeRequest: "x",
    agent: "Claude Code",
    attempt: 1,
    budgetS: 0,
    flows: ["member-removal"],
    log: () => {},
    persist: false,
    runner: async () => stubRun({ active_members: "4", billable_seats: "4", monthly_total: "$80.00" }),
  });

  assert.deepEqual(report.skippedFlows, ["member-removal"]);
  assert.equal(report.verdict, "error");
  assert.notEqual(report.verdict, "passed", "an unrun flow must never count as verified");
});

test("one skipped flow is enough to withhold a passing verdict", async () => {
  const report = await runVerify({
    config: CONFIG,
    baseline: BASELINE,
    flowMap: FLOW_MAP,
    changeRequest: "x",
    agent: "Claude Code",
    attempt: 1,
    // Enough budget for the first flow and not the second.
    budgetS: 120,
    flows: ["member-removal", "billing"],
    log: () => {},
    persist: false,
    runner: async (testPath) => {
      const name = Object.keys(CONFIG.flows).find((flow) => testPath.endsWith(CONFIG.flows[flow].test));
      if (name === "member-removal") {
        return stubRun({ active_members: "4", billable_seats: "4", monthly_total: "$80.00" });
      }
      return stubRun({}, { status: "error", infraError: "kane-cli exited 2 (auth)" });
    },
  });

  // The one flow that did run was perfectly clean — that is not the same as a verified build.
  const removal = report.flows.find((flow) => flow.flow === "member-removal")!;
  assert.ok(removal.deltas.every((delta) => delta.verdict === "SAME"));
  assert.equal(report.unexpectedCount, 0);
  assert.equal(report.verdict, "error", "an unverified flow must never read as safe to ship");
});

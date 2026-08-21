export type FixtureDelta = {
  key: string;
  baseline: string;
  candidate: string;
  verdict: "SAME" | "UNEXPECTED_CHANGE" | "EXPECTED_CHANGE";
};

export type FixtureFlow = {
  flow: string;
  status: "passed" | "failed" | "error";
  shareUrl: string;
  runDir: string;
  reason: string | null;
  failedStep: string | null;
  infraError: string | null;
  deltas: FixtureDelta[];
};

export type FixtureReport = {
  startedAt: string;
  finishedAt: string;
  verdict: "passed" | "blocked" | "error";
  changeRequest: string;
  agent: string;
  attempt: number;
  maxAttempts: number;
  changedFiles: string[];
  affectedFlows: string[];
  unmappedFiles: string[];
  skippedFlows: string[];
  flows: FixtureFlow[];
  unexpectedCount: number;
  timeline: { at: string; label: string; kind: "change" | "impact" | "verify" | "fail" | "repair" | "proof" }[];
};

export const BLOCKED_VERIFY: FixtureReport = {
  startedAt: "2026-08-21T18:30:00.000Z",
  finishedAt: "2026-08-21T18:34:00.000Z",
  verdict: "blocked",
  changeRequest: "Add annual billing with a 10% discount",
  agent: "Claude Code",
  attempt: 1,
  maxAttempts: 3,
  changedFiles: ["lib/seatline.ts", "app/billing/page.tsx"],
  affectedFlows: ["billing", "member-removal", "member-invite", "role-change"],
  unmappedFiles: [],
  skippedFlows: [],
  unexpectedCount: 1,
  flows: [
    {
      flow: "billing",
      status: "passed",
      shareUrl: "https://test-manager.lambdatest.com/share/billing",
      runDir: "/tmp/kane/billing",
      reason: null,
      failedStep: null,
      infraError: null,
      deltas: [
        { key: "billable_seats", baseline: "5", candidate: "5", verdict: "SAME" },
        { key: "price_per_seat", baseline: "$20.00", candidate: "$20.00", verdict: "SAME" },
        { key: "monthly_subtotal", baseline: "$100.00", candidate: "$100.00", verdict: "SAME" },
        { key: "annual_discount", baseline: "$0.00", candidate: "$10.00", verdict: "EXPECTED_CHANGE" },
      ],
    },
    {
      flow: "member-removal",
      status: "passed",
      shareUrl: "https://test-manager.lambdatest.com/share/member-removal",
      runDir: "/tmp/kane/member-removal",
      reason: null,
      failedStep: null,
      infraError: null,
      deltas: [
        { key: "active_members", baseline: "4", candidate: "4", verdict: "SAME" },
        { key: "billable_seats", baseline: "4", candidate: "5", verdict: "UNEXPECTED_CHANGE" },
        { key: "monthly_total", baseline: "$80.00", candidate: "$80.00", verdict: "SAME" },
      ],
    },
    {
      flow: "member-invite",
      status: "passed",
      shareUrl: "https://test-manager.lambdatest.com/share/member-invite",
      runDir: "/tmp/kane/member-invite",
      reason: null,
      failedStep: null,
      infraError: null,
      deltas: [
        { key: "active_members", baseline: "6", candidate: "6", verdict: "SAME" },
        { key: "billable_seats", baseline: "6", candidate: "6", verdict: "SAME" },
        { key: "monthly_subtotal", baseline: "$120.00", candidate: "$120.00", verdict: "SAME" },
      ],
    },
    {
      flow: "role-change",
      status: "passed",
      shareUrl: "https://test-manager.lambdatest.com/share/role-change",
      runDir: "/tmp/kane/role-change",
      reason: null,
      failedStep: null,
      infraError: null,
      deltas: [
        { key: "sarah_role", baseline: "Admin", candidate: "Admin", verdict: "SAME" },
        { key: "billable_seats", baseline: "5", candidate: "5", verdict: "SAME" },
        { key: "monthly_subtotal", baseline: "$100.00", candidate: "$100.00", verdict: "SAME" },
      ],
    },
  ],
  timeline: [
    { at: "2026-08-21T18:30:00.000Z", label: "Claude Code modified the billing calculator", kind: "change" },
    { at: "2026-08-21T18:31:00.000Z", label: "Diff mapped to 4 flows", kind: "impact" },
    { at: "2026-08-21T18:32:00.000Z", label: "Kane replayed the affected browser contracts", kind: "verify" },
    { at: "2026-08-21T18:34:00.000Z", label: "Unexpected semantic delta on member-removal", kind: "fail" },
  ],
};

export const PASSED_VERIFY: FixtureReport = {
  ...BLOCKED_VERIFY,
  startedAt: "2026-08-21T18:40:00.000Z",
  finishedAt: "2026-08-21T18:44:00.000Z",
  verdict: "passed",
  attempt: 2,
  unexpectedCount: 0,
  flows: BLOCKED_VERIFY.flows.map((flow) =>
    flow.flow === "member-removal"
      ? {
          ...flow,
          deltas: flow.deltas.map((delta) =>
            delta.verdict === "UNEXPECTED_CHANGE"
              ? { ...delta, candidate: delta.baseline, verdict: "SAME" as const }
              : delta,
          ),
        }
      : flow,
  ),
  timeline: [
    ...BLOCKED_VERIFY.timeline,
    { at: "2026-08-21T18:40:00.000Z", label: "Claude Code repaired active-seat calculation", kind: "repair" },
    { at: "2026-08-21T18:42:00.000Z", label: "Kane re-verified the protected flows", kind: "verify" },
    { at: "2026-08-21T18:44:00.000Z", label: "Protected behavior matches the trusted baseline", kind: "proof" },
  ],
};

export const FIXTURE_BASELINE = {
  commit: "abc1234",
  createdAt: "2026-08-21T18:00:00.000Z",
  flows: {
    "member-removal": {
      test: ".testmuai/tests/remove-member_test.md",
      status: "passed" as const,
      state: { active_members: "4", billable_seats: "4", monthly_total: "$80.00" },
      runDir: "/tmp/kane/baseline/member-removal",
      shareUrl: "https://test-manager.lambdatest.com/share/baseline-removal",
      durationS: 41.2,
    },
  },
};

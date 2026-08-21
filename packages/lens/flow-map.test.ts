import { test } from "node:test";
import assert from "node:assert/strict";
import { mapFilesToFlows, matchesGlob } from "./flow-map.ts";

const FLOW_MAP = {
  "lib/seatline.ts": ["billing", "member-removal", "member-invite", "role-change"],
  "app/billing/**": ["billing"],
  "app/members/**": ["member-removal", "member-invite", "role-change"],
};

test("globs match the paths they claim and nothing else", () => {
  assert.ok(matchesGlob("app/billing/page.tsx", "app/billing/**"));
  assert.ok(matchesGlob("app/billing/deep/nested/file.tsx", "app/billing/**"));
  assert.ok(!matchesGlob("app/billingx/page.tsx", "app/billing/**"));
  assert.ok(matchesGlob("lib/seatline.ts", "lib/seatline.ts"));
  assert.ok(!matchesGlob("lib/seatline.test.ts", "lib/seatline.ts"));
});

test("a shared math module drags every dependent flow into the blast radius", () => {
  const { flows, unmapped } = mapFilesToFlows(["lib/seatline.ts"], FLOW_MAP);
  assert.deepEqual(flows, ["billing", "member-invite", "member-removal", "role-change"]);
  assert.deepEqual(unmapped, []);
});

test("flows from several changed files are unioned, not overwritten", () => {
  const { flows } = mapFilesToFlows(["app/billing/page.tsx", "app/members/page.tsx"], FLOW_MAP);
  assert.deepEqual(flows, ["billing", "member-invite", "member-removal", "role-change"]);
});

test("a file no glob claims is reported, never silently dropped", () => {
  const { flows, unmapped } = mapFilesToFlows(["README.md", "app/billing/page.tsx"], FLOW_MAP);
  assert.deepEqual(flows, ["billing"]);
  assert.deepEqual(unmapped, ["README.md"]);
});

test("editing LENS itself is not a behavior change and starts no browser", async () => {
  const { blastRadius } = await import("./verify.ts");
  const config = {
    ignore: ["packages/lens/**", ".lens/**", "docs/**"],
    fallbackFlow: "member-removal",
    flows: { "member-removal": {} },
  } as never;

  const radius = blastRadius(config, FLOW_MAP, [
    "packages/lens/verify.ts",
    ".lens/config.json",
    "docs/PRD.md",
  ]);
  assert.deepEqual(radius.flows, []);
  assert.deepEqual(radius.changed, []);
});

test("a changed file no glob claims still forces the fallback flow to run", async () => {
  const { blastRadius } = await import("./verify.ts");
  const config = {
    ignore: ["docs/**"],
    fallbackFlow: "member-removal",
    flows: { "member-removal": {} },
  } as never;

  const radius = blastRadius(config, FLOW_MAP, ["app/some-new-surface/page.tsx"]);
  assert.deepEqual(radius.unmapped, ["app/some-new-surface/page.tsx"]);
  assert.deepEqual(radius.flows, ["member-removal"], "an unmapped file is never a free pass");
});

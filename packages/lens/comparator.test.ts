import { test } from "node:test";
import assert from "node:assert/strict";
import { compareFlow, blockingDeltas, normalizeValue, semanticKeys } from "./comparator.ts";

test("an untouched observable reads SAME", () => {
  const deltas = compareFlow({ active_members: "4" }, { active_members: "4" }, ["active_members"]);
  assert.deepEqual(deltas[0].verdict, "SAME");
});

test("the demo regression surfaces as an unexpected change", () => {
  const baseline = { active_members: "4", billable_seats: "4", billing_cadence: "Monthly" };
  const candidate = { active_members: "4", billable_seats: "5", billing_cadence: "Monthly" };

  const deltas = compareFlow(baseline, candidate, Object.keys(baseline));
  const blocking = blockingDeltas(deltas);

  assert.equal(blocking.length, 1);
  assert.equal(blocking[0].key, "billable_seats");
  assert.equal(blocking[0].baseline, "4");
  assert.equal(blocking[0].candidate, "5");
});

test("an authorized observable may move without blocking", () => {
  const deltas = compareFlow({ discount: "$0.00" }, { discount: "$10.00" }, ["discount"], {
    expectedChanges: ["discount"],
  });
  assert.equal(deltas[0].verdict, "EXPECTED_CHANGE");
  assert.equal(blockingDeltas(deltas).length, 0);
});

test("an observable the candidate never saw is MISSING, not SAME", () => {
  const deltas = compareFlow({ billable_seats: "4" }, {}, ["billable_seats"]);
  assert.equal(deltas[0].verdict, "MISSING");
});

test("DOM whitespace noise is normalized, but digits still have to match", () => {
  assert.equal(normalizeValue("  $100.00 "), "$100.00");
  assert.equal(normalizeValue("$1,000.00"), "$1,000.00");
  assert.equal(compareFlow({ t: "$100.00" }, { t: " $100.00" }, ["t"])[0].verdict, "SAME");
  assert.equal(compareFlow({ t: "$100.00" }, { t: "$100.0" }, ["t"])[0].verdict, "UNEXPECTED_CHANGE");
});

test("run bookkeeping is excluded from the semantic view", () => {
  assert.deepEqual(semanticKeys({ url: "x", page_title: "y", billable_seats: "4" }), ["billable_seats"]);
});

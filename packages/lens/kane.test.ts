import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeTestmdRun, parseNdjson } from "./kane.ts";

/** A `testmd run` stream: one run_end per step, and the file's real verdict only in the summary. */
const TESTMD_STREAM = [
  `{"type":"run_end","status":"passed","final_state":{"url":"http://localhost:3000/demo/reset"},"run_dir":"/runs/0","credits_consumed":12.5}`,
  `{"type":"test_md_step_end","name":"Reset the workspace","status":"done"}`,
  `{"type":"run_end","status":"passed","context":{"memory":{"billable_seats":{"extracted_value":"5"}},"variables":{"active_members":{"value":"4","type":"memory"}}},"test_url":"https://test-manager.lambdatest.com/share/abc"}`,
  `{"type":"test_md_step_end","name":"Observe workspace state","status":"done"}`,
  `{"type":"test_md_summary","overall_status":"passed","duration_s":41.2,"steps":2,"retries":0}`,
  `{"type":"test_md_done"}`,
].join("\n");

test("non-JSON progress chatter is ignored, JSON events are kept", () => {
  const events = parseNdjson(`Running on: Desktop\n${TESTMD_STREAM}\nnot json`);
  assert.equal(events.length, 6);
});

test("the file verdict comes from test_md_summary, not the first run_end", () => {
  const failing = TESTMD_STREAM.replace(`"overall_status":"passed"`, `"overall_status":"failed"`);
  // Step one still says passed; only the summary knows the test as a whole failed.
  assert.equal(summarizeTestmdRun(failing, 1).status, "failed");
  assert.equal(summarizeTestmdRun(TESTMD_STREAM, 0).status, "passed");
});

test("observations are mined from final_state, context.variables and context.memory alike", () => {
  const run = summarizeTestmdRun(TESTMD_STREAM, 0);
  assert.equal(run.observed.billable_seats, "5");
  assert.equal(run.observed.active_members, "4");
  assert.equal(run.durationS, 41.2);
  assert.equal(run.shareUrl, "https://test-manager.lambdatest.com/share/abc");
  assert.equal(run.runDir, "/runs/0");
});

test("a failed step is named so the coding agent is told where it broke", () => {
  const stream = TESTMD_STREAM
    .replace(`{"type":"test_md_step_end","name":"Observe workspace state","status":"done"}`,
      `{"type":"test_md_step_end","name":"Observe workspace state","status":"failed","reason":"expected 4, saw 5"}`)
    .replace(`"overall_status":"passed"`, `"overall_status":"failed"`);
  const run = summarizeTestmdRun(stream, 1);
  assert.equal(run.status, "failed");
  assert.equal(run.failedStep, "Observe workspace state");
  assert.equal(run.reason, "expected 4, saw 5");
});

test("exit 2 and exit 3 are infrastructure errors, never a behavioral failure", () => {
  for (const [code, needle] of [[2, "infrastructure"], [3, "timed out"]] as const) {
    const run = summarizeTestmdRun(TESTMD_STREAM, code);
    assert.equal(run.status, "error");
    assert.ok(run.infraError?.includes(needle));
  }
});

test("an empty stream is an infrastructure error, not a silent pass", () => {
  const run = summarizeTestmdRun("", 0);
  assert.equal(run.status, "error");
  assert.ok(run.infraError?.includes("no NDJSON"));
});

test("missing credits stay null — a replay is not a zero-credit authoring run", () => {
  const replay = `{"type":"test_md_summary","overall_status":"passed","replay_decisions":6,"author_decisions":0}`;
  const run = summarizeTestmdRun(replay, 0);
  assert.equal(run.credits, null);
  assert.equal(run.replayed, true);
});

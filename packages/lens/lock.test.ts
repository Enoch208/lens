import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { paths } from "./config.ts";
import { acquireVerifyLock } from "./lock.ts";

const LOCK = join(paths.state, "verify.lock");

function clear() {
  rmSync(LOCK, { force: true });
}

test("a second verification is turned away while the first still holds the lock", () => {
  clear();
  const first = acquireVerifyLock("agent one");
  assert.equal(first.acquired, true);

  const second = acquireVerifyLock("agent two");
  assert.equal(second.acquired, false);
  if (!second.acquired) assert.match(second.heldBy, /agent one/);

  if (first.acquired) first.release();
  const third = acquireVerifyLock("agent three");
  assert.equal(third.acquired, true, "the lock is free once the holder releases it");
  if (third.acquired) third.release();
});

test("a lock left behind by a dead process is reclaimed, not obeyed forever", () => {
  clear();
  mkdirSync(paths.state, { recursive: true });
  // pid 2^22 is above every real pid on macOS and Linux, so it cannot be alive.
  writeFileSync(
    LOCK,
    JSON.stringify({ pid: 4194304, startedAt: new Date().toISOString(), holder: "crashed run" }),
    "utf8",
  );

  const result = acquireVerifyLock("recovering agent");
  assert.equal(result.acquired, true);
  assert.match(readFileSync(LOCK, "utf8"), /recovering agent/);
  if (result.acquired) result.release();
});

test("a corrupt timestamp reclaims the lock rather than wedging the gate shut", () => {
  clear();
  mkdirSync(paths.state, { recursive: true });
  writeFileSync(LOCK, JSON.stringify({ pid: process.pid, startedAt: "not a date", holder: "x" }), "utf8");

  const result = acquireVerifyLock("recovering agent");
  assert.equal(result.acquired, true);
  if (result.acquired) result.release();
});

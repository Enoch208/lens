import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { paths } from "./config.ts";

/**
 * One verification at a time.
 *
 * Kane drives a real browser against one shared application whose state every flow resets. Two
 * verifications at once would interleave those resets and record each other's numbers — and the
 * runs would still pass, just describing a workspace neither of them created. When more than one
 * agent is working in the same tree, that is not a hypothetical.
 */

const LOCK_PATH = join(paths.state, "verify.lock");

/** Long enough for the slowest legitimate run, short enough that a crash cannot wedge the gate. */
const STALE_AFTER_MS = 30 * 60 * 1000;

type Lock = { pid: number; startedAt: string; holder: string };

function readLock(): Lock | null {
  try {
    return JSON.parse(readFileSync(LOCK_PATH, "utf8")) as Lock;
  } catch {
    return null;
  }
}

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export type LockResult = { acquired: true; release: () => void } | { acquired: false; heldBy: string };

export function acquireVerifyLock(holder: string): LockResult {
  const existing = readLock();

  if (existing) {
    const age = Date.now() - new Date(existing.startedAt).getTime();
    const stale = !Number.isFinite(age) || age > STALE_AFTER_MS || !isAlive(existing.pid);
    if (!stale) {
      return { acquired: false, heldBy: `${existing.holder} (pid ${existing.pid}, since ${existing.startedAt})` };
    }
    // The previous holder died or overran. Reclaiming beats leaving the gate stuck shut.
  }

  try {
    mkdirSync(paths.state, { recursive: true });
    const lock: Lock = { pid: process.pid, startedAt: new Date().toISOString(), holder };
    writeFileSync(LOCK_PATH, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
  } catch {
    // If the lock cannot be written, run anyway — losing the lock must not lose the verification.
  }

  return {
    acquired: true,
    release: () => {
      try {
        unlinkSync(LOCK_PATH);
      } catch {
        // Already gone. Nothing to do.
      }
    },
  };
}

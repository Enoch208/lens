import type { FlowDelta, Observations } from "./types.ts";

/**
 * The semantic comparator. It answers one question per observable:
 *
 *   outside the behavior this change was allowed to touch, does the browser still see what the
 *   trusted build showed?
 *
 * It deliberately compares only *declared* observables. Kane reports plenty of incidental state —
 * URLs, page titles, session ids — and diffing all of it would drown a real regression in noise.
 */

/** State Kane reports that describes the run, not the product's behavior. */
export const VOLATILE_KEYS: ReadonlySet<string> = new Set([
  "url",
  "page_title",
  "session_id",
  "run_id",
  "timestamp",
  "evidence_url",
  "share_url",
]);

/**
 * Kane reads text out of a live DOM, so the same value can arrive with a non-breaking space or
 * ragged whitespace between runs. Normalizing those away is not leniency about values — the digits
 * and characters still have to match exactly.
 */
export function normalizeValue(value: string): string {
  return value.replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

export function valuesMatch(a: string, b: string): boolean {
  return normalizeValue(a) === normalizeValue(b);
}

export type CompareOptions = {
  /** Observables the change request explicitly authorized to move. */
  expectedChanges?: string[];
};

/**
 * Compare one flow's protected observables between the trusted baseline and the candidate build.
 *
 * A protected key the candidate never observed comes back as `MISSING`, not `SAME`. Silence is
 * not evidence of equivalence — if the browser could not see the value, LENS has nothing to
 * certify and says so.
 */
export function compareFlow(
  baseline: Observations,
  candidate: Observations,
  protect: string[],
  options: CompareOptions = {},
): FlowDelta[] {
  const expected = new Set(options.expectedChanges ?? []);

  return protect.map((key) => {
    const before = baseline[key] ?? null;
    const after = candidate[key] ?? null;

    if (after === null || before === null) {
      return { key, baseline: before, candidate: after, verdict: "MISSING" as const };
    }
    if (valuesMatch(before, after)) {
      return { key, baseline: before, candidate: after, verdict: "SAME" as const };
    }
    return {
      key,
      baseline: before,
      candidate: after,
      verdict: expected.has(key) ? ("EXPECTED_CHANGE" as const) : ("UNEXPECTED_CHANGE" as const),
    };
  });
}

/** Deltas that should stop the coding agent from declaring the work finished. */
export function blockingDeltas(deltas: FlowDelta[]): FlowDelta[] {
  return deltas.filter((delta) => delta.verdict === "UNEXPECTED_CHANGE");
}

/** Every observable Kane saw, minus run bookkeeping — powers the dashboard's full-state view. */
export function semanticKeys(observed: Observations): string[] {
  return Object.keys(observed)
    .filter((key) => !VOLATILE_KEYS.has(key))
    .sort();
}

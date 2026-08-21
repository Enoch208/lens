import type { LensConfig, VerifyReport } from "./types.ts";
import { blockingDeltas } from "./comparator.ts";

/**
 * The message the coding agent reads when LENS refuses to let it finish.
 *
 * It is written for a reader who has to act on it: which flow, which observable, what the trusted
 * build showed, what the browser just showed, and the Kane run that proves it. No praise, no
 * hedging, and an explicit statement that the requested change did not authorize this movement.
 */
export function formatBlockReason(report: VerifyReport, config: LensConfig): string {
  const lines: string[] = ["LENS BLOCKED COMPLETION", ""];

  const unexpected = report.flows.flatMap((flow) =>
    blockingDeltas(flow.deltas).map((delta) => ({ flow, delta })),
  );

  if (unexpected.length) {
    lines.push(
      unexpected.length === 1
        ? "1 unexpected behavioral change:"
        : `${unexpected.length} unexpected behavioral changes:`,
      "",
    );
    for (const { flow, delta } of unexpected) {
      const label = config.flows[flow.flow]?.label ?? flow.flow;
      lines.push(
        `  Flow         ${label} (${flow.flow})`,
        `  Observable   ${delta.key}`,
        `  Known-good   ${delta.baseline}`,
        `  Candidate    ${delta.candidate}`,
      );
      if (flow.shareUrl) lines.push(`  Kane run     ${flow.shareUrl}`);
      if (flow.runDir) lines.push(`  Evidence     ${flow.runDir}`);
      lines.push("");
    }
  }

  const broken = report.flows.filter(
    (flow) => flow.status === "failed" && blockingDeltas(flow.deltas).length === 0,
  );
  for (const flow of broken) {
    const label = config.flows[flow.flow]?.label ?? flow.flow;
    lines.push(
      `${label} no longer passes in a real browser.`,
      flow.failedStep ? `  Failed step  ${flow.failedStep}` : "",
      flow.reason ? `  Kane says    ${flow.reason}` : "",
      flow.shareUrl ? `  Kane run     ${flow.shareUrl}` : "",
      "",
    );
  }

  lines.push(
    `The requested change — "${report.changeRequest}" — does not authorize this behavior to move.`,
    "",
    "These values were read out of a real Chrome by Kane CLI, replaying the same committed",
    "browser contract that produced the trusted baseline. The feature you were asked to build",
    "may well work; something you were not asked to touch also moved.",
    "",
    "Fix the regression in the application code and end your turn again — LENS re-runs",
    "automatically. Do not edit the tests in .testmuai/ to make this pass, and do not commit",
    "before ending the turn: LENS verifies the uncommitted working tree.",
    "",
    `Attempt ${report.attempt} of ${report.maxAttempts}.`,
  );

  return lines.filter((line) => line !== "").join("\n").replace(/\n{3,}/g, "\n\n");
}

/** Terminal rendering of a verification, for `lens verify` run by a human. */
export function formatSummary(report: VerifyReport, config: LensConfig): string {
  const lines: string[] = [];
  const verdict =
    report.verdict === "passed"
      ? "VERIFIED — protected behavior is unchanged"
      : report.verdict === "blocked"
        ? `BLOCKED — ${report.unexpectedCount} unexpected behavioral change(s)`
        : "ERROR — LENS could not verify this build";

  lines.push("", verdict, "");
  lines.push(`  changed files   ${report.changedFiles.length}`);
  lines.push(`  flows replayed  ${report.affectedFlows.join(", ") || "none"}`);
  if (report.unmappedFiles.length) lines.push(`  unmapped files  ${report.unmappedFiles.join(", ")}`);
  if (report.skippedFlows.length) lines.push(`  SKIPPED         ${report.skippedFlows.join(", ")}`);
  lines.push("");

  for (const flow of report.flows) {
    const label = config.flows[flow.flow]?.label ?? flow.flow;
    lines.push(`  ${label}  [${flow.status}]${flow.infraError ? `  ${flow.infraError}` : ""}`);
    for (const delta of flow.deltas) {
      const mark =
        delta.verdict === "SAME"
          ? "SAME"
          : delta.verdict === "EXPECTED_CHANGE"
            ? "EXPECTED"
            : delta.verdict === "MISSING"
              ? "MISSING"
              : "UNEXPECTED";
      lines.push(`      ${delta.key.padEnd(20)} ${String(delta.baseline).padEnd(12)} → ${String(delta.candidate).padEnd(12)} ${mark}`);
    }
    if (flow.shareUrl) lines.push(`      kane evidence: ${flow.shareUrl}`);
  }

  lines.push("");
  return lines.join("\n");
}

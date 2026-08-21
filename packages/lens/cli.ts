#!/usr/bin/env node
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { LensConfig } from "./types.ts";
import { loadConfig, loadFlowMap, loadBaseline, makeLogger, paths, writeJson, PROJECT_ROOT } from "./config.ts";
import { runBaseline } from "./baseline.ts";
import { runVerify, requireAppUp, blastRadius } from "./verify.ts";
import { changedFiles } from "./flow-map.ts";
import { formatBlockReason, formatSummary } from "./report.ts";

/**
 * LENS command line.
 *
 *   lens baseline            record the trusted build's browser behavior
 *   lens verify              replay the affected flows and compare against it
 *   lens hook                Claude Code Stop hook — the gate itself
 *   lens status              what LENS currently believes
 */

function flagValue(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

function flagList(argv: string[], name: string): string[] | undefined {
  const value = flagValue(argv, name);
  return value ? value.split(",").map((entry) => entry.trim()).filter(Boolean) : undefined;
}

// ---------------------------------------------------------------------------------------------
// Stop-hook attempt budget
// ---------------------------------------------------------------------------------------------

type AttemptState = { attempts: number };

function attemptPath(sessionId: string): string {
  const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, "") || "unknown";
  return join(paths.state, `attempts-${safe}.json`);
}

function readAttempts(sessionId: string): number {
  try {
    const raw = JSON.parse(readFileSync(attemptPath(sessionId), "utf8")) as AttemptState;
    // A corrupt or hand-edited counter must not become Infinity and trap the agent forever.
    return Number.isFinite(raw?.attempts) && raw.attempts >= 0 ? Math.floor(raw.attempts) : 0;
  } catch {
    return 0;
  }
}

function writeAttempts(sessionId: string, attempts: number): void {
  try {
    mkdirSync(paths.state, { recursive: true });
    writeJson(attemptPath(sessionId), { attempts });
  } catch {
    // Losing the counter costs one extra attempt, never correctness.
  }
}

function clearAttempts(sessionId: string): void {
  writeAttempts(sessionId, 0);
}

// ---------------------------------------------------------------------------------------------
// Hook outcomes. Exit 2 with the reason on stderr is the only thing that stops the agent.
// ---------------------------------------------------------------------------------------------

function allow(systemMessage?: string): never {
  if (systemMessage) process.stdout.write(`${JSON.stringify({ systemMessage })}\n`);
  process.exit(0);
}

function block(reason: string): never {
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

type StopHookPayload = {
  session_id?: string;
  stop_hook_active?: boolean;
  transcript_path?: string;
};

/**
 * Read the most recent user request out of the session transcript so the block message can name
 * the change that was actually asked for. Best effort — a missing transcript is not a problem.
 */
function lastUserRequest(transcriptPath: string | undefined): string {
  if (!transcriptPath || !existsSync(transcriptPath)) return "the requested change";
  try {
    const lines = readFileSync(transcriptPath, "utf8").trim().split("\n");
    for (let index = lines.length - 1; index >= 0; index -= 1) {
      const entry = JSON.parse(lines[index]) as {
        type?: string;
        message?: { role?: string; content?: unknown };
      };
      if (entry.type !== "user" && entry.message?.role !== "user") continue;
      const content = entry.message?.content;
      const text =
        typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content
                .map((part) => (part && typeof part === "object" && "text" in part ? String(part.text) : ""))
                .join(" ")
            : "";
      const cleaned = text.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (cleaned && !cleaned.startsWith("[") && cleaned.length > 8) return cleaned.slice(0, 200);
    }
  } catch {
    // Fall through to the generic phrasing.
  }
  return "the requested change";
}

/**
 * The gate.
 *
 * Policy, in order, chosen so the hook can never trap the agent in a loop it cannot escape:
 *   - already re-entered            → allow (no infinite Stop loop)
 *   - nothing behavior-relevant     → allow instantly, without launching a browser
 *   - no trusted baseline           → allow with a warning; there is nothing to compare against
 *   - app down / Kane infra failure → allow with a warning; LENS could not tell, so it does not judge
 *   - attempt budget spent          → allow, escalate to a human
 *   - a real behavioral regression  → BLOCK
 *   - anything unexpected in here   → allow; a broken gate must not become a broken workflow
 */
async function commandHook(): Promise<never> {
  const log = makeLogger(true);
  let sessionId = "unknown";

  try {
    const raw = await readStdin();
    const payload = (raw ? JSON.parse(raw) : {}) as StopHookPayload;
    sessionId = payload.session_id ?? "unknown";

    if (payload.stop_hook_active) {
      log("hook: re-entered while already active — allowing to avoid a Stop loop");
      return allow();
    }

    const config = loadConfig();
    const flowMap = loadFlowMap();
    const changed = changedFiles(PROJECT_ROOT);
    const radius = blastRadius(config, flowMap, changed);

    log(`hook: session ${sessionId}, ${changed.length} changed file(s), ${radius.flows.length} affected flow(s)`);

    if (radius.flows.length === 0) {
      log("hook: no behavior-relevant changes — allowing without a browser run");
      clearAttempts(sessionId);
      return allow();
    }

    const baseline = loadBaseline();
    if (!baseline || Object.keys(baseline.flows).length === 0) {
      log("hook: no trusted baseline — allowing with a warning");
      return allow("LENS has no trusted baseline yet, so this change was not verified. Run `npm run lens -- baseline` on a known-good build.");
    }

    const attempts = readAttempts(sessionId);
    if (attempts >= config.maxAttempts) {
      log(`hook: attempt budget ${config.maxAttempts} spent — escalating to human review`);
      clearAttempts(sessionId);
      return allow(
        `LENS: HUMAN REVIEW REQUIRED. ${config.maxAttempts} repair attempts did not restore the protected behavior. See .lens/last-verify.json.`,
      );
    }

    if (!(await requireAppUp(config, log))) {
      return allow(`LENS could not verify this change: ${config.appUrl} is not reachable. Start the app and re-run \`npm run lens -- verify\`.`);
    }

    const report = await runVerify({
      config,
      baseline,
      flowMap,
      changeRequest: lastUserRequest(payload.transcript_path),
      agent: "Claude Code",
      attempt: attempts + 1,
      budgetS: config.hookBudgetS,
      log,
    });

    if (report.verdict === "blocked") {
      writeAttempts(sessionId, attempts + 1);
      log(`hook: BLOCKED — ${report.unexpectedCount} unexpected delta(s)`);
      return block(formatBlockReason(report, config));
    }

    clearAttempts(sessionId);

    if (report.verdict === "error") {
      const detail = report.flows.map((flow) => flow.infraError).filter(Boolean)[0] ?? "unknown";
      log(`hook: could not verify — ${detail}`);
      return allow(`LENS could not verify this change (${detail}). Protected behavior was NOT confirmed.`);
    }

    log(`hook: verified — ${report.affectedFlows.length} protected flow(s) unchanged`);
    return allow(
      `LENS verified ${report.affectedFlows.length} protected flow(s) in a real browser — no unexpected behavioral change.`,
    );
  } catch (error) {
    // A crash in the gate must never become a crash in the user's workflow.
    log(`hook: internal error — ${(error as Error).message}`);
    return allow();
  }
}

// ---------------------------------------------------------------------------------------------

async function commandBaseline(argv: string[]): Promise<number> {
  const log = makeLogger(false);
  const config = loadConfig();
  if (!(await requireAppUp(config, log))) return 2;
  await runBaseline({ config, flows: flagList(argv, "--flow"), log });
  return 0;
}

async function commandVerify(argv: string[]): Promise<number> {
  const log = makeLogger(false);
  const config = loadConfig();
  const baseline = loadBaseline();
  if (!baseline) {
    log("no baseline yet — run `npm run lens -- baseline` against a known-good build first");
    return 2;
  }
  if (!(await requireAppUp(config, log))) return 2;

  const report = await runVerify({
    config,
    baseline,
    flowMap: loadFlowMap(),
    changeRequest: flagValue(argv, "--request") ?? "the requested change",
    agent: flagValue(argv, "--agent-name") ?? "Claude Code",
    attempt: 1,
    budgetS: Number(flagValue(argv, "--budget") ?? config.hookBudgetS),
    flows: flagList(argv, "--flow"),
    log,
  });

  process.stdout.write(formatSummary(report, config));
  return report.verdict === "blocked" ? 1 : report.verdict === "error" ? 2 : 0;
}

function commandStatus(): number {
  const config: LensConfig = loadConfig();
  const baseline = loadBaseline();
  const changed = changedFiles(PROJECT_ROOT);
  const radius = blastRadius(config, loadFlowMap(), changed);

  process.stdout.write(
    [
      "",
      `  app                ${config.appUrl}`,
      `  trusted baseline   ${baseline ? `${Object.keys(baseline.flows).length} flow(s) @ ${baseline.commit}` : "none — run `lens baseline`"}`,
      `  changed files      ${changed.length} (${radius.changed.length} behavior-relevant)`,
      `  blast radius       ${radius.flows.join(", ") || "none"}`,
      `  unmapped files     ${radius.unmapped.join(", ") || "none"}`,
      "",
    ].join("\n"),
  );
  return 0;
}

const USAGE = `
LENS — AI changes one thing. LENS proves nothing else moved.

  lens baseline [--flow a,b]     record the trusted build's real browser behavior
  lens verify   [--flow a,b]     replay affected flows and compare against the baseline
                [--request "…"]  the change request, for the report
  lens hook                      Claude Code Stop hook (reads the hook payload on stdin)
  lens status                    what LENS currently believes about this working tree
`;

async function main(): Promise<void> {
  const [command, ...argv] = process.argv.slice(2);
  switch (command) {
    case "hook":
      await commandHook();
      return;
    case "baseline":
      process.exit(await commandBaseline(argv));
      break;
    case "verify":
      process.exit(await commandVerify(argv));
      break;
    case "status":
      process.exit(commandStatus());
      break;
    default:
      process.stdout.write(USAGE);
      process.exit(command ? 1 : 0);
  }
}

void main();

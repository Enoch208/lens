import { join } from "node:path";
import type { Baseline, BaselineFlow, LensConfig, Observations } from "./types.ts";
import { runTestmd } from "./kane.ts";
import { semanticKeys } from "./comparator.ts";
import { headCommit, isWorkingTreeClean } from "./flow-map.ts";
import { PROJECT_ROOT, paths, writeJson, loadBaseline } from "./config.ts";

/**
 * Record what the trusted build actually does in a real browser.
 *
 * Only a green run may become a baseline. A baseline that captured a failing flow would certify
 * broken behavior as correct forever after, so a single red flow aborts the whole thing.
 */

export type BaselineOptions = {
  config: LensConfig;
  flows?: string[];
  log: (message: string) => void;
};

function keepSemantic(observed: Observations): Observations {
  const state: Observations = {};
  for (const key of semanticKeys(observed)) state[key] = observed[key];
  return state;
}

export async function runBaseline(options: BaselineOptions): Promise<Baseline> {
  const { config, log } = options;
  const flowNames = options.flows?.length ? options.flows : Object.keys(config.flows);

  if (!isWorkingTreeClean(PROJECT_ROOT)) {
    log("warning: working tree is not clean — this baseline records uncommitted behavior");
  }

  // Re-baselining one flow must not discard the others already trusted.
  const flows: Record<string, BaselineFlow> = { ...(loadBaseline()?.flows ?? {}) };

  for (const name of flowNames) {
    const flow = config.flows[name];
    if (!flow) throw new Error(`unknown flow "${name}" — not in .lens/config.json`);

    log(`baseline: replaying ${name} (${flow.test})`);
    const run = await runTestmd(join(PROJECT_ROOT, flow.test), {
      cwd: PROJECT_ROOT,
      variablesFile: join(PROJECT_ROOT, config.variablesFile),
      timeoutS: config.perTestTimeoutS,
      logPath: join(paths.runs, `baseline-${name}.ndjson`),
      onLog: log,
    });

    if (run.infraError) {
      throw new Error(`baseline aborted: ${name} could not run — ${run.infraError}`);
    }
    if (run.status !== "passed") {
      throw new Error(
        `baseline aborted: ${name} is ${run.status}${run.failedStep ? ` at step "${run.failedStep}"` : ""}` +
          `${run.reason ? ` — ${run.reason}` : ""}. Only a green run can become trusted.`,
      );
    }

    const state = keepSemantic(run.observed);
    const protectedKeys = [...flow.protect, ...flow.observe];
    const unobserved = protectedKeys.filter((key) => !(key in state));
    if (unobserved.length) {
      throw new Error(
        `baseline aborted: ${name} passed but never observed ${unobserved.join(", ")}. ` +
          `The test's store-as steps are not producing those values — a compound step usually ` +
          `means the assertion was never evaluated. Fix the test before trusting this baseline.`,
      );
    }

    log(`baseline: ${name} passed — ${protectedKeys.map((key) => `${key}=${state[key]}`).join(", ")}`);

    flows[name] = {
      test: flow.test,
      status: run.status,
      state,
      runDir: run.runDir,
      shareUrl: run.shareUrl,
      durationS: run.durationS,
    };
  }

  const baseline: Baseline = {
    commit: headCommit(PROJECT_ROOT),
    createdAt: new Date().toISOString(),
    flows,
  };

  writeJson(paths.baseline, baseline);
  log(`baseline: wrote ${Object.keys(flows).length} trusted flow(s) to .lens/baseline.json`);
  return baseline;
}

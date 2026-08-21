import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Baseline, LensConfig, VerifyReport } from "./types.ts";
import type { FlowMap } from "./flow-map.ts";

export const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

export const paths = {
  config: join(PROJECT_ROOT, ".lens", "config.json"),
  flowMap: join(PROJECT_ROOT, ".lens", "flow-map.json"),
  baseline: join(PROJECT_ROOT, ".lens", "baseline.json"),
  lastVerify: join(PROJECT_ROOT, ".lens", "last-verify.json"),
  runs: join(PROJECT_ROOT, ".lens", "runs"),
  state: join(PROJECT_ROOT, ".lens", "state"),
  hookLog: join(PROJECT_ROOT, ".lens", "state", "hook.log"),
};

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

export function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function loadConfig(): LensConfig {
  const config = readJson<LensConfig>(paths.config);
  if (!config) throw new Error(`missing or malformed ${paths.config}`);
  return config;
}

export function loadFlowMap(): FlowMap {
  return readJson<FlowMap>(paths.flowMap) ?? {};
}

export function loadBaseline(): Baseline | null {
  return readJson<Baseline>(paths.baseline);
}

export function loadLastVerify(): VerifyReport | null {
  return readJson<VerifyReport>(paths.lastVerify);
}

/**
 * Progress goes to a file, never to stderr. In Stop-hook mode stderr is the channel the coding
 * agent reads its blocking feedback on, and one stray progress line in front of the reason turns
 * a precise regression report into noise.
 */
export function makeLogger(toFile: boolean): (message: string) => void {
  if (!toFile) return (message: string) => process.stdout.write(`${message}\n`);
  mkdirSync(paths.state, { recursive: true });
  return (message: string) => {
    try {
      const stamp = new Date().toISOString();
      writeFileSync(paths.hookLog, `${stamp} ${message}\n`, { encoding: "utf8", flag: "a" });
    } catch {
      // Logging must never be the reason a verification run dies.
    }
  };
}

/** Is the app Kane is meant to drive actually up? A dead dev server is infra, not a regression. */
export async function isAppReachable(appUrl: string, timeoutMs = 4000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(appUrl, { signal: controller.signal, redirect: "follow" });
    return response.ok || response.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

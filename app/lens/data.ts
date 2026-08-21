import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Baseline, LensConfig, VerifyReport } from "@/packages/lens/types.ts";

/**
 * The dashboard reads exactly what the engine wrote — no API, no duplicated logic. A missing or
 * half-written artifact renders an empty state; it never takes the page down mid-demo.
 */
function read<T>(...segments: string[]): T | null {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), ...segments), "utf8")) as T;
  } catch {
    return null;
  }
}

export function readBaseline(): Baseline | null {
  return read<Baseline>(".lens", "baseline.json");
}

export function readLastVerify(): VerifyReport | null {
  return read<VerifyReport>(".lens", "last-verify.json");
}

export function readConfig(): LensConfig | null {
  return read<LensConfig>(".lens", "config.json");
}

export function flowLabel(config: LensConfig | null, flow: string): string {
  return config?.flows?.[flow]?.label ?? flow;
}

export function flowRisk(config: LensConfig | null, flow: string): "HIGH" | "MED" | "LOW" {
  return config?.flows?.[flow]?.risk ?? "MED";
}

export function shortTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "--:--"
    : `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

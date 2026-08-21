import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Baseline, LensConfig, VerifyReport } from "@/packages/lens/types.ts";

const FLOW_META: Record<string, { label: string; risk: "HIGH" | "MED" | "LOW" }> = {
  billing: { label: "Billing", risk: "HIGH" },
  "member-removal": { label: "Member removal", risk: "HIGH" },
  "member-invite": { label: "Member invite", risk: "MED" },
  "role-change": { label: "Role changes", risk: "MED" },
};

function readJson(filename: string): unknown | null {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), ".lens", filename), "utf8"));
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readBaseline(): Baseline | null {
  const value = readJson("baseline.json");
  if (!isRecord(value) || !isRecord(value.flows)) return null;
  return value as unknown as Baseline;
}

export function readLastVerify(): VerifyReport | null {
  const value = readJson("last-verify.json");
  if (!isRecord(value)) return null;
  if (typeof value.verdict !== "string") return null;
  if (typeof value.changeRequest !== "string") return null;
  if (typeof value.agent !== "string") return null;
  if (typeof value.unexpectedCount !== "number") return null;
  if (!Array.isArray(value.flows) || !Array.isArray(value.affectedFlows) || !Array.isArray(value.timeline)) {
    return null;
  }
  return value as unknown as VerifyReport;
}

export function readConfig(): LensConfig | null {
  const value = readJson("config.json");
  if (!isRecord(value) || !isRecord(value.flows)) return null;
  return value as unknown as LensConfig;
}

export function readFlowMap(): Record<string, string[]> | null {
  const value = readJson("flow-map.json");
  if (!isRecord(value)) return null;
  return value as Record<string, string[]>;
}

export function flowLabel(config: LensConfig | null, flow: string): string {
  return config?.flows?.[flow]?.label ?? FLOW_META[flow]?.label ?? flow;
}

export function flowRisk(config: LensConfig | null, flow: string): "HIGH" | "MED" | "LOW" {
  return config?.flows?.[flow]?.risk ?? FLOW_META[flow]?.risk ?? "MED";
}

export function shortTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "--:--"
    : `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

import type { FlowDeltaVerdict, LensConfig, VerifyReport } from "@/packages/lens/types.ts";
import { flowLabel } from "./data.ts";

const VERDICT: Record<FlowDeltaVerdict, { label: string; className: string }> = {
  SAME: { label: "SAME", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  EXPECTED_CHANGE: { label: "EXPECTED", className: "border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2" },
  UNEXPECTED_CHANGE: { label: "UNEXPECTED", className: "border-red-500/30 bg-red-500/10 text-red-400" },
  MISSING: { label: "NOT OBSERVED", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
};

export default function DeltaTable({
  report,
  config,
}: {
  report: VerifyReport;
  config: LensConfig | null;
}) {
  const rows = report.flows.flatMap((flow) =>
    flow.deltas.map((delta) => ({ flow: flow.flow, ...delta })),
  );

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6 text-sm font-extralight text-zinc-600">
        No observables were compared — the affected flows did not produce a browser verdict.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#131315]">
      <table className="w-full min-w-[44rem] text-left">
        <thead>
          <tr className="border-b border-white/[0.06] text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
            <th className="px-6 py-4">Flow</th>
            <th className="px-6 py-4">Observable</th>
            <th className="px-6 py-4">Baseline</th>
            <th className="px-6 py-4">Candidate</th>
            <th className="px-6 py-4 text-right">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const verdict = VERDICT[row.verdict];
            const moved = row.verdict === "UNEXPECTED_CHANGE";
            return (
              <tr
                key={`${row.flow}-${row.key}-${index}`}
                className={`border-b border-white/[0.04] last:border-b-0 ${moved ? "bg-red-500/[0.04]" : ""}`}
              >
                <td className="px-6 py-4 text-sm font-medium text-zinc-300">
                  {flowLabel(config, row.flow)}
                </td>
                <td className="px-6 py-4 font-mono text-sm text-zinc-400">{row.key}</td>
                <td className="px-6 py-4 font-mono text-sm text-zinc-400">{row.baseline ?? "—"}</td>
                <td
                  className={`px-6 py-4 font-mono text-sm ${moved ? "font-medium text-red-400" : "text-zinc-400"}`}
                >
                  {row.candidate ?? "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-medium ${verdict.className}`}
                  >
                    {verdict.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

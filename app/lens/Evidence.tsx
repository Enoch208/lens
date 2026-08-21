import Glyph from "../components/Glyph";
import type { LensConfig, VerifyReport } from "@/packages/lens/types.ts";
import { flowLabel } from "./data.ts";

export default function Evidence({
  report,
  config,
}: {
  report: VerifyReport;
  config: LensConfig | null;
}) {
  const findings = report.flows.flatMap((flow) =>
    (flow.deltas ?? [])
      .filter((delta) => delta.verdict === "UNEXPECTED_CHANGE")
      .map((delta) => ({ flow, delta })),
  );

  if (findings.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {findings.map(({ flow, delta }, index) => (
        <div
          key={`${flow.flow}-${delta.key}-${index}`}
          className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.14)]"
        >
          <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                <Glyph icon="solar:camera-linear" className="text-lg" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white">Kane observation</h3>
                <p className="truncate text-[11px] font-extralight text-zinc-500">
                  {flowLabel(config, flow.flow)} · replayed in real Chrome
                </p>
              </div>
            </div>
            {flow.shareUrl ? (
              <a
                href={flow.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-[#0b0b0d] px-4 py-1.5 text-[11px] font-medium tracking-wide text-zinc-300 uppercase transition-colors hover:border-white/20 hover:text-white"
              >
                VIEW KANE EVIDENCE
                <Glyph icon="solar:arrow-right-up-linear" className="text-sm opacity-60" />
              </a>
            ) : null}
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-4">
            <div className="min-w-0 rounded-xl border border-white/[0.06] bg-[#0b0b0d] p-4">
              <div className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                Known-good state
              </div>
              <div className="mt-2 break-all font-mono text-sm text-zinc-300">
                {delta.key} = {delta.baseline ?? "—"}
              </div>
            </div>
            <div className="min-w-0 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
              <div className="text-[10px] font-medium tracking-widest text-red-400/70 uppercase">
                Observed now
              </div>
              <div className="mt-2 break-all font-mono text-sm font-medium text-red-400">
                {delta.key} = {delta.candidate ?? "—"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

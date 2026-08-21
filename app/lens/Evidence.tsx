import Glyph from "../components/Glyph";
import type { LensConfig, VerifyReport } from "@/packages/lens/types.ts";
import { flowLabel } from "./data.ts";

/**
 * Every unexpected delta, tied back to the Kane run that produced it. This card is the reason
 * LENS's findings are checkable rather than merely assertive.
 */
export default function Evidence({
  report,
  config,
}: {
  report: VerifyReport;
  config: LensConfig | null;
}) {
  const findings = report.flows.flatMap((flow) =>
    flow.deltas
      .filter((delta) => delta.verdict === "UNEXPECTED_CHANGE")
      .map((delta) => ({ flow, delta })),
  );

  if (findings.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {findings.map(({ flow, delta }, index) => (
        <div
          key={`${flow.flow}-${delta.key}-${index}`}
          className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.12)]"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                <Glyph icon="solar:camera-linear" className="text-lg" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">Kane observation</h3>
                <p className="text-[11px] font-extralight text-zinc-500">
                  {flowLabel(config, flow.flow)} · replayed in real Chrome
                </p>
              </div>
            </div>
            {flow.shareUrl && (
              <a
                href={flow.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0b0b0d] px-4 py-1.5 text-[11px] font-medium tracking-wide text-zinc-300 uppercase transition-colors hover:border-white/20 hover:text-white"
              >
                View Kane evidence
                <Glyph icon="solar:arrow-right-up-linear" className="text-sm opacity-60" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
              <div className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                Known-good state
              </div>
              <div className="mt-2 font-mono text-sm text-zinc-300">
                {delta.key} = {delta.baseline ?? "—"}
              </div>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
              <div className="text-[10px] font-medium tracking-widest text-red-400/70 uppercase">
                Observed now
              </div>
              <div className="mt-2 font-mono text-sm font-medium text-red-400">
                {delta.key} = {delta.candidate ?? "—"}
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed font-extralight text-zinc-500">
            The flow itself still passed — the browser did what a user would do and saw no error.
            The value above moved anyway, which is why an assertion suite alone would have shipped
            this.
          </p>
        </div>
      ))}
    </div>
  );
}

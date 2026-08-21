import Glyph from "../components/Glyph";
import { readBaseline, readConfig, readFlowMap, readLastVerify, flowLabel, flowRisk } from "./data.ts";
import Verdict from "./Verdict";
import DeltaTable from "./DeltaTable";
import Evidence from "./Evidence";
import Timeline from "./Timeline";

export const dynamic = "force-dynamic";

const RISK: Record<string, string> = {
  HIGH: "border-red-500/30 bg-red-500/10 text-red-400",
  MED: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  LOW: "border-white/10 bg-white/[0.04] text-zinc-400",
};

function Section({ eyebrow, icon, children }: { eyebrow: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-2 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
        <Glyph icon={icon} className="text-sm" />
        {eyebrow}
      </div>
      {children}
    </section>
  );
}

export default function LensPage() {
  const config = readConfig();
  const baseline = readBaseline();
  const report = readLastVerify();
  const flowMap = readFlowMap();
  const mappedFiles = flowMap ? Object.keys(flowMap).length : 0;

  return (
    <>
      <header className="flex min-w-0 items-start justify-between gap-6 border-b border-white/[0.06] px-8 py-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-light tracking-tight">LENS</h1>
          <p className="mt-1 text-sm font-extralight text-zinc-500">
            Behavioral verification for AI-written software
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-medium tracking-widest text-emerald-400/80 uppercase">
              KANE CLI
            </span>
            <span className="text-[11px] font-medium tracking-widest text-emerald-400 uppercase">
              CONNECTED
            </span>
          </span>
        </div>
      </header>

      {!report ? (
        <div className="flex min-w-0 flex-1 items-center justify-center p-8">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[#131315] p-12 text-center shadow-[inset_0_0_0_1px_rgba(124,92,255,0.14)]">
            <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2">
              <Glyph icon="solar:eye-scan-linear" className="text-2xl" />
            </span>
            <h2 className="text-xl font-light tracking-tight text-zinc-200">No verification yet</h2>
            <p className="mt-3 text-sm leading-relaxed font-extralight text-zinc-500">
              {baseline
                ? `Trusted baseline recorded at ${baseline.commit}. Change the application and end a turn — LENS replays the affected Kane flows automatically.`
                : "Record a trusted baseline, then let a coding agent change Seatline. LENS will compare what a real browser observes with what it recorded."}
            </p>
            {mappedFiles > 0 ? (
              <p className="mt-4 text-[11px] font-extralight text-zinc-600">
                {mappedFiles} implementation paths mapped to behavioral flows.
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-8 p-8">
          <div className="grid min-w-0 grid-cols-[1fr_22rem] gap-6">
            <div className="min-w-0 rounded-2xl border border-white/[0.06] bg-[#131315] p-7">
              <div className="mb-3 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                Change request
              </div>
              <p className="text-lg leading-relaxed font-light text-zinc-100">{report.changeRequest}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">Agent</dt>
                  <dd className="mt-1 text-sm text-zinc-200">{report.agent}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                    Changed files
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-200">{report.changedFiles?.length ?? 0}</dd>
                </div>
              </dl>
            </div>

            <Section eyebrow="Behavioral blast radius" icon="solar:radar-2-linear">
              <div className="flex flex-col gap-2">
                {(report.affectedFlows ?? []).map((flow) => {
                  const risk = flowRisk(config, flow);
                  return (
                    <div
                      key={flow}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#131315] px-4 py-3"
                    >
                      <span className="truncate text-sm font-medium text-zinc-300">
                        {flowLabel(config, flow)}
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider ${RISK[risk]}`}
                      >
                        {risk}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>

          <Verdict report={report} />

          <Section eyebrow="Semantic comparison" icon="solar:transfer-horizontal-linear">
            <DeltaTable report={report} config={config} />
          </Section>

          <div className="grid min-w-0 grid-cols-[1fr_22rem] items-start gap-8">
            <Section eyebrow="Evidence" icon="solar:gallery-linear">
              <Evidence report={report} config={config} />
              {report.unexpectedCount === 0 ? (
                <p className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6 text-sm font-extralight text-zinc-500">
                  No unexpected deltas. Every protected observable matched the trusted baseline.
                </p>
              ) : null}
            </Section>

            <Section eyebrow="Agent timeline" icon="solar:history-linear">
              <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
                <Timeline entries={report.timeline ?? []} />
              </div>
            </Section>
          </div>
        </div>
      )}
    </>
  );
}

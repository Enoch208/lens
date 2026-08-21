import Glyph from "../components/Glyph";
import PageHeader from "../components/PageHeader";
import { readBaseline, readConfig, readLastVerify, flowLabel, flowRisk } from "./data.ts";
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
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
        <Glyph icon={icon} className="text-sm" />
        {eyebrow}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-8 my-8 rounded-2xl border border-white/[0.06] bg-[#131315] p-12 text-center">
      <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-black/30 text-zinc-500">
        <Glyph icon="solar:eye-scan-linear" className="text-2xl" />
      </span>
      <h2 className="text-xl font-light tracking-tight text-zinc-200">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed font-extralight text-zinc-500">{body}</p>
    </div>
  );
}

export default function LensPage() {
  const config = readConfig();
  const baseline = readBaseline();
  const report = readLastVerify();

  const trustedFlows = baseline ? Object.keys(baseline.flows) : [];

  return (
    <>
      <PageHeader title="LENS" subtitle="Behavioral verification for AI-written software" />

      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-8 py-4">
        <p className="max-w-2xl text-sm leading-relaxed font-extralight text-zinc-500">
          Kane CLI replays committed browser contracts against this build and reports what a real
          Chrome observes. LENS compares those observations with the trusted baseline and blocks
          the coding agent when something moved that nobody authorized.
        </p>
        <span className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-medium tracking-widest text-emerald-400 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Kane CLI connected
        </span>
      </div>

      {!report ? (
        <EmptyState
          title="No verification yet"
          body={
            trustedFlows.length > 0
              ? `${trustedFlows.length} trusted flow(s) recorded at ${baseline?.commit}. Change the application and end a Claude Code turn — the Stop hook runs LENS automatically.`
              : "Run `npm run lens -- baseline` against a known-good build to record what Seatline is supposed to do, then let a coding agent change it."
          }
        />
      ) : (
        <div className="flex flex-col gap-8 p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#16161c] to-[#0d0d10] p-7">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                <Glyph icon="solar:chat-square-code-linear" className="text-sm" />
                Change request
              </div>
              <p className="text-lg leading-relaxed font-light text-zinc-100">{report.changeRequest}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  report.agent,
                  `${report.changedFiles.length} changed ${report.changedFiles.length === 1 ? "file" : "files"}`,
                  `attempt ${report.attempt} of ${report.maxAttempts}`,
                  ...(baseline ? [`baseline ${baseline.commit}`] : []),
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <Section eyebrow="Behavioral blast radius" icon="solar:radar-2-linear">
              <div className="flex flex-col gap-2">
                {report.affectedFlows.length === 0 && (
                  <p className="text-sm font-extralight text-zinc-600">
                    Nothing behavior-relevant changed.
                  </p>
                )}
                {report.affectedFlows.map((flow) => {
                  const risk = flowRisk(config, flow);
                  return (
                    <div
                      key={flow}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#131315] px-4 py-3"
                    >
                      <span className="text-sm font-medium text-zinc-300">
                        {flowLabel(config, flow)}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider ${RISK[risk]}`}
                      >
                        {risk}
                      </span>
                    </div>
                  );
                })}
                {report.skippedFlows.length > 0 && (
                  <p className="mt-1 text-[11px] font-extralight text-amber-400/80">
                    Skipped, not verified: {report.skippedFlows.join(", ")}
                  </p>
                )}
                {report.unmappedFiles.length > 0 && (
                  <p className="mt-1 text-[11px] font-extralight text-zinc-600">
                    {report.unmappedFiles.length} changed file(s) matched no flow map entry — the
                    fallback flow was replayed.
                  </p>
                )}
              </div>
            </Section>
          </div>

          <Verdict report={report} />

          <Section eyebrow="Semantic comparison" icon="solar:transfer-horizontal-linear">
            <DeltaTable report={report} config={config} />
          </Section>

          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[1fr_22rem]">
            <Section eyebrow="Evidence" icon="solar:gallery-linear">
              <Evidence report={report} config={config} />
              {report.unexpectedCount === 0 && (
                <p className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6 text-sm font-extralight text-zinc-500">
                  No unexpected deltas to evidence. Every protected observable matched the trusted
                  baseline recorded at {baseline?.commit ?? "the last green build"}.
                </p>
              )}
            </Section>

            <Section eyebrow="Agent timeline" icon="solar:history-linear">
              <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
                <Timeline entries={report.timeline} />
              </div>
            </Section>
          </div>
        </div>
      )}
    </>
  );
}

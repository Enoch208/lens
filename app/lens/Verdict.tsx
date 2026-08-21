import Glyph from "../components/Glyph";
import type { VerifyReport } from "@/packages/lens/types.ts";

/**
 * The centerpiece. It answers the only question that matters in one glance: did anything move
 * that nobody authorized?
 */
export default function Verdict({ report }: { report: VerifyReport }) {
  if (report.verdict === "blocked") {
    const count = report.unexpectedCount;
    return (
      <section className="rounded-2xl border border-red-500/25 bg-gradient-to-br from-[#1a1012] to-[#0d0d10] p-12 text-center shadow-[inset_0_0_0_1px_rgba(239,68,68,0.18)]">
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
          <Glyph icon="solar:shield-cross-linear" className="text-3xl" />
        </span>
        <h2 className="text-5xl leading-[1.05] font-light tracking-tighter text-red-400">
          {count} unexpected
          <br />
          behavioral {count === 1 ? "change" : "changes"}
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed font-extralight text-zinc-400">
          The requested feature may well work. Something nobody asked to touch moved as well, and
          a real browser measured it. {report.agent} was blocked from finishing.
        </p>
      </section>
    );
  }

  if (report.verdict === "error") {
    return (
      <section className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-[#191408] to-[#0d0d10] p-12 text-center">
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <Glyph icon="solar:question-circle-linear" className="text-3xl" />
        </span>
        <h2 className="text-4xl font-light tracking-tighter text-amber-400">Not verified</h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed font-extralight text-zinc-400">
          LENS could not get a verdict from the browser, so it did not give one. Unverified is not
          the same as safe.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#0b1714] to-[#0d0d10] p-12 text-center shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)]">
      <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        <Glyph icon="solar:shield-check-linear" className="text-3xl" />
      </span>
      <h2 className="text-5xl font-light tracking-tighter text-emerald-400">Safe to ship</h2>
      <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed font-extralight text-zinc-400">
        {report.affectedFlows.length} protected {report.affectedFlows.length === 1 ? "flow" : "flows"}{" "}
        replayed in a real browser. Every protected observable still matches the trusted build.
      </p>
    </section>
  );
}

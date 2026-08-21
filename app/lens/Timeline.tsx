import Glyph from "../components/Glyph";
import type { TimelineEntry, TimelineKind } from "@/packages/lens/types.ts";
import { shortTime } from "./data.ts";

const KIND: Record<TimelineKind, { icon: string; className: string }> = {
  change: { icon: "solar:pen-new-square-linear", className: "border-white/10 bg-white/[0.04] text-zinc-300" },
  impact: { icon: "solar:radar-2-linear", className: "border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2" },
  verify: { icon: "solar:eye-scan-linear", className: "border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2" },
  fail: { icon: "solar:shield-cross-linear", className: "border-red-500/30 bg-red-500/10 text-red-400" },
  repair: { icon: "solar:refresh-circle-linear", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  proof: { icon: "solar:shield-check-linear", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
};

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm font-extralight text-zinc-600">Nothing recorded yet.</p>;
  }

  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => {
        const kind = KIND[entry.kind] ?? KIND.change;
        const last = index === entries.length - 1;
        return (
          <li key={`${entry.at}-${index}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${kind.className}`}
              >
                <Glyph icon={kind.icon} className="text-sm" />
              </span>
              {!last && <span className="w-px flex-1 bg-white/[0.07]" />}
            </div>
            <div className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-5"}`}>
              <span className="font-mono text-[11px] text-zinc-600">{shortTime(entry.at)}</span>
              <p className="mt-0.5 text-sm font-light text-zinc-300">{entry.label}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

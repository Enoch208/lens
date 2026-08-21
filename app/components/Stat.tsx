import Glyph from "./Glyph";

type Tone = "neutral" | "accent" | "pass" | "fail";

const TONE: Record<Tone, { value: string; chip: string; ring: string }> = {
  neutral: { value: "text-white", chip: "border-white/10 bg-white/[0.04] text-zinc-300", ring: "" },
  accent: {
    value: "text-accent-2",
    chip: "border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2",
    ring: "shadow-[inset_0_0_0_1px_rgba(124,92,255,0.18)]",
  },
  pass: {
    value: "text-emerald-400",
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    ring: "shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)]",
  },
  fail: {
    value: "text-red-400",
    chip: "border-red-500/30 bg-red-500/10 text-red-400",
    ring: "shadow-[inset_0_0_0_1px_rgba(239,68,68,0.18)]",
  },
};

/**
 * One labelled observable. `observable` is the store-as key a Kane browser contract records for
 * this value — it is on the element holding the value so the mapping is greppable from the DOM.
 */
export default function Stat({
  icon,
  label,
  value,
  hint,
  observable,
  tone = "neutral",
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  observable?: string;
  tone?: Tone;
}) {
  const t = TONE[tone];
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-[#131315] p-6 transition-colors duration-200 hover:border-white/[0.12] ${t.ring}`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${t.chip}`}>
          <Glyph icon={icon} className="text-lg" />
        </span>
      </div>
      <div data-observable={observable} className={`text-5xl font-light tracking-tighter ${t.value}`}>
        {value}
      </div>
      {hint && <p className="mt-2 text-xs font-extralight text-zinc-500">{hint}</p>}
    </div>
  );
}

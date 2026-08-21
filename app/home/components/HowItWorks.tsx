import { Icon } from "@iconify/react";
import MaskedText from "./MaskedText";
import Reveal from "./Reveal";

const STEPS = [
  {
    icon: "solar:archive-check-linear",
    title: "Baseline",
    description:
      "On a known-good build, Kane replays the committed browser contracts and stores semantic observations. That file is the trusted behavior.",
  },
  {
    icon: "solar:pen-new-square-linear",
    title: "Change",
    description:
      "A coding agent edits the app. LENS reads git diff, maps changed files onto business flows, and decides what has to be replayed.",
  },
  {
    icon: "solar:play-circle-linear",
    title: "Verify",
    description:
      "Kane replays those flows in real Chrome. LENS compares each protected observable to the baseline: SAME, EXPECTED_CHANGE, or UNEXPECTED_CHANGE.",
  },
  {
    icon: "solar:shield-check-linear",
    title: "Block or ship",
    description:
      "An unexpected delta blocks the Stop hook and feeds Kane evidence back to the agent. Zero unexpected deltas — and only then — is SAFE TO SHIP.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative z-20 border-y border-line bg-surface px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Reveal className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium tracking-wide text-accent-2">
              <Icon icon="solar:routing-linear" />
              End-to-end flow
            </span>
          </Reveal>
          <MaskedText
            as="h2"
            text="Every stop runs through the browser."
            className="max-w-3xl justify-center text-3xl font-light tracking-tighter text-white md:text-5xl"
          />
          <Reveal as="p" delay={120} className="mt-6 max-w-xl text-lg leading-relaxed font-extralight text-zinc-400">
            The failure handling is the product. A real Chrome decides whether protected behavior
            still matches the trusted build — not the coding agent that just edited it.
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.title}
              delay={i * 90}
              className="group flex flex-col bg-surface p-8 transition-colors duration-300 hover:bg-surface-2"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-5xl font-extralight text-line-2 transition-colors group-hover:text-accent-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon icon={step.icon} className="text-3xl text-accent-2" />
              </div>
              <h3 className="mb-3 text-xl font-light tracking-tight text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed font-extralight text-zinc-400">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

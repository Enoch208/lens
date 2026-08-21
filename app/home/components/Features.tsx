import { Icon } from "@iconify/react";
import MaskedText from "./MaskedText";
import Reveal from "./Reveal";

const FEATURES = [
  {
    icon: "solar:monitor-camera-linear",
    title: "Kane is the truth engine",
    description:
      "A real Chrome replays committed browser contracts. LENS does not mock the browser, screenshot-diff the UI, or trust the coding agent to mark itself done.",
    badge: "Kane CLI",
  },
  {
    icon: "solar:database-linear",
    title: "Semantic observations",
    description:
      "Kane stores what the page actually showed — active members, billable seats, monthly total — not selectors or pixels. That is the state LENS compares.",
    badge: "store-as",
  },
  {
    icon: "solar:radar-2-linear",
    title: "Behavioral blast radius",
    description:
      "git diff is mapped onto business flows. A change in shared money math is not a billing-only change — neighboring flows get replayed too.",
    badge: "Flow map",
  },
  {
    icon: "solar:transfer-horizontal-linear",
    title: "Protected vs expected",
    description:
      "SAME stays green. EXPECTED_CHANGE is the feature you asked for. UNEXPECTED_CHANGE is everything else — and it blocks the agent.",
    badge: "Comparator",
  },
  {
    icon: "solar:stop-circle-linear",
    title: "Stop hook is the gate",
    description:
      "When Claude Code tries to finish, LENS runs. Red means the agent cannot stop. The Kane evidence is the message it has to act on.",
    badge: "Claude Code",
  },
  {
    icon: "solar:gallery-linear",
    title: "Evidence, not vibes",
    description:
      "Every unexpected delta links back to the Kane run that produced it. Flow, observable, known-good, candidate — checkable in a real browser.",
    badge: "Receipts",
  },
];

export default function Features() {
  return (
    <section id="safety" className="relative z-20 flex flex-col bg-black">
      <div className="flex w-full flex-col items-center border-b border-line px-6 pt-28 pb-20 text-center">
        <Reveal className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium tracking-wide text-accent-2">
            <Icon icon="solar:layers-minimalistic-linear" />
            The verification layer
          </span>
        </Reveal>
        <MaskedText
          as="h2"
          text="Resilience at every layer."
          className="max-w-2xl justify-center text-3xl font-light tracking-tighter text-white md:text-5xl"
        />
        <Reveal as="p" delay={120} className="mt-6 max-w-xl text-lg leading-relaxed font-extralight text-zinc-400">
          Six controls that turn a capable coding agent into one you can let finish — Kane for
          browser truth, LENS for everything you did not mean to change.
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-px bg-line md:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Reveal
            key={feature.title}
            delay={(i % 3) * 80}
            className="group flex flex-col bg-black p-10 transition-colors duration-300 hover:bg-surface"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center border border-line bg-surface text-accent-2 transition-colors duration-300 group-hover:border-accent/40">
              <Icon icon={feature.icon} className="text-4xl" />
            </div>
            <span className="mb-3 text-xs font-medium tracking-widest text-zinc-600 uppercase">
              {feature.badge}
            </span>
            <h3 className="mb-3 text-xl font-light tracking-tight text-white">{feature.title}</h3>
            <p className="text-sm leading-relaxed font-extralight text-zinc-400">{feature.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

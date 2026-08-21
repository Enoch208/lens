"use client";

import { useTransition } from "react";
import type { BillingCadence } from "@/lib/types.ts";
import { setCadence } from "@/lib/actions.ts";

const OPTIONS: { cadence: BillingCadence; label: string }[] = [
  { cadence: "monthly", label: "Monthly" },
  { cadence: "annual", label: "Annual — Save 10%" },
];

export default function CadenceToggle({ current }: { current: BillingCadence }) {
  const [, startTransition] = useTransition();

  return (
    <div className="inline-flex gap-1 rounded-full border border-white/[0.08] bg-[#0b0b0d] p-1">
      {OPTIONS.map((option) => {
        const active = option.cadence === current;
        return (
          <button
            key={option.cadence}
            type="button"
            aria-pressed={active}
            onClick={() => startTransition(async () => {
              await setCadence(option.cadence);
            })}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

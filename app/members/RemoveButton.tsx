"use client";

import { useTransition } from "react";
import { Icon } from "@iconify/react";
import { removeMember } from "@/lib/actions.ts";

/**
 * One click removes. No confirmation dialog, ever — a modal is an extra layer for a browser agent
 * to negotiate, and this is the single most replayed interaction in the whole suite.
 *
 * Note the real `disabled` attribute rather than `aria-disabled`: a locator click silently no-ops
 * on `aria-disabled`, which would make a broken run look like a passing one.
 */
export default function RemoveButton({ memberId, fullName }: { memberId: string; fullName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={`Remove ${fullName}`}
      disabled={pending}
      onClick={() => startTransition(async () => {
        await removeMember(memberId);
      })}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#0b0b0d] px-3.5 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
    >
      <Icon icon="solar:trash-bin-minimalistic-linear" className="text-sm" />
      Remove
    </button>
  );
}

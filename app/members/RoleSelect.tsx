"use client";

import { useTransition } from "react";
import type { Role } from "@/lib/types.ts";
import { changeRole } from "@/lib/actions.ts";

/**
 * A native select, deliberately. A custom dropdown means a popup layer, an animation and a
 * second click for any browser agent to get right — a select is one interaction that always works.
 */
export default function RoleSelect({
  memberId,
  fullName,
  role,
}: {
  memberId: string;
  fullName: string;
  role: Role;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label={`Role for ${fullName}`}
      defaultValue={role}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value as Role;
        startTransition(async () => {
          await changeRole(memberId, next);
        });
      }}
      className="rounded-full border border-white/[0.08] bg-[#0b0b0d] px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-white/20 focus:border-[#7c5cff]/50 focus:outline-none"
    >
      <option value="Admin">Admin</option>
      <option value="Member">Member</option>
    </select>
  );
}

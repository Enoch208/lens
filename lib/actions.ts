"use server";

import { revalidatePath } from "next/cache";
import type { BillingCadence, Role } from "./types.ts";
import { readWorkspace, writeWorkspace } from "./store.ts";

const DATA_PATHS = ["/", "/members", "/billing", "/lens"];

async function revalidateAll(): Promise<void> {
  for (const path of DATA_PATHS) revalidatePath(path);
}

/**
 * Removal is a soft delete. The record stays in the store with `status: "removed"` — Seatline
 * keeps workspace history — it just stops being an active member, and stops being billed.
 */
export async function removeMember(id: string): Promise<void> {
  const workspace = readWorkspace();
  const member = workspace.members.find((candidate) => candidate.id === id);
  if (member) member.status = "removed";
  writeWorkspace(workspace);
  await revalidateAll();
}

export async function inviteMember(fullName: string, email: string): Promise<void> {
  const name = fullName.trim();
  const address = email.trim();
  if (!name || !address) return;

  const workspace = readWorkspace();
  workspace.members.push({
    id: `m${workspace.members.length + 1}`,
    fullName: name,
    email: address,
    role: "Member",
    status: "active",
  });
  writeWorkspace(workspace);
  await revalidateAll();
}

export async function changeRole(id: string, role: Role): Promise<void> {
  const workspace = readWorkspace();
  const member = workspace.members.find((candidate) => candidate.id === id);
  if (member) member.role = role;
  writeWorkspace(workspace);
  await revalidateAll();
}

export async function setCadence(cadence: BillingCadence): Promise<void> {
  const workspace = readWorkspace();
  workspace.billingCadence = cadence;
  writeWorkspace(workspace);
  await revalidateAll();
}

import type { Workspace } from "./types.ts";

/** The one deterministic state every Kane flow starts from. `/demo/reset` restores exactly this. */
export function seedWorkspace(): Workspace {
  return {
    workspace: "Acme Studio",
    plan: "Pro",
    pricePerSeatCents: 2000,
    billingCadence: "monthly",
    members: [
      { id: "m1", fullName: "Maya Chen", email: "maya@acme.studio", role: "Admin", status: "active" },
      { id: "m2", fullName: "Daniel Okafor", email: "daniel@acme.studio", role: "Member", status: "active" },
      { id: "m3", fullName: "Sarah Lindqvist", email: "sarah@acme.studio", role: "Member", status: "active" },
      { id: "m4", fullName: "Victor Reyes", email: "victor@acme.studio", role: "Member", status: "active" },
      { id: "m5", fullName: "Jon Alvarez", email: "jon@acme.studio", role: "Member", status: "active" },
    ],
  };
}

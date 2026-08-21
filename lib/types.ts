export type Role = "Admin" | "Member";
export type MemberStatus = "active" | "removed";
export type BillingCadence = "monthly" | "annual";

export type Member = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: MemberStatus;
};

export type Workspace = {
  workspace: string;
  plan: string;
  pricePerSeatCents: number;
  billingCadence: BillingCadence;
  members: Member[];
};

export type WorkspaceView = {
  workspace: string;
  plan: string;
  pricePerSeatCents: number;
  billingCadence: BillingCadence;
  cadenceLabel: string;
  activeMembers: Member[];
  removedMembers: Member[];
  activeMemberCount: number;
  billableSeats: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
};

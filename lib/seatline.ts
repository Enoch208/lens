import type { Member, BillingCadence } from "./types.ts";

/**
 * Pure Seatline domain math. No I/O, no formatting — integer cents in, integer cents out.
 *
 * Everything the browser shows about money and seats is derived here, so a single edit in
 * this file moves every page at once. That is intentional: it is the blast radius LENS exists
 * to measure.
 */

/** Members who still count as part of the workspace. */
export function activeMembers(members: Member[]): Member[] {
  return members.filter((member) => member.status === "active");
}

/** Members removed from the workspace. Kept in the store, never billed. */
export function removedMembers(members: Member[]): Member[] {
  return members.filter((member) => member.status === "removed");
}

/** A seat is billed for each *active* member. Removed members are not billed. */
export function billableSeats(members: Member[]): number {
  return activeMembers(members).length;
}

export function subtotalCents(members: Member[], pricePerSeatCents: number): number {
  return billableSeats(members) * pricePerSeatCents;
}

/** Annual customers pay for ten months and get two free. */
const ANNUAL_DISCOUNT_RATE = 0.1;

/**
 * Annual customers receive 10% off the seats they are actually billed for. Monthly billing is
 * untouched — the discount is exactly zero on that cadence, as it was before.
 */
export function discountCents(
  members: Member[],
  pricePerSeatCents: number,
  cadence: BillingCadence,
): number {
  if (cadence !== "annual") return 0;
  return Math.round(subtotalCents(members, pricePerSeatCents) * ANNUAL_DISCOUNT_RATE);
}

export function totalCents(members: Member[], pricePerSeatCents: number, cadence: BillingCadence): number {
  return subtotalCents(members, pricePerSeatCents) - discountCents(members, pricePerSeatCents, cadence);
}

export function cadenceLabel(cadence: BillingCadence): string {
  return cadence === "annual" ? "Annual" : "Monthly";
}

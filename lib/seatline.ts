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

/**
 * Baseline Seatline has no annual pricing: the discount is always zero, on both cadences.
 * Implementing a real annual discount is the change the coding agent is asked to make.
 */
export function discountCents(_members: Member[], _pricePerSeatCents: number, _cadence: BillingCadence): number {
  return 0;
}

export function totalCents(members: Member[], pricePerSeatCents: number, cadence: BillingCadence): number {
  return subtotalCents(members, pricePerSeatCents) - discountCents(members, pricePerSeatCents, cadence);
}

export function cadenceLabel(cadence: BillingCadence): string {
  return cadence === "annual" ? "Annual" : "Monthly";
}

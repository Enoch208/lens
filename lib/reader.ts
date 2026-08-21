import type { WorkspaceView } from "./types.ts";
import { readWorkspace } from "./store.ts";
import {
  activeMembers,
  removedMembers,
  billableSeats,
  subtotalCents,
  discountCents,
  totalCents,
  cadenceLabel,
} from "./seatline.ts";

/**
 * The single read path for every page. `/`, `/members` and `/billing` all render from this one
 * object, which is why their numbers can never disagree with each other.
 */
export function getWorkspaceView(): WorkspaceView {
  const workspace = readWorkspace();
  const { members, pricePerSeatCents, billingCadence } = workspace;

  return {
    workspace: workspace.workspace,
    plan: workspace.plan,
    pricePerSeatCents,
    billingCadence,
    cadenceLabel: cadenceLabel(billingCadence),
    activeMembers: activeMembers(members),
    removedMembers: removedMembers(members),
    activeMemberCount: activeMembers(members).length,
    billableSeats: billableSeats(members),
    subtotalCents: subtotalCents(members, pricePerSeatCents),
    discountCents: discountCents(members, pricePerSeatCents, billingCadence),
    totalCents: totalCents(members, pricePerSeatCents, billingCadence),
  };
}

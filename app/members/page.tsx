import Glyph from "../components/Glyph";
import { getWorkspaceView } from "@/lib/reader.ts";
import { formatMoney } from "@/lib/money.ts";
import { inviteMemberAction } from "@/lib/actions.ts";
import PageHeader from "../components/PageHeader";
import Stat from "../components/Stat";
import RoleSelect from "./RoleSelect";
import RemoveButton from "./RemoveButton";

export const dynamic = "force-dynamic";

const FIELD =
  "w-full rounded-xl border border-white/[0.08] bg-[#0b0b0d] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#7c5cff]/50 focus:outline-none";

export default function MembersPage() {
  const view = getWorkspaceView();

  return (
    <>
      <PageHeader title="Members" subtitle={`${view.workspace} · ${view.plan} plan`} />

      <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="grid grid-cols-3 gap-6">
          <Stat
            icon="solar:users-group-rounded-linear"
            label="Active members"
            value={String(view.activeMemberCount)}
            hint="people with access to this workspace"
            observable="active_members"
          />
          <Stat
            icon="solar:armchair-2-linear"
            label="Billable seats"
            value={String(view.billableSeats)}
            hint="seats charged on the next invoice"
            observable="billable_seats"
            tone="accent"
          />
          <Stat
            icon="solar:wallet-money-linear"
            label="Monthly total"
            value={formatMoney(view.totalCents)}
            hint={`${view.billableSeats} × ${formatMoney(view.pricePerSeatCents)} per seat`}
            observable="monthly_total"
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_22rem]">
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131315]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {view.activeMembers.map((member) => (
                    <tr key={member.id} className="border-b border-white/[0.04] last:border-b-0">
                      <td className="px-6 py-4 text-sm font-medium text-white">{member.fullName}</td>
                      <td className="px-6 py-4 text-sm font-extralight text-zinc-500">{member.email}</td>
                      <td className="px-6 py-4">
                        <RoleSelect memberId={member.id} fullName={member.fullName} role={member.role} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <RemoveButton memberId={member.id} fullName={member.fullName} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/*
              Removed members stay in the store and stay on screen. Seeing the record persist is
              what makes "all members" versus "active members" a visible distinction rather than
              an invisible one — which is precisely the distinction billing can get wrong.
            */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                <Glyph icon="solar:user-cross-linear" className="text-sm" />
                Removed members
              </div>
              {view.removedMembers.length === 0 ? (
                <p className="text-sm font-extralight text-zinc-600">No removed members.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {view.removedMembers.map((member) => (
                    <li key={member.id} className="text-sm font-extralight text-zinc-500">
                      {member.fullName} · removed
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Always visible, never a modal — one less layer for a replayed run to negotiate. */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2">
                <Glyph icon="solar:user-plus-linear" className="text-lg" />
              </span>
              <h2 className="text-base font-medium text-white">Invite a teammate</h2>
            </div>

            <form action={inviteMemberAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="fullName" className="text-xs font-medium text-zinc-400">
                  Full name
                </label>
                <input id="fullName" name="fullName" required placeholder="Alex Morgan" className={FIELD} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-medium text-zinc-400">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="alex@acme.studio"
                  className={FIELD}
                />
              </div>
              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-100"
              >
                <Glyph icon="solar:plain-linear" className="text-base" />
                Send invite
              </button>
              <p className="text-[11px] font-extralight text-zinc-600">
                A new teammate joins as a Member and adds one billable seat.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

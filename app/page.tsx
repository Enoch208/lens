import { getWorkspaceView } from "@/lib/reader.ts";
import { formatMoney } from "@/lib/money.ts";
import PageHeader from "./components/PageHeader";
import Stat from "./components/Stat";
import Glyph from "./components/Glyph";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const view = getWorkspaceView();

  return (
    <>
      <PageHeader title="Overview" subtitle={`${view.workspace} · ${view.plan} plan`} />

      <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="grid grid-cols-4 gap-6">
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
            icon="solar:crown-line-linear"
            label="Plan"
            value={view.plan}
            hint={`${formatMoney(view.pricePerSeatCents)} per active seat`}
            observable="plan"
          />
          <Stat
            icon="solar:calendar-linear"
            label="Billing cadence"
            value={view.cadenceLabel}
            hint="how often Acme Studio is charged"
            observable="billing_cadence"
          />
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-8">
          <div className="mb-6 flex items-center gap-2 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
            <Glyph icon="solar:bill-list-linear" className="text-sm" />
            This month
          </div>

          <dl className="flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.05] py-4">
              <dt className="text-sm font-medium text-zinc-400">Monthly subtotal</dt>
              <dd
                data-observable="monthly_subtotal"
                className="font-mono text-lg font-light tracking-tight text-white"
              >
                {formatMoney(view.subtotalCents)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.05] py-4">
              <dt className="text-sm font-medium text-zinc-400">Discount</dt>
              <dd
                data-observable="discount"
                className={`font-mono text-lg font-light tracking-tight ${
                  view.discountCents > 0 ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {view.discountCents > 0 ? `-${formatMoney(view.discountCents)}` : formatMoney(0)}
              </dd>
            </div>
            <div className="flex items-center justify-between pt-5">
              <dt className="text-base font-medium text-white">Monthly total</dt>
              <dd
                data-observable="monthly_total"
                className="font-mono text-3xl font-light tracking-tighter text-accent-2"
              >
                {formatMoney(view.totalCents)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}

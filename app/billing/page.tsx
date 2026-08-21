import { getWorkspaceView } from "@/lib/reader.ts";
import { formatMoney } from "@/lib/money.ts";
import PageHeader from "../components/PageHeader";
import Glyph from "../components/Glyph";
import Stat from "../components/Stat";
import CadenceToggle from "./CadenceToggle";

export const dynamic = "force-dynamic";

export default function BillingPage() {
  const view = getWorkspaceView();

  return (
    <>
      <PageHeader title="Billing" subtitle={`${view.workspace} · ${view.plan} plan`} />

      <div className="flex min-w-0 flex-1 flex-col gap-6 p-8">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2">
              <Glyph icon="solar:card-linear" className="text-2xl" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-medium text-white">Billing cadence</h2>
              <p data-observable="billing_cadence" className="mt-1 text-sm font-extralight text-zinc-400">
                {view.cadenceLabel}
              </p>
            </div>
          </div>
          <CadenceToggle current={view.billingCadence} />
        </div>

        <div className="grid min-w-0 grid-cols-3 gap-6">
          <Stat
            icon="solar:medal-ribbons-star-linear"
            label="Plan"
            value={view.plan}
            hint="workspace plan"
            observable="plan"
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
            icon="solar:tag-price-linear"
            label="Price per seat"
            value={formatMoney(view.pricePerSeatCents)}
            hint="per active seat, per month"
            observable="price_per_seat"
          />
        </div>

        <div className="grid min-w-0 grid-cols-3 gap-6">
          <Stat
            icon="solar:calculator-linear"
            label="Subtotal"
            value={formatMoney(view.subtotalCents)}
            hint={`${view.billableSeats} × ${formatMoney(view.pricePerSeatCents)} per seat`}
            observable="monthly_subtotal"
          />
          <Stat
            icon="solar:sale-linear"
            label="Annual discount"
            value={formatMoney(view.discountCents)}
            hint="applied when billed annually"
            observable="discount"
          />
          <Stat
            icon="solar:wallet-money-linear"
            label="Total"
            value={formatMoney(view.totalCents)}
            hint="amount due on the next invoice"
            observable="monthly_total"
            tone="accent"
          />
        </div>
      </div>
    </>
  );
}

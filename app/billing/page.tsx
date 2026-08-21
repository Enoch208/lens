import { getWorkspaceView } from "@/lib/reader.ts";
import { formatMoney } from "@/lib/money.ts";
import PageHeader from "../components/PageHeader";
import Glyph from "../components/Glyph";
import CadenceToggle from "./CadenceToggle";

export const dynamic = "force-dynamic";

function Line({
  label,
  value,
  observable,
  tone = "default",
}: {
  label: string;
  value: string;
  observable: string;
  tone?: "default" | "muted" | "credit";
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] py-4 last:border-b-0">
      <dt className="text-sm font-medium text-zinc-400">{label}</dt>
      <dd
        data-observable={observable}
        className={`font-mono text-lg font-light tracking-tight ${
          tone === "credit" ? "text-emerald-400" : tone === "muted" ? "text-zinc-500" : "text-white"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function BillingPage() {
  const view = getWorkspaceView();

  return (
    <>
      <PageHeader title="Billing" subtitle={`${view.workspace} · billed ${view.cadenceLabel.toLowerCase()}`} />

      <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2">
              <Glyph icon="solar:card-linear" className="text-2xl" />
            </span>
            <div>
              <h2 className="text-base font-medium text-white">Billing cadence</h2>
              <p className="mt-1 text-sm font-extralight text-zinc-500">
                Switch how often {view.workspace} is charged for its seats.
              </p>
            </div>
          </div>
          <CadenceToggle current={view.billingCadence} />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_20rem]">
          <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-8">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
              <Glyph icon="solar:bill-list-linear" className="text-sm" />
              Breakdown
            </div>

            <dl className="flex flex-col">
              <Line label="Plan" value={view.plan} observable="plan" />
              <Line label="Billable seats" value={String(view.billableSeats)} observable="billable_seats" />
              <Line
                label="Price per seat"
                value={formatMoney(view.pricePerSeatCents)}
                observable="price_per_seat"
              />
              <Line
                label="Subtotal"
                value={formatMoney(view.subtotalCents)}
                observable="monthly_subtotal"
              />
              <Line
                label="Annual discount"
                value={view.discountCents > 0 ? `-${formatMoney(view.discountCents)}` : formatMoney(0)}
                observable="annual_discount"
                tone={view.discountCents > 0 ? "credit" : "muted"}
              />
            </dl>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-5">
              <span className="text-base font-medium text-white">Total</span>
              <span
                data-observable="billing_total"
                className="font-mono text-4xl font-light tracking-tighter text-accent-2"
              >
                {formatMoney(view.totalCents)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
              <Glyph icon="solar:calculator-minimalistic-linear" className="text-sm" />
              How this is calculated
            </div>
            <p className="text-sm leading-relaxed font-extralight text-zinc-400">
              Every <span className="text-zinc-200">active</span> member holds one billable seat at{" "}
              <span className="text-zinc-200">{formatMoney(view.pricePerSeatCents)}</span> per month.
              Removed members keep their history in the workspace and stop being billed the moment
              they are removed.
            </p>
            <p className="mt-4 text-sm leading-relaxed font-extralight text-zinc-400">
              {view.activeMemberCount} active {view.activeMemberCount === 1 ? "member" : "members"} ·{" "}
              {view.billableSeats} billable {view.billableSeats === 1 ? "seat" : "seats"} ·{" "}
              {formatMoney(view.subtotalCents)} before discount.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

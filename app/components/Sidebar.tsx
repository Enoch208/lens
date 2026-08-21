"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

/**
 * Nav labels are always real DOM text — no icon-only rail, no collapse, no localStorage gate.
 * A browser agent has to be able to read where it is and where it can go.
 */
const NAV = [
  { label: "Overview", icon: "solar:widget-4-linear", href: "/overview" },
  { label: "Members", icon: "solar:users-group-rounded-linear", href: "/members" },
  { label: "Billing", icon: "solar:card-linear", href: "/billing" },
  { label: "LENS", icon: "solar:shield-check-linear", href: "/lens" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col self-start border-r border-white/[0.06] bg-[#0b0b0d] px-4 py-6 lg:sticky lg:top-0 lg:h-screen">
      <Link href="/overview" className="flex items-center gap-2.5 px-2 pb-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2">
          <Icon icon="solar:eye-scan-linear" className="text-lg" />
        </span>
        <span className="text-base font-semibold tracking-tight">Seatline</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/[0.07] text-white"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
              }`}
            >
              <Icon icon={item.icon} className="text-lg" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-white/[0.06] bg-[#131315] p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-accent-2">
          <Icon icon="solar:buildings-2-linear" />
          Acme Studio
        </div>
        <p className="text-[11px] leading-relaxed font-extralight text-zinc-500">
          Pro plan · $20.00 per active seat, per month.
        </p>
      </div>
    </aside>
  );
}

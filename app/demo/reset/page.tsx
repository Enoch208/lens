import Link from "next/link";
import Glyph from "@/app/components/Glyph";
import { resetWorkspace } from "@/lib/store.ts";
import { formatMoney } from "@/lib/money.ts";

export const dynamic = "force-dynamic";

/**
 * A deliberately side-effecting GET page.
 *
 * Every Kane browser contract starts here, because a browser agent has to be able to reach a
 * byte-identical starting state with one URL navigation and zero clicks. No button, no
 * confirmation, no dialog — anything clickable here is one more thing that can flake on replay.
 */
export default function DemoResetPage() {
  const workspace = resetWorkspace();
  const active = workspace.members.filter((member) => member.status === "active").length;

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#131315] p-8 text-center shadow-[inset_0_0_0_1px_rgba(124,92,255,0.14)]">
        <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 text-accent-2">
          <Glyph icon="solar:restart-linear" className="text-2xl" />
        </span>
        <h1 className="text-2xl font-light tracking-tight">Workspace reset</h1>
        <p className="mt-2 text-sm font-extralight text-zinc-400">
          {workspace.workspace} · {active} active members ·{" "}
          {formatMoney(active * workspace.pricePerSeatCents)} per month
        </p>
        <Link
          href="/overview"
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0b0b0d] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
        >
          <Glyph icon="solar:arrow-left-linear" className="text-base" />
          Back to overview
        </Link>
      </div>
    </main>
  );
}

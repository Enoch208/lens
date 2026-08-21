"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

/** Routes that are the product's own marketing surface rather than the workspace. */
const CHROMELESS = new Set(["/"]);

/**
 * The landing page is full-bleed; every workspace route carries the persistent nav. Deciding it
 * here keeps the root layout one tree, so the sidebar never appears or disappears mid-navigation
 * inside the workspace — which is the kind of thing a replayed browser test trips over.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (CHROMELESS.has(pathname)) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

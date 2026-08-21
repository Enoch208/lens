"use client";

import { Icon } from "@iconify/react";

/**
 * The single client boundary for iconography. Iconify's `Icon` uses hooks, so wrapping it once
 * here keeps every page and card a Server Component — `"use client"` stays at the leaf.
 */
export default function Glyph({ icon, className }: { icon: string; className?: string }) {
  return <Icon icon={icon} className={className} />;
}

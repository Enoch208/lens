"use client";

import { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../lib/usePrefersReducedMotion.ts";

export default function MaskedText({
  text,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "div" | "h1" | "h2" | "p";
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  const visible = shown || reduced;

  return (
    <Tag ref={ref as never} className={`flex flex-wrap gap-x-[0.25em] gap-y-[0.1em] ${className}`}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="inline-flex overflow-hidden">
          <span
            className="inline-block origin-bottom-left pb-1 will-change-transform"
            style={{
              transform: visible ? "translateY(0%)" : "translateY(120%)",
              transition: `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * 0.05}s`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}

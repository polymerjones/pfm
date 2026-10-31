"use client";

import Link from "next/link";
import { Heart, House } from "lucide-react";

/**
 * The fixed header, styled as a wordmark rather than a toolbar: "GAMES BY / POLYMER JONES" in the
 * byline's face (system sans, semibold, tracked 0.3em), bare glyphs, and a soft fade behind it
 * for legibility over scrolling content. Colors follow the hub's live theme variables.
 */
export default function Header({ onSupport }: { onSupport?: () => void }) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-5 pb-4 pt-[max(12px,env(safe-area-inset-top))]"
      style={{ background: "linear-gradient(180deg, var(--bg0) 0%, color-mix(in srgb, var(--bg0) 70%, transparent) 60%, transparent 100%)" }}
    >
      <div className="min-w-0 flex-1" role="heading" aria-level={1} aria-label="Games by Polymer Jones">
        <div className="text-[11px] font-semibold tracking-[0.3em]" style={{ color: "var(--accent)" }}>
          GAMES BY
        </div>
        <div
          className="truncate text-[21px] font-semibold tracking-[0.3em]"
          style={{ color: "var(--text)", textShadow: "0 0 10px var(--glow-soft)" }}
        >
          POLYMER JONES
        </div>
      </div>
      {onSupport && (
        <button type="button" onClick={onSupport} aria-label="Support Polymer Jones" className="p-1 opacity-85 hover:opacity-100">
          <Heart size={24} style={{ color: "var(--text)" }} />
        </button>
      )}
      {/* Where a settings gear usually sits: back to the site's home page. */}
      <Link href="/" aria-label="Paul Fisher Media home" className="p-1 opacity-85 transition-opacity hover:opacity-100">
        <House size={25} style={{ color: "var(--text)" }} />
      </Link>
    </header>
  );
}

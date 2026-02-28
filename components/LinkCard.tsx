"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type LinkCardProps = {
  label: string;
  href?: string;
  icon: LucideIcon;
  iconUrl?: string;
  kind: "external" | "contact";
  onContact: () => void;
  variants: Variants;
  ariaLabel: string;
};

const baseClasses =
  "group relative inline-flex min-h-12 w-auto min-w-[220px] max-w-[300px] items-center gap-3 overflow-hidden rounded-[8px] border border-white/20 bg-[#121212] px-3 py-2 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-white before:opacity-0 before:transition before:duration-200";

export default function LinkCard({
  label,
  href,
  icon: Icon,
  iconUrl,
  kind,
  onContact,
  variants,
  ariaLabel
}: LinkCardProps) {
  const reducedMotion = useReducedMotion();

  const iconBadge = (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-white/20 bg-white/[0.02] transition group-hover:border-white/50">
      {iconUrl ? (
        <img
          src={iconUrl}
          alt=""
          className="h-5 w-5 rounded-sm grayscale contrast-125"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <Icon className="h-4 w-4 text-white/90" aria-hidden="true" />
      )}
    </span>
  );

  if (kind === "contact") {
    return (
      <motion.button
        type="button"
        variants={variants}
      whileHover={reducedMotion ? {} : { x: 4 }}
      whileTap={reducedMotion ? {} : { scale: 0.995 }}
      onClick={onContact}
      className={`${baseClasses} hover:border-white/45 hover:before:opacity-100`}
      aria-label={ariaLabel}
    >
      {iconBadge}
      <span className="pr-1 text-left text-base uppercase tracking-[0.05em]">{label}</span>
      </motion.button>
    );
  }

  return (
    <motion.a
      variants={variants}
      whileHover={reducedMotion ? {} : { x: 4 }}
      whileTap={reducedMotion ? {} : { scale: 0.995 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} hover:border-white/45 hover:before:opacity-100`}
      aria-label={ariaLabel}
    >
      {iconBadge}
      <span className="pr-1 text-left text-base uppercase tracking-[0.05em]">{label}</span>
    </motion.a>
  );
}

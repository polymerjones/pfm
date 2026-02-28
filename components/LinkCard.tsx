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
  "group relative flex min-h-12 w-full max-w-[520px] items-center gap-3 overflow-hidden rounded-[10px] rounded-br-[2px] rounded-tr-[2px] border border-white/20 bg-gradient-to-r from-[#111111] via-[#151515] to-[#121212] px-3 py-2 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.45)] transition active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-white before:opacity-0 before:transition before:duration-200 after:pointer-events-none after:absolute after:-right-12 after:top-0 after:h-full after:w-1/2 after:rotate-[18deg] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)] after:opacity-50";

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
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border border-white/25 bg-white/[0.03] transition group-hover:border-white/55">
      {iconUrl ? (
        <img
          src={iconUrl}
          alt=""
          className="h-6 w-6 rounded-sm grayscale contrast-125"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <Icon className="h-5 w-5 text-white/90" aria-hidden="true" />
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
        <span className="flex-1 text-left text-lg uppercase tracking-[0.06em]">{label}</span>
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
      <span className="flex-1 text-left text-lg uppercase tracking-[0.06em]">{label}</span>
    </motion.a>
  );
}

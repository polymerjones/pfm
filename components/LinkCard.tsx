"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type LinkCardProps = {
  label: string;
  href?: string;
  icon: LucideIcon;
  kind: "external" | "contact";
  onContact: () => void;
  variants: Variants;
  ariaLabel: string;
};

const baseClasses =
  "group relative flex min-h-12 w-full max-w-[420px] items-center justify-center gap-2 rounded-xl border border-cyan-300/35 bg-gradient-to-r from-white/10 via-white/5 to-white/10 px-5 py-3 text-[15px] font-semibold text-ink shadow-[0_0_0_1px_rgba(76,201,240,0.22),0_10px_28px_rgba(2,8,23,0.45)] transition hover:-translate-y-0.5 hover:border-cyan-200/75 hover:shadow-[0_0_0_1px_rgba(125,211,252,0.55),0_14px_32px_rgba(14,165,233,0.22)] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80";

export default function LinkCard({
  label,
  href,
  icon: Icon,
  kind,
  onContact,
  variants,
  ariaLabel
}: LinkCardProps) {
  const reducedMotion = useReducedMotion();

  if (kind === "contact") {
    return (
      <motion.button
        type="button"
        variants={variants}
        whileHover={reducedMotion ? {} : { scale: 1.01 }}
        whileTap={reducedMotion ? {} : { scale: 0.995 }}
        onClick={onContact}
        className={baseClasses}
        aria-label={ariaLabel}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </motion.button>
    );
  }

  return (
    <motion.a
      variants={variants}
      whileHover={reducedMotion ? {} : { scale: 1.01 }}
      whileTap={reducedMotion ? {} : { scale: 0.995 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClasses}
      aria-label={ariaLabel}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </motion.a>
  );
}

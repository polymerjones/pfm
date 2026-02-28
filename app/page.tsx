"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Mail, Orbit, Sparkles, Youtube } from "lucide-react";
import VideoLogo from "@/components/VideoLogo";
import LinkCard from "@/components/LinkCard";
import ContactModal from "@/components/ContactModal";

const LINKS = [
  {
    label: "Poly Oracle",
    href: "https://polyoracle.app",
    icon: Orbit,
    kind: "external" as const,
    ariaLabel: "Open Poly Oracle"
  },
  {
    label: "Poly Play",
    href: "https://polyplay.app",
    icon: Sparkles,
    kind: "external" as const,
    ariaLabel: "Open Poly Play"
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/paulfishermedia",
    icon: Youtube,
    kind: "external" as const,
    ariaLabel: "Open Paul Fisher Media YouTube"
  },
  {
    label: "Contact",
    icon: Mail,
    kind: "contact" as const,
    ariaLabel: "Open contact form"
  }
] as const;

export default function HomePage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const parentVariants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.12,
          delayChildren: reduceMotion ? 0 : 0.15
        }
      }
    }),
    [reduceMotion]
  );

  const itemVariants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.98 },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: reduceMotion ? 0.01 : 0.45,
          ease: [0.16, 1, 0.3, 1]
        }
      }
    }),
    [reduceMotion]
  );

  return (
    <main className="relative min-h-screen overflow-x-clip px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 sm:gap-10">
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          className="w-full"
        >
          <VideoLogo src="/logo.mp4" />
        </motion.div>

        <motion.section
          variants={parentVariants}
          initial="hidden"
          animate="show"
          className="w-full"
          aria-label="Paul Fisher Media links"
        >
          <div className="flex w-full flex-col items-center gap-3">
            {LINKS.map((link) => (
              <LinkCard
                key={link.label}
                label={link.label}
                icon={link.icon}
                href={link.kind === "external" ? link.href : undefined}
                kind={link.kind}
                onContact={() => setIsContactOpen(true)}
                variants={itemVariants}
                ariaLabel={link.ariaLabel}
              />
            ))}
          </div>
        </motion.section>
      </div>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </main>
  );
}

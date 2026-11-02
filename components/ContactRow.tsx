"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";

// The form (and framer-motion with it) loads only when someone taps Contact.
const ContactModal = dynamic(() => import("@/components/ContactModal"), { ssr: false });

/** The home page's Contact row: a button styled like its sibling links, opening the contact form. */
export default function ContactRow({ className, style, children }: { className: string; style?: CSSProperties; children: ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        style={style}
        aria-label="Open contact form"
        onClick={() => {
          setOpened(true);
          setIsOpen(true);
        }}
      >
        {children}
      </button>
      {opened && <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}

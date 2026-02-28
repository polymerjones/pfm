"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Send, X } from "lucide-react";

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormState = {
  name: string;
  subject: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  subject: "",
  message: ""
};

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
  const reduceMotion = useReducedMotion();

  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
  const endpoint = useMemo(
    () => (formspreeId ? `https://formspree.io/f/${formspreeId}` : null),
    [formspreeId]
  );

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const onChange =
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!endpoint) {
      setStatusType("error");
      setStatusMessage("Contact form is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      setStatusType("success");
      setStatusMessage("Message sent. Thank you.");
      setForm(initialForm);
    } catch {
      setStatusType("error");
      setStatusMessage("Could not send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
            aria-label="Close contact form"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Contact Paul Fisher Media"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 22, scale: reduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.99 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg rounded-[12px] rounded-tr-[2px] border border-white/20 bg-[#101010]/95 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.6)] sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Contact</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[6px] p-2 text-white/85 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-white/85">Name</span>
                <input
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange("name")}
                  className="min-h-12 w-full rounded-[6px] border border-white/25 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  placeholder="Your name"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-white/85">Subject</span>
                <input
                  required
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={onChange("subject")}
                  className="min-h-12 w-full rounded-[6px] border border-white/25 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  placeholder="What is this about?"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-white/85">Message</span>
                <textarea
                  required
                  name="message"
                  value={form.message}
                  onChange={onChange("message")}
                  rows={5}
                  className="w-full rounded-[6px] border border-white/25 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  placeholder="Write your message"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !endpoint}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-white/30 bg-white/[0.06] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Send contact message"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>

            {statusMessage && (
              <p
                role="status"
                className={`mt-3 text-sm ${
                  statusType === "success" ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {statusMessage}
              </p>
            )}

            {!endpoint && (
              <p className="mt-3 text-sm text-amber-300">
                Missing <code>NEXT_PUBLIC_FORMSPREE_ID</code> environment variable.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "PolyPlay Audio Privacy Policy | Paul Fisher Media",
  description:
    "Privacy Policy for PolyPlay Audio, including how imported audio, playlists, preferences, and gratitude entries are handled.",
  openGraph: {
    title: "PolyPlay Audio Privacy Policy",
    description:
      "Privacy Policy for PolyPlay Audio, including how imported audio, playlists, preferences, and gratitude entries are handled.",
    url: "https://paulfishermedia.com/polyplay-audio/privacy",
    type: "article"
  },
  twitter: {
    card: "summary",
    title: "PolyPlay Audio Privacy Policy",
    description:
      "Privacy Policy for PolyPlay Audio, including how imported audio, playlists, preferences, and gratitude entries are handled."
  }
};

const sections = [
  {
    title: "Overview",
    body: [
      "PolyPlay Audio is a music and media app created by Paul Fisher Media. This Privacy Policy explains what information the app handles, how that information is used, and what choices you have.",
      "Effective date: March 18, 2026."
    ]
  },
  {
    title: "Information The App Handles",
    body: [
      "PolyPlay Audio may store media and related information that you choose to add to the app, including audio files, artwork, artwork video, track titles, playlists, playback settings, interface preferences, and optional gratitude entries.",
      "This information is used so the app can play your media, display your library, remember your settings, and restore your experience on your device."
    ]
  },
  {
    title: "How Information Is Stored",
    body: [
      "PolyPlay Audio is designed to work primarily on your device. Imported media, playlists, preferences, and optional gratitude content are intended to be stored locally on the device or browser storage you use with the app.",
      "If you create your own backups or export app data, those files are stored wherever you choose to save them."
    ]
  },
  {
    title: "Information Sharing",
    body: [
      "Paul Fisher Media does not sell your personal information.",
      "PolyPlay Audio does not require account creation to use its core playback and library features.",
      "If a future version of the app adds cloud sync, analytics, crash reporting, payments, or third-party integrations that affect personal information, this Privacy Policy will be updated before or when those features are made available."
    ]
  },
  {
    title: "Children's Privacy",
    body: [
      "PolyPlay Audio is not directed to children under 13, and Paul Fisher Media does not knowingly collect personal information from children under 13 through the app."
    ]
  },
  {
    title: "Your Choices",
    body: [
      "You can control the media and text you add to PolyPlay Audio. You can also delete app content, remove the app, or clear local/browser storage using your device or browser controls.",
      "Because the app is designed to store content locally, deleting local app data may permanently remove your library, playlists, preferences, and gratitude entries unless you created a separate backup."
    ]
  },
  {
    title: "Security",
    body: [
      "Paul Fisher Media takes reasonable steps to protect information handled by the app. No storage or transmission method is completely secure, and absolute security cannot be guaranteed."
    ]
  },
  {
    title: "Changes To This Policy",
    body: [
      "This Privacy Policy may be updated from time to time. The latest version will be posted at this page, and the effective date above will be updated when material changes are made."
    ]
  },
  {
    title: "Contact",
    body: [
      "If you have questions about this Privacy Policy or PolyPlay Audio, contact Paul Fisher Media at paul.t.fisher03@gmail.com."
    ]
  }
] as const;

export default function PolyPlayPrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.16),transparent_24%),linear-gradient(180deg,#070707_0%,#111111_100%)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white/85 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>

        <section className="overflow-hidden rounded-[24px] border border-white/12 bg-black/35 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06]">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              PolyPlay Audio Privacy Policy
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              This page describes how PolyPlay Audio handles imported media, playlists,
              preferences, and optional gratitude entries.
            </p>
          </div>

          <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-white sm:text-xl">{section.title}</h2>
                <div className="space-y-3 text-sm leading-7 text-white/78 sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import BendsBackground from "@/components/BendsBackground";
import VideoLogo from "@/components/VideoLogo";
import ContactRow from "@/components/ContactRow";
import HomeTouch from "@/components/HomeTouch";
import Year from "@/components/Year";
import { STATEMENT_BODY, STATEMENT_KICKER } from "@/app/_lib/statement";
import "./home.css";

/** Polyflix (film, photo and editing work). The FILM & PHOTO row stays hidden until this is set. */
const POLYFLIX_URL: string | undefined = "https://polyflix.app";

type Row = { label: string; sub: string; href?: string };

/** Rows 02 and on, under the Games tile; the one without an href is Contact (opens the form). */
const ROWS: Row[] = [
  ...(POLYFLIX_URL ? [{ label: "Film & Photo", sub: "Polyflix · film, photography, editing", href: POLYFLIX_URL }] : []),
  { label: "YouTube", sub: "@paulfishermedia", href: "https://www.youtube.com/paulfishermedia" },
  { label: "Contact", sub: "Work with me" }
];

const enter = (delay: number): CSSProperties => ({ animationDelay: `${delay}s` });

function RowBody({ n, row }: { n: number; row: Row }) {
  const Go = row.href ? ArrowUpRight : ArrowRight;
  return (
    <>
      <span className="home-num">{String(n).padStart(2, "0")}</span>
      <span className="home-txt">
        <span className="home-lab" data-text={row.label}>{row.label}</span>
        <span className="home-sub">{row.sub}</span>
      </span>
      <Go className="home-go" aria-hidden />
    </>
  );
}

export default function HomePage() {
  return (
    <main className="home relative min-h-screen overflow-x-clip px-4 pb-8 pt-6">
      <BendsBackground />
      <HomeTouch />

      {/* No entrance animation here: a transformed ancestor would trap the logo's page-wide flash inside the logo's box
          (position: fixed becomes relative to it). The video fades itself in. */}
      <div className="relative mx-auto w-full max-w-[980px]">
        <VideoLogo src="/logo.mp4" flash />
      </div>

      <nav aria-label="Paul Fisher Media links" className="relative mx-auto -mt-2 mb-9 w-full max-w-[480px]">
        <Link href="/games" className="home-games home-enter" style={enter(0.12)} aria-label="Games by Polymer Jones">
          <span className="home-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/games/img/mt-capsule.webp" alt="" width={1400} height={600} decoding="async" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/games/img/po-capsule.webp" alt="" width={1400} height={600} decoding="async" loading="lazy" />
          </span>
          <span className="home-cap">
            <span className="home-num">01</span>
            <span className="home-txt">
              <span className="home-byline" style={{ fontSize: 10 }}>Games by Polymer Jones</span>
              <span className="home-lab" data-text="Games">Games</span>
              <span className="home-sub">Monkey Trubble · Poly Oracle · play free in your browser</span>
            </span>
            <ArrowRight className="home-go" aria-hidden />
          </span>
        </Link>

        <div className="home-index">
          {ROWS.map((row, i) =>
            row.href ? (
              <a key={row.label} href={row.href} target="_blank" rel="noopener noreferrer" className="home-row home-enter" style={enter(0.2 + i * 0.07)}>
                <RowBody n={i + 2} row={row} />
              </a>
            ) : (
              <ContactRow key={row.label} className="home-row home-enter" style={enter(0.2 + i * 0.07)}>
                <RowBody n={i + 2} row={row} />
              </ContactRow>
            )
          )}
        </div>
      </nav>

      <section aria-labelledby="about-heading" className="home-about home-enter relative" style={enter(0.45)}>
        <h2 id="about-heading" className="home-byline">About</h2>
        <p>{STATEMENT_BODY}</p>
        <p className="home-kicker">
          {STATEMENT_KICKER.lead}
          <br />
          {STATEMENT_KICKER.tail} <b>{STATEMENT_KICKER.word}.</b>
        </p>
        <p className="home-sig">— Paul Fisher</p>
      </section>

      <footer className="home-stamp relative">
        <hr />
        <p>
          Copyright &copy; <Year /> Paul Fisher Media. All Rights Reserved.
        </p>
        <p className="home-netscape">Best viewed in Netscape Navigator at 800&nbsp;&times;&nbsp;600</p>
      </footer>

      <div className="relative mt-7 flex justify-center">
        <Link
          href="/polyplay-audio/privacy"
          className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          PolyPlay Audio Privacy
        </Link>
      </div>
    </main>
  );
}

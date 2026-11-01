"use client";

import { useEffect, useRef, useState } from "react";
import { Bungee_Inline } from "next/font/google";
import Coin from "@/app/_components/Coin";
import Sparkles from "@/app/_components/Sparkles";
import { asset, themeVars, type Game, type UpcomingGame } from "../_lib/catalog";
import { NEXT_GAME_PITCHES, TIP_GOAL, TIP_URL } from "../_lib/fund-config";
import { timeAgo, useFund } from "../_lib/useFund";

// The marquee title's face: a chunky coin-op cabinet header (self-hosted by next/font).
const marqueeFont = Bungee_Inline({ weight: "400", subsets: ["latin"], display: "swap" });

const CELLS = 20;
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

/**
 * The tip jar as an arcade prize machine: a bulb-lit marquee, a ticket-counter total that rolls up
 * when it scrolls into view, a 20-cell LED bar with prize markers, then the ask (INSERT COIN →
 * Ko-fi), the high-score wall, the approved guestbook and, when there are pitches, the vote.
 */
export function SupportCard({ tipURL }: { tipURL: string }) {
  const fund = useFund();
  const { target, milestones } = TIP_GOAL;
  const raised = Math.max(0, fund.raised);
  const jackpot = raised >= target;
  const lit = Math.min(CELLS, Math.floor((raised / target) * CELLS));
  const ref = useRef<HTMLElement>(null);
  const shown = useRollUp(raised, ref);

  return (
    <section ref={ref} id="support" className="arcade mx-4 scroll-mt-24 lg:mx-auto lg:w-[calc(100%-2rem)] lg:max-w-[1180px] overflow-hidden rounded-[22px] border-2"
             style={{ borderColor: "color-mix(in srgb, var(--accent) 55%, transparent)", background: "color-mix(in srgb, var(--bg0) 82%, black)", color: "var(--text)" }}>
      {/* Marquee: tracked caps in a frame of chasing bulbs. */}
      <div className="arcade-marquee relative px-5 pb-6 pt-5 text-center">
        <div className="text-[11px] font-semibold tracking-[0.3em] opacity-75">POLYMER JONES PRESENTS</div>
        <h2 className={`${marqueeFont.className} arcade-cabinet-title mt-1.5 text-[30px] leading-tight lg:text-[46px]` + (jackpot ? " arcade-jackpot" : "")}>
          {jackpot ? "JACKPOT!" : TIP_GOAL.title.toUpperCase()}
        </h2>
        {jackpot && <Confetti />}
      </div>

      {/* Phones: one column. Desktop: score screen + high scores on the left, the pitch on the right. */}
      <div className="px-4 pb-5 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-x-10 lg:px-8 lg:pb-8">
        {/* Score screen */}
        <div className="rounded-2xl border px-4 pb-4 pt-3 lg:col-start-1 lg:row-start-1" style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)", background: "rgba(0,0,0,0.55)" }}>
          <div className="flex items-end justify-between gap-3" style={{ fontFamily: MONO }}>
            <div className="text-[10px] font-semibold tracking-[0.25em] opacity-60">CREDITS<br />RAISED</div>
            <div className="arcade-digits text-[34px] font-bold leading-none tabular-nums" aria-label={`$${raised} raised of $${target}`}>
              <span className="opacity-60">$</span>
              <Padded value={shown} width={String(target).length} />
              <span className="ml-1 text-[15px] opacity-55">/{target}</span>
            </div>
          </div>

          {/* Prize markers above the LED bar */}
          <div className="relative mt-4 h-7" aria-hidden>
            {milestones.map((milestone) => {
              const at = (milestone.at / target) * 100;
              const won = raised >= milestone.at;
              return (
                <span key={milestone.at}
                      className={"absolute top-0 flex h-7 w-7 items-center justify-center rounded-full border text-[14px] " + (won ? "arcade-prize-won" : "opacity-45 grayscale")}
                      style={{ left: `${at}%`, transform: `translateX(${at >= 100 ? "-100%" : "-50%"})`, borderColor: won ? "#ffd23f" : "currentColor" }}>
                  {milestone.icon}
                </span>
              );
            })}
          </div>
          <div className="mt-1.5 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${CELLS}, 1fr)` }}
               role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={raised} aria-label={TIP_GOAL.title}>
            {Array.from({ length: CELLS }, (_, i) => (
              <span key={i} className={"arcade-cell h-4 rounded-[3px]" + (i < lit ? " is-lit" : i === lit && !jackpot ? " is-next" : "")}
                    style={{ animationDelay: `${i * 40}ms` }} />
            ))}
          </div>

          <ul className="mt-3 flex flex-col gap-1 text-[13px]">
            {milestones.map((milestone) => {
              const won = raised >= milestone.at;
              const label = (
                <>
                  <span className="w-12 tabular-nums opacity-70" style={{ fontFamily: MONO }}>${milestone.at}</span>
                  <span className={won ? "font-semibold" : "opacity-60"}>{milestone.icon} {milestone.label}</span>
                  <span className="ml-auto text-[11px] font-bold tracking-[0.15em]" style={{ color: won ? "#ffd23f" : undefined, opacity: won ? 1 : 0.4 }}>
                    {won ? "UNLOCKED" : "LOCKED"}
                  </span>
                </>
              );
              return (
                <li key={milestone.at}>
                  {won && milestone.link ? <a href={milestone.link} target="_blank" rel="noopener" className="flex items-center gap-2 underline-offset-2 hover:underline">{label}</a>
                    : <div className="flex items-center gap-2">{label}</div>}
                </li>
              );
            })}
          </ul>
          {fund.latest && (
            <p className="mt-3 text-[11px] font-semibold tracking-[0.18em] opacity-60" style={{ fontFamily: MONO }}>
              LAST COIN: {fund.latest.name.toUpperCase()} · {timeAgo(fund.latest.at).toUpperCase()}
            </p>
          )}
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col lg:justify-center">
        <p className="mt-4 text-[15px] leading-relaxed lg:mt-0 lg:text-[17px]">
          If you enjoy playing my games as much as I enjoy creating them for you, a tip means the world. Every one goes
          straight into the next game.
        </p>
        <p className="mt-1.5 text-right text-sm italic opacity-65">Polymer Jones</p>

        <a href={tipURL} target="_blank" rel="noopener"
           className="arcade-coin relative mt-4 flex items-center justify-center gap-2.5 rounded-full py-3.5 text-[17px] font-extrabold tracking-[0.22em] transition-transform active:scale-95"
           style={{ background: "#ffd23f", color: "#1a1200" }}>
          <Sparkles />
          <Coin size={34} /> INSERT COIN
        </a>
        <p className="mt-2 text-center text-[10.5px] font-semibold tracking-[0.1em] opacity-60" style={{ fontFamily: MONO }}>
          $3 = 1 CREDIT · $5 = 2 · $10 = 4
        </p>

        {NEXT_GAME_PITCHES.length > 0 && <Vote votes={fund.votes} />}
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          {fund.wall.length > 0 && <HighScores wall={fund.wall} />}
          {fund.guestbook.length > 0 && <Guestbook entries={fund.guestbook} />}
        </div>

        <p className="mt-4 text-center text-[12px] leading-snug opacity-55 lg:col-span-2 lg:mt-6">
          Leave a message with your tip and it can appear in the guestbook (after a quick look). Tick “private” on Ko-fi
          and it stays between us. Every supporter goes in the next game’s credits.
        </p>
      </div>
    </section>
  );
}

function Padded({ value, width }: { value: number; width: number }) {
  const digits = String(Math.floor(value));
  const pad = Math.max(0, width - digits.length);
  return (
    <>
      <span className="opacity-20">{"0".repeat(pad)}</span>
      {digits}
    </>
  );
}

/** Counts up from 0 the first time the card is on screen (immediately with reduced motion). */
function useRollUp(value: number, ref: React.RefObject<HTMLElement | null>): number {
  const [shown, setShown] = useState(0);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || value === 0) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, value]);
  return shown;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-5 text-center text-[12px] font-bold tracking-[0.3em]" style={{ color: "#ffd23f" }}>{children}</h3>;
}

function HighScores({ wall }: { wall: { name: string; amount: number }[] }) {
  return (
    <div>
      <SectionLabel>HIGH SCORES</SectionLabel>
      <ol className="rounded-xl bg-black/50 px-3 py-2 text-[14px]" style={{ fontFamily: MONO }}>
        {wall.map((row, i) => (
          <li key={`${row.name}-${i}`} className="flex gap-3 py-0.5" style={{ color: i === 0 ? "#ffd23f" : undefined }}>
            <span className="w-8 opacity-60">{ordinal(i + 1)}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{row.name.toUpperCase()}</span>
            <span className="tabular-nums">${row.amount}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ordinal(n: number): string {
  const suffix = n === 1 ? "ST" : n === 2 ? "ND" : n === 3 ? "RD" : "TH";
  return `${n}${suffix}`;
}

/** Approved messages crawl past like an attract-mode screen (a plain list with reduced motion). */
function Guestbook({ entries }: { entries: { name: string; message: string }[] }) {
  const items = entries.map((entry, i) => (
    <span key={i} className="mx-6 whitespace-nowrap">
      <span className="opacity-90">“{entry.message}”</span> <span className="font-semibold" style={{ color: "#ffd23f" }}>— {entry.name}</span>
    </span>
  ));
  return (
    <div>
      <SectionLabel>GUESTBOOK</SectionLabel>
      <div className="arcade-ticker overflow-hidden rounded-xl bg-black/50 py-2.5 text-[14px]">
        <div className="arcade-ticker-track inline-flex" style={{ animationDuration: `${Math.max(14, entries.length * 7)}s` }}>
          {items}
          <span aria-hidden className="inline-flex">{items}</span>
        </div>
      </div>
    </div>
  );
}

function Vote({ votes }: { votes: Record<string, number> }) {
  const total = NEXT_GAME_PITCHES.reduce((sum, pitch) => sum + (votes[pitch.key] ?? 0), 0);
  return (
    <div>
      <SectionLabel>PICK THE NEXT GAME</SectionLabel>
      <div className="flex flex-col gap-2">
        {NEXT_GAME_PITCHES.map((pitch) => {
          const count = votes[pitch.key] ?? 0;
          const pct = total ? (count / total) * 100 : 0;
          return (
            <div key={pitch.key} className="relative overflow-hidden rounded-xl border px-3 py-2"
                 style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}>
              <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: "color-mix(in srgb, var(--accent) 22%, transparent)" }} />
              <div className="relative flex items-center gap-3">
                <span className="text-[18px] font-extrabold" style={{ color: "#ffd23f", fontFamily: MONO }}>{pitch.key}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{pitch.title}</span>
                  <span className="block text-[13px] opacity-70">{pitch.line}</span>
                </span>
                <span className="tabular-nums text-sm opacity-80">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[12px] opacity-60">Vote by adding <b>VOTE A</b>, <b>VOTE B</b> or <b>VOTE C</b> to your Ko-fi message.</p>
    </div>
  );
}

/** A one-time burst of confetti for the JACKPOT state. */
function Confetti() {
  const colors = ["#ffd23f", "#ff4fd8", "#3ff0ff", "#7dff5a", "#ffffff"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} className="arcade-confetti absolute top-1/2 h-2 w-1.5 rounded-[1px]"
              style={{
                left: `${8 + ((i * 37) % 84)}%`,
                background: colors[i % colors.length],
                animationDelay: `${(i % 7) * 60}ms`,
                ["--dx" as string]: `${((i * 53) % 120) - 60}px`,
                ["--dy" as string]: `${-60 - ((i * 29) % 70)}px`,
                ["--r" as string]: `${(i * 97) % 720}deg`,
              }} />
      ))}
    </div>
  );
}

const scrollToFund = () => document.getElementById("support")?.scrollIntoView({ behavior: "smooth" });

/** The In Development card's action (where other games show TRY IT / store): back it. */
export function BackItButton() {
  return (
    <button type="button" onClick={scrollToFund}
            className="relative flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-extrabold tracking-[0.14em] transition-transform active:scale-95"
            style={{ background: "#ffd23f", color: "#1a1200", boxShadow: "0 0 14px rgba(255,210,63,0.45)" }}>
      <Sparkles size={0.8} />
      <Coin size={28} /> BACK IT
    </button>
  );
}

/** Hero art for an In Development card until its banner arrives: a lit marquee on a dark cabinet. */
export function DevHeroArt({ name }: { name: string }) {
  return (
    <div className="arcade-dev-art absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="text-[11px] font-semibold tracking-[0.3em] text-white/70">POLYMER JONES PRESENTS</div>
      <div className={`${marqueeFont.className} arcade-cabinet-title text-[40px] leading-[1.05]`}>{name.toUpperCase()}</div>
      <div className="text-[13px] font-bold tracking-[0.3em] text-[#ffd23f]/80">NOW IN DEVELOPMENT</div>
    </div>
  );
}

/** Details for the In Development card: teaser banners for the games being built, then the fund. */
export function DevPanel({ game }: { game: Game }) {
  const fund = useFund();
  const { target } = TIP_GOAL;
  const raised = Math.max(0, fund.raised);
  const lit = Math.min(CELLS, Math.floor((raised / target) * CELLS));
  return (
    <div className="mx-auto w-full max-w-[1180px] rounded-[22px] border p-4 backdrop-blur-md lg:p-6"
         style={{ ...themeVars(game.theme), borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)", background: "color-mix(in srgb, var(--bg1) 60%, transparent)", color: "var(--text)" }}>
      <div className="mx-auto flex max-w-[860px] flex-col gap-4">
        <span className="flex w-fit items-center gap-1.5 rounded-full border border-[#ffd23f]/60 bg-black/55 px-2.5 py-1 text-[11px] font-extrabold tracking-[0.12em] text-[#ffd23f]">
          <span className="arcade-rec-dot" /> IN DEVELOPMENT
        </span>
        {(game.upcoming ?? []).map((upcoming) => <UpcomingBanner key={upcoming.id} game={upcoming} />)}

        <div className="rounded-2xl border bg-black/55 p-4" style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}>
          <div className="flex items-end justify-between gap-3" style={{ fontFamily: MONO }}>
            <span className="text-[11px] font-bold tracking-[0.25em] opacity-70">{TIP_GOAL.title.toUpperCase()}</span>
            <span className="arcade-digits text-[24px] font-bold leading-none tabular-nums">
              ${raised}<span className="ml-1 text-[13px] opacity-55">/{target}</span>
            </span>
          </div>
          <div className="mt-3 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${CELLS}, 1fr)` }}
               role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={raised} aria-label={TIP_GOAL.title}>
            {Array.from({ length: CELLS }, (_, i) => (
              <span key={i} className={"arcade-cell h-3 rounded-[3px]" + (i < lit ? " is-lit" : i === lit && raised < target ? " is-next" : "")} />
            ))}
          </div>
          {TIP_URL && (
            <a href={TIP_URL} target="_blank" rel="noopener"
               className="arcade-coin relative mx-auto mt-4 flex max-w-[460px] items-center justify-center gap-2.5 rounded-full py-3 text-[16px] font-extrabold tracking-[0.22em] transition-transform active:scale-95"
               style={{ background: "#ffd23f", color: "#1a1200" }}>
              <Sparkles />
              <Coin size={34} /> INSERT COIN
            </a>
          )}
          <button type="button" onClick={scrollToFund} className="mt-3 w-full text-center text-[12px] font-semibold tracking-[0.14em] opacity-70 hover:opacity-100">
            PRIZES · HIGH SCORES · GUESTBOOK ↓
          </button>
        </div>
      </div>
    </div>
  );
}

/** A teaser for a game in development: its key art slowly pushing in behind letterbox bars, the title
 *  logo glowing over a dark fade, then a line about it. */
function UpcomingBanner({ game }: { game: UpcomingGame }) {
  const logo = asset(game.titleLogo);
  return (
    <figure className="overflow-hidden rounded-2xl border" style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}>
      <div className="relative aspect-[2.33] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(game.banner)} alt="" loading="lazy" decoding="async" className="arcade-teaser-art absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.75) 100%)" }} />
        <div className="absolute inset-x-0 top-0 h-[7%] bg-black" />
        <div className="absolute inset-x-0 bottom-0 h-[7%] bg-black" />
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={game.name} loading="lazy" decoding="async"
               className="arcade-teaser-title absolute inset-x-0 bottom-[11%] mx-auto w-[62%]" />
        ) : (
          <span className="absolute inset-x-0 bottom-3 text-center text-2xl font-extrabold">{game.name}</span>
        )}
        <span className="absolute right-3 top-[10%] flex items-center gap-1.5 rounded-full border border-white/25 bg-black/60 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.2em] text-white/90">
          <span className="arcade-rec-dot" /> TEASER
        </span>
      </div>
      {game.blurb && <figcaption className="bg-black/45 px-3.5 py-2.5 text-[14px] leading-snug opacity-90">{game.blurb}</figcaption>}
    </figure>
  );
}

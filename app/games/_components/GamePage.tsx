"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, LifeBuoy, Play, ShieldCheck } from "lucide-react";
import { asset, feedMedia, playables, themeVars, TIP_URL, type Game, type MiniGameRef } from "../_lib/catalog";
import { initialTier, type Tier } from "../_lib/perf";
import { createPositionStore } from "../_lib/position";
import { StoreButtons } from "./StoreButtons";
import ThemeStage from "./ThemeStage";

// Loaded only when used.
const PlayInPlace = dynamic(() => import("./PlayInPlace"), { ssr: false });
const MediaFeed = dynamic(() => import("./MediaFeed"), { ssr: false });

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif';

/**
 * A game's own page (/games/<id>): a brief pitch built around playing it. The stage shows the
 * selected playable (the real game, or a hub mini-game) with TAP TO PLAY; "More to play" pills sit
 * right under it; the pitch follows. This is also where shared links and QR codes land.
 */
export default function GamePage({ game }: { game: Game }) {
  const miniGames = playables(game);
  const [selectedID, setSelectedID] = useState(miniGames[0]?.id);
  const [playing, setPlaying] = useState<MiniGameRef | null>(null);
  const [feedStart, setFeedStart] = useState<number | null>(null);
  const [tier, setTier] = useState<Tier>("medium");
  const [thanks, setThanks] = useState(false);
  const position = useMemo(() => createPositionStore(0), []);
  const selected = miniGames.find((miniGame) => miniGame.id === selectedID);
  const covered = playing !== null || feedStart !== null;

  useEffect(() => setTier(initialTier()), []);

  const trailerIndex = feedMedia(game).findIndex((item) => item.kind === "video");
  const trailerPoster = trailerIndex >= 0 ? asset(feedMedia(game)[trailerIndex].poster) : undefined;

  return (
    <div className="games-hub relative isolate z-[1] min-h-[100svh]" style={{ ...themeVars(game.theme), fontFamily: SYSTEM_FONT, color: "var(--text)" }}>
      <ThemeStage games={[game]} position={position} tier={tier} paused={covered} />

      <header className="sticky top-0 z-30 flex items-center gap-3 px-3.5 pb-2 pt-[max(10px,env(safe-area-inset-top))]"
              style={{ background: "linear-gradient(180deg, var(--bg0), transparent)" }}>
        <Link href={`/games?game=${game.id}`} aria-label="All games"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/45">
          <ChevronLeft size={26} strokeWidth={2.5} />
        </Link>
        <div className="flex min-w-0 flex-1 justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {game.titleLogo ? <img src={asset(game.titleLogo)} alt={game.name} style={{ height: 34 * (game.titleScale ?? 1) }} className="object-contain" />
            : <h1 className="text-xl font-bold">{game.name}</h1>}
        </div>
        <StoreButtons game={game} />
      </header>

      <main className="flex flex-col gap-4 px-3 pb-16 pt-2">
        {selected && (
          <Stage game={game} miniGame={selected} onPlay={() => setPlaying(selected)} />
        )}

        {miniGames.length > 1 && (
          <div className="flex flex-col items-center gap-2 px-1">
            <span className="text-[11px] font-semibold tracking-[0.3em] opacity-60">MORE TO PLAY</span>
            <div className="flex w-full gap-2.5">
              {miniGames.map((miniGame) => {
                const active = miniGame.id === selectedID;
                return (
                  <button key={miniGame.id} type="button" onClick={() => setSelectedID(miniGame.id)} aria-pressed={active}
                          className="min-h-[46px] flex-1 truncate rounded-full border-[1.5px] px-3 text-sm font-bold tracking-[0.12em] transition-transform active:scale-95"
                          style={{
                            borderColor: "var(--accent)",
                            color: active ? "var(--bg0)" : "var(--accent)",
                            background: active ? "var(--accent)" : "color-mix(in srgb, var(--accent) 12%, transparent)",
                            boxShadow: active ? "0 0 12px color-mix(in srgb, var(--glow) 60%, transparent)" : "none",
                          }}>
                    {miniGame.title.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <section className="flex flex-col gap-3.5 rounded-3xl border p-[18px] backdrop-blur-md"
                 style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)", background: "color-mix(in srgb, var(--bg1) 55%, transparent)" }}>
          <h2 className="text-xl font-bold">{game.tagline}</h2>
          <div className="flex flex-wrap gap-2">
            {(game.highlights ?? []).map((highlight) => (
              <span key={highlight} className="rounded-full border px-3 py-1.5 text-[13px] font-semibold"
                    style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)", background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
                {highlight}
              </span>
            ))}
          </div>
          {trailerIndex >= 0 && (
            <button type="button" onClick={() => setFeedStart(trailerIndex)} aria-label={`Watch the ${game.name} video`}
                    className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {trailerPoster && <img src={trailerPoster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
              <Play size={56} className="absolute inset-0 m-auto fill-white text-white drop-shadow-lg" />
            </button>
          )}
          <p className="text-[15px] leading-relaxed opacity-90">{game.summary}</p>
          <StoreButtons game={game} size="wide" />
        </section>

        {(game.privacyURL || game.supportURL) && (
          <nav aria-label={`${game.name} links`} className="flex flex-wrap justify-center gap-2.5 pt-2">
            {game.supportURL && <FooterLink href={game.supportURL} icon={<LifeBuoy size={15} />}>Support</FooterLink>}
            {game.privacyURL && <FooterLink href={game.privacyURL} icon={<ShieldCheck size={15} />}>Privacy Policy</FooterLink>}
          </nav>
        )}
      </main>

      {playing && (
        <PlayInPlace
          game={game}
          miniGame={playing}
          onClose={(seconds) => {
            setPlaying(null);
            if (seconds >= 60) {
              try {
                if (!sessionStorage.getItem(`pj-thanks-${game.id}`)) {
                  sessionStorage.setItem(`pj-thanks-${game.id}`, "1");
                  setThanks(true);
                }
              } catch {}
            }
          }}
        />
      )}
      {thanks && <ThanksCard game={game} onDismiss={() => setThanks(false)} />}
      {feedStart !== null && <MediaFeed game={game} start={feedStart} onClose={() => setFeedStart(null)} />}
    </div>
  );
}

/** After a real play session: a light thank-you with the store buttons. Once per visit. */
function ThanksCard({ game, onDismiss }: { game: Game; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/50 p-4 pb-[max(16px,env(safe-area-inset-bottom))]"
         onClick={onDismiss} role="dialog" aria-modal="true" aria-label="Thanks for playing">
      <div className="hub-fade flex w-full max-w-md flex-col items-center gap-3.5 rounded-3xl border p-5 text-center backdrop-blur-xl"
           style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)", background: "color-mix(in srgb, var(--bg1) 80%, transparent)" }}
           onClick={(event) => event.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {game.icon && <img src={asset(game.icon)} alt="" className="h-16 w-16 rounded-[18px] border border-white/20" />}
        <h2 className="text-xl font-bold">Thanks for playing!</h2>
        <p className="text-[15px] opacity-85">Get {game.name} for your phone: full screen, offline, and your progress everywhere.</p>
        <StoreButtons game={game} size="wide" />
        {TIP_URL && (
          <a href={TIP_URL} target="_blank" rel="noopener" className="text-sm font-bold tracking-[0.12em]" style={{ color: "#ffd23f" }}>
            Liked it? INSERT A COIN →
          </a>
        )}
        <button type="button" onClick={onDismiss} className="text-sm font-semibold opacity-70">Maybe later</button>
      </div>
    </div>
  );
}

/** The playable's attract screen: the game's art, its name and blurb, and one big TAP TO PLAY. */
function Stage({ game, miniGame, onPlay }: { game: Game; miniGame: MiniGameRef; onPlay: () => void }) {
  const playable = Boolean(miniGame.url);
  const hero = asset(game.hero);
  return (
    <section
      className="relative flex h-[min(64svh,640px)] flex-col items-center justify-end overflow-hidden rounded-[28px] border pb-8 text-center"
      style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)", background: "linear-gradient(180deg, var(--bg0), var(--bg1), var(--bg2))" }}
      aria-label={miniGame.title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {hero && <img src={hero} alt="" className={"absolute inset-0 h-full w-full " + (game.heroFit === "fit" ? "object-contain pb-[42%] pt-6" : "object-cover")} />}
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, var(--bg0) 96%)" }} />
      <div className="relative flex flex-col items-center gap-2.5 px-7">
        <h2 className="text-[28px] font-bold tracking-[0.2em]">{miniGame.title.toUpperCase()}</h2>
        {miniGame.blurb && <p className="text-[15px] font-medium opacity-85">{miniGame.blurb}</p>}
        {playable ? (
          <button type="button" onClick={onPlay}
                  className="mt-2 rounded-full px-9 py-3.5 text-lg font-bold tracking-[0.2em] transition-transform active:scale-95"
                  style={{ background: "var(--accent)", color: "var(--bg0)", boxShadow: "0 0 16px color-mix(in srgb, var(--glow) 70%, transparent)" }}>
            TAP TO PLAY
          </button>
        ) : (
          <span className="mt-1 text-sm font-semibold" style={{ color: "var(--accent)" }}>Playable here soon</span>
        )}
      </div>
    </section>
  );
}

/** Small outlined pill for a game's Support / Privacy pages. */
function FooterLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener"
       className="flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold tracking-[0.06em] opacity-85 transition-opacity hover:opacity-100"
       style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)", background: "color-mix(in srgb, var(--bg1) 55%, transparent)" }}>
      {icon}
      {children}
    </a>
  );
}

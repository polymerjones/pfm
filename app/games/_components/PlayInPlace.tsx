"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { asset, playURL, themeVars, type Game, type MiniGameRef } from "../_lib/catalog";
import { StoreButtons } from "./StoreButtons";

/** Seconds of visible play before the soft "get the app" nudge (`?nudge=5` on the page shortens it for testing). */
function nudgeAfter(): number {
  const override = Number(new URLSearchParams(window.location.search).get("nudge"));
  return override > 0 ? override : 240;
}

function onceThisVisit(key: string): boolean {
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
  } catch {}
  return true;
}

/**
 * The real game, played full screen over the page, with no time limit. The hub's controls sit in
 * their own slim bar above the game so they never cover its HUD. Only one game is ever loaded: the
 * frame exists only while this is open, and on close it's blanked first (stopping its audio at once)
 * and then removed. After a few minutes of visible play the bar gently suggests the app (once per
 * visit, never over the game). `onClose` reports how many seconds were actually played.
 */
export default function PlayInPlace({ game, miniGame, onClose }: { game: Game; miniGame: MiniGameRef; onClose: (playedSeconds: number) => void }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [nudging, setNudging] = useState(false);
  const played = useRef(0);
  const since = useRef<number | null>(null);
  const url = playURL(miniGame);

  const playedSeconds = () => played.current + (since.current === null ? 0 : (performance.now() - since.current) / 1000);

  const close = () => {
    if (frameRef.current) frameRef.current.src = "about:blank";
    onClose(playedSeconds());
  };

  // Count only visible play; one timeout for the nudge, re-armed when the tab comes back.
  useEffect(() => {
    if (!loaded) return;
    let timer = 0;
    const arm = () => {
      const remaining = nudgeAfter() - playedSeconds();
      timer = window.setTimeout(() => {
        if (onceThisVisit(`pj-nudge-${game.id}`)) {
          setNudging(true);
          window.setTimeout(() => setNudging(false), 12000);
        }
      }, Math.max(0, remaining) * 1000);
    };
    const visibility = () => {
      if (document.hidden) {
        played.current = playedSeconds();
        since.current = null;
        window.clearTimeout(timer);
      } else {
        since.current = performance.now();
        arm();
      }
    };
    since.current = performance.now();
    arm();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, game.id]);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => setSlow(true), 15000);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Playing ${game.name}`}
      className="fixed inset-0 z-[60] flex h-[100dvh] flex-col bg-black text-white"
      style={themeVars(game.theme)}
    >
      <div className="flex items-center gap-3 px-3 pb-1.5 pt-[max(6px,env(safe-area-inset-top))]">
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close game"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.12]"
        >
          <X size={22} strokeWidth={2.5} />
        </button>
        <div className="flex min-w-0 flex-1 justify-center">
          {nudging ? (
            // The nudge lives in the hub's own bar, so it never covers the game.
            <button type="button" onClick={() => setNudging(false)} className="hub-fade text-center text-[13px] font-semibold leading-tight" aria-live="polite">
              Enjoying it? Get the app
              <br />
              and keep your progress.
            </button>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            game.titleLogo ? <img src={asset(game.titleLogo)} alt={game.name} className="h-7 object-contain" /> : <span className="font-bold">{game.name}</span>
          )}
        </div>
        {url && (
          <a href={url} target="_blank" rel="noopener" aria-label="Open the game in a new tab"
             className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/[0.12] sm:flex">
            <ExternalLink size={18} />
          </a>
        )}
        <div className={"shrink-0 rounded-full " + (nudging ? "nudge-ring" : "")}>
          <StoreButtons game={game} />
        </div>
      </div>

      <div className="relative flex-1">
        {url && (
          <iframe
            ref={frameRef}
            src={url}
            title={`${game.name}: ${miniGame.title}`}
            allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
            className="absolute inset-0 h-full w-full border-0"
            onLoad={() => setLoaded(true)}
          />
        )}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black px-10 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {game.titleLogo && <img src={asset(game.titleLogo)} alt="" style={{ height: 48 * (game.titleScale ?? 1) }} />}
            {slow ? (
              <p className="text-sm text-white/80">
                Still loading. Check your connection, or{" "}
                <a href={url} target="_blank" rel="noopener" className="underline" style={{ color: "var(--accent)" }}>
                  open the game directly
                </a>
                .
              </p>
            ) : (
              <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/20" style={{ borderTopColor: "var(--accent)" }} aria-label="Loading" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

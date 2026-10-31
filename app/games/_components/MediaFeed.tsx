"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Volume2, X } from "lucide-react";
import { asset, feedMedia, playables, themeVars, type Game, type MediaItem, type MiniGameRef } from "../_lib/catalog";

type Entry = { kind: "media"; item: MediaItem } | { kind: "try"; ref: MiniGameRef };
type Axis = "x" | "y";

const TRY_POSITION = 3; // the 4th page invites people to play
const HINT_KEY = "pj-feed-hint-count";
const HINT_SHOWINGS = 2;
const EASE = "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)";

function readHintCount(): number {
  try {
    return Number(localStorage.getItem(HINT_KEY) ?? 0);
  } catch {
    return HINT_SHOWINGS;
  }
}

/**
 * Full-screen media feed. Swipe up or left for the next item, down or right for the previous;
 * the content follows the finger along whichever axis you start on and slides in from that side.
 * Mouse wheel, trackpad and arrow keys work on desktop; Esc closes. Only the current item and its
 * two neighbors are mounted. Videos loop with sound while on screen. The 4th page leads to the game.
 */
export default function MediaFeed({ game, start, onClose }: { game: Game; start: number; onClose: () => void }) {
  const router = useRouter();
  const entries = useMemo<Entry[]>(() => {
    const list: Entry[] = feedMedia(game).map((item) => ({ kind: "media", item }));
    const ref = playables(game)[0];
    if (ref) list.splice(Math.min(TRY_POSITION, list.length), 0, { kind: "try", ref });
    return list;
  }, [game]);
  const hasTry = entries.some((entry) => entry.kind === "try");
  const [index, setIndex] = useState(() => (hasTry && start >= TRY_POSITION ? start + 1 : start));
  const [showsHint, setShowsHint] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const layers = useRef(new Map<number, HTMLDivElement>());
  const busy = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Place the current item and its neighbors along an axis, offset by a drag distance.
  const layout = useCallback(
    (axis: Axis, delta: number, animate: boolean, at = index) => {
      const size = axis === "x" ? window.innerWidth : window.innerHeight;
      [at - 1, at, at + 1].forEach((i) => {
        const layer = layers.current.get(i);
        if (!layer) return;
        const offset = (i - at) * size + delta;
        layer.style.transition = animate ? EASE : "none";
        layer.style.transform = axis === "x" ? `translate3d(${offset}px,0,0)` : `translate3d(0,${offset}px,0)`;
      });
    },
    [index],
  );

  const go = useCallback(
    (step: 1 | -1, axis: Axis) => {
      const target = index + step;
      if (busy.current || target < 0 || target >= entries.length) {
        layout(axis, 0, true);
        return;
      }
      busy.current = true;
      setShowsHint(false);
      layout(axis, -step * (axis === "x" ? window.innerWidth : window.innerHeight), true);
      window.setTimeout(() => {
        busy.current = false;
        setIndex(target);
      }, 280);
    },
    [entries.length, index, layout],
  );

  // Before paint, so neighbors never flash on top of the current item.
  useLayoutEffect(() => layout("y", 0, false), [index, layout]);

  // Lock the page behind, focus the close button, keyboard controls.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown" || event.key === "PageDown") go(1, "y");
      if (event.key === "ArrowUp" || event.key === "PageUp") go(-1, "y");
      if (event.key === "ArrowRight") go(1, "x");
      if (event.key === "ArrowLeft") go(-1, "x");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  // Swipe tutorial: the first couple of times a feed opens (and only if there's somewhere to go).
  useEffect(() => {
    // Mouse/trackpad users get visible arrow buttons instead of the swipe tutorial.
    const pointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (pointerFine || entries.length < 2 || readHintCount() >= HINT_SHOWINGS) return;
    try {
      localStorage.setItem(HINT_KEY, String(readHintCount() + 1));
    } catch {}
    setShowsHint(true);
    const done = window.setTimeout(() => setShowsHint(false), 3400);
    return () => window.clearTimeout(done);
  }, [entries.length]);

  // Pointer swipes: lock to the first clear axis, follow the finger, commit on distance or flick.
  const gesture = useRef<{ x: number; y: number; t: number; axis?: Axis; id: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent) => {
    if (busy.current || (event.target as HTMLElement).closest("button, a")) return;
    gesture.current = { x: event.clientX, y: event.clientY, t: performance.now(), id: event.pointerId };
    setShowsHint(false);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x;
    const dy = event.clientY - g.y;
    if (!g.axis) {
      if (Math.hypot(dx, dy) < 8) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      stageRef.current?.setPointerCapture(event.pointerId);
    }
    let delta = g.axis === "x" ? dx : dy;
    const atEnd = (delta < 0 && index >= entries.length - 1) || (delta > 0 && index <= 0);
    if (atEnd) delta *= 0.3; // rubber-band at the ends
    layout(g.axis, delta, false);
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.axis) return;
    const delta = g.axis === "x" ? event.clientX - g.x : event.clientY - g.y;
    const size = g.axis === "x" ? window.innerWidth : window.innerHeight;
    const velocity = delta / Math.max(1, performance.now() - g.t);
    if (Math.abs(delta) > size * 0.18 || Math.abs(velocity) > 0.5) go(delta < 0 ? 1 : -1, g.axis);
    else layout(g.axis, 0, true);
  };

  // Wheel / trackpad: one item per gesture.
  const wheelLock = useRef(0);
  const onWheel = (event: React.WheelEvent) => {
    const now = performance.now();
    if (now < wheelLock.current) return;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    const delta = horizontal ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 30) return;
    wheelLock.current = now + 650;
    go(delta > 0 ? 1 : -1, horizontal ? "x" : "y");
  };

  const openGame = () => router.push(`/games/${game.id}`);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${game.name} media`}
      className="fixed inset-0 z-50 overflow-hidden bg-black"
      style={{ ...themeVars(game.theme), touchAction: "none", overscrollBehavior: "none" }}
      onWheel={onWheel}
    >
      <div
        ref={stageRef}
        className={"absolute inset-0 " + (showsHint ? "feed-peek" : "")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {[index - 1, index, index + 1].map((i) => {
          const entry = entries[i];
          if (!entry) return null;
          return (
            <div
              key={i}
              ref={(node) => {
                if (node) layers.current.set(i, node);
                else layers.current.delete(i);
              }}
              className="absolute inset-0 will-change-transform"
              aria-hidden={i !== index}
            >
              {entry.kind === "media" ? (
                <FeedItem item={entry.item} active={i === index} />
              ) : (
                <TryCard game={game} miniGame={entry.ref} onPlay={openGame} />
              )}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[max(16px,env(safe-area-inset-top))]">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="pointer-events-auto flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/30 bg-black/55 text-white"
        >
          <X size={26} strokeWidth={2.5} />
        </button>
        <span className="rounded-full bg-black/55 px-3.5 py-2 text-base font-semibold tabular-nums text-white">
          {index + 1} / {entries.length}
        </span>
      </div>

      {/* Mouse/trackpad: big previous/next buttons at the sides (hidden on touch screens). */}
      {index > 0 && (
        <button type="button" onClick={() => go(-1, "x")} aria-label="Previous"
                className="pointer-only absolute left-4 top-1/2 h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white transition-transform hover:scale-105 hover:bg-black/70">
          <ChevronLeft size={34} strokeWidth={2.5} />
        </button>
      )}
      {index < entries.length - 1 && (
        <button type="button" onClick={() => go(1, "x")} aria-label="Next"
                className="pointer-only absolute right-4 top-1/2 h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white transition-transform hover:scale-105 hover:bg-black/70">
          <ChevronRight size={34} strokeWidth={2.5} />
        </button>
      )}

      {showsHint && <SwipeHint />}
      <span className="sr-only" aria-live="polite">
        Item {index + 1} of {entries.length}. Use the arrow keys or swipe to move between items.
      </span>
    </div>
  );
}

function FeedItem({ item, active }: { item: MediaItem; active: boolean }) {
  const backdrop = "radial-gradient(circle, color-mix(in srgb, var(--glow) 35%, transparent), #000 70%)";
  if (item.kind === "image") {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ background: backdrop }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(item.asset)} alt="" decoding="async" className="max-h-full max-w-full object-contain" draggable={false} />
      </div>
    );
  }
  return <FeedVideo src={asset(item.asset)} poster={asset(item.poster)} active={active} backdrop={backdrop} />;
}

/** Loops with sound while on screen. If the browser blocks sound without a fresh tap, it plays
 *  muted and offers a "Tap for sound" button. Off screen it unloads entirely. */
function FeedVideo({ src, poster, active, backdrop }: { src?: string; poster?: string; active: boolean; backdrop: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || !active) return;
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      setNeedsTap(true);
      video.play().catch(() => {});
    });
    return () => video.pause();
  }, [active]);

  return (
    <div className="relative flex h-full w-full items-center justify-center" style={{ background: backdrop }}>
      {active ? (
        <video ref={ref} src={src} poster={poster} loop playsInline className="max-h-full max-w-full object-contain" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        poster && <img src={poster} alt="" className="max-h-full max-w-full object-contain" />
      )}
      {active && needsTap && (
        <button
          type="button"
          onClick={() => {
            if (ref.current) ref.current.muted = false;
            setNeedsTap(false);
          }}
          className="absolute left-1/2 top-[max(84px,calc(env(safe-area-inset-top)+72px))] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-black/60 px-4 py-2.5 font-semibold text-white"
        >
          <Volume2 size={20} /> Tap for sound
        </button>
      )}
    </div>
  );
}

function TryCard({ game, miniGame, onPlay }: { game: Game; miniGame: MiniGameRef; onPlay: () => void }) {
  const hero = asset(game.hero);
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden pb-24 text-center text-white"
         style={{ background: "linear-gradient(180deg, var(--bg0), var(--bg1), var(--bg2))" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {hero && <img src={hero} alt="" className={"absolute inset-0 h-full w-full " + (game.heroFit === "fit" ? "object-contain pb-[45vh] pt-16" : "object-cover")} />}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 45%, var(--bg0) 95%)" }} />
      <div className="relative flex flex-col items-center gap-3.5 px-8">
        <span className="text-[13px] font-semibold tracking-[0.4em]" style={{ color: "var(--accent)" }}>TRY THE GAME</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {game.titleLogo && <img src={asset(game.titleLogo)} alt={game.name} style={{ height: 48 * (game.titleScale ?? 1) }} />}
        <span className="text-[26px] font-bold tracking-[0.2em]">{miniGame.title.toUpperCase()}</span>
        {miniGame.blurb && <p className="max-w-[340px] text-[15px] font-medium text-white/85">{miniGame.blurb}</p>}
        <button
          type="button"
          onClick={onPlay}
          className="mt-1.5 rounded-full px-10 py-4 text-lg font-bold tracking-[0.2em] transition-transform active:scale-95"
          style={{ background: "var(--accent)", color: "var(--bg0)", boxShadow: "0 0 18px color-mix(in srgb, var(--glow) 70%, transparent)" }}
        >
          TAP TO PLAY
        </button>
      </div>
    </div>
  );
}

/** TikTok-style tutorial: the feed dims, a hand flicks upward with a light streak, twice. */
function SwipeHint() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-[90px] text-white feed-hint-fade"
         style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.6))" }} aria-hidden>
      <div className="relative mb-4 h-[220px] w-[120px]">
        <span className="feed-hint-trail absolute left-1/2 top-1/2 h-[150px] w-2.5 -translate-x-1/2 rounded-full blur-[2px]"
              style={{ background: "linear-gradient(0deg, transparent, rgba(255,255,255,0.75))" }} />
        <svg className="feed-hint-hand absolute left-1/2 top-1/2 -ml-7 drop-shadow-lg" width="56" height="56" viewBox="0 0 24 24" fill="white">
          <path d="M10 2a2 2 0 0 1 2 2v6.1l.5-.1a2 2 0 0 1 1.9 1.3l.1.3.4-.1a2 2 0 0 1 2.3 1.5l.4-.1A2 2 0 0 1 20 15v2.5a6.5 6.5 0 0 1-6.5 6.5h-1.4a6.5 6.5 0 0 1-5.2-2.6l-3-4a2 2 0 0 1 3-2.6L8 15.3V4a2 2 0 0 1 2-2Z" />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-[0.3em] drop-shadow">SWIPE UP</span>
      <span className="text-sm font-medium opacity-80 drop-shadow">for more</span>
    </div>
  );
}

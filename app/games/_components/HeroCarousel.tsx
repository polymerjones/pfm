"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { asset, themeVars, type Game } from "../_lib/catalog";
import type { PositionStore } from "../_lib/position";

/**
 * Console-style hero carousel: one card per swipe (CSS scroll-snap), neighbors tilted, shrunk and
 * dimmed. Every scroll frame writes the fractional position to the shared store and updates the
 * card transforms directly (no React re-render). When scrolling stops, `onLand` reports the
 * centered card; its hero video fades in a beat later, with a big sound toggle if it has audio.
 * Mouse users get click-and-drag (with flick), ‹ › arrows and the ← → keys.
 */
export default function HeroCarousel({
  games,
  startIndex,
  position,
  landed,
  onLand,
  onTapCard,
  controlRef,
  suspended = false,
}: {
  games: Game[];
  startIndex: number;
  position: PositionStore;
  landed: number;
  onLand: (index: number) => void;
  onTapCard: (index: number) => void;
  /** Lets the hub bring a card to center (e.g. from the game rows). */
  controlRef?: MutableRefObject<((index: number, smooth?: boolean) => void) | null>;
  /** Something is covering the hub (feed, game): no hero video. */
  suspended?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const stepTo = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    let settle = 0;
    const step = () => {
      const first = cardRefs.current[0];
      if (!first) return 1;
      const second = cardRefs.current[1];
      return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    };
    const update = () => {
      frame = 0;
      const pos = track.scrollLeft / step();
      position.set(pos);
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const d = index - pos;
        const a = Math.min(Math.abs(d), 1.5);
        card.style.transform = `perspective(900px) rotateY(${-d * 26}deg) scale(${1 - a * 0.1})`;
        card.style.opacity = String(1 - a * 0.45);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => onLand(Math.round(position.get())), 120);
    };
    // Start on the entry game without animating.
    track.scrollLeft = startIndex * step();
    update();
    onLand(startIndex);
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [games, startIndex, position, onLand]);

  // Mouse drag: snapping is paused while dragging, then a flick or the nearest card decides where
  // to land. A drag never counts as a click on the card underneath.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let suppressClick = false;
    let restore = 0;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = lastX = event.clientX;
      startLeft = track.scrollLeft;
      lastT = event.timeStamp;
      velocity = 0;
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        window.clearTimeout(restore);
        track.style.scrollSnapType = "none";
        track.style.cursor = "grabbing";
        track.setPointerCapture(event.pointerId);
      }
      if (!moved) return;
      track.scrollLeft = startLeft - dx;
      const dt = event.timeStamp - lastT;
      if (dt > 0) velocity = (event.clientX - lastX) / dt;
      lastX = event.clientX;
      lastT = event.timeStamp;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      if (!moved) return;
      suppressClick = true;
      track.style.cursor = "";
      const pos = position.get();
      const target = velocity < -0.3 ? Math.ceil(pos) : velocity > 0.3 ? Math.floor(pos) : Math.round(pos);
      const index = Math.max(0, Math.min(games.length - 1, target));
      const first = cardRefs.current[0];
      const card = cardRefs.current[index];
      if (first && card) track.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: "smooth" });
      restore = window.setTimeout(() => (track.style.scrollSnapType = ""), 600);
    };
    const click = (event: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.stopPropagation();
      event.preventDefault();
    };
    track.addEventListener("pointerdown", down);
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    track.addEventListener("click", click, true);
    return () => {
      track.removeEventListener("pointerdown", down);
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", up);
      track.removeEventListener("pointercancel", up);
      track.removeEventListener("click", click, true);
      window.clearTimeout(restore);
    };
  }, [games, position]);

  // ← → step through the cards (not while typing or while something covers the hub).
  useEffect(() => {
    if (suspended) return;
    const key = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      const next = landed + (event.key === "ArrowRight" ? 1 : -1);
      if (next < 0 || next >= games.length) return;
      event.preventDefault();
      stepTo.current(next);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [landed, games.length, suspended]);

  // The landed card's video fades in a beat after settling, so quick swipes never start players.
  useEffect(() => {
    setPlaying(null);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setPlaying(landed), 400);
    return () => window.clearTimeout(timer);
  }, [landed]);

  const scrollTo = (index: number, smooth = true) => {
    const card = cardRefs.current[index];
    const track = trackRef.current;
    if (!card || !track) return;
    track.scrollTo({ left: card.offsetLeft - cardRefs.current[0]!.offsetLeft, behavior: smooth ? "smooth" : "instant" });
  };
  stepTo.current = scrollTo;
  if (controlRef) controlRef.current = scrollTo;

  const arrow = "pointer-only absolute top-1/2 z-10 h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur transition-opacity hover:bg-black/70 disabled:pointer-events-none disabled:opacity-0";
  return (
    <div className="relative">
    <div
      ref={trackRef}
      className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-[14px] overflow-x-auto overscroll-x-contain py-3"
      style={{ paddingInline: "calc((100vw - var(--card-w)) / 2)", scrollPaddingInline: "calc((100vw - var(--card-w)) / 2)" }}
    >
      {games.map((game, index) => (
        <div
          key={game.id}
          ref={(node) => {
            cardRefs.current[index] = node;
          }}
          className="shrink-0 snap-center will-change-transform"
          style={{ width: "var(--card-w)", height: "var(--card-h)" }}
        >
          <HeroCard
            game={game}
            playsVideo={playing === index && !suspended}
            soundOn={soundOn}
            onToggleSound={() => setSoundOn((on) => !on)}
            onTap={() => (index === landed ? onTapCard(index) : scrollTo(index))}
          />
        </div>
      ))}
    </div>
    <button type="button" aria-label="Previous game" disabled={landed <= 0} onClick={() => scrollTo(landed - 1)}
            className={arrow} style={{ left: "max(16px, calc(50% - var(--card-w) / 2 - 88px))" }}>
      <ChevronLeft size={30} strokeWidth={2.5} />
    </button>
    <button type="button" aria-label="Next game" disabled={landed >= games.length - 1} onClick={() => scrollTo(landed + 1)}
            className={arrow} style={{ right: "max(16px, calc(50% - var(--card-w) / 2 - 88px))" }}>
      <ChevronRight size={30} strokeWidth={2.5} />
    </button>
    </div>
  );
}

function HeroCard({
  game,
  playsVideo,
  soundOn,
  onToggleSound,
  onTap,
}: {
  game: Game;
  playsVideo: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onTap: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const video = asset(game.heroVideo);
  const hero = asset(game.hero);

  useEffect(() => {
    if (!playsVideo) setVideoReady(false);
  }, [playsVideo]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={game.name}
      onClick={onTap}
      onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && onTap()}
      className="relative h-full w-full cursor-pointer overflow-hidden rounded-[30px]"
      style={{
        ...themeVars(game.theme),
        border: "1px solid color-mix(in srgb, var(--accent) 45%, transparent)",
        boxShadow: "0 0 34px color-mix(in srgb, var(--glow) 45%, transparent)",
        background: "linear-gradient(180deg, var(--bg0), var(--bg1), var(--bg2))",
      }}
    >
      {hero &&
        (game.heroFit === "fit" ? (
          <div className="absolute inset-0 flex items-center justify-center p-2"
               style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--glow) 55%, transparent), transparent 70%)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero} alt="" className="max-h-full max-w-full object-contain" draggable={false} />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        ))}
      {video && playsVideo && (
        <video
          ref={videoRef}
          src={video}
          autoPlay
          loop
          playsInline
          muted={!soundOn}
          onLoadedMetadata={(event) => {
            const element = event.currentTarget as HTMLVideoElement & { audioTracks?: { length: number }; mozHasAudio?: boolean };
            setHasAudio((element.audioTracks?.length ?? 0) > 0 || Boolean(element.mozHasAudio));
          }}
          onPlaying={() => setVideoReady(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: videoReady ? 1 : 0 }}
        />
      )}
      {game.kind === "sponsor" && (
        <span className="absolute left-3.5 top-3.5 rounded-full border border-white/30 bg-black/55 px-2.5 py-1 text-[11px] font-extrabold tracking-[0.12em] text-white">
          SPONSORED
        </span>
      )}
      {playsVideo && videoReady && hasAudio && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSound();
          }}
          aria-label={soundOn ? "Mute video" : "Turn sound on"}
          className="absolute right-3 top-3 flex h-[58px] w-[58px] items-center justify-center rounded-full border border-white/35 bg-black/55 text-white shadow-lg"
        >
          {soundOn ? <Volume2 size={26} strokeWidth={2.5} /> : <VolumeX size={26} strokeWidth={2.5} />}
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { asset, feedMedia, type Game } from "../_lib/catalog";

const SCREENSHOT_SECONDS = 4;
const HOLD_AFTER_USER = 8;

/**
 * Steam-style media browser: a large viewer, a thumbnail strip, arrows and a position bar. It
 * advances on its own (screenshots every few seconds, a video when it ends) and holds still for a
 * while after the user swipes, taps a thumbnail or uses an arrow. It only autoplays while on screen
 * and not `paused`; only the current item's video is mounted, muted. Tapping opens the feed.
 */
export default function MediaBrowser({ game, paused, onOpen }: { game: Game; paused: boolean; onOpen: (index: number) => void }) {
  const items = feedMedia(game);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const lastUser = useRef(0);
  const programmatic = useRef(false);

  // On screen?
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Keep the viewer and thumbnail strip on the current item.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      programmatic.current = true;
      viewer.scrollTo({ left: index * viewer.clientWidth, behavior: "smooth" });
      window.setTimeout(() => (programmatic.current = false), 500);
    }
    const strip = stripRef.current;
    const thumb = strip?.children[index] as HTMLElement | undefined;
    if (strip && thumb) strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: "smooth" });
  }, [index]);

  // Autoplay screenshots (videos advance when they end).
  useEffect(() => {
    if (!visible || paused || items[index]?.kind === "video") return;
    const timer = window.setTimeout(() => {
      if (performance.now() - lastUser.current > HOLD_AFTER_USER * 1000) setIndex((i) => (i + 1) % items.length);
    }, SCREENSHOT_SECONDS * 1000);
    return () => window.clearTimeout(timer);
  }, [index, visible, paused, items]);

  const userMove = (next: number) => {
    lastUser.current = performance.now();
    setIndex((next + items.length) % items.length);
  };

  // A swipe in the viewer (scroll-snap) updates the index once it settles.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    let settle = 0;
    const onScroll = () => {
      if (programmatic.current) return;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        const next = Math.round(viewer.scrollLeft / viewer.clientWidth);
        if (next !== index) userMove(next);
      }, 120);
    };
    viewer.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      viewer.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
    };
  });

  if (!items.length) return null;

  return (
    <section ref={rootRef} className="flex flex-col gap-2.5" aria-label={`${game.name} screenshots and video`}>
      {/* Desktop: a widescreen viewer with hover arrows and arrow-key control (Steam style). */}
      <div
        className="group relative outline-none"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") userMove(index - 1);
          if (event.key === "ArrowRight") userMove(index + 1);
        }}
      >
      <div
        ref={viewerRef}
        className="no-scrollbar flex h-[min(540px,70svh)] snap-x snap-mandatory overflow-x-auto rounded-[20px] border lg:aspect-video lg:h-auto"
        style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onOpen(i)}
            className="relative flex h-full w-full shrink-0 snap-center items-center justify-center overflow-hidden"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--glow) 45%, transparent), var(--bg0) 75%)" }}
            aria-label={`Open item ${i + 1} of ${items.length} full screen`}
          >
            {/* Desktop fills the wide frame with a soft, blurred copy of the current item (static: no per-frame cost). */}
            {i === index && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(item.kind === "video" ? item.poster : item.asset)} alt="" aria-hidden
                   className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-40 blur-2xl lg:block" />
            )}
            {item.kind === "video" && i === index && visible && !paused ? (
              <video
                src={asset(item.asset)}
                poster={asset(item.poster)}
                autoPlay
                muted
                playsInline
                onEnded={() => performance.now() - lastUser.current > HOLD_AFTER_USER * 1000 && setIndex((index + 1) % items.length)}
                className="relative h-full w-full object-contain py-2.5"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset(item.kind === "video" ? item.poster : item.asset)}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="relative h-full w-full object-contain py-2.5"
                draggable={false}
              />
            )}
          </button>
        ))}
      </div>
      {items.length > 1 && (["prev", "next"] as const).map((side) => (
        <button
          key={side}
          type="button"
          onClick={() => userMove(index + (side === "next" ? 1 : -1))}
          aria-label={side === "next" ? "Next" : "Previous"}
          className={"absolute top-1/2 hidden h-14 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 lg:flex " +
            (side === "next" ? "right-3" : "left-3")}
        >
          {side === "next" ? <ChevronRight size={28} strokeWidth={2.5} /> : <ChevronLeft size={28} strokeWidth={2.5} />}
        </button>
      ))}
      </div>

      <div ref={stripRef} className="no-scrollbar flex gap-2 overflow-x-auto py-0.5">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => userMove(i)}
            className="relative h-[100px] w-[52px] shrink-0 overflow-hidden rounded-lg border-2 transition-opacity lg:h-[120px] lg:w-[64px]"
            style={{ borderColor: i === index ? "var(--accent)" : "transparent", opacity: i === index ? 1 : 0.55 }}
            aria-label={`Show item ${i + 1}`}
            aria-current={i === index}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(item.kind === "video" ? item.poster : item.asset)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            {item.kind === "video" && <Play size={22} className="absolute inset-0 m-auto fill-white text-white" />}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <button type="button" onClick={() => userMove(index - 1)} aria-label="Previous"
                className="flex h-[30px] w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)" }}>
          <ChevronLeft size={18} strokeWidth={3} />
        </button>
        <div className="relative h-[5px] flex-1 overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}>
          <div className="absolute inset-y-0 rounded-full transition-transform duration-300"
               style={{ width: `${100 / items.length}%`, transform: `translateX(${index * 100}%)`, background: "var(--accent)" }} />
        </div>
        <button type="button" onClick={() => userMove(index + 1)} aria-label="Next"
                className="flex h-[30px] w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)" }}>
          <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>
    </section>
  );
}

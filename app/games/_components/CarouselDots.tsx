"use client";

import { useEffect, useRef } from "react";
import type { Game } from "../_lib/catalog";
import type { PositionStore } from "../_lib/position";

/**
 * Page dots under the hero carousel: the plain "there's more sideways" signal. The dot nearest the
 * finger stretches into a pill in the live accent color, tracking the scroll position each frame
 * (written straight to the DOM, no re-render). Tapping a dot brings that game to the center.
 */
export default function CarouselDots({ games, position, onSelect }: { games: Game[]; position: PositionStore; onSelect: (index: number) => void }) {
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(
    () =>
      position.subscribe((pos) => {
        dotRefs.current.forEach((dot, index) => {
          if (!dot) return;
          const active = Math.max(0, 1 - Math.abs(index - pos));
          dot.style.width = `${7 + 15 * active}px`;
          dot.style.background = `color-mix(in srgb, var(--accent) ${Math.round(active * 100)}%, rgba(255,255,255,0.35))`;
          dot.style.boxShadow = active > 0.5 ? `0 0 8px color-mix(in srgb, var(--accent) ${Math.round(active * 70)}%, transparent)` : "none";
          dot.setAttribute("aria-current", String(active > 0.5));
        });
      }),
    [position],
  );

  return (
    <div className="-mt-1 flex justify-center gap-[7px]" role="group" aria-label="Choose a game">
      {games.map((game, index) => (
        <button
          key={game.id}
          ref={(node) => {
            dotRefs.current[index] = node;
          }}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={game.name}
          className="relative h-[7px] w-[7px] rounded-full before:absolute before:-inset-2.5 before:content-['']"
          style={{ background: "rgba(255,255,255,0.35)" }}
        />
      ))}
    </div>
  );
}

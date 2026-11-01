"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { asset, type Game } from "../_lib/catalog";
import type { PositionStore } from "../_lib/position";

/**
 * Under the hero: each game's wordmark, then icon, tagline and actions. Every game's strip is
 * stacked in place and slides/fades with the carousel position (updated directly per frame).
 */
export default function IdentityStrip({
  games,
  position,
  actions,
}: {
  games: Game[];
  position: PositionStore;
  actions: (game: Game) => ReactNode;
}) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(
    () =>
      position.subscribe((pos) => {
        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const distance = index - pos;
          const visibility = Math.max(0, 1 - Math.abs(distance) * 1.8);
          item.style.opacity = String(visibility);
          item.style.transform = `translateX(${distance * 90}px)`;
          item.style.visibility = visibility > 0 ? "visible" : "hidden";
          item.style.pointerEvents = visibility > 0.5 ? "auto" : "none";
          item.setAttribute("aria-hidden", String(visibility < 0.5));
        });
      }),
    [position],
  );

  return (
    <div className="grid px-5">
      {games.map((game, index) => (
        <div
          key={game.id}
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
          className="col-start-1 row-start-1 flex flex-col items-center gap-3 will-change-transform"
        >
          {game.titleLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset(game.titleLogo)}
              alt={game.name}
              className="w-auto object-contain"
              style={{ height: 54 * (game.titleScale ?? 1), filter: "drop-shadow(0 0 12px var(--glow-soft))" }}
              draggable={false}
            />
          ) : (
            <h2 className="text-[32px] font-bold uppercase" style={{ color: "var(--text)" }}>
              {game.name}
            </h2>
          )}
          {game.kind === "sponsor" && (
            <div className="-mt-1 text-xs font-semibold" style={{ color: "color-mix(in srgb, var(--text) 60%, transparent)" }}>
              Sponsored · Also by Polymer Jones
            </div>
          )}
          {game.kind === "inDevelopment" && (
            <div className="-mt-1 text-xs font-bold tracking-[0.2em]" style={{ color: "var(--accent)" }}>
              IN DEVELOPMENT · NEXT FROM POLYMER JONES
            </div>
          )}
          <div className="flex w-full max-w-[560px] items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {game.icon && <img src={asset(game.icon)} alt="" className="h-14 w-14 rounded-[15px] border border-white/20 shadow-lg" />}
            <p className="min-w-0 flex-1 text-[15px] font-medium leading-snug" style={{ color: "color-mix(in srgb, var(--text) 75%, transparent)" }}>
              {game.tagline}
            </p>
            {actions(game)}
          </div>
        </div>
      ))}
    </div>
  );
}

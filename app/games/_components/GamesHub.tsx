"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { appStoreURL, blendedTheme, featuredID, games, playStoreURL, rgb, TIP_GOAL, TIP_URL, type Game } from "../_lib/catalog";
import { initialTier, type Tier } from "../_lib/perf";
import { createPositionStore } from "../_lib/position";
import Header from "./Header";
import HeroCarousel from "./HeroCarousel";
import { DetailPanel, GameRows, SponsorPanel, SupportCard } from "./Details";
import IdentityStrip from "./IdentityStrip";
import { GameActions } from "./StoreButtons";
import ThemeStage from "./ThemeStage";

// Loaded on first use (and prefetched when the page is idle), so it costs nothing up front.
const loadFeed = () => import("./MediaFeed");
const MediaFeed = dynamic(loadFeed, { ssr: false });

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif';

/**
 * The games hub. The carousel's fractional position drives the light per-frame visuals (layer
 * crossfade, a few text colors, card tilt, title strip) without React re-renders; `landed` (the
 * card the carousel came to rest on) drives everything heavier.
 */
export default function GamesHub() {
  const startIndex = Math.max(0, games.findIndex((game) => game.id === featuredID && game.kind !== "sponsor"));
  const position = useMemo(() => createPositionStore(startIndex), [startIndex]);
  const rootRef = useRef<HTMLDivElement>(null);
  const [landed, setLanded] = useState(startIndex);
  const [tier, setTier] = useState<Tier>("medium");
  const carousel = useRef<((index: number, smooth?: boolean) => void) | null>(null);
  const landedGame = games[landed] ?? games[0];
  const [feed, setFeed] = useState<{ game: Game; start: number } | null>(null);

  useEffect(() => setTier(initialTier()), []);

  // Coming back from a game page (/games?game=<id>) lands on that game.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("game");
    const index = games.findIndex((game) => game.id === id);
    if (index >= 0 && index !== startIndex) carousel.current?.(index, false);
  }, [startIndex]);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 1500));
    idle(() => void loadFeed());
  }, []);

  // Tapping the centered hero: a game opens its media feed; a sponsor goes to its store.
  const tapHero = (index: number) => {
    const game = games[index];
    if (game.kind === "sponsor") {
      const url = appStoreURL(game) ?? playStoreURL(game) ?? game.link;
      if (url) window.open(url, "_blank", "noopener");
      return;
    }
    setFeed({ game, start: 0 });
  };

  // The few colors that follow the finger: header/strip text and accents (small areas only).
  useEffect(
    () =>
      position.subscribe((pos) => {
        const root = rootRef.current;
        if (!root) return;
        const theme = blendedTheme(games, pos);
        root.style.setProperty("--bg0", rgb(theme.background[0]));
        root.style.setProperty("--accent", rgb(theme.accent));
        root.style.setProperty("--text", rgb(theme.text));
        root.style.setProperty("--glow-soft", rgb(theme.glow, 0.6));
      }),
    [position],
  );

  return (
    <div
      ref={rootRef}
      className="games-hub relative isolate z-[1] min-h-[100svh] text-white"
      style={{ fontFamily: SYSTEM_FONT, ["--card-w" as string]: "min(72vw, 380px)", ["--card-h" as string]: "min(56svh, 620px)" }}
    >
      <ThemeStage games={games} position={position} tier={tier} paused={feed !== null} />
      <Header onSupport={TIP_URL ? () => document.getElementById("support")?.scrollIntoView({ behavior: "smooth" }) : undefined} />
      <div className="flex flex-col gap-5 pb-16">
        <HeroCarousel
          games={games}
          startIndex={startIndex}
          position={position}
          landed={landed}
          onLand={setLanded}
          onTapCard={tapHero}
          controlRef={carousel}
          suspended={feed !== null}
        />
        <IdentityStrip games={games} position={position} actions={(game) => <GameActions game={game} />} />
        {/* Only the landed game's details exist; they crossfade in when a card comes to rest. */}
        <div key={landedGame.id} className="hub-fade px-4">
          {landedGame.kind === "sponsor" ? <SponsorPanel game={landedGame} /> : <DetailPanel game={landedGame} paused={feed !== null} onOpenFeed={(start) => setFeed({ game: landedGame, start })} />}
        </div>
        <div className="pt-3">
          <GameRows
            games={games}
            onSelect={(game) => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              carousel.current?.(games.indexOf(game));
            }}
          />
        </div>
        {TIP_URL && <SupportCard tipURL={TIP_URL} goal={TIP_GOAL} />}
      </div>
      {feed && <MediaFeed game={feed.game} start={feed.start} onClose={() => setFeed(null)} />}
    </div>
  );
}

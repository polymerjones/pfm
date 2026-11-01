"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { asset, playables, themeVars, type Game } from "../_lib/catalog";
import MediaBrowser from "./MediaBrowser";
import { GameActions, StoreButtons } from "./StoreButtons";

const panel = "rounded-[22px] border p-4 backdrop-blur-md";
const panelStyle = {
  borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
  background: "color-mix(in srgb, var(--bg1) 55%, transparent)",
};

function Chip({ children, emphasized = false }: { children: React.ReactNode; emphasized?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold"
      style={{
        color: emphasized ? "var(--secondary)" : "color-mix(in srgb, var(--text) 85%, transparent)",
        borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
        background: `color-mix(in srgb, var(--accent) ${emphasized ? 18 : 10}%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

/**
 * What sits under the hero for the landed game. Phones: fact chips, store buttons, About, then the
 * media browser. Desktop (lg+): a Steam store-page layout, the media browser on the left and a
 * sidebar on the right with the capsule art, summary, developer/platform details, tags and stores.
 * (A reviews section returns once there are real ratings.)
 */
export function DetailPanel({ game, paused, onOpenFeed }: { game: Game; paused: boolean; onOpenFeed: (index: number) => void }) {
  const [more, setMore] = useState(false);
  const platforms = ["iPhone", ...(game.playStoreID ? ["Android"] : []), ...(playables(game).some((ref) => ref.url) ? ["Web"] : [])];
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6"
         style={{ ...themeVars(game.theme), color: "var(--text)" }}>
      <div className="order-2 lg:order-1">
        <MediaBrowser game={game} paused={paused} onOpen={onOpenFeed} />
      </div>

      <aside className="order-1 flex flex-col gap-4 lg:order-2">
        {game.capsule && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(game.capsule)} alt="" loading="lazy" decoding="async"
               className="hidden aspect-[2.33] w-full rounded-2xl border object-cover lg:order-1 lg:block"
               style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }} />
        )}

        {/* Reviews appear once there are real ratings; until then just the game's facts. */}
        <div className="flex flex-wrap gap-2 lg:order-3">
          {(game.accolades ?? []).map((accolade) => (
            <Chip key={accolade} emphasized><Trophy size={13} />{accolade}</Chip>
          ))}
          {(game.highlights ?? []).map((highlight) => <Chip key={highlight}>{highlight}</Chip>)}
        </div>

        <div className="lg:order-4">
          <StoreButtons game={game} size="wide" />
        </div>
        {/* Tapping anywhere on the box expands it; the extra text eases in (opacity + transform only). */}
        <section
          className={panel + " lg:order-2" + (game.about ? " cursor-pointer" : "")}
          style={panelStyle}
          onClick={() => game.about && setMore((m) => !m)}
          onKeyDown={(event) => game.about && (event.key === "Enter" || event.key === " ") && (event.preventDefault(), setMore((m) => !m))}
          role={game.about ? "button" : undefined}
          tabIndex={game.about ? 0 : undefined}
          aria-expanded={game.about ? more : undefined}
        >
          <h3 className="mb-2 text-[19px] font-bold">About</h3>
          <p className="text-[15px] leading-relaxed opacity-90">{game.summary}</p>
          {more && game.about && <p className="about-reveal mt-2.5 text-[15px] leading-relaxed opacity-90">{game.about}</p>}
          {game.about && (
            <span className="mt-2 inline-block text-sm font-semibold" style={{ color: "var(--accent)" }}>
              {more ? "Less" : "More"}
            </span>
          )}
          <dl className="mt-3.5 hidden grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px] lg:grid">
            <dt className="opacity-55">DEVELOPER</dt>
            <dd style={{ color: "var(--accent)" }}>Polymer Jones</dd>
            <dt className="opacity-55">PLATFORMS</dt>
            <dd>{platforms.join(" · ")}</dd>
            <dt className="opacity-55">STATUS</dt>
            <dd>{game.status === "released" ? "Available now" : "Coming soon"}</dd>
          </dl>
        </section>

      </aside>
    </div>
  );
}

/** A sponsor's unfolded panel: its pitch and store button only, so an ad never looks like a game. */
export function SponsorPanel({ game }: { game: Game }) {
  return (
    <div className={panel + " mx-auto flex w-full max-w-[1180px] flex-col gap-3.5"} style={{ ...themeVars(game.theme), ...panelStyle, color: "var(--text)" }}>
      <span className="w-fit rounded-full border border-white/30 bg-black/55 px-2.5 py-1 text-[11px] font-extrabold tracking-[0.12em] text-white">
        SPONSORED
      </span>
      <p className="text-[15px] leading-relaxed opacity-90">{game.summary}</p>
      <StoreButtons game={game} size="wide" />
    </div>
  );
}

/** Steam-style rows: wide capsule art per game, with TRY IT + store where Steam shows the price. */
export function GameRows({ games, onSelect }: { games: Game[]; onSelect: (game: Game) => void }) {
  return (
    <section aria-labelledby="all-games" className="mx-auto flex w-full max-w-[1180px] flex-col gap-3">
      <div className="px-5">
        <h2 id="all-games" className="text-[20px] font-semibold tracking-[0.3em]" style={{ color: "var(--text)" }}>ALL GAMES</h2>
        <p className="text-sm" style={{ color: "color-mix(in srgb, var(--text) 60%, transparent)" }}>By Polymer Jones</p>
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 pb-2" style={{ scrollPaddingInline: 20 }}>
        {games.filter((game) => game.kind !== "sponsor").map((game) => (
          <article
            key={game.id}
            className="w-[84vw] max-w-[440px] shrink-0 snap-start overflow-hidden rounded-2xl border"
            style={{ ...themeVars(game.theme), borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)", color: "var(--text)" }}
          >
            <button type="button" onClick={() => onSelect(game)} className="block aspect-[2.33] w-full overflow-hidden" aria-label={`Show ${game.name}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(game.capsule ?? game.hero)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
            <div className="flex items-center gap-2.5 p-3" style={{ background: "var(--bg1)" }}>
              {game.titleLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset(game.titleLogo)} alt={game.name} loading="lazy" decoding="async"
                     className="min-w-0 flex-1 object-contain object-left" style={{ height: 34 * (game.titleScale ?? 1) }} />
              ) : (
                <span className="min-w-0 flex-1 truncate text-lg font-bold">{game.name}</span>
              )}
              <GameActions game={game} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


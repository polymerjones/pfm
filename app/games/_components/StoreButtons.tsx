"use client";

import Link from "next/link";
import { Clock, Download, Gamepad2 } from "lucide-react";
import { appStoreURL, playables, playStoreURL, type Game } from "../_lib/catalog";
import { usePlatform } from "../_lib/platform";

type Store = "apple" | "google";
type Size = "compact" | "stacked" | "wide";

const storeName: Record<Store, string> = { apple: "App Store", google: "Google Play" };

/**
 * One store pill: "Get it on the App Store" / "Get it on Google Play", or a dimmed "Coming soon"
 * while the game isn't live there. Colors come from the nearest theme variables (--accent, --bg0).
 */
export function StoreButton({ game, store, size = "compact" }: { game: Game; store: Store; size?: Size }) {
  const url = store === "apple" ? appStoreURL(game) : playStoreURL(game);
  const live = game.status === "released" && url;
  const big = size === "wide";
  const body = (
    <>
      {live ? <Download size={big ? 20 : 16} strokeWidth={2.5} /> : <Clock size={big ? 20 : 16} strokeWidth={2.5} />}
      <span className="flex flex-col items-start leading-[1.05]">
        <span className={big ? "text-[11px] font-medium" : "text-[10px] font-medium"}>
          {live ? (store === "apple" ? "Get it on the" : "Get it on") : "Coming soon"}
        </span>
        <span className={big ? "text-[19px] font-bold" : "text-[15px] font-bold"}>{storeName[store]}</span>
      </span>
    </>
  );
  const className =
    "flex items-center justify-center gap-2 rounded-full transition-transform active:scale-95 " +
    (big ? "px-6 py-3 w-full " : "px-3.5 py-[7px] ") +
    (size === "stacked" ? "w-full min-h-[40px] " : "") +
    (live ? "" : "opacity-60 ");
  const style = {
    color: "var(--bg0)",
    background: "var(--accent)",
    boxShadow: "0 0 14px color-mix(in srgb, var(--accent) 45%, transparent)",
  };
  return live ? (
    <a href={url} target="_blank" rel="noopener" className={className} style={style}
       aria-label={`Get ${game.name} on ${storeName[store]}`}>
      {body}
    </a>
  ) : (
    <span className={className} style={style} aria-label={`${game.name} is coming soon to ${storeName[store]}`}>
      {body}
    </span>
  );
}

/** The store pill(s) for this visitor's device: one on phones, both on desktop. */
export function StoreButtons({ game, size = "compact" }: { game: Game; size?: Size }) {
  const platform = usePlatform();
  const stores: Store[] =
    platform === "ios" ? ["apple"] : platform === "android" ? ["google"] : ["apple", "google"];
  // A game that isn't on Google Play at all shows only the App Store, and vice versa.
  const available = stores.filter((store) => (store === "apple" ? game.appStoreID || game.status !== "released" : game.playStoreID || game.status !== "released"));
  const list = available.length ? available : stores.slice(0, 1);
  if (size === "wide") {
    return (
      <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:flex-col">
        {list.map((store) => <StoreButton key={store} game={game} store={store} size="wide" />)}
      </div>
    );
  }
  return <StoreButton game={game} store={list[0]} size={size} />;
}

/**
 * A game's two actions stacked as a pair: TRY IT (its page, where the real game plays) over the
 * store pill. Sponsors and games without anything playable show just the store pill.
 */
export function GameActions({ game }: { game: Game }) {
  if (game.kind === "sponsor" || !playables(game).length) return <StoreButtons game={game} />;
  return (
    <div className="flex w-[136px] shrink-0 flex-col gap-1.5">
      <Link
        href={`/games/${game.id}`}
        prefetch={false}
        className="flex min-h-[40px] items-center justify-center gap-2 rounded-full border-[1.5px] text-[15px] font-bold tracking-[0.12em] transition-transform active:scale-95"
        style={{ color: "var(--accent)", borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}
        aria-label={`Try ${game.name}`}
      >
        <Gamepad2 size={18} strokeWidth={2.5} />
        TRY IT
      </Link>
      <StoreButtons game={game} size="stacked" />
    </div>
  );
}

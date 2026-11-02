"use client";

import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { appStoreURL, playables, playStoreURL, type Game } from "../_lib/catalog";
import { usePlatform } from "../_lib/platform";

type Store = "apple" | "google";
type Size = "compact" | "stacked" | "wide";

const storeName: Record<Store, string> = { apple: "App Store", google: "Google Play" };

// The stores' official badges, unaltered (Apple's from developer.apple.com, Google's from
// play.google.com with its transparent margin trimmed), shown at equal heights.
const badge: Record<Store, { src: string; ratio: number }> = {
  apple: { src: "/games/img/badges/app-store.svg", ratio: 119.664 / 40 },
  google: { src: "/games/img/badges/google-play.webp", ratio: 564 / 168 },
};
const badgeHeight: Record<Size, number> = { compact: 36, stacked: 40, wide: 52 };

/**
 * One store badge linking to the game's store page, or, while the game isn't live there yet, a
 * plain "Coming soon" chip in the theme colors (the badges themselves mustn't be dimmed or altered).
 */
export function StoreButton({ game, store, size = "compact" }: { game: Game; store: Store; size?: Size }) {
  const url = store === "apple" ? appStoreURL(game) : playStoreURL(game);
  const height = badgeHeight[size];
  if (url) {
    const { src, ratio } = badge[store];
    return (
      <a href={url} target="_blank" rel="noopener" className="shrink-0 self-center transition-transform active:scale-95"
         aria-label={`Get ${game.name} on ${storeName[store]}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static badge, no resizing needed */}
        <img src={src} alt={`Get it on ${storeName[store]}`} width={Math.round(height * ratio)} height={height} draggable={false} />
      </a>
    );
  }
  return (
    <span
      className={"flex items-center justify-center rounded-full border-[1.5px] px-3.5 leading-[1.05] opacity-80 " + (size === "stacked" ? "w-full " : "")}
      style={{ height, color: "var(--accent)", borderColor: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
      aria-label={`${game.name} is coming soon to ${storeName[store]}`}
    >
      <span className="flex flex-col items-center">
        <span className="text-[10px] font-medium">Coming soon</span>
        <span className={"whitespace-nowrap font-bold " + (size === "wide" ? "text-[17px]" : "text-[14px]")}>{storeName[store]}</span>
      </span>
    </span>
  );
}

/**
 * The store badges on every device, this visitor's own store first (App Store on iPhone/desktop,
 * Google Play on Android). Wide and stacked show them all; compact shows the first one that's live.
 */
export function StoreButtons({ game, size = "compact" }: { game: Game; size?: Size }) {
  const platform = usePlatform();
  const stores: Store[] = platform === "android" ? ["google", "apple"] : ["apple", "google"];
  const storeID = (store: Store) => (store === "apple" ? game.appStoreID : game.playStoreID);
  // A released game that isn't on a store at all leaves that store out instead of "Coming soon".
  const available = stores.filter((store) => storeID(store) || game.status !== "released");
  const list = available.length ? available : stores.slice(0, 1);
  if (size === "wide") {
    return (
      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        {list.map((store) => <StoreButton key={store} game={game} store={store} size="wide" />)}
      </div>
    );
  }
  if (size === "stacked") {
    return <>{list.map((store) => <StoreButton key={store} game={game} store={store} size="stacked" />)}</>;
  }
  return <StoreButton game={game} store={list.find(storeID) ?? list[0]} size={size} />;
}

/**
 * A game's actions stacked in a column: TRY IT (its page, where the real game plays) over the
 * store badges. Sponsors and games without anything playable show just the store badge.
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

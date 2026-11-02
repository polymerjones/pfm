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
  // Each store goes live on its own: a listed ID means the store page is up.
  const live = Boolean(url);
  const big = size === "wide";
  const stacked = size === "stacked";
  const body = (
    <>
      {live ? <Download size={big ? 20 : 16} strokeWidth={2.5} /> : <Clock size={big ? 20 : 16} strokeWidth={2.5} />}
      <span className="flex flex-col items-start leading-[1.05]">
        <span className={big ? "text-[11px] font-medium" : "text-[10px] font-medium"}>
          {live ? (store === "apple" ? "Get it on the" : "Get it on") : "Coming soon"}
        </span>
        <span className={"whitespace-nowrap font-bold " + (big ? "text-[19px]" : stacked ? "text-[14px]" : "text-[15px]")}>{storeName[store]}</span>
      </span>
    </>
  );
  const className =
    "flex items-center justify-center rounded-full transition-transform active:scale-95 " +
    (big ? "gap-2 px-6 py-3 w-full " : stacked ? "gap-1.5 px-2 py-[7px] w-full min-h-[40px] " : "gap-2 px-3.5 py-[7px] ") +
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

/**
 * The store pills on every device, this visitor's own store first (App Store on iPhone/desktop,
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
      <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:flex-col">
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
 * store pills. Sponsors and games without anything playable show just the store pill.
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

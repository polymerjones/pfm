"use client";

import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { appStoreURL, playables, playStoreURL, type Game } from "../_lib/catalog";
import { usePlatform } from "../_lib/platform";

type Store = "apple" | "google";
type Size = "compact" | "stacked" | "wide";

const storeName: Record<Store, string> = { apple: "App Store", google: "Google Play" };

// The stores' own marks (Apple logo, Google Play triangle), from Simple Icons, drawn in currentColor.
const storeLogo: Record<Store, string> = {
  apple:
    "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  google:
    "M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z",
};

function StoreLogo({ store, size }: { store: Store; size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden className="shrink-0">
      <path d={storeLogo[store]} />
    </svg>
  );
}

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
      <StoreLogo store={store} size={big ? 20 : 16} />
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

// The games hub's catalog: the same games.json the iPhone hub ships, plus a name → URL asset
// manifest. Adding a game = a catalog entry + its art; the UI adapts to whatever is listed.
import catalogJson from "../_data/games.json";
import assetsJson from "../_data/assets.json";

export type Hex = string;

export type GameTheme = {
  background: [Hex, Hex, Hex];
  accent: Hex;
  glow: Hex;
  secondary: Hex;
  text: Hex;
  scene: "jungle" | "cosmic";
  titleFont?: string;
};

export type MediaItem = {
  kind: "image" | "video";
  asset: string;
  poster?: string;
  /** The game being played (vs. menus, rewards). Feeds always open on gameplay. */
  gameplay?: boolean;
};

export type MiniGameRef = {
  id: string;
  title: string;
  blurb?: string;
  /** The game's real web build, played in place. */
  url?: string;
  /** Appended to `url` once the game supports the hub's skip-intro flag (e.g. "embed"). */
  embedFlag?: string;
  leaderboardID?: string;
};

export type Game = {
  id: string;
  kind?: "game" | "sponsor" | "inDevelopment";
  name: string;
  titleLogo?: string;
  titleScale?: number;
  tagline: string;
  summary: string;
  about?: string;
  highlights?: string[];
  accolades?: string[];
  icon?: string;
  hero?: string;
  heroFit?: "fill" | "fit";
  heroVideo?: string;
  trailer?: string;
  capsule?: string;
  media?: MediaItem[];
  miniGames?: MiniGameRef[];
  appStoreID?: string;
  playStoreID?: string;
  link?: string;
  status: "released" | "comingSoon" | "hidden";
  theme: GameTheme;
};

type Catalog = { version: number; featured?: string; games: Game[] };

const catalog = catalogJson as unknown as Catalog;
const assets = assetsJson as Record<string, string>;

export const featuredID = catalog.featured;
export const games: Game[] = catalog.games.filter((game) => game.status !== "hidden");
export const playableGames = games.filter((game) => game.kind !== "sponsor" && game.kind !== "inDevelopment");

export function gameByID(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}

/** Hub mini-games that have a finished web version. Others stay in the catalog but out of sight
 *  (no "coming soon" placeholders on the site) until they're added here. */
const WEB_MINI_GAMES = new Set<string>([]);

/** What a visitor can actually play right now: the real game, plus any finished hub mini-games. */
export function playables(game: Game): MiniGameRef[] {
  return (game.miniGames ?? []).filter((ref) => ref.url || WEB_MINI_GAMES.has(ref.id));
}

// Tips and the Next Game Fund live in fund-config.ts (kept apart so the site-wide footer can use
// them without pulling in the whole catalog).
export { TIP_URL, TIP_GOAL } from "./fund-config";

/** Public URL for a catalog asset name (image or video). */
export function asset(name?: string): string | undefined {
  return name ? assets[name] : undefined;
}

/** Hard rule: gameplay comes first, so a feed never opens on a menu or level-select screen. */
export function feedMedia(game: Game): MediaItem[] {
  const media = game.media ?? [];
  return [...media.filter((item) => item.gameplay), ...media.filter((item) => !item.gameplay)];
}

export function appStoreURL(game: Game): string | undefined {
  return game.appStoreID ? `https://apps.apple.com/app/id${game.appStoreID}` : undefined;
}

export function playStoreURL(game: Game): string | undefined {
  return game.playStoreID ? `https://play.google.com/store/apps/details?id=${game.playStoreID}` : undefined;
}

/** The URL TRY IT loads: the live game, with the skip-intro flag when the game supports it. */
export function playURL(ref: MiniGameRef): string | undefined {
  if (!ref.url) return undefined;
  if (!ref.embedFlag) return ref.url;
  return ref.url + (ref.url.includes("?") ? "&" : "?") + ref.embedFlag;
}

// MARK: Colors

export type RGB = [number, number, number];

export function hexToRGB(hex: Hex): RGB {
  const value = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export type BlendedTheme = {
  background: [RGB, RGB, RGB];
  accent: RGB;
  glow: RGB;
  secondary: RGB;
  text: RGB;
};

function resolve(theme: GameTheme): BlendedTheme {
  return {
    background: theme.background.map(hexToRGB) as [RGB, RGB, RGB],
    accent: hexToRGB(theme.accent),
    glow: hexToRGB(theme.glow),
    secondary: hexToRGB(theme.secondary),
    text: hexToRGB(theme.text),
  };
}

/** The theme at a fractional carousel position (0.3 = 70% first game, 30% second). */
export function blendedTheme(list: Game[], position: number): BlendedTheme {
  const clamped = Math.min(Math.max(position, 0), list.length - 1);
  const index = Math.floor(clamped);
  const next = Math.min(index + 1, list.length - 1);
  const a = resolve(list[index].theme);
  if (index === next) return a;
  const b = resolve(list[next].theme);
  const t = clamped - index;
  return {
    background: [0, 1, 2].map((i) => mix(a.background[i], b.background[i], t)) as [RGB, RGB, RGB],
    accent: mix(a.accent, b.accent, t),
    glow: mix(a.glow, b.glow, t),
    secondary: mix(a.secondary, b.secondary, t),
    text: mix(a.text, b.text, t),
  };
}

/** How much of game `index` is showing at `position` (1 = centered, 0 = a card away or more). */
export function weight(index: number, position: number): number {
  return Math.max(0, 1 - Math.abs(position - index));
}

export const rgb = (c: RGB, alpha = 1) =>
  `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${alpha})`;

/** Static CSS variables for one game's own theme (tiles, pages): --accent, --glow, … */
export function themeVars(theme: GameTheme): Record<string, string> {
  const t = resolve(theme);
  return {
    "--bg0": rgb(t.background[0]),
    "--bg1": rgb(t.background[1]),
    "--bg2": rgb(t.background[2]),
    "--accent": rgb(t.accent),
    "--glow": rgb(t.glow),
    "--secondary": rgb(t.secondary),
    "--text": rgb(t.text),
  };
}

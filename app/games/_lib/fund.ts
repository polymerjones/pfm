import { Redis } from "@upstash/redis";
import { TIP_GOAL, type FundSnapshot } from "./fund-config";

/**
 * Server-side store for the Next Game Fund: one Redis hash of every Ko-fi payment the webhook has
 * seen, plus a vote tally. The total is summed from the entries, so deleting a test payment in
 * /games/mod takes it off the bar too. Without Redis credentials (local runs) it falls back to an
 * in-memory store; on Vercel it refuses to, so a missing integration fails loudly instead.
 */

export type EntryStatus = "pending" | "approved" | "hidden" | "private";
export type Entry = {
  id: string;
  name: string;
  cents: number;
  message: string;
  public: boolean;
  at: number;
  status: EntryStatus;
  type: string;
  vote?: string;
};

const ENTRIES = "fund:entries";
const VOTES = "fund:votes";

type Store = {
  claim(id: string): Promise<boolean>;
  put(entry: Entry): Promise<void>;
  all(): Promise<Entry[]>;
  remove(id: string): Promise<void>;
  votes(): Promise<Record<string, number>>;
  addVote(key: string, by: number): Promise<void>;
  setVote(key: string, count: number): Promise<void>;
};

function redisStore(redis: Redis): Store {
  return {
    async claim(id) {
      return (await redis.set(`fund:tx:${id}`, 1, { nx: true, ex: 60 * 60 * 24 * 90 })) === "OK";
    },
    async put(entry) {
      await redis.hset(ENTRIES, { [entry.id]: JSON.stringify(entry) });
    },
    async all() {
      const raw = (await redis.hgetall<Record<string, Entry | string>>(ENTRIES)) ?? {};
      return Object.values(raw).map((value) => (typeof value === "string" ? (JSON.parse(value) as Entry) : value));
    },
    async remove(id) {
      await redis.hdel(ENTRIES, id);
    },
    async votes() {
      const raw = (await redis.hgetall<Record<string, number | string>>(VOTES)) ?? {};
      return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Number(value) || 0]));
    },
    async addVote(key, by) {
      await redis.hincrby(VOTES, key, by);
    },
    async setVote(key, count) {
      await redis.hset(VOTES, { [key]: count });
    },
  };
}

function memoryStore(): Store {
  const g = globalThis as unknown as { __fund?: { tx: Set<string>; entries: Map<string, Entry>; votes: Map<string, number> } };
  const mem = (g.__fund ??= { tx: new Set(), entries: new Map(), votes: new Map() });
  return {
    async claim(id) {
      if (mem.tx.has(id)) return false;
      mem.tx.add(id);
      return true;
    },
    async put(entry) {
      mem.entries.set(entry.id, entry);
    },
    async all() {
      return [...mem.entries.values()];
    },
    async remove(id) {
      mem.entries.delete(id);
    },
    async votes() {
      return Object.fromEntries(mem.votes);
    },
    async addVote(key, by) {
      mem.votes.set(key, (mem.votes.get(key) ?? 0) + by);
    },
    async setVote(key, count) {
      mem.votes.set(key, count);
    },
  };
}

let cached: Store | undefined;
export function store(): Store {
  if (cached) return cached;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return (cached = redisStore(new Redis({ url, token })));
  if (process.env.VERCEL) throw new Error("Next Game Fund: Redis isn't configured (KV_REST_API_URL / KV_REST_API_TOKEN).");
  return (cached = memoryStore());
}

/** The public view: total, approved names and messages, votes. Private donors appear as ANONYMOUS. */
export async function snapshot(): Promise<FundSnapshot> {
  const [entries, votes] = await Promise.all([store().all(), store().votes()]);
  entries.sort((a, b) => b.at - a.at);

  const cents = entries.reduce((sum, entry) => sum + entry.cents, 0);
  const shown = entries.filter((entry) => entry.status === "approved" || entry.status === "private");
  const display = (entry: Entry) => (entry.status === "private" ? "ANONYMOUS" : entry.name);

  // High scores: approved names summed per person; each private gift is its own ANONYMOUS row.
  const totals = new Map<string, { name: string; cents: number }>();
  for (const entry of shown) {
    const key = entry.status === "private" ? `anon:${entry.id}` : entry.name.trim().toLowerCase();
    const row = totals.get(key) ?? { name: display(entry), cents: 0 };
    row.cents += entry.cents;
    totals.set(key, row);
  }
  const wall = [...totals.values()]
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 10)
    .map((row) => ({ name: row.name, amount: Math.round(row.cents / 100) }));

  const guestbook = entries
    .filter((entry) => entry.status === "approved" && entry.public && entry.message.trim())
    .slice(0, 12)
    .map((entry) => ({ name: entry.name, message: entry.message.trim().slice(0, 200), at: entry.at }));

  return {
    raised: TIP_GOAL.base + Math.floor(cents / 100),
    latest: shown[0] ? { name: display(shown[0]), at: shown[0].at } : undefined,
    wall,
    guestbook,
    votes,
  };
}

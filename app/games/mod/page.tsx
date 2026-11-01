import type { Metadata } from "next";
import { NEXT_GAME_PITCHES, TIP_GOAL } from "../_lib/fund-config";
import { store, type Entry } from "../_lib/fund";
import { isModerator, login, logout, removeEntry, setStatus, setVotes } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Fund moderation", robots: { index: false, follow: false } };

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif';
const button = "rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.08em]";

/** Paul's moderation desk: approve public names/messages before they show, read private notes, copy credits. */
export default async function ModPage() {
  const shell = (children: React.ReactNode) => (
    <main className="relative z-[1] mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8" style={{ fontFamily: SYSTEM_FONT }}>
      <h1 className="text-[13px] font-semibold tracking-[0.3em]" style={{ color: "#ffd23f" }}>NEXT GAME FUND · MODERATION</h1>
      {children}
    </main>
  );

  if (!process.env.MOD_PASSWORD) return shell(<p className="opacity-80">Set <code>MOD_PASSWORD</code> in the Vercel project to use this page.</p>);
  if (!(await isModerator())) {
    return shell(
      <form action={login} className="flex gap-2">
        <input name="password" type="password" placeholder="Password" autoFocus className="flex-1 rounded-full bg-white/10 px-4 py-2.5 outline-none" />
        <button className="rounded-full bg-[#ffd23f] px-5 font-bold text-black">Sign in</button>
      </form>,
    );
  }

  const entries = (await store().all()).sort((a, b) => b.at - a.at);
  const votes = await store().votes();
  const cents = entries.reduce((sum, entry) => sum + entry.cents, 0);
  const by = (status: Entry["status"]) => entries.filter((entry) => entry.status === status);
  const credits = [...new Set(by("approved").map((entry) => entry.name.trim()))].join("\n");
  const privateNames = [...new Set(by("private").map((entry) => entry.name.trim()))].join(", ");

  return shell(
    <>
      <p className="text-lg">
        <b>${(TIP_GOAL.base + cents / 100).toFixed(2)}</b> <span className="opacity-60">of ${TIP_GOAL.target} · {entries.length} payments{TIP_GOAL.base ? ` · includes $${TIP_GOAL.base} base` : ""}</span>
      </p>

      <List title="Waiting for approval" empty="Nothing waiting." entries={by("pending")} actions={["approved", "hidden"]} />
      <List title="Private (never shown; name appears as ANONYMOUS)" empty="No private notes." entries={by("private")} actions={[]} />
      <List title="Live on the site" empty="Nothing approved yet." entries={by("approved")} actions={["hidden"]} />
      <List title="Hidden" empty="Nothing hidden." entries={by("hidden")} actions={["approved"]} />

      <section>
        <h2 className="mb-2 font-bold">Credits list</h2>
        <p className="mb-2 text-sm opacity-60">Approved public names. Private supporters ({privateNames || "none"}) aren't included unless they say yes.</p>
        <textarea readOnly value={credits} rows={Math.min(12, Math.max(3, credits.split("\n").length))} className="w-full rounded-xl bg-white/10 p-3 font-mono text-sm" />
      </section>

      {NEXT_GAME_PITCHES.length > 0 && (
        <form action={setVotes} className="flex flex-col gap-2">
          <h2 className="font-bold">Votes</h2>
          {NEXT_GAME_PITCHES.map((pitch) => (
            <label key={pitch.key} className="flex items-center gap-3">
              <span className="w-48 truncate">{pitch.key} · {pitch.title}</span>
              <input name={`vote-${pitch.key}`} type="number" min={0} defaultValue={votes[pitch.key] ?? 0} className="w-24 rounded-lg bg-white/10 px-2 py-1" />
            </label>
          ))}
          <button className={button + " self-start bg-white/15"}>Save votes</button>
        </form>
      )}

      <form action={logout}><button className="text-sm opacity-60">Sign out</button></form>
    </>,
  );
}

const LABEL: Record<string, string> = { approved: "Approve", hidden: "Hide" };

function List({ title, empty, entries, actions }: { title: string; empty: string; entries: Entry[]; actions: ("approved" | "hidden")[] }) {
  return (
    <section>
      <h2 className="mb-2 font-bold">{title} <span className="opacity-50">({entries.length})</span></h2>
      {entries.length === 0 ? <p className="text-sm opacity-50">{empty}</p> : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-2xl bg-white/[0.07] p-3">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <b>{entry.name}</b>
                <span style={{ color: "#ffd23f" }}>${(entry.cents / 100).toFixed(2)}</span>
                <span className="text-xs opacity-50">{entry.type} · {new Date(entry.at).toLocaleString("en-US")}{entry.vote ? ` · vote ${entry.vote}` : ""}</span>
              </div>
              {entry.message && <p className="mt-1 whitespace-pre-wrap text-[15px] opacity-90">“{entry.message}”</p>}
              <div className="mt-2 flex gap-2">
                {actions.map((status) => (
                  <form key={status} action={setStatus}>
                    <input type="hidden" name="id" value={entry.id} />
                    <input type="hidden" name="status" value={status} />
                    <button className={button + (status === "approved" ? " bg-[#ffd23f] text-black" : " bg-white/15")}>{LABEL[status]}</button>
                  </form>
                ))}
                <form action={removeEntry}>
                  <input type="hidden" name="id" value={entry.id} />
                  <button className={button + " bg-red-500/25 text-red-200"}>Delete (removes $)</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

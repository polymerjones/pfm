import { NextResponse } from "next/server";
import { parseVote } from "@/app/games/_lib/fund-config";
import { store, type Entry } from "@/app/games/_lib/fund";

export const dynamic = "force-dynamic";

/**
 * Ko-fi webhook (Ko-fi → Settings → API → Webhook URL). Ko-fi posts form data with one `data`
 * field holding JSON. Each payment is stored once (by transaction id). Public names and messages
 * wait in /games/mod for approval; private ones are never shown. Emails are never stored.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    const form = await request.formData();
    payload = JSON.parse(String(form.get("data") ?? ""));
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  const expected = process.env.KOFI_VERIFICATION_TOKEN;
  if (!expected || payload.verification_token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = String(payload.kofi_transaction_id ?? payload.message_id ?? "");
  const cents = Math.round(parseFloat(String(payload.amount ?? "0")) * 100);
  if (!id || !Number.isFinite(cents) || cents <= 0) return NextResponse.json({ ok: true, skipped: true });

  const db = store();
  if (!(await db.claim(id))) return NextResponse.json({ ok: true, duplicate: true });

  const isPublic = payload.is_public !== false;
  const message = String(payload.message ?? "").slice(0, 500);
  const vote = parseVote(message);
  const entry: Entry = {
    id,
    name: String(payload.from_name ?? "Someone").slice(0, 40) || "Someone",
    cents,
    message,
    public: isPublic,
    at: Date.parse(String(payload.timestamp ?? "")) || Date.now(),
    status: isPublic ? "pending" : "private",
    type: String(payload.type ?? "Donation"),
    ...(vote ? { vote } : {}),
  };
  await db.put(entry);
  if (vote) await db.addVote(vote, 1);
  return NextResponse.json({ ok: true });
}

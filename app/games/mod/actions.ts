"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { store, type EntryStatus } from "../_lib/fund";

const COOKIE = "pj-mod";

function sessionValue(): string | undefined {
  const password = process.env.MOD_PASSWORD;
  return password ? createHmac("sha256", password).update("pj-mod-session").digest("hex") : undefined;
}

export async function isModerator(): Promise<boolean> {
  const expected = sessionValue();
  const got = (await cookies()).get(COOKIE)?.value;
  if (!expected || !got || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

async function guard() {
  if (!(await isModerator())) throw new Error("Not signed in");
}

export async function login(form: FormData) {
  const password = process.env.MOD_PASSWORD;
  const given = String(form.get("password") ?? "");
  const ok = password && given.length === password.length && timingSafeEqual(Buffer.from(given), Buffer.from(password));
  if (ok) {
    (await cookies()).set(COOKIE, sessionValue()!, { httpOnly: true, secure: process.env.NODE_ENV === "production" && !!process.env.VERCEL, sameSite: "strict", path: "/games/mod", maxAge: 60 * 60 * 24 * 30 });
  }
  revalidatePath("/games/mod");
}

export async function logout() {
  (await cookies()).delete({ name: COOKIE, path: "/games/mod" });
  revalidatePath("/games/mod");
}

export async function setStatus(form: FormData) {
  await guard();
  const id = String(form.get("id"));
  const status = String(form.get("status")) as EntryStatus;
  if (!["pending", "approved", "hidden"].includes(status)) return;
  const entry = (await store().all()).find((item) => item.id === id);
  if (!entry || !entry.public) return;
  await store().put({ ...entry, status });
  revalidatePath("/games/mod");
}

export async function removeEntry(form: FormData) {
  await guard();
  const id = String(form.get("id"));
  const entry = (await store().all()).find((item) => item.id === id);
  if (!entry) return;
  if (entry.vote) await store().addVote(entry.vote, -1);
  await store().remove(id);
  revalidatePath("/games/mod");
}

export async function setVotes(form: FormData) {
  await guard();
  for (const key of ["A", "B", "C"]) {
    const value = form.get(`vote-${key}`);
    if (value !== null && value !== "") await store().setVote(key, Math.max(0, Math.round(Number(value)) || 0));
  }
  revalidatePath("/games/mod");
}

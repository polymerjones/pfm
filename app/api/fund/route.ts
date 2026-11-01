import { NextResponse } from "next/server";
import { snapshot } from "@/app/games/_lib/fund";

export const dynamic = "force-dynamic";

/** The fund's public numbers for the arcade card, header meter and site footer (CDN-cached ~1 min). */
export async function GET() {
  try {
    return NextResponse.json(await snapshot(), {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

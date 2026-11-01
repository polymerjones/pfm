"use client";

import { usePathname } from "next/navigation";
import { TIP_GOAL, TIP_URL } from "@/app/games/_lib/fund-config";
import FundMeter from "./FundMeter";
import Coin from "./Coin";

/** Pages that skip the footer: the hub has the full arcade card; the wedding page isn't the place. */
const HIDDEN = [/^\/games\/?$/, /^\/games\/mod/, /^\/wedding/];

/** Site-wide "insert coin" strip at the bottom of every page (in the flow, never floating). */
export default function KofiFooter() {
  const pathname = usePathname() ?? "/";
  if (!TIP_URL || HIDDEN.some((pattern) => pattern.test(pathname))) return null;
  return (
    <footer className="relative z-[2] flex justify-center px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif' }}>
      <a href={TIP_URL} target="_blank" rel="noopener"
         className="arcade-footer-pill flex items-center gap-3 rounded-full border-2 px-5 py-2.5 transition-transform active:scale-95">
        <Coin size={30} />
        <span className="flex flex-col leading-tight">
          <span className="text-[13px] font-extrabold tracking-[0.22em]" style={{ color: "#ffd23f" }}>INSERT COIN</span>
          <span className="text-[11px] font-semibold tracking-[0.18em] text-white/70">{TIP_GOAL.title.toUpperCase()}</span>
        </span>
        <FundMeter className="ml-1 h-4" />
      </a>
    </footer>
  );
}

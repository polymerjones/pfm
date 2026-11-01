"use client";

import { TIP_GOAL } from "@/app/games/_lib/fund-config";
import { useFund } from "@/app/games/_lib/useFund";

/** A tiny LED meter of the Next Game Fund (header and site footer). */
export default function FundMeter({ segments = 8, small = false, className = "" }: { segments?: number; small?: boolean; className?: string }) {
  const { raised } = useFund();
  const lit = Math.min(segments, Math.floor((Math.max(0, raised) / TIP_GOAL.target) * segments));
  return (
    <span className={"inline-flex items-end gap-[2px] " + (small ? "arcade-mini-small " : "") + className} aria-label={`$${raised} of $${TIP_GOAL.target} raised`} role="img">
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={"arcade-mini-cell" + (i < lit ? " is-lit" : i === lit ? " is-next" : "")} />
      ))}
    </span>
  );
}

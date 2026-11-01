"use client";

import { useEffect, useState } from "react";
import { TIP_GOAL, type FundSnapshot } from "./fund-config";

const fallback: FundSnapshot = { raised: TIP_GOAL.base, wall: [], guestbook: [], votes: {} };
let request: Promise<FundSnapshot> | undefined;

/** The fund's live numbers, fetched once per page after mount (the static goal shows until then). */
export function useFund(): FundSnapshot {
  const [fund, setFund] = useState(fallback);
  useEffect(() => {
    let live = true;
    request ??= fetch("/api/fund")
      .then((response) => (response.ok ? (response.json() as Promise<FundSnapshot>) : fallback))
      .catch(() => fallback);
    request.then((snapshot) => live && setFund(snapshot));
    return () => {
      live = false;
    };
  }, []);
  return fund;
}

/** "2h ago" style, for the last-coin line. */
export function timeAgo(at: number, now = Date.now()): string {
  const minutes = Math.max(1, Math.round((now - at) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

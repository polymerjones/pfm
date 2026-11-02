"use client";

import { useEffect } from "react";

const LIT = ".home-games, .home-row";
const HOLD_MS = 450;

/**
 * Touch screens have no hover, so a finger on a home link lights it (.hot: the chrome wipe, divider light and arrow) and
 * it stays lit a beat after the finger lifts, so the effect is seen as the link opens.
 */
export default function HomeTouch() {
  useEffect(() => {
    let lit: Element | null = null;
    let timer = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !(e.target instanceof Element)) return;
      const el = e.target.closest(LIT);
      if (!el) return;
      window.clearTimeout(timer);
      lit?.classList.remove("hot");
      lit = el;
      el.classList.add("hot");
    };
    const onUp = () => {
      if (!lit) return;
      const el = lit;
      timer = window.setTimeout(() => {
        el.classList.remove("hot");
        if (lit === el) lit = null;
      }, HOLD_MS);
    };
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    addEventListener("pointercancel", onUp, { passive: true });
    return () => {
      window.clearTimeout(timer);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
    };
  }, []);
  return null;
}

"use client";

import { useEffect, useState } from "react";

export type Platform = "ios" | "android" | "desktop";

function detect(): Platform {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  // iPadOS reports itself as a Mac; touch support gives it away.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return "desktop";
}

/** Which store to lead with: App Store on iPhone/iPad, Google Play on Android, both on desktop. */
export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("desktop");
  useEffect(() => setPlatform(detect()), []);
  return platform;
}

// Adaptive quality: every device gets a working, good-looking hub; capable devices get the extras.
// The tier starts from what the browser tells us and steps down at runtime if frames run long.

export type Tier = "high" | "medium" | "low";

export const particleScale: Record<Tier, number> = { high: 1, medium: 0.5, low: 0 };
export const canvasDPR: Record<Tier, number> = { high: 2, medium: 1.5, low: 1 };

export function initialTier(): Tier {
  if (typeof window === "undefined") return "medium";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "low";
  const memory = nav.deviceMemory ?? 8; // Safari doesn't expose it
  const cores = nav.hardwareConcurrency ?? 8;
  if (memory <= 2 || cores <= 2) return "low";
  if (memory <= 4 || cores <= 4) return "medium";
  return "high";
}

/**
 * Watches frame times during animation and steps the tier down when they stay long
 * (> ~22 ms average over ~2 s, i.e. under ~45 fps). Never steps back up within a visit.
 */
export function createFrameGovernor(onDowngrade: () => void) {
  let samples = 0;
  let total = 0;
  return (dtMs: number) => {
    if (dtMs > 250) return; // tab switch or pause, not a slow frame
    samples += 1;
    total += dtMs;
    if (samples >= 120) {
      if (total / samples > 22) onDowngrade();
      samples = 0;
      total = 0;
    }
  };
}

export function lowerTier(tier: Tier): Tier {
  return tier === "high" ? "medium" : "low";
}

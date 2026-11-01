/**
 * Magical golden sparkles that twinkle and drift up around whatever they're placed in (the parent
 * needs `position: relative`). Fixed positions and staggered timings, so no randomness at render.
 * Mostly along the edges, where they show against the dark background.
 */
const EDGE = [
  [4, -8], [18, 96], [30, -12], [44, 104], [58, -6], [70, 98], [84, -10], [96, 92],
  [-2, 50], [101, 40], [12, 18], [90, 74], [50, -16], [36, 108],
] as const;

export default function Sparkles({ spots = EDGE, size = 1 }: { spots?: readonly (readonly [number, number])[]; size?: number }) {
  return (
    <span aria-hidden className="arcade-sparkles">
      {spots.map(([x, y], i) => (
        <span
          key={i}
          className="arcade-sparkle"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            fontSize: `${(i % 3 === 0 ? 14 : i % 3 === 1 ? 10 : 7) * size}px`,
            animationDelay: `${((i * 0.37) % 2.4).toFixed(2)}s`,
            animationDuration: `${1.6 + ((i * 0.53) % 1.2)}s`,
          }}
        >
          ✦
        </span>
      ))}
    </span>
  );
}

/** A tighter ring of sparkles for the coin itself. */
export const COIN_SPOTS = [[-20, 10], [95, -18], [105, 70], [10, 100], [60, -30]] as const;

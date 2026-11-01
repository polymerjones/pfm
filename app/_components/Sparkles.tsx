/**
 * Magical golden sparkles that twinkle and drift up around whatever they're placed in (the parent
 * needs `position: relative`). Fixed positions and staggered timings, so no randomness at render.
 * Mostly along the edges, where they show against the dark background.
 */
const EDGE = [[6, -8], [30, 102], [52, -12], [74, 98], [94, -6], [101, 55], [-2, 40], [16, 100]] as const;

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
            fontSize: `${(i % 3 === 0 ? 11 : i % 3 === 1 ? 8 : 6) * size}px`,
            animationDelay: `${((i * 0.61) % 3.2).toFixed(2)}s`,
            animationDuration: `${2.4 + ((i * 0.53) % 1.4)}s`,
          }}
        >
          ✦
        </span>
      ))}
    </span>
  );
}

/** A tighter ring of sparkles for the coin itself. */
export const COIN_SPOTS = [[95, -18], [-10, 90]] as const;

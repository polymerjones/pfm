import { useId } from "react";

/** A gold arcade coin with an embossed $, for INSERT COIN buttons. Flips now and then. */
export default function Coin({ size = 26 }: { size?: number }) {
  const id = useId();
  return (
    <svg className="arcade-coin-icon" width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <radialGradient id={`${id}-face`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff6c2" />
          <stop offset="0.45" stopColor="#ffd23f" />
          <stop offset="1" stopColor="#c98a00" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#8a5a00" />
      <circle cx="16" cy="16" r="13.2" fill={`url(#${id}-face)`} stroke="#a66d00" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="10.4" fill="none" stroke="#b97c00" strokeWidth="0.8" strokeDasharray="1.4 1.2" />
      <text x="16" y="21.6" textAnchor="middle" fontSize="15" fontWeight="900" fill="#7a4d00"
            fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif">$</text>
    </svg>
  );
}

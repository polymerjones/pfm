import Sparkles, { COIN_SPOTS } from "./Sparkles";

/** The PolyCoin (Paul's art, cropped to the coin) for INSERT COIN buttons. Flips now and then and sparkles. */
export default function Coin({ size = 26 }: { size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/games/img/polycoin-96.webp" alt="" aria-hidden width={size} height={size} draggable={false}
           className="arcade-coin-icon" />
      <Sparkles spots={COIN_SPOTS} size={0.8} />
    </span>
  );
}

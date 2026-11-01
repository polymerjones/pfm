/** The PolyCoin (Paul's art, cropped to the coin) for INSERT COIN buttons. Flips now and then. */
export default function Coin({ size = 26 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/games/img/polycoin-96.webp" alt="" aria-hidden width={size} height={size} draggable={false}
         className="arcade-coin-icon" />
  );
}

import { STATEMENT_BODY, STATEMENT_KICKER } from "@/app/_lib/statement";

/** Home page About block: Paul's statement in the link cards' dark-glass style. */
export default function AboutCard() {
  return (
    <section aria-labelledby="about-heading"
             className="w-full max-w-[520px] rounded-[10px] border border-white/15 bg-[#121212]/80 px-5 py-5 text-white shadow-[0_8px_20px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-7 sm:py-6">
      <h2 id="about-heading" className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">About</h2>
      <p className="mt-3 font-sans text-[16px] leading-relaxed text-white/85 sm:text-[17px]">{STATEMENT_BODY}</p>
      <p className="mt-4 text-[22px] font-semibold uppercase leading-tight tracking-[0.04em] sm:text-[26px]">
        {STATEMENT_KICKER.lead}
        <br />
        {STATEMENT_KICKER.tail}{" "}
        <span className="text-white [text-shadow:0_0_12px_rgba(255,255,255,0.65),0_0_28px_rgba(255,255,255,0.3)]">{STATEMENT_KICKER.word}.</span>
      </p>
      <p className="mt-3 text-right font-sans text-sm italic text-white/60">— Paul Fisher</p>
    </section>
  );
}

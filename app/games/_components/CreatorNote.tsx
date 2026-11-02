"use client";

import { useState } from "react";
import { STATEMENT_BODY, STATEMENT_KICKER } from "@/app/_lib/statement";

/** A pull-quote from Polymer Jones on the hub; "Read more" reveals the full statement in place. */
export default function CreatorNote() {
  const [more, setMore] = useState(false);
  return (
    <section aria-labelledby="creator-note" className="mx-4 lg:mx-auto lg:w-[calc(100%-2rem)] lg:max-w-[1180px]">
      <div className="relative rounded-[22px] border px-5 pb-5 pt-9 text-center backdrop-blur-md lg:px-12"
           style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)", background: "color-mix(in srgb, var(--bg0) 55%, transparent)", color: "var(--text)" }}>
        <span aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[72px] font-bold leading-none"
              style={{ color: "var(--accent)", textShadow: "0 0 18px var(--glow-soft)" }}>“</span>
        <h2 id="creator-note" className="text-[11px] font-semibold tracking-[0.3em]" style={{ color: "var(--accent)" }}>
          A NOTE FROM POLYMER JONES
        </h2>
        <blockquote className="mx-auto mt-3 max-w-[640px] text-[22px] font-semibold leading-snug lg:text-[30px]">
          <span className="block [text-wrap:balance]">{STATEMENT_KICKER.lead}</span>
          <span className="mt-[0.35em] block [text-wrap:balance]">
            {STATEMENT_KICKER.tail}{" "}
            <span style={{ color: "var(--accent)", textShadow: "0 0 14px var(--glow-soft)" }}>{STATEMENT_KICKER.word}.</span>
          </span>
        </blockquote>
        {more && <p className="about-reveal mx-auto mt-4 max-w-[640px] text-[15px] leading-relaxed lg:text-[17px]">{STATEMENT_BODY}</p>}
        <p className="mt-3 text-sm italic opacity-65">— Polymer Jones</p>
        <button type="button" onClick={() => setMore((open) => !open)} aria-expanded={more}
                className="mt-3 text-[12px] font-semibold tracking-[0.2em] opacity-75 hover:opacity-100" style={{ color: "var(--accent)" }}>
          {more ? "SHOW LESS" : "READ MORE"}
        </button>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type VideoLogoProps = {
  src: string;
};

export default function VideoLogo({ src }: VideoLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const reduceMotion = useReducedMotion();

  const tryPlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = 0;
      await video.play();
    } catch {}
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.max(video.duration - 0.05, 0);
      }
      video.pause();
    };

    const handleCanPlay = () => setIsReady(true);

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);

    if (!reduceMotion) {
      void tryPlay();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  return (
    <div className="mx-auto w-full max-w-[620px]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_33%,rgba(10,10,10,0)_75%)]" />
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          className={`block h-auto w-full object-contain [filter:contrast(1.15)_brightness(1.04)_drop-shadow(0_0_6px_rgba(255,255,255,0.32))] ${
            isReady ? "opacity-10" : "opacity-0"
          }`}
          style={{
            WebkitMaskImage:
              "radial-gradient(120% 80% at 50% 42%, black 58%, transparent 100%)",
            maskImage: "radial-gradient(120% 80% at 50% 42%, black 58%, transparent 100%)",
            transition: "opacity 220ms ease"
          }}
          aria-label="Paul Fisher Media logo animation"
        />
      </div>
    </div>
  );
}

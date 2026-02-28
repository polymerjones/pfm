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
    <div className="mx-auto w-full max-w-[640px]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_36%,rgba(10,10,10,0)_78%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_58%,#0b0b0b_100%)]" />
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          className={`block h-auto w-full object-contain mix-blend-screen [filter:contrast(1.22)_brightness(1.12)_drop-shadow(0_0_10px_rgba(255,255,255,0.5))_drop-shadow(0_0_24px_rgba(255,255,255,0.18))] ${
            isReady ? "opacity-70" : "opacity-0"
          }`}
          style={{
            WebkitMaskImage:
              "radial-gradient(125% 90% at 50% 45%, black 56%, rgba(0,0,0,0.82) 70%, transparent 100%)",
            maskImage:
              "radial-gradient(125% 90% at 50% 45%, black 56%, rgba(0,0,0,0.82) 70%, transparent 100%)",
            transition: "opacity 220ms ease"
          }}
          aria-label="Paul Fisher Media logo animation"
        />
      </div>
    </div>
  );
}

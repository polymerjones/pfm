"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";

type VideoLogoProps = {
  src: string;
};

export default function VideoLogo({ src }: VideoLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showReplay, setShowReplay] = useState(false);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const reduceMotion = useReducedMotion();

  const tryPlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = 0;
      setShowReplay(false);
      setNeedsTapToPlay(false);
      await video.play();
    } catch {
      setNeedsTapToPlay(true);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.max(video.duration - 0.05, 0);
      }
      video.pause();
      setShowReplay(true);
    };

    video.addEventListener("ended", handleEnded);

    if (!reduceMotion) {
      void tryPlay();
    } else {
      setNeedsTapToPlay(true);
    }

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  return (
    <div className="mx-auto w-full max-w-[980px]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.03)_30%,rgba(10,10,10,0)_72%)]" />
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          className="block h-auto w-full object-contain opacity-90 [filter:contrast(1.15)_brightness(1.05)_drop-shadow(0_0_8px_rgba(255,255,255,0.38))]"
          aria-label="Paul Fisher Media logo animation"
        />

        {(showReplay || needsTapToPlay) && (
          <motion.button
            type="button"
            onClick={tryPlay}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute left-1/2 -translate-x-1/2 rounded-none border border-white/25 bg-black/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              needsTapToPlay ? "top-1/2 -translate-y-1/2" : "bottom-3"
            }`}
            aria-label={needsTapToPlay ? "Tap to play logo video" : "Replay logo video"}
          >
            <span className="inline-flex items-center gap-2">
              <Play className="h-4 w-4" aria-hidden="true" />
              {needsTapToPlay ? "Tap to play" : "Replay"}
            </span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

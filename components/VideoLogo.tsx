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
    <div className="mx-auto w-full max-w-[780px]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(76,201,240,0.2)_25%,rgba(7,10,19,0)_70%)]" />
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          className="block w-full h-auto object-contain mix-blend-screen [filter:contrast(1.1)_brightness(1.1)_drop-shadow(0_0_12px_rgba(255,255,255,0.55))_drop-shadow(0_0_28px_rgba(76,201,240,0.35))]"
          aria-label="Paul Fisher Media logo animation"
        />

        {(showReplay || needsTapToPlay) && (
          <motion.button
            type="button"
            onClick={tryPlay}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow ${
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

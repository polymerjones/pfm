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
    <div className="mx-auto w-full max-w-[420px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-panel/70 shadow-glow backdrop-blur-sm">
        <div className="aspect-[16/9] w-full p-3 sm:p-4">
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            className="h-full w-full rounded-xl object-contain"
            aria-label="Paul Fisher Media logo animation"
          />
        </div>

        {(showReplay || needsTapToPlay) && (
          <motion.button
            type="button"
            onClick={tryPlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-medium text-white backdrop-blur-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
            aria-label={needsTapToPlay ? "Tap to play logo video" : "Replay logo video"}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
              <Play className="h-4 w-4" aria-hidden="true" />
              {needsTapToPlay ? "Tap to play" : "Replay"}
            </span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

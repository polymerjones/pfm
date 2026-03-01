"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";

type VideoLogoProps = {
  src: string;
};

export default function VideoLogo({ src }: VideoLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const reduceMotion = useReducedMotion();

  const tryPlay = async (restart = false) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (restart) {
        video.currentTime = 0;
      }
      video.muted = isMuted;
      await video.play();
      setAutoplayBlocked(false);
      setIsEnded(false);
    } catch {
      setAutoplayBlocked(true);
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
      setIsEnded(true);
    };

    const handleCanPlay = () => setIsReady(true);

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);

    if (!reduceMotion) {
      void tryPlay(false);
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, isMuted]);

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    video.muted = nextMuted;

    if (!nextMuted) {
      try {
        await video.play();
      } catch {}
    }
  };

  return (
    <div
      className="group relative flex h-full w-full items-start justify-center pt-4 sm:pt-6"
      onPointerDown={() => {
        setShowControls(true);
        window.setTimeout(() => setShowControls(false), 1800);
      }}
    >
      <div className="relative h-[48vh] max-h-[560px] min-h-[320px] w-full max-w-[980px] sm:h-[52vh]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_70%_at_50%_38%,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0.03)_40%,transparent_76%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0af5] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0af0] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0af0] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#0a0a0af0] to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(142%_108%_at_50%_44%,transparent_50%,rgba(10,10,10,0.9)_72%,#0a0a0a_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0)_0%,rgba(10,10,10,0)_58%,rgba(10,10,10,0.9)_100%)]" />

        <video
          ref={videoRef}
          src={src}
          muted={isMuted}
          playsInline
          preload="auto"
          className={`pointer-events-none absolute inset-0 h-full w-full scale-[0.82] object-contain [filter:grayscale(1)_contrast(1.34)_brightness(1.1)_drop-shadow(0_0_8px_rgba(255,255,255,0.3))] ${
            isReady ? "opacity-48" : "opacity-0"
          }`}
          style={{
            mixBlendMode: "screen",
            WebkitMaskImage:
              "radial-gradient(145% 112% at 50% 43%, black 48%, rgba(0,0,0,0.92) 66%, transparent 100%),linear-gradient(to bottom,black 0%,black 50%,transparent 100%)",
            maskImage:
              "radial-gradient(145% 112% at 50% 43%, black 48%, rgba(0,0,0,0.92) 66%, transparent 100%),linear-gradient(to bottom,black 0%,black 50%,transparent 100%)",
            transition: "opacity 220ms ease"
          }}
          aria-label="Paul Fisher Media logo animation"
        />

        <video
          src={src}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full object-contain opacity-30 [filter:grayscale(1)_contrast(1.35)_brightness(1.15)]"
          style={{ mixBlendMode: "lighten" }}
        />

        <button
          type="button"
          onClick={() => void tryPlay(true)}
          className={`absolute right-4 top-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            showControls
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100"
          }`}
          aria-label={autoplayBlocked ? "Play logo animation" : "Replay logo animation"}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {autoplayBlocked ? "Play" : "Replay"}
        </button>

        <button
          type="button"
          onClick={() => void toggleSound()}
          className={`absolute right-4 top-16 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            showControls
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100"
          }`}
          aria-label={isMuted ? "Enable logo sound" : "Mute logo sound"}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          {isMuted ? "Sound Off" : "Sound On"}
        </button>
      </div>
    </div>
  );
}

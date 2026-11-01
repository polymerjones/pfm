"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";

type VideoLogoProps = {
  /** Fallback (opaque) video, used only if neither transparent version can play. */
  src: string;
};

/**
 * The logo animation with a real transparent background (a luma key of logo.mp4). Apple browsers
 * get HEVC-with-alpha; everyone else gets VP9-with-alpha. The <video> tag can't choose on its own:
 * Chrome on a Mac plays HEVC but drops its alpha channel.
 */
const ALPHA = { hevc: "/logo-alpha.mov", webm: "/logo-alpha.webm", still: "/logo-final.webp" };

function pickSource(fallback: string): string {
  const probe = document.createElement("video");
  const apple = /Apple/.test(navigator.vendor);
  if (apple && probe.canPlayType('video/mp4; codecs="hvc1"')) return ALPHA.hevc;
  if (probe.canPlayType('video/webm; codecs="vp9"')) return ALPHA.webm;
  return fallback;
}

export default function VideoLogo({ src }: VideoLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const reduceMotion = useReducedMotion();
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => setSource(pickSource(src)), [src]);

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
  }, [reduceMotion, isMuted, source]);

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
      className="group relative flex w-full items-start justify-center"
      onPointerDown={() => {
        setShowControls(true);
        window.setTimeout(() => setShowControls(false), 1800);
      }}
    >
      <div className="relative aspect-video max-h-[52vh] w-full max-w-[980px]">
        {reduceMotion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ALPHA.still} alt="Paul Fisher Media" className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-95 [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.35))]" />
        ) : (
          source && (
            <video
              key={source}
              ref={videoRef}
              src={source}
              muted={isMuted}
              playsInline
              preload="auto"
              className={`pointer-events-none absolute inset-0 h-full w-full object-contain [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.35))] ${
                isReady ? "opacity-95" : "opacity-0"
              }`}
              style={{ transition: "opacity 220ms ease" }}
              aria-label="Paul Fisher Media logo animation"
            />
          )
        )}

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

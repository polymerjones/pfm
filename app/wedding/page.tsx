"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import ColorBends from "@/components/ColorBends";
import VideoLogo from "@/components/VideoLogo";

type VideoSample = {
  title: string;
  href?: string;
  note?: string;
  status?: "live" | "coming-soon";
};

const VIDEO_SAMPLES: VideoSample[] = [
  {
    title: "Matt & Andrea Red Fir Wedding",
    href: "https://youtu.be/ntEf0C4w0z4",
    status: "live"
  },
  {
    title: "Maui Wedding",
    href: "https://youtu.be/jp13kAwhSB0?si=1TqK-d6_PH1H1Oi3",
    status: "live"
  },
  {
    title: "Melissa & William Gonzaga",
    href: "https://youtu.be/TuItEsd4yWk",
    status: "live"
  },
  {
    title: "Riverfront Wedding",
    href: "https://youtu.be/k19QoadIHXA",
    status: "live"
  },
  {
    title: "Same-sex Baby Shower & Surprise Wedding",
    href: "https://youtu.be/R2cCDc0r7e0?si=A-S90nUyMsiAZrcV",
    status: "live"
  }
];

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    const buildEmbedUrl = (id: string) => {
      const embedUrl = new URL(`https://www.youtube.com/embed/${id}`);
      embedUrl.searchParams.set("rel", "0");
      embedUrl.searchParams.set("playsinline", "1");
      embedUrl.searchParams.set("iv_load_policy", "3");
      return embedUrl.toString();
    };

    if (hostname === "youtu.be") {
      const id = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return id ? buildEmbedUrl(id) : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const watchId = parsedUrl.searchParams.get("v");

      if (watchId) {
        return buildEmbedUrl(watchId);
      }

      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      const [section, id] = pathParts;

      if ((section === "embed" || section === "shorts" || section === "live") && id) {
        return buildEmbedUrl(id);
      }
    }
  } catch {
    return null;
  }

  return null;
}

export default function WeddingSamplesPage() {
  const samples = useMemo(
    () =>
      VIDEO_SAMPLES.map((sample) => ({
        ...sample,
        embedUrl: sample.href ? getYouTubeEmbedUrl(sample.href) : null
      })),
    []
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  const activeSample = samples[activeIndex];

  const showPrevious = () => {
    setSlideDirection(-1);
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? samples.length - 1 : currentIndex - 1
    );
  };

  const showNext = () => {
    setSlideDirection(1);
    setActiveIndex((currentIndex) =>
      currentIndex === samples.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] px-4 py-10 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed -inset-12 z-0 opacity-95 [mix-blend-mode:screen] sm:-inset-20">
        <ColorBends
          rotation={45}
          speed={0.15}
          colors={["#666666", "#000000", "#000000"]}
          transparent
          autoRotate={0.35}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
        />
      </div>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(110%_80%_at_50%_20%,transparent_20%,rgba(10,10,10,0.5)_65%,rgba(10,10,10,0.86)_100%)]" />
      <div className="fixed inset-0 z-[2] opacity-10">
        <VideoLogo src="/logo.mp4" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 pt-28 sm:gap-10 sm:pt-32">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          <div className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
            Paul Fisher Media
          </div>
          <h1 className="text-4xl font-semibold uppercase tracking-[0.08em] text-white sm:text-6xl">
            Wedding Video Samples
          </h1>
          <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            A quick selection of films to show pacing, tone, and coverage style.
          </p>
        </section>

        {activeSample ? (
          <section
            aria-label="Wedding video samples"
            className="mx-auto flex w-full max-w-6xl flex-col gap-6"
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_360px]">
              <article className="overflow-hidden rounded-[24px] border border-white/15 bg-black/50 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <AnimatePresence custom={slideDirection} initial={false} mode="wait">
                    <motion.div
                      key={activeSample.embedUrl}
                      custom={slideDirection}
                      initial={{ opacity: 0, x: slideDirection > 0 ? 120 : -120, scale: 0.985 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: slideDirection > 0 ? -120 : 120, scale: 0.985 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      {activeSample.embedUrl ? (
                        <iframe
                          className="h-full w-full"
                          src={activeSample.embedUrl}
                          title={activeSample.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.96)_68%)] px-8 text-center">
                          <div className="max-w-xl">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                              Processing
                            </div>
                            <h3 className="mt-4 text-3xl font-semibold uppercase tracking-[0.08em] text-white sm:text-4xl">
                              {activeSample.title}
                            </h3>
                            <p className="mt-4 text-base leading-7 text-white/65 sm:text-lg">
                              {activeSample.note ?? "This film will be added soon."}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/35 via-black/10 to-transparent" />

                  <button
                    type="button"
                    onClick={showPrevious}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white/90 backdrop-blur-sm transition hover:scale-105 hover:bg-black/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-5 sm:p-4"
                    aria-label="Show previous sample"
                  >
                    <ChevronLeft className="h-7 w-7 sm:h-9 sm:w-9" />
                  </button>

                  <button
                    type="button"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white/90 backdrop-blur-sm transition hover:scale-105 hover:bg-black/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:p-4"
                    aria-label="Show next sample"
                  >
                    <ChevronRight className="h-7 w-7 sm:h-9 sm:w-9" />
                  </button>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-5">
                    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-sm">
                      {samples.map((sample, index) => {
                        const isActive = index === activeIndex;

                        return (
                          <button
                            key={sample.title}
                            type="button"
                            onClick={() => {
                              setSlideDirection(index > activeIndex ? 1 : -1);
                              setActiveIndex(index);
                            }}
                            className={`pointer-events-auto h-3 w-3 rounded-full border transition ${
                              isActive
                                ? "scale-125 border-white bg-white shadow-[0_0_18px_rgba(255,255,255,0.45)]"
                                : "border-white/55 bg-transparent hover:border-white hover:bg-white/30"
                            }`}
                            aria-label={`Show ${sample.title}`}
                            aria-pressed={isActive}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>

              <aside className="flex flex-col justify-between rounded-[24px] border border-white/15 bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                    Featured Sample
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-white sm:text-3xl">
                      {activeSample.title}
                    </h2>
                    {activeSample.note ? (
                      <p className="mt-3 text-sm leading-6 text-white/62 sm:text-base">
                        {activeSample.note}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6" />
              </aside>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-full gap-4">
                {samples.map((sample, index) => {
                  const isActive = index === activeIndex;
                  const thumbnailId = sample.embedUrl
                    ? new URL(sample.embedUrl).pathname.split("/").pop()
                    : null;

                  return (
                    <button
                      key={sample.title}
                      type="button"
                      onClick={() => {
                        setSlideDirection(index > activeIndex ? 1 : -1);
                        setActiveIndex(index);
                      }}
                      className={`group relative min-w-[280px] flex-1 overflow-hidden rounded-[18px] border text-left transition ${
                        isActive
                          ? "border-white/45 bg-white/[0.09] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
                          : "border-white/12 bg-white/[0.03] hover:border-white/28 hover:bg-white/[0.06]"
                      }`}
                      aria-pressed={isActive}
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        {thumbnailId ? (
                          <div
                            className="h-full w-full bg-cover bg-center transition duration-300 group-hover:scale-[1.02]"
                            style={{
                              backgroundImage: `url(https://img.youtube.com/vi/${thumbnailId}/hqdefault.jpg)`
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.98)_70%)] px-6 text-center">
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
                                Coming Soon
                              </div>
                              <div className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-white">
                                Processing
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
                        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur">
                              <Play className="h-4 w-4 fill-white text-white" />
                            </span>
                            <div>
                              <div className="text-sm font-semibold uppercase tracking-[0.08em] text-white">
                                {sample.title}
                              </div>
                              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">
                                {sample.status === "coming-soon" ? "Coming Soon" : "Select Sample"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

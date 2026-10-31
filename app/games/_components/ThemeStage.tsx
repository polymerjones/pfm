"use client";

import { useEffect, useRef, useState } from "react";
import { hexToRGB, themeVars, weight, type Game, type RGB } from "../_lib/catalog";
import { canvasDPR, createFrameGovernor, lowerTier, particleScale, type Tier } from "../_lib/perf";
import type { PositionStore } from "../_lib/position";

/**
 * The full-screen themed backdrop. Performance first:
 * - Each game's gradient + light pool is its own pre-painted layer, crossfaded by opacity as the
 *   carousel moves (compositor-only; nothing repaints per frame).
 * - On top, each game's animated scene (jungle spores and golden bokeh, or a cosmic star field and
 *   nebula) is drawn on one canvas, only for games currently on screen, with particle counts set by
 *   the device tier. A frame governor steps the tier down if frames run long; `low` = no canvas.
 * - Everything stops while the tab is hidden or `paused` (e.g. a game is being played).
 */
export default function ThemeStage({
  games,
  position,
  tier: initial,
  paused,
}: {
  games: Game[];
  position: PositionStore;
  tier: Tier;
  paused: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [tier, setTier] = useState<Tier>(initial);

  useEffect(() => setTier(initial), [initial]);

  // Crossfade the pre-painted layers.
  useEffect(
    () =>
      position.subscribe((pos) => {
        layerRefs.current.forEach((layer, index) => {
          if (layer) layer.style.opacity = String(weight(index, pos));
        });
      }),
    [position],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || paused || tier === "low") return;
    const scenes = games.map((game) => makeScene(game, particleScale[tier]));
    const governor = createFrameGovernor(() => setTier((current) => lowerTier(current)));
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, canvasDPR[tier]);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      scenes.forEach((scene) => scene.reset(width, height));
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      governor(now - last);
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const pos = position.get();
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      scenes.forEach((scene, index) => {
        const alpha = weight(index, pos);
        if (alpha <= 0.001) return;
        scene.step(dt, width, height);
        scene.draw(context, alpha, (index - pos) * 70);
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [games, position, tier, paused]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-black" aria-hidden>
      {games.map((game, index) => (
        <div
          key={game.id}
          ref={(node) => {
            layerRefs.current[index] = node;
          }}
          className="absolute inset-0 will-change-[opacity]"
          style={{
            ...themeVars(game.theme),
            opacity: 0,
            background:
              "radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--glow) 32%, transparent), transparent 60%), " +
              "linear-gradient(180deg, var(--bg0), var(--bg1), var(--bg2))",
          }}
        />
      ))}
      {tier !== "low" && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
    </div>
  );
}

// MARK: Scenes

type Particle = { x: number; y: number; vx: number; vy: number; size: number; life: number; age: number; color: RGB; peak: number };

type Scene = {
  reset: (width: number, height: number) => void;
  step: (dt: number, width: number, height: number) => void;
  draw: (context: CanvasRenderingContext2D, alpha: number, offsetX: number) => void;
};

/** Soft radial dots, pre-rendered once per color so the per-frame cost is just drawImage. */
const dotCache = new Map<string, HTMLCanvasElement>();
function softDot(color: RGB): HTMLCanvasElement {
  const key = color.join(",");
  let dot = dotCache.get(key);
  if (!dot) {
    dot = document.createElement("canvas");
    dot.width = dot.height = 64;
    const context = dot.getContext("2d")!;
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, `rgba(${color.join(",")},1)`);
    gradient.addColorStop(0.3, `rgba(${color.join(",")},0.35)`);
    gradient.addColorStop(1, `rgba(${color.join(",")},0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    dotCache.set(key, dot);
  }
  return dot;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** One emitter: particles born in a region with a velocity range, fading in, holding, fading out. */
function emitter(options: {
  count: number;
  color: RGB;
  size: [number, number];
  life: [number, number];
  peak: number;
  spawn: (width: number, height: number) => { x: number; y: number };
  velocity: () => { vx: number; vy: number };
}) {
  let particles: Particle[] = [];
  const birth = (width: number, height: number, age = 0): Particle => {
    const { x, y } = options.spawn(width, height);
    const { vx, vy } = options.velocity();
    const life = rand(...options.life);
    return { x, y, vx, vy, life, age: age * life, size: rand(...options.size), color: options.color, peak: options.peak };
  };
  return {
    reset(width: number, height: number) {
      // Prewarmed: particles start mid-life so the scene is full immediately.
      particles = Array.from({ length: options.count }, () => birth(width, height, Math.random()));
    },
    step(dt: number, width: number, height: number) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.age >= p.life) particles[i] = birth(width, height);
      }
    },
    draw(context: CanvasRenderingContext2D, alpha: number, offsetX: number) {
      for (const p of particles) {
        const t = p.age / p.life;
        const fade = t < 0.2 ? t / 0.2 : t > 0.75 ? (1 - t) / 0.25 : 1;
        context.globalAlpha = Math.max(0, fade * p.peak * alpha);
        const dot = softDot(p.color);
        context.drawImage(dot, p.x + offsetX - p.size, p.y - p.size, p.size * 2, p.size * 2);
      }
      context.globalAlpha = 1;
    },
  };
}

function makeScene(game: Game, density: number): Scene {
  const n = (count: number) => Math.max(1, Math.round(count * density));
  const glow = hexToRGB(game.theme.glow);
  const accent = hexToRGB(game.theme.accent);
  const secondary = hexToRGB(game.theme.secondary);
  const parts =
    game.theme.scene === "jungle"
      ? [
          // Golden bokeh drifting through the canopy.
          emitter({
            count: n(9), color: secondary, size: [60, 150], life: [14, 22], peak: 0.12,
            spawn: (w, h) => ({ x: rand(0, w), y: rand(0, h) }),
            velocity: () => ({ vx: rand(-6, 6), vy: rand(-6, 6) }),
          }),
          // Glowing green spores rising.
          emitter({
            count: n(70), color: glow, size: [3, 9], life: [6, 11], peak: 0.85,
            spawn: (w, h) => ({ x: rand(-0.05 * w, 1.05 * w), y: rand(0.3 * h, 1.05 * h) }),
            velocity: () => ({ vx: rand(-4, 10), vy: rand(-70, -25) }),
          }),
        ]
      : [
          // Nebula clouds.
          emitter({
            count: n(7), color: glow, size: [120, 240], life: [18, 28], peak: 0.13,
            spawn: (w, h) => ({ x: rand(0, w), y: rand(0, h) }),
            velocity: () => ({ vx: rand(-4, 4), vy: rand(-4, 4) }),
          }),
          emitter({
            count: n(4), color: accent, size: [100, 200], life: [18, 28], peak: 0.09,
            spawn: (w, h) => ({ x: rand(0, w), y: rand(0, h) }),
            velocity: () => ({ vx: rand(-4, 4), vy: rand(-4, 4) }),
          }),
          // Twinkling far stars.
          emitter({
            count: n(140), color: [255, 255, 255], size: [1.2, 3], life: [4, 9], peak: 0.9,
            spawn: (w, h) => ({ x: rand(0, w), y: rand(0, h) }),
            velocity: () => ({ vx: 0, vy: 0 }),
          }),
          // Near stars drifting down-left.
          emitter({
            count: n(30), color: accent, size: [2.5, 5], life: [10, 18], peak: 0.8,
            spawn: (w, h) => ({ x: rand(0, w * 1.3), y: rand(-0.1 * h, h) }),
            velocity: () => ({ vx: rand(-9, -4), vy: rand(10, 18) }),
          }),
        ];
  return {
    reset: (width, height) => parts.forEach((part) => part.reset(width, height)),
    step: (dt, width, height) => parts.forEach((part) => part.step(dt, width, height)),
    draw: (context, alpha, offsetX) => parts.forEach((part) => part.draw(context, alpha, offsetX)),
  };
}

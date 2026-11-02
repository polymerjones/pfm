"use client";

import { useEffect, useRef } from "react";

/**
 * The home page's slow silver swirl: ColorBends' shader (colors #666/#000/#000, warpStrength 1, screen-blended over #0a0a0a
 * with the old vignette) in raw WebGL, no three.js. Built for phones:
 * - The canvas is 100lvh tall, so the address bar sliding in and out never resizes it (resizing a WebGL canvas clears it,
 *   which was the old flicker). After a real resize (width, rotation) it redraws in the same frame, so it's never blank.
 * - Every tap sends a shockwave ring through it from the finger (harder on links); a held finger pulls the swirl toward it.
 * - It draws at CSS-pixel resolution (a quarter of a 2x screen; no grain, just a 1-step dither against banding) and at most 30fps, stops while the tab is hidden, and shows one still
 *   frame for reduced motion. Until WebGL is up, the body's matching gradient shows through.
 */
const FRAG = `
precision mediump float;
uniform vec2 uCanvas; uniform float uTime; uniform vec2 uRot; uniform vec2 uPointer; uniform vec4 uRip[3]; varying vec2 vUv;
void main(){
  float t=uTime*0.15; vec2 p=vUv*2.0-1.0; p+=uPointer*0.05;
  // Tap shockwaves (x, y, age in s, power): a ring travels out from the finger, bending the swirl and lighting its crest.
  float glow=0.0; vec2 asp=vec2(uCanvas.x/uCanvas.y,1.0);
  for(int k=0;k<3;k++){
    vec4 R=uRip[k]; if(R.z<0.0||R.z>2.2)continue;
    vec2 dv=(p-R.xy)*asp; float d=length(dv);
    float band=exp(-pow((d-R.z*1.6)*7.0,2.0))*exp(-1.6*R.z)*R.w;
    p+=normalize(dv+1e-4)/asp*band*0.14;
    glow+=band;
  }
  vec2 rp=vec2(p.x*uRot.x-p.y*uRot.y,p.x*uRot.y+p.y*uRot.x);
  vec2 q=vec2(rp.x*(uCanvas.x/uCanvas.y),rp.y);
  q/=0.5+0.2*dot(q,q); q+=0.2*cos(t)-7.56; q+=(uPointer-rp)*0.2;
  // Only the first band adds colour (#666); all three add coverage.
  vec2 s=q; float w0=0.0, cover=0.0;
  for(int i=0;i<3;i++){
    s-=0.01;
    vec2 r=sin(1.5*s.yx+2.0*cos(s));
    float m=length(r+sin(5.0*r.y-3.0*t+float(i))/4.0);
    float w=1.0-exp(-6.0/exp(6.0*m));
    if(i==0)w0=w; cover=max(cover,w);
  }
  float n=fract(sin(dot(gl_FragCoord.xy+vec2(uTime),vec2(12.9898,78.233)))*43758.5453);
  float lum=clamp(0.4*w0*cover*0.95+glow*0.42*(0.5+cover),0.0,1.0);
  vec3 base=vec3(10.0/255.0);
  vec3 col=1.0-(1.0-base)*(1.0-vec3(lum));
  vec2 v=(vUv-vec2(0.5,0.8))/vec2(1.1,0.8); float d=length(v);
  float vig=d<0.2?0.0:d<0.65?mix(0.0,0.5,(d-0.2)/0.45):mix(0.5,0.86,clamp((d-0.65)/0.35,0.0,1.0));
  gl_FragColor=vec4(mix(col,base,vig)+(n-0.5)/255.0,1.0);
}`;
const VERT = "attribute vec2 a;varying vec2 vUv;void main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}";
const SCALE = 1;
const FRAME_MS = 33;

export default function BendsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!canvas || !gl) return;

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uCanvas = gl.getUniformLocation(prog, "uCanvas");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uRot = gl.getUniformLocation(prog, "uRot");
    const uPointer = gl.getUniformLocation(prog, "uPointer");
    const uRip = gl.getUniformLocation(prog, "uRip");

    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const t0 = performance.now();
    const target = [0, 0];
    const pointer = [0, 0];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    // The last three taps: [x, y] in clip space, start time (-1 = unused), power.
    const ripples = [[0, 0, -1, 0], [0, 0, -1, 0], [0, 0, -1, 0]];
    let nextRipple = 0;
    const ripData = new Float32Array(12);

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const rad = ((45 + 0.35 * t) * Math.PI) / 180;
      pointer[0] += (target[0] - pointer[0]) * 0.15;
      pointer[1] += (target[1] - pointer[1]) * 0.15;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRot, Math.cos(rad), Math.sin(rad));
      gl.uniform2f(uPointer, pointer[0], pointer[1]);
      ripples.forEach(([x, y, start, power], i) => ripData.set([x, y, start < 0 ? -1 : (now - start) / 1000, power], i * 4));
      gl.uniform4fv(uRip, ripData);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const fit = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      // Browsers where lvh still follows the toolbar: a height-only change just stretches the soft swirl a little, never
      // reallocates (which clears the canvas). A new width (rotation) or a big jump does.
      if (w === width && Math.abs(h - height) < height * 0.25) return;
      width = w;
      height = h;
      canvas.width = Math.max(1, Math.round(w * SCALE));
      canvas.height = Math.max(1, Math.round(h * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uCanvas, w, h);
      draw(performance.now());
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      draw(now);
    };
    const start = () => {
      if (!raf && !reduce.matches && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotion = () => (reduce.matches ? stop() : start());
    const aim = (e: PointerEvent) => {
      target[0] = (e.clientX / innerWidth) * 2 - 1;
      target[1] = -((e.clientY / innerHeight) * 2 - 1);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.buttons) aim(e);
    };
    const onDown = (e: PointerEvent) => {
      aim(e);
      const onLink = e.target instanceof Element && !!e.target.closest("a,button");
      ripples[nextRipple] = [target[0], target[1], performance.now(), onLink ? 1.6 : 1];
      nextRipple = (nextRipple + 1) % ripples.length;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") target[0] = target[1] = 0;
    };

    fit();
    start();
    canvas.dataset.on = "";
    addEventListener("resize", fit);
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onMotion);
    return () => {
      stop();
      removeEventListener("resize", fit);
      removeEventListener("pointermove", onPointer);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onMotion);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(prog);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="home-bends" />;
}

/* ================================================================
   fx.js — Canvas Background Special Effects
   ================================================================ */

import { state } from "./state.js";
import { el } from "./dom.js";

const fx = { raf: 0, cleanup: null };

export function stopFx() {
  if (fx.cleanup) {
    try {
      fx.cleanup();
    } catch {}
    fx.cleanup = null;
  }
  cancelAnimationFrame(fx.raf);
  const ctx = el.bgFx.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, el.bgFx.width, el.bgFx.height);
  }
}

export function startFx() {
  stopFx();
  if (!state.settings.fx) return;
  ({
    matrix: startMatrixRain,
    bladerunner: startDustStorm,
    alien: startAlienScan,
    pinkie: startConfetti,
    rainbow: startSpeedStreaks,
    interstellar: startInterstellar,
    cyberpunk: startCyberpunk,
    dune: startDune,
    synthwave: startSynthwave,
    mandalorian: startMandalorian,
    oppenheimer: startTrinity,
  })[state.settings.theme]?.();
}

function fitCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  el.bgFx.width = Math.floor(w * dpr);
  el.bgFx.height = Math.floor(h * dpr);
  el.bgFx.style.width = w + "px";
  el.bgFx.style.height = h + "px";
  return { w, h, dpr };
}

function startMatrixRain() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);
  const fs = 16;
  let cols = Math.ceil(dims.w / fs);
  let drops = Array.from({ length: cols }, () => ({
    y: Math.floor(Math.random() * -dims.h / fs) * fs,
    v: 0,
    ch: ""
  }));
  const glyphs = "ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｲﾝ0123456789".split("");

  function onResize() {
    const d = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(d.dpr, d.dpr);
    cols = Math.ceil(d.w / fs);
    drops = Array.from({ length: cols }, () => ({
      y: Math.floor(Math.random() * -d.h / fs) * fs,
      v: 0,
      ch: ""
    }));
  }
  window.addEventListener("resize", onResize);

  function frame() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.fillStyle = "rgba(5,10,7,0.055)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = fs + "px \"VT323\",monospace";
    for (let i = 0; i < cols; i++) {
      const d = drops[i];
      d.v += 0.10 + Math.random() * 0.08;
      if (d.v >= fs) {
        d.v -= fs;
        d.y += fs;
        d.ch = glyphs[Math.random() * glyphs.length | 0];
        const x = i * fs;
        ctx.fillStyle = "rgba(220,255,230,0.95)";
        ctx.fillText(d.ch, x, d.y);
        ctx.fillStyle = "rgba(57,255,136,0.45)";
        ctx.fillText(d.ch, x, d.y - fs);
        if (d.y > h + 80 && Math.random() > .985) d.y = -20;
        if (d.y > h + 600) d.y = -20;
      }
    }
    fx.raf = requestAnimationFrame(frame);
  }
  frame();
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startDustStorm() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);
  let parts = [];

  function seed() {
    const c = Math.floor((dims.w * dims.h) / 9000);
    parts = [];
    for (let i = 0; i < c; i++) {
      parts.push({
        x: Math.random() * dims.w,
        y: Math.random() * dims.h,
        vx: .15 + Math.random() * .4,
        vy: (Math.random() - .5) * .10,
        r: .4 + Math.random() * 1.6,
        a: .05 + Math.random() * .18,
        hue: 25 + Math.random() * 20
      });
    }
  }
  seed();

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
    seed();
  }
  window.addEventListener("resize", onResize);

  let t0 = performance.now();
  let beamX = -200;
  let beamPhase = 0;

  function frame(t) {
    const dt = (t - t0) / 1000;
    t0 = t;
    ctx.fillStyle = "rgba(22,10,5,0.10)";
    ctx.fillRect(0, 0, dims.w, dims.h);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy + Math.sin((p.x + p.y) * .01) * .05;
      if (p.x > dims.w + 20) {
        p.x = -20;
        p.y = Math.random() * dims.h;
      }
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grd.addColorStop(0, "hsla(" + p.hue + ",80%,70%," + p.a + ")");
      grd.addColorStop(1, "hsla(" + p.hue + ",80%,50%,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    beamPhase += dt;
    if (beamPhase > 22) {
      beamPhase = 0;
      beamX = -240;
    }
    if (beamX < dims.w + 240) {
      beamX += dt * 110;
      const g2 = ctx.createLinearGradient(beamX - 120, 0, beamX + 120, 0);
      g2.addColorStop(0, "rgba(255,170,80,0)");
      g2.addColorStop(.5, "rgba(255,200,110,0.10)");
      g2.addColorStop(1, "rgba(255,170,80,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(beamX - 120, 0, 240, dims.h);
    }
    fx.raf = requestAnimationFrame(frame);
  }
  fx.raf = requestAnimationFrame(frame);
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startAlienScan() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
  }
  window.addEventListener("resize", onResize);

  let scanY = 0;
  let flicker = 0;
  let t0 = performance.now();

  function frame(t) {
    const dt = (t - t0) / 1000;
    t0 = t;
    ctx.clearRect(0, 0, dims.w, dims.h);
    ctx.globalAlpha = .18;
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = "hsla(" + (38 + Math.random() * 8) + ",100%,50%," + (0.08 + Math.random() * .12) + ")";
      ctx.fillRect(Math.random() * dims.w, Math.random() * dims.h, 1, 1);
    }
    ctx.globalAlpha = 1;
    scanY += dt * (dims.h / 16);
    if (scanY > dims.h + 80) scanY = -80;
    const grd = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    grd.addColorStop(0, "rgba(255,176,0,0)");
    grd.addColorStop(.5, "rgba(255,176,0,0.18)");
    grd.addColorStop(1, "rgba(255,176,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, scanY - 40, dims.w, 80);
    ctx.fillStyle = "rgba(255,200,80,0.55)";
    ctx.fillRect(0, scanY, dims.w, 1);
    flicker += dt;
    if (flicker > 3 + Math.random() * 4) {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, dims.w, dims.h);
      flicker = 0;
    }
    fx.raf = requestAnimationFrame(frame);
  }
  fx.raf = requestAnimationFrame(frame);
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startConfetti() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);
  const colors = ["#ff4ea8", "#ffd83a", "#5fd9ff", "#a455ff", "#ff8fd5", "#ffffff"];
  let parts = [];

  function seed() {
    const c = Math.floor((dims.w * dims.h) / 18000) + 30;
    parts = [];
    for (let i = 0; i < c; i++) {
      parts.push({
        x: Math.random() * dims.w,
        y: Math.random() * -dims.h,
        vx: (Math.random() - .5) * .6,
        vy: .6 + Math.random() * 1.2,
        r: .6 + Math.random() * 1.2,
        w: 6 + Math.random() * 8,
        h: 3 + Math.random() * 6,
        ang: Math.random() * Math.PI * 2,
        va: (Math.random() - .5) * .08,
        c: colors[Math.random() * colors.length | 0]
      });
    }
  }
  seed();

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
    seed();
  }
  window.addEventListener("resize", onResize);

  function frame() {
    ctx.clearRect(0, 0, dims.w, dims.h);
    for (const p of parts) {
      p.x += p.vx + Math.sin(p.ang) * .2;
      p.y += p.vy;
      p.ang += p.va;
      if (p.y > dims.h + 20) {
        p.y = -20;
        p.x = Math.random() * dims.w;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.ang);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = .85;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    fx.raf = requestAnimationFrame(frame);
  }
  frame();
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startSpeedStreaks() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);
  const palette = ["#ff3b3b", "#ff8a1a", "#ffd83a", "#2db55a", "#2db7ff", "#a455ff"];
  let streaks = [];

  function makeStreak() {
    return {
      x: Math.random() * dims.w * 1.5 - dims.w * .3,
      y: Math.random() * dims.h,
      sp: 4 + Math.random() * 4,
      len: 80 + Math.random() * 220,
      thick: 3 + Math.random() * 5,
      c: palette[Math.random() * palette.length | 0],
      a: .18 + Math.random() * .22
    };
  }

  function seed() {
    streaks = [];
    const c = Math.floor(dims.w / 90) + 6;
    for (let i = 0; i < c; i++) streaks.push(makeStreak());
  }
  seed();

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
    seed();
  }
  window.addEventListener("resize", onResize);

  const ANG = (-25 * Math.PI) / 180;
  const dx = Math.cos(ANG);
  const dy = Math.sin(ANG);

  function frame() {
    ctx.fillStyle = "rgba(180,228,255,0.18)";
    ctx.fillRect(0, 0, dims.w, dims.h);
    for (const s of streaks) {
      s.x += dx * s.sp;
      s.y += dy * s.sp;
      if (s.x > dims.w + 40 || s.y < -40) {
        Object.assign(s, makeStreak(), {
          x: -s.len,
          y: Math.random() * dims.h
        });
      }
      const g = ctx.createLinearGradient(s.x - dx * s.len, s.y - dy * s.len, s.x, s.y);
      g.addColorStop(0, s.c + "00");
      g.addColorStop(1, s.c);
      ctx.strokeStyle = g;
      ctx.globalAlpha = s.a;
      ctx.lineWidth = s.thick;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x - dx * s.len, s.y - dy * s.len);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    fx.raf = requestAnimationFrame(frame);
  }
  frame();
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startInterstellar() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);
  let stars = [];

  function seed() {
    const c = Math.floor((dims.w * dims.h) / 3500);
    stars = [];
    for (let i = 0; i < c; i++) {
      const d = Math.random();
      stars.push({
        x: Math.random() * dims.w,
        y: Math.random() * dims.h,
        r: .2 + d * 1.6,
        a: Math.random() * Math.PI * 2,
        sp: .08 + d * .5,
        vy: .02 + d * .12,
        warm: Math.random() < .18
      });
    }
  }
  seed();

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
    seed();
  }
  window.addEventListener("resize", onResize);

  let t0 = performance.now();
  let np = 0;

  function frame(t) {
    const dt = (t - t0) / 1000;
    t0 = t;
    ctx.clearRect(0, 0, dims.w, dims.h);
    np += dt * .04;
    const nx = dims.w * (.65 + Math.sin(np) * .04);
    const ny = dims.h * (.35 + Math.cos(np * .7) * .03);
    const neb = ctx.createRadialGradient(nx, ny, 0, nx, ny, Math.max(dims.w, dims.h) * .45);
    neb.addColorStop(0, "rgba(232,183,111,0.08)");
    neb.addColorStop(.5, "rgba(180,130,70,0.03)");
    neb.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, dims.w, dims.h);
    for (const s of stars) {
      s.a += dt * s.sp;
      s.y += s.vy;
      if (s.y > dims.h + 4) {
        s.y = -4;
        s.x = Math.random() * dims.w;
      }
      const tw = .5 + .5 * Math.sin(s.a);
      const alpha = (.55 + .45 * tw) * (.3 + s.r * .5);
      if (s.warm) {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        g.addColorStop(0, "rgba(255,220,170," + alpha + ")");
        g.addColorStop(1, "rgba(232,183,111,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(245,248,255," + alpha + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    fx.raf = requestAnimationFrame(frame);
  }
  fx.raf = requestAnimationFrame(frame);
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startCyberpunk() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);
  let streams = [];
  const charset = "01ABCDEF0123456789XYZMK".split("");

  function makeStream() {
    return {
      x: Math.random() * dims.w,
      y: -20,
      speed: 1.5 + Math.random() * 3,
      chars: [],
      color: Math.random() < .5 ? "rgba(0,245,255," : "rgba(255,0,168,",
      len: 5 + Math.floor(Math.random() * 12)
    };
  }

  function seed() {
    streams = [];
    for (let i = 0; i < Math.floor(dims.w / 24); i++) {
      const s = makeStream();
      s.y = Math.random() * dims.h;
      streams.push(s);
    }
  }
  seed();

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
    seed();
  }
  window.addEventListener("resize", onResize);

  function drawGrid() {
    ctx.strokeStyle = "rgba(0,245,255,0.06)";
    ctx.lineWidth = .5;
    const gx = 40, gy = 40;
    for (let x = 0; x < dims.w; x += gx) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dims.h);
      ctx.stroke();
    }
    for (let y = 0; y < dims.h; y += gy) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dims.w, y);
      ctx.stroke();
    }
  }

  function frame() {
    ctx.fillStyle = "rgba(13,0,26,0.15)";
    ctx.fillRect(0, 0, dims.w, dims.h);
    drawGrid();
    ctx.font = "12px Orbitron,monospace";
    for (const s of streams) {
      s.y += s.speed;
      if (s.chars.length < s.len) s.chars.unshift(charset[Math.random() * charset.length | 0]);
      s.chars.forEach((ch, i) => {
        const alpha = 1 - i / s.len;
        ctx.fillStyle = i === 0 ? "rgba(220,255,255,0.95)" : s.color + (alpha * .7) + ")";
        ctx.fillText(ch, s.x, s.y - i * 14);
      });
      if (s.y > dims.h + s.len * 14) Object.assign(s, makeStream());
    }
    fx.raf = requestAnimationFrame(frame);
  }
  frame();
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startDune() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);
  let grains = [];

  function seed() {
    const c = Math.floor((dims.w * dims.h) / 2000);
    grains = [];
    for (let i = 0; i < c; i++) {
      grains.push({
        x: Math.random() * dims.w,
        y: Math.random() * dims.h,
        vx: .3 + Math.random() * .6,
        vy: (Math.random() - .5) * .15,
        r: .3 + Math.random() * .8,
        a: .04 + Math.random() * .12,
        hue: 28 + Math.random() * 16
      });
    }
  }
  seed();

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
    seed();
  }
  window.addEventListener("resize", onResize);

  let t0 = performance.now();
  let heatPhase = 0;

  function frame(t) {
    const dt = (t - t0) / 1000;
    t0 = t;
    ctx.fillStyle = "rgba(26,16,8,0.12)";
    ctx.fillRect(0, 0, dims.w, dims.h);
    for (const p of grains) {
      p.x += p.vx;
      p.y += p.vy + Math.sin(p.x * .02 + p.y * .01) * .08;
      if (p.x > dims.w + 10) {
        p.x = -10;
        p.y = Math.random() * dims.h;
      }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      g.addColorStop(0, "hsla(" + p.hue + ",80%,65%," + p.a + ")");
      g.addColorStop(1, "hsla(" + p.hue + ",60%,40%,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    heatPhase += dt * .04;
    const hx = dims.w * (.5 + Math.sin(heatPhase) * .05);
    const hy = dims.h * (.7 + Math.sin(heatPhase * .7) * .06);
    const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, dims.w * .5);
    hg.addColorStop(0, "rgba(232,168,64,0.10)");
    hg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, dims.w, dims.h);
    fx.raf = requestAnimationFrame(frame);
  }
  fx.raf = requestAnimationFrame(frame);
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startSynthwave() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
  }
  window.addEventListener("resize", onResize);

  let t0 = performance.now();
  let scanY = dims.h;

  function frame(t) {
    const dt = (t - t0) / 1000;
    t0 = t;
    ctx.clearRect(0, 0, dims.w, dims.h);
    const sunY = dims.h * .38;
    const sunG = ctx.createRadialGradient(dims.w / 2, sunY, 0, dims.w / 2, sunY, dims.w * .35);
    sunG.addColorStop(0, "rgba(255,180,80,0.4)");
    sunG.addColorStop(.4, "rgba(255,45,120,0.2)");
    sunG.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sunG;
    ctx.fillRect(0, 0, dims.w, dims.h);
    const hor = dims.h * .48;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, hor, dims.w, dims.h - hor);
    ctx.clip();
    for (let i = 1; i <= 20; i++) {
      const y = hor + Math.pow(i / 20, 2) * (dims.h - hor);
      ctx.strokeStyle = "rgba(255,45,120," + (0.05 + 0.08 * (i / 20)) + ")";
      ctx.lineWidth = .5 + .5 * (i / 20);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dims.w, y);
      ctx.stroke();
    }
    for (let i = -8; i <= 8; i++) {
      ctx.strokeStyle = "rgba(160,32,240,0.12)";
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(dims.w / 2, hor);
      ctx.lineTo(dims.w / 2 + i * (dims.w / 7), dims.h);
      ctx.stroke();
    }
    ctx.restore();
    scanY -= dt * 40;
    if (scanY < hor) scanY = dims.h;
    const sg = ctx.createLinearGradient(0, scanY - 6, 0, scanY + 6);
    sg.addColorStop(0, "rgba(0,212,255,0)");
    sg.addColorStop(.5, "rgba(0,212,255,0.15)");
    sg.addColorStop(1, "rgba(0,212,255,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 6, dims.w, 12);
    fx.raf = requestAnimationFrame(frame);
  }
  fx.raf = requestAnimationFrame(frame);
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startMandalorian() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);
  let stars = [];

  function seed() {
    const c = Math.floor((dims.w * dims.h) / 4000);
    stars = [];
    for (let i = 0; i < c; i++) {
      const d = Math.random();
      stars.push({
        x: Math.random() * dims.w,
        y: Math.random() * dims.h,
        r: .15 + d * .8,
        a: Math.random() * Math.PI * 2,
        sp: .03 + d * .3,
        vy: .01 + d * .06,
        cold: Math.random() < .25
      });
    }
  }
  seed();

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
    seed();
  }
  window.addEventListener("resize", onResize);

  let t0 = performance.now();
  let shimmerPhase = 0;

  function frame(t) {
    const dt = (t - t0) / 1000;
    t0 = t;
    ctx.clearRect(0, 0, dims.w, dims.h);
    shimmerPhase += dt * .02;
    for (const s of stars) {
      s.a += dt * s.sp;
      s.y += s.vy;
      if (s.y > dims.h + 4) {
        s.y = -4;
        s.x = Math.random() * dims.w;
      }
      const tw = .5 + .5 * Math.sin(s.a);
      const alpha = (.5 + .45 * tw) * (.25 + s.r * .5);
      ctx.fillStyle = s.cold ? "rgba(142,171,204," + alpha + ")" : "rgba(210,216,224," + alpha + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    const sx = dims.w * (.5 + Math.sin(shimmerPhase) * .1);
    const sg = ctx.createLinearGradient(sx - 20, 0, sx + 20, dims.h);
    sg.addColorStop(0, "rgba(200,212,224,0)");
    sg.addColorStop(.5, "rgba(200,212,224,0.04)");
    sg.addColorStop(1, "rgba(200,212,224,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, dims.w, dims.h);
    fx.raf = requestAnimationFrame(frame);
  }
  fx.raf = requestAnimationFrame(frame);
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

function startTrinity() {
  let dims = fitCanvas();
  const ctx = el.bgFx.getContext("2d");
  ctx.scale(dims.dpr, dims.dpr);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LOOP = reduce ? 192000 : 96000;
  const FRAME_MS = reduce ? 80 : 33;
  const lerp = (a, b, k) => a + (b - a) * k;
  const ss = (e0, e1, x) => {
    const k = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return k * k * (3 - 2 * k);
  };
  const rgb = (c, a) => "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + a + ")";
  const EBG = [7, 6, 5];
  const CREAM = [224, 204, 168];
  const DARKR = [18, 13, 9];
  const CORE = [255, 240, 190];
  const MID = [240, 150, 45];
  const SPK = [245, 244, 238];
  let glowSpr, coreSpr, bloomSpr, beamSpr, vignSpr, nucleus, orbits, electrons, MIN;

  function radialSprite(size, stops) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const rg = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(s => rg.addColorStop(s[0], s[1]));
    g.fillStyle = rg;
    g.fillRect(0, 0, size, size);
    return c;
  }

  function beamSprite() {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 512;
    const g = c.getContext("2d");
    const lg = g.createLinearGradient(0, 0, 64, 0);
    lg.addColorStop(0, "rgba(255,255,255,0)");
    lg.addColorStop(.5, "rgba(255,255,255,1)");
    lg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = lg;
    g.fillRect(0, 0, 64, 512);
    return c;
  }

  function seed() {
    MIN = Math.min(dims.w, dims.h);
    glowSpr = radialSprite(32, [[0, rgb(SPK, 1)], [.4, rgb(SPK, .5)], [1, rgb(SPK, 0)]]);
    coreSpr = radialSprite(128, [[0, rgb(CORE, 1)], [.5, rgb(CORE, .4)], [1, rgb(CORE, 0)]]);
    bloomSpr = radialSprite(256, [[0, "rgba(255,226,140,1)"], [.18, "rgba(255,196,80,0.92)"], [.5, rgb(MID, .4)], [1, rgb(MID, 0)]]);
    beamSpr = beamSprite();
    vignSpr = radialSprite(256, [[0, "rgba(0,0,0,0)"], [.62, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,1)"]]);
    nucleus = { x: dims.w * .44, y: dims.h * .50 };
    orbits = [0, 1, 2].map(i => ({
      tilt: i * Math.PI / 3,
      rx: MIN * .30,
      ry: MIN * .11
    }));
    electrons = [];
    for (let i = 0; i < 14; i++) {
      const ring = i % 3;
      electrons.push({
        ring,
        th: Math.random() * Math.PI * 2,
        w: (.022 + Math.random() * .03) * (ring % 2 ? -1 : 1),
        tw: Math.random() * Math.PI * 2,
        twR: .4 + Math.random() * .5,
        sz: 6 + Math.random() * 6
      });
    }
  }
  seed();

  function onResize() {
    dims = fitCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dims.dpr, dims.dpr);
    seed();
  }
  window.addEventListener("resize", onResize);
  let t0 = performance.now();
  let startMs = t0;
  let lastDraw = -1e9;

  function frame(t) {
    if (t - lastDraw < FRAME_MS) {
      fx.raf = requestAnimationFrame(frame);
      return;
    }
    let dt = (t - t0) / 1000;
    t0 = t;
    if (dt > .1) dt = .1;
    lastDraw = t;
    let p = ((t - startMs) % LOOP) / LOOP;
    if (reduce) p = Math.min(p, .77);
    const w = dims.w;
    const h = dims.h;
    const heat = ss(.40, .78, p);
    const cool = p >= .85 ? ss(.85, 1, p) : 0;
    const u = p >= .78 ? (p - .78) / .22 : -1;
    const B = u >= 0 ? (1 - Math.exp(-30 * u)) * Math.exp(-3.5 * u) * (1 - ss(.96, 1, p)) : 0;
    const eA = Math.max(1 - heat, cool);
    const bright = heat * (1 - cool);
    let bg = [lerp(EBG[0], CREAM[0], heat), lerp(EBG[1], CREAM[1], heat), lerp(EBG[2], CREAM[2], heat)];
    if (cool > 0) {
      const k = cool;
      const mid = [lerp(CREAM[0], DARKR[0], k), lerp(CREAM[1], DARKR[1], k), lerp(CREAM[2], DARKR[2], k)];
      bg = [lerp(mid[0], EBG[0], k), lerp(mid[1], EBG[1], k), lerp(mid[2], EBG[2], k)];
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgb(bg, 1);
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const shaftA = .02 + .10 * bright + .18 * B;
    if (shaftA > .005) {
      for (let i = 0; i < 3; i++) {
        const drift = ((t / 1000) * .008 + i * .37) % 1.2;
        const sx = (drift - .1) * w;
        const breathe = .7 + .3 * Math.sin(t / 1000 * .11 + i);
        ctx.save();
        ctx.translate(sx, -.1 * h);
        ctx.rotate((-22 - i * 2) * Math.PI / 180);
        ctx.globalAlpha = shaftA * breathe;
        const bw = 110 + i * 40;
        ctx.drawImage(beamSpr, -bw / 2, 0, bw, h * 1.4);
        ctx.restore();
      }
    }
    if (eA > .02) {
      for (const e of electrons) {
        e.th += e.w * dt;
        e.tw += dt * .55;
        const o = orbits[e.ring];
        const ct = Math.cos(o.tilt);
        const st = Math.sin(o.tilt);
        const tw = e.twR * (.5 + .5 * Math.sin(e.tw));
        for (let g = 0; g < 3; g++) {
          const th2 = e.th - g * .12 * Math.sign(e.w || 1);
          const gx = Math.cos(th2) * o.rx;
          const gy = Math.sin(th2) * o.ry;
          const px = nucleus.x + gx * ct - gy * st;
          const py = nucleus.y + gx * st + gy * ct;
          const ga = eA * (.5 + .5 * tw) * (g === 0 ? 1 : .35 - .1 * g);
          if (ga <= .01) continue;
          ctx.globalAlpha = Math.max(0, ga);
          const s = e.sz * (g === 0 ? 1 : .8);
          ctx.drawImage(glowSpr, px - s / 2, py - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    }
    const bx = w * .40;
    const by = h * .80;
    if (B > .004) {
      const grow = 1 - Math.exp(-30 * u);
      const R = MIN * .55 * grow;
      const a = Math.min(.55, B);
      ctx.globalAlpha = a;
      ctx.drawImage(bloomSpr, bx - R, by - R, R * 2, R * 2);
      ctx.globalAlpha = Math.min(.4, a * 1.25);
      const R2 = R * 1.25;
      ctx.drawImage(bloomSpr, bx - R2, by - R2, R2 * 2, R2 * 2);
      if (u < .04) {
        const cR = R * .4;
        ctx.globalAlpha = Math.min(.45, (1 - u / .04) * .45);
        ctx.drawImage(coreSpr, bx - cR, by - cR, cR * 2, cR * 2);
      }
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = "source-over";
    if (bright > .02) {
      ctx.globalAlpha = bright * .08;
      ctx.fillStyle = rgb(MID, 1);
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = bright * .45;
      ctx.drawImage(vignSpr, 0, 0, w, h);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    fx.raf = requestAnimationFrame(frame);
  }
  fx.raf = requestAnimationFrame(frame);
  fx.cleanup = () => window.removeEventListener("resize", onResize);
}

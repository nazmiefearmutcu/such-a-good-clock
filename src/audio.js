/* ================================================================
   audio.js — Web Audio API Sound Engine and Ambient player
   ================================================================ */

import { state, VALID_SOUNDS } from "./state.js";
import { el } from "./dom.js";

export const soundEvents = [];
export const audio = { context:null, master:null, nodes:new Set(), repeatHandle:null, unlocked:false };
export const ambient = { nodes:[], current:"off", gain:null };

export async function ensureAudio() {
  if (!audio.context) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      audio.unlocked = false;
      updateAudioStatus();
      return false;
    }
    audio.context = new Ctor();
    audio.master = audio.context.createGain();
    audio.master.connect(audio.context.destination);
    updateMasterGain();
  }
  if (audio.context.state === "suspended") {
    try {
      await audio.context.resume();
    } catch {
      audio.unlocked = false;
    }
  }
  audio.unlocked = audio.context.state === "running";
  updateAudioStatus();
  return audio.unlocked;
}

export function updateMasterGain() {
  if (audio.master) {
    audio.master.gain.value = state.settings.muted ? 0 : state.settings.volume;
  }
}

export function updateAudioStatus() {
  if (el.audioStatus) {
    el.audioStatus.textContent = (audio.unlocked ? "Ready" : "Locked") + (state.settings.muted ? ", muted" : "");
  }
}

export function soundPattern(name) {
  return ({
    bell:   [{f:880,t:0,d:.22},{f:660,t:.24,d:.22},{f:990,t:.49,d:.32}],
    pulse:  [{f:392,t:0,d:.18},{f:392,t:.28,d:.18},{f:523,t:.56,d:.24}],
    triple: [{f:523,t:0,d:.16},{f:659,t:.18,d:.16},{f:784,t:.36,d:.22}],
    digital:[{f:1047,t:0,d:.08},{f:1047,t:.12,d:.08},{f:1047,t:.24,d:.08},{f:1319,t:.36,d:.14}],
    cosmic: [{f:196,t:0,d:.6},{f:247,t:.2,d:.5},{f:294,t:.45,d:.4},{f:392,t:.7,d:.35}],
    gentle: [{f:440,t:0,d:.4},{f:554,t:.3,d:.4},{f:659,t:.6,d:.5},{f:880,t:.9,d:.6}],
  }[name] || [{f:880,t:0,d:.22},{f:660,t:.24,d:.22},{f:990,t:.49,d:.32}]);
}

export async function playSound(kind, snd) {
  const ok = await ensureAudio();
  const resolved = snd || (kind === "timer" ? state.settings.defaultTimerSound : state.settings.defaultAlarmSound);
  soundEvents.push({ type: kind, sound: resolved, at: new Date().toISOString() });
  
  if (!ok || state.settings.muted || !audio.context || !audio.master) {
    if (navigator.vibrate) navigator.vibrate([160, 80, 160]);
    return false;
  }
  
  const now2 = audio.context.currentTime + 0.03;
  for (const note of soundPattern(resolved)) {
    const osc = audio.context.createOscillator();
    const gain = audio.context.createGain();
    
    osc.type = kind === "alarm" ? "square" : "sine";
    osc.frequency.setValueAtTime(note.f, now2 + note.t);
    
    gain.gain.setValueAtTime(0.0001, now2 + note.t);
    gain.gain.exponentialRampToValueAtTime(0.42, now2 + note.t + .025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now2 + note.t + note.d);
    
    osc.connect(gain);
    gain.connect(audio.master);
    
    osc.start(now2 + note.t);
    osc.stop(now2 + note.t + note.d + .05);
    
    audio.nodes.add(osc);
    
    // Explicit disconnect to prevent memory leaks (Aşama 3)
    osc.addEventListener("ended", () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (e) {}
      audio.nodes.delete(osc);
    }, { once: true });
  }
  return true;
}

export function stopRepeatingSound() {
  clearInterval(audio.repeatHandle);
  audio.repeatHandle = null;
  for (const n of audio.nodes) {
    try {
      n.stop();
    } catch {}
    try {
      n.disconnect();
    } catch {}
  }
  audio.nodes.clear();
}

export function startRepeatingSound(kind, snd) {
  stopRepeatingSound();
  void playSound(kind, snd);
  audio.repeatHandle = setInterval(() => void playSound(kind, snd), kind === "alarm" ? 1250 : 1500);
}

export function startAmbient(name) {
  stopAmbient();
  ambient.current = name;
  if (name === "off" || !audio.context) return;
  
  const ctx = audio.context;
  ambient.gain = ctx.createGain();
  ambient.gain.gain.value = state.settings.ambientVolume;
  ambient.gain.connect(ctx.destination);
  ambient.nodes = [ambient.gain];
  
  if (name === "rain" || name === "fan") {
    const bufSize = 8192;
    const buf = ctx.createScriptProcessor(bufSize, 1, 1);
    buf.onaudioprocess = e => {
      const o = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) o[i] = Math.random() * 2 - 1;
    };
    const filt = ctx.createBiquadFilter();
    filt.type = name === "rain" ? "bandpass" : "lowpass";
    filt.frequency.value = name === "rain" ? 1200 : 600;
    filt.Q.value = name === "rain" ? .5 : 1;
    
    buf.connect(filt);
    filt.connect(ambient.gain);
    ambient.nodes.push(buf, filt);
  } else if (name === "space") {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 55;
    
    const lfo = ctx.createOscillator();
    lfo.frequency.value = .08;
    
    const lfog = ctx.createGain();
    lfog.gain.value = 10;
    
    lfo.connect(lfog);
    lfog.connect(osc.frequency);
    osc.connect(ambient.gain);
    
    osc.start();
    lfo.start();
    ambient.nodes.push(osc, lfo, lfog);
  } else {
    const freqs = name === "cafe" ? [120, 180, 240, 300] : [200, 280, 360, 440];
    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      
      const g = ctx.createGain();
      g.gain.value = .04 + Math.random() * .04;
      
      osc.connect(g);
      g.connect(ambient.gain);
      osc.start();
      ambient.nodes.push(osc, g);
    }
  }
}

export function stopAmbient() {
  ambient.current = "off";
  for (const n of ambient.nodes) {
    try {
      n.stop?.();
    } catch {}
    try {
      n.disconnect?.();
    } catch {}
  }
  ambient.nodes = [];
  ambient.gain = null;
}

export function updateAmbientVolume() {
  if (ambient.gain?.gain) {
    ambient.gain.gain.value = state.settings.ambientVolume;
  }
}

/* ================================================================
   app.js — Entry point and application bootstrapper
   ================================================================ */

import { state, defaults, saveState, STORAGE_KEY } from "./state.js";
import { soundEvents, ensureAudio } from "./audio.js";
import {
  stopRing,
  setTimerDuration,
  startTimer,
  addOneTimeAlarm,
  renderAlarms,
  renderTimer,
  updateClock,
  buildAnalogMarkers,
  populateTimezoneSelect,
  applySettings,
  setDefaultAlarmTime,
  updateTimerRing,
  renderStopwatch,
  renderWorldClocks,
  bindEvents,
  bindKeyboard,
  tick,
  swLoop,
  sw
} from "./ui.js";

/* ================================================================
   Test hooks
   ================================================================ */
window.__clockAppTest = {
  get soundEvents() { return soundEvents; },
  get alarms() { return state.alarms; },
  get timer() { return state.timer; },
  async unlockAudio() { return ensureAudio(); },
  clear() {
    state.alarms = [];
    state.timer = { ...defaults.timer };
    soundEvents.length = 0;
    stopRing();
    saveState();
    renderAlarms();
    renderTimer();
    updateClock();
  },
  createTestAlarm(s = 5) { return addOneTimeAlarm(s, "Automated test alarm"); },
  startTestTimer(s = 3) { setTimerDuration(s); startTimer(); }
};

/* ================================================================
   Cross-Tab Synchronization
   ================================================================ */
window.addEventListener("storage", e => {
  if (e.key !== STORAGE_KEY || e.newValue == null) return;
  try {
    const parsed = JSON.parse(e.newValue);
    if (parsed.settings) {
      state.settings = { ...state.settings, ...parsed.settings };
      applySettings();
    }
    if (Array.isArray(parsed.alarms)) {
      state.alarms = parsed.alarms;
      renderAlarms();
      updateClock();
    }
  } catch {}
});

/* ================================================================
   Boot
   ================================================================ */
buildAnalogMarkers();
populateTimezoneSelect();
applySettings();
setDefaultAlarmTime();
renderAlarms();
renderTimer();
updateTimerRing(1, 1);
renderStopwatch();
renderWorldClocks();
updateClock(new Date());
bindEvents();
bindKeyboard();
setInterval(tick, 250);
requestAnimationFrame(swLoop);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

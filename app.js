/* ================================================================
   Such A Good Clock v2 — app.js
   11 themes · analog/flip/digital faces · stopwatch · world clock
   pomodoro · ambient audio · keyboard shortcuts · fullscreen
   ================================================================ */

const STORAGE_KEY = "sagc-v2";
const MAX_TIMER_SECONDS = 24 * 3600;
const VALID_THEMES    = new Set(["matrix","bladerunner","alien","pinkie","rainbow","interstellar","cyberpunk","dune","synthwave","mandalorian","oppenheimer"]);
const VALID_LAYOUTS   = new Set(["split","stack","minimal"]);
const VALID_SOUNDS    = new Set(["bell","pulse","triple","digital","cosmic","gentle"]);
const VALID_DATES     = new Set(["long","short","iso","off"]);
const VALID_GREETINGS = new Set(["time","static","motto","off"]);
const VALID_FACES     = new Set(["digital","analog","flip"]);
const VALID_SCALES    = new Set(["s","m","l","xl"]);
const VALID_AMBIENTS  = new Set(["off","rain","space","fan","cafe","forest"]);
const VALID_REPEATS   = new Set(["daily","weekdays","weekends","once"]);

/* Security: escape HTML entities in user-provided strings */
function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

/* ---- Theme data ---- */
const ACCENT_OPTIONS = {
  matrix:       ["#39ff88","#7af0ff","#f5ff7a","#ff8aff"],
  bladerunner:  ["#ff7a1a","#ffb86b","#2bd4e4","#ff3b6b"],
  alien:        ["#ffb000","#ff3b3b","#5ad36b","#ffd07a"],
  pinkie:       ["#ff4ea8","#ffd83a","#5fd9ff","#a455ff"],
  rainbow:      ["#2db7ff","#ff4d6d","#ffd83a","#a455ff"],
  interstellar: ["#e8b76f","#8ec5ff","#f4d9a0","#ffffff"],
  cyberpunk:    ["#00f5ff","#ff00a8","#f5ff00","#9d00ff"],
  dune:         ["#e8a840","#c47820","#f5d080","#a05820"],
  synthwave:    ["#ff2d78","#a020f0","#00d4ff","#ffd700"],
  mandalorian:  ["#d4d8e0","#8aabcc","#c0b090","#6080a8"],
  oppenheimer:  ["#c83030","#8a5a20","#5a3010","#a02020"],
};
const THEME_DEFAULT_ACCENTS = {
  matrix:"#39ff88", bladerunner:"#ff7a1a", alien:"#ffb000",
  pinkie:"#ff4ea8", rainbow:"#2db7ff",     interstellar:"#e8b76f",
  cyberpunk:"#00f5ff", dune:"#e8a840",     synthwave:"#ff2d78",
  mandalorian:"#d4d8e0", oppenheimer:"#c83030",
};
const ACCENT_2_PAIRS = {
  "#39ff88":"#b6ffd0","#7af0ff":"#e1faff","#f5ff7a":"#fff7c0","#ff8aff":"#ffd6ff",
  "#ff7a1a":"#2bd4e4","#ffb86b":"#2bd4e4","#2bd4e4":"#ff7a1a","#ff3b6b":"#2bd4e4",
  "#ffb000":"#ff3b3b","#ff3b3b":"#ffb000","#5ad36b":"#ffb000","#ffd07a":"#ff3b3b",
  "#ff4ea8":"#ffd83a","#ffd83a":"#ff4ea8","#5fd9ff":"#ff4ea8","#a455ff":"#ffd83a",
  "#2db7ff":"#ff4d6d","#ff4d6d":"#ffd83a",
  "#e8b76f":"#8ec5ff","#8ec5ff":"#e8b76f","#f4d9a0":"#8ec5ff","#ffffff":"#e8b76f",
  "#00f5ff":"#ff00a8","#ff00a8":"#00f5ff","#f5ff00":"#00f5ff","#9d00ff":"#00f5ff",
  "#e8a840":"#c47820","#c47820":"#e8a840","#f5d080":"#e8a840","#a05820":"#e8a840",
  "#ff2d78":"#a020f0","#a020f0":"#ff2d78","#00d4ff":"#ff2d78","#ffd700":"#ff2d78",
  "#d4d8e0":"#8aabcc","#8aabcc":"#d4d8e0","#c0b090":"#d4d8e0","#6080a8":"#d4d8e0",
  "#c83030":"#8a5a20","#8a5a20":"#c83030","#5a3010":"#c83030","#a02020":"#c83030",
};
const THEME_CLOCK_COLORS = {
  matrix:      ["#39ff88","#b6ffd0","#7af0ff"],
  bladerunner: ["#ffd9b0","#ff7a1a","#2bd4e4"],
  alien:       ["#ffd07a","#ffb000","#ff3b3b"],
  pinkie:      ["#ff8fd5","#ff4ea8","#c81585"],
  rainbow:     ["#ff3b3b","#ffd83a","#a455ff"],
  interstellar:["#ffffff","#f7e6c3","#e8b76f"],
  cyberpunk:   ["#00f5ff","#9d00ff","#ff00a8"],
  dune:        ["#f5d080","#e8a840","#c47820"],
  synthwave:   ["#ff2d78","#a020f0","#00d4ff"],
  mandalorian: ["#d4d8e0","#8aabcc","#6080a8"],
  oppenheimer: ["#f5e8d0","#c83030","#8a5a20"],
};
const THEME_QUOTES = {
  matrix:      ["Wake up, Neo.","There is no spoon.","Follow the white rabbit.","Free your mind."],
  bladerunner: ["All those moments, lost in time.","More human than human.","Cells. Interlinked.","I want more life."],
  alien:       ["In space, no one can hear you scream.","Final report of the Nostromo.","Stay frosty.","Signing off."],
  pinkie:      ["Smile, smile, smile!","Forever! And ever!","Today is gonna be the best day!","Party time!"],
  rainbow:     ["20% cooler.","Sonic Rainboom!","Loyalty above all.","I don't do slow."],
  interstellar:["Do not go gentle into that good night.","We used to look up and wonder.","Love transcends time and space.","Rage against the dying of the light."],
  cyberpunk:   ["Night City never sleeps.","The future is already here.","I am the algorithm.","Nothing is real but the code."],
  dune:        ["Fear is the mind-killer.","The spice must flow.","He who controls the spice controls the universe.","The sleeper must awaken."],
  synthwave:   ["Midnight drive.","Neon dreams.","The grid never ends.","Born to run."],
  mandalorian: ["This is the way.","I can bring you in warm, or I can bring you in cold.","Wherever I go, he goes.","The Mandalorian."],
  oppenheimer: ["Now I am become Death.","The physicists have known sin.","Any man whose errors take ten years to correct is quite a man.","I am ready."],
};
const FONT_SCALE_MAP = { s:"0.85", m:"1", l:"1.15", xl:"1.3" };
const FALLBACK_TIMEZONES = [
  "UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "America/Toronto","America/Sao_Paulo","Europe/London","Europe/Paris","Europe/Berlin",
  "Europe/Istanbul","Europe/Moscow","Asia/Dubai","Asia/Kolkata","Asia/Singapore",
  "Asia/Tokyo","Asia/Shanghai","Australia/Sydney","Pacific/Auckland",
];

/* ---- Defaults ---- */
const defaults = {
  settings: {
    theme:"matrix", layout:"split", face:"digital", accent:null,
    hour12:false, showSeconds:true, blink:false, muted:false, volume:1,
    defaultAlarmSound:"bell", defaultTimerSound:"triple",
    displayName:"", greetingStyle:"time", customMotto:"",
    dateFormat:"long", fx:true, scanlines:true, grain:false,
    topbarAutoHide:true, customClockColors:false,
    clockColors:["#39ff88","#b6ffd0","#7af0ff"],
    fontScale:"m", ambient:"off", ambientVolume:0.3,
  },
  alarms: [],
  timer: { duration:60, remaining:60, running:false, endsAt:null },
  pomodoro: { enabled:false, work:25, shortBreak:5, longBreak:15, rounds:4, currentSession:0, phase:"work" },
  worldClocks: [],
};

let state = loadState();
let currentRing = null;
const soundEvents = [];
const audio = { context:null, master:null, nodes:new Set(), repeatHandle:null, unlocked:false };
const ambient = { nodes:[], current:"off", gain:null };
const sw = { running:false, startedAt:0, elapsed:0, laps:[], lapStart:0 };
let quoteState = { theme:null, list:[], idx:0, timer:0 };
const flipPrev = { h1:-1, h2:-1, m1:-1, m2:-1, s1:-1, s2:-1 };

/* ================================================================
   State persistence
   ================================================================ */
function loadState() {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!p || typeof p !== "object") return cloneDefaults();
    return sanitizeState(p);
  } catch { return cloneDefaults(); }
}
function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }
function cloneDefaults() { return JSON.parse(JSON.stringify(defaults)); }
function uid() { return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()); }
function boolOr(v, fb) { return typeof v === "boolean" ? v : fb; }
function strOr(v, fb, max=80) { return typeof v === "string" ? v.slice(0,max) : fb; }
function numRange(v, fb, lo, hi) { const n=Number(v); return isFinite(n) ? Math.min(hi,Math.max(lo,n)) : fb; }
function intRange(v, fb, lo, hi) { const n=parseInt(v,10); return isFinite(n) ? Math.min(hi,Math.max(lo,n)) : fb; }
function intWithin(v, fb, lo, hi) { const n=parseInt(v,10); return isFinite(n)&&n>=lo&&n<=hi ? n : fb; }
function enumOr(v, s, fb) { return s.has(v) ? v : fb; }
function hexColor(v) { return typeof v==="string" && /^#[0-9a-f]{6}$/i.test(v); }
function themeClockColors(t) { return [...(THEME_CLOCK_COLORS[t]||THEME_CLOCK_COLORS.matrix)]; }
function normalizeClockColors(v, t) {
  const src=Array.isArray(v)?v:[];
  return themeClockColors(t).map((fb,i)=>hexColor(src[i])?src[i].toLowerCase():fb);
}
function isValidTime(v) {
  if (typeof v!=="string") return false;
  const m=v.match(/^(\d{2}):(\d{2})$/);
  return m && +m[1]>=0 && +m[1]<=23 && +m[2]>=0 && +m[2]<=59;
}
function sanitizeSettings(raw={}) {
  const i=(raw&&typeof raw==="object")?raw:{};
  const theme=enumOr(i.theme,VALID_THEMES,"matrix");
  const cc=boolOr(i.customClockColors,false);
  return {
    theme, layout:enumOr(i.layout,VALID_LAYOUTS,"split"), face:enumOr(i.face,VALID_FACES,"digital"),
    accent:ACCENT_OPTIONS[theme]?.includes(i.accent)?i.accent:null,
    hour12:boolOr(i.hour12,false), showSeconds:boolOr(i.showSeconds,true),
    blink:boolOr(i.blink,false), muted:boolOr(i.muted,false), volume:numRange(i.volume,1,0,1),
    defaultAlarmSound:enumOr(i.defaultAlarmSound,VALID_SOUNDS,"bell"),
    defaultTimerSound:enumOr(i.defaultTimerSound,VALID_SOUNDS,"triple"),
    displayName:strOr(i.displayName,"",32), greetingStyle:enumOr(i.greetingStyle,VALID_GREETINGS,"time"),
    customMotto:strOr(i.customMotto,"",80), dateFormat:enumOr(i.dateFormat,VALID_DATES,"long"),
    fx:boolOr(i.fx,true), scanlines:boolOr(i.scanlines,true), grain:boolOr(i.grain,false),
    topbarAutoHide:boolOr(i.topbarAutoHide,true), customClockColors:cc,
    clockColors:cc?normalizeClockColors(i.clockColors,theme):themeClockColors(theme),
    fontScale:enumOr(i.fontScale,VALID_SCALES,"m"),
    ambient:enumOr(i.ambient,VALID_AMBIENTS,"off"), ambientVolume:numRange(i.ambientVolume,0.3,0,1),
  };
}
function sanitizeAlarm(raw) {
  if (!raw||typeof raw!=="object") return null;
  const type=enumOr(raw.type,VALID_REPEATS,null); if (!type) return null;
  const alarm = {
    id:typeof raw.id==="string"&&raw.id?raw.id:uid(), type,
    label:strOr(raw.label,"Alarm",40).trim()||"Alarm",
    sound:enumOr(raw.sound,VALID_SOUNDS,"bell"), enabled:raw.enabled!==false,
    createdAt:typeof raw.createdAt==="string"?raw.createdAt:new Date().toISOString(),
  };
  if (type==="once") { const at=new Date(raw.at); if (!isFinite(at.getTime())) return null; alarm.at=at.toISOString(); return alarm; }
  if (!isValidTime(raw.time)) return null;
  alarm.time=raw.time; alarm.lastFiredKey=typeof raw.lastFiredKey==="string"?raw.lastFiredKey:null;
  return alarm;
}
function sanitizeTimer(raw={}) {
  const i=(raw&&typeof raw==="object")?raw:{};
  const dur=intWithin(i.duration,60,1,MAX_TIMER_SECONDS), rem=intWithin(i.remaining,dur,1,MAX_TIMER_SECONDS);
  return {duration:dur,remaining:rem,running:false,endsAt:null};
}
function sanitizePomodoro(raw={}) {
  const i=(raw&&typeof raw==="object")?raw:{};
  return {
    enabled:boolOr(i.enabled,false), work:intRange(i.work,25,1,120),
    shortBreak:intRange(i.shortBreak,5,1,60), longBreak:intRange(i.longBreak,15,5,120),
    rounds:intRange(i.rounds,4,2,8), currentSession:intRange(i.currentSession,0,0,7),
    phase:["work","short","long"].includes(i.phase)?i.phase:"work",
  };
}
function sanitizeWorldClocks(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(w=>{
    if (!w||typeof w!=="object") return null;
    try { Intl.DateTimeFormat(undefined,{timeZone:w.tz}); } catch { return null; }
    return {id:typeof w.id==="string"?w.id:uid(), tz:w.tz, label:strOr(w.label,w.tz,30)};
  }).filter(Boolean);
}
function sanitizeState(raw) {
  return {
    settings:sanitizeSettings(raw.settings),
    alarms:Array.isArray(raw.alarms)?raw.alarms.map(sanitizeAlarm).filter(Boolean):[],
    timer:sanitizeTimer(raw.timer), pomodoro:sanitizePomodoro(raw.pomodoro),
    worldClocks:sanitizeWorldClocks(raw.worldClocks),
  };
}

/* ================================================================
   DOM elements
   ================================================================ */
const html = document.documentElement;
const el = {
  html, tabs:[...document.querySelectorAll("[data-tab-target]")], pages:[...document.querySelectorAll(".page")],
  brandHome:document.getElementById("brandHome"), topbar:document.getElementById("topbar"),
  fullscreenBtn:document.getElementById("fullscreenBtn"),
  keyboardShortcutsBtn:document.getElementById("keyboardShortcutsBtn"),
  shortcutsDialog:document.getElementById("shortcutsDialog"),
  closeShortcuts:document.getElementById("closeShortcuts"),
  toast:document.getElementById("toast"), bgFx:document.getElementById("bgFx"),
  greetingEyebrow:document.getElementById("greetingEyebrow"),
  greetingName:document.getElementById("greetingName"),
  digitalClock:document.getElementById("digitalClock"),
  ckHH:null, ckMM:null, ckSS:null, ckSuffix:null,
  analogClock:document.getElementById("analogClock"),
  acHourHand:document.getElementById("acHourHand"), acMinHand:document.getElementById("acMinHand"),
  acSecHand:document.getElementById("acSecHand"), acMarkers:document.getElementById("acMarkers"),
  flipClock:document.getElementById("flipClock"),
  flipH1:document.getElementById("flipH1"), flipH2:document.getElementById("flipH2"),
  flipM1:document.getElementById("flipM1"), flipM2:document.getElementById("flipM2"),
  flipS1:document.getElementById("flipS1"), flipS2:document.getElementById("flipS2"),
  faceButtons:[...document.querySelectorAll("[data-face]")],
  dateLabel:document.getElementById("dateLabel"),
  timezoneLabel:document.getElementById("timezoneLabel"),
  nextAlarmLabel:document.getElementById("nextAlarmLabel"),
  audioStatus:document.getElementById("audioStatus"),
  unlockAudio:document.getElementById("unlockAudio"),
  alarmForm:document.getElementById("alarmForm"), alarmTime:document.getElementById("alarmTime"),
  alarmLabel:document.getElementById("alarmLabel"), alarmSound:document.getElementById("alarmSound"),
  alarmRepeat:document.getElementById("alarmRepeat"), alarmList:document.getElementById("alarmList"),
  quickOne:document.getElementById("quickOne"), quickTen:document.getElementById("quickTen"),
  quickThirty:document.getElementById("quickThirty"),
  quickTestAlarm:document.getElementById("quickTestAlarm"),
  testAlarmSound:document.getElementById("testAlarmSound"),
  timerDisplay:document.getElementById("timerDisplay"),
  timerRingArc:document.getElementById("timerRingArc"),
  timerHours:document.getElementById("timerHours"),
  timerMinutes:document.getElementById("timerMinutes"), timerSeconds:document.getElementById("timerSeconds"),
  startTimer:document.getElementById("startTimer"), pauseTimer:document.getElementById("pauseTimer"),
  resetTimer:document.getElementById("resetTimer"),
  startThreeSecondTimer:document.getElementById("startThreeSecondTimer"),
  timerPresets:[...document.querySelectorAll("[data-timer-preset]")],
  testTimerSound:document.getElementById("testTimerSound"),
  pomodoroToggle:document.getElementById("pomodoroToggle"),
  pomodoroSessions:document.getElementById("pomodoroSessions"),
  pomodoroSettings:document.getElementById("pomodoroSettings"),
  pomodoroWork:document.getElementById("pomodoroWork"), pomodoroBreak:document.getElementById("pomodoroBreak"),
  pomodoroLongBreak:document.getElementById("pomodoroLongBreak"),
  pomodoroRounds:document.getElementById("pomodoroRounds"),
  timerPomodoroLabel:document.getElementById("timerPomodoroLabel"),
  timerInputs:document.getElementById("timerInputs"),
  swHours:document.getElementById("swHours"), swMin:document.getElementById("swMin"),
  swSec:document.getElementById("swSec"), swCs:document.getElementById("swCs"),
  swSplitDelta:document.getElementById("swSplitDelta"),
  startStopwatch:document.getElementById("startStopwatch"),
  lapStopwatch:document.getElementById("lapStopwatch"),
  resetStopwatch:document.getElementById("resetStopwatch"),
  lapList:document.getElementById("lapList"), exportLaps:document.getElementById("exportLaps"),
  addWorldClock:document.getElementById("addWorldClock"),
  worldAddPanel:document.getElementById("worldAddPanel"),
  worldAddForm:document.getElementById("worldAddForm"),
  worldTimezone:document.getElementById("worldTimezone"),
  worldLabel:document.getElementById("worldLabel"),
  cancelWorldAdd:document.getElementById("cancelWorldAdd"),
  worldClockGrid:document.getElementById("worldClockGrid"),
  worldEmptyHint:document.getElementById("worldEmptyHint"),
  displayName:document.getElementById("displayName"),
  greetingStyle:document.getElementById("greetingStyle"),
  customMotto:document.getElementById("customMotto"),
  themeCards:[...document.querySelectorAll("[data-theme-pick]")],
  layoutSeg:document.querySelector('[data-seg="layout"]'),
  fontScaleSeg:document.querySelector('[data-seg="fontScale"]'),
  accentSwatches:document.getElementById("accentSwatches"),
  clockCustomColorToggle:document.getElementById("clockCustomColorToggle"),
  clockColorInputs:[document.getElementById("clockColor1"),document.getElementById("clockColor2"),document.getElementById("clockColor3")],
  fxToggle:document.getElementById("fxToggle"), scanlinesToggle:document.getElementById("scanlinesToggle"),
  grainToggle:document.getElementById("grainToggle"),
  topbarAutoHideToggle:document.getElementById("topbarAutoHideToggle"),
  hourToggle:document.getElementById("hourToggle"), secondsToggle:document.getElementById("secondsToggle"),
  blinkToggle:document.getElementById("blinkToggle"), dateFormat:document.getElementById("dateFormat"),
  defaultAlarmSound:document.getElementById("defaultAlarmSound"),
  defaultTimerSound:document.getElementById("defaultTimerSound"),
  volumeRange:document.getElementById("volumeRange"), mutedToggle:document.getElementById("mutedToggle"),
  ambientBtns:[...document.querySelectorAll("[data-ambient]")],
  ambientVolume:document.getElementById("ambientVolume"),
  resetSettings:document.getElementById("resetSettings"),
  ringDialog:document.getElementById("ringDialog"), ringKind:document.getElementById("ringKind"),
  ringTitle:document.getElementById("ringTitle"), ringDetail:document.getElementById("ringDetail"),
  stopRing:document.getElementById("stopRing"), snoozeRing:document.getElementById("snoozeRing"),
};
el.ckHH=el.digitalClock.querySelector(".ck-hh");
el.ckMM=el.digitalClock.querySelector(".ck-mm");
el.ckSS=el.digitalClock.querySelector(".ck-ss");
el.ckSuffix=el.digitalClock.querySelector(".ck-suffix");

/* ================================================================
   Utility
   ================================================================ */
function pad(n) { return String(n).padStart(2,"0"); }
function hexA(hex,alpha) {
  if (!hexColor(hex)) hex="#39ff88";
  const m=hex.replace("#",""), v=m.length===3?m.split("").map(c=>c+c).join(""):m;
  return `rgba(${parseInt(v.slice(0,2),16)},${parseInt(v.slice(2,4),16)},${parseInt(v.slice(4,6),16)},${alpha})`;
}
function showToast(msg) {
  el.toast.textContent=msg; el.toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t=setTimeout(()=>el.toast.classList.remove("show"),2400);
}

/* ================================================================
   Settings application
   ================================================================ */
function applySettings() {
  const s=state.settings;
  html.dataset.theme=s.theme; html.dataset.layout=s.layout; html.dataset.face=s.face;
  html.dataset.fx=s.fx?"on":"off"; html.dataset.scanlines=s.scanlines?"on":"off";
  html.dataset.grain=s.grain?"on":"off"; html.dataset.showSeconds=s.showSeconds?"on":"off";
  html.dataset.blink=s.blink?"on":"off"; html.dataset.topbar=s.topbarAutoHide?"auto-hide":"fixed";
  const clk=s.customClockColors?normalizeClockColors(s.clockColors,s.theme):themeClockColors(s.theme);
  state.settings.clockColors=clk; html.dataset.clockColors=s.customClockColors?"custom":"theme";
  clk.forEach((c,i)=>html.style.setProperty(`--clock-custom-${i+1}`,c));
  const acc=s.accent||THEME_DEFAULT_ACCENTS[s.theme];
  html.style.setProperty("--accent",acc);
  html.style.setProperty("--accent-2",ACCENT_2_PAIRS[acc]||acc);
  html.style.setProperty("--accent-soft",hexA(acc,0.16));
  html.style.setProperty("--font-scale",FONT_SCALE_MAP[s.fontScale]||"1");
  el.themeCards.forEach(c=>c.setAttribute("aria-pressed",c.dataset.themePick===s.theme?"true":"false"));
  el.faceButtons.forEach(b=>{const on=b.dataset.face===s.face;b.setAttribute("aria-pressed",on?"true":"false");b.classList.toggle("active",on);});
  if (el.layoutSeg) [...el.layoutSeg.querySelectorAll("[data-seg-val]")].forEach(b=>b.setAttribute("aria-pressed",b.dataset.segVal===s.layout?"true":"false"));
  if (el.fontScaleSeg) [...el.fontScaleSeg.querySelectorAll("[data-seg-val]")].forEach(b=>b.setAttribute("aria-pressed",b.dataset.segVal===s.fontScale?"true":"false"));
  el.defaultAlarmSound.value=s.defaultAlarmSound; el.defaultTimerSound.value=s.defaultTimerSound;
  el.volumeRange.value=s.volume; el.mutedToggle.checked=s.muted;
  el.hourToggle.checked=s.hour12; el.secondsToggle.checked=s.showSeconds;
  el.blinkToggle.checked=s.blink; el.fxToggle.checked=s.fx;
  el.scanlinesToggle.checked=s.scanlines;
  if (el.grainToggle) el.grainToggle.checked=s.grain;
  el.topbarAutoHideToggle.checked=s.topbarAutoHide;
  el.clockCustomColorToggle.checked=s.customClockColors;
  el.clockColorInputs.forEach((inp,i)=>{if(inp)inp.value=clk[i];});
  el.dateFormat.value=s.dateFormat; el.displayName.value=s.displayName;
  el.greetingStyle.value=s.greetingStyle; el.customMotto.value=s.customMotto;
  el.alarmSound.value=s.defaultAlarmSound;
  if (el.ambientVolume) el.ambientVolume.value=s.ambientVolume;
  el.ambientBtns.forEach(b=>b.setAttribute("aria-pressed",b.dataset.ambient===s.ambient?"true":"false"));
  renderAccentSwatches(); renderGreeting(); startFx(); updateAudioStatus(); updateMasterGain();
}
function renderAccentSwatches() {
  const opts=ACCENT_OPTIONS[state.settings.theme]||[], cur=state.settings.accent||THEME_DEFAULT_ACCENTS[state.settings.theme];
  el.accentSwatches.replaceChildren();
  for (const c of opts) {
    const b=document.createElement("button"); b.type="button"; b.className="swatch";
    b.style.setProperty("--c",c); b.setAttribute("aria-label","Accent "+c);
    b.setAttribute("aria-pressed",c===cur?"true":"false");
    b.addEventListener("click",()=>{state.settings.accent=c;saveState();applySettings();});
    el.accentSwatches.append(b);
  }
}
function cycleTheme(dir) {
  const themes=[...VALID_THEMES], idx=themes.indexOf(state.settings.theme);
  state.settings.theme=themes[(idx+dir+themes.length)%themes.length];
  state.settings.accent=null; saveState(); applySettings();
  showToast(state.settings.theme.charAt(0).toUpperCase()+state.settings.theme.slice(1));
}

/* ================================================================
   Greeting + quotes
   ================================================================ */
function timeGreeting(d=new Date()) {
  const h=d.getHours();
  if (h<5) return "Working late"; if (h<12) return "Good morning";
  if (h<17) return "Good afternoon"; if (h<22) return "Good evening";
  return "Good night";
}
function renderGreeting() {
  const s=state.settings, name=(s.displayName||"").trim();
  const area=el.greetingEyebrow.closest(".clock-greeting")||el.greetingEyebrow.parentElement;
  clearInterval(quoteState.timer);
  if (s.greetingStyle==="off") { area.style.display="none"; return; }
  area.style.display="";
  let eyebrow="",line="",isQuote=false;
  switch(s.greetingStyle) {
    case "static": eyebrow=name?timeGreeting():"Hi there"; line=name?name+".":"Welcome back."; break;
    case "motto":  eyebrow=timeGreeting(); line=(s.customMotto||"").trim()||(name?name+", make today count.":"Make today count."); break;
    default:
      eyebrow=name?timeGreeting()+", "+name:timeGreeting();
      quoteState.theme=s.theme; quoteState.list=(THEME_QUOTES[s.theme]||THEME_QUOTES.matrix).slice();
      quoteState.idx=Math.floor(Math.random()*quoteState.list.length);
      line=quoteState.list[quoteState.idx]; isQuote=true; break;
  }
  el.greetingEyebrow.textContent=eyebrow; el.greetingName.textContent=line;
  el.greetingName.dataset.noQuotes=isQuote?"false":"true";
  el.greetingName.setAttribute("title",isQuote?"Click for the next line":"");
  if (isQuote) startQuoteRotation();
}
function startQuoteRotation() {
  clearInterval(quoteState.timer); if (state.settings.greetingStyle!=="time") return;
  quoteState.timer=setInterval(()=>{ quoteState.idx=(quoteState.idx+1)%quoteState.list.length; swapQuote(quoteState.list[quoteState.idx]); },18000);
}
function swapQuote(text) { el.greetingName.classList.add("fading"); setTimeout(()=>{el.greetingName.textContent=text;el.greetingName.classList.remove("fading");},260); }
function cycleQuote() { if (state.settings.greetingStyle!=="time"||!quoteState.list.length) return; quoteState.idx=(quoteState.idx+1)%quoteState.list.length; swapQuote(quoteState.list[quoteState.idx]); startQuoteRotation(); }

/* ================================================================
   Navigation
   ================================================================ */
function switchPage(target) {
  el.tabs.forEach(t=>t.classList.toggle("active",t.dataset.tabTarget===target));
  el.pages.forEach(p=>p.classList.toggle("active",p.id===target));
}

/* ================================================================
   Clock rendering
   ================================================================ */
function updateClock(now=new Date()) {
  let h=now.getHours(),m=now.getMinutes(),s=now.getSeconds(),suffix="";
  if (state.settings.hour12) { suffix=h>=12?" PM":" AM"; h=h%12||12; }
  el.ckHH.textContent=pad(h); el.ckMM.textContent=pad(m); el.ckSS.textContent=pad(s); el.ckSuffix.textContent=suffix;
  document.title=pad(h)+":"+pad(m)+" · Such A Good Clock";
  if (state.settings.face==="analog") renderAnalogClock(now);
  if (state.settings.face==="flip")   renderFlipClock(now);
  el.dateLabel.textContent=formatDate(now);
  el.timezoneLabel.textContent=Intl.DateTimeFormat().resolvedOptions().timeZone;
  el.nextAlarmLabel.textContent=nextAlarmText(now);
}
function formatDate(now) {
  switch(state.settings.dateFormat) {
    case "off":   return "—";
    case "iso":   return now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate());
    case "short": return new Intl.DateTimeFormat("en-US",{weekday:"short",day:"2-digit",month:"short"}).format(now);
    default:      return new Intl.DateTimeFormat("en-US",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(now);
  }
}
function buildAnalogMarkers() {
  if (!el.acMarkers) return;
  el.acMarkers.innerHTML="";
  for (let i=0;i<60;i++) {
    const major=i%5===0, rad=(i*6-90)*Math.PI/180;
    const r1=major?79:84, r2=major?70:82;
    const line=document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1",100+Math.cos(rad)*r1); line.setAttribute("y1",100+Math.sin(rad)*r1);
    line.setAttribute("x2",100+Math.cos(rad)*r2); line.setAttribute("y2",100+Math.sin(rad)*r2);
    line.setAttribute("stroke",major?"currentColor":"rgba(128,128,128,0.4)");
    line.setAttribute("stroke-width",major?"2.5":"1");
    line.setAttribute("opacity",major?"0.7":"0.3");
    el.acMarkers.appendChild(line);
  }
}
function renderAnalogClock(now) {
  if (!el.acHourHand) return;
  const h=now.getHours()%12,m=now.getMinutes(),s=now.getSeconds(),ms=now.getMilliseconds();
  el.acHourHand.setAttribute("transform","rotate("+(( h+m/60+s/3600)*30)+",100,100)");
  el.acMinHand.setAttribute("transform","rotate("+((m+s/60)*6)+",100,100)");
  el.acSecHand.setAttribute("transform","rotate("+((s+ms/1000)*6)+",100,100)");
}
function renderFlipClock(now) {
  let h=now.getHours(),m=now.getMinutes(),s=now.getSeconds();
  if (state.settings.hour12) h=h%12||12;
  const digits={h1:Math.floor(h/10),h2:h%10,m1:Math.floor(m/10),m2:m%10,s1:Math.floor(s/10),s2:s%10};
  const cards={h1:el.flipH1,h2:el.flipH2,m1:el.flipM1,m2:el.flipM2,s1:el.flipS1,s2:el.flipS2};
  for (const [key,val] of Object.entries(digits)) {
    if (val!==flipPrev[key]&&cards[key]) {
      cards[key].querySelector(".flip-top span").textContent=val;
      cards[key].querySelector(".flip-bottom span").textContent=val;
      cards[key].classList.remove("is-flipping"); void cards[key].offsetWidth; cards[key].classList.add("is-flipping");
      flipPrev[key]=val;
    }
  }
}

/* ================================================================
   Alarms
   ================================================================ */
function timeInputFor(d) { return pad(d.getHours())+":"+pad(d.getMinutes()); }
function setDefaultAlarmTime() { if (el.alarmTime) el.alarmTime.value=timeInputFor(new Date(Date.now()+60000)); }
function addAlarm(time,label,sound,repeat="daily") {
  if (!isValidTime(time)) { showToast("Choose a valid time."); return null; }
  const now=new Date(), [hh,mm]=time.split(":").map(Number);
  const already=now.getHours()===hh&&now.getMinutes()===mm;
  const alarm={
    id:uid(), type:repeat, time, label:strOr(label,"Alarm",40).trim()||"Alarm",
    sound:enumOr(sound,VALID_SOUNDS,state.settings.defaultAlarmSound), enabled:true,
    lastFiredKey:(already&&repeat!=="once")?alarmDueKey(now,{time}):null,
    createdAt:now.toISOString(),
  };
  state.alarms.push(alarm); saveState(); renderAlarms(); updateClock(); return alarm;
}
function addOneTimeAlarm(secsFromNow,label="One-time alarm",sound=state.settings.defaultAlarmSound) {
  const delay=numRange(secsFromNow,1,1,MAX_TIMER_SECONDS);
  const dueAt=new Date(Date.now()+delay*1000);
  const alarm={
    id:uid(), type:"once", at:dueAt.toISOString(),
    label:strOr(label,"Alarm",40).trim()||"Alarm",
    sound:enumOr(sound,VALID_SOUNDS,state.settings.defaultAlarmSound),
    enabled:true, createdAt:new Date().toISOString(),
  };
  state.alarms.push(alarm); saveState(); renderAlarms(); updateClock();
  showToast(alarm.label+" set for "+dueAt.toLocaleTimeString("en-US")+"."); return alarm;
}
function removeAlarm(id) { state.alarms=state.alarms.filter(a=>a.id!==id); saveState(); renderAlarms(); updateClock(); }
function toggleAlarm(id) {
  const a=state.alarms.find(x=>x.id===id); if (!a) return;
  a.enabled=!a.enabled; a.lastFiredKey=null; saveState(); renderAlarms(); updateClock();
}
function renderAlarms() {
  el.alarmList.replaceChildren();
  if (!state.alarms.length) {
    const e=document.createElement("div"); e.className="list-item"; e.textContent="No alarms yet."; el.alarmList.append(e); return;
  }
  const sorted=[...state.alarms].sort((a,b)=>nextDateForAlarm(a)-nextDateForAlarm(b));
  for (const alarm of sorted) {
    const item=document.createElement("article"); item.className="list-item"; item.dataset.testid="alarm-item";
    const text=document.createElement("div");
    const title=document.createElement("p"); title.className="list-title"; title.textContent=alarm.label;
    const sub=document.createElement("p"); sub.className="list-subtitle";
    const rl=alarm.type==="daily"?"Daily":alarm.type==="weekdays"?"Weekdays":alarm.type==="weekends"?"Weekends":"Once";
    sub.textContent=alarm.type==="once"?new Date(alarm.at).toLocaleString("en-US")+" · "+alarm.sound:rl+" at "+alarm.time+" · "+alarm.sound;
    text.append(title,sub);
    const pill=document.createElement("span"); pill.className="pill"; pill.textContent=alarm.enabled?"On":"Off";
    const acts=document.createElement("div"); acts.className="quick-row"; acts.style.margin="0";
    const tog=document.createElement("button"); tog.type="button"; tog.textContent=alarm.enabled?"Disable":"Enable";
    tog.addEventListener("click",()=>toggleAlarm(alarm.id));
    const del=document.createElement("button"); del.type="button"; del.textContent="Delete";
    del.addEventListener("click",()=>removeAlarm(alarm.id));
    acts.append(tog,del); item.append(text,pill,acts); el.alarmList.append(item);
  }
}
function nextDateForAlarm(alarm,now=new Date()) {
  if (!alarm.enabled) return new Date(8.64e15);
  if (alarm.type==="once") { const at=new Date(alarm.at); return isFinite(at.getTime())?at:new Date(8.64e15); }
  if (!isValidTime(alarm.time)) return new Date(8.64e15);
  const [hh,mm]=alarm.time.split(":").map(Number);
  const next=new Date(now); next.setHours(hh,mm,0,0);
  if (next<=now) next.setDate(next.getDate()+1);
  if (alarm.type==="weekdays"){let t=0;while([0,6].includes(next.getDay())&&t++<10)next.setDate(next.getDate()+1);}
  if (alarm.type==="weekends"){let t=0;while(![0,6].includes(next.getDay())&&t++<10)next.setDate(next.getDate()+1);}
  return next;
}
function nextAlarmText(now=new Date()) {
  const active=state.alarms.filter(a=>a.enabled).map(a=>({alarm:a,date:nextDateForAlarm(a,now)})).filter(({date})=>isFinite(date.getTime())&&date<8.64e15);
  if (!active.length) return "No alarms";
  const next=active.sort((a,b)=>a.date-b.date)[0];
  return next.alarm.label+" · in "+formatDuration(Math.max(0,Math.round((next.date-now)/1000)));
}
function alarmDueKey(now,alarm) { return now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+"-"+alarm.time; }
function checkAlarms(now=new Date()) {
  for (const a of state.alarms) {
    if (!a.enabled) continue;
    if (a.type==="once") { if (new Date(a.at)<=now) { a.enabled=false; fireAlarm(a); } continue; }
    if (!isValidTime(a.time)) continue;
    const [hh,mm]=a.time.split(":").map(Number), key=alarmDueKey(now,a);
    if (now.getHours()===hh&&now.getMinutes()===mm&&a.lastFiredKey!==key) {
      const dow=now.getDay();
      if (a.type==="weekdays"&&(dow===0||dow===6)) continue;
      if (a.type==="weekends"&&dow!==0&&dow!==6) continue;
      a.lastFiredKey=key; fireAlarm(a);
    }
  }
}
function fireAlarm(alarm) { saveState(); renderAlarms(); showRing({kind:"alarm",title:alarm.label,detail:"Your alarm is ringing.",sound:alarm.sound}); }

/* ================================================================
   Timer
   ================================================================ */
function formatDuration(totalSecs) {
  const s=Math.max(0,Math.ceil(isFinite(+totalSecs)?+totalSecs:0));
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),r=s%60;
  return h>0?pad(h)+":"+pad(m)+":"+pad(r):pad(m)+":"+pad(r);
}
function timerSecsFromInputs() {
  const h=parseInt(el.timerHours?.value||"0",10)||0;
  const m=parseInt(el.timerMinutes?.value||"0",10)||0;
  const s=parseInt(el.timerSeconds?.value||"0",10)||0;
  return Math.max(1,Math.min(MAX_TIMER_SECONDS,h*3600+m*60+s));
}
function setTimerDuration(secs) {
  const ns=intRange(secs,60,1,MAX_TIMER_SECONDS);
  state.timer.duration=ns; state.timer.remaining=ns; state.timer.running=false; state.timer.endsAt=null;
  if (el.timerHours)   el.timerHours.value=Math.floor(ns/3600);
  if (el.timerMinutes) el.timerMinutes.value=Math.floor((ns%3600)/60);
  if (el.timerSeconds) el.timerSeconds.value=ns%60;
  saveState(); renderTimer();
}
function startTimer() {
  void ensureAudio(); if (state.timer.remaining<=0) state.timer.remaining=timerSecsFromInputs();
  state.timer.duration=state.timer.remaining; state.timer.endsAt=Date.now()+state.timer.remaining*1000;
  state.timer.running=true; saveState(); renderTimer();
}
function pauseTimer() { updateTimerRemaining(); state.timer.running=false; state.timer.endsAt=null; saveState(); renderTimer(); }
function resetTimer()  { state.timer.running=false; state.timer.endsAt=null; state.timer.remaining=timerSecsFromInputs(); saveState(); renderTimer(); updateTimerRing(1,1); }
function updateTimerRemaining() {
  if (!state.timer.running||!state.timer.endsAt) return;
  state.timer.remaining=Math.max(0,Math.ceil((state.timer.endsAt-Date.now())/1000));
  if (state.timer.remaining<=0) {
    state.timer.running=false; state.timer.endsAt=null; saveState();
    if (state.pomodoro.enabled) { advancePomodoro(); return; }
    showRing({kind:"timer",title:"Timer complete",detail:"The countdown is complete.",sound:state.settings.defaultTimerSound});
  }
}
function renderTimer() {
  updateTimerRemaining();
  el.timerDisplay.textContent=formatDuration(state.timer.remaining);
  el.startTimer.disabled=state.timer.running; el.pauseTimer.disabled=!state.timer.running;
  updateTimerRing(state.timer.remaining,state.timer.duration||1);
}
function updateTimerRing(rem,tot) {
  if (!el.timerRingArc) return;
  const C=2*Math.PI*108, frac=tot>0?Math.max(0,Math.min(1,rem/tot)):0;
  el.timerRingArc.style.strokeDashoffset=C*(1-frac);
}

/* ================================================================
   Pomodoro
   ================================================================ */
function startPomodoro() {
  const p=state.pomodoro;
  const mins=p.phase==="work"?p.work:p.phase==="short"?p.shortBreak:p.longBreak;
  setTimerDuration(mins*60);
  if (el.timerRingArc) el.timerRingArc.classList.toggle("ring-break",p.phase!=="work");
  if (el.timerPomodoroLabel) { el.timerPomodoroLabel.hidden=false; el.timerPomodoroLabel.textContent=p.phase==="work"?"Work":p.phase==="short"?"Short Break":"Long Break"; }
  renderPomodoroDots(); startTimer();
}
function advancePomodoro() {
  const p=state.pomodoro;
  if (p.phase==="work") { p.currentSession++; if (p.currentSession>=p.rounds){p.phase="long";p.currentSession=0;}else{p.phase="short";} } else { p.phase="work"; }
  saveState(); showToast(p.phase==="work"?"Work time!":p.phase==="short"?"Short break!":"Long break!"); startPomodoro();
}
function renderPomodoroDots() {
  document.querySelectorAll(".pomodoro-dot").forEach((d,i)=>{
    d.classList.remove("done","active");
    if (i<state.pomodoro.currentSession) d.classList.add("done");
    else if (i===state.pomodoro.currentSession&&state.pomodoro.phase==="work") d.classList.add("active");
  });
}

/* ================================================================
   Stopwatch
   ================================================================ */
function formatMs(ms) {
  const t=Math.max(0,ms), m=Math.floor(t/60000), s=Math.floor((t%60000)/1000), c=Math.floor((t%1000)/10);
  return pad(m)+":"+pad(s)+"."+pad(c);
}
function renderStopwatch() {
  const elapsed=sw.running?sw.elapsed+(Date.now()-sw.startedAt):sw.elapsed;
  const h=Math.floor(elapsed/3600000), m=Math.floor((elapsed%3600000)/60000);
  const s=Math.floor((elapsed%60000)/1000), c=Math.floor((elapsed%1000)/10);
  if (el.swHours){el.swHours.textContent=pad(h)+":";el.swHours.classList.toggle("hidden",h===0);}
  if (el.swMin) el.swMin.textContent=pad(m);
  if (el.swSec) el.swSec.textContent=pad(s);
  if (el.swCs)  el.swCs.textContent=pad(c);
  if (el.swSplitDelta) {
    if (sw.laps.length>0&&sw.running){el.swSplitDelta.textContent="Lap: "+formatMs(elapsed-sw.lapStart);el.swSplitDelta.hidden=false;}
    else{el.swSplitDelta.hidden=true;}
  }
}
function addLap() {
  const elapsed=sw.elapsed+(Date.now()-sw.startedAt), lapTime=elapsed-sw.lapStart;
  sw.laps.push({n:sw.laps.length+1,split:lapTime,total:elapsed}); sw.lapStart=elapsed; renderLapList();
}
function renderLapList() {
  if (!el.lapList) return; el.lapList.replaceChildren(); if (!sw.laps.length) return;
  const splits=sw.laps.map(l=>l.split), best=Math.min(...splits), worst=splits.length>1?Math.max(...splits):-1;
  for (const lap of [...sw.laps].reverse()) {
    const item=document.createElement("div"); item.className="lap-item";
    if (lap.split===best&&sw.laps.length>1) item.classList.add("lap-best");
    if (lap.split===worst&&sw.laps.length>1) item.classList.add("lap-worst");
    const n=document.createElement("span"); n.className="lap-n"; n.textContent="#"+lap.n;
    const sp=document.createElement("span"); sp.className="lap-split"; sp.textContent=formatMs(lap.split);
    const tot=document.createElement("span"); tot.className="lap-total"; tot.textContent=formatMs(lap.total);
    item.append(n,sp,tot); el.lapList.append(item);
  }
  if (el.exportLaps) el.exportLaps.hidden=!sw.laps.length;
}
function swToggle() {
  if (sw.running){sw.elapsed+=Date.now()-sw.startedAt;sw.running=false;if(el.startStopwatch)el.startStopwatch.textContent="Start";if(el.lapStopwatch)el.lapStopwatch.disabled=true;}
  else{sw.startedAt=Date.now();sw.running=true;if(el.startStopwatch)el.startStopwatch.textContent="Stop";if(el.lapStopwatch)el.lapStopwatch.disabled=false;}
}
function swReset() {
  sw.elapsed=0;sw.running=false;sw.laps=[];sw.lapStart=0;
  renderStopwatch();renderLapList();
  if(el.startStopwatch)el.startStopwatch.textContent="Start";if(el.lapStopwatch)el.lapStopwatch.disabled=true;
}
function swLoop() { if (sw.running) renderStopwatch(); requestAnimationFrame(swLoop); }

/* ================================================================
   World Clock
   ================================================================ */
function populateTimezoneSelect() {
  if (!el.worldTimezone) return;
  const zones=Intl.supportedValuesOf?Intl.supportedValuesOf("timeZone"):FALLBACK_TIMEZONES;
  const frag=document.createDocumentFragment();
  for (const tz of zones) {
    const opt=document.createElement("option"); opt.value=tz; opt.textContent=tz.replace(/_/g," "); frag.append(opt);
  }
  el.worldTimezone.appendChild(frag);
  const local=Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (local) el.worldTimezone.value=local;
}
function addWorldClock(tz,label) {
  const displayLabel=(label||"").trim()||tz.split("/").pop().replace(/_/g," ");
  state.worldClocks.push({id:uid(),tz,label:displayLabel}); saveState(); renderWorldClocks();
}
function removeWorldClock(id) { state.worldClocks=state.worldClocks.filter(w=>w.id!==id); saveState(); renderWorldClocks(); }
function renderWorldClocks() {
  if (!el.worldClockGrid) return;
  el.worldClockGrid.replaceChildren();
  if (el.worldEmptyHint) el.worldEmptyHint.hidden=state.worldClocks.length>0;
  const now=new Date();
  for (const wc of state.worldClocks) {
    const card=document.createElement("article"); card.className="world-card"; card.dataset.id=wc.id;
    /* All values below are from Intl or computed numbers — safe to use textContent */
    let timeStr="--:--"; try { timeStr=new Intl.DateTimeFormat("en-US",{timeZone:wc.tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:state.settings.hour12}).format(now); } catch {}
    let dateStr=""; try { dateStr=new Intl.DateTimeFormat("en-US",{timeZone:wc.tz,weekday:"short",month:"short",day:"numeric"}).format(now); } catch {}
    let offStr=""; try { const utcD=new Date(now.toLocaleString("en-US",{timeZone:"UTC"})),tzD=new Date(now.toLocaleString("en-US",{timeZone:wc.tz})),offH=(tzD-utcD)/3600000; offStr=(offH>=0?"+":"")+offH.toFixed(1).replace(".0","")+"h"; } catch {}
    const timeEl=document.createElement("div"); timeEl.className="world-card-time"; timeEl.id="wct-"+wc.id; timeEl.textContent=timeStr;
    const nameEl=document.createElement("div"); nameEl.className="world-card-name"; nameEl.textContent=wc.label; /* user label — textContent is safe */
    const metaEl=document.createElement("div"); metaEl.className="world-card-meta";
    const tz1=document.createElement("span"); tz1.textContent=wc.tz.split("/").pop().replace(/_/g," ")+" · UTC"+offStr;
    const dt1=document.createElement("span"); dt1.textContent=dateStr;
    metaEl.append(tz1,dt1);
    const remBtn=document.createElement("button"); remBtn.className="world-card-remove";
    remBtn.dataset.removeId=wc.id; remBtn.setAttribute("aria-label","Remove "+escHtml(wc.label));
    remBtn.textContent="×";
    card.append(timeEl,nameEl,metaEl,remBtn); el.worldClockGrid.append(card);
  }
}
function updateWorldClocks(now) {
  for (const wc of state.worldClocks) {
    const el2=document.getElementById("wct-"+wc.id); if (!el2) continue;
    try { el2.textContent=new Intl.DateTimeFormat("en-US",{timeZone:wc.tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:state.settings.hour12}).format(now); } catch {}
  }
}

/* ================================================================
   Audio
   ================================================================ */
async function ensureAudio() {
  if (!audio.context) {
    const Ctor=window.AudioContext||window.webkitAudioContext; if (!Ctor){audio.unlocked=false;updateAudioStatus();return false;}
    audio.context=new Ctor(); audio.master=audio.context.createGain(); audio.master.connect(audio.context.destination); updateMasterGain();
  }
  if (audio.context.state==="suspended"){try{await audio.context.resume();}catch{audio.unlocked=false;}}
  audio.unlocked=audio.context.state==="running"; updateAudioStatus(); return audio.unlocked;
}
function updateMasterGain() { if (audio.master) audio.master.gain.value=state.settings.muted?0:state.settings.volume; }
function updateAudioStatus() { el.audioStatus.textContent=(audio.unlocked?"Ready":"Locked")+(state.settings.muted?", muted":""); }
function soundPattern(name) {
  return ({
    bell:   [{f:880,t:0,d:.22},{f:660,t:.24,d:.22},{f:990,t:.49,d:.32}],
    pulse:  [{f:392,t:0,d:.18},{f:392,t:.28,d:.18},{f:523,t:.56,d:.24}],
    triple: [{f:523,t:0,d:.16},{f:659,t:.18,d:.16},{f:784,t:.36,d:.22}],
    digital:[{f:1047,t:0,d:.08},{f:1047,t:.12,d:.08},{f:1047,t:.24,d:.08},{f:1319,t:.36,d:.14}],
    cosmic: [{f:196,t:0,d:.6},{f:247,t:.2,d:.5},{f:294,t:.45,d:.4},{f:392,t:.7,d:.35}],
    gentle: [{f:440,t:0,d:.4},{f:554,t:.3,d:.4},{f:659,t:.6,d:.5},{f:880,t:.9,d:.6}],
  }[name]||[{f:880,t:0,d:.22},{f:660,t:.24,d:.22},{f:990,t:.49,d:.32}]);
}
async function playSound(kind,snd) {
  const ok=await ensureAudio();
  const resolved=snd||(kind==="timer"?state.settings.defaultTimerSound:state.settings.defaultAlarmSound);
  soundEvents.push({type:kind,sound:resolved,at:new Date().toISOString()});
  if (!ok||state.settings.muted||!audio.context||!audio.master){if(navigator.vibrate)navigator.vibrate([160,80,160]);return false;}
  const now2=audio.context.currentTime+0.03;
  for (const note of soundPattern(resolved)) {
    const osc=audio.context.createOscillator(),gain=audio.context.createGain();
    osc.type=kind==="alarm"?"square":"sine"; osc.frequency.setValueAtTime(note.f,now2+note.t);
    gain.gain.setValueAtTime(0.0001,now2+note.t); gain.gain.exponentialRampToValueAtTime(0.42,now2+note.t+.025);
    gain.gain.exponentialRampToValueAtTime(0.0001,now2+note.t+note.d);
    osc.connect(gain);gain.connect(audio.master);osc.start(now2+note.t);osc.stop(now2+note.t+note.d+.05);
    audio.nodes.add(osc);osc.addEventListener("ended",()=>audio.nodes.delete(osc),{once:true});
  }
  return true;
}
function stopRepeatingSound() { clearInterval(audio.repeatHandle);audio.repeatHandle=null;for(const n of audio.nodes){try{n.stop();}catch{}}audio.nodes.clear(); }
function startRepeatingSound(kind,snd) { stopRepeatingSound();void playSound(kind,snd);audio.repeatHandle=setInterval(()=>void playSound(kind,snd),kind==="alarm"?1250:1500); }
function startAmbient(name) {
  stopAmbient(); ambient.current=name;
  if (name==="off"||!audio.context) return;
  const ctx=audio.context; ambient.gain=ctx.createGain(); ambient.gain.gain.value=state.settings.ambientVolume; ambient.gain.connect(ctx.destination); ambient.nodes=[ambient.gain];
  if (name==="rain"||name==="fan") {
    const bufSize=8192,buf=ctx.createScriptProcessor(bufSize,1,1);
    buf.onaudioprocess=e=>{const o=e.outputBuffer.getChannelData(0);for(let i=0;i<bufSize;i++)o[i]=Math.random()*2-1;};
    const filt=ctx.createBiquadFilter(); filt.type=name==="rain"?"bandpass":"lowpass"; filt.frequency.value=name==="rain"?1200:600; filt.Q.value=name==="rain"?.5:1;
    buf.connect(filt);filt.connect(ambient.gain);ambient.nodes.push(buf,filt);
  } else if (name==="space") {
    const osc=ctx.createOscillator();osc.type="sine";osc.frequency.value=55;
    const lfo=ctx.createOscillator();lfo.frequency.value=.08; const lfog=ctx.createGain();lfog.gain.value=10;
    lfo.connect(lfog);lfog.connect(osc.frequency);osc.connect(ambient.gain);osc.start();lfo.start();ambient.nodes.push(osc,lfo,lfog);
  } else {
    const freqs=name==="cafe"?[120,180,240,300]:[200,280,360,440];
    for (const f of freqs){const osc=ctx.createOscillator();osc.type="sine";osc.frequency.value=f;const g=ctx.createGain();g.gain.value=.04+Math.random()*.04;osc.connect(g);g.connect(ambient.gain);osc.start();ambient.nodes.push(osc,g);}
  }
}
function stopAmbient() { ambient.current="off";for(const n of ambient.nodes){try{n.stop?.();n.disconnect?.();}catch{}}ambient.nodes=[];ambient.gain=null; }
function updateAmbientVolume() { if (ambient.gain?.gain) ambient.gain.gain.value=state.settings.ambientVolume; }

/* ================================================================
   Ring dialog
   ================================================================ */
function showRing({kind,title,detail,sound}) {
  currentRing={kind,title,detail,sound};
  el.ringKind.textContent=kind==="alarm"?"Alarm":"Timer";
  el.ringTitle.textContent=title; el.ringDetail.textContent=detail;
  el.snoozeRing.hidden=kind!=="alarm";
  startRepeatingSound(kind,sound);
  if (!el.ringDialog.open){try{el.ringDialog.showModal();}catch{el.ringDialog.setAttribute("open","open");}}
}
function stopRing() { stopRepeatingSound();currentRing=null;if(el.ringDialog.open)el.ringDialog.close(); }
function snoozeCurrentRing() { if (!currentRing||currentRing.kind!=="alarm") return; addOneTimeAlarm(300,"Snooze: "+currentRing.title,currentRing.sound); stopRing(); }

/* ================================================================
   Fullscreen + keyboard
   ================================================================ */
function toggleFullscreen() { if (!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});else document.exitFullscreen().catch(()=>{}); }
document.addEventListener("fullscreenchange",()=>{if(el.fullscreenBtn)el.fullscreenBtn.setAttribute("aria-label",document.fullscreenElement?"Exit fullscreen":"Fullscreen (F)");});
function bindKeyboard() {
  window.addEventListener("keydown",e=>{
    if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT") return;
    const active=document.querySelector(".page.active")?.id;
    switch(e.key){
      case " ": e.preventDefault(); if(active==="timer"){state.timer.running?pauseTimer():startTimer();}else if(active==="stopwatch"){swToggle();} break;
      case "r": case "R": if(active==="timer")resetTimer();else if(active==="stopwatch")swReset(); break;
      case "l": case "L": if(active==="stopwatch"&&sw.running)addLap(); break;
      case "f": case "F": toggleFullscreen(); break;
      case "?": el.shortcutsDialog?.showModal(); break;
      case "Escape": if(el.ringDialog?.open)stopRing();if(el.shortcutsDialog?.open)el.shortcutsDialog.close(); break;
      case "1":switchPage("clock");break; case "2":switchPage("alarms");break;
      case "3":switchPage("timer");break; case "4":switchPage("stopwatch");break;
      case "5":switchPage("world");break; case "6":switchPage("settings");break;
      case "ArrowRight":cycleTheme(1);break; case "ArrowLeft":cycleTheme(-1);break;
    }
  });
}

/* ================================================================
   Event binding
   ================================================================ */
function bindEvents() {
  el.brandHome.addEventListener("click",e=>{e.preventDefault();switchPage("clock");});
  el.tabs.forEach(t=>t.addEventListener("click",()=>switchPage(t.dataset.tabTarget)));
  el.greetingName.addEventListener("click",cycleQuote);
  el.greetingName.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();cycleQuote();}});
  window.addEventListener("pointerdown",()=>void ensureAudio(),{once:true});
  window.addEventListener("keydown",()=>void ensureAudio(),{once:true});
  el.unlockAudio.addEventListener("click",async()=>{const ok=await ensureAudio();showToast(ok?"Audio ready.":"Browser blocked audio.");});
  el.alarmForm.addEventListener("submit",e=>{e.preventDefault();void ensureAudio();addAlarm(el.alarmTime.value,el.alarmLabel.value.trim(),el.alarmSound.value,el.alarmRepeat.value);showToast("Alarm added.");});
  el.quickOne?.addEventListener("click",()=>{void ensureAudio();addOneTimeAlarm(60,"+1 min alarm");});
  el.quickTen?.addEventListener("click",()=>{void ensureAudio();addOneTimeAlarm(600,"+10 min alarm");});
  el.quickThirty?.addEventListener("click",()=>{void ensureAudio();addOneTimeAlarm(1800,"+30 min alarm");});
  el.quickTestAlarm?.addEventListener("click",()=>{void ensureAudio();addOneTimeAlarm(5,"Test alarm");});
  el.testAlarmSound?.addEventListener("click",()=>{void ensureAudio();showRing({kind:"alarm",title:"Alarm sound test",detail:"Audio is playing.",sound:el.alarmSound.value});});
  el.startTimer.addEventListener("click",()=>{if(!state.timer.running){state.timer.remaining=timerSecsFromInputs();startTimer();}});
  el.pauseTimer.addEventListener("click",pauseTimer);
  el.resetTimer.addEventListener("click",resetTimer);
  el.startThreeSecondTimer?.addEventListener("click",()=>{void ensureAudio();setTimerDuration(3);startTimer();});
  el.timerPresets.forEach(b=>b.addEventListener("click",()=>setTimerDuration(+b.dataset.timerPreset)));
  el.testTimerSound?.addEventListener("click",()=>{void ensureAudio();showRing({kind:"timer",title:"Timer sound test",detail:"Audio is playing.",sound:state.settings.defaultTimerSound});});
  el.pomodoroToggle?.addEventListener("click",()=>{
    state.pomodoro.enabled=!state.pomodoro.enabled;
    el.pomodoroToggle.setAttribute("aria-pressed",state.pomodoro.enabled?"true":"false");
    if(el.pomodoroSettings)el.pomodoroSettings.hidden=!state.pomodoro.enabled;
    if(el.pomodoroSessions)el.pomodoroSessions.hidden=!state.pomodoro.enabled;
    if(el.timerInputs)el.timerInputs.hidden=state.pomodoro.enabled;
    saveState();
    if(state.pomodoro.enabled){state.pomodoro.phase="work";state.pomodoro.currentSession=0;startPomodoro();}
  });
  el.pomodoroWork?.addEventListener("input",()=>{state.pomodoro.work=intRange(el.pomodoroWork.value,25,1,120);saveState();});
  el.pomodoroBreak?.addEventListener("input",()=>{state.pomodoro.shortBreak=intRange(el.pomodoroBreak.value,5,1,60);saveState();});
  el.pomodoroLongBreak?.addEventListener("input",()=>{state.pomodoro.longBreak=intRange(el.pomodoroLongBreak.value,15,5,120);saveState();});
  el.pomodoroRounds?.addEventListener("input",()=>{state.pomodoro.rounds=intRange(el.pomodoroRounds.value,4,2,8);saveState();});
  el.startStopwatch?.addEventListener("click",swToggle);
  el.lapStopwatch?.addEventListener("click",()=>{if(sw.running)addLap();});
  el.resetStopwatch?.addEventListener("click",swReset);
  el.exportLaps?.addEventListener("click",()=>{const csv=["Lap,Split,Total",...sw.laps.map(l=>l.n+","+formatMs(l.split)+","+formatMs(l.total))].join("\n");const blob=new Blob([csv],{type:"text/csv"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="laps.csv";a.click();URL.revokeObjectURL(url);});
  el.addWorldClock?.addEventListener("click",()=>{if(el.worldAddPanel)el.worldAddPanel.hidden=false;});
  el.cancelWorldAdd?.addEventListener("click",()=>{if(el.worldAddPanel)el.worldAddPanel.hidden=true;});
  el.worldAddForm?.addEventListener("submit",e=>{e.preventDefault();addWorldClock(el.worldTimezone.value,el.worldLabel.value);if(el.worldAddPanel)el.worldAddPanel.hidden=true;el.worldLabel.value="";});
  el.worldClockGrid?.addEventListener("click",e=>{const btn=e.target.closest("[data-remove-id]");if(btn)removeWorldClock(btn.dataset.removeId);});
  el.faceButtons.forEach(b=>b.addEventListener("click",()=>{state.settings.face=b.dataset.face;saveState();applySettings();}));
  el.themeCards.forEach(c=>c.addEventListener("click",()=>{const t=c.dataset.themePick;state.settings.theme=t;state.settings.accent=null;state.settings.customClockColors=false;state.settings.clockColors=themeClockColors(t);saveState();applySettings();}));
  el.layoutSeg?.addEventListener("click",e=>{const b=e.target.closest("[data-seg-val]");if(b){state.settings.layout=b.dataset.segVal;saveState();applySettings();}});
  el.fontScaleSeg?.addEventListener("click",e=>{const b=e.target.closest("[data-seg-val]");if(b){state.settings.fontScale=b.dataset.segVal;saveState();applySettings();}});
  el.displayName.addEventListener("input",()=>{state.settings.displayName=el.displayName.value;saveState();renderGreeting();});
  el.greetingStyle.addEventListener("change",()=>{state.settings.greetingStyle=el.greetingStyle.value;saveState();renderGreeting();});
  el.customMotto.addEventListener("input",()=>{state.settings.customMotto=el.customMotto.value;saveState();renderGreeting();});
  el.defaultAlarmSound.addEventListener("change",()=>{state.settings.defaultAlarmSound=el.defaultAlarmSound.value;saveState();});
  el.defaultTimerSound.addEventListener("change",()=>{state.settings.defaultTimerSound=el.defaultTimerSound.value;saveState();});
  el.volumeRange.addEventListener("input",()=>{state.settings.volume=+el.volumeRange.value;saveState();updateMasterGain();});
  el.mutedToggle.addEventListener("change",()=>{state.settings.muted=el.mutedToggle.checked;saveState();updateMasterGain();updateAudioStatus();});
  el.hourToggle.addEventListener("change",()=>{state.settings.hour12=el.hourToggle.checked;saveState();updateClock();});
  el.secondsToggle.addEventListener("change",()=>{state.settings.showSeconds=el.secondsToggle.checked;saveState();applySettings();});
  el.blinkToggle.addEventListener("change",()=>{state.settings.blink=el.blinkToggle.checked;saveState();applySettings();});
  el.dateFormat.addEventListener("change",()=>{state.settings.dateFormat=el.dateFormat.value;saveState();updateClock();});
  el.fxToggle.addEventListener("change",()=>{state.settings.fx=el.fxToggle.checked;saveState();applySettings();});
  el.scanlinesToggle.addEventListener("change",()=>{state.settings.scanlines=el.scanlinesToggle.checked;saveState();applySettings();});
  el.grainToggle?.addEventListener("change",()=>{state.settings.grain=el.grainToggle.checked;saveState();applySettings();});
  el.topbarAutoHideToggle.addEventListener("change",()=>{state.settings.topbarAutoHide=el.topbarAutoHideToggle.checked;saveState();applySettings();});
  el.clockCustomColorToggle.addEventListener("change",()=>{state.settings.customClockColors=el.clockCustomColorToggle.checked;state.settings.clockColors=normalizeClockColors(state.settings.clockColors,state.settings.theme);saveState();applySettings();});
  el.clockColorInputs.forEach((inp,i)=>{if(!inp)return;inp.addEventListener("input",()=>{state.settings.clockColors=normalizeClockColors(state.settings.clockColors,state.settings.theme);state.settings.clockColors[i]=inp.value.toLowerCase();state.settings.customClockColors=true;saveState();applySettings();});});
  el.ambientBtns.forEach(b=>b.addEventListener("click",()=>{state.settings.ambient=b.dataset.ambient;saveState();applySettings();void ensureAudio().then(()=>startAmbient(state.settings.ambient));}));
  el.ambientVolume?.addEventListener("input",()=>{state.settings.ambientVolume=+el.ambientVolume.value;saveState();updateAmbientVolume();});
  el.resetSettings.addEventListener("click",()=>{if(!confirm("Reset all settings? Alarms and timer are kept."))return;state.settings=JSON.parse(JSON.stringify(defaults.settings));saveState();applySettings();updateClock();showToast("Settings reset.");});
  el.stopRing.addEventListener("click",stopRing);
  el.snoozeRing.addEventListener("click",snoozeCurrentRing);
  el.ringDialog.addEventListener("cancel",e=>{e.preventDefault();stopRing();});
  el.fullscreenBtn?.addEventListener("click",toggleFullscreen);
  el.keyboardShortcutsBtn?.addEventListener("click",()=>el.shortcutsDialog?.showModal());
  el.closeShortcuts?.addEventListener("click",()=>el.shortcutsDialog?.close());
  el.shortcutsDialog?.addEventListener("click",e=>{if(e.target===el.shortcutsDialog)el.shortcutsDialog.close();});
}

/* ================================================================
   Canvas FX
   ================================================================ */
const fx={raf:0,cleanup:null};
function stopFx(){if(fx.cleanup){try{fx.cleanup();}catch{}fx.cleanup=null;}cancelAnimationFrame(fx.raf);const ctx=el.bgFx.getContext("2d");if(ctx)ctx.clearRect(0,0,el.bgFx.width,el.bgFx.height);}
function startFx(){
  stopFx();if(!state.settings.fx)return;
  ({matrix:startMatrixRain,bladerunner:startDustStorm,alien:startAlienScan,pinkie:startConfetti,rainbow:startSpeedStreaks,interstellar:startInterstellar,cyberpunk:startCyberpunk,dune:startDune,synthwave:startSynthwave,mandalorian:startMandalorian,oppenheimer:startTrinity})[state.settings.theme]?.();
}
function fitCanvas(){const dpr=Math.min(window.devicePixelRatio||1,2),w=window.innerWidth,h=window.innerHeight;el.bgFx.width=Math.floor(w*dpr);el.bgFx.height=Math.floor(h*dpr);el.bgFx.style.width=w+"px";el.bgFx.style.height=h+"px";return{w,h,dpr};}

function startMatrixRain(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);const fs=16;let cols=Math.ceil(dims.w/fs);let drops=Array.from({length:cols},()=>({y:Math.floor(Math.random()*-dims.h/fs)*fs,v:0,ch:""}));const glyphs="ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｲﾝ0123456789".split("");function onResize(){const d=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(d.dpr,d.dpr);cols=Math.ceil(d.w/fs);drops=Array.from({length:cols},()=>({y:Math.floor(Math.random()*-d.h/fs)*fs,v:0,ch:""}));}window.addEventListener("resize",onResize);function frame(){const w=window.innerWidth,h=window.innerHeight;ctx.fillStyle="rgba(5,10,7,0.055)";ctx.fillRect(0,0,w,h);ctx.font=fs+"px \"VT323\",monospace";for(let i=0;i<cols;i++){const d=drops[i];d.v+=0.10+Math.random()*0.08;if(d.v>=fs){d.v-=fs;d.y+=fs;d.ch=glyphs[Math.random()*glyphs.length|0];const x=i*fs;ctx.fillStyle="rgba(220,255,230,0.95)";ctx.fillText(d.ch,x,d.y);ctx.fillStyle="rgba(57,255,136,0.45)";ctx.fillText(d.ch,x,d.y-fs);if(d.y>h+80&&Math.random()>.985)d.y=-20;if(d.y>h+600)d.y=-20;}}fx.raf=requestAnimationFrame(frame);}frame();fx.cleanup=()=>window.removeEventListener("resize",onResize);}

function startDustStorm(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);let parts=[];function seed(){const c=Math.floor((dims.w*dims.h)/9000);parts=[];for(let i=0;i<c;i++)parts.push({x:Math.random()*dims.w,y:Math.random()*dims.h,vx:.15+Math.random()*.4,vy:(Math.random()-.5)*.10,r:.4+Math.random()*1.6,a:.05+Math.random()*.18,hue:25+Math.random()*20});}seed();function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);seed();}window.addEventListener("resize",onResize);let t0=performance.now(),beamX=-200,beamPhase=0;function frame(t){const dt=(t-t0)/1000;t0=t;ctx.fillStyle="rgba(22,10,5,0.10)";ctx.fillRect(0,0,dims.w,dims.h);for(const p of parts){p.x+=p.vx;p.y+=p.vy+Math.sin((p.x+p.y)*.01)*.05;if(p.x>dims.w+20){p.x=-20;p.y=Math.random()*dims.h;}const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);grd.addColorStop(0,"hsla("+p.hue+",80%,70%,"+p.a+")");grd.addColorStop(1,"hsla("+p.hue+",80%,50%,0)");ctx.fillStyle=grd;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2);ctx.fill();}beamPhase+=dt;if(beamPhase>22){beamPhase=0;beamX=-240;}if(beamX<dims.w+240){beamX+=dt*110;const g2=ctx.createLinearGradient(beamX-120,0,beamX+120,0);g2.addColorStop(0,"rgba(255,170,80,0)");g2.addColorStop(.5,"rgba(255,200,110,0.10)");g2.addColorStop(1,"rgba(255,170,80,0)");ctx.fillStyle=g2;ctx.fillRect(beamX-120,0,240,dims.h);}fx.raf=requestAnimationFrame(frame);}fx.raf=requestAnimationFrame(frame);fx.cleanup=()=>window.removeEventListener("resize",onResize);}

function startAlienScan(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);}window.addEventListener("resize",onResize);let scanY=0,flicker=0,t0=performance.now();function frame(t){const dt=(t-t0)/1000;t0=t;ctx.clearRect(0,0,dims.w,dims.h);ctx.globalAlpha=.18;for(let i=0;i<90;i++){ctx.fillStyle="hsla("+(38+Math.random()*8)+",100%,50%,"+(0.08+Math.random()*.12)+")";ctx.fillRect(Math.random()*dims.w,Math.random()*dims.h,1,1);}ctx.globalAlpha=1;scanY+=dt*(dims.h/16);if(scanY>dims.h+80)scanY=-80;const grd=ctx.createLinearGradient(0,scanY-40,0,scanY+40);grd.addColorStop(0,"rgba(255,176,0,0)");grd.addColorStop(.5,"rgba(255,176,0,0.18)");grd.addColorStop(1,"rgba(255,176,0,0)");ctx.fillStyle=grd;ctx.fillRect(0,scanY-40,dims.w,80);ctx.fillStyle="rgba(255,200,80,0.55)";ctx.fillRect(0,scanY,dims.w,1);flicker+=dt;if(flicker>3+Math.random()*4){ctx.fillStyle="rgba(0,0,0,0.18)";ctx.fillRect(0,0,dims.w,dims.h);flicker=0;}fx.raf=requestAnimationFrame(frame);}fx.raf=requestAnimationFrame(frame);fx.cleanup=()=>window.removeEventListener("resize",onResize);}

function startConfetti(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);const colors=["#ff4ea8","#ffd83a","#5fd9ff","#a455ff","#ff8fd5","#ffffff"];let parts=[];function seed(){const c=Math.floor((dims.w*dims.h)/18000)+30;parts=[];for(let i=0;i<c;i++)parts.push({x:Math.random()*dims.w,y:Math.random()*-dims.h,vx:(Math.random()-.5)*.6,vy:.6+Math.random()*1.2,r:.6+Math.random()*1.2,w:6+Math.random()*8,h:3+Math.random()*6,ang:Math.random()*Math.PI*2,va:(Math.random()-.5)*.08,c:colors[Math.random()*colors.length|0]});}seed();function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);seed();}window.addEventListener("resize",onResize);function frame(){ctx.clearRect(0,0,dims.w,dims.h);for(const p of parts){p.x+=p.vx+Math.sin(p.ang)*.2;p.y+=p.vy;p.ang+=p.va;if(p.y>dims.h+20){p.y=-20;p.x=Math.random()*dims.w;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.ang);ctx.fillStyle=p.c;ctx.globalAlpha=.85;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();}ctx.globalAlpha=1;fx.raf=requestAnimationFrame(frame);}frame();fx.cleanup=()=>window.removeEventListener("resize",onResize);}

function startSpeedStreaks(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);const palette=["#ff3b3b","#ff8a1a","#ffd83a","#2db55a","#2db7ff","#a455ff"];let streaks=[];function makeStreak(){return{x:Math.random()*dims.w*1.5-dims.w*.3,y:Math.random()*dims.h,sp:4+Math.random()*4,len:80+Math.random()*220,thick:3+Math.random()*5,c:palette[Math.random()*palette.length|0],a:.18+Math.random()*.22};}function seed(){streaks=[];const c=Math.floor(dims.w/90)+6;for(let i=0;i<c;i++)streaks.push(makeStreak());}seed();function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);seed();}window.addEventListener("resize",onResize);const ANG=(-25*Math.PI)/180,dx=Math.cos(ANG),dy=Math.sin(ANG);function frame(){ctx.fillStyle="rgba(180,228,255,0.18)";ctx.fillRect(0,0,dims.w,dims.h);for(const s of streaks){s.x+=dx*s.sp;s.y+=dy*s.sp;if(s.x>dims.w+40||s.y<-40)Object.assign(s,makeStreak(),{x:-s.len,y:Math.random()*dims.h});const g=ctx.createLinearGradient(s.x-dx*s.len,s.y-dy*s.len,s.x,s.y);g.addColorStop(0,s.c+"00");g.addColorStop(1,s.c);ctx.strokeStyle=g;ctx.globalAlpha=s.a;ctx.lineWidth=s.thick;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(s.x-dx*s.len,s.y-dy*s.len);ctx.lineTo(s.x,s.y);ctx.stroke();}ctx.globalAlpha=1;fx.raf=requestAnimationFrame(frame);}frame();fx.cleanup=()=>window.removeEventListener("resize",onResize);}

function startInterstellar(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);let stars=[];function seed(){const c=Math.floor((dims.w*dims.h)/3500);stars=[];for(let i=0;i<c;i++){const d=Math.random();stars.push({x:Math.random()*dims.w,y:Math.random()*dims.h,r:.2+d*1.6,a:Math.random()*Math.PI*2,sp:.08+d*.5,vy:.02+d*.12,warm:Math.random()<.18});}}seed();function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);seed();}window.addEventListener("resize",onResize);let t0=performance.now(),np=0;function frame(t){const dt=(t-t0)/1000;t0=t;ctx.clearRect(0,0,dims.w,dims.h);np+=dt*.04;const nx=dims.w*(.65+Math.sin(np)*.04),ny=dims.h*(.35+Math.cos(np*.7)*.03),neb=ctx.createRadialGradient(nx,ny,0,nx,ny,Math.max(dims.w,dims.h)*.45);neb.addColorStop(0,"rgba(232,183,111,0.08)");neb.addColorStop(.5,"rgba(180,130,70,0.03)");neb.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=neb;ctx.fillRect(0,0,dims.w,dims.h);for(const s of stars){s.a+=dt*s.sp;s.y+=s.vy;if(s.y>dims.h+4){s.y=-4;s.x=Math.random()*dims.w;}const tw=.5+.5*Math.sin(s.a),alpha=(.55+.45*tw)*(.3+s.r*.5);if(s.warm){const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*4);g.addColorStop(0,"rgba(255,220,170,"+alpha+")");g.addColorStop(1,"rgba(232,183,111,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,s.r*4,0,Math.PI*2);ctx.fill();}else{ctx.fillStyle="rgba(245,248,255,"+alpha+")";ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();}}fx.raf=requestAnimationFrame(frame);}fx.raf=requestAnimationFrame(frame);fx.cleanup=()=>window.removeEventListener("resize",onResize);}

function startCyberpunk(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);let streams=[];const charset="01ABCDEF0123456789XYZMK".split("");function makeStream(){return{x:Math.random()*dims.w,y:-20,speed:1.5+Math.random()*3,chars:[],color:Math.random()<.5?"rgba(0,245,255,":"rgba(255,0,168,",len:5+Math.floor(Math.random()*12)};}function seed(){streams=[];for(let i=0;i<Math.floor(dims.w/24);i++){const s=makeStream();s.y=Math.random()*dims.h;streams.push(s);}}seed();function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);seed();}window.addEventListener("resize",onResize);function drawGrid(){ctx.strokeStyle="rgba(0,245,255,0.06)";ctx.lineWidth=.5;const gx=40,gy=40;for(let x=0;x<dims.w;x+=gx){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,dims.h);ctx.stroke();}for(let y=0;y<dims.h;y+=gy){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(dims.w,y);ctx.stroke();}}function frame(){ctx.fillStyle="rgba(13,0,26,0.15)";ctx.fillRect(0,0,dims.w,dims.h);drawGrid();ctx.font="12px Orbitron,monospace";for(const s of streams){s.y+=s.speed;if(s.chars.length<s.len)s.chars.unshift(charset[Math.random()*charset.length|0]);s.chars.forEach((ch,i)=>{const alpha=1-i/s.len;ctx.fillStyle=i===0?"rgba(220,255,255,0.95)":s.color+(alpha*.7)+")";ctx.fillText(ch,s.x,s.y-i*14);});if(s.y>dims.h+s.len*14)Object.assign(s,makeStream());}fx.raf=requestAnimationFrame(frame);}frame();fx.cleanup=()=>window.removeEventListener("resize",onResize);}

function startDune(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);let grains=[];function seed(){const c=Math.floor((dims.w*dims.h)/2000);grains=[];for(let i=0;i<c;i++)grains.push({x:Math.random()*dims.w,y:Math.random()*dims.h,vx:.3+Math.random()*.6,vy:(Math.random()-.5)*.15,r:.3+Math.random()*.8,a:.04+Math.random()*.12,hue:28+Math.random()*16});}seed();function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);seed();}window.addEventListener("resize",onResize);let t0=performance.now(),heatPhase=0;function frame(t){const dt=(t-t0)/1000;t0=t;ctx.fillStyle="rgba(26,16,8,0.12)";ctx.fillRect(0,0,dims.w,dims.h);for(const p of grains){p.x+=p.vx;p.y+=p.vy+Math.sin(p.x*.02+p.y*.01)*.08;if(p.x>dims.w+10){p.x=-10;p.y=Math.random()*dims.h;}const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);g.addColorStop(0,"hsla("+p.hue+",80%,65%,"+p.a+")");g.addColorStop(1,"hsla("+p.hue+",60%,40%,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);ctx.fill();}heatPhase+=dt*.04;const hx=dims.w*(.5+Math.sin(heatPhase)*.05),hy=dims.h*(.7+Math.sin(heatPhase*.7)*.06),hg=ctx.createRadialGradient(hx,hy,0,hx,hy,dims.w*.5);hg.addColorStop(0,"rgba(232,168,64,0.10)");hg.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=hg;ctx.fillRect(0,0,dims.w,dims.h);fx.raf=requestAnimationFrame(frame);}fx.raf=requestAnimationFrame(frame);fx.cleanup=()=>window.removeEventListener("resize",onResize);}

function startSynthwave(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);}window.addEventListener("resize",onResize);let t0=performance.now(),scanY=dims.h;function frame(t){const dt=(t-t0)/1000;t0=t;ctx.clearRect(0,0,dims.w,dims.h);const sunY=dims.h*.38,sunG=ctx.createRadialGradient(dims.w/2,sunY,0,dims.w/2,sunY,dims.w*.35);sunG.addColorStop(0,"rgba(255,180,80,0.4)");sunG.addColorStop(.4,"rgba(255,45,120,0.2)");sunG.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=sunG;ctx.fillRect(0,0,dims.w,dims.h);const hor=dims.h*.48;ctx.save();ctx.beginPath();ctx.rect(0,hor,dims.w,dims.h-hor);ctx.clip();for(let i=1;i<=20;i++){const y=hor+Math.pow(i/20,2)*(dims.h-hor);ctx.strokeStyle="rgba(255,45,120,"+(0.05+0.08*(i/20))+")";ctx.lineWidth=.5+.5*(i/20);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(dims.w,y);ctx.stroke();}for(let i=-8;i<=8;i++){ctx.strokeStyle="rgba(160,32,240,0.12)";ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(dims.w/2,hor);ctx.lineTo(dims.w/2+i*(dims.w/7),dims.h);ctx.stroke();}ctx.restore();scanY-=dt*40;if(scanY<hor)scanY=dims.h;const sg=ctx.createLinearGradient(0,scanY-6,0,scanY+6);sg.addColorStop(0,"rgba(0,212,255,0)");sg.addColorStop(.5,"rgba(0,212,255,0.15)");sg.addColorStop(1,"rgba(0,212,255,0)");ctx.fillStyle=sg;ctx.fillRect(0,scanY-6,dims.w,12);fx.raf=requestAnimationFrame(frame);}fx.raf=requestAnimationFrame(frame);fx.cleanup=()=>window.removeEventListener("resize",onResize);}

function startMandalorian(){let dims=fitCanvas();const ctx=el.bgFx.getContext("2d");ctx.scale(dims.dpr,dims.dpr);let stars=[];function seed(){const c=Math.floor((dims.w*dims.h)/4000);stars=[];for(let i=0;i<c;i++){const d=Math.random();stars.push({x:Math.random()*dims.w,y:Math.random()*dims.h,r:.15+d*.8,a:Math.random()*Math.PI*2,sp:.03+d*.3,vy:.01+d*.06,cold:Math.random()<.25});}}seed();function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);seed();}window.addEventListener("resize",onResize);let t0=performance.now(),shimmerPhase=0;function frame(t){const dt=(t-t0)/1000;t0=t;ctx.clearRect(0,0,dims.w,dims.h);shimmerPhase+=dt*.02;for(const s of stars){s.a+=dt*s.sp;s.y+=s.vy;if(s.y>dims.h+4){s.y=-4;s.x=Math.random()*dims.w;}const tw=.5+.5*Math.sin(s.a),alpha=(.5+.45*tw)*(.25+s.r*.5);ctx.fillStyle=s.cold?"rgba(142,171,204,"+alpha+")":"rgba(210,216,224,"+alpha+")";ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();}const sx=dims.w*(.5+Math.sin(shimmerPhase)*.1),sg=ctx.createLinearGradient(sx-20,0,sx+20,dims.h);sg.addColorStop(0,"rgba(200,212,224,0)");sg.addColorStop(.5,"rgba(200,212,224,0.04)");sg.addColorStop(1,"rgba(200,212,224,0)");ctx.fillStyle=sg;ctx.fillRect(0,0,dims.w,dims.h);fx.raf=requestAnimationFrame(frame);}fx.raf=requestAnimationFrame(frame);fx.cleanup=()=>window.removeEventListener("resize",onResize);}

/* Trinity (Oppenheimer) — an ambient, looping homage to the film's quantum
   visions. One ~48s loop, four movements:
     0%–40%  electron-dream : near-black field, a slow Bohr-atom of twinkling
                              electrons orbiting an off-centre nucleus.
     40%–78% heating        : the dark warms, agonisingly slowly, into the
                              film's sickly desaturated cream; electrons
                              dissolve as light shafts strengthen.
     78%–~85% detonation    : a SUDDEN, localized lower-left ground-burst bloom
                              (the "ani sararma"), never a full-screen flash.
     85%–100% cooldown       : fireball collapses, field cools back to black and
                              the first sparkles cross-fade in for a seamless loop.
   The canvas paints its own opaque backdrop each frame (the CSS overlay is
   cleared for this theme). Everything is built from 4 pre-baked sprites and
   drawn with `drawImage` only — no per-frame gradients/filters — so it is the
   cheapest FX in the app. Honours prefers-reduced-motion. */
function startTrinity(){
  let dims=fitCanvas();
  const ctx=el.bgFx.getContext("2d");
  ctx.scale(dims.dpr,dims.dpr);
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LOOP=reduce?192000:96000, FRAME_MS=reduce?80:33;    // ~96s loop (very slow ambient); ~12fps / ~30fps cap
  const lerp=(a,b,k)=>a+(b-a)*k;
  const ss=(e0,e1,x)=>{const k=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return k*k*(3-2*k);};
  const rgb=(c,a)=>"rgba("+(c[0]|0)+","+(c[1]|0)+","+(c[2]|0)+","+a+")";
  const EBG=[7,6,5], CREAM=[224,204,168], DARKR=[18,13,9];   // black → sickly cream → dim
  const CORE=[255,240,190], MID=[240,150,45], SPK=[245,244,238];
  let glowSpr,coreSpr,bloomSpr,beamSpr,vignSpr,nucleus,orbits,electrons,MIN;
  function radialSprite(size,stops){const c=document.createElement("canvas");c.width=c.height=size;const g=c.getContext("2d");const rg=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);stops.forEach(s=>rg.addColorStop(s[0],s[1]));g.fillStyle=rg;g.fillRect(0,0,size,size);return c;}
  function beamSprite(){const c=document.createElement("canvas");c.width=64;c.height=512;const g=c.getContext("2d");const lg=g.createLinearGradient(0,0,64,0);lg.addColorStop(0,"rgba(255,255,255,0)");lg.addColorStop(.5,"rgba(255,255,255,1)");lg.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=lg;g.fillRect(0,0,64,512);return c;}
  function seed(){
    MIN=Math.min(dims.w,dims.h);
    glowSpr =radialSprite(32,[[0,rgb(SPK,1)],[.4,rgb(SPK,.5)],[1,rgb(SPK,0)]]);
    coreSpr =radialSprite(128,[[0,rgb(CORE,1)],[.5,rgb(CORE,.4)],[1,rgb(CORE,0)]]);
    bloomSpr=radialSprite(256,[[0,"rgba(255,226,140,1)"],[.18,"rgba(255,196,80,0.92)"],[.5,rgb(MID,.4)],[1,rgb(MID,0)]]); // gold heart so it reads yellow, not white, when additive-saturated
    beamSpr =beamSprite();
    vignSpr =radialSprite(256,[[0,"rgba(0,0,0,0)"],[.62,"rgba(0,0,0,0)"],[1,"rgba(0,0,0,1)"]]);
    nucleus={x:dims.w*.44,y:dims.h*.50};
    orbits=[0,1,2].map(i=>({tilt:i*Math.PI/3,rx:MIN*.30,ry:MIN*.11}));   // 3 shells, 60° apart
    electrons=[];
    for(let i=0;i<14;i++){const ring=i%3;electrons.push({ring,th:Math.random()*Math.PI*2,w:(.022+Math.random()*.03)*(ring%2?-1:1),tw:Math.random()*Math.PI*2,twR:.4+Math.random()*.5,sz:6+Math.random()*6});}
  }
  seed();
  function onResize(){dims=fitCanvas();ctx.setTransform(1,0,0,1,0,0);ctx.scale(dims.dpr,dims.dpr);seed();}
  window.addEventListener("resize",onResize);
  let t0=performance.now(), startMs=t0, lastDraw=-1e9;
  function frame(t){
    if(t-lastDraw<FRAME_MS){fx.raf=requestAnimationFrame(frame);return;}
    let dt=(t-t0)/1000; t0=t; if(dt>.1)dt=.1;               // gap between DRAWN frames (rate-independent); clamp after tab-resume
    lastDraw=t;
    let p=((t-startMs)%LOOP)/LOOP;
    if(reduce)p=Math.min(p,.77);                            // hold pre-blast, no strobe
    const w=dims.w,h=dims.h;
    // phase scalars
    const heat=ss(.40,.78,p);                               // 0 dream → 1 cream
    const cool=p>=.85?ss(.85,1,p):0;                        // 0 → 1 back to dark
    const u=p>=.78?(p-.78)/.22:-1;                          // blast time, 0..1 over tail
    const B=u>=0?(1-Math.exp(-30*u))*Math.exp(-3.5*u)*(1-ss(.96,1,p)):0; // fast-attack / slow-decay; fades to 0 at the seam
    const eA=Math.max(1-heat,cool);                         // electrons: fade out, return for the seam
    const bright=heat*(1-cool);                             // cream-ness: peaks, then cools
    // 1) opaque backdrop: black → cream (heat) → dim → black (cool)
    let bg=[lerp(EBG[0],CREAM[0],heat),lerp(EBG[1],CREAM[1],heat),lerp(EBG[2],CREAM[2],heat)];
    if(cool>0){const k=cool,mid=[lerp(CREAM[0],DARKR[0],k),lerp(CREAM[1],DARKR[1],k),lerp(CREAM[2],DARKR[2],k)];bg=[lerp(mid[0],EBG[0],k),lerp(mid[1],EBG[1],k),lerp(mid[2],EBG[2],k)];}
    ctx.globalCompositeOperation="source-over"; ctx.globalAlpha=1;
    ctx.fillStyle=rgb(bg,1); ctx.fillRect(0,0,w,h);
    // 2) ambient light shafts (additive god-rays, strengthen toward the blast)
    ctx.globalCompositeOperation="lighter";
    const shaftA=.02+.10*bright+.18*B;
    if(shaftA>.005){for(let i=0;i<3;i++){const drift=((t/1000)*.008+i*.37)%1.2,sx=(drift-.1)*w,breathe=.7+.3*Math.sin(t/1000*.11+i);ctx.save();ctx.translate(sx,-.1*h);ctx.rotate((-22-i*2)*Math.PI/180);ctx.globalAlpha=shaftA*breathe;const bw=110+i*40;ctx.drawImage(beamSpr,-bw/2,0,bw,h*1.4);ctx.restore();}}
    // 3) electrons orbiting the nucleus, with faint motion-blur ghosts
    if(eA>.02){for(const e of electrons){e.th+=e.w*dt;e.tw+=dt*.55;const o=orbits[e.ring],ct=Math.cos(o.tilt),st=Math.sin(o.tilt),tw=e.twR*(.5+.5*Math.sin(e.tw));for(let g=0;g<3;g++){const th2=e.th-g*.12*Math.sign(e.w||1),gx=Math.cos(th2)*o.rx,gy=Math.sin(th2)*o.ry,px=nucleus.x+gx*ct-gy*st,py=nucleus.y+gx*st+gy*ct,ga=eA*(.5+.5*tw)*(g===0?1:.35-.1*g);if(ga<=.01)continue;ctx.globalAlpha=Math.max(0,ga);const s=e.sz*(g===0?1:.8);ctx.drawImage(glowSpr,px-s/2,py-s/2,s,s);}}ctx.globalAlpha=1;}
    // 4) localized Trinity bloom — low, off-centre, capped so it never washes white
    const bx=w*.40,by=h*.80;
    if(B>.004){const grow=1-Math.exp(-30*u),R=MIN*.55*grow,a=Math.min(.55,B);ctx.globalAlpha=a;ctx.drawImage(bloomSpr,bx-R,by-R,R*2,R*2);ctx.globalAlpha=Math.min(.4,a*1.25);const R2=R*1.25;ctx.drawImage(bloomSpr,bx-R2,by-R2,R2*2,R2*2);if(u<.04){const cR=R*.4;ctx.globalAlpha=Math.min(.45,(1-u/.04)*.45);ctx.drawImage(coreSpr,bx-cR,by-cR,cR*2,cR*2);}ctx.globalAlpha=1;}
    // 5) warm tint wash + edge-darken vignette (source-over, protects text contrast)
    ctx.globalCompositeOperation="source-over";
    if(bright>.02){ctx.globalAlpha=bright*.08;ctx.fillStyle=rgb(MID,1);ctx.fillRect(0,0,w,h);ctx.globalAlpha=bright*.45;ctx.drawImage(vignSpr,0,0,w,h);}
    ctx.globalAlpha=1; ctx.globalCompositeOperation="source-over";
    fx.raf=requestAnimationFrame(frame);
  }
  fx.raf=requestAnimationFrame(frame);
  fx.cleanup=()=>window.removeEventListener("resize",onResize);
}

/* ================================================================
   Test hooks
   ================================================================ */
window.__clockAppTest={
  get soundEvents(){return soundEvents;}, get alarms(){return state.alarms;}, get timer(){return state.timer;},
  async unlockAudio(){return ensureAudio();},
  clear(){state.alarms=[];state.timer={...defaults.timer};soundEvents.length=0;stopRing();saveState();renderAlarms();renderTimer();updateClock();},
  createTestAlarm(s=5){return addOneTimeAlarm(s,"Automated test alarm");},
  startTestTimer(s=3){setTimerDuration(s);startTimer();}
};

/* ================================================================
   Boot
   ================================================================ */
buildAnalogMarkers();
populateTimezoneSelect();
applySettings();
setDefaultAlarmTime();
renderAlarms();
renderTimer(); updateTimerRing(1,1);
renderStopwatch();
renderWorldClocks();
updateClock(new Date());
bindEvents();
bindKeyboard();
setInterval(tick,250);
requestAnimationFrame(swLoop);

function tick(){
  const now=new Date();
  updateClock(now); checkAlarms(now); renderTimer(); updateWorldClocks(now);
  if (state.settings.greetingStyle==="time"||state.settings.greetingStyle==="motto") {
    const name=(state.settings.displayName||"").trim();
    el.greetingEyebrow.textContent=(state.settings.greetingStyle==="time"&&name)?timeGreeting(now)+", "+name:timeGreeting(now);
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

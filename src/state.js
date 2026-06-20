/* ================================================================
   state.js — State persistence and validation
   ================================================================ */

export const STORAGE_KEY = "sagc-v2";
export const MAX_TIMER_SECONDS = 24 * 3600;
export const VALID_THEMES    = new Set(["matrix","bladerunner","alien","pinkie","rainbow","interstellar","cyberpunk","dune","synthwave","mandalorian","oppenheimer"]);
export const VALID_LAYOUTS   = new Set(["split","stack","minimal"]);
export const VALID_SOUNDS    = new Set(["bell","pulse","triple","digital","cosmic","gentle"]);
export const VALID_DATES     = new Set(["long","short","iso","off"]);
export const VALID_GREETINGS = new Set(["time","static","motto","off"]);
export const VALID_FACES     = new Set(["digital","analog","flip"]);
export const VALID_SCALES    = new Set(["s","m","l","xl"]);
export const VALID_AMBIENTS  = new Set(["off","rain","space","fan","cafe","forest"]);
export const VALID_REPEATS   = new Set(["daily","weekdays","weekends","once"]);

export function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

export const ACCENT_OPTIONS = {
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

export const THEME_DEFAULT_ACCENTS = {
  matrix:"#39ff88", bladerunner:"#ff7a1a", alien:"#ffb000",
  pinkie:"#ff4ea8", rainbow:"#2db7ff",     interstellar:"#e8b76f",
  cyberpunk:"#00f5ff", dune:"#e8a840",     synthwave:"#ff2d78",
  mandalorian:"#d4d8e0", oppenheimer:"#c83030",
};

export const ACCENT_2_PAIRS = {
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

export const THEME_CLOCK_COLORS = {
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

export const THEME_QUOTES = {
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

export const FONT_SCALE_MAP = { s:"0.85", m:"1", l:"1.15", xl:"1.3" };
export const FALLBACK_TIMEZONES = [
  "UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "America/Toronto","America/Sao_Paulo","Europe/London","Europe/Paris","Europe/Berlin",
  "Europe/Istanbul","Europe/Moscow","Asia/Dubai","Asia/Kolkata","Asia/Singapore",
  "Asia/Tokyo","Asia/Shanghai","Australia/Sydney","Pacific/Auckland",
];

export const defaults = {
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

export function loadState() {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!p || typeof p !== "object") return cloneDefaults();
    return sanitizeState(p);
  } catch { return cloneDefaults(); }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function cloneDefaults() {
  return JSON.parse(JSON.stringify(defaults));
}

export function uid() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

export function boolOr(v, fb) { return typeof v === "boolean" ? v : fb; }
export function strOr(v, fb, max=80) { return typeof v === "string" ? v.slice(0,max) : fb; }
export function numRange(v, fb, lo, hi) { const n=Number(v); return isFinite(n) ? Math.min(hi,Math.max(lo,n)) : fb; }
export function intRange(v, fb, lo, hi) { const n=parseInt(v,10); return isFinite(n) ? Math.min(hi,Math.max(lo,n)) : fb; }
export function intWithin(v, fb, lo, hi) { const n=parseInt(v,10); return isFinite(n)&&n>=lo&&n<=hi ? n : fb; }
export function enumOr(v, s, fb) { return s.has(v) ? v : fb; }
export function hexColor(v) { return typeof v==="string" && /^#[0-9a-f]{6}$/i.test(v); }
export function themeClockColors(t) { return [...(THEME_CLOCK_COLORS[t]||THEME_CLOCK_COLORS.matrix)]; }

export function normalizeClockColors(v, t) {
  const src=Array.isArray(v)?v:[];
  return themeClockColors(t).map((fb,i)=>hexColor(src[i])?src[i].toLowerCase():fb);
}

export function isValidTime(v) {
  if (typeof v!=="string") return false;
  const m=v.match(/^(\d{2}):(\d{2})$/);
  return m && +m[1]>=0 && +m[1]<=23 && +m[2]>=0 && +m[2]<=59;
}

export function sanitizeSettings(raw={}) {
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

export function sanitizeAlarm(raw) {
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

export function sanitizeTimer(raw={}) {
  const i=(raw&&typeof raw==="object")?raw:{};
  const dur=intWithin(i.duration,60,1,MAX_TIMER_SECONDS), rem=intWithin(i.remaining,dur,1,MAX_TIMER_SECONDS);
  return {duration:dur,remaining:rem,running:false,endsAt:null};
}

export function sanitizePomodoro(raw={}) {
  const i=(raw&&typeof raw==="object")?raw:{};
  return {
    enabled:boolOr(i.enabled,false), work:intRange(i.work,25,1,120),
    shortBreak:intRange(i.shortBreak,5,1,60), longBreak:intRange(i.longBreak,15,5,120),
    rounds:intRange(i.rounds,4,2,8), currentSession:intRange(i.currentSession,0,0,7),
    phase:["work","short","long"].includes(i.phase)?i.phase:"work",
  };
}

export function sanitizeWorldClocks(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(w=>{
    if (!w||typeof w!=="object") return null;
    try { Intl.DateTimeFormat(undefined,{timeZone:w.tz}); } catch { return null; }
    return {id:typeof w.id==="string"?w.id:uid(), tz:w.tz, label:strOr(w.label,w.tz,30)};
  }).filter(Boolean);
}

export function sanitizeState(raw) {
  return {
    settings:sanitizeSettings(raw.settings),
    alarms:Array.isArray(raw.alarms)?raw.alarms.map(sanitizeAlarm).filter(Boolean):[],
    timer:sanitizeTimer(raw.timer), pomodoro:sanitizePomodoro(raw.pomodoro),
    worldClocks:sanitizeWorldClocks(raw.worldClocks),
  };
}

export const state = loadState();

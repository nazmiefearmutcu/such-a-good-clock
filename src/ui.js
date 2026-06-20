/* ================================================================
   ui.js — UI interaction, pages, event bindings, and DOM loops
   ================================================================ */

import {
  state,
  defaults,
  saveState,
  uid,
  escHtml,
  boolOr,
  strOr,
  numRange,
  intRange,
  intWithin,
  enumOr,
  hexColor,
  themeClockColors,
  normalizeClockColors,
  isValidTime,
  STORAGE_KEY,
  MAX_TIMER_SECONDS,
  VALID_THEMES,
  VALID_LAYOUTS,
  VALID_SOUNDS,
  VALID_DATES,
  VALID_GREETINGS,
  VALID_FACES,
  VALID_SCALES,
  VALID_AMBIENTS,
  VALID_REPEATS,
  THEME_DEFAULT_ACCENTS,
  ACCENT_OPTIONS,
  ACCENT_2_PAIRS,
  THEME_CLOCK_COLORS,
  THEME_QUOTES,
  FONT_SCALE_MAP,
  FALLBACK_TIMEZONES
} from "./state.js";

import { el } from "./dom.js";

import {
  ensureAudio,
  playSound,
  stopRepeatingSound,
  startRepeatingSound,
  startAmbient,
  stopAmbient,
  updateAmbientVolume,
  updateMasterGain,
  updateAudioStatus,
  soundEvents
} from "./audio.js";

import { startFx, stopFx } from "./fx.js";

export let currentRing = null;
export const sw = { running:false, startedAt:0, elapsed:0, laps:[], lapStart:0 };
export let quoteState = { theme:null, list:[], idx:0, timer:0 };
export const flipPrev = { h1:-1, h2:-1, m1:-1, m2:-1, s1:-1, s2:-1 };

export function pad(n) { return String(n).padStart(2,"0"); }

export function hexA(hex,alpha) {
  if (!hexColor(hex)) hex="#39ff88";
  const m=hex.replace("#",""), v=m.length===3?m.split("").map(c=>c+c).join(""):m;
  return `rgba(${parseInt(v.slice(0,2),16)},${parseInt(v.slice(2,4),16)},${parseInt(v.slice(4,6),16)},${alpha})`;
}

let toastTimer = null;
export function showToast(msg) {
  if (el.toast) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2400);
  }
}

export function updateFavicon() {
  const css = getComputedStyle(document.documentElement);
  const bg = (css.getPropertyValue("--bg-2") || css.getPropertyValue("--bg") || "#08141f").trim();
  const accent = (css.getPropertyValue("--accent") || "#39ff88").trim();
  const ring = (css.getPropertyValue("--accent-2") || "#d6f7ff").trim();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>` +
    `<rect width='64' height='64' rx='12' fill='${bg}'/>` +
    `<path d='M32 12v22l14 8' stroke='${accent}' stroke-width='6' fill='none' stroke-linecap='round' stroke-linejoin='round'/>` +
    `<circle cx='32' cy='32' r='22' stroke='${ring}' stroke-width='4' fill='none'/>` +
    `</svg>`;
  const href = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;

  const themeMeta = document.querySelector("meta[name='theme-color']");
  if (themeMeta) {
    themeMeta.setAttribute("content", bg);
  }
}

export function applySettings() {
  const s=state.settings;
  el.html.dataset.theme=s.theme; el.html.dataset.layout=s.layout; el.html.dataset.face=s.face;
  el.html.dataset.fx=s.fx?"on":"off"; el.html.dataset.scanlines=s.scanlines?"on":"off";
  el.html.dataset.grain=s.grain?"on":"off"; el.html.dataset.showSeconds=s.showSeconds?"on":"off";
  el.html.dataset.blink=s.blink?"on":"off"; el.html.dataset.topbar=s.topbarAutoHide?"auto-hide":"fixed";
  const clk=s.customClockColors?normalizeClockColors(s.clockColors,s.theme):themeClockColors(s.theme);
  state.settings.clockColors=clk; el.html.dataset.clockColors=s.customClockColors?"custom":"theme";
  clk.forEach((c,i)=>el.html.style.setProperty(`--clock-custom-${i+1}`,c));
  const acc=s.accent||THEME_DEFAULT_ACCENTS[s.theme];
  el.html.style.setProperty("--accent",acc);
  el.html.style.setProperty("--accent-2",ACCENT_2_PAIRS[acc]||acc);
  el.html.style.setProperty("--accent-soft",hexA(acc,0.16));
  el.html.style.setProperty("--font-scale",FONT_SCALE_MAP[s.fontScale]||"1");
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
  updateFavicon();
}

export function renderAccentSwatches() {
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

export function cycleTheme(dir) {
  const themes=[...VALID_THEMES], idx=themes.indexOf(state.settings.theme);
  state.settings.theme=themes[(idx+dir+themes.length)%themes.length];
  state.settings.accent=null; saveState(); applySettings();
  showToast(state.settings.theme.charAt(0).toUpperCase()+state.settings.theme.slice(1));
}

export function timeGreeting(d=new Date()) {
  const h=d.getHours();
  if (h<5) return "Working late"; if (h<12) return "Good morning";
  if (h<17) return "Good afternoon"; if (h<22) return "Good evening";
  return "Good night";
}

export function renderGreeting() {
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

export function startQuoteRotation() {
  clearInterval(quoteState.timer); if (state.settings.greetingStyle!=="time") return;
  quoteState.timer=setInterval(()=>{ quoteState.idx=(quoteState.idx+1)%quoteState.list.length; swapQuote(quoteState.list[quoteState.idx]); },18000);
}

export function swapQuote(text) {
  el.greetingName.classList.add("fading");
  setTimeout(()=>{
    el.greetingName.textContent=text;
    el.greetingName.classList.remove("fading");
  },260);
}

export function cycleQuote() {
  if (state.settings.greetingStyle!=="time"||!quoteState.list.length) return;
  quoteState.idx=(quoteState.idx+1)%quoteState.list.length;
  swapQuote(quoteState.list[quoteState.idx]);
  startQuoteRotation();
}

export function switchPage(target) {
  el.tabs.forEach(t=>t.classList.toggle("active",t.dataset.tabTarget===target));
  el.pages.forEach(p=>p.classList.toggle("active",p.id===target));
}

export function updateClock(now=new Date()) {
  let h=now.getHours(),m=now.getMinutes(),s=now.getSeconds(),suffix="";
  if (state.settings.hour12) { suffix=h>=12?" PM":" AM"; h=h%12||12; }
  
  // Performance optimization: Dirty Checking (Section 6.1)
  const ph = pad(h);
  const pm = pad(m);
  const ps = pad(s);
  
  if (el.ckHH.textContent !== ph) el.ckHH.textContent = ph;
  if (el.ckMM.textContent !== pm) el.ckMM.textContent = pm;
  if (el.ckSS.textContent !== ps) el.ckSS.textContent = ps;
  if (el.ckSuffix.textContent !== suffix) el.ckSuffix.textContent = suffix;
  
  const titleStr = ph + ":" + pm + " · Such A Good Clock";
  if (document.title !== titleStr) document.title = titleStr;
  
  if (state.settings.face==="analog") renderAnalogClock(now);
  if (state.settings.face==="flip")   renderFlipClock(now);
  
  const formattedDate = formatDate(now);
  if (el.dateLabel.textContent !== formattedDate) el.dateLabel.textContent = formattedDate;
  
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (el.timezoneLabel.textContent !== currentTz) el.timezoneLabel.textContent = currentTz;
  
  const alarmText = nextAlarmText(now);
  if (el.nextAlarmLabel.textContent !== alarmText) el.nextAlarmLabel.textContent = alarmText;
}

export function formatDate(now) {
  switch(state.settings.dateFormat) {
    case "off":   return "—";
    case "iso":   return now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate());
    case "short": return new Intl.DateTimeFormat("en-US",{weekday:"short",day:"2-digit",month:"short"}).format(now);
    default:      return new Intl.DateTimeFormat("en-US",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(now);
  }
}

export function buildAnalogMarkers() {
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

export function renderAnalogClock(now) {
  if (!el.acHourHand) return;
  const h=now.getHours()%12,m=now.getMinutes(),s=now.getSeconds(),ms=now.getMilliseconds();
  el.acHourHand.setAttribute("transform","rotate("+(( h+m/60+s/3600)*30)+",100,100)");
  el.acMinHand.setAttribute("transform","rotate("+((m+s/60)*6)+",100,100)");
  el.acSecHand.setAttribute("transform","rotate("+((s+ms/1000)*6)+",100,100)");
}

export function renderFlipClock(now) {
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

export function timeInputFor(d) { return pad(d.getHours())+":"+pad(d.getMinutes()); }

export function setDefaultAlarmTime() {
  if (el.alarmTime) el.alarmTime.value=timeInputFor(new Date(Date.now()+60000));
}

export function addAlarm(time,label,sound,repeat="daily") {
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

export function addOneTimeAlarm(secsFromNow,label="One-time alarm",sound=state.settings.defaultAlarmSound) {
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

export function removeAlarm(id) {
  state.alarms=state.alarms.filter(a=>a.id!==id); saveState(); renderAlarms(); updateClock();
}

export function toggleAlarm(id) {
  const a=state.alarms.find(x=>x.id===id); if (!a) return;
  a.enabled=!a.enabled; a.lastFiredKey=null; saveState(); renderAlarms(); updateClock();
}

export function renderAlarms() {
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

export function nextDateForAlarm(alarm,now=new Date()) {
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

export function nextAlarmText(now=new Date()) {
  const active=state.alarms.filter(a=>a.enabled).map(a=>({alarm:a,date:nextDateForAlarm(a,now)})).filter(({date})=>isFinite(date.getTime())&&date<8.64e15);
  if (!active.length) return "No alarms";
  const next=active.sort((a,b)=>a.date-b.date)[0];
  return next.alarm.label+" · in "+formatDuration(Math.max(0,Math.round((next.date-now)/1000)));
}

export function alarmDueKey(now,alarm) { return now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+"-"+alarm.time; }

export function checkAlarms(now=new Date()) {
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

export function fireAlarm(alarm) {
  saveState(); renderAlarms();
  showRing({kind:"alarm",title:alarm.label,detail:"Your alarm is ringing.",sound:alarm.sound});
}

export function formatDuration(totalSecs) {
  const s=Math.max(0,Math.ceil(isFinite(+totalSecs)?+totalSecs:0));
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),r=s%60;
  return h>0?pad(h)+":"+pad(m)+":"+pad(r):pad(m)+":"+pad(r);
}

export function timerSecsFromInputs() {
  const h=parseInt(el.timerHours?.value||"0",10)||0;
  const m=parseInt(el.timerMinutes?.value||"0",10)||0;
  const s=parseInt(el.timerSeconds?.value||"0",10)||0;
  return Math.max(1,Math.min(MAX_TIMER_SECONDS,h*3600+m*60+s));
}

export function setTimerDuration(secs) {
  const ns=intRange(secs,60,1,MAX_TIMER_SECONDS);
  state.timer.duration=ns; state.timer.remaining=ns; state.timer.running=false; state.timer.endsAt=null;
  if (el.timerHours)   el.timerHours.value=Math.floor(ns/3600);
  if (el.timerMinutes) el.timerMinutes.value=Math.floor((ns%3600)/60);
  if (el.timerSeconds) el.timerSeconds.value=ns%60;
  saveState(); renderTimer();
}

export function startTimer() {
  void ensureAudio(); if (state.timer.remaining<=0) state.timer.remaining=timerSecsFromInputs();
  state.timer.duration=state.timer.remaining; state.timer.endsAt=Date.now()+state.timer.remaining*1000;
  state.timer.running=true; saveState(); renderTimer();
}

export function pauseTimer() {
  updateTimerRemaining(); state.timer.running=false; state.timer.endsAt=null; saveState(); renderTimer();
}

export function resetTimer()  {
  state.timer.running=false; state.timer.endsAt=null; state.timer.remaining=timerSecsFromInputs(); saveState(); renderTimer(); updateTimerRing(1,1);
}

export function updateTimerRemaining() {
  if (!state.timer.running||!state.timer.endsAt) return;
  state.timer.remaining=Math.max(0,Math.ceil((state.timer.endsAt-Date.now())/1000));
  if (state.timer.remaining<=0) {
    state.timer.running=false; state.timer.endsAt=null; saveState();
    if (state.pomodoro.enabled) { advancePomodoro(); return; }
    showRing({kind:"timer",title:"Timer complete",detail:"The countdown is complete.",sound:state.settings.defaultTimerSound});
  }
}

export function renderTimer() {
  updateTimerRemaining();
  
  // Performance optimization: Dirty Checking (Section 6.1)
  const durStr = formatDuration(state.timer.remaining);
  if (el.timerDisplay.textContent !== durStr) el.timerDisplay.textContent = durStr;
  
  const startDisabled = state.timer.running;
  if (el.startTimer.disabled !== startDisabled) el.startTimer.disabled = startDisabled;
  
  const pauseDisabled = !state.timer.running;
  if (el.pauseTimer.disabled !== pauseDisabled) el.pauseTimer.disabled = pauseDisabled;
  
  updateTimerRing(state.timer.remaining,state.timer.duration||1);
}

export function updateTimerRing(rem,tot) {
  if (!el.timerRingArc) return;
  const C=2*Math.PI*108, frac=tot>0?Math.max(0,Math.min(1,rem/tot)):0;
  const offset = C*(1-frac);
  
  // Performance optimization: Dirty Checking (Section 6.1)
  const offsetStr = String(offset);
  if (el.timerRingArc.style.strokeDashoffset !== offsetStr) el.timerRingArc.style.strokeDashoffset = offsetStr;
}

export function startPomodoro() {
  const p=state.pomodoro;
  const mins=p.phase==="work"?p.work:p.phase==="short"?p.shortBreak:p.longBreak;
  setTimerDuration(mins*60);
  if (el.timerRingArc) el.timerRingArc.classList.toggle("ring-break",p.phase!=="work");
  if (el.timerPomodoroLabel) {
    el.timerPomodoroLabel.hidden=false;
    el.timerPomodoroLabel.textContent=p.phase==="work"?"Work":p.phase==="short"?"Short Break":"Long Break";
  }
  renderPomodoroDots(); startTimer();
}

export function advancePomodoro() {
  const p=state.pomodoro;
  if (p.phase==="work") {
    p.currentSession++;
    if (p.currentSession>=p.rounds) {
      p.phase="long"; p.currentSession=0;
    } else {
      p.phase="short";
    }
  } else {
    p.phase="work";
  }
  saveState();
  showToast(p.phase==="work"?"Work time!":p.phase==="short"?"Short break!":"Long break!");
  startPomodoro();
}

export function renderPomodoroDots() {
  document.querySelectorAll(".pomodoro-dot").forEach((d,i)=>{
    d.classList.remove("done","active");
    if (i<state.pomodoro.currentSession) d.classList.add("done");
    else if (i===state.pomodoro.currentSession&&state.pomodoro.phase==="work") d.classList.add("active");
  });
}

export function formatMs(ms) {
  const t=Math.max(0,ms), m=Math.floor(t/60000), s=Math.floor((t%60000)/1000), c=Math.floor((t%1000)/10);
  return pad(m)+":"+pad(s)+"."+pad(c);
}

export function renderStopwatch() {
  const elapsed=sw.running?sw.elapsed+(Date.now()-sw.startedAt):sw.elapsed;
  const h=Math.floor(elapsed/3600000), m=Math.floor((elapsed%3600000)/60000);
  const s=Math.floor((elapsed%60000)/1000), c=Math.floor((elapsed%1000)/10);
  
  if (el.swHours) {
    const text = pad(h)+":";
    if (el.swHours.textContent !== text) el.swHours.textContent = text;
    el.swHours.classList.toggle("hidden",h===0);
  }
  if (el.swMin && el.swMin.textContent !== pad(m)) el.swMin.textContent = pad(m);
  if (el.swSec && el.swSec.textContent !== pad(s)) el.swSec.textContent = pad(s);
  if (el.swCs && el.swCs.textContent !== pad(c)) el.swCs.textContent = pad(c);
  if (el.swSplitDelta) {
    if (sw.laps.length>0&&sw.running) {
      const lapText = "Lap: "+formatMs(elapsed-sw.lapStart);
      if (el.swSplitDelta.textContent !== lapText) el.swSplitDelta.textContent = lapText;
      el.swSplitDelta.hidden=false;
    } else {
      el.swSplitDelta.hidden=true;
    }
  }
}

export function addLap() {
  const elapsed=sw.elapsed+(Date.now()-sw.startedAt), lapTime=elapsed-sw.lapStart;
  sw.laps.push({n:sw.laps.length+1,split:lapTime,total:elapsed}); sw.lapStart=elapsed; renderLapList();
}

export function renderLapList() {
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

export function swToggle() {
  if (sw.running) {
    sw.elapsed+=Date.now()-sw.startedAt; sw.running=false;
    if(el.startStopwatch) el.startStopwatch.textContent="Start";
    if(el.lapStopwatch) el.lapStopwatch.disabled=true;
  } else {
    sw.startedAt=Date.now(); sw.running=true;
    if(el.startStopwatch) el.startStopwatch.textContent="Stop";
    if(el.lapStopwatch) el.lapStopwatch.disabled=false;
  }
}

export function swReset() {
  sw.elapsed=0; sw.running=false; sw.laps=[]; sw.lapStart=0;
  renderStopwatch(); renderLapList();
  if(el.startStopwatch) el.startStopwatch.textContent="Start";
  if(el.lapStopwatch) el.lapStopwatch.disabled=true;
}

export function swLoop() {
  if (sw.running) renderStopwatch();
  requestAnimationFrame(swLoop);
}

export function populateTimezoneSelect() {
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

export function addWorldClock(tz,label) {
  const displayLabel=(label||"").trim()||tz.split("/").pop().replace(/_/g," ");
  state.worldClocks.push({id:uid(),tz,label:displayLabel}); saveState(); renderWorldClocks();
}

export function removeWorldClock(id) {
  state.worldClocks=state.worldClocks.filter(w=>w.id!==id); saveState(); renderWorldClocks();
}

export function renderWorldClocks() {
  if (!el.worldClockGrid) return;
  el.worldClockGrid.replaceChildren();
  if (el.worldEmptyHint) el.worldEmptyHint.hidden=state.worldClocks.length>0;
  const now=new Date();
  for (const wc of state.worldClocks) {
    const card=document.createElement("article"); card.className="world-card"; card.dataset.id=wc.id;
    let timeStr="--:--"; try { timeStr=new Intl.DateTimeFormat("en-US",{timeZone:wc.tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:state.settings.hour12}).format(now); } catch {}
    let dateStr=""; try { dateStr=new Intl.DateTimeFormat("en-US",{timeZone:wc.tz,weekday:"short",month:"short",day:"numeric"}).format(now); } catch {}
    let offStr=""; try { const utcD=new Date(now.toLocaleString("en-US",{timeZone:"UTC"})),tzD=new Date(now.toLocaleString("en-US",{timeZone:wc.tz})),offH=(tzD-utcD)/3600000; offStr=(offH>=0?"+":"")+offH.toFixed(1).replace(".0","")+"h"; } catch {}
    const timeEl=document.createElement("div"); timeEl.className="world-card-time"; timeEl.id="wct-"+wc.id; timeEl.textContent=timeStr;
    const nameEl=document.createElement("div"); nameEl.className="world-card-name"; nameEl.textContent=wc.label;
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

export function updateWorldClocks(now) {
  for (const wc of state.worldClocks) {
    const el2=document.getElementById("wct-"+wc.id); if (!el2) continue;
    try {
      const val = new Intl.DateTimeFormat("en-US",{timeZone:wc.tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:state.settings.hour12}).format(now);
      // Performance optimization: Dirty Checking
      if (el2.textContent !== val) el2.textContent = val;
    } catch {}
  }
}

export function showRing({kind,title,detail,sound}) {
  currentRing={kind,title,detail,sound};
  if (el.ringKind) el.ringKind.textContent=kind==="alarm"?"Alarm":"Timer";
  if (el.ringTitle) el.ringTitle.textContent=title;
  if (el.ringDetail) el.ringDetail.textContent=detail;
  if (el.snoozeRing) el.snoozeRing.hidden=kind!=="alarm";
  startRepeatingSound(kind,sound);
  if (el.ringDialog && !el.ringDialog.open) {
    try {
      el.ringDialog.showModal();
    } catch {
      el.ringDialog.setAttribute("open","open");
    }
  }
}

export function stopRing() {
  stopRepeatingSound(); currentRing=null;
  if(el.ringDialog && el.ringDialog.open) el.ringDialog.close();
}

export function snoozeCurrentRing() {
  if (!currentRing||currentRing.kind!=="alarm") return;
  addOneTimeAlarm(300,"Snooze: "+currentRing.title,currentRing.sound); stopRing();
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(()=>{});
  } else {
    document.exitFullscreen().catch(()=>{});
  }
}

export function bindKeyboard() {
  window.addEventListener("keydown",e=>{
    if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT") return;
    const active=document.querySelector(".page.active")?.id;
    switch(e.key){
      case " ": e.preventDefault(); if(active==="timer"){state.timer.running?pauseTimer():startTimer();}else if(active==="stopwatch"){swToggle();} break;
      case "r": case "R": if(active==="timer")resetTimer();else if(active==="stopwatch")swReset(); break;
      case "l": case "L": if(active==="stopwatch"&&sw.running)addLap(); break;
      case "f": case "F": toggleFullscreen(); break;
      case "?": el.shortcutsDialog?.showModal(); break;
      case "Escape": if(el.ringDialog?.open)stopRing(); if(el.shortcutsDialog?.open)el.shortcutsDialog.close(); break;
      case "1":switchPage("clock");break; case "2":switchPage("alarms");break;
      case "3":switchPage("timer");break; case "4":switchPage("stopwatch");break;
      case "5":switchPage("world");break; case "6":switchPage("settings");break;
      case "ArrowRight":cycleTheme(1);break; case "ArrowLeft":cycleTheme(-1);break;
    }
  });
}

export function bindEvents() {
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

export function tick() {
  const now=new Date();
  updateClock(now); checkAlarms(now); renderTimer(); updateWorldClocks(now);
  
  if (state.settings.greetingStyle==="time"||state.settings.greetingStyle==="motto") {
    const name=(state.settings.displayName||"").trim();
    // Performance optimization: Dirty Checking
    const val = (state.settings.greetingStyle==="time"&&name)?timeGreeting(now)+", "+name:timeGreeting(now);
    if (el.greetingEyebrow.textContent !== val) el.greetingEyebrow.textContent = val;
  }
}

import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import assert from "node:assert/strict";

// Serve the project root (parent of this scripts/ dir) unless ROOT is overridden.
const root = process.env.ROOT ? resolve(process.env.ROOT) : resolve(new URL("..", import.meta.url).pathname);
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";
const storageKey = "sagc-v2";
const base = `http://${host}:${port}`;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", base);
    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = join(root, decodeURIComponent(requested));
    const body = await readFile(filePath);
    res.writeHead(200, { "content-type": mime[extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

await new Promise((r) => server.listen(port, host, r));

const browser = await chromium.launch({
  headless: process.env.HEADED !== "1",
  ...(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
const waitHook = () => page.waitForFunction(() => Boolean(window.__clockAppTest));

try {
  // 1. boot
  await page.goto(base, { waitUntil: "networkidle" });
  await waitHook();
  await page.evaluate(() => window.__clockAppTest.clear());

  // 2. digital clock renders HH:MM:SS
  const clock = await page.evaluate(() => ({
    hh: document.querySelector("#digitalClock .ck-hh")?.textContent || "",
    mm: document.querySelector("#digitalClock .ck-mm")?.textContent || "",
    ss: document.querySelector("#digitalClock .ck-ss")?.textContent || "",
    theme: document.documentElement.dataset.theme,
    face: document.documentElement.dataset.face,
  }));
  assert.match(clock.hh, /^\d{2}$/, "hours render 2 digits");
  assert.match(clock.mm, /^\d{2}$/, "minutes render 2 digits");
  assert.match(clock.ss, /^\d{2}$/, "seconds render 2 digits");
  assert.equal(clock.theme, "matrix", "default theme should be matrix");

  // 3. clock ticks (seconds advance within 3s)
  await page.waitForFunction(
    (prev) => (document.querySelector("#digitalClock .ck-ss")?.textContent || "") !== prev,
    clock.ss,
    { timeout: 3000 }
  );

  // 4. corrupt-storage recovery falls back to safe defaults
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({
    settings: { theme: "ghost", layout: "broken", face: "nope", volume: "loud" },
    alarms: [{ id: "x", type: "once", at: "not-a-date" }, { id: "y", type: "daily", time: null }],
    timer: { duration: "nope", remaining: -5, running: true },
    pomodoro: { work: 9999, rounds: 0 },
  })), storageKey);
  await page.reload({ waitUntil: "networkidle" });
  await waitHook();
  const recovered = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    hh: document.querySelector("#digitalClock .ck-hh")?.textContent || "",
    alarms: window.__clockAppTest.alarms.length,
  }));
  assert.equal(recovered.theme, "matrix", "invalid stored theme should fall back to matrix");
  assert.match(recovered.hh, /^\d{2}$/, "clock should render after corrupt-storage recovery");
  assert.equal(recovered.alarms, 0, "corrupt alarms should be discarded");
  await page.evaluate(() => window.__clockAppTest.clear());

  // 5. PWA manifest is installable
  const manifest = await page.evaluate(async () => {
    const r = await fetch("./manifest.webmanifest");
    if (!r.ok) throw new Error("manifest fetch " + r.status);
    return r.json();
  });
  assert.equal(manifest.name, "Such A Good Clock", "manifest name");
  assert.equal(manifest.display, "standalone", "manifest standalone");
  assert.equal(manifest.start_url, "./", "manifest start_url");
  assert.ok(manifest.icons.some((i) => i.sizes === "192x192" && i.type === "image/png"), "192 icon");
  assert.ok(manifest.icons.some((i) => i.sizes === "512x512" && i.type === "image/png"), "512 icon");

  // 6. service worker registers and the app loads offline
  await page.waitForFunction(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const r = await navigator.serviceWorker.getRegistration("./");
    return Boolean(r?.active);
  }, null, { timeout: 8000 });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), null, { timeout: 8000 });
  await page.context().setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitHook();
  const offline = await page.evaluate(() => ({
    controlled: Boolean(navigator.serviceWorker?.controller),
    hh: document.querySelector("#digitalClock .ck-hh")?.textContent || "",
  }));
  assert.equal(offline.controlled, true, "offline page should be served by the active service worker");
  assert.match(offline.hh, /^\d{2}$/, "offline PWA load should render the live clock");
  await page.context().setOffline(false);
  await page.reload({ waitUntil: "networkidle" });
  await waitHook();
  await page.evaluate(() => window.__clockAppTest.clear());

  // 7. alarm fires and the ring dialog opens
  await page.evaluate(() => window.__clockAppTest.unlockAudio());
  await page.evaluate(() => window.__clockAppTest.createTestAlarm(2));
  await page.waitForFunction(() => window.__clockAppTest.soundEvents.some((e) => e.type === "alarm"), null, { timeout: 9000 });
  await page.waitForSelector("#ringDialog[open]", { timeout: 3000 });
  await page.evaluate(() => window.__clockAppTest.clear());
  await page.waitForFunction(() => !document.querySelector("#ringDialog")?.open, null, { timeout: 3000 });

  // 8. timer fires and the ring dialog opens
  await page.evaluate(() => window.__clockAppTest.startTestTimer(2));
  await page.waitForFunction(() => window.__clockAppTest.soundEvents.some((e) => e.type === "timer"), null, { timeout: 9000 });
  await page.waitForSelector("#ringDialog[open]", { timeout: 3000 });
  await page.evaluate(() => window.__clockAppTest.clear());

  // screenshot for CI artifact
  await mkdir(join(root, "test-results"), { recursive: true });
  await page.screenshot({ path: join(root, "test-results", "such-a-good-clock-e2e.png"), fullPage: false });

  assert.equal(pageErrors.length, 0, `Unexpected page errors: ${pageErrors.join("; ")}`);

  const soundEvents = await page.evaluate(() => window.__clockAppTest.soundEvents);
  console.log("SMOKE PASS " + JSON.stringify({
    theme: clock.theme,
    face: clock.face,
    recoveredTheme: recovered.theme,
    alarmFired: true,
    timerFired: true,
    soundEvents: soundEvents.length,
  }));
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}

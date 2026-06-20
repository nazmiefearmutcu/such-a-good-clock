import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import assert from "node:assert/strict";

// Import modularized test cases (Aşama 4)
import { testClock } from "./tests/clock.mjs";
import { testStorage } from "./tests/storage.mjs";
import { testPWA } from "./tests/pwa.mjs";
import { testAlarm } from "./tests/alarm.mjs";
import { testTimer } from "./tests/timer.mjs";

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

  // Execute modularized tests
  const clock = await testClock(page);
  const recovered = await testStorage(page, storageKey, waitHook);
  await testPWA(page, base, waitHook);
  await testAlarm(page);
  await testTimer(page);

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

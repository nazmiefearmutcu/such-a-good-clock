import assert from "node:assert/strict";

export async function testPWA(page, base, waitHook) {
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
}

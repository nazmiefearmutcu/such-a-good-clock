import assert from "node:assert/strict";

export async function testStorage(page, storageKey, waitHook) {
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
  return recovered;
}

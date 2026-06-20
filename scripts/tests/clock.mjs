import assert from "node:assert/strict";

export async function testClock(page) {
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
  return clock;
}

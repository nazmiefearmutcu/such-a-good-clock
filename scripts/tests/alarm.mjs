export async function testAlarm(page) {
  // 7. alarm fires and the ring dialog opens
  await page.evaluate(() => window.__clockAppTest.unlockAudio());
  await page.evaluate(() => window.__clockAppTest.createTestAlarm(2));
  await page.waitForFunction(() => window.__clockAppTest.soundEvents.some((e) => e.type === "alarm"), null, { timeout: 9000 });
  await page.waitForSelector("#ringDialog[open]", { timeout: 3000 });
  await page.evaluate(() => window.__clockAppTest.clear());
  await page.waitForFunction(() => !document.querySelector("#ringDialog")?.open, null, { timeout: 3000 });
}

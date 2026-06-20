export async function testTimer(page) {
  // 8. timer fires and the ring dialog opens
  await page.evaluate(() => window.__clockAppTest.startTestTimer(2));
  await page.waitForFunction(() => window.__clockAppTest.soundEvents.some((e) => e.type === "timer"), null, { timeout: 9000 });
  await page.waitForSelector("#ringDialog[open]", { timeout: 3000 });
  await page.evaluate(() => window.__clockAppTest.clear());
}

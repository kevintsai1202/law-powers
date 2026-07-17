// 驗證宣傳頁最上方「使用授權」公告橫幅：
// 1. 橫幅存在且位於導覽列之上
// 2. 文案包含「無償授權」與「經兆國際法律事務所」
// 3. 桌機 (1440) 與手機 (375) 皆無水平溢出，並輸出截圖供人工檢視
// 執行方式：node scripts/verify-license-banner.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 宣傳頁本機路徑（GitHub Pages 來源為 docs/index.html）
const pageUrl = 'file://' + path.resolve(__dirname, '..', 'docs', 'index.html').replace(/\\/g, '/');

const browser = await chromium.launch();
let failed = false;

for (const [label, width] of [['desktop', 1440], ['mobile', 375]]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(pageUrl);

  // 檢查橫幅存在與文案內容
  const banner = page.locator('.license-banner');
  const text = await banner.textContent();
  const ok =
    (await banner.count()) === 1 &&
    text.includes('無償授權') &&
    text.includes('經兆國際法律事務所');

  // 檢查橫幅位於導覽列上方（DOM 順序與畫面 Y 座標）
  const bannerBox = await banner.boundingBox();
  const navBox = await page.locator('header.nav').boundingBox();
  const aboveNav = bannerBox && navBox && bannerBox.y < navBox.y;

  // 檢查無水平溢出
  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
  );

  const pass = ok && aboveNav && noOverflow;
  if (!pass) failed = true;
  console.log(`[${label} ${width}px] 橫幅=${ok} 位於nav上方=${aboveNav} 無水平溢出=${noOverflow} => ${pass ? 'PASS' : 'FAIL'}`);

  await page.screenshot({ path: path.join(__dirname, `..`, `docs`, `assets`, `_verify-banner-${label}.png`), clip: { x: 0, y: 0, width, height: 220 } });
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);

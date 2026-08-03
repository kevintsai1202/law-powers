// 驗證 legal-graph/references/svg-diagrams.md 內嵌之 SVG 範本骨架：
// 1) 從 md 抽出 ```svg 圍欄區塊；2) 存成暫存 .svg；3) 以 headless chromium 開啟並截圖；
// 4) 斷言頁面無 XML 解析錯誤（parsererror）且 svg 元素存在。
// 用法：node scripts/verify-svg-diagrams.mjs
//（playwright 為全域安裝時，以 NODE_PATH=%APPDATA%\npm\node_modules 執行，或依 loadChromium 順序 fallback）
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

// 依序嘗試載入 playwright（本地 → 全域 NODE_PATH）
async function loadChromium() {
  const candidates = ['playwright', 'playwright-core'];
  for (const name of candidates) {
    try { return (await import(name)).chromium; } catch { /* 換下一個 */ }
  }
  throw new Error('找不到 playwright，請以 NODE_PATH 指向全域 node_modules 後重試');
}

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const mdPath = path.join(root, 'skills', 'legal-graph', 'references', 'svg-diagrams.md');
const md = readFileSync(mdPath, 'utf8');

// 抽出 ```svg 圍欄內容
const m = md.match(/```svg\r?\n([\s\S]*?)```/);
if (!m) { console.error('[FAIL] svg-diagrams.md 內找不到 ```svg 圍欄範本'); process.exit(1); }
const svgSource = m[1];

const outDir = path.join(root, 'outputs');
mkdirSync(outDir, { recursive: true });
// 以 HTML 包裹內嵌渲染（直接以 .svg 為文件根截圖易逾時），另以 DOMParser 驗 XML 合法性
const htmlPath = path.join(outDir, '_verify-svg-template.html');
writeFileSync(htmlPath, `<!doctype html><meta charset="utf-8"><body style="margin:0;width:1200px">${svgSource}</body>`, 'utf8');

const chromium = await loadChromium();
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1240, height: 760 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(htmlPath).href);

// 斷言：XML 合法（DOMParser 無 parsererror）、svg 元素存在、文字節點有渲染
const result = await page.evaluate((src) => {
  const doc = new DOMParser().parseFromString(src, 'image/svg+xml');
  return {
    parserError: doc.querySelector('parsererror') !== null,
    hasSvg: document.querySelector('svg') !== null,
    textCount: document.querySelectorAll('text').length,
  };
}, svgSource);

const pngPath = path.join(outDir, '_verify-svg-template.png');
await page.locator('svg').screenshot({ path: pngPath });
await browser.close();

if (result.parserError || !result.hasSvg || result.textCount < 10) {
  console.error('[FAIL]', JSON.stringify(result));
  process.exit(1);
}
console.log('[PASS] SVG 範本渲染正常：', JSON.stringify(result));
console.log('截圖：', pngPath);

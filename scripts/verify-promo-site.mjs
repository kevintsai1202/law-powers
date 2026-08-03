// 驗證腳本：檢查 law-powers 宣傳頁的多尺寸版面、互動、連結與瀏覽器錯誤。
// 使用方式：$env:NODE_PATH='<bundled-node-modules>'; $env:URL='http://127.0.0.1:4173/'; node scripts/verify-promo-site.mjs

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

// 驗證目標與截圖位置可由環境變數覆蓋，以便本機與 CI 共用。
const TARGET_URL = process.env.URL || "http://127.0.0.1:4173/";
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || resolve(process.env.TEMP || ".", "law-powers-promo-verify");
const SITE_ROOT = resolve("docs");

// 本機驗證所需的基本 MIME 對映，確保圖片與靜態文件以正確內容類型回傳。
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

/**
 * 啟動僅供本次驗證使用的靜態網站伺服器；若外部已提供 URL 則不啟動。
 * @returns {Promise<import("node:http").Server|null>} 已啟動的伺服器，或外部 URL 模式下的 null。
 */
async function startLocalServer() {
  if (process.env.URL) return null;

  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url || "/", TARGET_URL).pathname);
      const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const filePath = resolve(SITE_ROOT, relativePath);
      if (!filePath.startsWith(`${SITE_ROOT}\\`) && filePath !== SITE_ROOT) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const content = await readFile(filePath);
      response.writeHead(200, { "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream" });
      response.end(content);
    } catch {
      response.writeHead(404).end("Not Found");
    }
  });

  await new Promise((resolveListen) => server.listen(4173, "127.0.0.1", resolveListen));
  return server;
}

// 三組視窗涵蓋桌機、平板與常見窄版手機寬度。
const PROFILES = [
  { id: "desktop", viewport: { width: 1440, height: 1000 } },
  { id: "tablet", viewport: { width: 768, height: 1024 } },
  { id: "mobile", viewport: { width: 375, height: 812 } },
];

/**
 * 分段捲動頁面，觸發 IntersectionObserver 動畫並確認視窗可以正常捲動。
 * @param {import("playwright").Page} page Playwright 頁面物件。
 * @returns {Promise<void>}
 */
async function revealWholePage(page) {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < pageHeight; y += 650) {
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
    await page.waitForTimeout(110); // 等待 IntersectionObserver 與淡入動畫接收捲動事件。
  }
  const finalY = await page.evaluate(() => window.scrollY);
  assert.ok(finalY > 0, "頁面無法正常捲動");
  await page.locator(".reveal").evaluateAll((elements) => elements.forEach((element) => element.classList.add("visible")));
  await page.waitForTimeout(750); // 等待所有 650ms 淡入轉場完成後再進行視覺擷取。
  await page.evaluate(() => window.scrollTo(0, 0));
}

/**
 * 驗證單一 viewport 的必要內容、RWD、主題切換、外部連結安全屬性與 console 狀態。
 * @param {import("playwright").Browser} browser Playwright 瀏覽器物件。
 * @param {{id:string, viewport:{width:number,height:number}}} profile 驗證尺寸設定。
 * @returns {Promise<void>}
 */
async function verifyProfile(browser, profile) {
  const context = await browser.newContext({ viewport: profile.viewport, locale: "zh-TW", colorScheme: "light" });
  const page = await context.newPage();
  const runtimeErrors = [];

  page.on("pageerror", (error) => runtimeErrors.push(`[pageerror] ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(`[console.error] ${message.text()}`);
  });

  const response = await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30_000 });
  assert.ok(response?.ok(), `${profile.id}: 首頁 HTTP 狀態異常`);
  await page.waitForSelector("main #top h1");

  assert.match(await page.title(), /law-powers/, `${profile.id}: 頁面標題缺少專案名稱`);
  assert.match(await page.locator("main #top h1").innerText(), /每一句依據/, `${profile.id}: Hero 主標不存在`);
  assert.equal(
    (await page.locator("#install-command").innerText()).trim(),
    "npx skills add kevintsai1202/law-powers -g --all",
    `${profile.id}: 安裝指令未使用 Skills CLI`,
  );
  // GitHub 星數徽章：元素必須存在；API 可達時須顯示數字，不可達時允許保持隱藏（fail-silent 設計）。
  const starBadge = page.locator("#github-stars");
  assert.equal(await starBadge.count(), 1, `${profile.id}: 導覽列缺少 GitHub 星數徽章元素`);
  if (!(await starBadge.evaluate((element) => element.hidden))) {
    assert.match(
      (await page.locator("#github-star-count").innerText()).trim(),
      /^\d+$/,
      `${profile.id}: 星數徽章顯示中但內容不是數字`,
    );
  }
  const installNote = (await page.locator(".cta-card .install-note").innerText()).trim();
  assert.match(installNote, /Failed to install/, `${profile.id}: 安裝補充說明缺少 Failed to install 提示`);
  assert.match(installNote, /-a claude-code/, `${profile.id}: 安裝補充說明缺少指定 agent 的替代指令`);
  const heroImage = page.locator('.hero-visual img');
  assert.ok(await heroImage.isVisible(), `${profile.id}: Hero 圖片不可見`);
  assert.ok(await heroImage.evaluate((image) => image.complete && image.naturalWidth > 0), `${profile.id}: Hero 圖片載入失敗`);
  assert.equal(await page.locator("#tools .tool-card").count(), 2, `${profile.id}: 開源工具卡片數量錯誤`);
  assert.equal(await page.locator("#skills .feature-card").count(), 8, `${profile.id}: 技能卡片數量錯誤`);
  assert.equal(await page.locator("#examples .example-card").count(), 4, `${profile.id}: 使用範例卡片數量錯誤`);
  assert.equal(await page.locator("#changelog .timeline-group").count(), 5, `${profile.id}: 變更歷程日期節點數量錯誤`);
  assert.equal(await page.locator("#graph-guide .battle-list li").count(), 4, `${profile.id}: 產生圖譜步驟數量錯誤`);
  const graphShot = page.locator("#graph-guide .graph-shot img");
  await graphShot.scrollIntoViewIfNeeded();
  assert.ok(await graphShot.isVisible(), `${profile.id}: 圖譜示範圖不可見`);
  assert.ok(await graphShot.evaluate((image) => image.complete && image.naturalWidth > 0), `${profile.id}: 圖譜示範圖載入失敗`);
  assert.ok(await page.locator('[data-od-id="trust-gate-workflow"]').isVisible(), `${profile.id}: 信任閘門區塊不可見`);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  assert.ok(overflow.scrollWidth <= overflow.innerWidth + 1, `${profile.id}: 水平溢出 ${overflow.scrollWidth} > ${overflow.innerWidth}`);

  const unsafeExternalLinks = await page.locator('a[target="_blank"]').evaluateAll((links) => links.filter((link) => {
    const rel = link.getAttribute("rel") || "";
    return !rel.includes("noopener") || !rel.includes("noreferrer");
  }).length);
  assert.equal(unsafeExternalLinks, 0, `${profile.id}: 外部連結缺少 noopener/noreferrer`);

  await page.locator("#theme-toggle").click();
  assert.ok(await page.locator("html").evaluate((element) => element.classList.contains("dark-mode")), `${profile.id}: 深色模式未啟用`);
  await page.reload({ waitUntil: "networkidle" });
  assert.ok(await page.locator("html").evaluate((element) => element.classList.contains("dark-mode")), `${profile.id}: 深色模式未持久化`);
  await page.locator("#theme-toggle").click();
  assert.ok(await page.locator("html").evaluate((element) => element.classList.contains("light-mode")), `${profile.id}: 無法切回淺色模式`);

  await revealWholePage(page);
  await page.mouse.move(profile.viewport.width - 4, profile.viewport.height - 4);
  await page.addStyleTag({ content: ".nav { position: absolute !important; width: 100%; } .skip-link { display: none !important; }" });
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, `${profile.id}-full.png`), fullPage: true });

  assert.equal(runtimeErrors.length, 0, `${profile.id}: 瀏覽器錯誤\n${runtimeErrors.join("\n")}`);
  await context.close();
}

const localServer = await startLocalServer();
const browser = await chromium.launch({ headless: true });
try {
  for (const profile of PROFILES) await verifyProfile(browser, profile);
  console.log(`PASS：${PROFILES.length} 組 viewport 均通過，截圖位於 ${SCREENSHOT_DIR}`);
} finally {
  await browser.close();
  if (localServer) await new Promise((resolveClose) => localServer.close(resolveClose));
}

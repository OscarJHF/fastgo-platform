import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOTS_DIR = 'C:\\Users\PC\\Desktop\\FastGo_beta2\\fastgo-frontend\\scripts\\screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runBrowserTest() {
  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Cloudflare /descargar
  console.log("Navigating to Cloudflare /descargar...");
  await page.goto("https://fastgo-app.fastgo-frontend.workers.dev/descargar", { waitUntil: 'networkidle2' });
  const cfTitle = await page.title();
  console.log("Cloudflare Page Title:", cfTitle);
  const cfBtn = await page.$('#btn-descargar-apk');
  const cfBtnHref = cfBtn ? await page.evaluate(el => el.getAttribute('href'), cfBtn) : null;
  const cfBtnDownload = cfBtn ? await page.evaluate(el => el.getAttribute('download'), cfBtn) : null;
  const cfBadgeText = await page.evaluate(() => {
    const el = document.querySelector('#btn-descargar-apk + div');
    return el ? el.textContent.trim() : null;
  });
  console.log("Cloudflare Button Href:", cfBtnHref);
  console.log("Cloudflare Button Download attr:", cfBtnDownload);
  console.log("Cloudflare Version Badge:", cfBadgeText);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'cloudflare_descargar_page.png') });

  // 2. Render /descargar
  console.log("\nNavigating to Render /descargar...");
  await page.goto("https://fastgo-frontend.onrender.com/descargar", { waitUntil: 'networkidle2' });
  const renderTitle = await page.title();
  console.log("Render Page Title:", renderTitle);
  const renderBtn = await page.$('#btn-descargar-apk');
  const renderBtnHref = renderBtn ? await page.evaluate(el => el.getAttribute('href'), renderBtn) : null;
  const renderBtnDownload = renderBtn ? await page.evaluate(el => el.getAttribute('download'), renderBtn) : null;
  const renderBadgeText = await page.evaluate(() => {
    const el = document.querySelector('#btn-descargar-apk + div');
    return el ? el.textContent.trim() : null;
  });
  console.log("Render Button Href:", renderBtnHref);
  console.log("Render Button Download attr:", renderBtnDownload);
  console.log("Render Version Badge:", renderBadgeText);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'render_descargar_page.png') });

  // 3. Navbar App Link on Home
  console.log("\nChecking Navbar on Cloudflare Home...");
  await page.goto("https://fastgo-app.fastgo-frontend.workers.dev/", { waitUntil: 'networkidle2' });
  const navAppBtn = await page.$('a[href*="/descargar"]');
  const navAppHref = navAppBtn ? await page.evaluate(el => el.getAttribute('href'), navAppBtn) : null;
  console.log("Cloudflare Navbar Download Button Href:", navAppHref);

  console.log("\nChecking Navbar on Render Home...");
  await page.goto("https://fastgo-frontend.onrender.com/", { waitUntil: 'networkidle2' });
  const renderNavBtn = await page.$('a[href*="/descargar"]');
  const renderNavHref = renderNavBtn ? await page.evaluate(el => el.getAttribute('href'), renderNavBtn) : null;
  console.log("Render Navbar Download Button Href:", renderNavHref);

  await browser.close();
  console.log("\nBrowser test completed successfully!");
}

runBrowserTest().catch(err => {
  console.error("Browser test failed:", err);
  process.exit(1);
});

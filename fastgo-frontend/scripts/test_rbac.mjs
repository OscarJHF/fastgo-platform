import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent.includes('Cliente'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 200));
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1500));
  await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle0' });
  console.log('URL:', page.url());
  console.log('TEXT:', (await page.evaluate(() => document.body.innerText)).slice(0, 300));
  await browser.close();
}

test();

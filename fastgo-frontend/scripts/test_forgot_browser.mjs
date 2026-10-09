import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'https://fastgo-app.fastgo-frontend.workers.dev/forgot-password';

async function testForgotPassword() {
  console.log('--- Launching Chrome Headless ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.toString()}`);
  });

  page.on('request', req => {
    if (req.url().includes('/api/')) {
      console.log(`[NETWORK REQ] ${req.method()} ${req.url()}`);
      console.log(`  Headers:`, JSON.stringify(req.headers()));
      if (req.postData()) {
        console.log(`  PostData:`, req.postData());
      }
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      console.log(`[NETWORK RES] ${res.status()} ${res.url()}`);
      try {
        const text = await res.text();
        console.log(`  Body:`, text);
      } catch (e) {
        console.log(`  Body: (error reading body: ${e.message})`);
      }
    }
  });

  page.on('requestfailed', req => {
    if (req.url().includes('/api/')) {
      console.log(`[NETWORK FAILED] ${req.method()} ${req.url()}`);
      console.log(`  Failure:`, req.failure()?.errorText);
    }
  });

  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  console.log('Typing email...');
  const inputSelector = 'input[type="email"]';
  await page.waitForSelector(inputSelector);
  await page.type(inputSelector, 'test_recovery_audit@fastgo.com');

  console.log('Submitting form...');
  const buttonSelector = 'button[type="submit"]';
  await page.click(buttonSelector);

  // Wait a few seconds for network activity and UI response
  await new Promise(r => setTimeout(r, 4000));

  const alertText = await page.evaluate(() => {
    const errorAlert = document.querySelector('.bg-rose-50');
    const successAlert = document.querySelector('.bg-emerald-50');
    return {
      error: errorAlert ? errorAlert.innerText : null,
      success: successAlert ? successAlert.innerText : null
    };
  });
  console.log('UI Alert state:', JSON.stringify(alertText, null, 2));

  await page.screenshot({ path: 'C:\\Users\\PC\\Desktop\\FastGo_beta2\\fastgo-frontend\\scripts\\screenshots\\test_forgot_result.png' });
  console.log('Screenshot saved.');

  await browser.close();
}

testForgotPassword().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

import puppeteer from 'puppeteer-core';
async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 800 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  const offending = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const elements = Array.from(document.querySelectorAll('*'));
    return elements
      .map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          className: el.className,
          rect: { left: rect.left, right: rect.right, width: rect.width },
          text: (el.textContent || '').slice(0, 30)
        };
      })
      .filter(x => x.rect.right > docWidth + 2);
  });
  console.log('OFFENDING ELEMENTS:', offending.slice(0, 10));
  await browser.close();
}
run();

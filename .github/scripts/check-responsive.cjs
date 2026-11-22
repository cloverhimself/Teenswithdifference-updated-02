const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { stdio: 'ignore' });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const widths = [320, 360, 375, 390, 414, 430, 540, 650, 768, 900, 1024, 1280, 1440];
  const pages = ['index.html', 'about.html', 'media.html'];
  const problems = [];
  fs.mkdirSync('responsive-screenshots', { recursive: true });
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    for (const pageName of pages) {
      for (const width of widths) {
        const page = await browser.newPage({ viewport: { width, height: 812 }, deviceScaleFactor: 1 });
        await page.goto('http://127.0.0.1:8765/' + pageName, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(150);
        const result = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const main = [...document.querySelectorAll('.cgmk-activity,.cgmk-activity-time,.cgmk-activity-name,.cgmk-activities-list,.cgmk-media-content,.cgmk-media-grid,.cgmk-footer-columns,.cgmk-nav-action,.cgmk-brand')];
          const escaped = main.filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -2 || r.right > vw + 2); }).map(el => ({ selector: el.className || el.tagName, left: Math.round(el.getBoundingClientRect().left), right: Math.round(el.getBoundingClientRect().right) }));
          const calendarButtons=[...document.querySelectorAll('.cgmk-calendar-days button')];
          const calendarChecks = calendarButtons.length ? (() => {
            const css=getComputedStyle(calendarButtons[0]);
            const boxes=calendarButtons.map(b=>b.getBoundingClientRect());
            const calendar=document.querySelector('.cgmk-calendar-days').getBoundingClientRect();
            const controlButtons=[...document.querySelectorAll('.cgmk-calendar-controls button')];
            const controls=controlButtons.map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}));
            const badCells=boxes.filter(b=>b.left < calendar.left-2 || b.right > calendar.right+2 || b.height > 65 || b.width < 20).length;
            const rows=[...new Set(boxes.map(b=>Math.round(b.top)))];
            return { count:calendarButtons.length, letterSpacing:css.letterSpacing, textTransform:css.textTransform, cellHeight:Math.round(boxes[0].height), badCells, rows:rows.length, controls };
          })() : null;
          return { doc: document.documentElement.scrollWidth, vw, escaped, calendarChecks };
        });
        console.log(pageName, width, JSON.stringify(result));
        if (result.doc > width + 2 || result.escaped.length) problems.push({ pageName, width, ...result });
        if (pageName === 'index.html') {
          const c=result.calendarChecks;
          if (!c || c.count < 28 || c.badCells || c.letterSpacing !== '0px' || c.textTransform !== 'none' || c.controls.length !== 2 || c.controls.some(b=>Math.abs(b.width-b.height)>2 || b.width > 40)) problems.push({ pageName, width, calendarProblem:c });
        }
        if ([320, 375, 430, 768, 1280].includes(width)) await page.screenshot({ path: path.join('responsive-screenshots', pageName.replace('.html', '') + '-' + width + '.png'), fullPage: true });
        await page.close();
      }
    }
  } finally { await browser.close(); server.kill(); }
  if (problems.length) { console.error('Responsive layout failures:', JSON.stringify(problems, null, 2)); process.exitCode = 1; }
})().catch(e => { console.error(e); process.exitCode = 1; });

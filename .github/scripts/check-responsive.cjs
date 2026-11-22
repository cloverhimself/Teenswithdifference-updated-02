const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { stdio: 'ignore' });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const widths = [320, 360, 375, 390, 414, 430, 540, 650, 768, 900, 1024, 1280, 1440];
  const pages = ['index.html', 'about.html', 'media.html', 'contact.html', 'give.html', 'admin/index.html'];
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
          if (!c || c.count < 28 || c.badCells || !['0px','normal'].includes(c.letterSpacing) || c.textTransform !== 'none' || c.controls.length !== 2 || c.controls.some(b=>Math.abs(b.width-b.height)>2 || b.width > 40)) problems.push({ pageName, width, calendarProblem:c });
        }
        if (pageName === 'contact.html') {
          if (await page.locator('.cgmk-connect-item').count() < 5) problems.push({pageName,width,interaction:'Contact options missing'});
          if (await page.locator('#connectForm').count()) problems.push({pageName,width,interaction:'Legacy contact form still present'});
        }
        if (pageName === 'about.html') {
          const initial = await page.locator('#cgmk-mission-panel').isVisible();
          const hidden = await page.locator('#cgmk-philosophy-panel').isHidden();
          if (!initial || !hidden) problems.push({ pageName, width, interaction:'Mission tab not initially visible' });
          await page.locator('#cgmk-philosophy-tab').click();
          const switched = await page.locator('#cgmk-philosophy-panel').isVisible();
          if (!switched || await page.locator('#cgmk-mission-panel').isVisible()) problems.push({ pageName, width, interaction:'Mission philosophy switch failed' });
          if (await page.locator('.cgmk-value-row').count() !== 0) problems.push({ pageName, width, interaction:'Removed values still present' });
          if (await page.locator('.cgmk-identity-photo img').count() !== 2) problems.push({ pageName, width, interaction:'Mission or philosophy image missing' });
          if (!await page.locator('.cgmk-about-hero-image').count()) problems.push({ pageName, width, interaction:'About hero image absent' });
        }
        const eventLink=page.locator('.cgmk-nav a').filter({hasText:'Events'}).first();
        if (await eventLink.count() && await eventLink.getAttribute('href') !== 'index.html#activities') problems.push({pageName,width,interaction:'Events does not link to homepage calendar'});
        const giveLink=page.locator('.cgmk-nav a[href="give.html"]').first();
        if (!await giveLink.count()) problems.push({pageName,width,interaction:'Give missing from navigation'});
        const live=page.locator('.cgmk-nav-action').first();
        if (await live.count()) {
          const buttonStyle=await live.evaluate(el=>getComputedStyle(el).backgroundColor);
          if (buttonStyle==='rgba(0, 0, 0, 0)') problems.push({pageName,width,interaction:'Watch Live is transparent'});
        }
        if(pageName==='index.html' && await page.locator('.cgmk-give-preview').count()!==1) problems.push({pageName,width,interaction:'Homepage Give preview missing'});
        if(pageName==='admin/index.html'){
          const overview=page.locator('#view-overview');
          if(!await overview.isVisible()) problems.push({pageName,width,interaction:'Admin overview not visible'});
          if(width<=800){
            const mobileToggle=page.locator('#adminToggle');
            await mobileToggle.click();
            if(!await page.locator('#adminSidebar').evaluate(e=>e.classList.contains('open'))) problems.push({pageName,width,interaction:'Admin mobile sidebar does not open'});
            await page.locator('#adminOverlay').click({position:{x:width-10,y:150}});
          }
          await page.locator('[data-view="events"]').click();
          await page.locator('[data-action="new-event"]').last().click();
          const modal=page.locator('#eventDialog');
          if(!await modal.isVisible()) problems.push({pageName,width,interaction:'Event dialog not visible'});
          await page.locator('#eventForm [name="title"]').fill('Demo event');
          await page.locator('#eventForm [name="date"]').fill('2027-01-14');
          await page.locator('#eventForm [name="time"]').fill('18:00');
          await page.locator('#eventForm button[type="submit"]').click();
          if(!await page.locator('.adm-event-row').count()) problems.push({pageName,width,interaction:'Event draft not saved'});
          await page.reload({waitUntil:'domcontentloaded'});
          await page.locator('[data-view="events"]').click();
          if(!await page.locator('.adm-event-row').count()) problems.push({pageName,width,interaction:'Event draft not persisted locally'});
        }
        if(pageName==='give.html'){
          if(await page.locator('.cgmk-give-method').count()!==3) problems.push({pageName,width,interaction:'Giving methods missing'});
          if(!await page.locator('.cgmk-give-contact-button').count()) problems.push({pageName,width,interaction:'Verified giving contact missing'});
        }
        if(width<=900){
          const toggle=page.locator('.cgmk-menu-toggle');
          await toggle.click();
          const drawer=page.locator('#cgmkNav');
          const drawerBox=await drawer.boundingBox();
          if(await toggle.getAttribute('aria-expanded')!=='true' || !drawerBox || drawerBox.width < width*.9) problems.push({pageName,width,interaction:'Mobile full-screen drawer did not open'});
          await page.keyboard.press('Escape');
          if(await toggle.getAttribute('aria-expanded')!=='false') problems.push({pageName,width,interaction:'Mobile drawer did not close with Escape'});
        }
        if ([320, 375, 430, 768, 1280].includes(width)) await page.screenshot({ path: path.join('responsive-screenshots', pageName.replace('.html', '') + '-' + width + '.png'), fullPage: true });
        await page.close();
      }
    }
  } finally { await browser.close(); server.kill(); }
  if (problems.length) { console.error('Responsive layout failures:', JSON.stringify(problems, null, 2)); process.exitCode = 1; }
})().catch(e => { console.error(e); process.exitCode = 1; });

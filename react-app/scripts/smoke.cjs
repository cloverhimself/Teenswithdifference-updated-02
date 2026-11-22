const {chromium}=require("playwright");
const {spawn}=require("node:child_process");
const fs=require("node:fs");
(async()=>{
  const server=spawn("npx",["vite","preview","--host","127.0.0.1","--port","4173","--strictPort"],{stdio:"ignore",shell:process.platform==="win32"});
  const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const widths=[320,375,430,768,1024,1440];
  const routes=["/","/about","/media","/give","/contact"];
  const failures=[];
  fs.mkdirSync("responsive-screenshots",{recursive:true});
  const check=(ok,description)=>{if(!ok)failures.push(description)};
  try{
    let ready=false;
    for(let i=0;i<25;i++){
      try{const response=await fetch("http://127.0.0.1:4173/");if(response.ok){ready=true;break}}catch{}
      await new Promise(r=>setTimeout(r,500));
    }
    if(!ready)throw new Error("Vite preview did not start");
    for(const width of widths){
      for(const route of routes){
        const page=await browser.newPage({viewport:{width,height:820},deviceScaleFactor:1});
        const errors=[];
        page.on("pageerror",e=>errors.push(e.message));
        const response=await page.goto("http://127.0.0.1:4173"+route,{waitUntil:"domcontentloaded"});
        await page.waitForTimeout(150);
        const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
        check(response?.ok()===true,`${route} ${width}: response failed`);
        check(overflow.scroll<=overflow.viewport+2,`${route} ${width}: horizontal overflow ${JSON.stringify(overflow)}`);
        check(errors.length===0,`${route} ${width}: runtime errors: ${errors.join("; ")}`);
        if(route==="/"){
          check(await page.locator(".cgmk-calendar-days button").count()>=28,`${width}: calendar days absent`);
          check(await page.locator(".cgmk-home-give-last").count()===1,`${width}: Give section missing`);
          const prev=await page.locator(".cgmk-calendar-header h3").innerText();
          await page.getByRole("button",{name:"Next month"}).click();
          check((await page.locator(".cgmk-calendar-header h3").innerText())!==prev,`${width}: month navigation broken`);
        }
        if(route==="/about"){
          check(await page.locator(".cgmk-timeline-step").count()===5,`${width}: about timeline count incorrect`);
          await page.getByRole("tab",{name:"Our philosophy"}).click();
          check(await page.getByRole("tabpanel").getByText("In every newcomer", {exact:false}).count()===1,`${width}: philosophy tab broken`);
        }
        if(route==="/media"){
          check(await page.locator(".cgmk-library-card").count()===25,`${width}: gallery image count incorrect`);
          await page.getByRole("button",{name:"Women",exact:true}).click();
          const count=await page.locator(".cgmk-library-card").count();
          check(count>0&&count<25,`${width}: media filter failed, ${count}`);
          await page.getByRole("button",{name:"Messages"}).click();
          check(await page.getByText("No audio messages are published here yet.").count()===1,`${width}: messages state missing`);
        }
        if(route==="/give"){
          check(await page.locator(".cgmk-bank-account").count()===4,`${width}: giving accounts missing`);
          check(await page.locator(".cgmk-bank-account-number button:not([disabled])").count()===0,`${width}: placeholder copy enabled`);
        }
        if(width<=900){
          const menu=page.getByRole("button",{name:"Open navigation"});
          await menu.click();
          check(await page.locator("#cgmkNav").evaluate(n=>n.classList.contains("is-open")),`${route} ${width}: drawer did not open`);
          await page.keyboard.press("Escape");
          check(await page.locator("#cgmkNav").evaluate(n=>!n.classList.contains("is-open")),`${route} ${width}: drawer did not close`);
        }
        if([375,768,1440].includes(width))await page.screenshot({path:`responsive-screenshots/${route==="/"?"home":route.slice(1)}-${width}.png`,fullPage:true});
        await page.close();
      }
    }
  }finally{await browser.close();server.kill();}
  if(failures.length){console.error("Responsive smoke failures:",failures.join("\n"));process.exitCode=1;}
  else console.log(`Passed ${widths.length*routes.length} route-and-viewport checks`);
})().catch(e=>{console.error(e);process.exitCode=1});

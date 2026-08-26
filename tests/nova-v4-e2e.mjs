import { chromium } from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const result={checks:[],samples:{},errors};const check=(n,ok,d='')=>{result.checks.push({name:n,ok,detail:d});if(!ok)throw new Error(`${n}: ${d}`)};
const box=async i=>page.locator(`.nova-car[data-index="${i}"]`).boundingBox();const frac=(b,s)=>Math.max(0,Math.min(b.x+b.width,s.x+s.width)-Math.max(b.x,s.x))/b.width;const cx=b=>b.x+b.width/2;
try{
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>document.documentElement.dataset.dealerTrackReady==='true',null,{timeout:15000});await page.waitForTimeout(1800);
 check('NOVA V4 active',await page.locator('html').getAttribute('data-orbital-choreography')==='nova-vehicle-track-v4',await page.locator('html').getAttribute('data-orbital-choreography'));
 check('isolated stage exists',await page.locator('.nova-track-stage').count()===1,String(await page.locator('.nova-track-stage').count()));
 check('six NOVA cars',await page.locator('.nova-car').count()===6,String(await page.locator('.nova-car').count()));
 check('donor orbit hidden',(await page.locator('#orbit-stage').evaluate(el=>getComputedStyle(el).visibility))==='hidden',await page.locator('#orbit-stage').evaluate(el=>getComputedStyle(el).visibility));
 const imgs=await page.locator('.nova-car img').evaluateAll(xs=>xs.map(x=>({src:x.getAttribute('src'),w:x.naturalWidth,h:x.naturalHeight,complete:x.complete})));
 check('six repository PNGs loaded',imgs.length===6&&imgs.every(x=>x.complete&&x.w>500&&x.h>500&&String(x.src).startsWith('imagenes/')),JSON.stringify(imgs));
 const shell=await page.locator('.orbit-shell').boundingBox(),left=await box(5),hero=await box(0),right=await box(1);const lf=frac(left,shell),rf=frac(right,shell);
 check('hero centered',Math.abs(cx(hero)-cx(shell))<30,JSON.stringify({hero:cx(hero),shell:cx(shell)}));
 check('left neighbor visible',lf>=.28,String(lf));check('right neighbor visible',rf>=.28,String(rf));
 const op=await page.locator('.nova-car').evaluateAll(xs=>xs.map(x=>Number(getComputedStyle(x).opacity)));check('hero authority',op[0]>.95&&op[5]>.55&&op[1]>.55&&op[0]>op[5]&&op[0]>op[1],JSON.stringify(op));
 await page.screenshot({path:'qa/nova-v4-rest.png'});
 const before={s:cx(hero),x:cx(right),title:await page.locator('#dish-title').innerText()};await page.evaluate(()=>window.NovaVehicleMotion.next());await page.waitForTimeout(350);const mid={s:cx(await box(0)),x:cx(await box(1)),title:await page.locator('#dish-title').innerText()};
 check('track moves physically',mid.s<before.s-100&&mid.x<before.x-100,JSON.stringify({before,mid}));await page.waitForTimeout(950);const after={x:cx(await box(1)),shell:cx(shell),title:await page.locator('#dish-title').innerText()};check('Model X locks centre',Math.abs(after.x-after.shell)<30,JSON.stringify(after));check('copy syncs Model X',after.title.includes('Model X'),after.title);
 await page.waitForTimeout(900);const stable=cx(await box(1));check('donor cannot wake visible track',Math.abs(stable-after.x)<3,String(stable-after.x));
 const secondary=await page.locator('[data-media-host="hero"] img,[data-media-host="origin"] img,[data-media-host="atmosphere"] img,[data-media-host="chef"] img').evaluateAll(xs=>xs.map(x=>({src:x.getAttribute('src'),w:x.naturalWidth,h:x.naturalHeight})));
 check('Tesla images in other sections',secondary.length>=4&&secondary.every(x=>x.w>500&&x.h>500&&String(x.src).startsWith('imagenes/')),JSON.stringify(secondary));
 check('no JS errors',errors.length===0,errors.join('\n'));await page.screenshot({path:'qa/nova-v4-model-x.png'});result.ok=true;
}catch(e){result.ok=false;result.failure=e.message;fs.mkdirSync('qa',{recursive:true});await page.screenshot({path:'qa/nova-v4-failure.png',fullPage:true}).catch(()=>{})}
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/nova-v4.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();if(!result.ok)process.exit(1);
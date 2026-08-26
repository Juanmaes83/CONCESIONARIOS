import { chromium } from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const result={checks:[],samples:{},errors};const check=(n,ok,d='')=>{result.checks.push({name:n,ok,detail:d});if(!ok)throw new Error(`${n}: ${d}`)};
const car=i=>page.locator(`.nova-car[data-index="${i}"]`);const box=async i=>car(i).boundingBox();const cx=b=>b.x+b.width/2;const frac=(b,s)=>Math.max(0,Math.min(b.x+b.width,s.x+s.width)-Math.max(b.x,s.x))/b.width;
const opacity=async i=>Number(await car(i).evaluate(el=>getComputedStyle(el).opacity));
const role=async i=>car(i).getAttribute('data-authority');
try{
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>document.documentElement.dataset.dealerTrackReady==='true',null,{timeout:15000});
 await page.locator('#signature').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 const sig=await page.locator('#signature').boundingBox();check('showcase in viewport',sig.y<1000&&sig.y+sig.height>0,JSON.stringify(sig));
 check('V5 active',await page.locator('html').getAttribute('data-orbital-choreography')==='nova-three-car-relay-v5',await page.locator('html').getAttribute('data-orbital-choreography'));
 check('isolated NOVA stage',await page.locator('.nova-track-stage').count()===1,String(await page.locator('.nova-track-stage').count()));
 check('six cars',await page.locator('.nova-car').count()===6,String(await page.locator('.nova-car').count()));
 const imgs=await page.locator('.nova-car img').evaluateAll(xs=>xs.map(x=>({src:x.getAttribute('src'),w:x.naturalWidth,h:x.naturalHeight,complete:x.complete})));
 check('six repository PNGs load',imgs.length===6&&imgs.every(x=>x.complete&&x.w>500&&x.h>500&&String(x.src).startsWith('imagenes/')),JSON.stringify(imgs));
 const shell=await page.locator('.orbit-shell').boundingBox(),left=await box(5),hero=await box(0),right=await box(1);
 check('hero centered',Math.abs(cx(hero)-cx(shell))<30,JSON.stringify({hero:cx(hero),shell:cx(shell)}));check('left visible',frac(left,shell)>=.28,String(frac(left,shell)));check('right visible',frac(right,shell)>=.28,String(frac(right,shell)));
 await page.locator('.orbit-shell').screenshot({path:'qa-v5/rest.png'});

 // True continuous drag: position must change before pointer release.
 const stage=page.locator('.nova-track-stage');const sb=await stage.boundingBox();const startX=sb.x+sb.width*.62,startY=sb.y+sb.height*.55;
 const x0=cx(await box(0));await page.mouse.move(startX,startY);await page.mouse.down();await page.mouse.move(startX-150,startY,{steps:8});await page.waitForTimeout(60);
 const xDrag=cx(await box(0));const pDrag=await page.evaluate(()=>window.NovaVehicleMotion.progress());
 check('drag maps 1:1 before release',xDrag<x0-80&&pDrag>.12,JSON.stringify({x0,xDrag,pDrag}));
 const r0=await role(0),r1=await role(1);check('relay roles appear during drag',r0==='outgoing'&&r1==='incoming',JSON.stringify({r0,r1}));
 await page.mouse.move(startX-360,startY,{steps:5});await page.waitForTimeout(40);const nextUpOpacity=await opacity(2);const nextRole=await role(2);check('next-up participates before lock',nextRole==='next-up'&&nextUpOpacity>.15,JSON.stringify({nextRole,nextUpOpacity}));
 await page.locator('.orbit-shell').screenshot({path:'qa-v5/mid-drag.png'});
 await page.mouse.up();const releaseP=await page.evaluate(()=>window.NovaVehicleMotion.progress());await page.waitForTimeout(120);const inertiaP=await page.evaluate(()=>window.NovaVehicleMotion.progress());
 check('release continues with inertia',Math.abs(inertiaP-releaseP)>.01,JSON.stringify({releaseP,inertiaP}));
 await page.waitForTimeout(1200);const lockP=await page.evaluate(()=>window.NovaVehicleMotion.progress()),x1=cx(await box(1));check('snap lands on integer',Math.abs(lockP-Math.round(lockP))<.002,String(lockP));check('Model X locks center',Math.abs(x1-cx(shell))<30,JSON.stringify({x1,shell:cx(shell)}));check('copy after takeover',(await page.locator('#dish-title').innerText()).includes('Model X'),await page.locator('#dish-title').innerText());
 await page.locator('.orbit-shell').screenshot({path:'qa-v5/lock-model-x.png'});

 // Scripted control uses same relay system and keeps editorial late.
 const beforeTitle=await page.locator('#dish-title').innerText();await page.click('#next-dish');await page.waitForTimeout(260);const earlyTitle=await page.locator('#dish-title').innerText();check('copy does not lead vehicle',earlyTitle===beforeTitle,JSON.stringify({beforeTitle,earlyTitle}));
 await page.waitForTimeout(300);const rr1=await role(1),rr2=await role(2),rr3=await role(3);check('three/four actor relay roles present',rr1==='outgoing'&&rr2==='incoming'&&rr3==='next-up',JSON.stringify({rr1,rr2,rr3}));
 await page.locator('.orbit-shell').screenshot({path:'qa-v5/takeover.png'});
 await page.waitForTimeout(650);check('Model Y final copy',(await page.locator('#dish-title').innerText()).includes('Model Y'),await page.locator('#dish-title').innerText());check('motion idle',await page.locator('html').getAttribute('data-vehicle-motion-phase')==='idle',await page.locator('html').getAttribute('data-vehicle-motion-phase'));
 const stable=cx(await box(2));await page.waitForTimeout(850);check('donor cannot wake visible stage',Math.abs(cx(await box(2))-stable)<3,String(cx(await box(2))-stable));
 const secondary=await page.locator('[data-media-host="hero"] img,[data-media-host="origin"] img,[data-media-host="atmosphere"] img,[data-media-host="chef"] img').evaluateAll(xs=>xs.map(x=>({src:x.getAttribute('src'),w:x.naturalWidth,h:x.naturalHeight})));
 check('vehicle imagery in secondary sections',secondary.length>=4&&secondary.every(x=>x.w>500&&x.h>500&&String(x.src).startsWith('imagenes/')),JSON.stringify(secondary));
 check('no JS errors',errors.length===0,errors.join('\n'));result.ok=true;
}catch(e){result.ok=false;result.failure=e.message;fs.mkdirSync('qa-v5',{recursive:true});await page.screenshot({path:'qa-v5/failure.png',fullPage:true}).catch(()=>{})}
fs.mkdirSync('qa-v5',{recursive:true});fs.writeFileSync('qa-v5/result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();if(!result.ok)process.exit(1);
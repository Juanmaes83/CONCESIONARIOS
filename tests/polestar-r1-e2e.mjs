import { chromium } from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const out={checks:[],samples:{},errors};const check=(n,ok,d='')=>{out.checks.push({name:n,ok,detail:d});if(!ok)throw new Error(`${n}: ${d}`)};
const box=async i=>page.locator(`.nova-car[data-index="${i}"]`).boundingBox();const cx=b=>b.x+b.width/2;
try{
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>document.documentElement.dataset.dealerTrackReady==='true',null,{timeout:15000});
 const sig=page.locator('#signature');await sig.scrollIntoViewIfNeeded();await page.waitForTimeout(700);
 check('Polestar R1 active',await page.locator('html').getAttribute('data-orbital-choreography')==='polestar-perspective-relay-r1',await page.locator('html').getAttribute('data-orbital-choreography'));
 const shell=await page.locator('.orbit-shell').boundingBox();const r0=await box(0),r1=await box(1);check('rest hero centred',Math.abs(cx(r0)-cx(shell))<32,JSON.stringify({hero:cx(r0),shell:cx(shell)}));
 const restYaw=await page.locator('.nova-car').evaluateAll(xs=>xs.map(x=>Number(x.dataset.yaw||0)));check('rest neighbours have perspective',Math.abs(restYaw[5])>12&&Math.abs(restYaw[1])>12&&Math.sign(restYaw[5])!==Math.sign(restYaw[1]),JSON.stringify(restYaw));
 await sig.screenshot({path:'qa-polestar/rest.png'});
 await page.evaluate(()=>window.NovaVehicleMotion.next());await page.waitForTimeout(390);
 const roles=await page.locator('.nova-car').evaluateAll(xs=>xs.map(x=>({i:Number(x.dataset.index),role:x.dataset.authority,yaw:Number(x.dataset.yaw||0),tr:getComputedStyle(x).transform,op:Number(getComputedStyle(x).opacity)})));
 const outgoing=roles.find(x=>x.role==='outgoing'),incoming=roles.find(x=>x.role==='incoming'),nextUp=roles.find(x=>x.role==='next-up');
 check('outgoing exists',!!outgoing,JSON.stringify(roles));check('incoming exists',!!incoming,JSON.stringify(roles));check('next-up participates',!!nextUp&&nextUp.op>.15,JSON.stringify(nextUp));
 check('opposite visible yaw',Math.abs(outgoing?.yaw||0)>12&&Math.abs(incoming?.yaw||0)>12&&Math.sign(outgoing.yaw)!==Math.sign(incoming.yaw),JSON.stringify({outgoing,incoming}));
 const mid0=await box(0),mid1=await box(1);check('physical cross is underway',cx(mid0)<cx(r0)-120&&cx(mid1)<cx(r1)-120,JSON.stringify({before:[cx(r0),cx(r1)],mid:[cx(mid0),cx(mid1)]}));
 await sig.screenshot({path:'qa-polestar/mid-cross.png'});
 await page.waitForTimeout(900);
 const lock=await box(1),lockYaw=Number(await page.locator('.nova-car[data-index="1"]').getAttribute('data-yaw'));check('new hero locks centre',Math.abs(cx(lock)-cx(shell))<32,JSON.stringify({car:cx(lock),shell:cx(shell)}));check('new hero returns flat',Math.abs(lockYaw)<2,String(lockYaw));
 check('copy locks late', (await page.locator('#dish-title').innerText()).includes('Model X'),await page.locator('#dish-title').innerText());check('no JS errors',errors.length===0,errors.join('\n'));
 await sig.screenshot({path:'qa-polestar/lock.png'});out.ok=true;
}catch(e){out.ok=false;out.failure=e.message;fs.mkdirSync('qa-polestar',{recursive:true});await page.screenshot({path:'qa-polestar/failure.png',fullPage:true}).catch(()=>{})}
fs.mkdirSync('qa-polestar',{recursive:true});fs.writeFileSync('qa-polestar/result.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));await browser.close();if(!out.ok)process.exit(1);
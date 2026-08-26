import { chromium } from 'playwright';
import fs from 'node:fs';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});
const result={checks:[],errors};
const check=(name,ok,detail='')=>{result.checks.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`)};
const title=()=>page.locator('#dish-title').innerText();
const expectTitle=async(name,label=name)=>check(label,(await title()).includes(name),await title());
try{
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle',timeout:60000});
  await page.waitForSelector('#orbit-stage .orbit-dish',{timeout:15000});
  await page.waitForTimeout(5200);
  check('dealer mode',await page.locator('html').getAttribute('data-dealer-mode')==='true');
  check('vehicle count',await page.locator('#orbit-stage .orbit-dish').count()===6,String(await page.locator('#orbit-stage .orbit-dish').count()));
  check('showcase title',(await page.locator('#orbital-title').innerText()).includes('Vehicle Showcase'),await page.locator('#orbital-title').innerText());
  await expectTitle('Model S','initial Model S');
  const alpha=await page.locator('#orbit-stage .orbit-dish img').evaluateAll(els=>els.map(e=>e.dataset.dealerAlpha||'none'));
  check('Higgsfield alpha',alpha.every(x=>x==='done'),alpha.join(','));

  await page.locator('#signature').scrollIntoViewIfNeeded();await page.waitForTimeout(400);await page.screenshot({path:'qa/dealer-01-model-s.png',fullPage:false});

  const box=await page.locator('.orbit-shell').boundingBox();
  check('orbit shell measurable',!!box,JSON.stringify(box));
  await page.mouse.move(box.x+box.width*.67,box.y+box.height*.55);await page.mouse.down();
  await page.mouse.move(box.x+box.width*.28,box.y+box.height*.55,{steps:14});await page.mouse.up();await page.waitForTimeout(1150);
  await expectTitle('Model X','drag Model S → Model X');

  const sequence=['Model Y','Model 3 Performance','Cybertruck','Roadster','Model S'];
  for(const model of sequence){await page.click('#next-dish');await page.waitForTimeout(1100);await expectTitle(model,`next → ${model}`)}
  await page.screenshot({path:'qa/dealer-02-loop-complete.png',fullPage:false});

  await page.locator('.orbit-shell').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(1100);await expectTitle('Model X','keyboard → Model X');
  await page.locator('.orbit-shell').hover();await page.mouse.wheel(0,500);await page.waitForTimeout(1100);await expectTitle('Model Y','wheel → Model Y');

  await page.click('#explore-dish');await page.waitForTimeout(700);
  check('vehicle detail',await page.locator('#dish-detail').getAttribute('aria-hidden')==='false');
  check('detail title',(await page.locator('#detail-title').innerText()).includes('Model Y'),await page.locator('#detail-title').innerText());
  await page.screenshot({path:'qa/dealer-03-detail.png',fullPage:false});
  await page.click('#detail-close');await page.waitForTimeout(700);

  await page.click('.studio-open');await page.waitForTimeout(300);
  check('Dealer Studio open',await page.locator('#studio').getAttribute('aria-hidden')==='false');
  check('Vehicles tab',(await page.locator('.studio-nav button[data-panel="dishes"]').innerText()).includes('Vehicles'));
  await page.click('.studio-nav button[data-panel="dishes"]');await page.waitForTimeout(180);
  check('six vehicles in Studio',await page.locator('#studio-dish-list').children().count()===6,String(await page.locator('#studio-dish-list').children().count()));
  await page.click('.studio-nav button[data-panel="motion"]');await page.waitForTimeout(180);
  check('Vehicle Track preset',await page.locator('#motion-orbital-style').inputValue()==='dealer',await page.locator('#motion-orbital-style').inputValue());
  await page.screenshot({path:'qa/dealer-04-studio.png',fullPage:false});

  await page.click('.studio-nav button[data-panel="brand"]');await page.waitForTimeout(120);
  const brandInput=page.locator('[data-path="brand.name"]');
  await brandInput.fill('NOVA MOTORS QA');await brandInput.dispatchEvent('input');await page.waitForTimeout(1100);
  check('studio autosave status',(await page.locator('#studio-status').innerText()).toLowerCase().includes('guardado'),await page.locator('#studio-status').innerText());
  await page.reload({waitUntil:'networkidle',timeout:60000});await page.waitForSelector('#orbit-stage .orbit-dish',{timeout:15000});await page.waitForTimeout(4800);
  check('persistence after reload',(await page.locator('[data-brand]').first().innerText()).includes('NOVA MOTORS QA'),await page.locator('[data-brand]').first().innerText());
  check('vehicle count after reload',await page.locator('#orbit-stage .orbit-dish').count()===6,String(await page.locator('#orbit-stage .orbit-dish').count()));
  check('Vehicle Track after reload',await page.locator('html').getAttribute('data-orbital-motion')==='dealer',await page.locator('html').getAttribute('data-orbital-motion'));
  check('showcase title after reload',(await page.locator('#orbital-title').innerText()).includes('Vehicle Showcase'),await page.locator('#orbital-title').innerText());
  check('no JS errors',errors.length===0,errors.join('\n'));
  result.ok=true;
}catch(err){result.ok=false;result.failure=err.message;fs.mkdirSync('qa',{recursive:true});await page.screenshot({path:'qa/dealer-failure.png',fullPage:true}).catch(()=>{});}
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/dealer-qa.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
await browser.close();
if(!result.ok)process.exit(1);
import { chromium } from 'playwright';
import fs from 'node:fs';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});
const result={checks:[],errors,motionSamples:{}};
const check=(name,ok,detail='')=>{result.checks.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`)};
const title=()=>page.locator('#dish-title').innerText();
const expectTitle=async(name,label=name)=>check(label,(await title()).includes(name),await title());
const boxFor=async id=>page.locator(`#orbit-stage .orbit-dish[data-id="${id}"]`).boundingBox();
const centreX=b=>b.x+b.width/2;
const banned=/\b(restaurant|plato|platos|chef|reserva|reservation|ingredients|allergens|pairing|orbital menu)\b/i;
const publicText=async()=>page.locator('main, footer, .topbar').innerText();
const sample=async(label)=>{const s=await boxFor('vehicle-01'),x=await boxFor('vehicle-02'),shell=await page.locator('.orbit-shell').boundingBox();const data={phase:await page.locator('html').getAttribute('data-vehicle-motion-phase'),modelS:centreX(s),modelX:centreX(x),shell:centreX(shell),copy:await title(),ghost:await page.locator('.dealer-ghost-current').innerText()};result.motionSamples[label]=data;return data};

try{
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle',timeout:60000});
  await page.waitForSelector('#orbit-stage .orbit-dish',{timeout:15000});
  await page.waitForTimeout(5200);
  check('dealer mode',await page.locator('html').getAttribute('data-dealer-mode')==='true');
  check('choreography V2',await page.locator('html').getAttribute('data-orbital-choreography')==='nova-vehicle-choreography-v2',await page.locator('html').getAttribute('data-orbital-choreography'));
  check('vehicle count',await page.locator('#orbit-stage .orbit-dish').count()===6,String(await page.locator('#orbit-stage .orbit-dish').count()));
  check('collection headline',(await page.locator('#orbital-title').innerText()).includes('Choose your next drive'),await page.locator('#orbital-title').innerText());
  check('public copy has no restaurant vocabulary',!banned.test(await publicText()),(await publicText()).match(banned)?.[0]||'clean');
  await expectTitle('Model S','initial Model S');
  const alpha=await page.locator('#orbit-stage .orbit-dish img').evaluateAll(els=>els.map(e=>e.dataset.dealerAlpha||'none'));
  check('Higgsfield alpha',alpha.every(x=>x==='done'),alpha.join(','));

  await page.locator('#signature').scrollIntoViewIfNeeded();await page.waitForTimeout(400);
  const initial=await sample('t0');await page.screenshot({path:'qa/dealer-01-model-s.png',fullPage:false});
  check('active car locked near centre',Math.abs(initial.modelS-initial.shell)<25,JSON.stringify(initial));
  check('next car already waiting at right',initial.modelX>initial.shell+300,JSON.stringify(initial));

  await page.evaluate(()=>window.NovaVehicleMotion.next());
  await page.waitForTimeout(65);const anticipation=await sample('t65');
  check('anticipation moves outgoing before main travel',anticipation.modelS<initial.modelS-4,JSON.stringify({initial,anticipation}));
  check('copy waits during anticipation',anticipation.copy.includes('Model S'),anticipation.copy);

  await page.waitForTimeout(285);const travel=await sample('t350');
  check('physical track: outgoing left',travel.modelS<initial.modelS-180,JSON.stringify(travel));
  check('physical track: incoming invades frame',travel.modelX<initial.modelX-180,JSON.stringify(travel));
  check('copy still follows outgoing during main travel',travel.copy.includes('Model S'),travel.copy);

  await page.waitForTimeout(330);const brake=await sample('t680');
  check('incoming dominates before lock',Math.abs(brake.modelX-brake.shell)<180,JSON.stringify(brake));
  check('copy changes only after vehicle takeover',brake.copy.includes('Model X'),brake.copy);

  await page.waitForTimeout(160);const overshoot=await sample('t840');
  await page.waitForTimeout(420);const locked=await sample('t1260');
  check('brake/overshoot crosses capture zone',Math.abs(overshoot.modelX-locked.modelX)>8,JSON.stringify({overshoot,locked}));
  check('final vehicle lock',Math.abs(locked.modelX-locked.shell)<25,JSON.stringify(locked));
  check('motion returns to idle',(await page.locator('html').getAttribute('data-vehicle-motion-phase'))==='idle',await page.locator('html').getAttribute('data-vehicle-motion-phase'));
  check('ghost index synchronized',await page.locator('.dealer-ghost-current').innerText()==='02',await page.locator('.dealer-ghost-current').innerText());
  const currentBars=await page.locator('.dealer-progress button[aria-current="true"]').count();check('one progress authority',currentBars===1,String(currentBars));
  await page.screenshot({path:'qa/dealer-02-model-x-lock.png',fullPage:false});

  const sequence=['Model Y','Model 3 Performance','Cybertruck','Roadster','Model S'];
  for(const model of sequence){await page.click('#next-dish');await page.waitForTimeout(1300);await expectTitle(model,`next → ${model}`)}
  await page.screenshot({path:'qa/dealer-03-loop-complete.png',fullPage:false});

  await page.locator('.orbit-shell').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(1300);await expectTitle('Model X','keyboard → Model X');
  await page.locator('.orbit-shell').hover();await page.mouse.wheel(0,500);await page.waitForTimeout(1300);await expectTitle('Model Y','wheel → Model Y');

  await page.click('#explore-dish');await page.waitForTimeout(700);
  check('vehicle detail',await page.locator('#dish-detail').getAttribute('aria-hidden')==='false');
  check('detail title',(await page.locator('#detail-title').innerText()).includes('Model Y'),await page.locator('#detail-title').innerText());
  check('detail has no restaurant vocabulary',!banned.test(await page.locator('#dish-detail').innerText()),(await page.locator('#dish-detail').innerText()).match(banned)?.[0]||'clean');
  await page.screenshot({path:'qa/dealer-04-detail.png',fullPage:false});
  await page.click('#detail-close');await page.waitForTimeout(700);

  await page.click('button.studio-open');await page.waitForTimeout(450);
  check('Dealer Studio open',await page.locator('#studio').getAttribute('aria-hidden')==='false');
  check('Vehicles tab',(await page.locator('.studio-nav button[data-panel="dishes"]').innerText()).includes('Vehicles'));
  for(const panel of ['brand','content','media','dishes','visit','motion','project']){
    const btn=page.locator(`.studio-nav button[data-panel="${panel}"]`);if(await btn.count()){await btn.click();await page.waitForTimeout(160);const txt=await page.locator(`.studio-panel[data-panel="${panel}"]`).innerText();check(`Studio ${panel} has dealership vocabulary`,!banned.test(txt),txt.match(banned)?.[0]||'clean')}
  }
  await page.click('.studio-nav button[data-panel="dishes"]');await page.waitForTimeout(180);
  const studioVehicleCount=await page.locator('#studio-dish-list > *').count();check('six vehicles in Studio',studioVehicleCount===6,String(studioVehicleCount));
  await page.click('.studio-nav button[data-panel="motion"]');await page.waitForTimeout(180);
  check('Vehicle choreography preset',await page.locator('#motion-orbital-style').inputValue()==='dealer',await page.locator('#motion-orbital-style').inputValue());
  await page.screenshot({path:'qa/dealer-05-studio.png',fullPage:false});

  await page.click('.studio-nav button[data-panel="brand"]');await page.waitForTimeout(120);
  const brandInput=page.locator('[data-path="brand.name"]');await brandInput.fill('NOVA MOTORS QA');
  await page.waitForFunction(()=>document.querySelector('#studio-status')?.textContent?.toLowerCase().includes('guardado'),null,{timeout:8000});
  check('studio autosave status',(await page.locator('#studio-status').innerText()).toLowerCase().includes('guardado'),await page.locator('#studio-status').innerText());
  await page.reload({waitUntil:'networkidle',timeout:60000});await page.waitForSelector('#orbit-stage .orbit-dish',{timeout:15000});await page.waitForTimeout(5000);
  check('persistence after reload',(await page.locator('[data-brand]').first().innerText()).includes('NOVA MOTORS QA'),await page.locator('[data-brand]').first().innerText());
  check('vehicle count after reload',await page.locator('#orbit-stage .orbit-dish').count()===6,String(await page.locator('#orbit-stage .orbit-dish').count()));
  check('choreography after reload',await page.locator('html').getAttribute('data-orbital-choreography')==='nova-vehicle-choreography-v2',await page.locator('html').getAttribute('data-orbital-choreography'));
  check('no JS errors',errors.length===0,errors.join('\n'));
  result.ok=true;
}catch(err){result.ok=false;result.failure=err.message;fs.mkdirSync('qa',{recursive:true});await page.screenshot({path:'qa/dealer-failure.png',fullPage:true}).catch(()=>{});}
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/dealer-qa.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
await browser.close();if(!result.ok)process.exit(1);
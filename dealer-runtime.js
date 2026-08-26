/* NOVA MOTORS — POLESTAR REPLICA R1
   Goal: visibly reproduce the approved reference language: continuous horizontal drag,
   neighbour perspective/yaw, depth transfer, inertia, heavy deceleration and progress-driven editorial sync.
   Donor Restaurant motion never owns .nova-car nodes. */
(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const VISUAL={
 'vehicle-01':{s:1.00,y:0},'vehicle-02':{s:.96,y:2},'vehicle-03':{s:.98,y:2},
 'vehicle-04':{s:.99,y:1},'vehicle-05':{s:.91,y:6},'vehicle-06':{s:1.02,y:-1}
};
const HOTSPOT={
 'vehicle-01':{x:.16,y:.31},'vehicle-02':{x:.17,y:.30},'vehicle-03':{x:.16,y:.30},
 'vehicle-04':{x:.15,y:.30},'vehicle-05':{x:.12,y:.28},'vehicle-06':{x:.14,y:.29}
};
let shell,stage,copy,nextBtn,prevBtn,exploreBtn;
let progress=0,tween=null,busy=false,drag=false,lastWheel=0,suppressClickUntil=0;
let dragStartX=0,dragStartProgress=0,lastX=0,lastT=0,velocity=0,phase='idle';
let relay=null;
const vehicles=()=>window.RestaurantDefaults?.dishes?.filter(d=>d.enabled!==false)||[];
const n=()=>vehicles().length;
const norm=i=>((i%n())+n())%n();
const current=()=>norm(Math.round(progress));
function distance(i,p=progress){let d=i-p,c=n();while(d>c/2)d-=c;while(d<-c/2)d+=c;return d}
function step(){return shell.clientWidth*(innerWidth<620?.72:innerWidth<900?.60:.54)}
function setPhase(v){phase=v;document.documentElement.dataset.vehicleMotionPhase=v}
function setText(sel,text){const el=$(sel);if(el)el.textContent=text??''}
function setCopy(i){const d=vehicles()[norm(i)];if(!d)return;setText('#dish-meta',d.meta);setText('#dish-title',d.name);setText('#dish-short',d.short);setText('#dish-counter',`${String(norm(i)+1).padStart(2,'0')} / ${String(n()).padStart(2,'0')}`)}
function carNode(i){return stage?.querySelector(`.nova-car[data-index="${norm(i)}"]`)||null}
function injectCss(){if(document.querySelector('link[data-nova-track-v4]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='nova-track-v4.css';l.dataset.novaTrackV4='1';document.head.appendChild(l)}

function buildStage(){
 stage?.remove();stage=document.createElement('div');stage.className='nova-track-stage';stage.tabIndex=0;stage.setAttribute('aria-label','NOVA vehicle collection');
 const base=document.createElement('div');base.className='nova-track-baseline';stage.appendChild(base);
 vehicles().forEach((v,i)=>{
  const b=document.createElement('button');b.type='button';b.className='nova-car';b.dataset.index=String(i);b.dataset.id=v.id;b.setAttribute('aria-label',v.name);
  b.innerHTML=`<img src="${v.image}" alt="${v.name}" draggable="false">`;
  b.addEventListener('click',()=>{if(performance.now()<suppressClickUntil||busy||drag)return;const d=distance(i);if(Math.abs(d)<.30)openDetail(i);else animateTo(progress+d,{source:'car'})});
  stage.appendChild(b);
 });
 shell.appendChild(stage);render();document.documentElement.dataset.dealerTrackReady='true';
}

function beginRelay(fromAbs,toAbs,source='control'){
 const dir=Math.sign(toAbs-fromAbs)||1;
 relay={fromAbs,toAbs,fromIndex:norm(Math.round(fromAbs)),toIndex:norm(Math.round(toAbs)),nextIndex:norm(Math.round(toAbs)+dir),prevIndex:norm(Math.round(fromAbs)-dir),dir,source,copySwitched:false};
 copy?.setAttribute('data-transitioning','true');prepareGlyphs(relay.fromIndex,relay.toIndex,dir);setPhase(source==='drag'?'drag':'impulse');
}
function relayT(p=progress){if(!relay)return 0;const span=relay.toAbs-relay.fromAbs;return Math.abs(span)<.0001?0:clamp((p-relay.fromAbs)/span)}

function render(p=progress){
 const st=step(),t=relay?relayT(p):0;
 $$('.nova-car',stage).forEach((el,i)=>{
  const d=distance(i,p),ad=Math.abs(d),v=VISUAL[el.dataset.id]||{s:1,y:0};
  const authority=1-clamp(ad,0,1),side=clamp(d,-1,1);
  // Reference signature: centre is flat/side-on; neighbours visibly turn in opposite yaw directions.
  let yaw=side*24;
  let rotateZ=side*-1.2;
  let z=authority*120-ad*12;
  let scale=(.885+authority*.115)*v.s;
  let opacity=ad<=1.12?mix(.70,1,authority):Math.max(0,.64*(1-clamp((ad-1.12)/.72)));
  let bright=mix(.91,1,authority),blur=mix(.16,0,authority);
  let extraX=side*26*(1-authority);
  let y=v.y+Math.abs(side)*5;
  let role=ad<.26?'hero':ad<1.20?'neighbor':'far';

  if(relay){
   const transfer=smooth(.08,.88,t),cross=Math.sin(Math.PI*clamp(t));
   if(i===relay.fromIndex){
    role='outgoing';yaw=relay.dir*-30*cross + side*18*(1-cross);z=mix(120,-30,transfer);scale*=mix(1,.90,transfer);opacity=Math.max(opacity,mix(1,.68,transfer));extraX-=relay.dir*44*cross;rotateZ+=relay.dir*1.8*cross;
   } else if(i===relay.toIndex){
    role='incoming';yaw=relay.dir*30*(1-transfer) + side*10*transfer;z=mix(-25,128,transfer);scale*=mix(.88,1,transfer);opacity=Math.max(opacity,mix(.66,1,transfer));extraX+=relay.dir*52*(1-transfer);rotateZ-=relay.dir*1.6*(1-transfer);
   } else if(i===relay.nextIndex){
    const reveal=smooth(.24,.96,t);role='next-up';yaw=relay.dir*24;z=-35+reveal*30;scale*=mix(.82,.89,reveal);opacity=Math.max(opacity,.68*reveal);extraX+=relay.dir*36*(1-reveal);
   } else if(i===relay.prevIndex){
    const leave=smooth(.05,.62,t);opacity*=1-.28*leave;z-=30*leave;
   }
  }
  if(ad>=1.94&&(!relay||i!==relay.nextIndex))opacity=0;
  const x=d*st+extraX;
  const zIndex=role==='hero'||role==='incoming'?22:role==='outgoing'?19:role==='neighbor'||role==='next-up'?12:5;
  el.dataset.authority=role;el.dataset.yaw=String(yaw.toFixed(2));
  const props={xPercent:-50,yPercent:-50,x,y,z,rotationY:yaw,rotationZ:rotateZ,transformPerspective:1050,transformOrigin:'50% 78%',scale,opacity,filter:`blur(${blur}px) brightness(${bright})`,zIndex};
  if(window.gsap)gsap.set(el,props);else{el.style.transform=`translate(-50%,-50%) perspective(1050px) translate3d(${x}px,${y}px,${z}px) rotateY(${yaw}deg) rotateZ(${rotateZ}deg) scale(${scale})`;el.style.opacity=opacity;el.style.filter=props.filter}
 });
 syncEditorial(t);
}

function ensureEditorial(){
 const section=$('#signature');if(!section)return;
 if(!$('.dealer-ghost-index',section)){const g=document.createElement('div');g.className='dealer-ghost-index';g.setAttribute('aria-hidden','true');g.innerHTML='<span class="dealer-ghost-current">01</span><span class="dealer-ghost-next">02</span>';section.appendChild(g)}
 if(!$('.dealer-hotspot',section)){const h=document.createElement('div');h.className='dealer-hotspot';h.setAttribute('aria-hidden','true');h.innerHTML='<span>DRAG</span>';section.appendChild(h)}
 if(!$('.dealer-progress',section)){const p=document.createElement('div');p.className='dealer-progress';p.setAttribute('aria-label','Vehicle position');section.appendChild(p)}
 const nav=$('.dealer-progress');nav.innerHTML='';vehicles().forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.dataset.index=String(i);b.setAttribute('aria-label',`Vehicle ${i+1}`);b.onclick=()=>jump(i);nav.appendChild(b)});
 setCopy(current());setBars(current(),current(),1);prepareGlyphs(current(),norm(current()+1),1);positionHotspot(current(),1);
}
function prepareGlyphs(from,to,dir){const a=$('.dealer-ghost-current'),b=$('.dealer-ghost-next');if(a)a.textContent=String(norm(from)+1).padStart(2,'0');if(b)b.textContent=String(norm(to)+1).padStart(2,'0');if(window.gsap){gsap.set(a,{x:0,opacity:1,scale:1});gsap.set(b,{x:dir*70,opacity:0,scale:1.08})}}
function setBars(from,to,t){$$('.dealer-progress button').forEach((b,i)=>{let s=0;if(i===from)s=1-t;if(i===to)s=Math.max(s,t);b.style.setProperty('--vehicle-progress',String(s));b.setAttribute('aria-current',String(t>=.5?i===to:i===from))})}
function syncEditorial(t=0){
 if(!relay){positionHotspot(current(),1);return}
 const from=relay.fromIndex,to=relay.toIndex,dir=relay.dir;
 const bars=smooth(.08,.96,t),glyph=smooth(.24,.90,t),takeover=smooth(.46,.74,t);setBars(from,to,bars);
 const a=$('.dealer-ghost-current'),b=$('.dealer-ghost-next');if(window.gsap){if(a)gsap.set(a,{x:-dir*80*glyph,opacity:1-glyph,scale:1+.07*glyph});if(b)gsap.set(b,{x:dir*70*(1-glyph),opacity:glyph,scale:1.08-.08*glyph})}
 if(copy){
  const out=smooth(.34,.56,t),inn=smooth(.64,.90,t);
  if(t<.60&&relay.copySwitched){setCopy(from);relay.copySwitched=false}
  if(t>=.60&&!relay.copySwitched){setCopy(to);relay.copySwitched=true}
  const op=t<.60?1-out:inn,y=t<.60?out*24:(1-inn)*28;
  if(window.gsap)gsap.set(copy,{opacity:op,y});else{copy.style.opacity=op;copy.style.transform=`translateY(${y}px)`}
 }
 const owner=takeover>.5?to:from;positionHotspot(owner,.78+Math.abs(takeover-.5)*.44);
}
function positionHotspot(i,opacity=1){const hot=$('.dealer-hotspot'),car=carNode(i),section=$('#signature');if(!hot||!car||!section)return;const a=HOTSPOT[vehicles()[norm(i)]?.id]||{x:.15,y:.3},sr=section.getBoundingClientRect(),cr=car.getBoundingClientRect();hot.style.left=`${cr.left-sr.left+cr.width*(.5+a.x)}px`;hot.style.top=`${cr.top-sr.top+cr.height*a.y}px`;hot.style.opacity=String(opacity)}

function complete(target){progress=target;relay=null;busy=false;copy?.removeAttribute('data-transitioning');setPhase('idle');setCopy(current());setBars(current(),current(),1);prepareGlyphs(current(),norm(current()+1),1);render(progress)}
function animateTo(target,{source='control',releaseSpeed=0}={}){
 tween?.kill?.();const start=progress,delta=target-start;if(Math.abs(delta)<.002){complete(target);return}
 busy=true;beginRelay(start,target,source);if(reduced||!window.gsap){complete(target);return}
 const dir=Math.sign(delta)||1,speed=Math.abs(releaseSpeed),dist=Math.abs(delta);
 // Heavy automotive deceleration: fast initial travel, long ease-out, tiny lock correction.
 const duration=clamp(.96-dist*.12-speed*55,.62,1.02),overshoot=target+dir*Math.min(.014,.004+speed*2.8),state={p:start};
 tween=gsap.timeline({onUpdate(){progress=state.p;const t=relayT(progress);setPhase(t<.16?'impulse':t<.58?'perspective-cross':t<.88?'deceleration':'lock');render(progress)},onComplete(){complete(target)}})
   .to(state,{p:overshoot,duration,ease:source.startsWith('drag')?'expo.out':'power3.inOut'},0)
   .to(state,{p:target,duration:.18,ease:'power4.out'},duration);
}
function transition(dir,source='control'){if(busy||drag)return;animateTo(Math.round(progress)+Math.sign(dir||1),{source})}
function jump(i){if(busy||drag)return;let d=i-current();while(d>n()/2)d-=n();while(d<-n()/2)d+=n();if(d)animateTo(Math.round(progress)+d,{source:'progress'})}

function beginDrag(e){if(busy)return;tween?.kill?.();drag=true;dragStartX=e.clientX;dragStartProgress=progress;lastX=e.clientX;lastT=performance.now();velocity=0;stage.setPointerCapture?.(e.pointerId);setPhase('drag');e.stopImmediatePropagation()}
function moveDrag(e){if(!drag)return;const now=performance.now(),dt=Math.max(8,now-lastT),dx=e.clientX-dragStartX,vx=(e.clientX-lastX)/dt;velocity=velocity*.64+(-vx/step())*.36;progress=dragStartProgress-dx/step();const dir=Math.sign(progress-dragStartProgress)||1,origin=Math.round(dragStartProgress),target=origin+dir;if(!relay||relay.source!=='drag'||relay.toAbs!==target)beginRelay(origin,target,'drag');render(progress);lastX=e.clientX;lastT=now;e.stopImmediatePropagation()}
function endDrag(e){if(!drag)return;drag=false;e.stopImmediatePropagation();const origin=Math.round(dragStartProgress),displacement=progress-dragStartProgress,projected=progress+velocity*190;let target=Math.round(projected);target=Math.max(origin-1,Math.min(origin+1,target));if(Math.abs(displacement)<.14&&Math.abs(velocity)<.0014)target=origin;suppressClickUntil=performance.now()+850;if(target===origin){animateTo(origin,{source:'drag-return',releaseSpeed:velocity});return}animateTo(target,{source:'drag-release',releaseSpeed:velocity})}

function fillDetail(i){const d=vehicles()[norm(i)];if(!d)return;[['detail-meta','meta'],['detail-title','name'],['detail-price','price'],['detail-description','short'],['detail-ingredients','ingredients'],['detail-origin','origin'],['detail-technique','technique'],['detail-pairing','pairing']].forEach(([id,k])=>{const e=$('#'+id);if(e)e.textContent=d[k]||''});setText('#detail-note',`“${d.note||''}”`);setText('#detail-allergens',`Availability · ${d.allergens||''}`);const visual=$('#detail-visual');if(visual)visual.innerHTML=`<img class="nova-detail-image" src="${d.image}" alt="${d.name}">`}
function openDetail(i=current()){const detail=$('#dish-detail');if(!detail||busy)return;fillDetail(i);detail.classList.add('is-open');detail.setAttribute('aria-hidden','false');document.body.classList.add('detail-open');document.documentElement.dataset.dishDetail='open';if(window.gsap)gsap.fromTo(detail,{opacity:0},{opacity:1,duration:.3});$('#detail-close')?.focus()}
function closeDetail(){const detail=$('#dish-detail');if(!detail)return;const done=()=>{detail.classList.remove('is-open');detail.setAttribute('aria-hidden','true');document.body.classList.remove('detail-open');delete document.documentElement.dataset.dishDetail};window.gsap?gsap.to(detail,{opacity:0,duration:.22,onComplete:done}):done()}
function bind(){
 nextBtn=$('#next-dish');prevBtn=$('#prev-dish');exploreBtn=$('#explore-dish');copy=$('.dish-copy');
 if(nextBtn)nextBtn.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();transition(1,'button')};if(prevBtn)prevBtn.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();transition(-1,'button')};if(exploreBtn)exploreBtn.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();openDetail()};const close=$('#detail-close');if(close)close.onclick=e=>{e.preventDefault();closeDetail()};
 shell.addEventListener('wheel',e=>{e.preventDefault();e.stopImmediatePropagation();const now=performance.now();if(now-lastWheel<780)return;lastWheel=now;transition((Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)>=0?1:-1,'wheel')},{capture:true,passive:false});
 shell.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopImmediatePropagation();transition(e.key==='ArrowRight'?1:-1,'keyboard')}if(e.key==='Enter'){e.preventDefault();openDetail()}},{capture:true});
 stage.addEventListener('pointerdown',beginDrag,{capture:true});stage.addEventListener('pointermove',moveDrag,{capture:true});stage.addEventListener('pointerup',endDrag,{capture:true});stage.addEventListener('pointercancel',endDrag,{capture:true});addEventListener('resize',()=>render(progress));
}
function boot(){document.documentElement.dataset.dealerMode='true';document.documentElement.dataset.orbitalMotion='polestar-r1';document.documentElement.dataset.orbitalChoreography='polestar-perspective-relay-r1';injectCss();shell=$('.orbit-shell');if(!shell||!window.gsap||!n()){setTimeout(boot,120);return}buildStage();ensureEditorial();bind();render();setPhase('idle');window.NovaVehicleMotion={next:()=>transition(1,'api'),prev:()=>transition(-1,'api'),transition,currentIndex:current,isBusy:()=>busy,phase:()=>phase,progress:()=>progress,render:()=>render(progress),openDetail:()=>openDetail()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,420));else setTimeout(boot,420);
})();
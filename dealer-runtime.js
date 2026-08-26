/* NOVA MOTORS — Vehicle Track V4.
   A completely isolated visual motor: the donor orbit remains only as hidden infrastructure for Store/Studio. */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const VISUAL={
    'vehicle-01':{scale:1,y:0},'vehicle-02':{scale:.96,y:2},'vehicle-03':{scale:.98,y:2},
    'vehicle-04':{scale:.99,y:1},'vehicle-05':{scale:.91,y:6},'vehicle-06':{scale:1.02,y:-1}
  };
  const HOTSPOT={
    'vehicle-01':{x:.16,y:.31},'vehicle-02':{x:.17,y:.30},'vehicle-03':{x:.16,y:.30},
    'vehicle-04':{x:.15,y:.30},'vehicle-05':{x:.12,y:.28},'vehicle-06':{x:.14,y:.29}
  };
  let shell,stage,copy,nextBtn,prevBtn,exploreBtn,progress=0,busy=false,timeline=null;
  let drag=false,dragX=0,dragProgress=0,lastWheel=0,suppressClickUntil=0;
  let fromIndex=0,toIndex=0,phase='idle';

  const vehicles=()=>window.RestaurantDefaults?.dishes?.filter(d=>d.enabled!==false)||[];
  const n=()=>vehicles().length;
  const norm=i=>((i%n())+n())%n();
  const current=()=>norm(Math.round(progress));
  function distance(i,p=progress){let d=i-p;const c=n();while(d>c/2)d-=c;while(d<-c/2)d+=c;return d}
  function injectCss(){if(document.querySelector('link[data-nova-track-v4]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='nova-track-v4.css';l.dataset.novaTrackV4='1';document.head.appendChild(l)}
  function setText(sel,text){const el=$(sel);if(el)el.textContent=text??''}
  function setCopy(i){const d=vehicles()[norm(i)];if(!d)return;setText('#dish-meta',d.meta);setText('#dish-title',d.name);setText('#dish-short',d.short);setText('#dish-counter',`${String(norm(i)+1).padStart(2,'0')} / ${String(n()).padStart(2,'0')}`)}
  function carNode(i){return stage?.querySelector(`.nova-car[data-index="${norm(i)}"]`)||null}
  function trackStep(){return shell.clientWidth*(innerWidth<620?.72:innerWidth<900?.58:.51)}

  function buildStage(){
    stage?.remove();stage=document.createElement('div');stage.className='nova-track-stage';stage.tabIndex=0;stage.setAttribute('aria-label','NOVA vehicle collection');
    const base=document.createElement('div');base.className='nova-track-baseline';stage.appendChild(base);
    vehicles().forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.className='nova-car';b.dataset.index=String(i);b.dataset.id=v.id;b.setAttribute('aria-label',v.name);b.innerHTML=`<img src="${v.image}" alt="${v.name}" draggable="false">`;b.addEventListener('click',()=>{if(performance.now()<suppressClickUntil||busy)return;const d=distance(i);if(Math.abs(d)<.35)openDetail(i);else transition(Math.sign(d),'car')});stage.appendChild(b)});
    shell.appendChild(stage);render(progress);document.documentElement.dataset.dealerTrackReady='true';
  }

  function render(p=progress,transfer=1){
    const step=trackStep();
    $$('.nova-car',stage).forEach((el,i)=>{
      const d=distance(i,p),ad=Math.abs(d),x=d*step,id=el.dataset.id,v=VISUAL[id]||{scale:1,y:0};
      let authority=Math.max(0,1-Math.min(ad,1));
      let scale=(.90+authority*.10)*v.scale,opacity=.70+authority*.30,blur=(1-authority)*.12,bright=.91+authority*.09;
      if(ad>1){const fall=Math.min(1,ad-1);opacity=.70*(1-fall);scale*=1-fall*.05;blur=.12+fall*.28}
      if(ad>=1.68)opacity=0;
      if(busy&&i===fromIndex){scale-=transfer*.012;bright-=transfer*.035}
      if(busy&&i===toIndex){scale+=transfer*.008;bright+=transfer*.012}
      const authorityName=ad<.34?'hero':ad<1.25?'neighbor':'far';el.dataset.authority=authorityName;
      const props={xPercent:-50,yPercent:-50,x,y:v.y,scale,rotation:0,opacity,filter:`blur(${blur}px) brightness(${bright})`,zIndex:authorityName==='hero'?20:authorityName==='neighbor'?12:5};
      if(window.gsap)gsap.set(el,props);else{el.style.transform=`translate(-50%,-50%) translate(${x}px,${v.y}px) scale(${scale})`;el.style.opacity=opacity;el.style.filter=props.filter}
    });
    positionHotspot(current(),busy?.45:1);
  }

  function ensureEditorial(){
    const section=$('#signature');if(!section)return;
    if(!$('.dealer-ghost-index',section)){const g=document.createElement('div');g.className='dealer-ghost-index';g.setAttribute('aria-hidden','true');g.innerHTML='<span class="dealer-ghost-current">01</span><span class="dealer-ghost-next">02</span>';section.appendChild(g)}
    if(!$('.dealer-hotspot',section)){const h=document.createElement('div');h.className='dealer-hotspot';h.setAttribute('aria-hidden','true');h.innerHTML='<span>VIEW DETAILS</span>';section.appendChild(h)}
    if(!$('.dealer-progress',section)){const p=document.createElement('div');p.className='dealer-progress';p.setAttribute('aria-label','Vehicle position');section.appendChild(p)}
    const nav=$('.dealer-progress');nav.innerHTML='';vehicles().forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.dataset.index=String(i);b.setAttribute('aria-label',`Vehicle ${i+1}`);b.onclick=()=>jump(i);nav.appendChild(b)});updateEditorial(current(),true)
  }
  function setProgress(from,to,t=1){$$('.dealer-progress button').forEach((b,i)=>{let s=0;if(i===from)s=1-t;if(i===to)s=Math.max(s,t);b.style.setProperty('--vehicle-progress',String(s));b.setAttribute('aria-current',String(t>=.5?i===to:i===from))})}
  function updateEditorial(i,immediate=false){const idx=norm(i),nx=norm(idx+1),gc=$('.dealer-ghost-current'),gn=$('.dealer-ghost-next');if(gc)gc.textContent=String(idx+1).padStart(2,'0');if(gn)gn.textContent=String(nx+1).padStart(2,'0');if(immediate&&window.gsap){gsap.set(gc,{x:0,opacity:1,scale:1});gsap.set(gn,{x:44,opacity:0,scale:1.04})}setProgress(idx,idx,1);setCopy(idx);positionHotspot(idx,1)}
  function positionHotspot(i,opacity=1){const hot=$('.dealer-hotspot'),car=carNode(i),section=$('#signature');if(!hot||!car||!section)return;const a=HOTSPOT[vehicles()[norm(i)]?.id]||{x:.15,y:.3},sr=section.getBoundingClientRect(),cr=car.getBoundingClientRect();hot.style.left=`${cr.left-sr.left+cr.width*(.5+a.x)}px`;hot.style.top=`${cr.top-sr.top+cr.height*a.y}px`;hot.style.opacity=String(opacity)}

  function transition(dir,source='control'){
    if(busy||n()<2)return;busy=true;fromIndex=current();toIndex=norm(fromIndex+dir);phase='anticipation';document.documentElement.dataset.vehicleMotionPhase=phase;copy?.setAttribute('data-transitioning','true');timeline?.kill?.();
    const target=Math.round(progress)+dir;
    if(reduced||!window.gsap){progress=target;render(progress,1);updateEditorial(toIndex,true);finish();return}
    const state={p:progress,transfer:0,editorial:0},anticipate=progress+dir*.03,overshoot=target+dir*.055,gc=$('.dealer-ghost-current'),gn=$('.dealer-ghost-next');
    gsap.set(gn,{x:dir*52,opacity:0,scale:1.04});gsap.set(gc,{x:0,opacity:1,scale:1});
    timeline=gsap.timeline({onUpdate(){progress=state.p;render(progress,state.transfer);setProgress(fromIndex,toIndex,state.editorial)},onComplete(){progress=target;render(progress,1);setCopy(toIndex);updateEditorial(toIndex,true);finish()}})
      .to(state,{p:anticipate,transfer:.05,duration:.09,ease:'power2.in',onStart(){phase='anticipation';document.documentElement.dataset.vehicleMotionPhase=phase}},0)
      .to(state,{p:target-dir*.10,transfer:.72,duration:.48,ease:'power3.inOut',onStart(){phase='travel';document.documentElement.dataset.vehicleMotionPhase=phase}},.09)
      .to(copy,{opacity:0,y:8,duration:.12,ease:'power2.in'},.42)
      .to(state,{p:overshoot,transfer:1,duration:.20,ease:'power4.out',onStart(){phase='brake';document.documentElement.dataset.vehicleMotionPhase=phase}},.57)
      .call(()=>setCopy(toIndex),[],.70)
      .to(state,{p:overshoot,duration:.13,ease:'none',onStart(){phase='overshoot';document.documentElement.dataset.vehicleMotionPhase=phase}},.77)
      .to(state,{p:target,duration:.19,ease:'power3.out',onStart(){phase='settle';document.documentElement.dataset.vehicleMotionPhase=phase}},.90)
      .to(gc,{x:-dir*40,opacity:0,scale:1.03,duration:.22,ease:'power2.in'},.63)
      .to(gn,{x:0,opacity:1,scale:1,duration:.30,ease:'power3.out'},.72)
      .to(state,{editorial:1,duration:.24,ease:'power2.out'},.72)
      .to(copy,{opacity:1,y:0,duration:.26,ease:'power3.out'},.78);
  }
  function finish(){phase='hold';document.documentElement.dataset.vehicleMotionPhase='hold';setTimeout(()=>{busy=false;phase='idle';document.documentElement.dataset.vehicleMotionPhase='idle';copy?.removeAttribute('data-transitioning');render(progress,1)},80)}
  function jump(i){if(busy)return;let d=i-current();while(d>n()/2)d-=n();while(d<-n()/2)d+=n();if(d)transition(Math.sign(d),'progress')}

  function fillDetail(i){const d=vehicles()[norm(i)];if(!d)return;[['detail-meta','meta'],['detail-title','name'],['detail-price','price'],['detail-description','short'],['detail-ingredients','ingredients'],['detail-origin','origin'],['detail-technique','technique'],['detail-pairing','pairing']].forEach(([id,k])=>{const e=$('#'+id);if(e)e.textContent=d[k]||''});setText('#detail-note',`“${d.note||''}”`);setText('#detail-allergens',`Availability · ${d.allergens||''}`);const visual=$('#detail-visual');if(visual){visual.innerHTML=`<img class="nova-detail-image" src="${d.image}" alt="${d.name}">`}}
  function openDetail(i=current()){const detail=$('#dish-detail');if(!detail||busy)return;fillDetail(i);detail.classList.add('is-open');detail.setAttribute('aria-hidden','false');document.body.classList.add('detail-open');document.documentElement.dataset.dishDetail='open';if(window.gsap)gsap.fromTo(detail,{opacity:0},{opacity:1,duration:.3});$('#detail-close')?.focus()}
  function closeDetail(){const detail=$('#dish-detail');if(!detail)return;const done=()=>{detail.classList.remove('is-open');detail.setAttribute('aria-hidden','true');document.body.classList.remove('detail-open');delete document.documentElement.dataset.dishDetail};window.gsap?gsap.to(detail,{opacity:0,duration:.25,onComplete:done}):done()}

  function bind(){
    nextBtn=$('#next-dish');prevBtn=$('#prev-dish');exploreBtn=$('#explore-dish');copy=$('.dish-copy');
    if(nextBtn)nextBtn.onclick=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();transition(1,'button')};
    if(prevBtn)prevBtn.onclick=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();transition(-1,'button')};
    if(exploreBtn)exploreBtn.onclick=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();openDetail(current())};
    const close=$('#detail-close');if(close)close.onclick=e=>{e?.preventDefault?.();closeDetail()};
    shell.addEventListener('wheel',e=>{e.preventDefault();e.stopImmediatePropagation();const now=performance.now();if(now-lastWheel<850)return;lastWheel=now;transition((Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)>=0?1:-1,'wheel')},{capture:true,passive:false});
    shell.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopImmediatePropagation();transition(e.key==='ArrowRight'?1:-1,'keyboard')}if(e.key==='Enter'){e.preventDefault();openDetail(current())}},{capture:true});
    stage.addEventListener('pointerdown',e=>{if(busy)return;drag=true;dragX=e.clientX;dragProgress=progress;stage.setPointerCapture?.(e.pointerId);e.stopImmediatePropagation()},{capture:true});
    stage.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-dragX;progress=dragProgress-dx/trackStep();render(progress,Math.min(1,Math.abs(dx)/trackStep()));e.stopImmediatePropagation()},{capture:true});
    const end=e=>{if(!drag)return;drag=false;const dx=e.clientX-dragX;progress=dragProgress;render(progress,1);e.stopImmediatePropagation();if(Math.abs(dx)>42){suppressClickUntil=performance.now()+1000;transition(dx<0?1:-1,'drag')}};stage.addEventListener('pointerup',end,{capture:true});stage.addEventListener('pointercancel',end,{capture:true});
    addEventListener('resize',()=>render(progress,1));
  }

  function boot(){
    document.documentElement.dataset.dealerMode='true';document.documentElement.dataset.orbitalMotion='dealer-v4';document.documentElement.dataset.orbitalChoreography='nova-vehicle-track-v4';injectCss();
    shell=$('.orbit-shell');if(!shell||!window.gsap||!n()){setTimeout(boot,120);return}
    buildStage();ensureEditorial();setCopy(0);bind();render(0,1);document.documentElement.dataset.vehicleMotionPhase='idle';
    window.NovaVehicleMotion={next:()=>transition(1,'api'),prev:()=>transition(-1,'api'),transition,currentIndex:current,isBusy:()=>busy,phase:()=>phase,render:()=>render(progress,1),openDetail:()=>openDetail(current())};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,420));else setTimeout(boot,420);
})();
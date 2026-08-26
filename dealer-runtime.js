/* NOVA MOTORS — Choreography V5: Three-Car Relay + Inertia.
   Visible cars live in an isolated NOVA stage. Donor Restaurant motion never owns .nova-car nodes.
   Source of truth: docs/concesionarios/NOVA-V5-THREE-CAR-RELAY-MOTION-SPEC.md */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  const VISUAL={
    'vehicle-01':{scale:1.00,y:0,x:0},'vehicle-02':{scale:.96,y:2,x:0},'vehicle-03':{scale:.98,y:2,x:0},
    'vehicle-04':{scale:.99,y:1,x:0},'vehicle-05':{scale:.91,y:6,x:0},'vehicle-06':{scale:1.02,y:-1,x:0}
  };
  const HOTSPOT={
    'vehicle-01':{x:.16,y:.31},'vehicle-02':{x:.17,y:.30},'vehicle-03':{x:.16,y:.30},
    'vehicle-04':{x:.15,y:.30},'vehicle-05':{x:.12,y:.28},'vehicle-06':{x:.14,y:.29}
  };

  let shell,stage,copy,nextBtn,prevBtn,exploreBtn;
  let progress=0,busy=false,tween=null,lastWheel=0,suppressClickUntil=0;
  let drag=false,dragStartX=0,dragStartProgress=0,lastPointerX=0,lastPointerT=0,releaseVelocity=0;
  let relay=null,phase='idle';

  const vehicles=()=>window.RestaurantDefaults?.dishes?.filter(d=>d.enabled!==false)||[];
  const n=()=>vehicles().length;
  const norm=i=>((i%n())+n())%n();
  const current=()=>norm(Math.round(progress));
  function distance(i,p=progress){let d=i-p;const c=n();while(d>c/2)d-=c;while(d<-c/2)d+=c;return d}
  function trackStep(){return shell.clientWidth*(innerWidth<620?.72:innerWidth<900?.58:.51)}
  function setPhase(v){phase=v;document.documentElement.dataset.vehicleMotionPhase=v}
  function injectCss(){if(document.querySelector('link[data-nova-track-v4]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='nova-track-v4.css';l.dataset.novaTrackV4='1';document.head.appendChild(l)}
  function setText(sel,text){const el=$(sel);if(el)el.textContent=text??''}
  function setCopy(i){const d=vehicles()[norm(i)];if(!d)return;setText('#dish-meta',d.meta);setText('#dish-title',d.name);setText('#dish-short',d.short);setText('#dish-counter',`${String(norm(i)+1).padStart(2,'0')} / ${String(n()).padStart(2,'0')}`)}
  function carNode(i){return stage?.querySelector(`.nova-car[data-index="${norm(i)}"]`)||null}

  function buildStage(){
    stage?.remove();
    stage=document.createElement('div');stage.className='nova-track-stage';stage.tabIndex=0;stage.setAttribute('aria-label','NOVA vehicle collection');
    const base=document.createElement('div');base.className='nova-track-baseline';stage.appendChild(base);
    vehicles().forEach((v,i)=>{
      const b=document.createElement('button');b.type='button';b.className='nova-car';b.dataset.index=String(i);b.dataset.id=v.id;b.setAttribute('aria-label',v.name);
      b.innerHTML=`<img src="${v.image}" alt="${v.name}" draggable="false">`;
      b.addEventListener('click',()=>{if(performance.now()<suppressClickUntil||busy||drag)return;const d=distance(i);if(Math.abs(d)<.34)openDetail(i);else animateTo(progress+d,{source:'car',dir:Math.sign(d)})});
      stage.appendChild(b);
    });
    shell.appendChild(stage);render();document.documentElement.dataset.dealerTrackReady='true';
  }

  function beginRelay(fromAbs,toAbs,source='control'){
    const dir=Math.sign(toAbs-fromAbs)||1;
    relay={fromAbs,toAbs,fromIndex:norm(Math.round(fromAbs)),toIndex:norm(Math.round(toAbs)),nextIndex:norm(Math.round(toAbs)+dir),dir,source,copySwitched:false};
    copy?.setAttribute('data-transitioning','true');
    setPhase(source==='drag'?'drag':'travel');
    prepareGlyphs(relay.fromIndex,relay.toIndex,dir);
  }
  function relayProgress(p=progress){
    if(!relay)return 0;
    const span=relay.toAbs-relay.fromAbs;if(Math.abs(span)<.0001)return 0;
    return clamp((p-relay.fromAbs)/span);
  }
  function activeRoles(t){
    if(!relay)return null;
    return {outgoing:relay.fromIndex,incoming:relay.toIndex,nextUp:relay.nextIndex,t,dir:relay.dir};
  }

  function render(p=progress){
    const step=trackStep(),t=relay?relayProgress(p):0,roles=activeRoles(t),transfer=smooth(.12,.88,t),nextReveal=smooth(.28,.96,t);
    $$('.nova-car',stage).forEach((el,i)=>{
      const d=distance(i,p),ad=Math.abs(d),id=el.dataset.id,v=VISUAL[id]||{scale:1,y:0,x:0};
      const near=1-clamp(ad,0,1);
      let scale=(.91+near*.09)*v.scale;
      let opacity=ad<=1?mix(.76,1,near):Math.max(0,.76*(1-clamp(ad-1,0,1)));
      let bright=mix(.92,1,near),blur=ad<=1?mix(.08,0,near):mix(.10,.28,clamp(ad-1));
      let role=ad<.34?'hero':ad<1.24?'neighbor':'far';

      if(roles){
        if(i===roles.outgoing){
          role='outgoing';scale*=mix(1,.925,transfer);opacity=Math.max(opacity,mix(1,.76,transfer));bright=mix(1,.93,transfer);
        }else if(i===roles.incoming){
          role='incoming';scale*=mix(.94,1,transfer);opacity=Math.max(opacity,mix(.76,1,transfer));bright=mix(.93,1,transfer);
        }else if(i===roles.nextUp){
          role='next-up';opacity=Math.max(opacity,.74*nextReveal);scale*=mix(.94,.97,nextReveal);bright=Math.max(bright,.93);
        }
      }
      if(ad>=1.92&&(!roles||i!==roles.nextUp))opacity=0;
      const x=d*step+(v.x||0);
      const z=role==='hero'||role==='incoming'?20:role==='outgoing'?17:role==='neighbor'||role==='next-up'?12:5;
      el.dataset.authority=role;
      const props={xPercent:-50,yPercent:-50,x,y:v.y,scale,rotation:0,opacity,filter:`blur(${blur}px) brightness(${bright})`,zIndex:z};
      if(window.gsap)gsap.set(el,props);else{el.style.transform=`translate(-50%,-50%) translate(${x}px,${v.y}px) scale(${scale})`;el.style.opacity=opacity;el.style.filter=props.filter}
    });
    syncEditorial(t);
  }

  function ensureEditorial(){
    const section=$('#signature');if(!section)return;
    if(!$('.dealer-ghost-index',section)){const g=document.createElement('div');g.className='dealer-ghost-index';g.setAttribute('aria-hidden','true');g.innerHTML='<span class="dealer-ghost-current">01</span><span class="dealer-ghost-next">02</span>';section.appendChild(g)}
    if(!$('.dealer-hotspot',section)){const h=document.createElement('div');h.className='dealer-hotspot';h.setAttribute('aria-hidden','true');h.innerHTML='<span>VIEW DETAILS</span>';section.appendChild(h)}
    if(!$('.dealer-progress',section)){const p=document.createElement('div');p.className='dealer-progress';p.setAttribute('aria-label','Vehicle position');section.appendChild(p)}
    const nav=$('.dealer-progress');nav.innerHTML='';vehicles().forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.dataset.index=String(i);b.setAttribute('aria-label',`Vehicle ${i+1}`);b.onclick=()=>jump(i);nav.appendChild(b)});
    setCopy(current());setBars(current(),current(),1);prepareGlyphs(current(),norm(current()+1),1);positionHotspot(current(),1);
  }
  function prepareGlyphs(from,to,dir){
    const gc=$('.dealer-ghost-current'),gn=$('.dealer-ghost-next');
    if(gc)gc.textContent=String(norm(from)+1).padStart(2,'0');if(gn)gn.textContent=String(norm(to)+1).padStart(2,'0');
    if(window.gsap){gsap.set(gc,{x:0,opacity:1,scale:1});gsap.set(gn,{x:dir*46,opacity:0,scale:1.035})}
  }
  function setBars(from,to,t){$$('.dealer-progress button').forEach((b,i)=>{let s=0;if(i===from)s=1-t;if(i===to)s=Math.max(s,t);b.style.setProperty('--vehicle-progress',String(s));b.setAttribute('aria-current',String(t>=.5?i===to:i===from))})}
  function syncEditorial(t=0){
    if(!relay){positionHotspot(current(),1);return}
    const from=relay.fromIndex,to=relay.toIndex,dir=relay.dir;
    const takeover=smooth(.48,.78,t),glyph=smooth(.38,.96,t),bars=smooth(.12,.98,t);
    setBars(from,to,bars);
    const gc=$('.dealer-ghost-current'),gn=$('.dealer-ghost-next');
    if(window.gsap){if(gc)gsap.set(gc,{x:-dir*34*glyph,opacity:1-glyph,scale:1+.025*glyph});if(gn)gsap.set(gn,{x:dir*46*(1-glyph),opacity:glyph,scale:1.035-.035*glyph})}

    if(copy){
      const fadeOut=smooth(.42,.62,t),fadeIn=smooth(.66,.94,t);
      if(t<.61&&relay.copySwitched){setCopy(from);relay.copySwitched=false}
      if(t>=.61&&!relay.copySwitched){setCopy(to);relay.copySwitched=true}
      const opacity=t<.61?1-fadeOut:fadeIn;
      const y=t<.61?fadeOut*14:(1-fadeIn)*20;
      if(window.gsap)gsap.set(copy,{opacity,y});else{copy.style.opacity=String(opacity);copy.style.transform=`translateY(${y}px)`}
    }

    const hotOwner=takeover>=.5?to:from;
    positionHotspot(hotOwner,mix(.72,1,Math.abs(takeover-.5)*2));
  }
  function positionHotspot(i,opacity=1){const hot=$('.dealer-hotspot'),car=carNode(i),section=$('#signature');if(!hot||!car||!section)return;const a=HOTSPOT[vehicles()[norm(i)]?.id]||{x:.15,y:.3},sr=section.getBoundingClientRect(),cr=car.getBoundingClientRect();hot.style.left=`${cr.left-sr.left+cr.width*(.5+a.x)}px`;hot.style.top=`${cr.top-sr.top+cr.height*a.y}px`;hot.style.opacity=String(opacity)}

  function completeRelay(target){
    progress=target;render(progress);
    const idx=current();setCopy(idx);setBars(idx,idx,1);prepareGlyphs(idx,norm(idx+1),1);positionHotspot(idx,1);
    relay=null;busy=false;copy?.removeAttribute('data-transitioning');setPhase('idle');render(progress);
  }

  function animateTo(target,{source='control',velocity=0,dir=Math.sign(target-progress)||1}={}){
    if(n()<2)return;
    tween?.kill?.();
    const start=progress,delta=target-start;
    if(Math.abs(delta)<.002){completeRelay(target);return}
    busy=true;beginRelay(start,target,source);
    if(reduced||!window.gsap){completeRelay(target);return}

    const speed=Math.abs(velocity);
    const distanceAbs=Math.abs(delta);
    const duration=clamp(.92-distanceAbs*.10-speed*70,.56,1.02);
    const micro=dir*Math.min(.018,.006+speed*4.2);
    const overshootTarget=target+micro;
    const state={p:start};
    tween=gsap.timeline({onUpdate(){progress=state.p;const t=relayProgress(progress);setPhase(t<.18?'impulse':t<.72?'relay':'deceleration');render(progress)},onComplete(){completeRelay(target)}})
      .to(state,{p:overshootTarget,duration:duration,ease:source.startsWith('drag')?'power3.out':'power2.inOut'},0)
      .to(state,{p:target,duration:.16,ease:'power3.out',onStart(){setPhase('snap')}},duration);
  }

  function transition(dir,source='control'){if(busy||drag)return;const start=Math.round(progress),target=start+Math.sign(dir||1);animateTo(target,{source,dir:Math.sign(dir||1)})}
  function jump(i){if(busy||drag)return;let d=i-current();while(d>n()/2)d-=n();while(d<-n()/2)d+=n();if(!d)return;const target=Math.round(progress)+d;animateTo(target,{source:'progress',dir:Math.sign(d)})}

  function beginDrag(e){
    if(busy)return;tween?.kill?.();drag=true;busy=false;dragStartX=e.clientX;dragStartProgress=progress;lastPointerX=e.clientX;lastPointerT=performance.now();releaseVelocity=0;stage.setPointerCapture?.(e.pointerId);setPhase('drag');e.stopImmediatePropagation();
  }
  function moveDrag(e){
    if(!drag)return;const now=performance.now(),dt=Math.max(8,now-lastPointerT),dx=e.clientX-dragStartX,step=trackStep();
    const vx=(e.clientX-lastPointerX)/dt;releaseVelocity=releaseVelocity*.68+(-vx/step)*.32;
    progress=dragStartProgress-dx/step;
    const dir=Math.sign(progress-dragStartProgress)||1;
    const fromAbs=Math.round(dragStartProgress),toAbs=fromAbs+dir;
    if(!relay||relay.source!=='drag'||relay.toAbs!==toAbs)beginRelay(fromAbs,toAbs,'drag');
    render(progress);lastPointerX=e.clientX;lastPointerT=now;e.stopImmediatePropagation();
  }
  function endDrag(e){
    if(!drag)return;drag=false;e.stopImmediatePropagation();
    const displacement=progress-dragStartProgress,projected=progress+releaseVelocity*165;
    let target=Math.round(projected);
    const origin=Math.round(dragStartProgress);
    target=Math.max(origin-1,Math.min(origin+1,target));
    if(Math.abs(displacement)<.16&&Math.abs(releaseVelocity)<.0016)target=origin;
    suppressClickUntil=performance.now()+900;
    if(target===origin&&Math.abs(progress-origin)<.01){relay=null;busy=false;setCopy(norm(origin));setBars(norm(origin),norm(origin),1);setPhase('idle');render(origin);progress=origin;return}
    animateTo(target,{source:'drag-release',velocity:releaseVelocity,dir:Math.sign(target-progress)||Math.sign(displacement)||1});
  }

  function fillDetail(i){const d=vehicles()[norm(i)];if(!d)return;[['detail-meta','meta'],['detail-title','name'],['detail-price','price'],['detail-description','short'],['detail-ingredients','ingredients'],['detail-origin','origin'],['detail-technique','technique'],['detail-pairing','pairing']].forEach(([id,k])=>{const e=$('#'+id);if(e)e.textContent=d[k]||''});setText('#detail-note',`“${d.note||''}”`);setText('#detail-allergens',`Availability · ${d.allergens||''}`);const visual=$('#detail-visual');if(visual)visual.innerHTML=`<img class="nova-detail-image" src="${d.image}" alt="${d.name}">`}
  function openDetail(i=current()){const detail=$('#dish-detail');if(!detail||busy||drag)return;fillDetail(i);detail.classList.add('is-open');detail.setAttribute('aria-hidden','false');document.body.classList.add('detail-open');document.documentElement.dataset.dishDetail='open';if(window.gsap)gsap.fromTo(detail,{opacity:0},{opacity:1,duration:.3});$('#detail-close')?.focus()}
  function closeDetail(){const detail=$('#dish-detail');if(!detail)return;const done=()=>{detail.classList.remove('is-open');detail.setAttribute('aria-hidden','true');document.body.classList.remove('detail-open');delete document.documentElement.dataset.dishDetail};window.gsap?gsap.to(detail,{opacity:0,duration:.25,onComplete:done}):done()}

  function bind(){
    nextBtn=$('#next-dish');prevBtn=$('#prev-dish');exploreBtn=$('#explore-dish');copy=$('.dish-copy');
    if(nextBtn)nextBtn.onclick=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();transition(1,'button')};
    if(prevBtn)prevBtn.onclick=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();transition(-1,'button')};
    if(exploreBtn)exploreBtn.onclick=e=>{e?.preventDefault?.();e?.stopImmediatePropagation?.();openDetail(current())};
    const close=$('#detail-close');if(close)close.onclick=e=>{e?.preventDefault?.();closeDetail()};
    shell.addEventListener('wheel',e=>{e.preventDefault();e.stopImmediatePropagation();const now=performance.now();if(now-lastWheel<760)return;lastWheel=now;const axis=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;transition(axis>=0?1:-1,'wheel')},{capture:true,passive:false});
    shell.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopImmediatePropagation();transition(e.key==='ArrowRight'?1:-1,'keyboard')}if(e.key==='Enter'){e.preventDefault();openDetail(current())}},{capture:true});
    stage.addEventListener('pointerdown',beginDrag,{capture:true});
    stage.addEventListener('pointermove',moveDrag,{capture:true});
    stage.addEventListener('pointerup',endDrag,{capture:true});
    stage.addEventListener('pointercancel',endDrag,{capture:true});
    addEventListener('resize',()=>render(progress));
  }

  function boot(){
    document.documentElement.dataset.dealerMode='true';document.documentElement.dataset.orbitalMotion='dealer-v5';document.documentElement.dataset.orbitalChoreography='nova-three-car-relay-v5';injectCss();
    shell=$('.orbit-shell');if(!shell||!window.gsap||!n()){setTimeout(boot,120);return}
    buildStage();ensureEditorial();bind();progress=0;relay=null;render();setPhase('idle');
    window.NovaVehicleMotion={next:()=>transition(1,'api'),prev:()=>transition(-1,'api'),transition,currentIndex:current,isBusy:()=>busy,phase:()=>phase,render:()=>render(progress),openDetail:()=>openDetail(current()),progress:()=>progress};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,420));else setTimeout(boot,420);
})();
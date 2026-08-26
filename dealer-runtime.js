/* NOVA MOTORS — Vehicle Choreography V2.
   Public motion language: TRACK · MASS · TRANSFER · BRAKE · LOCK · EDITORIAL SYNC.
   The donor remains owner of Store/Studio/detail state; this module owns every visible showcase transform. */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CHOREO={anticipation:.09,travel:.50,brake:.16,settle:.15,editorial:.20,total:1.10};
  const HOTSPOT={
    'vehicle-01':{x:.16,y:.30},'vehicle-02':{x:.18,y:.28},'vehicle-03':{x:.18,y:.29},
    'vehicle-04':{x:.15,y:.28},'vehicle-05':{x:.12,y:.25},'vehicle-06':{x:.12,y:.27}
  };
  let shell,stage,nextBtn,prevBtn,copy,nativeNext,nativePrev,progress=0,busy=false;
  let drag=false,dragX=0,dragProgress=0,lastWheel=0,raf=0,suppressClickUntil=0,rebuildRaf=0,timeline=null;
  let fromIndex=0,toIndex=0,direction=1,phase='idle';

  const expectedCount=()=>window.RestaurantDefaults?.dishes?.filter(d=>d.enabled!==false).length||0;
  const count=()=>stage?$$(':scope > .orbit-dish',stage).length:0;
  const detailOpen=()=>$('#dish-detail')?.getAttribute('aria-hidden')==='false';
  const vehicleData=()=>window.RestaurantDefaults?.dishes?.filter(d=>d.enabled!==false)||[];
  function normalized(i,n=count()||expectedCount()){return n?((i%n)+n)%n:0}
  function circularDistance(i,p){const n=count();let d=i-p;while(d>n/2)d-=n;while(d<-n/2)d+=n;return d}
  function currentIndex(){return normalized(Math.round(progress))}
  function vehicleNode(index){return stage?.querySelector(`.orbit-dish[data-id="${vehicleData()[normalized(index)]?.id}"]`)||null}

  function setText(selector,text){const el=$(selector);if(el&&el.textContent!==text)el.textContent=text}
  function setLabelText(selector,text){const el=$(selector);if(!el)return;let node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(!node){node=document.createTextNode('');el.insertBefore(node,el.firstChild||null)}if(node.nodeValue!==text)node.nodeValue=text}
  function relabel(){
    document.documentElement.dataset.dealerMode='true';
    document.documentElement.dataset.orbitalMotion='dealer';
    [
      ['.desktop-nav a[href="#signature"]','Models'],['.desktop-nav a[href="#story"]','Why NOVA'],['.desktop-nav a[href="#experience"]','Experience'],['.desktop-nav a[href="#visit"]','Showroom'],
      ['button.studio-open','Dealer Studio'],['.reserve-open.pill','Book a test drive'],['.studio-titleline small','NOVA MOTORS · DEALER STUDIO'],
      ['.studio-nav button[data-panel="dishes"]','Vehicles'],
      ['[data-panel="brand"] .panel-intro h3','NOVA identity'],['[data-panel="brand"] .panel-intro p:nth-of-type(2)','Edit the dealership name, palette and logo used across the customer experience.'],
      ['[data-panel="dishes"] .panel-intro .eyebrow','04 · Vehicle collection'],['[data-panel="dishes"] .panel-intro h3','Vehicle manager'],['[data-panel="dishes"] .panel-intro p:nth-of-type(2)','Add, duplicate, hide and reorder vehicles. Each record controls the collection and its full vehicle detail.'],
      ['.dish-editor-title h4','Vehicle record'],['[data-panel="visit"] .panel-intro .eyebrow','05 · Showroom & conversion'],['[data-panel="visit"] .panel-intro h3','Test drives, showroom and contact'],['[data-panel="project"] .panel-intro h3','Project, history and persistence']
    ].forEach(([sel,text])=>setText(sel,text));
    setLabelText('.dish-editor-title .inline-check','Visible in collection ');
    setLabelText('label.upload-btn:has(#dish-media)','Replace vehicle image ');
    const labelMap=['Model','Price','Version / range','Short description','Key specifications','Vehicle type','Performance','Best suited to','Availability / notes','Advisor recommendation'];
    $$('.dish-editor .control-grid label').forEach((el,i)=>{if(labelMap[i])setLabelText(`.dish-editor .control-grid label:nth-child(${i+1})`,`${labelMap[i]} `)});
    const detailLabels=$$('.detail-columns h4');['Specifications','Vehicle type','Performance','Best suited to'].forEach((t,i)=>{if(detailLabels[i])detailLabels[i].textContent=t});
    const note=$('.detail-note span');if(note)note.textContent='NOVA recommendation';
    const reserve=$('.detail-reserve');if(reserve)reserve.textContent='Book a test drive →';
    const modalKicker=$('#reserve-dialog .kicker');if(modalKicker)modalKicker.textContent='Test drive request';
    const modalTitle=$('#reserve-dialog h2');if(modalTitle)modalTitle.innerHTML='Meet the car.<br>Then decide.';
    const form=$('#reserve-form');if(form){
      setLabelText('#reserve-form label:nth-of-type(1)','Name ');setLabelText('#reserve-form label:nth-of-type(2)','Email ');setLabelText('#reserve-form label:nth-of-type(3)','Preferred date ');
      const guestLabel=$('#reserve-form select[name="guests"]')?.closest('label');if(guestLabel){let node=[...guestLabel.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(node)node.nodeValue='Preferred time ';const sel=$('select',guestLabel);if(sel&&sel.dataset.dealerOptions!=='1'){sel.dataset.dealerOptions='1';sel.innerHTML='<option>Morning</option><option>Midday</option><option>Afternoon</option><option>Evening</option>'}}
      setLabelText('#reserve-form label.full','Notes ');const submit=$('#reserve-form button[type="submit"]');if(submit)submit.textContent='Request test drive';
      const small=$('#reserve-form small');if(small)small.textContent='Your request would be sent to the NOVA Motors sales team in a production deployment.';
    }
    const success=$('#reserve-success');if(success){const h=success.querySelector('h3'),p=success.querySelector('p');if(h)h.textContent='Test drive request prepared.';if(p)p.textContent='A NOVA Motors advisor would confirm the vehicle, date and preferred time.'}
  }

  function decorate(){
    const section=$('#signature');if(!section)return;
    if(!$('.dealer-ghost-index',section)){const ghost=document.createElement('div');ghost.className='dealer-ghost-index';ghost.setAttribute('aria-hidden','true');ghost.innerHTML='<span class="dealer-ghost-current">01</span><span class="dealer-ghost-next">02</span>';section.appendChild(ghost)}
    if(!$('.dealer-hotspot',section)){const hot=document.createElement('div');hot.className='dealer-hotspot';hot.setAttribute('aria-hidden','true');hot.innerHTML='<span>VIEW DETAILS</span>';section.appendChild(hot)}
    if(!$('.dealer-progress',section)){const nav=document.createElement('div');nav.className='dealer-progress';nav.setAttribute('aria-label','Vehicle position');section.appendChild(nav)}
    buildProgress();updateEditorial(currentIndex(),true);
  }

  function buildProgress(){const nav=$('.dealer-progress');if(!nav)return;const n=expectedCount()||count();nav.innerHTML='';for(let i=0;i<n;i++){const b=document.createElement('button');b.type='button';b.dataset.index=String(i);b.setAttribute('aria-label',`Vehicle ${i+1}`);b.onclick=()=>jump(i);nav.appendChild(b)}}
  function setProgressVisual(from,to,t=1){$$('.dealer-progress button').forEach((b,i)=>{const a=i===from,bn=i===to;let strength=0;if(a)strength=1-t;if(bn)strength=Math.max(strength,t);b.style.setProperty('--vehicle-progress',String(strength));b.setAttribute('aria-current',String(t>=.5?bn:a))})}
  function setCopy(index){const d=vehicleData()[normalized(index)];if(!d)return;setText('#dish-meta',d.meta||'');setText('#dish-title',d.name||'');setText('#dish-short',d.short||'');setText('#dish-counter',`${String(normalized(index)+1).padStart(2,'0')} / ${String(vehicleData().length).padStart(2,'0')}`)}
  function updateEditorial(index,immediate=false){
    const n=expectedCount()||count(),idx=normalized(index,n),next=normalized(idx+1,n);
    const gc=$('.dealer-ghost-current'),gn=$('.dealer-ghost-next');if(gc)gc.textContent=String(idx+1).padStart(2,'0');if(gn)gn.textContent=String(next+1).padStart(2,'0');
    if(immediate&&window.gsap){gsap.set(gc,{x:0,opacity:1,scale:1});gsap.set(gn,{x:42,opacity:0,scale:1.04})}
    setProgressVisual(idx,idx,1);setCopy(idx);positionHotspot(idx,1);
  }
  function positionHotspot(index,visibility=1){
    const hot=$('.dealer-hotspot'),el=vehicleNode(index),section=$('#signature');if(!hot||!el||!section||!shell)return;
    const id=vehicleData()[normalized(index)]?.id,anchor=HOTSPOT[id]||{x:.15,y:.28};
    const sr=section.getBoundingClientRect(),er=el.getBoundingClientRect();
    hot.style.left=`${er.left-sr.left+er.width*(.5+anchor.x)}px`;hot.style.top=`${er.top-sr.top+er.height*anchor.y}px`;hot.style.opacity=String(visibility);
  }

  function renderTrack(p=progress,opts={}){
    if(!shell||!stage)return;const n=count();if(!n)return;
    const w=shell.clientWidth,step=w*(innerWidth<620?.82:innerWidth<900?.75:.68);
    const transfer=opts.transfer??1,vel=opts.velocity??0;
    $$(':scope > .orbit-dish',stage).forEach((el,i)=>{
      const d=circularDistance(i,p),ad=Math.abs(d),x=d*step;
      const proximity=Math.max(0,1-Math.min(ad,1));
      const activeGain=Math.pow(proximity,1.55);
      let scale=.86+activeGain*.15,opacity=ad>1.28?.10:.52+activeGain*.48,blur=ad>1.15?2.2:(1-activeGain)*.65,bright=.80+activeGain*.20;
      if(i===fromIndex&&busy){scale-=transfer*.025;bright-=transfer*.08}
      if(i===toIndex&&busy){scale+=transfer*.018;bright+=transfer*.025}
      const lean=busy?Math.max(-1,Math.min(1,vel))*-.55:0;
      const z=Math.round(20+activeGain*100-ad*10);
      if(window.gsap)gsap.set(el,{xPercent:-50,yPercent:-50,x,y:0,scale,rotation:lean,opacity,filter:`blur(${Math.max(0,blur)}px) brightness(${Math.max(.6,bright)})`,zIndex:z});
      else{el.style.transform=`translate(-50%,-50%) translateX(${x}px) scale(${scale})`;el.style.opacity=opacity;el.style.filter=`blur(${blur}px) brightness(${bright})`;el.style.zIndex=z}
    });
  }

  function killTimeline(){timeline?.kill?.();timeline=null;cancelAnimationFrame(raf)}
  function nativeStep(dir){const fn=dir>0?nativeNext:nativePrev;if(typeof fn==='function')fn.call(dir>0?nextBtn:prevBtn)}
  function transition(dir,source='control'){
    if(busy||detailOpen()||count()<2)return;
    busy=true;direction=dir;fromIndex=currentIndex();toIndex=normalized(fromIndex+dir);phase='anticipation';
    document.documentElement.dataset.vehicleMotionPhase=phase;copy?.setAttribute('data-transitioning','true');
    killTimeline();
    if(reduced||!window.gsap){nativeStep(dir);progress=Math.round(progress)+dir;renderTrack(progress);setCopy(toIndex);updateEditorial(toIndex,true);finish();return}

    const state={p:progress,velocity:0,transfer:0,copy:0,editorial:0};
    const target=Math.round(progress)+dir,anticipate=progress+dir*.035,overshoot=target+dir*.045;
    const gc=$('.dealer-ghost-current'),gn=$('.dealer-ghost-next'),hot=$('.dealer-hotspot');
    if(gc)gc.textContent=String(fromIndex+1).padStart(2,'0');if(gn)gn.textContent=String(toIndex+1).padStart(2,'0');
    gsap.set(gn,{x:dir*54,opacity:0,scale:1.04});gsap.set(gc,{x:0,opacity:1,scale:1});
    timeline=gsap.timeline({defaults:{overwrite:true},onUpdate(){
      progress=state.p;renderTrack(progress,{transfer:state.transfer,velocity:state.velocity});
      setProgressVisual(fromIndex,toIndex,state.editorial);
      const hotIndex=state.transfer<.56?fromIndex:toIndex;positionHotspot(hotIndex,Math.max(.08,Math.abs(state.transfer-.5)*2));
    },onComplete(){progress=target;renderTrack(progress,{transfer:1,velocity:0});setCopy(toIndex);updateEditorial(toIndex,true);finish()}});

    timeline
      .to(state,{p:anticipate,velocity:dir*.18,transfer:.05,duration:CHOREO.anticipation,ease:'power2.in',onStart(){phase='anticipation';document.documentElement.dataset.vehicleMotionPhase=phase}},0)
      .to(state,{p:target-dir*.12,velocity:dir,transfer:.70,duration:CHOREO.travel,ease:'power3.inOut',onStart(){phase='travel';document.documentElement.dataset.vehicleMotionPhase=phase}},CHOREO.anticipation)
      .call(()=>{nativeStep(dir);phase='transfer';document.documentElement.dataset.vehicleMotionPhase=phase},[],CHOREO.anticipation+CHOREO.travel*.58)
      .to(copy,{opacity:0,y:8,duration:.13,ease:'power2.in'},CHOREO.anticipation+CHOREO.travel*.60)
      .call(()=>setCopy(toIndex),[],CHOREO.anticipation+CHOREO.travel*.78)
      .to(state,{p:overshoot,velocity:dir*.30,transfer:1,duration:CHOREO.brake,ease:'power4.out',onStart(){phase='brake';document.documentElement.dataset.vehicleMotionPhase=phase}},CHOREO.anticipation+CHOREO.travel)
      .to(state,{p:target,velocity:0,transfer:1,duration:CHOREO.settle,ease:'back.out(1.25)',onStart(){phase='settle';document.documentElement.dataset.vehicleMotionPhase=phase}},CHOREO.anticipation+CHOREO.travel+CHOREO.brake)
      .to(gc,{x:-dir*42,opacity:0,scale:1.035,duration:.22,ease:'power2.in'},CHOREO.anticipation+CHOREO.travel*.66)
      .to(gn,{x:0,opacity:1,scale:1,duration:.34,ease:'power3.out'},CHOREO.anticipation+CHOREO.travel*.78)
      .to(state,{editorial:1,duration:CHOREO.editorial,ease:'power2.out',onStart(){phase='editorial';document.documentElement.dataset.vehicleMotionPhase=phase}},CHOREO.anticipation+CHOREO.travel*.72)
      .to(copy,{opacity:1,y:0,duration:.28,ease:'power3.out'},CHOREO.anticipation+CHOREO.travel+CHOREO.brake*.55)
      .to(hot,{scale:1.08,duration:.12,ease:'power2.out',yoyo:true,repeat:1},CHOREO.anticipation+CHOREO.travel+CHOREO.brake+CHOREO.settle*.40);
  }

  function finish(){phase='hold';document.documentElement.dataset.vehicleMotionPhase='hold';setTimeout(()=>{busy=false;phase='idle';document.documentElement.dataset.vehicleMotionPhase='idle';copy?.removeAttribute('data-transitioning');positionHotspot(currentIndex(),1);enforce(500)},reduced?0:90)}
  function enforce(duration=1000){if(detailOpen())return;const start=performance.now();cancelAnimationFrame(raf);const loop=()=>{if(detailOpen())return;renderTrack(progress,{transfer:1,velocity:0});positionHotspot(currentIndex(),1);if(performance.now()-start<duration)raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}
  function jump(index){if(busy||detailOpen())return;const n=expectedCount()||count();let d=index-currentIndex();while(d>n/2)d-=n;while(d<-n/2)d+=n;if(!d)return;transition(Math.sign(d),'progress')}

  function bindInteractions(){
    nextBtn=$('#next-dish');prevBtn=$('#prev-dish');copy=$('.dish-copy');nativeNext=nextBtn?.onclick;nativePrev=prevBtn?.onclick;
    if(nextBtn)nextBtn.onclick=e=>{e?.preventDefault?.();transition(1,'button')};if(prevBtn)prevBtn.onclick=e=>{e?.preventDefault?.();transition(-1,'button')};
    shell.addEventListener('wheel',e=>{if(detailOpen())return;e.preventDefault();e.stopImmediatePropagation();const now=performance.now();if(now-lastWheel<900)return;lastWheel=now;transition((Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)>=0?1:-1,'wheel')},{capture:true,passive:false});
    shell.addEventListener('keydown',e=>{if(detailOpen())return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopImmediatePropagation();transition(e.key==='ArrowRight'?1:-1,'keyboard')}},{capture:true});
    stage.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},{capture:true});
    shell.addEventListener('pointerdown',e=>{if(busy||detailOpen())return;drag=true;dragX=e.clientX;dragProgress=progress;shell.setPointerCapture?.(e.pointerId);e.stopImmediatePropagation()},{capture:true});
    shell.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-dragX,denom=shell.clientWidth*(innerWidth<620?.82:.68);progress=dragProgress-dx/denom;renderTrack(progress,{transfer:Math.min(1,Math.abs(dx)/denom),velocity:-Math.sign(dx)*.35});positionHotspot(currentIndex(),.25);e.stopImmediatePropagation()},{capture:true});
    const end=e=>{if(!drag)return;drag=false;const dx=e.clientX-dragX;progress=dragProgress;renderTrack(progress);e.stopImmediatePropagation();if(Math.abs(dx)>42){suppressClickUntil=performance.now()+1100;transition(dx<0?1:-1,'drag')}else enforce(240)};
    shell.addEventListener('pointerup',end,{capture:true});shell.addEventListener('pointercancel',end,{capture:true});
    addEventListener('resize',()=>{if(!detailOpen()){renderTrack();positionHotspot(currentIndex(),1)}});
  }

  function stableRebuild(){rebuildRaf=0;if(detailOpen()||count()!==expectedCount())return;progress=currentIndex();renderTrack();buildProgress();updateEditorial(currentIndex(),true);relabel()}
  function watchRebuilds(){new MutationObserver(()=>{if(rebuildRaf)cancelAnimationFrame(rebuildRaf);rebuildRaf=requestAnimationFrame(stableRebuild)}).observe(stage,{childList:true});const detail=$('#dish-detail');if(detail)new MutationObserver(()=>{if(!detailOpen())setTimeout(stableRebuild,80)}).observe(detail,{attributes:true,attributeFilter:['aria-hidden','class']})}
  function boot(){
    relabel();shell=$('.orbit-shell');stage=$('#orbit-stage');
    if(!shell||!stage||!window.gsap){setTimeout(boot,120);return}
    if(!$$(':scope > .orbit-dish',stage).length||typeof $('#next-dish')?.onclick!=='function'){setTimeout(boot,120);return}
    decorate();bindInteractions();fromIndex=currentIndex();toIndex=fromIndex;renderTrack();positionHotspot(fromIndex,1);watchRebuilds();
    document.documentElement.dataset.orbitalMotion='dealer';
    document.documentElement.dataset.orbitalChoreography='nova-vehicle-choreography-v2';
    window.NovaVehicleMotion={transition,next:()=>transition(1,'api'),prev:()=>transition(-1,'api'),currentIndex:()=>currentIndex(),isBusy:()=>busy,phase:()=>phase,render:()=>renderTrack(progress)};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,360));else setTimeout(boot,360);
})();
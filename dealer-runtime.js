/* NOVA MOTORS — Vehicle Showcase choreography layered over the donor runtime.
   Contract inherited from the Restaurant classes: lower-layer DOM/Flip/Studio remains owner;
   this layer decorates and orchestrates without destroying controls or reacting to transient detail moves. */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let shell,stage,nextBtn,prevBtn,copy,counter,nativeNext,nativePrev,progress=0,busy=false,drag=false,dragX=0,dragProgress=0,lastWheel=0,raf=0,suppressClickUntil=0,rebuildRaf=0;

  function setText(selector,text){const el=$(selector);if(el&&el.textContent!==text)el.textContent=text}
  function setLabelText(selector,text){
    const el=$(selector);if(!el)return;
    let node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
    if(!node){node=document.createTextNode('');el.insertBefore(node,el.firstChild||null)}
    if(node.nodeValue!==text)node.nodeValue=text;
  }
  function relabel(){
    document.documentElement.dataset.dealerMode='true';
    document.documentElement.dataset.orbitalMotion='dealer';
    [
      ['.desktop-nav a[href="#signature"]','Models'],['.desktop-nav a[href="#story"]','Philosophy'],['.desktop-nav a[href="#experience"]','Experience'],['.desktop-nav a[href="#visit"]','Visit'],
      ['button.studio-open','Dealer Studio'],['.reserve-open.pill','Book a drive'],['.studio-titleline small','PREMIUM DEALER STUDIO · VEHICLE EXPERIENCE'],
      ['.studio-nav button[data-panel="dishes"]','Vehicles'],
      ['[data-panel="brand"] .panel-intro h3','Dealership identity'],['[data-panel="brand"] .panel-intro p:nth-of-type(2)','Edit dealer name, palette and logo while preserving the premium visual system.'],
      ['[data-panel="dishes"] .panel-intro .eyebrow','04 · Vehicle Showcase'],['[data-panel="dishes"] .panel-intro h3','Vehicle manager'],['[data-panel="dishes"] .panel-intro p:nth-of-type(2)','Add, duplicate, hide and reorder vehicles. Each record feeds the showcase and the immersive vehicle detail.'],
      ['.dish-editor-title h4','Vehicle record'],
      ['[data-panel="visit"] .panel-intro .eyebrow','05 · Visit & conversion'],['[data-panel="visit"] .panel-intro h3','Test drive, showroom and contact'],
      ['[data-panel="project"] .panel-intro h3','Persistence and project QA']
    ].forEach(([sel,text])=>setText(sel,text));
    setLabelText('.dish-editor-title .inline-check','Visible in showcase ');
    setLabelText('label.upload-btn:has(#dish-media)','Replace vehicle image ');
    const labels=$$('.dish-editor .control-grid label');
    const labelMap=['Model','Price','Version / range','Short description','Specs / equipment','Segment / design','Performance','Best for','Notes','Advisor note'];
    labels.forEach((el,i)=>{if(labelMap[i])setLabelText(`.dish-editor .control-grid label:nth-child(${i+1})`,`${labelMap[i]} `)});
    const detailLabels=$$('.detail-columns h4');['Specs','Design','Performance','Best for'].forEach((t,i)=>{if(detailLabels[i])detailLabels[i].textContent=t});
    const note=$('.detail-note span');if(note)note.textContent="Advisor's note";
    const reserve=$('.detail-reserve');if(reserve)reserve.textContent='Book a test drive →';
    const modalKicker=$('#reserve-dialog .kicker');if(modalKicker)modalKicker.textContent='Test drive';
    const modalTitle=$('#reserve-dialog h2');if(modalTitle)modalTitle.innerHTML='Your road,<br>your decision.';
    const guestLabel=$('#reserve-form select[name="guests"]')?.closest('label');if(guestLabel){setLabelText('#reserve-form select[name="guests"]','Preferred time ');const sel=$('select',guestLabel);if(sel&&sel.dataset.dealerOptions!=='1'){sel.dataset.dealerOptions='1';sel.innerHTML='<option>Morning</option><option>Midday</option><option>Afternoon</option><option>Evening</option>'}}
    const small=$('#reserve-form small');if(small)small.textContent='Demo: in production this request connects to the dealership CRM / booking engine.';
  }

  function decorate(){
    const section=$('#signature');if(!section)return;
    if(!$('.dealer-ghost-index',section)){const ghost=document.createElement('div');ghost.className='dealer-ghost-index';ghost.setAttribute('aria-hidden','true');ghost.textContent='01';section.appendChild(ghost)}
    if(!$('.dealer-hotspot',section)){const hot=document.createElement('div');hot.className='dealer-hotspot';hot.setAttribute('aria-hidden','true');hot.innerHTML='<span>Explore vehicle</span>';section.appendChild(hot)}
    if(!$('.dealer-progress',section)){const nav=document.createElement('div');nav.className='dealer-progress';nav.setAttribute('aria-label','Vehicle position');section.appendChild(nav)}
    updateDecor();
  }

  const expectedCount=()=>window.RestaurantDefaults?.dishes?.filter(d=>d.enabled!==false).length||0;
  const count=()=>stage?$$(':scope > .orbit-dish',stage).length:0;
  const detailOpen=()=>$('#dish-detail')?.getAttribute('aria-hidden')==='false';
  function circularDistance(i,p){const n=count();let d=i-p;while(d>n/2)d-=n;while(d<-n/2)d+=n;return d}
  function renderTrack(p=progress){
    if(!shell||!stage)return;const n=count();if(!n)return;const w=shell.clientWidth,step=w*(innerWidth<620?.77:innerWidth<900?.72:.66);
    $$(':scope > .orbit-dish',stage).forEach((el,i)=>{
      const d=circularDistance(i,p),ad=Math.abs(d),x=d*step;
      const near=Math.max(0,1-Math.min(ad,1));
      const scale=.72+near*.34,opacity=ad>1.25?.12:.48+near*.52,blur=ad>1.1?2.4:1.2*(1-near),bright=.72+near*.30,z=Math.round(30-near*-70-ad*10);
      if(window.gsap)gsap.set(el,{xPercent:-50,yPercent:-50,x,y:0,scale,rotation:0,opacity,filter:`blur(${blur}px) brightness(${bright})`,zIndex:z});
      else{el.style.transform=`translate(-50%,-50%) translateX(${x}px) scale(${scale})`;el.style.opacity=opacity;el.style.filter=`blur(${blur}px) brightness(${bright})`;el.style.zIndex=z}
    });
  }
  function currentIndex(){const n=count()||expectedCount();return n?((Math.round(progress)%n)+n)%n:0}
  function updateDecor(){
    const n=expectedCount()||count()||3,idx=((currentIndex()%n)+n)%n;const ghost=$('.dealer-ghost-index');if(ghost)ghost.textContent=String(idx+1).padStart(2,'0');
    const nav=$('.dealer-progress');if(nav){nav.innerHTML='';for(let i=0;i<n;i++){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Vehicle ${i+1}`);b.setAttribute('aria-current',String(i===idx));b.onclick=()=>jump(i);nav.appendChild(b)}}
    const hot=$('.dealer-hotspot');if(hot){hot.style.opacity=busy?'.15':'1';hot.style.transform=busy?'translateX(12px) scale(.92)':'translateX(0) scale(1)'}
  }
  function enforce(duration=900){if(detailOpen())return;const start=performance.now();cancelAnimationFrame(raf);const loop=()=>{if(detailOpen())return;renderTrack(progress);if(performance.now()-start<duration)raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}
  function nativeStep(direction){const fn=direction>0?nativeNext:nativePrev;if(typeof fn==='function')fn.call(direction>0?nextBtn:prevBtn)}
  function step(direction,source='control'){
    if(busy||detailOpen()||count()<2)return;busy=true;copy?.setAttribute('data-transitioning','true');updateDecor();
    const from=progress,to=Math.round(progress)+direction;
    nativeStep(direction);
    if(reduced||!window.gsap){progress=to;renderTrack();finish();return}
    const state={v:from};gsap.to(state,{v:to,duration:.82,ease:'power4.inOut',overwrite:true,onUpdate(){progress=state.v;renderTrack();},onComplete(){progress=to;renderTrack();finish()}});
  }
  function finish(){setTimeout(()=>{busy=false;copy?.removeAttribute('data-transitioning');updateDecor();enforce(180)},reduced?0:90)}
  function jump(index){if(busy||detailOpen())return;const n=expectedCount()||count();let d=index-currentIndex();while(d>n/2)d-=n;while(d<-n/2)d+=n;if(!d)return;step(Math.sign(d),'progress')}

  function bindInteractions(){
    nextBtn=$('#next-dish');prevBtn=$('#prev-dish');copy=$('.dish-copy');counter=$('#dish-counter');
    nativeNext=nextBtn?.onclick;nativePrev=prevBtn?.onclick;
    if(nextBtn)nextBtn.onclick=e=>{e?.preventDefault?.();step(1,'button')};if(prevBtn)prevBtn.onclick=e=>{e?.preventDefault?.();step(-1,'button')};
    shell.addEventListener('wheel',e=>{if(detailOpen())return;e.preventDefault();e.stopImmediatePropagation();const now=performance.now();if(now-lastWheel<680)return;lastWheel=now;step((Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)>=0?1:-1,'wheel')},{capture:true,passive:false});
    shell.addEventListener('keydown',e=>{if(detailOpen())return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopImmediatePropagation();step(e.key==='ArrowRight'?1:-1,'keyboard')}},{capture:true});
    stage.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},{capture:true});
    shell.addEventListener('pointerdown',e=>{if(busy||detailOpen())return;drag=true;dragX=e.clientX;dragProgress=progress;shell.setPointerCapture?.(e.pointerId);e.stopImmediatePropagation()},{capture:true});
    shell.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-dragX,denom=shell.clientWidth*(innerWidth<620?.77:.66);progress=dragProgress-dx/denom;renderTrack();e.stopImmediatePropagation()},{capture:true});
    const end=e=>{if(!drag)return;drag=false;const dx=e.clientX-dragX;progress=dragProgress;renderTrack();e.stopImmediatePropagation();if(Math.abs(dx)>42){suppressClickUntil=performance.now()+900;step(dx<0?1:-1,'drag')}else enforce(180)};
    shell.addEventListener('pointerup',end,{capture:true});shell.addEventListener('pointercancel',end,{capture:true});
    addEventListener('resize',()=>{if(!detailOpen()){renderTrack();updateDecor()}});
  }

  function stableRebuild(){
    rebuildRaf=0;
    /* Donor detail uses GSAP Flip by moving the active .orbit-dish out of the stage.
       That transient move is NOT a rebuild and must remain exclusively owned by app-v4. */
    if(detailOpen()||count()!==expectedCount())return;
    progress=currentIndex();renderTrack();updateDecor();relabel();
  }
  function watchRebuilds(){
    new MutationObserver(()=>{if(rebuildRaf)cancelAnimationFrame(rebuildRaf);rebuildRaf=requestAnimationFrame(stableRebuild)}).observe(stage,{childList:true});
    const detail=$('#dish-detail');if(detail)new MutationObserver(()=>{if(!detailOpen())setTimeout(stableRebuild,80)}).observe(detail,{attributes:true,attributeFilter:['aria-hidden','class']});
  }
  function boot(){
    relabel();shell=$('.orbit-shell');stage=$('#orbit-stage');
    if(!shell||!stage||!window.gsap){setTimeout(boot,120);return}
    if(!$$(':scope > .orbit-dish',stage).length||typeof $('#next-dish')?.onclick!=='function'){setTimeout(boot,120);return}
    decorate();bindInteractions();renderTrack();watchRebuilds();
    document.documentElement.dataset.orbitalMotion='dealer';document.documentElement.dataset.orbitalChoreography='vehicle-track-reference-v1';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,320));else setTimeout(boot,320);
})();
/* NOVA MOTORS — Vehicle Track Choreography V3.
   One owner. One physical horizontal track. Three readable cars at rest.
   Restaurant keeps Store/Studio; NOVA exclusively owns showcase motion + showcase detail interaction. */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CHOREO={anticipation:.09,travel:.46,brake:.20,overshootHold:.13,settle:.19,editorial:.22};
  const HOTSPOT={
    'vehicle-01':{x:.16,y:.31},'vehicle-02':{x:.17,y:.30},'vehicle-03':{x:.16,y:.30},
    'vehicle-04':{x:.15,y:.30},'vehicle-05':{x:.12,y:.28},'vehicle-06':{x:.14,y:.29}
  };
  const VISUAL={
    'vehicle-01':{scale:1.00,y:0},'vehicle-02':{scale:.96,y:3},'vehicle-03':{scale:.98,y:2},
    'vehicle-04':{scale:.99,y:1},'vehicle-05':{scale:.92,y:5},'vehicle-06':{scale:1.02,y:-1}
  };
  let shell,stage,nextBtn,prevBtn,copy,progress=0,busy=false,timeline=null,raf=0;
  let drag=false,dragX=0,dragProgress=0,lastWheel=0,suppressClickUntil=0,rebuildRaf=0;
  let fromIndex=0,toIndex=0,phase='idle',dealerDetailSource=null;

  const vehicleData=()=>window.RestaurantDefaults?.dishes?.filter(d=>d.enabled!==false)||[];
  const expectedCount=()=>vehicleData().length;
  const count=()=>stage?$$(':scope > .orbit-dish',stage).length:0;
  const detailOpen=()=>$('#dish-detail')?.getAttribute('aria-hidden')==='false';
  function normalized(i,n=count()||expectedCount()){return n?((i%n)+n)%n:0}
  function circularDistance(i,p){const n=count();let d=i-p;while(d>n/2)d-=n;while(d<-n/2)d+=n;return d}
  function currentIndex(){return normalized(Math.round(progress))}
  function vehicleNode(index){const d=vehicleData()[normalized(index)];return d?stage?.querySelector(`.orbit-dish[data-id="${d.id}"]`):null}
  function indexForNode(node){const id=node?.dataset?.id;return vehicleData().findIndex(d=>d.id===id)}
  function setText(s,t){const e=$(s);if(e&&e.textContent!==t)e.textContent=t}
  function setLabelText(s,t){const e=$(s);if(!e)return;let n=[...e.childNodes].find(x=>x.nodeType===Node.TEXT_NODE);if(!n){n=document.createTextNode('');e.insertBefore(n,e.firstChild||null)}if(n.nodeValue!==t)n.nodeValue=t}

  function relabel(){
    const root=document.documentElement;root.dataset.dealerMode='true';root.dataset.orbitalMotion='dealer';
    document.title='NOVA MOTORS — Premium electric vehicles';
    [
      ['.desktop-nav a[href="#signature"]','Models'],['.desktop-nav a[href="#story"]','Why NOVA'],['.desktop-nav a[href="#experience"]','Experience'],['.desktop-nav a[href="#visit"]','Showroom'],
      ['button.studio-open','Dealer Studio'],['.reserve-open.pill','Book a test drive'],['.studio-titleline small','NOVA MOTORS · DEALER STUDIO'],['.studio-nav button[data-panel="dishes"]','Vehicles'],
      ['[data-panel="dishes"] .panel-intro .eyebrow','04 · Vehicle collection'],['[data-panel="dishes"] .panel-intro h3','Vehicle manager'],['.dish-editor-title h4','Vehicle record']
    ].forEach(([s,t])=>setText(s,t));
    setLabelText('.dish-editor-title .inline-check','Visible in collection ');setLabelText('label.upload-btn:has(#dish-media)','Replace vehicle image ');
    const detailLabels=$$('.detail-columns h4');['Specifications','Vehicle type','Performance','Best suited to'].forEach((t,i)=>{if(detailLabels[i])detailLabels[i].textContent=t});
    const note=$('.detail-note span');if(note)note.textContent='NOVA recommendation';const reserve=$('.detail-reserve');if(reserve)reserve.textContent='Book a test drive →';
  }

  function decorate(){
    const section=$('#signature');if(!section)return;
    if(!$('.dealer-ghost-index',section)){const e=document.createElement('div');e.className='dealer-ghost-index';e.setAttribute('aria-hidden','true');e.innerHTML='<span class="dealer-ghost-current">01</span><span class="dealer-ghost-next">02</span>';section.appendChild(e)}
    if(!$('.dealer-hotspot',section)){const e=document.createElement('div');e.className='dealer-hotspot';e.setAttribute('aria-hidden','true');e.innerHTML='<span>VIEW DETAILS</span>';section.appendChild(e)}
    if(!$('.dealer-progress',section)){const e=document.createElement('div');e.className='dealer-progress';e.setAttribute('aria-label','Vehicle position');section.appendChild(e)}
    buildProgress();updateEditorial(currentIndex(),true);
  }
  function buildProgress(){const nav=$('.dealer-progress');if(!nav)return;nav.innerHTML='';vehicleData().forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.dataset.index=String(i);b.setAttribute('aria-label',`Vehicle ${i+1}`);b.onclick=()=>jump(i);nav.appendChild(b)})}
  function setProgressVisual(from,to,t=1){$$('.dealer-progress button').forEach((b,i)=>{let s=0;if(i===from)s=1-t;if(i===to)s=Math.max(s,t);b.style.setProperty('--vehicle-progress',String(s));b.setAttribute('aria-current',String(t>=.5?i===to:i===from))})}
  function setCopy(index){const d=vehicleData()[normalized(index)];if(!d)return;setText('#dish-meta',d.meta||'');setText('#dish-title',d.name||'');setText('#dish-short',d.short||'');setText('#dish-counter',`${String(normalized(index)+1).padStart(2,'0')} / ${String(vehicleData().length).padStart(2,'0')}`)}
  function updateEditorial(index,immediate=false){const n=expectedCount(),idx=normalized(index,n),nx=normalized(idx+1,n),gc=$('.dealer-ghost-current'),gn=$('.dealer-ghost-next');if(gc)gc.textContent=String(idx+1).padStart(2,'0');if(gn)gn.textContent=String(nx+1).padStart(2,'0');if(immediate&&window.gsap){gsap.set(gc,{x:0,opacity:1,scale:1});gsap.set(gn,{x:42,opacity:0,scale:1.04})}setProgressVisual(idx,idx,1);setCopy(idx);positionHotspot(idx,1)}
  function positionHotspot(index,visibility=1){const hot=$('.dealer-hotspot'),el=vehicleNode(index),section=$('#signature');if(!hot||!el||!section)return;const id=vehicleData()[normalized(index)]?.id,a=HOTSPOT[id]||{x:.15,y:.3},sr=section.getBoundingClientRect(),er=el.getBoundingClientRect();hot.style.left=`${er.left-sr.left+er.width*(.5+a.x)}px`;hot.style.top=`${er.top-sr.top+er.height*a.y}px`;hot.style.opacity=String(visibility)}

  function trackStep(){return shell.clientWidth*(innerWidth<620?.76:innerWidth<900?.60:.52)}
  function renderTrack(p=progress,opts={}){
    if(!shell||!stage||!count())return;
    const step=trackStep(),transfer=opts.transfer??1;
    $$(':scope > .orbit-dish',stage).forEach((el,i)=>{
      const d=circularDistance(i,p),ad=Math.abs(d),x=d*step,id=el.dataset.id,v=VISUAL[id]||{scale:1,y:0};
      let authority=Math.max(0,1-Math.min(ad,1));
      let scale=(.92+authority*.08)*v.scale,opacity=.76+authority*.24,blur=(1-authority)*.18,bright=.90+authority*.10;
      if(ad>1){const fall=Math.min(1,ad-1);opacity=.76*(1-fall);scale*=1-fall*.06;blur=.18+fall*.35}
      if(ad>=1.62)opacity=0;
      if(busy&&i===fromIndex){scale-=transfer*.012;bright-=transfer*.035}
      if(busy&&i===toIndex){scale+=transfer*.008;bright+=transfer*.012}
      const z=Math.round(20+authority*100-Math.min(ad,2)*8);
      const props={xPercent:-50,yPercent:-50,x,y:v.y,scale,rotation:0,opacity,filter:`blur(${Math.max(0,blur)}px) brightness(${Math.max(.72,bright)})`,zIndex:z};
      if(window.gsap)gsap.set(el,props);else{el.style.transform=`translate(-50%,-50%) translate(${x}px,${v.y}px) scale(${scale})`;el.style.opacity=opacity;el.style.filter=props.filter;el.style.zIndex=z}
    });
    document.documentElement.dataset.dealerTrackReady='true';
  }

  function fillDealerDetail(d){[['detail-meta','meta'],['detail-title','name'],['detail-price','price'],['detail-description','short'],['detail-ingredients','ingredients'],['detail-origin','origin'],['detail-technique','technique'],['detail-pairing','pairing']].forEach(([id,k])=>{const e=$('#'+id);if(e)e.textContent=d[k]||''});const note=$('#detail-note');if(note)note.textContent=`“${d.note||''}”`;const availability=$('#detail-allergens');if(availability)availability.textContent=`Availability · ${d.allergens||''}`}
  function openDealerDetail(index=currentIndex()){
    if(busy||detailOpen())return;const d=vehicleData()[normalized(index)],detail=$('#dish-detail'),source=vehicleNode(index),visual=$('#detail-visual');if(!d||!detail||!source||!visual)return;
    fillDealerDetail(d);dealerDetailSource={node:source,parent:source.parentNode,next:source.nextSibling};const state=window.Flip?Flip.getState(source):null;visual.appendChild(source);detail.classList.add('is-open');detail.setAttribute('aria-hidden','false');document.body.classList.add('detail-open');document.documentElement.dataset.dishDetail='open';if(state)Flip.from(state,{duration:.72,ease:'power4.inOut',absolute:true,scale:true});$('#detail-close')?.focus();
  }
  function closeDealerDetail(){
    if(!dealerDetailSource)return;const detail=$('#dish-detail'),source=dealerDetailSource.node,state=window.Flip?Flip.getState(source):null;dealerDetailSource.parent.insertBefore(source,dealerDetailSource.next);const done=()=>{detail?.classList.remove('is-open');detail?.setAttribute('aria-hidden','true');document.body.classList.remove('detail-open');delete document.documentElement.dataset.dishDetail;dealerDetailSource=null;renderTrack(progress);positionHotspot(currentIndex(),1)};state?Flip.from(state,{duration:.62,ease:'power3.inOut',absolute:true,scale:true,onComplete:done}):done();
  }

  function killTimeline(){timeline?.kill?.();timeline=null;cancelAnimationFrame(raf)}
  function finish(){phase='hold';document.documentElement.dataset.vehicleMotionPhase='hold';setTimeout(()=>{busy=false;phase='idle';document.documentElement.dataset.vehicleMotionPhase='idle';copy?.removeAttribute('data-transitioning');positionHotspot(currentIndex(),1);enforce(420)},reduced?0:80)}
  function enforce(duration=700){if(detailOpen())return;const start=performance.now();cancelAnimationFrame(raf);const loop=()=>{if(detailOpen())return;renderTrack(progress,{transfer:1});positionHotspot(currentIndex(),1);if(performance.now()-start<duration)raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}
  function transition(dir,source='control'){
    if(busy||detailOpen()||count()<2)return;busy=true;fromIndex=currentIndex();toIndex=normalized(fromIndex+dir);phase='anticipation';document.documentElement.dataset.vehicleMotionPhase=phase;copy?.setAttribute('data-transitioning','true');killTimeline();
    const target=Math.round(progress)+dir;
    if(reduced||!window.gsap){progress=target;renderTrack(progress);updateEditorial(toIndex,true);finish();return}
    const state={p:progress,velocity:0,transfer:0,editorial:0},anticipate=progress+dir*.032,overshoot=target+dir*.055,gc=$('.dealer-ghost-current'),gn=$('.dealer-ghost-next'),hot=$('.dealer-hotspot');
    if(gc)gc.textContent=String(fromIndex+1).padStart(2,'0');if(gn)gn.textContent=String(toIndex+1).padStart(2,'0');gsap.set(gn,{x:dir*48,opacity:0,scale:1.035});gsap.set(gc,{x:0,opacity:1,scale:1});
    timeline=gsap.timeline({onUpdate(){progress=state.p;renderTrack(progress,{transfer:state.transfer});setProgressVisual(fromIndex,toIndex,state.editorial);positionHotspot(state.transfer<.56?fromIndex:toIndex,Math.max(.10,Math.abs(state.transfer-.5)*2))},onComplete(){progress=target;renderTrack(progress,{transfer:1});setCopy(toIndex);updateEditorial(toIndex,true);finish()}});
    const brakeEnd=CHOREO.anticipation+CHOREO.travel+CHOREO.brake,settleStart=brakeEnd+CHOREO.overshootHold;
    timeline
      .to(state,{p:anticipate,transfer:.05,duration:CHOREO.anticipation,ease:'power2.in',onStart(){phase='anticipation';document.documentElement.dataset.vehicleMotionPhase=phase}},0)
      .to(state,{p:target-dir*.10,transfer:.70,duration:CHOREO.travel,ease:'power3.inOut',onStart(){phase='travel';document.documentElement.dataset.vehicleMotionPhase=phase}},CHOREO.anticipation)
      .call(()=>{phase='transfer';document.documentElement.dataset.vehicleMotionPhase=phase},[],CHOREO.anticipation+CHOREO.travel*.58)
      .to(copy,{opacity:0,y:8,duration:.12,ease:'power2.in',overwrite:'auto'},CHOREO.anticipation+CHOREO.travel*.72)
      .to(state,{p:overshoot,transfer:1,duration:CHOREO.brake,ease:'power4.out',onStart(){phase='brake';document.documentElement.dataset.vehicleMotionPhase=phase}},CHOREO.anticipation+CHOREO.travel)
      .call(()=>setCopy(toIndex),[],CHOREO.anticipation+CHOREO.travel+CHOREO.brake*.74)
      .to(state,{p:overshoot,transfer:1,duration:CHOREO.overshootHold,ease:'none',onStart(){phase='overshoot';document.documentElement.dataset.vehicleMotionPhase=phase}},brakeEnd)
      .to(state,{p:target,transfer:1,duration:CHOREO.settle,ease:'power3.out',onStart(){phase='settle';document.documentElement.dataset.vehicleMotionPhase=phase}},settleStart)
      .to(gc,{x:-dir*38,opacity:0,scale:1.03,duration:.20,ease:'power2.in'},CHOREO.anticipation+CHOREO.travel+CHOREO.brake*.28)
      .to(gn,{x:0,opacity:1,scale:1,duration:.30,ease:'power3.out'},CHOREO.anticipation+CHOREO.travel+CHOREO.brake*.55)
      .to(state,{editorial:1,duration:CHOREO.editorial,ease:'power2.out',onStart(){phase='editorial';document.documentElement.dataset.vehicleMotionPhase=phase}},CHOREO.anticipation+CHOREO.travel+CHOREO.brake*.72)
      .to(copy,{opacity:1,y:0,duration:.25,ease:'power3.out'},CHOREO.anticipation+CHOREO.travel+CHOREO.brake*.82)
      .to(hot,{scale:1.07,duration:.08,ease:'power2.out',yoyo:true,repeat:1},settleStart+CHOREO.settle*.20);
  }
  function jump(index){if(busy||detailOpen())return;let d=index-currentIndex(),n=expectedCount();while(d>n/2)d-=n;while(d<-n/2)d+=n;if(d)transition(Math.sign(d),'progress')}

  function disableInheritedObserver(){try{window.Observer?.getAll?.().forEach(o=>{const target=o.target||o.vars?.target;if(target===shell)o.kill?.()})}catch(e){console.warn('NOVA observer isolation',e)}}
  function bindInteractions(){
    nextBtn=$('#next-dish');prevBtn=$('#prev-dish');copy=$('.dish-copy');disableInheritedObserver();
    if(nextBtn)nextBtn.onclick=e=>{e?.preventDefault?.();transition(1,'button')};if(prevBtn)prevBtn.onclick=e=>{e?.preventDefault?.();transition(-1,'button')};const explore=$('#explore-dish');if(explore)explore.onclick=e=>{e?.preventDefault?.();openDealerDetail(currentIndex())};
    shell.addEventListener('wheel',e=>{if(detailOpen())return;e.preventDefault();e.stopImmediatePropagation();const now=performance.now();if(now-lastWheel<820)return;lastWheel=now;transition((Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)>=0?1:-1,'wheel')},{capture:true,passive:false});
    shell.addEventListener('keydown',e=>{if(detailOpen())return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopImmediatePropagation();transition(e.key==='ArrowRight'?1:-1,'keyboard')}if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();openDealerDetail(currentIndex())}},{capture:true});
    stage.addEventListener('click',e=>{const node=e.target.closest?.('.orbit-dish');if(!node)return;e.preventDefault();e.stopImmediatePropagation();if(busy||performance.now()<suppressClickUntil)return;const idx=indexForNode(node);if(idx<0)return;let d=idx-currentIndex(),n=expectedCount();while(d>n/2)d-=n;while(d<-n/2)d+=n;if(!d)openDealerDetail(idx);else transition(Math.sign(d),'vehicle')},{capture:true});
    shell.addEventListener('pointerdown',e=>{if(busy||detailOpen())return;drag=true;dragX=e.clientX;dragProgress=progress;shell.setPointerCapture?.(e.pointerId);e.stopImmediatePropagation()},{capture:true});
    shell.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-dragX,denom=trackStep();progress=dragProgress-dx/denom;renderTrack(progress,{transfer:Math.min(1,Math.abs(dx)/denom)});positionHotspot(currentIndex(),.28);e.stopImmediatePropagation()},{capture:true});
    const end=e=>{if(!drag)return;drag=false;const dx=e.clientX-dragX;progress=dragProgress;renderTrack(progress);e.stopImmediatePropagation();if(Math.abs(dx)>42){suppressClickUntil=performance.now()+1000;transition(dx<0?1:-1,'drag')}else enforce(220)};shell.addEventListener('pointerup',end,{capture:true});shell.addEventListener('pointercancel',end,{capture:true});
    const close=$('#detail-close');if(close)close.addEventListener('click',e=>{if(!dealerDetailSource)return;e.preventDefault();e.stopImmediatePropagation();closeDealerDetail()},{capture:true});
    addEventListener('resize',()=>{if(!detailOpen()){renderTrack();positionHotspot(currentIndex(),1)}});
  }
  function stableRebuild(){rebuildRaf=0;if(detailOpen()||count()!==expectedCount())return;renderTrack(progress);buildProgress();updateEditorial(currentIndex(),true);relabel()}
  function watchRebuilds(){new MutationObserver(()=>{if(rebuildRaf)cancelAnimationFrame(rebuildRaf);rebuildRaf=requestAnimationFrame(stableRebuild)}).observe(stage,{childList:true});const detail=$('#dish-detail');if(detail)new MutationObserver(()=>{if(!detailOpen())setTimeout(stableRebuild,70)}).observe(detail,{attributes:true,attributeFilter:['aria-hidden','class']})}
  function boot(){
    relabel();shell=$('.orbit-shell');stage=$('#orbit-stage');if(!shell||!stage||!window.gsap){setTimeout(boot,100);return}if(!$$(':scope > .orbit-dish',stage).length){setTimeout(boot,100);return}
    decorate();bindInteractions();fromIndex=currentIndex();toIndex=fromIndex;renderTrack();positionHotspot(fromIndex,1);watchRebuilds();document.documentElement.dataset.orbitalMotion='dealer';document.documentElement.dataset.orbitalChoreography='nova-vehicle-track-v3';document.documentElement.dataset.vehicleMotionPhase='idle';
    window.NovaVehicleMotion={transition,next:()=>transition(1,'api'),prev:()=>transition(-1,'api'),currentIndex,isBusy:()=>busy,phase:()=>phase,render:()=>renderTrack(progress),openDetail:()=>openDealerDetail(currentIndex())};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,120));else setTimeout(boot,120);
})();
/* NOVA multi-view angle bridge.
   Uses optional window.NovaAngleAssets[id] = {side,front,rear}.
   If an angle is missing, the original vehicle image remains as fallback.
   This bridge lets the Polestar relay cross-fade real viewpoints instead of deforming one flat PNG. */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  function install(car){
    if(car.dataset.angleBridge==='1')return;
    const base=$('img',car),id=car.dataset.id,map=window.NovaAngleAssets?.[id];
    if(!base||!map)return;
    car.dataset.angleBridge='1';
    base.classList.add('nova-angle-layer','nova-angle-base');
    const side=base.cloneNode();side.className='nova-angle-layer nova-angle-side';side.src=map.side||base.src;
    const front=base.cloneNode();front.className='nova-angle-layer nova-angle-front';front.src=map.front||map.side||base.src;
    const rear=base.cloneNode();rear.className='nova-angle-layer nova-angle-rear';rear.src=map.rear||map.side||base.src;
    base.style.opacity='0';car.append(side,front,rear);
  }
  function update(car){
    install(car);if(car.dataset.angleBridge!=='1')return;
    const role=car.dataset.authority||'',yaw=Number(car.dataset.yaw||0),ay=Math.abs(yaw);
    const side=$('.nova-angle-side',car),front=$('.nova-angle-front',car),rear=$('.nova-angle-rear',car);if(!side||!front||!rear)return;
    let s=1,f=0,r=0;
    if(role==='incoming'||role==='next-up'||(role==='neighbor'&&yaw>4)){
      const k=clamp((ay-3)/20);f=k;s=1-k;
    }else if(role==='outgoing'||(role==='neighbor'&&yaw<-4)){
      const k=clamp((ay-3)/20);r=k;s=1-k;
    }
    side.style.opacity=String(s);front.style.opacity=String(f);rear.style.opacity=String(r);
    car.dataset.view=f>.55?'front-3q':r>.55?'rear-3q':'side';
  }
  function tick(){const stage=$('.nova-track-stage');if(stage)$$('.nova-car',stage).forEach(update);requestAnimationFrame(tick)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick);else tick();
})();
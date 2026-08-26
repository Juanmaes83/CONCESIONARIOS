/* Preserve the donor GSAP Flip detail, but feed it vehicle records instead of Class 06 dish translations. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  async function currentConfig(){try{const p=await window.RestaurantStore?.loadProject?.();return p?.config||window.RestaurantDefaults}catch{return window.RestaurantDefaults}}
  function relabelDetail(){
    $$('.detail-columns h4').forEach((el,i)=>{const labels=['Specifications','Vehicle type','Performance','Best suited to'];if(labels[i]&&el.textContent!==labels[i])el.textContent=labels[i]});
    const note=$('.detail-note span');if(note)note.textContent='NOVA recommendation';
    const reserve=$('.detail-reserve');if(reserve)reserve.textContent='Book a test drive →';
  }
  async function refill(){
    const detail=$('#dish-detail');if(!detail||detail.getAttribute('aria-hidden')!=='false')return;
    const cfg=await currentConfig(),visible=$('#dish-title')?.textContent?.trim(),counter=parseInt($('#dish-counter')?.textContent||'1',10)-1;
    const list=(cfg?.dishes||[]).filter(d=>d.enabled!==false);const d=list.find(x=>x.name===visible)||list[counter]||window.RestaurantDefaults?.dishes?.[counter];if(!d)return;
    const fields={
      '#detail-meta':d.meta,'#detail-title':d.name,'#detail-price':d.price,'#detail-description':d.short,'#detail-ingredients':d.ingredients,'#detail-origin':d.origin,'#detail-technique':d.technique,'#detail-pairing':d.pairing,'#detail-note':`“${d.note||''}”`,'#detail-allergens':`Notes · ${d.allergens||''}`
    };
    Object.entries(fields).forEach(([sel,val])=>{const el=$(sel);if(el)el.textContent=val||''});
    relabelDetail();
  }
  function queueRefill(){refill();setTimeout(refill,60);setTimeout(refill,180);setTimeout(refill,420)}
  function watch(){
    const detail=$('#dish-detail');if(!detail){setTimeout(watch,120);return}
    new MutationObserver(()=>{if(detail.getAttribute('aria-hidden')==='false')queueRefill()}).observe(detail,{attributes:true,attributeFilter:['aria-hidden','class']});
    $('#explore-dish')?.addEventListener('click',()=>setTimeout(queueRefill,20),true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
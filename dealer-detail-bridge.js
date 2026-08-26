/* Preserve the donor GSAP Flip detail, but feed it vehicle records instead of Class 06 dish translations. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  async function currentConfig(){try{const p=await window.RestaurantStore?.loadProject?.();return p?.config||window.RestaurantDefaults}catch{return window.RestaurantDefaults}}
  async function refill(){const detail=$('#dish-detail');if(!detail||detail.getAttribute('aria-hidden')!=='false')return;const cfg=await currentConfig(),visible=$('#dish-title')?.textContent?.trim(),counter=parseInt($('#dish-counter')?.textContent||'1',10)-1;const list=(cfg?.dishes||[]).filter(d=>d.enabled!==false);const d=list.find(x=>x.name===visible)||list[counter]||window.RestaurantDefaults?.dishes?.[counter];if(!d)return;const fields={
    '#detail-meta':d.meta,'#detail-title':d.name,'#detail-price':d.price,'#detail-description':d.short,'#detail-ingredients':d.ingredients,'#detail-origin':d.origin,'#detail-technique':d.technique,'#detail-pairing':d.pairing,'#detail-note':`“${d.note||''}”`,'#detail-allergens':`Notes · ${d.allergens||''}`
  };Object.entries(fields).forEach(([sel,val])=>{const el=$(sel);if(el)el.textContent=val||''});
  }
  function watch(){const detail=$('#dish-detail');if(!detail){setTimeout(watch,120);return}new MutationObserver(()=>{if(detail.getAttribute('aria-hidden')==='false'){refill();setTimeout(refill,80);setTimeout(refill,320)}}).observe(detail,{attributes:true,attributeFilter:['aria-hidden','class']});$('#explore-dish')?.addEventListener('click',()=>{setTimeout(refill,40);setTimeout(refill,260)},true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
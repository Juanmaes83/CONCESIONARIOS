/* Dealer gesture guard: a horizontal drag must never also trigger the donor product click/detail. */
(() => {
  'use strict';
  let startX=null,startY=null,suppressUntil=0,closing=false;
  const suppressing=()=>performance.now()<suppressUntil;
  function closeResidualDetail(){
    if(!suppressing()||closing)return;
    const detail=document.getElementById('dish-detail');
    if(!detail||detail.getAttribute('aria-hidden')!=='false')return;
    closing=true;
    const close=document.getElementById('detail-close');
    if(close)close.click();
    setTimeout(()=>{closing=false},500);
  }
  function bind(){
    const shell=document.querySelector('.orbit-shell');if(!shell){setTimeout(bind,120);return}
    shell.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY},{capture:true,passive:true});
    shell.addEventListener('pointerup',e=>{
      if(startX===null)return;
      const dx=Math.abs(e.clientX-startX),dy=Math.abs(e.clientY-startY);startX=startY=null;
      if(dx>42&&dx>dy*1.25){suppressUntil=performance.now()+1500;requestAnimationFrame(closeResidualDetail);setTimeout(closeResidualDetail,40);setTimeout(closeResidualDetail,180);setTimeout(closeResidualDetail,520)}
    },{capture:true,passive:true});
    shell.addEventListener('pointercancel',()=>{startX=startY=null},{capture:true,passive:true});
    const block=e=>{if(suppressing()&&e.target.closest?.('.orbit-dish')){e.preventDefault();e.stopImmediatePropagation();closeResidualDetail()}};
    shell.addEventListener('click',block,{capture:true});document.addEventListener('click',block,{capture:true});
    const detail=document.getElementById('dish-detail');if(detail)new MutationObserver(closeResidualDetail).observe(detail,{attributes:true,attributeFilter:['aria-hidden','class']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
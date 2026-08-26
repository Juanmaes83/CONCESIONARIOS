/* Dealer gesture guard: suppress the synthetic click that may follow a horizontal drag.
   It never owns the donor detail animation; app-v4 remains the only owner of GSAP Flip. */
(() => {
  'use strict';
  let startX=null,startY=null,suppressUntil=0,residualHandled=false;
  const suppressing=()=>performance.now()<suppressUntil;
  function arm(){suppressUntil=performance.now()+1200;residualHandled=false}
  function closeResidualOnce(){
    if(!suppressing()||residualHandled)return;
    const detail=document.getElementById('dish-detail');
    if(!detail||detail.getAttribute('aria-hidden')!=='false')return;
    residualHandled=true;
    document.getElementById('detail-close')?.click();
  }
  function bind(){
    const shell=document.querySelector('.orbit-shell');if(!shell){setTimeout(bind,120);return}
    shell.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY},{capture:true,passive:true});
    shell.addEventListener('pointerup',e=>{
      if(startX===null)return;
      const dx=Math.abs(e.clientX-startX),dy=Math.abs(e.clientY-startY);startX=startY=null;
      if(dx>42&&dx>dy*1.25){arm();requestAnimationFrame(closeResidualOnce);setTimeout(closeResidualOnce,60)}
    },{capture:true,passive:true});
    shell.addEventListener('pointercancel',()=>{startX=startY=null},{capture:true,passive:true});
    const block=e=>{if(suppressing()&&e.target.closest?.('.orbit-dish')){e.preventDefault();e.stopImmediatePropagation();closeResidualOnce()}};
    shell.addEventListener('click',block,{capture:true});
    document.addEventListener('click',block,{capture:true});
    const detail=document.getElementById('dish-detail');
    if(detail)new MutationObserver(()=>requestAnimationFrame(closeResidualOnce)).observe(detail,{attributes:true,attributeFilter:['aria-hidden','class']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
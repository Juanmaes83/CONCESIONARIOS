/* Dealer gesture guard: a horizontal drag must never also trigger the donor product click. */
(() => {
  'use strict';
  let startX=null,suppressUntil=0;
  function bind(){
    const shell=document.querySelector('.orbit-shell');if(!shell){setTimeout(bind,120);return}
    shell.addEventListener('pointerdown',e=>{startX=e.clientX},{capture:true,passive:true});
    shell.addEventListener('pointerup',e=>{if(startX===null)return;const moved=Math.abs(e.clientX-startX);startX=null;if(moved>42)suppressUntil=performance.now()+1100},{capture:true,passive:true});
    shell.addEventListener('pointercancel',()=>{startX=null},{capture:true,passive:true});
    shell.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation()}},{capture:true});
    document.addEventListener('click',e=>{if(performance.now()<suppressUntil&&e.target.closest?.('.orbit-dish')){e.preventDefault();e.stopImmediatePropagation()}},{capture:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
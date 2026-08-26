/* Keep Class 05 Motion Studio semantics while adding the dealership choreography as a designed language. */
(() => {
  'use strict';
  const load=(src,attr)=>{if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.setAttribute(attr,'1');s.async=false;document.head.appendChild(s)};
  load('dealer-drag-guard.js','data-dealer-drag-guard');
  load('dealer-content-guard.js','data-dealer-content-guard');
  const pin=()=>{
    const select=document.getElementById('motion-orbital-style');
    if(select){if(!select.querySelector('option[value="dealer"]')){const o=document.createElement('option');o.value='dealer';o.textContent='Vehicle Track · Reference';select.appendChild(o)}if(select.value!=='dealer'){select.value='dealer';select.dispatchEvent(new Event('change',{bubbles:true}))}}
    document.documentElement.dataset.orbitalMotion='dealer';
  };
  let ticks=0;const timer=setInterval(()=>{pin();if(++ticks>48)clearInterval(timer)},75);
  document.addEventListener('DOMContentLoaded',pin);window.addEventListener('restaurant:motion-change',()=>setTimeout(pin,0));
})();
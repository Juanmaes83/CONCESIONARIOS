/* Dealer bootstrap guard: prevents inherited Class 06 restaurant i18n from overwriting dealership copy. */
(() => {
  'use strict';
  if(!document.querySelector('script[data-dealer-detail-bridge]')){const s=document.createElement('script');s.src='dealer-detail-bridge.js';s.dataset.dealerDetailBridge='1';s.async=false;document.head.appendChild(s)}
  const $=s=>document.querySelector(s),D=()=>window.RestaurantDefaults;
  const map={
    'hero-kicker':'hero.kicker','hero-line1':'hero.line1','hero-line2':'hero.line2','hero-body':'hero.body','hero-cta':'hero.cta','hero-stamp':'hero.stamp','scroll-hint':'hero.scroll',
    'philosophy-index':'philosophy.index','philosophy-title':'philosophy.title','philosophy-body1':'philosophy.body1','philosophy-body2':'philosophy.body2',
    'orbital-index':'orbital.index','orbital-kicker':'orbital.kicker','orbital-title':'orbital.title','explore-label':'orbital.explore',
    'origin-index':'origin.index','origin-title':'origin.title','origin-body':'origin.body','origin-caption':'origin.caption',
    'atmosphere-index':'atmosphere.index','atmosphere-title':'atmosphere.title','atmosphere-caption':'atmosphere.caption','atmosphere-body':'atmosphere.body','atmosphere-cta':'atmosphere.cta',
    'chef-index':'chef.index','chef-title':'chef.title','chef-quote':'chef.quote','visit-kicker':'visit.kicker','visit-title':'visit.title','visit-cta':'visit.cta',
    'address-label':'visit.addressLabel','address-text':'visit.address','service-label':'visit.serviceLabel','service-text':'visit.service','contact-label':'visit.contactLabel','contact-text':'visit.contact',
    'footer-left':'footer.left','footer-center':'footer.center','footer-right':'footer.right'
  };
  const get=(obj,path)=>path.split('.').reduce((a,k)=>a?.[k],obj);
  function apply(){const d=D();if(!d)return;Object.entries(map).forEach(([id,path])=>{const el=document.getElementById(id),v=get(d,path);if(el&&v!==undefined)el.textContent=v});const badges=$('#chef-badges');if(badges)badges.innerHTML=(d.chef.badges||[]).map(x=>`<span>${x}</span>`).join('');const langTab=$('.studio-nav [data-panel="class6"]');if(langTab)langTab.hidden=true;const langPanel=$('.studio-panel[data-panel="class6"]');if(langPanel)langPanel.hidden=true;document.querySelectorAll('.language-switcher,.locale-switcher,[data-language-switcher]').forEach(el=>el.hidden=true);document.title=`${d.brand.name} — Premium Electric Mobility`;}
  let ticks=0;const timer=setInterval(()=>{apply();if(++ticks>48)clearInterval(timer)},75);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
/* NOVA public-copy guard: inherited layers may re-render, but dealership language always wins visibly. */
(() => {
  'use strict';
  if(!document.querySelector('script[data-dealer-detail-bridge]')){const s=document.createElement('script');s.src='dealer-detail-bridge.js';s.dataset.dealerDetailBridge='1';s.async=false;document.head.appendChild(s)}
  const $=s=>document.querySelector(s),D=()=>window.RestaurantDefaults;
  const map={
    'hero-kicker':'hero.kicker','hero-line1':'hero.line1','hero-line2':'hero.line2','hero-body':'hero.body','hero-cta':'hero.cta','hero-stamp':'hero.stamp','scroll-hint':'hero.scroll',
    'philosophy-index':'philosophy.index','philosophy-title':'philosophy.title','philosophy-body1':'philosophy.body1','philosophy-body2':'philosophy.body2',
    'orbital-index':'orbital.index','orbital-kicker':'orbital.kicker','orbital-title':'orbital.title','explore-label':'orbital.explore','origin-index':'origin.index','origin-title':'origin.title','origin-body':'origin.body','origin-caption':'origin.caption',
    'atmosphere-index':'atmosphere.index','atmosphere-title':'atmosphere.title','atmosphere-caption':'atmosphere.caption','atmosphere-body':'atmosphere.body','atmosphere-cta':'atmosphere.cta','chef-index':'chef.index','chef-title':'chef.title','chef-quote':'chef.quote',
    'visit-kicker':'visit.kicker','visit-title':'visit.title','visit-cta':'visit.cta','address-label':'visit.addressLabel','address-text':'visit.address','service-label':'visit.serviceLabel','service-text':'visit.service','contact-label':'visit.contactLabel','contact-text':'visit.contact','footer-left':'footer.left','footer-center':'footer.center','footer-right':'footer.right'
  };
  const get=(obj,path)=>path.split('.').reduce((a,k)=>a?.[k],obj);const set=(sel,text)=>{const el=$(sel);if(el&&el.textContent!==text)el.textContent=text};
  let queued=false,applying=false;
  function removeRestaurantOnlyLayers(){
    document.querySelectorAll('.class7-context,#class7-journey-layer,#class7-journey-hint,#class7-journey-card,#class6-story,#class6-language').forEach(el=>el.remove());
    document.documentElement.dataset.dishJourneyEnabled='false';
  }
  function apply(){
    if(applying)return;applying=true;const d=D();if(!d){applying=false;return}
    removeRestaurantOnlyLayers();
    Object.entries(map).forEach(([id,path])=>{const el=document.getElementById(id),v=get(d,path);if(el&&v!==undefined&&el.textContent!==String(v))el.textContent=v});
    set('.desktop-nav a[href="#signature"]','Models');set('.desktop-nav a[href="#story"]','Why NOVA');set('.desktop-nav a[href="#experience"]','Experience');set('.desktop-nav a[href="#visit"]','Showroom');set('button.studio-open','Dealer Studio');set('.reserve-open.pill','Book a test drive');
    const badges=$('#chef-badges');if(badges){const html=(d.chef.badges||[]).map(x=>`<span>${x}</span>`).join('');if(badges.innerHTML!==html)badges.innerHTML=html}
    const langTab=$('.studio-nav [data-panel="class6"]');if(langTab)langTab.hidden=true;const langPanel=$('.studio-panel[data-panel="class6"]');if(langPanel)langPanel.hidden=true;document.querySelectorAll('.language-switcher,.locale-switcher,[data-language-switcher]').forEach(el=>el.hidden=true);
    document.documentElement.lang='en';document.title=`${d.brand.name} — Premium Electric Vehicles`;applying=false;
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  const start=()=>{apply();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});setInterval(apply,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,80));else setTimeout(start,80);
})();
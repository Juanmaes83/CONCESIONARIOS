/* NOVA Dealer Studio vocabulary: preserves proven controls, replaces restaurant-facing language. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s);const set=(s,t)=>{const e=$(s);if(e&&e.textContent!==t)e.textContent=t};
  const textNode=(el,text)=>{if(!el)return;let n=[...el.childNodes].find(x=>x.nodeType===Node.TEXT_NODE);if(!n){n=document.createTextNode('');el.insertBefore(n,el.firstChild||null)}if(n.nodeValue!==text)n.nodeValue=text};
  function labelFor(path,text){const input=$(`[data-path="${path}"]`);if(input)textNode(input.closest('label'),text)}
  let applying=false,queued=false;
  function apply(){
    if(applying)return;applying=true;
    set('[data-panel="brand"] .panel-intro .eyebrow','01 · Brand');set('[data-panel="brand"] .panel-intro h3','NOVA identity');set('[data-panel="brand"] .panel-intro p:nth-of-type(2)','Control the dealership name, palette and logo used across the customer-facing experience.');
    const brandName=$('[data-panel="brand"] label.full');if(brandName)textNode(brandName,'Dealership name ');

    set('[data-panel="content"] .panel-intro .eyebrow','02 · Content');set('[data-panel="content"] .panel-intro h3','Customer-facing copy');set('[data-panel="content"] .panel-intro p:nth-of-type(2)','Edit the opening message, Why NOVA, design, driving experience and expert-advice sections without touching code.');
    const contentLabels=[
      ['[data-path="philosophy.title"]','Why NOVA · Headline '],['[data-path="philosophy.body1"]','Why NOVA · Body 1 '],['[data-path="philosophy.body2"]','Why NOVA · Body 2 '],
      ['[data-path="origin.title"]','Design & engineering · Headline '],['[data-path="origin.body"]','Design & engineering · Body '],['[data-path="origin.caption"]','Design & engineering · Caption '],
      ['[data-path="atmosphere.title"]','Driving experience · Headline '],['[data-path="atmosphere.body"]','Driving experience · Body '],['[data-path="atmosphere.caption"]','Driving experience · Caption '],['[data-path="atmosphere.cta"]','Driving experience · CTA '],
      ['[data-path="chef.title"]','Expert guidance · Headline '],['[data-path="chef.quote"]','Expert guidance · Quote ']
    ];contentLabels.forEach(([sel,t])=>{const input=$(sel);if(input)textNode(input.closest('label'),t)});

    set('[data-panel="media"] .panel-intro .eyebrow','03 · Media');set('[data-panel="media"] .panel-intro h3','Vehicle media by section');set('[data-panel="media"] .panel-intro p:nth-of-type(2)','Replace the imagery or video used for the opening, design, driving experience and expert-advice sections.');
    set('.media-card[data-slot="hero"] strong','HERO · Main vehicle');set('.media-card[data-slot="hero"] .media-card-head span','Primary opening visual.');
    set('.media-card[data-slot="origin"] strong','DESIGN · Engineering visual');set('.media-card[data-slot="origin"] .media-card-head span','Vehicle or engineering image used in the design chapter.');
    set('.media-card[data-slot="atmosphere"] strong','DRIVING EXPERIENCE · Road visual');set('.media-card[data-slot="atmosphere"] .media-card-head span','Vehicle, cabin or road image used in the driving chapter.');
    set('.media-card[data-slot="chef"] strong','EXPERT GUIDANCE · Featured vehicle');set('.media-card[data-slot="chef"] .media-card-head span','Supporting vehicle image for the advice chapter.');
    document.querySelectorAll('.media-spec').forEach((el,i)=>{const copy=['Recommended: 16:9 · full vehicle or cinematic exterior.','Recommended: 4:5 · engineering, body detail or full vehicle.','Recommended: 16:9 · road, cabin or driving context.','Recommended: 4:5 · featured vehicle or consultation visual.'][i];if(copy&&el.textContent!==copy)el.textContent=copy});

    set('[data-panel="visit"] .panel-intro .eyebrow','05 · Showroom & conversion');
    set('[data-panel="visit"] .panel-intro h3','Showroom, contact and test drives');
    set('[data-panel="visit"] .panel-intro p:nth-of-type(2)','Edit the commercial close, showroom information and test-drive CTA. A booking URL can connect directly to the sales or CRM flow.');
    set('[data-panel="visit"] .panel-preview','Preview showroom & test-drive block ↗');
    labelFor('visit.kicker','Showroom · Kicker ');labelFor('visit.title','Showroom · Headline ');labelFor('visit.cta','Test-drive CTA ');labelFor('visit.bookingUrl','Test-drive booking URL ');
    labelFor('visit.addressLabel','Showroom label ');labelFor('visit.address','Showroom address ');labelFor('visit.serviceLabel','Opening-hours label ');labelFor('visit.service','Opening hours ');labelFor('visit.contactLabel','Contact label ');labelFor('visit.contact','Sales contact ');

    set('[data-panel="project"] .panel-intro .eyebrow','07 · Project');set('[data-panel="project"] .panel-intro h3','Project state and portability');set('[data-panel="project"] .panel-intro p:nth-of-type(2)','Save, restore, preview and export the complete NOVA Motors dealership configuration.');
    set('[data-panel="project"] .project-card:last-child h4','Restore NOVA Motors demo');set('[data-panel="project"] .project-card:last-child p','Remove local project/media and restore the six-vehicle NOVA Motors demo.');

    const motion=$('[data-panel="motion"]');if(motion){
      set('[data-panel="motion"] .panel-intro h3','Vehicle motion direction');
      set('[data-panel="motion"] .panel-intro p:nth-of-type(2)','Choose a designed motion language for the vehicle collection without exposing technical animation parameters.');
      set('[data-panel="motion"] .motion-card-featured strong','NOVA Vehicle Choreography');
      set('[data-panel="motion"] .motion-card-featured p','Track, mass transfer, braking, lock and editorial synchronisation for the full collection.');
      const lab=$('[data-panel="motion"] label:has(#motion-orbital-style)');if(lab)textNode(lab,'Vehicle choreography ');
      const cards=[...motion.querySelectorAll('.motion-grid .motion-card')];
      const names=['Hero','Why NOVA','Design & engineering','Driving experience','Expert guidance','Showroom'];
      cards.forEach((card,i)=>{const strong=card.querySelector('.motion-card-head strong');if(strong&&names[i]&&strong.textContent!==names[i])strong.textContent=names[i];const button=card.querySelector('.motion-preview');if(button&&button.textContent!=='▶ Preview section')button.textContent='▶ Preview section'});
      const help=motion.querySelector('.motion-help');const helpHtml='<strong>Accessibility.</strong> Reduced-motion preferences keep content, navigation, test-drive actions and Dealer Studio available while removing non-essential animation.';if(help&&help.innerHTML!==helpHtml)help.innerHTML=helpHtml;
    }

    const help=$('[data-panel="dishes"] .studio-help');const dishHelp='<strong>Vehicle image contract:</strong> isolated full vehicle, comparable camera height, consistent wheel baseline, clean cutout and enough lateral breathing room for the track choreography.';if(help&&help.innerHTML!==dishHelp)help.innerHTML=dishHelp;
    const h4s=document.querySelectorAll('.detail-columns h4');['Specifications','Vehicle type','Performance','Best suited to'].forEach((t,i)=>{if(h4s[i]&&h4s[i].textContent!==t)h4s[i].textContent=t});
    applying=false;
  }
  function schedule(){if(queued||applying)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  function start(){
    apply();
    const studio=$('#studio');
    if(studio)new MutationObserver(schedule).observe(studio,{subtree:true,childList:true,characterData:true});
    document.addEventListener('click',e=>{if(e.target.closest?.('.studio-nav'))setTimeout(apply,0)},true);
    window.addEventListener('restaurant:motion-change',()=>setTimeout(apply,0));
    window.addEventListener('restaurant:project-loaded',()=>setTimeout(apply,0));
    setInterval(apply,1500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,60));else setTimeout(start,60);
})();
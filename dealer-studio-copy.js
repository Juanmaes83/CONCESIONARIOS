/* Dealer Studio vocabulary bridge: preserves donor controls, changes visible domain language only. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s);const set=(s,t)=>{const e=$(s);if(e)e.textContent=t};
  function apply(){
    set('[data-panel="brand"] .panel-intro .eyebrow','01 · Brand');set('[data-panel="brand"] .panel-intro h3','Dealership identity');
    set('[data-panel="content"] .panel-intro .eyebrow','02 · Content');set('[data-panel="content"] .panel-intro h3','All visible dealership copy');set('[data-panel="content"] .panel-intro p:nth-of-type(2)','Hero, philosophy, design, experience and advisor copy remain editable without touching code.');
    set('[data-panel="media"] .panel-intro .eyebrow','03 · Media');set('[data-panel="media"] .panel-intro h3','Vehicle media by section');set('[data-panel="media"] .panel-intro p:nth-of-type(2)','Replace the vehicle imagery used in Hero, Design, Experience and Guidance. Image or video slots keep the original donor persistence.');
    set('.media-card[data-slot="hero"] strong','HERO · Main vehicle');set('.media-card[data-slot="hero"] .media-card-head span','Primary opening visual.');
    set('.media-card[data-slot="origin"] strong','DESIGN · Vehicle / engineering');set('.media-card[data-slot="atmosphere"] strong','EXPERIENCE · Vehicle / road');set('.media-card[data-slot="chef"] strong','GUIDANCE · Featured vehicle');
    set('[data-panel="visit"] .panel-intro p:nth-of-type(2)','Edit the commercial close. A booking URL can connect the CTA to a test-drive provider or CRM.');
    set('[data-panel="project"] .panel-intro .eyebrow','07 · Project');set('[data-panel="project"] .project-card:last-child h4','Restore dealership demo');set('[data-panel="project"] .project-card:last-child p','Remove local project/media and restore the NOVA MOTORS six-vehicle demo.');
    const motion=$('[data-panel="motion"]');if(motion){set('[data-panel="motion"] .panel-intro h3','Vehicle motion direction');set('[data-panel="motion"] .motion-card-featured strong','Vehicle Showcase');set('[data-panel="motion"] .motion-card-featured p','One designed choreography for the entire vehicle collection.');const lab=$('[data-panel="motion"] label:has(#motion-orbital-style)');if(lab&&lab.firstChild)lab.firstChild.nodeValue='Vehicle choreography';}
    const help=$('[data-panel="dishes"] .studio-help');if(help)help.innerHTML='<strong>Visual contract:</strong> isolated vehicle, comparable camera height and perspective, transparent-ready background, full body visible and consistent wheel baseline.';
    const h4s=document.querySelectorAll('.detail-columns h4');['Specifications','Design','Performance','Use case'].forEach((t,i)=>{if(h4s[i])h4s[i].textContent=t});
  }
  let n=0;const timer=setInterval(()=>{apply();if(++n>40)clearInterval(timer)},100);document.addEventListener('DOMContentLoaded',apply);
})();
/* NOVA MOTORS — deterministic Dealer bootstrap + permanent transparent media mapping. */
(() => {
  'use strict';
  const loadDealerModule=(src,key)=>{
    if(document.querySelector(`script[data-${key}]`))return;
    const s=document.createElement('script');s.src=src;s.async=false;s.dataset[key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]='1';document.head.appendChild(s);
  };
  loadDealerModule('dealer-content-guard.js','dealer-content-guard');
  loadDealerModule('dealer-studio-copy.js','dealer-studio-copy');
  loadDealerModule('dealer-drag-guard.js','dealer-drag-guard');
  document.documentElement.dataset.dealerBootstrap='complete';

  const D=window.RestaurantDefaults;
  if(!D)return;
  const transparent={
    modelS:'assets/vehicles/nova/model-s-red.webp',
    modelX:'assets/vehicles/nova/model-x-white.webp',
    modelY:'assets/vehicles/nova/model-y-blue.webp',
    model3:'https://d2ol7oe51mr4n9.cloudfront.net/user_32Z72jiRnAYwuEpbVNGYFa3wWSz/e130868a-3e06-44c8-a440-6a36bc316ca7.png',
    cybertruck:'https://d2ol7oe51mr4n9.cloudfront.net/user_32Z72jiRnAYwuEpbVNGYFa3wWSz/8ed7f8cc-2ed5-492a-b306-11b41c057e14.png',
    roadster:'https://d2ol7oe51mr4n9.cloudfront.net/user_32Z72jiRnAYwuEpbVNGYFa3wWSz/51f718ba-c607-4df4-bfc7-4e360b288502.png'
  };
  if(D.media){
    D.media.hero={type:'image',url:transparent.modelS,fit:'contain',position:'72% 54%'};
    D.media.origin={type:'image',url:transparent.modelY,fit:'contain',position:'50% 58%'};
    D.media.atmosphere={type:'image',url:transparent.modelX,fit:'contain',position:'50% 56%'};
    D.media.chef={type:'image',url:transparent.modelS,fit:'contain',position:'50% 57%'};
  }
  const map=[transparent.modelS,transparent.modelX,transparent.modelY,transparent.model3,transparent.cybertruck,transparent.roadster];
  (D.dishes||[]).forEach((d,i)=>{if(map[i])d.image=map[i]});
  document.documentElement.dataset.dealerAssets='permanent-alpha';
})();
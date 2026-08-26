/* NOVA MOTORS — deterministic Dealer bootstrap + repository vehicle media mapping. */
(() => {
  'use strict';
  const loadDealerModule=(src,key)=>{
    if(document.querySelector(`script[data-${key}]`))return;
    const s=document.createElement('script');s.src=src;s.async=false;s.dataset[key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]='1';document.head.appendChild(s);
  };
  loadDealerModule('dealer-content-guard.js','dealer-content-guard');
  loadDealerModule('dealer-studio-copy.js','dealer-studio-copy');
  document.documentElement.dataset.dealerBootstrap='complete';
  const D=window.RestaurantDefaults;if(!D)return;
  const VEHICLES=[
    'imagenes/hf_20260826_072108_3386a1a4-fbf8-450b-80f9-3120cb013f96.png',
    'imagenes/hf_20260826_072108_48afab8a-ae05-47f4-8159-962ab4a47430.png',
    'imagenes/hf_20260826_072108_a8cd3fe5-5e51-4dac-9ba1-b790ae1b7ddd.png',
    'imagenes/hf_20260826_082019_42e21187-79f3-4ae0-87a3-8a085300b009.png',
    'imagenes/hf_20260826_082019_1d9402df-f6d2-4ab4-8336-36a07550c0df.png',
    'imagenes/hf_20260826_082019_ef284aac-ec4a-430d-bdb4-7aeec8b6cc4b.png'
  ];
  if(D.media){
    D.media.hero={type:'image',url:VEHICLES[0],fit:'contain',position:'72% 54%'};
    D.media.origin={type:'image',url:VEHICLES[4],fit:'contain',position:'50% 58%'};
    D.media.atmosphere={type:'image',url:VEHICLES[1],fit:'contain',position:'50% 56%'};
    D.media.chef={type:'image',url:VEHICLES[3],fit:'contain',position:'50% 57%'};
  }
  (D.dishes||[]).forEach((d,i)=>{if(VEHICLES[i])d.image=VEHICLES[i]});
  window.NovaVehicleAssets=VEHICLES.slice();
  document.documentElement.dataset.dealerAssets='repo-png-six';
})();
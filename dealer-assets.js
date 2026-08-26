/* Runtime alpha preparation for Higgsfield product generations + donor media reuse. */
(() => {
  'use strict';
  const D=window.RestaurantDefaults;
  if(D?.media){
    D.media.hero={type:'image',url:'https://d8j0ntlcm91z4.cloudfront.net/user_32Z72jiRnAYwuEpbVNGYFa3wWSz/hf_20260826_082019_ef284aac-ec4a-430d-bdb4-7aeec8b6cc4b.png',fit:'contain',position:'72% 54%'};
    D.media.origin={type:'image',url:'https://d8j0ntlcm91z4.cloudfront.net/user_32Z72jiRnAYwuEpbVNGYFa3wWSz/hf_20260826_082019_1d9402df-f6d2-4ab4-8336-36a07550c0df.png',fit:'contain',position:'50% 58%'};
    D.media.atmosphere={type:'image',url:'https://d8j0ntlcm91z4.cloudfront.net/user_32Z72jiRnAYwuEpbVNGYFa3wWSz/hf_20260826_072108_48afab8a-ae05-47f4-8159-962ab4a47430.png',fit:'contain',position:'50% 56%'};
    D.media.chef={type:'image',url:'https://d8j0ntlcm91z4.cloudfront.net/user_32Z72jiRnAYwuEpbVNGYFa3wWSz/hf_20260826_082019_42e21187-79f3-4ae0-87a3-8a085300b009.png',fit:'contain',position:'50% 57%'};
  }
  const isTarget=src=>/hf_20260826_(?:072108_(?:3386a1a4|48afab8a|a8cd3fe5)|082019_(?:42e21187|1d9402df|ef284aac))/.test(src||'');
  async function keyImage(img){
    const source=img.currentSrc||img.src;if(!isTarget(source)||img.dataset.dealerAlpha==='done'||img.dataset.dealerAlpha==='loading')return;
    img.dataset.dealerAlpha='loading';
    try{
      const ref=new Image();ref.crossOrigin='anonymous';ref.decoding='async';
      await new Promise((resolve,reject)=>{ref.onload=resolve;ref.onerror=reject;ref.src=source});
      const max=1500,ratio=Math.min(1,max/ref.naturalWidth),w=Math.max(1,Math.round(ref.naturalWidth*ratio)),h=Math.max(1,Math.round(ref.naturalHeight*ratio));
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(ref,0,0,w,h);
      const frame=ctx.getImageData(0,0,w,h),p=frame.data;
      for(let i=0;i<p.length;i+=4){const r=p[i],g=p[i+1],b=p[i+2];const magenta=Math.min(r,b)-g;const chroma=(r>145&&b>140&&magenta>38&&Math.abs(r-b)<115);if(chroma){const a=Math.max(0,255-(magenta-34)*5.8);p[i+3]=Math.min(p[i+3],a)}}
      ctx.putImageData(frame,0,0);const blob=await new Promise(res=>canvas.toBlob(res,'image/webp',.95));if(!blob)throw new Error('alpha export failed');
      img.src=URL.createObjectURL(blob);img.dataset.dealerAlpha='done';
    }catch(err){img.dataset.dealerAlpha='failed';console.warn('Dealer alpha preparation failed',err)}
  }
  const scan=()=>document.querySelectorAll('img').forEach(keyImage);
  const wait=()=>{scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});setInterval(scan,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(wait,180));else setTimeout(wait,180);
})();
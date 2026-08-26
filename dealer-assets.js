/* Runtime alpha preparation for Higgsfield product generations. */
(() => {
  'use strict';
  const isTarget=src=>/hf_20260826_072108_(3386a1a4|48afab8a|a8cd3fe5)/.test(src||'');
  async function keyImage(img){
    const source=img.currentSrc||img.src;if(!isTarget(source)||img.dataset.dealerAlpha==='done'||img.dataset.dealerAlpha==='loading')return;
    img.dataset.dealerAlpha='loading';
    try{
      const ref=new Image();ref.crossOrigin='anonymous';ref.decoding='async';
      await new Promise((resolve,reject)=>{ref.onload=resolve;ref.onerror=reject;ref.src=source});
      const max=1500,ratio=Math.min(1,max/ref.naturalWidth),w=Math.max(1,Math.round(ref.naturalWidth*ratio)),h=Math.max(1,Math.round(ref.naturalHeight*ratio));
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(ref,0,0,w,h);
      const frame=ctx.getImageData(0,0,w,h),p=frame.data;
      for(let i=0;i<p.length;i+=4){const r=p[i],g=p[i+1],b=p[i+2];const magenta=Math.min(r,b)-g;const chroma=(r>150&&b>145&&magenta>42&&Math.abs(r-b)<105);if(chroma){const a=Math.max(0,255-(magenta-38)*5.5);p[i+3]=Math.min(p[i+3],a)}}
      ctx.putImageData(frame,0,0);const blob=await new Promise(res=>canvas.toBlob(res,'image/webp',.94));if(!blob)throw new Error('alpha export failed');
      img.src=URL.createObjectURL(blob);img.dataset.dealerAlpha='done';
    }catch(err){img.dataset.dealerAlpha='failed';console.warn('Dealer alpha preparation failed',err)}
  }
  const scan=()=>document.querySelectorAll('#orbit-stage .orbit-dish img').forEach(keyImage);
  const wait=()=>{const stage=document.getElementById('orbit-stage');if(!stage){setTimeout(wait,120);return}scan();new MutationObserver(scan).observe(stage,{childList:true,subtree:true});setInterval(scan,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(wait,260));else setTimeout(wait,260);
})();
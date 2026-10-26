/* ============ v61.72 (خواسته صاحب اپ): PDF واقعی A5 روی آیفون ============
   سافاری آیفون اندازه کاغذ @page را نادیده می‌گیرد و چاپ / ذخیره PDF همیشه A4 یا Letter درمی‌آید.
   پس خود برنامه فایل PDF با صفحه دقیق A5 می‌سازد (بدون کتابخانه بیرونی):
   ۱) برگه در یک iframe پنهان با عرض دقیق محتوای A5 چیده می‌شود (فونت‌ها و عکس‌ها بار می‌شوند)؛
   ۲) جای شکستن صفحه‌ها فقط زیر ردیف‌ها و بلوک‌ها پیدا می‌شود (ردیفی نصف نمی‌شود؛ هر بخش گزارش صفحه تازه)؛
   ۳) هر صفحه با SVG foreignObject روی canvas کشیده می‌شود (فونت‌ها و لوگو داخلش data: هستند) و JPEG می‌شود؛
   ۴) PDF با صفحه‌های A5 ساخته می‌شود. «چاپ / ذخیره PDF» روی آیفون همین فایل را در منوی اشتراک می‌دهد
      (چاپ، ذخیره در Files، تلگرام…) و چاپگر کاغذ A5 می‌گیرد. اگر ساختن نشد، روش قبلی (پنجره چاپ). */
const PDFK={html:'',p:null,file:null};
const pdfDataUrl=async u=>{const r=await fetch(u);if(!r.ok)throw new Error('fetch '+u);const b=await r.blob();return await new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=rej;f.readAsDataURL(b)})};
const pdfEsc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
async function pdfMake(html,title){
  const land=/@page\{size:A5 landscape/.test(html)||!/@page\{size:A5/.test(html),mmW=land?210:148,mmH=land?148:210,mg=8,PX=96/25.4,
    W=Math.round((mmW-2*mg)*PX),H=Math.round((mmH-2*mg)*PX),S=3,base=location.href.replace(/[^/]*$/,'');
  const f=document.createElement('iframe');f.setAttribute('aria-hidden','true');f.style.cssText=`position:fixed;left:-20000px;top:0;width:${W}px;height:${H}px;border:0;opacity:0;pointer-events:none`;document.body.appendChild(f);
  try{
    await new Promise(r=>{f.onload=r;f.srcdoc=html.replace(/<head>/i,'<head><base href="'+base+'">').replace(/<button class="pb"[^>]*>.*?<\/button>/,'')});
    const d=f.contentDocument;
    await Promise.all([d.fonts&&d.fonts.ready,...[...d.images].filter(i=>!i.complete).map(i=>new Promise(r=>{i.onload=i.onerror=r}))]);
    await new Promise(r=>setTimeout(r,120));
    /* سبک‌ها: @page و دکمه‌ها کنار؛ همه url(...)ها (فونت‌ها، لوگو) data: می‌شوند تا داخل SVG کار کنند */
    let css=[...d.querySelectorAll('style')].map(s=>s.textContent).join('\n').replace(/@page\{[^}]*\}/g,'').replace(/@media print\{/g,'@media all{');
    const U=[...new Set([...css.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)].map(m=>m[2]).filter(u=>!/^data:/.test(u)))];
    for(const u of U){try{const du=await pdfDataUrl(new URL(u,base).href);css=css.split(u).join(du)}catch(e){}}
    const B=d.body.cloneNode(true);B.querySelectorAll('script,.pb,.pb0').forEach(n=>n.remove());
    for(const im of B.querySelectorAll('img')){const s=im.getAttribute('src');if(s&&!/^data:/.test(s)){try{im.setAttribute('src',await pdfDataUrl(new URL(s,base).href))}catch(e){}}}
    /* جای شکستن صفحه: زیر هر ردیف جدول و هر بلوک؛ بخش‌های گزارش (section.pg) همیشه صفحه تازه */
    const top=y=>Math.round(y),T=d.body.getBoundingClientRect().top,total=Math.ceil(Math.max(d.body.scrollHeight,d.body.getBoundingClientRect().bottom-T));/* نه ارتفاع iframe */
    const cand=new Set([total]),force=new Set();
    d.querySelectorAll('tr,.hd,.mt,h4,.sm,.bl,.sg,.ft,.ed,.top,h1,h2,.sub,.bar,.kp,.sign,.foot,.rc figure,.pg>*,.pg').forEach(el=>{const r=el.getBoundingClientRect();cand.add(top(r.bottom-T))});
    d.querySelectorAll('section.pg').forEach(el=>{const r=el.getBoundingClientRect();force.add(top(r.bottom-T))});
    const C=[...cand].filter(y=>y>0).sort((a,b)=>a-b),pages=[];let y0=0;
    while(y0<total-30){/* انتهای خالی (حاشیه پایین بخش) صفحه سفید نمی‌سازد */let y1=y0+H;const fz=[...force].filter(y=>y>y0+4&&y<=y1).sort((a,b)=>a-b)[0];if(fz)y1=fz;else if(y1<total){const ok=C.filter(y=>y>y0+40&&y<=y1);y1=ok.length?ok[ok.length-1]:y1}else y1=total;pages.push([y0,Math.min(y1,total)]);y0=y1;
      /* فاصله سفید بالای صفحه تازه (حاشیه section) را رد کن */}
    const xml=new XMLSerializer().serializeToString(B).replace(/^<body/,'<div class="__pb"').replace(/<\/body>$/,'</div>');
    /* body به div تبدیل شد؛ قاعده‌های body (فونت، رنگ، اندازه) روی همان div بنشینند */css=css.replace(/(^|[}\s,;])(html|body)(?=\s*[{,.:#\[\s])/g,'$1.__pb');
    /* یک SVG برای کل برگه (فونت‌ها یک بار بار می‌شوند)، بعد هر صفحه برشی از همان */
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${total}"><foreignObject x="0" y="0" width="${W}" height="${total}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${W}px;margin:0;background:#fff;direction:rtl"><style>${pdfEsc(css)}</style>${xml}</div></foreignObject></svg>`;
    const im=new Image();await new Promise((res,rej)=>{im.onload=res;im.onerror=()=>rej(new Error('svg'));im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
    /* فونت‌های داخل SVG کمی بعد از onload آماده می‌شوند (سافاری و کروم)؛ اگر زود کشیده شود با فونت پیش‌فرض کش می‌شود */
    {const c0=document.createElement('canvas');c0.width=c0.height=4;const x0=c0.getContext('2d');await new Promise(r=>setTimeout(r,700));x0.drawImage(im,0,0,4,4);await new Promise(r=>setTimeout(r,150))}
    const imgs=[];
    for(const [a,b] of pages){const hp=Math.max(1,b-a),cv=document.createElement('canvas');cv.width=W*S;cv.height=hp*S;const x=cv.getContext('2d');
      for(let k=0;k<2;k++){x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(im,0,a,W,hp,0,0,cv.width,cv.height);if(!k)await new Promise(r=>setTimeout(r,40))}
      const j=cv.toDataURL('image/jpeg',.9);imgs.push({b:Uint8Array.from(atob(j.split(',')[1]),c=>c.charCodeAt(0)),w:cv.width,h:cv.height,hp})}
    const pt=v=>v*72/25.4,PW=pt(mmW),PH=pt(mmH),M=pt(mg),IW=PW-2*M;
    const blob=pdfBuild(imgs.map(o=>({...o,iw:IW,ih:IW*o.hp/W})),PW,PH,M);
    return new File([blob],String(title||'motalla').replace(/[\\/:*?"<>|]/g,'-')+'.pdf',{type:'application/pdf'})}
  finally{f.remove()}}
/* PDF ساده: هر صفحه A5 یک عکس JPEG (DCTDecode) بالای صفحه با حاشیه */
function pdfBuild(P,PW,PH,M){const enc=new TextEncoder(),parts=[],off=[];let len=0;const put=x=>{const u=typeof x==='string'?enc.encode(x):x;parts.push(u);len+=u.length};
  const obj=(n,body)=>{off[n]=len;put(n+' 0 obj\n');if(Array.isArray(body))body.forEach(put);else put(body);put('\nendobj\n')};
  const n=P.length,f=v=>(Math.round(v*100)/100).toString();put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,`<< /Type /Pages /Count ${n} /Kids [${P.map((_,i)=>(3+i*3)+' 0 R').join(' ')}] >>`);
  P.forEach((p,i)=>{const pg=3+i*3,ct=pg+1,im=pg+2,s=`q ${f(p.iw)} 0 0 ${f(p.ih)} ${f(M)} ${f(PH-M-p.ih)} cm /Im0 Do Q`;
    obj(pg,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(PW)} ${f(PH)}] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${ct} 0 R >>`);
    obj(ct,[`<< /Length ${s.length} >>\nstream\n`,s,'\nendstream']);
    obj(im,[`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.b.length} >>\nstream\n`,p.b,'\nendstream'])});
  const N=3+n*3,xr=len;put(`xref\n0 ${N}\n0000000000 65535 f \n`);for(let i=1;i<N;i++)put(String(off[i]).padStart(10,'0')+' 00000 n \n');
  put(`trailer\n<< /Size ${N} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);return new Blob(parts,{type:'application/pdf'})}
const pdfTitle=h=>(String(h).match(/<title>([^<]*)<\/title>/)||[])[1]||'مطلا';
/* از openPrint: وقتی پیش‌نمایش آماده شد، روی آیفون PDF هم ساخته می‌شود (دکمه‌ها تا آماده شدنش صبر می‌کنند) */
function pdfPrep(html){PDFK.html=html;PDFK.file=null;PDFK.p=pdfMake(html,pdfTitle(html).replace(/&[^;]+;/g,'')).then(fl=>{if(PDFK.html===html)PDFK.file=fl;return fl}).catch(e=>{if(PDFK.html===html)PDFK.file=false;return false});return PDFK.p}
/* «چاپ / ذخیره PDF» و «اشتراک» روی آیفون: همان لحظه منوی اشتراک با فایل PDF A5 (چاپ هم داخلش هست) */
function pdfShare(){const fl=PDFK.file;if(!fl||!navigator.canShare||!navigator.canShare({files:[fl]}))return false;
  navigator.share({files:[fl],title:fl.name.replace(/\.pdf$/,'')}).catch(e=>{if(e&&e.name!=='AbortError')toast('اشتراک PDF انجام نشد',true)});return true}

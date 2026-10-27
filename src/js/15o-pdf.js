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
  /* اندازه کاغذ از @page برگه: A4 (صورتحساب) یا A5، عمودی یا افقی؛ بی @page = A5 افقی */const pz=(html.match(/@page\{size:(A4|A5)( landscape)?/)||[,'A5',' landscape']),a4=pz[1]==='A4',land=!!pz[2],sw=a4?210:148,sh=a4?297:210,mmW=land?sh:sw,mmH=land?sw:sh,mg=a4?10:8,PX=96/25.4,
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
    /* v61.81 (خواسته صاحب اپ: «هر صفحه درست از وسط کات بشه که جزئیات از بین نره»):
       قبلاً کل برگه یک تصویر بود و از جاهایی که در iframe اندازه گرفته شده بود بریده می‌شد؛ روی آیفون چیدمان داخل SVG چند پیکسل
       در هر ردیف با iframe فرق دارد و این فرق تا ته صفحه جمع می‌شد → برش از وسط ردیف. حالا هر صفحه جدا ساخته می‌شود:
       ۱) جای برش فقط زیر ردیف‌ها و بلوک‌ها (و نه وسط بلوکی که break-inside:avoid دارد، نه زیر عنوانی که break-after:avoid دارد)،
          با ۱۶ پیکسل جای خالی ته صفحه برای همان اختلاف کوچک؛
       ۲) برای هر صفحه، عنصرهایی که کاملاً بیرون از آن صفحه‌اند پنهان می‌شوند (سرستون جدول همیشه می‌ماند و در هر صفحه تکرار می‌شود)
          و صفحه از بالا چیده و کشیده می‌شود؛ پس هیچ ردیفی نصف نمی‌شود و اختلاف از صفحه‌ای به صفحه بعد نمی‌رود. */
    const T=d.body.getBoundingClientRect().top,total=Math.ceil(Math.max(d.body.scrollHeight,d.body.getBoundingClientRect().bottom-T)),HU=H-16;
    const EL=[...d.body.querySelectorAll('*')],RC=EL.map(el=>{const r=el.getBoundingClientRect(),cs=d.defaultView.getComputedStyle(el);return {t:r.top-T,b:r.bottom-T,h:r.height,abs:/absolute|fixed/.test(cs.position),th:el.closest('thead')?el.closest('table'):null,av:(cs.breakInside==='avoid'||cs.pageBreakInside==='avoid'),aa:(cs.breakAfter==='avoid'||cs.pageBreakAfter==='avoid')}});
    const cand=new Set([total]),force=new Set(),bad=[];
    EL.forEach((el,i)=>{const r=RC[i];if(!r.h||r.abs)return;if(el.matches('tr,.hd,.mt,h4,.sm,.bl,.sg,.ft,.ed,.top,h1,h2,.sub,.bar,.kp,.sign,.foot,.rc figure,.pg>*,.pg,.stbr,tbody,li,p')&&!r.aa)cand.add(Math.round(r.b));if(r.av&&r.h<HU*.9)bad.push([r.t+2,r.b-2])});
    d.querySelectorAll('section.pg').forEach(el=>{const r=el.getBoundingClientRect();force.add(Math.round(r.bottom-T))});
    const C=[...cand].filter(y=>y>0&&!bad.some(([a,b])=>y>a&&y<b)).sort((a,b)=>a-b),pages=[];let y0=0;
    /* ارتفاع سرستون تکرارشده جدولی که از صفحه قبل ادامه دارد (از جای صفحه کم می‌شود) */
    const headH=y=>{let h=0;d.querySelectorAll('thead').forEach(th=>{const tb=th.closest('table').getBoundingClientRect(),r=th.getBoundingClientRect();if(tb.top-T<y-1&&tb.bottom-T>y+1&&r.bottom-T<=y+1)h=Math.max(h,r.height)});return h};
    while(y0<total-30){const lim=y0+HU-(y0?headH(y0):0);let y1;const fz=[...force].filter(y=>y>y0+4&&y<=lim).sort((a,b)=>a-b)[0];
      if(fz)y1=fz;else if(lim<total){const ok=C.filter(y=>y>y0+40&&y<=lim);y1=ok.length?ok[ok.length-1]:lim}else y1=total;
      pages.push([y0,Math.min(y1,total)]);y0=y1;
      /* فاصله سفید پیش از بخش تازه (حاشیه section) صفحه جدا نمی‌سازد */const nx=EL.map((e,i)=>RC[i]).filter(r=>r.h&&!r.abs&&r.t>=y0-1).reduce((m,r)=>Math.min(m,r.t),Infinity);if(isFinite(nx)&&nx>y0&&nx-y0<H*.5&&![...force].some(y=>y>y0&&y<nx))y0=Math.floor(nx)}
    /* body به div تبدیل می‌شود؛ قاعده‌های body (فونت، رنگ، اندازه) روی همان div بنشینند */css=css.replace(/(^|[}\s,;])(html|body)(?=\s*[{,.:#\[\s])/g,'$1.__pb');
    const cssE=pdfEsc(css),imgs=[];
    const draw=async(svg,hp)=>{const im=new Image();await new Promise((res,rej)=>{im.onload=res;im.onerror=()=>rej(new Error('svg'));im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
      /* فونت‌های داخل SVG کمی بعد از onload آماده می‌شوند (سافاری و کروم)؛ اگر زود کشیده شود با فونت پیش‌فرض کش می‌شود */
      {const c0=document.createElement('canvas');c0.width=c0.height=4;c0.getContext('2d').drawImage(im,0,0,4,4);await new Promise(r=>setTimeout(r,imgs.length?250:700))}
      const cv=document.createElement('canvas');cv.width=W*S;cv.height=hp*S;const x=cv.getContext('2d');
      for(let k=0;k<2;k++){x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(im,0,0,W,hp,0,0,cv.width,cv.height);if(!k)await new Promise(r=>setTimeout(r,60))}
      const j=cv.toDataURL('image/jpeg',.9);imgs.push({b:Uint8Array.from(atob(j.split(',')[1]),c=>c.charCodeAt(0)),w:cv.width,h:cv.height,hp})};
    for(const [a,b] of pages){const P=B.cloneNode(true),E2=[...P.querySelectorAll('*')];
      /* همان ترتیب عنصرها در iframe و در نسخه (اسکریپت‌ها و دکمه‌ها قبلاً از نسخه برداشته شده‌اند؛ با ترتیب نسبی تطبیق داده می‌شود) */
      let k=0;EL.forEach((el,i)=>{if(el.matches('script,.pb,.pb0')||el.closest('.pb,.pb0'))return;const e2=E2[k++];if(!e2)return;const r=RC[i];if(!r.h||r.abs)return;
        if(r.th){const tr=r.th.getBoundingClientRect();if(tr.bottom-T>a+1&&tr.top-T<b-1)return}/* سرستون جدولی که در این صفحه هست */
        if(r.b<=a+1||r.t>=b-1)e2.style.setProperty('display','none','important')});
      const xml=new XMLSerializer().serializeToString(P).replace(/^<body/,'<div class="__pb"').replace(/<\/body>$/,'</div>');
      const hp=Math.min(H,Math.max(1,Math.ceil(b-a+(a?headH(a):0)+8)));
      await draw(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${hp}"><foreignObject x="0" y="0" width="${W}" height="${hp}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${W}px;margin:0;background:#fff;direction:rtl"><style>${cssE}</style>${xml}</div></foreignObject></svg>`,hp)}
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

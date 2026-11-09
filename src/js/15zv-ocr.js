/* ---- v85.0 خواندن مبلغ از عکس رسید کارتخوان ----
   خواسته صاحب اپ: «مبلغ را از عکس رسید کارتخوان بخواند». موتور tesseract.js روی خود گوشی (فایل‌ها از /ocr/ همین سرور، نه CDN؛
   بار اول ~۷ مگابایت، بعد از کش). فقط وقتی عکس به ردیف کارتخوان اضافه می‌شود (پرداخت m:'pos'، کارتخوان دستی بانک bkx bpos،
   یا فرم کارتخوان پنجره تسویه) اجرا می‌شود. عدد خوانده‌شده پیشنهاد است: اگر مبلغ خالی یا همان پیش‌فرض است جایگزین می‌شود،
   وگرنه پیام با دکمه «جایگزین» می‌آید. رسیدها معمولاً ریال‌اند → تومان (÷۱۰) مگر «تومان» نوشته شده باشد. */
let OCRW=null,OCRB=0;
const ocrUrl=f=>new URL('ocr/'+f,location.href).href;
function ocrLib(){if(window.Tesseract)return Promise.resolve();return new Promise((res,rej)=>{const s=document.createElement('script');s.src=ocrUrl('tesseract.min.js');s.onload=()=>res();s.onerror=()=>rej(new Error('lib'));document.head.appendChild(s)})}
async function ocrWorker(){if(OCRW)return OCRW;await ocrLib();
  OCRW=window.Tesseract.createWorker(['eng','fas'],1,{workerPath:ocrUrl('worker.min.js'),corePath:ocrUrl('tesseract-core-lstm.wasm.js'),langPath:new URL('ocr',location.href).href,workerBlobURL:false,gzip:true});
  try{return await OCRW}catch(e){OCRW=null;throw e}}
/* متن رسید → مبلغ به تومان. امتیاز: سه‌رقمی جداشده (۱,۲۳۴,۰۰۰) + کلمه مبلغ/ریال/Amount در همان خط؛ شماره کارت، تاریخ، ساعت،
   شماره پایانه/پیگیری (رقم‌های بی‌جداکننده) کنار گذاشته می‌شوند */
function ocrPick(text){const T=toEn(String(text||'')).replace(/[٬،]/g,',');const L=T.split(/\n+/);const C=[];
  const isRial=/ریال|rial|irr/i.test(T),isTom=/تومان|toman/i.test(T)&&!isRial;
  L.forEach(l=>{if(/\*{2,}|x{4,}/i.test(l))return;const kw=/مبلغ|amount|ریال|rial|تومان|خرید|purchase|sale|جمع|total/i.test(l);
    const cl=l.replace(/\d{2,4}[\/\-.]\d{1,2}[\/\-.]\d{1,4}/g,' ').replace(/\d{1,2}:\d{2}(:\d{2})?/g,' ');
    for(const m of cl.matchAll(/\d{1,3}(?:[,.]\s?\d{3})+|\d{4,}/g)){const raw=m[0],grp=/[,.]/.test(raw),v=+raw.replace(/\D/g,'');if(!v)continue;const dg=String(v).length;
      if(!grp&&!kw)continue;if(dg>12||dg<4)continue;C.push({v,s:(grp?3:0)+(kw?5:0)+(grp&&/0{3}$/.test(String(v))?1:0)})}});
  if(!C.length)return 0;C.sort((a,b)=>b.s-a.s||b.v-a.v);const v=C[0].v;return isTom?v:Math.round(v/10)}
/* پیش‌پردازش: بزرگ‌نمایی عکس کوچک، خاکستری، سپس سیاه‌وسفید با آستانه محلی (میانگین پنجره با جدول جمع تجمعی):
   پس‌زمینه خاکستری/کرم رسید حرارتی و سایه عکس → سفید، نوشته → سیاه (Tesseract پس‌زمینه خاکستری را «تصویر» می‌گیرد و نمی‌خواند) */
function ocrPrep(src){return new Promise(res=>{const im=new Image();im.onload=()=>{try{const mx=Math.max(im.width,im.height),sc=mx<1600?Math.min(4,1600/mx):Math.min(1,2400/mx),W=Math.round(im.width*sc),H=Math.round(im.height*sc),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.imageSmoothingQuality='high';g.drawImage(im,0,0,W,H);
    const d=g.getImageData(0,0,W,H),p=d.data,Y=new Float64Array(W*H);for(let i=0,k=0;k<Y.length;i+=4,k++)Y[k]=(p[i]*299+p[i+1]*587+p[i+2]*114)/1000;
    const S=new Float64Array((W+1)*(H+1));for(let y=0;y<H;y++){let row=0;for(let x=0;x<W;x++){row+=Y[y*W+x];S[(y+1)*(W+1)+x+1]=S[y*(W+1)+x+1]+row}}
    const r=Math.max(8,Math.round(Math.min(W,H)/40)),T=.86;
    for(let y=0;y<H;y++){const y0=Math.max(0,y-r),y1=Math.min(H,y+r+1);for(let x=0;x<W;x++){const x0=Math.max(0,x-r),x1=Math.min(W,x+r+1),n=(y1-y0)*(x1-x0),m=(S[y1*(W+1)+x1]-S[y0*(W+1)+x1]-S[y1*(W+1)+x0]+S[y0*(W+1)+x0])/n,k=y*W+x,v=Y[k]<m*T?0:255,i=k*4;p[i]=p[i+1]=p[i+2]=v;p[i+3]=255}}
    g.putImageData(d,0,0);res(c.toDataURL('image/png'))}catch(_){res(src)}};im.onerror=()=>res(src);im.src=src})}
async function ocrRead(src){const w=await ocrWorker();let a=0;try{const r=await w.recognize(await ocrPrep(src));a=ocrPick(r&&r.data&&r.data.text)}catch(_){}if(a)return a;const r2=await w.recognize(src);return ocrPick(r2&&r2.data&&r2.data.text)}
/* هدف عکس: ردیف کارتخوان؟ */
const ocrFor=x=>!!x&&(x.m==='pos'||(x.m==='bkx'&&x.k==='bpos'));
async function ocrRun(x,dataUrl){if(!ocrFor(x)||OCRB)return;OCRB=1;toast('در حال خواندن مبلغ از رسید…');
  try{const a=await ocrRead(dataUrl);
    if(!a){toast('مبلغ از عکس خوانده نشد؛ دستی بزنید',true);return}
    const isCK=typeof CK!=='undefined'&&x===CK,cur0=+x.amount||0,pre=isCK?ckLeft():0;
    const put=()=>{if(isCK){ckRead();CK.amount=a;ckRe('ckA')}else{if(typeof qaRead==='function')qaRead();x.amount=a;svKeep();if(cur==='sell'&&typeof qaRe==='function')qaRe()}};
    if(!cur0||cur0===pre){put();toast('مبلغ از رسید خوانده شد: '+fmt(a)+' تومان — بررسی کنید')}
    else if(cur0===a)toast('مبلغ رسید با مبلغ واردشده یکی است ('+fmt(a)+' تومان)');
    else toast('مبلغ رسید '+fmt(a)+' تومان است (واردشده '+fmt(cur0)+')',false,'جایگزین',put)}
  catch(e){toast('خواندن عکس ممکن نشد (اینترنت یا حافظه)',true)}finally{OCRB=0}}

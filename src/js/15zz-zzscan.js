/* ---------- v103.3 «ثبت با عکس» ----------
   صاحب اپ: «طلایی که می‌فروشیم را از روی ترازو عکس بگیرم؛ با قیمت لحظه، سود و اجرت بفروشم و وزن و قیمت خودکار با یک عکس بیاید؛
   رسیدهای بانکی و واریزی‌های بانکی هم همین‌طور ثبت بخورد».
   اصل‌ها: (۱) خواندن عکس فقط روی همین گوشی است (موتور ترازو sgsRead در 15zz-zzs1، رسید rcp… در 15zz-zzs2 با همان tesseract خود برنامه) — عکس جایی فرستاده نمی‌شود؛
   (۲) هیچ چیزی خودکار ثبت نمی‌شود: عدد خوانده‌شده کنار خود عکس نشان داده می‌شود، قابل ویرایش است و فقط فرم‌های همیشگی برنامه را پُر می‌کند
       (ردیف سند با وزن آماده، پنجره «واریز بانکی» با پیگیری و عکس)؛ ثبت نهایی با همان دکمه‌های همیشگی است؛
   (۳) اگر عدد با اطمینان خوانده نشد، همین را می‌گوید و جای عدد خالی می‌ماند (عدد حدسی ساخته نمی‌شود). */
let SCN=null;
const scDecGet=()=>{const v=ls.get('m_sc_dec','a');return v===2||v===3||v===1?v:'a'};
const scKinds=()=>['آبشده','متفرقه',...goodsList().filter(k=>!['آبشده','متفرقه','سکه','سکه پارسیان'].includes(k)&&!XA[k]&&gCat(k)!=='سایر'&&gCat(k)!=='سکه'&&gCat(k)!=='ارز')].slice(0,14);
const scNum=v=>{const n=parseFloat(decIn(String(v==null?'':v)));return isFinite(n)?n:0};
const scIn=k=>picCam()?`<label class="scbt">${ic('cam')}<span>دوربین</span><input type="file" accept="image/*" capture="environment" data-sc="${k}"></label><label class="scbt g">${ic('gal')}<span>گالری</span><input type="file" accept="image/*" data-sc="${k}"></label>`
  :`<label class="scbt">${ic('cam')}<span>گرفتن یا انتخاب عکس</span><input type="file" accept="image/*" data-sc="${k}"></label>`;
const scHead=(t,s)=>`<div class="sh-h"><div><b>${t}</b><small class="shsub">${s}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>`;
/* پیش‌فرض‌های ردیف برای نوع کالا و کار */
function scDefs(){const S=SCN,k=S.kd,sell=S.job==='sell';S.ay=sell?750:xrAy('buy',false,k==='آبشده'||k==='متفرقه'?k:'');
  if(!sell||k==='آبشده'){S.ajP='';S.ajT=0;S.pp=sell?PROFIT_AB:''}else if(k==='متفرقه'){S.ajP='';S.ajT=0;S.pp=PROFIT_DEF()}
  else{const f=gdFee(k),s=f&&+f.s||0;S.ajP=s>0&&s<=100?s:(s?'':(+ls.get('m_aj',0)||''));S.ajT=s>100?s:0;S.pp=PROFIT_DEF()}}
function scCalc(){const S=SCN,w=scNum(S.w),rate=+rtRef0()||0;if(!(w>0)||!rate)return {w,rate,tot:0};
  if(S.job!=='sell'){const tot=Math.round(w*rate*(+S.ay||750)/750);return {w,rate,tot,gold:tot,aj:0,pr:0}}
  let C=null;try{C=itCalc({k:S.kd,w,ay:750,ajP:+S.ajP||0,ajT:+S.ajT||0,pp:+S.pp||0,...(S.kd==='آبشده'?{ab:1}:{})},rate,false)}catch(_){}
  return C?{w,rate,tot:+C.tot||0,gold:+C.gold||0,aj:+C.aj||0,pr:+C.pr||0}:{w,rate,tot:0}}
function scResW(){const S=SCN,C=scCalc(),sell=S.job==='sell';
  if(!(C.w>0))return `<div class="scrs n"><i>${ic('info')}</i><span><b>وزن را بزنید</b><small>عدد ترازو را در کادر بالا بنویسید یا درست کنید</small></span></div>`;
  if(!C.rate)return `<div class="scrs n"><i>${ic('info')}</i><span><b>${wFmt(C.w)} گرم</b><small>قیمت روز در دست نیست؛ در سند، مظنه را بزنید تا مبلغ حساب شود</small></span></div>`;
  return `<div class="scrs ${sell?'r':'b'}"><i>${ic(sell?'dSell':'down')}</i><span><b>${sell?'قیمت فروش':'مبلغ خرید'}</b><small>هر گرم ۱۸: ${fmt(C.rate)}${sell?` · طلا ${fmt(Math.round(C.gold))}${C.aj?' · اجرت '+fmt(Math.round(C.aj)):''}${C.pr?' · سود '+fmt(Math.round(C.pr)):''}`:` · عیار ${toFa(S.ay)}`}</small></span><em><b id="scTot">${fmt(Math.round(C.tot))}</b><u>تومان</u></em></div>`}
const scBoxH=b=>{const S=SCN;if(!b||!S||!S.iw||!S.ih)return '';const P=(v,t)=>Math.max(0,Math.min(100,v/t*100)).toFixed(2);return `<i class="scbx" style="left:${P(b.x,S.iw)}%;top:${P(b.y,S.ih)}%;width:${P(b.w,S.iw)}%;height:${P(b.h,S.ih)}%"></i>`};
function scConfH(R){const S=SCN,rd=S&&S.wSrc==='ocr';
  return `<span class="sccf ${rd?'md':'no'}">${ic(rd?'check':'info')}${rd?'آزمایشی · حتماً با عکس مقایسه کنید':'خوانده نشد · خودتان بنویسید'}</span>`}
function scHTML(){const S=SCN;if(!S)return '';
  if(S.st==='pick')return scHead(S.doc?'ثبت با عکس در همین سند':'ثبت با عکس',S.doc?'ردیف خوانده‌شده در همین سند می‌نشیند':'عکس بگیرید؛ عددها خودکار خوانده می‌شود')+`<div class="scw">
  <div class="sct w"><i>${ic('ring')}</i><span><b>عکس ترازو</b><small>وزن از صفحه ترازو خوانده می‌شود و ردیف فروش یا خرید با قیمت لحظه ساخته می‌شود</small></span><div class="scbs">${scIn('w')}</div></div>
  <div class="sct r"><i>${ic('card')}</i><span><b>عکس رسید بانکی</b><small>رسید کارتخوان، حواله یا واریز: مبلغ و پیگیری خوانده می‌شود و سند دریافت یا تأیید واریز آماده می‌شود</small></span><div class="scbs">${scIn('r')}</div></div>
  <p class="scnt">${ic('padlock')}<span>عکس فقط روی همین گوشی خوانده می‌شود و جایی فرستاده نمی‌شود. پیش از هر ثبت، عدد را خودتان می‌بینید و تأیید می‌کنید. خواندن وزن ترازو هنوز آزمایشی است.</span></p></div>`;
  if(S.st==='busy')return scHead(S.k==='w'?'عکس ترازو':'عکس رسید','در حال خواندن…')+`<div class="scw"><div class="scim bz"><img src="${S.img}" alt=""><i class="scln"></i></div><div class="scbz"><span class="scsp"></span><b>${S.k==='w'?'عدد ترازو خوانده می‌شود…':'نوشته‌های رسید خوانده می‌شود…'}</b><small>${S.k==='w'?'کمتر از چند ثانیه':'بار اول کمی بیشتر طول می‌کشد'}</small></div></div>`;
  if(S.k==='w'){const R=S.res,K=scKinds(),sell=S.job==='sell',gd=S.kd!=='آبشده'&&S.kd!=='متفرقه',dc=scDecGet();
    const alts=(R&&R.alts||[]).filter(a=>a&&a.text&&a.text!==(R.text||'')).slice(0,3);
    return scHead('وزن از ترازو','عدد را با عکس مقایسه کنید')+`<div class="scw">
  <div class="scim fr"><span class="scimw" id="scFr"><img src="${S.img}" alt="عکس ترازو" draggable="false">${scBoxH(S.hb||(R&&R.box))}</span>${scConfH(R)}</div>
  <p class="scnt fr">${ic('edit')}<span>اگر عدد درست خوانده نشد، روی عکس <b>دور عدد ترازو را با انگشت بکشید</b> تا فقط همان‌جا خوانده شود؛ یا وزن را خودتان بنویسید.</span></p>
  <label class="scbig" for="scW"><small>وزن · گرم</small><input id="scW" inputmode="decimal" autocomplete="off" enterkeyhint="done" dir="ltr" value="${esc(S.w||'')}" placeholder="۰٫۰۰۰"></label>
  ${S.wSrc==='ocr'?`<button type="button" class="scok${S.wOk?' on':''}" data-act="scWOk"><i>${ic('check')}</i><span>عدد را با عکس ترازو مقایسه کردم؛ درست است</span></button>`:''}
  <div id="scRs">${scResW()}</div>
  ${alts.length?`<div class="scch al"><small>شاید:</small>${alts.map(a=>`<button type="button" data-act="scAlt" data-v="${esc(a.text)}">${toFa(a.text)}</button>`).join('')}</div>`:''}
  <div class="scsg"><button type="button" class="${sell?'on r':''}" data-act="scJob" data-v="sell">فروش به مشتری</button><button type="button" class="${sell?'':'on b'}" data-act="scJob" data-v="buy">خرید از مشتری</button></div>
  <div class="scch kd" id="scKd">${K.map(k=>`<button type="button" class="${k===S.kd?'on':''}" data-act="scKd" data-v="${esc(k)}">${esc(k)}</button>`).join('')}</div>
  ${sell?`<div class="scfs">${gd?`<label><small>اجرت ٪</small><input id="scAj" inputmode="decimal" dir="ltr" value="${esc(S.ajP===''?'':String(S.ajP))}" placeholder="۰"></label>`:''}<label><small>سود ٪</small><input id="scPp" inputmode="decimal" dir="ltr" value="${esc(S.pp===''?'':String(S.pp))}" placeholder="۰"></label></div>`:''}
  <div class="scch dc"><small>ترازوی شما چند رقم اعشار دارد؟</small>${[['a','خودکار'],[2,'۲ رقم'],[3,'۳ رقم']].map(([v,l])=>`<button type="button" class="${String(dc)===String(v)?'on':''}" data-act="scDec" data-v="${v}">${l}</button>`).join('')}</div>
  <button class="xgo" data-act="scDoc">${ic('check')} ساخت سند</button>
  <button class="lnk" data-act="scBack">بازگشت به انتخاب عکس</button></div>`}
  return scRcpHTML()}
function scPaint(){const r=$('scRs');if(!r)return;if(typeof numMorph==='function')numMorph('#scRs',()=>{r.innerHTML=scResW()});else r.innerHTML=scResW()}
function scRe(){const s=$('sheet');if(!s||!SCN)return;s.innerHTML=scHTML();scBind()}
function scBind(){const W=$('scW');if(W){W.oninput=()=>{const p=W.selectionStart;W.value=toEn(W.value).replace(/[^\d.٫\/]/g,'').replace(/[٫\/]/g,'.');try{W.setSelectionRange(p,p)}catch(_){}SCN.w=W.value;if(SCN.wSrc==='ocr'){SCN.wSrc='man';const b=document.querySelector('#sheet .scok');if(b)b.remove();const c=document.querySelector('#sheet .sccf');if(c)c.remove()}scPaint()}}
  [['scAj','ajP'],['scPp','pp']].forEach(([id,k])=>{const e=$(id);if(e)e.oninput=()=>{e.value=toEn(e.value).replace(/[^\d.٫\/]/g,'').replace(/[٫\/]/g,'.');SCN[k]=e.value===''?'':scNum(e.value);scPaint()}});
  scFrBind();if(typeof scRcpBind==='function')scRcpBind()}
/* کشیدن کادر دور عدد روی عکس: انگشت پایین → کشیدن → رها = فقط همان تکه خوانده می‌شود */
function scFrBind(){const F=$('scFr');if(!F||F.dataset.b)return;F.dataset.b=1;let st=null,bx=null;const P=e=>{const r=F.getBoundingClientRect();return {x:Math.max(0,Math.min(r.width,e.clientX-r.left)),y:Math.max(0,Math.min(r.height,e.clientY-r.top)),r}};
  F.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});F.addEventListener('touchmove',e=>{if(st)e.preventDefault();e.stopPropagation()},{passive:false});
  F.addEventListener('pointerdown',e=>{if(e.button>0)return;st=P(e);F.querySelectorAll('.scbx').forEach(x=>x.remove());bx=document.createElement('i');bx.className='scbx dr';F.appendChild(bx);try{F.setPointerCapture(e.pointerId)}catch(_){}});
  F.addEventListener('pointermove',e=>{if(!st||!bx)return;const q=P(e),x=Math.min(st.x,q.x),y=Math.min(st.y,q.y);bx.style.cssText=`left:${x}px;top:${y}px;width:${Math.abs(q.x-st.x)}px;height:${Math.abs(q.y-st.y)}px`});
  const up=e=>{if(!st)return;const q=P(e),a=st;st=null;const w=Math.abs(q.x-a.x),h=Math.abs(q.y-a.y);if(w<18||h<10||!SCN||!SCN.iw){if(bx)bx.remove();bx=null;return}
    const kx=SCN.iw/q.r.width,ky=SCN.ih/q.r.height;scRun('w',SCN.img,{x:Math.round(Math.min(a.x,q.x)*kx),y:Math.round(Math.min(a.y,q.y)*ky),w:Math.round(w*kx),h:Math.round(h*ky)})};
  F.addEventListener('pointerup',up);F.addEventListener('pointercancel',()=>{st=null;if(bx)bx.remove();bx=null})}
/* v108.0 (صاحب اپ: «خرید و فروش و دریافت و پرداخت با عکس در خود سند»): از صفحه سند باز شود = ردیف در همین سند می‌نشیند (SCN.doc) */
ACT.scOpen=()=>{const doc=cur==='sell'&&!!sv;if(!doc&&!can('add')){toast('دسترسی «ثبت واریزی جدید» برای حساب شما فعال نیست',true);return}if(doc&&!can('debt')){toast('دسترسی سند برای حساب شما فعال نیست',true);return}SCN={st:'pick',doc};sheet(scHTML());scBind()};
ACT.scBack=()=>{SCN={st:'pick',doc:!!(SCN&&SCN.doc)};scRe()};
ACT.scAlt=d=>{SCN.w=String(d.v||'');SCN.wSrc='ocr';SCN.wOk=0;scRe()};
ACT.scWOk=()=>{if(!SCN)return;SCN.wOk=SCN.wOk?0:1;const b=document.querySelector('#sheet .scok');if(b)b.classList.toggle('on',!!SCN.wOk)};
ACT.scDec=d=>{const v=d.v==='a'?'a':+d.v;ls.set('m_sc_dec',v);if(SCN&&SCN.img&&SCN.k==='w'){scRun('w',SCN.img,SCN.hb);return}scRe()};
ACT.scJob=d=>{SCN.job=d.v==='buy'?'buy':'sell';scDefs();scRe()};
ACT.scKd=d=>{SCN.kd=String(d.v||'');ls.set('m_sc_kd',SCN.kd);scDefs();const y=$('scKd')?$('scKd').scrollLeft:0;scRe();if($('scKd'))$('scKd').scrollLeft=y};
/* خواندن عکس: همیشه با نتیجه برمی‌گردد (خوانده‌شده یا خوانده‌نشده)؛ خطای موتور = «خوانده نشد» */
async function scRun(k,img,hb){const K=scKinds(),k0=ls.get('m_sc_kd',''),same=SCN&&SCN.img===img;SCN={st:'busy',k,img,hb:hb||null,doc:!!(SCN&&SCN.doc),iw:same?SCN.iw:0,ih:same?SCN.ih:0,job:(SCN&&SCN.job)||'sell',kd:(SCN&&SCN.kd)||(K.includes(k0)?k0:K[0]),w:''};scDefs();const tok=SCN;scRe();
  if(!tok.iw)await new Promise(r=>{const im=new Image();im.onload=()=>{tok.iw=im.naturalWidth;tok.ih=im.naturalHeight;r()};im.onerror=()=>r();im.src=img});
  let R=null;try{if(k==='w'){{const dc=scDecGet();R=await scScale(img,{...(dc==='a'?{}:{decimals:dc}),...(hb?{hintBox:hb}:{})})}}else R=await scRcpRead(img)}catch(e){console.error(e);R=null}
  if(SCN!==tok)return;/* در این فاصله پنجره بسته یا عکس دیگری انتخاب شده */
  SCN.res=R;SCN.st='res';if(k==='w'){const good=!!(R&&R.ok&&R.text&&!R.negative&&+R.value>0&&+R.value<=3000);SCN.w=good?String(R.text):'';SCN.wSrc=good?'ocr':'man';SCN.wOk=0}else scRcpInit(R);scRe();
  if(k==='w'&&SCN.wSrc!=='ocr')setTimeout(()=>{const w=$('scW');if(w)w.focus()},350)}
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||!t.dataset||!t.dataset.sc)return;const f=(t.files||[])[0],k=t.dataset.sc;t.value='';if(!f||!SCN)return;
  let d='';try{d=await shrink(f)}catch(_){toast('این عکس باز نشد؛ عکس دیگری انتخاب کنید',true);return}scRun(k,d)});
/* ساخت سند: همان سند همیشگی باز می‌شود و ردیف با وزن (و عکس ترازو) آماده است؛ مشتری و ثبت نهایی در خود سند */
ACT.scDoc=async()=>{const S=SCN;if(!S)return;const w=scNum(S.w);if(!(w>0)){toast('وزن را بزنید',true);const e=$('scW');if(e)e.focus();return}
  if(w>3000){toast('وزن بیش از ۳ کیلو است؛ عدد را بررسی کنید',true);return}
  if(S.wSrc==='ocr'&&!S.wOk){toast('عدد از روی عکس خوانده شده؛ اول آن را با عکس ترازو مقایسه و تأیید کنید',true);const b=document.querySelector('#sheet .scok');if(b){b.scrollIntoView({block:'center',behavior:'smooth'});b.classList.add('nd');setTimeout(()=>b.classList.remove('nd'),900)}return}
  let key='';try{const k=newImgKey('xr');if(await imgPut(k,S.img))key=k}catch(_){}
  const sell=S.job==='sell',kd=S.kd,ph=key?{imgs:[key],img:key}:{},inDoc=S.doc&&cur==='sell'&&!!sv;SCN=null;closeSheet();if(!inDoc)ACT.svNew({fresh:1,...(sell?{}:{dk:'buy'})});
  setTimeout(()=>{if(cur!=='sell'||!sv)return;sv.qa.d=sell?'sell':'buy';sv.qa.s='';sv.qa.q='';
    if(sell){if(kd==='آبشده')ACT.dkF({id:'g:ab'});else ACT.qaK({k:kd});const a=sv.qa;a.w=String(w);if(kd!=='آبشده'&&kd!=='متفرقه'){a.ajP=S.ajP===''?'':+S.ajP||'';if(S.ajT)a.ajT=S.ajT}if(S.pp!=='')a.pp=+S.pp||0;Object.assign(a,ph);svKeep();qaRe()}
    else{if(!sv.rate){const r=+rtRef0()||0;if(r){sv.rate=r;sv.mz=mzOf(r)}}const x=xrNew('buy','gold',{cat:kd,ay:S.ay,fl:'gold',fd:'buy'});x.w=String(w);Object.assign(x,ph);xrStart(x)}
    toast(svCu()?'ردیف با وزن ترازو آماده است؛ بررسی و «افزودن» را بزنید':'ردیف با وزن ترازو آماده است؛ مشتری را انتخاب و بررسی کنید')},inDoc?60:160)};
/* ---------- رسید بانکی ---------- */
/* متن رسید با همان tesseract خود برنامه (ocrWorker/ocrPrep، 15zv) خوانده می‌شود؛ جداکردن مبلغ، پیگیری، تاریخ و بانک با rcpParse (15zz-zzs2).
   خروجی یکدست: {ok,amount (تومان),tn,date (ISO),time,bank,kind,conf,text} */
async function scRcpRead(img){const w=await ocrWorker();
  if(typeof rcpRead==='function'){let r=null;try{r=await rcpRead(img,w,{})}catch(_){r=null}if(r&&r.parsed)return scRcpMap(r.parsed,r.text||'')}
  let text='';try{const r=await w.recognize(await ocrPrep(img));text=(r&&r.data&&r.data.text)||''}catch(_){}
  let P=null;try{if(typeof rcpParse==='function')P=rcpParse(text)}catch(_){P=null}return scRcpMap(P||{},text)}
/* خروجی موتور رسید → شکل یکدست پنجره؛ اگر مبلغ پیدا نشد، مبلغ‌یاب قدیمی رسید کارتخوان (ocrPick) هم امتحان می‌شود */
function scRcpMap(P,text){const cf=P.conf||{},W=(P.warn||[]).join(' '),aOk=(+cf.amount||0)>=.85&&!/amount|unit/.test(W),tOk=(+cf.tn||0)>=.8,dOk=(+cf.date||0)>=.85;
  const o={ok:false,amount:aOk?Math.round(+P.amount||0):0,amountS:!aOk?Math.round(+P.amount||0):0,tn:tOk?String(P.tn||'').replace(/[^\dA-Za-z]/g,''):'',tnS:!tOk?String(P.tn||'').replace(/[^\dA-Za-z]/g,''):'',date:dOk&&/^\d{4}-\d\d-\d\d$/.test(P.date||'')?P.date:'',time:dOk?String(P.time||''):'',bank:String(P.bank||''),kind:String(P.kind||''),status:String(P.status||''),
    conf:+(P.conf&&P.conf.amount)||0,text:String(text||'')};
  if(!o.amount&&!o.amountS&&o.text){try{o.amountS=+ocrPick(o.text)||0}catch(_){}}
  if(!o.tn&&!o.tnS&&o.text){const T=toEn(o.text),m=T.match(/(?:پ[یي]گ[یي]ر[یي]|ارجاع|مرجع|رهگ[یي]ر[یي]|trace|ref(?:erence)?|rrn)[^\d\n]{0,18}(\d[\d\- ]{3,22}\d)/i);if(m)o.tnS=m[1].replace(/\D/g,'')}
  o.ok=o.amount>0;return o}
function scRcpInit(R){SCN.rc={amount:R&&R.amount||0,tn:R&&R.tn||'',date:R&&R.date||'',time:R&&R.time||'',bank:R&&R.bank||'',kind:R&&R.kind||'',status:R&&R.status||'',amountS:R&&R.amountS||0,tnS:R&&R.tnS||''}}
/* واریزی‌های ارسال‌شده به بانک که هنوز تأیید نشده‌اند و مبلغشان همین است */
function scDepMatch(a){a=Math.round(+a||0);if(!(a>0))return [];const out=[];for(const b of batches){if(!b||b.closed)continue;(b.items||[]).forEach((x,i)=>{if(!x||x.st==='ok'||x.st==='fail')return;if(Math.abs((+x.amount||0)-a)<1)out.push({b,i,x})})}return out.slice(0,6)}
function scRcpOpts(){const S=SCN,a=Math.round(scNum(S.rc.amount)),M=can('track')?scDepMatch(a):[];
  const o=(cls,ico,t,s,at)=>`<button type="button" class="scrs scro ${cls}" ${at}><i>${ic(ico)}</i><span><b>${t}</b><small>${s}</small></span>${ic('chev')}</button>`;
  if(!(a>0))return `<div class="scrs n"><i>${ic('info')}</i><span><b>مبلغ را بزنید</b><small>مبلغ رسید را در کادر بالا بنویسید یا درست کنید</small></span></div>`;
  return `<div class="scoh">با این رسید چه کنم؟</div>`+M.map(z=>o('g','check','تأیید واریز به «'+esc(z.x.name||'—')+'»','واریز بانکی ارسال‌شده'+(z.x.src?' از '+esc(z.x.src):'')+' · همین مبلغ · رسید و پیگیری روی آن می‌نشیند',`data-act="scDep" data-b="${z.b.id}" data-i="${z.i}"`)).join('')
   +o('b','down','دریافت از مشتری · حواله به بانک','سند دریافت با همین مبلغ، پیگیری و عکس رسید؛ مشتری و حساب بانک را در سند انتخاب کنید','data-act="scPay" data-m="hav" data-dir="in"')
   +o('g','card','دریافت با کارتخوان','رسید کارتخوان مغازه؛ حساب کارتخوان را در سند انتخاب کنید','data-act="scPay" data-m="pos" data-dir="in"')
   +o('r','out','پرداخت به مشتری · حواله از بانک','رسید حواله‌ای که ما به مشتری زده‌ایم','data-act="scPay" data-m="hav" data-dir="out"')}
function scRcpHTML(){const S=SCN,R=S.res,rc=S.rc||{},ok=!!(R&&R.ok),bad=rc.status==='fail',info=[rc.bank?'بانک '+esc(rc.bank):'',rc.date?esc(/^\d{4}-\d\d-\d\d$/.test(rc.date)?dates(rc.date).fa:rc.date):'',rc.time?'ساعت '+toFa(esc(rc.time)):''].filter(Boolean);
  return scHead('رسید بانکی','عددها را با عکس مقایسه کنید')+`<div class="scw">
  <div class="scim"><img src="${S.img}" alt="عکس رسید"><span class="sccf ${ok?'md':'no'}">${ic(ok?'check':'info')}${ok?'خوانده شد · با عکس مقایسه کنید':rc.amountS?'مطمئن نیستم · پیشنهاد زیر را با عکس مقایسه کنید':'خوانده نشد · خودتان بنویسید'}</span></div>
  ${bad?`<div class="scrs r"><i>${ic('info')}</i><span><b>این رسید «ناموفق» خوانده شد</b><small>اگر تراکنش انجام نشده، آن را ثبت نکنید</small></span></div>`:''}
  <label class="scbig" for="scA"><small>مبلغ رسید · تومان</small><input id="scA" inputmode="numeric" autocomplete="off" enterkeyhint="done" dir="ltr" data-z3="1" value="${rc.amount?fmt(rc.amount):''}" placeholder="۰"></label>
  ${!rc.amount&&rc.amountS?`<div class="scch al"><small>شاید مبلغ:</small><button type="button" data-act="scRcS" data-f="amount">${fmt(rc.amountS)} تومان</button></div>`:''}
  ${!rc.tn&&rc.tnS?`<div class="scch al"><small>شاید پیگیری:</small><button type="button" data-act="scRcS" data-f="tn">${esc(rc.tnS)}</button></div>`:''}
  <div class="scfs"><label><small>شماره پیگیری</small><input id="scT" inputmode="numeric" dir="ltr" autocomplete="off" value="${esc(rc.tn||'')}" placeholder="—"></label></div>
  ${info.length?`<div class="scif">${info.map(t=>`<span>${t}</span>`).join('')}</div>`:''}
  <div id="scRs" class="scol">${scRcpOpts()}</div>
  <button class="lnk" data-act="scBack">بازگشت به انتخاب عکس</button></div>`}
function scRcpBind(){const A=$('scA'),T=$('scT');if(A)A.oninput=()=>{const v=Math.round(+toEn(A.value).replace(/[^\d]/g,'')||0);A.value=v?fmt(v):'';SCN.rc.amount=v;const r=$('scRs');if(r)r.innerHTML=scRcpOpts()};
  if(T)T.oninput=()=>{T.value=toEn(T.value).replace(/[^\dA-Za-z\-]/g,'');SCN.rc.tn=T.value}}
async function scRcpKey(pre){let key='';try{const k=newImgKey(pre);if(await imgPut(k,SCN.img))key=k}catch(_){}return key}
/* تأیید واریز: همان پنجره «واریز بانکی» باز می‌شود، پیگیری پر شده و عکس رسید پیوست است؛ ثبت با دکمه خود پنجره */
ACT.scDep=async d=>{const S=SCN;if(!S)return;if(!can('track')){toast('دسترسی «پیگیری واریز» برای حساب شما فعال نیست',true);return}
  const b=batches.find(z=>String(z.id)===String(d.b)),x=b&&b.items[+d.i];if(!x){toast('این واریز دیگر در لیست نیست',true);return}const tn=S.rc.tn||'',img=S.img;SCN=null;
  await openItem(b.id,+d.i);const c=galCtx();
  if(c&&c.ed&&img){try{const k=newImgKey(c.pre);if(await imgPut(k,img)){const K=c.keys.slice();K.push(k);c.set(K);logA('edit','افزودن رسید',c.meta.name+' | '+fmt(1)+' عکس',{imgs:[k],ids:[x.id]});if(typeof galRefresh==='function')galRefresh()}}catch(e){console.error(e)}}
  const n=$('itn');if(n&&tn&&!n.value)n.value=tn;if(x.st!=='ok'){tmpSt='ok';itStPaint()}
  toast(tn?'رسید پیوست شد و پیگیری نوشته شد؛ بررسی و «ذخیره» کنید':'رسید پیوست شد؛ بررسی و «ذخیره» کنید')};
/* سند دریافت/پرداخت: سند تازه با ردیف آماده (مبلغ، پیگیری، عکس)؛ مشتری و حساب بانک در خود سند */
ACT.scPay=async d=>{const S=SCN;if(!S)return;const a=Math.round(scNum(S.rc.amount));if(!(a>0)){toast('مبلغ را بزنید',true);return}
  const m=d.m==='pos'?'pos':'hav',dir=d.dir==='out'?'out':'in',tn=m==='pos'?'':(S.rc.tn||''),key=await scRcpKey('xr'),inDoc=S.doc&&cur==='sell'&&!!sv;SCN=null;closeSheet();if(!inDoc)ACT.svNew({fresh:1});
  setTimeout(()=>{if(cur!=='sell'||!sv)return;sv.qa.d=dir;sv.qa.s='';sv.qa.q='';const p=pyNew(m,{dir,fl:1,tn,...(key?{imgs:[key],img:key}:{})});p.amount=a;pyStart(p);
    toast(svCu()?'ردیف با مبلغ رسید آماده است؛ حساب بانک را انتخاب و «افزودن» را بزنید':'ردیف با مبلغ رسید آماده است؛ مشتری و حساب بانک را انتخاب کنید')},inDoc?60:160)};
/* خواندن وزن: موتور هفت‌قطعه‌ای (sgsRead). نتیجه همیشه «برای بررسی» است — کنار عکس و قابل ویرایش */
async function scScale(img,o){if(typeof sgsRead!=='function')return null;return sgsRead(img,o||{})}
ACT.scRcS=d=>{const r=SCN&&SCN.rc;if(!r)return;if(d.f==='amount'){r.amount=r.amountS;r.amountS=0}else{r.tn=r.tnS;r.tnS=''}scRe()};

/* ============ v90.8 صفحه «تنظیمات فاکتور» ============
   خواسته صاحب اپ: همه‌چیزِ فاکتور از داخل برنامه تنظیم شود و هر نوع فاکتور (فروش طلا، آبشده، خرید، رسید) تنظیم خودش را داشته باشد.
   صفحه کامل `invset` (مثل «کاربران» از کشوی تنظیمات می‌لغزد؛ از منوی یک سند هم باز می‌شود و آن‌وقت پیش‌نمایش همان سند است):
   بالای صفحه قالب‌ها و «پیش‌نمایش زنده» ثابت می‌مانند و پایینش بخش‌ها (کاغذ، سربرگ، مشتری، ستون‌ها، ردیف‌ها، مانده حساب، پانویس) عوض می‌شوند؛ هر تغییر همان لحظه
   در پیش‌نمایش دیده می‌شود. پیش‌نمایش همان invDoc واقعی است (در iframe کوچک‌شده؛ دو iframe که جایشان عوض می‌شود تا چشمک نزند).
   تا «ذخیره» زده نشود چیزی عوض نمی‌شود (IS.W نسخه کاری است)؛ ذخیره فقط فرق با پیش‌فرض را در cfg.inv می‌نویسد و با بقیه گوشی‌ها همگام می‌شود. فقط مدیر. */
let IS=null;
const IVSEC=[['paper','کاغذ و PDF'],['head','سربرگ'],['cust','مشتری و نرخ'],['cols','ستون‌ها'],['rows','ردیف‌ها'],['acc','مانده حساب'],['foot','پانویس']];
const IVTTL=['فاکتور فروش','فاکتور خرید','فاکتور آبشده','فاکتور طلا','پیش فاکتور','رسید دریافت','رسید پرداخت','صورت حساب'];
const ivSig=()=>JSON.stringify([IS.W,IS.shop]),ivDirty=()=>!!IS&&ivSig()!==IS.sig0;
function ivOpen(o){o=o||{};const W={};INVP.forEach(([k])=>{W[k]=invCfg(k)});const s=(cfgRec()||{}).shop||{};
  IS={p:o.p||'sale',W,shop:{nm:s.nm||'',ad:s.ad||'',tel:s.tel||'',ig:s.ig||''},sec:'paper',from:o.from||'me',doc:o.doc||null,smp:{}};IS.sig0=ivSig()}
/* سندی که پیش‌نمایش می‌شود: همان سندی که صفحه از آن باز شده (فقط در قالب خودش)، وگرنه سند نمونه آن قالب */
function ivDoc(){const d=IS.doc;if(d&&d.p===IS.p){const c=custs.find(x=>String(x.id)===String(d.cu)),t=c&&(c.txs||[]).find(x=>String(x.id)===String(d.tx)&&!x.del);if(c&&t)return{c,t,real:1}}
  return IS.smp[IS.p]||(IS.smp[IS.p]=invSample(IS.p))}
/* ---- تکه‌های فرم ---- */
const ivRow=(t,sub,ctl,cls)=>`<div class="ivr${cls?' '+cls:''}"><span class="tx"><b>${t}</b>${sub?`<small>${sub}</small>`:''}</span>${ctl}</div>`;
const ivSw=(k,t,sub)=>{const on=!!IS.W[IS.p][k];return ivRow(t,sub,`<button type="button" class="ivsw${on?' on':''}" role="switch" aria-checked="${on}" aria-label="${esc(t)}" data-act="ivT" data-k="${k}"></button>`)};
const ivSeg=(k,O)=>`<div class="ivg" role="radiogroup">${O.map(([v,l])=>`<button type="button" role="radio" aria-checked="${String(IS.W[IS.p][k])===String(v)}" class="${String(IS.W[IS.p][k])===String(v)?'on':''}" data-act="ivV" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
const ivPick=(k,t,sub,O)=>ivRow(t,sub,ivSeg(k,O),'col');
const AYN=[['a','خودکار'],['y','همیشه'],['n','هرگز']];
const IVCH={w:'وزن کالا، تعداد سکه و ارز',ay:'عیار طلا',w7:'وزن بر پایه ۷۵۰ (برای طلای متفرقه و آبشده)',lab:'نام آزمایشگاه (ری‌گیری)',ang:'شماره انگ',rt:'مظنه یا فی ردیف؛ خودکار = فقط وقتی با نرخ بالای برگه فرق دارد',gv:'مبلغ خود طلا، پیش از اجرت و سود',aj:'اجرت ساخت',pp:'سود فروشنده',tx:'مالیات ارزش افزوده'};
function ivSecHTML(){const S=IS.W[IS.p],k=IS.sec,pn=INVP.find(x=>x[0]===IS.p)[1];let h='';
  if(k==='paper')h=ivPick('paper','اندازه کاغذ','A4 افقی همان برگه است، بزرگ‌تر. در «A4 عمودی» دو برگه روی یک کاغذ می‌آید: نسخه مشتری بالا و نسخه فروشگاه پایین',[['a5','A5 افقی'],['a4','A4 افقی'],['a42','A4 · دو نسخه']])
    +(S.paper==='a42'?'':ivSw('copy','نسخه فروشگاه','یک برگه دوم با همان محتوا و برچسب «نسخه فروشگاه»'))
    +ivPick('ink','رنگ چاپ','سیاه‌وسفید برای چاپگر لیزری: طلایی‌ها خاکستری تیره و رنگ طلبکار/بدهکار مشکی می‌شود',[['c','رنگی'],['m','سیاه‌وسفید']])
    +(S.ink==='m'?'':ivPick('bg','رنگ کاغذ','',[['c','کرم'],['w','سفید']]))
    +ivPick('frame','قاب دور برگه','',[['g','جدول زرّین'],['l','خط ساده'],['n','بدون قاب']]);
  else if(k==='head')h=ivPick('lp','لوگو','',[['c','وسط'],['r','سمت راست'],['n','بدون لوگو']])
    +ivPick('cal','خط عنوان','',[[1,'خوشنویسی'],[0,'ساده']])
    +ivRow('متن عنوان','«خودکار» از روی خود سند: فاکتور فروش، فاکتور خرید، رسید دریافت…',`<div class="ivch"><button type="button" class="${S.ttl?'':'on'}" data-act="ivTtl" data-v="">خودکار</button>${IVTTL.map(x=>`<button type="button" class="${S.ttl===x?'on':''}" data-act="ivTtl" data-v="${x}">${x}</button>`).join('')}</div><input class="ivin" id="ivTt" value="${esc(IVTTL.includes(S.ttl)?'':S.ttl)}" placeholder="یا متن دلخواه (با خط ساده نوشته می‌شود)" maxlength="28" autocomplete="off" enterkeyhint="done">`,'col')
    +ivSw('cn','شماره سند مشتری','زیر شماره، شماره سند همین مشتری هم نوشته شود')+ivSw('wd','روز هفته کنار تاریخ','');
  else if(k==='cust')h=ivSw('ph','تلفن مشتری','')+ivSw('cno','شماره مشتری','')+ivSw('nid','کد ملی مشتری','اگر در حساب مشتری ثبت شده باشد')+ivSw('mz','مظنه روز','')+ivSw('g18','قیمت هر گرم ۱۸ عیار','');
  else if(k==='cols')h=`<div class="ivnote">«خودکار» یعنی ستون فقط وقتی می‌آید که در همان فاکتور چیزی برای نشان دادن دارد. ردیف، شرح و مبلغ همیشه هستند.</div>`+INVCOL.map(([f,l])=>ivRow(f==='rt'&&S.rt==='g'?'فی هر گرم':l,IVCH[f],ivSeg('c'+f,AYN))).join('')
    +`</div><div class="ivh">شکل نوشتن اجرت، سود و نرخ</div><div class="ivk">`+ivPick('aj','اجرت','«درصد و مبلغ زیرش»: بالا همان درصدِ واردشده و زیرش مبلغ تومانی اجرت',[['p','همان که وارد شده'],['t','فقط مبلغ تومانی'],['b','درصد و مبلغ زیرش']])
    +ivPick('pp','سود','',[['p','درصد'],['t','فقط مبلغ تومانی'],['b','درصد و مبلغ زیرش']])+ivPick('rt','ستون نرخ','',[['m','مظنه'],['g','فی هر گرم']]);
  else if(k==='rows')h=ivRow('ارتفاع ردیف','ردیف‌های دوخطی (درصد و مبلغ) خودشان بلندتر می‌شوند',`<div class="ivst"><button type="button" data-act="ivN" data-k="rh" data-d="-0.2" aria-label="کمتر">−</button><b>${toFa(S.rh.toFixed(1))} <small>میلی‌متر</small></b><button type="button" data-act="ivN" data-k="rh" data-d="0.2" aria-label="بیشتر">+</button></div>`)
    +ivPick('fs','اندازه نوشته جدول','',[[-1,'ریز'],[0,'معمولی'],[1,'درشت'],[2,'خیلی درشت']])
    +ivPick('cap','نوار عنوان گروه‌ها','فروش به مشتری، خرید از مشتری، دریافت، پرداخت. خودکار = وقتی بیش از یک گروه هست',AYN)+ivSw('sum','جمع هر گروه','روی نوار گروهی که دو ردیف مبلغ‌دار یا بیشتر دارد')
    +ivSw('ex','جزئیات کنار نام کالا','توضیح ردیف، شرطی، آزمایشگاه و انگ (اگر ستون جدا ندارند)، معادل ۷۵۰')
    +ivPick('py','دریافت و پرداخت‌ها','',[[1,'هر کدام یک ردیف'],[0,'یک ردیف جمع']])+ivSw('tn','شماره پیگیری حواله','')
    +ivPick('fill','فضای خالی زیر ردیف‌ها','',[['b','ساده'],['l','ادامه خط ستون‌ها'],['r','ردیف‌های خالی']]);
  else if(k==='acc')h=ivSw('acc','جدول «حساب مشتری»','مانده قبلی، این فاکتور و مانده نهایی، پایین همان قاب')
    +(S.acc?ivSw('ap','سطر «مانده قبلی»','')+ivSw('ad','سطر «این فاکتور»','')+ivPick('ag','مانده طلا','',[['y','همیشه'],['a','فقط وقتی مانده دارد'],['n','هرگز']])+ivPick('ax','مانده سکه و ارز','هر سکه یا ارزی که مشتری مانده دارد یک ستون می‌گیرد',[['a','خودکار'],['n','هرگز']])
      +ivSw('an','توضیح کنار سطرها','پیش از این فاکتور · فروش − خرید − دریافت · …')+ivSw('lg','راهنمای زیر جدول','یک خط که معنی دو طرف حساب را می‌گوید')
      +ivPick('wr','واژه‌های دو طرف حساب','از دید مطلا یا از دید مشتری',[['w','طلبکاریم / بدهکاریم'],['c','بدهکار / بستانکار']]):'');
  else h=ivSw('sgc','جای امضای مشتری','')+ivSw('sgs','جای مهر و امضای فروشنده','')+(S.sgs?ivSw('by','نام ثبت‌کننده کنار امضا','نام کاربری که سند را ثبت کرده'):'')+ivSw('th','«با سپاس از اعتماد شما»','')+ivSw('shp','مشخصات فروشگاه','نام، نشانی، تلفن و صفحه؛ اگر همه خالی باشد «طلا و جواهر مطلا»')
    +ivRow('یادداشت پایین فاکتور','مثلاً شرایط مرجوعی. فقط برای قالب «'+pn+'»',`<input class="ivin" id="ivNt" value="${esc(S.note)}" placeholder="خالی = چیزی چاپ نمی‌شود" maxlength="170" autocomplete="off" enterkeyhint="done">`,'col')
    +`</div><div class="ivh">مشخصات فروشگاه · برای همه قالب‌ها</div><div class="ivk">`
    +ivRow('نام فروشگاه','',`<input class="ivin" id="ivSn" value="${esc(IS.shop.nm)}" placeholder="مثلاً طلا و جواهر مطلا" maxlength="40" autocomplete="off" enterkeyhint="next">`,'col')
    +ivRow('نشانی','',`<input class="ivin" id="ivSa" value="${esc(IS.shop.ad)}" placeholder="نشانی کوتاه" maxlength="90" autocomplete="off" enterkeyhint="next">`,'col')
    +ivRow('تلفن','',`<input class="ivin ltr" id="ivSt" inputmode="tel" value="${esc(IS.shop.tel)}" placeholder="تلفن فروشگاه" maxlength="40" autocomplete="off" enterkeyhint="next">`,'col')
    +ivRow('اینستاگرام یا سایت','',`<input class="ivin ltr" id="ivSi" value="${esc(IS.shop.ig)}" placeholder="نشانی صفحه" maxlength="50" autocomplete="off" enterkeyhint="done">`,'col');
  return `<div class="ivk">${h}</div><div class="ivact"><button type="button" data-act="ivCopy">${ic('copy')}<span>همین تنظیم برای همه قالب‌ها</span></button><button type="button" class="rd" data-act="ivReset">${ic('undo')}<span>پیش‌فرضِ «${pn}»</span></button></div>`}
function vInvSet(){if(!isAdmin())return '<div class="card empty"><b>فقط مدیر دسترسی دارد</b></div>';if(!IS)ivOpen();
  return `<div class="ivs"><div class="ivtab" role="tablist" aria-label="قالب فاکتور">${INVP.map(([k,l])=>`<button type="button" role="tab" aria-selected="${IS.p===k}" class="${IS.p===k?'on':''}" data-act="ivTab" data-p="${k}">${l}</button>`).join('')}</div>
  <div class="ivtop"><div class="ivpv"><div class="ivpw" id="ivPw"><iframe id="ivF0" class="on" title="پیش‌نمایش فاکتور" tabindex="-1"></iframe><iframe id="ivF1" title="پیش‌نمایش فاکتور" tabindex="-1" aria-hidden="true"></iframe><button type="button" class="ivpz" data-act="ivZoom" aria-label="بزرگ‌نمایی پیش‌نمایش"><span>${ic('search')}</span></button></div><small class="ivpi" id="ivPi"></small></div>
  <div class="ivsec" id="ivSc" role="tablist" aria-label="بخش تنظیمات">${IVSEC.map(([k,l])=>`<button type="button" role="tab" aria-selected="${IS.sec===k}" class="${IS.sec===k?'on':''}" data-act="ivSec" data-s="${k}">${l}</button>`).join('')}</div></div>
  <div class="ivc" id="ivC">${ivSecHTML()}</div></div>`}
const aInvSet=()=>'';
/* پیش‌نمایش: برگه واقعی در اندازه واقعی کاغذ، با transform کوچک می‌شود تا در پهنای صفحه (و حداکثر ۳۶٪ ارتفاع) جا شود */
function ivPrev(now){clearTimeout(ivPrev.t);ivPrev.t=setTimeout(()=>{const box=$('ivPw');if(!box||!IS)return;const X=ivDoc();let h;try{h=ivWithShop(()=>invDoc(X.c,X.t,{S:IS.W[IS.p],prof:IS.p}))}catch(e){const i=$('ivPi');if(i)i.textContent='پیش‌نمایش ساخته نشد';return}
    const Q=pageSpec(h),PX=96/25.4,W=Math.round(Q.mmW*PX),H=Math.round(Q.mmH*PX),n=(h.match(/<section class="sht"/g)||[]).length,cw=Math.max(200,box.parentNode.clientWidth-16),sc=Math.min(cw/W,Math.max(150,innerHeight*.3)/H);
    box.style.width=Math.floor(W*sc)+'px';box.style.height=Math.floor(H*sc)+'px';
    const a=box.querySelector('iframe.on'),b=box.querySelector('iframe:not(.on)');if(!a||!b)return;b.style.width=W+'px';b.style.height=H+'px';b.style.transform=`scale(${sc})`;
    b.onload=()=>{b.classList.add('on');a.classList.remove('on')};
    b.srcdoc=h.replace('</head>','<style>html,body{margin:0!important;overflow:hidden!important;background:transparent!important}html body .sht{margin:0!important;border-radius:0!important;box-shadow:none!important}</style></head>');
    const i=$('ivPi');if(i)i.textContent=(X.real?'پیش‌نمایش همین سند':'پیش‌نمایش با سند نمونه')+(n>1?' · '+toFa(n)+' برگه':'')+' · برای بزرگ‌نمایی بزنید'},now?0:120)}
/* بازسازی بدون render: فقط دکمه‌های بالا، فرم بخش و پیش‌نمایش (iframeها می‌مانند) */
function ivRe(o){o=o||{};document.querySelectorAll('#view .ivtab button').forEach(b=>{const on=b.dataset.p===IS.p;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  document.querySelectorAll('#ivSc button').forEach(b=>{const on=b.dataset.s===IS.sec;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  const C=$('ivC');if(C&&!o.keep){C.innerHTML=ivSecHTML();if(o.anim)C.classList.remove('in'),void C.offsetWidth,C.classList.add('in');ivBindIn()}hdGoSync();if(!o.noPrev)ivPrev()}
function ivBindIn(){const S=IS.W[IS.p],B=(id,f)=>{const e=$(id);if(e)e.oninput=()=>{f(e.value);ivRe({keep:1})}};
  B('ivTt',v=>{S.ttl=clean(v).slice(0,28);document.querySelectorAll('#ivC .ivch button').forEach(b=>b.classList.toggle('on',(b.dataset.v||'')===S.ttl))});
  B('ivNt',v=>{S.note=clean(v).slice(0,170)});B('ivSn',v=>{IS.shop.nm=clean(v).slice(0,40)});B('ivSa',v=>{IS.shop.ad=clean(v).slice(0,90)});B('ivSt',v=>{IS.shop.tel=clean(v).slice(0,40)});B('ivSi',v=>{IS.shop.ig=clean(v).slice(0,50)})}
function bindInvSet(){if(!IS||!isAdmin())return;ivBindIn();ivPrev(1);if(!bindInvSet.rz){bindInvSet.rz=1;window.addEventListener('resize',()=>{if(cur==='invset')ivPrev()})}}
/* مشخصات فروشگاه تا ذخیره نشده فقط در پیش‌نمایش دیده می‌شود: invDoc از cfg می‌خواند، پس هنگام ساختن پیش‌نمایش موقتاً جایش گذاشته می‌شود */
const ivWithShop=f=>{const r=cfgRec();if(!r)return f();const o=r.shop;r.shop={...IS.shop};try{return f()}finally{if(o===undefined)delete r.shop;else r.shop=o}};
ACT.invSet=()=>{if(!isAdmin()){toast('فقط مدیر می‌تواند تنظیمات فاکتور را عوض کند',true);return}if(cur!=='invset')meRet=cur;PARENT.invset='home';ivOpen({from:'me'});go('invset')};
ACT.invSetDoc=()=>{if(!isAdmin()){toast('فقط مدیر می‌تواند تنظیمات فاکتور را عوض کند',true);return}const X=invGet();if(!X)return;const p=invProf(X.t);PARENT.invset='inv';ivOpen({from:'inv',p,doc:{cu:X.c.id,tx:X.t.id,p}});go('invset')};
ACT.ivTab=d=>{if(!IS||IS.p===d.p)return;IS.p=d.p;ivRe({anim:1})};
ACT.ivSec=d=>{if(!IS||IS.sec===d.s)return;IS.sec=d.s;ivRe({anim:1,noPrev:1});const b=document.querySelector('#ivSc button.on');if(b&&b.scrollIntoView)b.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})};
ACT.ivT=d=>{if(!IS)return;const S=IS.W[IS.p];S[d.k]=S[d.k]?0:1;ivRe()};
ACT.ivV=d=>{if(!IS)return;const S=IS.W[IS.p],n=typeof INVD[d.k]==='number';S[d.k]=n?+d.v:d.v;IS.W[IS.p]=invClean(S);ivRe()};
ACT.ivN=d=>{if(!IS)return;const S=IS.W[IS.p];S[d.k]=Math.round(((+S[d.k]||0)+(+d.d||0))*10)/10;IS.W[IS.p]=invClean(S);ivRe()};
ACT.ivTtl=d=>{if(!IS)return;IS.W[IS.p].ttl=d.v||'';ivRe()};
ACT.ivZoom=()=>{if(!IS)return;const X=ivDoc(),S={...IS.W[IS.p]},p=IS.p;openPrint(()=>ivWithShop(()=>invDoc(X.c,X.t,{S,prof:p})))};
ACT.ivReset=()=>{if(!IS)return;const pn=INVP.find(x=>x[0]===IS.p)[1];askConfirm('تنظیمات قالب «'+pn+'» به پیش‌فرض برگردد؟','برگردان',()=>{IS.W[IS.p]=invClean({...INVD,...(INVT[IS.p]||{})});ivRe({anim:1});toast('قالب «'+pn+'» پیش‌فرض شد؛ برای ماندگار شدن «ذخیره» را بزنید')})};
ACT.ivCopy=()=>{if(!IS)return;const pn=INVP.find(x=>x[0]===IS.p)[1];askConfirm('همه تنظیمات «'+pn+'» روی سه قالب دیگر هم گذاشته شود؟\nستون‌ها، ردیف‌ها، مانده حساب، سربرگ و پانویس آن‌ها جایگزین می‌شود.','کپی کن',()=>{INVP.forEach(([k])=>{if(k!==IS.p)IS.W[k]={...IS.W[IS.p]}});ivRe({keep:1,noPrev:1});toast('روی همه قالب‌ها گذاشته شد؛ برای ماندگار شدن «ذخیره» را بزنید')})};
ACT.ivSave=()=>{if(!IS||!isAdmin())return;if(!ivDirty()){toast('چیزی عوض نشده است');return}const r=cfgRec(1),inv={};
  INVP.forEach(([k])=>{const base=invClean({...INVD,...(INVT[k]||{})}),c2=invClean(IS.W[k]),o={};for(const q in c2)if(c2[q]!==base[q])o[q]=c2[q];inv[k]=o});
  r.inv=inv;r.shop={nm:IS.shop.nm,ad:IS.shop.ad,tel:IS.shop.tel,ig:IS.shop.ig};saveCu();IS.sig0=ivSig();hdGoSync();toast('تنظیمات فاکتور ذخیره شد')};

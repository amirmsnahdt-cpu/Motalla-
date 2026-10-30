/* ===== ورود حساب: خرید (مرحله‌به‌مرحله) / فروش ===== */
ACT.bkCal=()=>openCal(fPay||payDef(),iso=>{fPay=iso;const l=$('bkPayL'),s2=$('bkPayS');if(l)l.textContent=payLab(iso);if(s2)s2.textContent=dates(iso).wd+' '+dates(iso).fa});
ACT.bkPaste=async()=>{try{const t=await navigator.clipboard.readText();if(!t||!t.trim()){toast('حافظه خالی است',true);return}const b=$('bulk');b.value=(b.value.trim()?b.value.trim()+'\n':'')+t;bkPrev();toast('متن چسبانده شد')}catch(e){toast('اجازه خواندن حافظه داده نشد؛ داخل کادر نگه دارید و «Paste» بزنید',true);$('bulk').focus()}};
/* ===== موجودی حساب‌های بانکی (همان منابع تقسیم + موجودی) ===== */
const CARD_BIN={'603799':'ملی','170019':'ملی','610433':'ملت','991975':'ملت','589210':'سپه','603769':'صادرات','627353':'تجارت','585983':'تجارت','603770':'کشاورزی','639217':'کشاورزی','628023':'مسکن','589463':'رفاه','502229':'پاسارگاد','639347':'پاسارگاد','621986':'سامان','622106':'پارسیان','639194':'پارسیان','627884':'پارسیان','627412':'اقتصاد نوین','639346':'سینا','502806':'شهر','504706':'شهر','636214':'آینده','504172':'رسالت','606373':'مهر ایران','502938':'دی','627760':'پست بانک','502910':'کارآفرین','627488':'کارآفرین','639607':'سرمایه','505785':'ایران زمین','505416':'گردشگری','627961':'صنعت و معدن','627648':'توسعه صادرات','207177':'توسعه صادرات','502908':'توسعه تعاون','636949':'حکمت','627381':'انصار','636795':'مرکزی','606256':'ملل','505801':'کوثر','507677':'نور','585947':'خاورمیانه','639599':'قوامین'};
const bankOfCard=c=>CARD_BIN[String(c||'').slice(0,6)]||'';
const BK_PICK=['ملی','ملت','صادرات','تجارت','سپه','کشاورزی','مسکن','رفاه','پاسارگاد','سامان','پارسیان','اقتصاد نوین','سینا','شهر','آینده','رسالت','مهر ایران','دی','پست بانک','کارآفرین','سرمایه','ایران زمین','گردشگری','خاورمیانه'];
const acBank=s=>s.bank||ibanBank(s.iban||'')||bankOfCard(s.card)||'';
function acSent(s){if(!s.balAt)return 0;let t=0;for(const b of batches){for(const x of b.items)if(x.src===s.name&&x.st!=='fail'&&(x.sAt||b.createdAt||'')>=s.balAt)t+=+x.amount||0}return t}
/* دفتر حساب: موجودی = آخرین موجودی ثبت‌شده + ورودی‌ها (کارتخوان، واریز) − برداشت‌ها − واریزهای ارسال‌شده از آن لحظه */
const LT={pos:{t:'کارتخوان',sg:1,c:'g',i:'down'},in:{t:'واریز به حساب',sg:1,c:'g',i:'plus'},out:{t:'برداشت',sg:-1,c:'r',i:'share'}};
const acLed=s=>(s.led||[]).filter(x=>!x.del&&(!s.balAt||(x.at||'')>=s.balAt));
const acLedSum=s=>acLed(s).reduce((a,x)=>a+(LT[x.type]?LT[x.type].sg:0)*(+x.amount||0),0);
/* حواله‌های سندهای مشتری به این حساب (srcInvSum) هم در موجودی می‌آید */
const acEst=s=>s.bal==null?null:(+s.bal||0)+acLedSum(s)+srcInvSum(s)-acSent(s);
/* تخصیص‌های ارسال‌نشده = رزرو */
function acRes(s,exPid){let t=0;Object.values(drafts||{}).forEach(L=>(L||[]).forEach(p=>{if(p.sent||p.id===exPid||!p.src||String(p.src.id)!==String(s.id))return;t+=sum(partRows(p))}));return t}
const acFree=(s,exPid)=>{const e=acEst(s);return e==null?null:e-acRes(s,exPid)};
const posToday=()=>{const t=todayISO();let n=0,a=0;sources.forEach(s=>(s.led||[]).forEach(x=>{if(!x.del&&x.type==='pos'&&x.date===t){n++;a+=+x.amount||0}}));return{n,a}};
function agoFa(iso){if(!iso)return '';const m=Math.round((Date.now()-new Date(iso))/6e4);if(m<1)return 'همین الان';if(m<60)return toFa(m)+' دقیقه پیش';const h=Math.round(m/60);if(h<24)return toFa(h)+' ساعت پیش';const d=Math.round(h/24);return d===1?'دیروز':toFa(d)+' روز پیش'}
/* v66.0 (خواسته صاحب اپ: «قسمت بانک — ساده، شفاف، کاربردی»):
   صفحه بانک فقط «حساب‌های مغازه» (s.own=1) را نشان می‌دهد، نه همه منبع‌های واریزی. تا وقتی هیچ حسابی علامت نخورده،
   همه دیده می‌شوند و یک کارت «حساب‌های مغازه را مشخص کنید» بالای فهرست هست.
   مانده نهایی هر حساب = مانده قبلی (آخرین تطبیق) + حواله‌های سندها (دریافت +، پرداخت −) + کارتخوان (نشسته + در راه، فردا می‌نشیند)
   + واریز دستی − برداشت‌ها (واریزی‌های ارسال‌شده + برداشت دستی). همین عدد هر جا اسم بانک هست کنارش می‌آید (bkTag). */
const ownSet=()=>sources.some(s=>s.own!=null);
const isOwn=s=>!!s&&(ownSet()?!!s.own:true);
/* حساب‌های مغازه برای انتخاب در سندها و واریزی‌ها: حساب انتخاب‌شده فعلی همیشه در فهرست می‌ماند */
const ownL=sel=>sources.filter(s=>isOwn(s)||(sel!=null&&sel!==''&&String(s.id)===String(sel)));
function acSum(s){const known=s.bal!=null,L=acLed(s);let hvIn=0,hvOut=0,nIn=0,nOut=0;
  srcMoves(s).forEach(m=>{if(m.a>0){hvIn+=m.a;nIn++}else if(m.a<0){hvOut-=m.a;nOut++}});
  const sm=t=>L.filter(x=>x.type===t).reduce((a,x)=>a+(+x.amount||0),0),posIn=sm('pos'),ledIn=sm('in'),ledOut=sm('out'),sent=acSent(s),posWay=acPosPend(s),res=acRes(s);
  const prev=known?+s.bal||0:0,now=prev+hvIn-hvOut+posIn+ledIn-ledOut-sent;
  return {known,prev,hvIn,hvOut,nIn,nOut,hv:hvIn-hvOut,posIn,posWay,pos:posIn+posWay,ledIn,ledOut,sent,out:sent+ledOut,res,now,fin:now+posWay}}
const acFin=s=>s.bal==null?null:acSum(s).fin;
/* برچسب مانده کنار نام بانک در همه انتخابگرها */
const bkTag=s=>{const f=acFin(s);return f==null?'':`<em class="bktg${f<0?' n':''}">${f<0?'−':''}${fmt(Math.abs(f))}</em>`};
const bkSub=s=>{const f=acFin(s),bk=acBank(s);return f==null?(bk?'بانک '+bk:'حساب ما'):'مانده '+(f<0?'−':'')+fmt(Math.abs(f))+' تومان'};
const acHv=s=>srcMoves(s).filter(m=>m.a>0);
const bxN=(v,cls)=>`<span class="acn${cls?' '+cls:''}" data-v="${Math.abs(Math.round(v))}">${fmt(Math.abs(Math.round(v)))}</span>`;
/* v66.1 (خواسته صاحب اپ: «رنگ‌ها با برنامه سینک نیست، طرح نسخه‌های قدیمی»): کارت جمع بانک‌ها و صفحه هر حساب با همان اجزای صفحه
   حساب مشتری ساخته می‌شوند — کارت سفید «مانده» با کاشی‌های cbk (آبی/قرمز/خاکستری، شمارش cbn)، فهرست ردیف‌های c6r،
   «گردش حساب» با سرتیتر روز (fday) و ردیف‌های fcard/txr. ریز حساب دیگر پنجره نیست، یک صفحه کامل است (bank). */
const bxTile=(lab,v,cls,i,o)=>{o=o||{};const t=o.txt||fmt(Math.abs(Math.round(v||0)));return `<span class="cbk kb ${cls}" style="--i:${i||0}"><span class="cbh"><small>${lab} <i>تومان</i></small>${o.tag?`<em>${o.tag}</em>`:''}</span><b${fitS(t)}><span class="cbn"${o.txt?'':` data-k="r" data-v="${Math.abs(Math.round(v||0))}"`}>${o.neg&&!o.txt?'−':''}${t}</span></b></span>`};
const bxSg=(v,o)=>v?`<b class="${v<0?'r':'b'}"><bdi dir="ltr">${v<0?'−':'+'}${fmt(Math.abs(v))}</bdi></b>`:`<b class="z">۰</b>`;
/* v66.2 (خواسته صاحب اپ: «فضا شلوغه؛ اول خود حساب‌ها، جستجو، مانده نهایی هر حساب، مانده کل در کادر آبی؛
   ثبت کارتخوان و انتخاب حساب‌های مغازه در منوی سه‌نقطه سمت چپ»): صفحه بانک = جستجو، فهرست حساب‌ها (هر ردیف: لوگو، نام، مانده نهایی)،
   و در پایان کادر آبی «مانده کل بانک‌ها». */
let bkQ='';
const bxV=(m,big)=>m.known?`<b class="${m.fin<0?'n':''}"><span class="cbn" data-k="r" data-v="${Math.abs(Math.round(m.fin))}">${m.fin<0?'−':''}${fmt(Math.abs(Math.round(m.fin)))}</span><i>تومان</i></b>`:`<b class="z">ثبت نشده</b>`;
const bkHit=(s,q)=>{if(!q)return true;const d=toEn(q).replace(/\D/g,'');return nzName(toEn([s.name,s.bank,acBank(s)].join(' '))).includes(nzName(toEn(q)))||(d.length>=3&&(String(s.iban||'').includes(d)||String(s.card||'').includes(d)))};
/* v66.4 (خواسته صاحب اپ): دکمه «حساب جدید» حذف؛ افزودن مثل جستجوی مشتری‌ها — ردیف «حساب تازه «…»» زیر نتیجه‌ها */
const bkAddRow=q=>q&&can('src')&&!sources.some(s=>canon(s.name)===canon(q))?`<button class="c6add" data-act="bkNewQ">${ic('plus')}<span><b>حساب تازه «${esc(q)}»</b><small>${(b=>b?'بانک '+b+' · ':'')(bkGuess(q))}اول شبا و کارت، بعد ورود به حساب</small></span></button>`:'';
const bkGuess=q=>{const n=canon(q);return BK_PICK.slice().sort((a,b)=>b.length-a.length).find(b=>n.startsWith(canon(b))||n.includes(canon(b)))||''};
ACT.bkNewQ=()=>{const q=clean(bkQ||'');ACT.acNew();acTmp.bank=bkGuess(q);acTmp.after=s=>{bkQ='';ACT.acOpen({id:s.id})};const N=$('acN');if(N)N.value=q;document.querySelectorAll('#acPick .acp').forEach(x=>x.classList.toggle('on',x.dataset.b===acTmp.bank));const on=document.querySelector('#acPick .acp.on');if(on)setTimeout(()=>on.scrollIntoView({inline:'center',block:'nearest'}),60);setTimeout(()=>{const I=$('acI');if(I)I.focus()},320)};
function bkListHTML(){const q=clean(bkQ||''),L=ownL(),S=new Map(L.map(s=>[s.id,acSum(s)])),O=L.filter(s=>bkHit(s,q)).sort((a,b)=>(b.bal!=null)-(a.bal!=null)||(S.get(b.id).fin-S.get(a.id).fin));
  const X=q&&ownSet()?sources.filter(s=>!isOwn(s)&&bkHit(s,q)).slice(0,6):[],xh=X.length?`<div class="c6gh">حساب‌های دیگر · زدن = گردش، کشیدن = ویرایش</div><div class="c6l bxlist">${X.map(s=>{const bk=acBank(s);return swW(`<button class="c6r bxrow" data-act="acOpen" data-id="${s.id}"><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):esc(userInit(s.name))}</span><span class="tx"><b>${esc(s.name)}</b><small>منبع واریزی · در صفحه بانک نیست</small></span>${ic('back').replace('class="i"','class="i flip bxch"')}</button>`,{r:[['acEdit','ویرایش','edit','#3b6fd6']],l:[],data:{id:s.id}})}).join('')}</div>`:'';
  if(!O.length)return (q?'':`<div class="bempty">${ic('bank')}<b>حساب مغازه‌ای نیست</b><small>نام حساب را در جستجو بنویسید تا اضافه شود</small></div>`)+xh+bkAddRow(q)||`<div class="bempty">${ic('search')}<b>حسابی با «${esc(q)}» پیدا نشد</b></div>`;
  return `<div class="c6l bxlist">${O.map((s,ri)=>{const bk=acBank(s),m=S.get(s.id),sub=[bk&&!canon(s.name).includes(canon(bk))?'بانک '+bk:'',m.known?'قبلی '+fmt(m.prev):''].filter(Boolean).join(' · ');
    return swW(`<button class="c6r bxrow" data-act="acOpen" data-id="${s.id}" style="--r:${Math.min(ri,8)}"><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):esc(userInit(s.name))}</span><span class="tx"><b>${esc(s.name)}</b><small>${esc(sub||'حساب مغازه')}</small></span><span class="bxv"><small>مانده نهایی</small>${bxV(m)}</span>${ic('back').replace('class="i"','class="i flip bxch"')}</button>`,{r:[['acEdit','ویرایش','edit','#3b6fd6']],l:[['acDel','حذف','trash','#d23c48']],data:{id:s.id}})}).join('')}</div>${xh}${bkAddRow(q)}`}
/* کادر آبی مانده: صفحه بانک‌ها (جمع همه) و صفحه هر حساب */
function bxBlue(o){return `<div class="bxblue${o.an?' anim':''}"><small>${o.t}</small>${o.v==null?'<b class="z">—</b>':`<b><span class="cbn" data-k="r" data-v="${Math.abs(Math.round(o.v))}">${o.v<0?'−':''}${fmt(Math.abs(Math.round(o.v)))}</span><i>تومان</i></b>`}${o.sub?`<span>${o.sub}</span>`:''}${o.btn||''}</div>`}
function vBanks(){bxWas=!!document.querySelector('#view .bxblue');const L=ownL(),K=L.filter(s=>s.bal!=null),P=CH('pos'),un=P.filter(c=>!chSrc(c));
  const fin=K.reduce((a,s)=>a+acSum(s).fin,0),miss=L.length-K.length;
  return `<div class="c6s"><div class="fsearch c6q0">${ic('search')}<input id="bkq" type="search" placeholder="${L.length?'جستجو در '+toFa(L.length)+' حساب، یا نام حساب تازه…':'نام حساب تازه، مثل «ملی مغازه»…'}" value="${esc(bkQ)}" autocomplete="off" enterkeyhint="search"><button class="x${bkQ?'':' hide'}" data-act="bkQClr" aria-label="پاک کردن">×</button></div></div>
  <div id="bkres">${bkListHTML()}</div>
  ${!L.length?'':bxBlue({t:'مانده کل بانک‌ها',v:K.length?fin:null,an:!bxWas,sub:toFa(L.length)+' حساب مغازه'+(miss?' · '+toFa(miss)+' حساب بدون مانده قبلی (در جمع نیست)':'')})}
  ${un.length?bkExtraHTML(un):''}`}
let bxWas=false;
const aBanksBind=()=>{const I=$('bkq');if(I&&!I._b){I._b=1;I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();bkQ=I.value;const r=$('bkres'),b=r&&r.querySelector('.c6r,.c6add');if(b&&r.querySelectorAll('.c6r,.c6add').length===1)b.click();else I.blur()}};I.oninput=()=>{clearTimeout(I._t);I._t=setTimeout(()=>{bkQ=I.value;const x=document.querySelector('.c6q0 .x');if(x)x.classList.toggle('hide',!bkQ);srchSwap('bkres',bkListHTML())},90)}}
  if(cur==='banks'&&!bxWas)requestAnimationFrame(()=>cuCount('#view .bxblue.anim .cbn'))};
ACT.bkQClr=()=>{bkQ='';const I=$('bkq');if(I){I.value='';I.focus()}const x=document.querySelector('.c6q0 .x');if(x)x.classList.add('hide');srchSwap('bkres',bkListHTML())};
/* منوی سه‌نقطه سمت چپ سرتیتر بانک‌ها */
ACT.bkMore=()=>{const c=can('src'),P=CH('pos');popMenu(document.querySelector('#bar .hmo'),[c?['posNight',ic('down'),'ثبت واریز کارتخوان امشب']:null,c?['acOwn',ic('check'),ownSet()?'انتخاب حساب‌های مغازه':'حساب‌های مغازه را مشخص کنید']:null,['chOpenAll',ic('card'),P.length?'کارتخوان‌ها':'تعریف کارتخوان'],['bkStock',ic('coin'),'موجودی طلا و سکه مغازه']].filter(Boolean))};
/* انتخاب حساب‌های مغازه (یک‌بار؛ بعد از «انتخاب حساب‌ها» قابل تغییر) */
let ownTmp=null;
ACT.acOwn=()=>{if(!can('src'))return;const any=ownSet();ownTmp=new Set(sources.filter(s=>any?s.own:(s.bal!=null||srcMoves(s).length||acPOS(s).length||(s.led||[]).length)).map(s=>String(s.id)));acOwnRe(true)};
function acOwnRe(first){const h=`<div class="sh-h"><div><b>حساب‌های مغازه</b><small class="shsub">فقط حساب‌های روشن در صفحه بانک و انتخاب حواله سندها می‌آیند؛ منبع‌های واریزی دست نمی‌خورند</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="fcard blist bxol">${sources.map(s=>{const bk=acBank(s),on=ownTmp.has(String(s.id)),m=acSum(s);return `<button class="pmi aclk${on?' on':''}" data-act="acOwnT" data-id="${s.id}"><span class="bxoa">${bk?bankBadge(bk,'lg'):`<span class="bkb lg" style="--bc:#64748b">${esc(userInit(s.name))}</span>`}</span><span class="tx"><b>${esc(s.name)}</b><small>${esc(bk?'بانک '+bk:'بانک نامشخص')}${m.known?' · مانده '+fmt(m.fin):m.nIn+m.nOut?' · '+toFa(m.nIn+m.nOut)+' حواله':''}</small></span><i class="tg"></i></button>`}).join('')}</div>
  <button class="xgo" data-act="acOwnSave">${ic('check')} ذخیره · <span id="acOwnN">${toFa(ownTmp.size)}</span> حساب</button>`;
  if(first)sheet(h);else $('sheet').innerHTML=h}
ACT.acOwnT=d=>{const k=String(d.id);ownTmp.has(k)?ownTmp.delete(k):ownTmp.add(k);const b=document.querySelector(`#sheet .aclk[data-id="${CSS.escape(k)}"]`);if(b)b.classList.toggle('on',ownTmp.has(k));const n=$('acOwnN');if(n)n.textContent=toFa(ownTmp.size)};
ACT.acOwnSave=()=>{if(!ownTmp)return;if(!ownTmp.size){toast('دست‌کم یک حساب را روشن کنید',true);return}const now=ns();let n=0;sources.forEach(s=>{const v=ownTmp.has(String(s.id))?1:0;if(s.own!==v){s.own=v;s.updatedAt=now;n++}});ownTmp=null;if(n){saveS();logA('src','حساب‌های مغازه',sources.filter(s=>s.own).map(s=>s.name).join('، '))}closeSheet();bkRe();toast('حساب‌های مغازه ذخیره شد')};
/* کارتخوان‌ها (کارت‌های کشیده‌شده در سندها، تا واریز به حساب) و موجودی طلا، سکه و ارز مغازه */
function bkExtraHTML(un){const P=CH('pos');let h='';un=un||P.filter(c=>!chSrc(c));
  if(un.length)h+=`<div class="spsec"><b>کارتخوان‌های وصل‌نشده</b><small>بگویید پول هر کارتخوان به کدام حساب می‌نشیند تا در همان حساب جمع شود</small></div><div class="fcard blist">${un.map(c=>{const v=chBal(c);return `<div class="posw"><button class="chrow" data-act="chOpen" data-id="${c.id}"><span class="bri pos">${ic('card')}</span><span class="tx"><b>${esc(c.name)}</b><small>${v?'در راه '+fmt(v)+' تومان':'همه واریز شده'}</small></span></button>${can('src')&&sources.length?`<button class="posdep" data-act="chLinkPick" data-id="${c.id}">${ic('bank')}<span>وصل کن</span></button>`:''}</div>`}).join('')}</div>`;
  return h}
/* موجودی طلا و سکه مغازه (از منوی سه‌نقطه بانک) */
ACT.bkStock=()=>{const st=goldStock(),gk=Object.keys(st).filter(k=>st[k]),as=assetStock(),ak=Object.keys(as);sheet(`<div class="sh-h"><div><b>موجودی مغازه</b><small class="shsub">از خریدها، فروش‌ها، دریافت و تحویل‌های ثبت‌شده</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>${gk.length||ak.length?`<div class="stks">${gk.map(k=>`<div class="${st[k]<0?'neg':''}"><small>${esc(k)}</small><b>${wFmt(st[k])}<i>گرم</i></b></div>`).join('')}${ak.map(k=>`<div class="${as[k]<0?'neg':''}"><small>${esc((XA[k]||{t:k}).t)}</small><b>${qFmt(as[k])}<i>${esc((XA[k]||{u:''}).u)}</i></b></div>`).join('')}</div>`:'<div class="stmno"><b>موجودی ثبت نشده</b></div>'}`)};
const aBanks=()=>'';
let acTmp={};
function acFormHTML(s){const isNew=!s.id,bk=acTmp.bank;
  return `<div class="sh-h"><div><b>${isNew?'حساب جدید':'ویرایش حساب'}</b><small class="shsub">بانک از روی شبا یا شماره کارت خودکار تشخیص داده می‌شود</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="acpick" id="acPick">${BK_PICK.map(n=>`<button class="acp${bk===n?' on':''}" data-act="acPickB" data-b="${n}">${bankBadge(n,'lg')}<span>${n}</span></button>`).join('')}</div>
  <div class="bzw" style="animation:none"><div class="ef"><label for="acN">نام حساب</label><input id="acN" value="${esc(s.name||'')}" placeholder="نام حساب" autocomplete="off"></div>
  <div class="ef"><label for="acI">شماره شبا <i>(اختیاری)</i></label><div class="ibin"><input id="acI" inputmode="numeric" value="${esc(ibanGroups((s.iban||'').replace(/^IR/,'')))}" placeholder="شماره شبا (۲۴ رقم)" autocomplete="off"><span class="ibir">IR</span><span class="ibbk" id="acIb"></span></div></div>
  <div class="ef"><label for="acK">شماره کارت <i>(اختیاری)</i></label><input id="acK" class="ltr" inputmode="numeric" value="${esc(grp4(s.card||''))}" placeholder="۱۶ رقم" autocomplete="off"></div>
  ${isNew?`<div class="ef"><label for="acB">موجودی فعلی <i>(تومان، اختیاری)</i></label><input id="acB" class="ltr" inputmode="numeric" placeholder="۰" autocomplete="off"></div>`:''}</div>
  <button type="button" class="pmi aclk acownf${acTmp.own?' on':''}" data-act="acOwnF"><span class="bri">${ic('bank')}</span><span class="tx"><b>حساب مغازه</b><small>در صفحه بانک با مانده، و در انتخاب حواله سندها بیاید</small></span><i class="tg"></i></button>
  <button class="xgo" data-act="acSave" data-id="${s.id||'new'}">${ic('check')} ذخیره حساب</button>${isNew?'':`<button class="edel" data-act="acDel" data-id="${s.id}">${ic('trash')} حذف این حساب</button>`}`}
function acBindForm(){const I=$('acI'),K=$('acK'),B=$('acB'),N=$('acN');
  const det=()=>{const v=dg(I.value).slice(0,24),c=dg(K.value).slice(0,16),b=(v.length>=5?BANKS[v.slice(2,5)]:'')||bankOfCard(c);if(b&&b!==acTmp.bank){acTmp.bank=b;document.querySelectorAll('#acPick .acp').forEach(x=>x.classList.toggle('on',x.dataset.b===b));const on=document.querySelector('#acPick .acp.on');if(on)on.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}const bb=$('acIb');if(bb)bb.innerHTML=v.length>=5&&BANKS[v.slice(2,5)]?bankBadge(BANKS[v.slice(2,5)],'lg'):'';if(N&&!N.value.trim()&&b&&acTmp.autoName!==false){N.placeholder=b+' '+(ME?ME.name.split(' ').pop():'')}};
  I.oninput=()=>{I.value=ibanGroups(dg(I.value).slice(0,24));det()};K.oninput=()=>{K.value=grp4(dg(K.value).slice(0,16));det()};if(B)B.oninput=()=>{const v=num(B.value);B.value=v?v.toLocaleString('en-US'):''};det();
  const on=document.querySelector('#acPick .acp.on');if(on)setTimeout(()=>on.scrollIntoView({inline:'center',block:'nearest'}),50)}
ACT.acNew=()=>{acTmp={bank:'',own:1};sheet(acFormHTML({}));acBindForm();setTimeout(()=>{const n=$('acN');if(n)n.focus()},300)};
ACT.acEdit=d=>{const s=sources.find(x=>x.id==d.id);if(!s)return;acTmp={bank:acBank(s),own:isOwn(s)?1:0};sheet(acFormHTML(s));acBindForm()};
ACT.acOwnF=()=>{acTmp.own=acTmp.own?0:1;const b=document.querySelector('#sheet .acownf');if(b)b.classList.toggle('on',!!acTmp.own)};
ACT.acPickB=d=>{acTmp.bank=d.b;document.querySelectorAll('#acPick .acp').forEach(x=>x.classList.toggle('on',x.dataset.b===d.b))};
ACT.acSave=d=>{let name=clean($('acN').value);const dI=dg($('acI').value).slice(0,24),card=dg($('acK').value).slice(0,16),bank=acTmp.bank||'';
  if(!name)name=bank?bank+(card?' '+card.slice(-4):''):'';if(!name){toast('نام حساب را بنویسید یا بانک را انتخاب کنید',true);$('acN').focus();return}
  if(dI&&dI.length!==24){toast('شماره شبا باید ۲۴ رقم باشد',true);return}if(card&&card.length!==16){toast('شماره کارت باید ۱۶ رقم باشد',true);return}
  if(sources.some(x=>x.name===name&&String(x.id)!==String(d.id))){toast('حسابی با همین نام هست',true);return}
  const now=new Date().toISOString();let s;
  if(d.id==='new'){s={id:nid++,name,bank,limit:0,count:0,iban:dI?'IR'+dI:'',card};if(acTmp.own)s.own=1;else if(ownSet())s.own=0;const B=$('acB');if(B&&num(B.value)){s.bal=num(B.value);s.balAt=now}sources.push(s)}
  else{s=sources.find(x=>x.id==d.id);if(!s)return;const old=s.name;Object.assign(s,{name,bank,iban:dI?'IR'+dI:'',card});if(acTmp.own!=null&&(ownSet()||!acTmp.own||!isOwn(s))){if(!ownSet())sources.forEach(z=>{if(z!==s&&z.own==null)z.own=1});s.own=acTmp.own?1:0}if(old!==name||1){let ch=false;Object.values(drafts).forEach(L=>(L||[]).forEach(pp=>{if(pp.src&&String(pp.src.id)===String(s.id)){pp.src={...pp.src,name,bank};ch=true}}));batches.forEach(b=>{if(b.closed)return;b.items.forEach(x=>{if(x.src===old){x.src=name;ch=true}})});if(ch){saveD();saveB()}}}
  saveS();logA('src',d.id==='new'?'حساب بانکی جدید':'ویرایش حساب بانکی',name);closeSheet();const af=acTmp.after,rt=acTmp.ret;acTmp.after=null;acTmp.ret=null;if(d.id==='new'&&af){af(s);return}if(rt){rt(s);if(d.id==='new')toast('حساب «'+name+'» اضافه شد ✓');return}render();if(d.id==='new')toast('حساب «'+name+'» اضافه شد ✓')};
ACT.acDel=d=>{const s=sources.find(x=>x.id==d.id);if(!s)return;askConfirm('حساب «'+s.name+'» حذف شود؟ (گزارش‌های قبلی دست نمی‌خورند)','حذف',()=>{sources=sources.filter(x=>x.id!=d.id);saveS();logA('src','حذف حساب بانکی',s.name);if(aSt&&aSt.srcId==d.id)aSt.srcId=(sources[0]||{}).id;closeSheet();const rt=acTmp&&acTmp.ret;if(rt){acTmp.ret=null;rt(null)}else render();toast('حذف شد')})};
/* ---- v61.94 (خواسته صاحب اپ): «حساب بانک واحد» ----
   هر حساب بانک (منبع واریزی، مثل «بانک سینا داداشی») = یک حساب: موجودی الان (آخرین تطبیق + حواله‌های خورده از سندها + کارتخوان
   واریزشده + واریز − برداشت − واریزهای ارسالی)، کارتخوانِ در راه (کارتخوان‌هایی که به همین حساب وصل‌اند و هنوز به حساب ننشسته‌اند)
   و پیش‌بینی فردا (موجودی + کارتخوان در راه − رزرو واریزهای ارسال‌نشده). هر کارت بالا = فیلتر گردش همان نوع با جزئیات و عکس.
   وصل کارتخوان به حساب: ch.srcId (روی رکورد سیستمی کارتخوان در custs؛ فرمت داده‌های قبلی دست نمی‌خورد).
   اگر وصل نشده باشد و فقط یک حساب با همان بانکِ نام کارتخوان باشد، خودکار همان حساب در نظر گرفته می‌شود. */
const bkNm=n=>canon(n);/* canon نام بانک، «بانک» و فاصله‌ها را برمی‌دارد */
function chSrc(c){if(!c)return null;if(c.srcId!=null&&c.srcId!==''){if(c.srcId==='-')return null;return sources.find(s=>String(s.id)===String(c.srcId))||null}
  const n=bkNm(c.name),M=sources.filter(s=>{const b=acBank(s);return b&&bkNm(b)&&(n===bkNm(b)||n.startsWith(bkNm(b))||canon(s.name)===canon(c.name))});return M.length===1?M[0]:null}
const chAuto=c=>!(c.srcId!=null&&c.srcId!=='')&&!!chSrc(c);
const acPOS=s=>CH('pos').filter(c=>{const z=chSrc(c);return z&&String(z.id)===String(s.id)});
const acPosPend=s=>acPOS(s).reduce((a,c)=>a+Math.max(0,chBal(c)),0);
const acTmr=s=>{const e=acEst(s);return e==null?null:e+acPosPend(s)-acRes(s)};
let acV={id:null,f:'all'},bkId=null,bkCnt=null;
const curBk=()=>bkId==null?null:sources.find(s=>String(s.id)===String(bkId))||null;
const bxTime=at=>{if(!at)return '';const d=new Date(at);return isNaN(d)?'':toFa(p2(d.getHours())+':'+p2(d.getMinutes()))};
/* ردیف‌های گردش یک حساب؛ همان کارت ردیف «گردش حساب» مشتری (fcard › txr). f: hv حواله، pos کارتخوان، out برداشت */
/* v66.8 (خواسته صاحب اپ): بعد از «اصلاح حساب» گردش‌های قبلی هم دیده می‌شوند — زیر خط «اصلاح حساب» و کم‌رنگ،
   چون در مانده ثبت‌شده حساب شده‌اند و دیگر در مانده جمع نمی‌شوند (acSum همان قبلی است). کارت‌های کارتخوانِ روزهای قبل «نشسته ✓». */
const AC_OLD=200;
function acRows(s){const R=[],L=(s.led||[]).filter(x=>!x.del),ba=s.balAt||'',add=(f,o)=>{const old=!!(ba&&!o.res&&!o.way&&String(o.oat||o.at||'')<ba);if(old)o.h=o.h.replace('class="txr bxtx','class="txr bxtx old');R.push({f,old,...o})},td=todayISO();
  const ico=(K,i,cl)=>`<span class="bri bxbi ${cl}">${K.length?`<img data-ik="${esc(K[0])}" alt="">`:ic(i)}${K.length>1?`<em>${toFa(K.length)}</em>`:''}</span>`;
  const val=(a,lab,cl)=>`<span class="txv txv2"><b class="${cl||(a<0?'r':'b')}"><span><bdi dir="ltr">${a<0?'−':'+'}${fmt(Math.abs(a))}</bdi> <i>تومان</i></span><small>${lab}</small></b></span>`;
  /* هر ردیف مثل گردش حساب مشتری: کارت با کشیدن (ردیف‌های دستی: کشیدن = حذف) */
  const row=o=>`<div class="fcard">${swW(`<${o.act?'button':'div'} class="txr bxtx${o.cls?' '+o.cls:''}"${o.act||''}>${o.av}<span class="tx"><b>${o.t}</b><small>${o.sub}</small></span>${o.v}</${o.act?'button':'div'}>`,o.x||{r:[],l:[],data:{}})}</div>`;
  const del=x=>({r:[],l:can('src')?[['acLedDel','حذف','trash','#d23c48']]:[],data:{id:s.id,l:x.id}});
  for(const c of custs){if(c.del||c.sys)continue;for(const t of c.txs||[]){if(t.del||t.type!=='inv')continue;(t.pays||[]).forEach(p=>{if(p.srcId==null||String(p.srcId)!==String(s.id))return;const a=+p.amount||0,K=(p.imgs&&p.imgs.length?p.imgs:p.img?[p.img]:[]);
    add('hv',{at:t.at,d:t.date,a,h:row({act:` data-act="cuInv" data-cu="${c.id}" data-tx="${t.id}"`,av:ico(K,a>0?'down':'share','t-inv'),t:(a>0?'حواله از ':'حواله به ')+esc(cuName(c)),sub:esc([invTitle(t),bxTime(t.at),p.tn?'پیگیری '+toFa(p.tn):''].filter(Boolean).join(' · ')),v:val(a,a>0?'دریافت':'پرداخت')})})})}}
  L.filter(x=>x.type==='pos'&&!x.auto).forEach(x=>add('pos',{at:x.at,d:x.date,a:+x.amount||0,h:row({av:ico([],'down','t-pin'),t:x.note?esc(x.note):'کارتخوان به حساب نشست',sub:esc([bxTime(x.at),x.by||''].filter(Boolean).join(' · ')),v:val(+x.amount||0,'نشسته'),x:del(x)})}));
  acPOS(s).forEach(ch=>chMoves(ch).forEach(m=>{if(m.own||m.a<=0)return;const ok=String(m.d||'')<td;add('pos',{at:m.at,oat:ok?posSetAt(m.d):'',way:!ok,d:m.d,a:m.a,h:row({cls:ok?'':'way',act:` data-act="cuInv" data-cu="${m.cu}" data-tx="${m.tx}"`,av:ico([],'card',ok?'t-pin':'t-pend'),t:esc(m.t),sub:esc([ch.name,m.sub,bxTime(m.at)].filter(Boolean).join(' · ')),v:ok?val(m.a,'نشسته ✓'):val(m.a,'در راه · فردا','w')})})}));
  L.filter(x=>x.type==='in').forEach(x=>add('hv',{at:x.at,d:x.date,a:+x.amount||0,h:row({av:ico([],'plus','t-pin'),t:x.note?esc(x.note):'واریز به حساب',sub:esc(['ثبت دستی',bxTime(x.at),x.by||''].filter(Boolean).join(' · ')),v:val(+x.amount||0,'واریز'),x:del(x)})}));
  if(s.balAt)batches.forEach(b=>b.items.forEach(x=>{if(x.src!==s.name||x.st==='fail')return;const at=x.sAt||b.createdAt,K=itImgs(b,x);
    add('out',{at,d:String(at||'').slice(0,10)||b.date,a:-(+x.amount||0),h:row({act:` data-act="openEnt" data-id="${x.id}"`,av:ico(K,'share','t-pout'),t:esc(x.name||'واریزی'),sub:esc(['واریزی لیست '+dates(b.pay||b.date).fa,x.iban?'شبا …'+toFa(String(x.iban).slice(-6)):'',x.tn?'پیگیری '+toFa(x.tn):''].filter(Boolean).join(' · ')),v:val(-(+x.amount||0),x.st==='ok'?'تأیید بانک':'ارسال‌شده')})})}));
  L.filter(x=>x.type==='out').forEach(x=>add('out',{at:x.at,d:x.date,a:-(+x.amount||0),h:row({av:ico([],'share','t-pout'),t:x.note?esc(x.note):'برداشت',sub:esc(['ثبت دستی',bxTime(x.at),x.by||''].filter(Boolean).join(' · ')),v:val(-(+x.amount||0),'برداشت'),x:del(x)})}));
  Object.values(drafts||{}).forEach(Lp=>(Lp||[]).forEach(p=>{if(p.sent||!p.src||String(p.src.id)!==String(s.id))return;partRows(p).forEach(r=>add('out',{at:'',res:1,d:PD(r),a:0,h:row({cls:'way',act:` data-act="openEnt" data-id="${r.id}"`,av:ico([],'clock','t-pend'),t:esc(fullName(r)),sub:esc('واریزی لیست '+dates(PD(r)).fa+' · هنوز ارسال نشده'),v:val(-(+r.amount||0),'در صف ارسال','w')})}))}));
  R.sort((a,b)=>(a.res||0)-(b.res||0)||String(b.at||'').localeCompare(String(a.at||'')));
  if(!ba)return R;const N=R.filter(r=>!r.old),O=R.filter(r=>r.old).slice(0,AC_OLD);if(!O.length)return N;
  const bd=new Date(ba),bi=bd.getFullYear()+'-'+p2(bd.getMonth()+1)+'-'+p2(bd.getDate()),mk={f:'mark',old:true,at:ba,d:bi,h:`<div class="bxmk"><span>${ic('edit')} اصلاح حساب · ${esc(relDay(bi))} ${esc(bxTime(ba))}</span><b>${s.bal<0?'−':''}${fmt(Math.abs(+s.bal||0))} <i>تومان</i></b><small>گردش‌های زیر در همین مانده حساب شده‌اند</small></div>`};
  return [...N,mk,...O]}
const ACF=[['hv','حواله‌ها'],['pos','کارتخوان'],['out','برداشت‌ها']];
function acListHTML(s,R){const f=acV.f,L0=f==='all'?R:R.filter(r=>r.f===f||r.f==='mark'),L=L0.some(r=>r.old&&r.f!=='mark')?L0:L0.filter(r=>r.f!=='mark');
  if(!L.length)return `<div class="stmno">${ic(f==='pos'?'card':f==='out'?'share':'swap')}<b>${f==='all'?'گردشی ثبت نشده':f==='hv'?'حواله‌ای نخورده':f==='pos'?'کارتخوانی نیست':'برداشتی نیست'}</b><small>${s.balAt?'از تطبیق '+esc(dates(s.balAt.slice(0,10)).fa):'حواله‌های سندها اینجا می‌آیند'}</small></div>`;
  let g=null;return L.map(r=>{let d='';if(r.f==='mark'){g=null;return r.h}const k=r.res?'res':r.d||'';if(k!==g){g=k;if(r.res)d='<div class="fday">در صف ارسال · هنوز از حساب کم نشده</div>';else{const t=relDay(k);d=`<div class="fday">${['امروز','دیروز','فردا'].includes(t)?t+'، ':''}${esc(dates(k).fa)}</div>`}}return d+r.h}).join('')}
/* صفحه حساب: کارت «مانده حساب» (مانده نهایی + مانده قبلی)، سه کاشی جمع که فیلتر فهرست هم هستند، بعد گردش حساب */
function vBank(){const s=curBk();if(!s){setTimeout(()=>{if(cur==='bank')go('banks',true)},0);return ''}const m=acSum(s),R=acRows(s),an=bkCnt!==String(s.id),cnt=f=>R.filter(r=>r.f===f&&!r.res&&!r.old).length,c=can('src');
  /* v66.2: یک کادر آبی (مانده نهایی + مانده قبلی و الان در حساب) با دکمه «اصلاح حساب»؛ زیرش جمع‌ها به‌صورت زبانه‌های فشرده */
  const ft=(f,l,v,n)=>`<button class="bxft${acV.f===f?' on':''}" data-act="acF" data-f="${f}" aria-pressed="${acV.f===f}"><small>${l} <i>${toFa(n)}</i></small>${bxSg(v)}</button>`;
  const sub=m.known?'قبلی '+fmt(m.prev)+' · الان در حساب '+(m.now<0?'−':'')+fmt(Math.abs(m.now))+(m.posWay?'</span><span>کارتخوان '+fmt(m.posWay)+' تومان فردا می‌نشیند':''):'مانده قبلی این حساب ثبت نشده';
  return `${bxBlue({t:'مانده نهایی',v:m.known?m.fin:null,an,sub,btn:c?`<button class="bxfix" data-act="acSetBal" data-id="${s.id}">${ic(m.known?'edit':'plus')} ${m.known?'اصلاح حساب':'ثبت مانده قبلی'}</button>`:''})}
  ${m.res?`<div class="bxres">${ic('clock')}<span>رزرو واریزهای ارسال‌نشده <b>${fmt(m.res)}</b> تومان · بعد از ارسال از مانده کم می‌شود</span></div>`:''}
  <div class="bxfs">${ft('hv','حواله‌ها',m.hv+m.ledIn,cnt('hv'))}${ft('pos','کارتخوان',m.pos,cnt('pos'))}${ft('out','برداشت',-m.out,cnt('out'))}</div>
  <div id="acLW">${acListHTML(s,R)}</div>`}
const aBank=()=>'';
const bindBank=()=>{const s=curBk();if(!s)return;phPaint($('view'));const k=String(s.id);if(bkCnt===k)return;bkCnt=k;requestAnimationFrame(()=>cuCount('#view .bxblue.anim .cbn'))};
/* سرتیتر صفحه حساب: کارت بانک (لوگو، نام، شبا)؛ زدن = ویرایش حساب */
const bkHead=s=>{const bk=acBank(s);return `<button class="cuh9 bxh9" data-act="acEdit" data-id="${s.id}" aria-label="ویرایش ${esc(s.name)}"><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):esc(userInit(s.name))}</span><span class="cuh9t"><span class="cuh9k">حساب بانک</span><span class="cuh9n"><b>${esc(s.name)}</b></span><span class="cuh9m">${esc([bk?'بانک '+bk:'',s.iban?'شبا …'+toFa(s.iban.slice(-4)):''].filter(Boolean).join(' · '))}</span></span><span class="c6ed">${ic('edit')}</span></button>`};
ACT.bkMenu=()=>{const s=curBk();if(!s)return;const k=s.bal!=null,c=can('src');popMenu(document.querySelector('#bar .hpl'),[c&&k?['acLedNew',ic('down'),'کارتخوان به حساب نشست',{id:s.id,t:'pos'}]:null,c&&k?['acLedNew',ic('plus'),'واریز به حساب',{id:s.id,t:'in'}]:null,c&&k?['acLedNew',ic('share'),'برداشت از حساب',{id:s.id,t:'out'}]:null,c?['acSetBal',ic('edit'),k?'اصلاح حساب (تطبیق با اپ بانک)':'ثبت مانده قبلی',{id:s.id}]:null,c&&CH('pos').length?['acLink',ic('card'),'کارتخوان‌های این حساب',{id:s.id}]:null,c?['acEdit',ic('bank'),'ویرایش اطلاعات حساب',{id:s.id}]:null].filter(Boolean))};
ACT.acOpen=d=>{const s=sources.find(x=>String(x.id)===String(d.id));if(!s)return;closeSheet();if(String(acV.id)!==String(s.id))acV={id:s.id,f:'all'};bkId=s.id;if(cur==='bank'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;return}go('bank')};
/* زدن کاشی جمع = همان دسته؛ زدن دوباره = همه؛ فهرست با جهت می‌لغزد */
ACT.acF=d=>{const s=curBk();if(!s)return;const o=acV.f;acV.f=d.f===o&&d.f!=='all'?'all':d.f;const W=$('acLW');
  document.querySelectorAll('#view .bxft').forEach(b=>{const on=b.dataset.f===acV.f;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  if(W){const m=flipSnap(W);W.innerHTML=acListHTML(s,acRows(s));flipPlay(W,m);phPaint(W);if(!RM()&&W.animate)W.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.9,.25,1)'})}};
/* وصل کارتخوان‌ها به این حساب */
ACT.acLink=d=>{const s=sources.find(x=>String(x.id)===String(d.id));if(!s)return;const P=CH('pos');
  sheet(`<div class="sh-h"><div><b>کارتخوان‌های «${esc(s.name)}»</b><small class="shsub">کارتخوانی که پولش به این حساب می‌نشیند را روشن کنید</small></div><button class="x" data-act="acBack" data-id="${s.id}" aria-label="بازگشت">×</button></div>
  <div class="fcard blist">${P.map(c=>{const z=chSrc(c),on=z&&String(z.id)===String(s.id);return `<button class="pmi aclk${on?' on':''}" data-act="chLink" data-ch="${c.id}" data-src="${s.id}"><span class="bri pos">${ic('card')}</span><span class="tx"><b>${esc(c.name)}</b><small>${on?(chAuto(c)?'خودکار وصل است (هم‌نام بانک) · زدن = قطع':'وصل به همین حساب'):z?'الان وصل به «'+esc(z.name)+'»':'به حسابی وصل نیست'} · در راه ${fmt(Math.max(0,chBal(c)))}</small></span><i class="tg"></i></button>`}).join('')}</div>
  <button class="xgo" data-act="acBack" data-id="${s.id}">${ic('check')} تمام</button>`)};
ACT.chLinkPick=d=>{const c=custs.find(z=>String(z.id)===String(d.id));if(!c)return;sheet(`<div class="sh-h"><div><b>«${esc(c.name)}» به کدام حساب؟</b><small class="shsub">پول این کارتخوان در این حساب جمع می‌شود</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="cufg2">${ownL().map(s=>{const bk=acBank(s);return `<button class="cufr" data-act="chLinkSet" data-ch="${c.id}" data-src="${s.id}"><span class="cufi">${bk?bankBadge(bk):ic('bank')}</span><span class="tx"><b>${esc(s.name)}</b><small>${esc(bk?'بانک '+bk:'بانک نامشخص')}</small></span><span class="cufc">${ic('check')}</span></button>`}).join('')}</div>`)};
ACT.chLinkSet=d=>{const c=custs.find(z=>String(z.id)===String(d.ch)),s=sources.find(z=>String(z.id)===String(d.src));if(!c||!s)return;c.srcId=s.id;c.updatedAt=ns();saveCu();logA('cust','وصل کارتخوان به حساب',c.name+' ← '+s.name);closeSheet();bkRe();toast('«'+c.name+'» به «'+s.name+'» وصل شد')};
ACT.chLink=d=>{const c=custs.find(z=>String(z.id)===String(d.ch));if(!c)return;const z=chSrc(c),on=z&&String(z.id)===String(d.src);c.srcId=on?'-':d.src;c.updatedAt=ns();saveCu();logA('cust',on?'قطع کارتخوان از حساب':'وصل کارتخوان به حساب',c.name+(on?'':' ← '+((sources.find(s=>String(s.id)===String(d.src))||{}).name||'')));ACT.acLink({id:d.src});bkRe()};
ACT.acSetBal=d=>{const s=sources.find(x=>x.id==d.id);if(!s)return;const first=s.bal==null,e=first?null:acEst(s);
  sheet(`<div class="sh-h"><div><b>${first?'مانده قبلی':'اصلاح حساب'} «${esc(s.name)}»</b><small class="shsub">${first?'موجودی امروز را از اپ بانک بزنید؛ حواله‌ها، کارتخوان و برداشت‌ها از همین عدد حساب می‌شوند':'موجودی واقعی را از اپ بانک بزنید؛ از این لحظه حساب با همین عدد ادامه پیدا می‌کند'}</small></div><button class="x" data-act="acBack" data-id="${s.id}" aria-label="بستن">×</button></div>
  ${first?'':`<div class="c6l c6lb cub9"><span class="c6v c6vb">${bxTile('در برنامه',e,e<0?'d':'c',0,{neg:e<0})}</span></div>`}
  <div class="px8a"><small>${first?'مانده قبلی':'موجودی واقعی بانک'}</small><label class="px8i"><input id="acB2" class="ltr" inputmode="numeric" autocomplete="off" enterkeyhint="done" aria-label="مبلغ"><i>تومان</i></label><div class="px8l" id="acB2v"></div></div>
  <button class="xgo" data-act="acBal" data-id="${s.id}">${ic('check')} ${first?'ثبت مانده قبلی':'ثبت اصلاح حساب'}</button>`);
  const B=$('acB2');B.oninput=()=>{const v=num(B.value);B.value=v?v.toLocaleString('en-US'):'';const o=$('acB2v');if(first||!B.value){o.innerHTML='';return}const df=v-e;o.className='px8l'+(df?' bad':' ok');o.innerHTML=df?'اختلاف با برنامه <b class="n">'+(df>0?'+':'−')+fmt(Math.abs(df))+'</b>':'<b>با برنامه یکی است ✓</b>'};B.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();ACT.acBal({id:s.id})}};sheetFocus(B)};
ACT.acBack=d=>{closeSheet();if(cur==='bank'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}else ACT.acOpen(d)};
ACT.acLedNew=d=>{const s=sources.find(x=>x.id==d.id),T=LT[d.t];if(!s||!T)return;
  sheet(`<div class="sh-h"><div><b>${T.t} · ${esc(s.name)}</b><small class="shsub">${d.t==='pos'?'مبلغی که امشب از کارتخوان به این حساب نشسته':d.t==='in'?'هر واریزی غیر از کارتخوان به این حساب':'هر برداشت یا انتقالی که خارج از لیست واریزی بوده'}</small></div><button class="x" data-act="acBack" data-id="${s.id}" aria-label="بستن">×</button></div>
  <div class="px8a"><small>مبلغ</small><label class="px8i"><input id="lgA" class="ltr" inputmode="numeric" autocomplete="off" aria-label="مبلغ"><i>تومان</i></label></div><div class="ef"><label for="lgN">توضیح <i>(اختیاری)</i></label><input id="lgN" autocomplete="off"></div>
  <button class="xgo" data-act="acLedSave" data-id="${s.id}" data-t="${d.t}">${ic('check')} ثبت</button>`);
  const A=$('lgA');A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''};sheetFocus(A)};
ACT.acLedSave=d=>{const s=sources.find(x=>x.id==d.id);if(!s)return;const a=num($('lgA').value);if(!a){toast('مبلغ را وارد کنید',true);return}const now=new Date().toISOString();(s.led=s.led||[]).push({id:nid++,type:d.t,amount:a,note:clean($('lgN').value||''),date:todayISO(),at:now,by:who()});s.updatedAt=now;saveS();logA('src',LT[d.t].t,s.name+' | '+fmt(a)+' تومان');render();ACT.acOpen({id:s.id});toast(LT[d.t].t+' ثبت شد · موجودی '+fmt(acEst(s))+' تومان')};
ACT.acLedDel=d=>{const s=sources.find(x=>x.id==d.id),x=s&&(s.led||[]).find(z=>String(z.id)===String(d.l));if(!x)return;askConfirm('این ردیف حذف شود؟'+(x.chTx?' (مبلغ به مانده کارتخوان برمی‌گردد)':''),'حذف',()=>{x.del=true;s.updatedAt=new Date().toISOString();saveS();if(x.chTx){const ch=custs.find(z=>String(z.id)===String(x.chId)),t=ch&&(ch.txs||[]).find(z=>String(z.id)===String(x.chTx));if(t){t.del=true;t.delAt=s.updatedAt;saveCu()}}render();ACT.acOpen({id:s.id});toast('حذف شد')})};
/* ثبت گروهی کارتخوان شبانه */
/* v66.3: ثبت کارتخوان امشب — هر حساب مغازه یک ردیف (لوگو، نام، مانده نهایی، کادر مبلغ) و جمع در کادر آبی */
ACT.posNight=()=>{const L=ownL(),t=todayISO(),done=new Map();sources.forEach(s=>(s.led||[]).forEach(x=>{if(!x.del&&x.type==='pos'&&x.date===t)done.set(s.id,(done.get(s.id)||0)+(+x.amount||0))}));
  sheet(`<div class="sh-h"><div><b>واریز کارتخوان امشب</b><small class="shsub">${esc(dates(t).fa)} · مبلغی که امشب به هر حساب نشسته؛ خالی‌ها ثبت نمی‌شوند</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${L.length?`<div class="c6l bxlist pnl">${L.map(s=>{const bk=acBank(s),f=acFin(s),w=acPosPend(s);return `<label class="c6r bxrow pnr"><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):esc(userInit(s.name))}</span><span class="tx"><b>${esc(s.name)}</b><small>${[f==null?'مانده قبلی ثبت نشده':'مانده '+fmt(f),w?'در راه '+fmt(w):'',done.get(s.id)?'امروز +'+fmt(done.get(s.id)):''].filter(Boolean).join(' · ')}</small></span><input class="ltr pin" data-sid="${s.id}" inputmode="numeric" placeholder="۰" autocomplete="off" aria-label="کارتخوان ${esc(s.name)}"${w?` data-w="${w}"`:''}></label>`}).join('')}</div>
  ${bxBlue({t:'جمع کارتخوان امشب',v:0,sub:'<span id="posN">هنوز مبلغی وارد نشده</span>'}).replace('<span class="cbn"','<span class="cbn" id="posT"')}
  <button class="xgo" data-act="posSave">${ic('check')} ثبت و به‌روزرسانی مانده‌ها</button>`:'<div class="stmno"><b>حساب مغازه‌ای نیست</b></div>'}`);
  const sh=$('sheet');sh.oninput=e=>{const t=e.target;if(!t.classList.contains('pin'))return;const v=num(t.value);t.value=v?v.toLocaleString('en-US'):'';let a=0,n=0;sh.querySelectorAll('.pin').forEach(i=>{const x=num(i.value);if(x){a+=x;n++}});const T=$('posT'),N=$('posN');if(T){T.textContent=fmt(a);if(!RM()&&T.animate)T.animate([{transform:'scale(1.06)'},{transform:'none'}],{duration:220})}if(N)N.textContent=n?toFa(n)+' حساب':'هنوز مبلغی وارد نشده'}};
ACT.posSave=()=>{const now=new Date().toISOString(),t=todayISO();let n=0,a=0;document.querySelectorAll('#sheet .pin').forEach(i=>{const v=num(i.value),s=sources.find(x=>String(x.id)===i.dataset.sid);if(!v||!s)return;(s.led=s.led||[]).push({id:nid++,type:'pos',amount:v,note:'',date:t,at:now,by:who()});s.updatedAt=now;n++;a+=v});if(!n){toast('مبلغی وارد نشده',true);return}saveS();logA('src','کارتخوان شبانه',fmt(n)+' حساب | '+fmt(a)+' تومان');closeSheet();render();toast('کارتخوان '+fmt(n)+' حساب ثبت شد · '+fmt(a)+' تومان')};
ACT.acBal=d=>{const s=sources.find(x=>x.id==d.id),B=$('acB2');if(!s||!B)return;const raw=B.value.trim();if(!raw){toast('موجودی را وارد کنید',true);B.focus();return}const v=num(raw),first=s.bal==null,old=first?null:acEst(s);s.bal=v;s.balAt=new Date().toISOString();s.updatedAt=s.balAt;saveS();logA('src',first?'موجودی اولیه':'تطبیق موجودی',s.name+' | '+fmt(v)+' تومان'+(old!=null&&old!==v?' (برنامه: '+fmt(old)+')':''));render();ACT.acOpen({id:s.id});toast(first?'موجودی اولیه «'+s.name+'» ثبت شد ✓':'موجودی تطبیق داده شد ✓')};


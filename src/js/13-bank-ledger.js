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
function vBanks(){bxWas=!!document.querySelector('#view .bxh');const L=ownL(),K=L.filter(s=>s.bal!=null),S=new Map(L.map(s=>[s.id,acSum(s)])),tot=k=>K.reduce((a,s)=>a+S.get(s.id)[k],0),pt=posToday(),hr=new Date().getHours(),fin=tot('fin');
  const P=CH('pos'),un=P.filter(c=>!chSrc(c)),cell=(l,v,cl,sg)=>`<div class="${cl}"><small>${l}</small><b>${sg&&v?sg:''}${bxN(v)}</b></div>`;
  let h=`<div class="bxh"><small>مانده نهایی بانک‌ها</small>${K.length?`<b class="bxhn${fin<0?' neg':''}">${fin<0?'−':''}${bxN(fin)}<i>تومان</i></b>`:'<b class="bxhn nb">مانده قبلی حساب‌ها ثبت نشده</b>'}
  <div class="bxhs">${cell('مانده قبلی',tot('prev'),'')}${cell('حواله‌ها',tot('hv'),tot('hv')<0?'r':'g',tot('hv')<0?'− ':'+ ')}${cell('کارتخوان',tot('pos'),'w','+ ')}${cell('برداشت',tot('out'),'r','− ')}</div>
  <em>${toFa(L.length)} حساب مغازه${K.length<L.length?' · '+toFa(L.length-K.length)+' تا بدون مانده قبلی':''}</em></div>`;
  if(!sources.length)return h+bkExtraHTML(un)+`<div class="spempty"><div class="spill">${ic('bank')}</div><b>هنوز حسابی اضافه نکرده‌اید</b><span>حساب‌های بانکی مغازه را با «حساب جدید» اضافه کنید؛ حواله‌ها، کارتخوان و برداشت‌ها روی همین حساب‌ها جمع می‌شوند.</span></div>`;
  if(!ownSet()&&can('src'))h+=`<button class="bxown" data-act="acOwn"><span class="bxoi">${ic('check')}</span><span class="tx"><b>حساب‌های مغازه را مشخص کنید</b><small>فقط حساب‌های خود مغازه در این صفحه و انتخاب حواله بیایند</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`;
  if(can('src'))h+=`<button class="posbar${!pt.n&&hr>=18?' due':''}" data-act="posNight"><span class="pi">${ic('down')}</span><span class="tx"><b>ثبت واریز کارتخوان امشب</b><small>${pt.n?'امروز '+fmt(pt.n)+' حساب ثبت شد · '+fmt(pt.a)+' تومان':'موجودی همه حساب‌ها یکجا به‌روز می‌شود'}</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`;
  const O=L.slice().sort((a,b)=>(b.bal!=null)-(a.bal!=null)||(S.get(b.id).fin-S.get(a.id).fin));
  h+=`<div class="spsec bxsec"><div><b>حساب‌های مغازه</b><small>زدن = ریز حواله، کارتخوان و برداشت</small></div>${can('src')&&ownSet()?`<button class="bxmg" data-act="acOwn">${ic('edit')} انتخاب حساب‌ها</button>`:''}</div><div class="bxl">`;
  O.forEach((s,ri)=>{const bk=acBank(s),m=S.get(s.id),k=m.known,pills=[m.hv?`<span class="${m.hv<0?'r':'g'}">حواله <bdi dir="ltr">${m.hv<0?'−':'+'}${fmt(Math.abs(m.hv))}</bdi></span>`:'',m.pos?`<span class="w">کارتخوان <bdi dir="ltr">+${fmt(m.pos)}</bdi></span>`:'',m.out?`<span class="r">برداشت <bdi dir="ltr">−${fmt(m.out)}</bdi></span>`:''].filter(Boolean);
    h+=swW(`<button class="bxc" data-act="acOpen" data-id="${s.id}" style="--r:${Math.min(ri,8)}"><span class="bxct">${bk?bankBadge(bk,'lg'):`<span class="bkb lg" style="--bc:#64748b">${esc(userInit(s.name))}</span>`}<span class="tx"><b>${esc(s.name)}</b><small>${esc(bk?'بانک '+bk:'بانک نامشخص')}${k?' · قبلی '+fmt(m.prev):''}</small></span>
      <span class="bxcv">${k?`<small>مانده نهایی</small><b class="${m.fin<0?'neg':''}">${m.fin<0?'−':''}${bxN(m.fin)}<i>تومان</i></b>`:`<small>مانده قبلی</small><b class="nb">${ic('plus')} ثبت</b>`}</span></span>
      ${pills.length?`<span class="bxcp">${pills.join('')}</span>`:''}</button>`,{r:[['acEdit','ویرایش','edit','#3b6fd6']],l:[['acDel','حذف','trash','#d23c48']],data:{id:s.id}})});
  h+='</div>';
  return h+bkExtraHTML(un)}
let bxWas=false;
const aBanksBind=()=>{if(cur==='banks'&&!bxWas)acCount($('view'))};
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
function bkExtraHTML(un){const P=CH('pos'),st=goldStock(),gk=Object.keys(st).filter(k=>st[k]),as=assetStock(),ak=Object.keys(as);let h='';un=un||P.filter(c=>!chSrc(c));
  if(un.length)h+=`<div class="spsec"><b>کارتخوان‌های وصل‌نشده</b><small>بگویید پول هر کارتخوان به کدام حساب می‌نشیند تا در همان حساب جمع شود</small></div><div class="fcard blist">${un.map(c=>{const v=chBal(c);return `<div class="posw"><button class="chrow" data-act="chOpen" data-id="${c.id}"><span class="bri pos">${ic('card')}</span><span class="tx"><b>${esc(c.name)}</b><small>${v?'در راه '+fmt(v)+' تومان':'همه واریز شده'}</small></span></button>${can('src')&&sources.length?`<button class="posdep" data-act="chLinkPick" data-id="${c.id}">${ic('bank')}<span>وصل کن</span></button>`:''}</div>`}).join('')}</div>`;
  if(can('src'))h+=`<button class="chrow chnew bk9mg" data-act="chOpenAll"><span class="bri">${ic('card')}</span><span class="tx"><b>${P.length?'کارتخوان‌ها':'تعریف کارتخوان'}</b><small>${P.length?fmt(P.length)+' کارتخوان · افزودن، گردش، واریز به حساب':'کارتخوان مغازه را تعریف کنید'}</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`;
  if(gk.length||ak.length)h+=`<div class="spsec"><b>موجودی مغازه</b><small>از خریدها، فروش‌ها، دریافت و تحویل‌های ثبت‌شده</small></div><div class="stks">${gk.map(k=>`<div class="${st[k]<0?'neg':''}"><small>${esc(k)}</small><b>${wFmt(st[k])}<i>گرم</i></b></div>`).join('')}${ak.map(k=>`<div class="${as[k]<0?'neg':''}"><small>${esc((XA[k]||{t:k}).t)}</small><b>${qFmt(as[k])}<i>${esc((XA[k]||{u:''}).u)}</i></b></div>`).join('')}</div>`;
  return h}
const aBanks=()=>can('src')?`<button class="fab2" data-act="acNew">${ic('plus')} حساب جدید</button>`:'';
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
let acV={id:null,f:'hv'};
/* ردیف‌های ریز هر حساب، در سه دسته: hv حواله‌ها، pos کارتخوان، out برداشت‌ها (+ واریز دستی در همان دسته‌ای که به آن می‌خورد) */
const bxDay=d=>{const t=todayISO();if(d===t)return 'امروز';const y=new Date(Date.now()-864e5);return d===y.toISOString().slice(0,10)?'دیروز':dates(d).wd+' '+dates(d).fa};
const bxTime=at=>{if(!at)return '';const d=new Date(at);return isNaN(d)?'':toFa(p2(d.getHours())+':'+p2(d.getMinutes()))};
function acRows(s){const R=[],L=acLed(s),add=(f,o)=>R.push({f,...o});
  const imgCell=(K,ico,cl)=>`<span class="bxi ${cl}">${K.length?`<img data-ik="${esc(K[0])}" alt="">`:ic(ico)}${K.length>1?`<em>${toFa(K.length)}</em>`:''}</span>`;
  const row=(o)=>`<${o.act?'button':'div'} class="bxr${o.cls?' '+o.cls:''}"${o.act||''}>${o.av}<span class="tx"><b>${o.t}</b><small>${o.sub}</small></span><span class="bxrv ${o.vc}"><b>${o.v}</b>${o.tag?`<small>${o.tag}</small>`:''}</span>${o.x||''}${o.act?ic('back').replace('class="i"','class="i flip bxch"'):''}</${o.act?'button':'div'}>`;
  /* حواله‌های سندها */
  for(const c of custs){if(c.del||c.sys)continue;for(const t of c.txs||[]){if(t.del||t.type!=='inv'||(s.balAt&&String(t.at||'')<s.balAt))continue;(t.pays||[]).forEach(p=>{if(p.srcId==null||String(p.srcId)!==String(s.id))return;const a=+p.amount||0,K=(p.imgs&&p.imgs.length?p.imgs:p.img?[p.img]:[]);
    add('hv',{at:t.at,d:t.date,a,h:row({act:` data-act="cuInv" data-cu="${c.id}" data-tx="${t.id}"`,av:imgCell(K,a>0?'down':'share',a>0?'g':'r'),t:(a>0?'حواله از ':'حواله به ')+esc(cuName(c)),
      sub:[esc(invTitle(t)),bxTime(t.at),p.tn?'پیگیری <bdi dir="ltr">'+esc(toFa(p.tn))+'</bdi>':'',t.by?esc(t.by):''].filter(Boolean).join(' · '),vc:a>0?'g':'r',v:(a>0?'+ ':'− ')+fmt(Math.abs(a)),tag:a>0?'دریافت':'پرداخت'})})})}}
  /* کارتخوان: نشسته در حساب (ثبت شبانه) و در راه (کارت‌های کشیده‌شده در سندها روی کارتخوان‌های وصل به این حساب) */
  L.filter(x=>x.type==='pos').forEach(x=>add('pos',{at:x.at,d:x.date,a:+x.amount||0,h:row({av:imgCell([],'down','g'),t:x.note?esc(x.note):'کارتخوان به حساب نشست',sub:[bxTime(x.at),x.by?esc(x.by):''].filter(Boolean).join(' · '),vc:'g',v:'+ '+fmt(x.amount),tag:'نشسته',x:can('src')?`<button class="bxx" data-act="acLedDel" data-id="${s.id}" data-l="${x.id}" aria-label="حذف">×</button>`:''})}));
  acPOS(s).forEach(ch=>chMoves(ch).forEach(m=>{if(m.own||m.a<=0||(s.balAt&&String(m.at||'')<s.balAt))return;add('pos',{at:m.at,d:m.d,a:m.a,way:1,h:row({cls:'way',act:` data-act="cuInv" data-cu="${m.cu}" data-tx="${m.tx}"`,av:imgCell([],'card','w'),t:esc(m.t),sub:[esc(ch.name),esc(m.sub),bxTime(m.at)].filter(Boolean).join(' · '),vc:'w',v:'+ '+fmt(m.a),tag:'در راه · فردا'})})}));
  /* واریز دستی */
  L.filter(x=>x.type==='in').forEach(x=>add('hv',{at:x.at,d:x.date,a:+x.amount||0,h:row({av:imgCell([],'plus','g'),t:x.note?esc(x.note):'واریز به حساب',sub:['ثبت دستی',bxTime(x.at),x.by?esc(x.by):''].filter(Boolean).join(' · '),vc:'g',v:'+ '+fmt(x.amount),tag:'واریز',x:can('src')?`<button class="bxx" data-act="acLedDel" data-id="${s.id}" data-l="${x.id}" aria-label="حذف">×</button>`:''})}));
  /* برداشت‌ها: هر واریزی ارسال‌شده از این حساب یک ردیف، با نام، شبا، پیگیری و وضعیت؛ و برداشت دستی */
  batches.forEach(b=>b.items.forEach(x=>{if(x.src!==s.name||x.st==='fail'||(s.balAt&&String(x.sAt||b.createdAt||'')<s.balAt)||!s.balAt)return;const at=x.sAt||b.createdAt,K=itImgs(b,x),st=x.st==='ok'?['k','تأیید بانک']:['w','ارسال‌شده'];
    add('out',{at,d:String(at||'').slice(0,10)||b.date,a:-(+x.amount||0),h:row({act:` data-act="openEnt" data-id="${x.id}"`,av:imgCell(K,'share','r'),t:esc(x.name||'واریزی'),sub:[x.iban?'<bdi dir="ltr">…'+esc(toFa(String(x.iban).slice(-6)))+'</bdi>':'','لیست '+esc(dates(b.pay||b.date).fa),x.tn?'پیگیری <bdi dir="ltr">'+esc(toFa(x.tn))+'</bdi>':''].filter(Boolean).join(' · '),vc:'r',v:'− '+fmt(x.amount),tag:`<i class="bxs ${st[0]}">${st[1]}</i>`})})}));
  L.filter(x=>x.type==='out').forEach(x=>add('out',{at:x.at,d:x.date,a:-(+x.amount||0),h:row({av:imgCell([],'share','r'),t:x.note?esc(x.note):'برداشت',sub:['ثبت دستی',bxTime(x.at),x.by?esc(x.by):''].filter(Boolean).join(' · '),vc:'r',v:'− '+fmt(x.amount),tag:'برداشت',x:can('src')?`<button class="bxx" data-act="acLedDel" data-id="${s.id}" data-l="${x.id}" aria-label="حذف">×</button>`:''})}));
  /* رزرو: تخصیص‌های ارسال‌نشده (هنوز از حساب کم نشده) */
  Object.values(drafts||{}).forEach(Lp=>(Lp||[]).forEach(p=>{if(p.sent||!p.src||String(p.src.id)!==String(s.id))return;partRows(p).forEach(r=>add('out',{at:'',res:1,d:PD(r),a:0,h:row({cls:'way',act:` data-act="openEnt" data-id="${r.id}"`,av:imgCell([],'split','w'),t:esc(fullName(r)),sub:'لیست '+esc(dates(PD(r)).fa)+' · هنوز ارسال نشده',vc:'w',v:fmt(r.amount),tag:'در صف ارسال'})}))}));
  return R.sort((a,b)=>(a.res||0)-(b.res||0)||String(b.at||'').localeCompare(String(a.at||'')))}
const ACF=[['hv','حواله‌ها'],['pos','کارتخوان'],['out','برداشت‌ها']];
function acListHTML(s,R){const f=acV.f,L=R.filter(r=>r.f===f);if(!L.length)return `<div class="bxe">${ic(f==='hv'?'swap':f==='pos'?'card':'split')}<b>${f==='hv'?'حواله‌ای نخورده':f==='pos'?'کارتخوانی نیست':'برداشتی نیست'}</b><small>${s.balAt?'از تطبیق '+esc(dates(s.balAt.slice(0,10)).fa):''}</small></div>`;
  let h='',g=null,i=0;L.forEach(r=>{const k=r.res?'res':r.d||'';if(k!==g){g=k;h+=`<div class="bxg">${r.res?'رزرو · بعد از ارسال برداشت می‌شود':esc(bxDay(k))}</div>`}h+=r.h.replace(/^<(button|div) class="bxr/,`<$1 style="--i:${Math.min(i++,12)}" class="bxr`)});return h}
function acOpenHTML(s){const bk=acBank(s),m=acSum(s),R=acRows(s),n=f=>R.filter(r=>r.f===f&&!r.res).length,k=m.known;
  const ln=(f,l,sub,v,sg,cl,act)=>`<button class="bxln${cl?' '+cl:''}" data-act="${act||'acF'}" data-f="${f}" data-id="${s.id}"><span class="tx"><b>${l}</b>${sub?`<small>${sub}</small>`:''}</span><span class="bxlv"><i>${sg}</i>${bxN(v)}</span></button>`;
  return `<div class="sh-h"><div class="acsh">${bk?bankBadge(bk,'lg'):''}<div><b>${esc(s.name)}</b><small class="shsub">${esc(bk?'بانک '+bk:'')}${s.iban?' · <bdi dir="ltr">'+esc(ibanGroups(s.iban.slice(2)))+'</bdi>':''}</small></div></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bxd${k?'':' nb'}"><small>مانده نهایی</small>${k?`<b class="${m.fin<0?'neg':''}">${m.fin<0?'−':''}${bxN(m.fin)}<i>تومان</i></b><span>الان در حساب ${m.now<0?'−':''}${fmt(Math.abs(m.now))}${m.posWay?' · کارتخوان '+fmt(m.posWay)+' فردا می‌نشیند':''}</span>`:`<b>—</b><span>مانده قبلی این حساب ثبت نشده؛ موجودی امروز را از اپ بانک بزنید تا مانده نهایی حساب شود.</span><div class="ac9i"><input id="acB2" class="ltr" inputmode="numeric" placeholder="مانده قبلی (تومان)" autocomplete="off"><button data-act="acBal" data-id="${s.id}">${ic('check')} ثبت</button></div>`}</div>
  ${k?`<div class="bxlg">${ln('prev','مانده قبلی','تطبیق '+esc(dates((s.balAt||'').slice(0,10)||todayISO()).fa)+' · زدن = تطبیق دوباره',m.prev,m.prev<0?'−':'','','acSetBal')}
    ${ln('hv','حواله‌های دریافتی',toFa(m.nIn)+' حواله'+(m.ledIn?' + واریز دستی':''),m.hvIn+m.ledIn,'+','g')}
    ${m.hvOut?ln('hv','حواله‌های پرداختی',toFa(m.nOut)+' حواله',m.hvOut,'−','r'):''}
    ${ln('pos','کارتخوان',m.posWay?(m.posIn?'نشسته '+fmt(m.posIn)+' · ':'')+'در راه '+fmt(m.posWay):'نشسته در حساب',m.pos,'+','w')}
    ${ln('out','برداشت‌ها',(m.sent?'واریزی‌های ارسالی '+fmt(m.sent):'')+(m.ledOut?(m.sent?' · ':'')+'دستی '+fmt(m.ledOut):'')||'واریزی ارسال‌شده‌ای نیست',m.out,'−','r')}
    <div class="bxlt"><b>مانده نهایی</b><span class="bxlv"><i>${m.fin<0?'−':''}</i>${bxN(m.fin)}</span></div>
    ${m.res?`<div class="bxlr">${ic('split')}<span>رزرو واریزهای ارسال‌نشده <b>${fmt(m.res)}</b> · بعد از ارسال از مانده کم می‌شود</span></div>`:''}</div>`:''}
  <div class="bxtb" role="tablist" style="--k:${ACF.findIndex(z=>z[0]===acV.f)}">${ACF.map(([f,t])=>`<button role="tab" aria-selected="${acV.f===f}" class="${acV.f===f?'on':''}" data-act="acF" data-f="${f}">${t}<i>${toFa(n(f))}</i></button>`).join('')}<span class="bxtp"></span></div>
  <div class="bxll" id="acLW">${acListHTML(s,R)}</div>
  ${can('src')?`<div class="bxac">${(()=>{const P=acPOS(s);return CH('pos').length?`<button data-act="acLink" data-id="${s.id}">${ic('card')}<span>${P.length?toFa(P.length)+' کارتخوان':'وصل کارتخوان'}</span></button>`:''})()}${k?`<button data-act="acLedNew" data-id="${s.id}" data-t="pos">${ic('down')}<span>کارتخوان نشست</span></button><button data-act="acLedNew" data-id="${s.id}" data-t="in">${ic('plus')}<span>واریز</span></button><button data-act="acLedNew" data-id="${s.id}" data-t="out">${ic('share')}<span>برداشت</span></button>`:''}</div>`:''}
  <button class="emore" data-act="acEdit" data-id="${s.id}">${ic('edit')} ویرایش اطلاعات حساب</button>`}
function acCount(root){if(RM())return;const E=[...(root||$('sheet')).querySelectorAll('.acn')].filter(e=>+e.dataset.v);const t0=performance.now(),D=700;const f=n=>{const q=Math.min(1,(n-t0)/D),k=1-Math.pow(1-q,3);E.forEach(e=>e.textContent=fmt(Math.round(+e.dataset.v*k)));if(q<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
ACT.acOpen=d=>{const s=sources.find(x=>x.id==d.id);if(!s)return;if(String(acV.id)!==String(s.id))acV={id:s.id,f:'hv'};sheet(acOpenHTML(s));phPaint($('sheet'));acCount();
  const B=$('acB2');if(B){B.oninput=()=>{const v=num(B.value);B.value=v?v.toLocaleString('en-US'):''};B.onkeydown=ev=>{if(ev.key==='Enter')ACT.acBal({id:s.id})};sheetFocus(B)}};
/* زدن هر خط جمع یا هر زبانه = همان دسته پایین؛ فهرست با جهت زبانه می‌لغزد */
ACT.acF=d=>{const s=sources.find(x=>String(x.id)===String(acV.id));if(!s)return;const f=ACF.some(z=>z[0]===d.f)?d.f:acV.f,o=ACF.findIndex(z=>z[0]===acV.f),nI=ACF.findIndex(z=>z[0]===f);acV.f=f;
  const T=document.querySelector('#sheet .bxtb'),W=$('acLW');if(T){T.style.setProperty('--k',nI);T.querySelectorAll('button').forEach(b=>{const on=b.dataset.f===f;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)})}
  if(W){W.innerHTML=acListHTML(s,acRows(s));phPaint(W);if(!RM()&&W.animate&&o!==nI)W.animate([{opacity:0,transform:`translateX(${(nI>o?-1:1)*22}px)`},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.9,.25,1)'})}
  if(T&&d.id)try{T.scrollIntoView({block:'start',behavior:RM()?'auto':'smooth'})}catch(_){}};
/* وصل کارتخوان‌ها به این حساب */
ACT.acLink=d=>{const s=sources.find(x=>String(x.id)===String(d.id));if(!s)return;const P=CH('pos');
  sheet(`<div class="sh-h"><div><b>کارتخوان‌های «${esc(s.name)}»</b><small class="shsub">کارتخوانی که پولش به این حساب می‌نشیند را روشن کنید</small></div><button class="x" data-act="acBack" data-id="${s.id}" aria-label="بازگشت">×</button></div>
  <div class="fcard blist">${P.map(c=>{const z=chSrc(c),on=z&&String(z.id)===String(s.id);return `<button class="pmi aclk${on?' on':''}" data-act="chLink" data-ch="${c.id}" data-src="${s.id}"><span class="bri pos">${ic('card')}</span><span class="tx"><b>${esc(c.name)}</b><small>${on?(chAuto(c)?'خودکار وصل است (هم‌نام بانک) · زدن = قطع':'وصل به همین حساب'):z?'الان وصل به «'+esc(z.name)+'»':'به حسابی وصل نیست'} · در راه ${fmt(Math.max(0,chBal(c)))}</small></span><i class="tg"></i></button>`}).join('')}</div>
  <button class="xgo" data-act="acBack" data-id="${s.id}">${ic('check')} تمام</button>`)};
ACT.chLinkPick=d=>{const c=custs.find(z=>String(z.id)===String(d.id));if(!c)return;sheet(`<div class="sh-h"><div><b>«${esc(c.name)}» به کدام حساب؟</b><small class="shsub">پول این کارتخوان در این حساب جمع می‌شود</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="cufg2">${ownL().map(s=>{const bk=acBank(s);return `<button class="cufr" data-act="chLinkSet" data-ch="${c.id}" data-src="${s.id}"><span class="cufi">${bk?bankBadge(bk):ic('bank')}</span><span class="tx"><b>${esc(s.name)}</b><small>${esc(bk?'بانک '+bk:'بانک نامشخص')}</small></span><span class="cufc">${ic('check')}</span></button>`}).join('')}</div>`)};
ACT.chLinkSet=d=>{const c=custs.find(z=>String(z.id)===String(d.ch)),s=sources.find(z=>String(z.id)===String(d.src));if(!c||!s)return;c.srcId=s.id;c.updatedAt=ns();saveCu();logA('cust','وصل کارتخوان به حساب',c.name+' ← '+s.name);closeSheet();bkRe();toast('«'+c.name+'» به «'+s.name+'» وصل شد')};
ACT.chLink=d=>{const c=custs.find(z=>String(z.id)===String(d.ch));if(!c)return;const z=chSrc(c),on=z&&String(z.id)===String(d.src);c.srcId=on?'-':d.src;c.updatedAt=ns();saveCu();logA('cust',on?'قطع کارتخوان از حساب':'وصل کارتخوان به حساب',c.name+(on?'':' ← '+((sources.find(s=>String(s.id)===String(d.src))||{}).name||'')));ACT.acLink({id:d.src});bkRe()};
ACT.acSetBal=d=>{const s=sources.find(x=>x.id==d.id);if(!s)return;const e=acEst(s);
  sheet(`<div class="sh-h"><div><b>تطبیق موجودی «${esc(s.name)}»</b><small class="shsub">موجودی واقعی را از اپ بانک وارد کنید؛ از این لحظه حساب با همین عدد ادامه پیدا می‌کند</small></div><button class="x" data-act="acBack" data-id="${s.id}" aria-label="بستن">×</button></div>
  <div class="acnow"><div><small>موجودی محاسبه‌شده در برنامه</small><b>${fmt(e)} <i>تومان</i></b></div></div>
  <div class="bzw" style="animation:none"><div class="ef"><label for="acB2">موجودی واقعی بانک <i>(تومان)</i></label><input id="acB2" class="ltr acbig" inputmode="numeric" autocomplete="off"><small class="eh" id="acB2v"></small></div></div>
  <button class="xgo" data-act="acBal" data-id="${s.id}">${ic('check')} ثبت و تطبیق</button>`);
  const B=$('acB2');B.oninput=()=>{const v=num(B.value);B.value=v?v.toLocaleString('en-US'):'';const o=$('acB2v'),df=v-e;o.className='eh'+(df?' bad':' ok');o.textContent=!B.value?'':df?'اختلاف با برنامه: '+(df>0?'+':'−')+fmt(Math.abs(df))+' تومان':'با برنامه یکی است ✓'};sheetFocus(B)};
ACT.acBack=d=>ACT.acOpen(d);
ACT.acLedNew=d=>{const s=sources.find(x=>x.id==d.id),T=LT[d.t];if(!s||!T)return;
  sheet(`<div class="sh-h"><div><b>${T.t} · ${esc(s.name)}</b><small class="shsub">${d.t==='pos'?'مبلغی که امشب از کارتخوان به این حساب نشسته':d.t==='in'?'هر واریزی غیر از کارتخوان به این حساب':'هر برداشت یا انتقالی که خارج از لیست واریزی بوده'}</small></div><button class="x" data-act="acBack" data-id="${s.id}" aria-label="بستن">×</button></div>
  <div class="bzw" style="animation:none"><div class="ef"><label for="lgA">مبلغ <i>(تومان)</i></label><input id="lgA" class="ltr acbig" inputmode="numeric" autocomplete="off"></div><div class="ef"><label for="lgN">توضیح <i>(اختیاری)</i></label><input id="lgN" autocomplete="off"></div></div>
  <button class="xgo" data-act="acLedSave" data-id="${s.id}" data-t="${d.t}">${ic('check')} ثبت</button>`);
  const A=$('lgA');A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''};sheetFocus(A)};
ACT.acLedSave=d=>{const s=sources.find(x=>x.id==d.id);if(!s)return;const a=num($('lgA').value);if(!a){toast('مبلغ را وارد کنید',true);return}const now=new Date().toISOString();(s.led=s.led||[]).push({id:nid++,type:d.t,amount:a,note:clean($('lgN').value||''),date:todayISO(),at:now,by:who()});s.updatedAt=now;saveS();logA('src',LT[d.t].t,s.name+' | '+fmt(a)+' تومان');render();ACT.acOpen({id:s.id});toast(LT[d.t].t+' ثبت شد · موجودی '+fmt(acEst(s))+' تومان')};
ACT.acLedDel=d=>{const s=sources.find(x=>x.id==d.id),x=s&&(s.led||[]).find(z=>String(z.id)===String(d.l));if(!x)return;askConfirm('این ردیف حذف شود؟'+(x.chTx?' (مبلغ به مانده کارتخوان برمی‌گردد)':''),'حذف',()=>{x.del=true;s.updatedAt=new Date().toISOString();saveS();if(x.chTx){const ch=custs.find(z=>String(z.id)===String(x.chId)),t=ch&&(ch.txs||[]).find(z=>String(z.id)===String(x.chTx));if(t){t.del=true;t.delAt=s.updatedAt;saveCu()}}render();ACT.acOpen({id:s.id});toast('حذف شد')})};
/* ثبت گروهی کارتخوان شبانه */
ACT.posNight=()=>{const L=ownL().filter(s=>s.bal!=null),t=todayISO(),done=new Map();sources.forEach(s=>(s.led||[]).forEach(x=>{if(!x.del&&x.type==='pos'&&x.date===t)done.set(s.id,(done.get(s.id)||0)+(+x.amount||0))}));
  sheet(`<div class="sh-h"><div><b>واریز کارتخوان امشب</b><small class="shsub">${esc(dates(t).fa)} · مبلغ هر حساب را وارد کنید؛ خالی‌ها ثبت نمی‌شوند</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${L.length?`<div class="sgr smg posl">${L.map(s=>{const bk=acBank(s);return `<div class="posr">${bk?bankBadge(bk,'lg'):`<span class="bkb lg" style="--bc:#64748b">${esc(userInit(s.name))}</span>`}<span class="tx"><b>${esc(s.name)}</b><small>موجودی ${fmt(acEst(s))}${done.get(s.id)?' · امروز +'+fmt(done.get(s.id)):''}</small></span><input class="ltr pin" data-sid="${s.id}" inputmode="numeric" placeholder="۰" autocomplete="off"></div>`}).join('')}</div>
  <div class="postot"><span>جمع کارتخوان</span><b id="posT">۰</b><i>تومان</i></div><button class="xgo" data-act="posSave">${ic('check')} ثبت و به‌روزرسانی موجودی‌ها</button>`:'<div class="spempty" style="padding:20px 8px"><b>اول موجودی اولیه حساب‌ها را بدهید</b></div>'}`);
  const sh=$('sheet');sh.oninput=e=>{const t=e.target;if(!t.classList.contains('pin'))return;const v=num(t.value);t.value=v?v.toLocaleString('en-US'):'';let a=0;sh.querySelectorAll('.pin').forEach(i=>a+=num(i.value));$('posT').textContent=fmt(a)}};
ACT.posSave=()=>{const now=new Date().toISOString(),t=todayISO();let n=0,a=0;document.querySelectorAll('#sheet .pin').forEach(i=>{const v=num(i.value),s=sources.find(x=>String(x.id)===i.dataset.sid);if(!v||!s)return;(s.led=s.led||[]).push({id:nid++,type:'pos',amount:v,note:'',date:t,at:now,by:who()});s.updatedAt=now;n++;a+=v});if(!n){toast('مبلغی وارد نشده',true);return}saveS();logA('src','کارتخوان شبانه',fmt(n)+' حساب | '+fmt(a)+' تومان');closeSheet();render();toast('کارتخوان '+fmt(n)+' حساب ثبت شد · '+fmt(a)+' تومان')};
ACT.acBal=d=>{const s=sources.find(x=>x.id==d.id),B=$('acB2');if(!s||!B)return;const raw=B.value.trim();if(!raw){toast('موجودی را وارد کنید',true);B.focus();return}const v=num(raw),first=s.bal==null,old=first?null:acEst(s);s.bal=v;s.balAt=new Date().toISOString();s.updatedAt=s.balAt;saveS();logA('src',first?'موجودی اولیه':'تطبیق موجودی',s.name+' | '+fmt(v)+' تومان'+(old!=null&&old!==v?' (برنامه: '+fmt(old)+')':''));render();ACT.acOpen({id:s.id});toast(first?'موجودی اولیه «'+s.name+'» ثبت شد ✓':'موجودی تطبیق داده شد ✓')};


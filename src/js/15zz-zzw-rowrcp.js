/* ============ v109.4 بررسی رسید روی ردیف‌های خود سند (کارتخوان، حواله، حواله مشتری) ============
   خواسته صاحب اپ: «این قسمت عکس رسید بانکی که از کارتخوان و حواله‌ها می‌خواهم تأیید بدهد، باید در خود فاکتور قسمت عکس‌ها اضافه شود».
   وقتی روی ردیف کارتخوان/حواله (پنجره ردیف سند یا دستگاه تسویه) عکس رسید زده می‌شود، همان موتور بررسی رسید واریزی (15zz-zzv: rcvOne، rcvNums)
   روی همین گوشی می‌خواند و مبلغ ردیف را روی رسید جستجو می‌کند (ریال = تومان×۱۰ یا تومان):
   ok = مبلغ روی رسید هست → سبز «رسید درست است»؛ fill = مبلغ ردیف خالی/پیشنهادی بود → مبلغ رسید گذاشته می‌شود؛ bad = عدد دیگری روی رسید است → قرمز با «مبلغ رسید را بگذار»؛
   unk = ناخوانا → زرد، تأیید با کاربر. نتیجه روی ردیف می‌ماند: p.rv={t:'ok'|'man',a,k,at,by} (k = کلید همان عکس) و روی عکس تیک سبز می‌خورد. شماره پیگیری خوانده‌شده
   (اطمینان ≥ ۰٫۸) در ردیف بی‌پیگیری نوشته می‌شود. چیزی بی‌صدا عوض نمی‌شود جز گذاشتن مبلغ در خانه خالی و پیگیری خالی. */
const prvFor=x=>!!x&&(['pos','hav','cust','dep','nm'].includes(x.m)||(x.m==='bkx'&&x.k==='bpos'));
RCVP.fill=3;
let PRVB=0;
const prvIsCK=x=>typeof CK!=='undefined'&&!!CK&&x===CK;
const prvLab=x=>{try{return phName(x)}catch(_){return x.m==='pos'?'کارتخوان':'حواله'}};
function prvRe(x){if(prvIsCK(x)){if(CK===x&&$('sheet').querySelector('.ckw'))ckRe()}else{if(typeof svKeep==='function')svKeep();if(cur==='sell'&&typeof qaRe==='function')qaRe()}}
function prvRead(x){try{if(prvIsCK(x))ckRead();else if(typeof qaRead==='function')qaRead()}catch(_){}}
function prvMark(x,k,t,a){x.rv={t,a:+a||0,k,at:new Date().toISOString(),by:who()}}
function prvPut(x,a){prvRead(x);x.amount=a;if(prvIsCK(x))CK.pre=0}
function prvRun(x,u,k){if(!prvFor(x)||!u)return;if(PRVB){toastBg('بررسی رسید قبلی هنوز تمام نشده');return}PRVB=1;prvGo(x,u,k).catch(()=>{rcvPill('');toastBg('بررسی رسید انجام نشد؛ مبلغ را خودتان با عکس مقایسه کنید')}).finally(()=>{PRVB=0;rcvPill('')})}
async function prvGo(x,u,k){prvRead(x);const A0=+x.amount||0,pre=prvIsCK(x)&&!!CK.pre,A=pre?0:A0;
  rcvPill('بررسی رسید…');
  const ev=(text,P)=>{const N=rcvNums(text),pa=+(P&&P.amount)||0,pc=(P&&P.conf&&P.conf.amount)||0,has=v=>v>0&&(N.has(v*10)||N.has(v)||pa===v),tn=P&&P.tn&&((P.conf&&P.conf.tn)||0)>=.8?String(P.tn):'';
    if(A&&has(A))return {t:'ok',a:A,c:1,tn};if(!A&&pre&&has(A0))return {t:'ok',a:A0,c:1,tn,pf:1};let R=pc>=.6?pa:0,c=pc;if(!R){const o=prvAmtLine(text)||(typeof ocrPick==='function'?ocrPick(text):0);if(o>=1000){R=o;c=.7}}if(R)return {t:A?'bad':'fill',a:R,c,tn};return {t:'unk',a:0,c:0,tn}};
  const r=await rcvOne(u,ev,n=>rcvPill(n?'بررسی رسید · چرخاندن عکس…':'بررسی رسید…'));rcvPill('');
  /* ردیف دیگر باز است (کاربر رفت سراغ کار دیگری) → فقط پیام */
  const live=prvIsCK(x)?CK===x:(typeof phT==='function'&&phT()===x);if(!live){toastBg(r.t==='ok'?'رسید درست بود':'رسید بررسی شد؛ ردیف را باز کنید و مبلغ را نگاه کنید');return}
  if(r.tn&&!clean(x.tn||'')&&x.m!=='pos'&&!(x.m==='bkx'))x.tn=rcvEn(r.tn).replace(/\D/g,'').slice(0,24);
  const img=`<span class="rcvim" style="background-image:url(${u})"></span>`,nm=esc(prvLab(x)),row=(l,v,s,c)=>`<span>${l}</span><b${c?` class="${c}"`:''}>${v}</b>${s?`<small>${s}</small>`:''}`;
  if(r.t==='ok'){if(r.pf){prvPut(x,r.a)}prvMark(x,k,'ok',r.a);prvRe(x);return askWarn({kind:'ok',ico:'check',t:'رسید درست است',sub:nm,h:`<div class="rcvc">${img}<div class="rcvg">${row('مبلغ روی رسید',fmt(r.a)+' تومان',rcvR(r.a))}${x.tn?row('پیگیری',`<span class="ltr">${esc(x.tn)}</span>`):''}</div></div>`,ok:'باشه'})}
  if(r.t==='fill'){if(r.c>=.85){prvPut(x,r.a);prvMark(x,k,'ok',r.a);prvRe(x);return askWarn({kind:'ok',ico:'check',t:'مبلغ از رسید خوانده شد',sub:nm+' · یک نگاه به عکس بیندازید',h:`<div class="rcvc">${img}<div class="rcvg">${row('مبلغ ردیف',fmt(r.a)+' تومان',rcvR(r.a))}</div></div>`,ok:'درست است'})}
    prvRe(x);return askWarn({kind:'info',ico:'info',t:'مبلغ رسید این است؟',sub:nm,h:`<div class="rcvc">${img}<div class="rcvg">${row('خوانده‌شده',fmt(r.a)+' تومان',rcvR(r.a))}</div></div>`,ok:'نه، دستی می‌زنم',goT:'بله · همین مبلغ',goMain:1,go:()=>{prvPut(x,r.a);prvMark(x,k,'man',r.a);prvRe(x)}})}
  if(r.t==='bad'){prvRe(x);return askWarn({kind:'err',ico:'alert',t:'مبلغ رسید با ردیف یکی نیست',sub:nm,h:`<div class="rcvc">${img}<div class="rcvg">${row('روی رسید',fmt(r.a)+' تومان',rcvR(r.a),'rd')}${row('مبلغ ردیف',fmt(A)+' تومان',rcvR(A))}</div></div>`,ok:'مبلغ خودم درست است',goT:'مبلغ رسید گذاشته شود',goMain:1,go:()=>{prvPut(x,r.a);prvMark(x,k,'ok',r.a);prvRe(x)}})}
  prvRe(x);
  if(!A0)return askWarn({kind:'warn',ico:'info',t:'مبلغ رسید خوانا نبود',sub:nm+' · مبلغ را خودتان بزنید',h:`<div class="rcvc">${img}<div class="rcvg">${row('مبلغ ردیف','—','')}</div></div>`,ok:'باشه'});
  return askWarn({kind:'warn',ico:'info',t:'مبلغ رسید خوانا نبود',sub:'عکس را نگاه کنید؛ اگر این مبلغ روی رسید هست تأیید کنید',h:`<div class="rcvc">${img}<div class="rcvg">${row('مبلغ ردیف',fmt(A0)+' تومان',rcvR(A0))}</div></div>`,ok:'فعلاً نه',goT:'روی رسید همین است · تأیید',goMain:1,go:()=>{prvMark(x,k,'man',A0);prvRe(x)}})}
/* تیک روی عکس تأییدشده؛ عکس حذف‌شده یا مبلغ عوض‌شده = تأیید از بین می‌رود */
/* خط «مبلغ» با رقم‌های گروه‌بندی‌شده با فاصله («۳ ۹۸۰ ۰۰۰ ۰۰۰»، گاهی وارونه خوانده می‌شود): گروه درست = اولی ۱ تا ۳ رقم و بقیه سه‌رقمی */
function prvAmtLine(t){let best=0;String(t||'').split(/\n/).forEach(l=>{if(!/مبلغ|amount/i.test(l))return;const s=rcvFix(l),tom=/تومان/.test(l);(s.match(/\d+(?:[ ,٬،.]+\d+)+|\d{5,}/g)||[]).forEach(m=>{const g=m.split(/[ ,٬،.]+/);for(const G of [g,g.slice().reverse()]){if(G.length>1&&!(G[0].length<=3&&G.slice(1).every(x=>x.length===3)))continue;const v=+G.join('');if(!(v>=1e4))continue;const a=tom?v:Math.round(v/10);if(a>best)best=a;break}})});return best}
const prvOk=x=>{const v=x&&x.rv;if(!v||!v.k)return '';if(!xrPh(x).includes(v.k)||Math.abs(+x.amount||0)!==Math.abs(+v.a||0))return '';return v.t};
const prvCls=(x,k)=>{const t=prvOk(x);return t&&x.rv.k===k?' rvok':''};
const prvKeep=(o,p)=>{const t=prvOk(p);if(t)o.rv={...p.rv,a:Math.abs(+p.amount||0)}};

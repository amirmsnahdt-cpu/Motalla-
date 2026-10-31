/* ===== v67.4 (خواسته صاحب اپ): «تسویه از مشتری» دیگر حساب مشتری باز نمی‌کند =====
   «دلار»، «نقدی»، «مشتری ۴۱۵۴»، «موسی قلک» و … فقط پرداخت‌کننده یک تسویه‌اند، نه مشتری. حساب بانک مغازه هم مشتری نیست.
   - پرداخت‌کننده‌ای که مشتری تعریف‌شده نیست: یک رکورد پنهان sys:'py' (مثل کارتخوان‌ها sys:'ch') که فقط سند «دریافت» تسویه را نگه می‌دارد؛
     در فهرست حساب مشتریان، جمع‌ها و جستجوی مشتری نمی‌آید (CU() رکوردهای sys را برنمی‌گرداند). همان نام دوباره = همان رکورد.
   - نامی که «بانک …» و یکی از حساب‌های بانک مغازه است: همان رکورد پنهان با src = شناسه حساب بانک؛ مانده‌اش در صفحه بانک
     همان حساب «برداشت / حواله» حساب می‌شود (pyMoves داخل srcMoves و acRows)، پس پس‌مانده به بخش بانک می‌رود.
   - حساب‌هایی که قبلاً این‌طور ساخته شده‌اند (بی‌تلفن، بی‌کد ملی، بی‌شبا/کارت، بی‌گروه/یادداشت/عکس، و همه ردیف‌هایشان فقط سند تسویه،
     یا نامشان «بانک …» یکی از حساب‌های مغازه) خودکار پنهان می‌شوند (pyMig در render). هیچ داده‌ای حذف نمی‌شود؛ سندها و تسویه‌ها سر جایشان. */
const isPy=c=>!!c&&c.sys==='py';
const pyNz=s=>String(s||'').replace(/ي/g,'ی').replace(/ك/g,'ک');
/* فقط نامی که کلمه «بانک» دارد و به یک حساب بانک مغازه می‌خورد (نام آدم‌ها مثل «سامان …» حساب بانک حساب نمی‌شوند) */
const pyBankSrc=name=>{const n=clean(pyNz(name));if(!n||!/بانک/.test(n)||!sources.length)return null;const k=canon(n);if(k.length<2)return null;
  const L=ownL();return L.find(s=>canon(s.name)===k)||L.find(s=>{const m=canon(s.name);return m.length>2&&(k.includes(m)||m.includes(k))})||null};
const pyFind=name=>{const k=nzName(stripName(name||''));return k?custs.find(c=>isPy(c)&&!c.del&&nzName(c.name)===k)||null:null};
function pyMake(o){const now=ns(),s=pyBankSrc(o.name),c={id:nid++,sys:'py',name:clean(stripName(o.name||'')),phone:phD(o.phone).length===11?phD(o.phone):'',txs:[],createdAt:now,lastAt:now,by:who()};
  if(s)c.src=s.id;custs.push(c);logA('cust','پرداخت‌کننده تسویه (بدون حساب مشتری)',cuName(c)+(s?' → حساب بانک «'+s.name+'»':''));return c}
/* پرداخت‌کننده تسویه: مشتری تعریف‌شده (انتخاب‌شده، یا با تلفن/نام یکتا) همان حساب؛ وگرنه رکورد پنهان — هیچ‌وقت حساب مشتری تازه */
function pyOf(o){if(o.cuId!=null&&o.cuId!==''){const c=custs.find(z=>!z.del&&String(z.id)===String(o.cuId)&&(!z.sys||isPy(z)));if(c)return c}
  if(pyBankSrc(o.name)){const p=pyFind(o.name);return p||pyMake(o)}
  return cuFindBy({name:o.name,phone:o.phone})||pyFind(o.name)||pyMake(o)}
/* ---------- پنهان کردن حساب‌هایی که قبلاً فقط از تسویه ساخته شده‌اند ---------- */
const pyStlTx=t=>t&&(t.auto==='stl'||((t.type==='pin'||t.type==='pout')&&t.entId!=null));
function pyLike(c){if(!c||c.del||c.sys)return false;
  if(phD(c.phone).length||String(c.nid||'').trim()||(c.bk&&(c.bk.iban||c.bk.card))||clean(c.grp||'')||clean(c.note||'')||c.av||(c.idImgs||[]).length)return false;
  if(pyBankSrc(cuName(c)))return true;const T=c.txs||[];return T.length>0&&T.every(pyStlTx)}
let pyMigSig='';
function pyMig(){if(!can('debt'))return 0;const sig=custs.length+'|'+sources.length+'|'+custs.reduce((a,c)=>a+(c.txs||[]).length,0);if(sig===pyMigSig)return 0;pyMigSig=sig;
  let n=0;const now=ns(),names=[];for(const c of custs){if(!pyLike(c))continue;const s=pyBankSrc(cuName(c));c.sys='py';if(s)c.src=s.id;c.pyAt=now;c.lastAt=now;n++;names.push(cuName(c)+(s?' → «'+s.name+'»':''))}
  if(n){saveCu();logA('cust','حساب‌های پرداخت‌کننده تسویه از فهرست مشتریان برداشته شد',names.join('، '))}return n}
/* ---------- مانده پرداخت‌کننده‌ای که حساب بانک مغازه است → گردش همان حساب بانک ---------- */
function pyMoves(s){const L=[];for(const c of custs){if(c.del||!isPy(c)||c.src==null||String(c.src)!==String(s.id))continue;
  for(const t of c.txs||[]){if(t.del||(s.balAt&&String(t.at||'')<s.balAt))continue;const a=-Math.round(txD(t).r||0);if(!a)continue;
    const p=(t.pays||[]).find(q=>q.m==='dep'),who=p&&p.entName?p.entName:(t.type==='inv'?invTitle(t):clean(t.note||''));
    L.push({at:t.at,date:t.date,a,cu:c.id,tx:t.id,t:(p?'تسویه واریزی ':a<0?'برداشت · ':'واریز · ')+who,sub:(t.type==='inv'?'سند '+toFa(t.no):'')+(p&&p.tn?' · پیگیری '+p.tn:''),K:p?(p.imgs&&p.imgs.length?p.imgs:p.img?[p.img]:[]):[]})}}return L}

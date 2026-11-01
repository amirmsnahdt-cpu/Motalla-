/* ============ v69.3 (خواسته صاحب اپ): یک مشتری = یک واریزی در هر لیست ============
   مشکل: خرید دوباره از مشتری‌ای که در همان لیست واریز (همان تاریخ واریز) واریزی دارد، واریزی دوم جدا می‌ساخت.
   حالا در پنجره خرید، اگر واریزی قبلی همان مشتری (همان حساب، شبای یکسان یا خالی) هنوز به بانک نرفته، خرید تازه خودکار به همان
   اضافه می‌شود: مبلغ جمع، تفکیک هر خرید در e.buys (فاکتور، وزن، هر گرم، اقلام، زمان) و در جزئیات واریزی بخش «خریدهای این واریزی».
   سند خودکار حساب مشتری (depDocFix) با همان شماره دوباره ساخته می‌شود و همه اقلام را دارد؛ تسویه‌های خرید تازه به همان واریزی می‌روند.
   واریزی فرستاده‌شده به بانک (در پیگیری) یا تکه‌شده از چند منبع دست نمی‌خورد → واریزی جدا (خواسته صاحب اپ).
   برای دو واریزی قبلی یک مشتری: کارت «یکی کردن» در جزئیات (دستی، با تأیید). هر یکی‌کردن در تاریخچه (نوع merge) برگشت‌پذیر است. */
const mgCu=e=>e&&(e.cuId!=null&&e.cuId!==''?e.cuId:e.wd&&e.wd.cu!=null?e.wd.cu:null);
const mgSent=e=>{let F;try{F=famOf(e)}catch(_){F=[e]}if(!F.length)F=[e];return !!e.sentBid||F.some(p=>p.sentBid||entBI(p))};
const mgStl=e=>(e.settles||[]).filter(z=>+z.amount>0);
/* واریزی‌ای که می‌شود خرید دیگری را به آن اضافه کرد */
function mgOk(e){if(!e||e.del||!entries.includes(e)||e.splitOf||mgSent(e))return false;let F;try{F=famOf(e)}catch(_){F=[e]}if(F.length>1)return false;
  if(e.wd){const D=depDoc(e);if(!D||D.t.auto!=='dep'||String(D.t.entId)!==String(e.id))return false}/* واریزی مانده سند فروش (15q) جداست */
  return true}
function mgSame(a,b){const ca=mgCu(a),cb=mgCu(b);if(ca!=null&&cb!=null)return String(ca)===String(cb);
  return !!a.iban&&a.iban===b.iban&&nzName(stripName(a.name||''))===nzName(stripName(b.name||''))}
const mgIbanFit=(a,b)=>!a.iban||!b.iban||a.iban===b.iban;
/* واریزی هم‌لیست همان مشتری که هنوز به بانک نرفته (قدیمی‌ترین) */
function mgFind(o,skip){return entries.filter(t=>t!==skip&&t.id!==o.id&&(t.payDate||'')===(o.payDate||'')&&mgSame(t,o)&&mgIbanFit(t,o)&&mgOk(t)).sort((a,b)=>a.id-b.id)[0]||null}
/* اقلام یک خرید؛ اگر جمع اقلام با مبلغ نمی‌خواند، یک ردیف طلا با وزن و مبلغ */
function mgItems(p){const I=(p.items||[]).filter(z=>+z.amt);if(I.length&&Math.round(I.reduce((s,z)=>s+(+z.amt||0),0))===Math.round(+p.amount||0))return I.map(z=>({...z}));
  return [{k:'طلا',q:String(p.weight||''),amt:Math.round(+p.amount||0)}]}
const mgPart=e=>({code:toEn(e.code||'').trim(),amount:Math.round(+e.amount||0),weight:toEn(String(e.weight||'')),ppg:+e.ppg||0,items:mgItems(e),at:e.createdAt||e.updatedAt||e.entryDate||'',by:e.createdBy||'',eid:e.id});
const mgW=v=>parseFloat(toEn(String(v||'')))||0;
const mgSnap=t=>JSON.parse(JSON.stringify({amount:t.amount,code:t.code||'',weight:t.weight||'',ppg:t.ppg||0,items:t.items||null,buys:t.buys||null,iban:t.iban||'',card:t.card||'',holder:t.holder||'',bank:t.bank||''}));
/* خرید p به واریزی t اضافه می‌شود (همه فیلدهای جمع از روی e.buys دوباره حساب می‌شوند) */
function mgApply(t,p,o){o=o||{};if(!Array.isArray(t.buys)||!t.buys.length)t.buys=[mgPart(t)];t.buys.push(p);const B=t.buys;
  t.amount=B.reduce((s,b)=>s+(+b.amount||0),0);t.items=B.flatMap(b=>b.items.map(z=>({...z})));
  const w=Math.round(B.reduce((s,b)=>s+mgW(b.weight),0)*1000)/1000;t.weight=w?String(w):'';
  const ga=t.items.filter(z=>z.k==='طلا').reduce((s,z)=>s+(+z.amt||0),0);t.ppg=ppgOf(ga,t.weight)||0;
  t.code=[...new Set(B.map(b=>b.code).filter(Boolean))].join('، ');
  if(!t.iban&&o.iban){t.iban=o.iban;t.bank=''}if(!t.card&&o.card)t.card=o.card;if(!t.holder&&o.holder)t.holder=o.holder;
  t.updatedBy=who();t.updatedAt=new Date().toISOString();saveE();if(t.wd)depDocFix(t);alloc=null}
/* پنجره خرید: اگر واریزی هم‌لیست هست، خرید را به آن اضافه می‌کند و همان را برمی‌گرداند؛ وگرنه null (واریزی تازه مثل قبل) */
function mgBuy(ne,cuId,S){if(!can('edit'))return null;let c=null;try{c=cuFindBy({cuId,name:ne.name,phone:ne.phone,nid:ne.nid})}catch(_){}
  const t=mgFind({...ne,cuId:c?c.id:cuId});if(!t)return null;
  const snap=mgSnap(t),s0=new Set((t.settles||[]).map(z=>String(z.id)));
  mgApply(t,mgPart({...ne,createdAt:ne.updatedAt}),{iban:ne.iban,card:ne.card,holder:ne.holder});
  for(const s of S||[]){try{const pc=pyOf({cuId:s.cuId,name:s.name,phone:s.phone});payDocMake(t,pc,+s.amount,{tn:s.tn||'',note:s.note||'',imgs:stImgs(s),st:s.st||'wait'})}catch(_){toast('تسویه «'+(s.name||'')+'» به سند وصل نشد',true)}}
  const add=(t.settles||[]).filter(z=>!s0.has(String(z.id))).map(z=>z.id);
  logA('merge','خرید به واریزی قبلی اضافه شد',stripName(t.name)+' | +'+fmt(ne.amount)+' تومان | جمع '+fmt(t.amount)+' تومان | واریز '+dates(t.payDate).fa,{ids:[t.id],mg:{t:t.id,snap,stl:add,auto:1}});
  return t}
/* جزئیات واریزی: واریزی دیگر همان مشتری در همین لیست که با این یکی می‌شود */
function mgPeer(e){if(!e||!mgOk(e))return null;return entries.filter(t=>t!==e&&(t.payDate||'')===(e.payDate||'')&&mgSame(t,e)&&mgIbanFit(t,e)&&mgOk(t)).sort((a,b)=>a.id-b.id)[0]||null}
function mgPeerHTML(x){if(!can('edit')||!can('del'))return '';const e=entries.find(z=>z.id===x.id),p=mgPeer(e);if(!p)return '';
  return `<button type="button" class="mgj" data-act="mgJoin" data-a="${e.id}" data-b="${p.id}"><span class="mgi">${ic('split')}</span><span class="tx"><b>واریزی دیگر همین مشتری در این لیست</b><small>${fmt(p.amount)} تومان${p.code?' · فاکتور '+esc(toEn(p.code)):''}</small></span><span class="mgg">یکی کردن</span></button>`}
ACT.mgJoin=d=>{const a=entries.find(z=>String(z.id)===String(d.a)),b=entries.find(z=>String(z.id)===String(d.b));if(!a||!b||!mgOk(a)||!mgOk(b)||!mgSame(a,b)){toast('این دو واریزی دیگر یکی‌شدنی نیستند',true);render();return}
  if(mgStl(a).length&&mgStl(b).length){toast('هر دو واریزی تسویه از مشتری دارند؛ یکی کردن خودکار ممکن نیست',true);return}
  /* واریزی‌ای که تسویه دارد می‌ماند (پیوند تسویه‌ها دست نمی‌خورد)؛ وگرنه قدیمی‌تر */
  const [t,s]=mgStl(b).length||(!mgStl(a).length&&b.id<a.id)?[b,a]:[a,b];
  askConfirm(`دو واریزی «${esc(stripName(t.name))}» یکی شود؟ جمع ${fmt((+t.amount||0)+(+s.amount||0))} تومان`,'یکی شود',()=>{
    if(!mgOk(t)||!mgOk(s)){toast('یکی از واریزی‌ها همین حالا عوض شد؛ دوباره امتحان کنید',true);render();return}
    const snap=mgSnap(t),p=mgPart(s);trashIds([s.id],'یکی شد با واریزی '+stripName(t.name));mgApply(t,p,{iban:s.iban,card:s.card,holder:s.holder});
    logA('merge','دو واریزی یکی شد',stripName(t.name)+' | '+fmt(snap.amount)+' + '+fmt(p.amount)+' = '+fmt(t.amount)+' تومان | واریز '+dates(t.payDate).fa,{ids:[t.id],mg:{t:t.id,snap,abs:s.id}});
    if(String(entId)===String(s.id))entId=t.id;render();toast('یکی شد — '+fmt(t.amount)+' تومان')})};
/* برگرداندن یکی‌کردن: مقدارهای قبل واریزی، تسویه‌های خرید اضافه‌شده برداشته، واریزی دوم از سطل برمی‌گردد */
function mgUndo(x){const m=x.mg||{},t=entries.find(z=>String(z.id)===String(m.t));if(!t){toast('این واریزی دیگر در لیست نیست',true);return false}
  if(mgSent(t)){toast('این واریزی به بانک رفته؛ برگرداندن ممکن نیست',true);return false}
  const add=new Set((m.stl||[]).map(String));(t.settles||[]).filter(z=>add.has(String(z.id))).forEach(z=>{try{stlDocOff(z)}catch(_){}});t.settles=(t.settles||[]).filter(z=>!add.has(String(z.id)));
  const S=m.snap||{};['amount','code','weight','ppg','iban','card','holder','bank'].forEach(k=>{if(k in S)t[k]=S[k]});if(S.items)t.items=S.items;else delete t.items;if(S.buys)t.buys=S.buys;else delete t.buys;
  t.updatedBy=who();t.updatedAt=new Date().toISOString();try{stlSync(t)}catch(_){}saveE();if(t.wd)depDocFix(t);if(m.abs!=null)restoreIds([m.abs]);alloc=null;return true}
/* بخش «خریدهای این واریزی» در جزئیات (فقط وقتی بیش از یک خرید است؛ به‌جای «اقلام خرید» که همان را تکرار می‌کرد). ساعت خرید؛ تاریخ فقط اگر امروز نیست */
function mgBuysHTML(x){const e=entries.find(z=>z.id===x.id)||x,B=e.buys;if(!Array.isArray(B)||B.length<2)return '';
  return `<div class="esec mgb"><b>خریدهای این واریزی</b><small class="emeta">${toFa(B.length)} خرید · جمع ${fmt(B.reduce((s,b)=>s+(+b.amount||0),0))} تومان</small><div class="mgl">${B.map((b,i)=>{const w=mgW(b.weight),pg=b.ppg||ppgOf(b.items.filter(z=>z.k==='طلا').reduce((s,z)=>s+(+z.amt||0),0),b.weight),at=b.at?new Date(b.at):null;
    return `<div class="mgr"><span class="mgn">${toFa(i+1)}</span><span class="tx"><b>${b.code?'فاکتور <span class="ltr">'+esc(b.code)+'</span>':'خرید '+toFa(i+1)}</b><small>${[w?toFa(String(w))+' گرم':'',pg?'هر گرم '+fmt(pg):'',at&&!isNaN(at)?(d=>(d===todayISO()?'':dates(d).fa+' ')+toFa(at.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'})))(at.toLocaleDateString('en-CA',{timeZone:'Asia/Tehran'})):'',b.by||''].filter(Boolean).map(esc).join(' · ')}</small></span><b class="am">${fmt(b.amount)} <i>تومان</i></b></div>`}).join('')}</div></div>`}

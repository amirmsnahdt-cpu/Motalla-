/* ===== v72.3 (خواسته صاحب اپ، مثل کیمیا): «سند بانکی» چندردیفی برای حساب‌های بانک مغازه =====
   - یک سند = چند ردیف؛ هر ردیف «تشخیص» دارد: برداشت، واریز، خرید، فروش، در حساب، پاس شدن، وصول.
   - مستقیم، جدا از لیست‌های واریزی: از صفحه بانک‌ها (•••) یا صفحه هر حساب («+») باز می‌شود.
   - داده همان دفتر حساب s.led است (قالب قبلی نمی‌شکند): هر ردیف یک ردیف led با type in|out (اثر بر مانده)،
     k = کلید تشخیص، note = شرح، و همه ردیف‌های یک سند یک شماره no دارند (همان شمارنده سندها invNext).
   - سندهای قبلی واریز/برداشت دستی (بدون k) همین‌جا باز و ویرایش می‌شوند (تشخیص از type). */
const BDK=[['out','برداشت',-1],['in','واریز',1],['buy','خرید',-1],['sell','فروش',1],['chq','در حساب',1],['pass','پاس شدن',-1],['vos','وصول',1],['add','اضافه',1],['sub','کسر',-1]];
/* v80.0 (خواسته صاحب اپ، مثل کیمیا): «اضافه» و «کسر» روی حساب بانک بدون طرف حساب، با علت از فهرست (تخفیف، مانده قبلی، هزینه بانکی،
   یارانه، سرمایه اولیه) یا علت تازه که نوشته شود و برای دفعه بعد در فهرست می‌ماند (cfg.adj، همگام بین گوشی‌ها) */
const BDR0=['تخفیف','مانده قبلی','هزینه بانکی','یارانه','سرمایه اولیه'];
const bdAdj=k=>k==='add'||k==='sub';
const bdReasons=()=>{const r=cfgRec();return [...new Set([...BDR0,...((r&&r.adj)||[])])]};
const bdK=k=>BDK.find(x=>x[0]===k)||BDK[1];
const bdKOf=x=>x.k&&BDK.some(z=>z[0]===x.k)?x.k:x.type==='out'?'out':'in';
const bdLab=x=>bdK(bdKOf(x))[1];
/* همه ردیف‌های زنده یک سند (همان شماره در همان حساب) */
const bdRows=(s,x)=>x&&x.no!=null?(s.led||[]).filter(z=>!z.del&&z.no!=null&&String(z.no)===String(x.no)&&(z.type==='in'||z.type==='out')):x?[x]:[];
let BD=null;
/* v80.6 (خواسته صاحب اپ: «سند بانکی هم مثل سند زدن برای مشتری»): سند بانکی یک صفحه کامل (bdoc) به همان شکل سند مشتری است —
   سرتیتر = کارت حساب بانک، کاشی شماره و تاریخ سند، جستجوی «تشخیص» (برداشت، واریز، خرید، فروش، در حساب، پاس شدن، وصول، اضافه، کسر)،
   انتخاب نوع = کادر پله‌ای (مبلغ ← شرح/علت) با همان سرتیتر برگشت/انصراف/✓، ردیف‌های سند (زدن = ویرایش، کشیدن = حذف)،
   و کارت پایین: این سند · مانده بعد از سند + «ثبت سند». داده همان s.led قبلی است (هر ردیف یک ردیف led با شماره مشترک no).
   رنگ‌ها طبق قاعده صاحب اپ: آنچه به مانده حساب اضافه می‌کند (طلب ما از بانک بیشتر) قرمز، آنچه کم می‌کند آبی */
const BDKI={out:['dOut','پول از حساب برداشته شد'],in:['dIn','پول به حساب واریز شد'],buy:['card','خرید با کارت یا درگاه این حساب'],sell:['tag','پول فروش به این حساب آمد'],chq:['inv','چک به حساب گذاشته شد'],pass:['check','چک ما از این حساب پاس شد'],vos:['down','چک وصول شد و به حساب آمد'],add:['plus','تخفیف، مانده قبلی، یارانه، سرمایه…'],sub:['minus','هزینه بانکی، کارمزد…']};
Object.assign(IC,{minus:'<path d="M5 12h14"/>'});
const bdUp1=k=>bdK(k)[2]>0;/* به مانده اضافه می‌کند */
const bdCls=k=>bdUp1(k)?'k-out':'k-in';/* همان کلاس‌های رنگ سند مشتری: k-out قرمز، k-in آبی */
/* باز کردن سند: d.id حساب (خالی = اولین حساب مغازه، در سرتیتر عوض می‌شود)، d.k نوع ردیف اول (کادرش باز می‌شود)، d.l = ویرایش سندی که این ردیف در آن است */
ACT.bdNew=d=>{d=d||{};if(!can('src'))return;const L=ownL();const s=d.id!=null&&d.id!==''?sources.find(x=>String(x.id)===String(d.id)):L[0];
  if(!s){toast('اول یک حساب بانک مغازه بسازید',true);return}
  const x0=d.l!=null&&d.l!==''?(s.led||[]).find(z=>String(z.id)===String(d.l)&&!z.del):null;
  if(x0){const R=bdRows(s,x0);BD={sid:s.id,no:x0.no,date:x0.date||String(x0.at||'').slice(0,10)||todayISO(),ed:1,fix:1,rows:R.map(z=>({id:z.id,k:bdKOf(z),a:+z.amount||0,n:z.note||''})),q:'',e:null}}
  else BD={sid:s.id,no:null,date:todayISO(),ed:0,fix:d.id!=null&&d.id!=='',rows:[],q:'',e:null};
  BD.h0=bdSig();
  if(!x0&&d.k&&BDK.some(z=>z[0]===d.k))BD.e={i:null,k:d.k,a:0,n:'',st:0};
  PARENT.bdoc=cur==='banks'?'banks':'bank';bkId=s.id;closeSheet();go('bdoc');bdFocus()};
const bdS=()=>BD&&sources.find(x=>String(x.id)===String(BD.sid));
const bdSig=()=>BD?JSON.stringify([BD.sid,BD.date,BD.rows]):'';
const bdDirty=()=>!!BD&&(bdSig()!==BD.h0||!!(BD.e&&+BD.e.a));
/* اثر قبلی همین سند (در ویرایش) تا مانده «قبل از سند» دو بار حساب نشود */
function bdOld(s){let o=0;if(BD&&BD.ed)for(const z of s.led||[])if(!z.del&&z.no!=null&&String(z.no)===String(BD.no)&&(z.type==='in'||z.type==='out')&&(!s.balAt||(z.at||'')>=s.balAt))o+=(z.type==='in'?1:-1)*(+z.amount||0);return o}
const bdPrev=s=>{const e=acEst(s);return e==null?null:e-bdOld(s)};
const bdNet=()=>BD?BD.rows.reduce((a,r)=>a+bdK(r.k)[2]*(+r.a||0),0):0;
const bdMon=v=>(v<0?'−':'')+fmt(Math.abs(v));
/* ----- صفحه ----- */
function vBdoc(){const s=bdS();if(!s){setTimeout(()=>{if(cur==='bdoc')go(PARENT.bdoc||'banks',true)},0);return ''}
  const no=BD.no!=null?BD.no:invNext(),pv=bdPrev(s),D=dates(BD.date);
  return `<div class="d6 bdoc">
  <div class="d6hd"><button class="d6no" data-act="bdCal"><small>سند</small><b>${toFa(no)}</b><span>${ic('cal')}${esc(payLab(BD.date)||D.fa)}</span></button>
    <div class="bdpv"><small>مانده حساب قبل از این سند</small><b>${pv==null?'—':bdMon(pv)}<i>تومان</i></b>${pv==null?'<em>مانده قبلی ثبت نشده؛ فقط اثر سند حساب می‌شود</em>':''}</div></div>
  <div class="d6q" id="qa">${bdQHTML()}</div>
  <div id="bdRows">${bdRowsHTML()}</div>
</div>`}
const aBdoc=()=>BD&&bdS()?`<div id="bdFt">${bdFtIn()}</div>`:'';
/* سرتیتر: کارت حساب (مثل کارت مشتری در سند مشتری)؛ اگر حساب ثابت نیست، زدن = عوض کردن حساب */
function bdHead(s){const bk=acBank(s),a=!BD.fix&&!BD.ed&&ownL().length>1,T=a?'button':'div',no=BD.no!=null?BD.no:invNext();
  return `<${T} class="cuh9 bxh9"${a?' data-act="bdAccM" aria-label="عوض کردن حساب"':''}><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):esc(userInit(s.name))}</span><span class="cuh9t"><span class="cuh9k">${BD.ed?'ویرایش سند بانکی '+toFa(no):'سند بانکی جدید'}</span><span class="cuh9n"><b>${esc(s.name)}</b></span><span class="cuh9m">${esc([bk?'بانک '+bk:'',s.iban?'شبا …'+toFa(s.iban.slice(-4)):''].filter(Boolean).join(' · '))}</span></span>${a?`<span class="c6ed">${ic('chev')}</span>`:''}</${T}>`}
ACT.bdAccM=()=>{if(!BD||BD.fix||BD.ed)return;popMenu(document.querySelector('#bar .bxh9'),ownL().map(z=>['bdAccP',ic(String(z.id)===String(BD.sid)?'check':'bank'),z.name+(acFin(z)==null?'':' · '+fmt(acFin(z))),{id:z.id}]))};
ACT.bdAccP=d=>{if(!BD)return;BD.sid=d.id;bkId=d.id;render()};
ACT.bdCal=()=>{if(!BD)return;const B=BD;openCal(B.date||todayISO(),iso=>{BD=B;BD.date=iso;if(cur==='bdoc')render()})};
/* ----- تشخیص (نوع ردیف) و کادر پله‌ای ----- */
function bdQHTML(){const e=BD.e;
  if(!e){const op=!BD.rows.length||BD.q||BD.ko;return `<div class="dkf dkbox${op?' open':''}"><div class="fsearch sm">${ic('search')}<input id="qK" value="${esc(BD.q||'')}" placeholder="تشخیص: برداشت، واریز، خرید، فروش…" autocomplete="off" enterkeyhint="next"></div><div id="qKs">${bdKList()}</div></div>`}
  const K=bdK(e.k),I=BDKI[e.k]||['bank',''],adj=bdAdj(e.k),ed=e.i!=null,S=bdSteps(e),st=Math.min(e.st||0,S.length-1),last=st===S.length-1;
  const seg=S.map((z,j)=>{const v=z.v();return `<button type="button" class="stp${j===st?' on':''}${v&&j!==st?' dn':''}${j<=Math.max(st,e.mx||0)||ed?'':' fu'}" data-act="bdGo" data-i="${j}"${j<=Math.max(st,e.mx||0)||ed?'':' disabled'}><small>${z.lab}${z.opt?' <i>اختیاری</i>':''}</small><b>${v?esc(v):(j===st?'…':'—')}</b></button>`}).join('');
  const cur0=S[st],val=st===0?(+e.a?Number(e.a).toLocaleString('en-US'):''):esc(e.n||'');
  return `<div class="dkf dkbox open"><div class="stw"><div class="sthd ${bdCls(e.k)}"><button type="button" class="sthb" data-act="bdUp" aria-label="برگشت" title="برگشت">${ic('back')}</button><button type="button" class="sthk" data-act="bdUp" aria-label="تغییر نوع"><span class="sthi">${ic(I[0])}</span><b>${K[1]}</b></button><button type="button" class="sthx" data-act="bdCancel">انصراف</button><button type="button" class="sthok" data-act="bdFin" aria-label="${ed?'ذخیره تغییرات':'افزودن به سند'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="ck" d="M5 12.5l4.5 4.5L19 7.5"/></svg></button></div>
    <div class="stps">${seg}</div>
    <div class="fsearch sm st3"><input id="bdI" class="stin${st===0?' ltr':''}" ${st===0?'inputmode="numeric"':''} value="${val}" placeholder="${cur0.ph}" autocomplete="off" enterkeyhint="${last?'done':'next'}"><button type="button" class="stnx${last?' go':''}" data-act="bdNext">${last?ic('check')+'<span>'+(ed?'ذخیره':'افزودن')+'</span>':'<span>بعدی</span>'+ic('back').replace('class="i"','class="i flip"')}</button></div>
    ${adj&&st===1?`<div class="bdrs">${bdReasons().map(t=>`<button type="button" class="bdrc${e.n===t?' on':''}" data-act="bdRs" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div>`:''}
    <div class="stlv" id="bdPv">${bdLive()}</div>
    ${ed?`<div class="stft"><button type="button" class="stdel" data-act="bdRowDel" data-i="${e.i}" aria-label="حذف ردیف">${ic('trash')}<span>حذف</span></button></div>`:''}
  </div></div>`}
const bdSteps=e=>[{lab:'مبلغ',ph:'مبلغ (تومان)',v:()=>+e.a?fmt(+e.a):''},bdAdj(e.k)?{lab:'علت',ph:'علت: از فهرست بزنید یا بنویسید',v:()=>e.n||''}:{lab:'شرح',opt:1,ph:'شرح (اختیاری): طرف حساب، شماره چک…',v:()=>e.n||''}];
function bdKList(){const q=nzName(toEn(clean(BD.q||''))),R=BDK.filter(([k,t])=>!q||nzName(t+' '+((BDKI[k]||[])[1]||'')).includes(q));
  if(!R.length)return '<div class="eh" style="padding:8px">چیزی پیدا نشد</div>';
  return `<div class="bzsug cbl dkl">${R.map(([k,t,g])=>`<button type="button" class="bzsr dkrw top ${bdCls(k)} ${g>0?'kr':'kb'}" data-act="bdD" data-k="${k}"><span class="av">${ic((BDKI[k]||['bank'])[0])}</span><span class="tx"><b>${t}</b><small>${esc((BDKI[k]||[])[1]||'')} · ${g>0?'مانده زیاد می‌شود':'مانده کم می‌شود'}</small></span></button>`).join('')}</div>`}
/* مبلغ زنده ردیف + مانده بعد از آن (مثل کادر مبلغ سند مشتری) */
function bdLive(){const e=BD.e,s=bdS();if(!e||!s)return '';const a=+e.a||0,g=bdK(e.k)[2],pv=bdPrev(s),old=e.i!=null&&BD.rows[e.i]?bdK(BD.rows[e.i].k)[2]*(+BD.rows[e.i].a||0):0,af=pv==null?null:pv+bdNet()-old+g*a;
  return `<div class="stam ${a?(g>0?'d':'c'):'z'}"><small>${a?(g>0?'به مانده حساب اضافه می‌شود':'از مانده حساب کم می‌شود'):'مبلغ این ردیف'}</small><span class="fz"><b${fitS((a?fmt(a):'—')+' تومان')}>${a?fmt(a):'—'}<i>تومان</i></b></span>${a&&af!=null?`<em>مانده حساب بعد از این ردیف <b>${bdMon(af)}</b> تومان</em>`:''}</div>`}
/* ----- ردیف‌های سند ----- */
function bdRowsHTML(){if(!BD.rows.length)return '';
  const R=BD.rows.map((r,i)=>{const g=bdK(r.k)[2],a=+r.a||0;
    const v=`<span class="d6e ${g>0?'d':'c'}"><small>${g>0?'به مانده':'از مانده'}</small><span class="fz"><b${fitS(fmt(a))}>${fmt(a)}</b></span><i>تومان</i></span>`;
    return swW(d6Row({act:'bdRowEd',i,ico:(BDKI[r.k]||['bank'])[0],tag:`<em class="d6k ${bdCls(r.k)}">${bdK(r.k)[1]}</em>`,b:esc(r.n||(bdAdj(r.k)?'بدون علت':bdK(r.k)[1])),v,key:'bd'+i,nw:i===BD.nw}),{r:[['bdRowEd','ویرایش','edit','#3b6fd6']],l:[['bdRowDel','حذف','trash','#d23c48']],data:{i}})});
  return `<div class="d6sh"><b>ردیف‌های سند</b><small>${toFa(R.length)} ردیف · بزنید = ویرایش، بکشید = حذف</small></div><div class="d6rows d7">${R.join('')}</div>`}
/* ----- کارت پایین: این سند · مانده بعد از سند + ثبت ----- */
function bdFtIn(){const s=bdS();if(!s||!BD.rows.length&&!BD.ed)return '';const pv=bdPrev(s),net=bdNet(),n=BD.rows.length,af=pv==null?null:pv+net;
  return `<div class="bdft${n?'':' empty'}"><div class="bdfg"><span class="bdfc ${net>0?'d':net<0?'c':'z'}"><small>این سند</small><b>${fmt(Math.abs(net))}</b><em>${net>0?'به مانده اضافه':net<0?'از مانده کم':'—'}</em></span><span class="bdfc m"><small>مانده بعد از سند</small><b>${af==null?'—':fmt(Math.abs(af))}</b><em>${af==null?'مانده قبلی ثبت نشده':af<0?'منفی · تومان':'تومان'}</em></span></div>
  <button type="button" class="bdgo" data-act="bdSave"${n?'':' disabled'}>${ic('check')}<span>${BD.ed?'ذخیره ویرایش':'ثبت سند'}</span>${n?`<i>${toFa(n)} ردیف</i>`:''}</button></div>`}
/* ----- رسم دوباره و رویدادها ----- */
function bdRe(o){o=o||{};if(cur!=='bdoc'||!BD)return;numMorph('#bdRows .d6e b,#bdFt .bdfc b,#bdPv .stam .fz>b',()=>{const set=(id,h)=>{const x=$(id);if(x)x.innerHTML=h};set('qa',bdQHTML());set('bdRows',bdRowsHTML());set('bdFt',bdFtIn())});BD.nw=-1;bdBind();if(o.f)bdFocus()}
function bdFocus(){setTimeout(()=>{const I=$('bdI');if(!I||cur!=='bdoc')return;try{I.focus({preventScroll:true})}catch(_){I.focus()}try{const n=I.value.length;I.setSelectionRange(0,n)}catch(_){}const q=$('qa');if(q&&q.scrollIntoView)q.scrollIntoView({behavior:RM()?'auto':'smooth',block:'nearest'})},60)}
function bdRead(){const e=BD&&BD.e,I=$('bdI');if(!e||!I)return;if((e.st||0)===0)e.a=num(I.value);else e.n=clean(I.value||'')}
function bdBind(){if(cur!=='bdoc'||!BD)return;const K=$('qK');
  if(K){const B=K.closest('.dkbox');K.onfocus=()=>{BD.ko=1;if(B)B.classList.add('open')};K.oninput=()=>{BD.q=K.value;const L=$('qKs');if(L)L.innerHTML=bdKList();if(B)B.classList.add('open')};
    K.onkeydown=ev=>{if(ev.key!=='Enter')return;ev.preventDefault();const b=document.querySelector('#qKs .dkrw');if(b&&document.querySelectorAll('#qKs .dkrw').length===1)b.click()}}
  const I=$('bdI');if(I){const e=BD.e;I.oninput=()=>{if((e.st||0)===0){const v=num(I.value);I.value=v?v.toLocaleString('en-US'):''}bdRead();
      numMorph('#bdPv .stam .fz>b',()=>{const P=$('bdPv');if(P)P.innerHTML=bdLive()});const sb=document.querySelector('#qa .stp.on b');if(sb){const v=bdSteps(e)[e.st||0].v();sb.textContent=v||'…'}
      document.querySelectorAll('#qa .bdrc').forEach(c=>c.classList.toggle('on',c.dataset.v===e.n))};
    I.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();ACT.bdNext()}}}}
document.addEventListener('pointerdown',ev=>{if(cur!=='bdoc'||!BD||BD.e||!BD.ko||!BD.rows.length||BD.q)return;const t=ev.target;if(t.closest&&(t.closest('.dkbox')||t.closest('#ov')))return;BD.ko=0;const B=document.querySelector('#qa .dkbox');if(B)B.classList.remove('open')},true);
ACT.bdD=d=>{if(!BD)return;BD.e={i:null,k:d.k,a:0,n:'',st:0};BD.q='';BD.ko=0;bdRe({f:1})};
ACT.bdGo=d=>{if(!BD||!BD.e)return;bdRead();BD.e.st=+d.i||0;bdRe({f:1})};
ACT.bdNext=()=>{if(!BD||!BD.e)return;bdRead();const e=BD.e,S=bdSteps(e),st=e.st||0;
  if(st===0&&!(+e.a>0)){toast('مبلغ را بزنید',true);bdFocus();return}
  if(st<S.length-1){e.st=st+1;e.mx=Math.max(e.mx||0,e.st);bdRe({f:1});return}ACT.bdFin()};
ACT.bdRs=d=>{if(!BD||!BD.e)return;bdRead();BD.e.n=BD.e.n===d.v?'':d.v;bdRe({f:1})};
ACT.bdUp=()=>{if(!BD||!BD.e)return;const ed=BD.e.i!=null;BD.e=null;if(!ed)BD.ko=1;bdRe()};
ACT.bdCancel=()=>{if(!BD)return;BD.e=null;BD.q='';BD.ko=0;bdRe()};
ACT.bdFin=()=>{if(!BD||!BD.e)return;bdRead();const e=BD.e;
  if(!(+e.a>0)){e.st=0;bdRe({f:1});toast('مبلغ را بزنید',true);return}
  if(bdAdj(e.k)&&!clean(e.n||'')){e.st=1;bdRe({f:1});toast('برای «'+bdK(e.k)[1]+'» علت را انتخاب کنید یا بنویسید',true);return}
  const r={k:e.k,a:+e.a,n:clean(e.n||'')};if(e.i!=null&&BD.rows[e.i]){const o=BD.rows[e.i];if(o.id!=null)r.id=o.id;BD.rows[e.i]=r}else{BD.rows.push(r);BD.nw=BD.rows.length-1}
  BD.e=null;BD.q='';BD.ko=0;bdRe();toast(bdK(r.k)[1]+' '+fmt(r.a)+' تومان '+(e.i!=null?'ویرایش شد':'به سند اضافه شد'))};
ACT.bdRowEd=d=>{if(!BD)return;const r=BD.rows[+d.i];if(!r)return;BD.e={i:+d.i,k:r.k,a:r.a,n:r.n||'',st:0,mx:1};bdRe({f:1})};
ACT.bdRowDel=d=>{if(!BD)return;const i=+d.i,r=BD.rows[i];if(!r)return;BD.rows.splice(i,1);if(BD.e&&BD.e.i!=null)BD.e=null;bdRe();toast('ردیف '+bdK(r.k)[1]+' '+fmt(+r.a||0)+' حذف شد')};
ACT.bdSave=()=>{if(!BD)return;if(BD.e&&+BD.e.a){bdRead();ACT.bdFin();if(BD.e)return}const s=bdS();if(!s)return;const R=BD.rows.filter(r=>+r.a>0);if(!R.length){toast('اول یک ردیف (برداشت، واریز…) به سند اضافه کنید',true);return}
  if(R.some(r=>bdAdj(r.k)&&!clean(r.n||''))){toast('برای «اضافه» و «کسر» علت را انتخاب کنید یا بنویسید',true);return}
  {const nw=[...new Set(R.filter(r=>bdAdj(r.k)).map(r=>clean(r.n)))].filter(t=>t&&!bdReasons().includes(t));if(nw.length){const c=cfgRec(1);c.adj=[...(c.adj||[]),...nw];saveCu()}}
  const now=new Date().toISOString(),by=who(),L=(s.led=s.led||[]);let no=BD.no;
  if(BD.ed){const keep=new Set(R.filter(r=>r.id!=null).map(r=>String(r.id))),old=L.filter(z=>!z.del&&z.no!=null&&String(z.no)===String(no));const at0=(old[0]&&old[0].at)||now;
    for(const z of old)if(!keep.has(String(z.id))){z.del=true;z.delAt=now;z.delBy=by}
    for(const r of R){const sg=bdK(r.k)[2],z=r.id!=null&&L.find(q=>String(q.id)===String(r.id));
      if(z){z.type=sg>0?'in':'out';z.k=r.k;z.amount=+r.a;z.note=r.n;z.date=BD.date;z.edAt=now;z.edBy=by}
      else L.push({id:nid++,type:sg>0?'in':'out',k:r.k,amount:+r.a,note:r.n,date:BD.date,at:at0,by,no,edAt:now,edBy:by})}}
  else{no=invNext();for(const r of R){const sg=bdK(r.k)[2];L.push({id:nid++,type:sg>0?'in':'out',k:r.k,amount:+r.a,note:r.n,date:BD.date,at:now,by,no})}}
  s.updatedAt=now;saveS();const net=R.reduce((a,r)=>a+bdK(r.k)[2]*(+r.a),0);
  logA('src',(BD.ed?'ویرایش ':'')+'سند بانکی '+toFa(no),s.name+' | '+R.map(r=>bdK(r.k)[1]+' '+fmt(+r.a)).join('، '));
  const ed=BD.ed;BD=null;bkId=s.id;acV={id:s.id,f:'all'};navBack=true;go('bank');
  toast((ed?'سند بانکی '+toFa(no)+' ویرایش شد':'سند بانکی '+toFa(no)+' ثبت شد')+' · '+(net<0?'−':'+')+fmt(Math.abs(net))+' تومان')};
/* دیدن سند بانکی: همه ردیف‌ها با تشخیص، جمع، جزئیات، ویرایش و حذف */
function bdViewHTML(s,x){const R=bdRows(s,x),bk=acBank(s),c=can('src'),net=R.reduce((a,z)=>a+(z.type==='in'?1:-1)*(+z.amount||0),0);
  const ln=(k,v)=>v?`<div class="lgdr"><small>${k}</small><b>${v}</b></div>`:'',ed=R.filter(z=>z.edAt).map(z=>z.edAt).sort().pop(),edBy=ed&&(R.find(z=>z.edAt===ed)||{}).edBy;
  return `<div class="sh-h"><div><b>${esc(ledDocT(x))}</b><small class="shsub">${esc(s.name)}${bk?' · بانک '+esc(bk):''}</small></div><button class="x" data-act="acBack" data-id="${s.id}" aria-label="بستن">×</button></div>
  ${bxBlue({t:net<0?'اثر سند · از مانده کم شد':'اثر سند · مانده زیاد شد',v:net,sub:'مانده نهایی حساب '+(acFin(s)==null?'—':fmt(acFin(s)))+' تومان'})}
  <div class="fcard bdvl">${R.map((z,i)=>`<div class="bdv ${z.type==='in'?'in':'out'}"><span class="bdn0">${toFa(i+1)}</span><span class="tx"><b>${esc(bdLab(z))}</b>${z.note?`<small>${esc(z.note)}</small>`:''}</span><b class="bdva"><bdi dir="ltr">${z.type==='in'?'+':'−'}${fmt(+z.amount||0)}</bdi> <i>تومان</i></b></div>`).join('')}</div>
  <div class="fcard lgdl">${ln('شماره سند',x.no?toFa(x.no):'بدون شماره (ثبت قبلی)')}${ln('حساب',esc(s.name))}${ln('تاریخ',esc(dates(x.date||String(x.at||'').slice(0,10)).fa)+' · '+esc(bxTime(x.at)))}${ln('ثبت‌کننده',esc(x.by||''))}${ed?ln('آخرین ویرایش',esc(dates(String(ed).slice(0,10)).fa)+' · '+esc(bxTime(ed))+(edBy?' · '+esc(edBy):'')):''}${s.balAt&&String(x.at||'')<s.balAt?ln('وضعیت','پیش از آخرین اصلاح حساب؛ در مانده حساب نمی‌شود'):''}</div>
  ${c?`<button class="xgo" data-act="bdNew" data-id="${s.id}" data-l="${x.id}">${ic('edit')} ویرایش سند</button><button class="lnk acfxd" data-act="acLedDel" data-id="${s.id}" data-l="${x.id}">${ic('trash')} حذف سند</button>`:''}`}

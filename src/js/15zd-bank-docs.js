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
  if(x0){const R=bdRows(s,x0);BD={sid:s.id,no:x0.no,date:x0.date||String(x0.at||'').slice(0,10)||todayISO(),ed:1,fix:1,rows:R.map(z=>({id:z.id,k:bdKOf(z),a:+z.amount||0,n:z.note||'',cu:z.cuId!=null?z.cuId:''})),q:'',e:null}}
  else BD={sid:s.id,no:null,date:todayISO(),ed:0,fix:d.id!=null&&d.id!=='',rows:[],q:'',e:null};
  BD.h0=bdSig();
  if(!x0&&d.k&&BDK.some(z=>z[0]===d.k))BD.e={i:null,k:d.k,a:0,n:'',cu:'',st:0};
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
  const cur0=S[st],K0=cur0.k,val=K0==='a'?(+e.a?Number(e.a).toLocaleString('en-US'):''):K0==='cu'?esc(e.sq||''):esc(e.n||'');
  return `<div class="dkf dkbox open"><div class="stw"><div class="sthd ${bdCls(e.k)}"><button type="button" class="sthb" data-act="bdUp" aria-label="برگشت" title="برگشت">${ic('back')}</button><button type="button" class="sthk" data-act="bdUp" aria-label="تغییر نوع"><span class="sthi">${ic(I[0])}</span><b>${K[1]}</b></button><button type="button" class="sthx" data-act="bdCancel">انصراف</button><button type="button" class="sthok" data-act="bdFin" aria-label="${ed?'ذخیره تغییرات':'افزودن به سند'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="ck" d="M5 12.5l4.5 4.5L19 7.5"/></svg></button></div>
    <div class="stps">${seg}</div>
    <div class="fsearch sm st3">${K0==='cu'?ic('search'):''}<input id="bdI" class="stin${K0==='a'?' ltr':''}" ${K0==='a'?'inputmode="numeric"':K0==='cu'?'type="search"':''} value="${val}" placeholder="${cur0.ph}" autocomplete="off" enterkeyhint="${last?'done':'next'}"><button type="button" class="stnx${last?' go':''}" data-act="bdNext">${last?ic('check')+'<span>'+(ed?'ذخیره':'افزودن')+'</span>':'<span>بعدی</span>'+ic('back').replace('class="i"','class="i flip"')}</button></div>
    ${K0==='cu'?`<div id="bdPk">${bdCuList()}</div>`:''}${adj&&K0==='n'?`<div class="bdrs">${bdReasons().map(t=>`<button type="button" class="bdrc${e.n===t?' on':''}" data-act="bdRs" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div>`:''}
    <div class="stlv" id="bdPv">${bdLive()}</div>
    ${ed?`<div class="stft"><button type="button" class="stdel" data-act="bdRowDel" data-i="${e.i}" aria-label="حذف ردیف">${ic('trash')}<span>حذف</span></button></div>`:''}
  </div></div>`}
const bdSteps=e=>{const S=[{k:'a',lab:'مبلغ',ph:'مبلغ (تومان)',v:()=>+e.a?fmt(+e.a):''}];
  /* v80.8 (خواسته صاحب اپ: «همه سندها به هم ارتباط داشته باشند»): طرف حساب ردیف (هزینه، مشتری، همکار…) — سند متقابل خودکار در همان حساب می‌خورد */
  if(!bdAdj(e.k))S.push({k:'cu',lab:'طرف حساب',opt:1,ph:'جستجوی حساب: هزینه، مشتری، همکار…',v:()=>bdCuN(e.cu)});
  S.push(bdAdj(e.k)?{k:'n',lab:'علت',ph:'علت: از فهرست بزنید یا بنویسید',v:()=>e.n||''}:{k:'n',lab:'شرح',opt:1,ph:'شرح (اختیاری): شماره چک، پیگیری…',v:()=>e.n||''});return S};
const bdCu=id=>id!=null&&id!==''?CU().find(z=>String(z.id)===String(id))||null:null;
const bdCuN=id=>{const c=bdCu(id);return c?cuName(c):''};
const bdSk=e=>{const S=bdSteps(e);return (S[Math.min(e.st||0,S.length-1)]||S[0]).k};
function bdCuList(){const e=BD.e,q0=clean(e.sq||''),q=nzName(toEn(q0)),out=bdK(e.k)[2]<0;
  let L=CU().filter(c=>!q||nzName(toEn(cuName(c)+' '+(c.grp||'')+' '+(c.cno||''))).includes(q));
  L.sort((a,b)=>(String(b.id)===String(e.cu))-(String(a.id)===String(e.cu))||(out?(b.grp==='هزینه')-(a.grp==='هزینه'):0)||String(b.lastAt||'').localeCompare(String(a.lastAt||'')));
  const ex=q&&L.some(c=>nzName(toEn(cuName(c)))===q);L=L.slice(0,q?20:12);
  const row=c=>{const B=cuBal(c);return `<button type="button" class="bzsr dkrw${String(c.id)===String(e.cu)?' on':''}" data-act="bdCuP" data-id="${esc(c.id)}"><span class="av">${esc(userInit(cuName(c)))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${esc([c.grp||'مشتری',B.R?fmt(Math.abs(B.R))+' تومان '+ourLab(B.R):''].filter(Boolean).join(' · '))}</small></span></button>`};
  const none=e.cu!==''&&e.cu!=null?`<button type="button" class="bzsr dkrw fix" data-act="bdCuP" data-id=""><span class="av">${ic('x')}</span><span class="tx"><b>بدون طرف حساب</b><small>فقط روی حساب بانک</small></span></button>`:'';
  const nw=ex||!can('debt')?'':`<button type="button" class="bzsr dkrw nw" data-act="bdCuNew"><span class="av">${ic('plus')}</span><span class="tx"><b>${q?'حساب تازه «'+esc(q0)+'»':'حساب تازه'}</b><small>${q?(out?'نوع هزینه (در فرم حساب عوض می‌شود)':'نوع مشتری'):'نامش را در جستجو بنویسید'}</small></span></button>`;
  return `<div class="bzsug cbl dkl">${none}${L.map(row).join('')}${nw}</div>`}
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
    return swW(d6Row({act:'bdRowEd',i,ico:(BDKI[r.k]||['bank'])[0],tag:`<em class="d6k ${bdCls(r.k)}">${bdK(r.k)[1]}</em>`,b:esc([bdCuN(r.cu),r.n].filter(Boolean).join(' · ')||(bdAdj(r.k)?'بدون علت':bdK(r.k)[1])),v,key:'bd'+i,nw:i===BD.nw}),{r:[['bdRowEd','ویرایش','edit','#3b6fd6']],l:[['bdRowDel','حذف','trash','#d23c48']],data:{i}})});
  return `<div class="d6sh"><b>ردیف‌های سند</b><small>${toFa(R.length)} ردیف · بزنید = ویرایش، بکشید = حذف</small></div><div class="d6rows d7">${R.join('')}</div>`}
/* ----- کارت پایین: این سند · مانده بعد از سند + ثبت ----- */
function bdFtIn(){const s=bdS();if(!s||!BD.rows.length&&!BD.ed)return '';const pv=bdPrev(s),net=bdNet(),n=BD.rows.length,af=pv==null?null:pv+net;
  return `<div class="bdft${n?'':' empty'}"><div class="bdfg"><span class="bdfc ${net>0?'d':net<0?'c':'z'}"><small>این سند</small><b>${fmt(Math.abs(net))}</b><em>${net>0?'به مانده اضافه':net<0?'از مانده کم':'—'}</em></span><span class="bdfc m"><small>مانده بعد از سند</small><b>${af==null?'—':fmt(Math.abs(af))}</b><em>${af==null?'مانده قبلی ثبت نشده':af<0?'منفی · تومان':'تومان'}</em></span></div></div>`}
/* ----- رسم دوباره و رویدادها ----- */
function bdRe(o){o=o||{};if(cur!=='bdoc'||!BD)return;numMorph('#bdRows .d6e b,#bdFt .bdfc b,#bdPv .stam .fz>b',()=>{const set=(id,h)=>{const x=$(id);if(x)x.innerHTML=h};set('qa',bdQHTML());set('bdRows',bdRowsHTML());set('bdFt',bdFtIn())});BD.nw=-1;bdBind();hdGoSync();if(o.f)bdFocus()}
function bdFocus(){setTimeout(()=>{const I=$('bdI');if(!I||cur!=='bdoc')return;try{I.focus({preventScroll:true})}catch(_){I.focus()}try{const n=I.value.length;I.setSelectionRange(0,n)}catch(_){}const q=$('qa');if(q&&q.scrollIntoView)q.scrollIntoView({behavior:RM()?'auto':'smooth',block:'nearest'})},60)}
function bdRead(){const e=BD&&BD.e,I=$('bdI');if(!e||!I)return;const k=bdSk(e);if(k==='a')e.a=num(I.value);else if(k==='cu')e.sq=I.value;else e.n=clean(I.value||'')}
function bdBind(){if(cur!=='bdoc'||!BD)return;const K=$('qK');
  if(K){const B=K.closest('.dkbox');K.onfocus=()=>{BD.ko=1;if(B)B.classList.add('open')};K.oninput=()=>{BD.q=K.value;const L=$('qKs');if(L)L.innerHTML=bdKList();if(B)B.classList.add('open')};
    K.onkeydown=ev=>{if(ev.key!=='Enter')return;ev.preventDefault();const b=document.querySelector('#qKs .dkrw');if(b&&document.querySelectorAll('#qKs .dkrw').length===1)b.click()}}
  const I=$('bdI');if(I){const e=BD.e;I.oninput=()=>{const k=bdSk(e);if(k==='a'){const v=num(I.value);I.value=v?v.toLocaleString('en-US'):''}bdRead();if(k==='cu'){const P=$('bdPk');if(P)P.innerHTML=bdCuList();return}
      numMorph('#bdPv .stam .fz>b',()=>{const P=$('bdPv');if(P)P.innerHTML=bdLive()});const sb=document.querySelector('#qa .stp.on b');if(sb){const v=bdSteps(e)[e.st||0].v();sb.textContent=v||'…'}
      document.querySelectorAll('#qa .bdrc').forEach(c=>c.classList.toggle('on',c.dataset.v===e.n))};
    I.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();ACT.bdNext()}}}}
document.addEventListener('pointerdown',ev=>{if(cur!=='bdoc'||!BD||BD.e||!BD.ko||!BD.rows.length||BD.q)return;const t=ev.target;if(t.closest&&(t.closest('.dkbox')||t.closest('#ov')))return;BD.ko=0;const B=document.querySelector('#qa .dkbox');if(B)B.classList.remove('open')},true);
ACT.bdD=d=>{if(!BD)return;BD.e={i:null,k:d.k,a:0,n:'',cu:'',st:0};BD.q='';BD.ko=0;bdRe({f:1})};
ACT.bdGo=d=>{if(!BD||!BD.e)return;bdRead();BD.e.st=+d.i||0;bdRe({f:1})};
ACT.bdNext=()=>{if(!BD||!BD.e)return;bdRead();const e=BD.e,S=bdSteps(e),st=e.st||0;
  if(S[st].k==='a'&&!(+e.a>0)){toast('مبلغ را بزنید',true);bdFocus();return}
  if(st<S.length-1){e.st=st+1;e.mx=Math.max(e.mx||0,e.st);bdRe({f:1});return}ACT.bdFin()};
ACT.bdRs=d=>{if(!BD||!BD.e)return;bdRead();BD.e.n=BD.e.n===d.v?'':d.v;bdRe({f:1})};
ACT.bdCuP=d=>{if(!BD||!BD.e)return;const e=BD.e;e.cu=d.id||'';e.sq='';const S=bdSteps(e);e.st=Math.min(S.length-1,S.findIndex(z=>z.k==='cu')+1);e.mx=Math.max(e.mx||0,e.st);bdRe({f:1})};
ACT.bdCuNew=()=>{if(!BD||!BD.e||!can('debt'))return;bdRead();const e=BD.e,n=clean(e.sq||'');if(!n){toast('نام حساب را در جستجو بنویسید',true);bdFocus();return}
  const c=cuMakeBy({name:n},'سند بانکی');c.grp=bdK(e.k)[2]<0?'هزینه':'مشتری';saveCu();toast('حساب «'+cuName(c)+'» ساخته شد · نوع '+c.grp);ACT.bdCuP({id:c.id})};
ACT.bdUp=()=>{if(!BD||!BD.e)return;const ed=BD.e.i!=null;BD.e=null;if(!ed)BD.ko=1;bdRe()};
ACT.bdCancel=()=>{if(!BD)return;BD.e=null;BD.q='';BD.ko=0;bdRe()};
ACT.bdFin=()=>{if(!BD||!BD.e)return;bdRead();const e=BD.e;
  if(!(+e.a>0)){e.st=0;bdRe({f:1});toast('مبلغ را بزنید',true);return}
  if(bdAdj(e.k)&&!clean(e.n||'')){e.st=bdSteps(e).length-1;bdRe({f:1});toast('برای «'+bdK(e.k)[1]+'» علت را انتخاب کنید یا بنویسید',true);return}
  const r={k:e.k,a:+e.a,n:clean(e.n||''),cu:bdAdj(e.k)||!bdCu(e.cu)?'':e.cu};if(e.i!=null&&BD.rows[e.i]){const o=BD.rows[e.i];if(o.id!=null)r.id=o.id;BD.rows[e.i]=r}else{BD.rows.push(r);BD.nw=BD.rows.length-1}
  BD.e=null;BD.q='';BD.ko=0;bdRe();toast(bdK(r.k)[1]+' '+fmt(r.a)+' تومان '+(e.i!=null?'ویرایش شد':'به سند اضافه شد'))};
ACT.bdRowEd=d=>{if(!BD)return;const r=BD.rows[+d.i];if(!r)return;BD.e={i:+d.i,k:r.k,a:r.a,n:r.n||'',cu:r.cu||'',st:0,mx:2};bdRe({f:1})};
ACT.bdRowDel=d=>{if(!BD)return;const i=+d.i,r=BD.rows[i];if(!r)return;BD.rows.splice(i,1);if(BD.e&&BD.e.i!=null)BD.e=null;bdRe();toast('ردیف '+bdK(r.k)[1]+' '+fmt(+r.a||0)+' حذف شد')};
ACT.bdSave=()=>{if(!BD)return;if(BD.e&&+BD.e.a){bdRead();ACT.bdFin();if(BD.e)return}const s=bdS();if(!s)return;const R=BD.rows.filter(r=>+r.a>0);if(!R.length){toast('اول یک ردیف (برداشت، واریز…) به سند اضافه کنید',true);return}
  if(R.some(r=>bdAdj(r.k)&&!clean(r.n||''))){toast('برای «اضافه» و «کسر» علت را انتخاب کنید یا بنویسید',true);return}
  {const nw=[...new Set(R.filter(r=>bdAdj(r.k)).map(r=>clean(r.n)))].filter(t=>t&&!bdReasons().includes(t));if(nw.length){const c=cfgRec(1);c.adj=[...(c.adj||[]),...nw];saveCu()}}
  const now=new Date().toISOString(),by=who(),L=(s.led=s.led||[]);let no=BD.no;
  if(BD.ed){const keep=new Set(R.filter(r=>r.id!=null).map(r=>String(r.id))),old=L.filter(z=>!z.del&&z.no!=null&&String(z.no)===String(no));const at0=(old[0]&&old[0].at)||now;
    for(const z of old)if(!keep.has(String(z.id))){z.del=true;z.delAt=now;z.delBy=by}
    for(const r of R){const sg=bdK(r.k)[2],z=r.id!=null&&L.find(q=>String(q.id)===String(r.id));
      if(z){z.type=sg>0?'in':'out';z.k=r.k;z.amount=+r.a;z.note=r.n;z.cuId=r.cu||'';z.date=BD.date;z.edAt=now;z.edBy=by}
      else L.push({id:nid++,type:sg>0?'in':'out',k:r.k,amount:+r.a,note:r.n,cuId:r.cu||'',date:BD.date,at:at0,by,no,edAt:now,edBy:by})}}
  else{no=invNext();for(const r of R){const sg=bdK(r.k)[2];L.push({id:nid++,type:sg>0?'in':'out',k:r.k,amount:+r.a,note:r.n,cuId:r.cu||'',date:BD.date,at:now,by,no})}}
  s.updatedAt=now;saveS();const mc=bdMirror(s,no);const net=R.reduce((a,r)=>a+bdK(r.k)[2]*(+r.a),0);
  logA('src',(BD.ed?'ویرایش ':'')+'سند بانکی '+toFa(no),s.name+' | '+R.map(r=>bdK(r.k)[1]+' '+fmt(+r.a)+(bdCuN(r.cu)?' ('+bdCuN(r.cu)+')':'')).join('، '));
  const ed=BD.ed;BD=null;bkId=s.id;acV={id:s.id,f:'all'};navBack=true;go('bank');
  toast((ed?'سند بانکی '+toFa(no)+' ویرایش شد':'سند بانکی '+toFa(no)+' ثبت شد')+' · '+(net<0?'−':'+')+fmt(Math.abs(net))+' تومان'+(mc?' · سند متقابل در '+toFa(mc)+' حساب':''))};
/* v80.8 (خواسته صاحب اپ): سند متقابل خودکار — هر ردیف سند بانکی که طرف حساب دارد (cuId) یک سند در حساب همان مشتری/هزینه/همکار می‌سازد:
   حواله از/به همین حساب بانک با همان شماره سند (t.bd = {sid,no,l}). ردیف حواله نشانه p.bdl دارد تا در مانده و گردش بانک دوباره شمرده نشود
   (اثر بانک همان ردیف s.led است). با هر ویرایش/حذف سند بانکی، سندهای متقابل قبلی کنار می‌روند و از روی ردیف‌های فعلی دوباره ساخته می‌شوند.
   در حساب مشتری این سند فقط دیده می‌شود؛ ویرایش و حذفش سند بانکی را باز می‌کند. */
function bdMirror(s,no){const now=new Date().toISOString(),by=who();let ch=0,n=0;const keep=new Map();/* v81.0: شماره سند مشتری با ویرایش سند بانکی عوض نشود */
  for(const c of custs){if(c.sys)continue;for(const t of c.txs||[])if(!t.del&&t.bd&&String(t.bd.sid)===String(s.id)&&String(t.bd.no)===String(no)){keep.set(String(c.id)+'|'+t.bd.l,cnOf(c,t));t.del=true;t.delAt=now;t.delBy=by;ch=1}}
  for(const z of s.led||[]){if(z.del||z.no==null||String(z.no)!==String(no)||z.cuId==null||z.cuId==='')continue;const c=CU().find(q=>String(q.id)===String(z.cuId));if(!c)continue;const g=z.type==='in'?1:-1,a=+z.amount||0;
    (c.txs=c.txs||[]).push({id:nid++,type:'inv',dk:g>0?'in':'out',no,date:z.date,rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,pays:[{m:'hav',amount:g*a,srcId:s.id,bdl:z.id,tn:''}],note:[bdLab(z),z.note].filter(Boolean).join(' · '),at:z.edAt||z.at||now,by:z.by||by,bd:{sid:s.id,no,l:z.id},cn:keep.get(String(c.id)+'|'+z.id)||cnNext(c)});c.lastAt=now;ch=1;n++}
  if(ch)saveCu();return n}
/* سند متقابل در حساب مشتری → سند بانکی اصلی */
const bdOfTx=t=>{if(!t||!t.bd)return null;const s=sources.find(x=>String(x.id)===String(t.bd.sid)),z=s&&(s.led||[]).find(q=>String(q.id)===String(t.bd.l)&&!q.del);return s&&z?{s,z}:null};
function bdGoTx(t,why){const B=bdOfTx(t);toast('این سند از «سند بانکی '+toFa(t.no)+'» آمده؛ '+why+' از همان سند بانکی',true);if(B){if(can('src'))ACT.bdNew({id:B.s.id,l:B.z.id});else{bkId=B.s.id;acV={id:B.s.id,f:'all'};go('bank')}}}
/* دیدن سند بانکی: همه ردیف‌ها با تشخیص، جمع، جزئیات، ویرایش و حذف */
function bdViewHTML(s,x){const R=bdRows(s,x),bk=acBank(s),c=can('src'),net=R.reduce((a,z)=>a+(z.type==='in'?1:-1)*(+z.amount||0),0);
  const ln=(k,v)=>v?`<div class="lgdr"><small>${k}</small><b>${v}</b></div>`:'',ed=R.filter(z=>z.edAt).map(z=>z.edAt).sort().pop(),edBy=ed&&(R.find(z=>z.edAt===ed)||{}).edBy;
  return `<div class="sh-h"><div><b>${esc(ledDocT(x))}</b><small class="shsub">${esc(s.name)}${bk?' · بانک '+esc(bk):''}</small></div><button class="x" data-act="acBack" data-id="${s.id}" aria-label="بستن">×</button></div>
  ${bxBlue({t:net<0?'اثر سند · از مانده کم شد':'اثر سند · مانده زیاد شد',v:net,sub:'مانده نهایی حساب '+(acFin(s)==null?'—':fmt(acFin(s)))+' تومان'})}
  <div class="fcard bdvl">${R.map((z,i)=>`<div class="bdv ${z.type==='in'?'in':'out'}"><span class="bdn0">${toFa(i+1)}</span><span class="tx"><b>${esc(bdLab(z))}</b>${z.note?`<small>${esc(z.note)}</small>`:''}</span><b class="bdva"><bdi dir="ltr">${z.type==='in'?'+':'−'}${fmt(+z.amount||0)}</bdi> <i>تومان</i></b></div>`).join('')}</div>
  <div class="fcard lgdl">${ln('شماره سند',x.no?toFa(x.no):'بدون شماره (ثبت قبلی)')}${ln('حساب',esc(s.name))}${ln('تاریخ',esc(dates(x.date||String(x.at||'').slice(0,10)).fa)+' · '+esc(bxTime(x.at)))}${ln('ثبت‌کننده',esc(x.by||''))}${ed?ln('آخرین ویرایش',esc(dates(String(ed).slice(0,10)).fa)+' · '+esc(bxTime(ed))+(edBy?' · '+esc(edBy):'')):''}${s.balAt&&String(x.at||'')<s.balAt?ln('وضعیت','پیش از آخرین اصلاح حساب؛ در مانده حساب نمی‌شود'):''}</div>
  ${c?`<button class="xgo" data-act="bdNew" data-id="${s.id}" data-l="${x.id}">${ic('edit')} ویرایش سند</button><button class="lnk acfxd" data-act="acLedDel" data-id="${s.id}" data-l="${x.id}">${ic('trash')} حذف سند</button>`:''}`}

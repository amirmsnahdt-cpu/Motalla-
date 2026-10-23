/* ============ v61.6: جزئیات ردیف پله‌به‌پله در یک نوار (مثل نوار جستجو) ============
   بعد از انتخاب کالا، همان نوار یک فیلد را می‌پرسد (وزن)، با «بعدی» آن فیلد به یک برچسب کوچک تبدیل می‌شود و فیلد بعدی (عیار، اجرت، سود…) می‌آید؛
   همه در یک ردیف. زدن روی هر برچسب = برگشت و ویرایش همان. آخرین پله «افزودن» است. مقادیر همان قبلی‌اند (sv.qa / qa.x / qa.p) و ثبت با همان توابع قبلی. */
const stKind=()=>{const a=sv.qa;return a.p?'py':a.x?'xr':a.k?(a.ab?'ab':'it'):''};
const stS=(k,lab,u,type,get,set,o)=>({k,lab,u,type,get,set,...(o||{})});
function stSteps(){const a=sv.qa,K=stKind();
  if(K==='it')return [stS('w','وزن','گرم','dec',()=>a.w,v=>a.w=v),stS('ay','عیار','','int',()=>a.ay||750,v=>a.ay=v),stS('ajP','اجرت','٪','dec',()=>a.ajP,v=>a.ajP=v,{opt:1}),stS('ajT','اجرت تومانی','تومان','num',()=>a.ajT,v=>a.ajT=v,{opt:1}),stS('pp','سود','٪','dec',()=>a.pp,v=>a.pp=v,{opt:1})];
  if(K==='ab')return [stS('w','وزن آبشده','گرم','dec',()=>a.w,v=>a.w=v),stS('ay','عیار','','int',()=>a.ay||750,v=>a.ay=v),stS('pp','سود','٪','dec',()=>a.pp,v=>a.pp=v,{opt:1}),stS('lab','کد آزمایشگاه','','text',()=>a.lab,v=>a.lab=v,{opt:1}),stS('ang','شماره انگ','','text',()=>a.ang,v=>a.ang=v,{opt:1})];
  if(K==='xr'){const x=a.x,g=x.a==='gold',m=x.t==='sell'||x.t==='buy';
    /* v61.6: خرید/فروش طلا (پولی و غیرپولی): وزن یا مبلغ؛ با مظنه دیگری حساب می‌شود (عدد ≥ ۱۰۰۰ = مبلغ تومان) */
    if(g&&m)return [stS('w','وزن یا مبلغ','','wam',()=>+x.am?x.am:x.w,v=>{if(v&&v.am){x.am=v.am;x.w=stW(x)}else{x.am='';x.w=v}}),stS('ay','عیار','','int',()=>x.ay||750,v=>{x.ay=v;if(+x.am)x.w=stW(x)}),...(x.cat==='آبشده'?[stS('lab','کد آزمایشگاه','','text',()=>x.lab,v=>x.lab=v,{opt:1}),stS('ang','شماره انگ','','text',()=>x.ang,v=>x.ang=v,{opt:1})]:[])];
    if(g)return [stS('w','وزن','گرم','dec',()=>x.w,v=>x.w=v),stS('ay','عیار','','int',()=>x.ay||750,v=>x.ay=v),...(x.cat==='آبشده'?[stS('lab','کد آزمایشگاه','','text',()=>x.lab,v=>x.lab=v,{opt:1}),stS('ang','شماره انگ','','text',()=>x.ang,v=>x.ang=v,{opt:1})]:[])];
    return [stS('q','تعداد',(XA[x.a]||{}).u||'','dec',()=>x.q,v=>x.q=v),...(m?[stS('pg','نرخ هر '+((XA[x.a]||{}).u||'واحد'),'تومان','num',()=>x.pg||+ls.get('m_px_'+x.a,0)||'',v=>x.pg=v)]:[])]}
  if(K==='py'){const p=a.p,R=[];
    if(p.m==='pos')R.push(stS('chId','کارتخوان','','pick',()=>p.chId,v=>p.chId=v,{opts:()=>CH('pos').map(c=>({v:c.id,t:c.name,sub:'مانده '+fmt(chBal(c)),ico:'card'})),lab0:v=>(CH('pos').find(c=>String(c.id)===String(v))||{}).name}));
    if(p.m==='hav')R.push(stS('srcId','حساب ما','','pick',()=>p.srcId,v=>{p.srcId=+v||v;p.chId=''},{opts:()=>sources.map(z=>({v:z.id,t:z.name,sub:acBank(z)?'بانک '+acBank(z):'حساب ما',ico:'bank',bk:acBank(z)})),lab0:v=>(sources.find(z=>String(z.id)===String(v))||{}).name}));
    if(p.m==='cust')R.push(stS('cuId','مشتری','','pick',()=>p.cuId,v=>{p.cuId=v;const c=CU().find(z=>String(z.id)===String(v));p.cuName=c?cuName(c):''},{search:1,opts:q=>{const dOk=pDig(q),nq=nzName(toEn(q||''));return CU().filter(c=>String(c.id)!==String(sv.cuId)&&(!nq||cuHit(c,nq,dOk))).slice(0,8).map(c=>{const r=cuBal(c).R;return {v:c.id,t:cuName(c),sub:r?ourLab(r)+' '+fmt(Math.abs(r)):'تسویه',ico:'user',cls:r<0?'d':r>0?'c':''}})},lab0:v=>((CU().find(c=>String(c.id)===String(v))||{}).name)}));
    R.push(stS('amount','مبلغ','تومان','num',()=>p.amount,v=>p.amount=v));
    if(p.m==='pos'||p.m==='hav')R.push(stS('tn','پیگیری','','text',()=>p.tn,v=>p.tn=v,{opt:1}));
    return R}
  return []}
const stW=x=>{const pg=xrCalc({...x,am:'',w:1},sv.rate).pg;return pg?String(Math.round(+x.am/pg*1000)/1000):''};
const stFmt=(s,v)=>s.type==='wam'?(+v>=1000?fmt(+v)+' ت':(+v?toFa(String(v))+' گرم':'')):s.type==='pick'?(s.lab0&&s.lab0(v))||'':s.type==='num'?(+v?fmt(+v):''):s.type==='dec'?(v===''||v==null||!+v?'':toFa(String(v))):s.type==='int'?(+v?toFa(String(v)):''):esc(v||'');
const stTag=()=>{const a=sv.qa,K=stKind(),d=a.d||(a.x&&a.x.fd)||(a.p&&a.p.dir)||(a.x?({sell:'sell',buy:'buy',in:'in',out:'out'})[a.x.t]:'sell');
  const D=DK.find(z=>z[0]===d)||DK[0];let it='';if(K==='it')it=a.k;else if(K==='ab')it='آبشده';else if(K==='xr'){const x=a.x;it=x.cat==='تعویض'?'طلای کهنه':x.cat==='مرجوعی'?'طلای برگشتی':x.a==='gold'?(x.pul?'پولی':x.cat||'طلا'):((XA[x.a]||{}).t||x.a)}else if(K==='py')it=dkST(d==='out'?'out':'in',a.p.m)||(PM[a.p.m]||{}).t||'';
  return {D,it}};
function stPrev(){const a=sv.qa,K=stKind();if(!sv.rate&&(K==='it'||K==='ab'||(K==='xr'&&a.x.a==='gold'&&(a.x.t==='sell'||a.x.t==='buy'))))return '<small>مظنه یا هر گرم را بالای سند بزنید</small>';
  if(K==='it'||K==='ab'){const it=qaIt(a);if(!it.w)return '';const c=itCalc(it,sv.rate,sv.tax);return `<span class="stpv">مبلغ <b>${fmt(c.tot)}</b>${K==='ab'?` · وزن ۷۵۰ <b>${wFmt(Math.round(it.w*it.ay/750*1000)/1000)}</b>`:''}</span>`}
  if(K==='xr'){const C=xrCalc(a.x,sv.rate);if(!C.n)return '';return `<span class="stpv">${a.x.a==='gold'&&C.amount?'<b>'+wFmt(C.n)+'</b> گرم ⇄ ':''}${C.amount?'مبلغ <b>'+fmt(C.amount)+'</b>':''}${C.e?' · '+(a.x.a==='gold'?wFmt(Math.abs(C.e))+' گرم':qFmt(Math.abs(C.e)))+' '+(C.e<0?'طلبکاریم':'بدهکاریم'):''}</span>`}
  return ''}
function stHTML(){const a=sv.qa,S=stSteps(),n=S.length;if(a.st==null||a.st>n)a.st=0;const i=Math.min(a.st,n-1),cur=S[i],T=stTag(),ed=a.i!=null||(a.x&&a.x.i!=null)||(a.p&&a.p.i!=null),last=i===n-1;
  const chips=S.map((s,k)=>{if(k>=i)return '';const v=stFmt(s,s.get());return `<button type="button" class="stc${v?'':' em'}" data-act="stGo" data-i="${k}">${s.lab}${v?` <b>${v}</b>${s.u&&s.type!=='pick'?' '+s.u:''}`:''}</button>`}).join('');
  const val=cur.get(),inp=cur.type==='pick'?(cur.search?`<input id="stI" class="stin" placeholder="جستجوی ${cur.lab}…" autocomplete="off" value="${esc(a.sq||'')}">`:`<span class="stin pk">${cur.lab} را انتخاب کنید</span>`):`<input id="stI" class="stin${cur.type==='text'?'':' ltr'}" ${cur.type==='text'?'':`inputmode="${cur.type==='dec'||cur.type==='wam'?'decimal':'numeric'}"`} value="${cur.type==='wam'?(+val>=1000?Number(val).toLocaleString('en-US'):esc(val||'')):cur.type==='num'?(+val?Number(val).toLocaleString('en-US'):''):esc(val==null?'':String(val))}" placeholder="${cur.type==='wam'?'وزن (گرم) یا مبلغ (تومان)':cur.lab}${cur.u?' ('+cur.u+')':''}${cur.opt?' · اختیاری':''}" autocomplete="off" enterkeyhint="${last?'done':'next'}">`;
  return `<div class="stw"><div class="fsearch sm stbar st2"><button type="button" class="stg k-${T.D[0]}" data-act="stBack0">${ic(T.D[2])}<span>${T.D[1]}</span></button><button type="button" class="stg it" data-act="qaX">${esc(T.it)}<span class="stx">×</span></button>${chips}<label class="stf"><small>${cur.lab}</small>${inp}</label>${cur.type==='pick'?'':`<button type="button" class="stnx${last?' go':''}" data-act="stNext" aria-label="${last?'افزودن':'بعدی'}">${last?ic('check'):ic('back').replace('class="i"','class="i flip"')}</button>`}</div>
    <div class="stft"><span class="stdots">${S.map((s,k)=>`<i class="${k<i?'d':k===i?'c':''}"></i>`).join('')}</span><span id="stPv">${stPrev()}</span>${ed?`<button type="button" class="stdel" data-act="stDel">${ic('trash')}</button>`:''}${!last&&S.slice(i).every(s=>s.opt||stFmt(s,s.get())||s.type==='int')?`<button type="button" class="lnk stdone" data-act="stFin">افزودن</button>`:''}</div>
    ${cur.type==='pick'?`<div id="stPk">${stPick(cur)}</div>`:''}</div>`}
function stPick(s){const q=sv.qa.sq||'',L=s.opts(q),v=s.get();if(!L.length)return `<div class="eh" style="padding:8px">${s.k==='chId'?'کارتخوانی تعریف نشده؛ نامش را بنویسید و «افزودن» بزنید':'موردی نیست'}</div>${s.k==='chId'?`<div class="fsearch sm chadd">${ic('plus')}<input id="pyCn" placeholder="کارتخوان تازه، مثلاً پوز ملت" autocomplete="off"><button class="lnk" data-act="stChAdd">افزودن</button></div>`:''}`;
  return `<div class="bzsug cbl dkl">${L.map(o=>`<button type="button" class="bzsr dkrw${String(o.v)===String(v)?' on':''}" data-act="stPickV" data-v="${esc(o.v)}"><span class="av">${o.bk?bankBadge(o.bk):ic(o.ico||'check')}</span><span class="tx"><b>${esc(o.t)}</b><small class="${o.cls||''}">${esc(o.sub||'')}</small></span></button>`).join('')}</div>`}
function stRead(){const a=sv.qa,S=stSteps(),s=S[Math.min(a.st||0,S.length-1)],I=$('stI');if(!s||!I||s.type==='pick')return;const t=I.value;
  if(s.type==='wam'){const v=toEn(t).replace(/,/g,'');s.set(+v>=1000?{am:Math.round(+v)}:decIn(v));return}
  s.set(s.type==='num'?num(t):s.type==='dec'?decIn(t):s.type==='int'?(+toEn(t).replace(/\D/g,'')||750):clean(t))}
function stBind(){const I=$('stI'),a=sv.qa;if(!I)return;const S=stSteps(),s=S[Math.min(a.st||0,S.length-1)];
  if(s.type==='pick'){I.oninput=()=>{a.sq=I.value;const P=$('stPk');if(P)P.innerHTML=stPick(s)};return}
  selOnFocus(I);I.oninput=()=>{if(s.type==='num'){const pos=I.selectionStart||0,b=toEn(I.value.slice(0,pos)).replace(/\D/g,'').length,v=num(I.value);I.value=v?v.toLocaleString('en-US'):'';let p=0,d=0;while(p<I.value.length&&d<b){if(/\d/.test(I.value[p]))d++;p++}try{I.setSelectionRange(p,p)}catch(_){}}
    else if(s.type==='wam'){const v=toEn(I.value).replace(/,/g,'');if(+v>=1000&&/^\d+$/.test(v))I.value=(+v).toLocaleString('en-US');else I.value=decIn(I.value)}else if(s.type==='dec')I.value=decIn(I.value);else if(s.type==='int')I.value=toEn(I.value).replace(/\D/g,'').slice(0,3);stRead();svKeep();const P=$('stPv');if(P)P.innerHTML=stPrev()};
  I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.stNext()}}}
function stRe(){qaRe();const I=$('stI');if(I&&$('ov').classList.contains('hide'))setTimeout(()=>{try{I.focus({preventScroll:true})}catch(_){I.focus()}},30);const c=document.querySelector('#qa .stbar .stf');if(c&&!RM()&&c.animate)c.animate([{opacity:0,transform:'translateX(-10px)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.9,.25,1)'});const b=document.querySelector('#qa .stbar');if(b)b.scrollLeft=-(b.scrollWidth-b.clientWidth)}
function stFinish(){const K=stKind();if(K==='it'||K==='ab')ACT.qaAdd();else if(K==='xr')ACT.xrSave();else if(K==='py')ACT.pySave()}
ACT.stNext=()=>{stRead();const a=sv.qa,S=stSteps(),i=Math.min(a.st||0,S.length-1),s=S[i],v=s.get();
  if(!s.opt&&s.type!=='int'&&!(s.type==='text'?v:+v)&&!(s.type==='wam'&&+sv.qa.x.w)){toast(s.lab+' را بزنید',true);const I=$('stI');if(I)I.focus();return}
  if(s.type==='int')s.set(+v||750);
  if(i>=S.length-1){stFinish();return}a.st=i+1;svKeep();stRe()};
ACT.stFin=()=>{stRead();const S=stSteps(),miss=S.findIndex(s=>!s.opt&&s.type!=='int'&&!(s.type==='text'?s.get():+s.get()));if(miss>=0){sv.qa.st=miss;stRe();toast(S[miss].lab+' را بزنید',true);return}stFinish()};
ACT.stGo=d=>{stRead();sv.qa.st=+d.i;sv.qa.sq='';svKeep();stRe()};
ACT.stPickV=d=>{const a=sv.qa,S=stSteps(),s=S[Math.min(a.st||0,S.length-1)];s.set(d.v);a.sq='';if(a.p&&a.p.m==='cust')pyCuCap(a.p);if(a.p&&!a.p.amount)a.p.amount=pyLeft(a.p);a.st=(a.st||0)+1;svKeep();stRe()};
ACT.stChAdd=()=>{const n=$('pyCn'),name=clean((n&&n.value)||'');if(!name){toast('نام کارتخوان را بنویسید',true);return}const r=chNew(name,'pos');if(r){sv.qa.p.chId=r.id;sv.qa.st=1;svKeep();stRe();toast('«'+name+'» اضافه شد')}};
ACT.stDel=()=>{const K=stKind();if(K==='it'||K==='ab')ACT.qaDel();else if(K==='xr')ACT.xrDel();else if(K==='py')ACT.pyDel()};
ACT.stBack0=()=>{const a=sv.qa;sv.qa={...qaBlank(),d:a.d||(a.x&&a.x.fd)||''};svKeep();qaRe('qK')};

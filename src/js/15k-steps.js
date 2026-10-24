/* ============ v61.7: جزئیات ردیف پله‌به‌پله ============
   بالای نوار: عملیات (مثلاً «فروش › آبشده») و ردیف پله‌ها (هر پله با مقدارش؛ زدن = برگشت و ویرایش همان لحظه).
   خود نوار فقط یک فیلد دارد (بدون برچسب داخلش) + دکمه بعدی. زیرش: وزن، مظنه و مبلغ زنده.
   مقادیر همان قبلی‌اند (sv.qa / qa.x / qa.p) و ثبت با qaAdd / xrSave / pySave. */
const stKind=()=>{const a=sv.qa;return a.p?'py':a.x?'xr':a.k?(a.ab?'ab':'it'):''};
const stS=(k,lab,u,type,get,set,o)=>({k,lab,u,type,get,set,...(o||{})});
/* مظنه ردیف: پیش‌فرض مظنه بالای سند؛ اگر عوض شود فقط برای همین ردیف ذخیره می‌شود */
/* v61.10: مثل نرخ بالای سند، خودش تشخیص می‌دهد عدد «مظنه» (هر مثقال) است یا «هر گرم ۱۸» (با مقایسه با نرخ بالای سند)
   و دیگری را زیرش می‌نویسد. ذخیره همیشه به صورت مظنه است (o.mz)؛ o.mzk فقط یادش می‌ماند کاربر به چه شکل زده (ذخیره نمی‌شود). */
const stMzK=o=>o.mzk||rtK();
const stMzV=(o,k)=>{const m=+o.mz;return k==='g'?(m?rOfMz(m):+sv.rate||0):(m||sv.mz||mzOf(sv.rate)||0)};
const stMz=o=>{const k=stMzK(o);return stS('mz',k==='g'?'هر گرم ۱۸':'مظنه','تومان','num',()=>stMzV(o,stMzK(o))||'',v=>{v=+v||0;
  const k=v?rtDetect(v,+sv.rate||+ls.get('m_rate',0)||0):stMzK(o);o.mzk=k;const m=v?(k==='mz'?v:mzOf(v)):0,h=+sv.mz||mzOf(sv.rate);
  o.mz=!m||(k==='mz'?m===h:v===+sv.rate||m===h)?'':m},{mz:1})};
/* v61.24: خرید و تعویض: پله «مبلغ» — پیش‌فرض مبلغ حساب‌شده؛ اگر عوض شود، مبلغ ثابت می‌ماند و قیمت هر گرم از روی عیار ردیف (خرید ۷۳۵، تعویض ۷۴۰) درمی‌آید */
const stAmT=x=>stS('amT','مبلغ','تومان','num',()=>xrCalc(x,sv.rate).amount||'',v=>{v=Math.round(+v||0);if(+x.am){if(v)x.am=v;return}const b=xrCalc({...x,amT:''},sv.rate).amount;x.amT=!v||v===b?'':v},{opt:1});
function stSteps(){const a=sv.qa,K=stKind();
  if(K==='it')return [stS('w','وزن','گرم','dec',()=>a.w,v=>a.w=v),stS('ay','عیار','','int',()=>a.ay||750,v=>a.ay=v),stMz(a),stS('ajP','اجرت','٪','dec',()=>a.ajP,v=>a.ajP=v,{opt:1}),stS('ajT','اجرت تومانی','تومان','num',()=>a.ajT,v=>a.ajT=v,{opt:1}),stS('pp','سود','٪','dec',()=>a.pp,v=>a.pp=v,{opt:1})];
  if(K==='ab')return [stS('w','وزن آبشده','گرم','dec',()=>a.w,v=>a.w=v),stS('ay','عیار','','int',()=>a.ay||750,v=>a.ay=v),stMz(a),stS('pp','سود','٪','dec',()=>a.pp,v=>a.pp=v,{opt:1}),stS('lab','آزمایشگاه','','text',()=>a.lab,v=>a.lab=v,{opt:1}),stS('ang','شماره انگ','','dig',()=>a.ang,v=>a.ang=v,{opt:1})];
  if(K==='xr'){const x=a.x,g=x.a==='gold',m=x.t==='sell'||x.t==='buy',ab=x.cat==='آبشده'?[stS('lab','آزمایشگاه','','text',()=>x.lab,v=>x.lab=v,{opt:1}),stS('ang','شماره انگ','','dig',()=>x.ang,v=>x.ang=v,{opt:1})]:[];
    /* خرید/فروش طلا (پولی و غیرپولی): مظنه، بعد «وزن یا مبلغ» (عدد ≥ ۱۰۰۰ = مبلغ تومان؛ وزن از مظنه حساب می‌شود)، بعد عیار */
    if(g&&m)return [stMz(x),stS('w','وزن یا مبلغ','','wam',()=>+x.am?x.am:x.w,v=>{if(v&&v.am){x.am=v.am;x.w=''}else{x.am='';x.w=v}}),stS('ay','عیار','','int',()=>x.ay||750,v=>x.ay=v),...(x.t==='buy'?[stAmT(x)]:[]),...ab];
    if(g)return [stS('w','وزن','گرم','dec',()=>x.w,v=>x.w=v),stS('ay','عیار','','int',()=>x.ay||750,v=>x.ay=v),...ab];
    return [stS('q','تعداد',(XA[x.a]||{}).u||'','dec',()=>x.q,v=>x.q=v),...(m?[stS('pg','نرخ هر '+((XA[x.a]||{}).u||'واحد'),'تومان','num',()=>x.pg||+ls.get('m_px_'+x.a,0)||'',v=>x.pg=v)]:[])]}
  if(K==='py'){const p=a.p,R=[];
    if(p.m==='pos')R.push(stS('chId','کارتخوان','','pick',()=>p.chId,v=>p.chId=v,{opts:()=>CH('pos').map(c=>({v:c.id,t:c.name,sub:'مانده '+fmt(chBal(c)),ico:'card'})),lab0:v=>(CH('pos').find(c=>String(c.id)===String(v))||{}).name}));
    if(p.m==='hav')R.push(stS('srcId','حساب ما','','pick',()=>p.srcId,v=>{p.srcId=+v||v;p.chId=''},{opts:()=>sources.map(z=>({v:z.id,t:z.name,sub:acBank(z)?'بانک '+acBank(z):'حساب ما',ico:'bank',bk:acBank(z)})),lab0:v=>(sources.find(z=>String(z.id)===String(v))||{}).name}));
    if(p.m==='cust')R.push(stS('cuId','مشتری','','pick',()=>p.cuId,v=>{p.cuId=v;const c=CU().find(z=>String(z.id)===String(v));p.cuName=c?cuName(c):''},{search:1,opts:q=>{const dOk=pDig(q),nq=nzName(toEn(q||''));return CU().filter(c=>String(c.id)!==String(sv.cuId)&&(!nq||cuHit(c,nq,dOk))).slice(0,8).map(c=>{const r=cuBal(c).R;return {v:c.id,t:cuName(c),sub:r?ourLab(r)+' '+fmt(Math.abs(r)):'تسویه',ico:'user',cls:r<0?'d':r>0?'c':''}})},lab0:v=>((CU().find(c=>String(c.id)===String(v))||{}).name)}));
    R.push(stS('amount','مبلغ','تومان','num',()=>p.amount,v=>p.amount=v));
    if(p.m==='pos'||p.m==='hav')R.push(stS('tn','پیگیری','','text',()=>p.tn,v=>p.tn=v,{opt:1}));
    return R}
  return []}
const stFmt=(s,v)=>s.type==='wam'?(+v>=1000?fmt(+v)+' تومان':(+v?toFa(String(v))+' گرم':'')):s.type==='pick'?(s.lab0&&s.lab0(v))||'':s.type==='num'?(+v?fmt(+v):''):s.type==='dec'?(v===''||v==null||!+v?'':toFa(String(v))+(s.u&&s.u!=='تومان'?' '+s.u:'')):s.type==='int'?(+v?toFa(String(v)):''):esc(v||'');
/* عملیات و کالا (بالای نوار، بیرون از فیلد) */
function stHead(D,it,canBack){return `<div class="sthd k-${D[0]}"><button type="button" class="sthk" data-act="${it?'stBack0':'dkD'}" aria-label="تغییر نوع"><span class="sthi">${ic(D[2])}</span><b>${D[1]}</b></button>${it?`<i class="sthc">›</i><button type="button" class="sthit" data-act="stBack0">${esc(it)}</button>`:'<i class="sthc">›</i><span class="sthq">انتخاب کنید</span>'}<button type="button" class="lnk sthx" data-act="${it?'qaX':'dkD'}">انصراف</button></div>`}
const stTag=()=>{const a=sv.qa,K=stKind(),d=a.d||(a.x&&a.x.fd)||(a.p&&a.p.dir)||(a.x?(a.x.cat==='تعویض'?'swap':a.x.cat==='مرجوعی'?'ret':a.x.t):'sell');
  const D=DK.find(z=>z[0]===d)||DK[0];let it='';if(K==='it')it=a.k;else if(K==='ab')it='آبشده';else if(K==='xr'){const x=a.x;it=x.cat==='تعویض'?'طلای کهنه':x.cat==='مرجوعی'?'طلای برگشتی':x.a==='gold'?(x.pul?'پولی':x.cat||'طلا'):((XA[x.a]||{}).t||x.a)}else if(K==='py')it=dkST(d==='out'?'out':'in',a.p.m)||(PM[a.p.m]||{}).t||'';
  return {D,it}};
/* v61.11: زیر نوار یک کادر مبلغ مثل پنجره تسویه: مبلغ بزرگ با رنگ اثرش (قرمز = طلبکار می‌شویم، آبی = بدهکار می‌شویم)
   و مشخصات (وزن، مظنه، عیار…) فقط یک خط کوچک زیرش؛ خانه‌های جدا برای مشخصات حذف شد (در ردیف پله‌ها هست) */
const stDir=()=>{const a=sv.qa,K=stKind();if(K==='it'||K==='ab')return -1;if(K==='xr'){const t=a.x.t;return t==='sell'||t==='out'?-1:1}if(K==='py')return a.p.dir==='out'?-1:1;return 0};
const stMzTx=o=>{const k=stMzK(o),v=stMzV(o,k),w=stMzV(o,k==='g'?'mz':'g');return v?(k==='g'?'هر گرم ':'مظنه ')+fmt(v)+(w?' ('+(k==='g'?'مظنه ':'هر گرم ')+fmt(w)+')':'')+(+o.mz?' <b class="own">این ردیف</b>':''):''};
function stLive(){const a=sv.qa,K=stKind(),D=[];let am=0;
  if(K==='it'||K==='ab'){const it=qaIt(a),c=sv.rate||+it.mz?itCalc(it,sv.rate,sv.tax):null;am=c&&c.tot||0;
    if(it.w)D.push(wFmt(it.w)+' گرم'+(K==='ab'&&it.ay!=750?' (۷۵۰: '+wFmt(Math.round(it.w*it.ay/750*1000)/1000)+')':''));D.push(stMzTx(a))}
  else if(K==='xr'){const x=a.x,C=xrCalc(x,sv.rate),g=x.a==='gold',m=x.t==='sell'||x.t==='buy';
    if(g&&m){am=C.amount||0;if(C.n)D.push(wFmt(C.n)+' گرم'+(+x.am?' <b class="calc">حساب‌شده</b>':''));if(C.fx)D.push('قیمت هر گرم ۱۸ به عیار '+toFa(String(+x.ay||750))+': '+fmt(C.pg18)+' <b class="own">مبلغ دستی</b>');else D.push(stMzTx(x))}
    else if(g){if(C.n)D.push(wFmt(C.n)+' گرم');if(C.q)D.push('معادل ۷۵۰: '+wFmt(C.q));
      return `<div class="stam g ${C.n?(stDir()<0?'d':'c'):'z'}"><small>${C.n?(stDir()<0?'طلبکار می‌شویم':'بدهکار می‌شویم'):'وزن را بزنید'}</small><b>${C.q?wFmt(C.q):'—'}<i>گرم ۷۵۰</i></b>${D.length?`<em>${D.join(' · ')}</em>`:''}</div>`}
    else{if(C.n)D.push(qFmt(C.n));if(m&&C.pg)D.push('نرخ '+fmt(C.pg));am=m?C.amount||0:0;
      if(!m)return `<div class="stam ${C.n?(stDir()<0?'d':'c'):'z'}"><small>${C.n?(stDir()<0?'طلبکار می‌شویم':'بدهکار می‌شویم'):'تعداد را بزنید'}</small><b>${C.n?qFmt(C.n):'—'}</b></div>`}}
  else if(K==='py')am=+a.p.amount||0;
  else return '';
  const d=am?(stDir()<0?'d':'c'):'z',E=D.filter(Boolean),ai=K==='xr'?stSteps().findIndex(z=>z.k==='amT'):-1;
  return `<div class="stam ${d}${ai>=0&&sv.qa.st!==ai?' tap':''}"${ai>=0&&sv.qa.st!==ai&&am?` data-act="stGo" data-i="${ai}" role="button" aria-label="ویرایش مبلغ"`:''}><small>${am?(d==='d'?'طلبکار می‌شویم':'بدهکار می‌شویم'):'مبلغ این ردیف'}</small><b>${am?fmt(am):'—'}<i>تومان</i></b>${E.length?`<em>${E.join(' · ')}</em>`:''}</div>`}
function stHTML(){const a=sv.qa,S=stSteps(),n=S.length;if(a.st==null||a.st>=n)a.st=0;if(a.stMax==null)a.stMax=a.st;const i=a.st,cur=S[i],T=stTag(),ed=a.i!=null||(a.x&&a.x.i!=null)||(a.p&&a.p.i!=null),last=i===n-1;
  const seg=S.map((s,k)=>{const v=stFmt(s,s.get()),reach=k<=Math.max(a.stMax,i)||ed;return `<button type="button" class="stp${k===i?' on':''}${v&&k!==i?' dn':''}${reach?'':' fu'}" data-act="stGo" data-i="${k}"${reach?'':' disabled'}><small>${s.lab}${s.opt?' <i>اختیاری</i>':''}</small><b>${v||(k===i?'…':'—')}</b></button>`}).join('');
  const val=cur.get(),ph=cur.type==='wam'?'وزن (گرم) یا مبلغ (تومان)':cur.mz?'مظنه یا هر گرم ۱۸ (تومان)':cur.lab+(cur.u?' ('+cur.u+')':'')+(cur.opt?' · اختیاری':''),
    inp=cur.type==='pick'?(cur.search?`<input id="stI" class="stin" placeholder="جستجوی ${cur.lab}…" autocomplete="off" value="${esc(a.sq||'')}">`:`<span class="stin pk">${cur.lab} را از فهرست زیر انتخاب کنید</span>`):`<input id="stI" class="stin${cur.type==='text'?'':' ltr'}" ${cur.type==='text'?'':`inputmode="${cur.type==='dec'||cur.type==='wam'?'decimal':'numeric'}"`} value="${cur.type==='wam'?(+val>=1000?Number(val).toLocaleString('en-US'):esc(val||'')):cur.type==='num'?(+val?Number(val).toLocaleString('en-US'):''):esc(val==null?'':String(val))}" placeholder="${ph}" autocomplete="off" enterkeyhint="${last?'done':'next'}">`;
  const canFin=S.every(s=>s.opt||s.type==='int'||stFmt(s,s.get())||(s.type==='wam'&&(+a.x.w||+a.x.am)));
  return `<div class="stw">${stHead(T.D,T.it,1)}<div class="stps">${seg}</div>
    <div class="fsearch sm st3">${cur.type==='pick'&&cur.search?ic('search'):''}${inp}${cur.type==='pick'?'':`<button type="button" class="stnx${last?' go':''}" data-act="stNext">${last?ic('check')+'<span>'+(ed?'ذخیره':'افزودن')+'</span>':'<span>بعدی</span>'+ic('back').replace('class="i"','class="i flip"')}</button>`}</div>
    <div class="stlv" id="stPv">${stLive()}</div>
    ${ed||(!last&&canFin)?`<div class="stft">${!last&&canFin?`<button type="button" class="stdone" data-act="stFin">${ic('check')}<span>${ed?'ذخیره تغییرات':'افزودن به سند'}</span></button>`:''}${ed?`<button type="button" class="stdel" data-act="stDel" aria-label="حذف ردیف">${ic('trash')}<span>حذف</span></button>`:''}</div>`:''}
    ${cur.type==='pick'?`<div id="stPk">${stPick(cur)}</div>`:''}</div>`}
function stPick(s){const q=sv.qa.sq||'',L=s.opts(q),v=s.get();if(!L.length)return `<div class="eh" style="padding:8px">${s.k==='chId'?'کارتخوانی تعریف نشده؛ نامش را بنویسید و «افزودن» بزنید':'موردی نیست'}</div>${s.k==='chId'?`<div class="fsearch sm chadd">${ic('plus')}<input id="pyCn" placeholder="کارتخوان تازه، مثلاً پوز ملت" autocomplete="off"><button class="lnk" data-act="stChAdd">افزودن</button></div>`:''}`;
  return `<div class="bzsug cbl dkl">${L.map(o=>`<button type="button" class="bzsr dkrw${String(o.v)===String(v)?' on':''}" data-act="stPickV" data-v="${esc(o.v)}"><span class="av">${o.bk?bankBadge(o.bk):ic(o.ico||'check')}</span><span class="tx"><b>${esc(o.t)}</b><small class="${o.cls||''}">${esc(o.sub||'')}</small></span></button>`).join('')}</div>`}
function stRead(){const a=sv.qa,S=stSteps(),s=S[Math.min(a.st||0,S.length-1)],I=$('stI');if(!s||!I||s.type==='pick')return;const t=I.value;
  if(s.type==='wam'){const v=toEn(t).replace(/,/g,'');s.set(+v>=1000?{am:Math.round(+v)}:decIn(v));return}
  s.set(s.type==='num'?num(t):s.type==='dec'?decIn(t):s.type==='int'?(+toEn(t).replace(/\D/g,'')||750):s.type==='dig'?toEn(t).replace(/\D/g,''):clean(t))}
/* مقدار پله فعلی در ردیف پله‌ها همان لحظه نوشته می‌شود */
function stPaint(){const P=$('stPv');if(P)P.innerHTML=stLive();const a=sv.qa,S=stSteps(),b=document.querySelector('#qa .stp.on b');if(b){const v=stFmt(S[a.st],S[a.st].get());b.innerHTML=v||'…'}
  if(S[a.st]&&S[a.st].mz){const l=document.querySelector('#qa .stp.on small');if(l)l.textContent=S[a.st].lab}}
function stBind(){const I=$('stI'),a=sv.qa;if(!I)return;const S=stSteps(),s=S[Math.min(a.st||0,S.length-1)];
  if(s.type==='pick'){I.oninput=()=>{a.sq=I.value;const P=$('stPk');if(P)P.innerHTML=stPick(s)};return}
  selOnFocus(I);I.oninput=()=>{if(s.type==='num'){const pos=I.selectionStart||0,b=toEn(I.value.slice(0,pos)).replace(/\D/g,'').length,v=num(I.value);I.value=v?v.toLocaleString('en-US'):'';let p=0,d=0;while(p<I.value.length&&d<b){if(/\d/.test(I.value[p]))d++;p++}try{I.setSelectionRange(p,p)}catch(_){}}
    else if(s.type==='wam'){const v=toEn(I.value).replace(/,/g,'');if(+v>=1000&&/^\d+$/.test(v))I.value=(+v).toLocaleString('en-US');else I.value=decIn(I.value)}else if(s.type==='dec')I.value=decIn(I.value);else if(s.type==='int')I.value=toEn(I.value).replace(/\D/g,'').slice(0,3);else if(s.type==='dig')I.value=toEn(I.value).replace(/\D/g,'');stRead();svKeep();stPaint()};
  I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.stNext()}}}
function stRe(){qaRe();const I=$('stI');if(I&&$('ov').classList.contains('hide'))setTimeout(()=>{try{I.focus({preventScroll:true})}catch(_){I.focus()}},30);const c=document.querySelector('#qa .st3');if(c&&!RM()&&c.animate)c.animate([{opacity:.4,transform:'translateX(-12px)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.9,.25,1)'});const o=document.querySelector('#qa .stp.on');if(o&&o.scrollIntoView)o.scrollIntoView({block:'nearest',inline:'center'})}
function stFinish(){const K=stKind();if(K==='it'||K==='ab')ACT.qaAdd();else if(K==='xr')ACT.xrSave();else if(K==='py')ACT.pySave()}
const stOk=s=>s.opt||s.type==='int'||(s.type==='wam'?(+sv.qa.x.w||+sv.qa.x.am):s.type==='text'?s.get():+s.get());
ACT.stNext=()=>{stRead();const a=sv.qa,S=stSteps(),i=Math.min(a.st||0,S.length-1),s=S[i];
  if(!stOk(s)){toast(s.lab+' را بزنید',true);const I=$('stI');if(I)I.focus();return}
  if(s.type==='int')s.set(+s.get()||750);
  if(i>=S.length-1){stFinish();return}
  /* برگشت برای ویرایش: بعد از «بعدی» به همان جایی می‌رود که بودید */
  let nx=i+1;if(a.stMax>i){nx=a.stMax;for(let k=i+1;k<a.stMax;k++)if(!stOk(S[k])){nx=k;break}}
  a.st=Math.min(nx,S.length-1);a.stMax=Math.max(a.stMax||0,a.st);svKeep();stRe()};
ACT.stFin=()=>{stRead();const S=stSteps(),miss=S.findIndex(s=>!stOk(s));if(miss>=0){sv.qa.st=miss;stRe();toast(S[miss].lab+' را بزنید',true);return}stFinish()};
ACT.stGo=d=>{stRead();const a=sv.qa;a.stMax=Math.max(a.stMax||0,a.st||0);a.st=+d.i;a.sq='';svKeep();stRe()};
ACT.stPickV=d=>{const a=sv.qa,S=stSteps(),s=S[Math.min(a.st||0,S.length-1)];s.set(d.v);a.sq='';if(a.p&&a.p.m==='cust')pyCuCap(a.p);if(a.p&&!a.p.amount)a.p.amount=pyLeft(a.p);a.st=(a.st||0)+1;a.stMax=Math.max(a.stMax||0,a.st);svKeep();stRe()};
ACT.stChAdd=()=>{const n=$('pyCn'),name=clean((n&&n.value)||'');if(!name){toast('نام کارتخوان را بنویسید',true);return}const r=chNew(name,'pos');if(r){sv.qa.p.chId=r.id;sv.qa.st=1;svKeep();stRe();toast('«'+name+'» اضافه شد')}};
ACT.stDel=()=>{const K=stKind();if(K==='it'||K==='ab')ACT.qaDel();else if(K==='xr')ACT.xrDel();else if(K==='py')ACT.pyDel()};
ACT.stBack0=()=>{const a=sv.qa;sv.qa={...qaBlank(),d:a.d||(a.x&&a.x.fd)||(a.p&&a.p.dir)||''};svKeep();qaRe('qK')};

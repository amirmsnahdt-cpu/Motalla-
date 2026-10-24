/* ============ v60.9: تسویه سند فروش — بعد از «ثبت سند» پنجره تسویه باز می‌شود (مثل کیمیا: تسویه هر فاکتور در همان فاکتور) ============
   راه‌ها: حواله از مشتری (به حساب مشتری‌ای که به او بدهکاریم، یا به فروشنده یک واریزیِ ارسال‌نشده)، کارتخوان، حواله به بانک ما، نقد، تعویض طلا.
   ساختار داده عوض نمی‌شود: همه در sv.pays (cash|pos|hav|cust) و تعویض طلا یک ردیف «خرید طلا» در sv.xr با cat:'تعویض'.
   تنها روش تازه: m:'dep' = خریدار مستقیم به فروشنده یک واریزی پرداخت می‌کند → در همان واریزی یک «تسویه از مشتری» با byInv ثبت می‌شود
   (بدون ثبت جداگانه در حساب خریدار؛ اثرش همین ردیف سند است). حذف سند، آن تسویه را هم برمی‌دارد. */
let CK=null;
/* v61.44: تسویه حساب بدون کالا — وقتی سند کالا/طلا/سکه ندارد، پنجره تسویه روی «مانده حساب» مشتری کار می‌کند
   (مانده قبلی + دریافت/پرداخت‌های همین سند)؛ با کالا، روی مانده همین سند. مثبت = طلبکاریم */
const ckAcct=()=>!!(sv&&svCu()&&!sv.items.length&&!(sv.xr||[]).length);
/* v61.47: هدف تسویه از خانه‌ای که زده شد: p = مانده قبلی، d = همین سند، f = مانده نهایی (پیش‌فرض: با کالا سند، بی‌کالا نهایی).
   مانده قبلی تا وقتی سند هنوز تسویه نشده دست‌نخورده است؛ اگر دریافت/پرداخت از سند گذشت، اضافه‌اش از قبلی کم می‌شود */
const ckTg=()=>{const t=CK&&CK.tg;if(!svCu())return 'd';if(ckAcct())return t==='p'?'p':'f';return t==='p'||t==='f'?t:'d'};
function ckPrev(){const r=svBalL().find(z=>z[0]==='r')||['r',0,0,0],Y=sv.pays.reduce((s,p)=>s+pAmt(p),0),G=r[2]-Y;return G&&r[2]&&Math.sign(G)===Math.sign(r[2])?-r[1]:-r[3]}
const ckRest=()=>{const t=ckTg();return t==='p'?ckPrev():t==='f'?-svRBal():svTot().rest};
const ckOut=()=>ckRest()<0;
const CKO=[['cust','حواله به مشتری','swap'],['hav','حواله از حساب ما','bank'],['cash','پرداخت نقدی','cash'],['off','پرداخت تخفیف','tag']];
const CKT=[['dep','حواله از مشتری','swap'],['pos','کارتخوان','card'],['hav','حواله به بانک','bank'],['cash','دریافت نقدی','cash'],['gx','تعویض طلا','coin'],['off','دریافت تخفیف','tag']];
const ckUsedDep=id=>sv.pays.filter(p=>p.m==='dep'&&String(p.entId)===String(id)).reduce((s,p)=>s+pAmt(p),0);
const ckUsedCu=id=>sv.pays.filter(p=>p.m==='cust'&&String(p.cuId)===String(id)).reduce((s,p)=>s+pAmt(p),0);
function ckOpen(tg){CK={m:'',tg:tg||''};sheet(ckHTML());ckBind()}
ACT.ckTg=d=>{ckRead();CK={m:'',tg:d.w||''};ckRe()};
function ckRe(f){if(!CK||!$('sheet').querySelector('.ckw'))return;$('sheet').innerHTML=ckHTML();ckBind(f)}
function ckRows(){const R=sv.pays.map((p,i)=>({k:'py',i,ico:(PM[p.m]||PM.cash).i,lab:pyLab(p),sub:p.tn?'پیگیری '+esc(p.tn):p.m==='dep'?'در همان واریزی، تسویه از مشتری ثبت می‌شود':'',amt:pAmt(p)}));
  (sv.xr||[]).forEach((x,i)=>{if(x.cat==='تعویض'){const C=xrCalc(x,sv.rate);R.push({k:'xr',i,ico:'coin',lab:'تعویض طلا',sub:wFmt(C.n)+' گرم · عیار '+toFa(x.ay||750),amt:C.amount})}});return R}
function ckList(){const q0=clean(CK.q||''),q=nzName(toEn(q0)),dOk=pDig(q0);
  if(ckOut()){const L=CU().filter(c=>String(c.id)!==String(sv.cuId)&&(!q||cuHit(c,q,dOk))).sort((a,b)=>String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,8);
    return L.length?`<div class="stsug ckl">${L.map(c=>`<button class="stsr" data-act="ckPick" data-k="cu" data-id="${c.id}"><span class="c6a">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':'حساب مشتری'}</small></span></button>`).join('')}</div>`:'<div class="eh" style="padding:10px 4px">مشتری‌ای پیدا نشد</div>'}
  const C=CU().filter(c=>String(c.id)!==String(sv.cuId)).map(c=>[c,cuBal(c).R-ckUsedCu(c.id)]).filter(([c,r])=>r>0&&(!q||cuHit(c,q,dOk))).sort((a,b)=>b[1]-a[1]).slice(0,q?8:5);
  const D=validated().filter(x=>!x.full&&x.amount>0&&!x.sentBid).map(x=>[x,x.amount-ckUsedDep(x.id)]).filter(([x,r])=>r>0&&(!q||nzName(fullName(x)+' '+(x.holder||'')).includes(q)||dOk([x.phone,x.iban,x.code,x.card].join(' ')))).sort((a,b)=>String(PD(b[0])).localeCompare(String(PD(a[0])))).slice(0,q?12:8);
  const row=(k,id,av,cls,name,sub,v)=>`<button class="stsr" data-act="ckPick" data-k="${k}" data-id="${id}"><span class="c6a${cls}">${esc(av)}</span><span class="tx"><b>${esc(name)}</b><small>${sub}</small></span><span class="ckv"><b>${fmt(v)}</b><small>بدهکاریم</small></span></button>`;
  if(!C.length&&!D.length)return `<div class="eh" style="padding:10px 4px">${q?'کسی پیدا نشد':'به هیچ مشتری‌ای بدهکار نیستیم و واریزیِ ارسال‌نشده‌ای نیست'}</div>`;
  return `<div class="stsug ckl">${C.length?`<div class="stsh ckb">مشتری‌هایی که به آنها بدهکاریم</div>`+C.map(([c,r])=>row('cu',c.id,userInit(c.name),'',cuName(c),[c.grp?esc(c.grp):'',c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':''].filter(Boolean).join('، ')||'حساب مشتری',r)).join(''):''}
    ${D.length?`<div class="stsh">واریزی‌های ارسال‌نشده به بانک</div>`+D.map(([x,r])=>row('dep',x.id,userInit(fullName(x)),' m',fullName(x),['واریز '+esc(payLab(PD(x))),x.settled?'بخشی تسویه شده':'',x.bankShow?esc(x.bankShow):''].filter(Boolean).join('، '),r)).join(''):''}</div>`}
function ckSel(){const s=CK.sel;if(!s)return '';if(s.k==='cu'){const c=CU().find(z=>String(z.id)===String(s.id));if(!c)return '';const r=cuBal(c).R-ckUsedCu(c.id);return `<div class="stsel"><span class="c6a">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${ckOut()?'مبلغ به حساب این مشتری می‌رود':'حساب مشتری · بدهکاریم '+fmt(r)}</small></span><button class="itx" data-act="ckPick" data-k="" aria-label="برداشتن">×</button></div>`}
  const x=validated().find(z=>String(z.id)===String(s.id));if(!x)return '';const r=x.amount-ckUsedDep(x.id);return `<div class="stsel"><span class="c6a m">${esc(userInit(fullName(x)))}</span><span class="tx"><b>${esc(fullName(x))}</b><small>واریزی ${esc(payLab(PD(x)))} · مانده ${fmt(r)}</small></span><button class="itx" data-act="ckPick" data-k="" aria-label="برداشتن">×</button></div>`}
/* v61.30: کارتخوان و حساب ما مثل بقیه فهرست‌ها: جستجو بالا، فهرست زیرش */
function ckPick(){const m=CK.m,q=nzName(toEn(clean(CK.sq||''))),pos=m==='pos';
  const L=(pos?CH('pos').map(c=>({id:c.id,on:String(CK.chId)===String(c.id),t:c.name,sub:'مانده '+fmt(chBal(c)),av:ic('card')})):sources.map(z=>{const bk=acBank(z);return {id:z.id,on:String(CK.srcId)===String(z.id),t:z.name,sub:bk?'بانک '+bk:'حساب ما',av:bk?bankBadge(bk):ic('bank')}})).filter(o=>!q||nzName(toEn(o.t+' '+o.sub)).includes(q));
  const q0=clean(CK.sq||''),ex=q&&L.some(o=>nzName(toEn(o.t))===q);
  return `<div class="bzsug cbl dkl">${L.map(o=>`<button type="button" class="bzsr dkrw${o.on?' on':''}" data-act="${pos?'ckCh':'ckSrc'}" data-id="${esc(o.id)}"><span class="av">${o.av}</span><span class="tx"><b>${esc(o.t)}</b><small>${esc(o.sub)}</small></span></button>`).join('')}${ex?'':pkAddRow(pos?'کارتخوان':'حساب',q0,'ckPkAdd')}</div>`}
ACT.ckPkAdd=()=>{ckRead();const n=clean(CK.sq||''),pos=CK.m==='pos';if(!n){toast('نام '+(pos?'کارتخوان':'حساب')+' را در جستجو بنویسید',true);const I=$('ckS');if(I)I.focus();return}
  if(pos){const r=chNew(n,'pos');if(!r)return;CK.chId=r.id;ls.set('m_ch_pos',r.id)}else{const z=srcQuick(n);if(!z)return;CK.srcId=z.id;ls.set('m_src_hav',z.id)}CK.sq='';ckRe('ckA');toast('«'+n+'» اضافه شد')};
function ckForm(){const m=CK.m;if(!m)return '';const amt=`<label class="ckf"><small>مبلغ (تومان)</small><input id="ckA" class="ltr" inputmode="numeric" value="${CK.amount?Number(CK.amount).toLocaleString('en-US'):''}" autocomplete="off" enterkeyhint="done"></label>`;
  const tn=`<label class="ckf"><small>پیگیری <i>(اختیاری)</i></small><input id="ckT" class="ltr" inputmode="numeric" value="${esc(CK.tn||'')}" autocomplete="off"></label>`;let b='';
  if(m==='cash')b=amt;
  if(m==='pos'||m==='hav')b=`<div class="fsearch sm">${ic('search')}<input id="ckS" type="search" value="${esc(CK.sq||'')}" placeholder="${m==='pos'?'جستجوی کارتخوان…':'جستجوی حساب ما…'}" autocomplete="off" enterkeyhint="search"></div><div id="ckPl">${ckPick()}</div><div class="ckg">${amt}${tn}</div>`;
  if(m==='dep'||(m==='cust'&&ckOut()))b=CK.sel?`${ckSel()}${amt}`:`<div class="fsearch sm">${ic('search')}<input id="ckQ" value="${esc(CK.q||'')}" placeholder="نام، تلفن، شبا یا فاکتور…" autocomplete="off"></div><div id="ckL">${ckList()}</div>`;
  if(m==='gx'){const x=xrNew('buy','gold',{cat:'تعویض'});x.w=CK.w||'';x.ay=CK.ay||x.ay;const C=xrCalc(x,sv.rate);
    b=`<div class="ckg"><label class="ckf"><small>وزن طلای مشتری (گرم)</small><input id="ckW" class="ltr" inputmode="decimal" value="${esc(CK.w||'')}" placeholder="0.000" autocomplete="off"></label><label class="ckf"><small>عیار</small><input id="ckY" class="ltr" inputmode="numeric" value="${esc(String(CK.ay||x.ay))}" autocomplete="off"></label></div>
    <div class="ckx" id="ckX">${sv.rate?(C.n?'ارزش: <b>'+fmt(C.amount)+'</b> تومان · هر گرم '+fmt(C.pg):'وزن را بزنید'):'اول مظنه یا نرخ گرم را بالای سند بزنید'}</div>`}
  const T=(ckOut()?CKO:CKT).find(z=>z[0]===m);
  return `<div class="ckfm"><div class="ckfh"><b>${ic(T[2])} ${T[1]}</b><button class="lnk" data-act="ckM" data-m="">انصراف</button></div>${b}${(m==='dep'||m==='cust')&&!CK.sel?'':`<button class="qago ckadd" data-act="ckAdd">${ic('plus')} افزودن به تسویه</button>`}</div>`}
function ckHTML(){const T=svTot(),c=svCu(),r=ckRest(),R=ckRows(),A=ckAcct(),tg=ckTg(),TL={p:'مانده قبلی',d:A?'این سند':'مانده این سند',f:'مانده نهایی'}[tg];
  /* ریز مانده‌ها (قبلی · سند · نهایی، مبلغ و طلا)؛ خانه انتخاب‌شده پررنگ و با زدن هر خانه هدف تسویه عوض می‌شود */
  const L=svBalL(),gr=L.find(z=>z[0]==='g'),rr=L.find(z=>z[0]==='r')||['r',0,0,0],ln=(k,v)=>`<span class="${ftCls(v)}${k==='r'?' r':''}"><b>${v?balV(k,v):'۰'}</b><i>${balU(k)}</i></span>`;
  const mini=c?`<div class="ckbl">${[['p','قبلی',1],['d','سند',2],['f','نهایی',3]].map(([w,l,ix])=>`<button type="button" class="ckbc${tg===w?' on':''}" data-act="ckTg" data-w="${w}"><small>${l}</small>${ln('r',rr[ix])}${gr?ln('g',gr[ix]):''}</button>`).join('')}</div>`:'';
  return `<div class="ckw"><div class="sh-h"><div><b>${tg==='d'&&!A?'تسویه سند':tg==='p'?'تسویه مانده قبلی':'تسویه حساب'}</b><small class="shsub">${esc(c?cuName(c):'')}${r<0?' · مانده را به مشتری می‌پردازیم':''}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${mini}<div class="ckh ${r>0?'d':r<0?'c':'z'}"><small>${r?TL+' · '+(r>0?'طلبکاریم':'بدهکاریم'):TL+' تسویه است ✓'}</small><b><span id="ckRn" data-v="${Math.abs(r)}">${fmt(Math.abs(r))}</span><i>تومان</i></b><em>${tg==='d'&&!A?'جمع سند '+fmt(Math.abs(T.total)):'جمع این سند '+fmt(Math.abs(T.total))}${T.paid?(T.paid<0?' · پرداخت‌شده ':' · دریافت‌شده ')+fmt(Math.abs(T.paid)):''}${gr&&gr[3]?' · طلا '+wFmt(Math.abs(gr[3]))+' گرم '+ourLab(gr[3]):''}</em></div>
  ${R.length?`<div class="ckrs">${R.map(z=>`<div class="ckr"><span class="d6ti pm-in">${ic(z.ico)}</span><span class="tx"><b>${esc(z.lab)}</b>${z.sub?`<small>${z.sub}</small>`:''}</span><b class="ckam">${fmt(z.amt)}</b><button class="d6x" data-act="ckDel" data-k="${z.k}" data-i="${z.i}" aria-label="حذف">${ic('x')}</button></div>`).join('')}</div>`:''}
  ${CK.m?ckForm():!r?'':`<div class="ckt${r<0?' out':''}">${(r<0?CKO:CKT).map(([k,t,i])=>`<button class="ckti q-${k}" data-act="ckM" data-m="${k}"><i>${ic(i)}</i><span>${t}</span></button>`).join('')}</div>`}
  <button class="xgo cksave" data-act="ckSave">${ic('check')} پایان و ثبت سند${r>0?`<small>مانده ${fmt(r)} به حساب مشتری</small>`:''}</button>
  <button class="lnk ckback" data-act="close">بازگشت به سند</button></div>`}
function ckRead(){const g=id=>{const e=$(id);return e?e.value:undefined};if($('ckA'))CK.amount=num(g('ckA'));if($('ckT'))CK.tn=toEn(g('ckT')||'').trim();if($('ckW'))CK.w=decIn(g('ckW'));if($('ckY'))CK.ay=+toEn(g('ckY')).replace(/\D/g,'')||'';if($('ckQ'))CK.q=g('ckQ');if($('ckS'))CK.sq=g('ckS')}
function ckBind(f){const A=$('ckA'),Q=$('ckQ'),W=$('ckW'),Y=$('ckY');const PS=$('ckS');if(PS)PS.oninput=()=>{CK.sq=PS.value;const P=$('ckPl');if(P)P.innerHTML=ckPick()};
  if(A){selOnFocus(A);A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''};A.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.ckAdd()}}}
  if(Q){Q.oninput=()=>{CK.q=Q.value;clearTimeout(Q._t);Q._t=setTimeout(()=>{const L=$('ckL');if(L)L.innerHTML=ckList()},100)};const L=$('ckL');if(L)L.onpointerdown=e=>{if(e.target.closest('.stsr'))e.preventDefault()}}
  const gx=()=>{ckRead();const x=xrNew('buy','gold',{cat:'تعویض'});x.w=CK.w||'';x.ay=CK.ay||x.ay;const C=xrCalc(x,sv.rate),el=$('ckX');if(el)el.innerHTML=sv.rate?(C.n?'ارزش: <b>'+fmt(C.amount)+'</b> تومان · هر گرم '+fmt(C.pg):'وزن را بزنید'):'اول مظنه یا نرخ گرم را بالای سند بزنید'};
  if(W)W.oninput=gx;if(Y)Y.oninput=gx;
  const el=f&&$(f);if(el)sheetFocus(el)}
const ckLeft=()=>Math.abs(ckRest());
ACT.ckM=d=>{ckRead();const m=d.m||'';/* v61.39: تخفیف از پنجره تسویه — روی مانده همین سند */if(m==='off'){svOffOpen(true);return}const tg=CK&&CK.tg;CK={m,tg,amount:m==='gx'?0:ckLeft(),q:''};if(m==='pos'){const L=CH('pos'),last=ls.get('m_ch_pos','');CK.chId=(L.find(c=>String(c.id)===String(last))||L[0]||{}).id||''}
  if(m==='hav'){const last=ls.get('m_src_hav','');const s=sources.find(z=>String(z.id)===String(last))||sources[0];CK.srcId=s?s.id:''}
  ckRe(m==='dep'||m==='cust'?'ckQ':m==='gx'?'ckW':m?'ckA':'')};
ACT.ckCh=d=>{ckRead();CK.chId=d.id;ckRe()};
ACT.ckSrc=d=>{ckRead();CK.srcId=+d.id||d.id;ckRe()};
ACT.ckPick=d=>{ckRead();if(!d.k){CK.sel=null;ckRe('ckQ');return}CK.sel={k:d.k,id:d.id};
  const av=d.k==='cu'?(()=>{const c=CU().find(z=>String(z.id)===String(d.id));return c?cuBal(c).R-ckUsedCu(c.id):0})():(()=>{const x=validated().find(z=>String(z.id)===String(d.id));return x?x.amount-ckUsedDep(x.id):0})();
  CK.amount=ckOut()?ckLeft():Math.max(0,Math.min(ckLeft()||av,av));ckRe('ckA')};
ACT.ckAdd=()=>{ckRead();const m=CK.m,a0=+CK.amount||0,out=ckOut(),a=a0;
  if(out&&m!=='gx'){if(!(a>0)){toast('مبلغ را وارد کنید',true);return}if(a>ckLeft()){toast('بیشتر از مانده سند است',true);return}
    if(m==='cash')sv.pays.push({m:'cash',amount:-a});
    if(m==='hav'){if(CK.srcId===''||CK.srcId==null){toast('حساب ما را انتخاب کنید',true);return}sv.pays.push({m:'hav',amount:-a,srcId:CK.srcId,tn:CK.tn||''});ls.set('m_src_hav',CK.srcId)}
    if(m==='dep'||m==='cust'){const s=CK.sel,c=s&&CU().find(z=>String(z.id)===String(s.id));if(!c){toast('مشتری را انتخاب کنید',true);return}sv.pays.push({m:'cust',amount:-a,cuId:c.id,cuName:cuName(c)})}
    CK={m:''};ckBackToDoc();return}
  if(m==='gx'){const w=parseFloat(CK.w)||0;if(!sv.rate){toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true);return}if(!(w>0)){toast('وزن طلا را بزنید',true);return}const x=xrNew('buy','gold',{cat:'تعویض'});x.w=String(CK.w);x.ay=+CK.ay||x.ay;sv.xr.push(x)}
  else{if(!(a>0)){toast('مبلغ را وارد کنید',true);const A=$('ckA');if(A)A.focus();return}
    if(m==='cash')sv.pays.push({m:'cash',amount:a});
    if(m==='pos'){if(!CK.chId){toast('کارتخوان را انتخاب کنید',true);return}sv.pays.push({m:'pos',amount:a,chId:CK.chId,tn:CK.tn||''});ls.set('m_ch_pos',CK.chId)}
    if(m==='hav'){if(CK.srcId===''||CK.srcId==null){toast('حساب ما را انتخاب کنید',true);return}sv.pays.push({m:'hav',amount:a,srcId:CK.srcId,tn:CK.tn||''});ls.set('m_src_hav',CK.srcId)}
    if(m==='dep'){const s=CK.sel;if(!s){toast('یکی از فهرست را انتخاب کنید',true);return}
      if(s.k==='cu'){const c=CU().find(z=>String(z.id)===String(s.id));if(!c)return;const av=cuBal(c).R-ckUsedCu(c.id);if(a>av){toast('بیشتر از بدهی ما به «'+cuName(c)+'» است ('+fmt(av)+')',true);return}sv.pays.push({m:'cust',amount:a,cuId:c.id,cuName:cuName(c)})}
      else{const x=validated().find(z=>String(z.id)===String(s.id));if(!x)return;const av=x.amount-ckUsedDep(x.id);if(a>av){toast('بیشتر از مانده واریزی «'+fullName(x)+'» است ('+fmt(av)+')',true);return}sv.pays.push({m:'dep',amount:a,entId:x.id,entName:fullName(x)})}}}
  CK={m:''};ckBackToDoc()};
/* v61.32: بعد از افزودن هر دریافت/پرداخت در تسویه، پنجره بسته می‌شود و سند با ردیف تازه و مانده تازه دیده می‌شود */
function ckBackToDoc(){svKeep();closeSheet();svAdd=-1;svRe();setTimeout(()=>{const r=document.querySelector('#svRows .d6r:last-child');if(r&&r.scrollIntoView)r.scrollIntoView({behavior:RM()?'auto':'smooth',block:'center'});if(r&&!RM()&&r.animate)r.animate([{background:'color-mix(in srgb,var(--blu) 14%,transparent)'},{background:'transparent'}],{duration:900,easing:'ease-out'})},120);
  const r=ckRest();toast(r?('ردیف به سند اضافه شد · مانده '+fmt(Math.abs(r))):(ckAcct()?'حساب تسویه شد ✓':'سند تسویه شد ✓'))}
ACT.ckDel=d=>{const L=d.k==='xr'?sv.xr:sv.pays;L.splice(+d.i,1);svKeep();svRe();ckRe()};
/* «پایان» = ثبت و خروج از سند (همان ثبت خودکار خروج) */
ACT.ckSave=()=>{ckRead();closeSheet();setTimeout(()=>{if(cur==='sell')back()},60)};
/* ثبت تسویه‌های «حواله به فروشنده واریزی» روی همان واریزی‌ها (بعد از ساخته شدن سند) */
function ckDepApply(c,t,now){let n=0;for(const p of t.pays||[]){if(p.m!=='dep')continue;const e=entries.find(z=>String(z.id)===String(p.entId));if(!e)continue;
  const z={id:nid++,st:'wait',name:cuName(c),phone:c.phone||'',inv:String(t.no),amount:pAmt(p),tn:'',note:'سند فروش '+toFa(t.no),cuId:'',byInv:{cu:c.id,tx:t.id},date:t.date,at:now,by:who()};
  e.settles=(e.settles||[]).concat([z]);e.updatedAt=now;e.updatedBy=who();p.stlId=z.id;stlSync(e);n++}if(n)saveE();return n}
/* حذف سند → تسویه‌های ساخته‌شده روی واریزی‌ها هم برداشته می‌شوند؛ تابع برگشتی برای «بازگردانی» */
function invDepOff(t){const R=[];if(t.type!=='inv')return ()=>{};(t.pays||[]).forEach(p=>{if(p.m!=='dep')return;const e=entries.find(z=>String(z.id)===String(p.entId));if(!e)return;const i=(e.settles||[]).findIndex(z=>z.id===p.stlId);if(i<0)return;const z=e.settles[i];e.settles=e.settles.filter((_,k)=>k!==i);stlSync(e);R.push([e,z])});
  if(R.length)saveE();return ()=>{R.forEach(([e,z])=>{e.settles=(e.settles||[]).concat([z]);stlSync(e)});if(R.length)saveE()}}

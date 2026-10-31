/* ============ v61.7: جزئیات ردیف پله‌به‌پله ============
   بالای نوار: عملیات (مثلاً «فروش › آبشده») و ردیف پله‌ها (هر پله با مقدارش؛ زدن = برگشت و ویرایش همان لحظه).
   خود نوار فقط یک فیلد دارد (بدون برچسب داخلش) + دکمه بعدی. زیرش: وزن، مظنه و مبلغ زنده.
   مقادیر همان قبلی‌اند (sv.qa / qa.x / qa.p) و ثبت با qaAdd / xrSave / pySave. */
const stKind=()=>{const a=sv.qa;return a.pv?'pv':a.p?'py':a.x?'xr':a.k?(a.ab?'ab':'it'):''};
const stS=(k,lab,u,type,get,set,o)=>({k,lab,u,type,get,set,...(o||{})});
/* مظنه ردیف: پیش‌فرض مظنه بالای سند؛ اگر عوض شود فقط برای همین ردیف ذخیره می‌شود */
/* v61.10: مثل نرخ بالای سند، خودش تشخیص می‌دهد عدد «مظنه» (هر مثقال) است یا «هر گرم ۱۸» (با مقایسه با نرخ بالای سند)
   و دیگری را زیرش می‌نویسد. ذخیره همیشه به صورت مظنه است (o.mz)؛ o.mzk فقط یادش می‌ماند کاربر به چه شکل زده (ذخیره نمی‌شود). */
const stMzK=o=>o.mzk||rtK();
const stMzV=(o,k)=>{const m=+o.mz;return k==='g'?(m?rOfMz(m):+sv.rate||0):(m||sv.mz||mzOf(sv.rate)||0)};
/* v61.25: در خرید طلا مظنه «مظنه خرید» است: مظنه روز × عیار/۷۵۰ (۷۳۵ / ۷۴۰) — مبلغ خرید تبدیل می‌شود، وزن نه.
   ذخیره همان مظنه ۱۸ است (o.mz)؛ فقط نمایش و ورود به شکل خرید. f = ضریب عیار */
/* v61.60 (خواسته صاحب اپ): در خرید آبشده عیار روی وزن اثر می‌گذارد (وزن ۷۵۰) نه روی قیمت — مظنه همان مظنه روز می‌ماند */
const stBuyF=x=>x&&x.a==='gold'&&x.t==='buy'&&!x.pul&&x.cat!=='آبشده'?(+x.ay||750)/750:1;
const stMz=(o,f)=>{f=f||1;const B=f!==1,k0=stMzK(o);return stS('mz',(k0==='g'?'هر گرم ':'مظنه ')+(B?'خرید':(k0==='g'?'۱۸':'')),'تومان','num',()=>Math.round((stMzV(o,stMzK(o))||0)*f)||'',v0=>{const v=Math.round((+v0||0)/f);
  const k=v?rtDetect(v,+sv.rate||+ls.get('m_rate',0)||0):stMzK(o);o.mzk=k;const m=v?(k==='mz'?v:mzOf(v)):0,h=+sv.mz||mzOf(sv.rate);const old=+o.mz||'';
  o.mz=!m||Math.abs(m-h)<=Math.max(2,Math.ceil(MZK/f))||(k==='g'&&Math.abs(v-(+sv.rate||0))<=1)?'':m;if((+o.mz||'')!==old)o.amT=''},{mz:1})};
/* v61.25: پله «مبلغ» برای همه ردیف‌های پولی — پیش‌فرض مبلغ حساب‌شده؛ اگر عوض شود مبلغ ثابت می‌ماند و نرخ نهایی هر گرم/عدد از آن درمی‌آید */
const stAmT=x=>stS('amT','مبلغ','تومان','num',()=>xrCalc(x,sv.rate).amount||'',v=>{v=Math.round(+v||0);if(x.a==='gold'&&(+x.am||!parseFloat(x.w))){x.am=v||'';x.amT='';return}const b=xrCalc({...x,amT:''},sv.rate).amount;x.amT=!v||v===b?'':v},{opt:1,need:()=>x.a==='gold'&&(x.t==='sell'||x.t==='buy')&&!parseFloat(x.w)&&!+x.am,msg:'وزن یا مبلغ را بزنید'});
/* v61.27: پله «مبلغ» برای کالای فروش و آبشده — مبلغ عوض شود جمع ثابت می‌ماند (it.amT)؛ عوض کردن وزن/عیار/اجرت/سود مبلغ دستی را پاک می‌کند */
/* v61.29: مبلغ دستی درصد سود را هم با مظنه و وزن همان ردیف دوباره حساب می‌کند (کمتر = سود کمتر، بیشتر = سود بیشتر)؛
   درصد تا دو رقم اعشار در a.pp می‌نشیند و مبلغ دقیق در a.amT می‌ماند */
const stItAm=a=>stS('amT','مبلغ','تومان','num',()=>{const c=itCalc(qaIt(a),sv.rate,sv.tax);return c.tot||''},v=>{v=Math.round(+v||0);const it={...qaIt(a),amT:0},b=itCalc(it,sv.rate,sv.tax);
  if(!v||v===b.tot){a.amT='';return}const t=sv.tax&&!it.ab,base=b.gold+b.aj,pr=Math.round(t?(v-b.gold)/1.1:v-b.gold)-b.aj;if(base>0)a.pp=Math.round(pr/base*10000)/100;/* v61.46: مبلغ تایپ‌شده با مالیات است؛ پیش از مالیات نگه داشته می‌شود */a.amT=b.gold+b.aj+pr},{opt:1});
const stNv=x=>x===''||x==null||(typeof x==='string'&&!x.trim())?'':isNaN(+toEn(String(x)))?String(x):+toEn(String(x));
/* v61.60: تعداد (دلار، سکه، قطعه) با جداکننده هزارگان: ۲,۰۰۰ */
const grpIn=v=>{const r=decIn(toEn(String(v==null?'':v)).replace(/,/g,'')),i=r.split('.');return (i[0]?(+i[0]).toLocaleString('en-US'):(r.includes('.')?'0':''))+(r.includes('.')?'.'+i.slice(1).join(''):'')};
/* v61.60: وزن ۷۵۰ آبشده = وزن × عیار ÷ ۷۵۰؛ اگر عددش زده شود عیار از آن حساب می‌شود (وزن آزمایشگاه ثابت) */
const stW75=x=>stS('w75','وزن ۷۵۰','گرم','dec',()=>{const q=xrCalc(x,sv.rate).q;return q?String(q):''},v=>{const w=parseFloat(x.w)||0,q=parseFloat(v)||0;if(!w||!q)return;const ay=Math.round(q/w*750*10)/10;if(Math.abs(ay-(+x.ay||750))>=0.05){x.ay=ay;x.amT=''}},{opt:1});
const stCl=(o,k)=>v=>{if(stNv(v)!==stNv(o[k]))o.amT='';o[k]=v};
function stSteps(){const a=sv.qa,K=stKind();
  if(K==='it')return [...(a.pz?[stS('cnt','تعداد','عدد','dec',()=>a.cnt,v=>a.cnt=v,{grp:1})]:[]),stS('w',a.pz?'وزن کل':'وزن','گرم','dec',()=>a.w,stCl(a,'w')),stS('ay','عیار','','int',()=>a.ay||750,stCl(a,'ay')),stMz(a),/* v61.60: اجرت درصدی و تومانی برای همه کالاها (ساخته، سایر/دست دوم، متفرقه، پارسیان) */stS('ajP','اجرت','٪','dec',()=>a.ajP,stCl(a,'ajP'),{opt:1}),stS('ajT','اجرت تومانی','تومان','num',()=>a.ajT,stCl(a,'ajT'),{opt:1}),stS('pp','سود','٪','dec',()=>a.pp,stCl(a,'pp'),{opt:1}),stItAm(a)];
  if(K==='ab')return [stS('w','وزن آبشده','گرم','dec',()=>a.w,stCl(a,'w')),...(a.sh===1?[]:[stS('ay','عیار','','int',()=>a.ay||750,stCl(a,'ay'))]),stMz(a),stS('pp','سود','٪','dec',()=>a.pp,stCl(a,'pp'),{opt:1}),stItAm(a),stS('lab','آزمایشگاه','','text',()=>a.lab,v=>a.lab=v,{opt:1}),stS('ang','شماره انگ','','dig',()=>a.ang,v=>a.ang=v,{opt:1})];
  if(K==='xr'){const x=a.x,g=x.a==='gold',m=x.t==='sell'||x.t==='buy',ab=x.cat==='آبشده'?[stS('lab','آزمایشگاه','','text',()=>x.lab,v=>x.lab=v,{opt:1}),stS('ang','شماره انگ','','dig',()=>x.ang,v=>x.ang=v,{opt:1})]:[];
    /* خرید/فروش طلا (پولی و غیرپولی): مظنه، وزن، عیار، مبلغ. v61.56 (خواسته صاحب اپ): وزن و مبلغ جدا — پله وزن فقط گرم است (۱۰۰۰ = یک کیلو، نه مبلغ)؛
       اگر وزن خالی بماند، مبلغ پله آخر (x.am) وزن را از مظنه می‌سازد */
    if(g&&m)return [...(x.pz?[stS('cnt','تعداد','عدد','dec',()=>x.cnt,v=>x.cnt=v,{grp:1})]:[]),stMz(x,stBuyF(x)),stS('w','وزن','گرم','dec',()=>x.w,v=>{if(stNv(v)!==stNv(x.w))x.amT='';x.w=v;if(+v)x.am=''},{wOr:x,ph:'وزن (گرم) · اگر فقط مبلغ دارید خالی بگذارید',fm:v=>!+v&&+x.am?'از مبلغ: '+wFmt(xrCalc(x,sv.rate).n)+' گرم':null}),...(x.sh===1?[]:[stS('ay','عیار','','int',()=>x.ay||750,v=>x.ay=v),...(x.cat==='آبشده'?[stW75(x)]:[])]),stAmT(x),...ab];
    if(g)return [stS('w','وزن','گرم','dec',()=>x.w,v=>x.w=v),...(x.sh===1?[]:[stS('ay','عیار','','int',()=>x.ay||750,v=>x.ay=v)]),...ab];
    return [stS('q','تعداد',(XA[x.a]||{}).u||'','dec',()=>x.q,v=>x.q=v,{grp:1}),...(m?[stS('pg','نرخ هر '+((XA[x.a]||{}).u||'واحد'),'تومان','num',()=>x.pg||+ls.get('m_px_'+x.a,0)||'',v=>{if(+v!==+x.pg)x.amT='';x.pg=v}),stAmT(x)]:[])]}
  /* v61.62 (خواسته صاحب اپ): مانده قبلی هم پله‌به‌پله مثل بقیه ردیف‌ها: مبلغ · طلا · هر مانده اضافه‌شده · «+ مانده دیگر» */
  if(K==='pv'){const p=a.pv,used=new Set(p.xs.map(z=>z.k)),av=[...FXS(),...COINS()].filter(k=>!used.has(k));
    return [stS('r','مبلغ','تومان','num',()=>p.r,v=>p.r=v?String(v):'',{opt:1,nopt:1}),stS('g','طلا','گرم','dec',()=>p.g,v=>p.g=v,{opt:1,nopt:1,ph:'طلا (گرم ۷۵۰)'}),
      ...p.xs.map(z=>stS('x:'+z.k,(XA[z.k]||{t:z.k}).t,(XA[z.k]||{}).u||'عدد','dec',()=>z.v,v=>z.v=v,{opt:1,nopt:1,grp:1})),
      ...(av.length?[stS('add','مانده دیگر','','pick',()=>'',v=>{if(!XA[v]||p.xs.some(z=>z.k===v))return;p.xs.push({k:v,v:''});a.st=1+p.xs.length-1},{opt:1,nopt:1,add0:1,fm:()=>'＋ دلار، سکه',opts:()=>av.map(k=>({v:k,t:XA[k].t,sub:XA[k].k==='f'?'ارز':'سکه',ico:XA[k].k==='f'?'usd':'coin'}))})]:[])]}
  if(K==='py'){const p=a.p,R=[];
    if(p.m==='pos')R.push(stS('chId','کارتخوان','','pick',()=>p.chId,v=>p.chId=v,{opts:()=>CH('pos').map(c=>({v:c.id,t:c.name,sub:'مانده '+fmt(chBal(c)),ico:'card'})),lab0:v=>(CH('pos').find(c=>String(c.id)===String(v))||{}).name,add:{t:'کارتخوان',fn:n=>{const r=chNew(n,'pos');return r&&r.id}}}));
    if(p.m==='hav')R.push(stS('srcId','حساب ما','','pick',()=>p.srcId,v=>{p.srcId=+v||v;p.chId=''},{opts:()=>ownL(p.srcId).map(z=>{const f=acFin(z);return {v:z.id,t:z.name,sub:acBank(z)?'بانک '+acBank(z):'حساب ما',ico:'bank',bk:acBank(z),amt:f==null?null:(f<0?'−':'')+fmt(Math.abs(f)),lab:f==null?'':'مانده',cls:f==null?'':'bkm'}}),lab0:v=>(sources.find(z=>String(z.id)===String(v))||{}).name,add:{t:'حساب',fn:n=>{const z=srcQuick(n);return z&&z.id}}}));
    /* v61.47 (خواسته صاحب اپ): مانده هر مشتری با رنگ (قرمز طلبکاریم، آبی بدهکاریم)؛ مبلغ خودکار = مانده سند/حساب،
       اگر صفر بود مانده همان مشتری انتخاب‌شده؛ عدد دلخواه که زده شود همان کسر می‌شود */
    if(p.m==='cust')R.push(stS('cuId','مشتری','','pick',()=>p.cuId,v=>{p.cuId=v;const c=CU().find(z=>String(z.id)===String(v));p.cuName=c?cuName(c):'';if(c){p.amount=pyLeft(p);if(p.dir==='in')pyCuCap(p);else if(!+p.amount)p.amount=Math.abs(cuBal(c).R)||0}},{search:1,opts:q=>{const dOk=pDig(q),nq=nzName(toEn(q||''));return CU().filter(c=>String(c.id)!==String(sv.cuId)&&(!nq||cuHit(c,nq,dOk))).slice(0,8).map(c=>{const r=cuBal(c).R;return {v:c.id,t:cuName(c),sub:[c.grp||'',c.phone?toFa(c.phone):''].filter(Boolean).join('، ')||'حساب مشتری',amt:r?fmt(Math.abs(r)):'۰',lab:ourLab(r),ico:'user',cls:r<0?'d':r>0?'c':'z'}})},lab0:v=>((CU().find(c=>String(c.id)===String(v))||{}).name),add:{t:'مشتری',form:1}}));
    if(p.m==='nm')R.push(stS('cuName',p.dir==='out'?'حواله از':'حواله به','','text',()=>p.cuName,v=>p.cuName=v));
    R.push(stS('amount','مبلغ','تومان','num',()=>p.amount,v=>p.amount=v));
    if(p.m==='pos'||p.m==='hav')R.push(stS('tn','پیگیری','','text',()=>p.tn,v=>p.tn=v,{opt:1}));
    return R}
  return []}
const stFmt=(s,v)=>s.fm&&s.fm(v)!=null?s.fm(v):s.type==='wam'?(+v>=1000?fmt(+v)+' تومان':(+v?toFa(String(v))+' گرم':'')):s.type==='pick'?(s.lab0&&s.lab0(v))||'':s.type==='num'?(+v?fmt(+v):''):s.type==='dec'?(v===''||v==null||!+v?'':(s.grp?qFmt(v):toFa(String(v)))+(s.u&&s.u!=='تومان'?' '+s.u:'')):s.type==='int'?(+v?toFa(String(v)):''):esc(v||'');
/* عملیات و کالا (بالای نوار، بیرون از فیلد) */
/* v61.61 (خواسته صاحب اپ): بالای پنجره ورود ردیف دکمه «برگشت» (یک مرحله عقب: پله قبلی ← فهرست جنس‌ها ← فهرست کارها)؛
   «انصراف» کل همین ردیفِ در حال ورود را دور می‌ریزد و پنجره به حالت اول برمی‌گردد (ردیف ثبت‌شده با انصراف حذف نمی‌شود) */
function stHead(D,it,canBack){return `<div class="sthd k-${D[0]}"><button type="button" class="sthb" data-act="stUp" aria-label="برگشت">${ic('back')}<span>برگشت</span></button><button type="button" class="sthk" data-act="${it?'stBack0':'stUp'}" aria-label="تغییر نوع"><span class="sthi">${ic(D[2])}</span><b>${D[1]}</b></button>${it?`<i class="sthc">›</i><button type="button" class="sthit" data-act="stBack0">${esc(it)}</button>`:''}<button type="button" class="lnk sthx" data-act="qaCancel">انصراف</button></div>`}
const stTag=()=>{const a=sv.qa,K=stKind(),d=a.pv?a.pv.dir:a.d||(a.x&&a.x.fd)||(a.p&&a.p.dir)||(a.x?(a.x.cat==='تعویض'?'swap':a.x.cat==='مرجوعی'?'ret':a.x.t):'sell');
  const D=DK.find(z=>z[0]===d)||DK[0];let it='';if(K==='it')it=a.k;else if(K==='ab')it=a.sh===1?'آبشده شرطی':'آبشده';else if(K==='xr'){const x=a.x;it=x.cat==='تعویض'?'طلای کهنه':x.cat==='مرجوعی'?'طلای برگشتی':x.a==='gold'?(x.pz?'سکه پارسیان':x.cat==='مانده قبلی'?'مانده قبلی طلا':x.sh===1&&x.cat==='آبشده'?'آبشده شرطی':x.pul&&x.cat==='قلک'?'قلک':x.pul?'پولی':x.cat||'طلا'):((x.pul?'پولی ':'')+((XA[x.a]||{}).t||x.a))}else if(K==='pv')it='مانده قبلی';else if(K==='py')it=dkST(d==='out'?'out':'in',a.p.m)||(PM[a.p.m]||{}).t||'';
  return {D,it}};
/* v61.11: زیر نوار یک کادر مبلغ مثل پنجره تسویه: مبلغ بزرگ با رنگ اثرش (قرمز = طلبکار می‌شویم، آبی = بدهکار می‌شویم)
   و مشخصات (وزن، مظنه، عیار…) فقط یک خط کوچک زیرش؛ خانه‌های جدا برای مشخصات حذف شد (در ردیف پله‌ها هست) */
const stDir=()=>{const a=sv.qa,K=stKind();if(K==='it'||K==='ab')return -1;if(K==='xr'){const t=a.x.t;return t==='sell'||t==='out'?-1:1}if(K==='py')return a.p.dir==='out'?-1:1;if(K==='pv')return a.pv.dir==='out'?-1:1;return 0};
const stMzTx=(o,f)=>{f=f||1;const B=f!==1?' خرید':'',k=stMzK(o),v=Math.round(stMzV(o,k)*f),w=Math.round(stMzV(o,k==='g'?'mz':'g')*f);return v?(k==='g'?'هر گرم'+B+' ':'مظنه'+B+' ')+fmt(v)+(w?' ('+(k==='g'?'مظنه'+B+' ':'هر گرم'+B+' ')+fmt(w)+')':'')+(+o.mz?' <b class="own">این ردیف</b>':''):''};
/* v61.98 (خواسته صاحب اپ): هنگام ویرایش مبلغ یا مظنه/نرخ، مبنا دیده شود تا خطا کم شود — مبلغ حساب‌شده (و اختلاف مبلغ دستی با آن)،
   قیمت لحظه‌ای بازار و نرخ سند؛ زدن روی هر مبنا همان عدد را در فیلد می‌گذارد */
function stRefHTML(){const a=sv.qa,S=stSteps(),cur=S[Math.min(a.st||0,S.length-1)];if(!cur)return '';const K=stKind(),R=[];
  const chip=(l,v,on)=>v?`<button type="button" class="strf${on?' on':''}" data-act="stRefSet" data-v="${Math.round(v)}"><small>${l}</small><b>${fmt(Math.round(v))}</b></button>`:'';
  if(cur.k==='amT'){let base=0,now=0;if(K==='it'||K==='ab'){const it=qaIt(a);base=itCalc({...it,amT:0},sv.rate,sv.tax).tot||0;now=itCalc(it,sv.rate,sv.tax).tot||0}else if(K==='xr'){const x=a.x;base=xrCalc({...x,amT:''},sv.rate).amount||0;now=xrCalc(x,sv.rate).amount||0}
    if(base){R.push(chip('مبلغ حساب‌شده',base,now===base));if(now&&now!==base)R.push(`<span class="strd ${now>base?'up':'dn'}"><small>اختلاف</small><b>${now>base?'+':'−'} ${fmt(Math.abs(now-base))}</b></span>`)}}
  if(cur.mz){const o=K==='xr'?a.x:a,f=K==='xr'?stBuyF(a.x):1,k=stMzK(o),g=k==='g';const mk=glOk()?Math.round((g?GL.g18:GL.mz)*f):0,dc=Math.round((g?(+sv.rate||0):(+sv.mz||mzOf(sv.rate)||0))*f),cv=+cur.get()||0;
    if(mk)R.push(chip('بازار'+(glOld()?'':' · زنده'),mk,cv===mk));if(dc&&dc!==mk)R.push(chip('نرخ سند',dc,cv===dc))}
  return R.length?`<div class="strs">${R.join('')}</div>`:''}
ACT.stRefSet=d=>{const I=$('stI');if(!I)return;const v=+d.v||0;I.value=v?v.toLocaleString('en-US'):'';if(I.oninput)I.oninput();try{I.focus({preventScroll:true});const n=I.value.length;I.setSelectionRange(n,n)}catch(_){}};
function stLive(){const a=sv.qa,K=stKind(),D=[];let am=0;
  if(K==='it'||K==='ab'){const it=qaIt(a),c=sv.rate||+it.mz?itCalc(it,sv.rate,sv.tax):null;am=c&&c.tot||0;
    if(it.w)D.push(wFmt(it.w)+' گرم'+(K==='ab'&&it.ay!=750?' (۷۵۰: '+wFmt(Math.round(it.w*it.ay/750*1000)/1000)+')':''));D.push(c&&c.fx?'سود '+toFa(String(+a.pp||0))+'٪ ('+fmt(c.pr)+') <b class="own">مبلغ دستی</b>':stMzTx(a))}
  else if(K==='xr'){const x=a.x,C=xrCalc(x,sv.rate),g=x.a==='gold',m=x.t==='sell'||x.t==='buy';
    if(g&&m){am=C.amount||0;if(C.n)D.push(wFmt(C.n)+' گرم'+(+x.am?' <b class="calc">حساب‌شده</b>':'')+(x.cat==='آبشده'&&!x.pul&&C.q?' · وزن ۷۵۰ <b>'+wFmt(C.q)+'</b>':''));if(C.fx){const B=stBuyF(x)!==1?' خرید':'';D.push('هر گرم'+B+' '+fmt(C.pg)+' (مظنه'+B+' '+fmt(Math.round(C.pg*MZK))+') <b class="own">مبلغ دستی</b>')}else D.push(stMzTx(x,stBuyF(x)))}
    else if(g){if(C.n)D.push(wFmt(C.n)+' گرم');if(C.q)D.push('معادل ۷۵۰: '+wFmt(C.q));
      return `<div class="stam g ${C.n?(stDir()<0?'d':'c'):'z'}"><small>${C.n?(stDir()<0?'طلبکار می‌شویم':'بدهکار می‌شویم'):'وزن را بزنید'}</small><b>${C.q?wFmt(C.q):'—'}<i>گرم ۷۵۰</i></b>${D.length?`<em>${D.join(' · ')}</em>`:''}</div>`}
    else{if(C.n)D.push(qFmt(C.n));if(m&&C.pg)D.push('نرخ '+fmt(C.pg)+(C.fx?' <b class="own">مبلغ دستی</b>':''));am=m?C.amount||0:0;
      if(!m)return `<div class="stam ${C.n?(stDir()<0?'d':'c'):'z'}"><small>${C.n?(stDir()<0?'طلبکار می‌شویم':'بدهکار می‌شویم'):'تعداد را بزنید'}</small><b>${C.n?qFmt(C.n):'—'}</b></div>`}}
  else if(K==='py')am=+a.p.amount||0;
  else if(K==='pv'){const p=a.pv,dd=stDir()<0?'d':'c',L=[];if(parseFloat(p.g))L.push('طلا <b>'+wFmt(p.g)+'</b> گرم');p.xs.forEach(z=>{if(parseFloat(z.v))L.push(esc((XA[z.k]||{t:z.k}).t)+' <b>'+qFmt(z.v)+'</b>')});
    const r=+p.r||0,any=r||L.length;return `<div class="stam ${any?dd:'z'}"><small>${any?(dd==='d'?'طلبکار می‌شویم':'بدهکار می‌شویم'):'مبلغ، طلا یا مانده دیگر را بزنید'}</small><span class="fz"><b${fitS((r?fmt(r):'—')+' تومان')}>${r?fmt(r):'—'}<i>تومان</i></b></span>${L.length?`<em>${L.join(' · ')}</em>`:''}</div>`}
  else return '';
  const d=am?(stDir()<0?'d':'c'):'z',E=D.filter(Boolean),ai=K==='xr'||K==='it'||K==='ab'?stSteps().findIndex(z=>z.k==='amT'):-1;
  return `<div class="stam ${d}${ai>=0&&sv.qa.st!==ai?' tap':''}"${ai>=0&&sv.qa.st!==ai&&am?` data-act="stGo" data-i="${ai}" role="button" aria-label="ویرایش مبلغ"`:''}><small>${am?(d==='d'?'طلبکار می‌شویم':'بدهکار می‌شویم'):'مبلغ این ردیف'}</small><span class="fz"><b${fitS((am?fmt(am):'—')+' تومان')}>${am?fmt(am):'—'}<i>تومان</i></b></span>${E.length?`<em>${E.join(' · ')}</em>`:''}</div>`}
function stHTML(){const a=sv.qa,S=stSteps(),n=S.length;if(a.st==null||a.st>=n)a.st=0;if(a.stMax==null)a.stMax=a.st;const i=a.st,cur=S[i],T=stTag(),ed=a.i!=null||(a.x&&a.x.i!=null)||(a.p&&a.p.i!=null)||!!(a.pv&&a.pv.gid),last=i===n-1||!!(S[i+1]&&S[i+1].add0);
  const seg=S.map((s,k)=>{const v=stFmt(s,s.get()),reach=k<=Math.max(a.stMax,i)||ed;return `<button type="button" class="stp${k===i?' on':''}${v&&k!==i?' dn':''}${reach?'':' fu'}" data-act="stGo" data-i="${k}"${reach?'':' disabled'}><small>${s.lab}${s.opt&&!s.nopt?' <i>اختیاری</i>':''}</small><b>${v||(k===i?'…':'—')}</b></button>`}).join('');
  const val=cur.get(),ph=cur.ph?cur.ph:cur.type==='wam'?'وزن (گرم) یا مبلغ (تومان)':cur.mz?(stBuyF(sv.qa.x)!==1?'مظنه خرید یا هر گرم خرید (تومان)':'مظنه یا هر گرم ۱۸ (تومان)'):cur.lab+(cur.u?' ('+cur.u+')':'')+(cur.opt?' · اختیاری':''),
    inp=cur.type==='pick'?`<input id="stI" class="stin" type="search" placeholder="جستجوی ${cur.lab}…" autocomplete="off" enterkeyhint="search" value="${esc(a.sq||'')}">`:`<input class="stkb" data-kbn="-1" aria-hidden="true" tabindex="-1" ${cur.type==='text'?'':'inputmode="decimal"'} autocomplete="off"><input id="stI" data-kb="${stKbT(cur)}" class="stin${cur.type==='text'?'':' ltr'}" ${cur.type==='text'?'':'inputmode="decimal"'} value="${cur.type==='wam'?(+val>=1000?Number(val).toLocaleString('en-US'):esc(val||'')):cur.type==='num'?(+val?Number(val).toLocaleString('en-US'):''):cur.grp?esc(grpIn(val)):esc(val==null?'':String(val))}" placeholder="${ph}" autocomplete="off" enterkeyhint="${last?'done':'next'}"><input class="stkb" data-kbn="1" aria-hidden="true" tabindex="-1" ${cur.type==='text'?'':'inputmode="decimal"'} autocomplete="off">`;
  const canFin=S.every(s=>s.need&&s.need()?false:s.wOr||s.opt||s.type==='int'||stFmt(s,s.get()));
  return `<div class="stw">${stHead(T.D,T.it,1)}<div class="stps">${seg}</div>
    <div class="fsearch sm st3">${cur.type==='pick'?ic('search'):''}${inp}${cur.type==='pick'?'':`<button type="button" class="stnx${last?' go':''}" data-act="stNext">${last?ic('check')+'<span>'+(ed?'ذخیره':'افزودن')+'</span>':'<span>بعدی</span>'+ic('back').replace('class="i"','class="i flip"')}</button>`}</div>
    ${cur.type==='pick'?`<div id="stPk">${stPick(cur)}</div>`:''}
    <div class="stlv" id="stPv">${stLive()}${stRefHTML()}</div>
    ${stPhHTML()}
    ${ed||(!last&&canFin)?`<div class="stft">${!last&&canFin?`<button type="button" class="stdone" data-act="stFin">${ic('check')}<span>${ed?'ذخیره تغییرات':'افزودن به سند'}</span></button>`:''}${ed?`<button type="button" class="stdel" data-act="stDel" aria-label="حذف ردیف">${ic('trash')}<span>حذف</span></button>`:''}</div>`:''}
</div>`}
/* v61.30: همه فهرست‌های انتخابی (کارتخوان، حساب ما، مشتری…) جستجو دارند و فهرست زیرش دیده می‌شود */
/* v61.31: هر فهرست انتخابی ردیف «افزودن» هم دارد (کارتخوان، حساب ما، مشتری): نام را در جستجو بنویسید و بزنید */
const pkAddRow=(t,q,act)=>`<button type="button" class="bzsr dkrw nw" data-act="${act}"><span class="av">${ic('plus')}</span><span class="tx"><b>${q?'افزودن «'+esc(q)+'»':t+' تازه'}</b><small>${q?t+' تازه':'نامش را در جستجو بنویسید'}</small></span></button>`;
function stPick(s){const q=sv.qa.sq||'',qn=nzName(toEn(clean(q))),L0=s.opts(q),L=s.search||!qn?L0:L0.filter(o=>nzName(toEn(o.t+' '+(o.sub||''))).includes(qn)),v=s.get();
  if(s.add){const ex=qn&&L.some(o=>nzName(toEn(o.t))===qn);return `<div class="bzsug cbl dkl">${L.map(o=>`<button type="button" class="bzsr dkrw${String(o.v)===String(v)?' on':''}" data-act="stPickV" data-v="${esc(o.v)}"><span class="av">${o.bk?bankBadge(o.bk):ic(o.ico||'check')}</span><span class="tx"><b>${esc(o.t)}</b><small class="${o.cls||''}">${esc(o.sub||'')}</small></span>${o.amt!=null?`<span class="stpv ${o.cls||''}"><b>${o.amt}</b><small>${o.lab||''}</small></span>`:''}</button>`).join('')}${ex?'':pkAddRow(s.add.t,clean(q),'stPkAdd')}</div>`}
  if(!L.length&&L0.length)return '<div class="eh" style="padding:8px">چیزی پیدا نشد</div>';if(!L.length)return `<div class="eh" style="padding:8px">${s.k==='chId'?'کارتخوانی تعریف نشده؛ نامش را بنویسید و «افزودن» بزنید':'موردی نیست'}</div>${s.k==='chId'?`<div class="fsearch sm chadd">${ic('plus')}<input id="pyCn" placeholder="نام کارتخوان تازه" autocomplete="off"><button class="lnk" data-act="stChAdd">افزودن</button></div>`:''}`;
  return `<div class="bzsug cbl dkl">${L.map(o=>`<button type="button" class="bzsr dkrw${String(o.v)===String(v)?' on':''}" data-act="stPickV" data-v="${esc(o.v)}"><span class="av">${o.bk?bankBadge(o.bk):ic(o.ico||'check')}</span><span class="tx"><b>${esc(o.t)}</b><small class="${o.cls||''}">${esc(o.sub||'')}</small></span>${o.amt!=null?`<span class="stpv ${o.cls||''}"><b>${o.amt}</b><small>${o.lab||''}</small></span>`:''}</button>`).join('')}</div>`}
function stRead(){const a=sv.qa,S=stSteps(),s=S[Math.min(a.st||0,S.length-1)],I=$('stI');if(!s||!I||s.type==='pick')return;const t=I.value;
  if(s.type==='wam'){const v=toEn(t).replace(/,/g,'');s.set(+v>=1000?{am:Math.round(+v)}:decIn(v));return}
  s.set(s.type==='num'?num(t):s.type==='dec'?decIn(s.grp?toEn(t).replace(/,/g,''):t):s.type==='int'?(+toEn(t).replace(/\D/g,'')||750):s.type==='dig'?toEn(t).replace(/\D/g,''):clean(t))}
/* مقدار پله فعلی در ردیف پله‌ها همان لحظه نوشته می‌شود */
function stPaint(){const P=$('stPv');if(P)numMorph('#stPv .stam .fz>b',()=>{const Q=$('stPv');if(Q)Q.innerHTML=stLive()+stRefHTML()});const a=sv.qa,S=stSteps();/* v61.57: همه پله‌ها تازه می‌شوند (مثلاً مبلغ که زده شود، پله وزن «از مبلغ: … گرم» را نشان می‌دهد) */document.querySelectorAll('#qa .stp').forEach((el,k)=>{const s=S[k],b=el.querySelector('b');if(!s||!b)return;const v=stFmt(s,s.get());b.innerHTML=v||(k===a.st?'…':'—');el.classList.toggle('dn',!!v&&k!==a.st)})
  if(S[a.st]&&S[a.st].mz){const l=document.querySelector('#qa .stp.on small');if(l)l.textContent=S[a.st].lab}}
/* v66.7 (خواسته صاحب اپ): رسیدن به هر پله عددی (عیار، وزن/گرم خام، مبلغ و هر گرم ۱۸، انگ) کل مقدار را انتخاب می‌کند تا با اولین رقم عوض شود؛
   پله متنی مکان‌نما را آخر متن می‌گذارد. با onfocus (نه addEventListener) چون همان فیلد بین پله‌ها می‌ماند و شنونده‌ها روی هم جمع می‌شدند */
function stSel(I,s){try{const n=I.value.length;if(s&&/^(int|num|dec|wam|dig)$/.test(s.type))I.setSelectionRange(0,n);else I.setSelectionRange(n,n)}catch(_){}}
function stBind(){phPaint($('qa'));const I=$('stI'),a=sv.qa;if(!I)return;const S=stSteps(),s=S[Math.min(a.st||0,S.length-1)];
  if(s.type==='pick'){I.oninput=()=>{a.sq=I.value;const P=$('stPk');if(P)P.innerHTML=stPick(s)};return}
  I.onfocus=()=>setTimeout(()=>stSel(I,s),0);I.oninput=()=>{if(s.type==='num'){const pos=I.selectionStart||0,b=toEn(I.value.slice(0,pos)).replace(/\D/g,'').length,v=num(I.value);I.value=v?v.toLocaleString('en-US'):'';let p=0,d=0;while(p<I.value.length&&d<b){if(/\d/.test(I.value[p]))d++;p++}try{I.setSelectionRange(p,p)}catch(_){}}
    else if(s.type==='wam'){const v=toEn(I.value).replace(/,/g,'');if(+v>=1000&&/^\d+$/.test(v))I.value=(+v).toLocaleString('en-US');else I.value=decIn(I.value)}else if(s.type==='dec')I.value=s.grp?grpIn(I.value):decIn(I.value);else if(s.type==='int')I.value=toEn(I.value).replace(/\D/g,'').slice(0,3);else if(s.type==='dig')I.value=toEn(I.value).replace(/\D/g,'');stRead();svKeep();stPaint()};
  I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.stNext()}};
  /* v61.94 (خواسته صاحب اپ): «بعدی» روی خود کیبورد — فلش‌های ⌃⌄ بالای کیبورد آیفون به این دو فیلد نامرئی می‌روند و پله را عوض می‌کنند؛
     در اندروید کلید «بعدی» کیبورد همان Enter است. فوکوس همیشه روی همان فیلد می‌ماند (کیبورد بسته و باز نمی‌شود). */
  document.querySelectorAll('#qa .stkb').forEach(k=>{k.onfocus=()=>{const n=+k.dataset.kbn,J=$('stI');if(J)try{J.focus({preventScroll:true})}catch(_){J.focus()}if(n>0)ACT.stNext();else if((sv.qa.st||0)>0)ACT.stUp()}});
  document.querySelectorAll('#qa .stnx,#qa .stp,#qa .stdone').forEach(b=>{b.onpointerdown=b.onmousedown=e=>{if(document.activeElement===I)e.preventDefault()}})}
const stKbT=s=>!s?'':s.type==='pick'?'pick':s.type==='text'?'text':'num';
/* v61.94 (خواسته صاحب اپ): با «بعدی» پنجره نمی‌پرد — اگر نوع کیبورد پله بعد همان است، فقط تکه‌ها عوض می‌شوند و همان فیلد
   (با همان فوکوس و کیبورد) می‌ماند؛ ردیف پله‌ها فقط افقی جابه‌جا می‌شود (scrollIntoView عمودی صفحه را تکان می‌داد) */
function stPatch(O,I0){const T=document.createElement('div');T.innerHTML=stHTML();const N=T.firstElementChild;if(!N)return false;const nI=N.querySelector('#stI'),o3=O.querySelector('.st3'),n3=N.querySelector('.st3');if(!nI||!o3||!n3)return false;
  [...I0.attributes].forEach(at=>{if(!nI.hasAttribute(at.name))I0.removeAttribute(at.name)});[...nI.attributes].forEach(at=>{if(I0.getAttribute(at.name)!==at.value)I0.setAttribute(at.name,at.value)});I0.value=nI.getAttribute('value')||'';
  nI.replaceWith(I0);o3.className=n3.className;o3.replaceChildren(...n3.childNodes);O.className=N.className;O.replaceChildren(...[...N.childNodes].map(n=>n===n3?o3:n));return true}
/* v67.0 (خواسته صاحب اپ: «پله فعال کامل دیده نمی‌شود»): پله فعال وسط ردیف می‌آید و اگر نزدیک لبه است دست‌کم کامل و با فاصله دیده می‌شود.
   مقصد محاسبه و در بازه اسکرول (راست‌به‌چپ: منفی) محدود می‌شود؛ اسکرول نرم آیفون گاهی وسط راه می‌ایستاد، پس بعدش یک بار بررسی و اصلاح می‌شود. */
function stStrip(){const w=document.querySelector('#qa .stps'),o=w&&w.querySelector('.stp.on');if(!o)return;
  const tgt=()=>{const r=o.getBoundingClientRect(),q=w.getBoundingClientRect(),max=w.scrollWidth-w.clientWidth,rtl=getComputedStyle(w).direction==='rtl',lo=rtl?-max:0,hi=rtl?0:max;
    return Math.max(lo,Math.min(hi,w.scrollLeft+(r.left+r.width/2)-(q.left+q.width/2)))};
  const ok=()=>{const r=o.getBoundingClientRect(),q=w.getBoundingClientRect();return r.left>=q.left+8&&r.right<=q.right-8};
  const t=tgt();if(Math.abs(t-w.scrollLeft)<2)return;try{w.scrollTo({left:t,behavior:RM()?'auto':'smooth'})}catch(_){w.scrollLeft=t}
  clearTimeout(w._fx);w._fx=setTimeout(()=>{if(o.isConnected&&!ok())w.scrollLeft=tgt()},520)}
/* v66.9 (خواسته صاحب اپ: «همش میره از اول می‌پره»): ردیف پله‌ها با هر «بعدی» از نو ساخته می‌شد و اسکرول افقی‌اش به اول برمی‌گشت،
   بعد تا پله فعال می‌لغزید — حالا جای اسکرول قبلی نگه داشته می‌شود و فقط از همان‌جا تا پله تازه نرم می‌رود */
function stRe(){const sp=document.querySelector('#qa .stps'),sl=sp?sp.scrollLeft:null,gh=stGhost(),bw=qaDir==='bw',O=document.querySelector('#qa .stw'),I0=$('stI'),S0=stSteps(),c0=S0[Math.min(sv.qa.st||0,S0.length-1)],kb=stKbT(c0);
  let same=false;if(O&&I0&&I0.isConnected&&kb!=='pick'&&I0.dataset.kb===kb){qaDir='';same=stPatch(O,I0);if(same){stBind();phPaint($('qa'));if(document.activeElement!==I0&&$('ov').classList.contains('hide'))try{I0.focus({preventScroll:true})}catch(_){}stSel(I0,c0)}}
  if(!same){qaRe();const I=$('stI');if(I&&document.activeElement!==I&&$('ov').classList.contains('hide')&&!(c0&&c0.type==='pick'&&!c0.search)){try{I.focus({preventScroll:true})}catch(_){I.focus()}}}
  if(sl!=null){const np=document.querySelector('#qa .stps');if(np&&np!==sp)np.scrollLeft=sl}stSlide(bw,gh);stStrip()}
/* v61.98 (خواسته صاحب اپ): رفتن به پله بعد نرم و پیدا — تصویر فیلد قبلی به سمت راست محو می‌شود و فیلد تازه از چپ می‌آید
   (در راست‌به‌چپ «بعدی» سمت چپ است)، کادر مبلغ کمی بعدش، و پله فعال در ردیف بالا یک بار می‌پرد */
/* v66.8 (خواسته صاحب اپ: «مثل Liquid Glass اپل، روان؛ الان می‌پرد و انگار خطا دارد»):
   علت پرش: تصویر فیلد قبلی position:fixed روی body بود و در آیفون با کیبورد باز (viewport جابه‌جا) بالای پنل می‌افتاد؛
   و وقتی پنل کامل دوباره ساخته می‌شد کل پنل هم یک بار محو و ظاهر می‌شد. حالا:
   ۱) تصویر فیلد قبلی داخل خود پنل (#qa، absolute) و با محو + تاری کم‌کم کنار می‌رود؛ فیلد تازه از تاری روشن می‌شود (بدون پرش جا).
   ۲) پله فعال در ردیف بالا: یک «عدسی شیشه‌ای» از پله قبلی تا پله تازه با فنر می‌لغزد و کمی کش می‌آید (حس مایع)، بعد در همان پله می‌نشیند.
   ۳) کادر مبلغ جابه‌جا نمی‌شود؛ فقط عددش می‌شمارد (numMorph). */
function stGhost(){const q=$('qa'),c=q&&q.querySelector('.st3');if(!c||RM())return null;const Q=q.getBoundingClientRect(),r=c.getBoundingClientRect(),g=c.cloneNode(true);
  g.removeAttribute('id');g.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));const I=$('stI'),gi=g.querySelector('.stin');if(gi&&I)gi.value=I.value;
  g.classList.add('stgh');g.style.cssText=`position:absolute;left:${r.left-Q.left}px;top:${r.top-Q.top}px;width:${r.width}px;height:${r.height}px;margin:0;pointer-events:none;z-index:6`;
  const o=q.querySelector('.stp.on');g._k=o?[...o.parentNode.children].indexOf(o):-1;q.appendChild(g);return g}
const STE='cubic-bezier(.32,.72,0,1)';
function stSlide(bw,gh){const q=$('qa');if(q)q.classList.remove('swap','bw');if(gh&&q&&!gh.isConnected)q.appendChild(gh);const d=bw?-1:1,k0=gh?gh._k:-1;
  if(gh&&gh.animate){gh.animate([{opacity:1,filter:'blur(0)',transform:'none'},{opacity:0,filter:'blur(6px)',transform:`translateX(${d*22}px) scale(.97)`}],{duration:240,easing:'ease-out',fill:'forwards'}).onfinish=()=>gh.remove();setTimeout(()=>{if(gh.isConnected)gh.remove()},420)}else if(gh)gh.remove();if(RM())return;
  const c=q&&q.querySelector('.st3');if(c&&c.animate)c.animate([{opacity:0,filter:'blur(8px)',transform:`translateX(${-d*18}px) scale(.985)`},{opacity:1,filter:'blur(0)',transform:'none'}],{duration:420,delay:40,easing:STE,fill:'backwards'});
  const v=q&&q.querySelector('#stPv');if(v&&v.animate)v.animate([{opacity:.6},{opacity:1}],{duration:300,easing:'ease-out'});
  stLens(k0)}
/* عدسی شیشه‌ای ردیف پله‌ها: داخل خود ردیف (absolute) تا با اسکرول افقی همراه باشد */
function stLens(k0){const w=document.querySelector('#qa .stps'),o=w&&w.querySelector('.stp.on');if(!o||!w.animate)return;const L=[...w.children].filter(x=>x.classList.contains('stp')),k=L.indexOf(o),f=L[k0];
  if(!f||k0===k){o.animate([{transform:'scale(.96)'},{transform:'none'}],{duration:320,easing:STE});return}
  w.querySelectorAll('.stlens').forEach(x=>x.remove());const z=document.createElement('i');z.className='stlens';w.appendChild(z);w.classList.add('lensing');
  const box=e=>({left:e.offsetLeft+'px',top:e.offsetTop+'px',width:e.offsetWidth+'px',height:e.offsetHeight+'px'}),A=box(f),B=box(o),
    mid={left:Math.min(f.offsetLeft,o.offsetLeft)+'px',top:(o.offsetTop+o.offsetHeight*.06)+'px',width:(Math.max(f.offsetLeft+f.offsetWidth,o.offsetLeft+o.offsetWidth)-Math.min(f.offsetLeft,o.offsetLeft))+'px',height:(o.offsetHeight*.88)+'px'};
  Object.assign(z.style,B);const an=z.animate([{...A,offset:0},{...mid,offset:.45},{...B,offset:1}],{duration:520,easing:STE});
  const end=()=>{z.remove();w.classList.remove('lensing');o.animate([{transform:'scale(1.04)'},{transform:'none'}],{duration:280,easing:STE})};an.onfinish=end;an.oncancel=()=>{z.remove();w.classList.remove('lensing')}}
function stFinish(){const K=stKind();if(K==='pv'){ACT.pvSave();return}if(K==='it'||K==='ab')ACT.qaAdd();else if(K==='xr')ACT.xrSave();else if(K==='py')ACT.pySave()}
const stOk=s=>s.need&&s.need()?false:s.wOr?true:s.opt||s.type==='int'||(s.type==='wam'?(+sv.qa.x.w||+sv.qa.x.am):s.type==='text'?s.get():+s.get());
ACT.stNext=()=>{stRead();const a=sv.qa,S=stSteps(),i=Math.min(a.st||0,S.length-1),s=S[i];
  if(!stOk(s)){toast(s.msg||s.lab+' را بزنید',true);const I=$('stI');if(I)I.focus();return}
  if(s.type==='int')s.set(+s.get()||750);
  /* v61.82 (خواسته صاحب اپ): در مانده قبلی «بعدی» بعد از آخرین مقدار به «+ دلار، سکه» نمی‌رود؛ همان «افزودن به سند» است */
  if(i>=S.length-1||(S[i+1]&&S[i+1].add0)){stFinish();return}
  /* برگشت برای ویرایش: بعد از «بعدی» به همان جایی می‌رود که بودید */
  let nx=i+1;if(a.stMax>i){nx=a.stMax;for(let k=i+1;k<a.stMax;k++)if(!stOk(S[k])){nx=k;break}}
  a.st=Math.min(nx,S.length-1);a.stMax=Math.max(a.stMax||0,a.st);svKeep();stRe()};
ACT.stFin=()=>{stRead();const S=stSteps(),miss=S.findIndex(s=>!stOk(s));if(miss>=0){sv.qa.st=miss;stRe();toast(S[miss].msg||S[miss].lab+' را بزنید',true);return}stFinish()};
ACT.stGo=d=>{stRead();const a=sv.qa;a.stMax=Math.max(a.stMax||0,a.st||0);a.st=+d.i;a.sq='';svKeep();stRe()};
ACT.stPickV=d=>{const a=sv.qa,S=stSteps(),s=S[Math.min(a.st||0,S.length-1)];s.set(d.v);a.sq='';if(a.p&&a.p.m==='cust')pyCuCap(a.p);if(a.p&&!a.p.amount)a.p.amount=pyLeft(a.p);a.st=(a.st||0)+1;a.stMax=Math.max(a.stMax||0,a.st);svKeep();stRe()};
ACT.stPkAdd=()=>{const a=sv.qa,S=stSteps(),i=Math.min(a.st||0,S.length-1),s=S[i];if(!s||!s.add)return;const n=clean(a.sq||'');
  if(s.add.form){if(!svCu()){toast('اول مشتری سند را انتخاب کنید',true);return}cuRet='peer';sheet(cuFormHTML({name:n}));cuBind();setTimeout(()=>{const f=$(n?'cuP':'cuN');if(f)f.focus()},320);return}
  if(!n){toast('نام '+s.add.t+' را در جستجو بنویسید',true);const I=$('stI');if(I)I.focus();return}
  const id=s.add.fn(n);if(id==null||id==='')return;a.sq='';s.set(id);if(s.k==='srcId')ls.set('m_src_hav',id);if(s.k==='chId')ls.set('m_ch_pos',id);toast('«'+n+'» اضافه شد');ACT.stNext()};
/* مشتری تازه از فهرست «حواله از/به مشتری»: بعد از ذخیره همان‌جا انتخاب می‌شود */
function stPeerNew(c){const p=sv.qa&&sv.qa.p;if(!p)return;p.cuId=c.id;p.cuName=cuName(c);sv.qa.sq='';svKeep();ACT.stNext()}
ACT.stChAdd=()=>{const n=$('pyCn'),name=clean((n&&n.value)||'');if(!name){toast('نام کارتخوان را بنویسید',true);return}const r=chNew(name,'pos');if(r){sv.qa.p.chId=r.id;sv.qa.st=1;svKeep();stRe();toast('«'+name+'» اضافه شد')}};
ACT.stDel=()=>{const K=stKind();if(K==='pv'){if(sv.qa.pv.gid)pvDel(sv.qa.pv.gid);return}if(K==='it'||K==='ab')ACT.qaDel();else if(K==='xr')ACT.xrDel();else if(K==='py')ACT.pyDel()};
ACT.stBack0=()=>{const a=sv.qa;sv.qa={...qaBlank(),d:a.d||(a.pv&&a.pv.dir)||(a.x&&a.x.fd)||(a.p&&a.p.dir)||''};svKeep();qaDir='bw';qaRe('qK')};
/* برگشت یک مرحله: پله قبلی؛ از پله اول به فهرست جنس‌ها (ردیف ثبت‌شده‌ای که ویرایش می‌شود: بستن بدون تغییر)؛ از فهرست جنس‌ها به فهرست کارها */
ACT.stUp=()=>{const a=sv.qa,ed=a.i!=null||(a.x&&a.x.i!=null)||(a.p&&a.p.i!=null)||(a.pv&&a.pv.gid);
  if(a.k||a.x||a.p||a.pv){if((a.st||0)>0){stRead();a.stMax=Math.max(a.stMax||0,a.st);a.st--;a.sq='';svKeep();qaDir='bw';stRe();return}if(ed){ACT.qaCancel();return}ACT.stBack0();return}
  if(a.pk){a.pk='';a.q='';svKeep();qaDir='bw';qaRe();return}
  qaRead();sv.qa={...qaBlank()};dkOpen=true;svKeep();qaDir='bw';qaRe();dkShow()};
/* انصراف = کل ردیف در حال ورود کنار می‌رود (ویرایش ردیف ثبت‌شده: بدون تغییر بسته می‌شود) */
ACT.qaCancel=()=>{sv.qa=qaBlank();dkOpen=false;svKeep();qaDir='bw';qaRe()};
/* v61.60 (خواسته صاحب اپ، فیلم اندروید): وقتی کیبورد باز است نوار مانده پایین سند (#act) پنهان می‌شود تا جا نگیرد —
   در اندروید صفحه با کیبورد کوچک می‌شود و نوار بالای کیبورد می‌آمد. تشخیص: فیلد تایپی فوکوس دارد و ارتفاع دید ۱۴۰px+ کم شده */
let kbBase=0;
function kbChk(){const vv=window.visualViewport,h=Math.round(vv?vv.height:innerHeight),ae=document.activeElement,
  ed=!!ae&&!ae.readOnly&&((ae.tagName==='INPUT'&&!/^(checkbox|radio|button|submit|file|range)$/i.test(ae.type||''))||ae.tagName==='TEXTAREA'||ae.isContentEditable);
  if(!ed||!kbBase)kbBase=Math.max(h,ed?kbBase:0);const on=ed&&kbBase-h>140&&(cur==='sell'||cur==='inv');
  document.documentElement.classList.toggle('kbo',on)}
(()=>{const f=()=>setTimeout(kbChk,60);if(window.visualViewport)visualViewport.addEventListener('resize',kbChk);addEventListener('resize',kbChk);
  addEventListener('orientationchange',()=>{kbBase=0;f()});document.addEventListener('focusin',f);document.addEventListener('focusout',f)})();

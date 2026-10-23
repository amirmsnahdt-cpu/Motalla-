/* ============ v61: «تشخیص» — ورود ردیف سند مثل کیمیا: اول نوع کار، بعد نوع جنس، بعد پنجره مخصوص همان ============
   فروش: آبشده (وزن، عیار، وزن ۷۵۰، سود، کد آزمایشگاه، شماره انگ)، طلای ساخته (کالا با اجرت و سود)، متفرقه، سکه (تعداد + عکس)، دلار و ارز.
   خرید: متفرقه، آبشده، سکه، دلار و ارز — مانده سند به «پرداخت» می‌رود.  تعویض / مرجوعی: طلای مشتری با نرخ روز (یک ردیف خرید).
   دریافت / پرداخت: حواله (مشتری یا بانک)، کارتخوان، نقد، آبشده، متفرقه، سکه، دلار — طلا و جنس بدون مظنه، فقط حساب جنسی مشتری.
   حساب‌ها همان قبلی است: فروش/خرید فقط ریالی (جنس تحویل می‌شود)، دریافت/پرداخت جنسی یا ریالی. هیچ ساختار داده‌ای عوض نمی‌شود. */
const DK=[['sell','فروش','tag'],['buy','خرید','coin'],['swap','تعویض','refresh'],['in','دریافت','down'],['out','پرداخت','share'],['ret','مرجوعی','undo']];
const DKS={sell:[['ab','آبشده','coin'],['gold','طلای ساخته','ring'],['misc','متفرقه','ring'],['coin','سکه','coin'],['fx','دلار و ارز','usd']],
  buy:[['misc','متفرقه','coin'],['ab','آبشده','coin'],['coin','سکه','coin'],['fx','دلار و ارز','usd']],
  in:[['cust','حواله از مشتری','swap'],['hav','حواله از بانک','bank'],['pos','کارتخوان','card'],['cash','نقد','cash'],['ab','آبشده','coin'],['misc','متفرقه','coin'],['coin','سکه','coin'],['fx','دلار و ارز','usd']],
  out:[['cust','حواله به مشتری','swap'],['hav','حواله از بانک ما','bank'],['cash','نقد','cash'],['ab','آبشده','coin'],['misc','متفرقه','coin'],['coin','سکه','coin'],['fx','دلار و ارز','usd']]};
const dkT=d=>(DK.find(z=>z[0]===d)||[])[1]||'';
const dkST=(d,s)=>((DKS[d]||[]).find(z=>z[0]===s)||[])[1]||'';
const COINS=()=>Object.keys(XA).filter(k=>XA[k].k==='c'),FXS=()=>Object.keys(XA).filter(k=>XA[k].k==='f');
/* v61.2: تشخیص و نوع، هر دو فقط یک فیلد جستجو؛ با لمس، فهرست زیر همان فیلد باز می‌شود (مثل نام مشتری‌ها).
   موارد ثابت (کارهای اصلی، آبشده، متفرقه، پولی، سکه‌ها، ارزها، روش‌های پول) با نشان «ثابت» از کالاهای اضافه‌شده جدا دیده می‌شوند.
   کالای تازه با دسته: ساخته / سایر (پنجره اجرت و سود) یا سکه / ارز (جنس تازه در حساب جنسی، در cfg.xa ذخیره و به XA افزوده می‌شود). */
function xaSync(){const r=cfgRec();((r&&r.xa)||[]).forEach(o=>{if(o&&o.k&&!XA[o.k])XA[o.k]={t:o.t||o.k,s:o.s||o.k,u:o.u||(o.c==='f'?'واحد':'عدد'),k:o.c==='f'?'f':'c',x:1}})}
const gCat=k=>{const r=cfgRec();return (r&&r.gk&&r.gk[k])||'ساخته'};
function dkFixed(d){const R=[];const fx=(id,t,ico,sub,cls)=>R.push({id,t,ico,sub,cls:cls||''});
  if(d==='in'||d==='out'){fx('m:cust',d==='in'?'حواله از مشتری':'حواله به مشتری','swap','از حساب مشتری دیگر');fx('m:hav',d==='in'?'حواله از بانک':'حواله از بانک ما','bank','حساب‌های ما');if(d==='in')fx('m:pos','کارتخوان','card','پوزهای مغازه');fx('m:cash','نقد','cash','پول نقد')}
  fx('g:ab','آبشده','coin',d==='sell'?'وزن، عیار، انگ، سود':'وزن و عیار','gd');fx('g:misc','متفرقه','coin',d==='sell'?'طلای دست‌دوم با اجرت و سود':'طلای دست‌دوم','gd');
  if(d==='sell'||d==='buy')fx('g:pul','پولی','swap',d==='sell'?'طلا تحویل نمی‌شود · فروش فردایی':'طلا تحویل گرفته نمی‌شود','gd');
  xaSync();COINS().forEach(k=>fx('a:'+k,XA[k].t,'coin',XA[k].x?'سکه':'سکه','gd'));FXS().forEach(k=>fx('a:'+k,XA[k].t,'usd','ارز'));return R}
function dkHTML(){const a=sv.qa,D=a.d&&DK.find(z=>z[0]===a.d);
  const sel=(t,ico,act,cls)=>`<div class="dksel${cls?' '+cls:''}"><span class="dki">${ic(ico)}</span><b>${t}</b><button class="itx" data-act="${act}" aria-label="برداشتن">×</button></div>`;
  let h='';/* v61.5: بدون سرتیتر «ردیف تازه»؛ فقط فیلدها */
  if(!D)return h+`<div class="dkf dkbox${a.q?' open':''}"><div class="fsearch sm">${ic('search')}<input id="qK" value="${esc(a.q||'')}" placeholder="تشخیص: فروش، خرید، تعویض، دریافت…" autocomplete="off" enterkeyhint="next"></div><div id="qKs">${dkList()}</div></div>`;
  /* v61.7: بالای نوار می‌نویسد چه عملیاتی است (بیرون از فیلد)، خود نوار فقط جستجوی کالا */
  return h+`<div class="dkf dkbox open">${stHead(D,'',0)}<div class="fsearch sm">${ic('search')}<input id="qK" value="${esc(a.q||'')}" placeholder="${a.d==='sell'?'چه می‌فروشید؟ آبشده، النگو، نیم سکه، دلار…':a.d==='buy'?'چه می‌خرید؟ متفرقه، آبشده، سکه، دلار…':'حواله، نقد، آبشده، سکه…'}" autocomplete="off" enterkeyhint="next"></div><div id="qKs">${dkList()}</div></div>`}
function dkList(){const a=sv.qa,q0=clean(a.q||''),q=nzName(toEn(q0)),hit=t=>!q||nzName(t).includes(q);
  const row=(act,data,ico,t,sub,cls)=>`<button type="button" class="bzsr dkrw${cls?' '+cls:''}" data-act="${act}"${Object.entries(data).map(([k,v])=>` data-${k}="${esc(v)}"`).join('')}><span class="av">${ic(ico)}</span><span class="tx"><b>${t}</b><small>${sub||''}</small></span>${/fix/.test(cls||'')?'<em class="dkfx">ثابت</em>':''}</button>`;
  if(!a.d){const R=DK.filter(([k,t])=>hit(t)).map(([k,t,i])=>row('dkD',{d:k},i,t,{sell:'آبشده، طلای ساخته، سکه، ارز',buy:'متفرقه، آبشده، سکه، ارز',swap:'طلای کهنه مشتری با نرخ روز',in:'حواله، نقد، طلا، سکه، ارز',out:'حواله، نقد، طلا، سکه، ارز',ret:'برگشت کالای فروخته'}[k],'fix k-'+k));
    return R.length?`<div class="bzsug cbl dkl">${R.join('')}</div>`:'<div class="eh" style="padding:8px">چیزی پیدا نشد</div>'}
  const F=dkFixed(a.d).filter(z=>hit(z.t+' '+z.sub)).map(z=>row('dkF',{id:z.id},z.ico,esc(z.t),esc(z.sub),'fix '+z.cls));
  let G=[];if(a.d==='sell'){const L=goodsList().filter(k=>k!=='آبشده'&&k!=='سکه'&&hit(k)).sort((x,y)=>(q?(nzName(y).startsWith(q)-nzName(x).startsWith(q)):0)||(svUsed[y]||0)-(svUsed[x]||0)).slice(0,q?8:6);
    G=L.map(k=>row('qaK',{k},'ring',esc(k),esc(gCat(k))+(svUsed[k]?'، '+toFa(svUsed[k])+' بار':''),'gd'))}
  const known=q&&(dkFixed(a.d).some(z=>nzName(z.t)===q)||goodsList().some(k=>nzName(k)===q));
  let N='';if(q&&!known&&!/^\d+$/.test(q)&&a.d!=='in'&&a.d!=='out'||q&&!known&&(a.d==='in'||a.d==='out')&&!/^\d+$/.test(q)){
    N=a.nc?`<div class="dkcat"><small>«${esc(q0)}» در کدام دسته؟</small><div class="gks">${(a.d==='sell'?['ساخته','سایر','سکه','ارز']:['سکه','ارز']).map(c=>`<button class="tch" data-act="dkNew" data-c="${c}">${c}</button>`).join('')}</div></div>`
      :row('dkNc',{},'plus','کالای تازه «'+esc(q0)+'»','دسته‌اش را انتخاب کنید','nw')}
  const out=F.join('')+(G.length?`<div class="stsh">کالاهای اضافه‌شده</div>`+G.join(''):'')+N;
  return out?`<div class="bzsug cbl dkl">${out}</div>`:'<div class="eh" style="padding:8px">چیزی پیدا نشد</div>'}
ACT.dkNc=()=>{qaRead();sv.qa.nc=1;const r=$('qKs');if(r)r.innerHTML=dkList()};
ACT.dkNew=d=>{qaRead();const a=sv.qa,k=clean(a.q||''),c=d.c;if(!k)return;a.nc=0;const r=cfgRec(1);
  if(c==='سکه'||c==='ارز'){r.xa=(r.xa||[]).filter(o=>o.k!==k).concat([{k,t:k,s:k,u:c==='ارز'?'واحد':'عدد',c:c==='ارز'?'f':'c'}]);saveCu();xaSync();toast('«'+k+'» به '+c+'‌ها اضافه شد');ACT.dkF({id:'a:'+k});return}
  r.gk={...(r.gk||{}),[k]:c};addGoods(k);saveCu();toast('«'+k+'» در دسته '+c+' اضافه شد');ACT.qaK({k})};
/* انتخاب از موارد ثابت */
ACT.dkF=d=>{qaRead();const a=sv.qa,D=a.d,[ty,v]=String(d.id).split(':');a.q='';a.nc=0;
  if(ty==='m'){if(v==='cust'&&!svCu()){toast('اول مشتری سند را انتخاب کنید',true);return}pyStart(pyNew(v,{dir:D,fl:1}));return}
  if(ty==='a'){const t=D==='sell'||D==='buy'?D:D;xrStart(xrNew(t,v,{fl:'one',fd:D}));return}
  if(ty==='g'){
    if(v==='ab'&&D==='sell'){a.k='آبشده';a.ab=1;a.ay=+ls.get('m_abay',0)||750;a.pp=ls.get('m_abpp',0.7);a.ajP='';a.ajT='';a.lab='';a.ang='';a.i=null;svKeep();qaRe('qW');return}
    if(v==='misc'&&D==='sell'){ACT.qaK({k:'متفرقه'});return}
    if(v==='pul'){if(!dkRateOk())return;xrStart(xrNew(D,'gold',{pul:true,ay:750,fl:'gold',fd:D,cat:''}));return}
    if(D==='buy'&&!dkRateOk())return;xrStart(xrNew(D,'gold',{cat:v==='ab'?'آبشده':'متفرقه',ay:v==='ab'?750:(D==='buy'?735:750),fl:'gold',fd:D}));return}};
const dkRateOk=()=>{if(sv.rate)return true;toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true);const m=$('svM');if(m)m.focus();return false};
ACT.dkD=d=>{qaRead();const a=sv.qa,k=d.d||'';a.d=k;a.s='';a.q='';
  if(k==='swap'||k==='ret'){if(!dkRateOk()){a.d='';svKeep();qaRe();return}a.d='';xrStart(xrNew('buy','gold',{cat:k==='swap'?'تعویض':'مرجوعی',ay:k==='ret'?750:735,fl:'gold',fd:k}));return}
  svKeep();qaRe('qK')};
/* عکس سکه (یا هر جنس) در ردیف: در IndexedDB مثل رسیدها؛ کلید روی ردیف (img) */
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||t.id!=='xrF'||!sv||!sv.qa.x)return;const f=t.files&&t.files[0];t.value='';if(!f)return;
  try{const d=await shrink(f),k=newImgKey('xr');if(await imgPut(k,d)){xrRead();sv.qa.x.img=k;svKeep();qaRe();toast('عکس ضمیمه شد')}else toast('حافظه پر است؛ عکس ذخیره نشد',true)}catch(e){toast('این عکس خوانده نشد',true)}});
async function xrImgPaint(){const x=sv&&sv.qa&&sv.qa.x,el=$('xrFi');if(!x||!x.img||!el)return;const v=await imgGet(x.img);if(v&&el.isConnected)el.style.backgroundImage=`url(${v})`}

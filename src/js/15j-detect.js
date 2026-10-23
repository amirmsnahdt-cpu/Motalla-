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
function dkHTML(){const a=sv.qa,D=a.d&&DK.find(z=>z[0]===a.d),S=D&&DKS[a.d];
  const sel=(t,ico,act,cls)=>`<div class="dksel${cls?' '+cls:''}"><span class="dki">${ic(ico)}</span><b>${t}</b><button class="itx" data-act="${act}" aria-label="برداشتن">×</button></div>`;
  let h=`<div class="d6qh"><b>ردیف تازه</b><small>${D?'':'اول «تشخیص» را انتخاب کنید'}</small></div>`;
  h+=`<div class="dkf"><small>تشخیص</small>${D?sel(D[1],D[2],'dkD','k-'+D[0]):`<div class="fsearch sm">${ic('search')}<input id="qK" value="${esc(a.q||'')}" placeholder="فروش، خرید، دریافت، سکه، آبشده…" autocomplete="off" enterkeyhint="next"></div>`}</div>`;
  if(!D)return h+`<div id="qKs">${dkList()}</div>`;
  if(a.s==='gold')return h+`<div class="dkf"><small>نوع</small>${sel('طلای ساخته','ring','dkS0')}</div><div class="dkf"><small>کالا</small><div class="fsearch sm">${ic('search')}<input id="qK" value="${esc(a.q||'')}" placeholder="انگشتر، النگو، گردنبند…" autocomplete="off" enterkeyhint="next"></div></div><div id="qKs">${dkList()}</div>`;
  return h+`<div class="dkf"><small>نوع</small><div class="fsearch sm">${ic('search')}<input id="qK" value="${esc(a.q||'')}" placeholder="جستجو در ${esc(D[1])}…" autocomplete="off" enterkeyhint="next"></div></div><div id="qKs">${dkList()}</div>`}
/* فهرست زیر جستجو: مرحله ۱ = شش کار اصلی (و با تایپ، ترکیب‌ها مثل «فروش › سکه» و کالاها)، مرحله ۲ = انواع همان کار، مرحله ۳ = کالاهای طلای ساخته */
function dkList(){const a=sv.qa,q=nzName(toEn(clean(a.q||'')));
  const chip=(act,data,ico,t,cls)=>`<button class="dkc${cls?' '+cls:''}" data-act="${act}"${Object.entries(data).map(([k,v])=>` data-${k}="${esc(v)}"`).join('')}><i>${ic(ico)}</i><span>${t}</span></button>`;
  if(!a.d){if(!q)return `<div class="dkg six">${DK.map(([k,t,i])=>chip('dkD',{d:k},i,t,'k-'+k)).join('')}</div>`;
    const R=[];DK.forEach(([d,t,i])=>{if(nzName(t).includes(q))R.push(cbRow('dkD',{d},ic(i),t,'تشخیص','','dkr'));(DKS[d]||[]).forEach(([s,st,si])=>{if(nzName(st+' '+t).includes(q)||nzName(st).includes(q))R.push(cbRow('dkGo',{d,s},ic(si),t+' › '+st,'','','dkr'))})});
    goodsList().filter(k=>nzName(k).includes(q)).slice(0,4).forEach(k=>R.push(cbRow('dkGo',{d:'sell',s:'gold',k},ic('ring'),'فروش › '+esc(k),'طلای ساخته','','gd')));
    return R.length?`<div class="bzsug cbl">${R.slice(0,10).join('')}</div>`:'<div class="eh" style="padding:8px">چیزی پیدا نشد</div>'}
  if(a.s==='gold'){const A=goodsList().filter(k=>!q||nzName(k).includes(q)).sort((x,y)=>(q?(nzName(y).startsWith(q)-nzName(x).startsWith(q)):0)||(svUsed[y]||0)-(svUsed[x]||0)).slice(0,q?6:8);
    const rows=A.map(k=>cbRow('qaK',{k},ic('ring'),esc(k),'با اجرت و سود'+(svUsed[k]?' · '+toFa(svUsed[k])+' بار فروخته شده':''),'','gd'));
    if(q&&!A.some(k=>nzName(k)===q)&&!/^\d+$/.test(q))rows.push(cbRow('qaK',{k:clean(a.q)},ic('plus'),'کالای تازه «'+esc(clean(a.q))+'»','به فهرست کالاها اضافه می‌شود','','nw'));
    return rows.length?`<div class="bzsug cbl">${rows.join('')}</div>`:''}
  const S=(DKS[a.d]||[]).filter(([s,t])=>!q||nzName(t).includes(q));
  return `<div class="dkg">${S.map(([s,t,i])=>chip('dkS',{s},i,t,'s-'+s)).join('')}</div>`}
const dkRateOk=()=>{if(sv.rate)return true;toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true);const m=$('svM');if(m)m.focus();return false};
ACT.dkD=d=>{qaRead();const a=sv.qa,k=d.d||'';a.d=k;a.s='';a.q='';
  if(k==='swap'||k==='ret'){if(!dkRateOk()){a.d='';svKeep();qaRe();return}a.d='';xrStart(xrNew('buy','gold',{cat:k==='swap'?'تعویض':'مرجوعی',ay:k==='ret'?750:735,fl:'gold',fd:k}));return}
  svKeep();qaRe(k?'qK':'qK')};
ACT.dkS0=()=>{qaRead();sv.qa.s='';sv.qa.q='';svKeep();qaRe('qK')};
ACT.dkGo=d=>{qaRead();sv.qa.d=d.d;sv.qa.s='';ACT.dkS({s:d.s,k:d.k})};
ACT.dkS=d=>{qaRead();const a=sv.qa,D=a.d,s=d.s;a.q='';
  if(D==='sell'){
    if(s==='ab'){a.k='آبشده';a.ab=1;a.ay=+ls.get('m_abay',0)||750;a.pp=ls.get('m_abpp',0.7);a.ajP='';a.ajT='';a.lab='';a.ang='';a.i=null;svKeep();qaRe('qW');return}
    if(s==='gold'){if(d.k){ACT.qaK({k:d.k});return}a.s='gold';svKeep();qaRe('qK');return}
    if(s==='misc'){ACT.qaK({k:'متفرقه'});return}}
  if(s==='coin'||s==='fx'){const t=D==='sell'||D==='buy'?D:D==='in'?'in':'out';xrStart(xrNew(t,s==='coin'?COINS()[0]:FXS()[0],{fl:s,fd:D}));return}
  if(s==='ab'||s==='misc'){if((D==='buy')&&!dkRateOk())return;const t=D==='buy'?'buy':D==='in'?'in':'out';xrStart(xrNew(t,'gold',{cat:s==='ab'?'آبشده':'متفرقه',ay:s==='ab'?750:(t==='buy'?735:750),fl:'gold',fd:D}));return}
  if(D==='in'||D==='out'){if(s==='cust'&&!svCu()){toast('اول مشتری سند را انتخاب کنید',true);return}pyStart(pyNew(s,{dir:D,fl:1}));return}};
/* عکس سکه (یا هر جنس) در ردیف: در IndexedDB مثل رسیدها؛ کلید روی ردیف (img) */
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||t.id!=='xrF'||!sv||!sv.qa.x)return;const f=t.files&&t.files[0];t.value='';if(!f)return;
  try{const d=await shrink(f),k=newImgKey('xr');if(await imgPut(k,d)){xrRead();sv.qa.x.img=k;svKeep();qaRe();toast('عکس ضمیمه شد')}else toast('حافظه پر است؛ عکس ذخیره نشد',true)}catch(e){toast('این عکس خوانده نشد',true)}});
async function xrImgPaint(){const x=sv&&sv.qa&&sv.qa.x,el=$('xrFi');if(!x||!x.img||!el)return;const v=await imgGet(x.img);if(v&&el.isConnected)el.style.backgroundImage=`url(${v})`}

/* ============ v61: «تشخیص» — ورود ردیف سند مثل کیمیا: اول نوع کار، بعد نوع جنس، بعد پنجره مخصوص همان ============
   فروش: آبشده (وزن، عیار، وزن ۷۵۰، سود، کد آزمایشگاه، شماره انگ)، طلای ساخته (کالا با اجرت و سود)، متفرقه، سکه (تعداد + عکس)، دلار و ارز.
   خرید: متفرقه، آبشده، سکه، دلار و ارز — مانده سند به «پرداخت» می‌رود.  تعویض / مرجوعی: طلای مشتری با نرخ روز (یک ردیف خرید).
   دریافت / پرداخت: حواله (مشتری یا بانک)، کارتخوان، نقد، آبشده، متفرقه، سکه، دلار — طلا و جنس بدون مظنه، فقط حساب جنسی مشتری.
   حساب‌ها همان قبلی است: فروش/خرید فقط ریالی (جنس تحویل می‌شود)، دریافت/پرداخت جنسی یا ریالی. هیچ ساختار داده‌ای عوض نمی‌شود. */
/* v61.47: آیکون‌های مینیمال هم‌معنی هر کار (برچسب قیمت، کیف خرید، دو فلش، فلش به داخل، فلش به بیرون، برگشت)؛
   رنگ: هر چه از مغازه بیرون می‌رود (فروش، پرداخت) قرمز، هر چه وارد می‌شود (خرید، دریافت، تعویض، مرجوعی) آبی */
Object.assign(IC,{dSell:'<path d="M20.2 12.6l-7.6 7.6a1.6 1.6 0 01-2.2 0L4 13.8V4h9.8l6.4 6.4a1.6 1.6 0 010 2.2z"/><circle cx="8.6" cy="8.6" r="1.4"/>',
  dBuy:'<path d="M5.5 8h13l-1.1 11.2a1 1 0 01-1 .8H7.6a1 1 0 01-1-.8z"/><path d="M9 10V7a3 3 0 016 0v3"/>',
  dSwap:'<path d="M4 8h14M14 4l4 4-4 4"/><path d="M20 16H6M10 12l-4 4 4 4"/>',
  dIn:'<path d="M12 3v11M7.5 9.5L12 14l4.5-4.5"/><path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"/>',
  dOut:'<path d="M12 14V3M7.5 7.5L12 3l4.5 4.5"/><path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"/>',
  dRet:'<path d="M9 15l-5-5 5-5"/><path d="M4 10h10.5a5.5 5.5 0 010 11H11"/>'});
const DK=[['sell','فروش','dSell'],['buy','خرید','dBuy'],['swap','تعویض','dSwap'],['in','دریافت','dIn'],['out','پرداخت','dOut'],['ret','مرجوعی','dRet']];
/* v83.6 (خواسته صاحب اپ، ویدیوی کیمیا): «اضافه» و «کسر» دیگر کاشی جدا نیستند — مثل کیمیا داخل «دریافت» (اضافه) و «پرداخت» (کسر)
   کنار نقد و حواله؛ با زدن، فهرست علت (تخفیف، مانده قبلی، هزینه بانکی…). تخفیف‌ها هم همین‌طور سند می‌خورند (m:'adj' why:'تخفیف') */
/* v82.8 (خواسته صاحب اپ: «در سندهای اصلی کسر و اضافه در ردیف سند باشد؛ با زدن اضافه، مانده قبلی، تخفیف و … انتخاب شود»):
   «اضافه» = به نفع مشتری (مثل دریافت، مبلغ مثبت)، «کسر» = به ضرر مشتری (مثل پرداخت، منفی)؛ ردیف پرداخت m:'adj' با علت why از همان فهرست علت‌های سند بانکی (bdReasons) */
const dkRed=k=>dkBk()?(k==='out'||!!(BKX[k]&&BKX[k][1]>0)):k==='sell'||k==='out'||k==='sub';
/* v81.1 (خواسته صاحب اپ، مثل کیمیا): حساب‌های «هزینه» و «ذوب» تشخیص فقط «ورود» و «خروج» دارند (همان دریافت/پرداخت) و فهرستشان
   همه اقلام سند است: نقد، حواله، کارتخوان، تخفیف/کسر، آبشده، آبشده شرطی، متفرقه، سکه و ارز، و همه کالاهای تعریف‌شده (ورود/خروج طلا با وزن و عیار) */
const IOG=['هزینه','ذوب'];
const dkIO=()=>{const c=typeof sv!=='undefined'&&sv&&svCu();return !!(c&&IOG.includes(c.grp))};
const DKIO=[['in','ورود','dIn'],['out','خروج','dOut']];
/* v83.2 (خواسته صاحب اپ: «حساب‌های بانکی در قالب حساب‌های مشتری؛ به‌جای دریافت و پرداخت فقط واریز و برداشت»): حساب نوع «بانک» (CUTY).
   واریز = پول به این بانک آمد (مثل «پرداخت» به این حساب: بانک به ما بدهکار می‌شود، قرمز)؛ برداشت = پول از این بانک رفت (مثل «دریافت»).
   روش‌ها: نقد (از/به صندوق)، از/به حساب مشتری (cust)، از/به بانک دیگر (hav دوطرفه)، مانده قبلی */
const dkBk=()=>{const c=typeof sv!=='undefined'&&sv&&svCu();return !!(c&&c.grp==='بانک')};
const DKBK=[['out','واریز','dIn'],['in','برداشت','dOut'],['chq','در حساب','inv'],['pass','پاس شدن','check'],['vos','وصول','down']];
/* v83.4 (خواسته صاحب اپ، مثل کیمیا — ویدیو): واریز/برداشت › نقدی، چک، حواله (همه حساب‌ها با مانده)، کسر (زیر واریز) / اضافه (زیر برداشت) با علت.
   bkx k:'chk' = چک، k:'adj' = کسر/اضافه (اثرشان از جهت ردیف: واریز = موجودی بانک زیاد) */
/* v83.3 (خواسته صاحب اپ: «پاس شدن و غیره هم باشد، به غیر از خرید و فروش»): نوع‌های سند بانکی در حساب نوع بانک = ردیف m:'bkx' با k؛
   BKX: [عنوان، اثر روی موجودی بانک (+۱ زیاد، −۱ کم)، علت لازم؟] — موجودی بانک زیاد = مثل واریز (مبلغ منفی در حساب)، کم = مثل برداشت */
const BKX={chq:['در حساب',1,0],pass:['پاس شدن',-1,0],vos:['وصول',1,0],chk:['چک',0,0],adj:['',0,1]};
const bkxLab=p=>p.k==='adj'?(pAmt(p)<0||p.dir==='out'?'کسر':'اضافه'):(BKX[p.k]||['سند بانکی'])[0];
const DKA=()=>dkBk()?DKBK:dkIO()?DKIO:DK;
const DKS={sell:[['ab','آبشده','coin'],['gold','طلای ساخته','ring'],['misc','متفرقه','ring'],['coin','سکه','coin'],['fx','دلار و ارز','usd']],
  buy:[['misc','متفرقه','coin'],['ab','آبشده','coin'],['coin','سکه','coin'],['fx','دلار و ارز','usd']],
  in:[['cust','حواله به مشتری','swap'],['hav','حواله به بانک','bank'],['pos','کارتخوان','card'],['cash','نقد','cash'],['off','تخفیف','tag'],['ab','آبشده','coin'],['misc','متفرقه','coin'],['coin','سکه','coin'],['fx','دلار و ارز','usd']],
  out:[['cust','حواله از مشتری','swap'],['hav','حواله از بانک','bank'],['cash','نقد','cash'],['off','تخفیف','tag'],['ab','آبشده','coin'],['misc','متفرقه','coin'],['coin','سکه','coin'],['fx','دلار و ارز','usd']]};
const dkT=d=>(DKA().find(z=>z[0]===d)||DK.find(z=>z[0]===d)||[])[1]||'';
const dkST=(d,s)=>((DKS[d]||[]).find(z=>z[0]===s)||[])[1]||'';
const COINS=()=>Object.keys(XA).filter(k=>XA[k].k==='c'),FXS=()=>Object.keys(XA).filter(k=>XA[k].k==='f');
/* v61.2: تشخیص و نوع، هر دو فقط یک فیلد جستجو؛ با لمس، فهرست زیر همان فیلد باز می‌شود (مثل نام مشتری‌ها).
   موارد ثابت (کارهای اصلی، آبشده، متفرقه، پولی، سکه‌ها، ارزها، روش‌های پول) با نشان «ثابت» از کالاهای اضافه‌شده جدا دیده می‌شوند.
   کالای تازه با دسته: ساخته / سایر (پنجره اجرت و سود) یا سکه / ارز (جنس تازه در حساب جنسی، در cfg.xa ذخیره و به XA افزوده می‌شود). */
function xaSync(){const r=cfgRec();((r&&r.xa)||[]).forEach(o=>{if(o&&o.k&&!XA[o.k])XA[o.k]={t:o.t||o.k,s:o.s||o.k,u:o.u||(o.c==='f'?'واحد':'عدد'),k:o.c==='f'?'f':'c',x:1}})}
const gCat=k=>{const r=cfgRec();return (r&&r.gk&&r.gk[k])||'ساخته'};
function dkFixed(d){const R=[];const fx=(id,t,ico,sub,cls)=>R.push({id,t,ico,sub,cls:cls||''});
  if(d==='in'||d==='out'){fx('m:cust',d==='in'?'حواله به مشتری':'حواله از مشتری','swap','از حساب مشتری دیگر');fx('m:hav',d==='in'?'حواله به بانک':'حواله از بانک','bank',d==='in'?'به حساب‌های ما':'از حساب‌های ما');if(d==='in')fx('m:pos','کارتخوان','card','پوزهای مغازه');fx('m:cash','نقد','cash','پول نقد');fx('j:adj',d==='in'?'اضافه':'کسر','tag','تخفیف، مانده قبلی، هزینه بانکی، یارانه…')}
  fx('g:ab','آبشده','coin',d==='sell'?'وزن، عیار، انگ، سود':'وزن و عیار','gd');
  /* v61.62 (خواسته صاحب اپ): آبشده شرطی — عیارش هنوز درنیامده؛ با ۷۵۰ حساب می‌شود و عیار واقعی بعداً از «تنظیمات › آبشده شرطی» در همه سندها می‌نشیند */
  fx('g:abs','آبشده شرطی','coin','عیار درنیامده · فعلاً ۷۵۰ · انگ را بزنید','gd');fx('g:misc','متفرقه','coin',d==='sell'?'طلای دست‌دوم با اجرت و سود':'طلای دست‌دوم','gd');
  if(d==='sell'||d==='buy')fx('g:pz','سکه پارسیان','coin',d==='sell'?'تعداد، وزن، اجرت و سود':'تعداد، وزن و مظنه خرید','gd');
  if(d==='sell'||d==='buy')fx('g:pul','پولی','swap',d==='sell'?'طلا تحویل نمی‌شود · فروش فردایی':'طلا تحویل گرفته نمی‌شود','gd');
  /* v61.62 (خواسته صاحب اپ): قلک — دقیقاً مثل پولی (طلا تحویل نمی‌شود، مبلغ و مانده طلا در حساب)، فقط با عنوان قلک */
  if(d==='sell'||d==='buy')fx('g:qlk','قلک','coin',d==='sell'?'فروش قلک · طلا تحویل نمی‌شود':'خرید قلک · طلا تحویل گرفته نمی‌شود','gd');
  /* v61.60 (خواسته صاحب اپ): پولی کردن سکه و ارز — جنس تحویل نمی‌شود؛ نرخ می‌گیرد، مبلغ و مانده همان جنس در حساب می‌ماند */
  if(d==='sell'||d==='buy'){fx('p:c','پولی سکه','swap',d==='sell'?'سکه تحویل نمی‌شود · مبلغ و مانده سکه':'سکه تحویل گرفته نمی‌شود · مبلغ و مانده سکه','gd');fx('p:f','پولی ارز','usd',d==='sell'?'ارز تحویل نمی‌شود · مبلغ و مانده ارز':'ارز تحویل گرفته نمی‌شود · مبلغ و مانده ارز')}
  /* v61.60: مانده قبلی (افتتاح حساب) — تومان یا طلا؛ فروش/پرداخت = طلبکاریم، خرید/دریافت = بدهکاریم */
  /* v61.61 (خواسته صاحب اپ): مانده قبلی فقط در دریافت و پرداخت، و یک واحد: تومان و طلا با هم (دلار، سکه… هم اضافه می‌شود) */
  if(d==='in'||d==='out')fx('v:prev','مانده قبلی','clock',d==='out'?'تومان، طلا، دلار، سکه · طلبکاریم':'تومان، طلا، دلار، سکه · بدهکاریم');
  xaSync();COINS().forEach(k=>fx('a:'+k,XA[k].t,'coin',XA[k].x?'سکه':'سکه','gd'));FXS().forEach(k=>fx('a:'+k,XA[k].t,'usd','ارز'));return R}
function dkHTML(){const a=sv.qa,D=a.d&&(DKA().find(z=>z[0]===a.d)||DK.find(z=>z[0]===a.d));
  const sel=(t,ico,act,cls)=>`<div class="dksel${cls?' '+cls:''}"><span class="dki">${ic(ico)}</span><b>${t}</b><button class="itx" data-act="${act}" aria-label="برداشتن">×</button></div>`;
  let h='';/* v61.5: بدون سرتیتر «ردیف تازه»؛ فقط فیلدها */
  if(!D)return h+`<div class="dkf dkbox${a.q||dkOpen?' open':''}"><div class="fsearch sm">${ic('search')}<input id="qK" readonly value="${esc(a.q||'')}" placeholder="${dkBk()?'تشخیص: واریز یا برداشت':dkIO()?'تشخیص: ورود یا خروج':'تشخیص: فروش، خرید، تعویض، دریافت…'}" autocomplete="off" enterkeyhint="next"></div><div id="qKs">${dkList()}</div></div>`;
  /* v61.7: بالای نوار می‌نویسد چه عملیاتی است (بیرون از فیلد)، خود نوار فقط جستجوی کالا */
  dkOpen=false;return h+`<div class="dkf dkbox open">${stHead(D,'',0)}<div class="fsearch sm">${ic('search')}<input id="qK" readonly value="${esc(a.q||'')}" placeholder="${a.d==='sell'?'چه می‌فروشید؟ آبشده، النگو، نیم سکه، دلار…':a.d==='buy'?'چه می‌خرید؟ متفرقه، آبشده، سکه، دلار…':dkBk()?(a.d==='out'?'نقدی، چک، حواله، کسر…':'نقدی، چک، حواله، اضافه…'):'حواله، نقد، آبشده، سکه…'}" autocomplete="off" enterkeyhint="next"></div><div id="qKs">${dkList()}</div></div>`}
function dkList(){const a=sv.qa,q0=clean(a.q||''),q=nzName(toEn(q0)),hit=t=>!q||nzName(t).includes(q);
  /* v61.60: پولی سکه / پولی ارز — اول کدام سکه یا ارز */
  if(a.d&&a.pk){xaSync();const K=(a.pk==='c'?COINS():FXS()).filter(k=>hit(XA[k].t));return `<div class="bzsug cbl dkl"><button type="button" class="bzsr dkrw fix" data-act="dkPk0"><span class="av">${ic('back')}</span><span class="tx"><b>${a.pk==='c'?'پولی سکه':'پولی ارز'}</b><small>بازگشت به فهرست</small></span></button>${K.map(k=>`<button type="button" class="bzsr dkrw fix gd" data-act="dkPul" data-k="${esc(k)}"><span class="av">${ic(a.pk==='c'?'coin':'usd')}</span><span class="tx"><b>پولی ${esc(XA[k].t)}</b><small>نرخ هر ${esc(XA[k].u||'واحد')} · مبلغ به حساب</small></span></button>`).join('')||'<div class="eh" style="padding:8px">چیزی پیدا نشد</div>'}</div>`}
  const row=(act,data,ico,t,sub,cls)=>`<button type="button" class="bzsr dkrw${cls?' '+cls:''}" data-act="${act}"${Object.entries(data).map(([k,v])=>` data-${k}="${esc(v)}"`).join('')}><span class="av">${ic(ico)}</span><span class="tx"><b>${t}</b><small>${sub||''}</small></span></button>`;
  if(!a.d){/* v81.2 (خواسته صاحب اپ): دو ستون — فروش | خرید، پرداخت | دریافت، تعویض | مرجوعی؛ کاشی‌ها با حرکت پشت هم بالا می‌آیند */const ORD=dkBk()?['out','in','chq','pass','vos']:dkIO()?['in','out']:['sell','buy','out','in','swap','ret'],R=DKA().slice().sort((x,y)=>ORD.indexOf(x[0])-ORD.indexOf(y[0])).filter(([k,t])=>hit(t)).map(([k,t,i],n)=>row('dkD',{d:k},i,t,(dkBk()?{out:'نقدی، چک، حواله، کسر',in:'نقدی، چک، حواله، اضافه',chq:'چک به حساب گذاشته شد',pass:'چک ما از این حساب پاس شد',vos:'چک وصول شد و به حساب آمد'}:{sell:'آبشده، طلای ساخته، سکه، ارز',buy:'متفرقه، آبشده، سکه، ارز',swap:'طلای کهنه مشتری با نرخ روز',in:'حواله، نقد، طلا، سکه، ارز',out:'حواله، نقد، طلا، سکه، ارز',ret:'برگشت کالای فروخته'})[k],'top k-'+k+(dkRed(k)?' kr':' kb')).replace('class="bzsr','style="--i:'+n+'" class="bzsr'));
    return R.length?`<div class="bzsug cbl dkl dkgrid">${R.join('')}</div>`:'<div class="eh" style="padding:8px">چیزی پیدا نشد</div>'}
  const o=a.d==='out',BKL=[['m:cash','نقدی','cash',o?'از صندوق به این بانک':'از این بانک به صندوق'],['b:chk','چک','inv',o?'چک به این حساب':'چک از این حساب'],['m:cust','حواله','swap',o?'از هر حساب (مشتری، بانک، هزینه…)':'به هر حساب (مشتری، بانک، هزینه…)'],['b:adj',o?'کسر':'اضافه','tag','تخفیف، مانده قبلی، هزینه بانکی، یارانه…'],['v:prev','مانده قبلی','clock','افتتاح حساب']];
  const F=(dkBk()&&(a.d==='in'||a.d==='out')?BKL.map(([id,t,ico,sub])=>({id,t,ico,sub,cls:''})).filter(z=>hit(z.t+' '+z.sub)):dkFixed(a.d).filter(z=>hit(z.t+' '+z.sub))).map(z=>row('dkF',{id:z.id},z.ico,esc(z.t),esc(z.sub),'fix '+z.cls));
  let G=[];if(dkIO()&&(a.d==='in'||a.d==='out')){const L=goodsList().filter(k=>k!=='آبشده'&&k!=='سکه'&&hit(k)).sort((x,y)=>(svUsed[y]||0)-(svUsed[x]||0)).slice(0,q?12:10);
    G=L.map(k=>row('dkF',{id:'k:'+k},'ring',esc(k),(a.d==='in'?'ورود':'خروج')+' طلا · وزن و عیار','gd'))}
  if(a.d==='sell'){const L=goodsList().filter(k=>k!=='آبشده'&&k!=='سکه'&&k!=='سکه پارسیان'&&hit(k)).sort((x,y)=>(q?(nzName(y).startsWith(q)-nzName(x).startsWith(q)):0)||(svUsed[y]||0)-(svUsed[x]||0)).slice(0,q?8:6);
    G=L.map(k=>`<div class="dkg">${row('qaK',{k},'ring',esc(k),esc(gCat(k))+(svUsed[k]?'، '+toFa(svUsed[k])+' بار':''),'gd')}<button type="button" class="dkgm" data-act="gdMenu" data-k="${esc(k)}" aria-label="ویرایش یا حذف ${esc(k)}" aria-haspopup="menu">${ic('more')}</button></div>`)}
  const known=q&&(dkFixed(a.d).some(z=>nzName(z.t)===q)||goodsList().some(k=>nzName(k)===q));
  let N='';if(q&&!known&&!/^\d+$/.test(q)&&a.d!=='in'&&a.d!=='out'||q&&!known&&(a.d==='in'||a.d==='out')&&!/^\d+$/.test(q)){
    N=a.nc?`<div class="dkcat"><small>«${esc(q0)}» در کدام دسته؟</small><div class="gks">${(a.d==='sell'?['ساخته','سایر','سکه','ارز']:['سکه','ارز']).map(c=>`<button class="tch" data-act="dkNew" data-c="${c}">${c}</button>`).join('')}</div></div>`
      :row('dkNc',{},'plus','کالای تازه «'+esc(q0)+'»','ساختن کالا: نوع و مشخصات','nw')}
  const out=F.join('')+(G.length?`<div class="stsh">کالاهای اضافه‌شده</div>`+G.join(''):'')+N;
  return out?`<div class="bzsug cbl dkl">${out}</div>`:'<div class="eh" style="padding:8px">چیزی پیدا نشد</div>'}
/* v78.9 (خواسته صاحب اپ: «معرفی کالای جدید یک پنجره جدا باز کند»): پنجره «کالای تازه» — نام و نوع کالا؛ مشخصات بیشتر (فی، اجرت…) بعداً همین‌جا */
const GDT=[['ساخته','طلای ساخته','ring','وزن، عیار، اجرت و سود'],['سایر','غیر طلا','tag','فقط تعداد و مبلغ'],['سکه','سکه','coin','تعداد و نرخ هر سکه'],['ارز','ارز','usd','مقدار و نرخ هر واحد']];
let GN=null;
function gdNewHTML(){const T=GDT.filter(t=>GN.d==='sell'||t[0]==='سکه'||t[0]==='ارز');
  return `<div class="gdn"><div class="sh-h"><div><b>کالای تازه</b><small class="shsub">بعد از ساختن، همین حالا در سند انتخاب می‌شود</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="ef"><label for="gdnN">نام کالا</label><input id="gdnN" value="${esc(GN.k)}" autocomplete="off" enterkeyhint="done" placeholder="مثلاً انگشتر رولکس"></div>
  <div class="gdnl">نوع کالا</div><div class="gdnt">${T.map(([c,t,i,s])=>`<button type="button" class="gdnc${GN.c===c?' on':''}" data-act="gdnPick" data-c="${c}" aria-pressed="${GN.c===c}"><span class="gdni">${ic(i)}</span><b>${t}</b><small>${s}</small></button>`).join('')}</div>
  <button class="xgo gdngo" data-act="gdnSave"${GN.c?'':' disabled'}>${ic('check')} ساختن کالا</button></div>`}
ACT.dkNc=()=>{qaRead();const a=sv.qa;GN={k:clean(a.q||''),c:'',d:a.d};sheet(gdNewHTML());const n=$('gdnN');if(n)n.oninput=()=>{GN.k=n.value}};
ACT.gdnPick=d=>{GN.c=d.c;document.querySelectorAll('#sheet .gdnc').forEach(b=>{const on=b.dataset.c===d.c;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});const g=document.querySelector('#sheet .gdngo');if(g)g.disabled=false};
ACT.gdnSave=()=>{const n=$('gdnN'),k=clean(n?n.value:GN.k);if(!k){toast('نام کالا را بنویسید',true);n&&n.focus();return}if(!GN.c){toast('نوع کالا را انتخاب کنید',true);return}
  if(goodsList().some(x=>nzName(x)===nzName(k))||(XA[k])){toast('«'+k+'» از قبل در فهرست هست',true);return}
  const c=GN.c;GN=null;closeSheet();ACT.dkNew({c,k})};
ACT.dkNew=d=>{qaRead();const a=sv.qa,k=clean(d.k||a.q||''),c=d.c;if(d.k)a.q=k;if(!k)return;a.nc=0;const r=cfgRec(1);
  if(c==='سکه'||c==='ارز'){r.xa=(r.xa||[]).filter(o=>o.k!==k).concat([{k,t:k,s:k,u:c==='ارز'?'واحد':'عدد',c:c==='ارز'?'f':'c'}]);saveCu();xaSync();toast('«'+k+'» به '+c+'‌ها اضافه شد');ACT.dkF({id:'a:'+k});return}
  r.gk={...(r.gk||{}),[k]:c};addGoods(k);saveCu();toast('«'+k+'» در دسته '+c+' اضافه شد');ACT.qaK({k})};
/* v61.60 (خواسته صاحب اپ): کالاهای اضافه‌شده در همان فهرست ویرایش یا حذف می‌شوند (دکمه ⋯ کنار هر ردیف).
   سندهای ثبت‌شده نام قبلی را نگه می‌دارند؛ فقط فهرست انتخاب عوض می‌شود. */
ACT.gdMenu=(d,e)=>{const k=d.k,b=e&&e.target.closest('[data-act]');if(!k||!b)return;const c=gCat(k);
  popMenu(b,[['gdRen',ic('edit'),'ویرایش نام',{k}],['gdCat',ic('ring'),'دسته: '+(c==='ساخته'?'سایر':'ساخته'),{k}],['gdDel',ic('trash'),'حذف از فهرست',{k},1]])};
ACT.gdRen=d=>{const k=d.k;sheet(`<div class="sh-h"><b>ویرایش نام کالا</b></div><div class="ef"><input id="gdN" value="${esc(k)}" autocomplete="off" enterkeyhint="done"></div><div class="row"><button class="btn sec" data-act="close">انصراف</button><button class="btn" data-act="gdRenOk" data-k="${esc(k)}">ذخیره</button></div>`);
  const I=$('gdN');if(I){sheetFocus(I);I.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();ACT.gdRenOk({k})}}}};
ACT.gdRenOk=d=>{const k=d.k,I=$('gdN'),n=clean((I&&I.value)||'');if(!n){toast('نام کالا را بنویسید',true);return}if(n===k){closeSheet();return}
  if(goodsList().some(x=>nzName(x)===nzName(n))){toast('«'+n+'» در فهرست هست',true);return}
  const r=cfgRec(1),c=gCat(k);r.goods=(r.goods||[]).filter(x=>x!==k);r.goods.unshift(n);if(GOODS0.includes(k))r.ghide=[...new Set([...(r.ghide||[]),k])];
  r.gk={...(r.gk||{})};delete r.gk[k];if(c!=='ساخته')r.gk[n]=c;if(svUsed[k]){svUsed[n]=svUsed[k];delete svUsed[k]}
  saveCu();closeSheet();toast('نام کالا عوض شد');gdRe()};
ACT.gdCat=d=>{const k=d.k,r=cfgRec(1);r.gk={...(r.gk||{}),[k]:gCat(k)==='ساخته'?'سایر':'ساخته'};saveCu();toast('«'+k+'» در دسته '+r.gk[k]);gdRe()};
ACT.gdDel=d=>{const k=d.k;askConfirm('«'+k+'» از فهرست کالاها حذف شود؟ سندهای قبلی تغییر نمی‌کنند.','حذف',()=>{const r=cfgRec(1);r.goods=(r.goods||[]).filter(x=>x!==k);
  if(GOODS0.includes(k))r.ghide=[...new Set([...(r.ghide||[]),k])];if(r.gk&&r.gk[k]){r.gk={...r.gk};delete r.gk[k]}saveCu();toast('«'+k+'» حذف شد');gdRe()})};
function gdRe(){const r=$('qKs');if(r&&sv&&sv.qa)r.innerHTML=dkList()}
ACT.dkPk0=()=>{sv.qa.pk='';svKeep();const r=$('qKs');if(r)r.innerHTML=dkList()};
ACT.dkPul=d=>{const a=sv.qa,D=a.d,k=d.k;if(!k||!XA[k])return;a.pk='';a.q='';xrStart(xrNew(D,k,{pul:true,fl:'one',fd:D}))};
/* انتخاب از موارد ثابت */
ACT.dkF=d=>{qaRead();const a=sv.qa,D=a.d,[ty,v]=String(d.id).split(':');a.q='';a.nc=0;const PO=D==='sell'||D==='out'?'out':'in';
  if(ty==='k'){xrStart(xrNew(D,'gold',{cat:String(d.id).slice(2),ay:750,fl:'gold',fd:D}));return}
  if(ty==='v'&&v==='prev'){pvStart({dir:D==='out'?'out':'in'});return}
  if(ty==='m'&&v==='prev'){pyStart(pyNew('prev',{dir:PO,fl:1}));return}
  if(ty==='g'&&v==='prev'){xrStart(xrNew(PO,'gold',{cat:'مانده قبلی',pul:true,ay:750,fl:'gold',fd:D}));return}
  if(ty==='p'){a.pk=v;svKeep();const r=$('qKs');if(r)r.innerHTML=dkList();return}
  if(ty==='j'){pyStart(pyNew('adj',{dir:D==='out'?'out':'in',fl:1}));return}
  if(ty==='b'){pyStart(pyNew('bkx',{k:v,dir:D==='out'?'out':'in',fl:1}));return}
  if(ty==='m'){if(v==='cust'&&!svCu()){toast('اول مشتری سند را انتخاب کنید',true);return}pyStart(pyNew(v,{dir:D,fl:1}));return}
  if(ty==='a'){const t=D==='sell'||D==='buy'?D:D;xrStart(xrNew(t,v,{fl:'one',fd:D}));return}
  if(ty==='g'){
    if(v==='abs'){if(D==='sell'){a.k='آبشده';a.ab=1;a.sh=1;a.ay=750;a.pp=PROFIT_AB;a.mz='';a.mzk='';a.ajP='';a.ajT='';a.lab='';a.ang='';a.i=null;svKeep();qaRe('qW');return}
      if(D==='buy'&&!dkRateOk())return;xrStart(xrNew(D==='swap'||D==='ret'?'buy':D,'gold',{cat:'آبشده',sh:1,ay:750,fl:'gold',fd:D}));return}
    if(v==='ab'&&D==='sell'){a.k='آبشده';a.ab=1;a.ay=750;a.pp=PROFIT_AB;a.mz='';a.mzk='';a.ajP='';a.ajT='';a.lab='';a.ang='';a.i=null;svKeep();qaRe('qW');return}
    if(v==='misc'&&D==='sell'){ACT.qaK({k:'متفرقه'});return}
    if(v==='pz'){if(D==='sell'){ACT.qaK({k:'سکه پارسیان'});Object.assign(sv.qa,{pz:1,cnt:'',ajP:'',ajT:''});svKeep();qaRe();return}
      if(!dkRateOk())return;xrStart(xrNew(D,'gold',{cat:'پارسیان',pz:1,cnt:'',ay:D==='buy'?735:750,fl:'gold',fd:D}))/* v61.60: خرید پارسیان عیار ۷۳۵، مظنه خرید */;return}
    if(v==='pul'){if(!dkRateOk())return;xrStart(xrNew(D,'gold',{pul:true,ay:750,fl:'gold',fd:D,cat:''}));return}
    if(v==='qlk'){if(!dkRateOk())return;xrStart(xrNew(D,'gold',{pul:true,ay:750,fl:'gold',fd:D,cat:'قلک'}));return}
    if(D==='buy'&&!dkRateOk())return;xrStart(xrNew(D,'gold',{cat:v==='ab'?'آبشده':'متفرقه',ay:v==='ab'?750:(D==='buy'?735:750),fl:'gold',fd:D}));return}};
const dkRateOk=()=>{if(sv.rate)return true;toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true);const m=$('svM');if(m)m.focus();return false};
ACT.dkD=d=>{qaRead();const a=sv.qa,k=d.d||'';a.d=k;a.s='';a.q='';a.pk='';
  if(dkBk()&&BKX[k]&&BKX[k][1]){pyStart(pyNew('bkx',{k,dir:BKX[k][1]>0?'out':'in',fl:1}));return}
  if(k==='add'||k==='sub'){pyStart(pyNew('adj',{dir:k==='add'?'in':'out',fl:1}));return}
  if(k==='swap'||k==='ret'){if(!dkRateOk()){a.d='';svKeep();qaRe();return}a.d='';xrStart(xrNew('buy','gold',{cat:k==='swap'?'تعویض':'مرجوعی',ay:k==='ret'?750:740,fl:'gold',fd:k}));return}
  svKeep();qaRe('qK')};
/* عکس سکه (یا هر جنس) در ردیف: در IndexedDB مثل رسیدها؛ کلید روی ردیف (img) */
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||t.id!=='xrF'||!sv||!sv.qa.x)return;const f=t.files&&t.files[0];t.value='';if(!f)return;
  try{const d=await shrink(f),k=newImgKey('xr');if(await imgPut(k,d)){xrRead();sv.qa.x.img=k;svKeep();qaRe();toast('عکس ضمیمه شد')}else toast('حافظه پر است؛ عکس ذخیره نشد',true)}catch(e){toast('این عکس خوانده نشد',true)}});
async function xrImgPaint(){const x=sv&&sv.qa&&sv.qa.x,el=$('xrFi');if(!x||!x.img||!el)return;const v=await imgGet(x.img);if(v&&el.isConnected)el.style.backgroundImage=`url(${v})`;else if(el.isConnected)el.classList.add('miss')}

/* v61.46: فهرست تشخیص با بستن کیبورد بسته نمی‌شود (خواسته صاحب اپ: «ثابت بماند»)؛ فقط با زدن بیرون از کادر تشخیص
   (وقتی چیزی تایپ نشده) یا انتخاب یک نوع بسته می‌شود */
let dkOpen=false;
/* v61.57: باز کردن فهرست تشخیص بدون کیبورد */
function dkShow(){const B=document.querySelector('.dkbox');if(!B)return;dkOpen=true;B.classList.add('open');const K=$('qK');if(K)K.readOnly=false;try{B.scrollIntoView({block:'nearest',behavior:RM()?'auto':'smooth'})}catch(_){}}
/* v61.59 (خواسته صاحب اپ): وقتی فهرست باز است، زدن روی جستجو = کیبورد؛ وقتی بسته است، زدن = فقط باز شدن فهرست (بدون کیبورد).
   readonly یعنی «فهرست بسته»: لمس فوکوس نمی‌دهد و open() اجرا می‌شود؛ بعد از باز شدن، زدن بعدی فوکوس عادی = کیبورد */
function kb2(el,isOpen,open){if(!el||el._kb2)return;el._kb2=1;const sync=()=>{el.readOnly=!isOpen()};sync();let x0=0,y0=0;
  /* v70.2: touchstart دیگر جلوگیری نمی‌شود — شروع کشیدن روی این فیلد صفحه را اسکرول نمی‌کرد (آیفون). readonly خودش کیبورد را باز نمی‌کند */
  el.addEventListener('mousedown',e=>{if(el.readOnly)e.preventDefault()});
  el.addEventListener('pointerdown',e=>{x0=e.clientX;y0=e.clientY});
  el.addEventListener('pointerup',e=>{if(!el.readOnly||Math.abs(e.clientX-x0)>10||Math.abs(e.clientY-y0)>10)return;open();el.readOnly=false});
  el.addEventListener('blur',sync);
  el.addEventListener('keydown',e=>{if(el.readOnly&&e.key&&e.key.length===1){el.readOnly=false}})}
document.addEventListener('pointerdown',e=>{if(!dkOpen||cur!=='sell'||!sv||!sv.qa||sv.qa.d||sv.qa.q)return;const t=e.target;if(t.closest&&(t.closest('.dkbox')||t.closest('#ov')))return;
  dkOpen=false;const B=document.querySelector('.dkbox');if(B)B.classList.remove('open');const K=$('qK');if(K){if(document.activeElement===K)K.blur();K.readOnly=true}},true);

/* v61.95 (خواسته صاحب اپ): وقتی کیبورد در پنجره ردیف سند باز است، لمس دکمه‌های همان پنجره (بعدی، پله‌ها، برگشت، افزودن، نوع کالا…)
   فوکوس را از فیلد نمی‌گیرد تا کیبورد پایین نرود؛ خود کلیک مثل همیشه اجرا می‌شود */
['pointerdown','mousedown'].forEach(ev=>document.addEventListener(ev,e=>{const q=$('qa'),t=e.target;if(!q||!t||!t.closest||!q.contains(t))return;const b=t.closest('button,[role=button],.stp');if(!b||t.closest('input,textarea,label,select'))return;
  const a=document.activeElement;if(a&&q.contains(a)&&/^(INPUT|TEXTAREA)$/.test(a.tagName)&&!a.readOnly)e.preventDefault()},true));

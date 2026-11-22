/* ============ v90.8 صفحه «تنظیمات فاکتور» ============
   خواسته صاحب اپ: همه‌چیزِ فاکتور از داخل برنامه تنظیم شود و هر نوع فاکتور (فروش طلا، آبشده، خرید، رسید) تنظیم خودش را داشته باشد.
   صفحه کامل `invset` (مثل «کاربران» از کشوی تنظیمات می‌لغزد؛ از منوی یک سند هم باز می‌شود و آن‌وقت پیش‌نمایش همان سند است):
   بالای صفحه قالب‌ها و «پیش‌نمایش زنده» ثابت می‌مانند و پایینش بخش‌ها (کاغذ، سربرگ، مشتری، ستون‌ها، ردیف‌ها، مانده حساب، پانویس) عوض می‌شوند؛ هر تغییر همان لحظه
   در پیش‌نمایش دیده می‌شود. پیش‌نمایش همان invDoc واقعی است (در iframe کوچک‌شده؛ دو iframe که جایشان عوض می‌شود تا چشمک نزند).
   تا «ذخیره» زده نشود چیزی عوض نمی‌شود (IS.W نسخه کاری است)؛ ذخیره فقط فرق با پیش‌فرض را در cfg.inv می‌نویسد و با بقیه گوشی‌ها همگام می‌شود. فقط مدیر. */
let IS=null;
const IVSEC=[['paper','کاغذ و PDF'],['head','سربرگ'],['cust','مشتری و نرخ'],['cols','ستون‌ها'],['rows','ردیف‌ها'],['acc','مانده حساب'],['foot','پانویس']];
const IVTTL=['فاکتور فروش','فاکتور خرید','فاکتور آبشده','فاکتور طلا','پیش فاکتور','رسید دریافت','رسید پرداخت','صورت حساب'];
const ivSig=()=>JSON.stringify([IS.W,IS.shop]),ivDirty=()=>!!IS&&ivSig()!==IS.sig0;
function ivOpen(o){o=o||{};const W={};INVP.forEach(([k])=>{W[k]=invCfg(k)});W.stm=stmCfg();const s=(cfgRec()||{}).shop||{};
  IS={p:o.p||'sale',W,shop:{nm:s.nm||'',ad:s.ad||'',tel:s.tel||'',ig:s.ig||''},sec:'paper',from:o.from||'me',doc:o.doc||null,smp:{}};IS.sig0=ivSig()}
/* سندی که پیش‌نمایش می‌شود: همان سندی که صفحه از آن باز شده (فقط در قالب خودش)، وگرنه سند نمونه آن قالب */
function ivDoc(){if(IS.p==='stm')return IS.smp.stm||(IS.smp.stm=stmSample());const d=IS.doc;if(d&&d.p===IS.p){const c=custs.find(x=>String(x.id)===String(d.cu)),t=c&&(c.txs||[]).find(x=>String(x.id)===String(d.tx)&&!x.del);if(c&&t)return{c,t,real:1}}
  return IS.smp[IS.p]||(IS.smp[IS.p]=invSample(IS.p))}
/* ---- تکه‌های فرم ---- */
const ivRow=(t,sub,ctl,cls)=>`<div class="ivr${cls?' '+cls:''}"><span class="tx"><b>${t}</b>${sub?`<small>${sub}</small>`:''}</span>${ctl}</div>`;
const ivSw=(k,t,sub)=>{const on=!!IS.W[IS.p][k];return ivRow(t,sub,`<button type="button" class="ivsw${on?' on':''}" role="switch" aria-checked="${on}" aria-label="${esc(t)}" data-act="ivT" data-k="${k}"></button>`)};
const ivSeg=(k,O)=>`<div class="ivg" role="radiogroup">${O.map(([v,l])=>`<button type="button" role="radio" aria-checked="${String(IS.W[IS.p][k])===String(v)}" class="${String(IS.W[IS.p][k])===String(v)?'on':''}" data-act="ivV" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
const ivPick=(k,t,sub,O)=>ivRow(t,sub,ivSeg(k,O),'col');
const AYN=[['a','خودکار'],['y','همیشه'],['n','هرگز']];
const IVCH={w:'وزن کالا، تعداد سکه و ارز',ay:'عیار طلا',w7:'وزن بر پایه ۷۵۰ (برای طلای متفرقه و آبشده)',lab:'نام آزمایشگاه (ری‌گیری)',ang:'شماره انگ',rt:'مظنه یا فی ردیف؛ خودکار = فقط وقتی با نرخ بالای برگه فرق دارد',gv:'مبلغ خود طلا، پیش از اجرت و سود',aj:'اجرت ساخت',pp:'سود فروشنده',tx:'مالیات ارزش افزوده'};
/* v99.2 → v99.3 «تنظیم جای چاپ روی کاغذ»: چهار حاشیه برگه چاپ‌شده را می‌نویسد، «وسط‌چین کن» اندازه و جابه‌جایی را حساب می‌کند (invCalFit در 15zx).
   v99.3: هر راه چاپ تنظیم خودش را دارد (IVPL: اپ اندروید / آیفون / کامپیوتر؛ کلیدهای psk؟/psx؟/psy؟) و فقط هنگام چاپ با همان دستگاه اعمال می‌شود (prCal)؛
   پیش‌نمایش و فایل PDF دست نمی‌خورد. v99.4: «عرض چاپ» و «ارتفاع چاپ» جدا (psw؟/psh؟ روی اندازه مشترک psk؟ می‌نشینند؛ نمایش = جمع). تا دستگاه انتخاب نشود خانه‌ها نمی‌آیند (صاحب اپ با آیفون تنظیم می‌کند ولی مغازه با اندروید چاپ می‌گیرد). */
const IVPL=[['a','اپ اندروید'],['i','آیفون'],['w','کامپیوتر']],ivPlN=p=>(IVPL.find(x=>x[0]===p)||[,''])[1];
function ivCalPl(S){if(IS.calPl==null){const on=p=>S['psk'+p]!==100||S['psx'+p]||S['psy'+p],me=prPlat();IS.calPl=on(me)?me:(IVPL.find(x=>on(x[0]))||[''])[0]}return IS.calPl}
function ivCalHTML(S){const P=ivCalPl(S),C=IS.cal||{},num=(id,t,v)=>`<label class="ivcalf"><small>${t}</small><span><input id="${id}" class="ltr" inputmode="decimal" autocomplete="off" placeholder="۰" value="${esc(v==null?'':String(v))}"><i>م‌م</i></span></label>`,
    K=P&&S['psk'+P],X=P&&S['psx'+P],Y=P&&S['psy'+P],EW=P&&(S['psw'+P]||0),EH=P&&(S['psh'+P]||0),RT=P&&(S['psr'+P]||0),on=P&&(K!==100||X||Y||EW||EH||RT),
    mm=v=>toFa(String(Math.abs(Math.round(v*10)/10))),st=(k,d,tx)=>`<div class="ivst"><button type="button" data-act="ivN" data-k="${k}" data-d="${-d}" aria-label="کمتر">−</button><b>${tx}</b><button type="button" data-act="ivN" data-k="${k}" data-d="${d}" aria-label="بیشتر">+</button></div>`,
    /* v99.7 (صاحب اپ: «می‌خواهم درصد را خودم بنویسم، مثلاً ۱۰۱٫۳») عرض و ارتفاع: عدد وسط دکمه‌ها خانهٔ نوشتنی است (data-k کلید، data-b پایه که از عدد نوشته‌شده کم می‌شود) */
    sti=(k,d,v,b)=>`<div class="ivst"><button type="button" data-act="ivN" data-k="${k}" data-d="${-d}" aria-label="کمتر">−</button><label class="ivsti"><input class="ltr" inputmode="decimal" autocomplete="off" data-k="${k}" data-b="${b}" value="${toFa(String(Math.round(v*10)/10))}"><small>٪</small></label><button type="button" data-act="ivN" data-k="${k}" data-d="${d}" aria-label="بیشتر">+</button></div>`,
    /* v100.0 (صاحب اپ: «جابه‌جایی افقی و عمودی هم باید بشود عدد داد»): خانهٔ نوشتنی برای اندازهٔ جابه‌جایی/چرخش + دکمهٔ جهت کنارش (ACT.ivSgn) */
    sts=(k,d,v,pos,neg,u,hi)=>{const sg=v<0?-1:v>0?1:((IS.sg||{})[k]||1);return `<div class="ivst ivsts"><button type="button" data-act="ivN" data-k="${k}" data-d="${-d}" aria-label="کمتر">−</button><label class="ivsti"><input class="ltr" inputmode="decimal" autocomplete="off" data-k="${k}" data-m="s" data-hi="${hi}" value="${toFa(String(Math.abs(Math.round(v*10)/10)))}"><small>${u}</small></label><button type="button" class="ivsgn" data-act="ivSgn" data-k="${k}" data-v="${sg}">${sg>0?pos:neg}</button><button type="button" data-act="ivN" data-k="${k}" data-d="${d}" aria-label="بیشتر">+</button></div>`},
    seg=`<div class="ivg ivcalp" role="radiogroup">${IVPL.map(([v,l])=>`<button type="button" role="radio" aria-checked="${P===v}" class="${P===v?'on':''}" data-act="ivCalP" data-v="${v}">${l}</button>`).join('')}</div>`,
    hd=`<div class="ivcalh"><b>تنظیم جای چاپ روی کاغذ</b><small>وقتی چاپ وسط کاغذ نمی‌افتد یا یک طرفش جای خالی زیاد دارد</small></div><div class="ivcalq"><b>فاکتورها با چه دستگاهی چاپ می‌شوند؟</b>${seg}</div>`;
  if(!P)return `<div class="ivcalw">${hd}<div class="ivnote">اول دستگاهی را که در مغازه با آن چاپ می‌گیرید انتخاب کنید. هر دستگاه تنظیم خودش را دارد و روی بقیه اثر نمی‌گذارد.</div></div>`;
  return `<div class="ivcalw">${hd}
  <div class="ivnote">سیستم چاپ برگه را کمی کوچک می‌کند و به یک گوشه می‌چسباند. یک فاکتور با ${esc(ivPlN(P))} چاپ کنید، برگه را رو به خودتان بگیرید و با خط‌کش فاصلهٔ <b>خط بیرونی قاب تا لبهٔ کاغذ</b> را از چهار طرف به میلی‌متر بنویسید.</div>
  ${on?`<div class="ivnote ivcalon">${ic('info')} برای ${esc(ivPlN(P))} الان تنظیم دارد. فقط عددهای برگه‌ای را بنویسید که <b>بعد از این تنظیم</b> چاپ شده؛ برای شروع از اول، پایین «برگرداندن به حالت اول» را بزنید.</div>`:''}
  <div class="ivcalg">${num('ivcT','بالا',C.t)}${num('ivcB','پایین',C.b)}${num('ivcR','راست',C.r)}${num('ivcL','چپ',C.l)}</div>
  <button type="button" class="ivcalgo" data-act="ivCal">${ic('check')}<span>وسط‌چین کن</span></button>
  ${IS.calMsg?`<div class="ivcalm${IS.calErr?' bad':''}">${IS.calMsg}</div>`:''}
  ${ivRow('جابه‌جایی افقی','جهت با دکمهٔ آبی',sts('psx'+P,.5,X,'راست','چپ','م‌م',25))}
  ${ivRow('جابه‌جایی عمودی','',sts('psy'+P,.5,Y,'پایین','بالا','م‌م',25))}
  ${ivRow('عرض چاپ','چپ و راست قاب تا لبهٔ کاغذ',sti('psw'+P,.5,K+EW,K))}
  ${ivRow('ارتفاع چاپ','بالا و پایین قاب تا لبهٔ کاغذ',sti('psh'+P,.5,K+EH,K))}
  ${ivRow('صاف کردن خط‌ها','وقتی قاب کج چاپ می‌شود',sts('psr'+P,.1,RT,'ساعت‌گرد','پادساعت‌گرد','درجه',3))}
  ${(()=>{const A4=S.paper==='a4',W=A4?297:210,H=S.paper==='a5'?148:S.paper==='b14'?140:210,c=prCalS(S,W,H,P);return c&&c.cl?`<div class="ivnote ivcalon">${ic('info')} با این عددها قاب از لبهٔ کاغذ بیرون می‌زد؛ موقع چاپ خودکار محدود می‌شود (جابه‌جایی افقی حداکثر ${toFa(String(c.bx))} و عمودی ${toFa(String(c.by))} میلی‌متر). اندازه یا جابه‌جایی را کمتر کنید.</div>`:''})()}
  ${Math.abs(EW-EH)>=3?`<div class="ivnote ivcalon">${ic('info')} عرض و ارتفاع ${toFa(String(Math.round(Math.abs(EW-EH)*10)/10))}٪ با هم فرق دارند؛ نوشته‌ها کمی کشیده چاپ می‌شوند.</div>`:''}
  ${S.paper==='b14'?`<div class="ivnote ivcalon">${ic('info')} کاغذ فاکتور الان «۲۱ × ۱۴ سانت» است. اگر کاغذ شما A5 است (۲۱ × ۱۴٫۸)، بالا «A5 افقی» را انتخاب کنید: خود برگه ۸ میلی‌متر بلندتر می‌شود و برای پر کردن بالا و پایین لازم نیست نوشته‌ها کشیده شوند.</div>`:''}
  ${on?`<button type="button" class="ivcal0" data-act="ivCal0">${ic('undo')}<span>برگرداندن جای چاپ ${esc(ivPlN(P))} به حالت اول</span></button>`:''}
  <div class="ivnote">این تنظیم فقط هنگام چاپ با ${esc(ivPlN(P))} اعمال می‌شود؛ پیش‌نمایش بالا${P==='i'?' دست نمی‌خورد، ولی روی آیفون چاپ از خود فایل PDF است و فایلی که از آیفون می‌فرستید هم همین‌قدر جابه‌جا می‌شود':' و فایل PDFی که برای مشتری می‌فرستید دست نمی‌خورد'}. برنامه نمی‌تواند از جایی که چاپگر چاپ نمی‌کند بیرون بزند؛ اگر چاپگر یک نوار از کنار کاغذ را چاپ نمی‌کند، حاشیه از آن کمتر نمی‌شود.</div></div>`}
ACT.ivCalP=d=>{if(!IS||IS.p==='stm')return;IS.calPl=d.v;IS.cal={};IS.calMsg='';IS.calErr=0;ivRe({noPrev:1})};
ACT.ivCal=()=>{if(!IS||IS.p==='stm')return;const P=IS.calPl;if(!P)return;const g=id=>{const e=$(id),v=e?decIn(e.value):'';return v===''?NaN:parseFloat(v)},M={t:g('ivcT'),b:g('ivcB'),r:g('ivcR'),l:g('ivcL')},S=IS.W[IS.p],R=invCalFit(S,M,P);IS.cal=M;
  if(R.err){IS.calErr=1;IS.calMsg=esc(R.err);ivRe({noPrev:1});return}
  const EW=S['psw'+P]||0,EH=S['psh'+P]||0;S['psk'+P]=R.psk;S['psx'+P]=R.psx;S['psy'+P]=R.psy;IS.W[IS.p]=ivCl(S);IS.cal={};IS.calErr=0;const f=v=>toFa(String(Math.abs(v)));
  IS.calMsg=`${ic('check')} برای چاپ با <b>${esc(ivPlN(P))}</b> تنظیم شد · سیستم چاپ برگه را <b>${toFa(String(R.sc))}٪</b> چاپ می‌کند. از این به بعد چاپ ${R.psx?f(R.psx)+' میلی‌متر به '+(R.psx>0?'راست':'چپ'):''}${R.psx&&R.psy?' و ':''}${R.psy?f(R.psy)+' میلی‌متر به '+(R.psy>0?'پایین':'بالا'):''}${R.psx||R.psy?' می‌رود':'جابه‌جا نمی‌شود'}${EW||EH?'، عرض '+toFa(String(Math.round((R.psk+EW)*10)/10))+'٪ و ارتفاع '+toFa(String(Math.round((R.psk+EH)*10)/10))+'٪':R.psk!==100?'، اندازه '+toFa(String(R.psk))+'٪':''}. حاشیهٔ راست و چپ حدود <b>${f(R.mx)}</b> و بالا و پایین حدود <b>${f(R.my)}</b> میلی‌متر می‌شود. «ذخیره» را بزنید و یک برگه چاپ کنید؛ اگر هنوز کمی جابه‌جا بود دوباره اندازه بگیرید.`;ivRe({noPrev:1})};
ACT.ivCal0=()=>{if(!IS||IS.p==='stm')return;const P=IS.calPl;if(!P)return;const S=IS.W[IS.p];S['psk'+P]=100;S['psx'+P]=0;S['psy'+P]=0;S['psw'+P]=0;S['psh'+P]=0;S['psr'+P]=0;IS.W[IS.p]=ivCl(S);IS.cal={};IS.calMsg='';IS.calErr=0;ivRe({noPrev:1})};
function ivSecHTML(){if(IS.p==='stm')return stmSecHTML();const S=IS.W[IS.p],k=IS.sec,pn=INVP.find(x=>x[0]===IS.p)[1];let h='';
  if(k==='paper')h=ivPick('paper','اندازه کاغذ','«۲۱ × ۱۴» برای برگه‌های دسته‌فاکتور است (کمی کوتاه‌تر از A5). A4 افقی همان برگه است، بزرگ‌تر. در «A4 عمودی» دو برگه روی یک کاغذ می‌آید: نسخه مشتری بالا و نسخه فروشگاه پایین',[['a5','A5 افقی'],['b14','۲۱ × ۱۴ سانت'],['a4','A4 افقی'],['a42','A4 · دو نسخه']])
    +(S.paper==='a42'?'':ivSw('copy','نسخه فروشگاه','یک برگه دوم با همان محتوا و برچسب «نسخه فروشگاه»'))
    +ivPick('ink','رنگ چاپ','سیاه‌وسفید برای چاپگر لیزری: طلایی‌ها خاکستری تیره و رنگ طلبکار/بدهکار مشکی می‌شود',[['c','رنگی'],['m','سیاه‌وسفید']])
    +(S.ink==='m'?'':ivPick('bg','رنگ کاغذ','',[['c','کرم'],['w','سفید']]))
    +ivPick('frame','قاب دور برگه','',[['g','جدول زرّین'],['l','خط ساده'],['n','بدون قاب']])
    +(S.paper==='a42'?'':ivCalHTML(S));
  else if(k==='head')h=ivPick('lp','لوگو','',[['c','وسط'],['r','سمت راست'],['n','بدون لوگو']])
    +ivPick('cal','خط عنوان','',[[1,'خوشنویسی'],[0,'ساده']])
    +ivRow('متن عنوان','«خودکار» از روی خود سند: فاکتور فروش، فاکتور خرید، رسید دریافت…',`<div class="ivch"><button type="button" class="${S.ttl?'':'on'}" data-act="ivTtl" data-v="">خودکار</button>${IVTTL.map(x=>`<button type="button" class="${S.ttl===x?'on':''}" data-act="ivTtl" data-v="${x}">${x}</button>`).join('')}</div><input class="ivin" id="ivTt" value="${esc(IVTTL.includes(S.ttl)?'':S.ttl)}" placeholder="یا متن دلخواه (با خط ساده نوشته می‌شود)" maxlength="28" autocomplete="off" enterkeyhint="done">`,'col')
    +ivSw('cn','شماره سند مشتری','زیر شماره، شماره سند همین مشتری هم نوشته شود')+ivSw('wd','روز هفته کنار تاریخ','');
  else if(k==='cust')h=ivSw('ph','تلفن مشتری','')+ivSw('cno','شماره مشتری','')+ivSw('nid','کد ملی مشتری','اگر در حساب مشتری ثبت شده باشد')+ivSw('mz','مظنه روز','')+ivSw('g18','قیمت هر گرم ۱۸ عیار','');
  /* v91.5 (خواسته صاحب اپ: «برای هر قسمت تیک باشد یا نباشد؛ فقط درصد هم باشد»): هر ستون یک کارت با کلید روشن/خاموش؛ روشن = «خودکار/همیشه» و
     برای اجرت و سود شکل نوشتن (فقط درصد، فقط مبلغ، درصد و مبلغ زیرش) همان‌جا زیر خودش */
  else if(k==='cols')h=`<div class="ivnote">ردیف، شرح و مبلغ همیشه هستند. «خودکار» یعنی ستون فقط وقتی می‌آید که در همان فاکتور چیزی برای نشان دادن دارد.</div>`+INVCOL.map(([f,l])=>{const on=S['c'+f]!=='n',T=f==='rt'&&S.rt==='g'?'فی هر گرم':l;
      const fm=f==='aj'?[['p','همان که وارد شده'],['o','فقط درصد'],['t','فقط مبلغ'],['b','درصد + مبلغ زیرش']]:f==='pp'?[['p','درصد'],['o','فقط درصد (همیشه)'],['t','فقط مبلغ'],['b','درصد + مبلغ زیرش']]:f==='rt'?[['m','مظنه'],['g','فی هر گرم']]:null;
      return `<div class="ivcc${on?' on':''}"><div class="ivr"><span class="tx"><b>${T}</b><small>${IVCH[f]||''}</small></span><button type="button" class="ivsw${on?' on':''}" role="switch" aria-checked="${on}" data-act="ivCol" data-f="${f}" aria-label="${esc(T)}"><i></i></button></div>${on?`<div class="ivcs">${ivSeg('c'+f,[['a','خودکار'],['y','همیشه']])}${fm?`<small class="ivcl">شکل نوشتن</small>${ivSeg(f==='rt'?'rt':f,fm)}`:''}</div>`:''}</div>`}).join('');
  else if(k==='rows')h=ivRow('ارتفاع ردیف','ردیف‌های دوخطی (درصد و مبلغ) خودشان بلندتر می‌شوند',`<div class="ivst"><button type="button" data-act="ivN" data-k="rh" data-d="-0.2" aria-label="کمتر">−</button><b>${toFa(S.rh.toFixed(1))} <small>میلی‌متر</small></b><button type="button" data-act="ivN" data-k="rh" data-d="0.2" aria-label="بیشتر">+</button></div>`)
    +ivPick('fs','اندازه نوشته جدول','',[[-1,'ریز'],[0,'معمولی'],[1,'درشت'],[2,'خیلی درشت']])
    +ivPick('cap','نوار عنوان گروه‌ها','فروش به مشتری، خرید از مشتری، دریافت، پرداخت. خودکار = وقتی بیش از یک گروه هست',AYN)+ivSw('sum','جمع هر گروه','در یک کادر زیر آخرین ردیف همان گروه: جمع وزن طلا و جمع مبلغ (وقتی دو ردیف یا بیشتر دارد)')
    +ivSw('ex','جزئیات کنار نام کالا','توضیح ردیف، شرطی، آزمایشگاه و انگ (اگر ستون جدا ندارند)، معادل ۷۵۰')
    +ivPick('py','دریافت و پرداخت‌ها','',[[1,'هر کدام یک ردیف'],[0,'یک ردیف جمع']])+ivSw('tn','شماره پیگیری حواله','')
    +ivPick('fill','فضای خالی زیر ردیف‌ها','',[['b','ساده'],['l','ادامه خط ستون‌ها'],['r','ردیف‌های خالی']]);
  else if(k==='acc')h=ivSw('acc','جدول «حساب مشتری»','مانده قبلی، این فاکتور و مانده نهایی، پایین همان قاب')
    +(S.acc?ivSw('ap','سطر «مانده قبلی»','')+ivSw('ad','سطر «این فاکتور»','')+ivPick('ag','مانده طلا','',[['y','همیشه'],['a','فقط وقتی مانده دارد'],['n','هرگز']])+ivPick('ax','مانده سکه و ارز','هر سکه یا ارزی که مشتری مانده دارد یک ستون می‌گیرد',[['a','خودکار'],['n','هرگز']])
      +ivSw('an','توضیح کنار سطرها','پیش از این فاکتور · فروش − خرید − دریافت · …')+ivSw('lg','راهنمای زیر جدول','یک خط که معنی دو طرف حساب را می‌گوید')
      +ivPick('wr','واژه‌های دو طرف حساب','از دید مطلا یا از دید مشتری',[['w','طلبکاریم / بدهکاریم'],['c','بدهکار / بستانکار']]):'')
    +ivSw('wds','واریزی‌های در راه مشتری','زیر جدول: مانده‌ای که در لیست واریز است با تاریخ واریزش، و اینکه پس از آن حساب تسویه است یا چقدر می‌ماند');
  else h=ivSw('sgc','جای امضای مشتری','')+ivSw('sgs','جای مهر و امضای فروشنده','')+(S.sgs?ivSw('by','نام ثبت‌کننده کنار امضا','نام کاربری که سند را ثبت کرده'):'')+ivSw('th','«با سپاس از اعتماد شما»','')+ivSw('shp','مشخصات فروشگاه','نام، نشانی، تلفن و صفحه؛ اگر همه خالی باشد «طلا و جواهر مطلا»')
    +ivRow('یادداشت پایین فاکتور','مثلاً شرایط مرجوعی. فقط برای قالب «'+pn+'»',`<input class="ivin" id="ivNt" value="${esc(S.note)}" placeholder="خالی = چیزی چاپ نمی‌شود" maxlength="170" autocomplete="off" enterkeyhint="done">`,'col')
    +`</div><div class="ivh">مشخصات فروشگاه · برای همه قالب‌ها</div><div class="ivk">`
    +ivRow('نام فروشگاه','',`<input class="ivin" id="ivSn" value="${esc(IS.shop.nm)}" placeholder="مثلاً طلا و جواهر مطلا" maxlength="40" autocomplete="off" enterkeyhint="next">`,'col')
    +ivRow('نشانی','',`<input class="ivin" id="ivSa" value="${esc(IS.shop.ad)}" placeholder="نشانی کوتاه" maxlength="90" autocomplete="off" enterkeyhint="next">`,'col')
    +ivRow('تلفن','',`<input class="ivin ltr" id="ivSt" inputmode="tel" value="${esc(IS.shop.tel)}" placeholder="تلفن فروشگاه" maxlength="40" autocomplete="off" enterkeyhint="next">`,'col')
    +ivRow('اینستاگرام یا سایت','',`<input class="ivin ltr" id="ivSi" value="${esc(IS.shop.ig)}" placeholder="نشانی صفحه" maxlength="50" autocomplete="off" enterkeyhint="done">`,'col');
  const hint=k==='cols'?`<div class="ivsh own">${ic('edit')}<span>ستون‌ها فقط برای فاکتور «${pn}» است</span></div>`:`<div class="ivsh">${ic('check')}<span>این بخش برای همه فاکتورها یکی است${k==='head'?' (جز متن عنوان)':k==='foot'?' (جز یادداشت)':''}</span></div>`;
  return `${hint}<div class="ivk">${h}</div><div class="ivact">${k==='cols'?`<button type="button" data-act="ivCopy">${ic('copy')}<span>همین ستون‌ها برای همه فاکتورها</span></button>`:''}<button type="button" class="rd" data-act="ivReset">${ic('undo')}<span>برگشت به پیش‌فرض</span></button></div>`}
/* v92.8 (خواسته صاحب اپ: «برای PDF هم قسمتی که بشود ادیت کرد چه چیزهایی بیاید؛ در تنظیمات فاکتور»): زبانه پنجم «صورت‌حساب» — تنظیم‌های صورت‌حساب مشتری
   (IS.W.stm، کلیدهای STMD در 15p)، با بخش‌های خودش (STMSEC) و پیش‌نمایش زنده همان stmtPdfHTML روی یک حساب نمونه */
const IVTABS=()=>[...INVP,['stm','صورت‌حساب']];
const STMSEC=[['cols','ستون‌ها'],['rows','ردیف‌ها'],['fin','مانده نهایی'],['head','سربرگ'],['paper','کاغذ'],['foot','پانویس']];
const ivSecs=()=>IS.p==='stm'?STMSEC:IVSEC,ivCl=S=>IS.p==='stm'?stmClean(S):invClean(S),ivDf=()=>IS.p==='stm'?STMD:INVD;
const ivSecBtns=()=>{const L=ivSecs();if(!L.some(x=>x[0]===IS.sec))IS.sec=L[0][0];return L.map(([k,l])=>`<button type="button" role="tab" aria-selected="${IS.sec===k}" class="${IS.sec===k?'on':''}" data-act="ivSec" data-s="${k}">${l}</button>`).join('')};
function stmSample(){const A=['sale','buy','rcp'].map(invSample),c=A[0].c,now=new Date(),iso=n=>{const d=new Date(now-n*864e5);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
  c.txs=[{...c.txs[0],date:iso(9)},...A.map((x,i)=>({...x.t,id:'smp'+i,no:1001+i,date:iso(6-i*3),at:new Date(now-(6-i*3)*864e5).toISOString()}))];c.grp='مشتری';return {c,t:c.txs[1]}}
function stmSecHTML(){const S=IS.W.stm,k=IS.sec,A3=[['a','خودکار'],['y','همیشه'],['n','هرگز']];let h='';
  if(k==='cols')h=`<div class="ivnote">حالت ساده: برای مبلغ فقط «این سند» و «مانده». اگر بخواهید، مبلغ هر سند می‌تواند در چهار ستون جدا (فروش، خرید، دریافت، پرداخت) هم بیاید.</div>`
    +ivSw('cdv','ستون «این سند»','خالص اثر هر سند روی حساب (طلبکار شدیم / بدهکار شدیم)')+ivSw('cbl','ستون «مانده»','مانده حساب بعد از همان سند')
    +ivSw('csl','ستون جدا برای «فروش»','جمع فروش هر سند')+ivSw('cby','ستون جدا برای «خرید»','خرید از مشتری')+ivSw('cin','ستون جدا برای «دریافت»','پولی که از مشتری گرفته‌ایم')+ivSw('cout','ستون جدا برای «پرداخت»','پولی که به مشتری داده‌ایم')
    +ivPick('gd','ستون‌های طلا','خودکار = فقط وقتی این حساب طلا دارد',A3)+(S.gd==='n'?'':ivSw('gdv','«این سند» برای طلا','کنار مانده طلا، مقدار همان سند هم بیاید'))+ivSw('cx','سکه و ارز','اگر حساب مانده سکه یا ارز دارد ستونش بیاید');
  else if(k==='rows')h=`<div class="ivnote">زیر عنوان هر سند، ریزش مرتب و زیر هم می‌آید: نوع (فروش، خرید، دریافت، پرداخت) · شرح · مبلغ.</div>`+ivSw('s1','ردیف‌های کالا','فروش، خرید و تحویل/دریافت طلا و سکه با وزن و تعداد')+ivSw('s2','ردیف‌های دریافت و پرداخت','کارتخوان، حواله، نقد…')+ivSw('da','مبلغ هر ردیف','ستون مبلغ کنار هر قلم')+ivSw('mz','مظنه سند','کنار عنوان سند')+(S.csl||S.cby||S.cin||S.cout?ivSw('tot','ردیف «جمع ستون‌ها»','جمع فروش، خرید، دریافت و پرداخت پایین جدول'):'');
  else if(k==='fin')h=ivSw('fb','کادر «مانده نهایی حساب» بالای برگه','عدد درشت و «طلبکاریم / بدهکاریم» برای هر جنس')+(S.fb?ivSw('fbs','جمله زیر عدد','«مشتری به مطلا بدهکار است»'):'')+ivSw('fr','ردیف «مانده نهایی حساب» آخر جدول','');
  else if(k==='head')h=ivSw('lg','لوگو','')+ivSw('ph','تلفن مشتری','')+ivSw('nid','کد ملی مشتری','اگر در حساب ثبت شده باشد')+ivSw('grp','گروه مشتری','')+ivSw('cnt','تعداد سند','');
  else if(k==='paper')h=ivPick('paper','کاغذ','خودکار = A4 عمودی؛ اگر ستون‌ها جا نشوند خودش افقی می‌شود',[['a','خودکار'],['p','A4 عمودی'],['l','A4 افقی']])+ivPick('fs','اندازه نوشته جدول','',[[-1,'ریز'],[0,'معمولی'],[1,'درشت'],[2,'خیلی درشت']]);
  else h=ivSw('lgd','راهنمای زیر جدول','یک خط که معنی «طلبکاریم» و «بدهکاریم» را می‌گوید')+ivSw('sg','جای امضای مشتری و مهر مطلا','')+ivRow('یادداشت پایین صورت‌حساب','',`<input class="ivin" id="ivSNt" value="${esc(S.note)}" placeholder="خالی = چیزی چاپ نمی‌شود" maxlength="170" autocomplete="off" enterkeyhint="done">`,'col');
  return `<div class="ivsh own">${ic('edit')}<span>این تنظیم‌ها فقط برای صورت‌حساب مشتری است</span></div><div class="ivk">${h}</div><div class="ivact"><button type="button" class="rd" data-act="ivReset">${ic('undo')}<span>برگشت به پیش‌فرض</span></button></div>`}
function vInvSet(){if(!isAdmin())return '<div class="card empty"><b>فقط مدیر دسترسی دارد</b></div>';if(!IS)ivOpen();
  return `<div class="ivs"><div class="ivtab" role="tablist" aria-label="قالب فاکتور">${IVTABS().map(([k,l])=>`<button type="button" role="tab" aria-selected="${IS.p===k}" class="${IS.p===k?'on':''}" data-act="ivTab" data-p="${k}">${l}</button>`).join('')}</div>
  <div class="ivtop"><div class="ivpv"><div class="ivpw" id="ivPw"><iframe id="ivF0" class="on" title="پیش‌نمایش فاکتور" tabindex="-1"></iframe><iframe id="ivF1" title="پیش‌نمایش فاکتور" tabindex="-1" aria-hidden="true"></iframe><button type="button" class="ivpz" data-act="ivZoom" aria-label="بزرگ‌نمایی پیش‌نمایش"><span>${ic('search')}</span></button></div><small class="ivpi" id="ivPi"></small></div>
  <div class="ivsec" id="ivSc" role="tablist" aria-label="بخش تنظیمات">${ivSecBtns()}</div></div>
  <div class="ivc" id="ivC">${ivSecHTML()}</div></div>`}
const aInvSet=()=>'';
/* پیش‌نمایش: برگه واقعی در اندازه واقعی کاغذ، با transform کوچک می‌شود تا در پهنای صفحه (و حداکثر ۳۶٪ ارتفاع) جا شود */
/* v98.9: در پیش‌نمایش نمونه (نه سند واقعی) اگر به مشتری بدهکاریم، یک واریزی در راه برای فردا نشان داده می‌شود تا کلید «واریزی‌های در راه» دیده شود */
function ivSchedS(X){if(!X||X.real)return {};let r=0;try{r=Math.round(cuBalBefore(X.c,X.t).R+txD(X.t).r)}catch(_){}if(r<=0)return {};const d=new Date(Date.now()+864e5);return {sched:[{d:d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()),a:r,n:1}]}}
function ivPrev(now){clearTimeout(ivPrev.t);ivPrev.t=setTimeout(()=>{const box=$('ivPw');if(!box||!IS)return;const X=ivDoc(),st=IS.p==='stm';let h;try{h=st?stmtPdfHTML(X.c,{},{S:IS.W.stm}):ivWithShop(()=>invDoc(X.c,X.t,{S:IS.W[IS.p],prof:IS.p,...ivSchedS(X)}))}catch(e){const i=$('ivPi');if(i)i.textContent='پیش‌نمایش ساخته نشد';return}
    const Q=pageSpec(h),PX=96/25.4,W=Math.round(Q.mmW*PX),H=Math.round(Q.mmH*PX),n=(h.match(/<section class="sht"/g)||[]).length,cw=Math.max(200,box.parentNode.clientWidth-16),sc=Math.min(cw/W,Math.max(150,innerHeight*.3)/H);
    box.style.width=Math.floor(W*sc)+'px';box.style.height=Math.floor(H*sc)+'px';
    const a=box.querySelector('iframe.on'),b=box.querySelector('iframe:not(.on)');if(!a||!b)return;b.style.width=W+'px';b.style.height=H+'px';b.style.transform=`scale(${sc})`;
    b.onload=()=>{b.classList.add('on');a.classList.remove('on')};
    b.srcdoc=h.replace('</head>',st?`<style>html{background:#fff!important;overflow:hidden!important}html body{width:${W}px!important;margin:0!important;padding:${Q.mv}mm ${Q.mh}mm!important;background:#fff!important;overflow:hidden!important;box-sizing:border-box!important}.pb{display:none!important}</style></head>`:'<style>html,body{margin:0!important;overflow:hidden!important;background:transparent!important}html body .sht{margin:0!important;border-radius:0!important;box-shadow:none!important}</style></head>');
    const i=$('ivPi');if(i)i.textContent=(st?'پیش‌نمایش با حساب نمونه':X.real?'پیش‌نمایش همین سند':'پیش‌نمایش با سند نمونه')+(n>1?' · '+toFa(n)+' برگه':'')+' · برای بزرگ‌نمایی بزنید'},now?0:120)}
/* بازسازی بدون render: فقط دکمه‌های بالا، فرم بخش و پیش‌نمایش (iframeها می‌مانند) */
/* v92.2: هر چه مشترک است (همه چیز جز عنوان، یادداشت و ستون‌ها) از قالب باز روی بقیه قالب‌ها هم می‌نشیند — برگه همه فاکتورها یک اندازه و یک شکل می‌ماند */
function ivShSync(){if(!IS||IS.p==='stm')return;const S=IS.W[IS.p];INVP.forEach(([k])=>{if(k===IS.p)return;const T=IS.W[k];for(const q in INVD)if(!invOwn(q))T[q]=S[q]})}
function ivRe(o){o=o||{};ivShSync();document.querySelectorAll('#view .ivtab button').forEach(b=>{const on=b.dataset.p===IS.p;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  document.querySelectorAll('#ivSc button').forEach(b=>{const on=b.dataset.s===IS.sec;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  const C=$('ivC');if(C&&!o.keep){C.innerHTML=ivSecHTML();if(o.anim)C.classList.remove('in'),void C.offsetWidth,C.classList.add('in');ivBindIn()}hdGoSync();if(!o.noPrev)ivPrev()}
function ivBindIn(){const S=IS.W[IS.p],B=(id,f)=>{const e=$(id);if(e)e.oninput=()=>{f(e.value);ivRe({keep:1})}};
  ['ivcT','ivcB','ivcR','ivcL'].forEach((id,i)=>{const e=$(id);if(e)e.oninput=()=>{IS.cal=IS.cal||{};IS.cal['tbrl'[i]]=e.value}});
  document.querySelectorAll('#view .ivsti input').forEach(e=>{e.onkeydown=ev=>{if(ev.key==='Enter')e.blur()};e.onfocus=()=>{try{e.select()}catch(x){}};e.onchange=()=>{const v=parseFloat(decIn(e.value));if(!IS)return;if(e.dataset.m==='s'){const k=e.dataset.k,hi=+e.dataset.hi||25,S=IS.W[IS.p];if(!isFinite(v)||v<0||v>hi){toast('عددی بین ۰ و '+toFa(String(hi))+' بنویسید',true);ivRe({noPrev:1});return}const sg=(+S[k]||0)<0?-1:(+S[k]||0)>0?1:((IS.sg||{})[k]||1);S[k]=Math.round(v*sg*10)/10;IS.W[IS.p]=ivCl(S);ivRe({noPrev:1});return}if(!isFinite(v)||v<80||v>125){toast('عددی بین ۸۰ و ۱۲۵ درصد بنویسید',true);ivRe({noPrev:1});return}const S=IS.W[IS.p],k=e.dataset.k;S[k]=Math.round((v-(+e.dataset.b||100))*10)/10;IS.W[IS.p]=ivCl(S);ivRe({noPrev:1})}});
  B('ivTt',v=>{S.ttl=clean(v).slice(0,28);document.querySelectorAll('#ivC .ivch button').forEach(b=>b.classList.toggle('on',(b.dataset.v||'')===S.ttl))});
  B('ivNt',v=>{S.note=clean(v).slice(0,170)});B('ivSNt',v=>{IS.W.stm.note=clean(v).slice(0,170)});B('ivSn',v=>{IS.shop.nm=clean(v).slice(0,40)});B('ivSa',v=>{IS.shop.ad=clean(v).slice(0,90)});B('ivSt',v=>{IS.shop.tel=clean(v).slice(0,40)});B('ivSi',v=>{IS.shop.ig=clean(v).slice(0,50)})}
function bindInvSet(){if(!IS||!isAdmin())return;ivBindIn();ivPrev(1);if(!bindInvSet.rz){bindInvSet.rz=1;window.addEventListener('resize',()=>{if(cur==='invset')ivPrev()})}}
/* مشخصات فروشگاه تا ذخیره نشده فقط در پیش‌نمایش دیده می‌شود: invDoc از cfg می‌خواند، پس هنگام ساختن پیش‌نمایش موقتاً جایش گذاشته می‌شود */
const ivWithShop=f=>{const r=cfgRec();if(!r)return f();const o=r.shop;r.shop={...IS.shop};try{return f()}finally{if(o===undefined)delete r.shop;else r.shop=o}};
ACT.invSet=()=>{if(!isAdmin()){toast('فقط مدیر می‌تواند تنظیمات فاکتور را عوض کند',true);return}if(cur!=='invset')meRet=cur;PARENT.invset='home';ivOpen({from:'me'});go('invset')};
ACT.invSetDoc=()=>{if(!isAdmin()){toast('فقط مدیر می‌تواند تنظیمات فاکتور را عوض کند',true);return}const X=invGet();if(!X)return;const p=invProf(X.t);PARENT.invset='inv';ivOpen({from:'inv',p,doc:{cu:X.c.id,tx:X.t.id,p}});go('invset')};
ACT.ivTab=d=>{if(!IS||IS.p===d.p)return;const sw=(IS.p==='stm')!==(d.p==='stm');IS.p=d.p;if(sw){IS.sec=ivSecs()[0][0];const c=$('ivSc');if(c)c.innerHTML=ivSecBtns()}ivRe({anim:1})};
ACT.ivSec=d=>{if(!IS||IS.sec===d.s)return;IS.sec=d.s;ivRe({anim:1,noPrev:1});const b=document.querySelector('#ivSc button.on');if(b&&b.scrollIntoView)b.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})};
ACT.ivT=d=>{if(!IS)return;const S=IS.W[IS.p];S[d.k]=S[d.k]?0:1;if(IS.p==='stm')IS.W.stm=stmClean(S);ivRe()};
ACT.ivV=d=>{if(!IS)return;const S=IS.W[IS.p],n=typeof ivDf()[d.k]==='number';S[d.k]=n?+d.v:d.v;IS.W[IS.p]=ivCl(S);ivRe()};
ACT.ivN=d=>{if(!IS)return;const S=IS.W[IS.p];S[d.k]=Math.round(((+S[d.k]||0)+(+d.d||0))*10)/10;IS.W[IS.p]=ivCl(S);ivRe()};
ACT.ivTtl=d=>{if(!IS)return;IS.W[IS.p].ttl=d.v||'';ivRe()};
ACT.ivZoom=()=>{if(!IS)return;const X=ivDoc(),S={...IS.W[IS.p]},p=IS.p;if(p==='stm'){openPrint(()=>stmtPdfHTML(X.c,{},{S}));return}openPrint(()=>ivWithShop(()=>invDoc(X.c,X.t,{S,prof:p,...ivSchedS(X)})))};
ACT.ivReset=()=>{if(!IS)return;if(IS.p==='stm'){askConfirm('تنظیمات صورت‌حساب به پیش‌فرض برگردد؟','برگردان',()=>{IS.W.stm=stmClean(STMD);ivRe({anim:1});toast('به پیش‌فرض برگشت؛ برای ماندگار شدن «ذخیره» را بزنید')});return}const pn=INVP.find(x=>x[0]===IS.p)[1];askConfirm('همه تنظیمات به پیش‌فرض برگردد؟\nکاغذ، سربرگ، ردیف‌ها، مانده حساب و پانویس برای همه فاکتورها برمی‌گردد؛ ستون‌ها، عنوان و یادداشت فقط برای «'+pn+'».','برگردان',()=>{IS.W[IS.p]=invClean({...INVD,...(INVT[IS.p]||{})});ivRe({anim:1});toast('به پیش‌فرض برگشت؛ برای ماندگار شدن «ذخیره» را بزنید')})};
ACT.ivCopy=()=>{if(!IS)return;const pn=INVP.find(x=>x[0]===IS.p)[1];askConfirm('ستون‌های «'+pn+'» روی سه فاکتور دیگر هم گذاشته شود؟\nستون‌ها و شکل اجرت، سود و نرخ آن‌ها جایگزین می‌شود.','کپی کن',()=>{INVP.forEach(([k])=>{if(k!==IS.p)for(const q in INVD)if(invOwn(q)&&q!=='ttl'&&q!=='note')IS.W[k][q]=IS.W[IS.p][q]});ivRe({keep:1,noPrev:1});toast('روی همه فاکتورها گذاشته شد؛ برای ماندگار شدن «ذخیره» را بزنید')})};
ACT.ivSave=()=>{if(!IS||!isAdmin())return;if(!ivDirty()){toast('چیزی عوض نشده است');return}const r=cfgRec(1),inv={};
  ivShSync();INVP.forEach(([k])=>{const base=invClean({...INVD,...(INVT[k]||{})}),c2=invClean(IS.W[k]),o={};for(const q in c2)if(c2[q]!==base[q])o[q]=c2[q];inv[k]=o});
  /* بخش مشترک جدا هم نوشته می‌شود (all)؛ در هر قالب هم می‌ماند تا گوشی‌ای که هنوز نسخه قبلی برنامه را دارد همان را بخواند */
  {const c2=invClean(IS.W[IS.p==='stm'?'sale':IS.p]),all={};for(const q in c2)if(!invOwn(q)&&c2[q]!==INVD[q])all[q]=c2[q];inv.all=all}
  {const c2=stmClean(IS.W.stm),o={};for(const q in c2)if(c2[q]!==STMD[q])o[q]=c2[q];r.stm=o}
  r.inv=inv;r.shop={nm:IS.shop.nm,ad:IS.shop.ad,tel:IS.shop.tel,ig:IS.shop.ig};saveCu();IS.sig0=ivSig();logA('cust','تنظیمات فاکتور','قالب‌های فاکتور و صورت‌حساب ذخیره شد');toast('تنظیمات فاکتور ذخیره شد');
  /* v91.5 (خواسته صاحب اپ: «ذخیره که خورد انیمیشن درست انجام شود، ذخیره شود و بیرون بیاید»): «✓ ذخیره شد» روی خود دکمه، بعد برگشت به تنظیمات */
  setTimeout(()=>{if(cur==='invset'&&!ivDirty())leaveTo()},850)};
ACT.ivCol=d=>{if(!IS)return;const S=IS.W[IS.p],k='c'+d.f;S[k]=S[k]==='n'?'a':'n';IS.W[IS.p]=invClean(S);ivRe()};

/* v100.0 جهت جابه‌جایی/چرخش: عدد را قرینه می‌کند؛ وقتی عدد صفر است فقط جهت انتخاب‌شده برای عدد بعدی یادش می‌ماند */
ACT.ivSgn=d=>{if(!IS)return;const S=IS.W[IS.p],k=d.k,v=+S[k]||0;IS.sg=IS.sg||{};IS.sg[k]=-(+d.v||1);if(v){S[k]=-v;IS.W[IS.p]=ivCl(S)}ivRe({noPrev:1})};

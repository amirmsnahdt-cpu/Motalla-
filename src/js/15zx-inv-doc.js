/* ============ v90.8 فاکتور: «تنظیمات فاکتور» و موتور چاپ ============
   خواسته صاحب اپ: «تنظیمات فاکتور در درون برنامه برای همه نوع فاکتور فروش و خرید که بتوانم همه‌چیز را تنظیم کنم: ردیف‌ها و ارتفاع‌ها، قسمت‌های مانده حساب،
   از لوگو تا همه‌چیز، اضافه و کم کردن ستون‌ها؛ فاکتور آبشده با تنظیمات خودش و فاکتور فروش طلا با تنظیمات خودش؛ اجرت و سود درصدی و مبلغ تومانی زیرش یا خیر».
   هر «قالب» (INVP: فروش طلا · آبشده · خرید · رسید) یک دسته تنظیم دارد. پیش‌فرض همه = INVD، پیش‌فرض ویژه هر قالب = INVT، و فقط چیزهایی که مدیر عوض کرده
   در رکورد تنظیمات (cfg.inv[قالب]) نگه داشته و همگام می‌شود؛ invCfg(قالب) این سه را روی هم می‌گذارد و invClean مقدار نامعتبر را به پیش‌فرض برمی‌گرداند
   (تنظیم خراب هیچ‌وقت چاپ را خراب نمی‌کند). قالب هر سند را invProf از ردیف‌هایش می‌فهمد. صفحه تنظیمات در 15zy است.

   برگه «جدول زرّین» (v90.6): «مطلا» یعنی زرنگار؛ در نسخه‌های خطی دور متن «جدول» می‌کشیدند: یک نوار طلا میان دو خط نازک مشکی. همین جدول سه‌خطی قاب برگه است،
   لوگو مثل مُهر بالای برگه می‌نشیند و عنوان با نستعلیق نوشته می‌شود (invCal در 15zw). برگه A5 افقی است و همه اندازه‌ها میلی‌متر و ثابت:
   سربرگ → نوار مشتری و مظنه → یک قاب (ردیف‌های سند در گروه‌های فروش / خرید / دریافت / پرداخت و پایین همان قاب جدول «حساب مشتری») → پانویس.
   برگه‌ها را خود invDoc می‌چیند، نه مرورگر: هر صفحه یک <section class="sht"> دقیقاً هم‌اندازه کاغذ است و ارتفاع هر تکه معلوم است؛ ردیف‌هایی که جا نشوند
   به برگه بعد می‌روند و «حساب مشتری» فقط روی برگه آخر می‌آید. چرا: پیش‌نمایش داخل برنامه، PDF گوشی (pdfMake، هر صفحه یک عکس) و چاپ مرورگر سه موتور جدا
   هستند و فقط چیدمان با اندازه ثابت در هر سه یک شکل درمی‌آید. نکته‌های همان مسیر: @page باید «margin:0mm» باشد (pageSpec عدد را با mm می‌خواند)،
   body نباید class داشته باشد (pdfMake به آن class="__pb" می‌دهد و صفت تکراری SVG را خراب می‌کند)، و چیزی با position:absolute چیده نمی‌شود.
   کاغذ A4 افقی همان برگه است که همه میلی‌مترها و اندازه قلم‌هایش در ۱٫۴۱۴ ضرب شده (invScale)؛ «A4 عمودی» دو برگه A5 (نسخه مشتری و فروشگاه) روی یک کاغذ است. */
const INVP=[['sale','فروش طلا','کالای ساخته، سکه و هر فروش دیگر'],['ab','آبشده','وقتی همه کالاهای سند آبشده است'],['buy','خرید','خرید از مشتری، بدون فروش'],['rcp','رسید','دریافت و پرداخت بدون کالا']];
const INVD={paper:'b14',bg:'c',ink:'c',frame:'g',copy:0,
  lp:'c',cal:1,ttl:'',cn:0,wd:0,
  ph:1,cno:0,nid:0,mz:1,g18:1,
  cw:'a',cay:'a',cw7:'n',clab:'n',cang:'n',crt:'a',cgv:'n',caj:'a',cpp:'a',ctx:'a',
  aj:'p',pp:'p',rt:'m',
  rh:5.5,fs:0,cap:'a',sum:1,ex:1,py:1,tn:1,fill:'b',
  acc:1,ap:1,ad:1,ag:'y',ax:'a',an:1,lg:1,wr:'w',
  sgc:1,sgs:1,by:1,th:1,shp:1,note:''};
/* پیش‌فرض ویژه هر قالب: آبشده اجرت و مالیات ندارد و آزمایشگاه و انگش ستون جدا می‌گیرد */
const INVT={ab:{clab:'a',cang:'a',caj:'n',ctx:'n'}};
const INVE={paper:['a5','b14','a4','a42'],bg:['c','w'],ink:['c','m'],frame:['g','l','n'],lp:['c','r','n'],aj:['p','o','t','b'],pp:['p','o','t','b'],rt:['m','g'],cap:['a','y','n'],fill:['b','l','r'],ag:['y','a','n'],ax:['a','n'],wr:['w','c']},INVN={rh:[4.6,9],fs:[-1,2]};
const INVCOL=[['w','وزن / تعداد'],['ay','عیار'],['w7','وزن ۷۵۰'],['lab','آزمایشگاه'],['ang','انگ'],['rt','نرخ'],['gv','مبلغ طلا'],['aj','اجرت'],['pp','سود'],['tx','مالیات']];
function invClean(o){const r={};for(const k in INVD){const d=INVD[k],v=o?o[k]:undefined;
    if(INVE[k]||/^c(w|ay|w7|lab|ang|rt|gv|aj|pp|tx)$/.test(k))r[k]=(INVE[k]||['a','y','n']).includes(v)?v:d;
    else if(INVN[k]){const n=+v;r[k]=isFinite(n)&&v!==''&&v!=null?Math.min(INVN[k][1],Math.max(INVN[k][0],k==='fs'?Math.round(n):Math.round(n*10)/10)):d}
    else if(typeof d==='string')r[k]=typeof v==='string'?clean(v).slice(0,k==='ttl'?28:170):d;
    else r[k]=v==null?d:(v?1:0)}
  return r}
/* v92.2 (خواسته صاحب اپ: «سایز فاکتورهای فروش و خرید و باقی فرق می‌کند، باید یک اندازه باشد»): ظاهر برگه برای همه قالب‌ها یکی است.
   فقط این‌ها مال خود هر قالب می‌ماند (INVOWN): متن عنوان، یادداشت، ستون‌ها و شکل اجرت/سود/نرخ. بقیه (کاغذ، قاب، سربرگ، ارتفاع ردیف، اندازه نوشته، مانده حساب، پانویس)
   یک دسته مشترک است: cfg.inv.all. داده قدیمی (بدون all): مقدار قالب «فروش طلا» و بعد بقیه قالب‌ها مشترک حساب می‌شود. */
const invOwn=k=>k==='ttl'||k==='note'||k==='aj'||k==='pp'||k==='rt'||/^c(w|ay|w7|lab|ang|rt|gv|aj|pp|tx)$/.test(k);
function invShOf(inv){inv=inv||{};const o={};if(inv.all){for(const k in inv.all)if(k in INVD&&!invOwn(k))o[k]=inv.all[k];return o}
  for(const p of ['rcp','buy','ab','sale']){const c=inv[p]||{};for(const k in c)if(k in INVD&&!invOwn(k))o[k]=c[k]}return o}
function invCfg(k){const inv=(cfgRec()||{}).inv||{},c=inv[k]||{},own={};for(const q in c)if(invOwn(q))own[q]=c[q];return invClean({...INVD,...(INVT[k]||{}),...own,...invShOf(inv)})}
/* قالب سند: فروش دارد → اگر همه کالاهای فروخته‌شده آبشده‌اند «آبشده» وگرنه «فروش طلا»؛ فقط خرید → «خرید» (خرید فقط آبشده هم «آبشده»)؛ بدون کالا → «رسید» */
function invProf(t){const its=t.items||[],X=(t.xr||[]).filter(x=>!(x.pv&&x.cat==='مانده قبلی')&&(x.t==='sell'||x.t==='buy')),S=X.filter(x=>x.t==='sell'),B=X.filter(x=>x.t==='buy'),abx=x=>x.a==='gold'&&x.cat==='آبشده';
  if(its.length||S.length)return its.every(i=>i.ab)&&S.every(abx)?'ab':'sale';if(B.length)return B.every(abx)?'ab':'buy';return 'rcp'}
/* همه میلی‌مترها و اندازه قلم‌ها (pt) در k ضرب می‌شوند: فقط داخل <style>، صفت style و اندازه SVGها — نه در نوشته‌ها */
function invScale(h,k){const f=s=>s.replace(/(\d*\.?\d+)(mm|pt)\b/g,(m,n,u)=>(+(n*k).toFixed(3))+u);
  return h.replace(/<style>[\s\S]*?<\/style>/g,f).replace(/ style="[^"]*"/g,f).replace(/ (width|height)="[\d.]+mm"/g,f)}
/* سند نمونه برای پیش‌نمایش صفحه تنظیمات (ذخیره نمی‌شود): با همان ماشین‌حساب‌های خود سند ساخته می‌شود تا عددها واقعی باشند */
function invSample(pf){const M=1e6,rate=10400000,now=new Date(),old=new Date(now-864e5),iso=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()),B='بانک ملت';
  const it=o=>{const c2=itCalc(o,rate,true),J=ajPT(o);return{...o,ajP:J.P,ajT:J.T,gold:c2.gold,ajv:c2.aj,prv:c2.pr,taxv:c2.tax,tot:c2.tot}},xr=o=>{const C=xrCalc(o,rate);return{pul:false,...o,pg:C.pg,n:C.n,q750:o.a==='gold'?C.q:undefined,amount:C.amount,e:C.e,q0:C.q0,ajg:C.ajg,prg:C.prg}};
  const D={sale:{items:[it({k:'انگشتر',w:5.23,ay:750,ajP:12,ajT:0,pp:7}),it({k:'دستبند',w:12.4,ay:750,ajP:0,ajT:3500000,pp:7,n:'نگین‌دار'})],xr:[xr({t:'buy',a:'gold',w:'8.35',ay:735,cat:'متفرقه'})],pays:[{m:'pos',amount:150*M,bk:1,cuName:B},{m:'cash',amount:20*M}],p:[-20*M,12.35]},
    ab:{items:[it({k:'آبشده',w:120.5,ay:750,ab:1,pp:0.5,ajP:0,ajT:0,lab:'ری‌گولد',ang:'778899'}),it({k:'آبشده',w:48.375,ay:750,ab:1,pp:0.5,ajP:0,ajT:0,lab:'رضوی',ang:'4521'})],xr:[],pays:[{m:'hav',amount:1500*M,bk:1,cuName:B,tn:'140511200998877'}],p:[-120*M,0]},
    buy:{items:[],xr:[xr({t:'buy',a:'gold',w:'18.6',ay:735,cat:'متفرقه'}),xr({t:'buy',a:'gold',w:'6.2',ay:705,cat:'متفرقه'})],pays:[{m:'cash',amount:-150*M},{m:'hav',amount:-60*M,bk:1,cuName:B,tn:'88123456'}],p:[0,0]},
    rcp:{items:[],xr:[xr({t:'in',a:'gold',w:'3.2',ay:705,cat:'آبشده'})],pays:[{m:'hav',amount:60*M,bk:1,cuName:B,tn:'88123456'},{m:'cash',amount:15*M}],p:[-200*M,4.5]}}[pf]||{items:[],xr:[],pays:[],p:[0,0]};
  const total=D.items.reduce((s,i)=>s+i.tot,0)+D.xr.reduce((s,x)=>s+(x.t==='sell'?x.amount:x.t==='buy'?-x.amount:0),0),ge=Math.round(D.xr.reduce((s,x)=>s+(x.a==='gold'?+x.e||0:0),0)*1000)/1000;
  const t={id:'smp',type:'inv',no:1001,date:iso(now),rate,mz:Math.round(rate*MZK),items:D.items,xr:D.xr,pays:D.pays,tax:true,disc:0,total,at:now.toISOString(),by:typeof who==='function'?who():''};if(ge)t.ge=ge;
  return{c:{id:'smpc',name:'مشتری نمونه',phone:'09120000000',cno:125,nid:'0012345678',txs:[{id:'smp0',type:'xf',r:D.p[0],g:D.p[1],date:iso(old),at:old.toISOString()},t]},t}}

function invDoc(c,t,o){o=o||{};const PF=o.prof||invProf(t),S=o.S?invClean({...INVD,...(INVT[PF]||{}),...o.S}):invCfg(PF);
  const nl=v=>String(v).replace(/ · (طلبکاریم|بدهکاریم)$/,''),D=dates(t.date),its=t.items||[],xs=t.xr||[],pays=t.pays||[],hMz=+t.mz||(t.rate?Math.round(t.rate*MZK):0),mzOf2=x=>+x.mz||hMz;
  const P=cuBalBefore(c,t),d=txD(t),dX=d.x||{},KO=Object.keys(XA),ko=k=>{const i=KO.indexOf(k);return i<0?99:i};
  const keys=[...new Set([...Object.keys(P.X),...Object.keys(dX)])].filter(k=>Math.round(((P.X[k]||0)+(+dX[k]||0))*100)||+dX[k]||P.X[k]).sort((a,b)=>ko(a)-ko(b));
  const PG=pvGroups(pays,xs),g0=x=>x.a==='gold',un=x=>g0(x)?'گرم':(XA[x.a]||{}).u||'';
  /* واژه‌های دو طرف حساب: از دید مطلا (طلبکاریم/بدهکاریم) یا از دید مشتری (بدهکار/بستانکار) */
  const WR=S.wr==='c'?['تسویه','بدهکار','بستانکار']:['تسویه','طلبکاریم','بدهکاریم'],side=v=>!v?WR[0]:v<0?WR[1]:WR[2],cls=v=>v<0?'vd':v>0?'vc':'vz',nm=v=>'<bdi dir="ltr">'+fmt(Math.abs(Math.round(v)))+'</bdi>',pctT=v=>toFa(String(Math.round(v*100)/100))+'٪';
  /* رنگ‌ها: رنگی (کاغذ کرم یا سفید) یا سیاه‌وسفید برای چاپگر لیزری */
  /* v92.1 (صاحب اپ: «سیاه‌وسفید نمی‌خواهم؛ همان رنگ‌ها، فقط خط‌ها و نوشته‌ها پررنگ‌تر»): طلایی و رنگ‌های برگه می‌مانند ولی پرمایه‌تر؛ خط‌ها ضخیم‌تر (مو .۲۲، کادر .۳، طلایی .۳۵/.۶ میلی‌متر)،
     نوشته پایه نیمه‌ضخیم و برچسب‌ها و واحدها ضخیم. border-box است، پس ضخامت خط ارتفاع ردیف‌ها را عوض نمی‌کند */
  /* v92.0 (گزارش صاحب اپ: «چاپ گرفتم، بعضی جاها خیلی کم‌رنگ است»): نوشته‌های ریز و خط‌های نازک رنگ‌های میانی داشتند که چاپگر سیاه‌وسفید آن‌ها را نقطه‌نقطه و کم‌رنگ می‌زند —
     همه پررنگ‌تر شدند (برچسب‌ها، واحدها، توضیح‌ها، خط‌های جدول)؛ حالت سیاه‌وسفید تقریباً مشکی کامل است */
  const C=S.ink==='m'?{pa:'#fff',ink:'#000',ln:'#000',gd:'#222',gl:'#111',mu:'#2b2b2b',hr:'#777',h2:'#444',ti:'#ececec',rd:'#000',bl:'#000',gn:'#000',t2:'#111'}:{pa:S.bg==='w'?'#fff':'#fbf7ee',ink:'#14110d',ln:'#221d17',gd:'#b27c0e',gl:'#5a3f08',mu:'#3f372e',hr:'#a08552',h2:'#5a5042',ti:'#f1e6c9',rd:'#8f1127',bl:'#17378a',gn:'#12603f',t2:'#2a2520'};
  /* ---- ردیف‌ها در گروه‌ها: s فروش (کالا و فروش طلا/سکه) · b خرید از مشتری · i دریافت از مشتری (پول، تخفیف، طلا/سکه‌ای که بی‌قیمت گرفته‌ایم) ·
     o پرداخت به مشتری · p مانده قبلی که در همین سند ثبت شده · z هر چیز دیگری که مانده تومانی را جابه‌جا کرده (تبدیل قدیمی مانده به طلا).
     هر ردیف: n نام · e جزئیات کنار نام · c خانه‌های ستون‌ها ([خط اول، خط دوم]) · rv نرخ (برای ستون خودکار «نرخ») · av مبلغ تومانی (جمع گروه) ·
     ردیف بی‌قیمت طلا/سکه به‌جای مبلغ می‌گوید در کدام حساب نشسته است ---- */
  /* v92.2 (صاحب اپ: «فاکتور خیلی قاطی‌پاتی است؛ وزن ۷۵۰ را در پرداخت نزده»): طلا و سکه‌ای که بی‌قیمت تحویل داده یا گرفته‌ایم گروه خودشان را دارند
     (u تحویل به مشتری · v دریافت از مشتری) و از دریافت/پرداخت «وجه» جدا هستند؛ ستون آخر هر ردیف طلا همان وزن ۷۵۰ی است که به حساب طلا می‌نشیند */
  const GR={s:[],b:[],u:[],v:[],w:[],i:[],o:[],p:[],z:[]},XP=[],FST={},r3=v=>Math.round(v*1000)/1000;if((t.items||[]).length)FST.s=-1;
  its.forEach(it=>{const J=ajPT(it),ay=+it.ay||750,mz=mzOf2(it),pg=Math.round(mz/MZK*ay/750),ajE=[J.P?toFa(String(J.P))+'٪':'',J.T?fmt(J.T):''].filter(Boolean).join(' + '),ppE=+it.pp&&!(+it.amT>0)?toFa(String(+it.pp))+'٪':'',w7=r3((+it.w||0)*ay/750);
    GR.s.push({wv:+it.w||0,n:esc(it.k+dsP(it)),e:[it.sh===1?'شرطی':''],lab:it.lab?esc(it.lab):'',ang:it.ang?esc(toFa(it.ang)):'',w7d:Math.abs(w7-(+it.w||0))>.0005,rv:S.rt==='g'?pg:mz,am:nm(it.tot),av:+it.tot||0,
      c:{w:[wFmt(it.w)+' <u>گرم</u>'],ay:[toFa(ay)],w7:[wFmt(w7)],rt:[fmt(S.rt==='g'?pg:mz)],gv:[+it.gold?fmt(it.gold):''],
        /* v91.5 (خواسته صاحب اپ): «فقط درصد» — اگر اجرت/سود تومانی وارد شده، درصدش از روی مبلغ طلا حساب می‌شود */
        aj:!ajE&&!+it.ajv?['']:S.aj==='o'?[+it.gold&&+it.ajv?pctT(it.ajv/it.gold*100):ajE]:S.aj==='t'?[+it.ajv?fmt(it.ajv):'']:S.aj==='b'&&J.P&&+it.ajv?[ajE,fmt(it.ajv)]:[ajE],
        pp:S.pp==='o'?[+it.prv&&(+it.gold+(+it.ajv||0))?pctT(it.prv/((+it.gold)+(+it.ajv||0))*100):'']:!ppE?[+it.prv?fmt(it.prv):'']:S.pp==='t'?[+it.prv?fmt(it.prv):'']:S.pp==='b'&&+it.prv?[ppE,fmt(it.prv)]:[ppE],tx:[+it.taxv?fmt(it.taxv):'']}})});
  xs.forEach((x,xi)=>{const g=g0(x),m=x.t==='sell'||x.t==='buy',u=un(x),q=g?(x.n!=null?x.n:x.w):(x.n!=null?x.n:x.q),ay=+x.ay||750,bm=x.t==='buy'&&!x.pul&&x.cat!=='آبشده',rvM=g&&m?(bm?Math.round(mzOf2(x)*ay/750):mzOf2(x)):m&&x.pg?+x.pg:0,rv=S.rt==='g'?(m&&x.pg?+x.pg:0):rvM,pv=PG.sx.has(xi),sd=x.t==='out'?-1:1;
    /* ردیفی که به حساب طلا/سکه می‌نشیند (دریافت/تحویل بی‌قیمت یا «پولی»): کنار نامش گفته می‌شود؛ طلای غیر ۷۵۰ با معادل ۷۵۰ که همان عددِ جدول «حساب مشتری» است */
    const acc='در حساب '+(g?'طلا':(XA[x.a]||{}).k==='c'?'سکه':esc((XA[x.a]||{s:x.a}).s)),wA=g?(x.q750!=null?+x.q750:r3((+q||0)*ay/750)):0,aj=g&&!m&&x.q0!=null,w7=aj?+x.q0:wA,w7d=g&&Math.abs(w7-(+q||0))>.0005,jam=aj?+x.amount||0:0;
    /* v91.7: دریافت/تحویل طلا با اجرت و سود (بدون مظنه): درصدها در ستون خودشان، «با اجرت و سود n گرم ۷۵۰» کنار نام؛ اجرت تومانی در ستون مبلغ */
    const gk=x.t==='sell'?'s':x.t==='buy'?'b':x.t==='in'?'v':'u',gq=g&&!m&&!jam&&!pv;if(!pv&&FST[gk]==null)FST[gk]=xi;
    (pv?XP:GR[gk]).push({xi,sw:dkOfX(x)==='swap',wv:g?+q||0:0,kd:g?'g':(XA[x.a]||{}).k==='c'?'c':'f',g7:g&&!m&&!pv?wA:0,gq,n:esc(nl(xrLab(x))+dsP(x)),sdw:pv?sd:0,e:pv?[]:[x.sh===1?'شرطی':'',x.pz&&+x.cnt?qFmt(x.cnt)+' عدد':'',(m&&x.pul)||jam?acc:''],lab:x.lab?esc(x.lab):'',ang:x.ang?esc(toFa(x.ang)):'',w7d,eqA:!gq&&aj&&Math.abs(wA-w7)>.0005,eq:gq?(aj&&Math.abs(wA-w7)>.0005?'با اجرت و سود ':w7d?'معادل ':'')+wFmt(wA)+' گرم ۷۵۰':aj&&Math.abs(wA-w7)>.0005?'با اجرت و سود '+wFmt(wA)+' گرم ۷۵۰':w7d&&(x.pul||!m)?'معادل '+wFmt(w7)+' گرم ۷۵۰':'',rv,
      c:{w:[(g?wFmt(q):qFmt(q))+' <u>'+esc(u)+'</u>'],ay:[g?toFa(ay):''],w7:[g?wFmt(gq?wA:w7):''],rt:[rv?fmt(rv):''],gv:[''],aj:[aj?[+x.ajP?toFa(String(+x.ajP))+'٪':'',jam?fmt(jam):''].filter(Boolean).join(' + '):''],pp:[aj&&+x.pp?toFa(String(+x.pp))+'٪':''],tx:['']},am:m||jam?nm(x.amount):gq?'—':acc,av:m||jam?+x.amount||0:0,dl:!m&&!jam})});
  let inS=0,outS=0,pvS=0,offR=0;const PY={i:[],o:[]};
  pays.forEach((p,pi)=>{const a=pAmt(p);if(!a)return;if(PG.sp.has(pi)){pvS+=a;GR.p.push({n:esc(nl(pyLab(p,1))),sdw:a,e:[],am:nm(a)});return}
    const k=a>0?'دریافت':'پرداخت',off=p.m==='adj'&&p.why==='تخفیف'||p.m==='off',ds=off?'تخفیف':esc(nl(pyLab(p,1)).replace(/^(دریافت|پرداخت)\s*/,''))||k;if(a>0){inS+=a;if(off)offR=1}else outS-=a;
    PY[a>0?'i':'o'].push({n:ds,py:k,off,e:[S.tn&&p.tn?'پیگیری '+esc(toFa(p.tn)):''],am:nm(a),av:Math.abs(a)})});
  const disc=+t.disc||0;if(disc){PY.i.push({n:'تخفیف',py:'دریافت',off:1,e:[],am:nm(disc),av:disc});offR=1}
  /* «ردیف‌های دریافت و پرداخت» خاموش: پول‌های هر گروه یک ردیف می‌شوند (نوع‌ها کنار نام) */
  for(const k of ['i','o']){const L=PY[k];if(S.py||L.length<2)GR[k].push(...L);else{const sm=L.reduce((s,r)=>s+r.av,0);GR[k].push({n:(k==='i'?'دریافت':'پرداخت')+' · '+toFa(L.length)+' فقره',py:'',e:[[...new Set(L.map(r=>r.n.replace(/ · .*$/,'')))].slice(0,5).join('، ')],am:nm(sm),av:sm,off:L.every(r=>r.off)})}}
  GR.p.push(...XP);
  const sum=k=>GR[k].reduce((s,r)=>s+(r.av||0),0),sold=sum('s'),bought=sum('b'),gc=t.gc||{},gcr=+gc.r||0,N=-Math.round(d.r),oth=N-(sold-bought-sum('i')-sum('v')+sum('o')+sum('u')-pvS);
  if(gcr)GR.z.push({n:'تبدیل مانده به طلا',e:[],c:{w:[wFmt(+gc.g||0)+' <u>گرم</u>']},am:nm(gcr)});if(Math.round(oth+gcr))GR.z.push({n:'سایر (اصلاح)',e:[],am:nm(oth+gcr)});
  /* v94.7 (خواسته صاحب اپ: «تعویض در سند تعویض بخورد»): گروه خرید وقتی همه ردیف‌هایش تعویض است «تعویض از مشتری» نام می‌گیرد (جمع و فرمول هم «تعویض»)؛ قاطی = «خرید و تعویض از مشتری» */
  const swA=GR.b.length>0&&GR.b.every(r=>r.sw),swS=GR.b.some(r=>r.sw),bW=swA?'تعویض':'خرید',bCap=swA?'تعویض از مشتری':swS?'خرید و تعویض از مشتری':'خرید از مشتری';
  const hasS=GR.s.length>0,hasB=GR.b.length>0,goods=hasS||hasB,inL=GR.i.length+GR.v.length,outL=GR.o.length+GR.u.length,io=inL+outL>0,docN=goods?'فاکتور':io?'رسید':'سند';
  const TT0=hasS?['فاکتور','فروش']:hasB?['فاکتور','خرید']:inL&&!outL?['رسید','دریافت']:outL&&!inL?['رسید','پرداخت']:io&&inS>outS?['رسید','دریافت']:io&&outS>inS?['رسید','پرداخت']:['صورت','حساب'],TTL=S.ttl?S.ttl.split(' ').filter(Boolean):TT0;
  const onlyOff=GR.i.length>0&&GR.i.every(r=>r.off);
  /* نام گروه طلا/سکه از روی خود ردیف‌ها؛ اگر سند هم طلا و هم پول جابه‌جا کرده، گروه پول «وجه» نام می‌گیرد تا با طلا قاطی نشود.
     گروه‌های کالا به ترتیب ثبت در سند می‌آیند (مثلاً تحویل طلا، دریافت طلا، بعد فروش پولی مانده) و گروه‌های پول بعد از آن‌ها */
  /* یکی‌شدن فقط وقتی هر طرف یک ردیف دارد؛ با ردیف‌های بیشتر هر طرف گروه و «جمع» خودش را می‌گیرد تا وزن ۷۵۰ هر طرف زیر ستونش جمع شود */if(GR.u.length===1&&GR.v.length===1){GR.w=[...GR.u,...GR.v].sort((a,b)=>a.xi-b.xi);FST.w=Math.min(FST.u,FST.v)}
  const kdL=k=>{const K=new Set(GR[k].map(r=>r.kd));return [K.has('g')?'طلا':'',K.has('c')?'سکه':'',K.has('f')?'ارز':''].filter(Boolean).join(' و ')||'طلا'},gdx=GR.u.length+GR.v.length>0,vj=gdx?'وجه ':'';
  const GM=[...[['s','فروش به مشتری'],['b',bCap],...(GR.w.length?[['w','تحویل و دریافت '+kdL('w')]]:[['u','تحویل '+kdL('u')+' به مشتری'],['v','دریافت '+kdL('v')+' از مشتری']])].sort((a,b)=>(FST[a[0]]==null?1e9:FST[a[0]])-(FST[b[0]]==null?1e9:FST[b[0]])),['i',onlyOff?'تخفیف':'دریافت '+vj+'از مشتری'+(offR?' و تخفیف':'')],['o','پرداخت '+vj+'به مشتری'],['p','مانده قبلی (ثبت در این '+docN+')'],['z','تبدیل و اصلاح']].filter(g=>GR[g[0]].length);
  const ALLR=GM.flatMap(g=>GR[g[0]]),caps=S.cap==='y'?GM.length>0:S.cap==='n'?false:GM.length>1;
  /* «این فاکتور» چطور به دست آمده، با کلمه (جمع هر گروه روی نوار همان گروه نوشته شده): مثبت‌ها اول؛ اگر با این سند ما بدهکار می‌شویم از همان دید */
  const kf=N<0?-1:1,TM=[['فروش',sold],[bW,-bought],[onlyOff?'تخفیف':'دریافت',-sum('i')],['پرداخت',sum('o')],['اجرت تحویل',sum('u')],['اجرت دریافت',-sum('v')],['مانده ثبت‌شده',-pvS],[gcr?'تبدیل':'اصلاح',oth]].map(([l,v])=>[l,Math.round(v)*kf]).filter(x=>x[1]).sort((a,b)=>(b[1]>0)-(a[1]>0));
  const FM=TM.length>1?TM.map(([l,v],i)=>(i?(v<0?' − ':' + '):(v<0?'− ':''))+l).join(''):'';
  /* ---- مانده‌ها. هر نوع: [مانده قبلی، این سند، مانده نهایی]؛ «این سند» = نهایی − قبلی بعد از گرد کردن، تا سه عددی که چاپ می‌شود دقیقاً با هم بخواند.
     اعشار هر ستون یکدست است (به اندازه‌ای که لازم دارد) تا ممیزها زیر هم بیفتند. طلا: همیشه / فقط وقتی مانده دارد / هرگز؛ سکه و ارز: خودکار / هرگز ---- */
  const KD=[['g','طلا','گرم',3,P.G,d.g],...(S.ax==='n'?[]:keys).map(k=>{const a=XA[k]||{};return [k,a.t||k,a.k==='f'?'':a.u||'',2,P.X[k]||0,+dX[k]||0]}),['r','تومان','',0,P.R,d.r]].map(([k,h,u,mx,p0,d0])=>{const q=10**mx,rd=v=>Math.round(v*q)/q,p=rd(p0),f=rd(p0+d0),dd=rd(f-p),dp=Math.min(mx,Math.max(...[p,dd,f].map(v=>(String(Math.abs(v)).split('.')[1]||'').length)));
    return {k,h,u,v:[p,dd,f],mv:k==='r'?!!(its.length||pays.some(pAmt)||xs.some(x=>+x.amount)||disc||gcr):xs.some(x=>(k==='g'?x.a==='gold':x.a===k)&&(x.pul||x.t==='in'||x.t==='out'))||(k==='g'&&!!gcr),F:v=>toFa(Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:dp,maximumFractionDigits:dp}))}}).filter(K=>K.k!=='g'||S.ag==='y'||(S.ag==='a'&&(K.v.some(Boolean)||K.mv)));
  /* ---- ستون‌ها. هر ستون: خودکار (فقط وقتی داده دارد؛ «نرخ» وقتی ردیفی نرخی جز نرخ بالای برگه دارد، «وزن ۷۵۰» وقتی طلای غیر ۷۵۰ هست) / همیشه / هرگز.
     پهنای هر ستون از بلندترین نوشته‌اش؛ اگر برای نام کالا جا نماند اول ستون‌های خودکارِ کم‌اهمیت‌تر کنار می‌روند و بعد قلم جدول یک پله ریز می‌شود ---- */
  const hRt=S.rt==='g'?+t.rate||0:hMz,has=f=>f==='rt'?ALLR.some(r=>r.rv&&r.rv!==hRt):f==='w7'?ALLR.some(r=>r.w7d):ALLR.some(r=>r.c&&r.c[f]&&r.c[f][0]);
  ALLR.forEach(r=>{r.c=r.c||{};r.c.lab=[r.lab||''];r.c.ang=[r.ang||'']});
  let UC=INVCOL.map(x=>x[0]).filter(f=>S['c'+f]==='y'||(S['c'+f]==='a'&&has(f))),fz=1+S.fs*.08;
  /* v92.3 (خواسته صاحب اپ: «در مبلغ به تومان وزن ۷۵۰ نیاید؛ ستون وزن داشته باشد که مانده زیرش نوشته شود»): سندی که طلای بی‌قیمت تحویل/دریافت دارد (G7)
     همیشه ستون «وزن ۷۵۰» دارد، آخرین ستون پیش از مبلغ؛ ستون طلای «حساب مشتری» هم کنار تومان می‌آید و (اگر جا باشد) عددش درست زیر عددهای همین ستون می‌افتد (G7A) */
  const G7=ALLR.some(r=>r.gq);if(G7){UC=UC.filter(f=>f!=='w7');UC.push('w7');const i=KD.findIndex(K=>K.k==='g');if(i>=0&&i<KD.length-2)KD.splice(KD.length-2,0,KD.splice(i,1)[0])}
  const tw=s=>{let w=0;for(const ch of String(s||'').replace(/<[^>]+>/g,''))w+=/[۰-۹0-9]/.test(ch)?1.95:/[,٬٫.·\s]/.test(ch)?.95:/[٪+]/.test(ch)?2.5:1.35;return w};
  const nW=(s,pt)=>{let w=0;for(const ch of String(s))w+=/[۰-۹]/.test(ch)?2.05:1.05;return w*pt/8.9},KR=KD[KD.length-1],fT=KR.F(KR.v[2]);
  const HN=Object.fromEntries(INVCOL);HN.rt=S.rt==='g'?'فی هر گرم':'نرخ';
  let CW,AMW,FPT,NMW,KW;const TBW=185.6,MN={w:19,ay:10.5,w7:15,lab:17,ang:13,rt:21,gv:22,aj:13,pp:10.5,tx:16},MX={w:30,ay:13,w7:24,lab:34,ang:26,rt:31,gv:34,aj:34,pp:24,tx:31};
  const lay=()=>{CW={};UC.forEach(f=>{const m=Math.max(tw(HN[f])*.8,...ALLR.map(r=>{const v=(r.c&&r.c[f])||[];return Math.max(tw(v[0]),v[1]?tw(v[1])*.8:0)}),...(f==='w'&&S.sum?[...'sbiouv'].map(k=>{const w=(GR[k]||[]).reduce((a,r)=>a+(r.wv||0),0);return w?tw(wFmt(Math.round(w*1000)/1000)+' گرم')*1.1:0}):f==='w7'&&G7?['u','v'].map(k=>{const w=GR[k].reduce((a,r)=>a+(r.g7||0),0);return w?tw(wFmt(r3(w)))*1.1:0}):[]));CW[f]=Math.min(MX[f]*fz,Math.max(MN[f]*Math.min(1,fz),Math.ceil((m*fz+4.4)*2)/2))});
    /* ستون مبلغ (و ستون تومانِ «حساب مشتری» که درست زیر آن است) به اندازه بلندترین عدد؛ مانده نهایی درشت نوشته می‌شود و اگر خیلی بلند باشد یک پله ریزتر */
    FPT=([12.2,11,10,9].find(pt=>nW(fT,pt*fz)<=37.4)||8.4)*fz;AMW=Math.min(41,Math.max(30,Math.ceil(Math.max(S.acc?nW(fT,FPT):0,...[...ALLR.map(r=>r.av||0),...GM.map(g=>sum(g[0])),S.acc?KR.v[0]:0,S.acc?KR.v[1]:0,gcr,oth+gcr,pvS].map(v=>nW(fmt(Math.abs(Math.round(v))),8.9*fz)))+3.6)));
    KW=+(8*Math.max(1,fz)).toFixed(1);NMW=TBW-KW-AMW-UC.reduce((s,f)=>s+CW[f],0)};
  /* کمترین پهنای ستون «شرح»: به اندازه بلندترین نام (۲۴ تا ۴۰ میلی‌متر) — برگه آبشده با نام‌های کوتاه جای ستون بیشتری دارد */
  const NMIN=Math.min(40,Math.max(24,Math.ceil(Math.max(0,...ALLR.map(r=>tw(r.n)))*1.12+6)));
  /* جا نشد: ۱) ستون‌های اضافه‌ی خودکار کنار می‌روند ۲) قلم جدول تا ۸۰٪ ریز می‌شود ۳) آخرین چاره: ستون‌های اضافه‌ای که «همیشه» خواسته شده‌اند و بعد مالیات، سود، اجرت، نرخ، عیار (وزن هیچ‌وقت) */
  const XTR=['gv','w7','ang','lab'].filter(f=>!(G7&&f==='w7')),LST=['gv','w7','ang','lab','tx','pp','aj','rt','ay'].filter(f=>!(G7&&f==='w7'));
  lay();for(let g=0;g<40&&NMW<NMIN*Math.min(1,fz);g++){const dr=XTR.find(x=>UC.includes(x)&&S['c'+x]==='a');if(dr)UC=UC.filter(y=>y!==dr);else if(fz>.8)fz=Math.round((fz-.05)*100)/100;else{const d2=LST.find(x=>UC.includes(x));if(!d2)break;UC=UC.filter(y=>y!==d2)}lay()}
  const z=n=>+(n*fz).toFixed(2),cs=f=>` style="width:${CW[f]}mm"`;
  /* ارتفاع‌ها: ردیف یک‌خطی، ردیف دوخطی (درصد و مبلغ زیرش)، نوار گروه، سرستون */
  let RH=Math.max(S.rh,+(4.7*fz).toFixed(1)),RH2=+Math.max(RH*1.36,7.3*fz).toFixed(1),CAPH=+Math.max(4.6,4.6*fz).toFixed(1);const HEADH=+Math.max(5.6,5.4*fz).toFixed(1);
  ALLR.forEach(r=>{const E=(r.e||[]).filter(Boolean);if(S.ex){if(r.lab&&!UC.includes('lab'))E.push('آزمایشگاه '+r.lab);if(r.ang&&!UC.includes('ang'))E.push('انگ '+r.ang);if(r.eq&&(r.eqA||!UC.includes('w7')))E.push(r.eq)}else if(r.gq&&!UC.includes('w7'))E.push(r.eq);
    r.x=(r.sdw?`<em class="${cls(r.sdw)}">${side(r.sdw)}</em>`:'')+((S.ex||r.py!=null)?E.join(' · '):(r.e||[]).filter(v=>/^در حساب /.test(v)).join(' · '));r.full=UC.some(f=>r.c[f]&&r.c[f][0]);r.two=UC.some(f=>r.c[f]&&r.c[f][1])});
  const cell=(r,f)=>{const v=r.c[f]||[];return v[1]?`<span class="d"${cs(f)}><b>${v[0]}</b><i>${v[1]}</i></span>`:`<span${f==='w7'&&G7?' class="c7"':''}${cs(f)}>${v[0]||''}</span>`};
  const row=(r,i,pre)=>`<div class="r${r.two?' t2':''}"><span class="k">${toFa(i+1)}</span><span class="nm${r.two&&r.x?' d':''}"><b>${pre||''}${r.n}</b>${r.x?` <i>${r.x}</i>`:''}</span>${r.full?UC.map(f=>cell(r,f)).join(''):''}<span class="am${r.dl?' dl':''}">${r.am}</span></div>`;
  const DIA='<svg class="dia" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="1.7mm" height="1.7mm"><path d="M5 0L10 5L5 10L0 5Z"/></svg>';
  const capR=tx=>`<div class="r cp"><span class="ct">${DIA}${tx}</span></div>`;
  /* v91.5 (خواسته صاحب اپ: «جمع وزن و مبلغ هر قسمت زیر ردیف‌ها که تمام می‌شود، در یک کادر»): ردیف جمع در پایان هر گروه — وزن طلا در ستون وزن، مبلغ در ستون مبلغ */
  let SMH=+(RH+.8).toFixed(1);const g7S=k=>r3(GR[k].reduce((a,r)=>a+(r.g7||0),0)),smR=(k,lab)=>{const L=GR[k],w=Math.round(L.reduce((a,r)=>a+(r.wv||0),0)*1000)/1000,g7=g7S(k),c7=UC.includes('w7');return `<div class="r sm"><span class="k"></span><span class="nm"><b>جمع ${lab}</b>${g7&&!c7?` <i>${wFmt(g7)} گرم ۷۵۰ در حساب طلا</i>`:''}</span>${UC.map(f=>`<span${f==='w7'&&G7?' class="c7"':''}${cs(f)}>${f==='w'&&w?wFmt(w)+' <u>گرم</u>':f==='w7'&&g7&&G7?wFmt(g7):''}</span>`).join('')}<span class="am${sum(k)?'':' dl'}">${sum(k)?nm(sum(k)):'—'}</span></div>`};
  /* فضای خالی زیر ردیف‌ها: ساده / ادامه خط ستون‌ها / ردیف‌های خالی خط‌کشی‌شده (شکل فرم) */
  const fillR=h=>{if(h<=.05)return '';if(S.fill==='l')return `<div class="r fl" style="height:${h.toFixed(2)}mm">${ecell}</div>`;if(S.fill==='r')return `<div class="r er">${ecell}</div>`.repeat(Math.round(h/RH));return `<div class="fl" style="height:${h.toFixed(2)}mm"></div>`};
  /* ---- جدول «حساب مشتری». خانه = [طرف حساب][عدد در جعبه هم‌پهنا]، چسبیده به لبه چپ خانه تا یکان‌ها زیر هم بیفتند. صفر = خط تیره کم‌رنگ؛ مانده نهایی صفر (و «این سند» که ردیف داشته ولی سربه‌سر شده) = «تسویه».
     حالت معمول (تا پنج ستون، اگر جا شود): ستون = نوع مانده، سطر = قبلی/این سند/نهایی و سطر نهایی درشت. وگرنه چرخیده: سطر = نوع مانده. سطرهای «مانده قبلی» و «این فاکتور» را می‌شود خاموش کرد ---- */
  const GP=1.2,LGH=S.acc&&S.lg?3.6:0,RJ=[0,1,2].filter(j=>j===2||(j?S.ad:S.ap));let fa=fz,SB,AH,AR,AF,LB,wide,LBX,NBT,CWT,LBT,FPA;
  /* قلم جدول حساب (fa) از قلم ردیف‌ها جداست: جدول چرخیده با عددهای خیلی بلند ریزتر می‌شود تا برای نام مانده‌ها جا بماند */
  const acLay=()=>{const m=Math.max(1,fa);SB=+(12.8*m).toFixed(1);AH=+Math.max(5.2,5*fa).toFixed(1);AR=+Math.max(4.8,4.6*fa).toFixed(1);AF=+Math.max(8,7.6*fa).toFixed(1);FPA=FPT*fa/fz;
    KD.forEach(K=>{K.nb=K.k==='r'?AMW-3.15:Math.ceil((Math.max(...RJ.map(j=>nW(K.F(K.v[j]),j===2?FPA:8.9*fa)))+.8)*2)/2;K.w=K.k==='r'?AMW+SB+GP+.2:Math.max(27,Math.ceil(tw(K.h+(K.u?' '+K.u:''))*.8*fa+4),K.nb+SB+GP+3.4)});
    LB=TBW-KD.reduce((s,K)=>s+K.w,0);wide=fa===fz&&KD.length<=5&&LB>=36*m;LBX=S.an&&LB>=70*m;
    NBT=[0,1,2].map(j=>Math.max(0,...KD.map(K=>Math.ceil((nW(K.F(K.v[j]),(j===2?9.8:8.9)*fa)+.8)*2)/2)));CWT=NBT.map((n,j)=>Math.max(j===2?31:25,n+SB+GP+3.4));LBT=TBW-RJ.reduce((s,j)=>s+CWT[j],0)};
  acLay();for(let g=0;g<8&&!wide&&LBT<31*Math.max(1,fa)&&fa>.72;g++){fa=Math.round((fa-.06)*100)/100;acLay()}
  /* ستون طلای «حساب مشتری» درست زیر ستون «وزن ۷۵۰» (مثل تومان که زیر مبلغ است): ستون وزن ۷۵۰ به پهنای همان خانه می‌شود اگر برای نام کالا جا بماند */
  let G7A=0;if(G7&&S.acc&&wide&&UC[UC.length-1]==='w7'){const Kg=KD.find(K=>K.k==='g'),Kr=KD[KD.length-1];if(Kg&&KD[KD.length-2]===Kg){const off=Kr.w-AMW+3.2,need=+(off+Kg.nb).toFixed(2),d=need-CW.w7;
      if(d>0){if(NMW-d>=NMIN*Math.min(1,fz)){NMW-=d;CW.w7=need;G7A=1}}
      else{/* ستون وزن ۷۵۰ از خانه مانده پهن‌تر است: جعبه عدد مانده طلا پهن می‌شود تا لبه راستش زیر همان عددها بیفتد */const nb=+(CW.w7-off).toFixed(2),w=Math.max(Kg.w,nb+SB+GP+3.4),lb=LB-(w-Kg.w);if(lb>=36*Math.max(1,fa)){Kg.nb=nb;Kg.w=w;LB=lb;LBX=S.an&&LB>=70*Math.max(1,fa);G7A=1}}}}
  const headR=`<div class="r h"><span class="k">ردیف</span><span class="nm">شرح</span>${UC.map(f=>`<span${cs(f)}>${HN[f]}</span>`).join('')}<span class="am">مبلغ (تومان)</span></div>`,ecell=`<span class="k"></span><span class="nm"></span>${UC.map(f=>`<span${cs(f)}></span>`).join('')}<span class="am"></span>`;
  const za=n=>+(n*fa).toFixed(2);
  const acell=(K,j,w,nb,fin)=>{const v=K.v[j];return `<span class="av${fin?' fn':''}${v?'':' c'}" style="width:${w}mm">${v?`<em class="${cls(v)}">${side(v)}</em><b class="${cls(v)}" style="width:${nb}mm"><bdi dir="ltr">${K.F(v)}</bdi></b>`:fin||(j===1&&K.mv)?`<em class="vz st">${WR[0]}</em>`:'<b class="z">—</b>'}</span>`};
  const kh=K=>esc(K.h)+(K.u?` <u>${esc(K.u)}</u>`:''),RL=[['مانده قبلی','پیش از این '+docN],['این '+docN,FM||'حاصل ردیف‌های همین '+docN],['مانده نهایی حساب',RJ.length>2?'مانده قبلی و این '+docN+' با هم':'']];
  const AC=!S.acc?'':wide?`<div class="ac"><div class="a ah"><span class="al">${DIA}حساب مشتری</span>${KD.map(K=>`<span style="width:${K.w}mm">${kh(K)}</span>`).join('')}</div>${RJ.map(j=>`<div class="a ${j<2?'ar':'af'}"><span class="al"><b>${RL[j][0]}</b>${LBX&&RL[j][1]?` <i>${RL[j][1]}</i>`:''}</span>${KD.map(K=>acell(K,j,K.w,K.nb,j===2)).join('')}</div>`).join('')}</div>`
    :`<div class="ac tp"><div class="a ah"><span class="al">${DIA}حساب مشتری</span>${RJ.map(j=>`<span${j===2?' class="fn"':''} style="width:${CWT[j]}mm">${RL[j][0]}</span>`).join('')}</div>${KD.map(K=>`<div class="a ar"><span class="al"><b>${kh(K)}</b></span>${RJ.map(j=>acell(K,j,CWT[j],NBT[j],j===2)).join('')}</div>`).join('')}</div>`;
  /* v91.7 (خواسته صاحب اپ: «حساب مشتری از جزئیات فاکتور جدا شود»): جدول حساب مشتری کادر خودش را دارد، با فاصله زیر کادر ردیف‌ها (ACG فاصله + دو خط کادر) */
  const ACG=1.8,ACH=!S.acc?0:ACG+.4+AH+(wide?AR*(RJ.length-1)+AF:AR*KD.length),HB=ACH+LGH;
  const LGD=!LGH?'':!KD.some(K=>RJ.some(j=>K.v[j]))?'<div class="lgd"></div>':`<div class="lgd"><em class="vd">${WR[1]}</em> یعنی مشتری به مطلا بدهکار است<s>·</s><em class="vc">${WR[2]}</em> یعنی ${S.wr==='c'?'مشتری از مطلا طلبکار است':'مطلا به مشتری بدهکار است'}</div>`;
  /* ---- اندازه تکه‌های برگه: سربرگ کوتاه‌تر وقتی نه لوگو هست نه خوشنویسی؛ پانویس به اندازه چیزهایی که روشن است؛ هر چه آزاد شود به قاب ردیف‌ها می‌رسد ---- */
  const shop=(cfgRec()||{}).shop||{},shopL=[[shop.nm],[shop.ad],[shop.tel&&toFa(shop.tel),1],[shop.ig,1]].map(([v,l])=>[clean(v||''),l]).filter(x=>x[0]).map(([v,l])=>l?'<bdi dir="ltr">'+esc(v)+'</bdi>':esc(v)).join('<s>·</s>');
  const calOK=S.cal&&TTL.length>0&&TTL.every(w=>INVCAL[w]),HDH=S.lp!=='n'||calOK?17:13.4,FTH=S.th?10.4:S.sgc||S.sgs||S.shp?5.6:0,NL=S.note?(tw(S.note)*.74>176?2:1):0,NTH=NL?NL*3.4+.8:0,/* v97.5: کاغذ ۲۱×۱۴ سانت (دسته‌فاکتور) — همان برگه، ۸ میلی‌متر کوتاه‌تر؛ فقط جای ردیف‌ها کم می‌شود */XH=S.paper==='b14'?8:0,ZN=+(117.2-XH-HDH-(FTH?1.2+FTH:0)-NTH).toFixed(2);
  /* ---- چیدن برگه‌ها: نوار و اولین ردیفش از هم جدا نمی‌شوند؛ ردیف آخر باید با «حساب مشتری» در یک برگه جا شود ---- */
  const LNS=[];let rn=0;GM.forEach(([k,cap])=>{GR[k].forEach((r,i)=>LNS.push({r,i:caps?i:rn++,gi:i,cap:caps?cap:'',pre:!caps&&GM.length>1&&r.py?r.py+' · ':''}));if(S.sum&&'sbiouv'.includes(k)&&(GR[k].filter(y=>y.av).length>1||('uv'.includes(k)&&GR[k].filter(y=>y.g7).length>1)))LNS.push({smk:k,lab:{s:'فروش',b:bW,i:'دریافت',o:'پرداخت',u:'تحویل '+kdL('u'),v:'دریافت '+kdL('v')}[k],cap:caps?cap:''})});
  /* v92.2: اگر سند فقط کمی از یک برگه بیشتر است (تا حدود ۱۴٪)، ردیف‌ها و نوارها کمی کوتاه‌تر می‌شوند تا همه‌چیز در همان یک برگه بماند —
     به‌جای برگه دومی که فقط «جمع» و «حساب مشتری» دارد. قلم‌ها عوض نمی‌شوند؛ کف ارتفاع ردیف همان کمینه خوانا است */
  {const meas=()=>{let h=HEADH,lc='';for(const L of LNS){if(L.smk){h+=SMH;continue}if(L.cap&&L.cap!==lc){h+=CAPH;lc=L.cap}h+=L.r.two?RH2:RH}return h};const room=ZN-.4-HB,t0=meas();
    if(t0>room+.01&&t0-HEADH>0){const q=(room-HEADH)/(t0-HEADH);if(q>=.86){const fl=v=>Math.floor(v*q*10)/10,mn=+(4.6*Math.max(1,fz)).toFixed(1),r0=RH,r2=RH2,c0=CAPH,s0=SMH;
      RH=Math.max(mn,fl(RH));RH2=Math.max(+(mn*1.3).toFixed(1),fl(RH2));CAPH=Math.max(3.9,fl(CAPH));SMH=+(RH+.8).toFixed(1);if(meas()>room+.01){RH=r0;RH2=r2;CAPH=c0;SMH=s0}}}}
  const SH=[];let cur={H:[],h:HEADH},lastCap='';
  LNS.forEach((L,k)=>{if(L.smk){const room=ZN-.4-(k===LNS.length-1?HB:0);if(cur.H.length&&cur.h+SMH>room+.01){SH.push(cur);cur={H:[],h:HEADH};lastCap=''}cur.H.push(smR(L.smk,L.lab));cur.h+=SMH;return}
    const rh=L.r.two?RH2:RH,need=(L.cap&&L.cap!==lastCap?CAPH:0)+rh,room=ZN-.4-(k===LNS.length-1?HB:0);
    if(cur.H.length&&cur.h+need>room+.01){SH.push(cur);cur={H:[],h:HEADH};lastCap=''}
    if(L.cap&&L.cap!==lastCap){cur.H.push(capR(L.cap+(L.gi?' (ادامه)':'')));cur.h+=CAPH;lastCap=L.cap}
    cur.H.push(row(L.r,L.i,L.pre));cur.h+=rh});
  if(cur.h+HB>ZN-.4+.01&&cur.H.length){SH.push(cur);cur={H:[],h:HEADH}}
  SH.push(cur);const NP=SH.length;
  /* ---- سربرگ و نوار مشتری ---- */
  const ttlH=calOK?Math.min(16,+(16*(S.lp==='r'?62:68)/invCalW(TTL,16,TTL[0]==='صورت'?110:230)).toFixed(2)):0;
  const TT=calOK?invCal(TTL,ttlH,TTL[0]==='صورت'?110:230):`<b class="tp${TTL.join(' ').length>14?' sm':''}">${esc(TTL.join(' '))}</b>`,LG=S.lp==='n'?'':'<span class="lg" role="img" aria-label="طلای مطلا"></span>',cn=S.cn&&typeof cnOf==='function'?cnOf(c,t):null;
  const CUN=(c.title?c.title+' ':'')+cuName(c),cuX=[S.cno&&c.cno?`<span class="ph">شماره ${toFa(c.cno)}</span>`:'',S.ph&&c.phone?`<span class="ph"><bdi dir="ltr">${esc(toFa(c.phone))}</bdi></span>`:'',S.nid&&c.nid?`<span class="ph">کد ملی <bdi dir="ltr">${esc(toFa(c.nid))}</bdi></span>`:''].join('');
  const RT=t.rate&&(S.mz||S.g18)?`<div class="f rt">${S.mz?`<small>مظنه روز</small><b>${fmt(hMz)}</b>`:''}${S.g18?`<small${S.mz?' class="s2"':''}>هر گرم ۱۸ عیار</small><b>${fmt(t.rate)}</b>`:''}</div>`:'';
  const cuAv=184-13-(S.cno&&c.cno?17:0)-(S.ph&&c.phone?27:0)-(S.nid&&c.nid?34:0)-(RT?(S.mz?41:0)+(S.g18?46:0)+6:0),cuW=tw(CUN)*1.22,cuC=cuW<=cuAv?'':cuW*.87<=cuAv?' class="l1"':' class="l2"';
  const CP=S.paper==='a42'||S.copy?['نسخه مشتری','نسخه فروشگاه']:[''];
  const pg=(s,si,cp)=>{const last=si===NP-1;let HT=last?ZN-LGH:ZN,FL=HT-.4-s.h-(last?ACH:0);if(S.fill==='r'){const n=Math.max(0,Math.floor((FL+.01)/RH));HT-=Math.max(0,FL-n*RH);FL=n*RH}else if(FL<3){HT-=Math.max(0,FL);FL=0}
    const sub=[NP>1?`برگه ${toFa(si+1)} از ${toFa(NP)}`:'',cp,cn?`سند ${toFa(cn)} مشتری`:''].filter(Boolean).join(' · ');
    return `<div class="pg"><div class="f1"><div class="f2"><div class="f3">
<div class="hd${S.lp==='r'?' lr':''}">${S.lp==='r'?LG:''}<div class="ttl">${TT}</div>${S.lp==='c'?LG:''}<div class="mt"><div class="mr"><small>شماره</small><b>${toFa(t.no)}</b></div><div class="mr"><small>تاریخ</small><b>${esc((S.wd&&D.wd?D.wd+' ':'')+D.fa)}</b></div>${sub?`<span class="pgn">${sub}</span>`:''}</div></div>
<div class="cu"><div class="f"><small>مشتری</small><b${cuC}>${esc(CUN)}</b>${cuX}</div>${RT}</div>
<div class="zn"><div class="tb" style="height:${(HT-(last?ACH:0)).toFixed(2)}mm">${headR}${s.H.join('')}${fillR(FL)}</div>${last&&AC?`<div class="acw">${AC}</div>`:''}${last?LGD:''}</div>
${NL?`<div class="nt${NL>1?' n2':''}">${esc(S.note)}</div>`:''}${FTH?`<div class="ft">${last&&S.sgc?`<div class="sg">امضای مشتری</div>`:'<div class="sg0"></div>'}<div class="mid">${last?(S.th?invCal(['با','سپاس','از','اعتماد','شما'],7.4,200):''):`<span class="nx">ادامه در برگه بعد</span>`}${S.shp?`<small>${shopL||'طلا و جواهر مطلا'}</small>`:''}</div>${last&&S.sgs?`<div class="sg">مهر و امضای فروشنده${S.by&&t.by?' · '+esc(t.by):''}</div>`:'<div class="sg0"></div>'}</div>`:''}
</div></div></div></div>`};
  let body=S.paper==='a42'?SH.map((s,si)=>`<section class="sht">${pg(s,si,CP[0])}${pg(s,si,CP[1])}</section>`).join(''):CP.map(cp=>SH.map((s,si)=>`<section class="sht">${pg(s,si,cp)}</section>`).join('')).join('');
  let css=`*{box-sizing:border-box}html,body{margin:0;padding:0;-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{font-family:Vazirmatn,Tahoma,sans-serif;font-weight:500;color:${C.ink};font-size:8.4pt;font-weight:400;line-height:1.3;direction:rtl;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"tnum"}
u,em,i,s{text-decoration:none;font-style:normal}
.pg{width:210mm;height:${S.paper==='a42'?148.5:148-XH}mm;padding:5mm;background:${C.pa};overflow:hidden}.pg+.pg{border-top:.25mm dashed ${C.h2}}
.f1{height:${138-XH}mm;border:.2mm solid ${S.frame==='n'?'transparent':C.ln};padding:.35mm}.f2{height:${+(136.9-XH).toFixed(1)}mm;border:.65mm solid ${S.frame==='g'?C.gd:'transparent'};padding:.35mm}.f3{height:${+(134.9-XH).toFixed(1)}mm;border:.2mm solid ${S.frame==='g'?C.ln:'transparent'};padding:2.6mm 5.25mm 0;overflow:hidden}
.hd{height:${HDH}mm;display:flex;align-items:center}.hd>div{flex:1 1 0;min-width:0}.hd .ttl{display:flex;align-items:center}.hd.lr .ttl{justify-content:center}.cal{display:block;flex:none;fill:${C.ink}}
.hd .tp{font-size:${HDH<17?15:19}pt;font-weight:800;white-space:nowrap;line-height:1.2}.hd .tp.sm{font-size:${HDH<17?12.5:14.5}pt}
.hd .lg{flex:0 0 37mm;height:15.6mm;background:url(logo-stamp.png) center/contain no-repeat}.hd.lr .lg{flex:0 0 36mm;background-position:right center}.hd.lr .mt{flex:0 0 47mm}.hd.lr .ttl{padding-inline-start:11mm}
.hd .mt{display:flex;flex-direction:column;align-items:flex-end}.mr{width:47mm;height:${HDH<17?5:6.1}mm;display:flex;align-items:baseline;border-bottom:.22mm solid ${C.h2};padding:0 .8mm}.mr+.mr{margin-top:${HDH<17?.2:.5}mm}.mr small{flex:none;font-size:6.6pt;font-weight:700;color:${C.gl}}.mr b{flex:1;text-align:center;font-size:${HDH<17?9:10}pt;font-weight:700;line-height:${HDH<17?4.6:5.6}mm;white-space:nowrap}.pgn{font-size:${HDH<17?5.4:6}pt;color:${C.mu};line-height:${HDH<17?2.1:2.8}mm;margin-top:.3mm;white-space:nowrap}
.cu{height:8.6mm;margin-top:1.4mm;display:flex;align-items:center;justify-content:space-between;border-top:.35mm solid ${C.gd};border-bottom:.35mm solid ${C.gd};padding:0 1mm}
.cu .f{display:flex;align-items:baseline;min-width:0}.cu small{flex:none;font-size:6.6pt;font-weight:700;color:${C.gl};margin-inline-end:2.5mm}.cu b{font-size:10.4pt;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cu b.l1{font-size:9pt}.cu b.l2{font-size:7.8pt}.cu .ph{flex:none;font-size:8.2pt;color:${C.t2};margin-inline-start:3mm;white-space:nowrap}
.cu .rt{flex:none;margin-inline-start:6mm}.cu .rt b{font-size:9.2pt}.cu .rt .s2{margin-inline-start:7mm}
.zn{height:${ZN}mm;margin-top:2.2mm}.tb{border:.3mm solid ${C.ln};overflow:hidden}
.r{display:flex;height:${RH}mm;border-bottom:.22mm solid ${C.hr};font-size:${z(8.4)}pt}.r>span{flex:none;padding:0 1.5mm;line-height:${+(RH-.2).toFixed(2)}mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;border-inline-start:.22mm solid ${C.hr}}.r>span:first-child{border-inline-start:0}
.r .k{width:${KW}mm;color:${C.mu};font-size:${z(7.4)}pt}.r .nm{flex:1 1 0;min-width:0;text-align:right}.r .nm b{font-weight:700;font-size:${z(8.8)}pt}.r .nm i{font-size:${z(6.6)}pt;color:${C.mu};margin-inline-start:2mm}.r .nm i em{font-weight:700}
.r .am{width:${AMW}mm;text-align:right;font-weight:700;font-size:${z(8.9)}pt}.r .c7{font-weight:700;font-size:${z(8.9)}pt${G7A?';text-align:right':''}}.r .am.dl{font-size:${z(7.2)}pt;font-weight:700;color:${C.t2}}.r u{font-size:${z(6.4)}pt;color:${C.mu};margin-inline-start:.6mm}
.r.t2{height:${RH2}mm}.r.t2>span{line-height:${+(RH2-.2).toFixed(2)}mm}.r.t2>span.d{display:flex;flex-direction:column;justify-content:center;align-items:center;line-height:1.22}.r.t2>span.d b{font-weight:400;max-width:100%;overflow:hidden;text-overflow:ellipsis}.r.t2>span.d i{font-size:${z(6.5)}pt;color:${C.mu};max-width:100%;overflow:hidden;text-overflow:ellipsis}
.r.t2>span.nm.d{align-items:flex-start}.r.t2>span.nm.d b{font-weight:700}.r.t2>span.nm.d i{margin:0}
.r.h{height:${HEADH}mm;border-bottom:.6mm solid ${C.gd}}.r.h>span{font-size:${z(6.6)}pt;font-weight:700;color:${C.gl};line-height:${+(HEADH-.5).toFixed(2)}mm}.r.h .k{color:${C.gl};font-size:${z(6.6)}pt}
.r.cp{height:${CAPH}mm;background:${C.ti}}.r.cp>span{line-height:${+(CAPH-.2).toFixed(2)}mm;border:0}.r.cp .ct{flex:1 1 0;min-width:0;text-align:right;font-size:${z(7)}pt;font-weight:700}.r.cp .cs{font-size:${z(6.2)}pt;font-weight:700;color:${C.mu};padding:0}.r.cp .am{font-size:${z(8.3)}pt;color:${C.gl}}
.dia{display:inline-block;vertical-align:middle;margin-inline-end:1.6mm;margin-top:-.4mm;fill:${C.gd}}
.r.fl{border-bottom:0}
.r.sm{height:${SMH}mm;border:solid transparent;border-width:.3mm .6mm .5mm;border-radius:1.8mm;background:${C.ti};background-clip:padding-box;box-shadow:inset 0 0 0 .3mm ${C.gd};box-sizing:border-box}.r.sm>span{line-height:${+(SMH-.8).toFixed(2)}mm;height:${+(SMH-.8).toFixed(2)}mm;border-color:transparent;font-weight:700}.r.sm .nm b{color:${C.gl};font-size:${z(8)}pt}.r.sm .am{font-size:${z(8.9)}pt;font-weight:800;width:${+(AMW-.6).toFixed(2)}mm}.r.sm .k{width:${+(KW-.6).toFixed(2)}mm}.r.sm u{font-weight:500}
.r .am{font-variant-numeric:tabular-nums}.r>span{font-variant-numeric:tabular-nums}
.acw{margin-top:${ACG}mm;border:.3mm solid ${C.ln};overflow:hidden}.ac>.a:first-child{border-top:0}.a{display:flex;border-top:.22mm solid ${C.hr};font-size:${za(8.4)}pt}.a>span{flex:none;padding:0 1.5mm;white-space:nowrap;overflow:hidden;border-inline-start:.22mm solid ${C.hr}}.a>span:first-child{border-inline-start:0}
.a .al{flex:1 1 0;min-width:0;text-align:right;text-overflow:ellipsis}.a .al b{font-size:${za(8.4)}pt;font-weight:700}.ac:not(.tp) .a .al b{display:inline-block;min-width:${za(31)}mm}.a .al i{font-size:${za(6.4)}pt;color:${C.mu};margin-inline-start:2.6mm}.a .al u{font-size:${za(6.2)}pt;font-weight:700;color:${C.mu};margin-inline-start:.8mm}
.a.ah{height:${AH}mm;border-top:.3mm solid ${C.ln};border-bottom:.6mm solid ${C.gd}}.a.ah>span{font-size:${za(6.6)}pt;font-weight:700;color:${C.gl};line-height:${+(AH-.75).toFixed(2)}mm;text-align:center}.a.ah .al{font-size:${za(7)}pt;color:${C.ink};text-align:right}.a.ah u{font-size:${za(6)}pt;font-weight:700;color:${C.mu};margin-inline-start:.6mm}.a.ah+.a{border-top:0}
.a.ar{height:${AR}mm}.a.ar .al{line-height:${+(AR-.2).toFixed(2)}mm}
.a .av{display:flex;align-items:center;justify-content:flex-end}.a .av.c{justify-content:center}.a .av em{flex:0 0 ${SB}mm;text-align:left;font-size:${za(6.6)}pt;font-weight:700;margin-inline-end:${GP}mm}.a .av b{flex:none;text-align:right;font-size:${za(8.9)}pt;font-weight:700;line-height:1}.a .av b.z{font-weight:500;color:${C.h2}}.a .av em.st{flex:none;margin:0;font-size:${za(7.6)}pt}
.a.af{height:${AF}mm;background:${C.ti};border-top:.6mm solid ${C.gd}}.a.af .al{line-height:${+(AF-.5).toFixed(2)}mm}.a.af .al b{font-size:${za(9.6)}pt;font-weight:800}.a.af .av em{font-size:${za(7.4)}pt;font-weight:800}.a.af .av b{font-size:${+FPA.toFixed(2)}pt;font-weight:800}.a.af .av em.st{font-size:${za(9)}pt}
.ac.tp .ah .fn{color:${C.ink}}.ac.tp .av.fn{background:${C.ti}}.ac.tp .av.fn b{font-size:${za(9.8)}pt;font-weight:800}.ac.tp .av.fn em{font-weight:800}
.lgd{height:3.6mm;line-height:4mm;font-size:6.3pt;color:${C.t2};white-space:nowrap;overflow:hidden;padding:0 1mm}.lgd em{font-weight:700}.lgd s{margin:0 2mm;color:${C.gd}}
.vd{color:${C.rd}}.vc{color:${C.bl}}.vz{color:${C.gn}}
.nt{height:4.2mm;margin-top:0;padding:.6mm 1mm 0;font-size:6.8pt;line-height:3.4mm;color:${C.t2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nt.n2{height:7.6mm;white-space:normal}
.ft{height:${FTH}mm;margin-top:1.2mm;display:flex;align-items:flex-end;justify-content:space-between}.sg,.sg0{flex:0 0 46mm;height:3.7mm}.sg{border-top:.22mm solid ${C.mu};text-align:center;font-size:6.4pt;color:${C.mu};line-height:3.5mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ft .mid{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}.ft .mid .cal{fill:${C.gl}}.ft .mid small{font-size:6pt;color:${C.mu};line-height:2.8mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.ft .mid small s{margin:0 1.6mm;color:${C.gd}}.ft .nx{font-size:7pt;font-weight:700;color:${C.gl};line-height:${FTH>6?5:2.8}mm}`;
  /* v97.7 (چاپ صاحب اپ از آیفون: خانه‌های بعد از «شرح» یک ردیف پایین‌تر افتاده بودند — موتور PDF گوشی (SVG foreignObject در WebKit) ردیف‌های flex را
     مثل مرورگر نمی‌چیند). ردیف‌های جدول و «حساب مشتری» دیگر flex نیستند: هر ردیف یک جدول با چیدمان ثابت است (display:table / table-cell)، همان ساختاری که
     گزارش‌ها با آن روی همان گوشی درست چاپ می‌شوند. نشانه‌گذاری و اندازه‌ها همان است. */
  css+=`
.r,.a{display:table;table-layout:fixed;width:100%;border-collapse:separate;border-spacing:0}
.r>span,.a>span{display:table-cell;vertical-align:middle;box-sizing:border-box;line-height:1.15!important}
.r .nm,.r.cp .ct,.a .al{width:auto}
.r.t2>span.d{display:table-cell;text-align:center}.r.t2>span.d b,.r.t2>span.d i{display:block}.r.t2>span.nm.d{text-align:right}
.r.cp .cs{width:1%;white-space:nowrap}
.a .av{display:table-cell;text-align:left;white-space:nowrap}.a .av.c{text-align:center}
.a .av em{display:inline-block;width:${SB}mm;vertical-align:middle}.a .av b{display:inline-block;vertical-align:middle}.a .av em.st{width:auto}`;
  const A4=S.paper==='a4',K4=297/210,PW=A4?297:210,PH=S.paper==='a5'?148:S.paper==='b14'?140:A4?210:297;
  if(A4){css=invScale('<style>'+css+'</style>',K4).slice(7,-8);body=invScale(body,K4)}
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(invTitle(t))} · ${esc(cuName(c))}</title><style>@page{size:${S.paper==='a5'?'A5 landscape':S.paper==='b14'?'210mm 140mm':A4?'A4 landscape':'A4'};margin:0mm}
@font-face{font-family:Vazirmatn;font-weight:400;font-display:swap;src:url(fonts/Vazirmatn-Regular.woff2) format('woff2')}@font-face{font-family:Vazirmatn;font-weight:500;font-display:swap;src:url(fonts/Vazirmatn-Medium.woff2) format('woff2')}@font-face{font-family:Vazirmatn;font-weight:700;font-display:swap;src:url(fonts/Vazirmatn-Bold.woff2) format('woff2')}@font-face{font-family:Vazirmatn;font-weight:800;font-display:swap;src:url(fonts/Vazirmatn-ExtraBold.woff2) format('woff2')}
.sht{width:${PW}mm;height:${PH}mm;overflow:hidden;background:${C.pa};break-after:page;page-break-after:always}.sht:last-child{break-after:auto;page-break-after:auto}
@media print{.sht{margin:0}}
@media screen{html body{background:transparent!important;box-shadow:none!important;border-radius:0!important;min-height:0!important}html body .sht{margin:0 auto 14px;border-radius:4px;box-shadow:0 10px 34px rgba(16,33,58,.16),0 0 0 1px rgba(16,33,58,.06)}}
</style><style>${css}</style></head><body>${body}</body></html>`}
ACT.invPrint=()=>{const X=invGet();if(!X)return;openPrint(()=>invDoc(X.c,X.t))};

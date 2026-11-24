/* ===== rcpt-read.js — reader for Iranian bank receipts (OCR text / pasted text → fields) =====
   Classic script, no dependencies, no eval, no storage. Every top-level name starts with rcp/RCP.
   Public API:  rcpParse(text[,opts])   rcpLooksLike(text)   rcpRead(source, worker[, opts])
   Never throws: on failure returns {ok:false, why}. Amounts are returned in TOMAN (integer). */
const RCP_VER='1.0';
/* [key, Persian name (same spelling as the app's BANKS/BK_PICK), IBAN code, card BINs, needs the word «بانک» in front, extra Persian forms, latin regex] */
const RCP_BANKS=[
['markazi','مرکزی','010',['636795'],1,'','central ?bank'],['sanat_madan','صنعت و معدن','011',['627961'],0,'','sanat'],
['mellat','ملت','012',['610433','991975'],0,'','mellat'],['refah','رفاه','013',['589463'],1,'رفاه کارگران','refah'],
['maskan','مسکن','014',['628023'],1,'','maskan'],['sepah','سپه','015',['589210'],0,'','sepah'],
['keshavarzi','کشاورزی','016',['603770','639217'],0,'','keshavarzi|agri ?bank'],['melli','ملی','017',['603799','170019'],1,'ملی ایران','melli|\\bbmi\\b'],
['tejarat','تجارت','018',['627353','585983'],1,'','tejarat'],['saderat','صادرات','019',['603769'],1,'صادرات ایران','saderat|\\bbsi\\b'],
['tosee_saderat','توسعه صادرات','020',['627648','207177'],0,'','\\bedbi\\b'],['postbank','پست بانک','021',['627760'],0,'','post ?bank'],
['tosee_taavon','توسعه تعاون','022',['502908'],0,'','taavon'],['tosee','موسسه توسعه','051',['628157'],0,'موسسه اعتباری توسعه',''],
['ghavamin','قوامین','052',['639599'],1,'','ghavamin'],['karafarin','کارآفرین','053',['627488','502910'],0,'','karafarin'],
['parsian','پارسیان','054',['622106','639194','627884'],0,'','parsian'],['eghtesad_novin','اقتصاد نوین','055',['627412'],0,'','eghtesad ?novin|\\ben ?bank'],
['saman','سامان','056',['621986'],1,'','saman'],['pasargad','پاسارگاد','057',['502229','639347'],0,'','pasargad'],
['sarmayeh','سرمایه','058',['639607'],1,'','sarmayeh'],['sina','سینا','059',['639346'],1,'','\\bsina\\b'],
['mehr_iran','مهر ایران','060',['606373'],0,'قرض الحسنه مهر|بانک مهر','mehr ?iran'],['shahr','شهر','061',['502806','504706'],1,'','\\bshahr\\b'],
['ayandeh','آینده','062',['636214'],1,'','ayandeh'],['ansar','انصار','063',['627381'],1,'','\\bansar\\b'],
['gardeshgari','گردشگری','064',['505416'],0,'','gardeshgari|tourism ?bank'],['hekmat','حکمت','065',['636949'],1,'حکمت ایرانیان','hekmat'],
['dey','دی','066',['502938'],1,'','\\bdey\\b|day ?bank'],['iran_zamin','ایران زمین','069',['505785'],0,'','iran ?zamin'],
['resalat','رسالت','070',['504172'],1,'قرض الحسنه رسالت','resalat'],['kosar','کوثر','073',['505801'],1,'','kosar'],
['melall','ملل','075',['606256'],1,'','\\bmelal'],['khavar_mianeh','خاورمیانه','078',['585947'],0,'','middle ?east|khavar'],
['mehr_eghtesad','مهر اقتصاد','079',['639370'],0,'','mehr ?e[gq]h?tesad'],['noor','نور','080',['507677'],1,'','\\bnoor\\b'],
['iran_venezuela','ایران ونزوئلا','095',['581874'],0,'','venezuela']];
/* payment apps / PSPs: [key, Persian name, bank key behind it or '', Persian regex (آ folded to ا), latin regex, onlyInHeader] */
const RCP_APPS=[
['blu','بلو','saman','بلو ?بانک|(^|[^L])بلو(?![L])','blu ?bank|\\bblu\\b'],['ap','آپ','','اسان ?پرداخت|(^|[^L])اپ(?![L])','asan ?pardakht'],
['724','۷۲۴','saman','سامان ?کیش|هفت ?دو ?چهار|(^|[^\\d,.\\/:])724(?![\\d,.\\/:])','saman ?kish|\\bsep\\b'],
['top','تاپ','parsian','تجارت الکترونیک پارسیان|(^|[^L])تاپ(?![L])|پککو','\\btop\\b|pec\\.ir'],
['sekeh','سکه','saderat','اپلیکیشن سکه|برنامه سکه|سکه ?اپ','sekeh'],['bale','بله','melli','پیام ?رسان بله|(^|[^L])بله(?![L])','\\bbale\\b'],
['eva','ایوا','melli','(^|[^L])ایوا(?![L])','\\b[ei]va\\b'],['sadad','سداد','melli','سداد','sadad'],
['behpardakht','به‌پرداخت ملت','mellat','به[ \\u200c]?پرداخت','beh ?pardakht'],['irankish','ایران کیش','','ایران ?کیش','iran ?kish'],
['fanava','فن‌آوا کارت','','فن[ \\u200c]?اوا','fanava'],['pna','پرداخت نوین','eghtesad_novin','پرداخت نوین','\\bpna\\b|pardakht ?novin'],
['sepehr','سپهر','saderat','پرداخت سپهر|(^|[^L])سپهر(?![L])','sepehr'],['pep','پرداخت الکترونیک پاسارگاد','pasargad','الکترونیک پاسارگاد','\\bpep\\b'],
['wepod','ویپاد','pasargad','ویپاد','wepod'],['hamrahcard','همراه کارت','','همراه ?کارت','hamrah ?card'],['780','هف‌هشتاد','','هف[ \\u200c]?هشتاد',''],
['bam','بام','melli','سامانه بام|(^|[^L])بام(?![L])',''],['sayan','سایان کارت','','سایان ?کارت','sayan'],['omidpay','امید پی','sepah','امید ?پی|الکترونیک امید','omid ?pay'],
['shaparak','شاپرک','','شاپرک','shaparak'],['abank','آبانک','ayandeh','(^|[^L])ابانک(?![L])|کیلید','abank|kilid'],['sap','صاپ','saderat','(^|[^L])صاپ(?![L])',''],
['mobilet','موبایلت','saman','موبایلت','mobil+et'],['bankino','بانکینو','khavar_mianeh','بانکینو','bankino'],['hibank','های‌بانک','karafarin','های[ \\u200c]?بانک','hi ?bank']];
const RCP_L='\\u0621-\\u064a\\u067e\\u0686\\u0698\\u06a9\\u06af\\u06cc';
/* dot-skeleton: Persian letters that differ only by dots (the typical OCR confusion) fall into one class; 1 char → 1 char */
const RCP_SK={'پ':'ب','ت':'ب','ث':'ب','ن':'ب','ی':'ب','ئ':'ب','ج':'ح','چ':'ح','خ':'ح','ذ':'د','ز':'ر','ژ':'ر','ش':'س','ض':'ص','ظ':'ط','غ':'ع','ق':'ف','گ':'ک','ة':'ه','آ':'ا','أ':'ا','إ':'ا','ٱ':'ا','ؤ':'و'};
/* labels: [group, sub/side, quality, phrases…]. Longer phrases win on overlap. Groups: amt bal fee tn term merch mname xnum dt dt2 card iban acct name bank party desc misc ttl */
const RCP_LAB=[
['amt','',6,'مبلغ تراکنش','مبلغ انتقال','مبلغ خرید','مبلغ واریز','مبلغ واریزی','مبلغ پرداخت','مبلغ پرداختی','مبلغ برداشت','مبلغ حواله','مبلغ به عدد','مبلغ به ریال','مبلغ','amount','purchase amount','amnt'],
['amt','',4,'مبلغ کل','جمع کل','مبلغ نهایی','total','total amount'],['amt','sl',3,'خرید','purchase','sale'],
['fee','',0,'کارمزد','مبلغ کارمزد','کارمزد انتقال','کارمزد تراکنش','مالیات','تخفیف','fee','wage','commission'],
['bal','',0,'موجودی','مانده','مانده حساب','موجودی حساب','موجودی قابل برداشت','مانده قابل برداشت','موجودی فعلی','موجودی کارت','balance','avail balance'],
['tn','peygiri',9,'شماره پیگیری','کد پیگیری','ش پیگیری','شماره پی گیری','پیگیری','trace no','trace number','trace','stan','tracking code','tracking number','tracking no'],
['tn','rahgiri',8,'کد رهگیری','شماره رهگیری','رهگیری'],
['tn','ref',7,'شماره مرجع','کد مرجع','شماره ارجاع','کد ارجاع','ارجاع','مرجع','شماره مرجع تراکنش','rrn','ref no','ref number','reference number','reference no','reference','ref','ref num'],
['tn','txid',6,'شناسه تراکنش','شماره تراکنش','کد تراکنش','شناسه انتقال','transaction id','txn id'],
['tn','serial',5,'شماره سریال','سریال','شماره سند','شماره فیش','شماره رسید','شماره حواله','شماره دستور پرداخت','serial','serial no'],
['tn','payid',4,'شناسه پرداخت','شناسه واریز'],
['term','',0,'شماره پایانه','کد پایانه','پایانه','شماره ترمینال','ترمینال','terminal id','terminal no','terminal','tid'],
['merch','',0,'شماره پذیرنده','کد پذیرنده','پذیرنده','merchant id','merchant no','merchant','mid'],
['mname','',0,'نام پذیرنده','نام فروشگاه','فروشگاه'],
['xnum','',0,'تلفن','کد پستی','کد ملی','شناسه ملی','شماره مشتری','کد شعبه','شعبه','شناسه قبض','شماره خودپرداز','شماره دستگاه','کد دستگاه','نسخه','شماره موبایل','موبایل','کد اقتصادی','tel','phone','version','batch','شماره ملی','کد باجه','atm id'],
['dt','',0,'تاریخ و ساعت','تاریخ و زمان','زمان تراکنش','تاریخ تراکنش','تاریخ انجام','تاریخ ثبت','تاریخ','ساعت','زمان','date','time','date time','تاریخ انتقال','تاریخ واریز'],
['dt2','',0,'تاریخ تسویه','تاریخ موثر','تاریخ سررسید','تاریخ اعتبار','تاریخ انقضا'],
['card','f',0,'از کارت','کارت مبدا','شماره کارت مبدا','from card','source card','کارت مبدأ'],['card','t',0,'به کارت','کارت مقصد','شماره کارت مقصد','to card','destination card','dest card'],
['card','',0,'شماره کارت','کارت','card no','card number','card','pan'],
['iban','t',0,'شبای مقصد','شماره شبای مقصد','شبا مقصد','به شبا','شماره شبا مقصد'],['iban','f',0,'شبای مبدا','شبا مبدا'],['iban','',0,'شماره شبا','شبا','iban','sheba'],
['acct','f',0,'از حساب','حساب مبدا','شماره حساب مبدا','از سپرده','سپرده مبدا','from account','from acc'],
['acct','t',0,'به حساب','حساب مقصد','شماره حساب مقصد','به سپرده','سپرده مقصد','to account','to acc'],
['acct','',0,'شماره حساب','شماره سپرده','حساب','سپرده','account no','account','acc no'],
['name','t',0,'نام صاحب حساب مقصد','نام صاحب کارت مقصد','صاحب حساب مقصد','صاحب کارت مقصد','نام دارنده کارت مقصد','دارنده کارت مقصد','نام گیرنده','گیرنده','نام مقصد','نام ذینفع','ذینفع','در وجه','نام دریافت کننده','دریافت کننده','به نام','نام صاحب حساب','نام صاحب کارت','صاحب حساب','صاحب کارت','نام دارنده کارت','دارنده کارت','نام صاحب سپرده','صاحب سپرده','نام دارنده حساب','دارنده حساب','نام صاحب شبا','صاحب شبا','beneficiary','receiver','recipient'],
['name','f',0,'واریز کننده','نام واریز کننده','پرداخت کننده','نام پرداخت کننده','نام فرستنده','فرستنده','انتقال دهنده','صاحب حساب مبدا','نام صاحب حساب مبدا','نام مبدا','sender','payer'],
['bank','t',0,'بانک مقصد','نام بانک مقصد','بانک گیرنده'],['bank','f',0,'بانک مبدا','بانک صادر کننده','صادر کننده','بانک صادر کننده کارت','issuer'],['bank','',0,'بانک عامل','نام بانک'],
['party','f',0,'مبدا'],['party','t',0,'مقصد'],
['desc','',0,'شرح','توضیحات','بابت','شرح تراکنش','description','desc'],
['misc','',0,'وضعیت','نتیجه','status','نوع تراکنش','نوع انتقال','نوع عملیات','نوع حساب','عملیات'],
['ttl','',0,'کارت به کارت','همراه بانک','رسید مشتری','رسید پذیرنده','انتقال وجه','card to card']];
let RCP_LC=null;
function rcpEsc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
/* characters: digits → ASCII, Arabic letter forms → Persian, bidi marks / tatweel / diacritics removed, odd punctuation unified */
function rcpNorm(s){
  return String(s==null?'':s).replace(/[‎‏‪-‮⁦-⁩﻿­ـً-ٰٟ]/g,'')
    .replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-1776)).replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632))
    .replace(/[يى]/g,'ی').replace(/[كڪ]/g,'ک').replace(/[ەہھۀ]/g,'ه').replace(/[  -  \t]/g,' ')
    .replace(/[٬،٫]/g,',').replace(/[：∶]/g,':').replace(/[／⁄∕]/g,'/').replace(/[－–—−‐‑]/g,'-').replace(/[•●∗✱＊⁎×✕]/g,'*').replace(/\r/g,'')}
function rcpSkel(s){let o='';for(let i=0;i<s.length;i++){const c=s[i];o+=RCP_SK[c]||(c>='A'&&c<='Z'?c.toLowerCase():c)}return o}
function rcpSq(s){return s.replace(/[\s‌]/g,'')}
function rcpLabs(){if(RCP_LC)return RCP_LC;const out=[];
  for(const row of RCP_LAB){for(let i=3;i<row.length;i++){const ph=row[i],lat=/[a-z]/i.test(ph);let re;
    if(lat)re=new RegExp('(^|[^a-z])('+ph.toLowerCase().split(' ').map(rcpEsc).join('[\\s._\\-]*')+')(?![a-z])','g');
    else re=new RegExp('(^|[^'+RCP_L+'])('+rcpSkel(ph).split(' ').map(w=>w.split('').map(rcpEsc).join('[ \\u200c]?')).join('[\\s\\u200c._\\-]*')+')(?!['+RCP_L+'])','g');
    out.push({g:row[0],sub:row[1],q:row[2],ph,sq:rcpSq(ph),lat,re})}}
  RCP_LC=out;return out}
/* Jalali → Gregorian (arithmetic algorithm, valid for 1178–1634) */
function rcpJ2G(jy,jm,jd){jy+=1595;let days=-355668+365*jy+Math.floor(jy/33)*8+Math.floor(((jy%33)+3)/4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186);
  let gy=400*Math.floor(days/146097);days%=146097;if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++}
  gy+=4*Math.floor(days/1461);days%=1461;if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365}
  let gd=days+1;const ml=[0,31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];let gm=1;for(;gm<13&&gd>ml[gm];gm++)gd-=ml[gm];return [gy,gm,gd]}
function rcpP2(n){return (n<10?'0':'')+n}
function rcpJOk(y,m,d){if(!(y>=1380&&y<=1420&&m>=1&&m<=12&&d>=1))return false;if(m<=6)return d<=31;if(m<=11)return d<=30;if(d<=29)return true;if(d>30)return false;
  const a=rcpJ2G(y,12,30),b=rcpJ2G(y+1,1,1);return !(a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2])}
function rcpGOk(y,m,d){if(!(y>=2010&&y<=2045&&m>=1&&m<=12&&d>=1))return false;const ml=[0,31,((y%4===0&&y%100!==0)||y%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];return d<=ml[m]}
function rcpIbanOk(i){if(!/^IR\d{24}$/.test(i))return false;const s=i.slice(4)+'1827'+i.slice(2,4);let r=0;for(let k=0;k<s.length;k++)r=(r*10+(s.charCodeAt(k)-48))%97;return r===1}
function rcpLuhn(c){if(!/^\d{16}$/.test(c))return false;let s=0;for(let i=0;i<16;i++){let d=c.charCodeAt(i)-48;if(i%2===0){d*=2;if(d>9)d-=9}s+=d}return s%10===0}
function rcpBankBy(f,v){for(const b of RCP_BANKS){if(f==='key'&&b[0]===v)return b;if(f==='iban'&&b[2]===v)return b;if(f==='bin'&&b[3].indexOf(v)>=0)return b;if(f==='fa'&&b[1]===v)return b}return null}
/* Persian number words («یکصد و بیست و پنج میلیون») → integer, 0 when the phrase is not clean */
const RCP_W1={'صفر':0,'یک':1,'دو':2,'سه':3,'چهار':4,'پنج':5,'شش':6,'شیش':6,'هفت':7,'هشت':8,'نه':9,'ده':10,'یازده':11,'دوازده':12,'سیزده':13,'چهارده':14,'پانزده':15,'شانزده':16,'هفده':17,'هجده':18,'هیجده':18,'نوزده':19,'بیست':20,'سی':30,'چهل':40,'پنجاه':50,'شصت':60,'هفتاد':70,'هشتاد':80,'نود':90,'صد':100,'یکصد':100,'دویست':200,'سیصد':300,'چهارصد':400,'پانصد':500,'ششصد':600,'هفتصد':700,'هشتصد':800,'نهصد':900};
const RCP_WM={'هزار':1e3,'میلیون':1e6,'ملیون':1e6,'میلیارد':1e9,'ملیارد':1e9};
function rcpWords(line){
  const m=/(?:^|[\s(:])((?:(?:\d{1,3}|[ء-ی‌]+)[\s]+(?:و[\s]+)?){0,14}(?:هزار|میلیون|ملیون|میلیارد|ملیارد)(?:[\s]+(?:و[\s]+)?(?:\d{1,3}|[ء-ی‌]+)){0,14})/.exec(line);if(!m)return null;
  const toks=m[1].replace(/‌/g,'').split(/\s+/).filter(Boolean);let total=0,cur=0,seen=0,unit=null,started=false;
  for(let i=0;i<toks.length;i++){let t=toks[i];if(t==='و')continue;
    if(/^ریال/.test(t)){unit='rial';break}if(/^(تومان|تومن)/.test(t)){unit='toman';break}
    if(t.length>2&&t[0]==='و'&&(RCP_W1[t.slice(1)]!=null||RCP_WM[t.slice(1)]))t=t.slice(1);
    if(/^\d{1,3}$/.test(t)){cur+=+t;seen++;started=true;continue}
    if(RCP_W1[t]!=null){cur+=RCP_W1[t];seen++;started=true;continue}
    if(RCP_WM[t]){total+=(cur||1)*RCP_WM[t];cur=0;seen++;started=true;continue}
    if(!started)continue;/* words before the number («معادل», «مبلغ به حروف») */
    return null}
  total+=cur;if(!unit){const r=line.slice(m.index+m[0].length);if(/^\s*ریال/.test(r))unit='rial';else if(/^\s*(تومان|تومن)/.test(r))unit='toman'}
  return total>=1000&&seen>=2?{v:total,unit}:null}
const RCP_MON=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const RCP_GMON=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const RCP_UR='(?:ر ?بال|ربا ل|﷼|rials?|irr|rls?(?![a-z]))',RCP_UT='(?:بوماب|بومب|tomans?|irt|tmn)';
/* typed tokens of one line: iban, card, date, time, acct, num. Returns {toks, s} (s = line after look-alike letters inside numbers were fixed) */
function rcpTokens(s0,dtLab){
  const fx=[];let s=s0.replace(/(^|[\s:(])([0-9OoIl|]{1,3}(?:[,.][0-9OoIl|]{3})+|[0-9OoIl|]{4,})(?=$|[\s,.:;)\-])/g,(m0,p,ch,off)=>{
    if(!/[OoIl|]/.test(ch))return m0;const core=ch.replace(/[,.]/g,''),dg=(ch.match(/\d/g)||[]).length;if(dg<3||dg<core.length*.6)return m0;
    fx.push([off+p.length,off+m0.length]);return p+ch.replace(/[Oo]/g,'0').replace(/[Il|]/g,'1')});
  let w=s;const toks=[],sk=rcpSkel(s);
  const scan=(re,cb)=>{const src=w;re.lastIndex=0;let m;while((m=re.exec(src))){const a=m.index+(m[1]||'').length;let b=m.index+m[0].length;
      while(b>a&&/[\s\-]/.test(src[b-1]))b--;if(b<=a){re.lastIndex=m.index+1;continue}
      const t=cb(m,a,b);if(t){t.a=a;t.b=b;t.fixed=fx.some(f=>f[0]<b&&f[1]>a);toks.push(t);w=w.slice(0,a)+'\u0001'.repeat(b-a)+w.slice(b);re.lastIndex=b}else re.lastIndex=a+1}};
  scan(/(^|[^A-Za-z0-9])([Il1|] ?[Rr][. ]?((?:\d[ \-]?){24}))(?!\d)/g,m=>{const v='IR'+m[3].replace(/\D/g,'');return {type:'iban',v,ok:rcpIbanOk(v)}});
  const M='[*xX#]',D='[\\d*xX#]';
  scan(new RegExp('(^|[^\\d*xX#])((?:'+D+'{4}[ \\-_]){3}'+D+'{4}|\\d{6}[ \\-]?'+M+'{4,8}[ \\-]?\\d{4}|\\d{4}[ \\-]?'+M+'{4,8}[ \\-]?\\d{6}|\\d{4}[ \\-]?'+M+'{4}[ \\-]?'+M+'{2}\\d{4}[ \\-]?\\d{2}|'+M+'{12}\\d{4}|\\d{16})(?!'+D+')','g'),m=>{
    let raw=m[2],c=raw.replace(/[ \-_]/g,'').replace(/[xX#]/g,'*'),approx=false;const dg=(c.match(/\d/g)||[]).length;if(dg<4)return null;
    let mm;if((mm=/^(\d{6})\*{4,8}(\d{4})$/.exec(c))){approx=c.length!==16;c=mm[1]+'******'+mm[2]}
    else if((mm=/^(\d{4})\*{4,8}(\d{6})$/.exec(c))){approx=c.length!==16;c=mm[2]+'******'+mm[1]}/* RTL-scrambled mask: 1234******610433 */
    else if((mm=/^(\d{4})\*{6}(\d{4})(\d{2})$/.exec(c)))c=mm[2]+mm[3]+'******'+mm[1];/* 1234-****-**6104-33 */
    if(c.length!==16)return null;const full=dg===16,bin=/^\d{6}/.test(c)?c.slice(0,6):'',bk=bin?rcpBankBy('bin',bin):null,luhn=full&&rcpLuhn(c);
    if(full&&!/[ \-_]/.test(raw)&&!(bk&&luhn))return null;/* 16 unbroken digits: a card only when BIN + check digit agree */
    return {type:'card',v:c,full,bin,bank:bk,luhn,approx}});
  /* masked card whose stars were read as junk («1234%6¥x4%610433»): accepted only with a known BIN */
  const jk='([^\\s\\d][^\\s]{2,7}[^\\s\\d]|[^\\s\\d]{2,8})';
  scan(new RegExp('(^|[^\\d])(\\d{4})'+jk+'(\\d{6})(?!\\d)','g'),m=>{const bk=rcpBankBy('bin',m[4]);return bk&&/[^A-Za-z0-9]/.test(m[3])?{type:'card',v:m[4]+'******'+m[2],full:false,bin:m[4],bank:bk,luhn:false,approx:true}:null});
  scan(new RegExp('(^|[^\\d])(\\d{6})'+jk+'(\\d{4})(?!\\d)','g'),m=>{const bk=rcpBankBy('bin',m[2]);return bk&&/[^A-Za-z0-9]/.test(m[3])?{type:'card',v:m[2]+'******'+m[4],full:false,bin:m[2],bank:bk,luhn:false,approx:true}:null});
  const dt=(y,mo,d,cal,q,fa)=>{if(cal==='j'){if(!rcpJOk(y,mo,d))return null;const g=rcpJ2G(y,mo,d);return {type:'date',cal,iso:g[0]+'-'+rcpP2(g[1])+'-'+rcpP2(g[2]),fa:fa||(y+'/'+rcpP2(mo)+'/'+rcpP2(d)),q}}
    if(!rcpGOk(y,mo,d))return null;return {type:'date',cal,iso:y+'-'+rcpP2(mo)+'-'+rcpP2(d),fa:fa||(y+'/'+rcpP2(mo)+'/'+rcpP2(d)),q}};
  const SP=' ?[\\/\\-.] ?';
  scan(new RegExp('(^|[^\\d\\/\\-.])(1[34]\\d{2})'+SP+'(\\d{1,2})'+SP+'(\\d{1,2})(?!\\d)','g'),m=>dt(+m[2],+m[3],+m[4],'j',1));
  scan(new RegExp('(^|[^\\d\\/\\-.])(20\\d{2})'+SP+'(\\d{1,2})'+SP+'(\\d{1,2})(?!\\d)','g'),m=>dt(+m[2],+m[3],+m[4],'g',1));
  scan(new RegExp('(^|[^\\d\\/\\-.])(\\d{1,2})'+SP+'(\\d{1,2})'+SP+'(1[34]\\d{2})(?!\\d)','g'),m=>dt(+m[4],+m[3],+m[2],'j',.7));
  scan(new RegExp('(^|[^\\d\\/\\-.])(\\d{1,2})'+SP+'(\\d{1,2})'+SP+'(20\\d{2})(?!\\d)','g'),m=>dt(+m[4],+m[3],+m[2],'g',.7));
  /* month names (matched on the dot-skeleton, so «آدر» / «اذر» still read as آذر) */
  {const skw=rcpSkel(w),MN=RCP_MON.map(rcpSkel).map(x=>x.split('').join('[ \\u200c]?')).join('|');let m;
    const r1=new RegExp('(^|[^\\d])(\\d{1,2})[ \\u200c]*(?:ام[ \\u200c]+)?('+MN+')(?:[ \\u200c]*ماه)?[ \\u200c,]*(1[34]\\d{2})(?!\\d)','g'),r2=new RegExp('(^|[^\\d])(1[34]\\d{2})[ \\u200c,]*('+MN+')(?:[ \\u200c]*ماه)?[ \\u200c]*(\\d{1,2})(?!\\d)','g');
    const mi=x=>RCP_MON.map(rcpSkel).indexOf(rcpSq(x))+1;
    for(const [re,rv] of [[r1,0],[r2,1]]){re.lastIndex=0;while((m=re.exec(skw))){const a=m.index+m[1].length,b=m.index+m[0].length,mo=mi(m[3]),y=+(rv?m[2]:m[4]),d=+(rv?m[4]:m[2]);
        const t=mo?dt(y,mo,d,'j',rv?.8:1,d+' '+RCP_MON[mo-1]+' '+y):null;if(t){t.a=a;t.b=b;toks.push(t);w=w.slice(0,a)+'\u0001'.repeat(b-a)+w.slice(b)}}}
    const lw=w.toLowerCase(),GM=RCP_GMON.join('|');
    const g1=new RegExp('(^|[^\\d])(\\d{1,2})[ \\-]*('+GM+')[a-z]*\\.?,?[ \\-]*(20\\d{2})(?!\\d)','g'),g2=new RegExp('(^|[^a-z])('+GM+')[a-z]*\\.? ?(\\d{1,2})(?:st|nd|rd|th)?,? ?(20\\d{2})(?!\\d)','g');
    for(const [re,rv] of [[g1,0],[g2,1]]){re.lastIndex=0;while((m=re.exec(lw))){const a=m.index+m[1].length,b=m.index+m[0].length,mo=RCP_GMON.indexOf(rv?m[2]:m[3])+1,d=+(rv?m[3]:m[2]);
        const t=dt(+m[4],mo,d,'g',1);if(t){t.a=a;t.b=b;toks.push(t);w=w.slice(0,a)+'\u0001'.repeat(b-a)+w.slice(b)}}}}
  if(dtLab)scan(/(^|[^\d\/])(\d{2})\/(\d{2})\/(\d{2})(?![\d\/])/g,m=>{const y=+m[2];return dt((y>=80?1300:1400)+y,+m[3],+m[4],'j',.6)});
  scan(/(^|[^\d:])((?:[01]?\d|2[0-3]) ?: ?[0-5]\d(?: ?: ?[0-5]\d)?)(?![\d:])/g,m=>{const p=m[2].replace(/ /g,'').split(':');return {type:'time',v:rcpP2(+p[0])+':'+p[1]+(p[2]?':'+p[2]:'')}});
  scan(/(^|[^\d\-.\/])(\d{1,6}(?:[\-.\/]\d{1,12}){1,5})(?![\-.\/]?\d)/g,m=>{const raw=m[2],parts=raw.split(/[\-.\/]/),d=raw.replace(/\D/g,'');
    if(!/-/.test(raw)){if(parts.length===2)return null;if(parts[0].length<=3&&parts.slice(1).every(p=>p.length===3))return null}
    if(d.length<6||d.length>22)return null;return {type:'acct',v:raw,d}});
  const num=(raw,grouped,bad)=>{const d=raw.replace(/\D/g,'');return {type:'num',raw,d,v:+d,grouped,bad:!!bad}};
  scan(/(^|[^\d,.\/])(\d{1,3}(?: ?[,.\/'] ?\d{3})+)(?![,.\/]?\d)/g,m=>num(m[2],true));
  scan(/(^|[^\d,])(\d{1,3}(?:,\d{1,4}){1,5})(?!,?\d)/g,m=>num(m[2],true,true));
  scan(/(^|[^\d])(\d{1,3}(?: \d{3}){1,4})(?= *(?:ر[یب]ال|تومان|rial|toman|irr))/gi,m=>num(m[2],true));
  scan(/()(\d+)/g,m=>num(m[2],false));
  for(const t of toks){if(t.type!=='num')continue;const af=sk.slice(t.b,t.b+18),bf=sk.slice(Math.max(0,t.a-16),t.a);
    const A=x=>new RegExp('^[\\s\\u200c()\\-:.]*'+x+'(?!['+RCP_L+'a-z])').test(af),B=x=>new RegExp('(^|[^'+RCP_L+'a-z])'+x+'[\\s\\u200c():\\-.]*$').test(bf);
    t.unit=A(RCP_UR)?'rial':A(RCP_UT)?'toman':B(RCP_UR)?'rial':B(RCP_UT)?'toman':null}
  toks.sort((x,y)=>x.a-y.a);return {toks,s,sk}}
function rcpLabHits(sk,s){const H=[];for(const L of rcpLabs()){L.re.lastIndex=0;let m;while((m=L.re.exec(sk))){const a=m.index+m[1].length,b=m.index+m[0].length;if(b<=a){L.re.lastIndex=m.index+1;continue}
      H.push({g:L.g,sub:L.sub,q:L.q,ph:L.ph,a,b,exact:L.lat||rcpSq(s.slice(a,b)).replace(/[آأإ]/g,'ا')===L.sq.replace(/[آأإ]/g,'ا')});L.re.lastIndex=b}}
  H.sort((x,y)=>(y.b-y.a)-(x.b-x.a)||x.a-y.a);const K=[];for(const h of H)if(!K.some(k=>k.a<h.b&&h.a<k.b))K.push(h);K.sort((x,y)=>x.a-y.a);return K}
function rcpAcc(l,t){const n=t.type==='num',len=n?t.d.length:0;switch(l.g){
  case 'amt':return n&&len>=4&&len<=13;case 'bal':case 'fee':return n;
  case 'tn':return n&&!t.grouped&&!t.unit&&len>=4&&len<=30;case 'term':case 'merch':return n&&!t.grouped&&len>=4&&len<=20;
  case 'xnum':return n||t.type==='acct';case 'dt':case 'dt2':return t.type==='date'||t.type==='time';
  case 'card':return t.type==='card'||(n&&!t.grouped&&len===16);case 'iban':return t.type==='iban'||(n&&!t.grouped&&len===24);
  case 'acct':return t.type==='acct'||(n&&!t.grouped&&!t.unit&&len>=5&&len<=20);case 'party':return t.type==='card'||t.type==='iban'||t.type==='acct';}return false}
function rcpBankIn(txt){/* bank named in a piece of text (labelled value): no «بانک» prefix needed */
  const f=rcpNorm(txt).replace(/[آأإ]/g,'ا'),lw=f.toLowerCase();let best=null;
  for(const b of RCP_BANKS){const nm=b[1].replace(/[آأإ]/g,'ا').split(' ').join('[ \\u200c]?');const m=new RegExp('(^|[^'+RCP_L+'])'+nm+'(?!['+RCP_L+'])').exec(f)||(b[6]?new RegExp(b[6]).exec(lw):null);
    if(m&&(!best||b[1].length>best[1].length))best=b}
  if(!best&&/(^|[^ء-ی])بلو(?![ء-ی])/.test(f))best=rcpBankBy('key','saman');return best}
function rcpClean(t){return t.replace(/\u0001+/g,' ').replace(/[|_*]+/g,' ').replace(/\s+/g,' ').replace(/^[\s:;.,\-–()\[\]«»"'\/\\=]+|[\s:;.,\-–(\[«"'\/\\=]+$/g,'').trim()}
function rcpNameOk(t){if(!t||t.length<3||t.length>48)return 0;const fa=(t.match(/[ء-ی]/g)||[]).length,la=(t.match(/[A-Za-z]/g)||[]).length,dg=(t.match(/\d/g)||[]).length;
  if(dg>2)return 0;const sk=rcpSkel(t);if(new RegExp(RCP_UR+'|'+RCP_UT+'|موفف|مبلع|بارب ?ح|سماره').test(sk))return 0;
  if(fa>=3&&fa>=la*2)return .85;if(la>=6&&!fa&&/^[A-Za-z .'\-]+$/.test(t)&&/[a-z]/.test(t))return .5;return 0}
let RCP_BC=null;
function rcpBankRes(){if(RCP_BC)return RCP_BC;const L=RCP_L,F=s=>s.replace(/[آأإ]/g,'ا');
  const banks=RCP_BANKS.map(b=>{const nm=F(b[1]).split(' ').join('[ \\u200c]?');const alts=[(b[4]?'بانک[ \\u200c]*':'(?:^|[^'+L+'])')+nm+'(?!['+L+'])'];
    if(b[5])F(b[5]).split('|').forEach(a=>alts.push(a.split(' ').join('[ \\u200c]?')+'(?!['+L+'])'));return {b,fa:new RegExp(alts.join('|')),la:b[6]?new RegExp(b[6]):null}});
  const apps=RCP_APPS.map(a=>({a,fa:new RegExp(a[3].replace(/L/g,L)),la:a[4]?new RegExp(a[4]):null}));RCP_BC={banks,apps};return RCP_BC}
function rcpEmpty(why){return {ok:false,why:why||'empty',kind:'unknown',status:'unknown',amount:0,amountRaw:'',unit:'',tn:'',tnAll:[],date:'',dateFa:'',time:'',bank:'',bankKey:'',app:'',appKey:'',
  fromCard:'',toCard:'',toIban:'',toAcct:'',fromAcct:'',fromName:'',toName:'',fromBank:'',toBank:'',terminal:'',merchant:'',merchantName:'',desc:'',conf:{},warn:[],score:0,lines:[]}}
function rcpParse(text,opts){try{return rcpParse0(text,opts||{})}catch(e){return rcpEmpty(String(e&&e.message||e))}}
function rcpParse0(text,opts){
  const T=rcpNorm(text);let raw=T.split('\n').map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);if(!raw.length)return rcpEmpty('empty');if(raw.length>400)raw=raw.slice(0,400);
  /* IBAN broken over two lines: joined only when the check digits agree */
  for(let i=0;i<raw.length-1;i++){const m=/([Il1|] ?[Rr][. ]?)((?:\d[ \-]?){4,23})$/.exec(raw[i]),n=/^((?:\d[ \-]?)+)/.exec(raw[i+1]);if(!m||!n)continue;
    const d=(m[2]+n[1]).replace(/\D/g,'');if(d.length===24&&rcpIbanOk('IR'+d)){raw[i]=raw[i].slice(0,m.index)+'IR'+d;raw[i+1]=raw[i+1].slice(n[1].length).trim();if(!raw[i+1]){raw.splice(i+1,1)}}}
  const R=rcpEmpty('');R.ok=true;delete R.why;R.lines=raw.slice();const W=R.warn,C=R.conf;
  const L=raw.map((s0,i)=>{const sk0=rcpSkel(s0),labs0=rcpLabHits(sk0,s0),tk=rcpTokens(s0,labs0.some(l=>l.g==='dt'));
    const labs=labs0.filter(l=>!tk.toks.some(t=>t.type!=='num'&&t.a<l.b&&l.a<t.b));labs.forEach(l=>{l.i=i;l.vals=[];l.got={}});tk.toks.forEach(t=>{t.i=i});
    const items=labs.concat(tk.toks).sort((x,y)=>x.a-y.a);return {i,s:tk.s,sk:tk.sk,toks:tk.toks,labs,rev:items.length>1&&items[0].type!==undefined&&items[items.length-1].g!==undefined}});
  /* section headers «مبدا» / «مقصد» give a side to the generic labels under them */
  {let sec='',at=-99;for(const ln of L){const pl=ln.labs.filter(l=>l.g==='party');if(pl.length===1&&ln.labs.length===1&&!ln.toks.length&&rcpClean(ln.s.slice(0,pl[0].a)+' '+ln.s.slice(pl[0].b)).length<12){sec=pl[0].sub;at=ln.i;continue}
      if(sec&&ln.i-at<=8)for(const l of ln.labs){if((l.g==='card'||l.g==='acct'||l.g==='iban'||l.g==='bank')&&!l.sub)l.sub=sec;if(l.g==='name'&&sec==='f'&&!/مقصد|گیرنده|ذینفع|دریافت|در وجه|به نام/.test(l.ph))l.sub='f'}}}
  /* columns read apart by the OCR: N label-only lines next to N value-only lines are paired in order */
  const VT={amt:1,bal:1,fee:1,tn:1,term:1,merch:1,xnum:1,dt:1,dt2:1,card:1,iban:1,acct:1,party:1,name:1,mname:1,bank:1,desc:1},zip={};
  {const kind=L.map(ln=>{const lv=ln.labs.filter(l=>VT[l.g]).length;return lv&&!ln.toks.length?'L':!ln.labs.length?'V':'X'});
    for(let i=0;i<L.length;i++){if(kind[i]!=='L')continue;let j=i;while(j+1<L.length&&kind[j+1]==='L')j++;const n=j-i+1;if(n>=2){let ok=true;for(let k=1;k<=n;k++)if(kind[j+k]!=='V')ok=false;
        if(ok)for(let k=0;k<n;k++)zip[i+k]=j+1+k;else{ok=i-n>=0;for(let k=1;k<=n&&ok;k++)if(kind[i-k]!=='V')ok=false;if(ok)for(let k=0;k<n;k++)zip[i+k]=i-n+k}}i=j}}
  const pairs=[],PREV={amt:1,tn:1,dt:1,card:1,iban:1,acct:1};
  for(const ln of L)for(const lab of ln.labs){let same=false;
    for(const t of ln.toks){if(!rcpAcc(lab,t))continue;const after=t.a>=lab.b,nb=ln.labs.filter(o=>o!==lab&&(after?(o.a>=lab.b&&o.b<=t.a):(o.a>=t.b&&o.b<=lab.a))).length,gap=after?t.a-lab.b:lab.a-t.b;
      pairs.push({lab,t,c:((after!==ln.rev)?0:3)+nb*3+gap*.01,how:'line'});if(!nb)same=true}
    if(same||lab.sub==='sl')continue;const i=ln.i,add=(j,base,how)=>{const o=L[j];if(!o)return 0;let n=0;o.toks.forEach((t,ix)=>{if(!rcpAcc(lab,t))return;n++;
        pairs.push({lab,t,c:base+ix*.5+(how!=='zip'&&o.labs.some(q=>rcpAcc(q,t))?3:0),how})});return n};
    if(zip[i]!=null)add(zip[i],2,'zip');const n1=add(i+1,4,'next');if(!n1&&L[i+1]&&!L[i+1].labs.length&&PREV[lab.g])add(i+2,7,'next');if(PREV[lab.g]&&i>0&&zip[i]==null)add(i-1,6+(L[i-1].labs.length?3:0),'prev')}
  pairs.sort((x,y)=>x.c-y.c);
  for(const p of pairs){if(p.t.lab)continue;const slot=(p.lab.g==='dt'||p.lab.g==='dt2')?p.t.type:'v';if(p.lab.got[slot])continue;p.lab.got[slot]=1;p.t.lab=p.lab;p.t.how=p.how;p.lab.vals.push(p.t)}
  const labs=[].concat.apply([],L.map(l=>l.labs)),toks=[].concat.apply([],L.map(l=>l.toks)),howK=h=>h==='line'?1:h==='zip'?.85:h==='next'?.9:.75;
  const Kn=rcpSq(T),K=rcpSkel(Kn),low=T.toLowerCase(),has=p=>K.indexOf(rcpSq(rcpSkel(p)))>=0,hasX=p=>Kn.indexOf(rcpSq(p))>=0,word=w=>new RegExp('(^|[^'+RCP_L+'])'+w+'(?!['+RCP_L+'])').test(T);
  /* --- tracking numbers --- */
  const seenTn={};labs.filter(l=>l.g==='tn'&&l.vals.length).sort((a,b)=>b.q-a.q).forEach(l=>{const t=l.vals[0];if(seenTn[t.d])return;seenTn[t.d]=1;
    let c=(l.exact?.92:.8)*howK(t.how)*(t.fixed?.6:1)*(t.d.length<5?.75:1);R.tnAll.push({label:l.ph,id:l.sub,v:t.d,conf:+c.toFixed(2)})});
  if(R.tnAll.length){const b=R.tnAll.filter(x=>x.conf>=.5)[0]||R.tnAll[0];R.tn=b.v;C.tn=b.conf}
  const tl=labs.filter(l=>l.g==='term'&&l.vals.length)[0],ml=labs.filter(l=>l.g==='merch'&&l.vals.length)[0];if(tl){R.terminal=tl.vals[0].d;C.terminal=.85*howK(tl.vals[0].how)}if(ml){R.merchant=ml.vals[0].d;C.merchant=.85*howK(ml.vals[0].how)}
  /* --- date / time --- */
  {const ds=toks.filter(t=>t.type==='date'),lab1=ds.filter(t=>t.lab&&t.lab.g==='dt'),free=ds.filter(t=>!t.lab),d=lab1[0]||free.sort((a,b)=>b.q-a.q)[0]||ds[0];
    if(d){R.date=d.iso;R.dateFa=d.fa;let c=(d.lab&&d.lab.g==='dt'?.95:d.lab?.6:.85)*d.q;const now=opts.now?new Date(opts.now):new Date(),lim=new Date(now.getTime()+2*864e5).toISOString().slice(0,10);
      if(d.iso>lim){c*=.5;W.push('date-future')}C.date=+c.toFixed(2)}
    const ts=toks.filter(t=>t.type==='time'),tm=ts.filter(t=>t.lab&&t.lab.g==='dt')[0]||(d&&ts.filter(t=>t.i===d.i)[0])||ts[0];
    if(tm){R.time=tm.v;let c=tm.lab?.92:(d&&tm.i===d.i)?.88:.7;if(!tm.lab&&tm.i===0&&L[0].s.length<=12&&(!d||d.i!==0)){c=.35;W.push('time-maybe-statusbar')}C.time=c}}
  /* --- kind / status --- */
  const cards=toks.filter(t=>t.type==='card'||(t.type==='num'&&t.lab&&t.lab.g==='card')).map(t=>t.type==='card'?t:{type:'card',v:t.d,full:true,bin:t.d.slice(0,6),bank:rcpBankBy('bin',t.d.slice(0,6)),luhn:rcpLuhn(t.d),lab:t.lab,how:t.how,i:t.i,a:t.a});
  const ibans=toks.filter(t=>t.type==='iban'||(t.type==='num'&&t.lab&&t.lab.g==='iban')).map(t=>t.type==='iban'?t:{type:'iban',v:'IR'+t.d,ok:rcpIbanOk('IR'+t.d),lab:t.lab,i:t.i,a:t.a});
  {let k='unknown';const lt=g=>labs.some(l=>l.g===g);
    if(has('شناسه قبض')||has('پرداخت قبض'))k='bill';
    else if(has('رسید مشتری')||has('نسخه مشتری')||has('رسید پذیرنده')||has('رسید فروشنده')||has('رسید دارنده کارت')||/customer copy|merchant copy|cardholder copy/.test(low)||(lt('term')&&(lt('merch')||has('خرید')||/\b(sale|purchase)\b/.test(low))))k='pos';
    else if(has('خودپرداز')||has('عابر بانک')||/\batm\b/.test(low))k='atm';
    else if(hasX('ساتنا')||/satna|rtgs/.test(low))k='satna';else if(word('پایا')||/\bpaya\b|\bach\b/.test(low))k='paya';
    else if(has('انتقال پل')||(word('پل')&&(has('انتقال')||has('حواله')||ibans.length)))k='pol';
    else if(has('کارت به کارت')||has('انتقال کارتی')||has('کارت مقصد')||/card to card|\bc2c\b/.test(low)||cards.length>=2)k='c2c';
    else if(has('انتقال داخلی')||has('حساب به حساب')||has('سپرده به سپرده')||has('درون بانکی')||has('انتقال وجه داخلی')||/internal transfer/.test(low))k='internal';
    else if(has('فیش واریز')||has('واریز نقدی')||has('واریز به حساب')||has('رسید واریز')||has('واریز کننده')||has('واریز وجه')||/deposit/.test(low))k='deposit';
    else if(ibans.length&&has('انتقال'))k='paya';
    R.kind=k;C.kind=k==='unknown'?0:.85;
    let st='unknown';if(hasX('ناموفق')||hasX('انجام نشد')||hasX('برگشت خورد')||hasX('رد شد')||hasX('عدم موفقیت')||hasX('لغو شد')||/failed|unsuccessful|declined|not approved|rejected/.test(low))st='fail';
    else if(hasX('در حال انجام')||hasX('در انتظار')||hasX('در دست اقدام')||hasX('در حال پردازش')||hasX('در صف')||/pending|in progress/.test(low))st='pending';
    else if(has('موفق')||hasX('انجام شد')||hasX('تایید شد')||hasX('واریز شد')||hasX('انتقال یافت')||/successful|approved|success|completed|accepted/.test(low))st='ok';
    R.status=st;C.status=st==='unknown'?0:.85}
  /* --- cards, IBAN, accounts --- */
  {const side=c=>c.lab&&(c.lab.g==='card'||c.lab.g==='party')?c.lab.sub:'';let f=cards.filter(c=>side(c)==='f')[0],t=cards.filter(c=>side(c)==='t')[0];const rest=cards.filter(c=>c!==f&&c!==t);
    if(R.kind==='pos'){if(!f)f=rest.shift()}
    else if(rest.length>=2&&!f&&!t){const m=rest.filter(c=>!c.full),u=rest.filter(c=>c.full);if(m.length===1&&u.length===1){f=m[0];t=u[0]}else{f=rest[0];t=rest[1]}}
    else if(rest.length){const c=rest[0];if(f&&!t)t=c;else if(t&&!f)f=c;else if(!f&&!t){if(c.full&&R.kind!=='atm')t=c;else f=c}}
    const cc=c=>+((c.full?(c.luhn?.95:.5):(c.bank?.85:.6))*(c.approx?.7:1)*(c.fixed?.7:1)).toFixed(2);
    if(f){R.fromCard=f.v;C.fromCard=cc(f);if(f.bank)R.fromBank=f.bank[1];if(f.full&&!f.luhn)W.push('fromCard-checkdigit')}
    if(t){R.toCard=t.v;C.toCard=cc(t);if(t.bank)R.toBank=t.bank[1];if(t.full&&!t.luhn)W.push('toCard-checkdigit')}
    const ib=ibans.filter(x=>!(x.lab&&x.lab.sub==='f'))[0];if(ib){R.toIban=ib.v;C.toIban=ib.ok?.97:.4;if(!ib.ok)W.push('iban-checkdigit');const b=rcpBankBy('iban',ib.v.slice(4,7));if(b&&ib.ok&&!R.toBank)R.toBank=b[1]}
    const acs=toks.filter(x=>x.lab&&(x.lab.g==='acct'||(x.lab.g==='party'&&x.type==='acct'))),av=x=>x.type==='acct'?x.v:x.d;let af=acs.filter(x=>x.lab.sub==='f')[0],at=acs.filter(x=>x.lab.sub==='t')[0];const ar=acs.filter(x=>x!==af&&x!==at);
    if(ar.length){if(!at&&(R.kind==='deposit'||R.kind==='atm'||af))at=ar[0];else if(!af)af=ar[0];if(!at&&ar[1])at=ar[1]}
    if(af){R.fromAcct=av(af);C.fromAcct=.8*howK(af.how)}if(at){R.toAcct=av(at);C.toAcct=.8*howK(at.how)}}
  /* --- names, banks named by a label, description --- */
  {const txt=l=>{const ln=L[l.i],its=ln.labs.concat(ln.toks).sort((x,y)=>x.a-y.a),ix=its.indexOf(l);let v='';
      if(!ln.rev){const nx=its[ix+1];v=rcpClean(ln.s.slice(l.b,nx?nx.a:ln.s.length))}else{const pv=its[ix-1];v=rcpClean(ln.s.slice(pv?pv.b:0,l.a))}
      if(v)return {v,k:1};const j=zip[l.i]!=null?zip[l.i]:l.i+1,o=L[j];if(o&&!o.labs.length&&!o.toks.length&&!o.used){const w=rcpClean(o.s);if(w){return {v:w,k:.85,o}}}return {v:'',k:0}};
    for(const l of labs){if(l.g==='name'||(l.g==='party'&&!l.vals.length)){const x=txt(l);if(!x.v)continue;const bk=l.g==='party'?rcpBankIn(x.v):null;
        if(bk&&x.v.length<=bk[1].length+8){if(l.sub==='f'&&!R.fromBank)R.fromBank=bk[1];if(l.sub==='t')R.toBank=bk[1];continue}
        const v0=x.v;x.v=rcpClean(x.v.replace(/^(?:[A-Za-z]{1,3}\s+)+(?=[\u0621-\u06cc])/,'').replace(/([\u0621-\u06cc])(?:\s+[A-Za-z]{1,3})+$/,'$1'));if(x.v!==v0)x.k*=.6;const q=rcpNameOk(x.v);if(!q||(l.g==='party'&&L[l.i].s.indexOf(':')<0&&x.k===1))continue;const key=l.sub==='f'?'fromName':'toName';if(R[key])continue;R[key]=x.v;C[key]=+(q*x.k*(l.exact?1:.9)).toFixed(2);if(x.o)x.o.used=1}
      else if(l.g==='bank'){const x=txt(l),bk=x.v?rcpBankIn(x.v):null;if(bk){if(l.sub==='t')R.toBank=bk[1];else if(l.sub==='f')R.fromBank=R.fromBank||bk[1]}}
      else if(l.g==='mname'&&!R.merchantName){const x=txt(l);if(x.v&&rcpNameOk(x.v))R.merchantName=x.v}
      else if(l.g==='desc'&&!R.desc){const ln=L[l.i];R.desc=rcpClean(ln.s.slice(l.b)).slice(0,120)}}
    if(R.kind==='pos'){R.toName='';delete C.toName}}
  /* --- receipt's own bank / app --- */
  {const B=rcpBankRes();let hb=null,hbI=1e9,app=null;
    for(const ln of L){if(ln.labs.some(l=>l.g==='bank'||l.g==='party'||l.g==='name'||l.g==='card'&&l.sub))continue;const f=ln.s.replace(/[آأإ]/g,'ا'),lw=f.toLowerCase();
      if(!hb){let best=null;for(const x of B.banks){const m=x.fa.exec(f)||(x.la&&x.la.exec(lw));if(m&&(!best||m.index<best.ix||(m.index<=best.ix+2&&x.b[1].length>best.b[1].length)))best={b:x.b,ix:m.index}}if(best){hb=best.b;hbI=ln.i}}
      if(!app)for(const x of B.apps){if(x.fa.test(f)||(x.la&&x.la.test(lw))){app=x.a;break}}}
    if(app){R.app=app[1];R.appKey=app[0]}
    if(app&&app[0]==='blu'&&(!hb||hb[0]==='saman')){R.bank='بلو';R.bankKey='blu';C.bank=.85}
    else if(hb){R.bank=hb[1];R.bankKey=hb[0];C.bank=hbI<6?.9:.75}
    else if(app&&app[2]){const b=rcpBankBy('key',app[2]);R.bank=b[1];R.bankKey=b[0];C.bank=.7}
    else if(app){R.bank=app[1];R.bankKey='app_'+app[0];C.bank=.7}
    else if(R.fromBank&&R.kind!=='pos'){const b=rcpBankBy('fa',R.fromBank);if(b){R.bank=b[1];R.bankKey=b[0];C.bank=.45;W.push('bank-from-card')}}}
  /* --- amount --- */
  {let words=null;for(const ln of L){const w=rcpWords(ln.s);if(w&&(!words||w.v>words.v))words=w}
    const uOnly=i=>{const o=L[i];if(!o||o.toks.length)return null;const k=rcpSq(o.sk).replace(/[().:\-]/g,'');return new RegExp('^'+RCP_UR.replace(/ \?/g,'')+'$').test(k)?'rial':new RegExp('^'+RCP_UT+'$').test(k)?'toman':null};
    const cand=[];for(const t of toks){if(t.type!=='num')continue;const n=t.d.length;if(n<4||n>13||!t.v||(t.lab&&t.lab.g!=='amt'))continue;const lab=t.lab,nu=t.unit?null:uOnly(t.i+1);
      if(!lab&&!t.unit&&!nu&&(!t.grouped||/^\d{1,3}\.\d{3}$/.test(t.raw)))continue;if(!lab&&t.d[0]==='0')continue;let sc=0;if(lab)sc+=lab.q+(t.how==='line'?1:0);if(t.unit)sc+=3;else if(nu)sc+=2;if(t.grouped)sc+=t.bad?-2:2;
      const wm=words&&(words.v===t.v||words.v*10===t.v||words.v===t.v*10);if(wm)sc+=5;if(n>=5&&n<=12)sc+=1;if(t.fixed)sc-=1;
      if(L[t.i].labs.some(l=>(l.g==='bal'||l.g==='fee')&&l!==lab))sc-=4;cand.push({t,sc,nu,wm,lab})}
    cand.sort((a,b)=>b.sc-a.sc||(b.lab?1:0)-(a.lab?1:0)||b.t.v-a.t.v);const w=cand[0];
    if(w&&w.sc>=1){const t=w.t;let unit=t.unit||w.nu,guess=false;
      if(!unit&&w.wm&&words.unit)unit=words.v===t.v?words.unit:(words.unit==='toman'&&words.v*10===t.v)?'rial':(words.unit==='rial'&&words.v===t.v*10)?'toman':null;
      if(!unit){const r=new RegExp('(^|[^'+RCP_L+'a-z])'+RCP_UR+'(?!['+RCP_L+'a-z])').test(rcpSkel(T)),m=new RegExp('(^|[^'+RCP_L+'a-z])'+RCP_UT+'(?!['+RCP_L+'a-z])').test(rcpSkel(T));
        if(r&&!m)unit='rial';else if(m&&!r)unit='toman';else{unit='rial';guess=R.kind!=='pos'}}
      R.unit=unit;R.amountRaw=t.d;R.amount=unit==='toman'?t.v:Math.round(t.v/10);
      let c=w.sc>=11?.97:w.sc>=9?.93:w.sc>=7?.88:w.sc>=5?.75:w.sc>=3?.55:.4;if(t.fixed){c*=.6;W.push('amount-letters-fixed')}if(t.bad){c*=.5;W.push('amount-bad-grouping')}
      if(guess){c*=.8;W.push('unit-assumed-rial')}if(unit==='rial'&&t.v%10){c*=.6;W.push('rial-not-multiple-of-10')}
      const r2=cand[1];if(r2&&r2.sc>=w.sc-1&&r2.t.v!==t.v){c*=.7;W.push('amount-ambiguous')}
      if(words&&!w.wm&&words.v>=1000){c*=.7;W.push('amount-words-differ')}
      C.amount=+c.toFixed(2);C.unit=guess?.5:(t.unit||w.nu||w.wm)?.95:.8}
    else W.push('no-amount')}
  if(R.status==='fail')W.push('status-fail');
  R.score=rcpScore(R);return R}
function rcpScore(p){if(!p||!p.ok)return 0;const c=p.conf||{};return +((c.amount||0)*4+(c.tn||0)*2+(c.date||0)*1.5+(c.time||0)*.5+Math.max(c.fromCard||0,c.toCard||0,c.toIban||0)+(p.kind!=='unknown'?.5:0)+(p.status!=='unknown'?.5:0)+(p.bank?.5:0)+((c.toName||c.fromName)?.5:0)).toFixed(2)}
/* is this OCR text a bank receipt at all (and not, say, a photo of the scale)? */
function rcpLooksLike(text){try{const p=rcpParse(text);if(!p.ok)return {isReceipt:false,score:0};
  const s=(p.amount?2:0)+((p.conf.unit||0)>.9?1:0)+(p.tn?2:0)+(p.date?1:0)+(p.time?.5:0)+((p.fromCard||p.toCard)?1.5:0)+(p.toIban?1.5:0)+(p.kind!=='unknown'?1.5:0)+(p.status!=='unknown'?1:0)+(p.bank?1:0)+(p.terminal?1:0);
  const score=+Math.min(1,s/7).toFixed(2);return {isReceipt:score>=.45&&!!(p.amount||p.tn||p.fromCard||p.toCard||p.toIban),score}}catch(e){return {isReceipt:false,score:0}}}
/* ---------------- image → OCR → parse ---------------- */
function rcpNow(){return typeof performance!=='undefined'&&performance.now?performance.now():Date.now()}
function rcpLoad(src){return new Promise((res,rej)=>{try{
  if(typeof HTMLCanvasElement!=='undefined'&&src instanceof HTMLCanvasElement)return res(src);
  const draw=im=>{const c=document.createElement('canvas');c.width=im.naturalWidth||im.width;c.height=im.naturalHeight||im.height;c.getContext('2d').drawImage(im,0,0);res(c)};
  if(typeof HTMLImageElement!=='undefined'&&src instanceof HTMLImageElement){if(src.complete&&src.naturalWidth)return draw(src);src.onload=()=>draw(src);src.onerror=()=>rej(new Error('image'));return}
  if(typeof ImageBitmap!=='undefined'&&src instanceof ImageBitmap)return draw(src);
  let url=null,rv=false;if(typeof Blob!=='undefined'&&src instanceof Blob){url=URL.createObjectURL(src);rv=true}else if(typeof src==='string')url=src;else return rej(new Error('source'));
  const im=new Image();im.onload=()=>{draw(im);if(rv)URL.revokeObjectURL(url)};im.onerror=()=>{if(rv)URL.revokeObjectURL(url);rej(new Error('image'))};im.src=url}catch(e){rej(e)}})}
/* cheap look at the picture: dark-mode screenshot? flat background (screenshot / shared card) or a camera photo? */
function rcpAnalyze(cv){const W=cv.width,H=cv.height,k=Math.min(1,180/Math.max(W,H)),w=Math.max(8,Math.round(W*k)),h=Math.max(8,Math.round(H*k)),c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(cv,0,0,w,h);const p=g.getImageData(0,0,w,h).data,hist=new Uint32Array(32);let sum=0;const n=w*h;
  for(let i=0;i<p.length;i+=4){const y=(p[i]*299+p[i+1]*587+p[i+2]*114)/1000;sum+=y;hist[y>>3]++}
  let top=0,ti=0,acc=0,med=0;for(let i=0;i<32;i++){if(hist[i]>top){top=hist[i];ti=i}}for(let i=0;i<32;i++){acc+=hist[i];if(acc>=n/2){med=i*8+4;break}}
  const flat=(top+(hist[ti-1]||0)+(hist[ti+1]||0))/n;return {W,H,mean:sum/n,median:med,bg:ti*8+4,flat,dark:med<105,shot:flat>=.45,tall:H/W>=1.9}}
function rcpPrep(cv,an,v){const long=Math.max(an.W,an.H);let sc=an.shot?Math.max(1,Math.min(2.2,1400/an.W)):(long<1500?Math.min(2.5,1700/long):long>1900?1900/long:1);if(long*sc>3400)sc=3400/long;/* screenshots: text size follows the width; small Persian digits need the upscale */
  const W=Math.round(an.W*sc),H=Math.round(an.H*sc),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.imageSmoothingQuality='high';g.drawImage(cv,0,0,W,H);
  const d=g.getImageData(0,0,W,H),p=d.data,n=W*H,Y=new Float32Array(n);for(let i=0,k=0;k<n;i+=4,k++){const y=(p[i]*299+p[i+1]*587+p[i+2]*114)/1000;Y[k]=v.inv?255-y:y}
  if(an.shot&&an.tall&&!v.nocrop){const bg=v.inv?255-an.bg:an.bg,t=Math.round(H*.052),b=Math.round(H*.965);for(let k=0;k<t*W;k++)Y[k]=bg;for(let k=b*W;k<n;k++)Y[k]=bg}/* status bar clock / home bar */
  if(v.thr){const S=new Float64Array((W+1)*(H+1));for(let y=0;y<H;y++){let row=0;for(let x=0;x<W;x++){row+=Y[y*W+x];S[(y+1)*(W+1)+x+1]=S[y*(W+1)+x+1]+row}}
    const r=Math.max(8,Math.round(Math.min(W,H)/40)),T=.86;for(let y=0;y<H;y++){const y0=Math.max(0,y-r),y1=Math.min(H,y+r+1);for(let x=0;x<W;x++){const x0=Math.max(0,x-r),x1=Math.min(W,x+r+1),m=(S[y1*(W+1)+x1]-S[y0*(W+1)+x1]-S[y1*(W+1)+x0]+S[y0*(W+1)+x0])/((y1-y0)*(x1-x0)),k=y*W+x;Y[k]=(Y[k]<m*T&&m-Y[k]>22)?0:255}}}/* the absolute gap keeps sensor noise of flat dark areas from turning into speckle (tesseract then takes minutes) */
  for(let i=0,k=0;k<n;i+=4,k++){const y=Y[k];p[i]=p[i+1]=p[i+2]=y;p[i+3]=255}g.putImageData(d,0,0);return c}
/* source: dataURL / URL / Blob / File / <img> / <canvas> / ImageBitmap. worker: the tesseract.js worker of ocrWorker() (eng+fas).
   opts: {maxTries:2, good:7, budgetMs:30000, now}. Resolves {ok,text,parsed,tries,ms}; never rejects. */
async function rcpRead(source,worker,opts){const t0=rcpNow(),o=opts||{},tries=[];let best=null;const all=[];
  try{const cv=await rcpLoad(source),an=rcpAnalyze(cv);
    const plan=o.plan||(an.dark?[{id:'inv',inv:1},{id:'inv+thr',inv:1,thr:1}]:an.shot?[{id:'plain'},{id:'thr',thr:1}]:[{id:'thr',thr:1},{id:'plain'}]),max=o.maxTries||2,good=o.good||7,budget=o.budgetMs||30000;
    for(const v of plan){if(tries.length>=max||(tries.length&&rcpNow()-t0>budget*.55))break;const t1=rcpNow();let text='',cf=0,err='';
      try{const img=rcpPrep(cv,an,v),r=await worker.recognize(img,{},{text:true,blocks:false,hocr:false,tsv:false});text=(r&&r.data&&r.data.text)||'';cf=(r&&r.data&&r.data.confidence)||0}catch(e){err=String(e&&e.message||e)}
      const parsed=rcpParse(text,o);tries.push({variant:v.id,ms:Math.round(rcpNow()-t1),score:parsed.score||0,ocrConf:cf,chars:text.length,err});all.push({text,parsed});
      if(!best||(parsed.score||0)>(best.parsed.score||0))best={text,parsed};if((parsed.score||0)>=good&&(parsed.conf.amount||0)>=.85)break}
    if(!best)return {ok:false,why:'no-ocr',text:'',parsed:rcpEmpty('no-ocr'),tries,ms:Math.round(rcpNow()-t0),image:an};
    const P=best.parsed;/* second opinion from the other tries: agreement raises, disagreement lowers the confidence; missing fields are filled in */
    for(const x of all){const q=x.parsed;if(q===P||!q.ok||!P.ok)continue;
      for(const f of ['amountRaw','tn']){const k=f==='amountRaw'?'amount':'tn';if(P[f]&&q[f]){if(P[f]===q[f])P.conf[k]=Math.min(.99,(P.conf[k]||0)+.05);else{P.conf[k]=+((P.conf[k]||0)*.6).toFixed(2);P.warn.push(k+'-tries-differ')}}}
      for(const f of ['tn','date','time','fromCard','toCard','toIban','toName']){if(!P[f]&&q[f]){P[f]=q[f];P.conf[f]=+((q.conf[f]||.5)*.8).toFixed(2);if(f==='date')P.dateFa=q.dateFa;if(f==='tn')P.tnAll=q.tnAll}}
      if(!P.amount&&q.amount){P.amount=q.amount;P.amountRaw=q.amountRaw;P.unit=q.unit;P.conf.amount=+((q.conf.amount||.5)*.8).toFixed(2)}}
    P.score=rcpScore(P);return {ok:!!P.ok,text:best.text,parsed:P,tries,ms:Math.round(rcpNow()-t0),image:{w:an.W,h:an.H,dark:an.dark,shot:an.shot}}}
  catch(e){return {ok:false,why:String(e&&e.message||e),text:'',parsed:rcpEmpty('error'),tries,ms:Math.round(rcpNow()-t0)}}}

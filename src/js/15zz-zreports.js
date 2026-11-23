/* ---- v102.3 گزارش‌ها ----
   صاحب اپ (عکس منوی «گزارش» کیمیا): «این قسمت گزارش‌ها را برای برنامه می‌خواهم، در نوار ابزار اصلی، انتهای سمت چپ؛ قشنگ طراحی و درست شود».
   زبانه «گزارش» آخرِ نوار پایین (سمت چپ). صفحه reports = هاب کاشی‌ها در چهار گروه؛ هر گزارش = صفحه rpt (همه از داده‌های موجود، چیزی ذخیره نمی‌شود):
   بازه زمانی RPT.p (امروز/دیروز/هفته/ماه/ماه قبل/امسال/همه/دلخواه با تقویم)، کارت جمع‌ها، ردیف‌ها (زدن = باز شدن حساب یا سند).
   علامت‌ها مثل همه‌جای برنامه: txD/cuBal مثبت = بدهکاریم (آبی)، منفی = طلبکاریم (قرمز). */
IC.rep='<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>';
FULLP.add('rpt');SLIDEP.add('rpt');PARENT.rpt='reports';TAB.reports='reports';TAB.rpt='reports';TITLES.reports='گزارش‌ها';TITLES.rpt='گزارش';
let RPT={k:'',f:'',t:'',d:null,s:'all',o:'a',q:'',i:0};
const rpIso=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const rpJ=(y,m,d)=>{const[a,b,c]=j2g(y,m,d);return a+'-'+p2(b)+'-'+p2(c)};
const rpAdd=(iso,n)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return rpIso(d)};
/* v102.6 (صاحب اپ: «کادر سرچ، فیلتر و تقویم همان‌طور که در برنامه درست شده»): بازه = همان بازه‌های آماده گردش حساب (stmQk) و همان پنجره «بازه تاریخ»؛
   پیش‌فرض «این ماه» */
const rpInit=()=>{if(RPT.i)return;const m=stmQk().find(o=>o[0]==='m');RPT.f=m[2];RPT.t=m[3];RPT.i=1};
function rpRange(){rpInit();return [RPT.f||'',RPT.t||'9999-12-31']}
const rpPerTx=()=>{rpInit();if(!RPT.f&&!RPT.t)return 'همه تاریخ‌ها';const q=stmQk().find(o=>o[2]===RPT.f&&o[3]===RPT.t&&o[0]!=='all');return q?q[1]:stmPer({f:RPT.f,t:RPT.t})};
/* همه سندهای زنده حساب‌ها در بازه (حساب‌های بانکی فقط وقتی bk) */
function rpDocs(bk){const[f,t]=rpRange(),L=[];for(const c of CU()){if(!bk&&c.grp==='بانک')continue;for(const x of (c.txs||[])){if(!x||x.del||x.draft||!x.date)continue;if(x.date<f||x.date>t)continue;L.push({c,t:x})}}return L}
const rpSide=v=>v>0?'b':v<0?'r':'z',rpSideT=v=>v>0?'بدهکاریم':v<0?'طلبکاریم':'تسویه';
const rpDays=iso=>Math.max(0,Math.round((new Date(todayISO()+'T12:00:00')-new Date(iso+'T12:00:00'))/864e5));
const rpN=v=>toFa(String(v));
/* ---------- تعریف گزارش‌ها: [کلید، عنوان، توضیح، آیکون، رنگ، گروه، بازه دارد؟] ---------- */
const RPL=[
  ['bal','مانده حساب و مدت','مانده هر حساب و از چند روز پیش باز است','users','v','a',0],
  ['moin','دفتر معین','گردش و صورتحساب یک حساب','list','b','a',0],
  ['ppl','کارکرد اشخاص','فروش، خرید، دریافت و پرداخت هر حساب','user','v','a',1],
  ['cap','سهم شرکا','مانده حساب‌های سرمایه','split','v','a',0],
  ['exp','هزینه‌ها','سندهای حساب‌های هزینه','tag','r','a',1],
  ['stk','موجودی اجناس','موجودی همه کالاها و اصلاح آن','coin','a','g',0],
  ['abs','موجودی آبشده و متفرقه','طلای خام مغازه','coin','a','g',0],
  ['gds','کارکرد اجناس','فروش و خرید هر کالا','ring','a','g',1],
  ['cond','دفتر شرطی','آبشده‌هایی که عیارشان ثبت نشده','clock','a','g',0],
  ['fwd','دفتر فردایی','فروش و خرید پولی (طلا تحویل نشده)','swap','a','g',1],
  ['gfx','تأثیر نوسان طلا','اثر بالا و پایین رفتن قیمت بر دارایی طلا','rep','a','g',0],
  ['tr','تراز خرید و فروش','جمع فروش و خرید طلا، سکه و ارز','rep','g','s',1],
  ['prof','سود فروش','اجرت و سود کالاهای فروخته‌شده','rep','g','s',1],
  ['day','دفتر روزانه','همه سندهای ثبت‌شده در بازه','cal','b','s',1],
  ['chq','دفتر چک','چک‌های ثبت‌شده در حساب‌های بانکی','bank','b','s',1],
  ['hist','تاریخچه کارها','همه کارهای کاربران','clock','b','x',0]];
const RPG=[['a','حساب‌ها'],['g','طلا و کالا'],['s','فروش و دفترها'],['x','سیستم']];
const rpDef=k=>RPL.find(z=>z[0]===k);
function vReports(){const ic2=k=>IC[k]?ic(k):ic('list');
  return `<div class="rpw">${RPG.map(([g,gt])=>`<div class="rpgh">${gt}</div><div class="rpgr">${RPL.filter(z=>z[5]===g).map((z,i)=>`<button class="rpti t-${z[4]}" data-act="rpGo" data-k="${z[0]}" style="--i:${i}"><i>${ic2(z[3])}</i><span><b>${z[1]}</b><small>${z[2]}</small></span></button>`).join('')}</div>`).join('')}</div>`}
ACT.rpGo=d=>{const k=d.k;if(k==='stk'||k==='abs'){STK.f=k==='abs'?'g':'all';STK.q='';meRet='reports';closeSheet();go('stock');return}
  if(k==='moin'){go('custs');setTimeout(()=>toast('حساب را انتخاب کنید؛ گردش و صورتحساب در صفحه حساب است'),300);return}
  if(k==='hist'){histTab='ev';go('audit');return}
  if(RPT.k!==k){RPT.s='all';RPT.o='a';RPT.q=''}RPT.k=k;const D=rpDef(k);TITLES.rpt=D?D[1]:'گزارش';go('rpt')};
/* پنجره بازه تاریخ — همان شکل و رفتار «بازه تاریخ» گردش حساب (stmRangeHTML): خلاصه بالا، بازه‌های آماده با تعداد، بازه دلخواه با تقویم */
const rpCnt=(f,t)=>{const s0=[RPT.f,RPT.t];RPT.f=f;RPT.t=t;let n=0;try{n=rpDocs(1).length}catch(_){}RPT.f=s0[0];RPT.t=s0[1];return n};
function rpRangeHTML(){const D=RPT.d||{f:RPT.f,t:RPT.t},Q=stmQk(),on=Q.find(o=>o[2]===D.f&&o[3]===D.t),n=D.f&&D.t?Math.round((new Date(D.t+'T12:00:00')-new Date(D.f+'T12:00:00'))/864e5)+1:0,Df=rpDef(RPT.k)||[];
  const side=(w,l)=>{const v=D[w];return `<button type="button" class="srd${v?' on':''}" data-act="rpCal" data-w="${w}"><small>${l}</small><b>${v?esc(dates(v).fa):w==='f'?'اول':'امروز'}</b><em>${v?esc(dates(v).wd):'بدون محدودیت'}</em>${v?`<i data-act="rpDClr" data-w="${w}" role="button" aria-label="برداشتن">×</i>`:''}</button>`};
  return `<div class="sh-h"><div><b>بازه تاریخ</b><small class="shsub">${esc(Df[1]||'گزارش')}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="srw sr2"><div class="srn"><span class="srni">${ic('cal')}</span><span><b>${D.f||D.t?(D.f?esc(dates(D.f).fa):'اول')+' تا '+(D.t?esc(dates(D.t).fa):'امروز'):'همه تاریخ‌ها'}</b><small>${n?fmt(n)+' روز · ':''}${fmt(rpCnt(D.f,D.t))} سند</small></span></div>
  <div class="f6h">بازه‌های آماده</div><div class="cufg2">${Q.slice().sort((a,b)=>(a[0]==='all')-(b[0]==='all')?(a[0]==='all'?-1:1):0).map(([k,l,f,t])=>`<button type="button" class="cufr${on&&on[0]===k?' on':''}" data-act="rpQk" data-k="${k}"><span class="cufi">${ic(k==='all'?'list':'cal')}</span><span class="tx"><b>${l}</b>${f?`<small>${f===t?esc(dates(f).fa):esc(dates(f).fa)+' تا '+esc(dates(t).fa)}</small>`:''}</span><em>${fmt(rpCnt(f,t))} سند</em><span class="cufc">${ic('check')}</span></button>`).join('')}</div><div class="f6h">بازه دلخواه</div><div class="srs">${side('f','از')}<span class="sra">${ic('back')}</span>${side('t','تا')}</div>
  <button type="button" class="btn gold srgo" data-act="rpApply">${ic('check')} نمایش این بازه</button></div>`}
ACT.rpRange=()=>{rpInit();RPT.d={f:RPT.f,t:RPT.t};sheet(rpRangeHTML())};
ACT.rpQk=d=>{const o=stmQk().find(x=>x[0]===d.k);if(!o)return;RPT.f=o[2];RPT.t=o[3];RPT.d={f:RPT.f,t:RPT.t};render();if($('sheet')&&!$('ov').classList.contains('hide')){sheetKeep(rpRangeHTML());const S=$('sheet'),on=S&&S.querySelector('.cufr.on');if(on&&!RM()&&on.animate)on.animate([{transform:'scale(.97)'},{transform:'none'}],{duration:260,easing:'cubic-bezier(.3,1.4,.5,1)'})}};
ACT.rpDClr=d=>{if(!RPT.d)return;RPT.d[d.w]='';sheetKeep(rpRangeHTML())};
ACT.rpCal=d=>{const w=d.w,D=RPT.d||(RPT.d={f:RPT.f,t:RPT.t});openCal(D[w]||(w==='f'&&D.t?D.t:todayISO()),iso=>{D[w]=iso;if(D.f&&D.t&&D.f>D.t){if(w==='f')D.t=iso;else D.f=iso}sheet(rpRangeHTML())},{title:w==='f'?'از تاریخ':'تا تاریخ',sub:'بازه گزارش',q:[[0,'امروز'],[-1,'دیروز'],[-7,'یک هفته پیش']]})};
ACT.rpApply=()=>{const D=RPT.d;if(D){RPT.f=D.f||'';RPT.t=D.t||''}RPT.d=null;closeSheet();render()};
ACT.rpAll=()=>{RPT.f='';RPT.t='';RPT.q='';RPT.s='all';render()};
/* فیلتر — همان پنجره فیلتر حساب‌ها (ردیف‌های cufr با تعداد و تیک) */
const RPFL={bal:[['s','نمایش',[['all','همه حساب‌های باز','list'],['r','طلبکاریم','debt'],['b','بدهکاریم','debt']]],['o','مرتب‌سازی',[['a','بیشترین مبلغ','sort'],['d','قدیمی‌ترین مانده','clock']]]]};
function rpFiltHTML(){const F=RPFL[RPT.k]||[],C=rpFCnt();return `<div class="sh-h"><div><b>فیلتر</b><small class="shsub">${esc((rpDef(RPT.k)||[])[1]||'')}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div><div class="srw">${F.map(([f,t,L])=>`<div class="f6h">${t}</div><div class="cufg2">${L.map(([v,l,i])=>`<button type="button" class="cufr${RPT[f]===v?' on':''}" data-act="rpFS" data-f="${f}" data-v="${v}"><span class="cufi">${ic(i)}</span><span class="tx"><b>${l}</b></span>${f==='s'?`<em>${fmt(C[v]||0)}</em>`:''}<span class="cufc">${ic('check')}</span></button>`).join('')}</div>`).join('')}</div>`}
const rpFCnt=()=>{const o={all:0,r:0,b:0};if(RPT.k!=='bal')return o;for(const c of CU()){if(c.grp==='بانک')continue;const b=cuBal(c);if(Math.abs(b.R)<1&&Math.abs(b.G)<0.0005)continue;o.all++;if(b.R<0)o.r++;else if(b.R>0)o.b++}return o};
ACT.rpFilt=()=>sheet(rpFiltHTML());
ACT.rpFS=d=>{RPT[d.f]=d.v;render();if($('sheet')&&!$('ov').classList.contains('hide'))sheetKeep(rpFiltHTML())};
const rpFN=()=>(RPT.s!=='all'?1:0);
/* نوار جستجو: همان کادر جستجوی گردش حساب (fsearch + دکمه‌های فیلتر و بازه داخلش)؛ جستجو ردیف‌ها را همان‌جا فیلتر می‌کند (کیبورد بسته نمی‌شود) */
function rpBar(per){const D=rpDef(RPT.k)||[],fl=!!RPFL[RPT.k],rn=per&&(RPT.f||RPT.t);
  return `<div class="stmbar rpsb"><div class="fsearch stms2">${ic('search')}<input id="rpQ" type="search" enterkeyhint="search" autocomplete="off" placeholder="جستجو در ${esc(D[1]||'گزارش')}…" value="${esc(RPT.q)}">${RPT.q?`<button type="button" class="x" data-act="rpQClr" aria-label="پاک کردن جستجو">×</button>`:''}${fl?`<button type="button" class="cufbtn${rpFN()?' on':''}" data-act="rpFilt" aria-label="فیلتر">${ic('filter')}<span>فیلتر</span>${rpFN()?`<em>${toFa(rpFN())}</em>`:''}</button>`:''}${per?`<button type="button" class="cufbtn${rn?' on':''}" data-act="rpRange" aria-label="بازه تاریخ">${ic('cal')}<span>${esc(rn?rpPerTx():'بازه')}</span></button>`:''}</div></div>`
   +(per&&rn||rpFN()?`<div class="stmsum"><span>${per?esc(rpPerTx()):''}${rpFN()?(per?' · ':'')+'فیلتر: '+esc((((RPFL[RPT.k]||[])[0]||[])[2]||[]).find(x=>x[0]===RPT.s)?.[1]||''):''}</span><button type="button" class="lnk" data-act="rpAll">نمایش همه</button></div>`:'')}
ACT.rpQClr=()=>{RPT.q='';render()};
function rpQApply(){const v=$('view'),q=toFa(clean(RPT.q||'')).replace(/ي/g,'ی').replace(/ك/g,'ک'),L=v?v.querySelectorAll('.rpls>*'):[];let shown=0;
  L.forEach(el=>{if(el.classList.contains('fday')||el.classList.contains('rpdh'))return;const ok=!q||toFa(el.textContent||'').includes(q);el.hidden=!ok;if(ok)shown++});
  L.forEach(el=>{if(!(el.classList.contains('fday')||el.classList.contains('rpdh')))return;let n=el.nextElementSibling,any=false;while(n&&!(n.classList.contains('fday')||n.classList.contains('rpdh'))){if(!n.hidden){any=true;break}n=n.nextElementSibling}el.hidden=!!q&&!any});
  let m=v&&v.querySelector('.rpnq');if(q&&!shown){if(!m&&v){const w=v.querySelector('.rpls');if(w)w.insertAdjacentHTML('afterend','<div class="stmno rpnq">'+ic('search')+'<b>ردیفی پیدا نشد</b><small>جستجو را عوض کنید</small></div>')}}else if(m)m.remove()}
/* دومین تابع صفحه، متن نوار پایین (#act) را برمی‌گرداند — اینجا خالی؛ وصل کردن جستجو بعد از رسم */
function aRpt(){setTimeout(rpBindQ,0);return ''}
function rpBindQ(){const I=$('rpQ');if(!I)return;I.oninput=()=>{clearTimeout(I._t);I._t=setTimeout(()=>{RPT.q=I.value;rpQApply();const x=I.parentNode.querySelector('.x');if(RPT.q&&!x)I.insertAdjacentHTML('afterend','<button type="button" class="x" data-act="rpQClr" aria-label="پاک کردن جستجو">×</button>');else if(!RPT.q&&x)x.remove()},120)};I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();I.blur()}};if(RPT.q)rpQApply()}
ACT.rpS=d=>{RPT[d.f]=d.v;render()};
/* برگشت از حساب یا سندی که از گزارش باز شده = همان گزارش (PARENT.cust موقت؛ با رسیدن دوباره به گزارش پس گرفته می‌شود) */
ACT.rpCu=d=>{const c=custs.find(x=>String(x.id)===String(d.id));if(!c)return;ACT.cuOpen({id:c.id});if(cur==='cust')PARENT.cust='rpt'};
ACT.rpTx=d=>{const p0=PARENT.inv;invOpen(d.cu,+d.tx||d.tx);if(cur==='inv')IVR.push({pg:'rpt',cu:custId,p:p0})};
/* ---------- اجزای صفحه ---------- */
const rpPerH=()=>rpBar(1);
const rpSegH=(f,L)=>`<div class="rpseg">${L.map(([v,t])=>`<button class="${RPT[f]===v?'on':''}" data-act="rpS" data-f="${f}" data-v="${v}">${t}</button>`).join('')}</div>`;
const rpSum=L=>`<div class="rpsm c${Math.min(L.length,3)}">${L.map(([l,v,c,s])=>`<div class="${c||''}"><small>${l}</small><b>${v}</b>${s?`<em>${s}</em>`:''}</div>`).join('')}</div>`;
const rpVal=(v,u,f)=>`<em class="${rpSide(v)}"><b>${f?f(Math.abs(v)):fmt(Math.abs(v))}</b>${u?` <u>${u}</u>`:''}<small>${rpSideT(v)}</small></em>`;
const rpRow=(o)=>`<button class="rprw${o.cls?' '+o.cls:''}"${o.at||''}><span class="rpa">${o.av||''}</span><span class="rpt"><b>${o.t}</b>${o.s?`<small>${o.s}</small>`:''}</span><span class="rpv">${o.v||''}</span></button>`;
/* ردیف سند = همان ردیف گردش حساب (txRow) با نام مشتری بالای عنوان؛ زدن = باز شدن همان سند (rpTx)، بدون کشیدن حذف */
function rpTxRow(c,t){let h='';try{h=txRow(c,t)}catch(_){return ''}const a=h.indexOf('<button class="txr'),b=h.lastIndexOf('</button>');if(a<0||b<a)return '';h=h.slice(a,b+9);
  return `<div class="fcard rpfc">${h.replace(/data-act="txOpen" data-id="[^"]*"/,`data-act="rpTx" data-cu="${c.id}" data-tx="${t.id}"`).replace('<span class="tx"><b>',`<span class="tx"><em class="rpcn">${esc(cuName(c))}</em><b>`)}</div>`}
const rpCuRow=(c,b,i,note)=>{try{return cuRowH(c,b,i,null,{sw:false,act:'rpCu',note})}catch(_){return ''}};
const rpAv=c=>`<i class="rpav">${esc((cuName(c)||'؟').trim().slice(0,1))}</i>`;
const rpEmpty=t=>`<div class="rpem">${ic('info')}<b>${t||'در این بازه چیزی نیست'}</b></div>`;
const rpHead=(sub)=>{const D=rpDef(RPT.k)||[];return `<div class="rphd t-${D[4]||'b'}"><i>${IC[D[3]]?ic(D[3]):ic('list')}</i><span><b>${D[1]||''}</b><small>${sub||D[2]||''}</small></span></div>`};
/* ---------- گزارش‌ها ---------- */
const RPF={
bal(){const T=todayISO();let A=[];for(const c of CU()){if(c.grp==='بانک')continue;const b=cuBal(c);if(Math.abs(b.R)<1&&Math.abs(b.G)<0.0005)continue;
    let od='';const m=cuOpenMap(c);for(const t of (c.txs||[])){if(!t||t.del)continue;const o=m.get(String(t.id));if(o&&o.r&&o.r.rem>0&&t.date&&(!od||t.date<od))od=t.date}
    A.push({c,b,R:b.R,G:b.G,od,d:od?rpDays(od):0})}
  const tr=A.filter(a=>a.R<0),tb=A.filter(a=>a.R>0),sR=tr.reduce((s,a)=>s+a.R,0),sB=tb.reduce((s,a)=>s+a.R,0),sG=A.reduce((s,a)=>s+a.G,0);
  if(RPT.s==='r')A=tr;else if(RPT.s==='b')A=tb;
  A.sort(RPT.o==='d'?(x,y)=>y.d-x.d||Math.abs(y.R)-Math.abs(x.R):(x,y)=>Math.abs(y.R)-Math.abs(x.R));
  return rpBar(0)+rpSum([['طلبکاریم · '+rpN(tr.length)+' حساب',fmt(Math.abs(sR)),'r','تومان'],['بدهکاریم · '+rpN(tb.length)+' حساب',fmt(sB),'b','تومان'],['طلا · خالص',wFmt(Math.abs(sG))+' گرم',rpSide(sG),rpSideT(sG)]])
   
   +(A.length?`<div class="cuLs"><div class="cuL rpls rpcl">${A.slice(0,400).map((a,i)=>rpCuRow(a.c,a.b,i,a.od?`باز از ${dates(a.od).fa} · ${rpN(a.d)} روز`:'')).join('')}</div></div>`:rpEmpty('حساب بازی نیست'))},
day(){const L=rpDocs(1).filter(z=>z.t.type==='inv').sort((a,b)=>String(b.t.date+(b.t.at||'')).localeCompare(String(a.t.date+(a.t.at||''))));
  let S=0,I=0,O=0;L.forEach(({t})=>stmtLines(t).forEach(l=>{const a=+l[8]||0;if(l[0]==='فروش')S+=a;else if(l[0]==='دریافت')I+=Math.abs(a);else if(l[0]==='پرداخت')O+=Math.abs(a)}));
  let last='',h='';L.slice(0,500).forEach(({c,t})=>{if(t.date!==last){last=t.date;const r=relDay(t.date);h+=`<div class="fday">${['امروز','دیروز','فردا'].includes(r)?r+'، ':''}${esc(dates(t.date).fa)}</div>`}h+=rpTxRow(c,t)});
  return rpPerH()+rpSum([['سند',rpN(L.length),''],['فروش',fmt(S),'r','تومان'],['دریافت',fmt(I),'b','تومان'],['پرداخت',fmt(O),'r','تومان']].slice(0,4))+(L.length?`<div class="rpls">${h}</div>`:rpEmpty())},
ppl(){const M=new Map();for(const {c,t} of rpDocs(0)){if(t.type!=='inv')continue;const o=M.get(c.id)||{c,n:0,s:0,b:0,i:0,o:0,gi:0,go:0};o.n++;
    stmtLines(t).forEach(l=>{const a=+l[8]||0,tg=l[0];if(tg==='فروش')o.s+=a;else if(tg==='خرید'||tg==='تعویض')o.b+=Math.abs(a);else if(tg==='دریافت'){if(l[3]==='گرم'&&!a)o.gi+=+l[2]||0;else o.i+=Math.abs(a)}else if(tg==='پرداخت')o.o+=Math.abs(a);else if(tg==='تحویل'&&l[3]==='گرم')o.go+=+l[2]||0});M.set(c.id,o)}
  const A=[...M.values()].sort((x,y)=>(y.s+y.b)-(x.s+x.b)),t=k=>A.reduce((s,o)=>s+o[k],0);
  const part=(l,v,c)=>v?`<i class="${c}">${l} ${fmt(Math.round(v))}</i>`:'';
  return rpPerH()+rpSum([['فروش',fmt(t('s')),'r','تومان'],['خرید',fmt(t('b')),'b','تومان'],['حساب فعال',rpN(A.length),'']])
   +(A.length?`<div class="rpls">${A.map(o=>rpRow({cls:'tall',av:rpAv(o.c),t:esc(cuName(o.c)),s:`<span class="rppl">${rpN(o.n)} سند ${part('فروش',o.s,'r')}${part('خرید',o.b,'b')}${part('دریافت',o.i,'b')}${part('پرداخت',o.o,'r')}${o.gi?`<i class="a">دریافت طلا ${wFmt(o.gi)}</i>`:''}${o.go?`<i class="a">تحویل طلا ${wFmt(o.go)}</i>`:''}</span>`,v:`<em class="z"><b>${fmt(Math.round(o.s+o.b))}</b><small>گردش</small></em>`,at:` data-act="rpCu" data-id="${o.c.id}"`})).join('')}</div>`:rpEmpty())},
gds(){const M=new Map(),G=k=>{let o=M.get(k);if(!o){o={k,sw:0,sa:0,bw:0,ba:0,iw:0,ow:0,n:0,u:'گرم'};M.set(k,o)}return o};
  for(const {t} of rpDocs(0)){if(t.type!=='inv')continue;(t.items||[]).forEach(it=>{const o=G(it.k||'کالا');o.sw+=+it.w||0;o.sa+=+it.tot||0;o.n++});
    (t.xr||[]).forEach(x=>{const g=x.a==='gold',k=g?(x.pul?'طلای پولی':(x.cat==='تعویض'||x.cat==='مرجوعی'?'متفرقه':x.cat||'متفرقه')):((XA[x.a]||{}).t||x.a),o=G(k),q=g?(+x.w||0):(+x.q||0);if(!g)o.u=(XA[x.a]||{}).u||'عدد';o.n++;
      if(x.t==='sell'){o.sw+=q;o.sa+=+x.amount||0}else if(x.t==='buy'){o.bw+=q;o.ba+=+x.amount||0}else if(x.t==='in')o.iw+=q;else if(x.t==='out')o.ow+=q})}
  const A=[...M.values()].sort((x,y)=>(y.sa+y.ba)-(x.sa+x.ba)||(y.sw+y.bw)-(x.sw+x.bw)),W=(v,u)=>u==='گرم'?wFmt(v):qFmt(v);
  const sw=A.filter(o=>o.u==='گرم').reduce((s,o)=>s+o.sw,0),bw=A.filter(o=>o.u==='گرم').reduce((s,o)=>s+o.bw,0);
  return rpPerH()+rpSum([['طلای فروخته',wFmt(sw)+' گرم','r'],['طلای خریده',wFmt(bw)+' گرم','b'],['قلم',rpN(A.length),'']])
   +(A.length?`<div class="rpls">${A.map(o=>rpRow({cls:'tall',av:`<i class="rpav g">${ic(o.u==='گرم'?'ring':'coin')}</i>`,t:esc(o.k),s:`<span class="rppl">${o.sw?`<i class="r">فروش ${W(o.sw,o.u)} ${o.u}</i>`:''}${o.bw?`<i class="b">خرید ${W(o.bw,o.u)} ${o.u}</i>`:''}${o.iw?`<i class="a">دریافت ${W(o.iw,o.u)}</i>`:''}${o.ow?`<i class="a">تحویل ${W(o.ow,o.u)}</i>`:''}</span>`,v:o.sa||o.ba?`<em class="z"><b>${fmt(Math.round(o.sa||o.ba))}</b><small>${o.sa?'فروش':'خرید'} · تومان</small></em>`:''})).join('')}</div>`:rpEmpty())},
tr(){const K={};let gS=0,gSa=0,gB=0,gBa=0,gI=0,gO=0,iS=0;
  for(const {t} of rpDocs(0)){if(t.type!=='inv')continue;(t.items||[]).forEach(it=>{gS+=(+it.w||0)*(+it.ay||750)/750;iS+=+it.tot||0});
    (t.xr||[]).forEach(x=>{const g=x.a==='gold',q=g?(+x.w||0)*(+x.ay||750)/750:(+x.q||0),a=+x.amount||0;if(g){if(x.t==='sell'){gS+=q;gSa+=a}else if(x.t==='buy'){gB+=q;gBa+=a}else if(x.t==='in')gI+=q;else if(x.t==='out')gO+=q;return}
      const o=K[x.a]=K[x.a]||{s:0,b:0,sa:0,ba:0};if(x.t==='sell'||x.t==='out'){o.s+=q;o.sa+=a}else{o.b+=q;o.ba+=a}})}
  const S=iS+gSa,B=gBa,row=(t,s,v)=>rpRow({t,s,v});
  return rpPerH()+rpSum([['جمع فروش',fmt(Math.round(S)),'r','تومان'],['جمع خرید',fmt(Math.round(B)),'b','تومان'],['خالص',fmt(Math.round(Math.abs(S-B))),S>=B?'r':'b',S>=B?'فروش بیشتر':'خرید بیشتر']])
   +`<div class="rpgh2">طلا · گرم ۷۵۰</div><div class="rpls">${row('فروش طلا (کالا و متفرقه)',`فروش کالا ${fmt(Math.round(iS))} · متفرقه/آبشده ${fmt(Math.round(gSa))} تومان`,`<em class="r"><b>${wFmt(gS)}</b><small>گرم</small></em>`)}${row('خرید طلا',fmt(Math.round(gBa))+' تومان',`<em class="b"><b>${wFmt(gB)}</b><small>گرم</small></em>`)}${row('دریافت طلا (بدون پول)','',`<em class="b"><b>${wFmt(gI)}</b><small>گرم</small></em>`)}${row('تحویل طلا (بدون پول)','',`<em class="r"><b>${wFmt(gO)}</b><small>گرم</small></em>`)}${row('خالص طلای وارد شده',gB+gI-gS-gO>=0?'بیشتر خریده/دریافت شده':'بیشتر فروخته/تحویل شده',`<em class="${gB+gI-gS-gO>=0?'b':'r'}"><b>${wFmt(Math.abs(gB+gI-gS-gO))}</b><small>گرم</small></em>`)}</div>`
   +(Object.keys(K).length?`<div class="rpgh2">سکه و ارز</div><div class="rpls">${Object.entries(K).map(([k,o])=>row(esc((XA[k]||{}).t||k),`فروش/تحویل ${qFmt(o.s)} · خرید/دریافت ${qFmt(o.b)}`,`<em class="${o.b-o.s>=0?'b':'r'}"><b>${qFmt(Math.abs(o.b-o.s))}</b><small>${esc((XA[k]||{}).u||'')} خالص</small></em>`)).join('')}</div>`:'')},
prof(){const M=new Map();let AJ=0,PR=0,TX=0,N=0;
  for(const {t} of rpDocs(0)){if(t.type!=='inv'||!(t.items||[]).length)continue;const rate=+t.rate||(+t.mz?(+t.mz)/MZK:0);
    (t.items||[]).forEach(it=>{const k=it.ab?'آبشده':(it.k||'کالا'),C=itCalc(it,rate,t.tax),o=M.get(k)||{k,w:0,aj:0,pr:0,n:0};o.w+=+it.w||0;o.aj+=C.aj;o.pr+=C.pr;o.n++;M.set(k,o);AJ+=C.aj;PR+=C.pr;TX+=C.tax;N++})}
  const A=[...M.values()].sort((x,y)=>(y.aj+y.pr)-(x.aj+x.pr));
  return rpPerH()+rpSum([['اجرت',fmt(AJ),'g','تومان'],['سود',fmt(PR),'g','تومان'],['جمع',fmt(AJ+PR),'g',rpN(N)+' قلم']])
   +`<div class="rpnote">${ic('info')} فقط اجرت و سود کالاهایی که در سند فروخته شده؛ سود خرید و فروش طلای متفرقه و پولی در این عدد نیست${TX?' · مالیات '+fmt(TX)+' تومان جدا':''}</div>`
   +(A.length?`<div class="rpls">${A.map(o=>rpRow({av:`<i class="rpav g">${ic('ring')}</i>`,t:esc(o.k),s:`${rpN(o.n)} قلم · ${wFmt(o.w)} گرم · اجرت ${fmt(o.aj)}`,v:`<em class="g"><b>${fmt(o.aj+o.pr)}</b><small>اجرت + سود</small></em>`})).join('')}</div>`:rpEmpty('در این بازه کالایی فروخته نشده'))},
exp(){const L=rpDocs(1).filter(z=>z.c.grp==='هزینه').sort((a,b)=>String(b.t.date).localeCompare(String(a.t.date)));const tot=L.reduce((s,z)=>s+(txD(z.t).r||0),0);
  return rpPerH()+rpSum([['جمع هزینه‌ها',fmt(Math.abs(tot)),'r','تومان'],['سند',rpN(L.length),'']])+(L.length?`<div class="rpls">${(()=>{let last='',h='';L.forEach(({c,t})=>{if(t.date!==last){last=t.date;h+=`<div class="fday">${esc(dates(t.date).fa)}</div>`}h+=rpTxRow(c,t)});return h})()}</div>`:rpEmpty('حساب هزینه‌ای در این بازه سند ندارد'))},
cap(){const A=CU().filter(c=>c.grp==='سرمایه').map(c=>({c,b:cuBal(c)}));const s=A.reduce((x,a)=>x+a.b.R,0);
  return rpBar(0)+rpSum([['جمع سرمایه',fmt(Math.abs(s)),rpSide(s),rpSideT(s)],['شریک',rpN(A.length),'']])+(A.length?`<div class="cuLs"><div class="cuL rpls rpcl">${A.map((a,i)=>rpCuRow(a.c,a.b,i,Math.abs(s)>=1?'سهم '+toFa((Math.abs(a.b.R)/Math.abs(s)*100).toFixed(1))+'٪':'')).join('')}</div></div>`:rpEmpty('حسابی با نوع «سرمایه» تعریف نشده'))},
cond(){const R=[];for(const c of CU())for(const t of (c.txs||[])){if(!t||t.del||t.type!=='inv')continue;[...(t.items||[]),...(t.xr||[])].forEach(o=>{if(o.sh===1)R.push({c,t,o})})}
  R.sort((a,b)=>String(a.t.date).localeCompare(String(b.t.date)));const w=R.reduce((s,z)=>s+(+z.o.w||0),0);
  return rpBar(0)+rpSum([['آبشده شرطی',wFmt(w)+' گرم','a'],['ردیف',rpN(R.length),'']])+(R.length?`<div class="rpls">${R.map(({c,t,o})=>rpRow({av:rpAv(c),t:esc(cuName(c)),s:`${o.t==='sell'||o.ab?'فروش':o.t==='out'?'تحویل':o.t==='buy'?'خرید':'دریافت'} · ${dates(t.date).fa} · ${rpN(rpDays(t.date))} روز${o.ang?' · انگ '+esc(o.ang):''}`,v:`<em class="a"><b>${wFmt(+o.w||0)}</b><small>گرم</small></em>`,at:` data-act="rpTx" data-cu="${c.id}" data-tx="${t.id}"`})).join('')}</div>`:rpEmpty('آبشده شرطی بازی نیست'))},
fwd(){const R=[];for(const {c,t} of rpDocs(0)){if(t.type!=='inv')continue;(t.xr||[]).forEach(x=>{if(x.a==='gold'&&x.pul&&x.cat!=='مانده قبلی'&&x.cat!=='قلک'&&(x.t==='sell'||x.t==='buy'))R.push({c,t,x})})}
  const ws=R.filter(z=>z.x.t==='sell').reduce((s,z)=>s+(+z.x.w||0),0),wb=R.filter(z=>z.x.t==='buy').reduce((s,z)=>s+(+z.x.w||0),0);
  return rpPerH()+rpSum([['فروش فردایی',wFmt(ws)+' گرم','r'],['خرید فردایی',wFmt(wb)+' گرم','b'],['خالص',wFmt(Math.abs(ws-wb))+' گرم',ws>=wb?'r':'b',ws>=wb?'فروش بیشتر':'خرید بیشتر']])
   +(R.length?`<div class="rpls">${R.sort((a,b)=>String(b.t.date).localeCompare(String(a.t.date))).map(({c,t,x})=>rpRow({av:rpAv(c),t:esc(cuName(c)),s:`${x.t==='sell'?'فروش':'خرید'} پولی · ${dates(t.date).fa} · ${fmt(+x.amount||0)} تومان`,v:`<em class="${x.t==='sell'?'r':'b'}"><b>${wFmt(+x.w||0)}</b><small>گرم</small></em>`,at:` data-act="rpTx" data-cu="${c.id}" data-tx="${t.id}"`})).join('')}</div>`:rpEmpty())},
chq(){const R=[];for(const {c,t} of rpDocs(1)){if(t.type!=='inv')continue;(t.pays||[]).forEach(p=>{if(p.m==='bkx'&&(p.k==='chk'||p.k==='chq'||p.k==='pass'||p.k==='vos'))R.push({c,t,p})})}
  const lab=k=>({chk:'چک',chq:'در حساب',pass:'پاس شدن',vos:'وصول'})[k]||k,tot=R.reduce((s,z)=>s+Math.abs(+z.p.amount||0),0);
  return rpPerH()+rpSum([['جمع',fmt(tot),'b','تومان'],['چک',rpN(R.length),'']])+(R.length?`<div class="rpls">${R.map(({c,t,p})=>rpRow({av:rpAv(c),t:esc(cuName(c)),s:`${lab(p.k)} · ${dates(t.date).fa}${p.why?' · '+esc(p.why):''}`,v:`<em class="b"><b>${fmt(Math.abs(+p.amount||0))}</b><small>تومان</small></em>`,at:` data-act="rpTx" data-cu="${c.id}" data-tx="${t.id}"`})).join('')}</div>`:rpEmpty('چکی در این بازه ثبت نشده'))},
gfx(){let gOwe=0,gDue=0;for(const c of CU()){if(c.grp==='بانک')continue;const g=cuBal(c).G;if(g>0)gOwe+=g;else gDue+=-g}
  let st=0;try{for(const [k,o] of gdStockAll()){if(XA[k]||gCat(k)==='سایر')continue;st+=+o.w||0}}catch(_){}
  const net=st+gDue-gOwe,P=+rtRef0()||0,v=Math.round(net*P),p1=Math.round(Math.abs(net)*P/100);
  return rpSum([['خالص طلای ما',wFmt(Math.abs(net))+' گرم',net>=0?'g':'r',net>=0?'دارایی':'کسری'],['ارزش به قیمت روز',P?fmt(Math.abs(v)):'—',net>=0?'g':'r',P?'هر گرم '+fmt(P):'قیمت روز در دست نیست'],['هر ۱٪ نوسان',P?fmt(p1):'—','a','تومان']])
   +`<div class="rpls">${rpRow({t:'موجودی طلای مغازه',s:'از صفحه موجودی کالاها (وزن خام)',v:`<em class="${st<0?'r':'g'}"><b>${st<0?'−':''}${wFmt(Math.abs(st))}</b><small>گرم${st<0?' · منفی':''}</small></em>`,at:' data-act="rpGo" data-k="stk"'})}${rpRow({t:'طلبکاریم از مشتری‌ها',s:'طلایی که باید به ما بدهند',v:`<em class="r"><b>${wFmt(gDue)}</b><small>گرم</small></em>`})}${rpRow({t:'بدهکاریم به مشتری‌ها',s:'طلایی که باید تحویل بدهیم',v:`<em class="b"><b>${wFmt(gOwe)}</b><small>گرم</small></em>`})}</div>`
   +(Object.keys((gdC&&gdC().gstk)||{}).length?'':`<div class="rpnote">${ic('info')} موجودی اولیه کالاها هنوز ثبت نشده؛ موجودی مغازه فقط از سندها حساب شده و ممکن است منفی دیده شود. از «موجودی اجناس» اصلاحش کنید.</div>`)+`<div class="rpnote">${ic('info')} ${net>=0?'با هر ۱۰۰٬۰۰۰ تومان بالا رفتن قیمت هر گرم، دارایی شما '+fmt(Math.round(Math.abs(net)*100000))+' تومان بیشتر می‌شود و با پایین آمدنش همین‌قدر کمتر.':'شما طلا کم دارید: با هر ۱۰۰٬۰۰۰ تومان بالا رفتن قیمت هر گرم، '+fmt(Math.round(Math.abs(net)*100000))+' تومان زیان می‌کنید.'}</div>`}};
function vRpt(){if(PARENT.cust==='rpt')PARENT.cust='custs';const D=rpDef(RPT.k);if(!D||!RPF[RPT.k])return rpEmpty('گزارش پیدا نشد');let b='';try{b=RPF[RPT.k]()}catch(e){console.error(e);b=rpEmpty('این گزارش ساخته نشد')}return `<div class="rpw rpp">${rpHead(D[6]?'':D[2])}${b}</div>`}

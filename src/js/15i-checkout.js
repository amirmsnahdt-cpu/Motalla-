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
/* v91.7 (خواسته صاحب اپ: «کارتخوان و بقیه روش‌های تسویه با آیکون‌های انیمیشنی که با دیدنش آدم بفهمد برای چه کاری است»):
   هر روش یک نقاشی کوچک متحرک دارد (SVG درون‌خطی، حرکت با CSS): کارت که در کارتخوان می‌رود، سکه که به بانک می‌رود یا از آن بیرون می‌آید،
   سکه بین دو نفر، اسکناس، شمش‌هایی که جابه‌جا می‌شوند، برچسب تخفیف، تومان که طلا می‌شود. o = جهت پرداخت (برعکس) */
function ckAni(k,o){const G='#d9a21b',G2='#f6d77a',B='#2f6bff',N='#22a45d',S=h=>`<svg class="cka${o?' o':''}" viewBox="0 0 48 48" aria-hidden="true">${h}</svg>`,
  ing=(x,y,sc)=>`<g transform="translate(${x} ${y}) scale(${sc||1})"><path d="M5 0h12l5 10H0z" fill="${G}"/><path d="M5 0h12l1.6 3.2H3.4z" fill="${G2}"/></g>`,
  note=(x,y,sc)=>`<g transform="translate(${x} ${y}) scale(${sc||1})"><rect width="22" height="13" rx="2.2" fill="${N}"/><circle cx="11" cy="6.5" r="3.2" fill="#d7f5e3"/><rect x="2.2" y="2.2" width="3" height="1.6" rx=".8" fill="#d7f5e3"/><rect x="16.8" y="9.2" width="3" height="1.6" rx=".8" fill="#d7f5e3"/></g>`,
  coin=(x,y,r,c)=>`<g class="${c||''}"><circle cx="${x}" cy="${y}" r="${r}" fill="${G}"/><circle cx="${x}" cy="${y}" r="${(r*.6).toFixed(1)}" fill="none" stroke="${G2}" stroke-width="1.3"/></g>`,
  arr=(d,c)=>`<path class="${c||''}" d="${d}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(k==='pos')return S(`<g class="a-card"><rect x="14" y="1" width="16" height="13" rx="2.4" fill="${B}"/><rect x="14" y="4" width="16" height="2.6" fill="#16337a"/><rect x="16.5" y="9" width="5" height="2" rx="1" fill="#cfe0ff"/></g>
    <rect x="9" y="11" width="26" height="35" rx="5.5" fill="#3b4868"/><rect x="9" y="11" width="26" height="5" rx="2.5" fill="#161d30"/><rect x="12.5" y="18.5" width="19" height="9.5" rx="2" fill="#bdf3cd"/><rect class="a-scr" x="15" y="22" width="9" height="2.4" rx="1.2" fill="#1f7a45"/>
    ${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${13.5+c*6.4}" y="${31+r*4.6}" width="4.4" height="3" rx="1.2" fill="${r===2?['#e5484d','#f0b429','#2fb866'][c]:'#8794b4'}"/>`).join('')).join('')}`);
  if(k==='hav')return S(`<path d="M5 20L24 8l19 12z" fill="${B}"/><rect x="7" y="21" width="34" height="3.2" rx="1" fill="#9db9ff"/>${[11,22,33].map(x=>`<rect x="${x}" y="25.5" width="4.4" height="12" rx="1.2" fill="${B}"/>`).join('')}<rect x="5" y="38.5" width="38" height="4.5" rx="1.6" fill="#1d47b8"/>${coin(24,3,4.6,'a-coinB')}`);
  if(k==='dep'||k==='cust')return S(`<circle cx="10" cy="15" r="5.2" fill="#7c8cf8"/><path d="M1.5 35a8.5 8.5 0 0 1 17 0v2.5h-17z" fill="#7c8cf8"/><circle cx="38" cy="15" r="5.2" fill="${B}"/><path d="M29.500 35a8.5 8.500 0 0 1 17 0v2.500h-17z" fill="${B}"/>
    <path d="M17 27h14" stroke="currentColor" stroke-width="2" stroke-dasharray="1.500 3.500" stroke-linecap="round" opacity=".55"/>${coin(24,27,4.4,'a-coinP')}`);
  if(k==='cash')return S(`<g class="a-n2">${note(9,13,1.25).replace(N,'#178a4c')}</g><g class="a-n1">${note(7,19,1.36)}</g>${coin(39,37,4.6,'a-hop')}`);
  if(k==='gx')return S(`${ing(4,7,1)}${ing(22,31,1)}<g class="a-spin">${arr('M36 10a13 13 0 0 1 3 12m0 0l-4.200-2.600m4.200 2.600l2.400-4.400')}${arr('M12 38a13 13 0 0 1-3-12m0 0l4.200 2.600m-4.200-2.600l-2.400 4.400')}</g>`);
  if(k==='off')return S(`<g class="a-swing"><path d="M9 6h13.500a3 3 0 0 1 2.100.900l17 17a3 3 0 0 1 0 4.200L30.100 39.600a3 3 0 0 1-4.200 0l-17-17A3 3 0 0 1 8 20.500V7a1 1 0 0 1 1-1z" fill="#f0527a"/><circle cx="15.500" cy="13.500" r="2.800" fill="#fff"/><circle cx="22.500" cy="22.500" r="2.300" fill="none" stroke="#fff" stroke-width="1.900"/><circle cx="30.500" cy="30.500" r="2.300" fill="none" stroke="#fff" stroke-width="1.900"/><path d="M31.500 21.500l-10 10" stroke="#fff" stroke-width="1.900" stroke-linecap="round"/></g>`);
  if(k==='rg')return S(`${note(1,6,.95)}${arr('M24 21v7m0 0l-3.600-3.600m3.600 3.600l3.600-3.600','a-flow')}${ing(12,31,1.1)}<path class="a-tw" d="M40 24l1.300 3.200 3.200 1.300-3.200 1.300L40 33l-1.300-3.200-3.200-1.300 3.200-1.300z" fill="${G2}"/>`);
  if(k==='gp'||k==='cv')return S(`${ing(2,6,1.1)}${arr('M24 20v7m0 0l-3.600-3.600m3.600 3.600l3.600-3.600','a-flow')}${note(13,31,1.15)}`);
  if(k==='wd')return S(`<rect x="7" y="5" width="22" height="30" rx="3.600" fill="#f2b84b"/>${[11,16.500,22].map(y=>`<rect x="11" y="${y}" width="14" height="2.400" rx="1.200" fill="#fff" opacity=".9"/>`).join('')}<path d="M21 43L33 37l12 6z" fill="${B}"/><rect x="24" y="43" width="18" height="2.600" rx="1" fill="#1d47b8"/><g class="a-send">${arr('M36 30V18m0 0l-4.400 4.400M36 18l4.400 4.400')}</g>`);
  if(k==='gd'||k==='dl')return S(`${ing(8,26,1.45)}<g class="a-drop">${arr(o?'M24 20V7m0 0l-4.600 4.600M24 7l4.600 4.600':'M24 6v13m0 0l-4.600-4.600M24 19l4.600-4.600')}</g>`);
  if(k.slice(0,2)==='x:')return S(`${coin(24,31,10)}<g class="a-drop">${arr(o?'M24 17V5m0 0l-4.600 4.600M24 5l4.600 4.600':'M24 4v12m0 0l-4.600-4.600M24 16l4.600-4.600')}</g>`);
  if(k.slice(0,3)==='xp:')return S(`${coin(13,13,8.500)}${arr('M26 20v7m0 0l-3.600-3.600m3.600 3.600l3.600-3.600','a-flow')}${note(15,31,1.150)}`);
  return ''}
const CKO=[['wd','واریز به حساب مشتری','clock'],['hav','حواله از بانک','bank'],['cust','حواله از مشتری','swap'],['cash','پرداخت نقدی','cash'],['off','کسر · تخفیف','tag'],['rg','تبدیل به طلا','coin']];
const CKT=[['pos','کارتخوان','card'],['hav','حواله به بانک','bank'],['dep','حواله به مشتری','swap'],['cash','دریافت نقدی','cash'],['gx','تعویض طلا','coin'],['off','اضافه · تخفیف','tag'],['rg','تبدیل به طلا','coin']];
/* v71.0 (خواسته صاحب اپ): مانده مستقیم پولی/طلایی می‌شود — «تبدیل به طلا» مانده تومانی را با یک ردیف پولی طلا (گرم ۷۵۰) جابه‌جا می‌کند
   (طلبکاریم → خرید پولی: تومان صفر، مشتری طلا بدهکار؛ بدهکاریم → فروش پولی)؛ «پولی کردن طلا» مانده طلای همان خانه را
   مستقیم به تومان می‌برد (همان فرم «تبدیل به مبلغ» تسویه طلا). ساختار داده همان sv.xr با pul است */
const ckGold=()=>{const g=svBalL().find(z=>z[0]==='g');if(!g)return 0;const ix={p:1,d:2,f:3}[ckTg()]||2;return Math.round(-(g[ix]||0)*1000)/1000};
/* مانده هر سکه/ارز در خانه انتخاب‌شده (مثبت = مشتری به ما بدهکار است، مثل ckGold) و کاشی‌هایش */
const ckXv=k=>{const z=svBalL().find(o=>o[0]===k);if(!z)return 0;const ix={p:1,d:2,f:3}[ckTg()]||2;return Math.round(-(z[ix]||0)*100)/100};
const ckXT=()=>svBalL().filter(z=>z[0]!=='r'&&z[0]!=='g').map(z=>z[0]).filter(k=>ckXv(k)).flatMap(k=>{const v=ckXv(k),A=XA[k]||{t:k,u:'عدد'},n=qFmt(Math.abs(v))+' '+(A.u||'عدد');return [['x:'+k,(v>0?'دریافت ':'تحویل ')+A.t+' · '+n,v>0?'dIn':'dOut'],['xp:'+k,'پولی کردن '+A.t+' · '+n,'swap']]});
const ckRgW=()=>{const a=+CK.amount||0,pg=+CK.pg||0;return a&&pg?Math.round(a/pg*1000)/1000:0};
const ckRgX=()=>{const w=ckRgW();return !(+CK.pg)?'نرخ هر گرم ۱۸ را بزنید':w?'معادل: <b>'+wFmt(w)+'</b> گرم ۷۵۰ · '+(ckOut()?'مشتری طلا طلبکار می‌شود':'مشتری طلا بدهکار می‌شود'):'مبلغ را بزنید'};
const ckUsedDep=id=>sv.pays.filter(p=>p.m==='dep'&&String(p.entId)===String(id)).reduce((s,p)=>s+pAmt(p),0);
function ckOpen(tg){if(GAL&&GAL.ck)GAL=null;CK={m:'',tg:tg||''};sheet(ckHTML());ckBind();ckHistOn()}
/* v91.5 (خواسته صاحب اپ: «خروج و برگشت درست عمل کند»): دکمه برگشت گوشی / کشیدن از لبه / «برگشت» مرورگر وقتی پنجره تسویه باز است:
   در یک روش ← به نمای کلی تسویه؛ در نمای کلی ← پنجره بسته می‌شود؛ هیچ‌وقت از صفحه سند بیرون نمی‌رود. یک خانه تاریخچه برای پنجره (ck:1) */
function ckHistOn(){try{if(!(history.state&&history.state.ck))history.pushState({...(history.state||{}),n:cur,ck:1},'')}catch(_){}}
function ckBackStep(){const S=$('sheet');if(!CK||!S||$('ov').classList.contains('hide')||!S.querySelector('.ckw,.galg'))return false;if(GAL&&GAL.ck&&S.querySelector('.galg')){ACT.ckPhBack();return true}if(CK.m==='pos'&&CK.pb){ACT.ckPosBk();return true}if(CKWZM[CK.m]&&(CK.st|0)>0){CK.st=(CK.st|0)-1;CK.pre=1;cWzPaint();return true}if(CK.m){ACT.ckM({m:''});return true}ACT.close();return true}
ACT.ckTg=d=>{ckRead();CK={m:'',tg:d.w||''};ckRe()};
function ckRe(f){if(!CK||!$('sheet').querySelector('.ckw'))return;$('sheet').innerHTML=ckHTML();ckBind(f)}
function ckRows(){const R=sv.pays.map((p,i)=>({k:'py',i,ico:(PM[p.m]||PM.cash).i,lab:pyLab(p),sub:p.m==='wd'?'تأیید بانک'+(p.tn?' · پیگیری '+esc(p.tn):''):p.tn?'پیگیری '+esc(p.tn):p.m==='dep'?'در همان واریزی، تسویه از مشتری ثبت می‌شود':'',amt:pAmt(p),lock:p.m==='wd'}));
  (sv.xr||[]).forEach((x,i)=>{if(x.cat==='تعویض'){const C=xrCalc(x,sv.rate);R.push({k:'xr',i,ico:'coin',lab:'تعویض طلا',sub:wFmt(C.n)+' گرم · عیار '+toFa(x.ay||750),amt:C.amount})}});return R}
/* v61.72 (خواسته صاحب اپ): اگر طرف حواله در فهرست نیست، نامش دستی و موقت ثبت می‌شود (m:'nm' — فقط نام، به حساب کسی نمی‌رود) */
const ckNmRow=q0=>`<button type="button" class="ptm-br add" data-act="ckNm"><span class="ckbi">${ic('plus')}</span><span class="tx"><b>${q0?'ثبت دستی «'+esc(q0)+'»':'ثبت دستی نام'}</b><small>${q0?'در فهرست نیست · فقط نام، بدون حساب':'نام را در جستجو بنویسید'}</small></span></button>`;
ACT.ckNm=()=>{ckRead();const n=clean(CK.q||'');if(!n){toast('نام طرف حواله را در جستجو بنویسید',true);const I=$('ckQ');if(I)I.focus();return}CK.sel={k:'nm',n};ckRe('ckA')};
/* v100.4 (خواسته صاحب اپ: «لیست مشتری‌ها و حواله به بانک مثل کارتخوان؛ اسم و مبلغ کامل دیده شود»): ردیف‌ها همان ردیف فهرست بانک‌های دستگاه کارتخوان (ptm-br):
   نام کامل (در صورت نیاز دو خط، بدون … )، زیرش مبلغ کامل؛ داخل صفحه همان دستگاه (ckDev) */
const ckPr=(k,id,name,lab,v,sub)=>`<button type="button" class="ptm-br" data-act="ckPick" data-k="${k}" data-id="${id}"><span class="ckbi pa">${esc(userInit(name||'؟'))}</span><span class="tx"><b>${esc(name)}</b>${v!=null?`<small>${lab} <em>${fmt(v)}</em></small>`:lab?`<small>${lab}</small>`:''}${sub?`<small class="s2">${sub}</small>`:''}</span></button>`;
function ckList(){const q0=clean(CK.q||''),q=nzName(toEn(q0)),dOk=pDig(q0);
  if(ckOut()){const L=CU().filter(c=>String(c.id)!==String(sv.cuId)&&c.grp!=='بانک'&&(!q||cuHit(c,q,dOk))).sort((a,b)=>String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,q?60:40);
    return L.map(c=>ckPr('cu',c.id,cuName(c),c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':'حساب مشتری',null,'')).join('')+ckNmRow(q0)}
  /* v71.3: همه حساب‌هایی که بدهکاریم (بدون سقف تعداد؛ فهرست خودش اسکرول می‌خورد) + واریزی‌های بی‌حساب */
  const C0=oweAccts(q0),D0=oweDeps(q0),NC=CK.lim||40,C=C0.slice(0,NC),D=D0.slice(0,Math.max(20,NC/2)),more=C0.length>C.length||D0.length>D.length;
  if(!C.length&&!D.length)return `<div class="ptm-bt">${q?'کسی در فهرست پیدا نشد':'به هیچ مشتری‌ای بدهکار نیستیم و واریزیِ ارسال‌نشده‌ای نیست'}</div>${ckNmRow(q0)}`;
  return (C.length?`<div class="ptm-bt">مشتری‌هایی که به آنها بدهکاریم</div>`+C.map(o=>ckPr('cu',o.c.id,cuName(o.c),'بدهکاریم',o.a,oweSub(o))).join(''):'')
    +(D.length?`<div class="ptm-bt">واریزی‌های ارسال‌نشده به بانک</div>`+D.map(([x,r])=>ckPr('dep',x.id,fullName(x),'مانده',r,['واریز '+esc(payLab(PD(x))),x.settled?'بخشی تسویه شده':'',x.bankShow?esc(x.bankShow):''].filter(Boolean).join('، '))).join(''):'')+(more?`<button type="button" class="ptm-br add" data-act="ckMore"><span class="ckbi">${ic('chev')}</span><span class="tx"><b>نمایش بیشتر</b><small>${toFa(String(C0.length+D0.length-C.length-D.length))} مورد دیگر · یا نام را جستجو کنید</small></span></button>`:'')+ckNmRow(q0)}
/* v61.30: کارتخوان و حساب ما مثل بقیه فهرست‌ها: جستجو بالا، فهرست زیرش */
/* v86.8 (خواسته صاحب اپ: «در حواله و کارتخوان لیست همه بانک‌ها با موجودی طلبکاریم؛ اسکرول درست؛ افزودن حساب بانکی از همین‌جا
   که در زبانه بانک هم ذخیره شود»): همه حساب‌های نوع بانک (بیشترین موجودی بالا)، لوگو + برچسب رنگی طلبکاریم/بدهکاریم،
   فهرست خودش اسکرول می‌خورد (dkl → اشاره‌های پنجره کنار می‌روند)، ردیف «+ حساب بانکی تازه» همیشه بالا: با نام جستجو مستقیم،
   وگرنه کادر نام باز می‌شود (CK.nb) و bkCuNew یک حساب نوع «بانک» واقعی می‌سازد */
function ckPick(){const m=CK.m,q=nzName(toEn(clean(CK.sq||''))),pos=m==='pos';
  const L=bkCus().filter(c=>String(c.id)!==String(sv&&sv.cuId)).map(c=>({c,b:bkCuBal(c)})).filter(o=>!q||nzName(toEn(cuName(o.c))).includes(q)).sort((a,b)=>b.b-a.b);
  const q0=clean(CK.sq||''),ex=q&&L.some(o=>nzName(toEn(cuName(o.c)))===q);
  const row=({c,b})=>`<button type="button" class="ckbr${String(CK.srcId)===String(c.id)?' on':''}" data-act="ckSrc" data-id="${esc(c.id)}" style="--bk:${bkClr(c)}">${bkAvH(c)||`<span class="ckbi">${ic(pos?'card':'bank')}</span>`}<span class="tx"><b>${esc(cuName(c))}</b><small>${bkOfCu(c)?'بانک '+esc(bkOfCu(c)):'حساب بانک'}</small></span><span class="ckbv ${b>0?'r':b<0?'b':'z'}"><b>${fmt(Math.abs(b))}</b><em>${b>0?'طلبکاریم':b<0?'بدهکاریم':'تسویه'}</em></span>${String(CK.srcId)===String(c.id)?`<span class="ckbk">${ic('check')}</span>`:''}</button>`;
  const add=CK.nb&&!q0?`<div class="ckbn"><span class="ckbi">${ic('plus')}</span><input id="ckNB" value="${esc(CK.nbn||'')}" placeholder="نام حساب، مثلاً ملت داداشی" autocomplete="off" enterkeyhint="done"><button type="button" data-act="ckNBSave">ساخت</button></div>`
    :ex?'':`<button type="button" class="ckbr ckba" data-act="${q0?'ckPkAdd':'ckNB'}"><span class="ckbi">${ic('plus')}</span><span class="tx"><b>${q0?'افزودن «'+esc(q0)+'»':'حساب بانکی تازه'}</b><small>در زبانه بانک هم ساخته می‌شود</small></span></button>`;
  return `<div class="ckbl dkl">${add}${ckBkG(L).map(g=>`<div class="ckgg">${ckBkGH(g)}${g.L.map(row).join('')}</div>`).join('')||(q0?'':'<div class="ckb0">هنوز حساب بانکی ندارید</div>')}</div>`}
ACT.ckNB=()=>{ckRead();CK.nb=1;ckRe('ckNB')};
ACT.ckNBSave=()=>{const I=$('ckNB'),n=clean((I&&I.value)||'');if(!n){toast('نام حساب بانکی را بنویسید',true);if(I)I.focus();return}ckRead();const id=bkCuNew(n);if(id==null)return;CK.srcId=id;CK.pk=1;CK.nb=0;CK.nbn='';ls.set('m_bk_cu',id);ckRe('ckA')};
ACT.ckPkAdd=()=>{ckRead();const n=clean(CK.sq||''),pos=CK.m==='pos';if(!n){toast('نام '+(pos?'کارتخوان':'حساب')+' را در جستجو بنویسید',true);const I=$('ckS');if(I)I.focus();return}
  {const id=bkCuNew(n);if(id==null)return;CK.srcId=id;CK.pk=1;ls.set('m_bk_cu',id)}CK.sq='';ckRe('ckA');toast('«'+n+'» اضافه شد')};
/* v61.72: عکس رسید در فرم تسویه (همان پنجره عکس ردیف‌ها، GAL.ck)؛ بستن پنجره عکس = برگشت به همین فرم */
ACT.ckGal=()=>{ckRead();openGal({k:'row',ck:1})};
ACT.ckPhV=d=>{ckRead();GAL={k:'row',ck:1};zvOpen(+d.i||0)};
ACT.ckPhBack=()=>{GAL=null;sheet(ckHTML());ckBind();phPaint($('sheet'))};
/* v101.2 (خواسته صاحب اپ: «بعد از زدن عکس رسید پنجره جدا باز نشود؛ خود همان قسمت دوربین را بیاورد یا گالری را باز کند، در هر ۴ قسمت»):
   روی کاغذ رسید دستگاه دو دکمه کوچک «دوربین» و «گالری» که مستقیم ورودی فایل گوشی را باز می‌کنند (همان پیش‌نمایش و تأیید picOk و همان ذخیره galCtx)؛
   عکس‌های اضافه‌شده همان‌جا کوچک دیده می‌شوند و زدنشان بزرگ‌نمایی است. دوربین فقط وقتی هست که گوشی دارد (اپ اندروید قدیمی: فقط گالری).
   GAL پیش از باز شدن انتخاب فایل در کلیک خود برچسب (ckBind) تنظیم می‌شود؛ data-act ندارد چون کلیک عمومی preventDefault می‌کند */
function ckPhIn(){const K=xrPh(CK),cam=picCam()||!/MotallaAndroid/.test(navigator.userAgent);
  return `<div class="ckph">${K.map((k,i)=>`<button type="button" class="stpht" data-act="ckPhV" data-i="${i}" aria-label="دیدن عکس"><img data-ik="${esc(k)}" alt=""></button>`).join('')}${cam?`<label class="ckphb" aria-label="گرفتن عکس رسید">${ic('cam')}<span>دوربین</span><input type="file" accept="image/*" capture="environment" data-galadd="1" hidden></label>`:''}<label class="ckphb" aria-label="عکس از گالری">${ic('gal')}<span>گالری</span>${galGalIn()}</label></div>`}
const ckTnP=()=>{const v=$('ckTv'),b=v&&v.closest('.ptm-tn'),D=$('posD');if(v){v.textContent=CK.tn||'اختیاری · بزنید';v.classList.toggle('ph',!CK.tn)}if(b)b.classList.toggle('on',!!CK.kt);if(D)D.classList.toggle('ktn',!!CK.kt)};
ACT.ckTnF=()=>{if(!CK)return;CK.kt=CK.kt?0:1;CK.pre=0;ckTnP();try{navigator.vibrate&&navigator.vibrate(6)}catch(_){}};
ACT.ckAmF=()=>{if(CK&&CK.kt){CK.kt=0;ckTnP()}};
function ckPhPut(n0,x){const K=xrPh(CK||{});if(!K.length)return;const p=x||(sv.pays.length>n0?sv.pays[sv.pays.length-1]:null);if(p){p.imgs=K;p.img=K[0]}}
/* v91.2 (خواسته صاحب اپ: «حواله‌ها و کارتخوان خیلی راحت‌تر و درست‌تر؛ وقتی کیبورد باز می‌شود هیچ چیز دیده نمی‌شود») — پنجره تسویه دو حالت دارد:
   ۱) نمای کلی (روش انتخاب نشده): مانده‌ها، ردیف‌های ثبت‌شده، کاشی روش‌ها، «پایان و ثبت سند» — مثل قبل.
   ۲) حالت «یک کار» (CK.m): فقط همان روش — سرتیتر = نام روش با برگشت و «افزودن»، یک خط مانده، بانک‌ها به شکل چیپ افقی (لوگو + مانده؛ انتخاب بدون ساختن دوباره صفحه،
      پس کیبورد نمی‌پرد)، مبلغ بزرگ با «کل مانده»، بعد پیگیری و عکس. همه در بالای صفحه می‌ماند و بالای کیبورد دیده می‌شود. «همه بانک‌ها / تازه» فهرست کامل با جستجو را باز می‌کند (CK.pl). */
const ckBkL=()=>bkCus().filter(c=>String(c.id)!==String(sv&&sv.cuId));
/* v91.3 (خواسته صاحب اپ: «کارتخوان مثل دستگاه پوز؛ حواله به مشتری و انتخاب بانک بهتر؛ انتخاب سخت است»):
   مبلغ همه روش‌ها با صفحه‌کلید خود برنامه (ckPad) زده می‌شود، نه کیبورد گوشی — پس هیچ‌وقت چیزی زیر کیبورد پنهان نمی‌شود.
   کارتخوان = یک دستگاه پوز: بدنه تیره، سرتیتر با لوگو و نام بانکِ همان کارتخوان، صفحه سبز «مبلغ تراکنش»، دکمه‌های عددی و سه دکمه رنگی پوز
   (قرمز انصراف، زرد پاک، سبز تأیید = افزودن). بانک‌ها همان ردیف چیپ بالا؛ زدن هر بانک سرتیتر دستگاه را همان لحظه عوض می‌کند. */
const ckAmtV=()=>CK.amount?Number(CK.amount).toLocaleString('en-US'):'';
const ckAIn=cls=>`<input id="ckA" class="ltr ${cls||''}" readonly inputmode="none" tabindex="-1" value="${ckAmtV()}" placeholder="0" autocomplete="off" aria-label="مبلغ">`;
/* v91.8 (خواسته صاحب اپ: «نقدی و حواله هم مثل کارتخوان ثابت، کامپکت و درست؛ کادر مبلغ متوازن»): یک صفحه‌کلید برای همه (همان چیدمان پوز: سه ستون عدد + ستون رنگی
   انصراف/پاک/تأیید) و یک کادر مبلغ وسط‌چین (برچسب بالا، عدد وسط، «کل مانده/نصف» زیرش؛ واحد کنار عدد نیست تا عدد از وسط بیرون نرود) */
function ckKeys(cls,dot){const k=(v,t,c)=>`<button type="button" class="ckk ptm-k${c?' '+c:''}" data-act="ckK" data-k="${v}">${t}</button>`;
  return `<div class="ptm-keys${cls?' '+cls:''}">${['1','2','3'].map(d=>k(d,toFa(d))).join('')}${k('x','<i>✕</i><span>انصراف</span>','kr')}${['4','5','6'].map(d=>k(d,toFa(d))).join('')}${k('c','<i>‹</i><span>پاک</span>','ky')}${['7','8','9'].map(d=>k(d,toFa(d))).join('')}${k('ok','<i>○</i><span>تأیید</span>','kg')}${dot?k('.','.','z3 dot'):k('000','۰۰۰','z3')}${k('0','۰')}${k('bs',ic('back').replace('class="i"','class="i bsk"'),'bs')}</div>`}
/* v91.5 (خواسته صاحب اپ: «با انیمیشن نشان بده داری آن عملیات را انجام می‌دهی»): نوار مسیر پول بالای فرم — از چه کسی/کجا به کجا، با نقطه‌های روان روی خط */
/* v91.8: جهت درست — مبدأ سمت راست، مقصد سمت چپ، نقطه‌ها از راست به چپ (دریافت: مشتری ← بانک/صندوق؛ پرداخت: بانک/صندوق ← مشتری) */
/* v100.4: سرتیتر همه دستگاه‌ها (کارتخوان، حواله بانک، نقدی، حواله به مشتری) */
const ckSelNm=()=>{const s0=CK.sel;if(!s0)return '';return s0.k==='nm'?s0.n:s0.k==='cu'?cuName(CU().find(q=>String(q.id)===String(s0.id))||{}):fullName(validated().find(q=>String(q.id)===String(s0.id))||{})};
const ckPosHead=()=>{const m=CK.m,out=ckOut(),sig='<span class="ptm-sig"><i></i><i></i><i></i><i></i></span>';
  if(/^xq:/.test(m)){const k=m.slice(3),A=XA[k]||{t:k,u:'عدد'},v=ckXv(k);return `<span class="ckbi g">${ic(/USD|EUR|AED/.test(k)?'usd':'coin')}</span><span class="tx"><b>${esc(A.t)}</b><small>مانده ${qFmt(Math.abs(v))} ${esc(A.u||'عدد')} · ${v>0?'طلبکاریم':'بدهکاریم'}</small></span>`}
  if(m==='cash')return `<span class="ckbi g">${ic('cash')}</span><span class="tx"><b>صندوق مغازه</b><small>${out?'پرداخت نقدی به مشتری':'دریافت نقدی از مشتری'}</small></span>${sig}`;
  if(m==='dep'||m==='cust'){const s0=CK.sel;if(!s0)return `<span class="ckbi">${ic('user')}</span><span class="tx"><b>${out?'به حساب چه کسی؟':'به حساب چه کسی پرداخت کرده؟'}</b><small>شخص را از فهرست انتخاب کنید</small></span>`;
    const n=ckSelNm(),cap=ckSelCap(),sub=s0.k==='nm'?'ثبت دستی · بدون حساب':out?'مبلغ به حساب این مشتری می‌رود':s0.k==='dep'?'واریزی ارسال‌نشده · مانده '+fmt(cap):'بدهکاریم '+fmt(cap);
    return `<span class="ckbi pa">${esc(userInit(n||'؟'))}</span><span class="tx"><b>${esc(n)}</b><small>${sub}</small></span><span class="ptm-chg">تغییر شخص${ic('back').replace('class="i"','class="i ptmcv"')}</span>`}
  const z=ckBkL().find(o=>String(o.id)===String(CK.srcId));return `${z?(bkAvH(z)||`<span class="ckbi">${ic('bank')}</span>`):`<span class="ckbi">${ic('card')}</span>`}<span class="tx"><b>${z?esc(cuName(z)):'کارتخوان'}</b><small>${m==='pos'?'پایانه فروش':out?'حواله از این حساب':'حواله به این حساب'}</small></span><span class="ptm-chg">${CK.pb?'بستن':'تغییر بانک'}${ic('back').replace('class="i"','class="i ptmcv"')}</span>${m==='pos'?sig:''}`};
/* v98.9 (خواسته صاحب اپ: «پنجره کارتخوان‌ها در خود بانک باشد؛ با زدنش لیست بانک‌ها را بیاورد»): ردیف چیپ بانک‌ها بالای دستگاه برداشته شد؛ سرتیتر خود دستگاه (نام و نشان بانک) دکمه است
   (ACT.ckPosBk، CK.pb) و فهرست بانک‌ها روی صفحه همان دستگاه باز می‌شود (جای صفحه نمایش و دکمه‌ها): هر بانک با نشان و مانده، انتخاب‌شده بالا؛ آخرش «جستجو / حساب بانکی تازه» */
/* v101.2 (خواسته صاحب اپ: «بانک‌ها کنار هم باشند؛ مثلاً چهار ملت زیر هم که بهتر دیده شود»): حساب‌ها بر اساس بانک دسته می‌شوند
   (سر هر دسته نشان و نام بانک + تعداد)؛ دسته‌ها به ترتیب جمع موجودی، داخل هر دسته بیشترین موجودی بالا. حساب انتخاب‌شده جای خودش در دسته‌اش می‌ماند */
function ckBkG(L){const G=new Map();for(const o of L){const b=bkOfCu(o.c)||'',k=b||'~';if(!G.has(k))G.set(k,{b,L:[],t:0});const g=G.get(k);g.L.push(o);g.t+=Math.max(0,o.b)}
  return [...G.values()].map(g=>(g.L.sort((x,y)=>y.b-x.b),g)).sort((x,y)=>(!x.b)-(!y.b)||y.t-x.t||y.L.length-x.L.length)}
const ckBkGH=g=>`<div class="ckgh">${g.b&&bkLogo(g.b)?`<span class="ckgl">${bankBadge(g.b,'lg')}</span>`:`<span class="ckgl">${ic('bank')}</span>`}<b>${g.b?'بانک '+esc(g.b):'حساب‌های دیگر'}</b>${g.L.length>1?`<em>${toFa(g.L.length)} حساب</em>`:''}</div>`;
function ckPosList(){const L=ckBkL().map(c=>({c,b:bkCuBal(c)}));
  const row=({c,b})=>`<button type="button" class="ptm-br${String(CK.srcId)===String(c.id)?' on':''}" data-act="ckSrc" data-id="${esc(c.id)}">${bkAvH(c)||`<span class="ckbi">${ic('bank')}</span>`}<span class="tx"><b>${esc(cuName(c))}</b><small>${b>0?'موجودی':b<0?'بدهکار':'بدون موجودی'}${b?` <em>${b<0?'−':''}${fmt(Math.abs(b))}</em>`:''}</small></span>${String(CK.srcId)===String(c.id)?`<i class="ptm-bk">${ic('check')}</i>`:''}</button>`;
  return `<div class="ptm-bl" id="posL"><div class="ptm-bt">${CK.m==='pos'?'کارتخوانِ کدام بانک؟':ckOut()?'حواله از کدام حساب بانک؟':'حواله به کدام حساب بانک؟'}</div>${ckBkG(L).map(g=>`<div class="ckgg">${ckBkGH(g)}${g.L.map(row).join('')}</div>`).join('')}<button type="button" class="ptm-br add" data-act="ckAll"><span class="ckbi">${ic('search')}</span><span class="tx"><b>جستجو یا حساب بانکی تازه</b><small>فهرست کامل بانک‌ها</small></span></button></div>`}
ACT.ckMore=()=>{if(!CK)return;CK.lim=(CK.lim||40)+80;const L=$('ckL');if(L)L.innerHTML=ckList()};
ACT.ckPosBk=()=>{if(!CK||(CK.m!=='pos'&&CK.m!=='hav'))return;ckRead();CK.pb=CK.pb?0:1;CK.noan=1;ckRe();CK.noan=0};
/* v91.7 (خواسته صاحب اپ: «انگار یک کارتخوان واقعی؛ دکمه‌ها و طولش بهتر، دکمه‌ها این‌قدر نزدیک هم نباشند»): دستگاه پوز از نو (کلاس‌های ptm-*، بدون ارث از قالب قبلی):
   سرِ چاپگر با رسید کاغذی که از شکاف بیرون آمده (عکس رسید روی همان کاغذ)، بدنه با نام و نشان بانک، صفحه نمایش شیشه‌ای، صفحه‌کلید واقعی پوز
   (سه ستون عدد با فاصله + ستون رنگی انصراف/پاک/تأیید؛ تأیید دو ردیف)، پایین دستگاه شکاف کارت با کارت همان بانک. دستگاه همه قد پنجره را پر می‌کند و ردیف‌های دکمه با قد صفحه کش می‌آیند */
/* v100.4 (خواسته صاحب اپ: «حواله به بانک، حواله به مشتری و نقدی هم مثل کارتخوان؛ عکس رسید مثل کارتخوان»): یک دستگاه برای همه —
   کارتخوان تیره، بقیه روشن (lt). کاغذ رسید با عکس (و برای حواله بانک «پیگیری») از شکاف بالا بیرون آمده؛ سرتیتر = بانک / صندوق / شخص و دکمه «تغییر»
   که فهرست را روی صفحه همان دستگاه باز می‌کند (بانک‌ها: ckPosList؛ اشخاص: جستجو + ckList). */
function ckDev(lf){const m=CK.m,pos=m==='pos',bk=pos||m==='hav',pp=m==='dep'||m==='cust',out=ckOut(),z=bk?ckBkL().find(o=>String(o.id)===String(CK.srcId)):null,K=xrPh(CK),lst=bk?!!CK.pb:pp&&!CK.sel;
  const sc=pp&&CK.sel?ckSelCap():0,cap=sc&&sc<lf?sc:lf,act=bk?' data-act="ckPosBk" aria-label="تغییر بانک"':pp&&CK.sel?' data-act="ckPick" data-k="" aria-label="تغییر شخص"':'';
  const hd=act?`<button type="button" class="ptm-hd" id="posH"${act}>${ckPosHead()}</button>`:`<div class="ptm-hd" id="posH">${ckPosHead()}</div>`;
  /* v101.2 (خواسته صاحب اپ: «شماره پیگیری زده نمی‌شود؛ شماره‌ها از همان صفحه زده شود»): پیگیری کیبورد گوشی را باز نمی‌کند —
     زدنش صفحه‌کلید خود دستگاه را به پیگیری می‌دهد (CK.kt) و زدن صفحه مبلغ آن را برمی‌گرداند */
  const tn=m==='hav'?`<button type="button" class="ptm-tn${CK.kt?' on':''}" data-act="ckTnF" aria-label="شماره پیگیری"><small>پیگیری</small><span id="ckTv" class="ltr${CK.tn?'':' ph'}">${CK.tn?esc(CK.tn):'اختیاری · بزنید'}</span></button>`:'';
  const list=bk?ckPosList():`<div class="ptm-sq">${ic('search')}<input id="ckQ" value="${esc(CK.q||'')}" placeholder="نام، تلفن، شبا یا فاکتور…" autocomplete="off" enterkeyhint="search"></div><div class="ptm-bl" id="ckL">${ckList()}</div>`;
  const xq=/^xq:/.test(m),XU=xq?((XA[m.slice(3)]||{}).u||'عدد'):'';const st=xq?(ckXv(m.slice(3))>0?'دریافت از مشتری':'تحویل به مشتری'):pos?'خرید':m==='hav'?(out?'حواله از بانک':'حواله به بانک'):m==='cash'?(out?'پرداخت نقدی':'دریافت نقدی'):(out?'حواله به حساب':'حواله از مشتری');
  return `<div class="ptm${pos?'':' lt'}${CK.kt&&tn?' ktn':''}${lst?' pbl':''}${CK.noan?' noan':''}${tn?' wtn':''}${pp&&!CK.sel?' nopap':''}" id="posD" style="--bk:${z?bkClr(z):pos?'#334155':'#2152d9'}">
  ${pp&&!CK.sel?'':`<div class="ptm-pap${K.length?' has':''}">${tn}${ckPhIn()}</div>`}
  <div class="ptm-top"><span class="ptm-slot"></span><span class="ptm-led"></span></div>
  <div class="ptm-body">${hd}
    ${lst?list:`<div class="ptm-lcd" id="posS" data-act="ckAmF"><div class="ptm-st"><span>${st}</span><span>${esc(dates(sv.date||todayISO()).fa)}</span></div><div class="ptm-v"><small>${xq?'تعداد · '+esc(XU):(pos?'مبلغ تراکنش':'مبلغ')+' · تومان'}</small>${ckAIn('posin')}</div>${cap?`<button type="button" class="ptm-rm" data-act="ckAmt" data-v="${cap}"><small>${xq?'کل مانده':sc&&sc<lf?(s0k()==='dep'?'مانده واریزی':'بدهی ما به او'):'مانده سند'}</small><b>${fmt(cap)}</b><em>بزنید</em></button>`:''}<div class="ptm-msg" id="posM"></div></div>
    ${ckKeys(pos?'':'lt')}`}
    ${pos?'<div class="ptm-bot"><span class="ptm-brand">MOTALLA<b>POS</b></span><span class="ptm-cs"></span></div>':''}
  </div>
  ${pos?`<div class="ptm-card" aria-hidden="true"><span>${z?(bkAvH(z)||''):''}</span><i></i></div>`:''}</div>`}
const s0k=()=>CK.sel?CK.sel.k:'';
/* ---- v98.9 «تعویض طلا» در پنجره تسویه (خواسته صاحب اپ: «نرخ و قیمت کل را نشان بدهد که بشود ادیت کرد؛ پنجره درهم‌برهم است») ----
   چهار خانه مرتب: وزن و عیار کنار هم، «هر گرم (خرید)» که از نرخ سند و عیار پر می‌شود و قابل تغییر است (CK.gr → ردیف با mz خودش)،
   و کادر بزرگ «قیمت کل» که با وزن × نرخ پر می‌شود و اگر دستی زده شود همان می‌ماند (CK.gv → amT؛ نرخ = مبلغ ÷ وزن).
   تغییر وزن/عیار/نرخ مبلغ دستی را برمی‌دارد (مثل پله‌های ردیف). زیرش یک کارت نتیجه: مانده بعد از تعویض. */
function ckGxX(){const x=xrNew('buy','gold',{cat:'تعویض'});x.w=CK.w||'';x.ay=+CK.ay||x.ay;if(+CK.gr>0){x.mz=Math.round((+CK.gr)*750/(+x.ay||750)*MZK);x.mzk='g'}if(+CK.gv>0)x.amT=Math.round(+CK.gv);return x}
const ckGxC=()=>xrCalc(ckGxX(),sv.rate);
function ckGxRes(){const C=ckGxC(),r=ckRest(),has=C.n>0&&C.amount>0;if(!sv.rate&&!(+CK.gr>0))return `<div class="bf3d n"><span class="bf3di">${ic('edit')}</span><span class="tx"><b>نرخ هر گرم را بزنید</b><small>مظنه یا نرخ گرم بالای سند هنوز خالی است</small></span></div>`;
  if(!has)return `<div class="bf3d n"><span class="bf3di">${ic('edit')}</span><span class="tx"><b>وزن طلای مشتری را بزنید</b><small>قیمت کل خودش حساب می‌شود</small></span></div>`;
  const af=r-C.amount,q=Math.round(C.n*(+ckGxX().ay||750)/750*1000)/1000;
  return `<div class="bf3d b"><span class="bf3di">${ic('swap')}</span><span class="tx"><b>${af>0?'مانده بعد از تعویض · طلبکاریم':af<0?'مانده بعد از تعویض · بدهکاریم':'با این تعویض تسویه می‌شود'}</b><small>${wFmt(q)} گرم ۷۵۰${C.fx?' · قیمت دستی':''}</small></span><em class="${af>0?'gxr':af<0?'gxb':'gxz'}">${fmt(Math.abs(af))}</em></div>`}
function ckGxForm(){const x=ckGxX(),C=ckGxC(),nv=v=>v?Number(v).toLocaleString('en-US'):'';
  return `<div class="gxw"><div class="gxg"><label class="gxf"><small>وزن طلای مشتری</small><span><input id="ckW" class="ltr" inputmode="decimal" value="${esc(CK.w||'')}" placeholder="0.000" autocomplete="off" enterkeyhint="next"><i>گرم</i></span></label>
  <label class="gxf"><small>عیار</small><span><input id="ckY" class="ltr" inputmode="numeric" value="${esc(String(CK.ay||x.ay))}" autocomplete="off" enterkeyhint="next"></span></label>
  <label class="gxf wide"><small>هر گرم <i>(خرید از مشتری)</i></small><span><input id="ckR" class="ltr" inputmode="numeric" data-z3 value="${nv(C.pg)}" placeholder="0" autocomplete="off" enterkeyhint="next"><i>تومان</i></span></label></div>
  <div class="ckcl">قیمت کل طلای مشتری</div>
  <div class="ckbg"><label class="ckbig"><input id="ckV" class="ltr" inputmode="numeric" data-z3 value="${nv(C.amount)}" placeholder="0" autocomplete="off" enterkeyhint="done" aria-label="قیمت کل"><i>تومان</i></label></div>
  <div id="ckX">${ckGxRes()}</div>
  <label class="ckf ckds"><small>شرح کالا <i>اختیاری</i></small><input id="ckDs" value="${esc(CK.ds||'')}" placeholder="مثلاً دستبند کارتیر" autocomplete="off" enterkeyhint="done"></label></div>`}
function ckForm(){const m=CK.m;if(!m)return '';const lf=ckLeft();
  const amt=`<label class="ckf"><small>مبلغ (تومان)</small><input id="ckA" class="ltr" inputmode="numeric" value="${ckAmtV()}" autocomplete="off" enterkeyhint="done"></label>`;
  const tn=`<label class="ckf ckf1"><small>پیگیری <i>(اختیاری)</i></small><input id="ckT" class="ltr" inputmode="numeric" value="${esc(CK.tn||'')}" autocomplete="off"></label>`;let b='';
  if(m==='cash')b=ckDev(lf);
  if(m==='rg')b=`<div class="ckg">${amt}<label class="ckf"><small>هر گرم ۱۸ (تومان)</small><input id="ckP" class="ltr" inputmode="numeric" value="${CK.pg?Number(CK.pg).toLocaleString('en-US'):''}" autocomplete="off"></label></div><div class="ckx" id="ckX">${ckRgX()}</div>`;
  if(m==='pos'||m==='hav'){const has=ckBkL().length>0;if(has&&!ckBkL().some(z=>String(z.id)===String(CK.srcId)))CK.srcId=ckBkL()[0].id;if(has)CK.pk=1;
    if(CK.pl||!has)b=`<div class="fsearch sm">${ic('search')}<input id="ckS" type="search" value="${esc(CK.sq||'')}" placeholder="${m==='pos'?'حساب کارتخوان (بانک)…':'جستجوی حساب بانک…'}" autocomplete="off" enterkeyhint="search"></div><div id="ckPl">${ckPick()}</div>`;
    else b=ckDev(lf)}
  if(m==='dep'||(m==='cust'&&ckOut()))b=ckDev(lf);
  if(CKWZM[m])b=ckWiz();
  if(/^xq:/.test(m))b=ckDev(Math.abs(ckXv(m.slice(3))));
  const ok=ckFormOk(),inl=!!CKWZM[m]||/^xq:/.test(m)||m==='pos'||m==='hav'||m==='cash'||((m==='dep'||m==='cust')&&CK.sel);
  return `<div class="ckfm ckf2">${b}${ok&&!inl&&!CK.pl?stPhHTML(CK):''}</div>`}
/* سقف حواله به همان شخص (بدهی ما به او / مانده واریزی) */
function ckSelCap(){const s=CK.sel;if(!s||ckOut())return 0;if(s.k==='cu'){const c=CU().find(z=>String(z.id)===String(s.id));if(!c)return 0;const I=oweIx();return cuFree(c,undefined,I)+cuDeps(c,undefined,I).reduce((a,z)=>a+z[1],0)}if(s.k==='dep'){const x=validated().find(z=>String(z.id)===String(s.id));return x?Math.max(0,depAvail(x)-ckUsedDep(x.id)):0}return 0}
ACT.ckK=d=>{if(CK&&CKWZM[CK.m]){if(CK.kbT&&Date.now()<CK.kbT)return;ckWzK(d.k);return}const A=$('ckA');if(!A)return;const k=d.k;/* v100.9: تا نیم ثانیه بعد از انتخاب شخص/بانک، زدن‌های اضافه (که قبلاً روی دکمه‌های تازه پیدا شده می‌افتاد و رقم اضافه می‌کرد) نادیده */if(CK.kbT&&Date.now()<CK.kbT)return;if(k==='ok'){if(CK.m==='pos'&&$('posD')&&+CK.amount>0&&+CK.amount<=ckLeft()&&!RM()){ckPosGo();return}ACT.ckAdd();return}if(k==='x'){ACT.ckM({m:''});return}
  if(CK.kt&&$('ckTv')){let t=String(CK.tn||'');if(k==='c')t='';else if(k==='bs')t=t.slice(0,-1);else if(t.length<30)t=(t+k).slice(0,30);CK.tn=t;ckTnP();try{navigator.vibrate&&navigator.vibrate(6)}catch(_){}return}
  let v=String(CK.amount||'').replace(/\D/g,'');/* v100.9: اولین رقم بعد از باز شدن یا انتخاب، جای مبلغ پیشنهادی می‌نشیند (مثل ماشین‌حساب) */if(CK.pre&&k!=='ok'&&k!=='x'){if(/^\d/.test(k))v='';CK.pre=0}if(k==='c')v='';else if(k==='bs')v=v.slice(0,-1);else if(v.length<13)v=(v+k).replace(/^0+/,'').slice(0,13);
  CK.amount=+v||0;A.value=ckAmtV();try{navigator.vibrate&&navigator.vibrate(6)}catch(_){}
  const h=A.closest('.ptm-lcd,.ckscr');if(h&&!RM()&&h.animate&&(k==='c'||k==='000'))h.animate([{transform:'scale(1.02)'},{transform:'none'}],{duration:200,easing:'cubic-bezier(.2,.9,.25,1)'})};
function ckPosGo(){const D=$('posD'),M=$('posM');if(!D||D.classList.contains('run'))return;D.classList.add('run');if(M)M.innerHTML='<span class="ptm-dots"><i></i><i></i><i></i></span>در حال ارتباط با بانک';
  setTimeout(()=>{if(!D.isConnected)return;D.classList.add('ok');if(M)M.innerHTML=`${ic('check')} تراکنش موفق · ${fmt(+CK.amount)}`;try{navigator.vibrate&&navigator.vibrate([12,40,18])}catch(_){}},700);
  setTimeout(()=>{if(D.isConnected)ACT.ckAdd()},1550)}
/* ---- v101.3 (خواسته صاحب اپ: «تعویض طلا، تبدیل به طلا، پرداخت طلا و پولی کردن، و تحویل/دریافت طلا و دلار و سکه مثل همان کارتخوان؛
   پنجره به پنجره در صفحه نمایش گزینه‌ها را بخواهد») ----
   یک دستگاه مرحله‌ای (همان بدنه روشن ckDev): بالای صفحه نمایش نوار مرحله‌ها (هر مرحله با مقدارش؛ زدن = برگشت به همان مرحله)، وسط فقط
   همان یک خانه با عدد بزرگ، زیرش یک خط نتیجه زنده؛ صفحه‌کلید دستگاه عدد را می‌زند (در وزن «٫» به جای «۰۰۰»)، «تأیید» = مرحله بعد و در آخر افزودن.
   مرحله «نوع طلا» به جای صفحه‌کلید فهرست انتخاب است. خانه خالی = مقدار پیشنهادی (خاکستری) و اولین رقم جای آن را می‌گیرد.
   حالت‌ها: gx تعویض طلا، rg تبدیل مانده تومانی به طلا، gdl دریافت/تحویل طلا، gcv پولی کردن طلا. ذخیره با همان کدهای قبلی (ckGxX، rg، gkAddCore) */
const CKWZM={gx:1,rg:1,gdl:1,gcv:1};
const cWzGin=()=>ckGold()>0;/* مشتری طلا بدهکار است = دریافت طلا */
function cWzSteps(){const m=CK.m;
  if(m==='gx'){const C=ckGxC();return [{k:'w',l:'وزن طلای مشتری',s:'وزن',u:'گرم',t:'dec',need:'وزن طلای مشتری را بزنید'},{k:'ay',l:'عیار',s:'عیار',t:'int',d:()=>ckGxX().ay},{k:'gr',l:'هر گرم · خرید از مشتری',s:'هر گرم',u:'تومان',t:'num',d:()=>C.pg||'',v:()=>+CK.gv>0?C.pg:''},{k:'gv',l:'قیمت کل طلای مشتری',s:'قیمت کل',u:'تومان',t:'num',d:()=>C.amount||''}]}
  if(m==='rg')return [{k:'amount',l:'مبلغی که طلا می‌شود',s:'مبلغ',u:'تومان',t:'num',d:()=>ckLeft()},{k:'pg',l:'هر گرم ۱۸',s:'نرخ',u:'تومان',t:'num',d:()=>sv.rate||''}];
  if(m==='gdl')return [{k:'cat',l:'نوع طلا',s:'نوع',t:'pick'},{k:'wt',l:cWzGin()?'وزن طلای دریافتی':'وزن طلای تحویلی',s:'وزن',u:'گرم',t:'dec',d:()=>Math.abs(ckGold())||'',need:'وزن را بزنید'},{k:'ay',l:'عیار',s:'عیار',t:'int',d:()=>xrAy(cWzGin()?'in':'out',false,CK.cat||gkCat0())}];
  if(m==='gcv')return [{k:'wt',l:'وزن طلا · گرم ۷۵۰',s:'وزن',u:'گرم',t:'dec',d:()=>Math.abs(ckGold())||'',need:'وزن را بزنید'},{k:'pg',l:'هر گرم ۱۸',s:'نرخ',u:'تومان',t:'num',d:()=>sv.rate||''}];
  return []}
const cWzRaw=z=>{const v=CK[z.k];return v===''||v==null?'':String(v)};
const cWzVal=z=>{const r=cWzRaw(z);if(r!=='')return r;const v=z.v&&z.v();if(v!==''&&v!=null)return String(v);const d=z.d?z.d():'';return d===''||d==null?'':String(d)};
const cWzFmt=(z,v)=>v===''?'':z.t==='num'?Number(v).toLocaleString('en-US'):z.t==='dec'?v:z.t==='pick'?v:toEn(String(v));
function cWzRes(){const m=CK.m,side=v=>v>0?'طلبکاریم':v<0?'بدهکاریم':'تسویه';
  if(m==='gx'){const C=ckGxC(),r=ckRest();if(!(C.n>0))return 'وزن را بزنید؛ قیمت کل خودش حساب می‌شود';const af=r-C.amount,q=Math.round(C.n*(+ckGxX().ay||750)/750*1000)/1000;return `معادل ۷۵۰ <b>${wFmt(q)}</b> گرم · مانده بعد <b class="${af>0?'r':af<0?'b':'z'}">${fmt(Math.abs(af))}</b> ${side(af)}`}
  if(m==='rg'){const a=+cWzVal({k:'amount',d:()=>ckLeft()})||0,pg=+cWzVal({k:'pg',d:()=>sv.rate})||0;if(!(a>0&&pg>0))return 'مبلغ و نرخ را بزنید';return `معادل <b>${wFmt(Math.round(a/pg*1000)/1000)}</b> گرم ۷۵۰ · ${ckOut()?'مشتری طلا طلبکار می‌شود':'مشتری طلا بدهکار می‌شود'}`}
  const g=ckGold(),w=parseFloat(cWzVal(cWzSteps().find(z=>z.k==='wt')))||0;
  if(m==='gdl'){const ay=+cWzVal(cWzSteps()[2])||750,e=Math.round(w*ay/750*1000)/1000,af=Math.round((Math.abs(g)-e)*1000)/1000;if(!w)return 'وزن را بزنید';return `معادل ۷۵۰ <b>${wFmt(e)}</b> گرم · مانده طلا ${af>0.0005?`<b>${wFmt(af)}</b> گرم ${g>0?'طلبکاریم':'بدهکاریم'}`:af<-0.0005?`<b>${wFmt(-af)}</b> گرم ${g>0?'بدهکاریم':'طلبکاریم'}`:'<b class="z">تسویه</b>'}`}
  if(m==='gcv'){const pg=+cWzVal({k:'pg',d:()=>sv.rate})||0;if(!(w&&pg))return 'وزن و نرخ را بزنید';return `مبلغ <b>${fmt(Math.round(w*pg))}</b> تومان · ${g>0?'طلبکار':'بدهکار'} تومانی می‌شویم`}
  return ''}
const CKWZT={gx:['تعویض طلا','gx'],rg:['تبدیل به طلا','rg'],gdl:['',''],gcv:['پولی کردن طلا','gp']};
const cWzTitle=()=>CK.m==='gdl'?(cWzGin()?'دریافت طلا':'تحویل طلا'):(CKWZT[CK.m]||[''])[0];
function cWzHead(){const m=CK.m,g=ckGold(),r=ckRest(),gold=m==='gdl'||m==='gcv';const sub=gold?`مانده طلا ${wFmt(Math.abs(g))} گرم · ${g>0?'طلبکاریم':g<0?'بدهکاریم':'تسویه'}`:`مانده ${fmt(Math.abs(r))} تومان · ${r>0?'طلبکاریم':r<0?'بدهکاریم':'تسویه'}`;
  const A=ckAni(m==='gdl'?'gd':(CKWZT[m]||[])[1]||'gx',m==='gdl'&&!cWzGin());return `<span class="ckbi g wzi">${A||ic('coin')}</span><span class="tx"><b>${cWzTitle()}</b><small>${sub}</small></span>`}
function cWzLcd(){const S=cWzSteps(),i=Math.min(CK.st|0,S.length-1),z=S[i];
  const chips=`<div class="wzc">${S.map((q,j)=>{const v=cWzVal(q);return `<button type="button" class="${j===i?'on':j<i?'dn':''}" data-act="ckWzGo" data-i="${j}"><small>${toFa(j+1)} · ${q.s}</small><b>${v?esc(cWzFmt(q,v)):'—'}</b></button>`}).join('')}</div>`;
  if(z.t==='pick'){const L=gkCats(),c=CK.cat||gkCat0();return chips+`<div class="ptm-bt">${esc(z.l)}؟</div><div class="wzp">${L.map(k=>`<button type="button" class="ptm-br${k===c?' on':''}" data-act="ckWzPk" data-k="${esc(k)}"><span class="ckbi g">${ic('coin')}</span><span class="tx"><b>${esc(k)}</b><small>عیار ${toFa(String(xrAy(cWzGin()?'in':'out',false,k)))}</small></span>${k===c?`<i class="ptm-bk">${ic('check')}</i>`:''}</button>`).join('')}</div>`}
  const raw=cWzRaw(z),v=cWzVal(z);return chips+`<div class="ptm-v wzv"><small>${esc(z.l)}${z.u?' · '+z.u:''}</small><b class="${raw===''&&!(z.v&&z.v())?'df':''}">${v?esc(cWzFmt(z,v)):'0'}</b></div><div class="wzr">${cWzRes()}</div>`}
function ckWiz(){const m=CK.m,S=cWzSteps(),i=Math.min(CK.st|0,S.length-1),z=S[i],pk=z.t==='pick',pap=m==='gx'||m==='gdl';
  return `<div class="ptm lt wz${CK.noan?' noan':''}${pap?'':' nopap'}" id="posD" style="--bk:#b27c0e">
  ${pap?`<div class="ptm-pap has wzpp"><label class="ptm-ds"><small>شرح</small><input id="ckDs" value="${esc(CK.ds||'')}" placeholder="اختیاری، مثلاً دستبند کارتیر" autocomplete="off" enterkeyhint="done"></label>${ckPhIn()}</div>`:''}
  <div class="ptm-top"><span class="ptm-slot"></span><span class="ptm-led"></span></div>
  <div class="ptm-body"><div class="ptm-hd" id="posH">${cWzHead()}</div>
    <div class="ptm-lcd wzl${pk?' pk':''}" id="posS">${cWzLcd()}</div>
    ${pk?'':ckKeys('lt',z.t==='dec')}</div></div>`}
function cWzPaint(full){const S=cWzSteps(),z=S[Math.min(CK.st|0,S.length-1)],L=$('posS'),dot=!!document.querySelector('#posD .ptm-k.dot');
  if(full||!L||(z.t==='pick')!==L.classList.contains('pk')||(z.t==='dec')!==dot){ckRead();CK.noan=1;ckRe();CK.noan=0;return}L.innerHTML=cWzLcd();const H=$('posH');if(H)H.innerHTML=cWzHead()}
function ckWzK(k){const S=cWzSteps(),i=Math.min(CK.st|0,S.length-1),z=S[i];if(!z)return;
  if(k==='x'){ACT.ckM({m:''});return}
  if(k==='ok'){if(z.need&&!(parseFloat(cWzVal(z))>0)){toast(z.need,true);return}if(i<S.length-1){CK.st=i+1;CK.pre=1;cWzPaint()}else ACT.ckAdd();return}
  if(z.t==='pick')return;let v=cWzRaw(z);if(v===''&&z.v&&z.v())v='';
  if(CK.pre){if(/^[\d.]/.test(k))v='';else if(v==='')v=String(cWzVal(z));CK.pre=0}
  if(k==='c')v='';else if(k==='bs')v=v.slice(0,-1);else if(k==='.'){if(z.t==='dec'&&!v.includes('.'))v=(v||'0')+'.'}
  else{v=v+k;if(z.t!=='dec')v=v.replace(/^0+(?=\d)/,'');if(z.t==='dec'){const[a,b]=v.split('.');v=a.slice(0,5)+(b!=null?'.'+b.slice(0,3):'')}else v=v.slice(0,z.t==='int'?4:13)}
  CK[z.k]=v;if(CK.m==='gx'&&z.k!=='gv')CK.gv='';
  try{navigator.vibrate&&navigator.vibrate(6)}catch(_){}cWzPaint()}
ACT.ckWzGo=d=>{if(!CK||!CKWZM[CK.m])return;CK.st=+d.i||0;CK.pre=1;cWzPaint()};
ACT.ckWzPk=d=>{if(!CK)return;const a0=xrAy(cWzGin()?'in':'out',false,CK.cat||gkCat0());if(CK.ay===''||CK.ay==null||+CK.ay===a0)CK.ay='';CK.cat=d.k;CK.st=1;CK.pre=1;try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}cWzPaint(1)};
const ckFormOk=()=>{const m=CK.m;return !((m==='dep'||m==='cust'&&ckOut())&&!CK.sel||(m==='hav'||m==='pos')&&(CK.pl||!ckBkL().length))};
ACT.ckAll=()=>{ckRead();CK.pl=1;CK.sq='';ckRe('ckS')};
ACT.ckAmt=d=>{const A=$('ckA');if(!A)return;if(CK&&CK.kt){CK.kt=0;ckTnP()}A.value=(+d.v).toLocaleString('en-US');CK.amount=+d.v;if(A.oninput&&!A.readOnly)A.oninput();const h=A.closest('.ckbig,.ptm-lcd,.ckscr');if(h&&!RM()&&h.animate)h.animate([{transform:'scale(1.03)'},{transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.9,.25,1)'})};
function ckHTML(){const T=svTot(),c=svCu(),r=ckRest(),wp=c&&sv.edit&&typeof wdPend==='function'?wdPend(c,sv.edit.no):0,R=ckRows(),A=ckAcct(),tg=ckTg(),gw=ckGold(),TL={p:'مانده قبلی',d:A?'این سند':'مانده این سند',f:'مانده نهایی'}[tg];
  /* ریز مانده‌ها (قبلی · سند · نهایی، مبلغ و طلا)؛ خانه انتخاب‌شده پررنگ و با زدن هر خانه هدف تسویه عوض می‌شود */
  const L=svBalL(),gr=L.find(z=>z[0]==='g'),rr=L.find(z=>z[0]==='r')||['r',0,0,0];
  if(CK.m&&CK.m!=='bfix'){const xk=/^xq:/.test(CK.m)?CK.m.slice(3):'',Tm=xk?['',(ckXv(xk)>0?'دریافت ':'تحویل ')+((XA[xk]||{}).t||xk),'']:CKWZM[CK.m]?['',cWzTitle(),'']:(ckOut()?CKO:CKT).find(z=>z[0]===CK.m)||['','',''],ok=ckFormOk(),pz=!!xk||!!CKWZM[CK.m]||!CK.pl&&(((CK.m==='pos'||CK.m==='hav')&&ckBkL().length>0)||CK.m==='cash'||CK.m==='dep'||(CK.m==='cust'&&ckOut()));
    /* v91.5: کارتخوان = صفحه ثابت (بدون اسکرول، دستگاه همه جا را می‌گیرد) و مانده داخل صفحه نمایش خود دستگاه است */
    const pm=false,fx=pz;
    return `<div class="ckw ckfo m-${CK.m}${CK.pl?' pl':''}${pz?' cpos':''}${pm?' cpay':''}${fx?' fix':''}"><div class="sh-h"><button type="button" class="shbk" data-act="ckM" data-m="" aria-label="برگشت به تسویه">${ic('back')}</button><div><b>${Tm[1]}</b><small class="shsub">${esc(c?cuName(c):'')}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
    ${pz||pm?'':`<div class="ckrm ${r>0?'d':r<0?'c':'z'}"><small>${TL} · ${r>0?'طلبکاریم':r<0?'بدهکاریم':'تسویه'}</small><b><span id="ckRn" data-v="${Math.abs(r)}">${fmt(Math.abs(r))}</span><i>تومان</i></b></div>`}
    ${ckForm()}${ok?`<button class="xgo" data-act="ckAdd">${ic('check')} افزودن</button>`:''}</div>`}
  /* v101.2 (خواسته صاحب اپ: «مانده‌ها بهتر مشخص باشد؛ این قسمت یک پلتفرم ثابت باشد؛ لیست حواله‌ها و دریافتی‌ها این‌جا نخورد، اگر واریزی و کارتخوانی خورد
     خیلی کامپکت باشد و مانده را نشان بدهد؛ دکمه‌ها سه‌بعدی‌تر با انیمیشن زدن»): نمای کلی تسویه = صفحه ثابت (بدون اسکرول کل پنجره) —
     ۱) کارت رنگی مانده (قرمز طلبکاریم / آبی بدهکاریم / سبز تسویه / کهربایی رفته برای واریز) با عدد بزرگ و سه دکمه قبلی · این سند · نهایی داخل خود کارت،
        طلا و سکه‌های باقی‌مانده چیپ زیر عدد؛ ۲) ردیف‌های اضافه‌شده فقط یک نوار افقی از چیپ‌های کوچک (نوع، مبلغ، ×)؛ ۳) کاشی روش‌ها سه‌بعدی، که اگر زیاد شوند فقط خودشان اسکرول می‌خورند */
  const k3=r>0?'d':r<0?'c':'z',wq=wp&&r&&wp>=Math.abs(r)-1,sgn=v=>v<0?'r':v>0?'b':'z';
  const seg=c?`<div class="ckos">${[['p','قبلی',1],['d','این سند',2],['f','نهایی',3]].map(([w,l,ix])=>{const v=rr[ix]||0;return `<button type="button" class="${tg===w?'on':''}" data-act="ckTg" data-w="${w}"><small>${l}</small><b class="${sgn(v)}">${v?fmt(Math.abs(v)):'۰'}</b></button>`}).join('')}</div>`:'';
  const chips=[...(gw?[`<span class="ckoc g"><i>${ic('coin')}</i>طلا ${wFmt(Math.abs(gw))} گرم · ${gw>0?'طلبکاریم':'بدهکاریم'}</span>`]:[]),...svBalL().filter(z=>z[0]!=='r'&&z[0]!=='g'&&ckXv(z[0])).map(z=>{const v=ckXv(z[0]),A0=XA[z[0]]||{t:z[0],u:'عدد'};return `<span class="ckoc x"><i>${ic(/USD|EUR|AED/.test(z[0])?'usd':'coin')}</i>${esc(A0.t)} ${qFmt(Math.abs(v))} · ${v>0?'طلبکاریم':'بدهکاریم'}</span>`})].join('');
  const card=`<div class="ckob ${wq?'w':k3}"><div class="ckobt"><span>${r?(wq?'رفت برای واریز · منتظر تأیید بانک':TL+' · '+(r>0?'طلبکاریم':'بدهکاریم')):TL+' · تسویه است'}</span><em>${tg==='d'&&!A?'جمع سند':'این سند'} ${fmt(Math.abs(T.total))}</em></div>
    <div class="ckobv">${r?`<b><span id="ckRn" data-v="${Math.abs(r)}">${fmt(Math.abs(r))}</span></b><i>تومان</i>`:`<i>${ic('check')}</i><b class="ok">تسویه شد</b>`}</div>${chips?`<div class="ckobc">${chips}</div>`:''}${seg}</div>`;
  const pz=R.length?`<div class="ckoz" aria-label="دریافت و پرداخت‌های این سند">${R.map(z=>`<div class="ckoi"><span class="ckoii">${ic(z.ico)}</span><span class="tx"><small>${esc(z.lab)}</small><b>${fmt(Math.abs(z.amt))}</b></span>${z.lock?`<span class="ckoil">${ic('check')}</span>`:`<button type="button" class="ckoix" data-act="ckDel" data-k="${z.k}" data-i="${z.i}" aria-label="حذف ${esc(z.lab)}">${ic('x')}</button>`}</div>`).join('')}</div>`:'';
  const tl=!r&&!gw&&!ckXT().length?'':`<div class="ckt cko3${r<0?' out':''}">${[...(r?(r<0?CKO:CKT):[]),...(gw?[['gd',(gw>0?'دریافت طلا · ':'پرداخت طلا · ')+wFmt(Math.abs(gw))+' گرم',gw>0?'dIn':'dOut'],['gp','پولی کردن طلا · '+wFmt(Math.abs(gw))+' گرم','swap']]:[]),...ckXT()].map(([k,t,i])=>{const A2=ckAni(k,k.slice(0,2)==='x:'||k==='gd'?i==='dOut':r<0);return `<button class="ckti q-${k.replace(/:.*/,'')}${A2?' an':''}" data-act="ckM" data-m="${k}"><i>${A2||ic(i)}</i><span>${t}</span></button>`}).join('')}</div>`;
  const bf=CK.m==='bfix';
  return `<div class="ckw${bf?'':' cko fix'}"><div class="sh-h"><div><b>${tg==='d'&&!A?'تسویه سند':tg==='p'?'تسویه مانده قبلی':'تسویه حساب'}</b><small class="shsub">${esc(c?cuName(c):'')}${r<0?' · مانده را به مشتری می‌پردازیم':''}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${card}${wdCkHTML()}${pz}
  ${!CK.m&&c&&c.grp==='بانک'?bfxTile():''}${bf?bfxForm():tl}
  <button class="xgo cksave" data-act="ckSave">${ic('check')} پایان و ثبت سند${r>0?`<small>مانده ${fmt(r)} به حساب مشتری</small>`:''}</button></div>`}
function ckRead(){const g=id=>{const e=$(id);return e?e.value:undefined};if($('ckA'))CK.amount=num(g('ckA'));if($('ckT'))CK.tn=toEn(g('ckT')||'').trim();if($('ckW'))CK.w=decIn(g('ckW'));if($('ckY'))CK.ay=+toEn(g('ckY')).replace(/\D/g,'')||'';if($('ckQ'))CK.q=g('ckQ');if($('ckS'))CK.sq=g('ckS');if($('ckP'))CK.pg=num(g('ckP'));if($('ckNB'))CK.nbn=g('ckNB');if($('ckDs'))CK.ds=clean(g('ckDs'))}
/* صفحه‌کلید فیزیکی (کامپیوتر) برای صفحه‌کلید مبلغ */
document.addEventListener('keydown',e=>{if(!CK||!CK.m)return;const A=$('ckA');if(!A||!A.readOnly||!A.isConnected||$('ov').classList.contains('hide'))return;const t=e.target;if(t&&t.tagName==='INPUT'&&t!==A)return;const d=toEn(e.key);
  if(/^\d$/.test(d)){e.preventDefault();ACT.ckK({k:d})}else if(e.key==='Backspace'){e.preventDefault();ACT.ckK({k:'bs'})}else if(e.key==='Enter'){e.preventDefault();ACT.ckK({k:'ok'})}});
function ckBind(f){phPaint($('sheet'));$('sheet').querySelectorAll('.ckphb').forEach(l=>{l.onclick=()=>{ckRead();GAL={k:'row',ck:1}}});const A0=$('ckA');if(A0&&A0.readOnly){A0.onfocus=()=>A0.blur()}const A=A0&&A0.readOnly?null:A0,Q=$('ckQ'),W=$('ckW'),Y=$('ckY');const PS=$('ckS');if(PS)PS.oninput=()=>{CK.sq=PS.value;const P=$('ckPl');if(P)P.innerHTML=ckPick()};
  if(A){selOnFocus(A);A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''};A.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.ckAdd()}}}
  if(Q){Q.oninput=()=>{CK.q=Q.value;clearTimeout(Q._t);Q._t=setTimeout(()=>{const L=$('ckL');if(L){L.innerHTML=ckList();const u=L.firstElementChild;if(u)u.classList.add('noan')}},100)};const L=$('ckL');if(L)L.onpointerdown=e=>{if(e.target.closest('.stsr'))e.preventDefault()}}
  const GR=$('ckR'),GV=$('ckV'),nv=v=>v?Number(v).toLocaleString('en-US'):'',gx=who=>{const C=ckGxC(),el=$('ckX');if(GR&&who!=='r')GR.value=nv(C.pg);if(GV&&who!=='v')GV.value=nv(C.amount);if(el)el.innerHTML=ckGxRes()};
  if(W&&GV){W.oninput=()=>{ckRead();CK.gv='';gx('w')};Y.oninput=()=>{ckRead();CK.gv='';gx('y')};
    selOnFocus(GR);selOnFocus(GV);GR.oninput=()=>{const v=num(GR.value);GR.value=nv(v);CK.gr=v||'';CK.gv='';gx('r')};GV.oninput=()=>{const v=num(GV.value),w=parseFloat(decIn(W.value))||0;GV.value=nv(v);CK.gv=v||'';/* قیمت کل تایپ شد: نرخ هر گرم همان قیمت ÷ وزن می‌شود (در ردیف هم همین نرخ می‌ماند؛ خود مبلغ دقیق در amT) */if(v&&w>0)CK.gr=Math.round(v/w);gx('v')};
    [W,Y,GR].forEach((e,i,A)=>{e.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();(A[i+1]||GV).focus()}}});GV.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();GV.blur()}}}
  const P=$('ckP'),rg=()=>{ckRead();const el=$('ckX');if(el)el.innerHTML=ckRgX()};if(P){selOnFocus(P);P.oninput=()=>{const v=num(P.value);P.value=v?v.toLocaleString('en-US'):'';rg()}}if(A&&CK.m==='rg'){const o=A.oninput;A.oninput=()=>{o();rg()}}
  bfxBind();const NB=$('ckNB');if(NB)NB.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.ckNBSave()}};const el=f&&$(f);if(el&&!el.readOnly)sheetFocus(el)}
const ckLeft=()=>Math.abs(ckRest());
ACT.ckM=d=>{ckRead();const m=d.m||'';/* v61.80: واریز مانده به حساب مشتری از لیست واریزی (15q) */if(m==='wd'){wdOpen();return}/* v61.39: تخفیف از پنجره تسویه — روی مانده همین سند */if(m==='off'){svOffOpen(true);return}
  /* v85.3 (خواسته صاحب اپ: «پرداخت هر نوع مانده‌ای — سکه، دلار و بقیه»): gd = دریافت/پرداخت طلا (فرم تسویه طلا)؛
     x:<جنس> = ردیف تحویل/دریافت همان تعداد (مانده آن جنس صفر)؛ xp:<جنس> = پولی کردن (ردیف پولی در سند با نرخ، مرحله‌ای) */
  if(m==='gd'||m==='gdl'||m==='gp'||m==='gcv'){const mm=m==='gd'||m==='gdl'?'gdl':'gcv';if(mm==='gcv'&&!sv.rate){toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true);return}const tg=CK&&CK.tg;CK={m:mm,tg,st:0,pre:1,cat:gkCat0(),wt:'',ay:'',pg:'',ds:''};ckRe();return}
  if(/^xp?:/.test(m)){const[kk,k]=m.split(':'),v=ckXv(k);if(!v)return;const q=String(Math.abs(v));
    /* v100.7 (صاحب اپ: «ارز را که می‌خواهم تحویل بدهم قسمت تحویل را نمی‌آورد؛ برای همه باید باشد»): کاشی و زدن مانده آن جنس در نوار پایین سند
       فرم خودش را باز می‌کند (همان دستگاه روشن): تعداد با صفحه‌کلید، پیش‌فرض کل مانده، بعد «تأیید» */
    if(kk==='x'){const tg=CK&&CK.tg;CK={m:'xq:'+k,tg,amount:Math.abs(v),q:'',pre:1};ckRe('ckA');return}
    closeSheet();setTimeout(()=>xrStart(xrNew(v>0?'sell':'buy',k,{pul:true,q,fl:'one',fd:v>0?'sell':'buy'})),80);return}
  if(m==='rg'&&!sv.rate){toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true);return}
  const tg=CK&&CK.tg;CK={m,tg,amount:m==='gx'||m==='bfix'?0:ckLeft(),q:'',pg:m==='rg'?sv.rate:'',pre:1,st:0};if(m==='gx'){CK.w='';CK.ay='';CK.gr='';CK.gv=''}if(m==='rg'){CK.amount='';CK.pg=''}if(m==='pos'||m==='hav'){const L=bkCus().filter(c=>String(c.id)!==String(sv.cuId)),last=ls.get('m_bk_cu',''),s0=L.find(c=>String(c.id)===String(last));CK.srcId=((s0||L[0]||{}).id);if(CK.srcId==null)CK.srcId='';if(m==='hav'&&s0)CK.pk=1}
  /* v100.8: فهرست اشخاص بدون پریدن کیبورد باز می‌شود (جستجو فقط با زدن خودش) */
  ckRe(m==='dep'||m==='cust'?'':m==='gx'?'ckW':m==='bfix'?'bfT':m?'ckA':'')};
ACT.ckCh=d=>{ckRead();CK.chId=d.id;ckRe()};
ACT.ckSrc=d=>{ckRead();CK.srcId=+d.id||d.id;CK.pk=1;CK.sq='';if(CK.pb)CK.kbT=Date.now()+550;const cs=$('ckCs');if(cs&&!CK.pl){cs.querySelectorAll('.ckc').forEach(b=>b.classList.toggle('on',b.dataset.id===String(d.id)));const pc=document.querySelector('#posD .ptm-card');if(pc){const z0=ckBkL().find(o=>String(o.id)===String(d.id));pc.querySelector('span').innerHTML=z0?(bkAvH(z0)||''):'';pc.classList.remove('in');void pc.offsetWidth;pc.classList.add('in')}const ph=$('posH');if(ph){ph.innerHTML=ckPosHead();const dv=ph.closest('.ptm'),z=ckBkL().find(o=>String(o.id)===String(d.id));if(dv&&z)dv.style.setProperty('--bk',bkClr(z));if(dv&&!RM()&&dv.animate)dv.animate([{transform:'translateY(4px)'},{transform:'none'}],{duration:260,easing:'cubic-bezier(.2,1.3,.4,1)'})}try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}return}CK.pl=0;if(CK.pb){CK.pb=0;CK.noan=1;ckRe('ckA');CK.noan=0;const pc=document.querySelector('#posD .ptm-card');if(pc){pc.classList.remove('in');void pc.offsetWidth;pc.classList.add('in')}try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}return}ckRe('ckA')};
ACT.ckSrcX=()=>{ckRead();CK.pl=1;ckRe('ckS')};
ACT.ckPick=d=>{ckRead();if(!d.k){CK.sel=null;ckRe('');return}CK.sel={k:d.k,id:d.id};CK.kbT=Date.now()+550;CK.pre=1;
  const av=d.k==='cu'?ckSelCap():(()=>{const x=validated().find(z=>String(z.id)===String(d.id));return x?x.amount-ckUsedDep(x.id):0})();
  CK.amount=ckOut()?ckLeft():Math.max(0,Math.min(ckLeft()||av,av));ckRe('ckA')};
ACT.ckAdd=()=>{ckRead();if(CK.m==='rg'){if(CK.amount===''||CK.amount==null)CK.amount=ckLeft();if(!(+CK.pg>0))CK.pg=sv.rate||''}const m=CK.m,a0=+CK.amount||0,out=ckOut(),a=a0,n0=sv.pays.length;
  if(m==='gdl'||m==='gcv'){const S=cWzSteps(),V=k=>cWzVal(S.find(z=>z.k===k)||{k});GTK={w:ckTg(),m:m==='gcv'?'cv':'dl',wt:V('wt'),ay:m==='gdl'?+V('ay')||750:750,pg:m==='gcv'?+V('pg')||0:'',cat:CK.cat||gkCat0(),ds:clean(CK.ds||''),pc:''};
    if(!gkAddCore()){GTK=null;return}const x=sv.xr[sv.xr.length-1];GTK=null;ckPhPut(n0,x);CK={m:''};ckBackToDoc();return}
  if(/^xq:/.test(m)){const k=m.slice(3),v=ckXv(k),A=XA[k]||{t:k,u:'عدد'};if(!(a>0)){toast('تعداد را بزنید',true);return}if(a>Math.abs(v)+1e-9){toast('بیشتر از مانده '+A.t+' است ('+qFmt(Math.abs(v))+')',true);return}
    const x=xrNew(v>0?'in':'out',k);x.q=String(a);sv.xr.push(x);ckPhPut(n0,x);svKeep();svRe();const tg=CK.tg;CK={m:'',tg};ckRe();toast((v>0?'دریافت ':'تحویل ')+A.t+' · '+qFmt(a)+' '+(A.u||'عدد')+' به سند اضافه شد');return}
  if(m==='rg'){if(!(a>0)){toast('مبلغ را وارد کنید',true);const A=$('ckA');if(A)A.focus();return}if(a>ckLeft()){toast('بیشتر از مانده است',true);return}if(!(+CK.pg>0)){toast('نرخ هر گرم را بزنید',true);return}
    const x=xrNew(out?'sell':'buy','gold',{pul:true,ay:750,cat:''});x.am=Math.round(a);x.w=String(ckRgW());if(+CK.pg!==+sv.rate){x.pg=+CK.pg;x.pgM=true}sv.xr.push(x);ckPhPut(n0,x);CK={m:''};ckBackToDoc();return}
  if(out&&m!=='gx'){if(!(a>0)){toast('مبلغ را وارد کنید',true);return}if(a>ckLeft()){toast('بیشتر از مانده سند است',true);return}
    if(m==='cash')sv.pays.push({m:'cash',amount:-a});
    if(m==='hav'){/* v80.7 رفع باگ: وقتی فهرست حساب‌ها باز بود و حسابی زده نشده بود، «پایان و ثبت» حواله را بی‌صدا روی اولین حساب می‌نشاند */if(!CK.pk||CK.srcId===''||CK.srcId==null||!bkCus().some(z=>String(z.id)===String(CK.srcId))){toast('اول حساب ما را از فهرست انتخاب کنید',true);const S=$('ckS');if(S)S.focus();return}sv.pays.push({m:'hav',amount:-a,cuId:CK.srcId,cuName:cuName(bkCus().find(z=>String(z.id)===String(CK.srcId))),bk:1,tn:CK.tn||''});ls.set('m_bk_cu',CK.srcId)}
    if(m==='dep'||m==='cust'){const s=CK.sel;if(s&&s.k==='nm'){sv.pays.push({m:'nm',amount:-a,cuName:s.n})}else{const c=s&&CU().find(z=>String(z.id)===String(s.id));if(!c){toast('مشتری را انتخاب کنید',true);return}sv.pays.push({m:'cust',amount:-a,cuId:c.id,cuName:cuName(c)})}}
    ckPhPut(n0);CK={m:''};ckBackToDoc();return}
  if(m==='gx'){const w=parseFloat(CK.w)||0;if(!sv.rate&&!(+CK.gr>0)){toast('نرخ هر گرم را بزنید',true);const e=$('ckR');if(e)e.focus();return}if(!(w>0)){toast('وزن طلا را بزنید',true);const e=$('ckW');if(e)e.focus();return}const x=ckGxX();x.w=String(CK.w);if(!(xrCalc(x,sv.rate).amount>0)){toast('قیمت کل را بزنید',true);return}if(clean(CK.ds||''))x.ds=clean(CK.ds);sv.xr.push(x);ckPhPut(n0,x);CK={m:''};ckBackToDoc();return}
  else{if(!(a>0)){toast('مبلغ را وارد کنید',true);const A=$('ckA');if(A)A.focus();return}
    if(m==='cash')sv.pays.push({m:'cash',amount:a});
    if(m==='pos'){if(CK.srcId===''||CK.srcId==null||!bkCus().some(z=>String(z.id)===String(CK.srcId))){toast('حساب کارتخوان را انتخاب کنید',true);return}sv.pays.push({m:'pos',amount:a,cuId:CK.srcId,cuName:cuName(bkCus().find(z=>String(z.id)===String(CK.srcId))),bk:1});ls.set('m_bk_cu',CK.srcId)}
    if(m==='hav'){/* v80.7 رفع باگ: وقتی فهرست حساب‌ها باز بود و حسابی زده نشده بود، «پایان و ثبت» حواله را بی‌صدا روی اولین حساب می‌نشاند */if(!CK.pk||CK.srcId===''||CK.srcId==null||!bkCus().some(z=>String(z.id)===String(CK.srcId))){toast('اول حساب ما را از فهرست انتخاب کنید',true);const S=$('ckS');if(S)S.focus();return}sv.pays.push({m:'hav',amount:a,cuId:CK.srcId,cuName:cuName(bkCus().find(z=>String(z.id)===String(CK.srcId))),bk:1,tn:CK.tn||''});ls.set('m_bk_cu',CK.srcId)}
    if(m==='dep'){const s=CK.sel;if(!s){toast('یکی از فهرست را انتخاب کنید',true);return}
      if(s.k==='nm')sv.pays.push({m:'nm',amount:a,cuName:s.n});else if(s.k==='cu'){const c=CU().find(z=>String(z.id)===String(s.id));if(!c)return;const S=oweSplit(c,a);if(S.rest>0){toast('بیشتر از بدهی ما به «'+cuName(c)+'» است ('+fmt(a-S.rest)+')'+(cuDepPend(c)?'؛ بخشی از طلبش واریزی ارسال‌شده به بانک است':''),true);return}S.R.forEach(p=>sv.pays.push(p));if(S.R.length>1||S.R[0].m==='dep')toast('حواله '+(S.R.some(p=>p.m==='cust')?'اول از طلب آزاد، بقیه ':'')+'روی واریزی «'+cuName(c)+'» نشست تا دوباره از بانک پرداخت نشود')}
      else{const x=validated().find(z=>String(z.id)===String(s.id));if(!x)return;const av=depAvail(x)-ckUsedDep(x.id);if(a>av){toast('بیشتر از مانده واریزی «'+fullName(x)+'» است ('+fmt(av)+')',true);return}sv.pays.push({m:'dep',amount:a,entId:x.id,entName:fullName(x)})}}}
  ckPhPut(n0);CK={m:''};ckBackToDoc()};
/* v61.32: بعد از افزودن هر دریافت/پرداخت در تسویه، پنجره بسته می‌شود و سند با ردیف تازه و مانده تازه دیده می‌شود */
function ckBackToDoc(){if(ckFin){ckFin=0;svKeep();closeSheet();setTimeout(()=>{if(cur==='sell')back()},60);return}svKeep();closeSheet();svAdd=-1;svRe();setTimeout(()=>{const r=document.querySelector('#svRows .d6r:last-child');if(r&&r.scrollIntoView)r.scrollIntoView({behavior:RM()?'auto':'smooth',block:'center'});if(r&&!RM()&&r.animate)r.animate([{background:'color-mix(in srgb,var(--blu) 14%,transparent)'},{background:'transparent'}],{duration:900,easing:'ease-out'})},120);
  const r=ckRest();toast(r?('ردیف به سند اضافه شد · مانده '+fmt(Math.abs(r))):(ckAcct()?'حساب تسویه شد ✓':'سند تسویه شد ✓'))}
ACT.ckDel=d=>{const L=d.k==='xr'?sv.xr:sv.pays;if(d.k!=='xr'&&L[+d.i]&&L[+d.i].m==='wd'){ACT.svWdRow();return}L.splice(+d.i,1);svKeep();svRe();ckRe()};
/* «پایان» = ثبت و خروج از سند (همان ثبت خودکار خروج) */
/* v80.4 رفع باگ: اگر فرم یک روش (حواله، نقد، کارتخوان…) باز و مبلغ پر بود و «پایان و ثبت» زده می‌شد، آن ردیف بی‌صدا دور ریخته
   می‌شد. حالا اول همان ردیف (با همان بررسی‌ها) اضافه می‌شود و بعد سند ثبت؛ اگر چیزی کم باشد پیام می‌دهد و پنجره می‌ماند */
let ckFin=0;
ACT.ckSave=()=>{ckRead();if(CK&&CK.m==='bfix'){bfxRead();if(CK.bt!==''&&CK.bt!=null){ckFin=1;try{bfxApply()}finally{ckFin=0}return}}if(CK&&CK.m&&(+CK.amount>0||+CK.w>0)){ckFin=1;try{ACT.ckAdd()}finally{ckFin=0}return}closeSheet();setTimeout(()=>{if(cur==='sell')back()},60)};
/* ثبت تسویه‌های «حواله به فروشنده واریزی» روی همان واریزی‌ها (بعد از ساخته شدن سند) */
/* v61.75 (خواسته صاحب اپ): حواله دوطرفه — تسویه روی واریزی به حساب همین مشتری پیوند دارد (cuId، مثل ثبت دستی با انتخاب مشتری؛
   اثرش فقط در سند است، byInv)، عکس‌های ردیف سند همان عکس‌های تسویه‌اند، و با ویرایش سند وضعیت/عکس/پیگیری تسویه قبلی می‌ماند (old) */
/* v90.9: stlSync هر واریزی یک بار، بعد از همه ردیف‌ها (also = واریزی‌هایی که نسخه قبلی سند تسویه‌شان را برداشته — invDepOff با lazy) تا در ویرایش سند
   «مانده» بی‌جهت ساخته و برداشته نشود */
function ckDepApply(c,t,now,old,also){let n=0;const T=new Set(also||[]);for(const p of t.pays||[]){if(p.m!=='dep')continue;const e=entries.find(z=>String(z.id)===String(p.entId));if(!e)continue;const o=old&&old[String(p.entId)]&&old[String(p.entId)].shift();
  const K=[...new Set([...xrPh(p),...(o?stImgs(o):[])])];if(K.length){p.imgs=K;p.img=K[0]}
  const z={id:o?o.id:nid++,st:o?o.st:'wait',name:cuName(c),phone:c.phone||'',inv:String(t.no),amount:pAmt(p),tn:(o&&o.tn)||p.tn||'',note:'سند فروش '+toFa(t.no),cuId:c.id,byInv:{cu:c.id,tx:t.id},date:t.date,at:now,by:who(),...(K.length?{imgs:K,img:K[0]}:{}),...(o&&o.okAt?{okAt:o.okAt,okBy:o.okBy}:{})};
  e.settles=(e.settles||[]).concat([z]);e.updatedAt=now;e.updatedBy=who();p.stlId=z.id;T.add(e);n++}T.forEach(e=>stlSync(e));if(n||T.size)saveE();return n}
/* حذف سند → تسویه‌های ساخته‌شده روی واریزی‌ها هم برداشته می‌شوند؛ تابع برگشتی برای «بازگردانی» */
/* تسویه‌های فعلی واریزی‌ها برای همین سند (پیش از ویرایش) */
function depKeep(t){const M={};(t.pays||[]).forEach(p=>{if(p.m!=='dep')return;const e=entries.find(z=>String(z.id)===String(p.entId));const z=e&&(e.settles||[]).find(s=>s.id===p.stlId);if(z)(M[String(p.entId)]=M[String(p.entId)]||[]).push({...z})});return M}
function invDepOff(t,lazy){const R=[];if(t.type!=='inv')return ()=>{};(t.pays||[]).forEach(p=>{if(p.m!=='dep')return;const e=entries.find(z=>String(z.id)===String(p.entId));if(!e)return;const i=(e.settles||[]).findIndex(z=>z.id===p.stlId);if(i<0)return;const z=e.settles[i];e.settles=e.settles.filter((_,k)=>k!==i);R.push([e,z])});
  if(lazy)return [...new Set(R.map(x=>x[0]))];/* ویرایش سند: stlSync را ckDepApply بعد از نشستن تسویه‌های تازه می‌زند */
  new Set(R.map(x=>x[0])).forEach(e=>stlSync(e));if(R.length)saveE();return ()=>{R.forEach(([e,z])=>{e.settles=(e.settles||[]).concat([z])});new Set(R.map(x=>x[0])).forEach(e=>stlSync(e));if(R.length)saveE()}}

/* ============ v61.59 (خواسته صاحب اپ): تسویه طلا — زدن روی مانده طلا (قبلی / سند / نهایی) ============
   مانده طلا (گرم ۷۵۰) با همان رنگ‌ها؛ دو راه: «دریافت/پرداخت طلا» (ردیف دریافت/پرداخت آبشده، وزن و عیار) و
   «تبدیل به مبلغ» (ردیف پولی: فروش پولی اگر طلبکاریم، خرید پولی اگر بدهکاریم — طلا صفر و مبلغ به مانده تومانی می‌رود).
   ساختار داده همان sv.xr است؛ بعد از افزودن پنجره بسته می‌شود و ردیف تازه در سند دیده می‌شود */
let GTK=null;
const gkRest=()=>{const g=svBalL().find(z=>z[0]==='g')||['g',0,0,0],ix=GTK.w==='p'?1:GTK.w==='f'?3:2;return Math.round(-(g[ix]||0)*1000)/1000};
function gkOpen(w){GTK={w:svCu()?(w||'f'):'d',m:''};sheet(gkHTML());gkBind()}
function gkRe(){if(!GTK||!$('sheet').querySelector('.gkw'))return;$('sheet').innerHTML=gkHTML();gkBind()}
function gkHTML(){const c=svCu(),r=gkRest(),L=svBalL(),g=L.find(z=>z[0]==='g')||['g',0,0,0],TL={p:'مانده طلای قبلی',d:'طلای این سند',f:'مانده طلای نهایی'}[GTK.w];
  const mini=c?`<div class="ckbl">${[['p','قبلی',1],['d','سند',2],['f','نهایی',3]].map(([w,l,ix])=>`<button type="button" class="ckbc${GTK.w===w?' on':''}" data-act="gkTg" data-w="${w}"><small>${l}</small><span class="${ftCls(g[ix])}"><b>${g[ix]?balV('g',g[ix]):'۰'}</b><i>گرم</i></span></button>`).join('')}</div>`:'';
  const O=r>0?[['dl','دریافت طلا','dIn'],['cv','تبدیل به مبلغ','swap']]:[['dl','پرداخت طلا','dOut'],['cv','تبدیل به مبلغ','swap']];
  return `<div class="ckw gkw"><div class="sh-h"><div><b>تسویه طلا</b><small class="shsub">${esc(c?cuName(c):'')}${r<0?' · طلا را به مشتری می‌دهیم':''}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${mini}<div class="ckh ${r>0?'d':r<0?'c':'z'}"><small>${r?TL+' · '+(r>0?'طلبکاریم':'بدهکاریم'):TL+' تسویه است ✓'}</small><b>${wFmt(Math.abs(r))}<i>گرم ۷۵۰</i></b>${sv.rate&&r?`<em>به نرخ امروز حدود ${fmt(Math.round(Math.abs(r)*sv.rate))} تومان</em>`:''}</div>
  ${GTK.m?gkForm(r):!r?'':`<div class="ckt gkt">${O.map(([k,t,i])=>{const A=ckAni(k,i==='dOut');return `<button class="ckti q-${k}${A?' an':''}" data-act="gkM" data-m="${k}"><i>${A||ic(i)}</i><span>${t}</span></button>`}).join('')}</div>`}</div>`}
/* v92.2 (خواسته صاحب اپ: «مستقیم آبشده می‌زند ولی ممکن است متفرقه گرفته باشیم»): نوع طلای دریافت/پرداخت — آبشده، متفرقه و کالاهای مغازه؛ آخرین انتخاب به یاد می‌ماند */
function gkCats(){const F=['آبشده','متفرقه'],G=goodsList().filter(k=>!F.includes(k)&&k!=='سکه'&&k!=='سکه پارسیان'&&!['سکه','ارز'].includes(gCat(k))).sort((x,y)=>(svUsed[y]||0)-(svUsed[x]||0));return [...F,...G]}
const gkCat0=()=>{const k=ls.get('m_gk_cat','آبشده');return gkCats().includes(k)?k:'آبشده'};
function gkCatH(){const L=gkCats(),c=GTK.cat||'آبشده';return `<div class="gkty"><small>نوع طلا</small><div class="gktys">${L.map(k=>`<button type="button" class="gktc${k===c?' on':''}" data-act="gkCat" data-k="${esc(k)}">${ic('check')}<span>${esc(k)}</span></button>`).join('')}</div></div>`}
function gkForm(r){const cv=GTK.m==='cv',ay=+GTK.ay||750,w=parseFloat(GTK.wt)||0,e=Math.round(w*ay/750*1000)/1000;
  const body=cv?`<div class="ckg"><label class="ckf"><small>وزن (گرم ۷۵۰)</small><input id="gkW" class="ltr" inputmode="decimal" value="${esc(GTK.wt||'')}" autocomplete="off"></label><label class="ckf"><small>هر گرم ۱۸ (تومان)</small><input id="gkP" class="ltr" inputmode="numeric" value="${GTK.pg?Number(GTK.pg).toLocaleString('en-US'):''}" autocomplete="off"></label></div>
    <div class="ckx" id="gkX">${w&&+GTK.pg?'مبلغ: <b>'+fmt(Math.round(w*GTK.pg))+'</b> تومان '+(r>0?'طلبکار می‌شویم':'بدهکار می‌شویم'):'وزن و نرخ را بزنید'}</div>`
   :`${gkCatH()}${gkPcH()}<div class="ckg"><label class="ckf"><small>وزن (گرم)</small><input id="gkW" class="ltr" inputmode="decimal" value="${esc(GTK.wt||'')}" autocomplete="off"></label><label class="ckf"><small>عیار</small><input id="gkY" class="ltr" inputmode="numeric" value="${esc(String(ay))}" autocomplete="off"></label></div><label class="ckf ckds"><small>شرح کالا <i>اختیاری</i></small><input id="gkD" value="${esc(GTK.ds||'')}" placeholder="مثلاً دستبند کارتیر" autocomplete="off" enterkeyhint="done"></label>
    <div class="ckx" id="gkX">${w?'معادل ۷۵۰: <b>'+wFmt(e)+'</b> گرم':'وزن را بزنید'}</div>`;
  const T=cv?['تبدیل به مبلغ','swap']:r>0?['دریافت طلا','dIn']:['پرداخت طلا','dOut'];
  return `<div class="ckfm"><div class="ckfh"><b>${ic(T[1])} ${T[0]}</b><span class="ckfa"><button class="lnk" data-act="gkM" data-m="">انصراف</button><button type="button" class="ckok" data-act="gkAdd">${ic('check')} افزودن</button></span></div>${body}</div>`}
function gkRead(){const g=id=>{const e=$(id);return e?e.value:undefined};if($('gkW'))GTK.wt=decIn(g('gkW'));if($('gkY'))GTK.ay=+toEn(g('gkY')).replace(/\D/g,'')||'';if($('gkP'))GTK.pg=num(g('gkP'));if($('gkD'))GTK.ds=clean(g('gkD'))}
function gkBind(){const W=$('gkW'),Y=$('gkY'),P=$('gkP'),up=()=>{gkRead();const el=$('gkX');if(!el)return;const r=gkRest(),w=parseFloat(GTK.wt)||0;
    if(GTK.m==='cv')el.innerHTML=w&&+GTK.pg?'مبلغ: <b>'+fmt(Math.round(w*GTK.pg))+'</b> تومان '+(r>0?'طلبکار می‌شویم':'بدهکار می‌شویم'):'وزن و نرخ را بزنید';
    else el.innerHTML=w?'معادل ۷۵۰: <b>'+wFmt(Math.round(w*(+GTK.ay||750)/750*1000)/1000)+'</b> گرم':'وزن را بزنید'};
  if(W){selOnFocus(W);W.oninput=()=>{W.value=decIn(W.value);up()}}if(Y)Y.oninput=()=>{Y.value=toEn(Y.value).replace(/\D/g,'').slice(0,3);up()};
  if(P){selOnFocus(P);P.oninput=()=>{const v=num(P.value);P.value=v?v.toLocaleString('en-US'):'';up()}}
  if(W)sheetFocus(W)}
ACT.gkTg=d=>{gkRead();GTK={w:d.w,m:''};gkRe()};
ACT.gkM=d=>{gkRead();const m=d.m||'';if(m==='cv'&&!sv.rate){toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true);return}GTK={w:GTK.w,m,wt:String(Math.abs(gkRest())||''),ay:750,pg:sv.rate||'',cat:gkCat0()};if(m==='dl')GTK.ay=gkAy0(GTK.cat);gkRe()};
/* عیار پیش‌فرض نوع طلا در تسویه: تحویل متفرقه ۷۴۰، بقیه ۷۵۰؛ اگر کاربر عیار را دست نزده باشد با عوض کردن نوع عوض می‌شود */
const gkAy0=cat=>xrAy(gkRest()>0?'in':'out',false,cat);
ACT.gkCat=d=>{if(!GTK)return;gkRead();if(+GTK.ay===gkAy0(GTK.cat)){GTK.ay=gkAy0(d.k);const Y=$('gkY');if(Y){Y.value=GTK.ay;if(Y.oninput)Y.oninput()}}GTK.cat=d.k;document.querySelectorAll('#sheet .gktc:not(.abpb)').forEach(b=>b.classList.toggle('on',b.dataset.k===d.k));/* v96.1: برچسب‌های «آبشده‌های موجود» فقط برای نوع آبشده */if(GTK.pc||$('gkPcs')||gkPcH()){if(d.k!=='آبشده')GTK.pc='';gkRe()}};
function gkAddCore(){const r=gkRest(),w=parseFloat(GTK.wt)||0;if(!(w>0)){toast('وزن را بزنید',true);const W=$('gkW');if(W)W.focus();return false}
  if(GTK.m==='cv'){if(!(+GTK.pg>0)){toast('نرخ هر گرم را بزنید',true);return false}const x=xrNew(r>0?'sell':'buy','gold',{pul:true,ay:750,cat:''});x.w=String(GTK.wt);if(+GTK.pg!==+sv.rate){x.pg=+GTK.pg;x.pgM=true}sv.xr.push(x)}
  else{const ay=+GTK.ay||750;if(ay<100||ay>1000){toast('عیار درست نیست',true);return false}const cat=gkCats().includes(GTK.cat)?GTK.cat:'آبشده',x=xrNew(r>0?'in':'out','gold',{cat,ay});x.w=String(GTK.wt);if(clean(GTK.ds||''))x.ds=clean(GTK.ds);/* v96.1: تکه آبشده (15zz) */if(abIn(x))x.pid='P'+(nid++);if(abOutX(x)&&GTK.pc){const p=abList().find(z=>z.key===GTK.pc);if(p){if(w>p.av+0.0004){toast('وزن از موجودی این آبشده بیشتر است · موجود '+wFmt(p.av)+' گرم',true);return false}x.pc=p.key;if(p.lab)x.lab=p.lab;if(p.ang)x.ang=p.ang}}sv.xr.push(x);ls.set('m_gk_cat',cat)}return true}
ACT.gkAdd=()=>{gkRead();if(!gkAddCore())return;
  GTK=null;svKeep();closeSheet();svAdd=-1;svRe();setTimeout(()=>{const R=document.querySelectorAll('#svRows .d6r'),el=R[R.length-1];if(el&&el.scrollIntoView)el.scrollIntoView({behavior:RM()?'auto':'smooth',block:'center'})},120);
  const g=(svBalL().find(z=>z[0]==='g')||[])[3]||0;toast(g?'ردیف به سند اضافه شد · مانده طلا '+wFmt(Math.abs(g))+' گرم':'طلا تسویه شد ✓')};

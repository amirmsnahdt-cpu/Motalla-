/* ============ v82.5 (خواسته صاحب اپ: «از بخش بانک و لیستش راضی نیستم؛ شبیه حساب‌های مشتری؛ اصلاح حساب نباید موجودی را صفر کند؛
   موجودی = خود بانک + حواله‌ها + کارتخوان − واریزی‌های مشتری؛ ساده و روان، خیلی راحت حواله بزنم») ============
   ۱) فهرست حساب‌ها = همان ردیف‌های فهرست مشتری (c6r): لوگوی بانک، نام، بانک/شبا و کارتخوان در راه، مانده نهایی سمت چپ؛
      بالای فهرست یک کارت کوچک جمع (bkTotHTML). کشیدن ردیف = «حواله» از همین حساب / «ویرایش».
   ۲) «اصلاح حساب» دیگر مانده را از نو شروع نمی‌کند: اختلاف موجودی اپ بانک با برنامه یک ردیف سند شماره‌دار «اصلاح حساب»
      (fxa/fxs) در گردش حساب می‌شود (bkFix) — گردش‌های قبلی و مانده قبلی سر جایشان می‌مانند.
   ۳) «حواله» (دکمه بالای صفحه بانک‌ها و هر حساب): یک پنجره — از کدام حساب ما، به چه کسی (مشتری/هزینه یا حساب دیگر ما)، مبلغ، شرح.
      به مشتری = سند بانکی با طرف حساب (bdMirror → سند متقابل در حساب مشتری)؛ بین دو حساب ما = برداشت از یکی و واریز به دیگری
      با یک شماره، دو ردیف به هم وصل (xs/xl) تا ویرایش و حذف هر طرف، طرف دیگر را هم عوض کند (bdXfer). */
function bkFix(s,v){const e=acEst(s);if(e==null)return 0;const d=Math.round(v-e);if(!d)return 0;const now=new Date().toISOString();
  (s.led=s.led||[]).push({id:nid++,type:d>0?'in':'out',k:d>0?'fxa':'fxs',amount:Math.abs(d),note:'بانک '+fmt(v)+' · برنامه '+fmt(e),cuId:'',date:todayISO(),at:now,by:who(),no:invNext()});s.updatedAt=now;return d}
/* انتقال بین دو حساب ما: طرف دیگر را با این طرف هم‌مبلغ/هم‌تاریخ/حذف نگه می‌دارد */
function bdXfer(s,no){const now=new Date().toISOString();let ch=0;
  for(const z of s.led||[]){if(z.no==null||String(z.no)!==String(no)||z.xs==null)continue;const t=sources.find(q=>String(q.id)===String(z.xs)),y=t&&(t.led||[]).find(q=>String(q.id)===String(z.xl));if(!y)continue;
    if(z.del){if(!y.del){y.del=true;y.delAt=now;y.delBy=who();t.updatedAt=now;ch=1}}else if(+y.amount!==+z.amount||y.date!==z.date||y.del){y.amount=+z.amount;y.date=z.date;y.del=false;y.edAt=now;y.edBy=who();t.updatedAt=now;ch=1}}
  if(ch)saveS()}
/* ----- فهرست حساب‌ها ----- */
function bkTotHTML(L,S){const K=L.filter(s=>S.get(s.id).known),tot=K.reduce((a,s)=>a+S.get(s.id).fin,0),way=L.reduce((a,s)=>a+acPosPend(s),0),miss=L.length-K.length;if(!L.length)return '';
  return `<div class="bktot${bxWas?'':' anim'}"><span class="bktl"><small>جمع موجودی حساب‌ها</small>${miss?`<em>${toFa(miss)} حساب ثبت نشده</em>`:way?`<em>با کارتخوان در راه ${fmt(way)}</em>`:''}</span><b class="${tot<0?'n':''}">${K.length?`<span class="cbn" data-k="r" data-v="${Math.abs(Math.round(tot))}">${tot<0?'−':''}${fmt(Math.abs(Math.round(tot)))}</span><i>تومان</i>`:'—'}</b></div>`}
function bkRowH(s,m,ri){const bk=acBank(s),way=acPosPend(s),sub=[s.cash?'':bk&&!canon(s.name).includes(canon(bk))?'بانک '+bk:'',s.iban?'شبا …'+toFa(String(s.iban).slice(-4)):s.card?'کارت …'+toFa(String(s.card).slice(-4)):'',way?'کارتخوان در راه '+fmt(way):''].filter(Boolean).join(' · ');
  const v=m.known?`<b><span class="cbn" data-k="r" data-v="${Math.abs(Math.round(m.fin))}">${m.fin<0?'−':''}${fmt(Math.abs(Math.round(m.fin)))}</span></b><small>تومان</small>`:'<b>ثبت نشده</b><small>موجودی را بزنید</small>';
  const c=can('src'),r=c?[...(s.cash?[]:[['hvNew','حواله','swap','#2f6fe0']]),['acEdit','ویرایش','edit','#8a8f98']]:[];
  return swW(`<button class="c6r bxrow bkr" data-act="acOpen" data-id="${s.id}" style="--r:${Math.min(ri,8)}"><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):s.cash?ic('cash'):esc(userInit(s.name))}</span><span class="tx"><b>${esc(s.name)}</b><small>${esc(sub)}</small></span><span class="bkv${m.known?(m.fin<0?' n':''):' z'}">${v}</span></button>`,{r,l:[],data:{id:s.id}})}
/* ----- حواله ----- */
let HV=null;
const hvAccs=()=>ownL();
const hvSrc=()=>HV&&sources.find(z=>String(z.id)===String(HV.sid));
ACT.hvNew=d=>{d=d||{};if(!can('src'))return;const A=hvAccs();if(!A.length){toast('اول یک حساب بانک مغازه بسازید',true);return}
  let sid=d.id!=null&&d.id!==''?d.id:cur==='bank'&&curBk()&&!curBk().cash?curBk().id:null;if(sid==null){const l=LS.getItem('m_hv_src');sid=A.some(s=>String(s.id)===String(l))?l:(A.find(s=>s.bal!=null)||A[0]).id}
  HV={dir:'out',sid:String(sid),to:null,q:'',a:0,n:''};sheet(hvHTML());hvBind();setTimeout(()=>{const q=$('hvq');if(q)sheetFocus(q)},40)};
function hvToH(){const t=HV.to;if(!t)return '';if(t.k==='bk'){const s=sources.find(z=>String(z.id)===String(t.id));if(!s)return '';const bk=acBank(s);return `<div class="hvto"><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):esc(userInit(s.name))}</span><span class="tx"><b>${esc(s.name)}</b><small>حساب دیگر مغازه · ${esc(bkSub(s))}</small></span><button type="button" class="x" data-act="hvToX" aria-label="عوض کردن">×</button></div>`}
  const c=CU().find(z=>String(z.id)===String(t.id));if(!c)return '';const B=cuBal(c);return `<div class="hvto"><span class="c6a cul" style="--h:${cuHue(c)}">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${esc([c.grp||'مشتری',B.R?fmt(Math.abs(B.R))+' تومان '+ourLab(B.R):'حساب تسویه'].join(' · '))}</small></span><button type="button" class="x" data-act="hvToX" aria-label="عوض کردن">×</button></div>`}
function hvRes(){const q=nzName(toEn(clean(HV.q||''))),s0=HV.sid,out=HV.dir==='out';
  let C=CU().filter(c=>!q||nzName(toEn(cuName(c)+' '+(c.grp||'')+' '+(c.cno||''))).includes(q));C.sort((a,b)=>String(b.lastAt||'').localeCompare(String(a.lastAt||'')));C=C.slice(0,q?20:6);
  const O=hvAccs().filter(s=>String(s.id)!==String(s0)&&(!q||bkHit(s,q)));
  const cr=c=>{const B=cuBal(c);return `<button type="button" class="c6r hvr" data-act="hvPick" data-k="cu" data-id="${esc(c.id)}"><span class="c6a cul" style="--h:${cuHue(c)}">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${esc([c.grp||'مشتری',B.R?fmt(Math.abs(B.R))+' '+ourLab(B.R):''].filter(Boolean).join(' · '))}</small></span></button>`};
  const br=s=>{const bk=acBank(s);return `<button type="button" class="c6r hvr" data-act="hvPick" data-k="bk" data-id="${esc(s.id)}"><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):esc(userInit(s.name))}</span><span class="tx"><b>${esc(s.name)}</b><small>${out?'انتقال به این حساب':'انتقال از این حساب'} · ${esc(bkSub(s))}</small></span></button>`};
  return (C.length?`<div class="hvgh">${q?'حساب‌ها':'حساب‌های اخیر'}</div><div class="c6l">${C.map(cr).join('')}</div>`:'')+(O.length?`<div class="hvgh">حساب‌های دیگر مغازه</div><div class="c6l">${O.map(br).join('')}</div>`:'')+(!C.length&&!O.length?`<div class="stmno"><b>حسابی با «${esc(HV.q)}» پیدا نشد</b><small>اول از صفحه حساب‌ها حساب را بسازید</small></div>`:'')}
function hvHTML(){const out=HV.dir==='out',s=hvSrc(),A=hvAccs();
  return `<div class="sh-h"><div><b>حواله</b><small class="shsub">سند ${toFa(invNext())} · ${esc(dates(todayISO()).fa)}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="hvseg"><button type="button" class="${out?'on':''}" data-act="hvDir" data-d="out">${ic('share')} پرداخت از حساب ما</button><button type="button" class="${out?'':'on'}" data-act="hvDir" data-d="in">${ic('down')} دریافت به حساب ما</button></div>
  <div class="hvgh">${out?'از حساب':'به حساب'}</div>
  <div class="hvacs">${A.map(z=>{const bk=acBank(z),f=acFin(z);return `<button type="button" class="hvac${String(z.id)===String(HV.sid)?' on':''}" data-act="hvAcc" data-id="${esc(z.id)}"><span class="hvl">${bk?bankBadge(bk):esc(userInit(z.name))}</span><span class="tx"><b>${esc(z.name)}</b><small>${f==null?'موجودی ثبت نشده':(f<0?'−':'')+fmt(Math.abs(f))}</small></span></button>`}).join('')}</div>
  <div class="hvgh">${out?'به':'از'}</div>
  ${HV.to?hvToH():`<div class="fsearch hvs">${ic('search')}<input id="hvq" type="search" placeholder="نام مشتری، هزینه یا حساب دیگر ما…" value="${esc(HV.q)}" autocomplete="off" enterkeyhint="search"></div><div id="hvres">${hvRes()}</div>`}
  ${HV.to?`<div class="px8a"><small>مبلغ حواله</small><label class="px8i"><input id="hvA" class="ltr" inputmode="numeric" autocomplete="off" enterkeyhint="done" aria-label="مبلغ" value="${HV.a?Number(HV.a).toLocaleString('en-US'):''}"><i>تومان</i></label><div class="px8l" id="hvL">${hvLive()}</div></div>
  <div class="ef"><label for="hvN">شرح <i>(اختیاری)</i></label><input id="hvN" autocomplete="off" value="${esc(HV.n)}" placeholder="مثلاً شماره پیگیری"></div>`:''}
  <button class="xgo" data-act="hvSave">${ic('check')} ثبت حواله</button>`}
function hvLive(){const s=hvSrc(),f=s&&acFin(s);if(!HV.a||f==null)return '';const n=f+(HV.dir==='out'?-1:1)*HV.a;return `مانده «${esc(s.name)}» بعد از حواله <b class="${n<0?'n':''}">${n<0?'−':''}${fmt(Math.abs(n))}</b> تومان`}
function hvRead(){const a=$('hvA'),n=$('hvN'),q=$('hvq');if(a)HV.a=num(a.value);if(n)HV.n=clean(n.value||'');if(q)HV.q=q.value}
function hvRe(){hvRead();sheetKeep(hvHTML());hvBind()}
function hvBind(){const q=$('hvq'),a=$('hvA'),n=$('hvN');
  if(q)q.oninput=()=>{HV.q=q.value;const r=$('hvres');if(r)r.innerHTML=hvRes()};
  if(q)q.onkeydown=e=>{if(e.key!=='Enter')return;e.preventDefault();const B=document.querySelectorAll('#hvres .hvr');if(B.length===1)B[0].click();else q.blur()};
  if(a){a.oninput=()=>{const v=num(a.value);a.value=v?v.toLocaleString('en-US'):'';HV.a=v;const l=$('hvL');if(l)l.innerHTML=hvLive()};a.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(n)n.focus()}}}
  if(n)n.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();n.blur()}}}
ACT.hvDir=d=>{if(!HV)return;HV.dir=d.d==='in'?'in':'out';hvRe()};
ACT.hvAcc=d=>{if(!HV)return;HV.sid=String(d.id);if(HV.to&&HV.to.k==='bk'&&String(HV.to.id)===HV.sid)HV.to=null;hvRe()};
ACT.hvPick=d=>{if(!HV)return;HV.to={k:d.k==='bk'?'bk':'cu',id:d.id};hvRe();const a=$('hvA');if(a)setTimeout(()=>a.focus(),30)};
ACT.hvToX=()=>{if(!HV)return;HV.to=null;hvRe();const q=$('hvq');if(q)q.focus()};
ACT.hvSave=()=>{if(!HV)return;hvRead();const s=hvSrc();if(!s){toast('حساب ما را انتخاب کنید',true);return}
  if(!HV.to){toast('طرف حواله را انتخاب کنید',true);const q=$('hvq');if(q)q.focus();return}
  const a=+HV.a||0;if(!a){toast('مبلغ حواله را بنویسید',true);const i=$('hvA');if(i)i.focus();return}
  const out=HV.dir==='out',now=new Date().toISOString(),by=who(),td=todayISO(),no=invNext(),n=HV.n;let msg='';
  if(HV.to.k==='bk'){const t=sources.find(z=>String(z.id)===String(HV.to.id));if(!t||String(t.id)===String(s.id)){toast('حساب دیگری انتخاب کنید',true);return}
    const A=out?s:t,B=out?t:s,x={id:nid++,type:'out',k:'out',amount:a,note:['انتقال به «'+B.name+'»',n].filter(Boolean).join(' · '),cuId:'',date:td,at:now,by,no},y={id:nid++,type:'in',k:'in',amount:a,note:['انتقال از «'+A.name+'»',n].filter(Boolean).join(' · '),cuId:'',date:td,at:now,by,no};
    x.xs=B.id;x.xl=y.id;y.xs=A.id;y.xl=x.id;(A.led=A.led||[]).push(x);(B.led=B.led||[]).push(y);A.updatedAt=B.updatedAt=now;saveS();msg=A.name+' → '+B.name}
  else{const c=CU().find(z=>String(z.id)===String(HV.to.id));if(!c){toast('حساب پیدا نشد',true);return}
    (s.led=s.led||[]).push({id:nid++,type:out?'out':'in',k:out?'out':'in',amount:a,note:n,cuId:c.id,date:td,at:now,by,no});s.updatedAt=now;saveS();bdMirror(s,no);msg=out?s.name+' → '+cuName(c):cuName(c)+' → '+s.name}
  try{LS.setItem('m_hv_src',String(s.id))}catch(_){}
  logA('src','حواله '+toFa(no),msg+' | '+fmt(a)+' تومان'+(n?' | '+n:''));HV=null;closeSheet();render();
  toast('حواله '+toFa(no)+' ثبت شد · '+fmt(a)+' تومان')};

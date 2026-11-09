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
/* انتقال بین دو حساب ما (v82.8: از خود سند بانکی، طرف حساب 'b'+شناسه): ردیف مقابل در حساب دیگر ساخته می‌شود و با این ردیف
   هم‌مبلغ/هم‌تاریخ/حذف می‌ماند. ردیف‌های قدیمی پنجره حواله (cuId خالی + xs) همان‌طور کار می‌کنند. */
function bdXfer(s,no){const now=new Date().toISOString(),by=who();let ch=0;
  for(const z of s.led||[]){if(z.no==null||String(z.no)!==String(no))continue;const ot=z.xs!=null?sources.find(q=>String(q.id)===String(z.xs)):null,oy=ot&&(ot.led||[]).find(q=>String(q.id)===String(z.xl));
    const tid=bdIsB(z.cuId)?String(z.cuId).slice(1):(z.cuId==null||z.cuId==='')&&z.xs!=null?String(z.xs):null,want=!z.del&&tid?sources.find(q=>String(q.id)===tid):null;
    if(oy&&(!want||String(ot.id)!==String(want.id))){if(!oy.del){oy.del=true;oy.delAt=now;oy.delBy=by;ot.updatedAt=now;ch=1}if(!want){if(!z.del){delete z.xs;delete z.xl;ch=1}continue}}
    if(!want)continue;const ty=z.type==='out'?'in':'out';
    if(oy&&String(ot.id)===String(want.id)){if(+oy.amount!==+z.amount||oy.date!==z.date||oy.del||oy.type!==ty){oy.amount=+z.amount;oy.date=z.date;oy.del=false;oy.type=ty;oy.k=ty;oy.edAt=now;oy.edBy=by;ot.updatedAt=now;ch=1}continue}
    const y={id:nid++,type:ty,k:ty,amount:+z.amount,note:z.note||'',cuId:'b'+s.id,date:z.date,at:z.at||now,by,no,xs:s.id,xl:z.id};(want.led=want.led||[]).push(y);z.xs=want.id;z.xl=y.id;want.updatedAt=now;ch=1}
  if(ch)saveS()}
/* ----- فهرست حساب‌ها ----- */
function bkTotHTML(L,S){const K=L.filter(s=>S.get(s.id).known),tot=K.reduce((a,s)=>a+S.get(s.id).fin,0),way=L.reduce((a,s)=>a+acPosPend(s),0),miss=L.length-K.length;if(!L.length)return '';
  return `<div class="bktot${bxWas?'':' anim'}"><span class="bktl"><small>جمع موجودی حساب‌ها</small>${miss?`<em>${toFa(miss)} حساب ثبت نشده</em>`:way?`<em>با کارتخوان در راه ${fmt(way)}</em>`:''}</span><b class="${tot<0?'n':''}">${K.length?`<span class="cbn" data-k="r" data-v="${Math.abs(Math.round(tot))}">${tot<0?'−':''}${fmt(Math.abs(Math.round(tot)))}</span><i>تومان</i>`:'—'}</b></div>`}
function bkRowH(s,m,ri){const bk=acBank(s),way=acPosPend(s),sub=[s.cash?'':bk&&!canon(s.name).includes(canon(bk))?'بانک '+bk:'',s.iban?'شبا …'+toFa(String(s.iban).slice(-4)):s.card?'کارت …'+toFa(String(s.card).slice(-4)):'',way?'کارتخوان در راه '+fmt(way):''].filter(Boolean).join(' · ');
  const v=m.known?`<b><span class="cbn" data-k="r" data-v="${Math.abs(Math.round(m.fin))}">${m.fin<0?'−':''}${fmt(Math.abs(Math.round(m.fin)))}</span></b><small>تومان</small>`:'<b>ثبت نشده</b><small>موجودی را بزنید</small>';
  const r=can('src')?[['bdNew','سند','plus','#2f6fe0'],['acEdit','ویرایش','edit','#8a8f98']]:[];
  return swW(`<button class="c6r bxrow bkr" data-act="acOpen" data-id="${s.id}" style="--r:${Math.min(ri,8)}"><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):s.cash?ic('cash'):esc(userInit(s.name))}</span><span class="tx"><b>${esc(s.name)}</b><small>${esc(sub)}</small></span><span class="bkv${m.known?(m.fin<0?' n':''):' z'}">${v}</span></button>`,{r,l:[],data:{id:s.id}})}
/* ----- v82.8 (خواسته صاحب اپ: «مبلغ کل حواله، مبلغ کارتخوان، مبلغ کل برداشتی‌های روز؛ کارتخوان‌ها وصل به حساب و در فهرست هر بانک؛ ورود دستی کارتخوان») ----- */
/* سه کادر امروز (هم‌اندازه): حواله‌ها، کارتخوان، برداشت‌ها — زدن = فقط همان ردیف‌ها در گردش حساب (acF)، زدن دوباره = همه */
function bkDayHTML(s,R){const td=todayISO(),T=R.filter(r=>!r.res&&!r.old&&r.f!=='mark'&&(r.d||'')===td),sm=f=>T.filter(r=>r.f===f).reduce((a,r)=>a+(+r.a||0),0),nn=f=>T.filter(r=>r.f===f).length;
  const t=(f,lab,ico,v,cls)=>`<button type="button" class="bkd ${cls}${acV.f===f?' on':''}" data-act="acF" data-f="${f}" aria-pressed="${acV.f===f}"><span class="bkdh"><b>${lab}</b><em>${toFa(nn(f))}</em></span><span class="bkdv"><b>${v?(v<0?'−':'+')+fmt(Math.abs(v)):'۰'}</b><i>تومان</i></span></button>`;
  return `<div class="bkdw"><div class="bkdt"><b>امروز</b><small>${esc(dates(td).fa)} · زدن = فقط همان ردیف‌ها</small></div><div class="bkd3">${t('hv','حواله‌ها','swap',sm('hv'),'h')}${t('pos','کارتخوان','card',sm('pos'),'p')}${t('out','برداشت‌ها','share',sm('out'),'o')}</div></div>`}
/* کارتخوان‌های وصل به این حساب: هر کدام مبلغ در راهش؛ «ورود دستی» = نشستن پول کارتخوان در همین حساب (ردیف pos) */
function bkPosCard(s){const P=acPOS(s),c=can('src'),k=s.bal!=null;
  const btn=c&&k?`<button type="button" class="bkpb" data-act="acLedNew" data-id="${s.id}" data-t="pos">${ic('plus')}ورود دستی کارتخوان</button>`:'';
  if(!P.length)return `<div class="bkpc e"><div class="bkph"><b>کارتخوان‌ها</b>${btn}</div><button type="button" class="bkpr" data-act="${c&&CH('pos').length?'acLink':'chOpenAll'}" data-id="${s.id}"><span class="bkdi">${ic('card')}</span><span class="tx"><b>کارتخوانی به این حساب وصل نیست</b><small>${CH('pos').length?'بزنید و کارتخوانی که پولش اینجا می‌نشیند را وصل کنید':'اول کارتخوان را تعریف کنید'}</small></span></button></div>`;
  return `<div class="bkpc"><div class="bkph"><b>کارتخوان‌های این حساب</b>${btn}</div>${P.map(ch=>{const w=Math.max(0,chBal(ch));return `<button type="button" class="bkpr" data-act="chOpen" data-id="${ch.id}"><span class="bkdi">${ic('card')}</span><span class="tx"><b>${esc(ch.name)}</b><small>${w?'فردا به حساب می‌نشیند':'همه به حساب نشسته'}</small></span><span class="bkpv${w?'':' z'}"><b>${fmt(w)}</b><i>در راه</i></span></button>`}).join('')}${c?`<button type="button" class="bkpl" data-act="acLink" data-id="${s.id}">${ic('edit')}کارتخوان‌های وصل</button>`:''}</div>`}
/* ===== v82.9 (خواسته صاحب اپ: «یک حساب کارتخوان که کارتخوان‌های مختلف درونش باشد؛ حساب کارتخوان که مانده‌ها شب به حساب‌ها اضافه می‌شود مرتب‌تر») =====
   صفحه کامل posa (از فهرست بانک‌ها، ردیف «کارتخوان‌ها»): کارت مانده (در راه · امروز کشیده شد)، کارتخوان‌ها مثل ردیف‌های فهرست حساب‌ها
   (زدن = گردش همان کارتخوان chOpen، کشیدن = وصل به حساب)، و «نشستن در حساب‌ها»: هر شب کدام کارتخوان چقدر به کدام حساب نشست (tout)، روز به روز. */
function posWay(){return CH('pos').reduce((a,c)=>a+Math.max(0,chBal(c)),0)}
function bkPosRowH(){const P=CH('pos');if(!P.length&&!can('src'))return '';const w=posWay();
  return `<div class="c6l c6lb cuL bkl bkpl0">${swW(`<button class="c6r bxrow bkr" data-act="go" data-n="posa"><span class="c6a bxlogo bkpi">${ic('card')}</span><span class="tx"><b>کارتخوان‌ها</b><small>${P.length?toFa(P.length)+' کارتخوان · '+(w?'فردا به حساب‌ها می‌نشیند':'همه نشسته'):'هنوز کارتخوانی تعریف نشده'}</small></span><span class="bkv${w?'':' z'}"><b>${w?fmt(w):'۰'}</b><small>در راه</small></span></button>`,{r:[],l:[],data:{}})}</div>`}
function vPosA(){const P=CH('pos'),td=todayISO(),c=can('src');let tdy=0;P.forEach(ch=>chMoves(ch).forEach(m=>{if(m.d===td&&!m.own&&m.a>0)tdy+=m.a}));const w=posWay();
  const card=`<div class="c6l c6lb cub9 anim"><span class="cub9h"><b>مانده کارتخوان‌ها</b></span><span class="c6v c6vb">${bxTile('در راه · فردا می‌نشیند',w,'c',0)}${bxTile('امروز کشیده شد',tdy,'c',1)}</span></div>`;
  const rows=P.map((ch,ri)=>{const v=Math.max(0,chBal(ch)),z=chSrc(ch);return swW(`<button class="c6r bxrow bkr" data-act="chOpen" data-id="${ch.id}" style="--r:${Math.min(ri,8)}"><span class="c6a bxlogo bkpi">${ic('card')}</span><span class="tx"><b>${esc(ch.name)}</b><small>${z?'به «'+esc(z.name)+'» می‌نشیند':'<span class="bkpn">به حسابی وصل نیست · بکشید</span>'}</small></span><span class="bkv${v?'':' z'}"><b>${v?fmt(v):'۰'}</b><small>در راه</small></span></button>`,{r:c?[['chLinkPick','حساب','bank','#2f6fe0']]:[],l:[],data:{id:ch.id}})}).join('');
  /* نشستن در حساب‌ها، روز به روز */
  const D={};P.forEach(ch=>(ch.txs||[]).forEach(t=>{if(t.del||t.type!=='tout')return;const s=t.srcId!=null&&sources.find(z=>String(z.id)===String(t.srcId));const k=t.date||String(t.at||'').slice(0,10);(D[k]=D[k]||[]).push({ch,s,t})}));
  const days=Object.keys(D).sort().reverse().slice(0,30);
  const st=days.map(k=>{const L=D[k],sum=L.reduce((a,o)=>a+(+o.t.amount||0),0),r=relDay(k);return `<div class="fday pnd"><span>${['امروز','دیروز'].includes(r)?r+'، ':''}${esc(dates(k).fa)}</span><b>${fmt(sum)} <i>تومان</i></b></div><div class="c6l c6lb pnl">${L.map(o=>`<div class="pnr2"><span class="bkdi">${ic('card')}</span><span class="tx"><b>${esc(o.ch.name)} ← ${esc(o.s?o.s.name:'حساب')}</b><small>${o.t.auto?'<em class="autg">خودکار</em> نیمه‌شب':'دستی · '+esc(o.t.by||'')}</small></span><b class="pnv">${fmt(+o.t.amount||0)}</b></div>`).join('')}</div>`}).join('');
  return `${card}
  <div class="spsec stmh"><div><b>کارتخوان‌ها</b><small>${P.length?'زدن = گردش هر کارتخوان · کشیدن = حسابی که پولش می‌نشیند':'کارتخوان تازه را پایین اضافه کنید'}</small></div></div>
  <div class="cuLs"><div class="c6l c6lb cuL bkl">${rows}</div></div>
  ${c?`<div class="fsearch sm chadd" style="margin-top:12px">${ic('plus')}<input id="chN" placeholder="نام کارتخوان تازه" autocomplete="off" enterkeyhint="done"><button class="lnk" data-act="chAdd" data-k="pos">افزودن</button></div>`:''}
  <div class="spsec stmh"><div><b>نشستن در حساب‌ها</b><small>${days.length?'هر شب کدام کارتخوان چقدر به کدام حساب نشست':'هنوز چیزی به حساب‌ها ننشسته'}</small></div></div>
  ${st}`}

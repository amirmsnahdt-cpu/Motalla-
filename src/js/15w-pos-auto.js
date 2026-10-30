/* ============ v66.8 (خواسته صاحب اپ): کارتخوان خودش به حساب می‌نشیند ============
   «به محض اینکه کارتخوان می‌خوابد، در انتظار باید تأیید شود و سندش بخورد»: پول کارت‌های روزهای قبل (تا دیروز) هر کارتخوانی که
   به یک حساب وصل است، بعد از نیمه‌شب خودکار به همان حساب واریز می‌شود — با همان سندی که «واریز به حساب» دستی می‌سازد
   (tout روی کارتخوان + ردیف pos روی حساب، به هم وصل با chTx/ledId)، پس مانده کارتخوان و مانده حساب هر دو درست می‌شوند.
   مبلغ = آنچه از روزهای قبل واریز نشده (مانده کارتخوان منهای کارت‌های امروز)؛ واریزهای دستی قبلی کم می‌شوند و دوبار حساب نمی‌شود.
   برای هر روز فروش یک سند خودکار (کلید auto = تاریخ فروش): اگر سند آن روز بعداً اصلاح شود، همان سند خودکار به‌روز می‌شود.
   اگر دو گوشی هم‌زمان سند خودکار بسازند، بعد از همگام‌سازی تکراری حذف (del) می‌شود. کارتخوان وصل‌نشده همان «در راه» می‌ماند. */
let posAutoBusy=0;
/* لحظه نشستن پول کارت‌های یک روز = نیمه‌شب آغاز روز بعد (به وقت گوشی). اگر «اصلاح حساب» بعد از این لحظه ثبت شده باشد،
   این پول در همان موجودی واقعی بانک هست و acLed آن را دوباره جمع نمی‌زند (at قبل از balAt) — دوبار حساب نمی‌شود. */
const posSetAt=d=>{const t=new Date(d+'T00:00:00');t.setDate(t.getDate()+1);return t.toISOString()};
function posAuto(){if(posAutoBusy||!TOKEN||(typeof can==='function'&&!can('src')))return;posAutoBusy=1;try{
  const t=todayISO(),now=ns();let chC=0,chS=0;
  for(const c of CH('pos')){const s=chSrc(c);if(!s)continue;
    /* تکراری‌ها (دو گوشی هم‌زمان): کوچک‌ترین id می‌ماند */
    const A=(c.txs||[]).filter(x=>!x.del&&x.auto&&x.type==='tout').sort((a,b)=>a.id-b.id),seen=new Map();
    A.forEach(x=>{const k=x.auto+'|'+x.srcId;if(!seen.has(k)){seen.set(k,x);return}x.del=true;x.delAt=now;chC=1;
      const S=sources.find(z=>String(z.id)===String(x.srcId)),L=S&&(S.led||[]).find(z=>String(z.id)===String(x.ledId));if(L&&!L.del){L.del=true;S.updatedAt=now;chS=1}});
    /* کارت‌های هر روز قبل از امروز؛ واریزهای دستی (غیرخودکار) از قدیمی‌ترین روز کم می‌شوند؛ سند خودکار هر روز = باقی همان روز */
    const day={};let man=0;
    chMoves(c).forEach(m=>{if(m.own){const x=(c.txs||[]).find(z=>z.id===m.own);if(x&&!x.auto)man-=m.a;return}if(String(m.d||'')<t)day[m.d]=(day[m.d]||0)+m.a});
    Object.keys(day).sort().forEach(d=>{let need=Math.round(day[d]);const use=Math.min(Math.max(0,man),Math.max(0,need));man-=use;need-=use;
      let T=(c.txs||[]).find(x=>!x.del&&x.type==='tout'&&x.auto===d),L=T&&(T.srcId!=null?sources.find(z=>String(z.id)===String(T.srcId)):null),LR=L&&(L.led||[]).find(z=>String(z.id)===String(T.ledId)&&!z.del);
      if(T){if(Math.round(+T.amount||0)===need)return;if(need<=0){T.del=true;T.delAt=now;if(LR){LR.del=true;L.updatedAt=now;chS=1}}else{T.amount=need;if(LR){LR.amount=need;L.updatedAt=now;chS=1}}chC=1;return}
      if(need<=0)return;const at=posSetAt(d);
      T={id:nid++,type:'tout',amount:need,srcId:s.id,date:t,at,by:'خودکار',auto:d};
      const R={id:nid++,type:'pos',amount:need,note:'کارتخوان «'+c.name+'» · فروش '+dates(d).fa,chId:c.id,chTx:T.id,auto:d,date:t,at,by:'خودکار'};T.ledId=R.id;
      (c.txs=c.txs||[]).push(T);(s.led=s.led||[]).push(R);s.updatedAt=now;chC=chS=1;
      try{logA('src','تسویه خودکار کارتخوان',c.name+' ← '+s.name+' | '+dates(d).fa+' | '+fmt(need)+' تومان')}catch(e){}})}
  if(chC)saveCu();if(chS)saveS()}catch(e){console.warn('posAuto',e)}finally{posAutoBusy=0}}

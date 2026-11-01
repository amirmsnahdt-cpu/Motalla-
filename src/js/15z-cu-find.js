/* ---- v67.6 (خواسته صاحب اپ): جستجوی حساب مشتریان مثل جستجوی واریزی‌ها ----
   تقویم داخل جستجو (روزهای نقطه‌دار سند دارند)، برچسب تاریخ زیر جستجو، و جستجو در همه ردیف‌های گردش حساب همه مشتری‌ها:
   مبلغ، وزن، شرح، شماره فاکتور، پیگیری، نام کالا، نوع سند؛ نوشتن تاریخ («۱۰ آبان»، «دیروز»، 1405/08/10) = همان روز.
   نتیجه‌ها به تفکیک روز با سرتیتر چسبان؛ زدن ردیف = باز شدن همان سند. */
let cuDt='',cuN=60;
/* «11.16» در حساب مشتری یعنی وزن، نه تاریخ؛ تاریخ با / یا - یا نام ماه («۱۰ آبان») */
const cuQDate=q=>/^\s*\d{1,2}\.\d{1,3}\s*$/.test(toEn(String(q||'')))?'':qDate(q);
const CUTX_NUM=/^(amount|total|sub|disc|w|weight|am|q|ppg|no|tn|rate|mz|card|iban)$/;
const CUTX_SKIP=/^(id|at|at0|by|date|type|dk|entId|stlId|peer|txId|cu|cuId|img|imgs|edOf|auto|src|pid|bid|sid|m|dir|xfId|del|draft)$/;
const cuTxTitle=t=>t.type==='inv'?invTitle(t):t.type==='xf'?(t.inv?'پرداخت فاکتور مشتری دیگر':'انتقال مانده'):t.type==='cv'?'تبدیل '+(t.dir==='g2r'?'طلایی به ریالی':'ریالی به طلایی'):((TXT[t.type]||{}).t||'سند');
/* متن‌ها (برای جستجوی کلمه) و عددها (هر فیلد جدا، تا رقم‌های دو فیلد به هم نچسبند) */
function cuTxHay(t){const S=[cuTxTitle(t)],N=[];
  const walk=(o,k,d)=>{if(o==null||d>4)return;if(Array.isArray(o)){for(const x of o)walk(x,k,d+1);return}
    if(typeof o==='object'){for(const j in o)if(!CUTX_SKIP.test(j))walk(o[j],j,d+1);return}
    if(typeof o==='string'){S.push(o);N.push(o)}else if(typeof o==='number'&&CUTX_NUM.test(k))N.push(String(o))};
  walk(t,'',0);return {s:nzName(S.join(' ')),n:N}}
const cuTxHit=(t,q,dOk)=>{const h=cuTxHay(t);return (q.length>=2&&h.s.includes(q))||h.n.some(dOk)};
function cuTxHits(dq,q,dOk){if(!dq&&!q)return [];const R=[];
  for(const c of CU())for(const t of c.txs||[]){if(t.del||t.draft||!t.date)continue;if(dq&&t.date!==dq)continue;
    if(q&&!(cuTxHit(t,q,dOk)||(dq&&cuHit(c,q,dOk))))continue;R.push([c,t])}
  return R.sort((a,b)=>String(b[1].date+'|'+(b[1].at||'')).localeCompare(String(a[1].date+'|'+(a[1].at||''))))}
function cuTxRow(c,t){const d=txD(t),ks=[d.r?['r',d.r]:null,d.g?['g',d.g]:null,...Object.keys(d.x||{}).filter(k=>+d.x[k]).map(k=>[k,+d.x[k]])].filter(Boolean),[k,v]=ks[0]||['r',0];
  const ico=t.type==='inv'?'inv':t.type==='xf'?'swap':t.type==='cv'?'coin':((TXT[t.type]||{}).i||'plus');
  const sub=[cuName(c),t.type==='inv'?(t.items||[]).map(i=>i.k).filter(Boolean).join('، '):[t.kind,t.weight?wFmt(t.weight)+' گرم':''].filter(Boolean).join('، '),t.note].filter(Boolean).join(' · ');
  return `<button class="c6r" data-act="cuTxGo" data-cu="${c.id}" data-tx="${t.id}"><span class="c6a iv">${ic(ico)}</span><span class="tx"><b>${esc(cuTxTitle(t))}</b><small>${esc(sub)}</small></span><span class="c6ivv${v<0?' d':v>0?' c':''}"><b>${v?balV(k,v):'تسویه'}</b><small>${v?esc(balU(k))+(ks.length>1?' +'+toFa(ks.length-1):''):''}</small></span></button>`}
/* به تفکیک روز، مثل نتیجه‌های جستجوی واریزی‌ها */
function cuTxHTML(TX){if(!TX.length)return '';const L=TX.slice(0,cuN),cnt={};TX.forEach(([,t])=>cnt[t.date]=(cnt[t.date]||0)+1);let h='',last=null;
  for(const [c,t] of L){if(t.date!==last){if(last!==null)h+='</div>';last=t.date;const r=relDay(last);h+=`<div class="fday sticky hit cutxd"><span>${['امروز','دیروز','فردا'].includes(r)?r+'، ':''}${esc(dates(last).wd+' '+dates(last).fa)}</span><small>${fmt(cnt[last])} ردیف</small></div><div class="c6l c6tx">`}h+=cuTxRow(c,t)}
  if(last!==null)h+='</div>';
  return `${cuDt||cuQDate(cuQ)?'':`<div class="c6gh">در گردش حساب‌ها · ${fmt(TX.length)} ردیف</div>`}${h}${TX.length>cuN?`<button class="btn sec cutxm" data-act="cuTxMore">نمایش بیشتر (${fmt(TX.length-cuN)} ردیف دیگر)</button>`:''}`}
const cuDtChip=qd=>cuDt?`<div class="fdate">${ic('cal')} ${esc(relDay(cuDt))}، ${esc(dates(cuDt).fa)}<button data-act="cuDtClr" aria-label="حذف">×</button></div>`:qd?`<div class="fdate">${ic('cal')} سندهای ${esc(dates(qd).fa)}</div>`:'';
const cuReList=()=>{const r=$('cures');if(r)srchSwap(r,cuListHTML())};
ACT.cuCal=()=>{const M=new Set();for(const c of CU())for(const t of c.txs||[])if(!t.del&&!t.draft&&t.date)M.add(t.date);
  openCal(cuDt||todayISO(),iso=>{cuDt=iso;cuN=60;render();$('view').scrollTop=0},{title:'جستجوی تاریخ',sub:'روزهای نقطه‌دار سند دارند',q:[[-2,'پریروز'],[-1,'دیروز'],[0,'امروز']],marks:M})};
ACT.cuDtClr=()=>{cuDt='';cuN=60;render()};
ACT.cuTxMore=()=>{cuN+=100;cuReList()};
ACT.cuTxGo=d=>{const c=custs.find(x=>String(x.id)===String(d.cu));if(!c)return;custId=c.id;const back=cur;ACT.txOpen({id:d.tx});if(cur==='inv'&&back==='custs')PARENT.inv='custs'};

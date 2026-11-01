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
/* v67.7/v68 (خواسته صاحب اپ): تسویه از روی مانده حساب — زدن کاشی مانده = پنجره تسویه (مثل پنجره تسویه واریزی):
   مقدار پیش‌فرض کل مانده (قابل تغییر، «کل مانده» / «نصف»)، برای مبلغ روش (حواله، کارتخوان، نقد، تخفیف)؛
   انتخاب روش = سند تازه همین مشتری با همان ردیف و همان مقدار، تا جزئیات (بانک، پیگیری…) و «ثبت سند» */
let CBS=null;
const CBS_M=['cust','hav','pos','cash','off'];
function cbsHTML(){const z=CBS,c=curCu();if(!z||!c)return '';const r=z.k==='r',g=z.k==='g',a=z.a,tot=Math.abs(z.v),u=balU(z.k),inn=z.v<0,dir=inn?'in':'out';
  const fv=v=>r?fmt(v):g?wFmt(v):qFmt(v),chip=(v,t)=>v>0?`<button type="button" class="${Math.abs(a-v)<1e-9?'on':''}" data-act="cbsAmt" data-v="${v}">${t} · ${fv(v)}</button>`:'';
  const half=r?Math.round(tot/2):g?Math.round(tot/2*1000)/1000:Math.floor(tot/2);
  const M=r?(DKS[dir]||[]).filter(x=>CBS_M.includes(x[0])):[];
  return `<div class="px7w px8 cbs"><div class="sh-h"><div><b>تسویه ${q8K(z.k)}</b><small class="shsub">${esc(cuName(c))} · ${inn?'طلب ما':'بدهی ما'} ${fv(tot)} ${esc(u)}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="px8a"><small>${inn?(r?'مبلغ دریافتی':'دریافت از مشتری'):(r?'مبلغ پرداختی':'تحویل به مشتری')}</small><label class="px8i"><input id="cbsA" class="ltr" inputmode="${r?'numeric':'decimal'}" autocomplete="off" enterkeyhint="done" aria-label="مقدار" value="${a?(r?a.toLocaleString('en-US'):String(a)):''}"><i>${esc(u)}</i></label>
    <div class="px7qa px8q">${chip(tot,'کل مانده')}${half&&half!==tot?chip(half,'نصف'):''}</div><div class="px8l" id="cbsL"></div></div>
  ${r?`<div class="cbsm">${M.map(([k,t,i])=>`<button type="button" data-act="cbsGo" data-m="${k}">${ic(i)}<span>${esc(t)}</span></button>`).join('')}</div>`
    :`<button class="xgo" data-act="cbsGo">${ic('check')} ادامه در سند جدید</button>`}</div>`}
const cbsRead=()=>{const e=$('cbsA');if(!e||!CBS)return;CBS.a=CBS.k==='r'?num(e.value):Math.abs(+toEn(e.value).replace(/[^\d.]/g,'')||0)};
function cbsLive(){const z=CBS,el=$('cbsL');if(!z||!el)return;const tot=Math.abs(z.v),left=Math.round((tot-z.a)*1000)/1000,f=v=>z.k==='r'?fmt(v):z.k==='g'?wFmt(v):qFmt(v);
  el.innerHTML=!z.a?'':left===0?`<b class="ok">${ic('check')} حساب تسویه می‌شود</b>`:left>0?`مانده بعد: <b>${f(left)}</b> ${esc(balU(z.k))}`:`<b class="r">${f(-left)} ${esc(balU(z.k))} بیشتر از مانده</b>`;
  document.querySelectorAll('#sheet .cbs .px8q button').forEach(b=>b.classList.toggle('on',Math.abs(+b.dataset.v-z.a)<1e-9))}
function cbsBind(){const e=$('cbsA');if(!e)return;e.oninput=()=>{if(CBS.k==='r'){const v=num(e.value);e.value=v?v.toLocaleString('en-US'):''}cbsRead();cbsLive()};cbsLive()}
ACT.cuStl=d=>{const c=curCu(),v=+d.v||0;if(!c||!v||!can('debt'))return;CBS={k:d.k,v,a:Math.abs(v)};sheet(cbsHTML());cbsBind()};
ACT.cbsAmt=d=>{if(!CBS)return;CBS.a=+d.v;const e=$('cbsA');if(e)e.value=CBS.k==='r'?CBS.a.toLocaleString('en-US'):String(CBS.a);cbsLive()};
ACT.cbsGo=d=>{cbsRead();const z=CBS,c=curCu();if(!z||!c)return;if(!(z.a>0)){toast('مقدار را بنویسید',true);const e=$('cbsA');if(e)e.focus();return}
  const dir=z.v<0?'in':'out',a=z.a;CBS=null;closeSheet();ACT.svNew({cu:c.id,fresh:1});if(cur!=='sell'||!sv)return;
  if(z.k==='r'){sv.qa.d=dir;ACT.dkF({id:'m:'+d.m});const p=sv.qa.p;if(p){p.amount=a;svKeep();qaRe()}}
  else{sv.qa={...qaBlank(),x:xrNew(dir,z.k==='g'?'gold':z.k,z.k==='g'?{w:String(Math.round(a*1000)/1000)}:{q:String(a)})};svKeep();qaRe()}};

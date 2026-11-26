/* ---------- v108.8 بررسی خودکار رسید واریز بانکی ----------
   خواسته صاحب اپ: «عکس رسید که آپلود می‌شود عکس را بررسی کند؛ مبلغ تومانی سیستم را با یک صفر اضافه (ریال) چک کند؛ اگر درست بود اعلام کند،
   عکس را اتچ کند و تأیید واریزی را بزند؛ اگر درست نبود اخطار بدهد؛ اگر ناخوانا بود تأیید را به کاربر بسپارد؛ واریزی‌های چندتایی هم ساز و کار خودش».
   همه چیز روی خود گوشی (همان موتور خواندن رسید 15zv/15zz-zzs2). عکس همیشه پیوست می‌شود (مثل قبل)؛ فقط وضعیت «واریز شد» خودکار است.
   روش: «تأیید» است نه «حدس» — مبلغ واریزی را می‌دانیم، پس در متن رسید دنبال همان عدد (ریال = تومان×۱۰، یا خود تومان) و همان شبا می‌گردیم.
   چرخش: عکس کاغذ رسید معمولاً کج/خوابیده گرفته می‌شود؛ جهت خط‌ها از روی تصویر حدس زده می‌شود (rcvAxis) و حداکثر سه جهت خوانده می‌شود.
   چندتایی:
   - یک رسید برای چند واریزی (مثلاً «شبای واریز اول/دوم» بانک سینا): واریزی‌های تأییدنشده همان لیست که شبایشان در رسید هست یک گروه‌اند؛
     جمعشان (یا مبلغ تک‌تکشان) روی رسید باشد = همه با همین عکس تأیید می‌شوند.
   - چند رسید برای یک واریزی (سقف حواله): مبلغ هر رسید ذخیره می‌شود (it.rv)؛ وقتی جمع رسیدها = مبلغ واریزی، تأیید می‌شود؛ تا آن وقت «مانده» را می‌گوید. */
let RCVB=0;const RCVQ=[];
const rcvEn=s=>String(s||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
/* همه عددهای رسید (با جداکننده ۳ رقمی یا بی‌جداکننده) */
function rcvNums(t){const s=rcvEn(t),N=new Set();(s.match(/\d{1,3}(?:[,٬.'’]\s?\d{3})+|\d{4,}/g)||[]).forEach(m=>{const v=m.replace(/\D/g,'');if(v.length>=4&&v.length<=14)N.add(+v)});return N}
const rcvDS=t=>rcvEn(t).replace(/\D/g,'');
/* شبا در متن: ۲۴ رقم پشت هم (خط تیره/فاصله حذف) با حداکثر ۲ رقم اشتباه خواندن */
function rcvIbHit(ib,DS){const d=rcvEn(ib).replace(/\D/g,'');if(d.length<20||DS.length<d.length)return 0;
  for(let i=0;i+d.length<=DS.length;i++){let m=0;for(let j=0;j<d.length&&m<3;j++)if(DS.charCodeAt(i+j)!==d.charCodeAt(j))m++;if(m<3)return 1}return 0}
const rcvIbOf=x=>{const e=entries.find(z=>String(z.id)===String(x.id));return (e&&e.iban)||x.iban||''};
const rcvR=v=>fmt(v*10)+' ریال';
/* جهت خط‌های متن: تغییر سطرهای تیره/روشن در جهت عمود بر خط‌ها زیاد است → اگر ستون‌ها پرتغییرتر باشند عکس خوابیده است */
function rcvAxis(im){try{const W=im.naturalWidth||im.width,H=im.naturalHeight||im.height,k=Math.min(1,360/Math.max(W,H)),w=Math.max(8,Math.round(W*k)),h=Math.max(8,Math.round(H*k)),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0,w,h);const D=g.getImageData(0,0,w,h).data;
  const L=new Float32Array(w*h);let mu=0;for(let i=0;i<w*h;i++){const v=D[i*4]*.3+D[i*4+1]*.59+D[i*4+2]*.11;L[i]=v;mu+=v}mu/=w*h;const R=new Float32Array(h),C=new Float32Array(w),th=mu-28;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(L[y*w+x]<th){R[y]++;C[x]++}const sv=(A,n)=>{let s=0;for(let i=1;i<A.length;i++)s+=Math.abs(A[i]-A[i-1]);return s/Math.max(1,n)};
  const r=sv(R,h)/w,cc=sv(C,w)/h;return cc>r*1.12?1:0}catch(e){return 0}}
function rcvRot(im,deg){const W=im.naturalWidth||im.width,H=im.naturalHeight||im.height,s=deg%180!==0,c=document.createElement('canvas');c.width=s?H:W;c.height=s?W:H;const g=c.getContext('2d');g.translate(c.width/2,c.height/2);g.rotate(deg*Math.PI/180);g.drawImage(im,-W/2,-H/2);return c.toDataURL('image/jpeg',.92)}
/* ارزیابی یک متن خوانده‌شده برای یک ردیف لیست */
function rcvEval(q,text,P){const it=q.it,A=+it.amount||0,N=rcvNums(text),DS=rcvDS(text),pa=+(P&&P.amount)||0,pc=(P&&P.conf&&P.conf.amount)||0;
  const has=v=>v>0&&(N.has(v*10)||N.has(v)||pa===v);const ib=rcvIbOf(it),ibHit=ib?rcvIbHit(ib,DS):0;
  const tI=P&&P.toIban&&typeof rcpIbanOk==='function'&&rcpIbanOk(P.toIban)?P.toIban:'',ibBad=!!(ib&&!ibHit&&tI&&rcvIbHit(tI,rcvDS(ib))===0);
  const G=q.b.closed?[]:q.b.items.map((x,j)=>({x,j})).filter(o=>o.j!==q.i&&o.x.st!=='ok'&&o.x.st!=='fail'&&rcvIbOf(o.x)&&rcvIbHit(rcvIbOf(o.x),DS));
  const S=A+G.reduce((s,o)=>s+(+o.x.amount||0),0);
  if(G.length&&(has(S)||(has(A)&&G.every(o=>has(+o.x.amount)))))return {t:'grp',a:S,G:G.map(o=>o.j),ib:ibHit,c:1};
  if(has(A))return {t:ibBad?'ibx':'ok',a:A,ib:ibHit,tI,c:1};
  const R=pc>=.6?pa:0;
  /* مبلغ رسید = این واریزی + چند واریزی تأییدنشده دیگر همین لیست و همین منبع (شبایشان ناخوانا) → یک گروه پیشنهادی؛ فقط وقتی یک جواب دارد */
  if(R>A&&!ibBad&&!q.b.closed){const O=q.b.items.map((x,j)=>({x,j})).filter(o=>o.j!==q.i&&o.x.st!=='ok'&&o.x.st!=='fail'&&o.x.src===it.src&&+o.x.amount>0).slice(0,14),need=R-A,F=[];
    const dfs=(i,left,pick)=>{if(F.length>1)return;if(left===0&&pick.length){F.push(pick.slice());return}if(i>=O.length||pick.length>=4||left<0)return;pick.push(O[i]);dfs(i+1,left-(+O[i].x.amount),pick);pick.pop();dfs(i+1,left,pick)};dfs(0,need,[]);
    if(F.length===1)return {t:'grq',a:R,G:F[0].map(o=>o.j),ib:ibHit,c:pc}}
  if(R>0)return {t:R<A&&!ibBad?'part':'bad',a:R,ib:ibHit,tI,c:pc};
  return {t:'unk',a:0,ib:ibHit,tI,c:0}}
const RCVP={ok:5,grp:5,ibx:4,grq:4,bad:3,part:3,unk:0};
/* یک عکس: حداکثر سه جهت، تا رسیدن به نتیجه قطعی */
async function rcvOne(u,ev,tick){let im;try{im=new Image();await new Promise((r,j)=>{im.onload=r;im.onerror=j;im.src=u})}catch(e){return {t:'unk',a:0,c:0}}
  const ax=rcvAxis(im),ord=ax?[270,90,0]:[0,270,90];let best={t:'unk',a:0,c:0};const W=await ocrWorker();
  for(let n=0;n<ord.length;n++){tick&&tick(n);const d=ord[n];let R;try{R=await rcpRead(d?rcvRot(im,d):u,W,{maxTries:n?1:2,budgetMs:20000})}catch(e){continue}
    const r=ev(R.text||'',R.parsed||{});r.deg=d;if(RCVP[r.t]>RCVP[best.t]||(RCVP[r.t]===RCVP[best.t]&&r.c>best.c))best=r;
    if(best.t==='ok'||best.t==='grp'||best.t==='ibx'||best.t==='grq'||(best.c>=.85&&RCVP[best.t]>=3))break}
  return best}
const rcvQ=eid=>{const e=entries.find(z=>String(z.id)===String(eid));return e?entBI(e):null};
/* شروع: بعد از افزودن عکس به رسید واریز بانکی (15b) */
function rcvRun(eid,keys,urls){if(!keys||!keys.length||!can('track'))return;if(RCVB){RCVQ.push([eid,keys,urls]);return}RCVB=1;rcvGo(eid,keys,urls).catch(e=>{rcvPill('');if(typeof toastBg==='function')toastBg('بررسی رسید انجام نشد',true)}).finally(()=>{RCVB=0;const n=RCVQ.shift();if(n)rcvRun(...n)})}
function rcvPill(s){let p=$('rcvp');if(!s){if(p)p.remove();return}if(!p){p=document.createElement('div');p.id='rcvp';p.setAttribute('role','status');document.body.appendChild(p)}p.innerHTML=`<i class="rcvsp"></i><span>${s}</span>`}
async function rcvGo(eid,keys,urls){const q0=rcvQ(eid);if(!q0)return;const nm=q0.it.name||'';const out=[];
  for(let i=0;i<keys.length;i++){const lab='بررسی رسید «'+esc(nm)+'»'+(keys.length>1?' · '+toFa(i+1)+' از '+toFa(keys.length):'');rcvPill(lab+'…');
    const r=await rcvOne(urls[i],(t,P)=>{const q=rcvQ(eid);return q?rcvEval(q,t,P):{t:'unk',a:0,c:0}},n=>rcvPill(lab+(n?' · چرخاندن عکس':'')+'…'));out.push({k:keys[i],u:urls[i],r})}
  rcvPill('');rcvDecide(eid,out)}
/* تصمیم: ثبت نتیجه هر عکس در it.rv، بعد تأیید / هشدار / سپردن به کاربر */
function rcvDecide(eid,out){const q=rcvQ(eid);if(!q)return;const it=q.it,A=+it.amount||0,rv=it.rv&&typeof it.rv==='object'?it.rv:{},now=new Date().toISOString();
  out.forEach(o=>{rv[o.k]={t:o.r.t,a:o.r.a||0,at:now,by:who()}});const live=new Set(itImgs(q.b,it));Object.keys(rv).forEach(k=>{if(!live.has(k))delete rv[k]});it.rv=rv;saveB();
  const best=out.reduce((b,o)=>!b||RCVP[o.r.t]>RCVP[b.r.t]?o:b,null),r=best.r;
  const sum=Object.values(rv).filter(v=>['ok','part','man'].includes(v.t)).reduce((s,v)=>s+(v.t==='ok'?A:v.a),0);
  if(r.t==='grp')return rcvOk(eid,best,r.G);
  if(r.t==='ok'||(sum===A&&out.some(o=>o.r.t==='part')))return rcvOk(eid,best,[],r.t==='ok'?'':'multi');
  const img=`<span class="rcvim" style="background-image:url(${best.u})"></span>`,exp=`<span>مبلغ واریزی</span><b>${fmt(A)} تومان</b><small>${rcvR(A)}</small>`;
  if(r.t==='ibx')return askWarn({kind:'warn',ico:'alert',t:'مبلغ درست است ولی شبا فرق دارد',sub:esc(it.name||''),h:`<div class="rcvc">${img}<div class="rcvg">${exp}<span>شبای رسید</span><b class="ltr">${esc(r.tI)}</b><small>شبای واریزی: <span class="ltr">${esc(rcvIbOf(it))}</span></small></div></div>`,ok:'بررسی می‌کنم',goT:'رسید درست است · تأیید',goMain:1,go:()=>rcvOk(eid,best,[],'man')});
  if(r.t==='grq'){const its=[it,...r.G.map(j=>q.b.items[j])];return askWarn({kind:'info',ico:'info',t:'این رسید برای '+toFa(its.length)+' واریزی است؟',sub:'مبلغ رسید با جمع این واریزی‌ها یکی است',h:`<div class="rcvc">${img}<div class="rcvg"><span>روی رسید</span><b>${rcvR(r.a)}</b><small>برابر ${fmt(r.a)} تومان</small>${its.map(x=>`<span>${esc(x.name||'')}</span><b>${fmt(+x.amount||0)}</b>`).join('')}</div></div>`,ok:'نه',goT:'بله · همه تأیید شود',goMain:1,go:()=>rcvOk(eid,best,r.G,'man')})}
  if(r.t==='bad')return askWarn({kind:'err',ico:'alert',t:'مبلغ رسید با واریزی یکی نیست',sub:esc(it.name||''),h:`<div class="rcvc">${img}<div class="rcvg"><span>روی رسید</span><b class="rd">${rcvR(r.a)}</b><small>برابر ${fmt(r.a)} تومان</small>${exp}</div></div><button type="button" class="rcvdel" data-act="rcvDel" data-e="${esc(String(eid))}" data-k="${esc(best.k)}">${ic('trash')} حذف این عکس از رسیدها</button>`,ok:'متوجه شدم',goT:'با این حال تأیید',go:()=>rcvOk(eid,best,[],'man')});
  if(r.t==='part'){const rest=A-sum;return askWarn({kind:'info',ico:'info',t:'رسید بخشی از مبلغ است',sub:esc(it.name||''),h:`<div class="rcvc">${img}<div class="rcvg"><span>این رسید</span><b>${fmt(r.a)} تومان</b><small>${rcvR(r.a)}</small><span>جمع رسیدها</span><b>${fmt(sum)} از ${fmt(A)}</b><small>${rest>0?'مانده '+fmt(rest)+' تومان · رسید بعدی را اضافه کنید':'بیشتر از مبلغ واریزی'}</small></div></div>`,ok:'رسید بعدی را می‌زنم',goT:'همین کافی است · تأیید',go:()=>rcvOk(eid,best,[],'man')})}
  /* ناخوانا: تأیید با کاربر */
  return askWarn({kind:'warn',ico:'info',t:'مبلغ رسید خوانا نبود',sub:'عکس را نگاه کنید؛ اگر این مبلغ روی رسید هست تأیید کنید',h:`<div class="rcvc">${img}<div class="rcvg">${exp}${it.tn?`<span>پیگیری</span><b class="ltr">${esc(it.tn)}</b>`:''}</div></div>`,ok:'فعلاً نه',goT:'روی رسید همین است · تأیید',goMain:1,go:()=>rcvOk(eid,best,[],'man')})}
/* تأیید واریزی (و واریزی‌های گروه) + اعلام */
function rcvOk(eid,best,G,how){const q=rcvQ(eid);if(!q)return;const b=q.b,now=new Date().toISOString(),L=[q.i,...(G||[])],prev=[];
  if(b.closed){toast('رسید درست است · لیست بسته شده و وضعیتش عوض نمی‌شود');return}
  for(const j of L){const x=b.items[j];if(!x)continue;prev.push({j,st:x.st,at:x.at,imgs:Array.isArray(x.imgs)?x.imgs.slice():null,img:x.img});
    if(j!==q.i){const K=itImgs(b,x);if(!K.includes(best.k)){K.push(best.k);x.imgs=K;x.img=true}}
    x.rv=x.rv&&typeof x.rv==='object'?x.rv:{};if(how==='man'||!x.rv[best.k]||x.rv[best.k].t==='unk')x.rv[best.k]={t:how==='man'?'man':'ok',a:j===q.i?(+x.amount||0):(+x.amount||0),at:now,by:who()};
    if(x.st!=='ok'){x.st='ok';x.at=now;x.okRc=how==='man'?'man':'auto'}}
  saveB();const its=L.map(j=>b.items[j]).filter(Boolean),tot=its.reduce((s,x)=>s+(+x.amount||0),0);
  logA('edit',how==='man'?'تأیید واریز با رسید (دستی)':'تأیید خودکار واریز با رسید',its.map(x=>x.name).join('، ')+' | '+fmt(tot)+' تومان',{ids:its.map(x=>x.id),imgs:[best.k]});
  if(typeof batchId!=='undefined'&&batchId===b.id&&typeof itemIdx!=='undefined'&&L.includes(itemIdx)&&$('itstp')){tmpSt='ok';try{itStPaint()}catch(e){}}
  try{galRefresh()}catch(e){}if(['ent','lday'].includes(cur)&&!$('itstp')){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}
  const was=prev.every(p=>p.st==='ok');RCVU=was?null:{b:b.id,prev};const img=`<span class="rcvim" style="background-image:url(${best.u})"></span>`;
  askWarn({kind:'ok',ico:'check',t:was?'رسید درست است':how==='man'?'واریزی تأیید شد':its.length>1?'رسید درست است · '+toFa(its.length)+' واریزی تأیید شد':'رسید درست است · واریزی تأیید شد',sub:how==='multi'?'جمع رسیدها با مبلغ واریزی یکی است':'',
    h:`<div class="rcvc">${img}<div class="rcvg">${its.map(x=>`<span>${esc(x.name||'')}</span><b>${fmt(+x.amount||0)} تومان</b><small>${rcvR(+x.amount||0)}${how!=='man'&&(x!==its[0]||(best.r&&best.r.ib))?' · شبای مقصد درست است':''}</small>`).join('')}</div></div>`,
    ok:'عالی',...(was?{}:{goT:'لغو تأیید',go:rcvUndo}),auto:9000})}
let RCVU=null;
function rcvUndo(){const u=RCVU;RCVU=null;if(!u)return;const b=batches.find(z=>z.id===u.b);if(!b||b.closed)return;
  u.prev.forEach(p=>{const x=b.items[p.j];if(!x)return;x.st=p.st;x.at=p.at;if(p.j!==u.prev[0].j){if(p.imgs)x.imgs=p.imgs;else delete x.imgs;x.img=p.img}delete x.okRc});
  saveB();logA('edit','لغو تأیید خودکار رسید',b.items[u.prev[0].j]?b.items[u.prev[0].j].name:'',{});if(batchId===b.id&&$('itstp')){tmpSt=u.prev[0].st==='ok'?'ok':'pending';try{itStPaint()}catch(e){}}
  try{galRefresh()}catch(e){}if(['ent','lday'].includes(cur)&&!$('itstp')){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}toast('تأیید برداشته شد')}
ACT.rcvDel=d=>{const q=rcvQ(d.e);if(!q)return;const K=itImgs(q.b,q.it).filter(k=>k!==d.k);q.it.imgs=K;q.it.img=K.length>0;if(q.it.rv)delete q.it.rv[d.k];q.it.at=new Date().toISOString();saveB();
  logA('edit','حذف رسید نادرست',q.it.name||'',{ids:[q.it.id]});ACT.warnX();try{galRefresh()}catch(e){}toast('عکس از رسیدها برداشته شد')};

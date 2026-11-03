/* ===== v72.3 (خواسته صاحب اپ، مثل کیمیا): «سند بانکی» چندردیفی برای حساب‌های بانک مغازه =====
   - یک سند = چند ردیف؛ هر ردیف «تشخیص» دارد: برداشت، واریز، خرید، فروش، در حساب، پاس شدن، وصول.
   - مستقیم، جدا از لیست‌های واریزی: از صفحه بانک‌ها (•••) یا صفحه هر حساب («+») باز می‌شود.
   - داده همان دفتر حساب s.led است (قالب قبلی نمی‌شکند): هر ردیف یک ردیف led با type in|out (اثر بر مانده)،
     k = کلید تشخیص، note = شرح، و همه ردیف‌های یک سند یک شماره no دارند (همان شمارنده سندها invNext).
   - سندهای قبلی واریز/برداشت دستی (بدون k) همین‌جا باز و ویرایش می‌شوند (تشخیص از type). */
const BDK=[['out','برداشت',-1],['in','واریز',1],['buy','خرید',-1],['sell','فروش',1],['chq','در حساب',1],['pass','پاس شدن',-1],['vos','وصول',1]];
const bdK=k=>BDK.find(x=>x[0]===k)||BDK[1];
const bdKOf=x=>x.k&&BDK.some(z=>z[0]===x.k)?x.k:x.type==='out'?'out':'in';
const bdLab=x=>bdK(bdKOf(x))[1];
/* همه ردیف‌های زنده یک سند (همان شماره در همان حساب) */
const bdRows=(s,x)=>x&&x.no!=null?(s.led||[]).filter(z=>!z.del&&z.no!=null&&String(z.no)===String(x.no)&&(z.type==='in'||z.type==='out')):x?[x]:[];
let BD=null;
/* باز کردن سند: d.id حساب (خالی = انتخاب در خود سند)، d.k تشخیص ردیف اول، d.l = ویرایش سندی که این ردیف در آن است */
ACT.bdNew=d=>{d=d||{};if(!can('src'))return;const L=ownL();const s=d.id!=null&&d.id!==''?sources.find(x=>String(x.id)===String(d.id)):L[0];
  if(!s){toast('اول یک حساب بانک مغازه بسازید',true);return}
  const x0=d.l!=null&&d.l!==''?(s.led||[]).find(z=>String(z.id)===String(d.l)&&!z.del):null;
  if(x0){const R=bdRows(s,x0);BD={sid:s.id,no:x0.no,date:x0.date||String(x0.at||'').slice(0,10)||todayISO(),ed:1,fix:1,rows:R.map(z=>({id:z.id,k:bdKOf(z),a:+z.amount||0,n:z.note||''}))}}
  else BD={sid:s.id,no:null,date:todayISO(),ed:0,fix:d.id!=null&&d.id!=='',rows:[{k:d.k&&BDK.some(z=>z[0]===d.k)?d.k:'out',a:0,n:''}]};
  sheet(bdHTML());bdBind();const a=document.querySelector('#sheet .bda');if(a&&!x0)sheetFocus(a)};
const bdS=()=>BD&&sources.find(x=>String(x.id)===String(BD.sid));
function bdHTML(){const s=bdS();if(!s)return '';const no=BD.no!=null?BD.no:invNext(),L=ownL(),bk=acBank(s);
  const acc=BD.fix?`<div class="bdac one">${bk?bankBadge(bk):`<span class="bri">${ic('bank')}</span>`}<span class="tx"><b>${esc(s.name)}</b><small>${esc(bkSub(s))}</small></span></div>`
    :`<div class="bdacs">${(L.some(z=>String(z.id)===String(s.id))?L:[s,...L]).map(z=>{const b=acBank(z);return `<button type="button" class="bdac${String(z.id)===String(s.id)?' on':''}" data-act="bdAcc" data-id="${z.id}">${b?bankBadge(b):`<span class="bri">${ic('bank')}</span>`}<span class="tx"><b>${esc(z.name)}</b><small>${acFin(z)==null?'—':fmt(acFin(z))+' تومان'}</small></span></button>`}).join('')}</div>`;
  const opt=k=>BDK.map(([v,t,g])=>`<option value="${v}"${v===k?' selected':''}>${t}</option>`).join('');
  const rows=BD.rows.map((r,i)=>`<div class="bdr ${bdK(r.k)[2]>0?'in':'out'}" data-i="${i}"><span class="bdn0">${toFa(i+1)}</span>
    <label class="bdks"><select class="bdk" aria-label="تشخیص">${opt(r.k)}</select></label>
    <label class="bdam"><input class="bda ltr" inputmode="numeric" autocomplete="off" placeholder="مبلغ" aria-label="مبلغ" value="${r.a?Number(r.a).toLocaleString('en-US'):''}"><i>تومان</i></label>
    ${BD.rows.length>1?`<button type="button" class="bdx" data-act="bdDel" data-i="${i}" aria-label="حذف ردیف">×</button>`:''}
    <input class="bdnt" autocomplete="off" placeholder="شرح (اختیاری)" aria-label="شرح" value="${esc(r.n||'')}"></div>`).join('');
  return `<div class="sh-h"><div><b>${BD.ed?'ویرایش ':''}سند بانکی ${toFa(no)}</b><small class="shsub">مستقیم روی حساب بانک، جدا از لیست‌های واریزی</small></div><button class="x" data-act="${BD.ed?'acLedOpen':'acBack'}" data-id="${s.id}"${BD.ed?` data-l="${BD.rows[0].id}"`:''} aria-label="بستن">×</button></div>
  <div class="bdtop"><button type="button" class="bddt" data-act="bdCal">${ic('cal')}<span>${esc(dates(BD.date).fa)}</span></button><span class="bdno">کد سند <b>${toFa(no)}</b></span></div>
  ${acc}<div class="bdl" id="bdL">${rows}</div>
  <button type="button" class="bdadd" data-act="bdAdd">${ic('plus')} ردیف جدید</button>
  <div class="bdsum" id="bdSum">${bdSumHTML()}</div>
  <button class="xgo" data-act="bdSave">${ic('check')} ${BD.ed?'ذخیره ویرایش':'ثبت سند'}</button>`}
/* اثر سند بر مانده و مانده بعد از سند (در ویرایش، اثر قبلی همین سند کم می‌شود) */
function bdSumHTML(){const s=bdS();if(!s)return '';let i=0,o=0;for(const r of BD.rows){const a=+r.a||0;if(bdK(r.k)[2]>0)i+=a;else o+=a}
  let old=0;if(BD.ed)for(const z of s.led||[])if(!z.del&&z.no!=null&&String(z.no)===String(BD.no)&&(z.type==='in'||z.type==='out')&&(!s.balAt||(z.at||'')>=s.balAt))old+=(z.type==='in'?1:-1)*(+z.amount||0);
  const e=acEst(s),af=e==null?null:e-old+i-o,net=i-o;
  return `<span class="bds in"><small>جمع واریز</small><b>${fmt(i)}</b></span><span class="bds out"><small>جمع برداشت</small><b>${fmt(o)}</b></span><span class="bds net ${net<0?'out':'in'}"><small>${af==null?'اثر بر مانده':'مانده بعد از سند'}</small><b>${af==null?(net<0?'−':'+')+fmt(Math.abs(net)):(af<0?'−':'')+fmt(Math.abs(af))}</b></span>`}
function bdRead(){document.querySelectorAll('#bdL .bdr').forEach(el=>{const r=BD.rows[+el.dataset.i];if(!r)return;r.k=el.querySelector('.bdk').value;r.a=num(el.querySelector('.bda').value);r.n=clean(el.querySelector('.bdnt').value||'')})}
function bdBind(){const L=$('bdL');if(!L)return;L.querySelectorAll('.bdr').forEach(el=>{const a=el.querySelector('.bda'),k=el.querySelector('.bdk'),n=el.querySelector('.bdnt');
  a.oninput=()=>{const v=num(a.value);a.value=v?v.toLocaleString('en-US'):'';bdRead();const S=$('bdSum');if(S)S.innerHTML=bdSumHTML()};
  k.onchange=()=>{bdRead();el.classList.toggle('in',bdK(k.value)[2]>0);el.classList.toggle('out',bdK(k.value)[2]<0);const S=$('bdSum');if(S)S.innerHTML=bdSumHTML();if(!RM()&&el.animate)el.animate([{transform:'scale(.98)'},{transform:'none'}],{duration:260,easing:'cubic-bezier(.3,1.4,.5,1)'})};
  a.onkeydown=n.onkeydown=ev=>{if(ev.key!=='Enter')return;ev.preventDefault();if(ev.target===a)n.focus();else ACT.bdAdd()}})}
const bdRe=f=>{sheetKeep(bdHTML());bdBind();if(f)f()};
ACT.bdAdd=()=>{if(!BD)return;bdRead();const last=BD.rows[BD.rows.length-1];BD.rows.push({k:last?last.k:'out',a:0,n:''});bdRe(()=>{const R=document.querySelectorAll('#bdL .bdr'),el=R[R.length-1];if(!el)return;if(!RM()&&el.animate)el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:280,easing:'cubic-bezier(.2,.9,.25,1)'});const a=el.querySelector('.bda');if(a)a.focus()})};
ACT.bdDel=d=>{if(!BD||BD.rows.length<2)return;bdRead();BD.rows.splice(+d.i,1);bdRe()};
ACT.bdAcc=d=>{if(!BD||BD.fix)return;bdRead();BD.sid=d.id;bdRe()};
ACT.bdCal=()=>{if(!BD)return;bdRead();const B=BD;openCal(B.date||todayISO(),iso=>{BD=B;BD.date=iso;sheet(bdHTML());bdBind()})};
ACT.bdSave=()=>{if(!BD)return;bdRead();const s=bdS();if(!s)return;const R=BD.rows.filter(r=>+r.a>0);if(!R.length){toast('مبلغ حداقل یک ردیف را وارد کنید',true);return}
  const now=new Date().toISOString(),by=who(),L=(s.led=s.led||[]);let no=BD.no;
  if(BD.ed){const keep=new Set(R.filter(r=>r.id!=null).map(r=>String(r.id))),old=L.filter(z=>!z.del&&z.no!=null&&String(z.no)===String(no));const at0=(old[0]&&old[0].at)||now;
    for(const z of old)if(!keep.has(String(z.id))){z.del=true;z.delAt=now;z.delBy=by}
    for(const r of R){const sg=bdK(r.k)[2],z=r.id!=null&&L.find(q=>String(q.id)===String(r.id));
      if(z){z.type=sg>0?'in':'out';z.k=r.k;z.amount=+r.a;z.note=r.n;z.date=BD.date;z.edAt=now;z.edBy=by}
      else L.push({id:nid++,type:sg>0?'in':'out',k:r.k,amount:+r.a,note:r.n,date:BD.date,at:at0,by,no,edAt:now,edBy:by})}}
  else{no=invNext();for(const r of R){const sg=bdK(r.k)[2];L.push({id:nid++,type:sg>0?'in':'out',k:r.k,amount:+r.a,note:r.n,date:BD.date,at:now,by,no})}}
  s.updatedAt=now;saveS();const net=R.reduce((a,r)=>a+bdK(r.k)[2]*(+r.a),0);
  logA('src',(BD.ed?'ویرایش ':'')+'سند بانکی '+toFa(no),s.name+' | '+R.map(r=>bdK(r.k)[1]+' '+fmt(+r.a)).join('، '));
  const ed=BD.ed;BD=null;closeSheet();bkId=s.id;if(cur==='bank'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}else{acV={id:s.id,f:'all'};go('bank')}
  toast((ed?'سند بانکی '+toFa(no)+' ویرایش شد':'سند بانکی '+toFa(no)+' ثبت شد')+' · '+(net<0?'−':'+')+fmt(Math.abs(net))+' تومان')};
/* دیدن سند بانکی: همه ردیف‌ها با تشخیص، جمع، جزئیات، ویرایش و حذف */
function bdViewHTML(s,x){const R=bdRows(s,x),bk=acBank(s),c=can('src'),net=R.reduce((a,z)=>a+(z.type==='in'?1:-1)*(+z.amount||0),0);
  const ln=(k,v)=>v?`<div class="lgdr"><small>${k}</small><b>${v}</b></div>`:'',ed=R.filter(z=>z.edAt).map(z=>z.edAt).sort().pop(),edBy=ed&&(R.find(z=>z.edAt===ed)||{}).edBy;
  return `<div class="sh-h"><div><b>${esc(ledDocT(x))}</b><small class="shsub">${esc(s.name)}${bk?' · بانک '+esc(bk):''}</small></div><button class="x" data-act="acBack" data-id="${s.id}" aria-label="بستن">×</button></div>
  ${bxBlue({t:net<0?'اثر سند · از مانده کم شد':'اثر سند · مانده زیاد شد',v:net,sub:'مانده نهایی حساب '+(acFin(s)==null?'—':fmt(acFin(s)))+' تومان'})}
  <div class="fcard bdvl">${R.map((z,i)=>`<div class="bdv ${z.type==='in'?'in':'out'}"><span class="bdn0">${toFa(i+1)}</span><span class="tx"><b>${esc(bdLab(z))}</b>${z.note?`<small>${esc(z.note)}</small>`:''}</span><b class="bdva"><bdi dir="ltr">${z.type==='in'?'+':'−'}${fmt(+z.amount||0)}</bdi> <i>تومان</i></b></div>`).join('')}</div>
  <div class="fcard lgdl">${ln('شماره سند',x.no?toFa(x.no):'بدون شماره (ثبت قبلی)')}${ln('حساب',esc(s.name))}${ln('تاریخ',esc(dates(x.date||String(x.at||'').slice(0,10)).fa)+' · '+esc(bxTime(x.at)))}${ln('ثبت‌کننده',esc(x.by||''))}${ed?ln('آخرین ویرایش',esc(dates(String(ed).slice(0,10)).fa)+' · '+esc(bxTime(ed))+(edBy?' · '+esc(edBy):'')):''}${s.balAt&&String(x.at||'')<s.balAt?ln('وضعیت','پیش از آخرین اصلاح حساب؛ در مانده حساب نمی‌شود'):''}</div>
  ${c?`<button class="xgo" data-act="bdNew" data-id="${s.id}" data-l="${x.id}">${ic('edit')} ویرایش سند</button><button class="lnk acfxd" data-act="acLedDel" data-id="${s.id}" data-l="${x.id}">${ic('trash')} حذف سند</button>`:''}`}

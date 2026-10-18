/* ---------- پرداخت یک واریزی از چند منبع ---------- */
/* واریزی به چند «بخش» مرتبط تقسیم می‌شود: خود واریزی (با تسویه‌های مشتری‌اش) + واریزی‌های همراه با splitOf.
   هر بخش یک واریزی کامل است که در منبع خودش تخصیص، ارسال، پیگیری و خروجی می‌شود. */
const famRoot=x=>x.splitOf!=null&&entries.some(e=>e.id===x.splitOf)?x.splitOf:x.id;
const famOf=x=>{const k=famRoot(x);return validated().filter(r=>r.id===k||r.splitOf===k).sort((a,b)=>(a.id===k?-1:b.id===k?1:a.id-b.id))};
function famSrc(r,A){const si=r.sentBid?srcInfo(r.id):null;if(si)return{name:si.src,st:si.st,sent:true};const a=A.get(r.id);return a&&a.src?{name:a.src,st:'none'}:null}
function entPieces(x){const F=famOf(x),sent=F.some(r=>r.sentBid),ok=can('split')&&!x.full&&x.level<2;if(F.length<2&&!(ok&&x.amount>0))return '';
  if(F.length<2)return `<div class="esec psplit"><div class="stlh"><div><b>پرداخت از چند منبع</b><small>اگر این مبلغ باید بخشی از یک بانک و بخشی از بانک دیگر پرداخت شود</small></div>${!sent?`<button class="stladd" data-act="paySplit" data-id="${x.id}">${ic('split')} تقسیم بین منابع</button>`:''}</div>${sent?'<div class="muted" style="font-size:12px">این واریزی ارسال شده؛ برای تقسیم اول از پیگیری برگردانید.</div>':''}</div>`;
  const tot=sum(F),root=famRoot(x),A=allocMap();
  return `<div class="esec psplit"><div class="stlh"><div><b>پرداخت از ${toFa(F.length)} منبع</b><small>جمع ${fmt(tot)} تومان · هر بخش جدا ارسال و پیگیری می‌شود</small></div>${ok&&!sent?`<button class="stladd" data-act="paySplit" data-id="${x.id}">${ic('edit')} تغییر</button>`:''}</div>
  <div class="stll2">${F.map((r,i)=>{const s=famSrc(r,A),me=r.id===x.id,st=s&&s.sent?(s.st==='ok'?['k','تسویه شد']:s.st==='fail'?['f','ناموفق']:['w','در انتظار']):s?['d','آماده ارسال']:['n','بدون منبع'];return `<div class="stlrw ${st[0]}${me?' me':''}"><button class="stlr" data-act="openEnt" data-id="${r.id}"><span class="bri"><b>${toFa(i+1)}</b></span><span class="tx"><b>${esc(s?s.name:'بدون منبع')}</b><small>${me?'همین بخش':r.id===root?'بخش اصلی':'بخش '+toFa(i+1)}</small></span><span class="brv"><b>${fmt(r.amount)} <i>تومان</i></b><small>${st[1]}</small></span></button></div>`}).join('')}</div>
  ${ok&&!sent?`<button class="link" data-act="paySplitUndo" data-id="${x.id}">یکی کردن بخش‌ها</button>`:''}</div>`}
let PS=null;
function psHTML(){const R=PS.R,s=PS.L.reduce((a,l)=>a+(+l.amount||0),0),left=R-s,opts=v=>`<option value="">بدون منبع</option>`+sources.map(z=>`<option value="${z.id}"${String(z.id)===String(v)?' selected':''}>${esc(z.name)}${acBank(z)?' · '+esc(acBank(z)):''}</option>`).join('');
  return `<div class="sh-h"><div><b>پرداخت از چند منبع</b><small class="shsub">${esc(PS.name)} · مبلغ بانکی ${fmt(R)} تومان</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="psl">${PS.L.map((l,i)=>`<div class="psr"><span class="n">${toFa(i+1)}</span><select data-ps="${i}" aria-label="منبع بخش ${toFa(i+1)}">${opts(l.src)}</select><input class="ltr num" data-pa="${i}" inputmode="numeric" value="${l.amount?Number(l.amount).toLocaleString('en-US'):''}" placeholder="مبلغ" aria-label="مبلغ بخش ${toFa(i+1)}">${PS.L.length>1?`<button class="psx" data-act="psDel" data-i="${i}" aria-label="حذف بخش">×</button>`:''}</div>`).join('')}</div>
  <button class="link" data-act="psAdd">${ic('plus')} بخش دیگر</button>
  <div class="pss ${left?'bad':'ok'}"><span>جمع بخش‌ها <b>${fmt(s)}</b></span><span>${left>0?'مانده <b>'+fmt(left)+'</b>':left<0?'بیشتر از مبلغ: <b>'+fmt(-left)+'</b>':'برابر مبلغ ✓'}</span>${left>0?`<button class="sm sec" data-act="psFill">بقیه به بخش آخر</button>`:''}</div>
  <div class="muted" style="font-size:12px;line-height:1.8;margin:8px 2px">هر بخش در لیست ${esc(pdHead(PS.pay))} زیر منبع خودش می‌آید و جدا کپی، ارسال و پیگیری می‌شود. نام، فاکتور و شبا برای همه بخش‌ها یکی است.</div>
  <button class="xgo" data-act="paySplitSave"${left||PS.L.some(l=>!(+l.amount>0))?' disabled':''}>${ic('check')} ثبت ${toFa(PS.L.length)} بخش</button>`}
function psRedraw(){const f=document.activeElement,fi=f&&f.dataset?(f.dataset.pa||null):null,pos=f&&f.selectionStart;$('sheet').innerHTML=psHTML();if(fi!=null){const n=document.querySelector(`#sheet [data-pa="${fi}"]`);if(n){n.focus();try{n.setSelectionRange(n.value.length,n.value.length)}catch(e){}}}}
function psBind(){const sh=$('sheet');sh.oninput=e=>{const t=e.target;if(t.dataset.pa!=null){const v=num(t.value);PS.L[+t.dataset.pa].amount=v;clearTimeout(sh._t);sh._t=setTimeout(psRedraw,350)}};sh.onchange=e=>{const t=e.target;if(t.dataset.ps!=null){PS.L[+t.dataset.ps].src=t.value;psRedraw()}if(t.dataset.pa!=null)psRedraw()}}
ACT.paySplit=d=>{const x=validated().find(r=>String(r.id)===String(d.id));if(!x)return;const F=famOf(x);if(F.some(r=>r.sentBid)){toast('یکی از بخش‌ها ارسال شده؛ اول از پیگیری برگردانید',true);return}
  AM=allocMap();const sid=n=>{const s=sources.find(z=>z.name===n);return s?String(s.id):''};
  const L=F.map(r=>{const a=AM.get(r.id);return{src:a&&a.src?sid(a.src):'',amount:r.amount}});if(L.length===1){const o=sources.find(z=>String(z.id)!==L[0].src);L[0].amount=0;L.push({src:o?String(o.id):'',amount:0})}
  PS={root:famRoot(x),name:fullName(x),pay:PD(x),R:sum(F),L};sheet(psHTML());psBind()};
ACT.psAdd=()=>{const used=new Set(PS.L.map(l=>l.src)),o=sources.find(z=>!used.has(String(z.id)));PS.L.push({src:o?String(o.id):'',amount:0});psRedraw()};
ACT.psDel=d=>{PS.L.splice(+d.i,1);psRedraw()};
ACT.psFill=()=>{const s=PS.L.slice(0,-1).reduce((a,l)=>a+(+l.amount||0),0);PS.L[PS.L.length-1].amount=Math.max(0,PS.R-s);psRedraw()};
ACT.paySplitUndo=d=>{const x=validated().find(r=>String(r.id)===String(d.id));if(!x)return;askConfirm('همه بخش‌ها دوباره یک واریزی شوند؟ تخصیص بخش‌ها برداشته می‌شود.','یکی کردن',()=>{const F=famOf(x);PS={root:famRoot(x),name:fullName(x),pay:PD(x),R:sum(F),L:[{src:'',amount:sum(F)}]};psApply()})};
ACT.paySplitSave=()=>{if(!PS)return;const s=PS.L.reduce((a,l)=>a+(+l.amount||0),0);if(s!==PS.R||PS.L.some(l=>!(+l.amount>0))){toast('جمع بخش‌ها باید برابر مبلغ بانکی باشد',true);return}psApply()};
function psApply(){const root=entries.find(e=>e.id===PS.root);if(!root){closeSheet();return}const fam=entries.filter(e=>e.id===root.id||e.splitOf===root.id).sort((a,b)=>a.id===root.id?-1:b.id===root.id?1:a.id-b.id);
  if(fam.some(e=>e.sentBid)){toast('یکی از بخش‌ها ارسال شده است',true);return}
  const now=new Date().toISOString(),ids=new Set(fam.map(e=>e.id)),rootSt=(root.settles||[]).reduce((a,z)=>a+(+z.amount||0),0);
  for(const k in drafts)drafts[k]=(drafts[k]||[]).map(p=>{if(p.sent||!(p.ids||[]).some(id=>ids.has(id)))return p;return{...p,ids:p.ids.filter(id=>!ids.has(id))}}).filter(p=>p.sent||p.ids.length);
  const keep=[];PS.L.forEach((l,i)=>{let e=fam[i];
    if(i===0){e.amount=rootSt+(+l.amount);e.updatedAt=now;e.updatedBy=who()}
    else if(e){e.amount=+l.amount;e.updatedAt=now;e.updatedBy=who()}
    else{e={id:nid++,splitOf:root.id,name:root.name,title:root.title||'',code:root.code||'',iban:root.iban||'',card:root.card||'',bank:root.bank||'',holder:root.holder||'',phone:root.phone||'',nid:root.nid||'',entryDate:root.entryDate,payDate:root.payDate||root.entryDate,amount:+l.amount,settles:[],note:'',createdBy:who(),updatedBy:who(),updatedAt:now};entries.push(e)}
    keep.push({e,src:l.src})});
  const drop=fam.slice(PS.L.length).map(e=>e.id);if(drop.length)trashIds(drop,'یکی کردن بخش‌های پرداخت');saveE();saveD();
  const k0=ldKey;ldKey=PS.pay;keep.forEach(({e,src})=>{const so=sources.find(z=>String(z.id)===String(src));if(so)moveTo([e.id],null,so)});ldKey=k0;
  logA('split',PS.L.length>1?'پرداخت از چند منبع':'یکی کردن بخش‌ها',PS.name+' | '+PS.L.map(l=>{const so=sources.find(z=>String(z.id)===String(l.src));return (so?so.name:'بدون منبع')+' '+fmt(l.amount)}).join('، '));
  const n=PS.L.length;PS=null;alloc=null;closeSheet();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast(n>1?'پرداخت بین '+toFa(n)+' منبع تقسیم شد':'بخش‌ها یکی شدند')}

/* ============ v61.61 (خواسته صاحب اپ) ============
   ۱) ردیف‌های سند: یک بار زدن = جزئیات زیر ردیف با حرکت باز/بسته؛ دو بار زدن = ویرایش (d6Tap، حالت باز در D6OP).
   ۲) مانده قبلی یک واحد در دریافت/پرداخت: تومان و طلا با هم، و هر مانده دیگر (دلار، سکه…) با «+».
      ذخیره همان ساختار قبلی است (pay m:'prev' و xr با cat 'مانده قبلی' و pul) با کلید گروه مشترک pv؛
      در فهرست ردیف‌ها یک ردیف دیده می‌شود و با هم ویرایش/حذف می‌شوند. حساب‌ها هیچ تغییری نمی‌کنند.
   ۳) جدول مانده‌های پایین: مبلغ و طلا همیشه؛ دلار و سکه جمع‌شده زیر دکمه گوشه جدول (BGX). */
const D6OP=new Set();let D6T={k:'',t:0};
ACT.d6Tap=(d,e)=>{const b=e&&e.target&&e.target.closest('.d6rb'),r=b&&b.closest('.d6r');if(!r)return;const k=d.key||'',now=Date.now();
  /* دو بار زدن پشت هم روی همان ردیف = ویرایش (باز/بسته شدن زدن اول برمی‌گردد) */
  if(d.a&&ACT[d.a]&&D6T.k===k&&now-D6T.t<380){D6T={k:'',t:0};d6Set(r,k,!r.classList.contains('op'));ACT[d.a](d);return}
  D6T={k,t:now};d6Set(r,k,!r.classList.contains('op'))};
function d6Set(r,k,on){r.classList.toggle('op',on);const b=r.querySelector('.d6rb');if(b)b.setAttribute('aria-expanded',on?'true':'false');if(k){if(on)D6OP.add(k);else D6OP.delete(k)}
  if(on&&!RM()){const x=r.querySelector('.d8xi');if(x&&x.animate)x.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.2,.9,.25,1)'});
    setTimeout(()=>{if(!r.isConnected)return;const R=r.getBoundingClientRect(),A=$('act'),bot=(A&&A.offsetHeight?A.getBoundingClientRect().top:innerHeight)-8;if(R.bottom>bot)scrollBy({top:Math.min(R.bottom-bot,R.top-80),behavior:'smooth'})},320)}}

/* ----- جدول مانده‌ها: مانده‌های دیگر (دلار، سکه…) جمع‌شده ----- */
let BGX=false;
ACT.bgX=(d,e)=>{BGX=!BGX;document.querySelectorAll('.iv9b.hx').forEach(B=>{const x=B.querySelector('.iv8x'),t=B.querySelector('.iv8tg');if(x)x.classList.toggle('op',BGX);
  if(t){t.classList.toggle('op',BGX);t.setAttribute('aria-expanded',BGX?'true':'false');const n=x?x.querySelectorAll('.iv8r').length:0,bb=t.querySelector('b');if(bb)bb.textContent=BGX?'−':'+'+toFa(n)}
  if(BGX&&x&&!RM()){x.querySelectorAll('.iv8c').forEach((c,i)=>c.animate&&c.animate([{opacity:0,transform:'translateY(8px) scale(.96)'},{opacity:1,transform:'none'}],{duration:340,delay:60+i*35,easing:'cubic-bezier(.2,.9,.25,1)',fill:'backwards'}))}})};

/* ----- مانده قبلی (یک واحد) ----- */
function pvGroups(pays,xr){const M=new Map(),sp=new Set(),sx=new Set(),G=id=>{if(!M.has(id))M.set(id,{id,p:[],x:[],dir:''});return M.get(id)};
  (pays||[]).forEach((p,i)=>{if(p&&p.pv&&p.m==='prev'){const g=G(String(p.pv));g.p.push(i);sp.add(i);if(!g.dir)g.dir=pAmt(p)<0?'out':'in'}});
  (xr||[]).forEach((x,i)=>{if(x&&x.pv&&x.cat==='مانده قبلی'){const g=G(String(x.pv));g.x.push(i);sx.add(i);if(!g.dir)g.dir=x.t==='out'?'out':'in'}});
  return {L:[...M.values()],sp,sx}}
const pvEffs=(G,pays,xr,eOf)=>G.p.map(i=>d6Eff(pAmt(pays[i]))).join('')+G.x.map(i=>xr[i]).sort((a,b)=>balRk(a.a==='gold'?'g':a.a)-balRk(b.a==='gold'?'g':b.a)).map(x=>d6Eff(eOf(x),x.a==='gold'?'g':x.a)).join('');
const pvHas=p=>!!(+p.r||parseFloat(p.g)||(p.xs||[]).some(z=>parseFloat(z.v)));
function pvStart(p){qaRead();const d=sv.qa.d||p.dir;sv.qa={...qaBlank(),d,pv:{dir:p.dir,r:p.r||'',g:p.g||'',xs:p.xs||[],gid:p.gid||'',add:0}};svKeep();qaRe();
  const q=$('qa');if(q&&p.gid)q.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>{const I=$('pvR');if(I&&$('ov').classList.contains('hide'))try{I.focus({preventScroll:true})}catch(_){}},60)}
ACT.svPvEdit=d=>{const id=String(d.i),G=pvGroups(sv.pays,sv.xr||[]).L.find(z=>z.id===id);if(!G)return;const p={dir:G.dir,gid:id,r:'',g:'',xs:[]};
  G.p.forEach(i=>{p.r=String((+p.r||0)+Math.abs(pAmt(sv.pays[i])))});
  G.x.forEach(i=>{const x=sv.xr[i];if(x.a==='gold')p.g=String(Math.round(((parseFloat(p.g)||0)+(parseFloat(x.w)||0))*1000)/1000);else p.xs.push({k:x.a,v:String(x.q||'')})});
  pvStart(p)};
function pvHTML(){const p=sv.qa.pv,D=DK.find(z=>z[0]===p.dir)||DK[3],out=p.dir==='out',ed=!!p.gid;
  const line=(id,k,nm,u,val,ph,rm)=>`<label class="pvl"><span class="pvk"><b>${nm}</b><small>${esc(u)}</small></span><input${id?` id="${id}"`:''} class="ltr" data-k="${esc(k)}" inputmode="decimal" value="${val}" placeholder="${ph}" autocomplete="off" enterkeyhint="next">${rm?`<button type="button" class="pvx" data-act="pvRm" data-k="${esc(k)}" aria-label="برداشتن ${esc(nm)}">×</button>`:''}</label>`;
  const used=new Set(p.xs.map(z=>z.k)),av=[...FXS(),...COINS()].filter(k=>!used.has(k));
  return `<div class="pvw">${stHead(D,'مانده قبلی',1)}
  <div class="pvnote ${out?'d':'c'}">${ic('clock')}<span>${out?'مشتری به ما بدهکار است':'مشتری از ما طلبکار است'} · <b>${out?'طلبکاریم':'بدهکاریم'}</b></span></div>
  <div class="pvg">${line('pvR','r','مبلغ','تومان',+p.r?Number(p.r).toLocaleString('en-US'):'','0')}${line('pvG','g','طلا','گرم ۷۵۰',esc(p.g||''),'0.000')}${p.xs.map(z=>line('','x:'+z.k,esc((XA[z.k]||{t:z.k}).t),(XA[z.k]||{}).u||'عدد',esc(grpIn(z.v)),'0',z.k)).join('')}</div>
  ${av.length?`<div class="pvadd${p.add?' op':''}"><button type="button" class="pvab" data-act="pvAdd" aria-expanded="${p.add?'true':'false'}">${ic('plus')}<span>مانده دیگر</span><small>دلار، سکه…</small></button><div class="pvch"><div class="pvchi">${av.map(k=>`<button type="button" class="pvc" data-act="pvAddK" data-k="${esc(k)}">${ic((XA[k]||{}).k==='f'?'usd':'coin')}<span>${esc(XA[k].t)}</span></button>`).join('')}</div></div></div>`:''}
  <div class="pvlv" id="pvLv">${pvLive()}</div>
  <div class="stft"><button type="button" class="stdone" data-act="pvSave">${ic('check')}<span>${ed?'ذخیره تغییرات':'افزودن به سند'}</span></button>${ed?`<button type="button" class="stdel" data-act="pvDel" data-i="${esc(p.gid)}">${ic('trash')}<span>حذف</span></button>`:''}</div></div>`}
function pvLive(){const p=sv.qa.pv;if(!p)return '';const sg=p.dir==='out'?-1:1,E=[],q=(v,k)=>`<span class="pvq ${v<0?'d':'c'}"><small>${ourLab(v)}</small><b>${balV(k,v)}</b><i>${esc(k==='r'?'تومان':balU(k))}</i></span>`;
  if(+p.r)E.push(q(sg*+p.r,'r'));if(parseFloat(p.g))E.push(q(sg*parseFloat(p.g),'g'));p.xs.forEach(z=>{if(parseFloat(z.v))E.push(q(sg*parseFloat(z.v),z.k))});
  return E.length?`<small>مانده قبلی این سند</small><span class="pvle">${E.join('')}</span>`:'<small>مبلغ، طلا یا هر کدام را بزنید</small>'}
function pvRead(){const p=sv.qa&&sv.qa.pv,W=$('qa');if(!p||!W)return;W.querySelectorAll('.pvl input[data-k]').forEach(I=>{const k=I.dataset.k,v=toEn(I.value).replace(/,/g,'');
  if(k==='r')p.r=String(num(I.value)||'');else if(k==='g')p.g=decIn(v);else{const z=p.xs.find(o=>'x:'+o.k===k);if(z)z.v=decIn(v)}})}
function pvBind(){const W=$('qa');if(!W)return;const L=[...W.querySelectorAll('.pvl input[data-k]')];
  L.forEach((I,j)=>{selOnFocus(I);I.oninput=()=>{const k=I.dataset.k;if(k==='r'){const v=num(I.value);I.value=v?v.toLocaleString('en-US'):''}else if(k==='g')I.value=decIn(I.value);else I.value=grpIn(I.value);
    pvRead();svKeep();const P=$('pvLv');if(P)numMorph('#pvLv .pvq b',()=>{P.innerHTML=pvLive()})};
    I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const n=L[j+1];if(n)n.focus();else ACT.pvSave()}}})}
ACT.pvAdd=()=>{pvRead();const p=sv.qa.pv;if(!p)return;p.add=p.add?0:1;svKeep();const B=document.querySelector('#qa .pvadd'),b=B&&B.querySelector('.pvab');if(B)B.classList.toggle('op',!!p.add);if(b)b.setAttribute('aria-expanded',p.add?'true':'false')};
ACT.pvAddK=d=>{pvRead();const p=sv.qa.pv;if(!p||!d.k||p.xs.some(z=>z.k===d.k))return;p.xs.push({k:d.k,v:''});p.add=0;svKeep();qaRe();
  const W=$('qa'),I=W&&[...W.querySelectorAll('.pvl input[data-k]')].find(x=>x.dataset.k==='x:'+d.k);if(I){const l=I.closest('.pvl');if(l&&!RM()&&l.animate)l.animate([{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.2,.9,.25,1)'});try{I.focus({preventScroll:true})}catch(_){}}};
ACT.pvRm=d=>{pvRead();const p=sv.qa.pv;if(!p)return;const W=$('qa'),l=W&&[...W.querySelectorAll('.pvl input[data-k]')].find(x=>x.dataset.k==='x:'+d.k);const go=()=>{p.xs=p.xs.filter(z=>z.k!==d.k);svKeep();qaRe()};
  const L=l&&l.closest('.pvl');if(L&&!RM()&&L.animate){const a=L.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateX(-14px)'}],{duration:180,easing:'ease-in'});a.onfinish=go}else go()};
function pvRows(gid){const id=String(gid);return{P:sv.pays.filter(p=>String(p.pv||'')===id&&p.m==='prev'),X:(sv.xr||[]).filter(x=>String(x.pv||'')===id&&x.cat==='مانده قبلی')}}
function pvDrop(gid){const id=String(gid),pi=[],xi=[];sv.pays.forEach((p,i)=>{if(String(p.pv||'')===id&&p.m==='prev')pi.push([i,p])});(sv.xr||[]).forEach((x,i)=>{if(String(x.pv||'')===id&&x.cat==='مانده قبلی')xi.push([i,x])});
  sv.pays=sv.pays.filter((p,i)=>!pi.some(z=>z[0]===i));sv.xr=(sv.xr||[]).filter((x,i)=>!xi.some(z=>z[0]===i));return{pi,xi}}
ACT.pvSave=()=>{pvRead();const p=sv.qa.pv;if(!p)return;if(!pvHas(p)){toast('مبلغ یا طلای مانده قبلی را بزنید',true);const I=$('pvR');if(I)I.focus();return}
  const gid=p.gid||('p'+Date.now().toString(36)),sg=p.dir==='out'?-1:1;if(p.gid)pvDrop(p.gid);
  if(+p.r)sv.pays.push({m:'prev',amount:sg*Math.round(+p.r),pv:gid});
  if(parseFloat(p.g))sv.xr.push(xrNew(p.dir,'gold',{cat:'مانده قبلی',pul:true,ay:750,w:String(Math.round(parseFloat(p.g)*1000)/1000),pv:gid,fd:p.dir}));
  p.xs.forEach(z=>{if(parseFloat(z.v)&&XA[z.k])sv.xr.push(xrNew(p.dir,z.k,{cat:'مانده قبلی',pul:true,q:String(parseFloat(z.v)),pv:gid,fd:p.dir}))});
  D6OP.delete('spv'+gid);qaDone();toast(p.gid?'مانده قبلی ذخیره شد':'مانده قبلی به سند اضافه شد')};
function pvDel(gid){const R=pvDrop(gid);if(sv.qa.pv&&String(sv.qa.pv.gid)===String(gid))sv.qa=qaBlank();svKeep();qaRe();svRe();
  toast('مانده قبلی حذف شد','','بازگردانی',()=>{R.pi.forEach(([i,o])=>sv.pays.splice(Math.min(i,sv.pays.length),0,o));R.xi.forEach(([i,o])=>sv.xr.splice(Math.min(i,sv.xr.length),0,o));svKeep();svRe()})}
ACT.pvDel=d=>pvDel(d.i);

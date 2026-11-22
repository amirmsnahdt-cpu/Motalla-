/* ---- v100.1 «تنظیم چاپ» داخل صفحهٔ چاپ ----
   صاحب اپ: «این تنظیمات با چاپ نمی‌خواند؛ یک قسمت در خود برنامه که از همان‌جا درست کنم و چاپ هم از درون برنامه باشد، چون هر چه ادیت می‌کنم در اندروید نمی‌شود».
   در پیش‌نمایش هر فاکتور، دکمهٔ «تنظیم چاپ» یک پنل باز می‌کند: عرض، ارتفاع، جابه‌جایی افقی/عمودی و صاف کردن خط‌ها برای راه چاپ همین دستگاه (prPlat).
   هر تغییر همان لحظه روی همین گوشی ذخیره می‌شود (prLoc، 15zx) و پیش‌نمایش جای قاب را روی کاغذ نشان می‌دهد (همان prShtCSS که چاپ می‌گیرد).
   چاپ از همان صفحه (دکمهٔ «چاپ» پایین). مدیر: موقع بستن پنل یا چاپ، همین عددها برای همهٔ دستگاه‌های همان راه هم ذخیره می‌شود (cfg.inv.all). */
const PVA={on:0,pl:'',sg:{},t:0,m:''};
/* این پیش‌نمایش برگهٔ فاکتور به اندازهٔ کاغذ فاکتور است؟ (فقط همان برگه‌ها جای چاپ دارند) */
function pvaOk(html){html=String(html||'');if(!/<section class="sht/.test(html))return false;let S;try{S=invCfg('sale')}catch(e){return false}if(S.paper==='a42')return false;
  const A4=S.paper==='a4',W=A4?297:210,H=S.paper==='a5'?148:S.paper==='b14'?140:210,Q=pageSpec(html);return Math.abs(Q.mmW-W)<=1&&Math.abs(Q.mmH-H)<=1}
/* v100.2: در اپ اندروید تازه دکمه همیشه هست (انتخاب چاپگر برای همه برگه‌ها؛ جای چاپ فقط برای فاکتور) */
function pvaBtn(html){const b=document.querySelector('#pv .pvadb');if(b)b.classList.toggle('hide',!html||!(pvaOk(html)||prnHas()))}
const pvaS=()=>{try{return invCfg('sale')}catch(e){return null}};
/* عددهای فعلی (با تنظیم همین گوشی): k اندازه، w/h عرض و ارتفاع کل ٪، x/y میلی‌متر، r درجه */
function pvaV(){const S=prEff(pvaS(),PVA.pl)||{},p=PVA.pl,n=k=>{const v=+S[k+p];return isFinite(v)?v:prK0(k)},k=n('psk');return {k,w:k+n('psw'),h:k+n('psh'),x:n('psx'),y:n('psy'),r:n('psr')}}
const pvaR1=v=>Math.round(v*10)/10,pvaCl=(v,a,b)=>Math.max(a,Math.min(b,v));
/* نوشتن روی همین گوشی؛ عرض و ارتفاع کل → اندازهٔ مشترک (میانگین) + اضافهٔ هر جهت */
function pvaPut(V){const S=pvaS();if(!S)return;const w=pvaCl(V.w,80,125),h=pvaCl(V.h,80,125),k=pvaR1(pvaCl((w+h)/2,85,115)),v=[k,pvaR1(pvaCl(w-k,-12,12)),pvaR1(pvaCl(h-k,-12,12)),pvaR1(pvaCl(V.x,-25,25)),pvaR1(pvaCl(V.y,-25,25)),pvaR1(pvaCl(V.r,-3,3))];
  const L=prLoc();if(v.join(',')===prShV(S,PVA.pl))delete L[PVA.pl];else L[PVA.pl]={v,b:prShV(S,PVA.pl)};prLocSet(L);pvaPaint();pvaPrev();pvaPdf()}
const pvaDev=()=>ivPlN(PVA.pl)||'این دستگاه';
function pvaHTML(){const V=pvaV(),f=v=>toFa(String(pvaR1(Math.abs(v)))),
  cell=(k,t,u,d,v,pos,neg,ia,ib)=>{const sg=pos?(v<0?-1:v>0?1:(PVA.sg[k]||1)):0;return `<div class="pvac"><div class="pvat"><small>${t}</small>${pos?`<button type="button" class="pvsg" data-act="pvaSg" data-k="${k}">${sg>0?pos:neg}</button>`:''}</div>
    <div class="pvar"><button type="button" data-act="pvaN" data-k="${k}" data-d="${pos?d:-d}" aria-label="${pos?pos:'کمتر'}">${ia}</button><label><input class="ltr" inputmode="decimal" autocomplete="off" data-k="${k}" value="${f(v)}"><i>${u}</i></label><button type="button" data-act="pvaN" data-k="${k}" data-d="${pos?-d:d}" aria-label="${neg||'بیشتر'}">${ib}</button></div></div>`};
  const inv=pvaOk(window.__pv);
  return `<div class="pvah"><div><b>تنظیم چاپ</b><small>${inv?esc(pvaDev())+' · عددها همین الان روی همین گوشی اعمال می‌شود':'چاپگر این گوشی'}</small></div><button type="button" class="ib0" data-act="pvAdj" aria-label="بستن">${ic('x')}</button></div>
  ${prnRowH()}${inv?`<div class="pvag">${cell('w','عرض چاپ','٪',.5,V.w,'','','−','+')}${cell('h','ارتفاع چاپ','٪',.5,V.h,'','','−','+')}
  ${cell('x','جابه‌جایی افقی','م‌م',.5,V.x,'به راست','به چپ','→','←')}${cell('y','جابه‌جایی عمودی','م‌م',.5,V.y,'به پایین','به بالا','↓','↑')}
  ${cell('r','صاف کردن خط‌ها','درجه',.1,V.r,'ساعت‌گرد','پادساعت‌گرد','↻','↺')}<div class="pvac pvaz"><button type="button" class="pva0" data-act="pvaReset">${ic('undo')}<span>حالت اول</span></button></div></div>`:''}
  <div class="pvan" id="pvaN"></div>`}
function pvaNote(){const e=$('pvaN');if(!e)return;if(!pvaOk(window.__pv)){e.innerHTML=prnHas()?`${ic('info')}<span>${prnCfg()?'با «چاپ» صفحه‌ها مستقیم برای همین چاپگر فرستاده می‌شود.':'چاپگری انتخاب نشده؛ «چاپ» پنجرهٔ چاپ اندروید را باز می‌کند.'}</span>`:'';e.classList.remove('bad');return}const html=window.__pv||'',Q=pageSpec(html),C=prCal(Q.mmW,Q.mmH,PVA.pl),loc=!!prLoc()[PVA.pl];
  e.innerHTML=C&&C.cl?`${ic('info')}<span>بیشتر از این جا ندارد: قاب از کاغذ بیرون می‌زند (افقی تا ${toFa(String(C.bx))} و عمودی تا ${toFa(String(C.by))} میلی‌متر). اندازه را کمتر کنید.</span>`
    :`${ic('info')}<span>${loc?(isAdmin()?`با «چاپ» یا بستن این پنل برای همهٔ ${esc(pvaDev())}ها هم ذخیره می‌شود.`:'فقط روی همین گوشی ذخیره شد.'):'جای قاب روی کاغذ در پیش‌نمایش بالا دیده می‌شود.'}${PVA.pl==='i'?' روی آیفون فایل PDF با همین تنظیم دوباره ساخته می‌شود.':''}</span>`;
  e.classList.toggle('bad',!!(C&&C.cl))}
/* فقط عددها عوض می‌شوند (خانه‌ای که در حال نوشتن است دست نمی‌خورد) */
function pvaPaint(){const P=$('pva');if(!P)return;const V=pvaV(),a=document.activeElement;
  P.querySelectorAll('input[data-k]').forEach(i=>{if(i!==a)i.value=toFa(String(pvaR1(Math.abs(V[i.dataset.k]))))});
  P.querySelectorAll('.pvsg').forEach(b=>{const k=b.dataset.k,v=V[k],sg=v<0?-1:v>0?1:(PVA.sg[k]||1),L={x:['به راست','به چپ'],y:['به پایین','به بالا'],r:['ساعت‌گرد','پادساعت‌گرد']}[k];b.textContent=sg>0?L[0]:L[1]});pvaNote()}
/* پیش‌نمایش: همان سبکی که هنگام چاپ به برگه اضافه می‌شود (جابه‌جایی، اندازه، چرخش؛ اندروید صفحهٔ ۱۴۷ میلی‌متری) */
function pvaPrev(){const f=$('pvf');let d;try{d=f&&f.contentDocument}catch(e){d=null}if(!d||!d.head)return;let st=d.getElementById('pvaS');
  const css=PVA.on?String(prShtCSS(window.__pv||'',PVA.pl)).replace(/<\/?style>/g,''):'';if(!css){if(st)st.remove();return}
  if(!st){st=d.createElement('style');st.id='pvaS';d.head.appendChild(st)}st.textContent=css}
/* آیفون: چاپ از خود فایل PDF است → بعد از مکث کوتاه دوباره ساخته می‌شود (pvPrint تا آماده شدنش صبر می‌کند) */
function pvaPdf(){if(PVA.pl!=='i'||!window.__pv)return;clearTimeout(PVA.t);PVA.t=setTimeout(()=>{if(PVA.on&&window.__pv)pdfPrep(window.__pv)},600)}
/* مدیر: تنظیم این گوشی → تنظیم مشترک همان راه چاپ (همان شکلی که صفحهٔ تنظیمات فاکتور می‌نویسد) */
function pvaCommit(){const pl=PVA.pl,L=prLoc(),o=L[pl];if(!pl||!o||!isAdmin())return;const r=cfgRec(1),inv=r.inv=r.inv||{};
  if(!inv.all){const cur=invCfg('sale'),all={};for(const q in cur)if(!invOwn(q)&&cur[q]!==INVD[q])all[q]=cur[q];inv.all=all}
  PRK.forEach((k,i)=>{const q=k+pl,v=+o.v[i];if(v===INVD[q])delete inv.all[q];else inv.all[q]=v});delete L[pl];prLocSet(L);saveCu();logA('cust','تنظیمات فاکتور','جای چاپ '+pvaDev()+' از صفحهٔ چاپ تنظیم شد');pvaNote()}
function pvaOff(){if(PVA.on)pvaCommit();PVA.on=0;PVA.m='';clearTimeout(PVA.t);const P=$('pv');if(P)P.classList.remove('adj');const b=document.querySelector('#pv .pvadb');if(b)b.classList.remove('on');pvaPrev()}
function pvaBind(P){if(P._pvab)return;P._pvab=1;
  const put=i=>{const k=i.dataset.k,raw=decIn(i.value);if(raw===''){pvaPaint();return}let v=parseFloat(raw);if(!isFinite(v)){pvaPaint();return}const V=pvaV();
    if(k==='w'||k==='h'){if(v<80||v>125){toast('عددی بین ۸۰ تا ۱۲۵ درصد بنویسید',true);pvaPaint();return}V[k]=v}
    else{const hi=k==='r'?3:25;if(v>hi){toast(`حداکثر ${toFa(String(hi))} ${k==='r'?'درجه':'میلی‌متر'}`,true);pvaPaint();return}const sg=V[k]<0?-1:V[k]>0?1:(PVA.sg[k]||1);V[k]=v*sg}pvaPut(V)};
  P.addEventListener('change',e=>{const i=e.target.closest('input[data-k]');if(i)put(i)});
  P.addEventListener('keydown',e=>{const i=e.target.closest('input[data-k]');if(i&&e.key==='Enter'){e.preventDefault();i.blur()}});}
ACT.pvAdj=()=>{const P=$('pv');if(!P||P.classList.contains('hide'))return;if(PVA.on){pvaOff();return}if(!pvaOk(window.__pv)&&!prnHas()){toast('تنظیم چاپ فقط برای برگهٔ فاکتور است');return}
  PVA.on=1;PVA.pl=prPlat();PVA.sg={};let el=$('pva');if(!el){el=document.createElement('div');el.id='pva';el.className='pva';P.insertBefore(el,P.querySelector('.pvh'))}pvaBind(el);
  el.innerHTML=pvaHTML();P.classList.add('adj');const b=P.querySelector('.pvadb');if(b)b.classList.add('on');pvaNote();pvaPrev();prnStRe()};
ACT.pvaN=d=>{const V=pvaV(),k=d.k;V[k]=pvaR1(V[k]+(+d.d||0));pvaPut(V)};
ACT.pvaSg=d=>{const V=pvaV(),k=d.k;if(V[k]){V[k]=-V[k];pvaPut(V)}else{PVA.sg[k]=-(PVA.sg[k]||1);pvaPaint()}};
ACT.pvaReset=()=>{const S=pvaS();if(!S)return;const p=PVA.pl,L=prLoc(),z=PRK.map(k=>prK0(k)).join(',');PVA.sg={};
  if(prShV(S,p)===z){delete L[p];prLocSet(L);pvaPaint();pvaPrev();pvaPdf();return}pvaPut({w:100,h:100,x:0,y:0,r:0})};

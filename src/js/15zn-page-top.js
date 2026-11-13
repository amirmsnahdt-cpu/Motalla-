/* ============ v80.9 (خواسته صاحب اپ: «همه دکمه‌های ثبت در تمام صفحات باید درست شود») ============
   همان قاعده پنجره‌ها (15zm) برای صفحه‌های کامل: دکمه اصلی هر صفحه (ثبت سند، ثبت سند بانکی، افزودن به لیست، ارسال لیست،
   بایگانی، همکار تازه) دیگر نوار بزرگ پایین نیست؛ یک دکمه فشرده آبی در سرتیتر، بالا سمت چپ (کنار دکمه‌های دیگر سرتیتر).
   render() بعد از ساختن سرتیتر hdGo() را می‌گذارد؛ صفحه‌هایی که بخشی از خودشان را بدون render تازه می‌سازند hdGoSync() را صدا می‌زنند. */
function hdGo(){const P=(act,ico,t,o)=>{o=o||{};return `<button type="button" class="ib0 hal hgo${o.sec?' sec':''}" data-act="${act}"${o.dis?' disabled':''} aria-label="${esc(o.al||t)}">${ic(ico)}${t?`<span>${t}</span>`:''}</button>`};
  if(cur==='sell'&&typeof sv!=='undefined'&&sv&&svCu())return P('svSave','check',sv.edit?'ذخیره':'ثبت',{al:sv.edit?'ذخیره سند':'ثبت سند و تسویه'});
  if(cur==='bdoc'&&typeof BD!=='undefined'&&BD)return P('bdSave','check',BD.ed?'ذخیره':'ثبت سند',{dis:!BD.rows.length&&!(BD.e&&+BD.e.a)});
  if(cur==='buy'&&typeof bz!=='undefined'&&bz)return P('bzNext','check',(bz.step||1)<3?'تأیید و ادامه':'ثبت واریزی');
  if(cur==='bulk')return P('resetBulk','trash','',{sec:1,al:'پاک کردن'})+P('bulkAdd','plus','افزودن به لیست');
  if(cur==='backups'&&typeof bkBtn==='function')return bkBtn('bkFull','','ib0 hal hgo','down','دانلود کامل');
  if(cur==='users'&&isAdmin())return P('userNew','plus','همکار تازه');
  if(cur==='invset'&&isAdmin()&&typeof IS!=='undefined'&&IS)return P('ivSave','check','ذخیره',{dis:!ivDirty(),al:'ذخیره تنظیمات فاکتور'});
  if(cur==='lday'){const d=hubData(ldKey);if(!d.rows.length)return '';
    /* v82.4 (خواسته صاحب اپ): «تخصیص خودکار» هم بالا، کنار «ارسال» */
    const aa='';/* v86.4: «تخصیص» و «خودکار» در گروه سرتیتر (ldHdr در 06)؛ اینجا فقط «ارسال» */
    if(d.dr.length&&can('split'))return aa+P('hubSendAll','copy','ارسال'+(d.dr.length>1?' '+toFa(new Set(d.dr.map(p=>p.src.name)).size)+' منبع':''),{al:'کپی و ارسال'});
    if(aa)return aa;
    /* v81.6 (خواسته صاحب اپ): دکمه «بایگانی» لازم نیست — لیست تسویه‌شده در همین بخش می‌ماند */}
  return ''}
function hdGoPut(){const B=$('bar');if(!B)return;B.querySelectorAll('.hgo').forEach(e=>e.remove());const h=hdGo();if(!h)return;let H=B.querySelector('.hbtns');if(!H){B.insertAdjacentHTML('beforeend','<span class="hbtns"></span>');H=B.querySelector('.hbtns')}H.insertAdjacentHTML('beforeend',h)}
/* بازسازی جزئی صفحه (بدون render): فقط وضعیت دکمه سرتیتر تازه می‌شود */
function hdGoSync(){try{hdGoPut()}catch(e){}}
/* کادرهای قدیمی ردیف سند (تخفیف، کالا، سکه، دریافت/پرداخت قدیمی): دکمه «افزودن/ذخیره» از پایین کادر به سرتیتر همان کادر، کنار «بستن/انصراف» */
function qfTop(){const q=$('qa');if(!q)return;const f=q.querySelector('.d6qf'),h=q.querySelector('.d6qh');if(!f||!h)return;const g=f.querySelector('.qago:not(.red)');if(!g)return;
  g.classList.remove('qago');g.classList.add('ckok');const x=h.querySelector(':scope>.lnk'),w=document.createElement('span');w.className='ckfa';if(x){h.insertBefore(w,x);w.appendChild(x)}else h.appendChild(w);w.appendChild(g);if(!f.querySelector('button'))f.style.display='none'}

/* v81.6 (خواسته صاحب اپ: «دکمه ارسال مثل دکمه کپی انیمیشن داشته باشد؛ همه دکمه‌ها»): بعد از زدن دکمه اصلی (بالا سمت چپ پنجره/صفحه، «افزودن» فرم‌ها)
   اگر کار انجام شد (پیام موفق، نه خطا) یک قرص سبز «✓ … شد» درست جای همان دکمه با فنر بالا می‌آید و محو می‌شود — حتی اگر پنجره همان لحظه عوض یا بسته شود.
   اگر خطا بود، دکمه می‌لرزد. پیام‌ها از toast (پیچیده شده) شناخته می‌شوند. */
let TOPCX=null;
const okWord=t=>{t=String(t||'');return /ارسال/.test(t)?'ارسال شد':/ذخیره/.test(t)?'ذخیره شد':/افزودن|اضافه/.test(t)?'اضافه شد':/ثبت|پایان/.test(t)?'ثبت شد':/کپی/.test(t)?'کپی شد':/ساخت/.test(t)?'ساخته شد':/دانلود/.test(t)?'آماده شد':'انجام شد'};
{const T0=toast;toast=function(m,bad){if(TOPCX){if(bad)TOPCX.bad=1;else TOPCX.ok=1}return T0.apply(this,arguments)}}
/* v81.7 (خواسته صاحب اپ: «مثل کپی، انیمیشن درون خود دکمه و بعد برگردد؛ دو بار زدن دو بار ثبت نکند»):
   - بازخورد داخل همان دکمه: سبز + «✓ … شد» و بعد ۱٫۳ ثانیه به حالت اول برمی‌گردد (btnOk). اگر پنجره همان لحظه عوض شد، دکمه‌ای با همان کار
     در همان صفحه پیدا می‌شود؛ وگرنه یک کپی از خود دکمه سر جای قبلی‌اش سبز می‌شود و محو می‌شود (نه قرص جدا).
   - قفل دو بار زدن: تا ۹۰۰ میلی‌ثانیه بعد از زدن یک دکمه اصلی، زدن دوباره هیچ دکمه اصلی‌ای اجرا نمی‌شود (زدن دوم روی دکمه تازه پنجره بعدی هم نه). */
const TOPSEL='#sheet .sh-h .xtop,#bar .hgo:not(.sec),.ckok,#sheet .xgo';let TOPLK=0;
function btnOk(el,w){if(!el||!el.isConnected)return;if(el._okH==null)el._okH=el.innerHTML;clearTimeout(el._okT);el.classList.add('cpdone');el.disabled=true;el.innerHTML=ic('check')+'<span>'+esc(w)+'</span>';
  try{navigator.vibrate&&navigator.vibrate(10)}catch(_){}el._okT=setTimeout(()=>{if(el._okH!=null){el.innerHTML=el._okH;el._okH=null}el.classList.remove('cpdone');el.disabled=false},1300)}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest(TOPSEL);if(!b||b.closest('#auth'))return;
  if(Date.now()<TOPLK||b.disabled){e.preventDefault();e.stopImmediatePropagation();return}TOPLK=Date.now()+900;
  const r=b.getBoundingClientRect(),cx={b,r,act:b.dataset.act,cl:b.cloneNode(true),t:b.textContent.trim(),ok:0,bad:0};TOPCX=cx;
  const fin=()=>{if(TOPCX===cx)TOPCX=null;if(cx.done)return;if(cx.bad){cx.done=1;if(cx.b.isConnected&&!RM()&&cx.b.animate)cx.b.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'translateX(0)'}],{duration:360,easing:'ease-out'});TOPLK=0;return}
    if(!cx.ok)return;cx.done=1;const w=okWord(cx.t);if(cx.b.isConnected){btnOk(cx.b,w);return}
    const same=[...document.querySelectorAll(TOPSEL)].find(z=>z.dataset.act===cx.act&&z.offsetParent);if(same){btnOk(same,w);return}topOk(cx,w)};
  setTimeout(fin,40);setTimeout(fin,650)},true);
/* دکمه دیگر نیست (پنجره بسته یا عوض شد): کپی همان دکمه سر جای قبلی‌اش سبز می‌شود و محو */
function topOk(cx,w){if(RM())return;const g=cx.cl,r=cx.r;g.removeAttribute('data-act');g.classList.add('cpdone','topghost');g.innerHTML=ic('check')+'<span>'+esc(w)+'</span>';
  g.style.cssText=`position:fixed;z-index:200;margin:0;top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;pointer-events:none`;document.body.appendChild(g);
  try{navigator.vibrate&&navigator.vibrate(10)}catch(_){}const a=g.animate([{opacity:1,transform:'scale(.96)'},{opacity:1,transform:'scale(1.04)',offset:.25},{opacity:1,transform:'scale(1)',offset:.45},{opacity:1,offset:.8},{opacity:0}],{duration:1200,easing:'ease-out'});a.onfinish=()=>g.remove();setTimeout(()=>g.remove(),1500)}

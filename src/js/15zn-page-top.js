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
  if(cur==='lday'){const d=hubData(ldKey);if(!d.rows.length)return '';
    if(d.dr.length&&can('split'))return P('hubSendAll','copy','ارسال'+(d.dr.length>1?' '+toFa(new Set(d.dr.map(p=>p.src.name)).size)+' منبع':''),{al:'کپی و ارسال'});
    if(d.sent&&!d.closed&&can('close'))return P('hubArch','check','بایگانی',{sec:d.pend,al:'بایگانی لیست'})}
  return ''}
function hdGoPut(){const B=$('bar');if(!B)return;B.querySelectorAll('.hgo').forEach(e=>e.remove());const h=hdGo();if(!h)return;let H=B.querySelector('.hbtns');if(!H){B.insertAdjacentHTML('beforeend','<span class="hbtns"></span>');H=B.querySelector('.hbtns')}H.insertAdjacentHTML('beforeend',h)}
/* بازسازی جزئی صفحه (بدون render): فقط وضعیت دکمه سرتیتر تازه می‌شود */
function hdGoSync(){try{hdGoPut()}catch(e){}}
/* کادرهای قدیمی ردیف سند (تخفیف، کالا، سکه، دریافت/پرداخت قدیمی): دکمه «افزودن/ذخیره» از پایین کادر به سرتیتر همان کادر، کنار «بستن/انصراف» */
function qfTop(){const q=$('qa');if(!q)return;const f=q.querySelector('.d6qf'),h=q.querySelector('.d6qh');if(!f||!h)return;const g=f.querySelector('.qago:not(.red)');if(!g)return;
  g.classList.remove('qago');g.classList.add('ckok');const x=h.querySelector(':scope>.lnk'),w=document.createElement('span');w.className='ckfa';if(x){h.insertBefore(w,x);w.appendChild(x)}else h.appendChild(w);w.appendChild(g);if(!f.querySelector('button'))f.style.display='none'}

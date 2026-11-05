/* ============ v78.8 (خواسته صاحب اپ: «پاک‌سازی صفحه‌های قدیمی») — انتقال «تسویه بدهی» قدیمی به حساب مشتری ============
   صفحه‌های تسویه بدهی (debt/cred/cwiz/pwiz) حذف شدند؛ داده‌ها (creds) دست نمی‌خورند. اگر هنوز حساب بدهی باز مانده باشد،
   در خانه یک کارت برای مدیر می‌آید: با تأیید، برای هر حساب باز (مانده = بدهی − واریزهای تأییدشده) در حساب مشتری هم‌نام
   (یا حساب تازه) یک سند خرید پولی به همان مانده ثبت می‌شود (بدهکاریم) و روی حساب قدیمی moved می‌خورد تا دوباره منتقل نشود. */
const oldDebts=()=>creds.filter(c=>c&&!c.moved&&cRem(c)>0);
function oldDebtCard(){const L=oldDebts();if(!L.length||!isAdmin())return '';const rem=L.reduce((s,c)=>s+cRem(c),0);
  return `<button class="lrow odb" data-act="oldDebtMove"><span class="ic gd">${ic('debt')}</span><span class="tx"><b>${fmt(L.length)} حساب «تسویه بدهی» قدیمی باز</b><small>مانده ${fmt(rem)} تومان · زدن = انتقال به حساب مشتری</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`}
ACT.oldDebtMove=()=>{const L=oldDebts();if(!L.length)return;
  askConfirm(`${fmt(L.length)} حساب بدهی قدیمی به حساب مشتری منتقل شود؟ برای هر کدام یک سند خرید به اندازه مانده‌اش (بدهکاریم) ثبت می‌شود:\n`+L.map(c=>'• '+(c.name||'بی‌نام')+': '+fmt(cRem(c))+' تومان'+(cWait(c)?' (واریز در انتظار '+fmt(cWait(c))+' جدا بررسی شود)':'')).join('\n'),'انتقال',()=>{
    let n=0;const now=new Date().toISOString();
    for(const c of L){const rem=cRem(c);if(!(rem>0))continue;
      const cu=cuFindBy({name:c.name,phone:c.phone})||cuMakeBy({name:c.name,title:c.title,phone:c.phone,iban:c.iban,card:c.card,holder:c.holder},'از تسویه بدهی قدیمی');
      const R=docMake(cu,s=>{s.dk='buy';s.date=todayISO();s.xr=depXr({amount:rem,items:[]});s.note='مانده حساب «تسویه بدهی» قدیمی'});
      if(!R||!R.t)continue;c.moved={cu:cu.id,tx:R.t.id,at:now,by:who(),amt:rem};n++;
      logA('debt','انتقال حساب بدهی قدیمی',(c.name||'')+' | '+fmt(rem)+' تومان → '+cuName(cu)+' | '+invTitle(R.t),{cu:cu.id,tx:R.t.id})}
    saveC();saveCu();render();toast(fmt(n)+' حساب منتقل شد ✓')})};

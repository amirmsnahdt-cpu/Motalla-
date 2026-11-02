/* ----- v70.4 (خواسته صاحب اپ): زدن بالای گوشی = لیست به بالا -----
   آیفون با لمس نوار ساعت فقط «اسکرول خود صفحه» را بالا می‌برد؛ اما در این برنامه صفحه ثابت است (#app fixed) و لیست‌ها
   داخل #view (یا یک پنجره پایین‌آمده) اسکرول می‌خورند، پس آن لمس کاری نمی‌کرد.
   راه: فقط روی آیفون/آیپد صفحه یک پیکسل جای اسکرول دارد و همیشه روی ۱ نگه داشته می‌شود (html.tt1). لمس نوار ساعت آن را به ۰ می‌برد؛
   این تغییر بدون هیچ لمسی روی صفحه = همان لمس نوار ساعت → لیستی که الان دیده می‌شود نرم به بالا می‌رود و صفحه دوباره روی ۱ می‌نشیند.
   در حالی که کیبورد باز است یا انگشت روی صفحه است کاری نمی‌کند (آیفون آن موقع‌ها خودش صفحه را جابه‌جا می‌کند).
   اندروید چنین حرکتی ندارد: آنجا (و آیفون هم) لمس جای خالی سرتیتر بالای صفحه همین کار را می‌کند. */
const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
/* لیستی که الان جلوی چشم است: پنجره باز (اگر چیزی در آن اسکرول خورده)، وگرنه صفحه، وگرنه لیست داخلی صفحه */
function topScroller(){const ov=$('ov'),sc=r=>r?[...r.querySelectorAll('*')].find(e=>e.scrollTop>0&&e.scrollHeight>e.clientHeight&&e.offsetParent):null;
  if(ov&&!ov.classList.contains('hide'))return sc(ov);const v=$('view');return v&&v.scrollTop>0?v:sc(v)}
function toTop(){const t=topScroller();if(!t)return;try{t.scrollTo({top:0,behavior:RM()?'auto':'smooth'})}catch(_){t.scrollTop=0}}
(()=>{
  /* لمس جای خالی سرتیتر (نه دکمه‌ها) = بالا — هر دو گوشی */
  const B=$('bar');if(B)B.addEventListener('click',e=>{if(e.target.closest('button,a,input,select,textarea,label,[data-act],[role="button"]'))return;toTop()});
  if(!IOS)return;document.documentElement.classList.add('tt1');
  const SE=()=>document.scrollingElement||document.documentElement;let touch=0,quiet=0;
  const field=()=>{const a=document.activeElement;return !!(a&&a.matches&&a.matches('input,textarea,select,[contenteditable="true"]'))};
  const park=()=>{if(touch||field())return;const s=SE();if(s.scrollHeight-s.clientHeight>=1&&s.scrollTop!==1)s.scrollTop=1};
  const later=ms=>{quiet=Date.now()+ms;setTimeout(park,ms)};
  addEventListener('touchstart',()=>{touch=1},{passive:true,capture:true});
  ['touchend','touchcancel'].forEach(n=>addEventListener(n,e=>{if(!e.touches||!e.touches.length){touch=0;later(450)}},{passive:true,capture:true}));
  /* کیبورد که بسته می‌شود آیفون صفحه را برمی‌گرداند؛ آن را با لمس نوار ساعت اشتباه نگیریم */
  document.addEventListener('focusout',()=>later(900));document.addEventListener('focusin',()=>{quiet=Date.now()+900});
  addEventListener('resize',()=>later(500));
  addEventListener('scroll',()=>{const s=SE();if(s.scrollTop>0||touch||field()||Date.now()<quiet)return;toTop();setTimeout(park,450)},{passive:true});
  park();setTimeout(park,400);addEventListener('load',()=>setTimeout(park,100));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')later(300)})})();

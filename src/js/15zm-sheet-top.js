/* ============ v80.3 (خواسته صاحب اپ: «دکمه بزرگ پایین پنجره‌ها در کل برنامه برود بالا سمت چپ برای ثبت») ============
   الگوی تازه پنجره‌ها: دکمه اصلی (کلاس xgo: ثبت، ذخیره، نمایش …) به‌جای نوار بزرگ پایین، یک دکمه فشرده در سرتیتر پنجره،
   سمت چپ کنار ×. یک جا برای همه پنجره‌ها: هر بار محتوای #sheet ساخته می‌شود همین کار انجام می‌شود (پنجره‌های تازه هم خودکار).
   فقط وقتی پنجره سرتیتر .sh-h و دقیقاً یک دکمه xgo دارد؛ همان دکمه جابه‌جا می‌شود (data-act، غیرفعال بودن و متنش همان می‌ماند). */
function sheetTop(){const S=$('sheet');if(!S)return;const H=S.querySelector('.sh-h');if(!H)return;const nh=b=>!b.closest('.sh-h');let G=[...S.querySelectorAll('.xgo')].filter(nh);/* v80.9: پنجره‌های بدون xgo — دکمه اصلی طلایی/سبز (ذخیره، نمایش، وارد شد…) هم بالا می‌رود */if(!G.length)G=[...S.querySelectorAll('.btn.gold,.btn.tlok2')].filter(nh).filter(b=>!b.closest('.ckfm'));if(G.length!==1)return;const g=G[0],par=g.parentElement;
  g.classList.add('xgo','xtop');g.classList.remove('btn','gold','tlok2');const x=[...H.children].find(e=>e.matches('.x,button[data-act="close"]'));if(x)H.insertBefore(g,x);else H.appendChild(g);
  if(par&&par!==S&&!par.children.length&&!par.textContent.trim())par.classList.add('xtop-empty')}
{const S=document.getElementById('sheet');if(S)new MutationObserver(()=>{try{sheetTop()}catch(e){}}).observe(S,{childList:true})}

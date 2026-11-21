/* ---- v61.88 جای مکان‌نما در فیلدهای قالب‌دار (شبا، کارت، مبلغ) ----
   رفع باگ: هر فیلدی که هنگام تایپ دوباره قالب می‌خورد (فاصله‌های شبا/کارت، ویرگول مبلغ) با نوشتن مقدار تازه
   مکان‌نما را به انتها می‌پراند؛ پس ویرایش یا افزودن رقم از وسط شماره ممکن نبود.
   یک بار برای همه فیلدها: قبل از اجرای oninput خود فیلد، تعداد رقم/حرف پیش از مکان‌نما ثبت می‌شود و بعد از آن
   مکان‌نما دقیقاً پشت همان رقم برمی‌گردد. پاک کردن روی فاصله یا ویرگول، رقم کنارش را پاک می‌کند (نه فقط جداکننده را). */
const CRT={el:null,n:0,end:true};
const crtSig=c=>/[0-9۰-۹٠-٩A-Za-z.\/]/.test(c);
const crtOk=t=>t&&t.tagName==='INPUT'&&/^(text|tel|search|)$/.test(t.type||'')&&!t.readOnly;
document.addEventListener('beforeinput',e=>{const t=e.target;if(!crtOk(t))return;let a,b;try{a=t.selectionStart;b=t.selectionEnd}catch(x){return}if(a==null||a!==b)return;const v=t.value;
  const sep=c=>c===' '||c===',';
  if(e.inputType==='deleteContentBackward'&&a>1&&sep(v[a-1])&&crtSig(v[a-2])){try{t.setSelectionRange(a-2,a)}catch(x){}}
  else if(e.inputType==='deleteContentForward'&&a<v.length-1&&sep(v[a])&&crtSig(v[a+1])){try{t.setSelectionRange(a,a+2)}catch(x){}}},true);
document.addEventListener('input',e=>{const t=e.target;CRT.el=null;if(!crtOk(t))return;let p;try{p=t.selectionStart}catch(x){return}if(p==null)return;const v=t.value;
  CRT.el=t;CRT.v=v;CRT.end=p>=v.length;CRT.n=[...v.slice(0,p)].filter(crtSig).length},true);
document.addEventListener('input',e=>{const t=e.target;if(t!==CRT.el)return;CRT.el=null;if(CRT.end||t.value===CRT.v||document.activeElement!==t)return;
  const v=t.value;let pos=0,c=0;while(pos<v.length&&c<CRT.n){if(crtSig(v[pos]))c++;pos++}try{t.setSelectionRange(pos,pos)}catch(x){}});

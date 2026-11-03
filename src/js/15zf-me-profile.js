/* ===== v76.1 (خواسته صاحب اپ): پروفایل کاربر — نام و عکس قابل ویرایش، عکس اضافه و حذف =====
   عکس = کلید همان انبار عکس‌ها (imgPut، روی سرور هم می‌رود)؛ کلید و نام با /api/profile روی کاربر سرور ذخیره می‌شود
   و در همه گوشی‌های همین کاربر (meUpdate در همگام‌سازی) دیده می‌شود. */
const meAvIn=()=>ME&&ME.av?`<img data-ik="${esc(ME.av)}" alt="">${esc(userInit(ME.name))}`:esc(userInit(ME?ME.name:''));
let MEF=null;
function meEditHTML(){const a=MEF.av;return `<div class="sh-h"><div><b>پروفایل من</b><small class="shsub"><bdi dir="ltr">@${esc(ME.username)}</bdi> · ${esc(ROLE[ME.role]||ME.role)}</small></div><button class="shsv" data-act="meSave" aria-label="ذخیره">${ic('check')}<span>ذخیره</span></button></div>
  <div class="f6 cuf2"><div class="c9hero mehero"><div class="cufp"><label class="cuav${a?' on':''}" aria-label="عکس پروفایل"><span class="cuavi">${a?`<img data-ik="${esc(a)}" alt="">`:`<b>${esc(userInit(MEF.name||'؟'))}</b>`}</span><span class="cuavb">${ic('cam')}</span><input type="file" accept="image/*" data-meph="1" class="fcov" aria-label="عکس پروفایل"></label>${a?`<button type="button" class="cuavx" data-act="meAvDel" aria-label="حذف عکس">${ic('trash')}</button>`:''}</div>
  <div class="c9ht"><b id="meHn">${esc(MEF.name||'')}</b><span>${a?'برای عوض کردن روی عکس بزنید':'روی دایره بزنید و عکس بگذارید'}</span></div></div>
  <div class="f6g"><div class="f6r"><label for="meN">نام</label><div class="f6i"><input id="meN" value="${esc(MEF.name||'')}" autocomplete="name" enterkeyhint="done" maxlength="60"></div></div></div></div>`}
function meRe(){const S=$('sheet');if(!S||!S.querySelector('.mehero'))return;const n=$('meN');if(n)MEF.name=n.value;sheetKeep(meEditHTML());meBind();phPaint(S)}
function meBind(){const n=$('meN'),h=$('meHn');if(n){n.oninput=()=>{MEF.name=n.value;if(h)h.textContent=n.value};n.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.meSave()}}}}
ACT.meEdit=()=>{if(!ME)return;MEF={name:ME.name||'',av:ME.av||''};sheet(meEditHTML());meBind();phPaint($('sheet'))};
ACT.meAvDel=()=>{if(!MEF)return;MEF.av='';meRe();toast('عکس برداشته شد · ذخیره را بزنید')};
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||!t.dataset||t.dataset.meph==null||!MEF)return;const f=t.files&&t.files[0];t.value='';if(!f)return;
  try{const d=await shrink(f),k=newImgKey('meav');if(!(await imgPut(k,d))){toast('حافظه پر است؛ عکس ذخیره نشد',true);return}MEF.av=k;meRe();toast('عکس گذاشته شد · ذخیره را بزنید')}catch(e){toast('این عکس خوانده نشد',true)}});
ACT.meSave=async()=>{if(!MEF)return;const n=$('meN'),name=clean(n?n.value:MEF.name);if(!name){toast('نام را بنویسید',true);if(n)n.focus();return}
  try{const j=await api('/api/profile',{name,av:MEF.av||''});ME={...ME,...j.user};rawSet('m_me',ME);user=ME.name;MEF=null;closeSheet();render();toast('پروفایل ذخیره شد ✓')}
  catch(e){toast((e&&e.message)||'ذخیره نشد؛ اینترنت را بررسی کنید',true)}};

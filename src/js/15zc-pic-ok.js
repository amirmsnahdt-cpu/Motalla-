/* v72.0 (خواسته صاحب اپ): بعد از گرفتن یا انتخاب عکس فیش، اول پیش‌نمایش دیده شود و با «تأیید و افزودن» اضافه شود.
   picOk(D,meta) → Promise<آرایه عکس‌های نگه‌داشته‌شده | null>؛ D = داده‌های کوچک‌شده (shrink). چند عکس: ورق زدن افقی و حذف تک‌تک. */
let PCF=null;
function pcfEl(){let z=$('pcf');if(!z){z=document.createElement('div');z.id='pcf';z.className='pcf hide';z.setAttribute('role','dialog');z.setAttribute('aria-modal','true');z.setAttribute('aria-label','پیش‌نمایش رسید');document.body.appendChild(z);
  z.addEventListener('scroll',ev=>{const s=ev.target;if(!PCF||!s.classList||!s.classList.contains('pcfs'))return;const w=s.clientWidth||1,i=Math.round(Math.abs(s.scrollLeft)/w);if(i!==PCF.i){PCF.i=Math.max(0,Math.min(PCF.D.length-1,i));pcfCnt()}},true)}return z}
function pcfCnt(){const c=$('pcfc');if(c&&PCF)c.textContent=PCF.D.length>1?toFa(PCF.i+1)+' از '+toFa(PCF.D.length):''}
function pcfDraw(){const z=pcfEl();if(!PCF)return;const n=PCF.D.length,m=PCF.m||{};
  z.innerHTML=`<div class="zvt"><button class="zb" data-act="pcfNo" aria-label="انصراف">×</button><span class="pcft"><b>پیش‌نمایش رسید</b><small id="pcfc"></small></span><span class="zsp"></span>${n>1?`<button class="zb" data-act="pcfDel" aria-label="برداشتن این عکس">${ic('trash')}</button>`:''}</div>
  <div class="pcfs" id="pcfs">${PCF.D.map((d,i)=>`<div class="pcfp"><img src="${d}" alt="عکس ${toFa(i+1)}" draggable="false"></div>`).join('')}</div>
  <div class="pcfb">${m.name?`<div class="pcfm"><span>${esc(m.name)}</span>${m.amount?`<b>${fmt(m.amount)} <i>تومان</i></b>`:''}</div>`:''}
  <div class="pcfa"><button class="pcfx" data-act="pcfNo">انصراف</button><button class="pcfo" data-act="pcfOk">${ic('check')} ${n>1?'تأیید و افزودن '+toFa(n)+' عکس':'تأیید و افزودن'}</button></div></div>`;
  z.classList.remove('hide');pcfCnt();const s=$('pcfs');if(s&&PCF.i)s.scrollLeft=(getComputedStyle(s).direction==='rtl'?-1:1)*PCF.i*s.clientWidth}
function picOk(D,meta){if(!D||!D.length)return Promise.resolve(null);if(PCF)pcfEnd(null);return new Promise(res=>{PCF={D:D.slice(),i:0,m:meta||{},res};pcfDraw();setTimeout(()=>{const b=document.querySelector('#pcf .pcfo');if(b)b.focus()},60)})}
function pcfEnd(v){const p=PCF;PCF=null;const z=$('pcf');if(z){z.classList.add('hide');z.innerHTML=''}if(p)p.res(v)}
ACT.pcfNo=()=>{pcfEnd(null);toast('عکس اضافه نشد')};
ACT.pcfOk=()=>{if(PCF)pcfEnd(PCF.D.slice())};
ACT.pcfDel=()=>{if(!PCF||PCF.D.length<2)return;PCF.D.splice(PCF.i,1);PCF.i=Math.min(PCF.i,PCF.D.length-1);pcfDraw()};
/* فایل‌های انتخاب‌شده → کوچک‌شده → پیش‌نمایش؛ خروجی آرایه داده‌های تأییدشده یا null */
async function picPrep(F,meta){const D=[];for(const f of F){try{D.push(await shrink(f))}catch(e){toast('این عکس خوانده نشد',true)}}return D.length?picOk(D,meta):null}

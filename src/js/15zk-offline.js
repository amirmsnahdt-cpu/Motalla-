/* ============ v79.4 (خواسته صاحب اپ: «بدون اینترنت کار کند و بعد از وصل شدن اطلاعات وارد شود») ============
   خود کار از قبل آماده بود: سرویس ورکر برنامه را بدون اینترنت باز می‌کند، هر تغییر در صف SY.pend و عکس‌ها در m_imgq
   روی گوشی می‌ماند و با رویداد online / هر همگام‌سازی به سرور می‌رود (ادغام سه‌طرفه با تغییرهای همکاران).
   این‌جا فقط دیده شدنش: نوار «بدون اینترنت» با شمار تغییرهای ذخیره‌شده روی گوشی، و بعد از وصل شدن پیام «به سرور رسید». */
let offSeen=0,offMax=0;
const offN=()=>{let n=0;try{n=Object.keys(SY.pend||{}).length+((ls.get('m_imgq',[])||[]).length)}catch(e){}return n};
function offPaint(){if(typeof SY==='undefined'||!TOKEN){const b=$('offb');if(b)b.remove();return}
  const off=SY.state==='off'||navigator.onLine===false,n=offN();let b=$('offb');
  if(off){if(!b){b=document.createElement('div');b.id='offb';b.setAttribute('role','status');document.body.appendChild(b)}
    b.innerHTML=`<span class="offi">${ic('refresh')}</span><span><b>بدون اینترنت</b><small>${n?fmt(n)+' تغییر روی گوشی ذخیره شده؛ با وصل شدن خودکار ارسال می‌شود':'کار را ادامه دهید؛ هر چه ثبت کنید روی گوشی می‌ماند و بعداً ارسال می‌شود'}</small></span>`;
    offSeen=1;offMax=Math.max(offMax,n);return}
  if(b)b.remove();
  if(offSeen&&SY.state==='ok'&&!offN()){const k=offMax;offSeen=0;offMax=0;toast(k?'اینترنت وصل شد؛ '+fmt(k)+' تغییر ذخیره‌شده به سرور رسید ✓':'اینترنت دوباره وصل شد')}}
window.addEventListener('offline',()=>{try{setSync('off')}catch(e){}});
window.addEventListener('online',()=>{try{offPaint()}catch(e){}});

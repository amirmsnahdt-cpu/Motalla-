/* v61.9: لیست‌های داخل صفحه که خودشان اسکرول می‌خورند (مثل لیست کالای «چه می‌فروشید؟»)
   - کشیدن انگشت روی آن‌ها فقط همان لیست را اسکرول می‌کند؛ صفحه (سرتیتر سند) دیگر پایین نمی‌آید
     (قبلاً حرکت «بستن صفحه با کشیدن» یا «کشیدن برای تازه‌سازی» صفحه، انگشت را از لیست می‌گرفت)
   - (v61.59) لیست کالا وقتی بالای خودش است: کشیدن به پایین مال صفحه است */
function inScr(t,stop){for(let el=t&&t.nodeType===1?t:t&&t.parentElement;el&&el!==stop&&el!==document.body;el=el.parentElement){
  if(el.classList.contains('dkl')){if(el.scrollTop>0)return el;continue}if(el.scrollHeight>el.clientHeight+1){const o=getComputedStyle(el).overflowY;if(o==='auto'||o==='scroll')return el}}return null}
/* v61.59 (خواسته صاحب اپ): کشیدن به پایین روی فهرست کالا وقتی بالای خودش است کل صفحه را پایین می‌آورد (نه فقط فهرست)؛
   چرخنده و تازه‌سازی جداگانه فهرست برداشته شد */

/* v61.9: لیست‌های داخل صفحه که خودشان اسکرول می‌خورند (مثل لیست کالای «چه می‌فروشید؟»)
   - کشیدن انگشت روی آن‌ها فقط همان لیست را اسکرول می‌کند؛ صفحه (سرتیتر سند) دیگر پایین نمی‌آید
     (قبلاً حرکت «بستن صفحه با کشیدن» یا «کشیدن برای تازه‌سازی» صفحه، انگشت را از لیست می‌گرفت)
   - لیست کالا وقتی بالای خودش است و پایین کشیده شود، چرخنده می‌آید، اطلاعات از سرور تازه می‌شود و لیست دوباره ساخته می‌شود */
function inScr(t,stop){for(let el=t&&t.nodeType===1?t:t&&t.parentElement;el&&el!==stop&&el!==document.body;el=el.parentElement){
  if(el.classList.contains('dkl'))return el;if(el.scrollHeight>el.clientHeight+1){const o=getComputedStyle(el).overflowY;if(o==='auto'||o==='scroll')return el}}return null}
(()=>{const TH=60,MAX=96;let g=null,busy=false;
  const spn=(el,mk)=>{let s=el.querySelector(':scope>.ispin');if(!s&&mk){s=document.createElement('div');s.className='ispin';s.innerHTML='<i class="pspin"></i>';el.prepend(s)}return s};
  document.addEventListener('touchstart',e=>{g=null;if(busy||e.touches.length!==1)return;const el=e.target.closest&&e.target.closest('#view .dkl');if(!el)return;const t=e.touches[0];g={el,x:t.clientX,y:t.clientY,lk:null,d:0}},{passive:true});
  tmAdd(e=>{if(!g)return;const t=e.touches[0],dx=t.clientX-g.x,dy=t.clientY-g.y;
    if(!g.lk){if(Math.abs(dx)<6&&Math.abs(dy)<6)return;g.lk=dy>0&&dy>Math.abs(dx)*1.2&&g.el.scrollTop<=0?'v':'x';if(g.lk==='v'){const s=spn(g.el,1);s.style.transition='none'}}
    if(g.lk!=='v')return;if(e.cancelable)e.preventDefault();g.d=Math.min(MAX,dy*0.5);const s=spn(g.el,1);s.style.height=g.d+'px';s.style.setProperty('--pp',Math.min(1,g.d/TH));
    if(g.d>=TH&&!g.hp){g.hp=1;try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}}});
  const end=async()=>{if(!g)return;const z=g;g=null;if(z.lk!=='v')return;const s=spn(z.el);if(!s)return;s.style.transition='';
    if(z.d<TH){s.style.height='0px';setTimeout(()=>{if(!s.classList.contains('spin'))s.remove()},220);return}
    busy=true;s.classList.add('spin');s.style.height='46px';s.style.setProperty('--pp',1);loading(true);const t0=Date.now();let r;
    try{r=TOKEN?await refreshAll():{off:true}}catch(_){r={off:true}}
    const w=600-(Date.now()-t0);if(w>0)await new Promise(x=>setTimeout(x,w));loading(false);busy=false;
    /* لیست با اطلاعات تازه دوباره ساخته می‌شود؛ متن جستجو و فوکوس سر جایش می‌ماند */
    const q=$('qKs');if(q&&cur==='sell'&&sv&&sv.qa){if(typeof qaRead==='function')qaRead();q.innerHTML=dkList()}else if(s.isConnected){s.style.height='0px';setTimeout(()=>s.remove(),220)}
    if(r)refreshMsg(r)};
  document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',end,{passive:true})})();

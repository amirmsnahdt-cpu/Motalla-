/* به‌روزرسانی خودکار: آخرین نسخه را مستقیم از GitHub می‌گیرد (بدون تأخیر کش githack) */

/* ---------- به‌روزرسانی: پیام داخل برنامه، با زدن به‌روز می‌شود ---------- */
let UPD=null,updT=0;
function updBar(){const au=document.getElementById('auth'),onAuth=au&&!au.classList.contains('hide'),B=onAuth?au:document.getElementById('bottom');if(!B)return;let el=document.getElementById('upd');if(!UPD){if(el)el.remove();return}
  if(!el){el=document.createElement('button');el.id='upd';el.type='button';el.setAttribute('data-act','applyUpd')}
  if(el.parentNode!==B)B.insertBefore(el,B.firstChild);
  el.innerHTML=`<span class="ui">${ic('refresh')}</span><span class="tx"><b>نسخه جدید آماده است</b><small>برای به‌روزرسانی بزنید · نسخه ${toFa(UPD.v)}</small></span><span class="go">به‌روزرسانی</span>`}
function updFound(v){if(!(v>APP_V)||(UPD&&UPD.v>=v))return;UPD={v};try{updBar()}catch(e){setTimeout(updBar,500)}}
function stashUpdate(h,nv){
  try{localStorage.removeItem('m_app_next');localStorage.setItem('m_app_next',h);localStorage.setItem('m_app_next_v',String(nv));localStorage.removeItem('m_app_next_c');return Promise.resolve(true)}
  catch(e){try{localStorage.removeItem('m_app_next')}catch(_){}}
  if(!window.caches)return Promise.resolve(false);
  return caches.open('motalla-upd').then(c=>c.put('next.html',new Response(h,{headers:{'Content-Type':'text/html; charset=utf-8'}}))).then(()=>{localStorage.setItem('m_app_next_v',String(nv));localStorage.setItem('m_app_next_c','1');return true}).catch(()=>false)}
function checkUpdate(force){if(!force&&Date.now()-updT<60e3)return;updT=Date.now();
  if(location.hostname==='raw.githack.com'){
    fetch('https://api.github.com/repos/'+REPO+'/commits/main',{cache:'no-store',headers:{Accept:'application/vnd.github+json'}}).then(r=>r.ok?r.json():null).then(j=>{const sha=j&&j.sha;if(!sha||!/^[0-9a-f]{40}$/.test(sha))return null;
      return fetch('https://raw.githack.com/'+REPO+'/'+sha+'/index.html',{cache:'no-store'}).then(r=>r.ok?r.text():null).then(h=>h&&h.replace(/(src|href)="(app\.js|styles\.css|apple-touch-icon\.png|icon-192\.png)/g,'$1="https://raw.githack.com/'+REPO+'/'+sha+'/$2'))}).then(h=>{if(!h||h.indexOf('</html>')<0)return;const m=h.match(/const APP_V=(\d+(?:\.\d+)?)/),nv=m?+m[1]:0;
      if(nv>APP_V)return stashUpdate(h,nv).then(()=>updFound(nv))}).catch(()=>{})}
  else if(location.protocol==='https:'){fetch('/api/status',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(j&&+j.v>APP_V)updFound(+j.v)}).catch(()=>{})}}
function applyUpd(){try{toast('در حال به‌روزرسانی…')}catch(e){}const r=()=>location.reload();
  if(location.hostname==='raw.githack.com'){setTimeout(r,150);return}
  try{navigator.serviceWorker.getRegistration().then(g=>g&&g.update()).catch(()=>{}).finally(()=>setTimeout(r,300))}catch(e){setTimeout(r,300)}}
setTimeout(()=>checkUpdate(true),1500);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkUpdate(false)});
setInterval(()=>{if(document.visibilityState==='visible')checkUpdate(false)},60e3);
window.addEventListener('pageshow',()=>checkUpdate(false));window.addEventListener('focus',()=>checkUpdate(false));window.addEventListener('online',()=>checkUpdate(true));
/* بعد از به‌روز شدن، یک پیام کوتاه نشان بده تا کاربر بداند نسخه جدید آمده */
setTimeout(()=>{try{const last=+localStorage.getItem('m_seen_v')||0;if(last&&APP_V>last)toast('برنامه به نسخه '+toFa(APP_V)+' به‌روز شد ✓');localStorage.setItem('m_seen_v',String(APP_V))}catch(e){}},1200);
(()=>{const V=()=>document.getElementById('view');const ws=window.scrollTo.bind(window);
  Object.defineProperty(window,'scrollY',{configurable:true,get:()=>{const v=V();return v?v.scrollTop:0}});
  window.scrollTo=function(a,b){const v=V();if(!v)return ws(a,b);if(typeof a==='object')v.scrollTo(a);else v.scrollTop=b||0}})();
const FA='۰۱۲۳۴۵۶۷۸۹';
const toEn=s=>String(s).replace(/[۰-۹]/g,d=>FA.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const toFa=s=>String(s).replace(/\d/g,d=>FA[d]);
const fmt=n=>toFa(Number(n||0).toLocaleString('en-US'));
/* v61.56 (خواسته صاحب اپ): عدد مبلغ هر چه بزرگ‌تر شود در قاب خودش جا می‌شود و بیرون نمی‌زند.
   fitW = چند درصد عرض قاب برای هر «em» قلم؛ از تعداد رقم و جداکننده‌ها حساب می‌شود (رقم ۱، ویرگول و نقطه کمتر).
   CSS: font-size:min(بیشینه, calc(var(--fw)*1cqi)) داخل عنصری با container-type:inline-size */
const fitW=s=>{const t=String(s==null?'':s).replace(/<[^>]*>/g,'');let u=0;for(const ch of t)u+=/[0-9۰-۹]/.test(ch)?1:/[,٬.٫:\s]/.test(ch)?.4:.8;return Math.round(100/(Math.max(5,u)*.7)*10)/10},fitS=s=>` style="--fw:${fitW(s)}"`;
const num=s=>parseInt(toEn(s).replace(/\D/g,''),10)||0;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clean=s=>s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200e\u200f]/gu,'').replace(/\s+/g,' ').trim();
const $=id=>document.getElementById(id);
const p2=n=>String(n).padStart(2,'0');
const BANKS={'010':'مرکزی','011':'صنعت و معدن','012':'ملت','013':'رفاه','014':'مسکن','015':'سپه','016':'کشاورزی','017':'ملی','018':'تجارت','019':'صادرات','020':'توسعه صادرات','021':'پست بانک','022':'توسعه تعاون','051':'موسسه توسعه','053':'کارآفرین','054':'پارسیان','055':'اقتصاد نوین','056':'سامان','057':'پاسارگاد','058':'سرمایه','059':'سینا','060':'مهر ایران','061':'شهر','062':'آینده','063':'انصار','064':'گردشگری','065':'حکمت','066':'دی','069':'ایران زمین','070':'رسالت','073':'مهر'};
const ALIAS={'بلو':'سامان','مهرایران':'مهر','پستبانک':'پست'};
const canon=s=>{s=String(s||'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/بانک|\s|\u200c/g,'');return ALIAS[s]||s};
const BANKOPTS=[...new Set(Object.values(BANKS).concat(['بلو']))];
const ibanFmt=i=>/^IR\d{24}$/.test(i);
let ibanOk=i=>{if(!ibanFmt(i))return false;const s=i.slice(4)+'1827'+i.slice(2,4);let r=0;for(const c of s)r=(r*10+ +c)%97;return r===1};
const ibanBank=i=>ibanFmt(i)?BANKS[i.slice(4,7)]||'':'';
const BKC={'ملی':'#1d4f91','ملت':'#c8102e','صادرات':'#1f3a8a','تجارت':'#1660b8','سپه':'#e0a400','کشاورزی':'#1f8a3c','مسکن':'#e3731b','رفاه':'#1b7fa6','پاسارگاد':'#c9a000','سامان':'#1a5fb4','پارسیان':'#9b1b30','اقتصاد نوین':'#6b2c91','سینا':'#0e7c86','شهر':'#d0312d','آینده':'#ef7d00','رسالت':'#2e9e4f','مهر ایران':'#0f8f6f','دی':'#1d6fb8','پست بانک':'#2f7d32','کارآفرین':'#00788a','سرمایه':'#b8860b','ایران زمین':'#7a4b9d','گردشگری':'#0f6e8c','صنعت و معدن':'#355c7d','توسعه صادرات':'#2b5d8a','توسعه تعاون':'#3b8f5a','حکمت':'#5a6b7d','انصار':'#2c7a3f','مرکزی':'#33415c','مهر':'#0f8f6f','موسسه توسعه':'#5a6b7d'};
const BKL={'ملی':'Melli','ملت':'Mellat','صادرات':'Saderat','تجارت':'Tejarat','سپه':'Sepah','کشاورزی':'Keshavarzi','مسکن':'Maskan','رفاه':'Refah','پاسارگاد':'Pasargad','سامان':'Saman','پارسیان':'Parsian','اقتصاد نوین':'Eghtesad_Novin','سینا':'Sina','شهر':'Shahr','آینده':'Ayandeh','رسالت':'Resalat','مهر ایران':'Mehr_Iran','مهر':'Mehr_Iran','دی':'Dey','پست بانک':'Postbank','کارآفرین':'Karafarin','سرمایه':'Sarmayeh','ایران زمین':'Iran_Zamin','گردشگری':'Gardeshgari','صنعت و معدن':'Sanat_Madan','توسعه صادرات':'Tosee_Saderat','توسعه تعاون':'Tosee_Taavon','حکمت':'Hekmat','انصار':'Ansar','مرکزی':'Bank_Markazi','موسسه توسعه':'Tosee','ملل':'Melall','کوثر':'Kosar','نور':'Noor','خاورمیانه':'Khavar_Mianeh','قوامین':'Ghavamin','کاسپین':'Caspian'};
function bankBadge(b,cls){b=String(b||'').replace(/^بانک\s*/,'').trim();if(!b)return '';const k=Object.keys(BKC).concat(Object.keys(BKL)).find(n=>canon(n)===canon(b))||b,c=BKC[k]||'#64748b',t=k==='مهر ایران'?'مه':k==='ملی'?'ملی':k==='ملت'?'ملت':[...k][0],f=BKL[k];
  return f?`<img class="bkb bki${cls?' '+cls:''}" src="banks/${f}.svg" alt="${esc(k)}" title="بانک ${esc(k)}" loading="lazy" decoding="async" onerror="this.outerHTML='<span class=&quot;bkb${cls?' '+cls:''}&quot; style=&quot;--bc:${c}&quot;>${esc(t)}</span>'">`:`<span class="bkb${cls?' '+cls:''}" style="--bc:${c}" title="بانک ${esc(k)}">${esc(t)}</span>`}
{const _ok=ibanOk,M=new Map();ibanOk=i=>{if(M.has(i))return M.get(i);const v=_ok(i);if(M.size>5000)M.clear();M.set(i,v);return v}}
/* شماره حساب از شبا: هر بانک قالب خودش را دارد؛ فقط قالب‌های مطمئن، وگرنه خالی (عدد غلط بدتر از نبودن است).
   شبا = IR + ۲ رقم کنترل + ۳ رقم کد بانک + ۱۹ رقم. ملت: ۰۰ + نوع + ۰۰۰۰۰۰ + ۱۰ رقم حساب (مثل 0120 0200 0000 2847 0858 60 ← 2847085860). */
const ACCT_RULE={'012':c=>/^00\d0{6}\d{10}$/.test(c)?c.slice(-10):''};
const acctOf=i=>{if(!ibanFmt(i))return '';const f=ACCT_RULE[i.slice(4,7)];return f?f(i.slice(7)):''};
const bankKey=e=>canon(ibanFmt(e.iban)?ibanBank(e.iban):e.bank);
const luhn=c=>{let s=0;for(let i=0;i<c.length;i++){let d=+c[c.length-1-i];if(i%2){d*=2;if(d>9)d-=9}s+=d}return s%10===0};
const dg=v=>toEn(v).toUpperCase().replace(/^\s*IR/,'').replace(/\D/g,'');
const grp4=d=>d.replace(/(\d{4})(?=\d)/g,'$1 ');
const ibanGroups=d=>{d=String(d||'').replace(/\D/g,'').slice(0,24);if(d.length<=2)return d;return d.slice(0,2)+' '+(d.slice(2).match(/.{1,4}/g)||[]).join(' ')};
const spans=a=>a.map(x=>`<span>${x}</span>`).join('');
const cpIb=d=>d?`<span class="cp ib" data-cp="${d}" title="لمس برای کپی">${spans(ibanGroups(d).split(' '))}</span>`:'—';
const cpCard=d=>d?`<span class="cp" data-cp="${d}" title="لمس برای کپی">${spans(d.match(/\d{1,4}/g)||[])}</span>`:'—';
const cpPlain=d=>d?`<span class="cp" data-cp="${d}" title="لمس برای کپی">${d}</span>`:'—';
const IC={x:'<path d="M6 6l12 12M18 6L6 18"/>',bank:'<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 20h18"/>',back:'<path d="M9 5l7 7-7 7"/>',plus:'<path d="M12 5v14M5 12h14"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',split:'<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',chev:'<path d="M6 9l6 6 6-6"/>',check:'<path d="M5 13l4 4L19 7"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',sort:'<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>',undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/>',restore:'<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',paste:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/>',refresh:'<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/>',open:'<path d="M14 4h6v6M20 4l-9 9M19 14v6H4V5h6"/>',debt:'<path d="M4 7h11a3 3 0 010 6H8"/><path d="M8 10l-3 3 3 3"/><path d="M20 17H9"/><path d="M17 14l3 3-3 3"/>',cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',track:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 12l2 2 4-4"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const norm=s=>toEn(String(s==null?'':s)).toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک');
/* هایلایت متن با حفظ امنیت HTML */
function hl(text,q){const t=String(text==null?'':text);if(!q)return esc(t);const tn=norm(t),qn=norm(q);if(!qn)return esc(t);let out='',i=0,k;
  while((k=tn.indexOf(qn,i))>-1){out+=esc(t.slice(i,k))+'<mark>'+esc(t.slice(k,k+qn.length))+'</mark>';i=k+qn.length}return out+esc(t.slice(i))}
let toastAct=null;
function toast(m,bad,actLabel,actFn){const t=$('toast');toastAct=actFn||null;m=String(m||'').replace(/\s*✓\s*/g,' ').replace(/\s+—\s*$/,'').trim();
  const kind=bad?'bad':/(شد|ذخیره|ثبت|کپی|به‌روز|اضافه|آماده|تأیید)/.test(m)?'ok':'info',I={ok:'<path d="M5 13l4 4L19 7"/>',bad:'<path d="M12 7v6M12 17h.01"/>',info:'<path d="M12 11v6M12 7h.01"/>'}[kind];
  t.innerHTML=`<span class="ti"><svg viewBox="0 0 24 24" aria-hidden="true">${I}</svg></span><span class="tm">${esc(m)}</span>${actLabel?`<button data-act="toastAct">${esc(actLabel)}</button>`:''}`;
  t.style.display='';t.className='';void t.offsetWidth;t.className='show '+kind;clearTimeout(toast.t);toast.t=setTimeout(toastHide,actLabel?5200:bad?3400:2100)}
function toastHide(){const t=$('toast');if(!t)return;t.classList.remove('show');toastAct=null}
(()=>{const t=$('toast');if(!t)return;let y0=null;t.addEventListener('click',e=>{if(!e.target.closest('button'))toastHide()});t.addEventListener('touchstart',e=>{y0=e.touches[0].clientY},{passive:true});t.addEventListener('touchmove',e=>{if(y0!=null&&e.touches[0].clientY-y0<-14){toastHide();y0=null}},{passive:true})})();
document.addEventListener('click',async e=>{const c=e.target.closest&&e.target.closest('.cp,.kc');if(!c)return;const t=c.dataset.cp;/* v60.7: ردیف کپی‌شده: آیکن کپی همان‌جا به «✓ کپی شد» تبدیل می‌شود و بعد برمی‌گردد */c.classList.remove('cpok');void c.offsetWidth;c.classList.add('cpok');const k=c.querySelector('.kcp');if(k){if(!k._ic)k._ic=k.innerHTML;k.innerHTML=ic('check')+'<em>کپی شد</em>';clearTimeout(k._t);k._t=setTimeout(()=>{k.innerHTML=k._ic;c.classList.remove('cpok')},1500)}else setTimeout(()=>c.classList.remove('cpok'),900);try{navigator.vibrate&&navigator.vibrate(10)}catch(_){}try{await navigator.clipboard.writeText(t);toast('کپی شد ✓ '+t)}catch(x){const r=document.createRange();r.selectNodeContents(c);const sl=window.getSelection();sl.removeAllRanges();sl.addRange(r);toast('انتخاب شد؛ دستی کپی کنید')}});
/* ============ ذخیره‌سازی ============ */
let storeOK=true;
let _vc=null,_vcE=null,_vcN=-1,_stm=null;const memoClear=()=>{_vc=null;_stm=null};
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){storeOK=false;return d}},set(k,v){memoClear();try{localStorage.setItem(k,JSON.stringify(v))}catch(e){storeOK=false}}};
const isoAdd=(iso,n)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const todayISO=()=>{const d=new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const JM=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const GM=['January','February','March','April','May','June','July','August','September','October','November','December'];
function j2g(jy,jm,jd){jy+=1595;let days=-355668+(365*jy)+(~~(jy/33))*8+~~(((jy%33)+3)/4)+jd+((jm<7)?(jm-1)*31:((jm-7)*30)+186);let gy=400*~~(days/146097);days%=146097;
  if(days>36524){gy+=100*~~(--days/36524);days%=36524;if(days>=365)days++}gy+=4*~~(days/1461);days%=1461;if(days>365){gy+=~~((days-1)/365);days=(days-1)%365}
  let gd=days+1;const sal=[0,31,((gy%4==0&&gy%100!=0)||gy%400==0)?29:28,31,30,31,30,31,31,30,31,30,31];let gm=0;for(gm=0;gm<13&&gd>sal[gm];gm++)gd-=sal[gm];return[gy,gm,gd]}
const G2J_C=new Map();
function g2j(iso){const c=G2J_C.get(iso);if(c)return c.slice();const r=g2j0(iso);if(G2J_C.size>3000)G2J_C.clear();G2J_C.set(iso,r.slice());return r}
function g2j0(iso){let r;try{const o={};new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn',{year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date(iso+'T12:00:00')).forEach(x=>o[x.type]=+x.value);r=[o.year||o.relatedYear,o.month,o.day]}catch(e){}
  if(r&&r.every(n=>n>0)&&r[0]>1200&&r[0]<1700)return r;
  const[gy,gm,gd]=iso.split('-').map(Number),gdm=[0,31,59,90,120,151,181,212,243,273,304,334],g2=gm>2?gy+1:gy;let days=355666+365*gy+~~((g2+3)/4)-~~((g2+99)/100)+~~((g2+399)/400)+gd+gdm[gm-1],jy=-1595+33*~~(days/12053);days%=12053;jy+=4*~~(days/1461);days%=1461;if(days>365){jy+=~~((days-1)/365);days=(days-1)%365}
  return days<186?[jy,1+~~(days/31),1+days%31]:[jy,7+~~((days-186)/30),1+(days-186)%30]}
/* v58.9: هر تاریخ یک بار محاسبه می‌شود (ساختن Intl.DateTimeFormat در هر بار صدا زدن، رسم لیست‌ها را کند می‌کرد) */
/* v58.9: گوش دادن «مسدودکننده» به حرکت انگشت (برای کشیدن پنجره، کشیدن برای تازه‌سازی، بستن صفحه با کشیدن به پایین، برگشت از لبه)
   فقط وقتی لازم است وصل می‌ماند: بالای صفحه یا وقتی پنجره باز است. وقتی صفحه پایین‌تر اسکرول شده، آیفون بی‌معطلی اسکرول می‌کند
   (قبلاً هر حرکت انگشت در هر جای برنامه منتظر جاوااسکریپت می‌ماند → اسکرول گیر می‌کرد و یک‌باره می‌پرید). */
const TMV=[];let tmOn=false;
function tmMove(e){for(const f of TMV)f(e)}
function tmAdd(fn){TMV.push(fn);tmSync()}
function tmSync(){const v=document.getElementById('view'),ov=document.getElementById('ov'),n=!v||v.scrollTop<=1||!!(ov&&!ov.classList.contains('hide'))||!!(v&&v.querySelector('.dkl'));
  if(n===tmOn)return;tmOn=n;if(n)document.addEventListener('touchmove',tmMove,{passive:false});else document.removeEventListener('touchmove',tmMove,{passive:false})}
const DATES_C=new Map();
function dates(v){if(v){let c=DATES_C.get(v);if(!c){c=dates0(v);if(DATES_C.size>3000)DATES_C.clear();DATES_C.set(v,c)}return {...c}}return dates0(v)}
function dates0(v){const d=v?new Date(v+'T12:00:00'):new Date(),iso=d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()),[jy,jm,jd]=g2j(iso);return{fa:toFa(jd)+' '+JM[jm-1]+' '+toFa(jy),en:new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric'}).format(d),iso,jd,jm,jy,wd:new Intl.DateTimeFormat('fa-IR',{weekday:'long'}).format(d)}}
function relDay(iso){const t=todayISO();if(iso===t)return 'امروز';const y=new Date(t+'T12:00:00');y.setDate(y.getDate()-1);const yi=y.getFullYear()+'-'+p2(y.getMonth()+1)+'-'+p2(y.getDate());if(iso===yi)return 'دیروز';const f=new Date(t+'T12:00:00');f.setDate(f.getDate()+1);if(iso===f.getFullYear()+'-'+p2(f.getMonth()+1)+'-'+p2(f.getDate()))return 'فردا';return dates(iso).wd}
let dateVal=todayISO();
const stripName=s=>{let c=clean(String(s||''));const tg=c.match(/^[A-Za-z][A-Za-z0-9 ._'’()\-]{0,40}?\s*[:：]\s*(.+)$/);if(tg&&/[\u0600-\u06FF]/.test(tg[1]))c=tg[1].trim();const t=c.replace(/^[\s\-–—:•▪*.)(]*(?:واریزی|واریز)(?:\s+(?:بانکی|بانک))?\s*[:：\-–—]?\s+/,'').trim();return t||c};
let entries=ls.get('m_entries',[]).map(e=>({...e,entryDate:e.entryDate||dateVal,name:stripName(e.name)}));
let sources=ls.get('m_sources',[{id:1,name:'بانک سینا',bank:'سینا',limit:0,count:0},{id:2,name:'بانک ملی',bank:'ملی',limit:0,count:0},{id:3,name:'سینا فلاح',bank:'',limit:0,count:0},{id:4,name:'بلو بانک',bank:'بلو',limit:0,count:0}]);
let trash=ls.get('m_trash',[]);
let audit=ls.get('m_audit',[]),user=ls.get('m_user',''),nid=Date.now()*1000+Math.floor(Math.random()*1000),editId=null,alloc=null;
let listMode='all',listQ='',listSort=ls.get('m_sort','seq'),listFilter='all',openGroups=new Set(),lastList=[],histTab='ev',histFilter='all';
const saveE=()=>ls.set('m_entries',entries),saveS=()=>ls.set('m_sources',sources),saveAud=()=>ls.set('m_audit',audit),saveT=()=>ls.set('m_trash',trash);
/* پاکسازی خودکار سطل بازیابی بعد از ۶۰ روز */
(()=>{const lim=Date.now()-60*864e5,n=trash.length;trash=trash.filter(x=>!x.deletedAt||new Date(x.deletedAt).getTime()>lim);if(trash.length!==n)saveT()})();
const who=()=>user||'کاربر نامشخص';
const pick=e=>({id:e.id,name:e.name,code:e.code,amount:e.amount,iban:e.iban,card:e.card||'',bank:e.bank||'',entryDate:e.entryDate,payDate:e.payDate||''});
function logA(type,summary,detail,extra){audit.unshift({id:nid++,type,user:who(),ts:new Date().toISOString(),summary,detail:detail||'',...(extra||{})});audit=audit.slice(0,400);saveAud()}
function trashIds(ids,reason){const S=new Set(ids.map(String)),now=new Date().toISOString(),moved=[];entries=entries.filter(e=>{if(S.has(String(e.id))){moved.push({...e,deletedAt:now,deletedBy:who(),reason});return false}return true});trash=moved.concat(trash).slice(0,500);saveE();saveT();alloc=null;return moved}
function restoreIds(ids){const S=new Set(ids.map(String)),back=[];trash=trash.filter(t=>{if(S.has(String(t.id))&&!entries.some(e=>e.id===t.id)){const{deletedAt,deletedBy,reason,...e}=t;back.push(e);return false}return !S.has(String(t.id))});entries=entries.concat(back);saveE();saveT();alloc=null;return back}
/* ============ اعتبارسنجی و پارس ============ */
const dayEntries=()=>entries.filter(e=>e.entryDate===dateVal);
function validated(){if(_vc&&_vcE===entries&&_vcN===entries.length)return _vc;const L=validated0();_vc=L;_vcE=entries;_vcN=entries.length;queueMicrotask(memoClear);return L}
function validated0(){
  const L=entries.map(e=>{const SC=(e.settles||[]),st=SC.reduce((s,x)=>s+(+x.amount||0),0),t=+e.amount||0;return{...e,issues:[],level:0,total:t,settles:SC,stlW:(e.settles||[]).filter(x=>x.st==='wait'),settled:st,amount:Math.max(0,t-st),full:st>0&&st>=t}}),codes={},keys={},seqs={};
  for(const r of L){const bad=t=>{r.issues.push(t);r.level=2},warn=t=>{r.issues.push(t);r.level=Math.max(r.level,1)};
    r.seq=seqs[r.entryDate]=(seqs[r.entryDate]||0)+1;
    if(!r.name)bad('نام ندارد');if(!(r.total>0))bad('مبلغ نامعتبر');if(r.settled>r.total)bad('مبلغ تسویه با مشتری از مبلغ کل بیشتر است');
    if(!r.iban)bad('شماره شبا ندارد');else if(!ibanFmt(r.iban))bad('شماره شبا اشتباه است (باید ۲۴ رقم باشد)');else if(!ibanOk(r.iban))bad('شماره شبا اشتباه است (رقم کنترلی نمی‌خواند)');
    /* بخش‌های «پرداخت از چند منبع» (splitOf) همان فاکتور و شبای واریزی اصلی را دارند و تکراری حساب نمی‌شوند */
    if(!r.code)warn('شماره فاکتور ندارد');else if(!r.splitOf)(codes[r.entryDate+'|'+r.code]=codes[r.entryDate+'|'+r.code]||[]).push(r);
    if(r.card){if(r.card.length!==16)warn('شماره کارت باید ۱۶ رقم باشد');else if(!luhn(r.card))warn('شماره کارت نامعتبر (رقم کنترلی)')}
    if(!r.bank&&!ibanBank(r.iban)&&ibanFmt(r.iban))warn('بانک مقصد از روی شبا تشخیص داده نشد');
    else if(r.bank&&ibanFmt(r.iban)&&ibanBank(r.iban)&&canon(r.bank)!==canon(ibanBank(r.iban)))warn('بانک واردشده ('+r.bank+') با بانک شبا ('+ibanBank(r.iban)+') نمی‌خواند');
    const k=r.entryDate+'|'+r.iban+'|'+r.amount;if(!r.splitOf)(keys[k]=keys[k]||[]).push(r)}
  for(const c in codes)if(codes[c].length>1)codes[c].forEach(r=>{r.issues.push('شماره فاکتور تکراری');r.level=2});
  for(const k in keys)if(keys[k].length>1)keys[k].forEach(r=>{r.issues.push('شبا و مبلغ تکراری');r.level=Math.max(r.level,1)});
  const PC={};L.forEach(r=>{if(r.splitOf!=null)PC[r.splitOf]=(PC[r.splitOf]||1)+1});
  L.forEach(r=>{r.bankShow=ibanBank(r.iban)||r.bank;r.acct=acctOf(r.iban);r.card=r.card||'';const pk=r.splitOf!=null?r.splitOf:r.id;if(PC[pk])r.pcs=PC[pk]});return L}
const dayList=()=>validated().filter(r=>r.entryDate===dateVal);
const sum=a=>a.reduce((s,r)=>s+(r.amount||0),0);
/* تاریخ‌هایی که لیست دارند (جدیدترین اول) */
function datesWith(){const V=validated(),m={};V.forEach(r=>{const o=m[r.entryDate]=m[r.entryDate]||{iso:r.entryDate,n:0,s:0,bad:0};o.n++;o.s+=r.amount||0;if(r.level===2)o.bad++});return Object.values(m).sort((a,b)=>a.iso<b.iso?1:-1)}
function parse(text){
  const lines=toEn(text).split(/\r?\n/).map(clean).filter(Boolean),recs=[];let cur=null;
  for(const ln of lines){const ns=ln.replace(/\s/g,'').toUpperCase();
    if(/^(IR)?\d{20,28}$/.test(ns)){const ib=ns.startsWith('IR')?ns:'IR'+ns;if(cur&&!cur.iban)cur.iban=ib;else{cur={name:'',code:'',amount:0,bank:'',iban:ib};recs.push(cur)}continue}
    if(/^\d{1,2}\s*(mehr|m|مهر)?$/i.test(ln)||/^\d{1,2}\s*(mehr|مهر)\b/i.test(ln))continue;
    if(/^\d[\d\/.,]*\s*(t|تومان|ت)?$/i.test(ln)&&ln.replace(/\D/g,'').length>=5){if(cur&&!cur.amount)cur.amount=num(ln);continue}
    const m=ln.match(/^(.*[^\d\s])\s+(\d{3,6})$/);
    if(m){cur={name:stripName(m[1]),code:m[2],amount:0,bank:'',iban:''};recs.push(cur);continue}
    if(cur&&!cur.iban)cur.bank=ln}
  return recs}
/* ============ تاریخ سراسری (هماهنگ در همه بخش‌ها) ============ */
function setDate(iso,quiet){if(!iso)return;const keep={};['fn','fc','fa','fi','fk','bulk'].forEach(i=>{const el=$(i);if(el)keep[i]=el.value});
  const changed=iso!==dateVal;dateVal=iso;ls.set('m_date',iso);if(changed)alloc=null;
  if(cur==='split3'||cur==='srcview')cur='split1';
  render();
  Object.keys(keep).forEach(i=>{const el=$(i);if(el&&keep[i]!=='')el.value=keep[i]});if($('fk'))$('fk').oninput();if($('fi')&&$('fi').value)ibanLive();
  const c=document.querySelector('.dchip');if(c){c.classList.remove('flash');void c.offsetWidth;c.classList.add('flash')}
  if(!quiet){const n=dayEntries().length;toast(dates(iso).fa+' — '+(n?fmt(n)+' واریزی':'لیست خالی'))}}

/* عنوان و نحوه تسویه */
const FEM=new Set('مریم فاطمه زهرا سمیه زینب معصومه طاهره شکوفه مهدیه نرگس فریبا افسانه مینا مبینا یگانه شیما زهره سکینه الهام مهسا سارا نازنین نگار لیلا نسرین پروین فرزانه فرشته اعظم اکرم منیژه شهلا ژاله رویا هانیه حدیثه ریحانه کوثر عاطفه سمانه صدیقه طیبه ناهید مهناز مهری پریسا پگاه آزاده آتنا آیدا ستاره سحر هما هدی نیلوفر الناز ساناز شبنم شیرین فرناز بهاره بهناز ترانه تینا سپیده صبا غزاله کبری گلناز لادن محبوبه مرضیه منصوره نجمه نفیسه وحیده یاسمن راضیه رقیه زری سهیلا سوسن فهیمه کیانا مائده ملیکه نوشین هستی خدیجه آمنه اشرف بتول ثریا جمیله حمیده حوریه خاطره دنیا ربابه رحیمه رضوان زیبا سمیرا شهناز صغری عفت فائزه فریده لیلی محدثه ملیحه منیره نادیا نرجس هاجر یاسمین پرستو گلاره آذر مژگان مهتاب ماهرخ شکیبا کیمیا تهمینه عطیه شقایق سیده بانو خانم ملیکا آوا النا رها هلیا ثمین نیوشا مهشید فرحناز شیدا مهرنوش پوران فروغ مرجان'.split(' '));
const MAL=new Set('علی محمد حسن حسین رضا مهدی امیر احمد جواد سعید مجید حمید محمود قاسم یوسف سهیل بشیر علیرضا امیرحسین امیرعلی محمدرضا محمدحسین سینا داوود داود کریم ناصر مسعود مصطفی مرتضی ابراهیم اسماعیل عباس جعفر صادق کاظم هادی محسن بهروز بهزاد فرهاد فرزاد کامران کیوان پیمان پویا آرش بابک نیما سامان میلاد وحید حامد عرفان امید سجاد مهران رامین شهرام اکبر اصغر غلامرضا منصور نادر هوشنگ پرویز یعقوب موسی عیسی ایمان یاسر فرشید کورش حسام مهرداد بهنام روح‌الله ابوالفضل میثم مهیار آرمین آریا دانیال شهاب شایان طاها عماد فرید کمال مجتبی نوید هومن یزدان سیاوش رسول جلال جمال اسد منوچهر سید آقا حاج حاجی مصطفی مهدیار ماهان سپهر بردیا امین رحیم رحمان صمد عبدالله'.split(' '));
function gender(n){const t=String(n||'').replace(/\u200c/g,'‌').trim().split(/\s+/);if(!t[0])return '';let f=t[0];if(f==='سیده')return 'f';if(f==='سید'||f==='حاج'||f==='حاجی')return 'm';if(FEM.has(f))return 'f';if(MAL.has(f))return 'm';const f2=f.replace(/‌/g,'');if(FEM.has(f2))return 'f';if(MAL.has(f2)||/^(محمد|علی|امیر|ابو|عبد|غلام)/.test(f2))return 'm';return ''}
const honor=n=>{const g=gender(n);return g==='m'?'جناب آقای':g==='f'?'سرکار خانم':''};
const honTag=n=>{const h=honor(n);return h?`<small class="hon">${h}</small>`:''};
const fullName=r=>(r.name||'');
const setLine=x=>x.name+(x.phone?' ('+x.phone+')':'')+(x.inv?' — فاکتور فروش '+x.inv:'')+' — '+Number(x.amount||0).toLocaleString('en-US')+' تومان';
/* ============ مسیریابی (نوار پایین) ============ */
let cur='home',editBack=null,noAnim=false,turnDir=0;
const TAB={custs:'custs',cust:'custs',sell:'custs',inv:'custs',banks:'banks',buy:'home',ent:'home',find:'home',home:'home',entry:'home',bulk:'home',list:'home',split1:'home',split3:'home',srcview:'home',part:'home',track:'home',batch:'home',day:'home',debt:'settings',cred:'settings',cwiz:'settings',pwiz:'settings',audit:'audit',users:'settings',settings:'settings',backups:'settings'};
const PARENT={lday:'split1',cust:'custs',sell:'custs',inv:'cust',debt:'settings',track:'split1',bulk:'home',buy:'home',ent:'home',find:'home',entry:'home',list:'home',split1:'home',users:'settings',backups:'settings',split3:'split1',srcview:'split3',part:'lday',batch:'lday',day:'track',cred:'debt',cwiz:'debt',pwiz:'cred'};
const TITLES={sell:'سند تازه',inv:'سند',lday:'لیست واریز',split1:'لیست‌های واریز',custs:'حساب مشتریان',cust:'حساب مشتری',banks:'موجودی حساب‌ها',buy:'خرید',ent:'جزئیات واریزی',find:'جستجو',backups:'پشتیبان‌ها',settings:'تنظیمات',users:'مدیریت کاربران',home:'مطلا',entry:'ثبت واریزی',bulk:'چسباندن لیست',list:'لیست‌ها',split3:'نتیجه تقسیم',srcview:'منبع',part:'تخصیص',track:'پیگیری واریز',batch:'پیگیری واریز',day:'لیست روزانه',debt:'تسویه بدهی',cred:'حساب بدهی',cwiz:'حساب بدهی',pwiz:'واریز خریدار',audit:'تاریخچه',};
function go(n,noPush){if(n==='lday'){if(cur==='banks')PARENT.lday='banks';else if(cur==='split1'||cur==='home'||cur==='find'||cur==='track')PARENT.lday='split1'}/* v62.3: لیست واریز از بانک‌ها → برگشت به بانک‌ها */if(cur==='sell'&&n!=='sell'&&typeof svAuto==='function')svAuto('leave');if(n==='find'&&cur!=='find'&&!(cur==='ent'&&PARENT.ent==='find')){fQ='';fF='all';fS='';fR=0;fD='';fP='';fT='';fN=120;findY=0}if(cur==='find'&&n==='ent'){try{findY=$('view').scrollTop}catch(e){}}if((n==='home'||n==='buy'||(n==='entry'||n==='bulk')&&!editId)&&dateVal!==todayISO()){dateVal=todayISO();ls.set('m_date',dateVal);alloc=null}if(n!==cur&&TOKEN&&['home','list','split1','track','debt','audit','day','batch'].includes(n))setTimeout(quietRefresh,30);if(!$('ov').classList.contains('hide')){aSt=null;closeSheet()}if(cur==='entry'&&n!=='entry'&&n!=='bulk')editId=null;turnDir=tabTurnDir(cur,n);cur=n;if(!noPush){try{history.pushState({n},'')}catch(e){}}render(true);window.scrollTo(0,0)}
const FULLP=new Set(['sell','inv','lday','batch','day','track','cust','bulk','buy','ent','split1','split3','part','srcview']),SLIDEP=new Set(['sell','inv','lday','part','cust','bulk','buy','ent','split1']);
/* v61.38: صفحه حساب مشتری با پایین کشیدن بسته نمی‌شود؛ تازه‌سازی (لود) می‌شود و با دکمه یا کشیدن از لبه برمی‌گردد */
const PTRP=SLIDEP,slideDown=()=>SLIDEP.has(cur)&&!PTRP.has(cur);
function back(){if((cur==='cwiz'||cur==='pwiz')&&wz){ACT.wzPrev();return}if(cur==='ent'&&!entEdit&&eDirty()&&!back._ok){askConfirm('تغییرات ثبت نشده؛ بدون ثبت خارج شوید؟','خروج',()=>{eD=null;back._ok=1;back();back._ok=0});return}if(cur==='buy'&&bz.step>1){bzRead();bz.step--;bz.msg='';render();return}if(cur==='ent'&&entEdit){entEdit=false;render();return}if(FULLP.has(cur)){pageLeave((cur==='ent'?PARENT.ent:PARENT[cur])||'home');return}navBack=true;go(PARENT[cur]||'home')}
window.addEventListener('popstate',e=>{if(cur==='sell'&&((e.state&&e.state.n)||'home')!=='sell'&&typeof svAuto==='function')svAuto('leave');navBack=true;cur=(e.state&&e.state.n)||'home';if(cur!=='entry')editId=null;render(true)});
const dchip=()=>{const D=dates(dateVal);return `<button class="dchip" data-act="date" aria-label="تاریخ گزارش: ${D.fa}">${ic('cal')}<span class="t"><b>${D.fa}</b><small>${esc(relDay(dateVal))}</small></span></button>`};
function dockHTML(){const t=TAB[cur],bad=dayList().filter(r=>r.level===2).length,tb=(k,i,l,b)=>`<button class="tb${t===k?' on':''}" data-act="tab" data-n="${k}" aria-label="${l}" title="${l}">${ic(i)}<span class="lb">${l}</span>${b?`<span class="bd">${toFa(b)}</span>`:''}</button>`;
  return tb('home','home','خانه',bad)+tb('banks','bank','بانک')+tb('custs','users','مشتریان')+tb('audit','clock','تاریخچه')+tb('settings','gear','تنظیمات')}
/* v61.47: صفحه‌های مشتری (سند، نمایش سند، حساب مشتری) زیر عنوان نام مشتری را نشان می‌دهند نه کاربر */
const hdCu=()=>cur==='sell'?(sv&&svCu()):cur==='inv'?(invGet()||{}).c:cur==='cust'?curCu():null;
function render(anim){/* v61.80: پرداخت خودکار سندها از واریزی‌های تأییدشده (15q) */try{if(typeof wdSync==='function')wdSync()}catch(e){}const V=$('view'),B=$('bar'),A=$('act'),turn=anim&&turnDir?pageTurn(turnDir):null;turnDir=0;let fin=false;{const ap=$('app');if(anim&&!turn&&!navBack&&FULLP.has(cur)&&render._v!==cur&&(!ap.classList.contains('full')||SLIDEP.has(cur)))fullEnterGhost()}
  const hasBack=!!PARENT[cur]||(cur==='entry'&&editId);
  B.innerHTML=`<div class="ttl">${hasBack?`<button class="ib0" data-act="${cur==='entry'&&editId?'cancelEdit':'back'}" aria-label="بازگشت">${ic('back')}</button>`:`<button class="mark mav" data-act="acct" aria-label="حساب کاربری">${ME?esc(userInit(ME.name)):ic('user')}</button>`}<div class="tt2"><b>${cur==='entry'&&editId?'ویرایش واریزی':cur==='sell'?(sv&&sv.edit?'ویرایش سند '+toFa(sv.edit.no):'سند جدید'):cur==='buy'?'خرید طلا':cur==='inv'&&invGet()?invTitle(invGet().t):cur==='ent'?(entEdit?'ویرایش واریزی':'جزئیات واریزی'):cur==='srcview'&&srcRows()?esc(srcRows().name):cur==='part'&&curPart()?esc(curPart().src.name):cur==='cred'&&curC()?esc(curC().name):cur==='cwiz'&&wz?(wz.id?'ویرایش حساب':'حساب جدید'):cur==='pwiz'&&wz?(wz.id?'ویرایش واریز':'واریز جدید'):TITLES[cur]}</b>${hdCu()?'':`<button class="uline" data-act="user" aria-label="نام کاربر">${ic('user')}<span>${ME?esc(ME.name):'ورود'}</span><span class="sdot ${SY.state}" title="${esc(syncLabel())}"></span></button>`}${cur==='home'?`<span class="bcmp"><b>${fmt(sum(homeP?validated().filter(x=>PD(x)===homeP):dayList()))}</b><small>تومان — واریز ${esc(homeP?payLab(homeP):relDay(dateVal))}</small></span>`:''}</div></div>${cur==='home'?`<button class="ib0 hsr0" data-act="hsearch" aria-label="جستجو">${ic('search')}</button>`:(cur==='entry'&&!editId)?`<span class="regd">${ic('cal')}<span>لیست امروز<small>${esc(dates(todayISO()).fa)}</small></span></span>`:cur==='part'&&curPart()?`<span class="hbtns"><button class="ib0" data-act="partExp" aria-label="خروجی">${ic('open')}</button></span>`:cur==='split1'?`<span class="hbtns"><button class="ib0" data-act="srcMgr" aria-label="مدیریت منابع">${ic('gear')}</button></span>`:cur==='lday'?`<span class="hbtns"><button class="ib0" data-act="srcMgr" aria-label="مدیریت منابع">${ic('gear')}</button>${can('export')&&hubData(ldKey).rows.length?`<button class="ib0" data-act="ldExp" aria-label="خروجی" title="خروجی">${ic('open')}</button>`:''}</span>`:cur==='cust'&&curCu()?`<span class="hbtns">${can('debt')?`<button class="ib0 hpl" data-act="svNew" data-cu="${esc(String(custId))}" aria-label="سند جدید">${ic('plus')}</button>`:''}</span>`:cur==='inv'&&invGet()?`<span class="hbtns"><button class="ib0 hpr" data-act="invPrint" aria-label="چاپ فاکتور / PDF" title="چاپ فاکتور / PDF">${ic('print')}</button><button class="ib0 hmo" data-act="invMenu" aria-label="گزینه‌های سند" aria-haspopup="menu">${ic('more')}</button></span>`:cur==='sell'&&typeof sv!=='undefined'&&sv?`<span class="hbtns"><button class="ib0 hpr" data-act="svPrint" aria-label="فاکتور / PDF همین سند" title="فاکتور / PDF">${ic('print')}</button></span>`:cur==='ent'||cur==='find'||cur==='buy'||cur==='sell'||cur==='inv'||cur==='bulk'||cur==='banks'||cur==='custs'||cur==='cust'||cur==='audit'||cur==='settings'||cur==='users'||cur==='backups'?'':dchip()}`;
  /* v61.57 (خواسته صاحب اپ): در صفحه‌های مشتری عنوان صفحه داخل کارت مشتری می‌رود و کارت جای عنوان را در ردیف سرتیتر می‌گیرد */
  {const hc=hdCu();B.classList.toggle('cuhd',!!hc);if(hc){const T=B.querySelector('.tt2>b'),L=B.querySelector('.ttl');if(L)L.insertAdjacentHTML('beforeend',cuHead(hc,T?T.textContent:''))}}
  const R={sell:[vSell,aSell],inv:[vInv,aInv],custs:[vCusts,aCusts],cust:[vCust,aCust],banks:[vBanks,aBanks],buy:[vBuy,aBuy],ent:[vEnt,aEnt],find:[vFind,null],home:[vHome,null],entry:[vEntry,aEntry],bulk:[vBulk,aBulk],list:[vList,null],split1:[vSplit1,aSplit1],lday:[vLday,aLday],split3:[vSplit3,aSplit3],srcview:[vSrc,aSrc],part:[vPart,aPart],track:[vTrack,null],batch:[vBatch,aBatch],day:[vDay,aDay],debt:[vDebt,aDebt],cred:[vCred,aCred],cwiz:[vWiz,aWiz],pwiz:[vWiz,aWiz],audit:[vAudit,null],users:[vUsers,aUsers],settings:[vSettings,null],backups:[vBackups,null]}[cur];
  $('app').classList.toggle('home',cur==='home');$('act').classList.remove('hid','sv0');$('app').classList.toggle('ent',cur==='ent');$('app').classList.toggle('banks',cur==='banks');$('app').classList.toggle('custs',cur==='custs');$('app').classList.toggle('editing',cur==='ent'&&entEdit);{const ap=$('app'),was=ap.classList.contains('full'),fu=FULLP.has(cur);ap.classList.toggle('full',fu);ap.classList.toggle('split',cur==='split1');if(fu&&anim&&!turn&&!navBack&&render._v!==cur&&(!was||SLIDEP.has(cur))){fin=true;ap.classList.add('fullin');clearTimeout(render._fi);render._fi=setTimeout(()=>ap.classList.remove('fullin'),620)}if(!fu)ap.classList.remove('fullin')}B.classList.remove('cmp');
  /* همان صفحه دوباره ساخته می‌شود (نه رفتن به صفحه دیگر): ردیف‌ها از جای قبلی به جای تازه بلغزند */
  const sameV=render._v===cur,same=!anim&&sameV,sy=V.scrollTop,fs=same?flipSnap(V):null;render._v=cur;render._same=sameV;
  V.innerHTML=R[0]();if(same&&V.scrollTop!==sy)V.scrollTop=sy;A.innerHTML=R[1]?R[1]():'';$('dock').innerHTML=dockHTML();dockInd();if(cur==='home')homeLayout();paintBars();if(fs)flipPlay(V,fs);tmSync();if(typeof phPaint==='function')phPaint(document);if(window.edgeZ)edgeZ();
  if(turn){V.classList.remove('in','bk');turn()}else if(anim&&!noAnim&&!sameV&&!fin){V.classList.remove('in','bk');void V.offsetWidth;V.classList.add('in');if(navBack)V.classList.add('bk')}else V.classList.remove('in','bk');navBack=false;noAnim=false;
  ({sell:bindSell,custs:bindCusts,cust:bindCust,inv:bindInv,buy:bindBuy,ent:bindEnt,find:bindFind,backups:()=>{if(!BK&&!bkErr)loadBk()},entry:bindEntry,bulk:bindBulk,list:bindList,split1:bindSplit1,lday:bindLday,batch:bindBatch,track:bindTrack,debt:bindDebt,cwiz:bindWiz,pwiz:bindWiz,users:bindUsers})[cur]?.()}
/* ============ نوار تاریخ‌ها (هوشمند) ============ */
function dstrip(){const L=datesWith(),t=todayISO();if(!L.some(x=>x.iso===t))L.unshift({iso:t,n:0,s:0,bad:0});if(!L.some(x=>x.iso===dateVal))L.push({iso:dateVal,n:0,s:0,bad:0});
  L.sort((a,b)=>a.iso<b.iso?1:-1);return `<div class="dstrip">${L.slice(0,20).map(x=>{const D=dates(x.iso),r=relDay(x.iso);return `<button class="dpill${x.iso===dateVal?' on':''}${x.bad?' err':''}" data-act="pickDate" data-iso="${x.iso}"><b>${['امروز','دیروز','فردا'].includes(r)?r:toFa(D.jd)+' '+JM[D.jm-1]}</b><small>${x.n?fmt(x.n)+' واریزی':'خالی'}</small></button>`}).join('')}</div>`}
/* ============ خانه ============ */
function userInit(u){return u?[...u.trim()][0]:'؟'}
/* ============ خانه (سبک بلوبانک) ============ */
let homeF='all',homeOpen=new Set(),homeP='',homePick=false;
const isOkE=x=>{const t=entSt(x);return !!t&&t[1]==='ok'};
function rowSt(x){const t=entSt(x);return x.level===2?'bad':t?(t[1]==='ok'?'ok':(t[1]==='fail'||t[1]==='rd')?'fail':'pend'):'new'}
function payLab(iso){if(!iso)return '';const r=relDay(iso),t=todayISO();if(['امروز','دیروز','فردا'].includes(r))return r;if(iso===isoAdd(t,2))return 'پس‌فردا';const D=dates(iso);return toFa(D.jd)+' '+JM[D.jm-1]}
let ROWRND=null,AM=null,ROWDATE=false,ROWSRC=true,ROWTRK=false,ROWMOVE=false,ROWTAP='openEnt';
function allocMap(){const m=new Map(),VM=new Map(validated().map(r=>[r.id,r]));Object.values(drafts||{}).forEach(L=>{const G={};(L||[]).forEach(p=>{const k=String(p.src&&p.src.id!=null?p.src.id:(p.src||{}).name)+'|'+partPay(p,VM);(G[k]=G[k]||[]).push(p)});Object.values(G).forEach(A=>A.forEach((p,i)=>(p.ids||[]).forEach(id=>m.set(id,{src:(p.src&&p.src.name)||'',sent:!!p.sent,rnd:i+1,rn:A.length}))))});batches.forEach(b=>b.items.forEach(x=>{const o=m.get(x.id)||{};m.set(x.id,{...o,src:x.src||o.src||'',sent:true,tn:x.tn||''})}));m.forEach(v=>{v.key=v.src+(v.rn>1?' · مرحله '+toFa(v.rnd):'')});return m}
function homeRow(x){const st=rowSt(x),t=entSt(x),al=(AM||(AM=allocMap())).get(x.id);
  const ico=st==='ok'?ic('check'):st==='fail'?'<b>✕</b>':st==='bad'?'<b>!</b>':st==='pend'?ic('clock'):`<b>${esc(userInit(fullName(x)||'؟'))}</b>`;
  const lab=st==='bad'?'خطادار':t?t[0]:'ثبت شده';
  const rn=ROWRND&&ROWRND.get(x.id);
  const hasRc=ROWTRK&&(x.sentBid&&!!entBI(x)||x.full&&(x.settles||[]).length);
  const inner=`<div class="brw ${st}${hasRc?' hasrc':''}${rn?' rn'+((rn-1)%2):''}">${rn?`<span class="rntag">مرحله ${toFa(rn)}</span>`:''}<button class="brh" data-act="openEnt" data-id="${x.id}"><span class="bri">${ico}</span><span class="tx"><b>${esc(fullName(x)||'—')}</b><small class="bkl">${bankBadge(x.bankShow)}<span>${esc(x.bankShow||'بانک نامشخص')}${x.pcs?'، '+toFa(x.pcs)+' بخشی':''}${x.payDate?' · واریز '+esc(payLab(x.payDate)):''}${x.code?' · فاکتور '+esc(toEn(x.code)):''}</span></small>${ROWDATE||(ROWSRC&&al&&al.src)?`<span class="rchips">${ROWDATE?`<span class="rdate">${ic('cal')}واریز ${esc(payLab(x.payDate||x.entryDate))}${['امروز','دیروز','فردا','پس‌فردا'].includes(payLab(x.payDate||x.entryDate))?'، '+esc(toFa(dates(x.payDate||x.entryDate).jd)+' '+JM[dates(x.payDate||x.entryDate).jm-1]):''}</span>`:''}${ROWSRC&&al&&al.src?`<span class="rsw"><span class="rsrc">${ic('split')}<em>${esc(al.src)}</em></span>${al.rn>1?`<span class="rrd r${Math.min(al.rnd,3)}">مرحله ${toFa(al.rnd)}</span>`:''}</span>`:''}</span>`:''}</span><span class="brv"><b>${fmt(x.full?x.total:x.amount)} <i>تومان</i></b><small>${lab}</small></span></button>${ROWTRK&&x.sentBid?(()=>{const q=entBI(x);if(!q)return '';const n=itImgs(q.b,q.it).length;return n||can('track')?`<button class="stlc brc${n?' on':''}" data-act="galIt" data-id="${x.id}" aria-label="${n?'رسیدهای واریز':'افزودن رسید'}">${ic(n?'cam':'plus')}${n>1?`<em>${toFa(n)}</em>`:''}</button>`:''})():ROWTRK&&x.full&&(x.settles||[]).length?(()=>{/* v61.1: تسویه با مشتری: رسید تسویه هم از همین لیست */const e=entries.find(z=>z.id===x.id)||x,n=(e.settles||[]).reduce((s,z)=>s+stImgs(z).length,0);return n||can('edit')?`<button class="stlc brc${n?' on':''}" data-act="galFs" data-id="${x.id}" aria-label="${n?'رسیدهای تسویه':'افزودن رسید تسویه'}">${ic(n?'cam':'plus')}${n>1?`<em>${toFa(n)}</em>`:''}</button>`:''})():''}</div>`;
  const bi=x.sentBid?stOf(x.id):null,R0=[['cpEnt','کپی','copy','#b8862b']];
  if(bi==='pending'||bi==='fail')R0.unshift(['entOk','تأیید','check','#178049']);else if(bi==='ok')R0.unshift(['entUnok','لغو تأیید','undo','#6b7385']);
  /* ویرایش و انتقال به منبع در همه بخش‌ها (خانه، جستجو، لیست، منبع) */
  if(!x.full&&can('split')&&!(x.level===2&&!x.sentBid))R0.splice(1,0,['entMove',x.sentBid||(AM&&AM.get(x.id))?'انتقال':'منبع','split','#6b5bd6']);
  if(can('edit'))R0.push(['entEditGo','ویرایش','edit','#3b6fd6']);
  const L0=[['del','حذف','trash','#d23c48']];if(bi==='pending'||bi==='ok')L0.unshift(['entTkF','ناموفق','x','#d23c48']);
  return swW(inner,{r:R0,l:L0,data:{id:x.id}})}

/* ---- v100.2 چاپ مستقیم از خود برنامه روی چاپگر وای‌فای ----
   صاحب اپ: «می‌خواهم چاپ و وصل شدن به پرینتر هم از خود برنامه صورت بگیرد» (چاپگر = وای‌فای شبکه مغازه).
   اپ اندروید تازه (DirectPrint.java / IppCore.java) چاپگرهای شبکه را پیدا می‌کند (_ipp._tcp) و صفحه‌ها را با IPP می‌فرستد؛
   پنجره چاپ اندروید و کوچک‌کردن ۹۴٪ آن دیگر در کار نیست: هر صفحه همین‌جا روی بوم به اندازه دقیق کاغذ (A5/A4 عمودی) ساخته می‌شود،
   برگه افقی ۹۰ درجه می‌چرخد و «تنظیم چاپ» راه «d» (prCal) رویش اعمال می‌شود.
   چاپگر انتخاب‌شده فقط روی همین گوشی است (LS m_prn). نتیجه‌های اپ: window.__prn(kind, data). */
const PRN={list:[],find:0,chk:'',cb:null,dn:null,busy:0,msg:''};
const prnB=()=>window.AndroidBridge;
const prnHas=()=>{const B=prnB();try{return !!(B&&B.prnOk&&B.prnOk())}catch(e){return false}};
function prnCfg(){try{const o=JSON.parse(LS.getItem('m_prn')||'null');return o&&o.h&&o.fmt?o:null}catch(e){return null}}
function prnSave(o){try{if(o)LS.setItem('m_prn',JSON.stringify(o));else LS.removeItem('m_prn')}catch(e){}}
const prnDirect=()=>prnHas()&&!!prnCfg();
window.__prn=(k,d)=>{try{prnEv(k,d)}catch(e){}};
function prnEv(k,d){
  if(k==='found'||k==='list'){(k==='list'?(d.list||[]):[d]).forEach(o=>{if(o&&o.h&&!PRN.list.some(x=>x.h===o.h&&x.p===o.p))PRN.list.push(o)});if(k==='list')PRN.find=0;prnPaint();return}
  if(k==='info'){const f=PRN.cb;PRN.cb=null;if(f)f(d);return}
  if(k==='stage'){const b=document.querySelector('#pv .pvld b');if(b)b.textContent=d&&d.s==='send'?'در حال فرستادن به چاپگر…':'در حال آماده‌سازی صفحه‌ها…';return}
  if(k==='done'){const f=PRN.dn;PRN.dn=null;if(f)f(d)}}
function prnInfoP(h,p,rp){return new Promise(res=>{const B=prnB();if(!B||!B.prnInfo){res({ok:false,err:'no bridge'});return}
  const t=setTimeout(()=>{if(PRN.cb===f){PRN.cb=null;res({ok:false,err:'timed out'})}},20000),f=d=>{clearTimeout(t);res(d||{ok:false})};PRN.cb=f;try{B.prnInfo(h,+p||631,rp||'ipp/print')}catch(e){clearTimeout(t);PRN.cb=null;res({ok:false,err:String(e)})}})}
/* بهترین قالب داده برای این چاپگر: PWG Raster → URF (AirPrint) → PDF → JPEG؛ dpi تا ۴۰۰ (بیشتر = حافظه زیاد) */
function prnFmts(I){const F=I.formats||[],T=I.pwgTypes||[],U=String((I.urf||[]).join(',')).split(',').map(x=>x.trim()),col=!!I.color,O=[];
  /* v100.3: چاپگرهای HP (مثل LaserJet M211dw) اغلب فقط ۶۰۰ dpi می‌گیرند؛ صفحه در گوشی با ۳۰۰ ساخته می‌شود و اپ اندروید سطرها را برای ۶۰۰ دو برابر می‌کند (بدون تصویر بزرگ در حافظه) */const dp=L=>{const v=L.filter(x=>x>=150&&x<=600).sort((a,b)=>Math.abs(a-300)-Math.abs(b-300));return v[0]||0};
  if(F.includes('image/pwg-raster')&&(T.includes('sgray_8')||T.includes('srgb_8'))){const d=dp((I.pwgRes||[]).map(r=>parseInt(r,10)).filter(Boolean));if(d)O.push({fmt:'image/pwg-raster',dpi:d,gray:col&&T.includes('srgb_8')?false:T.includes('sgray_8')})}
  if(F.includes('image/urf')&&(U.includes('W8')||U.includes('SRGB24'))){const rs=[];U.filter(x=>/^RS\d/.test(x)).forEach(x=>x.slice(2).split('-').forEach(n=>rs.push(+n)));const d=dp(rs.length?rs:[300]);if(d)O.push({fmt:'image/urf',dpi:d,gray:!(col&&U.includes('SRGB24'))})}
  if(F.includes('application/pdf'))O.push({fmt:'application/pdf',dpi:300,gray:!col});
  if(F.includes('image/jpeg'))O.push({fmt:'image/jpeg',dpi:300,gray:!col});return O}
const PRSR={'media-empty':'کاغذ تمام شده','media-needed':'کاغذ تمام شده','media-jam':'کاغذ گیر کرده','toner-empty':'کارتریج تمام شده','marker-supply-empty':'کارتریج تمام شده','toner-low':'کارتریج کم است','marker-supply-low':'کارتریج کم است','door-open':'در چاپگر باز است','cover-open':'در چاپگر باز است','offline':'چاپگر آفلاین است','shutdown':'چاپگر خاموش است','paused':'چاپگر متوقف است','input-tray-missing':'سینی کاغذ سر جایش نیست','output-tray-missing':'سینی خروجی سر جایش نیست'};
function prnState(I){if(!I||!I.ok)return {t:'جواب نداد',bad:1};const R=(I.reasons||[]).map(r=>String(r).replace(/-(error|warning|report)$/,'')),w=[...new Set(R.map(r=>PRSR[r]).filter(Boolean))],st=+I.state;
  return {t:w.length?w.join('، '):st===5?'متوقف است':st===4?'در حال چاپ':'آماده',bad:st===5||R.some(r=>/media-empty|media-needed|jam|toner-empty|supply-empty|door|cover|offline|shutdown/.test(r))}}
const prnErr=d=>{const e=String(d&&d.err||'');if(e==='memory')return 'حافظه گوشی برای ساختن صفحه‌ها کم آمد؛ برنامه‌های دیگر را ببندید و دوباره بزنید';
  if(/timed out|connect|unreachable|refused|route|host|reset|closed/i.test(e))return 'چاپگر جواب نداد؛ روشن است و گوشی به همان وای‌فای مغازه وصل است؟';
  const s=+(d&&d.status)||0;if(s===0x0507||s===0x0505)return 'چاپگر مشغول است؛ چند لحظه بعد دوباره بزنید';if(s===0x0506)return 'چاپگر الان کار تازه نمی‌گیرد (متوقف یا در حال خطا)';
  return 'چاپ انجام نشد'+(s?' (کد '+s.toString(16)+')':e?' ('+e.slice(0,60)+')':'')};
/* ---------- پنل انتخاب چاپگر (داخل همان پنل «تنظیم چاپ») ---------- */
function prnRowH(){const C=prnCfg();if(!prnHas())return '';
  return `<div class="prnr${C?'':' no'}"><span class="prni">${ic('print')}</span><div><b>${C?esc(C.n||C.h):'چاپگر انتخاب نشده'}</b><small id="prnSt">${C?esc((C.model?C.model+' · ':'')+C.h):'چاپ با پنجرهٔ اندروید'}</small></div><button type="button" class="prnc" data-act="prnPick">${C?'تغییر':'انتخاب چاپگر'}</button></div>`}
function prnPickHTML(){const C=prnCfg(),L=PRN.list;
  const row=(o,i)=>{const on=C&&C.h===o.h&&+C.p===+o.p,ck=PRN.chk===o.h+':'+o.p;return `<button type="button" class="prnl${on?' on':''}" data-act="prnSel" data-i="${i}"><span class="prni">${ic('print')}</span><div><b>${esc(o.n||o.h)}</b><small>${esc((o.ty?o.ty+' · ':'')+o.h)}</small></div>${ck?'<span class="pvsp prnsp"></span>':on?`<em>${ic('check')}</em>`:''}</button>`};
  return `<div class="pvah"><div><b>انتخاب چاپگر</b><small>چاپگرهای وای‌فای همین شبکه</small></div><button type="button" class="ib0" data-act="prnBack" aria-label="بستن">${ic('x')}</button></div>
  <div class="prnls">${L.map(row).join('')}
  ${PRN.find?`<div class="prnf"><span class="pvsp prnsp"></span><span>در حال جستجوی چاپگر در وای‌فای…</span></div>`:!L.length?`<div class="prnf bad">${ic('info')}<span>چاپگری پیدا نشد. گوشی و چاپگر باید به یک وای‌فای وصل باشند و چاپگر روشن باشد. می‌توانید نشانی IP چاپگر را پایین بنویسید (روی برگه تنظیمات خود چاپگر هست).</span></div>`:''}</div>
  ${PRN.msg?`<div class="pvan bad">${ic('info')}<span>${esc(PRN.msg)}</span></div>`:''}
  <div class="prnip"><label><input id="prnIp" class="ltr" inputmode="decimal" autocomplete="off" placeholder="IP چاپگر، مثلاً 192.168.1.50"></label><button type="button" data-act="prnIpGo">وصل شو</button></div>
  <div class="prnbt"><button type="button" data-act="prnFind">${ic('refresh')}<span>جستجوی دوباره</span></button><button type="button" data-act="prnSys">${ic('print')}<span>این بار با پنجرهٔ اندروید</span></button>${C?`<button type="button" class="dl" data-act="prnDel">${ic('trash')}<span>کنار گذاشتن این چاپگر</span></button>`:''}</div>`}
function prnPaint(){if(PVA.m!=='prn')return;const el=$('pva');if(el)el.innerHTML=prnPickHTML()}
function prnFind(){const B=prnB();if(!B||!B.prnFind)return;PRN.find=1;PRN.msg='';PRN.list=PRN.list.filter(o=>o.man);try{B.prnFind(6000)}catch(e){PRN.find=0}prnPaint();setTimeout(()=>{if(PRN.find){PRN.find=0;prnPaint()}},16000)}
/* چاپگر انتخاب شد: توانایی‌ها پرسیده می‌شود، بهترین قالب ذخیره می‌شود */
async function prnUse(o,paths){PRN.chk=o.h+':'+o.p;PRN.msg='';prnPaint();let I=null;
  for(const rp of paths||[o.rp||'ipp/print']){I=await prnInfoP(o.h,o.p||631,rp);if(I&&I.ok){o.rp=rp;break}}
  PRN.chk='';if(!I||!I.ok){PRN.msg='«'+(o.n||o.h)+'» جواب نداد؛ روشن است و گوشی به همان وای‌فای وصل است؟';prnPaint();return}
  const F=prnFmts(I);if(!F.length){PRN.msg='این چاپگر چاپ مستقیم را پشتیبانی نمی‌کند؛ «این بار با پنجرهٔ اندروید» را بزنید';prnPaint();return}
  const md=I.media||[],c={h:o.h,p:+o.p||631,rp:o.rp||'ipp/print',n:I.name||o.n||o.h,model:I.model||o.ty||'',...F[0],alt:F.slice(1),a5:md.some(m=>/iso_a5/.test(m)),a4:md.some(m=>/iso_a4/.test(m)),at:Date.now()};
  prnSave(c);const st=prnState(I);toast('چاپگر وصل شد: '+c.n+(st.bad?' — '+st.t:''),!!st.bad);PVA.m='';pvaReopen()}
function pvaReopen(){const el=$('pva');if(!el)return;PVA.pl=prPlat();el.innerHTML=pvaHTML();pvaNote();pvaPrev();prnStRe()}
/* وضعیت چاپگر در ردیف بالای پنل (آماده / کاغذ ندارد …) */
async function prnStRe(){const C=prnCfg();if(!C||!$('prnSt'))return;const I=await prnInfoP(C.h,C.p,C.rp),e=$('prnSt');if(!e)return;const st=prnState(I);e.textContent=st.t+' · '+C.h;e.classList.toggle('bad',!!st.bad);e.classList.toggle('ok',!st.bad)}
/* ---------- ساختن صفحه‌ها به اندازه دقیق کاغذ ---------- */
/* v100.5 (صاحب اپ با عکس چاپ: «خطوط نشان داده شود و معلوم باشد، پررنگ‌تر»): برای چاپگر سیاه‌وسفید (لیزری)، رنگ کاغذ کرم/طلایی سفید می‌شود
   و هر خاکستری (خط‌های طلایی، نوشته‌های کم‌رنگ، لبه حروف) تیره‌تر؛ مشکی همان مشکی. منحنی: L≥242 → سفید، زمینه‌های کم‌رنگ (۲۰۰–۲۴۲) → خاکستری خیلی روشن، بقیه (خط و نوشته) → ۰٫۵۵×L */
const PRNLUT=(()=>{const t=new Uint8ClampedArray(256);for(let v=0;v<256;v++)t[v]=v>=242?255:v>=200?Math.round(215+(v-200)/42*40):Math.round(v*.55);return t})();
function prnTone(x,cv){x.setTransform(1,0,0,1,0,0);const D=x.getImageData(0,0,cv.width,cv.height),d=D.data,T=PRNLUT;
  for(let i=0;i<d.length;i+=4){const g=T[(d[i]*299+d[i+1]*587+d[i+2]*114+500)/1000|0];d[i]=d[i+1]=d[i+2]=g}x.putImageData(D,0,0)}
const prnImg=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src});
async function prnPages(fl,C){const Q=fl._spec,A4=!!Q.a4,M=A4?{w:210,h:297,n:'iso_a4_210x297mm'}:{w:148,h:210,n:'iso_a5_148x210mm'},land=Q.mmW>Q.mmH+.5,cal=prCal(Q.mmW,Q.mmH,'d'),dpi=Math.min(300,C.dpi||300),s=dpi/25.4,out=[];
  for(const p of fl._pages){const im=await prnImg(p.j),cv=document.createElement('canvas');cv.width=Math.round(M.w*s);cv.height=Math.round(M.h*s);const x=cv.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.setTransform(s,0,0,s,0,0);x.translate(M.w/2,M.h/2);if(land)x.rotate(Math.PI/2);
    if(cal){x.translate(cal.x,cal.y);x.scale(cal.kx,cal.ky);if(cal.r)x.rotate(cal.r*Math.PI/180)}
    x.imageSmoothingQuality='high';x.drawImage(im,-Q.mmW/2+Q.mh+((Q.mmW-2*Q.mh)-p.wmm)/2,-Q.mmH/2+Q.mv,p.wmm,p.hmm);
    if(C.gray)prnTone(x,cv);
    out.push(cv.toDataURL('image/jpeg',.92));cv.width=cv.height=1;await new Promise(r=>setTimeout(r,0))}
  return {M,pages:out}}
function prnPdf(pages,M){const pt=v=>v*72/25.4,P=pages.map(j=>{const b=Uint8Array.from(atob(j.split(',')[1]),c=>c.charCodeAt(0));return {b,w:0,h:0,iw:pt(M.w),ih:pt(M.h),x:0,y:0,j}});
  return Promise.all(P.map(o=>prnImg(o.j).then(i=>{o.w=i.naturalWidth;o.h=i.naturalHeight}))).then(()=>pdfB64(pdfBuild(P,pt(M.w),pt(M.h),0,0)))}
function prnSend(job){return new Promise(res=>{const B=prnB();const t=setTimeout(()=>{if(PRN.dn===f){PRN.dn=null;res({ok:false,err:'timed out'})}},180000),f=d=>{clearTimeout(t);res(d||{ok:false})};PRN.dn=f;
  let ok=false;try{ok=B.prnPrint(JSON.stringify(job))}catch(e){}if(!ok){clearTimeout(t);PRN.dn=null;res({ok:false,err:'busy'})}})}
async function prnGo(){if(PRN.busy)return;const C=prnCfg(),fl=PDFK.file,P=$('pv');if(!C)return;if(!fl||!fl._pages||!fl._pages.length){toast('برگه هنوز آماده نیست؛ چند لحظه بعد دوباره بزنید',true);return}
  PRN.busy=1;P.classList.add('ld','ld2');const L=P.querySelector('.pvld b'),setL=t=>{if(L)L.textContent=t};setL('در حال آماده‌سازی صفحه‌ها…');let r;
  try{for(const F of [C,...(C.alt||[])]){const D=await prnPages(fl,{...C,...F}),job={h:C.h,p:C.p,rp:C.rp,fmt:F.fmt,dpi:F.dpi,gray:F.gray,media:D.M.n,mmW:D.M.w,mmH:D.M.h,ptW:Math.round(D.M.w*72/25.4),ptH:Math.round(D.M.h*72/25.4),copies:1,title:fl.name.replace(/\.pdf$/,'')};
      if(F.fmt==='application/pdf')job.pdf=await prnPdf(D.pages,D.M);else job.pages=D.pages.map(j=>j.split(',')[1]);setL('در حال فرستادن به چاپگر…');
      r=await prnSend(job);const s=+r.status||0;if(r.ok||!(s===0x040A||s===0x040B||s===0x0400))break;/* قالب را نپذیرفت → قالب بعدی */}
  }catch(e){r={ok:false,err:String(e&&e.message||e)}}
  PRN.busy=0;P.classList.remove('ld','ld2');setL('در حال آماده‌سازی…');
  if(r&&r.ok){toast('برای «'+(C.n||C.h)+'» فرستاده شد ✓');return}
  const I=await prnInfoP(C.h,C.p,C.rp),st=prnState(I);toast(I&&I.ok&&st.bad?'چاپ نشد: '+st.t:prnErr(r),true,'چاپگر',()=>ACT.prnPick())}
/* ---------- دکمه‌ها ---------- */
ACT.prnPick=()=>{const P=$('pv');if(!P||P.classList.contains('hide'))return;if(!PVA.on){ACT.pvAdj();if(!PVA.on)return}PVA.m='prn';PRN.msg='';$('pva').innerHTML=prnPickHTML();if(!PRN.list.length||!PRN.find)prnFind()};
ACT.prnBack=()=>{PVA.m='';PRN.msg='';pvaReopen()};
ACT.prnFind=()=>prnFind();
ACT.prnSel=d=>{const o=PRN.list[+d.i];if(o&&!PRN.chk)prnUse(o)};
ACT.prnIpGo=()=>{const e=$('prnIp'),v=toEn(String(e&&e.value||'')).trim().replace(/^ipps?:\/\//,'').replace(/\/.*$/,'');const m=v.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::(\d+))?$/);
  if(!m){toast('نشانی را مثل 192.168.1.50 بنویسید',true);return}const o={h:m[1],p:+m[2]||631,n:m[1],man:1};if(!PRN.list.some(x=>x.h===o.h))PRN.list.unshift(o);prnUse(o,['ipp/print','ipp','ipp/printer'])};
ACT.prnSys=()=>{PVA.m='';pvaOff();PRN.sys=1;ACT.pvPrint().finally(()=>{PRN.sys=0})};
ACT.prnDel=()=>{prnSave(null);toast('چاپگر کنار گذاشته شد؛ چاپ با پنجرهٔ اندروید');ACT.prnBack()};

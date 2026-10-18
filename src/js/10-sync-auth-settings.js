/* ================= v28: سرور، ورود، کاربران و همگام‌سازی زنده ================= */
const SERVER_URL='https://motalla.ir';
const API_BASE=location.protocol==='file:'?(window.__API||SERVER_URL):(location.hostname==='raw.githack.com'?SERVER_URL:'');
let TOKEN=(()=>{try{return localStorage.getItem('m_token')||''}catch(e){return ''}})(),ME=ls.get('m_me',null);
const isAdmin=()=>!!ME&&ME.role==='admin';
/* ---------- دسترسی‌ها (هم‌نام با سرور) ---------- */
const PERMS=[['add','ثبت واریزی جدید','ثبت تکی و چسباندن لیست'],['edit','ویرایش واریزی','تغییر نام، مبلغ، شبا و…'],['del','حذف','حذف واریزی، پاک کردن لیست، حذف دائمی از سطل'],['split','تقسیم و ارسال','تخصیص به منابع و فرستادن به پیگیری'],['track','پیگیری','ثبت موفق/ناموفق، رسید و واریز مجدد'],['close','بایگانی','بستن و بازگشایی روز'],['unsend','برگرداندن ارسال','برگرداندن لیست ارسال‌شده به تقسیم'],['debt','تسویه بدهی','حساب‌های بدهی و پرداخت‌ها'],['src','منابع پرداخت','افزودن، ویرایش و حذف منبع'],['undo','لغو و بازگردانی','لغو از تاریخچه و بازگردانی از سطل'],['export','خروجی','متن، PDF و اکسل']];
const DEF_STAFF=['add','edit','split','track','close','debt','export'];
const myPerms=()=>!ME?[]:ME.role==='admin'?PERMS.map(p=>p[0]):(Array.isArray(ME.perms)?ME.perms:DEF_STAFF);
const can=p=>isAdmin()||myPerms().includes(p);
/* هر کار ← دسترسی لازم (کارهای مدیر: 'admin') */
const PERM_OF={entCommit:'track',mvNew:'src',entMove:'split',partMoveAll:'split',mvGo:'split',entTkQ:'track',trkArch:'close',partOkAll:'track',trkGo:'track',cuNew:'debt',cuSave:'debt',cuEdit:'debt',cuDel:'del',txNew:'debt',txSave:'debt',txDel:'del',acNew:'src',acOpen:'src',acSave:'src',acBal:'src',acDel:'src',acEdit:'src',posNight:'src',posSave:'src',acLedNew:'src',acLedSave:'src',acLedDel:'src',acSetBal:'src',buyNew:'add',bzNext:'add',bzStlNew:'add',bzStlOpen:'add',bzStlDel:'add',bzStlSave:'add',bzNewIban:'add',entryMenu:'add',xGo:'export',xOpen:'export',entOk:'track',entUnok:'track',entEditOn:'edit',entSave:'edit',entEditGo:'edit',entDel:'del',entTk:'track',entTkF:'track',entPay:'edit',stlNew:'edit',stlSave:'edit',stlDel:'edit',stlOk:'edit',stlUnok:'edit',stlDelI:'edit',cuStl:'edit',saveEntry:()=>editId?'edit':'add',bulkAdd:'add',newList:'add',tab:d=>d&&d.n==='entry'&&!editId?'add':null,edit:'edit',
  del:'del',delEdit:'del',clearDay:'del',tkDel:'del',purgeOne:'del',emptyTrash:'del',credDel:'del',payDel:'del',
  hubSend:'split',hubSendAll:'split',hubOkAll:'track',hubArch:'close',hubReopen:'close',paySplit:'split',paySplitSave:'split',paySplitUndo:'split',
  allocNew:'split',aSave:'split',partEdit:'split',partDel:'split',partDelId:'split',trackNow:'split',partsSend:'split',
  itSave:'track',tkSet:'track',tkAll:'track',tkRequeue:'track',closeBatch:'close',reopenDay:'close',undoCommit:'unsend',partUnsend:'unsend',
  credNew:'debt',credSave:'debt',credEdit:'debt',payNew:'debt',paySave:'debt',payEdit:'debt',payOk:'debt',wzSave:'debt',toDebt:'debt',
  srcMgr:'src',srcSet:'src',saveSrc:'src',addSrc:'src',delSrc:'src',delSrcGo:'src',undoEv:'undo',restoreOne:'undo',restoreAll:'undo',
  expAll:'export',expOpen:'export',expPdf:'export',expText:'export',expXls:'export',dayExp:'export',dayPdf:'export',ldExp:'export',ldText:'export',ldPdf:'export',ldXls:'export',dayText:'export',dayXls:'export',partsExp:'export',partExp:'export',lexp:'export',tkReport:'export',credPdf:'export',credStmt:'export',
  bkNow:'admin',bkDl:'admin',bkFull:'admin',bkRestore:'admin',userNew:'admin',userEdit:'admin',userCreate:'admin',userSave:'admin',userDel:'admin',backup:'admin'};
const permFor=(k,d)=>{const v=PERM_OF[k];return typeof v==='function'?v(d):v||null};
const canAct=(k,d)=>{const p=permFor(k,d);return !p||(p==='admin'?isAdmin():can(p))};
/* دکمه‌هایی که بدون دسترسی پنهان می‌شوند (ردیف‌ها پنهان نمی‌شوند؛ فقط کار مسدود می‌شود) */
const HIDE_OF={del:['delEdit','clearDay','tkDel','purgeOne','emptyTrash','credDel','payDel','.opt[data-act="del"]','.eact [data-act="del"]','.swb[data-act="del"]'],src:['srcMgr','srcSet','.srcc .ed','#dock .tb[data-n="banks"]'],undo:['undoEv','restoreOne','restoreAll'],unsend:['undoCommit','partUnsend'],close:['closeBatch','reopenDay'],export:['expAll','dayExp','partsExp','partExp','lexp','tkReport','credPdf','credStmt'],split:['allocNew','partsSend','trackNow'],debt:['credNew','payNew']};
function applyPerms(){document.body.classList.toggle('staff',!!ME&&!isAdmin());let css='';
  for(const p in HIDE_OF)if(ME&&!can(p))css+=HIDE_OF[p].map(x=>x[0]==='.'?x:`[data-act="${x}"]`).join(',')+'{display:none!important}';
  let st=document.getElementById('permcss');if(!st){st=document.createElement('style');st.id='permcss';document.head.appendChild(st)}st.textContent=css}
const rawSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){storeOK=false}};
/* JSON پایدار (ترتیب کلیدها مهم نیست) برای مقایسه */
function sj(v){if(v===undefined||v===null||typeof v!=='object')return v===undefined?'null':JSON.stringify(v);if(Array.isArray(v))return '['+v.map(x=>x===undefined?'null':sj(x)).join(',')+']';return '{'+Object.keys(v).sort().filter(k=>v[k]!==undefined&&typeof v[k]!=='function').map(k=>JSON.stringify(k)+':'+sj(v[k])).join(',')+'}'}
const isPO=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
/* به‌روزرسانی شیء موجود بدون عوض کردن مرجع (تا کارهای در حال انجام از دست نروند) */
function patchIn(t,s){if(!isPO(t)||!isPO(s))return s;for(const k of Object.keys(t))if(!(k in s))delete t[k];
  for(const k of Object.keys(s)){const a=t[k],b=s[k];
    if(isPO(a)&&isPO(b))patchIn(a,b);
    else if(Array.isArray(a)&&Array.isArray(b)&&b.every(x=>isPO(x)&&x.id!=null)){const m=new Map(a.filter(isPO).map(x=>[String(x.id),x]));t[k]=b.map(x=>{const o=m.get(String(x.id));return o?patchIn(o,x):x})}
    else t[k]=b}
  return t}
const SYNC={
  entries:{get:()=>entries,set:v=>{entries=v},key:'m_entries',cmp:(a,b)=>a.id-b.id},
  sources:{get:()=>sources,set:v=>{sources=v},key:'m_sources',cmp:(a,b)=>a.id-b.id},
  batches:{get:()=>batches,set:v=>{batches=v},key:'m_batches',cmp:(a,b)=>b.id-a.id},
  creds:{get:()=>creds,set:v=>{creds=v},key:'m_creds',cmp:(a,b)=>a.id-b.id},
  custs:{get:()=>custs,set:v=>{custs=v},key:'m_custs',cmp:(a,b)=>a.id-b.id},
  trash:{get:()=>trash,set:v=>{trash=v},key:'m_trash',cmp:(a,b)=>String(b.deletedAt||'').localeCompare(String(a.deletedAt||''))},
  audit:{get:()=>audit,set:v=>{audit=v.slice(0,400)},key:'m_audit',cmp:(a,b)=>b.id-a.id,noDel:true},
  drafts:{get:()=>Object.keys(drafts).filter(k=>Array.isArray(drafts[k])&&drafts[k].length).map(k=>({id:k,parts:drafts[k]})),
    set:v=>{const o={};v.forEach(r=>{if(r&&r.id)o[r.id]=r.parts||[]});drafts=o},key:'m_drafts',cache:()=>drafts}
};
const SYNCKEY=new Map(Object.entries(SYNC).map(([c,S])=>[S.key,c]));
const SY={base:{},pend:ls.get('m_pend',{}),since:+ls.get('m_since',0)||0,busy:false,again:false,t:null,state:'off',last:0,app:null,updNote:false,needRender:false,err:''};
function syncInit(){SY.base={};for(const c in SYNC){const B=SY.base[c]=new Map();for(const r of SYNC[c].get()){if(!r||r.id==null)continue;const id=String(r.id),pk=c+'|'+id;
    if(pk in SY.pend){if(SY.pend[pk]!==null)B.set(id,SY.pend[pk])}else B.set(id,sj(r))}
  for(const pk in SY.pend){const [pc,id]=[pk.slice(0,pk.indexOf('|')),pk.slice(pk.indexOf('|')+1)];if(pc===c&&!B.has(id)&&SY.pend[pk]!==null&&!SYNC[c].get().some(r=>r&&String(r.id)===id))B.set(id,SY.pend[pk])}}}
function markDirty(c){const S=SYNC[c],B=SY.base[c]||(SY.base[c]=new Map()),seen=new Set();
  for(const r of S.get()){if(!r||r.id==null)continue;const id=String(r.id),pk=c+'|'+id;seen.add(id);
    if(B.get(id)!==sj(r)){if(!(pk in SY.pend))SY.pend[pk]=B.has(id)?B.get(id):null}else delete SY.pend[pk]}
  if(!S.noDel)for(const [id,bj] of B){if(!seen.has(id)){const pk=c+'|'+id;if(!(pk in SY.pend))SY.pend[pk]=bj}}
  rawSet('m_pend',SY.pend)}
{const _set=ls.set;ls.set=(k,v)=>{_set(k,v);const c=SYNCKEY.get(k);if(c&&TOKEN){markDirty(c);syncSoon()}}}
function syncSoon(ms){clearTimeout(SY.t);SY.t=setTimeout(syncNow,ms==null?300:ms)}
const pendN=()=>Object.keys(SY.pend).length;
function setSync(s,err){SY.state=s;if(err!==undefined)SY.err=err;const L=syncLabel();document.querySelectorAll('.sdot').forEach(d=>{d.className='sdot '+s;d.title=L});document.querySelectorAll('.slbl').forEach(e=>{e.textContent=L})}
function syncLabel(){const n=pendN();return SY.state==='off'?(n?'بدون اینترنت — '+toFa(n)+' تغییر در صف ارسال':'اتصال به سرور برقرار نیست'):n?'در حال ارسال '+toFa(n)+' تغییر…':'همگام با سرور'+(SY.last?' — '+hm(new Date(SY.last).toISOString()):'')}
async function api(path,body,method){let r;
  try{r=await fetch(API_BASE+path,{method:method||(body!==undefined?'POST':'GET'),headers:{'Content-Type':'application/json',...(TOKEN?{Authorization:'Bearer '+TOKEN}:{})},body:body!==undefined?JSON.stringify(body):undefined,cache:'no-store'})}
  catch(e){throw Object.assign(new Error('اتصال به سرور برقرار نشد؛ اینترنت را بررسی کنید'),{net:true})}
  const av=r.headers.get('X-App-Version');if(av)noteApp(av);
  let j=null;try{j=await r.json()}catch(e){}
  if(r.status===401&&TOKEN&&!/\/api\/(login|setup)$/.test(path)){forceLogout('نشست شما تمام شده یا رمز تغییر کرده؛ دوباره وارد شوید');throw Object.assign(new Error('auth'),{status:401})}
  if(!r.ok)throw Object.assign(new Error((j&&j.error)||('خطای سرور ('+r.status+')')),{status:r.status});return j}
function noteApp(v){if(!SY.app){SY.app=v;return}if(v!==SY.app&&!SY.updNote){SY.updNote=true;toast('نسخه جدید برنامه آماده است','','به‌روزرسانی',()=>location.reload())}}
function findIdx(arr){const m=new Map();arr.forEach((r,i)=>{if(r&&r.id!=null)m.set(String(r.id),i)});return m}
async function syncNow(){if(!TOKEN)return;if(SY.busy){SY.again=true;return}SY.busy=true;clearTimeout(SY.t);
  try{
    if(!SY.scanned){for(const c in SYNC)markDirty(c);SY.scanned=true}
    const sent={},changes=[];
    for(const pk in SY.pend){const i=pk.indexOf('|'),c=pk.slice(0,i),id=pk.slice(i+1);if(!SYNC[c])continue;const r=SYNC[c].get().find(x=>x&&String(x.id)===id);
      if(!r&&SYNC[c].noDel){delete SY.pend[pk];continue}
      const j=r?sj(r):null;sent[pk]=j;changes.push({coll:c,id,base:SY.pend[pk]===null?null:JSON.parse(SY.pend[pk]),data:r?JSON.parse(j):null})}
    if(changes.length)setSync('busy');
    let res=await api('/api/sync',{since:SY.since,changes});try{if(res&&res.me)meUpdate(res.me)}catch(e){}try{if(res&&+res.v>APP_V){if(location.hostname==='raw.githack.com')checkUpdate(false);else updFound(+res.v)}}catch(e){}
    applyRemote(res,sent);
    while(res.more){res=await api('/api/sync',{since:SY.since,changes:[]});applyRemote(res,{})}
    if(res.rejected&&res.rejected.length)toast(res.rejected[0].why||'این تغییر مجاز نبود',true);
    SY.last=Date.now();rawSet('m_srv',1);setSync(pendN()?'busy':'ok','');flushImgs();
  }catch(e){if(e.status!==401)setSync(e.net?'off':'err',e.message)}
  finally{SY.busy=false;if(SY.again){SY.again=false;syncSoon(50)}}}
/* نقش یا دسترسی‌های این کاربر روی سرور عوض شد → فوراً در برنامه اعمال کن */
function meUpdate(u){if(!ME||!u||u.id!==ME.id)return;const k=x=>JSON.stringify([x.role,(x.perms||[]).slice().sort(),x.name]);if(k(ME)===k(u))return;
  const was=ME.role;ME={...ME,...u};rawSet('m_me',ME);user=ME.name;applyPerms();try{remoteRefresh()}catch(e){}
  toast(was!==u.role?'نقش حساب شما به «'+(ROLE[u.role]||u.role)+'» تغییر کرد ✓':'دسترسی‌های حساب شما به‌روز شد ✓')}
function applyRemote(res,sent){const touched=new Set(),byColl={};
  for(const ch of res.changes||[]){if(!SYNC[ch.coll])continue;(byColl[ch.coll]=byColl[ch.coll]||[]).push(ch)}
  for(const c in SYNC){const S=SYNC[c],B=SY.base[c]||(SY.base[c]=new Map()),list=byColl[c]||[];
    if(!res.full&&!list.length)continue;
    let arr=S.get().slice(),idx=findIdx(arr);
    const keepLocal=(pk,id)=>{const r=idx.has(id)?arr[idx.get(id)]:null,cj=r?sj(r):null;return (pk in sent)?cj!==sent[pk]:(pk in SY.pend)};
    if(res.full){const srv=new Map(list.map(ch=>[String(ch.id),ch])),out=[];B.clear();
      for(const [id,ch] of srv){const pk=c+'|'+id;if(keepLocal(pk,id)){const r=idx.has(id)?arr[idx.get(id)]:null;if(r)out.push(r);if(pk in sent){if(sent[pk]!==null)B.set(id,sent[pk]);SY.pend[pk]=sent[pk]}else if(SY.pend[pk]!==null)B.set(id,SY.pend[pk]);continue}
        const loc=idx.has(id)?arr[idx.get(id)]:null;out.push(loc?patchIn(loc,ch.data):ch.data);B.set(id,sj(ch.data));delete SY.pend[pk]}
      for(const r of arr){if(!r||r.id==null)continue;const id=String(r.id),pk=c+'|'+id;if(srv.has(id))continue;if(keepLocal(pk,id)&&r)out.push(r);else delete SY.pend[pk]}
      arr=out;touched.add(c)}
    else for(const ch of list){const id=String(ch.id),pk=c+'|'+id;
      if(keepLocal(pk,id)){if(pk in sent){if(sent[pk]===null)B.delete(id);else B.set(id,sent[pk]);SY.pend[pk]=sent[pk]}continue}
      if(ch.deleted){if(idx.has(id)){arr.splice(idx.get(id),1);idx=findIdx(arr)}B.delete(id)}
      else{const isNew=!idx.has(id),mine=pk in sent;if(idx.has(id))patchIn(arr[idx.get(id)],ch.data);else{arr.push(ch.data);idx.set(id,arr.length-1)}B.set(id,sj(ch.data));
        if(!mine&&FRESH_C.includes(c)){FLASH.add(id);SY.newN=(SY.newN||0)+1;if(isNew)SY.addN=(SY.addN||0)+1}}
      delete SY.pend[pk];touched.add(c)}
    if(touched.has(c)){if(S.cmp)arr.sort(S.cmp);S.set(arr);rawSet(S.key,S.cache?S.cache():S.get())}}
  for(const pk in sent){if(!(pk in SY.pend))continue;const i=pk.indexOf('|'),c=pk.slice(0,i),id=pk.slice(i+1),r=SYNC[c].get().find(x=>x&&String(x.id)===id),cj=r?sj(r):null;
    if(cj===sent[pk]){delete SY.pend[pk];const B=SY.base[c];if(cj===null)B.delete(id);else B.set(id,cj)}}
  SY.since=res.ver;rawSet('m_since',SY.since);rawSet('m_pend',SY.pend);
  if(touched.size){alloc=null;remoteRefresh()}
  if(SY.scanned&&!SY.manual){const k=(SY.newN||0)-(SY.annN||0);if(k>0&&res.changes&&res.changes.length&&!res.full){SY.annN=SY.newN;if(!SY.quiet)toast(toFa(k)+' مورد تازه دریافت شد')}else SY.annN=SY.newN}}
const canRender=()=>!['entry','bulk','cwiz','pwiz'].includes(cur)&&$('ov').classList.contains('hide')&&$('pv').classList.contains('hide')&&!(document.activeElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))&&!document.querySelector('.swr.on');
function remoteRefresh(){if(!canRender()){SY.needRender=true;try{$('dock').innerHTML=dockHTML();dockInd()}catch(e){}return}SY.needRender=false;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;flashNew()}
document.addEventListener('focusout',()=>setTimeout(()=>{if(SY.needRender&&canRender())remoteRefresh()},250));
setInterval(()=>{if(TOKEN&&document.visibilityState==='visible')syncNow()},4000);
setInterval(()=>{if(TOKEN&&document.visibilityState!=='visible')syncNow()},60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&TOKEN){syncNow();if(SY.updNote&&cur==='home'&&$('ov').classList.contains('hide'))location.reload()}});
window.addEventListener('online',()=>syncSoon(100));
/* ---------- عکس رسیدها روی سرور ---------- */
{const _put=imgPut,_get=imgGet,_del=imgDel;
  imgPut=async(k,v)=>{const ok=await _put(k,v);if(TOKEN)api('/api/img/'+encodeURIComponent(k),{data:v},'PUT').catch(e=>{if(e&&e.status===403){toast(e.message,true);return}const q=ls.get('m_imgq',[]);if(!q.includes(k)){q.push(k);rawSet('m_imgq',q)}});return ok};
  imgGet=async k=>{let v=await _get(k);if(!v&&TOKEN){try{const j=await api('/api/img/'+encodeURIComponent(k));if(j&&j.data){v=j.data;_put(k,v)}}catch(e){}}return v};
  imgDel=async k=>{await _del(k);if(TOKEN)api('/api/img/'+encodeURIComponent(k),undefined,'DELETE').catch(e=>{if(e&&e.status===403)toast(e.message,true)})}}
async function flushImgs(){const q=ls.get('m_imgq',[]);if(!q.length)return;const left=[];for(const k of q){try{const v=await imgGet(k);if(v)await api('/api/img/'+encodeURIComponent(k),{data:v},'PUT')}catch(e){if(!(e&&e.status===403))left.push(k)}}rawSet('m_imgq',left)}
/* ---------- صفحه ورود و راه‌اندازی ---------- */
function showAuth(msg){const a=$('auth');a.classList.remove('hide');a.innerHTML=`<div class="authc"><div class="amk">م</div><b class="atl">بده بستون</b><small class="ast">طلای مطلا</small><div class="aspin">در حال اتصال…</div></div>`;
  api('/api/status').then(s=>authForm(s.setup?'setup':'login',msg)).catch(e=>{a.innerHTML=`<div class="authc"><div class="amk">م</div><b class="atl">بده بستون</b><div class="msg bad" style="margin-top:14px">${esc(e.message)}</div><button class="btn gold" data-act="authRetry" style="width:100%">تلاش دوباره</button></div>`})}
function authForm(mode,msg){const a=$('auth'),su=mode==='setup';
  a.innerHTML=`<form class="authc" id="authf" autocomplete="on" onsubmit="return false"><div class="amk">م</div><b class="atl">بده بستون</b><small class="ast">${su?'راه‌اندازی اولیه — ساخت حساب مدیر':'ورود به بده بستون'}</small>
  ${msg?`<div class="msg warn">${esc(msg)}</div>`:''}
  ${su?`<div class="f"><label>نام شما</label><input id="an" autocomplete="name" placeholder="مثلاً علی رضایی"></div>`:''}
  <div class="f"><label>نام کاربری</label><input id="au" class="ltr" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="latin" placeholder="username"></div>
  <div class="f"><label>رمز عبور</label><div class="pw"><input id="ap" class="ltr" type="password" autocomplete="${su?'new-password':'current-password'}" placeholder="••••••"><button type="button" class="pwt" data-act="pwToggle" data-t="ap" aria-label="نمایش رمز">${ic('eye')}</button></div></div>
  ${su?`<div class="f"><label>تکرار رمز عبور</label><input id="ap2" class="ltr" type="password" autocomplete="new-password"></div>`:''}
  <div id="aerr"></div><button class="btn gold" id="abtn" data-act="${su?'authSetup':'authLogin'}" style="width:100%">${su?'ساخت حساب مدیر و ورود':'ورود'}</button>
  ${su?'':'<div class="ahint">نام کاربری و رمز را از مدیر مغازه بگیرید.</div>'}</form>`;
  const f=a.querySelector('#authf');f.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ACT[su?'authSetup':'authLogin']()}});setTimeout(()=>{const i=$(su?'an':'au');if(i)i.focus()},80)}
function authErr(m){const e=$('aerr');if(e)e.innerHTML=`<div class="msg bad">${esc(m)}</div>`;const b=$('abtn');if(b){b.disabled=false;b.classList.remove('wait')}}
function authBusy(){const b=$('abtn');if(b){b.disabled=true;b.classList.add('wait')}const e=$('aerr');if(e)e.innerHTML=''}
function loggedIn(r){TOKEN=r.token;try{localStorage.setItem('m_token',TOKEN)}catch(e){}ME=r.user;rawSet('m_me',ME);user=ME.name;applyPerms();$('auth').classList.add('hide');$('auth').innerHTML='';
  const hasLocal=entries.length||batches.length||creds.length||Object.values(drafts).some(v=>v&&v.length);
  if(hasLocal&&!ls.get('m_srv',0)&&isAdmin()){render(true);sheet(`<div class="sh-h"><b>انتقال اطلاعات این گوشی به سرور</b></div><div class="muted" style="font-size:13.5px;line-height:1.9;margin:-4px 2px 12px">این گوشی ${fmt(entries.length)} واریزی، ${fmt(batches.length)} لیست پیگیری و ${fmt(creds.length)} حساب بدهی دارد که قبل از اتصال به سرور ثبت شده‌اند. منتقل شوند تا همه همکاران ببینند؟</div><div class="row"><button class="btn sec" data-act="migNo">نه، فقط اطلاعات سرور</button><button class="btn gold" data-act="migYes">انتقال به سرور</button></div>`);return}
  startFresh(false)}
function startFresh(upload){SY.pend={};SY.since=0;if(upload){for(const c in SYNC)for(const r of SYNC[c].get())if(r&&r.id!=null)SY.pend[c+'|'+r.id]=null}rawSet('m_pend',SY.pend);syncInit();if(upload)for(const k in SY.pend){const c=k.slice(0,k.indexOf('|'));SY.base[c].delete(k.slice(k.indexOf('|')+1))}
  render(true);toast(upload?'در حال انتقال اطلاعات به سرور…':'خوش آمدید '+ME.name);syncNow().then(()=>{if(upload&&!pendN())toast('اطلاعات این گوشی به سرور منتقل شد ✓')})}
function clearLocal(){entries=[];sources=[];batches=[];creds=[];trash=[];audit=[];drafts={};for(const c in SYNC){const S=SYNC[c];rawSet(S.key,S.cache?S.cache():S.get())}SY.pend={};SY.since=0;SY.base={};['m_pend','m_since','m_srv','m_imgq'].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}})}
function forceLogout(msg){TOKEN='';ME=null;try{localStorage.removeItem('m_token');localStorage.removeItem('m_me')}catch(e){}clearLocal();closeSheet();cur='home';render();showAuth(msg)}
/* ---------- حساب کاربری ---------- */
const ROLE={admin:'مدیر',staff:'کارمند'};
function pwSheet(){sheet(`<div class="sh-h"><b>تغییر رمز عبور</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="f"><label>رمز فعلی</label><input id="po" class="ltr" type="password" autocomplete="current-password"></div>
  <div class="f"><label>رمز جدید <i>(حداقل ۶ کاراکتر)</i></label><input id="pn1" class="ltr" type="password" autocomplete="new-password"></div>
  <div class="f"><label>تکرار رمز جدید</label><input id="pn2" class="ltr" type="password" autocomplete="new-password"></div>
  <div class="row"><button class="btn gold" data-act="pwSave">ذخیره رمز جدید</button></div>`);setTimeout(()=>$('po')&&$('po').focus(),60)}
/* ---------- مدیریت کاربران ---------- */
let USERS=null,usersErr='';
function vUsers(){if(!isAdmin())return '<div class="card empty"><b>فقط مدیر دسترسی دارد</b></div>';
  if(usersErr)return `<div class="msg bad">${esc(usersErr)}</div><div class="row"><button class="btn sec" data-act="usersLoad">تلاش دوباره</button></div>`;
  if(!USERS)return '<div class="card empty"><b>در حال دریافت فهرست کاربران…</b></div>';
  const act=USERS.filter(u=>u.active).length;
  return `<div class="ingot"><div class="lb">کاربران سامانه</div><div class="v">${fmt(USERS.length)}<small>نفر</small></div><div class="row3"><div><small>فعال</small><b>${fmt(act)}</b></div><div><small>مدیر</small><b>${fmt(USERS.filter(u=>u.role==='admin').length)}</b></div><div><small>غیرفعال</small><b>${fmt(USERS.length-act)}</b></div></div></div>
  <div class="sec-h"><b>همکاران</b><small class="muted">برای ویرایش بزنید</small></div>
  ${USERS.map(u=>`<button class="lrow${u.active?'':' off'}" data-act="userEdit" data-id="${u.id}"><span class="ic gd">${esc(userInit(u.name))}</span><span class="tx"><b>${esc(u.name)}${u.id===ME.id?' <small class="muted">(شما)</small>':''}</b><small><bdi dir="ltr">@${esc(u.username)}</bdi> · ${u.last_login?'آخرین ورود '+relDay(isoOfTs(u.last_login)):'هنوز وارد نشده'}</small><span class="tags"><span class="pill ${u.role==='admin'?'gd':'g'}">${ROLE[u.role]}</span>${u.role==='admin'?'':`<span class="pill g">${fmt((u.perms||DEF_STAFF).length)} از ${fmt(PERMS.length)} دسترسی</span>`}${u.active?'':'<span class="pill rd">غیرفعال</span>'}</span></span>${fwd()}</button>`).join('')}`}
const aUsers=()=>isAdmin()?`<button class="btn gold" data-act="userNew">${ic('plus')} افزودن همکار</button>`:'';
function bindUsers(){if(!USERS&&!usersErr)loadUsers()}
async function loadUsers(){usersErr='';try{const j=await api('/api/users');USERS=j.users}catch(e){if(e.status!==401)usersErr=e.message}if(cur==='users')render()}
const genPass=()=>{const a='abcdefghjkmnpqrstuvwxyz23456789';let s='';const r=crypto.getRandomValues(new Uint32Array(8));for(const x of r)s+=a[x%a.length];return s};
const permList=(role,perms)=>`<div id="uperms" class="${role==='admin'?'adm':''}"><div class="pmh">${role==='admin'?'مدیر همه دسترسی‌ها را دارد، به‌علاوه مدیریت کاربران و پشتیبان.':'دسترسی‌های این همکار را روشن یا خاموش کنید:'}</div>
  <div class="pml">${PERMS.map(([k,t,d])=>`<label class="pmi"><span class="tx"><b>${t}</b><small>${d}</small></span><input type="checkbox" data-p="${k}"${role==='admin'||perms.includes(k)?' checked':''}${role==='admin'?' disabled':''}><span class="tg"></span></label>`).join('')}</div></div>`;
const readPerms=()=>[...document.querySelectorAll('#uperms input[data-p]')].filter(i=>i.checked).map(i=>i.dataset.p);
const roleSeg=r=>`<div class="seg" id="urole">${[['staff','کارمند'],['admin','مدیر']].map(([k,t])=>`<button type="button" class="${r===k?'on':''}" data-act="uRole" data-r="${k}">${t}</button>`).join('')}</div><div class="muted" style="font-size:12px;margin:-4px 2px 12px" id="uroleh">${r==='admin'?'همه کارها و مدیریت کاربران':'فقط کارهایی که پایین روشن کنید'}</div>`;
let uTmp={};
function userNew(){uTmp={role:'staff'};const p=genPass();
  sheet(`<div class="sh-h"><b>افزودن همکار</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="f"><label>نام کامل</label><input id="unm" placeholder="مثلاً مریم احمدی" autocomplete="off"></div>
  <div class="f"><label>نام کاربری <i>(انگلیسی، برای ورود)</i></label><input id="uun" class="ltr" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="maryam" autocomplete="off"></div>
  <div class="f"><label>رمز عبور</label><div class="pw"><input id="upw" class="ltr" value="${p}" autocomplete="off"><button type="button" class="pwt" data-act="uGen" aria-label="رمز تصادفی">${ic('refresh')}</button></div></div>
  <label class="albl" style="margin-top:4px">نقش</label>${roleSeg('staff')}${permList('staff',DEF_STAFF)}
  <div class="row"><button class="btn gold" data-act="userCreate">ساخت حساب</button></div>`);setTimeout(()=>$('unm')&&$('unm').focus(),60)}
function userEdit(id){const u=(USERS||[]).find(x=>x.id==id);if(!u)return;uTmp={id:u.id,role:u.role,active:u.active};
  sheet(`<div class="sh-h"><div><b>${esc(u.name)}</b><small class="shsub ltrv">@${esc(u.username)}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="f"><label>نام کامل</label><input id="unm" value="${esc(u.name)}" autocomplete="off"></div>
  <label class="albl" style="margin-top:4px">نقش</label>${roleSeg(u.role)}${permList(u.role,u.perms||DEF_STAFF)}
  <div class="f"><label>رمز عبور جدید <i>(خالی بماند یعنی تغییر نکند)</i></label><div class="pw"><input id="upw" class="ltr" placeholder="بدون تغییر" autocomplete="off"><button type="button" class="pwt" data-act="uGen" aria-label="رمز تصادفی">${ic('refresh')}</button></div></div>
  ${u.id===ME.id?'':`<label class="sw"><input type="checkbox" id="uact"${u.active?' checked':''}><span class="tr"></span><span>حساب فعال باشد <small class="muted">(غیرفعال = بلافاصله از برنامه خارج می‌شود)</small></span></label>`}
  <div class="row" style="margin-top:14px">${u.id===ME.id?'':`<button class="btn sec" data-act="userDel" style="color:var(--red);flex:0 0 auto;padding:0 16px">${ic('trash')}</button>`}<button class="btn gold" data-act="userSave">ذخیره</button></div>`)}
function credCard(u,p){sheet(`<div class="sh-h"><b>حساب «${esc(u.name)}» ساخته شد</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="muted" style="font-size:13px;margin:-4px 2px 10px">این اطلاعات را برای همکارتان بفرستید. بعد از ورود می‌تواند رمزش را عوض کند.</div>
  <div class="card cinfo"><div class="ci"><small>آدرس برنامه</small><b class="ltrv">${esc(appURL())}</b></div><div class="ci"><small>نام کاربری</small><b class="ltrv">${esc(u.username)}</b></div><div class="ci"><small>رمز عبور</small><b class="ltrv">${esc(p)}</b></div></div>
  <div class="row"><button class="btn gold" data-act="credCopyU" data-u="${esc(u.username)}" data-p="${esc(p)}" data-n="${esc(u.name)}">${ic('copy')} کپی برای ارسال</button></div>`)}
const appURL=()=>API_BASE||location.origin;
/* ---------- اپ اندروید: ذخیره فایل، چاپ و اشتراک از طریق پل بومی ---------- */
if(window.AndroidBridge){
  const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s)};
  save=async(name,data,ok)=>{const ext=name.split('.').pop(),type=MIME[ext]||'application/octet-stream';const u8=typeof data==='string'?new TextEncoder().encode(data):data instanceof Uint8Array?data:new Uint8Array(data);
    if(window.AndroidBridge.saveFile(name,b64(u8),type))toast(ok||'ذخیره شد');};
  /* چاپ در اپ اندروید: منابع بیرونی حذف می‌شوند تا صفحه چاپ بدون معطلی آماده شود */
  printReport=function(){if(!window.AndroidBridge.version){askConfirm('برای چاپ و ذخیره PDF، نسخه جدید اپ اندروید لازم است. الان دانلود شود؟ (اطلاعات روی سرور است و چیزی پاک نمی‌شود)','دانلود نسخه جدید',()=>ACT.getApk());return}
    let html=(window.__pv||withCtx(reportHTML)).replace(/<button class="pb"[^>]*>.*?<\/button>/,'').replace(/<link[^>]+(googleapis|gstatic)[^>]*>/g,'').replace(/<script[\s\S]*?<\/script>/g,'');
    toast('در حال آماده‌سازی چاپ…');try{window.AndroidBridge.printHtml(html,'Motalla')}catch(e){toast('چاپ در این گوشی ممکن نشد',true)}};
}
/* ---------- خانه: فهرست عمودی وضعیت واریزی‌ها ---------- */
let homeSt=ls.get('m_homest','pend');
/* ---------- نشان وضعیت مینیمال ---------- */
const stMark=st=>`<span class="stm ${st}" role="img" aria-label="${ST[st]?ST[st][0]:''}">${st==='ok'?'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>':st==='fail'?'<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>':'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/></svg>'}</span>`;
let dayOpen=new Set();
/* پیش‌نمایش: گزارش A4 را به عرض صفحه گوشی کوچک کن (فقط نمایش؛ چاپ دست نمی‌خورد) */
function pvFit(){const f=$('pvf');if(!f)return;try{const d=f.contentDocument;if(!d||!d.body)return;d.documentElement.style.zoom='';const w=Math.max(d.documentElement.scrollWidth,d.body.scrollWidth),W=f.clientWidth;if(w>W+2)d.documentElement.style.zoom=String(Math.max(.3,(W-4)/w))}catch(e){}}
{const f=$('pvf');if(f)f.addEventListener('load',()=>setTimeout(pvFit,60))}
window.addEventListener('resize',()=>{if(!$('pv').classList.contains('hide'))pvFit()});
/* ---------- تنظیمات و حالت روز/شب ---------- */
Object.assign(IC,{sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M21.5 20a6.5 6.5 0 00-4-6"/>',bank:'<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',down:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',share:'<path d="M12 15V4M8 8l4-4 4 4M5 13v6a1 1 0 001 1h12a1 1 0 001-1v-6"/>',out:'<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'});
let themePref=ls.get('m_theme','auto');if(!['auto','light','dark'].includes(themePref))themePref='auto';
const IOS_SA=navigator.standalone===true;
const sysDark=matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){const r=document.documentElement;if(themePref==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',themePref);
  const dark=themePref==='dark'||(themePref==='auto'&&sysDark.matches),bg=dark?'#0a1222':'#f5f6f8';
  const old=[...document.querySelectorAll('meta[name="theme-color"]')];if(!(old.length===1&&old[0].content===bg&&!old[0].media)){old.forEach(m=>m.remove());const n=document.createElement('meta');n.name='theme-color';n.content=bg;document.head.appendChild(n)}
  try{if(location.protocol==='https:')document.cookie='m_theme='+themePref+';path=/;max-age=31536000;samesite=lax;secure'}catch(e){}
  try{if(window.AndroidBridge&&AndroidBridge.setTheme)AndroidBridge.setTheme(window.AndroidBridge.setStatusBar?(dark?'#121c32':'#ffffff'):bg,dark)}catch(e){}
  try{paintBars()}catch(e){}}
/* حالت خودکار در آیفون: وقتی حالت گوشی عوض شد، صفحه در اولین فرصت امن تازه می‌شود تا نوار بالا هم عوض شود */
let themeReload=false;const safeIdle=()=>$('ov').classList.contains('hide')&&!(document.activeElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))&&cur!=='entry'&&cur!=='cwiz'&&cur!=='pwiz';
function onSysTheme(){if(themePref==='auto')applyTheme()}
document.addEventListener('visibilitychange',()=>{if(themeReload&&document.visibilityState==='visible'&&safeIdle())location.reload()});
applyTheme();try{sysDark.addEventListener('change',onSysTheme)}catch(e){try{sysDark.addListener(onSysTheme)}catch(_){}}
const THEMES=[['light','روز','همیشه روشن','l'],['dark','شب','همیشه تیره','d'],['auto','خودکار','مثل گوشی','a']];
const APK_URL='https://motalla.ir/app.apk',WEB_URL='https://motalla.ir';
function vSettings(){const sgi=(act,icn,cls,t,sub,extra,attrs)=>`<button class="sgi${cls.indexOf('rd')>=0?' rd':''}" data-act="${act}"${attrs||''}><span class="si ${cls.replace('rd','')}">${ic(icn)}</span><span class="tx"><b>${t}</b>${sub?`<small>${sub}</small>`:''}</span>${extra==null?`<span class="cv">${ic('back')}</span>`:extra}</button>`;
  const pv=k=>k==='a'?'<div class="pv a"><span></span></div>':`<div class="pv ${k}"><i class="b"></i><i></i><i class="g"></i></div>`;
  let h='<div class="stg">';
  if(ME)h+=`<div class="prof"><div class="av">${esc(userInit(ME.name))}</div><div class="tx"><b>${esc(ME.name)}</b><div class="ln"><span class="pill ${isAdmin()?'gd':'g'}">${ROLE[ME.role]||ME.role}</span><bdi dir="ltr">@${esc(ME.username)}</bdi></div><div class="ln"><span class="sdot ${SY.state}"></span><span class="slbl">${esc(syncLabel())}</span></div></div></div>`;
  h+=`<div class="sgh">ظاهر</div><div class="sgr"><div class="thm">${THEMES.map(([k,t,sub,c])=>`<button class="${themePref===k?'on':''}" data-act="setTheme" data-t="${k}" aria-pressed="${themePref===k}">${pv(c)}<span>${t}</span><small>${sub}</small></button>`).join('')}</div>${IOS_SA?`<div class="thn">آیفون رنگ نوار ساعت و باتری را فقط موقع باز شدن برنامه می‌خواند؛ بعد از عوض کردن حالت، برنامه را یک بار کامل ببندید و دوباره باز کنید.</div>`:''}</div>`;
  if(ME){h+=`<div class="sgh">حساب</div><div class="sgr">${sgi('pwSheet','key','','تغییر رمز عبور','رمز ورود خودتان را عوض کنید')}</div>`;
    if(!isAdmin())h+=`<div class="sgh">دسترسی‌های من</div><div class="sgr"><div class="mpl">${PERMS.map(([k,t])=>`<span class="pill ${can(k)?'okp':'g off'}">${can(k)?'✓':'—'} ${t}</span>`).join('')}</div></div>`+(can('src')?`<div class="sgh">مدیریت</div><div class="sgr">${sgi('tab','bank','g','حساب‌های بانکی','موجودی، لوگو و منبع‌های تقسیم',null,' data-n="banks"')}</div>`:'');
    if(isAdmin())h+=`<div class="sgh">مدیریت</div><div class="sgr">${sgi('go','users','g','کاربران','افزودن همکار، رمز عبور و دسترسی',null,' data-n="users"')}${sgi('tab','bank','g','حساب‌های بانکی','موجودی، لوگو و منبع‌های تقسیم',null,' data-n="banks"')}${sgi('go','down','g','پشتیبان‌ها','خودکار هر شب · دانلود و بازگردانی'+(bkDlAgo()===null||bkDlAgo()>=7?' · نسخه روی گوشی قدیمی است':''),null,' data-n="backups"')}${sgi('shareInstall','share','g','لینک نصب برای همکاران','آیفون و اندروید')}</div>`}
  const isAnd=/MotallaAndroid/.test(navigator.userAgent),oldApk=isAnd&&!(window.AndroidBridge&&AndroidBridge.version);
  if(oldApk)h+=`<div class="sgr" style="margin-top:12px;border-color:var(--gold)">${sgi('getApk','down','g','نسخه جدید اپ اندروید آماده است','برای چاپ PDF و امکانات جدید نصب کنید؛ روی همین برنامه نصب می‌شود و اطلاعات پاک نمی‌شود')}</div>`;
  if(ME&&can('debt'))h+=`<div class="sgh">ابزارها</div><div class="sgr">${sgi('tab','debt','g','تسویه بدهی','حساب‌های بدهی و واریز خریدارها',null,' data-n="debt"')}</div>`;
  h+=`<div class="sgh">برنامه</div><div class="sgr">${sgi('checkUpd','refresh','k','بررسی به‌روزرسانی','نسخه '+toFa(APP_V),'')}${!isAnd&&/Android/i.test(navigator.userAgent)?sgi('getApk','down','k','نصب اپ اندروید','دانلود فایل نصب'):''}</div>`;
  if(ME)h+=`<div class="sgr" style="margin-top:14px">${sgi('logout','out','r rd','خروج از حساب','اطلاعات این گوشی پاک می‌شود و روی سرور می‌ماند','')}</div>`;
  return h+`<div class="ver">مطلا · بده بستون · نسخه ${toFa(APP_V)}</div></div>`}
/* ---------- کشیدن برای تازه‌سازی، نوار بارگذاری و برجسته کردن اطلاعات تازه ---------- */
const FRESH_C=['entries','batches','creds','sources','custs'];let FLASH=new Set();
function flashNew(){if(!FLASH.size)return;const ids=FLASH;FLASH=new Set();
  requestAnimationFrame(()=>{const seen=new Set();document.querySelectorAll('#view [data-id],#view [data-b]').forEach(el=>{const k=String(el.dataset.id||el.dataset.b);if(!ids.has(k))return;
    const row=el.closest('.swr,.hsr,.drow,.slip,.lrow,.tg2,.card')||el;if(seen.has(row))return;seen.add(row);row.classList.remove('flash');void row.offsetWidth;row.classList.add('flash');setTimeout(()=>row.classList.remove('flash'),1800)})})}
let loadN=0;function loading(on){loadN=Math.max(0,loadN+(on?1:-1));document.body.classList.toggle('loading',loadN>0)}
/* همگام‌سازی کامل و صبر تا پایانش؛ تعداد موارد تازه را برمی‌گرداند */
async function refreshAll(){if(!TOKEN)return {ok:false,n:0,off:true};const n0=SY.newN||0,a0=SY.addN||0;
  for(let i=0;i<60&&SY.busy;i++)await new Promise(r=>setTimeout(r,100));
  await syncNow();for(let i=0;i<60&&SY.busy;i++)await new Promise(r=>setTimeout(r,100));
  try{checkUpdate(true)}catch(e){}
  return {ok:SY.state==='ok'||SY.state==='busy',off:SY.state==='off',err:SY.state==='err'?SY.err:'',n:(SY.newN||0)-n0,add:(SY.addN||0)-a0}}
function refreshMsg(r){if(r.off){toast('اتصال به اینترنت یا سرور برقرار نیست؛ اطلاعات همین گوشی نمایش داده می‌شود',true);return}
  if(r.err){toast(r.err,true);return}
  toast(r.n?('به‌روز شد ✓ · '+toFa(r.n)+' مورد تازه'+(r.add?' ('+toFa(r.add)+' جدید)':'')):'همه اطلاعات به‌روز است ✓')}
/* صفحه را با نوار بارگذاری از سرور تازه کن (هنگام رفتن به هر صفحه، بدون پیام) */
let quietT=0;function quietRefresh(){if(!TOKEN||Date.now()-quietT<2500)return;quietT=Date.now();loading(true);refreshAll().finally(()=>loading(false))}
(()=>{const V=()=>$('view'),P=$('ptr'),TH=70,MAX=120;let st=null,d=0,busy=false;
  const okStart=()=>!SLIDEP.has(cur)&&!busy&&$('ov').classList.contains('hide')&&$('pv').classList.contains('hide')&&$('auth').classList.contains('hide')&&!document.querySelector('.swr.on');
  const place=()=>{const b=$('bar');P.style.top=((b?b.getBoundingClientRect().bottom:60)+6)+'px'};
  const hp=()=>cur==='home'&&V().querySelector('.bpanel');
  const show=(y,spin)=>{const pn=hp();if(pn){const l=pn.querySelector('.blist,.bempty'),g=pn.querySelector('.grab');if(l){l.style.transform=y&&!spin?`translateY(${y*0.6}px)`:''}if(g){g.style.setProperty('--pp',Math.min(1,y/TH));g.classList.toggle('ready',y>=TH&&!spin)}pn.classList.toggle('pulling',!!y&&!spin);pn.classList.toggle('loading',!!spin);P.style.opacity=0;return}
    const v=V();let sp=v.querySelector(':scope>.vspin');if(!sp&&(y||spin)){sp=document.createElement('div');sp.className='vspin';sp.innerHTML='<i class="pspin"></i>';v.prepend(sp)}
    if(sp){sp.style.height=(spin?54:Math.min(y,70))+'px';sp.style.setProperty('--pp',Math.min(1,y/TH));sp.classList.toggle('spin',!!spin);if(!y&&!spin)sp.remove()}v.classList.toggle('vloading',!!spin);P.style.opacity=0;return;P.style.opacity=Math.min(1,y/TH);P.style.transform=`translate(-50%,${Math.min(y,MAX)*0.55-40}px) rotate(${y*3}deg)`;P.classList.toggle('spin',!!spin);P.classList.toggle('ready',y>=TH&&!spin)};
  document.addEventListener('touchstart',e=>{const v=V();if(e.touches.length!==1||!v||!v.contains(e.target)||v.scrollTop>0||!okStart())return;const t=e.touches[0];if(t.clientX>innerWidth-26)return;st={x:t.clientX,y:t.clientY,lk:null};d=0},{passive:true});
  document.addEventListener('touchmove',e=>{if(!st)return;const t=e.touches[0],dx=t.clientX-st.x,dy=t.clientY-st.y;
    if(!st.lk){if(Math.abs(dx)<6&&Math.abs(dy)<6)return;st.lk=(dy>0&&Math.abs(dy)>Math.abs(dx)*1.2&&V().scrollTop<=0)?'v':'x';if(st.lk==='v'){place();V().style.transition='none';P.style.transition='none';const pn=hp(),l=pn&&pn.querySelector('.blist,.bempty');if(l)l.style.transition='none'}}
    if(st.lk!=='v')return;e.preventDefault();d=Math.min(MAX,dy*0.5);show(d,false);if(d>=TH&&!st.hp){st.hp=1;try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}}},{passive:false});
  const end=async()=>{if(!st)return;const lk=st.lk;st=null;if(lk!=='v')return;const v=V();v.style.transition='transform .3s cubic-bezier(.2,.8,.2,1)';P.style.transition='transform .3s,opacity .3s';{const pn=hp(),l=pn&&pn.querySelector('.blist,.bempty');if(l)l.style.transition='transform .3s cubic-bezier(.2,.8,.2,1)'}
    if(d<TH){show(0,false);return}
    busy=true;show(56,true);loading(true);const t0=Date.now();let r;try{r=await refreshAll()}catch(_){r={off:true}}
    const w=600-(Date.now()-t0);if(w>0)await new Promise(x=>setTimeout(x,w));
    loading(false);busy=false;show(0,false);
    const vv=V(),y=vv.scrollTop;render();vv.scrollTop=y;flashNew();vv.classList.remove('in','bk');void vv.offsetWidth;vv.classList.add('in');refreshMsg(r)};
  document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',end,{passive:true});})();

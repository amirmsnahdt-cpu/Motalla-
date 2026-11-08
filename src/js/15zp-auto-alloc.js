/* ============ v82.2 (خواسته صاحب اپ): «تخصیص خودکار» واریزی‌های تخصیص‌نیافته یک لیست ============
   برنامه پیشنهاد می‌دهد، صاحب اپ می‌بیند و جابه‌جا می‌کند، بعد «ثبت همه»:
   ۱) اول هم‌بانک: هر حساب مغازه واریزی‌های بانک خودش را تا سقف موجودی آزادش برمی‌دارد (کارمزد بین‌بانکی کمتر)
   ۲) بعد بقیه: حساب‌ها به ترتیب بیشترین موجودی آزاد، نزدیک‌ترین ترکیب به سقف (best)
   سقف هر حساب = موجودی آزاد acFree (مانده نهایی منهای رزرو تخصیص‌های ارسال‌نشده) و اگر سقف روزانه (s.limit) دارد کمترِ این دو.
   حساب بدون مانده قبلی در پیشنهاد نیست (موجودی‌اش معلوم نیست) — اول «تطبیق موجودی‌ها».
   ثبت = همان تخصیص دستی (part با method 'manual')، پس ارسال و بقیه کارها مثل قبل است. */
let AA=null;
function aaCap(s){const f=acFree(s);if(f==null)return null;const l=+s.limit||0;return Math.max(0,l>0?Math.min(f,l):f)}
function aaPlan(){const P=aPool(),A=ownL().map(s=>({s,cap:aaCap(s),ids:[]})).filter(a=>a.cap!=null&&a.cap>0),left=new Map(P.map(x=>[x.id,x])),rest=a=>a.cap-a.ids.reduce((t,id)=>t+(+(P.find(x=>x.id===id)||{}).amount||0),0);
  for(const a of A){const bk=canon(acBank(a.s));if(!bk)continue;const L=[...left.values()].filter(x=>bankKey(x)===bk),pick=best(L,rest(a),0);pick.forEach(x=>{a.ids.push(x.id);left.delete(x.id)})}
  [...A].sort((x,y)=>rest(y)-rest(x)).forEach(a=>{const pick=best([...left.values()],rest(a),0);pick.forEach(x=>{a.ids.push(x.id);left.delete(x.id)})});
  return {A,P,left:[...left.keys()],unk:ownL().filter(s=>aaCap(s)==null)}}
ACT.aaOpen=()=>{if(!can('split'))return;if(!aPool().length){toast('واریزی تخصیص‌نیافته‌ای در این لیست نیست');return}AA=aaPlan();sheet(aaHTML())};
function aaHTML(){const {A,P,left,unk}=AA,byId=new Map(P.map(x=>[x.id,x])),am=ids=>ids.reduce((t,id)=>t+(+(byId.get(id)||{}).amount||0),0);
  const row=(id,ai)=>{const x=byId.get(id);if(!x)return '';const bk=bankKey(x);return `<div class="aar"><span class="aan"><b>${esc(fullName(x))}</b><small>${bk?esc(bk):'بانک نامعلوم'}</small></span><b class="aaa">${fmt(+x.amount||0)}</b><button type="button" class="aamv" data-act="aaMv" data-id="${esc(id)}" data-a="${ai}" aria-label="جابه‌جا">${ic('swap')}</button></div>`};
  const used=A.filter(a=>a.ids.length),tot=used.reduce((t,a)=>t+am(a.ids),0);
  return `<div class="sh-h"><div><b>تخصیص خودکار</b><small class="shsub">${toFa(P.length-left.length)} از ${toFa(P.length)} واریزی · ${fmt(tot)} تومان · ${esc(pdHead(ldKey))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${used.length?used.map(a=>{const ai=A.indexOf(a),bk=acBank(a.s),s=am(a.ids);return `<div class="aac"><div class="aah"><span class="brca">${bk?bankBadge(bk):esc(userInit(a.s.name))}</span><span class="aat"><b>${esc(a.s.name)}</b><small>${toFa(a.ids.length)} واریزی · ${a.cap-s<0?`<em class="aaneg">${fmt(s-a.cap)} بیشتر از موجودی آزاد</em>`:'بعد از این '+fmt(a.cap-s)+' آزاد'}</small></span><b class="aas">${fmt(s)}</b></div>${a.ids.map(id=>row(id,ai)).join('')}</div>`}).join(''):'<div class="aae">هیچ حسابی موجودی آزاد کافی ندارد</div>'}
  ${left.length?`<div class="aac aal"><div class="aah"><span class="brca">${ic('clock')}</span><span class="aat"><b>تخصیص‌نیافته</b><small>${toFa(left.length)} واریزی · موجودی آزاد کافی نبود یا کنار گذاشتید</small></span><b class="aas">${fmt(am(left))}</b></div>${left.map(id=>row(id,-1)).join('')}</div>`:''}
  ${unk.length?`<div class="aae">${ic('edit')} ${unk.map(s=>esc(s.name)).join('، ')}: مانده قبلی ثبت نشده، در پیشنهاد نیامد · «تطبیق موجودی‌ها» در صفحه بانک</div>`:''}
  ${used.length?`<button class="xgo" data-act="aaSave">${ic('check')} ثبت همه</button>`:''}`}
/* جابه‌جا: یک واریزی را به حساب دیگر یا «تخصیص‌نیافته» ببر */
ACT.aaMv=(d,e)=>{if(!AA)return;const id=isNaN(+d.id)?d.id:+d.id,from=+d.a,T=e&&e.target&&e.target.closest('.aamv');
  popMenu(T,[...AA.A.map((a,i)=>i===from?null:['aaTo',ic('bank'),a.s.name+(a.ids.length?' · '+toFa(a.ids.length):''),{id:d.id,a:from,t:i}]),from>=0?['aaTo',ic('clock'),'کنار بگذار (تخصیص‌نیافته)',{id:d.id,a:from,t:-1}]:null].filter(Boolean))};
ACT.aaTo=d=>{if(!AA)return;const key=String(d.id),from=+d.a,to=+d.t;
  if(from>=0){const a=AA.A[from];a.ids=a.ids.filter(z=>String(z)!==key)}else AA.left=AA.left.filter(z=>String(z)!==key);
  const real=AA.P.find(x=>String(x.id)===key);if(!real)return;if(to>=0)AA.A[to].ids.push(real.id);else AA.left.push(real.id);sheetKeep(aaHTML())};
ACT.aaSave=()=>{if(!AA)return;const now=new Date().toISOString(),pool=new Set(aPool().map(x=>x.id)),done=[];
  for(const a of AA.A){const ids=a.ids.filter(id=>pool.has(id));if(!ids.length)continue;const s=a.s,p={id:nid++,src:{id:s.id,name:s.name,bank:s.bank||''},method:'manual',param:{amount:0,min:0,max:0,cap:0,bank:'',count:0},ids,sent:false,pay:ldKey,at:now,auto:1};
    addPart(p);done.push(s.name+' '+toFa(ids.length)+' واریزی '+fmt(sum(partRows(p))))}
  if(!done.length){toast('چیزی برای ثبت نیست',true);return}saveD();logA('alloc','تخصیص خودکار',done.join(' | ')+' | '+pdHead(ldKey));AA=null;closeSheet();render();
  const r=aPool();toast('تخصیص خودکار ثبت شد'+(r.length?' · '+toFa(r.length)+' واریزی ماند':' · همه تخصیص یافت'))};

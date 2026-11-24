/* scale-read.js — reads the weight shown on a jewelry scale's seven-segment display from a phone photo.
   Classic script, no dependencies, no eval. Every top-level name starts with sgs / SGS.
   Entry: sgsRead(source, opts) -> Promise<{ok,text,value,digits,decimals,dotSeen,negative,conf,box,crop,polarity,ms,alts,why}>
   Stages: A) pyramid + local threshold + run-length connected components, both polarities -> rows of digit-like blobs
           B) per row: rotate/deslant/normalise to 64px digits (canvas affine), top-hat stroke map
           C) column segmentation -> seven zones per digit -> pattern match, decimal point, minus, sanity + confidence */
const SGS_VER='1.0';
/* bit order a=1 b=2 c=4 d=8 e=16 f=32 g=64 */
const SGS_PAT=[['0',63],['1',6],['2',91],['3',79],['4',102],['5',109],['6',125],['6',124],['7',7],['7',39],['8',127],['9',111],['9',103],
  ['-',64],['E',121],['r',80],['o',92],['L',56],['H',118],['F',113],['P',115],['A',119],['C',57],['U',62],['n',84],['d',94],['t',120],['c',88],['h',116],['J',14],['y',110],['_',8]];
/* raw score -> probability that the reading is exactly right (measured on synthetic photos, see REPORT.md) */
let SGS_CAL=[[0,0],[1,1]];
function sgsNow(){return(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now()}
function sgsCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}
function sgsLoad(source){return new Promise(function(res,rej){try{
  if(typeof source==='string'){const im=new Image();im.onload=function(){res({el:im,w:im.naturalWidth,h:im.naturalHeight})};im.onerror=function(){rej(new Error('image-load'))};im.src=source;return}
  if(typeof ImageData!=='undefined'&&source instanceof ImageData){const c=sgsCanvas(source.width,source.height);c.getContext('2d').putImageData(source,0,0);res({el:c,w:c.width,h:c.height});return}
  if(source&&source.tagName==='IMG'){if(source.complete&&source.naturalWidth){res({el:source,w:source.naturalWidth,h:source.naturalHeight});return}
    source.addEventListener('load',function(){res({el:source,w:source.naturalWidth,h:source.naturalHeight})},{once:true});source.addEventListener('error',function(){rej(new Error('image-load'))},{once:true});return}
  if(source&&source.width>0&&source.height>0){res({el:source,w:source.width,h:source.height});return}
  rej(new Error('bad-source'))}catch(e){rej(e)}})}
/* downscale in steps of at most 2x (plain bilinear is then a box filter in every browser) */
function sgsScaled(el,sx,sy,sw,sh,dw,dh){let cur=el,cx=sx,cy=sy,cw=sw,ch=sh;
  while(cw/dw>2.2){const nw=Math.max(dw,Math.round(cw/2)),nh=Math.max(dh,Math.round(ch/2)),c=sgsCanvas(nw,nh),g=c.getContext('2d');g.drawImage(cur,cx,cy,cw,ch,0,0,nw,nh);cur=c;cx=0;cy=0;cw=nw;ch=nh}
  const c=sgsCanvas(dw,dh),g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(cur,cx,cy,cw,ch,0,0,dw,dh);return c}
function sgsGray(cv){const w=cv.width,h=cv.height,d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data,G=new Uint8Array(w*h);for(let i=0,k=0;k<G.length;i+=4,k++){const r=d[i],g=d[i+1],b=d[i+2];let m=r>g?r:g;if(b>m)m=b;G[k]=(4*m+r+2*g+b)>>3}return G}
function sgsHalf(G,w,h){const W=w>>1,H=h>>1,O=new Uint8Array(W*H);for(let y=0;y<H;y++){const a=2*y*w,b=a+w,o=y*W;for(let x=0;x<W;x++){const i=2*x;O[o+x]=(G[a+i]+G[a+i+1]+G[b+i]+G[b+i+1]+2)>>2}}return{G:O,w:W,h:H}}
/* ---- stage A: components of both polarities in one pass (local mean threshold, run-length labelling) ---- */
function sgsComps(G,w,h){const W1=w+1,S=new Int32Array(W1*(h+1)),r=12,TR=.12,TA=10;
  for(let y=0;y<h;y++){let rs=0;const o=y*w,a=(y+1)*W1,b=y*W1;for(let x=0;x<w;x++){rs+=G[o+x];S[a+x+1]=S[b+x+1]+rs}}
  const mk=function(){return{xs:[],xe:[],yy:[],par:[],p0:0,p1:0}},P=[mk(),mk()];
  const find=function(par,i){while(par[i]!==i){par[i]=par[par[i]];i=par[i]}return i};
  const link=function(Q,c0){const xs=Q.xs,xe=Q.xe,par=Q.par,c1=xs.length;let p=Q.p0;const p1=Q.p1;
    for(let c=c0;c<c1;c++){while(p<p1&&xe[p]<xs[c]-1)p++;let q=p;while(q<p1&&xs[q]<=xe[c]+1){const a=find(par,c),b=find(par,q);if(a!==b)par[a]=b;q++}if(q>p)p=q-1}Q.p0=c0;Q.p1=c1};
  for(let y=0;y<h;y++){const y0=y-r<0?0:y-r,y1=y+r+1>h?h:y+r+1,o0=y0*W1,o1=y1*W1,hh=y1-y0,o=y*w,A=P[0],B=P[1],ca=A.xs.length,cb=B.xs.length;let sa=-1,sb=-1;
    for(let x=0;x<w;x++){const x0=x-r<0?0:x-r,x1=x+r+1>w?w:x+r+1,m=(S[o1+x1]-S[o0+x1]-S[o1+x0]+S[o0+x0])/((x1-x0)*hh),v=G[o+x];let d=m*TR;if(d<TA)d=TA;
      if(v<m-d){if(sa<0)sa=x}else if(sa>=0){A.xs.push(sa);A.xe.push(x-1);A.yy.push(y);A.par.push(A.par.length);sa=-1}
      if(v>m+d){if(sb<0)sb=x}else if(sb>=0){B.xs.push(sb);B.xe.push(x-1);B.yy.push(y);B.par.push(B.par.length);sb=-1}}
    if(sa>=0){A.xs.push(sa);A.xe.push(w-1);A.yy.push(y);A.par.push(A.par.length)}if(sb>=0){B.xs.push(sb);B.xe.push(w-1);B.yy.push(y);B.par.push(B.par.length)}
    link(A,ca);link(B,cb)}
  const out=[];for(let p=0;p<2;p++){const Q=P[p],n=Q.xs.length,x0=new Int32Array(n).fill(1e9),x1=new Int32Array(n).fill(-1),y0=new Int32Array(n).fill(1e9),y1=new Int32Array(n).fill(-1),ar=new Int32Array(n);
    for(let i=0;i<n;i++){const k=find(Q.par,i);if(Q.xs[i]<x0[k])x0[k]=Q.xs[i];if(Q.xe[i]>x1[k])x1[k]=Q.xe[i];if(Q.yy[i]<y0[k])y0[k]=Q.yy[i];if(Q.yy[i]>y1[k])y1[k]=Q.yy[i];ar[k]+=Q.xe[i]-Q.xs[i]+1}
    const L=[];for(let i=0;i<n;i++){if(x1[i]<0)continue;const cw=x1[i]-x0[i]+1,ch=y1[i]-y0[i]+1,a=ar[i];if(a<4||ch>72||cw>320)continue;if(cw>40&&ch<=3)continue;if(cw*ch>400&&a<.16*cw*ch)continue;L.push({x0:x0[i],y0:y0[i],x1:x1[i],y1:y1[i],a:a})}
    if(L.length>7000){L.sort(function(a,b){return b.a-a.a});L.length=7000}out.push(L)}
  return out}
function sgsUF(n){const p=new Int32Array(n);for(let i=0;i<n;i++)p[i]=i;return p}
function sgsFind(p,i){while(p[i]!==i){p[i]=p[p[i]];i=p[i]}return i}
/* segments -> glyph groups (boxes that nearly touch) */
function sgsGroup(L){const n=L.length,par=sgsUF(n),CS=40,grid=new Map();
  for(let i=0;i<n;i++){const c=L[i],e=1+Math.min(4,Math.round(.1*Math.max(c.x1-c.x0,c.y1-c.y0)));c.e=e;
    for(let gy=Math.floor((c.y0-e)/CS);gy<=Math.floor((c.y1+e)/CS);gy++)for(let gx=Math.floor((c.x0-e)/CS);gx<=Math.floor((c.x1+e)/CS);gx++){const k=gy*4096+gx;let a=grid.get(k);if(!a){a=[];grid.set(k,a)}
      if(a.length<60){for(let j=0;j<a.length;j++){const o=L[a[j]],ee=Math.max(e,o.e),gxp=Math.max(c.x0,o.x0)-Math.min(c.x1,o.x1)-1,gyp=Math.max(c.y0,o.y0)-Math.min(c.y1,o.y1)-1;if((gxp<=ee&&gyp<=ee)||(gyp<=1+.3*Math.max(c.y1-c.y0,o.y1-o.y0)&&Math.min(c.x1,o.x1)-Math.max(c.x0,o.x0)+1>=.5*Math.min(c.x1-c.x0+1,o.x1-o.x0+1))){const ra=sgsFind(par,i),rb=sgsFind(par,a[j]);if(ra!==rb)par[ra]=rb}}a.push(i)}}}
  const M=new Map();for(let i=0;i<n;i++){const k=sgsFind(par,i),c=L[i];let g=M.get(k);if(!g){g={x0:c.x0,y0:c.y0,x1:c.x1,y1:c.y1,a:0,n:0};M.set(k,g)}if(c.x0<g.x0)g.x0=c.x0;if(c.y0<g.y0)g.y0=c.y0;if(c.x1>g.x1)g.x1=c.x1;if(c.y1>g.y1)g.y1=c.y1;g.a+=c.a;g.n++}
  return Array.from(M.values())}
/* glyph groups -> rows */
function sgsRows(Gr){const C=[];for(let i=0;i<Gr.length;i++){const g=Gr[i],w=g.x1-g.x0+1,h=g.y1-g.y0+1;if(h<9||h>70||w<2||w>9*h||g.a<.1*w*h)continue;g.w=w;g.h=h;g.cy=(g.y0+g.y1)/2;C.push(g)}
  C.sort(function(a,b){return a.x0-b.x0});const n=C.length,par=sgsUF(n);
  for(let i=0;i<n;i++){const a=C[i];for(let j=i+1;j<n;j++){const b=C[j],dx=b.x0-a.x1;if(dx>75)break;const mh=Math.max(a.h,b.h);if(dx>1.05*mh)continue;if(Math.min(a.h,b.h)<.7*mh)continue;
      if(Math.abs(a.cy-b.cy)>.2*mh+.16*Math.max(0,dx))continue;const ra=sgsFind(par,i),rb=sgsFind(par,j);if(ra!==rb)par[ra]=rb}}
  const M=new Map();for(let i=0;i<n;i++){const k=sgsFind(par,i);let a=M.get(k);if(!a){a=[];M.set(k,a)}a.push(C[i])}
  const R=[];M.forEach(function(m){let x0=1e9,y0=1e9,x1=-1,y1=-1;const hs=[];let tall=0,sa=0,sb=0;for(let i=0;i<m.length;i++){const g=m[i];if(g.x0<x0)x0=g.x0;if(g.y0<y0)y0=g.y0;if(g.x1>x1)x1=g.x1;if(g.y1>y1)y1=g.y1;hs.push(g.h);if(g.h>=1.2*g.w)tall++;sa+=g.a;sb+=g.w*g.h}
    hs.sort(function(a,b){return a-b});const hm=hs[hs.length>>1],w=x1-x0+1;if(m.length<2&&w<1.5*hm)return;if(w<1.1*hm||w>12*hm)return;
    let ang=0;if(m.length>=2){let sx=0,sy=0,sxx=0,sxy=0;for(let i=0;i<m.length;i++){const g=m[i],cx=(g.x0+g.x1)/2;sx+=cx;sy+=g.cy;sxx+=cx*cx;sxy+=cx*g.cy}const N=m.length,dn=N*sxx-sx*sx;if(dn>1)ang=Math.atan((N*sxy-sx*sy)/dn)}
    if(ang>.22)ang=.22;if(ang<-.22)ang=-.22;const ne=Math.min(Math.max(m.length,w/(.8*hm)),7);let sf=m.length>1?.4+.6*tall/m.length:.6;if(sa>.84*sb)sf*=.5;R.push({x0:x0,y0:y0,x1:x1,y1:y1,hm:hm,n:m.length,ang:ang,score:ne*Math.pow(hm,1.25)*sf})});
  return R}
/* ---- stage B helpers ---- */
/* separable k x k min / max (van Herk), window centred, edges clamped */
function sgsMM(src,w,h,k,isMax){k|=1;const r=k>>1,tmp=new Uint8Array(w*h),dst=new Uint8Array(w*h),mx=Math.max(w,h)+2*r,p=new Uint8Array(mx),g=new Uint8Array(mx),hh=new Uint8Array(mx);
  const line=function(S,D,off,n,st){const m=n+2*r;for(let j=0;j<m;j++){let i=j-r;if(i<0)i=0;else if(i>=n)i=n-1;p[j]=S[off+i*st]}
    if(isMax){for(let j=0;j<m;j++)g[j]=(j%k===0)?p[j]:(g[j-1]>p[j]?g[j-1]:p[j]);for(let j=m-1;j>=0;j--)hh[j]=(j%k===k-1||j===m-1)?p[j]:(hh[j+1]>p[j]?hh[j+1]:p[j]);for(let i=0;i<n;i++){const a=hh[i],b=g[i+k-1];D[off+i*st]=a>b?a:b}}
    else{for(let j=0;j<m;j++)g[j]=(j%k===0)?p[j]:(g[j-1]<p[j]?g[j-1]:p[j]);for(let j=m-1;j>=0;j--)hh[j]=(j%k===k-1||j===m-1)?p[j]:(hh[j+1]<p[j]?hh[j+1]:p[j]);for(let i=0;i<n;i++){const a=hh[i],b=g[i+k-1];D[off+i*st]=a<b?a:b}}};
  for(let y=0;y<h;y++)line(src,tmp,y*w,w,1);for(let x=0;x<w;x++)line(tmp,dst,x,h,w);return dst}
/* stroke map 0..255: strokes thinner than k stand out from their own neighbourhood, normalised by the local stroke strength */
function sgsStroke(G,w,h,pol,k,kc){const n=w*h,V=new Uint8Array(n);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const xa=x>0?x-1:x,xb=x<w-1?x+1:x,ya=y>0?y-1:y,yb=y<h-1?y+1:y;const s=(G[ya*w+xa]+G[ya*w+x]+G[ya*w+xb]+G[y*w+xa]+2*G[y*w+x]+G[y*w+xb]+G[yb*w+xa]+G[yb*w+x]+G[yb*w+xb])/10;V[y*w+x]=pol?s:255-s}
  const op=sgsMM(sgsMM(V,w,h,k,false),w,h,k,true),D=new Uint8Array(n),hist=new Int32Array(256);let cnt=0;for(let i=0;i<n;i++){const d=V[i]-op[i];D[i]=d>0?d:0;if(d>8){hist[d]++;cnt++}}
  let p97=20,acc=0;for(let v=255;v>8;v--){acc+=hist[v];if(acc>=cnt*.03){p97=v;break}}
  const Cl=sgsMM(D,w,h,kc,true),fl=Math.max(9,.22*p97),S=new Uint8Array(n);for(let i=0;i<n;i++){const c=Cl[i]>fl?Cl[i]:fl,v=D[i]*255/c;S[i]=v>255?255:v}
  return{S:S,con:p97}}
/* native -> crop affine: scale s, rotate by -ang, shear k (x += k*(y-ch/2)), centre (cx,cy) -> crop centre */
function sgsExtract(P,cx,cy,ang,s,k,cw,ch){cw=Math.round(cw);ch=Math.round(ch);const co=Math.cos(ang),si=Math.sin(ang);
  let a=s*co,c=s*si,b=-s*si,d=s*co,e=cw/2-(a*cx+c*cy),f=ch/2-(b*cx+d*cy);a+=k*b;c+=k*d;e+=k*(f-ch/2);
  let L=null;for(let i=P.lv.length-1;i>=0;i--)if(P.lv[i].sc>=s*.98){L=P.lv[i];break}
  if(!L)L=(P.lv[0].sc>=1||!P.src)?P.lv[0]:{cv:P.src,sc:1,ox:0,oy:0};
  const cv=sgsCanvas(cw,ch),g=cv.getContext('2d',{willReadFrequently:true});g.fillStyle='#808080';g.fillRect(0,0,cw,ch);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  const q=1/L.sc;g.setTransform(a*q,b*q,c*q,d*q,e+a*L.ox+c*L.oy,f+b*L.ox+d*L.oy);g.drawImage(L.cv,0,0);g.setTransform(1,0,0,1,0,0);
  const det=a*d-b*c;return{G:sgsGray(cv),w:cw,h:ch,inv:function(x,y){const u=x-e,v=y-f;return[(d*u-c*v)/det,(-b*u+a*v)/det]}}}
/* best shear of a point set: maximise the sum of squared histogram bins of (p + t*q) */
function sgsShear(pa,qa,n,lo,hi,st,len,off){let best=lo,bs=-1;const H=new Int32Array(len+2*off+4);
  for(let t=lo;t<=hi+1e-9;t+=st){H.fill(0);for(let i=0;i<n;i++){const v=Math.round(pa[i]+t*qa[i])+off;if(v>=0&&v<H.length)H[v]++}let s=0;for(let i=0;i<H.length;i++)s+=H[i]*H[i];if(s>bs){bs=s;best=t}}return best}
function sgsBand(hist,n){let mx=0;for(let i=0;i<n;i++)if(hist[i]>mx)mx=hist[i];if(mx<3)return null;const th=.14*mx;let best=null,i=0;
  while(i<n){if(hist[i]<th){i++;continue}let j=i,m=0,gap=0,e=i;while(j<n&&gap<2){if(hist[j]>=th){m+=hist[j];e=j;gap=0}else gap++;j++}if(!best||m>best.m)best={y0:i,y1:e,m:m};i=j}return best}
/* ---- stage C: decode one row candidate ---- */
function sgsDecodeRow(P,row,opts){const D={};const pol=row.pol,H1=40,hd0=Math.max(row.hm,6);let s1=H1/hd0;if(s1>3.2)s1=3.2;
  const rw=row.x1-row.x0+1,rh=row.y1-row.y0+1,cw1=Math.min(900,(rw+2.6*hd0)*s1),ch1=Math.min(260,(Math.max(hd0,rh-Math.abs(Math.tan(row.ang))*rw)+1.3*hd0)*s1);
  const E1=sgsExtract(P,(row.x0+row.x1+1)/2,(row.y0+row.y1+1)/2,row.ang,s1,0,cw1,ch1),w1=E1.w,h1=E1.h,k1=Math.round(Math.max(13,.55*hd0*s1))|1;
  const St1=sgsStroke(E1.G,w1,h1,pol,k1,Math.round(2*hd0*s1)|1),S1=St1.S;if(opts.debug>1){D.G1=E1.G;D.S1=S1;D.w1=w1;D.h1=h1}
  /* mask without long lines (bezel edges), rotation from the projection profile */
  const M=new Uint8Array(w1*h1),LM=Math.min(.3*w1,2.2*hd0*s1);let np=0;
  for(let y=0;y<h1;y++){let st=-1;const o=y*w1;for(let x=0;x<=w1;x++){const on=x<w1&&S1[o+x]>110;if(on&&st<0)st=x;else if(!on&&st>=0){if(x-st<=LM){for(let q=st;q<x;q++)M[o+q]=1;np+=x-st}st=-1}}}
  if(np<20)return{raw:0,why:'no-strokes'};
  const stp=Math.max(1,Math.ceil(np/5000)),px=new Float32Array(Math.ceil(np/stp)+1),py=new Float32Array(px.length);let n=0,c=0;
  for(let y=0;y<h1;y++)for(let x=0;x<w1;x++)if(M[y*w1+x]){if(c++%stp===0){px[n]=x-w1/2;py[n]=y;n++}}
  const off=Math.ceil(.1*w1)+2;let tr=sgsShear(py,px,n,-.17,.17,.0125,h1,off);tr=sgsShear(py,px,n,tr-.01,tr+.01,.0025,h1,off);
  /* glyphs = stacks of touching / vertically stacked components; the band = the tallest set of glyphs sharing top and bottom */
  const cc=sgsCC(M,w1,h1),gl=sgsStack(cc.filter(function(q){return q.a>=3&&q.y1-q.y0+1<=.94*h1})),cand=[];let cut=0;
  for(let i=0;i<gl.length;i++){const g=gl[i];g.h=g.y1-g.y0+1;g.w=g.x1-g.x0+1;const sh=tr*((g.x0+g.x1)/2-w1/2);g.t=g.y0+sh;g.b=g.y1+sh;if(g.h<7||g.w>3.2*g.h+LM)continue;if(g.y0<=0||g.y1>=h1-1){cut++;continue}cand.push(g)}
  cand.sort(function(p,q){return p.x0-q.x0});let bestSet=null,bs=0;
  for(let i=0;i<cand.length;i++){const r=cand[i],tol=.14*r.h+1.5,set=[r];let lo=r.x0,hi=r.x1;
    for(let j=i-1;j>=0;j--){const g=cand[j];if(lo-g.x1>1.7*r.h)break;if(Math.abs(g.t-r.t)<=tol&&Math.abs(g.b-r.b)<=tol){set.push(g);lo=Math.min(lo,g.x0)}}
    for(let j=i+1;j<cand.length;j++){const g=cand[j];if(g.x0-hi>1.7*r.h)break;if(Math.abs(g.t-r.t)<=tol&&Math.abs(g.b-r.b)<=tol){set.push(g);hi=Math.max(hi,g.x1)}}
    let wsum=0;for(let k=0;k<set.length;k++)wsum+=Math.min(set[k].w,.7*r.h);const sc=r.h*Math.min(wsum/(.5*r.h),7)*(r.h>=1.1*r.w||set.length>1?1:.6);if(sc>bs){bs=sc;bestSet=set}}
  if(!bestSet){if(!row.grown&&cut){const r2={};for(const k in row)r2[k]=row[k];r2.hm=hd0*1.7;r2.grown=1;return sgsDecodeRow(P,r2,opts)}return{raw:0,why:'no-band'}}
  const ts=bestSet.map(function(g){return g.t}).sort(function(p,q){return p-q}),bsr=bestSet.map(function(g){return g.b}).sort(function(p,q){return p-q}),bT=ts[ts.length>>1],bB=bsr[bsr.length>>1],hb=bB-bT+1;
  if(hb<7)return{raw:0,why:'band-small'};
  if(!row.refined&&hb<.6*H1&&s1<3){let a0=1e9,b0=-1e9;for(let k=0;k<bestSet.length;k++){if(bestSet[k].x0<a0)a0=bestSet[k].x0;if(bestSet[k].x1>b0)b0=bestSet[k].x1}const cx0=(a0+b0)/2,cy0=(bT+bB)/2-tr*(cx0-w1/2),cn=E1.inv(cx0,cy0),wn=(b0-a0+1)/s1,hn=hb/s1;return sgsDecodeRow(P,{x0:cn[0]-wn/2,x1:cn[0]+wn/2,y0:cn[1]-hn/2,y1:cn[1]+hn/2,hm:hn,ang:row.ang+Math.atan(-tr),pol:pol,n:row.n,score:row.score,lv:row.lv,refined:1,grown:1},opts)}
  let xa=1e9,xb=-1e9;for(let k=0;k<bestSet.length;k++){if(bestSet[k].x0<xa)xa=bestSet[k].x0;if(bestSet[k].x1>xb)xb=bestSet[k].x1}
  xa=Math.max(0,xa-1.25*hb)-w1/2;xb=Math.min(w1-1,xb+.7*hb)-w1/2;
  /* shear from the points inside the band */
  const qx=new Float32Array(n),qy=new Float32Array(n);let m=0;const yc=(bT+bB)/2;
  for(let i=0;i<n;i++){const v=py[i]+tr*px[i];if(v>=bT-1&&v<=bB+1&&px[i]>=xa&&px[i]<=xb){qx[m]=px[i]+w1/2;qy[m]=v-yc;m++}}
  if(m<12)return{raw:0,why:'band-empty'};
  let kk=sgsShear(qx,qy,m,-.14,.4,.02,w1,Math.ceil(.25*hb)+2);kk=sgsShear(qx,qy,m,kk-.015,kk+.015,.005,w1,Math.ceil(.25*hb)+2);
  /* final extraction: digits 64 px tall, upright */
  const HN=64,xc1=(xa+xb)/2+w1/2,yc1=yc-tr*((xa+xb)/2),cN=E1.inv(xc1,yc1),ang2=row.ang+Math.atan(-tr);let s2=s1*HN/hb;if(s2>3.4)s2=3.4;const Hn=hb*s2/s1;
  const cw=Math.min(980,(xb-xa+1)*s2/s1+.3*Hn),ch=Math.round(Hn*1.7),E=sgsExtract(P,cN[0],cN[1],ang2,s2,kk,cw,ch),w=E.w,h=E.h;
  const St=sgsStroke(E.G,w,h,pol,Math.round(Math.max(15,.5*Hn))|1,Math.round(1.8*Hn)|1),S=St.S,TH=105;if(opts.debug>1){D.G=E.G;D.S=S;D.w=w;D.h=h}
  /* drop lines longer than any segment, then the exact band near where pass 1 put it */
  for(let y=0;y<h;y++){let st=-1;const o=y*w;for(let x=0;x<=w;x++){const on=x<w&&S[o+x]>TH;if(on&&st<0)st=x;else if(!on&&st>=0){if(x-st>1.1*Hn)for(let q=st;q<x;q++)S[o+q]=0;st=-1}}}
  for(let x=0;x<w;x++){let st=-1;for(let y=0;y<=h;y++){const on=y<h&&S[y*w+x]>TH;if(on&&st<0)st=y;else if(!on&&st>=0){if(y-st>1.3*Hn)for(let q=st;q<y;q++)S[q*w+x]=0;st=-1}}}
  const rh2=new Int32Array(h);for(let y=0;y<h;y++){let sm=0;const o=y*w;for(let x=0;x<w;x++)if(S[o+x]>TH)sm++;rh2[y]=sm}
  const eT=Math.round(h/2-Hn/2),eB=Math.round(h/2+Hn/2)-1,md=[];for(let y=Math.round(h/2-.3*Hn);y<=h/2+.3*Hn;y++)md.push(rh2[y]);md.sort(function(p,q){return p-q});const rth=Math.max(2,.3*md[md.length>>1]),sw=Math.round(.17*Hn);
  let yT=eT,yB=eB;{let y=Math.min(h-2,eT+sw);while(y>1&&rh2[y]<rth&&y<h/2)y++;while(y>1&&rh2[y-1]>=rth&&y>eT-1.6*sw)y--;yT=y;y=Math.max(1,eB-sw);while(y<h-2&&rh2[y]<rth&&y>h/2)y--;while(y<h-2&&rh2[y+1]>=rth&&y<eB+1.6*sw)y++;yB=y}
  D.yT=yT;D.yB=yB;const Hh=yB-yT+1;if(Hh<.6*Hn||Hh>1.45*Hn)return{raw:0,why:'band-mismatch'};
  /* column runs: a column whose ink lies only in the bottom third belongs to a decimal point, not to a digit */
  const ra=Math.max(0,Math.round(yT-.1*Hh)),rb=Math.min(h-1,Math.round(yB+.13*Hh)),col=new Int32Array(w),top=new Int32Array(w).fill(h),bot=new Int32Array(w).fill(-1);
  for(let y=ra;y<=rb;y++){const o=y*w;for(let x=0;x<w;x++)if(S[o+x]>TH){col[x]++;if(y<top[x])top[x]=y;bot[x]=y}}
  const lowT=yT+.66*Hh,runs=[],lows=[];{let st=0,k0=0;for(let x=0;x<=w;x++){const k=x<w?(col[x]?(top[x]>lowT?2:1):0):0;if(k!==k0){if(k0===1)runs.push({x0:st,x1:x-1});else if(k0===2)lows.push({x0:st,x1:x-1});st=x;k0=k}}}
  {const g0=Math.max(2,Math.round(.06*Hh));for(let i=runs.length-1;i>0;i--){const a=runs[i-1],b=runs[i],gap=b.x0-a.x1-1;let clean=gap<=g0;for(let x=a.x1+1;clean&&x<b.x0;x++)if(col[x])clean=false;if(clean){a.x1=b.x1;runs.splice(i,1)}}}
  const tw=Math.round(.25*Hh);
  const meas=function(r){let y0=h,y1=-1,a=0,up=0,dn=0;for(let y=Math.max(0,ra-tw);y<=Math.min(h-1,rb+tw);y++){const o=y*w;let c=0;for(let x=r.x0;x<=r.x1;x++)if(S[o+x]>TH)c++;if(!c)continue;if(y<ra)up++;else if(y>rb)dn++;else{a+=c;if(y<y0)y0=y;y1=y}}
    r.y0=y0;r.y1=y1;r.a=a;r.w=r.x1-r.x0+1;r.h=y1-y0+1;r.tall=(up>=.6*Math.min(tw,ra)&&dn>=.6*Math.min(tw,h-1-rb)&&ra>3&&h-1-rb>3)?1:0;return r};
  for(let i=0;i<runs.length;i++)meas(runs[i]);
  const isFull=function(r){return r.y0<=yT+.15*Hh&&r.y1>=yB-.15*Hh&&!r.tall};
  let fulls=runs.filter(isFull);if(!fulls.length)return{raw:0,why:'no-digits'};
  const ws=fulls.filter(function(r){return r.w>=.3*Hh}).map(function(r){return r.w}).sort(function(a,b){return a-b});let Wd=ws.length?ws[ws.length>>1]:.52*Hh;if(ws.length>2&&ws[0]<.62*Wd)Wd=ws[Math.min(ws.length-1,(ws.length*3)>>2)];
  if(Wd>.8*Hh){const sm=ws.filter(function(v){return v<=.8*Hh});Wd=sm.length?sm[sm.length>>1]:.55*Hh}
  let pen=0;const dots=[];
  for(let i=0;i<lows.length;i++){const r=lows[i],lw=r.x1-r.x0+1;let lb=-1,lt=h;for(let x=r.x0;x<=r.x1;x++){if(bot[x]>lb)lb=bot[x];if(top[x]<lt)lt=top[x]}if(lw>=2&&lw<=.36*Hh&&lb>=yB-.16*Hh&&lb-lt+1<=.36*Hh)dots.push({x:(r.x0+r.x1)/2,w:lw})}
  const items=[];for(let i=0;i<runs.length;i++){const r=runs[i];if(r.a<7)continue;
    if(isFull(r)&&r.w>1.3*Wd){const pe=1.32*Wd,nn=Math.max(2,Math.round((r.w+.3*Wd)/pe));if(nn>8){pen+=3;continue}let a0=r.x0;for(let q=1;q<=nn;q++){let cut=r.x1+1;if(q<nn){const ex=r.x0+Math.round(q*r.w/nn),sp=Math.round(.2*Wd);let bv=1e9;for(let x=ex-sp;x<=ex+sp;x++)if(x>a0+2&&x<r.x1-1&&col[x]<bv){bv=col[x];cut=x}}
        if(cut-1>=a0)items.push(meas({x0:a0,x1:cut-1}));a0=cut}pen+=1;continue}
    items.push(r)}
  /* classify */
  const digs=[],ym=(yT+yB)/2;let minus=null,junk=0;
  for(let i=0;i<items.length;i++){const r=items[i];if(isFull(r)&&r.h<=1.22*Hh){digs.push(r);continue}
    if(r.h<=.34*Hh&&r.w<=.36*Hh&&r.y1>=yB-.13*Hh&&r.y0>=yT+.6*Hh&&r.a>=.3*r.w*r.h){dots.push({x:(r.x0+r.x1)/2,w:r.w,s:1});continue}
    if(r.h<=.26*Hh&&Math.abs((r.y0+r.y1)/2-ym)<=.14*Hh&&r.w>=.16*Hh&&r.w<=1.15*Wd){r.minus=1;if(!minus||r.x1>minus.x1)minus=r;continue}
    if(r.h>.5*Hh)junk++}
  if(digs.length<1)return{dbg:D,raw:0,why:'no-digits'};if(digs.length>9)return{dbg:D,raw:0,why:'too-many'};
  /* stroke thickness */
  let tks=[];for(const yy of[Math.round(yT+.3*Hh),Math.round(yT+.7*Hh)]){const o=yy*w;for(let d=0;d<digs.length;d++){let rl=0;for(let x=digs[d].x0;x<=digs[d].x1+1;x++){if(x<=digs[d].x1&&S[o+x]>TH)rl++;else{if(rl>1)tks.push(rl);rl=0}}}}
  tks.sort(function(a,b){return a-b});let tk=tks.length?tks[tks.length>>1]:.1*Hh;if(tk<.05*Hh)tk=.05*Hh;if(tk>.2*Hh)tk=.2*Hh;
  for(let i=dots.length-1;i>=0;i--)if(dots[i].w<Math.max(2,.4*tk))dots.splice(i,1);
  /* integral of S */
  const W1=w+1,I=new Float64Array(W1*(h+1));for(let y=0;y<h;y++){let rs=0;for(let x=0;x<w;x++){rs+=S[y*w+x];I[(y+1)*W1+x+1]=I[y*W1+x+1]+rs}}
  const box=function(x0,y0,x1,y1){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);if(x0<0)x0=0;if(y0<0)y0=0;if(x1>w)x1=w;if(y1>h)y1=h;if(x1<=x0||y1<=y0)return 0;return(I[y1*W1+x1]-I[y0*W1+x1]-I[y1*W1+x0]+I[y0*W1+x0])/((x1-x0)*(y1-y0)*255)};
  const ht=Math.max(1,.3*tk),fz=function(z){z=(z-.2)/.4;return z<0?0:z>1?1:z};
  const cells=[];for(let d=0;d<digs.length;d++){const r=digs[d],x1=r.x1+1,narrow=r.w<.72*Wd;let x0=narrow?x1-Wd:r.x0;if(d>0&&x0<digs[d-1].x1+1)x0=Math.min(r.x0,digs[d-1].x1+1);
    const W=x1-x0,y0=Math.max(r.y0,yT-.08*Hh),y1=Math.min(r.y1,yB+.08*Hh)+1,HH=y1-y0,mid=(y0+y1)/2,xa=x0+.3*W,xb=x1-.3*W;
    const hz=function(yc,lo,hi){let b=0;for(let dy=lo;dy<=hi;dy++){const v=box(xa,yc+dy-ht,xb,yc+dy+ht);if(v>b)b=v}return b},vt=function(xc,lo,hi,ya,yb){let b=0;for(let dx=lo;dx<=hi;dx++){const v=box(xc+dx-ht,ya,xc+dx+ht,yb);if(v>b)b=v}return b};
    const e1=Math.round(.05*HH),e2=Math.round(.09*HH),u0=y0+.19*HH,u1=mid-.1*HH,l0=mid+.1*HH,l1=y1-.19*HH,sx=Math.round(.16*W);
    const z=[hz(y0+tk/2,-e1,e2),vt(x1-tk/2,-sx,2,u0,u1),vt(x1-tk/2,-sx,2,l0,l1),hz(y1-tk/2,-e2,e1),vt(x0+tk/2,-2,sx,l0,l1),vt(x0+tk/2,-2,sx,u0,u1),hz(mid,-e2,e2)];
    let b1=null,b2=null;for(let p=0;p<SGS_PAT.length;p++){const bits=SGS_PAT[p][1];let s=0,q=1;for(let k=0;k<7;k++){const f=fz(z[k]),a=(bits>>k&1)?f:1-f;s+=a;if(a<q)q=a}const o={ch:SGS_PAT[p][0],s:s/7,q:q};
      if(!b1||o.s>b1.s){if(b1&&b1.ch!==o.ch)b2=b1;b1=o}else if(o.ch!==b1.ch&&(!b2||o.s>b2.s))b2=o}
    cells.push({x0:x0,x1:x1,y0:y0,y1:y1,z:z,ch:b1.ch,s:b1.s,q:b1.q,alt:b2?b2.ch:'',m:Math.min(1,(b1.s-(b2?b2.s:0))*7),narrow:narrow,rw:r.w})}
  /* leading minus as a glyph, letters */
  let neg=false;if(cells.length>1&&cells[0].ch==='-'){neg=true;cells.shift()}else if(minus&&minus.x1<cells[0].x0+2&&cells[0].x0-minus.x1<2.2*Wd)neg=true;
  const nd=cells.length;let letters=0;for(let i=0;i<nd;i++)if(!/[0-9]/.test(cells[i].ch))letters++;
  /* pitch regularity (right edges) */
  let pit=0,pdev=0;if(nd>=2){const ds=[];for(let i=1;i<nd;i++)ds.push(cells[i].x1-cells[i-1].x1);const srt=ds.slice().sort(function(a,b){return a-b});pit=srt[srt.length>>1];for(let i=0;i<ds.length;i++){const e=Math.abs(ds[i]-pit)/pit;if(e>pdev)pdev=e}}
  /* decimal point: blobs first, then the strongest faint spot in the bottom of a gap */
  let dotAt=-1,dotSeen=false,dotAmb=false;const gapOf=function(x){for(let i=0;i<nd-1;i++)if(x>cells[i].x1-.12*Wd&&x<cells[i+1].x0+.1*Wd&&(!cells[i+1].narrow||x<cells[i].x1+.6*Wd))return i;return-1};
  const dg=[];for(let i=0;i<dots.length;i++){const g=gapOf(dots[i].x);if(g>=0&&dg.indexOf(g)<0)dg.push(g)}
  if(dg.length===1){dotAt=dg[0];dotSeen=true}else if(dg.length>1){dotAt=dg[dg.length-1];dotSeen=true;dotAmb=true}
  const gs=[];if(nd>=2){const dw=Math.max(2,Math.round(.8*tk));for(let i=0;i<nd-1;i++){const gx0=cells[i].x1,gx1=Math.min(cells[i+1].narrow?cells[i].x1+.5*Wd:cells[i+1].x0,cells[i].x1+.5*Wd);let b=0;
      for(let x=gx0;x+dw<=gx1+1;x++)for(let y=Math.round(yB-.2*Hh);y+dw<=yB+Math.round(.06*Hh)+1;y++){const v=box(x,y,x+dw,y+dw);if(v>b)b=v}gs.push(b)}
    if(!dotSeen){let bi=-1,bv=0,sv=0;for(let i=0;i<gs.length;i++){if(gs[i]>bv){sv=bv;bv=gs[i];bi=i}else if(gs[i]>sv)sv=gs[i]}if(bi>=0&&bv>=.3&&bv>=2.2*sv+.05){dotAt=bi;dotSeen=true;dotAmb=bv<.45}}}
  /* raw quality score */
  let qmin=1,mmin=1,smin=1,wk=-1;for(let i=0;i<nd;i++){const c2=cells[i];if(c2.m<mmin){mmin=c2.m;wk=i}if(c2.q<qmin)qmin=c2.q;if(c2.s<smin)smin=c2.s}
  let raw=Math.min(mmin,.35+.65*qmin)*Math.min(1,Math.max(0,(smin-.6)/.3));
  if(pdev>.16)raw*=Math.max(.3,1-2*(pdev-.16));if(pen)raw*=Math.pow(.75,pen);if(junk)raw*=Math.pow(.9,junk);if(dotAmb)raw*=.75;if(nd<2)raw*=.3;if(nd>7)raw*=.5;
  let ones=0;for(let i=0;i<nd;i++)if(cells[i].ch==='1')ones++;if(ones===nd)raw*=.45;
  const digits=cells.map(function(c2){return c2.ch}).join('');
  /* box in source pixels */
  const cs=[E.inv(cells[0].x0,yT),E.inv(cells[nd-1].x1,yT),E.inv(cells[nd-1].x1,yB+1),E.inv(cells[0].x0,yB+1)];let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;for(let i=0;i<4;i++){if(cs[i][0]<bx0)bx0=cs[i][0];if(cs[i][0]>bx1)bx1=cs[i][0];if(cs[i][1]<by0)by0=cs[i][1];if(cs[i][1]>by1)by1=cs[i][1]}
  return{dbg:D,raw:raw,digits:digits,cells:cells,neg:neg,dotAt:dotAt,dotSeen:dotSeen,dotAmb:dotAmb,letters:letters,nd:nd,wk:wk,gs:gs,hd:Hh/s2,con:St.con,pol:pol,box:{x:bx0,y:by0,w:bx1-bx0,h:by1-by0},
    f:{mmin:mmin,qmin:qmin,smin:smin,pdev:pdev,pen:pen,junk:junk,ones:ones===nd?1:0,tk:tk/Hh,Wd:Wd/Hh,slant:kk,rot:ang2}}}
function sgsFmt(digits,dp,neg){/* dp = number of decimals (0 = none) */let ip=dp>0?digits.slice(0,digits.length-dp):digits,fp=dp>0?digits.slice(digits.length-dp):'';ip=ip.replace(/^0+(?=\d)/,'');if(!ip)ip='0';return(neg?'-':'')+ip+(fp?'.'+fp:'')}
function sgsCal(raw){const C=SGS_CAL;if(raw<=C[0][0])return C[0][1];for(let i=1;i<C.length;i++)if(raw<=C[i][0]){const a=C[i-1],b=C[i];return a[1]+(b[1]-a[1])*(raw-a[0])/((b[0]-a[0])||1)}return C[C.length-1][1]}
function sgsCropUrl(P,b,pad){try{const x0=Math.max(0,b.x-pad),y0=Math.max(0,b.y-pad),x1=Math.min(P.W,b.x+b.w+pad),y1=Math.min(P.H,b.y+b.h+pad),sw=x1-x0,sh=y1-y0;if(sw<2||sh<2)return'';
  const sc=Math.min(640/sw,Math.max(1,Math.min(3,320/sw))),cv=sgsScaled(P.src,x0,y0,sw,sh,Math.max(1,Math.round(sw*sc)),Math.max(1,Math.round(sh*sc)));return cv.toDataURL('image/jpeg',.85)}catch(e){return''}}
function sgsBlank(why,t0){return{ok:false,text:'',value:null,digits:'',decimals:null,dotSeen:false,negative:false,conf:0,box:null,crop:'',polarity:'',ms:Math.round(sgsNow()-t0),alts:[],why:why}}
/* build the public result from a decoded row */
function sgsResult(P,R,opts,t0){const out=sgsBlank('',t0),nd=R.nd,want=(opts.decimals===2||opts.decimals===3||opts.decimals===1||opts.decimals===0)?opts.decimals:null;
  out.digits=R.digits;out.negative=R.neg;out.polarity=R.pol?'bright-on-dark':'dark-on-bright';out.box={x:Math.round(R.box.x),y:Math.round(R.box.y),w:Math.round(R.box.w),h:Math.round(R.box.h)};out.dotSeen=R.dotSeen;
  out.crop=sgsCropUrl(P,R.box,Math.max(6,.45*R.box.h));
  if(R.letters){out.why='not-a-number';out.text=R.digits;out.conf=0;return out}
  let raw=R.raw,dp=null;const seen=R.dotSeen?nd-1-R.dotAt:null;
  if(seen!=null){dp=seen;if(want!=null&&want!==seen)raw*=.6}else if(want!=null&&want<nd){dp=want;raw*=.92}
  const alts=[],push=function(t,c){if(t&&t!==out.text&&!alts.some(function(a){return a.text===t}))alts.push({text:t,conf:+c.toFixed(3)})};
  if(dp==null){out.text=sgsFmt(R.digits,0,R.neg);out.why='dot-not-found';out.conf=+Math.min(.3,sgsCal(raw)).toFixed(3);if(nd>=2&&R.digits.charAt(0)==='0')push(sgsFmt(R.digits,nd-1,R.neg),sgsCal(raw)*.6);for(const d of[2,3,1])if(d<nd)push(sgsFmt(R.digits,d,R.neg),sgsCal(raw)*.4);out.alts=alts;return out}
  out.decimals=dp;out.text=sgsFmt(R.digits,dp,R.neg);out.value=parseFloat(out.text);
  if(opts.maxValue!=null&&isFinite(opts.maxValue)&&Math.abs(out.value)>opts.maxValue){raw*=.3;out.why='above-max'}
  out.conf=+sgsCal(raw).toFixed(3);
  /* alternatives: weakest digits swapped with their runner-up, other dot places */
  const ord=R.cells.map(function(c,i){return i}).sort(function(a,b){return R.cells[a].m-R.cells[b].m});
  for(let k=0;k<Math.min(3,ord.length);k++){const i=ord[k],c=R.cells[i];if(c.m<.9&&/[0-9]/.test(c.alt))push(sgsFmt(R.digits.slice(0,i)+c.alt+R.digits.slice(i+1),dp,R.neg),out.conf*(1-c.m)*.8)}
  if(want!=null&&want!==dp&&want<nd)push(sgsFmt(R.digits,want,R.neg),out.conf*.5);
  if(!R.dotSeen||R.dotAmb)for(const d of[2,3,1])if(d!==dp&&d<nd)push(sgsFmt(R.digits,d,R.neg),out.conf*.3);
  out.alts=alts.slice(0,5);out.ok=!out.why&&nd>=2;if(!out.ok&&!out.why)out.why='too-few-digits';out.raw=+raw.toFixed(4);return out}
async function sgsRead(source,opts){const t0=sgsNow();try{opts=opts||{};const src=await sgsLoad(source),W=src.w,H=src.h;if(!(W>4&&H>4))return sgsBlank('empty-image',t0);
  let roi={x:0,y:0,w:W,h:H},hint=false;if(opts.hintBox&&opts.hintBox.w>4&&opts.hintBox.h>4){const b=opts.hintBox,x0=Math.max(0,Math.floor(b.x)),y0=Math.max(0,Math.floor(b.y)),x1=Math.min(W,Math.ceil(b.x+b.w)),y1=Math.min(H,Math.ceil(b.y+b.h));if(x1-x0>4&&y1-y0>4){roi={x:x0,y:y0,w:x1-x0,h:y1-y0};hint=true}}
  const lg=Math.max(roi.w,roi.h),s0=hint?Math.min(3,900/lg):Math.min(1,(opts.maxSide||2000)/lg),w0=Math.max(8,Math.round(roi.w*s0)),h0=Math.max(8,Math.round(roi.h*s0));
  const c0=sgsScaled(src.el,roi.x,roi.y,roi.w,roi.h,w0,h0),P={src:src.el,W:W,H:H,lv:[{cv:c0,sc:w0/roi.w,ox:roi.x,oy:roi.y}]};
  /* pyramid of grey images + matching canvases */
  let L={G:sgsGray(c0),w:w0,h:h0},sc=w0/roi.w,cv=c0;const rows=[];
  for(let lv=0;lv<6&&Math.min(L.w,L.h)>=24;lv++){if(lv>0){const nx=sgsHalf(L.G,L.w,L.h);const c=sgsCanvas(nx.w,nx.h);c.getContext('2d').drawImage(cv,0,0,nx.w*2,nx.h*2,0,0,nx.w,nx.h);cv=c;L=nx;sc=sc/2;P.lv.push({cv:cv,sc:sc,ox:roi.x,oy:roi.y})}
    const C=sgsComps(L.G,L.w,L.h);for(let p=0;p<2;p++){const R=sgsRows(sgsGroup(C[p]));for(let i=0;i<R.length;i++){const r=R[i];rows.push({x0:r.x0/sc+roi.x,y0:r.y0/sc+roi.y,x1:(r.x1+1)/sc+roi.x,y1:(r.y1+1)/sc+roi.y,hm:r.hm/sc,ang:r.ang,n:r.n,pol:p,score:r.score/sc*((r.hm>=14&&r.hm<=44)?1.15:1),lv:lv})}}
    if(Math.max(L.w,L.h)<140)break}
  rows.sort(function(a,b){return b.score-a.score});const keep=[];
  for(let i=0;i<rows.length&&keep.length<(opts.maxRows||14);i++){const r=rows[i];let dup=false;for(let j=0;j<keep.length;j++){const k=keep[j];if(k.pol!==r.pol)continue;const ix=Math.min(r.x1,k.x1)-Math.max(r.x0,k.x0),iy=Math.min(r.y1,k.y1)-Math.max(r.y0,k.y0);if(ix>0&&iy>0&&ix*iy>.45*Math.min((r.x1-r.x0)*(r.y1-r.y0),(k.x1-k.x0)*(k.y1-k.y0))){dup=true;break}}if(!dup)keep.push(r)}
  if(hint&&keep.length<2){for(let p=0;p<2;p++)keep.push({x0:roi.x+.08*roi.w,y0:roi.y+.2*roi.h,x1:roi.x+.92*roi.w,y1:roi.y+.8*roi.h,hm:.55*roi.h,ang:0,n:1,pol:p,score:0})}
  let best=null;const dbg=[];
  for(let i=0;i<keep.length;i++){let R=null;try{R=sgsDecodeRow(P,keep[i],opts)}catch(e){R={raw:0,why:'row-error:'+e.message}}if(opts.debug)dbg.push({im:opts.debug>1?sgsDbgImg(R.dbg):null,row:keep[i],raw:R.raw,digits:R.digits,why:R.why,f:R.f,dotAt:R.dotAt,z:R.cells&&R.cells.map(function(c){return c.z.map(function(v){return+v.toFixed(2)}).join(' ')+' '+c.ch+' m'+c.m.toFixed(2)})});
    if(!R.digits)continue;let v=R.raw*(R.letters?.5:1);if(!R.dotSeen)v*=.8;R.v=v;if(!best||v>best.v+1e-9||(Math.abs(v-best.v)<1e-9&&R.hd>best.hd))best=R;if(v>=.9&&!R.letters&&R.nd>=3)break}
  let out;if(best){out=sgsResult(P,best,opts,t0);if(out.ok&&out.conf<(opts.minConf==null?.5:opts.minConf)){out.ok=false;out.why='low-confidence'}}
  else{out=sgsBlank(keep.length?'unreadable':'display-not-found',t0);if(keep.length){const k=keep[0];out.box={x:Math.round(k.x0),y:Math.round(k.y0),w:Math.round(k.x1-k.x0),h:Math.round(k.y1-k.y0)};out.crop=sgsCropUrl(P,out.box,Math.max(6,.45*out.box.h))}}
  out.ms=Math.round(sgsNow()-t0);if(opts.debug)out.dbg=dbg;return out}catch(e){return sgsBlank('error: '+(e&&e.message||e),t0)}}

function sgsDbgImg(D){if(!D||!D.G1)return null;const W=Math.max(D.w1,D.w||1),H=D.h1*2+(D.h?D.h*2:0)+6,c=sgsCanvas(W,H),g=c.getContext('2d');g.fillStyle='#f0f';g.fillRect(0,0,W,H);
  const put=function(A,w,h,y){const im=g.createImageData(w,h);for(let i=0;i<w*h;i++){im.data[4*i]=im.data[4*i+1]=im.data[4*i+2]=A[i];im.data[4*i+3]=255}g.putImageData(im,0,y)};
  put(D.G1,D.w1,D.h1,0);put(D.S1,D.w1,D.h1,D.h1+2);if(D.G){put(D.G,D.w,D.h,2*D.h1+4);put(D.S,D.w,D.h,2*D.h1+6+D.h-2);if(D.yT!=null){g.fillStyle='rgba(255,0,0,.6)';g.fillRect(0,2*D.h1+4+D.yT,6,1);g.fillRect(0,2*D.h1+4+D.yB,6,1)}}return c.toDataURL('image/png')}

/* connected components of a small 0/1 mask (8-connected, flood fill) */
function sgsCC(M,w,h){const out=[],L=new Uint8Array(w*h),st=new Int32Array(w*h);for(let i=0;i<w*h;i++){if(!M[i]||L[i])continue;let sp=0,x0=w,y0=h,x1=-1,y1=-1,a=0;st[sp++]=i;L[i]=1;
    while(sp){const p=st[--sp],x=p%w,y=(p-x)/w;a++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
      for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=h)continue;for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx<0||xx>=w)continue;const q=yy*w+xx;if(M[q]&&!L[q]){L[q]=1;st[sp++]=q}}}}
    out.push({x0:x0,y0:y0,x1:x1,y1:y1,a:a})}
  if(out.length>500){out.sort(function(p,q){return q.a-p.a});out.length=500}return out}
/* merge components that touch, or sit on top of each other in the same columns (the two halves of 0, 1, 7) */
function sgsStack(C){const n=C.length,par=sgsUF(n);for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=C[i],b=C[j],gx=Math.max(a.x0,b.x0)-Math.min(a.x1,b.x1)-1,gy=Math.max(a.y0,b.y0)-Math.min(a.y1,b.y1)-1;
    let ok=gx<=2&&gy<=2;if(!ok&&gy>0&&gx<0){const ov=-gx,mw=Math.min(a.x1-a.x0+1,b.x1-b.x0+1),mh=Math.min(a.y1-a.y0+1,b.y1-b.y0+1);ok=ov>=.4*mw&&gy<=1+.4*mh}
    if(ok){const ra=sgsFind(par,i),rb=sgsFind(par,j);if(ra!==rb)par[ra]=rb}}
  const Mp=new Map();for(let i=0;i<n;i++){const k=sgsFind(par,i),c=C[i];let g=Mp.get(k);if(!g){g={x0:c.x0,y0:c.y0,x1:c.x1,y1:c.y1,a:0};Mp.set(k,g)}if(c.x0<g.x0)g.x0=c.x0;if(c.y0<g.y0)g.y0=c.y0;if(c.x1>g.x1)g.x1=c.x1;if(c.y1>g.y1)g.y1=c.y1;g.a+=c.a}
  return Array.from(Mp.values())}

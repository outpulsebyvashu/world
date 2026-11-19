import * as THREE from 'three';
export {THREE};
export const G={colliders:[],triggers:[],pick:[],npcs:[],zones:[],buildings:[],rooms:{},beans:[],tick:[],host:{egg(){},toast(){},open(){},RM:false}};
export const clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const lerp=(a,b,t)=>a+(b-a)*t;
export function rng(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const tmpC=new THREE.Color();
export class Batch{constructor(){this.g=[]}
  add(geo,col){tmpC.set(col);geo.userData.c=[tmpC.r,tmpC.g,tmpC.b];this.g.push(geo);return geo}
  mesh(mat){if(!this.g.length)return new THREE.Object3D();const m=new THREE.Mesh(mergeFast(this.g),mat);this.g=[];return m}
  meshes(mat,cell=64){if(!this.g.length)return[];const groups=new Map();const v=new THREE.Vector3();
    for(const g of this.g){if(!g.boundingBox)g.computeBoundingBox();g.boundingBox.getCenter(v);const sz=g.boundingBox.max.x-g.boundingBox.min.x+g.boundingBox.max.z-g.boundingBox.min.z;const k=sz>cell*1.5?'big':Math.floor(v.x/cell)+','+Math.floor(v.z/cell);(groups.get(k)||groups.set(k,[]).get(k)).push(g)}
    const out=[];for(const gs of groups.values())out.push(new THREE.Mesh(mergeFast(gs),mat));this.g=[];return out}}
function mergeFast(gs){let n=0;for(const g of gs)n+=g.index?g.index.count:g.attributes.position.count;
  const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
  for(const g of gs){const p=g.attributes.position.array;let nr=g.attributes.normal;if(!nr){g.computeVertexNormals();nr=g.attributes.normal}const q=nr.array;const c=g.userData.c||[1,1,1];const idx=g.index?g.index.array:null;const cnt=idx?idx.length:p.length/3;
    for(let i=0;i<cnt;i++){const j=(idx?idx[i]:i)*3,k=o*3;P[k]=p[j];P[k+1]=p[j+1];P[k+2]=p[j+2];N[k]=q[j];N[k+1]=q[j+1];N[k+2]=q[j+2];C[k]=c[0];C[k+1]=c[1];C[k+2]=c[2];o++}}
  const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.BufferAttribute(P,3));r.setAttribute('normal',new THREE.BufferAttribute(N,3));r.setAttribute('color',new THREE.BufferAttribute(C,3));r.computeBoundingSphere();return r}
export function bx(b,x,y,z,w,h,d,col,ry=0,rx=0,rz=0){const g=new THREE.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);if(ry)g.rotateY(ry);g.translate(x,y,z);b.add(g,col);return g}
export function cyl(b,x,y,z,r1,r2,h,col,seg=12){const g=new THREE.CylinderGeometry(r1,r2,h,seg);g.translate(x,y,z);b.add(g,col);return g}
export function col(x0,x1,y0,y1,z0,z1,o){const c={x0:Math.min(x0,x1),x1:Math.max(x0,x1),y0,y1,z0:Math.min(z0,z1),z1:Math.max(z0,z1)};if(o)Object.assign(c,o);G.colliders.push(c);return c}
export function blk(b,x0,x1,y0,y1,z0,z1,c,collide=true,o){bx(b,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,Math.abs(x1-x0),y1-y0,Math.abs(z1-z0),c);if(collide)return col(x0,x1,y0,y1,z0,z1,o)}

/* ---------- canvas textures ---------- */
/* Canvas textures are drawn lazily: a cheap placeholder until the thing using it comes near (see game.js lazyTick). */
const PH=(()=>{const c=document.createElement('canvas');c.width=c.height=4;const x=c.getContext('2d');x.fillStyle='#cfcac0';x.fillRect(0,0,4,4);return c})();
export function texNow(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
export function tex(w,h,draw){const t=new THREE.CanvasTexture(PH);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;t.userData.lazy={w,h,draw};return t}
export function drawTex(t){const L=t&&t.userData.lazy;if(!L)return false;const c=document.createElement('canvas');c.width=L.w;c.height=L.h;L.draw(c.getContext('2d'),L.w,L.h);t.image=c;t.needsUpdate=true;t.userData.lazy=null;return true}
export function wrap(x,text,maxW){const words=String(text).split(' '),lines=[];let l='';for(const w of words){const t=l?l+' '+w:w;if(x.measureText(t).width>maxW&&l){lines.push(l);l=w}else l=t}if(l)lines.push(l);return lines}
export function lum(hex){tmpC.set(hex);return .2126*tmpC.r+.7152*tmpC.g+.0722*tmpC.b}
export const FONT_T='"Bricolage Grotesque","Inter Tight",Arial,sans-serif',FONT_D='Anton,Impact,sans-serif';
export function plane(w,h,map,o={}){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial(Object.assign({map,transparent:!!o.transparent,alphaTest:o.transparent?.3:0,side:o.double?THREE.DoubleSide:THREE.FrontSide},o.mat||{})));return m}
export function signTex(text,bg,fg,w=512,h=128,font=FONT_D){return tex(w,h,(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle=fg;let s=H*.62;x.font=s+'px '+font;while(x.measureText(text).width>W*.9&&s>10){s-=2;x.font=s+'px '+font}x.textAlign='center';x.textBaseline='middle';x.fillText(text,W/2,H/2+2)})}

/* ---------- blocky characters (original designs) ---------- */
export const CHM=new THREE.MeshLambertMaterial({vertexColors:true});
const faceCache={};
function faceMat(style,skin){const k=style;if(faceCache[k])return faceCache[k];
  const t=texNow(64,64,(x)=>{x.clearRect(0,0,64,64);x.fillStyle='#1a1410';
    const eye=(cx)=>{if(style==='calm'){x.fillRect(cx-5,27,10,3)}else{x.fillRect(cx-4,22,8,10);x.fillStyle='#fff';x.fillRect(cx-2,23,3,3);x.fillStyle='#1a1410'}};
    if(style==='cute'){x.fillStyle='#1a1410';for(const cx of[20,44]){x.fillRect(cx-5,20,10,13);x.fillStyle='#fff';x.fillRect(cx-3,21,4,4);x.fillRect(cx+1,28,2,2);x.fillStyle='#1a1410';x.fillRect(cx-6,18,3,2);x.fillRect(cx+3,18,3,2)}
      x.fillStyle='rgba(255,120,150,.75)';x.fillRect(8,36,9,5);x.fillRect(47,36,9,5);x.lineWidth=3;x.strokeStyle='#1a1410';x.beginPath();x.moveTo(27,43);x.quadraticCurveTo(32,49,37,43);x.stroke()}
    else if(style==='cry'){eye(20);eye(44);x.fillStyle='#4aa8ff';x.fillRect(16,32,4,14);x.fillRect(44,32,4,14);x.fillStyle='#1a1410';x.fillRect(24,48,16,3);x.fillRect(22,51,3,3);x.fillRect(39,51,3,3)}
    else{eye(20);eye(44);x.lineWidth=4;x.strokeStyle='#1a1410';x.beginPath();
      if(style==='grin'){x.fillStyle='#1a1410';x.fillRect(20,42,24,10);x.fillStyle='#fff';x.fillRect(22,43,20,4)}
      else if(style==='smug'){x.moveTo(22,46);x.quadraticCurveTo(36,52,44,42);x.stroke()}
      else if(style==='o'){x.arc(32,47,5,0,7);x.stroke()}
      else if(style==='flat'){x.moveTo(23,46);x.lineTo(41,46);x.stroke()}
      else{x.moveTo(21,43);x.quadraticCurveTo(32,54,43,43);x.stroke()}}
  });
  return faceCache[k]=new THREE.MeshLambertMaterial({map:t,transparent:true,alphaTest:.4})}
export function makeChar(o={}){
  const skin=o.skin||'#c48a60',shirt=o.shirt||'#202020',pants=o.pants||'#3a4a6b',shoes=o.shoes||'#f3f3f3',hairC=o.hairC||'#17110d';
  const P=fn=>{const b=new Batch();fn(b);const m=b.mesh(CHM);m.castShadow=true;return m};
  const g=new THREE.Group();
  const TW=o.fem?.6:.66,AX=o.fem?.44:.47;
  const torso=P(b=>{bx(b,0,.36,0,TW,.72,.38,shirt);if(o.kurta)bx(b,0,-.17,0,TW+.04,.36,.4,o.kurta);if(o.skirt)bx(b,0,-.2,0,TW+.12,.44,.46,o.skirt);if(o.hood){bx(b,0,.78,-.24,.46,.22,.14,o.hood);bx(b,0,.6,-.21,.5,.16,.1,o.hood)}if(o.vest){bx(b,-.2,.36,0,.22,.73,.39,o.vest);bx(b,.2,.36,0,.22,.73,.39,o.vest)}
    if(o.tie)bx(b,0,.38,.195,.09,.52,.01,o.tie);if(o.logo)bx(b,0,.46,.195,.26,.16,.01,o.logo);if(o.sash)bx(b,0,.4,.2,.7,.14,.02,o.sash,0,0,.7);if(o.apron)bx(b,0,.2,.2,.52,.6,.02,o.apron);if(o.coat){bx(b,0,.36,0,.7,.74,.42,o.coat);bx(b,0,.4,.215,.16,.62,.01,shirt)}});
  torso.position.y=.72;
  const leg=s=>{const gr=new THREE.Group();gr.add(P(b=>{bx(b,0,-.33,0,.31,.66,.34,pants);bx(b,0,-.66,.04,.33,.14,.44,shoes);if(o.cargo)bx(b,s*.165,-.3,0,.04,.2,.2,o.cargo);if(o.shorts)bx(b,0,-.5,0,.29,.3,.32,skin)}));gr.position.set(s*.17,.72,0);return gr};
  const arm=s=>{const gr=new THREE.Group();gr.add(P(b=>{if(o.long||o.coat){bx(b,0,-.3,0,.27,.6,.29,o.coat||shirt);bx(b,0,-.65,0,.25,.1,.27,skin)}else{bx(b,0,-.12,0,.28,.26,.3,shirt);bx(b,0,-.43,0,.25,.38,.27,skin)}}));gr.position.set(s*AX,1.4,0);return gr};
  const head=new THREE.Group();head.position.y=1.44;
  head.add(P(b=>{bx(b,0,.3,0,.58,.58,.58,skin);const hs=o.hair||'short';
    if(hs==='curly'||hs==='curly2'){const r=rng(o.seed||7);bx(b,0,.62,-.02,.6,.12,.6,hairC);for(let i=0;i<46;i++){const a=r()*Math.PI*2,rr=.18+r()*.16;const x=Math.cos(a)*rr,z=Math.sin(a)*rr-.03;bx(b,x,.66+r()*.1,z,.15,.13,.15,hairC,r()*1.5)}for(let i=0;i<18;i++){const sx=r()<.5?-1:1;bx(b,sx*(.29+r()*.03),.42+r()*.2,-.25+r()*.35,.08,.14,.13,hairC)}for(let i=0;i<14;i++)bx(b,-.26+r()*.52,.38+r()*.26,-.31,.14,.13,.08,hairC)}
    else if(hs==='short'){bx(b,0,.62,-.02,.62,.12,.62,hairC);bx(b,0,.45,-.3,.6,.32,.06,hairC);bx(b,-.3,.5,-.05,.05,.2,.45,hairC);bx(b,.3,.5,-.05,.05,.2,.45,hairC)}
    else if(hs==='long'){bx(b,0,.62,-.02,.62,.12,.62,hairC);bx(b,0,.2,-.32,.62,.86,.08,hairC);bx(b,-.31,.35,-.06,.06,.6,.5,hairC);bx(b,.31,.35,-.06,.06,.6,.5,hairC)}
    else if(hs==='bun'){bx(b,0,.62,-.02,.62,.12,.62,hairC);bx(b,0,.45,-.3,.6,.32,.06,hairC);bx(b,0,.8,-.1,.24,.22,.24,hairC)}
    else if(hs==='cap'){bx(b,0,.65,-.02,.62,.16,.62,o.hat||'#e94b3c');bx(b,0,.58,.36,.5,.05,.28,o.hat||'#e94b3c')}
    else if(hs==='buzz'){bx(b,0,.6,-.01,.6,.05,.6,hairC);bx(b,0,.47,-.295,.59,.24,.02,hairC);bx(b,-.295,.5,-.05,.02,.16,.44,hairC);bx(b,.295,.5,-.05,.02,.16,.44,hairC)}
    else if(hs==='spiky'){bx(b,0,.62,-.02,.62,.1,.62,hairC);for(let i=0;i<9;i++){const x=-.22+(i%3)*.22,z=-.2+Math.floor(i/3)*.2;bx(b,x,.73,z,.12,.16,.12,hairC,.3*((i%2)?1:-1))}bx(b,0,.45,-.3,.6,.32,.06,hairC)}
    else if(hs==='side'){bx(b,0,.62,-.02,.62,.12,.62,hairC);bx(b,-.12,.7,.05,.42,.08,.5,hairC);bx(b,0,.45,-.3,.6,.32,.06,hairC);bx(b,-.3,.5,-.05,.05,.24,.45,hairC);bx(b,.3,.5,-.05,.05,.2,.45,hairC);bx(b,-.2,.56,.3,.24,.1,.04,hairC)}
    else if(hs==='ponytail'){bx(b,0,.62,-.02,.62,.12,.62,hairC);bx(b,0,.45,-.3,.6,.32,.06,hairC);bx(b,-.3,.5,-.05,.05,.24,.45,hairC);bx(b,.3,.5,-.05,.05,.24,.45,hairC);bx(b,0,.5,-.4,.16,.16,.14,hairC);bx(b,0,.22,-.44,.14,.46,.12,hairC)}
    else if(hs==='bob'){bx(b,0,.62,-.02,.64,.12,.64,hairC);bx(b,0,.36,-.32,.64,.56,.08,hairC);bx(b,-.32,.38,-.04,.07,.52,.56,hairC);bx(b,.32,.38,-.04,.07,.52,.56,hairC);bx(b,0,.56,.3,.6,.1,.04,hairC)}
    else if(hs==='braid'){bx(b,0,.62,-.02,.62,.12,.62,hairC);bx(b,0,.45,-.3,.6,.32,.06,hairC);bx(b,-.3,.5,-.05,.05,.24,.45,hairC);bx(b,.3,.5,-.05,.05,.24,.45,hairC);for(let i=0;i<5;i++)bx(b,0,.3-i*.17,-.36,.15-(i%2)*.03,.16,.12,hairC);bx(b,0,-.52,-.36,.08,.1,.08,o.tie2||'#e94b3c')}
    else if(hs==='grey'){bx(b,0,.62,-.02,.62,.1,.62,'#bdbdbd');bx(b,0,.45,-.3,.6,.3,.06,'#bdbdbd');bx(b,0,.75,-.18,.26,.2,.24,'#bdbdbd')}
    if(o.hat&&hs!=='cap'){bx(b,0,.7,0,.66,.2,.66,o.hat);bx(b,0,.6,0,.86,.04,.86,o.hat)}
    if(o.glasses){const c='#0d0d0d',z=.3,y=.32;for(const s of[-1,1]){const cx=s*.13;bx(b,cx,y+.065,z,.2,.03,.02,c);bx(b,cx,y-.065,z,.2,.03,.02,c);bx(b,cx-.085,y,z,.03,.16,.02,c);bx(b,cx+.085,y,z,.03,.16,.02,c);bx(b,s*.29,y+.05,.15,.02,.03,.3,c)}bx(b,0,y+.04,z,.06,.025,.02,c)}
    if(o.shades){bx(b,0,.33,.3,.52,.12,.02,'#0d0d0d')}
    if(o.mustache)bx(b,0,.17,.295,.24,.05,.02,o.hairC||'#2a1d14');
    if(o.beard){bx(b,0,.06,.27,.5,.14,.08,hairC)}
    if(o.headset){bx(b,0,.66,0,.08,.06,.66,'#222');bx(b,-.31,.32,0,.06,.18,.18,'#222');bx(b,.31,.32,0,.06,.18,.18,'#222')}
  }));
  const face=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),faceMat(o.face||'smile'));face.position.set(0,.28,.291);head.add(face);
  const legL=leg(-1),legR=leg(1),armL=arm(-1),armR=arm(1);
  const body=new THREE.Group();body.add(torso,legL,legR,armL,armR,head);g.add(body);
  if(o.held){const hb=new Batch();o.held(hb);const hm=hb.mesh(CHM);armR.add(hm)}
  g.userData={body,legL,legR,armL,armR,head,face,torso,ph:Math.random()*6,o};
  return g}
export function setFace(c,style){c.userData.face.material=faceMat(style)}
const T=(o,k,v,a)=>{o[k]+=(v-o[k])*a};
export function anim(c,dt,s={}){const u=c.userData,a=Math.min(1,dt*12),t=performance.now()/1000;const sp=s.speed||0;u.ph+=dt*sp*1.55;
  let ll=0,lr=0,al=0,ar=0,alz=0,arz=0,by=0,ty=0,hx=0,bx_=0;
  const sw=Math.sin(u.ph)*Math.min(1,sp/4.5)*(sp>8?1.1:.85);
  ll=sw;lr=-sw;al=-sw*.9;ar=sw*.9;by=Math.abs(Math.cos(u.ph))*Math.min(.08,sp*.012);
  if(s.air){ll=-.6;lr=.35;al=-2.6;ar=-2.6;alz=-.3;arz=.3}
  const e=sp>.5||s.air?null:s.emote;
  if(s.sit){ll=-1.5;lr=-1.5;by=-.32;al=-.4;ar=-.4}
  if(s.ride){ll=0;lr=-.3;al=-1.1;ar=-1.1;by=0}
  if(s.lie){al=-3;ar=-3}
  if(e==='wave'){arz=2.7;ar=Math.sin(t*10)*.25;hx=-.1}
  else if(e==='dance'){const k=Math.sin(t*7);al=-2.4+k*.6;ar=-2.4-k*.6;ty=k*.5;by=Math.abs(k)*.12;ll=k*.25;lr=-k*.25}
  else if(e==='sip'){ar=-2.1;arz=-.35;hx=-.18}
  else if(e==='sixseven'){const k=Math.sin(t*9);al=-1.3+k*.45;ar=-1.3-k*.45}
  else if(e==='cheer'){al=-2.9;ar=-2.9;alz=-.25-Math.sin(t*12)*.15;arz=.25+Math.sin(t*12)*.15;by=Math.abs(Math.sin(t*6))*.15}
  else if(e==='clap'){al=-1.35;ar=-1.35;alz=.3+Math.max(0,Math.sin(t*14))*.25;arz=-.3-Math.max(0,Math.sin(t*14))*.25}
  else if(e==='talk'){ar=-.9+Math.sin(t*5)*.4;al=-.3+Math.sin(t*4)*.2;arz=.2}
  else if(e==='play'){al=-1.1;ar=-1.2+Math.sin(t*16)*.2;arz=.4}
  else if(e==='drum'){al=-1.3+Math.max(0,Math.sin(t*14))*.4;ar=-1.3+Math.max(0,Math.sin(t*14+3))*.4}
  else if(e==='pose'){alz=-.8;arz=.8;al=-.3;ar=-.3;hx=-.15}
  else if(e==='beg'){al=-1.4;ar=-1.4;alz=.2;arz=-.2;hx=.15+Math.sin(t*4)*.05}
  else if(!sp&&!s.air&&!s.sit&&!s.ride){by=Math.sin(t*2+u.ph)*.015;al=Math.sin(t*1.6+u.ph)*.04;ar=-al}
  T(u.legL.rotation,'x',ll,a);T(u.legR.rotation,'x',lr,a);T(u.armL.rotation,'x',al,a);T(u.armR.rotation,'x',ar,a);T(u.armL.rotation,'z',alz,a);T(u.armR.rotation,'z',arz,a);
  T(u.body.position,'y',by,a);T(u.body.rotation,'y',ty,a);T(u.head.rotation,'x',hx,a)}

import {THREE,G,Batch,bx,col,blk,tex,FONT_T,FONT_D,rng,CHM} from './core.js';
const PI=Math.PI;
/* Every plot that isn't built yet is a nameless construction lot: no project names, just "something's cooking". */
const TEASE=[
  ['SOMETHING\'S COOKING','Watch this space.'],
  ['SOMETHING\'S BREWING','Grinding. Tamping. Pulling.'],
  ['COMING SOON','Can\'t say what. Can say it\'s good.'],
  ['BIG THINGS LOADING','Please wait… a little longer.'],
  ['IN THE OVEN','Not ready. Smells great though.']];
const TALL=['SOMETHING TALL IS COOKING','Floors loading. Elevator music included.'];
const cache={};
export function teaseTex(i,tall){const k=tall?'t':i%TEASE.length;if(cache[k])return cache[k];const [h,s]=tall?TALL:TEASE[k];
  const t=tex(800,360,(c,w,hh)=>{c.fillStyle='#ffcc3a';c.fillRect(0,0,w,hh);for(let q=-10;q<30;q++){c.fillStyle='#141414';c.beginPath();c.moveTo(q*40,hh);c.lineTo(q*40+20,hh);c.lineTo(q*40+60,hh-36);c.lineTo(q*40+40,hh-36);c.fill()}
    c.fillStyle='#141414';c.font='800 26px '+FONT_T;c.fillText('UNDER CONSTRUCTION',36,56);let sz=86;c.font='400 '+sz+'px '+FONT_D;while(c.measureText(h).width>w-70&&sz>34){sz-=4;c.font='400 '+sz+'px '+FONT_D}c.fillText(h,36,58+sz+4);
    c.font='600 30px '+FONT_T;c.fillText(s,36,58+sz+52);c.font='700 20px '+FONT_T;c.fillText('TAP FOR DETAILS',36,hh-52)});
  t.userData.keep=true;cache[k]=t;return t}
export const COOKING={n:'Something\'s cooking',tag:'Under construction',st:'Coming soon',d:'Something is being built on this plot. What exactly? That\'s a secret for now. Check back soon.',href:'',color:'#ffcc3a'};

export function makeLot(scene,ctx,o){const {S,addPlane}=ctx;const {x0,x1,z0,z1}=o;const R=rng(Math.floor(Math.abs(x0*13+z0*7))+3);const W_=x1-x0,D=z1-z0,area=W_*D;
  const d=o.door||{side:'s',at:(x0+x1)/2};const nx=d.side==='e'?1:d.side==='w'?-1:0,nz=d.side==='s'?1:d.side==='n'?-1:0;const gate=d.at,gw=2;
  blk(S,x0-.5,x1+.5,0,.05,z0-.5,z1+.5,o.snow?'#e6edf2':'#b9a27a',false);
  blk(S,x0+1,x1-1,0,.4,z0+1,z1-1,'#bdbdbd',true);
  // fence: 4m panels, gate gap on the door side
  const fc=o.fenceCol||['#2f5bff','#2a52e6'];
  const seg=(a0,a1,fixed,along,side)=>{for(let u=a0;u<a1-.01;u+=4){const u2=Math.min(a1,u+4);let s0=u,s1=u2;if(side===d.side){if(s1>gate-gw&&s0<gate+gw){if(s0<gate-gw)pan(s0,gate-gw,fixed,along);if(s1>gate+gw)pan(gate+gw,s1,fixed,along);continue}}pan(s0,s1,fixed,along)}};
  let pi=0;const pan=(s0,s1,fixed,along)=>{const c=fc[pi++%2];if(along){blk(S,s0,s1,0,2.2,fixed-.06,fixed+.06,c);bx(S,(s0+s1)/2,1.1,fixed,s1-s0,.12,.14,'#ffffff')}else{blk(S,fixed-.06,fixed+.06,0,2.2,s0,s1,c);bx(S,fixed,1.1,(s0+s1)/2,.14,.12,s1-s0,'#ffffff')}};
  seg(x0-.5,x1+.5,z1+.5,true,'s');seg(x0-.5,x1+.5,z0-.5,true,'n');seg(z0-.5,z1+.5,x1+.5,false,'e');seg(z0-.5,z1+.5,x0-.5,false,'w');
  if(o.tower)tower(scene,S,o,R);
  else{const floors=o.floors!=null?o.floors:(area>400?3:area>180?1:0);const sx=Math.max(1,Math.round(W_/5)),sz=Math.max(1,Math.round(D/5));const H=floors?floors*3.5:0;
    for(let i=0;i<=sx;i++)for(let j=0;j<=sz;j++){const x=x0+1.6+(W_-3.2)*i/sx,z=z0+1.6+(D-3.2)*j/sz;const edge=(nz>0&&j===sz)||(nz<0&&j===0)||(nx>0&&i===sx)||(nx<0&&i===0);if(edge&&Math.abs(nx?z-gate:x-gate)<2.4)continue;
      const h=floors?H:(.8+R()*1.6);blk(S,x-.25,x+.25,.4,.4+h,z-.25,z+.25,'#a9a9a9',true);bx(S,x,.4+h+.5,z,.2,1,.04,'#7a4a2a')}
    for(let f=1;f<=floors;f++){const y=.4+f*3.5;const part=f===floors?.55:1;blk(S,x0+1.2,x0+1.2+(W_-2.4)*part,y-.25,y,z0+1.2,z1-1.2,'#bdbdbd',false)}
    if(floors){const y1=.4+H;bx(S,(x0+x1)/2,y1/2,nz>=0?z1-.6:z0+.6,.08,y1,.08,'#ffcc3a');for(let f=1;f<=floors;f++)bx(S,(x0+x1)/2,.4+f*3.5-1.6,nz>=0?z1-.6:z0+.6,W_-2,.08,.08,'#ffcc3a')}
    if(area>150&&o.crane!==false)crane(scene,S,x0+(W_>12?W_*.7:W_/2),z0+2.2,.4+(area>400?24:14+R()*4),area>400?22:13,R)}
  // materials
  bx(S,x1-3.9,.85,z0+3.6,1.5,.9,1.05,'#b5482e');bx(S,x1-3.9,1.32,z0+3.6,1.4,.05,.95,'#9e3d26');col(x1-4.65,x1-3.15,.4,1.3,z0+3.05,z0+4.15);
  const sp=new THREE.ConeGeometry(1.3,1.1,8);sp.translate(x0+3,.95,z0+3);S.add(sp,o.snow?'#f3f6f8':'#d8c08a');col(x0+2,x0+4,.4,1.1,z0+2,z0+4);
  bx(S,x0+2.8,.62,z1-3,1.7,.45,.8,'#e8e2d6');
  // hoarding facing the street (shared texture)
  // hoarding arch over the gate, facing the street (shared texture)
  const along=nx?D:W_;const hw=Math.min(7.5,along-1.2),hh=hw*.45,hy=2.7+hh/2;
  const hp=nx?[nx>0?x1+.62:x0-.62,hy,gate]:[gate,hy,nz>0?z1+.62:z0-.62];
  const ry=d.side==='s'?0:d.side==='n'?PI:d.side==='e'?PI/2:-PI/2;
  if(hw>3){addPlane(scene,hw,hh,teaseTex(Math.floor(R()*5),!!o.tower),hp,ry,()=>G.card(COOKING),{reach:9});
    const bk=nx?[hp[0]-nx*.06,hy,gate]:[gate,hy,hp[2]-nz*.06];bx(S,bk[0],hy,bk[2],nx?.06:hw+.1,hh+.1,nx?hw+.1:.06,'#141414');
    for(const s of[-1,1]){const px=nx?hp[0]:gate+s*(hw/2-.1),pz=nx?gate+s*(hw/2-.1):hp[2];blk(S,px-.1,px+.1,0,2.7+hh,pz-.1,pz+.1,'#141414',true)}
    if(nx)col(hp[0]-.12,hp[0]+.12,2.7,2.7+hh,gate-hw/2,gate+hw/2);else col(gate-hw/2,gate+hw/2,2.7,2.7+hh,hp[2]-.12,hp[2]+.12)}
  for(const s of[-1,1]){const gx=nx?(nx>0?x1+.9:x0-.9):gate+s*(gw+.3),gz=nx?gate+s*(gw+.3):(nz>0?z1+.9:z0-.9);const g=new THREE.ConeGeometry(.22,.6,8);g.translate(gx,.3,gz);S.add(g,'#ff6a3d');bx(S,gx,.32,gz,.3,.08,.3,'#ffffff')}
  G.blocked.push([x0-2,x1+2,z0-2,z1+2]);
  const dx=nx?(nx>0?x1+.5:x0-.5):gate,dz=nz?(nz>0?z1+.5:z0-.5):gate;const out={x:dx+nx*2,z:dz+nz*2,fx:nx,fz:nz};
  G.buildings.push({name:'Construction lot',short:'',x0,x1,z0,z1,col:o.tower?'#d4a017':'#b9a27a',door:out,room:null,lot:true,tower:!!o.tower,h:o.tower?o.h:0});
  G.triggers.push({x:dx+nx*1.6,z:dz+nz*1.6,r:1.8,label:'Something\'s cooking here',act:()=>G.card(COOKING)});
  return out}

/* skyscraper under construction: concrete core, column frame, slabs, safety net, tall crane */
function tower(scene,S,o,R){const {x0,x1,z0,z1}=o;const cx=(x0+x1)/2,cz=(z0+z1)/2;const H=o.h||40;const built=Math.round(H*(.45+R()*.4)/3.6);const top=.4+built*3.6;
  const ix0=x0+1.6,ix1=x1-1.6,iz0=z0+1.6,iz1=z1-1.6;
  blk(S,cx-2.6,cx+2.6,.4,top+7.2,cz-2.6,cz+2.6,'#9c9c9c',true);
  const nx=Math.max(2,Math.round((ix1-ix0)/5)),nz=Math.max(2,Math.round((iz1-iz0)/5));
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){if(i&&j&&i<nx&&j<nz)continue;const x=ix0+(ix1-ix0)*i/nx,z=iz0+(iz1-iz0)*j/nz;blk(S,x-.3,x+.3,.4,top,z-.3,z+.3,'#a9a9a9',true)}
  for(let f=1;f<=built;f++){const y=.4+f*3.6;blk(S,ix0-.3,ix1+.3,y-.28,y,iz0-.3,iz1+.3,f%4===0?'#b3b3b3':'#bdbdbd',false)}
  col(ix0-.3,ix1+.3,0,top,iz0-.3,iz1+.3);
  for(let f=built-2;f<=built;f++){if(f<1)continue;const y=.4+f*3.6-1.8;bx(S,cx,y,iz1+.42,ix1-ix0+.6,3.2,.06,'#2e7d32');bx(S,ix1+.42,y,cz,.06,3.2,iz1-iz0+.6,'#2e7d32')}
  for(let k=0;k<3;k++){const y=.4+(built+1+k)*3.6;bx(S,ix0+.2,y-1.8,iz0+.2,.16,3.6,.16,'#7a4a2a')}
  crane(scene,S,cx+3.6,cz,top+14,Math.min(26,(ix1-ix0)*1.1+8),R,true)}
let REDM=null;
function crane(scene,B,cx,cz,H,L,R,big){const s=big?1.4:1;blk(B,cx-.5*s,cx+.5*s,.4,H,cz-.5*s,cz+.5*s,'#ffcc3a',false);for(let y=1;y<H-.5;y+=1.6)bx(B,cx,y,cz,1.1*s,.08,1.1*s,'#d4a017');col(cx-.5*s,cx+.5*s,0,H,cz-.5*s,cz+.5*s);
  const a=R()*PI*2;const jib=new THREE.Group();const jb=new Batch();bx(jb,L/2-3,0,0,L,.6*s,.6*s,'#ffcc3a');bx(jb,-4.5,0,0,6,.5*s,.5*s,'#ffcc3a');bx(jb,-6.5,-.8,0,1.6,1.4,1.2,'#7a7f86');bx(jb,0,.9,0,.5,1.8,.5,'#ffcc3a');bx(jb,0,-.9,0,1.2*s,1,1.2*s,'#e8e2d6');
  const hl=Math.min(H*.55,18);bx(jb,L*.7,-hl/2,0,.04,hl,.04,'#333');bx(jb,L*.7,-hl-.4,0,1.4,.8,1.4,'#b5482e');
  if(!REDM||REDM.userData.dead){REDM=new THREE.MeshBasicMaterial({color:'#ff2d2d'});REDM.addEventListener('dispose',()=>REDM.userData.dead=true)}const red=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),REDM);red.position.set(0,1.9,0);jib.add(red);
  jib.add(jb.mesh(CHM));jib.position.set(cx,H+.3,cz);jib.rotation.y=a;scene.add(jib);(G.cranes=G.cranes||[]).push({g:jib,a,sp:(.03+R()*.06)*(R()<.5?-1:1),red})}

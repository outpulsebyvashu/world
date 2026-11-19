import {THREE,G,Batch,bx,cyl,col,blk,tex,wrap,signTex,FONT_T,FONT_D,rng,makeChar,CHM} from './core.js';
import {prop,fac,pot,rails,shade,gable,stringLights} from './arch.js';
import {TOWNS,ORDER} from './towns.js';
import {mark,move} from './relocate.js';
import {COOKING} from './lots.js';
import {STORY,NUMS,ROLES,SKILLS} from './data.js';
import {pmHouse,loluMall,choupati,museumGrounds} from './v5.js';
const PI=Math.PI;
const rot=(b,lx,lz)=>{const c=Math.cos(b.ry),s=Math.sin(b.ry);return[b.x+lx*c+lz*s,b.z-lx*s+lz*c]};
const aabb=(x,z,w,d,ry)=>{const sw=Math.abs(Math.sin(ry))>.5;const hw=(sw?d:w)/2,hd=(sw?w:d)/2;return[x-hw,x+hw,z-hd,z+hd]};

/* ---------- route board texture ---------- */
function routeTex(here){return tex(768,384,(x,W,H)=>{x.fillStyle='#141414';x.fillRect(0,0,W,H);x.fillStyle='#ffcc3a';x.fillRect(0,0,W,64);x.fillStyle='#141414';x.font='400 44px '+FONT_D;x.fillText('VASHU TRANSPORT · ALL TOWNS',24,48);
  ORDER.forEach((id,i)=>{const t=TOWNS[id],y=104+i*44;x.fillStyle=t.color;x.beginPath();x.arc(40,y-10,12,0,7);x.fill();x.fillStyle=id===here?'#ffcc3a':'#f4efe6';x.font=(id===here?'800 ':'600 ')+'30px '+FONT_T;x.fillText(t.name+(id===here?'  ← you are here':t.ready?'':'  · coming soon'),66,y)});
  x.fillStyle='#ffcc3a';x.font='800 22px '+FONT_T;x.fillText('TAP TO RIDE',W-170,H-20)})}

/* ---------- bus stop + parked bus (every town) ---------- */
function busStop(scene,ctx){const {S,WIN,addPlane,TD,TN}=ctx;const b=TD.bus;const p=prop(S,b.x,0,b.z,b.ry);
  p.box(0,.04,0,3.8,.08,2.1,'#cfc7b6');p.box(0,.5,-.4,3,.12,.55,'#2f5bff');p.box(0,.25,-.4,2.8,.4,.1,'#2c2f36');
  for(const [a,c] of[[-1.65,-.8],[1.65,-.8],[-1.65,.8],[1.65,.8]])p.box(a,1.45,c,.12,2.9,.12,'#2c2f36');
  p.box(0,2.95,0,3.8,.16,2.1,'#2f5bff');p.box(0,3.06,.98,3.8,.12,.14,'#ffcc3a');p.box(0,1.6,-.86,3.3,2.2,.06,'#1d2733');
  const bb=aabb(...rot(b,0,-.86),3.4,.2,b.ry);col(bb[0],bb[1],0,2.9,bb[2],bb[3]);
  const st=rot(b,0,-.15);G.seats.push({x:st[0],z:st[1],y:.55,yaw:b.ry,label:'Wait for the bus'});
  const bp=rot(b,0,-.82);addPlane(scene,3,1.5,routeTex(TN),[bp[0],1.75,bp[1]],b.ry,()=>G.bus(),{reach:6});
  const tp=rot(b,0,1.06);addPlane(scene,2.4,.5,signTex('BUS STOP · '+TD.name.toUpperCase(),'#ffcc3a','#141414',768,160),[tp[0],3.4,tp[1]],b.ry,null);
  const fp=rot(b,0,1.9);G.triggers.push({x:fp[0],z:fp[1],r:2.6,label:'Take the bus',act:()=>G.bus()});
  // the bus
  const v=prop(S,b.bx,0,b.bz,b.bry);v.box(0,1.6,0,2.5,2.5,10,'#ffcc3a');v.box(0,2.92,0,2.52,.18,10,'#e94b3c');v.box(0,.62,0,2.54,.34,10.02,'#e94b3c');
  v.box(0,2.05,-.4,2.56,.95,8,'#26323d');v.box(0,1.95,5.01,2.2,1.3,.04,'#26323d');v.box(0,1.95,-5.01,2.2,1,.04,'#26323d');v.box(1.27,1.3,3.7,.05,1.9,1.1,'#141414');
  for(const zz of[3.4,-3.4])for(const s of[-1,1])v.wheel(s*1.15,.5,zz,.5,.36);for(const s of[-1,1])v.box(s*.85,.9,5.04,.35,.2,.04,'#fff6c8');
  const ba=aabb(b.bx,b.bz,2.6,10.2,b.bry);col(ba[0],ba[1],0,3,ba[2],ba[3]);
  const fr=Math.cos(b.bry),fs=Math.sin(b.bry);const m=new THREE.Mesh(new THREE.PlaneGeometry(2,.42),new THREE.MeshBasicMaterial({map:signTex('ALL 6 TOWNS','#141414','#ffcc3a',512,110)}));m.position.set(b.bx+fs*5.03,2.75,b.bz+fr*5.03);m.rotation.y=b.bry;scene.add(m);
  G.blocked.push([Math.min(ba[0],bb[0])-1,Math.max(ba[1],bb[1])+1,Math.min(ba[2],bb[2])-1,Math.max(ba[3],bb[3])+1])}

/* ---------- Vashu Museum (Vashupur), Indo-Saracenic, on the old HQ plot ---------- */
function museum(scene,ctx){const {S,WIN,LMP,addPlane,W}=ctx;const st='#efe4cc',dk='#cdbb95',rd='#9c4a2f',gold='#c9a227';
  blk(S,-11,11,0,9,-44,-31,st);blk(S,-11.3,11.3,8.6,9.2,-44.3,-30.7,dk,false);
  for(let x=-10.6;x<=10.6;x+=1.06){bx(S,x,9.5,-30.75,.5,.6,.3,st);bx(S,x,9.5,-43.95,.5,.6,.3,st)}for(let z=-43.5;z<=-31.5;z+=1.06){bx(S,-10.95,9.5,z,.3,.6,.5,st);bx(S,10.95,9.5,z,.3,.6,.5,st)}
  const F=fac({x0:-11,x1:11,z0:-44,z1:-31},'s');
  for(const u of[-8.6,-6.2,6.2,8.6]){F.box(WIN,u,2.6,.04,1.3,2.4,.08,'#ffffff');F.arch(WIN,u,3.8,.04,.65,.08,'#ffffff');F.box(S,u,1.3,.1,1.6,.14,.22,dk);F.arch(S,u,3.8,.1,.8,.06,rd)}
  for(const u of[-8.6,-6.2,-2.6,2.6,6.2,8.6]){F.box(WIN,u,6.6,.04,1.1,1.8,.08,'#ffffff');F.arch(WIN,u,7.5,.04,.55,.08,'#ffffff')}
  for(const side of['e','w']){const E=fac({x0:-11,x1:11,z0:-44,z1:-31},side);for(const u of[-41,-37.5,-34])for(const y of[2.6,6.6]){E.box(WIN,u,y,.04,1.2,2,.08,'#ffffff');E.arch(WIN,u,y+1.05,.04,.6,.08,'#ffffff')}}
  F.box(S,0,1.9,.06,2.6,3.8,.12,'#4a2e1a');F.arch(S,0,3.8,.06,1.3,.12,'#4a2e1a');F.arch(S,0,3.8,.1,1.55,.08,rd);
  // portico + steps
  blk(S,-6,6,0,.6,-31,-28.2,'#e3d6bb');blk(S,-6,6,0,.4,-28.2,-27.2,'#e8dcc4');blk(S,-6,6,0,.2,-27.2,-26.2,'#eee3cd');
  for(const x of[-5.2,-2,2,5.2]){cyl(S,x,3.6,-28.8,.36,.42,6,'#f6eedc',14);col(x-.42,x+.42,0,6.6,-29.2,-28.4);bx(S,x,6.7,-28.8,1,.3,1,dk)}
  blk(S,-6.4,6.4,6.6,7.5,-31,-28.1,st,false);bx(S,0,7.6,-28.2,12.8,.2,.25,rd);
  const sh=new THREE.Shape([new THREE.Vector2(-6.4,0),new THREE.Vector2(6.4,0),new THREE.Vector2(0,1.7)]);const pg=new THREE.ExtrudeGeometry(sh,{depth:2.9,bevelEnabled:false});pg.translate(0,7.5,-31);S.add(pg,st);
  addPlane(scene,8.2,.82,signTex('OUTPULSE MUSEUM','#efe4cc','#5a3b1e',1024,104),[0,7.05,-28.06],0,null);
  // central dome on a drum + four chhatris
  cyl(S,0,10.6,-37.5,4.3,4.3,2.6,st,28);for(let a=0;a<PI*2;a+=PI/8)bx(WIN,Math.cos(a)*4.32,10.6,-37.5+Math.sin(a)*4.32,.5,1.2,.5,'#ffffff',-a);
  const dg=new THREE.SphereGeometry(4.5,28,14,0,PI*2,0,PI/2);dg.scale(1,1.15,1);dg.translate(0,11.9,-37.5);S.add(dg,'#f3ead6');cyl(S,0,11.9,-37.5,4.6,4.6,.3,dk,28);
  cyl(S,0,17.4,-37.5,.12,.2,1.4,gold,8);const fg=new THREE.SphereGeometry(.32,10,8);fg.translate(0,18.3,-37.5);S.add(fg,gold);
  for(const [x,z] of[[-9.6,-42.6],[9.6,-42.6],[-9.6,-32.4],[9.6,-32.4]]){for(const [a,c] of[[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]])bx(S,x+a,10.6,z+c,.22,2.2,.22,st);bx(S,x,11.8,z,2.1,.22,2.1,dk);const g=new THREE.SphereGeometry(1.05,14,8,0,PI*2,0,PI/2);g.translate(x,11.9,z);S.add(g,'#f3ead6');cyl(S,x,13.15,z,.06,.1,.6,gold,6)}
  for(let x=-10.6;x<=10.6;x+=.7)bx(LMP,x,9.9,-30.6,.12,.12,.12,'#ffffff');for(let a=0;a<=PI;a+=.14)bx(LMP,Math.cos(a)*1.6,3.8+Math.sin(a)*1.6,-30.85,.1,.1,.1,'#ffffff');
  // lawns, lamps and banners in the forecourt
  for(const s of[-1,1]){blk(S,s*7,s*11.5,0,.06,-28,-24.5,'#6dbb5c',false);pot(S,s*6.6,-25.6,'#9c4a2f','#3f9b4a',.7)}
  for(const s of[-1,1]){const x=s*8.6;blk(S,x-.08,x+.08,0,5,-25.4,-25.2,'#3a2a1a');const bn=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.4),new THREE.MeshLambertMaterial({map:signTex('MUSEUM','#9c4a2f','#efe4cc',128,280),side:THREE.DoubleSide}));bn.position.set(x+s*.6,3.6,-25.3);scene.add(bn)}
  col(-11,11,0,18,-44,-31);
  G.triggers.push({x:0,z:-29.2,y:.6,r:2.2,label:'Enter the Outpulse Museum',act:()=>G.enter('museum')});
  G.buildings.push({name:'Outpulse Museum',short:'Museum',x0:-11,x1:11,z0:-44,z1:-28,col:'#efe4cc',door:{x:0,z:-24.6},room:'museum'});
  G.blocked.push([-13,13,-47,-23]);
  return{x:0,z:-24.8,fx:0,fz:1}}


/* ---------- welcome arch across an x-road at x ---------- */
function welcomeArch(scene,ctx,x,east,west,col,zc=0){const {S,LMP,addPlane}=ctx;
  for(const z of[-5.2,5.2]){blk(S,x-.4,x+.4,0,6.6,zc+z-.4,zc+z+.4,col);bx(S,x,6.75,zc+z,1,.3,1,'#f4efe6')}
  blk(S,x-.35,x+.35,5.3,6.6,zc-5.2,zc+5.2,col,false);for(let z=-4.8;z<=4.8;z+=.6)bx(LMP,x,5.22,zc+z,.12,.12,.12,'#ffffff');
  addPlane(scene,8.6,1.1,signTex(east,col,'#ffffff',1024,130),[x+.37,5.95,zc],PI/2,null);addPlane(scene,8.6,1.1,signTex(west,col,'#ffffff',1024,130),[x-.37,5.95,zc],-PI/2,null)}
/* same arch over a road that runs along z (pillars at x = xc ± 5.2), faces north/south */
function welcomeArchZ(scene,ctx,z,north,south,col,xc=0){const {S,LMP,addPlane}=ctx;
  for(const x of[-5.2,5.2]){blk(S,xc+x-.4,xc+x+.4,0,6.6,z-.4,z+.4,col);bx(S,xc+x,6.75,z,1,.3,1,'#f4efe6')}
  blk(S,xc-5.2,xc+5.2,5.3,6.6,z-.35,z+.35,col,false);for(let x=-4.8;x<=4.8;x+=.6)bx(LMP,xc+x,5.22,z,.12,.12,.12,'#ffffff');
  addPlane(scene,8.6,1.1,signTex(north,col,'#ffffff',1024,130),[xc,5.95,z-.37],PI,null);addPlane(scene,8.6,1.1,signTex(south,col,'#ffffff',1024,130),[xc,5.95,z+.37],0,null)}

/* ---------- Vedshree Kunj (Kaapikunj): a garden home ---------- */
function kunj(scene,ctx){const {S,WIN,LMP,addPlane}=ctx;const cr='#f6efe2',tc='#c1693c',wl='#efe2c8';
  // compound wall with a gate on the north side (x=-47)
  const wall=(x0,x1,z0,z1)=>{blk(S,x0,x1,0,1.1,z0,z1,wl);blk(S,x0-.04,x1+.04,1.1,1.24,z0-.04,z1+.04,tc,false)};
  wall(-60,-48.6,9.5,9.8);wall(-45.4,-34,9.5,9.8);wall(-60,-34,21.7,22);wall(-60,-59.7,9.5,22);wall(-34.3,-34,9.5,22);
  for(const x of[-48.8,-45.2]){blk(S,x-.35,x+.35,0,2.6,9.3,10,wl);bx(S,x,2.7,9.65,.8,.2,.8,tc);bx(LMP,x,3.05,9.65,.34,.5,.34,'#ffffff')}
  blk(S,-49.1,-44.9,2.85,3.35,9.45,9.85,tc,false);addPlane(scene,3.6,.42,signTex('VEDSHREE KUNJ',tc,'#fff6e6',768,96),[-47,3.1,9.42],PI,null);
  blk(S,-47.8,-46.2,0,.07,9.8,14,'#d9cdb8',false);for(let z=10.3;z<13.8;z+=.9)bx(S,-47,.08,z,1.2,.02,.6,'#cbbd9f');
  // house: two storeys, terracotta trims, tiled gable roof
  blk(S,-56,-38,0,3.6,14,21.5,cr);blk(S,-56.1,-37.9,3.5,3.75,13.9,21.6,tc,false);blk(S,-56,-38,3.75,7.2,14,21.5,cr);gable(S,-47,17.75,7.2,18,7.5,2,'#b5552e','x',.6,cr);
  const F=fac({x0:-56,x1:-38,z0:14,z1:21.5},'n');F.box(S,-47,1.3,.06,1.5,2.6,.12,'#5a3220');F.arch(S,-47,2.6,.06,.75,.12,'#5a3220');F.arch(S,-47,2.6,.1,.95,.08,tc);
  for(const u of[-53.5,-50.5,-43.5,-40.5]){F.box(WIN,u,1.9,.04,1.2,1.4,.08,'#ffffff');F.arch(WIN,u,2.6,.04,.6,.08,'#ffffff');F.box(S,u,1.1,.1,1.5,.12,.22,tc)}
  for(const u of[-53.5,-49,-45,-40.5]){F.box(WIN,u,5.4,.04,1.1,1.5,.08,'#ffffff');F.box(S,u,6.3,.1,1.3,.14,.2,tc)}
  for(let i=0;i<6;i++)for(let j=0;j<4;j++)F.box(S,-55.2+i*.3,1.2+j*.45,.05,.06,.3,.06,tc);
  // balcony with rails and bougainvillea
  blk(S,-52,-42,3.5,3.72,13.1,14,'#e7d8bf',false);col(-52,-42,3.5,3.72,13.1,14);rails(S,-52,-42,13.12,13.12,3.72,.95,tc,.4);
  const bg=(x,y,z,k=1)=>{for(let i=0;i<5;i++){const g=new THREE.IcosahedronGeometry((.35+((i*37)%5)*.06)*k,0);g.translate(x+Math.sin(i*2.1)*.5*k,y+Math.cos(i*1.7)*.3*k,z+Math.cos(i*2.9)*.3*k);S.add(g,i%3?'#e64a8b':i%2?'#d63a7a':'#4f8f3a')}};
  bg(-52.2,4.4,13.3);bg(-41.8,4.4,13.3);bg(-59.5,1.4,9.9,1.3);bg(-34.5,1.4,9.9,1.3);bg(-55.8,3.3,13.8,.9);
  // jhoola (swing) in the front garden + tulsi planter + pots
  const sw=prop(S,-53,0,11.8);sw.box(-1.3,1.3,0,.12,2.6,.12,'#6b4a35');sw.box(1.3,1.3,0,.12,2.6,.12,'#6b4a35');sw.box(0,2.6,0,2.8,.14,.14,'#6b4a35');for(const s2 of[-.75,.75])sw.box(s2,1.6,0,.03,2,.03,'#555');sw.box(0,.55,0,1.8,.08,.6,tc);sw.box(0,.95,-.28,1.8,.7,.06,tc);
  col(-54.4,-54.2,0,2.6,11.7,11.9);col(-51.8,-51.6,0,2.6,11.7,11.9);G.seats.push({x:-53,z:11.85,y:.6,yaw:PI,label:'Sit on the jhoola'});
  blk(S,-43.5,-42.5,0,.9,11.3,12.3,'#e7c9a0');blk(S,-43.6,-42.4,.9,1,11.2,12.4,tc,false);bx(S,-43,1.3,11.8,.45,.6,.45,'#3f8f3a',.6);bx(S,-43,1.65,11.8,.25,.35,.25,'#4caf50',.2);
  for(const x of[-55,-50,-44,-39])pot(S,x,13.4,'#b5552e','#3f9b4a',.5);
  // pergola + vines in the east garden
  for(const [x,z] of[[-37.2,15],[-34.8,15],[-37.2,20.5],[-34.8,20.5]])bx(S,x,1.4,z,.14,2.8,.14,'#6b4a35');for(let z=15;z<=20.5;z+=.7)bx(S,-36,2.85,z,2.8,.1,.12,'#6b4a35');
  for(let i=0;i<8;i++){const g=new THREE.IcosahedronGeometry(.45,0);g.translate(-36.6+(i%3)*.6,3.05,15.3+i*.7);S.add(g,i%3?'#4f8f3a':'#e64a8b')}
  G.triggers.push({x:-47,z:12.7,r:1.8,label:'Enter Vedshree Kunj',act:()=>G.enter('kunj')});
  G.buildings.push({name:'Vedshree Kunj',short:'Vedshree Kunj',x0:-56,x1:-38,z0:14,z1:21.5,col:tc,door:{x:-47,z:11.2},room:'kunj'});
  G.blocked.push([-61,-33,8,23]);G.noGrass.push([-47.9,-46.1,9.8,14]);
  return{x:-47,z:12.4,fx:0,fz:-1}}

/* ---------- Kaapikunj coffee estate ---------- */
function estate(scene,ctx){const {S,addPlane}=ctx;
  for(let z=12.8;z<24;z+=2.1){for(let x=-75;x<=-63;x+=1.6){const g=new THREE.IcosahedronGeometry(.62,0);g.scale(1,.85,1);g.rotateY(x*z);g.translate(x,.62,z);S.add(g,(Math.round(x+z)%2)?'#2f5a2a':'#2a5226');
      for(let k=0;k<3;k++)bx(S,x-.3+k*.3,.45+((k*7+Math.round(x))%3)*.2,z+.55,.1,.1,.1,'#c62828')}col(-75.6,-62.4,0,.9,z-.5,z+.5)}
  for(const [x,z] of[[-74.5,18],[-68.2,14],[-64,22.3]]){cyl(S,x,3.2,z,.14,.2,6.4,'#8a7a66',7);const g=new THREE.ConeGeometry(1.5,3.6,7);g.translate(x,7.4,z);S.add(g,'#5d7f4a');col(x-.2,x+.2,0,6.4,z-.2,z+.2)}
  for(const x of[-72,-66]){blk(S,x-.08,x+.08,0,2.2,11.1,11.3,'#5a3f2a')}addPlane(scene,6.4,.8,signTex('KAAPIKUNJ COFFEE ESTATE','#2f5a2a','#f3eee6',1024,128),[-69,2.25,11.06],PI,null)}

/* ---------- Memepura: the sea, a beach strip and meme billboards ---------- */
export function billboard(scene,ctx,x,z,ry,w,h,t){const {S,addPlane}=ctx;const c=Math.cos(ry),sn=Math.sin(ry);for(const s2 of[-1,1]){const px=x+c*s2*(w/2-.4),pz=z-sn*s2*(w/2-.4);blk(S,px-.15,px+.15,0,3+h,pz-.15,pz+.15,'#2c2f36',true)}
  bx(S,x-sn*.08,3+h/2,z-c*.08,Math.abs(c)>.5?w+.3:.12,h+.3,Math.abs(c)>.5?.12:w+.3,'#141414');addPlane(scene,w,h,t,[x,3+h/2,z],ry,null)}
export function memeTex(top,big,bg,fg){return tex(900,360,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle=fg;c.font='800 30px '+FONT_T;c.fillText(top,36,58);let sz=170;c.font='400 '+sz+'px '+FONT_D;while(c.measureText(big).width>W-70&&sz>60){sz-=8;c.font='400 '+sz+'px '+FONT_D}c.fillText(big,34,70+sz*.95)})}
function memepura(scene,ctx){const {S}=ctx;
  blk(S,97,104,0,.03,-40,104,'#ecdcaa',false);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshLambertMaterial({color:'#2a86c8'}));sea.rotation.x=-PI/2;sea.position.set(554,.02,30);sea.receiveShadow=true;scene.add(sea);
  for(let z=-36;z<100;z+=6)bx(S,104.3,.04,z+(z%12?1:0),.6,.02,4.6,'#f4f8fb');
  billboard(scene,ctx,32,24.6,PI,6.4,2.4,memeTex('LIVE FROM THE PITCH','SKILL ISSUE?','#8a63d2','#ffffff'));
  billboard(scene,ctx,93.6,34,-PI/2,7,2.6,memeTex('HOW OLD IS THIS BEACH?','SIX SEVEN','#ff8a3d','#141414'));
  billboard(scene,ctx,57,44.6,PI,6.4,2.4,memeTex('PUBLIC SERVICE ANNOUNCEMENT','TOUCH GRASS →','#5cc46b','#141414'));
  G.noGrass.push([96,260,-120,220])}

/* ---------- Political Basti: lanes, bunting, two joke parties, a loudspeaker van ---------- */
function partyTex(name,line,bg,fg,sym){return tex(400,520,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle=fg;c.font='800 26px '+FONT_T;c.fillText('VOTE',30,60);let sz=88;c.font='400 '+sz+'px '+FONT_D;while(c.measureText(name).width>W-50&&sz>40){sz-=6;c.font='400 '+sz+'px '+FONT_D}c.fillText(name,28,60+sz);
  c.lineWidth=10;c.strokeStyle=fg;c.fillStyle=fg;if(sym==='kettle'){c.beginPath();c.arc(W/2,330,70,PI,0);c.lineTo(W/2+70,380);c.lineTo(W/2-70,380);c.closePath();c.fill();c.beginPath();c.moveTo(W/2+70,330);c.lineTo(W/2+130,280);c.stroke();c.beginPath();c.arc(W/2,250,22,PI,0);c.stroke()}
  else{c.beginPath();c.ellipse(W/2,335,90,55,0,0,7);c.fill();c.beginPath();c.moveTo(W/2+80,320);c.lineTo(W/2+140,280);c.stroke();c.beginPath();c.arc(W/2-95,335,28,PI*.5,PI*1.5,false);c.stroke();c.fillRect(W/2-20,268,40,18)}
  c.font='700 24px '+FONT_T;wrap(c,line,W-60).forEach((l,i)=>c.fillText(l,30,440+i*30))})}
function basti(scene,ctx){const {S,LMP,addPlane}=ctx;const NEON=LMP;const path='#d8c7a5';
  for(const x of[-80,-64,-50])blk(S,x-1.1,x+1.1,0,.05,19,90,path,false);for(const z of[37,55,73])blk(S,-96,-49,0,.05,z-1.1,z+1.1,path,false);blk(S,-96,-6,0,.05,19.2,21.2,path,false);
  for(const x of[-80,-64,-50])G.noGrass.push([x-1.3,x+1.3,19,90]);for(const z of[37,55,73])G.noGrass.push([-96,-49,z-1.3,z+1.3]);G.noGrass.push([-96,-6,19,21.4]);
  const K=partyTex('KETTLE','We whistle when we boil.','#ff6a3d','#141414','kettle'),T=partyTex('TEAPOT','Short and stout. Mostly stout.','#2ab3a6','#ffffff','teapot');
  const post=(x,z,ry,t)=>{const c=Math.cos(ry),sn=Math.sin(ry);blk(S,x-.07-sn*.12,x+.07-sn*.12,0,3,z-.07-c*.12,z+.07-c*.12,'#3a2a1a',true);addPlane(scene,1.4,1.82,t,[x,2,z],ry,()=>G.say(t===K?'Kettle party':'Teapot party',t===K?'"Every pothole becomes a swimming pool!" Details after the election.':'"Two chais for the price of one!" Terms and conditions apply. Many.'),{reach:5})};
  [[-6.2,30,PI/2],[6.2,38,-PI/2],[-6.2,46,PI/2],[6.2,54,-PI/2],[-6.2,72,PI/2],[6.2,80,-PI/2],[-48.6,30,PI/2],[-48.6,48,PI/2],[-48.6,66,PI/2]].forEach(([x,z,ry],i)=>post(x,z,ry,i%2?T:K));
  const BC=['#ff6a3d','#ffffff','#2ab3a6'];for(const z of[36,50,64,86])stringLights(NEON,[-6,5.6,z],[6,5.6,z],14,.7,BC);for(const z of[37,55,73])for(let x=-94;x<-52;x+=14)stringLights(NEON,[x,4.4,z-1.6],[x+12,4.4,z-1.6],16,.6,BC);
  const v=prop(S,-2.4,0,58,0);v.box(0,1.15,0,2,1.5,4.6,'#f4efe6');v.box(0,1.25,1.8,1.9,1.2,1,'#26323d');v.box(0,.55,0,2.04,.25,4.62,'#ff6a3d');for(const zz of[1.5,-1.5])for(const s2 of[-1,1])v.wheel(s2*.95,.38,zz,.38,.26);
  v.box(0,2,0,.2,.5,.2,'#555');for(const s2 of[-1,1])v.cone(s2*.4,2.3,-.2+s2*.1,.35,.7,'#c9ccd1',10,0);v.box(0,1.3,-2.31,1.6,.6,.02,'#2ab3a6');col(-3.45,-1.35,0,2.6,55.6,60.4);
  G.triggers.push({x:-.6,z:58,r:1.8,label:'Listen to the loudspeaker',act:()=>G.say('Loudspeaker van','"Attention! Attention! Free chai at the rally. Chai is not a promise. The rally is a promise. Mostly."')})}

/* ---------- Barfii Town: snowman, frozen pond, ice gola, barfi sweets ---------- */
function barfii(scene,ctx){const {S,LMP,addPlane}=ctx;
  // snowman
  const sm=(r,y)=>{const g=new THREE.SphereGeometry(r,14,10);g.translate(-76.5,y,9.4);S.add(g,'#f7fafc')};sm(.85,.8);sm(.62,2);sm(.42,2.95);
  const nose=new THREE.ConeGeometry(.08,.45,8);nose.rotateX(PI/2);nose.translate(-76.5,2.95,9.95);S.add(nose,'#ff8a3d');for(const s2 of[-.15,.15])bx(S,-76.5+s2,3.05,9.78,.07,.07,.04,'#141414');for(const y of[1.8,2.1,2.4])bx(S,-76.5,y,10.02,.08,.08,.04,'#141414');
  cyl(S,-76.5,3.35,9.4,.48,.48,.06,'#141414',14);cyl(S,-76.5,3.62,9.4,.3,.3,.5,'#141414',14);bx(S,-76.5,2.55,9.4,.95,.14,.95,'#e53935');bx(S,-76.1,2.3,9.9,.22,.5,.1,'#e53935');
  for(const s2 of[-1,1])bx(S,-76.5+s2*.85,2.2,9.4,.9,.06,.06,'#5a3f2a',0,0,s2*.5);col(-77.3,-75.7,0,3.4,8.6,10.2);
  G.triggers.push({x:-76.5,z:11.2,r:1.6,label:'Say hi to the snowman',act:()=>{G.host.egg('ow_snowman','You said hi to the snowman. He said nothing. Classic.');G.say('Snowman','…')}});
  // frozen pond
  const ice=new THREE.Mesh(new THREE.CircleGeometry(6,40),new THREE.MeshLambertMaterial({color:'#cfe9f6',emissive:'#203040'}));ice.rotation.x=-PI/2;ice.position.set(-88,.05,17);ice.receiveShadow=true;scene.add(ice);
  for(let a=0;a<PI*2;a+=.35){const g=new THREE.SphereGeometry(.7+((a*10)%3)*.15,8,6,0,PI*2,0,PI/2);g.scale(1,.5,1);g.translate(-88+Math.cos(a)*6.4,0,17+Math.sin(a)*6.4);S.add(g,'#f3f7fa')}
  for(const [x,z,r] of[[-90,15,.9],[-86,19,1.2]]){const g=new THREE.RingGeometry(r,r+.05,24);g.rotateX(-PI/2);g.translate(x,.06,z);S.add(g,'#ffffff')}
  G.triggers.push({x:-88,z:12.2,r:1.8,label:'Slide on the ice',act:()=>{G.player.emote='dance';G.player.emoteT=2.6;G.host.toast('WHEEE','You slid across the frozen pond. Mostly upright.')}});
  // ice gola cart
  const c=prop(S,-62,0,-7.2,0);c.box(0,.85,0,2.2,.9,1,'#3d7be8');c.wheel(-.8,.32,.55,.32,.12);c.wheel(.8,.32,.55,.32,.12);c.box(0,1.35,0,2.2,.08,1,'#f4efe6');c.box(-.55,1.65,0,.7,.5,.6,'#e8f4fb');
  ['#e53935','#ffcc3a','#5cc46b','#8e24aa','#ff8a3d'].forEach((k,i)=>c.cyl(.25+i*.2,1.6,.2,.07,.07,.42,k,8));c.box(0,2.7,0,2.6,.08,1.5,'#ff6a3d');for(const s2 of[-1,1])c.box(s2*1.1,2,-.55,.06,1.4,.06,'#555');col(-63.1,-60.9,0,1.8,-7.7,-6.7);
  addPlane(scene,2.2,.45,signTex('BARF KA GOLA · ₹20','#ff6a3d','#ffffff',512,104),[-62,2.25,-6.66],0,null);
  G.triggers.push({x:-62,z:-5.6,r:1.5,label:'Get a barf ka gola',act:()=>{G.host.toast('BARF KA GOLA','Crushed ice, kala khatta syrup, brain freeze included.');G.player.emote='sip';G.player.emoteT=2.6}});
  // barfi sweets stall
  const b=prop(S,-48,0,-7.4,0);b.box(0,.55,0,3.2,1.1,1.1,'#f4efe6');b.box(0,1.12,0,3.3,.06,1.2,'#c9a227');b.box(0,1.45,.1,3,.6,.9,'#e8f4fb');for(let i=0;i<4;i++)for(let j=0;j<3;j++)b.box(-1.1+i*.72,1.2,-.25+j*.25,.6,.06,.2,i%2?'#e8e2d6':'#d9d4c4');
  b.box(0,3,0,3.6,.12,1.8,'#8e24aa');for(const s2 of[-1,1])b.box(s2*1.6,2.1,-.7,.07,1.8,.07,'#555');col(-49.6,-46.4,0,1.8,-8,-6.8);
  addPlane(scene,3.2,.5,signTex('BARFII SWEETS · KAJU BARFI','#8e24aa','#ffcc3a',768,120),[-48,2.55,-6.84],0,null);
  G.triggers.push({x:-48,z:-5.7,r:1.6,label:'Buy kaju barfi',act:()=>G.host.toast('KAJU BARFI','Silver leaf, cashew, gone in one bite. ₹40.')});
  G.blocked.push([-95,-80,9,25],[-78,-75,8,11]);
  G.extraNPCs.push({name:'Pahadi Didi',look:{shirt:'#8e24aa',pants:'#5a3f2a',hair:'long',hat:'#e53935',face:'smile',long:true},x:-48,z:-8.5,yaw:0,lines:['Kaju barfi, fresh today. Silver leaf on top, love underneath.','Barfii Town gets its name from the snow. Or the barfi. Depends who you ask.','Ice gola in this weather? Only tourists. And Sonu.'],barks:['Barfi lo!','Fresh barfi!']},
    {name:'Snowball Sonu',look:{shirt:'#3d7be8',pants:'#2b2b2b',hair:'cap',hat:'#e53935',face:'grin'},x:-40,z:6,kind:'wander',path:[[-36,6],[-70,6],[-70,-5.6],[-36,-5.6]],speed:3.2,lines:['Snowball fight? I have 40 ready. You have zero.','I built the snowman. He doesn\'t talk. Very mysterious.','Bean on the ice! I saw it. Didn\'t take it. I\'m honest.'],barks:['Incoming!','Snowball!']},
    {name:'Yeti Uncle',look:{shirt:'#f3f3f3',pants:'#d9d4c4',hair:'grey',mustache:true,face:'calm',coat:'#e8e2d6'},x:-83,z:12.8,yaw:.4,lines:['I\'m not a yeti. I just haven\'t shaved since November.','The pond freezes every year. The bean on it? New this year.','Sit by the bonfire. No notifications up here.'],barks:['Brrr.','Chai?']})}

/* =================== Vashupur (from Vashu's map) =================== */
function vashupurStreets(scene,ctx){const {S,LMP,TD,W}=ctx;const R0=TD.round,cx=R0.x,cz=R0.z;const hw=(TD.road?TD.road.w:8)/2,sw=TD.road?TD.road.side:2;
  const ring=new THREE.RingGeometry(R0.r0,R0.r1,56);ring.rotateX(-PI/2);ring.translate(cx,.04,cz);S.add(ring,'#545861');
  for(let a=0;a<PI*2;a+=PI/14){const r=(R0.r0+R0.r1)/2;bx(S,cx+Math.cos(a)*r,.046,cz+Math.sin(a)*r,.18,.01,1.1,'#f4efe6',-a)}
  cyl(S,cx,.15,cz,R0.r0,R0.r0,.3,'#cfc7b6',48);cyl(S,cx,.31,cz,R0.r0-.45,R0.r0-.45,.04,'#5f9a43',48);col(cx-R0.r0*.7,cx+R0.r0*.7,0,.3,cz-R0.r0*.7,cz+R0.r0*.7);
  const so=R0.r1+(TD.road?TD.road.side:2),gap=Math.asin((hw+.1)/((R0.r1+so)/2));for(let k=0;k<4;k++){const g=new THREE.RingGeometry(R0.r1,so,14,1,k*PI/2+gap,PI/2-2*gap);g.rotateX(-PI/2);g.translate(cx,.07,cz);S.add(g,'#cfc7b6')}
  const zebra=(x,z,alongX)=>{for(let u=-hw+.7;u<=hw-.69;u+=.9){if(alongX)bx(S,x+u,.05,z,.48,.012,sw,'#ffffff');else bx(S,x,.05,z+u,sw,.012,.48,'#ffffff')}};
  const zo=hw+sw/2,zr=R0.r1+sw/2+.2;G.zebras=[];const Z=(x,z,a)=>{zebra(x,z,a);G.zebras.push({x,z,alongX:a,hw,sw})};
  Z(0,-zo,true);Z(0,zo,true);Z(-zo,0,false);Z(zo,0,false);
  Z(cx,cz-zr,true);Z(cx,cz+zr,true);Z(cx-zr,cz,false);Z(cx+zr,cz,false);
  // signal chowk: four signal poles that cycle
  W.signals=[];const sig=(x,z,face,axis)=>{const p=prop(S,x,0,z,face);p.box(0,1.5,0,.16,3,.16,'#2c2f36');p.box(0,3.6,0,.5,1.4,.34,'#1d1d1d');p.box(0,3.6,-.2,.56,1.5,.04,'#2c2f36');
    const s=Math.sin(face),c=Math.cos(face);const mk=(y,col)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.28,.28,.05),new THREE.MeshBasicMaterial({color:col}));m.position.set(x+.19*s,y,z+.19*c);m.rotation.y=face;scene.add(m);return m};
    W.signals.push({axis,r:mk(4.02,'#3a0d0d'),a:mk(3.6,'#3a2a05'),g:mk(3.18,'#0b3a1a')});col(x-.14,x+.14,0,4.3,z-.14,z+.14)};
  const sq=hw+sw/2;sig(-sq,-sq,PI,'ns');sig(sq,sq,0,'ns');sig(sq,-sq,PI/2,'ew');sig(-sq,sq,-PI/2,'ew');
  // shared walls between Outpulse Labs, TOKI and The Boring Wear (the white lines on the map)
  blk(S,109.6,110.2,0,2.2,10.6,109,'#e6dfd0');blk(S,109.5,110.3,2.2,2.36,10.6,109,'#c9bfae',false);
  blk(S,110.2,172,0,2.2,59.3,59.9,'#e6dfd0');blk(S,110.2,172,2.2,2.36,59.2,60,'#c9bfae',false);
  G.blocked.push([-27,27,92,147]);G.noGrass.push([-25,25,94.5,144.5],[-69.5,-36.5,40.2,73.2],[-61,-45,93,98])}

function outpulseLabs(scene,ctx){const {S,WIN,LMP,addPlane}=ctx;const x0=30,x1=86,z0=26,z1=94,H=16.2,cz=60;
  blk(S,x0,x1,0,H,z0,z1,'#f2f4f7');
  for(const [x,z] of[[x0,z0],[x0,z1],[x1,z0],[x1,z1]]){cyl(S,x,(H+1)/2,z,2.2,2.2,H+1,'#ffffff',20);for(let y=1.4;y<H;y+=3.8)cyl(LMP,x,y,z,2.24,2.24,.12,'#3bd1ff',20);col(x-2.2,x+2.2,0,H+1,z-2.2,z+2.2)}
  for(const side of['w','n','s']){const F=fac({x0,x1,z0,z1},side);const L=side==='w'?[z0+3,z1-3]:[x0+3,x1-3];const mid=(L[0]+L[1])/2,len=L[1]-L[0];
    for(const y of[2.2,6,9.8,13.6]){if(side==='w'&&y===2.2){F.box(WIN,(L[0]+cz-3.6)/2,y,.03,cz-3.6-L[0],2.2,.1,'#ffffff');F.box(WIN,(cz+3.6+L[1])/2,y,.03,L[1]-cz-3.6,2.2,.1,'#ffffff')}else F.box(WIN,mid,y,.03,len,2.2,.1,'#ffffff');
      F.box(LMP,mid,y+1.25,.08,len,.08,.08,'#3bd1ff');F.box(S,mid,y-1.25,.12,len,.2,.32,'#dfe3e8');for(let u=L[0]+2.4;u<L[1];u+=2.4)if(!(side==='w'&&y===2.2&&Math.abs(u-cz)<3.8))F.box(S,u,y,.1,.14,2.2,.18,'#cfd6de')}}
  blk(S,x0,x1,H,H+.7,z0,z0+.3,'#ffffff',false);blk(S,x0,x1,H,H+.7,z1-.3,z1,'#ffffff',false);blk(S,x0,x0+.3,H,H+.7,z0,z1,'#ffffff',false);blk(S,x1-.3,x1,H,H+.7,z0,z1,'#ffffff',false);
  bx(S,58,H+.8,40,4,1.6,3,'#9aa3ad');bx(S,58,H+.8,80,4,1.6,3,'#9aa3ad');for(let i=0;i<10;i++)bx(S,40+i*3,H+.35,70,2.2,.5,2.2,'#4fae55');
  const F=fac({x0,x1,z0,z1},'w');F.box(WIN,cz,1.75,.04,6.6,3.5,.1,'#ffffff');for(const u of[cz-3.3,cz-1.1,cz+1.1,cz+3.3])F.box(S,u,1.75,.1,.14,3.5,.16,'#1d2733');F.box(S,cz,3.55,.1,7,.14,.16,'#1d2733');
  blk(S,x0-5.6,x0,3.95,4.25,cz-5,cz+5,'#ffffff',false);bx(LMP,x0-5.55,3.92,cz,.08,.06,10,'#3bd1ff');for(const s2 of[-1,1]){cyl(S,x0-5,1.98,cz+s2*4.5,.16,.16,3.96,'#cfd6de',10);col(x0-5.2,x0-4.8,0,3.96,cz+s2*4.5-.2,cz+s2*4.5+.2)}
  blk(S,x0-6.2,x0,0,.1,cz-5.6,cz+5.6,'#e6e9ee',false);
  addPlane(scene,24,3.5,signTex('OUTPULSE LABS','#141414','#3bd1ff',1024,150),[x0-.13,H-2.1,cz],-PI/2,null);
  addPlane(scene,5.6,.75,signTex('OUTPULSE LABS','#ffffff','#141414',768,103),[x0-5.68,4.62,cz],-PI/2,null);
  addPlane(scene,30,4.5,signTex('WE BUILD IDENTITY','#ff6a3d','#141414',1024,154),[(x0+x1)/2,H-2.8,z0-.13],PI,null);
  for(const z of[cz-9,cz+9,cz-22,cz+22]){blk(S,x0-4.4,x0-1.6,0,.7,z-1.4,z+1.4,'#ffffff');bx(S,x0-3,1.05,z,2.4,.6,2.4,'#4fae55',.4);bx(S,x0-3,1.55,z,1.5,.5,1.5,'#5cbf5f',.9)}
  for(const z of[cz-14,cz+14]){blk(S,x0-3.5,x0-1.3,0,.5,z-.35,z+.35,'#c9ccd1');G.seats.push({x:x0-2.4,z,y:.52,yaw:-PI/2,label:'Sit outside Outpulse Labs'})}
  G.triggers.push({x:x0-1.6,z:cz,r:2.4,label:'Enter Outpulse Labs',act:()=>G.enter('labs')});
  G.buildings.push({name:'Outpulse Labs',short:'Outpulse Labs',x0,x1,z0,z1,col:'#f2f4f7',door:{x:x0-3,z:cz},room:'labs'});
  G.blocked.push([10.6,110,10.6,109]);G.noGrass.push([x0-6.4,x0,cz-5.8,cz+5.8]);
  return{x:x0-2.2,z:cz,fx:-1,fz:0}}

function boringWear(scene,ctx){const {S,WIN,addPlane}=ctx;const x0=122,x1=158,z0=76,z1=98,H=8,cx=140;
  blk(S,x0,x1,0,H,z0,z1,'#ecebe8');blk(S,x0-.2,x1+.2,H-.6,H,z0-.2,z1+.2,'#141414',false);
  const F=fac({x0,x1,z0,z1},'s');
  F.box(WIN,cx-6.2,2.2,.04,8,3.4,.1,'#ffffff');F.box(WIN,cx+6.2,2.2,.04,8,3.4,.1,'#ffffff');F.box(S,cx,1.6,.06,2.2,3.2,.12,'#141414');
  for(const u of[cx-10.3,cx-2.1,cx+2.1,cx+10.3])F.box(S,u,2.2,.1,.18,3.6,.2,'#141414');F.box(S,cx,4.05,.1,20.8,.2,.2,'#141414');F.box(S,cx,.3,.1,20.8,.6,.24,'#2b2b2b');
  blk(S,x0+1.6,x1-1.6,4.3,4.45,z1,z1+1.7,'#141414',false);
  addPlane(scene,12,1.3,signTex('THE BORING WEAR','#141414','#f4f4f2',1024,111),[cx,5.6,z1+.13],0,null);
  const C=['#141414','#f4f4f2','#9a9a96','#d8c8a8','#1f2a44'];for(const s2 of[-1,1]){F.box(S,cx+s2*6.2,3.45,.42,6.6,.05,.05,'#888');C.forEach((c,i)=>{const u=cx+s2*6.2-2.6+i*1.3;F.box(S,u,2.55,.45,.9,1.1,.07,c);F.box(S,u,3.02,.45,1.25,.26,.07,c)})}
  blk(S,x0,x1,0,.1,z1,108.6,'#e6e3dc',false);for(const u of[x0+1.2,x1-1.2])pot(S,u,z1+1.4,'#141414','#4f8f3a',.8);
  G.triggers.push({x:cx,z:z1+1.6,r:2,label:'Enter The Boring Wear',act:()=>G.enter('boring')});
  G.buildings.push({name:'The Boring Wear',short:'The Boring Wear',x0,x1,z0,z1,col:'#ecebe8',door:{x:cx,z:z1+2},room:'boring'});
  G.blocked.push([110,172,59.6,109]);G.noGrass.push([x0,x1,z1,109]);
  return{x:cx,z:z1+2.2,fx:0,fz:1}}

/* =================== Outpulse Residential Towers (Vashupur, NW block) =================== */
const K=1.89;export const RES={ang:.567,L:33*K,W:20*K,r:6*K,A:[-76.6*K,-33.3*K],B:[-25.7*K,-33.9*K],floors:13,gH:4.5,fH:3.2};
function rrect(cx,cz,L,Wd,ang,r,seg=6){const pts=[],hl=L/2-r,hw=Wd/2-r;for(const [ux,uz,a0] of[[hw,hl,0],[-hw,hl,PI/2],[-hw,-hl,PI],[hw,-hl,1.5*PI]])for(let i=0;i<=seg;i++){const a=a0+i/seg*PI/2;pts.push([ux+Math.cos(a)*r,uz+Math.sin(a)*r])}
  const c=Math.cos(ang),s=Math.sin(ang);return pts.map(([u,v])=>[cx+u*c+v*s,cz-u*s+v*c])}
function boxPts(x0,x1,z0,z1,r){const p=[];const C=[[x1-r,z1-r,0],[x0+r,z1-r,PI/2],[x0+r,z0+r,PI],[x1-r,z0+r,1.5*PI]];for(const [cx,cz,a0] of C)for(let i=0;i<=5;i++){const a=a0+i/5*PI/2;p.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r])}return p}
const shp=pts=>new THREE.Shape(pts.map(([x,z])=>new THREE.Vector2(x,-z)));
function flatShape(B,pts,y,col){const g=new THREE.ShapeGeometry(shp(pts));g.rotateX(-PI/2);g.translate(0,y,0);B.add(g,col)}
function extShape(B,pts,y,h,col){const g=new THREE.ExtrudeGeometry(shp(pts),{depth:h,bevelEnabled:false,curveSegments:1});g.rotateX(-PI/2);g.translate(0,y,0);B.add(g,col)}
const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,zi]=P[i],[xj,zj]=P[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))c=!c}return c};
function residences(scene,ctx){const {S,WIN,LMP,addPlane,W}=ctx;const {ang,L,W:Wd,r}=RES;const c=Math.cos(ang),s=Math.sin(ang);const d=[s,c],n=[c,-s];const R=rng(77);const outs={};
  const X0=-183.4,X1=-10.5,Z0=-108.7,Z1=-10.5;
  blk(S,X0,X1,0,.02,Z0,Z1,'#2f3238',false);G.noGrass.push([X0,X1,Z0,Z1]);
  G.mapPolys=G.mapPolys||[];G.grassPolys=G.grassPolys||[];G.mapPolys.push({pts:[[X0,Z0],[X1,Z0],[X1,Z1],[X0,Z1]],col:'#2f3238'});
  const gardens=[rrect(-96*K,-58*K,24*K,16*K,ang,7*K),rrect(-96*K,-12*K,40*K,28*K,ang,10*K),boxPts(-66*K,-53*K,-16*K,-5,5.5*K),boxPts(-35*K,-5,-10.4*K,-5,3.5*K),rrect(-50.5*K,-31.7*K,44*K,12*K,ang,6*K),rrect(-42*K,-60*K,18*K,14*K,ang,7*K),rrect(-7*K,-50*K,44*K,20*K,ang,10*K)];
  for(const g of gardens){flatShape(S,g,.03,'#5f9a43');G.grassPolys.push(g);G.mapPolys.push({pts:g,col:'#79c267'})}
  // garden trees and benches
  const tree=(x,z,k)=>{cyl(S,x,1.2*k,z,.14*k,.22*k,2.4*k,'#5b4330',7);for(let i=0;i<4;i++){const g=new THREE.IcosahedronGeometry((.9+R()*.6)*k,1);g.translate(x+(R()-.5)*1.4*k,(2.6+R()*1.2)*k,z+(R()-.5)*1.4*k);S.add(g,['#3d6b2c','#4a7a33','#557f38'][i%3])}col(x-.2,x+.2,0,2.4*k,z-.2,z+.2)};
  gardens.forEach((g,gi)=>{let k=0;for(let t=0;t<60&&k<(gi===4?12:6);t++){const x=X0+R()*(X1-X0),z=Z0+R()*(Z1-Z0);if(inPoly(x,z,g)&&x>X0+1.5&&x<X1-1.5&&z>Z0+1.5&&z<Z1-1.5){let ok=true;for(const g2 of gardens)if(g2!==g&&inPoly(x,z,g2))ok=false;if(ok){tree(x,z,1+R()*.3);k++}}}});
  for(const t of[-28,-10,10,28]){const x=-50.5*K+d[0]*t,z=-31.7*K+d[1]*t;bx(S,x+n[0]*7,.45,z+n[1]*7,.6,.12,2.2,'#8a5a3b',ang);G.seats.push({x:x+n[0]*6.8,z:z+n[1]*6.8,y:.5,yaw:ang-PI/2,label:'Sit in the garden'})}
  // the two towers
  for(const T of['A','B']){const [cx,cz]=RES[T];const P=rrect(cx,cz,L,Wd,ang,r),Pin=rrect(cx,cz,L-.6,Wd-.6,ang,r-.3),Pout=rrect(cx,cz,L+.5,Wd+.5,ang,r+.25);const H=RES.gH+RES.floors*RES.fH;
    extShape(S,Pout,0,.25,'#d9d4c7');extShape(WIN,Pin,.25,RES.gH-.25,'#ffffff');extShape(S,Pout,RES.gH-.4,.5,'#efe9df');
    for(let f=1;f<=RES.floors;f++){const y=RES.gH+(f-1)*RES.fH;extShape(WIN,Pin,y+.1,RES.fH-.6,'#ffffff');extShape(S,P,y+RES.fH-.5,.5,f%4===0?'#e2dccf':'#f2ede3');
      for(const side of[-1,1]){const bxp=cx+n[0]*side*(Wd/2+.7),bzp=cz+n[1]*side*(Wd/2+.7);bx(S,bxp,y+.12,bzp,1.4,.24,14,'#e6e1d6',ang);bx(S,cx+n[0]*side*(Wd/2+1.38),y+.7,cz+n[1]*side*(Wd/2+1.38),.08,1,14,'#9aa3ad',ang)}}
    // pilasters around the shaft
    for(let i=0;i<P.length;i+=3){const [x,z]=P[i];bx(S,x,H/2,z,.5,H,.5,'#e9e3d6',ang)}
    extShape(S,Pout,H,.35,'#cfc8b8');extShape(S,P,H+.35,1.2,'#3b3f46');
    bx(S,cx,H+2.4,cz,5,2.4,7,'#9aa3ad',ang);cyl(S,cx-d[0]*8,H+2.2,cz-d[1]*8,1.8,1.8,2.2,'#c9ccd1',16);
    bx(LMP,cx+d[0]*(L/2-1),H+1.2,cz+d[1]*(L/2-1),.25,.25,.25,'#ff2d2d');
    const sp=[cx-n[0]*(Wd/2+.2),cz-n[1]*(Wd/2+.2)];addPlane(scene,12,12,tex(256,256,(x2,W_,H_)=>{x2.fillStyle='#ff6a3d';x2.fillRect(0,0,W_,H_);x2.fillStyle='#ffffff';x2.font='400 200px '+FONT_D;x2.textAlign='center';x2.fillText(T,W_/2,212)}),[sp[0],H-4,sp[1]],Math.atan2(-n[0],-n[1]),null);
    const sp2=[cx+n[0]*(Wd/2+.2),cz+n[1]*(Wd/2+.2)];addPlane(scene,12,12,tex(256,256,(x2,W_,H_)=>{x2.fillStyle='#ff6a3d';x2.fillRect(0,0,W_,H_);x2.fillStyle='#ffffff';x2.font='400 200px '+FONT_D;x2.textAlign='center';x2.fillText(T,W_/2,212)}),[sp2[0],H-4,sp2[1]],Math.atan2(n[0],n[1]),null);
    // entrance at the south cap
    const ex=cx+d[0]*(L/2),ez=cz+d[1]*(L/2);bx(S,ex+d[0]*2,4,ez+d[1]*2,8,.3,5,'#ffffff',ang);for(const sd of[-1,1])cyl(S,ex+d[0]*4+n[0]*sd*3.6,2,ez+d[1]*4+n[1]*sd*3.6,.14,.14,4,'#cfd6de',8);
    bx(S,ex+d[0]*.1,1.6,ez+d[1]*.1,3.2,3.2,.2,'#1d2733',ang);bx(WIN,ex+d[0]*.22,1.6,ez+d[1]*.22,2.8,2.9,.05,'#ffffff',ang);
    addPlane(scene,6,.75,signTex('OUTPULSE RESIDENCES · TOWER '+T,'#141414','#ffffff',1024,128),[ex+d[0]*4.52,4.55,ez+d[1]*4.52],Math.atan2(d[0],d[1]),null);
    for(let t=-(L/2-Wd/2);t<=(L/2-Wd/2)+.01;t+=4){const x=cx+d[0]*t,z=cz+d[1]*t;col(x-15,x+15,0,H+1.5,z-15,z+15)}
    const tx=ex+d[0]*2.2,tz=ez+d[1]*2.2;G.triggers.push({x:tx,z:tz,r:2.4,label:'Enter Tower '+T,act:()=>{G.res={tower:T,floor:0};G.enter('res'+T)}});
    G.buildings.push({name:'Outpulse Residences · Tower '+T,short:'Tower '+T,x0:cx-15,x1:cx+15,z0:cz-15,z1:cz+15,col:'#c9ccd1',door:{x:tx+d[0],z:tz+d[1]},room:'res'+T,poly:true});
    G.mapPolys.push({pts:P,col:'#c9ccd1'});
    outs['res'+T]={x:ex+d[0]*2.8,z:ez+d[1]*2.8,fx:d[0],fz:d[1]}}
  // compound wall with entry and exit gates on the main road
  const wc='#e6dfd0',cap='#c9bfae';const wallX=(a,b,z)=>{blk(S,a,b,0,2,z-.25,z+.25,wc);blk(S,a,b,2,2.15,z-.35,z+.35,cap,false)};const wallZ=(a,b,x)=>{blk(S,x-.25,x+.25,0,2,a,b,wc);blk(S,x-.35,x+.35,2,2.15,a,b,cap,false)};
  wallX(X0,-153.1,Z1);wallX(-128.5,-94.5,Z1);wallX(-70,X1,Z1);wallX(X0,X1,Z0);wallZ(Z0,Z1,X1);wallZ(Z0,Z1,X0);
  addPlane(scene,24,1.6,signTex('OUTPULSE RESIDENTIAL TOWERS','#141414','#ff6a3d',1024,68),[-111.5,1.15,Z1+.27],0,null);
  W.booms=[];const gate=(a,b,label,guard,lines)=>{const mid=(a+b)/2;for(const x of[a,b]){blk(S,x-.45,x+.45,0,4.8,Z1-.45,Z1+.45,'#d9d4c7');bx(LMP,x,4.95,Z1,.5,.25,.5,'#ffffff')}
    blk(S,a,b,4.8,5.5,Z1-.3,Z1+.3,'#141414',false);addPlane(scene,(b-a)-1.2,.6,signTex(label,'#141414','#ffcc3a',768,90),[mid,5.15,Z1+.32],0,null);
    const bo=new THREE.Group();const bb=new Batch();for(let k=0;k<12;k++)bx(bb,1+k*1.8,0,0,1.8,.16,.16,k%2?'#ffffff':'#e53935');bo.add(bb.mesh(CHM));bo.position.set(a+1.4,1.05,Z1+1.4);scene.add(bo);bx(S,a+1.4,.55,Z1+1.4,.5,1.1,.5,'#ffcc3a');W.booms.push({g:bo,x:mid,z:Z1,open:0,w:(b-a)/2});
    const bk=prop(S,b-2.2,0,Z1-2.6);bk.box(0,1.3,0,2.2,2.6,2.2,'#f4f1ea');bk.box(0,2.7,0,2.6,.2,2.6,'#1d3f8f');bk.box(0,1.6,1.11,1.6,.9,.04,'#9cc6dd');col(b-3.3,b-1.1,0,2.6,Z1-3.7,Z1-1.5);
    G.noLamp.push([a-1.5,b+1.5,Z1-1.5,Z1+4]);G.extraNPCs.push({name:guard,look:{shirt:'#3a4a6b',pants:'#2b2b2b',hair:'short',hat:'#1d3f8f',mustache:true,face:'flat'},x:b-2.2,z:Z1-.9,yaw:0,lines,barks:['Name? Flat number?','Visitor pass, please.']})};
  gate(-153.1,-128.5,'ENTRY','Guard Bahadur (entry gate)',['Welcome to Outpulse Residential Towers. Entry is this gate, exit is the other one. Rules.','Tower A on the left, Tower B on the right. Lifts work. Every floor. I checked.','No, I can\'t tell you who lives on 13. Okay fine, it\'s a gym bro.']);
  gate(-94.5,-70,'EXIT','Guard Shinde (exit gate)',['This is the exit. Entry is the other gate. Please don\'t make me explain twice.','Twenty-six floors, fifty-two flats, one very tired guard.','Drive slow. Kids, dogs and aunties on the driveway.']);
  G.blocked.push([X0-1,X1+1,Z0-1,Z1+1]);
  return outs}

/* ---------- a bus (shared by stops and the bus stand) ---------- */
function busModel(scene,S,x,z,ry,bc){const v=prop(S,x,0,z,ry);v.box(0,1.6,0,2.5,2.5,10,bc);v.box(0,2.92,0,2.52,.18,10,'#e94b3c');v.box(0,.62,0,2.54,.34,10.02,'#e94b3c');
  v.box(0,2.05,-.4,2.56,.95,8,'#26323d');v.box(0,1.95,5.01,2.2,1.3,.04,'#26323d');v.box(0,1.95,-5.01,2.2,1,.04,'#26323d');v.box(1.27,1.3,3.7,.05,1.9,1.1,'#141414');
  for(const zz of[3.4,-3.4])for(const s of[-1,1])v.wheel(s*1.15,.5,zz,.5,.36);for(const s of[-1,1])v.box(s*.85,.9,5.04,.35,.2,.04,'#fff6c8');
  const sw=Math.abs(Math.sin(ry))>.5,cs=Math.abs(Math.cos(ry))>.5;const hx=sw?5.1:(cs?1.3:3.8),hz=cs?5.1:(sw?1.3:3.8);col(x-hx,x+hx,0,3,z-hz,z+hz);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2,.42),new THREE.MeshBasicMaterial({map:signTex('ALL 6 TOWNS','#141414','#ffcc3a',512,110)}));m.position.set(x+Math.sin(ry)*5.03,2.75,z+Math.cos(ry)*5.03);m.rotation.y=ry;scene.add(m)}

/* ---------- Vashupur bus stand (about one acre) ---------- */
function busStand(scene,ctx){const {S,WIN,LMP,addPlane,TN}=ctx;const X0=-169.6,X1=-84,Z0=130,Z1=174.4,A='#3a3d44';
  blk(S,X0,X0+7.4,0,.08,127,152,A,false);blk(S,X1-7.8,X1,0,.08,127,152,A,false);blk(S,X0,X1,0,.08,150.5,162,A,false);flatShape(S,boxPts(X0,X1,140,Z1,12),.078,A);
  for(const x of[X0+3.7,X1-3.9])for(let z=128;z<150;z+=4)bx(S,x,.09,z,.16,.01,2,'#ffffff');
  for(let i=0;i<=11;i++){const x=-160.4+i*6.08;bx(S,x,.09,159.5,.16,.01,18,'#ffffff')}for(let i=0;i<11;i++){const x=-160.4+(i+.5)*6.08;addPlane(scene,1.6,1.6,signTex(String(i+1),'#2f5bff','#ffffff',128,128),[x,.1,152],0,null).rotation.set(-PI/2,0,0)}
  // concourse with a long canopy
  blk(S,-162.2,-91.8,0,.25,131,150.5,'#d9d4c7');blk(S,-162.2,-91.8,.25,.3,150.2,150.5,'#ffcc3a',false);
  /* canopy pillars; the front one at the middle is left out so it does not stand in front of the departure board */
  for(let x=-160;x<=-94;x+=11)for(const z of[132.5,149]){if(x===-127&&z===132.5)continue;cyl(S,x,3.75,z,.22,.22,7,'#c9ccd1',10);col(x-.25,x+.25,0,7,z-.25,z+.25)}
  blk(S,-163.5,-90.5,7.2,7.7,130.3,151.2,'#2f5bff',false);blk(S,-163.5,-90.5,7.7,8.4,130.3,130.6,'#ffcc3a',false);blk(S,-163.5,-90.5,7.7,8.4,150.9,151.2,'#ffcc3a',false);
  for(let x=-158;x<=-96;x+=6)bx(LMP,x,7.1,140.7,.8,.08,.8,'#ffffff');
  addPlane(scene,30,1.9,signTex('VASHUPUR BUS STAND','#2f5bff','#ffffff',1024,64),[-127,9.5,130.25],PI,null);
  addPlane(scene,30,1.9,signTex('VASHUPUR BUS STAND','#2f5bff','#ffffff',1024,64),[-127,9.5,151.25],0,null);
  for(const x of[-150,-136,-118,-104])for(const z of[137,144]){blk(S,x-3,x+3,.25,.7,z-.35,z+.35,'#2f5bff');G.seats.push({x,z:z+.05,y:.72,yaw:PI,label:'Wait for the bus'})}
  blk(S,-131,-123,.25,1.4,139.4,141.2,'#141414');bx(WIN,-127,1.6,139.38,6.4,1,.04,'#ffffff');addPlane(scene,6,1.2,signTex('TICKETS · ALL 6 TOWNS','#ffcc3a','#141414',768,154),[-127,2.6,139.34],PI,null);
  const board=addPlane(scene,7,3.5,routeTex(TN),[-127,4.2,132.9],PI,()=>G.bus(),{reach:9});board.material.side=THREE.DoubleSide;blk(S,-130.6,-123.4,2.3,6.1,132.95,133.15,'#141414',false);
  G.triggers.push({x:-127,z:137.5,y:.25,r:3.2,label:'Take the bus',act:()=>G.bus()});
  // buses in bays, one leaving, one on the back curve
  /* three long-distance buses stay parked; the free bays are used by the buses that run in town */
  [[0,'#ffcc3a'],[5,'#ff6a3d'],[9,'#5cc46b']].forEach(([i,c])=>busModel(scene,S,-160.4+(i+.5)*6.08,159,PI,c));
  G.extraNPCs.push({name:'Conductor Raju',look:{shirt:'#c9b48a',pants:'#3a4a6b',hair:'short',hat:'#2f5bff',mustache:true,face:'grin'},x:-122,z:146,yaw:PI,lines:['Vashupur bus stand! Kaapikunj, Memepura, Basti, Barfii, Delulugarh. All buses, all day.','Ticket? Free. The bus is part of the portfolio.','Window seat? Everyone wants window seat.'],barks:['Chalo chalo!','Next bus: now.']});
  /* a busy stand: vendors and people waiting */
  const kettle=hb=>{cyl(hb,0,-.78,.16,.13,.15,.26,'#c9ccd1',10);bx(hb,.12,-.66,.16,.12,.04,.04,'#9a9a9a')},flask=hb=>{cyl(hb,0,-.8,.16,.12,.12,.36,'#c62828',10);cyl(hb,0,-.6,.16,.07,.07,.06,'#141414',8)};
  G.extraNPCs.push({name:'Chaiwala Bablu',look:{shirt:'#f4f1ea',pants:'#5b4636',hair:'short',mustache:true,held:kettle,long:true},x:-141,z:134.6,yaw:PI,lines:['Chai! Garam chai! Ten rupees, and it tastes like a hug.','Bus late? Chai is never late.','Adrak, elaichi, or both? Both. Always both.'],barks:['Chai chai chai!','Garam chai!']},
    {name:'Coffee wala Sunny',look:{shirt:'#c62828',pants:'#26323d',hair:'side',held:flask,hat:'#141414'},x:-111,z:134.6,yaw:PI,lines:['Coffee! Nescoffee! Hot hot!','Filter coffee is upstairs in my heart, but this one sells.','For the road, sir? Take two.'],barks:['Coffee, nescoffee!','Hot coffee!']},
    {name:'Peanut uncle',look:{shirt:'#3e7c59',pants:'#c9b48a',hair:'grey',long:true},x:-152,z:141,yaw:PI*.8,lines:['Moongphali! Hot, salted, in a paper cone.','I have sold peanuts to every bus in this stand.'],barks:['Moongphali!']},
    {name:'Waiting passenger',look:{shirt:'#2b5fa8',pants:'#26323d',hair:'bun',fem:true},x:-133,z:146.5,yaw:PI,lines:['The Kaapikunj bus is always the slowest. Worth it though.'],barks:['Bus kab aayegi?']},
    {name:'Waiting passenger',look:{shirt:'#ffcc3a',pants:'#3a4a6b',hair:'short'},x:-118,z:147,yaw:PI*1.1,lines:['I came for one day. That was three weeks ago.'],barks:['Ugh, late again.']},
    {name:'Student',look:{shirt:'#6a4c93',pants:'#26323d',hair:'curly',glasses:true},x:-146,z:147.4,yaw:PI*.9,lines:['Exam in Memepura. Studied zero. Feeling great.'],barks:['Kitna late hai!']},
    {name:'Aunty with bags',look:{shirt:'#ff5fa2',pants:'#ff5fa2',hair:'bun',long:true,fem:true,skirt:'#ff5fa2'},x:-102,z:146,yaw:PI,lines:['Beta, help me with this bag? Just to the bus. Which bus? Any bus.'],barks:['Arre, bus!']});
  G.buildings.push({name:'Vashupur Bus Stand',short:'Bus stand',x0:X0,x1:X1,z0:Z0,z1:Z1,col:'#a8a8a8',door:{x:-127,z:128.5},room:null});
  G.noGrass.push([X0,X1,Z0-3,Z1+2]);G.blocked.push([X0-3,X1+3,Z0-3,Z1+3]);G.noLamp.push([X0-1.5,X1+1.5,124,153])}

export function buildLandmarks(scene,ctx){const {on}=ctx;const outs={};G.blocked=G.blocked||[];
  if(ctx.TD.busStand)busStand(scene,ctx);else busStop(scene,ctx);
  if(on('kaapikunj')){outs.kunj=kunj(scene,ctx);estate(scene,ctx);welcomeArch(scene,ctx,-18,'WELCOME TO KAAPIKUNJ','KAAPIKUNJ · CUP FIRST','#8b6a4a')}
  if(on('memepura')){memepura(scene,ctx);welcomeArch(scene,ctx,33,'MEMEPURA · VERY ONLINE','WELCOME TO MEMEPURA','#ff3b8d')}
  if(on('basti')){basti(scene,ctx);welcomeArchZ(scene,ctx,32,'WELCOME TO POLITICAL BASTI','POLITICAL BASTI · VOTE WISELY','#8b1e2d')}
  if(on('barfii')){barfii(scene,ctx);welcomeArch(scene,ctx,-44,'WELCOME TO BARFII TOWN','BARFII TOWN · SNOW & SWEETS','#3d6b8f')}
  if(on('vashupur')){Object.assign(outs,residences(scene,ctx));stadium(scene,ctx);parkingLot(scene,ctx);outs.jail=centralJail(scene,ctx);outs.meow=meowClub(scene,ctx);
    /* paved forecourt in front of City Kotwali */
    blk(ctx.S,-44,-12,0,.05,130,141.4,'#d6d2c8',false);G.noGrass.push([-46,-10.5,129.5,141.6]);
    vashupurStreets(scene,ctx);outs.labs=outpulseLabs(scene,ctx);outs.boring=boringWear(scene,ctx);
    /* final map: PM House, Lolu Mall, Choupati, Outpulse Museum */
    pmHouse(scene,ctx);outs.mallG=loluMall(scene,ctx);choupati(scene,ctx);museumGrounds(scene,ctx);
    {const cpM=mark(scene,[ctx.S,ctx.WIN,ctx.LMP]);outs.museum=museum(scene,ctx);move(cpM,[0,-36],[141,152],2,[outs.museum])}}
  return outs}

/* =================== Vashupur map v4: National Stadium, parking, Central Jail, Meow Club =================== */
const TIRANGA=['#ff9933','#f4f1ea','#138808'];
function stadium(scene,ctx){const {S,WIN,LMP,addPlane,W}=ctx;const X0=-180.3,X1=-42.6,Z0=12,Z1=106.6,TR=[-166,-56.4,25.8,95.6],FD=[-159,-63.5,32.9,88.7],cx=-111.25,cz=60.8,CON='#cfcac0',DK='#2b2d31';
  flatShape(S,boxPts(X0,X1,Z0,Z1,10),.03,'#e9e6df');flatShape(S,boxPts(...TR,13),.045,'#e2a72e');flatShape(S,boxPts(...FD,6),.06,'#3c9a38');
  /* mowing stripes */for(let k=1;k<17;k+=2){const w=(FD[1]-FD[0])/17;bx(S,FD[0]+(k+.5)*w,.063,cz,w,.006,FD[3]-FD[2]-.8,'#2f8a2e')}
  for(let k=1;k<6;k++){const o=k*1.18;bx(S,cx,.052,TR[2]+o,82,.01,.07,'#ffffff');bx(S,cx,.052,TR[3]-o,82,.01,.07,'#ffffff');bx(S,TR[0]+o,.052,cz,.07,.01,44,'#ffffff');bx(S,TR[1]-o,.052,cz,.07,.01,44,'#ffffff')}
  /* football pitch */
  const L=(x,z,w,d)=>bx(S,x,.068,z,w,.01,d,'#ffffff');L(cx,FD[2]+.6,FD[1]-FD[0]-1.2,.14);L(cx,FD[3]-.6,FD[1]-FD[0]-1.2,.14);L(FD[0]+.6,cz,.14,FD[3]-FD[2]-1.2);L(FD[1]-.6,cz,.14,FD[3]-FD[2]-1.2);L(cx,cz,.14,FD[3]-FD[2]-1.2);
  {const g=new THREE.RingGeometry(9.05,9.25,48);g.rotateX(-PI/2);g.translate(cx,.068,cz);S.add(g,'#ffffff')}
  for(const s of[-1,1]){const gx=s<0?FD[0]+.6:FD[1]-.6,px=gx-s*16.5;L(px,cz,.14,40.3);L((gx+px)/2,cz-20.15,16.5,.14);L((gx+px)/2,cz+20.15,16.5,.14);
    for(const z of[cz-3.66,cz+3.66]){cyl(S,gx,1.22,z,.07,.07,2.44,'#ffffff',8);col(gx-.1,gx+.1,0,2.44,z-.1,z+.1)}bx(S,gx,2.44,cz,.14,.14,7.46,'#ffffff');
    for(const z of[cz-3.66,cz+3.66])bx(S,gx+s*1.1,1.2,z,2.2,.05,.05,'#d0d0d0');bx(S,gx+s*2.2,1.22,cz,.05,2.44,7.32,'#e9e9e9')}
  /* stands: walkable steps (30 cm each) with a row of seats in the colours of the flag; sit anywhere */
  const RISE=.3,DEP=.85;G.stands=G.stands||[];
  const stand=(along,a0,a1,inner,outer,yaw)=>{const dir=Math.sign(outer-inner),n=Math.floor(Math.abs(outer-inner)/DEP);
    for(let k=0;k<n;k++){const p0=inner+dir*DEP*k,p1=p0+dir*DEP,h=RISE*(k+1),q0=Math.min(p0,p1),q1=Math.max(p0,p1),sc=TIRANGA[k%3],sp=p0+dir*DEP*.72;
      if(along==='x'){blk(S,a0,a1,0,h,q0,q1,CON,false);bx(S,(a0+a1)/2,h+.12,sp,a1-a0-.3,.24,.3,sc);col(a0,a1,0,h,q0,q1,{cam:false})}else{blk(S,q0,q1,0,h,a0,a1,CON,false);bx(S,sp,h+.12,(a0+a1)/2,.3,.24,a1-a0-.3,sc);col(q0,q1,0,h,a0,a1,{cam:false})}}
    const top=RISE*n,e0=inner+dir*DEP*n,e1=e0+dir*.35,lo=Math.min(e0,e1),hi=Math.max(e0,e1);
    if(along==='x'){blk(S,a0,a1,0,top+1.2,lo,hi,'#dcd8d0');col(a0,a1,0,top+1.2,lo,hi)}else{blk(S,lo,hi,0,top+1.2,a0,a1,'#dcd8d0');col(lo,hi,0,top+1.2,a0,a1)}
    G.stands.push({along,a0,a1,inner,dir,n,yaw,DEP,RISE});return top};
  stand('x',-152,-70,24.6,14.6,0);stand('x',-152,-70,96.8,104.4,PI);stand('z',39,82.6,-167.2,-177.8,PI/2);stand('z',39,56.8,-55.2,-45,-PI/2);stand('z',64.8,82.6,-55.2,-45,-PI/2);
  /* the one gate: a tunnel under the east stand, out to the parking */
  blk(S,-55.2,-45,4.8,6.4,56.8,64.8,CON);blk(S,-45.4,-42,0,6.4,55.9,56.8,DK);blk(S,-45.4,-42,0,6.4,64.8,65.7,DK);blk(S,-45.4,-42,5.2,6.4,56.8,64.8,DK);col(-45.4,-42,0,6.4,55.9,56.8);col(-45.4,-42,0,6.4,64.8,65.7);
  addPlane(scene,7.4,1,signTex('ENTRY  ·  EXIT','#ff9933','#141414',512,70),[-41.97,5.8,cz],PI/2,null);
  addPlane(scene,30,2,signTex('NATIONAL STADIUM','#141414','#ff9933',1024,70),[cx,4.6,14.84],PI,null);
  /* boundary wall all the way round, broken only by the gate */
  {const pts=boxPts(X0,X1,Z0,Z1,10),seg=(ax,az,bx_,bz)=>{const dx=bx_-ax,dz=bz-az,len=Math.hypot(dx,dz);if(len<.05)return;bx(S,(ax+bx_)/2,1.6,(az+bz)/2,len+.08,3.2,.6,DK,Math.atan2(-dz,dx));bx(S,(ax+bx_)/2,3.25,(az+bz)/2,len+.08,.1,.7,'#ff9933',Math.atan2(-dz,dx));
      col(Math.min(ax,bx_)-.3,Math.max(ax,bx_)+.3,0,3.2,Math.min(az,bz)-.3,Math.max(az,bz)+.3)};
    for(let i=0;i<pts.length;i++){const [ax,az]=pts[i],[bx_,bz]=pts[(i+1)%pts.length];
      if(Math.abs(ax-X1)<.01&&Math.abs(bx_-X1)<.01&&Math.abs(bz-az)>20){const zl=Math.min(az,bz),zh=Math.max(az,bz);seg(X1,zl,X1,55.9);seg(X1,65.7,X1,zh)}else seg(ax,az,bx_,bz)}}
  /* floodlights and the scoreboard */
  const FL={beams:[],pool:null};
  for(const [x,z] of[[-172.5,19.5],[-50.5,19.5],[-172.5,99.5],[-50.5,99.5]]){cyl(S,x,15,z,.45,.7,30,'#9aa3ad',8);col(x-.7,x+.7,0,30,z-.7,z+.7);const a=Math.atan2(cx-x,cz-z);
    bx(S,x,30.6,z,5.2,3.2,.7,DK,a);bx(LMP,x+Math.sin(a)*.4,30.6,z+Math.cos(a)*.4,4.8,2.8,.1,'#fff6d8',a);
    const L=Math.hypot(cx-x,cz-z,30),beam=new THREE.Mesh(new THREE.ConeGeometry(18,L,20,1,true),new THREE.MeshBasicMaterial({color:'#fff3cf',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
    beam.geometry.translate(0,-L/2,0);beam.position.set(x,30.6,z);beam.lookAt(cx,0,cz);beam.rotateX(-PI/2);beam.renderOrder=3;scene.add(beam);FL.beams.push(beam)}
  {const t=tex(256,256,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,10,w/2,h/2,w*.55);g.addColorStop(0,'rgba(255,248,225,1)');g.addColorStop(.7,'rgba(255,244,214,.85)');g.addColorStop(1,'rgba(255,240,200,0)');c.fillStyle=g;c.fillRect(0,0,w,h)});
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(TR[1]-TR[0]+30,TR[3]-TR[2]+26),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));pool.rotation.x=-PI/2;pool.position.set(cx,.09,cz);pool.renderOrder=2;scene.add(pool);FL.pool=pool;W.flood=FL}
  blk(S,-179.6,-178.4,7,17.2,50.6,71,DK);
  addPlane(scene,19.6,9.6,tex(1024,500,(c,w,h)=>{c.fillStyle='#0d0f12';c.fillRect(0,0,w,h);c.fillStyle='#ff9933';c.font='800 64px '+FONT_D;c.textAlign='center';c.fillText('NATIONAL STADIUM',w/2,92);
    c.fillStyle='#ffffff';c.font='800 120px '+FONT_D;c.fillText('2  –  0',w/2,270);c.font='700 46px '+FONT_T;c.fillText('VASHUPUR XI',w*.25,360);c.fillText('DELULUGARH FC',w*.75,360);c.fillStyle='#c9f26b';c.font='700 40px '+FONT_T;c.fillText("89'  ·  WELCOME, VISITOR",w/2,450)}),[-178.3,12.1,cz],PI/2,null);
  G.noGrass.push([X0,X1,Z0,Z1]);G.blocked.push([X0-2,X1+2,Z0-2,Z1+2]);
  G.mapPolys.push({pts:boxPts(X0,X1,Z0,Z1,10),col:'#ffffff'},{pts:boxPts(...TR,13),col:'#e2a72e'},{pts:boxPts(...FD,6),col:'#3c9a38'});
  G.buildings.push({name:'National Stadium',short:'Stadium',x0:X0,x1:X1,z0:Z0,z1:Z1,col:'#ffffff',door:{x:cx,z:10.6},room:null,poly:true,label:true})}

function parkingLot(scene,ctx){const {S,addPlane}=ctx;const X0=-42.6,X1=-10.5,Z0=10.7,Z1=95.7;const r=rng(311);
  blk(S,X0,X1,0,.055,Z0,Z1,'#4a4c51',false);
  const rows=[[-42.1,-36.6,1],[-29.6,-24.1,-1],[-24.1,-18.6,1]],cols=['#e53935','#f4f4f2','#2b5fa8','#141414','#9aa3ad','#ffcc3a','#3e7c59','#8a5534','#f4f4f2','#c9ccd1'];
  for(const [a,b,dir] of rows){for(let k=0;k<=29;k++)bx(S,(a+b)/2,.062,14+k*2.7,b-a,.01,.1,'#ffffff');
    for(let k=0;k<29;k++){if(r()<.42)continue;const z=15.35+k*2.7,x=(a+b)/2,c=cols[Math.floor(r()*cols.length)];
      bx(S,x,.55,z,4.2,.7,1.75,c);bx(S,x-dir*.25,1.1,z,2.2,.5,1.6,'#26323d');bx(S,x-dir*.25,1.38,z,2.1,.06,1.62,c);for(const ax of[-1.3,1.3])for(const az of[-.8,.8])bx(S,x+ax,.33,z+az,.66,.66,.24,'#1b1b1b');
      bx(S,x+dir*2.1,.62,z,.04,.18,1.3,'#fff6d8');col(x-2.1,x+2.1,0,1.4,z-.9,z+.9)}}
  bx(S,-24.1,.062,53.2,.1,.01,79,'#ffffff');
  const bo=prop(S,-33,0,13.2);bo.box(0,1.2,0,2,2.4,2,'#f4f1ea');bo.box(0,2.5,0,2.4,.2,2.4,'#2f5bff');
  cyl(S,-26.4,1.4,11.6,.08,.08,2.8,'#9aa3ad',8);addPlane(scene,2.6,1,signTex('P  PARKING','#2f5bff','#ffffff',384,148),[-26.4,2.9,11.55],PI,null);
  G.noGrass.push([X0,X1,Z0,Z1]);G.blocked.push([X0,X1,Z0,Z1]);G.mapPolys.push({pts:[[X0,Z0],[X1,Z0],[X1,Z1],[X0,Z1]],col:'#55575c'});
  G.buildings.push({name:'Stadium Parking',short:'Parking',x0:X0,x1:X1,z0:Z0,z1:Z1,col:'#55575c',room:null,poly:true,label:true})}

function centralJail(scene,ctx){const {S,WIN,LMP,addPlane,W}=ctx;const O=[106.3,170.3,-109.4,-12.7],I=[113.3,163,-102.3,-19.6],H=9,WL='#e9e6df',gx=138.2;
  flatShape(S,boxPts(...O,8),.05,'#2f3238');blk(S,gx-3.5,gx+3.5,0,.055,-12.7,-7.4,'#2f3238',false);flatShape(S,boxPts(...I,.5),.06,'#cbc7bf');
  const wall=(x0,x1,z0,z1,h=H)=>{blk(S,x0,x1,0,h,z0,z1,WL);blk(S,x0-.05,x1+.05,h-.4,h,z0-.05,z1+.05,'#9a958b',false);col(x0,x1,0,h,z0,z1)};
  wall(I[0],I[1],I[2],I[2]+.8);wall(I[0],I[0]+.8,I[2],I[3]);wall(I[1]-.8,I[1],I[2],I[3]);wall(I[0],gx-6,I[3]-.8,I[3]);wall(gx+6,I[1],I[3]-.8,I[3]);
  /* razor wire on top */
  for(const [x0,x1,z0,z1] of[[I[0],I[1],I[2]+.4,I[2]+.4],[I[0]+.4,I[0]+.4,I[2],I[3]],[I[1]-.4,I[1]-.4,I[2],I[3]],[I[0],gx-6,I[3]-.4,I[3]-.4],[gx+6,I[1],I[3]-.4,I[3]-.4]]){const ax=x1-x0>z1-z0,len=ax?x1-x0:z1-z0;
    for(const y of[H+.45,H+.9])bx(S,(x0+x1)/2,y,(z0+z1)/2,ax?len:.05,.05,ax?.05:len,'#3a3d44');for(let u=0;u<=len;u+=3)bx(S,ax?x0+u:x0,H+.6,ax?z0:z0+u,.08,1.2,.08,'#3a3d44')}
  /* gatehouse and the main gate */
  blk(S,gx-6,gx-3.5,0,11.5,I[3]-2,I[3]+.6,'#d7d2c8');blk(S,gx+3.5,gx+6,0,11.5,I[3]-2,I[3]+.6,'#d7d2c8');blk(S,gx-6,gx+6,8.4,11.5,I[3]-1.6,I[3]+.4,'#d7d2c8');col(gx-6,gx-3.5,0,11.5,I[3]-2,I[3]+.6);col(gx+3.5,gx+6,0,11.5,I[3]-2,I[3]+.6);
  blk(S,gx-3.5,gx+3.5,0,8.4,I[3]-.45,I[3]-.15,'#3a3d44');for(let x=gx-3.2;x<gx+3.3;x+=.7)bx(S,x,4.2,I[3]-.12,.12,8.2,.06,'#2b2d31');bx(S,gx,4.2,I[3]-.12,.06,8.2,.08,'#141414');col(gx-3.5,gx+3.5,0,8.4,I[3]-.5,I[3]-.1);
  addPlane(scene,11,1.6,signTex('CENTRAL JAIL','#1d1d1d','#ffcc3a',768,112),[gx,10,I[3]+.43],0,null);
  for(const s of[-1,1])bx(LMP,gx+s*4.75,7.6,I[3]+.66,.5,.5,.12,'#fff6d8');
  const booth=prop(S,gx+8.6,0,I[3]+2.6);booth.box(0,1.3,0,2.2,2.6,2.2,'#f4f1ea');booth.box(0,2.7,0,2.6,.2,2.6,'#c62828');col(gx+7.5,gx+9.7,0,2.6,I[3]+1.5,I[3]+3.7);
  /* the cell block you can see over the wall, and a yard */
  blk(S,119,157,0,15,-96,-38,'#a9adb2');blk(S,118.8,157.2,14.6,15.2,-96.2,-37.8,'#7d8188',false);
  for(const y of[2.6,5.8,9,12.2]){for(let x=121;x<156;x+=2.4){bx(S,x,y,-37.96,.9,1.1,.08,'#3a3f47');bx(S,x,y,-96.04,.9,1.1,.08,'#3a3f47')}for(let z=-94;z<-39;z+=2.4){bx(S,118.96,y,z,.08,1.1,.9,'#3a3f47');bx(S,157.04,y,z,.08,1.1,.9,'#3a3f47')}}
  col(119,157,0,15,-96,-38);
  cyl(S,127,1.6,-30,.09,.09,3.2,'#9aa3ad',8);bx(S,127,3.3,-30.4,1.6,1,.1,'#ffffff');for(const x of[146,150])blk(S,x-1,x+1,0,.45,-25,-24.4,'#9a958b');
  /* watchtowers with sweeping searchlights */
  W.searchlights=[];for(const [x,z,a0] of[[I[0]+1.6,I[2]+1.6,.8],[I[1]-1.6,I[2]+1.6,2.3],[I[0]+1.6,I[3]-1.6,-.8],[I[1]-1.6,I[3]-1.6,-2.3]]){
    for(const dx of[-1.2,1.2])for(const dz of[-1.2,1.2])blk(S,x+dx-.18,x+dx+.18,0,11,z+dz-.18,z+dz+.18,'#7d8188');
    blk(S,x-2,x+2,11,13.6,z-2,z+2,'#d7d2c8');bx(WIN,x,12.5,z,4.06,.9,4.06,'#ffffff');blk(S,x-2.4,x+2.4,13.6,14,z-2.4,z+2.4,'#3a3d44');col(x-1.5,x+1.5,0,14,z-1.5,z+1.5);
    const g=new THREE.Group();g.position.set(x,13,z);const cone=new THREE.Mesh(new THREE.ConeGeometry(3.2,24,16,1,true),new THREE.MeshBasicMaterial({color:'#fff3c4',transparent:true,opacity:.09,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
    cone.geometry.translate(0,-12,0);cone.rotation.x=-1.05;g.add(cone);g.rotation.y=a0;g.userData.a0=a0;scene.add(g);W.searchlights.push(g)}
  G.extraNPCs.push({name:'Jail guard Tomar',look:{shirt:'#c9b48a',pants:'#c9b48a',hair:'short',hat:'#1d3f2a',mustache:true,face:'flat',long:true},x:gx-4.6,z:I[3]+1.6,yaw:0,lines:['Central Jail. One hundred and twelve cells.','There is one prisoner in high security. Do not go near her cell.','Visiting hours are always. Leaving hours are never.'],barks:['No photography.','Stay alert.']},
    {name:'Jail guard Pinto',look:{shirt:'#c9b48a',pants:'#c9b48a',hair:'cap',hat:'#1d3f2a',face:'smug',long:true},x:gx+4.6,z:I[3]+1.6,yaw:0,lines:['You want to see Jiya? Everyone does. Few come back with their heart.','Ten stars. I have never seen ten stars before.'],barks:['Ten stars, boss.','Keep moving.']});
  G.triggers.push({x:gx,z:I[3]+1.2,r:2.4,label:'Enter Central Jail',act:()=>G.enter('jail')});
  G.noGrass.push([O[0],O[1],O[2],O[3]],[gx-3.5,gx+3.5,-13,-7]);G.blocked.push([O[0]-2,O[1]+2,O[2]-2,O[3]+2]);G.noLamp.push([gx-5,gx+5,-15,-6]);
  G.mapPolys.push({pts:boxPts(...O,8),col:'#2f3238'});
  G.buildings.push({name:'Central Jail',short:'Central Jail',x0:I[0],x1:I[1],z0:I[2],z1:I[3],col:'#ffffff',door:{x:gx,z:I[3]+2.4},room:'jail'});
  return{x:gx,z:I[3]+2.6,fx:0,fz:1}}

function catModel(B,x,y,z,col,dir=0,pose='sit'){const r=[[1,0,0,1],[0,1,-1,0],[-1,0,0,-1],[0,-1,1,0]][dir&3],sw=dir%2;const at=(dx,dz)=>[x+dx*r[0]+dz*r[1],z+dx*r[2]+dz*r[3]];
  const box=(dx,dy,dz,w,h,d,c=col)=>{const [px,pz]=at(dx,dz);bx(B,px,y+dy,pz,sw?d:w,h,sw?w:d,c)};
  if(pose==='loaf'){box(0,.16,0,.36,.3,.62);box(0,.32,.36,.3,.28,.28);box(-.09,.5,.4,.08,.1,.06);box(.09,.5,.4,.08,.1,.06);box(0,.1,-.44,.08,.08,.32);box(-.07,.34,.505,.05,.05,.01,'#c9f26b');box(.07,.34,.505,.05,.05,.01,'#c9f26b')}
  else{box(0,.26,0,.32,.5,.36);box(0,.62,.06,.3,.28,.28);box(-.09,.8,.08,.08,.1,.06);box(.09,.8,.08,.08,.1,.06);box(0,.08,-.3,.1,.08,.34);box(-.07,.64,.205,.05,.05,.01,'#c9f26b');box(.07,.64,.205,.05,.05,.01,'#c9f26b')}}

function meowClub(scene,ctx){const {S,WIN,LMP,addPlane}=ctx;const x0=16,x1=56,z0=137,z1=170,H=7.5,cx=36,LI='#e2a8f0',PU='#7a3f8f';
  blk(S,x0,x1,0,H,z0,z1,LI);blk(S,x0-.2,x1+.2,H-.5,H,z0-.2,z1+.2,'#ffffff',false);blk(S,x0-.1,x1+.1,0,.5,z0-.1,z1+.1,PU,false);
  for(const s of[-1,1]){const e=new THREE.ConeGeometry(2.6,3.6,4);e.rotateY(PI/4);e.translate(cx+s*9,H+1.8,z0+2.2);S.add(e,LI);const i=new THREE.ConeGeometry(1.4,2.3,4);i.rotateY(PI/4);i.translate(cx+s*9,H+1.4,z0+1.15);S.add(i,'#ff8fc1')}
  const F=fac({x0,x1,z0,z1},'n');F.box(WIN,cx-11,2.7,.04,12,3.2,.1,'#ffffff');F.box(WIN,cx+11,2.7,.04,12,3.2,.1,'#ffffff');F.box(S,cx,1.5,.06,2.4,3,.12,PU);F.box(S,cx,3.15,.06,3,.3,.14,'#ffffff');
  for(const u of[cx-11,cx+11])for(const k of[-4,0,4])F.box(S,u+k,2.7,.1,.14,3.2,.16,'#ffffff');
  addPlane(scene,17,2,signTex('MEOW CLUB · CAT CAFE',PU,'#ffffff',1024,120),[cx,H-1.55,z0-.12],PI,null);
  blk(S,cx-5,cx+5,3.5,3.7,z0-2.2,z0,'#ff8fc1');blk(S,cx-5,cx+5,3.3,3.5,z0-2.2,z0-2,'#ffffff');
  blk(S,x0,x1,0,.07,z0-6.2,z0,'#f1e3d3',false);
  for(const [x,c] of[[21,'#ff8fc1'],[27,'#ffffff'],[45,'#ff8fc1'],[51,'#ffffff']]){const z=z0-3.6;cyl(S,x,.38,z,.5,.5,.06,'#ffffff',12);cyl(S,x,.2,z,.06,.06,.4,'#9a9a9a',6);cyl(S,x,1.3,z,.05,.05,2.6,'#9a9a9a',6);
    const u=new THREE.ConeGeometry(1.7,.7,8);u.translate(x,2.75,z);S.add(u,c);for(const dx of[-.9,.9])blk(S,x+dx-.22,x+dx+.22,0,.45,z-.22,z+.22,PU);col(x-.5,x+.5,0,.8,z-.5,z+.5)}
  catModel(S,24,.07,z0-1.1,'#f0a24a',2,'sit');catModel(S,48,.07,z0-1.4,'#2b2b2b',2,'loaf');catModel(S,x1-4,H,z0+3,'#ffffff',2,'loaf');
  col(x0,x1,0,H,z0,z1);
  G.triggers.push({x:cx,z:z0-1.6,r:2.2,label:'Enter Meow Club',act:()=>G.enter('meow')});
  G.buildings.push({name:'Meow Club',short:'Meow Club',x0,x1,z0,z1,col:LI,door:{x:cx,z:z0-2.4},room:'meow'});
  G.noGrass.push([x0-1,x1+1,z0-7,z1+1]);G.blocked.push([10.5,61,129,176]);
  return{x:cx,z:z0-2.4,fx:0,fz:-1}}

/* =================== interiors for the real buildings =================== */
export function extraRooms(room,env){const {scene,addPlane,posterTex,npc,outs}=env;
  const glass=new THREE.MeshBasicMaterial({color:'#cfeaff',transparent:true,opacity:.22,depthWrite:false});
  const tapM=(m,reach,fn)=>{m.userData.tap=fn;m.userData.reach=reach;G.pick.push(m)};
  const model=(fn)=>{const b=new Batch();fn(b);const m=b.mesh(CHM);m.castShadow=true;return m};

  /* ---------- Vashu Museum ---------- */
  room('museum',{name:'Outpulse Museum',w:28,d:22,h:9,wall:'#f2ead9',floor:'#d8cdb8',trim:'#9c4a2f',light:'#fff6e6'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    for(let i=0;i<7;i++)for(let j=0;j<6;j++)blk(S,x0+i*4,x0+i*4+4,0,.015,z0+j*(22/6),z0+(j+1)*(22/6),(i+j)%2?'#efe7d8':'#d6cab3',false);
    for(const x of[cx-9.5,cx+9.5])for(const z of[-6,0,6]){cyl(S,x,4.5,z,.45,.5,9,'#f6eedc',14);bx(S,x,.2,z,1.2,.4,1.2,'#cdbb95');bx(S,x,8.8,z,1.2,.4,1.2,'#cdbb95');col(x-.5,x+.5,0,9,z-.5,z+.5)}
    for(let x=x0+2;x<x1-1;x+=4)bx(WIN,x,8.9,0,.6,.06,.6,'#ffffff');
    R.back(0,6.9,11,1.7,signTex('OUTPULSE MUSEUM','#9c4a2f','#efe4cc',1024,158),null);
    R.back(0,3.6,7.2,3.1,posterTex({w:768,h:330,bg:'#2b2118',fg:'#f3e9d2',kicker:'The story',title:'Cup first, then the numbers.',big:44,body:STORY,bs:17}),()=>G.card({n:'The story',tag:'Vashudev Sharma',st:'',d:STORY,href:'',color:'#2b2118'}),{reach:9});
    // rotunda: gold statue on a plinth, velvet ropes
    cyl(S,cx,.45,-1.5,2.3,2.5,.9,'#cdbb95',28);cyl(S,cx,.92,-1.5,2.2,2.2,.06,'#9c4a2f',28);col(cx-2.3,cx+2.3,0,.9,-3.8,.8);
    const statue=makeChar({skin:'#d4af37',shirt:'#c9a227',pants:'#b8941f',shoes:'#a8841a',hairC:'#b8941f',hair:'curly',glasses:true,face:'smile',seed:3});statue.scale.setScalar(1.6);statue.position.set(cx,.95,-1.5);
    statue.userData.armR.rotation.x=-2.4;statue.userData.armL.rotation.z=.25;scene.add(statue);
    const cup=model(b=>{cyl(b,0,0,0,.11,.09,.22,'#e0c25a',10)});cup.position.set(0,-.72,.12);statue.userData.armR.add(cup);
    tapM(statue,7,()=>{G.host.egg('ow_statue','You read the statue plaque.');G.say('Plaque','"Vashudev Sharma. Barista, founder, still on his second coffee." Cast in gold-coloured hope, 2026.')});
    for(let k=0;k<8;k++){const a=k/8*PI*2;const x=cx+Math.cos(a)*3.4,z=-1.5+Math.sin(a)*3.4;cyl(S,x,.5,z,.06,.06,1,'#c9a227',8);const g=new THREE.SphereGeometry(.1,8,6);g.translate(x,1.02,z);S.add(g,'#c9a227');
      const a2=(k+1)/8*PI*2,x2=cx+Math.cos(a2)*3.4,z2=-1.5+Math.sin(a2)*3.4;if(k===2)continue;const L=Math.hypot(x2-x,z2-z);bx(S,(x+x2)/2,.82,(z+z2)/2,L,.07,.07,'#a3122a',-Math.atan2(z2-z,x2-x))}
    // the journey (left wall)
    R.left(-9.2,6.9,6,.9,signTex('THE JOURNEY','#f2ead9','#5a3b1e',512,78),null);
    ROLES.forEach((r,i)=>{const z=-8.4+i*3.2;bx(S,x0+.05,3.4,z,.06,3.4,2.7,'#8a6a2a');R.left(z,3.4,2.4,3.1,posterTex({w:400,h:516,bg:['#ff6a3d','#2f5bff','#c9f26b','#ffc9e0','#f4efe6','#ffcc3a'][i],kicker:r[0],title:r[1],body:r[2],big:52,bs:24}),()=>G.card({n:r[1],tag:r[0],st:r[2],d:'Part of the journey: '+r[1]+' at '+r[2]+'.',href:'',color:'#f4efe6'}),{reach:6});bx(WIN,x0+.4,5.4,z,.2,.08,.5,'#ffffff')});
    // toolkit (right wall) + CV
    R.right(-9.2,6.9,6,.9,signTex('THE TOOLKIT','#f2ead9','#5a3b1e',512,78),null);
    SKILLS.forEach((sk,i)=>{const z=-8.2+i*3.4;bx(S,x1-.05,3.4,z,.06,3.4,2.9,'#8a6a2a');R.right(z,3.4,2.6,3.1,posterTex({w:420,h:500,bg:['#c9f26b','#ffcc3a','#3bd1ff','#ff8fc1'][i],kicker:'Skill',title:sk[0],body:sk[1],big:60,bs:22}),()=>G.card({n:sk[0],tag:'Toolkit',st:'',d:sk[1]+'.',href:'',color:'#c9f26b'}),{reach:6});bx(WIN,x1-.4,5.4,z,.2,.08,.5,'#ffffff')});
    R.right(5.8,3.4,2.6,3.1,posterTex({w:420,h:500,bg:'#141414',kicker:'Curriculum vitae',title:'Read the CV',body:'The quick-read version of everything in this museum.',big:56,bs:22,foot:'TAP TO READ'}),()=>G.cv(),{reach:6});
    // numbers on plinths
    NUMS.forEach((nn,i)=>{const x=cx-6+i*4,z=-7.6;blk(S,x-.8,x+.8,0,1.1,z-.6,z+.6,'#f6eedc');bx(S,x,1.12,z,1.7,.06,1.3,'#9c4a2f');
      const t=tex(400,480,(c,w,h)=>{c.fillStyle=['#ff6a3d','#2f5bff','#c9f26b','#ff8fc1'][i];c.fillRect(0,0,w,h);c.fillStyle=i===1?'#fff':'#141414';c.textAlign='center';let s=150;c.font='800 '+s+'px '+FONT_T;while(c.measureText(nn[0]).width>w-40){s-=10;c.font='800 '+s+'px '+FONT_T}c.fillText(nn[0],w/2,230);c.font='600 30px '+FONT_T;wrap(c,nn[1],w-60).forEach((l,j)=>c.fillText(l,w/2,320+j*40))});
      addPlane(scene,1.6,1.92,t,[x,2.1,z],0,()=>G.card({n:nn[0],tag:'In numbers',st:'',d:nn[0]+': '+nn[1]+'.',href:'',color:'#ffcc3a'}),{reach:6})});
    // glass cases with artifacts
    const items=[['Portafilter, 2023','The first portafilter he ever locked in. Slightly dented. So was his confidence.',b=>{cyl(b,0,.08,0,.32,.3,.16,'#c9ccd1',14);bx(b,.55,.08,0,.7,.1,.14,'#2b2b2b')}],
      ['First latte art','A heart. Technically. Viewed from the left, in good light.',b=>{cyl(b,0,.12,0,.2,.15,.24,'#ffffff',12);cyl(b,0,.245,0,.18,.18,.01,'#c8956a',12);bx(b,0,.255,0,.12,.005,.1,'#f6efe1',.78)}],
      ['The Chromebook','A Dell Chromebook 11, now running Xubuntu. Half of this town was built on it.',b=>{bx(b,0,.03,0,.8,.04,.55,'#2b2b2b');bx(b,0,.3,-.26,.8,.52,.03,'#2b2b2b',0,-.25);bx(b,0,.3,-.245,.72,.44,.01,'#3fa7e0',0,-.25)}],
      ['Cupping spoon','A thousand-plus cups slurped with this. Etiquette was optional.',b=>{bx(b,0,.03,0,.7,.03,.08,'#c9ccd1');const g=new THREE.SphereGeometry(.12,10,6,0,PI*2,0,PI/2);g.rotateX(PI);g.translate(-.38,.1,0);b.add(g,'#c9ccd1')}]];
    items.forEach(([n,d,fn],i)=>{const x=cx+(i<2?-6.6+i*3.2:3.4+(i-2)*3.2),z=4.6;blk(S,x-.65,x+.65,0,1,z-.65,z+.65,'#2b2118');bx(S,x,1.02,z,1.2,.04,1.2,'#cdbb95');
      const m=model(fn);m.position.set(x,1.06,z);scene.add(m);const gl=new THREE.Mesh(new THREE.BoxGeometry(1.2,.9,1.2),glass);gl.position.set(x,1.5,z);scene.add(gl);tapM(gl,5,()=>G.say(n,d));
      addPlane(scene,1.1,.28,signTex(n.toUpperCase(),'#2b2118','#efe4cc',512,120),[x,.7,z+.66],0,null)});
    // benches facing the statue
    for(const s of[-1,1]){const z=-1.5,x=cx+s*6.2;blk(S,x-.35,x+.35,0,.5,z-1.2,z+1.2,'#6b4a35');G.seats.push({x:x-s*.05,z,y:.52,yaw:-s*PI/2,label:'Sit and admire'})}
    // pedestal for a bean + gift shop sign
    blk(S,cx+10.25,cx+10.95,0,1.1,-6.95,-6.25,'#cdbb95');
    R.right(9.2,2.4,2.4,.6,signTex('GIFT SHOP · COMING SOON','#9c4a2f','#efe4cc',512,128),null);
    R.npc({name:'Curator Kamala',x:cx-4.6,z:7.4,yaw:PI*.8,look:{shirt:'#7a2e1b',pants:'#2b2118',hair:'bun',glasses:true,face:'smile',long:true},lines:['Welcome to the Vashu Museum. Entry is free. Leaving is also free.','No flash photography. The statue is shy.','Every exhibit here is real. The coffee stains are original.'],barks:['Shh.','Please don\'t lick the exhibits.']});
  });


  /* ---------- Vedshree Kunj ---------- */
  room('kunj',{name:'Vedshree Kunj',w:16,d:12,h:5.5,wall:'#f3e6d6',floor:'#b07a4f',trim:'#c1693c',light:'#ffeccc'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    cyl(S,cx-1.5,.02,-1.2,2.7,2.7,.03,'#c1693c',28);cyl(S,cx-1.5,.04,-1.2,2.1,2.1,.03,'#f3d7a8',28);cyl(S,cx-1.5,.06,-1.2,1.1,1.1,.03,'#2f7a6b',24);
    // sofa + coffee table
    blk(S,cx-5.2,cx-1.6,0,.48,z0+.35,z0+1.35,'#5a7a6a');blk(S,cx-5.2,cx-1.6,.48,1.15,z0+.2,z0+.5,'#4e6b5c');for(const x of[cx-5.3,cx-1.5])blk(S,x-.15,x+.15,0,.75,z0+.2,z0+1.35,'#4e6b5c');
    for(let i=0;i<3;i++)bx(S,cx-4.6+i*1.2,.75,z0+.6,.6,.45,.2,['#ffcc3a','#e64a8b','#f3eee6'][i],0,-.25);G.seats.push({x:cx-3.4,z:z0+.95,y:.5,yaw:0,label:'Sit on the sofa'});
    blk(S,cx-4.2,cx-2.6,0,.42,z0+2.2,z0+3,'#8a5a3b');cyl(S,cx-3.7,.52,z0+2.6,.09,.08,.18,'#ffffff',10);cyl(S,cx-3.2,.52,z0+2.5,.09,.08,.18,'#ffffff',10);bx(S,cx-3,.44,z0+2.75,.4,.04,.3,'#2f5bff');
    // bookshelf (right wall)
    blk(S,x1-.3,x1-.15,0,3.4,-3.6,.2,'#6b4a35');for(const z of[-3.6,.2])blk(S,x1-.75,x1-.15,0,3.4,z-.05,z+.05,'#6b4a35');for(let i=0;i<5;i++)blk(S,x1-.75,x1-.15,.2+i*.8,.26+i*.8,-3.6,.2,'#6b4a35',i===0);
    for(let i=0;i<4;i++)for(let j=0;j<7;j++)bx(S,x1-.5,.55+i*.8,-3.2+j*.48,.36,.5+((i+j)%3)*.04,.3,['#e94b3c','#3d7be8','#ffcc3a','#5cc46b','#a463ff','#f3eee6'][(i*3+j)%6]);
    // kitchen counter with two cups and a kettle
    blk(S,x1-4.4,x1-.2,0,1,z0+.2,z0+1,'#f3eee6');bx(S,x1-2.3,1.03,z0+.6,4.3,.06,.85,'#2b2b2b');cyl(S,x1-3.4,1.15,z0+.6,.1,.08,.2,'#c1693c',10);cyl(S,x1-3.05,1.15,z0+.6,.1,.08,.2,'#2f7a6b',10);cyl(S,x1-1.4,1.22,z0+.55,.22,.26,.36,'#c9ccd1',12);
    R.back(5.4,2.6,2.6,.5,signTex('TWO CUPS. ALWAYS TWO.','#f3e6d6','#5a3220',512,96),null);
    // desk + terminal (left wall)
    blk(S,x0+.2,x0+1.2,0,.95,-.6,2,'#8a5a3b');bx(S,x0+.55,1.42,.7,.08,.85,1.2,'#1d1d1d');bx(S,x0+.75,.96,.7,.3,.04,.7,'#2b2b2b');blk(S,x0+1.6,x0+2.2,0,.5,.4,1,'#2f7a6b');
    const term=tex(512,320,(c,W,H)=>{c.fillStyle='#0b0f0c';c.fillRect(0,0,W,H);c.fillStyle='#39ff7a';c.font='600 24px ui-monospace,Menlo,Consolas,monospace';
      ['vedshree@kunj:~$ whoami','vedshree','vedshree@kunj:~$ status --today','shipping. ask later.','vedshree@kunj:~$ ./open-door','welcome in. shoes outside.','vedshree@kunj:~$ _'].forEach((l,i)=>c.fillText(l,20,40+i*38))});
    addPlane(scene,1.1,.7,term,[x0+.6,1.45,.7],PI/2,()=>{G.host.egg('ow_terminal','You found the terminal at Vedshree Kunj.');G.say('Terminal','$ whoami → vedshree. $ status → shipping. Ask later.')},{reach:4});
    // window to the garden, fairy lights, poster, plants, photo frames
    R.back(-1.5,3,3.6,2.2,tex(512,312,(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bfe3f7');g.addColorStop(1,'#eaf6ff');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#4f8f3a';for(let i=0;i<9;i++){c.beginPath();c.arc(i*64,H-30+(i%2)*14,46,0,7);c.fill()}c.fillStyle='#e64a8b';for(let i=0;i<14;i++){c.beginPath();c.arc(30+i*36,H-60+(i%3)*12,8,0,7);c.fill()}c.strokeStyle='#f3e6d6';c.lineWidth=14;c.strokeRect(0,0,W,H);c.beginPath();c.moveTo(W/2,0);c.lineTo(W/2,H);c.stroke()}),null);
    for(let i=0;i<=20;i++){const u=-6.6+i*.66;bx(WIN,cx+u,4.6-Math.sin(i/20*PI)*.4,z0+.08,.1,.12,.1,'#ffffff')}
    R.back(-6,2.8,2,2.6,posterTex({w:320,h:416,bg:'#c1693c',fg:'#fff6e6',kicker:'Kunj (n.)',title:'A little garden home.',big:42}),null);
    for(let i=0;i<4;i++)R.left(-4.6+i*1.2,2.9+(i%2)*.5,.9,.7,tex(128,100,(c,W,H)=>{c.fillStyle='#f3eee6';c.fillRect(0,0,W,H);c.fillStyle=['#2f7a6b','#e64a8b','#ffcc3a','#3d7be8'][i];c.fillRect(12,12,W-24,H-24)}),null);
    for(const [x,z] of[[x0+.7,z0+.7],[x1-.7,2.4],[cx+.4,z0+.7]])pot(S,x,z,'#b5552e','#3f9b4a',.7);
  });


  /* ---------- NTH Labs: lobby (L0) and lab floor (L12) ---------- */
  const skyDeck=()=>G.tp(0,84,-44,PI,'NTH Labs · Sky Deck');
  room('nth',{name:'NTH Labs · Lobby',w:22,d:14,h:7,wall:'#3a4558',floor:'#c9ced6',trim:'#3bd1ff',light:'#ffffff'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    for(let i=0;i<11;i++)blk(S,x0+i*2,x0+i*2+1.96,0,.012,z0,z1,i%2?'#d5dae1':'#c4cad3',false);for(let x=x0+2;x<x1-1;x+=4)bx(WIN,x,6.9,0,.7,.06,.7,'#ffffff');
    R.back(0,4.3,9,2.4,tex(900,240,(c,W,H)=>{c.fillStyle='#10151d';c.fillRect(0,0,W,H);c.fillStyle='#3bd1ff';c.font='400 130px '+FONT_D;c.textAlign='center';c.fillText('NTH LABS',W/2,150);c.font='600 30px '+FONT_T;c.fillStyle='#cfe9f5';c.fillText('Building the nth thing.',W/2,205)}),null);
    bx(WIN,cx,2.95,z0+.06,9.2,.08,.08,'#ffffff');bx(WIN,cx,5.65,z0+.06,9.2,.08,.08,'#ffffff');
    blk(S,cx-3.2,cx+3.2,0,1.1,z0+3.2,z0+4,'#f4f6f8');bx(S,cx,1.13,z0+3.6,6.5,.06,.9,'#d9dee4');bx(WIN,cx,.6,z0+4.02,6,.06,.04,'#ffffff');
    R.npc({name:'Receptionist Ria',x:cx,z:z0+2.3,yaw:0,look:{shirt:'#3bd1ff',pants:'#1b2230',hair:'bun',headset:true,face:'smile'},lines:['Welcome to NTH Labs. Elevators are on your left.','What do we build here? The nth thing. That\'s all I\'m allowed to say.','Something\'s cooking upstairs. Smells like solder.'],barks:['Welcome!','Badge, please.']});
    for(const s2 of[-1,1]){const z=1.2+s2*1.6;blk(S,cx+4.2,cx+7.8,0,.45,z-.5,z+.5,'#4b5566');blk(S,cx+4.2,cx+7.8,.45,1,s2>0?z+.3:z-.5,s2>0?z+.5:z-.3,'#4b5566');G.seats.push({x:cx+6,z,y:.48,yaw:s2>0?PI:0,label:'Wait on the sofa'})}
    blk(S,cx+5.2,cx+6.8,0,.4,.8,1.6,'#d9dee4');for(const [x,z] of[[x1-.8,z0+.8],[x1-.8,z1-1.8],[cx-6,z0+.8]])pot(S,x,z,'#4b5566','#3f9b4a',.8);
    for(let z=-3.6;z<=4;z+=1.9)bx(WIN,x1-2.2,2,z,.06,3.4,1.7,'#ffffff');
    for(const [z,lab,fn] of[[-2.6,'L12 · LAB FLOOR',()=>G.enter('nthlab')],[1.8,'L24 · SKY DECK',skyDeck]]){bx(S,x0+.07,1.45,z,.1,2.9,1.8,'#9aa3ad');bx(S,x0+.13,1.45,z,.02,2.9,.04,'#5a6270');R.left(z,3.35,1.8,.36,signTex(lab,'#141414','#3bd1ff',512,104),null);
      G.triggers.push({x:x0+1.5,z,r:1.3,label:'Elevator · '+(lab.startsWith('L12')?'Lab floor (L12)':'Sky deck (L24)'),act:fn})}
    R.right(-4,3.4,2.4,.6,signTex('LOBBY · L0','#141414','#f4f6f8',512,128),null);
  });
  room('nthlab',{name:'NTH Labs · Lab floor L12',w:24,d:16,h:6,wall:'#eef2f6',floor:'#cfd6de',trim:'#3bd1ff',light:'#f2f8ff',exit:false,out:outs.nth},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    R.back(0,3.1,22,3.6,tex(1100,180,(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#8fc8ee');g.addColorStop(1,'#d9eefb');c.fillStyle=g;c.fillRect(0,0,W,H);const r=rng(5);for(let i=0;i<46;i++){const w=14+r()*26,h=40+r()*120,x=i*24+r()*10;c.fillStyle=r()<.5?'#5d7a92':'#6f8ba3';c.fillRect(x,H-h,w,h);c.fillStyle='rgba(255,255,255,.35)';for(let y=H-h+6;y<H;y+=10)c.fillRect(x+3,y,w-6,3)}
      c.strokeStyle='#ffcc3a';c.lineWidth=3;for(let i=0;i<5;i++){const x=80+i*230;c.beginPath();c.moveTo(x,H);c.lineTo(x,30);c.lineTo(x+70,30);c.stroke()}c.strokeStyle='#cfd6de';c.lineWidth=8;for(let x=0;x<=W;x+=110){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}}),null);
    for(const [u,z] of[[-5,-3],[5,-3],[-5,1.4],[5,1.4]]){const x=cx+u;blk(S,x-2,x+2,0,.95,z-.6,z+.6,'#f4f6f8');bx(S,x,.95,z,4.1,.06,1.3,'#9aa3ad');for(const k of[-1,1]){bx(S,x+k*.9,1.35,z-.3,.9,.6,.06,'#1d1d1d');bx(WIN,x+k*.9,1.35,z-.26,.8,.5,.02,'#ffffff');bx(S,x+k*.9,.4,z+.95,.5,.08,.5,'#2a3442');bx(S,x+k*.9,.2,z+.95,.06,.4,.06,'#555')}}
    const ra=cx+5,rz=-3.1;cyl(S,ra-1.2,1.05,rz+.3,.22,.26,.2,'#ff6a3d',12);bx(S,ra-1.2,1.45,rz+.3,.16,.7,.16,'#ff6a3d',0,0,.4);bx(S,ra-1.35,1.9,rz+.3,.6,.14,.14,'#ff6a3d',0,0,-.5);bx(S,ra-1.6,1.75,rz+.3,.08,.25,.25,'#2a3442');
    blk(S,x1-2.4,x1-.6,0,1.9,z0+.6,z0+2.2,'#2a3442');bx(WIN,x1-1.5,1.2,z0+2.22,1.2,.9,.04,'#ffffff');bx(S,x1-1.5,1,z0+1.4,.4,.3,.4,'#ff6a3d');
    for(let i=0;i<3;i++){const z=-5.5+i*1.5;blk(S,x0+.2,x0+1.2,0,2.6,z-.6,z+.6,'#141414');for(let k=0;k<8;k++)bx(WIN,x0+1.22,.5+k*.27,z-.3+((k*7+i)%4)*.18,.02,.06,.1,'#ffffff')}
    const wb=tex(640,400,(c,W,H)=>{c.fillStyle='#ffffff';c.fillRect(0,0,W,H);c.strokeStyle='#9aa3ad';c.lineWidth=10;c.strokeRect(0,0,W,H);c.fillStyle='#e53935';c.font='400 64px '+FONT_D;c.fillText('SOMETHING\'S COOKING',30,90);c.fillStyle='#141414';for(let i=0;i<6;i++){c.fillRect(30,130+i*40,120+((i*97)%300),22)}c.strokeStyle='#2f5bff';c.lineWidth=5;c.beginPath();c.arc(520,280,60,0,7);c.stroke();c.beginPath();c.moveTo(460,280);c.lineTo(580,280);c.stroke();c.fillStyle='#2f5bff';c.font='700 24px '+FONT_T;c.fillText('v0.n',490,370)});
    R.right(-1,2.8,4.2,2.6,wb,()=>G.card({n:'Something\'s cooking',tag:'NTH Labs',st:'Classified',d:'Whatever is on this whiteboard is under NDA. Even the doodles.',href:'',color:'#3bd1ff'}),{reach:6});
    R.npc({name:'Engineer Neel',x:cx+2.6,z:3.6,yaw:PI*.9,look:{shirt:'#2a3442',pants:'#141414',hair:'curly2',glasses:true,headset:true,face:'grin'},lines:['Can\'t tell you what we\'re building. NDA. Also I forgot.','This 3D printer has been printing the same bracket since Tuesday.','Lab rule: no project names on this floor. Only vibes.'],barks:['Compiling…','Don\'t touch the arm.']});
    for(const [z,lab,fn] of[[5.2,'L0 · LOBBY',()=>G.enter('nth')],[2,'L24 · SKY DECK',skyDeck]]){bx(S,x0+.07,1.45,z,.1,2.9,1.8,'#9aa3ad');bx(S,x0+.13,1.45,z,.02,2.9,.04,'#5a6270');R.left(z,3.35,1.8,.36,signTex(lab,'#141414','#3bd1ff',512,104),null);
      G.triggers.push({x:x0+1.5,z,r:1.3,label:'Elevator · '+(lab.startsWith('L0')?'Lobby':'Sky deck (L24)'),act:fn})}
    R.right(5.6,3.6,2.4,.6,signTex('L12 · LAB FLOOR','#141414','#f4f6f8',512,128),null);
  });

  /* ---------- Fire Station ---------- */
  room('fire',{name:'Fire Station',w:18,d:14,h:7,wall:'#f4f1ea',floor:'#9aa3ad',trim:'#c62828',light:'#fff1e6'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    const tr=prop(S,cx-3.6,0,-.8,0);tr.box(0,1.3,-.4,2.3,1.9,5.4,'#e53935');tr.box(0,1.5,2.6,2.3,2.2,1.6,'#e53935');tr.box(0,1.8,3.42,2,.9,.04,'#26323d');tr.box(0,2.4,-.6,1.9,.12,5,'#c9ccd1');
    for(let i=0;i<6;i++)tr.box(0,2.6,-3+i*.9,1.6,.06,.1,'#c9ccd1');tr.box(0,1.1,0,2.32,.2,7,'#ffffff');for(const zz of[2.4,-.8,-2.4])for(const s of[-1,1])tr.wheel(s*1.1,.5,zz,.5,.36);col(cx-4.8,cx-2.4,0,2.8,-4.4,2.8);
    blk(S,cx-6,cx-1.2,0,.02,-4.8,3.6,'#ffcc3a',false);blk(S,cx-5.8,cx-1.4,0,.025,-4.6,3.4,'#9aa3ad',false);
    // fire pole
    cyl(S,cx+5,3.5,-1.5,.08,.08,7,'#c9ccd1',10);cyl(S,cx+5,6.98,-1.5,.9,.9,.04,'#2b2b2b',16);cyl(S,cx+5,.03,-1.5,.9,.9,.06,'#c62828',16);col(cx+4.9,cx+5.1,0,7,-1.6,-1.4);
    G.triggers.push({x:cx+5,z:-.3,r:1.4,label:'Slide down the fire pole',act:()=>{G.player.pos.set(cx+5,5.6,-1.1);G.player.vel.set(0,0,0);G.host.egg('ow_firepole','You slid down the fire pole. Whoosh.')}});
    // lockers + helmets, hose reels, board
    for(let i=0;i<6;i++){const x=cx+.5+i*1.1;blk(S,x-.5,x+.5,0,2.2,z0+.1,z0+.7,'#c62828');bx(S,x,1.6,z0+.72,.08,.3,.02,'#ffffff');const g=new THREE.SphereGeometry(.24,12,8,0,PI*2,0,PI/2);g.translate(x,2.22,z0+.4);S.add(g,'#ffcc3a')}
    for(const z of[-3,0,3]){cyl(S,x1-.4,2.2,z,.6,.6,.3,'#c62828',16);cyl(S,x1-.4,2.2,z,.25,.25,.34,'#ffcc3a',12)}
    R.back(-4.6,3.4,3.2,2.2,posterTex({w:500,h:344,bg:'#141414',fg:'#ffcc3a',kicker:'Days without a fire',title:'67',big:120}),()=>{G.say('Board','Days without a fire: 67. Six… seven.')},{reach:7});
    R.left(4,3.4,2.6,2.6,posterTex({w:420,h:420,bg:'#c62828',fg:'#ffffff',kicker:'Emergency',title:'Dial 101',body:'Burnt coffee is not an emergency. We checked.',big:70,bs:22}),null);
    R.npc({name:'Captain Agni',x:cx+1.8,z:1.6,yaw:PI,look:{shirt:'#2b2b2b',pants:'#2b2b2b',hair:'short',hat:'#ffcc3a',mustache:true,face:'grin',vest:'#ffcc3a'},lines:['Welcome to the station. The only fire we fight here is burnt coffee.','Days without a fire: 67. Six… seven. Don\'t start.','Try the pole. Everyone tries the pole.'],barks:['Stay safe!','Pole\'s that way.']});
  });

  /* ---------- Outpulse Labs ---------- */
  /* ---------- Central Jail: 112 cells on four tiers, and one high-security cell ---------- */
  room('jail',{name:'Central Jail',w:26,d:70,h:14.5,wall:'#c9cdd2',floor:'#8f949a',trim:'#c62828',light:'#eef3ff'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;const W_=env.W;
    const n=14,cw=2.6,zA=21,zB=zA-n*cw,TIERS=4,TH=3.2,CD=3;
    const bars=tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#3a3f47';c.fillRect(0,0,w,14);c.fillRect(0,h-14,w,14);c.fillRect(0,h*.52,w,10);c.fillRect(0,0,12,h);c.fillRect(w-12,0,12,h);for(let i=1;i<9;i++)c.fillRect(i*w/9-4,0,8,h);c.fillStyle='#ffcc3a';c.fillRect(w*.42,h*.62,w*.16,12)});
    bars.wrapS=THREE.RepeatWrapping;bars.repeat.set(n,1);const barMat=new THREE.MeshLambertMaterial({map:bars,transparent:true,alphaTest:.5,side:THREE.DoubleSide});
    for(const s of[-1,1]){const back=s<0?x0:x1,front=back-s*CD,inw=-s;
      for(let k=0;k<=n;k++){const z=zA-k*cw;blk(S,Math.min(back,front),Math.max(back,front),0,TIERS*TH,z-.09,z+.09,'#b9bec4')}
      for(let t=0;t<TIERS;t++){const y=t*TH;
        if(t>0){blk(S,Math.min(back,front+inw*1.3),Math.max(back,front+inw*1.3),y-.16,y,zB,zA,'#9aa0a7');const rx=front+inw*1.25;bx(S,rx,y+1.05,(zA+zB)/2,.07,.07,zA-zB,'#c62828');for(let k=0;k<=n;k++)bx(S,rx,y+.52,zA-k*cw,.06,1.04,.06,'#c62828')}
        const m=new THREE.Mesh(new THREE.PlaneGeometry(zA-zB,TH-.2),barMat);m.position.set(front,y+(TH-.2)/2,(zA+zB)/2);m.rotation.y=s<0?PI/2:-PI/2;scene.add(m);
        const nums=tex(2048,64,(c,w,h)=>{c.fillStyle='#1d2027';c.fillRect(0,0,w,h);c.fillStyle='#ffffff';c.font='700 34px '+FONT_T;c.textAlign='center';c.textBaseline='middle';
          for(let k=0;k<n;k++){const id=(s<0?'A':'B')+'-'+(t+1)+String(k+1).padStart(2,'0');const u=s<0?k:n-1-k;c.fillText(id,(u+.5)*w/n,h/2+2)}});
        const np=new THREE.Mesh(new THREE.PlaneGeometry(zA-zB,.34),new THREE.MeshBasicMaterial({map:nums}));np.position.set(front+inw*.03,y+TH-.02,(zA+zB)/2);np.rotation.y=s<0?PI/2:-PI/2;scene.add(np);
        for(let k=0;k<n;k++){const zc=zA-(k+.5)*cw;bx(S,back+inw*.5,y+.42,zc-.3,.9,.3,1.9,'#7d8188');bx(S,back+inw*.5,y+.6,zc-.3,.86,.08,1.8,['#e8692e','#9aa3ad','#e8692e','#5b6370'][(k+t)%4]);bx(S,front-inw*.45,y+.25,zc+.85,.5,.5,.5,'#e9e9e9')}}
      col(Math.min(back,front)-.1,Math.max(back,front)+.1,0,TH,zB,zA)}
    /* lights, signs, a warden at the door */
    for(let z=zB;z<=zA;z+=6)bx(WIN,cx,R.h-.4,z,4,.12,.8,'#ffffff');
    addPlane(scene,12,1.5,signTex('CELL BLOCK A & B · 112 CELLS','#1d1d1d','#ffcc3a',1024,128),[cx,6.5,zA+.6],0,null);
    blk(S,cx+5,cx+9,0,1.1,26,27.4,'#5a5f66');bx(S,cx+7,1.12,26.7,4.1,.06,1.5,'#7d8188');for(const s2 of[-1,1])blk(S,cx+s2*1.3-.15,cx+s2*1.3+.15,0,2.6,24.4,24.8,'#9aa3ad');blk(S,cx-1.45,cx+1.45,2.5,2.8,24.4,24.8,'#9aa3ad');
    col(cx+5,cx+9,0,1.1,26,27.4);
    R.npc({name:'Jailer Saab',x:cx+7,z:28.4,yaw:PI,look:{shirt:'#c9b48a',pants:'#c9b48a',hair:'grey',hat:'#1d3f2a',mustache:true,long:true,face:'flat'},lines:['Welcome to Central Jail. Cell blocks A and B, four tiers, one hundred and twelve cells.','At the far end is the high-security cell. Prisoner: Jiya. Danger level: ten stars.','Rule number one: stay behind the yellow line. Rule number two: see rule number one.'],barks:['Stay behind the yellow line.','Ten stars. Ten!']});
    /* inmates with very serious crimes */
    const INM=[['Biryani Bandit','Put pineapple in a biryani. Unforgivable.'],['Reply-All Rahul','Replied all to a company-wide email. Twice.'],['Filter-Coffee Hater','Said filter coffee is overrated. In Mysuru.'],['Spoiler Sunil','Told everyone the ending of a web series.'],
      ['"K" Kartik','Replied "k" to a long message.'],['Queue Jumper Jai','Cut the line at the chai stall.'],['Seen-Zone Sameer','Left forty people on read.'],['Silent-Mode Simran','Kept the phone on silent forever. Missed a wedding.']];
    INM.forEach(([nm,cr],i)=>{const s=i%2?1:-1,k=1+i*3%(n-1),t=0;R.npc({name:nm+' (inmate)',x:s<0?x0+1.7:x1-1.7,z:zA-(k+.5)*cw,yaw:s<0?PI/2:-PI/2,look:{shirt:'#e8692e',pants:'#e8692e',hair:['short','curly','cap','long','buzz','spiky','short','bun'][i],hat:'#e8692e',face:['smug','flat','grin','smug','flat','grin','calm','flat'][i],seed:200+i},lines:['Crime: '+cr,'Sentence: until I say sorry. I will not say sorry.'],barks:['I am innocent!','Not guilty!','Lawyer!']})});
    for(let i=0;i<10;i++){const s=i%2?1:-1,t=1+(i%3),k=(i*5)%n;R.npc({name:'Inmate',x:s<0?x0+1.7:x1-1.7,y:t*TH,z:zA-(k+.5)*cw,yaw:s<0?PI/2:-PI/2,look:{shirt:'#e8692e',pants:'#e8692e',hair:['short','curly','buzz','bun','spiky'][i%5],seed:300+i},lines:['Shh. The ten-star one is listening.'],barks:['Hey!','Psst!']})}
    /* high-security cell at the far end */
    const zF=-24,c0=cx-7,c1=cx+7;
    blk(S,c0-.6,c0,0,6.2,z0,zF+.3,'#5a5f66');blk(S,c1,c1+.6,0,6.2,z0,zF+.3,'#5a5f66');blk(S,c0-.6,c1+.6,6,6.6,z0,zF+.3,'#5a5f66');
    blk(S,c0,c1,5.3,6,zF-.25,zF+.25,'#2b2d31');blk(S,c0,c1,0,.35,zF-.25,zF+.25,'#2b2d31');bx(S,cx,2.7,zF,14,.16,.36,'#2b2d31');
    for(let x=c0+.25;x<c1;x+=.34)cyl(S,x,2.7,zF,.055,.055,5,'#b71c1c',6);col(c0,c1,0,6,zF-.3,zF+.3);
    blk(S,c0-.6,c0,0,6.2,zF+.3,zF+.31,'#2b2d31',false);
    for(let x=c0,k=0;x<c1;x+=1,k++)bx(S,x+.5,.02,zF+.65,1,.02,.7,k%2?'#141414':'#ffcc3a');
    const lineZ=zF+2.5;bx(S,cx,.025,lineZ,18,.02,.2,'#ffcc3a');
    const dnc=new THREE.Mesh(new THREE.PlaneGeometry(8,.9),new THREE.MeshBasicMaterial({map:signTex('DO NOT CROSS','#ffcc3a','#141414',512,58),transparent:true}));dnc.rotation.x=-PI/2;dnc.position.set(cx,.03,lineZ+.8);scene.add(dnc);
    const lasers=[];for(const y of[.35,.8,1.25]){const m=new THREE.Mesh(new THREE.BoxGeometry(14,.035,.035),new THREE.MeshBasicMaterial({color:'#ff1f1f',transparent:true,opacity:.85}));m.position.set(cx,y,zF+2.1);scene.add(m);lasers.push(m)}
    for(const x of[c0-.2,c1+.2])blk(S,x-.2,x+.2,0,1.6,zF+1.9,zF+2.3,'#2b2d31');
    addPlane(scene,13,1.3,signTex('HIGH SECURITY CELL','#b71c1c','#ffffff',1024,100),[cx,7.4,zF+.33],0,null);
    const star=(c,x,y,r)=>{c.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,rr=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()};
    addPlane(scene,13,1.6,tex(1024,128,(c,w,h)=>{c.fillStyle='#141414';c.fillRect(0,0,w,h);c.fillStyle='#ffffff';c.font='700 40px '+FONT_T;c.textBaseline='middle';c.fillText('DANGER',24,h/2+2);c.fillStyle='#ffcc3a';for(let i=0;i<10;i++)star(c,250+i*76,h/2,32)}),[cx,8.9,zF+.33],0,null);
    R.left(-19,2.6,5.4,4.2,tex(540,420,(c,w,h)=>{c.fillStyle='#f4f1ea';c.fillRect(0,0,w,h);c.fillStyle='#b71c1c';c.fillRect(0,0,w,64);c.fillStyle='#ffffff';c.font='800 36px '+FONT_T;c.fillText('PRISONER CARD',22,44);
      const rows=[['Prisoner','Jiya'],['Crime',"Stole Vashu's heart"],['Sentence','Life'],['Danger level','Life threatening']];c.font='700 24px '+FONT_T;rows.forEach(([a,b],i)=>{c.fillStyle='#6a6a6a';c.fillText(a.toUpperCase(),22,108+i*64);c.fillStyle='#141414';c.font='800 32px '+FONT_T;c.fillText(b,22,140+i*64);c.font='700 24px '+FONT_T});
      c.fillStyle='#ffb300';for(let i=0;i<10;i++)star(c,40+i*50,h-34,20)}));
    /* her cell: plants everywhere */
    blk(S,c0,c1,0,.03,z0,zF-.3,'#6fae4f',false);
    const pot=(x,z,s,lc)=>{cyl(S,x,.3*s,z,.32*s,.24*s,.6*s,'#b5552e',10);bx(S,x,(.75+.2)*s,z,.6*s,.6*s,.6*s,lc,.4);bx(S,x,(1.15)*s,z,.42*s,.42*s,.42*s,lc,1.1)};
    [[c0+.8,z0+.9,1.2,'#3e8f3e'],[c0+2.2,z0+.8,1,'#5cbf5f'],[c1-.8,z0+.9,1.3,'#2f7a3a'],[c1-2.4,z0+.8,.9,'#6fcf6a'],[c0+.8,zF-2,1,'#4fae55'],[c1-.8,zF-2.4,1.1,'#3e8f3e'],[cx+3.4,z0+.8,.8,'#5cbf5f']].forEach(([x,z,s,c])=>pot(x,z,s,c));
    cyl(S,cx-4.2,.4,z0+3.2,.9,.8,.8,'#8a5534',10);cyl(S,cx-4.2,1.7,z0+3.2,.14,.18,2.4,'#6b4a35',8);for(const [dx,dy,dz,sz] of[[0,3.1,0,1.4],[.6,2.7,.3,1],[-.6,2.8,-.2,1.1],[.1,3.6,.2,.9]])bx(S,cx-4.2+dx,dy,z0+3.2+dz,sz,sz,sz,'#3e8f3e',dx);
    bx(S,cx-3.9,3.5,z0+3.6,.22,.18,.32,'#3d7be8');bx(S,cx-3.8,3.52,z0+3.78,.08,.06,.12,'#ffcc3a');
    for(let i=0;i<8;i++)bx(S,c0+1+i*1.6,.28,z0+.35,.3,.3,.3,['#ff5fa2','#ffcc3a','#ffffff','#a463ff'][i%4]);blk(S,c0+.5,c1-.5,0,.18,z0+.1,z0+.6,'#8a5534');
    blk(S,cx+2.2,cx+5.4,0,.55,z0+1.6,z0+3.8,'#6b4a35');bx(S,cx+3.8,.62,z0+2.7,3.1,.14,2.1,'#5cbf5f');bx(S,cx+3.8,.7,z0+1.95,1.1,.16,.6,'#ffffff');
    cyl(S,cx+1.6,.18,zF-1.3,.16,.16,.36,'#3d7be8',10);bx(S,cx+1.9,.3,zF-1.3,.4,.06,.06,'#3d7be8');
    R.back(-2,3,4.2,2.4,posterTex({w:420,h:240,bg:'#5cbf5f',kicker:'Cell rules',title:'Water the plants.',body:'Be kind to trees. Hearts are another matter.'}));
    /* guards and the prisoner */
    for(const s2 of[-1,1])R.npc({name:s2<0?'Guard Kale':'Guard Rathore',x:cx+s2*9.6,z:zF+3.6,yaw:0,look:{shirt:'#2f3a46',pants:'#2f3a46',hair:'cap',hat:'#141414',face:'flat',long:true,shades:true},lines:['Stay behind the yellow line. She took one heart already.','Do not make eye contact. Do not accept plants.','Ten stars. Life sentence. Life-threatening. Any questions? No? Good.'],barks:['Behind the line!','Do not go closer.','Eyes forward.']});
    const J=R.npc({id:'jiya',name:'Jiya',x:cx,z:-28.2,yaw:0,look:{fem:true,hair:'long',hairC:'#0d0d0d',skin:'#e0b48f',shirt:'#2b6fd8',pants:'#141414',shoes:'#f5f5f5',face:'cute'},
      lines:['Hi. Come a little closer?','I only take hearts. Vashu\'s was the first.','My plants are the only ones who visit me. Water them for me? Just come closer.'],barks:['Come closer…','Closer…','My plants need water.','Hi, stranger.']});
    W_.jiya=J;W_.jiyaCell={cx,zF,c0,c1,lineZ,home:{x:cx,z:-28.2},lasers}});

  /* ---------- Meow Club: a cat cafe ---------- */
  room('meow',{name:'Meow Club',w:20,d:14,h:5,wall:'#f6e6fb',floor:'#e8d3c0',trim:'#b56fd1',light:'#fff3fb'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    blk(S,x0+.5,x0+7,0,1.1,z0+.6,z0+1.6,'#7a3f8f');bx(S,x0+3.7,1.13,z0+1.1,6.6,.06,1.1,'#ffffff');bx(S,x0+2,1.45,z0+1.05,.6,.6,.5,'#2b2b2b');cyl(S,x0+4.4,1.25,z0+1.1,.12,.1,.24,'#ffffff',10);col(x0+.5,x0+7,0,1.1,z0+.6,z0+1.6);
    R.back(-3.3,3.1,6,1.4,signTex('MEOW CLUB · CAT CAFE','#7a3f8f','#ffffff',768,180));
    R.npc({name:'Meera (cat barista)',x:x0+3.7,z:z0+.2,yaw:0,look:{shirt:'#ff8fc1',pants:'#26323d',hair:'bun',apron:'#7a3f8f',fem:true},lines:['Welcome to Meow Club! Coffee for you, treats for them.','Rule one: the cats choose you. Rule two: no picking up Biscuit.','Seven cats live here. One of them is guarding something shiny on the cat tower.'],barks:['Meow!','Coffee or cuddles?']});
    for(const [x,z,c] of[[cx-3,-1,'#ffffff'],[cx+1,1.5,'#ff8fc1'],[cx-6,3,'#3d7be8'],[cx+4,-2,'#ffcc3a']]){cyl(S,x,.14,z,.7,.7,.28,c,12);cyl(S,x,.31,z,.62,.62,.06,'#ffffff',12)}
    for(const [x,z] of[[cx-1,4.6],[cx+3.5,4.6]]){cyl(S,x,.38,z,.6,.6,.06,'#ffffff',12);cyl(S,x,.2,z,.06,.06,.4,'#9a9a9a',6);col(x-.6,x+.6,0,.8,z-.6,z+.6)}
    const tower=(x,z,top)=>{cyl(S,x,top/2,z,.12,.12,top,'#d9b48a',8);for(const [y,s] of[[.6,1.1],[top*.6,.9],[top,1.2]])bx(S,x,y,z,s,.12,s,'#b56fd1');col(x-.6,x+.6,0,top,z-.6,z+.6)};tower(x1-2.4,-5.2,1.6);tower(x0+2,4.2,1.2);
    const CATS=[[cx-3,.28,-1,'#f0a24a',0,'loaf'],[cx+1,.28,1.5,'#2b2b2b',1,'sit'],[cx-6,.28,3,'#ffffff',2,'loaf'],[x1-2.4,1.66,-5.2,'#9aa3ad',3,'sit'],[cx+4,.28,-2,'#c48a4a',0,'sit'],[x0+2,1.26,4.2,'#f4f1ea',1,'loaf'],[cx-1,.44,4.6,'#2b2b2b',2,'loaf']];
    for(const [x,y,z,c,d,p] of CATS)catModel(S,x,y,z,c,d,p);
    R.left(-1,2.6,3,2,posterTex({w:300,h:200,bg:'#ff8fc1',kicker:'Meet the cats',title:'Biscuit, Mango, Kaju & 4 more',body:'All rescued. All judging you.'}))});
  room('labs',{name:'Outpulse Labs',w:24,d:16,h:6,wall:'#f2f4f7',floor:'#d9dde3',trim:'#3bd1ff',light:'#f4fbff'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    R.back(0,3.7,12,3.4,tex(1200,340,(c,W_,H_)=>{c.fillStyle='#141414';c.fillRect(0,0,W_,H_);c.fillStyle='#ff6a3d';c.font='400 150px '+FONT_D;c.textAlign='center';c.fillText('WE BUILD IDENTITY',W_/2,190);c.font='600 34px '+FONT_T;c.fillStyle='#f4efe6';c.fillText('OUTPULSE LABS · BRANDS · WEBSITES · APPS',W_/2,268)}),null);
    bx(WIN,cx,5.55,z0+.08,12.4,.08,.08,'#ffffff');for(let x=x0+3;x<x1-2;x+=5)bx(WIN,x,5.9,0,.8,.06,.8,'#ffffff');
    for(let i=0;i<3;i++)for(let j=0;j<2;j++){const x=cx-7+i*7,z=-1.8+j*4;blk(S,x-1.6,x+1.6,0,.95,z-.6,z+.6,'#ffffff');bx(S,x,.97,z,3.3,.04,1.3,'#e4e7ec');
      for(const s2 of[-1,1]){bx(S,x+s2*.8,1.36,z-.36,.9,.55,.04,'#1d1d1d');bx(WIN,x+s2*.8,1.36,z-.33,.8,.45,.01,'#ffffff');bx(S,x+s2*.8,.5,z+.95,.5,.08,.5,'#2b2f36');bx(S,x+s2*.8,.84,z+1.18,.5,.6,.06,'#2b2f36')}}
    R.left(-2.2,3,6,2.6,tex(900,390,(c,W_,H_)=>{c.fillStyle='#f4efe6';c.fillRect(0,0,W_,H_);['#ff6a3d','#141414','#2f5bff','#c9f26b','#ffcc3a','#ff8fc1','#3bd1ff','#d9d4c4'].forEach((k,i)=>{c.fillStyle=k;c.fillRect(30+(i%4)*215,40+Math.floor(i/4)*150,190,120)});c.fillStyle='#141414';c.font='800 30px '+FONT_T;c.fillText('MOODBOARD · DO NOT TOUCH',30,365)}),()=>G.say('Moodboard','Eight colours, zero arguments. Okay, one argument. About orange.'),{reach:6});
    R.right(-3.4,3.2,3.2,2.2,posterTex({w:480,h:330,bg:'#141414',fg:'#f4efe6',kicker:'Founder & COO',title:'Vashudev',body:'Outpulse Labs, since July 2026.',big:66,bs:22}),()=>G.card({n:'Outpulse Labs',tag:'Founder & COO',st:'Since July 2026',d:'A studio that builds identity: brands, websites and apps. Whatever is on the desks right now is under wraps.',href:'',color:'#ff6a3d'}),{reach:7});
    R.right(2.6,2.9,3.4,2,tex(600,360,(c,W_,H_)=>{c.fillStyle='#fbfbfb';c.fillRect(0,0,W_,H_);c.strokeStyle='#9aa3ad';c.lineWidth=10;c.strokeRect(0,0,W_,H_);c.fillStyle='#d7263d';c.font='800 44px '+FONT_T;c.fillText("SOMETHING'S COOKING",34,80);c.fillStyle='#141414';for(let i=0;i<5;i++)c.fillRect(34,120+i*44,180+((i*97)%260),24)}),()=>G.card(COOKING),{reach:6});
    blk(S,x0+.8,x0+4,0,.5,z1-5.2,z1-2.6,'#ff6a3d');blk(S,x0+.8,x0+1.3,.5,1.25,z1-5.2,z1-2.6,'#ff6a3d');G.seats.push({x:x0+2.6,z:z1-3.9,y:.52,yaw:PI/2,label:'Sit on the studio sofa'});blk(S,x0+4.6,x0+5.8,0,.42,z1-4.5,z1-3.3,'#141414');
    blk(S,x1-4,x1-.6,0,1,z1-4.8,z1-3.6,'#141414');bx(S,x1-2.8,1.35,z1-4.2,.8,.7,.6,'#c9ccd1');bx(S,x1-1.6,1.15,z1-4.2,.2,.3,.2,'#ffffff');
    G.triggers.push({x:x1-2.3,z:z1-2.8,r:1.4,label:'Pull a studio espresso',act:()=>{G.host.toast('STUDIO ESPRESSO','Strictly for clients. And for whoever is closest to the machine.');G.player.emote='sip';G.player.emoteT=2.6}});
    for(const [x,z] of[[x0+.8,z0+.8],[x1-.8,z0+.8],[x1-.8,0]])pot(S,x,z,'#141414','#3f9b4a',.7);
    R.npc({name:'Designer Dia',x:x0+2.4,z:-2.2,yaw:PI/2,look:{shirt:'#ff6a3d',pants:'#141414',hair:'bun',glasses:true,face:'smile'},lines:['Welcome to Outpulse Labs. We build identity: logos, websites, apps, the whole vibe.','No, we can\'t make the logo bigger. Okay. A little bigger.','What\'s on the screens? Can\'t say. Something\'s cooking.'],barks:['Kerning!','Make it pop? No.']});
  });

  /* ---------- The Boring Wear ---------- */
  room('boring',{name:'The Boring Wear',w:16,d:12,h:5,wall:'#f5f5f3',floor:'#d8d4cc',trim:'#141414',light:'#ffffff'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    R.back(0,3.6,7,1.1,signTex('THE BORING WEAR','#141414','#f5f5f3',1024,160),null);
    const C=['#141414','#f4f4f2','#9a9a96','#d8c8a8','#1f2a44','#5b6b4f'];
    for(const s2 of[-1,1]){const x=s2<0?x0+.7:x1-.7;bx(S,x,2.15,-.4,.06,.06,8.4,'#777');for(let i=0;i<15;i++){const z=-4.2+i*.54;const c=C[i%C.length];bx(S,x,1.62,z,.55,.85,.05,c);bx(S,x,1.98,z,.75,.18,.05,c);bx(S,x,2.1,z,.04,.1,.02,'#777')}}
    for(const z of[-2.2,1.2]){blk(S,cx-1.4,cx+1.4,0,.85,z-.7,z+.7,'#c9b79a');for(let i=0;i<4;i++)for(let k=0;k<4;k++)bx(S,cx-1+i*.66,.9+k*.07,z,.55,.06,.5,C[(i+k)%C.length])}
    R.back(-5.6,1.7,1.1,2.4,tex(128,256,(x)=>{const g=x.createLinearGradient(0,0,128,256);g.addColorStop(0,'#eef6fb');g.addColorStop(1,'#bcd3e0');x.fillStyle=g;x.fillRect(0,0,128,256);x.strokeStyle='#141414';x.lineWidth=10;x.strokeRect(0,0,128,256)}),()=>{G.player.emote='pose';G.player.emoteT=2.6;G.say('Mirror','Boring fit. Unreasonably good.')},{reach:4});
    blk(S,x1-2.7,x1-.2,0,2.5,z0+.2,z0+.35,'#141414');blk(S,x1-2.7,x1-2.55,0,2.5,z0+.35,z0+2.4,'#141414');bx(S,x1-1.45,1.3,z0+2.38,2.3,2.3,.04,'#9a9a96');
    blk(S,cx+2.6,cx+5.8,0,1,z1-4.2,z1-3.4,'#141414');bx(S,cx+3.4,1.2,z1-3.8,.5,.35,.4,'#2b2b2b');
    for(const [x,c] of[[cx-4.4,'#141414'],[cx-2.6,'#f4f4f2']]){const m=makeChar({skin:'#e9e5dc',shirt:c,pants:'#3a3a3a',shoes:'#e9e5dc',hair:'none',hairC:'#e9e5dc',face:'flat',seed:9});m.position.set(x,.25,z1-4.6);m.rotation.y=PI;scene.add(m);cyl(S,x,.12,z1-4.6,.55,.55,.25,'#c9b79a',16)}
    const card={n:'The Boring Wear',tag:'Clothing',st:'Minimal basics',d:'A minimalist clothing brand: plain colours, good fabric, no shouting. Black, white, grey, sand, navy and a brave olive.',href:'',color:'#141414'};
    G.triggers.push({x:x0+1.8,z:-.4,r:1.6,label:'Browse the rack',act:()=>G.card(card)});G.triggers.push({x:x1-1.8,z:-.4,r:1.6,label:'Browse the rack',act:()=>G.card(card)});
    R.npc({name:'Store staff Kabir',x:cx+4.2,z:z1-4.8,yaw:PI,look:{shirt:'#141414',pants:'#141414',hair:'short',face:'smile'},lines:['Welcome to The Boring Wear. Plain tees, heavy cotton, zero logos shouting at you.','Boring is a feature, not a bug.','Colours today: black, white, grey, sand, navy and a brave olive.'],barks:['Need a size?','Boring is beautiful.']});
  });

  /* ---------- Outpulse Residences: lobbies, lift, floors, flats ---------- */
  for(const T of['A','B'])room('res'+T,{name:'Outpulse Residences · Tower '+T+' lobby',w:22,d:14,h:5,wall:'#efe9df',floor:'#e3ddd0',trim:'#ff6a3d',light:'#fff6ea'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    for(let i=0;i<11;i++)blk(S,x0+i*2,x0+i*2+1.96,0,.012,z0,z1,i%2?'#e9e3d7':'#ddd6c8',false);
    for(const u of[-2,2]){blk(S,cx+u-1.1,cx+u+1.1,0,3,z0,z0+.25,'#9aa3ad');bx(S,cx+u,1.5,z0+.27,.04,3,.02,'#6b737c');bx(WIN,cx+u,3.4,z0+.28,1,.4,.02,'#ffffff')}
    R.back(0,4.1,4.2,.55,signTex('LIFTS · ALL FLOORS','#141414','#ffcc3a',768,100),null);
    G.triggers.push({x:cx,z:z0+1.6,r:2,label:'Take the lift',act:()=>G.lift(T)});
    blk(S,x1-5.2,x1-1,0,1.1,z0+2.6,z0+3.6,'#141414');bx(S,x1-3.1,1.13,z0+3.1,4.3,.06,1.1,'#ff6a3d');
    R.npc({name:'Reception Rekha (Tower '+T+')',x:x1-3.1,z:z0+1.7,yaw:0,look:{shirt:'#ff6a3d',pants:'#141414',hair:'bun',face:'smile'},lines:['Welcome to Outpulse Residences, Tower '+T+'. Ground floor has the shops, flats start on floor 1.','Thirteen floors, two flats each. The lift stops everywhere. Even 13.','Parcels? Mailboxes on the right wall. Gossip? Ask the shop uncle.'],barks:['Good evening!','Parcel for you?']});
    for(let i=0;i<6;i++)for(let j=0;j<5;j++)bx(S,x1-.12,1+j*.42,-2.4+i*.62,.18,.36,.56,j%2?'#c9b37e':'#b89f66');R.right(-.6,3.4,3.6,.5,signTex('MAILBOXES','#efe9df','#141414',512,72),null);
    for(const [u,label,col2,keeper,kl] of[[-5,'DAILY NEEDS','#2e7d32','Shop uncle Manoj',['Milk, bread, eggs. Gossip is free.','Flat 704 ordered three cakes this week. I don\'t ask questions.']],[-.6,'MEDICO · PHARMACY','#1d6fb8','Pharmacist Neha',['Cough syrup, band-aids, sunscreen. Prescription for anything stronger.','Second floor keeps buying ginger tea. Stress, I think.']]]){
      blk(S,x0+.1,x0+.6,0,3.2,u-1.8,u+1.8,'#ffffff');blk(S,x0+.6,x0+2,0,1,u-1.5,u+1.5,col2);R.left(u,3.6,3.4,.5,signTex(label,col2,'#ffffff',512,72),null);
      for(let k=0;k<3;k++)bx(S,x0+.4,1.5+k*.5,u,.3,.06,3.2,'#c9b37e');for(let k=0;k<9;k++)bx(S,x0+.45,1.65+Math.floor(k/3)*.5,u-1.2+(k%3)*1.2,.25,.3,.5,['#ff6a3d','#ffcc3a','#3fa7e0','#5cc46b'][k%4]);
      R.npc({name:keeper,x:x0+1.2,z:u+.2,yaw:PI/2,look:{shirt:col2,pants:'#2b2b2b',hair:'short',face:'smile',apron:'#ffffff'},lines:kl,barks:['Next!','Anything else?']})}
    for(const z of[3.2,5.6]){blk(S,cx+2,cx+6,0,.45,z-.45,z+.45,'#8a6a4a');G.seats.push({x:cx+4,z,y:.48,yaw:PI,label:'Sit in the lobby'})}pot(S,x1-1,z1-1.2,'#141414','#3f9b4a',.8);pot(S,x0+1,z1-1.2,'#141414','#3f9b4a',.8);
  });
  const floorTex=document.createElement('canvas');floorTex.width=256;floorTex.height=128;const fT=new THREE.CanvasTexture(floorTex);fT.colorSpace=THREE.SRGBColorSpace;fT.userData.keep=true;
  const plate=[0,1].map(()=>{const c2=document.createElement('canvas');c2.width=256;c2.height=96;const t=new THREE.CanvasTexture(c2);t.colorSpace=THREE.SRGBColorSpace;t.userData.keep=true;return{c2,t}});
  const drawFloor=()=>{const r2=G.res||{tower:'A',floor:1};const x=floorTex.getContext('2d');x.fillStyle='#141414';x.fillRect(0,0,256,128);x.fillStyle='#ffcc3a';x.font='400 84px '+FONT_D;x.textAlign='center';x.fillText(r2.tower+' · '+r2.floor,128,96);fT.needsUpdate=true;
    plate.forEach((p,i)=>{const y=p.c2.getContext('2d');y.fillStyle='#2b2118';y.fillRect(0,0,256,96);y.fillStyle='#e8d7b0';y.font='800 46px '+FONT_T;y.textAlign='center';y.fillText(r2.tower+'-'+r2.floor+String(i+1).padStart(2,'0'),128,64);p.t.needsUpdate=true})};
  const fl=room('resFloor',{name:'Outpulse Residences',w:16,d:8,h:3.4,wall:'#f3eee4',floor:'#cfc6b4',trim:'#8a6a4a',light:'#fff3e2',exit:false},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    for(const u of[-1.6,1.6]){blk(S,cx+u-1,cx+u+1,0,2.6,z0,z0+.22,'#9aa3ad');bx(S,cx+u,1.3,z0+.24,.04,2.6,.02,'#6b737c')}R.back(0,3,1.4,.7,fT,null);
    G.triggers.push({x:cx,z:z0+1.4,r:1.8,label:'Take the lift',act:()=>G.lift((G.res||{}).tower||'A')});
    [[x0,1],[x1,-1]].forEach(([wx,sd],i)=>{blk(S,wx+sd*.02-(sd<0?.18:0),wx+sd*.02+(sd>0?.18:0),0,2.4,-.7,.7,'#6b3e22');bx(S,wx+sd*.22,1.2,.45,.06,.1,.1,'#c9a227');R[i?'right':'left'](0,2.75,1,.38,plate[i].t,null);bx(S,wx+sd*.9,.02,0,1,.02,1.4,'#8a5a3b');
      G.triggers.push({x:wx+sd*1.3,z:0,r:1.4,get label(){const r2=G.res||{tower:'A',floor:1};return 'Enter flat '+r2.tower+'-'+r2.floor+String(i+1).padStart(2,'0')},act:()=>{G.res.flat=i+1;const r2=G.res;G.rooms.resFlat.name='Flat '+r2.tower+'-'+r2.floor+String(i+1).padStart(2,'0');G.enter('resFlat')}})});
    for(const x of[x0+1.2,x1-1.2])pot(S,x,z1-1,'#8a6a4a','#3f9b4a',.6);for(let x=x0+2;x<x1-1;x+=4)bx(WIN,x,3.3,0,.5,.06,.5,'#ffffff');
  });
  if(fl)fl.refresh=drawFloor;
  const RESIDENTS=[{name:'WFH Wanda',look:{shirt:'#3d7be8',pants:'#2b2b2b',hair:'long',headset:true,face:'flat'},lines:['You\'re on mute. No wait, I\'m on mute.','Floor high enough, the Wi-Fi is perfect. The meetings are not.']},
    {name:'Aunty Sharma',look:{shirt:'#c94f7c',pants:'#7a2d4a',hair:'bun',face:'smile',long:true},lines:['Beta, which flat? New? Married? Salary?','The lift is fast. Gossip is faster.']},
    {name:'Gym Bro Gaurav',look:{shirt:'#141414',pants:'#3a3a3a',hair:'short',face:'grin'},lines:['Leg day. Taking the stairs. All thirteen floors.','Protein shake? I have four. Per hour.']},
    {name:'Plant Parent Pooja',look:{shirt:'#5cc46b',pants:'#6b5a3a',hair:'curly2',face:'smile'},lines:['Forty-seven plants. They all have names.','Don\'t touch Monstera Kumar. He\'s sensitive.']},
    {name:'Night-shift Nikhil',look:{shirt:'#8a63d2',pants:'#2b2b2b',hair:'short',face:'flat'},lines:['Shh. I sleep at 9 AM and wake at 5 PM.','If the lift dings one more time…']}];
  const fr=room('resFlat',{name:'Flat',w:18,d:12,h:3.2,wall:'#f6f1e7',floor:'#c8a67e',trim:'#8a6a4a',light:'#fff1dc',exit:false},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    // two bedrooms at the back corners with doorways, open kitchen between them
    for(const sd of[-1,1]){const xa=sd<0?x0:x1-6,xb=sd<0?x0+6:x1;const wx=sd<0?x0+6:x1-6;blk(S,wx-.1,wx+.1,0,3.2,z0,z0+5.5);const g0=sd<0?xa+2.2:xb-3.4;blk(S,xa,g0,0,3.2,z0+5.4,z0+5.6);blk(S,g0+1.2,xb,0,3.2,z0+5.4,z0+5.6);
      const bxc=(xa+xb)/2;blk(S,bxc-1.3,bxc+1.3,0,.55,z0+.2,z0+2.4,'#ffffff');bx(S,bxc,.62,z0+1.4,2.4,.14,1.9,sd<0?'#3d7be8':'#ff8fc1');bx(S,bxc-.6,.75,z0+.55,.8,.2,.5,'#ffffff');bx(S,bxc+.6,.75,z0+.55,.8,.2,.5,'#ffffff');
      blk(S,sd<0?xa+.1:xb-.7,sd<0?xa+.7:xb-.1,0,2.2,z0+3,z0+5,'#8a6a4a');R.back(bxc-cx,2,2.4,1.3,tex(256,140,(x,W_,H_)=>{const g=x.createLinearGradient(0,0,0,H_);g.addColorStop(0,'#9fd0ff');g.addColorStop(1,'#e8f4ff');x.fillStyle=g;x.fillRect(0,0,W_,H_);x.fillStyle='#b9c7d6';for(let i=0;i<9;i++)x.fillRect(i*30,H_-30-((i*37)%60),24,90);x.strokeStyle='#ffffff';x.lineWidth=8;x.strokeRect(0,0,W_,H_);x.beginPath();x.moveTo(W_/2,0);x.lineTo(W_/2,H_);x.stroke()}),null)}
    blk(S,x0+6.2,x1-6.2,0,1,z0+.1,z0+.8,'#ececec');bx(S,cx,1.02,z0+.45,5.4,.05,.8,'#2b2b2b');blk(S,x1-7.2,x1-6.3,0,2,z0+.1,z0+.9,'#c9ccd1');bx(S,cx-1.4,1.06,z0+.45,.7,.04,.5,'#141414');
    blk(S,cx-1.3,cx+1.3,0,.78,z0+2.4,z0+3.6,'#8a6a4a');for(const [a,b2] of[[-.8,2],[.8,2],[-.8,4],[.8,4]])blk(S,cx+a-.22,cx+a+.22,0,.48,z0+b2-.22,z0+b2+.22,'#5a3f2a');
    cyl(S,x0+3,.02,2,2.2,2.2,.02,'#d9c7a5',24);blk(S,x0+4.4,x0+5.2,0,.45,.2,3.8,'#5b6b7a');blk(S,x0+5,x0+5.2,.45,1.05,.2,3.8,'#5b6b7a');blk(S,x0+2.4,x0+3.4,0,.4,1.2,2.8,'#8a6a4a');
    G.seats.push({x:x0+4.75,z:1.2,y:.48,yaw:-PI/2,label:'Sit on the sofa'});G.seats.push({x:x0+4.75,z:2.8,y:.48,yaw:-PI/2,label:'Sit on the sofa'});
    blk(S,x0+.1,x0+.3,1,2,.6,3.4,'#141414');bx(WIN,x0+.32,1.5,2,.02,.9,2.6,'#ffffff');pot(S,x1-.8,z1-1,'#8a6a4a','#3f9b4a',.7);pot(S,x0+.8,z1-1,'#8a6a4a','#3f9b4a',.7);
    G.triggers.push({x:cx,z:z1-1,r:1.4,label:'Back to the corridor',act:()=>{const r2=G.res;G.rooms.resFloor.name='Tower '+r2.tower+' · Floor '+r2.floor;G.enter('resFloor')}});
    const ppl=RESIDENTS.map(rd=>R.npc(Object.assign({x:cx+3,z:3,yaw:PI*.75,barks:['Hello?','Oh! A visitor.']},rd)));G.rooms.resFlat.people=ppl;
    const forSale=R.back(0,2.2,2.6,1.2,signTex('FOR SALE · SOMETHING\'S COOKING','#ffcc3a','#141414',768,150),null);G.rooms.resFlat.forSale=forSale;
  });
  if(fr)fr.refresh=()=>{const r2=G.res||{tower:'A',floor:1,flat:1};const k=(r2.floor*7+r2.flat*3+(r2.tower==='B'?5:0))%7;(fr.people||[]).forEach((p,i)=>{p.hidden=i!==k});if(fr.forSale)fr.forSale.visible=k>=5};
}

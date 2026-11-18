import {THREE,G,Batch,bx,cyl,col,blk,tex,wrap,signTex,FONT_T,FONT_D,rng,makeChar,CHM} from './core.js';
import {prop,fac,pot,rails,shade,gable,stringLights} from './arch.js';
import {TOWNS,ORDER} from './towns.js';
import {STORY,NUMS,ROLES,SKILLS} from './data.js';
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
  addPlane(scene,8.2,.82,signTex('VASHU MUSEUM','#efe4cc','#5a3b1e',1024,104),[0,7.05,-28.06],0,null);
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
  G.triggers.push({x:0,z:-29.2,y:.6,r:2.2,label:'Enter the Vashu Museum',act:()=>G.enter('museum')});
  G.buildings.push({name:'Vashu Museum',short:'Museum',x0:-11,x1:11,z0:-44,z1:-28,col:'#efe4cc',door:{x:0,z:-24.6},room:'museum'});
  G.blocked.push([-13,13,-47,-23]);
  return{x:0,z:-24.8,fx:0,fz:1}}


/* ---------- welcome arch across an x-road at x ---------- */
function welcomeArch(scene,ctx,x,east,west,col){const {S,LMP,addPlane}=ctx;
  for(const z of[-5.2,5.2]){blk(S,x-.4,x+.4,0,6.6,z-.4,z+.4,col);bx(S,x,6.75,z,1,.3,1,'#f4efe6')}
  blk(S,x-.35,x+.35,5.3,6.6,-5.2,5.2,col,false);for(let z=-4.8;z<=4.8;z+=.6)bx(LMP,x,5.22,z,.12,.12,.12,'#ffffff');
  addPlane(scene,8.6,1.1,signTex(east,col,'#ffffff',1024,130),[x+.37,5.95,0],PI/2,null);addPlane(scene,8.6,1.1,signTex(west,col,'#ffffff',1024,130),[x-.37,5.95,0],-PI/2,null)}

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
function billboard(scene,ctx,x,z,ry,w,h,t){const {S,addPlane}=ctx;const c=Math.cos(ry),sn=Math.sin(ry);for(const s2 of[-1,1]){const px=x+c*s2*(w/2-.4),pz=z-sn*s2*(w/2-.4);blk(S,px-.15,px+.15,0,3+h,pz-.15,pz+.15,'#2c2f36',true)}
  bx(S,x-sn*.08,3+h/2,z-c*.08,Math.abs(c)>.5?w+.3:.12,h+.3,Math.abs(c)>.5?.12:w+.3,'#141414');addPlane(scene,w,h,t,[x,3+h/2,z],ry,null)}
function memeTex(top,big,bg,fg){return tex(900,360,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle=fg;c.font='800 30px '+FONT_T;c.fillText(top,36,58);let sz=170;c.font='400 '+sz+'px '+FONT_D;while(c.measureText(big).width>W-70&&sz>60){sz-=8;c.font='400 '+sz+'px '+FONT_D}c.fillText(big,34,70+sz*.95)})}
function memepura(scene,ctx){const {S}=ctx;
  blk(S,97,104,0,.03,-40,104,'#ecdcaa',false);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshLambertMaterial({color:'#2a86c8'}));sea.rotation.x=-PI/2;sea.position.set(554,.02,30);sea.receiveShadow=true;scene.add(sea);
  for(let z=-36;z<100;z+=6)bx(S,104.3,.04,z+(z%12?1:0),.6,.02,4.6,'#f4f8fb');
  billboard(scene,ctx,32,24.6,PI,6.4,2.4,memeTex('LIVE FROM THE PITCH','SKILL ISSUE?','#8a63d2','#ffffff'));
  billboard(scene,ctx,93.6,34,-PI/2,7,2.6,memeTex('HOW OLD IS THIS BEACH?','SIX SEVEN','#ff8a3d','#141414'));
  billboard(scene,ctx,57,44.6,PI,6.4,2.4,memeTex('PUBLIC SERVICE ANNOUNCEMENT','TOUCH GRASS →','#5cc46b','#141414'));
  G.noGrass.push([96,105,-40,104])}

export function buildLandmarks(scene,ctx){const {on}=ctx;const outs={};G.blocked=G.blocked||[];
  busStop(scene,ctx);
  if(on('kaapikunj')){outs.kunj=kunj(scene,ctx);estate(scene,ctx);welcomeArch(scene,ctx,-18,'WELCOME TO KAAPIKUNJ','KAAPIKUNJ · CUP FIRST','#8b6a4a')}
  if(on('memepura')){memepura(scene,ctx);welcomeArch(scene,ctx,33,'MEMEPURA · VERY ONLINE','WELCOME TO MEMEPURA','#ff3b8d')}
  if(on('vashupur')){outs.museum=museum(scene,ctx);G.noGrass.push([-16.5,16.5,-16.5,16.5],[-11.5,11.5,-31,-24.6],[-7.4,7.4,15.5,18.7])}
  return outs}

/* =================== interiors for the real buildings =================== */
export function extraRooms(room,env){const {scene,addPlane,posterTex,npc,outs}=env;
  const glass=new THREE.MeshBasicMaterial({color:'#cfeaff',transparent:true,opacity:.22,depthWrite:false});
  const tapM=(m,reach,fn)=>{m.userData.tap=fn;m.userData.reach=reach;G.pick.push(m)};
  const model=(fn)=>{const b=new Batch();fn(b);const m=b.mesh(CHM);m.castShadow=true;return m};

  /* ---------- Vashu Museum ---------- */
  room('museum',{name:'Vashu Museum',w:28,d:22,h:9,wall:'#f2ead9',floor:'#d8cdb8',trim:'#9c4a2f',light:'#fff6e6'},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    for(let i=0;i<7;i++)for(let j=0;j<6;j++)blk(S,x0+i*4,x0+i*4+4,0,.015,z0+j*(22/6),z0+(j+1)*(22/6),(i+j)%2?'#efe7d8':'#d6cab3',false);
    for(const x of[cx-9.5,cx+9.5])for(const z of[-6,0,6]){cyl(S,x,4.5,z,.45,.5,9,'#f6eedc',14);bx(S,x,.2,z,1.2,.4,1.2,'#cdbb95');bx(S,x,8.8,z,1.2,.4,1.2,'#cdbb95');col(x-.5,x+.5,0,9,z-.5,z+.5)}
    for(let x=x0+2;x<x1-1;x+=4)bx(WIN,x,8.9,0,.6,.06,.6,'#ffffff');
    R.back(0,6.9,11,1.7,signTex('VASHU MUSEUM · EST. 2023','#9c4a2f','#efe4cc',1024,158),null);
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
}

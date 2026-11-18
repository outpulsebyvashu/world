import {THREE,G,Batch,bx,cyl,col,blk,tex,signTex,FONT_T,FONT_D,rng,CHM} from './core.js';
import {prop,fac,gable,leanTo,banana,pot,lantern,stringLights,rails,shade,scooterGeo} from './arch.js';
import {mark,move} from './relocate.js';
import {inst} from './inst.js';
import {PROJECTS} from './data.js';
const PI=Math.PI;
const PJ=n=>PROJECTS.find(p=>p.n===n)||{n,tag:'',st:'',d:'',href:'',color:'#f4efe6'};

export function palm(B,x,z,h=6,lean=.25,seed=1){const r=rng(seed);let px=x,pz=z,py=0;const a=r()*PI*2;const dx=Math.cos(a)*lean,dz=Math.sin(a)*lean;
  for(let i=0;i<7;i++){const s=.34-i*.02;cyl(B,px,py+h/14,pz,s*.9,s,h/7+.05,i%2?'#8a6a45':'#9c7a52',8);py+=h/7;px+=dx*(i/7);pz+=dz*(i/7)}
  for(let k=0;k<7;k++){const g=new THREE.BoxGeometry(.5,.05,2.6);g.translate(0,0,1.3);g.rotateX(.35+(k%2)*.25);g.rotateY(k*PI*2/7+r());g.translate(px,py+.1,pz);B.add(g,k%2?'#3d9a40':'#4caf50')}
  for(let k=0;k<3;k++)bx(B,px+Math.cos(k*2)*.25,py-.2,pz+Math.sin(k*2)*.25,.28,.3,.28,'#6b4a1f');col(x-.3,x+.3,0,h,z-.3,z+.3)}
export function pine(B,x,z,s=1,snow){inst('pTrunk',x,.7*s,z,s,s,s,0,'#5a3f2a');for(let i=0;i<4;i++){const rr=(1.7-i*.35)*s;inst('pCone',x,(1.5+i*1.05)*s,z,rr,s,rr,i*.7,i%2?'#2f6b45':'#2a5e3d');if(snow&&i===3)inst('pCone',x,(1.5+i*1.05+.5)*s,z,.55*s,.4*s,.55*s,0,'#f5f7fa')}col(x-.25*s,x+.25*s,0,3*s,z-.25*s,z+.25*s);(G.camCols=G.camCols||[]).push({x0:x-1.5*s,x1:x+1.5*s,y0:.8*s,y1:5*s,z0:z-1.5*s,z1:z+1.5*s})}
function apple(B,x,z){cyl(B,x,.9,z,.15,.2,1.8,'#6b4a35',6);bx(B,x,2.4,z,2,1.6,2,'#4f9a45',.3);bx(B,x,3.2,z,1.3,.9,1.3,'#5cae52',.7);const r=rng(Math.floor(x*7+z));for(let i=0;i<10;i++)bx(B,x-1+r()*2,1.8+r()*1.8,z-1.02+(i%2)*2.04,.18,.18,.18,'#e53935');col(x-.25,x+.25,0,1.8,z-.25,z+.25)}

export function buildDistricts(scene,ctx){const {S,WIN,LMP,building,addPlane,bench,W}=ctx;const on=ctx.on;
  const WARM=new Batch(),NEON=new Batch(),GL=new Batch();G.blocked=G.blocked||[];const RB=[S,WIN,LMP,WARM,NEON,GL];const BL=(x0,x1,z0,z1)=>G.blocked.push([x0,x1,z0,z1]);
  const card=c=>G.card(c);const info=(x,z,y,r,label,c)=>G.triggers.push({x,z,y,r,label,act:()=>card(c)});
  G.extraNPCs=G.extraNPCs||[];const outs={};
  const roadSign=(x,z,ry,text,bg='#1f7a4c')=>{const p=prop(S,x,0,z,ry);p.box(-1.4,1.6,0,.12,3.2,.12,'#9aa3ad');p.box(1.4,1.6,0,.12,3.2,.12,'#9aa3ad');const t=signTex(text,bg,'#ffffff',512,128);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8),new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x,3.2,z);m.rotation.y=ry;scene.add(m);if(Math.abs(Math.sin(ry))>.5)col(x-.15,x+.15,0,3.6,z-1.5,z+1.5);else col(x-1.5,x+1.5,0,3.6,z-.15,z+.15)};

  /* ================= MUMBAI — centre ================= */
  if(on('vashupur')){const cpR=mark(scene,RB);const sand='#d9b77e',dk='#c49a5a';
   blk(S,-7.2,-2.4,0,8,15.8,18.4,sand);blk(S,2.4,7.2,0,8,15.8,18.4,sand);blk(S,-2.4,2.4,5.6,8,15.8,18.4,sand,false);
   for(const s of[-1,1]){bx(S,s*2.05,5.1,17.1,.7,1,2.6,sand);bx(S,s*1.45,5.42,17.1,.6,.4,2.6,sand);bx(S,s*.8,5.5,17.1,.8,.2,2.6,sand)}
   for(const x of[-6.4,-4.6,4.6,6.4]){cyl(S,x,9,15.9,.5,.55,2,sand,10);cyl(S,x,9,18.3,.5,.55,2,sand,10);const g=new THREE.SphereGeometry(.55,10,6,0,PI*2,0,PI/2);g.translate(x,10,15.9);S.add(g,dk);const g2=g.clone();g2.translate(0,0,2.4);S.add(g2,dk)}
   blk(S,-7.4,7.4,8,8.35,15.6,18.6,dk,false);for(let x=-7;x<=7;x+=1)bx(S,x,8.6,15.65,.5,.5,.3,sand);for(let x=-7;x<=7;x+=1)bx(S,x,8.6,18.35,.5,.5,.3,sand);
   for(const s of[-1,1])for(const y of[2,4.2])for(const z of[15.75,18.45]){bx(S,s*4.8,y,z,1.2,1.5,.1,dk);bx(S,s*4.8,y+.9,z,.9,.3,.1,dk)}
   const t=signTex('VASHUPUR · EST 2023','#141414','#f4efe6',1024,128);addPlane(scene,8.8,1.1,t,[0,6.9,18.43],0,null);addPlane(scene,8.8,1.1,t,[0,6.9,15.77],PI,null);
   for(let x=-7;x<=7;x+=.7){bx(LMP,x,8.4,15.55,.12,.12,.12,'#ffffff');bx(LMP,x,8.4,18.65,.12,.12,.12,'#ffffff')};move(cpR,[0,17.1],[-53,95.5],0,[])}
  const taxi=(x,z,ry)=>{const p=prop(S,x,0,z,ry);p.box(0,.62,0,1.6,.7,3.6,'#141414');p.box(0,1.25,-.2,1.45,.6,1.9,'#ffd23f');p.box(0,1.25,-.2,1.47,.42,1.7,'#26323d');p.box(0,1.65,-.2,.6,.22,.3,'#ffd23f');
    for(const zz of[1.15,-1.15])for(const s of[-1,1])p.wheel(s*.78,.32,zz,.32,.2);p.box(0,.7,1.82,1.2,.2,.04,'#e8e8e8');const r=Math.abs(Math.sin(ry))>.5;col(x-(r?1.9:.85),x+(r?1.9:.85),0,1.6,z-(r?.85:1.9),z+(r?.85:1.9))};
  if(on('vashupur')){taxi(64,4.9,PI/2);taxi(-39.7,-4.9,-PI/2)}if(on('basti'))taxi(-2.6,40,PI);
  if(on('vashupur')){const cpR=mark(scene,RB);const p=prop(S,22,0,2.7,PI/2);p.box(0,1.45,0,2.5,2.2,10,'#d7263d');p.box(0,3.65,0,2.5,2.1,9.8,'#d7263d');p.box(0,2.58,0,2.52,.12,10,'#f4efe6');p.box(0,4.72,0,2.4,.1,9.6,'#b71c2b');
    for(let i=0;i<6;i++)for(const y of[1.8,3.8])for(const s of[-1,1])p.box(s*1.26,y,-4+i*1.5,.04,.9,1.2,'#26323d');p.box(0,1.8,5.01,2.1,1.1,.04,'#26323d');p.box(0,3.8,5.01,2.1,.9,.04,'#26323d');
    for(const zz of[3.4,-3.2])for(const s of[-1,1])p.wheel(s*1.12,.5,zz,.5,.35);col(17,27,0,4.8,1.45,3.95);
    const d=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.35),new THREE.MeshBasicMaterial({map:signTex('VASHUPUR · LTD','#141414','#ffcc3a',512,100)}));d.position.set(27.02,3.15,2.7);d.rotation.y=PI/2;scene.add(d);move(cpR,[0,0],[19.6,2.4],0,[])}
  if(on('vashupur')){const cpR=mark(scene,RB);const p=prop(S,-12.6,0,12.6,PI*.75);p.box(0,.5,0,1.9,1,1,'#ff8a3d');p.box(0,1.05,0,2,.08,1.1,'#c9ccd1');p.cyl(-.5,1.25,0,.35,.35,.25,'#555',12);p.cyl(-.5,1.4,0,.3,.3,.04,'#d9963b',12);for(let i=0;i<4;i++)p.sph(.2+i*.2,1.18,.2,.1,'#d9963b');
   p.box(0,2.4,0,2.2,.08,1.4,'#e94b3c');for(const s of[-1,1])p.box(s*1,1.7,-.5,.05,1.4,.05,'#555');col(-13.7,-11.5,0,1.2,11.5,13.7);
   G.triggers.push({x:-11.3,z:11.3,r:1.6,label:'Grab a vada pav',act:()=>G.host.toast('VADA PAV','Mumbai\'s burger. ₹20, with dry garlic chutney.')});
   const s2=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.45),new THREE.MeshLambertMaterial({map:signTex('VADA PAV ₹20','#ffcc3a','#e94b3c',512,120),side:THREE.DoubleSide}));s2.position.set(-12.6,2.05,12.6);s2.rotation.y=PI*.75;scene.add(s2);move(cpR,[0,0],[-11.2,11.2],0,[])}
  if(on('vashupur')){const cpR=mark(scene,RB);const p=prop(S,-8,0,9);p.box(0,1.8,0,.16,3.6,.16,'#5a3f2a');const arms=[['VASHU MUSEUM',PI/2,3.3,'#8a6a3a'],['BUS · 5 TOWNS',-PI/2,2.9,'#2f5bff'],['POLICE STN',0,2.5,'#1d3f8f'],['FIRE STN',PI,2.1,'#c62828']];
   for(const [t,a,y,c] of arms){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.38),new THREE.MeshLambertMaterial({map:signTex(t,c,'#ffffff',512,110),side:THREE.DoubleSide}));m.position.set(-8+Math.cos(a)*.95,y,9-Math.sin(a)*.95);m.rotation.y=a;scene.add(m)}col(-8.15,-7.85,0,3.6,8.85,9.15);move(cpR,[0,0],[-7.1,8],0,[])}
  BL(-14,-11,11,14);BL(16,28,0,5);

  /* ================= RAIPUR — north ================= */
  if(on('vashupur')){const cpR=mark(scene,RB);const p=prop(S,14.2,0,-20.6);p.box(0,.2,0,2.6,.4,2.6,'#e6e1d6');p.box(0,.55,0,2,.3,2,'#e6e1d6');p.box(0,5.7,0,1,10,1,'#f4efe6');p.box(0,1.6,0,1.3,1.8,1.3,'#f4efe6');
   p.box(0,9.2,0,1.08,.5,1.08,'#ff9933');p.box(0,8.7,0,1.08,.5,1.08,'#ffffff');p.box(0,8.2,0,1.08,.5,1.08,'#138808');p.box(0,10.9,0,1.4,.3,1.4,'#e6e1d6');p.cone(0,11.6,0,.7,1.2,'#e6e1d6',4);
   col(12.9,15.5,0,11,-21.9,-19.3);addPlane(scene,1.25,.5,signTex('JAI STAMBH CHOWK','#141414','#ffcc3a',512,128),[14.2,1.7,-19.94],0,null);move(cpR,[0,0],[2.8,3.6],0,[])}
  if(on('vashupur')){const cpR=mark(scene,RB);if(G.LOT)building({name:'Spreewalk',x0:-22,x1:-16,z0:-30.5,z1:-26.5,h:3,door:{side:'s',at:-19}});else{const k=prop(S,-19,0,-28.6);k.box(0,1.5,0,4,3,3,'#e94b3c');k.box(0,3.1,0,4.6,.25,3.6,'#ffffff');k.box(0,1.1,1.6,3.6,.12,.6,'#ffffff');k.box(0,1.9,1.52,3,1.3,.06,'#3a1a10');
   k.cyl(0,4.1,0,1.3,1.3,.4,'#d9963b',18);k.cyl(0,3.8,0,1.35,1.35,.2,'#6b3e22',18);k.cyl(0,3.62,0,1.45,1.45,.12,'#ffcc3a',18);k.cyl(0,3.5,0,1.4,1.4,.12,'#4caf50',18);k.cyl(0,3.32,0,1.3,1.3,.24,'#d9963b',18);
   col(-21,-17,0,3.3,-30.1,-27.1);for(const x of[-20.2,-17.8])cyl(S,x,.38,-26.2,.24,.2,.06,'#e94b3c',12);addPlane(scene,3.6,.6,signTex('SPREEWALK · COMING SOON','#ffffff','#e94b3c',512,90),[-19,2.75,-27.04],0,null);
   info(-19,-25.8,0,1.6,'Spreewalk (coming soon)',{n:'Spreewalk',tag:'Future venture',st:'Planned',d:'A burger kiosk planned for Marine Drive, Raipur. Smash patties, quick lines, lakefront vibes.',href:'',color:'#e94b3c'});}
   blk(S,-28,-11,0,.06,-34.6,-31.4,'#3fa7e0',false);rails(S,-28,-11,-31.3,-31.3,0,1,'#9aa3ad',.8);col(-28,-11,0,1.1,-31.5,-31.2);for(let x=-27;x<-11;x+=4)lantern(S,WARM,x,1.4,-31.3);
   addPlane(scene,3.4,.6,signTex('MARINE DRIVE','#1f7a4c','#ffffff',512,90),[-13.4,1.6,-31.1],0,null);BL(-29,-10,-35,-26);move(cpR,[-19.5,-30.5],[145.6,155.1],2,[])}
  // police station
  if(on('vashupur')){const cpR=mark(scene,RB);outs.police=building({real:true,name:'Police Station',x0:16,x1:34,z0:-46,z1:-31,h:7,col:'#f4f1ea',trim:'#1d3f8f',door:{side:'s',at:25},room:'police',win:false,awn:false,doorCol:'#1d3f8f'});
  {const b={x0:16,x1:34,z0:-46,z1:-31},F=fac(b,'s');F.box(S,25,3.6,.05,18,.35,.12,'#1d3f8f');F.box(S,25,3.95,.05,18,.2,.12,'#c62828');
   for(const y of[1.9,5.3])for(const u of[18.4,21,29,31.6])F.box(WIN,u,y,.04,1.6,1.6,.08,'#ffffff');
   addPlane(scene,8,1.2,signTex('VASHUPUR POLICE STATION','#1d3f8f','#ffffff',1024,150),[25,6.1,-30.86],0,null);
   blk(S,23,27,0,.25,-31,-28.6,'#d6d2c8',true);
   const fp=prop(S,17.5,0,-29.5);fp.cyl(0,4,0,.07,.07,8,'#c9ccd1',8);fp.box(0,.2,0,1,.4,1,'#d6d2c8');const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.2),new THREE.MeshLambertMaterial({map:tex(96,64,(x)=>{x.fillStyle='#ff9933';x.fillRect(0,0,96,22);x.fillStyle='#fff';x.fillRect(0,21,96,22);x.fillStyle='#138808';x.fillRect(0,42,96,22);x.strokeStyle='#000080';x.lineWidth=2;x.beginPath();x.arc(48,32,8,0,7);x.stroke()}),side:THREE.DoubleSide}));fl.position.set(18.4,7.3,-29.5);scene.add(fl);W.flag=fl;col(17.3,17.7,0,8,-29.7,-29.3);
   const j=prop(S,30.5,0,-28.6,PI/2);j.box(0,.9,0,1.9,1,4,'#f4f4f4');j.box(0,1.75,-.5,1.8,.8,2.2,'#f4f4f4');j.box(0,1.75,-.5,1.82,.55,2,'#26323d');j.box(0,.95,0,1.92,.22,4.02,'#1d3f8f');for(const zz of[1.3,-1.3])for(const s of[-1,1])j.wheel(s*.9,.42,zz,.42,.28);col(28.5,32.5,0,2.2,-29.6,-27.6);
   W.policeLights=[new THREE.Mesh(new THREE.BoxGeometry(.3,.16,.3),new THREE.MeshBasicMaterial({color:'#ff2d2d'})),new THREE.Mesh(new THREE.BoxGeometry(.3,.16,.3),new THREE.MeshBasicMaterial({color:'#2d6bff'}))];W.policeLights[0].position.set(30,2.25,-28.3);W.policeLights[1].position.set(30,2.25,-28.9);scene.add(...W.policeLights);
   for(const x of[20,22.2])blk(S,x-.9,x+.9,0,1,-29.2,-28.9,'#ffcc3a');BL(15,35,-47,-27)};move(cpR,[0,0],[14,16],0,[outs.police])}
  // fire station
  if(on('vashupur')){const cpR=mark(scene,RB);outs.fire=building({real:true,name:'Fire Station',x0:-46,x1:-30,z0:-46,z1:-30,h:8,col:'#c62828',trim:'#ffffff',door:{side:'s',at:-33},room:'fire',win:false,awn:false,doorCol:'#ffffff'});
  {
   const b={x0:-46,x1:-30,z0:-46,z1:-30},F=fac(b,'s');
   for(const u of[-42.5,-37.5]){F.box(S,u,2.3,.02,4.2,4.6,.1,'#2b2b2b');F.box(S,u,4.75,.12,4.6,.3,.25,'#ffffff');F.box(S,u,2.3,.12,.25,4.6,.2,'#ffffff')}
   const tr=prop(S,-42.5,0,-32.8,0);tr.box(0,1.3,-.4,2.3,1.9,5.4,'#e53935');tr.box(0,1.5,2.6,2.3,2.2,1.6,'#e53935');tr.box(0,1.8,3.42,2,.9,.04,'#26323d');tr.box(0,2.4,-.6,1.9,.12,5,'#c9ccd1');
   for(let i=0;i<6;i++)tr.box(0,2.6,-3+i*.9,1.6,.06,.1,'#c9ccd1');tr.box(0,1.1,0,2.32,.2,7,'#ffffff');for(const zz of[2.4,-.8,-2.4])for(const s of[-1,1])tr.wheel(s*1.1,.5,zz,.5,.36);col(-43.7,-41.3,0,2.8,-36.4,-29.1);
   W.fireLights=new THREE.Mesh(new THREE.BoxGeometry(1.4,.18,.3),new THREE.MeshBasicMaterial({color:'#ff2d2d'}));W.fireLights.position.set(-42.5,2.8,-29.7);scene.add(W.fireLights);
   blk(S,-34,-31,0,12,-45,-42,'#c62828');blk(S,-34.3,-30.7,12,12.4,-45.3,-41.7,'#ffffff',false);for(let y=1;y<12;y+=1.4)bx(WIN,-32.5,y,-41.96,.8,.6,.06,'#ffffff');
   addPlane(scene,7,1,signTex('FIRE STATION · 101','#ffffff','#c62828',1024,150),[-38,6.4,-29.86],0,null);
   const bell=prop(S,-31.4,0,-29.2);bell.box(0,1.2,0,.12,2.4,.12,'#555');bell.cyl(0,2.6,0,.12,.42,.55,'#c9a227',12);col(-31.6,-31.2,0,2.6,-29.4,-29);
   G.triggers.push({x:-31.4,z:-28.2,r:1.5,label:'Ring the fire bell',act:()=>{G.snd&&G.snd.fanfare();W.fireT=6;G.host.egg('ow_fire','You rang the fire bell. Nobody panicked. Mostly.')}});
   blk(S,-46,-30,0,.05,-30,-26.4,'#9aa3ad',false);BL(-47,-29,-47,-26)};move(cpR,[-38,-38],[-62,148],2,[outs.fire])}
  // Construction site — projects under construction
  if(false){const site={x0:40,x1:92,z0:-46,z1:-29};blk(S,40,92,0,.05,-45.7,-29,'#b9a27a',false);
   for(const x of[44,48,52,56])for(const z of[-43,-39,-35])blk(S,x-.25,x+.25,0,7.6,z-.25,z+.25,'#a9a9a9',true);
   for(const y of[3.5,7])blk(S,43.5,56.5,y,y+.3,-43.5,-34.5,'#bdbdbd',false);blk(S,43.5,56.5,0,.3,-43.5,-34.5,'#bdbdbd',true);
   for(const x of[44,48,52,56])for(const z of[-43,-39,-35])for(let k=0;k<3;k++)bx(S,x-.12+k*.12,8.1,z,.04,1,.04,'#7a4a2a');
   for(let x=43;x<=57;x+=2){bx(S,x,4.2,-33.6,.08,8.4,.08,'#ffcc3a');}for(const y of[1.8,3.6,5.4,7.2]){bx(S,50,y,-33.6,14.2,.08,.08,'#ffcc3a');bx(S,50,y-.05,-33.1,14,.06,.8,'#8a5a3b')}
   bx(GL,50,4.2,-33.3,14,8.2,.04,'#4caf50');col(43,57,0,8.4,-33.8,-33.4);
   const m=prop(S,62,0,-41,.4);m.box(0,.6,0,1.6,.5,2.4,'#555');m.cyl(0,1.6,0,.9,.6,1.8,'#ff6a3d',12,PI/2.6);m.wheel(-.8,.35,.8,.35,.2);m.wheel(.8,.35,.8,.35,.2);col(61,63,0,2.3,-42.4,-39.6);
   const sp=new THREE.ConeGeometry(2.2,1.8,10);sp.translate(70,.9,-42);S.add(sp,'#d8c08a');col(68.4,71.6,0,1.4,-43.6,-40.4);
   for(let i=0;i<3;i++)for(let j=0;j<4;j++)for(let k=0;k<3;k++)bx(S,75+i*.5,.15+k*.3,-43+j*.26,.48,.28,.24,'#b5482e');col(74.7,76.3,0,.9,-43.2,-41.9);
   blk(S,82,88,0,2.6,-44.5,-42,'#2f5bff');bx(WIN,85,1.6,-41.96,1.6,1,.06,'#ffffff');addPlane(scene,2.4,.5,signTex('SITE OFFICE','#ffffff','#2f5bff',512,100),[85,2.25,-41.95],0,null);
   blk(S,89,90.2,0,2.4,-44.5,-43.3,'#3d7be8');
   for(let i=0;i<10;i++){const x=58+i*1.9;const g=new THREE.ConeGeometry(.22,.6,8);g.translate(x,.3,-30.6);S.add(g,'#ff6a3d');bx(S,x,.32,-30.6,.3,.08,.3,'#ffffff')}
   for(let x=58;x<77;x+=1)bx(S,x+.5,.85,-30.6,1,.1,.04,Math.floor(x)%2?'#141414':'#ffcc3a');
   const builds=['breadPOS','Outpulse Flow','Dues','Manifold','Outpulse Cloud','Old Green House Cafe'];
   builds.forEach((n,i)=>{const p=PJ(n);const x=44+i*8.2;blk(S,x-3.5,x+3.5,1.2,5,-29.1,-28.9,'#141414');blk(S,x-3.3,x-3.1,0,1.2,-29.1,-28.9,'#141414');blk(S,x+3.1,x+3.3,0,1.2,-29.1,-28.9,'#141414');
     const t=tex(700,380,(c,w,h)=>{c.fillStyle='#ffcc3a';c.fillRect(0,0,w,h);for(let k=-10;k<30;k++){c.fillStyle='#141414';c.beginPath();c.moveTo(k*40,h);c.lineTo(k*40+20,h);c.lineTo(k*40+60,h-40);c.lineTo(k*40+40,h-40);c.fill()}
       c.fillStyle=p.color||'#ffffff';c.fillRect(20,20,w-40,h-90);c.fillStyle=(p.color==='#16224a'||p.color==='#d7263d')?'#ffffff':'#141414';c.font='800 26px '+FONT_T;c.fillText('UNDER CONSTRUCTION · '+(p.st||'').toUpperCase(),44,62);
       let s=84;c.font='800 '+s+'px '+FONT_T;while(c.measureText(n).width>w-90&&s>30){s-=6;c.font='800 '+s+'px '+FONT_T}c.fillText(n,44,62+s+10);c.font='500 24px '+FONT_T;const words=(p.d||'').split(' ');let line='',y=62+s+52;for(const wd of words){if(c.measureText(line+wd).width>w-90){c.fillText(line,44,y);y+=30;line='';if(y>h-100)break}line+=wd+' '}if(y<=h-100)c.fillText(line,44,y)});
     addPlane(scene,7,3.8,t,[x,3.1,-28.86],0,()=>card(p),{reach:8});G.triggers.push({x,z:-27.3,r:1.6,label:'View '+n+' (in build)',act:()=>card(p)})});
   const hook=new THREE.Group();const hb=new Batch();bx(hb,0,-3,0,.04,6,.04,'#333');bx(hb,0,-6.2,0,.5,.4,.3,'#ffcc3a');bx(hb,0,-7,0,2,1.2,1.2,'#b5482e');hook.add(hb.mesh(CHM));hook.position.set(74,15.4,-37.5);scene.add(hook);W.craneHook=hook;
   G.extraNPCs.push({name:'Site engineer Suresh',look:{shirt:'#ff6a3d',pants:'#3a4a6b',hair:'short',hat:'#ffcc3a',vest:'#ffcc3a',face:'smile'},x:60,z:-31.8,yaw:PI,lines:['Under construction. Like my sleep schedule.','breadPOS, Flow, Dues, Manifold, Cloud and a restaurant website. All being built here.','Tap a hoarding to see what each project is.'],barks:['Hard hats only!','Ship it!']},
     {name:'Mason Mani',look:{shirt:'#3d7be8',pants:'#6b5a3a',hair:'curly2',hat:'#ffcc3a',face:'grin'},x:72,z:-36,yaw:-.6,emote:'drum',lines:['Brick by brick. Commit by commit.','The boss says "MVP". I say "Minimum Viable Pillar".'],barks:['Thak thak.','Almost done!']});
   BL(39,93,-47,-27)}

  /* ================= GOA — east ================= */
  if(on('memepura'))for(let x=44;x<94;x+=10.4)palm(S,x,12.2,6+((x*7)%3),.3,Math.floor(x));
  if(on('memepura')){for(const [x,z,h] of[[50,52,6],[47.5,57,6.4],[47.5,63.5,6.8],[52,78,6],[78,74,6.5],[80,50,5.8],[60,48.6,6.2],[73,79,6]])palm(S,x,z,h,.35,Math.floor(x*z));
   const hm=prop(S,46.8,0,60.25);for(let i=0;i<9;i++){const t=i/8;hm.box(0,1.4-Math.sin(t*PI)*.45,-3.25+t*6.5,1,.08,.82,i%2?'#ff6a3d':'#ffcc3a')}G.seats.push({x:46.8,z:60.25,y:1.05,yaw:PI/2,label:'Chill in the hammock'});
   const um=(x,z,c)=>{const p=prop(S,x,0,z);p.cyl(0,1.2,0,.05,.05,2.4,'#ffffff',6);p.cone(0,2.45,0,1.5,.6,c,10,0);p.box(.9,.2,.6,.7,.12,1.8,'#ffffff');col(x-.1,x+.1,0,2.4,z-.1,z+.1)};
   um(54,49.4,'#e94b3c');um(70.5,49,'#3fa7e0');um(53,76.4,'#ffcc3a');um(79.5,62,'#ff8fc1');
   const sh=prop(S,84,0,52);sh.box(0,.2,0,6,.4,5,'#8a5a3b');for(const [a,b2] of[[-2.7,-2.2],[2.7,-2.2],[-2.7,2.2],[2.7,2.2]])sh.box(a,1.6,b2,.2,3,.2,'#6b4a35');sh.cone(0,3.9,0,4.4,1.8,'#c9a26b',4);sh.box(0,1.3,-2.1,5,1,.4,'#6b4a35');sh.box(0,1.85,-2.1,5.2,.1,.6,'#c9a26b');
   for(let i=0;i<4;i++){sh.box(-1.8+i*1.2,.75,1.2,.6,.06,.6,['#ff6a3d','#3fa7e0','#ffcc3a','#5cc46b'][i]);sh.box(-1.8+i*1.2,.55,1.2,.06,.3,.06,'#555')}col(81,87,0,.4,49.5,54.5);col(81.2,86.8,.4,1.8,49.6,50.3);
   stringLights(NEON,[81,2.9,54.4],[87,2.9,54.4],10,.3,['#ff3b8d','#ffcc3a','#3bd1ff']);addPlane(scene,3.6,.6,signTex('SUNSET SHACK','#ff6a3d','#ffffff',512,90),[84,2.4,54.55],0,null);
   G.triggers.push({x:84,z:55.6,r:1.8,label:'Order kokum soda',act:()=>{G.host.toast('SUNSET SHACK','Kokum soda, extra ice. Susegad mode on.');G.player.emote='sip';G.player.emoteT=2.6}});
   const ch=(x0,x1,z0,z1)=>{blk(S,x0,x1,0,7,z0,z1,'#fafafa');gable(S,(x0+x1)/2,(z0+z1)/2,7,x1-x0,z1-z0,2.2,'#b5482e','x',.4,'#fafafa');
     const fx=x0;blk(S,fx-.6,fx,0,10.5,z0+1,z1-1,'#ffffff');for(const z of[z0+1.2,z1-1.2]){blk(S,fx-1,fx+.4,0,12,z-.6,z+.6,'#ffffff');const g=new THREE.ConeGeometry(.75,1.6,4);g.rotateY(PI/4);g.translate(fx-.3,12.8,z);S.add(g,'#3fa7e0')}
     const sh2=new THREE.Shape([new THREE.Vector2(-3.4,0),new THREE.Vector2(3.4,0),new THREE.Vector2(0,2)]);const pg=new THREE.ExtrudeGeometry(sh2,{depth:.6,bevelEnabled:false});pg.rotateY(PI/2);pg.translate(fx-.6,10.5,(z0+z1)/2);S.add(pg,'#ffffff');
     bx(S,fx-.62,4.2,(z0+z1)/2,.1,.2,4.8,'#3fa7e0');bx(S,fx-.62,8.4,(z0+z1)/2,.1,.2,4.8,'#3fa7e0');bx(S,fx-.65,1.6,(z0+z1)/2,.1,3.2,1.8,'#6b3e22');const F=fac({x0:fx-.6,x1,z0,z1},'w');F.arch(S,(z0+z1)/2,3.2,.03,.9,.1,'#6b3e22');
     for(const z of[(z0+z1)/2-2.2,(z0+z1)/2+2.2]){F.box(WIN,z,5.8,.03,.9,1.6,.06,'#ffffff');F.arch(WIN,z,6.6,.03,.45,.06,'#ffffff')}
     const c1=(z0+z1)/2;bx(S,fx-.35,12.9,c1,.15,1.6,.15,'#fafafa');bx(S,fx-.35,13.3,c1,.15,.15,.9,'#fafafa');
     G.buildings.push({name:'Goan chapel',short:'Chapel',x0:x0-1,x1,z0,z1,col:'#fafafa',door:{x:fx-2,z:c1}})};
   if(!G.LOT)ch(86,96,64,76);else building({name:'Goan Chapel',short:'Chapel',x0:85,x1:96,z0:64,z1:76,h:7,door:{side:'w',at:70}});
   const ss=new THREE.Mesh(new THREE.TorusGeometry(13.25,.12,4,48),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.7}));ss.rotation.x=-PI/2;ss.position.set(64,.1,64);scene.add(ss);
   roadSign(16,-12.8,0,'WELCOME TO MEMEPURA','#ff3b8d');BL(80,97,48,80);BL(45,49,56,65)}

  /* ================= MANALI — west ================= */
  if(on('barfii')){blk(S,-92,-72,0,.05,-9,9,'#dfe8ee',false);for(const [x,z,w,d] of[[-88,-6,3,2],[-77,6,2.4,1.6],[-90,5,1.8,1.4],[-74,-7,1.6,1.2]])bx(S,x,.08,z,w,.06,d,'#f5f7fa');
   if(G.LOT)building({name:'Manali Lookout',x0:-91,x1:-83,z0:-8,z1:-2,h:4,door:{side:'s',at:-87}});else{const hx0=-91,hx1=-83,hz0=-8,hz1=-2;for(let y=0;y<4.2;y+=.6)blk(S,hx0,hx1,y,y+.6,hz0,hz1,(y/.6)%2?'#5a3f2a':'#8a8f96',y===0);col(hx0,hx1,0,4.2,hz0,hz1);
   gable(S,(hx0+hx1)/2,(hz0+hz1)/2,4.2,hx1-hx0,hz1-hz0,2,'#5d6470','x',.7,'#5a3f2a');bx(S,-87,2.2,-1.9,1.2,2,.12,'#3a2a1a');bx(WARM,-89.4,2.4,-1.95,.9,.8,.06,'#ffffff');bx(WARM,-84.6,2.4,-1.95,.9,.8,.06,'#ffffff');
   bx(S,-87,3.1,-1.4,7,.12,1.1,'#5a3f2a');for(let x=-90.4;x<=-83.6;x+=.45)bx(S,x,3.5,-.9,.05,.7,.05,'#5a3f2a');bx(S,-87,3.85,-.9,7,.07,.07,'#5a3f2a');
   addPlane(scene,3.4,.6,signTex('MANALI LOOKOUT','#5a3f2a','#f5f7fa',512,90),[-87,4.6,-1.4],0,null);}
   const fireX=-80,fireZ=2;for(let k=0;k<8;k++){const a=k/8*PI*2;bx(S,fireX+Math.cos(a)*.9,.15,fireZ+Math.sin(a)*.9,.4,.3,.4,'#8a8f96',a)}for(let k=0;k<3;k++)bx(S,fireX,.25,fireZ,1.4,.18,.18,'#5a3f2a',k*PI/3);
   const fl=new THREE.Group();for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(.35-k*.08,1-k*.15,6),new THREE.MeshBasicMaterial({color:['#ff6a00','#ffb300','#fff176'][k]}));c.position.set((k-1)*.12,.6,0);fl.add(c)}fl.position.set(fireX,0,fireZ);scene.add(fl);W.bonfire=fl;
   col(fireX-1.1,fireX+1.1,0,.4,fireZ-1.1,fireZ+1.1);
   for(const [x,z,ry] of[[-80,4.4,PI],[-82.4,2,PI/2],[-77.6,2,-PI/2]]){const p=prop(S,x,0,z,ry);p.cyl(0,.25,0,.25,.25,1.8,'#6b4a35',8,0,PI/2);col(x-.9,x+.9,0,.5,z-.3,z+.3);G.seats.push({x,z,y:.5,yaw:ry,label:'Sit by the bonfire'})}
   G.triggers.push({x:fireX,z:fireZ-1.8,r:1.4,label:'Warm your hands',act:()=>{G.host.egg('ow_bonfire','Manali nights. Bonfire. No notifications.');G.player.emote='cheer';G.player.emoteT=2}});
   for(const [x,z] of[[-76,-6.5],[-74.5,6.5],[-91,6.5]])apple(S,x,z);
   const cols=['#3d7be8','#ffffff','#e53935','#43a047','#fdd835'];
   for(const x of[-66,-50,-34])stringLights(S,[x,6.6,-5.6],[x+3,6.6,5.6],18,.8,cols);stringLights(S,[-91,4.6,-2],[-74,2.4,8],20,.6,cols);
   roadSign(-29,-7.6,0,'WELCOME TO BARFII TOWN','#3d6b8f');BL(-93,-71,-10,10)}

  /* ================= MYSURU — south ================= */
  if(on('basti')){const cr='#f1dfb0',rd='#a33a2a';blk(S,-43,-13,0,10,64.6,66.4,cr);blk(S,-43.2,-12.8,10,10.4,64.4,66.6,rd,false);
   for(let x=-41;x<-14;x+=2.6){const F=fac({x0:-43,x1:-13,z0:64.6,z1:66.4},'n');F.box(S,x,9.2,.05,1.8,.12,.1,rd)}
   const dome=(x,y,z,r)=>{const g=new THREE.SphereGeometry(r,16,10,0,PI*2,0,PI/2);g.translate(x,y,z);S.add(g,rd);cyl(S,x,y-r*.15,z,r*1.02,r*1.02,r*.3,cr,16);cyl(S,x,y+r+.4,z,.08,.12,.8,'#c9a227',6);const g2=new THREE.SphereGeometry(.18,8,6);g2.translate(x,y+r+.85,z);S.add(g2,'#c9a227')};
   cyl(S,-28,11.2,65.5,2.4,2.4,2.4,cr,16);dome(-28,12.4,65.5,2.5);for(const x of[-42,-14]){blk(S,x-1.2,x+1.2,0,13,64.3,66.7,cr);dome(x,13,65.5,1.3)}for(const x of[-35,-21]){cyl(S,x,10.9,65.5,.9,.9,1.8,cr,12);dome(x,11.8,65.5,.95)}
   for(let x=-42.5;x<=-13.5;x+=.6)bx(LMP,x,10.5,64.3,.13,.13,.13,'#ffffff');for(let y=0;y<13;y+=.6){bx(LMP,-43.25,y,64.25,.13,.13,.13,'#ffffff');bx(LMP,-12.75,y,64.25,.13,.13,.13,'#ffffff')}
   for(let a=0;a<PI;a+=.16){bx(LMP,-28+Math.cos(a)*2.55,12.4+Math.sin(a)*2.55,63.85,.13,.13,.13,'#ffffff')}
   const sp=prop(S,-7.6,0,23,PI/2);sp.box(0,.5,0,1.9,1,1,'#ffcc3a');sp.box(0,1.05,0,2,.08,1.1,'#8a5a3b');for(let i=0;i<3;i++)for(let j=0;j<2;j++)sp.box(-.6+i*.6,1.2,-.2+j*.4,.5,.15,.35,'#f0b429');sp.box(0,2.4,0,2.2,.08,1.4,'#8b1e2d');for(const s of[-1,1])sp.box(s*1,1.7,-.5,.05,1.4,.05,'#555');
   col(-8.2,-7,0,1.2,22,24);addPlane(scene,1.8,.42,signTex('MYSORE PAK','#8b1e2d','#ffcc3a',512,120),[-6.98,1.9,23],PI/2,null);
   G.triggers.push({x:-6.2,z:23,r:1.5,label:'Taste Mysore Pak',act:()=>G.host.toast('MYSORE PAK','Ghee, gram flour, sugar. Melts the moment it lands.')});
   roadSign(-7.6,17.6,PI/2,'POLITICAL BASTI','#8b1e2d');BL(-44,-12,63,68)}
  // school
  if(on('basti'))outs.school=building({name:'Vashu Town Public School',short:'School',x0:-44,x1:-28,z0:72,z1:88,h:7,col:'#f5d06f',trim:'#8b1e2d',door:{side:'e',at:80},room:'school',roof:'none',win:false,awn:false,doorCol:'#8b1e2d'});
  if(!G.LOT){const b={x0:-44,x1:-28,z0:72,z1:88};gable(S,-36,80,7,16,16,2.6,'#8b1e2d','z',.6,'#f5d06f');
   for(const side of['e','n']){const F=fac(b,side);const L=side==='e'?[73.5,86.5]:[-42.5,-29.5];for(const y of[1.9,5])for(let u=L[0];u<=L[1];u+=2.6){if(side==='e'&&y===1.9&&Math.abs(u-80)<1.6)continue;F.box(WIN,u,y,.04,1.4,1.5,.08,'#ffffff');F.box(S,u,y-.85,.1,1.6,.12,.2,'#8b1e2d')}}
   addPlane(scene,8,1,signTex('VASHU TOWN PUBLIC SCHOOL','#8b1e2d','#f5d06f',1024,128),[-27.86,4.1,80],PI/2,null);
   blk(S,-26,-10,0,.04,72,88,'#d8c7a5',false);
   const sw=prop(S,-22,0,76);sw.box(-1.2,1.4,0,.12,2.8,.12,'#e94b3c');sw.box(1.2,1.4,0,.12,2.8,.12,'#e94b3c');sw.box(0,2.8,0,2.6,.12,.12,'#e94b3c');for(const s of[-.6,.6]){sw.box(s,1.65,0,.03,2.2,.03,'#555');sw.box(s,.55,0,.6,.06,.4,'#3d7be8')}col(-23.3,-20.7,0,2.9,75.9,76.1);
   G.seats.push({x:-22.6,z:76,y:.55,yaw:0,label:'Take a swing'});G.seats.push({x:-21.4,z:76,y:.55,yaw:0,label:'Take a swing'});
   const sl=prop(S,-15,0,79,PI/2);sl.box(0,1.2,-1.4,1,2.4,.6,'#3d7be8');const g=new THREE.BoxGeometry(.9,.1,3.4);g.rotateX(-.62);g.translate(0,1.05,.3);g.rotateY(PI/2);g.translate(-15,0,79);S.add(g,'#ffcc3a');col(-16.7,-15.9,0,2.4,78.5,79.5);
   const hp=prop(S,-12,0,84);hp.box(0,1.8,0,.15,3.6,.15,'#555');hp.box(0,3.6,-.4,1.2,.8,.06,'#ffffff');hp.cyl(0,3.3,-.75,.3,.3,.04,'#e94b3c',12);col(-12.2,-11.8,0,3.6,83.8,84.2);
   blk(S,-10.2,-10,0,1.4,72,77,'#8b1e2d');blk(S,-10.2,-10,0,1.4,83,88,'#8b1e2d');blk(S,-26,-10,0,1.4,88,88.2,'#8b1e2d');blk(S,-26,-10,0,1.4,71.8,72,'#8b1e2d');
   BL(-45,-9,70,90)}
  // Outpulse.EV showroom
  if(on('memepura'))outs.ev=building({name:'Outpulse.EV Showroom',short:'Outpulse.EV',x0:22,x1:38,z0:12.5,z1:22,h:6,col:'#f4f4f4',trim:'#141414',door:{side:'w',at:17},room:'ev',win:false,awn:false,band:false,doorCol:'#d7263d'});
  if(!G.LOT){const b={x0:22,x1:38,z0:12.5,z1:22};for(const side of['w','n','s']){const F=fac(b,side);const L=side==='w'?[13,21.5]:[23,37];const mid=(L[0]+L[1])/2;F.box(WIN,mid,2.4,.04,L[1]-L[0],3.6,.08,'#ffffff');for(let u=L[0];u<=L[1];u+=2.1)F.box(S,u,2.4,.08,.1,3.6,.1,'#141414')}
   addPlane(scene,7,1.1,signTex('OUTPULSE.EV','#d7263d','#ffffff',1024,160),[21.86,5,17],-PI/2,null);
   const tt=new THREE.Group();const tb=new Batch();cyl(tb,0,.12,0,1.6,1.6,.24,'#141414',24);const sc=prop(tb,0,.24,0,0);sc.box(0,.35,0,.5,.12,1.6,'#d7263d');sc.box(0,.9,.72,.1,1.1,.1,'#1d1d1d');sc.box(0,1.42,.72,.9,.08,.08,'#1d1d1d');sc.wheel(0,.25,.72,.25,.16);sc.wheel(0,.25,-.72,.25,.16);
   tt.add(tb.mesh(CHM));tt.position.set(19.4,0,13.4);scene.add(tt);W.evTurntable=tt;col(17.8,21,0,1.8,11.8,15);
   bx(NEON,21.9,5.8,17,.08,.08,8.8,'#ff3b3b');BL(16,39,11,23)}

  /* ===== finalize ===== */
  scene.add(WARM.mesh(W.warmMat));scene.add(NEON.mesh(W.neonMat));
  scene.add(GL.mesh(new THREE.MeshBasicMaterial({vertexColors:true,color:'#bfe3f7',transparent:true,opacity:.35,depthWrite:false})));
  return outs}

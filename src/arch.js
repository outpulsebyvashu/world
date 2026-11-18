import {THREE,G,Batch,bx,cyl,col,blk,tex,wrap,signTex,FONT_T,FONT_D,rng,CHM} from './core.js';
const PI=Math.PI;
export const shade=(c,k=.8)=>{const q=new THREE.Color(c);q.multiplyScalar(k);return '#'+q.getHexString()};

/* ---------- generic helpers ---------- */
export function prop(B,ox,oy,oz,ry=0){const fin=g=>{if(ry)g.rotateY(ry);g.translate(ox,oy,oz);return g};return{
  box(x,y,z,w,h,d,c,rx=0,rz=0,rY=0){const g=new THREE.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);if(rY)g.rotateY(rY);g.translate(x,y,z);B.add(fin(g),c)},
  cyl(x,y,z,r1,r2,h,c,seg=12,rx=0,rz=0){const g=new THREE.CylinderGeometry(r1,r2,h,seg);if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);g.translate(x,y,z);B.add(fin(g),c)},
  sph(x,y,z,r,c,sx=1,sy=1,sz=1,seg=10){const g=new THREE.SphereGeometry(r,seg,Math.max(6,seg-3));g.scale(sx,sy,sz);g.translate(x,y,z);B.add(fin(g),c)},
  cone(x,y,z,r,h,c,seg=4,ry2=PI/4){const g=new THREE.ConeGeometry(r,h,seg);if(ry2)g.rotateY(ry2);g.translate(x,y,z);B.add(fin(g),c)},
  wheel(x,y,z,r,w,c='#1d1d1d'){const g=new THREE.CylinderGeometry(r,r,w,14);g.rotateZ(PI/2);g.translate(x,y,z);B.add(fin(g),c)}}}
export function fac(b,side){const pt=(u,y,n)=>side==='s'?[u,y,b.z1+n]:side==='n'?[u,y,b.z0-n]:side==='e'?[b.x1+n,y,u]:[b.x0-n,y,u];
  const ew=side==='e'||side==='w';
  return{pt,ew,rot:{s:0,n:PI,e:PI/2,w:-PI/2}[side],
    box(B,u,y,n,w,h,d,c){const p=pt(u,y,n);bx(B,p[0],p[1],p[2],ew?d:w,h,ew?w:d,c)},
    dia(B,u,y,n,s,d,c){const p=pt(u,y,n);const g=new THREE.BoxGeometry(s,s,d);g.rotateZ(PI/4);if(ew)g.rotateY(PI/2);g.translate(p[0],p[1],p[2]);B.add(g,c)},
    arch(B,u,y,n,r,d,c){const p=pt(u,y,n);const g=new THREE.CylinderGeometry(r,r,d,14,1,false,-PI/2,PI);g.rotateX(-PI/2);if(ew)g.rotateY(PI/2);g.translate(p[0],p[1],p[2]);B.add(g,c)},
    plane(scene,u,y,n,w,h,map,o={}){const p=pt(u,y,n);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map,transparent:!!o.t,alphaTest:o.t?.3:0}));m.position.set(p[0],p[1],p[2]);m.rotation.y={s:0,n:PI,e:PI/2,w:-PI/2}[side];scene.add(m);return m}}}
export function gable(B,cx,cz,y,W,D,rise,c,axis='x',over=.6,wallC){const ry=axis==='x'?0:PI/2,w=axis==='x'?W:D,d=axis==='x'?D:W;const half=d/2+over,L=Math.hypot(half,rise),a=Math.atan2(rise,half);
  const add=(g,cc)=>{if(ry)g.rotateY(ry);g.translate(cx,y,cz);B.add(g,cc)};
  for(const s of[1,-1]){const g=new THREE.BoxGeometry(w+over*2,.22,L);g.rotateX(s*a);g.translate(0,rise/2+.06,s*half/2);add(g,c);
    for(let k=1;k<6;k++){const t=k/6;const g2=new THREE.BoxGeometry(w+over*2,.07,.14);g2.rotateX(s*a);g2.translate(0,rise*(1-t)+.2,s*t*half);add(g2,shade(c,.78))}}
  const r=new THREE.BoxGeometry(w+over*2+.1,.26,.42);r.translate(0,rise+.14,0);add(r,shade(c,.7));
  if(wallC){const sh=new THREE.Shape([new THREE.Vector2(-d/2,0),new THREE.Vector2(d/2,0),new THREE.Vector2(0,rise)]);const g=new THREE.ExtrudeGeometry(sh,{depth:w,bevelEnabled:false});g.translate(0,0,-w/2);g.rotateY(PI/2);add(g,wallC)}}
export function leanTo(B,x0,x1,zWall,zOut,yHigh,yLow,c){const d=zOut-zWall,L=Math.hypot(d,yHigh-yLow),a=Math.atan2(yHigh-yLow,Math.abs(d));const g=new THREE.BoxGeometry(x1-x0,.18,L);g.rotateX(Math.sign(d)*a);g.translate((x0+x1)/2,(yHigh+yLow)/2,(zWall+zOut)/2);B.add(g,c);
  for(let k=1;k<5;k++){const t=k/5;const g2=new THREE.BoxGeometry(x1-x0,.06,.12);g2.rotateX(Math.sign(d)*a);g2.translate((x0+x1)/2,yHigh-(yHigh-yLow)*t+.13,zWall+d*t);B.add(g2,shade(c,.78))}}
export function banana(B,x,z,s=1){const p=prop(B,x,0,z);p.cyl(0,1.2*s,0,.14*s,.2*s,2.4*s,'#7a8f3a',8);for(let k=0;k<6;k++){const g=new THREE.BoxGeometry(.55*s,.04,2.2*s);g.translate(0,0,1.1*s);g.rotateX(-.35-(k%2)*.35);g.rotateY(k*PI/3+.3);g.translate(x,2.35*s,z);B.add(g,k%2?'#4caf50':'#3d9a40')}}
export function pot(B,x,z,c='#b5552e',plant='#3f9b4a',h=.6){cyl(B,x,h/2,z,.32,.24,h,c,10);bx(B,x,h+.35,z,.55,.6,.55,plant,.4);bx(B,x,h+.7,z,.35,.4,.35,shade(plant,1.15),.9)}
export function lantern(B,WARM,x,y,z){bx(B,x,y+.55,z,.08,.25,.08,'#1d1d1d');bx(B,x,y+.42,z,.42,.06,.42,'#1d1d1d');bx(WARM,x,y,z,.34,.66,.34,'#ffffff');bx(B,x,y-.36,z,.42,.06,.42,'#1d1d1d')}
export function stringLights(B,a,b,n,sag,cols){for(let i=0;i<=n;i++){const t=i/n;const x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,y=a[1]+(b[1]-a[1])*t-Math.sin(t*PI)*sag;bx(B,x,y,z,.13,.17,.13,cols[i%cols.length])}}
export function rails(B,x0,x1,z0,z1,y,h,c,step=.5,glass){const along=Math.abs(x1-x0)>Math.abs(z1-z0);const L=along?x1-x0:z1-z0;
  if(along)bx(B,(x0+x1)/2,y+h,z0,x1-x0,.07,.07,c);else bx(B,x0,y+h,(z0+z1)/2,.07,.07,z1-z0,c);
  if(glass){if(along)bx(glass,(x0+x1)/2,y+h/2,z0,x1-x0,h-.1,.04,'#ffffff');else bx(glass,x0,y+h/2,(z0+z1)/2,.04,h-.1,z1-z0,'#ffffff');return}
  for(let t=0;t<=L+1e-6;t+=step){if(along)bx(B,x0+t,y+h/2,z0,.05,h,.05,c);else bx(B,x0,y+h/2,z0+t,.05,h,.05,c)}}

/* ---------- textures ---------- */
const wallArt={
  coffee:()=>tex(1024,512,(x,W,H)=>{x.fillStyle='#ff6a3d';x.fillRect(0,0,W,H);x.fillStyle='#ffcc3a';for(let i=0;i<9;i++){x.beginPath();x.arc(80+i*115,430+Math.sin(i)*30,60,0,7);x.fill()}
    x.fillStyle='#f4efe6';x.fillRect(520,150,300,230);x.beginPath();x.ellipse(670,150,150,30,0,0,7);x.fill();x.fillStyle='#6b3e22';x.beginPath();x.ellipse(670,152,128,22,0,0,7);x.fill();x.strokeStyle='#f4efe6';x.lineWidth=30;x.beginPath();x.arc(830,250,60,-1.2,1.2);x.stroke();
    x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=12;for(let i=0;i<3;i++){x.beginPath();x.moveTo(620+i*50,120);x.bezierCurveTo(600+i*50,80,650+i*50,60,625+i*50,20);x.stroke()}
    x.fillStyle='#141414';x.font='400 96px '+FONT_D;x.fillText('CUP FIRST,',40,130);x.fillText('THEN THE',40,230);x.fillText('NUMBERS.',40,330)}),
  graffiti:()=>tex(1024,512,(x,W,H)=>{x.fillStyle='#e9ecef';x.fillRect(0,0,W,H);const r=rng(9);for(let i=0;i<40;i++){x.fillStyle=['#ff3b8d','#3bd1ff','#c9f26b','#ffcc3a','#a463ff'][i%5];x.globalAlpha=.35;x.beginPath();x.arc(r()*W,r()*H,10+r()*50,0,7);x.fill()}x.globalAlpha=1;
    x.font='400 170px '+FONT_D;x.lineJoin='round';x.textAlign='center';x.lineWidth=30;x.strokeStyle='#141414';x.strokeText('VASHU',W/2,230);x.strokeText('TOWN',W/2,420);const g=x.createLinearGradient(0,60,0,440);g.addColorStop(0,'#ff3b8d');g.addColorStop(.5,'#ffcc3a');g.addColorStop(1,'#3bd1ff');x.fillStyle=g;x.fillText('VASHU',W/2,230);x.fillText('TOWN',W/2,420);
    x.fillStyle='#fff';for(let i=0;i<8;i++){x.beginPath();x.arc(150+i*100,60+(i%2)*400,8,0,7);x.fill()}}),
  waves:()=>tex(1024,512,(x,W,H)=>{x.fillStyle='#1f3a5f';x.fillRect(0,0,W,H);x.strokeStyle='#f3eee6';x.lineWidth=8;for(let row=0;row<8;row++)for(let i=0;i<14;i++){const cx=i*80+(row%2)*40,cy=row*70+40;for(let k=3;k>0;k--){x.beginPath();x.arc(cx,cy,k*12,PI,0);x.stroke()}}
    x.fillStyle='#e94b3c';x.beginPath();x.arc(820,140,80,0,7);x.fill();x.fillStyle='#f3eee6';x.font='800 64px '+FONT_T;x.fillText('TOKI',70,470)}),
  waffle:()=>tex(1024,512,(x,W,H)=>{x.fillStyle='#ffd23f';x.fillRect(0,0,W,H);for(let i=0;i<6;i++){const cx=120+i*160,cy=150+(i%2)*190;x.fillStyle='#e8a33c';x.fillRect(cx-60,cy-60,120,120);x.fillStyle='#c9822a';for(let a=0;a<3;a++)for(let b=0;b<3;b++)x.fillRect(cx-50+a*38,cy-50+b*38,26,26);x.fillStyle='#7a3e12';x.fillRect(cx-40,cy-64,80,22);x.fillRect(cx-10,cy-42,16,40)}x.fillStyle='#e94b3c';x.font='400 80px '+FONT_D;x.fillText('SYRUP IS A LIFESTYLE',60,490)}),
  biryani:()=>tex(1024,512,(x,W,H)=>{x.fillStyle='#7a2e1b';x.fillRect(0,0,W,H);for(let i=0;i<5;i++){const cx=110+i*200;x.fillStyle='#c1693c';x.beginPath();x.ellipse(cx,330,85,95,0,0,7);x.fill();x.fillStyle='#e94b3c';x.fillRect(cx-70,220,140,30);x.strokeStyle='#ffd8a8';x.lineWidth=6;for(let k=0;k<3;k++){x.beginPath();x.moveTo(cx-20+k*20,200);x.bezierCurveTo(cx-40+k*20,150,cx+k*20,120,cx-20+k*20,80);x.stroke()}}x.fillStyle='#ffcc3a';x.font='400 76px '+FONT_D;x.fillText('SLOW-COOKED IN CLAY',80,480)})};
function rangoli(){return tex(256,256,(x)=>{x.clearRect(0,0,256,256);x.translate(128,128);const C=['#e94b3c','#ffcc3a','#3d7be8','#ffffff','#ff8fc1'];for(let r=5;r>0;r--){x.fillStyle=C[r%5];for(let k=0;k<8;k++){x.save();x.rotate(k*PI/4);x.beginPath();x.ellipse(0,-r*20,10+r*3,r*12,0,0,7);x.fill();x.restore()}}x.fillStyle='#fff';x.beginPath();x.arc(0,0,14,0,7);x.fill()})}
function norenTex(){return tex(512,256,(x,W,H)=>{x.fillStyle='#1f3a5f';x.fillRect(0,0,W,H);x.fillStyle='#f3eee6';x.font='800 120px '+FONT_T;x.textAlign='center';x.fillText('TOKI',W/2,150);x.font='600 30px '+FONT_T;x.fillText('SPECIALTY COFFEE',W/2,215);x.fillStyle='#1f3a5f';for(let i=1;i<4;i++)x.fillRect(i*W/4-3,150,6,H)})}
function canTex(){return tex(512,256,(x,W,H)=>{x.fillStyle='#141414';x.fillRect(0,0,W,H);x.fillStyle='#ff6a3d';x.fillRect(0,H*.62,W,H*.12);x.fillStyle='#f4efe6';x.font='400 110px '+FONT_D;x.textAlign='center';x.fillText('FLTTR',W/4,130);x.fillText('FLTTR',W*.75,130);x.font='700 22px '+FONT_T;x.fillText('PREMIUM CANNED COFFEE',W/4,220);x.fillText('PREMIUM CANNED COFFEE',W*.75,220)})}
function menuTex(lines,bg='#1d1d1d',fg='#f4efe6',title){return tex(256,320,(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.strokeStyle='#8a5a3b';x.lineWidth=12;x.strokeRect(0,0,W,H);x.fillStyle=fg;x.font='400 40px '+FONT_D;x.textAlign='center';x.fillText(title,W/2,58);x.font='600 22px '+FONT_T;x.textAlign='left';lines.forEach((l,i)=>x.fillText(l,24,110+i*38))})}

/* =================== the town's architecture =================== */
export function buildArch(scene,ctx){const {S,WIN,LMP,building,addPlane,bench,model,card}=ctx;const on=ctx.on;
  const WARM=new Batch(),NEON=new Batch(),GL=new Batch();const outs={};G.blocked=G.blocked||[];const BL=(x0,x1,z0,z1)=>G.blocked.push([x0,x1,z0,z1]);
  const info=(x,z,y,r,label,c)=>G.triggers.push({x,z,y,r,label,act:()=>card(c)});

  /* ===== OUTPULSE LABS HQ — futuristic ===== */
  if(!G.LOT)outs.hq=building({name:'Outpulse Labs HQ',short:'HQ',x0:-12,x1:12,z0:-46,z1:-24,h:15,col:'#f2f4f7',trim:'#ffffff',door:{side:'s',at:0},room:'hq',walkRoof:true,win:false,awn:false,band:false,doorCol:'#1d2733'});
  if(!G.LOT){const b={x0:-12,x1:12,z0:-46,z1:-24};
   for(const [x,z] of[[-12,-24],[12,-24],[-12,-46],[12,-46]]){cyl(S,x,7.6,z,1.9,1.9,15.2,'#ffffff',20);for(let y=1.2;y<15;y+=3.6)cyl(NEON,x,y,z,1.94,1.94,.1,'#3bd1ff',20)}
   for(const side of['s','e','w']){const F=fac(b,side);const L=side==='s'?[-10,10]:[-44,-26];const mid=(L[0]+L[1])/2,len=L[1]-L[0];
     for(const y of[2.4,6,9.6]){if(side==='s'&&y===2.4){F.box(WIN,-6.5,y,.03,5,1.7,.1,'#ffffff');F.box(WIN,6.5,y,.03,5,1.7,.1,'#ffffff')}else F.box(WIN,mid,y,.03,len,1.7,.1,'#ffffff');
       F.box(NEON,mid,y+1.02,.08,len,.08,.08,'#3bd1ff');F.box(S,mid,y-1.0,.12,len,.18,.3,'#dfe3e8');for(let u=L[0]+2;u<L[1];u+=2.2)F.box(S,u,y,.1,.12,1.7,.16,'#cfd6de')}}
   blk(S,-7.5,7.5,4.05,4.3,-24,-18.5,'#ffffff',false);bx(NEON,0,4.0,-18.6,15,.06,.08,'#3bd1ff');bx(NEON,-7.45,4.0,-21.2,.08,.06,5.4,'#3bd1ff');bx(NEON,7.45,4.0,-21.2,.08,.06,5.4,'#3bd1ff');
   cyl(S,-6.6,2,-19.2,.16,.16,4,'#cfd6de',10);cyl(S,6.6,2,-19.2,.16,.16,4,'#cfd6de',10);col(-6.8,-6.4,0,4,-19.4,-19);col(6.4,6.8,0,4,-19.4,-19);
   bx(WIN,0,1.6,-23.96,5.6,3.2,.1,'#ffffff');for(const u of[-2.8,0,2.8])bx(S,u,1.6,-23.88,.12,3.2,.14,'#1d2733');bx(S,0,3.25,-23.88,5.8,.12,.14,'#1d2733');
   blk(S,-9,9,0,.14,-24,-19.5,'#e6e9ee',true);blk(S,-8,8,.14,.28,-24,-21.5,'#eef1f4',true);
   for(const x of[-8.5,8.5]){blk(S,x-.7,x+.7,0,.7,-18.8,-17.4,'#ffffff');bx(S,x,1.2,-18.1,1,.8,1,'#4fae55',.4);bx(S,x,1.75,-18.1,.6,.5,.6,'#5cbf5f',.9)}
   const neko=new Batch();model(neko,'OS-NEKO','#16224a');const nm=neko.mesh(CHM);nm.scale.setScalar(1.7);nm.position.set(-5,0,-18.6);nm.rotation.y=.5;nm.castShadow=true;scene.add(nm);col(-5.8,-4.2,0,1.6,-19.4,-17.8);
   info(-5,-17.2,0,1.6,'Meet OS-NEKO',{n:'OS-NEKO',tag:'Robotics',st:'Concept',d:'A delivery robot for café-to-café and campus runs. This one is on guard duty.',href:'',color:'#16224a'});
   blk(S,9,9.4,15,21,-43,-42.6,'#cfd6de',false);cyl(NEON,9.2,21.2,-42.8,.22,.22,.4,'#ff3b3b',10);
   const holo=new THREE.Mesh(new THREE.TorusGeometry(3.2,.18,8,48),new THREE.MeshBasicMaterial({color:'#3bd1ff',transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));holo.position.set(-6,18.2,-41);scene.add(holo);
   const holo2=new THREE.Mesh(new THREE.TorusGeometry(2.3,.12,8,40),holo.material);holo2.position.copy(holo.position);scene.add(holo2);ctx.W.holo=[holo,holo2];cyl(S,-6,15.4,-41,1.2,1.4,.8,'#dfe3e8',16);
   addPlane(scene,18,3,signTex('OUTPULSE LABS','#141414','#3bd1ff',1024,170),[0,12.6,-23.86],0,null)}

  /* ===== TOKI — Japanese-minimal specialty coffee + studio above ===== */
  if(on('kaapikunj')){outs.cafe=building({real:true,name:'TOKI',short:'TOKI',x0:-40,x1:-22,z0:-22,z1:-8,h:4.2,col:'#f3eee6',trim:'#8b6a4a',door:{side:'s',at:-31},room:'cafe',roof:'none',win:false,awn:false,band:false,doorCol:'#5a3f2a'});
  {const b={x0:-40,x1:-22,z0:-22,z1:-8},F=fac(b,'s');
   for(let u=-39.7;u<-22.2;u+=.32){if(Math.abs(u+31)<1.3)continue;if(u>-37.6&&u<-32.6)continue;if(u>-29.4&&u<-24.4)continue;F.box(S,u,2.1,.08,.14,4.2,.12,'#c89b6d')}
   for(const u0 of[-35.1,-26.9]){F.box(WIN,u0,1.9,.04,4.8,2.9,.08,'#ffffff');F.box(S,u0,.25,.12,5,.5,.25,'#8b6a4a');F.box(S,u0,3.4,.12,5,.14,.2,'#5a3f2a');F.box(S,u0,1.9,.12,.1,2.9,.12,'#5a3f2a')}
   blk(S,-40.4,-21.6,4.05,4.25,-22.4,-7.4,'#3b3f46',false);bx(S,-31,4.0,-7.45,18.8,.18,.12,'#5a3f2a');
   const nr=F.plane(scene,-31,2.1,.22,1.9,.95,norenTex());nr.material.side=THREE.DoubleSide;F.box(S,-31,2.62,.22,2.2,.06,.06,'#5a3f2a');
   for(const u of[-33.2,-28.8])lantern(S,WARM,F.pt(u,2.6,.5)[0],2.6,-7.4);
   blk(S,-39.6,-33,0,.08,-7.9,-6.6,'#d8d2c4',false);for(let i=0;i<9;i++)bx(S,-39.2+i*.72,.1,-7.3+(i%2)*.4,.3,.12,.22,'#9aa3ad');bx(S,-37.6,.25,-7.2,.6,.4,.5,'#7a7f86');bx(S,-35.1,.18,-7,.4,.28,.4,'#8a8f96');
   const mp=prop(S,-24.8,0,-6.9);mp.cyl(0,1.1,0,.12,.16,2.2,'#5a3f2a',8);mp.box(0,2.5,0,1.8,1,1.6,'#d94b3b',0,0,.4);mp.box(.3,3.1,.2,1.2,.7,1.1,'#e8634f',0,0,.9);col(-25,-24.6,0,2,-7.1,-6.7);
   const bn=prop(S,-29,0,-7.3);bn.box(0,.45,0,2,.1,.5,'#c89b6d');bn.box(-.8,.22,0,.1,.44,.4,'#5a3f2a');bn.box(.8,.22,0,.1,.44,.4,'#5a3f2a');col(-30,-28,0,.5,-7.55,-7.05);G.seats.push({x:-29,z:-7.3,y:.5,yaw:0,label:'Sit outside TOKI'});
   const art=fac(b,'w');art.plane(scene,-15,2.2,.05,10,3.8,wallArt.waves());
   blk(S,-38,-24,4.2,7.8,-22,-12,'#f3eee6');
   const U=fac({x0:-38,x1:-24,z0:-22,z1:-12},'s');for(let u=-37.7;u<-24.2;u+=.32){if(Math.abs(u+31)<1)continue;if(u>-36.4&&u<-33.4)continue;if(u>-28.6&&u<-25.6)continue;U.box(S,u,6,.07,.12,3.6,.1,'#c89b6d')}
   for(const u of[-34.9,-27.1]){U.box(WARM,u,6.1,.03,2.8,1.8,.06,'#ffffff');U.box(S,u,6.1,.08,.08,1.8,.1,'#5a3f2a');U.box(S,u,5.15,.1,3,.1,.2,'#5a3f2a')}
   U.box(S,-31,5.4,.04,1.3,2.4,.08,'#5a3f2a');
   gable(S,-31,-17,7.8,14,10,1.7,'#3b3f46','x',.9,'#f3eee6');
   rails(S,-40,-22,-8.1,-8.1,4.2,1,'#5a3f2a',.45);rails(S,-39.9,-39.9,-22,-8,4.2,1,'#5a3f2a',.45);rails(S,-40,-22,-21.9,-21.9,4.2,1,'#5a3f2a',.45);rails(S,-22.1,-22.1,-12,-8,4.2,1,'#5a3f2a',.45);
   col(-40,-22,4.2,5.25,-8.2,-8);col(-40,-39.8,4.2,5.25,-22,-8);col(-40,-22,4.2,5.25,-22,-21.8);col(-22.2,-22,4.2,5.25,-12,-8);
   stringLights(LMP,[-39.8,5.3,-8.1],[-31,5.3,-8.1],12,.45,['#ffffff']);stringLights(LMP,[-31,5.3,-8.1],[-22.2,5.3,-8.1],12,.45,['#ffffff']);
   for(const x of[-38.8,-36.5,-25.4,-23.2])pot({add:(g,c)=>S.add(g.translate(0,4.2,0),c)},x,-9,'#8b6a4a','#3f9b4a',.5);
   const ch=prop(S,-29.5,4.2,-9.8);ch.box(0,.45,0,.6,.08,.6,'#c89b6d');ch.box(0,.75,-.27,.6,.55,.06,'#c89b6d');for(const a of[-.25,.25])for(const c2 of[-.25,.25])ch.box(a,.22,c2,.05,.44,.05,'#5a3f2a');G.seats.push({x:-29.5,z:-9.75,y:4.68,yaw:0,label:'Sit on the balcony'});
   for(let i=0;i<12;i++){const y=(i+1)*.35,z0=-7-(i+1)*.67,z1=-7-i*.67;blk(S,-21.8,-20.2,0,y,z0,z1,i%2?'#c89b6d':'#b8895c')}
   blk(S,-22.4,-20.2,0,4.2,-17.4,-15.04,'#b8895c');rails(S,-20.15,-20.15,-15.04,-7,0,1,'#5a3f2a',.67);for(let i=0;i<12;i++){}
   col(-20.2,-20.05,0,5.4,-17.4,-7);
   G.triggers.push({x:-31,z:-10.3,y:4.2,r:1.6,label:'Enter my studio',act:()=>G.enter('home')});
   outs.home={x:-31,y:4.2,z:-10.6,fx:0,fz:1};G.buildings.push({name:"Vashu's studio (above TOKI)",short:'My studio',x0:-38,x1:-24,z0:-22,z1:-12,col:'#c89b6d',door:{x:-21,z:-6.4},room:'home',upper:true});
   BL(-41,-19,-23,-5)}}

  /* ===== GOTHIC — dark gothic boutique ===== */
  if(on('memepura'))outs.gothic=building({name:'Gothic Bakehouse',short:'Gothic',x0:22,x1:36,z0:-22,z1:-8,h:7,col:'#2e2a2d',trim:'#1d1a1c',door:{side:'s',at:29},room:'gothic',win:false,awn:false,doorCol:'#1d1a1c'});
  if(!G.LOT){const b={x0:22,x1:36,z0:-22,z1:-8},F=fac(b,'s');
   for(const u of[24.9,33.1]){F.box(WARM,u,1.9,.04,2.6,2.6,.08,'#ffffff');F.dia(WARM,u,3.2,.04,1.84,.08,'#ffffff');F.box(S,u,1.9,.1,.08,2.6,.1,'#141414');F.box(S,u,1.9,.1,2.6,.08,.1,'#141414');F.box(S,u,.5,.25,3,.18,.5,'#141414');
     for(let i=0;i<5;i++)F.box(S,u-1+i*.5,.66,.3,.35,.16,.25,i%2?'#a0642e':'#3b2214');F.box(S,u-1.4,1.9,.12,.16,3.2,.16,'#1d1a1c');F.box(S,u+1.4,1.9,.12,.16,3.2,.16,'#1d1a1c')}
   for(const u of[23.8,26.6,31.4,34.2]){F.box(WARM,u,5,.04,.9,1.5,.08,'#ffffff');F.dia(WARM,u,5.75,.04,.64,.08,'#ffffff');F.box(S,u,4.2,.12,1.1,.1,.2,'#141414')}
   F.box(S,29,4.6,.6,4.2,.1,1.1,'#141414');for(let u=27.1;u<=30.95;u+=.3)F.box(S,u,5.05,1.1,.04,.9,.04,'#141414');F.box(S,29,5.5,1.1,4.2,.06,.06,'#141414');
   F.box(S,29,3.2,.12,2.4,.3,.2,'#141414');F.dia(S,29,3.1,.1,1.5,.1,'#1d1a1c');
   const sh=new THREE.Shape([new THREE.Vector2(-3.2,0),new THREE.Vector2(3.2,0),new THREE.Vector2(0,2.6)]);const pg=new THREE.ExtrudeGeometry(sh,{depth:.5,bevelEnabled:false});pg.translate(29,7,-8.4);S.add(pg,'#2e2a2d');
   const rw=new THREE.Mesh(new THREE.CircleGeometry(.75,20),new THREE.MeshBasicMaterial({color:'#ffcf8a'}));rw.position.set(29,8.1,-7.88);scene.add(rw);ctx.W.warmOnly=(ctx.W.warmOnly||[]).concat(rw);
   for(let u=22.4;u<36;u+=1.4){F.box(S,u,7.35,-.1,.5,.7,.5,'#1d1a1c');const p=F.pt(u,7.95,-.1);const g=new THREE.ConeGeometry(.28,.6,4);g.rotateY(PI/4);g.translate(p[0],p[1],p[2]);S.add(g,'#1d1a1c')}
   for(const [x,z] of[[22,-22],[36,-22],[22,-8],[36,-8]]){blk(S,x-.4,x+.4,0,8.6,z-.4,z+.4,'#1d1a1c',true);const g=new THREE.ConeGeometry(.5,1.6,4);g.rotateY(PI/4);g.translate(x,9.4,z);S.add(g,'#1d1a1c')}
   for(const u of[27,31]){const p=F.pt(u,0,.7);blk(S,p[0]-.06,p[0]+.06,0,2.6,p[2]-.06,p[2]+.06,'#141414',true);lantern(S,WARM,p[0],2.9,p[2])}
   const br=F.pt(35.2,4,.0);bx(S,br[0],4,br[2]+.7,.08,.08,1.4,'#141414');bx(S,br[0],3.97,br[2]+1.35,.06,.5,.06,'#141414');
   const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.75),new THREE.MeshLambertMaterial({map:signTex('GOTHIC','#d9d4c4','#2e2a2d',256,160),side:THREE.DoubleSide}));sg.position.set(br[0],3.45,br[2]+1.1);sg.rotation.y=PI/2;scene.add(sg);
   addPlane(scene,7,1.1,signTex('GOTHIC · BAKEHOUSE & CHOCOLATIERS','#1d1a1c','#d9d4c4',1024,160),[29,6.45,-7.86],0,null);
   fac(b,'w').plane(scene,-15,2.6,.05,12,5.4,wallArt.coffee());BL(21,37,-23,-6)}

  /* ===== WAFF WAFF — playful waffle shop ===== */
  if(on('memepura'))outs.waff=building({name:'Waff Waff',x0:41,x1:53,z0:-20,z1:-8,h:6,col:'#ffd23f',trim:'#e94b3c',door:{side:'s',at:50},room:'waff',win:false,awn:false});
  if(!G.LOT){const b={x0:41,x1:53,z0:-20,z1:-8},F=fac(b,'s');
   for(let i=0;i<10;i++)for(let j=0;j<3;j++)F.box(S,41.7+i*1.17,3.3+j*.95,.06,.82,.72,.14,'#f0b429');
   F.box(S,44.2,1.5,.02,3.6,1.9,.1,'#5a2a12');F.box(S,44.2,.75,.45,3.8,.12,.9,'#ffffff');F.box(S,44.2,.38,.12,3.6,.76,.25,'#e94b3c');
   for(let i=0;i<7;i++)F.box(S,42.4+i*.6,2.75,.6,.6,.12,1.2,i%2?'#ffffff':'#e94b3c');
   for(let i=0;i<4;i++)F.box(WARM,43.1+i*.75,.95,.6,.5,.08,.4,'#ffffff');
   F.plane(scene,41.6,1.5,.08,.8,1,menuTex(['Classic ₹99','Nutella ₹149','Lotus ₹179','Berry ₹159'],'#1d1d1d','#ffd23f','MENU'));
   bx(NEON,44.2,2.95,-7.6,3.2,.1,.08,'#ff3b8d');addPlane(scene,3.2,.8,signTex('WAFF WAFF','#ff3b8d','#ffffff',512,128),[44.2,2.45,-7.82],0,null);
   const W2=prop(S,47,6,-9,0);W2.box(0,2.4,0,4.2,4.2,.5,'#e8a33c',0,.08);for(let a=0;a<4;a++)for(let c2=0;c2<4;c2++)W2.box(-1.45+a*.97,.95+c2*.97,.27,.6,.6,.12,'#c9822a',0,.08);
   W2.box(.3,4.3,.35,.9,.6,.6,'#fff3b0',0,.08);for(const [u,l] of[[-1.3,1.6],[-.2,2.4],[.8,1.2],[1.6,1.9]])W2.box(u,4.4-l/2,.3,.32,l,.08,'#7a3e12',0,.08);W2.box(0,4.45,.31,3.8,.25,.08,'#7a3e12',0,.08);
   bx(S,45.5,6.4,-9,.2,.8,.2,'#5a2a12');bx(S,48.5,6.4,-9,.2,.8,.2,'#5a2a12');
   for(const u of[42.5,44.2,45.9]){cyl(S,u,.38,-6.6,.24,.2,.06,'#e94b3c',12);cyl(S,u,.19,-6.6,.05,.05,.38,'#555',6);col(u-.25,u+.25,0,.4,-6.85,-6.35)}
   fac(b,'e').plane(scene,-14,2.7,.05,11,5,wallArt.waffle());BL(40,54,-21,-6)}

  /* ===== OLD GREEN HOUSE CAFE — heritage ===== */
  if(on('memepura'))outs.ogh=building({name:'Old Green House Cafe',short:'Old Green House',x0:58,x1:74,z0:-22,z1:-8,h:5,col:'#2f6b45',trim:'#f4efe6',door:{side:'s',at:66},room:'ogh',roof:'none',win:false,awn:false,doorCol:'#6b3e22'});
  if(!G.LOT){const b={x0:58,x1:74,z0:-22,z1:-8},F=fac(b,'s');
   gable(S,66,-15,5,16,14,3.1,'#b5482e','x',.7,'#2f6b45');
   blk(S,57.6,74.4,0,.3,-8,-4.6,'#c9b79a',true);for(let u=58.4;u<74;u+=3.1){cyl(S,u,2.2,-5,.17,.2,3.8,'#6b3e22',10);cyl(S,u,.36,-5,.3,.3,.14,'#4a2a16',10);col(u-.2,u+.2,.3,4.1,-5.2,-4.8)}
   leanTo(S,57.4,74.6,-8,-4.2,4.6,3.6,'#b5482e');bx(S,66,4.1,-4.8,17,.14,.18,'#6b3e22');
   for(const u of[60.2,63.1,68.9,71.8]){F.box(WARM,u,2.2,.04,1.3,1.6,.08,'#ffffff');F.box(S,u,2.2,.1,1.5,.12,.12,'#f4efe6');F.box(S,u,3.06,.1,1.6,.14,.14,'#f4efe6');F.box(S,u,1.36,.12,1.7,.12,.2,'#f4efe6');F.box(S,u,2.2,.1,.08,1.6,.1,'#6b3e22');
     const pl=F.pt(u-1.15,2.2,.32);bx(S,pl[0],2.2,pl[2],.7,1.6,.06,'#1f5a36',.5);const pr=F.pt(u+1.15,2.2,.32);bx(S,pr[0],2.2,pr[2],.7,1.6,.06,'#1f5a36',-.5)}
   F.box(S,66,1.5,.1,1.9,3,.15,'#f4efe6');
   banana(S,57,-5.5,1.1);banana(S,75,-5.5,1.1);col(56.8,57.2,0,2.6,-5.7,-5.3);col(74.8,75.2,0,2.6,-5.7,-5.3);
   const lp=prop(S,67.6,.3,-6.2);lp.cyl(0,.08,0,.32,.4,.16,'#c9a227',12);lp.cyl(0,.75,0,.07,.07,1.3,'#c9a227',8);lp.cyl(0,1.45,0,.32,.12,.2,'#c9a227',12);lp.cyl(0,1.9,0,.05,.05,.6,'#c9a227',6);lp.cone(0,2.25,0,.14,.3,'#c9a227',6,0);
   for(let k=0;k<5;k++){const a=k/5*PI*2;bx(WARM,67.6+Math.cos(a)*.26,1.66,-6.2+Math.sin(a)*.26,.07,.16,.07,'#ffffff')}col(67.3,67.9,.3,2.4,-6.5,-5.9);
   for(const x of[60.5,71.5]){const p=prop(S,x,.3,-6.6);p.box(0,.45,0,2,.1,.5,'#6b3e22');p.box(-.85,.22,0,.1,.44,.45,'#4a2a16');p.box(.85,.22,0,.1,.44,.45,'#4a2a16');col(x-1,x+1,.3,.82,-6.85,-6.35);G.seats.push({x,z:-6.6,y:.85,yaw:0,label:'Sit on the verandah'})}
   addPlane(scene,6.5,1,signTex('OLD GREEN HOUSE CAFE','#f4efe6','#2f6b45',1024,160),[66,4.45,-4.66],0,null);
   for(let i=0;i<12;i++)bx(S,58.2+i*1.4,4.25,-4.62,.5,.4,.05,['#ffcc3a','#e94b3c','#3fae55'][i%3]);
   BL(56,76,-23,-3.5)}

  /* ===== CITY CLINIC — clean modern ===== */
  if(on('memepura'))outs.clinic=building({name:'City Clinic',short:'Clinic',x0:79,x1:93,z0:-22,z1:-8,h:7,col:'#f7f9fb',trim:'#cfe6f5',door:{side:'s',at:86},room:'clinic',win:false,awn:false,doorCol:'#2b6cb0'});
  if(!G.LOT){const b={x0:79,x1:93,z0:-22,z1:-8},F=fac(b,'s');
   for(const y of[1.9,5.2])for(const u of[80.4,82.4,89.6,91.6])F.box(WIN,u,y,.04,1.6,1.7,.08,'#ffffff');
   F.box(S,86,3.6,.05,14,.35,.12,'#cfe6f5');F.box(S,86,6.8,.05,14,.4,.12,'#9cc6e8');
   blk(S,83.5,88.5,0,.3,-8,-4.8,'#e6eef5',true);bx(WIN,86,1.95,-6.4,4.6,3.3,.08,'#ffffff');bx(WIN,83.7,1.95,-7.2,.08,3.3,1.6,'#ffffff');bx(WIN,88.3,1.95,-7.2,.08,3.3,1.6,'#ffffff');
   blk(S,83.4,88.6,3.6,3.85,-8,-6.2,'#2b6cb0',false);bx(S,86,1.95,-6.36,.12,3.3,.1,'#2b6cb0');col(83.6,83.8,.3,3.6,-8,-6.4);col(88.2,88.4,.3,3.6,-8,-6.4);
   for(let i=0;i<4;i++){blk(S,88.5+i*1.1,89.6+i*1.1,0,.3-i*.075,-6.6,-4.8,'#d8e2ea',true)}rails(S,88.5,93,-6.7,-6.7,.3,.9,'#9aa3ad',.6);rails(S,88.5,93,-4.7,-4.7,.3,.9,'#9aa3ad',.6);
   const cr=F.pt(81.2,5.3,.12);bx(NEON,cr[0],cr[1],cr[2],.55,1.7,.12,'#2ee66b');bx(NEON,cr[0],cr[1],cr[2],1.7,.55,.12,'#2ee66b');
   addPlane(scene,5,.8,signTex('CITY CLINIC','#2b6cb0','#ffffff',512,90),[86,4.35,-6.18],0,null);
   blk(S,93.2,98,0,.05,-20,-8,'#cfd4da',false);for(const z of[-20,-8])bx(S,95.6,.06,z,4.8,.02,.15,'#ffcc3a');bx(S,95.6,.06,-14,4.8,.02,.15,'#ffcc3a');
   const am=prop(S,95.6,0,-14.5,PI);am.box(0,1.4,-.4,2.1,2.2,4.2,'#ffffff');am.box(0,1.15,2.3,2.1,1.7,1.4,'#ffffff');am.box(0,1.6,2.98,1.8,.7,.06,'#26323d');am.box(0,1,0,2.12,.3,5.6,'#e94b3c');
   for(const z of[1.9,-1.7])for(const s of[-1,1])am.wheel(s*.95,.42,z,.42,.3);am.box(0,2.58,1.3,1,.16,.3,'#2f5bff');am.box(0,1.6,-2.52,.9,.9,.04,'#e94b3c');col(94.5,96.7,0,2.6,-17.5,-11.5);
   const lb=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.32),new THREE.MeshBasicMaterial({color:'#3b6bff'}));lb.position.set(95.6,2.6,-15.8);scene.add(lb);ctx.W.siren=lb;
   BL(78,99,-23,-3.5)}

  /* ===== AJJI — heritage courtyard house ===== */
  if(!G.LOT)outs.ajji=building({name:"Ajji's House",x0:-42,x1:-32,z0:10,z1:20,h:4,col:'#e8b04a',trim:'#ffffff',door:{side:'n',at:-37},room:'ajji',roof:'none',win:false,awn:false,doorCol:'#6b3e22'});
  if(!G.LOT){const b={x0:-42,x1:-32,z0:10,z1:20},F=fac(b,'n');
   gable(S,-37,15,4,10,10,2.6,'#b5482e','x',.6,'#e8b04a');
   blk(S,-42.3,-31.7,0,.3,7.6,10,'#d8c7a5',true);for(const u of[-41.6,-39.2,-34.8,-32.4]){cyl(S,u,2,8.1,.16,.18,3.4,'#6b3e22',10);col(u-.18,u+.18,.3,3.7,7.92,8.28)}leanTo(S,-42.5,-31.5,10,7.5,3.9,3.1,'#b5482e');
   for(const u of[-40.2,-33.8]){F.box(WARM,u,1.7,.04,1,1.3,.08,'#ffffff');F.arch(WARM,u,2.35,.04,.5,.08,'#ffffff');F.arch(S,u,2.38,.08,.62,.06,'#ffffff');F.box(S,u,.95,.12,1.3,.1,.25,'#ffffff');
     for(let i=0;i<3;i++){const p=F.pt(u-.4+i*.4,1.1,.2);cyl(S,p[0],1.1,p[2],.07,.06,.2,'#c9ccd1',8)}
     const pl=F.pt(u-.8,1.8,.25);bx(S,pl[0],1.8,pl[2],.5,1.5,.06,'#2e7d4f',-.6);const pr=F.pt(u+.8,1.8,.25);bx(S,pr[0],1.8,pr[2],.5,1.5,.06,'#2e7d4f',.6)}
   F.box(S,-37,1.25,.08,1.6,2.5,.14,'#ffffff');F.arch(S,-37,2.5,.08,.8,.14,'#ffffff');
   const tk=prop(S,-35.9,.3,8.6);tk.box(0,.45,0,.8,.9,.8,'#f4efe6');tk.box(0,.92,0,.9,.06,.9,'#e94b3c');tk.cyl(0,1.05,0,.1,.12,.25,'#6b4a35',6);tk.box(0,1.35,0,.45,.35,.45,'#3f8f4a',.5);tk.box(0,1.62,0,.3,.25,.3,'#4fae55',.9);col(-36.35,-35.45,.3,1.25,8.15,9.05);
   const rg=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.8),new THREE.MeshLambertMaterial({map:rangoli(),transparent:true,alphaTest:.3}));rg.rotation.x=-PI/2;rg.position.set(-37,.31,8.8);scene.add(rg);
   const sw=prop(S,-40.4,.3,8.8);sw.box(0,.55,0,1.4,.08,.5,'#6b3e22');for(const s of[-.6,.6])sw.box(s,1.9,0,.03,2.7,.03,'#555');
   BL(-43,-31,7,21)}

  /* ===== MEERA — modern apartment with RGB window ===== */
  if(!G.LOT)outs.meera=building({name:"Meera's House",x0:-60,x1:-50,z0:10,z1:20,h:10,col:'#e9ecef',trim:'#2b2f36',door:{side:'n',at:-55},room:'meera',win:false,awn:false,doorCol:'#2b2f36'});
  if(!G.LOT){const b={x0:-60,x1:-50,z0:10,z1:20},F=fac(b,'n');
   for(const y of[1.8,5,8.2])for(const u of[-58.4,-51.6]){if(y===8.2&&u===-58.4)continue;F.box(WIN,u,y,.04,2,1.6,.08,'#ffffff');F.box(S,u,y,.08,2.2,1.8,.04,'#2b2f36')}
   const rgb=new THREE.Mesh(new THREE.BoxGeometry(2,1.6,.08),new THREE.MeshBasicMaterial({color:'#ff3b8d'}));const rp=F.pt(-58.4,8.2,.04);rgb.position.set(rp[0],rp[1],rp[2]);scene.add(rgb);ctx.W.rgb=rgb;F.box(S,-58.4,8.2,.08,2.2,1.8,.04,'#2b2f36');
   for(const y of[3.4,6.6]){F.box(S,-55,y,.9,4.4,.18,1.8,'#cfd4da');rails(S,-57.2,-52.8,10-1.75,10-1.75,y,.95,'#2b2f36',.6,GL);F.box(WIN,-55,y+1.25,.04,2.6,1.9,.08,'#ffffff')}
   blk(S,-50.2,-49.6,4,4.9,13,14.4,'#dfe3e8',false);blk(S,-50.2,-49.6,7.2,8.1,16,17.4,'#dfe3e8',false);
   cyl(S,-57,10.9,17,.9,.9,1.6,'#1d1d1d',14);cyl(S,-57,11.75,17,.4,.4,.12,'#1d1d1d',10);const ds=prop(S,-52.5,10,12.5);ds.cyl(0,.4,0,.05,.05,.8,'#9aa3ad',6);ds.cyl(0,.95,0,.55,.15,.12,'#e9ecef',16,-.7);
   fac(b,'e').plane(scene,15,4.5,.05,9.4,4.7,wallArt.graffiti());
   const sc2=prop(S,-57.5,0,7.6,PI/2);scooterGeo(sc2,'#3d7be8');col(-58.2,-56.8,0,1.1,7.2,8);
   BL(-61,-49,7,21)}

  /* ===== FUTURE VENTURES ===== */
  const venture=(o)=>{const out=building(Object.assign({win:false,awn:false},o));return out};
  // Handi Biryani House
  if(on('kaapikunj'))venture({name:'Handi Biryani House',x0:-60,x1:-46,z0:-22,z1:-8,h:5.5,col:'#c1693c',trim:'#7a2e1b',door:{side:'s',at:-53},doorCol:'#4a1e10'});
  if(!G.LOT){const b={x0:-60,x1:-46,z0:-22,z1:-8},F=fac(b,'s');F.box(S,-53,1.4,.08,2.2,2.8,.14,'#7a2e1b');F.arch(S,-53,2.8,.08,1.1,.14,'#7a2e1b');
   for(const u of[-57.5,-48.5]){F.box(WARM,u,2,.04,1.6,1.5,.08,'#ffffff');F.arch(WARM,u,2.75,.04,.8,.08,'#ffffff');F.box(S,u,1.2,.12,1.9,.1,.25,'#7a2e1b')}
   addPlane(scene,8,1.1,signTex('HANDI BIRYANI HOUSE','#1f5a36','#ffcc3a',1024,140),[-53,4.6,-7.86],0,null);
   for(let i=0;i<5;i++){const x=-58.6+i*.85;cyl(S,x,.42,-6.9,.38,.3,.84,'#8a4a2a',10);bx(S,x,.92,-6.9,.6,.1,.6,'#e94b3c')}for(let i=0;i<3;i++){const x=-58.2+i*.85;cyl(S,x,1.25,-6.9,.34,.28,.7,'#8a4a2a',10)}
   const st=prop(S,-48.2,0,-6.8);st.box(0,.45,0,1.2,.9,1.2,'#3a3a3a');st.sph(0,1.25,0,.6,'#8a4a2a',1,.85,1);st.box(0,1.75,0,.7,.08,.7,'#e94b3c');col(-48.8,-47.6,0,1.8,-7.4,-6.2);col(-59,-55,0,1.6,-7.3,-6.5);
   ctx.W.handiSmoke=[-48.2,2,-6.8];
   fac(b,'e').plane(scene,-15,2.6,.05,12,4.6,wallArt.biryani());
   info(-53,-5.8,0,1.6,'Handi Biryani House (coming soon)',{n:'Handi Biryani House',tag:'Future venture',st:'Planned',d:'A Champaran-style handi biryani outlet, slow-cooked in sealed clay pots. Planned for Baloda Bazar.',href:'',color:'#c1693c'});
   BL(-61,-45,-23,-5.5)}
  // FLTTR
  if(on('kaapikunj'))venture({name:'FLTTR',x0:-70,x1:-62,z0:-22,z1:-10,h:5,col:'#f4efe6',trim:'#141414',door:{side:'s',at:-66},doorCol:'#141414'});
  if(!G.LOT){const b={x0:-70,x1:-62,z0:-22,z1:-10},F=fac(b,'s');F.box(WIN,-68.4,2,.04,2.4,2.6,.08,'#ffffff');F.box(S,-66,4.4,.06,8,.6,.12,'#141414');
   const can=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,4.6,24),[new THREE.MeshLambertMaterial({map:canTex()}),new THREE.MeshLambertMaterial({color:'#c9ccd1'}),new THREE.MeshLambertMaterial({color:'#c9ccd1'})]);can.position.set(-66,7.3,-16);can.castShadow=true;scene.add(can);cyl(S,-66,9.68,-16,1.45,1.45,.16,'#9aa3ad',20);
   for(const x of[-64.2,-63.2]){blk(S,x-.45,x+.45,0,2.2,-9.9,-9.2,'#ff6a3d');bx(WARM,x,1.45,-9.18,.7,1,.04,'#ffffff');bx(S,x,.5,-9.16,.6,.2,.04,'#141414')}
   addPlane(scene,3,.6,signTex('FLTTR','#141414','#f4efe6',512,100),[-66,4.4,-9.86],0,null);
   info(-66,-8.2,0,1.6,'FLTTR (coming soon)',{n:'FLTTR',tag:'Future venture',st:'Planned',d:'A premium canned coffee brand, positioned to take on the big chains with better beans and cleaner design.',href:'',color:'#141414'});BL(-71,-61,-23,-8)}
  // The Tiramisu Theory
  if(on('kaapikunj'))venture({name:'The Tiramisu Theory',x0:-26,x1:-16,z0:10,z1:20,h:5,col:'#f6c1cf',trim:'#5a3825',door:{side:'n',at:-21},doorCol:'#5a3825'});
  if(!G.LOT){const b={x0:-26,x1:-16,z0:10,z1:20},F=fac(b,'n');for(const u of[-24,-18])F.box(WARM,u,1.9,.04,2,1.8,.08,'#ffffff');
   for(let i=0;i<9;i++){F.box(S,-25.4+i*1.1,3.05,.6,1.1,.5,1.2,i%2?'#ffffff':'#f19cb3');F.arch(S,-25.4+i*1.1,2.8,1.2,.55,.1,i%2?'#ffffff':'#f19cb3')}
   const tm=prop(S,-21,5,15);[['#3b2214',.3],['#f6efe1',.35],['#c9a26b',.4],['#f6efe1',.35],['#c9a26b',.4]].reduce((y,[c,h])=>{tm.box(0,y-h/2,0,3.4,h,2.2,c);return y-h},2.4);tm.box(0,2.45,0,3.4,.1,2.2,'#5a3825');
   addPlane(scene,6,.9,signTex('THE TIRAMISU THEORY','#5a3825','#f6c1cf',1024,150),[-21,4.4,9.86],PI,null);
   const ct=prop(S,-24.4,0,7.9);ct.box(0,.95,0,1.8,.9,.9,'#f6c1cf');ct.box(0,1.45,0,1.7,.1,.8,'#5a3825');ct.wheel(-.7,.3,.5,.3,.12,'#5a3825');ct.wheel(.7,.3,.5,.3,.12,'#5a3825');ct.box(0,2.4,0,2,.1,1.2,'#ffffff');ct.box(-.85,1.9,0,.06,1,.06,'#5a3825');ct.box(.85,1.9,0,.06,1,.06,'#5a3825');for(let i=0;i<4;i++)ct.box(-.6+i*.4,1.6,0,.3,.2,.3,i%2?'#c9a26b':'#3b2214');col(-25.4,-23.4,0,1.5,7.3,8.5);
   info(-21,8,0,1.6,'The Tiramisu Theory (coming soon)',{n:'The Tiramisu Theory',tag:'Future venture',st:'Planned',d:'A dessert cart and parlour built around one obsession: properly made tiramisu.',href:'',color:'#f6c1cf'});BL(-27,-15,6.5,21)}
  /* ===== STREET FOOD STALLS ===== */
  if(on('kaapikunj')){const c=prop(S,-15.5,0,-20.2,PI/2);c.box(0,.5,0,2.2,1,1.2,'#8a5a3b');c.box(0,1.05,0,2.3,.1,1.3,'#c9ccd1');c.cyl(-.6,1.35,0,.28,.32,.5,'#c9ccd1',12);c.cyl(-.6,1.65,0,.12,.12,.15,'#9aa3ad',8);for(let i=0;i<5;i++)c.cyl(.2+i*.18,1.2,.3,.06,.05,.18,'#ffffff',8);
   c.box(0,2.5,0,2.8,.08,1.8,'#2f5bff');for(const [a,b2] of[[-1.2,-.75],[1.2,-.75],[-1.2,.75],[1.2,.75]])c.box(a,1.7,b2,.06,1.6,.06,'#555');col(-16.2,-14.8,0,1.2,-21.3,-19.1);
   addPlane(scene,2,.45,signTex('TAPRI CHAI · ₹10','#ffcc3a','#141414',512,110),[-14.82,1.9,-20.2],PI/2,null);
   const bn2=prop(S,-13.6,0,-22.6,0);bn2.box(0,.45,0,1.8,.1,.45,'#8a5a3b');bn2.box(-.7,.22,0,.1,.44,.4,'#555');bn2.box(.7,.22,0,.1,.44,.4,'#555');col(-14.5,-12.7,0,.5,-22.85,-22.35);G.seats.push({x:-13.6,z:-22.6,y:.5,yaw:0,label:'Sit for chai'});
   G.triggers.push({x:-14,z:-20.2,r:1.6,label:'Order a cutting chai',act:()=>{G.host.toast('CUTTING CHAI','Half glass, full happiness. ₹10.');G.player.emote='sip';G.player.emoteT=2.6}});BL(-17,-12,-24,-18)}
  if(on('memepura')){const c=prop(S,38.6,0,-6.9,0);c.box(0,.9,0,1.8,.8,.9,'#e94b3c');c.wheel(-.6,.3,.48,.3,.1);c.wheel(.6,.3,.48,.3,.1);bx(GL,38.6,1.7,-6.9,1.4,.7,.7,'#ffffff');c.box(0,2.1,0,1.5,.06,.8,'#ffcc3a');for(let i=0;i<6;i++)c.sph(-.5+i*.2,1.45,0,.08,'#d9963b');c.cyl(.55,1.5,.2,.15,.15,.25,'#c9ccd1',10);
   addPlane(scene,1.6,.4,signTex('PANI PURI','#ffcc3a','#e94b3c',512,120),[38.6,2.5,-6.44],0,null);bx(S,38.6,2.3,-6.9,.06,.4,.06,'#555');col(37.7,39.5,0,1.8,-7.35,-6.45);
   G.triggers.push({x:38.6,z:-5.6,r:1.5,label:'Eat pani puri',act:()=>G.host.toast('PANI PURI','6 for ₹30. Spicy water hits different.')})}
  if(on('memepura')){const c=prop(S,47,0,45.2,0);c.box(0,.7,0,2,.18,1.1,'#8a5a3b');c.wheel(-.75,.35,.6,.35,.1,'#4a2a16');c.wheel(.75,.35,.6,.35,.1,'#4a2a16');const r=rng(5);for(let i=0;i<14;i++)c.sph(-.7+r()*1.4,.95+r()*.35,-.35+r()*.7,.2,'#4f8f3a',1,1.1,1);
   addPlane(scene,1.8,.4,signTex('TENDER COCONUT','#4f8f3a','#ffffff',512,110),[47,1.75,45.8],0,null);bx(S,47,1.4,45.6,.05,.7,.05,'#555');col(45.9,48.1,0,1.4,44.6,45.8);
   G.triggers.push({x:47,z:46.6,r:1.5,label:'Drink a tender coconut',act:()=>{G.host.toast('TENDER COCONUT','Fresh. Cold. Straw included.');G.player.emote='sip';G.player.emoteT=2.6}})}

  /* ===== PARKED VEHICLES ===== */
  const auto=(x,z,ry)=>{const p=prop(S,x,0,z,ry);p.box(0,.75,-.3,1.4,.9,1.5,'#2e8b57');p.box(0,.75,.85,.9,.9,.8,'#2e8b57');p.box(0,1.95,-.05,1.55,.1,2.4,'#ffd23f');p.box(0,1.45,.05,1.5,1,2.1,'#ffd23f');
    p.box(0,1.45,.0,1.3,.8,1.8,'#26323d');p.box(0,1.3,1.22,.85,.5,.05,'#9cc6dd');p.wheel(0,.3,1.1,.3,.2);p.wheel(-.62,.3,-.7,.3,.2);p.wheel(.62,.3,-.7,.3,.2);p.box(0,.6,-.95,1.3,.3,.3,'#1d1d1d');
    const r=Math.abs(Math.sin(ry))>.5;col(x-(r?1.3:.8),x+(r?1.3:.8),0,2,z-(r?.8:1.3),z+(r?.8:1.3))};
  if(on('kaapikunj')){auto(-47,2.6,PI/2);auto(-43.6,2.6,PI/2)}if(on('memepura'))auto(26,-2.8,-PI/2);
  const scoot=(x,z,ry,c)=>{const p=prop(S,x,0,z,ry);scooterGeo(p,c);col(x-.6,x+.6,0,1.1,z-.6,z+.6)};
  if(on('kaapikunj')){scoot(-36.4,-6.6,.2,'#ffffff');scoot(-35.1,-6.6,.2,'#e94b3c')}if(on('memepura'))scoot(70,-6.7,-.3,'#3d7be8');
  if(on('memepura')){const p=prop(S,61.5,0,-3.3,PI/2);p.box(0,.62,0,.3,.36,1.6,'#2b2b2b');p.box(0,.9,-.2,.32,.12,.7,'#141414');p.box(0,1.05,.65,.6,.06,.06,'#555');p.wheel(0,.32,.7,.32,.14);p.wheel(0,.32,-.7,.32,.14);p.box(0,1.45,-.6,.8,.7,.7,'#ff6a3d');col(60.6,62.4,0,1.8,-3.7,-2.9);
   addPlane(scene,.66,.3,signTex('DELIVERY','#ff6a3d','#141414',256,110),[60.85,1.45,-3.3],-PI/2,null)}

  /* ===== FAIRY LIGHTS across the café strip ===== */
  const FC=['#ff3b8d','#ffcc3a','#3bd1ff','#c9f26b','#ffffff'];
  if(on('kaapikunj'))for(let x=-68;x<-20;x+=8)stringLights(NEON,[x,5.6,-5.6],[x+4,5.6,5.6],16,1,FC);
  for(const x of[-68,-20])for(const z of[-5.6,5.6]){}

  /* ===== finalize ===== */
  ctx.W.warmMat=new THREE.MeshBasicMaterial({vertexColors:true,color:'#ffcf8a'});scene.add(WARM.mesh(ctx.W.warmMat));
  ctx.W.neonMat=new THREE.MeshBasicMaterial({vertexColors:true,color:'#bbbbbb'});scene.add(NEON.mesh(ctx.W.neonMat));
  scene.add(GL.mesh(new THREE.MeshBasicMaterial({vertexColors:true,color:'#bfe3f7',transparent:true,opacity:.35,depthWrite:false})));
  return outs}
export function scooterGeo(p,c){p.box(0,.45,0,.34,.2,1.2,'#2b2b2b');p.box(0,.62,-.25,.36,.36,.75,c);p.box(0,.86,-.2,.32,.1,.62,'#141414');p.box(0,.75,.45,.36,.7,.22,c);p.box(0,1.15,.5,.6,.06,.06,'#555');p.box(0,1.1,.58,.25,.18,.08,c);p.wheel(0,.24,.52,.24,.12);p.wheel(0,.24,-.5,.24,.12)}

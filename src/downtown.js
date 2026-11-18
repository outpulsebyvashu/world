import {THREE,G,Batch,bx,cyl,col,blk,tex,signTex,FONT_T,FONT_D,rng} from './core.js';
import {makeLot} from './lots.js';
import {billboard,memeTex} from './landmarks.js';
import {pot,rails} from './arch.js';
const PI=Math.PI;
/* Delulugarh: a grid of skyscraper plots around NTH Labs. Each block is its own mesh so the GPU can skip blocks off-screen. */
export function buildDowntown(scene,ctx){const {S,WIN,LMP,addPlane}=ctx;const outs={};const R=rng(77);
  const MAT=new THREE.MeshLambertMaterial({vertexColors:true});const batches=[];
  const lot=(B,x0,x1,z0,z1,side,o={})=>makeLot(scene,{S:B,addPlane},Object.assign({x0,x1,z0,z1,door:{side,at:(side==='e'||side==='w')?(z0+z1)/2:(x0+x1)/2}},o));
  const block=(x0,x1,z0,z1,fill,paved=true)=>{const B=new Batch();batches.push(B);if(paved){blk(B,x0,x1,0,.03,z0,z1,'#d6d0c2',false);G.noGrass.push([x0,x1,z0,z1])}fill(B)};
  const tw=(a,b)=>Math.round(a+R()*(b-a));
  const COLS=[[-86,-50],[-38,-6],[6,38],[50,86]];
  /* R0: mid-rise, 3 x 2 lots per block (doors face the boulevard or street A) */
  for(const [a,b] of COLS)block(a,b,-14,16,B=>{const w=(b-a)/3;for(let i=0;i<3;i++){const x0=a+i*w+.8,x1=a+(i+1)*w-.8;lot(B,x0,x1,-13.2,-.8,'n',{floors:tw(1,3),crane:false});lot(B,x0,x1,.8,15.2,'s',{floors:tw(1,3),crane:false})}});
  /* R1: outer towers + NTH Labs superblock */
  for(const [a,b] of[COLS[0],COLS[3]])block(a,b,-62,-26,B=>{const m=(a+b)/2;for(const [p,q] of[[a+.9,m-.9],[m+.9,b-.9]]){lot(B,p,q,-61.1,-44.9,'n',{tower:true,h:tw(28,42)});lot(B,p,q,-43.1,-26.9,'s',{tower:true,h:tw(26,38)})}});
  block(-38,38,-62,-26,B=>{for(const [p,q,sd] of[[-37,-19,'w'],[19,37,'e']]){lot(B,p,q,-61,-45,sd,{tower:true,h:tw(26,36)});lot(B,p,q,-43,-27,sd,{tower:true,h:tw(24,34)})}});
  /* R2: Central Lawn flanked by towers */
  for(const [a,b] of[COLS[0],COLS[3]])block(a,b,-110,-74,B=>{const m=(a+b)/2;for(const [p,q] of[[a+.9,m-.9],[m+.9,b-.9]]){lot(B,p,q,-109.1,-92.9,'n',{tower:true,h:tw(38,56)});lot(B,p,q,-91.1,-74.9,'s',{tower:true,h:tw(36,52)})}});
  block(-38,-19,-110,-74,B=>{lot(B,-37,-21,-109,-93,'w',{tower:true,h:tw(40,55)});lot(B,-37,-21,-91,-75,'w',{tower:true,h:tw(38,52)})});
  block(19,38,-110,-74,B=>{lot(B,21,37,-109,-93,'e',{tower:true,h:tw(40,55)});lot(B,21,37,-91,-75,'e',{tower:true,h:tw(38,52)})});
  /* R3: the supertall row */
  for(const [a,b] of[COLS[0],COLS[3]])block(a,b,-150,-122,B=>{const m=(a+b)/2;lot(B,a+.9,m-.9,-149,-123,'s',{tower:true,h:tw(50,70)});lot(B,m+.9,b-.9,-149,-123,'s',{tower:true,h:tw(52,72)})});
  block(-38,38,-150,-122,B=>{for(const [p,q] of[[-37,-20],[-18,-1],[1,18],[20,37]])lot(B,p,q,-149,-123,'s',{tower:true,h:tw(58,80)})});
  /* Central Lawn */
  {const B=new Batch();batches.push(B);blk(B,-18,18,0,.05,-93,-91,'#d6d0c2',false);blk(B,-1,1,0,.05,-110,-74,'#d6d0c2',false);G.noGrass.push([-18,18,-93.2,-90.8],[-1.2,1.2,-110,-74]);
    cyl(B,0,.35,-92,4.2,4.4,.7,'#cfd6de',28);col(-4.2,4.2,0,.7,-96.2,-87.8);const wt=new THREE.Mesh(new THREE.CircleGeometry(3.8,28),new THREE.MeshLambertMaterial({color:'#3fa7e0'}));wt.rotation.x=-PI/2;wt.position.set(0,.66,-92);scene.add(wt);cyl(B,0,1.6,-92,.4,.6,2,'#e8e2d6',12);cyl(B,0,2.7,-92,1.2,.2,.3,'#e8e2d6',16);
    for(const [x,z] of[[-12,-80],[12,-80],[-12,-104],[12,-104],[-7,-86],[7,-98]])streetTree(B,x,z,1.5,false);
    for(const [x,z,ry] of[[-8,-92,PI/2],[8,-92,-PI/2],[0,-82,PI],[0,-102,0]]){const c=Math.abs(Math.sin(ry))>.5;blk(B,x-(c?.35:1.1),x+(c?.35:1.1),0,.5,z-(c?1.1:.35),z+(c?1.1:.35),'#8a5a3b');G.seats.push({x,z,y:.52,yaw:ry,label:'Sit in the Central Lawn'})}
    for(const [x0,x1,z0,z1] of[[-18,18,-110.4,-110],[-18,18,-74,-73.6],[-18.4,-18,-110,-74],[18,18.4,-110,-74]])blk(B,x0,x1,0,.7,z0,z1,'#3f7a3a',false);
    addPlane(scene,5,.7,signTex('CENTRAL LAWN','#2f5a2a','#f3eee6',768,108),[0,1.05,-73.4],0,null);blk(B,-2.6,2.6,0,.75,-73.75,-73.45,'#2f5a2a',true)}
  /* NTH Labs */
  outs.nth=nth(scene,ctx);
  /* street trees, billboards, people */
  {const B=new Batch();batches.push(B);for(let x=-84;x<=84;x+=16){if(Math.abs(x)<10||Math.abs(Math.abs(x)-44)<8)continue;streetTree(B,x,16.9,1,true);streetTree(B,x,-15,1,true)}
    for(let z=-140;z<=10;z+=16){if([-20,-68,-116].some(q=>Math.abs(z-q)<7))continue;streetTree(B,-38.9,z,1,true);streetTree(B,38.9,z,1,true)}}
  billboard(scene,ctx,24,16.7,0,8,3,memeTex('A MESSAGE FROM DELULUGARH','DELULU IS THE SOLULU','#3bd1ff','#141414'));
  billboard(scene,ctx,-24,16.7,0,8,3,memeTex('NOW HIRING · PAY IN EQUITY','VALUATION: VIBES','#ff3b8d','#ffffff'));
  billboard(scene,ctx,-68,16.7,0,8,3,memeTex('YOUR STARTUP HERE','PITCH DECK LOADING…','#ffcc3a','#141414'));
  G.extraNPCs.push({name:'Site engineer Suresh',look:{shirt:'#ff6a3d',pants:'#3a4a6b',hair:'short',hat:'#ffcc3a',vest:'#ffcc3a',face:'smile'},x:22,z:-15,yaw:0,lines:['Under construction. Like my sleep schedule.','What are we building? Something\'s cooking. That\'s all the boss tells me.','Fifty-six plots, one crane operator. He\'s tired.'],barks:['Hard hats!','Almost done!']},
    {name:'Mason Mani',look:{shirt:'#3d7be8',pants:'#6b5a3a',hair:'curly2',hat:'#ffcc3a',face:'grin'},x:-21,z:-15,yaw:0,emote:'drum',lines:['Brick by brick. Floor by floor.','The boss says "MVP". I say "Minimum Viable Pillar".'],barks:['Thak thak.','One more floor!']},
    {name:'Pitch-Deck Pinky',look:{shirt:'#ff8fc1',pants:'#2b2b2b',hair:'bun',glasses:true,face:'smile'},x:-30,z:17,kind:'wander',path:[[-30,17],[30,17],[30,27.2],[-30,27.2]],speed:2.6,lines:['Hi! Quick 30-second pitch? It\'s Uber, but for pitch decks.','We\'re pre-seed. Like, a seed of a seed.','Delulu is the solulu. Write that down.'],barks:['Got a minute?','Pre-seed!']});
  for(const B of batches){const m=B.mesh(MAT);m.castShadow=true;m.receiveShadow=true;scene.add(m)}
  return outs}

function streetTree(B,x,z,s,planter){if(planter){blk(B,x-.7,x+.7,0,.45,z-.7,z+.7,'#9aa3ad',true);bx(B,x,.46,z,1.2,.04,1.2,'#5a3f2a')}cyl(B,x,1.4*s,z,.1*s,.15*s,2.8*s,'#5b4330',7);
  for(let i=0;i<3;i++){const g=new THREE.IcosahedronGeometry((.9+i*.12)*s,0);g.translate(x+Math.sin(i*2.3)*.5*s,(3+i*.35)*s,z+Math.cos(i*2.3)*.5*s);B.add(g,['#4a7a33','#3d6b2c','#557f38'][i])}col(x-.15,x+.15,0,2.8*s,z-.15,z+.15)}

/* ---------- NTH Labs: glass tower with a walkable sky deck at y=84 ---------- */
function nth(scene,ctx){const {S,WIN,LMP,addPlane}=ctx;const H=84,x0=-11,x1=11,z0=-54,z1=-36;
  // podium + entrance
  blk(S,-15,15,0,7,-58,-32,'#e9edf2');bx(WIN,0,3.2,-31.94,26,5.2,.1,'#ffffff');for(let x=-13;x<=13;x+=2.6)bx(S,x,3.2,-31.88,.16,5.2,.14,'#2a3442');bx(S,0,6.2,-31.86,30,.5,.2,'#2a3442');
  blk(S,-4.5,4.5,4.4,4.7,-32,-29,'#2a3442',false);bx(LMP,0,4.36,-29.05,9,.06,.06,'#3bd1ff');for(const x of[-4.2,4.2]){cyl(S,x,2.2,-29.4,.14,.14,4.4,'#c9ccd1',10);col(x-.16,x+.16,0,4.4,-29.56,-29.24)}
  addPlane(scene,10,1.4,signTex('NTH LABS','#141414','#3bd1ff',1024,140),[0,6.25,-31.74],0,null);
  // tower core + glass curtain wall + floor bands + fins
  blk(S,x0,x1,7,H,z0,z1,'#2a3442');
  bx(WIN,0,(7+H)/2,z1+.06,22,H-7,.1,'#ffffff');bx(WIN,0,(7+H)/2,z0-.06,22,H-7,.1,'#ffffff');bx(WIN,x1+.06,(7+H)/2,(z0+z1)/2,.1,H-7,18,'#ffffff');bx(WIN,x0-.06,(7+H)/2,(z0+z1)/2,.1,H-7,18,'#ffffff');
  for(let y=10.5;y<H;y+=3.5){bx(S,0,y,z1+.12,22.3,.28,.12,'#1b232e');bx(S,0,y,z0-.12,22.3,.28,.12,'#1b232e');bx(S,x1+.12,y,(z0+z1)/2,.12,.28,18.3,'#1b232e');bx(S,x0-.12,y,(z0+z1)/2,.12,.28,18.3,'#1b232e')}
  for(let x=x0;x<=x1+.01;x+=2.75){bx(S,x,(7+H)/2,z1+.2,.14,H-7,.3,'#cfd6de');bx(S,x,(7+H)/2,z0-.2,.14,H-7,.3,'#cfd6de')}for(let z=z0;z<=z1+.01;z+=2.25){bx(S,x1+.2,(7+H)/2,z,.3,H-7,.14,'#cfd6de');bx(S,x0-.2,(7+H)/2,z,.3,H-7,.14,'#cfd6de')}
  // crown LED band + top signs
  bx(LMP,0,H-.5,z1+.25,22.4,.22,.1,'#3bd1ff');bx(LMP,0,H-.5,z0-.25,22.4,.22,.1,'#3bd1ff');bx(LMP,x1+.25,H-.5,(z0+z1)/2,.1,.22,18.4,'#3bd1ff');bx(LMP,x0-.25,H-.5,(z0+z1)/2,.1,.22,18.4,'#3bd1ff');
  addPlane(scene,14,2.2,signTex('NTH LABS','#141414','#3bd1ff',1024,160),[0,H-3,z1+.3],0,null);addPlane(scene,14,2.2,signTex('NTH LABS','#141414','#3bd1ff',1024,160),[0,H-3,z0-.3],PI,null);
  col(-15,15,0,7,-58,-32);col(x0,x1,0,H,z0,z1);
  // sky deck
  blk(S,x0+.2,x1-.2,H,H+.05,z0+.2,z1-.2,'#6b5644',false);
  const hp=tex(256,256,(c,W)=>{c.fillStyle='rgba(0,0,0,0)';c.clearRect(0,0,W,W);c.strokeStyle='#ffcc3a';c.lineWidth=12;c.beginPath();c.arc(W/2,W/2,110,0,7);c.stroke();c.fillStyle='#ffcc3a';c.font='800 150px '+FONT_T;c.textAlign='center';c.fillText('H',W/2,W/2+54)});
  const hm=new THREE.Mesh(new THREE.PlaneGeometry(7,7),new THREE.MeshBasicMaterial({map:hp,transparent:true,depthWrite:false}));hm.rotation.x=-PI/2;hm.position.set(-1.5,H+.07,-46);scene.add(hm);
  rails(S,x0+.1,x1-.1,z1-.1,z1-.1,H,1.15,'#cfd6de',.6);rails(S,x0+.1,x1-.1,z0+.1,z0+.1,H,1.15,'#cfd6de',.6);rails(S,x0+.1,x0+.1,z0+.1,z1-.1,H,1.15,'#cfd6de',.6);rails(S,x1-.1,x1-.1,z0+.1,z1-.1,H,1.15,'#cfd6de',.6);
  col(x0,x1,H,H+1.3,z1-.3,z1);col(x0,x1,H,H+1.3,z0,z0+.3);col(x0,x0+.3,H,H+1.3,z0,z1);col(x1-.3,x1,H,H+1.3,z0,z1);
  for(const x of[-8.5,-6]){blk(S,x-.4,x+.4,H,H+.42,z1-2.6,z1-.8,'#f4efe6',false);bx(S,x,H+.62,z1-.9,.8,.5,.1,'#f4efe6',0,-.5);col(x-.4,x+.4,H,H+.42,z1-2.6,z1-.8);G.seats.push({x,z:z1-1.8,y:H+.45,yaw:PI,label:'Lie back and enjoy the view'})}
  // telescope
  cyl(S,7.8,H+.6,z1-1.6,.06,.12,1.2,'#2a3442',8);const tg=new THREE.CylinderGeometry(.14,.18,1.3,10);tg.rotateX(PI/2.4);tg.translate(7.8,H+1.35,z1-1.4);S.add(tg,'#c9ccd1');col(7.6,8,H,H+1.2,z1-1.8,z1-1.4);
  G.triggers.push({x:7.8,z:z1-2.6,y:H,r:1.5,label:'Look through the telescope',act:()=>{G.host.egg('ow_skydeck','You looked out from the NTH Labs sky deck.');G.host.toast('TELESCOPE','You can see all of Delulugarh. And someone\'s pitch deck, open on a laptop, 40 floors down.')}});
  // elevator kiosk + antenna
  blk(S,5.5,10.2,H,H+3.2,z0+.4,z0+4.2,'#2a3442');bx(WIN,7.85,H+1.3,z0+4.23,1.8,2.4,.06,'#ffffff');bx(S,7.85,H+1.3,z0+4.25,.06,2.4,.06,'#141414');
  addPlane(scene,1.9,.36,signTex('ELEVATOR','#141414','#3bd1ff',512,96),[7.85,H+2.85,z0+4.27],0,null);cyl(S,9.3,H+6,z0+1.2,.07,.12,5.6,'#c9ccd1',8);bx(LMP,9.3,H+8.9,z0+1.2,.3,.3,.3,'#ff2d2d');
  G.triggers.push({x:7.85,z:z0+5.4,y:H,r:1.5,label:'Elevator · back to the lobby',act:()=>G.enter('nth')});
  G.triggers.push({x:0,z:-30.4,r:2.2,label:'Enter NTH Labs',act:()=>G.enter('nth')});
  G.buildings.push({name:'NTH Labs',short:'NTH Labs',x0:-15,x1:15,z0:-58,z1:-32,col:'#3bd1ff',door:{x:0,z:-29},room:'nth'});
  // plaza in front
  blk(S,-15,15,0,.05,-32,-26,'#e3dfd6',false);G.noGrass.push([-15,15,-32,-26]);
  for(const x of[-11,11]){pot(S,x,-28,'#9aa3ad','#3f9b4a',.8);blk(S,x-2.6,x-1.4,0,.5,-28.6,-27.4,'#8a5a3b')}
  G.blocked.push([-16,16,-59,-25]);
  return{x:0,z:-30.2,fx:0,fz:1}}

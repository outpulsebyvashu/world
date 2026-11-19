/* Vashupur, final map: PM House, Lolu Mall (4 floors, cinema on top), Choupati food street, Outpulse Museum grounds */
import {THREE,G,Batch,bx,cyl,col,blk,tex,wrap,signTex,FONT_T,FONT_D,makeChar,CHM} from './core.js';
import {prop,fac,pot,rails,stringLights} from './arch.js';
const PI=Math.PI;
const rect=(x0,x1,z0,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
/* local (lx,lz) of something turned by ry and placed at (x,z) -> world */
const at=(x,z,ry,lx,lz)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];
const aabb=(x,z,ry,w,d0,d1)=>{const pts=[[-w/2,d0],[w/2,d0],[-w/2,d1],[w/2,d1]].map(([a,b])=>at(x,z,ry,a,b));const xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]);return[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs)]};

/* a parked vehicle: long axis along local z */
function car(S,x,z,ry,c,o={}){const p=prop(S,x,0,z,ry);const L=o.L||4.4,W=o.W||1.9,h=o.h||1.45;
  p.box(0,.62,0,W,.7,L,c);p.box(0,h-.18,o.cab||-.2,W-.12,.62,L*.55,c);p.box(0,h-.16,(o.cab||-.2)+L*.275+.01,W-.2,.5,.02,'#22313f');p.box(0,h-.16,(o.cab||-.2)-L*.275-.01,W-.2,.5,.02,'#22313f');
  for(const s of[-1,1])p.box(s*(W/2-.05),h-.16,o.cab||-.2,.02,.46,L*.5,'#22313f');
  for(const sx of[-1,1])for(const sz of[-1,1])p.wheel(sx*(W/2-.02),.36,sz*(L/2-.8),.36,.26);
  p.box(0,.6,L/2+.01,W-.3,.18,.02,'#fff6d8');const r=aabb(x,z,ry,W,-L/2,L/2);col(r[0],r[1],0,h,r[2],r[3]);return p}

/* ======================================================================
   PM HOUSE: ultra high security. Walled compound, closed gate, army, SPG,
   press camped outside. No one gets in without authorisation.
   ====================================================================== */
export function pmHouse(scene,ctx){const {S,WIN,LMP,addPlane}=ctx;
  const X0=110.3,X1=172,Z0=10.6,WX0=112,WX1=170.4,WZ0=22,WZ1=58.4,WH=4.2,gx=141,GW=4,SAND='#c98a5e',CREAM='#efe6d2',OL='#4b5320',DK='#2b2d31';
  blk(S,X0,X1,0,.05,Z0,WZ0,'#cfcac0',false);for(let x=X0+2;x<X1;x+=4)bx(S,x,.056,(Z0+WZ0)/2,.08,.01,WZ0-Z0-.4,'#bdb7ab');
  blk(S,WX0,WX1,0,.045,WZ0,WZ1,'#5f9e4a',false);
  /* the wall: sandstone, cream coping, iron spikes all along the top */
  const wall=(x0,x1,z0,z1)=>{blk(S,x0,x1,0,WH,z0,z1,SAND);blk(S,x0-.1,x1+.1,WH,WH+.22,z0-.1,z1+.1,CREAM,false);const ax=x1-x0>z1-z0,len=ax?x1-x0:z1-z0;
    bx(S,(x0+x1)/2,WH+.62,(z0+z1)/2,ax?len:.06,.06,ax?.06:len,'#1d1d1d');for(let u=.4;u<len;u+=.8)bx(S,ax?x0+u:(x0+x1)/2,WH+.5,ax?(z0+z1)/2:z0+u,.06,.6,.06,'#1d1d1d')};
  wall(WX0,gx-GW-1.2,WZ0,WZ0+.6);wall(gx+GW+1.2,WX1,WZ0,WZ0+.6);wall(WX0,WX0+.6,WZ0,WZ1);wall(WX1-.6,WX1,WZ0,WZ1);wall(WX0,WX1,WZ1-.6,WZ1);
  col(WX0,WX1,0,WH+.8,WZ1-.6,WZ1);
  /* main gate: two pillars with lamps, closed steel gates with a gold ring */
  for(const s of[-1,1]){const x=gx+s*(GW+.6);blk(S,x-.6,x+.6,0,5.4,WZ0-.3,WZ0+.9,CREAM);bx(S,x,5.55,WZ0+.3,1.5,.3,1.5,SAND);bx(LMP,x,6.05,WZ0+.3,.5,.7,.5,'#fff6d8')}
  blk(S,gx-GW,gx+GW,0,.06,WZ0+.15,WZ0+.45,DK,false);
  /* two gate leaves on hinges (they swing inwards for authorised players) */
  const leaf=sd=>{const b=new Batch();for(let u=.2;u<GW;u+=.36)bx(b,sd*u,1.9,0,.1,3.5,.1,DK);for(const y of[.6,1.9,3.5])bx(b,sd*GW/2,y,0,GW,.14,.14,DK);bx(b,sd*(GW-.05),1.9,0,.1,3.5,.18,'#141414');
    const r=new THREE.TorusGeometry(.6,.07,8,24);r.translate(sd*GW/2,2.2,-.18);b.add(r,'#c9a227');const h=new THREE.CylinderGeometry(.12,.12,.08,12);h.rotateX(PI/2);h.translate(sd*GW/2,2.2,-.18);b.add(h,'#c9a227');
    for(let k=0;k<12;k++)bx(b,sd*GW/2,2.2,-.18,.035,1.15,.03,'#c9a227',0,0,k/12*PI);const g=new THREE.Group();g.position.set(gx-sd*GW,0,WZ0+.3);const m=b.mesh(CHM);m.castShadow=true;g.add(m);scene.add(g);return g};
  const gL=leaf(1),gR=leaf(-1),cGate=col(gx-GW,gx+GW,0,WH+.6,WZ0,WZ0+.6);
  addPlane(scene,7,1.05,signTex('PM HOUSE','#efe6d2','#5a3b1e',768,116),[gx-11.5,2.9,WZ0-.02],PI,null);
  addPlane(scene,7,1.05,signTex('NO ENTRY WITHOUT AUTHORISATION','#c62828','#ffffff',1024,150),[gx+11.5,2.9,WZ0-.02],PI,null);
  for(const x of[WX0+8,WX1-8])addPlane(scene,4.2,.7,signTex('RESTRICTED AREA · PHOTOGRAPHY PROHIBITED','#141414','#ffcc3a',1024,170),[x,2.4,WZ0-.02],PI,null);
  /* checkpoint outside the gate: boom barrier, tyre killers, sentry boxes, bollards */
  let gB,cBoom;{const z=WZ0-4.2;blk(S,gx-GW-.9,gx-GW-.3,0,1.2,z-.3,z+.3,'#f4f1ea');const b=new Batch();for(let i=0;i<9;i++)bx(b,.7+i*.9,0,0,.9,.14,.14,i%2?'#ffffff':'#c62828');gB=new THREE.Group();gB.position.set(gx-GW-.6,1,z);gB.add(b.mesh(CHM));scene.add(gB);cBoom=col(gx-GW,gx+GW+.4,.75,1.25,z-.12,z+.12);
    for(let x=gx-GW;x<gx+GW;x+=.5){const g=new THREE.ConeGeometry(.08,.18,4);g.translate(x,.09,z+1.4);S.add(g,'#ffcc3a')}bx(S,gx,.02,z+1.4,GW*2,.04,.5,'#141414')}
  for(const s of[-1,1]){const x=gx+s*(GW+3.4),z=WZ0-1.3;const sb=prop(S,x,0,z);sb.box(0,1.3,0,1.5,2.6,1.5,'#f4f1ea');for(let k=0;k<5;k++)sb.box(0,.3+k*.5,.76,1.5,.18,.02,k%2?'#ff9933':'#138808');sb.box(0,1.7,.77,.9,.7,.02,'#22313f');sb.box(0,2.72,0,1.9,.18,1.9,OL);col(x-.75,x+.75,0,2.6,z-.75,z+.75)}
  for(let x=X0+2;x<X1-1;x+=3.2){if(Math.abs(x-gx)<GW+1.5)continue;cyl(S,x,.45,Z0+.6,.16,.18,.9,'#f4f1ea',10);bx(S,x,.62,Z0+.6,.34,.12,.34,'#c62828');col(x-.18,x+.18,0,.9,Z0+.42,Z0+.78)}
  /* sandbag bunkers with soldiers */
  const bunker=(x,z,face)=>{for(let k=0;k<11;k++){const a=face-PI/2+k/10*PI,r=1.7;for(let j=0;j<3;j++)bx(S,x+Math.sin(a)*r,.2+j*.36,z+Math.cos(a)*r,.7,.34,.42,j%2?'#a89270':'#9b8563',-a)}col(x-1.9,x+1.9,0,1.1,z-1.9,z+1.9);
    G.extraNPCs.push({name:'Army jawan',look:{shirt:OL,pants:OL,hair:'cap',hat:'#2f3a1f',face:'flat',mustache:true,long:true},x,z,yaw:face,lines:['Halt! This is an ultra high security zone.','Step back from the bunker, please.'],barks:['Jai Hind.','Halt!']})};
  bunker(116.4,17.2,0);bunker(165.6,17.2,0);
  /* army trucks and a jeep on the east side of the forecourt */
  {const t=prop(S,158,0,15.4,PI/2);t.box(0,1.2,2.6,2.4,1.9,2,OL);t.box(0,1.75,3.62,2.2,.8,.04,'#22313f');t.box(0,1.05,-1.2,2.5,.5,5.6,OL);t.box(0,2.15,-1.2,2.5,1.9,5.6,'#5a6332');t.box(0,3.12,-1.2,2.46,.12,5.5,'#5a6332');
    for(const sx of[-1,1])for(const sz of[3,-.3,-2.8])t.wheel(sx*1.15,.52,sz,.52,.4);col(153.6,162.4,0,3.2,14.1,16.7);
    addPlane(scene,1.6,.5,signTex('ARMY','#5a6332','#f4f1ea',256,80),[158,2.5,16.66],0,null)}
  car(S,166.6,18.6,0,OL,{L:4,W:1.8,h:1.9,cab:-.4});
  /* press camp on the west side: two OB vans with dishes, cameras on tripods, mic stand */
  for(const [x,nm,c2] of[[118.6,'NEWS 24×7','#c62828'],[127.6,'KHABAR LIVE','#1d6fb8']]){const z=14.6,v=prop(S,x,0,z,PI/2);v.box(0,1.55,0,2.3,2.5,6,'#f4f1ea');v.box(0,1.1,0,2.32,.5,6.02,c2);v.box(0,1.95,2.62,2.2,.8,.04,'#22313f');
    for(const sx of[-1,1])for(const sz of[-1.9,1.9])v.wheel(sx*1.1,.4,sz,.4,.3);v.cyl(0,3,-1.4,.08,.08,.5,'#9aa3ad',8);v.box(0,3.3,-1.4,.1,.1,.1,'#9aa3ad');
    {const d=new THREE.SphereGeometry(.85,16,8,0,PI*2,0,PI/2.6);d.rotateX(-1.1);d.translate(x-1.4,3.5,z);S.add(d,'#ffffff')}
    v.cyl(0,4.1,1.2,.06,.06,2.4,'#9aa3ad',8);col(x-3,x+3,0,2.9,z-1.15,z+1.15);
    for(const [dz,ry] of[[1.17,0],[-1.17,PI]])addPlane(scene,3.6,.7,signTex(nm,c2,'#ffffff',512,100),[x,2.2,z+dz],ry,null)}
  const tripod=(x,z,yaw)=>{const p=prop(S,x,0,z,yaw);for(let k=0;k<3;k++){const a=k/3*PI*2;p.box(Math.sin(a)*.22,.7,Math.cos(a)*.22,.04,1.45,.04,'#1d1d1d',Math.cos(a)*.15,-Math.sin(a)*.15)}p.box(0,1.48,0,.3,.32,.55,'#2b2b2b');p.cyl(0,1.5,.36,.09,.11,.2,'#141414',10,PI/2);col(x-.3,x+.3,0,1.6,z-.3,z+.3)};
  const PRESS=[['Reporter Ritika',['We are live outside PM House, where security is tighter than ever.','Back to you in the studio. Again.'],'#ff6a3d','long'],['Cameraman Babloo',['Twelve hours on this tripod. My legs are now part of it.'],'#3d7be8','cap'],
    ['Reporter Arjun',['Sources say the meeting is running late. Sources always say that.','Can I get a quote? Anything? A nod?'],'#ffffff','short'],['Cameraman Shakti',['If the gate moves one inch, I am rolling.'],'#ffcc3a','curly2'],
    ['Reporter Meera',['Day three of waiting outside. The chai here is excellent, at least.'],'#a463ff','bun'],['Photographer Sunny',['One clean photo of the gate. That is all I ask of life.'],'#5cc46b','short']];
  PRESS.forEach(([name,lines,sh,hair],i)=>{const x=115+i*3.2,z=19.6,yaw=Math.atan2(gx-x,WZ0+2-z);G.extraNPCs.push({name,look:{shirt:sh,pants:i%2?'#3a4a6b':'#141414',hair,face:i%2?'flat':'o'},x,z,yaw:Math.atan2(gx-x,WZ0+2-z),lines,barks:['Breaking news!','Camera rolling!','Any comment?','Live in 3, 2, 1…']});
    if(/Camera|Photo/.test(name))tripod(x+Math.sin(yaw)*.9+.4,z+.7,yaw)});
  {const x=133.4,z=19;cyl(S,x,.03,z,.25,.25,.06,'#1d1d1d',10);cyl(S,x,.7,z,.03,.03,1.4,'#1d1d1d',6);for(let k=0;k<4;k++){cyl(S,x-.15+k*.1,1.45,z,.04,.04,.18,'#141414',8);bx(S,x-.15+k*.1,1.58,z,.08,.06,.08,['#c62828','#1d6fb8','#ffcc3a','#5cc46b'][k])}col(x-.3,x+.3,0,1.6,z-.3,z+.3)}
  for(let x=113.2;x<134;x+=2.2){bx(S,x,.55,21.2,2,.06,.05,'#ffcc3a');bx(S,x,.95,21.2,2,.06,.05,'#ffcc3a');bx(S,x-.95,.5,21.2,.06,1,.4,'#1d1d1d')}col(112.4,134.2,0,1,21.05,21.35);
  /* army and SPG at the gate */
  const SPG={shirt:'#141414',pants:'#141414',tie:'#141414',hair:'short',shades:true,face:'flat',long:true},ARMY={shirt:OL,pants:OL,hair:'cap',hat:'#2f3a1f',face:'flat',mustache:true,long:true};
  G.extraNPCs.push({name:'SPG Officer',look:SPG,x:gx-2.4,z:WZ0-2.2,yaw:PI,lines:['Sir, step back. No entry without authorisation.','Your name is not on the list. Nobody\'s name is on the list.'],barks:['Clear the gate.','Step back.']},
    {name:'SPG Officer',look:Object.assign({},SPG,{hair:'buzz'}),x:gx+2.4,z:WZ0-2.2,yaw:PI,lines:['We do not talk to the press. Or to you.','Earpiece says: no.'],barks:['Copy that.','Area secure.']},
    {name:'Army Havildar',look:ARMY,x:gx-GW-3.4,z:WZ0-2.6,yaw:PI,lines:['Halt! Ultra high security area.','Authorised personnel only. Turn around, please.'],barks:['Jai Hind.','Halt!']},
    {name:'Army jawan',look:Object.assign({},ARMY,{mustache:false}),x:gx+GW+3.4,z:WZ0-2.6,yaw:PI,lines:['Day and night, this gate stays shut.'],barks:['Jai Hind.','Keep moving.']},
    {name:'Army jawan',look:ARMY,x:150.5,z:19.6,yaw:PI,lines:['Our truck. Do not lean on it.'],barks:['Jai Hind.']},{name:'Army jawan',look:Object.assign({},ARMY,{mustache:false}),x:152.3,z:19.6,yaw:PI,lines:['Eyes forward.'],barks:['Halt!']});
  G.triggers.push({x:gx,z:WZ0-3.2,r:2.6,get label(){return G.pmAuth&&G.pmAuth()?'Enter PM House':'Request entry'},act:()=>G.denied&&G.denied()});
  ctx.W.pmGate={x:gx,z:WZ0,L:gL,R:gR,B:gB,cGate,cBoom,y1Gate:cGate.y1,y1Boom:cBoom.y1,k:0};
  /* inside: Lutyens-style white bungalow with a colonnaded verandah, porch, flag, helipad, black SUVs */
  const BW='#f4f1ea',bx0=124,bx1=158,bz0=35,bz1=51,BH=6.4;
  blk(S,bx0,bx1,0,1,bz0,bz1,SAND);blk(S,bx0+.3,bx1-.3,1,BH,bz0+.3,bz1-.3,BW);blk(S,bx0-.2,bx1+.2,BH,BH+.5,bz0-3.6,bz1+.2,CREAM,false);blk(S,bx0,bx1,BH+.5,BH+1.2,bz0,bz1,BW,false);
  blk(S,bx0,bx1,0,1,bz0-3.4,bz0,SAND,false);for(let x=bx0+1;x<=bx1-1;x+=2.4){cyl(S,x,3.7,bz0-3,.26,.3,5.4,BW,12);bx(S,x,6.25,bz0-3,.7,.25,.7,CREAM)}
  {const F=fac({x0:bx0,x1:bx1,z0:bz0+.3,z1:bz1},'n');for(let u=bx0+2.2;u<bx1-1;u+=2.4){F.box(WIN,u,3.2,.04,1.2,2.2,.08,'#ffffff');F.box(S,u,4.5,.08,1.5,.18,.16,SAND)}}
  for(const side of['e','w','s']){const F=fac({x0:bx0+.3,x1:bx1-.3,z0:bz0+.3,z1:bz1-.3},side);const lo=side==='s'?bx0+2:bz0+2,hi=side==='s'?bx1-2:bz1-2;for(let u=lo;u<=hi;u+=3)F.box(WIN,u,3.4,.04,1.3,2.2,.08,'#ffffff')}
  blk(S,gx-5,gx+5,0,1.05,bz0-7.2,bz0-3.4,SAND,false);for(const [x,z] of[[gx-4.6,bz0-6.8],[gx+4.6,bz0-6.8]]){cyl(S,x,3.2,z,.3,.34,4.4,BW,12)}blk(S,gx-5.3,gx+5.3,5.3,5.8,bz0-7.4,bz0-3.4,CREAM,false);
  cyl(S,gx,BH+4.2,(bz0+bz1)/2,.07,.09,7,'#d9d9d9',8);for(const [k,c] of[['#ff9933',.42],['#ffffff',0],['#138808',-.42]])bx(S,gx+1.25,BH+6.9+c,(bz0+bz1)/2,2.4,.42,.04,k);
  {const r=new THREE.TorusGeometry(.17,.03,6,18);r.translate(gx+1.25,BH+6.9,(bz0+bz1)/2+.03);S.add(r,'#1d3a8a')}
  blk(S,gx-2.6,gx+2.6,0,.06,WZ0+.6,bz0-7.2,'#b9b2a5',false);
  for(const s of[-1,1])for(let z=WZ0+3;z<bz0-8;z+=2.6)bx(S,gx+s*3.6,.4,z,.8,.8,1.8,'#2f6b34');
  for(const [x,z] of[[gx-1.3,25.2],[gx+1.3,25.2]])car(S,x,z,0,'#141414',{L:4.8,W:2,h:1.85,cab:-.3});
  {const hx=160.6,hz=48.4;cyl(S,hx,.07,hz,5,5,.05,'#3a3d44',28);const g=new THREE.RingGeometry(4.2,4.5,32);g.rotateX(-PI/2);g.translate(hx,.1,hz);S.add(g,'#ffcc3a');bx(S,hx-1,.1,hz,.4,.01,3,'#ffffff');bx(S,hx+1,.1,hz,.4,.01,3,'#ffffff');bx(S,hx,.1,hz,2,.01,.4,'#ffffff')}
  for(const [x,z] of[[WX0+1.4,WZ1-1.4],[WX1-1.4,WZ1-1.4],[WX0+1.4,WZ0+1.4],[WX1-1.4,WZ0+1.4]]){cyl(S,x,3.2,z,.08,.1,6.4,'#9aa3ad',8);bx(S,x,6.4,z,.3,.24,.5,'#f4f1ea')}
  G.extraNPCs.push({name:'SPG Officer',look:SPG,x:gx-3.4,z:bz0-5.2,yaw:PI,lines:['…'],barks:['Perimeter clear.']},{name:'SPG Officer',look:SPG,x:gx+3.4,z:bz0-5.2,yaw:PI,lines:['…'],barks:['Copy.']});
  G.patrols=G.patrols||[];G.patrols.push({look:SPG,name:'SPG patrol',path:[[WX0+2.6,WZ0+2.6],[WX1-2.6,WZ0+2.6],[WX1-2.6,WZ1-2.6],[WX0+2.6,WZ1-2.6]],speed:1.6},
    {look:ARMY,name:'Army patrol',path:[[WX1-2.6,WZ1-2.6],[WX0+2.6,WZ1-2.6],[WX0+2.6,WZ0+2.6],[WX1-2.6,WZ0+2.6]],speed:1.4});
  G.noGrass.push([X0,X1,Z0,WZ1]);G.blocked.push([X0,X1,Z0,59.2]);G.noLamp.push([gx-9,gx+9,6,24]);
  G.mapPolys.push({pts:rect(X0,X1,Z0,WZ0),col:'#bdb7ab'},{pts:rect(WX0,WX1,WZ0,WZ1),col:'#a9a9a9'});
  G.buildings.push({name:'PM House',short:'PM House',x0:bx0,x1:bx1,z0:bz0-3.4,z1:bz1,col:'#f4f1ea',label:true})}

/* ======================================================================
   LOLU MALL: four floors. G hypermarket + electronics, 1 fashion,
   2 games, 3 Lolu Cinemas. Black drop-off forecourt in front.
   ====================================================================== */
export function loluMall(scene,ctx){const {S,WIN,LMP,addPlane}=ctx;
  const X0=16,X1=102,Z0=-108,Z1=-36,FH=6,H=FH*4,LI='#e2a8f0',PU='#6d3a8a',WH='#f8f3fb',cx=59,AX0=50,AX1=68;
  /* forecourt: asphalt, a drop-off lane, an island with flags, parking bays and a taxi/auto rank */
  blk(S,14.3,103.1,0,.045,Z1,-11.5,'#232427',false);
  for(let x=18;x<100;x+=3)bx(S,x,.05,-20.8,1.6,.01,.14,'#f4f1ea');bx(S,59,.05,-13.2,84,.01,.14,'#ffcc3a');
  blk(S,36,82,0,.22,-26.4,-23,'#cfcac0',false);col(36,82,0,.22,-26.4,-23);for(let x=38;x<82;x+=4)pot(S,x,-24.7,'#6d3a8a','#3f9b4a',.5);
  for(const x of[44,59,74]){cyl(S,x,4.5,-24.7,.06,.08,9,'#d9d9d9',8);bx(S,x+.9,8.4,-24.7,1.7,1,.03,[ '#e2a8f0','#ffcc3a','#3bd1ff'][(x-44)/15])}
  for(let k=0;k<8;k++){const x=19+k*2.8;bx(S,x-1.4,.05,-16.6,.1,.01,5,'#f4f1ea');if(k<7&&k%3!==1)car(S,x,-16.6,0,['#e94b3c','#f4f1ea','#3d7be8','#2b2b2b','#5cc46b'][k%5])}
  for(let k=0;k<8;k++){const x=79.4+k*2.8;bx(S,x-1.4,.05,-16.6,.1,.01,5,'#f4f1ea');if(k%2===0){const a=prop(S,x,0,-16.6,0);a.box(0,.7,.2,1.3,.9,2.2,'#2e7d32');a.box(0,1.45,-.1,1.3,.7,1.6,'#ffcc3a');a.box(0,1.86,-.1,1.4,.08,1.8,'#141414');a.wheel(0,.25,1.1,.25,.14);for(const s of[-1,1])a.wheel(s*.6,.25,-.6,.25,.14);col(x-.7,x+.7,0,1.9,-17.8,-15.4)}}
  addPlane(scene,3,.5,signTex('TAXI · AUTO','#ffcc3a','#141414',512,86),[90,2.6,-14.2],0,null);cyl(S,90,1.2,-14.3,.05,.05,2.4,'#9aa3ad',6);
  /* the building: lilac, a glass band on every shopping floor, cinema floor solid with a big sign */
  blk(S,X0,X1,0,H,Z0,Z1,LI);blk(S,X0-.25,X1+.25,H,H+.9,Z0-.25,Z1+.25,WH,false);
  for(let f=0;f<4;f++){const y=f*FH;bx(S,(X0+X1)/2,y+FH-.2,Z1+.12,X1-X0+.3,.4,.3,WH);
    for(const side of['s','e','w']){const F=fac({x0:X0,x1:X1,z0:Z0,z1:Z1},side);const lo=side==='s'?X0+2:Z0+3,hi=side==='s'?X1-2:Z1-3;
      if(f<3)for(let u=lo;u<hi;u+=4.6){if(side==='s'&&u>AX0-2.5&&u<AX1+2.5)continue;F.box(WIN,u+2.2,y+3,.04,4.2,3.6,.08,'#ffffff')}}}
  /* glass atrium cube at the centre of the front, full height, LOLU MALL on top */
  blk(S,AX0,AX1,0,H+2,Z1,Z1+4,'#cfe6f2');for(let x=AX0;x<=AX1;x+=2)bx(S,x,(H+2)/2,Z1+4.02,.16,H+2,.12,WH);for(let y=3;y<H+2;y+=3)bx(S,cx,y,Z1+4.04,AX1-AX0,.14,.12,WH);
  bx(WIN,cx,H/2+1,Z1+4.01,AX1-AX0-.4,H+1.4,.04,'#ffffff');
  addPlane(scene,22,4.2,signTex('LOLU MALL',PU,'#ffffff',1024,196),[cx,H+4.6,Z1+3],0,null);blk(S,cx-11.4,cx+11.4,H+2.4,H+6.8,Z1+2.7,Z1+2.95,PU,false);
  blk(S,AX0-3,AX1+3,5.2,5.6,Z1+4,Z1+8.4,WH,false);for(const x of[AX0-2.6,AX1+2.6])cyl(S,x,2.6,Z1+8,.2,.2,5.2,'#d9d9d9',10);for(let x=AX0-2.6;x<=AX1+2.6;x+=1.4)bx(LMP,x,5.12,Z1+8.2,.3,.06,.3,'#fff6d8');
  bx(S,cx,1.6,Z1+4.06,4.4,3.2,.1,'#2a2a2a');bx(S,cx,1.6,Z1+4.1,.08,3.2,.1,'#9aa3ad');
  /* cinema floor: LOLU CINEMAS + a now-showing billboard */
  addPlane(scene,30,3.2,signTex('LOLU CINEMAS','#141414','#ffcc3a',1024,110),[cx-24,FH*3+3,Z1+.14],0,null);
  addPlane(scene,14,4.6,posterTexLocal('NOW SHOWING','CUP FIRST 2','The cortado strikes back. Top floor, every show.','#1a1030','#ffcc3a'),[cx+26,FH*3+3,Z1+.14],0,null);
  for(let x=X0+3;x<X1;x+=6)bx(LMP,x,H+.95,Z1+.3,.3,.1,.3,'#fff6d8');
  G.triggers.push({x:cx,z:Z1+5.6,r:2.4,label:'Enter Lolu Mall',act:()=>G.enter('mallG')});
  G.noGrass.push([14.3,103.1,-109.4,-11.5]);G.blocked.push([12,104,-110,-11]);G.noLamp.push([AX0-4,AX1+4,-14,-6]);
  G.mapPolys.push({pts:rect(14.3,103.1,Z1,-11.5),col:'#232427'},{pts:rect(X0,X1,Z0,Z1),col:LI});
  G.buildings.push({name:'Lolu Mall',short:'Lolu Mall',x0:X0,x1:X1,z0:Z0,z1:Z1,col:LI,door:{x:cx,z:Z1+6.4},room:'mallG'});
  return{x:cx,z:Z1+6.4,fx:0,fz:1}}
function posterTexLocal(k,t,b,bg,fg){return tex(700,230,(c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.fillStyle=fg;c.font='700 26px '+FONT_T;c.fillText(k,28,46);let s=92;c.font='400 '+s+'px '+FONT_D;while(c.measureText(t).width>w-56){s-=6;c.font='400 '+s+'px '+FONT_D}c.fillText(t,28,140);c.fillStyle='#ffffff';c.font='600 24px '+FONT_T;c.fillText(b,28,196)})}

/* ======================================================================
   CHOUPATI: the food street. A kiosk for every food brand.
   ====================================================================== */
export const BRANDS=[
  {n:'TOKI',c:'#f3eee6',c2:'#1f3a5f',fg:'#f3eee6',top:'cup',tag:'Specialty coffee & chocolatiers',st:'Concept',d:'Specialty coffee and chocolatiers. Espresso, pour-over and filter kaapi. Cup first, then the numbers.',v:['TOKI barista',['Welcome to TOKI. Want to pull one yourself? Step up to the counter.','Single origin this week. Ask me about the bean.'],['Cortado?','Freshly pulled!']]},
  {n:'Spreewalk',c:'#e94b3c',c2:'#ffffff',fg:'#e94b3c',top:'burger',d:'Smash burgers, quick lines and lakefront vibes. A burger kiosk planned for Marine Drive, Raipur.',v:['Spreewalk cook',['Smash patty, extra cheese, no regrets.','The line moves fast. The burger does not.'],['Burger up!','Smash time!']]},
  {n:'Chaats.io',c:'#ffcc3a',c2:'#2e7d32',fg:'#ffcc3a',top:'bowl',d:'Chaat, done properly: crisp, tangy and quick. An anchor brand of a planned multi-brand cloud kitchen.',v:['Chaats.io bhaiya',['Pani puri, papdi chaat, sev puri. Tell me your spice level and I will double it.'],['Teekha ya meetha?','Ek aur?']]},
  {n:'Zafrane',c:'#1a1a1a',c2:'#d62828',fg:'#ff3b30',top:'flame',d:'Bold, fiery food with a black-and-red, flame-and-chill look. The other anchor brand of the planned cloud kitchen.',v:['Zafrane chef',['Flame first, chill after. That is the Zafrane way.'],['Feel the heat!','Order up!']]},
  {n:'Waff Waff',c:'#fff06b',c2:'#8b5a2b',fg:'#fff06b',top:'waffle',d:'Waffles, crisp outside and soft inside. Planned for Baloda Bazar, Raipur, Jaipur and Bhilai.',v:['Waff Waff girl',['Crisp outside, soft inside. Extra chocolate is not optional.'],['Waff waff!','Fresh off the iron!']]},
  {n:'Gothic Bakehouse',c:'#2b1f1f',c2:'#d9d4c4',fg:'#d9d4c4',top:'loaf',d:'Gothic, an artisan bakehouse and chocolatiers (once Golden Crust). Fresh bakes, dark chocolate, darker decor.',href:'https://cookies.outpulse.company',v:['Gothic baker',['Fresh bakes every morning. The chocolate is dark, like the decor.'],['Croissants!','Warm bread!']]},
  {n:'The Tiramisu Theory',c:'#f4e3c9',c2:'#6b4226',fg:'#f4e3c9',top:'cake',d:'A dessert cart and parlour built around one obsession: properly made tiramisu.',v:['Tiramisu Theory',['One obsession: tiramisu. Properly soaked, properly set.'],['Tiramisu?','Last few cups!']]},
  {n:'The Dough Theory',c:'#f6e7c1',c2:'#c0392b',fg:'#f6e7c1',top:'pizza',d:'Artisanal breads, toasts and pizza. A sibling to The Tiramisu Theory.',v:['Dough Theory baker',['Slow-fermented dough. Patience first, then pizza.'],['Pizza in five!','Hot toast!']]},
  {n:'FLTTR',c:'#141414',c2:'#c9f26b',fg:'#c9f26b',top:'can',d:'A premium canned coffee brand, positioned to take on the big chains with better beans and cleaner design.',v:['FLTTR crew',['Canned coffee, cold and clean. Crack one open.'],['Ice cold!','FLTTR?']]},
  {n:'Handi Biryani House',c:'#c1693c',c2:'#f6efe2',fg:'#c1693c',top:'handi',d:'A Champaran-style handi biryani outlet, slow-cooked in sealed clay pots. Planned for Baloda Bazar.',v:['Biryani ustaad',['Champaran handi biryani, sealed in clay and slow-cooked.'],['Handi khul gayi!','Garam garam!']]},
  {n:'Cafein',c:'#3e2723',c2:'#ffb74d',fg:'#ffb74d',top:'bean',d:'A neighbourhood cafe planned for Baloda Bazar. Small cafe, big cups.',v:['Cafein barista',['A small cafe with big cups. Come sit a while.'],['Chai or coffee?','Refill?']]}];
function topper(p,kind,b){const y=4.15;
  if(kind==='cup'){p.cyl(0,y+.55,0,.75,.55,1.1,'#ffffff',16);p.cyl(0,y+1.08,0,.68,.68,.06,'#6b4226',16);p.box(.86,y+.6,0,.3,.5,.12,'#ffffff')}
  else if(kind==='burger'){p.cyl(0,y+.95,0,1.1,1.1,.45,'#d9963b',18);p.cyl(0,y+.65,0,1.15,1.15,.2,'#6b3e22',18);p.cyl(0,y+.5,0,1.25,1.25,.1,'#ffcc3a',18);p.cyl(0,y+.38,0,1.2,1.2,.1,'#4caf50',18);p.cyl(0,y+.18,0,1.1,1.1,.26,'#d9963b',18)}
  else if(kind==='bowl'){p.cyl(0,y+.35,0,1,.55,.7,'#c0392b',16);for(let k=0;k<6;k++){const a=k/6*PI*2;p.sph(Math.cos(a)*.5,y+.78,Math.sin(a)*.5,.26,'#e8b04a')}}
  else if(kind==='flame'){p.cone(0,y+.9,0,.8,1.8,'#d62828',8,0);p.cone(0,y+.75,0,.5,1.2,'#ff9a1f',8,0);p.cone(0,y+.6,0,.25,.7,'#ffd54f',8,0)}
  else if(kind==='waffle'){p.box(0,y+.6,0,1.8,1.8,.25,'#d9a441',.0);for(let k=-2;k<=2;k++){p.box(k*.34,y+.6,.14,.06,1.7,.06,'#8b5a2b');p.box(0,y+.6+k*.34,.14,1.7,.06,.06,'#8b5a2b')}}
  else if(kind==='loaf'){p.sph(0,y+.5,0,1,'#a8692f',1.4,.7,.8,14);for(let k=-1;k<=1;k++)p.box(k*.45,y+.95,0,.12,.06,.9,'#e8c48a',0,0,.4)}
  else if(kind==='cake'){p.box(0,y+.25,0,1.6,.5,1,'#f4e3c9');p.box(0,y+.55,0,1.6,.1,1,'#6b4226');p.box(0,y+.8,0,1.6,.4,1,'#f9efdf');p.box(0,y+1.03,0,1.6,.06,1,'#5a3a22')}
  else if(kind==='pizza'){p.cyl(0,y+.3,0,1.3,1.3,.16,'#e8b04a',20,PI/2.6);for(let k=0;k<6;k++){const a=k/6*PI*2;p.cyl(Math.cos(a)*.6,y+.38+Math.sin(a)*.2,Math.sin(a)*.3,.17,.17,.05,'#c0392b',10,PI/2.6)}}
  else if(kind==='can'){p.cyl(0,y+.8,0,.55,.55,1.6,'#141414',16);p.cyl(0,y+.8,0,.56,.56,.5,'#c9f26b',16);p.cyl(0,y+1.62,0,.5,.5,.06,'#9aa3ad',16)}
  else if(kind==='handi'){p.sph(0,y+.6,0,.9,'#8a4a2a',1,.85,1,14);p.cyl(0,y+1.25,0,.6,.7,.25,'#8a4a2a',14);p.cyl(0,y+1.42,0,.7,.7,.1,'#e8d9b8',14)}
  else if(kind==='bean'){p.sph(0,y+.7,0,.85,'#5d3a1a',1,1.3,.8,12);p.box(0,y+.7,.62,.08,1.6,.06,'#2b1608')}}
export function choupati(scene,ctx){const {S,WIN,LMP,addPlane,bench}=ctx;const X0=60.7,X1=111.7,Z0=130,Z1=174.3,cx=86.2;
  blk(S,X0,X1,0,.05,Z0,Z1,'#ead9b5',false);for(let z=Z0+3;z<Z1;z+=3)bx(S,(X0+X1)/2,.056,z,X1-X0-.4,.01,.08,'#dcc89f');
  /* entrance arch */
  for(const x of[cx-7,cx+7]){blk(S,x-.6,x+.6,0,6,Z0+1.4,Z0+2.6,'#c62828');bx(S,x,6.2,Z0+2,1.5,.4,1.5,'#ffd23f')}
  bx(S,cx,6.1,Z0+2,15.2,1.5,.5,'#c62828');for(const [z,ry] of[[Z0+1.73,PI],[Z0+2.27,0]])addPlane(scene,12.6,1.3,signTex('CHOUPATI','#ffd23f','#c62828',1024,106),[cx,6.1,z],ry,null);
  for(let x=cx-7.4;x<=cx+7.4;x+=.74)bx(LMP,x,6.92,Z0+2,.14,.14,.14,['#ff6a3d','#ffd23f','#3bd1ff','#ff8fc1'][Math.round((x-cx+7.4)/.74)%4]);
  /* kiosks: four down the west side, three across the back, four down the east side */
  const spots=[];for(const z of[137,145.5,154,162.5])spots.push([64.6,z,PI/2]);for(const x of[75,cx,97.4])spots.push([x,171.2,PI]);for(const z of[137,145.5,154,162.5])spots.push([107.8,z,-PI/2]);
  BRANDS.forEach((b,i)=>{const [x,z,ry]=spots[i];const p=prop(S,x,0,z,ry);
    p.box(0,1.55,-.3,5.6,3.1,3.4,b.c);p.box(0,3.2,-.1,6,.22,4,b.c2);p.box(0,.55,1.62,5.4,1.1,.6,b.c2);p.box(0,1.14,1.75,5.6,.08,.9,'#f4efe6');p.box(0,2.05,1.38,4.8,1.5,.05,'#2a2a2a');
    for(let k=0;k<8;k++)p.box(-2.62+k*.75,2.82,2.25,.75,.07,1.2,k%2?'#ffffff':b.c2,.42);
    p.box(0,3.85,1.4,5.2,1.1,.14,'#141414');for(const s of[-1,1])p.box(s*2.4,3.4,1.4,.12,.9,.12,'#141414');topper(p,b.top,b);
    for(let k=0;k<3;k++)p.box(-1.6+k*1.6,1.25,1.95,.36,.16+k%2*.1,.36,['#ffffff',b.c2,'#ffcc3a'][k]);
    const [sx,sz]=at(x,z,ry,0,1.49);addPlane(scene,5,1,signTex(b.n.toUpperCase(),b.c2,b.fg,768,154),[sx,3.85,sz],ry,null);
    const r=aabb(x,z,ry,6,-2.1,2.1);col(r[0],r[1],0,3.3,r[2],r[3]);
    const [vx,vz]=at(x,z,ry,0,.75);G.extraNPCs.push({name:b.v[0],look:{shirt:b.c2==='#ffffff'?b.c:b.c2,apron:b.c,hair:['short','long','bun','cap','curly2'][i%5],hat:i%3===0?b.c2:null,face:['grin','smile','o'][i%3],fem:i%2===1},x:vx,z:vz,yaw:ry,lines:b.v[1],barks:b.v[2]});
    const [tx,tz]=at(x,z,ry,0,3.2);const card={n:b.n,tag:b.tag||'Food brand',st:b.st||'Planned',d:b.d,href:b.href||'',color:b.c2};
    if(b.n==='TOKI')G.triggers.push({x:tx,z:tz,r:1.6,label:'Brew a coffee at TOKI',act:()=>G.brew()},{x:at(x,z,ry,-2.4,3)[0],z:at(x,z,ry,-2.4,3)[1],r:1.2,label:'About TOKI',act:()=>G.card(card)});
    else G.triggers.push({x:tx,z:tz,r:1.7,label:'About '+b.n,act:()=>G.card(card)})});
  /* seating in the middle: tables with umbrellas, stools you can sit on */
  const UMB=['#ff6a3d','#ffd23f','#3bd1ff','#ff8fc1','#5cc46b','#a463ff'];let u=0;
  for(const x of[76,cx,96.4])for(const z of[141.5,150.5,159.5]){cyl(S,x,.82,z,.85,.85,.06,'#f4efe6',16);cyl(S,x,.41,z,.07,.09,.82,'#5a5a5a',8);cyl(S,x,1.6,z,.04,.04,3.2,'#9aa3ad',6);const g=new THREE.ConeGeometry(1.9,.7,10);g.translate(x,3.25,z);S.add(g,UMB[u++%6]);col(x-.6,x+.6,0,.88,z-.6,z+.6);
    for(const [dx,dz,yaw] of[[0,1.3,PI],[0,-1.3,0],[1.3,0,-PI/2],[-1.3,0,PI/2]]){cyl(S,x+dx,.24,z+dz,.24,.2,.48,'#c62828',10);G.seats.push({x:x+dx,z:z+dz,y:.52,yaw,label:'Sit and eat'})}}
  for(const [a,b] of[[[69,4.6,135],[103.4,4.6,135]],[[69,4.6,166],[103.4,4.6,166]],[[69,4.6,135],[69,4.6,166]],[[103.4,4.6,135],[103.4,4.6,166]],[[69,4.6,135],[103.4,4.6,166]],[[103.4,4.6,135],[69,4.6,166]]])stringLights(LMP,a,b,26,.6,['#ffd23f','#ff6a3d','#3bd1ff','#ffffff']);
  for(const [x,z] of[[69,135],[103.4,135],[69,166],[103.4,166]]){cyl(S,x,2.4,z,.08,.1,4.8,'#5a5a5a',8);col(x-.12,x+.12,0,4.8,z-.12,z+.12)}
  for(const x of[X0+1.4,X1-1.4])for(let z=Z0+3;z<Z1-2;z+=8)pot(S,x,z,'#c62828','#3f9b4a',.55);
  /* hungry people */
  const FOOD=[['Foodie',['Every kiosk here is someone\'s dream brand. I am just here for the chaat.']],['Hungry student',['I came for one waffle. It has been three waffles.']],['Uncle on a walk',['Doctor said walk daily. He did not say where.']],['Food blogger',['Rating everything ten on ten. My followers trust me.']],['Office crowd',['Lunch break is 30 minutes. The biryani queue is 31.']],['Couple',['We met at this kiosk. Now we fight about toppings.']]];
  const look=i=>({shirt:['#e94b3c','#3d7be8','#ffcc3a','#5cc46b','#ff8fc1','#8a63d2'][i%6],pants:['#141414','#3a4a6b','#6b5a3a'][i%3],hair:['short','long','bun','cap','curly2','side'][i%6],face:['grin','smile','o','smug'][i%4],fem:i%2===1});
  BRANDS.forEach((b,i)=>{if(i%2)return;const [x,z,ry]=spots[i];const [qx,qz]=at(x,z,ry,(i/2)%2?1.9:-1.9,3.4);const f=FOOD[(i/2)%FOOD.length|0];G.extraNPCs.push({name:f[0],look:look(i),x:qx,z:qz,yaw:ry+PI,lines:f[1],barks:['Yum!','Ek plate aur!','So good.']})});
  [[76,141.5,1.3,0],[cx,150.5,-1.3,0],[96.4,159.5,0,1.3],[76,159.5,0,-1.3]].forEach(([x,z,dz,dx],i)=>{const yaw=dz>0?PI:dz<0?0:dx>0?-PI/2:PI/2;G.extraNPCs.push({name:FOOD[(i+3)%6][0],look:look(i+7),x:x+dx,z:z+dz,yaw,sit:true,lines:FOOD[(i+3)%6][1],barks:['Mmm.','Spicy!']});G.seats=G.seats.filter(s=>!(Math.abs(s.x-(x+dx))<.1&&Math.abs(s.z-(z+dz))<.1))});
  G.noGrass.push([X0,X1,Z0,Z1]);G.blocked.push([X0,X1,129,176]);G.noLamp.push([cx-10,cx+10,124,134]);
  G.mapPolys.push({pts:rect(X0,X1,Z0,Z1),col:'#ffe066'});
  G.buildings.push({name:'Choupati',short:'Choupati',x0:X0,x1:X1,z0:Z0,z1:Z1,col:'#ffe066',door:{x:cx,z:Z0+.4},label:true})}

/* grounds around the Outpulse Museum (the building itself is museum() in landmarks, moved here) */
export function museumGrounds(scene,ctx){const {S,addPlane}=ctx;const X0=111.7,X1=172,Z0=130,Z1=174.3,cx=141;
  blk(S,X0,X1,0,.04,Z0,Z1,'#5f9e4a',false);blk(S,cx-3,cx+3,0,.06,Z0,139,'#e3d6bb',false);blk(S,cx-14,cx+14,0,.055,135.5,139.4,'#e3d6bb',false);
  for(const x of[cx-20,cx+20])for(const z of[140,150,160])pot(S,x,z,'#9c4a2f','#3f9b4a',.8);
  for(let x=X0+1;x<X1;x+=2.2){if(Math.abs(x-cx)<4)continue;bx(S,x,.5,Z0+.6,.18,1,.18,'#1d0f8a');}bx(S,(X0+cx-3)/2,.95,Z0+.6,cx-3-X0,.08,.08,'#1d0f8a');bx(S,(cx+3+X1)/2,.95,Z0+.6,X1-cx-3,.08,.08,'#1d0f8a');
  col(X0,cx-3,0,1,Z0+.5,Z0+.7);col(cx+3,X1,0,1,Z0+.5,Z0+.7);
  blk(S,cx-9.5,cx-5.5,0,1.2,Z0+1.4,Z0+2,'#efe4cc');addPlane(scene,3.8,.9,signTex('OUTPULSE MUSEUM','#1d0f8a','#ffffff',768,170),[cx-7.5,.75,Z0+1.38],PI,null);
  G.noGrass.push([cx-14.5,cx+14.5,129.5,164]);G.noLamp.push([cx-6,cx+6,124,134]);G.mapPolys.push({pts:rect(X0,X1,Z0,Z1),col:'#2a1fa0'})}

/* SPG / army patrols inside PM House (and anything else that walks a fixed loop) */
export function spawnPatrols(scene,npc){for(const p of(G.patrols||[])){let i=0;const n=npc(scene,{name:p.name,look:p.look,x:p.path[0][0],z:p.path[0][1],yaw:0,lines:['…'],barks:['Perimeter clear.']});
  n.act=(dt)=>{const c=n.c.position,t=p.path[i],dx=t[0]-c.x,dz=t[1]-c.z,d=Math.hypot(dx,dz);if(d<.3){i=(i+1)%p.path.length;return 0}const st=Math.min(d,p.speed*dt);c.x+=dx/d*st;c.z+=dz/d*st;n.c.rotation.y=Math.atan2(dx,dz);return p.speed}}}

/* ======================================================================
   LOLU MALL interiors. G shops, 1 fashion, 2 games, 3 Lolu Cinemas.
   ====================================================================== */
export const MALL=[['mallG','G','Shops'],['mall1','1','Fashion'],['mall2','2','Games'],['mall3','3','Lolu Cinemas']];
/* films on the Lolu Cinemas screen: Blender open movies on the official Blender channels (all checked as embeddable) */
export const MOVIES=[{id:'eRsGyueVLvQ',t:'Sintel'},{id:'aqz-KE-bpKQ',t:'Big Buck Bunny'},{id:'R6MlUcmOul8',t:'Tears of Steel'},{id:'WhWc3b3KhnY',t:'Spring'},{id:'_cMxraX_5RE',t:'Sprite Fright'},{id:'Y-rmzh0PI3c',t:'Cosmos Laundromat'}];
export function mallRooms(room,env){const {scene,addPlane,posterTex,outs,W}=env;const out=outs.mallG;
  const tapM=(m,reach,fn)=>{m.userData.tap=fn;m.userData.reach=reach;G.pick.push(m)};
  const model=fn=>{const b=new Batch();fn(b);const m=b.mesh(CHM);m.castShadow=true;return m};
  const LI='#e2a8f0',PU='#6d3a8a';
  const liftDoors=(R,z,face)=>{const {S,cx}=R;for(const s of[-1,1]){bx(S,cx+s*1.35,1.6,z,2.4,3.2,.12,'#c9ccd1');bx(S,cx+s*1.35,1.6,z+face*.07,.04,3.2,.02,'#9aa3ad')}bx(S,cx,3.35,z,5.6,.3,.16,PU);
    G.triggers.push({x:cx,z:z+face*1.6,r:1.8,label:'Take the lift',act:()=>G.mallLift()})};
  /* upper floors: the lift is on the left wall, just ahead of where you step out */
  const liftSide=R=>{const {S,x0,z1}=R,z=z1-6;for(const s of[-1,1]){bx(S,x0+.08,1.6,z+s*1.35,.12,3.2,2.4,'#c9ccd1');bx(S,x0+.15,1.6,z+s*1.35,.02,3.2,.04,'#9aa3ad')}bx(S,x0+.1,3.35,z,.16,.3,5.6,PU);
    G.triggers.push({x:x0+1.7,z,r:1.8,label:'Take the lift',act:()=>G.mallLift()})};
  const shopper=(R,i,x,z,yaw,o={})=>R.npc(Object.assign({name:o.name||'Shopper',x,z,yaw,look:{shirt:['#e94b3c','#3d7be8','#ffcc3a','#5cc46b','#ff8fc1','#8a63d2'][i%6],pants:['#141414','#3a4a6b','#6b5a3a'][i%3],hair:['short','long','bun','cap','curly2','side'][i%6],face:['grin','smile','o','smug'][i%4],fem:i%2===1},
    lines:o.lines||['Window shopping. My wallet is just here for the walk.'],barks:o.barks||['Sale!','So many shops.']},o));
  const walker=(n,pts,sp)=>{let i=0;n.act=dt=>{const c=n.c.position,t=pts[i],dx=t[0]-c.x,dz=t[1]-c.z,d=Math.hypot(dx,dz);if(d<.3){i=(i+1)%pts.length;return 0}const st=Math.min(d,sp*dt);c.x+=dx/d*st;c.z+=dz/d*st;n.c.rotation.y=Math.atan2(dx,dz);return sp}};

  /* ---------- G: atrium fountain, Lolu Mart, Outpulse Digital, info desk ---------- */
  room('mallG',{name:'Lolu Mall · Ground floor',w:44,d:30,h:9,wall:'#f6f1fb',floor:'#efeae4',trim:PU,light:'#fff8f0',out},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    for(let x=x0+4;x<x1;x+=4)bx(S,x,.012,0,.06,.01,30,'#ddd5cc');
    cyl(S,cx,.3,-1,3.2,3.3,.6,'#d9d4e6',28);cyl(S,cx,.56,-1,2.95,2.95,.06,'#59b6e8',28);cyl(S,cx,1.4,-1,.25,.35,2.2,'#d9d4e6',12);cyl(S,cx,2.5,-1,1.1,.4,.25,'#d9d4e6',16);cyl(S,cx,2.75,-1,.12,.05,.6,'#bfe6ff',8);col(cx-3.2,cx+3.2,0,.6,-4.2,2.2);
    liftDoors(R,z0+.08,1);R.back(0,4.6,9,.9,signTex('LIFTS · 1 FASHION · 2 GAMES · 3 LOLU CINEMAS',PU,'#ffffff',1024,100),null);
    /* Lolu Mart */
    R.back(-13,6.6,14,1.4,signTex('LOLU MART','#2e7d32','#ffffff',768,76),null);
    for(let r=0;r<3;r++)for(const s of[0,1]){const x=x0+2.5+r*4.2,z=z0+2.5+s*4.5;blk(S,x-.4,x+.4,0,2.2,z,z+3.4,'#d9d9d9');for(let k=0;k<4;k++)for(let j=0;j<6;j++)bx(S,x+(j%2?.42:-.42),.4+k*.5,z+.3+j*.5,.06,.3,.36,['#e94b3c','#3d7be8','#ffcc3a','#5cc46b','#ff8fc1'][(k+j+r)%5])}
    blk(S,x0+14,x0+16,0,1,z0+8.6,z0+10.6,'#4a4a4a');bx(S,x0+15,1.05,z0+9.6,1.5,.06,1.6,'#2e7d32');R.npc({name:'Lolu Mart cashier',x:x0+15,z:z0+8,yaw:0,look:{shirt:'#2e7d32',hair:'bun',fem:true,face:'smile'},lines:['Bag for ₹5? Or carry it like a hero?'],barks:['Next!','Card or UPI?']});
    /* Outpulse Digital: laptops, phones, a TV wall */
    R.back(13,6.6,14,1.4,signTex('OUTPULSE DIGITAL','#141414','#3bd1ff',768,76),null);
    for(let i=0;i<5;i++)for(let j=0;j<2;j++)bx(WIN,cx+8+i*2.6,3.4+j*1.6,z0+.1,2.4,1.4,.06,'#ffffff');
    for(const [x,z] of[[cx+9,z0+5.5],[cx+15,z0+5.5]]){blk(S,x-1.8,x+1.8,0,1,z-.9,z+.9,'#2b2b2b');for(let k=-1;k<=1;k++){bx(S,x+k*1.15,1.06,z,.9,.04,.6,'#555');bx(S,x+k*1.15,1.32,z-.28,.9,.52,.03,'#2b2b2b');bx(WIN,x+k*1.15,1.32,z-.26,.82,.44,.01,'#ffffff')}}
    const lap=model(b=>{bx(b,0,.02,0,.9,.04,.6,'#3a3a3a');bx(b,0,.3,-.28,.9,.56,.03,'#2b2b2b');bx(b,0,.3,-.262,.82,.48,.01,'#2fa36b');bx(b,0,.42,-.255,.5,.06,.005,'#ffffff')});lap.position.set(cx+12,1,z0+9);scene.add(lap);blk(S,cx+11.2,cx+12.8,0,1,z0+8.6,z0+9.6,'#f4f1ea');
    tapM(lap,4,()=>{G.host.egg('ow_laptop','Xubuntu on a Chromebook. It works. Don\'t ask.');G.say('Demo laptop','Xubuntu on a Chromebook. It works. Don\'t ask how.')});
    R.npc({name:'Outpulse Digital staff',x:cx+12,z:z0+7.4,yaw:0,look:{shirt:'#141414',logo:'#3bd1ff',hair:'short',glasses:true,face:'grin'},lines:['That demo laptop runs Xubuntu. On a Chromebook. Tap it, I dare you.','EMI available. Regret not included.'],barks:['Latest models!','Try the demo laptop!']});
    /* info desk + directory */
    blk(S,x1-5,x1-1,0,1.05,2,4.2,'#f4f1ea');bx(S,x1-3,1.1,3.1,4.2,.08,2.4,PU);R.npc({name:'Info desk',x:x1-1.8,z:3.1,yaw:-PI/2,look:{shirt:PU,hair:'long',fem:true,face:'smile'},lines:['Ground floor: shops. One: fashion. Two: games. Three: Lolu Cinemas. Lifts are at the back.'],barks:['May I help you?']});
    R.right(-3,3.2,4.4,3.2,posterTex({w:520,h:380,bg:PU,fg:'#ffffff',kicker:'Directory',title:'Lolu Mall',body:'G · Lolu Mart, Outpulse Digital. 1 · Fashion. 2 · Games zone. 3 · Lolu Cinemas.',big:66,bs:24}),null);
    R.left(2,3.4,5,3.4,posterTexLocal('SALE','UP TO 67% OFF','Terms, conditions and vibes apply.','#ff6a3d','#141414'),null);
    for(const z of[6,10]){bx(S,x0+1.6,.48,z,.6,.1,2.2,'#8a5a3b');G.seats.push({x:x0+1.6,z,y:.55,yaw:PI/2,label:'Sit on bench'});col(x0+1.3,x0+1.9,0,.5,z-1.1,z+1.1)}
    const a=shopper(R,0,cx+5,4,0),b=shopper(R,3,cx-5,-6,0,{lines:['I came for one thing. I have nine bags.']});walker(a,[[cx+5,4],[cx-5,4],[cx-5,-6],[cx+5,-6]],1.3);walker(b,[[cx-5,-6],[cx+5,-6],[cx+5,4],[cx-5,4]],1.2);
    shopper(R,2,cx-12,z0+6.2,PI,{lines:['Is it me or does Lolu Mart move the aisles every week?']});shopper(R,5,cx-2,3.6,PI*.8,{name:'Kid at the fountain',lines:['I threw a coin in. Still waiting for the wish.'],barks:['Coin!']})});

  /* ---------- 1: fashion, racks, mannequins, trial rooms and the mirror ---------- */
  room('mall1',{name:'Lolu Mall · 1 · Fashion',w:44,d:30,h:6.5,wall:'#fbf4f8',floor:'#e9e0d6',trim:'#ff8fc1',light:'#fff6f2',exit:false,out},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    liftSide(R);
    R.back(-11,4.9,13,1.2,signTex('LOLU FASHION','#141414','#ff8fc1',768,76),null);R.back(11,4.9,13,1.2,signTex('DENIM DEPOT','#1d3a8a','#ffffff',768,76),null);
    R.left(-3,4.9,11,1.2,signTex('KURTA KORNER','#c1693c','#fff6e6',768,76),null);R.right(-3,4.9,11,1.2,signTex('SNEAKER STREET','#141414','#c9f26b',768,76),null);
    const rack=(x,z,cols,along='x')=>{const L=3.2;for(const s of[-1,1])if(along==='x')bx(S,x+s*L/2,.8,z,.06,1.6,.06,'#9aa3ad');else bx(S,x,.8,z+s*L/2,.06,1.6,.06,'#9aa3ad');
      if(along==='x')bx(S,x,1.6,z,L,.05,.05,'#9aa3ad');else bx(S,x,1.6,z,.05,.05,L,'#9aa3ad');for(let k=0;k<8;k++){const u=-L/2+.25+k*.39;if(along==='x')bx(S,x+u,1.12,z,.12,.9,.6,cols[k%cols.length]);else bx(S,x,1.12,z+u,.6,.9,.12,cols[k%cols.length])}
      if(along==='x')col(x-L/2,x+L/2,0,1.7,z-.35,z+.35);else col(x-.35,x+.35,0,1.7,z-L/2,z+L/2)};
    rack(cx-15,-9,['#ff8fc1','#ffffff','#141414']);rack(cx-9,-9,['#e94b3c','#ffcc3a','#f4efe6']);rack(cx-15,-4,['#3d7be8','#ffffff']);rack(cx-9,-4,['#5cc46b','#141414','#ffcc3a']);
    rack(cx+9,-9,['#1d3a8a','#3a4a6b','#5b7bbf']);rack(cx+15,-9,['#1d3a8a','#22314f']);rack(cx+9,-4,['#3a4a6b','#5b7bbf','#1d3a8a']);
    rack(x0+1.4,-6,['#c1693c','#ffcc3a','#e94b3c','#f4efe6'],'z');rack(x0+1.4,-1.5,['#2e7d32','#ff8fc1','#ffffff'],'z');
    for(let k=0;k<4;k++)for(let j=0;j<5;j++)bx(S,x1-.35,.6+k*.55,1+j*1.2,.5,.3,.9,['#ffffff','#141414','#c9f26b','#e94b3c','#3d7be8'][(k+j)%5]);blk(S,x1-.7,x1-.05,0,2.9,.3,7.1,'#d9d9d9');
    [['#ff8fc1','#141414',{skirt:'#ff8fc1',fem:true}],['#c1693c','#f4efe6',{kurta:'#c1693c'}],['#1d3a8a','#1d3a8a',{}],['#141414','#3a4a6b',{coat:'#3a3a3a'}]].forEach(([sh,pa,o2],i)=>{const m=makeChar(Object.assign({skin:'#ece6dc',shirt:sh,pants:pa,hair:'buzz',hairC:'#ece6dc',face:'flat'},o2));m.position.set(cx-6+i*4,.3,1.5);m.rotation.y=PI;scene.add(m);cyl(S,cx-6+i*4,.15,1.5,.45,.5,.3,'#f4f1ea',14);col(cx-6.4+i*4,cx-5.6+i*4,0,2,1.1,1.9)});
    /* trial rooms + the big mirror */
    for(let k=0;k<3;k++){const x=x1-3.4-k*2.6;blk(S,x-1.3,x-1.22,0,2.6,z0,z0+2.2,'#d9d9d9');bx(S,x,1.4,z0+2.2,2.3,2.4,.04,['#a3122a','#1d3a8a','#a3122a'][k]);col(x-1.3,x+1.3,0,2.6,z0,z0+2.25)}
    R.back(16,3.1,6,.5,signTex('TRIAL ROOMS','#141414','#ffffff',512,46),null);
    const mirror=addPlane(scene,1.6,2.6,tex(160,260,(x)=>{const g=x.createLinearGradient(0,0,160,260);g.addColorStop(0,'#e6f6ff');g.addColorStop(1,'#a8cfe2');x.fillStyle=g;x.fillRect(0,0,160,260);x.strokeStyle='#c9a227';x.lineWidth=12;x.strokeRect(0,0,160,260);x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(20,40);x.lineTo(60,20);x.lineTo(30,110);x.fill()}),[x1-.04,1.6,z0+4.6],-PI/2,()=>{G.host.egg('ow_mirror','Mirror check: looking sharp.');G.say('Mirror','Looking sharp. Glasses clean. Curls on point.')},{reach:4});
    R.npc({name:'Fashion assistant',x:cx-12,z:-6.5,yaw:0,look:{shirt:'#141414',pants:'#141414',hair:'long',fem:true,face:'smile'},lines:['That colour is so you. I say that to everyone, but this time I mean it.','The trial-room mirror is the most honest thing in this mall.'],barks:['New arrivals!','Try it on!']});
    shopper(R,1,cx+8,-1.5,PI,{lines:['Denim on denim? Bold. I support it.']});shopper(R,4,cx-4,6,PI*.6,{lines:['My friend has been in the trial room for 40 minutes.']});const w=shopper(R,3,cx,9,0);walker(w,[[cx,9],[cx-12,9],[cx-12,0],[cx+12,0],[cx+12,9]],1.2)});

  /* ---------- 2: games zone, bowling, arcade, air hockey, claw machine, ball pit ---------- */
  room('mall2',{name:'Lolu Mall · 2 · Games',w:44,d:30,h:6.5,wall:'#16112b',floor:'#2a2340',trim:'#3bd1ff',light:'#e8e2ff',exit:false,out},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    liftSide(R);R.back(0,5,16,1.6,signTex('LOLU GAMEZONE','#16112b','#ff3b8d',1024,100),null);
    for(let x=x0+2;x<x1;x+=3)bx(WIN,x,6.2,0,.2,.05,28,'#ffffff');
    /* two bowling lanes along the left wall */
    for(let l=0;l<2;l++){const lx=x0+2.2+l*3;blk(S,lx-1,lx+1,0,.08,z0+1,z1-9.5,'#d9b98f',false);bx(S,lx-1.15,.06,(z0+z1-8.5)/2,.3,.1,z1-z0-10.5,'#3a3a3a');bx(S,lx+1.15,.06,(z0+z1-8.5)/2,.3,.1,z1-z0-10.5,'#3a3a3a');
      for(let r=0;r<4;r++)for(let k=0;k<=r;k++){const px=lx-r*.15+k*.3,pz=z0+2+r*.26;cyl(S,px,.28,pz,.06,.08,.4,'#ffffff',8);cyl(S,px,.36,pz,.065,.065,.05,'#e94b3c',8)}
    }
    blk(S,x0+3.45,x0+3.95,0,.8,z1-11.6,z1-10,'#2b2b2b');for(let k=0;k<3;k++){const g=new THREE.SphereGeometry(.18,12,8);g.translate(x0+3.7,.98,z1-11.3+k*.5);S.add(g,['#3d7be8','#a463ff','#ff6a3d'][k])}col(x0,x0+6.4,0,.4,z0,z0+1.4);
    /* arcade cabinets along the back */
    for(let i=0;i<7;i++){const x=cx-9+i*3;blk(S,x-.65,x+.65,0,2.1,z0+.3,z0+1.3,['#e94b3c','#3d7be8','#ffcc3a','#5cc46b','#ff3b8d','#a463ff','#3bd1ff'][i]);bx(WIN,x,1.6,z0+1.32,1.05,.8,.02,'#ffffff');bx(S,x,1.05,z0+1.55,1.2,.12,.5,'#141414');for(const s of[-1,1])bx(S,x+s*.3,1.14,z0+1.55,.1,.1,.1,s<0?'#e94b3c':'#ffcc3a')}
    G.triggers.push({x:cx,z:z0+2.6,r:2.2,label:'Play an arcade game',act:()=>G.say('Arcade','GAME OVER. High score: MINI-VASHU 999,999. Insert coin to continue.')});
    /* air hockey */
    blk(S,cx-1.2,cx+1.2,0,.9,-1.6,1.6,'#141414');bx(S,cx,.92,0,2.2,.02,3,'#3bd1ff');bx(S,cx,.95,0,2.2,.03,.05,'#ffffff');cyl(S,cx,.97,.6,.12,.12,.04,'#e94b3c',12);
    shopper(R,2,cx,-2.4,0,{name:'Air hockey champ',lines:['Undefeated since Tuesday.'],barks:['Goal!','Again!'],emote:'cheer'});shopper(R,5,cx,2.4,PI,{name:'Air hockey loser',lines:['He cheats. I can\'t prove it.'],barks:['Rematch!']});
    /* claw machine */
    {const x=x1-4,z=-6;blk(S,x-1,x+1,0,1,z-1,z+1,'#ff3b8d');bx(WIN,x,1.9,z,1.9,1.8,1.9,'#ffffff');bx(S,x,2.9,z,2.05,.2,2.05,'#ff3b8d');for(let k=0;k<9;k++){const g=new THREE.SphereGeometry(.2,8,6);g.translate(x-.6+(k%3)*.6,1.22,z-.6+Math.floor(k/3)*.6);S.add(g,['#ffcc3a','#3bd1ff','#c9f26b','#ff8fc1'][k%4])}col(x-1,x+1,0,2.9,z-1,z+1);
      G.triggers.push({x:x-1.8,z,r:1.4,label:'Try the claw machine',act:()=>G.say('Claw machine','The claw grabs a plush… and drops it at the last second. As is tradition.')})}
    /* ball pit (a coffee bean is hiding in here) */
    {const X=x1-9.6,Z=3.4;for(const [a,b2,c,d] of[[X-3,X+3,Z-.15,Z+.15],[X-3,X+3,Z+5.85,Z+6.15],[X-3.15,X-2.85,Z,Z+6],[X+2.85,X+3.15,Z,Z+6]])blk(S,a,b2,0,.6,c,d,'#3bd1ff');
      for(let k=0;k<70;k++){const g=new THREE.SphereGeometry(.16,7,5);g.translate(X-2.6+(k*37%26)/5,.18+(k%3)*.12,Z+.4+(k*53%27)/5);S.add(g,['#e94b3c','#ffcc3a','#3d7be8','#5cc46b','#ff8fc1'][k%5])}
      shopper(R,6,X-1.5,Z+2,0,{name:'Kid in the ball pit',lines:['There is something brown in here. It smells like coffee.'],barks:['Wheee!'],emote:'cheer'})}
    shopper(R,0,cx-6,z0+2.6,PI,{name:'Gamer',lines:['One more round. Then I will go home. (He will not.)'],barks:['Combo!']});shopper(R,4,x0+2.2,z1-9,PI,{name:'Bowler',lines:['Strike! Okay, it was a spare. Okay, gutter.'],barks:['Strike!']})});

  /* ---------- 3: Lolu Cinemas. Tiered seats you can sit in, a movie on the screen ---------- */
  room('mall3',{name:'Lolu Cinemas',w:32,d:32,h:11,wall:'#1d1626',floor:'#2a1f2e',trim:'#ffcc3a',light:'#cdbfe6',exit:false,out},R=>{const {cx,x0,x1,z0,z1,S,WIN}=R;
    liftSide(R);
    /* stage, curtains, screen */
    blk(S,x0+2,x1-2,0,.6,z0,z0+2,'#141014');for(const s of[-1,1])for(let k=0;k<6;k++)bx(S,cx+s*(12.3+k*.22),5.6,z0+.6+k%2*.12,.24,11,.2,'#8a1020');
    bx(S,cx,10.6,z0+.4,26,1,.3,'#8a1020');
    const cv=document.createElement('canvas');cv.width=640;cv.height=272;const g2=cv.getContext('2d');const st=new THREE.CanvasTexture(cv);st.colorSpace=THREE.SRGBColorSpace;
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(22,9.35),new THREE.MeshBasicMaterial({map:st}));screen.position.set(cx,5.9,z0+.08);scene.add(screen);
    {const L=31,beam=new THREE.Mesh(new THREE.ConeGeometry(7,L,20,1,true),new THREE.MeshBasicMaterial({color:'#dcd6ff',transparent:true,opacity:.045,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
      beam.geometry.translate(0,-L/2,0);beam.position.set(cx,8.8,z1-.4);beam.lookAt(cx,5.9,z0);beam.rotateX(-PI/2);scene.add(beam);bx(S,cx,8.8,z1-.3,1.4,.9,.4,'#141014')}
    W.cinema={tick:T=>movie(g2,640,272,T),tex:st,t:0,screen,sw:22,sh:9.35};
    /* seven tiers, each 30 cm higher; a row of red seats on each */
    const T0=-8,DEP=1.8,RISE=.3,N=7;for(let k=0;k<N;k++){const zs=T0+k*DEP,h=RISE*(k+1);blk(S,x0+2.4,x1-2.4,0,h,zs,zs+DEP,k%2?'#3a2a3e':'#33253a');
      for(let x=x0+3.2,j=0;x<x1-2.8;x+=1.1,j++){if(Math.abs(x-cx)<1)continue;bx(S,x,h+.24,zs+1.2,.86,.18,.6,'#a3122a');bx(S,x,h+.62,zs+1.56,.86,.7,.12,'#8a1020');bx(S,x-.48,h+.36,zs+1.2,.08,.42,.6,'#141014');
        if(j%2===0)G.seats.push({x,z:zs+1.2,y:h+.52,yaw:PI,label:'Sit and watch the movie'})}
      /* seat backs block you; walk up the centre aisle */
      col(x0+3,cx-1,h,h+.45,zs+1.48,zs+1.66,{cam:false});col(cx+1,x1-3,h,h+.45,zs+1.48,zs+1.66,{cam:false})}
    {const top=RISE*N,zb=T0+N*DEP;blk(S,x0+2.4,x1-2.4,0,top+1,zb,zb+.3,'#141014');bx(S,cx,top+1.05,zb+.15,x1-x0-4.8,.08,.36,'#ffcc3a')}
    for(let z=T0;z<T0+N*DEP;z+=1.2)for(const x of[x0+.3,x1-.3])bx(WIN,x,.25,z,.1,.06,.3,'#ffffff');
    /* lobby: tickets, popcorn, posters */
    blk(S,x0+4,x0+5.2,0,1.1,11.6,15.4,'#2b2b2b');bx(S,x0+4.6,1.15,13.5,1.4,.08,4,'#ffcc3a');R.npc({name:'Ticket counter',x:x0+2.6,z:13.5,yaw:PI/2,look:{shirt:'#a3122a',hair:'side',face:'smile'},lines:['One ticket for Cup First 2? Excellent choice. It is the only choice.'],barks:['Next show now!']});
    blk(S,x1-6,x1-1,0,1.1,8,10,'#2b2b2b');for(let k=0;k<5;k++)cyl(S,x1-5.4+k*1,1.4,9,.2,.16,.5,k%2?'#ffffff':'#e94b3c',10);R.npc({name:'Popcorn counter',x:x1-3.5,z:7.2,yaw:0,look:{shirt:'#ffcc3a',hair:'bun',fem:true,face:'grin'},lines:['Popcorn: ₹420. Yes, for corn. Welcome to the movies.'],barks:['Salted or caramel?']});
    R.left(12,3.4,3,4.2,posterTexLocal('NOW SHOWING','CUP FIRST 2','The cortado strikes back.','#1a1030','#ffcc3a'),null);R.right(12,3.4,3,4.2,posterTexLocal('COMING SOON','MEOW ON THE MOON','Seven cats. One rocket.','#0d2a3a','#c9f26b'),null);
    R.back(0,10.2,8,.6,signTex('LOLU CINEMAS','#141014','#ffcc3a',512,40),null);
    /* the audience */
    [[2,5,0],[3,8,1],[4,10,2],[5,4,3],[6,15,4],[1,10,5],[0,7,6],[3,17,7]].forEach(([k,j,i])=>{const x=x0+3.2+j*1.1,zs=T0+k*DEP;G.seats=G.seats.filter(s=>!(Math.abs(s.x-x)<.05&&Math.abs(s.z-(zs+1.2))<.05));
      shopper(R,i,x,zs+1.2,PI,{name:'Moviegoer',y:RISE*(k+1)+.05,sit:true,lines:['Shh! It is the good part.','I have seen this nine times.'],barks:['Shh!','Ooh!','Popcorn?']})})});
}
/* the film on the Lolu Cinemas screen: a 48-second loop, drawn live */
function movie(c,w,h,T){const t=T%48;c.fillStyle='#000';c.fillRect(0,0,w,h);c.textAlign='center';
  if(t<5){const a=Math.min(1,t/1.5,(5-t)/1);c.globalAlpha=a;c.fillStyle='#ffcc3a';c.font='700 22px '+FONT_T;c.fillText('LOLU CINEMAS PRESENTS',w/2,h/2-30);c.fillStyle='#fff';c.font='400 64px '+FONT_D;c.fillText('CUP FIRST 2',w/2,h/2+40);c.globalAlpha=1;return}
  if(t<22){const k=(t-5)/17;const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#ff8a3d');g.addColorStop(.6,'#ffcf7a');g.addColorStop(1,'#3a2a4a');c.fillStyle=g;c.fillRect(0,0,w,h);
    c.fillStyle='#fff3c4';c.beginPath();c.arc(w*.7,h*.62-k*40,38,0,7);c.fill();c.fillStyle='#2b1d36';for(let i=0;i<14;i++){const bw=40+(i*37%30),bh=50+(i*53%90),bxp=((i*71-k*260)%(w+120)+w+120)%(w+120)-60;c.fillRect(bxp,h-60-bh,bw,bh)}
    c.fillStyle='#1a1222';c.fillRect(0,h-60,w,60);const ax=-120+k*(w+240);c.fillStyle='#2e7d32';c.fillRect(ax,h-110,90,40);c.fillStyle='#ffcc3a';c.fillRect(ax,h-140,90,32);c.fillStyle='#141414';c.beginPath();c.arc(ax+16,h-66,10,0,7);c.arc(ax+74,h-66,10,0,7);c.fill();
    c.fillStyle='#fff';c.font='600 20px '+FONT_T;c.fillText(t<13?'"Cup first…"':'"…then the numbers."',w/2,h-18);return}
  if(t<36){const k=t-22;c.fillStyle='#0d0a14';c.fillRect(0,0,w,h);if(Math.sin(k*9)>.92){c.fillStyle='#fff';c.fillRect(0,0,w,h)}c.fillStyle='#ff3b8d';const x1=w*.3+Math.sin(k*2)*20,x2=w*.7-Math.sin(k*2)*20;
    for(const [x,col] of[[x1,'#3bd1ff'],[x2,'#ff3b8d']]){c.fillStyle=col;c.fillRect(x-14,h-150,28,70);c.beginPath();c.arc(x,h-170,16,0,7);c.fill();c.fillRect(x-12,h-80,10,50);c.fillRect(x+2,h-80,10,50)}
    c.fillStyle='#fff';c.font='400 44px '+FONT_D;c.fillText(k<7?'THE CORTADO STRIKES BACK':'IN CINEMAS NOW',w/2,60);return}
  c.fillStyle='#000';c.fillRect(0,0,w,h);const L=['CUP FIRST 2','','Directed by MINI-VASHU','Starring THE MEOW CLUB CATS','and A VERY BRAVE AUTO-RICKSHAW','Music by THE BUS STAND VENDORS','Filmed entirely in VASHUPUR','','No coffee beans were harmed.'];
  const y0=h+20-(t-36)*34;c.fillStyle='#fff';L.forEach((l,i)=>{c.font=(i?'600 20px ':'400 40px ')+(i?FONT_T:FONT_D);c.fillText(l,w/2,y0+i*34)})}

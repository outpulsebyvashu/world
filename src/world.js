import {THREE,G,Batch,bx,cyl,col,blk,tex,wrap,lum,plane,signTex,FONT_T,FONT_D,rng,makeChar,CHM} from './core.js';
import {PROJECTS,NUMS,ROLES,SKILLS,STORY,WA,MEMERS,FREELOADERS} from './data.js';
import {buildArch} from './arch.js';
import {buildDistricts,pine,palm} from './districts.js';
import {makeLot,COOKING} from './lots.js';
import {TOWNS} from './towns.js';
import {mark,move} from './relocate.js';
import {inst,flushInst} from './inst.js';
import {buildLandmarks,extraRooms} from './landmarks.js';
import {mallRooms,spawnPatrols} from './v5.js';
import {buildDowntown} from './downtown.js';
export const W={};
const PJ=n=>PROJECTS.find(p=>p.n===n)||{n,tag:'',st:'',d:'',href:'',color:'#f4efe6'};

/* ---------- poster textures ---------- */
export function posterTex(o){const bg=o.bg||'#f4efe6',fg=o.fg||(lum(bg)>.45?'#141414':'#f4efe6');
  return tex(o.w||512,o.h||640,(x,W_,H)=>{x.fillStyle=bg;x.fillRect(0,0,W_,H);x.strokeStyle=fg;x.lineWidth=10;x.strokeRect(14,14,W_-28,H-28);
    let y=60;x.fillStyle=fg;x.textBaseline='alphabetic';
    if(o.kicker){x.font='700 24px '+FONT_T;x.fillText(o.kicker.toUpperCase(),36,y);y+=20}
    let s=o.big||88;x.font='800 '+s+'px '+FONT_T;let L=wrap(x,o.title,W_-72);while(L.length>3&&s>40){s-=8;x.font='800 '+s+'px '+FONT_T;L=wrap(x,o.title,W_-72)}
    for(const l of L){y+=s*.95;x.fillText(l,36,y)}y+=24;
    if(o.body){x.font='500 '+(o.bs||25)+'px '+FONT_T;for(const l of wrap(x,o.body,W_-72)){y+=(o.bs||25)*1.3;if(y>H-70)break;x.fillText(l,36,y)}}
    if(o.foot){x.fillStyle=fg;x.fillRect(36,H-74,W_-72,40);x.fillStyle=bg;x.font='800 20px '+FONT_T;x.textAlign='center';x.fillText(o.foot,W_/2,H-46)}})}
export const projPoster=p=>posterTex({bg:p.color,kicker:p.tag+' · '+p.st,title:p.n,body:p.d,foot:'TAP TO VIEW'});

function addPlane(scene,w,h,map,pos,ry,tap,o={}){const m=plane(w,h,map,o);m.position.set(pos[0],pos[1],pos[2]);m.rotation.y=ry;m.receiveShadow=!!o.shadow;scene.add(m);if(tap){m.userData.tap=tap;m.userData.reach=o.reach||6;G.pick.push(m)}return m}

export function buildWorld(scene){
  G.LOT=true; // every unbuilt plot is an empty construction lot
  const TN=G.TOWN||'vashupur',TD=TOWNS[TN],on=(...a)=>a.includes(TN);G.on=on;G.blocked=G.blocked||[];const RD=TD.roads;
  const S=new Batch(),WIN=new Batch(),LMP=new Batch(),RW=new Batch();
  const sideRot={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};
  /* ground */
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshLambertMaterial({color:'#79c267'}));gnd.rotation.x=-Math.PI/2;gnd.receiveShadow=true;scene.add(gnd);W.ground=gnd;
  const minus=(a0,a1,cuts)=>{let sg=[[a0,a1]];for(const [c0,c1] of cuts){const n=[];for(const [s0,s1] of sg){if(c1<=s0||c0>=s1){n.push([s0,s1]);continue}if(c0>s0)n.push([s0,c0]);if(c1<s1)n.push([c1,s1])}sg=n}return sg.filter(s=>s[1]-s[0]>.3)};
  const SW=(TD.road&&TD.road.side)||2;const road=r=>{const [x0,x1,z0,z1,along]=r;blk(S,x0,x1,0,.04,z0,z1,'#545861',false);
    if(along==='x'){const cr=RD.filter(q=>q[4]==='z'&&q[2]<z1+SW&&q[3]>z0-SW);
      for(const [a,b] of minus(x0,x1,cr.map(q=>[q[0],q[1]])))for(let x=a+1.5;x<b-1;x+=3.2)bx(S,x,.045,(z0+z1)/2,1.6,.01,.18,'#f4efe6');
      for(const [a,b] of minus(x0,x1,cr.filter(q=>q[2]<z0-1).map(q=>[q[0],q[1]])))blk(S,a,b,0,.07,z0-SW,z0,'#cfc7b6',false);
      for(const [a,b] of minus(x0,x1,cr.filter(q=>q[3]>z1+1).map(q=>[q[0],q[1]])))blk(S,a,b,0,.07,z1,z1+SW,'#cfc7b6',false)}
    else{const cr=RD.filter(q=>q[4]==='x'&&q[0]<x1+SW&&q[1]>x0-SW);
      for(const [a,b] of minus(z0,z1,cr.map(q=>[q[2],q[3]])))for(let z=a+1.5;z<b-1;z+=3.2)bx(S,(x0+x1)/2,.045,z,.18,.01,1.6,'#f4efe6');
      for(const [a,b] of minus(z0,z1,cr.map(q=>[q[2]-SW,q[3]+SW]))){blk(S,x0-SW,x0,0,.07,a,b,'#cfc7b6',false);blk(S,x1,x1+SW,0,.07,a,b,'#cfc7b6',false)}}};
  RD.forEach(road);
  /* roads that run out at the edge of town end at a barrier instead of stopping in the grass */
  const joined=(q,x,z)=>RD.some(r=>r!==q&&x>r[0]-.3&&x<r[1]+.3&&z>r[2]-.3&&z<r[3]+.3)||(TD.round&&Math.hypot(x-TD.round.x,z-TD.round.z)<TD.round.r1+3);
  const endTex=signTex('ROAD ENDS','#ffcc3a','#141414',256,64);
  for(const q of RD){const ax=q[4]==='x',ends=ax?[[q[0],(q[2]+q[3])/2,1],[q[1],(q[2]+q[3])/2,-1]]:[[(q[0]+q[1])/2,q[2],1],[(q[0]+q[1])/2,q[3],-1]];
    for(const [ex,ez,inw] of ends){if(joined(q,ax?ex-inw*.5:ex,ax?ez:ez-inw*.5))continue;const a=ax?q[2]:q[0],b=ax?q[3]:q[1],at=(ax?ex:ez)+inw*.6;const P=(u,v)=>ax?[at+v,u]:[u,at+v];
      for(const u of[a+.7,b-.7]){const [x,z]=P(u,0);blk(S,x-.14,x+.14,0,1.25,z-.14,z+.14,'#f4f4f2')}
      for(let u=a+.7,k=0;u<b-.7;u+=1,k++){const e=Math.min(u+1,b-.7),[x0_,z0_]=P(u,0),[x1_,z1_]=P(e,0);blk(S,Math.min(x0_,x1_)-(ax?.12:0),Math.max(x0_,x1_)+(ax?.12:0),.82,1.08,Math.min(z0_,z1_)-(ax?0:.12),Math.max(z0_,z1_)+(ax?0:.12),k%2?'#ffffff':'#e53935',false)}
      for(const u of[a+2.2,b-2.2]){const [x,z]=P(u,inw*.02);bx(S,x,1.55,z,ax?.06:1,.6,ax?1:.06,'#141414');bx(S,x,1.55,z+(ax?0:inw*.04),ax?.07:.8,.4,ax?.8:.07,'#ffcc3a')}
      const [mx,mz]=P((a+b)/2,inw*.05);addPlane(scene,2.6,.65,endTex,[mx,1.5,mz],ax?(inw>0?Math.PI/2:-Math.PI/2):(inw>0?0:Math.PI),null);
      const [c0x,c0z]=P(a,0),[c1x,c1z]=P(b,0);col(Math.min(c0x,c1x)-.2,Math.max(c0x,c1x)+.2,0,1.3,Math.min(c0z,c1z)-.2,Math.max(c0z,c1z)+.2)}}



  /* plaza */
  /* lamps */
  const lampPos=[];const lamp=(x,z)=>{blk(S,x-.1,x+.1,0,4.4,z-.1,z+.1,'#2c2f36',true);bx(S,x,4.45,z,.5,.12,.5,'#2c2f36');bx(LMP,x,4.3,z,.36,.2,.36,'#ffffff');lampPos.push([x,z])};
  const onRoad=(x,z)=>RD.some(q=>x>q[0]-.7&&x<q[1]+.7&&z>q[2]-.7&&z<q[3]+.7);
  /* street lamps are placed after the landmarks so they stay out of driveways and doorways */

  /* ---------- buildings ---------- */
  const building=o=>{if(G.LOT&&!o.real)return makeLot(scene,{S,addPlane},Object.assign({snow:TD.snow},o));const {x0,x1,z0,z1,h}=o;blk(S,x0,x1,0,h,z0,z1,o.col);if(o.band!==false)blk(S,x0-.15,x1+.15,h-.5,h,z0-.15,z1+.15,o.trim||'#f4efe6',false);
    if(o.roof==='none'){}else if(o.roof==='step'){const rc=o.roofCol||'#c0392b';for(let i=0;i<3;i++){const k=i*1.3-.5;blk(S,x0+k,x1-k,h+i*.65,h+(i+1)*.65,z0+k,z1-k,i%2?rc:shade(rc),false)}}
    else{blk(S,x0,x1,h,h+.7,z0-.15,z0+.25,o.trim||'#f4efe6',!!o.walkRoof);blk(S,x0,x1,h,h+.7,z1-.25,z1+.15,o.trim||'#f4efe6',!!o.walkRoof);blk(S,x0-.15,x0+.25,h,h+.7,z0,z1,o.trim||'#f4efe6',!!o.walkRoof);blk(S,x1-.25,x1+.15,h,h+.7,z0,z1,o.trim||'#f4efe6',!!o.walkRoof);if(!o.walkRoof)bx(S,(x0+x1)/2+1,h+.6,(z0+z1)/2,2,1.2,1.6,'#9aa3ad')}
    const d=o.door,dr=sideRot[d.side];const nx=d.side==='e'?1:d.side==='w'?-1:0,nz=d.side==='s'?1:d.side==='n'?-1:0;
    const dx=nx?(nx>0?x1:x0):d.at,dz=nz?(nz>0?z1:z0):d.at;
    // windows
    const floors=Math.max(1,Math.floor((h-1.2)/3.2));
    const wall=(side)=>{const along=side==='s'||side==='n';const a0=along?x0:z0,a1=along?x1:z1;const fixed=side==='s'?z1:side==='n'?z0:side==='e'?x1:x0;
      for(let f=0;f<floors;f++){const y=1.9+f*3.2;if(y>h-1)break;for(let u=a0+1.6;u<a1-1.2;u+=2.7){if(side===d.side&&f===0&&Math.abs(u-d.at)<2.2)continue;
        if(along)bx(WIN,u,y,fixed,1.2,1.4,.1,'#ffffff');else bx(WIN,fixed,y,u,.1,1.4,1.2,'#ffffff')}}};
    if(o.win!==false)['s','n','e','w'].forEach(wall);
    // door + awning
    const px=(u,y,off)=>nx?[dx+nx*off,y,u]:[u,y,dz+nz*off];
    const dp=px(d.at,1.2,.06);bx(S,dp[0],1.2,dp[2],nx?.12:1.7,2.4,nx?1.7:.12,o.doorCol||'#2b2b2b');
    const fp=px(d.at,2.55,.1);bx(S,fp[0],2.55,fp[2],nx?.2:2.1,.3,nx?2.1:.2,o.trim||'#f4efe6');
    if(o.awn!==false){const ap=px(d.at,2.95,.7);bx(S,ap[0],2.95,ap[2],nx?1.4:3,.18,nx?3:1.4,o.awn||o.trim||'#e94b3c')}
    const mat=px(d.at,.075,.9);bx(S,mat[0],.075,mat[2],nx?1:1.8,.02,nx?1.8:1,'#7a4a2a');
    if(o.sign){const sw=o.signW||Math.min(8,(nx?z1-z0:x1-x0)-1),sh=sw/4;const sp=px(d.at,o.signY||Math.min(h-.9,3.9+sh/2),.13);
      addPlane(scene,sw,sh,signTex(o.sign,o.signBg||'#141414',o.signFg||'#f4efe6',512,128),sp,dr,null)}
    const tp=px(d.at,0,1.7);
    if(o.room)G.triggers.push({x:tp[0],z:tp[2],y:0,r:2.2,label:'Enter '+o.name,act:()=>G.enter(o.room)});
    const out={x:tp[0]+nx*.4,z:tp[2]+nz*.4,fx:nx,fz:nz};
    G.buildings.push({name:o.name,x0,x1,z0,z1,col:o.col,door:out,room:o.room,short:o.short||o.name});
    return out};
  const shade=c=>{const k=new THREE.Color(c);k.multiplyScalar(.82);return '#'+k.getHexString()};

  G.seats=[];
  const bench=(x,z,ry)=>{const b=new Batch();bx(b,0,.5,0,2.2,.12,.6,'#8a5a3b');bx(b,0,.85,-.28,2.2,.5,.08,'#8a5a3b');bx(b,-.9,.25,0,.12,.5,.5,'#2c2f36');bx(b,.9,.25,0,.12,.5,.5,'#2c2f36');const m=b.mesh(CHM);m.castShadow=true;m.position.set(x,0,z);m.rotation.y=ry;scene.add(m);
    const c=Math.abs(Math.sin(ry))>.5;col(x-(c?.35:1.1),x+(c?.35:1.1),0,.55,z-(c?1.1:.35),z+(c?1.1:.35));G.seats.push({x:x+Math.sin(ry)*.05,z:z+Math.cos(ry)*.05,y:.55,yaw:ry,label:'Sit on bench'})};
  const ctx={TN,TD,on,RD,S,WIN,LMP,building,addPlane:(sc,w,h_,map,pos,ry,tap,o)=>addPlane(sc,w,h_,map,pos,ry,tap,o),bench,model,card:p=>G.card(p),W};
  const outs=buildArch(scene,ctx);Object.assign(outs,buildDistricts(scene,ctx));Object.assign(outs,buildLandmarks(scene,ctx));
  if(on('delulugarh'))Object.assign(outs,buildDowntown(scene,ctx));
  TD.plots.forEach(q=>building({name:'lot',x0:q[0],x1:q[1],z0:q[2],z1:q[3],door:{side:q[4],at:(q[4]==='e'||q[4]==='w')?(q[2]+q[3])/2:(q[0]+q[1])/2}}));
  const lampOK=(x,z)=>!G.noLamp.some(r=>x>r[0]&&x<r[1]&&z>r[2]&&z<r[3])&&!G.buildings.some(b=>b.door&&Math.hypot(b.door.x-x,b.door.z-z)<5);
  for(const q of RD){const [x0,x1,z0,z1,ax]=q;let k=0;if(ax==='x'){for(let x=x0+6;x<x1-3;x+=13){const z=(k++%2)?z1+SW*.7:z0-SW*.7;if(!onRoad(x,z)&&lampOK(x,z))lamp(x,z)}}else{for(let z=z0+6;z<z1-3;z+=13){const x=(k++%2)?x1+SW*.7:x0-SW*.7;if(!onRoad(x,z)&&lampOK(x,z))lamp(x,z)}}}
  const poolTex=tex(64,64,(x)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
  const pools=new THREE.InstancedMesh(new THREE.PlaneGeometry(8,8).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:poolTex,color:'#ffc870',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}),lampPos.length);
  const mm=new THREE.Matrix4();lampPos.forEach(([x,z],i)=>{mm.makeTranslation(x,.09,z);pools.setMatrixAt(i,mm)});pools.renderOrder=2;scene.add(pools);W.pools=pools;
  W.outs=outs;

  /* ---------- HQ roof + ladder + scooter ---------- */
  if(!G.LOT){
  const lad=new Batch();for(const z of[-36.4,-35.6])bx(lad,12.2,7.6,z,.12,15.2,.12,'#ffcc3a');for(let y=.6;y<15;y+=.6)bx(lad,12.2,y,-36,.1,.08,.9,'#ffcc3a');
  W.ladder=lad.mesh(CHM);W.ladder.visible=false;scene.add(W.ladder);
  const roofB=new Batch();for(let i=0;i<10;i++)bx(roofB,-9+i*2,15.9,-27,.18,.18,.18,'#ffffff');
  W.roofLights=roofB.mesh(new THREE.MeshBasicMaterial({vertexColors:true}));scene.add(W.roofLights);if(G.LOT)W.roofLights.visible=false;
  }
  if(!G.LOT){
  for(let i=0;i<10;i++){bx(S,-9+i*2,16.6,-26.6,.04,1.6,.04,'#333')}
  blk(S,-8,-6,15,15.7,-34,-32,'#ff8fc1');blk(S,-4,-2,15,15.7,-34,-32,'#3d7be8');blk(S,2,4,15,15.7,-34,-32,'#c9f26b');blk(S,-2,2,15,15.6,-40,-38,'#6b4a35');
  addPlane(scene,6,7.5,posterTex({bg:'#141414',kicker:'Rooftop · secret',title:"You made it to the roof.",body:'All 8 beans found. You\'re officially a regular. Tap to WhatsApp me the word "beans" and the first coffee chat is on me.',foot:'TAP TO SAY HI'}),[0,19.6,-45.2],0,()=>{G.host.egg('ow_roof','Rooftop reached. Respect.');window.open(WA,'_blank','noopener')});
  blk(S,-3.2,-2.8,15,19.6,-45.5,-45.1,'#333');blk(S,2.8,3.2,15,19.6,-45.5,-45.1,'#333');}
  const sc=new Batch();bx(sc,0,.35,0,.5,.12,1.6,'#d7263d');bx(sc,0,.9,.72,.1,1.1,.1,'#1d1d1d');bx(sc,0,1.42,.72,.9,.08,.08,'#1d1d1d');cyl(sc,0,.25,.72,.25,.25,.16,'#1d1d1d',14);cyl(sc,0,.25,-.72,.25,.25,.16,'#1d1d1d',14);
  sc.g.forEach(g=>{});const scm=sc.mesh(CHM);scm.children;W.scooterMesh=scm;
  // wheels were made as cylinders standing up; rotate them by rebuilding:
  const sc2=new Batch();bx(sc2,0,.35,0,.5,.12,1.6,'#d7263d');bx(sc2,0,.9,.72,.1,1.1,.1,'#1d1d1d');bx(sc2,0,1.42,.72,.9,.08,.08,'#1d1d1d');bx(sc2,0,1.42,.72,.92,.12,.12,'#d7263d');
  for(const z of[.72,-.72]){const g=new THREE.CylinderGeometry(.25,.25,.16,14);g.rotateZ(Math.PI/2);g.translate(0,.25,z);sc2.add(g,'#1d1d1d')}
  bx(sc2,0,.42,-.82,.3,.08,.1,'#ff3b3b');
  const scooter=new THREE.Group();const scMesh=sc2.mesh(CHM);scMesh.castShadow=true;scooter.add(scMesh);scooter.position.set(TD.scooter[0],0,TD.scooter[1]);scooter.rotation.y=TD.scooter[2];scene.add(scooter);W.scooter=scooter;

  /* ---------- plaza: cup fountain, monoliths, arch, booths ---------- */
  if(on('vashupur')){const cpF=mark(scene,[S,WIN,LMP]);
  cyl(S,0,.7,0,1.75,1.5,1.4,'#ffffff',20);cyl(S,0,1.39,0,1.55,1.55,.04,'#6b3e22',20);bx(S,2,.8,0,.5,.9,.25,'#ffffff');col(-1.6,1.6,0,1.4,-1.6,1.6);
  cyl(S,0,.03,0,3.2,3.2,.06,'#b9e3f5',24);
  W.steam=[];for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.4,.4,.4),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.5,depthWrite:false}));m.userData.o=i/5;scene.add(m);W.steam.push(m)}
  move(cpF,[0,0],[0,119.5]);W.steamAt=[0,119.5];const cpP=mark(scene,[S,WIN,LMP]);
  const nb=['#ff6a3d','#2f5bff','#c9f26b','#ff8fc1'];
  [[-11,-11],[11,-11],[-11,11],[11,11]].forEach(([x,z],i)=>{blk(S,x-1.7,x+1.7,0,4.6,z-.4,z+.4,'#141414');const t=tex(512,640,(c,w,h)=>{c.fillStyle=nb[i];c.fillRect(0,0,w,h);c.fillStyle=i===1?'#fff':'#141414';c.font='800 200px '+FONT_T;c.textAlign='center';let s=200;while(c.measureText(NUMS[i][0]).width>w-40){s-=10;c.font='800 '+s+'px '+FONT_T}c.fillText(NUMS[i][0],w/2,330);c.font='600 34px '+FONT_T;wrap(c,NUMS[i][1],w-80).forEach((l,j)=>c.fillText(l,w/2,430+j*44))});
    addPlane(scene,3.2,4,t,[x,2.4,z+.42],0,null);addPlane(scene,3.2,4,t,[x,2.4,z-.42],Math.PI,null)});
  // phone booth
  blk(S,12,13.6,0,2.8,11.4,13,'#e94b3c');bx(WIN,12.8,1.7,13.02,1,1.2,.05,'#ffffff');bx(S,12.8,3,12.2,1.7,.3,1.7,'#e94b3c');
  addPlane(scene,1.4,.35,signTex('CALL VASHU','#ffffff','#e94b3c',256,64),[12.8,2.55,13.06],0,null);
  G.triggers.push({x:12.8,z:14.2,r:1.8,label:'Call Vashu (WhatsApp)',act:()=>{G.host.egg('ow_call','You used the phone booth. Old school.');window.open(WA,'_blank','noopener')}});
  // DJ booth (party)
  const dj=new Batch();bx(dj,0,.55,0,2.6,1.1,1,'#141414');bx(dj,-.6,1.15,0,.7,.1,.6,'#333');bx(dj,.6,1.15,0,.7,.1,.6,'#333');bx(dj,-1.8,1,0,.8,2,.8,'#222');bx(dj,1.8,1,0,.8,2,.8,'#222');
  W.dj=new THREE.Mesh();W.dj=dj.mesh(CHM);W.dj.position.set(-11,0,-6);W.dj.rotation.y=Math.PI/2;W.dj.visible=false;scene.add(W.dj);
  // disco ball + beams
  const disco=new THREE.Group();const dball=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshLambertMaterial({color:'#e8e8f0',flatShading:true,emissive:'#333'}));dball.position.y=9;disco.add(dball);
  const beamG=new THREE.ConeGeometry(2.4,9,16,1,true);beamG.translate(0,-4.5,0);const beams=[];['#ff3b8d','#3bd1ff','#c9f26b','#ffcc3a','#a463ff','#ff6a3d'].forEach((c,i)=>{const m=new THREE.Mesh(beamG,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.y=9;m.rotation.z=.5;m.userData.a=i/6*Math.PI*2;disco.add(m);beams.push(m)});
  const pole=new THREE.Mesh(new THREE.BoxGeometry(.2,2.6,.2),new THREE.MeshLambertMaterial({color:'#333'}));pole.position.y=10.3;disco.add(pole);disco.visible=false;scene.add(disco);W.disco={g:disco,ball:dball,beams};
  /* the fan zone and the party live on the stadium field now */
  move(cpP,[0,0],[-111.25,60.8]);W.partyAt=[-111.25,60.8];}

  /* ---------- poster street ---------- */
  if(on('memepura'))PROJECTS.forEach((p,i)=>{const x=24+i*5.2;const nn=String(i+1).padStart(2,'0');blk(S,x-2.25,x+2.25,1,6.5,9.2,9.5,'#141414');blk(S,x-.15,x+.15,0,1,9.25,9.45,'#141414');
    const c=Object.assign({},COOKING,{n:'Project №'+nn,tag:p.tag,st:p.st,d:'A '+p.tag.toLowerCase()+' project, currently '+p.st.toLowerCase()+'. The name stays under wraps until it ships.'});
    addPlane(scene,4.2,5.25,posterTex({bg:p.color,kicker:'№ '+nn+' · '+p.tag,title:'Something\'s cooking',body:p.st+'. Name under wraps.',foot:'TAP TO PEEK'}),[x,3.75,9.17],Math.PI,()=>G.card(c),{reach:7})});




  /* ---------- water tower cup + construction lot ---------- */
  if(on('vashupur')){const cpW=mark(scene,[S]);for(const [x,z] of[[-26,-38],[-22,-38],[-26,-34],[-22,-34]])blk(S,x-.25,x+.25,0,7,z-.25,z+.25,'#6b6f78');
  cyl(S,-24,8.5,-36,2.6,2.2,3,'#ffffff',18);cyl(S,-24,8.5,-36,2.62,2.62,.6,'#ff6a3d',18);cyl(S,-24,10.01,-36,2.45,2.45,.04,'#6b3e22',18);move(cpW,[-24,-36],[-78,166]);}





  /* ---------- park, lake, pitch, stall ---------- */
  if(on('memepura')){
  cyl(S,64,.03,64,19,19,.06,'#ecdcaa',40);
  const water=new THREE.Mesh(new THREE.CircleGeometry(13,40),new THREE.MeshLambertMaterial({color:'#3fa7e0',transparent:true,opacity:.92}));water.rotation.x=-Math.PI/2;water.position.set(64,.08,64);scene.add(water);W.water=water;W.lake={x:64,z:64,r:13};
  blk(S,63,65,.25,.35,46,58,'#8a5a3b');for(const z of[50,54,57.5])for(const x of[63.1,64.9])blk(S,x-.12,x+.12,-.2,.35,z-.12,z+.12,'#5e3b24',false);
  blk(S,20,44,0,.07,26,44,'#6dbb5c',false);
  const line=(x0,x1,z0,z1)=>blk(S,x0,x1,.07,.09,z0,z1,'#ffffff',false);line(20,44,26,26.2);line(20,44,43.8,44);line(20,20.2,26,44);line(43.8,44,26,44);line(31.9,32.1,26,44);
  for(const gx of[20,44]){blk(S,gx-.12,gx+.12,0,2.2,33.1,33.3,'#ffffff');blk(S,gx-.12,gx+.12,0,2.2,36.7,36.9,'#ffffff');blk(S,gx-.12,gx+.12,2.1,2.3,33.1,36.9,'#ffffff',false)}
  W.pitch={x0:20,x1:44,z0:26,z1:44,gz0:33.4,gz1:36.6};
  const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.42,1),new THREE.MeshLambertMaterial({color:'#ffffff',flatShading:true}));ball.castShadow=true;ball.position.set(32,.42,35);scene.add(ball);W.ball={m:ball,v:new THREE.Vector3()};
  }
  if(on('kaapikunj')){// Coorg beans stall, facing the café strip
  blk(S,-73,-67,0,1,8.6,9.8,'#8a5a3b');for(const x of[-72.8,-67.2])blk(S,x-.1,x+.1,0,3,9.6,9.8,'#5e3b24');bx(S,-70,3.05,9.3,6.4,.2,2,'#ff6a3d');
  for(let i=0;i<4;i++){bx(S,-71.95+i*1.3,1.3,9.2,.9,.6,.7,'#c9a26b');bx(S,-71.95+i*1.3,1.62,9.2,.8,.06,.6,'#4a2c1a')}
  addPlane(scene,4,.8,signTex('COORG BEANS · DIRECT FROM FARM','#141414','#ffcc3a',512,100),[-70,3.4,8.15],Math.PI,null);}
  // low wall (bean spot)
  if(on('memepura'))blk(S,96,97,0,1.2,20,88,'#c9c2b4');
  // benches
if(on('memepura')){bench(52,46,0);bench(78,56,-Math.PI/2);bench(64,80,Math.PI)}if(on('basti'))bench(10,28,-Math.PI/2);

  /* ---------- event ground ---------- */
  if(on('basti')){
  const fence=(x0,x1,z0,z1)=>blk(S,x0,x1,0,.9,z0,z1,'#ffffff');fence(-46,-45.8,26,68);fence(-46,-10,67.8,68);fence(-10.2,-10,44,68);fence(-46,-10,26,26.2);
  blk(S,-40,-16,0,1.2,58,64,'#2b2b2b');blk(S,-31,-25,0,.6,57,58,'#2b2b2b');blk(S,-40,-16,1.2,8.5,64,64.6,'#141414');
  for(const x of[-41.2,-14.8]){blk(S,x-1,x+1,0,4,59,61,'#1d1d1d');bx(S,x,1.2,61.02,1,1,.05,'#444');bx(S,x,2.8,61.02,1,1,.05,'#444')}
  blk(S,-40,-16,8.5,8.8,58.5,59,'#333',false);
  W.banner={rally:signTex('RALLY: VOTE KETTLE · VAADA KUMAR','#ff6a3d','#141414',1024,180),concert:signTex('LIVE: THE CREMA BOYS','#141414','#c9f26b',1024,180)};
  W.bannerMesh=addPlane(scene,22,3.9,W.banner.rally,[-28,6,63.95],Math.PI,null);
  W.stageLights=[];['#ff3b8d','#3bd1ff','#c9f26b','#ffcc3a','#a463ff'].forEach((c,i)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.6,.5,.6),new THREE.MeshBasicMaterial({color:c}));m.position.set(-36+i*4,8.3,58.7);scene.add(m);W.stageLights.push(m)});
  const podium=new Batch();bx(podium,0,.6,0,1.2,1.2,.8,'#ffffff');bx(podium,0,.75,.41,1,.4,.02,'#ff6a3d');W.podium=podium.mesh(CHM);W.podium.position.set(-28,1.2,58.8);scene.add(W.podium);
  G.chairs=[];for(let r=0;r<4;r++)for(let c=0;c<6;c++){const x=-36+c*3.2,z=40+r*3;const b=new Batch();bx(b,0,.48,0,.6,.08,.6,'#e94b3c');bx(b,0,.8,-.27,.6,.6,.06,'#e94b3c');for(const a of[-.25,.25])for(const bb of[-.25,.25])bx(b,a,.22,bb,.06,.44,.06,'#2c2f36');const m=b.mesh(CHM);m.position.set(x,0,z);scene.add(m);G.chairs.push({x,z,taken:false});G.seats.push({x,z:z+.05,y:.52,yaw:0,label:'Sit and watch',event:true})}
  W.event={x:-28,z:50};
  }

  /* ---------- trees, flowers, hills, bounds ---------- */
  const R=rng(42+TN.length*7);const [bx0,bx1,bz0,bz1]=TD.b;
  const blocked=RD.map(q=>[q[0]-2.5,q[1]+2.5,q[2]-2.5,q[3]+2.5]);
  if(on('vashupur'))blocked.push([-27,27,92,147],[10,172,10,109],[128,160,148,163],[-81,-75,163,169],[-186,-10,-111,-10],[-172,-82,127,176],[-27,-21,21,27],[-17,-13,15,19],[-84,-10.5,128,176]);
  if(on('memepura'))blocked.push([18,46,24,46],[49,79,49,79],[15,98,8,11],[95,99,18,90],[14,22,6,10]);
  if(on('basti'))blocked.push([-47,-9,25,69],[2,12,18,32]);
  if(on('kaapikunj'))blocked.push([-76,-62,6,25],[-16,-9,6,10]);
  if(on('barfii'))blocked.push([-95,-81,10,24],[-36,-26,6,10],[-86,-70,-3,15]);
  blocked.push([TD.spawn.x-6,TD.spawn.x+6,TD.spawn.z-6,TD.spawn.z+6]);
  const free=(x,z)=>!blocked.concat(G.blocked).some(b=>x>b[0]-1.5&&x<b[1]+1.5&&z>b[2]-1.5&&z<b[3]+1.5);
  const tree=(x,z,s=1)=>{const lc=['#3d6b2c','#4a7a33','#355f28','#557f38','#46702f'];s*=1.25;inst('trunk',x,1.2*s,z,s,s,s,R()*6,'#5b4330');col(x-.2*s,x+.2*s,0,2.4*s,z-.2*s,z+.2*s);
    const n=3+Math.floor(R()*3);for(let i=0;i<n;i++){const r=(.9+R()*.7)*s;inst('crown'+(i%3),x+(R()-.5)*1.6*s,(2.6+R()*1.4)*s,z+(R()-.5)*1.6*s,r,r*.85,r,R()*6.28,lc[Math.floor(R()*lc.length)])}(G.camCols=G.camCols||[]).push({x0:x-1.7*s,x1:x+1.7*s,y0:1.7*s,y1:5*s,z0:z-1.7*s,z1:z+1.7*s})};
  const plant=(x,z,s)=>{const f=TD.flora;if(f==='pine'||(f==='mix'&&x<-60))pine(S,x,z,s*.8+.3,!!TD.snow||R()<.25);else if(f==='palm'&&R()<.6)palm(S,x,z,5+R()*2.5,.3,Math.floor(Math.abs(x*z)));else tree(x,z,s)};
  let n=0;for(let i=0;i<900&&n<TD.trees;i++){const x=bx0+3+R()*(bx1-bx0-6),z=bz0+3+R()*(bz1-bz0-6);if(free(x,z)){plant(x,z,.8+R()*.5);n++}}
  const cxT=(bx0+bx1)/2,czT=(bz0+bz1)/2,hx=(bx1-bx0)/2,hz=(bz1-bz0)/2;const rect=a=>1/Math.max(Math.abs(Math.cos(a))/hx,Math.abs(Math.sin(a))/hz);
  if(!TD.city)for(let a=0;a<Math.PI*2;a+=.07){for(const rr of[0,1]){const k=rect(a)+5+rr*9;const px=cxT+Math.cos(a)*k,pz=czT+Math.sin(a)*k;if(TD.sea&&px>bx1-3)continue;plant(px,pz,1.2+R())}}
  if(!TD.snow&&!TD.city)for(let i=0;i<50;i++){const x=bx0+3+R()*(bx1-bx0-6),z=bz0+3+R()*(bz1-bz0-6);if(free(x,z))bx(S,x,.15,z,.35,.3,.35,['#ff6b9d','#ffcc3a','#ffffff','#a463ff'][i%4])}
  for(let a=0;a<Math.PI*2;a+=.2){const ca=Math.cos(a),sa=Math.sin(a);if(TD.sea&&ca>.35)continue;const base=rect(a);
    if(TD.snow||(TD.flora==='mix'&&ca<-.6&&on('kaapikunj'))){const r=base+75+R()*60,hh=70+R()*70,rad=35+R()*25;const g=new THREE.ConeGeometry(rad,hh,7);g.rotateY(R()*3);g.translate(cxT+ca*r,hh/2-6,czT+sa*r);S.add(g,R()<.5?'#5d6b62':'#6b776e');const g2=new THREE.ConeGeometry(rad*.36,hh*.36,7);g2.translate(cxT+ca*r,hh-6-hh*.18+.5,czT+sa*r);S.add(g2,'#f5f7fa');continue}
    const r=base+(on('kaapikunj')?70:120)+R()*60,hh=25+R()*45,rad=50+R()*40;const g=new THREE.SphereGeometry(rad,14,8,0,Math.PI*2,0,Math.PI/2);g.scale(1.6,hh/rad,1);g.rotateY(-a+Math.PI/2);g.translate(cxT+ca*r,-2,czT+sa*r);S.add(g,on('kaapikunj')?(R()<.5?'#3f6e34':'#4b7d3c'):(R()<.5?'#4f7a3e':'#5a8445'))}
  col(bx0-1,bx0,0,6,bz0-1,bz1+1,{cam:false});col(bx1,bx1+1,0,6,bz0-1,bz1+1,{cam:false});col(bx0-1,bx1+1,0,6,bz0-1,bz0,{cam:false});col(bx0-1,bx1+1,0,6,bz1,bz1+1,{cam:false});

  /* ---------- clouds + stars ---------- */
  const cl=new Batch();for(let i=0;i<14;i++){const x=-150+R()*300,z=-120+R()*260,y=48+R()*14;for(let j=0;j<4;j++)bx(cl,x+j*4-6+R()*2,y+R()*2,z+R()*4,5+R()*4,2.5,5+R()*3,'#ffffff')}
  W.clouds=cl.mesh(new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.95,fog:false}));scene.add(W.clouds);
  const sp=new Float32Array(900*3);for(let i=0;i<900;i++){const a=R()*Math.PI*2,e=.08+R()*1.4,r=400;sp[i*3]=Math.cos(a)*Math.cos(e)*r;sp[i*3+1]=Math.sin(e)*r;sp[i*3+2]=Math.sin(a)*Math.cos(e)*r}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));W.stars=new THREE.Points(sg,new THREE.PointsMaterial({color:'#ffffff',size:2,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(W.stars);
  W.moon=new THREE.Mesh(new THREE.CircleGeometry(14,24),new THREE.MeshBasicMaterial({color:'#fff6d8',fog:false,transparent:true}));scene.add(W.moon);
  W.sun=new THREE.Mesh(new THREE.CircleGeometry(18,24),new THREE.MeshBasicMaterial({color:'#fff2b0',fog:false,transparent:true}));scene.add(W.sun);

  /* ---------- rooms ---------- */
  buildRooms(scene,S,RW,WIN,outs);

  /* ---------- finalize batches: spatial chunks so off-screen parts are skipped ---------- */
  flushInst(scene);
  const LM=new THREE.MeshLambertMaterial({vertexColors:true});for(const sm of S.meshes(LM,56)){sm.castShadow=true;sm.receiveShadow=true;scene.add(sm)}
  W.winMat=new THREE.MeshBasicMaterial({vertexColors:true,color:'#9fc4e6'});for(const wm of WIN.meshes(W.winMat,56))scene.add(wm);
  W.lampMat=new THREE.MeshBasicMaterial({vertexColors:true,color:'#d8d8d8'});scene.add(LMP.mesh(W.lampMat));
  const rw=RW.mesh(new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.BackSide}));rw.receiveShadow=true;scene.add(rw);
  return W}

/* =================== interiors =================== */
function buildRooms(scene,S,RW,WIN,outs){
  let RX=600;
  const LIVE={vashupur:['police','fire','labs','boring','resA','resB','resFloor','resFlat','jail','meow','museum','mallG','mall1','mall2','mall3'],kaapikunj:['kunj'],delulugarh:['nth','nthlab']};
  const LMAT=new THREE.MeshLambertMaterial({vertexColors:true}),BMAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.BackSide});
  /* rooms are registered now but only built the first time someone walks in */
  const room=(id,o,fill)=>{if(G.LOT&&!(LIVE[G.TOWN]||[]).includes(id))return null;const cx=RX;RX+=80;const w=o.w,d=o.d,h=o.h||5.5,x0=cx-w/2,x1=cx+w/2,z0=-d/2,z1=d/2;
    const r={id,name:o.name,cx,x0,x1,z0,z1,h,spawn:{x:cx,z:z1-2.8},out:o.out||outs[id],light:o.light||'#fff4e0'};G.rooms[id]=r;
    if(o.exit!==false)G.triggers.push({x:cx,z:z1-1,r:1.4,label:'Exit to town',act:()=>G.exit(id)});
    r.build=()=>{const s0=S,r0=RW,w0=WIN;S=new Batch();RW=new Batch();WIN=new Batch();
      bx(RW,cx,h/2-.3,0,w,h+.6,d,o.wall);blk(S,x0,x1,-.3,0,z0,z1,o.floor,false);
      blk(S,x0,x1,0,.25,z0,z0+.06,o.trim||'#ffffff',false);blk(S,x0,x0+.06,0,.25,z0,z1,o.trim||'#ffffff',false);blk(S,x1-.06,x1,0,.25,z0,z1,o.trim||'#ffffff',false);
      col(x0-1,x0,0,h,z0-1,z1+1,{cam:false});col(x1,x1+1,0,h,z0-1,z1+1,{cam:false});col(x0-1,x1+1,0,h,z0-1,z0,{cam:false});col(x0-1,x1+1,0,h,z1,z1+1,{cam:false});
      bx(S,cx,.02,z1-.8,1.8,.02,1,'#7a4a2a');
      fill({cx,x0,x1,z0,z1,h,S,RW,WIN,
        back:(u,y,w_,h_,map,tap,o2)=>addPlane(scene,w_,h_,map,[cx+u,y,z0+.03],0,tap,o2),
        left:(u,y,w_,h_,map,tap,o2)=>addPlane(scene,w_,h_,map,[x0+.03,y,u],Math.PI/2,tap,o2),
        right:(u,y,w_,h_,map,tap,o2)=>addPlane(scene,w_,h_,map,[x1-.03,y,u],-Math.PI/2,tap,o2),
        npc:(cfg)=>npc(scene,Object.assign({room:id},cfg))});
      const m=S.mesh(LMAT);m.castShadow=true;m.receiveShadow=true;scene.add(m);scene.add(WIN.mesh(W.winMat));const rw=RW.mesh(BMAT);rw.receiveShadow=true;scene.add(rw);
      S=s0;RW=r0;WIN=w0};
    return r};
  const proj=n=>{const p=PJ(n);return()=>G.card(p)};

  room('hq',{name:'Outpulse Labs HQ',w:26,d:18,h:6,wall:'#f4efe6',floor:'#d9d4c4',trim:'#ff6a3d'},R=>{const {cx,z0}=R;
    R.back(0,3.4,9,3,posterTex({w:768,h:256,bg:'#ff6a3d',kicker:'Founder & COO · since July 2026',title:'Outpulse Labs',big:96}),null);
    blk(R.S,cx-11,cx-6,0,1.1,z0+1.5,z0+3,'#141414');bx(R.S,cx-8.5,1.12,z0+2.2,5,.06,1.5,'#ff6a3d');
    const items=['breadPOS','Outpulse Flow','Dues','Manifold','Outpulse Cloud','Outpulse Voice','OS-NEKO','Ultrasound Device','Arc-Street'];
    items.forEach((n,i)=>{const p=PJ(n);const x=cx+(-7+(i%3)*7),z=-4.5+Math.floor(i/3)*4.2;blk(R.S,x-.9,x+.9,0,1,z-.9,z+.9,p.color||'#f4efe6');
      const top=new Batch();model(top,n,p.color);const m=top.mesh(CHM);m.position.set(x,1,z);m.castShadow=true;scene.add(m);m.userData.tap=()=>G.card(p);m.userData.reach=5;G.pick.push(m);
      addPlane(scene,1.7,.42,signTex(n,'#141414','#f4efe6',512,128),[x,.55,z+.92],0,()=>G.card(p),{reach:5});
      G.triggers.push({x,z:z+1.7,r:1.2,label:'View '+n,act:()=>G.card(p)})});
    R.npc({name:'Sigma Intern',x:cx-8.5,z:z0+3.8,yaw:0,look:{shirt:'#141414',pants:'#141414',hair:'short',face:'smug',shades:true,long:true},emote:'pose',lines:['Welcome to Outpulse Labs. I woke up at 4 AM, cold plunged, read 3 books.','I am unpaid. That is the sigma grindset.','Every product here is real or being built. Tap a pedestal.'],barks:['Grindset.','4 AM club.']});
  });
  room('cafe',{name:'TOKI · Specialty Coffee',w:18,d:14,wall:'#efe6d8',floor:'#d9b98f',trim:'#5a3f2a',light:'#fff1dc'},R=>{const {cx,x0,x1,z0,z1}=R;
    blk(R.S,cx-6,cx+6,0,1.1,z0+1.4,z0+2.6,'#c89b6d');bx(R.S,cx,1.13,z0+2,12.2,.06,1.4,'#f7f2ea');for(let u=-5.8;u<6;u+=.3)bx(R.S,cx+u,.55,z0+2.62,.12,1.1,.05,'#b8895c');
    blk(R.S,cx-1.2,cx+1.2,1.16,2,z0+1.6,z0+2.4,'#c9ccd1',false);for(const dx of[-.6,.6])bx(R.S,cx+dx,1.55,z0+2.45,.24,.16,.2,'#2c2f36');bx(R.S,cx+2,1.6,z0+2,.5,.9,.5,'#1d1d1d');
    for(let i=0;i<10;i++)bx(R.S,cx-5+i*1.1,3.1,z0+.35,.25,.7,.25,['#3fa7e0','#c9f26b','#ff6a3d','#ffcc3a','#a463ff'][i%5]);bx(R.S,cx,2.72,z0+.4,12,.08,.6,'#6b4a35');
    const menu={n:'TOKI menu',tag:'Specialty coffee',st:'All day',d:'Espresso ₹120 · Cortado ₹150 · Cappuccino ₹170 · Pour-over (single origin) ₹220 · Cold brew ₹190 · Filter kaapi ₹60. Ask for the bean of the week.',href:'',color:'#1f3a5f'};
    R.back(-4.5,3.6,4,2.6,posterTex({w:512,h:332,bg:'#1f3a5f',kicker:'TOKI',title:'Menu',big:84,body:'Espresso · Cortado · Pour-over · Filter kaapi',bs:22,foot:'TAP TO READ'}),()=>G.card(menu),{reach:8});
    const guide={n:'Brew guide',tag:'House recipe',st:'Pour-over',d:'15 g coffee, 250 g water at 93°C. Bloom 40 g for 30 s, then pour in slow circles to 250 g by 2:00. Drawdown by 3:00. Taste. Adjust grind. Repeat. Cup first, then the numbers.',href:'',color:'#f3eee6'};
    R.back(4.5,3.6,4,2.6,posterTex({w:512,h:332,bg:'#f3eee6',kicker:'House recipe',title:'Brew guide',big:70,body:'15 g · 250 g · 93°C · 3:00',bs:24,foot:'TAP TO READ'}),()=>G.card(guide),{reach:8});
    ROLES.forEach((r,i)=>{const side=i<3?'left':'right';const u=-3.5+(i%3)*3.5;R[side](u,2.8,2.6,3.25,posterTex({bg:['#ff6a3d','#2f5bff','#c9f26b','#ffc9e0','#f4efe6','#ffcc3a'][i],kicker:r[0],title:r[1],body:r[2],big:58,bs:24}),()=>G.card({n:r[1],tag:r[0],st:r[2],d:'Part of the journey: '+r[1]+' at '+r[2]+'.',href:'',color:'#f4efe6'}),{reach:6})});
    G.triggers.push({x:cx,z:z0+3.4,r:1.5,label:'Brew a coffee',act:()=>G.brew()});
    const tables=[[-4.5,-.5],[4.5,-.5],[0,.8]];const lk=[{shirt:'#2f5bff',hair:'long',face:'smile'},{shirt:'#c9f26b',hair:'cap',hat:'#141414',face:'grin'},{shirt:'#ff8fc1',hair:'bun',face:'o'}];
    const rev=[['His cortado fixed my Monday. And my Tuesday.','5 stars. Would wait in line again.'],['I asked for extra hot. He explained extraction for 10 minutes. Worth it.','Never asking for extra hot again.'],['Cup first, then the numbers. He said it before I could order.','Then he cut the café\'s wastage by 12%. Iconic.']];
    tables.forEach(([u,z],i)=>{const x=cx+u;cyl(R.S,x,.95,z,.8,.8,.08,'#e8e2d6',14);blk(R.S,x-.08,x+.08,0,.95,z-.08,z+.08,'#2c2f36');cyl(R.S,x,1.05,z,.12,.1,.2,'#ffffff',10);
      R.npc({name:'Café regular',x:x,z:z+1.25,yaw:Math.PI,sit:true,look:lk[i],lines:rev[i],barks:['Mmm.','So good.','Another one.']});blk(R.S,x-.3,x+.3,0,.5,z+1,z+1.6,'#6b4a35')});
  });
  room('home',{name:"Vashu's Studio",w:16,d:12,wall:'#f4efe6',floor:'#b88a5e',trim:'#1d1d1d'},R=>{const {cx,x0,x1,z0}=R;
    blk(R.S,x0+.3,x0+3,0,.6,z0+.3,z0+4.5,'#ffffff');bx(R.S,x0+1.65,.75,z0+2.6,2.6,.3,3.4,'#2f5bff');bx(R.S,x0+1.65,.75,z0+.9,2,.35,.8,'#ffffff');
    blk(R.S,x1-4,x1-.6,0,1,z0+.4,z0+1.8,'#6b4a35');bx(R.S,x1-2.3,1.06,z0+1,1.1,.04,.75,'#555');const lap=new Batch();bx(lap,0,.32,-.2,1.1,.62,.04,'#2b2b2b');bx(lap,0,.32,-.17,1,.52,.01,'#3fa7e0');const lm=lap.mesh(CHM);lm.position.set(x1-2.3,1.06,z0+1.2);scene.add(lm);lm.userData.tap=()=>{G.host.egg('ow_laptop','Xubuntu on a Chromebook. It works. Don\'t ask.');G.say('Laptop','Xubuntu on a Chromebook. It works. Don\'t ask how.')};lm.userData.reach=4;G.pick.push(lm);
    blk(R.S,x1-.9,x1-.3,0,4,z0+3,z0+6,'#6b4a35');for(let i=0;i<4;i++)for(let j=0;j<6;j++)bx(R.S,x1-.65,.6+i*.95,z0+3.3+j*.45,.35,.6,.3,['#e94b3c','#3d7be8','#ffcc3a','#5cc46b','#a463ff'][(i+j)%5]);
    const mirror=addPlane(scene,1.2,2.2,tex(128,256,(x)=>{const g=x.createLinearGradient(0,0,128,256);g.addColorStop(0,'#dff3ff');g.addColorStop(1,'#9cc6dd');x.fillStyle=g;x.fillRect(0,0,128,256);x.strokeStyle='#1d1d1d';x.lineWidth=12;x.strokeRect(0,0,128,256)}),[x0+.04,1.8,1.5],Math.PI/2,()=>{G.player.emote='wave';G.host.egg('ow_mirror','Mirror check: looking sharp.');G.say('Mirror','Looking sharp. Glasses clean. Curls on point.')},{reach:4});
    R.back(-1.2,3.3,3.2,4,posterTex({bg:'#ffcc3a',kicker:'About me',title:'Vashudev Sharma',body:STORY,big:56,bs:20}),()=>G.card({n:'About me',tag:'Vashudev Sharma',st:'Specialty coffee consultant & founder',d:STORY,href:'',color:'#ffcc3a'}),{reach:8});
    R.back(2.6,3.3,3.2,4,posterTex({bg:'#2f5bff',kicker:'In numbers',title:NUMS.map(n=>n[0]).join(' · '),body:NUMS.map(n=>n[0]+' '+n[1]).join('. ')+'.',big:56,bs:21}),()=>G.card({n:'In numbers',tag:'Results',st:'',d:NUMS.map(n=>n[0]+' — '+n[1]).join('. ')+'.',href:'',color:'#2f5bff'}),{reach:8});
    R.right(0,3.2,3.4,3.6,posterTex({bg:'#c9f26b',kicker:'Skills',title:'What I do',body:SKILLS.map(s=>s[0]+': '+s[1]).join('. '),big:60,bs:19}),()=>G.card({n:'Skills',tag:'Toolkit',st:'',d:SKILLS.map(s=>s[0]+': '+s[1]).join('. ')+'.',href:'',color:'#c9f26b'}),{reach:8});
    R.left(-2.5,3.2,2.6,3.4,posterTex({bg:'#141414',kicker:'Curriculum vitae',title:'My CV',body:'Tap for the quick-read version.',big:80,foot:'TAP TO READ'}),()=>G.cv(),{reach:8});
    cyl(R.S,cx,.02,0,3,3,.03,'#ff6a3d',24);blk(R.S,x0+4,x0+5,0,.9,z0+.4,z0+1.2,'#6b4a35');cyl(R.S,x0+4.5,1.15,z0+.8,.15,.2,.5,'#9aa3ad',8);
    blk(R.S,cx+3,cx+3.6,0,.6,-4.6,-4,'#c0392b',false);bx(R.S,cx+3.3,1.1,-4.3,.9,1,.9,'#4fae55');
  });
  const shop=(id,name,o,extra)=>room(id,Object.assign({name},o),R=>{extra(R)});
  shop('gothic','Gothic Bakehouse',{w:14,d:10,wall:'#2b1f1f',floor:'#d9cdb8',trim:'#d9d4c4',light:'#ffe9cf'},R=>{const {cx,z0}=R;blk(R.S,cx-5,cx+5,0,1.2,z0+1.4,z0+2.6,'#d9d4c4');bx(WIN,cx,1.4,z0+2,9.8,.4,1,'#ffffff');
    for(let i=0;i<9;i++)bx(R.S,cx-4+i,1.35,z0+2,.7,.25,.45,i%2?'#a0642e':'#3b2214');for(let i=0;i<6;i++)bx(R.S,cx-4.5+i*1.8,3,z0+.4,1.2,.5,.4,'#c48a4a');bx(R.S,cx,2.7,z0+.4,11,.08,.6,'#6b4a35');
    R.back(0,4.2,4.4,1.8,posterTex({w:512,h:210,bg:'#d9d4c4',kicker:'Client · Brand',title:'Gothic',big:70}),proj('Gothic'),{reach:8});
    R.npc({name:'Baker Bina',x:cx,z:z0+.9,yaw:0,look:{shirt:'#ffffff',pants:'#3a2a2a',hair:'bun',hat:'#ffffff',apron:'#d9d4c4',face:'smile'},lines:['Welcome to Gothic! Artisan bakehouse & chocolatiers.','Vashu built our brand. The logo is darker than my chocolate.','Tap the sign behind me to visit our website.'],barks:['Fresh out!','Croissant?']})});
  shop('waff','Waff Waff',{w:12,d:10,wall:'#ffd23f',floor:'#fff6d6',trim:'#e94b3c',light:'#fff0d0'},R=>{const {cx,z0}=R;blk(R.S,cx-4,cx+4,0,1.1,z0+1.4,z0+2.4,'#e94b3c');for(let i=0;i<4;i++)for(let k=0;k<3;k++)bx(R.S,cx-3+i*2,1.2+k*.12,z0+1.9,1.1,.1,.9,'#e8a33c');
    R.back(0,3.6,4,2.2,posterTex({w:512,h:282,bg:'#fff06b',kicker:'Client · Website',title:'Waff Waff',big:76,foot:'TAP TO VIEW'}),proj('Waff Waff'),{reach:8});
    R.npc({name:'Waffle Wale Bhaiya',x:cx,z:z0+.8,yaw:0,look:{shirt:'#e94b3c',pants:'#141414',hair:'cap',hat:'#ffd23f',face:'grin'},lines:['Waff Waff! Coming to Baloda Bazar, Raipur, Jaipur and Bhilai.','Website and brand by Vashu. Syrup by me.','Square holes, round smiles.'],barks:['Waffle?','Extra syrup!']})});
  shop('ogh','Old Green House Cafe',{w:16,d:12,wall:'#2f6b45',floor:'#e9e0cc',trim:'#f4efe6',light:'#fff2dc'},R=>{const {cx,z0}=R;
    for(const [u,z] of[[-4,-2],[4,-2],[-4,2],[4,2]]){const x=cx+u;blk(R.S,x-1.2,x+1.2,0,.5,z-.6,z+.6,'#8a5a3b');bx(R.S,x-.5,.52,z,.9,.02,.6,'#3fae55');bx(R.S,x+.5,.52,z,.9,.02,.6,'#3fae55');cyl(R.S,x-.5,.62,z+.2,.08,.08,.2,'#c9ccd1',8)}
    R.back(0,3.4,4.6,2.4,posterTex({w:512,h:268,bg:'#f6f3ea',kicker:'Client · Website',title:'Old Green House',big:58,foot:'Classic Kannada Cuisine'}),proj('Old Green House Cafe'),{reach:8});
    R.npc({name:'Host Shankar',x:cx-6,z:z0+1.2,yaw:.6,look:{shirt:'#ffffff',pants:'#ffffff',hair:'short',mustache:true,face:'smile',long:true},lines:['Namaskara! Old Green House Cafe, Gokulam, Mysuru.','Classic Kannada cuisine. Website by Vashu, ragi mudde by us.','Eat with your hands. The website you can tap.'],barks:['Oota aytha?','Banni!']})});
  shop('clinic','City Clinic',{w:14,d:10,wall:'#eef3f7',floor:'#cfd8e0',trim:'#e94b3c',light:'#f2f7ff'},R=>{const {cx,x0,z0}=R;blk(R.S,cx-2,cx+2,0,1.1,z0+1.4,z0+2.4,'#ffffff');blk(R.S,x0+1,x0+3.5,0,.8,z0+1,z0+2.2,'#9cc6dd');bx(R.S,x0+2.25,.85,z0+1.6,2.5,.1,1.2,'#ffffff');
    bx(R.S,cx+4.5,3.4,z0+.05,.5,1.6,.05,'#e94b3c');bx(R.S,cx+4.5,3.4,z0+.05,1.6,.5,.05,'#e94b3c');
    R.back(-1.5,3.4,3.4,2.3,posterTex({w:512,h:346,bg:'#ffffff',kicker:'Client · Website',title:'Clinic website',body:'A clean, trustworthy site for a doctor\'s practice. In build.',big:58,bs:22}),()=>G.card({n:'Clinic website',tag:'Website',st:'In build',d:'A clean, trustworthy website for a doctor\'s practice, built by Vashu.',href:'',color:'#ffffff'}),{reach:8});
    R.npc({id:'doctor',name:'Dr. Rao',x:cx,z:z0+.9,yaw:0,look:{shirt:'#cfe3f7',pants:'#2b2b2b',hair:'grey',coat:'#ffffff',glasses:true,face:'flat'},lines:['I haven\'t had a decent coffee in a week.','Doctor\'s orders: someone brew me a coffee at TOKI.'],barks:['Next!','Say aaah.']})});
  shop('ajji','Ajji\'s House',{w:12,d:10,wall:'#f6e3b4',floor:'#9c6b3f',trim:'#c0392b',light:'#ffe9c4'},R=>{const {cx,z0}=R;bx(R.S,cx,.7,z0+2,3,.15,1.1,'#6b4a35');for(const dx of[-1.4,1.4])bx(R.S,cx+dx,2.7,z0+2,.04,4,.04,'#555');
    blk(R.S,cx+3,cx+4.4,0,.8,z0+1,z0+2.2,'#6b4a35');cyl(R.S,cx+3.4,1,z0+1.5,.14,.12,.4,'#c9ccd1',8);cyl(R.S,cx+3.9,.92,z0+1.5,.22,.22,.12,'#c9ccd1',10);
    R.back(-3.5,3.2,2.4,2.4,posterTex({w:400,h:400,bg:'#c0392b',kicker:'Ajji\'s rule',title:'Filter coffee only.',big:54}),null);
    R.npc({name:'Ajji',x:cx,z:z0+2.6,yaw:0,look:{shirt:'#c0392b',pants:'#c0392b',hair:'grey',long:true,glasses:true,face:'smile'},sit:true,lines:['Come, come, sit. You want coffee? Filter coffee. Not this foam business.','My grandson-type-boy Vashu makes "specialty". Special what? Decoction is decoction.','But he has good manners. Tell him to eat properly.'],barks:['Ayyo.','Eat something!']})});
  shop('meera','Meera\'s House',{w:12,d:10,wall:'#2c3e50',floor:'#7f8c8d',trim:'#c9f26b',light:'#e8f0ff'},R=>{const {cx,z0}=R;blk(R.S,cx-3,cx+3,0,1,z0+.6,z0+1.8,'#1d1d1d');for(let i=0;i<3;i++){bx(R.S,cx-1.8+i*1.8,1.7,z0+.9,1.5,.9,.08,'#141414');bx(WIN,cx-1.8+i*1.8,1.7,z0+.95,1.35,.75,.02,'#ffffff')}
    bx(R.S,cx+3.5,.4,z0+4,1.4,.8,1.4,'#a463ff');
    R.back(-4,3.6,2.2,2.6,posterTex({w:400,h:472,bg:'#c9f26b',kicker:'Streak',title:'412 days',body:'Sleep: optional.',big:60}),null);
    R.npc({name:'Meera (CS student)',x:cx,z:z0+2.4,yaw:Math.PI,look:{shirt:'#a463ff',pants:'#141414',hair:'long',glasses:true,headset:true,face:'calm'},sit:true,lines:['3 AM. 4 monitors. 1 bug. It\'s a semicolon. It\'s always a semicolon.','Vashu builds apps from his PHONE. I have 3 monitors and I\'m still stuck.','If you see Skill-Issue Sid, tell him I beat his score.'],barks:['Compiling…','One more bug.']})});
  shop('police','City Kotwali',{w:16,d:12,wall:'#dfe7f2',floor:'#9aa3ad',trim:'#1d3f8f',light:'#eef4ff'},R=>{const {cx,x0,x1,z0}=R;blk(R.S,cx-4,cx+1,0,1.1,z0+2,z0+3,'#1d3f8f');bx(R.S,cx-1.5,1.13,z0+2.5,5.2,.06,1.2,'#f4f4f4');
    for(let u=0;u<=4;u+=.4)blk(R.S,cx+3+u-.04,cx+3+u+.04,0,3.2,z0+4.5,z0+4.58,'#555',false);col(cx+3,cx+7.6,0,3.2,z0+4.4,z0+4.7);col(cx+2.9,cx+3.1,0,3.2,z0,z0+4.7);bx(R.S,cx+5,3.2,z0+2.3,4.2,.1,4.6,'#555');bx(R.S,cx+5.5,.4,z0+1,2.6,.3,1,'#8a5a3b');
    R.back(-5.5,3.4,1.8,2.3,posterTex({w:300,h:384,bg:'#f4e6c8',fg:'#3a2a1a',kicker:'Wanted',title:'Unpaid Invoice',big:44,body:'Last seen: "next week, pakka".',bs:20}),null);
    R.back(-2.8,3.4,1.8,2.3,posterTex({w:300,h:384,bg:'#f4e6c8',fg:'#3a2a1a',kicker:'Wanted',title:'"Make it pop"',big:44,body:'Armed with vague feedback.',bs:20}),null);
    R.npc({name:'Inspector Kavya',x:cx-1.5,z:z0+1.2,yaw:0,look:{shirt:'#c9b48a',pants:'#c9b48a',hair:'bun',hat:'#1d3f8f',face:'flat',long:true},lines:['Lost something? Beans don\'t count as stolen property.','We arrested Scope Creep this morning. Caught adding "one small feature".','Freeloader complaints get priority. Say "50% advance" and they flee.'],barks:['Order!','Next.']});
    R.npc({name:'Scope Creep (in custody)',x:cx+5,z:z0+2.4,yaw:0,look:{shirt:'#ff8a3d',pants:'#ff8a3d',hair:'short',face:'o',long:true},emote:'beg',lines:['I only asked for ONE small change!','Okay, two. And a dashboard. And dark mode.','Is this jail cell responsive on mobile?'],barks:['Just one tweak!','Can we add AI?']})});
  shop('school','Vashu Town Public School',{w:18,d:14,wall:'#f6e7b8',floor:'#c8a27a',trim:'#8b1e2d',light:'#fff6dc'},R=>{const {cx,z0}=R;
    R.back(0,3.2,8,2.6,tex(1024,334,(x,W_,H)=>{x.fillStyle='#24452f';x.fillRect(0,0,W_,H);x.strokeStyle='#8a5a3b';x.lineWidth=18;x.strokeRect(0,0,W_,H);x.fillStyle='#f4f4f4';x.font='600 46px "Inter Tight",sans-serif';x.fillText("Today's lesson:",50,80);x.font='800 64px "Bricolage Grotesque",sans-serif';x.fillText('Cup first, then the numbers.',50,165);x.font='500 38px "Inter Tight",sans-serif';x.fillText('Homework: find all 8 coffee beans.',50,240);x.fillText('Extra credit: say no to freeloaders.',50,295)}),null);
    blk(R.S,cx-2,cx+2,0,1,z0+2.4,z0+3.4,'#6b4a35');R.npc({name:'Teacher Lakshmi',x:cx,z:z0+1.4,yaw:0,look:{shirt:'#2e7d4f',pants:'#2e7d4f',hair:'bun',glasses:true,face:'smile',long:true},emote:'talk',lines:['Welcome to class. Today: how a barista became a founder.','Rule one: taste everything. Rule two: write down the numbers.','Pop quiz: what comes first? The cup. Always the cup.'],barks:['Silence!','Chapter 3.']});
    for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=cx-5.2+c*3.4,z=-.4+r*2.4;blk(R.S,x-.9,x+.9,0,.9,z-.4,z+.2,'#c89b6d');blk(R.S,x-.8,x+.8,0,.48,z+.5,z+.9,'#8a5a3b')}
    const st=[{shirt:'#ffffff',pants:'#1d3f8f',hair:'short',face:'grin'},{shirt:'#ffffff',pants:'#1d3f8f',hair:'long',face:'smile'},{shirt:'#ffffff',pants:'#1d3f8f',hair:'curly2',face:'o'}];
    [[cx-5.2,.3],[cx+1.6,2.7],[cx+5,.3]].forEach(([x,z],i)=>R.npc({name:'Student',x,z:z+.4,yaw:Math.PI,sit:true,look:st[i],lines:[['Is this going to be on the exam?'],['My project is a coffee robot. Like OS-NEKO, but it does homework.'],['Sir said the bean on the fountain needs a jump. Don\'t tell anyone.']][i],barks:['Huh?','Lunch?']}))});
  shop('ev','Outpulse.EV Showroom',{w:16,d:12,wall:'#f4f4f4',floor:'#2b2b2b',trim:'#d7263d',light:'#ffffff'},R=>{const {cx,z0}=R;const p=PJ('Arc-Street');
    R.back(0,3.4,6,2.4,posterTex({w:768,h:307,bg:'#d7263d',kicker:'Outpulse.EV',title:'Arc-Street',big:96,body:'600W belt drive. Built for long, quiet rides.',bs:28}),()=>G.card(p),{reach:8});
    [-4.5,0,4.5].forEach((u,i)=>{const x=cx+u,z=-1.5;cyl(R.S,x,.15,z,1.4,1.4,.3,'#141414',24);const b=new Batch();model(b,'Arc-Street','#d7263d');const m=b.mesh(CHM);m.scale.setScalar(1.9);m.position.set(x,.3,z);m.rotation.y=.6+i*.3;scene.add(m);m.userData.tap=()=>G.card(p);m.userData.reach=5;G.pick.push(m);col(x-1.4,x+1.4,0,1.5,z-1.4,z+1.4)});
    for(const u of[-6.5,6.5]){blk(R.S,cx+u-.3,cx+u+.3,0,1.6,z0+.4,z0+1,'#ffffff');bx(R.S,cx+u,1.2,z0+1.01,.3,.3,.02,'#2ee66b')}
    R.npc({name:'EV Advisor Rohan',x:cx+3,z:2.2,yaw:Math.PI,look:{shirt:'#d7263d',pants:'#141414',hair:'short',face:'grin',logo:'#ffffff'},emote:'talk',lines:['Range anxiety? Never heard of her.','600W belt drive. Silent. Smooth. Zero petrol bills.','Test ride? Find all 8 beans and the one parked outside HQ is yours.'],barks:['Zero emissions!','Test ride?']})});

  extraRooms(room,{scene,addPlane,posterTex,npc,W,outs});
  if((G.TOWN||'vashupur')==='vashupur')mallRooms(room,{scene,addPlane,posterTex,npc,W,outs});
}
function model(b,n,c){
  if(n==='OS-NEKO'){bx(b,0,.45,0,.8,.55,.9,'#16224a');bx(b,0,.85,.1,.6,.35,.5,'#f4efe6');for(const s of[-1,1]){bx(b,s*.18,1.1,.1,.12,.18,.08,'#16224a');for(const z of[-.3,.3]){const g=new THREE.CylinderGeometry(.14,.14,.1,10);g.rotateZ(Math.PI/2);g.translate(s*.42,.16,z);b.add(g,'#1d1d1d')}}bx(b,-.12,.88,.36,.08,.08,.02,'#3bd1ff');bx(b,.12,.88,.36,.08,.08,.02,'#3bd1ff')}
  else if(n==='Ultrasound Device'){cyl(b,-.25,.35,0,.1,.16,.6,'#f4efe6',10);bx(b,.25,.35,0,.4,.7,.05,'#1d1d1d');bx(b,.25,.35,.03,.34,.6,.01,'#3fa7e0')}
  else if(n==='Arc-Street'){bx(b,0,.12,0,.25,.06,.9,'#d7263d');bx(b,0,.5,.4,.05,.7,.05,'#1d1d1d');bx(b,0,.85,.4,.5,.05,.05,'#1d1d1d');for(const z of[.4,-.4]){const g=new THREE.CylinderGeometry(.12,.12,.08,10);g.rotateZ(Math.PI/2);g.translate(0,.12,z);b.add(g,'#1d1d1d')}}
  else if(n==='Outpulse Voice'){bx(b,0,.4,0,.35,.7,.06,'#1d1d1d');bx(b,0,.4,.035,.3,.6,.01,'#fff06b');bx(b,.35,.9,0,.5,.3,.05,'#ffffff')}
  else{bx(b,0,.12,0,.5,.05,.35,'#2c2f36');bx(b,0,.3,0,.08,.35,.08,'#2c2f36');bx(b,0,.75,0,1.2,.75,.06,'#1d1d1d');bx(b,0,.75,.035,1.1,.65,.01,c&&c!=='#f6f3ea'?c:'#3d7be8')}}

/* =================== NPC factory =================== */
export function npc(scene,cfg){const c=makeChar(Object.assign({seed:Math.floor(Math.random()*1e4)},cfg.look||{}));c.position.set(cfg.x,cfg.y||0,cfg.z);c.rotation.y=cfg.yaw||0;scene.add(c);
  const n=Object.assign({c,kind:'static',speed:0,pi:0,pause:0,emote:cfg.emote||null},cfg);if(cfg.sit){c.position.y+=.18}
  c.traverse(o=>{if(o.isMesh)o.userData.npc=n});c.userData.tap=()=>G.talk(n);c.userData.reach=4;G.pick.push(c);G.npcs.push(n);return n}
export function spawnTown(scene){const T=G.TOWN||'vashupur',on=(...a)=>a.includes(T);
  (G.extraNPCs||[]).forEach(c=>npc(scene,c));spawnPatrols(scene,npc);
  const LOOPS={vashupur:[[[-160,28.5],[-62,28.5],[-62,93],[-160,93]],[[12,9],[165,9],[165,-9],[12,-9]],[[-12,9],[-178,9],[-178,-9],[-12,-9]]],
    memepura:[[[18,6],[96,6],[96,-6],[18,-6]],[[48,48],[80,48],[82,80],[48,82]],[[20,6],[60,6],[60,25],[20,25]]],
    kaapikunj:[[[-18,6],[-72,6],[-72,-6],[-18,-6]]],basti:[[[6,18],[6,90],[-6,90],[-6,18]]],barfii:[[[-34,6],[-70,6],[-70,-6],[-34,-6]]],
    delulugarh:[[[-39,17],[39,17],[39,-15],[-39,-15]],[[-50,28],[50,28],[50,15],[-50,15]]]};
  const HOME={'Aura Farmer Arjun':'vashupur','Six-Seven Kid':'memepura','Skill-Issue Sid':'memepura','Delulu Founder':'delulugarh','Touch-Grass Tanmay':'memepura','Corporate Uncle':'delulugarh','Main-Character Mira':'memepura','Rizz Uncle':'kaapikunj'};
  const lp=LOOPS[T]||[];let li=0;
  MEMERS.forEach((m,i)=>{if(HOME[m.name]!==T)return;const base={name:m.name,look:m.look,lines:m.lines,barks:m.barks,emote:m.emote||null};
    if(m.lie)return npc(scene,Object.assign(base,{x:32,z:48.5,yaw:0,lie:true}));
    if(m.name.startsWith('Aura'))return npc(scene,Object.assign(base,{x:-111.25,z:48,yaw:0,emote:'pose'}));
    const path=lp[li++%lp.length];npc(scene,Object.assign(base,{x:path[0][0],z:path[0][1],kind:'wander',path,pi:(i*2)%path.length,speed:2.2+((i*37)%10)/10}))});
  if(on('vashupur')){FREELOADERS.forEach((m,i)=>npc(scene,{name:m.name+' (freeloader client)',look:m.look,lines:m.lines,barks:m.barks,x:i?60:-40,z:9,kind:'chase',home:[i?60:-40,9],emote:'beg',free:true}));
    npc(scene,{id:'guide',name:'Mini-Vashu (guide)',look:{shirt:'#141414',pants:'#8a7f5a',cargo:'#7a6f4c',hair:'curly',glasses:true,hat:null,sash:'#ff6a3d',face:'grin',seed:3},x:-120,z:141.5,yaw:Math.PI,kind:'guide',lines:[],barks:['Tap me for a tour!','Lost? I\'m the guide.']})}
  if(on('kaapikunj')){npc(scene,{id:'farmer',name:'Kaveri (coffee farmer)',look:{shirt:'#5cc46b',pants:'#6b5a3a',hair:'long',hat:'#c9a26b',face:'smile'},x:-70,z:7.3,yaw:Math.PI,lines:[],barks:['My beans!','Have you seen my beans?']})}
  if(on('vashupur')){npc(scene,{id:'doctor',name:'Dr. Rao',look:{shirt:'#cfe3f7',pants:'#2b2b2b',hair:'grey',coat:'#ffffff',glasses:true,face:'flat'},x:-38.6,z:66,yaw:-Math.PI/2,lines:[],barks:['Coffee, anyone?','Doctor\'s orders: caffeine.']})}
  if(on('basti')){
    W.politician=npc(scene,{name:'Shri Vaada Kumar',look:{shirt:'#ffffff',pants:'#ffffff',hair:'bald',mustache:true,face:'grin',long:true,vest:'#ff6a3d'},x:-28,y:1.2,z:59.8,yaw:Math.PI,emote:'talk',lines:['Brother! Sister! Vote Kettle!','I promise… everything. Details later.'],barks:['Vote Kettle!']});
    W.band=[['guitar','#c9f26b','play'],['bass','#3bd1ff','play'],['drums','#ff3b8d','drum'],['keys','#ffcc3a','play']].map(([r,cl,e],i)=>npc(scene,{name:'The Crema Boys ('+r+')',look:{shirt:cl,pants:'#141414',hair:['curly2','long','cap','short'][i],hat:'#141414',shades:i%2===0,face:'grin'},x:-34+i*4,y:1.2,z:60,yaw:Math.PI,emote:e,lines:['We only know one song. It\'s about coffee.','Next song: "Extraction Ballad (Part 2)".'],barks:['Rock on!']}));
    W.crowd=[];for(let i=0;i<10;i++)W.crowd.push(npc(scene,{name:'Townsfolk',look:{shirt:['#e94b3c','#3d7be8','#ffcc3a','#5cc46b','#ff8fc1','#8a63d2'][i%6],pants:['#141414','#3a4a6b','#6b5a3a'][i%3],hair:['short','long','bun','cap','curly2'][i%5],hat:['#141414','#e94b3c'][i%2],face:['smile','grin','o'][i%3]},x:0,z:0,kind:'crowd',ci:i,lines:['Here for the vibes.','Did he just promise swimming pools?','Best show in town. Only show in town.'],barks:['Woo!','Clap clap.']}))}
  if(on('memepura'))W.dog=animal(scene,'dog');
  if(on('vashupur')&&G.rooms.home)W.cat=animal(scene,'cat');
}
function animal(scene,type){const b=new Batch();const c=type==='dog'?'#c48a4a':'#2b2b2b';
  if(type==='dog'){bx(b,0,.55,0,.5,.45,1,c);bx(b,0,.85,.6,.42,.4,.45,c);bx(b,0,.75,.88,.2,.18,.15,'#1d1d1d');bx(b,-.16,1.1,.55,.1,.18,.1,'#7a4a2a');bx(b,.16,1.1,.55,.1,.18,.1,'#7a4a2a');for(const s of[-1,1])for(const z of[-.35,.35])bx(b,s*.17,.18,z,.14,.36,.14,c);bx(b,0,.75,-.55,.1,.1,.35,c,0,-.6)}
  else{bx(b,0,.3,0,.3,.28,.6,c);bx(b,0,.5,.35,.3,.28,.28,c);bx(b,-.09,.68,.38,.08,.1,.06,c);bx(b,.09,.68,.38,.08,.1,.06,c);bx(b,-.07,.52,.5,.05,.05,.01,'#c9f26b');bx(b,.07,.52,.5,.05,.05,.01,'#c9f26b');for(const s of[-1,1])for(const z of[-.2,.2])bx(b,s*.1,.09,z,.08,.18,.08,c);bx(b,0,.5,-.4,.06,.06,.4,c,0,-.9)}
  const m=b.mesh(CHM);m.castShadow=true;const g=new THREE.Group();g.add(m);scene.add(g);
  const a={type,g,c:g,x:type==='dog'?60:-80,z:type==='dog'?40:-2,kind:type,name:type==='dog'?'Biscuit the dog':'Espresso the cat',lines:type==='dog'?['Woof! (He wants you to pet him.)']:['Mrrp. (The cat permits one pat.)'],barks:type==='dog'?['Woof!','Bork.']:['Mrrp.','…']};
  if(type==='cat'){a.room='home';const r=G.rooms.home;a.x=r.cx-3;a.z=2}
  g.position.set(a.x,0,a.z);m.userData.npc=a;g.userData.tap=()=>G.talk(a);g.userData.reach=3.5;G.pick.push(g);G.npcs.push(a);return a}

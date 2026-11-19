import {THREE,G,Batch,bx,cyl,makeChar,anim} from './core.js';
import {npc} from './world.js';
import {roadGraph} from './roads.js';
/* Street life: buses and autos on the roads (left lane, stopping for signals and people),
   stunt riders pulling wheelies, a police checkpoint, and people walking to work. */
const VM=new THREE.MeshLambertMaterial({vertexColors:true});
const wheel=(B,x,y,z,r,w)=>{const g=new THREE.CylinderGeometry(r,r,w,10);g.rotateZ(Math.PI/2);g.translate(x,y,z);B.add(g,'#1b1b1b')};
function meshOf(fn){const B=new Batch();fn(B);const m=B.mesh(VM);m.castShadow=true;return m}
function busModel(c){const g=new THREE.Group();g.add(meshOf(B=>{bx(B,0,1.75,0,2.5,2.7,10.4,c);bx(B,0,3.15,0,2.4,.12,10.2,'#f4efe6');bx(B,0,.95,0,2.52,.3,10.42,'#f4efe6');
  for(const s of[-1,1])bx(B,s*1.26,2.2,-.4,.04,1,8.4,'#26323d');bx(B,0,2.25,5.21,2.2,1.2,.04,'#26323d');bx(B,0,2.9,5.22,1.7,.3,.03,'#ffcc3a');bx(B,0,2.2,-5.21,2.2,.9,.04,'#26323d');
  for(const z of[3.4,-3.3])for(const s of[-1,1])wheel(B,s*1.12,.5,z,.5,.34)}));return g}
function autoModel(body){const g=new THREE.Group();g.add(meshOf(B=>{bx(B,0,.72,-.15,1.3,.62,2.1,body);bx(B,0,.72,1.05,.9,.55,.5,body);bx(B,0,1.55,-.1,1.36,.1,2.25,'#ffcc00');
  bx(B,0,1.32,-.95,1.3,.5,.12,'#ffcc00');for(const s of[-1,1])bx(B,s*.62,1.25,.15,.06,.6,.06,'#1b1b1b');bx(B,0,1.3,.95,1.05,.5,.06,'#9fd0ff');bx(B,0,1.05,.25,.5,.35,.35,'#3a2a20');
  bx(B,0,1.38,.25,.32,.3,.3,'#c48a60');wheel(B,0,.3,1.05,.3,.18);for(const s of[-1,1])wheel(B,s*.6,.3,-.75,.3,.18)}));return g}
function bikeModel(col){const g=new THREE.Group(),tilt=new THREE.Group();tilt.position.set(0,.34,-.72);g.add(tilt);
  const m=meshOf(B=>{bx(B,0,.68,.05,.34,.34,1.1,col);bx(B,0,.9,-.3,.3,.12,.7,'#1b1b1b');bx(B,0,1.02,.62,.7,.06,.06,'#c9ccd1');bx(B,0,.95,.72,.2,.2,.08,'#fff6b0');
    for(const z of[.72,-.72])wheel(B,0,.34,z,.34,.12);bx(B,.16,.5,-.45,.08,.08,.5,'#c9ccd1')});m.position.set(0,-.34,.72);tilt.add(m);g.userData.tilt=tilt;return g}
function jeepModel(){return meshOf(B=>{bx(B,0,.95,0,2,1.1,4.4,'#f4f4f4');bx(B,0,1.85,-.3,1.9,.8,2.6,'#f4f4f4');bx(B,0,1.0,0,2.02,.18,4.42,'#1d3f8f');for(const s of[-1,1])bx(B,s*.96,1.85,-.3,.04,.55,2.3,'#26323d');
  bx(B,0,1.85,1.01,1.7,.55,.04,'#26323d');for(const z of[1.4,-1.4])for(const s of[-1,1])wheel(B,s*.95,.42,z,.42,.3)})}

export function makeTraffic(ctx){const {P,snd}=ctx;let root=null,TD=null,net=null,town='',V=[],walkers=[],chk=null,mobile=false;
  const signalGreen=(axis,T)=>{const t=T%16;return axis==='ns'?t<6.5:(t>=8&&t<14.5)};
  function newRoute(v,R){const n=net.N[Math.floor(Math.random()*net.N.length)];const p=net.route(v.p.x,v.p.z,n.x,n.z);if(p.length<2||Math.hypot(n.x-v.p.x,n.z-v.p.z)<40)return false;
    v.path=net.lane(p,v.off);v.i=1;return true}
  function addVeh(kind,model,max,off){const v={kind,g:model,p:new THREE.Vector3(),max,spd:0,off,path:[],i:1,wait:0,ph:Math.random()*20,blockT:0,hornT:0,revT:Math.random()*3,wh:3+Math.random()*4,whT:0};
    const n=net.N[Math.floor(Math.random()*net.N.length)];v.p.set(n.x,0,n.z);for(let k=0;k<6&&!newRoute(v);k++){}
    if(v.path.length>1){const i=1+Math.floor(Math.random()*(v.path.length-1));const a=v.path[i-1],b=v.path[i],u=Math.random();v.p.set(a.x+(b.x-a.x)*u,0,a.z+(b.z-a.z)*u);v.i=i;model.rotation.y=Math.atan2(b.x-a.x,b.z-a.z)}
    model.position.copy(v.p);root.add(model);V.push(v);return v}
  function reset(r,td,id){root=r;TD=td;town=id;V=[];walkers=[];net=roadGraph(td);mobile=matchMedia('(pointer:coarse)').matches;
    const lane=net.W*.22,tc=td.color||'#d7263d';
    for(let i=0;i<2;i++)addVeh('bus',busModel(i?'#1d6fb8':tc),10,lane);
    const autoBody=['#1f7a3a','#1b1b1b','#1f7a3a','#1b1b1b','#1f7a3a'];for(let i=0;i<(mobile?4:5);i++)addVeh('auto',autoModel(autoBody[i]),12,lane);
    const looks=[{shirt:'#ff2d95',pants:'#1b1b1b',hair:'curly',hairC:'#d9b44a'},{shirt:'#00e5ff',pants:'#3a4a6b',hair:'curly',hairC:'#ff6a3d'}];
    for(let i=0;i<2;i++){const g=bikeModel(i?'#ff2d95':'#00c853');const rd=makeChar(Object.assign({seed:400+i},looks[i]));rd.position.set(0,.48-.34,-.15+.72);rd.scale.setScalar(.92);g.userData.tilt.add(rd);
      const v=addVeh('stunt',g,17,lane*.85);v.rider=rd;v.c=g}
    checkpoint();commuters()}
  /* police checkpoint: by the police station in Vashupur, on the longest road elsewhere */
  function checkpoint(){let r=net.R.reduce((a,b)=>(b.b-b.a)>(a.b-a.a)?b:a),t=r.a+(r.b-r.a)*.62;
    const bs=TD.bus||TD.spawn||{x:0,z:0},cand=[];for(const q of net.R)for(let f=.25;f<=.76;f+=.03){const tt=q.a+(q.b-q.a)*f,px=q.x?tt:q.c,pz=q.x?q.c:tt;
      const dj=Math.min(...net.N.map(n=>Math.hypot(n.x-px,n.z-pz)));const db=Math.hypot(px-bs.x,pz-bs.z);if(dj>16&&db>50)cand.push({q,tt,s:dj+Math.min(db,90)*.3})}
    if(cand.length){const c=cand.sort((a,b)=>b.s-a.s)[0];r=c.q;t=c.tt}
    if(town==='vashupur'){r=net.R.find(q=>q.x&&Math.abs(q.c)<1&&q.a<66&&q.b>66)||r;t=66}
    const hw=r.w/2,S0=net.W*.22+1.35,dir=r.x?{x:1,z:0}:{x:0,z:1},left={x:dir.z,z:-dir.x};
    const at=(along,side)=>r.x?{x:t+along,z:r.c+left.z*side}:{x:r.c+left.x*side,z:t+along};const ry=Math.atan2(dir.x,dir.z);
    const B=new Batch();for(let k=0;k<3;k++){const p=at(-6+k*3.2,S0+.6);for(let s=0;s<5;s++)bx(B,p.x+(r.x?(s-2)*.36:0),.55,p.z+(r.x?0:(s-2)*.36),r.x?.36:.32,.9,r.x?.32:.36,s%2?'#141414':'#ffcc3a');
      bx(B,p.x,.08,p.z,r.x?1.9:.5,.16,r.x?.5:1.9,'#7a7a7a');G.colliders.push({x0:p.x-1,x1:p.x+1,y0:0,y1:1.1,z0:p.z-1,z1:p.z+1})}
    for(let k=0;k<4;k++){const p=at(-9+k*1.6,S0+.1);cyl(B,p.x,.38,p.z,.05,.28,.76,'#ff6a00',8);bx(B,p.x,.45,p.z,.3,.08,.3,'#ffffff')}
    const m=B.mesh(VM);m.castShadow=true;root.add(m);
    const jp=at(5,S0+1.4),jeep=jeepModel();jeep.position.set(jp.x,0,jp.z);jeep.rotation.y=ry;jeep.castShadow=true;root.add(jeep);G.colliders.push({x0:jp.x-(r.x?2.3:1.1),x1:jp.x+(r.x?2.3:1.1),y0:0,y1:2.3,z0:jp.z-(r.x?1.1:2.3),z1:jp.z+(r.x?1.1:2.3)});
    const lr=new THREE.Mesh(new THREE.BoxGeometry(.5,.16,.3),new THREE.MeshBasicMaterial({color:'#ff2d2d'})),lb=lr.clone();lb.material=new THREE.MeshBasicMaterial({color:'#2d6bff'});
    lr.position.set(-.3,2.32,-.3);lb.position.set(.3,2.32,-.3);jeep.add(lr,lb);
    const bp=at(-2.6,S0+.5),bike=bikeModel('#7a7a7a');bike.position.set(bp.x,0,bp.z);bike.rotation.y=ry+.25;root.add(bike);
    const KH={shirt:'#c9b48a',pants:'#c9b48a',hair:'short',hat:'#1d3f8f',face:'flat',long:true};const o1=at(-5,0),o2=at(.3,S0+.4),rp=at(-1,S0+1.6);
    const stopper=npc(root,{name:'Constable Patil',x:o1.x,z:o1.z,yaw:ry+Math.PI,look:KH,emote:'wave',lines:['Naaka bandi. Every bike gets checked today.','Helmet, licence, RC, PUC. All four, or the bike stays here.','The stunt boys think we cannot hear them coming. We hear everything.'],barks:['Ruko! Side mein lagao.','Helmet kahaan hai?','Papers dikhao.']});
    npc(root,{name:'SI Deshmukh',x:o2.x,z:o2.z,yaw:Math.atan2(rp.x-o2.x,rp.z-o2.z),look:Object.assign({},KH,{shirt:'#bfa679'}),emote:'talk',lines:['PUC expired eight months ago. Fine is on the way.','Do not argue with me, argue with the challan machine.','Next time, keep the papers in the dicky, not at home.'],barks:['Licence?','PUC kab ka hai?','Challan banega.']});
    npc(root,{name:'Caught Rider',x:rp.x,z:rp.z,yaw:Math.atan2(o2.x-rp.x,o2.z-rp.z),look:{shirt:'#ff6a3d',pants:'#1b1b1b',hair:'curly'},emote:'talk',lines:['Sir, licence ghar pe hai, I swear.','My cousin is in the police, sir. Very senior. Very.','Okay okay, how much is the fine?'],barks:['Sir, ek baar maaf kar do!','Ghar pe bhool gaya, sir.']});
    chk={x:(o1.x+jp.x)/2,z:(o1.z+jp.z)/2,lr,lb,stopper,whT:0}}
  /* people walking to work: door to door along the sidewalks */
  function commuters(){const doors=G.buildings.filter(b=>b.door&&!/construction|lot/i.test(b.name));const all=G.buildings.filter(b=>b.door);if(all.length<2)return;
    const side=(TD.road&&TD.road.side)||2,off=net.W/2+side*.5;const pool=doors.length>3?doors:all;
    const shirts=['#f4f1ea','#2b5fa8','#ffffff','#9b2d30','#3e7c59','#e8d9b5','#202020','#6a4c93'],pants=['#26323d','#3a4a6b','#1b1b1b','#5b4636'];
    const lines=[['Running late. Standup in five minutes.','Same road, same traffic, same chai.'],['Office, then gym, then office again in my dreams.','Do you know a shortcut? There is no shortcut.'],['Monday energy, Thursday body.','If the bus is late one more time I am buying a cycle.']];
    for(let i=0;i<(mobile?8:11);i++){const L=lines[i%3];const n=npc(root,{name:'Commuter',x:0,z:0,kind:'commute',look:{shirt:shirts[i%shirts.length],pants:pants[i%pants.length],tie:i%3===0?'#1d3f8f':null,hair:['short','bun','long','curly'][i%4],seed:900+i},lines:L,barks:['Late ho gaya!','Office, phir office.','Chai break at 4?','Bus miss ho gayi!']});
      n.hidden=true;n.walkers=true;const w={n,path:[],i:1,sp:1.35+Math.random()*.5,rest:0,from:pool[Math.floor(Math.random()*pool.length)],pool,off};
      n.walk=dt=>walk(w,dt);walkers.push(w);plan(w,pool,off,true)}}
  function plan(w,pool,off,mid){const a=w.from;let b=a;for(let k=0;k<6&&b===a;k++)b=pool[Math.floor(Math.random()*pool.length)];if(a===b){w.n.hidden=true;w.rest=5;return}
    const r=net.lane(net.route(a.door.x,a.door.z,b.door.x,b.door.z),off);w.path=[{x:a.door.x,z:a.door.z},...r,{x:b.door.x,z:b.door.z}];w.i=1;w.to=b;w.pool=pool;w.off=off;
    const c=w.n.c;let k=1;if(mid&&w.path.length>2){k=1+Math.floor(Math.random()*(w.path.length-2));const p=w.path[k-1],q=w.path[k],u=Math.random();c.position.set(p.x+(q.x-p.x)*u,0,p.z+(q.z-p.z)*u)}else c.position.set(w.path[0].x,0,w.path[0].z);w.i=k;w.n.hidden=false}
  function walk(w,dt){if(w.rest>0){w.rest-=dt;if(w.rest<=0){w.from=w.to||w.from;plan(w,w.pool,w.off,false)}return 0}
    const c=w.n.c,t=w.path[w.i];if(!t){w.n.hidden=true;w.rest=4+Math.random()*8;return 0}
    const dx=t.x-c.position.x,dz=t.z-c.position.z,d=Math.hypot(dx,dz);if(d<.4){w.i++;return w.sp}
    const st=Math.min(d,w.sp*dt);c.position.x+=dx/d*st;c.position.z+=dz/d*st;let a=Math.atan2(dx,dz)-c.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));c.rotation.y+=a*Math.min(1,dt*8);return w.sp}
  /* vehicles */
  const h=new THREE.Vector3();const onRoad=(x,z)=>TD.roads.some(r=>x>r[0]+.3&&x<r[1]-.3&&z>r[2]+.3&&z<r[3]-.3)||(TD.round&&Math.hypot(x-TD.round.x,z-TD.round.z)<TD.round.r1&&Math.hypot(x-TD.round.x,z-TD.round.z)>TD.round.r0);
  function blockedAhead(v,look,lat){h.set(Math.sin(v.g.rotation.y),0,Math.cos(v.g.rotation.y));const chk=(x,z)=>{const rx=x-v.p.x,rz=z-v.p.z,al=rx*h.x+rz*h.z;return al>0&&al<look&&Math.abs(rx*h.z-rz*h.x)<lat};
    if(P.world==='out'&&onRoad(P.pos.x,P.pos.z)&&chk(P.pos.x,P.pos.z))return 'player';if(v.ghost>0)return null;for(const o of V)if(o!==v&&chk(o.p.x,o.p.z)&&Math.abs(Math.atan2(Math.sin(o.g.rotation.y-v.g.rotation.y),Math.cos(o.g.rotation.y-v.g.rotation.y)))<1.2)return 'veh';
    return null}
  function vehTick(v,dt,T){if(v.wait>0){v.wait-=dt;v.spd=0}else{
    const t=v.path[v.i];if(!t){v.wait=v.kind==='bus'?6:.3;if(!newRoute(v))v.path=[];return}
    const dx=t.x-v.p.x,dz=t.z-v.p.z,d=Math.hypot(dx,dz);if(d<.7){v.i++;return}
    let want=v.max;const nx=v.path[v.i+1];if(nx&&d<10){const a1=Math.atan2(dx,dz),a2=Math.atan2(nx.x-t.x,nx.z-t.z);const turnA=Math.abs(Math.atan2(Math.sin(a2-a1),Math.cos(a2-a1)));if(turnA>.5)want=Math.min(want,v.kind==='stunt'?9:5.5)}
    const look=v.kind==='bus'?12:8,blk=blockedAhead(v,look,v.kind==='bus'?2.2:1.6);if(v.ghost>0)v.ghost-=dt;if(blk==='veh'){v.vb=(v.vb||0)+dt;if(v.vb>4){v.ghost=2.5;v.vb=0}}else v.vb=0;
    if(blk){want=0;if(blk==='player'){v.blockT+=dt;v.hornT-=dt;if(v.blockT>.8&&v.hornT<=0&&v.kind!=='stunt'){v.hornT=2.5+Math.random()*2;const pd=Math.hypot(P.pos.x-v.p.x,P.pos.z-v.p.z);snd.horn(Math.max(.2,1-pd/25),v.kind==='bus'?1:0)}}}else v.blockT=0;
    if(W.signals&&town==='vashupur'){h.set(dx/d,0,dz/d);const al=-v.p.x*h.x-v.p.z*h.z,lat=Math.abs(-v.p.x*h.z+v.p.z*h.x);if(al>10&&al<17&&lat<9){const axis=Math.abs(h.z)>Math.abs(h.x)?'ns':'ew';if(!signalGreen(axis,T))want=Math.min(want,Math.max(0,(al-11)*1.2))}}
    if(chk&&Math.hypot(chk.x-v.p.x,chk.z-v.p.z)<16)want=Math.min(want,v.kind==='stunt'?want:4);
    v.spd+=(want-v.spd)*Math.min(1,dt*(want<v.spd?3.2:1.1));const st=Math.min(d,v.spd*dt);v.p.x+=dx/d*st;v.p.z+=dz/d*st;
    let a=Math.atan2(dx,dz)-v.g.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));v.g.rotation.y+=a*Math.min(1,dt*(v.kind==='bus'?3:5))}
    v.g.position.copy(v.p);
    if(v.kind==='stunt'){const tl=v.g.userData.tilt,wv=Math.sin(T*1.7+v.ph);v.g.position.x+=Math.cos(v.g.rotation.y)*wv*1.1;v.g.position.z-=Math.sin(v.g.rotation.y)*wv*1.1;
      v.wh-=dt;if(v.wh<=0&&v.whT<=0&&v.spd>8){v.whT=1.6+Math.random()*1.2;v.wh=4+Math.random()*4}
      if(v.whT>0)v.whT-=dt;const up=v.whT>0?Math.min(1,v.whT*3,(2.8-v.whT)*3):0;tl.rotation.x+=(-.55*Math.max(0,up)-tl.rotation.x)*Math.min(1,dt*6);tl.rotation.z=-Math.cos(T*1.7+v.ph)*.22*Math.min(1,v.spd/8);
      anim(v.rider,dt,{ride:true});const pd=Math.hypot(P.pos.x-v.g.position.x,P.pos.z-v.g.position.z);v.revT-=dt;if(v.revT<=0&&pd<40&&P.world==='out'){v.revT=1.4+Math.random()*1.6;snd.rev(1-pd/40)}
      if(v.whT>1.2&&pd<26&&!v.said){v.said=true;ctx.bubble({c:v.g,name:'Stunt rider'},['Oye hoye!','Full send, bhai!','Reel ke liye!','Views aayenge!'][Math.floor(Math.random()*4)])}if(v.whT<=0)v.said=false;
      if(chk&&Math.hypot(chk.x-v.p.x,chk.z-v.p.z)<20){chk.whT-=dt;if(chk.whT<=0){chk.whT=6;if(Math.hypot(P.pos.x-chk.x,P.pos.z-chk.z)<45){snd.whistle();ctx.bubble(chk.stopper,'Oye! Ruko! Helmet?')}}}}}
  let W={};
  function tick(dt,T,w){if(!root)return;W=w;for(const v of V)vehTick(v,dt,T);if(chk){const on=Math.sin(T*9)>0;chk.lr.material.color.set(on?'#ff2d2d':'#4a0b0b');chk.lb.material.color.set(on?'#16306b':'#2d6bff')}}
  return{reset,tick,get V(){return V},get chk(){return chk}}}

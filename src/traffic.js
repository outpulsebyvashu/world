import {THREE,G,Batch,bx,cyl,makeChar,anim} from './core.js';
import {npc} from './world.js';
import {roadGraph} from './roads.js';
import {toChar,randomLook} from './look.js';
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

export function makeTraffic(ctx){const {P,snd}=ctx;let root=null,TD=null,net=null,town='',V=[],walkers=[],chk=null,mobile=false,LANE=2,stop=null,pFine=0;
  const DIM={bus:[5.2,1.25],auto:[1.3,.66],stunt:[.95,.32]};
  const onRoad=(x,z)=>TD.roads.some(r=>x>r[0]+.2&&x<r[1]-.2&&z>r[2]+.2&&z<r[3]-.2)||(!!TD.round&&(d=>d<TD.round.r1&&d>TD.round.r0)(Math.hypot(x-TD.round.x,z-TD.round.z)));
  /* signal phases at Signal Chowk: north-south green 0-6.5s, amber to 8s; east-west green 8-14.5s, amber to 16s */
  const light=(axis,T)=>{const t=T%16;return axis==='ns'?(t<6.5?'g':t<8?'a':'r'):(t>=8&&t<14.5?'g':t>=14.5?'a':'r')};
  function carComing(x,z){for(const v of V){const rx=x-v.p.x,rz=z-v.p.z,d=Math.hypot(rx,rz);if(d<6&&v.spd>.5)return true;if(d>20||v.spd<1.5)continue;const hx=Math.sin(v.g.rotation.y),hz=Math.cos(v.g.rotation.y);if((rx*hx+rz*hz)/d>.35)return true}
    const tp=ctx.fire&&ctx.fire.truckPos();return!!tp&&Math.hypot(tp.x-x,tp.z-z)<24}
  function newRoute(v){let tx,tz;const pool=net.hubs.length>2?net.hubs:net.N;if(v.kind==='bus'&&stop&&!v.fromStop){tx=stop.x;tz=stop.z}else if(v.kind==='bus'){const n=pool[Math.floor(Math.random()*pool.length)];tx=n.x;tz=n.z}else{const q=net.randomPoint();tx=q.x;tz=q.z}
    if(Math.hypot(tx-v.p.x,tz-v.p.z)<Math.min(40,net.L*.35))return false;const p=net.route(v.p.x,v.p.z,tx,tz,Math.sin(v.g.rotation.y),Math.cos(v.g.rotation.y));if(p.length<2)return false;v.path=net.lane(p,LANE);v.i=1;v.toStop=v.kind==='bus'&&stop&&!v.fromStop;return true}
  function addVeh(kind,model,max){const [hl,hw]=DIM[kind];const v={kind,g:model,p:new THREE.Vector3(),max,spd:0,hl,hw,path:[],i:1,wait:0,ph:Math.random()*20,ghost:0,vb:0,blockT:0,hornT:0,revT:Math.random()*3,wh:3+Math.random()*4,whT:0,edge:0,pulled:0,fineCD:0,fromStop:Math.random()<.5};
    const n=net.N[Math.floor(Math.random()*net.N.length)];v.p.set(n.x,0,n.z);for(let k=0;k<8&&!newRoute(v);k++){const m=net.N[Math.floor(Math.random()*net.N.length)];v.p.set(m.x,0,m.z)}
    if(v.path.length>1){const i=1+Math.floor(Math.random()*(v.path.length-1));const a=v.path[i-1],b=v.path[i],u=Math.random();v.p.set(a.x+(b.x-a.x)*u,0,a.z+(b.z-a.z)*u);v.i=i;model.rotation.y=Math.atan2(b.x-a.x,b.z-a.z)}
    model.position.copy(v.p);root.add(model);V.push(v);return v}
  function reset(r,td,id){root=r;TD=td;town=id;V=[];walkers=[];chk=null;net=roadGraph(td);LANE=net.W/4;mobile=matchMedia('(pointer:coarse)').matches;
    stop=td.bus?(q=>({x:q.x,z:q.z}))(net.project(td.bus.x,td.bus.z)):null;stand=null;riders=[];
    if(td.busStand){stand={bays:[...Array(11)].map((_,i)=>({i,x:-160.4+(i+.5)*6.08,busy:[0,5,9].includes(i)})),vT:2,c:{x:-127,z:150}};stop={x:-87.9,z:119.5}}
    const tc=td.color||'#d7263d';
    /* traffic scales with the road network: small towns get an auto and a rider, the big ones buses too */
    const big=net.L>300,nAuto=Math.max(1,Math.min(mobile?4:5,Math.round(net.L/180)));
    if(big)for(let i=0;i<2;i++)addVeh('bus',busModel(i?'#1d6fb8':tc),10);
    const autoBody=['#1f7a3a','#1b1b1b','#1f7a3a','#1b1b1b','#1f7a3a'];for(let i=0;i<nAuto;i++)addVeh('auto',autoModel(autoBody[i]),12);
    const looks=[{shirt:'#ff2d95',pants:'#1b1b1b',hair:'curly',hairC:'#d9b44a'},{shirt:'#00e5ff',pants:'#3a4a6b',hair:'curly',hairC:'#ff6a3d'}];
    for(let i=0;i<(big?2:1);i++){const g=bikeModel(i?'#ff2d95':'#00c853');const rd=makeChar(Object.assign({seed:400+i},looks[i]));rd.position.set(0,.48-.34,-.15+.72);rd.scale.setScalar(.92);g.userData.tilt.add(rd);
      const v=addVeh('stunt',g,17);v.rider=rd;v.c=g}
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
    const si=npc(root,{name:'SI Deshmukh',x:o2.x,z:o2.z,yaw:Math.atan2(rp.x-o2.x,rp.z-o2.z),look:Object.assign({},KH,{shirt:'#bfa679'}),emote:'talk',lines:['PUC expired eight months ago. Fine is on the way.','Do not argue with me, argue with the challan machine.','Next time, keep the papers in the dicky, not at home.'],barks:['Licence?','PUC kab ka hai?','Challan banega.']});
    npc(root,{name:'Caught Rider',x:rp.x,z:rp.z,yaw:Math.atan2(o2.x-rp.x,o2.z-rp.z),look:{shirt:'#ff6a3d',pants:'#1b1b1b',hair:'curly'},emote:'talk',lines:['Sir, licence ghar pe hai, I swear.','My cousin is in the police, sir. Very senior. Very.','Okay okay, how much is the fine?'],barks:['Sir, ek baar maaf kar do!','Ghar pe bhool gaya, sir.']});
    chk={x:(o1.x+jp.x)/2,z:(o1.z+jp.z)/2,lr,lb,stopper,si,whT:0}}
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
    const dx=t.x-c.position.x,dz=t.z-c.position.z,d=Math.hypot(dx,dz);if(d<.4){w.i++;w.cross=false;return w.sp}
    /* rule: look both ways, cross only when nothing is coming */
    if(!w.cross){const mx=(c.position.x+t.x)/2,mz=(c.position.z+t.z)/2;if(onRoad(mx,mz)||onRoad(t.x,t.z)){if(carComing(mx,mz)){let a=Math.atan2(dx,dz)-c.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));c.rotation.y+=a*Math.min(1,dt*6);return 0}w.cross=true}}
    const st=Math.min(d,w.sp*dt);c.position.x+=dx/d*st;c.position.z+=dz/d*st;let a=Math.atan2(dx,dz)-c.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));c.rotation.y+=a*Math.min(1,dt*8);return w.sp}
  /* ---- vehicles: the rules of the road ---- */
  let W={},peds=[];
  function vehTick(v,dt,T){v.fineCD-=dt;if(v.ghost>0)v.ghost-=dt;
    if(v.pulled>0){v.pulled-=dt;v.spd=Math.max(0,v.spd-dt*8);v.edge+=(2-v.edge)*Math.min(1,dt*2);if(v.pulled<=0)v.fineCD=45;return}
    if(v.wait>0){v.wait-=dt;v.spd=0;return}
    const t=v.path[v.i];if(!t){if(v.mode){standNext(v,T);return}if(v.toStop&&stand){standIn(v);return}if(v.toStop){v.wait=6;v.fromStop=true}else{v.fromStop=false;v.wait=v.kind==='bus'?2:.3}v.path=[];if(!newRoute(v)){v.path=[];v.wait=1}return}
    const dx=t.x-v.p.x,dz=t.z-v.p.z,d=Math.hypot(dx,dz);if(d<.7){v.i++;return}
    const hx=v.reverse?dx/d:Math.sin(v.g.rotation.y),hz=v.reverse?dz/d:Math.cos(v.g.rotation.y),prev=v.path[v.i-1];v.onRing=!!(t.ring&&prev&&prev.ring);
    let want=v.max,byVeh=false,byPlayer=false;
    if(!v.reverse){let a=Math.atan2(dx,dz)-v.g.rotation.y;a=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));if(a>1.4){v.g.rotation.y+=Math.sign(Math.atan2(Math.sin(Math.atan2(dx,dz)-v.g.rotation.y),Math.cos(Math.atan2(dx,dz)-v.g.rotation.y)))*dt*1.6;v.spd=Math.min(v.spd,1.2);want=1.2}}
    /* slow for corners and the roundabout */
    const nx=v.path[v.i+1];if(nx&&d<12){const a1=Math.atan2(dx,dz),a2=Math.atan2(nx.x-t.x,nx.z-t.z);if(Math.abs(Math.atan2(Math.sin(a2-a1),Math.cos(a2-a1)))>.45)want=Math.min(want,v.kind==='stunt'?9:5.5)}
    if(t.ring)want=Math.min(want,v.kind==='stunt'?10:7);
    /* give way to traffic already on the roundabout */
    if(t.ring&&!(prev&&prev.ring)&&d<v.hl+6){for(const o of V)if(o!==v&&o.onRing&&o.spd>1&&Math.hypot(o.p.x-t.x,o.p.z-t.z)<13){want=0;break}}
    /* keep a safe gap to the vehicle in front */
    /* a crossing vehicle counts by its length, so junctions are kept clear; if two wait on each other, the earlier one goes */
    v.waitOn=null;if(v.ghost<=0)for(const o of V){if(o===v)continue;const rx=o.p.x-v.p.x,rz=o.p.z-v.p.z,al=rx*hx+rz*hz;if(al<=0)continue;
      const cr=Math.abs(Math.sin(o.g.rotation.y-v.g.rotation.y)),ext=o.hw+(o.hl-o.hw)*cr,lat=Math.abs(rx*hz-rz*hx);if(lat>v.hw+ext+.4)continue;
      const gap=al-v.hl-(o.hl+(o.hw-o.hl)*cr);if(gap<3+v.spd*.9){if(o.waitOn===v&&V.indexOf(v)<V.indexOf(o))continue;want=Math.min(want,Math.max(0,(gap-1.5)*1.1));v.waitOn=o;if(gap<3)byVeh=true}}
    /* never drive into people: the player and anyone crossing */
    for(const q of peds){const rx=q.x-v.p.x,rz=q.z-v.p.z,al=rx*hx+rz*hz,lat=Math.abs(rx*hz-rz*hx);if(al>-v.hl&&al<v.hl+3+v.spd*.7&&lat<v.hw+.9){want=0;if(q.player)byPlayer=true}}
    /* stop at a zebra crossing when someone is on it or waiting at it */
    if(!v.mode)for(const zb of G.zebras){const rx=zb.x-v.p.x,rz=zb.z-v.p.z,al=rx*hx+rz*hz;if(al<v.hl||al>v.hl+15||Math.abs(rx*hz-rz*hx)>zb.hw+1)continue;
      const busy=peds.some(q=>zb.alongX?(Math.abs(q.z-zb.z)<zb.sw/2+1.6&&Math.abs(q.x-zb.x)<zb.hw+2.5):(Math.abs(q.x-zb.x)<zb.sw/2+1.6&&Math.abs(q.z-zb.z)<zb.hw+2.5));
      if(busy)want=Math.min(want,Math.max(0,(al-v.hl-zb.sw/2-1.2)*1.2))}
    /* traffic lights at Signal Chowk: stop at the line on red, on amber if there is room to stop */
    if(v.mode)want=Math.min(want,v.reverse?2:5);
    if(W.signals&&town==='vashupur'&&!v.mode){const al=-v.p.x*hx-v.p.z*hz,lat=Math.abs(-v.p.x*hz+v.p.z*hx),front=al-v.hl,SL=12;
      if(front>SL-.5&&front<SL+30&&lat<9){const st=light(Math.abs(hz)>Math.abs(hx)?'ns':'ew',T);if(st==='r'||(st==='a'&&front-SL>v.spd*.9))want=Math.min(want,Math.max(0,(front-SL)*1.3))}}
    /* slow through the police checkpoint */
    if(chk&&Math.hypot(chk.x-v.p.x,chk.z-v.p.z)<16)want=Math.min(want,4.5);
    /* pull over for the fire truck */
    const tp=ctx.fire&&ctx.fire.truckPos();if(tp&&Math.hypot(tp.x-v.p.x,tp.z-v.p.z)<28){want=Math.min(want,2);v.edge+=(1.6-v.edge)*Math.min(1,dt*2)}else if(!v.pulled)v.edge+=(0-v.edge)*Math.min(1,dt*1.5);
    /* police: stunt riders get waved down at the checkpoint */
    if(v.kind==='stunt'&&chk&&v.fineCD<=0){const rx=chk.x-v.p.x,rz=chk.z-v.p.z,dd=Math.hypot(rx,rz);if(dd<12&&(rx*hx+rz*hz)>0){const near=Math.hypot(P.pos.x-chk.x,P.pos.z-chk.z)<45;
      if(Math.random()<.6){v.pulled=9;v.whT=0;if(near){snd.whistle();ctx.bubble(chk.stopper,'Ruko! Side mein lagao!');setTimeout(()=>ctx.bubble(chk.si,'Challan, ₹1,000. Helmet pehno.'),2200)}}
      else{v.fineCD=25;if(near){snd.whistle();ctx.bubble(chk.stopper,'Oye! Ruko!')}}}}
    /* deadlock breaker: if two vehicles wait on each other for too long, one creeps past */
    /* only a real deadlock (a ring of vehicles waiting on each other) lets one creep through; an ordinary queue just waits */
    let cyc=false;for(let o=v.waitOn,k=0;o&&k<5;o=o.waitOn,k++)if(o===v){cyc=true;break}
    if(byVeh&&want<.5&&cyc){v.vb+=dt;if(v.vb>3){v.ghost=2;v.vb=0}}else v.vb=0;
    /* honk if the player stands in the way */
    if(byPlayer){v.blockT+=dt;v.hornT-=dt;if(v.blockT>.8&&v.hornT<=0&&v.kind!=='stunt'){v.hornT=2.5+Math.random()*2;const pd=Math.hypot(P.pos.x-v.p.x,P.pos.z-v.p.z);snd.horn(Math.max(.2,1-pd/25),v.kind==='bus'?1:0)}}else v.blockT=0;
    v.spd+=(want-v.spd)*Math.min(1,dt*(want<v.spd?3.5:1.1));if(want===0&&v.spd<.6)v.spd=0;
    const st=Math.min(d,v.spd*dt);v.p.x+=dx/d*st;v.p.z+=dz/d*st;
    let a=Math.atan2(dx,dz)+(v.reverse?Math.PI:0)-v.g.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));v.g.rotation.y+=a*Math.min(1,dt*(v.kind==='bus'?(v.mode?1.6:3):5))}
  function place(v,dt,T){const y=v.g.rotation.y,lx=Math.cos(y),lz=-Math.sin(y);let off=v.edge;
    if(v.kind==='stunt'&&!v.pulled){off+=Math.sin(T*1.7+v.ph)*Math.min(1.1,LANE-.7)*Math.min(1,v.spd/6)}
    v.g.position.set(v.p.x+lx*off,0,v.p.z+lz*off);
    if(v.kind==='stunt'){const tl=v.g.userData.tilt;v.wh-=dt;if(v.wh<=0&&v.whT<=0&&v.spd>8&&!v.pulled){v.whT=1.6+Math.random()*1.2;v.wh=4+Math.random()*4}
      if(v.whT>0)v.whT-=dt;const up=v.whT>0?Math.min(1,v.whT*3,(2.8-v.whT)*3):0;tl.rotation.x+=(-.55*Math.max(0,up)-tl.rotation.x)*Math.min(1,dt*6);tl.rotation.z=v.pulled>0?0:-Math.cos(T*1.7+v.ph)*.22*Math.min(1,v.spd/8);
      anim(v.rider,dt,{ride:true});const pd=Math.hypot(P.pos.x-v.g.position.x,P.pos.z-v.g.position.z);v.revT-=dt;if(v.revT<=0&&pd<40&&P.world==='out'&&!v.pulled){v.revT=1.4+Math.random()*1.6;snd.rev(1-pd/40)}
      if(v.whT>1.2&&pd<26&&!v.said){v.said=true;ctx.bubble({c:v.g,name:'Stunt rider'},['Oye hoye!','Full send, bhai!','Reel ke liye!','Views aayenge!'][Math.floor(Math.random()*4)])}if(v.whT<=0)v.said=false}}
  /* solid vehicles: the player is pushed out instead of passing through */
  function pushPlayer(v){if(P.world!=='out'||P.pos.y>3.4)return;const y=v.g.rotation.y,hx=Math.sin(y),hz=Math.cos(y),rx=P.pos.x-v.g.position.x,rz=P.pos.z-v.g.position.z;
    const al=rx*hx+rz*hz,lt=rx*hz-rz*hx,ea=v.hl+.35-Math.abs(al),el=v.hw+.35-Math.abs(lt);if(ea<=0||el<=0)return;
    if(el<ea){const s=Math.sign(lt)||1;P.pos.x+=hz*s*el;P.pos.z-=hx*s*el}else{const s=Math.sign(al)||1;P.pos.x+=hx*s*ea;P.pos.z+=hz*s*ea}}
  /* ---- Vashupur bus stand: drive in, park nose-in at a free bay, the conductor boards passengers,
     reverse out honking, leave by the other arm ---- */
  let stand=null,riders=[];
  const CONDUCTOR={shirt:'#c9b48a',pants:'#3a4a6b',hair:'short',hat:'#2f5bff',mustache:true,face:'grin'};
  function standIn(v){const free=stand.bays.filter(b=>!b.busy);if(!free.length){v.wait=4;v.toStop=false;v.fromStop=true;return}
    const b=free[Math.floor(Math.random()*free.length)];b.busy=true;v.bay=b;v.toStop=false;v.mode='in';v.i=0;
    v.path=[{x:-87.9,z:126.5},{x:-87.9,z:148},{x:-88.6,z:165},{x:-92.5,z:169.3},{x:b.x+7,z:169.3},{x:b.x+2,z:166.5},{x:b.x,z:162.5},{x:b.x,z:159}]}
  function standNext(v,T){const b=v.bay;
    if(v.mode==='in'){v.mode='board';v.wait=9+Math.random()*4;v.path=[];board(v);return}
    if(v.mode==='board'){v.mode='rev';v.reverse=true;v.i=0;v.path=[{x:b.x,z:166.4}];endBoard(v);honk(v);return}
    if(v.mode==='rev'){v.reverse=false;b.busy=false;v.bay=null;v.mode='leave';v.i=0;v.path=[{x:b.x-6,z:169.3},{x:-161.5,z:169.3},{x:-165.6,z:165},{x:-165.9,z:148},{x:-165.9,z:126.5}];return}
    if(v.mode==='leave'){v.mode=null;v.fromStop=true;v.path=[];if(!newRoute(v))v.wait=1}}
  function honk(v){const k=standNear(),d=Math.hypot(P.pos.x-v.p.x,P.pos.z-v.p.z);if(k>0)snd.sample(Math.random()<.5?'sfx/horn1.mp3':'sfx/horn2.mp3',k*Math.max(.3,1-d/90)*.8,pan(v.p.x,v.p.z))}
  function pan(x,z){const c=ctx.camera;if(!c)return 0;const dx=x-c.position.x,dz=z-c.position.z,d=Math.hypot(dx,dz)||1;const rx=Math.cos(-c.rotation.y),rz=Math.sin(-c.rotation.y);return Math.max(-.8,Math.min(.8,(dx*rx+dz*rz)/d))}
  /* passengers walk from the concourse to the door; the conductor waves them in */
  function board(v){const b=v.bay,door={x:b.x-1.7,z:155.2};const cd=makeChar(Object.assign({seed:77},CONDUCTOR));cd.position.set(b.x-2.3,0,154.2);cd.rotation.y=Math.PI*.75;root.add(cd);v.cond=cd;
    if(Math.hypot(P.pos.x-b.x,P.pos.z-155)<45)ctx.bubble({c:cd,name:'Conductor'},['Chalo chalo! Baitho!','Kaapikunj, Memepura! Jaldi!','Aage badho, aage!'][Math.floor(Math.random()*3)]);
    const n=3+Math.floor(Math.random()*3);for(let k=0;k<n;k++){const c=makeChar(toChar(randomLook(),k+1));const sx=Math.max(-160,Math.min(-94,b.x+(Math.random()-.5)*16));c.position.set(sx,0,143.5+Math.random()*5);root.add(c);riders.push({c,to:door,sp:1.5+Math.random()*.6,delay:k*.9+Math.random()*.6,v})}}
  function endBoard(v){if(v.cond){root.remove(v.cond);v.cond=null}riders=riders.filter(r=>{if(r.v===v){root.remove(r.c);return false}return true})}
  function standTick(dt,T){for(const v of V)if(v.cond)anim(v.cond,dt,{emote:'wave'});
    riders=riders.filter(r=>{if(r.delay>0){r.delay-=dt;anim(r.c,dt,{});return true}const c=r.c,dx=r.to.x-c.position.x,dz=r.to.z-c.position.z,d=Math.hypot(dx,dz);
      if(d<.35){root.remove(c);return false}const st=Math.min(d,r.sp*dt);c.position.x+=dx/d*st;c.position.z+=dz/d*st;c.rotation.y=Math.atan2(dx,dz);anim(c,dt,{speed:r.sp});return true});
    /* the stand is loud: crowd underneath, vendors calling out at random */
    /* only inside the stand (fades out within a few metres of its edge) */
    const near=standNear();snd.bed('sfx/crowd.mp3',near*.55);
    stand.vT-=dt;if(stand.vT<=0){stand.vT=2.2+Math.random()*4;if(near>0){const vend=[[-141,134.6,[1,2,3]],[-111,134.6,[4,5,6]],[-152,141,[1,2,3,4,5,6]]][Math.floor(Math.random()*3)];
      const k=vend[2][Math.floor(Math.random()*vend[2].length)],dv=Math.hypot(P.pos.x-vend[0],P.pos.z-vend[1]);snd.sample('sfx/vendor'+k+'.mp3',near*Math.max(.35,1-dv/90)*.75,pan(vend[0],vend[1]))}}}
  function standNear(){if(P.world!=='out')return 0;const x=P.pos.x,z=P.pos.z,o=Math.max(0,-169.6-x,x+84,130-z,z-174.4);return Math.max(0,Math.min(1,1-o/7))}
  function tick(dt,T,w){if(!root)return;W=w;if(stand)standTick(dt,T);
    peds=[];if(P.world==='out')peds.push({x:P.pos.x,z:P.pos.z,player:true});for(const n of G.npcs){if(!n.c||!n.c.visible||n.hidden||n.kind==='static')continue;const p=n.c.position;if(onRoad(p.x,p.z))peds.push({x:p.x,z:p.z})}
    for(const v of V)vehTick(v,dt,T);for(const v of V){place(v,dt,T);pushPlayer(v)}
    if(chk){const on=Math.sin(T*9)>0;chk.lr.material.color.set(on?'#ff2d2d':'#4a0b0b');chk.lb.material.color.set(on?'#16306b':'#2d6bff');
      /* rule for you too: no helmet on the scooter through the checkpoint means a challan */
      pFine-=dt;if(P.ride&&P.world==='out'&&pFine<=0&&Math.hypot(P.pos.x-chk.x,P.pos.z-chk.z)<10){pFine=40;snd.whistle();ctx.bubble(chk.stopper,'Ruko! Helmet kahaan hai?');ctx.toast&&ctx.toast('CHALLAN','₹1,000 for riding without a helmet. Paid in good karma.')}}}
  return{reset,tick,get V(){return V},get chk(){return chk}}}

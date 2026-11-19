import {THREE,G,Batch,bx,cyl} from './core.js';
import {roadGraph} from './roads.js';
/* Random fires: a building catches fire, people nearby run and scream,
   the fire truck drives out on the road network, sprays it out and goes home. */
const TRUCK_MAT=new THREE.MeshLambertMaterial({vertexColors:true});
function truckModel(){const g=new THREE.Group(),B=new Batch();
  bx(B,0,1.35,-.5,2.4,1.9,5.6,'#d32f2f');bx(B,0,1.55,2.75,2.4,2.3,1.7,'#d32f2f');bx(B,0,1.95,3.62,2.1,1,.05,'#26323d');
  bx(B,1.21,1.9,2.75,.04,.8,1.1,'#26323d');bx(B,-1.21,1.9,2.75,.04,.8,1.1,'#26323d');
  bx(B,0,1.05,-.2,2.44,.22,7.2,'#ffffff');bx(B,0,2.42,-.7,1.9,.12,5.2,'#c9ccd1');for(let i=0;i<7;i++)bx(B,0,2.62,-3.1+i*.85,1.5,.06,.1,'#c9ccd1');
  bx(B,0,.45,3.62,2.3,.35,.1,'#9e9e9e');cyl(B,.8,2.75,-2.9,.12,.12,.5,'#c9a227',8);
  for(const z of[2.5,-.9,-2.5])for(const s of[-1,1]){const w=new THREE.CylinderGeometry(.5,.5,.36,12);w.rotateZ(Math.PI/2);w.translate(s*1.1,.5,z);B.add(w,'#1d1d1d')}
  g.add(B.mesh(TRUCK_MAT));
  const lr=new THREE.Mesh(new THREE.BoxGeometry(.7,.2,.3),new THREE.MeshBasicMaterial({color:'#ff2d2d'})),lb=new THREE.Mesh(new THREE.BoxGeometry(.7,.2,.3),new THREE.MeshBasicMaterial({color:'#2d6bff'}));
  lr.position.set(-.45,2.82,3.2);lb.position.set(.45,2.82,3.2);g.add(lr,lb);g.userData.lr=lr;g.userData.lb=lb;
  g.traverse(o=>{if(o.isMesh){o.castShadow=true}});return g}

export function makeFire(ctx){
  const {camera,P,snd}=ctx;let root=null,TD=null,town='',net=null;
  const light=new THREE.PointLight('#ff7a2a',0,45,1.4);ctx.scene.add(light);
  const flameGeo=new THREE.ConeGeometry(1,1,6);flameGeo.translate(0,.5,0);
  const smokeGeo=new THREE.IcosahedronGeometry(1,1);
  let flames,smoke,water,truck,F=null,next=0,seenOnce=false,screamT=0,screams=0;
  const NF=30,NS=34,NW=70,m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sc=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0),col=new THREE.Color(),prj=new THREE.Vector3();
  function build(){flames=new THREE.InstancedMesh(flameGeo,new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false}),NF);
    for(let i=0;i<NF;i++)flames.setColorAt(i,col.set(['#ff3d00','#ff7a00','#ffb300','#ffd54f'][i%4]));flames.frustumCulled=false;flames.visible=false;
    smoke=new THREE.InstancedMesh(smokeGeo,new THREE.MeshLambertMaterial({color:'#3d3d3d',transparent:true,opacity:.62,depthWrite:false}),NS);smoke.frustumCulled=false;smoke.visible=false;
    const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NW*3),3));
    water=new THREE.Points(wg,new THREE.PointsMaterial({color:'#cfeeff',size:.42,transparent:true,opacity:.85,depthWrite:false}));water.frustumCulled=false;water.visible=false;
    truck=truckModel();truck.visible=false;root.add(flames,smoke,water,truck)}
  function reset(r,td,id){root=r;TD=td;town=id;F=null;light.intensity=0;net=roadGraph(td);build();next=55+Math.random()*40}
  /* the fire station bay in Vashupur; elsewhere the truck comes in from the edge of town */
  function depot(fx,fz){if(town==='vashupur')return{x:-62.5,z:142,out:{x:-62.5,z:131}};let b=net.ends[0],bd=-1;for(const e of net.ends){const d=Math.hypot(e.x-fx,e.z-fz);if(d>bd){bd=d;b=e}}return{x:b.x,z:b.z,out:null}}
  /* only buildings the truck can reach: front door within a short hose of a road */
  function pick(){const c=G.buildings.filter(b=>b.door&&!/fire|bus stand/i.test(b.name)&&(b.x1-b.x0)<90&&(b.z1-b.z0)<90&&net.project(b.door.x,b.door.z).d<22);if(!c.length)return null;
    const px=P.pos.x,pz=P.pos.z;const near=c.filter(b=>{const d=Math.hypot((b.x0+b.x1)/2-px,(b.z0+b.z1)/2-pz);return d>22&&d<120});const pool=near.length?near:c;return pool[Math.floor(Math.random()*pool.length)]}
  function start(b){b=b||pick();if(!b)return false;
    const d=b.door,cx=Math.max(b.x0+1,Math.min(b.x1-1,d.x)),cz=Math.max(b.z0+1,Math.min(b.z1-1,d.z));
    const alongX=Math.min(Math.abs(d.z-b.z0),Math.abs(d.z-b.z1))<Math.min(Math.abs(d.x-b.x0),Math.abs(d.x-b.x1));
    const span=Math.min(5,((alongX?b.x1-b.x0:b.z1-b.z0))/2-1);
    F={b,x:cx,z:cz,ax:alongX?1:0,az:alongX?0:1,span:Math.max(1.5,span),k:0,t:0,phase:'burn',water:0,seed:Math.random()*100,smoke:[]};
    for(let i=0;i<NS;i++)F.smoke.push(Math.random());
    const dp=depot(cx,cz),stop=net.project(d.x,d.z);
    let path=net.lane(net.route(dp.out?dp.out.x:dp.x,dp.out?dp.out.z:dp.z,stop.x,stop.z),net.W/4);
    const curb={x:stop.x+(d.x-stop.x)/(stop.d||1)*Math.min(stop.d,net.W*.3),z:stop.z+(d.z-stop.z)/(stop.d||1)*Math.min(stop.d,net.W*.3)};
    path=[{x:dp.x,z:dp.z},...(dp.out?[dp.out]:[]),...path,curb];
    F.truck={path,i:1,wait:3.5,home:false,spd:0};truck.position.set(dp.x,0,dp.z);truck.visible=false;
    flames.visible=smoke.visible=true;seenOnce=false;screams=0;screamT=0;
    for(const n of G.npcs){if(!n.c||n.kind==='cat')continue;const p=n.c.position;if(Math.hypot(p.x-cx,p.z-cz)<32)n.panic=7+Math.random()*4}
    ctx.toast('FIRE',`Smoke rising at ${b.short||b.name}. The fire brigade is on its way.`);if(town==='vashupur'&&ctx.W)ctx.W.fireT=8;return true}
  function end(){F=null;flames.visible=smoke.visible=water.visible=false;truck.visible=false;light.intensity=0;snd.siren(0);next=110+Math.random()*90}
  function driveTruck(dt,T){const tr=F.truck,path=tr.path;if(tr.wait>0){tr.wait-=dt;return}truck.visible=true;
    if(tr.i>=path.length){if(!tr.home){F.phase=F.phase==='burn'?'spray':F.phase}else end();return}
    const tgt=path[tr.i],dx=tgt.x-truck.position.x,dz=tgt.z-truck.position.z,d=Math.hypot(dx,dz);
    const want=tr.i>=path.length-1?Math.min(14,d*1.4+2):14;tr.spd+=(want-tr.spd)*Math.min(1,dt*1.6);
    if(d<.6){tr.i++;return}const st=Math.min(d,tr.spd*dt);truck.position.x+=dx/d*st;truck.position.z+=dz/d*st;
    let a=Math.atan2(dx,dz)-truck.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));truck.rotation.y+=a*Math.min(1,dt*5)}
  function tick(dt,T){if(!root)return;
    if(!F){next-=dt;if(next<=0&&P.world==='out'){if(!start())next=60}return}
    F.t+=dt;const flash=Math.sin(T*14)>0;truck.userData.lr.material.color.set(flash?'#ff2d2d':'#4a0b0b');truck.userData.lb.material.color.set(flash?'#16306b':'#2d6bff');
    driveTruck(dt,T);if(!F)return;
    if(F.phase==='burn')F.k=Math.min(1,F.k+dt/4);
    if(F.phase==='spray'){F.water=Math.min(1,F.water+dt*2);F.k-=dt/9;if(F.k<=0){F.k=0;F.phase='out';F.outT=6;ctx.toast('FIRE OUT',`The fire brigade saved ${F.b.short||F.b.name}.`);
      const tr=F.truck;tr.path=tr.path.slice().reverse();tr.i=1;tr.home=true;tr.wait=2;tr.spd=0}}
    if(F.phase==='out'){F.water=Math.max(0,F.water-dt*2);F.outT-=dt}
    if(F.t>150&&F.phase==='burn'){F.phase='spray'}
    /* flames */
    const k=Math.max(0,F.k);for(let i=0;i<NF;i++){const u=(i/(NF-1))*2-1,hi=i%3===0;const fl=.75+.35*Math.sin(T*(9+i%5)+i*1.7)+.15*Math.sin(T*23+i);
      v.set(F.x+F.ax*u*F.span+(i%2?.3:-.3)*F.az,hi?2.6+(i%4)*.9:0,F.z+F.az*u*F.span+(i%2?.3:-.3)*F.ax);
      if(hi)v.y=2.4+((i*7)%5)*1.5;const s=k*(hi?1.25:1.85)*(.7+.3*Math.abs(Math.sin(i*2.3)));sc.set(s*.8,s*fl*(hi?2.1:2.9),s*.8);q.setFromAxisAngle(Y,i+T*.5);m4.compose(v,q,sc);flames.setMatrixAt(i,m4)}
    flames.instanceMatrix.needsUpdate=true;flames.visible=k>0;
    /* smoke column */
    const sk=F.phase==='out'?Math.max(0,F.outT/6)*.5:Math.max(.25,k);
    for(let i=0;i<NS;i++){F.smoke[i]+=dt/(5.5+(i%5));if(F.smoke[i]>1)F.smoke[i]-=1;const a=F.smoke[i];
      v.set(F.x+Math.sin(i*1.9+a*3)*1.2+a*6,3+a*28,F.z+Math.cos(i*2.7)*1.2+a*3.5);const s=(1+a*4.2)*(1-a*.35)*sk;sc.set(s,s*.85,s);q.identity();m4.compose(v,q,sc);smoke.setMatrixAt(i,m4)}
    smoke.instanceMatrix.needsUpdate=true;smoke.visible=sk>0.01;
    light.position.set(F.x+F.az*2,3.5,F.z+F.ax*2);light.intensity=k*(26+8*Math.sin(T*17));
    /* water jet from the truck to the fire */
    water.visible=F.water>0;if(water.visible){const a=water.geometry.attributes.position.array,ox=truck.position.x,oz=truck.position.z,ty=3.4+k*1.5;
      for(let i=0;i<NW;i++){const u=((T*1.3+i/NW)%1);const x=ox+(F.x-ox)*u,z=oz+(F.z-oz)*u,y=2.9+(ty-2.9)*u+Math.sin(u*Math.PI)*5;a[i*3]=x+Math.sin(i*7.1+T*9)*.15*u;a[i*3+1]=y;a[i*3+2]=z+Math.cos(i*5.3+T*9)*.15*u}
      water.geometry.attributes.position.needsUpdate=true}
    /* siren while driving, louder when close */
    const td=Math.hypot(truck.position.x-P.pos.x,truck.position.z-P.pos.z),moving=truck.visible&&F.truck.spd>1&&F.truck.wait<=0;
    snd.siren(moving&&P.world==='out'?Math.max(0,1-td/140):0);
    /* people see it: the scream plays when it is on screen and close enough */
    if(P.world==='out'&&k>.25){const dc=Math.hypot(F.x-camera.position.x,F.z-camera.position.z);prj.set(F.x,3,F.z).project(camera);
      const onScreen=prj.z<1&&Math.abs(prj.x)<1.05&&Math.abs(prj.y)<1.1;screamT-=dt;
      if(onScreen&&dc<90&&screamT<=0&&screams<5){snd.sample('sfx/fire.mp3',Math.max(.25,1-dc/100));screamT=seenOnce?8+Math.random()*5:9;screams++;
        if(!seenOnce){seenOnce=true;ctx.bubbleNear(F.x,F.z,['Aag! Aag!','Call 101!','Bhaago!','Paani lao!'])}}}}
  /* where the truck is while it is out on a call (other traffic pulls over) */
  function truckPos(){return F&&truck.visible&&F.truck.spd>1?truck.position:null}
  return{reset,tick,truckPos,start:()=>{if(F)end();return start()},get active(){return F},depot}}

import {THREE,G} from './core.js';
/* Move (and turn in 90° steps) everything a block of building code created: merged geometry,
   scene objects, colliders, triggers, seats, footprints, door/out points. */
const KEYS=['colliders','triggers','buildings','blocked','noGrass','seats','camCols','extraNPCs','chairs'];
export function mark(scene,batches){const a={};for(const k of KEYS)a[k]=(G[k]||[]).length;return{scene,n:scene.children.length,b:batches.filter(Boolean).map(B=>[B,B.g.length]),a}}
export function move(cp,p0,p1,q=0,outs=[]){q=((q%4)+4)%4;const th=q*Math.PI/2,c=Math.round(Math.cos(th)),s=Math.round(Math.sin(th));
  const tp=(x,z)=>{const dx=x-p0[0],dz=z-p0[1];return[p1[0]+dx*c+dz*s,p1[1]-dx*s+dz*c]};
  const tv=(fx,fz)=>[fx*c+fz*s,-fx*s+fz*c];
  const tb=(x0,x1,z0,z1)=>{const a=tp(x0,z0),b=tp(x1,z1);return[Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]};
  const m=new THREE.Matrix4().makeTranslation(p1[0],0,p1[1]).multiply(new THREE.Matrix4().makeRotationY(th)).multiply(new THREE.Matrix4().makeTranslation(-p0[0],0,-p0[1]));
  for(const [B,n] of cp.b)for(let i=n;i<B.g.length;i++)B.g[i].applyMatrix4(m);
  const qy=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),th);
  const ch=cp.scene.children;for(let i=cp.n;i<ch.length;i++){const o=ch[i];const [x,z]=tp(o.position.x,o.position.z);o.position.x=x;o.position.z=z;if(q)o.quaternion.premultiply(qy)}
  const seen=new Set();const pt=o=>{if(!o||seen.has(o))return;seen.add(o);if(o.x!=null&&o.z!=null){const [x,z]=tp(o.x,o.z);o.x=x;o.z=z}if(o.fx!=null){const [a,b]=tv(o.fx,o.fz||0);o.fx=Math.round(a);o.fz=Math.round(b)}};
  const A=k=>(G[k]||[]).slice(cp.a[k]);
  for(const o of A('colliders')){const r=tb(o.x0,o.x1,o.z0,o.z1);o.x0=r[0];o.x1=r[1];o.z0=r[2];o.z1=r[3]}
  for(const o of A('camCols')){const r=tb(o.x0,o.x1,o.z0,o.z1);o.x0=r[0];o.x1=r[1];o.z0=r[2];o.z1=r[3]}
  for(const k of['blocked','noGrass']){const arr=G[k]||[];for(let i=cp.a[k];i<arr.length;i++)arr[i]=tb(arr[i][0],arr[i][1],arr[i][2],arr[i][3])}
  for(const o of A('triggers'))pt(o);
  for(const o of A('chairs'))pt(o);
  for(const o of A('seats')){pt(o);if(o.yaw!=null)o.yaw+=th}
  for(const o of A('extraNPCs')){pt(o);o.yaw=(o.yaw||0)+th}
  for(const o of A('buildings')){const r=tb(o.x0,o.x1,o.z0,o.z1);o.x0=r[0];o.x1=r[1];o.z0=r[2];o.z1=r[3];pt(o.door)}
  for(const o of outs)pt(o)}

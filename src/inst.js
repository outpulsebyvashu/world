import {THREE,rng} from './core.js';
/* Instanced props: thousands of tree parts become a handful of draw calls and no per-tree geometry. */
const R=rng(99);
const jitter=(seed)=>{const r=rng(seed),g=new THREE.IcosahedronGeometry(1,1);const p=g.attributes.position;for(let k=0;k<p.count;k++){const f=.82+r()*.3;p.setXYZ(k,p.getX(k)*f,p.getY(k)*f,p.getZ(k)*f)}g.computeVertexNormals();return g};
const MAKE={trunk:()=>new THREE.CylinderGeometry(.13,.24,2.4,7),crown0:()=>jitter(1),crown1:()=>jitter(2),crown2:()=>jitter(3),
  pTrunk:()=>new THREE.CylinderGeometry(.18,.25,1.4,6),pCone:()=>new THREE.ConeGeometry(1,1.5,7)};
export const INST={};
export function inst(key,x,y,z,sx,sy,sz,ry,col){(INST[key]||(INST[key]=[])).push([x,y,z,sx,sy,sz,ry||0,col])}
export function instMark(){const m={};for(const k in INST)m[k]=INST[k].length;return m}
export function instMove(m,tp,th){for(const k in INST){for(let i=m[k]||0;i<INST[k].length;i++){const it=INST[k][i];const [x,z]=tp(it[0],it[2]);it[0]=x;it[2]=z;it[6]+=th}}}
export function flushInst(scene){const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3(),S=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0),C=new THREE.Color();
  for(const k in INST){const items=INST[k];if(!items.length){delete INST[k];continue}const g=MAKE[k]();const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:'#ffffff'}),items.length);
    items.forEach((it,i)=>{P.set(it[0],it[1],it[2]);Q.setFromAxisAngle(Y,it[6]);S.set(it[3],it[4],it[5]);M.compose(P,Q,S);m.setMatrixAt(i,M);m.setColorAt(i,C.set(it[7]))});
    m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.castShadow=true;m.receiveShadow=true;scene.add(m);delete INST[k]}}

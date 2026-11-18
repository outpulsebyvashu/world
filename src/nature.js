import {THREE,G,rng,tex} from './core.js';
import {Sky} from 'three/examples/jsm/objects/Sky.js';

const NOISE=`
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm2(vec2 p){return .55*vnoise(p)+.3*vnoise(p*2.07+3.1)+.15*vnoise(p*4.13+7.7);}
`;
export const MASK={x0:-100,z0:-56,w:200,h:150};

/* ---------- top-down mask: where grass may grow (white) ---------- */
export function makeMask(roads,b){if(b){MASK.x0=b[0]-40;MASK.z0=b[2]-40;MASK.w=b[1]-b[0]+80;MASK.h=b[3]-b[2]+80}const S=3,c=document.createElement('canvas');c.width=MASK.w*S;c.height=MASK.h*S;const x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
  const R=(x0,x1,z0,z1,col='#000')=>{x.fillStyle=col;x.fillRect((x0-MASK.x0)*S,(z0-MASK.z0)*S,(x1-x0)*S,(z1-z0)*S)};
  for(const r of roads)R(r[0],r[1],r[2],r[3]);
  for(const b of G.buildings)R(b.x0-1.6,b.x1+1.6,b.z0-1.6,b.z1+1.6);
  if(G.TOWN==='memepura'){x.fillStyle='#000';x.beginPath();x.arc((64-MASK.x0)*S,(64-MASK.z0)*S,19.2*S,0,7);x.fill();R(20,44,26,44,'#5a5a5a')}
  for(const r of(G.noGrass||[]))R(r[0],r[1],r[2],r[3]);
  const blur=document.createElement('canvas');blur.width=c.width;blur.height=c.height;const bx=blur.getContext('2d');bx.filter='blur(3px)';bx.drawImage(c,0,0);
  const t=new THREE.CanvasTexture(blur);t.flipY=false;t.colorSpace=THREE.NoColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;return t}

/* ---------- realistic ground ---------- */
export function groundMaterial(snow){const t=tex(512,512,(x,W,H)=>{const r=rng(11);x.fillStyle=snow?'#e9eff3':'#4d6f34';x.fillRect(0,0,W,H);
    for(let i=0;i<9000;i++){const px=r()*W,py=r()*H,s=1+r()*2.5;const k=r();x.fillStyle=snow?(k<.5?'rgba(200,214,226,.5)':'rgba(255,255,255,.7)'):k<.45?'rgba(40,66,28,.55)':k<.8?'rgba(108,140,62,.45)':'rgba(120,98,60,.35)';x.fillRect(px,py,s,s*(1+r()*3))}
    if(!snow)for(let i=0;i<1400;i++){const px=r()*W,py=r()*H;x.strokeStyle=r()<.5?'rgba(150,180,90,.35)':'rgba(30,50,22,.4)';x.lineWidth=1;x.beginPath();x.moveTo(px,py);x.lineTo(px+(r()-.5)*3,py-3-r()*6);x.stroke()}});
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(140,140);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
  const m=new THREE.MeshLambertMaterial({map:t});
  m.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vGW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGW=(modelMatrix*vec4(position,1.)).xz;');
    s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vGW;'+NOISE).replace('#include <map_fragment>','#include <map_fragment>\n{float n=fbm2(vGW*.035);float d=fbm2(vGW*.11+9.);diffuseColor.rgb*=.78+.42*n;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.15,1.02,.72),smoothstep(.6,.85,d)*'+(snow?'.0':'.6')+');}')};
  return m}

/* ---------- swaying grass that follows the player ---------- */
export function makeGrass(scene,mask){const mobile=matchMedia('(pointer:coarse)').matches||innerWidth<700;const N=mobile?44000:130000,SIZE=mobile?38:56;
  const base=new THREE.BufferGeometry();const w=.042,pos=new Float32Array([-w,0,0, w,0,0, -w*.85,.35,0, w*.85,.35,0, -w*.55,.7,0, w*.55,.7,0, 0,1,0]);
  base.setAttribute('position',new THREE.BufferAttribute(pos,3));base.setAttribute('normal',new THREE.BufferAttribute(new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1]),3));
  base.setAttribute('uv',new THREE.BufferAttribute(new Float32Array([0,0,1,0,0,.35,1,.35,0,.7,1,.7,.5,1]),2));
  const c0=new THREE.Color('#34552a'),c1=new THREE.Color('#5e8c36'),c2=new THREE.Color('#a3c262');const col=[];for(const y of[0,0,.35,.35,.7,.7,1]){const c=y<.5?c0.clone().lerp(c1,y/.5):c1.clone().lerp(c2,(y-.5)/.5);col.push(c.r,c.g,c.b)}
  base.setAttribute('color',new THREE.BufferAttribute(new Float32Array(col),3));base.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]);
  const g=new THREE.InstancedBufferGeometry();g.index=base.index;for(const k of['position','normal','uv','color'])g.setAttribute(k,base.attributes[k]);
  const off=new Float32Array(N*4),R=rng(7);for(let i=0;i<N;i++){off[i*4]=R()*SIZE;off[i*4+1]=R()*SIZE;off[i*4+2]=R()*Math.PI*2;off[i*4+3]=.45+R()*.55}
  g.setAttribute('aOff',new THREE.InstancedBufferAttribute(off,4));g.instanceCount=N;
  const U={uTime:{value:0},uPlayer:{value:new THREE.Vector2()},uSize:{value:SIZE},uMask:{value:mask},uMaskMin:{value:new THREE.Vector2(MASK.x0,MASK.z0)},uMaskSize:{value:new THREE.Vector2(MASK.w,MASK.h)},uWind:{value:1}};
  const m=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  m.onBeforeCompile=s=>{Object.assign(s.uniforms,U);
    s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aOff;uniform float uTime,uSize,uWind;uniform vec2 uPlayer,uMaskMin,uMaskSize;uniform sampler2D uMask;'+NOISE)
      .replace('#include <color_vertex>',`#include <color_vertex>
        vec2 gB=aOff.xy+uSize*floor((uPlayer-aOff.xy)/uSize+.5);
        vec2 mu=(gB-uMaskMin)/uMaskSize;
        float gM=(mu.x<0.||mu.y<0.||mu.x>1.||mu.y>1.)?0.:smoothstep(.5,.88,texture2D(uMask,mu).r);
        float gN=fbm2(gB*.06),gN2=vnoise(gB*.9);
        float gD=distance(gB,uPlayer);
        float gH=aOff.w*(.3+.48*gN)*gM*smoothstep(uSize*.5,uSize*.5-7.,gD);gH*=step(.08,gH);
        vColor.rgb*=mix(vec3(.82,.9,.72),vec3(1.12,1.06,.86),gN2);
        vColor.rgb=mix(vColor.rgb,vColor.rgb*vec3(1.35,1.15,.62),smoothstep(.62,.9,fbm2(gB*.11+9.))*.7);`)
      .replace('#include <beginnormal_vertex>','vec3 objectNormal=vec3(0.,1.,0.);')
      .replace('#include <begin_vertex>',`
        vec3 p=position;p.y*=gH;p.x*=(.75+.5*gN2)*step(.001,gH);
        float wv=sin(uTime*1.6+gB.x*.13+gB.y*.09)*.55+sin(uTime*2.9+gB.x*.55+gB.y*.4)*.2;
        float lean=(wv*.3*uWind+.22+gN2*.14)*p.y*p.y/max(gH,.15);
        float cs=cos(aOff.z),sn=sin(aOff.z);
        vec3 r=vec3(p.x*cs,p.y,p.x*sn);
        vec2 wd=normalize(vec2(.8,.6));r.xz+=wd*lean;
        vec3 transformed=vec3(gB.x,0.02,gB.y)+r;`)};
  const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.receiveShadow=true;scene.add(mesh);
  return{mesh,U,update(dt,T,px,pz){U.uTime.value=T;U.uPlayer.value.set(px,pz)}}}

/* ---------- physically based sky with clouds ---------- */
export function makeSky(scene){const sky=new Sky();sky.scale.setScalar(1000);const u=sky.material.uniforms;
  u.turbidity.value=3.2;u.rayleigh.value=1.25;u.mieCoefficient.value=.004;u.mieDirectionalG.value=.82;
  if(u.cloudCoverage){u.cloudCoverage.value=.42;u.cloudDensity.value=.55;u.cloudScale.value=.00022;u.cloudSpeed.value=.00004;u.cloudElevation.value=.45}
  scene.add(sky);return sky}

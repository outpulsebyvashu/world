import {THREE,G,clamp,lerp,anim,makeChar,Batch,bx,cyl,CHM} from './core.js';
import {buildWorld,spawnTown,W} from './world.js';
import {PROJECTS,WA,STORY,NUMS,ROLES,SKILLS,RALLY} from './data.js';
import {CSS,HUD} from './hud.js';
import {snd} from './sound.js';

const OW=window.OW={};
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let root,renderer,scene,camera,sunL,hemi,amb,running=false,last=0;
const $=s=>root.querySelector(s);
const P={pos:new THREE.Vector3(0,0,24),vel:new THREE.Vector3(),yaw:Math.PI,grounded:true,world:'out',state:'walk',emote:null,emoteT:0,cup:false,seat:null,ride:false,climb:null};
const cam={yaw:0,pitch:.36,dist:8.5,tdist:8.5,lastDrag:0};
const inp={jx:0,jy:0,keys:{},target:null,pend:null,jump:false};
let player,cupMesh,marker,timeMode=LS.get('ow_time','auto'),zoneName='',beansGot=new Set(LS.get('ow_beans',[])),unlocked=LS.get('ow_unlocked',false),party=false;
let quest=LS.get('ow_quest',{doctor:0}),dlgState=null,tour=null,evPhase=-1,rallyI=0,rallyT=0,heard=0,concertT=0;
G.player=P;G.snd=snd;OW._={P,G,cam,W,get party(){return party},get camera(){return camera},get scene(){return scene},THREE};
export const EGGS=['ow_beans','ow_roof','ow_call','ow_laptop','ow_mirror','ow_lake','ow_goal','ow_freeloader','ow_rally','ow_concert','ow_doctor','ow_party','ow_scooter','ow_dog','ow_tour','ow_fire','ow_bonfire'];

/* ================= host (standalone or inside portfolio) ================= */
function standaloneHost(){const found=new Set(LS.get('ow_eggs',[]));return{RM,
  egg(id,msg){const isNew=!found.has(id);if(isNew){found.add(id);LS.set('ow_eggs',[...found]);snd.chime()}toast(isNew?'SECRET '+found.size+'/'+EGGS.length:'FOUND AGAIN',msg)},
  toast:(t,m)=>toast(t,m),open:null}}
let tt;function toast(t,m){const el=$('.ow-toast');el.innerHTML='<b></b><span></span>';el.firstChild.textContent=t;el.lastChild.textContent=m||'';el.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('on'),3200)}

/* ================= init ================= */
OW.init=async(host,el,progress=()=>{})=>{
  root=el;G.host=Object.assign(standaloneHost(),host||{});
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  root.classList.add('ow');root.insertAdjacentHTML('beforeend',HUD);
  progress(.1);
  try{await Promise.race([Promise.all(['800 64px "Bricolage Grotesque"','400 64px Anton','600 20px "Inter Tight"'].map(f=>document.fonts.load(f))),new Promise(r=>setTimeout(r,2500))])}catch(e){}
  progress(.25);
  renderer=new THREE.WebGLRenderer({antialias:devicePixelRatio<2,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  root.prepend(renderer.domElement);renderer.domElement.className='ow-cv3';renderer.domElement.setAttribute('aria-hidden','true');
  scene=new THREE.Scene();scene.fog=new THREE.Fog('#8fd0ff',70,260);
  camera=new THREE.PerspectiveCamera(58,1,.1,900);
  hemi=new THREE.HemisphereLight('#cfe9ff','#6a8f4e',1.1);scene.add(hemi);amb=new THREE.AmbientLight('#ffffff',.25);scene.add(amb);
  sunL=new THREE.DirectionalLight('#fff3dc',2.2);sunL.castShadow=true;const sm=innerWidth>900?2048:1024;sunL.shadow.mapSize.set(sm,sm);const sc=sunL.shadow.camera;sc.left=-32;sc.right=32;sc.top=32;sc.bottom=-32;sc.near=1;sc.far=220;sunL.shadow.bias=-.0004;sunL.shadow.normalBias=.03;scene.add(sunL,sunL.target);
  G.enter=enterRoom;G.exit=exitRoom;G.card=card;G.talk=talk;G.say=(n,t)=>dlg(n,[t]);G.cv=openCV;G.brew=brew;
  buildWorld(scene);progress(.6);await new Promise(r=>setTimeout(r,0));
  if(G.LOT)(G.extraNPCs=G.extraNPCs||[]).push({id:'doctor',name:'Dr. Rao',look:{shirt:'#cfe3f7',pants:'#2b2b2b',hair:'grey',coat:'#ffffff',glasses:true,face:'flat'},x:90.5,z:-5.2,yaw:0,lines:[],barks:['My clinic is coming soon.','Coffee, anyone?']});
  spawnTown(scene);progress(.8);
  player=makeChar({skin:'#c48a60',shirt:'#141414',pants:'#8a7f5a',cargo:'#6f6646',shoes:'#f5f5f5',hair:'curly',glasses:true,face:'smile',seed:3,logo:'#ff6a3d'});scene.add(player);
  const cb=new Batch();cyl(cb,0,0,0,.11,.09,.22,'#ffffff',10);cyl(cb,0,.11,0,.1,.1,.01,'#8a5a3b',10);cupMesh=cb.mesh(CHM);cupMesh.position.set(0,-.72,.12);cupMesh.visible=false;player.userData.armR.add(cupMesh);
  marker=new THREE.Mesh(new THREE.RingGeometry(.35,.5,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.9,depthWrite:false}));marker.visible=false;scene.add(marker);
  makeBeans();
  if(unlocked)applyUnlock(false);
  bindInput();resize();addEventListener('resize',resize);
  mapBG();setTime();
  progress(1);
  if(!LS.get('ow_hint',false))$('.ow-hint').hidden=false;
  updQuest();
};
OW.start=()=>{if(running)return;running=true;last=performance.now();requestAnimationFrame(loop)};
OW.stop=()=>{running=false;snd.music(null)};
function resize(){const w=root.clientWidth||innerWidth,h=root.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}

/* ================= day / night ================= */
const C=c=>new THREE.Color(c);const NIGHT=C('#0b1230'),DAY=C('#8fd0ff'),DUSK=C('#ff9b6a'),tc=new THREE.Color(),sunDir=new THREE.Vector3();
let dayK=1;
function hourNow(){if(timeMode==='day')return 12.5;if(timeMode==='sunset')return 18.1;if(timeMode==='night')return 22.5;const d=new Date();return d.getHours()+d.getMinutes()/60}
function setTime(){const h=hourNow(),a=(h-6)/12*Math.PI,alt=Math.sin(a);
  dayK=clamp((alt+.08)/.38,0,1);const dusk=clamp(1-Math.abs(alt-.04)/.28,0,1);
  if(P.world!=='out'){const r=G.rooms[P.world];scene.background=tc.set('#141414').clone();scene.fog.color.set('#141414');scene.fog.near=34;scene.fog.far=60;hemi.color.set(r.light);hemi.groundColor.set('#8a7a6a');hemi.intensity=1.25;amb.intensity=.35;sunL.intensity=1.1;sunL.color.set('#fff4e0');sunDir.set(.3,1,.5).normalize();W.winMat.color.set('#bfe0ff');setNight(0);return}
  tc.copy(NIGHT).lerp(DAY,dayK).lerp(DUSK,dusk*.55);scene.background=tc.clone();scene.fog.color.copy(tc);scene.fog.near=70;scene.fog.far=dayK>.3?260:200;
  if(alt>-.05){sunDir.set(Math.cos(a)*.8,Math.max(alt,.18),-.45).normalize();sunL.color.copy(C('#ffd2a1')).lerp(C('#fff6e6'),dayK);sunL.intensity=.6+2.0*dayK}
  else{sunDir.set(-Math.cos(a)*.6,.7,.4).normalize();sunL.color.set('#9fb6ff');sunL.intensity=.55}
  hemi.color.copy(C('#5b6fb0')).lerp(C('#d6ecff'),dayK);hemi.groundColor.copy(C('#26304a')).lerp(C('#6a8f4e'),dayK);hemi.intensity=.75+.45*dayK;amb.intensity=.18+.12*dayK;
  W.winMat.color.copy(C('#ffd27a')).lerp(C('#9fc4e6'),dayK);setNight(1-dayK);
  W.sun.visible=alt>-.02;W.moon.visible=dayK<.5}
function setNight(k){if(W.neonMat)W.neonMat.color.copy(C('#a8a8a8')).lerp(C('#ffffff'),k);W.lampMat.color.copy(C('#cfcfcf')).lerp(C('#fff1b8'),k);W.pools.material.opacity=k*.6;W.stars.material.opacity=k;W.clouds.material.opacity=.35+.6*(1-k);W.roofLights.material.color.set(k>.4?'#fff1b8':'#dddddd')}

/* ================= beans ================= */
const BEANS0=[[-31,.9,-24.5],[0,1.95,0],[64,.9,57.4],['home',-5.6,1.3,-4.4],['hq',9,.6,-7.6],[-28,1.7,61.5],[86,.9,-24],[96.5,1.75,40]];
const BEANS_LOT=[[-31,.9,-24.5],[0,1.95,0],[64,.9,57.4],[-26,2.1,-18],[8,2.1,-42],[-28,1.7,61.5],[86,.9,-24],[96.5,1.75,40]];
function makeBeans(){const geo=new THREE.SphereGeometry(.3,12,10);geo.scale(1,1.3,.8);const mat=new THREE.MeshLambertMaterial({color:'#6b3e22',emissive:'#3a1a08'});const gm=new THREE.MeshBasicMaterial({color:'#2a160a'});
  (G.LOT?BEANS_LOT:BEANS0).forEach((b,i)=>{let [x,y,z]=b;if(typeof b[0]==='string'){const r=G.rooms[b[0]];x=r.cx+b[1];y=b[2];z=b[3]}const g=new THREE.Group();const m=new THREE.Mesh(geo,mat);g.add(m);const s=new THREE.Mesh(new THREE.BoxGeometry(.04,.62,.05),gm);s.position.z=.24;g.add(s);
    const glow=new THREE.Mesh(new THREE.RingGeometry(.45,.6,20),new THREE.MeshBasicMaterial({color:'#ffcc3a',transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}));g.add(glow);g.position.set(x,y,z);scene.add(g);G.beans.push({g,id:i,y});if(beansGot.has(i))g.visible=false})}
function pickBean(b){beansGot.add(b.id);LS.set('ow_beans',[...beansGot]);b.g.visible=false;snd.chime();$('.ow-beans b').textContent=beansGot.size+'/8';
  if(beansGot.size>=8&&!unlocked){unlocked=true;LS.set('ow_unlocked',true);applyUnlock(true)}else toast('COFFEE BEAN '+beansGot.size+'/8',['Kaveri will be pleased.','Smells like Coorg.','Keep looking. Try jumping on things.','Halfway roast.','Medium roast achieved.','Almost a full dose.','One more. Look high and low.'][beansGot.size-1]||'');updQuest()}
function applyUnlock(fresh){W.ladder.visible=!G.LOT;W.dj.visible=true;if(fresh){G.host.egg('ow_beans',G.LOT?'All 8 beans found! Unlocked: the Arc-Street scooter and party mode at the DJ booth.':'All 8 beans found! Unlocked: HQ rooftop ladder, Arc-Street scooter, and party mode at the DJ booth.');snd.fanfare()}}

/* ================= input ================= */
function bindInput(){const cv=renderer.domElement,joy=$('.ow-joy'),knob=$('.ow-knob');
  let jid=null,jc=null;const R=52;
  joy.addEventListener('pointerdown',e=>{e.preventDefault();snd.unlock();jid=e.pointerId;joy.setPointerCapture(jid);const r=joy.getBoundingClientRect();jc={x:r.left+r.width/2,y:r.top+r.height/2};mj(e)});
  const mj=e=>{let dx=e.clientX-jc.x,dy=e.clientY-jc.y;const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d}knob.style.transform=`translate(${dx}px,${dy}px)`;inp.jx=dx/R;inp.jy=dy/R};
  joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)mj(e)});
  const ju=e=>{if(e.pointerId!==jid)return;jid=null;inp.jx=inp.jy=0;knob.style.transform=''};joy.addEventListener('pointerup',ju);joy.addEventListener('pointercancel',ju);
  const pts=new Map();let pinch=0;
  cv.addEventListener('pointerdown',e=>{snd.unlock();pts.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now()});cv.setPointerCapture(e.pointerId);if(pts.size===2){const [a,b]=[...pts.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}});
  cv.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(pts.size===2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)cam.tdist=clamp(cam.tdist*pinch/d,4,16);pinch=d;return}
    cam.yaw-=dx*.0065;cam.pitch=clamp(cam.pitch+dy*.0045,.05,1.25);cam.lastDrag=performance.now()});
  const up=e=>{const p=pts.get(e.pointerId);if(!p)return;pts.delete(e.pointerId);if(pts.size<2)pinch=0;if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)<10&&performance.now()-p.t<400)tap(e.clientX,e.clientY)};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>pts.delete(e.pointerId));
  cv.addEventListener('wheel',e=>{e.preventDefault();cam.tdist=clamp(cam.tdist*(1+e.deltaY*.001),4,16)},{passive:false});
  addEventListener('keydown',e=>{if(!running||e.target.closest&&e.target.closest('input,textarea,select'))return;const k=e.key.toLowerCase();inp.keys[k]=true;snd.unlock();
    if(k===' '){e.preventDefault();inp.jump=true}if(k==='e'||k==='enter'){const a=$('.ow-act');if(!a.hidden)a.click()}if(k==='m')openMap();if(k==='escape')closeAll();
    if(['1','2','3','4'].includes(k))emote(['wave','dance','sip','sixseven'][+k-1]);if(k.startsWith('arrow'))e.preventDefault()});
  addEventListener('keyup',e=>{inp.keys[e.key.toLowerCase()]=false});
  addEventListener('blur',()=>{inp.keys={}});
  $('.ow-jump').addEventListener('pointerdown',e=>{e.preventDefault();snd.unlock();inp.jump=true});
  $('.ow-emo').onclick=()=>{const m=$('.ow-emotes');m.hidden=!m.hidden};
  root.querySelectorAll('.ow-emotes button').forEach(b=>b.onclick=()=>{emote(b.dataset.e);$('.ow-emotes').hidden=true});
  $('.ow-act').onclick=()=>{const a=curAct;if(a){snd.click();a.act()}};
  $('.ow-time').onclick=()=>{const order=['auto','day','sunset','night'];timeMode=order[(order.indexOf(timeMode)+1)%4];LS.set('ow_time',timeMode);setTime();updTimeBtn();toast('TIME',{auto:'Live: your local time',day:'Daytime',sunset:'Golden hour',night:'Night'}[timeMode])};updTimeBtn();
  $('.ow-mute').onclick=()=>{snd.toggle();updMute()};updMute();
  $('.ow-cvb').onclick=openCV;$('.ow-map').onclick=openMap;
  let lc=0,lt;$('.ow-loc').onclick=()=>{lc++;clearTimeout(lt);lt=setTimeout(()=>lc=0,500);if(lc>=2){lc=0;if(G.host.open)G.host.open();else openMenu()}};
  root.addEventListener('click',e=>{const x=e.target.closest('[data-close]');if(x){x.closest('.ow-ov,.ow-dlg').hidden=true;if(x.closest('.ow-dlg'))dlgState=null}});
  $('.ow-hint [data-go]').onclick=()=>{$('.ow-hint').hidden=true;LS.set('ow_hint',true);snd.unlock()};
  $('.ow-hint [data-cv]').onclick=()=>{$('.ow-hint').hidden=true;LS.set('ow_hint',true);openCV()};
  $('.ow-bigmap canvas').addEventListener('click',bigMapTap);
}
function updTimeBtn(){$('.ow-time').innerHTML=ICON[timeMode==='auto'?(dayK>.5?'sun':'moon'):timeMode==='night'?'moon':timeMode==='sunset'?'dusk':'sun']+'<span>'+(timeMode==='auto'?'Live':timeMode[0].toUpperCase()+timeMode.slice(1))+'</span>';$('.ow-time').setAttribute('aria-label','Time of day: '+timeMode+'. Tap to change.')}
function updMute(){$('.ow-mute').innerHTML=snd.muted?ICON.mute:ICON.vol;$('.ow-mute').setAttribute('aria-label',snd.muted?'Unmute sound':'Mute sound')}
const ICON={sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',moon:'<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',dusk:'<svg viewBox="0 0 24 24"><path d="M3 18h18M6 14a6 6 0 0 1 12 0M12 3v4M4.6 7.6l1.8 1.8M19.4 7.6l-1.8 1.8"/></svg>',vol:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',mute:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'};

const ray=new THREE.Raycaster(),v2=new THREE.Vector2(),plY=new THREE.Plane(new THREE.Vector3(0,1,0),0),hitP=new THREE.Vector3();
function tap(cx,cy){if(P.state==='sit'||P.climb)return;const r=renderer.domElement.getBoundingClientRect();v2.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);ray.setFromCamera(v2,camera);
  const near=G.pick.filter(o=>o.visible!==false&&o.getWorldPosition(hitP).distanceTo(P.pos)<45);
  const hits=ray.intersectObjects(near,true);
  for(const h of hits){let o=h.object;while(o&&!o.userData.tap)o=o.parent;if(!o)continue;if(h.distance>60)break;
    const d=Math.hypot(h.point.x-P.pos.x,h.point.z-P.pos.z);if(d<=(o.userData.reach||4)){o.userData.tap();snd.click()}else{setTarget(h.point.x,h.point.z,{fn:o.userData.tap,reach:(o.userData.reach||4)-.4,x:h.point.x,z:h.point.z})}return}
  plY.constant=-P.pos.y;if(ray.ray.intersectPlane(plY,hitP))setTarget(hitP.x,hitP.z,null)}
function setTarget(x,z,pend){inp.target={x,z};inp.pend=pend;marker.position.set(x,P.pos.y+.06,z);marker.visible=true;marker.scale.setScalar(1)}
function emote(e){if(P.ride||P.state==='sit')return;P.emote=e;P.emoteT=e==='dance'?6:2.6;if(e==='sip')cupMesh.visible=true;snd.click()}

/* ================= physics ================= */
function inBox(c,x,z,r){return x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1}
function collide(p,r,h){for(const c of G.colliders){if(!inBox(c,p.x,p.z,r))continue;if(c.y1<=p.y+.4||c.y0>=p.y+h)continue;
  const cx=clamp(p.x,c.x0,c.x1),cz=clamp(p.z,c.z0,c.z1);let dx=p.x-cx,dz=p.z-cz;const d2=dx*dx+dz*dz;
  if(d2>1e-8){if(d2>=r*r)continue;const d=Math.sqrt(d2),k=(r-d)/d;p.x+=dx*k;p.z+=dz*k}
  else{const a=[p.x-c.x0,c.x1-p.x,p.z-c.z0,c.z1-p.z],m=Math.min(...a),i=a.indexOf(m);if(i===0)p.x=c.x0-r;else if(i===1)p.x=c.x1+r;else if(i===2)p.z=c.z0-r;else p.z=c.z1+r}}}
function groundAt(x,z,y){let g=0;for(const c of G.colliders){if(c.y1>g&&c.y1<=y+.42&&x>c.x0-.15&&x<c.x1+.15&&z>c.z0-.15&&z<c.z1+.15)g=c.y1}return g}
const rayBox=(o,d,c)=>{let t0=0,t1=1;for(const [a,b0,b1] of[['x',c.x0,c.x1],['y',c.y0,c.y1],['z',c.z0,c.z1]]){const od=o[a],dd=d[a];if(Math.abs(dd)<1e-9){if(od<b0||od>b1)return 1;continue}let ta=(b0-od)/dd,tb=(b1-od)/dd;if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1)return 1}return t0};

/* ================= rooms ================= */
function fade(fn){const f=$('.ow-fade');f.classList.add('on');setTimeout(()=>{fn();setTimeout(()=>f.classList.remove('on'),60)},RM?0:260)}
function enterRoom(id){const r=G.rooms[id];if(!r)return;snd.door();fade(()=>{if(P.ride)dismount();P.pos.set(r.spawn.x,0,r.spawn.z);P.vel.set(0,0,0);P.world=id;cam.yaw=0;cam.pitch=.55;cam.tdist=Math.min(cam.tdist,7.5);P.yaw=Math.PI;inp.target=null;marker.visible=false;setTime();zone(r.name,true);snapCam()})}
function exitRoom(id){const r=G.rooms[id];snd.door();fade(()=>{const o=r.out;P.pos.set(o.x+o.fx*1.2,o.y||0,o.z+o.fz*1.2);P.vel.set(0,0,0);P.world='out';P.yaw=Math.atan2(o.fx,o.fz);cam.yaw=Math.atan2(o.fx,o.fz)+.7;cam.pitch=.42;inp.target=null;marker.visible=false;setTime();zone('',true);snapCam()})}

/* ================= main loop ================= */
let curAct=null,actT=0,timeT=0,mapT=0,barkT=2;
function loop(t){if(!running)return;requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;
  try{update(dt,t/1000)}catch(e){console.error(e)}
  renderer.render(scene,camera)}
const fw=new THREE.Vector3(),tmp=new THREE.Vector3();
function update(dt,T){
  /* --- input vector --- */
  const K=inp.keys;let ix=inp.jx+((K.d||K.arrowright)?1:0)-((K.a||K.arrowleft)?1:0),iy=inp.jy+((K.s||K.arrowdown)?1:0)-((K.w||K.arrowup)?1:0);
  let mag=Math.min(1,Math.hypot(ix,iy));const sprint=K.shift||Math.hypot(inp.jx,inp.jy)>.93;
  const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw);let mx=0,mz=0;
  if(mag>.12){const n=Math.hypot(ix,iy);ix/=n;iy/=n;mx=(-fz)*ix+fx*(-iy);mz=fx*ix+fz*(-iy);inp.target=null;inp.pend=null;marker.visible=false}
  else if(inp.target){const dx=inp.target.x-P.pos.x,dz=inp.target.z-P.pos.z,d=Math.hypot(dx,dz);const pd=inp.pend?Math.hypot(inp.pend.x-P.pos.x,inp.pend.z-P.pos.z):1e9;
    if(d<.35||(inp.pend&&pd<=inp.pend.reach)){const p=inp.pend;inp.target=null;inp.pend=null;marker.visible=false;if(p)p.fn()}else{mx=dx/d;mz=dz/d;mag=d>10?1:Math.min(1,d/1.2+.4)}}
  else mag=0;
  if(P.state==='sit'){if(mag>.5||inp.jump){stand();inp.jump=false}else{mag=0}}
  if(P.climb){climbStep(dt);mag=0}
  /* --- velocity --- */
  if(!P.climb&&P.state!=='sit'){
    const spd=P.ride?16:(sprint&&mag>.9?11:6.6);
    const tx=mx*spd*mag,tz=mz*spd*mag,acc=P.ride?2.2:(P.grounded?14:4);const k=1-Math.exp(-acc*dt);
    P.vel.x+=(tx-P.vel.x)*k;P.vel.z+=(tz-P.vel.z)*k;
    if(inp.jump&&P.grounded&&!P.ride){P.vel.y=9.6;P.grounded=false;snd.jump();P.emote=null}inp.jump=false;
    P.vel.y-=26*dt;const prevY=P.pos.y;P.pos.x+=P.vel.x*dt;P.pos.z+=P.vel.z*dt;P.pos.y+=P.vel.y*dt;
    collide(P.pos,P.ride?.6:.38,1.9);
    const g=groundAt(P.pos.x,P.pos.z,Math.max(prevY,P.pos.y));
    if(P.pos.y<=g){if(!P.grounded&&P.vel.y<-6)snd.land();P.pos.y=g;P.vel.y=0;P.grounded=true}else if(P.pos.y-g>.05)P.grounded=false;
    if(P.pos.y<-20)respawn()}
  /* --- facing & anim --- */
  const hs=Math.hypot(P.vel.x,P.vel.z);
  if(hs>.4&&P.state!=='sit'){const ty=Math.atan2(P.vel.x,P.vel.z);let d=ty-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));P.yaw+=d*Math.min(1,dt*(P.ride?5:12))}
  if(P.emote){P.emoteT-=dt;if(P.emoteT<=0||hs>1){P.emote=null;if(!P.cup)cupMesh.visible=false}}
  player.position.copy(P.pos);if(P.ride)player.position.y+=.42;player.rotation.y=P.yaw;
  anim(player,dt,{speed:P.ride?0:hs,air:!P.grounded&&!P.climb&&!P.ride,sit:P.state==='sit',ride:P.ride,emote:P.emote||(P.cup&&!hs?'sip':null)});
  if(P.climb){player.userData.legL.rotation.x=Math.sin(T*8)*.6;player.userData.legR.rotation.x=-Math.sin(T*8)*.6;player.userData.armL.rotation.x=-2.6+Math.sin(T*8)*.3;player.userData.armR.rotation.x=-2.6-Math.sin(T*8)*.3}
  if(P.ride){W.scooter.position.set(P.pos.x,P.pos.y,P.pos.z);W.scooter.rotation.y=P.yaw;W.scooter.rotation.z=clamp(-(P.vel.x*Math.cos(P.yaw)-P.vel.z*Math.sin(P.yaw))*.01,-.25,.25)}
  if(hs>1&&P.grounded&&!P.ride){P.stepT=(P.stepT||0)+dt*hs*.32;if(P.stepT>1){P.stepT=0;snd.step()}}
  if(P.ride)snd.motor(hs/16);else snd.motor(0);
  if(marker.visible){marker.rotation.y+=dt*2;marker.material.opacity=.5+.4*Math.sin(T*6)}
  /* --- world systems --- */
  beansTick(dt,T);npcTick(dt,T);eventTick(dt,T);ballTick(dt);ambientTick(dt,T);
  if(P.world==='out')lakeCheck();
  /* --- action button --- */
  actT-=dt;if(actT<=0){actT=.12;pickAction()}
  timeT-=dt;if(timeT<=0){timeT=20;setTime();updTimeBtn()}
  mapT-=dt;if(mapT<=0){mapT=.15;drawMini();zoneCheck()}
  barkT-=dt;if(barkT<=0){barkT=3+Math.random()*3;bark()}
  bubblesTick();
  camTick(dt)}
function snapCam(){camTick(1,true)}
function camTick(dt,snap){cam.dist+=(cam.tdist-cam.dist)*Math.min(1,dt*6);
  const tgt=tmp.set(P.pos.x,P.pos.y+(P.state==='sit'?1.1:1.55)+(P.ride?.4:0),P.pos.z);
  if(P.state==='sit'&&P.seat){let d=(P.seat.yaw+Math.PI)-cam.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));if(performance.now()-cam.lastDrag>1500)cam.yaw+=d*Math.min(1,dt*2)}
  if(P.ride&&performance.now()-cam.lastDrag>1200){let d=(P.yaw+Math.PI)-cam.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));cam.yaw+=d*Math.min(1,dt*2.5)}
  const cp=Math.cos(cam.pitch);fw.set(Math.sin(cam.yaw)*cp*cam.dist,Math.sin(cam.pitch)*cam.dist,Math.cos(cam.yaw)*cp*cam.dist);
  let tm=1;if(P.world==='out'){for(const c of G.colliders){if(c.cam===false||c.y1<1)continue;const t=rayBox(tgt,fw,c);if(t<tm)tm=t}}
  const want=tgt.clone().addScaledVector(fw,Math.max(.12,tm-.04));want.y=Math.max(want.y,P.pos.y+.4);
  if(snap)camera.position.copy(want);else camera.position.lerp(want,Math.min(1,dt*14));camera.lookAt(tgt);
  sunL.position.copy(P.pos).addScaledVector(sunDir,90);sunL.target.position.copy(P.pos);
  W.sun.position.copy(camera.position).addScaledVector(sunDir,600);W.sun.lookAt(camera.position);
  W.moon.position.copy(camera.position).add(tmp.set(-sunDir.x,Math.abs(sunDir.y)+.25,-sunDir.z).normalize().multiplyScalar(560));W.moon.lookAt(camera.position);
  W.stars.position.copy(camera.position)}
function respawn(){P.pos.set(0,0,24);P.vel.set(0,0,0);P.world='out';setTime();snapCam()}

/* ================= actions ================= */
function pickAction(){let best=null,bd=1e9;const px=P.pos.x,pz=P.pos.z,py=P.pos.y;
  const consider=(x,z,y,r,label,act)=>{const d=Math.hypot(x-px,z-pz);if(d<r&&Math.abs((y||0)-py)<2.5&&d<bd){bd=d;best={label,act}}};
  if(P.state==='sit'){best={label:'Stand up',act:stand}}
  else if(P.ride){best={label:'Hop off scooter',act:dismount}}
  else if(!P.climb){
    for(const t of G.triggers){if(t.cond&&!t.cond())continue;consider(t.x,t.z,t.y||0,t.r,t.label,t.act)}
    for(const s of G.seats){if(s.event&&s.taken)continue;consider(s.x,s.z,0,1.15,s.label,()=>sit(s))}
    for(const n of G.npcs){if(!n.c.visible||n.hidden)continue;const p=n.c.position;consider(p.x,p.z,p.y,2.3,'Talk to '+n.name.replace(/ \(.*\)$/,''),()=>talk(n))}
    consider(W.scooter.position.x,W.scooter.position.z,0,2.2,unlocked?'Ride Arc-Street':'Arc-Street (locked)',()=>unlocked?mount():toast('LOCKED','Find all 8 coffee beans to unlock the Arc-Street scooter.'));
    if(unlocked){if(!G.LOT){consider(12.9,-36,0,1.8,'Climb to the roof',()=>climb(true));consider(10.6,-36,15,1.8,'Climb down',()=>climb(false))}consider(-9.6,-6,0,2.2,party?'Stop the party':'Start the party',toggleParty)}}
  curAct=best;const b=$('.ow-act');if(best){b.hidden=false;if(b.textContent!==best.label)b.textContent=best.label}else b.hidden=true}
function sit(s){P.state='sit';P.seat=s;P.pos.set(s.x,s.y-.52,s.z);P.vel.set(0,0,0);P.yaw=s.yaw;inp.target=null;marker.visible=false;if(s.event)s.taken=true}
function stand(){const s=P.seat;P.state='walk';if(s){P.pos.x+=Math.sin(s.yaw)*.9;P.pos.z+=Math.cos(s.yaw)*.9;P.pos.y=0;s.taken=false}P.seat=null}
function mount(){P.ride=true;P.emote=null;P.pos.copy(W.scooter.position);P.yaw=W.scooter.rotation.y;G.host.egg('ow_scooter','You rode the Arc-Street. 600W of pure joy.')}
function dismount(){P.ride=false;W.scooter.rotation.z=0;P.pos.x+=Math.cos(P.yaw)*1.1;P.pos.z-=Math.sin(P.yaw)*1.1}
function climb(up){P.climb={up,t:0};P.vel.set(0,0,0);P.yaw=up?-Math.PI/2:Math.PI/2}
function climbStep(dt){const c=P.climb;c.t+=dt/2.2;const k=Math.min(1,c.t);if(c.up){P.pos.set(12.75-(k>.92?(k-.92)/.08*2:0),k*15,-36)}else{P.pos.set(12.75,(1-k)*15,-36)}
  if(k>=1){P.climb=null;if(c.up){P.pos.set(10.6,15,-36);G.host.egg('ow_roof','Rooftop reached. Respect.')}else P.pos.set(13.2,0,-36);P.grounded=true}}
function brew(){P.cup=true;cupMesh.visible=true;emote('sip');snd.brew();if(quest.doctor===1){toast('COFFEE READY','Now take it to Dr. Rao at City Clinic.')}else toast('FRESHLY PULLED','A cappuccino. Cup first, then the numbers.')}
function toggleParty(){party=!party;W.disco.g.visible=party;if(party)G.host.egg('ow_party','Party mode! The whole town is dancing.');snd.mode()}

/* ================= dialog ================= */
let typer;function dlg(name,pages,choices,npcRef){const d=$('.ow-dlg');d.hidden=false;dlgState={name,pages,i:0,choices,npc:npcRef};$('.ow-dn').textContent=name;showPage()}
function showPage(){const s=dlgState;if(!s)return;const t=s.pages[s.i];const el=$('.ow-dt');clearInterval(typer);el.textContent='';let k=0;
  if(RM){el.textContent=t}else typer=setInterval(()=>{k+=2;el.textContent=t.slice(0,k);if(k%6===0)snd.blip();if(k>=t.length)clearInterval(typer)},22);
  const c=$('.ow-dc');c.innerHTML='';const last=s.i>=s.pages.length-1;
  const add=(label,fn,primary)=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(primary)b.className='p';b.onclick=()=>{snd.click();fn()};c.appendChild(b)};
  if(!last)add('Next',()=>{s.i++;showPage()},true);
  else if(s.choices)s.choices.forEach((ch,j)=>add(ch.t,()=>{closeDlg();ch.f&&ch.f()},j===0));
  else add('OK',closeDlg,true)}
function closeDlg(){$('.ow-dlg').hidden=true;clearInterval(typer);dlgState=null}
function talk(n){if(n.c&&n.c.rotation&&n.kind!=='dog'&&n.kind!=='cat'&&!n.lie&&!n.sit){n.c.rotation.y=Math.atan2(P.pos.x-n.c.position.x,P.pos.z-n.c.position.z);n.faceT=4}
  if(n.id==='guide')return guideTalk(n);
  if(n.id==='farmer')return dlg('Kaveri (coffee farmer)',beansGot.size>=8?['You found all 8 of my beans! Best roast of the year.','The scooter, the rooftop and the DJ booth are open for you. Enjoy!']:['Ayyo! My Coorg beans rolled all over town.','There are 8. Some are high up, some are inside buildings. One is even near the water.','You have '+beansGot.size+' so far. Find them all and I\'ll unlock something special.']);
  if(n.id==='doctor'){if(quest.doctor===0){quest.doctor=1;LS.set('ow_quest',quest);updQuest();return dlg('Dr. Rao',['I haven\'t had a decent coffee in a week.','Doctor\'s orders: go to TOKI, brew me a coffee and bring it here.'])}
    if(quest.doctor===1&&P.cup){quest.doctor=2;LS.set('ow_quest',quest);P.cup=false;cupMesh.visible=false;updQuest();G.host.egg('ow_doctor','Coffee delivered. The doctor approves.');return dlg('Dr. Rao',['Ahh. Perfect extraction. Pulse is back to normal.','Prescription: hire this barista. Take twice daily.'])}
    if(quest.doctor===1)return dlg('Dr. Rao',['Still waiting on that coffee. TOKI is on the west street, the Manali side.']);
    return dlg('Dr. Rao',['Thanks again for the coffee. My website? Vashu is building it. Clean and calm, like a good waiting room.'])}
  if(n.free)return dlg(n.name,n.lines,[{t:'Rate card first. 50% advance.',f:()=>{n.repel=performance.now()+60000;n.flee=2.5;G.host.egg('ow_freeloader','You quoted a 50% advance. The freeloader vanished.');toast('BOUNDARIES','"50% advance" is the strongest spell in freelancing.')}},{t:'Sure, for exposure!',f:()=>toast('MISTAKE','They now also want an app. And a mascot. By Monday.')}],n);
  if(n.kind==='dog'){n.hearts=2;G.host.egg('ow_dog','You petted Biscuit. Good boy.');return dlg(n.name,['Woof! (Tail wagging at 200 bpm.)'])}
  if(n.kind==='cat')return dlg(n.name,['Mrrp. (The cat permits exactly one pat.)']);
  if(n===W.politician)return dlg(n.name,evPhase===0?['Brother! Sister! You came to my rally!','Vote Kettle! I promise… everything. Details after elections.']:['The rally is over. Come back later. Also, vote Kettle.']);
  dlg(n.name,n.lines||['…'],null,n)}
function guideTalk(n){if(tour)return dlg(n.name,['We\'re on the tour! Follow me.'],[{t:'Keep going',f:null},{t:'End the tour',f:()=>{tour=null;n.c.position.set(3.5,0,20)}}]);
  dlg('Mini-Vashu (guide)',['Hey! I\'m Mini-Vashu, the tiny tour guide of Vashu Town.','Everything here is my portfolio: projects, clients, CV, the lot. Want the tour?'],[{t:'Yes, show me around',f:()=>{tour={i:0,wait:0,said:-1};toast('TOUR STARTED','Follow Mini-Vashu. He waits for you.')}},{t:'I\'ll explore myself',f:null}])}

/* ================= info card & CV ================= */
function card(p){const c=$('.ow-card');c.hidden=false;$('.ow-card .k').textContent=[p.tag,p.st].filter(Boolean).join(' · ');$('.ow-card h2').textContent=p.n;$('.ow-card p.d').textContent=p.d||'';
  const a=$('.ow-card a');if(p.href){a.hidden=false;a.href=p.href.startsWith('/')?'https://vashudev.outpulse.company'+p.href:p.href;a.textContent=p.link||'Open ↗'}else a.hidden=true;
  $('.ow-card .sw').style.background=p.color||'#f4efe6';$('.ow-card button').focus()}
function openCV(){const c=$('.ow-cv');c.hidden=false;$('.ow-cv .x').focus()}
function openMenu(){$('.ow-menu').hidden=false}
function closeAll(){root.querySelectorAll('.ow-ov').forEach(o=>o.hidden=true);closeDlg();$('.ow-emotes').hidden=true}

/* ================= quests ================= */
function updQuest(){const q=[];q.push((beansGot.size>=8?'✓ ':'')+'Find Kaveri\'s coffee beans ('+beansGot.size+'/8)');if(quest.doctor===1)q.push(P.cup?'Bring the coffee to Dr. Rao (City Clinic)':'Brew a coffee at TOKI for Dr. Rao');if(quest.doctor===2)q.push('✓ Doctor\'s orders');
  $('.ow-quest').innerHTML=q.map(s=>'<span>'+s+'</span>').join('');$('.ow-beans b').textContent=beansGot.size+'/8'}

/* ================= beans / ball / lake ================= */
function beansTick(dt,T){for(const b of G.beans){if(!b.g.visible)continue;b.g.rotation.y+=dt*2;b.g.position.y=b.y+Math.sin(T*2+b.id)*.12;if(b.g.position.distanceTo(tmp.set(P.pos.x,P.pos.y+.9,P.pos.z))<1.25)pickBean(b)}}
function ballTick(dt){const b=W.ball,m=b.m;if(P.world==='out'&&!P.ride){const dx=m.position.x-P.pos.x,dz=m.position.z-P.pos.z,d=Math.hypot(dx,dz);if(d<.95&&P.pos.y<1){const hs=Math.hypot(P.vel.x,P.vel.z);const k=3+hs*1.25;b.v.set(dx/d*k,hs>8?3.5:1.2,dz/d*k);snd.kick()}}
  b.v.y-=20*dt;m.position.addScaledVector(b.v,dt);if(m.position.y<.42){m.position.y=.42;b.v.y=Math.abs(b.v.y)>1?-b.v.y*.45:0}
  const f=Math.exp(-1.3*dt);b.v.x*=f;b.v.z*=f;m.rotation.x+=b.v.z*dt*2.2;m.rotation.z-=b.v.x*dt*2.2;
  for(const c of G.colliders){if(c.y1<.3||c.y0>m.position.y+.4)continue;if(inBox(c,m.position.x,m.position.z,.42)){const cx=clamp(m.position.x,c.x0,c.x1),cz=clamp(m.position.z,c.z0,c.z1);const dx=m.position.x-cx,dz=m.position.z-cz;if(Math.abs(dx)>Math.abs(dz)){b.v.x*=-.6;m.position.x=cx+Math.sign(dx||1)*.43}else{b.v.z*=-.6;m.position.z=cz+Math.sign(dz||1)*.43}}}
  const pt=W.pitch;if(m.position.z>pt.gz0&&m.position.z<pt.gz1&&m.position.y<2.1&&((m.position.x<pt.x0+.3&&m.position.x>pt.x0-1.5)||(m.position.x>pt.x1-.3&&m.position.x<pt.x1+1.5))){G.host.egg('ow_goal','GOAL! The crowd (two pigeons) goes wild.');snd.fanfare();m.position.set(32,.42,35);b.v.set(0,0,0)}
  if(Math.abs(m.position.x)>99||m.position.z>91||m.position.z<-52){m.position.set(32,.42,35);b.v.set(0,0,0)}}
function lakeCheck(){const L=W.lake;if(Math.hypot(P.pos.x-L.x,P.pos.z-L.z)<L.r-.6&&P.pos.y<.3&&!P.ride){snd.splash();G.host.egg('ow_lake','Splash! You can\'t swim in a portfolio.');fade(()=>{P.pos.set(64,0,45);P.vel.set(0,0,0);snapCam()})}}
function ambientTick(dt,T){W.steam.forEach(s=>{const k=(T*.4+s.userData.o)%1;s.position.set(Math.sin(k*9+s.userData.o*7)*.4,1.5+k*3,Math.cos(k*7)*.3);s.material.opacity=.45*(1-k);s.scale.setScalar(.6+k)});
  W.clouds.position.x=((T*.8)%400)-200;
  if(W.holo){W.holo[0].rotation.set(Math.PI/2+Math.sin(T*.6)*.3,T*.8,0);W.holo[1].rotation.set(Math.PI/2,0,T*1.2);W.holo[1].rotation.x=T*.9}
  if(W.rgb)W.rgb.material.color.setHSL((T*.08)%1,.9,.55);
  if(W.siren)W.siren.material.color.set(Math.sin(T*3)>0?'#3b6bff':'#ff3b3b');
  if(W.policeLights){const on=Math.sin(T*3)>0;W.policeLights[0].material.color.set(on?'#ff2d2d':'#551010');W.policeLights[1].material.color.set(on?'#10205a':'#2d6bff')}
  if(W.fireLights){W.fireT=Math.max(0,(W.fireT||0)-dt);W.fireLights.material.color.set(W.fireT>0&&Math.sin(T*8)>0?'#ff2d2d':'#661111')}
  if(W.craneHook){W.craneHook.rotation.z=Math.sin(T*.7)*.06;W.craneHook.position.x=74+Math.sin(T*.15)*4}
  if(W.bonfire){W.bonfire.children.forEach((c,i)=>{c.scale.set(1,.85+Math.sin(T*9+i*2)*.18,1)})}
  if(W.evTurntable)W.evTurntable.rotation.y=T*.5;
  if(W.flag)W.flag.rotation.y=Math.sin(T*1.3)*.25;
  if(party){W.disco.ball.rotation.y+=dt*.8;W.disco.beams.forEach((b,i)=>{const a=b.userData.a+T*(RM?.1:.6);b.rotation.set(Math.sin(a)*.6,a,Math.cos(a)*.6)})}}

/* ================= NPCs ================= */
function npcTick(dt,T){const px=P.pos.x,pz=P.pos.z,now=performance.now();
  for(const n of G.npcs){const c=n.c,p=c.position;const far=Math.hypot(p.x-px,p.z-pz)>75;c.visible=!far&&!n.hidden;if(far)continue;
    let sp=0,em=n.emote||null;
    if(n.kind==='wander'&&!party){if(n.faceT>0){n.faceT-=dt}else if(n.pause>0){n.pause-=dt}else{const t=n.path[n.pi];const dx=t[0]-p.x,dz=t[1]-p.z,d=Math.hypot(dx,dz);if(d<.4){n.pi=(n.pi+1)%n.path.length;if(Math.random()<.35)n.pause=1.5+Math.random()*3}else{sp=n.speed;p.x+=dx/d*sp*dt;p.z+=dz/d*sp*dt;turn(c,Math.atan2(dx,dz),dt)}}}
    else if(n.kind==='chase'){const dx=px-p.x,dz=pz-p.z,d=Math.hypot(dx,dz);
      if(n.flee>0){n.flee-=dt;sp=8;p.x-=dx/d*sp*dt;p.z-=dz/d*sp*dt;turn(c,Math.atan2(-dx,-dz),dt);em=null}
      else if(P.world==='out'&&d<10&&d>1.9&&now>(n.repel||0)){sp=3.4;p.x+=dx/d*sp*dt;p.z+=dz/d*sp*dt;turn(c,Math.atan2(dx,dz),dt);em=null}
      else if(d<=1.9&&P.world==='out'){turn(c,Math.atan2(dx,dz),dt);em='beg'}
      else{const hx=n.home[0]-p.x,hz=n.home[1]-p.z,hd=Math.hypot(hx,hz);if(hd>.5){sp=2;p.x+=hx/hd*sp*dt;p.z+=hz/hd*sp*dt;turn(c,Math.atan2(hx,hz),dt);em=null}}}
    else if(n.kind==='guide')sp=guideTick(n,dt);
    else if(n.kind==='dog'){const dx=px-p.x,dz=pz-p.z,d=Math.hypot(dx,dz);if(P.world==='out'&&d<14&&d>2.4){sp=Math.min(9,d*1.4);p.x+=dx/d*sp*dt;p.z+=dz/d*sp*dt;turn(c,Math.atan2(dx,dz),dt)}c.children[0].position.y=sp?Math.abs(Math.sin(T*14))*.08:0;continue}
    else if(n.kind==='cat'){continue}
    if(party&&(n.kind==='wander'||n.kind==='crowd'||n.kind==='chase')&&P.world==='out'){const a=(n.ci||G.npcs.indexOf(n))*.7,tx=Math.cos(a)*(6+(a%3)),tz=Math.sin(a)*(6+(a%3)),dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d>.5&&n.kind!=='crowd'){sp=5;p.x+=dx/d*sp*dt;p.z+=dz/d*sp*dt;turn(c,Math.atan2(dx,dz),dt)}else em='dance'}
    if(n.lie){c.rotation.x=-Math.PI/2;p.y=.3}
    if(c.userData.legL)anim(c,dt,{speed:sp,sit:n.sit&&!sp,emote:sp?null:em})}}
function turn(c,ty,dt){let d=ty-c.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));c.rotation.y+=d*Math.min(1,dt*8)}
const STOPS=[{p:[[0,8]],t:'Welcome to the Mumbai centre. Those four giant numbers? My actual results at work.'},{p:[[0,-21]],t:'North is Raipur, my hometown. Outpulse Labs HQ goes up right here. For now every plot in town is a construction lot.'},{p:[[-6,0],[-31,-4.5]],t:'Manali side: TOKI, my specialty coffee spot, is coming here. The site coffee cart already works.'},{p:[[-6,0],[16,0],[30,5.5]],t:'East is Goa. Poster Street: every billboard is a project. The Outpulse.EV showroom is right behind you.'},{p:[[64,-4.5]],t:'Client Row: a bakehouse, a waffle shop, a Kannada restaurant and a clinic. Walk in.'},{p:[[64,4],[44,5.5],[46,24],[48,44]],t:'The Goa beach. Kick the ball, chill in the hammock, grab a kokum soda at the shack.'},{p:[[46,24],[8,24],[-8,30],[-12,36]],t:'South is Mysuru. Palace Grounds: rallies and concerts all day. Grab a chair.'},{p:[[-8,24],[-8,6],[-21,-5.5]],t:'Last stop: my studio will sit above TOKI. Until then, the Quick CV button has everything. Tour done, thanks for walking with me!'}];
function guideTick(n,dt){const c=n.c,p=c.position;if(!tour){const dx=3.5-p.x,dz=20-p.z,d=Math.hypot(dx,dz);if(d>.5){p.x+=dx/d*5*dt;p.z+=dz/d*5*dt;turn(c,Math.atan2(dx,dz),dt);return 5}turn(c,Math.atan2(P.pos.x-p.x,P.pos.z-p.z),dt);return 0}
  const st=STOPS[tour.i];const wp=st.p[tour.w||0];const dx=wp[0]-p.x,dz=wp[1]-p.z,d=Math.hypot(dx,dz);const pd=Math.hypot(P.pos.x-p.x,P.pos.z-p.z);
  if(P.world!=='out'){return 0}
  if(d>.5){if(pd>11){if(!tour.kept){tour.kept=1;bubble(n,'Keep up!')}turn(c,Math.atan2(P.pos.x-p.x,P.pos.z-p.z),dt);return 0}tour.kept=0;p.x+=dx/d*5.2*dt;p.z+=dz/d*5.2*dt;turn(c,Math.atan2(dx,dz),dt);return 5.2}
  if((tour.w||0)<st.p.length-1){tour.w=(tour.w||0)+1;return 0}
  turn(c,Math.atan2(P.pos.x-p.x,P.pos.z-p.z),dt);
  if(tour.said!==tour.i&&pd<9){tour.said=tour.i;const last=tour.i===STOPS.length-1;dlg('Mini-Vashu (guide)',[st.t],[{t:last?'Thanks!':'Next stop',f:()=>{if(last){tour=null;G.host.egg('ow_tour','Completed the guided tour.')}else{tour.i++;tour.w=0}}}])}
  return 0}

/* ================= events: rally & concert ================= */
function eventTick(dt,T){const ph=Math.floor(Date.now()/120000)%2;if(ph!==evPhase){evPhase=ph;setPhase()}
  const E=W.event,d=Math.hypot(P.pos.x-E.x,P.pos.z-E.z);const near=P.world==='out'&&d<24;
  W.stageLights.forEach((m,i)=>{const k=evPhase===1?(Math.sin(T*(RM?.5:2)+i)*.5+.5):.15;m.material.color.setHSL((i/5+(evPhase===1?T*.05:0))%1,.9,.3+.4*k)});
  if(evPhase===0){rallyT-=dt;if(near&&rallyT<=0){rallyT=4.6;const line=RALLY[rallyI%RALLY.length];rallyI++;sub('Shri Vaada Kumar',line);snd.gibber(line.length);W.crowd.forEach(c=>{c.emote=Math.random()<.5?'clap':null});if(P.state==='sit'&&P.seat&&P.seat.event){heard++;if(heard>=5)G.host.egg('ow_rally','You sat through a whole rally. Patience: maxed.')}}if(!near)sub(null)}
  else{sub(null);if(near){concertT+=dt;if(concertT>20)G.host.egg('ow_concert','You attended The Crema Boys live.')}}
  snd.setScene({concert:evPhase===1&&near?clamp(1-(d-8)/16,0,1):0,rally:evPhase===0&&near,party:party&&P.world==='out'&&Math.hypot(P.pos.x,P.pos.z)<40,indoor:P.world!=='out'?P.world:null})}
function setPhase(){const rally=evPhase===0;W.bannerMesh.material.map=rally?W.banner.rally:W.banner.concert;W.bannerMesh.material.needsUpdate=true;W.podium.visible=rally;W.politician.hidden=!rally;W.band.forEach(b=>b.hidden=rally);
  const seats=[1,2,4,7,8,10,13,15,19,22];G.chairs.forEach(c=>c.taken=false);
  W.crowd.forEach((n,i)=>{const p=n.c.position;if(rally){const ch=G.chairs[seats[i]];ch.taken=true;G.seats.filter(s=>s.event&&Math.abs(s.x-ch.x)<.1&&Math.abs(s.z-.05-ch.z)<.1).forEach(s=>s.taken=true);p.set(ch.x,.18,ch.z);n.c.rotation.y=0;n.sit=true;n.emote=null}else{n.sit=false;p.set(-36+(i%5)*4+Math.random(),0,53+Math.floor(i/5)*2.2);n.c.rotation.y=0;n.emote=i%3?'cheer':'dance'}})}
function sub(name,line){const s=$('.ow-sub');if(!name){s.hidden=true;return}s.hidden=false;s.innerHTML='<b></b> <span></span>';s.firstChild.textContent=name+':';s.lastChild.textContent=line}

/* ================= barks / bubbles ================= */
const bubs=[];function bark(){if(dlgState)return;const c=G.npcs.filter(n=>n.barks&&n.c.visible&&!n.hidden&&Math.hypot(n.c.position.x-P.pos.x,n.c.position.z-P.pos.z)<13);if(!c.length)return;const n=c[Math.floor(Math.random()*c.length)];bubble(n,n.barks[Math.floor(Math.random()*n.barks.length)])}
function bubble(n,text){if(bubs.length>2)bubs.shift().el.remove();const el=document.createElement('span');el.className='ow-bub';el.textContent=text;$('.ow-bubbles').appendChild(el);bubs.push({n,el,t:2.8})}
const pv=new THREE.Vector3();function bubblesTick(){for(let i=bubs.length-1;i>=0;i--){const b=bubs[i];b.t-=1/60;const p=b.n.c.position;pv.set(p.x,p.y+(b.n.lie?1:2.5),p.z).project(camera);
  if(b.t<=0||pv.z>1){b.el.remove();bubs.splice(i,1);continue}const r=root.getBoundingClientRect();b.el.style.transform=`translate(${(pv.x*.5+.5)*r.width}px,${(-pv.y*.5+.5)*r.height}px) translate(-50%,-100%)`}}

/* ================= zones & maps ================= */
const ZONES=[['Mumbai · Town Square',-17,17,-17,19],['Raipur · Outpulse HQ',-14,14,-50,-17],['Raipur · Marine Drive',-30,-10,-36,-24],['Raipur · Fire Station',-48,-29,-48,-25],['Raipur · Police Station',15,36,-48,-23],['Construction Site',38,95,-50,-27],['Goa · Outpulse.EV',16,40,10,24],['Goa · Poster Street',16,99,-6,12],['Goa · Client Row',20,95,-27,-6],['Goa · Beach & Lagoon',14,99,24,92],['Manali · TOKI',-42,-18,-24,-5],['Manali · Lookout',-96,-71,-10,10],['Manali · Café Strip',-72,-18,-24,22],['Mysuru · Palace Grounds',-47,-9,24,69],['Mysuru · School Road',-47,8,69,92],['Mysuru · South Road',-9,14,19,92]];
function zoneCheck(){if(P.world!=='out')return;const z=ZONES.find(z=>P.pos.x>z[1]&&P.pos.x<z[2]&&P.pos.z>z[3]&&P.pos.z<z[4]);zone(z?z[0]:'')}
let zt;function zone(name,force){if(name===zoneName&&!force)return;zoneName=name;if(!name)return;const el=$('.ow-zone');el.textContent=name;el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}
const MX0=-100,MZ0=-56,MS=3;let bg;
function mapBG(){bg=document.createElement('canvas');bg.width=200*MS;bg.height=150*MS;const x=bg.getContext('2d');const R=(x0,x1,z0,z1,c)=>{x.fillStyle=c;x.fillRect((x0-MX0)*MS,(z0-MZ0)*MS,(x1-x0)*MS,(z1-z0)*MS)};
  R(-100,100,-56,94,'#79c267');R(-46,-10,26,68,'#8fd07a');R(20,44,26,44,'#6dbb5c');R(16,99,-6,6,'#545861');R(-72,-16,-6,6,'#545861');R(-6,6,-24,-16,'#545861');R(-6,6,16,92,'#545861');R(-16,16,-16,16,'#e9dfca');
  x.fillStyle='#3fa7e0';x.beginPath();x.arc((64-MX0)*MS,(64-MZ0)*MS,13*MS,0,7);x.fill();R(22,94,9,9.6,'#141414');R(-40,-16,58,64,'#2b2b2b');
  for(const b of G.buildings)R(b.x0,b.x1,b.z0,b.z1,b.col);x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=2;for(const b of G.buildings)x.strokeRect((b.x0-MX0)*MS,(b.z0-MZ0)*MS,(b.x1-b.x0)*MS,(b.z1-b.z0)*MS)}
function drawMini(){const c=$('.ow-map canvas'),x=c.getContext('2d'),W_=c.width,S=2.6;x.clearRect(0,0,W_,W_);
  if(P.world!=='out'){x.fillStyle='#141414';x.fillRect(0,0,W_,W_);x.fillStyle='#f4efe6';x.font='700 22px "Inter Tight",sans-serif';x.textAlign='center';x.fillText('INSIDE',W_/2,W_/2-8);x.font='600 16px "Inter Tight",sans-serif';const n=G.rooms[P.world].name;x.fillText(n.length>18?n.slice(0,17)+'…':n,W_/2,W_/2+18);return}
  x.save();x.translate(W_/2,W_/2);x.scale(S/MS,S/MS);x.translate(-(P.pos.x-MX0)*MS,-(P.pos.z-MZ0)*MS);x.drawImage(bg,0,0);
  for(const b of G.beans)if(b.g.visible&&false){}
  x.restore();
  const dot=(wx,wz,col,r=5)=>{const sx=W_/2+(wx-P.pos.x)*S,sy=W_/2+(wz-P.pos.z)*S;if(sx<0||sy<0||sx>W_||sy>W_)return;x.fillStyle=col;x.beginPath();x.arc(sx,sy,r,0,7);x.fill();x.strokeStyle='#141414';x.lineWidth=2;x.stroke()};
  const g=G.npcs.find(n=>n.id==='guide');if(g)dot(g.c.position.x,g.c.position.z,'#ff6a3d',5);dot(W.event.x,W.event.z+8,evPhase?'#c9f26b':'#ffcc3a',6);
  x.save();x.translate(W_/2,W_/2);x.rotate(-P.yaw+Math.PI);x.fillStyle='#ffffff';x.strokeStyle='#141414';x.lineWidth=2.5;x.beginPath();x.moveTo(0,-10);x.lineTo(7,8);x.lineTo(0,4);x.lineTo(-7,8);x.closePath();x.fill();x.stroke();x.restore()}
function openMap(){const o=$('.ow-bigmap');o.hidden=false;const c=o.querySelector('canvas');const w=Math.min(innerWidth-24,820);c.width=w*2;c.height=w*2*.75;c.style.width=w+'px';c.style.height=w*.75+'px';const x=c.getContext('2d');x.drawImage(bg,0,0,c.width,c.height);const k=c.width/bg.width;
  x.font='800 '+Math.round(22*k/1.5)+'px "Bricolage Grotesque",sans-serif';x.textAlign='center';
  for(const b of G.buildings){if(!b.room)continue;const cx=((b.x0+b.x1)/2-MX0)*MS*k,cy=((b.z0+b.z1)/2-MZ0)*MS*k;x.lineWidth=6;x.strokeStyle='#141414';x.strokeText(b.short,cx,cy);x.fillStyle='#ffffff';x.fillText(b.short,cx,cy)}
  for(const [n,X,Z] of[['Event Ground',-28,48],['Lakeside Park',64,64],['Poster Street',58,3],['Town Square',0,-4]]){const cx=(X-MX0)*MS*k,cy=(Z-MZ0)*MS*k;x.lineWidth=6;x.strokeStyle='#141414';x.strokeText(n,cx,cy);x.fillStyle='#ffcc3a';x.fillText(n,cx,cy)}
  if(P.world==='out'){const cx=(P.pos.x-MX0)*MS*k,cy=(P.pos.z-MZ0)*MS*k;x.fillStyle='#ff3b3b';x.beginPath();x.arc(cx,cy,10,0,7);x.fill();x.lineWidth=4;x.strokeStyle='#fff';x.stroke()}}
function bigMapTap(e){if(P.world!=='out')return;const c=e.currentTarget,r=c.getBoundingClientRect();const wx=(e.clientX-r.left)/r.width*200+MX0,wz=(e.clientY-r.top)/r.height*150+MZ0;
  const b=G.buildings.find(b=>b.room&&wx>b.x0-2&&wx<b.x1+2&&wz>b.z0-2&&wz<b.z1+2);$('.ow-bigmap').hidden=true;
  if(b){setTarget(b.door.x,b.door.z,null);toast('WALKING TO',b.name)}else setTarget(wx,wz,null)}

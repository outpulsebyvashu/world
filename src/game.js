import {THREE,G,clamp,lerp,anim,makeChar,Batch,bx,cyl,CHM,drawTex} from './core.js';
import {buildWorld,spawnTown,W} from './world.js';
import {PROJECTS,WA,STORY,NUMS,ROLES,SKILLS,RALLY} from './data.js';
import {CSS,HUD} from './hud.js';
import {snd} from './sound.js';
import {makeMask,groundMaterial,makeGrass,makeSky,MASK} from './nature.js';
import {TOWNS,ORDER,BEANS} from './towns.js';
import {makeFire} from './events.js';

const OW=window.OW={};
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let root,renderer,scene,camera,sunL,hemi,amb,running=false,last=0,grass,sky,townRoot=null,curTown=LS.get('ow_town','vashupur'),visited=new Set(LS.get('ow_visited',[]));
const $=s=>root.querySelector(s);
const P={pos:new THREE.Vector3(0,0,24),vel:new THREE.Vector3(),yaw:Math.PI,grounded:true,world:'out',state:'walk',emote:null,emoteT:0,cup:false,seat:null,ride:false,climb:null};
const cam={yaw:0,pitch:.36,dist:8.5,tdist:8.5,lastDrag:0};
const inp={jx:0,jy:0,keys:{},target:null,pend:null,jump:false};
let player,cupMesh,marker,timeMode=LS.get('ow_time','auto'),zoneName='',beansGot=new Set(LS.get('ow_beans',[])),unlocked=LS.get('ow_unlocked',false),party=false;
let quest=LS.get('ow_quest',{doctor:0}),dlgState=null,tour=null,evPhase=-1,rallyI=0,rallyT=0,heard=0,concertT=0;
G.player=P;G.snd=snd;OW._={P,G,cam,W,fire:()=>fire&&fire.start(),get fireState(){return fire&&fire.active},step(n,dt=.05){let t=performance.now()/1000;for(let i=0;i<n;i++){t+=dt;update(dt,t)}},drone:on=>setDrone(on!==false),dronePos:(x,y,z)=>{drone.pos.set(x,y,z);drone.vel.set(0,0,0)},get party(){return party},get camera(){return camera},get scene(){return scene},get grass(){return grass},get town(){return curTown},load:id=>loadTown(id),view(x,y,z,tx,ty,tz){running=false;camera.position.set(x,y,z);camera.lookAt(tx,ty,tz);setTime();renderer.render(scene,camera)},THREE};
export const EGGS=['ow_beans','ow_roof','ow_call','ow_laptop','ow_mirror','ow_lake','ow_goal','ow_freeloader','ow_rally','ow_concert','ow_doctor','ow_party','ow_scooter','ow_dog','ow_tour','ow_fire','ow_bonfire','ow_statue','ow_firepole','ow_bus','ow_alltowns','ow_terminal','ow_snowman','ow_skydeck'];

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
  /* fonts load while the town builds; sign textures are only painted once they are in */
  const css=()=>new Promise(r=>{const l=document.getElementById('owf');if(!l||l.media==='all')return r();l.addEventListener('load',()=>setTimeout(r),{once:true});l.addEventListener('error',()=>r(),{once:true})});
  let fontsP;try{fontsP=Promise.race([css().then(()=>Promise.all(['800 64px "Bricolage Grotesque"','400 64px Anton','600 20px "Inter Tight"'].map(f=>document.fonts.load(f)))),new Promise(r=>setTimeout(r,2200))]).catch(()=>{})}catch(e){fontsP=Promise.resolve()}
  progress(.2);
  renderer=new THREE.WebGLRenderer({antialias:devicePixelRatio<2,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
  root.prepend(renderer.domElement);renderer.domElement.className='ow-cv3';renderer.domElement.setAttribute('aria-hidden','true');
  scene=new THREE.Scene();scene.fog=new THREE.Fog('#8fd0ff',70,260);
  camera=new THREE.PerspectiveCamera(58,1,.1,1700);
  hemi=new THREE.HemisphereLight('#cfe9ff','#6a8f4e',1.1);scene.add(hemi);amb=new THREE.AmbientLight('#ffffff',.25);scene.add(amb);
  sunL=new THREE.DirectionalLight('#fff3dc',2.2);sunL.castShadow=true;const sm=innerWidth>900?2048:1024;sunL.shadow.mapSize.set(sm,sm);const sc=sunL.shadow.camera;sc.left=-32;sc.right=32;sc.top=32;sc.bottom=-32;sc.near=1;sc.far=220;sunL.shadow.bias=-.0004;sunL.shadow.normalBias=.03;scene.add(sunL,sunL.target);
  G.enter=enterRoom;G.exit=exitRoom;G.card=card;G.talk=talk;G.say=(n,t)=>dlg(n,[t]);G.cv=openCV;G.brew=brew;
  G.tp=tpTo;G.bus=openBus;G.lift=openLift;G.res={tower:'A',floor:0,flat:1};
  sky=makeSky(scene);grass=makeGrass(scene,makeMask([]));progress(.5);
  player=makeChar({skin:'#c48a60',shirt:'#141414',pants:'#8a7f5a',cargo:'#6f6646',shoes:'#f5f5f5',hair:'curly',glasses:true,face:'smile',seed:3,logo:'#ff6a3d'});scene.add(player);
  const cb=new Batch();cyl(cb,0,0,0,.11,.09,.22,'#ffffff',10);cyl(cb,0,.11,0,.1,.1,.01,'#8a5a3b',10);cupMesh=cb.mesh(CHM);cupMesh.position.set(0,-.72,.12);cupMesh.visible=false;player.userData.armR.add(cupMesh);
  marker=new THREE.Mesh(new THREE.RingGeometry(.35,.5,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.9,depthWrite:false}));marker.visible=false;scene.add(marker);
  fire=makeFire({scene,camera,P,snd,W,toast,bubbleNear});
  if(!TOWNS[curTown]||!TOWNS[curTown].ready)curTown='vashupur';
  loadTown(curTown);progress(.75);await fontsP;fontsOK=true;streamNear(P.pos,70);progress(.9);await new Promise(r=>setTimeout(r,0));
  bindInput();resize();addEventListener('resize',resize);
  setTime();
  progress(1);
  if(!LS.get('ow_hint',false))$('.ow-hint').hidden=false;
  updQuest();
};
OW.start=()=>{if(running)return;running=true;last=performance.now();requestAnimationFrame(loop)};
OW.stop=()=>{running=false;snd.music(null)};
function resize(){const w=root.clientWidth||innerWidth,h=root.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}

/* ================= day / night ================= */
const C=c=>new THREE.Color(c);const NIGHT=C('#0a0f1e'),DAY=C('#c4d6e6'),DUSK=C('#e9a57c'),tc=new THREE.Color(),sunDir=new THREE.Vector3();
let dayK=1;
function hourNow(){if(timeMode==='day')return 12.5;if(timeMode==='sunset')return 17.55;if(timeMode==='night')return 22.5;const d=new Date();return d.getHours()+d.getMinutes()/60}
/* nothing past the fog is drawn: far chunks of town are skipped entirely */
function setFar(){camera.far=scene.fog.far+25;camera.updateProjectionMatrix();if(sky)sky.scale.setScalar(camera.far*1.1)}
function setTime(){const h=hourNow(),a=(h-6)/12*Math.PI,alt=Math.sin(a);
  dayK=clamp((alt+.08)/.38,0,1);const dusk=clamp(1-Math.abs(alt-.04)/.28,0,1);
  if(sky)sky.visible=P.world==='out';if(grass)grass.mesh.visible=P.world==='out'&&!TOWNS[curTown].snow;
  if(P.world!=='out'){const r=G.rooms[P.world];scene.background=tc.set('#141414').clone();scene.fog.color.set('#141414');scene.fog.near=34;scene.fog.far=60;hemi.color.set(r.light);hemi.groundColor.set('#8a7a6a');hemi.intensity=1.25;amb.intensity=.35;sunL.intensity=1.1;sunL.color.set('#fff4e0');sunDir.set(.3,1,.5).normalize();W.winMat.color.set('#bfe0ff');setNight(0);setFar();return}
  tc.copy(NIGHT).lerp(DAY,dayK).lerp(DUSK,dusk*.55);scene.background=sky?null:tc.clone();scene.fog.color.copy(tc);scene.fog.near=90;scene.fog.far=dayK>.3?520:260;setFar();
  const twi=alt<0?clamp((alt+.24)/.24,0,1):1;
  if(sky){const sAlt=alt>-.24?Math.max(alt,.012):alt;const sd=new THREE.Vector3(Math.cos(a)*.85,sAlt,-.45).normalize();sky.material.uniforms.sunPosition.value.copy(sd);renderer.toneMappingExposure=(.5+.42*dayK)*(.25+.75*twi)}
  if(alt>-.05){sunDir.set(Math.cos(a)*.8,Math.max(alt,.18),-.45).normalize();sunL.color.copy(C('#ffc58a')).lerp(C('#fff4e2'),dayK);sunL.intensity=.8+2.6*dayK}
  else{sunDir.set(-Math.cos(a)*.6,.7,.4).normalize();sunL.color.set('#9fb6ff');sunL.intensity=.55}
  hemi.color.copy(C('#5b6fb0')).lerp(C('#d6ecff'),dayK);hemi.groundColor.copy(C('#26304a')).lerp(C('#6a8f4e'),dayK);hemi.intensity=.75+.45*dayK;amb.intensity=.18+.12*dayK;
  W.winMat.color.copy(C('#ffd27a')).lerp(C('#9fc4e6'),dayK);setNight(1-dayK);W.stars.material.opacity=clamp((-alt-.04)/.16,0,1);
  W.sun.visible=false;W.moon.visible=dayK<.5}
function setNight(k){if(W.neonMat)W.neonMat.color.copy(C('#a8a8a8')).lerp(C('#ffffff'),k);W.lampMat.color.copy(C('#cfcfcf')).lerp(C('#fff1b8'),k);W.pools.material.opacity=k*.6;W.stars.material.opacity=k;W.clouds.material.opacity=.35+.6*(1-k);if(W.roofLights)W.roofLights.material.color.set(k>.4?'#fff1b8':'#dddddd')}

/* ================= beans ================= */
function makeBeans(){const geo=new THREE.SphereGeometry(.3,12,10);geo.scale(1,1.3,.8);const mat=new THREE.MeshLambertMaterial({color:'#6b3e22',emissive:'#3a1a08'});const gm=new THREE.MeshBasicMaterial({color:'#2a160a'});
  BEANS.forEach((bn,i)=>{if(bn.t!==curTown)return;const b=bn.p;let [x,y,z]=b;if(typeof b[0]==='string'){const r=G.rooms[b[0]];if(!r)return;x=r.cx+b[1];y=b[2];z=b[3]}const g=new THREE.Group();const m=new THREE.Mesh(geo,mat);g.add(m);const s=new THREE.Mesh(new THREE.BoxGeometry(.04,.62,.05),gm);s.position.z=.24;g.add(s);
    const glow=new THREE.Mesh(new THREE.RingGeometry(.45,.6,20),new THREE.MeshBasicMaterial({color:'#ffcc3a',transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}));g.add(glow);g.position.set(x,y,z);townRoot.add(g);G.beans.push({g,id:i,y});if(beansGot.has(i))g.visible=false})}
function pickBean(b){beansGot.add(b.id);LS.set('ow_beans',[...beansGot]);b.g.visible=false;snd.chime();$('.ow-beans b').textContent=beansGot.size+'/8';
  if(beansGot.size>=8&&!unlocked){unlocked=true;LS.set('ow_unlocked',true);applyUnlock(true)}else toast('COFFEE BEAN '+beansGot.size+'/8',['Kaveri will be pleased.','Smells like Coorg.','Keep looking. Try jumping on things.','Halfway roast.','Medium roast achieved.','Almost a full dose.','One more. Look high and low.'][beansGot.size-1]||'');updQuest()}
function applyUnlock(fresh){if(W.ladder)W.ladder.visible=!G.LOT;if(W.dj)W.dj.visible=true;if(fresh){G.host.egg('ow_beans',G.LOT?'All 8 beans found! Unlocked: the Arc-Street scooter in every town and party mode at the Vashupur DJ booth.':'All 8 beans found! Unlocked: HQ rooftop ladder, Arc-Street scooter, and party mode at the DJ booth.');snd.fanfare()}}

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
    cam.yaw-=dx*.0065;cam.pitch=clamp(cam.pitch+dy*.0045,drone.on?-.35:.05,drone.on?1.52:1.25);cam.lastDrag=performance.now()});
  const up=e=>{const p=pts.get(e.pointerId);if(!p)return;pts.delete(e.pointerId);if(pts.size<2)pinch=0;if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)<10&&performance.now()-p.t<400)tap(e.clientX,e.clientY)};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>pts.delete(e.pointerId));
  cv.addEventListener('wheel',e=>{e.preventDefault();cam.tdist=clamp(cam.tdist*(1+e.deltaY*.001),4,16)},{passive:false});
  addEventListener('keydown',e=>{if(!running||e.target.closest&&e.target.closest('input,textarea,select'))return;const k=e.key.toLowerCase();inp.keys[k]=true;snd.unlock();
    if(k===' '){e.preventDefault();inp.jump=true}if(k==='e'||k==='enter'){const a=$('.ow-act');if(!a.hidden)a.click()}if(k==='m')openMap();if(k==='escape')closeAll();
    if(['1','2','3','4'].includes(k))emote(['wave','dance','sip','sixseven'][+k-1]);if(k.startsWith('arrow'))e.preventDefault()});
  addEventListener('keyup',e=>{inp.keys[e.key.toLowerCase()]=false});
  addEventListener('blur',()=>{inp.keys={}});
  const jb=$('.ow-jump'),db=$('.ow-down');jb.addEventListener('pointerdown',e=>{e.preventDefault();snd.unlock();inp.jump=true;drone.up=1});
  for(const ev of['pointerup','pointercancel','pointerleave']){jb.addEventListener(ev,()=>drone.up=0);db.addEventListener(ev,()=>drone.down=0)}
  db.addEventListener('pointerdown',e=>{e.preventDefault();drone.down=1});
  $('.ow-drone').onclick=()=>{snd.click();setDrone(!drone.on)};
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
function tap(cx,cy){if(P.state==='sit'||P.climb||drone.on)return;const r=renderer.domElement.getBoundingClientRect();v2.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);ray.setFromCamera(v2,camera);
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

/* ================= towns & the bus ================= */
function disposeTree(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();const ms=n.material?(Array.isArray(n.material)?n.material:[n.material]):[];for(const m of ms){if(m===CHM)continue;if(m.map&&!(m.map.userData&&m.map.userData.keep))m.map.dispose();m.dispose()}})}
function placeAtSpawn(){const s=TOWNS[curTown].spawn;if(P.ride)dismount();P.state='walk';P.seat=null;P.climb=null;P.pos.set(s.x,0,s.z);P.vel.set(0,0,0);P.world='out';P.yaw=s.yaw;cam.yaw=s.yaw+Math.PI;cam.pitch=.36;inp.target=null;if(marker)marker.visible=false}
function loadTown(id){if(!TOWNS[id])id='vashupur';
  if(townRoot){scene.remove(townRoot);disposeTree(townRoot)}
  Object.assign(G,{colliders:[],triggers:[],pick:[],npcs:[],zones:[],buildings:[],rooms:{},beans:[],seats:[],chairs:[],blocked:[],camCols:[],cranes:[],extraNPCs:[],noGrass:[],grassPolys:[],mapPolys:[]});
  for(const k of Object.keys(W))delete W[k];
  curTown=id;G.TOWN=id;LS.set('ow_town',id);const T=TOWNS[id];party=false;evPhase=-1;tour=null;closeDlg&&$('.ow-dlg')&&closeDlg();
  townRoot=new THREE.Group();scene.add(townRoot);lazy=[];
  if(drone.on)setDrone(false);buildWorld(townRoot);spawnTown(townRoot);fire.reset(townRoot,T,id);
  W.ground.material=groundMaterial(!!T.snow);W.clouds.visible=false;W.sun.visible=false;
  if(T.snow){const n=1600,v=new Float32Array(n*3);for(let i=0;i<n;i++){v[i*3]=(Math.random()-.5)*70;v[i*3+1]=Math.random()*26;v[i*3+2]=(Math.random()-.5)*70}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(v,3));W.snow=new THREE.Points(g,new THREE.PointsMaterial({color:'#ffffff',size:.12,transparent:true,opacity:.85,depthWrite:false}));townRoot.add(W.snow)}
  const old=grass.U.uMask.value;grass.U.uMask.value=makeMask(T.roads.map(r=>r[4]==='x'?[r[0],r[1],r[2]-2.3,r[3]+2.3]:[r[0]-2.3,r[1]+2.3,r[2],r[3]]),T.b);if(old&&old!==grass.U.uMask.value)old.dispose();
  grass.U.uMaskMin.value.set(MASK.x0,MASK.z0);grass.U.uMaskSize.value.set(MASK.w,MASK.h);
  makeBeans();if(unlocked)applyUnlock(false);
  MX0=T.b[0];MZ0=T.b[2];MW=T.b[1]-T.b[0];MH=T.b[3]-T.b[2];mapBG();
  placeAtSpawn();collectLazy();if(fontsOK)streamNear(P.pos,70);if(running||renderer){setTime();snapCam()}zone(T.name,true);const lb=$('.ow-loc');if(lb){lb.textContent=T.name.toUpperCase();lb.setAttribute('aria-label',T.name+' (double-tap for menu)')}updQuestSafe();
  if(!visited.has(id)){visited.add(id);LS.set('ow_visited',[...visited]);if(visited.size>=6)G.host.egg('ow_alltowns','You visited all six towns. Frequent rider.')}}
/* ---- texture streaming: signs and posters are painted nearest-first, a few ms per frame ---- */
let lazy=[],fontsOK=false,lazyT=0;const _v=new THREE.Vector3(),_s=new THREE.Sphere();
function collectLazy(){const seen=new Set(lazy.map(e=>e.t));townRoot.updateMatrixWorld(true);
  townRoot.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):null;if(!ms)return;for(const m of ms)for(const k of['map','emissiveMap','alphaMap']){const t=m[k];if(!t||!t.userData||!t.userData.lazy)continue;
    if(o.geometry){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();_s.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld)}else{o.getWorldPosition(_s.center);_s.radius=1}
    const e=lazy.find(q=>q.t===t);if(e){e.p.push(_s.center.clone());e.r=Math.max(e.r,_s.radius)}else{seen.add(t);lazy.push({t,p:[_s.center.clone()],r:_s.radius,d:0})}}})}
function distOf(e,p){let d=1e9;for(const q of e.p){const v=Math.hypot(q.x-p.x,q.z-p.z);if(v<d)d=v}return d-e.r}
function streamNear(p,R){lazy=lazy.filter(e=>{if(!e.t.userData.lazy)return false;if(distOf(e,p)<R){drawTex(e.t);return false}return true})}
function lazyTick(){if(!fontsOK||!lazy.length)return;const t0=performance.now();lazyT-=1;
  if(lazyT<=0){lazyT=15;const p=P.world==='out'?(drone.on?drone.focus:P.pos):(G.rooms[P.world]?_v.set(G.rooms[P.world].spawn.x,0,G.rooms[P.world].spawn.z):P.pos);for(const e of lazy)e.d=distOf(e,p);lazy.sort((a,b)=>a.d-b.d)}
  const budget=lazy[0].d<60?6:3;while(lazy.length&&performance.now()-t0<budget){const e=lazy.shift();drawTex(e.t)}}
/* ---- drone view: free flight over the town, the player waits where they stood ---- */
let fire=null;const drone={on:false,pos:new THREE.Vector3(),vel:new THREE.Vector3(),focus:new THREE.Vector3(),up:0,down:0,saved:null};
function bubbleNear(x,z,lines){const c=G.npcs.filter(n=>n.c&&n.c.visible&&!n.hidden&&n.kind!=='dog'&&n.kind!=='cat'&&Math.hypot(n.c.position.x-x,n.c.position.z-z)<36).slice(0,3);c.forEach((n,i)=>bubble(n,lines[i%lines.length]))}
function setDrone(on){if(on&&P.world!=='out'){toast('DRONE','The drone only flies outside.');return}
  drone.on=on;root.classList.toggle('drone',on);const b=$('.ow-drone');b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',on?'Land the drone':'Drone view');
  const jb=$('.ow-jump');jb.querySelector('span').textContent=on?'UP':'JUMP';jb.setAttribute('aria-label',on?'Fly up':'Jump');$('.ow-down').hidden=!on;drone.up=drone.down=0;
  if(on){drone.saved={yaw:cam.yaw,pitch:cam.pitch};drone.pos.copy(camera.position);drone.pos.y=Math.max(drone.pos.y+16,26);drone.vel.set(0,0,0);cam.pitch=.72;inp.target=null;marker.visible=false;$('.ow-act').hidden=true;
    toast('DRONE VIEW',matchMedia('(pointer:fine)').matches?'WASD to fly, drag to look, Space / C for height.':'Joystick to fly, drag to look, UP / DOWN for height.')}
  else{if(drone.saved){cam.yaw=drone.saved.yaw;cam.pitch=drone.saved.pitch}snapCam()}}
function droneTick(dt,mx,mz,mag,sprint){const K=inp.keys,sp=sprint?44:22,k=1-Math.exp(-4*dt);
  const vy=((K[' ']||drone.up)?1:0)-((K.c||K.q||drone.down)?1:0);
  drone.vel.x+=(mx*mag*sp-drone.vel.x)*k;drone.vel.z+=(mz*mag*sp-drone.vel.z)*k;drone.vel.y+=(vy*13-drone.vel.y)*k;
  drone.pos.addScaledVector(drone.vel,dt);const T=TOWNS[curTown];drone.pos.x=clamp(drone.pos.x,T.b[0]-60,T.b[1]+60);drone.pos.z=clamp(drone.pos.z,T.b[2]-60,T.b[3]+60);
  drone.pos.y=clamp(drone.pos.y,3,220);for(const c of G.colliders){if(drone.pos.x>c.x0-.6&&drone.pos.x<c.x1+.6&&drone.pos.z>c.z0-.6&&drone.pos.z<c.z1+.6&&drone.pos.y<c.y1+1.2&&drone.pos.y>c.y0-1)drone.pos.y=c.y1+1.2}}
function droneCam(dt){const cp=Math.cos(cam.pitch);fw.set(-Math.sin(cam.yaw)*cp,-Math.sin(cam.pitch),-Math.cos(cam.yaw)*cp);
  camera.position.copy(drone.pos);camera.lookAt(tmp.copy(drone.pos).add(fw));
  const t=fw.y<-.05?Math.min(90,drone.pos.y/-fw.y):40;drone.focus.set(drone.pos.x+fw.x*t,0,drone.pos.z+fw.z*t);
  sunL.position.copy(drone.focus).addScaledVector(sunDir,90);sunL.target.position.copy(drone.focus);
  W.sun.position.copy(camera.position).addScaledVector(sunDir,600);W.sun.lookAt(camera.position);
  W.moon.position.copy(camera.position).add(tmp.set(-sunDir.x,Math.abs(sunDir.y)+.25,-sunDir.z).normalize().multiplyScalar(560));W.moon.lookAt(camera.position);W.stars.position.copy(camera.position)}
function updQuestSafe(){try{updQuest()}catch(e){}}
function beanHint(){const left=ORDER.filter(t=>BEANS.some((b,i)=>b.t===t&&!beansGot.has(i))).map(t=>TOWNS[t].name);return left.length?' Still missing some in: '+left.join(', ')+'.':''}
function openBus(){const o=$('.ow-bus');const l=o.querySelector('.ow-towns');l.innerHTML='';
  ORDER.forEach(id=>{const t=TOWNS[id];const b=document.createElement('button');b.type='button';b.className='ow-town'+(id===curTown?' here':'')+(t.ready?'':' soon');b.disabled=id===curTown||!t.ready;
    b.innerHTML='<i style="background:'+t.color+'"></i><span><b></b><em></em></span><small></small>';b.querySelector('b').textContent=t.name;b.querySelector('em').textContent=t.tag;b.querySelector('small').textContent=id===curTown?'You are here':t.ready?'Ride':'Coming soon';
    if(!b.disabled)b.onclick=()=>{o.hidden=true;ride(id)};l.appendChild(b)});o.hidden=false;const f=l.querySelector('button:not([disabled])');if(f)f.focus()}
function ride(id){const r=$('.ow-ride'),T=TOWNS[id];r.querySelector('b').textContent=T.name;r.querySelector('em').textContent=T.tag;r.hidden=false;r.classList.remove('go');void r.offsetWidth;r.classList.add('go');snd.door();
  setTimeout(()=>{try{loadTown(id)}catch(e){console.error(e)}G.host.egg('ow_bus','You took the bus. Next stop: '+T.name+'.')},RM?50:700);setTimeout(()=>{r.hidden=true},RM?400:1900)}
function openLift(T){const o=$('.ow-lift');o.querySelector('.k').textContent='Lift · Outpulse Residences Tower '+T;const g=o.querySelector('.ow-floors');g.innerHTML='';
  for(let f=13;f>=0;f--){const b=document.createElement('button');b.type='button';b.className='ow-fl'+((G.res.tower===T&&G.res.floor===f&&P.world!=='out')?' here':'');b.textContent=f?String(f):'G';b.setAttribute('aria-label',f?'Floor '+f:'Ground floor');
    b.onclick=()=>{o.hidden=true;snd.blip();G.res.tower=T;G.res.floor=f;if(!f){G.enter('res'+T);return}G.rooms.resFloor.name='Tower '+T+' · Floor '+f;G.enter('resFloor')};g.appendChild(b)}o.hidden=false}
function tpTo(x,y,z,yaw,label){if(drone.on)setDrone(false);snd.door();fade(()=>{if(P.ride)dismount();P.world='out';P.pos.set(x,y,z);P.vel.set(0,0,0);P.yaw=yaw||0;cam.yaw=(yaw||0)+Math.PI;cam.pitch=.42;inp.target=null;marker.visible=false;setTime();zone(label||TOWNS[curTown].name,true);snapCam()})}

function fade(fn){const f=$('.ow-fade');f.classList.add('on');setTimeout(()=>{fn();setTimeout(()=>f.classList.remove('on'),60)},RM?0:260)}
function enterRoom(id){const r=G.rooms[id];if(!r)return;if(drone.on)setDrone(false);snd.door();fade(()=>{if(r.build){r.build();r.build=null;collectLazy()}if(r.refresh)r.refresh();streamNear(new THREE.Vector3(r.spawn.x,0,r.spawn.z),40);if(P.ride)dismount();P.pos.set(r.spawn.x,0,r.spawn.z);P.vel.set(0,0,0);P.world=id;cam.yaw=0;cam.pitch=.55;cam.tdist=Math.min(cam.tdist,7.5);P.yaw=Math.PI;inp.target=null;marker.visible=false;setTime();zone(r.name,true);snapCam()})}
function exitRoom(id){const r=G.rooms[id];snd.door();fade(()=>{const o=r.out;P.pos.set(o.x+o.fx*1.2,o.y||0,o.z+o.fz*1.2);P.vel.set(0,0,0);P.world='out';P.yaw=Math.atan2(o.fx,o.fz);cam.yaw=Math.atan2(o.fx,o.fz)+.7;cam.pitch=.42;inp.target=null;marker.visible=false;setTime();zone('',true);snapCam()})}

/* ================= main loop ================= */
let curAct=null,actT=0,timeT=0,mapT=0,barkT=2;
function loop(t){if(!running)return;requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;lazyTick();
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
  if(drone.on){droneTick(dt,mx,mz,mag,sprint);mag=0;inp.jump=false}
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
  const FC=drone.on?drone.focus:P.pos;if(grass&&P.world==='out')grass.update(dt,T,FC.x,FC.z);if(sky){sky.position.copy(camera.position);if(sky.material.uniforms.time)sky.material.uniforms.time.value=T}
  beansTick(dt,T);npcTick(dt,T);eventTick(dt,T);fire.tick(dt,T);ballTick(dt);ambientTick(dt,T);
  if(P.world==='out')lakeCheck();
  /* --- action button --- */
  actT-=dt;if(actT<=0){actT=.12;if(drone.on){curAct=null;$('.ow-act').hidden=true}else pickAction()}
  timeT-=dt;if(timeT<=0){timeT=20;setTime();updTimeBtn()}
  mapT-=dt;if(mapT<=0){mapT=.15;drawMini();zoneCheck()}
  barkT-=dt;if(barkT<=0){barkT=3+Math.random()*3;bark()}
  bubblesTick();
  camTick(dt)}
function snapCam(){camTick(1,true)}
function camTick(dt,snap){if(drone.on)return droneCam(dt);cam.dist+=(cam.tdist-cam.dist)*Math.min(1,dt*6);
  const tgt=tmp.set(P.pos.x,P.pos.y+(P.state==='sit'?1.1:1.55)+(P.ride?.4:0),P.pos.z);
  if(P.state==='sit'&&P.seat){let d=(P.seat.yaw+Math.PI)-cam.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));if(performance.now()-cam.lastDrag>1500)cam.yaw+=d*Math.min(1,dt*2)}
  if(P.ride&&performance.now()-cam.lastDrag>1200){let d=(P.yaw+Math.PI)-cam.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));cam.yaw+=d*Math.min(1,dt*2.5)}
  const cp=Math.cos(cam.pitch);fw.set(Math.sin(cam.yaw)*cp*cam.dist,Math.sin(cam.pitch)*cam.dist,Math.cos(cam.yaw)*cp*cam.dist);
  let tm=1;if(P.world==='out'){let lift=0;for(const c of G.colliders){if(c.cam===false||c.y1<1)continue;const t=rayBox(tgt,fw,c);if(t>=1)continue;if(c.y1<2.7){if(t>.12){const need=(c.y1+.45-tgt.y)/t;if(need>fw.y)lift=Math.max(lift,need-fw.y)}continue}if(t<tm)tm=t}fw.y+=Math.min(lift,4.5);let tt2=1;if(G.camCols)for(const c of G.camCols){if(Math.abs(c.x0-P.pos.x)>40||Math.abs(c.z0-P.pos.z)>40)continue;const t=rayBox(tgt,fw,c);if(t<tt2)tt2=t}tm=Math.min(tm,Math.max(tt2,2.6/cam.dist))}
  const want=tgt.clone().addScaledVector(fw,Math.max(.12,tm-.04));want.y=Math.max(want.y,P.pos.y+.4);
  if(snap)camera.position.copy(want);else camera.position.lerp(want,Math.min(1,dt*14));camera.lookAt(tgt);
  sunL.position.copy(P.pos).addScaledVector(sunDir,90);sunL.target.position.copy(P.pos);
  W.sun.position.copy(camera.position).addScaledVector(sunDir,600);W.sun.lookAt(camera.position);
  W.moon.position.copy(camera.position).add(tmp.set(-sunDir.x,Math.abs(sunDir.y)+.25,-sunDir.z).normalize().multiplyScalar(560));W.moon.lookAt(camera.position);
  W.stars.position.copy(camera.position)}
function respawn(){placeAtSpawn();setTime();snapCam()}

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
    if(unlocked){if(!G.LOT){consider(12.9,-36,0,1.8,'Climb to the roof',()=>climb(true));consider(10.6,-36,15,1.8,'Climb down',()=>climb(false))}if(W.dj)consider(W.dj.position.x+1.4,W.dj.position.z,0,2.2,party?'Stop the party':'Start the party',toggleParty)}}
  curAct=best;const b=$('.ow-act');if(best){b.hidden=false;if(b.textContent!==best.label)b.textContent=best.label}else b.hidden=true}
function sit(s){P.state='sit';P.seat=s;P.pos.set(s.x,s.y-.52,s.z);P.vel.set(0,0,0);P.yaw=s.yaw;inp.target=null;marker.visible=false;if(s.event)s.taken=true}
function stand(){const s=P.seat;P.state='walk';if(s){P.pos.x+=Math.sin(s.yaw)*.9;P.pos.z+=Math.cos(s.yaw)*.9;P.pos.y=0;s.taken=false}P.seat=null}
function mount(){P.ride=true;P.emote=null;P.pos.copy(W.scooter.position);P.yaw=W.scooter.rotation.y;G.host.egg('ow_scooter','You rode the Arc-Street. 600W of pure joy.')}
function dismount(){P.ride=false;W.scooter.rotation.z=0;P.pos.x+=Math.cos(P.yaw)*1.1;P.pos.z-=Math.sin(P.yaw)*1.1}
function climb(up){P.climb={up,t:0};P.vel.set(0,0,0);P.yaw=up?-Math.PI/2:Math.PI/2}
function climbStep(dt){const c=P.climb;c.t+=dt/2.2;const k=Math.min(1,c.t);if(c.up){P.pos.set(12.75-(k>.92?(k-.92)/.08*2:0),k*15,-36)}else{P.pos.set(12.75,(1-k)*15,-36)}
  if(k>=1){P.climb=null;if(c.up){P.pos.set(10.6,15,-36);G.host.egg('ow_roof','Rooftop reached. Respect.')}else P.pos.set(13.2,0,-36);P.grounded=true}}
function brew(){P.cup=true;cupMesh.visible=true;emote('sip');snd.brew();if(quest.doctor===1){toast('COFFEE READY','Now take it to Dr. Rao. He\'s by the town square.')}else toast('FRESHLY PULLED','A cappuccino. Cup first, then the numbers.')}
function toggleParty(){if(!W.disco)return;party=!party;W.disco.g.visible=party;if(party)G.host.egg('ow_party','Party mode! The whole town is dancing.');snd.mode()}

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
  if(n.id==='farmer')return dlg('Kaveri (coffee farmer)',beansGot.size>=8?['You found all 8 of my beans! Best roast of the year.','The scooter and the DJ booth in Vashupur are open for you. Enjoy!']:['Ayyo! My Coorg beans rolled all over the six towns.','There are 8. Some are high up, some are inside buildings. Take the bus and look everywhere.','You have '+beansGot.size+' so far.'+beanHint()+' Find them all and I\'ll unlock something special.']);
  if(n.id==='doctor'){if(quest.doctor===0){quest.doctor=1;LS.set('ow_quest',quest);updQuest();return dlg('Dr. Rao',['I haven\'t had a decent coffee in a week.','Doctor\'s orders: go to TOKI, brew me a coffee and bring it here.'])}
    if(quest.doctor===1&&P.cup){quest.doctor=2;LS.set('ow_quest',quest);P.cup=false;cupMesh.visible=false;updQuest();G.host.egg('ow_doctor','Coffee delivered. The doctor approves.');return dlg('Dr. Rao',['Ahh. Perfect extraction. Pulse is back to normal.','Prescription: hire this barista. Take twice daily.'])}
    if(quest.doctor===1)return dlg('Dr. Rao',['Still waiting on that coffee. TOKI is on the main road, east of the signal chowk.']);
    return dlg('Dr. Rao',['Thanks again for the coffee. My clinic? Something\'s cooking. Clean and calm, like a good waiting room.'])}
  if(n.free)return dlg(n.name,n.lines,[{t:'Rate card first. 50% advance.',f:()=>{n.repel=performance.now()+60000;n.flee=2.5;G.host.egg('ow_freeloader','You quoted a 50% advance. The freeloader vanished.');toast('BOUNDARIES','"50% advance" is the strongest spell in freelancing.')}},{t:'Sure, for exposure!',f:()=>toast('MISTAKE','They now also want an app. And a mascot. By Monday.')}],n);
  if(n.kind==='dog'){n.hearts=2;G.host.egg('ow_dog','You petted Biscuit. Good boy.');return dlg(n.name,['Woof! (Tail wagging at 200 bpm.)'])}
  if(n.kind==='cat')return dlg(n.name,['Mrrp. (The cat permits exactly one pat.)']);
  if(n===W.politician)return dlg(n.name,evPhase===0?['Brother! Sister! You came to my rally!','Vote Kettle! I promise… everything. Details after elections.']:['The rally is over. Come back later. Also, vote Kettle.']);
  dlg(n.name,n.lines||['…'],null,n)}
function guideTalk(n){if(tour)return dlg(n.name,['We\'re on the tour! Follow me.'],[{t:'Keep going',f:null},{t:'End the tour',f:()=>{tour=null;n.c.position.set(-120,0,141.5)}}]);
  dlg('Mini-Vashu (guide)',['Hey! I\'m Mini-Vashu, the tiny tour guide of Vashupur.','There are six towns, and the bus is the only way between them. This one is the capital. Want the tour?'],[{t:'Yes, show me around',f:()=>{tour={i:0,wait:0,said:-1};toast('TOUR STARTED','Follow Mini-Vashu. He waits for you.')}},{t:'I\'ll explore myself',f:null}])}

/* ================= info card & CV ================= */
function card(p){const c=$('.ow-card');c.hidden=false;$('.ow-card .k').textContent=[p.tag,p.st].filter(Boolean).join(' · ');$('.ow-card h2').textContent=p.n;$('.ow-card p.d').textContent=p.d||'';
  const a=$('.ow-card a');if(p.href){a.hidden=false;a.href=p.href.startsWith('/')?'https://vashudev.outpulse.company'+p.href:p.href;a.textContent=p.link||'Open ↗'}else a.hidden=true;
  $('.ow-card .sw').style.background=p.color||'#f4efe6';$('.ow-card button').focus()}
function openCV(){const c=$('.ow-cv');c.hidden=false;$('.ow-cv .x').focus()}
function openMenu(){$('.ow-menu').hidden=false}
function closeAll(){root.querySelectorAll('.ow-ov').forEach(o=>o.hidden=true);closeDlg();$('.ow-emotes').hidden=true}

/* ================= quests ================= */
function updQuest(){const q=[];q.push((beansGot.size>=8?'✓ ':'')+'Find Kaveri\'s coffee beans ('+beansGot.size+'/8)');if(quest.doctor===1)q.push(P.cup?'Bring the coffee to Dr. Rao (Vashupur)':'Brew a coffee at TOKI for Dr. Rao (Vashupur)');if(quest.doctor===2)q.push('✓ Doctor\'s orders');
  $('.ow-quest').innerHTML=q.map(s=>'<span>'+s+'</span>').join('');$('.ow-beans b').textContent=beansGot.size+'/8'}

/* ================= beans / ball / lake ================= */
function beansTick(dt,T){for(const b of G.beans){if(!b.g.visible)continue;b.g.rotation.y+=dt*2;b.g.position.y=b.y+Math.sin(T*2+b.id)*.12;if(b.g.position.distanceTo(tmp.set(P.pos.x,P.pos.y+.9,P.pos.z))<1.25)pickBean(b)}}
function ballTick(dt){const b=W.ball;if(!b)return;const m=b.m;if(P.world==='out'&&!P.ride){const dx=m.position.x-P.pos.x,dz=m.position.z-P.pos.z,d=Math.hypot(dx,dz);if(d<.95&&P.pos.y<1){const hs=Math.hypot(P.vel.x,P.vel.z);const k=3+hs*1.25;b.v.set(dx/d*k,hs>8?3.5:1.2,dz/d*k);snd.kick()}}
  b.v.y-=20*dt;m.position.addScaledVector(b.v,dt);if(m.position.y<.42){m.position.y=.42;b.v.y=Math.abs(b.v.y)>1?-b.v.y*.45:0}
  const f=Math.exp(-1.3*dt);b.v.x*=f;b.v.z*=f;m.rotation.x+=b.v.z*dt*2.2;m.rotation.z-=b.v.x*dt*2.2;
  for(const c of G.colliders){if(c.y1<.3||c.y0>m.position.y+.4)continue;if(inBox(c,m.position.x,m.position.z,.42)){const cx=clamp(m.position.x,c.x0,c.x1),cz=clamp(m.position.z,c.z0,c.z1);const dx=m.position.x-cx,dz=m.position.z-cz;if(Math.abs(dx)>Math.abs(dz)){b.v.x*=-.6;m.position.x=cx+Math.sign(dx||1)*.43}else{b.v.z*=-.6;m.position.z=cz+Math.sign(dz||1)*.43}}}
  const pt=W.pitch;if(m.position.z>pt.gz0&&m.position.z<pt.gz1&&m.position.y<2.1&&((m.position.x<pt.x0+.3&&m.position.x>pt.x0-1.5)||(m.position.x>pt.x1-.3&&m.position.x<pt.x1+1.5))){G.host.egg('ow_goal','GOAL! The crowd (two pigeons) goes wild.');snd.fanfare();m.position.set(32,.42,35);b.v.set(0,0,0)}
  if(Math.abs(m.position.x)>99||m.position.z>91||m.position.z<-52){m.position.set(32,.42,35);b.v.set(0,0,0)}}
function lakeCheck(){const L=W.lake;if(!L)return;if(Math.hypot(P.pos.x-L.x,P.pos.z-L.z)<L.r-.6&&P.pos.y<.3&&!P.ride){snd.splash();G.host.egg('ow_lake','Splash! You can\'t swim in a portfolio.');fade(()=>{P.pos.set(64,0,45);P.vel.set(0,0,0);snapCam()})}}
function ambientTick(dt,T){if(G.cranes)for(const c of G.cranes){c.g.rotation.y+=c.sp*dt;}if(G.cranes&&G.cranes[0])G.cranes[0].red.material.color.set(Math.sin(T*3)>.4?'#ff2d2d':'#5a1010');
  if(W.snow){const a=W.snow.geometry.attributes.position,v=a.array;for(let i=0;i<v.length;i+=3){v[i+1]-=dt*(1.2+(i%7)*.12);v[i]+=Math.sin(T+i)*dt*.3;if(v[i+1]<0)v[i+1]+=26}a.needsUpdate=true;W.snow.position.set(P.pos.x,P.pos.y,P.pos.z)}
  if(W.signals){const t=T%16;for(const L of W.signals){const ns=L.axis==='ns';const ph=ns?(t<6.5?'g':t<8?'a':'r'):(t<8?'r':t<14.5?'g':'a');L.r.material.color.set(ph==='r'?'#ff2d2d':'#3a0d0d');L.a.material.color.set(ph==='a'?'#ffb300':'#3a2a05');L.g.material.color.set(ph==='g'?'#2ee66b':'#0b3a1a')}}
  if(W.booms)for(const b of W.booms){const near=P.world==='out'&&Math.abs(P.pos.x-b.x)<(b.w||5)+5&&P.pos.z>b.z-14&&P.pos.z<b.z+12;b.open+=((near?1:0)-b.open)*Math.min(1,dt*3);b.g.rotation.z=b.open*1.35}
  if(W.steam)W.steam.forEach(s=>{const k=(T*.4+s.userData.o)%1;const sa=W.steamAt||[0,0];s.position.set(sa[0]+Math.sin(k*9+s.userData.o*7)*.4,1.5+k*3,sa[1]+Math.cos(k*7)*.3);s.material.opacity=.45*(1-k);s.scale.setScalar(.6+k)});
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
function npcTick(dt,T){const px=P.pos.x,pz=P.pos.z,now=performance.now(),FC=drone.on?drone.focus:P.pos,FR=drone.on?95:75,FI=fire&&fire.active;
  for(const n of G.npcs){const c=n.c,p=c.position;const far=Math.hypot(p.x-FC.x,p.z-FC.z)>FR;c.visible=!far&&!n.hidden;if(far&&!(n.panic>0))continue;
    let sp=0,em=n.emote||null;
    if(n.panic>0){n.panic-=dt;if(FI&&!n.sit&&!n.lie&&n.kind!=='guide'){const dx=p.x-FI.x,dz=p.z-FI.z,d=Math.hypot(dx,dz)||1;if(d<44){sp=6.5;p.x+=dx/d*sp*dt;p.z+=dz/d*sp*dt;turn(c,Math.atan2(dx,dz),dt)}if(c.userData.legL)anim(c,dt,{speed:sp});continue}}
    if(n.kind==='wander'&&!party){if(n.faceT>0){n.faceT-=dt}else if(n.pause>0){n.pause-=dt}else{const t=n.path[n.pi];const dx=t[0]-p.x,dz=t[1]-p.z,d=Math.hypot(dx,dz);if(d<.4){n.pi=(n.pi+1)%n.path.length;if(Math.random()<.35)n.pause=1.5+Math.random()*3}else{sp=n.speed;p.x+=dx/d*sp*dt;p.z+=dz/d*sp*dt;turn(c,Math.atan2(dx,dz),dt)}}}
    else if(n.kind==='chase'){const dx=px-p.x,dz=pz-p.z,d=Math.hypot(dx,dz);
      if(n.flee>0){n.flee-=dt;sp=8;p.x-=dx/d*sp*dt;p.z-=dz/d*sp*dt;turn(c,Math.atan2(-dx,-dz),dt);em=null}
      else if(P.world==='out'&&d<10&&d>1.9&&now>(n.repel||0)){sp=3.4;p.x+=dx/d*sp*dt;p.z+=dz/d*sp*dt;turn(c,Math.atan2(dx,dz),dt);em=null}
      else if(d<=1.9&&P.world==='out'){turn(c,Math.atan2(dx,dz),dt);em='beg'}
      else{const hx=n.home[0]-p.x,hz=n.home[1]-p.z,hd=Math.hypot(hx,hz);if(hd>.5){sp=2;p.x+=hx/hd*sp*dt;p.z+=hz/hd*sp*dt;turn(c,Math.atan2(hx,hz),dt);em=null}}}
    else if(n.kind==='guide')sp=guideTick(n,dt);
    else if(n.kind==='dog'){const dx=px-p.x,dz=pz-p.z,d=Math.hypot(dx,dz);if(P.world==='out'&&d<14&&d>2.4){sp=Math.min(9,d*1.4);p.x+=dx/d*sp*dt;p.z+=dz/d*sp*dt;turn(c,Math.atan2(dx,dz),dt)}c.children[0].position.y=sp?Math.abs(Math.sin(T*14))*.08:0;continue}
    else if(n.kind==='cat'){continue}
    if(party&&(n.kind==='wander'||n.kind==='crowd'||n.kind==='chase')&&P.world==='out'){const pa=W.partyAt||[0,0],a=(n.ci||G.npcs.indexOf(n))*.7,tx=pa[0]+Math.cos(a)*(6+(a%3)),tz=pa[1]+Math.sin(a)*(6+(a%3)),dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d>.5&&n.kind!=='crowd'){sp=5;p.x+=dx/d*sp*dt;p.z+=dz/d*sp*dt;turn(c,Math.atan2(dx,dz),dt)}else em='dance'}
    if(n.lie){c.rotation.x=-Math.PI/2;p.y=.3}
    if(c.userData.legL)anim(c,dt,{speed:sp,sit:n.sit&&!sp,emote:sp?null:em})}}
function turn(c,ty,dt){let d=ty-c.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));c.rotation.y+=d*Math.min(1,dt*8)}
const STOPS=[{p:[[-120,141.5]],t:'Welcome to Vashupur, the capital. This is the bus stand: buses to all five other towns leave from here.'},{p:[[-120,128.5],[-62,128.5]],t:'The Fire Station, right next to the bus stand. Ring the bell outside, slide down the pole inside.'},{p:[[-26,128.5],[-26,110.5],[26,110.5],[140,110.5]],t:'The Boring Wear. Plain clothes, done properly. Walk in and have a look.'},{p:[[26,110.5],[9,96],[9,60]],t:'Outpulse Labs, my company. We build identity. The front door is right here.'},{p:[[9,9],[140,9]],t:'TOKI. Specialty coffee downstairs, my studio upstairs. Brew yourself a cup.'},{p:[[9,9],[-9,-9],[-141,-9]],t:'Outpulse Residential Towers. Two towers, thirteen floors of flats, lifts that actually work. Entry gate here, exit gate further on.'},{p:[[-9,-9],[39,-9]],t:'The Police Station. They arrested Scope Creep this morning.'},{p:[[100,-9]],t:'The Vashu Museum. My whole journey under one dome. Entry is free.'},{p:[[9,-9],[-9,9],[-53,30]],t:'The town square: my results in giant numbers, a phone booth and a DJ booth. Tour done, thanks for walking with me!'}];
function guideTick(n,dt){const c=n.c,p=c.position;if(!tour){const dx=-120-p.x,dz=141.5-p.z,d=Math.hypot(dx,dz);if(d>.5){p.x+=dx/d*5*dt;p.z+=dz/d*5*dt;turn(c,Math.atan2(dx,dz),dt);return 5}turn(c,Math.atan2(P.pos.x-p.x,P.pos.z-p.z),dt);return 0}
  const st=STOPS[tour.i];const wp=st.p[tour.w||0];const dx=wp[0]-p.x,dz=wp[1]-p.z,d=Math.hypot(dx,dz);const pd=Math.hypot(P.pos.x-p.x,P.pos.z-p.z);
  if(P.world!=='out'){return 0}
  if(d>.5){if(pd>11){if(!tour.kept){tour.kept=1;bubble(n,'Keep up!')}turn(c,Math.atan2(P.pos.x-p.x,P.pos.z-p.z),dt);return 0}tour.kept=0;p.x+=dx/d*5.2*dt;p.z+=dz/d*5.2*dt;turn(c,Math.atan2(dx,dz),dt);return 5.2}
  if((tour.w||0)<st.p.length-1){tour.w=(tour.w||0)+1;return 0}
  turn(c,Math.atan2(P.pos.x-p.x,P.pos.z-p.z),dt);
  if(tour.said!==tour.i&&pd<9){tour.said=tour.i;const last=tour.i===STOPS.length-1;dlg('Mini-Vashu (guide)',[st.t],[{t:last?'Thanks!':'Next stop',f:()=>{if(last){tour=null;G.host.egg('ow_tour','Completed the guided tour.')}else{tour.i++;tour.w=0}}}])}
  return 0}

/* ================= events: rally & concert ================= */
function eventTick(dt,T){if(!W.event){snd.setScene({concert:0,rally:false,party:party&&P.world==='out'&&Math.hypot(P.pos.x-(W.partyAt||[0,0])[0],P.pos.z-(W.partyAt||[0,0])[1])<40,indoor:P.world!=='out'?P.world:null});return}const ph=Math.floor(Date.now()/120000)%2;if(ph!==evPhase){evPhase=ph;setPhase()}
  const E=W.event,d=Math.hypot(P.pos.x-E.x,P.pos.z-E.z);const near=P.world==='out'&&d<24;
  W.stageLights.forEach((m,i)=>{const k=evPhase===1?(Math.sin(T*(RM?.5:2)+i)*.5+.5):.15;m.material.color.setHSL((i/5+(evPhase===1?T*.05:0))%1,.9,.3+.4*k)});
  if(evPhase===0){rallyT-=dt;if(near&&rallyT<=0){rallyT=4.6;const line=RALLY[rallyI%RALLY.length];rallyI++;sub('Shri Vaada Kumar',line);snd.gibber(line.length);W.crowd.forEach(c=>{c.emote=Math.random()<.5?'clap':null});if(P.state==='sit'&&P.seat&&P.seat.event){heard++;if(heard>=5)G.host.egg('ow_rally','You sat through a whole rally. Patience: maxed.')}}if(!near)sub(null)}
  else{sub(null);if(near){concertT+=dt;if(concertT>20)G.host.egg('ow_concert','You attended The Crema Boys live.')}}
  snd.setScene({concert:evPhase===1&&near?clamp(1-(d-8)/16,0,1):0,rally:evPhase===0&&near,party:party&&P.world==='out'&&Math.hypot(P.pos.x-(W.partyAt||[0,0])[0],P.pos.z-(W.partyAt||[0,0])[1])<40,indoor:P.world!=='out'?P.world:null})}
function setPhase(){const rally=evPhase===0;W.bannerMesh.material.map=rally?W.banner.rally:W.banner.concert;drawTex(W.bannerMesh.material.map);W.bannerMesh.material.needsUpdate=true;W.podium.visible=rally;W.politician.hidden=!rally;W.band.forEach(b=>b.hidden=rally);
  const seats=[1,2,4,7,8,10,13,15,19,22];G.chairs.forEach(c=>c.taken=false);
  W.crowd.forEach((n,i)=>{const p=n.c.position;if(rally){const ch=G.chairs[seats[i]];ch.taken=true;G.seats.filter(s=>s.event&&Math.abs(s.x-ch.x)<.1&&Math.abs(s.z-.05-ch.z)<.1).forEach(s=>s.taken=true);p.set(ch.x,.18,ch.z);n.c.rotation.y=0;n.sit=true;n.emote=null}else{n.sit=false;p.set(-36+(i%5)*4+Math.random(),0,53+Math.floor(i/5)*2.2);n.c.rotation.y=0;n.emote=i%3?'cheer':'dance'}})}
function sub(name,line){const s=$('.ow-sub');if(!name){s.hidden=true;return}s.hidden=false;s.innerHTML='<b></b> <span></span>';s.firstChild.textContent=name+':';s.lastChild.textContent=line}

/* ================= barks / bubbles ================= */
const bubs=[];function bark(){if(dlgState)return;const c=G.npcs.filter(n=>n.barks&&n.c.visible&&!n.hidden&&Math.hypot(n.c.position.x-P.pos.x,n.c.position.z-P.pos.z)<13);if(!c.length)return;const n=c[Math.floor(Math.random()*c.length)];bubble(n,n.barks[Math.floor(Math.random()*n.barks.length)])}
function bubble(n,text){if(bubs.length>2)bubs.shift().el.remove();const el=document.createElement('span');el.className='ow-bub';el.textContent=text;$('.ow-bubbles').appendChild(el);bubs.push({n,el,t:2.8})}
const pv=new THREE.Vector3();function bubblesTick(){for(let i=bubs.length-1;i>=0;i--){const b=bubs[i];b.t-=1/60;const p=b.n.c.position;pv.set(p.x,p.y+(b.n.lie?1:2.5),p.z).project(camera);
  if(b.t<=0||pv.z>1){b.el.remove();bubs.splice(i,1);continue}const r=root.getBoundingClientRect();b.el.style.transform=`translate(${(pv.x*.5+.5)*r.width}px,${(-pv.y*.5+.5)*r.height}px) translate(-50%,-100%)`}}

/* ================= zones & maps ================= */
function zoneCheck(){if(P.world!=='out')return;const T=TOWNS[curTown];const z=T.zones.find(z=>P.pos.x>z[1]&&P.pos.x<z[2]&&P.pos.z>z[3]&&P.pos.z<z[4]);zone(z?z[0]:'')}
let zt;function zone(name,force){if(name===zoneName&&!force)return;zoneName=name;if(!name)return;const el=$('.ow-zone');el.textContent=name;el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}
let MX0=-100,MZ0=-56,MW=200,MH=150;const MS=3;let bg;
function mapBG(){const T=TOWNS[curTown];bg=document.createElement('canvas');bg.width=MW*MS;bg.height=MH*MS;const x=bg.getContext('2d');const R=(x0,x1,z0,z1,c)=>{x.fillStyle=c;x.fillRect((x0-MX0)*MS,(z0-MZ0)*MS,(x1-x0)*MS,(z1-z0)*MS)};
  R(MX0,MX0+MW,MZ0,MZ0+MH,T.snow?'#e6edf2':'#79c267');for(const r of T.roads){if(r[4]==='x')R(r[0],r[1],r[2]-2,r[3]+2,'#cfc7b6');else R(r[0]-2,r[1]+2,r[2],r[3],'#cfc7b6')}for(const r of T.roads)R(r[0],r[1],r[2],r[3],'#545861');
  if(curTown==='vashupur'){R(-69,-37,40.7,72.7,'#e9dfca');const rd=T.round;x.fillStyle='#545861';x.beginPath();x.arc((rd.x-MX0)*MS,(rd.z-MZ0)*MS,rd.r1*MS,0,7);x.fill();x.fillStyle='#cfe3c0';x.beginPath();x.arc((rd.x-MX0)*MS,(rd.z-MZ0)*MS,rd.r0*MS,0,7);x.fill()}
  if(curTown==='memepura'){R(20,44,26,44,'#6dbb5c');x.fillStyle='#3fa7e0';x.beginPath();x.arc((64-MX0)*MS,(64-MZ0)*MS,13*MS,0,7);x.fill();R(22,94,9,9.6,'#141414')}
  if(curTown==='basti'){R(-46,-10,26,68,'#8fd07a');R(-40,-16,58,64,'#2b2b2b')}
  for(const p of(G.mapPolys||[])){x.fillStyle=p.col;x.beginPath();p.pts.forEach(([px,pz],i)=>{const X=(px-MX0)*MS,Y=(pz-MZ0)*MS;i?x.lineTo(X,Y):x.moveTo(X,Y)});x.closePath();x.fill()}
  for(const b of G.buildings)if(!b.poly)R(b.x0,b.x1,b.z0,b.z1,b.col);x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=2;for(const b of G.buildings)if(!b.poly)x.strokeRect((b.x0-MX0)*MS,(b.z0-MZ0)*MS,(b.x1-b.x0)*MS,(b.z1-b.z0)*MS);
  const bs=T.bus;x.fillStyle='#ffcc3a';x.fillRect((bs.x-MX0)*MS-9,(bs.z-MZ0)*MS-9,18,18);x.strokeStyle='#141414';x.lineWidth=3;x.strokeRect((bs.x-MX0)*MS-9,(bs.z-MZ0)*MS-9,18,18)}
function drawMini(){const c=$('.ow-map canvas'),x=c.getContext('2d'),W_=c.width,S=2.6;x.clearRect(0,0,W_,W_);x.fillStyle=TOWNS[curTown].snow?'#e6edf2':'#79c267';x.fillRect(0,0,W_,W_);
  if(P.world!=='out'){x.fillStyle='#141414';x.fillRect(0,0,W_,W_);x.fillStyle='#f4efe6';x.font='700 22px "Inter Tight",sans-serif';x.textAlign='center';x.fillText('INSIDE',W_/2,W_/2-8);x.font='600 16px "Inter Tight",sans-serif';const n=G.rooms[P.world].name;x.fillText(n.length>18?n.slice(0,17)+'…':n,W_/2,W_/2+18);return}
  const CX=drone.on?drone.pos.x:P.pos.x,CZ=drone.on?drone.pos.z:P.pos.z;x.save();x.translate(W_/2,W_/2);x.scale(S/MS,S/MS);x.translate(-(CX-MX0)*MS,-(CZ-MZ0)*MS);x.drawImage(bg,0,0);
  for(const b of G.beans)if(b.g.visible&&false){}
  x.restore();
  const dot=(wx,wz,col,r=5)=>{const sx=W_/2+(wx-CX)*S,sy=W_/2+(wz-CZ)*S;if(sx<0||sy<0||sx>W_||sy>W_)return;x.fillStyle=col;x.beginPath();x.arc(sx,sy,r,0,7);x.fill();x.strokeStyle='#141414';x.lineWidth=2;x.stroke()};
  const FI=fire&&fire.active;if(FI&&Math.sin(performance.now()/160)>-.3)dot(FI.x,FI.z,'#ff3b1f',7);if(drone.on)dot(P.pos.x,P.pos.z,'#ffffff',5);
  const g=G.npcs.find(n=>n.id==='guide');if(g)dot(g.c.position.x,g.c.position.z,'#ff6a3d',5);if(W.event)dot(W.event.x,W.event.z+8,evPhase?'#c9f26b':'#ffcc3a',6);
  x.save();x.translate(W_/2,W_/2);x.rotate(drone.on?-cam.yaw:-P.yaw+Math.PI);x.fillStyle=drone.on?'#3fa7e0':'#ffffff';x.strokeStyle='#141414';x.lineWidth=2.5;x.beginPath();x.moveTo(0,-10);x.lineTo(7,8);x.lineTo(0,4);x.lineTo(-7,8);x.closePath();x.fill();x.stroke();x.restore()}
function openMap(){const o=$('.ow-bigmap');o.hidden=false;const c=o.querySelector('canvas');const ar=MH/MW,w=Math.min(innerWidth-24,820,(innerHeight-130)/ar);c.width=w*2;c.height=w*2*ar;c.style.width=w+'px';c.style.height=w*ar+'px';o.querySelector('.k').textContent=TOWNS[curTown].name+' map · tap a building to walk there';const x=c.getContext('2d');x.drawImage(bg,0,0,c.width,c.height);const k=c.width/bg.width;
  x.font='800 '+Math.round(22*k/1.5)+'px "Bricolage Grotesque",sans-serif';x.textAlign='center';
  for(const b of G.buildings){if(!b.room)continue;const cx=((b.x0+b.x1)/2-MX0)*MS*k,cy=((b.z0+b.z1)/2-MZ0)*MS*k;x.lineWidth=6;x.strokeStyle='#141414';x.strokeText(b.short,cx,cy);x.fillStyle='#ffffff';x.fillText(b.short,cx,cy)}
  for(const [n,X,Z] of[['Event Ground',-28,48],['Lakeside Park',64,64],['Poster Street',58,3],['Town Square',0,-4]]){const cx=(X-MX0)*MS*k,cy=(Z-MZ0)*MS*k;x.lineWidth=6;x.strokeStyle='#141414';x.strokeText(n,cx,cy);x.fillStyle='#ffcc3a';x.fillText(n,cx,cy)}
  if(P.world==='out'){const cx=(P.pos.x-MX0)*MS*k,cy=(P.pos.z-MZ0)*MS*k;x.fillStyle='#ff3b3b';x.beginPath();x.arc(cx,cy,10,0,7);x.fill();x.lineWidth=4;x.strokeStyle='#fff';x.stroke()}}
function bigMapTap(e){if(P.world!=='out')return;const c=e.currentTarget,r=c.getBoundingClientRect();const wx=(e.clientX-r.left)/r.width*MW+MX0,wz=(e.clientY-r.top)/r.height*MH+MZ0;
  const b=G.buildings.find(b=>b.room&&wx>b.x0-2&&wx<b.x1+2&&wz>b.z0-2&&wz<b.z1+2);$('.ow-bigmap').hidden=true;
  if(b){setTarget(b.door.x,b.door.z,null);toast('WALKING TO',b.name)}else setTarget(wx,wz,null)}

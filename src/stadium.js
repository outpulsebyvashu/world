/* National Stadium events: football, concerts, boxing, Olympics, weddings.
   One shared schedule from the clock (4 minutes each), so every visitor sees the same event, score and result.
   Everything is built only while someone is near the stadium, and cleared when they leave. */
import {THREE,G,Batch,bx,cyl,col,tex,FONT_T,FONT_D,rng,CHM} from './core.js';
import {npc} from './world.js';
const PI=Math.PI,cx=-111.25,cz=60.8,FD=[-159,-63.5,32.9,88.7],TR=[-166,-56.4,25.8,95.6],SB=[-180.3,-42.6,12,106.6],SLOT=240;
export const ARTISTS=['Jatin Birbal','Chawanni','Dakaar','Lendrik Kumar','Raftaaar','SAZA','Arina Granade'];
const ALOOK={'Jatin Birbal':{shirt:'#f4f1ea',pants:'#3a4a6b',hair:'side',hairC:'#c9a25a',coat:'#d9d4c4'},'Chawanni':{shirt:'#ffcc3a',pants:'#141414',hair:'spiky',hairC:'#141414',shades:true},
  'Dakaar':{shirt:'#141414',pants:'#141414',hair:'buzz',beard:true,shades:true,coat:'#2b2b2b'},'Lendrik Kumar':{shirt:'#e94b3c',pants:'#2b2b2b',hair:'curly2',hairC:'#141414',beard:true},
  'Raftaaar':{shirt:'#2f5bff',pants:'#141414',hair:'cap',hat:'#141414',shades:true,beard:true},'SAZA':{shirt:'#c9f26b',pants:'#3a3a3a',hair:'long',hairC:'#3a2414',fem:true},'Arina Granade':{shirt:'#e9d8ff',skirt:'#e9d8ff',pants:'#e9d8ff',hair:'ponytail',hairC:'#8a5a3b',fem:true}};
const AWAY=[['DELULUGARH FC','#a463ff'],['MEMEPURA UNITED','#ff3b8d'],['BARFII CITY','#3d7be8'],['BASTI ROVERS','#8b1e2d'],['KAAPIKUNJ BREWERS','#1d3a8a']];
const FIGHTERS=['Iron Inder','Bullet Bablu','Thunder Tara','Rocky Rana','Toofan Tiwari','Golden Gauri','Lightning Lakhan','Kaali Aandhi'];
const COUPLES=[['Rohan','Isha'],['Kabir','Meera'],['Aditya','Tara'],['Dev','Riya'],['Arjun','Kavya'],['Sameer','Naina']];
const RUNNERS=[['Rocket Ravi','VASHUPUR','#ff6a3d'],['Speedy Sunita','KAAPIKUNJ','#8b6a4a'],['Zoom Zaid','MEMEPURA','#ff3b8d'],['Flash Fatima','BASTI','#8b1e2d'],['Turbo Tenzin','BARFII','#3d7be8'],['Cheetah Chetan','DELULUGARH','#a463ff']];
const KINDS=['football','concert','boxing','olympics','marriage'];
const SHIRTS=['#e94b3c','#3d7be8','#ffcc3a','#5cc46b','#ff8fc1','#ffffff','#8a63d2','#ff9933'],SKINS=['#c48a60','#8a5534','#e0b48a','#6b4226','#f1d2b6'],HAIRS=['short','long','bun','cap','curly2','side','spiky','bob'];
export function slotInfo(s){const kind=KINDS[((s%5)+5)%5],k=Math.floor(s/5);return{s,kind,artist:ARTISTS[k%ARTISTS.length],away:AWAY[k%AWAY.length],fighters:[FIGHTERS[(k*2)%8],FIGHTERS[(k*2+3)%8]],couple:COUPLES[k%COUPLES.length]}}
export function eventTitle(I){return I.kind==='football'?'Football: Vashupur XI vs '+I.away[0]:I.kind==='concert'?'Concert: '+I.artist+' live':I.kind==='boxing'?'Boxing: '+I.fighters[0]+' vs '+I.fighters[1]:I.kind==='olympics'?'Olympics: athletics finals':'Wedding: '+I.couple[0]+' weds '+I.couple[1]}
const clampF=(x,z)=>[Math.max(FD[0]-1,Math.min(FD[1]+1,x)),Math.max(FD[2]-1,Math.min(FD[3]+1,z))];
const turnTo=(c,a,dt)=>{let d=a-c.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));c.rotation.y+=d*Math.min(1,dt*9)};
/* move a character toward (x,z); returns the speed used (for the walk animation) */
function seek(n,x,z,sp,dt,face){const p=n.c.position,dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<.25){if(face!=null)turnTo(n.c,face,dt);return 0}const v=Math.min(sp,d*2.2),st=Math.min(d,v*dt);p.x+=dx/d*st;p.z+=dz/d*st;turnTo(n.c,Math.atan2(dx,dz),dt);return v}
/* a running track lane as a closed loop of points (rounded rectangle, inset o metres) */
function lanePath(o){const r=13-o,x0=TR[0]+o,x1=TR[1]-o,z0=TR[2]+o,z1=TR[3]-o,C=[[x1-r,z1-r,0],[x0+r,z1-r,PI/2],[x0+r,z0+r,PI],[x1-r,z0+r,1.5*PI]],pts=[];
  for(const [px,pz,a0] of C)for(let i=0;i<=8;i++){const a=a0+i/8*PI/2;pts.push([px+Math.cos(a)*r,pz+Math.sin(a)*r])}const L=[0];for(let i=1;i<=pts.length;i++){const a=pts[i-1],b=pts[i%pts.length];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]))}
  return{len:L[L.length-1],at(s){s=((s%L[L.length-1])+L[L.length-1])%L[L.length-1];let i=1;while(L[i]<s)i++;const a=pts[i-1],b=pts[i%pts.length],k=(s-L[i-1])/(L[i]-L[i-1]||1);return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]}}}

export function makeStadium({scene,snd,bubble,toast,P,camera}){
  let E=null,crowd=null,board=null,score=null,force=null,lastDraw=0,cheer=0,near=false;
  /* ---------- shared bits: crowd in the stands, the gate board, the big screen ---------- */
  function buildFixed(){const b=new Batch(),r=rng(99);
    for(const st of G.stands||[])for(let k=0;k<st.n;k++){const h=st.RISE*(k+1),p=st.inner+st.dir*st.DEP*(k+.62);for(let a=st.a0+.6;a<st.a1-.6;a+=.95){if(r()<.5)continue;
      const sc=SHIRTS[Math.floor(r()*SHIRTS.length)],sk=SKINS[Math.floor(r()*SKINS.length)],x=st.along==='x'?a:p,z=st.along==='x'?p:a;bx(b,x,h+.6,z,.48,.6,.34,sc,st.yaw);bx(b,x,h+1.05,z,.3,.3,.3,sk,st.yaw);bx(b,x,h+1.22,z,.32,.08,.32,'#1d1d1d',st.yaw)}}
    crowd=b.mesh(CHM);scene.add(crowd);
    const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return{c,g:c.getContext('2d'),t}};
    board=mk(1024,300);const bm=new THREE.Mesh(new THREE.PlaneGeometry(9,2.64),new THREE.MeshBasicMaterial({map:board.t}));bm.position.set(-41.86,5.4,46.6);bm.rotation.y=PI/2;scene.add(bm);
    const pb=new Batch();for(const z of[42.4,50.8])bx(pb,-42.05,3.4,z,.2,6.8,.2,'#2b2d31');bx(pb,-41.95,5.4,46.6,.12,2.9,9.3,'#141414');const pm=pb.mesh(CHM);scene.add(pm);
    score=mk(1024,500);const sm=new THREE.Mesh(new THREE.PlaneGeometry(19.6,9.6),new THREE.MeshBasicMaterial({map:score.t}));sm.position.set(-178.2,12.1,cz);sm.rotation.y=PI/2;scene.add(sm)}
  function drawBoards(I,t,force){const now=Date.now();if(!force&&now-lastDraw<1000)return;lastDraw=now;const nx=slotInfo(I.s+1),left=Math.max(0,Math.ceil(SLOT-t));
    {const {g,c,t:tx}=board,w=c.width,h=c.height;g.fillStyle='#0d0f12';g.fillRect(0,0,w,h);g.fillStyle='#ff9933';g.fillRect(0,0,w,8);g.fillStyle='#138808';g.fillRect(0,h-8,w,8);
      g.fillStyle='#ff9933';g.font='700 30px '+FONT_T;g.fillText('NATIONAL STADIUM · NOW ON',30,56);g.fillStyle='#ffffff';fit(g,eventTitle(I).toUpperCase(),w-60,74,FONT_D);g.fillText(eventTitle(I).toUpperCase(),30,150);
      g.fillStyle='#c9f26b';g.font='700 30px '+FONT_T;g.fillText((E&&E.status?E.status(t):'')||'',30,206);g.fillStyle='#9aa3ad';g.font='600 28px '+FONT_T;g.fillText('NEXT in '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0')+' · '+eventTitle(nx),30,262);tx.needsUpdate=true}
    {const {g,c,t:tx}=score,w=c.width,h=c.height;g.fillStyle='#0d0f12';g.fillRect(0,0,w,h);g.textAlign='center';g.fillStyle='#ff9933';g.font='400 60px '+FONT_D;g.fillText('NATIONAL STADIUM',w/2,80);
      const L=E&&E.screen?E.screen(t):[eventTitle(I)];g.fillStyle='#ffffff';L.forEach((l,i)=>{const big=i===0;g.font=big?'400 110px '+FONT_D:'700 42px '+FONT_T;fit(g,l,w-60,big?110:42,big?FONT_D:FONT_T,big?'400 ':'700 ');g.fillStyle=i===0?'#ffffff':i===1?'#c9f26b':'#ffffff';g.fillText(l,w/2,big?220:300+(i-1)*56)});
      g.textAlign='left';tx.needsUpdate=true}}
  function fit(g,s,maxW,size,font,wt='400 '){let z=size;g.font=wt+z+'px '+font;while(g.measureText(s).width>maxW&&z>16){z-=4;g.font=wt+z+'px '+font}}
  /* ---------- per-event scaffolding ---------- */
  function begin(I){const objs=[],npcs=[],cols=new Set();const r=rng(I.s*13+7);
    const ev={I,r,objs,npcs,
      add(o){scene.add(o);objs.push(o);return o},
      batch(fn){const b=new Batch();const n0=G.colliders.length;fn(b);for(let i=n0;i<G.colliders.length;i++)cols.add(G.colliders[i]);const m=b.mesh(CHM);m.castShadow=true;m.receiveShadow=true;return ev.add(m)},
      glow(fn){const b=new Batch();fn(b);return ev.add(b.mesh(new THREE.MeshBasicMaterial({vertexColors:true})))},
      person(cfg){const n=npc(scene,Object.assign({barks:['Wooo!','Let\'s go!'],lines:['What a day at the stadium!']},cfg));n.far=210;n.spd=0;n.act=()=>n.spd;npcs.push(n);return n},
      look(i,o={}){return Object.assign({shirt:SHIRTS[i%SHIRTS.length],skin:SKINS[(i*3)%SKINS.length],pants:['#141414','#3a4a6b','#6b5a3a'][i%3],hair:HAIRS[(i*5)%HAIRS.length],face:['grin','smile','o','smug'][i%4],fem:i%2===1},o)},
      fieldCrowd(x0,x1,z0,z1,n){const b=new Batch();for(let i=0;i<n;i++){const x=x0+r()*(x1-x0),z=z0+r()*(z1-z0),ry=-PI/2+(r()-.5)*.6;bx(b,x,1.05,z,.5,.7,.34,SHIRTS[i%SHIRTS.length],ry);bx(b,x,.38,z,.42,.76,.3,['#141414','#3a4a6b'][i%2],ry);bx(b,x,1.62,z,.32,.32,.32,SKINS[i%SKINS.length],ry);if(i%3===0)bx(b,x,2.05,z,.12,.5,.12,SKINS[i%SKINS.length],ry)}
        const m=b.mesh(CHM);ev.add(m);return m},
      clear(){for(const o of objs){scene.remove(o);o.traverse(m=>{if(m.geometry)m.geometry.dispose()})}for(const n of npcs){scene.remove(n.c);let i=G.npcs.indexOf(n);if(i>=0)G.npcs.splice(i,1);i=G.pick.indexOf(n.c);if(i>=0)G.pick.splice(i,1)}
        for(const c of cols){const i=G.colliders.indexOf(c);if(i>=0)G.colliders.splice(i,1)}}};
    return ev}
  const kick=()=>{if(P.world==='out'&&Math.hypot(P.pos.x-cx,P.pos.z-cz)<70)snd.kick()};

  /* =============================== FOOTBALL ===============================
     Real ball physics (rolling, lofted passes, shots, bounces), players that accelerate, run onto passes,
     press and tackle; keepers that dive; throw-ins, goal kicks and kick-offs. The score still follows the
     shared schedule, so every visitor sees the same result: scheduled goals go in, other shots are saved or miss. */
  function football(ev){const {I,r}=ev;const teams=[{name:'VASHUPUR XI',col:'#ff6a3d',sh:'#ffffff',gk:'#ffcc3a',dir:1},{name:I.away[0],col:I.away[1],sh:'#141414',gk:'#5cc46b',dir:-1}];
    const goals=[];{let tt=12;const n=1+Math.floor(r()*4);for(let i=0;i<n;i++){tt+=22+r()*36;if(tt>222)break;goals.push({t:tt,team:r()<.56?0:1,done:false})}}
    const sc=t=>[0,1].map(k=>goals.filter(g=>g.t<=t&&g.team===k).length);
    const L=FD[1]-FD[0],Wd=FD[3]-FD[2],GL=d=>d>0?FD[1]-.6:FD[0]+.6,BR=.32,GRAV=12;
    const FORM=[[.03,0],[.2,-.62],[.17,-.22],[.17,.22],[.2,.62],[.42,-.66],[.38,-.22],[.38,.22],[.42,.66],[.62,-.22],[.62,.22]];
    const home=(tm,f)=>[tm.dir>0?FD[0]+f[0]*L:FD[1]-f[0]*L,cz+f[1]*Wd/2*.9];
    const PL=[];teams.forEach((tm,ti)=>FORM.forEach((f,i)=>{const [x,z]=home(tm,[Math.min(f[0],.46),f[1]]);const n=ev.person({name:(i?'#'+(i+1):'Goalkeeper')+' · '+tm.name,look:ev.look(ti*11+i,{shirt:i?tm.col:tm.gk,pants:tm.sh,shoes:'#141414',fem:false,long:!i,hair:['short','buzz','spiky','curly2','side'][(ti*11+i*3)%5],hat:null}),x,z,yaw:tm.dir*PI/2,
      lines:i?['Eyes on the ball, not on me.','We train at the parking lot. Mind the cars.']:['I see everything. Except the ones that go in.'],barks:['Pass!','Man on!','Here!','Shoot!','Square it!']});n.team=ti;n.f=f;n.gk=!i;n.vx=0;n.vz=0;n.max=6.6+r()*1.2;n.cool=0;n.kickT=0;PL.push(n)}));
    const ref=ev.person({name:'Referee',look:{shirt:'#141414',pants:'#141414',hair:'buzz',face:'flat'},x:cx,z:cz+8,yaw:0,lines:['Play on!','That was not a foul. That was a hug.'],barks:['Play on!','Advantage!']});ref.vx=ref.vz=0;ref.max=6;
    const lines=[FD[2]-1.5,FD[3]+1.5].map((z,i)=>{const n=ev.person({name:'Assistant referee',look:{shirt:'#ffcc3a',pants:'#141414',hair:'short',face:'flat'},x:cx,z,yaw:i?PI:0,lines:['Offside? I will think about it.'],barks:['Flag!']});n.vx=n.vz=0;n.max=6;
      const f=new THREE.Mesh(new THREE.BoxGeometry(.04,.34,.3),new THREE.MeshLambertMaterial({color:'#ffcc3a'}));f.position.set(0,-.62,.25);n.c.userData.armR.add(f);return n});
    /* the ball: white with black patches, a soft blob shadow so you can always see where it is */
    const bg=new THREE.IcosahedronGeometry(BR,2),pa=bg.attributes.position,cols=new Float32Array(pa.count*3),dirs=[],ip=new THREE.IcosahedronGeometry(1,0).attributes.position;
    for(let i=0;i<ip.count;i++){const v=new THREE.Vector3().fromBufferAttribute(ip,i).normalize();if(!dirs.some(d=>d.distanceTo(v)<.01))dirs.push(v)}
    const cv=new THREE.Vector3();for(let f=0;f<pa.count;f+=3){cv.set(0,0,0);for(let k=0;k<3;k++)cv.add(new THREE.Vector3().fromBufferAttribute(pa,f+k));cv.normalize();const blk2=dirs.some(d=>d.dot(cv)>.955),c=blk2?.06:.95;for(let k=0;k<3;k++)cols.set([c,c,c],(f+k)*3)}
    bg.setAttribute('color',new THREE.BufferAttribute(cols,3));const ball=ev.add(new THREE.Mesh(bg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45,flatShading:true})));ball.castShadow=true;
    const blob=ev.add(new THREE.Mesh(new THREE.CircleGeometry(.36,20),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.38,depthWrite:false})));blob.rotation.x=-PI/2;blob.renderOrder=2;
    const B={x:cx,y:BR,z:cz,vx:0,vy:0,vz:0,own:null,last:0,recv:null,goalShot:false};
    ev.dbg=()=>({mode,x:+B.x.toFixed(1),z:+B.z.toFixed(1),y:+B.y.toFixed(2),own:B.own?B.own.name:null});
    let mode='kick',modeT=3,kickTeam=0,restart=null,celeb=0,scorer=null,force=null,holdT=1,whistled=false,ftDone=false;
    const D2=(a,x,z)=>Math.hypot(a.c.position.x-x,a.c.position.z-z);
    const whistle=()=>{if(near&&snd.whistle)snd.whistle()};
    function strike(p,tx,tz,speed,lift){B.own=null;const dx=tx-B.x,dz=tz-B.z,d=Math.hypot(dx,dz)||1;B.vx=dx/d*speed;B.vz=dz/d*speed;B.vy=lift;B.last=p.team;p.kickT=.35;p.cool=.5;kick()}
    function pass(p,q,lofted){const tx=q.c.position.x+q.vx*.8,tz=q.c.position.z+q.vz*.8,d=Math.hypot(tx-B.x,tz-B.z);B.recv=q;q.runTo=[tx,tz];
      if(lofted){const vy=8.5,tf=2*vy/GRAV;strike(p,tx,tz,d*.9/tf,vy)}else strike(p,tx,tz,Math.min(24,Math.sqrt(20+8.5*d)),0)}
    function shoot(p,goal){const tm=teams[p.team],gx=GL(tm.dir),gk=PL.find(q=>q.team!==p.team&&q.gk),side=gk.c.position.z>cz?-1:1;
      if(goal){B.goalShot=true;gk.dive={side:-side,t:0};strike(p,gx+tm.dir*1.5,cz+side*(2.4+r()*.8),25,2.2+r()*1.2);bubble(p,'Shoot!')}
      else if(r()<.5){B.goalShot=false;strike(p,gx+tm.dir*2,cz+(r()<.5?-1:1)*(4.6+r()*3),23,1.5+r()*3.5)}
      else{B.goalShot=false;const gz=gk.c.position.z;gk.save=true;strike(p,gx,gz+(r()-.5)*1.4,21,1+r()*1.6)}}
    function setMode(m,t){mode=m;modeT=t}
    ev.status=t=>{const s=sc(t);return t>=232?'FULL TIME · '+s[0]+' – '+s[1]:Math.min(90,Math.floor(t/232*90))+"' · VASHUPUR XI "+s[0]+' – '+s[1]+' '+I.away[0]};
    ev.screen=t=>{const s=sc(t);return[s[0]+'  –  '+s[1],'VASHUPUR XI  vs  '+I.away[0],t>=232?'FULL TIME':Math.min(90,Math.floor(t/232*90))+"'  ·  LIVE"]};
    ev.music={rally:true};
    function move(n,x,z,sp,dt,lookX,lookZ){[x,z]=[Math.max(FD[0]-3,Math.min(FD[1]+3,x)),Math.max(FD[2]-3,Math.min(FD[3]+3,z))];const p=n.c.position,dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);
      const want=d<.35?0:Math.min(sp,d*1.6),tx=d>.01?dx/d*want:0,tz=d>.01?dz/d*want:0,k=Math.min(1,dt*4.5);n.vx+=(tx-n.vx)*k;n.vz+=(tz-n.vz)*k;p.x+=n.vx*dt;p.z+=n.vz*dt;
      const v=Math.hypot(n.vx,n.vz);if(v>.9)turnTo(n.c,Math.atan2(n.vx,n.vz),dt);else if(lookX!=null)turnTo(n.c,Math.atan2(lookX-p.x,lookZ-p.z),dt);n.spd=v;return v}
    ev.tick=(dt,t,T)=>{
      for(const p of PL){if(p.kickT>0)p.kickT-=dt;if(p.cool>0)p.cool-=dt;if(p.dive){const tm=teams[p.team];p.dive.t+=dt;const k=Math.min(1,p.dive.t/.25);p.c.rotation.z=-p.dive.side*1.2*k*tm.dir;p.c.position.z+=p.dive.side*dt*(p.dive.t<.4?6:0);p.c.position.y=.2*k;if(p.dive.t>1.2){p.dive=null;p.c.rotation.z=0;p.c.position.y=0}}}
      /* ---- full time ---- */
      if(t>=232){if(!ftDone){ftDone=true;whistle();setTimeout(whistle,400);setTimeout(whistle,800)}const s=sc(t),win=s[0]===s[1]?-1:s[0]>s[1]?0:1;PL.forEach(p=>{move(p,p.c.position.x,p.c.position.z,0,dt);p.spd=0;p.emote=win<0?'clap':p.team===win?'cheer':null});ref.spd=0;lines.forEach(l=>l.spd=0);return}
      /* ---- scheduled goal: make sure the scoring side has the ball in the last few seconds before it ---- */
      if(!force){const g=goals.find(g=>!g.done&&t>=g.t-9);if(g){if(t>g.t+14)g.done=true;else force=g}}
      if(force&&t>force.t+14&&mode==='play'){force.done=true;force=null}
      /* ---- dead-ball phases ---- */
      if(mode==='goal'){celeb-=dt;PL.forEach(p=>{const tm=teams[p.team];if(p.team===scorer.team&&!p.gk){const s=scorer.c.position;move(p,s.x-tm.dir*(1+Math.abs(p.f[1])*2),s.z+p.f[1]*2.5,5,dt);p.emote='cheer'}else{const [x,z]=home(tm,[Math.min(p.f[0],.46),p.f[1]]);move(p,x,z,2.5,dt);p.emote=null}});
        if(celeb<=0){kickTeam=1-scorer.team;B.own=null;Object.assign(B,{x:cx,y:BR,z:cz,vx:0,vy:0,vz:0});setMode('kick',3.5);PL.forEach(p=>p.emote=null)}}
      else if(mode==='kick'){modeT-=dt;PL.forEach(p=>{const tm=teams[p.team];let [x,z]=home(tm,[Math.min(p.f[0],.46),p.f[1]]);if(p.team===kickTeam&&p.f[0]>.6){x=cx-tm.dir*(p.f[1]>0?.7:3);z=cz+(p.f[1]>0?0:-1.5)}move(p,x,z,4.5,dt,B.x,B.z)});
        if(modeT<=0){const tk=PL.filter(p=>p.team===kickTeam&&!p.gk).sort((a,b)=>D2(a,cx,cz)-D2(b,cx,cz))[0];whistle();bubble(ref,'Kick off!');B.own=tk;holdT=.6;setMode('play',0)}}
      else if(mode==='out'){modeT-=dt;const R=restart,tk=R.taker;move(tk,R.x,R.z,6.5,dt,cx,cz);
        PL.forEach(p=>{if(p===tk)return;const tm=teams[p.team];let [x,z]=home(tm,p.f);x+=(R.x-cx)*.5;z+=(R.z-cz)*.3;move(p,x,z,4,dt,R.x,R.z)});
        if(modeT<=0&&(D2(tk,R.x,R.z)<1.2||modeT<-4)){tk.c.position.x=R.x;tk.c.position.z=R.z;Object.assign(B,{x:R.x,z:R.z,y:R.type==='throw'?2:BR,vx:0,vy:0,vz:0});
          const mates=PL.filter(q=>q.team===tk.team&&q!==tk&&!q.gk).sort((a,b)=>R.type==='goal'?Math.abs(D2(a,R.x,R.z)-32)-Math.abs(D2(b,R.x,R.z)-32):D2(a,R.x,R.z)-D2(b,R.x,R.z));
          const q=mates[Math.floor(r()*Math.min(3,mates.length))];if(R.type==='throw'){tk.emote='cheer';setTimeout(()=>{tk.emote=null},400)}pass(tk,q,R.type==='goal');setMode('play',0)}}
      else{/* ---- open play ---- */
        const o=B.own;
        if(o){const tm=teams[o.team],gx=GL(tm.dir),p=o.c.position;holdT-=dt;
          const opp=PL.filter(q=>q.team!==o.team).sort((a,b)=>D2(a,p.x,p.z)-D2(b,p.x,p.z))[0];const od=D2(opp,p.x,p.z);
          let tz=cz+(p.z-cz)*.8;if(od<4.5){tz=p.z+(p.z>opp.c.position.z?3:-3)}const forceMe=force&&force.team===o.team;
          if(o.gk)move(o,p.x,p.z,0,dt,cx,cz);else move(o,gx-tm.dir*(forceMe?16:4),tz,forceMe?6.4:5.6,dt);
          const fx=Math.sin(o.c.rotation.y),fz=Math.cos(o.c.rotation.y),lead=.62+.2*Math.abs(Math.sin(T*7.5));B.x+=(p.x+fx*lead-B.x)*Math.min(1,dt*14);B.z+=(p.z+fz*lead-B.z)*Math.min(1,dt*14);B.y=o.gk?1.1:BR;B.vx=o.vx;B.vz=o.vz;B.vy=0;
          if(holdT<=0){const dG=Math.abs(gx-p.x),wide=Math.abs(p.z-cz);
            if(forceMe&&dG<30){shoot(o,true);scorer=o}
            else if(!forceMe&&!o.gk&&dG<25&&wide<15&&r()<.5)shoot(o,false);
            else{const mates=PL.filter(q=>q.team===o.team&&q!==o&&!q.gk),score=q=>{const qp=q.c.position,prog=(qp.x-p.x)*tm.dir,d=Math.hypot(qp.x-p.x,qp.z-p.z),free=Math.min(8,...PL.filter(z=>z.team!==o.team).map(z=>D2(z,qp.x,qp.z)));return prog*.6+free*1.6-(d>38?30:0)-(d<5?20:0)+(r()*6)};
              const q=mates.sort((a,b)=>score(b)-score(a))[0];if(o.gk||od<3.2||r()<.75){const d=D2(q,p.x,p.z);pass(o,q,d>27)}else holdT=.5+r()*.8}
            holdT=.7+r()*1.6}
          /* tackles: a presser close enough knocks it loose */
          if(B.own&&od<1.05&&opp.cool<=0&&!opp.gk&&!(forceMe)&&r()<dt*(force&&opp.team===force.team?4:1.1)){B.own=null;const a=Math.atan2(p.x-opp.c.position.x,p.z-opp.c.position.z)+(r()-.5);B.vx=Math.sin(a)*5;B.vz=Math.cos(a)*5;B.vy=.5;B.last=opp.team;o.cool=.8;bubble(opp,'Mine!')}}
        else{/* loose ball physics */
          B.vy-=GRAV*dt;B.x+=B.vx*dt;B.y+=B.vy*dt;B.z+=B.vz*dt;if(B.y<BR){B.y=BR;B.vy=B.vy<-2?-B.vy*.45:0}
          if(B.y<=BR+.02){const sp=Math.hypot(B.vx,B.vz);if(sp>0){const ns=Math.max(0,sp-(2+sp*.22)*dt);B.vx*=ns/sp;B.vz*=ns/sp}}
          /* keepers: dive for scheduled goals (and miss), save everything else on target */
          for(const gk of PL.filter(q=>q.gk)){const tm=teams[gk.team],own=GL(-tm.dir),toward=(B.vx*-tm.dir)>2,d=D2(gk,B.x,B.z);
            if(!gk.dive&&toward&&!B.goalShot&&Math.abs(B.x-own)<14&&d<1.7&&B.y<2.6){B.own=gk;B.vx=B.vz=B.vy=0;holdT=1.4;gk.save=false;bubble(gk,'Saved!');cheer=Math.max(cheer,1.5)}}
          /* who can take it */
          if(!B.own&&B.y<1.3)for(const p of PL){if(p.cool>0||p.gk)continue;if(D2(p,B.x,B.z)<.95){const sp=Math.hypot(B.vx,B.vz);if(p===B.recv||p.team===B.last||sp<13){B.own=p;B.recv=null;holdT=.4+r()*1.2;p.runTo=null;break}}}
          /* goal or out of play */
          const side=B.x>cx?1:-1;
          if(Math.abs(B.x-cx)>L/2-.6){const att=teams.findIndex(tm=>tm.dir===side),mouth=Math.abs(B.z-cz)<3.66&&B.y<2.44;
            if(mouth&&B.goalShot&&force&&force.team===att){B.vx*=.1;B.vz*=.1;B.vy=0;B.x=GL(side)+side*1.4;force.done=true;force=null;B.goalShot=false;celeb=5;cheer=6;whistle();setMode('goal',0);scorer=scorer&&scorer.team===att?scorer:PL.find(p=>p.team===att&&!p.gk);scorer.emote='cheer';bubble(scorer,'GOAL!');
              if(near)toast('GOAL!',(att?I.away[0]:'Vashupur XI')+' score! '+sc(t+1).join(' – '))}
            else{const def=1-att,gk=PL.find(p=>p.team===def&&p.gk);restart={type:'goal',taker:gk,x:GL(side)-side*5.5,z:cz+(B.z>cz?3:-3)};B.goalShot=false;setMode('out',1.6);bubble(ref,'Goal kick!')}}
          else if(B.z<FD[2]+.4||B.z>FD[3]-.4){const tm=1-B.last,z=B.z<cz?FD[2]+.3:FD[3]-.3,x=Math.max(FD[0]+3,Math.min(FD[1]-3,B.x));restart={type:'throw',taker:PL.filter(p=>p.team===tm&&!p.gk).sort((a,b)=>D2(a,x,z)-D2(b,x,z))[0],x,z};setMode('out',1.4);bubble(ref,'Throw-in!')}}
        /* everyone else */
        const own=B.own,poss=own?own.team:-1;
        const chase=[0,1].map(ti=>PL.filter(q=>q.team===ti&&!q.gk&&q!==own).sort((a,b)=>D2(a,B.x,B.z)-D2(b,B.x,B.z)));
        for(const p of PL){if(p===own)continue;const tm=teams[p.team];let x,z,sp=4;p.emote=null;
          if(p.gk){if(p.dive)continue;const gl=GL(-tm.dir);x=gl+tm.dir*(Math.abs(B.x-gl)<25?2.6:1.4);const lead=Math.abs(B.vx)>1?(gl-B.x)/B.vx:0,pz=B.z+B.vz*Math.max(0,Math.min(1.2,lead));z=cz+Math.max(-3.3,Math.min(3.3,pz-cz));sp=7}
          else if(p.runTo&&B.recv===p&&!own){[x,z]=p.runTo;sp=p.max;const d=D2(p,B.x,B.z);if(d<6){x=B.x+B.vx*.15;z=B.z+B.vz*.15}}
          else if(!own&&(chase[p.team][0]===p)){x=B.x+B.vx*.35;z=B.z+B.vz*.35;sp=p.max}
          else if(own&&poss!==p.team&&chase[p.team][0]===p){x=B.x;z=B.z;sp=p.max}
          else if(own&&poss!==p.team&&chase[p.team][1]===p){const gl=GL(-tm.dir);x=B.x+(gl-B.x)*.25;z=B.z+(cz-B.z)*.25;sp=6}
          else{[x,z]=home(tm,p.f);x+=(B.x-cx)*.55+(poss===p.team?tm.dir*8:poss>=0?-tm.dir*2:0);z+=(B.z-cz)*.35;if(poss===p.team&&p.f[0]>.55){const lim=GL(tm.dir)-tm.dir*9;x=B.x+tm.dir*10;if((x-lim)*tm.dir>0)x=lim}sp=Math.hypot(x-p.c.position.x,z-p.c.position.z)>8?5.5:3.4}
          move(p,x,z,sp,dt,B.x,B.z)}}
      /* officials */
      move(ref,Math.max(FD[0]+5,Math.min(FD[1]-5,B.x-7)),Math.max(FD[2]+3,Math.min(FD[3]-3,B.z+(B.z>cz?-9:9))),ref.max,dt,B.x,B.z);
      move(lines[0],Math.max(cx,Math.min(FD[1]-2,B.x)),FD[2]-1.5,6,dt,B.x,B.z);move(lines[1],Math.min(cx,Math.max(FD[0]+2,B.x)),FD[3]+1.5,6,dt,B.x,B.z);
      /* draw the ball */
      ball.position.set(B.x,B.y,B.z);ball.rotation.x+=B.vz*dt/BR;ball.rotation.z-=B.vx*dt/BR;blob.position.set(B.x,.075,B.z);const hs=1/(1+(B.y-BR)*.35);blob.scale.set(hs,hs,hs);blob.material.opacity=.38*hs}}

  /* =============================== CONCERT =============================== */
  function concert(ev){const {I,r}=ev,SX=-152,ART=I.artist;
    ev.batch(b=>{bx(b,SX,.8,cz,12,1.6,26,'#141414');col(SX-6,SX+6,0,1.6,cz-13,cz+13);bx(b,SX+6.2,.8,cz,.4,1.6,26,'#2b2b2b');
      for(const [x,z] of[[SX-5.6,cz-12.6],[SX-5.6,cz+12.6],[SX+5.6,cz-12.6],[SX+5.6,cz+12.6]]){bx(b,x,7,z,.5,14,.5,'#9aa3ad');col(x-.3,x+.3,0,14,z-.3,z+.3)}
      bx(b,SX-5.6,14,cz,.6,.6,25.8,'#9aa3ad');bx(b,SX+5.6,14,cz,.6,.6,25.8,'#9aa3ad');bx(b,SX,14,cz-12.6,11.8,.6,.6,'#9aa3ad');bx(b,SX,14,cz+12.6,11.8,.6,.6,'#9aa3ad');
      for(const s of[-1,1]){bx(b,SX+3,4.6,cz+s*15,2.4,6,2.4,'#1d1d1d');for(let k=0;k<4;k++){const g=new THREE.CylinderGeometry(.55,.55,.1,16);g.rotateZ(PI/2);g.translate(SX+4.25,2.6+k*1.3,cz+s*15);b.add(g,'#3a3a3a')}col(SX+1.8,SX+4.2,0,7.6,cz+s*15-1.2,cz+s*15+1.2)}
      for(let z=cz-14;z<=cz+14;z+=1.4){bx(b,SX+9,.55,z,.1,1.1,1.3,'#9aa3ad')}col(SX+8.9,SX+9.1,0,1.1,cz-14,cz+14)});
    const cv=document.createElement('canvas');cv.width=768;cv.height=320;const g=cv.getContext('2d'),led=new THREE.CanvasTexture(cv);led.colorSpace=THREE.SRGBColorSpace;
    const scr=ev.add(new THREE.Mesh(new THREE.PlaneGeometry(22,9.2),new THREE.MeshBasicMaterial({map:led})));scr.position.set(SX-5.4,7.4,cz);scr.rotation.y=PI/2;
    const beams=[];for(let i=0;i<8;i++){const L=34,m=new THREE.Mesh(new THREE.ConeGeometry(3.4,L,14,1,true),new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(i/8,.9,.6),transparent:true,opacity:.11,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
      m.geometry.translate(0,-L/2,0);const g2=new THREE.Group();g2.position.set(SX+5.6,13.6,cz-11+i*22/7);g2.add(m);ev.add(g2);beams.push(g2)}
    ev.glow(b=>{for(let i=0;i<8;i++)bx(b,SX+5.6,13.6,cz-11+i*22/7,.6,.5,.6,'#ffffff')});
    const star=ev.person({name:ART,look:Object.assign({face:'grin'},ALOOK[ART]||{}),x:SX+2,y:1.6,z:cz,yaw:PI/2,held:null,lines:['Thank you, Vashupur! You are the loudest town on the map.','Next song is for the bus stand vendors. Chai chai chai!'],barks:['Make some noise!','Vashupur!']});
    {const mic=new THREE.Mesh(new THREE.CylinderGeometry(.05,.04,.3,8),new THREE.MeshLambertMaterial({color:'#1d1d1d'}));mic.position.set(0,-.66,.12);mic.rotation.x=PI/2;star.c.userData.armR.add(mic)}
    const dancers=[-1,1].map((s,i)=>ev.person({name:'Backup dancer',look:ev.look(i+3,{shirt:'#141414',pants:'#141414'}),x:SX-1.5,y:1.6,z:cz+s*5,yaw:PI/2,emote:'dance',lines:['Five, six, seven, eight!'],barks:['Yeah!']}));
    const fans=[];for(let i=0;i<14;i++){const n=ev.person({name:'Fan',look:ev.look(i),x:SX+10+r()*7,z:cz-11+r()*22,yaw:-PI/2,emote:['cheer','dance','wave'][i%3],lines:['I queued since morning for '+ART+'!','Best concert of my life. Until the next one.'],barks:[ART+'!','Encore!','Wooo!']});fans.push(n)}
    const mob=ev.fieldCrowd(SX+17,SX+40,cz-16,cz+16,170);
    const LINES=['Make some noise, Vashupur!','This one is for the bus stand vendors!','Put your phones up!','Ek baar aur!','Vashupur, I love you!','Choupati, are you there?'];let li=0,lt=3,dir=1;
    ev.status=t=>'LIVE ON STAGE · '+ART;ev.screen=t=>[ART.toUpperCase(),'LIVE IN VASHUPUR','TONIGHT AT THE NATIONAL STADIUM'];
    ev.music={concert:1};
    ev.tick=(dt,t,T)=>{const p=star.c.position;if(Math.abs(p.z-cz)>8)dir=-Math.sign(p.z-cz);star.spd=0;p.z+=dir*dt*1.1;star.c.rotation.y=PI/2;star.emote=['sing','dance','sing','wave','sing','cheer'][Math.floor(t/5)%6];
      lt-=dt;if(lt<=0){lt=6+r()*3;bubble(star,LINES[li++%LINES.length])}
      beams.forEach((b,i)=>{b.rotation.set(Math.sin(T*.9+i)*.5,0,-.7+Math.sin(T*1.3+i*.7)*.35);b.children[0].material.color.setHSL((i/8+T*.05)%1,.9,.6)});
      mob.position.y=Math.abs(Math.sin(T*7.5))*.18;cheer=Math.max(cheer,.5);
      if(Math.floor(T*10)!==ev.lf){ev.lf=Math.floor(T*10);const w=cv.width,h=cv.height;g.fillStyle='#07040c';g.fillRect(0,0,w,h);for(let i=0;i<32;i++){const v=(Math.sin(T*6+i*.7)*.5+.5)*(Math.sin(T*2.3+i*1.9)*.3+.7);g.fillStyle='hsl('+((i*11+T*60)%360)+',90%,55%)';g.fillRect(i*24+2,h-v*h*.55,20,v*h*.55)}
        g.textAlign='center';g.fillStyle='#ffffff';let z=120;g.font='400 '+z+'px '+FONT_D;while(g.measureText(ART.toUpperCase()).width>w-40){z-=6;g.font='400 '+z+'px '+FONT_D}g.fillText(ART.toUpperCase(),w/2,140);g.font='700 30px '+FONT_T;g.fillText('LIVE · VASHUPUR',w/2,190);g.textAlign='left';led.needsUpdate=true}}}

  /* =============================== BOXING =============================== */
  function boxing(ev){const {I,r}=ev,RS=3.7,H=1.2;const [A,B]=I.fighters;
    ev.batch(b=>{bx(b,cx,H/2,cz,RS*2+.8,H,RS*2+.8,'#1d1d1d');col(cx-RS-.4,cx+RS+.4,0,H,cz-RS-.4,cz+RS+.4);bx(b,cx,H+.02,cz,RS*2,.04,RS*2,'#3d7be8');
      for(const [x,z,c] of[[cx-RS,cz-RS,'#e94b3c'],[cx+RS,cz+RS,'#2f5bff'],[cx-RS,cz+RS,'#ffffff'],[cx+RS,cz-RS,'#ffffff']]){bx(b,x,H+.8,z,.24,1.6,.24,c);col(x-.15,x+.15,H,H+1.6,z-.15,z+.15)}
      for(const y of[.5,.95,1.4]){bx(b,cx,H+y,cz-RS,RS*2,.05,.05,'#e94b3c');bx(b,cx,H+y,cz+RS,RS*2,.05,.05,'#e94b3c');bx(b,cx-RS,H+y,cz,.05,.05,RS*2,'#ffffff');bx(b,cx+RS,H+y,cz,.05,.05,RS*2,'#ffffff')}
      for(let k=0;k<4;k++){const h=(k+1)*.3,x=cx+RS+1.95-k*.4;bx(b,x,h/2,cz+RS-1,.4,h,1,'#3a3a3a');col(x-.2,x+.2,0,h,cz+RS-1.5,cz+RS-.5)}
      for(const [x,z] of[[cx-6.5,cz-6.5],[cx+6.5,cz-6.5],[cx-6.5,cz+6.5],[cx+6.5,cz+6.5]]){bx(b,x,4.6,z,.3,9.2,.3,'#2b2b2b');col(x-.2,x+.2,0,9.2,z-.2,z+.2)}
      bx(b,cx,9.2,cz-6.5,13.3,.3,.3,'#2b2b2b');bx(b,cx,9.2,cz+6.5,13.3,.3,.3,'#2b2b2b');bx(b,cx-6.5,9.2,cz,.3,.3,13.3,'#2b2b2b');bx(b,cx+6.5,9.2,cz,.3,.3,13.3,'#2b2b2b');
      bx(b,cx+8.5,.45,cz,1,.9,6,'#f4f1ea');col(cx+8,cx+9,0,.9,cz-3,cz+3);
      for(const [x,z] of[[cx-RS+.6,cz-RS+.6],[cx+RS-.6,cz+RS-.6]])bx(b,x,H+.3,z,.5,.6,.5,'#3a3a3a')});
    ev.glow(b=>{for(const s of[-1,1])for(let k=-2;k<=2;k++){bx(b,cx+k*2.4,8.9,cz+s*6.5,.8,.3,.4,'#fff6d8');bx(b,cx+s*6.5,8.9,cz+k*2.4,.4,.3,.8,'#fff6d8')}});
    const glove=(n,c)=>{for(const arm of[n.c.userData.armL,n.c.userData.armR]){const m=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.34),new THREE.MeshLambertMaterial({color:c}));m.position.set(0,-.68,.04);arm.add(m)}};
    const F=[[A,'#e94b3c',-1],[B,'#2f5bff',1]].map(([nm,c,s],i)=>{const sk=SKINS[(I.s+i*2)%SKINS.length];const n=ev.person({name:nm,look:{shirt:sk,skin:sk,pants:c,shoes:'#141414',hair:['buzz','short','spiky'][i+(I.s%2)],face:'smug',fem:/Tara|Gauri|Aandhi/.test(nm)},x:cx+s*2,y:H,z:cz,yaw:-s*PI/2,
      lines:['I trained for this. Mostly by climbing the stairs at Outpulse Residences.','After this, chai at the bus stand. My treat.'],barks:['Come on!','Is that all?']});glove(n,c);n.ly=H;return n});
    const ref=ev.person({name:'Referee',look:{shirt:'#ffffff',pants:'#141414',tie:'#141414',hair:'short',face:'flat'},x:cx,y:H,z:cz+2.4,yaw:PI,lines:['Keep it clean. Protect yourselves at all times.'],barks:['Break!','Box!']});ref.ly=H;
    ev.person({name:'Ring announcer',look:{shirt:'#141414',coat:'#141414',tie:'#e94b3c',hair:'side',face:'grin'},x:cx+5.4,z:cz-4.6,yaw:-PI/2,emote:'talk',lines:['Ladiesss and gentlemennn!'],barks:['Round '+(1)+'!']});
    ev.batch(b=>{for(let i=0;i<3;i++){const x=cx+9.75,z=cz-2+i*2;bx(b,x,.45,z,.55,.08,.55,'#2b2b2b');bx(b,x+.26,.8,z,.06,.7,.55,'#2b2b2b');for(const dx of[-.22,.22])for(const dz of[-.22,.22])bx(b,x+dx,.21,z+dz,.05,.42,.05,'#141414')}});
    for(let i=0;i<3;i++)ev.person({name:'Judge',look:ev.look(i+20,{shirt:'#3a3a3a'}),x:cx+9.6,z:cz-2+i*2,yaw:-PI/2,sit:true,lines:['Ten–nine, red corner. So far.'],barks:['Hmm.']});
    const ko=r()<.75?{round:2+Math.floor(r()*8),at:5+r()*9,win:r()<.5?0:1}:null,points=r()<.5?0:1,RD=24,FT=18;let a=0,bell=-1,cnt=-1,cntT=0,said=false;
    const round=t=>Math.min(10,Math.floor(t/RD)+1),inR=t=>t%RD<FT,koT=ko?(ko.round-1)*RD+ko.at:1e9;
    ev.status=t=>t>=koT?'KO! '+(ko.win?B:A)+' wins in round '+ko.round:t>=RD*10?'DECISION · '+(points?B:A)+' wins on points':'ROUND '+round(t)+' · '+(inR(t)?'0:'+String(Math.floor(t%RD)).padStart(2,'0'):'BREAK');
    ev.screen=t=>[A.toUpperCase()+'  vs  '+B.toUpperCase(),t>=koT?'K.O.  ·  '+(ko.win?B:A).toUpperCase()+' WINS':t>=RD*10?'DECISION  ·  '+(points?B:A).toUpperCase():'ROUND '+round(t)+(inR(t)?'':'  ·  BREAK'),'RED CORNER  ·  BLUE CORNER'];
    ev.music={rally:true};
    ev.tick=(dt,t,T)=>{const rd=round(t);if(bell!==rd*2+(inR(t)?0:1)&&t<RD*10&&t<koT){bell=rd*2+(inR(t)?0:1);if(near&&snd.bell)snd.bell()}
      if(t>=koT){const w=F[ko.win],l=F[1-ko.win];l.lie=true;l.spd=0;w.spd=0;w.emote='cheer';w.c.position.y=H;cntT-=dt;if(cnt<10&&cntT<=0){cnt++;cntT=.8;if(cnt>0)bubble(ref,cnt<10?String(cnt):'TEN! It\'s over!');if(cnt===10){cheer=6;if(near&&!said){said=true;toast('KNOCKOUT!',(ko.win?B:A)+' wins in round '+ko.round+'.')}}}ref.spd=seek(ref,l.c.position.x,l.c.position.z+1.2,2,dt);ref.c.position.y=H;return}
      if(t>=RD*10){F.forEach((f,i)=>{f.spd=0;f.emote=i===points?'cheer':'clap'});return}
      if(inR(t)){a+=dt*.55;F.forEach((f,i)=>{const ang=a+i*PI,x=cx+Math.cos(ang)*1.15,z=cz+Math.sin(ang)*1.15,o=F[1-i].c.position;f.c.position.x+=(x-f.c.position.x)*Math.min(1,dt*3);f.c.position.z+=(z-f.c.position.z)*Math.min(1,dt*3);f.c.position.y=H;f.spd=0;f.emote='box';turnTo(f.c,Math.atan2(o.x-f.c.position.x,o.z-f.c.position.z),dt)});
        ref.spd=seek(ref,cx+Math.cos(a+PI/2)*2.6,cz+Math.sin(a+PI/2)*2.6,2.5,dt,Math.atan2(cx-ref.c.position.x,cz-ref.c.position.z));ref.c.position.y=H;if(r()<dt*.25)cheer=Math.max(cheer,1.2)}
      else{F.forEach((f,i)=>{const s=i?1:-1;f.spd=seek(f,cx+s*(RS-.9),cz+s*(RS-.9),2,dt,s>0?-PI*.75:PI*.25);f.c.position.y=H;f.emote=null});ref.spd=seek(ref,cx,cz,2,dt);ref.c.position.y=H}}}

  /* =============================== OLYMPICS =============================== */
  function olympics(ev){const {I,r}=ev;const lane=i=>TR[2]+.59+i*1.18,X0=-152,X1=-70;
    const R=RUNNERS.map((d,i)=>{const n=ev.person({name:d[0]+' · '+d[1],look:ev.look(i+40,{shirt:d[2],pants:'#141414',shoes:'#f4f1ea',fem:/Sunita|Fatima/.test(d[0])}),x:X0-6,z:lane(i),yaw:PI/2,lines:['Trained on the bus stand ramps. Very steep. Very loud.','I am here for the medal and the free bun.'],barks:['Go go go!','Breathe…']});n.d=d;n.v=8.4+r()*1.6;n.v4=7.2+r()*1.4;return n});
    const order=R.slice().sort((a,b)=>b.v-a.v),order4=R.slice().sort((a,b)=>b.v4-a.v4);
    const starter=ev.person({name:'Starter',look:{shirt:'#ffffff',pants:'#141414',hat:'#e94b3c',hair:'cap',face:'flat'},x:X0-2,z:TR[2]-1.2,yaw:0,lines:['On your marks. Get set. Then I do the loud bit.'],barks:['On your marks!']});
    ev.batch(b=>{bx(b,X1,.06,lane(2.5),.3,.02,7.1,'#ffffff');bx(b,X0,.06,lane(2.5),.3,.02,7.1,'#ffffff');for(let i=0;i<6;i++)bx(b,X0-.6,.12,lane(i),.3,.24,.6,'#3a3a3a');
      for(const [dx,h,c] of[[0,1.2,'#c9a227'],[-2.2,.8,'#c0c0c0'],[2.2,.5,'#cd7f32']]){bx(b,cx+dx,h/2,cz,2.1,h,2,c);col(cx+dx-1.05,cx+dx+1.05,0,h,cz-1,cz+1)}
      for(let k=0;k<3;k++){bx(b,cx-2.2+k*2.2,4,cz-4,.12,8,.12,'#d9d9d9')}
      bx(b,-157,1,35,1.2,2,1.2,'#d9d4c4');col(-157.6,-156.4,0,2,34.4,35.6);bx(b,-157,2.3,35,1.8,.6,1.8,'#c9a227')});
    const flame=[];for(let k=0;k<3;k++){const m=ev.add(new THREE.Mesh(new THREE.ConeGeometry(.7-k*.18,1.8-k*.4,8),new THREE.MeshBasicMaterial({color:['#ff6a1f','#ffb000','#fff3a0'][k]})));m.position.set(-157,3.4-k*.1,35);flame.push(m)}
    const flags=[0,1,2].map(k=>{const m=ev.add(new THREE.Mesh(new THREE.PlaneGeometry(1.6,1),new THREE.MeshLambertMaterial({color:order[[1,0,2][k]].d[2],side:THREE.DoubleSide})));m.position.set(cx-2.2+k*2.2+.85,1,cz-4);return m});
    const loop=lanePath(.59);
    ev.status=t=>t<40?'Opening parade':t<70?'100 M FINAL · on your marks':t<95?'100 M · 1st '+order[0].d[0]+' ('+order[0].d[1]+')':t<160?'400 M FINAL':t<175?'400 M · 1st '+order4[0].d[0]:'Medal ceremony';
    ev.screen=t=>t<40?['OLYMPICS','OPENING PARADE','ATHLETICS FINALS TODAY']:t<95&&t>=72?['100 M FINAL','1. '+order[0].d[0]+'  2. '+order[1].d[0],'3. '+order[2].d[0]]:t<110?['100 M FINAL',t<60?'ON YOUR MARKS':'RACE ON','6 LANES · 6 TOWNS']:t<175?['400 M FINAL',t>=158?'1. '+order4[0].d[0]+'  2. '+order4[1].d[0]:'ONE LAP','3. '+order4[2].d[0]]:['MEDAL CEREMONY','GOLD · '+order[0].d[0],'SILVER · '+order[1].d[0]+'   BRONZE · '+order[2].d[0]];
    ev.music={rally:true};let gun=false,gun4=false,shout=0;
    ev.tick=(dt,t,T)=>{flame.forEach((m,k)=>{m.scale.set(1+Math.sin(T*9+k)*.12,1+Math.sin(T*13+k*2)*.18,1+Math.cos(T*8+k)*.12)});
      if(t<40){R.forEach((n,i)=>{const [x,z]=loop.at(t*3.2-i*2.4);n.spd=seek(n,x,z,3.4,dt)});starter.spd=0;return}
      if(t<60){R.forEach((n,i)=>{n.spd=seek(n,X0-.2,lane(i),4,dt,PI/2);n.emote=null});if(t>52&&shout<1){shout=1;bubble(starter,'On your marks!')}if(t>56&&shout<2){shout=2;bubble(starter,'Get set!')}return}
      if(t<95){if(!gun){gun=true;if(near&&snd.gun)snd.gun();bubble(starter,'BANG!');cheer=4}const rt=t-60;R.forEach((n,i)=>{const x=Math.min(X1+6,X0+n.v*rt);n.c.position.x=x;n.c.position.z=lane(i);n.spd=x<X1+5.9?n.v:0;n.c.rotation.y=PI/2;if(x>=X1)n.emote=n===order[0]?'cheer':'wave'});
        if(t>72&&t<73)cheer=4;return}
      if(t<110){R.forEach((n,i)=>{const [x,z]=loop.at(loop.len*.75-i*1.2);n.spd=seek(n,x,z,3,dt,-PI/2);n.emote=null});return}
      if(t<175){if(!gun4){gun4=true;if(near&&snd.gun)snd.gun();cheer=3}const rt=t-110;R.forEach((n,i)=>{const s=Math.min(loop.len,n.v4*rt*1.0),[x,z]=loop.at(loop.len*.75-i*1.2+s);n.c.position.x=x;n.c.position.z=z;n.spd=s<loop.len?n.v4:0;if(s>=loop.len)n.emote=n===order4[0]?'cheer':'clap';else{const [x2,z2]=loop.at(loop.len*.75-i*1.2+s+1);n.c.rotation.y=Math.atan2(x2-x,z2-z)}});return}
      R.forEach(n=>{const k=order.indexOf(n);if(k<3){const dx=[0,-2.2,2.2][k],h=[1.2,.8,.5][k];const d=Math.hypot(n.c.position.x-(cx+dx),n.c.position.z-cz);if(d>.3){n.c.position.y=0;n.spd=seek(n,cx+dx,cz+(d>1.5?2:0),4,dt)}else{n.spd=0;n.c.position.y=h;n.c.rotation.y=PI}n.emote=d<.3?'cheer':null}else{n.spd=seek(n,cx-5+k,cz+4,3,dt,PI);n.emote='clap'}});
      const k2=Math.min(1,(t-178)/12);flags.forEach((f,i)=>{f.position.y=1+Math.max(0,k2)*6.4*[.85,1,.7][i]});if(t>178&&t<179)cheer=5}}

  /* =============================== WEDDING =============================== */
  function marriage(ev){const {I,r}=ev;const [GR,BR]=I.couple,MX=cx-6,SX=-152;
    ev.batch(b=>{/* mandap */bx(b,MX,.12,cz,8,.24,8,'#f4e3c9');for(const [x,z] of[[MX-3.6,cz-3.6],[MX+3.6,cz-3.6],[MX-3.6,cz+3.6],[MX+3.6,cz+3.6]]){bx(b,x,2.6,z,.4,5.2,.4,'#c9a227');col(x-.25,x+.25,0,5.2,z-.25,z+.25);for(let k=0;k<12;k++)bx(b,x+.26,.3+k*.42,z,.14,.32,.14,k%2?'#ff9a1f':'#ffcc3a')}
      bx(b,MX,5.3,cz,8.4,.3,8.4,'#c62828');{const g=new THREE.ConeGeometry(5.6,2.4,4);g.rotateY(PI/4);g.translate(MX,6.6,cz);b.add(g,'#e94b3c')}
      for(let i=0;i<16;i++){const a=i/16*PI*2;bx(b,MX+Math.cos(a)*4.2,4.7,cz+Math.sin(a)*4.2,.18,1.1,.18,i%2?'#ff9a1f':'#ffffff')}
      bx(b,MX,.45,cz,1.1,.42,1.1,'#8a4a2a');bx(b,MX,.68,cz,.8,.06,.8,'#3a1a10');col(MX-.55,MX+.55,0,.66,cz-.55,cz+.55);
      /* stage with two thrones and a floral backdrop */bx(b,SX,.5,cz,7,1,12,'#f4e3c9');col(SX-3.5,SX+3.5,0,1,cz-6,cz+6);bx(b,SX-3.2,4,cz,.4,6,12.4,'#c62828');
      for(let i=0;i<30;i++)bx(b,SX-2.95,1.6+(i%6)*.85,cz-5.6+Math.floor(i/6)*2.8,.3,.5,.5,['#ff9a1f','#ffcc3a','#ffffff','#ff8fc1'][i%4]);
      for(const s of[-1,1]){bx(b,SX-1.4,1.55,cz+s*1,1,1.1,1,'#c9a227');bx(b,SX-1.85,2.4,cz+s*1,.2,1.6,1.1,'#c9a227')}
      /* buffet along the south side */for(let i=0;i<6;i++){const x=-150+i*7.2,z=FD[3]-3.4;bx(b,x,.45,z,5,.9,1.4,'#ffffff');for(let k=0;k<4;k++){const g=new THREE.CylinderGeometry(.32,.26,.24,12);g.translate(x-1.8+k*1.2,1.02,z);b.add(g,'#c0c0c0')}col(x-2.5,x+2.5,0,.9,z-.7,z+.7);bx(b,x,2.2,z+.6,5,.5,.06,['#c62828','#ffcc3a'][i%2])}
      /* flower aisle from the gate */for(let x=-62;x>MX+6;x-=4)for(const s of[-1,1]){bx(b,x,.5,cz+s*3,.5,1,.5,'#ffffff');bx(b,x,1.15,cz+s*3,.7,.4,.7,['#ff9a1f','#ff8fc1'][(x/4|0)&1])}});
    const fire=[0,1].map(k=>{const m=ev.add(new THREE.Mesh(new THREE.ConeGeometry(.3-k*.12,.8-k*.3,8),new THREE.MeshBasicMaterial({color:k?'#fff3a0':'#ff7a1f'})));m.position.set(MX,1.05,cz);return m});
    ev.glow(b=>{for(let x=-160;x<-64;x+=1.6)for(const z of[FD[2]+1,FD[3]-1])bx(b,x,4.4,z,.16,.2,.16,['#ffcc3a','#ff8fc1','#ffffff','#ff9a1f'][(x/1.6|0)&3])});
    const horse=new THREE.Group(),hb=new Batch();bx(hb,0,1.35,0,.9,.9,2,'#f4f1ea');bx(hb,0,2.05,.95,.5,1,.55,'#f4f1ea',0,-.5);bx(hb,0,2.55,1.35,.42,.42,.8,'#f4f1ea');bx(hb,0,2.6,.9,.12,.6,.5,'#c9a227');
    for(const [x,z] of[[-.3,-.75],[.3,-.75],[-.3,.75],[.3,.75]])bx(hb,x,.45,z,.22,.9,.22,'#e8e2d6');bx(hb,0,1.85,0,1,.12,1.2,'#c62828');bx(hb,0,1.9,0,1.04,.1,.4,'#ffcc3a');horse.add(hb.mesh(CHM));ev.add(horse);
    const groom=ev.person({name:GR+' (groom)',look:{shirt:'#f6efe2',coat:'#f4e3c9',pants:'#f6efe2',hair:'cap',hat:'#e94b3c',sash:'#c9a227',face:'grin',kurta:'#f4e3c9'},x:-46,z:cz,yaw:-PI/2,lines:['I am so nervous. Is my turban straight?','The horse has been to more weddings than me.'],barks:['Thank you for coming!']});
    const bride=ev.person({name:BR+' (bride)',look:{shirt:'#c62828',skirt:'#c62828',pants:'#c62828',hair:'bun',hairC:'#141414',fem:true,face:'smile',sash:'#ffcc3a'},x:MX-1.5,z:cz+1.6,yaw:PI/2,lines:['He is late. The baraat is always late.','Have you tried the gulab jamun? Go. Now.'],barks:['Welcome!']});
    ev.batch(b=>{bx(b,MX+1.2,.36,cz-1.2,.62,.24,.62,'#8a4a2a');bx(b,MX+1.2,.52,cz-1.2,.58,.08,.58,'#ff9a1f')});
    const pandit=ev.person({name:'Panditji',look:{shirt:'#ff9a1f',pants:'#ffffff',hair:'buzz',face:'calm',beard:true},x:MX+1.2,z:cz-1.2,yaw:-PI*.75,sit:true,lines:['Seven pheras, seven promises. No shortcuts.'],barks:['Om…']});
    const band=[];for(let i=0;i<5;i++)band.push(ev.person({name:['Dhol wala','Band master','Trumpet','Dhol wala','Band'][i],look:{shirt:'#c62828',pants:'#ffffff',hat:'#c62828',hair:'cap',sash:'#ffcc3a',face:'grin'},x:-40,z:cz,yaw:-PI/2,emote:'drum',lines:['Dhol baje! Nobody leaves without dancing.'],barks:['Dhin dhin dha!']}));
    const guests=[];for(let i=0;i<14;i++)guests.push(ev.person({name:['Chachaji','Bua','Cousin','Best friend','Mamaji','Neighbour aunty'][i%6],look:ev.look(i+60,{shirt:['#ff8fc1','#ffcc3a','#5cc46b','#a463ff','#ff9933','#3bd1ff'][i%6]}),x:-40,z:cz,yaw:-PI/2,emote:'dance',lines:['Beta, when is your wedding?','I have danced at 400 weddings. This is my best one.'],barks:['Nachooo!','Balle balle!']}));
    const families=[];for(let i=0;i<8;i++)families.push(ev.person({name:'Family',look:ev.look(i+80),x:MX-6+r()*3,z:cz-6+i*1.6,yaw:PI/2,emote:'clap',lines:['We are from the bride\'s side. Obviously.'],barks:['Aa gaye!']}));
    const pos=t=>Math.min(1,t/80),bx0=-44,bx1=MX+6;
    ev.status=t=>t<80?'The baraat is arriving':t<170?'Pheras in progress':'Reception · everyone dance';
    ev.screen=t=>[GR.toUpperCase()+'  WEDS  '+BR.toUpperCase(),'SHUBH VIVAH',t<80?'THE BARAAT IS ARRIVING':t<170?'SEVEN PHERAS':'RECEPTION · DANCE FLOOR OPEN'];
    ev.music={party:true};let fw=0,sparks=[];
    ev.tick=(dt,t,T)=>{fire.forEach((m,k)=>m.scale.set(1+Math.sin(T*10+k)*.15,1+Math.sin(T*14+k)*.25,1));const bpX=bx0+(bx1-bx0)*pos(t);
      if(t<80){horse.position.set(bpX,Math.abs(Math.sin(T*5))*.06,cz);horse.rotation.y=-PI/2;groom.c.position.set(bpX,1.55,cz);groom.c.rotation.y=-PI/2;groom.spd=0;groom.sit=true;groom.emote='wave';
        band.forEach((n,i)=>{n.spd=seek(n,bpX-4.5-(i%3)*1.1,cz+(i<3?-1.5:1.5),3,dt);n.emote='drum'});guests.forEach((n,i)=>{n.spd=seek(n,bpX+3+(i%5)*1.2+Math.sin(T+i)*.4,cz-3+(i%7)*1,3,dt);n.emote='dance'});cheer=Math.max(cheer,.6)}
      else if(t<170){horse.position.set(bx1+1,0,cz-6);horse.rotation.y=-PI/2;groom.sit=false;const k=t<90?0:(t-90)/80*PI*2*7;const cxp=MX,czp=cz;
        if(t<90){groom.c.position.y=0;groom.spd=seek(groom,MX+1.6,cz-.4,2,dt);bride.spd=seek(bride,MX-1.6,cz+.4,2,dt)}else{groom.c.position.set(cxp+Math.cos(k)*1.6,0,czp+Math.sin(k)*1.6);groom.c.rotation.y=-k;groom.spd=1.2;bride.c.position.set(cxp+Math.cos(k-.5)*1.6,0,czp+Math.sin(k-.5)*1.6);bride.c.rotation.y=-k+.5;bride.spd=1.2;if(Math.floor((t-90)/(80/7))!==ev.ph){ev.ph=Math.floor((t-90)/(80/7));bubble(pandit,'Phera '+Math.min(7,ev.ph+1)+'!')}}
        band.forEach((n,i)=>{n.spd=seek(n,MX+7,cz-4+i*2,2,dt,-PI/2);n.emote='drum'});guests.forEach((n,i)=>{const a=i/14*PI*2;n.spd=seek(n,MX+Math.cos(a)*6.5,cz+Math.sin(a)*6.5,2.5,dt,Math.atan2(MX-n.c.position.x,cz-n.c.position.z));n.emote='clap'})}
      else{groom.sit=false;bride.sit=false;const gx=SX-1.3;groom.spd=seek(groom,gx,cz+1,2.5,dt,PI/2);bride.spd=seek(bride,gx,cz-1,2.5,dt,PI/2);if(groom.spd===0){groom.c.position.y=1}if(bride.spd===0){bride.c.position.y=1}
        band.forEach((n,i)=>{n.spd=seek(n,SX+6,cz-6+i*3,2,dt,-PI/2);n.emote='drum'});guests.forEach((n,i)=>{n.spd=seek(n,SX+8+(i%4)*2,cz-5+Math.floor(i/4)*3,2.5,dt,-PI/2);n.emote='dance'});cheer=Math.max(cheer,.8);
        fw-=dt;if(fw<=0){fw=1.6+r()*1.4;const c=new THREE.Color().setHSL(r(),.9,.6),o=new THREE.Vector3(cx-30+r()*60,22+r()*10,cz-20+r()*40);for(let k=0;k<14;k++){const m=new THREE.Mesh(new THREE.SphereGeometry(.35,6,4),new THREE.MeshBasicMaterial({color:c,transparent:true}));m.position.copy(o);const a=k/14*PI*2,b2=(r()-.5)*1.6;m.userData.v=new THREE.Vector3(Math.cos(a)*Math.cos(b2),Math.sin(b2),Math.sin(a)*Math.cos(b2)).multiplyScalar(9);ev.add(m);sparks.push(m)}if(near&&snd.boom)snd.boom()}}
      sparks=sparks.filter(m=>{m.position.addScaledVector(m.userData.v,dt);m.userData.v.y-=6*dt;m.material.opacity-=dt*.6;if(m.material.opacity<=0){scene.remove(m);m.geometry.dispose();return false}return true});}}

  const BUILD={football,concert,boxing,olympics,marriage};
  function tick(dt,T){const now=Date.now()/1000,s=force?force.s:Math.floor(now/SLOT),t=force?(now-force.t0)+force.at:now%SLOT;
    const F=P.world==='out'?P.pos:null;const d=F?Math.hypot(Math.max(0,SB[0]-F.x,F.x-SB[1]),Math.max(0,SB[2]-F.z,F.z-SB[3])):1e9;near=d<6;
    const want=d<110;
    if(!want){if(E){E.clear();E=null}return null}
    if(!crowd)buildFixed();
    if(!E||E.I.s!==s||E.I.kind!==(force?force.kind:slotInfo(s).kind)){if(E)E.clear();const I=slotInfo(s);if(force)I.kind=force.kind;E=begin(I);BUILD[I.kind](E);drawBoards(I,t,true);if(near&&toast)toast('NATIONAL STADIUM',eventTitle(I))}
    try{E.tick(dt,t,T)}catch(e){console.error(e)}
    cheer=Math.max(0,cheer-dt);crowd.position.y=cheer>0?Math.abs(Math.sin(T*8))*.14*Math.min(1,cheer):0;
    drawBoards(E.I,t,false);
    return E.music&&near?E.music:null}
  return{tick,set(kind,at=0){force=kind?{kind,at,t0:Date.now()/1000,s:Math.floor(Date.now()/1000/SLOT)}:null;if(E){E.clear();E=null}},get E(){return E}}}

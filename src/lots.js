import {THREE,G,Batch,bx,cyl,col,blk,tex,signTex,FONT_T,rng,CHM} from './core.js';
const PI=Math.PI;
/* Every building plot is an empty construction lot until it gets built properly. */
const BLURB={'Outpulse Labs HQ':'Outpulse Labs headquarters. Every product lives here.','TOKI':'TOKI specialty coffee, with my studio upstairs.','Gothic Bakehouse':'Gothic: artisan bakehouse & chocolatiers.','Waff Waff':'Waff Waff waffle shop.','Old Green House Cafe':'Old Green House Cafe: classic Kannada cuisine.','City Clinic':'A modern neighbourhood clinic.',"Ajji's House":"Ajji's heritage courtyard house.","Meera's House":"Meera's apartment block.",'Handi Biryani House':'Champaran-style handi biryani.','FLTTR':'FLTTR premium canned coffee store.','The Tiramisu Theory':'The Tiramisu Theory dessert parlour.','Police Station':'Vashu Town Police Station.','Fire Station':'Vashu Town Fire Station.','Vashu Town Public School':'Vashu Town Public School.','Outpulse.EV Showroom':'Outpulse.EV showroom for the Arc-Street scooter.','Goan Chapel':'A white Goan chapel by the beach.','Manali Lookout':'A Himachali wooden hut with a bonfire.','Spreewalk':'Spreewalk burger kiosk, Raipur Marine Drive style.'};
export function makeLot(scene,ctx,o){const {S,addPlane}=ctx;const {x0,x1,z0,z1}=o;const R=rng(Math.floor((x0*13+z0*7)>>>0)+3);const W_=x1-x0,D=z1-z0,area=W_*D;
  const d=o.door||{side:'s',at:(x0+x1)/2};const nx=d.side==='e'?1:d.side==='w'?-1:0,nz=d.side==='s'?1:d.side==='n'?-1:0;
  blk(S,x0-.5,x1+.5,0,.05,z0-.5,z1+.5,'#b9a27a',false);
  blk(S,x0+1,x1-1,0,.4,z0+1,z1-1,'#bdbdbd',true);
  // fence with a gate on the door side
  const gate=d.at,gw=2;const fc=['#2f5bff','#2a52e6'];
  const fenceSeg=(ax0,ax1,fixed,along,side)=>{for(let u=ax0;u<ax1-.01;u+=2){const u2=Math.min(ax1,u+2);if(side===d.side&&u2>gate-gw&&u<gate+gw)continue;const c=fc[Math.round(u/2)%2];
    if(along){blk(S,u,u2,0,2.2,fixed-.06,fixed+.06,c);bx(S,(u+u2)/2,1.1,fixed,u2-u,.12,.14,'#ffffff')}else{blk(S,fixed-.06,fixed+.06,0,2.2,u,u2,c);bx(S,fixed,1.1,(u+u2)/2,.14,.12,u2-u,'#ffffff')}}};
  fenceSeg(x0-.5,x1+.5,z1+.5,true,'s');fenceSeg(x0-.5,x1+.5,z0-.5,true,'n');fenceSeg(z0-.5,z1+.5,x1+.5,false,'e');fenceSeg(z0-.5,z1+.5,x0-.5,false,'w');
  // columns grid with rebar; big lots get a frame
  const floors=area>400?3:area>180?1:0;const sx=Math.max(2,Math.round(W_/5)),sz=Math.max(2,Math.round(D/5));
  for(let i=0;i<=sx;i++)for(let j=0;j<=sz;j++){const x=x0+1.6+(W_-3.2)*i/sx,z=z0+1.6+(D-3.2)*j/sz;if(Math.abs(nx?z-gate:x-gate)<2.4&&((nz>0&&j===sz)||(nz<0&&j===0)||(nx>0&&i===sx)||(nx<0&&i===0)))continue;
    const h=floors?floors*3.5:(.8+R()*1.6);blk(S,x-.25,x+.25,.4,.4+h,z-.25,z+.25,'#a9a9a9',true);for(let k=0;k<3;k++)bx(S,x-.12+k*.12,.4+h+.5,z,.04,1,.04,'#7a4a2a')}
  for(let f=1;f<=floors;f++){const y=.4+f*3.5;const part=f===floors?.55:1;blk(S,x0+1.2,x0+1.2+(W_-2.4)*part,y-.25,y,z0+1.2,z1-1.2,'#bdbdbd',false)}
  if(floors){for(let x=x0+1;x<=x1-1;x+=2)bx(S,x,(.4+floors*3.5)/2,z1-.6,.08,.4+floors*3.5,.08,'#ffcc3a');for(let f=1;f<=floors;f++)bx(S,(x0+x1)/2,.4+f*3.5-1.6,z1-.6,W_-2,.08,.08,'#ffcc3a')}
  // materials
  for(let i=0;i<3;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)bx(S,x1-4.6+i*.5,.55+k*.3,z0+3.2+j*.26,.48,.28,.24,'#b5482e');col(x1-4.85,x1-3.35,.4,1.6,z0+3.05,z0+4.2);
  const sp=new THREE.ConeGeometry(1.4,1.2,10);sp.translate(x0+3,1,z0+3);S.add(sp,'#d8c08a');col(x0+2,x0+4,.4,1.2,z0+2,z0+4);
  for(let i=0;i<5;i++)bx(S,x0+2.2+(i%3)*.6,.55+Math.floor(i/3)*.24,z1-3,.55,.22,.8,'#e8e2d6');
  // crane on bigger lots
  if(area>150){const cx=x0+(W_>12?W_*.7:W_/2),cz=z0+2.2,H=area>400?24:14+R()*4,L=area>400?22:13,a=R()*PI*2;blk(S,cx-.5,cx+.5,.4,.4+H,cz-.5,cz+.5,'#ffcc3a',true);for(let y=1;y<H;y+=1.4)bx(S,cx,.4+y,cz,1.1,.08,1.1,'#d4a017');
    const jib=new THREE.Group();const jb=new Batch();bx(jb,L/2-3,0,0,L,.6,.6,'#ffcc3a');bx(jb,-4.5,0,0,6,.5,.5,'#ffcc3a');bx(jb,-6.5,-.8,0,1.6,1.4,1.2,'#7a7f86');bx(jb,0,.9,0,.5,1.8,.5,'#ffcc3a');bx(jb,0,-.9,0,1.2,1,1.2,'#e8e2d6');
    bx(jb,L*.7,-H*.35,0,.04,H*.7-1,.04,'#333');bx(jb,L*.7,-H*.7,0,1.4,.8,1.4,'#b5482e');jib.add(jb.mesh(CHM));jib.position.set(cx,.4+H+.3,cz);jib.rotation.y=a;scene.add(jib);(G.cranes=G.cranes||[]).push({g:jib,a,sp:.05+R()*.08})}
  // hoarding facing the street
  const hw=Math.min(8,(nx?D:W_)-1),hh=hw*.45;const hp=nx?[nx>0?x1+.62:x0-.62,1.2+hh/2,gate+(gate+hw/2+2.2<(nx?z1:x1)?hw/2+2.2:-(hw/2+2.2))]:[gate+(gate+hw/2+2.2<x1?hw/2+2.2:-(hw/2+2.2)),1.2+hh/2,nz>0?z1+.62:z0-.62];
  const ry=d.side==='s'?0:d.side==='n'?PI:d.side==='e'?PI/2:-PI/2;
  const t=tex(800,360,(c,w,h)=>{c.fillStyle='#ffcc3a';c.fillRect(0,0,w,h);for(let k=-10;k<30;k++){c.fillStyle='#141414';c.beginPath();c.moveTo(k*40,h);c.lineTo(k*40+20,h);c.lineTo(k*40+60,h-36);c.lineTo(k*40+40,h-36);c.fill()}
    c.fillStyle='#141414';c.font='800 30px '+FONT_T;c.fillText('COMING SOON',36,58);let s=78;c.font='800 '+s+'px '+FONT_T;while(c.measureText(o.name).width>w-70&&s>30){s-=6;c.font='800 '+s+'px '+FONT_T}c.fillText(o.name,36,58+s+6);
    c.font='500 26px '+FONT_T;const words=(BLURB[o.name]||'').split(' ');let line='',y=58+s+50;for(const wd of words){if(c.measureText(line+wd).width>w-80){c.fillText(line,36,y);y+=32;line=''}line+=wd+' '}c.fillText(line,36,y)});
  const card={n:o.name,tag:'Under construction',st:'Empty lot',d:(BLURB[o.name]||'')+' This lot is waiting to be built.',href:'',color:'#ffcc3a'};
  addPlane(scene,hw,hh,t,hp,ry,()=>G.card(card),{reach:8});
  const pp=nx?[hp[0],0,hp[2]]:[hp[0],0,hp[2]];for(const s of[-1,1]){const px=nx?pp[0]:pp[0]+s*(hw/2-.2),pz=nx?pp[2]+s*(hw/2-.2):pp[2];blk(S,px-.08,px+.08,0,1.2,pz-.08,pz+.08,'#141414',false)}
  // gate cones
  for(const s of[-1,1]){const gx=nx?(nx>0?x1+.9:x0-.9):gate+s*(gw+.3),gz=nx?gate+s*(gw+.3):(nz>0?z1+.9:z0-.9);const g=new THREE.ConeGeometry(.22,.6,8);g.translate(gx,.3,gz);S.add(g,'#ff6a3d');bx(S,gx,.32,gz,.3,.08,.3,'#ffffff')}
  G.blocked.push([x0-2,x1+2,z0-2,z1+2]);
  const dx=nx?(nx>0?x1+.5:x0-.5):gate,dz=nz?(nz>0?z1+.5:z0-.5):gate;const out={x:dx+nx*2,z:dz+nz*2,fx:nx,fz:nz};
  G.buildings.push({name:o.name+' (lot)',short:o.short||o.name,x0,x1,z0,z1,col:'#b9a27a',door:out,room:null,lot:true});
  G.triggers.push({x:dx+nx*1.6,z:dz+nz*1.6,r:1.8,label:o.name+': coming soon',act:()=>G.card(card)});
  if(o.name==='TOKI'){const p=[gate+3.4,0,z1+1.6];bx(S,p[0],.5,p[2],1.8,1,.9,'#c89b6d');bx(S,p[0],1.05,p[2],1.9,.08,1,'#f7f2ea');bx(S,p[0]-.4,1.3,p[2],.5,.45,.4,'#c9ccd1');bx(S,p[0],2.4,p[2],2.1,.08,1.3,'#1f3a5f');for(const s of[-1,1])bx(S,p[0]+s*.95,1.7,p[2]-.5,.05,1.4,.05,'#555');col(p[0]-.95,p[0]+.95,0,1.1,p[2]-.5,p[2]+.5);
    addPlane(scene,1.8,.42,signTex('TOKI · SITE COFFEE','#1f3a5f','#f3eee6',512,120),[p[0],1.9,p[2]+.52],0,null);G.triggers.push({x:p[0],z:p[2]+1.3,r:1.5,label:'Brew a coffee',act:()=>G.brew()})}
  return out}

import {THREE,makeChar,anim,texNow} from './core.js';
import {toChar,clean} from './look.js';
/* Multiplayer client: one WebSocket per town, other players drawn with their own look,
   name tags, quick phrases and emotes. Positions are smoothed between updates. */
export const PHRASES=['Namaste!','Hi!','Follow me','Race you to the bus!','Nice place!','Coffee at TOKI?','Found a bean!','Wait for me','Haha','Thanks!','Bye!','Fire! Run!'];
function tag(name,acct){const t=texNow(256,64,(x,w,h)=>{x.font='800 30px "Inter Tight",sans-serif';const tw=Math.min(236,x.measureText(name).width+(acct?34:0)+28);
  x.fillStyle=acct?'rgba(20,20,20,.86)':'rgba(70,70,70,.72)';const x0=(w-tw)/2;x.beginPath();x.roundRect?x.roundRect(x0,8,tw,48,24):x.rect(x0,8,tw,48);x.fill();
  x.fillStyle='#ffffff';x.textAlign='center';x.textBaseline='middle';x.fillText(name,w/2-(acct?14:0),33,200);if(acct){x.fillStyle='#ffcc3a';x.font='800 26px "Inter Tight",sans-serif';x.fillText('✓',w/2+tw/2-28,33)}});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthWrite:false,transparent:true}));s.scale.set(1.9,.48,1);s.position.y=2.45;s.renderOrder=5;return s}
export function makeNet(ctx){let ws=null,want=null,timer=null,retry=0,myId=null,sendT=0,lastKey='',beat=0;const others=new Map();
  const url=t=>{const u=new URL('/ws/'+t,location.href);u.protocol=location.protocol==='https:'?'wss:':'ws:';u.searchParams.set('name',ctx.name());u.searchParams.set('look',JSON.stringify(ctx.look()));const k=ctx.token();if(k)u.searchParams.set('token',k);return u.toString()};
  function count(){ctx.onCount(ws&&ws.readyState===1?others.size+1:0)}
  function join(t){want=t;retry=0;open()}
  function open(){shut();if(!want||!('WebSocket' in window))return;try{ws=new WebSocket(url(want))}catch(e){return later()}
    ws.onopen=()=>{retry=0;lastKey='';count()};ws.onmessage=e=>{try{onMsg(JSON.parse(e.data))}catch(err){}};ws.onclose=()=>{ws=null;clear();if(want)later()};ws.onerror=()=>{}}
  function later(){clearTimeout(timer);retry=Math.min(retry+1,6);timer=setTimeout(open,1000*2**retry)}
  function shut(){clearTimeout(timer);if(ws){ws.onclose=null;try{ws.close()}catch(e){}ws=null}clear()}
  function leave(){want=null;shut()}
  function clear(){for(const o of others.values())drop(o);others.clear();count()}
  function build(o){if(o.c){o.c.parent&&o.c.parent.remove(o.c)}const c=makeChar(toChar(o.look,7));c.add(tag(o.name,o.acct));o.c=c;if(o.s)c.position.set(o.s[0],o.s[1],o.s[2]);ctx.root().add(c)}
  function add(p){if(p.id===myId||others.has(p.id))return;const o={id:p.id,name:p.name||'Guest',acct:!!p.acct,look:clean(p.look),s:p.s||null,tx:0,ty:0,tz:0,tyaw:0,sp:0,m:0,emote:null,emoteT:0,seen:!!p.s};
    if(o.s){o.tx=o.s[0];o.ty=o.s[1];o.tz=o.s[2];o.tyaw=o.s[3]}build(o);o.c.visible=o.seen;others.set(o.id,o)}
  function drop(o){if(o.c&&o.c.parent)o.c.parent.remove(o.c)}
  function onMsg(m){if(m.t==='hello'){myId=m.id;clear();(m.players||[]).forEach(add);count();return}
    if(m.t==='join'){add(m);count();if(ctx.onJoin)ctx.onJoin(m.name);return}
    const o=others.get(m.id);if(!o)return;
    if(m.t==='leave'){drop(o);others.delete(m.id);count()}
    else if(m.t==='s'){const s=m.s;o.tx=s[0];o.ty=s[1];o.tz=s[2];o.tyaw=s[3];o.sp=s[4];o.m=s[5]|0;if(!o.seen){o.seen=true;o.c.position.set(s[0],s[1],s[2]);o.c.rotation.y=s[3];o.c.visible=true}}
    else if(m.t==='q'&&PHRASES[m.i])ctx.bubble({c:o.c,name:o.name},PHRASES[m.i]);
    else if(m.t==='e'){o.emote=m.e;o.emoteT=m.e==='dance'?6:2.6}
    else if(m.t==='look'){o.look=clean(m.look);build(o)}}
  function put(o){if(ws&&ws.readyState===1)try{ws.send(JSON.stringify(o))}catch(e){}}
  /* our own state, about 8 times a second while moving, every 2 seconds when still */
  function send(dt,P,mode){sendT-=dt;beat-=dt;if(sendT>0)return;sendT=.12;const s=[P.pos.x,P.pos.y,P.pos.z,P.yaw,Math.hypot(P.vel.x,P.vel.z)].map(v=>Math.round(v*100)/100);
    const key=s.join(',')+mode;if(key===lastKey&&beat>0)return;lastKey=key;beat=2;put({t:'s',p:s,m:mode})}
  function tick(dt){const k=1-Math.exp(-dt*10),hn=ctx.hideNear&&ctx.hideNear();for(const o of others.values()){const c=o.c;if(!c||!o.seen)continue;c.visible=!hn||Math.hypot(c.position.x-hn.x,c.position.z-hn.z)>7;c.position.x+=(o.tx-c.position.x)*k;c.position.y+=(o.ty-c.position.y)*k;c.position.z+=(o.tz-c.position.z)*k;
      let a=o.tyaw-c.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));c.rotation.y+=a*k;if(o.emoteT>0){o.emoteT-=dt;if(o.emoteT<=0)o.emote=null}
      anim(c,dt,{speed:o.m===1?0:o.sp,ride:o.m===1,sit:o.m===2,emote:o.sp>.5?null:o.emote})}}
  return{join,leave,send,tick,say:i=>put({t:'q',i}),emote:e=>put({t:'e',e}),look:l=>put({t:'look',look:clean(l)}),reconnect:()=>{if(want){retry=0;open()}},get count(){return ws&&ws.readyState===1?others.size+1:0}}}

import {DurableObject} from 'cloudflare:workers';
import {clean} from '../src/look.js';
/* OW | Outpulse Space server.
   /api/*  accounts (username + password), kept in the Accounts Durable Object (SQLite)
   /ws/:town  live multiplayer room, one Town Durable Object per town (hibernating WebSockets)
   everything else is the static game in /public */
const TOWNS=['vashupur','kaapikunj','memepura','basti','barfii','delulugarh'];
const PHRASES=12,EMOTES=['wave','dance','sip','sixseven'];
const json=(o,status=200)=>new Response(JSON.stringify(o),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const cleanName=s=>String(s||'').replace(/[^\p{L}\p{N} _.-]/gu,'').replace(/\s+/g,' ').trim().slice(0,16);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const fromHex=h=>new Uint8Array(h.match(/../g).map(x=>parseInt(x,16)));
async function hashPw(pw,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:100000},k,256))}
function same(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
const PROGRESS_MAX=16000;

export class Accounts extends DurableObject{
  constructor(ctx,env){super(ctx,env);this.sql=ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL COLLATE NOCASE,salt TEXT NOT NULL,hash TEXT NOT NULL,look TEXT NOT NULL DEFAULT '{}',progress TEXT NOT NULL DEFAULT '{}',created INTEGER NOT NULL,seen INTEGER);
      CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,uid INTEGER NOT NULL,expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS attempts(k TEXT PRIMARY KEY,n INTEGER NOT NULL,reset INTEGER NOT NULL);`)}
  /* at most 12 sign-up / log-in tries per address per 10 minutes */
  limited(ip){const now=Date.now(),r=this.sql.exec('SELECT n,reset FROM attempts WHERE k=?',ip).toArray()[0];
    if(!r||r.reset<now){this.sql.exec('INSERT OR REPLACE INTO attempts(k,n,reset) VALUES(?,?,?)',ip,1,now+600000);return false}
    if(r.n>=12)return true;this.sql.exec('UPDATE attempts SET n=n+1 WHERE k=?',ip);return false}
  session(uid){const token=hex(crypto.getRandomValues(new Uint8Array(32)));this.sql.exec('INSERT INTO sessions(token,uid,expires) VALUES(?,?,?)',token,uid,Date.now()+60*864e5);return token}
  user(token){if(!token||!/^[0-9a-f]{64}$/.test(token))return null;const r=this.sql.exec('SELECT u.id,u.username,u.look,u.progress,s.expires FROM sessions s JOIN users u ON u.id=s.uid WHERE s.token=?',token).toArray()[0];
    if(!r||r.expires<Date.now())return null;return r}
  pub(r){return{username:r.username,look:JSON.parse(r.look||'{}'),progress:JSON.parse(r.progress||'{}')}}
  async fetch(req){const url=new URL(req.url),path=url.pathname,ip=req.headers.get('cf-connecting-ip')||'local';
    const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
    let body={};if(req.method==='POST'){try{body=await req.json()}catch{return json({error:'Bad request.'},400)}}
    if(path==='/api/signup'){if(this.limited(ip))return json({error:'Too many tries. Wait a few minutes.'},429);
      const username=String(body.username||'').trim(),pw=String(body.password||'');
      if(!/^[A-Za-z0-9_]{3,16}$/.test(username))return json({error:'Username: 3 to 16 letters, numbers or _.'},400);
      if(pw.length<8||pw.length>128)return json({error:'Password: at least 8 characters.'},400);
      if(this.sql.exec('SELECT id FROM users WHERE username=?',username).toArray().length)return json({error:'That username is taken.'},409);
      const salt=crypto.getRandomValues(new Uint8Array(16)),hash=await hashPw(pw,salt);
      const progress=JSON.stringify(body.progress||{});if(progress.length>PROGRESS_MAX)return json({error:'Progress too large.'},400);
      this.sql.exec('INSERT INTO users(username,salt,hash,look,progress,created) VALUES(?,?,?,?,?,?)',username,hex(salt),hash,JSON.stringify(clean(body.look)),progress,Date.now());
      const r=this.sql.exec('SELECT id,username,look,progress FROM users WHERE username=?',username).toArray()[0];
      return json({token:this.session(r.id),user:this.pub(r)})}
    if(path==='/api/login'){if(this.limited(ip))return json({error:'Too many tries. Wait a few minutes.'},429);
      const r=this.sql.exec('SELECT id,username,salt,hash,look,progress FROM users WHERE username=?',String(body.username||'').trim()).toArray()[0];
      const h=r?await hashPw(String(body.password||''),fromHex(r.salt)):await hashPw('x',new Uint8Array(16));
      if(!r||!same(h,r.hash))return json({error:'Wrong username or password.'},401);
      this.sql.exec('UPDATE users SET seen=? WHERE id=?',Date.now(),r.id);return json({token:this.session(r.id),user:this.pub(r)})}
    if(path==='/api/me'){const r=this.user(token);return r?json({user:this.pub(r)}):json({error:'Signed out.'},401)}
    if(path==='/api/save'){const r=this.user(token);if(!r)return json({error:'Signed out.'},401);
      if(body.look)this.sql.exec('UPDATE users SET look=? WHERE id=?',JSON.stringify(clean(body.look)),r.id);
      if(body.progress){const p=JSON.stringify(body.progress);if(p.length>PROGRESS_MAX)return json({error:'Progress too large.'},400);this.sql.exec('UPDATE users SET progress=?,seen=? WHERE id=?',p,Date.now(),r.id)}
      return json({ok:true})}
    if(path==='/api/logout'){this.sql.exec('DELETE FROM sessions WHERE token=?',token);return json({ok:true})}
    /* internal: who is this token (used when joining a town) */
    if(path==='/internal/who'){const r=this.user(url.searchParams.get('token'));return r?json({username:r.username,look:JSON.parse(r.look)}):json({},404)}
    return json({error:'Not found.'},404)}
}

export class Town extends DurableObject{
  constructor(ctx,env){super(ctx,env)}
  send(ws,o){try{ws.send(JSON.stringify(o))}catch{}}
  cast(o,except){const m=JSON.stringify(o);for(const w of this.ctx.getWebSockets())if(w!==except)try{w.send(m)}catch{}}
  async fetch(req){if(req.headers.get('Upgrade')!=='websocket')return new Response('Expected a WebSocket.',{status:426});
    if(this.ctx.getWebSockets().length>=60)return new Response('Town is full.',{status:503});
    const who=JSON.parse(req.headers.get('x-ow-user')||'{}');const id=hex(crypto.getRandomValues(new Uint8Array(4)));
    const pair=new WebSocketPair(),[client,server]=Object.values(pair);
    const me={id,name:who.name,look:who.look,acct:!!who.acct,s:null,n:0,t:0};
    this.ctx.acceptWebSocket(server);server.serializeAttachment(me);
    const others=this.ctx.getWebSockets().filter(w=>w!==server).map(w=>w.deserializeAttachment()).filter(Boolean);
    this.send(server,{t:'hello',id,players:others.map(o=>({id:o.id,name:o.name,look:o.look,acct:o.acct,s:o.s}))});
    this.cast({t:'join',id,name:me.name,look:me.look,acct:me.acct},server);
    return new Response(null,{status:101,webSocket:client})}
  webSocketMessage(ws,raw){const a=ws.deserializeAttachment();if(!a||typeof raw!=='string'||raw.length>900)return;
    const now=Date.now();if(now-a.t>1000){a.t=now;a.n=0}if(++a.n>30)return;
    let m;try{m=JSON.parse(raw)}catch{return}
    if(m.t==='s'&&Array.isArray(m.p)&&m.p.length===5&&m.p.every(Number.isFinite)){a.s=[...m.p.map(v=>Math.round(v*100)/100),Math.max(0,Math.min(9,m.m|0))];ws.serializeAttachment(a);this.cast({t:'s',id:a.id,s:a.s},ws)}
    else if(m.t==='q'&&Number.isInteger(m.i)&&m.i>=0&&m.i<PHRASES){ws.serializeAttachment(a);this.cast({t:'q',id:a.id,i:m.i},ws)}
    else if(m.t==='e'&&EMOTES.includes(m.e)){ws.serializeAttachment(a);this.cast({t:'e',id:a.id,e:m.e},ws)}
    else if(m.t==='look'){a.look=clean(m.look);ws.serializeAttachment(a);this.cast({t:'look',id:a.id,look:a.look},ws)}
    else ws.serializeAttachment(a)}
  webSocketClose(ws){const a=ws.deserializeAttachment();if(a)this.cast({t:'leave',id:a.id},ws);try{ws.close(1000,'bye')}catch{}}
  webSocketError(ws){this.webSocketClose(ws)}
}

export default{async fetch(req,env){const url=new URL(req.url),path=url.pathname;
  const accounts=env.ACCOUNTS.get(env.ACCOUNTS.idFromName('accounts'));
  if(path.startsWith('/api/'))return accounts.fetch(req);
  const m=path.match(/^\/ws\/([a-z]+)$/);
  if(m){if(!TOWNS.includes(m[1]))return new Response('Unknown town.',{status:404});if(req.headers.get('Upgrade')!=='websocket')return new Response('Expected a WebSocket.',{status:426});
    let who={name:cleanName(url.searchParams.get('name'))||'Guest',acct:false,look:null};
    try{who.look=clean(JSON.parse(url.searchParams.get('look')||'{}'))}catch{who.look=clean({})}
    const token=url.searchParams.get('token');
    if(token){const r=await accounts.fetch(new Request('https://do/internal/who?token='+encodeURIComponent(token)));if(r.ok){const u=await r.json();who={name:u.username,acct:true,look:who.look}}}
    const h=new Headers(req.headers);h.set('x-ow-user',JSON.stringify(who));
    return env.TOWN.get(env.TOWN.idFromName(m[1])).fetch(new Request(req.url,{headers:h}))}
  return env.ASSETS.fetch(req)}};

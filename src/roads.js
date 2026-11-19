/* Road graph for vehicles: centrelines of every road, junctions where they cross,
   a ring for the roundabout, shortest routes and left-hand lane offsets. */
export function roadGraph(TD){
  const N=[],E=[];
  const add=(x,z)=>{for(let i=0;i<N.length;i++)if(Math.abs(N[i].x-x)<.6&&Math.abs(N[i].z-z)<.6)return i;N.push({x,z});E.push([]);return N.length-1};
  const link=(a,b,oneWay)=>{if(a===b||E[a].some(e=>e[0]===b))return;const d=Math.hypot(N[a].x-N[b].x,N[a].z-N[b].z);E[a].push([b,d]);if(!oneWay)E[b].push([a,d])};
  const R=TD.roads.map(r=>{const x=r[4]==='x';return{x,c:x?(r[2]+r[3])/2:(r[0]+r[1])/2,a:x?r[0]:r[2],b:x?r[1]:r[3],w:x?r[3]-r[2]:r[1]-r[0],pts:[]}});
  const co=(r,n)=>r.x?N[n].x:N[n].z;
  for(const p of R)for(const q of R){if(!p.x||q.x)continue;
    if(q.c>=p.a-1&&q.c<=p.b+1&&p.c>=q.a-1&&p.c<=q.b+1){const i=add(q.c,p.c);p.pts.push(i);q.pts.push(i)}}
  for(const r of R){for(const v of[r.a+1,r.b-1]){const i=r.x?add(v,r.c):add(r.c,v);r.pts.push(i)}}
  for(const r of R){r.pts=[...new Set(r.pts)].sort((m,n)=>co(r,m)-co(r,n));for(let i=1;i<r.pts.length;i++)link(r.pts[i-1],r.pts[i])}
  if(TD.round){const {x,z,r0,r1}=TD.round,rm=(r0+r1)/2,K=16,ring=[];
    for(let i=0;i<K;i++){const a=i/K*Math.PI*2;const n=add(x+Math.cos(a)*rm,z+Math.sin(a)*rm);N[n].ring=true;ring.push(n)}
    /* one way, clockwise seen on the map (keep left) */
    for(let i=0;i<K;i++)link(ring[i],ring[(i+1)%K],true);
    /* each arm enters one node downstream and leaves one node upstream, so traffic merges instead of meeting head-on */
    for(const r of R)for(const n of[r.pts[0],r.pts[r.pts.length-1]]){if(Math.hypot(N[n].x-x,N[n].z-z)>r1+6)continue;const a=Math.atan2(N[n].z-z,N[n].x-x);const k=((Math.round(a/(Math.PI*2/K))%K)+K)%K;
      link(n,ring[(k+1)%K],true);link(ring[(k+K-1)%K],n,true)}}
  const W=R.reduce((s,r)=>s+r.w,0)/Math.max(1,R.length);
  /* nearest point on any road centreline */
  function project(x,z){let best=null,bd=1e9;for(const r of R){const t=Math.max(r.a+1,Math.min(r.b-1,r.x?x:z));const px=r.x?t:r.c,pz=r.x?r.c:t;const d=Math.hypot(px-x,pz-z);if(d<bd){bd=d;best={r,t,x:px,z:pz,d}}}return best}
  /* shortest route between two points, entering and leaving the network at their nearest roads */
  /* hx,hz: current heading; when given, the route leaves forwards along the current road (no U-turn unless it is a dead end) */
  function route(sx,sz,tx,tz,hx,hz){const s=project(sx,sz),e=project(tx,tz);if(!s||!e)return[{x:sx,z:sz},{x:tx,z:tz}];
    const dist=new Float64Array(N.length).fill(1e18),prev=new Int32Array(N.length).fill(-1),done=new Uint8Array(N.length);
    const dirS=hx===undefined?0:Math.sign(s.r.x?hx:hz);let seeded=0;for(const n of s.r.pts){const dd=co(s.r,n)-s.t;if(dirS&&dd*dirS<-.5)continue;dist[n]=Math.abs(dd);seeded++}if(!seeded)for(const n of s.r.pts)dist[n]=Math.abs(co(s.r,n)-s.t);
    for(;;){let u=-1,ud=1e18;for(let i=0;i<N.length;i++)if(!done[i]&&dist[i]<ud){ud=dist[i];u=i}if(u<0)break;done[u]=1;for(const [v,w] of E[u])if(ud+w<dist[v]){dist[v]=ud+w;prev[v]=u}}
    let end=-1,ed=s.r===e.r&&(!dirS||(e.t-s.t)*dirS>=0)?Math.abs(s.t-e.t):1e18;for(const n of e.r.pts){const d=dist[n]+Math.abs(co(e.r,n)-e.t);if(d<ed){ed=d;end=n}}
    const mid=[];for(let n=end;n>=0;n=prev[n])mid.unshift({x:N[n].x,z:N[n].z,ring:!!N[n].ring});
    return[{x:s.x,z:s.z},...mid,{x:e.x,z:e.z}].filter((p,i,a)=>!i||Math.hypot(p.x-a[i-1].x,p.z-a[i-1].z)>.5)}
  /* keep left (India): shift each corner by the average left normal of its two segments */
  function lane(path,off){if(path.length<2)return path;return path.map((p,i)=>{if(p.ring)return{x:p.x,z:p.z,ring:true};const a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)];
    let lx=0,lz=0;const seg=(p0,p1)=>{const dx=p1.x-p0.x,dz=p1.z-p0.z,d=Math.hypot(dx,dz)||1;lx+=dz/d;lz+=-dx/d};if(i>0)seg(a,p);if(i<path.length-1)seg(p,b);
    const l=Math.hypot(lx,lz)||1,k=(i>0&&i<path.length-1)?Math.min(1.6/l,2/(l*l)):1/l;return{x:p.x+lx*k*off,z:p.z+lz*k*off}})}
  const ends=R.flatMap(r=>[r.pts[0],r.pts[r.pts.length-1]]).map(n=>N[n]);
  const L=R.reduce((a,r)=>a+(r.b-r.a),0);const deg=N.map((_,i)=>N[i].ring?0:E[i].length);const hubs=N.filter((n,i)=>deg[i]>=2);
  /* a random spot anywhere on the network, by length, so every street gets traffic */
  function randomPoint(){let u=Math.random()*L;for(const r of R){const len=r.b-r.a;if(u<=len){const t=r.a+3+Math.random()*Math.max(0,len-6);return r.x?{x:t,z:r.c}:{x:r.c,z:t}}u-=len}return N[0]}
  return{N,E,R,W,L,hubs,randomPoint,project,route,lane,ends,randomNode:rnd=>N[Math.floor(rnd()*N.length)]}}

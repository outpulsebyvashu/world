/* Player looks: the options the character creator offers, how a look becomes a character,
   and a strict clean-up so only known options travel over the network. */
export const OPT={
  g:['m','f'],
  hair:{m:['short','curly','buzz','spiky','side','cap'],f:['long','bun','ponytail','bob','braid','curly']},
  hairC:['#17110d','#3b2417','#6b4226','#8a3b1f','#d9b44a','#9e9e9e','#2f6bd8','#ff5fa2'],
  skin:['#f1d2b6','#e0b48f','#c48a60','#a86d45','#8a5534','#5e3a24'],
  top:{m:['tee','shirt','hoodie','kurta','jacket'],f:['tee','shirt','hoodie','kurta','jacket','dress']},
  topC:['#141414','#f4f1ea','#ff6a3d','#e53935','#2b5fa8','#3e7c59','#ffcc3a','#6a4c93','#ff5fa2','#00a6a6'],
  bot:{m:['jeans','cargo','shorts'],f:['jeans','cargo','shorts','skirt']},
  botC:['#26323d','#3a4a6b','#8a7f5a','#1b1b1b','#c9b48a','#f4f1ea','#7b2d3b','#2e5e4e'],
  shoes:['#f5f5f5','#141414','#8a5534','#e53935','#2b5fa8','#ffcc3a']
};
export const LABEL={m:'Male',f:'Female',short:'Short',curly:'Curly',buzz:'Buzz',spiky:'Spiky',side:'Side part',cap:'Cap',long:'Long',bun:'Bun',ponytail:'Ponytail',bob:'Bob',braid:'Braid',
  tee:'T-shirt',shirt:'Shirt',hoodie:'Hoodie',kurta:'Kurta',jacket:'Jacket',dress:'Dress',jeans:'Jeans',cargo:'Cargos',shorts:'Shorts',skirt:'Skirt'};
/* the original look of the town's host */
export const DEFAULT={g:'m',hair:'curly',hairC:'#17110d',skin:'#c48a60',top:'tee',topC:'#141414',bot:'cargo',botC:'#8a7f5a',shoes:'#f5f5f5',glasses:true,beard:false};
const pick=a=>a[Math.floor(Math.random()*a.length)];
export function randomLook(g=pick(OPT.g)){return clean({g,hair:pick(OPT.hair[g]),hairC:pick(OPT.hairC.slice(0,6)),skin:pick(OPT.skin),top:pick(OPT.top[g]),topC:pick(OPT.topC),bot:pick(OPT.bot[g]),botC:pick(OPT.botC),shoes:pick(OPT.shoes),glasses:Math.random()<.3,beard:g==='m'&&Math.random()<.25})}
export function clean(l){l=l&&typeof l==='object'?l:{};const g=OPT.g.includes(l.g)?l.g:'m',one=(v,a,d)=>a.includes(v)?v:d;
  return{g,hair:one(l.hair,OPT.hair[g],OPT.hair[g][0]),hairC:one(l.hairC,OPT.hairC,OPT.hairC[0]),skin:one(l.skin,OPT.skin,OPT.skin[2]),top:one(l.top,OPT.top[g],'tee'),topC:one(l.topC,OPT.topC,OPT.topC[0]),
    bot:one(l.bot,OPT.bot[g],'jeans'),botC:one(l.botC,OPT.botC,OPT.botC[0]),shoes:one(l.shoes,OPT.shoes,OPT.shoes[0]),glasses:!!l.glasses,beard:g==='m'&&!!l.beard}}
/* look -> makeChar options */
export function toChar(l,seed=3){l=clean(l);const o={skin:l.skin,shirt:l.topC,pants:l.botC,shoes:l.shoes,hair:l.hair,hairC:l.hairC,glasses:l.glasses,face:'smile',seed,fem:l.g==='f'};
  if(l.hair==='cap')o.hat=l.topC==='#e53935'?'#2b5fa8':'#e53935';
  if(l.top==='shirt')o.long=true;if(l.top==='hoodie'){o.long=true;o.hood=l.topC}if(l.top==='kurta'){o.long=true;o.kurta=l.topC}
  if(l.top==='jacket'){o.coat=l.topC;o.shirt=l.topC==='#f4f1ea'?'#141414':'#f4f1ea'}if(l.top==='dress')o.skirt=l.topC;
  if(l.bot==='cargo')o.cargo=shade(l.botC);if(l.bot==='shorts')o.shorts=true;if(l.bot==='skirt')o.skirt=l.botC;
  if(l.beard)o.beard=true;if(l.top==='tee'&&l.topC==='#141414'&&l.g==='m')o.logo='#ff6a3d';return o}
function shade(h){const n=parseInt(h.slice(1),16),f=v=>Math.max(0,Math.round(v*.82)).toString(16).padStart(2,'0');return'#'+f(n>>16)+f((n>>8)&255)+f(n&255)}

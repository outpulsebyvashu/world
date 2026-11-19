/* Tiny procedural audio: no files, all generated in the browser. */
const SAMPLES={},BEDS={};let sirO=null,sirG=null;let ac=null,master=null,musicG=null,sfxG=null,noiseBuf=null,motorO=null,motorG=null,murmur=null,murG=null;
let muted=(()=>{try{return localStorage.getItem('ow_mute')==='1'}catch(e){return false}})();
let scene={concert:0,rally:false,party:false,indoor:null},mode='chill',step16=0,nextT=0,timer=null,chord=0;
const N=m=>440*Math.pow(2,(m-69)/12);
function ensure(){if(ac)return true;try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return false}
  master=ac.createGain();master.gain.value=muted?0:1;master.connect(ac.destination);musicG=ac.createGain();musicG.gain.value=.22;musicG.connect(master);sfxG=ac.createGain();sfxG.gain.value=.5;sfxG.connect(master);
  noiseBuf=ac.createBuffer(1,ac.sampleRate*1,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  timer=setInterval(sched,40);return true}
function env(g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dec)}
function tone(f,t,dur,type='triangle',vol=.2,dest=sfxG,slide){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);env(g,t,.005,vol,dur);o.connect(g).connect(dest);o.start(t);o.stop(t+dur+.05)}
function noise(t,dur,vol=.2,freq=1200,type='lowpass',dest=sfxG){const s=ac.createBufferSource();s.buffer=noiseBuf;const f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=ac.createGain();env(g,t,.003,vol,dur);s.connect(f).connect(g).connect(dest);s.start(t,Math.random()*.5);s.stop(t+dur+.05)}
/* ----- music ----- */
const CH=[[60,64,67,71],[57,60,64,67],[62,65,69,72],[55,59,62,65]];
function sched(){if(!ac||muted)return;const m=scene.party?'party':scene.concert>0?'concert':scene.indoor?'indoor':'chill';mode=m;
  const bpm=m==='party'?124:m==='concert'?(STY_BPM[scene.style]||118):m==='indoor'?84:78;const s16=60/bpm/4;if(nextT<ac.currentTime)nextT=ac.currentTime+.05;
  const vol=m==='concert'?.25+.55*scene.concert:m==='party'?.8:.55;musicG.gain.setTargetAtTime(vol*.32,ac.currentTime,.3);
  while(nextT<ac.currentTime+.15){play(m,step16,nextT,s16);step16=(step16+1)%64;nextT+=s16}
  if(murG)murG.gain.setTargetAtTime(scene.rally||scene.indoor==='cafe'?.06:0,ac.currentTime,.5)}
function play(m,s,t,d){const bar=Math.floor(s/16),b=s%16,c=CH[(bar+chord)%4];
  if(m==='concert'&&scene.style&&STY_BPM[scene.style]){styleMusic(scene.style,chord*64+s,t,d);if(s===63)chord=(chord+1)%4;return}
  if(m==='chill'||m==='indoor'){if(b===0)c.forEach(n=>tone(N(n),t,d*15,'sine',.05,musicG));if(b===0||b===8)tone(N(c[0]-24),t,d*6,'sine',.18,musicG);if(b===4||b===12)noise(t,.05,.05,6000,'highpass',musicG);if(b%2===1)noise(t,.02,.02,8000,'highpass',musicG);if([2,6,10,14].includes(b)&&Math.random()<.5)tone(N(c[Math.floor(Math.random()*4)]+12),t,d*3,'triangle',.05,musicG)}
  else if(m==='concert'){if(b%4===0)tone(120,t,.18,'sine',.5,musicG,40);if(b===4||b===12)noise(t,.14,.25,1800,'bandpass',musicG);if(b%2===0)noise(t,.03,.06,7000,'highpass',musicG);tone(N(c[0]-24+(b%4===2?7:0)),t,d*1.8,'sawtooth',.06,musicG);if(b%2===0)tone(N(c[(b/2)%4]+12),t,d*1.6,'square',.04,musicG)}
  else{if(b%4===0)tone(130,t,.2,'sine',.6,musicG,40);if(b%4===2)tone(N(c[0]-24),t,d*1.5,'sawtooth',.1,musicG);if(b%2===1)noise(t,.03,.08,8000,'highpass',musicG);if(b===4||b===12)noise(t,.12,.18,2500,'bandpass',musicG);if(b%8===6)c.forEach(n=>tone(N(n+12),t,d*1.2,'square',.03,musicG))}
  if(s===63)chord=(chord+1)%4}

/* ----- concert songs: original, generated in the browser (nothing sampled, nothing copyrighted) -----
   style: pop (English) · hindi · boombap / trap / desirap (rap) · reggaeton (Spanish) */
const STY_BPM={pop:120,hindi:98,boombap:88,trap:140,desirap:96,reggaeton:94};
function voice(f,t,dur,type,vol,att,cut,slide){const o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);fl.type='lowpass';fl.frequency.setValueAtTime(cut||4000,t);fl.frequency.exponentialRampToValueAtTime(Math.max(200,(cut||4000)*.25),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+(att||.005));g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(fl).connect(g).connect(musicG);o.start(t);o.stop(t+dur+.05)}
const kick=(t,v=.5)=>tone(150,t,.18,'sine',v,musicG,42),snare=(t,v=.22)=>{noise(t,.15,v,1900,'bandpass',musicG);tone(190,t,.08,'triangle',v*.5,musicG)},
  clap=(t,v=.26)=>{noise(t,.09,v,1500,'bandpass',musicG);noise(t+.014,.1,v*.8,1500,'bandpass',musicG)},hat=(t,v=.06,open)=>noise(t,open?.13:.03,v,8000,'highpass',musicG),
  tGe=(t,v=.34)=>tone(112,t,.16,'sine',v,musicG,70),tNa=(t,v=.2)=>{tone(540,t,.07,'triangle',v,musicG,400);noise(t,.04,v*.4,3000,'bandpass',musicG)},tTin=(t,v=.18)=>tone(700,t,.12,'sine',v,musicG,620),tKa=(t,v=.12)=>noise(t,.05,v,2400,'bandpass',musicG);
const triad=(a,t,dur,vol,type,cut)=>a.forEach(n=>voice(N(n),t,dur,type||'sawtooth',vol,.12,cut||1800));
/* melodies as [step, midi note, length in steps] for each of the four bars of the loop */
const HOOK_POP=[[[0,76,2],[3,74,1],[4,72,2],[8,67,2],[10,72,1]],[[0,74,2],[3,71,1],[4,74,2],[8,67,4]],[[0,72,2],[3,76,1],[4,72,2],[8,69,2],[11,72,1]],[[0,72,2],[3,69,1],[4,72,2],[8,77,2],[10,76,2],[12,72,4]]];
const HOOK_HI=[[[0,69,3],[3,72,1],[4,71,2],[6,69,2],[8,64,4],[12,67,2],[14,69,2]],[[0,69,2],[2,72,2],[4,74,3],[7,72,1],[8,69,4],[12,65,4]],[[0,72,3],[3,71,1],[4,72,2],[6,76,2],[8,74,4],[12,72,4]],[[0,71,2],[2,74,2],[4,72,2],[6,71,2],[8,67,4],[12,69,2],[14,71,2]]];
const HOOK_RG=[[[0,81,2],[3,79,1],[6,76,2],[8,79,2],[11,76,1],[14,74,2]],[[0,79,2],[3,76,1],[6,74,2],[8,76,2],[11,74,1],[14,71,2]],[[0,77,2],[3,76,1],[6,72,2],[8,74,2],[11,72,1],[14,69,2]],[[0,76,3],[3,80,1],[6,83,2],[8,80,2],[11,76,2],[14,71,2]]];

/* vocals: a formant "singer" (male = lower, female = higher) plus sung/rapped lyrics through the phone's own speech voices */
const FORM={a:[800,1200],o:[500,900],e:[550,1800],i:[300,2300],u:[350,800]};
function sing(m,t,dur,fem,vowel,vol){const f0=N(m),g=ac.createGain(),o=ac.createOscillator(),v=ac.createOscillator(),vg=ac.createGain(),k=fem?1.17:1,fm=FORM[vowel]||FORM.a;
  o.type='sawtooth';o.frequency.setValueAtTime(f0,t);v.frequency.value=5.6;vg.gain.value=f0*.012;v.connect(vg).connect(o.frequency);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.05);g.gain.setValueAtTime(vol,t+Math.max(.06,dur*.75));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  const mix=ac.createGain();fm.forEach((fr,i)=>{const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr*k;bp.Q.value=i?9:7;const gg=ac.createGain();gg.gain.value=i?.55:1;o.connect(bp).connect(gg).connect(mix)});
  mix.connect(g).connect(musicG);o.start(t);v.start(t);o.stop(t+dur+.05);v.stop(t+dur+.05)}
const LANG={pop:'en-US',hindi:'hi-IN',boombap:'en-US',trap:'hi-IN',desirap:'hi-IN',reggaeton:'es-ES'};
const LYR={pop:['I feel it in my heart tonight','Dancing in the lights of Vashupur','Hold me close and never let go','Sing it louder, sing it with me'],
  hindi:['Dil mein basa hai Vashupur','Aaj raat chaand ke saath naachenge','Tu hi meri dhun hai, tu hi meri taal','Haath utha ke jhoomo sab'],
  boombap:['Check the mic, one two, Vashupur do you hear me','Started from the bus stand, now we on the stadium stage','Coffee in my cup, dreams in my head, never sleeping','Hands up if you are real, make some noise'],
  trap:['Sunn mere bhai, ye Vashupur ka swag hai','Zero se shuru kiya, ab stadium ki bheed hai','Chai ki chuski, mehnat ki raftaar','Haath upar karo, awaaz neeche mat karo'],
  desirap:['Sunn mere bhai, ye Vashupur ka swag hai','Zero se shuru kiya, ab stadium ki bheed hai','Chai ki chuski, mehnat ki raftaar','Haath upar karo, awaaz neeche mat karo'],
  reggaeton:['Baila conmigo esta noche, Vashupur','Dale dale, mueve el cuerpo','Suena el ritmo, no pares de bailar','Arriba las manos, que empieza la fiesta']};
let lyrI=0,lyrAt=0;
function lyric(sty,fem,k){if(muted||typeof speechSynthesis==='undefined'||!(k>.15)||performance.now()<lyrAt)return;try{
  if(speechSynthesis.speaking||speechSynthesis.pending)return;const L=LYR[sty];if(!L)return;const u=new SpeechSynthesisUtterance(L[lyrI++%L.length]),lang=LANG[sty];u.lang=lang;
  const vs=speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.toLowerCase().startsWith(lang.slice(0,2)));
  const want=fem?/female|woman|zira|samantha|heera|veena|lekha|aditi|paulina|monica|helena|google.*(uk|us).*female/i:/male|man|david|mark|hemant|ravi|jorge|pablo|diego|google.*male/i;
  u.voice=(vs.find(v=>want.test(v.name)&&!(!fem&&/female/i.test(v.name))))||vs[0]||null;
  const rap=sty==='boombap'||sty==='trap'||sty==='desirap';u.pitch=fem?1.55:.55;u.rate=rap?1.25:.95;u.volume=Math.min(1,.35+.65*k);
  speechSynthesis.speak(u);lyrAt=performance.now()+400}catch(e){}}
function styleMusic(sty,n,t,d){const bar=Math.floor(n/16)%16,b=n%16,ci=bar%4,sec=Math.floor(bar/4),full=sec>=2,F=!!scene.fem,VW=['a','o','e','a'][ci];
  if(b===0&&bar%2===0&&sec>=1)lyric(sty,F,scene.concert);
  if(sty==='pop'){const R=[48,43,45,41],C=[[60,64,67],[59,62,67],[57,60,64],[57,60,65]];
    if(b===0)triad(C[ci],t,d*16,sec?.02:.014,'sawtooth',1400);if(b%4===0)kick(t,.42);if(sec>=1&&(b===4||b===12))clap(t,.24);if(b%4===2)hat(t,.05,true);else if(b%2===1&&full)hat(t,.03);
    if(b===0||b===3||b===6||b===8||b===11||b===14)voice(N(R[ci]-12+(b===6||b===14?12:0)),t,d*2.4,'triangle',.2,.01,900);
    if(full&&b%2===0)voice(N(C[ci][(b/2)%3]+12),t,d*1.6,'square',.025,.005,3000);
    if(sec>=1)for(const [st,m,l] of HOOK_POP[ci])if(st===b){voice(N(m),t,d*l*1.4,'sawtooth',full?.04:.02,.02,3200);sing(m-(F?0:12),t,d*l*1.5,F,VW,.2)}}
  else if(sty==='hindi'){const R=[45,41,48,43],C=[[57,60,64],[57,60,65],[60,64,67],[59,62,67]];
    if(b===0)triad(C[ci],t,d*16,.016,'sawtooth',1300);
    const T={0:()=>{tGe(t);tNa(t)},2:()=>tGe(t,.22),4:()=>tNa(t),6:()=>tTin(t),8:()=>tNa(t),10:()=>tKa(t),12:()=>{tGe(t,.3);tTin(t,.14)},14:()=>tNa(t,.16)};if(T[b])T[b]();
    if(sec>=1&&b%4===0)tone(150,t,.16,'sine',.22,musicG,60);
    if(b===0||b===8)voice(N(R[ci]-12),t,d*7,'sine',.22,.02,900);
    for(const [st,m,l] of HOOK_HI[ci])if(st===b){if(sec>=1&&sec!==2)sing(m-(F?0:12),t,d*l*1.6,F,VW,.2);if(sec%2===0){voice(N(m),t,d*l*1.7,'sawtooth',.075,.004,3600);voice(N(m+12),t,d*l*.8,'triangle',.02,.004,5000)}else{const o=ac.createOscillator(),g=ac.createGain(),v=ac.createOscillator(),vg=ac.createGain();o.type='sine';o.frequency.value=N(m+12);v.frequency.value=5.5;vg.gain.value=N(m+12)*.012;v.connect(vg).connect(o.frequency);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.07,t+.05);g.gain.setValueAtTime(.07,t+d*l*1.3);g.gain.exponentialRampToValueAtTime(.0001,t+d*l*1.7);o.connect(g).connect(musicG);o.start(t);v.start(t);o.stop(t+d*l*1.8);v.stop(t+d*l*1.8)}}}
  else if(sty==='boombap'||sty==='desirap'){const R=[45,41,43,45],C=[[57,60,64],[57,60,65],[59,62,67],[57,60,64]];
    if(b===0||b===10||(sec%2&&b===7))kick(t,.5);if(b===4||b===12)snare(t,.26);const sw=b%2?d*.22:0;if(b%2===0||full)hat(t+sw,b%2?.03:.06);if(b===14)hat(t,.07,true);
    if(b===0)voice(N(R[ci]-24),t,d*9,'sine',.4,.01,500);if(b===10)voice(N(R[ci]-24),t,d*5,'sine',.34,.01,500,N(R[ci]-26));
    if(b===0||b===6||b===10)C[ci].forEach(m=>voice(N(m),t,d*3.2,'triangle',.05,.004,2200));
    if(sty==='desirap'){if(b===2||b===9)tNa(t,.2);if(b===6||b===14)tTin(t,.16);if(b===11)tKa(t,.14);
      for(const [st,m,l] of HOOK_HI[ci])if(st===b&&(b%4===0||sec>=2))voice(N(m),t,d*l*1.3,'sawtooth',.045,.01,2400)}}
  else if(sty==='trap'){const R=[45,41,43,40],C=[[57,60,64],[57,60,65],[59,62,67],[56,59,64]];
    if(b===0||b===10||(sec&&b===3))kick(t,.55);if(b===8)snare(t,.3),clap(t,.18);
    if(b%2===0)hat(t,.05);else if(full||b%4===3)hat(t,.03);if(b===14&&bar%2)for(let k=0;k<4;k++)hat(t+k*d*.25,.04);
    if(b===0||b===10)voice(N(R[ci]-24),t,d*(b?5:9),'sine',.5,.01,400,N(R[ci]-24)*.94);
    if(b===0)voice(N(C[ci][0]+12),t,d*4,'square',.04,.005,1800);if(b===6||b===12)voice(N(C[ci][2]+12),t,d*3,'square',.035,.005,1800);
    if(b===2||b===9)tTin(t,.14);if(sec>=2&&b%4===1)tNa(t,.12)}
  else if(sty==='reggaeton'){const R=[45,43,41,40],C=[[57,60,64],[55,59,62],[53,57,60],[52,56,59]];
    if(b%4===0)kick(t,.48);if(b===3||b===6||b===11||b===14){snare(t,.2);tone(950,t,.04,'square',.04,musicG)}if(b%2===0)hat(t,.04);if(b===10)hat(t,.06,true);
    if([0,3,6,8,11,14].includes(b))voice(N(R[ci]-12),t,d*(b===6||b===14?2:2.4),'sine',.34,.006,700);
    if(b===0)triad(C[ci],t,d*16,.012,'triangle',1500);
    if(b===3||b===6||b===11||b===14)C[ci].forEach(m=>voice(N(m+12),t,d*1.3,'square',.016,.003,2600));
    if(sec>=1)for(const [st,m,l] of HOOK_RG[ci])if(st===b){voice(N(m),t,d*l*1.2,'triangle',.04,.004,3800);sing(m-(F?7:19),t,d*l*1.3,F,VW,.2)}}}
export const snd={get muted(){return muted},
  unlock(){if(ensure()&&ac.state==='suspended')ac.resume();if(!murmur&&ac){murmur=ac.createBufferSource();murmur.buffer=noiseBuf;murmur.loop=true;const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=500;f.Q.value=.6;murG=ac.createGain();murG.gain.value=0;murmur.connect(f).connect(murG).connect(master);murmur.start()}},
  toggle(){muted=!muted;try{localStorage.setItem('ow_mute',muted?'1':'0')}catch(e){}if(ensure())master.gain.setTargetAtTime(muted?0:1,ac.currentTime,.05)},
  setScene(s){scene=s},mode(){},music(){if(ac)musicG.gain.setTargetAtTime(0,ac.currentTime,.1)},
  step(){if(!ac)return;noise(ac.currentTime,.05,.08,700)},
  land(){if(!ac)return;noise(ac.currentTime,.1,.2,400)},
  jump(){if(!ac)return;tone(300,ac.currentTime,.14,'square',.06,sfxG,620)},
  click(){if(!ac)return;tone(900,ac.currentTime,.04,'triangle',.08)},
  blip(){if(!ac)return;tone(520+Math.random()*180,ac.currentTime,.04,'square',.025)},
  bell(){if(!ac||muted)return;const t=ac.currentTime;for(let i=0;i<3;i++){tone(N(88),t+i*.28,.9,'sine',.16);tone(N(95),t+i*.28,.7,'triangle',.06)}},
  gun(){if(!ac||muted)return;const t=ac.currentTime;noise(t,.25,.5,2500,'lowpass');tone(90,t,.2,'square',.12,sfxG,40)},
  chime(){if(!ac)return;const t=ac.currentTime;tone(N(76),t,.15,'triangle',.18);tone(N(83),t+.09,.25,'triangle',.18)},
  fanfare(){if(!ac)return;const t=ac.currentTime;[72,76,79,84].forEach((n,i)=>tone(N(n),t+i*.1,.3,'square',.08))},
  door(){if(!ac)return;noise(ac.currentTime,.25,.15,900,'bandpass')},
  splash(){if(!ac)return;noise(ac.currentTime,.6,.35,1400,'lowpass')},
  kick(){if(!ac)return;tone(160,ac.currentTime,.12,'sine',.3,sfxG,60)},
  brew(){if(!ac)return;noise(ac.currentTime,1.2,.12,3000,'bandpass')},
  gibber(n){if(!ac)return;const t=ac.currentTime;for(let i=0;i<Math.min(28,n/2);i++)tone(150+Math.random()*90,t+i*.09,.07,'sawtooth',.03)},
  /* recorded clips (fetched the first time they are needed) */
  sample(url,vol=1,pan=0){if(!ac||muted)return;const c=SAMPLES[url]||(SAMPLES[url]=fetch(url).then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>ac.decodeAudioData(b,ok,no))).catch(()=>null));
    c.then(buf=>{if(!buf)return;const s=ac.createBufferSource(),g=ac.createGain();s.buffer=buf;g.gain.value=vol*1.6;let n=s.connect(g);if(pan&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));n=n.connect(p)}n.connect(sfxG);s.start()})},
  /* looping background bed (the bus stand crowd); k = loudness 0..1 */
  bed(url,k){if(!ac)return;const b=BEDS[url];if(!b){if(!(k>0))return;const o=BEDS[url]={g:ac.createGain(),on:false};o.g.gain.value=0;o.g.connect(sfxG);
      (SAMPLES[url]||(SAMPLES[url]=fetch(url).then(r=>r.arrayBuffer()).then(x=>new Promise((ok,no)=>ac.decodeAudioData(x,ok,no))).catch(()=>null))).then(buf=>{if(!buf)return;const s=ac.createBufferSource();s.buffer=buf;s.loop=true;s.connect(o.g);s.start();o.on=true});return}
    b.g.gain.setTargetAtTime(muted?0:k*.5,ac.currentTime,.4)},
  /* street sounds: horns, a bike revving, a police whistle */
  horn(vol=1,big=0){if(!ac||muted)return;const t=ac.currentTime,g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.07*vol,t+.02);g.gain.setValueAtTime(.07*vol,t+.32);g.gain.linearRampToValueAtTime(0,t+.4);g.connect(sfxG);
    for(const f of big?[196,247]:[392,494]){const o=ac.createOscillator();o.type='square';o.frequency.value=f;o.connect(g);o.start(t);o.stop(t+.42)}},
  rev(vol=1){if(!ac||muted)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';f.type='lowpass';f.frequency.value=900;
    o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(210,t+.35);o.frequency.exponentialRampToValueAtTime(90,t+.9);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.08*vol,t+.05);g.gain.linearRampToValueAtTime(0,t+.95);
    o.connect(f).connect(g).connect(sfxG);o.start(t);o.stop(t+1)},
  whistle(){if(!ac||muted)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),l=ac.createOscillator(),lg=ac.createGain();o.frequency.value=2600;l.frequency.value=28;lg.gain.value=180;l.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.03);g.gain.setValueAtTime(.05,t+.55);g.gain.linearRampToValueAtTime(0,t+.65);o.connect(g).connect(sfxG);o.start(t);l.start(t);o.stop(t+.7);l.stop(t+.7)},
  /* jail: an alarm blip when you cross the line, a deep hit when you are wasted */
  alarm(){if(!ac||muted)return;const t=ac.currentTime;for(let i=0;i<2;i++){const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=880;g.gain.setValueAtTime(0,t+i*.22);g.gain.linearRampToValueAtTime(.05,t+i*.22+.02);g.gain.linearRampToValueAtTime(0,t+i*.22+.16);o.connect(g).connect(sfxG);o.start(t+i*.22);o.stop(t+i*.22+.18)}},
  boom(){if(!ac||muted)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(32,t+1.6);g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.001,t+2);o.connect(g).connect(sfxG);o.start(t);o.stop(t+2.1)},
  /* fire-truck siren: a slow two-tone wail, k = loudness 0..1 */
  siren(k){if(!ac)return;if(!sirO){if(!k)return;sirO=ac.createOscillator();sirO.type='triangle';sirO.frequency.value=760;const lfo=ac.createOscillator(),lg=ac.createGain();lfo.type='triangle';lfo.frequency.value=.45;lg.gain.value=260;lfo.connect(lg).connect(sirO.frequency);lfo.start();
      sirG=ac.createGain();sirG.gain.value=0;sirO.connect(sirG).connect(sfxG);sirO.start()}sirG.gain.setTargetAtTime(k*k*.09,ac.currentTime,.15)},
  motor(k){if(!ac)return;if(!motorO){motorO=ac.createOscillator();motorO.type='sawtooth';motorG=ac.createGain();motorG.gain.value=0;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=900;motorO.connect(f).connect(motorG).connect(sfxG);motorO.start()}motorO.frequency.setTargetAtTime(80+k*260,ac.currentTime,.1);motorG.gain.setTargetAtTime(k>0?.03+k*.05:0,ac.currentTime,.1)}
};

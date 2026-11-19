/* Tiny procedural audio: no files, all generated in the browser. */
const SAMPLES={};let sirO=null,sirG=null;let ac=null,master=null,musicG=null,sfxG=null,noiseBuf=null,motorO=null,motorG=null,murmur=null,murG=null;
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
  const bpm=m==='party'?124:m==='concert'?118:m==='indoor'?84:78;const s16=60/bpm/4;if(nextT<ac.currentTime)nextT=ac.currentTime+.05;
  const vol=m==='concert'?.25+.55*scene.concert:m==='party'?.8:.55;musicG.gain.setTargetAtTime(vol*.32,ac.currentTime,.3);
  while(nextT<ac.currentTime+.15){play(m,step16,nextT,s16);step16=(step16+1)%64;nextT+=s16}
  if(murG)murG.gain.setTargetAtTime(scene.rally||scene.indoor==='cafe'?.06:0,ac.currentTime,.5)}
function play(m,s,t,d){const bar=Math.floor(s/16),b=s%16,c=CH[(bar+chord)%4];
  if(m==='chill'||m==='indoor'){if(b===0)c.forEach(n=>tone(N(n),t,d*15,'sine',.05,musicG));if(b===0||b===8)tone(N(c[0]-24),t,d*6,'sine',.18,musicG);if(b===4||b===12)noise(t,.05,.05,6000,'highpass',musicG);if(b%2===1)noise(t,.02,.02,8000,'highpass',musicG);if([2,6,10,14].includes(b)&&Math.random()<.5)tone(N(c[Math.floor(Math.random()*4)]+12),t,d*3,'triangle',.05,musicG)}
  else if(m==='concert'){if(b%4===0)tone(120,t,.18,'sine',.5,musicG,40);if(b===4||b===12)noise(t,.14,.25,1800,'bandpass',musicG);if(b%2===0)noise(t,.03,.06,7000,'highpass',musicG);tone(N(c[0]-24+(b%4===2?7:0)),t,d*1.8,'sawtooth',.06,musicG);if(b%2===0)tone(N(c[(b/2)%4]+12),t,d*1.6,'square',.04,musicG)}
  else{if(b%4===0)tone(130,t,.2,'sine',.6,musicG,40);if(b%4===2)tone(N(c[0]-24),t,d*1.5,'sawtooth',.1,musicG);if(b%2===1)noise(t,.03,.08,8000,'highpass',musicG);if(b===4||b===12)noise(t,.12,.18,2500,'bandpass',musicG);if(b%8===6)c.forEach(n=>tone(N(n+12),t,d*1.2,'square',.03,musicG))}
  if(s===63)chord=(chord+1)%4}
export const snd={get muted(){return muted},
  unlock(){if(ensure()&&ac.state==='suspended')ac.resume();if(!murmur&&ac){murmur=ac.createBufferSource();murmur.buffer=noiseBuf;murmur.loop=true;const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=500;f.Q.value=.6;murG=ac.createGain();murG.gain.value=0;murmur.connect(f).connect(murG).connect(master);murmur.start()}},
  toggle(){muted=!muted;try{localStorage.setItem('ow_mute',muted?'1':'0')}catch(e){}if(ensure())master.gain.setTargetAtTime(muted?0:1,ac.currentTime,.05)},
  setScene(s){scene=s},mode(){},music(){if(ac)musicG.gain.setTargetAtTime(0,ac.currentTime,.1)},
  step(){if(!ac)return;noise(ac.currentTime,.05,.08,700)},
  land(){if(!ac)return;noise(ac.currentTime,.1,.2,400)},
  jump(){if(!ac)return;tone(300,ac.currentTime,.14,'square',.06,sfxG,620)},
  click(){if(!ac)return;tone(900,ac.currentTime,.04,'triangle',.08)},
  blip(){if(!ac)return;tone(520+Math.random()*180,ac.currentTime,.04,'square',.025)},
  chime(){if(!ac)return;const t=ac.currentTime;tone(N(76),t,.15,'triangle',.18);tone(N(83),t+.09,.25,'triangle',.18)},
  fanfare(){if(!ac)return;const t=ac.currentTime;[72,76,79,84].forEach((n,i)=>tone(N(n),t+i*.1,.3,'square',.08))},
  door(){if(!ac)return;noise(ac.currentTime,.25,.15,900,'bandpass')},
  splash(){if(!ac)return;noise(ac.currentTime,.6,.35,1400,'lowpass')},
  kick(){if(!ac)return;tone(160,ac.currentTime,.12,'sine',.3,sfxG,60)},
  brew(){if(!ac)return;noise(ac.currentTime,1.2,.12,3000,'bandpass')},
  gibber(n){if(!ac)return;const t=ac.currentTime;for(let i=0;i<Math.min(28,n/2);i++)tone(150+Math.random()*90,t+i*.09,.07,'sawtooth',.03)},
  /* recorded clips (fetched the first time they are needed) */
  sample(url,vol=1){if(!ac||muted)return;const c=SAMPLES[url]||(SAMPLES[url]=fetch(url).then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>ac.decodeAudioData(b,ok,no))).catch(()=>null));
    c.then(buf=>{if(!buf)return;const s=ac.createBufferSource(),g=ac.createGain();s.buffer=buf;g.gain.value=vol*1.6;s.connect(g).connect(sfxG);s.start()})},
  /* street sounds: horns, a bike revving, a police whistle */
  horn(vol=1,big=0){if(!ac||muted)return;const t=ac.currentTime,g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.07*vol,t+.02);g.gain.setValueAtTime(.07*vol,t+.32);g.gain.linearRampToValueAtTime(0,t+.4);g.connect(sfxG);
    for(const f of big?[196,247]:[392,494]){const o=ac.createOscillator();o.type='square';o.frequency.value=f;o.connect(g);o.start(t);o.stop(t+.42)}},
  rev(vol=1){if(!ac||muted)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';f.type='lowpass';f.frequency.value=900;
    o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(210,t+.35);o.frequency.exponentialRampToValueAtTime(90,t+.9);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.08*vol,t+.05);g.gain.linearRampToValueAtTime(0,t+.95);
    o.connect(f).connect(g).connect(sfxG);o.start(t);o.stop(t+1)},
  whistle(){if(!ac||muted)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),l=ac.createOscillator(),lg=ac.createGain();o.frequency.value=2600;l.frequency.value=28;lg.gain.value=180;l.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.03);g.gain.setValueAtTime(.05,t+.55);g.gain.linearRampToValueAtTime(0,t+.65);o.connect(g).connect(sfxG);o.start(t);l.start(t);o.stop(t+.7);l.stop(t+.7)},
  /* fire-truck siren: a slow two-tone wail, k = loudness 0..1 */
  siren(k){if(!ac)return;if(!sirO){if(!k)return;sirO=ac.createOscillator();sirO.type='triangle';sirO.frequency.value=760;const lfo=ac.createOscillator(),lg=ac.createGain();lfo.type='triangle';lfo.frequency.value=.45;lg.gain.value=260;lfo.connect(lg).connect(sirO.frequency);lfo.start();
      sirG=ac.createGain();sirG.gain.value=0;sirO.connect(sirG).connect(sfxG);sirO.start()}sirG.gain.setTargetAtTime(k*k*.09,ac.currentTime,.15)},
  motor(k){if(!ac)return;if(!motorO){motorO=ac.createOscillator();motorO.type='sawtooth';motorG=ac.createGain();motorG.gain.value=0;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=900;motorO.connect(f).connect(motorG).connect(sfxG);motorO.start()}motorO.frequency.setTargetAtTime(80+k*260,ac.currentTime,.1);motorG.gain.setTargetAtTime(k>0?.03+k*.05:0,ac.currentTime,.1)}
};

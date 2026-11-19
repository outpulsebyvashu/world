import {WA,STORY,NUMS,ROLES,SKILLS,PROJECTS} from './data.js';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bean='<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="7" ry="9.5" fill="#6b3e22"/><path d="M12 3.5c-2.5 3-2.5 14 0 17" stroke="#2a160a" stroke-width="1.6" fill="none"/></svg>';
export const HUD=`
<div class="ow-hud">
  <div class="ow-top">
    <button type="button" class="ow-map" aria-label="Open the town map"><canvas width="176" height="176"></canvas></button>
    <div class="ow-mid"><button type="button" class="ow-loc" aria-label="Current town (double-tap for menu)">OUTPULSE SPACE</button><p class="ow-zone" aria-live="polite"></p><span class="ow-online" hidden><i></i><b>1</b> online</span></div>
    <div class="ow-right">
      <span class="ow-beans" role="status" aria-label="Coffee beans found">${bean}<b>0/8</b></span>
      <div class="ow-row"><button type="button" class="ow-me ow-ib" aria-label="Your profile and character"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg></button><button type="button" class="ow-drone ow-ib" aria-label="Drone view" aria-pressed="false"><svg viewBox="0 0 24 24"><rect x="9" y="10" width="6" height="4" rx="1.2"/><path d="M9.5 10.5L7 8M14.5 10.5L17 8M9.5 13.5L7 16M14.5 13.5L17 16"/><circle cx="5.5" cy="6.5" r="2.3"/><circle cx="18.5" cy="6.5" r="2.3"/><circle cx="5.5" cy="17.5" r="2.3"/><circle cx="18.5" cy="17.5" r="2.3"/></svg></button><button type="button" class="ow-time ow-ib"></button><button type="button" class="ow-mute ow-ib"></button></div>
      <button type="button" class="ow-cvb">Quick CV</button>
    </div>
  </div>
  <div class="ow-quest" aria-live="polite"></div>
  <div class="ow-sub" hidden aria-live="polite"></div>
  <div class="ow-bubbles" aria-hidden="true"></div>
  <div class="ow-joy" aria-label="Movement joystick"><div class="ow-knob"></div></div>
  <div class="ow-btns">
    <button type="button" class="ow-act" hidden></button>
    <div class="ow-brow"><div class="ow-col"><button type="button" class="ow-chat" aria-label="Say something"><svg viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z"/></svg></button><button type="button" class="ow-emo" aria-label="Emotes"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 14.5c2 2.5 6 2.5 8 0"/><circle cx="9" cy="10" r=".8" fill="currentColor"/><circle cx="15" cy="10" r=".8" fill="currentColor"/></svg></button></div>
    <button type="button" class="ow-down" aria-label="Fly down" hidden><svg viewBox="0 0 24 24"><path d="M6 10l6 6 6-6"/></svg><span>DOWN</span></button>
    <button type="button" class="ow-jump" aria-label="Jump"><svg viewBox="0 0 24 24"><path d="M6 14l6-6 6 6"/></svg><span>JUMP</span></button></div>
  </div>
  <div class="ow-phrases" hidden></div>
  <div class="ow-emotes" hidden><button type="button" data-e="wave">Wave</button><button type="button" data-e="dance">Dance</button><button type="button" data-e="sip">Sip coffee</button><button type="button" data-e="sixseven">Six-seven</button></div>
  <div class="ow-dlg" hidden role="dialog" aria-live="polite"><b class="ow-dn"></b><p class="ow-dt"></p><div class="ow-dc"></div><button type="button" class="ow-dx" data-close aria-label="Close dialog">×</button></div>
  <div class="ow-toast" role="status" aria-live="polite"></div>
  <div class="ow-fade"></div>
</div>
<div class="ow-ov ow-card" hidden role="dialog" aria-modal="true" aria-label="Project"><div class="ow-pan"><div class="sw"></div><p class="k"></p><h2></h2><p class="d"></p><div class="ow-pa"><a class="ow-btn p" target="_blank" rel="noopener">Open ↗</a><button type="button" class="ow-btn" data-close>Back to town</button></div></div></div>
<div class="ow-ov ow-cv" hidden role="dialog" aria-modal="true" aria-label="Quick-read CV"><div class="ow-pan ow-cvp">
  <button type="button" class="x" data-close aria-label="Close CV">×</button>
  <p class="k">Quick-read CV</p><h2>Vashudev Sharma</h2><p class="d">Specialty coffee consultant & founder · Mysuru / Raipur</p>
  <p>${esc(STORY)}</p>
  <h3>In numbers</h3><ul class="nums">${NUMS.map(n=>`<li><b>${esc(n[0])}</b> ${esc(n[1])}</li>`).join('')}</ul>
  <h3>Experience</h3><ul>${ROLES.map(r=>`<li><b>${esc(r[1])}</b>, ${esc(r[2])} <span>${esc(r[0])}</span></li>`).join('')}</ul>
  <h3>Skills</h3><ul>${SKILLS.map(s=>`<li><b>${esc(s[0])}:</b> ${esc(s[1])}</li>`).join('')}</ul>
  <h3>Projects</h3><ul>${PROJECTS.map(p=>`<li>${p.href?`<a href="${esc(p.href.startsWith('/')?'https://vashudev.outpulse.company'+p.href:p.href)}" target="_blank" rel="noopener">${esc(p.n)} ↗</a>`:`<b>${esc(p.n)}</b>`} · ${esc(p.tag)} · ${esc(p.st)}</li>`).join('')}</ul>
  <div class="ow-pa"><a class="ow-btn p" href="${WA}" target="_blank" rel="noopener">WhatsApp me</a><button type="button" class="ow-btn" data-close>Back to town</button></div></div></div>
<div class="ow-ov ow-bigmap" hidden role="dialog" aria-modal="true" aria-label="Town map"><div class="ow-pan ow-mapp"><button type="button" class="x" data-close aria-label="Close map">×</button><p class="k">Town map · tap a building to walk there</p><canvas></canvas></div></div>
<div class="ow-ov ow-menu" hidden role="dialog" aria-modal="true" aria-label="Menu"><div class="ow-pan"><button type="button" class="x" data-close aria-label="Close menu">×</button><p class="k">Paused</p><h2>Outpulse Space</h2>
  <p class="d">A tiny open world that is secretly a portfolio. Move with the joystick or WASD, drag to look, tap to walk, jump with Space. Find 8 coffee beans to unlock secrets.</p>
  <div class="ow-pa"><button type="button" class="ow-btn p" data-close>Resume</button><a class="ow-btn" href="https://vashudev.outpulse.company" target="_blank" rel="noopener">Portfolio ↗</a><button type="button" class="ow-btn" onclick="if(confirm('Reset beans, quests and secrets?')){['ow_beans','ow_unlocked','ow_quest','ow_eggs','ow_hint'].forEach(k=>localStorage.removeItem(k));location.reload()}">Reset progress</button></div></div></div>
<div class="ow-ov ow-hint" hidden role="dialog" aria-modal="true" aria-label="Welcome"><div class="ow-pan"><p class="k">Welcome to Outpulse Space</p><h2>Vashupur</h2>
  <ul class="ow-how"><li><b>Move</b> joystick (bottom-left) · WASD</li><li><b>Look</b> drag the screen · pinch to zoom</li><li><b>Walk to</b> tap the ground or anything</li><li><b>Jump</b> button · Space</li><li><b>Talk / enter</b> the yellow action button · E</li></ul>
  <p class="d">Six towns, one bus. Every building, billboard and character is part of my portfolio. Blue-fenced plots? Something's cooking. Find all 8 coffee beans across the towns for secrets.</p>
  <div class="ow-pa"><button type="button" class="ow-btn p" data-go>Start exploring</button><button type="button" class="ow-btn" data-cv>Just show me the CV</button></div></div></div>
<div class="ow-ov ow-bus" hidden role="dialog" aria-modal="true" aria-label="Bus route"><div class="ow-pan"><button type="button" class="x" data-close aria-label="Close">×</button><p class="k">Vashu Transport · the only way between towns</p><h2>Where to?</h2><div class="ow-towns"></div></div></div>
<div class="ow-ov ow-acct" hidden role="dialog" aria-modal="true" aria-labelledby="ow-acct-h"><div class="ow-pan"><button type="button" class="x" data-close aria-label="Close">×</button><p class="k">Outpulse Space · players</p><h2 id="ow-acct-h">Who's playing?</h2>
  <div class="ow-tabs" role="tablist"><button type="button" role="tab" data-tab="guest" aria-selected="true">Guest</button><button type="button" role="tab" data-tab="signup" aria-selected="false">Sign up</button><button type="button" role="tab" data-tab="login" aria-selected="false">Log in</button></div>
  <form class="ow-f" data-f="guest"><label for="ow-gn">Your name</label><input id="ow-gn" name="name" maxlength="16" autocomplete="nickname" required><p class="hint">Play now. Sign up any time to keep your look, beans and secrets.</p><button type="submit" class="pri">Play as guest</button></form>
  <form class="ow-f" data-f="signup" hidden><label for="ow-su">Username</label><input id="ow-su" name="username" maxlength="16" autocomplete="username" autocapitalize="none" spellcheck="false" required><p class="hint">3 to 16 letters, numbers or _</p><label for="ow-sp">Password</label><input id="ow-sp" name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required><p class="hint">At least 8 characters</p><p class="err" role="alert"></p><button type="submit" class="pri">Create account</button></form>
  <form class="ow-f" data-f="login" hidden><label for="ow-lu">Username</label><input id="ow-lu" name="username" maxlength="16" autocomplete="username" autocapitalize="none" spellcheck="false" required><label for="ow-lp">Password</label><input id="ow-lp" name="password" type="password" maxlength="128" autocomplete="current-password" required><p class="err" role="alert"></p><button type="submit" class="pri">Log in</button></form>
  <div class="ow-f" data-f="me" hidden><p class="d">Signed in as <b class="u"></b>. Your look, beans and secrets are saved to your account.</p><button type="button" class="sec" data-act="logout">Log out</button></div>
  <button type="button" class="sec ow-tocustom">Customise character</button></div></div>
<div class="ow-char" hidden role="dialog" aria-label="Customise your character"><div class="ow-chead"><b>Your character</b><button type="button" class="sec" data-ch="random">Random</button><button type="button" class="pri" data-ch="done">Done</button></div><div class="ow-cbody"></div></div>
<div class="ow-ov ow-lift" hidden role="dialog" aria-modal="true" aria-label="Lift"><div class="ow-pan"><button type="button" class="x" data-close aria-label="Close">×</button><p class="k">Lift</p><h2>Which floor?</h2><div class="ow-floors"></div></div></div>
<div class="ow-ride" hidden aria-live="polite"><div><svg viewBox="0 0 64 40" aria-hidden="true"><rect x="2" y="4" width="60" height="28" rx="6" fill="#ffcc3a" stroke="#141414" stroke-width="3"/><rect x="8" y="9" width="12" height="9" rx="2" fill="#26323d"/><rect x="24" y="9" width="12" height="9" rx="2" fill="#26323d"/><rect x="40" y="9" width="16" height="9" rx="2" fill="#26323d"/><circle cx="16" cy="33" r="5" fill="#141414"/><circle cx="48" cy="33" r="5" fill="#141414"/></svg><p class="k">Next stop</p><b></b><em></em><i></i></div></div>`;

export const CSS=`
.ow{position:fixed;inset:0;overflow:hidden;background:#8fd0ff;touch-action:none;-webkit-user-select:none;user-select:none;font-family:"Inter Tight",system-ui,sans-serif;color:#141414;-webkit-tap-highlight-color:transparent}
.ow-cv3{position:absolute;inset:0;width:100%;height:100%;display:block}
.ow button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ow :focus-visible{outline:3px solid #ffcc3a;outline-offset:2px}
.ow-hud{position:absolute;inset:0;pointer-events:none}
.ow-hud>*,.ow-top>*,.ow-right>*{pointer-events:auto}
.ow-top{position:absolute;top:calc(8px + env(safe-area-inset-top));left:8px;right:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;pointer-events:none}
.ow-map{width:88px;height:88px;padding:0;border:3px solid #141414;border-radius:16px;overflow:hidden;background:#79c267;box-shadow:0 4px 0 #141414}
.ow-map canvas{width:100%;height:100%;display:block}
.ow-mid{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;min-width:0}
.ow .ow-loc{pointer-events:auto;background:#141414;color:#f4efe6;border:0;border-radius:999px;padding:0 14px;min-height:36px;font-weight:800;font-size:11px;letter-spacing:.08em;white-space:nowrap}
.ow-zone{margin:0;font:800 15px "Bricolage Grotesque",sans-serif;color:#fff;text-shadow:0 2px 0 #141414,0 0 6px rgba(0,0,0,.4);opacity:0;text-align:center}
.ow-zone.on{animation:owz 2.6s ease}
@keyframes owz{0%{opacity:0;transform:translateY(-6px)}12%,75%{opacity:1;transform:none}100%{opacity:0}}
.ow-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.ow-row{display:flex;gap:6px}
.ow-beans{display:flex;align-items:center;gap:4px;background:#fff;border:3px solid #141414;border-radius:999px;padding:3px 10px 3px 5px;font:800 14px "Inter Tight",sans-serif;box-shadow:0 3px 0 #141414}
.ow-beans svg{width:20px;height:20px}
.ow-ib{width:44px;height:44px;border-radius:12px;border:3px solid #141414;background:#fff;display:grid;place-items:center;padding:0;box-shadow:0 3px 0 #141414;position:relative}
.ow-ib svg{width:20px;height:20px;fill:none;stroke:#141414;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ow-ib span{position:absolute;bottom:-1px;font-size:8px;font-weight:800;line-height:1;display:none}
.ow-cvb{min-height:36px;border:3px solid #141414;border-radius:999px;background:#ffcc3a;font-weight:800;font-size:12px;padding:0 12px;box-shadow:0 3px 0 #141414}
.ow-quest{position:absolute;top:calc(104px + env(safe-area-inset-top));left:8px;display:flex;flex-direction:column;gap:4px;max-width:62vw;pointer-events:none}
.ow-quest span{background:rgba(20,20,20,.72);color:#fff;font:600 12px/1.3 "Inter Tight",sans-serif;padding:5px 9px;border-radius:8px;width:max-content;max-width:100%}
.ow-sub{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(210px + env(safe-area-inset-bottom));width:min(92vw,560px);background:rgba(20,20,20,.85);color:#fff;border-radius:12px;padding:10px 14px;font:500 15px/1.4 "Inter Tight",sans-serif;text-align:center;pointer-events:none}
.ow-sub b{color:#ffcc3a}
.ow-bubbles{position:absolute;inset:0;pointer-events:none}
.ow-bub{position:absolute;left:0;top:0;background:#fff;border:2.5px solid #141414;border-radius:12px;padding:5px 10px;font:700 13px "Inter Tight",sans-serif;white-space:nowrap;box-shadow:0 3px 0 #141414}
.ow-joy{position:absolute;left:calc(18px + env(safe-area-inset-left));bottom:calc(22px + env(safe-area-inset-bottom));width:132px;height:132px;border-radius:50%;background:rgba(255,255,255,.28);border:3px solid rgba(20,20,20,.55);touch-action:none;display:grid;place-items:center}
.ow-knob{width:58px;height:58px;border-radius:50%;background:#fff;border:3px solid #141414;box-shadow:0 4px 0 #141414;pointer-events:none}
.ow-btns{position:absolute;right:calc(14px + env(safe-area-inset-right));bottom:calc(22px + env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:flex-end;gap:12px}
.ow-brow{display:flex;align-items:flex-end;gap:10px}.ow-col{display:flex;flex-direction:column;gap:10px}
.ow-chat svg{stroke-linejoin:round}
.ow-online{display:inline-flex;align-items:center;gap:6px;background:rgba(20,20,20,.78);color:#fff;border-radius:999px;padding:3px 10px;font:700 11px "Inter Tight",sans-serif}.ow-online[hidden]{display:none}.ow-online i{width:8px;height:8px;border-radius:50%;background:#3ddc84}
.ow-phrases{position:absolute;right:14px;bottom:calc(130px + env(safe-area-inset-bottom));display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#fff;border:3px solid #141414;border-radius:16px;padding:10px;box-shadow:0 4px 0 #141414;max-width:min(360px,calc(100vw - 28px));z-index:4}.ow-phrases[hidden]{display:none}
.ow-phrases button{min-height:44px;border:2px solid #141414;border-radius:10px;background:#f4efe6;font:700 13px "Inter Tight",sans-serif;padding:0 10px;text-align:left}
.ow-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 14px;background:#f1ece2;border-radius:14px;padding:4px}
.ow-tabs button{min-height:44px;border:0;border-radius:10px;background:none;font:800 14px "Inter Tight",sans-serif;color:#555}.ow-tabs button[aria-selected="true"]{background:#141414;color:#fff}
.ow-f{display:flex;flex-direction:column;gap:6px}.ow-f[hidden]{display:none}.ow-f label{font:700 13px "Inter Tight",sans-serif;margin-top:6px}
.ow-f input{min-height:48px;border:2px solid #141414;border-radius:12px;padding:0 14px;font:500 16px "Inter Tight",sans-serif;background:#fff}.ow-f input:focus-visible{outline:3px solid #ff6a3d;outline-offset:2px}
.ow-f .hint{margin:0;color:#666;font-size:13px}.ow-f .err{margin:4px 0 0;color:#c62828;font:700 14px "Inter Tight",sans-serif;min-height:0}.ow-f .err:empty{display:none}
.ow .pri,.ow .sec{min-height:48px;border-radius:14px;border:3px solid #141414;font:800 15px "Inter Tight",sans-serif;padding:0 18px;box-shadow:0 3px 0 #141414}.ow .pri{background:#ff6a3d;color:#141414;margin-top:10px}.ow .sec{background:#fff;color:#141414}
.ow .pri:disabled{opacity:.5}.ow-tocustom{margin-top:12px;width:100%}
.ow-char{position:absolute;left:0;right:0;bottom:0;height:min(58dvh,560px);background:#fff;border-top:3px solid #141414;border-radius:22px 22px 0 0;box-shadow:0 -4px 0 rgba(0,0,0,.12);z-index:6;display:flex;flex-direction:column;padding-bottom:env(safe-area-inset-bottom)}.ow-char[hidden]{display:none}
.ow-chead{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:2px solid #eee}.ow-chead b{flex:1;font:800 18px "Bricolage Grotesque",sans-serif}.ow-chead .pri{margin:0}
.ow-cbody{overflow:auto;padding:6px 14px 18px;-webkit-overflow-scrolling:touch}
.ow-cbody h4{margin:14px 0 8px;font:800 12px "Inter Tight",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#666}
.ow-chips{display:flex;flex-wrap:wrap;gap:8px}.ow-chips button{min-height:44px;padding:0 14px;border:2px solid #141414;border-radius:999px;background:#fff;font:700 14px "Inter Tight",sans-serif}.ow-chips button[aria-pressed="true"]{background:#141414;color:#fff}
.ow-sw{display:flex;flex-wrap:wrap;gap:6px}.ow-sw button{width:44px;height:44px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #cfcfcf;padding:0}.ow-sw button[aria-pressed="true"]{box-shadow:0 0 0 3px #141414}
.ow.dress .ow-hud{visibility:hidden}
.ow-down{width:66px;height:66px;border-radius:50%;border:3px solid #141414;background:#fff;box-shadow:0 4px 0 #141414;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;font-size:10px;touch-action:none;padding:0}.ow-down[hidden]{display:none}
.ow-down svg{width:24px;height:24px;fill:none;stroke:#141414;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.ow-down:active{transform:translateY(3px);box-shadow:0 1px 0 #141414}
.ow-ib[aria-pressed="true"]{background:#ffcc3a}
.ow.drone .ow-emo,.ow.drone .ow-chat,.ow.drone .ow-act{display:none}
.ow-jump{width:84px;height:84px;border-radius:50%;border:3px solid #141414;background:#fff;box-shadow:0 5px 0 #141414;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;font-size:11px;touch-action:none}
.ow-jump svg{width:30px;height:30px;fill:none;stroke:#141414;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.ow-jump:active,.ow-emo:active,.ow-act:active,.ow-ib:active{transform:translateY(3px);box-shadow:0 1px 0 #141414}
.ow-emo,.ow-chat{width:52px;height:52px;border-radius:50%;border:3px solid #141414;background:#fff;box-shadow:0 4px 0 #141414;display:grid;place-items:center;padding:0}
.ow-emo svg,.ow-chat svg{width:26px;height:26px;fill:none;stroke:#141414;stroke-width:2}
.ow-act{min-height:52px;max-width:60vw;padding:0 18px;border-radius:999px;border:3px solid #141414;background:#ffcc3a;font-weight:800;font-size:15px;box-shadow:0 4px 0 #141414;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;animation:owp 1.6s ease-in-out infinite}
@keyframes owp{50%{transform:scale(1.04)}}
.ow-emotes{position:absolute;right:14px;bottom:calc(130px + env(safe-area-inset-bottom));display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#fff;border:3px solid #141414;border-radius:16px;padding:10px;box-shadow:0 4px 0 #141414}
.ow-emotes button{min-height:44px;border:2px solid #141414;border-radius:10px;background:#f4efe6;font-weight:700;font-size:13px;padding:0 10px}
.ow-dlg{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(178px + env(safe-area-inset-bottom));width:min(94vw,560px);background:#fff;border:3px solid #141414;border-radius:18px;padding:14px 16px 12px;box-shadow:0 5px 0 #141414}
.ow-dn{display:inline-block;background:#141414;color:#ffcc3a;font:800 12px "Inter Tight",sans-serif;letter-spacing:.04em;padding:4px 10px;border-radius:999px;margin-bottom:8px}
.ow-dt{margin:0 0 10px;font:600 16px/1.45 "Inter Tight",sans-serif;min-height:2.9em}
.ow-dc{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.ow-dc button,.ow-btn{min-height:44px;padding:0 16px;border:2.5px solid #141414;border-radius:999px;background:#fff;font-weight:800;font-size:14px;display:inline-flex;align-items:center;text-decoration:none;color:#141414}
.ow-dc button.p,.ow-btn.p{background:#ffcc3a}
.ow-dx{position:absolute;top:6px;right:8px;width:40px;height:40px;border:0;background:none;font-size:24px;line-height:1}
.ow-toast{position:absolute;left:50%;top:calc(110px + env(safe-area-inset-top));transform:translate(-50%,-20px);opacity:0;background:#141414;color:#fff;border-radius:14px;padding:10px 14px;max-width:88vw;width:max-content;transition:opacity .25s,transform .25s;pointer-events:none;box-shadow:0 4px 0 #ff6a3d}
.ow-toast.on{opacity:1;transform:translate(-50%,0)}
.ow-toast b{display:block;color:#ffcc3a;font:800 12px "Inter Tight",sans-serif;letter-spacing:.08em}
.ow-toast span{font:500 14px/1.35 "Inter Tight",sans-serif}
.ow-fade{position:absolute;inset:0;background:#141414;opacity:0;transition:opacity .25s;pointer-events:none}
.ow-fade.on{opacity:1}
.ow-ov{position:absolute;inset:0;background:rgba(10,10,10,.55);display:grid;place-items:center;padding:16px;z-index:5}
.ow-ov[hidden],.ow-hud [hidden]{display:none!important}
.ow-pan{position:relative;background:#fff;border:3px solid #141414;border-radius:22px;box-shadow:0 6px 0 #141414;padding:22px 20px 18px;width:min(560px,100%);max-height:calc(100dvh - 40px);overflow:auto;-webkit-user-select:text;user-select:text}
.ow-pan .x{position:absolute;top:8px;right:8px;width:44px;height:44px;border:0;background:none;font-size:28px}
.ow-pan .k{margin:0 0 4px;font:800 12px "Inter Tight",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#6a6a6a}
.ow-pan h2{margin:0 0 8px;font:800 clamp(30px,8vw,46px)/1 "Bricolage Grotesque",sans-serif;letter-spacing:-.03em}
.ow-pan h3{margin:18px 0 6px;font:800 18px "Bricolage Grotesque",sans-serif}
.ow-pan p,.ow-pan li{font:500 15px/1.5 "Inter Tight",sans-serif}
.ow-pan p.d{color:#333}
.ow-pan ul{margin:0;padding-left:18px}
.ow-pan li span{color:#777;font-size:13px}
.ow-pan a{color:#2340d8}
.ow-pa{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.ow-pa .ow-btn{color:#141414}
.ow-card .sw{height:14px;border-radius:8px;border:2.5px solid #141414;margin-bottom:12px}
.ow-mapp{width:min(860px,100%)}
.ow-mapp canvas{display:block;max-width:100%;border:3px solid #141414;border-radius:12px;margin-top:8px;cursor:pointer}
.ow-how{list-style:none;padding:0!important;margin:10px 0!important;display:grid;gap:6px}
.ow-how li{background:#f4efe6;border-radius:10px;padding:7px 10px;font-size:14px!important}
.ow-how b{display:inline-block;min-width:92px}
@media (min-width:900px){.ow-map{width:120px;height:120px}.ow-quest{top:142px}}
@media (prefers-reduced-motion:reduce){.ow-act{animation:none}.ow-zone.on{animation:none;opacity:1}.ow-toast,.ow-fade{transition:none}}

.ow-towns{display:grid;gap:8px;margin-top:10px}
.ow-town{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border:2.5px solid #141414;border-radius:16px;background:#fff;text-align:left}
.ow-town i{flex:none;width:18px;height:18px;border-radius:50%;border:2.5px solid #141414}
.ow-town span{flex:1;display:grid}
.ow-town b{font:800 16px "Bricolage Grotesque",sans-serif}
.ow-town em{font:500 13px/1.35 "Inter Tight",sans-serif;font-style:normal;color:#555}
.ow-town small{flex:none;font:800 12px "Inter Tight",sans-serif;text-transform:uppercase;letter-spacing:.06em;padding:6px 10px;border-radius:999px;background:#ffcc3a;border:2px solid #141414}
.ow-town.here{background:#f4efe6}.ow-town.here small{background:#fff}
.ow-town.soon{opacity:.55}.ow-town.soon small{background:#e6e6e6}
.ow-town:not([disabled]):active{transform:scale(.98)}
.ow-ride{position:absolute;inset:0;z-index:9;display:grid;place-items:center;background:#141414;color:#f4efe6;opacity:0;transition:opacity .25s}
.ow-ride.go{opacity:1}
.ow-ride[hidden]{display:none}
.ow-ride>div{display:grid;justify-items:center;gap:6px;text-align:center;padding:24px}
.ow-ride svg{width:96px;height:60px}
.ow-ride.go svg{animation:owbus .5s ease-in-out infinite alternate}
.ow-ride .k{margin:6px 0 0;font:800 12px "Inter Tight",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#ffcc3a}
.ow-ride b{font:400 44px/1 Anton,Impact,sans-serif;letter-spacing:.02em}
.ow-ride em{font:500 15px "Inter Tight",sans-serif;font-style:normal;max-width:30ch;color:#cfcfcf}
.ow-ride i{display:block;width:180px;height:6px;border-radius:9px;background:#333;overflow:hidden;margin-top:8px}
.ow-ride i::after{content:"";display:block;height:100%;width:0;background:#ffcc3a}
.ow-ride.go i::after{animation:owbar 1.5s ease-out forwards}
@keyframes owbus{from{transform:translateY(0)}to{transform:translateY(-4px)}}
@keyframes owbar{to{width:100%}}
@media (prefers-reduced-motion: reduce){.ow-ride.go svg,.ow-ride.go i::after{animation:none}.ow-ride.go i::after{width:100%}}

.ow-floors{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
.ow-fl{min-height:52px;border:2.5px solid #141414;border-radius:14px;background:#fff;font:400 24px Anton,Impact,sans-serif}
.ow-fl.here{background:#ffcc3a}
.ow-fl:active{transform:scale(.96)}
`;
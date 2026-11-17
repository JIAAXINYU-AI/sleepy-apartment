// Original procedural cartoon Foley, with bounded polyphony and per-event cooldowns.
window.gameAudio=(()=>{
 let ac,bus,compressor,enabled=true,musicVolume=.22,effectVolume=.55,scene='home',booted=false,active=0,blocked=false;
 const last=new Map(),voices=new Set();let music;
 const gaps={hit:.09,iceHit:.16,grannyHit:.24,slipper:.1,ice:.18,granny:.3,electric:.25,hamster:.4,sofa:.25,defeat:.12,click:.06,select:.08,charge:.4,slam:.3};
 function init(){if(ac)return;ac=new(window.AudioContext||window.webkitAudioContext)();bus=ac.createGain();compressor=ac.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=6;bus.connect(compressor);compressor.connect(ac.destination);bus.gain.value=enabled?effectVolume*.3:0;}
 function tone(f,end,d=.12,delay=0,type='sine',vol=.6){if(active>=24)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+delay;o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(bus);voices.add(o);active++;o.onended=()=>{voices.delete(o);active--;o.disconnect();g.disconnect();};o.start(t);o.stop(t+d+.02);}
 function hiss(d=.1,hz=1600,vol=.2){if(active>=24)return;const b=ac.createBuffer(1,Math.ceil(ac.sampleRate*d),ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const n=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();n.buffer=b;f.type='bandpass';f.frequency.value=hz;f.Q.value=.7;g.gain.value=vol;n.connect(f);f.connect(g);g.connect(bus);voices.add(n);active++;n.onended=()=>{voices.delete(n);active--;n.disconnect();f.disconnect();g.disconnect();};n.start();}
 function notes(ns,interval=.09,type='sine'){ns.forEach((n,i)=>tone(n,n*.98,.18,i*interval,type,.45));}
 function play(name){if(!enabled||!booted||document.hidden)return;try{init();if(ac.state!=='running')return;const t=ac.currentTime;if(t-(last.get(name)??-100)<(gaps[name]??.16))return;last.set(name,t);switch(name){
 case 'click':tone(700,950,.055,0,'sine',.3);break;
 case 'select':notes([480,640],.045);break;
 case 'place':tone(180,540,.1,0,'sine',.65);tone(740,660,.1,.07,'triangle',.3);break;
 case 'remove':tone(650,240,.18,0,'sine',.5);break;
 case 'error':notes([230,190],.08,'triangle');break;
 case 'collect':notes([880,1175,1568],.045);break;
 case 'hamster':notes([1050,1400],.05);break;
 case 'slipper':hiss(.085,1100,.2);tone(360,150,.09,0,'triangle',.3);break;
 case 'iceHit':tone(820,430,.09,0,'sine',.27);hiss(.06,2200,.1);break;
 case 'grannyHit':tone(160,75,.12,0,'triangle',.4);hiss(.05,500,.12);break;
 case 'hit':tone(230,70,.07,0,'sine',.5);hiss(.035,800,.15);break;
 case 'ice':hiss(.16,3200,.15);notes([1600,2100],.05);break;
 case 'granny':tone(260,480,.16,0,'triangle',.36);tone(340,220,.17,.11,'triangle',.3);break;
 case 'electric':hiss(.19,2400,.18);[0,.035,.07].forEach(t=>tone(800,190,.055,t,'sawtooth',.12));break;
 case 'sofa':tone(150,85,.11,0,'sine',.55);tone(410,260,.06,.03,'triangle',.15);break;
 case 'lift':notes([523,659],.13);break;
 case 'arrival':notes([784,1047,1319],.09);break;
 case 'wave':notes([294,392,440],.15,'triangle');break;
 case 'boss':tone(100,55,.55,0,'triangle',.7);notes([220,277,330],.15,'triangle');hiss(.3,350,.25);break;
 case 'charge':notes([165,196,233,277],.12,'triangle');hiss(.25,600,.15);break;
 case 'slam':tone(110,35,.24,0,'sine',.85);hiss(.16,450,.4);tone(190,100,.15,.06,'triangle',.25);break;
 case 'weak':notes([660,880,1320],.075);break;
 case 'defeat':tone(420,120,.16,0,'sine',.4);tone(700,950,.09,.12,'sine',.3);break;
 case 'bossDown':notes([196,262,330,523,784],.1);hiss(.24,700,.2);break;
 case 'breach':notes([330,247,185],.13,'triangle');break;
 case 'win':notes([523,659,784,1047,784,1047],.13);break;
 case 'lose':notes([392,330,294,196],.18,'triangle');break;
 case 'pause':notes([660,440],.06);break;
 case 'resume':notes([440,660],.06);break;
 default:tone(500,650,.09,0,'sine',.3);
 }}catch{}}
 function stopEffects(){for(const v of voices){try{v.stop();}catch{}}}
 function save(){try{localStorage.setItem('apartment-audio-v1',JSON.stringify({enabled,musicVolume,effectVolume}));}catch{}}
 function update(){if(!music)return;music.volume=musicVolume*.6;music.muted=!enabled;const hint=document.getElementById('musicHint');hint.hidden=!blocked||!enabled||scene!=='home';for(const id of ['sound','settingSound']){const el=document.getElementById(id);if(el)el.textContent='声音：'+(enabled?'开':'关');}if(bus)bus.gain.setTargetAtTime(enabled?effectVolume*.3:0,ac.currentTime,.03);}
 async function syncMusic(){if(!music)return;if(scene!=='home'||!enabled||document.hidden||musicVolume===0){music.pause();blocked=false;update();return;}try{await music.play();blocked=false;}catch{blocked=true;}update();}
 function setScene(next){scene=next;if(next==='home')stopEffects();syncMusic();}
 function setEnabled(value){enabled=value;if(!value)stopEffects();update();save();syncMusic();}
 function boot(){music=document.getElementById('homeMusic');try{const p=JSON.parse(localStorage.getItem('apartment-audio-v1')||'null');if(p){enabled=p.enabled!==false;musicVolume=Number.isFinite(p.musicVolume)?Math.max(0,Math.min(1,p.musicVolume)):.22;effectVolume=Number.isFinite(p.effectVolume)?Math.max(0,Math.min(1,p.effectVolume)):.55;}}catch{}try{if(!localStorage.getItem('apartment-audio-soft-v2')){musicVolume=Math.min(musicVolume,.22);localStorage.setItem('apartment-audio-soft-v2','1');}}catch{musicVolume=Math.min(musicVolume,.22);}booted=true;
 const unlock=()=>{try{init();ac.resume().catch(()=>{});}catch{}syncMusic();};document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
 document.addEventListener('click',e=>{if(e.target.closest('button'))play('click');});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopEffects();ac?.suspend();}else ac?.resume().catch(()=>{});syncMusic();});
 document.getElementById('sound').onclick=()=>{setEnabled(!enabled);if(enabled)play('select');};document.getElementById('settingSound').onclick=()=>document.getElementById('sound').click();
 for(const [id,value] of [['musicVolume',musicVolume],['effectVolume',effectVolume]]){const input=document.getElementById(id);input.value=Math.round(value*100);document.getElementById(id+'Value').textContent=input.value+'%';input.oninput=()=>{const v=Number(input.value)/100;if(id==='musicVolume')musicVolume=v;else effectVolume=v;document.getElementById(id+'Value').textContent=input.value+'%';update();save();syncMusic();};input.onchange=()=>play('collect');}
 document.getElementById('previewSound').onclick=()=>{unlock();play('collect');};document.getElementById('musicHint').onclick=unlock;update();syncMusic();}
 return{play,boot,setScene,stopEffects,setEnabled};
})();

/* One scheduler owns all media, cooldowns, loading deadlines and transitions. */
const HomeEggPolicy={
 choose(elapsed,rareUsed,last,random=Math.random){
  const roll=random();
  if(elapsed>=60000&&!rareUsed&&last!=='rare'&&roll<.05)return 'rare';
  const ordinary=['aunt','quilt','washer'].filter(id=>id!==last);
  return ordinary[Math.min(ordinary.length-1,Math.floor(random()*ordinary.length))];
 }
};
if(typeof module!=='undefined')module.exports=HomeEggPolicy;
function setupVideoHome(){
 const scene=$('cinemaScene'),landing=$('landing'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 scene.classList.add('layered-home');
 scene.querySelectorAll('.cover-theatre,.night-atmosphere,.lamplight,#motes').forEach(e=>e.remove());
 const poster=scene.querySelector('.cover-art');poster.src='assets/home/poster.png';
 const media=(id,loop=false)=>{const v=document.createElement('video');v.id=id;v.className='home-film';v.muted=true;v.defaultMuted=true;v.loop=loop;v.playsInline=true;v.preload='none';v.setAttribute('aria-hidden','true');scene.insertBefore(v,$('homeStart'));return v;};
 const main=media('homeBackground',true),egg=media('homeEgg');main.poster=poster.src;main.preload='auto';main.autoplay=true;main.src='assets/home/main.mp4';
 const items=[['01_title_logo',27,110,660,226],['02_subtitle',102,327,433,70],['03_start_button',56,436,335,114,'homeStart'],['04_level_button',96,553,238,78,'homeLevels'],['05_collection_button',94,630,240,81,'homeBook'],['06_settings_button',108,709,218,79,'homeSettings']];
 for(const [file,x,y,w,h,id] of items){const el=id?$(id):document.createElement('div');el.classList.add('home-png');el.style.cssText=`left:${x/1672*100}%;top:${y/941*100}%;width:${w/1672*100}%;height:${h/941*100}%;`;const img=document.createElement('img');img.src=`assets/home/${file}.png`;img.alt=id?'':file.startsWith('01')?'楼下别上来！':'月下守夜，七层有戏';img.draggable=false;el.replaceChildren(img);if(!id)scene.append(el);}
 $('catSecret').hidden=true;landing.onpointermove=null;landing.onpointerleave=null;
 const state={phase:'idle',home:false,active:false,elapsed:0,next:12000,last:null,rareUsed:false,token:0,deadline:0,releaseAt:0,transitionAt:0};
 let previous=performance.now(),mainFailed=false,mainWaitUntil=0;
 const staticMode=()=>reduced.matches||document.body.classList.contains('still')||navigator.connection?.saveData;
 const release=()=>{egg.pause();egg.onplaying=egg.onended=egg.onerror=null;egg.removeAttribute('src');egg.load();state.releaseAt=0;};
 const playMain=()=>{if(!state.active||staticMode()||mainFailed)return;main.play().catch(()=>{main.classList.remove('visible');});};
 const restore=(immediate=false)=>{state.token++;egg.pause();egg.classList.remove('visible');state.phase='idle';state.deadline=0;state.next=state.elapsed+25000+Math.random()*12000;if(immediate)release();else state.releaseAt=performance.now()+300;playMain();};
 const trigger=(id,test=false)=>{
  if(!state.active||(!test&&staticMode()))return;
  release();state.token++;const token=state.token;state.phase='loading';state.deadline=performance.now()+9000;egg.classList.remove('visible');egg.src=`assets/home/${id}.mp4`;egg.preload='auto';
  egg.onplaying=()=>{if(token!==state.token)return;state.phase='egg';state.deadline=performance.now()+20000;state.last=id;if(id==='rare'&&!test)state.rareUsed=true;main.pause();egg.classList.add('visible');};
  egg.onended=()=>{if(token===state.token)restore();};egg.onerror=()=>{if(token===state.token)restore();};
  egg.load();egg.play().catch(()=>{if(token===state.token)restore();});
 };
 const sync=()=>{
  const home=!landing.hidden;
  if(home&&!state.home){state.elapsed=0;state.next=12000+Math.random()*8000;state.last=null;state.rareUsed=false;}
  state.home=home;const active=home&&!document.hidden&&!document.querySelector('dialog[open]')&&!state.transitionAt;
  if(active!==state.active){state.active=active;if(!active){restore(true);main.pause();}else{state.next=Math.max(state.next,state.elapsed+10000);playMain();}}
  if(staticMode()){if(state.phase!=='idle')restore(true);main.pause();main.classList.remove('visible');}else if(state.active&&state.phase==='idle')playMain();
 };
 main.addEventListener('playing',()=>{mainWaitUntil=0;if(state.active&&!staticMode())main.classList.add('visible');else main.pause();});
 main.addEventListener('waiting',()=>{mainWaitUntil=performance.now()+8000;});main.addEventListener('error',()=>{mainFailed=true;mainWaitUntil=0;main.classList.remove('visible');});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 const observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'))document.querySelectorAll('dialog').forEach(d=>observer.observe(d,{attributes:true,attributeFilter:['open']}));sync();});observer.observe(landing,{attributes:true,attributeFilter:['hidden']});observer.observe(document.body,{childList:true,attributes:true,attributeFilter:['class']});document.querySelectorAll('dialog').forEach(d=>observer.observe(d,{attributes:true,attributeFilter:['open']}));
 document.addEventListener('pointerdown',()=>{if(state.active&&state.phase==='idle')playMain();},{capture:true});
 $('homeStart').onclick=()=>{if(state.transitionAt)return;state.transitionAt=performance.now()+(staticMode()?1:360);scene.classList.add('entering');sync();};
 // Resume the in-memory battle; a fresh start still opens night one.
 const originalUpdate=updateLobby;updateLobby=function(){originalUpdate();$('homeStart').setAttribute('aria-label',typeof s!=='undefined'&&s.t>0&&['paused','playing'].includes(s.state)?'继续这一夜':'开始守夜');};updateLobby();
 const tick=()=>{
  const now=performance.now(),delta=Math.min(now-previous,1000);previous=now;
  if(state.transitionAt&&now>=state.transitionAt){state.transitionAt=0;scene.classList.remove('entering');const ongoing=typeof s!=='undefined'&&s.t>0&&['paused','playing'].includes(s.state);enterGameView();if(!ongoing){level=0;reset();}sync();}
  if(state.releaseAt&&now>=state.releaseAt)release();
  if(mainWaitUntil&&now>=mainWaitUntil){mainWaitUntil=0;main.classList.remove('visible');}
  if(!state.active)return;
  state.elapsed+=delta;
  if(state.deadline&&now>=state.deadline)restore();
  if(!staticMode()&&state.phase==='idle'&&state.elapsed>=state.next)trigger(HomeEggPolicy.choose(state.elapsed,state.rareUsed,state.last));
  if(status)status.textContent=`${state.phase} · ${(state.elapsed/1000).toFixed(0)}s · ${state.last||'主背景'}`;
 };
 let status=null;
 const dev=['localhost','127.0.0.1','terminal.local'].includes(location.hostname)&&new URLSearchParams(location.search).get('homeTest')==='1';
 if(dev){const panel=document.createElement('aside');panel.className='home-test';panel.setAttribute('aria-label','开发彩蛋测试');for(const [label,id] of [['测试阿姨扔拖鞋','aunt'],['测试被子怪物','quilt'],['测试洗衣机','washer'],['测试全楼尖叫','rare'],['恢复正常背景',null]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>id?trigger(id,true):restore();panel.append(b);}status=document.createElement('output');panel.append(status);landing.append(panel);}
 sync();let timer=setInterval(tick,100);window.addEventListener('pagehide',()=>{state.active=false;main.pause();restore(true);clearInterval(timer);});window.addEventListener('pageshow',e=>{if(e.persisted){previous=performance.now();sync();timer=setInterval(tick,100);}});
}

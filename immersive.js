function setupImmersive(){
 const stage=document.querySelector('.stage'),board=$('board');
 function fit(){if($('playShell').hidden)return;const w=stage.clientWidth,h=stage.clientHeight,scale=Math.min(w/board.width,h/board.height);board.style.width=board.width*scale+'px';board.style.height=board.height*scale+'px';}
 new ResizeObserver(fit).observe(stage);new MutationObserver(fit).observe(board,{attributes:true,attributeFilter:['height']});
 const scene=$('cinemaScene');let still=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function applyMotion(){document.body.classList.toggle('still',still);$('settingMotion').textContent='动态效果：'+(still?'关':'开');}
 applyMotion();$('settingMotion').onclick=()=>{still=!still;applyMotion();};
 $('landing').onpointermove=e=>{if(still)return;scene.style.setProperty('--px',(e.clientX/innerWidth-.5)*5+'px');scene.style.setProperty('--py',(e.clientY/innerHeight-.5)*3+'px');};
 $('landing').onpointerleave=()=>{scene.style.setProperty('--px','0px');scene.style.setProperty('--py','0px');};
 for(let i=0;i<22;i++){const el=document.createElement('i');el.className='mote';el.style.cssText=`left:${28+(i*37%69)}%;top:${15+(i*23%79)}%;--duration:${4+i%5}s;--delay:-${i%7}s`; $('motes').append(el);}
 let pet=0;$('catSecret').onclick=()=>{$('homeProgress').textContent=['猫：喵。今晚的物业费，收一条小鱼干。','猫翻了个身：守夜交给你，睡觉交给我。','猫：楼下那台洗衣机，偷走了我的袜子。'][pet++%3];beep(650);};
 $('homeSettings').onclick=()=>{$('settingSound').textContent=$('sound').textContent;$('settings').showModal();};
 for(const id of ['settingsX','settingsClose'])$(id).onclick=()=>$('settings').close();
 $('settingSound').onclick=()=>{$('sound').click();$('settingSound').textContent=$('sound').textContent;};
 $('settingFullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('settingFullscreen').textContent='当前环境暂不支持全屏';}};
 document.addEventListener('fullscreenchange',()=>{$('settingFullscreen').textContent=document.fullscreenElement?'退出全屏':'进入全屏';fit();});
 // Browser Escape should resume the battle exactly like a close button.
 for(const id of ['guide','levelMenu','residents'])$(id).addEventListener('cancel',e=>{e.preventDefault();closePanel(id);});
}

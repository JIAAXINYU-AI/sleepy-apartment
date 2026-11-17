/* Bounded presentation feedback: never changes damage, timing or saves. */
function setupFeel(){
 let rings=[],timer=null;
 const quiet=()=>document.body.classList.contains('still')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 window.impactFeedback=(p,e)=>{if(!quiet()){rings.push({x:e.x,y:cy(p.r),kind:p.kind,at:performance.now()});if(rings.length>18)rings.shift();}};
 const draw=render;render=function(){draw();const now=performance.now();rings=rings.filter(r=>now-r.at<280);if(quiet())return;for(const r of rings){const t=(now-r.at)/280;ctx.save();ctx.globalAlpha=(1-t)*.75;ctx.strokeStyle=r.kind===3?'#d2f8ff':r.kind===4?'#ffd595':'#fff1cf';ctx.lineWidth=r.kind===4?4:2;ctx.beginPath();if(r.kind===3){for(let i=0;i<6;i++){let a=i*Math.PI/3;ctx.moveTo(r.x+Math.cos(a)*8,r.y+Math.sin(a)*8);ctx.lineTo(r.x+Math.cos(a)*(15+t*17),r.y+Math.sin(a)*(15+t*17));}}else ctx.arc(r.x,r.y,8+t*(r.kind===4?65:23),0,Math.PI*2);ctx.stroke();ctx.restore();}};
 const clear=()=>{clearTimeout(timer);timer=null;$('dawnMoment')?.remove();$('overlay').classList.remove('dawn-wait');rings=[];};
 const end=finish;finish=function(won){clear();end(won);if(!won||quiet()||document.hidden)return;const state=s;const banner=document.createElement('button');banner.id='dawnMoment';banner.innerHTML='<small>最后一声脚步，停了。</small><b>天亮啦，好梦守住了</b><span>点击查看今晚战报</span>';document.querySelector('.stage').append(banner);$('overlay').classList.add('dawn-wait');const reveal=()=>{if(s===state)clear();};banner.onclick=reveal;timer=setTimeout(reveal,1100);};
 const oldReset=reset;reset=function(){clear();oldReset();};$('restart').onclick=()=>reset();
 const home=showHome;showHome=function(){clear();home();};$('home').onclick=showHome;
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 const lift=$('lift').onclick;$('lift').onclick=()=>{if(mode==='lift'){mode='place';liftUnit=null;hint('已取消电梯选择，继续布阵。');sync();}else lift();};
 const action=act;act=function(x,y){if(s.state==='playing'&&mode==='lift'&&liftUnit){const cell=getCell(x,y);if(cell.r===liftUnit.r&&cell.c===liftUnit.c){mode='place';liftUnit=null;hint('已取消电梯选择，继续布阵。');sync();return;}}action(x,y);};
 const syncBefore=sync;sync=function(){syncBefore();$('lift').setAttribute('aria-pressed',String(mode==='lift'));$('lift').title=mode==='lift'?'再次点击取消电梯选择':'选择住户，再点另一层同列空格';};
 const note=document.createElement('aside');note.id='landscapeTip';note.innerHTML='<span>↻ 横过手机，楼层和落点会更清楚</span><button aria-label="关闭横屏提示">知道了</button>';note.querySelector('button').onclick=()=>note.remove();$('playShell').prepend(note);
 sync();
}

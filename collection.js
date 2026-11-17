/* Optional objectives use the existing medal awards; no combat modifiers. */
const stickerGoals=[
 {name:'全楼平安',icon:'☀',rule:'安睡值100，且没有住户退场，并通关。主动撤回不算退场。'},
 {name:'电梯救场家',icon:'↕',rule:'电梯成功到站至少3次，并通关。'},
 {name:'奶奶放假',icon:'☕',rule:'整局不部署暴躁奶奶，并通关；部署后撤回也不算。'}
];
function stickerProgress(state,run){return [
 {failed:state.life<100||(run?.fallen||0)>0,text:`安睡 ${state.life}/100 · 退场 ${run?.fallen||0}人`},
 {failed:false,text:`电梯到站 ${Math.min(3,state.stats.lifts)}/3 次`},
 {failed:!!run?.usedGranny,text:run?.usedGranny?'本局已部署奶奶':'本局尚未部署奶奶'}
];}
function stickerCount(m){return levels.reduce((n,_,i)=>n+[0,1,2].filter(j=>m[i]?.[j]===true).length,0);}
function collectionHonor(){return '<section class="collection-honor"><span>21 / 21 · 全楼珍藏</span><h3>这栋楼，给你留一把永久的钥匙。</h3><p>你替每扇门守过夜，也给每位邻居放过假。<br>往后路过，记得回来吃早餐。</p><b>晚安公寓全体住户 敬赠</b></section>';}
function setupCollection(){
 let target=null,lastLabel='';
 const tracker=document.createElement('details');tracker.id='stickerTracker';tracker.innerHTML='<summary>本夜贴纸目标</summary><div class="tracker-sheet"><small>额外挑战，不影响正常通关</small><div class="tracker-items"></div><p>达成条件后仍需通关，才会获得贴纸。</p></div>';
 document.querySelector('.toolbar').append(tracker);
 tracker.addEventListener('keydown',e=>{if(e.code==='Space')e.stopPropagation();});
 const update=()=>{
  tracker.hidden=atHome||!['playing','paused','ready'].includes(s.state);
  if(tracker.hidden)return;
  const rows=stickerProgress(s,nightlife.run),label=target&&target.night===level?`追踪：${stickerGoals[target.kind].name}${rows[target.kind].failed?' · 已失效':''}`:'本夜贴纸目标';
  tracker.querySelector('summary').textContent=label;
  const markup=rows.map((v,i)=>`<div class="tracker-item ${v.failed?'missed':''} ${target?.kind===i&&target.night===level?'tracking':''}"><b>${stickerGoals[i].icon} ${stickerGoals[i].name}</b><span>${v.text}</span><small>${v.failed?'本局条件已失效，仍可继续通关':i===1&&s.stats.lifts>=3?'次数达标，继续守到天亮':'守到天亮后结算'}</small></div>`).join('');
  if(markup!==lastLabel){tracker.querySelector('.tracker-items').innerHTML=markup;lastLabel=markup;}
 };
 const oldSync=sync;sync=function(){oldSync();update();};
 const oldReset=reset;reset=function(){if(target?.night!==level)target=null;tracker.open=false;lastLabel='';oldReset();update();};
 const oldHome=showHome;showHome=function(){target=null;tracker.open=false;oldHome();update();};$('home').onclick=showHome;
 const oldOverlay=showOverlay;showOverlay=function(...args){oldOverlay(...args);if(s.state==='ready'&&target?.night===level){const el=document.createElement('aside');el.className='selected-challenge';el.textContent=`本次目标 · ${stickerGoals[target.kind].name}：${stickerGoals[target.kind].rule}`;$('overlay').querySelector('.overlay-copy').append(el);}};
 function startChallenge(night,kind){if(night+1>progress.unlocked)return;target={night,kind};level=night;$('levelMenu').close();modalWasPlaying=false;enterGameView();reset();}
 const oldMenu=openMenu;openMenu=function(){oldMenu();$('stickerAlbum')?.remove();const m=readNeighborMedals(),total=stickerCount(m),album=document.createElement('details');album.id='stickerAlbum';album.innerHTML=`<summary>贴纸收藏册 · ${total} / 21</summary><p class="album-intro">点一枚贴纸，带着目标重玩。已获得的贴纸会永久保留在当前浏览器。</p><div class="sticker-rules">${stickerGoals.map(g=>`<p><b>${g.icon} ${g.name}</b><span>${g.rule}</span></p>`).join('')}</div><div class="sticker-nights">${levels.map((l,i)=>`<section><h3>${l.title}</h3><div>${stickerGoals.map((g,j)=>`<button class="sticker-choice ${m[i]?.[j]===true?'earned':''}" data-night="${i}" data-goal="${j}" ${i+1>progress.unlocked?'disabled':''}><i>${g.icon}</i><b>${g.name}</b><span>${m[i]?.[j]===true?'✦ 已收藏':i+1>progress.unlocked?'通关前一夜后解锁':'○ 未获得 · 去挑战'}</span></button>`).join('')}</div></section>`).join('')}</div>${total===21?collectionHonor():`<p class="collection-next">再收集 ${21-total} 枚，收到全楼特别谢礼。</p>`}`;
  $('neighborArchive').before(album);
  album.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>startChallenge(+b.dataset.night,+b.dataset.goal));
  $('collectionShortcut')?.remove();const shortcut=document.createElement('button');shortcut.id='collectionShortcut';shortcut.textContent=`打开贴纸收藏册 · ${total}/21`;shortcut.onclick=()=>{album.open=true;album.scrollIntoView({block:'start',behavior:'instant'});};$('levelList').before(shortcut);
 };
 $('homeLevels').onclick=openMenu;$('levels').onclick=openMenu;
 const oldResult=nightlife.result.bind(nightlife);
 nightlife.result=function(won){const before=readNeighborMedals();oldResult(won);tracker.hidden=true;
  const wonFlags=[won&&s.life===100&&nightlife.run.fallen===0,won&&s.stats.lifts>=3,won&&!nightlife.run.usedGranny];
  document.querySelectorAll('.medal-result>div>span').forEach((el,i)=>{const status=document.createElement('small');status.className='medal-history';status.textContent=before[level]?.[i]===true?'此前已收藏':wonFlags[i]?'首次获得':'尚未获得';el.append(status);});
  const content=document.querySelector('.result-card .overlay-copy');
  if(stickerCount(readNeighborMedals())===21){const honor=document.createElement('div');honor.innerHTML=collectionHonor();content.append(honor);}
  const b=document.createElement('button');b.className='collection-link';b.textContent='查看收藏 · 选择下个挑战';b.onclick=()=>{openMenu();$('stickerAlbum').open=true;$('stickerAlbum').scrollIntoView({block:'start',behavior:'instant'});};content.append(b);
 };
 update();
}

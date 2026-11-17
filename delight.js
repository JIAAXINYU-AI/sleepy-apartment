function setupDelight(){
 const guide=$('guide');guide.querySelector('h2').textContent='新楼长，今晚拜托啦！';
 guide.querySelectorAll(':scope > p').forEach(e=>e.remove());
 const sheet=document.createElement('div');sheet.className='guide-sheet';sheet.innerHTML=`<div class="manual-banner"><span class="manual-mascot portrait"></span><div><small>晚安公寓 · 不太正经的生存手册</small><h3>可以困，不可以让怪进卧室。</h3><p>收电 → 叫邻居 → 守住左侧房门</p></div></div><div class="guide-grid">${[
 ['01','先养一只发电仓鼠','花50电量，把仓鼠放在靠左的安全格。金色电球记得点击，每颗补充25电量。','仓鼠：跑步可以，办卡免谈。'],
 ['02','叫醒有起床气的邻居','点住户卡片，再点虚线空格。阿姨打单体、奶奶打群体，冰箱让怪慢下来。','物业温馨提示：拖鞋不是赠品。'],
 ['03','沙发顶前面，火力躲后面','怪从右边来，沙发放右侧挡路，攻击住户放左侧。注意每层都有人防守。','这张沙发，今天拒绝躺平。'],
 ['04','叮！电梯送你去救场','点击电梯支援 → 点住户 → 点另一层同列空格。运输2秒，冷却10秒；沙发搬不动。','超重原因：沙发不愿透露。']
 ].map(x=>`<article><b class="step-number">${x[0]}</b><h3>${x[1]}</h3><p>${x[2]}</p><em>${x[3]}</em></article>`).join('')}</div><div class="manual-warning"><b>大怪来了怎么办？</b><p>巨怪红色蓄力后会拍击前排；青色楼层是弱点，集中火力或用电梯调兵。普通怪漏过扣20安睡值，首领闯入则直接失败。</p></div><div class="key-strip"><span><kbd>1–6</kbd> 选住户</span><span><kbd>空格</kbd> 暂停思考</span><span><kbd>Esc</kbd> 取消选择</span></div>`;guide.insertBefore(sheet,$('closeGuide'));
 const oldMenu=openMenu;openMenu=function(){oldMenu();const danger=['轻松入门','渐入佳境','开始认真','路线变换','七层告急','双怪夹击','终极守夜'];const tips=['先攒电，再铺火力','留意主攻层与偷袭层','准备减速迎接闹钟王','看箭头，电梯追着怪走','保护仓鼠，追击队长破绽','两层火力对准青色弱点','预留电量补前排，撑住双首领'];document.querySelectorAll('.level-card').forEach((card,i)=>{const tag=document.createElement('span');tag.className='difficulty';tag.textContent='✦'.repeat(Math.min(5,i+1))+' · '+danger[i];card.append(tag);const note=document.createElement('span');note.className='night-tip';note.textContent=tips[i];card.append(note);});const n=progress.best.filter(x=>x>0).length;$('levelMenu').querySelector('.dialog-intro').textContent=`已守住 ${n} / 7 夜好梦 · 门后不一定是邻居，也可能是洗衣机。`;};
 const oldBook=openResidents;openResidents=function(){oldBook();const tags=[['单体输出','脾气：拖鞋一响，全楼安详','搭配沙发：躲在后排稳定输出。'],['电量生产','爱好：带薪跑轮，拒绝加班','放靠左的安全格，前排留给战斗住户。'],['耐久阻挡','特长：明明没动，却很努力','放右侧前排，后面搭阿姨或奶奶。'],['减速控场','体温：保鲜，情绪：冷藏','配奶奶群攻，让敌人多挨几下。'],['范围伤害','音量：请勿在凌晨测试','怪扎堆时更强，搭冰箱延长输出时间。'],['穿透电弧','工作状态：本人睡着，技术在线','同层敌人越多越划算，电晕可争取补防时间。']];document.querySelectorAll('.resident').forEach((el,i)=>{const n=document.createElement('div');n.className='resident-notes';n.innerHTML=`<span class="role-label">${tags[i][0]}</span><p>${tags[i][1]}</p><b>邻里搭配</b><p>${tags[i][2]}</p>`;el.append(n);});};
 $('homeLevels').onclick=openMenu;$('levels').onclick=openMenu;$('homeBook').onclick=openResidents;$('book').onclick=openResidents;
 setupFirstNightCoach();
}
// Progress is based on completed actions, not a timer that skips ahead.
function firstNightStep(state,history){
 if(!history.ham)return {key:'ham',title:'先叫醒发电仓鼠',body:'点仓鼠卡，再点左侧空格。每只花50电量，负责持续产电。',target:'#deck'};
 if(!history.fire)return {key:'fire',title:'请阿姨守住走廊',body:'点阿姨卡，再点仓鼠右侧空格。放好后仍可连续部署。',target:'#deck'};
 if(!history.power&&state.orbs.length)return {key:'power',title:'金色电球，点一下收好',body:'点击战场上的金色电球，每颗补充25电量。',target:'.status'};
 if(!history.power)return {key:'wait',title:'电量正在路上',body:'仓鼠会定期产电；先照顾有怪靠近的楼层，不必守在原地等。',target:'.status'};
 if(!history.sofa)return {key:'sofa',title:'让沙发站在火力前方',body:'点沙发卡，放在攻击住户右侧。需要思考时点“暂停”。',target:'#deck'};
 return {key:'done',title:'基础操作已学会',body:'照顾每层防线；撤回返还一半电量，电梯能把住户送到另一层同列。',target:'#lift'};
}
function setupFirstNightCoach(){
 const coach=document.createElement('aside');coach.id='quickCoach';coach.hidden=true;coach.setAttribute('aria-live','polite');$('hint').after(coach);
 let current=null,dismissed=false,key='',history={},doneAt=null,quietUntil=0;
 const toolbar=document.querySelector('.toolbar');
 const hide=()=>{coach.hidden=true;toolbar.classList.remove('has-coach');clearGlow();};
 const oldHint=hint;hint=function(message){quietUntil=s.t+4;hide();oldHint(message);};
 const clearGlow=()=>document.querySelectorAll('.coach-glow').forEach(e=>e.classList.remove('coach-glow'));
 function update(){
  if(current!==s){current=s;dismissed=false;key='';history={};doneAt=null;quietUntil=0;}
  history.ham ||= s.units.some(u=>u.kind===1);history.fire ||= s.units.some(u=>u.kind===0);history.sofa ||= s.units.some(u=>u.kind===2);history.power ||= s.stats.collected>0;
  const visible=!atHome&&level===0&&s.state==='playing'&&!dismissed&&s.t<120&&s.t>=quietUntil&&!(progress.best[0]>0);
  if(!visible){hide();return;}
  const next=firstNightStep(s,history);if(next.key==='done'){doneAt??=s.t;if(s.t-doneAt>7){dismissed=true;hide();return;}}
  if(key!==next.key||coach.hidden){key=next.key;coach.hidden=false;toolbar.classList.add('has-coach');clearGlow();document.querySelector(next.target)?.classList.add('coach-glow');coach.innerHTML=`<div><small>新楼长操作提示</small><b>${next.title}</b><p>${next.body}</p></div><button aria-label="跳过新手提示">知道啦 ×</button>`;coach.querySelector('button').onclick=()=>{dismissed=true;hide();};}
 }
 const oldOverlay=showOverlay;showOverlay=function(...args){hide();oldOverlay(...args);};
 const oldSync=sync;sync=function(){oldSync();update();};
 const oldHome=showHome;showHome=function(){oldHome();hide();};
}

/* Seven-night narrative: no combat modifiers and no new progress keys. */
const neighborLetters=[
 ['拖鞋阿姨','门缝里的第一张纸条','新楼长，刚才我还留着门缝看你靠不靠谱。现在关上了。不是不欢迎你，是终于能睡了。拖鞋放门口，需要就拿。'],
 ['发电仓鼠','跑轮旁的小纸片','昨天只是我在跑，今天阿姨替我挡了一下。我才发现，我们不是各守各的。今晚的电费，算我请全楼。瓜子另算。'],
 ['冰箱男','冰箱上的便利贴','闹钟停了，楼里还有人紧张得睡不着。我把冰镇汽水放在一楼。你也拿一瓶吧，楼长不用一直绷着。'],
 ['梦游维修工','电梯检修单的背面','电梯修好了。其实昨晚就修好了，今天多检查了一遍。有人要赶去帮忙的时候，我不想让他等。签名歪了，我还没醒。'],
 ['沙发路障','夹在靠垫里的信','今天谁都没坐我，可我觉得自己特别有用。奶奶把破口缝好了，还说下次给我换个花罩。原来站在前面，也有人会惦记。'],
 ['暴躁奶奶','厨房亮着一盏灯','被子都成精了，还能怎么办？先吃饭。你们明晚继续守，我把早饭提前蒸上。天亮回来的时候，谁都不许空着肚子。'],
 ['全体邻居','写给我们的楼长','最开始，我们只想守住自己的那扇门。后来才知道，门外有人替我们站着。今晚七盏灯都为你亮过。现在换我们值班，你去睡吧。']
];
const neighborThanks=['另一只拖鞋，给你留着。','今天的跑轮，允许慢一点。','靠一会儿吧，我撑得住。','汽水在第二层，别拿错了。','早餐热着呢，楼长。','灯修好了。你安心睡。'];
function readNeighborMedals(){try{const v=JSON.parse(localStorage.getItem('apartment-medals-v1')||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}}
function neighborAdvice(run,state,count){
 const leaks=run?.leaks||[],max=Math.max(0,...leaks);
 if(state.bossBreach)return ['首领突破了防线','首领闯入会直接结束守夜。提前在首领所在楼层布置火力，用减速与电梯支援争取输出时间；别等它靠近卧室才补防。'];
 if(max){const row=count-leaks.indexOf(max);return [`${row}楼漏过了${max}只怪`,`下次先给${row}楼补上沙发和后排火力；其他层稳定后，再用电梯把输出住户送来。`];}
 if((run?.slamFallen||0)>0)return [`${run.slamFallen}位住户被巨怪拍击打退`,'红色范围只打各层最前方的一位住户。看到“拍击会退场”时，可提前撤回并补上沙发；电梯运输要2秒，别等最后一刻。'];
 if((run?.fallen||0)>3)return [`本局有${run.fallen}位住户退场`,'把沙发放在怪物来路上，仓鼠与输出住户放在它左侧；预留75电量，及时补前排。'];
 if(state.stats.collected<8)return [`本局收集${state.stats.collected}颗电球`,'开局先保护仓鼠，及时点取金色电球；电量紧张时先补受威胁的楼层。'];
 return ['下一次试试分工配合','让冰箱减速、维修工控场，再由阿姨与奶奶输出；来不及布阵时可以按空格暂停思考。'];
}
function neighborLetterMarkup(i){const l=neighborLetters[i];return `<article class="neighbor-letter"><small>第 ${String(i+1).padStart(2,'0')} 夜 · ${l[0]} 留</small><h3>${l[1]}</h3><p>${l[2]}</p><span class="letter-sign">好梦收件人：你</span></article>`;}
function neighborFinaleMarkup(){const medals=readNeighborMedals(),total=levels.reduce((n,_,i)=>n+[0,1,2].filter(j=>medals[i]?.[j]).length,0);return `<section class="neighbor-finale"><span class="finale-kicker">七夜全勤 · 全楼晚安</span><h3>这一次，换我们为你留灯。</h3><p>七夜最佳安睡值 · 已收集 ${total} / 21 枚贴纸</p><div class="night-lights">${levels.map((_,i)=>`<div class="${progress.best[i]>0?'lit':''}"><small>第${i+1}夜</small><b>${progress.best[i]>0?progress.best[i]:'—'}</b><span>${[0,1,2].map(j=>medals[i]?.[j]?'✦':'○').join(' ')}</span></div>`).join('')}</div><div class="thanks-grid">${defs.map((d,i)=>`<p><b>${d.name}</b><span>${neighborThanks[i]}</span></p>`).join('')}</div><p class="finale-note">贴纸条件：满安睡且无人退场 / 电梯到站3次 / 不部署奶奶，分别通关。</p></section>`;}
function setupNeighbors(){
 const speech=document.createElement('p');speech.id='neighborSpeech';speech.hidden=true;speech.setAttribute('role','status');speech.setAttribute('aria-live','polite');$('hint').after(speech);
 let current=null,lastSpoken=-99,until=0,said=new Set();
 function hideSpeech(){speech.hidden=true;$('hint').hidden=false;}
 const oldHint=hint;hint=function(message){hideSpeech();oldHint(message);};
 function speak(key,kind,line){if(said.has(key)||s.t-lastSpoken<22||s.t<23)return;said.add(key);lastSpoken=s.t;until=s.t+4;speech.textContent=defs[kind].name+'：'+line;$('hint').hidden=true;speech.hidden=false;}
 function urgent(){return !!s.warning||!!s.rush||s.enemies.some(e=>e.boss&&(e.phase==='slam'||e.phase==='exposed'||e.phase==='warn'))||!!document.getElementById('bossArrival');}
 const oldStep=step;
 step=function(dt){
  if(current!==s){current=s;lastSpoken=-99;until=0;said=new Set();hideSpeech();}
  const trip=s.trip,life=s.life;
  oldStep(dt);
  if(atHome||s.state!=='playing'||urgent()){hideSpeech();return;}
  if(s.t>=until)hideSpeech();
  if(trip&&!s.trip&&s.units.includes(trip.u)&&trip.u.hp>0)speak('lift',trip.u.kind,['来得正好，另一只拖鞋也带来了！','换个楼层，继续发电。','我可搬不动。','这层我来降降温。','谁吵？我到了！','人还没醒，电已经到了。'][trip.u.kind]);
  else if(s.life===life&&s.units.some(u=>u.kind===2&&u.hp<defs[2].hp*.7&&u.hp>0)&&s.enemies.some(e=>e.x<1000))speak('sofa',2,'还能顶，你们继续。');
 };
 const oldReset=reset;reset=function(){hideSpeech();oldReset();};
 const oldHome=showHome;showHome=function(){hideSpeech();oldHome();};
 const oldResult=nightlife.result.bind(nightlife);
 nightlife.result=function(won){
  hideSpeech();oldResult(won);const content=document.querySelector('.result-card .overlay-copy');
  if(won){const el=document.createElement('div');el.innerHTML=neighborLetterMarkup(level);content.append(el);
   if(level===6){const end=document.createElement('div');end.innerHTML=neighborFinaleMarkup();content.append(end);const b=document.createElement('button');b.textContent='补齐贴纸 · 重玩指定夜';b.className='primary';b.onclick=openMenu;content.append(b);}
  }else{const old=content.querySelector('.run-advice');if(old)old.remove();const [reason,tip]=neighborAdvice(nightlife.run,s,rowCount());const advice=document.createElement('section');advice.className='neighbor-advice';advice.innerHTML=`<small>邻居复盘 · 下次先改这一点</small><h3>${reason}</h3><p>${tip}</p>`;content.append(advice);}
 };
 const oldMenu=openMenu;openMenu=function(){oldMenu();$('neighborArchive')?.remove();const archive=document.createElement('details');archive.id='neighborArchive';const n=progress.best.filter(v=>v>0).length;archive.innerHTML=`<summary>楼里的来信 · 已收到 ${n} / 7 封</summary><div class="letters-archive">${levels.map((_,i)=>progress.best[i]>0?neighborLetterMarkup(i):`<div class="sealed-letter">第 ${i+1} 夜 · 信封还没拆开<small>守住这一夜后，邻居会给你留一封信。</small></div>`).join('')}</div>${progress.best[6]>0?neighborFinaleMarkup():''}`;$('closeLevels').before(archive);};
 $('homeLevels').onclick=openMenu;$('levels').onclick=openMenu;
 // Bind persistent home control to the wrapped cleanup function.
 $('home').onclick=showHome;
}

/* v0.18: presentation only; combat values and saved progress remain in game.js. */
const nightBriefs=[
 ['五层同时开放','12秒后第一批怪从右侧出现。','仓鼠靠左产电，阿姨负责输出，沙发挡在右侧。'],
 ['双路夹击','第三波起，同时照顾主攻层和偷袭层。','开局已有一只仓鼠；保留电梯，把火力送去需要的楼层。'],
 ['耐打怪掩护快怪','第六波闹钟王登场，预告后会让指定楼层加速。','用冰箱减速、维修工电晕，为阿姨和奶奶争取输出时间。'],
 ['六层 · 楼梯换道','留意怪头顶的目标楼层；第三波增加第二条路线。','在楼梯前拦截，或用电梯把住户送往敌人的终点。'],
 ['七层 · 搬家队长','第八波首领召怪、换层、突袭，随后露出6秒破绽但不停步。','先稳住各层，行进破绽时集中输出：首领受到的伤害增加50%。'],
 ['七层 · 双巨怪','第四波预演，末波夹击；巨怪蓄力3.5秒后拍击近处前排。','保护后排；拍击后寻找带 ×2 标记的楼层，弱点持续7秒，巨怪仍会推进。'],
 ['七层 · 最终守夜','三层洗衣巨兽与双层巨怪夹击，蓄力时还会呼叫护卫。','预留电量补前排；兼顾其他楼层，用电梯追击 ×2 弱点。']
];
function setupTactics(){
 const oldRender=render;render=function(){oldRender();drawTacticsAlerts();};
 const oldOverlay=showOverlay;
 showOverlay=function(...args){
  oldOverlay(...args);
  if(s.state!=='ready')return;
  const card=$('overlay').querySelector('.welcome'), b=nightBriefs[level];
  card.classList.add('night-brief');
  card.querySelector('.overlay-copy').innerHTML=`<div class="brief-meta"><span>${rowCount()} 层防守</span><span>${levels[level].waves} 波来袭</span><span>开局 ⚡${levels[level].energy}</span></div><div class="brief-grid"><article><small>01 / 今晚来客</small><h3>${b[0]}</h3><p>${b[1]}</p></article><article><small>02 / 楼长锦囊</small><h3>${level<2?'先稳住，再救场':'看懂预告，把握时机'}</h3><p>${b[2]}</p></article></div><p class="brief-route">卧室 ← 仓鼠与火力 ← 沙发防线 ← 来袭怪物</p>`;
  card.querySelector('.steps').hidden=true;
 };
 const oldSync=sync;
 sync=function(){oldSync();updateTactics();};
 document.querySelectorAll('.card').forEach((card,i)=>{
  card.title=`${defs[i].name} · ${defs[i].cost}电量 · ${bios[i][1]}`;
  card.setAttribute('aria-label',card.title);
 });
 $('hint').setAttribute('role','status');
 $('hint').setAttribute('aria-live','polite');
 const lift=$('lift').onclick;
 $('lift').onclick=()=>{lift();if(s.liftCD>0)hint(`电梯还需${Math.ceil(s.liftCD)}秒；可先选择住户卡继续布阵。`);};
 function updateTactics(){
  if(atHome)return;
  const obj=$('objective');
  const giants=s.enemies.filter(e=>e.giant&&e.hp>0);
  const slams=giants.filter(e=>e.phase==='slam');
  obj.classList.toggle('tactic-danger',slams.length>0||!!s.warning);
  obj.classList.toggle('tactic-weak',!slams.length&&giants.some(e=>e.phase==='exposed'));
  if(slams.length)obj.textContent=slams.map(e=>`⚠ ${occupiedRows(e).map(r=>rowCount()-r).join('、')}楼 ${e.phaseLeft.toFixed(1)}秒后拍击`).join(' ｜ ')+' · 重伤前排可撤回补位 · 电梯需2秒';
  else if(giants.some(e=>e.phase==='exposed'))obj.textContent=giants.filter(e=>e.phase==='exposed').map(e=>`✦ ${rowCount()-e.weakRow}楼 ×2 · 剩${e.phaseLeft.toFixed(1)}秒`).join(' ｜ ')+' · 同层前方火力有效';
  else if(s.trip)obj.textContent=`↕ 电梯运送中：${defs[s.trip.u.kind].name} · ${rowCount()-s.trip.from}楼 → ${rowCount()-s.trip.to}楼 · ${s.trip.left.toFixed(1)}秒到站`;
  obj.title=obj.textContent;
  document.querySelectorAll('.card').forEach((card,i)=>card.setAttribute('aria-pressed',String(mode==='place'&&selected===i)));
 }
 if(s.state==='ready')showOverlay(levels[level].title,levels[level].subtitle,'开始守夜 →');
 updateTactics();
}
window.drawTacticsRange=function(){
 if(s.state!=='playing')return;
 if(mode==='place'&&hover&&hover.r>=0&&hover.r<rowCount()&&hover.c>=0&&hover.c<6&&![1,2].includes(selected)&&validPreview(hover.r,hover.c)){
  const x=cx(hover.c)+40,y=cy(hover.r),end=1315;
  ctx.save();ctx.strokeStyle='#fff4cc';ctx.lineWidth=3;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(end,y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(end-12,y-8);ctx.lineTo(end,y);ctx.lineTo(end-12,y+8);ctx.stroke();text('攻击同层前方',Math.min(1160,x+90),y-12,15,'#594638','center');ctx.restore();
 }
 // Hatched strike areas remain recognizable without red/green color perception.
 for(const e of s.enemies){if(!e.giant||e.hp<=0||e.phase!=='slam')continue;
  for(const r of occupiedRows(e)){
   const left=Math.max(410,e.x-170),right=Math.min(1330,e.x+45),top=floors[r]+6,h=floors[r+1]-floors[r]-12;
   if(right<=left)continue;
   ctx.save();ctx.beginPath();ctx.rect(left,top,right-left,h);ctx.clip();ctx.strokeStyle='#943c3166';ctx.lineWidth=2;
   for(let x=left-h;x<right;x+=18){ctx.beginPath();ctx.moveTo(x,top+h);ctx.lineTo(x+h,top);ctx.stroke();}ctx.restore();
  }
 }
};

function drawTacticsAlerts(){
 if(s.state!=='playing')return;
 for(const e of s.enemies){if(!e.giant||e.hp<=0||e.phase!=='slam')continue;
  for(const r of occupiedRows(e)){const u=giantFrontUnit(e,r);if(!u||u.hp>(e.giant==='washer'?300:210))continue;
   const x=cx(u.c),y=cy(r);ctx.save();ctx.strokeStyle='#fff5c5';ctx.lineWidth=3;ctx.setLineDash([5,4]);ctx.strokeRect(x-40,y-42,80,80);ctx.setLineDash([]);ctx.fillStyle='#703e32';ctx.fillRect(x-54,y-68,108,23);text('拍击会退场',x,y-52,14,'#fff5d8','center');ctx.restore();
  }
 }
}

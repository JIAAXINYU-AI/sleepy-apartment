/* Local playtest notes: no network submission and no personal identifiers. */
function playtestRecord(context,answers){
 return ['《楼下别上来！》试玩记录 · v0.24',`关卡：第${context.night}夜 · ${context.state}`,`本局：${context.seconds}秒 · 安睡${context.life}/100 · 第${context.wave}波`,`设备：${answers.device||'未填写'} · 视口${context.viewport}`,`操作理解：${answers.clarity||'未填写'}`,`难度感受：${answers.difficulty||'未填写'}`,`还想再玩：${answers.again||'未填写'}`,'','最不清楚或最容易点错的一步：',answers.problem||'未填写','','最想保留的一处：',answers.favorite||'未填写','','如遇问题，发生前做了什么？期望怎样，实际怎样？',answers.reproduce||'未填写','','此记录由玩家主动导出，不会自动上传。'].join('\n');
}
function setupPlaytest(){
 const modal=document.createElement('dialog');modal.id='playtestFeedback';modal.setAttribute('aria-labelledby','playtestTitle');
 modal.innerHTML=`<button class="dialog-x" id="feedbackX" aria-label="关闭试玩记录">×</button><span class="dialog-tag">楼 长 试 玩 手 札 · v0.24</span><h2 id="playtestTitle">这一夜，玩得怎么样？</h2><p class="feedback-note">填写可跳过。内容仅留在当前页面，不自动上传；刷新后会清空。保存记录后，可自行发给项目负责人。</p><p id="feedbackContext" class="feedback-context"></p><div class="feedback-grid"><label>使用设备<select id="feedbackDevice"><option value="">请选择</option><option>电脑鼠标</option><option>电脑触控板</option><option>手机横屏</option><option>手机竖屏</option><option>平板</option></select></label><label>操作容易理解吗？<select id="feedbackClarity"><option value="">请选择</option><option>清楚，可以独立操作</option><option>看提示后能理解</option><option>仍有操作不明白</option></select></label><label>这一夜的难度<select id="feedbackDifficulty"><option value="">请选择</option><option>偏简单</option><option>刚好有挑战</option><option>偏难但知道怎么改</option><option>偏难，不知道输在哪里</option></select></label><label>还想再玩一夜吗？<select id="feedbackAgain"><option value="">请选择</option><option>想</option><option>不确定</option><option>暂时不想</option></select></label></div><label>最不清楚或最容易点错的一步<textarea id="feedbackProblem" rows="2" maxlength="1200" placeholder="例如：想搬走阿姨，却点到了电球……"></textarea></label><label>最想保留的一处<textarea id="feedbackFavorite" rows="2" maxlength="800" placeholder="画面、某位住户、某次救场，或其他感受"></textarea></label><label>问题复现过程（可选）<textarea id="feedbackReproduce" rows="3" maxlength="1800" placeholder="发生前做了什么 → 原本期待什么 → 实际发生什么"></textarea></label><div class="feedback-actions"><button id="feedbackCopy">复制记录</button><button id="feedbackDownload">下载 TXT</button><button id="feedbackClose">关闭记录</button></div><p id="feedbackStatus" role="status" aria-live="polite"></p>`;
 document.body.append(modal);
 const restart=document.createElement('dialog');restart.id='restartConfirm';restart.setAttribute('aria-labelledby','restartTitle');restart.innerHTML='<span class="dialog-tag">重 新 值 班</span><h2 id="restartTitle">确定重开这一夜吗？</h2><p>本局的布阵和战斗进度将重新开始。已经获得的通关成绩和贴纸会保留。</p><div class="feedback-actions"><button id="cancelRestart" autofocus>取消，回到暂停画面</button><button id="confirmRestart">确定重开</button></div>';document.body.append(restart);
 const oldKey=document.onkeydown;document.onkeydown=e=>{if(document.querySelector('dialog[open]')||e.target?.matches?.('input,textarea,select,[contenteditable=true]'))return;oldKey?.(e);};
 $('restart').onclick=()=>{if(['playing','paused'].includes(s.state)&&s.t>0){if(s.state==='playing')pause();restart.showModal();}else reset();};
 $('cancelRestart').onclick=()=>restart.close();$('confirmRestart').onclick=()=>{restart.close();reset();};restart.addEventListener('cancel',e=>{e.preventDefault();restart.close();});
 const previousOverlay=showOverlay;showOverlay=function(...args){previousOverlay(...args);if(s.state==='paused'){const nav=$('overlay').querySelector('.overlay-nav');const guideButton=document.createElement('button');guideButton.textContent='操作指南';guideButton.onclick=openGuide;nav.append(guideButton);const restartButton=document.createElement('button');restartButton.textContent='重开这一夜';restartButton.onclick=()=>$('restart').onclick();nav.append(restartButton);}};
 // Withdraw is deliberately single-use; collecting an orb does not consume it.
 const oldAct=act;act=function(x,y){const withdrawing=mode==='remove',before=s.units.length;oldAct(x,y);if(withdrawing&&s.units.length<before){mode='place';liftUnit=null;hint('已撤回，返还一半电量。现在可继续布阵。');sync();}};
 const oldRemove=$('remove').onclick;$('remove').onclick=()=>{if(mode==='remove'){mode='place';liftUnit=null;hint('已取消撤回，继续布阵。');sync();}else oldRemove();};
 const oldSync=sync;sync=function(){oldSync();$('remove').setAttribute('aria-pressed',String(mode==='remove'));$('remove').title=mode==='remove'?'点击一个住户撤回；再点此按钮取消':'撤回一位住户，返还一半电量';};
 let context=null;
 function openFeedback(){
  // Stop the battle before recording; closing never resumes it unexpectedly.
  for(const id of ['settings','guide'])if($(id).open)$(id).close();modalWasPlaying=false;
  if(s.state==='playing')pause();else if(s.state==='paused'&&!atHome)showOverlay('先歇一会儿。','记录完成后，点击继续守夜。','继续守夜 →');
  if(!context){context={night:level+1,state:atHome?'首页':({ready:'开局准备',paused:'暂停中',won:'胜利',lost:'失败'}[s.state]||'进行中'),seconds:Math.floor(s.t),life:s.life,wave:s.wave,viewport:`${innerWidth}×${innerHeight}`};}
  $('feedbackContext').textContent=`记录场景：第${context.night}夜 · ${context.state} · ${context.seconds}秒。修改后可重新复制或下载。`;
  $('feedbackStatus').textContent='';modal.showModal();
 }
 const button=(label,where)=>{const b=document.createElement('button');b.textContent=label;b.className='playtest-link';b.onclick=openFeedback;where(b);};
 button('写一份试玩记录',b=>$('settingsClose').before(b));button('写一份试玩记录',b=>$('closeGuide').before(b));
 const oldFinish=finish;finish=function(won){oldFinish(won);button('记录这次试玩感受',b=>$('overlay').querySelector('.overlay-nav').append(b));};
 const newRecord=document.createElement('button');newRecord.textContent='清空并新建当前场景记录';newRecord.className='feedback-new';newRecord.onclick=()=>{context=null;for(const id of ['Device','Clarity','Difficulty','Again','Problem','Favorite','Reproduce'])$('feedback'+id).value='';modal.close();openFeedback();};$('feedbackContext').after(newRecord);
 for(const id of ['feedbackX','feedbackClose'])$(id).onclick=()=>modal.close();modal.addEventListener('cancel',e=>{e.preventDefault();modal.close();});
 function record(){const value=id=>$('feedback'+id).value.trim();return playtestRecord(context,{device:value('Device'),clarity:value('Clarity'),difficulty:value('Difficulty'),again:value('Again'),problem:value('Problem'),favorite:value('Favorite'),reproduce:value('Reproduce')});}
 $('feedbackCopy').onclick=async()=>{try{await navigator.clipboard.writeText(record());$('feedbackStatus').textContent='已复制。请自行粘贴到消息或笔记中。';}catch{$('feedbackStatus').textContent='当前浏览器不能复制，请使用“下载 TXT”。';}};
 $('feedbackDownload').onclick=()=>{const url=URL.createObjectURL(new Blob(['\uFEFF'+record()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Sleepy-Apartment-v024-Feedback.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('feedbackStatus').textContent='已请求下载。请检查浏览器下载列表，文件不会自动发送。';};
 // A focusable control in a native modal must not be treated as a game shortcut.
 sync();
}

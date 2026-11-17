let atHome=false;
function enterGameView(){atHome=false;window.gameAudio?.setScene('game');$('landing').hidden=true;$('playShell').hidden=false;window.scrollTo?.({top:0,behavior:'instant'});}
function updateLobby(){let playing=s.t>0&&['paused','playing'].includes(s.state);$('homeStart').setAttribute?.('aria-label',playing?'回到这一夜':'开始守夜');let done=progress.best.filter(n=>n>0).length;$('homeProgress').textContent=playing?'这场守夜已暂停，回去后可以继续。':done===7?'七夜好梦已守住。重返值班表，挑战更高安睡值。':done?`已守住 ${done} 夜好梦 · 进度保存在当前浏览器`:'第一次值班？先去叫醒你的邻居们。';}
function showHome(){if(s.state==='playing')pause();atHome=true;window.gameAudio?.setScene('home');$('landing').hidden=false;$('playShell').hidden=true;updateLobby();window.scrollTo?.({top:0,behavior:'instant'});}
function startFromLobby(){let ongoing=s.t>0&&['paused','playing'].includes(s.state);enterGameView();if(!ongoing){level=Math.min(levels.length-1,progress.unlocked-1);reset();}}
function openGuide(){modalWasPlaying=s.state==='playing';if(modalWasPlaying){s.state='paused';$('pause').textContent='继续';}$('guide').showModal();}
function setupLobby(){for(let id of ['guide','levelMenu','residents'])$(id+'X').onclick=()=>closePanel(id);$('homeStart').onclick=startFromLobby;$('home').onclick=showHome;$('homeLevels').onclick=openMenu;$('homeBook').onclick=openResidents;$('homeGuide').onclick=openGuide;showHome();}

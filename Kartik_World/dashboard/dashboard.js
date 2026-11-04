const root=document.documentElement,settingsButton=document.getElementById('settingsButton'),panel=document.getElementById('settingsPanel'),themeToggle=document.getElementById('themeToggle'),sfxToggle=document.getElementById('sfxToggle');
let sfxOn=localStorage.getItem('kartik-sfx')==='true',audioContext;
function applyTheme(theme){root.dataset.theme=theme;themeToggle.setAttribute('aria-checked',String(theme==='light'));localStorage.setItem('kartik-theme',theme)}
function applySfx(value){sfxOn=value;sfxToggle.setAttribute('aria-checked',String(value));localStorage.setItem('kartik-sfx',String(value))}
applyTheme(localStorage.getItem('kartik-theme')||'dark');applySfx(sfxOn);
function playTone(freq=600,duration=.05){if(!sfxOn)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audioContext ||= new AC();if(audioContext.state==='suspended')audioContext.resume();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.035,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration)}catch{}}
settingsButton.addEventListener('click',()=>{panel.hidden=!panel.hidden;settingsButton.setAttribute('aria-expanded',String(!panel.hidden));playTone(520,.045)});
themeToggle.addEventListener('click',()=>{applyTheme(root.dataset.theme==='dark'?'light':'dark');playTone(620,.05)});
sfxToggle.addEventListener('click',()=>{applySfx(!sfxOn);if(sfxOn)playTone(760,.07)});
document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!settingsButton.contains(e.target)){panel.hidden=true;settingsButton.setAttribute('aria-expanded','false')}});
document.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',()=>{if(el!==settingsButton&&el!==themeToggle&&el!==sfxToggle)playTone(540,.04)}));
function updateClock(){const now=new Date();const time=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);const date=new Intl.DateTimeFormat(undefined,{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(now);document.getElementById('clockTime').textContent=time;document.getElementById('clockDate').textContent=date.toUpperCase();document.getElementById('bigClock').textContent=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',hour12:true}).format(now);document.getElementById('fullDate').textContent=date}
updateClock();setInterval(updateClock,1000);
const comingModal=document.getElementById('comingModal'),comingTitle=document.getElementById('comingTitle'),comingClose=document.getElementById('comingClose');
document.querySelectorAll('.tile').forEach(tile=>tile.addEventListener('click',e=>{
  if(tile.dataset.section==='Games'){playTone(680,.06);return;}
  e.preventDefault();
  comingTitle.textContent=tile.dataset.section+' — Coming Soon';
  comingModal.hidden=false;
  playTone(680,.06);
}));
function closeComing(){comingModal.hidden=true;}
comingClose.addEventListener('click',closeComing);
comingModal.addEventListener('click',e=>{if(e.target===comingModal)closeComing();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!comingModal.hidden)closeComing();});
const canvas=document.getElementById('ambientCanvas'),ctx=canvas.getContext('2d');let particles=[];
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);particles=Array.from({length:55},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.5+.3,s:Math.random()*.35+.08}))}
function animate(){ctx.clearRect(0,0,innerWidth,innerHeight);ctx.fillStyle='#8cff9b';particles.forEach(p=>{ctx.globalAlpha=.15+p.r*.12;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();p.y-=p.s;if(p.y<0){p.y=innerHeight;p.x=Math.random()*innerWidth}});ctx.globalAlpha=1;requestAnimationFrame(animate)}
resize();addEventListener('resize',resize);animate();

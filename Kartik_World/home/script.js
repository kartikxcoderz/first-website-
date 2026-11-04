const root=document.documentElement;
const settingsButton=document.getElementById('settingsButton');
const panel=document.getElementById('settingsPanel');
const themeToggle=document.getElementById('themeToggle');
const sfxToggle=document.getElementById('sfxToggle');
let sfxOn=localStorage.getItem('kartik-sfx')==='true';
let audioContext;
function applyTheme(theme){root.dataset.theme=theme;themeToggle.setAttribute('aria-checked',String(theme==='light'));localStorage.setItem('kartik-theme',theme)}
function applySfx(value){sfxOn=value;sfxToggle.setAttribute('aria-checked',String(value));localStorage.setItem('kartik-sfx',String(value))}
applyTheme(localStorage.getItem('kartik-theme')||'dark');applySfx(sfxOn);
settingsButton.addEventListener('click',()=>{panel.hidden=!panel.hidden;settingsButton.setAttribute('aria-expanded',String(!panel.hidden));playTone(520,.045)});
themeToggle.addEventListener('click',()=>{applyTheme(root.dataset.theme==='dark'?'light':'dark');playTone(620,.05)});
sfxToggle.addEventListener('click',()=>{applySfx(!sfxOn);if(sfxOn)playTone(760,.07)});
document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!settingsButton.contains(e.target)){panel.hidden=true;settingsButton.setAttribute('aria-expanded','false')}});
function playTone(freq=600,duration=.05){if(!sfxOn)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audioContext ||= new AC();if(audioContext.state==='suspended')audioContext.resume();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.035,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration)}catch{}}
document.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',()=>{if(el!==settingsButton&&el!==themeToggle&&el!==sfxToggle)playTone(540,.04)}));
const canvas=document.getElementById('ambientCanvas'),ctx=canvas.getContext('2d');let particles=[];
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);particles=Array.from({length:55},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.5+.3,s:Math.random()*.35+.08}))}
function animate(){ctx.clearRect(0,0,innerWidth,innerHeight);ctx.fillStyle='#8cff9b';particles.forEach(p=>{ctx.globalAlpha=.15+p.r*.12;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();p.y-=p.s;if(p.y<0){p.y=innerHeight;p.x=Math.random()*innerWidth}});ctx.globalAlpha=1;requestAnimationFrame(animate)}
resize();addEventListener('resize',resize);animate();

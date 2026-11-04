const root = document.querySelector('#game');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
root.appendChild(canvas);
const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && innerWidth < 900);
if (mobile) document.body.classList.add('touch-device');
document.querySelector('#device').textContent = mobile ? 'TOUCH CONTROLS' : 'KEYBOARD CONTROLS';

let width = 360, height = 600, playerLane = 1, obstacles = [], score = 0, speed = 250;
let playing = false, lastTime = 0, spawnTimer = 0;
let best = Number(localStorage.getItem('kw-score-neon-rush') || 0);
document.querySelector('#best').textContent = best;
const keys = new Set();

function resize() {
  const rect = root.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  width = Math.max(280, rect.width);
  height = Math.max(420, rect.height);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}
new ResizeObserver(resize).observe(root);

function laneX(lane) { return width * (0.25 + lane * 0.25); }
function spawnObstacle() { obstacles.push({ lane: Math.floor(Math.random() * 3), y: -90, passed: false }); }
function updateHud() {
  document.querySelector('#score').textContent = Math.floor(score);
  document.querySelector('#speed').textContent = Math.round(speed / 100);
}
function saveBest() {
  best = Math.max(best, Math.floor(score));
  localStorage.setItem('kw-score-neon-rush', String(best));
  document.querySelector('#best').textContent = best;
}
function start() {
  score = 0; speed = 250; playerLane = 1; obstacles = []; spawnTimer = 0;
  playing = true; document.querySelector('#overlay').style.display = 'none'; updateHud();
}
function end() {
  playing = false; saveBest();
  const overlay = document.querySelector('#overlay');
  overlay.style.display = 'flex';
  overlay.querySelector('h1').textContent = 'RACE OVER';
  overlay.querySelector('p').textContent = `Distance: ${Math.floor(score)} · Best: ${best}`;
  overlay.querySelector('button').textContent = 'RACE AGAIN';
}
function move(direction) { playerLane = Math.max(0, Math.min(2, playerLane + direction)); }
function draw() {
  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#081a26'); gradient.addColorStop(1, '#10101c');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#1c7180'; ctx.lineWidth = 2;
  for (let i = 1; i <= 2; i++) { const x = width * i / 3; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  ctx.fillStyle = '#112d38'; ctx.fillRect(width * .12, 0, width * .76, height);
  ctx.strokeStyle = '#27e7e4'; ctx.lineWidth = 3;
  for (let i = 1; i <= 2; i++) { const x = width * i / 3; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  obstacles.forEach(o => {
    const x = laneX(o.lane); ctx.shadowBlur = 18; ctx.shadowColor = '#ff527d';
    ctx.fillStyle = '#ff527d'; ctx.fillRect(x - 27, o.y, 54, 72); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd9e2'; ctx.fillRect(x - 18, o.y + 10, 36, 7);
  });
  const px = laneX(playerLane), py = height - 92;
  ctx.shadowBlur = 22; ctx.shadowColor = '#5cf5dc'; ctx.fillStyle = '#5cf5dc';
  ctx.beginPath(); ctx.moveTo(px, py - 34); ctx.lineTo(px + 27, py + 25); ctx.lineTo(px, py + 15); ctx.lineTo(px - 27, py + 25); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#dffffa'; ctx.fillRect(px - 5, py - 7, 10, 20);
}
function frame(time) {
  const dt = Math.min((time - lastTime) / 1000 || 0, .04); lastTime = time;
  if (playing) {
    score += dt * 12; speed = Math.min(520, 250 + score * 1.2);
    spawnTimer += dt;
    if (spawnTimer > Math.max(.48, 1.05 - score / 900)) { spawnObstacle(); spawnTimer = 0; }
    obstacles.forEach(o => { o.y += speed * dt; if (!o.passed && o.y > height - 105) { o.passed = true; if (o.lane === playerLane) end(); } });
    obstacles = obstacles.filter(o => o.y < height + 90);
    updateHud();
  }
  draw(); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

document.addEventListener('keydown', e => {
  if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); move(-1); }
  if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); move(1); }
  if (e.code === 'KeyR') start();
});
document.querySelectorAll('[data-key]').forEach(button => {
  button.addEventListener('pointerdown', e => { e.preventDefault(); if (button.dataset.key === 'ArrowLeft') move(-1); if (button.dataset.key === 'ArrowRight') move(1); });
});
document.querySelector('#start').onclick = start;
document.querySelector('#restart').onclick = start;
resize();

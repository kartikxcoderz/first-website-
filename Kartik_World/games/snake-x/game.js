const root = document.querySelector('#game');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
root.appendChild(canvas);
const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && innerWidth < 900);
if (mobile) document.body.classList.add('touch-device');
document.querySelector('#device').textContent = mobile ? 'TOUCH CONTROLS' : 'KEYBOARD CONTROLS';
let width = 360, height = 600, grid = 18, snake, direction, nextDirection, food, score = 0, playing = false, boost = false, timer = 0, last = 0;
let best = Number(localStorage.getItem('kw-score-snake-x') || 0);
document.querySelector('#best').textContent = best;
function resize() {
  const rect = root.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
  width = Math.max(280, rect.width); height = Math.max(420, rect.height);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  canvas.style.width = '100%'; canvas.style.height = '100%'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
}
new ResizeObserver(resize).observe(root);
function randomFood() { let p; do { p = { x: Math.floor(Math.random() * grid), y: Math.floor(Math.random() * grid) }; } while (snake.some(s => s.x === p.x && s.y === p.y)); return p; }
function turn(x, y) { if (x !== -direction.x || y !== -direction.y) nextDirection = { x, y }; }
function start() {
  snake = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }]; direction = { x: 1, y: 0 }; nextDirection = { x: 1, y: 0 };
  score = 0; food = randomFood(); playing = true; document.querySelector('#overlay').style.display = 'none'; updateHud();
}
function updateHud() { document.querySelector('#score').textContent = score * 10; document.querySelector('#length').textContent = snake.length; }
function finish() {
  playing = false; best = Math.max(best, score * 10); localStorage.setItem('kw-score-snake-x', String(best)); document.querySelector('#best').textContent = best;
  const overlay = document.querySelector('#overlay'); overlay.style.display = 'flex'; overlay.querySelector('h1').textContent = 'GAME OVER';
  overlay.querySelector('p').textContent = `You collected ${score} orbs · Best: ${best}`; overlay.querySelector('button').textContent = 'PLAY AGAIN';
}
function step() {
  direction = nextDirection; const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  if (head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid || snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y)) { finish(); return; }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) { score++; food = randomFood(); } else snake.pop();
  updateHud();
}
function draw() {
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#07150d'; ctx.fillRect(0, 0, width, height);
  const cell = Math.min((width - 30) / grid, (height - 30) / grid), board = cell * grid, ox = (width - board) / 2, oy = (height - board) / 2;
  ctx.fillStyle = '#102519'; ctx.fillRect(ox, oy, board, board);
  ctx.strokeStyle = '#244b31'; ctx.lineWidth = 1;
  for (let i = 0; i <= grid; i++) { ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + board); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox, oy + i * cell); ctx.lineTo(ox + board, oy + i * cell); ctx.stroke(); }
  if (food) { ctx.shadowBlur = 16; ctx.shadowColor = '#ffd85e'; ctx.fillStyle = '#ffd85e'; ctx.beginPath(); ctx.arc(ox + (food.x + .5) * cell, oy + (food.y + .5) * cell, cell * .34, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
  if (snake) snake.forEach((s, i) => { ctx.fillStyle = i === 0 ? '#d5ff8c' : (i % 2 ? '#6bea8c' : '#3dbb75'); ctx.shadowBlur = i === 0 ? 12 : 0; ctx.shadowColor = '#8eff6d'; ctx.fillRect(ox + s.x * cell + 1, oy + s.y * cell + 1, cell - 2, cell - 2); });
  ctx.shadowBlur = 0;
}
function frame(t) { const dt = Math.min((t - last) / 1000 || 0, .05); last = t; if (playing) { timer += dt; const interval = boost ? .075 : .14; if (timer >= interval) { timer = 0; step(); } } draw(); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
const keyMap = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] };
document.addEventListener('keydown', e => { if (keyMap[e.code]) { e.preventDefault(); turn(...keyMap[e.code]); } if (e.code === 'Space') boost = true; if (e.code === 'KeyR') start(); });
document.addEventListener('keyup', e => { if (e.code === 'Space') boost = false; });
document.querySelectorAll('[data-key]').forEach(button => {
  const key = button.dataset.key; const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  button.addEventListener('pointerdown', e => { e.preventDefault(); if (map[key]) turn(...map[key]); if (key === 'Space') boost = true; });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(event => button.addEventListener(event, () => { if (key === 'Space') boost = false; }));
});
document.querySelector('#start').onclick = start;
document.querySelector('#restart').onclick = start;
resize();

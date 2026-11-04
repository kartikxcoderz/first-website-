// KARTIK WORLD - FLAPPY BIRD
// Edit these three paths to use your own game assets.
const ASSETS = {
  bird: "assets/bird.png",
  jump: "assets/jump.mp3",
  death: "assets/death.mp3"
};

const $ = (id) => document.getElementById(id);
const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FLOOR_HEIGHT = 44;

let gameState = "ready";
let bird;
let pipes;
let score = 0;
let best = Number(localStorage.getItem("kartik-flappy-best") || 0);
let frame = 0;
let animationId = 0;
let lastTime = 0;
let jumpAudio;
let deathAudio;
let birdTexture = new Image();
let birdTextureReady = false;

$("bestScore").textContent = best;

function loadImage() {
  birdTexture.onload = () => { birdTextureReady = true; };
  birdTexture.onerror = () => { birdTextureReady = false; };
  birdTexture.src = ASSETS.bird;
}

function loadSound(path) {
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = path;
  audio.addEventListener("error", () => {}, { once: true });
  return audio;
}

function playSound(audio) {
  if (!audio || !audio.src) return;
  audio.pause();
  audio.currentTime = 0;
  const playback = audio.play();
  if (playback && playback.catch) playback.catch(() => {});
}

function resetGame() {
  bird = { x: 115, y: 285, velocity: 0, radius: 14, rotation: 0 };
  pipes = [];
  score = 0;
  frame = 0;
  $("score").textContent = "0";
}

function showReady() {
  $("overlayLabel").textContent = "READY WHEN YOU ARE";
  $("overlayTitle").innerHTML = "READY<br>TO FLY?";
  $("overlayText").textContent = "Press SPACE or tap the game to flap through the pipes.";
  $("startButton").textContent = "START GAME ↗";
  $("overlay").classList.remove("hidden");
}

function startGame() {
  cancelAnimationFrame(animationId);
  resetGame();
  gameState = "playing";
  $("overlay").classList.add("hidden");
  lastTime = 0;
  animationId = requestAnimationFrame(loop);
}

function flap() {
  if (gameState === "ready") {
    startGame();
  }
  if (gameState !== "playing") return;
  bird.velocity = -5.8;
  playSound(jumpAudio);
}

function finishGame() {
  if (gameState !== "playing") return;
  gameState = "over";
  playSound(deathAudio);
  cancelAnimationFrame(animationId);

  const newRecord = score > best;
  if (newRecord) {
    best = score;
    localStorage.setItem("kartik-flappy-best", String(best));
    $("bestScore").textContent = best;
  }

  $("overlayLabel").textContent = "RUN COMPLETE";
  $("overlayTitle").innerHTML = `SCORE<br>${score}`;
  $("overlayText").textContent = newRecord
    ? "New personal best! Keep pushing your limits."
    : "Try again and beat your best score.";
  $("startButton").textContent = "PLAY AGAIN ↗";
  $("overlay").classList.remove("hidden");
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#173f2a");
  sky.addColorStop(1, "#0b1d13");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(183,233,189,0.13)";
  for (let i = 0; i < 7; i += 1) {
    const x = (i * 91 - frame * 0.25) % (WIDTH + 70);
    const y = 90 + (i % 3) * 55;
    ctx.beginPath();
    ctx.arc(x < 0 ? x + WIDTH + 70 : x, y, 18 + (i % 3) * 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#193b25";
  ctx.fillRect(0, HEIGHT - FLOOR_HEIGHT, WIDTH, FLOOR_HEIGHT);
  ctx.fillStyle = "#77e98b";
  ctx.fillRect(0, HEIGHT - FLOOR_HEIGHT, WIDTH, 4);
}

function drawPipes() {
  pipes.forEach((pipe) => {
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + 54, 0);
    gradient.addColorStop(0, "#18723a");
    gradient.addColorStop(0.5, "#62e781");
    gradient.addColorStop(1, "#176a35");

    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, 54, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, 54, HEIGHT - pipe.bottom - FLOOR_HEIGHT);

    ctx.fillStyle = "#55d976";
    ctx.fillRect(pipe.x - 5, pipe.top - 18, 64, 18);
    ctx.fillRect(pipe.x - 5, pipe.bottom, 64, 18);

    ctx.fillStyle = "rgba(155,255,173,0.32)";
    ctx.fillRect(pipe.x + 8, 0, 4, pipe.top - 18);
    ctx.fillRect(pipe.x + 8, pipe.bottom + 18, 4, HEIGHT - pipe.bottom - FLOOR_HEIGHT - 18);
  });
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(Math.max(-0.5, Math.min(0.8, bird.velocity * 0.07)));

  if (birdTextureReady) {
    ctx.drawImage(birdTexture, -22, -19, 44, 38);
  } else {
    ctx.fillStyle = "#ffd65b";
    ctx.strokeStyle = "#172315";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f1a72d";
    ctx.beginPath();
    ctx.ellipse(-4, 5, 9, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(9, -5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#101a11";
    ctx.beginPath();
    ctx.arc(11, -5, 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff8848";
    ctx.beginPath();
    ctx.moveTo(15, 1);
    ctx.lineTo(28, 5);
    ctx.lineTo(15, 9);
    ctx.fill();
  }

  ctx.restore();
}

function drawScore() {
  ctx.fillStyle = "#f1fff2";
  ctx.font = "bold 36px monospace";
  ctx.textAlign = "center";
  ctx.fillText(String(score), WIDTH / 2, 68);
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  drawScore();
}

function update(delta) {
  const step = Math.min(delta / 16.667, 2);
  frame += step;
  bird.velocity += 0.29 * step;
  bird.y += bird.velocity * step;

  if (frame >= 94) {
    const top = 90 + Math.random() * 220;
    pipes.push({ x: WIDTH + 20, top, bottom: top + 158, passed: false });
    frame = 0;
  }

  const speed = 2.65 + Math.min(score * 0.035, 1.5);
  pipes.forEach((pipe) => {
    pipe.x -= speed * step;
    if (!pipe.passed && pipe.x + 54 < bird.x) {
      pipe.passed = true;
      score += 1;
      $("score").textContent = score;
    }
  });
  pipes = pipes.filter((pipe) => pipe.x > -70);

  const collision = pipes.some((pipe) =>
    bird.x + 13 > pipe.x &&
    bird.x - 13 < pipe.x + 54 &&
    (bird.y - 12 < pipe.top || bird.y + 12 > pipe.bottom)
  );

  if (bird.y + bird.radius > HEIGHT - FLOOR_HEIGHT || bird.y - bird.radius < 0 || collision) {
    finishGame();
  }
}

function loop(timestamp) {
  if (gameState !== "playing") return;
  const delta = lastTime ? timestamp - lastTime : 16.667;
  lastTime = timestamp;
  update(delta);
  draw();
  if (gameState === "playing") animationId = requestAnimationFrame(loop);
}

$("startButton").addEventListener("click", () => {
  if (gameState === "over") startGame();
  else flap();
});

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  flap();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    flap();
  }
});

birdTexture = new Image();
jumpAudio = loadSound(ASSETS.jump);
deathAudio = loadSound(ASSETS.death);
loadImage();
resetGame();
draw();
showReady();

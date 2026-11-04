'use strict';

// Device choice uses browser capabilities only. No IP address is collected.
const isTouchDevice = navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const deviceNote = document.getElementById('deviceNote');
deviceNote.textContent = isTouchDevice
  ? 'TOUCH DEVICE READY — USE THE ON-SCREEN GAME CONTROLS.'
  : 'PC CONTROLS READY — KEYBOARD GUIDE IS BELOW.';

// Theme preference is kept only in this browser.
const themeToggle = document.getElementById('themeToggle');
const themeText = document.getElementById('themeText');
const themeIcon = document.getElementById('themeIcon');
let lightMode = false;
themeToggle.addEventListener('click', () => {
  lightMode = !lightMode;
  document.body.classList.toggle('light-mode', lightMode);
  themeToggle.setAttribute('aria-pressed', String(lightMode));
  themeText.textContent = lightMode ? 'DARK MODE: OFF' : 'DARK MODE: ON';
  themeIcon.textContent = lightMode ? '☀' : '☾';
});

// Floating game switcher closes whenever a visitor follows a tab/link or taps outside it.
const gameMenu = document.getElementById('gameMenu');
const gameMenuButton = document.getElementById('gameMenuButton');
const closeGameMenu = () => {
  gameMenu.hidden = true;
  gameMenuButton.setAttribute('aria-expanded', 'false');
};
gameMenuButton.addEventListener('click', () => {
  gameMenu.hidden = !gameMenu.hidden;
  gameMenuButton.setAttribute('aria-expanded', String(!gameMenu.hidden));
});
document.getElementById('closeGameMenu').addEventListener('click', closeGameMenu);
document.addEventListener('click', event => {
  if (!gameMenu.hidden && !gameMenu.contains(event.target) && !gameMenuButton.contains(event.target)) closeGameMenu();
});
document.querySelectorAll('nav a, .game-card[href], .primary-link').forEach(link => link.addEventListener('click', closeGameMenu));

// Local leaderboard: the existing games retain their original score keys.
const games = [
  ['fighting-arena', 'Fighter Pad', 'kw-score-fighting-arena'],
  ['neon-rush', 'Neon Rush', 'kw-score-neon-rush'],
  ['snake-x', 'Snake X', 'kw-score-snake-x'],
  ['flappy', 'Flappy ACP', 'kartik-flappy-best']
];
const rows = games.map(([id, name, storageKey]) => ({ id, name, score: Number(localStorage.getItem(storageKey) || 0) }))
  .sort((a, b) => b.score - a.score);
const board = document.getElementById('leaderboardList');
const played = rows.filter(row => row.score > 0);
if (played.length) {
  board.innerHTML = played.map((row, index) =>
    `<div class="leader-row"><strong>#${index + 1}</strong><span>${row.name}</span><span>${row.score.toLocaleString()} PTS</span></div>`
  ).join('');
}

// Harmless, user-triggered arcade easter eggs. Audio is capped and never changes device volume.
const cheatForm = document.getElementById('cheatForm');
const cheatInput = document.getElementById('cheatInput');
const cheatMessage = document.getElementById('cheatMessage');
const prankOverlay = document.getElementById('prankOverlay');
const prankTitle = document.getElementById('prankTitle');
const prankText = document.getElementById('prankText');
const closePrank = document.getElementById('closePrank');
let audioContext = null;
function playSafeArcadeSound(kind) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = audioContext || new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = kind === 'glitch' ? 'sawtooth' : 'triangle';
    oscillator.frequency.setValueAtTime(kind === 'boom' ? 130 : 520, now);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'boom' ? 55 : 180, now + 0.22);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } catch (_) {
    // Sound is optional; the visual easter egg still works.
  }
}
function showPrank(title, message, soundType) {
  prankTitle.textContent = title;
  prankText.textContent = message;
  prankOverlay.hidden = false;
  document.body.classList.add('arcade-glitch');
  playSafeArcadeSound(soundType);
}
function dismissPrank() {
  prankOverlay.hidden = true;
  document.body.classList.remove('arcade-glitch');
  cheatInput.focus();
}
closePrank.addEventListener('click', dismissPrank);
prankOverlay.addEventListener('click', event => { if (event.target === prankOverlay) dismissPrank(); });
cheatForm.addEventListener('submit', event => {
  event.preventDefault();
  const code = cheatInput.value.trim();
  cheatInput.value = '';
  const darkGames = document.getElementById('darkGames');
  const regularGames = document.getElementById('games');
  const darkCode = code === 'dark';
  const easterEggs = {
    matrix: ['WELCOME TO THE ARCADE', 'The code worked. You found the hidden console.', 'glitch'],
    glitch: ['GLITCH DETECTED!', 'Fake glitch alert! Your device is completely safe.', 'glitch'],
    boom: ['BOOM! GOTCHA!', 'Just a tiny arcade sound effect. No volume settings were changed.', 'boom'],
    kartik: ['SECRET PLAYER UNLOCKED', 'You found the creator easter egg. Keep chasing your high score.', 'glitch']
  };
  if (darkCode) {
    darkGames.hidden = false;
    document.body.classList.add('dark-unlocked');
    cheatMessage.textContent = 'DARK GAMES UNLOCKED. WELCOME TO THE DARK MENU.';
    darkGames.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showPrank('DARK ACCESS GRANTED', 'The hidden Dark Games menu is now open.', 'glitch');
  } else if (easterEggs[code]) {
    const [title, message, sound] = easterEggs[code];
    cheatMessage.textContent = 'SECRET CODE ACCEPTED.';
    showPrank(title, message, sound);
  } else if (code) {
    cheatMessage.textContent = 'UNKNOWN CODE. USE LOWERCASE: dark';
    playSafeArcadeSound('glitch');
  }
});

const hideDarkGames = document.getElementById('hideDarkGames');
hideDarkGames.addEventListener('click', () => {
  document.getElementById('darkGames').hidden = true;
  document.body.classList.remove('dark-unlocked');
  document.getElementById('games').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

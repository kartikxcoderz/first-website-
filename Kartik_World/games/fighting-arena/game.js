import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Kartik World — Fighting Arena
// Lightweight procedural 3D fighters, arena lighting and combat effects.

const root = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d18);
scene.fog = new THREE.Fog(0x080d18, 13, 31);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(0, 8.5, 13.5);
camera.lookAt(0, 0.8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xb9d9ff, 0x25152d, 2.0));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
keyLight.position.set(-5, 11, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);
const pinkLight = new THREE.PointLight(0xff286d, 26, 16);
pinkLight.position.set(5, 4, -3);
scene.add(pinkLight);
const blueLight = new THREE.PointLight(0x28baff, 22, 15);
blueLight.position.set(-5, 3, 3);
scene.add(blueLight);

// Arena platform and luminous markings.
const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(7, 7, 0.5, 64),
  new THREE.MeshStandardMaterial({ color: 0x20283a, metalness: 0.62, roughness: 0.34 })
);
platform.position.y = -0.28;
platform.receiveShadow = true;
scene.add(platform);

const floorDisc = new THREE.Mesh(
  new THREE.CircleGeometry(6.65, 64),
  new THREE.MeshStandardMaterial({ color: 0x111a2b, metalness: 0.3, roughness: 0.65 })
);
floorDisc.rotation.x = -Math.PI / 2;
floorDisc.position.y = -0.015;
floorDisc.receiveShadow = true;
scene.add(floorDisc);

const grid = new THREE.GridHelper(13, 26, 0x315a80, 0x23344e);
grid.position.y = 0.012;
scene.add(grid);

const outerRing = new THREE.Mesh(
  new THREE.TorusGeometry(6.72, 0.075, 10, 96),
  new THREE.MeshBasicMaterial({ color: 0x36d9ff })
);
outerRing.rotation.x = Math.PI / 2;
outerRing.position.y = 0.06;
scene.add(outerRing);

const innerRing = new THREE.Mesh(
  new THREE.TorusGeometry(4.4, 0.025, 8, 96),
  new THREE.MeshBasicMaterial({ color: 0xff3e85 })
);
innerRing.rotation.x = Math.PI / 2;
innerRing.position.y = 0.025;
scene.add(innerRing);

const pillarMat = new THREE.MeshStandardMaterial({
  color: 0x263b58,
  metalness: 0.7,
  roughness: 0.28,
  emissive: 0x102b50,
  emissiveIntensity: 0.8
});
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 2.6, 0.38), pillarMat);
  pillar.position.set(Math.cos(angle) * 6.85, 1.05, Math.sin(angle) * 6.85);
  pillar.rotation.y = -angle;
  pillar.castShadow = true;
  scene.add(pillar);
  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.43, 0.09, 0.43),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff3e85 : 0x36d9ff })
  );
  lamp.position.set(pillar.position.x, 2.38, pillar.position.z);
  scene.add(lamp);
}

const mat = (color, metalness = 0.15, roughness = 0.45, emissive = 0x000000) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive, emissiveIntensity: 0.65 });

function makeFighter(team) {
  const group = new THREE.Group();
  const playerSide = team === 'player';
  const armor = mat(playerSide ? 0x9be64d : 0xc62f66, 0.45, 0.28, playerSide ? 0x284d0b : 0x4c0925);
  const darkArmor = mat(playerSide ? 0x293d2b : 0x3d1b30, 0.65, 0.32);
  const skin = mat(playerSide ? 0xd9a47c : 0xb87968, 0.05, 0.68);
  const glow = new THREE.MeshBasicMaterial({ color: playerSide ? 0xc6ff65 : 0xff4d91 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.65, 5, 12), armor);
  torso.position.y = 1.22;
  torso.castShadow = true;
  group.add(torso);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.18), darkArmor);
  chest.position.set(0, 1.43, 0.32);
  chest.castShadow = true;
  group.add(chest);

  const head = new THREE.Group();
  head.position.y = 1.93;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 14), skin);
  skull.scale.set(0.92, 1.05, 0.9);
  skull.castShadow = true;
  head.add(skull);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.095, 0.25), glow);
  visor.position.set(0, 0.015, 0.22);
  head.add(visor);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.29, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.48), darkArmor);
  helmet.position.y = 0.08;
  head.add(helmet);
  group.add(head);

  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.47, 1.53, 0);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.34, 4, 9), armor);
    upper.position.y = -0.22;
    upper.rotation.z = side * -0.12;
    upper.castShadow = true;
    shoulder.add(upper);
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), darkArmor);
    elbow.position.y = -0.43;
    shoulder.add(elbow);
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.28, 4, 9), darkArmor);
    forearm.position.set(0, -0.62, 0.04);
    forearm.castShadow = true;
    shoulder.add(forearm);
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skin);
    fist.position.set(0, -0.81, 0.07);
    fist.castShadow = true;
    shoulder.add(fist);
    group.add(shoulder);
    arms.push(shoulder);
  }

  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.2, 0.82, 0);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.35, 4, 9), darkArmor);
    thigh.position.y = -0.22;
    thigh.castShadow = true;
    hip.add(thigh);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.2, 0.43), armor);
    boot.position.set(0, -0.51, 0.1);
    boot.castShadow = true;
    hip.add(boot);
    group.add(hip);
    legs.push(hip);
  }

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.66, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.018;
  group.add(shadow);

  scene.add(group);
  return { group, torso, head, arms, legs, material: armor, phase: Math.random() * 6, attackAt: 0, hitAt: 0, hp: 3 };
}

const player = makeFighter('player');
player.group.position.set(0, 0, 2.2);
const enemies = [];
const particles = [];
const keys = new Set();
let health = 100;
let score = 0;
let wave = 1;
let playing = false;
let lastFrame = 0;
let shake = 0;
let attackCooldown = 0;

function spawnEnemy() {
  const enemy = makeFighter('enemy');
  const angle = Math.random() * Math.PI * 2;
  enemy.group.position.set(Math.cos(angle) * 5.1, 0, Math.sin(angle) * 5.1);
  enemies.push(enemy);
}

function resize() {
  const width = Math.max(1, root.clientWidth);
  const height = Math.max(1, root.clientHeight);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
new ResizeObserver(resize).observe(root);
resize();

function updateHud() {
  document.querySelector('#health').textContent = health;
  document.querySelector('#score').textContent = score;
  document.querySelector('#wave').textContent = wave;
}

function saveScore() {
  const key = 'kw-score-fighting-arena';
  if (score > Number(localStorage.getItem(key) || 0)) localStorage.setItem(key, String(score));
}

function burst(position, color, amount = 12, force = 1) {
  const geometry = new THREE.SphereGeometry(0.055, 6, 6);
  for (let i = 0; i < amount; i++) {
    const particle = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color }));
    particle.position.copy(position);
    scene.add(particle);
    particles.push({
      mesh: particle,
      velocity: new THREE.Vector3((Math.random() - 0.5) * force * 4, Math.random() * force * 3, (Math.random() - 0.5) * force * 4),
      life: 0.45 + Math.random() * 0.4
    });
  }
}

function shockwave(position, color) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.045, 8, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(position.x, 0.12, position.z);
  scene.add(ring);
  particles.push({ mesh: ring, ring: true, life: 0.42, maxLife: 0.42 });
}

function doAttack(power = 1) {
  if (!playing || attackCooldown > 0) return;
  attackCooldown = power === 2 ? 0.72 : 0.36;
  player.attackAt = performance.now();
  const color = power === 2 ? 0x45dfff : 0xc6ff65;
  burst(player.group.position.clone().add(new THREE.Vector3(0, 1.25, -0.35)), color, power === 2 ? 24 : 9, power === 2 ? 1.7 : 0.8);
  if (power === 2) shockwave(player.group.position, color);

  let hitCount = 0;
  for (const enemy of [...enemies]) {
    const distance = enemy.group.position.distanceTo(player.group.position);
    const direction = player.group.position.clone().sub(enemy.group.position).normalize();
    const facing = new THREE.Vector3(Math.sin(player.group.rotation.y), 0, Math.cos(player.group.rotation.y));
    if (distance < (power === 2 ? 3.2 : 2.25) && facing.dot(direction) < -0.05) {
      enemy.hp -= power;
      enemy.hitAt = performance.now();
      enemy.group.position.add(facing.clone().multiplyScalar(power === 2 ? 1.15 : 0.48));
      burst(enemy.group.position.clone().add(new THREE.Vector3(0, 1.3, 0)), power === 2 ? 0x4bdcff : 0xff4d91, 14, 1.25);
      shake = power === 2 ? 0.22 : 0.1;
      hitCount++;
      if (enemy.hp <= 0) {
        scene.remove(enemy.group);
        enemies.splice(enemies.indexOf(enemy), 1);
        score += 100;
      }
    }
  }

  if (hitCount && enemies.length === 0) {
    wave++;
    for (let i = 0; i < Math.min(2 + wave, 7); i++) spawnEnemy();
  }
  updateHud();
}

function endFight() {
  playing = false;
  saveScore();
  const overlay = document.querySelector('#overlay');
  overlay.style.display = 'flex';
  overlay.querySelector('h1').textContent = 'ARENA OVER';
  overlay.querySelector('p').textContent = `Final score: ${score}. Your best score is saved on this device.`;
  overlay.querySelector('button').textContent = 'FIGHT AGAIN';
}

function startFight() {
  health = 100;
  score = 0;
  wave = 1;
  enemies.forEach(enemy => scene.remove(enemy.group));
  enemies.length = 0;
  particles.forEach(particle => scene.remove(particle.mesh));
  particles.length = 0;
  for (let i = 0; i < 3; i++) spawnEnemy();
  player.group.position.set(0, 0, 2.2);
  player.group.rotation.y = Math.PI;
  playing = true;
  document.querySelector('#overlay').style.display = 'none';
  updateHud();
}

function movePlayer(dt) {
  let x = 0;
  let z = 0;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) x--;
  if (keys.has('KeyD') || keys.has('ArrowRight')) x++;
  if (keys.has('KeyW') || keys.has('ArrowUp')) z--;
  if (keys.has('KeyS') || keys.has('ArrowDown')) z++;
  const velocity = new THREE.Vector3(x, 0, z);
  if (velocity.lengthSq()) {
    velocity.normalize().multiplyScalar(dt * 5.1);
    player.group.position.add(velocity);
    player.group.rotation.y = Math.atan2(velocity.x, velocity.z);
  }
  player.group.position.x = THREE.MathUtils.clamp(player.group.position.x, -5.7, 5.7);
  player.group.position.z = THREE.MathUtils.clamp(player.group.position.z, -5.7, 5.7);
  return velocity.lengthSq() > 0;
}

function animateFighter(fighter, time, moving = false) {
  const phase = time * (moving ? 10 : 2.7) + fighter.phase;
  const swing = Math.sin(phase) * (moving ? 0.48 : 0.055);
  fighter.legs[0].rotation.x = swing;
  fighter.legs[1].rotation.x = -swing;
  fighter.arms[0].rotation.x = -swing * 0.55;
  fighter.arms[1].rotation.x = swing * 0.55;
  fighter.head.rotation.z = Math.sin(time * 1.8 + fighter.phase) * 0.035;
  fighter.torso.position.y = 1.22 + Math.sin(time * 3.4 + fighter.phase) * 0.035;

  const sinceAttack = performance.now() - fighter.attackAt;
  if (sinceAttack < 260) {
    const punch = Math.sin((sinceAttack / 260) * Math.PI);
    fighter.arms[1].rotation.x = -1.9 * punch;
    fighter.arms[1].rotation.z = -0.7 * punch;
  }
  const sinceHit = performance.now() - fighter.hitAt;
  if (sinceHit < 180) fighter.group.rotation.z = Math.sin((sinceHit / 180) * Math.PI) * 0.2;
  else fighter.group.rotation.z *= 0.82;
}

function updateEnemies(dt, time) {
  for (const enemy of enemies) {
    const towardPlayer = player.group.position.clone().sub(enemy.group.position);
    const distance = towardPlayer.length();
    if (distance > 1.35) {
      towardPlayer.normalize();
      enemy.group.position.add(towardPlayer.multiplyScalar(dt * (1.15 + wave * 0.045)));
      enemy.group.rotation.y = Math.atan2(towardPlayer.x, towardPlayer.z);
    } else if (time - enemy.hitAt > 950) {
      health = Math.max(0, health - 7);
      enemy.hitAt = time;
      burst(player.group.position.clone().add(new THREE.Vector3(0, 1.1, 0)), 0xff426d, 7, 0.55);
      updateHud();
      if (health <= 0) endFight();
    }
    animateFighter(enemy, time / 1000, distance > 1.5);
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.life -= dt;
    if (particle.ring) {
      const progress = 1 - particle.life / particle.maxLife;
      particle.mesh.scale.setScalar(1 + progress * 5);
      particle.mesh.material.opacity = Math.max(0, particle.life / particle.maxLife);
    } else {
      particle.velocity.y -= dt * 4.5;
      particle.mesh.position.add(particle.velocity.clone().multiplyScalar(dt));
      particle.mesh.scale.multiplyScalar(0.97);
    }
    if (particle.life <= 0) {
      scene.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      particle.mesh.material.dispose();
      particles.splice(i, 1);
    }
  }
}

function frame(time) {
  requestAnimationFrame(frame);
  const dt = Math.min((time - lastFrame) / 1000 || 0, 0.04);
  lastFrame = time;

  if (playing) {
    const moving = movePlayer(dt);
    animateFighter(player, time / 1000, moving);
    updateEnemies(dt, time);
    attackCooldown = Math.max(0, attackCooldown - dt);
  } else {
    animateFighter(player, time / 1000, false);
  }

  updateParticles(dt);
  outerRing.material.color.setHSL(0.53 + Math.sin(time * 0.0015) * 0.035, 0.95, 0.62);
  pinkLight.intensity = 23 + Math.sin(time * 0.002) * 5;
  blueLight.intensity = 20 + Math.cos(time * 0.0017) * 5;

  const target = new THREE.Vector3(player.group.position.x * 0.2, 0.8, player.group.position.z * 0.15);
  camera.position.x += (player.group.position.x * 0.27 - camera.position.x) * Math.min(1, dt * 2.2);
  camera.position.z += (13.5 + player.group.position.z * 0.16 - camera.position.z) * Math.min(1, dt * 1.5);
  camera.lookAt(target);
  if (shake > 0) {
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;
    shake = Math.max(0, shake - dt * 0.7);
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

window.addEventListener('keydown', event => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code === 'Space') doAttack(1);
  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') doAttack(2);
  if (event.code === 'KeyR') startFight();
});
window.addEventListener('keyup', event => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());

document.querySelectorAll('[data-key]').forEach(button => {
  const key = button.dataset.key;
  const down = event => {
    event.preventDefault();
    keys.add(key);
    if (key === 'Space') doAttack(1);
    if (key.startsWith('Shift')) doAttack(2);
  };
  const up = () => keys.delete(key);
  button.addEventListener('pointerdown', down);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(name => button.addEventListener(name, up));
});

document.querySelector('#start').addEventListener('click', startFight);
document.querySelector('#restart').addEventListener('click', startFight);
const touchDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && innerWidth < 900);
if (touchDevice) document.body.classList.add('touch-device');
document.querySelector('#device').textContent = touchDevice ? 'TOUCH CONTROLS' : 'KEYBOARD CONTROLS';
updateHud();

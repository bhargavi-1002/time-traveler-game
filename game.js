const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const statusText = document.getElementById('statusText');
const storyText = document.getElementById('storyText');
const eraName = document.getElementById('eraName');
const relicCount = document.getElementById('relicCount');
const livesCount = document.getElementById('livesCount');
const scoreCount = document.getElementById('scoreCount');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');

const worldWidth = 1800;
const groundY = 480;

const keys = {};
let lastTimestamp = 0;
let animationId = null;
let levelIndex = 0;
let totalScore = 0;
let tempMessageTimer = 0;

const eras = [
  {
    name: 'Ancient Ruins',
    skyTop: '#2b1d3b',
    skyBottom: '#d87d4d',
    accent: '#ffd166',
    portal: '#ff9f43',
    player: '#f3eadc',
    story:
      'The first relic lies hidden beneath the dusty ruins of a forgotten empire. Gather the Sun Sigil and awaken the gate.',
    platforms: [
      { x: 0, y: 480, w: 520, h: 60 },
      { x: 630, y: 420, w: 220, h: 20 },
      { x: 930, y: 350, w: 250, h: 20 },
      { x: 1240, y: 410, w: 180, h: 20 },
      { x: 1480, y: 270, w: 220, h: 18 },
      { x: 1685, y: 480, w: 115, h: 60 }
    ],
    hazards: [
      { x: 540, y: 480, w: 80, h: 18 },
      { x: 1160, y: 480, w: 80, h: 18 },
      { x: 1410, y: 480, w: 70, h: 18 }
    ],
    relics: [
      { x: 330, y: 395, r: 12 },
      { x: 1050, y: 285, r: 12 },
      { x: 1565, y: 210, r: 12 }
    ],
    portal: { x: 1705, y: 380, w: 58, h: 100 },
    playerStart: { x: 70, y: 440 }
  },
  {
    name: 'Sky Citadel',
    skyTop: '#181c56',
    skyBottom: '#7a5cff',
    accent: '#8ef6ff',
    portal: '#75f1d8',
    player: '#e8f2ff',
    story:
      'The second relic is guarded by palace storms and lightning bridges. Time the jumps and keep moving.',
    platforms: [
      { x: 0, y: 480, w: 440, h: 60 },
      { x: 540, y: 445, w: 210, h: 18 },
      { x: 810, y: 370, w: 220, h: 18 },
      { x: 1070, y: 300, w: 250, h: 18 },
      { x: 1360, y: 390, w: 210, h: 18 },
      { x: 1600, y: 470, w: 200, h: 70 }
    ],
    hazards: [
      { x: 450, y: 480, w: 70, h: 18 },
      { x: 760, y: 480, w: 70, h: 18 },
      { x: 1040, y: 480, w: 60, h: 18 },
      { x: 1320, y: 480, w: 60, h: 18 }
    ],
    relics: [
      { x: 605, y: 390, r: 12 },
      { x: 905, y: 315, r: 12 },
      { x: 1180, y: 245, r: 12 }
    ],
    portal: { x: 1700, y: 370, w: 56, h: 110 },
    playerStart: { x: 70, y: 440 }
  },
  {
    name: 'Neon Future',
    skyTop: '#070d1d',
    skyBottom: '#0a3b55',
    accent: '#7ef9d4',
    portal: '#6edbff',
    player: '#dff8ff',
    story:
      'The final relic waits inside a future city after the collapse. Restore the Chrono Engine and end the distortion.',
    platforms: [
      { x: 0, y: 480, w: 420, h: 60 },
      { x: 500, y: 420, w: 220, h: 18 },
      { x: 785, y: 350, w: 220, h: 18 },
      { x: 1080, y: 290, w: 230, h: 18 },
      { x: 1360, y: 380, w: 240, h: 18 },
      { x: 1650, y: 470, w: 150, h: 70 }
    ],
    hazards: [
      { x: 430, y: 480, w: 70, h: 18 },
      { x: 720, y: 480, w: 65, h: 18 },
      { x: 1010, y: 480, w: 70, h: 18 },
      { x: 1320, y: 480, w: 70, h: 18 }
    ],
    relics: [
      { x: 600, y: 360, r: 12 },
      { x: 885, y: 295, r: 12 },
      { x: 1185, y: 230, r: 12 }
    ],
    portal: { x: 1700, y: 370, w: 60, h: 110 },
    playerStart: { x: 80, y: 440 }
  }
];

const player = {
  x: 80,
  y: 440,
  w: 32,
  h: 42,
  vx: 0,
  vy: 0,
  onGround: false,
  facing: 1,
  invulnerable: 0,
  trail: []
};

let level = null;
let activePortal = false;
let running = false;
let lives = 3;

function startGame() {
  running = true;
  levelIndex = 0;
  totalScore = 0;
  lives = 3;
  overlay.classList.add('hidden');
  loadLevel(0);
  statusText.textContent = 'Mission online';
}

function loadLevel(index) {
  level = structuredClone(eras[index]);
  level.totalRelics = level.relics.length;
  level.remainingRelics = level.totalRelics;
  level.relics.forEach((relic) => {
    relic.collected = false;
  });
  activePortal = false;

  player.x = level.playerStart.x;
  player.y = level.playerStart.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.invulnerable = 0;

  eraName.textContent = level.name;
  storyText.textContent = level.story;
  relicCount.textContent = `0 / ${level.totalRelics}`;
  livesCount.textContent = String(lives);
  scoreCount.textContent = String(totalScore);
  statusText.textContent = `Entering ${level.name}`;
  tempMessageTimer = 2.1;
}

function loseLife() {
  if (player.invulnerable > 0) return;

  lives -= 1;
  livesCount.textContent = String(lives);
  statusText.textContent = 'Timeline disruption!';

  if (lives <= 0) {
    running = false;
    overlay.classList.remove('hidden');
    overlay.querySelector('h2').textContent = 'The timeline collapsed';
    overlay.querySelector('p').textContent = 'You failed to restore the Chrono Engine. Try again and fix the fractures.';
    overlay.querySelector('button').textContent = 'Restart Mission';
    overlay.querySelector('button').onclick = () => {
      startGame();
      overlay.querySelector('button').onclick = () => {
        startGame();
      };
    };
    return;
  }

  player.invulnerable = 1.6;
  player.x = level.playerStart.x;
  player.y = level.playerStart.y;
  player.vx = 0;
  player.vy = 0;
}

function nextLevel() {
  if (levelIndex < eras.length - 1) {
    levelIndex += 1;
    totalScore += 150;
    scoreCount.textContent = String(totalScore);
    loadLevel(levelIndex);
  } else {
    running = false;
    overlay.classList.remove('hidden');
    overlay.querySelector('h2').textContent = 'Timeline restored';
    overlay.querySelector('p').textContent = 'You closed the fractures and restored all three eras. The Chrono Engine is stable again.';
    overlay.querySelector('button').textContent = 'Play Again';
    overlay.querySelector('button').onclick = () => {
      startGame();
      overlay.querySelector('button').onclick = () => {
        startGame();
      };
    };
    statusText.textContent = 'Mission complete';
  }
}

function maybeCollectRelics() {
  let collectedThisFrame = 0;

  for (const relic of level.relics) {
    if (relic.collected) continue;

    const dx = player.x + player.w / 2 - relic.x;
    const dy = player.y + player.h / 2 - relic.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 26) {
      relic.collected = true;
      level.remainingRelics -= 1;
      totalScore += 200;
      scoreCount.textContent = String(totalScore);
      relicCount.textContent = `${level.totalRelics - level.remainingRelics} / ${level.totalRelics}`;
      statusText.textContent = 'Relic secured';
      tempMessageTimer = 1.8;
      collectedThisFrame += 1;
    }
  }

  if (collectedThisFrame > 0 && level.remainingRelics === 0) {
    activePortal = true;
    statusText.textContent = 'Portal activated';
    tempMessageTimer = 1.5;
  }
}

function intersects(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function updatePlayer(dt) {
  const runningKeys = (keys.ArrowLeft || keys.KeyA ? -1 : 0) + (keys.ArrowRight || keys.KeyD ? 1 : 0);
  const jumpPressed = keys.ArrowUp || keys.KeyW || keys.Space;

  if (runningKeys !== 0) {
    player.vx = runningKeys * 260;
    player.facing = runningKeys;
  } else {
    player.vx *= 0.8;
    if (Math.abs(player.vx) < 4) player.vx = 0;
  }

  if (jumpPressed && player.onGround) {
    player.vy = -620;
    player.onGround = false;
  }

  player.prevY = player.y;
  player.vy += 1650 * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > worldWidth) player.x = worldWidth - player.w;

  const basePlatforms = level.platforms;
  player.onGround = false;

  for (const platform of basePlatforms) {
    const overlapX = player.x + player.w > platform.x && player.x < platform.x + platform.w;
    const prevBottom = player.prevY + player.h;
    const currentBottom = player.y + player.h;

    if (overlapX && prevBottom <= platform.y + 12 && currentBottom >= platform.y && player.vy >= 0) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  if (player.y > canvas.height + 80) {
    loseLife();
  }

  player.invulnerable = Math.max(0, player.invulnerable - dt);

  for (const hazard of level.hazards) {
    const hazardRect = { x: hazard.x, y: hazard.y, w: hazard.w, h: hazard.h };
    if (intersects(player, hazardRect)) {
      loseLife();
      return;
    }
  }

  if (intersects(player, level.portal)) {
    if (activePortal) {
      nextLevel();
      return;
    }
    statusText.textContent = 'Collect all relics to unlock the portal';
    tempMessageTimer = 1.4;
  }

  maybeCollectRelics();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, level.skyTop);
  gradient.addColorStop(1, level.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 60; i += 1) {
    const x = (i * 173) % canvas.width;
    const y = (i * 97) % (canvas.height * 0.6);
    const radius = 1 + ((i * 7) % 3);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(12, 16, 29, 0.35)';
  for (let i = 0; i < 5; i += 1) {
    const baseY = 340 + i * 18;
    const width = 180 + i * 60;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, baseY);
    ctx.lineTo(width, baseY - 30 - i * 14);
    ctx.lineTo(width + 120, baseY);
    ctx.lineTo(canvas.width, baseY);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPlatforms() {
  for (const platform of level.platforms) {
    const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.h);
    gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(18, 20, 28, 0.85)');

    ctx.fillStyle = gradient;
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeRect(platform.x, platform.y, platform.w, platform.h);
  }
}

function drawHazards() {
  for (const hazard of level.hazards) {
    ctx.fillStyle = 'rgba(255, 94, 118, 0.75)';
    const spikeWidth = hazard.w / 5;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(hazard.x + i * spikeWidth, hazard.y + hazard.h);
      ctx.lineTo(hazard.x + i * spikeWidth + spikeWidth / 2, hazard.y);
      ctx.lineTo(hazard.x + (i + 1) * spikeWidth, hazard.y + hazard.h);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawRelics() {
  for (const relic of level.relics) {
    if (relic.collected) continue;

    const pulse = 1 + Math.sin(performance.now() * 0.006 + relic.x) * 0.14;
    ctx.save();
    ctx.translate(relic.x, relic.y);
    ctx.scale(pulse, pulse);

    ctx.strokeStyle = 'rgba(255, 214, 102, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 211, 89, 0.38)';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPortal() {
  const { x, y, w, h } = level.portal;
  const color = activePortal ? level.portal : '#5f7b8a';

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.5, h * 0.55, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = activePortal ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.35, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  const bodyX = player.x;
  const bodyY = player.y;

  if (player.invulnerable > 0 && Math.floor(player.invulnerable * 18) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(bodyX + player.w / 2, bodyY + player.h / 2);
  ctx.scale(player.facing, 1);

  ctx.fillStyle = 'rgba(122, 165, 255, 0.2)';
  ctx.fillRect(-18, 18, 36, 18);

  ctx.fillStyle = level.player;
  ctx.fillRect(-12, -16, 24, 32);
  ctx.fillStyle = '#0d1728';
  ctx.fillRect(-8, -22, 16, 10);
  ctx.fillStyle = '#0c0f26';
  ctx.fillRect(-10, 18, 5, 18);
  ctx.fillRect(5, 18, 5, 18);

  ctx.fillStyle = '#ffd166';
  ctx.fillRect(-8, -2, 5, 8);
  ctx.fillRect(3, -2, 5, 8);

  ctx.restore();
}

function render() {
  drawBackground();
  drawPlatforms();
  drawHazards();
  drawRelics();
  drawPortal();
  drawPlayer();
}

function tick(timestamp) {
  const dt = Math.min((timestamp - lastTimestamp) / 1000 || 0.016, 0.024);
  lastTimestamp = timestamp;

  if (running) {
    updatePlayer(dt);
  }

  if (tempMessageTimer > 0) {
    tempMessageTimer -= dt;
    if (tempMessageTimer <= 0) {
      statusText.textContent = 'Mission live';
    }
  }

  render();
  animationId = requestAnimationFrame(tick);
}

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

startButton.addEventListener('click', () => {
  startGame();
});

loadLevel(0);
render();
animationId = requestAnimationFrame(tick);

import { courseData } from './holes/course.js';

const canvas = document.getElementById('golf-canvas');
const ctx = canvas.getContext('2d');

const HEX_RADIUS = 9.8;
const ORIGIN_X = 180;
const ORIGIN_Y = 395;

const TERRAIN = {
  tee: { color: '#cddc39', label: 'Tee' },
  fairway: { color: '#4caf50', label: 'Fairway' },
  rough: { color: '#dcedc8', label: 'Rough' },
  deep_rough: { color: '#aed581', label: 'Deep Rough' },
  trees: { color: '#81c784', label: 'Trees' },
  sand: { color: '#fbc02d', label: 'Bunker' },
  water: { color: '#0288d1', label: 'Water' },
  green: { color: '#2e7d32', label: 'Green' },
  hole: { color: '#1a1a1a', label: 'Hole' }
};

const HEX_DIRS = [
  { q: 0, r: -1 },  // N (↑)
  { q: 1, r: -1 },  // NE (↗)
  { q: 1, r: 0 },   // SE (↘)
  { q: 0, r: 1 },   // S (↓)
  { q: -1, r: 1 },  // SW (↙)
  { q: -1, r: 0 }   // NW (↖)
];

let currentHoleIndex = 0;
let currentHole = courseData[currentHoleIndex];
let playerPos = { ...currentHole.tee };
let strokeCount = 0;

function loadHole(index) {
  if (index >= courseData.length) {
    document.getElementById('status-message').innerText = 'Round Complete! Well played.';
    return;
  }
  currentHoleIndex = index;
  currentHole = courseData[currentHoleIndex];
  playerPos = { ...currentHole.tee };
  strokeCount = 0;

  document.getElementById('hole-number').innerText = currentHole.id;
  document.getElementById('hole-par').innerText = currentHole.par;
  document.getElementById('stroke-count').innerText = strokeCount;
  document.getElementById('roll-btn').style.display = 'inline-block';
  document.getElementById('roll-btn').disabled = false;
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('status-message').innerText = `Hole ${currentHole.id}: ${currentHole.name}`;
  
  render();
}

function hexToPixel(q, r) {
  const x = HEX_RADIUS * (3 / 2 * q);
  const y = HEX_RADIUS * Math.sqrt(3) * (r + q / 2);
  return { x: ORIGIN_X + x, y: ORIGIN_Y + y };
}

function getTerrainAt(q, r) {
  const key = `${q},${r}`;
  if (currentHole.layout[key]) return currentHole.layout[key];
  if (q <= -11 || q >= 11 || r <= -23 || r >= 3) return 'trees';
  return 'rough';
}

function drawHex(x, y, type, arrow = null) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    const px = x + HEX_RADIUS * Math.cos(angle);
    const py = y + HEX_RADIUS * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  ctx.fillStyle = TERRAIN[type] ? TERRAIN[type].color : TERRAIN.rough.color;
  ctx.fill();
  ctx.strokeStyle = '#9ccc65';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  if (type === 'trees') {
    ctx.fillStyle = '#2e7d32';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▲', x, y);
  } else if (arrow !== null) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↑', x, y);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = -24; r <= 3; r++) {
    for (let q = -12; q <= 12; q++) {
      const { x, y } = hexToPixel(q, r);
      if (x >= -15 && x <= canvas.width + 15 && y >= -15 && y <= canvas.height + 15) {
        const type = getTerrainAt(q, r);
        const arrow = currentHole.slopeArrows[`${q},${r}`] ?? null;
        drawHex(x, y, type, arrow);
      }
    }
  }

  // Aiming Line Preview
  const aimDir = parseInt(document.getElementById('aim-select').value, 10);
  const currentPosPx = hexToPixel(playerPos.q, playerPos.r);
  const targetQ = playerPos.q + HEX_DIRS[aimDir].q * 4;
  const targetR = playerPos.r + HEX_DIRS[aimDir].r * 4;
  const targetPx = hexToPixel(targetQ, targetR);

  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.moveTo(currentPosPx.x, currentPosPx.y);
  ctx.lineTo(targetPx.x, targetPx.y);
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);

  // Render Ball
  ctx.beginPath();
  ctx.arc(currentPosPx.x, currentPosPx.y, 4, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function animateDie(elementId, finalValue) {
  return new Promise(resolve => {
    const el = document.getElementById(elementId);
    el.classList.add('rolling');
    const interval = setInterval(() => {
      el.innerText = Math.floor(Math.random() * 6) + 1;
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      el.classList.remove('rolling');
      el.innerText = finalValue;
      resolve();
    }, 350);
  });
}

async function executeShot() {
  const club = document.getElementById('club-select').value;
  const aimDir = parseInt(document.getElementById('aim-select').value, 10);
  const rollBtn = document.getElementById('roll-btn');
  const currentTerrain = getTerrainAt(playerPos.q, playerPos.r);

  if (club === 'driver' && currentTerrain !== 'tee') {
    document.getElementById('status-message').innerText = 'Driver allowed from Tee only!';
    return;
  }
  if (club === 'longIron' && !['tee', 'fairway'].includes(currentTerrain)) {
    document.getElementById('status-message').innerText = 'Long Iron allowed from Tee/Fairway only!';
    return;
  }

  rollBtn.disabled = true;

  // 1. Distance Roll
  const distRoll = Math.floor(Math.random() * 6) + 1;
  await animateDie('die-dist', distRoll);

  let baseDistance = 0;
  if (club === 'driver') baseDistance = distRoll + 4;
  else if (club === 'longIron') baseDistance = distRoll + 2;
  else if (club === 'shortIron') baseDistance = distRoll;
  else if (club === 'putter') baseDistance = distRoll <= 2 ? 1 : distRoll <= 4 ? 2 : 3;

  if (club !== 'putter') {
    if (currentTerrain === 'fairway') baseDistance += 1;
    if (['rough', 'sand'].includes(currentTerrain)) baseDistance = Math.max(1, baseDistance - 1);
    if (['deep_rough', 'trees'].includes(currentTerrain)) baseDistance = Math.max(1, baseDistance - 2);
  }

  document.getElementById('sub-dist').innerText = `${baseDistance} tiles`;

  // 2. Scatter Roll
  let scatDist = 0;
  let scatDirIndex = 0;

  if (club === 'driver' || club === 'longIron') {
    const dirRoll = Math.floor(Math.random() * 6) + 1;
    await animateDie('die-dir', dirRoll);
    scatDirIndex = dirRoll - 1;
    document.getElementById('sub-dir').innerText = `Dir: ${dirRoll}`;

    const scatRoll = Math.floor(Math.random() * 6) + 1;
    await animateDie('die-scat', scatRoll);

    if (club === 'driver') scatDist = scatRoll <= 2 ? 1 : scatRoll <= 4 ? 2 : 3;
    else scatDist = scatRoll <= 3 ? 0 : 1;

    document.getElementById('sub-scat').innerText = `${scatDist} tiles`;
  } else {
    document.getElementById('die-dir').innerText = '-';
    document.getElementById('die-scat').innerText = '-';
    document.getElementById('sub-dir').innerText = 'None';
    document.getElementById('sub-scat').innerText = '0 tiles';
  }

  let newQ = playerPos.q + HEX_DIRS[aimDir].q * baseDistance;
  let newR = playerPos.r + HEX_DIRS[aimDir].r * baseDistance;

  if (scatDist > 0) {
    newQ += HEX_DIRS[scatDirIndex].q * scatDist;
    newR += HEX_DIRS[scatDirIndex].r * scatDist;
  }

  const landingTerrain = getTerrainAt(newQ, newR);

  if (landingTerrain === 'water') {
    document.getElementById('status-message').innerText = 'Water hazard! Penalty stroke applied.';
    strokeCount += 2;
  } else {
    playerPos = { q: newQ, r: newR };
    strokeCount += 1;

    const arrow = currentHole.slopeArrows[`${playerPos.q},${playerPos.r}`];
    if (arrow !== undefined) {
      playerPos.q += HEX_DIRS[arrow].q;
      playerPos.r += HEX_DIRS[arrow].r;
    }
  }

  document.getElementById('stroke-count').innerText = strokeCount;
  render();

  const finalTerrain = getTerrainAt(playerPos.q, playerPos.r);
  if (finalTerrain === 'hole') {
    document.getElementById('status-message').innerText = `Hole finished in ${strokeCount} strokes!`;
    document.getElementById('roll-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'inline-block';
  } else {
    document.getElementById('status-message').innerText = `Landed in ${TERRAIN[finalTerrain].label}.`;
    rollBtn.disabled = false;
  }
}

document.getElementById('aim-select').addEventListener('change', render);
document.getElementById('roll-btn').addEventListener('click', executeShot);
document.getElementById('next-btn').addEventListener('click', () => loadHole(currentHoleIndex + 1));

loadHole(0);

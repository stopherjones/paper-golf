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

function hexDistance(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

function getHolePos() {
  if (currentHole.hole) return currentHole.hole;
  for (const [key, terrain] of Object.entries(currentHole.layout)) {
    if (terrain === 'hole') {
      const [q, r] = key.split(',').map(Number);
      return { q, r };
    }
  }
  return { q: 0, r: 0 };
}

function isAdjacentToHole(pos) {
  const holePos = getHolePos();
  return hexDistance(pos, holePos) === 1;
}

function getTerrainAt(q, r) {
  const key = `${q},${r}`;
  if (currentHole.layout[key]) return currentHole.layout[key];
  if (q <= -11 || q >= 11 || r <= -23 || r >= 3) return 'trees';
  return 'rough';
}

function isLand(q, r) {
  const terrain = getTerrainAt(q, r);
  return terrain !== 'water' && terrain !== 'trees';
}

function findNearestLand(targetQ, targetR) {
  if (isLand(targetQ, targetR)) return { q: targetQ, r: targetR };

  for (let radius = 1; radius <= 35; radius++) {
    const candidates = [];
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        if (Math.abs(q) === radius || Math.abs(r) === radius || Math.abs(q + r) === radius) {
          const checkQ = targetQ + q;
          const checkR = targetR + r;
          if (isLand(checkQ, checkR)) {
            const distToPrev = hexDistance({ q: checkQ, r: checkR }, playerPos);
            candidates.push({ q: checkQ, r: checkR, distToPrev });
          }
        }
      }
    }
    if (candidates.length > 0) {
      candidates.sort((a, b) => a.distToPrev - b.distToPrev);
      return { q: candidates[0].q, r: candidates[0].r };
    }
  }
  return { ...currentHole.tee };
}

function updateClubOptions() {
  const clubSelect = document.getElementById('club-select');
  const currentTerrain = getTerrainAt(playerPos.q, playerPos.r);
  const prevClub = clubSelect.value;

  const availableClubs = [];
  if (currentTerrain === 'tee') {
    availableClubs.push({ value: 'driver', label: 'Driver (1D6+4) — Tee only' });
  }
  if (['tee', 'fairway'].includes(currentTerrain)) {
    availableClubs.push({ value: 'longIron', label: 'Long Iron (1D6+2) — Tee/Fairway' });
  }
  availableClubs.push({ value: 'shortIron', label: 'Short Iron (1D6)' });
  availableClubs.push({ value: 'putter', label: 'Putter (1D6: 1-3)' });

  clubSelect.innerHTML = '';
  for (const club of availableClubs) {
    const opt = document.createElement('option');
    opt.value = club.value;
    opt.textContent = club.label;
    clubSelect.appendChild(opt);
  }

  const stillAvailable = availableClubs.some(c => c.value === prevClub);
  if (stillAvailable) {
    clubSelect.value = prevClub;
  } else if (currentTerrain === 'green') {
    clubSelect.value = 'putter';
  } else if (availableClubs.some(c => c.value === 'shortIron')) {
    clubSelect.value = 'shortIron';
  } else {
    clubSelect.value = availableClubs[0].value;
  }
}

function updateControlsState() {
  const rollBtn = document.getElementById('roll-btn');
  const gimmeBtn = document.getElementById('gimme-btn');
  const nextBtn = document.getElementById('next-btn');

  const finalTerrain = getTerrainAt(playerPos.q, playerPos.r);
  if (finalTerrain === 'hole') {
    rollBtn.style.display = 'none';
    gimmeBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    return;
  }

  rollBtn.style.display = 'inline-block';
  rollBtn.disabled = false;
  nextBtn.style.display = 'none';

  if (isAdjacentToHole(playerPos)) {
    gimmeBtn.style.display = 'inline-block';
    gimmeBtn.disabled = false;
  } else {
    gimmeBtn.style.display = 'none';
  }

  updateClubOptions();
}

function loadHole(index) {
  if (index >= courseData.length) {
    document.getElementById('status-message').innerText = 'Round Complete! Well played.';
    document.getElementById('roll-btn').style.display = 'none';
    document.getElementById('gimme-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    return;
  }
  currentHoleIndex = index;
  currentHole = courseData[currentHoleIndex];
  playerPos = { ...currentHole.tee };
  strokeCount = 0;

  document.getElementById('hole-number').innerText = currentHole.id;
  document.getElementById('hole-par').innerText = currentHole.par;
  document.getElementById('stroke-count').innerText = strokeCount;
  document.getElementById('status-message').innerText = `Hole ${currentHole.id}: ${currentHole.name}`;
  
  document.getElementById('die-dist').innerText = '-';
  document.getElementById('die-dir').innerText = '-';
  document.getElementById('die-scat').innerText = '-';
  document.getElementById('sub-dist').innerText = '0 tiles';
  document.getElementById('sub-dir').innerText = 'None';
  document.getElementById('sub-scat').innerText = '0 tiles';

  updateControlsState();
  render();
}

function hexToPixel(q, r) {
  const x = HEX_RADIUS * (3 / 2 * q);
  const y = HEX_RADIUS * Math.sqrt(3) * (r + q / 2);
  return { x: ORIGIN_X + x, y: ORIGIN_Y + y };
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
  const gimmeBtn = document.getElementById('gimme-btn');
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
  gimmeBtn.disabled = true;

  // 1. Distance Roll
  const distRoll = Math.floor(Math.random() * 6) + 1;
  await animateDie('die-dist', distRoll);

  // When playing in sand, add -1 to the D6 roll (min 0)
  let effectiveRoll = distRoll;
  if (currentTerrain === 'sand') {
    effectiveRoll = Math.max(0, distRoll - 1);
  }

  let baseDistance = 0;
  if (club === 'driver') baseDistance = effectiveRoll + 4;
  else if (club === 'longIron') baseDistance = effectiveRoll + 2;
  else if (club === 'shortIron') baseDistance = effectiveRoll;
  else if (club === 'putter') baseDistance = effectiveRoll <= 0 ? 0 : effectiveRoll <= 2 ? 1 : effectiveRoll <= 4 ? 2 : 3;

  if (club !== 'putter') {
    if (currentTerrain === 'fairway') baseDistance += 1;
    if (['rough'].includes(currentTerrain)) baseDistance = Math.max(1, baseDistance - 1);
    if (['deep_rough'].includes(currentTerrain)) baseDistance = Math.max(1, baseDistance - 2);
  }

  if (currentTerrain === 'sand') {
    document.getElementById('sub-dist').innerText = `${baseDistance} tiles (Sand -1: ${effectiveRoll})`;
  } else {
    document.getElementById('sub-dist').innerText = `${baseDistance} tiles`;
  }

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

  // If you land in water or trees (out of bounds), return ball to nearest hex on land + 1 shot penalty
  if (landingTerrain === 'water' || landingTerrain === 'trees') {
    strokeCount += 2; // 1 shot taken + 1 penalty stroke
    const nearestLand = findNearestLand(newQ, newR);
    playerPos = { q: nearestLand.q, r: nearestLand.r };

    const arrow = currentHole.slopeArrows[`${playerPos.q},${playerPos.r}`];
    if (arrow !== undefined) {
      const slideQ = playerPos.q + HEX_DIRS[arrow].q;
      const slideR = playerPos.r + HEX_DIRS[arrow].r;
      if (isLand(slideQ, slideR)) {
        playerPos.q = slideQ;
        playerPos.r = slideR;
      }
    }

    document.getElementById('stroke-count').innerText = strokeCount;
    render();

    const hazardName = landingTerrain === 'water' ? 'Water hazard' : 'Out of bounds in trees';
    document.getElementById('status-message').innerText = `${hazardName}! +1 penalty stroke. Ball placed on nearest land.`;
  } else {
    playerPos = { q: newQ, r: newR };
    strokeCount += 1;

    const arrow = currentHole.slopeArrows[`${playerPos.q},${playerPos.r}`];
    if (arrow !== undefined) {
      const slideQ = playerPos.q + HEX_DIRS[arrow].q;
      const slideR = playerPos.r + HEX_DIRS[arrow].r;
      if (!isLand(slideQ, slideR)) {
        const nearestLand = findNearestLand(slideQ, slideR);
        playerPos = { q: nearestLand.q, r: nearestLand.r };
      } else {
        playerPos.q = slideQ;
        playerPos.r = slideR;
      }
    }

    document.getElementById('stroke-count').innerText = strokeCount;
    render();

    const finalTerrain = getTerrainAt(playerPos.q, playerPos.r);
    if (finalTerrain === 'hole') {
      document.getElementById('status-message').innerText = `Hole finished in ${strokeCount} strokes!`;
    } else {
      document.getElementById('status-message').innerText = `Landed in ${TERRAIN[finalTerrain] ? TERRAIN[finalTerrain].label : 'Rough'}.`;
    }
  }

  updateControlsState();
}

function takeGimme() {
  strokeCount += 1;
  const holePos = getHolePos();
  playerPos = { ...holePos };
  document.getElementById('stroke-count').innerText = strokeCount;
  document.getElementById('status-message').innerText = `Gimme taken (+1 stroke)! Hole completed in ${strokeCount} strokes.`;
  
  document.getElementById('roll-btn').style.display = 'none';
  document.getElementById('gimme-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'inline-block';
  
  render();
}

document.getElementById('aim-select').addEventListener('change', render);
document.getElementById('roll-btn').addEventListener('click', executeShot);
document.getElementById('gimme-btn').addEventListener('click', takeGimme);
document.getElementById('next-btn').addEventListener('click', () => loadHole(currentHoleIndex + 1));

loadHole(0);


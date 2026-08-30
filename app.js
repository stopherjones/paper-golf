import { COURSES } from './holes/course.js';

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

// Current Game State
let currentCourseKey = 'parkland';
let currentHoles = COURSES.parkland.holes;
let currentHoleIndex = 0;
let currentHole = currentHoles[currentHoleIndex];
let playerPos = { ...currentHole.tee };
let strokeCount = 0;
let roundScores = new Array(9).fill(null);
let shotTrails = [];

function hexDistance(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

function getClubRange(club, terrain) {
  let min = 1;
  let max = 6;
  if (club === 'driver') { min = 5; max = 10; }
  else if (club === 'longIron') { min = 3; max = 8; }
  else if (club === 'shortIron') { min = 1; max = 6; }
  else if (club === 'putter') { min = 1; max = 3; }

  if (club !== 'putter') {
    if (terrain === 'fairway') { min += 1; max += 1; }
    if (terrain === 'rough') { min = Math.max(1, min - 1); max = Math.max(1, max - 1); }
    if (terrain === 'deep_rough') { min = Math.max(1, min - 2); max = Math.max(1, max - 2); }
  }
  return { min, max };
}

function syncAimUI(dirIndex) {
  const aimSelect = document.getElementById('aim-select');
  if (aimSelect) aimSelect.value = String(dirIndex);

  const pills = document.querySelectorAll('.aim-pill');
  pills.forEach((pill) => {
    if (pill.getAttribute('data-dir') === String(dirIndex)) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
}

function handleCanvasAim(clientX, clientY) {
  const finalTerrain = getTerrainAt(playerPos.q, playerPos.r);
  if (finalTerrain === 'hole') return;

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clickX = (clientX - rect.left) * scaleX;
  const clickY = (clientY - rect.top) * scaleY;

  const ballPx = hexToPixel(playerPos.q, playerPos.r);
  const dx = clickX - ballPx.x;
  const dy = clickY - ballPx.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 4) return;

  let bestDir = 0;
  let bestDot = -Infinity;

  for (let d = 0; d < 6; d++) {
    const targetPx = hexToPixel(playerPos.q + HEX_DIRS[d].q, playerPos.r + HEX_DIRS[d].r);
    const vecX = targetPx.x - ballPx.x;
    const vecY = targetPx.y - ballPx.y;
    const vLen = Math.hypot(vecX, vecY);
    const dot = (dx * vecX + dy * vecY) / (dist * vLen);
    if (dot > bestDot) {
      bestDot = dot;
      bestDir = d;
    }
  }

  syncAimUI(bestDir);
  render();

  const dirNames = ['N (↑)', 'NE (↗)', 'SE (↘)', 'S (↓)', 'SW (↙)', 'NW (↖)'];
  document.getElementById('status-message').innerText = `Aim set: ${dirNames[bestDir]}. Ready to roll!`;
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
  if (q <= -11 || q >= 11 || r <= -24 || r >= 3) return 'trees';
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

function calculateTotalScore() {
  let playedPar = 0;
  let totalStrokes = 0;
  for (let i = 0; i < currentHoles.length; i++) {
    if (roundScores[i] !== null) {
      playedPar += currentHoles[i].par;
      totalStrokes += roundScores[i];
    }
  }
  const diff = totalStrokes - playedPar;
  if (playedPar === 0) return { strokes: 0, diffStr: 'E', diff: 0 };
  if (diff === 0) return { strokes: totalStrokes, diffStr: 'E', diff: 0 };
  return { strokes: totalStrokes, diffStr: diff > 0 ? `+${diff}` : `${diff}`, diff };
}

function updateScoreboard() {
  document.getElementById('hole-number').innerText = `${currentHole.id}/${currentHoles.length}`;
  document.getElementById('hole-par').innerText = currentHole.par;
  document.getElementById('stroke-count').innerText = strokeCount;

  const total = calculateTotalScore();
  document.getElementById('total-score-display').innerText = total.diffStr;
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
    
    if (currentHoleIndex === currentHoles.length - 1) {
      nextBtn.innerText = 'ROUND FINISHED: SCORECARD 🏆';
    } else {
      nextBtn.innerText = 'NEXT HOLE →';
    }
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

function startCourse(courseKey) {
  currentCourseKey = courseKey;
  const courseInfo = COURSES[courseKey];
  currentHoles = courseInfo.holes;
  roundScores = new Array(currentHoles.length).fill(null);

  document.getElementById('current-course-badge').innerText = courseInfo.name;
  document.getElementById('modal-title').innerText = `${courseInfo.name} Scorecard`;

  document.getElementById('landing-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';

  loadHole(0);
}

function returnToClubhouse() {
  document.getElementById('scorecard-modal').style.display = 'none';
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('landing-screen').style.display = 'flex';
}

function loadHole(index) {
  if (index >= currentHoles.length) {
    showScorecardModal();
    return;
  }

  currentHoleIndex = index;
  currentHole = currentHoles[currentHoleIndex];
  playerPos = { ...currentHole.tee };
  strokeCount = 0;
  shotTrails = [];

  updateScoreboard();
  document.getElementById('status-message').innerText = `Hole ${currentHole.id}: ${currentHole.name} (Par ${currentHole.par})`;
  
  document.getElementById('die-dist').innerText = '-';
  document.getElementById('die-dir').innerText = '-';
  document.getElementById('die-scat').innerText = '-';
  document.getElementById('sub-dist').innerText = '0 tiles';
  document.getElementById('sub-dir').innerText = 'None';
  document.getElementById('sub-scat').innerText = '0 tiles';

  syncAimUI(0);
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

function drawTrailSegment(p1, p2, color, width, isDashed = false, showArrow = true) {
  if (p1.x === p2.x && p1.y === p2.y) return;
  ctx.save();
  ctx.beginPath();
  if (isDashed) {
    ctx.setLineDash([4, 3]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  if (showArrow) {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const arrowLen = 7;
    const arrowAngle = Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p2.x - arrowLen * Math.cos(angle - arrowAngle), p2.y - arrowLen * Math.sin(angle - arrowAngle));
    ctx.lineTo(p2.x - arrowLen * Math.cos(angle + arrowAngle), p2.y - arrowLen * Math.sin(angle + arrowAngle));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
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

  // Draw Shot Trails (Pencil path from where ball lay to where it finished)
  shotTrails.forEach((trail, idx) => {
    const isLatest = idx === shotTrails.length - 1;
    ctx.save();
    ctx.globalAlpha = isLatest ? 0.95 : 0.35;

    const pStart = hexToPixel(trail.start.q, trail.start.r);
    const pAimed = hexToPixel(trail.aimed.q, trail.aimed.r);

    // 1. Origin marker where ball lay
    ctx.beginPath();
    ctx.arc(pStart.x, pStart.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#b71c1c';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Trajectory line for roll + modifiers (solid crimson line)
    const hasScatterLine = trail.hasScatter && trail.scatter && (trail.scatter.q !== trail.aimed.q || trail.scatter.r !== trail.aimed.r);
    drawTrailSegment(pStart, pAimed, '#d32f2f', 2.4, false, !hasScatterLine);

    // 3. Scatter line (dashed amber line)
    if (hasScatterLine) {
      const pScatter = hexToPixel(trail.scatter.q, trail.scatter.r);
      // Intermediate junction node at roll distance
      ctx.beginPath();
      ctx.arc(pAimed.x, pAimed.y, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#f57c00';
      ctx.fill();

      drawTrailSegment(pAimed, pScatter, '#f57c00', 2, true, true);
    }

    // 4. Slope Slide (dotted cyan line)
    if (trail.slopeFrom && trail.slopeTo) {
      const pSlopeFrom = hexToPixel(trail.slopeFrom.q, trail.slopeFrom.r);
      const pSlopeTo = hexToPixel(trail.slopeTo.q, trail.slopeTo.r);
      drawTrailSegment(pSlopeFrom, pSlopeTo, '#0288d1', 1.8, true, true);
    }

    // 5. Hazard landing marker and drop path (if water or trees)
    if (trail.hazard && trail.hazardPos && trail.dropPos) {
      const pHazard = hexToPixel(trail.hazardPos.q, trail.hazardPos.r);
      const pDrop = hexToPixel(trail.dropPos.q, trail.dropPos.r);

      // Red X marker on hazard tile
      ctx.strokeStyle = '#b71c1c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pHazard.x - 3.5, pHazard.y - 3.5);
      ctx.lineTo(pHazard.x + 3.5, pHazard.y + 3.5);
      ctx.moveTo(pHazard.x + 3.5, pHazard.y - 3.5);
      ctx.lineTo(pHazard.x - 3.5, pHazard.y + 3.5);
      ctx.stroke();

      // Drop connection line
      drawTrailSegment(pHazard, pDrop, '#b71c1c', 1.5, true, true);
    }

    ctx.restore();
  });

  const finalTerrain = getTerrainAt(playerPos.q, playerPos.r);

  // Aiming Line Preview & Range Indicators (only when hole is active)
  if (finalTerrain !== 'hole') {
    const aimDir = parseInt(document.getElementById('aim-select').value, 10);
    const currentClub = document.getElementById('club-select').value;
    const currentPosPx = hexToPixel(playerPos.q, playerPos.r);
    const range = getClubRange(currentClub, finalTerrain);

    // Directional compass dots around the ball
    for (let d = 0; d < 6; d++) {
      const pTick = hexToPixel(playerPos.q + HEX_DIRS[d].q * 0.7, playerPos.r + HEX_DIRS[d].r * 0.7);
      ctx.beginPath();
      ctx.arc(pTick.x, pTick.y, d === aimDir ? 2.5 : 1.2, 0, 2 * Math.PI);
      ctx.fillStyle = d === aimDir ? '#1b5e20' : 'rgba(0,0,0,0.22)';
      ctx.fill();
    }

    const minQ = playerPos.q + HEX_DIRS[aimDir].q * range.min;
    const minR = playerPos.r + HEX_DIRS[aimDir].r * range.min;
    const minPx = hexToPixel(minQ, minR);

    const maxQ = playerPos.q + HEX_DIRS[aimDir].q * range.max;
    const maxR = playerPos.r + HEX_DIRS[aimDir].r * range.max;
    const maxPx = hexToPixel(maxQ, maxR);

    // Dotted flight trajectory
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(currentPosPx.x, currentPosPx.y);
    ctx.lineTo(minPx.x, minPx.y);
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Solid landing range band
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(minPx.x, minPx.y);
    ctx.lineTo(maxPx.x, maxPx.y);
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 2.8;
    ctx.stroke();

    // Max distance target crosshair / dot
    ctx.beginPath();
    ctx.arc(maxPx.x, maxPx.y, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#1b5e20';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Render Ball
  const currentPosPx = hexToPixel(playerPos.q, playerPos.r);
  ctx.beginPath();
  ctx.arc(currentPosPx.x, currentPosPx.y, 4, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function animateDie(elementId, finalValue, duration = 400) {
  return new Promise((resolve) => {
    const el = document.getElementById(elementId);
    el.classList.add('rolling');
    const interval = setInterval(() => {
      el.innerText = Math.floor(Math.random() * 6) + 1;
    }, 60);

    setTimeout(() => {
      clearInterval(interval);
      el.classList.remove('rolling');
      el.innerText = finalValue;
      resolve();
    }, duration);
  });
}

function recordHoleFinish() {
  roundScores[currentHoleIndex] = strokeCount;
  updateScoreboard();
}

async function executeShot() {
  const club = document.getElementById('club-select').value;
  const aimDir = parseInt(document.getElementById('aim-select').value, 10);
  const currentTerrain = getTerrainAt(playerPos.q, playerPos.r);

  const rollBtn = document.getElementById('roll-btn');
  const gimmeBtn = document.getElementById('gimme-btn');
  rollBtn.disabled = true;
  gimmeBtn.disabled = true;

  const shotStart = { q: playerPos.q, r: playerPos.r };

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

  const aimedPos = {
    q: shotStart.q + HEX_DIRS[aimDir].q * baseDistance,
    r: shotStart.r + HEX_DIRS[aimDir].r * baseDistance
  };

  let scatterPos = null;
  if (scatDist > 0) {
    scatterPos = {
      q: aimedPos.q + HEX_DIRS[scatDirIndex].q * scatDist,
      r: aimedPos.r + HEX_DIRS[scatDirIndex].r * scatDist
    };
  }

  const landingHex = scatterPos ? { ...scatterPos } : { ...aimedPos };
  const landingTerrain = getTerrainAt(landingHex.q, landingHex.r);

  let hazardType = null;
  let hazardPos = null;
  let dropPos = null;
  let slopeFrom = null;
  let slopeTo = null;

  // If you land in water or trees (out of bounds), return ball to nearest hex on land + 1 shot penalty
  if (landingTerrain === 'water' || landingTerrain === 'trees') {
    strokeCount += 2; // 1 shot taken + 1 penalty stroke
    hazardType = landingTerrain;
    hazardPos = { ...landingHex };
    const nearestLand = findNearestLand(landingHex.q, landingHex.r);
    dropPos = { ...nearestLand };
    playerPos = { q: nearestLand.q, r: nearestLand.r };

    const arrow = currentHole.slopeArrows[`${playerPos.q},${playerPos.r}`];
    if (arrow !== undefined) {
      const slideQ = playerPos.q + HEX_DIRS[arrow].q;
      const slideR = playerPos.r + HEX_DIRS[arrow].r;
      if (isLand(slideQ, slideR)) {
        slopeFrom = { q: playerPos.q, r: playerPos.r };
        slopeTo = { q: slideQ, r: slideR };
        playerPos.q = slideQ;
        playerPos.r = slideR;
      }
    }

    shotTrails.push({
      stroke: strokeCount,
      club: club,
      start: shotStart,
      aimed: aimedPos,
      hasScatter: scatDist > 0,
      scatter: scatterPos,
      hazard: hazardType,
      hazardPos: hazardPos,
      dropPos: dropPos,
      slopeFrom: slopeFrom,
      slopeTo: slopeTo,
      final: { ...playerPos }
    });

    updateScoreboard();
    render();

    const hazardName = landingTerrain === 'water' ? 'Water hazard' : 'Out of bounds in trees';
    document.getElementById('status-message').innerText = `${hazardName}! +1 penalty stroke. Ball placed on nearest land.`;
  } else {
    playerPos = { q: landingHex.q, r: landingHex.r };
    strokeCount += 1;

    const arrow = currentHole.slopeArrows[`${playerPos.q},${playerPos.r}`];
    if (arrow !== undefined) {
      const slideQ = playerPos.q + HEX_DIRS[arrow].q;
      const slideR = playerPos.r + HEX_DIRS[arrow].r;
      slopeFrom = { q: playerPos.q, r: playerPos.r };
      if (!isLand(slideQ, slideR)) {
        const nearestLand = findNearestLand(slideQ, slideR);
        slopeTo = { q: nearestLand.q, r: nearestLand.r };
        playerPos.q = nearestLand.q, r = nearestLand.r;
      } else {
        slopeTo = { q: slideQ, r: slideR };
        playerPos.q = slideQ;
        playerPos.r = slideR;
      }
    }

    shotTrails.push({
      stroke: strokeCount,
      club: club,
      start: shotStart,
      aimed: aimedPos,
      hasScatter: scatDist > 0,
      scatter: scatterPos,
      hazard: null,
      hazardPos: null,
      dropPos: null,
      slopeFrom: slopeFrom,
      slopeTo: slopeTo,
      final: { ...playerPos }
    });

    updateScoreboard();
    render();

    const finalTerrain = getTerrainAt(playerPos.q, playerPos.r);
    if (finalTerrain === 'hole') {
      recordHoleFinish();
      const diff = strokeCount - currentHole.par;
      const diffName = diff <= -2 ? 'Eagle!' : diff === -1 ? 'Birdie!' : diff === 0 ? 'Par!' : diff === 1 ? 'Bogey.' : 'Double Bogey+.';
      document.getElementById('status-message').innerText = `Hole completed in ${strokeCount} strokes! (${diffName})`;
    } else {
      document.getElementById('status-message').innerText = `Landed in ${TERRAIN[finalTerrain] ? TERRAIN[finalTerrain].label : 'Rough'}.`;
    }
  }

  updateControlsState();
}

function takeGimme() {
  const shotStart = { ...playerPos };
  strokeCount += 1;
  const holePos = getHolePos();
  playerPos = { ...holePos };

  shotTrails.push({
    stroke: strokeCount,
    club: 'gimme',
    start: shotStart,
    aimed: { ...holePos },
    hasScatter: false,
    scatter: null,
    hazard: null,
    hazardPos: null,
    dropPos: null,
    slopeFrom: null,
    slopeTo: null,
    final: { ...holePos }
  });

  recordHoleFinish();
  const diff = strokeCount - currentHole.par;
  const diffName = diff <= -2 ? 'Eagle!' : diff === -1 ? 'Birdie!' : diff === 0 ? 'Par!' : diff === 1 ? 'Bogey.' : 'Double Bogey+.';
  document.getElementById('status-message').innerText = `Gimme taken (+1 stroke)! Finished in ${strokeCount} (${diffName})`;
  
  updateControlsState();
  render();
}

function showScorecardModal() {
  const tbody = document.getElementById('scorecard-tbody');
  tbody.innerHTML = '';

  let totalPar = 0;
  let totalStrokes = 0;

  for (let i = 0; i < currentHoles.length; i++) {
    const h = currentHoles[i];
    const score = roundScores[i];
    totalPar += h.par;
    if (score !== null) totalStrokes += score;

    const tr = document.createElement('tr');
    const isCurrent = i === currentHoleIndex;
    if (isCurrent) tr.style.fontWeight = 'bold';

    let diffText = '-';
    let cellClass = '';
    if (score !== null) {
      const diff = score - h.par;
      if (diff <= -2) { diffText = `${diff}`; cellClass = 'score-cell-eagle'; }
      else if (diff === -1) { diffText = '-1'; cellClass = 'score-cell-birdie'; }
      else if (diff === 0) { diffText = 'E'; cellClass = 'score-cell-par'; }
      else if (diff === 1) { diffText = '+1'; cellClass = 'score-cell-bogey'; }
      else { diffText = `+${diff}`; cellClass = 'score-cell-double'; }
    }

    tr.innerHTML = `
      <td>${h.id}${isCurrent ? ' ⛳' : ''}</td>
      <td style="text-align: left; padding-left: 6px;">${h.name}</td>
      <td>${h.par}</td>
      <td class="${cellClass}">${score !== null ? score : '-'}</td>
      <td class="${cellClass}">${diffText}</td>
    `;
    tbody.appendChild(tr);
  }

  document.getElementById('card-total-par').innerText = totalPar;
  document.getElementById('card-total-strokes').innerText = totalStrokes > 0 ? totalStrokes : '-';
  const total = calculateTotalScore();
  document.getElementById('card-total-diff').innerText = total.diffStr;

  document.getElementById('scorecard-modal').style.display = 'flex';
}

function hideScorecardModal() {
  document.getElementById('scorecard-modal').style.display = 'none';
}

// Event Listeners
document.getElementById('start-parkland-btn').addEventListener('click', () => startCourse('parkland'));
document.getElementById('start-links-btn').addEventListener('click', () => startCourse('links'));

document.getElementById('card-parkland').addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') startCourse('parkland');
});
document.getElementById('card-links').addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') startCourse('links');
});

document.getElementById('toggle-rules-btn').addEventListener('click', () => {
  const drawer = document.getElementById('rules-drawer');
  drawer.classList.toggle('rules-collapsed');
  drawer.classList.toggle('rules-open');
});

document.getElementById('back-to-courses-btn').addEventListener('click', returnToClubhouse);
document.getElementById('view-scorecard-btn').addEventListener('click', showScorecardModal);
document.getElementById('close-modal-btn').addEventListener('click', hideScorecardModal);
document.getElementById('modal-clubhouse-btn').addEventListener('click', returnToClubhouse);
document.getElementById('modal-restart-course-btn').addEventListener('click', () => {
  hideScorecardModal();
  startCourse(currentCourseKey);
});

// Canvas interactive aiming (click & touch)
canvas.addEventListener('click', (e) => {
  handleCanvasAim(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches.length > 0) {
    const t = e.touches[0];
    handleCanvasAim(t.clientX, t.clientY);
  }
}, { passive: true });

// Aim pills buttons
document.querySelectorAll('.aim-pill').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const dir = parseInt(e.currentTarget.getAttribute('data-dir'), 10);
    syncAimUI(dir);
    render();
  });
});

document.getElementById('aim-select').addEventListener('change', (e) => {
  const dir = parseInt(e.target.value, 10);
  syncAimUI(dir);
  render();
});

document.getElementById('club-select').addEventListener('change', render);

document.getElementById('roll-btn').addEventListener('click', executeShot);
document.getElementById('gimme-btn').addEventListener('click', takeGimme);
document.getElementById('next-btn').addEventListener('click', () => loadHole(currentHoleIndex + 1));

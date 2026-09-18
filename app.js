import { COURSES, refreshDailyHole } from './holes/course.js';

const canvas = document.getElementById('golf-canvas');
const ctx = canvas.getContext('2d');

const HEX_RADIUS = 9.8;
const ORIGIN_X = 180;
const ORIGIN_Y = 395;

// Camera state for zoomable and scrollable/pannable hole view
const camera = {
  scale: 1.0,
  panX: 0,
  panY: 0,
  minScale: 0.4,
  maxScale: 2.8
};

const TERRAIN = {
  tee: { color: '#cddc39', label: 'Tee' },
  fairway: { color: '#4caf50', label: 'Fairway' },
  rough: { color: '#dcedc8', label: 'Rough' },
  deep_rough: { color: '#aed581', label: 'Deep Rough' },
  trees: { color: '#81c784', label: 'Trees' },
  sand: { color: '#fbc02d', label: 'Bunker' },
  water: { color: '#0288d1', label: 'Water' },
  green: { color: '#2e7d32', label: 'Green' },
  hole: { color: '#1a1a1a', label: 'Hole' },
  crazy_fairway: { color: '#00897b', label: 'Carpet Fairway' },
  bumper: { color: '#e91e63', label: 'Bumper Rail' },
  windmill: { color: '#00c853', label: 'Windmill Gate' },
  tube_in: { color: '#00b4d8', label: 'Warp Tube (In)' },
  tube_out: { color: '#76ff03', label: 'Warp Tube (Out)' },
  ramp: { color: '#ffd600', label: 'Speed Ramp' },
  funnel: { color: '#7c4dff', label: 'Loop-de-Loop' }
};

export const CRAZY_DICE = {
  precision: {
    id: 'precision',
    name: 'Precision Die (d4)',
    dieType: 'd4',
    sides: 4,
    min: 1,
    max: 4,
    hasScatter: false,
    label: '🎯 Precision Die (d4: 1-4) — Zero Scatter',
    perk: '🎯 Precision Die: 0 scatter (perfect for putts & windmill)'
  },
  standard: {
    id: 'standard',
    name: 'Standard Ball Die (d6)',
    dieType: 'd6',
    sides: 6,
    min: 1,
    max: 6,
    hasScatter: true,
    label: '⚪ Standard Ball Die (d6: 1-6) — Classic Roll',
    perk: '⚪ Standard Die: 1-6 roll with minor scatter on 4+'
  },
  power: {
    id: 'power',
    name: 'Super-Bounce Die (d10)',
    dieType: 'd10',
    sides: 10,
    min: 1,
    max: 10,
    hasScatter: true,
    superBounce: true,
    label: '💥 Super-Bounce Die (d10: 1-10) — High Velocity',
    perk: '💥 Super-Bounce Die: 1-10 tiles, bank-shot velocity'
  },
  sticky: {
    id: 'sticky',
    name: 'Sticky Lead Die (d6)',
    dieType: 'd6',
    sides: 5,
    min: 1,
    max: 5,
    hasScatter: false,
    ignoresSlopes: true,
    label: '⚓ Sticky Lead Die (d6: 1-5) — Ignores Slopes',
    perk: '⚓ Sticky Lead: stops dead on landing, ignores slopes'
  },
  bumper: {
    id: 'bumper',
    name: 'Rubber Bumper Die (d8)',
    dieType: 'd8',
    sides: 8,
    min: 2,
    max: 7,
    hasScatter: false,
    elasticRicochet: true,
    label: '🔴 Rubber Bumper Die (d8: 2-7) — Bank Bouncer',
    perk: '🔴 Rubber Bumper: rebounds off rails with remaining distance'
  },
  chaos: {
    id: 'chaos',
    name: 'Chaos Die (d20)',
    dieType: 'd20',
    sides: 20,
    min: 1,
    max: 20,
    hasScatter: true,
    isChaos: true,
    label: '🎲 Chaos Die (d20: 1-20) — Wild Shortcut',
    perk: '🎲 Chaos Die: 18-20 = cosmic ace leap; 1-3 = dud misfire'
  }
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
let windmillOpen = true;

function hexDistance(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

function getClubRange(club, terrain) {
  if (currentHole && currentHole.isCrazyGolf && CRAZY_DICE[club]) {
    return { min: CRAZY_DICE[club].min, max: CRAZY_DICE[club].max };
  }
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

let currentAimDir = 0;
export function getSelectedAimDir() {
  return currentAimDir;
}

function syncAimUI(dirIndex) {
  currentAimDir = parseInt(dirIndex, 10);

  const pills = document.querySelectorAll('.aim-pill');
  pills.forEach((pill) => {
    if (pill.getAttribute('data-dir') === String(currentAimDir)) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
}

let currentSelectedClub = 'driver';
export function getSelectedClub() {
  return currentSelectedClub;
}

export function selectClub(clubId) {
  currentSelectedClub = clubId;
  const boxes = document.querySelectorAll('.club-box');
  boxes.forEach((box) => {
    if (box.getAttribute('data-club') === clubId) {
      box.classList.add('active');
    } else {
      box.classList.remove('active');
    }
  });
  if (currentHole && currentHole.isCrazyGolf) {
    updateCrazyStatusBar();
  }
  render();
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

function updateCrazyStatusBar() {
  const bar = document.getElementById('crazy-status-bar');
  if (!bar) return;
  if (!currentHole || !currentHole.isCrazyGolf) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';

  const windmillPill = document.getElementById('windmill-status-pill');
  if (windmillPill) {
    if (windmillOpen) {
      windmillPill.innerText = '⚙️ Windmill: OPEN (Roll!)';
      windmillPill.className = 'crazy-tag windmill-open';
    } else {
      windmillPill.innerText = '⛔ Windmill: BLOCKED (Wait)';
      windmillPill.className = 'crazy-tag windmill-blocked';
    }
  }

  const perkPill = document.getElementById('active-perk-pill');
  const clubVal = getSelectedClub();
  if (perkPill && CRAZY_DICE[clubVal]) {
    perkPill.innerText = CRAZY_DICE[clubVal].perk;
  }
}

function updateClubOptions() {
  const container = document.getElementById('club-pills-container');
  if (!container) return;
  const currentTerrain = getTerrainAt(playerPos.q, playerPos.r);

  container.innerHTML = '';

  if (currentHole && currentHole.isCrazyGolf) {
    if (!CRAZY_DICE[currentSelectedClub]) {
      currentSelectedClub = 'precision';
    }

    const crazyList = [
      { id: 'precision', title: 'Precision', sub: 'd4 • 0 Scat' },
      { id: 'standard', title: 'Standard', sub: 'd6 • Classic' },
      { id: 'power', title: 'Power', sub: 'd10 • Max' },
      { id: 'sticky', title: 'Sticky', sub: 'd5 • No Slide' },
      { id: 'bumper', title: 'Bumper', sub: 'd8 • Rebound' },
      { id: 'chaos', title: 'Chaos', sub: 'd20 • Wild' }
    ];

    crazyList.forEach((die) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `club-box ${die.id === currentSelectedClub ? 'active' : ''}`;
      btn.setAttribute('data-club', die.id);
      btn.innerHTML = `
        <span class="club-box-title">${die.title}</span>
        <span class="club-box-sub">${die.sub}</span>
      `;
      container.appendChild(btn);
    });

    updateCrazyStatusBar();
    return;
  }

  updateCrazyStatusBar();

  const standardClubs = [
    { id: 'driver', title: 'Driver', sub: '1D6+4', allowed: ['tee'] },
    { id: 'longIron', title: 'Long Iron', sub: '1D6+2', allowed: ['tee', 'fairway'] },
    { id: 'shortIron', title: 'Short Iron', sub: '1D6', allowed: ['tee', 'fairway', 'rough', 'deep_rough', 'sand', 'green'] },
    { id: 'putter', title: 'Putter', sub: '1D6: 1-3', allowed: ['tee', 'fairway', 'rough', 'deep_rough', 'sand', 'green'] }
  ];

  // Check if current club is allowed from current terrain
  const currentAllowed = standardClubs.find(c => c.id === currentSelectedClub && c.allowed.includes(currentTerrain));
  if (!currentAllowed) {
    if (currentTerrain === 'green') {
      currentSelectedClub = 'putter';
    } else if (currentTerrain === 'fairway') {
      currentSelectedClub = 'longIron';
    } else if (currentTerrain === 'tee') {
      currentSelectedClub = 'driver';
    } else {
      currentSelectedClub = 'shortIron';
    }
  }

  standardClubs.forEach((club) => {
    const isAllowed = club.allowed.includes(currentTerrain);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `club-box ${club.id === currentSelectedClub ? 'active' : ''}`;
    btn.setAttribute('data-club', club.id);
    if (!isAllowed) {
      btn.disabled = true;
    }
    btn.innerHTML = `
      <span class="club-box-title">${club.title}</span>
      <span class="club-box-sub">${club.sub}</span>
    `;
    container.appendChild(btn);
  });
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
  requestAnimationFrame(() => fitHole());
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

  if (currentHole.isCrazyGolf) {
    windmillOpen = true;
  }
  updateCrazyStatusBar();

  updateScoreboard();
  document.getElementById('status-message').innerText = 'Tee shot: Select direction & club, then roll shot.';
  
  renderDieFace('die-dist', '-');
  renderDieFace('die-dir', '-');
  renderDieFace('die-scat', '-');
  document.getElementById('sub-dist').innerText = '0 tiles';
  updateShotControlDisplay('-', 0, true);

  syncAimUI(0);
  updateControlsState();
  fitHole();
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

  let fillColor = TERRAIN[type] ? TERRAIN[type].color : TERRAIN.rough.color;
  let strokeColor = '#9ccc65';
  let strokeWidth = 0.8;

  if (type === 'windmill') {
    fillColor = windmillOpen ? '#00c853' : '#d50000';
    strokeColor = windmillOpen ? '#1b5e20' : '#b71c1c';
    strokeWidth = 1.6;
  } else if (type === 'bumper') {
    fillColor = '#e91e63';
    strokeColor = '#880e4f';
    strokeWidth = 1.5;
  } else if (type === 'tube_in') {
    fillColor = '#00b4d8';
    strokeColor = '#0077b6';
    strokeWidth = 1.4;
  } else if (type === 'tube_out') {
    fillColor = '#76ff03';
    strokeColor = '#33691e';
    strokeWidth = 1.4;
  } else if (type === 'ramp') {
    fillColor = '#ffd600';
    strokeColor = '#f57f17';
    strokeWidth = 1.4;
  } else if (type === 'funnel') {
    fillColor = '#7c4dff';
    strokeColor = '#4a148c';
    strokeWidth = 1.4;
  } else if (type === 'crazy_fairway') {
    strokeColor = '#004d40';
  }

  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (type === 'trees') {
    ctx.fillStyle = '#2e7d32';
    ctx.font = '8px monospace';
    ctx.fillText('▲', x, y);
  } else if (type === 'bumper') {
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.fillStyle = '#e91e63';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('●', x, y);
  } else if (type === 'windmill') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(windmillOpen ? '✢' : '✖', x, y);
  } else if (type === 'tube_in') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('🌀', x, y);
  } else if (type === 'tube_out') {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('✨', x, y);
  } else if (type === 'ramp') {
    ctx.fillStyle = '#b78103';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('▲▲', x, y);
  } else if (type === 'funnel') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('↺', x, y);
  } else if (arrow !== null) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    const arrowChars = ['↑', '↗', '↘', '↓', '↙', '↖'];
    const symbol = typeof arrow === 'number' && arrowChars[arrow] ? arrowChars[arrow] : '↑';
    ctx.fillText(symbol, x, y);
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
  resizeCanvas();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // Apply camera zoom & pan
  ctx.translate(camera.panX, camera.panY);
  ctx.scale(camera.scale, camera.scale);

  // Compute world coordinates for visible viewport culling
  const viewMinX = -camera.panX / camera.scale - 25;
  const viewMaxX = (cssWidth - camera.panX) / camera.scale + 25;
  const viewMinY = -camera.panY / camera.scale - 25;
  const viewMaxY = (cssHeight - camera.panY) / camera.scale + 25;

  for (let r = -25; r <= 4; r++) {
    for (let q = -12; q <= 12; q++) {
      const { x, y } = hexToPixel(q, r);
      if (x >= viewMinX && x <= viewMaxX && y >= viewMinY && y <= viewMaxY) {
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

    if (trail.waypoints && trail.waypoints.length > 1) {
      // Draw path through interactive obstacles and waypoints
      for (let w = 0; w < trail.waypoints.length - 1; w++) {
        const wp1 = trail.waypoints[w];
        const wp2 = trail.waypoints[w + 1];
        const p1 = hexToPixel(wp1.q, wp1.r);
        const p2 = hexToPixel(wp2.q, wp2.r);
        const isWarp = wp2.isWarp || (wp2.note && wp2.note.includes('Warp'));
        const isRicochet = wp2.isRicochet || (wp2.note && wp2.note.includes('Ricochet'));
        const color = isWarp ? '#00e5ff' : isRicochet ? '#e91e63' : '#d32f2f';
        const isDashed = isWarp || isRicochet;
        drawTrailSegment(p1, p2, color, 2.4, isDashed, w === trail.waypoints.length - 2);

        if (isRicochet) {
          ctx.beginPath();
          ctx.arc(p2.x, p2.y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = '#e91e63';
          ctx.fill();
        }
      }
    } else {
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
    const aimDir = getSelectedAimDir();
    const currentClub = getSelectedClub();
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

  ctx.restore();

  renderMinimap();
}

function resizeCanvas() {
  const wrapper = document.getElementById('canvas-wrapper');
  if (!wrapper) return;
  const rect = wrapper.getBoundingClientRect();
  const width = Math.max(260, Math.floor(rect.width));
  const height = Math.max(160, Math.floor(rect.height));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const targetW = Math.floor(width * dpr);
  const targetH = Math.floor(height * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }
}

function updateZoomUI() {
  const indicator = document.getElementById('zoom-level-indicator');
  if (indicator) {
    indicator.innerText = `${Math.round(camera.scale * 100)}%`;
  }
}

function clampCamera() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;

  const worldMinX = -20;
  const worldMaxX = 380;
  const worldMinY = -80;
  const worldMaxY = 460;

  const minPanX = cssWidth - worldMaxX * camera.scale - 60;
  const maxPanX = -worldMinX * camera.scale + 60;
  const minPanY = cssHeight - worldMaxY * camera.scale - 60;
  const maxPanY = -worldMinY * camera.scale + 60;

  if (minPanX < maxPanX) {
    camera.panX = Math.min(maxPanX, Math.max(minPanX, camera.panX));
  } else {
    camera.panX = (cssWidth - (worldMinX + worldMaxX) * camera.scale) / 2;
  }

  if (minPanY < maxPanY) {
    camera.panY = Math.min(maxPanY, Math.max(minPanY, camera.panY));
  } else {
    camera.panY = (cssHeight - (worldMinY + worldMaxY) * camera.scale) / 2;
  }
}

function fitHole() {
  resizeCanvas();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;

  let minQ = currentHole.tee.q;
  let maxQ = currentHole.tee.q;
  let minR = currentHole.tee.r;
  let maxR = currentHole.tee.r;

  for (const key of Object.keys(currentHole.layout)) {
    const [qStr, rStr] = key.split(',');
    const q = parseInt(qStr, 10);
    const r = parseInt(rStr, 10);
    if (!isNaN(q) && !isNaN(r)) {
      if (q < minQ) minQ = q;
      if (q > maxQ) maxQ = q;
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
    }
  }

  const holePos = getHolePos();
  if (holePos) {
    minQ = Math.min(minQ, holePos.q);
    maxQ = Math.max(maxQ, holePos.q);
    minR = Math.min(minR, holePos.r);
    maxR = Math.max(maxR, holePos.r);
  }

  minQ -= 1;
  maxQ += 1;
  minR -= 1;
  maxR += 1;

  const p1 = hexToPixel(minQ, minR);
  const p2 = hexToPixel(maxQ, minR);
  const p3 = hexToPixel(minQ, maxR);
  const p4 = hexToPixel(maxQ, maxR);

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x) - 16;
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x) + 16;
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y) - 16;
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y) + 16;

  const boxW = Math.max(140, maxX - minX);
  const boxH = Math.max(180, maxY - minY);

  const availW = Math.max(140, cssWidth - 24);
  const availH = Math.max(140, cssHeight - 24);

  const scaleX = availW / boxW;
  const scaleY = availH / boxH;
  let targetScale = Math.min(scaleX, scaleY);
  targetScale = Math.max(camera.minScale, Math.min(1.35, targetScale));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  camera.scale = targetScale;
  camera.panX = cssWidth / 2 - centerX * camera.scale;
  camera.panY = cssHeight / 2 - centerY * camera.scale;

  clampCamera();
  updateZoomUI();
  render();
}

function centerOnBall() {
  resizeCanvas();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;

  if (camera.scale < 1.15) {
    camera.scale = 1.15;
  }

  const ballPx = hexToPixel(playerPos.q, playerPos.r);
  camera.panX = cssWidth / 2 - ballPx.x * camera.scale;
  camera.panY = cssHeight / 2 - ballPx.y * camera.scale;

  clampCamera();
  updateZoomUI();
  render();
}

function zoomAtPoint(factor, screenX, screenY) {
  const oldScale = camera.scale;
  let newScale = oldScale * factor;
  newScale = Math.max(camera.minScale, Math.min(camera.maxScale, newScale));
  if (Math.abs(newScale - oldScale) < 0.001) return;

  camera.panX = screenX - (screenX - camera.panX) * (newScale / oldScale);
  camera.panY = screenY - (screenY - camera.panY) * (newScale / oldScale);
  camera.scale = newScale;

  clampCamera();
  updateZoomUI();
  render();
}

function zoomBy(factor) {
  resizeCanvas();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;
  zoomAtPoint(factor, cssWidth / 2, cssHeight / 2);
}

function keepBallInView() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;
  const ballPx = hexToPixel(playerPos.q, playerPos.r);
  const ballScreenX = ballPx.x * camera.scale + camera.panX;
  const ballScreenY = ballPx.y * camera.scale + camera.panY;

  const margin = 35;
  if (ballScreenX < margin || ballScreenX > cssWidth - margin ||
      ballScreenY < margin || ballScreenY > cssHeight - margin) {
    centerOnBall();
  }
}

function dismissScrollHint() {
  const hint = document.getElementById('hole-scroll-hint');
  if (hint && hint.style.opacity !== '0') {
    hint.style.opacity = '0';
    setTimeout(() => { if (hint) hint.style.display = 'none'; }, 550);
  }
}

// ==========================================
// HOLE PREVIEW MINIMAP LOGIC
// ==========================================

let isMinimapMinimised = false;
let minimapTransform = { scale: 1, offsetX: 0, offsetY: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };

function toggleMinimap(minimise) {
  const container = document.getElementById('hole-minimap-container');
  if (!container) return;

  if (typeof minimise === 'boolean') {
    isMinimapMinimised = minimise;
  } else {
    isMinimapMinimised = !isMinimapMinimised;
  }

  if (isMinimapMinimised) {
    container.classList.remove('minimap-expanded');
    container.classList.add('minimap-minimised');
  } else {
    container.classList.remove('minimap-minimised');
    container.classList.add('minimap-expanded');
    renderMinimap();
  }
}

function renderMinimap() {
  const container = document.getElementById('hole-minimap-container');
  if (!container || isMinimapMinimised) return;

  const mmCanvas = document.getElementById('minimap-canvas');
  if (!mmCanvas || !currentHole) return;
  const mmCtx = mmCanvas.getContext('2d');

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = 104;
  const cssH = 122;

  if (mmCanvas.width !== Math.floor(cssW * dpr) || mmCanvas.height !== Math.floor(cssH * dpr)) {
    mmCanvas.width = Math.floor(cssW * dpr);
    mmCanvas.height = Math.floor(cssH * dpr);
    mmCanvas.style.width = cssW + 'px';
    mmCanvas.style.height = cssH + 'px';
  }

  mmCtx.save();
  mmCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mmCtx.clearRect(0, 0, cssW, cssH);

  // Background tint for minimap terrain
  mmCtx.fillStyle = '#b7cf99';
  mmCtx.fillRect(0, 0, cssW, cssH);

  // Calculate bounding box of this hole
  let minQ = currentHole.tee.q;
  let maxQ = currentHole.tee.q;
  let minR = currentHole.tee.r;
  let maxR = currentHole.tee.r;

  for (const key of Object.keys(currentHole.layout)) {
    const [qStr, rStr] = key.split(',');
    const q = parseInt(qStr, 10);
    const r = parseInt(rStr, 10);
    if (!isNaN(q) && !isNaN(r)) {
      if (q < minQ) minQ = q;
      if (q > maxQ) maxQ = q;
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
    }
  }

  const holePos = getHolePos();
  if (holePos) {
    minQ = Math.min(minQ, holePos.q);
    maxQ = Math.max(maxQ, holePos.q);
    minR = Math.min(minR, holePos.r);
    maxR = Math.max(maxR, holePos.r);
  }

  minQ -= 1;
  maxQ += 1;
  minR -= 1;
  maxR += 1;

  const p1 = hexToPixel(minQ, minR);
  const p2 = hexToPixel(maxQ, minR);
  const p3 = hexToPixel(minQ, maxR);
  const p4 = hexToPixel(maxQ, maxR);

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x) - 12;
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x) + 12;
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y) - 12;
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y) + 12;

  const boxW = Math.max(80, maxX - minX);
  const boxH = Math.max(100, maxY - minY);

  const pad = 6;
  const scale = Math.min((cssW - pad * 2) / boxW, (cssH - pad * 2) / boxH);
  const offsetX = (cssW - (maxX - minX) * scale) / 2 - minX * scale;
  const offsetY = (cssH - (maxY - minY) * scale) / 2 - minY * scale;

  minimapTransform = { scale, offsetX, offsetY, minX, maxX, minY, maxY };

  // Draw tiles
  const hexMmRadius = Math.max(1.8, HEX_RADIUS * scale);

  for (const key of Object.keys(currentHole.layout)) {
    const [qStr, rStr] = key.split(',');
    const q = parseInt(qStr, 10);
    const r = parseInt(rStr, 10);
    const type = currentHole.layout[key];
    const { x, y } = hexToPixel(q, r);
    const mx = x * scale + offsetX;
    const my = y * scale + offsetY;

    let col = TERRAIN[type] ? TERRAIN[type].color : '#cddc39';
    if (type === 'windmill') {
      col = windmillOpen ? '#00c853' : '#d50000';
    }

    mmCtx.beginPath();
    mmCtx.arc(mx, my, hexMmRadius * 0.9, 0, 2 * Math.PI);
    mmCtx.fillStyle = col;
    mmCtx.fill();
  }

  // Draw Tee
  const teePx = hexToPixel(currentHole.tee.q, currentHole.tee.r);
  const teeMx = teePx.x * scale + offsetX;
  const teeMy = teePx.y * scale + offsetY;
  mmCtx.beginPath();
  mmCtx.arc(teeMx, teeMy, 2.5, 0, 2 * Math.PI);
  mmCtx.fillStyle = '#827717';
  mmCtx.fill();
  mmCtx.strokeStyle = '#ffffff';
  mmCtx.lineWidth = 0.8;
  mmCtx.stroke();

  // Draw Hole Pin
  if (holePos) {
    const cupPx = hexToPixel(holePos.q, holePos.r);
    const cupMx = cupPx.x * scale + offsetX;
    const cupMy = cupPx.y * scale + offsetY;

    // Cup
    mmCtx.beginPath();
    mmCtx.arc(cupMx, cupMy, 2.6, 0, 2 * Math.PI);
    mmCtx.fillStyle = '#1a1a1a';
    mmCtx.fill();

    // Flag pole & red pennant
    mmCtx.beginPath();
    mmCtx.moveTo(cupMx, cupMy);
    mmCtx.lineTo(cupMx, cupMy - 6.5);
    mmCtx.strokeStyle = '#ffffff';
    mmCtx.lineWidth = 1;
    mmCtx.stroke();

    mmCtx.beginPath();
    mmCtx.moveTo(cupMx, cupMy - 6.5);
    mmCtx.lineTo(cupMx + 4, cupMy - 4.5);
    mmCtx.lineTo(cupMx, cupMy - 2.5);
    mmCtx.fillStyle = '#d32f2f';
    mmCtx.fill();
  }

  // Draw Player Ball
  const ballPx = hexToPixel(playerPos.q, playerPos.r);
  const bMx = ballPx.x * scale + offsetX;
  const bMy = ballPx.y * scale + offsetY;

  // Pulse halo ring
  mmCtx.beginPath();
  mmCtx.arc(bMx, bMy, 4.5, 0, 2 * Math.PI);
  mmCtx.fillStyle = 'rgba(233, 30, 99, 0.4)';
  mmCtx.fill();

  // Ball core
  mmCtx.beginPath();
  mmCtx.arc(bMx, bMy, 2.8, 0, 2 * Math.PI);
  mmCtx.fillStyle = '#ffffff';
  mmCtx.fill();
  mmCtx.strokeStyle = '#1a1a1a';
  mmCtx.lineWidth = 1;
  mmCtx.stroke();

  // Draw Viewport Camera Frustum/Box
  const mainDpr = Math.min(window.devicePixelRatio || 1, 2);
  const mainCssW = canvas.width / mainDpr;
  const mainCssH = canvas.height / mainDpr;

  const viewWorldX = -camera.panX / camera.scale;
  const viewWorldY = -camera.panY / camera.scale;
  const viewWorldW = mainCssW / camera.scale;
  const viewWorldH = mainCssH / camera.scale;

  const camMx = viewWorldX * scale + offsetX;
  const camMy = viewWorldY * scale + offsetY;
  const camMw = viewWorldW * scale;
  const camMh = viewWorldH * scale;

  mmCtx.strokeStyle = '#1a1a1a';
  mmCtx.lineWidth = 1.2;
  mmCtx.setLineDash([2, 2]);
  mmCtx.strokeRect(camMx, camMy, camMw, camMh);
  mmCtx.setLineDash([]);
  mmCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  mmCtx.fillRect(camMx, camMy, camMw, camMh);

  mmCtx.restore();
}

export function renderDieFace(elementId, value) {
  const el = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
  if (!el) return;
  el.innerHTML = '';

  if (value === '-' || value === null || value === undefined || value === '' || value === 'None') {
    el.className = 'die die-empty';
    el.innerText = '-';
    return;
  }

  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1) {
    el.className = 'die die-empty';
    el.innerText = '-';
    return;
  }

  if (num > 6) {
    el.className = 'die die-numeral';
    el.innerText = String(num);
    return;
  }

  el.className = `die die-pip-face die-val-${num}`;

  const pipCoords = {
    1: [[2, 2]],
    2: [[1, 3], [3, 1]],
    3: [[1, 3], [2, 2], [3, 1]],
    4: [[1, 1], [1, 3], [3, 1], [3, 3]],
    5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
    6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
  };

  const coords = pipCoords[num] || [];
  for (const [row, col] of coords) {
    const pip = document.createElement('span');
    pip.className = 'die-pip';
    pip.style.gridRow = String(row);
    pip.style.gridColumn = String(col);
    el.appendChild(pip);
  }
}

export function getShotControlNote(dirRoll, scatDist) {
  if (!dirRoll || dirRoll === '-' || scatDist === 0 || scatDist === '0' || scatDist === 'Pinned') {
    return 'On target (no scatter)';
  }

  // dirRoll: 1 -> N (0), 2 -> NE (1), 3 -> SE (2), 4 -> S (3), 5 -> SW (4), 6 -> NW (5)
  const dirIndex = (parseInt(dirRoll, 10) - 1 + 6) % 6;

  // Directions:
  // N = 0, NE = 1, SE = 2, S = 3, SW = 4, NW = 5
  const isOver = (dirIndex === 0 || dirIndex === 5 || dirIndex === 1); // N, NW, NE
  const isUnder = (dirIndex === 3 || dirIndex === 2 || dirIndex === 4); // S, SE, SW
  const isSliced = (dirIndex === 1 || dirIndex === 2); // NE, SE
  const isHooked = (dirIndex === 5 || dirIndex === 4); // NW, SW

  if (isOver && isHooked) {
    return 'over-hit, hooked shot';
  } else if (isOver && isSliced) {
    return 'over-hit, sliced shot';
  } else if (isOver) {
    return 'over-hit shot';
  } else if (isUnder && isHooked) {
    return 'under-hit, hooked shot';
  } else if (isUnder && isSliced) {
    return 'under-hit, sliced shot';
  } else if (isUnder) {
    return 'under-hit shot';
  }
  return 'On target';
}

export function updateShotControlDisplay(dirRoll, scatDist, isPure = false) {
  const subControl = document.getElementById('sub-control');
  if (!subControl) return;

  if (isPure || !dirRoll || dirRoll === '-' || scatDist === 0 || scatDist === '0' || scatDist === 'Pinned') {
    subControl.innerHTML = '<span class="control-note">On target (no scatter)</span>';
    return;
  }

  const note = getShotControlNote(dirRoll, scatDist);
  const distNumber = typeof scatDist === 'number' ? scatDist : parseInt(scatDist, 10) || 1;
  const distLabel = distNumber === 1 ? '1 tile' : `${distNumber} tiles`;

  subControl.innerHTML = `<span class="control-note">${note}</span> <span class="control-dist-tag">(${distLabel})</span>`;
}

function animateDie(elementId, finalValue, duration = 400, maxSides = 6) {
  return new Promise((resolve) => {
    const el = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
    if (!el) {
      resolve();
      return;
    }
    el.classList.add('rolling');
    const interval = setInterval(() => {
      const tempVal = Math.floor(Math.random() * Math.min(maxSides, 6)) + 1;
      renderDieFace(el, tempVal);
    }, 60);

    setTimeout(() => {
      clearInterval(interval);
      el.classList.remove('rolling');
      renderDieFace(el, finalValue);
      resolve();
    }, duration);
  });
}

function recordHoleFinish() {
  roundScores[currentHoleIndex] = strokeCount;
  updateScoreboard();
}

async function executeShot() {
  const club = getSelectedClub();
  const aimDir = getSelectedAimDir();
  const currentTerrain = getTerrainAt(playerPos.q, playerPos.r);

  const rollBtn = document.getElementById('roll-btn');
  const gimmeBtn = document.getElementById('gimme-btn');
  rollBtn.disabled = true;
  gimmeBtn.disabled = true;

  const shotStart = { q: playerPos.q, r: playerPos.r };

  // ==========================================
  // CRAZY GOLF MODE SHOT RESOLUTION
  // ==========================================
  if (currentHole && currentHole.isCrazyGolf) {
    const dieConfig = CRAZY_DICE[club] || CRAZY_DICE.precision;

    // 1. Distance Die Roll
    let distRoll = 1;
    if (dieConfig.id === 'precision') distRoll = Math.floor(Math.random() * 4) + 1;
    else if (dieConfig.id === 'standard') distRoll = Math.floor(Math.random() * 6) + 1;
    else if (dieConfig.id === 'power') distRoll = Math.floor(Math.random() * 10) + 1;
    else if (dieConfig.id === 'sticky') distRoll = Math.floor(Math.random() * 5) + 1;
    else if (dieConfig.id === 'bumper') distRoll = Math.floor(Math.random() * 6) + 2;
    else if (dieConfig.id === 'chaos') distRoll = Math.floor(Math.random() * 20) + 1;

    await animateDie('die-dist', distRoll, 400, dieConfig.sides || 6);

    let baseDistance = distRoll;
    let obstacleNotes = [];

    // Chaos Die Special resolution
    if (dieConfig.isChaos) {
      if (distRoll >= 18) {
        obstacleNotes.push(`🎲 CHAOS ACE MIRACLE! (d20: ${distRoll}) Cosmic shortcut straight toward pin!`);
        baseDistance = Math.min(18, hexDistance(shotStart, currentHole.cup || { q: 0, r: -19 }));
      } else if (distRoll <= 3) {
        obstacleNotes.push(`🎲 CHAOS MISFIRE! (d20: ${distRoll}) Dud stroke!`);
        baseDistance = 1;
      } else {
        baseDistance = Math.min(9, Math.floor(distRoll / 2) + 1);
      }
    }

    document.getElementById('sub-dist').innerText = `${dieConfig.name}: ${distRoll} (${baseDistance} tiles)`;

    // 2. Scatter Roll
    let scatDist = 0;
    let scatDirIndex = 0;

    if (dieConfig.hasScatter) {
      const dirRoll = Math.floor(Math.random() * 6) + 1;
      const scatRoll = Math.floor(Math.random() * 6) + 1;

      await Promise.all([
        animateDie('die-dir', dirRoll, 300, 6),
        animateDie('die-scat', scatRoll, 300, 6)
      ]);

      scatDirIndex = dirRoll - 1;

      if (dieConfig.id === 'standard') scatDist = distRoll >= 4 ? 1 : 0;
      else if (dieConfig.id === 'power') scatDist = distRoll >= 7 ? 2 : 1;
      else if (dieConfig.id === 'chaos') scatDist = Math.floor(Math.random() * 2) + 1;

      updateShotControlDisplay(dirRoll, scatDist);
    } else {
      renderDieFace('die-dir', '-');
      renderDieFace('die-scat', '-');
      updateShotControlDisplay('-', 0, true);
    }

    // 3. Step-by-Step Trajectory & Obstacle Physics
    let currentStepPos = { q: shotStart.q, r: shotStart.r };
    let currentMoveDir = aimDir;
    let remainingSteps = baseDistance;
    const waypoints = [{ q: currentStepPos.q, r: currentStepPos.r, note: 'Tee / Start' }];

    while (remainingSteps > 0) {
      const nextHex = {
        q: currentStepPos.q + HEX_DIRS[currentMoveDir].q,
        r: currentStepPos.r + HEX_DIRS[currentMoveDir].r
      };
      const nextTerrain = getTerrainAt(nextHex.q, nextHex.r);

      // A. Bumper Rail Encounter
      if (nextTerrain === 'bumper') {
        if (dieConfig.elasticRicochet || dieConfig.superBounce) {
          let reflectDir = (currentMoveDir + 3) % 6;
          if (currentStepPos.q > 0) {
            reflectDir = (currentMoveDir + 4) % 6;
          } else if (currentStepPos.q < 0) {
            reflectDir = (currentMoveDir + 2) % 6;
          }
          currentMoveDir = reflectDir;
          obstacleNotes.push('🔴 Rubber Bumper Ricochet!');
          waypoints.push({ q: nextHex.q, r: nextHex.r, isRicochet: true, note: 'Ricochet' });
          remainingSteps -= 1;
          continue;
        } else {
          obstacleNotes.push('Bumper rail rebound: ball stopped safely');
          waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, isRicochet: true, note: 'Bumper stop' });
          remainingSteps = 0;
          break;
        }
      }

      // B. Rotating Windmill Gate Encounter
      if (nextTerrain === 'windmill') {
        if (!windmillOpen) {
          obstacleNotes.push('⛔ CLATTER! Ball blocked by spinning windmill blades!');
          waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, note: 'Windmill Blocked' });
          remainingSteps = 0;
          break;
        } else {
          obstacleNotes.push('⚙️ SWOOSH! Slipped clean through the open windmill gate!');
          currentStepPos = nextHex;
          waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, note: 'Windmill Passed' });
          remainingSteps -= 1;
          continue;
        }
      }

      // C. Speed Ramp Encounter
      if (nextTerrain === 'ramp') {
        obstacleNotes.push('🚀 Speed Ramp Boost! Catapulted +2 tiles forward!');
        currentStepPos = nextHex;
        waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, note: 'Speed Ramp' });
        remainingSteps += 1;
        continue;
      }

      // D. Warp Tube Encounter
      if (nextTerrain === 'tube_in') {
        obstacleNotes.push('🌀 Warp Tube Activated! Teleported to upper green runway!');
        waypoints.push({ q: nextHex.q, r: nextHex.r, isWarp: true, note: 'Warp In' });
        const outPos = currentHole.tubeOutPos || { q: -1, r: -14 };
        currentStepPos = { ...outPos };
        waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, isWarp: true, note: 'Warp Out' });

        const exitStep = { q: currentStepPos.q + HEX_DIRS[0].q, r: currentStepPos.r + HEX_DIRS[0].r };
        if (isLand(exitStep.q, exitStep.r)) {
          currentStepPos = exitStep;
          waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, note: 'Exit Momentum' });
        }
        remainingSteps = 0;
        break;
      }

      // E. Loop-de-Loop Funnel Encounter
      if (nextTerrain === 'funnel') {
        if (baseDistance >= 2) {
          obstacleNotes.push('↺ Loop-de-Loop! Spiral track curved ball onto putting green!');
          waypoints.push({ q: nextHex.q, r: nextHex.r, note: 'Funnel Entry' });
          currentStepPos = { q: 1, r: -18 };
          waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, note: 'Green Arrival' });
          remainingSteps = 0;
          break;
        } else {
          currentStepPos = nextHex;
          waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, note: 'Funnel Stop' });
          remainingSteps = 0;
          break;
        }
      }

      // Regular fairway/green advancement
      currentStepPos = nextHex;
      waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, note: 'Step' });
      remainingSteps -= 1;
    }

    // 4. Apply Scatter (if any and not in hole)
    let scatterPos = null;
    if (scatDist > 0 && getTerrainAt(currentStepPos.q, currentStepPos.r) !== 'hole') {
      const scatHex = {
        q: currentStepPos.q + HEX_DIRS[scatDirIndex].q * scatDist,
        r: currentStepPos.r + HEX_DIRS[scatDirIndex].r * scatDist
      };
      if (isLand(scatHex.q, scatHex.r) && getTerrainAt(scatHex.q, scatHex.r) !== 'bumper') {
        currentStepPos = scatHex;
        scatterPos = { ...scatHex };
        waypoints.push({ q: currentStepPos.q, r: currentStepPos.r, note: 'Scatter' });
      }
    }

    let landingHex = { ...currentStepPos };
    let landingTerrain = getTerrainAt(landingHex.q, landingHex.r);

    let hazardType = null;
    let hazardPos = null;
    let dropPos = null;
    let slopeFrom = null;
    let slopeTo = null;

    if (landingTerrain === 'water' || landingTerrain === 'trees') {
      strokeCount += 2;
      hazardType = landingTerrain;
      hazardPos = { ...landingHex };
      const nearestLand = findNearestLand(landingHex.q, landingHex.r);
      dropPos = { ...nearestLand };
      playerPos = { q: nearestLand.q, r: nearestLand.r };
      obstacleNotes.push('Water hazard! +1 penalty stroke');
    } else {
      playerPos = { q: landingHex.q, r: landingHex.r };
      strokeCount += 1;

      // 5. Slope Arrows check
      if (dieConfig.ignoresSlopes) {
        obstacleNotes.push('⚓ Sticky Lead Die: Stopped dead! Ignored slope break');
      } else {
        const arrow = currentHole.slopeArrows[`${playerPos.q},${playerPos.r}`];
        if (arrow !== undefined) {
          const slideQ = playerPos.q + HEX_DIRS[arrow].q;
          const slideR = playerPos.r + HEX_DIRS[arrow].r;
          slopeFrom = { q: playerPos.q, r: playerPos.r };
          if (isLand(slideQ, slideR) && getTerrainAt(slideQ, slideR) !== 'bumper') {
            slopeTo = { q: slideQ, r: slideR };
            playerPos.q = slideQ;
            playerPos.r = slideR;
            waypoints.push({ q: playerPos.q, r: playerPos.r, note: 'Slope Slide' });
            obstacleNotes.push('Contour slope break slide');
          }
        }
      }
    }

    // Toggle Windmill Gate state for the next stroke!
    windmillOpen = !windmillOpen;
    updateCrazyStatusBar();

    shotTrails.push({
      stroke: strokeCount,
      club: club,
      start: shotStart,
      aimed: landingHex,
      hasScatter: scatDist > 0,
      scatter: scatterPos,
      waypoints: waypoints,
      hazard: hazardType,
      hazardPos: hazardPos,
      dropPos: dropPos,
      slopeFrom: slopeFrom,
      slopeTo: slopeTo,
      final: { ...playerPos }
    });

    updateScoreboard();
    render();
    keepBallInView();

    const finalTerrain = getTerrainAt(playerPos.q, playerPos.r);
    const noteSuffix = obstacleNotes.length ? ' • ' + obstacleNotes.join(' • ') : '';

    if (finalTerrain === 'hole') {
      recordHoleFinish();
      const diff = strokeCount - currentHole.par;
      const diffName = strokeCount === 1 ? 'HOLE IN ONE! 🏆' : diff <= -2 ? 'Eagle!' : diff === -1 ? 'Birdie!' : diff === 0 ? 'Par!' : 'Finished!';
      document.getElementById('status-message').innerText = `ACE! Hole completed in ${strokeCount} strokes! (${diffName})${noteSuffix}`;
    } else {
      document.getElementById('status-message').innerText = `Stroke ${strokeCount}: Landed in ${TERRAIN[finalTerrain] ? TERRAIN[finalTerrain].label : 'Carpet'}${noteSuffix}`;
    }

    updateControlsState();
    return;
  }

  // ==========================================
  // TRADITIONAL GOLF MODE RESOLUTION
  // ==========================================
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
    const scatRoll = Math.floor(Math.random() * 6) + 1;

    await Promise.all([
      animateDie('die-dir', dirRoll, 350, 6),
      animateDie('die-scat', scatRoll, 350, 6)
    ]);

    scatDirIndex = dirRoll - 1;

    if (club === 'driver') scatDist = scatRoll <= 2 ? 1 : scatRoll <= 4 ? 2 : 3;
    else scatDist = scatRoll <= 3 ? 0 : 1;

    updateShotControlDisplay(dirRoll, scatDist);
  } else {
    renderDieFace('die-dir', '-');
    renderDieFace('die-scat', '-');
    updateShotControlDisplay('-', 0, true);
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
    keepBallInView();

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
    keepBallInView();

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

function updateDailyHoleCardUI() {
  const daily = COURSES.daily;
  if (!daily || !daily.holes || !daily.holes[0]) return;
  const hole = daily.holes[0];

  const titleEl = document.getElementById('daily-hole-title');
  const parTagEl = document.getElementById('daily-par-tag');
  const dateBadgeEl = document.getElementById('daily-date-badge');
  const descEl = document.getElementById('daily-hole-desc');
  const featEl = document.getElementById('daily-features-container');

  if (titleEl) titleEl.innerText = hole.name;
  if (parTagEl) parTagEl.innerText = `PAR ${hole.par} • 1 HOLE`;
  if (dateBadgeEl) dateBadgeEl.innerText = daily.dateStr || 'Today';
  if (descEl) descEl.innerText = daily.description;
  if (featEl) {
    featEl.innerHTML = daily.features.map(f => `<span class="feat-tag">${f}</span>`).join('');
  }
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

  const cardTotalLabel = document.getElementById('card-total-label');
  if (cardTotalLabel) {
    cardTotalLabel.innerText = currentHoles.length === 1 ? 'TOTAL (1 HOLE)' : `TOTAL (${currentHoles.length} HOLES)`;
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
document.getElementById('start-daily-btn').addEventListener('click', () => startCourse('daily'));
document.getElementById('card-daily').addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') startCourse('daily');
});

document.getElementById('reroll-daily-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const randomSeed = Math.floor(Math.random() * 900000 + 100000);
  refreshDailyHole(String(randomSeed));
  updateDailyHoleCardUI();
});

document.getElementById('start-parkland-btn').addEventListener('click', () => startCourse('parkland'));
document.getElementById('start-links-btn').addEventListener('click', () => startCourse('links'));

const startCrazyBtn = document.getElementById('start-crazy-btn');
if (startCrazyBtn) {
  startCrazyBtn.addEventListener('click', () => startCourse('crazy'));
}

const cardCrazy = document.getElementById('card-crazy');
if (cardCrazy) {
  cardCrazy.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') startCourse('crazy');
  });
}

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

// Aim pills buttons
document.querySelectorAll('.aim-pill').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const dir = parseInt(e.currentTarget.getAttribute('data-dir'), 10);
    syncAimUI(dir);
    render();
  });
});

// Club selection boxes click listener
const clubContainer = document.getElementById('club-pills-container');
if (clubContainer) {
  clubContainer.addEventListener('click', (e) => {
    const box = e.target.closest('.club-box');
    if (box && !box.disabled) {
      const clubId = box.getAttribute('data-club');
      selectClub(clubId);
    }
  });
}

document.getElementById('roll-btn').addEventListener('click', executeShot);
document.getElementById('gimme-btn').addEventListener('click', takeGimme);
document.getElementById('next-btn').addEventListener('click', () => loadHole(currentHoleIndex + 1));

// ==========================================
// CANVAS INTERACTIVE PAN & ZOOM CONTROLS
// ==========================================

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let panStartX = 0;
let panStartY = 0;

canvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  isDragging = true;
  canvas.classList.add('grabbing');
  try {
    canvas.setPointerCapture(e.pointerId);
  } catch (_) {}
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  panStartX = camera.panX;
  panStartY = camera.panY;
  dismissScrollHint();
});

canvas.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  camera.panX = panStartX + dx;
  camera.panY = panStartY + dy;
  clampCamera();
  render();
});

const endPointerDrag = (e) => {
  if (isDragging) {
    isDragging = false;
    canvas.classList.remove('grabbing');
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }
};

canvas.addEventListener('pointerup', endPointerDrag);
canvas.addEventListener('pointercancel', endPointerDrag);

// Mouse wheel zoom centered on cursor
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const factor = e.deltaY < 0 ? 1.15 : 0.87;
  zoomAtPoint(factor, mouseX, mouseY);
  dismissScrollHint();
}, { passive: false });

// 2-finger touch pinch-to-zoom
let pinchDistStart = null;
let pinchScaleStart = 1.0;
let pinchCenterStart = null;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    isDragging = false;
    canvas.classList.remove('grabbing');
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    pinchDistStart = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    pinchScaleStart = camera.scale;
    const rect = canvas.getBoundingClientRect();
    pinchCenterStart = {
      x: (t1.clientX + t2.clientX) / 2 - rect.left,
      y: (t1.clientY + t2.clientY) / 2 - rect.top
    };
    dismissScrollHint();
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && pinchDistStart && pinchCenterStart) {
    e.preventDefault();
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const rect = canvas.getBoundingClientRect();
    const currentCenter = {
      x: (t1.clientX + t2.clientX) / 2 - rect.left,
      y: (t1.clientY + t2.clientY) / 2 - rect.top
    };

    const factor = dist / pinchDistStart;
    let targetScale = pinchScaleStart * factor;
    targetScale = Math.max(camera.minScale, Math.min(camera.maxScale, targetScale));

    const oldScale = camera.scale;
    if (Math.abs(targetScale - oldScale) > 0.001) {
      camera.panX = currentCenter.x - (currentCenter.x - camera.panX) * (targetScale / oldScale);
      camera.panY = currentCenter.y - (currentCenter.y - camera.panY) * (targetScale / oldScale);
      camera.scale = targetScale;
      clampCamera();
      updateZoomUI();
      render();
    }
  }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    pinchDistStart = null;
    pinchCenterStart = null;
  }
});

// HUD Control buttons
const zoomInBtn = document.getElementById('zoom-in-btn');
if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    zoomBy(1.25);
    dismissScrollHint();
  });
}

const zoomOutBtn = document.getElementById('zoom-out-btn');
if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    zoomBy(0.8);
    dismissScrollHint();
  });
}

const centerBallBtn = document.getElementById('center-ball-btn');
if (centerBallBtn) {
  centerBallBtn.addEventListener('click', () => {
    centerOnBall();
    dismissScrollHint();
  });
}

const fitHoleBtn = document.getElementById('fit-hole-btn');
if (fitHoleBtn) {
  fitHoleBtn.addEventListener('click', () => {
    fitHole();
    dismissScrollHint();
  });
}

// Window resize & container resize observer
window.addEventListener('resize', () => {
  resizeCanvas();
  clampCamera();
  render();
});

const canvasWrapper = document.getElementById('canvas-wrapper');
if (canvasWrapper && window.ResizeObserver) {
  const ro = new ResizeObserver(() => {
    resizeCanvas();
    clampCamera();
    render();
  });
  ro.observe(canvasWrapper);
}

// Keyboard navigation (arrows pan, + / - zoom, F fit, B ball, M minimap)
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  const panStep = 35;
  if (e.key === '+' || e.key === '=') {
    zoomBy(1.2);
    dismissScrollHint();
  } else if (e.key === '-' || e.key === '_') {
    zoomBy(0.83);
    dismissScrollHint();
  } else if (e.key === 'f' || e.key === 'F') {
    fitHole();
    dismissScrollHint();
  } else if (e.key === 'b' || e.key === 'B' || e.key === 'c' || e.key === 'C') {
    centerOnBall();
    dismissScrollHint();
  } else if (e.key === 'm' || e.key === 'M') {
    toggleMinimap();
  } else if (e.key === 'ArrowLeft') {
    camera.panX += panStep;
    clampCamera();
    render();
    dismissScrollHint();
  } else if (e.key === 'ArrowRight') {
    camera.panX -= panStep;
    clampCamera();
    render();
    dismissScrollHint();
  } else if (e.key === 'ArrowUp') {
    camera.panY += panStep;
    clampCamera();
    render();
    dismissScrollHint();
  } else if (e.key === 'ArrowDown') {
    camera.panY -= panStep;
    clampCamera();
    render();
    dismissScrollHint();
  }
});

// Minimap UI Event Listeners
const minimapMinimiseBtn = document.getElementById('minimap-minimise-btn');
if (minimapMinimiseBtn) {
  minimapMinimiseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMinimap(true);
  });
}

const minimapRestoreBtn = document.getElementById('minimap-restore-btn');
if (minimapRestoreBtn) {
  minimapRestoreBtn.addEventListener('click', () => {
    toggleMinimap(false);
  });
}

const minimapCanvas = document.getElementById('minimap-canvas');
if (minimapCanvas) {
  minimapCanvas.addEventListener('click', (e) => {
    if (!minimapTransform.scale) return;
    const rect = minimapCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const wx = (clickX - minimapTransform.offsetX) / minimapTransform.scale;
    const wy = (clickY - minimapTransform.offsetY) / minimapTransform.scale;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    camera.panX = cssWidth / 2 - wx * camera.scale;
    camera.panY = cssHeight / 2 - wy * camera.scale;

    clampCamera();
    render();
    dismissScrollHint();
  });
}

// Initialize Hole of the Day UI card on landing screen
updateDailyHoleCardUI();

const canvas = document.getElementById('edit-canvas');
const ctx = canvas.getContext('2d');

const HEX_RADIUS = 9.8;
const ORIGIN_X = 180;
const ORIGIN_Y = 395;

const TERRAIN = {
  tee: '#cddc39',
  fairway: '#4caf50',
  rough: '#dcedc8',
  trees: '#81c784',
  sand: '#fbc02d',
  water: '#0288d1',
  green: '#2e7d32',
  hole: '#1a1a1a'
};

const ARROW_SYMBOLS = ['↑', '↗', '↘', '↓', '↙', '↖'];

let currentBrush = 'fairway';
let selectedSlopeDir = null;
let paintedLayout = {};
let paintedSlopes = {};

function selectBrush(e, type, slopeDir = null) {
  currentBrush = type;
  selectedSlopeDir = slopeDir;
  document.querySelectorAll('.palette button').forEach(b => b.classList.remove('active'));
  if (e && e.target) {
    e.target.classList.add('active');
  }
}

function hexToPixel(q, r) {
  const x = HEX_RADIUS * (3 / 2 * q);
  const y = HEX_RADIUS * Math.sqrt(3) * (r + q / 2);
  return { x: ORIGIN_X + x, y: ORIGIN_Y + y };
}

function pixelToHex(x, y) {
  const px = x - ORIGIN_X;
  const py = y - ORIGIN_Y;
  const q = (2 / 3 * px) / HEX_RADIUS;
  const r = (-1 / 3 * px + Math.sqrt(3) / 3 * py) / HEX_RADIUS;
  
  let rx = Math.round(q);
  let ry = Math.round(r);
  let rz = Math.round(-q - r);
  
  const x_diff = Math.abs(rx - q);
  const y_diff = Math.abs(ry - r);
  const z_diff = Math.abs(rz - (-q - r));
  
  if (x_diff > y_diff && x_diff > z_diff) {
    rx = -ry - rz;
  } else if (y_diff > z_diff) {
    ry = -rx - rz;
  }
  
  return { q: rx, r: ry };
}

function drawHex(x, y, type, slopeDir = null) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    const px = x + HEX_RADIUS * Math.cos(angle);
    const py = y + HEX_RADIUS * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  
  ctx.fillStyle = TERRAIN[type] || TERRAIN.rough;
  ctx.fill();
  ctx.strokeStyle = '#9ccc65';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  
  if (slopeDir !== null && slopeDir !== undefined) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ARROW_SYMBOLS[slopeDir], x, y);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let r = -24; r <= 3; r++) {
    for (let q = -12; q <= 12; q++) {
      const { x, y } = hexToPixel(q, r);
      if (x >= -15 && x <= canvas.width + 15 && y >= -15 && y <= canvas.height + 15) {
        const key = `${q},${r}`;
        const type = paintedLayout[key] || (q <= -11 || q >= 11 || r <= -23 || r >= 3 ? 'trees' : 'rough');
        const slope = paintedSlopes[key] !== undefined ? paintedSlopes[key] : null;
        drawHex(x, y, type, slope);
      }
    }
  }
}

function handlePaint(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const { q, r } = pixelToHex(x, y);
  const key = `${q},${r}`;
  
  if (currentBrush === 'slope') {
    paintedSlopes[key] = selectedSlopeDir;
  } else if (currentBrush === 'clearSlope') {
    delete paintedSlopes[key];
  } else if (currentBrush === 'rough') {
    delete paintedLayout[key];
    delete paintedSlopes[key];
  } else {
    paintedLayout[key] = currentBrush;
  }
  render();
}

let isMouseDown = false;
canvas.addEventListener('mousedown', (e) => { isMouseDown = true;
  handlePaint(e); });
canvas.addEventListener('mousemove', (e) => { if (isMouseDown) handlePaint(e); });
canvas.addEventListener('mouseup', () => { isMouseDown = false; });

function generateCode() {
  const id = document.getElementById('hole-id').value;
  const padId = id.toString().padStart(2, '0');
  const par = document.getElementById('hole-par').value;
  const name = document.getElementById('hole-name').value;
  
  let teePos = { q: 0, r: 0 };
  let holePos = { q: 0, r: -15 };
  
  for (const [key, val] of Object.entries(paintedLayout)) {
    if (val === 'tee') {
      const [q, r] = key.split(',').map(Number);
      teePos = { q, r };
    }
    if (val === 'hole') {
      const [q, r] = key.split(',').map(Number);
      holePos = { q, r };
    }
  }
  
  const code = `// Hole ${id}: Par ${par} (${name})
export const hole${padId} = {
  id: ${id},
  par: ${par},
  name: "${name}",
  tee: { q: ${teePos.q}, r: ${teePos.r} },
  hole: { q: ${holePos.q}, r: ${holePos.r} },
  slopeArrows: ${JSON.stringify(paintedSlopes, null, 2)},
  layout: ${JSON.stringify(paintedLayout, null, 2)}
};`;
  
  document.getElementById('output-code').value = code;
}

window.selectBrush = selectBrush;
window.generateCode = generateCode;

render();
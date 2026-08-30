// ==========================================
// PROCEDURAL HOLE OF THE DAY GENERATOR
// Seeded deterministic generator for daily / random challenge holes
// ==========================================

function createPrng(seedStr) {
  let s = 0;
  for (let i = 0; i < seedStr.length; i++) {
    s = (Math.imul(31, s) + seedStr.charCodeAt(i)) | 0;
  }
  if (s === 0) s = 123456789;
  return function() {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAME_PREFIXES = [
  "Eagle's", "Whispering", "Devil's", "Golden", "Pine Valley", "Falcon's",
  "Hidden", "Shadow", "Emerald", "Sunset", "Windy", "Coyote", "Highland",
  "Timber", "Breezy", "King's", "Stone", "Misty", "Copper", "Thunder",
  "Silver", "Bear", "Raven's", "Oak", "Heron's", "Cliffside", "Wildcat"
];

const NAME_SUFFIXES = [
  "Creek", "Ridge", "Bluff", "Ledge", "Hollow", "Dunes", "Point", "Basin",
  "Cove", "Spur", "Bend", "Glade", "Corner", "Meadow", "Pond", "Crest",
  "Pass", "Gorge", "Falls", "Sanctuary", "Oasis", "Knoll", "Haven"
];

const THEME_TYPES = [
  {
    name: 'Parkland Woods',
    features: ['Fairway Bunkers', 'Serene Pond', 'Pencil Pines'],
    hasWater: true,
    waterStyle: 'lake',
    hasDeepRough: false
  },
  {
    name: 'Dune Links',
    features: ['Pot Bunkers', 'Punishing Deep Rough', 'Contoured Slopes'],
    hasWater: false,
    waterStyle: 'none',
    hasDeepRough: true
  },
  {
    name: 'Emerald Island',
    features: ['Island Green', 'Water Hazard Moat', 'Precision Approach'],
    hasWater: true,
    waterStyle: 'island',
    hasDeepRough: true
  },
  {
    name: 'Highland Ridge',
    features: ['Dogleg Contour', 'Severe Slope Arrows', 'Green-side Traps'],
    hasWater: false,
    waterStyle: 'none',
    hasDeepRough: true
  },
  {
    name: 'Coastal Bay',
    features: ['Lateral Ocean Water', 'Coastal Dunes', 'Crown Green'],
    hasWater: true,
    waterStyle: 'lake',
    hasDeepRough: true
  }
];

export function getTodaySeedString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatSeedDateDisplay(seedStr) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(seedStr)) {
    const parts = seedStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return `Seed #${seedStr}`;
}

export function generateDailyHole(seed = getTodaySeedString()) {
  const rand = createPrng(String(seed));

  // 1. Determine Par & Target Distance
  const parRoll = rand();
  let par = 4;
  let targetDist = 16;
  if (parRoll < 0.28) {
    par = 3;
    targetDist = 10 + Math.floor(rand() * 4); // 10 to 13 hexes
  } else if (parRoll < 0.78) {
    par = 4;
    targetDist = 15 + Math.floor(rand() * 4); // 15 to 18 hexes
  } else {
    par = 5;
    targetDist = 20 + Math.floor(rand() * 4); // 20 to 23 hexes
  }

  // 2. Select Theme & Name
  const themeIndex = Math.floor(rand() * THEME_TYPES.length);
  const theme = THEME_TYPES[themeIndex];
  const pfx = NAME_PREFIXES[Math.floor(rand() * NAME_PREFIXES.length)];
  const sfx = NAME_SUFFIXES[Math.floor(rand() * NAME_SUFFIXES.length)];
  const holeName = `${pfx} ${sfx}`;

  // 3. Shape & Dogleg offset
  const shapeType = Math.floor(rand() * 4); // 0: Straight, 1: Dogleg Left, 2: Dogleg Right, 3: S-Curve
  let pinQ = 0;
  let midQ = 0;
  if (shapeType === 1) { // Left
    pinQ = -2 - Math.floor(rand() * 2);
    midQ = -1 - Math.floor(rand() * 2);
  } else if (shapeType === 2) { // Right
    pinQ = 2 + Math.floor(rand() * 2);
    midQ = 1 + Math.floor(rand() * 2);
  } else if (shapeType === 3) { // S-curve
    midQ = (rand() > 0.5 ? 2 : -2);
    pinQ = -midQ;
  } else { // Straight with slight variance
    pinQ = Math.floor((rand() - 0.5) * 3);
    midQ = Math.floor((rand() - 0.5) * 2);
  }

  const pinR = -targetDist;
  const layout = {};
  const slopeArrows = {};

  // 4. Tee Placement
  layout["0,0"] = "tee";
  layout["0,-1"] = "tee";
  layout["-1,0"] = "tee";

  // 5. Fairway Path generation
  const midR = Math.round(pinR * 0.55);
  for (let r = -1; r >= pinR + 1; r--) {
    let qCenter = 0;
    if (r >= midR) {
      const t = (-r) / (-midR);
      qCenter = Math.round(t * midQ);
    } else {
      const t = (midR - r) / (midR - pinR);
      qCenter = Math.round(midQ + t * (pinQ - midQ));
    }

    // Fairway width
    const halfWidth = (r <= pinR + 2 || r >= -2) ? 1 : (rand() > 0.35 ? 1 : 2);
    for (let dq = -halfWidth; dq <= halfWidth; dq++) {
      const fq = qCenter + dq;
      if (fq >= -5 && fq <= 5) {
        layout[`${fq},${r}`] = "fairway";
      }
    }

    // Optional deep rough fringes
    if (theme.hasDeepRough) {
      if (rand() > 0.5) {
        const roughQ1 = qCenter - halfWidth - 1;
        const roughQ2 = qCenter + halfWidth + 1;
        if (roughQ1 >= -6) layout[`${roughQ1},${r}`] = "deep_rough";
        if (roughQ2 <= 6) layout[`${roughQ2},${r}`] = "deep_rough";
      }
    }
  }

  // 6. Green Complex
  for (let dq = -2; dq <= 2; dq++) {
    for (let dr = -2; dr <= 2; dr++) {
      const gq = pinQ + dq;
      const gr = pinR + dr;
      const dist = (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;
      if (dist <= 1) {
        layout[`${gq},${gr}`] = "green";
      } else if (dist === 2 && rand() > 0.4) {
        layout[`${gq},${gr}`] = "green";
      }
    }
  }
  // Pin / Hole
  layout[`${pinQ},${pinR}`] = "hole";

  // 7. Green-side Bunkers
  const bunkerSides = [
    { q: pinQ - 2, r: pinR },
    { q: pinQ + 2, r: pinR },
    { q: pinQ, r: pinR + 2 },
    { q: pinQ - 1, r: pinR - 2 },
    { q: pinQ + 1, r: pinR - 2 }
  ];
  const numGreenBunkers = 1 + Math.floor(rand() * 2);
  for (let b = 0; b < numGreenBunkers; b++) {
    const spot = bunkerSides[b % bunkerSides.length];
    if (spot.q >= -6 && spot.q <= 6 && spot.r >= -23) {
      if (layout[`${spot.q},${spot.r}`] !== 'hole') {
        layout[`${spot.q},${spot.r}`] = "sand";
      }
    }
  }

  // 8. Fairway Bunkers
  if (par >= 4) {
    const driveZoneR = -7 - Math.floor(rand() * 3);
    const side = rand() > 0.5 ? 2 : -2;
    layout[`${midQ + side},${driveZoneR}`] = "sand";
    if (rand() > 0.5) layout[`${midQ + side},${driveZoneR - 1}`] = "sand";
  }

  // 9. Water Hazards
  if (theme.hasWater) {
    if (theme.waterStyle === 'island') {
      // Moat around green except for entrance
      for (let dq = -3; dq <= 3; dq++) {
        for (let dr = -3; dr <= 3; dr++) {
          const wq = pinQ + dq;
          const wr = pinR + dr;
          const dist = (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;
          if (dist === 2 || dist === 3) {
            // Keep an entrance at the front
            if (!(dq === 0 && dr >= 1) && !layout[`${wq},${wr}`]) {
              if (wq >= -6 && wq <= 6 && wr >= -23) {
                layout[`${wq},${wr}`] = "water";
              }
            }
          }
        }
      }
    } else {
      // Lake on one side of fairway
      const lakeSide = rand() > 0.5 ? 1 : -1;
      const lakeCenterR = midR;
      const lakeCenterQ = midQ + (lakeSide * 3);
      for (let lq = -2; lq <= 2; lq++) {
        for (let lr = -2; lr <= 2; lr++) {
          const wq = lakeCenterQ + lq;
          const wr = lakeCenterR + lr;
          if (wq >= -6 && wq <= 6 && wr >= -23 && !layout[`${wq},${wr}`]) {
            if ((lq * lq + lr * lr) <= 3) {
              layout[`${wq},${wr}`] = "water";
            }
          }
        }
      }
    }
  }

  // 10. Slope Contours
  if (rand() > 0.25) {
    // 1-3 slope arrows near the green or dogleg
    const slopeSpots = [
      { q: pinQ + 1, r: pinR - 1, dir: 1 }, // NE
      { q: pinQ - 1, r: pinR, dir: 4 },     // SW
      { q: pinQ, r: pinR - 2, dir: 0 },     // N
      { q: pinQ, r: pinR + 1, dir: 3 }      // S
    ];
    const numSlopes = 1 + Math.floor(rand() * 2);
    for (let s = 0; s < numSlopes; s++) {
      const sp = slopeSpots[s];
      if (layout[`${sp.q},${sp.r}`] === 'green' || layout[`${sp.q},${sp.r}`] === 'fairway') {
        slopeArrows[`${sp.q},${sp.r}`] = sp.dir;
      }
    }
  }

  const generatedHole = {
    id: 1,
    par: par,
    name: holeName,
    tee: { q: 0, r: 0 },
    hole: { q: pinQ, r: pinR },
    slopeArrows: slopeArrows,
    layout: layout
  };

  const dateStr = formatSeedDateDisplay(seed);

  return {
    id: 'daily',
    name: `Hole of the Day: ${holeName}`,
    difficulty: `${theme.name} • Par ${par}`,
    badge: 'HOLE OF THE DAY',
    par: par,
    holesCount: 1,
    description: `Today's featured procedural challenge (${dateStr}): A Par ${par} (${targetDist} hexes) set on ${theme.name}.`,
    features: [`Par ${par} (${targetDist} Hexes)`, theme.name, ...theme.features.slice(0, 2)],
    dateStr: dateStr,
    seed: seed,
    holes: [generatedHole]
  };
}

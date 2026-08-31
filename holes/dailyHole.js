// ==========================================
// PROCEDURAL HOLE OF THE DAY GENERATOR
// Uses compact parseCoords format & rich strategic archetypes
// ==========================================

export function parseCoords(spec) {
  const layout = {};
  for (const [type, coords] of Object.entries(spec)) {
    if (typeof coords === 'string') {
      coords.trim().split(/\s+/).forEach(c => { if (c) layout[c] = type; });
    }
  }
  return layout;
}

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
  "Silver", "Bear", "Raven's", "Oak", "Heron's", "Cliffside", "Wildcat",
  "Ballybunion", "Cypress", "Sawgrass", "St. Andrews", "Carnoustie", "Torrey"
];

const NAME_SUFFIXES = [
  "Creek", "Ridge", "Bluff", "Ledge", "Hollow", "Dunes", "Point", "Basin",
  "Cove", "Spur", "Bend", "Glade", "Corner", "Meadow", "Pond", "Crest",
  "Pass", "Gorge", "Falls", "Sanctuary", "Oasis", "Knoll", "Haven", "Alley"
];

const ARCHETYPES = [
  {
    id: 'split_fairway',
    name: 'Risk-Reward Split Fairway',
    parWeights: [0.0, 0.65, 0.35], // Par 4 or 5
    tag: 'Dual Fairway Route',
    desc: 'Features an aggressive shortcut over hazards vs a safe winding fairway.'
  },
  {
    id: 'island_green',
    name: 'Island Peninsula',
    parWeights: [0.55, 0.45, 0.0], // Par 3 or 4
    tag: 'Moat Water Hazard',
    desc: 'Demands pinpoint target precision to a protected green complex.'
  },
  {
    id: 'cross_creek',
    name: 'Barranca Cross-Creek',
    parWeights: [0.0, 0.70, 0.30], // Par 4 or 5
    tag: 'Fairway Cross-Hazard',
    desc: 'Forces a strategic choice: lay up short of the creek or bomb a driver across.'
  },
  {
    id: 'cape_shore',
    name: 'Cape Shoreline',
    parWeights: [0.15, 0.60, 0.25],
    tag: 'Coastal Hazard Sweep',
    desc: 'A sweeping dogleg wrapping around a perilous water shoreline and beach sand.'
  },
  {
    id: 'dune_corridor',
    name: 'Pot Bunker Minefield',
    parWeights: [0.35, 0.45, 0.20],
    tag: 'Deep Rough & Pot Traps',
    desc: 'Narrow fairway corridor flanked by thick dunes, punishing pot bunkers, and steep slopes.'
  },
  {
    id: 'woodland_dogleg',
    name: 'Pencil Pine Dogleg',
    parWeights: [0.0, 0.75, 0.25],
    tag: 'Tree Chokepoints',
    desc: 'Dense tree stands protect the corner, rewarding shaping or disciplined placement.'
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

// Distance helper
function hexDist(q1, r1, q2, r2) {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

export function generateDailyHole(seed = getTodaySeedString()) {
  const rand = createPrng(String(seed));

  // 1. Pick Archetype
  const archIndex = Math.floor(rand() * ARCHETYPES.length);
  const arch = ARCHETYPES[archIndex];

  // 2. Determine Par & Target Distance
  const parRoll = rand();
  let par = 4;
  if (parRoll < arch.parWeights[0]) {
    par = 3;
  } else if (parRoll < arch.parWeights[0] + arch.parWeights[1]) {
    par = 4;
  } else {
    par = 5;
  }

  let targetDist = 16;
  if (par === 3) targetDist = 10 + Math.floor(rand() * 4); // 10-13
  else if (par === 4) targetDist = 15 + Math.floor(rand() * 4); // 15-18
  else targetDist = 20 + Math.floor(rand() * 4); // 20-23

  // 3. Name Generation
  const pfx = NAME_PREFIXES[Math.floor(rand() * NAME_PREFIXES.length)];
  const sfx = NAME_SUFFIXES[Math.floor(rand() * NAME_SUFFIXES.length)];
  const holeName = `${pfx} ${sfx}`;

  // Grid bounds: q in [-6, 6], r in [-23, 1]
  const pinR = -targetDist;
  let pinQ = 0;
  let midQ = 0;
  const doglegDir = rand() > 0.5 ? 1 : -1; // 1: Right, -1: Left

  if (par === 3) {
    pinQ = Math.floor((rand() - 0.5) * 4);
    midQ = Math.round(pinQ * 0.5);
  } else {
    pinQ = doglegDir * (2 + Math.floor(rand() * 2));
    midQ = doglegDir * (1 + Math.floor(rand() * 3));
  }

  // Working sets for coordinate groups
  const coordsByType = {
    tee: new Set(),
    hole: new Set(),
    green: new Set(),
    fairway: new Set(),
    deep_rough: new Set(),
    sand: new Set(),
    water: new Set(),
    trees: new Set()
  };
  const slopeArrows = {};

  function setTile(type, q, r) {
    if (q < -6 || q > 6 || r < -23 || r > 2) return;
    const k = `${q},${r}`;
    // Remove from other sets if overwriting
    for (const t of Object.keys(coordsByType)) {
      coordsByType[t].delete(k);
    }
    coordsByType[type].add(k);
  }

  function getTile(q, r) {
    const k = `${q},${r}`;
    for (const [t, set] of Object.entries(coordsByType)) {
      if (set.has(k)) return t;
    }
    return null;
  }

  // --- TEE BOX ---
  setTile('tee', 0, 0);
  setTile('tee', 0, -1);
  setTile('tee', -1, 0);

  // --- GREEN COMPLEX ---
  // Varied green shapes (oval, round, or elongated)
  for (let dq = -2; dq <= 2; dq++) {
    for (let dr = -2; dr <= 2; dr++) {
      const gq = pinQ + dq;
      const gr = pinR + dr;
      const d = hexDist(pinQ, pinR, gq, gr);
      if (d === 0) continue; // hole will be placed here
      if (d === 1) {
        setTile('green', gq, gr);
      } else if (d === 2 && rand() > 0.35) {
        setTile('green', gq, gr);
      }
    }
  }
  setTile('hole', pinQ, pinR);

  // Green apron (fairway fringe in front of green)
  for (let dq = -1; dq <= 1; dq++) {
    const aq = pinQ + dq;
    const ar = pinR + 2;
    if (!getTile(aq, ar)) setTile('fairway', aq, ar);
  }

  // --- ARCHETYPE SPECIFIC TERRAIN ---
  const midR = Math.round(pinR * 0.55);

  if (arch.id === 'split_fairway' && par >= 4) {
    // Left Fairway (Aggressive short line with water/bunkers)
    // Right Fairway (Safe route)
    for (let r = -2; r >= pinR + 2; r--) {
      const t = (r) / (pinR);
      const leftQ = Math.round(-2.5 + t * (pinQ - (-2.5)));
      const rightQ = Math.round(2.5 + t * (pinQ - 2.5));

      setTile('fairway', leftQ, r);
      if (leftQ - 1 >= -5) setTile('fairway', leftQ - 1, r);

      setTile('fairway', rightQ, r);
      if (rightQ + 1 <= 5) setTile('fairway', rightQ + 1, r);

      // Central divider hazard between fairways
      if (r >= midR - 2 && r <= midR + 3) {
        setTile(rand() > 0.4 ? 'water' : 'sand', 0, r);
        if (rand() > 0.5) setTile('trees', 0, r);
      }
    }
    // Cross carry sand trap guarding the aggressive left route
    setTile('sand', -2, midR + 2);
    setTile('sand', -3, midR + 2);

  } else if (arch.id === 'island_green') {
    // Fairway up to the water edge
    const waterStartR = pinR + 3;
    for (let r = -2; r > waterStartR; r--) {
      const t = (r) / (waterStartR);
      const qC = Math.round(t * midQ);
      setTile('fairway', qC, r);
      if (qC - 1 >= -4) setTile('fairway', qC - 1, r);
      if (qC + 1 <= 4) setTile('fairway', qC + 1, r);
    }

    // Moat water hazard around green
    for (let dq = -4; dq <= 4; dq++) {
      for (let dr = -3; dr <= 3; dr++) {
        const wq = pinQ + dq;
        const wr = pinR + dr;
        const d = hexDist(pinQ, pinR, wq, wr);
        if (d >= 2 && d <= 3 && !getTile(wq, wr)) {
          setTile('water', wq, wr);
        }
      }
    }

    // Bailout sand/apron on one side
    const bailoutQ = pinQ + (doglegDir * 3);
    setTile('sand', bailoutQ, pinR);
    setTile('sand', bailoutQ, pinR + 1);

  } else if (arch.id === 'cross_creek' && par >= 4) {
    // Fairway with a lateral creek across at drive distance
    const creekR = Math.round(pinR * 0.45); // e.g. -7 or -8
    for (let r = -2; r >= pinR + 2; r--) {
      const t = (r) / (pinR);
      const qC = Math.round(t * midQ);

      if (r === creekR || r === creekR - 1) {
        // Creek row
        for (let cq = -5; cq <= 5; cq++) {
          if (cq === qC && r === creekR && rand() > 0.6) {
            // Narrow bridge or fairway stepping stone
            setTile('fairway', cq, r);
          } else {
            setTile('water', cq, r);
          }
        }
      } else {
        setTile('fairway', qC, r);
        if (qC - 1 >= -4) setTile('fairway', qC - 1, r);
        if (qC + 1 <= 4) setTile('fairway', qC + 1, r);
      }
    }
    // Trees guarding creek banks
    setTile('trees', -4, creekR + 1);
    setTile('trees', 4, creekR + 1);

  } else if (arch.id === 'cape_shore') {
    // Sweeping shoreline along one side
    const waterSide = doglegDir;
    for (let r = -2; r >= pinR + 2; r--) {
      const t = (r) / (pinR);
      const qC = Math.round(t * midQ);

      setTile('fairway', qC, r);
      setTile('fairway', qC - waterSide, r);

      // Sand beach buffer
      const sandQ = qC + waterSide;
      setTile('sand', sandQ, r);

      // Water body beyond sand beach
      const w1 = sandQ + waterSide;
      const w2 = w1 + waterSide;
      setTile('water', w1, r);
      setTile('water', w2, r);
    }

  } else if (arch.id === 'dune_corridor') {
    // Narrow links fairway with deep rough and pot bunkers
    for (let r = -2; r >= pinR + 2; r--) {
      const t = (r) / (pinR);
      const qC = Math.round(t * midQ);

      setTile('fairway', qC, r);
      if (rand() > 0.35) setTile('fairway', qC + (rand() > 0.5 ? 1 : -1), r);

      // Flanking deep rough
      setTile('deep_rough', qC - 2, r);
      setTile('deep_rough', qC + 2, r);
      if (rand() > 0.5) setTile('deep_rough', qC - 3, r);
      if (rand() > 0.5) setTile('deep_rough', qC + 3, r);

      // Pot bunkers at key roll-out distances
      if (r === Math.round(pinR * 0.4) || r === Math.round(pinR * 0.75)) {
        setTile('sand', qC + (rand() > 0.5 ? 1 : -1), r);
      }
    }

  } else {
    // Woodland dogleg
    for (let r = -2; r >= pinR + 2; r--) {
      const t = (r) / (pinR);
      const qC = Math.round(t * midQ);

      setTile('fairway', qC, r);
      if (qC - 1 >= -4) setTile('fairway', qC - 1, r);
      if (qC + 1 <= 4) setTile('fairway', qC + 1, r);
    }

    // Dense tree stands on the inner dogleg elbow
    const innerSide = -doglegDir;
    for (let tr = midR - 2; tr <= midR + 2; tr++) {
      setTile('trees', midQ + (innerSide * 2), tr);
      setTile('trees', midQ + (innerSide * 3), tr);
    }
  }

  // --- GREEN-SIDE BUNKER COMPLEX ---
  const bunkerOffsetCandidates = [
    { q: pinQ - 2, r: pinR },
    { q: pinQ + 2, r: pinR },
    { q: pinQ, r: pinR + 2 },
    { q: pinQ - 1, r: pinR - 2 },
    { q: pinQ + 1, r: pinR - 2 }
  ];
  const numGreenTraps = 1 + Math.floor(rand() * 2);
  for (let b = 0; b < numGreenTraps; b++) {
    const spot = bunkerOffsetCandidates[(b + Math.floor(rand() * 3)) % bunkerOffsetCandidates.length];
    if (spot.q >= -5 && spot.q <= 5 && spot.r >= -23) {
      if (getTile(spot.q, spot.r) !== 'hole' && getTile(spot.q, spot.r) !== 'water') {
        setTile('sand', spot.q, spot.r);
      }
    }
  }

  // --- TOP/BOTTOM NATURAL TREE BORDERS ---
  for (let bq = -6; bq <= 6; bq++) {
    if (rand() > 0.6 && !getTile(bq, pinR - 2)) setTile('trees', bq, pinR - 2);
    if (rand() > 0.7 && !getTile(bq, pinR - 3)) setTile('trees', bq, pinR - 3);
  }

  // --- DYNAMIC SLOPE CONTOURS ---
  // Slopes on greens & false fronts
  const slopeDirs = [
    { dir: 3, dq: 0, dr: 1 },  // S (down towards front)
    { dir: 4, dq: -1, dr: 1 }, // SW
    { dir: 2, dq: 1, dr: 0 },  // SE
    { dir: 0, dq: 0, dr: -1 }, // N
    { dir: 1, dq: 1, dr: -1 }, // NE
    { dir: 5, dq: -1, dr: 0 }  // NW
  ];

  const slopesToCreate = 2 + Math.floor(rand() * 2);
  for (let s = 0; s < slopesToCreate; s++) {
    const candidate = slopeDirs[Math.floor(rand() * slopeDirs.length)];
    const sq = pinQ + candidate.dq;
    const sr = pinR + candidate.dr;
    const tile = getTile(sq, sr);
    if (tile === 'green' || tile === 'fairway') {
      slopeArrows[`${sq},${sr}`] = candidate.dir;
    }
  }

  // --- COMPILE COMPACT PARSECOORDS SPEC ---
  const terrainOrder = ['tee', 'hole', 'green', 'fairway', 'deep_rough', 'sand', 'water', 'trees'];
  const specObj = {};

  for (const t of terrainOrder) {
    const coordList = Array.from(coordsByType[t]);
    if (coordList.length > 0) {
      coordList.sort((a, b) => {
        const [qa, ra] = a.split(',').map(Number);
        const [qb, rb] = b.split(',').map(Number);
        return ra !== rb ? ra - rb : qa - qb;
      });
      specObj[t] = coordList.join(' ');
    }
  }

  // Evaluate final layout object using the new format parser
  const finalLayout = parseCoords(specObj);

  const generatedHole = {
    id: 1,
    par: par,
    name: holeName,
    tee: { q: 0, r: 0 },
    hole: { q: pinQ, r: pinR },
    slopeArrows: slopeArrows,
    layout: finalLayout
  };

  const dateStr = formatSeedDateDisplay(seed);

  return {
    id: 'daily',
    name: `Hole of the Day: ${holeName}`,
    difficulty: `${arch.name} • Par ${par}`,
    badge: 'HOLE OF THE DAY',
    par: par,
    holesCount: 1,
    description: `Today's featured challenge (${dateStr}): A Par ${par} (${targetDist} hexes). ${arch.desc}`,
    features: [
      `Par ${par} (${targetDist} Hexes)`,
      arch.tag,
      Object.keys(slopeArrows).length > 0 ? 'Contoured Green' : 'Bunker Complex',
      coordsByType.water.size > 0 ? 'Water Hazards' : 'Dune Fringes'
    ],
    dateStr: dateStr,
    seed: seed,
    archetype: arch.id,
    holes: [generatedHole]
  };
}

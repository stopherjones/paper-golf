// ==========================================
// PROCEDURAL HOLE OF THE DAY GENERATOR
// Inspired by championship golf architecture (e.g. Parkland Hole 2)
// Utilizes full spatial canvas with broad fairways, dramatic doglegs,
// diagonal cross-hazards, organic green complexes & strategic bunkering.
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
    id: 'creek_dogleg',
    name: 'Creek Crossing Dogleg',
    parWeights: [0.0, 0.55, 0.45], // Par 4 or 5
    tag: 'Diagonal Cross-Creek & Dogleg',
    desc: 'Inspired by Parkland Hole 2: a forced drive over a diagonal creek hazard into a broad, sweeping dogleg fairway.'
  },
  {
    id: 'sweeping_cape',
    name: 'Grand Cape Shoreline',
    parWeights: [0.0, 0.65, 0.35],
    tag: 'Lake Shoreline Crescent',
    desc: 'A magnificent sweeping arc using the full canvas, wrapping around a wide lake with beach sand and a peninsula green.'
  },
  {
    id: 's_curve_double',
    name: 'Serpentine Double Dogleg',
    parWeights: [0.0, 0.20, 0.80], // Mostly Par 5
    tag: 'Full-Span S-Curve',
    desc: 'A true championship Par 5 snaking across the entire course with dual strategic landing zones and elbow bunker complexes.'
  },
  {
    id: 'split_fairway',
    name: 'Risk-Reward Split Canyon',
    parWeights: [0.0, 0.65, 0.35],
    tag: 'Expansive Dual Fairways',
    desc: 'Spans the full lateral width: an aggressive short-cut route vs. a generous, winding safe boulevard around a central hazard island.'
  },
  {
    id: 'dune_links_diagonal',
    name: 'Dunecrest Diagonal Links',
    parWeights: [0.25, 0.55, 0.20],
    tag: 'Wide Links Fairway & Pot Bunkers',
    desc: 'A broad diagonal fairway crossing the entire landscape, flanked by undulating deep rough dunes, pot bunkers, and crown run-offs.'
  },
  {
    id: 'island_peninsula',
    name: 'Emerald Island Sanctuary',
    parWeights: [0.45, 0.55, 0.0],
    tag: 'Expansive Water Moat & Bailout',
    desc: 'An expansive water basin framing an elevated island green, requiring pinpoint approach precision or tactical bailout.'
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
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return `Seed #${seedStr}`;
}

// Hex Distance (axial coordinates)
function hexDist(q1, r1, q2, r2) {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

export function generateDailyHole(seed = getTodaySeedString()) {
  const rand = createPrng(String(seed));

  // 1. Pick Archetype
  const archIndex = Math.floor(rand() * ARCHETYPES.length);
  const arch = ARCHETYPES[archIndex];

  // 2. Determine Par
  const parRoll = rand();
  let par = 4;
  if (parRoll < arch.parWeights[0]) par = 3;
  else if (parRoll < arch.parWeights[0] + arch.parWeights[1]) par = 4;
  else par = 5;

  // 3. Name Generation
  const pfx = NAME_PREFIXES[Math.floor(rand() * NAME_PREFIXES.length)];
  const sfx = NAME_SUFFIXES[Math.floor(rand() * NAME_SUFFIXES.length)];
  const holeName = `${pfx} ${sfx}`;

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

  // Safe boundary check: grid spans q in [-10, 10], r in [-23, 2]
  function setTile(type, q, r) {
    if (q < -10 || q > 10 || r < -23 || r > 2) return;
    const k = `${q},${r}`;
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

  // Stamp wide fairway path with variable radius across points
  function stampFairwayPath(pts, radii) {
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const dist = hexDist(p1.q, p1.r, p2.q, p2.r);
      const steps = Math.max(3, Math.round(dist * 3));
      const r1 = radii[i];
      const r2 = radii[i + 1];
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const curQ = p1.q + (p2.q - p1.q) * t;
        const curR = p1.r + (p2.r - p1.r) * t;
        const curRadius = r1 + (r2 - r1) * t;
        const intQ = Math.round(curQ);
        const intR = Math.round(curR);
        const searchDist = Math.ceil(curRadius) + 1;
        for (let dq = -searchDist; dq <= searchDist; dq++) {
          for (let dr = -searchDist; dr <= searchDist; dr++) {
            const q = intQ + dq;
            const r = intR + dr;
            if (hexDist(curQ, curR, q, r) <= curRadius) {
              setTile('fairway', q, r);
            }
          }
        }
      }
    }
  }

  // Stamp organic blob (for ponds, bunkers, greens, deep rough)
  function stampBlob(type, centerQ, centerR, radius, pChance = 0.85) {
    const searchDist = Math.ceil(radius) + 1;
    for (let dq = -searchDist; dq <= searchDist; dq++) {
      for (let dr = -searchDist; dr <= searchDist; dr++) {
        const q = centerQ + dq;
        const r = centerR + dr;
        const d = hexDist(centerQ, centerR, q, r);
        if (d <= radius) {
          if (d <= radius - 0.7 || rand() < pChance) {
            setTile(type, q, r);
          }
        }
      }
    }
  }

  // Stamp a 4-tile tee box
  function stampTeePad(tq, tr) {
    setTile('tee', tq, tr);
    const neighbors = [
      { q: tq, r: tr - 1 },
      { q: tq - 1, r: tr },
      { q: tq, r: tr + 1 },
      { q: tq + 1, r: tr - 1 },
      { q: tq - 1, r: tr + 1 }
    ];
    neighbors.slice(0, 3).forEach(n => setTile('tee', n.q, n.r));
  }

  // Stamp putting green complex (12-18 tiles) with apron and realistic slopes
  function stampGreenComplex(pinQ, pinR, approachVector) {
    for (let dq = -3; dq <= 3; dq++) {
      for (let dr = -3; dr <= 3; dr++) {
        const gq = pinQ + dq;
        const gr = pinR + dr;
        const d = hexDist(pinQ, pinR, gq, gr);
        if (d === 0) continue;
        if (d <= 1.5) {
          setTile('green', gq, gr);
        } else if (d <= 2.3 && rand() > 0.18) {
          setTile('green', gq, gr);
        }
      }
    }
    setTile('hole', pinQ, pinR);

    // Green apron / fairway fringe facing approach
    if (approachVector) {
      for (let step = 1; step <= 2; step++) {
        const aq = Math.round(pinQ + approachVector.q * step);
        const ar = Math.round(pinR + approachVector.r * step);
        for (let dq = -1; dq <= 1; dq++) {
          if (getTile(aq + dq, ar) !== 'green' && getTile(aq + dq, ar) !== 'hole') {
            setTile('fairway', aq + dq, ar);
          }
        }
      }
    }

    // Directional slope arrows
    const slopeDirs = [
      { dir: 3, dq: 0, dr: 1 },  // S (down towards front)
      { dir: 4, dq: -1, dr: 1 }, // SW
      { dir: 2, dq: 1, dr: 0 },  // SE
      { dir: 0, dq: 0, dr: -1 }, // N
      { dir: 1, dq: 1, dr: -1 }, // NE
      { dir: 5, dq: -1, dr: 0 }  // NW
    ];
    const numSlopes = 2 + Math.floor(rand() * 3);
    for (let s = 0; s < numSlopes; s++) {
      const sd = slopeDirs[Math.floor(rand() * slopeDirs.length)];
      const sq = pinQ + sd.dq;
      const sr = pinR + sd.dr;
      if (getTile(sq, sr) === 'green') {
        slopeArrows[`${sq},${sr}`] = sd.dir;
      }
    }
  }

  let teePos = { q: 0, r: 0 };
  let pinPos = { q: 0, r: -16 };
  const doglegDir = rand() > 0.5 ? 1 : -1; // 1: Right-to-Left, -1: Left-to-Right

  // =========================================================
  // ARCHETYPE IMPLEMENTATIONS (Spacious, Wide, Dynamic Space)
  // =========================================================

  if (arch.id === 'creek_dogleg') {
    // Modeled after Parkland Hole 2: Diagonal river + wide elbow dogleg
    if (doglegDir === 1) {
      // Tee at bottom-right, green at top-left
      teePos = { q: 6 + Math.floor(rand() * 2), r: -3 - Math.floor(rand() * 2) };
      pinPos = { q: -5 - Math.floor(rand() * 2), r: -18 - Math.floor(rand() * 2) };
      const lz1 = { q: 5 + Math.floor(rand() * 2), r: -11 - Math.floor(rand() * 2) };
      const elbow = { q: 1 + Math.floor(rand() * 2), r: -16 - Math.floor(rand() * 2) };

      // 1. Broad fairway corridor (4 to 6 tiles wide, matching Parkland 2)
      stampFairwayPath([teePos, lz1, elbow, pinPos], [1.6, 2.5, 2.8, 2.1]);

      // 2. Diagonal Creek across fairway carry
      for (let step = -4; step <= 10; step++) {
        const wq = 4 + step;
        const wr = -6 - Math.round(step * 0.55);
        setTile('water', wq, wr);
        setTile('water', wq - 1, wr + 1);
        if (rand() > 0.45) setTile('water', wq, wr + 1);
      }

      stampTeePad(teePos.q, teePos.r);
      stampGreenComplex(pinPos.q, pinPos.r, { q: 1, r: 1 });

      // Strategic Bunkers
      stampBlob('sand', 0, -11, 1.4); // Inside corner elbow trap
      stampBlob('sand', 8, -12, 1.2); // Outside drive runout
      stampBlob('sand', pinPos.q - 2, pinPos.r + 2, 1.3); // Green-side front
      stampBlob('sand', pinPos.q + 3, pinPos.r, 1.3);     // Green-side flank

      // Inside elbow tree stands (framing the corner and blocking straight shortcuts)
      for (let tq = -10; tq <= -1; tq++) {
        for (let tr = -12; tr <= 2; tr++) {
          if (hexDist(teePos.q, teePos.r, tq, tr) > 4 && !getTile(tq, tr)) {
            if (tq <= -3 || (tr >= -9 && tr <= -2)) {
              setTile('trees', tq, tr);
            }
          }
        }
      }

    } else {
      // Mirror: Tee at bottom-left, green at top-right
      teePos = { q: -6 - Math.floor(rand() * 2), r: -1 + Math.floor(rand() * 2) };
      pinPos = { q: 5 + Math.floor(rand() * 2), r: -18 - Math.floor(rand() * 2) };
      const lz1 = { q: -5 - Math.floor(rand() * 2), r: -9 - Math.floor(rand() * 2) };
      const elbow = { q: -1 - Math.floor(rand() * 2), r: -15 - Math.floor(rand() * 2) };

      stampFairwayPath([teePos, lz1, elbow, pinPos], [1.6, 2.5, 2.8, 2.1]);

      for (let step = -4; step <= 10; step++) {
        const wq = -4 - step;
        const wr = -4 + Math.round(step * 0.55);
        setTile('water', wq, wr);
        setTile('water', wq + 1, wr - 1);
        if (rand() > 0.45) setTile('water', wq, wr - 1);
      }

      stampTeePad(teePos.q, teePos.r);
      stampGreenComplex(pinPos.q, pinPos.r, { q: -1, r: 1 });

      stampBlob('sand', 0, -10, 1.4);
      stampBlob('sand', -8, -11, 1.2);
      stampBlob('sand', pinPos.q + 2, pinPos.r + 2, 1.3);
      stampBlob('sand', pinPos.q - 3, pinPos.r, 1.3);

      for (let tq = 1; tq <= 10; tq++) {
        for (let tr = -12; tr <= 2; tr++) {
          if (hexDist(teePos.q, teePos.r, tq, tr) > 4 && !getTile(tq, tr)) {
            if (tq >= 3 || (tr >= -9 && tr <= -2)) {
              setTile('trees', tq, tr);
            }
          }
        }
      }
    }

  } else if (arch.id === 'sweeping_cape') {
    // Grand crescent curving around a vast lake
    const side = doglegDir;
    teePos = { q: -side * (6 + Math.floor(rand() * 2)), r: -1 + Math.floor(rand() * 2) };
    pinPos = { q: side * (4 + Math.floor(rand() * 2)), r: -19 - Math.floor(rand() * 2) };
    const apex = { q: -side * (2 + Math.floor(rand() * 2)), r: -10 - Math.floor(rand() * 2) };

    stampFairwayPath([teePos, apex, pinPos], [1.6, 2.6, 2.1]);

    // Water lake on inside of crescent
    const lakeQ = side * 1;
    const lakeR = -9;
    stampBlob('water', lakeQ, lakeR, 4.0);

    // Sand beach buffer lining the lake shore
    for (let dq = -5; dq <= 5; dq++) {
      for (let dr = -5; dr <= 5; dr++) {
        const sq = lakeQ + dq;
        const sr = lakeR + dr;
        if (getTile(sq, sr) === 'water') {
          const nbs = [{ q: sq + 1, r: sr }, { q: sq - 1, r: sr }, { q: sq, r: sr + 1 }, { q: sq, r: sr - 1 }];
          nbs.forEach(n => {
            if (getTile(n.q, n.r) === 'fairway' && rand() > 0.35) {
              setTile('sand', n.q, n.r);
            }
          });
        }
      }
    }

    stampTeePad(teePos.q, teePos.r);
    stampGreenComplex(pinPos.q, pinPos.r, { q: -side, r: 1 });
    stampBlob('sand', pinPos.q + side * 2, pinPos.r, 1.4);

  } else if (arch.id === 's_curve_double') {
    // True Par 5 Serpentine S-Curve using the full map width
    const side = doglegDir;
    teePos = { q: side * (6 + Math.floor(rand() * 2)), r: -2 - Math.floor(rand() * 2) };
    const lz1 = { q: -side * (4 + Math.floor(rand() * 2)), r: -9 - Math.floor(rand() * 2) };
    const lz2 = { q: side * (3 + Math.floor(rand() * 2)), r: -15 - Math.floor(rand() * 2) };
    pinPos = { q: -side * (2 + Math.floor(rand() * 2)), r: -20 - Math.floor(rand() * 2) };

    stampFairwayPath([teePos, lz1, lz2, pinPos], [1.6, 2.6, 2.6, 2.1]);
    stampTeePad(teePos.q, teePos.r);
    stampGreenComplex(pinPos.q, pinPos.r, { q: side, r: 1 });

    // Bunkers at both elbow turns
    stampBlob('sand', -side * 6, -10, 1.4);
    stampBlob('sand', side * 5, -16, 1.4);
    stampBlob('sand', pinPos.q - side * 2, pinPos.r, 1.3);

    // Tree groves defining the curves
    for (let tr = -12; tr <= -7; tr++) {
      setTile('trees', side * 2, tr);
      setTile('trees', side * 3, tr);
    }
    for (let tr = -18; tr <= -13; tr++) {
      setTile('trees', -side * 1, tr);
      setTile('trees', -side * 2, tr);
    }

  } else if (arch.id === 'split_fairway') {
    // Wide dual fairways using full lateral width
    teePos = { q: 0, r: 1 };
    pinPos = { q: 0, r: -20 };

    const leftLZ = { q: -5, r: -10 };
    const rightLZ = { q: 5, r: -10 };

    // Left Fairway (aggressive route)
    stampFairwayPath([teePos, leftLZ, pinPos], [1.5, 2.3, 1.9]);
    // Right Fairway (safe boulevard route)
    stampFairwayPath([teePos, rightLZ, pinPos], [1.5, 2.6, 1.9]);

    // Central Hazard Island (separating fairways)
    stampBlob('water', 0, -11, 2.4);
    stampBlob('sand', -1, -7, 1.2);
    stampBlob('sand', 1, -14, 1.2);
    stampBlob('trees', 0, -14, 1.5);

    stampTeePad(teePos.q, teePos.r);
    stampGreenComplex(pinPos.q, pinPos.r, { q: 0, r: 1 });

  } else if (arch.id === 'dune_links_diagonal') {
    // Wide diagonal links with dunes & pot bunkers
    const side = doglegDir;
    teePos = { q: -side * (6 + Math.floor(rand() * 2)), r: 0 + Math.floor(rand() * 2) };
    pinPos = { q: side * (5 + Math.floor(rand() * 2)), r: -19 - Math.floor(rand() * 2) };
    const mid = { q: 0, r: -10 };

    stampFairwayPath([teePos, mid, pinPos], [1.6, 2.8, 2.2]);

    // Flanking deep rough dunes
    for (let r = -2; r >= -18; r -= 2) {
      const t = r / -20;
      const fq = Math.round(teePos.q + (pinPos.q - teePos.q) * t);
      stampBlob('deep_rough', fq - 4, r, 1.7, 0.9);
      stampBlob('deep_rough', fq + 4, r, 1.7, 0.9);

      // Scattered pot bunkers
      if (r === -6 || r === -12 || r === -16) {
        setTile('sand', fq - 3, r);
        setTile('sand', fq + 3, r);
      }
    }

    stampTeePad(teePos.q, teePos.r);
    stampGreenComplex(pinPos.q, pinPos.r, { q: -side, r: 1 });

  } else {
    // Island Peninsula Sanctuary
    teePos = { q: doglegDir * (5 + Math.floor(rand() * 2)), r: -2 };
    pinPos = { q: -doglegDir * (4 + Math.floor(rand() * 2)), r: par === 3 ? -13 : -18 };

    if (par === 3) {
      // Par 3: Dramatic diagonal shot over water basin
      stampBlob('water', 0, -8, 4.4);
      stampTeePad(teePos.q, teePos.r);
      // Bailout strip
      stampBlob('fairway', pinPos.q + doglegDir * 3, pinPos.r + 1, 1.8);
      stampGreenComplex(pinPos.q, pinPos.r, { q: doglegDir, r: 1 });
      stampBlob('sand', pinPos.q - doglegDir * 2, pinPos.r, 1.4);
    } else {
      // Par 4: Wide fairway leading to shoreline, approach over water to peninsula
      const lz1 = { q: doglegDir * 4, r: -8 };
      const lz2 = { q: doglegDir * 2, r: -12 };
      stampFairwayPath([teePos, lz1, lz2], [1.6, 2.6, 2.4]);
      stampBlob('water', -doglegDir * 1, -15, 3.8);
      stampTeePad(teePos.q, teePos.r);
      stampGreenComplex(pinPos.q, pinPos.r, { q: doglegDir, r: 1 });
      stampBlob('sand', pinPos.q + doglegDir * 2, pinPos.r + 2, 1.3);
    }
  }

  // Top perimeter natural tree wall
  for (let bq = -10; bq <= 10; bq++) {
    if (!getTile(bq, -23)) setTile('trees', bq, -23);
    if (!getTile(bq, -22) && rand() > 0.35) setTile('trees', bq, -22);
  }

  // Compile compact spec object
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

  const finalLayout = parseCoords(specObj);
  const targetDist = hexDist(teePos.q, teePos.r, pinPos.q, pinPos.r);

  const generatedHole = {
    id: 1,
    par: par,
    name: holeName,
    tee: { q: teePos.q, r: teePos.r },
    hole: { q: pinPos.q, r: pinPos.r },
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

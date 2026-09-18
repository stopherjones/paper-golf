// ==========================================
// CRAZY GOLF (MINI-GOLF) PROTOTYPE HOLE
// Features:
// - Custom Dice Arsenal (Precision, Power, Sticky, Rubber Bumper, Chaos)
// - Interactive Obstacles:
//   * Speed Ramps (Elevation boost +2)
//   * Rotating Windmill & Timed Gate (Toggles Open/Blocked)
//   * Warp Tubes (Instant teleportation Entrance -> Exit)
//   * Bumper Rails (Elastic bank ricochet)
//   * Loop-de-Loop Funnel (Spiral runway directly to green)
// ==========================================

export const crazyHole = {
  id: 1,
  par: 4,
  name: "Neon Windmill & Warp Tubes",
  subtitle: "Crazy Miniature Golf Prototype",
  isCrazyGolf: true,
  tee: { q: 0, r: 0 },
  hole: { q: 0, r: -19 },
  windmillPos: { q: 0, r: -11 },
  tubeInPos: { q: 3, r: -7 },
  tubeOutPos: { q: -2, r: -14 },
  funnelPos: { q: 2, r: -14 },
  rampPos: [
    { q: 0, r: -5 },
    { q: 0, r: -6 }
  ],
  slopeArrows: {
    "-1,-18": 2, // SE ↘ towards hole
    "1,-18": 4,  // SW ↙ towards hole
    "0,-20": 3,  // S ↓ towards hole
    "-1,-19": 1, // NE ↗ towards hole
    "1,-19": 5   // NW ↖ towards hole
  },
  layout: {
    // --- TEE & LOWER DECK (r = 1 to -4) ---
    "0,0": "tee",
    "0,-1": "crazy_fairway",
    "-1,0": "crazy_fairway",
    "1,-1": "crazy_fairway",
    "-1,-1": "crazy_fairway",
    "0,-2": "crazy_fairway",
    "1,-2": "crazy_fairway",
    "-1,-2": "crazy_fairway",
    "0,-3": "crazy_fairway",
    "1,-3": "crazy_fairway",
    "-1,-3": "crazy_fairway",
    "0,-4": "crazy_fairway",
    "1,-4": "crazy_fairway",
    "-1,-4": "crazy_fairway",

    // Lower Bumper Rails (Bordering the fairway)
    "-2,1": "bumper",
    "-1,1": "bumper",
    "0,1": "bumper",
    "1,0": "bumper",
    "2,-1": "bumper",
    "-2,0": "bumper",
    "-2,-1": "bumper",
    "-2,-2": "bumper",
    "-2,-3": "bumper",
    "-2,-4": "bumper",
    "2,-2": "bumper",
    "2,-3": "bumper",
    "2,-4": "bumper",

    // --- MID SECTION: RAMPS & WATER CHASM (r = -5 to -8) ---
    // Speed Ramps (Center Route)
    "0,-5": "ramp",
    "0,-6": "ramp",

    // Hazard Void / Water Chasm
    "-1,-7": "water",
    "0,-7": "water",
    "1,-7": "water",
    "-1,-8": "water",
    "0,-8": "water",
    "1,-8": "water",

    // Left Safe Wrap Route around chasm
    "-2,-5": "crazy_fairway",
    "-3,-6": "crazy_fairway",
    "-3,-7": "crazy_fairway",
    "-2,-8": "crazy_fairway",
    "-2,-9": "crazy_fairway",

    // Left outer bumpers
    "-3,-5": "bumper",
    "-4,-6": "bumper",
    "-4,-7": "bumper",
    "-3,-8": "bumper",

    // Right Warp Route (Tube Entrance)
    "2,-5": "crazy_fairway",
    "2,-6": "crazy_fairway",
    "3,-7": "tube_in", // Warp Tube Entrance!

    // Right outer bumpers
    "3,-5": "bumper",
    "3,-6": "bumper",
    "4,-7": "bumper",
    "4,-8": "bumper",
    "3,-8": "bumper",

    // --- WINDMILL & TIMED GATE (r = -9 to -12) ---
    // Landing apron past ramp & chasm
    "-1,-9": "crazy_fairway",
    "0,-9": "crazy_fairway",
    "1,-9": "crazy_fairway",
    "-1,-10": "crazy_fairway",
    "0,-10": "crazy_fairway",
    "1,-10": "crazy_fairway",

    // Center Windmill Gate
    "-1,-11": "trees",     // Left tower wall
    "0,-11": "windmill",   // The spinning windmill gate!
    "1,-11": "trees",      // Right tower wall

    // Side bypass routes
    "-2,-10": "crazy_fairway",
    "-2,-11": "crazy_fairway",
    "-2,-12": "crazy_fairway",
    "-3,-10": "bumper",
    "-3,-11": "bumper",
    "-3,-12": "bumper",

    "2,-10": "sand",       // Sand trap hazard on right bypass
    "2,-11": "sand",
    "2,-12": "crazy_fairway",
    "3,-10": "bumper",
    "3,-11": "bumper",
    "3,-12": "bumper",

    // Past windmill runway
    "-1,-12": "crazy_fairway",
    "0,-12": "crazy_fairway",
    "1,-12": "crazy_fairway",

    // --- UPPER DECK & WARP TUBE EXIT & LOOP-DE-LOOP (r = -13 to -16) ---
    "-2,-13": "crazy_fairway",
    "-2,-14": "tube_out",  // Warp Tube Exit!
    "-2,-15": "crazy_fairway",
    "-3,-13": "bumper",
    "-3,-14": "bumper",
    "-3,-15": "bumper",
    "-3,-16": "bumper",

    "-1,-13": "crazy_fairway",
    "0,-13": "crazy_fairway",
    "1,-13": "crazy_fairway",

    "-1,-14": "crazy_fairway",
    "0,-14": "crazy_fairway",
    "1,-14": "crazy_fairway",

    "-1,-15": "crazy_fairway",
    "0,-15": "crazy_fairway",
    "1,-15": "crazy_fairway",

    "-1,-16": "crazy_fairway",
    "0,-16": "crazy_fairway",
    "1,-16": "crazy_fairway",

    // Loop-de-Loop Funnel (Right side)
    "2,-13": "crazy_fairway",
    "2,-14": "funnel",     // Loop-de-Loop entrance!
    "2,-15": "funnel",     // Loop-de-Loop spiral track!
    "2,-16": "crazy_fairway",
    "3,-13": "bumper",
    "3,-14": "bumper",
    "3,-15": "bumper",
    "3,-16": "bumper",

    // --- PUTTING GREEN & PIN (r = -17 to -21) ---
    "-2,-17": "green",
    "-1,-17": "green",
    "0,-17": "green",
    "1,-17": "green",
    "2,-17": "green",

    "-2,-18": "green",
    "-1,-18": "green",
    "0,-18": "green",
    "1,-18": "green",
    "2,-18": "green",

    "-2,-19": "green",
    "-1,-19": "green",
    "0,-19": "hole", // Cup / Pin!
    "1,-19": "green",
    "2,-19": "green",

    "-2,-20": "green",
    "-1,-20": "green",
    "0,-20": "green",
    "1,-20": "green",

    "-1,-21": "green",
    "0,-21": "green",

    // Perimeter bumpers behind and around green
    "-3,-17": "bumper",
    "-3,-18": "bumper",
    "-3,-19": "bumper",
    "-3,-20": "bumper",
    "-2,-21": "bumper",
    "-1,-22": "bumper",
    "0,-22": "bumper",
    "1,-21": "bumper",
    "2,-20": "bumper",
    "3,-19": "bumper",
    "3,-18": "bumper",
    "3,-17": "bumper"
  }
};

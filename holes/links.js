// ==========================================
// COURSE 2: Dunecrest Links (Par 36)
// Demanding / Treacherous - Narrow fairways, pot bunkers, slope hazards
// ==========================================

function parseCoords(spec) {
  const layout = {};
  for (const [type, coords] of Object.entries(spec)) {
    if (typeof coords === 'string') {
      coords.trim().split(/\s+/).forEach(c => { if (c) layout[c] = type; });
    }
  }
  return layout;
}

export const linksCourse = [
  // Hole 1: Razor Dunes - Par 4, Dist ~16 hexes
  {
    id: 1,
    par: 4,
    name: "Razor Dunes",
    tee: { q: 0, r: 0 },
    hole: { q: 0, r: -16 },
    slopeArrows: {
      "1,-14": 2, // Slides SE toward deep rough
      "1,-15": 2,
      "-1,-15": 4 // Slides SW into pot bunker
    },
    layout: {
      "0,0": "tee",
      // Narrow 1-2 tile fairway surrounded by deep rough
      "0,-1": "fairway",
      "-1,-2": "deep_rough", "0,-2": "fairway", "1,-2": "deep_rough",
      "-1,-3": "deep_rough", "0,-3": "fairway", "1,-3": "deep_rough",
      "-1,-4": "deep_rough", "0,-4": "fairway", "1,-4": "deep_rough",
      // Pot bunker in landing zone!
      "0,-5": "sand", "-1,-5": "fairway", "1,-5": "deep_rough",
      "-1,-6": "fairway", "0,-6": "fairway", "1,-6": "deep_rough",
      "-1,-7": "fairway", "0,-7": "fairway", "1,-7": "deep_rough",
      "-2,-8": "deep_rough", "-1,-8": "fairway", "0,-8": "fairway", "1,-8": "deep_rough",
      "-1,-9": "fairway", "0,-9": "fairway",
      // Pot bunkers flanking the approach
      "-1,-10": "sand", "1,-10": "sand", "0,-10": "fairway",
      "0,-11": "fairway",
      "-1,-12": "deep_rough", "0,-12": "fairway", "1,-12": "deep_rough",
      "-1,-13": "fairway", "0,-13": "fairway",
      // Pot bunker guarding green
      "-2,-15": "sand", "-2,-16": "sand",
      // Green
      "-1,-14": "green", "0,-14": "green", "1,-14": "green",
      "-1,-15": "green", "0,-15": "green", "1,-15": "green",
      "-1,-16": "green", "0,-16": "hole",  "1,-16": "green"
    }
  },

  // Hole 2: Coastal Bluff - Par 4, Dist ~17 hexes
  {
    id: 2,
    par: 4,
    name: "Coastal Bluff",
    tee: { q: -1, r: 0 },
    hole: { q: 1, r: -16 },
    slopeArrows: {
      "2,-14": 2, // Slopes down toward coastal water
      "2,-15": 2,
      "1,-13": 2
    },
    layout: {
      "-1,0": "tee", "0,0": "tee",
      // Fairway on left
      "-2,-1": "fairway", "-1,-1": "fairway",
      "-2,-2": "fairway", "-1,-2": "fairway",
      "-2,-3": "fairway", "-1,-3": "fairway",
      "-2,-4": "fairway", "-1,-4": "fairway",
      // Coastal Water covering the entire right side
      "1,-2": "water", "2,-2": "water", "3,-2": "water",
      "1,-3": "water", "2,-3": "water", "3,-3": "water",
      "1,-4": "water", "2,-4": "water", "3,-4": "water",
      "1,-5": "water", "2,-5": "water", "3,-5": "water",
      "1,-6": "water", "2,-6": "water", "3,-6": "water",
      "1,-7": "water", "2,-7": "water", "3,-7": "water",
      "1,-8": "water", "2,-8": "water", "2,-9": "water", "3,-9": "water",
      "2,-10": "water", "3,-10": "water", "2,-11": "water", "3,-11": "water",
      "2,-12": "water", "3,-12": "water", "2,-13": "water", "3,-13": "water",
      "2,-16": "water", "3,-16": "water", "2,-17": "water",
      // Narrow path between deep rough and water
      "-2,-5": "deep_rough", "-1,-5": "fairway", "0,-5": "fairway",
      "-2,-6": "deep_rough", "-1,-6": "fairway", "0,-6": "fairway",
      "-1,-7": "fairway", "0,-7": "fairway",
      "-1,-8": "sand", "0,-8": "fairway", // Pot bunker!
      "0,-9": "fairway", "1,-9": "fairway",
      "0,-10": "fairway", "1,-10": "fairway",
      "0,-11": "fairway", "1,-11": "fairway",
      "0,-12": "fairway", "1,-12": "fairway",
      "0,-13": "fairway",
      // Perched Green near water edge
      "-1,-15": "sand",
      "0,-14": "green", "1,-14": "green", "2,-14": "green",
      "0,-15": "green", "1,-15": "green", "2,-15": "green",
      "0,-16": "green", "1,-16": "hole",  "2,-16": "water",
      "1,-17": "green"
    }
  },

  // Hole 3: The Beach - Par 5
  {
    id: 3,
    par: 5,
    name: "The Beach",
    tee: { q: 4, r: -2 },
    hole: { q: -5, r: -15 },
    slopeArrows: {
      "-6,-15": 2,
      "-6,-16": 2,
      "-7,-15": 2,
      "-4,-16": 4,
      "-3,-16": 4,
      "-4,-14": 5,
      "-3,-14": 5
    },
    layout: parseCoords({
      tee: "4,-2",
      hole: "-5,-15",
      green: `
        -7,-15 -7,-14 -6,-16 -6,-15 -6,-14 -5,-16 -5,-14 -4,-16 -4,-15 -4,-14 -3,-16 -3,-15 -3,-14
      `,
      fairway: `
        3,-1 4,-1 3,-2 5,-2 2,-3 3,-3 4,-3 5,-3 2,-4 3,-4 4,-4 5,-4 2,-5 3,-5 4,-5 5,-5 2,-6 3,-6 4,-6 5,-6
        1,-10 3,-10 4,-11 1,-11 2,-11 3,-11 1,-12 2,-12 3,-12 4,-12 -3,-12 -4,-12 -5,-12
        -1,-13 0,-13 1,-13 2,-13 3,-13 4,-13 -2,-13 -3,-13 -4,-13
        -2,-14 -1,-14 0,-14 1,-14 2,-14 3,-14 4,-14
        -2,-15 -1,-15 0,-15 1,-15 2,-15 3,-15 4,-15
        -2,-16 -1,-16 0,-16 1,-16 2,-16 3,-16 4,-16
        -2,-17 -1,-17 0,-17 -2,-18 -1,-18
      `,
      sand: `
        -5,-21 -4,-21 -3,-21 -2,-21 -1,-21 0,-21 1,-21 2,-21 3,-21 4,-21 5,-21 6,-21 7,-21 8,-21
        -3,-22 -2,-22 -1,-22 0,-22 1,-22 2,-22 3,-22 4,-22 5,-22 6,-22 7,-22
        8,-2 8,-3 8,-4 8,-5 8,-6 8,-7 8,-8 8,-9 8,-10 8,-11 8,-12 8,-13 8,-14 8,-15 8,-16 8,-17 8,-18 8,-19 8,-20 8,-21
        7,-2 7,-3 7,-4 7,-5 7,-6 7,-7 7,-8 7,-9 7,-10 7,-11 7,-12 7,-13 7,-14 7,-15 7,-16 7,-17 7,-18 7,-19 7,-20 7,-21 7,-22
        1,-6 1,-7 1,-8 1,-9 2,-7 2,-8 2,-9 2,-10
        -7,-12 -6,-12 -7,-13 -6,-13 -5,-13
        -5,-17 -4,-17 -3,-17 -4,-18 -3,-18
      `,
      water: `
        9,-3 9,-4 9,-5 9,-6 9,-7 9,-8 9,-9 9,-10 9,-11 9,-12 9,-13 9,-14 9,-15 9,-16 9,-17 9,-18 9,-19 9,-20 9,-21 9,-22 9,-23 9,-24
        10,-4 10,-5 10,-6 10,-7 10,-8 10,-9 10,-10 10,-11 10,-12 10,-13 10,-14 10,-15 10,-16 10,-17 10,-18 10,-19 10,-20 10,-21 10,-22 10,-23 10,-24 10,-25 10,-26
        11,-4 11,-5 11,-6 11,-7 11,-8 11,-9 11,-10 11,-11 11,-12 11,-13 11,-14 11,-15 11,-16 11,-17 11,-18 11,-19 11,-20 11,-21 11,-22 11,-23 11,-24 11,-25 11,-26
        12,-5 12,-6 12,-7 12,-8 12,-9 12,-10 12,-11 12,-12 12,-13 12,-14 12,-15 12,-16 12,-17 12,-18 12,-19 12,-20 12,-21 12,-22 12,-23 12,-24 12,-25 12,-26 12,-27 12,-28
        -1,-23 0,-23 1,-23 2,-23 3,-23 4,-23 5,-23 6,-23 7,-23 8,-23 8,-22 1,-24 2,-24 3,-24 4,-24 5,-24 6,-24 7,-24 8,-24
        -10,-9 -9,-9 -8,-9 -7,-9 -6,-9 -5,-9 -4,-9 -3,-9 -2,-9
        -10,-10 -9,-10 -8,-10 -7,-10 -6,-10 -5,-10 -4,-10 -3,-10 -2,-10
        -1,-10 -1,-9 -1,-8 -1,-7 -1,-6 -1,-5 -1,-4 -1,-3 -1,-2 -1,-1 -1,0 -1,1 -1,2
        -2,-8 -2,-7 -2,-6 -2,-5 -2,-4 -2,-3 -2,-2 -2,-1 -2,0 -2,1 -2,2
      `,
      trees: `
        -12,-9 -11,-9 -11,-8 -11,-4 -11,0
        -10,-8 -10,-7 -10,-6 -10,-5 -10,-4 -10,-3 -10,-2 -10,-1 -10,0 -10,1 -10,2
        -9,-8 -9,-7 -9,-6 -9,-5 -9,-4 -9,-3 -9,-2 -9,-1 -9,0 -9,1 -9,2 -9,3
        -8,-8 -8,-7 -8,-6 -8,-5 -8,-4 -8,-3 -8,-2 -8,-1 -8,0 -8,1 -8,2
        -7,-8 -7,-7 -7,-6 -7,-5 -7,-4 -7,-3 -7,-2 -7,-1 -7,0 -7,1 -7,2
        -6,-8 -6,-7 -6,-6 -6,-5 -6,-4 -6,-3 -6,-2 -6,-1 -6,0 -6,1 -6,2
        -5,-8 -5,-7 -5,-6 -5,-5 -5,-4 -5,-3 -5,-2 -5,-1 -5,0 -5,1 -5,2
        -4,-8 -4,-7 -4,-6 -4,-5 -4,-4 -4,-3 -4,-2 -4,-1 -4,0 -4,1 -4,2
        -3,-8 -3,-7 -3,-6 -3,-5 -3,-4 -3,-3 -3,-2 -3,-1 -3,0 -3,1 -3,2 -3,3
      `
    })
  },

  // Hole 4: Devil's Gulley - Par 5, Dist ~24 hexes
  {
    id: 4,
    par: 5,
    name: "Devil's Gulley",
    tee: { q: 0, r: 0 },
    hole: { q: 0, r: -22 },
    slopeArrows: {
      "-1,-9": 4, // Slopes off left fairway into deep gulley
      "1,-9": 2,  // Slopes off right fairway into deep gulley
      "0,-20": 3  // Slopes back S off green
    },
    layout: {
      "0,0": "tee", "0,-1": "tee",
      // Split Fairway Choice
      // Left Fairway:
      "-2,-2": "fairway", "-1,-2": "fairway",
      "-3,-3": "fairway", "-2,-3": "fairway",
      "-3,-4": "fairway", "-2,-4": "fairway",
      "-3,-5": "fairway", "-2,-5": "fairway",
      "-3,-6": "fairway", "-2,-6": "fairway",
      "-2,-7": "sand", // Pot bunker in landing
      "-3,-8": "fairway", "-2,-8": "fairway",
      "-2,-9": "fairway", "-1,-9": "fairway",
      // Right Fairway:
      "1,-2": "fairway", "2,-2": "fairway",
      "1,-3": "fairway", "2,-3": "fairway",
      "2,-4": "fairway", "3,-4": "fairway",
      "2,-5": "fairway", "3,-5": "fairway",
      "2,-6": "fairway", "3,-6": "fairway",
      "2,-7": "sand", // Pot bunker in landing
      "1,-8": "fairway", "2,-8": "fairway",
      "1,-9": "fairway",
      // Center Gulley (punishing deep rough + pot bunkers)
      "0,-2": "deep_rough", "0,-3": "deep_rough", "0,-4": "deep_rough",
      "-1,-4": "deep_rough", "1,-4": "deep_rough",
      "0,-5": "deep_rough", "-1,-5": "deep_rough", "1,-5": "deep_rough",
      "0,-6": "deep_rough", "-1,-6": "deep_rough", "1,-6": "deep_rough",
      "0,-7": "sand", "0,-8": "deep_rough", "0,-9": "deep_rough",
      // Joined neck
      "-1,-10": "fairway", "0,-10": "fairway", "1,-10": "fairway",
      "-1,-11": "fairway", "0,-11": "fairway",
      "-2,-12": "sand", "0,-12": "fairway", "1,-12": "sand",
      "-1,-13": "fairway", "0,-13": "fairway",
      "-1,-14": "fairway", "0,-14": "fairway", "1,-14": "fairway",
      "-1,-15": "fairway", "0,-15": "fairway",
      "-1,-16": "fairway", "0,-16": "fairway",
      "-1,-17": "fairway", "0,-17": "fairway",
      "-1,-18": "fairway", "0,-18": "fairway",
      "-1,-19": "fairway", "0,-19": "fairway",
      // Green with pot bunkers
      "-2,-21": "sand", "1,-21": "sand",
      "-1,-20": "green", "0,-20": "green", "1,-20": "green",
      "-1,-21": "green", "0,-21": "green", "1,-21": "green",
      "-1,-22": "green", "0,-22": "hole",  "1,-22": "green"
    }
  },

  // Hole 5: The Wind Chasm - Par 4, Dist ~17 hexes
  {
    id: 5,
    par: 4,
    name: "The Wind Chasm",
    tee: { q: 2, r: 0 },
    hole: { q: -4, r: -15 },
    slopeArrows: {
      "-3,-14": 4, // Slopes SW towards cliff edge
      "-4,-13": 4
    },
    layout: {
      "2,0": "tee", "1,0": "tee",
      // Severe diagonal dogleg left over water chasm
      "1,-1": "fairway", "2,-1": "fairway",
      "0,-2": "fairway", "1,-2": "fairway",
      "0,-3": "fairway", "1,-3": "fairway",
      "-1,-4": "fairway", "0,-4": "fairway",
      // Chasm water in the crook of the dogleg
      "-2,-3": "water", "-1,-3": "water",
      "-3,-4": "water", "-2,-4": "water",
      "-3,-5": "water", "-2,-5": "water", "-1,-5": "water", "0,-5": "water",
      "-4,-6": "water", "-3,-6": "water", "-2,-6": "water", "-1,-6": "water",
      "-4,-7": "water", "-3,-7": "water", "-2,-7": "water",
      "-4,-8": "water", "-3,-8": "water",
      // Safe fairway route around chasm
      "0,-6": "fairway", "1,-6": "fairway",
      "-1,-7": "fairway", "0,-7": "fairway",
      "-1,-8": "fairway", "0,-8": "fairway",
      "-2,-9": "fairway", "-1,-9": "fairway",
      "-2,-10": "fairway", "-1,-10": "fairway",
      "-3,-11": "fairway", "-2,-11": "fairway",
      "-3,-12": "fairway", "-2,-12": "fairway",
      "-4,-13": "fairway", "-3,-13": "fairway",
      // Bunkers guarding the green
      "-2,-14": "sand", "-2,-15": "sand", "-5,-16": "sand",
      // Green
      "-4,-14": "green", "-3,-14": "green",
      "-4,-15": "hole",  "-3,-15": "green",
      "-4,-16": "green", "-3,-16": "green"
    }
  },

  // Hole 6: False Front - Par 3, Dist ~11 hexes
  {
    id: 6,
    par: 3,
    name: "False Front",
    tee: { q: 0, r: 0 },
    hole: { q: 0, r: -11 },
    slopeArrows: {
      "0,-8": 3,  // False front slope slides ball straight back S into deep rough!
      "-1,-8": 3,
      "1,-8": 3,
      "0,-9": 3,
      "-1,-9": 4, // Slopes SW into sand
      "1,-9": 2   // Slopes SE into sand
    },
    layout: {
      "0,0": "tee",
      // Deep rough valley to cross
      "-1,-1": "deep_rough", "0,-1": "deep_rough", "1,-1": "deep_rough",
      "-1,-2": "deep_rough", "0,-2": "deep_rough", "1,-2": "deep_rough",
      "-1,-3": "deep_rough", "0,-3": "deep_rough", "1,-3": "deep_rough",
      "-1,-4": "deep_rough", "0,-4": "deep_rough", "1,-4": "deep_rough",
      "-1,-5": "deep_rough", "0,-5": "deep_rough", "1,-5": "deep_rough",
      "-1,-6": "deep_rough", "0,-6": "deep_rough", "1,-6": "deep_rough",
      // Pot bunkers flanking the false front
      "-2,-8": "sand", "-2,-9": "sand", "-2,-10": "sand",
      "2,-8": "sand", "2,-9": "sand", "2,-10": "sand",
      // Green with steep false front
      "-1,-8": "green", "0,-8": "green", "1,-8": "green",
      "-1,-9": "green", "0,-9": "green", "1,-9": "green",
      "-1,-10": "green", "0,-10": "green", "1,-10": "green",
      "-1,-11": "green", "0,-11": "hole",  "1,-11": "green",
      "0,-12": "green"
    }
  },

  // Hole 7: The Serpent - Par 4, Dist ~18 hexes
  {
    id: 7,
    par: 4,
    name: "The Serpent",
    tee: { q: -2, r: 0 },
    hole: { q: 2, r: -17 },
    slopeArrows: {
      "0,-8": 2, // Slopes towards pot bunker
      "2,-15": 2
    },
    layout: {
      "-2,0": "tee", "-1,0": "tee",
      // S-curve winding through deep rough dunes
      "-2,-1": "fairway", "-1,-1": "fairway",
      "-3,-2": "fairway", "-2,-2": "fairway",
      "-3,-3": "fairway", "-2,-3": "fairway",
      "-3,-4": "deep_rough", "-2,-4": "fairway", "-1,-4": "fairway",
      "-2,-5": "fairway", "-1,-5": "fairway",
      "-1,-6": "fairway", "0,-6": "fairway",
      // Pot bunker on bend
      "1,-6": "sand",
      "0,-7": "fairway", "1,-7": "fairway",
      "0,-8": "fairway", "1,-8": "fairway",
      "1,-9": "fairway", "2,-9": "fairway",
      "1,-10": "fairway", "2,-10": "fairway",
      "1,-11": "fairway", "2,-11": "fairway",
      "0,-12": "fairway", "1,-12": "fairway",
      // Pot bunker on return bend
      "-1,-12": "sand",
      "0,-13": "fairway", "1,-13": "fairway",
      "1,-14": "fairway", "2,-14": "fairway",
      "1,-15": "fairway", "2,-15": "fairway",
      // Bunkers around green
      "0,-16": "sand", "3,-16": "sand",
      // Green
      "1,-16": "green", "2,-16": "green",
      "1,-17": "green", "2,-17": "hole",  "3,-17": "green",
      "1,-18": "green", "2,-18": "green"
    }
  },

  // Hole 8: The Road Hole - Par 4, Dist ~18 hexes
  {
    id: 8,
    par: 4,
    name: "The Road Hole",
    tee: { q: 0, r: 0 },
    hole: { q: -1, r: -17 },
    slopeArrows: {
      "0,-15": 4, // Road slope falls off to the SW
      "-1,-16": 4
    },
    layout: {
      "0,0": "tee", "1,0": "tee",
      // Corner trees & sheds to carry over
      "1,-2": "trees", "2,-2": "trees",
      "1,-3": "trees", "2,-3": "trees",
      "1,-4": "trees", "2,-4": "trees",
      // Landing fairway on left
      "-1,-2": "fairway", "0,-2": "fairway",
      "-1,-3": "fairway", "0,-3": "fairway",
      "-1,-4": "fairway", "0,-4": "fairway",
      "-1,-5": "fairway", "0,-5": "fairway", "1,-5": "fairway",
      "-1,-6": "fairway", "0,-6": "fairway", "1,-6": "fairway",
      "-1,-7": "fairway", "0,-7": "fairway", "1,-7": "fairway",
      "-1,-8": "fairway", "0,-8": "fairway",
      // Pot bunker in middle of fairway!
      "0,-9": "sand",
      "-1,-9": "fairway", "1,-9": "fairway",
      "-1,-10": "fairway", "0,-10": "fairway", "1,-10": "fairway",
      "-1,-11": "fairway", "0,-11": "fairway",
      "-1,-12": "fairway", "0,-12": "fairway",
      "-1,-13": "fairway", "0,-13": "fairway",
      // The infamous Pot Bunker directly in front of the green
      "-1,-15": "sand", "0,-15": "sand",
      // Green
      "-2,-16": "green", "-1,-16": "green", "0,-16": "green",
      "-2,-17": "green", "-1,-17": "hole",  "0,-17": "green",
      "-1,-18": "green", "0,-18": "green"
    }
  },

  // Hole 9: Duneland Odyssey - Par 5, Dist ~25 hexes
  {
    id: 9,
    par: 5,
    name: "Duneland Odyssey",
    tee: { q: 0, r: 0 },
    hole: { q: 0, r: -23 },
    slopeArrows: {
      "0,-21": 3, // Slopes towards water moat
      "-1,-22": 4, // Slopes SW into sand
      "1,-22": 2   // Slopes SE into sand
    },
    layout: {
      "0,0": "tee", "0,-1": "tee",
      "-1,-2": "fairway", "0,-2": "fairway", "1,-2": "fairway",
      "-1,-3": "fairway", "0,-3": "fairway", "1,-3": "fairway",
      "-2,-4": "fairway", "-1,-4": "fairway", "0,-4": "fairway", "1,-4": "fairway",
      // Fairway pot bunker
      "0,-5": "sand", "-1,-5": "fairway", "1,-5": "fairway",
      "-1,-6": "fairway", "0,-6": "fairway", "1,-6": "fairway",
      "-1,-7": "fairway", "0,-7": "fairway", "1,-7": "fairway",
      // Deep rough waist
      "-2,-8": "deep_rough", "-1,-8": "fairway", "0,-8": "fairway", "1,-8": "deep_rough",
      "-1,-9": "fairway", "0,-9": "fairway", "1,-9": "fairway",
      "-1,-10": "fairway", "0,-10": "fairway", "1,-10": "fairway",
      // Mid bunker pair
      "-2,-11": "sand", "2,-11": "sand",
      "-1,-11": "fairway", "0,-11": "fairway", "1,-11": "fairway",
      "-1,-12": "fairway", "0,-12": "fairway", "1,-12": "fairway",
      "-1,-13": "fairway", "0,-13": "fairway", "1,-13": "fairway",
      "-1,-14": "fairway", "0,-14": "fairway",
      "-1,-15": "fairway", "0,-15": "fairway", "1,-15": "fairway",
      "-1,-16": "fairway", "0,-16": "fairway", "1,-16": "fairway",
      "-1,-17": "fairway", "0,-17": "fairway",
      "-1,-18": "fairway", "0,-18": "fairway",
      // Sea water inlet in front of island approach
      "-3,-19": "water", "-2,-19": "water", "-1,-19": "water", "0,-19": "water", "1,-19": "water", "2,-19": "water",
      "-2,-20": "water", "-1,-20": "water", "0,-20": "water", "1,-20": "water",
      // Island Green with surrounding pot bunkers
      "-2,-22": "sand", "-2,-23": "sand",
      "2,-22": "sand", "2,-23": "sand",
      "-1,-21": "green", "0,-21": "green", "1,-21": "green",
      "-1,-22": "green", "0,-22": "green", "1,-22": "green",
      "-1,-23": "green", "0,-23": "hole",  "1,-23": "green",
      "0,-24": "green"
    }
  }
];

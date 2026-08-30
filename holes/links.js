// ==========================================
// COURSE 2: Dunecrest Links (Par 36)
// Demanding / Treacherous - Narrow fairways, pot bunkers, slope hazards
// ==========================================

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

  // Hole 3: The Coffin - Par 3, Dist ~12 hexes
  {
    id: 3,
    par: 3,
    name: "The Coffin",
    tee: { q: 0, r: 0 },
    hole: { q: 0, r: -11 },
    slopeArrows: {
      "-1,-10": 4, // Slopes SW into Left Pot Bunker
      "1,-10": 2,  // Slopes SE into Right Pot Bunker
      "0,-9": 3    // False front slopes back S into front bunker
    },
    layout: {
      "0,0": "tee",
      // Carry over deep rough and pot traps
      "-1,-2": "deep_rough", "0,-2": "deep_rough", "1,-2": "deep_rough",
      "-1,-3": "deep_rough", "0,-3": "fairway", "1,-3": "deep_rough",
      "-1,-4": "deep_rough", "0,-4": "fairway", "1,-4": "deep_rough",
      "-1,-5": "deep_rough", "0,-5": "deep_rough", "1,-5": "deep_rough",
      "-2,-6": "deep_rough", "-1,-6": "deep_rough", "0,-6": "deep_rough", "1,-6": "deep_rough",
      // Four surrounding pot bunkers ("The Coffin")
      "0,-8": "sand",
      "-2,-10": "sand", "-2,-11": "sand",
      "2,-10": "sand", "2,-11": "sand",
      "0,-13": "sand",
      // Perched Crown Green with slopes
      "-1,-9": "deep_rough", "0,-9": "green", "1,-9": "deep_rough",
      "-1,-10": "green", "0,-10": "green", "1,-10": "green",
      "-1,-11": "green", "0,-11": "hole",  "1,-11": "green",
      "-1,-12": "green", "0,-12": "green", "1,-12": "green"
    }
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

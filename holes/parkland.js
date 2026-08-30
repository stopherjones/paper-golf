// ==========================================
// COURSE 1: Meadow Wood Parkland (Par 36)
// Easy / Moderate - Wide fairways & gentle greens
// ==========================================

export const parklandCourse = [
  // Hole 1: The Meadow - Par 4, Dist ~16 hexes
  {
    id: 1,
    par: 4,
    name: "The Meadow",
    tee: { q: 0, r: 0 },
    hole: { q: 0, r: -16 },
    slopeArrows: {},
    layout: {
      "0,0": "tee", "0,-1": "tee",
      // Fairway
      "-1,-2": "fairway", "0,-2": "fairway", "1,-2": "fairway",
      "-1,-3": "fairway", "0,-3": "fairway", "1,-3": "fairway",
      "-1,-4": "fairway", "0,-4": "fairway", "1,-4": "fairway",
      "-1,-5": "fairway", "0,-5": "fairway", "1,-5": "fairway",
      "-1,-6": "fairway", "0,-6": "fairway", "1,-6": "fairway",
      "-1,-7": "fairway", "0,-7": "fairway", "1,-7": "fairway",
      "-1,-8": "fairway", "0,-8": "fairway", "1,-8": "fairway",
      "-1,-9": "fairway", "0,-9": "fairway", "1,-9": "fairway",
      "-1,-10": "fairway", "0,-10": "fairway", "1,-10": "fairway",
      "-1,-11": "fairway", "0,-11": "fairway", "1,-11": "fairway",
      "-1,-12": "fairway", "0,-12": "fairway", "1,-12": "fairway",
      "-1,-13": "fairway", "0,-13": "fairway", "1,-13": "fairway",
      // Sand traps
      "-2,-14": "sand", "-2,-15": "sand",
      "2,-15": "sand", "2,-16": "sand",
      // Green
      "-1,-14": "green", "0,-14": "green", "1,-14": "green",
      "-1,-15": "green", "0,-15": "green", "1,-15": "green",
      "-1,-16": "green", "0,-16": "hole",  "1,-16": "green",
      "-1,-17": "green", "0,-17": "green", "1,-17": "green"
    }
  },

  // Hole 2: Willow Pond - Par 3, Dist ~11 hexes
  {
    id: 2,
    par: 3,
    name: "Willow Pond",
    tee: { q: 0, r: 0 },
    hole: { q: 2, r: -11 },
    slopeArrows: {},
    layout: {
      "0,0": "tee", "1,0": "tee",
      // Safe fairway bailout
      "1,-1": "fairway", "2,-1": "fairway",
      "1,-2": "fairway", "2,-2": "fairway", "3,-2": "fairway",
      "1,-3": "fairway", "2,-3": "fairway", "3,-3": "fairway",
      "2,-4": "fairway", "3,-4": "fairway",
      "2,-5": "fairway", "3,-5": "fairway",
      "2,-6": "fairway", "3,-6": "fairway",
      "2,-7": "fairway", "3,-7": "fairway",
      "2,-8": "fairway", "3,-8": "fairway",
      // Water hazard on left
      "-2,-4": "water", "-1,-4": "water", "0,-4": "water", "1,-4": "water",
      "-2,-5": "water", "-1,-5": "water", "0,-5": "water", "1,-5": "water",
      "-2,-6": "water", "-1,-6": "water", "0,-6": "water", "1,-6": "water",
      "-1,-7": "water", "0,-7": "water", "1,-7": "water",
      // Bunker
      "1,-10": "sand", "1,-11": "sand",
      // Green
      "2,-9": "green", "3,-9": "green",
      "1,-9": "green", "2,-10": "green", "3,-10": "green",
      "2,-11": "hole", "3,-11": "green", "4,-11": "green",
      "2,-12": "green", "3,-12": "green"
    }
  },

  // Hole 3: Pine Dogleg - Par 4, Dist ~17 hexes
  {
    id: 3,
    par: 4,
    name: "Pine Dogleg",
    tee: { q: 0, r: 0 },
    hole: { q: 4, r: -16 },
    slopeArrows: {},
    layout: {
      "0,0": "tee", "-1,0": "tee",
      // Straight initial fairway
      "-1,-1": "fairway", "0,-1": "fairway", "1,-1": "fairway",
      "-1,-2": "fairway", "0,-2": "fairway", "1,-2": "fairway",
      "-1,-3": "fairway", "0,-3": "fairway", "1,-3": "fairway",
      "-1,-4": "fairway", "0,-4": "fairway", "1,-4": "fairway",
      "-1,-5": "fairway", "0,-5": "fairway", "1,-5": "fairway",
      "-1,-6": "fairway", "0,-6": "fairway", "1,-6": "fairway",
      "0,-7": "fairway", "1,-7": "fairway", "2,-7": "fairway",
      "0,-8": "fairway", "1,-8": "fairway", "2,-8": "fairway",
      // Corner trees blocking the direct route
      "1,-4": "trees", "2,-4": "trees", "3,-4": "trees",
      "2,-5": "trees", "3,-5": "trees", "4,-5": "trees",
      "2,-6": "trees", "3,-6": "trees", "4,-6": "trees",
      // Dogleg curve right
      "1,-9": "fairway", "2,-9": "fairway", "3,-9": "fairway",
      "2,-10": "fairway", "3,-10": "fairway", "4,-10": "fairway",
      "2,-11": "fairway", "3,-11": "fairway", "4,-11": "fairway",
      "3,-12": "fairway", "4,-12": "fairway", "5,-12": "fairway",
      "3,-13": "fairway", "4,-13": "fairway", "5,-13": "fairway",
      "3,-14": "fairway", "4,-14": "fairway",
      // Bunker
      "5,-15": "sand", "5,-16": "sand",
      // Green
      "3,-15": "green", "4,-15": "green",
      "3,-16": "green", "4,-16": "hole",
      "3,-17": "green", "4,-17": "green", "5,-17": "green"
    }
  },

  // Hole 4: Oak Valley - Par 5, Dist ~23 hexes
  {
    id: 4,
    par: 5,
    name: "Oak Valley",
    tee: { q: 0, r: 0 },
    hole: { q: -1, r: -22 },
    slopeArrows: {},
    layout: {
      "0,0": "tee", "-1,0": "tee",
      // Landing Area 1
      "-1,-1": "fairway", "0,-1": "fairway", "1,-1": "fairway",
      "-1,-2": "fairway", "0,-2": "fairway", "1,-2": "fairway",
      "-2,-3": "fairway", "-1,-3": "fairway", "0,-3": "fairway", "1,-3": "fairway",
      "-2,-4": "fairway", "-1,-4": "fairway", "0,-4": "fairway", "1,-4": "fairway",
      "-2,-5": "fairway", "-1,-5": "fairway", "0,-5": "fairway", "1,-5": "fairway",
      "-2,-6": "fairway", "-1,-6": "fairway", "0,-6": "fairway", "1,-6": "fairway",
      "-2,-7": "fairway", "-1,-7": "fairway", "0,-7": "fairway",
      // Mid fairway bunkers
      "1,-7": "sand", "1,-8": "sand",
      "-2,-8": "fairway", "-1,-8": "fairway", "0,-8": "fairway",
      "-2,-9": "fairway", "-1,-9": "fairway", "0,-9": "fairway", "1,-9": "fairway",
      "-2,-10": "fairway", "-1,-10": "fairway", "0,-10": "fairway", "1,-10": "fairway",
      "-2,-11": "fairway", "-1,-11": "fairway", "0,-11": "fairway", "1,-11": "fairway",
      "-1,-12": "fairway", "0,-12": "fairway", "1,-12": "fairway",
      "-1,-13": "fairway", "0,-13": "fairway", "1,-13": "fairway",
      "-2,-14": "fairway", "-1,-14": "fairway", "0,-14": "fairway",
      "-2,-15": "fairway", "-1,-15": "fairway", "0,-15": "fairway",
      "-2,-16": "fairway", "-1,-16": "fairway", "0,-16": "fairway",
      "-2,-17": "fairway", "-1,-17": "fairway", "0,-17": "fairway",
      "-2,-18": "fairway", "-1,-18": "fairway", "0,-18": "fairway",
      "-2,-19": "fairway", "-1,-19": "fairway", "0,-19": "fairway",
      // Approach Bunkers
      "-3,-20": "sand", "1,-21": "sand",
      // Green
      "-2,-20": "green", "-1,-20": "green", "0,-20": "green",
      "-2,-21": "green", "-1,-21": "green", "0,-21": "green",
      "-2,-22": "green", "-1,-22": "hole",  "0,-22": "green",
      "-1,-23": "green", "0,-23": "green"
    }
  },

  // Hole 5: The Creek Crossing - Par 4, Dist ~16 hexes
  {
    id: 5,
    par: 4,
    name: "The Creek Crossing",
    tee: { q: 0, r: 0 },
    hole: { q: 0, r: -16 },
    slopeArrows: {},
    layout: {
      "0,0": "tee", "1,0": "tee",
      // Tee landing strip
      "-1,-1": "fairway", "0,-1": "fairway", "1,-1": "fairway",
      "-1,-2": "fairway", "0,-2": "fairway", "1,-2": "fairway",
      "-1,-3": "fairway", "0,-3": "fairway", "1,-3": "fairway",
      "-1,-4": "fairway", "0,-4": "fairway", "1,-4": "fairway",
      "-1,-5": "fairway", "0,-5": "fairway", "1,-5": "fairway",
      "-1,-6": "fairway", "0,-6": "fairway", "1,-6": "fairway",
      // Creek flowing diagonally across fairway
      "-3,-8": "water", "-2,-8": "water", "-1,-8": "water", "0,-8": "water", "1,-8": "water", "2,-8": "water", "3,-8": "water",
      "-3,-9": "water", "-2,-9": "water", "-1,-9": "water", "0,-9": "water", "1,-9": "water", "2,-9": "water",
      // Far fairway
      "-1,-10": "fairway", "0,-10": "fairway", "1,-10": "fairway",
      "-1,-11": "fairway", "0,-11": "fairway", "1,-11": "fairway",
      "-1,-12": "fairway", "0,-12": "fairway", "1,-12": "fairway",
      "-1,-13": "fairway", "0,-13": "fairway", "1,-13": "fairway",
      // Greenside bunker
      "-2,-15": "sand", "-2,-16": "sand",
      // Green
      "-1,-14": "green", "0,-14": "green", "1,-14": "green",
      "-1,-15": "green", "0,-15": "green", "1,-15": "green",
      "-1,-16": "green", "0,-16": "hole",  "1,-16": "green",
      "0,-17": "green"
    }
  },

  // Hole 6: The Oasis - Par 3, Dist ~10 hexes
  {
    id: 6,
    par: 3,
    name: "The Oasis",
    tee: { q: 0, r: 0 },
    hole: { q: 0, r: -10 },
    slopeArrows: {},
    layout: {
      "0,0": "tee", "-1,0": "tee",
      // Light fairway / rough
      "-1,-1": "fairway", "0,-1": "fairway", "1,-1": "fairway",
      "-1,-2": "fairway", "0,-2": "fairway", "1,-2": "fairway",
      "-1,-3": "fairway", "0,-3": "fairway", "1,-3": "fairway",
      "-1,-4": "fairway", "0,-4": "fairway",
      // Deep bunkers guarding front of green
      "-2,-7": "sand", "-1,-7": "sand", "0,-7": "sand", "1,-7": "sand",
      "-2,-8": "sand", "1,-8": "sand",
      // Wide oval green
      "-2,-9": "green", "-1,-9": "green", "0,-9": "green", "1,-9": "green", "2,-9": "green",
      "-2,-10": "green", "-1,-10": "green", "0,-10": "hole", "1,-10": "green", "2,-10": "green",
      "-1,-11": "green", "0,-11": "green", "1,-11": "green"
    }
  },

  // Hole 7: Birch Alley - Par 4, Dist ~17 hexes
  {
    id: 7,
    par: 4,
    name: "Birch Alley",
    tee: { q: 0, r: 0 },
    hole: { q: -3, r: -16 },
    slopeArrows: {},
    layout: {
      "0,0": "tee", "-1,0": "tee",
      // Fairway wrapping left
      "-1,-1": "fairway", "0,-1": "fairway",
      "-2,-2": "fairway", "-1,-2": "fairway", "0,-2": "fairway",
      "-2,-3": "fairway", "-1,-3": "fairway", "0,-3": "fairway",
      "-2,-4": "fairway", "-1,-4": "fairway", "0,-4": "fairway",
      "-2,-5": "fairway", "-1,-5": "fairway", "0,-5": "fairway",
      "-3,-6": "fairway", "-2,-6": "fairway", "-1,-6": "fairway",
      "-3,-7": "fairway", "-2,-7": "fairway", "-1,-7": "fairway",
      // Trees lining the inner bend
      "-1,-5": "fairway", "1,-3": "trees", "1,-4": "trees", "1,-5": "trees",
      "-4,-8": "fairway", "-3,-8": "fairway", "-2,-8": "fairway",
      "-4,-9": "fairway", "-3,-9": "fairway", "-2,-9": "fairway",
      "-4,-10": "fairway", "-3,-10": "fairway", "-2,-10": "fairway",
      "-4,-11": "fairway", "-3,-11": "fairway", "-2,-11": "fairway",
      "-4,-12": "fairway", "-3,-12": "fairway", "-2,-12": "fairway",
      "-4,-13": "fairway", "-3,-13": "fairway", "-2,-13": "fairway",
      // Bunker
      "-1,-15": "sand", "-1,-16": "sand",
      // Green
      "-4,-14": "green", "-3,-14": "green", "-2,-14": "green",
      "-4,-15": "green", "-3,-15": "green", "-2,-15": "green",
      "-4,-16": "green", "-3,-16": "hole",  "-2,-16": "green",
      "-3,-17": "green"
    }
  },

  // Hole 8: Fox Run - Par 5, Dist ~23 hexes
  {
    id: 8,
    par: 5,
    name: "Fox Run",
    tee: { q: 0, r: 0 },
    hole: { q: 2, r: -22 },
    slopeArrows: {},
    layout: {
      "0,0": "tee", "1,0": "tee",
      "-1,-1": "fairway", "0,-1": "fairway", "1,-1": "fairway",
      "-1,-2": "fairway", "0,-2": "fairway", "1,-2": "fairway",
      "0,-3": "fairway", "1,-3": "fairway", "2,-3": "fairway",
      "0,-4": "fairway", "1,-4": "fairway", "2,-4": "fairway",
      "0,-5": "fairway", "1,-5": "fairway", "2,-5": "fairway",
      "0,-6": "fairway", "1,-6": "fairway", "2,-6": "fairway",
      "1,-7": "fairway", "2,-7": "fairway", "3,-7": "fairway",
      // Fairway bunker
      "0,-7": "sand", "0,-8": "sand",
      "1,-8": "fairway", "2,-8": "fairway", "3,-8": "fairway",
      "1,-9": "fairway", "2,-9": "fairway", "3,-9": "fairway",
      "1,-10": "fairway", "2,-10": "fairway", "3,-10": "fairway",
      "1,-11": "fairway", "2,-11": "fairway", "2,-12": "fairway",
      "1,-12": "fairway", "2,-13": "fairway", "3,-13": "fairway",
      "1,-14": "fairway", "2,-14": "fairway", "3,-14": "fairway",
      "1,-15": "fairway", "2,-15": "fairway", "3,-15": "fairway",
      "1,-16": "fairway", "2,-16": "fairway", "3,-16": "fairway",
      "1,-17": "fairway", "2,-17": "fairway", "3,-17": "fairway",
      "1,-18": "fairway", "2,-18": "fairway", "3,-18": "fairway",
      "1,-19": "fairway", "2,-19": "fairway", "2,-20": "fairway",
      // Bunkers guarding green
      "0,-21": "sand", "4,-21": "sand",
      // Green
      "1,-20": "green", "2,-20": "green", "3,-20": "green",
      "1,-21": "green", "2,-21": "green", "3,-21": "green",
      "1,-22": "green", "2,-22": "hole",  "3,-22": "green",
      "2,-23": "green"
    }
  },

  // Hole 9: Clubhouse Finish - Par 4, Dist ~18 hexes
  {
    id: 9,
    par: 4,
    name: "Clubhouse Finish",
    tee: { q: 0, r: 0 },
    hole: { q: 0, r: -17 },
    slopeArrows: {},
    layout: {
      "0,0": "tee", "0,-1": "tee",
      "-1,-2": "fairway", "0,-2": "fairway", "1,-2": "fairway",
      "-1,-3": "fairway", "0,-3": "fairway", "1,-3": "fairway",
      "-2,-4": "fairway", "-1,-4": "fairway", "0,-4": "fairway", "1,-4": "fairway",
      "-2,-5": "fairway", "-1,-5": "fairway", "0,-5": "fairway", "1,-5": "fairway",
      "-2,-6": "fairway", "-1,-6": "fairway", "0,-6": "fairway", "1,-6": "fairway",
      "-1,-7": "fairway", "0,-7": "fairway", "1,-7": "fairway",
      "-1,-8": "fairway", "0,-8": "fairway", "1,-8": "fairway",
      "-1,-9": "fairway", "0,-9": "fairway", "1,-9": "fairway",
      "-1,-10": "fairway", "0,-10": "fairway", "1,-10": "fairway",
      "-1,-11": "fairway", "0,-11": "fairway", "1,-11": "fairway",
      "-1,-12": "fairway", "0,-12": "fairway", "1,-12": "fairway",
      "-1,-13": "fairway", "0,-13": "fairway", "1,-13": "fairway",
      "-1,-14": "fairway", "0,-14": "fairway", "1,-14": "fairway",
      // Twin bunkers
      "-2,-16": "sand", "-2,-17": "sand",
      "2,-16": "sand", "2,-17": "sand",
      // Green
      "-1,-15": "green", "0,-15": "green", "1,-15": "green",
      "-1,-16": "green", "0,-16": "green", "1,-16": "green",
      "-1,-17": "green", "0,-17": "hole",  "1,-17": "green",
      "-1,-18": "green", "0,-18": "green", "1,-18": "green"
    }
  }
];

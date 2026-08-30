// Hole 2: Par 3 Island Approach (~12 hex distance)
export const hole02 = {
  id: 2,
  par: 3,
  name: "Island Green",
  tee: { q: 0, r: 0 },
  hole: { q: 0, r: -11 },
  slopeArrows: {},
  layout: {
    '0,0': 'tee',
    '-1,0': 'tee',

    // Narrow Fairway
    '0,-1': 'fairway', '0,-2': 'fairway', '0,-3': 'fairway',
    '-1,-1': 'fairway', '-1,-2': 'fairway', '1,-1': 'fairway',

    // Water Hazard moat around approach
    '-2,-5': 'water', '-1,-5': 'water', '0,-5': 'water', '1,-5': 'water', '2,-5': 'water',
    '-2,-6': 'water', '-1,-6': 'water', '0,-6': 'water', '1,-6': 'water', '2,-6': 'water',

    // Green Island
    '-1,-9': 'green', '0,-9': 'green', '1,-9': 'green',
    '-1,-10': 'green', '0,-10': 'green', '1,-10': 'green',
    '-1,-11': 'green', '0,-11': 'hole',  '1,-11': 'green',
    '0,-12': 'sand'
  }
};

import { parklandCourse } from './parkland.js';
import { linksCourse } from './links.js';

export const COURSES = {
  parkland: {
    id: 'parkland',
    name: 'Meadow Wood Parkland',
    difficulty: 'Easy / Moderate',
    badge: 'PARKLAND',
    par: 36,
    holesCount: 9,
    description: 'Scenic tree-lined avenues with forgiving fairways, gentle greens, and serene water hazards.',
    features: ['Wide Fairways', 'Gentle Slopes', 'Traditional Bunkers', 'Manageable Rough'],
    holes: parklandCourse
  },
  links: {
    id: 'links',
    name: 'Dunecrest Links',
    difficulty: 'Demanding / Hard',
    badge: 'LINKS',
    par: 36,
    holesCount: 9,
    description: 'Treacherous coastal winds, punishing deep rough, hazardous pot bunkers, and steep crown greens.',
    features: ['Narrow Fairways', 'Punishing Deep Rough', 'Pot Bunkers', 'Contoured Slopes'],
    holes: linksCourse
  }
};

export const courseData = parklandCourse;


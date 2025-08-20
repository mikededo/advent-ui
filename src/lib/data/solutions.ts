/* eslint-disable perfectionist/sort-objects */
import type { Year } from '$lib/utils';

export const SOLUTIONS: Record<number, Year> = {
  2024: {
    10: {
      href: '/2024/10',
      title: '10th',
      description: 'Implementation of a <em>&ldquo;flood fill&rdquo;</em> algorithm to dectect consequent areas.',
      tags: ['Algorithm']
    },
    12: {
      href: '/2024/12',
      title: '12th',
      description: 'Implementation of a <em>&ldquo;flood fill&rdquo;</em> algorithm to dectect consequent areas.',
      tags: ['Algorithm']
    },
    15: {
      href: '/2024/15',
      title: '15th',
      description: 'Analyze the robot\'s actions while accounting for obstacles and blocked movements on a map.',
      tags: ['Algorithm']
    }
  },
  2023: {
    10: {
      href: '/2023/10',
      title: '10th',
      description: 'Trace a continuous loop through a grid of interconnected pipe segments, identifying the loop\'s path and determining distances and enclosed areas.',
      tags: ['Algorithm']
    }
  }
};

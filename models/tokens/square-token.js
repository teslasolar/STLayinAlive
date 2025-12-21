/**
 * Square Token
 * Square/rectangular token for board games and markers
 */

import { TokenBase, TOKEN_SIZES } from './token-base.js';
import { createBox, ops, transform } from '../../src/core/primitives.js';
import jscadModeling from '@jscad/modeling';

const { primitives, booleans, transforms } = jscadModeling;
const { cuboid, roundedCuboid, cylinder } = primitives;
const { subtract, union } = booleans;
const { translate } = transforms;

/**
 * Square token sizes (side length in mm)
 */
export const SQUARE_SIZES = {
  micro: { size: 15, height: 2 },
  tiny: { size: 20, height: 2 },
  small: { size: 25, height: 3 },
  medium: { size: 32, height: 3 },
  large: { size: 40, height: 4 },
  xlarge: { size: 50, height: 4 },
  // Special board game sizes
  'chess-small': { size: 25, height: 5 },
  'chess-large': { size: 32, height: 6 },
  'tile-1inch': { size: 25.4, height: 3 },
  'tile-2inch': { size: 50.8, height: 4 },
};

export class SquareToken extends TokenBase {
  constructor(params = {}, tagProvider = null) {
    super(params, tagProvider);
    this.name = 'square-token';
  }

  getDefaultParams() {
    return {
      size: 25,           // Side length (square)
      width: null,        // Optional: use for rectangular tokens
      depth: null,        // Optional: use for rectangular tokens
      height: 3,
      cornerRadius: 2,    // Rounded corners
      bevel: 0.5,         // Edge bevel
      chamfer: false,     // Chamfered edges instead of rounded
      centerHole: false,  // Add center mounting hole
      holeDiameter: 3,
    };
  }

  generateBaseShape() {
    const { size, width, depth, height, cornerRadius } = this.params;

    const w = width || size;
    const d = depth || size;
    const h = height;

    let token;

    // Ensure corner radius doesn't exceed half of any dimension
    const maxRadius = Math.min(w / 2, d / 2, h / 2) - 0.1;
    const safeCornerRadius = Math.max(0, Math.min(cornerRadius, maxRadius));

    if (safeCornerRadius > 0.1) {
      token = roundedCuboid({
        size: [w, d, h],
        roundRadius: safeCornerRadius,
        segments: 16,
        center: [0, 0, 0]
      });
    } else {
      token = cuboid({
        size: [w, d, height],
        center: [0, 0, 0]
      });
    }

    // Add center hole if requested
    if (this.params.centerHole) {
      const hole = cylinder({
        radius: this.params.holeDiameter / 2,
        height: height + 0.2,
        segments: 32,
        center: [0, 0, 0]
      });
      token = subtract(token, hole);
    }

    return token;
  }
}

/**
 * Factory function to create square tokens of standard sizes
 */
export function createSquareToken(size = 'medium', customParams = {}) {
  const sizeParams = SQUARE_SIZES[size] || SQUARE_SIZES.medium;
  return new SquareToken({
    ...sizeParams,
    ...customParams
  });
}

/**
 * Generate all standard square token sizes
 */
export function generateSquareTokenSet() {
  return Object.entries(SQUARE_SIZES).map(([name, params]) => ({
    name: `square-token-${name}`,
    model: new SquareToken(params),
    params
  }));
}

export default SquareToken;

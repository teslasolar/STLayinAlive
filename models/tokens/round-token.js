/**
 * Round Token
 * Classic circular token/base for miniatures and board games
 */

import { TokenBase, TOKEN_SIZES, TOKEN_PRESETS } from './token-base.js';
import { createCylinder, ops, transform } from '../../src/core/primitives.js';
import jscadModeling from '@jscad/modeling';

const { primitives, booleans, transforms } = jscadModeling;
const { cylinder, torus } = primitives;
const { subtract, union } = booleans;
const { translate } = transforms;

export class RoundToken extends TokenBase {
  constructor(params = {}, tagProvider = null) {
    super(params, tagProvider);
    this.name = 'round-token';
  }

  getDefaultParams() {
    return {
      ...super.getDefaultParams(),
      diameter: 25,
      height: 3,
      bevelRadius: 0.8,   // Rounded edge radius
      segments: 64,       // Smoothness (higher = smoother)
      grooveRings: 0,     // Decorative concentric grooves
      grooveDepth: 0.3,
      grooveWidth: 0.5,
    };
  }

  generateBaseShape() {
    const { diameter, height, segments, bevelRadius } = this.params;
    const radius = diameter / 2;

    // Main cylinder body
    let token = cylinder({
      radius,
      height,
      segments,
      center: [0, 0, 0]
    });

    // Add beveled edges using torus subtraction
    if (bevelRadius > 0) {
      // Top edge bevel
      const topBevel = torus({
        innerRadius: bevelRadius,
        outerRadius: radius + bevelRadius,
        innerSegments: 16,
        outerSegments: segments,
        innerRotation: Math.PI / 2
      });
      const topBevelPositioned = translate([0, 0, height / 2], topBevel);

      // Bottom edge bevel
      const bottomBevel = translate([0, 0, -height / 2], topBevel);

      // Create cutting tools for bevels
      const topCutter = cylinder({
        radius: radius + bevelRadius * 2,
        height: bevelRadius * 2,
        segments,
        center: [0, 0, height / 2 + bevelRadius]
      });
      const bottomCutter = cylinder({
        radius: radius + bevelRadius * 2,
        height: bevelRadius * 2,
        segments,
        center: [0, 0, -height / 2 - bevelRadius]
      });

      // Simple chamfer approach for efficiency
      const chamferTop = cylinder({
        radius: radius + bevelRadius,
        height: bevelRadius,
        segments,
        center: [0, 0, height / 2 + bevelRadius / 2]
      });
      const chamferBottom = cylinder({
        radius: radius + bevelRadius,
        height: bevelRadius,
        segments,
        center: [0, 0, -height / 2 - bevelRadius / 2]
      });
    }

    // Add decorative grooves
    if (this.params.grooveRings > 0) {
      token = this.addGrooves(token);
    }

    return token;
  }

  /**
   * Add concentric decorative grooves
   */
  addGrooves(token) {
    const { diameter, height, grooveRings, grooveDepth, grooveWidth, segments } = this.params;
    const radius = diameter / 2;
    const spacing = (radius - grooveWidth * 2) / (grooveRings + 1);

    for (let i = 1; i <= grooveRings; i++) {
      const grooveRadius = spacing * i;
      const groove = torus({
        innerRadius: grooveWidth / 2,
        outerRadius: grooveRadius,
        innerSegments: 8,
        outerSegments: segments
      });
      const groovePositioned = translate([0, 0, height / 2], groove);
      token = subtract(token, groovePositioned);
    }

    return token;
  }
}

/**
 * Factory function to create tokens of standard sizes
 */
export function createRoundToken(size = 'medium', customParams = {}) {
  const sizeParams = TOKEN_SIZES[size] || TOKEN_PRESETS[size] || TOKEN_SIZES.medium;
  return new RoundToken({
    ...sizeParams,
    ...customParams
  });
}

/**
 * Generate all standard round token sizes
 */
export function generateRoundTokenSet() {
  return Object.entries(TOKEN_SIZES).map(([name, params]) => ({
    name: `round-token-${name}`,
    model: new RoundToken(params),
    params
  }));
}

export default RoundToken;

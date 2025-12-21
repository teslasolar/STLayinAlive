/**
 * Token Base Class
 * Efficient base for generating small token format models
 * Supports batch generation of multiple sizes/variants
 */

import { ModelBase } from '../../src/core/model-base.js';
import { createCylinder, createBox, ops, transform } from '../../src/core/primitives.js';
import jscadModeling from '@jscad/modeling';

const { primitives, booleans, transforms } = jscadModeling;
const { polygon } = primitives;
const { extrudeLinear } = jscadModeling.extrusions;
const { union, subtract } = booleans;
const { translate, rotate, scale } = transforms;

/**
 * Standard token sizes (in mm)
 */
export const TOKEN_SIZES = {
  micro: { diameter: 15, height: 2 },
  tiny: { diameter: 20, height: 2 },
  small: { diameter: 25, height: 3 },
  medium: { diameter: 32, height: 3 },
  large: { diameter: 40, height: 4 },
  xlarge: { diameter: 50, height: 4 },
};

/**
 * Common token presets for tabletop gaming
 */
export const TOKEN_PRESETS = {
  // D&D/Pathfinder standard base sizes
  'dnd-small': { diameter: 20, height: 3 },
  'dnd-medium': { diameter: 25, height: 3 },
  'dnd-large': { diameter: 50, height: 4 },
  'dnd-huge': { diameter: 75, height: 5 },
  'dnd-gargantuan': { diameter: 100, height: 6 },

  // Warhammer bases
  'wh-25mm': { diameter: 25, height: 3 },
  'wh-32mm': { diameter: 32, height: 3 },
  'wh-40mm': { diameter: 40, height: 4 },
  'wh-50mm': { diameter: 50, height: 4 },
  'wh-60mm': { diameter: 60, height: 5 },

  // Board game tokens
  'poker-chip': { diameter: 39, height: 3.3 },
  'counter-small': { diameter: 16, height: 2 },
  'counter-medium': { diameter: 22, height: 2.5 },
};

/**
 * Token Base Class
 */
export class TokenBase extends ModelBase {
  constructor(params = {}, tagProvider = null) {
    super('token', params, tagProvider);
  }

  getDefaultParams() {
    return {
      diameter: 25,      // Token diameter in mm
      height: 3,         // Token height/thickness in mm
      bevel: 0.5,        // Edge bevel size
      textDepth: 0.5,    // Engraving depth
      lipHeight: 0,      // Optional raised lip
      lipWidth: 1,       // Lip width
      hollow: false,     // Hollow center
      hollowWall: 1.5,   // Wall thickness if hollow
    };
  }

  /**
   * Generate base token shape - override in subclasses
   */
  generateBaseShape() {
    throw new Error('generateBaseShape() must be implemented by subclass');
  }

  /**
   * Add optional lip/rim to token
   * Override in subclasses for different shapes
   */
  addLip(base) {
    if (!this.params.lipHeight || this.params.lipHeight <= 0) return base;

    // Only apply to round tokens with diameter
    const { diameter, height, lipHeight, lipWidth } = this.params;
    if (!diameter) return base; // Skip for non-round tokens

    const outerRim = createCylinder(diameter / 2, lipHeight, {
      center: [0, 0, height / 2 + lipHeight / 2]
    });
    const innerCut = createCylinder(diameter / 2 - lipWidth, lipHeight + 0.1, {
      center: [0, 0, height / 2 + lipHeight / 2]
    });
    const lip = subtract(outerRim, innerCut);
    return union(base, lip);
  }

  /**
   * Make token hollow (saves material)
   * Override in subclasses for different shapes
   */
  makeHollow(base) {
    if (!this.params.hollow) return base;

    // Only apply to round tokens with diameter
    const { diameter, height, hollowWall } = this.params;
    if (!diameter) return base; // Skip for non-round tokens

    const innerCavity = createCylinder(
      diameter / 2 - hollowWall,
      height - hollowWall,
      { center: [0, 0, -hollowWall / 2] }
    );
    return subtract(base, innerCavity);
  }

  generate() {
    let token = this.generateBaseShape();
    token = this.addLip(token);
    token = this.makeHollow(token);
    return token;
  }

  /**
   * Create a batch of tokens with different sizes
   */
  static generateBatch(TokenClass, sizes = Object.keys(TOKEN_SIZES)) {
    const batch = [];
    for (const sizeName of sizes) {
      const size = TOKEN_SIZES[sizeName] || TOKEN_PRESETS[sizeName];
      if (size) {
        const token = new TokenClass({
          diameter: size.diameter,
          height: size.height
        });
        batch.push({
          name: `${token.name}-${sizeName}`,
          size: sizeName,
          params: { ...size },
          geometry: token.generate()
        });
      }
    }
    return batch;
  }
}

/**
 * Create hexagon points for hex tokens
 */
export function createHexPoints(radius, flatTop = true) {
  const points = [];
  const startAngle = flatTop ? Math.PI / 6 : 0;
  for (let i = 0; i < 6; i++) {
    const angle = startAngle + (i * Math.PI) / 3;
    points.push([
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    ]);
  }
  return points;
}

/**
 * Create polygon-based token shape
 */
export function createPolygonToken(sides, radius, height) {
  const points = [];
  const angleOffset = Math.PI / 2; // Start from top
  for (let i = 0; i < sides; i++) {
    const angle = angleOffset + (i * 2 * Math.PI) / sides;
    points.push([
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    ]);
  }
  const shape = polygon({ points });
  return extrudeLinear({ height }, shape);
}

export default TokenBase;

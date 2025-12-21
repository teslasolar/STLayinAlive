/**
 * Hex Token
 * Hexagonal token for hex-based games (Settlers of Catan, wargames, etc.)
 */

import { TokenBase, createHexPoints, createPolygonToken } from './token-base.js';
import { ops, transform } from '../../src/core/primitives.js';
import jscadModeling from '@jscad/modeling';

const { primitives, booleans, transforms, extrusions } = jscadModeling;
const { polygon, cylinder } = primitives;
const { subtract, union } = booleans;
const { translate, rotate } = transforms;
const { extrudeLinear } = extrusions;

/**
 * Hex token sizes (flat-to-flat diameter in mm)
 */
export const HEX_SIZES = {
  micro: { diameter: 15, height: 2 },
  tiny: { diameter: 20, height: 2 },
  small: { diameter: 25, height: 3 },
  medium: { diameter: 32, height: 3 },
  large: { diameter: 40, height: 4 },
  xlarge: { diameter: 50, height: 4 },
  // Common hex game sizes
  'catan': { diameter: 72, height: 3 },           // Settlers of Catan tile size
  'battletech': { diameter: 32, height: 3 },      // Battletech hex
  'hex-1inch': { diameter: 25.4, height: 3 },     // 1" hex
  'hex-1.5inch': { diameter: 38.1, height: 3 },   // 1.5" hex
};

export class HexToken extends TokenBase {
  constructor(params = {}, tagProvider = null) {
    super(params, tagProvider);
    this.name = 'hex-token';
  }

  getDefaultParams() {
    return {
      diameter: 32,       // Flat-to-flat diameter
      height: 3,
      flatTop: true,      // Flat top (true) vs pointy top (false)
      bevel: 0.5,
      centerHole: false,
      holeDiameter: 3,
      edgeChamfer: 0,     // Chamfer on hex edges
      numberSlot: false,  // Slot for number tile (like Catan)
      slotDiameter: 20,
      slotDepth: 1,
    };
  }

  generateBaseShape() {
    const { diameter, height, flatTop } = this.params;

    // Calculate circumradius from flat-to-flat diameter
    // For a flat-top hex: diameter = sqrt(3) * circumradius
    // For a pointy-top hex: diameter = 2 * circumradius
    const circumradius = flatTop
      ? diameter / Math.sqrt(3)
      : diameter / 2;

    // Create hex points
    const points = createHexPoints(circumradius, flatTop);
    const hexShape = polygon({ points });

    // Extrude to create 3D hex
    let token = extrudeLinear({ height }, hexShape);

    // Center on Z axis
    token = translate([0, 0, -height / 2], token);

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

    // Add number slot (for Catan-style tiles)
    if (this.params.numberSlot) {
      const slot = cylinder({
        radius: this.params.slotDiameter / 2,
        height: this.params.slotDepth,
        segments: 32,
        center: [0, 0, height / 2 - this.params.slotDepth / 2 + 0.01]
      });
      token = subtract(token, slot);
    }

    return token;
  }
}

/**
 * Factory function to create hex tokens of standard sizes
 */
export function createHexToken(size = 'medium', customParams = {}) {
  const sizeParams = HEX_SIZES[size] || HEX_SIZES.medium;
  return new HexToken({
    diameter: sizeParams.diameter,
    height: sizeParams.height,
    ...customParams
  });
}

/**
 * Generate all standard hex token sizes
 */
export function generateHexTokenSet() {
  return Object.entries(HEX_SIZES).map(([name, params]) => ({
    name: `hex-token-${name}`,
    model: new HexToken(params),
    params
  }));
}

/**
 * Generate a hex grid of tokens (for tile-based games)
 */
export function generateHexGrid(rows, cols, params = {}) {
  const tokens = [];
  const { diameter = 32, height = 3 } = params;
  const circumradius = diameter / Math.sqrt(3);

  // Hex grid spacing
  const horizSpacing = diameter;
  const vertSpacing = circumradius * 1.5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const xOffset = col * horizSpacing + (row % 2) * (horizSpacing / 2);
      const yOffset = row * vertSpacing;

      tokens.push({
        name: `hex-${row}-${col}`,
        position: [xOffset, yOffset, 0],
        model: new HexToken({ diameter, height, ...params })
      });
    }
  }

  return tokens;
}

export default HexToken;

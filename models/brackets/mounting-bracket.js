/**
 * Example: Simple Mounting Bracket
 * Demonstrates parametric model with tag provider integration
 */

import { ModelBase } from '../core/model-base.js';
import { createBox, createMountingHole, ops } from '../core/primitives.js';

export class MountingBracket extends ModelBase {
  getDefaultParams() {
    return {
      width: 50,        // mm
      height: 30,       // mm
      thickness: 3,     // mm
      holeCount: 2,
      holeDiameter: 5,  // mm
      holeSpacing: 30   // mm
    };
  }

  generate() {
    const { width, height, thickness, holeCount, holeDiameter, holeSpacing } = this.params;

    // Create base bracket
    const base = createBox(width, height, thickness, { round: 1 });

    // Create mounting holes
    const holes = [];
    const offset = -((holeCount - 1) * holeSpacing) / 2;
    
    for (let i = 0; i < holeCount; i++) {
      const x = offset + i * holeSpacing;
      const hole = createMountingHole(holeDiameter, thickness + 2, [x, 0, -1]);
      holes.push(hole);
    }

    // Subtract holes from base
    const bracket = ops.subtract(base, ...holes);

    return bracket;
  }
}

export default MountingBracket;

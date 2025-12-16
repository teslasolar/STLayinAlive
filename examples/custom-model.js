/**
 * Example: Creating a Custom Model
 * Step-by-step guide to building parametric models
 */

import { ModelBase } from '../src/core/model-base.js';
import { createBox, createCylinder, ops, transform } from '../src/core/primitives.js';

/**
 * Example: Simple Box with Lid
 */
export class SimpleBox extends ModelBase {
  getDefaultParams() {
    return {
      width: 50,
      depth: 40,
      height: 30,
      wallThickness: 2,
      lidHeight: 5
    };
  }

  generate() {
    const { width, depth, height, wallThickness, lidHeight } = this.params;

    // Create outer box
    const outer = createBox(width, depth, height);

    // Create inner cavity
    const inner = createBox(
      width - 2 * wallThickness,
      depth - 2 * wallThickness,
      height - wallThickness + 1
    );
    const innerCavity = transform.translate([0, 0, wallThickness], inner);

    // Subtract cavity from outer
    const box = ops.subtract(outer, innerCavity);

    return box;
  }
}

/**
 * Example: Gear (more complex)
 */
export class SimpleGear extends ModelBase {
  getDefaultParams() {
    return {
      teeth: 20,
      outerRadius: 30,
      innerRadius: 10,
      thickness: 5,
      toothHeight: 3
    };
  }

  generate() {
    const { teeth, outerRadius, innerRadius, thickness, toothHeight } = this.params;

    // Create gear body (simplified - real gear needs proper involute teeth)
    const body = createCylinder(outerRadius, thickness);
    
    // Create center hole
    const hole = createCylinder(innerRadius, thickness + 2);
    const centerHole = transform.translate([0, 0, -1], hole);

    // Subtract hole from body
    const gear = ops.subtract(body, centerHole);

    // In a real implementation, you would add tooth geometry here
    // This is a simplified example

    return gear;
  }
}

// Usage example
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== Custom Model Examples ===\n');

  const box = new SimpleBox({ width: 60, height: 35 });
  console.log('Simple Box created with params:', box.params);
  box.generate();
  console.log('✓ Geometry generated');

  const gear = new SimpleGear({ teeth: 24, outerRadius: 40 });
  console.log('\nSimple Gear created with params:', gear.params);
  gear.generate();
  console.log('✓ Geometry generated');

  console.log('\nTo use these models:');
  console.log('1. Add them to ModelRegistry in models/index.js');
  console.log('2. Run npm run build to generate STLs');
  console.log('3. They will appear in the gallery automatically');
}

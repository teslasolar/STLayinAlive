/**
 * Example: Konomi Systems Enclosure
 * Parametric electronics enclosure with ventilation
 */

import { ModelBase } from '../../src/core/model-base.js';
import { createBox, createMountingHole, createHolePattern, ops, transform } from '../../src/core/primitives.js';

export class KonomiEnclosure extends ModelBase {
  getDefaultParams() {
    return {
      width: 100,           // mm - internal width
      depth: 80,            // mm - internal depth
      height: 40,           // mm - internal height
      wallThickness: 2,     // mm
      ventHoleSize: 3,      // mm
      ventHoleSpacing: 6,   // mm
      mountingHoles: true,
      cornerRadius: 3       // mm
    };
  }

  generate() {
    const { 
      width, depth, height, wallThickness, 
      ventHoleSize, ventHoleSpacing, mountingHoles, cornerRadius 
    } = this.params;

    // Outer dimensions
    const outerWidth = width + 2 * wallThickness;
    const outerDepth = depth + 2 * wallThickness;
    const outerHeight = height + wallThickness;

    // Create outer shell
    const outer = createBox(outerWidth, outerDepth, outerHeight, { 
      round: cornerRadius 
    });

    // Create inner cavity
    const inner = createBox(width, depth, height + 1, { 
      round: cornerRadius * 0.7 
    });
    const innerCavity = transform.translate([0, 0, wallThickness], inner);

    // Subtract cavity from shell
    let enclosure = ops.subtract(outer, innerCavity);

    // Add ventilation holes on sides
    const ventCount = Math.floor(depth / ventHoleSpacing);
    const ventPattern = createHolePattern(
      ventHoleSize, 
      wallThickness + 2, 
      ventHoleSpacing, 
      ventCount, 
      'y'
    );

    // Position vent holes on left side
    const leftVents = transform.translate(
      [-outerWidth/2 - 1, 0, outerHeight/2],
      transform.rotate([0, Math.PI/2, 0], ventPattern)
    );

    // Position vent holes on right side
    const rightVents = transform.translate(
      [outerWidth/2 + 1, 0, outerHeight/2],
      transform.rotate([0, -Math.PI/2, 0], ventPattern)
    );

    enclosure = ops.subtract(enclosure, leftVents, rightVents);

    // Add mounting holes in corners
    if (mountingHoles) {
      const mountHoles = [];
      const inset = 5;
      const positions = [
        [-width/2 + inset, -depth/2 + inset, -1],
        [width/2 - inset, -depth/2 + inset, -1],
        [-width/2 + inset, depth/2 - inset, -1],
        [width/2 - inset, depth/2 - inset, -1]
      ];

      positions.forEach(pos => {
        mountHoles.push(createMountingHole(3, wallThickness + 2, pos));
      });

      enclosure = ops.subtract(enclosure, ...mountHoles);
    }

    return enclosure;
  }
}

export default KonomiEnclosure;

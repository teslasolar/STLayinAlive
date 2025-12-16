/**
 * Example: Cable Management Clip
 * Simple parametric cable clip
 */

import { ModelBase } from '../../src/core/model-base.js';
import { createBox, createCylinder, ops, transform } from '../../src/core/primitives.js';

export class CableClip extends ModelBase {
  getDefaultParams() {
    return {
      cableDiameter: 6,     // mm
      clipThickness: 2,     // mm
      clipHeight: 10,       // mm
      baseWidth: 15,        // mm
      baseThickness: 3,     // mm
      screwHoleDiameter: 3  // mm
    };
  }

  generate() {
    const { 
      cableDiameter, clipThickness, clipHeight, 
      baseWidth, baseThickness, screwHoleDiameter 
    } = this.params;

    // Create base
    const base = createBox(baseWidth, baseWidth, baseThickness);

    // Create clip body
    const clipWidth = cableDiameter + 2 * clipThickness;
    const clipBody = createBox(clipWidth, clipThickness, clipHeight);
    const positionedClip = transform.translate([0, 0, baseThickness + clipHeight/2], clipBody);

    // Create cable channel (semicircle)
    const cableChannel = createCylinder(
      cableDiameter / 2, 
      clipHeight + 2, 
      { segments: 32 }
    );
    const rotatedChannel = transform.rotate([Math.PI/2, 0, 0], cableChannel);
    const positionedChannel = transform.translate(
      [0, clipThickness/2, baseThickness + clipHeight/2],
      rotatedChannel
    );

    // Create screw hole
    const screwHole = createCylinder(screwHoleDiameter / 2, baseThickness + 2);
    const positionedHole = transform.translate([0, 0, -1], screwHole);

    // Combine parts
    let clip = ops.union(base, positionedClip);
    clip = ops.subtract(clip, positionedChannel, positionedHole);

    return clip;
  }
}

export default CableClip;

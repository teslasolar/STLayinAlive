/**
 * 3D Primitives using JSCAD
 * Wrapper functions for common 3D operations
 */

import { primitives, booleans, transforms, extrusions } from '@jscad/modeling';

const { cube, cuboid, cylinder, sphere, roundedCuboid } = primitives;
const { union, subtract, intersect } = booleans;
const { translate, rotate, scale, center } = transforms;
const { extrudeLinear, extrudeRotate } = extrusions;

/**
 * Create a box with dimensions
 */
export function createBox(width, height, depth, options = {}) {
  const box = cuboid({
    size: [width, height, depth],
    center: options.center ?? [0, 0, 0]
  });

  if (options.round) {
    return roundedCuboid({
      size: [width, height, depth],
      roundRadius: options.round,
      center: options.center ?? [0, 0, 0]
    });
  }

  return box;
}

/**
 * Create a cylinder
 */
export function createCylinder(radius, height, options = {}) {
  return cylinder({
    radius,
    height,
    center: options.center ?? [0, 0, 0],
    segments: options.segments ?? 32
  });
}

/**
 * Create a sphere
 */
export function createSphere(radius, options = {}) {
  return sphere({
    radius,
    center: options.center ?? [0, 0, 0],
    segments: options.segments ?? 32
  });
}

/**
 * Create a mounting hole (cylinder subtraction)
 */
export function createMountingHole(diameter, depth, position = [0, 0, 0]) {
  const hole = createCylinder(diameter / 2, depth, { segments: 32 });
  return translate(position, hole);
}

/**
 * Create an array of holes along a line
 */
export function createHolePattern(diameter, depth, spacing, count, axis = 'x') {
  const holes = [];
  const offset = -((count - 1) * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const pos = axis === 'x' 
      ? [offset + i * spacing, 0, 0]
      : axis === 'y'
      ? [0, offset + i * spacing, 0]
      : [0, 0, offset + i * spacing];
    
    holes.push(createMountingHole(diameter, depth, pos));
  }

  return union(...holes);
}

/**
 * Create a fillet (rounded edge) between two surfaces
 */
export function createFillet(radius, length, position = [0, 0, 0]) {
  const fillet = createCylinder(radius, length, { segments: 32 });
  return translate(position, rotate([0, Math.PI / 2, 0], fillet));
}

/**
 * Boolean operations helpers
 */
export const ops = {
  union,
  subtract,
  intersect
};

/**
 * Transform operations helpers
 */
export const transform = {
  translate,
  rotate,
  scale,
  center
};

/**
 * Extrusion operations
 */
export const extrude = {
  linear: extrudeLinear,
  rotate: extrudeRotate
};

/**
 * Common utility functions
 */
export function mmToUnits(mm) {
  return mm; // JSCAD uses mm by default
}

export function inchesToMm(inches) {
  return inches * 25.4;
}

export default {
  createBox,
  createCylinder,
  createSphere,
  createMountingHole,
  createHolePattern,
  createFillet,
  ops,
  transform,
  extrude,
  mmToUnits,
  inchesToMm
};

/**
 * Model Registry
 * Central registry for all available 3D models
 */

import { MountingBracket } from './brackets/mounting-bracket.js';
import { KonomiEnclosure } from './konomi-parts/enclosure.js';
import { CableClip } from './accessories/cable-clip.js';

export const ModelRegistry = {
  brackets: {
    'mounting-bracket': MountingBracket
  },
  konomiParts: {
    'enclosure': KonomiEnclosure
  },
  accessories: {
    'cable-clip': CableClip
  }
};

/**
 * Get all model classes
 */
export function getAllModels() {
  const models = [];
  Object.values(ModelRegistry).forEach(category => {
    Object.entries(category).forEach(([name, ModelClass]) => {
      models.push({ name, ModelClass, category: getCategoryName(ModelClass) });
    });
  });
  return models;
}

/**
 * Get category name for a model
 */
function getCategoryName(ModelClass) {
  for (const [category, models] of Object.entries(ModelRegistry)) {
    if (Object.values(models).includes(ModelClass)) {
      return category;
    }
  }
  return 'unknown';
}

/**
 * Create model instance by name
 */
export function createModel(name, params = {}, tagProvider = null) {
  for (const category of Object.values(ModelRegistry)) {
    if (category[name]) {
      return new category[name](params, tagProvider);
    }
  }
  throw new Error(`Model "${name}" not found in registry`);
}

export default ModelRegistry;

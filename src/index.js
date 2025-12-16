/**
 * Main entry point for STLayinAlive library
 */

export * from './core/index.js';
export * from './exporters/index.js';
export * from './tag-provider/index.js';

// Convenience exports
export { ModelBase } from './core/model-base.js';
export { TagProvider, TagGroup } from './tag-provider/index.js';
export { exportSTL, saveSTL, saveSTLNode } from './exporters/index.js';

export default {
  version: '1.0.0',
  name: 'STLayinAlive'
};

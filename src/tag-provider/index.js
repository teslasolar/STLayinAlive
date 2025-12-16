/**
 * Tag Provider System - SCADA-style real-time value management
 * Main exports for the tag provider module
 */

export { TagProvider } from './tag-provider.js';
export { TagGroup } from './tag-group.js';

/**
 * Create a global tag provider instance
 */
export function createGlobalTagProvider() {
  if (typeof window !== 'undefined' && !window.__tagProvider) {
    const { TagProvider } = await import('./tag-provider.js');
    window.__tagProvider = new TagProvider();
  }
  return typeof window !== 'undefined' ? window.__tagProvider : new TagProvider();
}

export default { TagProvider, TagGroup, createGlobalTagProvider };

/**
 * Tag Group - Organize related tags together
 */

export class TagGroup {
  constructor(name, tagProvider) {
    this.name = name;
    this.tagProvider = tagProvider;
    this.tags = new Map();
  }

  /**
   * Add tag to this group
   * @param {string} localName - Local tag name (will be prefixed with group name)
   * @param {Object} config - Tag configuration
   */
  addTag(localName, config = {}) {
    const fullName = `${this.name}.${localName}`;
    const tag = this.tagProvider.registerTag(fullName, config);
    this.tags.set(localName, fullName);
    return tag;
  }

  /**
   * Set value using local tag name
   */
  setValue(localName, value, options) {
    const fullName = this.tags.get(localName);
    if (!fullName) {
      throw new Error(`Tag "${localName}" not found in group "${this.name}"`);
    }
    return this.tagProvider.setValue(fullName, value, options);
  }

  /**
   * Get value using local tag name
   */
  getValue(localName) {
    const fullName = this.tags.get(localName);
    return fullName ? this.tagProvider.getValue(fullName) : undefined;
  }

  /**
   * Subscribe to tag in this group
   */
  subscribe(localName, callback) {
    const fullName = this.tags.get(localName);
    if (!fullName) {
      throw new Error(`Tag "${localName}" not found in group "${this.name}"`);
    }
    return this.tagProvider.subscribe(fullName, callback);
  }

  /**
   * Get all values in this group
   */
  getAllValues() {
    const values = {};
    this.tags.forEach((fullName, localName) => {
      values[localName] = this.tagProvider.getValue(fullName);
    });
    return values;
  }

  /**
   * Set multiple values at once
   */
  setValues(values) {
    Object.entries(values).forEach(([localName, value]) => {
      this.setValue(localName, value);
    });
  }
}

export default TagGroup;

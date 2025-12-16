/**
 * Base class for all parametric 3D models
 * Integrates with tag provider system
 */

import { TagGroup } from '../tag-provider/tag-group.js';

export class ModelBase {
  constructor(name, params = {}, tagProvider = null) {
    this.name = name;
    this.params = { ...this.getDefaultParams(), ...params };
    this.geometry = null;
    this.metadata = {
      created: Date.now(),
      modified: Date.now(),
      version: '1.0.0'
    };

    // Initialize tag group if provider given
    if (tagProvider) {
      this.tagGroup = new TagGroup(name, tagProvider);
      this.registerTags();
      this.bindTagsToParams();
    }
  }

  /**
   * Override to provide default parameters
   */
  getDefaultParams() {
    return {};
  }

  /**
   * Register model parameters as tags
   * Override to customize tag registration
   */
  registerTags() {
    if (!this.tagGroup) return;

    Object.entries(this.getDefaultParams()).forEach(([key, value]) => {
      this.tagGroup.addTag(key, {
        defaultValue: value,
        dataType: typeof value,
        description: `${this.name} ${key} parameter`
      });
    });
  }

  /**
   * Bind tag changes to parameter updates
   */
  bindTagsToParams() {
    if (!this.tagGroup) return;

    Object.keys(this.params).forEach(key => {
      this.tagGroup.subscribe(key, (newValue) => {
        this.params[key] = newValue;
        this.onParameterChange(key, newValue);
      });
    });
  }

  /**
   * Called when a parameter changes via tag system
   * Override for custom behavior
   */
  onParameterChange(paramName, newValue) {
    this.metadata.modified = Date.now();
    // Override in subclass to regenerate geometry
  }

  /**
   * Update a parameter value
   */
  setParam(key, value) {
    this.params[key] = value;
    if (this.tagGroup) {
      this.tagGroup.setValue(key, value);
    }
    this.metadata.modified = Date.now();
  }

  /**
   * Get a parameter value
   */
  getParam(key) {
    return this.params[key];
  }

  /**
   * Update multiple parameters at once
   */
  setParams(params) {
    Object.entries(params).forEach(([key, value]) => {
      this.setParam(key, value);
    });
  }

  /**
   * Generate 3D geometry - must be implemented by subclass
   * @returns {Object} JSCAD geometry
   */
  generate() {
    throw new Error('generate() must be implemented by subclass');
  }

  /**
   * Regenerate geometry with current parameters
   */
  regenerate() {
    this.geometry = this.generate();
    this.metadata.modified = Date.now();
    return this.geometry;
  }

  /**
   * Get model metadata
   */
  getMetadata() {
    return {
      ...this.metadata,
      name: this.name,
      params: this.params
    };
  }

  /**
   * Serialize model to JSON
   */
  toJSON() {
    return {
      name: this.name,
      params: this.params,
      metadata: this.metadata
    };
  }

  /**
   * Load model from JSON
   */
  static fromJSON(json, tagProvider = null) {
    const model = new this(json.name, json.params, tagProvider);
    model.metadata = json.metadata;
    return model;
  }
}

export default ModelBase;

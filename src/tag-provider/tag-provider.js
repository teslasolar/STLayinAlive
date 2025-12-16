/**
 * Tag Provider - SCADA-style real-time value management system
 * Handles parameter changes, subscriptions, and data quality
 */

export class TagProvider {
  constructor() {
    this.tags = new Map();
    this.subscribers = new Map();
    this.history = new Map();
    this.alarms = new Map();
  }

  /**
   * Register a new tag with metadata
   * @param {string} tagName - Fully qualified tag name (e.g., 'bracket.width')
   * @param {Object} config - Tag configuration
   */
  registerTag(tagName, config = {}) {
    const tag = {
      name: tagName,
      value: config.defaultValue ?? null,
      dataType: config.dataType ?? 'number',
      unit: config.unit ?? '',
      min: config.min ?? null,
      max: config.max ?? null,
      quality: 'GOOD',
      timestamp: Date.now(),
      description: config.description ?? '',
      writeable: config.writeable ?? true,
      ...config
    };

    this.tags.set(tagName, tag);
    this.history.set(tagName, []);
    
    return tag;
  }

  /**
   * Set tag value with validation and subscriber notification
   * @param {string} tagName - Tag name
   * @param {*} value - New value
   * @param {Object} options - Additional options
   */
  setValue(tagName, value, options = {}) {
    const tag = this.tags.get(tagName);
    
    if (!tag) {
      console.warn(`Tag "${tagName}" not registered. Auto-registering...`);
      this.registerTag(tagName, { defaultValue: value });
      return this.setValue(tagName, value, options);
    }

    if (!tag.writeable && !options.force) {
      throw new Error(`Tag "${tagName}" is read-only`);
    }

    // Validate range
    if (tag.min !== null && value < tag.min) {
      this.setAlarm(tagName, 'LOW', `Value ${value} below minimum ${tag.min}`);
      value = tag.min;
    }
    if (tag.max !== null && value > tag.max) {
      this.setAlarm(tagName, 'HIGH', `Value ${value} above maximum ${tag.max}`);
      value = tag.max;
    }

    // Store old value
    const oldValue = tag.value;
    
    // Update tag
    tag.value = value;
    tag.timestamp = Date.now();
    tag.quality = options.quality ?? 'GOOD';

    // Store in history
    const history = this.history.get(tagName);
    history.push({
      value,
      timestamp: tag.timestamp,
      quality: tag.quality
    });

    // Limit history size
    if (history.length > 1000) {
      history.shift();
    }

    // Notify subscribers
    this.notifySubscribers(tagName, value, oldValue);

    return tag;
  }

  /**
   * Get tag value
   * @param {string} tagName - Tag name
   * @returns {*} Tag value
   */
  getValue(tagName) {
    const tag = this.tags.get(tagName);
    return tag ? tag.value : undefined;
  }

  /**
   * Get full tag object with metadata
   * @param {string} tagName - Tag name
   * @returns {Object} Tag object
   */
  getTag(tagName) {
    return this.tags.get(tagName);
  }

  /**
   * Subscribe to tag changes
   * @param {string|Array} tagNames - Tag name(s) to subscribe to
   * @param {Function} callback - Callback function(value, oldValue, tag)
   * @returns {Function} Unsubscribe function
   */
  subscribe(tagNames, callback) {
    const tags = Array.isArray(tagNames) ? tagNames : [tagNames];
    const subscriptionId = `sub_${Date.now()}_${Math.random()}`;

    tags.forEach(tagName => {
      if (!this.subscribers.has(tagName)) {
        this.subscribers.set(tagName, new Map());
      }
      this.subscribers.get(tagName).set(subscriptionId, callback);
    });

    // Return unsubscribe function
    return () => {
      tags.forEach(tagName => {
        const subs = this.subscribers.get(tagName);
        if (subs) {
          subs.delete(subscriptionId);
        }
      });
    };
  }

  /**
   * Notify all subscribers of a tag change
   * @private
   */
  notifySubscribers(tagName, value, oldValue) {
    const subs = this.subscribers.get(tagName);
    if (!subs) return;

    const tag = this.tags.get(tagName);
    subs.forEach(callback => {
      try {
        callback(value, oldValue, tag);
      } catch (error) {
        console.error(`Error in subscriber callback for ${tagName}:`, error);
      }
    });
  }

  /**
   * Set an alarm for a tag
   * @param {string} tagName - Tag name
   * @param {string} severity - Alarm severity (LOW, HIGH, CRITICAL)
   * @param {string} message - Alarm message
   */
  setAlarm(tagName, severity, message) {
    if (!this.alarms.has(tagName)) {
      this.alarms.set(tagName, []);
    }

    this.alarms.get(tagName).push({
      severity,
      message,
      timestamp: Date.now(),
      acknowledged: false
    });

    console.warn(`[ALARM ${severity}] ${tagName}: ${message}`);
  }

  /**
   * Get tag history
   * @param {string} tagName - Tag name
   * @param {number} limit - Maximum number of records
   * @returns {Array} History records
   */
  getHistory(tagName, limit = 100) {
    const history = this.history.get(tagName) || [];
    return history.slice(-limit);
  }

  /**
   * Get all tags matching a pattern
   * @param {string} pattern - Glob pattern (e.g., 'bracket.*')
   * @returns {Array} Matching tags
   */
  getTags(pattern = '*') {
    if (pattern === '*') {
      return Array.from(this.tags.values());
    }

    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.tags.values()).filter(tag => regex.test(tag.name));
  }

  /**
   * Export tag values as JSON
   * @param {Array} tagNames - Optional list of tag names to export
   * @returns {Object} Tag values
   */
  exportValues(tagNames = null) {
    const tags = tagNames || Array.from(this.tags.keys());
    const result = {};

    tags.forEach(tagName => {
      const tag = this.tags.get(tagName);
      if (tag) {
        result[tagName] = {
          value: tag.value,
          quality: tag.quality,
          timestamp: tag.timestamp
        };
      }
    });

    return result;
  }

  /**
   * Import tag values from JSON
   * @param {Object} data - Tag values to import
   */
  importValues(data) {
    Object.entries(data).forEach(([tagName, tagData]) => {
      if (typeof tagData === 'object' && 'value' in tagData) {
        this.setValue(tagName, tagData.value, {
          quality: tagData.quality,
          force: true
        });
      } else {
        this.setValue(tagName, tagData, { force: true });
      }
    });
  }

  /**
   * Clear all tags and subscriptions
   */
  clear() {
    this.tags.clear();
    this.subscribers.clear();
    this.history.clear();
    this.alarms.clear();
  }
}

export default TagProvider;

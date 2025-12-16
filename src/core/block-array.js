/**
 * BlockArray - 3D Compute Grid with LLM@coordinates
 * Sparse storage for 1000³ efficiency
 *
 * Features:
 * - Sparse storage using Map (only store non-zero values)
 * - LLM placement at specific coordinates
 * - Neighbor queries (6-connected, 26-connected)
 * - Efficient iteration over active cells
 */

import { FemtoLLM } from './femto-llm.js';

export class BlockArray {
  constructor(dimensions = [1000, 1000, 1000], templateId = null) {
    this.dims = dimensions;
    this.templateId = templateId;

    // Sparse storage: "x,y,z" -> value
    this.data = new Map();

    // Sparse LLM placement: "x,y,z" -> FemtoLLM instance
    this.llms = new Map();

    // Metadata
    this.metadata = {
      created: Date.now(),
      modified: Date.now(),
      totalCubes: dimensions[0] * dimensions[1] * dimensions[2],
      activeCubes: 0,
      activeLLMs: 0
    };

    // Statistics
    this.stats = {
      reads: 0,
      writes: 0,
      llmProcesses: 0,
      neighborQueries: 0
    };
  }

  /**
   * Convert coordinates to storage key
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @returns {string} Storage key
   */
  key(x, y, z) {
    return `${x},${y},${z}`;
  }

  /**
   * Parse storage key to coordinates
   * @param {string} key - Storage key
   * @returns {Array} [x, y, z]
   */
  parseKey(key) {
    return key.split(',').map(Number);
  }

  /**
   * Validate coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @returns {boolean} True if valid
   */
  isValid(x, y, z) {
    return (
      x >= 0 && x < this.dims[0] &&
      y >= 0 && y < this.dims[1] &&
      z >= 0 && z < this.dims[2]
    );
  }

  /**
   * Set value at coordinate
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @param {*} value - Value to set
   */
  set(x, y, z, value) {
    if (!this.isValid(x, y, z)) {
      throw new Error(`Invalid coordinates: (${x}, ${y}, ${z})`);
    }

    const k = this.key(x, y, z);
    const wasActive = this.data.has(k);

    if (value === 0 || value === null || value === undefined) {
      // Remove from sparse storage
      this.data.delete(k);
      if (wasActive) {
        this.metadata.activeCubes--;
      }
    } else {
      this.data.set(k, value);
      if (!wasActive) {
        this.metadata.activeCubes++;
      }
    }

    this.metadata.modified = Date.now();
    this.stats.writes++;
  }

  /**
   * Get value at coordinate
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @returns {*} Value at coordinate (0 if not set)
   */
  get(x, y, z) {
    if (!this.isValid(x, y, z)) {
      return undefined;
    }

    this.stats.reads++;
    return this.data.get(this.key(x, y, z)) || 0;
  }

  /**
   * Check if coordinate has active value
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @returns {boolean} True if active
   */
  isActive(x, y, z) {
    return this.data.has(this.key(x, y, z));
  }

  /**
   * Place LLM at coordinate
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @param {FemtoLLM} llm - LLM instance (creates new if null)
   */
  placeLLM(x, y, z, llm = null) {
    if (!this.isValid(x, y, z)) {
      throw new Error(`Invalid coordinates: (${x}, ${y}, ${z})`);
    }

    const k = this.key(x, y, z);
    const hadLLM = this.llms.has(k);

    this.llms.set(k, llm || new FemtoLLM());

    if (!hadLLM) {
      this.metadata.activeLLMs++;
    }

    this.metadata.modified = Date.now();
  }

  /**
   * Remove LLM from coordinate
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  removeLLM(x, y, z) {
    const k = this.key(x, y, z);
    if (this.llms.delete(k)) {
      this.metadata.activeLLMs--;
      this.metadata.modified = Date.now();
    }
  }

  /**
   * Get LLM at coordinate
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @returns {FemtoLLM|null} LLM instance or null
   */
  getLLM(x, y, z) {
    return this.llms.get(this.key(x, y, z)) || null;
  }

  /**
   * Process text with LLM at coordinate
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @param {string} text - Text to process
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Processing result
   */
  async processAt(x, y, z, text, context = {}) {
    const llm = this.getLLM(x, y, z);
    if (!llm) {
      throw new Error(`No LLM at (${x}, ${y}, ${z})`);
    }

    this.stats.llmProcesses++;

    const result = await llm.process(text, {
      ...context,
      position: [x, y, z],
      arrayId: this.templateId
    });

    return result;
  }

  /**
   * Get 6-connected neighbors (face-adjacent)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @returns {Array} Array of [x, y, z] neighbor coordinates
   */
  neighbors6(x, y, z) {
    this.stats.neighborQueries++;

    const deltas = [
      [1, 0, 0],  // +X
      [-1, 0, 0], // -X
      [0, 1, 0],  // +Y
      [0, -1, 0], // -Y
      [0, 0, 1],  // +Z
      [0, 0, -1]  // -Z
    ];

    return deltas
      .map(([dx, dy, dz]) => [x + dx, y + dy, z + dz])
      .filter(([nx, ny, nz]) => this.isValid(nx, ny, nz));
  }

  /**
   * Get 26-connected neighbors (all adjacent including diagonals)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @returns {Array} Array of [x, y, z] neighbor coordinates
   */
  neighbors26(x, y, z) {
    this.stats.neighborQueries++;

    const neighbors = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;

          const nx = x + dx;
          const ny = y + dy;
          const nz = z + dz;

          if (this.isValid(nx, ny, nz)) {
            neighbors.push([nx, ny, nz]);
          }
        }
      }
    }

    return neighbors;
  }

  /**
   * Get all active (non-zero) coordinates
   * @returns {Array} Array of [x, y, z] coordinates
   */
  getActiveCells() {
    return Array.from(this.data.keys()).map(k => this.parseKey(k));
  }

  /**
   * Get all LLM coordinates
   * @returns {Array} Array of [x, y, z] coordinates
   */
  getLLMCells() {
    return Array.from(this.llms.keys()).map(k => this.parseKey(k));
  }

  /**
   * Iterate over active cells with values
   * @param {Function} callback - Function(x, y, z, value)
   */
  forEach(callback) {
    for (const [key, value] of this.data.entries()) {
      const [x, y, z] = this.parseKey(key);
      callback(x, y, z, value);
    }
  }

  /**
   * Fill a region with value
   * @param {Array} start - [x1, y1, z1]
   * @param {Array} end - [x2, y2, z2]
   * @param {*} value - Value to fill
   */
  fillRegion(start, end, value) {
    const [x1, y1, z1] = start;
    const [x2, y2, z2] = end;

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        for (let z = z1; z <= z2; z++) {
          if (this.isValid(x, y, z)) {
            this.set(x, y, z, value);
          }
        }
      }
    }
  }

  /**
   * Clear all data
   */
  clear() {
    this.data.clear();
    this.llms.clear();
    this.metadata.activeCubes = 0;
    this.metadata.activeLLMs = 0;
    this.metadata.modified = Date.now();
  }

  /**
   * Get memory usage estimate in bytes
   * @returns {number} Estimated bytes
   */
  getMemoryUsage() {
    // Rough estimate: each entry ~100 bytes (key + value + overhead)
    const dataBytes = this.data.size * 100;
    // Each LLM ~4MB (from FemtoLLM estimate)
    const llmBytes = this.llms.size * 4 * 1024 * 1024;
    return dataBytes + llmBytes;
  }

  /**
   * Get statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      metadata: this.metadata,
      memoryMB: (this.getMemoryUsage() / (1024 * 1024)).toFixed(2),
      density: (this.metadata.activeCubes / this.metadata.totalCubes * 100).toFixed(4) + '%'
    };
  }

  /**
   * Export to JSON (only active cells)
   * @returns {Object} JSON representation
   */
  toJSON() {
    const cells = [];
    this.forEach((x, y, z, value) => {
      cells.push({ x, y, z, value });
    });

    return {
      templateId: this.templateId,
      dimensions: this.dims,
      metadata: this.metadata,
      cells: cells,
      stats: this.stats
    };
  }

  /**
   * Import from JSON
   * @param {Object} json - JSON data
   * @returns {BlockArray} New BlockArray instance
   */
  static fromJSON(json) {
    const ba = new BlockArray(json.dimensions, json.templateId);

    for (const cell of json.cells) {
      ba.set(cell.x, cell.y, cell.z, cell.value);
    }

    ba.metadata = json.metadata;
    ba.stats = json.stats || ba.stats;

    return ba;
  }
}

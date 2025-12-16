/**
 * KonomiSystem - Main Orchestrator
 * Integrates BlockArray, Cube, eVGPU, and FemtoLLM
 *
 * Features:
 * - Centralized management of all components
 * - Multi-agent parallel processing
 * - Face interlock operations (1M cubes)
 * - Template management
 * - Performance monitoring
 */

import { BlockArray } from './block-array.js';
import { Cube } from './cube.js';
import { eVGPU } from './evgpu.js';
import { FemtoLLM } from './femto-llm.js';

export class KonomiSystem {
  constructor(config = {}) {
    this.config = {
      maxCubes: config.maxCubes || 1000000, // 1M cubes max
      defaultDimensions: config.defaultDimensions || [100, 100, 100],
      cpuCores: config.cpuCores || 4,
      enableCache: config.enableCache !== false,
      logLevel: config.logLevel || 'info', // 'debug', 'info', 'warn', 'error'
      ...config
    };

    // Core components
    this.evgpu = new eVGPU(this.config.cpuCores);

    // Storage
    this.blockArrays = new Map();  // id -> BlockArray
    this.cubes = new Map();        // id -> Cube
    this.templates = new Map();    // id -> template config
    this.llms = new Map();         // id -> FemtoLLM

    // State
    this.initialized = false;
    this.startTime = null;

    // Statistics
    this.stats = {
      blockArraysCreated: 0,
      cubesCreated: 0,
      llmsCreated: 0,
      parallelTasksRun: 0,
      faceInterlocksPerformed: 0,
      totalProcessingTime: 0,
      errors: 0
    };
  }

  /**
   * Initialize the Konomi System
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      this.log('warn', 'System already initialized');
      return;
    }

    this.log('info', '🧬 Initializing Konomi System...');
    this.startTime = Date.now();

    // Initialize eVGPU
    this.log('debug', `  ⚡ eVGPU initialized (${this.config.cpuCores} cores)`);

    // Create default template
    this.templates.set('default', {
      dimensions: this.config.defaultDimensions,
      created: Date.now()
    });

    this.initialized = true;
    this.log('info', '✅ Konomi System ready');
  }

  /**
   * Shutdown the system
   * @returns {Promise<void>}
   */
  async shutdown() {
    this.log('info', '🛑 Shutting down Konomi System...');

    // Clear all data
    this.blockArrays.clear();
    this.cubes.clear();
    this.llms.clear();
    this.templates.clear();

    // Clear eVGPU cache
    this.evgpu.clearCache();

    this.initialized = false;
    this.log('info', '✅ System shut down');
  }

  /**
   * Create a BlockArray instance
   * @param {string} id - Unique identifier
   * @param {Array} dimensions - [x, y, z] dimensions
   * @returns {BlockArray} Created BlockArray
   */
  createBlockArray(id, dimensions = null) {
    if (this.blockArrays.has(id)) {
      throw new Error(`BlockArray '${id}' already exists`);
    }

    const dims = dimensions || this.config.defaultDimensions;
    const totalCubes = dims[0] * dims[1] * dims[2];

    if (totalCubes > this.config.maxCubes) {
      throw new Error(
        `BlockArray too large: ${totalCubes} > ${this.config.maxCubes} cubes`
      );
    }

    const ba = new BlockArray(dims, id);
    this.blockArrays.set(id, ba);

    this.stats.blockArraysCreated++;
    this.log('info', `🧊 Created BlockArray '${id}' [${dims.join('×')}]`);

    return ba;
  }

  /**
   * Get BlockArray by ID
   * @param {string} id - BlockArray ID
   * @returns {BlockArray|null} BlockArray or null
   */
  getBlockArray(id) {
    return this.blockArrays.get(id) || null;
  }

  /**
   * Delete BlockArray
   * @param {string} id - BlockArray ID
   * @returns {boolean} True if deleted
   */
  deleteBlockArray(id) {
    const deleted = this.blockArrays.delete(id);
    if (deleted) {
      this.log('info', `🗑️  Deleted BlockArray '${id}'`);
    }
    return deleted;
  }

  /**
   * Create a Cube instance
   * @param {string} id - Unique identifier
   * @param {Array} position - [x, y, z] position
   * @returns {Cube} Created Cube
   */
  createCube(id, position = [0, 0, 0]) {
    if (this.cubes.has(id)) {
      throw new Error(`Cube '${id}' already exists`);
    }

    const cube = new Cube(id, position);
    this.cubes.set(id, cube);

    this.stats.cubesCreated++;
    this.log('info', `🎲 Created Cube '${id}' at [${position.join(',')}]`);

    return cube;
  }

  /**
   * Get Cube by ID
   * @param {string} id - Cube ID
   * @returns {Cube|null} Cube or null
   */
  getCube(id) {
    return this.cubes.get(id) || null;
  }

  /**
   * Delete Cube
   * @param {string} id - Cube ID
   * @returns {boolean} True if deleted
   */
  deleteCube(id) {
    const deleted = this.cubes.delete(id);
    if (deleted) {
      this.log('info', `🗑️  Deleted Cube '${id}'`);
    }
    return deleted;
  }

  /**
   * Create standalone FemtoLLM
   * @param {string} id - Unique identifier
   * @param {Object} config - LLM config
   * @returns {FemtoLLM} Created LLM
   */
  createLLM(id, config = {}) {
    if (this.llms.has(id)) {
      throw new Error(`LLM '${id}' already exists`);
    }

    const llm = new FemtoLLM(config);
    this.llms.set(id, llm);

    this.stats.llmsCreated++;
    this.log('debug', `🧠 Created LLM '${id}'`);

    return llm;
  }

  /**
   * Get LLM by ID
   * @param {string} id - LLM ID
   * @returns {FemtoLLM|null} LLM or null
   */
  getLLM(id) {
    return this.llms.get(id) || null;
  }

  /**
   * Multi-agent parallel processing
   * @param {Array<Function>} tasks - Array of async task functions
   * @returns {Promise<Array>} Array of results
   */
  async processParallel(tasks) {
    this.log('info', `⚡ Processing ${tasks.length} tasks in parallel...`);

    const startTime = performance.now();

    const results = await Promise.all(
      tasks.map(async (task, idx) => {
        try {
          return await task();
        } catch (error) {
          this.stats.errors++;
          this.log('error', `Task ${idx} failed: ${error.message}`);
          return { error: error.message, taskIndex: idx };
        }
      })
    );

    const duration = performance.now() - startTime;
    this.stats.parallelTasksRun++;
    this.stats.totalProcessingTime += duration;

    this.log('info', `✅ Parallel processing complete in ${duration.toFixed(2)}ms`);

    return results;
  }

  /**
   * Face interlock operation (process 1M cubes efficiently)
   * @param {string} arrayId - BlockArray ID
   * @param {string} face - Face to process (top, bottom, left, right, front, back)
   * @returns {Promise<number>} Number of cubes processed
   */
  async faceInterlock(arrayId, face = 'top') {
    const ba = this.getBlockArray(arrayId);
    if (!ba) {
      throw new Error(`BlockArray '${arrayId}' not found`);
    }

    this.log('info', `🔗 Face interlock on '${face}' face...`);
    const startTime = performance.now();

    const [xMax, yMax, zMax] = ba.dims;
    let processed = 0;

    // Determine face slice based on direction
    let coords = [];
    switch (face) {
      case 'top':    // z = zMax - 1
        for (let x = 0; x < xMax; x++) {
          for (let y = 0; y < yMax; y++) {
            coords.push([x, y, zMax - 1]);
          }
        }
        break;
      case 'bottom': // z = 0
        for (let x = 0; x < xMax; x++) {
          for (let y = 0; y < yMax; y++) {
            coords.push([x, y, 0]);
          }
        }
        break;
      case 'front':  // y = 0
        for (let x = 0; x < xMax; x++) {
          for (let z = 0; z < zMax; z++) {
            coords.push([x, 0, z]);
          }
        }
        break;
      case 'back':   // y = yMax - 1
        for (let x = 0; x < xMax; x++) {
          for (let z = 0; z < zMax; z++) {
            coords.push([x, yMax - 1, z]);
          }
        }
        break;
      case 'left':   // x = 0
        for (let y = 0; y < yMax; y++) {
          for (let z = 0; z < zMax; z++) {
            coords.push([0, y, z]);
          }
        }
        break;
      case 'right':  // x = xMax - 1
        for (let y = 0; y < yMax; y++) {
          for (let z = 0; z < zMax; z++) {
            coords.push([xMax - 1, y, z]);
          }
        }
        break;
      default:
        throw new Error(`Invalid face: ${face}`);
    }

    // Process active cubes on the face
    for (const [x, y, z] of coords) {
      if (ba.isActive(x, y, z)) {
        // Simulate processing (in real use, this would do actual work)
        processed++;
      }
    }

    const duration = performance.now() - startTime;
    this.stats.faceInterlocksPerformed++;
    this.stats.totalProcessingTime += duration;

    this.log('info', `✅ Processed ${processed} active cubes in ${duration.toFixed(2)}ms`);

    return processed;
  }

  /**
   * Create template configuration
   * @param {string} id - Template ID
   * @param {Object} config - Template configuration
   */
  createTemplate(id, config) {
    this.templates.set(id, {
      ...config,
      created: Date.now()
    });
    this.log('debug', `📋 Created template '${id}'`);
  }

  /**
   * Get template by ID
   * @param {string} id - Template ID
   * @returns {Object|null} Template config or null
   */
  getTemplate(id) {
    return this.templates.get(id) || null;
  }

  /**
   * List all BlockArrays
   * @returns {Array} Array of BlockArray IDs
   */
  listBlockArrays() {
    return Array.from(this.blockArrays.keys());
  }

  /**
   * List all Cubes
   * @returns {Array} Array of Cube IDs
   */
  listCubes() {
    return Array.from(this.cubes.keys());
  }

  /**
   * List all LLMs
   * @returns {Array} Array of LLM IDs
   */
  listLLMs() {
    return Array.from(this.llms.keys());
  }

  /**
   * Get system statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const uptime = this.startTime ? Date.now() - this.startTime : 0;

    return {
      ...this.stats,
      uptime: uptime,
      uptimeFormatted: this.formatDuration(uptime),
      blockArrays: this.blockArrays.size,
      cubes: this.cubes.size,
      llms: this.llms.size,
      templates: this.templates.size,
      evgpuStats: this.evgpu.getStats()
    };
  }

  /**
   * Format duration in ms to human readable string
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Log message based on log level
   * @param {string} level - Log level
   * @param {string} message - Message to log
   */
  log(level, message) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);

    if (messageLevel >= currentLevel) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Export system state to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    const blockArrays = {};
    for (const [id, ba] of this.blockArrays) {
      blockArrays[id] = ba.toJSON();
    }

    const cubes = {};
    for (const [id, cube] of this.cubes) {
      cubes[id] = cube.toJSON();
    }

    return {
      config: this.config,
      blockArrays: blockArrays,
      cubes: cubes,
      templates: Object.fromEntries(this.templates),
      stats: this.stats,
      uptime: this.startTime ? Date.now() - this.startTime : 0
    };
  }

  /**
   * Import system state from JSON
   * @param {Object} json - JSON data
   * @returns {KonomiSystem} New system instance
   */
  static async fromJSON(json) {
    const system = new KonomiSystem(json.config);
    await system.initialize();

    // Restore BlockArrays
    for (const [id, baData] of Object.entries(json.blockArrays)) {
      const ba = BlockArray.fromJSON(baData);
      system.blockArrays.set(id, ba);
    }

    // Restore Cubes
    for (const [id, cubeData] of Object.entries(json.cubes)) {
      const cube = Cube.fromJSON(cubeData);
      system.cubes.set(id, cube);
    }

    // Restore templates
    for (const [id, template] of Object.entries(json.templates)) {
      system.templates.set(id, template);
    }

    // Restore stats
    system.stats = json.stats;

    return system;
  }
}

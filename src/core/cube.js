/**
 * Cube - 9-Agent Node System
 * 8 vertices + 1 central coordinator
 *
 * Vertices: NEU, NED, NWU, NWD, SEU, SED, SWU, SWD
 * (North/South, East/West, Up/Down)
 *
 * Features:
 * - 9 independent LLM agents
 * - Edge connections (vertex-to-vertex)
 * - Central coordinator for aggregation
 * - State machine per vertex (idle, processing, complete, error)
 * - Parallel processing across vertices
 */

import { FemtoLLM } from './femto-llm.js';

export class Cube {
  // Vertex position names
  static VERTICES = [
    'NEU', // North-East-Up      (0,0,0) → (1,1,1)
    'NED', // North-East-Down    (1,1,0)
    'NWU', // North-West-Up      (0,1,1)
    'NWD', // North-West-Down    (0,1,0)
    'SEU', // South-East-Up      (1,0,1)
    'SED', // South-East-Down    (1,0,0)
    'SWU', // South-West-Up      (0,0,1)
    'SWD'  // South-West-Down    (0,0,0)
  ];

  // State machine states
  static STATES = {
    IDLE: 'idle',
    STARTING: 'starting',
    PROCESSING: 'processing',
    COMPLETE: 'complete',
    ERROR: 'error',
    SUSPENDED: 'suspended'
  };

  constructor(id, position = [0, 0, 0]) {
    this.id = id;
    this.position = position; // Position in BlockArray

    // Create LLM agent for each vertex
    this.vertices = {};
    for (const v of Cube.VERTICES) {
      this.vertices[v] = {
        llm: new FemtoLLM({ hiddenSize: 16 }),
        state: Cube.STATES.IDLE,
        connections: [], // Connected vertices
        data: null,      // Processing result
        history: [],     // Processing history
        metadata: {
          created: Date.now(),
          lastProcessed: null,
          processCount: 0
        }
      };
    }

    // Central coordinator agent
    this.central = {
      llm: new FemtoLLM({ hiddenSize: 16 }),
      state: Cube.STATES.IDLE,
      data: null,
      history: [],
      metadata: {
        created: Date.now(),
        lastCoordinated: null,
        coordinationCount: 0
      }
    };

    // Edge connections with weights
    this.edges = new Map(); // "source->target" -> { weight, active, metadata }

    // Statistics
    this.stats = {
      totalProcessed: 0,
      totalCoordinations: 0,
      totalErrors: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Connect two vertices with weighted edge
   * @param {string} source - Source vertex
   * @param {string} target - Target vertex
   * @param {number} weight - Edge weight (default 1.0)
   */
  connect(source, target, weight = 1.0) {
    if (!this.vertices[source]) {
      throw new Error(`Invalid source vertex: ${source}`);
    }
    if (!this.vertices[target]) {
      throw new Error(`Invalid target vertex: ${target}`);
    }

    const edgeKey = `${source}->${target}`;

    this.edges.set(edgeKey, {
      weight: weight,
      active: true,
      metadata: {
        created: Date.now(),
        activations: 0
      }
    });

    // Add to connections list
    if (!this.vertices[source].connections.includes(target)) {
      this.vertices[source].connections.push(target);
    }
  }

  /**
   * Disconnect two vertices
   * @param {string} source - Source vertex
   * @param {string} target - Target vertex
   */
  disconnect(source, target) {
    const edgeKey = `${source}->${target}`;
    this.edges.delete(edgeKey);

    const idx = this.vertices[source]?.connections.indexOf(target);
    if (idx !== -1) {
      this.vertices[source].connections.splice(idx, 1);
    }
  }

  /**
   * Get edge between vertices
   * @param {string} source - Source vertex
   * @param {string} target - Target vertex
   * @returns {Object|null} Edge data or null
   */
  getEdge(source, target) {
    return this.edges.get(`${source}->${target}`) || null;
  }

  /**
   * Process task at specific vertex
   * @param {string} vertex - Vertex name
   * @param {string} text - Text to process
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Processing result
   */
  async processVertex(vertex, text, context = {}) {
    if (!this.vertices[vertex]) {
      throw new Error(`Invalid vertex: ${vertex}`);
    }

    const startTime = performance.now();
    const agent = this.vertices[vertex];

    try {
      // Update state
      agent.state = Cube.STATES.PROCESSING;

      // Process with LLM
      const result = await agent.llm.process(text, {
        ...context,
        vertex: vertex,
        cubeId: this.id,
        position: this.position
      });

      // Update state and data
      agent.state = Cube.STATES.COMPLETE;
      agent.data = result;
      agent.metadata.lastProcessed = Date.now();
      agent.metadata.processCount++;

      // Add to history
      agent.history.push({
        timestamp: Date.now(),
        text: text.substring(0, 50),
        result: result,
        processingTime: performance.now() - startTime
      });

      // Update stats
      this.stats.totalProcessed++;
      const totalTime = this.stats.averageProcessingTime * (this.stats.totalProcessed - 1);
      this.stats.averageProcessingTime = (totalTime + (performance.now() - startTime)) / this.stats.totalProcessed;

      return result;

    } catch (error) {
      agent.state = Cube.STATES.ERROR;
      agent.data = { error: error.message };
      this.stats.totalErrors++;

      throw error;
    }
  }

  /**
   * Process task at all vertices in parallel
   * @param {string} text - Text to process
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Results from all vertices
   */
  async processAll(text, context = {}) {
    const promises = Cube.VERTICES.map(v =>
      this.processVertex(v, text, { ...context, role: v })
        .catch(err => ({ error: err.message, vertex: v }))
    );

    const results = await Promise.all(promises);

    // Package results
    const output = {};
    Cube.VERTICES.forEach((v, idx) => {
      output[v] = results[idx];
    });

    return output;
  }

  /**
   * Central coordinator aggregates results from all vertices
   * @param {string} task - Task description
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Coordinated result
   */
  async coordinate(task, context = {}) {
    const startTime = performance.now();

    try {
      this.central.state = Cube.STATES.PROCESSING;

      // Step 1: Process at all vertices in parallel
      const vertexResults = await this.processAll(task, context);

      // Step 2: Aggregate with central coordinator
      const aggregationInput = JSON.stringify({
        task: task,
        vertexResults: Object.keys(vertexResults).map(v => ({
          vertex: v,
          summary: vertexResults[v].input || 'N/A'
        }))
      });

      const coordinated = await this.central.llm.process(aggregationInput, {
        ...context,
        role: 'coordinator',
        cubeId: this.id
      });

      // Update central state
      this.central.state = Cube.STATES.COMPLETE;
      this.central.data = {
        task: task,
        vertexResults: vertexResults,
        coordination: coordinated,
        processingTime: performance.now() - startTime
      };

      this.central.metadata.lastCoordinated = Date.now();
      this.central.metadata.coordinationCount++;

      // Add to history
      this.central.history.push({
        timestamp: Date.now(),
        task: task.substring(0, 50),
        result: coordinated,
        processingTime: performance.now() - startTime
      });

      this.stats.totalCoordinations++;

      return this.central.data;

    } catch (error) {
      this.central.state = Cube.STATES.ERROR;
      this.stats.totalErrors++;
      throw error;
    }
  }

  /**
   * Get state of specific vertex or all vertices
   * @param {string|null} vertex - Vertex name (null for all)
   * @returns {string|Object} State(s)
   */
  getState(vertex = null) {
    if (vertex) {
      if (vertex === 'central') {
        return this.central.state;
      }
      return this.vertices[vertex]?.state || 'unknown';
    }

    // Return all states
    const states = {};
    for (const v of Cube.VERTICES) {
      states[v] = this.vertices[v].state;
    }
    states.central = this.central.state;

    return states;
  }

  /**
   * Get data from specific vertex
   * @param {string} vertex - Vertex name
   * @returns {*} Vertex data
   */
  getData(vertex) {
    if (vertex === 'central') {
      return this.central.data;
    }
    return this.vertices[vertex]?.data || null;
  }

  /**
   * Reset all vertices to idle state
   */
  reset() {
    for (const v of Cube.VERTICES) {
      this.vertices[v].state = Cube.STATES.IDLE;
      this.vertices[v].data = null;
    }
    this.central.state = Cube.STATES.IDLE;
    this.central.data = null;
  }

  /**
   * Suspend processing at specific vertex
   * @param {string} vertex - Vertex name
   */
  suspend(vertex) {
    if (this.vertices[vertex]) {
      this.vertices[vertex].state = Cube.STATES.SUSPENDED;
    }
  }

  /**
   * Resume processing at specific vertex
   * @param {string} vertex - Vertex name
   */
  resume(vertex) {
    if (this.vertices[vertex]) {
      this.vertices[vertex].state = Cube.STATES.IDLE;
    }
  }

  /**
   * Get connections for a vertex
   * @param {string} vertex - Vertex name
   * @returns {Array} Connected vertices
   */
  getConnections(vertex) {
    return this.vertices[vertex]?.connections || [];
  }

  /**
   * Check if two vertices are connected
   * @param {string} source - Source vertex
   * @param {string} target - Target vertex
   * @returns {boolean} True if connected
   */
  isConnected(source, target) {
    return this.edges.has(`${source}->${target}`);
  }

  /**
   * Get all edges
   * @returns {Array} Array of edge objects
   */
  getAllEdges() {
    const edges = [];
    for (const [key, data] of this.edges.entries()) {
      const [source, target] = key.split('->');
      edges.push({
        source,
        target,
        ...data
      });
    }
    return edges;
  }

  /**
   * Get processing history for vertex
   * @param {string} vertex - Vertex name
   * @param {number} limit - Max history items
   * @returns {Array} History items
   */
  getHistory(vertex, limit = 10) {
    if (vertex === 'central') {
      return this.central.history.slice(-limit);
    }
    return this.vertices[vertex]?.history.slice(-limit) || [];
  }

  /**
   * Get cube statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      vertices: Cube.VERTICES.length,
      activeEdges: this.edges.size,
      states: this.getState()
    };
  }

  /**
   * Export cube to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    const vertexData = {};
    for (const v of Cube.VERTICES) {
      vertexData[v] = {
        state: this.vertices[v].state,
        connections: this.vertices[v].connections,
        metadata: this.vertices[v].metadata,
        historyCount: this.vertices[v].history.length
      };
    }

    return {
      id: this.id,
      position: this.position,
      vertices: vertexData,
      central: {
        state: this.central.state,
        metadata: this.central.metadata,
        historyCount: this.central.history.length
      },
      edges: this.getAllEdges(),
      stats: this.stats
    };
  }

  /**
   * Create cube from JSON
   * @param {Object} json - JSON data
   * @returns {Cube} New cube instance
   */
  static fromJSON(json) {
    const cube = new Cube(json.id, json.position);

    // Restore vertex states and metadata
    for (const v of Cube.VERTICES) {
      if (json.vertices[v]) {
        cube.vertices[v].state = json.vertices[v].state;
        cube.vertices[v].connections = json.vertices[v].connections;
        cube.vertices[v].metadata = json.vertices[v].metadata;
      }
    }

    // Restore central metadata
    cube.central.state = json.central.state;
    cube.central.metadata = json.central.metadata;

    // Restore edges
    for (const edge of json.edges) {
      cube.connect(edge.source, edge.target, edge.weight);
    }

    // Restore stats
    cube.stats = json.stats;

    return cube;
  }
}

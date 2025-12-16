/**
 * FemtoLLM - Ultra-lightweight 16-dimensional nano AI model
 * 16d | 1 layer | 1 head | 4MB RAM | 0.1s/req
 *
 * Optimized for CPU-only execution with minimal memory footprint
 */

import { eVGPU } from './evgpu.js';

export class FemtoLLM {
  constructor(config = {}) {
    this.config = {
      hiddenSize: config.hiddenSize || 16,
      vocabSize: config.vocabSize || 256, // Simple char-level
      maxLength: config.maxLength || 512,
      temperature: config.temperature || 0.7,
      ...config
    };

    this.h = this.config.hiddenSize;
    this.evgpu = new eVGPU();

    // Initialize weights (simple random initialization)
    this.weights = {
      embedding: this.randomMatrix(this.config.vocabSize, this.h, 0.1),
      W_q: this.randomMatrix(this.h, this.h, 0.1), // Query
      W_k: this.randomMatrix(this.h, this.h, 0.1), // Key
      W_v: this.randomMatrix(this.h, this.h, 0.1), // Value
      W_o: this.randomMatrix(this.h, this.h, 0.1), // Output
      W_ff1: this.randomMatrix(this.h, this.h * 2, 0.1), // Feed-forward 1
      W_ff2: this.randomMatrix(this.h * 2, this.h, 0.1), // Feed-forward 2
      W_out: this.randomMatrix(this.h, this.config.vocabSize, 0.1)
    };

    this.stats = {
      totalProcessed: 0,
      totalTime: 0,
      avgTime: 0
    };
  }

  /**
   * Create random matrix with Xavier initialization
   * @param {number} rows - Number of rows
   * @param {number} cols - Number of columns
   * @param {number} scale - Scale factor
   * @returns {Array} Random matrix
   */
  randomMatrix(rows, cols, scale = 0.1) {
    const matrix = [];
    const stddev = Math.sqrt(2.0 / (rows + cols));

    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        // Xavier/Glorot initialization
        matrix[i][j] = (Math.random() - 0.5) * 2 * stddev * scale;
      }
    }

    return matrix;
  }

  /**
   * Tokenize text (simple char-level tokenization)
   * @param {string} text - Input text
   * @returns {Array} Token IDs
   */
  tokenize(text) {
    return text
      .split('')
      .map(c => c.charCodeAt(0) % this.config.vocabSize)
      .slice(0, this.config.maxLength);
  }

  /**
   * Detokenize token IDs back to text
   * @param {Array} tokens - Token IDs
   * @returns {string} Text
   */
  detokenize(tokens) {
    return tokens
      .map(t => String.fromCharCode(t))
      .join('');
  }

  /**
   * Get embedding for tokens
   * @param {Array} tokens - Token IDs
   * @returns {Array} Embeddings
   */
  embed(tokens) {
    return tokens.map(token => {
      const idx = Math.min(token, this.config.vocabSize - 1);
      return [...this.weights.embedding[idx]];
    });
  }

  /**
   * Self-attention mechanism (simplified)
   * @param {Array} embeddings - Input embeddings
   * @returns {Array} Attention output
   */
  attention(embeddings) {
    const seqLen = embeddings.length;
    const output = [];

    for (let i = 0; i < seqLen; i++) {
      const query = embeddings[i];
      let contextVector = new Array(this.h).fill(0);

      // Compute attention scores
      const scores = [];
      for (let j = 0; j < seqLen; j++) {
        const key = embeddings[j];
        const score = this.evgpu.dot(query, key) / Math.sqrt(this.h);
        scores.push(Math.exp(score));
      }

      // Normalize scores
      const sumScores = scores.reduce((a, b) => a + b, 0);
      const weights = scores.map(s => s / sumScores);

      // Weighted sum of values
      for (let j = 0; j < seqLen; j++) {
        const value = embeddings[j];
        for (let k = 0; k < this.h; k++) {
          contextVector[k] += weights[j] * value[k];
        }
      }

      output.push(contextVector);
    }

    return output;
  }

  /**
   * Feed-forward network
   * @param {Array} input - Input vector
   * @returns {Array} Output vector
   */
  feedForward(input) {
    // First layer with activation
    const hidden = [];
    for (let i = 0; i < this.h * 2; i++) {
      let sum = 0;
      for (let j = 0; j < this.h; j++) {
        sum += input[j] * this.weights.W_ff1[j][i];
      }
      hidden.push(this.evgpu.activate(sum, 'relu'));
    }

    // Second layer
    const output = [];
    for (let i = 0; i < this.h; i++) {
      let sum = 0;
      for (let j = 0; j < this.h * 2; j++) {
        sum += hidden[j] * this.weights.W_ff2[j][i];
      }
      output.push(sum);
    }

    return output;
  }

  /**
   * Forward pass through the model
   * @param {Array} tokens - Token IDs
   * @returns {Object} Model output
   */
  forward(tokens) {
    // Embedding layer
    let hidden = this.embed(tokens);

    // Self-attention
    hidden = this.attention(hidden);

    // Feed-forward for each position
    hidden = hidden.map(h => this.feedForward(h));

    // Average pooling over sequence
    const pooled = new Array(this.h).fill(0);
    for (let i = 0; i < hidden.length; i++) {
      for (let j = 0; j < this.h; j++) {
        pooled[j] += hidden[i][j] / hidden.length;
      }
    }

    // Output projection
    const logits = [];
    for (let i = 0; i < this.config.vocabSize; i++) {
      let sum = 0;
      for (let j = 0; j < this.h; j++) {
        sum += pooled[j] * this.weights.W_out[j][i];
      }
      logits.push(sum);
    }

    return {
      hidden: pooled,
      logits: logits,
      probabilities: this.evgpu.softmax(logits)
    };
  }

  /**
   * Process text input and generate output
   * @param {string} text - Input text
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Processing result
   */
  async process(text, context = {}) {
    const startTime = performance.now();

    try {
      // Tokenize input
      const tokens = this.tokenize(text);

      // Forward pass
      const output = this.forward(tokens);

      // Generate simple summary (take top tokens)
      const topK = 10;
      const topIndices = output.probabilities
        .map((prob, idx) => ({ prob, idx }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, topK)
        .map(x => x.idx);

      // Update stats
      const processingTime = performance.now() - startTime;
      this.stats.totalProcessed++;
      this.stats.totalTime += processingTime;
      this.stats.avgTime = this.stats.totalTime / this.stats.totalProcessed;

      return {
        input: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        tokens: tokens.slice(0, 10), // First 10 tokens
        embedding: Array.from(output.hidden),
        logits: output.logits.slice(0, 10), // First 10 logits
        topTokens: topIndices,
        processingTime: processingTime.toFixed(2) + 'ms',
        context: context,
        stats: { ...this.stats }
      };
    } catch (error) {
      return {
        error: error.message,
        input: text.substring(0, 50),
        processingTime: (performance.now() - startTime).toFixed(2) + 'ms'
      };
    }
  }

  /**
   * Generate text (simplified, returns processed input with modifications)
   * @param {string} prompt - Input prompt
   * @param {number} maxTokens - Maximum tokens to generate
   * @returns {Promise<string>} Generated text
   */
  async generate(prompt, maxTokens = 50) {
    const result = await this.process(prompt);

    // Simple generation: return processed prompt with suffix
    const suffix = result.topTokens
      ? this.detokenize(result.topTokens.slice(0, 5))
      : '...';

    return {
      prompt: prompt,
      generated: prompt + ' → ' + suffix,
      metadata: result
    };
  }

  /**
   * Get model statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      config: this.config,
      parameters: this.getParameterCount(),
      memoryMB: this.estimateMemory()
    };
  }

  /**
   * Estimate total parameter count
   * @returns {number} Parameter count
   */
  getParameterCount() {
    let total = 0;
    for (const [key, matrix] of Object.entries(this.weights)) {
      const rows = matrix.length;
      const cols = matrix[0]?.length || 0;
      total += rows * cols;
    }
    return total;
  }

  /**
   * Estimate memory usage in MB
   * @returns {number} Memory in MB
   */
  estimateMemory() {
    // Each float32 = 4 bytes
    const params = this.getParameterCount();
    const bytes = params * 4;
    return (bytes / (1024 * 1024)).toFixed(2);
  }

  /**
   * Reset model statistics
   */
  resetStats() {
    this.stats = {
      totalProcessed: 0,
      totalTime: 0,
      avgTime: 0
    };
  }

  /**
   * Serialize model to JSON
   * @returns {Object} Serialized model
   */
  toJSON() {
    return {
      config: this.config,
      weights: this.weights,
      stats: this.stats
    };
  }

  /**
   * Load model from JSON
   * @param {Object} json - Serialized model
   * @returns {FemtoLLM} Loaded model
   */
  static fromJSON(json) {
    const model = new FemtoLLM(json.config);
    model.weights = json.weights;
    model.stats = json.stats || model.stats;
    return model;
  }
}

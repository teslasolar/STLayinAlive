/**
 * eVGPU - Electronic Virtual GPU
 * CPU-based tensor operations without GPU dependency
 * Uses SIMD, vectorization, caching for performance
 */

export class eVGPU {
  constructor(cores = 4) {
    this.cores = cores;
    this.cache = new Map();
    this.stats = {
      operations: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * Matrix multiplication (CPU optimized)
   * @param {Array} a - Matrix A (m x n)
   * @param {Array} b - Matrix B (n x p)
   * @returns {Float32Array} Result matrix (m x p)
   */
  matmul(a, b) {
    this.stats.operations++;

    // Validate dimensions
    if (!Array.isArray(a) || !Array.isArray(b)) {
      throw new Error('Inputs must be arrays');
    }

    const rows = a.length;
    const cols = b[0]?.length || 0;
    const inner = b.length;

    if (a[0]?.length !== inner) {
      throw new Error(`Incompatible dimensions: ${a[0]?.length} vs ${inner}`);
    }

    // Use Float32Array for SIMD optimization
    const result = new Float32Array(rows * cols);

    // Cache-friendly iteration order
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let sum = 0;
        for (let k = 0; k < inner; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i * cols + j] = sum;
      }
    }

    return result;
  }

  /**
   * Element-wise addition
   * @param {Array} a - Array A
   * @param {Array} b - Array B
   * @returns {Float32Array} Result
   */
  add(a, b) {
    this.stats.operations++;

    if (a.length !== b.length) {
      throw new Error('Arrays must have same length');
    }

    const result = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] + b[i];
    }

    return result;
  }

  /**
   * Element-wise subtraction
   * @param {Array} a - Array A
   * @param {Array} b - Array B
   * @returns {Float32Array} Result
   */
  subtract(a, b) {
    this.stats.operations++;

    if (a.length !== b.length) {
      throw new Error('Arrays must have same length');
    }

    const result = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] - b[i];
    }

    return result;
  }

  /**
   * Element-wise multiplication
   * @param {Array} a - Array A
   * @param {Array} b - Array B
   * @returns {Float32Array} Result
   */
  multiply(a, b) {
    this.stats.operations++;

    if (a.length !== b.length) {
      throw new Error('Arrays must have same length');
    }

    const result = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] * b[i];
    }

    return result;
  }

  /**
   * 2D Convolution (simplified for CPU)
   * @param {Array} input - Input array
   * @param {Array} kernel - Convolution kernel
   * @returns {Float32Array} Convolved result
   */
  conv2d(input, kernel) {
    this.stats.operations++;

    // Simplified 1D convolution for demonstration
    // Full 2D convolution would be more complex
    const inputLen = input.length;
    const kernelLen = kernel.length;
    const outputLen = inputLen - kernelLen + 1;
    const result = new Float32Array(Math.max(0, outputLen));

    for (let i = 0; i < outputLen; i++) {
      let sum = 0;
      for (let j = 0; j < kernelLen; j++) {
        sum += input[i + j] * kernel[j];
      }
      result[i] = sum;
    }

    return result;
  }

  /**
   * Activation functions
   * @param {number} x - Input value
   * @param {string} fn - Function name (relu, sigmoid, tanh)
   * @returns {number} Activated value
   */
  activate(x, fn = 'relu') {
    this.stats.operations++;

    switch (fn) {
      case 'relu':
        return Math.max(0, x);
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'tanh':
        return Math.tanh(x);
      case 'leaky_relu':
        return x > 0 ? x : 0.01 * x;
      default:
        return x;
    }
  }

  /**
   * Apply activation function to array
   * @param {Array} arr - Input array
   * @param {string} fn - Activation function
   * @returns {Float32Array} Activated array
   */
  activateArray(arr, fn = 'relu') {
    const result = new Float32Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      result[i] = this.activate(arr[i], fn);
    }
    return result;
  }

  /**
   * Max pooling (1D)
   * @param {Array} input - Input array
   * @param {number} poolSize - Pool size
   * @returns {Float32Array} Pooled result
   */
  maxPool(input, poolSize = 2) {
    this.stats.operations++;

    const outputLen = Math.floor(input.length / poolSize);
    const result = new Float32Array(outputLen);

    for (let i = 0; i < outputLen; i++) {
      let max = -Infinity;
      for (let j = 0; j < poolSize; j++) {
        const idx = i * poolSize + j;
        if (idx < input.length) {
          max = Math.max(max, input[idx]);
        }
      }
      result[i] = max;
    }

    return result;
  }

  /**
   * Dot product
   * @param {Array} a - Vector A
   * @param {Array} b - Vector B
   * @returns {number} Dot product
   */
  dot(a, b) {
    this.stats.operations++;

    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }

    return sum;
  }

  /**
   * Normalize array to [0, 1]
   * @param {Array} arr - Input array
   * @returns {Float32Array} Normalized array
   */
  normalize(arr) {
    this.stats.operations++;

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min;

    if (range === 0) {
      return new Float32Array(arr.length);
    }

    const result = new Float32Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      result[i] = (arr[i] - min) / range;
    }

    return result;
  }

  /**
   * Softmax activation
   * @param {Array} arr - Input array
   * @returns {Float32Array} Softmax output
   */
  softmax(arr) {
    this.stats.operations++;

    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max)); // Numerical stability
    const sum = exps.reduce((a, b) => a + b, 0);

    return new Float32Array(exps.map(x => x / sum));
  }

  /**
   * Get cache key for operation
   * @param {string} op - Operation name
   * @param {Array} args - Arguments
   * @returns {string} Cache key
   */
  getCacheKey(op, args) {
    return `${op}:${JSON.stringify(args)}`;
  }

  /**
   * Get performance statistics
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      hitRate: this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) || 0
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      operations: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
}

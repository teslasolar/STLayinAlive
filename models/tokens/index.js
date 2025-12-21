/**
 * Token Library Index
 * Central registry for all token models with batch generation
 */

import { TokenBase, TOKEN_SIZES, TOKEN_PRESETS } from './token-base.js';
import { RoundToken, createRoundToken, generateRoundTokenSet } from './round-token.js';
import { SquareToken, createSquareToken, generateSquareTokenSet, SQUARE_SIZES } from './square-token.js';
import { HexToken, createHexToken, generateHexTokenSet, generateHexGrid, HEX_SIZES } from './hex-token.js';

/**
 * Token Registry - all available token types
 */
export const TokenRegistry = {
  round: RoundToken,
  square: SquareToken,
  hex: HexToken,
};

/**
 * All available sizes across all token types
 */
export const AllSizes = {
  round: TOKEN_SIZES,
  square: SQUARE_SIZES,
  hex: HEX_SIZES,
  presets: TOKEN_PRESETS,
};

/**
 * Quick factory - create any token by type and size
 */
export function createToken(type, size = 'medium', customParams = {}) {
  switch (type) {
    case 'round':
      return createRoundToken(size, customParams);
    case 'square':
      return createSquareToken(size, customParams);
    case 'hex':
      return createHexToken(size, customParams);
    default:
      throw new Error(`Unknown token type: ${type}`);
  }
}

/**
 * Generate complete token library
 * Creates all sizes of all token types
 */
export function generateFullTokenLibrary() {
  return {
    round: generateRoundTokenSet(),
    square: generateSquareTokenSet(),
    hex: generateHexTokenSet(),
  };
}

/**
 * Batch configuration for efficient multi-token generation
 */
export const BatchConfigs = {
  // Standard gaming set
  gaming: [
    { type: 'round', sizes: ['small', 'medium', 'large'] },
    { type: 'square', sizes: ['small', 'medium'] },
    { type: 'hex', sizes: ['medium', 'large'] },
  ],

  // D&D/Pathfinder miniature bases
  dnd: [
    { type: 'round', sizes: ['dnd-small', 'dnd-medium', 'dnd-large', 'dnd-huge'] },
  ],

  // Warhammer bases
  warhammer: [
    { type: 'round', sizes: ['wh-25mm', 'wh-32mm', 'wh-40mm', 'wh-50mm', 'wh-60mm'] },
  ],

  // Board game tokens
  boardgame: [
    { type: 'round', sizes: ['poker-chip', 'counter-small', 'counter-medium'] },
    { type: 'square', sizes: ['tile-1inch', 'tile-2inch'] },
    { type: 'hex', sizes: ['catan'] },
  ],

  // Minimal set for quick printing
  minimal: [
    { type: 'round', sizes: ['small', 'medium'] },
  ],
};

/**
 * Generate tokens from a batch config
 */
export function generateBatch(configName) {
  const config = BatchConfigs[configName];
  if (!config) {
    throw new Error(`Unknown batch config: ${configName}. Available: ${Object.keys(BatchConfigs).join(', ')}`);
  }

  const tokens = [];
  for (const { type, sizes } of config) {
    for (const size of sizes) {
      const token = createToken(type, size);
      tokens.push({
        type,
        size,
        name: `${type}-token-${size}`,
        model: token,
        geometry: token.generate(),
      });
    }
  }
  return tokens;
}

/**
 * List all available tokens that can be generated
 */
export function listAvailableTokens() {
  const available = [];

  for (const [type, sizes] of Object.entries(AllSizes)) {
    if (type === 'presets') {
      for (const name of Object.keys(sizes)) {
        available.push({ type: 'round', size: name, name: `round-token-${name}` });
      }
    } else {
      for (const name of Object.keys(sizes)) {
        available.push({ type, size: name, name: `${type}-token-${name}` });
      }
    }
  }

  return available;
}

// Export everything
export {
  TokenBase,
  TOKEN_SIZES,
  TOKEN_PRESETS,
  RoundToken,
  createRoundToken,
  generateRoundTokenSet,
  SquareToken,
  createSquareToken,
  generateSquareTokenSet,
  SQUARE_SIZES,
  HexToken,
  createHexToken,
  generateHexTokenSet,
  generateHexGrid,
  HEX_SIZES,
};

export default {
  TokenRegistry,
  AllSizes,
  BatchConfigs,
  createToken,
  generateBatch,
  generateFullTokenLibrary,
  listAvailableTokens,
};

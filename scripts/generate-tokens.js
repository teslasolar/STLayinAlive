#!/usr/bin/env node
/**
 * Token Batch Generator
 * Efficiently generates multiple token STL files in batch
 *
 * Usage:
 *   node scripts/generate-tokens.js                    # Generate all tokens
 *   node scripts/generate-tokens.js --batch gaming     # Generate specific batch
 *   node scripts/generate-tokens.js --type round       # Generate all round tokens
 *   node scripts/generate-tokens.js --size medium      # Generate medium tokens only
 *   node scripts/generate-tokens.js --list             # List available tokens
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic imports for ES modules
const jscadStlSerializer = await import('@jscad/stl-serializer');
const { serialize } = jscadStlSerializer;

import {
  createToken,
  generateBatch,
  generateFullTokenLibrary,
  listAvailableTokens,
  BatchConfigs,
  AllSizes,
} from '../models/tokens/index.js';

const OUTPUT_DIR = path.join(__dirname, '..', 'dist', 'tokens');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    batch: null,
    type: null,
    size: null,
    list: false,
    help: false,
    output: OUTPUT_DIR,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--batch':
      case '-b':
        options.batch = args[++i];
        break;
      case '--type':
      case '-t':
        options.type = args[++i];
        break;
      case '--size':
      case '-s':
        options.size = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--list':
      case '-l':
        options.list = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Token Batch Generator - STLayinAlive

Usage:
  node scripts/generate-tokens.js [options]

Options:
  --batch, -b <name>    Generate a predefined batch (gaming, dnd, warhammer, boardgame, minimal)
  --type, -t <type>     Generate all sizes of a type (round, square, hex)
  --size, -s <size>     Generate specific size only (micro, small, medium, large, xlarge)
  --output, -o <dir>    Output directory (default: dist/tokens)
  --list, -l            List all available tokens
  --help, -h            Show this help

Examples:
  node scripts/generate-tokens.js                        # Generate all tokens
  node scripts/generate-tokens.js --batch dnd            # Generate D&D bases
  node scripts/generate-tokens.js --type round           # All round tokens
  node scripts/generate-tokens.js --type hex --size large  # Large hex tokens only

Available Batches: ${Object.keys(BatchConfigs).join(', ')}
Token Types: round, square, hex
`);
}

/**
 * List all available tokens
 */
function listTokens() {
  console.log('\n=== Available Token Types and Sizes ===\n');

  for (const [type, sizes] of Object.entries(AllSizes)) {
    if (type === 'presets') {
      console.log('Presets (for round tokens):');
      for (const [name, params] of Object.entries(sizes)) {
        console.log(`  ${name}: ${params.diameter}mm diameter, ${params.height}mm height`);
      }
    } else {
      console.log(`\n${type.toUpperCase()} tokens:`);
      for (const [name, params] of Object.entries(sizes)) {
        const dim = params.diameter || params.size;
        console.log(`  ${name}: ${dim}mm, ${params.height}mm height`);
      }
    }
  }

  console.log('\n=== Batch Configurations ===\n');
  for (const [name, config] of Object.entries(BatchConfigs)) {
    const count = config.reduce((sum, c) => sum + c.sizes.length, 0);
    console.log(`  ${name}: ${count} tokens`);
    for (const { type, sizes } of config) {
      console.log(`    - ${type}: ${sizes.join(', ')}`);
    }
  }
}

/**
 * Export geometry to STL
 */
function exportToSTL(geometry, filename) {
  const stlData = serialize({ binary: true }, geometry);

  // Concatenate all ArrayBuffer chunks
  let totalSize = 0;
  for (const chunk of stlData) {
    if (chunk instanceof ArrayBuffer) {
      totalSize += chunk.byteLength;
    }
  }

  const result = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of stlData) {
    if (chunk instanceof ArrayBuffer) {
      result.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
  }

  const buffer = Buffer.from(result.buffer);
  fs.writeFileSync(filename, buffer);
  return buffer.length;
}

/**
 * Generate tokens based on options
 */
async function generateTokens(options) {
  // Ensure output directory exists
  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  const tokensToGenerate = [];
  const startTime = Date.now();

  // Determine which tokens to generate
  if (options.batch) {
    // Generate from batch config
    const batchTokens = generateBatch(options.batch);
    tokensToGenerate.push(...batchTokens);
  } else if (options.type) {
    // Generate all sizes of a specific type
    const sizes = AllSizes[options.type];
    if (!sizes) {
      console.error(`Unknown token type: ${options.type}`);
      process.exit(1);
    }

    for (const [sizeName, params] of Object.entries(sizes)) {
      if (!options.size || options.size === sizeName) {
        const token = createToken(options.type, sizeName);
        tokensToGenerate.push({
          type: options.type,
          size: sizeName,
          name: `${options.type}-token-${sizeName}`,
          model: token,
          geometry: token.generate(),
        });
      }
    }
  } else {
    // Generate all tokens
    const library = generateFullTokenLibrary();
    for (const [type, tokens] of Object.entries(library)) {
      for (const tokenInfo of tokens) {
        if (!options.size || tokenInfo.params.diameter === AllSizes[type][options.size]?.diameter) {
          tokensToGenerate.push({
            type,
            size: tokenInfo.name.replace(`${type}-token-`, ''),
            name: tokenInfo.name,
            model: tokenInfo.model,
            geometry: tokenInfo.model.generate(),
          });
        }
      }
    }
  }

  // Generate STL files
  console.log(`\nGenerating ${tokensToGenerate.length} token(s)...\n`);

  const manifest = {
    generated: new Date().toISOString(),
    tokens: [],
  };

  let totalSize = 0;

  for (const token of tokensToGenerate) {
    const filename = `${token.name}.stl`;
    const filepath = path.join(options.output, filename);

    try {
      const size = exportToSTL(token.geometry, filepath);
      totalSize += size;

      manifest.tokens.push({
        name: token.name,
        type: token.type,
        size: token.size,
        filename,
        fileSize: size,
        params: token.model.params,
      });

      console.log(`  ✓ ${filename} (${(size / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error(`  ✗ ${filename}: ${error.message}`);
    }
  }

  // Write manifest
  const manifestPath = path.join(options.output, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n=== Generation Complete ===`);
  console.log(`  Tokens: ${manifest.tokens.length}`);
  console.log(`  Total size: ${(totalSize / 1024).toFixed(1)} KB`);
  console.log(`  Time: ${elapsed}s`);
  console.log(`  Output: ${options.output}`);
  console.log(`  Manifest: ${manifestPath}\n`);
}

// Main execution
const options = parseArgs();

if (options.help) {
  showHelp();
} else if (options.list) {
  listTokens();
} else {
  generateTokens(options).catch(error => {
    console.error('Error generating tokens:', error);
    process.exit(1);
  });
}

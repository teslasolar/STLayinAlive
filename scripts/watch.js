#!/usr/bin/env node

/**
 * Watch mode - regenerate STLs on model file changes
 */

import chokidar from 'chokidar';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAllSTLs } from './generate-stls.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎵 STLayinAlive - Watch Mode');
console.log('================================\n');
console.log('👀 Watching for model changes...\n');

// Watch model files
const watcher = chokidar.watch(
  path.join(__dirname, '..', 'models/**/*.js'),
  {
    ignored: /node_modules/,
    persistent: true
  }
);

let regenerating = false;

watcher.on('change', async (filepath) => {
  if (regenerating) {
    console.log('⏳ Already regenerating, skipping...');
    return;
  }

  regenerating = true;
  console.log(`\n📝 Model changed: ${path.basename(filepath)}`);
  console.log('🔄 Regenerating all STLs...\n');
  
  try {
    await generateAllSTLs();
    console.log('✓ STLs regenerated successfully\n');
  } catch (error) {
    console.error('✗ Error regenerating STLs:', error);
  } finally {
    regenerating = false;
    console.log('👀 Watching for changes...\n');
  }
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping watch mode...');
  watcher.close();
  process.exit(0);
});

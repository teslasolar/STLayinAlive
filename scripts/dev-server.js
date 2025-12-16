#!/usr/bin/env node

/**
 * Development server with live reload
 * Serves the docs folder and watches for changes
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from docs
const docsDir = path.join(__dirname, '..', 'docs');
app.use(express.static(docsDir));

// Serve dist folder for STL files
const distDir = path.join(__dirname, '..', 'dist');
app.use('/dist', express.static(distDir));

// Start server
app.listen(PORT, () => {
  console.log(`🎵 STLayinAlive Dev Server`);
  console.log(`================================`);
  console.log(`\n✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Serving: ${docsDir}`);
  console.log(`\n👀 Watching for changes...\n`);
});

// Watch for file changes
const watcher = chokidar.watch([
  path.join(__dirname, '..', 'docs/**/*'),
  path.join(__dirname, '..', 'models/**/*'),
  path.join(__dirname, '..', 'src/**/*')
], {
  ignored: /node_modules/,
  persistent: true
});

watcher.on('change', (filepath) => {
  console.log(`📝 File changed: ${path.relative(process.cwd(), filepath)}`);
  console.log(`   Reload your browser to see changes`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down dev server...');
  watcher.close();
  process.exit(0);
});

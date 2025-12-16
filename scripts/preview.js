#!/usr/bin/env node

/**
 * Preview the docs site locally
 * Simple static server for testing before deployment
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Serve docs directory
const docsDir = path.join(__dirname, '..', 'docs');
app.use(express.static(docsDir));

// Serve dist directory
const distDir = path.join(__dirname, '..', 'dist');
app.use('/dist', express.static(distDir));

app.listen(PORT, () => {
  console.log(`🎵 STLayinAlive - Preview Server`);
  console.log(`================================`);
  console.log(`\n✓ Preview available at http://localhost:${PORT}`);
  console.log(`✓ This is how the site will look on GitHub Pages`);
  console.log(`\nPress Ctrl+C to stop\n`);
});

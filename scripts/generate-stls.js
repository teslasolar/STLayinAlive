#!/usr/bin/env node

/**
 * Generate STL files from all models
 * This script is run by CI/CD and can be run locally
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
import { ModelRegistry } from '../models/index.js';
import { saveSTLNode } from '../src/exporters/index.js';

const DIST_DIR = path.join(__dirname, '..', 'dist');

async function ensureDistDir() {
  try {
    await fs.mkdir(DIST_DIR, { recursive: true });
    console.log(`✓ Created dist directory: ${DIST_DIR}`);
  } catch (error) {
    console.error('Error creating dist directory:', error);
  }
}

async function generateSTL(name, ModelClass, category) {
  try {
    console.log(`\nGenerating ${name}...`);
    
    // Create model instance with default parameters
    const model = new ModelClass();
    
    // Generate geometry
    const geometry = model.generate();
    
    // Export to STL
    const filename = `${name}.stl`;
    const filepath = path.join(DIST_DIR, filename);
    
    await saveSTLNode(geometry, filepath);
    
    // Get file size
    const stats = await fs.stat(filepath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`  ✓ Generated ${filename} (${sizeMB} MB)`);
    console.log(`  Parameters:`, model.params);
    
    return { name, filename, size: stats.size, params: model.params };
  } catch (error) {
    console.error(`  ✗ Error generating ${name}:`, error.message);
    return null;
  }
}

async function generateAllSTLs() {
  console.log('🎵 STLayinAlive - STL Generation\n');
  console.log('================================\n');
  
  await ensureDistDir();
  
  const results = [];
  
  // Generate STLs for all models
  for (const [categoryName, models] of Object.entries(ModelRegistry)) {
    console.log(`\n📁 Category: ${categoryName}`);
    
    for (const [modelName, ModelClass] of Object.entries(models)) {
      const result = await generateSTL(modelName, ModelClass, categoryName);
      if (result) {
        results.push(result);
      }
    }
  }
  
  // Generate manifest file
  const manifest = {
    generated: new Date().toISOString(),
    models: results,
    count: results.length
  };
  
  await fs.writeFile(
    path.join(DIST_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('\n================================');
  console.log(`\n✓ Generated ${results.length} STL files`);
  console.log(`✓ Manifest created: dist/manifest.json`);
  console.log('\n🎵 Ahhh AHhhh ahhhh STLayin Alive!\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllSTLs().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateAllSTLs };

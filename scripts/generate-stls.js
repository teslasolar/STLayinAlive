#!/usr/bin/env node

/**
 * Generate STL files from all models
 * This script is run by CI/CD and can be run locally
 * Now uses index.yaml for configuration - no hardcoding!
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig, buildModelRegistry } from '../src/core/config-loader.js';
import { saveSTLNode } from '../src/exporters/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');

async function ensureDistDir() {
  try {
    await fs.mkdir(DIST_DIR, { recursive: true });
    console.log(`✓ Created dist directory: ${DIST_DIR}`);
  } catch (error) {
    console.error('Error creating dist directory:', error);
  }
}

async function generateSTL(modelConfig, ModelClass) {
  try {
    console.log(`\nGenerating ${modelConfig.id}...`);
    
    // Build default params from config
    const defaultParams = {};
    for (const [key, paramConfig] of Object.entries(modelConfig.params)) {
      defaultParams[key] = paramConfig.value;
    }
    
    // Create model instance with configured parameters
    const model = new ModelClass(defaultParams);
    
    // Generate geometry
    const geometry = model.generate();
    
    // Export to STL
    const filename = `${modelConfig.id}.stl`;
    const filepath = path.join(DIST_DIR, filename);
    
    await saveSTLNode(geometry, filepath);
    
    // Get file size
    const stats = await fs.stat(filepath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`  ✓ Generated ${filename} (${sizeMB} MB)`);
    console.log(`  Parameters:`, model.params);
    
    return { 
      id: modelConfig.id,
      name: modelConfig.name,
      filename, 
      size: stats.size, 
      params: model.params,
      category: modelConfig.category
    };
  } catch (error) {
    console.error(`  ✗ Error generating ${modelConfig.id}:`, error.message);
    return null;
  }
}

async function generateAllSTLs() {
  console.log('🎵 STLayinAlive - STL Generation (YAML-Driven)\n');
  console.log('================================================\n');
  
  await ensureDistDir();
  
  // Load configuration from index.yaml
  console.log('📋 Loading configuration from index.yaml...');
  const config = await loadConfig();
  console.log(`✓ Loaded ${config.models.length} model(s) from config\n`);
  
  // Build model registry
  const registry = await buildModelRegistry(config);
  
  const results = [];
  
  // Group by category for display
  const categorized = {};
  for (const modelConfig of config.models) {
    if (!categorized[modelConfig.category]) {
      categorized[modelConfig.category] = [];
    }
    categorized[modelConfig.category].push(modelConfig);
  }
  
  // Generate STLs for all models
  for (const [categoryId, models] of Object.entries(categorized)) {
    const categoryInfo = config.categories.find(c => c.id === categoryId);
    const categoryName = categoryInfo ? categoryInfo.name : categoryId;
    
    console.log(`\n${categoryInfo?.icon || '📁'} Category: ${categoryName}`);
    
    for (const modelConfig of models) {
      const ModelClass = registry[categoryId][modelConfig.id].ModelClass;
      const result = await generateSTL(modelConfig, ModelClass);
      if (result) {
        results.push(result);
      }
    }
  }
  
  // Generate manifest file
  const manifest = {
    generated: new Date().toISOString(),
    config_source: 'index.yaml',
    models: results,
    count: results.length,
    categories: config.categories,
    settings: config.settings
  };
  
  await fs.writeFile(
    path.join(DIST_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  // Generate gallery config
  const galleryConfig = {
    settings: config.settings,
    categories: config.categories,
    models: results.map(r => {
      const modelConfig = config.models.find(m => m.id === r.id);
      return {
        id: r.id,
        name: r.name,
        category: r.category,
        description: modelConfig.description,
        icon: modelConfig.icon,
        tags: modelConfig.tags,
        stlFile: `../dist/${r.filename}`,
        params: Object.entries(modelConfig.params).reduce((acc, [key, cfg]) => {
          acc[key] = `${cfg.value}${cfg.unit}`;
          return acc;
        }, {})
      };
    })
  };
  
  await fs.writeFile(
    path.join(DIST_DIR, 'gallery-config.json'),
    JSON.stringify(galleryConfig, null, 2)
  );
  
  console.log('\n================================================');
  console.log(`\n✓ Generated ${results.length} STL file(s)`);
  console.log(`✓ Manifest: dist/manifest.json`);
  console.log(`✓ Gallery config: dist/gallery-config.json`);
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

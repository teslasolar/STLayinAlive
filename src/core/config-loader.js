/**
 * Generic Model Loader
 * Auto-loads models from index.yaml configuration
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load and parse index.yaml
 */
export async function loadConfig() {
  const configPath = path.join(__dirname, '..', '..', 'index.yaml');
  const configContent = await fs.readFile(configPath, 'utf8');
  return yaml.parse(configContent);
}

/**
 * Dynamically load a model class from module path
 */
export async function loadModelClass(modulePath, className) {
  const fullPath = path.join(__dirname, '..', '..', modulePath);
  const module = await import(fullPath);
  return module[className];
}

/**
 * Build model registry from config
 */
export async function buildModelRegistry(config) {
  const registry = {};

  // Group models by category
  for (const model of config.models) {
    const category = model.category;
    
    if (!registry[category]) {
      registry[category] = {};
    }

    // Dynamically load the model class
    const ModelClass = await loadModelClass(model.module, model.class);
    registry[category][model.id] = {
      ModelClass,
      config: model
    };
  }

  return registry;
}

/**
 * Get all models with their metadata
 */
export async function getAllModels() {
  const config = await loadConfig();
  const models = [];

  for (const model of config.models) {
    models.push({
      id: model.id,
      name: model.name,
      category: model.category,
      description: model.description,
      icon: model.icon,
      tags: model.tags,
      params: model.params,
      module: model.module,
      class: model.class
    });
  }

  return models;
}

/**
 * Get category information
 */
export async function getCategories() {
  const config = await loadConfig();
  return config.categories;
}

/**
 * Get models by category
 */
export async function getModelsByCategory(categoryId) {
  const config = await loadConfig();
  return config.models.filter(m => m.category === categoryId);
}

/**
 * Get single model config by ID
 */
export async function getModelConfig(modelId) {
  const config = await loadConfig();
  return config.models.find(m => m.id === modelId);
}

/**
 * Create model instance from config
 */
export async function createModelFromConfig(modelId, customParams = {}) {
  const modelConfig = await getModelConfig(modelId);
  if (!modelConfig) {
    throw new Error(`Model "${modelId}" not found in configuration`);
  }

  // Load the model class
  const ModelClass = await loadModelClass(modelConfig.module, modelConfig.class);

  // Build default params from config
  const defaultParams = {};
  for (const [key, paramConfig] of Object.entries(modelConfig.params)) {
    defaultParams[key] = paramConfig.value;
  }

  // Merge with custom params
  const params = { ...defaultParams, ...customParams };

  // Create instance
  return new ModelClass(params);
}

/**
 * Generate gallery config JSON for web interface
 */
export async function generateGalleryConfig() {
  const config = await loadConfig();
  
  return {
    settings: config.settings,
    categories: config.categories,
    models: config.models.map(model => ({
      id: model.id,
      name: model.name,
      category: model.category,
      description: model.description,
      icon: model.icon,
      tags: model.tags,
      stlFile: `dist/${model.id}.stl`,
      params: Object.entries(model.params).reduce((acc, [key, cfg]) => {
        acc[key] = `${cfg.value}${cfg.unit}`;
        return acc;
      }, {})
    }))
  };
}

export default {
  loadConfig,
  buildModelRegistry,
  getAllModels,
  getCategories,
  getModelsByCategory,
  getModelConfig,
  createModelFromConfig,
  generateGalleryConfig
};

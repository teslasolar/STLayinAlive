# Claude Development Guide for STLayinAlive

> This file provides executable guidance and code snippets for Claude to assist with the STLayinAlive project.
> Last updated: 2025-12-16

## 🎯 Project Overview

STLayinAlive is a parametric 3D model library with a SCADA-style tag provider system for real-time parameter management and automated STL generation.

**Tech Stack:**
- Node.js + ES Modules
- Three.js for 3D rendering
- @jscad/modeling for CAD operations
- @jscad/stl-serializer for STL export
- GitHub Pages for gallery hosting

## 📋 Development Priorities

### Phase 1: Core Infrastructure ✅ (Mostly Complete)
- [x] Tag provider system implemented
- [x] Core primitives and model base
- [x] STL exporter functionality
- [x] Basic project structure
- [ ] Missing directories need creation

### Phase 2: Build System ⚠️ (In Progress)
- [ ] Create `scripts/` directory
- [ ] Implement `generate-stls.js`
- [ ] Implement `dev-server.js`
- [ ] Implement `watch.js`
- [ ] Implement `preview.js`

### Phase 3: Model Library 🔜
- [ ] Create example models in each category
- [ ] Implement generators/
- [ ] Create parametric model templates
- [ ] Add model validation

### Phase 4: GitHub Pages 🔜
- [ ] Create `docs/` structure
- [ ] Build 3D model viewer
- [ ] Create interactive gallery
- [ ] Deploy to GitHub Pages

---

## 🛠️ Common Tasks & Commands

### Setup and Installation
```bash
# Install dependencies
npm install

# Create missing directories
mkdir -p dist docs scripts models/enclosures src/generators

# Verify structure
tree -L 2
```

### Development Workflow
```bash
# Generate all STL files
npm run build

# Start development server with live reload
npm run dev

# Watch for changes and auto-rebuild
npm run watch

# Preview models
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

### Testing Tag Provider
```javascript
// Test the tag provider system
import { TagProvider } from './src/tag-provider/index.js';

const tags = new TagProvider();

// Subscribe to changes
tags.subscribe('bracket.width', (value) => {
  console.log(`Width changed to: ${value}`);
});

// Update value
tags.setValue('bracket.width', 50);
```

---

## 📝 Code Templates

### 1. Creating a New Parametric Model

```javascript
// models/brackets/corner-bracket.js
import { ModelBase } from '../../src/core/model-base.js';
import { primitives } from '../../src/core/primitives.js';

export class CornerBracket extends ModelBase {
  constructor(params = {}) {
    super('corner-bracket', {
      width: 50,
      height: 50,
      thickness: 3,
      holeRadius: 2.5,
      ...params
    });

    // Register parameters as tags
    this.registerTags(['width', 'height', 'thickness', 'holeRadius']);
  }

  generate() {
    const { width, height, thickness, holeRadius } = this.params;

    // Create L-shaped bracket
    const base = primitives.cuboid({
      size: [width, thickness, height]
    });

    const arm = primitives.cuboid({
      size: [width, height, thickness]
    });

    // Combine geometry
    const bracket = primitives.union(base, arm);

    // Add mounting holes
    const hole = primitives.cylinder({
      radius: holeRadius,
      height: thickness * 2
    });

    return primitives.subtract(bracket, hole);
  }

  validate() {
    const { width, height, thickness } = this.params;
    if (width <= 0 || height <= 0 || thickness <= 0) {
      throw new Error('Dimensions must be positive');
    }
    return true;
  }
}
```

### 2. Build Script Template

```javascript
// scripts/generate-stls.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { STLExporter } from '../src/exporters/stl-exporter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const MODELS_DIR = path.join(PROJECT_ROOT, 'models');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

async function generateSTLs() {
  console.log('🚀 Starting STL generation...');

  // Ensure dist directory exists
  await fs.mkdir(DIST_DIR, { recursive: true });

  // Get all model categories
  const categories = await fs.readdir(MODELS_DIR);

  for (const category of categories) {
    const categoryPath = path.join(MODELS_DIR, category);
    const stat = await fs.stat(categoryPath);

    if (!stat.isDirectory()) continue;

    console.log(`📁 Processing category: ${category}`);

    // Create output directory
    const outputDir = path.join(DIST_DIR, category);
    await fs.mkdir(outputDir, { recursive: true });

    // Find all model files
    const files = await fs.readdir(categoryPath);
    const modelFiles = files.filter(f => f.endsWith('.js'));

    for (const file of modelFiles) {
      try {
        const modelPath = path.join(categoryPath, file);
        const { default: ModelClass } = await import(modelPath);

        if (!ModelClass) continue;

        // Instantiate model with default parameters
        const model = new ModelClass();
        const geometry = model.generate();

        // Export to STL
        const exporter = new STLExporter();
        const stlData = exporter.export(geometry);

        const outputFile = path.join(outputDir, `${model.name}.stl`);
        await fs.writeFile(outputFile, stlData);

        console.log(`  ✅ Generated: ${model.name}.stl`);
      } catch (error) {
        console.error(`  ❌ Failed to generate ${file}:`, error.message);
      }
    }
  }

  console.log('✨ STL generation complete!');
}

generateSTLs().catch(console.error);
```

### 3. Development Server Template

```javascript
// scripts/dev-server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const PORT = 3000;

const app = express();

// Serve static files
app.use('/models', express.static(path.join(PROJECT_ROOT, 'dist')));
app.use('/docs', express.static(path.join(PROJECT_ROOT, 'docs')));
app.use(express.static(path.join(PROJECT_ROOT, 'docs')));

// Watch for changes
const watcher = chokidar.watch(
  [
    path.join(PROJECT_ROOT, 'models/**/*.js'),
    path.join(PROJECT_ROOT, 'src/**/*.js')
  ],
  {
    ignored: /node_modules/,
    persistent: true
  }
);

watcher.on('change', (filePath) => {
  console.log(`🔄 File changed: ${filePath}`);
  console.log('🔨 Rebuilding...');
  // Trigger rebuild here
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`👀 Watching for changes...`);
});
```

### 4. GitHub Pages Viewer Template

```html
<!-- docs/viewer.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>STLayinAlive - 3D Model Viewer</title>
  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
      }
    }
  </script>
  <style>
    body { margin: 0; overflow: hidden; font-family: Arial, sans-serif; }
    #viewer { width: 100vw; height: 100vh; }
    #controls {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(255,255,255,0.9);
      padding: 20px;
      border-radius: 8px;
      max-width: 300px;
    }
  </style>
</head>
<body>
  <div id="viewer"></div>
  <div id="controls">
    <h2>Model Parameters</h2>
    <div id="param-controls"></div>
  </div>

  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { STLLoader } from 'three/addons/loaders/STLLoader.js';

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(100, 100, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('viewer').appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add grid
    const gridHelper = new THREE.GridHelper(200, 20);
    scene.add(gridHelper);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Load STL
    const loader = new STLLoader();
    const modelPath = new URLSearchParams(window.location.search).get('model');

    if (modelPath) {
      loader.load(modelPath, (geometry) => {
        const material = new THREE.MeshPhongMaterial({
          color: 0x00ff00,
          specular: 0x111111,
          shininess: 200
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Center the model
        geometry.center();
        scene.add(mesh);
      });
    }

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
```

---

## 🎨 Architecture Guidelines

### Tag Provider Pattern
```javascript
// ✅ DO: Use tag subscriptions for reactive updates
tags.subscribe('model.parameter', (value) => {
  model.updateParameter(value);
  regenerateSTL();
});

// ❌ DON'T: Poll for changes
setInterval(() => {
  const value = tags.getValue('model.parameter');
  // ... check if changed
}, 100);
```

### Model Organization
```
models/
├── category/
│   ├── model-name.js        # Model definition
│   ├── model-name.test.js   # Unit tests
│   └── README.md            # Category documentation
```

### Export Conventions
```javascript
// ✅ DO: Named exports for utilities, default for main class
export default class MyModel extends ModelBase { }
export { helperFunction, constants };

// ✅ DO: Use descriptive parameter names
this.params = {
  outerDiameter: 50,
  innerDiameter: 40,
  height: 10
};

// ❌ DON'T: Use abbreviations
this.params = { od: 50, id: 40, h: 10 };
```

---

## 🐛 Debugging

### Common Issues

#### Issue: STL Generation Fails
```bash
# Check if model validates
node -e "
import('./models/brackets/my-bracket.js')
  .then(({ default: Model }) => {
    const m = new Model();
    m.validate();
    console.log('✅ Valid');
  })
  .catch(e => console.error('❌', e));
"
```

#### Issue: Tag Provider Not Updating
```javascript
// Enable debug logging
const tags = new TagProvider({ debug: true });
tags.subscribe('test.value', (val) => console.log('Changed:', val));
tags.setValue('test.value', 42); // Should log
```

#### Issue: Module Import Errors
```bash
# Verify package.json has "type": "module"
grep -A1 "type" package.json

# Use .js extensions in imports
import { TagProvider } from './tag-provider.js'; // ✅
import { TagProvider } from './tag-provider';    // ❌
```

---

## 📚 Reference Documentation

### Key Files to Understand
1. [src/core/model-base.js](src/core/model-base.js) - Base class for all models
2. [src/tag-provider/tag-provider.js](src/tag-provider/tag-provider.js) - Tag system implementation
3. [src/exporters/stl-exporter.js](src/exporters/stl-exporter.js) - STL export logic
4. [package.json](package.json) - Dependencies and scripts

### External Dependencies
- **@jscad/modeling** - CAD operations (boolean operations, primitives)
- **@jscad/stl-serializer** - STL file format export
- **three** - 3D rendering and visualization
- **chokidar** - File watching for dev server
- **express** - Development web server

---

## ✅ Checklist for New Features

- [ ] Create model class extending `ModelBase`
- [ ] Register parameters as tags
- [ ] Implement `generate()` method
- [ ] Add `validate()` method
- [ ] Write tests
- [ ] Update category README
- [ ] Test STL export
- [ ] Verify in viewer
- [ ] Update documentation

---

## 🚀 Quick Commands for Claude

When working on this project, Claude should:

1. **Before creating models:** Read existing models to understand patterns
2. **Before modifying core:** Check dependencies and usage
3. **After changes:** Validate with `npm run build`
4. **For new features:** Update this guide

### Priority Files to Read
```bash
# Core architecture
src/core/model-base.js
src/tag-provider/tag-provider.js
src/exporters/stl-exporter.js

# Example models (once created)
models/brackets/*.js
models/konomi-parts/*.js
```

### Safe Modifications
- ✅ Adding new models
- ✅ Creating build scripts
- ✅ Enhancing tag provider
- ✅ Adding documentation

### Requires Caution
- ⚠️ Changing `ModelBase` API
- ⚠️ Modifying tag provider core
- ⚠️ Altering export format
- ⚠️ Breaking changes to primitives

---

## 📞 Need Help?

If Claude encounters issues:

1. **Read the error message carefully** - often contains the solution
2. **Check this file** for templates and examples
3. **Read existing code** in src/ to understand patterns
4. **Validate assumptions** by testing small pieces
5. **Ask the user** if requirements are unclear

Remember: This is a **parametric CAD library**, not just a static model collection. Focus on:
- Reusability
- Parameterization
- Real-time updates via tag provider
- Clean, maintainable code

---

*This guide is a living document. Update it as the project evolves.*

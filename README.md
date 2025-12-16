# STLayinAlive 🎵
**Ahhh AHhhh ahhhh STLayin Alive** - Konomi Systems 3D Printing STL Library

A parametric 3D model library with SCADA-style tag provider system for real-time parameter management and automated STL generation.

## 🚀 Features

- **Parametric 3D Models**: Define models with configurable parameters
- **Tag Provider System**: SCADA-like real-time value management for dynamic parameter control
- **Automatic STL Export**: Generate production-ready STL files
- **GitHub Pages Gallery**: Interactive 3D model viewer and catalog
- **CI/CD Pipeline**: Automatic STL generation on commit
- **Real-time Preview**: Live parameter updates with tag subscriptions

## 📁 Project Structure

```
STLayinAlive/
├── models/              # 3D model definitions
│   ├── konomi-parts/   # Konomi Systems specific components
│   ├── brackets/       # Mounting brackets
│   ├── enclosures/     # Cases and enclosures
│   └── accessories/    # Miscellaneous parts
├── src/
│   ├── core/           # Core 3D primitives
│   ├── generators/     # Model generation functions
│   ├── exporters/      # STL/OBJ exporters
│   └── tag-provider/   # SCADA-style tag system
├── dist/               # Generated STL files
├── docs/               # GitHub Pages (gallery & viewer)
└── scripts/            # Build automation
```

## 🏷️ Tag Provider System

The tag provider enables SCADA-like real-time parameter management:

```javascript
import { TagProvider } from './src/tag-provider/index.js';

const tags = new TagProvider();

// Subscribe to parameter changes
tags.subscribe('bracket.width', (value) => {
  regenerateModel({ width: value });
});

// Update values (can be from UI, API, or external systems)
tags.setValue('bracket.width', 50);
```

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Generate all STL files
npm run build

# Start development server with live reload
npm run dev

# Deploy to GitHub Pages
npm run deploy
```

## 📦 Creating New Models

```javascript
import { ModelBase } from './src/core/model-base.js';

export class MyPart extends ModelBase {
  constructor(params = {}) {
    super('my-part', params);
    this.registerTags(['width', 'height', 'thickness']);
  }

  generate() {
    const { width, height, thickness } = this.params;
    // Generate 3D geometry
    return geometry;
  }
}
```

## 🌐 GitHub Pages

View the live gallery at: `https://teslasolar.github.io/STLayinAlive/`

## 📄 License

MIT © Konomi Systems 

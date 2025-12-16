# STLayinAlive 🎵
**Ahhh AHhhh ahhhh STLayin Alive** - Konomi Systems 3D Printing STL Library

A parametric 3D model library with **SCADA-style tag provider system** and **multi-agent AI** (Konomi System) for real-time parameter management and automated STL generation.

## 🚀 Features

### 🎨 3D Modeling
- **Parametric 3D Models**: Define models with configurable parameters
- **Tag Provider System**: SCADA-like real-time value management for dynamic parameter control
- **Automatic STL Export**: Generate production-ready STL files
- **GitHub Pages Gallery**: Interactive 3D model viewer and catalog
- **CI/CD Pipeline**: Automatic STL generation on commit
- **Real-time Preview**: Live parameter updates with tag subscriptions

### 🧬 Konomi System (Multi-Agent AI)
- **⚡ eVGPU**: CPU-based tensor operations (NO GPU required!)
- **🧠 FemtoLLM**: 16-dimensional nano AI model (4MB RAM, 0.1s/req)
- **🧊 BlockArray**: 1000³ sparse compute grid with LLM@coordinates
- **🎲 Cube**: 9-agent node system (8 vertices + 1 central coordinator)
- **📡 REST + WebSocket APIs**: Real-time multi-agent coordination
- **🔗 Face Interlock**: Efficient 1M cube operations

## 📁 Project Structure

```
STLayinAlive/
├── models/              # 3D model definitions
│   ├── konomi-parts/   # Konomi Systems specific components (+ demo models)
│   ├── brackets/       # Mounting brackets
│   ├── enclosures/     # Cases and enclosures
│   └── accessories/    # Miscellaneous parts
├── src/
│   ├── core/           # Core components
│   │   ├── model-base.js      # Base class for all models
│   │   ├── primitives.js      # 3D primitive shapes
│   │   ├── evgpu.js           # CPU-based tensor operations
│   │   ├── femto-llm.js       # 16-dim nano AI model
│   │   ├── block-array.js     # 1000³ sparse compute grid
│   │   ├── cube.js            # 9-agent node system
│   │   └── konomi-system.js   # Main orchestrator
│   ├── api/            # REST + WebSocket APIs
│   │   ├── rest-api.js        # HTTP endpoints
│   │   ├── websocket-api.js   # Real-time WebSocket
│   │   └── server.js          # API server entry point
│   ├── generators/     # Model generation functions
│   ├── exporters/      # STL/OBJ exporters
│   └── tag-provider/   # SCADA-style tag system
├── dist/               # Generated STL files
├── docs/               # GitHub Pages (gallery & viewer + Konomi demo)
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

# Start Konomi System API server (REST + WebSocket)
npm run api

# Deploy to GitHub Pages
npm run deploy
```

### 🧬 Using Konomi System

```javascript
import { KonomiSystem } from './src/core/konomi-system.js';

// Initialize system
const konomi = new KonomiSystem();
await konomi.initialize();

// Create 100×100×100 BlockArray
const ba = konomi.createBlockArray('main', [100, 100, 100]);
ba.set(0, 0, 0, 1.0);  // Activate origin

// Place LLM at coordinate
ba.placeLLM(0, 0, 0);
const result = await ba.processAt(0, 0, 0, "Analyze this position");

// Create 9-agent Cube
const cube = konomi.createCube('c1', [0, 0, 0]);
cube.connect('NEU', 'SWD');  // Diagonal connection

// Coordinate task across all vertices
const coordinated = await cube.coordinate("Optimize parameters");

// Shutdown
await konomi.shutdown();
```

### 📡 API Usage

**REST API** (Port 3001):
```bash
# Create BlockArray
curl -X POST http://localhost:3001/api/template/create \
  -H "Content-Type: application/json" \
  -d '{"id": "test", "dimensions": [10,10,10]}'

# Set value
curl -X POST http://localhost:3001/api/value \
  -H "Content-Type: application/json" \
  -d '{"arrayId": "test", "x": 0, "y": 0, "z": 0, "value": 1.0}'

# Get stats
curl http://localhost:3001/api/stats
```

**WebSocket API** (Port 3002):
```javascript
const ws = new WebSocket('ws://localhost:3002');

ws.onopen = () => {
  // Create cube
  ws.send(JSON.stringify({
    action: 'initialize',
    type: 'cube',
    id: 'demo',
    position: [0, 0, 0]
  }));

  // Process at vertex
  ws.send(JSON.stringify({
    action: 'process',
    cubeId: 'demo',
    vertex: 'NEU',
    text: 'Process this task'
  }));
};
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

**🎬 Full Showcase**: `https://teslasolar.github.io/STLayinAlive/showcase.html`
- Interactive iframe-based demo of all features
- Live model gallery with filtering
- Konomi System documentation and examples
- 3D viewer with parameter editing
- Complete API reference and code examples
- Real-time system statistics

## 📄 License

MIT © Konomi Systems 

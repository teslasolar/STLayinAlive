# STLayinAlive Setup Guide

Complete setup and deployment guide for the Konomi Systems 3D Printing Library.

## 🚀 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate STL files
npm run build

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:3000
```

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- GitHub account (for deployment)

## 🔧 Installation

### 1. Clone Repository

```bash
git clone https://github.com/teslasolar/STLayinAlive.git
cd STLayinAlive
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `@jscad/modeling` - 3D modeling library
- `@jscad/stl-serializer` - STL export
- `three` - 3D viewer (for web interface)
- `express` - Development server
- `chokidar` - File watching
- `gh-pages` - GitHub Pages deployment

### 3. Generate STL Files

```bash
npm run build
```

This creates `dist/` directory with:
- All STL files from models
- `manifest.json` with metadata

## 🎮 Development Workflow

### Start Development Server

```bash
npm run dev
```

Opens at http://localhost:3000 with:
- Live gallery interface
- 3D model viewer
- STL download links

### Watch Mode (Auto-regenerate STLs)

```bash
npm run watch
```

Automatically regenerates STL files when model definitions change.

**Recommended: Run both in separate terminals**

```bash
# Terminal 1
npm run dev

# Terminal 2  
npm run watch
```

Now edit models and see changes automatically!

## 🏗️ Creating New Models

### 1. Create Model File

Create `models/[category]/my-model.js`:

```javascript
import { ModelBase } from '../../src/core/model-base.js';
import { createBox } from '../../src/core/primitives.js';

export class MyModel extends ModelBase {
  getDefaultParams() {
    return {
      width: 50,
      height: 30,
      depth: 20
    };
  }

  generate() {
    const { width, height, depth } = this.params;
    return createBox(width, height, depth);
  }
}
```

### 2. Register in Model Registry

Edit `models/index.js`:

```javascript
import { MyModel } from './category/my-model.js';

export const ModelRegistry = {
  // ... existing categories
  myCategory: {
    'my-model': MyModel
  }
};
```

### 3. Generate STL

```bash
npm run build
```

### 4. Add to Gallery

Edit `docs/assets/main.js` and add to `modelCatalog`:

```javascript
{
  id: 'my-model',
  name: 'My Model',
  category: 'myCategory',
  description: 'Description here',
  icon: '🔧',
  stlFile: '../dist/my-model.stl',
  params: {
    width: '50mm',
    height: '30mm'
  }
}
```

## 🏷️ Using Tag Provider

### Basic Usage

```javascript
import { TagProvider } from './src/tag-provider/index.js';

const tags = new TagProvider();

// Register tag
tags.registerTag('bracket.width', {
  defaultValue: 50,
  min: 10,
  max: 200,
  unit: 'mm'
});

// Subscribe to changes
tags.subscribe('bracket.width', (value) => {
  console.log('Width changed to', value);
});

// Update value
tags.setValue('bracket.width', 75);
```

### With Models

```javascript
import { TagProvider } from './src/tag-provider/index.js';
import { MountingBracket } from './models/brackets/mounting-bracket.js';

const tags = new TagProvider();
const bracket = new MountingBracket({}, tags);

// Parameters auto-managed by tag provider
bracket.setParam('width', 75);
bracket.regenerate();
```

See [examples/tag-provider-demo.js](examples/tag-provider-demo.js) for comprehensive examples.

## 🌐 GitHub Pages Deployment

### Enable GitHub Pages

1. Go to repository Settings
2. Navigate to Pages section
3. Source: Deploy from a branch
4. Branch: `gh-pages` / `(root)`
5. Save

### Deploy Manually

```bash
npm run deploy
```

This:
1. Runs `npm run build`
2. Pushes `docs/` to `gh-pages` branch
3. GitHub automatically deploys

### Automatic Deployment (CI/CD)

Already configured! GitHub Actions will:
- Run on every push to `main`
- Generate all STL files
- Commit to `dist/`
- Deploy to GitHub Pages

See [.github/workflows/build-stls.yml](.github/workflows/build-stls.yml)

## 🔍 Testing Before Deployment

```bash
npm run preview
```

Opens at http://localhost:8080 - exactly how it will look on GitHub Pages.

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Generate all STL files |
| `npm run dev` | Start development server with live reload |
| `npm run watch` | Auto-regenerate STLs on file changes |
| `npm run preview` | Preview GitHub Pages site locally |
| `npm run deploy` | Deploy to GitHub Pages |

## 🗂️ Project Structure

```
STLayinAlive/
├── .github/
│   └── workflows/
│       └── build-stls.yml      # CI/CD automation
├── dist/                        # Generated STL files (auto)
│   ├── *.stl
│   └── manifest.json
├── docs/                        # GitHub Pages site
│   ├── index.html              # Main gallery
│   ├── viewer.html             # 3D viewer
│   └── assets/
│       ├── style.css
│       └── main.js
├── examples/                    # Usage examples
│   ├── tag-provider-demo.js
│   └── custom-model.js
├── models/                      # 3D model definitions
│   ├── brackets/
│   ├── konomi-parts/
│   ├── accessories/
│   └── index.js                # Model registry
├── scripts/                     # Build automation
│   ├── generate-stls.js        # STL generation
│   ├── dev-server.js           # Dev server
│   ├── watch.js                # Watch mode
│   └── preview.js              # Preview server
├── src/                         # Library source
│   ├── core/                   # 3D primitives
│   ├── exporters/              # STL export
│   ├── tag-provider/           # SCADA tag system
│   └── index.js
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### STL Files Not Generating

```bash
# Check for errors
npm run build

# Verify model is registered
cat models/index.js
```

### Dev Server Not Starting

```bash
# Check port availability
lsof -i :3000

# Try different port
PORT=3001 npm run dev
```

### Gallery Not Showing Models

1. Ensure STLs are generated: `npm run build`
2. Check `docs/assets/main.js` has model in catalog
3. Verify file paths in catalog entries

### GitHub Pages Not Updating

1. Check Actions tab for errors
2. Verify `gh-pages` branch exists
3. Check Pages settings in repository

## 🎯 Next Steps

1. **Create your first model** - See [examples/custom-model.js](examples/custom-model.js)
2. **Explore tag provider** - Run `node examples/tag-provider-demo.js`
3. **Customize gallery** - Edit `docs/assets/style.css`
4. **Add 3D viewer** - Integrate Three.js STL loader
5. **Deploy** - Push to GitHub and enable Pages

## 📚 Resources

- [JSCAD Documentation](https://openjscad.xyz/)
- [Three.js Documentation](https://threejs.org/docs/)
- [GitHub Pages Guide](https://pages.github.com/)
- [Examples Directory](examples/)

## 🤝 Contributing

See individual model files for contribution guidelines and coding standards.

## 📄 License

MIT © Konomi Systems

---

**Ahhh AHhhh ahhhh STLayin Alive!** 🎵

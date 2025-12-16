# 🎵 STLayinAlive - Quick Reference

**Konomi Systems 3D Printing STL Library**

## ⚡ Quick Start

```bash
npm install          # Install dependencies
npm run build       # Generate STL files
npm run dev         # Start dev server → http://localhost:3000
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `models/index.js` | Register new models here |
| `src/tag-provider/tag-provider.js` | SCADA tag system |
| `scripts/generate-stls.js` | STL generation |
| `docs/index.html` | Gallery page |
| `.github/workflows/build-stls.yml` | CI/CD |

## 🔨 Common Tasks

### Add New Model

```javascript
// 1. Create: models/[category]/my-model.js
import { ModelBase } from '../../src/core/model-base.js';
import { createBox } from '../../src/core/primitives.js';

export class MyModel extends ModelBase {
  getDefaultParams() {
    return { width: 50, height: 30 };
  }
  
  generate() {
    return createBox(this.params.width, this.params.height, 10);
  }
}

// 2. Register: models/index.js
import { MyModel } from './category/my-model.js';
export const ModelRegistry = {
  category: { 'my-model': MyModel }
};

// 3. Generate
npm run build

// 4. Add to gallery: docs/assets/main.js
```

### Use Tag Provider

```javascript
import { TagProvider } from './src/tag-provider/index.js';

const tags = new TagProvider();

// Register with validation
tags.registerTag('part.width', {
  defaultValue: 50,
  min: 10,
  max: 200,
  unit: 'mm'
});

// Subscribe to changes
tags.subscribe('part.width', (value) => {
  console.log('Width:', value);
});

// Update
tags.setValue('part.width', 75);
```

### Development Workflow

```bash
# Terminal 1
npm run dev        # Dev server with live reload

# Terminal 2
npm run watch      # Auto-regenerate STLs

# Edit models → See changes instantly
```

## 🌐 Deployment

### GitHub Pages Setup
1. Settings → Pages
2. Source: "gh-pages" branch
3. Save

### Deploy
```bash
npm run deploy     # Manual deploy
# OR
git push           # Auto-deploy via GitHub Actions
```

## 📋 NPM Scripts

```bash
npm run build      # Generate all STL files
npm run dev        # Dev server (port 3000)
npm run watch      # Auto-regenerate on changes
npm run preview    # Preview Pages site (port 8080)
npm run deploy     # Deploy to GitHub Pages
```

## 🔍 Project Structure

```
STLayinAlive/
├── models/           # Model definitions
├── src/
│   ├── core/        # 3D primitives
│   ├── exporters/   # STL export
│   └── tag-provider/# SCADA system
├── scripts/         # Build automation
├── docs/            # GitHub Pages
├── dist/            # Generated STLs (auto)
└── examples/        # Usage examples
```

## 🏷️ Tag Provider Features

- ✅ Real-time subscriptions
- ✅ Range validation
- ✅ Automatic alarms
- ✅ Historical tracking
- ✅ Tag grouping
- ✅ Export/import
- ✅ Quality indicators

## 🎨 3D Primitives

```javascript
import { 
  createBox,
  createCylinder,
  createSphere,
  createMountingHole,
  createHolePattern,
  ops,
  transform
} from './src/core/primitives.js';

// Create shapes
const box = createBox(50, 30, 20);
const cyl = createCylinder(10, 30);

// Boolean ops
const part = ops.subtract(box, cyl);

// Transform
const moved = transform.translate([10, 0, 0], part);
```

## 📚 Documentation

- [README.md](README.md) - Overview
- [SETUP.md](SETUP.md) - Complete guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - What's built
- [examples/](examples/) - Code examples

## 🐛 Troubleshooting

**STLs not generating?**
```bash
npm run build
# Check models/index.js for registry
```

**Dev server won't start?**
```bash
lsof -i :3000  # Check port
PORT=3001 npm run dev  # Use different port
```

**GitHub Pages not updating?**
- Check Actions tab for errors
- Verify gh-pages branch exists
- Check Settings → Pages configuration

## 🎯 Examples

Run included examples:
```bash
node examples/tag-provider-demo.js
node examples/custom-model.js
```

## 🔗 URLs

After deployment:
- **Gallery**: `https://teslasolar.github.io/STLayinAlive/`
- **Local Dev**: `http://localhost:3000`
- **Local Preview**: `http://localhost:8080`

## 💡 Tips

1. **Use watch mode** during development
2. **Tag groups** organize related parameters
3. **Subscribe to tags** for auto-regeneration
4. **Preview before deploy** with `npm run preview`
5. **Check manifest.json** after build for metadata

---

**Ahhh AHhhh ahhhh STLayin Alive!** 🎵

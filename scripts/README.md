# Scripts

Automation scripts for STLayinAlive.

## Available Scripts

### `generate-stls.js`
Generate all STL files from model definitions.

```bash
npm run build
```

This script:
- Creates the `dist/` directory
- Generates STL files for all models in the registry
- Creates a manifest.json file with metadata
- Runs automatically in CI/CD

### `dev-server.js`
Start development server with live reload.

```bash
npm run dev
```

Features:
- Serves the docs folder at http://localhost:3000
- Watches for file changes
- Serves STL files from dist folder
- Perfect for developing the gallery interface

### `watch.js`
Watch mode for automatic STL regeneration.

```bash
npm run watch
```

Automatically regenerates all STL files when model definitions change.
Great for rapid prototyping and testing.

### `preview.js`
Preview the GitHub Pages site locally.

```bash
npm run preview
```

Simple static server that mimics GitHub Pages environment.
Use this to test the site before deployment.

## Usage Examples

**Development workflow:**
```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Watch for model changes
npm run watch

# Edit models in models/ directory
# Changes auto-regenerate STLs
# Refresh browser to see updates
```

**Production build:**
```bash
# Generate all STLs
npm run build

# Preview before deployment
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## Adding New Models

1. Create model file in `models/[category]/`
2. Add to ModelRegistry in `models/index.js`
3. Run `npm run build` to generate STL
4. Add to gallery catalog in `docs/assets/main.js`

The automation scripts will handle the rest!

# STLayinAlive Directory Structure

> Documentation of the directory structure for the Konomi Systems 3D Printing STL Library
>
> Generated: 2025-12-16

## 📂 Root Directory

```
STLayinAlive/
├── .github/             # GitHub configuration and workflows
├── models/              # 3D model definitions (existing)
├── src/                 # Source code
├── dist/                # Generated STL files (to be created)
├── docs/                # GitHub Pages site (to be created)
├── scripts/             # Build automation scripts (to be created)
├── package.json         # Project dependencies and scripts
├── README.md            # Project documentation
└── .gitignore           # Git ignore rules
```

## 🔍 Detailed Directory Breakdown

### `.github/` - GitHub Configuration
**Status:** ✅ Exists

Contains GitHub-specific configuration files and CI/CD workflows.

```
.github/
└── workflows/
    └── build-stls.yml   # Automated STL generation pipeline
```

**Purpose:**
- Automated CI/CD pipelines
- GitHub Actions workflows for STL generation on commit
- Repository automation

---

### `models/` - 3D Model Definitions
**Status:** ✅ Exists (partially populated)

Organized storage for parametric 3D model definitions.

```
models/
├── konomi-parts/        # ✅ Konomi Systems specific components
├── brackets/            # ✅ Mounting brackets and supports
├── enclosures/          # ⚠️ Cases and enclosures (to be created)
└── accessories/         # ✅ Miscellaneous parts and tools
```

**Purpose:**
- Store parametric model definitions
- Organize models by category
- Each subdirectory contains model classes/files for specific part types

**Current State:**
- ✅ `konomi-parts/` - Exists
- ✅ `brackets/` - Exists
- ⚠️ `enclosures/` - Missing, needs creation
- ✅ `accessories/` - Exists

---

### `src/` - Source Code
**Status:** ✅ Exists

Core application source code and libraries.

```
src/
├── core/                # ✅ Core 3D primitives and base classes
│   ├── index.js         # Main export file
│   ├── model-base.js    # Base class for all models
│   └── primitives.js    # 3D primitive shapes (cube, sphere, etc.)
├── exporters/           # ✅ STL/OBJ file exporters
│   ├── index.js         # Exporter main export
│   └── stl-exporter.js  # STL file generation
├── tag-provider/        # ✅ SCADA-style tag management system
│   ├── index.js         # Tag provider main export
│   ├── tag-provider.js  # Core tag provider implementation
│   ├── tag-group.js     # Tag grouping functionality
│   └── README.md        # Tag provider documentation
├── generators/          # ⚠️ Model generation functions (to be created)
└── index.js             # Main entry point
```

**Purpose:**
- Core functionality for 3D modeling
- Tag provider system for SCADA-like parameter management
- STL/OBJ export capabilities
- Model generation utilities

**Current Implementation:**
- ✅ `core/` - 3 files (index.js, model-base.js, primitives.js)
- ✅ `exporters/` - 2 files (index.js, stl-exporter.js)
- ✅ `tag-provider/` - 4 files (index.js, tag-provider.js, tag-group.js, README.md)
- ⚠️ `generators/` - Missing, should contain model generation functions

---

### `dist/` - Generated STL Files
**Status:** ⚠️ To be created

Output directory for compiled/generated STL files.

```
dist/                    # ⚠️ Build output directory
├── konomi-parts/        # Generated Konomi Systems components
├── brackets/            # Generated brackets
├── enclosures/          # Generated enclosures
└── accessories/         # Generated accessories
```

**Purpose:**
- Store production-ready STL files
- Organized mirror of models/ structure
- Created by `npm run build` script
- Served for downloads via GitHub Pages

**Note:** This directory is typically git-ignored and generated during the build process.

---

### `docs/` - GitHub Pages Site
**Status:** ⚠️ To be created

Static site for the interactive 3D model gallery and viewer.

```
docs/                    # ⚠️ GitHub Pages source
├── index.html           # Main gallery page
├── viewer.html          # 3D model viewer
├── css/                 # Stylesheets
├── js/                  # Client-side JavaScript
├── models/              # Symlink or copy of dist/
└── assets/              # Images, icons, etc.
```

**Purpose:**
- Host interactive 3D model catalog
- Live preview of parametric models
- Documentation and usage guides
- Deployed to: `https://teslasolar.github.io/STLayinAlive/`

---

### `scripts/` - Build Automation
**Status:** ⚠️ To be created

Build scripts and development tools.

```
scripts/                 # ⚠️ Automation scripts
├── generate-stls.js     # STL generation script (npm run build)
├── dev-server.js        # Development server (npm run dev)
├── preview.js           # Preview tool (npm run preview)
└── watch.js             # File watcher (npm run watch)
```

**Purpose:**
- Automate STL generation from model definitions
- Development server with live reload
- File watching for automatic rebuilds
- Preview and testing utilities

**Referenced in package.json:**
```json
{
  "build": "node scripts/generate-stls.js",
  "dev": "node scripts/dev-server.js",
  "preview": "node scripts/preview.js",
  "watch": "node scripts/watch.js"
}
```

---

## 📊 Summary

### Existing Directories (✅)
- `.github/workflows/` - GitHub Actions
- `models/konomi-parts/` - Konomi Systems parts
- `models/brackets/` - Mounting brackets
- `models/accessories/` - Miscellaneous parts
- `src/core/` - Core 3D primitives (3 files)
- `src/exporters/` - STL exporters (2 files)
- `src/tag-provider/` - Tag provider system (4 files)

### Missing Directories (⚠️)
- `models/enclosures/` - Cases and enclosures category
- `src/generators/` - Model generation functions
- `dist/` - Build output directory
- `docs/` - GitHub Pages site
- `scripts/` - Build automation scripts

### Total File Count
- **10 source files** in `src/`
- **1 workflow file** in `.github/workflows/`
- **4 configuration files** in root (package.json, README.md, .gitignore, etc.)

## 🎯 Next Steps

1. **Create missing directories:**
   - `models/enclosures/`
   - `src/generators/`
   - `dist/`
   - `docs/`
   - `scripts/`

2. **Implement build scripts:**
   - `scripts/generate-stls.js` for STL generation
   - `scripts/dev-server.js` for development
   - `scripts/preview.js` for model preview
   - `scripts/watch.js` for file watching

3. **Setup GitHub Pages:**
   - Create `docs/` site structure
   - Implement 3D model viewer
   - Build interactive gallery

4. **Populate model categories:**
   - Add models to each category
   - Create example parametric models
   - Test tag provider integration

---

## 📝 Conventions

### Naming
- Directory names: lowercase with hyphens (e.g., `tag-provider`)
- File names: lowercase with hyphens (e.g., `model-base.js`)
- Class names: PascalCase (e.g., `ModelBase`)

### Organization
- Models organized by functional category
- Source code modular with clear separation of concerns
- Generated files separate from source

### Git
- `dist/` should be git-ignored (generated artifacts)
- `docs/` checked into git (GitHub Pages requirement)
- `node_modules/` git-ignored (dependencies)

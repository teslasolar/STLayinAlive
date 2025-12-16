# 📚 Open Source 3D Libraries & CAD Resources

> Comprehensive directory of open-source 3D object libraries, CAD tools, and parametric modeling resources
>
> Last Updated: 2025-12-16

---

## 🎯 Table of Contents

1. [Parametric CAD Software](#parametric-cad-software)
2. [JavaScript/Web-Based Libraries](#javascriptweb-based-libraries)
3. [OpenSCAD Libraries](#openscad-libraries)
4. [Python CAD Libraries](#python-cad-libraries)
5. [3D Model Repositories](#3d-model-repositories)
6. [Parts & Components Libraries](#parts--components-libraries)
7. [Utilities & Tools](#utilities--tools)

---

## 🔧 Parametric CAD Software

### **FreeCAD**
**The most powerful open-source parametric 3D CAD modeler**

- 🌐 **Website**: [freecad.org](https://www.freecad.org/) | [freecadweb.org](https://www.freecadweb.org/)
- 📦 **GitHub**: [FreeCAD/FreeCAD](https://github.com/FreeCAD/FreeCAD)
- 📄 **Formats**: STEP, IGES, STL, SVG, DXF, OBJ, IFC, DAE
- ✨ **Features**:
  - Version 1.0 released (2025 milestone)
  - Full parametric modeling
  - Python scripting API
  - Assembly workbench
  - CAM/CNC capabilities
  - FEM analysis
- 📖 **Use Case**: General-purpose CAD, engineering, architecture

### **OpenSCAD**
**The Programmer's Solid 3D CAD Modeller**

- 🌐 **Website**: [openscad.org](https://openscad.org/)
- 📦 **GitHub**: [openscad/openscad](https://github.com/openscad/openscad)
- 📄 **Formats**: STL, OFF, AMF, 3MF, DXF
- ✨ **Features**:
  - Text-based scripting (CSG)
  - Perfect for programmers
  - Precision and parameterization
  - Great for 3D printing
  - Version control friendly
- 📖 **Use Case**: Parametric parts, mechanical components, 3D printing

### **SolveSpace**
**Parametric 2D/3D CAD with constraints**

- 🌐 **Website**: [solvespace.com](https://solvespace.com/)
- 📦 **GitHub**: [solvespace/solvespace](https://github.com/solvespace/solvespace)
- 📄 **Formats**: STL, DXF, PDF, SVG, STEP
- ✨ **Features**:
  - Constraint-based modeling
  - 2D and 3D sketching
  - Lightweight and fast
  - Assembly support
- 📖 **Use Case**: Mechanical parts, assemblies, 2D technical drawings

---

## 💻 JavaScript/Web-Based Libraries

### **JSCAD (OpenJSCAD.org)**
**Programmatic CAD in JavaScript for the browser and Node.js**

- 🌐 **Website**: [openjscad.xyz](https://openjscad.xyz/)
- 📦 **GitHub**: [jscad/OpenJSCAD.org](https://github.com/jscad/OpenJSCAD.org)
- 📦 **NPM**: [@jscad/modeling](https://www.npmjs.com/package/@jscad/modeling)
- 📄 **Formats**: STL, OBJ, 3MF, AMF, DXF, SVG
- ✨ **Features**:
  - CSG boolean operations
  - Primitives, extrusions, hulls
  - Transforms and measurements
  - Browser and Node.js support
  - React integration (react-three-fiber)
- 📖 **Tutorial**: [Getting Started](https://openjscad.xyz/docs/tutorial-01_gettingStarted.html)

**Installation**:
```bash
npm install @jscad/modeling
```

**Example**:
```javascript
const { cylinder } = require('@jscad/modeling').primitives

const hex = (radius, height) => {
  return cylinder({radius, height, segments: 6})
}

module.exports = { main: () => hex(6, 2) }
```

**Resources**:
- [CodeSandbox Examples](https://codesandbox.io/examples/package/@jscad/modeling)
- [GitHub Examples](https://github.com/topics/jscad)
- [Legacy OpenJSCAD](https://joostn.github.io/OpenJsCad/)

### **JSxCAD**
**Advanced CAD in JavaScript with computational geometry**

- 📦 **GitHub**: [jsxcad/JSxCAD](https://github.com/jsxcad/JSxCAD)
- ✨ **Features**:
  - Advanced computational geometry
  - File format support
  - Web-based modeling

### **Three.js**
**JavaScript 3D library for rendering**

- 🌐 **Website**: [threejs.org](https://threejs.org/)
- 📦 **GitHub**: [mrdoob/three.js](https://github.com/mrdoob/three.js)
- 📦 **NPM**: `three@^0.160.0`
- ✨ **Features**:
  - WebGL rendering
  - STL loader
  - 3D visualization
  - VR/AR support

---

## 🔷 OpenSCAD Libraries

### **BOSL2 (Belfry OpenSCAD Library v2)**
**The most comprehensive OpenSCAD library**

- 📦 **GitHub**: [BelfrySCAD/BOSL2](https://github.com/BelfrySCAD/BOSL2)
- 📖 **Wiki**: [BOSL2 Wiki](https://github.com/BelfrySCAD/BOSL2/wiki)
- 📰 **Article**: [Hackaday Coverage](https://hackaday.com/2025/02/18/belfry-openscad-library-bosl2-brings-useful-parts-and-tools-aplenty/)

**Features**:
- **Attachments**: Position components relative to each other
- **Parts Library**: Gears, threading (bottle, pipe, screws)
- **Building Blocks**: Prisms, tubes, geometric shapes
- **Texturing**: Emboss images onto models
- **Transforms**: Advanced manipulation tools
- **Math**: Vector operations, geometry functions

**Categories**:
- Shapes (2D & 3D primitives)
- Masks (rounding, chamfering)
- Attachables (smart positioning)
- Gears (involute, bevel, worm)
- Threading (metric, UTS, ACME, pipe)
- Screws & Bolts
- Bezier curves
- Knurling
- Rounding & Filleting

**Installation**:
```scad
include <BOSL2/std.scad>
```

### **MCAD Library**
**Classic OpenSCAD library (now deprecated)**

- 📦 **GitHub**: [openscad/MCAD](https://github.com/openscad/MCAD)
- ⚠️ **Status**: Outdated, replaced by BOSL2
- 📖 **Note**: [Issue #5256](https://github.com/openscad/openscad/issues/5256) discusses including BOSL2 instead

### **OpenSCAD Libraries Index**
**Official library listing**

- 🌐 **Website**: [openscad.org/libraries.html](https://openscad.org/libraries.html)
- 📚 **Includes**: BOSL2, MCAD, and community libraries

---

## 🐍 Python CAD Libraries

### **CadQuery**
**Parametric CAD scripting in Python**

- 📦 **GitHub**: [CadQuery/cadquery](https://github.com/CadQuery/cadquery)
- 📖 **Docs**: [cadquery.readthedocs.io](https://cadquery.readthedocs.io/)
- 📦 **PyPI**: `cadquery`

**Features**:
- Built on OCCT (Open CASCADE)
- Faster than OpenSCAD for complex models
- Exports: STEP, STL, AMF, 3MF, DXF, SVG
- Loss-less CAD formats (STEP)
- Intuitive Python API

**Installation**:
```bash
pip install cadquery
```

**Example**:
```python
import cadquery as cq

result = (cq.Workplane("XY")
    .box(10, 10, 5)
    .faces(">Z")
    .hole(2))

cq.exporters.export(result, 'box.stl')
```

**Resources**:
- [FileFormat Products](https://products.fileformat.com/cad/python/cadquery/)

### **Build123d**
**Next-generation Python CAD library**

- 📦 **GitHub**: [gumyr/build123d](https://github.com/gumyr/build123d)
- ✨ **Features**:
  - Modern Python API
  - Based on OCCT
  - Improved over CadQuery

### **SolidPython**
**Python wrapper for OpenSCAD**

- 📦 **GitHub**: [SolidCode/SolidPython](https://github.com/SolidCode/SolidPython)
- ✨ **Features**:
  - Generate OpenSCAD code from Python
  - Parametric modeling
  - Python's power + OpenSCAD's precision

---

## 🗄️ 3D Model Repositories

### **Thingiverse**
**Largest 3D printing community**

- 🌐 **Website**: [thingiverse.com](https://www.thingiverse.com/)
- 📄 **Formats**: STL, OBJ, SCAD
- ✨ **Features**:
  - Millions of free models
  - Customizer (parametric)
  - Community remixes
  - Collections and groups
- 📖 **OpenSCAD Group**: [Thingiverse OpenSCAD](https://makerware.thingiverse.com/groups/openscad/forums/general)

### **Printables**
**Prusa's 3D model repository**

- 🌐 **Website**: [printables.com](https://www.printables.com/)
- ✨ **Features**:
  - High-quality curated models
  - Contests and badges
  - Make contributions
  - No ads

### **MyMiniFactory**
**Curated 3D printable models**

- 🌐 **Website**: [myminifactory.com](https://www.myminifactory.com/)
- ✨ **Features**:
  - All models test-printed
  - Quality assurance
  - Designer support

### **GrabCAD**
**Professional CAD library**

- 🌐 **Website**: [grabcad.com](https://grabcad.com/)
- 📄 **Formats**: STEP, IGES, STL, native CAD
- ✨ **Features**:
  - Professional engineering models
  - Community library
  - CAD workbench integration

### **GitHub 3D Models**
**Version-controlled 3D models**

- 🔍 **Search**: [GitHub Topics: 3d-models](https://github.com/topics/3d-models)
- 🔍 **JavaScript**: [3d-models + JavaScript](https://github.com/topics/3d-models?l=javascript&o=desc&s=updated)
- ✨ **Benefits**:
  - Version control
  - Collaboration
  - Open source licensing

---

## 🔩 Parts & Components Libraries

### **ISO/DIN/ANSI Standard Parts**

**FreeCAD Fasteners Workbench**:
- Bolts, screws, nuts, washers
- ISO, DIN, ANSI standards
- Parametric sizing

**BOSL2 Threading**:
- Metric (ISO)
- UTS (Unified Thread Standard)
- ACME threads
- Pipe threads (NPT, BSP)
- Bottle threads (PCO-1810, PCO-1881)

### **Mechanical Components**

**BOSL2 Parts**:
- Gears (involute, bevel, worm, rack & pinion)
- Bearings (ball, linear)
- Springs
- Hinges
- Snap joints

**CadQuery Parts Library**:
- Parametric fasteners
- Enclosures
- Brackets
- Connectors

### **Electronics & Enclosures**

**Ultimate Box Maker** (OpenSCAD):
- Parametric enclosures
- Mounting holes
- Ventilation patterns

**Hammond Box Generator** (JSCAD/OpenSCAD):
- Electronics enclosures
- Cable entry
- Mounting bosses

---

## 🛠️ Utilities & Tools

### **Modeling Tools**

**Open3D**:
- 🌐 **Website**: [open3d.org](https://www.open3d.org/)
- 📦 **GitHub**: [isl-org/Open3D](https://github.com/isl-org/Open3D)
- ✨ **Features**: 3D data processing, point clouds, mesh manipulation

**MeshLab**:
- 🌐 **Website**: [meshlab.net](https://www.meshlab.net/)
- ✨ **Features**: Mesh cleaning, repair, analysis

**Blender** (with CAD addons):
- 🌐 **Website**: [blender.org](https://www.blender.org/)
- ✨ **Features**: CAD precision tools, parametric modeling addons

### **Format Converters**

**@jscad/stl-serializer**:
- 📦 **NPM**: `@jscad/stl-serializer`
- ✨ **Features**: STL import/export for JSCAD

**STEP to STL Converters**:
- FreeCAD (batch conversion)
- CadQuery exporters
- Online tools

### **Visualization**

**Three.js STL Viewer**:
```javascript
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
const loader = new STLLoader()
loader.load('model.stl', (geometry) => {
  // Render geometry
})
```

**Shapesmith**:
- 🌐 **Website**: [shapesmith.net](https://shapesmith.net/)
- ✨ **Features**: Web-based parametric modeling, STL import/export

---

## 📖 Learning Resources

### **Documentation**

- [OpenSCAD Cheat Sheet](https://openscad.org/cheatsheet/)
- [JSCAD Documentation](https://openjscad.xyz/docs/)
- [CadQuery Documentation](https://cadquery.readthedocs.io/)
- [BOSL2 Tutorial](https://github.com/BelfrySCAD/BOSL2/wiki/Tutorial-Getting-Started)

### **Tutorials**

- [FreeCAD YouTube Channel](https://www.youtube.com/@FreeCADProject)
- [OpenSCAD Tutorial Series](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/The_OpenSCAD_Language)
- [JSCAD Getting Started](https://openjscad.xyz/docs/tutorial-01_gettingStarted.html)

### **Communities**

- [FreeCAD Forum](https://forum.freecad.org/)
- [OpenSCAD Forum](https://forum.openscad.org/)
- [r/OpenSCAD](https://www.reddit.com/r/openscad/)
- [r/3Dprinting](https://www.reddit.com/r/3Dprinting/)

---

## 🔗 Integration with STLayinAlive

Our project uses:
- ✅ **@jscad/modeling** - Core 3D primitives
- ✅ **@jscad/stl-serializer** - STL export
- ✅ **Three.js** - 3D visualization
- 🎯 **Compatible with**: OpenSCAD libraries can be converted
- 🎯 **Compatible with**: CadQuery models can export to STEP/STL
- 🎯 **Compatible with**: FreeCAD parts can be imported as STEP/STL

---

## 📊 Comparison Matrix

| Library/Tool | Language | Parametric | STL Export | Web-Based | Learning Curve |
|-------------|----------|------------|------------|-----------|----------------|
| **FreeCAD** | Python | ✅ | ✅ | ❌ | Medium |
| **OpenSCAD** | DSL | ✅ | ✅ | ❌ | Low |
| **CadQuery** | Python | ✅ | ✅ | ❌ | Medium |
| **JSCAD** | JavaScript | ✅ | ✅ | ✅ | Low |
| **BOSL2** | OpenSCAD | ✅ | ✅ | ❌ | Medium |
| **Three.js** | JavaScript | ❌ | Viewer | ✅ | Medium |

---

## 🎯 Recommended Workflow

### For 3D Printing:
1. **Design**: OpenSCAD + BOSL2 or JSCAD
2. **Export**: STL format
3. **Slice**: PrusaSlicer, Cura
4. **Print**: Any FDM/SLA printer

### For Engineering:
1. **Design**: FreeCAD or CadQuery
2. **Export**: STEP (lossless) or STL
3. **Analyze**: FreeCAD FEM or external tools
4. **Manufacture**: CNC/CAM from STEP

### For Web Applications:
1. **Model**: JSCAD (JavaScript)
2. **Visualize**: Three.js
3. **Export**: STL/OBJ via @jscad/stl-serializer
4. **Deploy**: GitHub Pages

---

## 📚 Sources

- [Best Free CAD Software 2025](https://www.cadsoftwarehub.com/blog/the-best-free-open-source-cad-software-in-2025-cad/)
- [Top 18 Open-Source CAD Software](https://www.sculpteo.com/en/3d-learning-hub/3d-printing-software/best-open-source-cad-software/)
- [OpenSCAD Official Site](https://openscad.org/)
- [BOSL2 GitHub](https://github.com/BelfrySCAD/BOSL2)
- [BOSL2 Hackaday Article](https://hackaday.com/2025/02/18/belfry-openscad-library-bosl2-brings-useful-parts-and-tools-aplenty/)
- [CadQuery GitHub](https://github.com/CadQuery/cadquery)
- [JSCAD Documentation](https://openjscad.xyz/docs/)
- [FreeCAD Official](https://www.freecad.org/)

---

**Last Updated**: 2025-12-16
**Maintained by**: Konomi Systems
**License**: MIT

🎵 **Ahhh AHhhh ahhhh STLayin Alive!** 🎵

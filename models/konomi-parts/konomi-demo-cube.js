/**
 * Konomi Demo Cube
 * Demonstrates integration with Konomi System (eVGPU, FemtoLLM, BlockArray, Cube)
 */

import { ModelBase } from '../../src/core/model-base.js';
import { primitives } from '../../src/core/primitives.js';
import { KonomiSystem } from '../../src/core/konomi-system.js';

export default class KonomiDemoCube extends ModelBase {
  constructor(params = {}) {
    super('konomi-demo-cube', {
      size: 20,           // Cube size in mm
      thickness: 2,       // Wall thickness
      chamfer: 1,         // Edge chamfer
      gridSize: 10,       // Internal BlockArray grid (10x10x10)
      enableAI: true,     // Enable AI processing demo
      ...params
    });

    // Register parameters as tags
    this.registerTags(['size', 'thickness', 'chamfer', 'gridSize', 'enableAI']);

    // Konomi System instance (optional, for demonstration)
    this.konomiSystem = null;
  }

  /**
   * Initialize Konomi System for this model
   */
  async initKonomi() {
    if (!this.konomiSystem) {
      this.konomiSystem = new KonomiSystem({
        logLevel: 'info',
        defaultDimensions: [
          this.params.gridSize,
          this.params.gridSize,
          this.params.gridSize
        ]
      });
      await this.konomiSystem.initialize();

      // Create BlockArray for this cube
      const ba = this.konomiSystem.createBlockArray('demo-cube', [
        this.params.gridSize,
        this.params.gridSize,
        this.params.gridSize
      ]);

      // Activate corners
      ba.set(0, 0, 0, 1.0);
      ba.set(this.params.gridSize - 1, 0, 0, 1.0);
      ba.set(0, this.params.gridSize - 1, 0, 1.0);
      ba.set(0, 0, this.params.gridSize - 1, 1.0);

      // Create 9-agent Cube
      const cube = this.konomiSystem.createCube('demo-agent', [0, 0, 0]);
      cube.connect('NEU', 'SWD');
      cube.connect('NWU', 'SED');

      console.log('✅ Konomi System initialized for demo cube');
      console.log(`   BlockArray: ${this.params.gridSize}³ grid`);
      console.log(`   Active cubes: ${ba.metadata.activeCubes}`);
      console.log(`   Agent cube: 9 vertices, ${cube.getAllEdges().length} edges`);
    }

    return this.konomiSystem;
  }

  /**
   * Generate the 3D geometry
   */
  generate() {
    const { size, thickness, chamfer } = this.params;

    // Create outer cube
    const outer = primitives.cuboid({
      size: [size, size, size]
    });

    // Create inner cavity
    const innerSize = size - (thickness * 2);
    const inner = primitives.cuboid({
      size: [innerSize, innerSize, innerSize]
    });

    // Hollow cube
    let geometry = primitives.subtract(outer, inner);

    // Add chamfers to edges (simplified - real version would chamfer all edges)
    if (chamfer > 0) {
      const chamferCube = primitives.cuboid({
        size: [size - chamfer, size - chamfer, size - chamfer]
      });
      geometry = primitives.intersect(geometry, chamferCube);
    }

    // If AI is enabled, log processing (demonstration)
    if (this.params.enableAI && typeof window === 'undefined') {
      // Server-side only
      this.initKonomi().then(konomi => {
        console.log('🧬 Konomi System stats:');
        console.log(konomi.getStats());
      }).catch(err => {
        console.error('Failed to initialize Konomi:', err.message);
      });
    }

    return geometry;
  }

  /**
   * Validate parameters
   */
  validate() {
    const { size, thickness, chamfer } = this.params;

    if (size <= 0) {
      throw new Error('Size must be positive');
    }

    if (thickness <= 0 || thickness >= size / 2) {
      throw new Error('Thickness must be positive and less than half the size');
    }

    if (chamfer < 0 || chamfer > thickness) {
      throw new Error('Chamfer must be non-negative and not exceed thickness');
    }

    return true;
  }

  /**
   * Get model metadata
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      category: 'konomi-parts',
      description: 'Demo cube with Konomi System integration',
      features: [
        'Parametric hollow cube',
        'Chamfered edges',
        'BlockArray grid integration',
        '9-agent Cube coordination',
        'eVGPU processing',
        'FemtoLLM AI demonstration'
      ],
      konomiFeatures: {
        blockArray: `${this.params.gridSize}³ compute grid`,
        agentCube: '8 vertices + 1 central coordinator',
        eVGPU: 'CPU-based tensor operations',
        femtoLLM: '16-dim nano AI model'
      }
    };
  }

  /**
   * Shutdown Konomi System
   */
  async cleanup() {
    if (this.konomiSystem) {
      await this.konomiSystem.shutdown();
      this.konomiSystem = null;
    }
  }
}

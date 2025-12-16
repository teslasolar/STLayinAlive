/**
 * Konomi System Demo for GitHub Pages
 * In-browser demonstration of eVGPU, FemtoLLM, BlockArray, and Cube
 */

import { eVGPU } from '../../src/core/evgpu.js';
import { FemtoLLM } from '../../src/core/femto-llm.js';
import { BlockArray } from '../../src/core/block-array.js';
import { Cube } from '../../src/core/cube.js';
import { KonomiSystem } from '../../src/core/konomi-system.js';

let konomiSystem = null;

/**
 * Initialize Konomi System in browser
 */
export async function initKonomiDemo() {
  console.log('🧬 Initializing Konomi System Demo...');

  konomiSystem = new KonomiSystem({
    logLevel: 'info',
    cpuCores: navigator.hardwareConcurrency || 4,
    defaultDimensions: [10, 10, 10] // Smaller for browser demo
  });

  await konomiSystem.initialize();

  // Update dashboard stats
  updateDashboard();

  console.log('✅ Konomi System ready');

  return konomiSystem;
}

/**
 * Update dashboard statistics
 */
export function updateDashboard() {
  if (!konomiSystem) return;

  const stats = konomiSystem.getStats();

  // eVGPU stats
  document.getElementById('evgpu-ops').textContent = stats.evgpuStats.operations;
  document.getElementById('evgpu-cache').textContent =
    (stats.evgpuStats.hitRate * 100).toFixed(1) + '%';

  // BlockArray stats
  document.getElementById('ba-count').textContent = stats.blockArrays;

  // Calculate total active cubes across all arrays
  let totalActive = 0;
  for (const ba of konomiSystem.blockArrays.values()) {
    totalActive += ba.metadata.activeCubes;
  }
  document.getElementById('ba-active').textContent = totalActive;

  // Cube stats
  document.getElementById('cube-count').textContent = stats.cubes;
  document.getElementById('cube-coord').textContent = stats.totalCoordinations || 0;
}

/**
 * Demo: Create BlockArray
 */
export async function demoCreateBlockArray() {
  if (!konomiSystem) await initKonomiDemo();

  const id = `ba_${Date.now()}`;
  const ba = konomiSystem.createBlockArray(id, [10, 10, 10]);

  // Set some values
  ba.set(0, 0, 0, 1.0);
  ba.set(5, 5, 5, 2.0);
  ba.set(9, 9, 9, 3.0);

  logDemo(`✅ Created BlockArray '${id}' [10×10×10]`);
  logDemo(`   Active cubes: ${ba.metadata.activeCubes}`);

  updateDashboard();

  return ba;
}

/**
 * Demo: Create Cube
 */
export async function demoCreateCube() {
  if (!konomiSystem) await initKonomiDemo();

  const id = `cube_${Date.now()}`;
  const cube = konomiSystem.createCube(id, [0, 0, 0]);

  // Connect some vertices
  cube.connect('NEU', 'SWD', 1.0);  // Diagonal
  cube.connect('NWU', 'SED', 1.0);  // Cross diagonal

  logDemo(`✅ Created Cube '${id}'`);
  logDemo(`   Vertices: ${Cube.VERTICES.length}`);
  logDemo(`   Edges: ${cube.getAllEdges().length}`);

  updateDashboard();

  return cube;
}

/**
 * Demo: Process text with LLM
 */
export async function demoProcessText() {
  if (!konomiSystem) await initKonomiDemo();

  logDemo('🧠 Processing text with FemtoLLM...');

  const llm = new FemtoLLM({ hiddenSize: 16 });
  const text = "Hello, Konomi System! This is a test of the FemtoLLM.";

  const result = await llm.process(text);

  logDemo(`✅ Processed in ${result.processingTime}`);
  logDemo(`   Tokens: ${result.tokens.length}`);
  logDemo(`   Embedding dim: ${result.embedding.length}`);

  // Update LLM stats if available
  const llmStats = llm.getStats();
  document.getElementById('llm-processed').textContent = llmStats.totalProcessed;
  document.getElementById('llm-time').textContent = llmStats.avgTime.toFixed(2) + 'ms';

  updateDashboard();

  return result;
}

/**
 * Demo: Coordinate cube task
 */
export async function demoCoordinateCube() {
  if (!konomiSystem) await initKonomiDemo();

  logDemo('🎲 Coordinating cube task...');

  // Create or get cube
  let cube;
  if (konomiSystem.cubes.size > 0) {
    cube = Array.from(konomiSystem.cubes.values())[0];
  } else {
    cube = await demoCreateCube();
  }

  const task = "Analyze system performance and optimize parameters";
  const result = await cube.coordinate(task);

  logDemo(`✅ Coordination complete`);
  logDemo(`   Processing time: ${result.processingTime.toFixed(2)}ms`);
  logDemo(`   Vertices processed: ${Cube.VERTICES.length}`);

  updateDashboard();

  return result;
}

/**
 * Log to demo output
 */
function logDemo(message) {
  const logEl = document.getElementById('demo-log');
  if (logEl) {
    logEl.textContent += '\n' + message;
    logEl.scrollTop = logEl.scrollHeight;
  }
  console.log(message);
}

/**
 * Clear demo log
 */
export function clearDemoLog() {
  const logEl = document.getElementById('demo-log');
  if (logEl) {
    logEl.textContent = 'Ready to demo Konomi System...';
  }
}

// Export for use in other modules
export { konomiSystem };

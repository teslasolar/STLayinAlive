/**
 * STL Exporter
 * Export JSCAD geometry to STL format
 */

import { serialize } from '@jscad/stl-serializer';

/**
 * Export geometry to STL format
 * @param {Object} geometry - JSCAD geometry object
 * @param {Object} options - Export options
 * @returns {ArrayBuffer} STL binary data
 */
export function exportSTL(geometry, options = {}) {
  const defaultOptions = {
    binary: true,
    statusCallback: null
  };

  const exportOptions = { ...defaultOptions, ...options };
  const rawData = serialize(exportOptions, geometry);

  return rawData;
}

/**
 * Save STL to file (browser)
 * @param {Object} geometry - JSCAD geometry
 * @param {string} filename - Output filename
 */
export function saveSTL(geometry, filename) {
  const stlData = exportSTL(geometry, { binary: true });
  const blob = new Blob([stlData], { type: 'application/sla' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.stl') ? filename : `${filename}.stl`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

/**
 * Save STL to file (Node.js)
 * @param {Object} geometry - JSCAD geometry
 * @param {string} filepath - Output file path
 */
export async function saveSTLNode(geometry, filepath) {
  const fs = await import('fs/promises');
  const stlData = exportSTL(geometry, { binary: true });
  await fs.writeFile(filepath, Buffer.from(stlData));
}

export default {
  exportSTL,
  saveSTL,
  saveSTLNode
};

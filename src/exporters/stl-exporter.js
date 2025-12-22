/**
 * STL Exporter
 * Export JSCAD geometry to STL format
 */

import stlSerializer from '@jscad/stl-serializer';
const { serialize } = stlSerializer;

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

  // For binary format, serialize returns array of ArrayBuffers that need concatenation
  if (exportOptions.binary && Array.isArray(rawData)) {
    // Calculate total size
    let totalSize = 0;
    for (const chunk of rawData) {
      if (chunk instanceof ArrayBuffer) {
        totalSize += chunk.byteLength;
      } else if (ArrayBuffer.isView(chunk)) {
        totalSize += chunk.byteLength;
      }
    }

    // Concatenate all chunks
    const result = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of rawData) {
      if (chunk instanceof ArrayBuffer) {
        result.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      } else if (ArrayBuffer.isView(chunk)) {
        result.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), offset);
        offset += chunk.byteLength;
      }
    }

    return result.buffer;
  }

  // For ASCII format, just join strings
  if (Array.isArray(rawData)) {
    return rawData.join('');
  }

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

  // Handle ArrayBuffer conversion properly
  let buffer;
  if (stlData instanceof ArrayBuffer) {
    buffer = Buffer.from(new Uint8Array(stlData));
  } else if (ArrayBuffer.isView(stlData)) {
    buffer = Buffer.from(stlData.buffer, stlData.byteOffset, stlData.byteLength);
  } else {
    buffer = Buffer.from(stlData);
  }

  await fs.writeFile(filepath, buffer);
}

export default {
  exportSTL,
  saveSTL,
  saveSTLNode
};

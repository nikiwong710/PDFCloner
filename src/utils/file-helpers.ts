/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

interface ParsedName {
  prefix: string;
  suffix: string;
  startNumber: number;
  padding: number;
  extension: string;
}

/**
 * Parses an uploaded file name to identify a default naming template
 */
export function parseFilename(filename: string): ParsedName {
  const extIdx = filename.lastIndexOf('.');
  const ext = extIdx !== -1 ? filename.substring(extIdx) : '.pdf';
  const nameWithoutExt = extIdx !== -1 ? filename.substring(0, extIdx) : filename;

  // Pattern matching: search for the last sequence of digits in the name
  // e.g. "ABC-001" -> group 1: "ABC-", group 2: "001"
  // e.g. "INV2026_099" -> group 1: "INV2026_", group 2: "099"
  const match = nameWithoutExt.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const digitsStr = match[2];
    const startNumber = parseInt(digitsStr, 10);
    const padding = digitsStr.length;
    return {
      prefix,
      suffix: '',
      startNumber,
      padding,
      extension: ext
    };
  }

  // Fallback: If no ending digits are detected, suggest appending an incremental suffix
  return {
    prefix: nameWithoutExt + '-',
    suffix: '',
    startNumber: 1,
    padding: 3,
    extension: ext
  };
}

/**
 * Standard utility to pad numbers with custom width and zero-fill
 */
export function formatSequenceNumber(num: number, width: number): string {
  const numStr = num.toString();
  if (numStr.length >= width) {
    return numStr;
  }
  return '0'.repeat(width - numStr.length) + numStr;
}

/**
 * Efficiently compiles and zips the duplications client-side.
 * Since the source data is exactly identical for duplicated items,
 * JSZip processes this instantly in memory without excessive overhead.
 */
export async function generateClonedZip(
  sourceBytes: Uint8Array,
  files: { name: string; extension: string }[],
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  // Create individual promises or execute sequentially with regular feedback loop
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullFilename = `${file.name.trim()}${file.extension}`;
    zip.file(fullFilename, sourceBytes);
    
    // Periodically update progress
    if (onProgress && (i === 0 || i === files.length - 1 || (i + 1) % 10 === 0)) {
      onProgress(i + 1, files.length);
    }
  }

  return await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 4, // Good balance between CPU speed and compression size
      },
    },
    (metadata) => {
      // Provide inner compression progress to UI if requested
    }
  );
}

/**
 * Format bytes to readable size units
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

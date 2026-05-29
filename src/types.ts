/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SourcePDF {
  name: string;
  size: number;
  type: string;
  data: Uint8Array;
}

export type NamingMode = 'incremental' | 'custom_list';

export interface NamingConfig {
  prefix: string;
  suffix: string;
  startNumber: number;
  padding: number;
  step: number;
  count: number;
  customListText: string;
}

export interface GeneratedFile {
  id: string;
  index: number;
  originalName: string;
  name: string; // The editable, configured filename (without extension)
  extension: string; // e.g. ".pdf"
}

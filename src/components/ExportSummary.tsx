/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, FileDown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SourcePDF, GeneratedFile } from '../types';
import { formatBytes } from '../utils/file-helpers';

interface ExportSummaryProps {
  currentFile: SourcePDF | null;
  files: GeneratedFile[];
  isGenerating: boolean;
  generationProgress: { current: number; total: number } | null;
  onDownloadZip: () => void;
  onDownloadLedger: () => void;
}

export default function ExportSummary({
  currentFile,
  files,
  isGenerating,
  generationProgress,
  onDownloadZip,
  onDownloadLedger,
}: ExportSummaryProps) {
  const hasFiles = files.length > 0;
  const totalReplicaBytes = currentFile ? currentFile.size * files.length : 0;

  return (
    <div id="export_summary_container" className="rounded bg-white p-6 border border-slate-200">
      <h3 id="export_summary_title" className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-4">
        3. Export & Packaging
      </h3>

      {!currentFile ? (
        <div id="export_upload_prompt" className="rounded border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-slate-400 text-xs leading-normal">
          <AlertCircle className="h-5 w-5 mx-auto text-slate-405 mb-2" />
          <span>Upload your template PDF to unlock the ZIP batch export suite</span>
        </div>
      ) : !hasFiles ? (
        <div id="export_setup_prompt" className="rounded border border-dashed border-slate-250 bg-slate-55 p-6 text-center text-slate-500 text-xs leading-normal">
          <AlertCircle className="h-5 w-5 mx-auto text-slate-405 mb-2" />
          <span>Define your target sequences or paste a names sheet to load files</span>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Highlighted active outcome block from Geometric Balance spec */}
          <div className="bg-indigo-50 border border-indigo-150 rounded p-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-indigo-900 font-bold uppercase tracking-wider">Total Output:</span>
              <span className="text-lg font-bold text-indigo-655 font-display">{files.length} Files</span>
            </div>
            <p className="text-[10px] text-indigo-705 font-bold uppercase tracking-widest">
              Estimated packaging: ~{Math.max(0.1, +(files.length * 0.01).toFixed(1))} seconds
            </p>
          </div>

          {/* Detailed statistics ledger */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded space-y-2 text-xs text-slate-650">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Source file:</span>
              <span className="font-mono text-[11px] text-slate-700 select-all truncate max-w-[170px]" title={currentFile.name}>
                {currentFile.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 uppercase tracking-wider text-[9px]">Template size:</span>
              <span className="font-bold text-slate-800">{formatBytes(currentFile.size)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 uppercase tracking-wider text-[9px]">Uncompressed load:</span>
              <span className="font-mono text-slate-700">{formatBytes(totalReplicaBytes)}</span>
            </div>

            <div className="border-t border-slate-200 pt-2 mt-1 text-[10px] leading-relaxed text-slate-400">
              💡 <strong>Instant compilation:</strong> All {files.length} output clones inherit identical memory blocks. Final ZIP compression builds instantly inside your cache.
            </div>
          </div>

          <div className="space-y-2">
            {/* Download Main ZIP button with Geometric theme alignment */}
            <button
              id="download_compiled_zip_btn"
              type="button"
              onClick={onDownloadZip}
              disabled={isGenerating}
              className={`w-full font-sans font-bold uppercase tracking-wider text-[11px] rounded py-2.5 text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isGenerating
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    Packaging...{' '}
                    {generationProgress
                      ? `${Math.round((generationProgress.current / generationProgress.total) * 100)}%`
                      : 'processing...'}
                  </span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export Named ZIP Archive</span>
                </>
              )}
            </button>

            {/* Custom text ledger exporter */}
            <button
              id="download_name_ledger_btn"
              type="button"
              onClick={onDownloadLedger}
              disabled={isGenerating}
              className="w-full font-sans font-bold uppercase tracking-wider text-[10px] rounded py-2 bg-white border border-slate-300 text-slate-705 hover:bg-slate-55 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              title="Download clean .txt log of filenames compiled for records"
            >
              <FileDown className="h-3.5 w-3.5 text-slate-500" />
              <span>Download Filename Listing (.txt)</span>
            </button>
          </div>

          {/* Complete Alert message card */}
          {isGenerating && (
            <div id="export_progress_card" className="flex items-center gap-2 text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-150 p-3 rounded leading-normal animate-pulse font-semibold uppercase tracking-wider">
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              <span>
                Archiving {files.length} custom template copies in-memory...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

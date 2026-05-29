/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Upload, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { SourcePDF } from '../types';
import { formatBytes } from '../utils/file-helpers';

interface UploadZoneProps {
  currentFile: SourcePDF | null;
  onFileSelected: (file: SourcePDF) => void;
  onClear: () => void;
}

export default function UploadZone({ currentFile, onFileSelected, onClear }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file. The application is optimized for duplicating PDFs.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as ArrayBuffer;
      if (result) {
        onFileSelected({
          name: file.name,
          size: file.size,
          type: file.type,
          data: new Uint8Array(result),
        });
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the file contents. Please try again.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerSearch = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="upload_zone_container" className="rounded bg-white p-6 border border-slate-200">
      <h3 id="upload_zone_title" className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-4">
        1. Source PDF File
      </h3>

      {!currentFile ? (
        <div
          id="upload_drop_area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSearch}
          className={`group relative flex flex-col items-center justify-center rounded border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-250 ${
            isDragging
              ? 'border-indigo-650 bg-slate-100 scale-[0.99]'
              : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
          }`}
        >
          <input
            id="pdf_file_input"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded transition-transform duration-200 group-hover:scale-105 ${
            isDragging ? 'bg-indigo-100 text-indigo-650' : 'bg-slate-105 text-slate-500'
          }`}>
            <Upload className="h-5 w-5" />
          </div>
          <p className="font-semibold text-xs text-slate-700 mb-1">
            Drag & drop template PDF, or <span className="text-indigo-650 group-hover:underline">browse files</span>
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
            Up to 100MB PDF template
          </p>

          {errorMsg && (
            <div id="upload_error" className="mt-3 p-2.5 rounded bg-rose-50 border border-rose-100 text-[11px] text-rose-600 leading-normal max-w-xs">
              {errorMsg}
            </div>
          )}
        </div>
      ) : (
        <div id="upload_active_file" className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-4 animate-fade-in">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-650 border border-slate-200">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-slate-800 truncate" title={currentFile.name}>
                {currentFile.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-405 font-semibold uppercase tracking-wider">
                <span>{formatBytes(currentFile.size)}</span>
                <span>•</span>
                <span className="text-emerald-600">READY TO PROCESS</span>
              </div>
            </div>
          </div>
          <button
            id="clear_file_btn"
            type="button"
            onClick={onClear}
            className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:text-rose-650 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Remove and select another PDF"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

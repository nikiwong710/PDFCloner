/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, PenTool, Trash2, ArrowLeft, ArrowRight, HelpCircle, AlertCircle, Sparkles, Wand2 } from 'lucide-react';
import { GeneratedFile } from '../types';

interface FileRowProps {
  key?: string;
  file: GeneratedFile;
  onUpdateName: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

function FileRow({ file, onUpdateName, onDelete }: FileRowProps) {
  const [localVal, setLocalVal] = useState(file.name);

  useEffect(() => {
    setLocalVal(file.name);
  }, [file.name]);

  const handleBlur = () => {
    const cleaned = localVal.trim();
    if (cleaned && cleaned !== file.name) {
      onUpdateName(file.id, cleaned);
    } else {
      setLocalVal(file.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-200 text-slate-700">
      <td className="px-4 py-3 text-xs font-mono text-slate-400 select-none">
        {file.index.toString().padStart(3, '0')}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded px-2.5 py-1 focus-within:border-indigo-650 transition-colors">
          <input
            id={`filename_input_${file.id}`}
            type="text"
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            title="Double click or focus to edit the dynamic part of this file name"
            placeholder="Filename cannot be empty"
            className="grow bg-transparent border-0 p-0 text-xs font-semibold text-slate-800 focus:outline-none"
          />
          <span className="text-[10px] font-bold text-slate-450 bg-slate-100 px-1.5 py-0.5 rounded select-none shrink-0 border border-slate-200 uppercase tracking-wide">
            {file.extension}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          id={`delete_item_btn_${file.id}`}
          type="button"
          onClick={() => onDelete(file.id)}
          className="p-1.5 text-slate-400 hover:text-rose-650 rounded hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center justify-center border border-transparent hover:border-slate-200"
          title="Remove this file from the export"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

interface FilePreviewListProps {
  files: GeneratedFile[];
  onUpdateName: (id: string, newName: string) => void;
  onDeleteFile: (id: string) => void;
  onBulkUpdate: (findText: string, replaceText: string) => void;
  onClearAll: () => void;
}

export default function FilePreviewList({
  files,
  onUpdateName,
  onDeleteFile,
  onBulkUpdate,
  onClearAll,
}: FilePreviewListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Search & Replace modal states
  const [showBulkReplace, setShowBulkReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Reset page when search or total count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, files.length]);

  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return files;
    const lower = searchTerm.toLowerCase();
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(lower) ||
        `#${f.index}`.includes(lower)
    );
  }, [files, searchTerm]);

  const pageCount = Math.ceil(filteredFiles.length / itemsPerPage);

  const paginatedFiles = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredFiles.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredFiles, currentPage, itemsPerPage]);

  const handleBulkReplaceApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (findText) {
      onBulkUpdate(findText, replaceText);
      setFindText('');
      setReplaceText('');
      setShowBulkReplace(false);
    }
  };

  return (
    <div id="file_preview_list_container" className="rounded bg-white p-6 border border-slate-200 flex flex-col h-full min-h-[500px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-250">
        <div>
          <h3 id="preview_list_title" className="text-xs font-bold text-slate-450 uppercase tracking-widest">
            Generated Target Queue
          </h3>
          <p className="text-[10px] text-slate-405 mt-1 font-semibold uppercase tracking-wider">
            Amend any row dynamically by editing its text field directly.
          </p>
        </div>
        {files.length > 0 && (
          <button
            id="clear_all_items_btn"
            type="button"
            onClick={onClearAll}
            className="text-[10px] font-bold text-slate-500 hover:text-rose-650 uppercase tracking-wider border border-slate-205 bg-slate-50 hover:bg-rose-50 px-3 py-1.5 rounded transition-colors cursor-pointer shrink-0"
          >
            Clear dynamic list
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <div id="no_files_queued" className="flex flex-col items-center justify-center grow py-12 text-center text-slate-400">
          <div className="flex h-11 w-11 items-center justify-center rounded bg-slate-50 text-slate-305 border border-slate-200 mb-3 animate-pulse">
            <HelpCircle className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-650 uppercase tracking-widest">Empty Workspace Queue</p>
          <p className="text-[10px] max-w-xs mt-1 leading-normal uppercase tracking-wider">
            Drag a template PDF file in first to automatically generate dynamic rows above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col grow bg-white">
          {/* Toolbar */}
          <div id="queue_toolbar" className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-405" />
              <input
                id="queue_search_input"
                type="text"
                placeholder="Search generated list..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs placeholder-slate-400 focus:border-indigo-650 focus:outline-none transition-colors"
              />
            </div>

            {/* Bulk Replace Trigger */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                id="toggle_bulk_replace_btn"
                type="button"
                onClick={() => setShowBulkReplace(!showBulkReplace)}
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded border transition-all cursor-pointer ${
                  showBulkReplace
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-white border-slate-300 text-slate-705 hover:bg-slate-55'
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Bulk Find & Replace</span>
              </button>
            </div>
          </div>

          {/* Bulk Replace Card Drawer */}
          {showBulkReplace && (
            <form
              id="bulk_replace_form"
              onSubmit={handleBulkReplaceApply}
              className="bg-slate-50 border border-slate-200 p-4 rounded mb-5 text-xs animate-fade-in space-y-3"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-bold text-slate-700 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                  Bulk Name Adjuster
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Sequence Update</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="replace_find_input" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Find Text</label>
                  <input
                    id="replace_find_input"
                    type="text"
                    required
                    placeholder="e.g. ABC"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-indigo-650 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="replace_with_input" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Replace With</label>
                  <input
                    id="replace_with_input"
                    type="text"
                    placeholder="e.g. DUPLICATE_X"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-indigo-650 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  id="cancel_bulk_replace_btn"
                  type="button"
                  onClick={() => setShowBulkReplace(false)}
                  className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="apply_bulk_replace_btn"
                  type="submit"
                  className="px-3.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-xs transition-colors"
                >
                  Replace Occurrences
                </button>
              </div>
            </form>
          )}

          {/* Tabular Scroll View */}
          <div className="grow overflow-auto border border-slate-200 rounded max-h-[750px]">
            <table className="w-full text-left border-collapse table-fixed bg-white">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200 select-none">
                  <th className="px-4 py-2.5 w-16">Index</th>
                  <th className="px-4 py-2.5">Configured Target Filename</th>
                  <th className="px-4 py-2.5 w-16 text-right">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      no filenames match current lookup
                    </td>
                  </tr>
                ) : (
                  paginatedFiles.map((file) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      onUpdateName={onUpdateName}
                      onDelete={onDeleteFile}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pageCount > 1 && (
            <div id="queue_pagination" className="flex items-center justify-between border-t border-slate-200 pt-4 mt-auto bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing{' '}
                <span className="text-slate-700">
                  {Math.min(filteredFiles.length, (currentPage - 1) * itemsPerPage + 1)}-
                  {Math.min(filteredFiles.length, currentPage * itemsPerPage)}
                </span>{' '}
                of <span className="text-slate-705">{filteredFiles.length}</span> items
              </span>

              <div className="flex items-center gap-1">
                <button
                  id="prev_page_btn"
                  type="button"
                  onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-550 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Previous Page"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 text-slate-505 select-none">
                  {currentPage} / {pageCount}
                </span>
                <button
                  id="next_page_btn"
                  type="button"
                  onClick={() => setCurrentPage((c) => Math.min(pageCount, c + 1))}
                  disabled={currentPage === pageCount}
                  className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-550 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  title="Next Page"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

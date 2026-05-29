/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Layers, FileSpreadsheet, Hash, SlidersHorizontal, HelpCircle, RefreshCw } from 'lucide-react';
import { NamingConfig, NamingMode } from '../types';
import { formatSequenceNumber } from '../utils/file-helpers';

interface RenameConfiguratorProps {
  mode: NamingMode;
  onModeChange: (mode: NamingMode) => void;
  config: NamingConfig;
  onConfigChange: (config: NamingConfig) => void;
  originalName: string | undefined;
  onResetToDefault: () => void;
}

export default function RenameConfigurator({
  mode,
  onModeChange,
  config,
  onConfigChange,
  originalName,
  onResetToDefault,
}: RenameConfiguratorProps) {
  const [pastedCount, setPastedCount] = useState(0);

  // Recalculate pasted number of lines in custom list mode
  useEffect(() => {
    if (mode === 'custom_list') {
      const lines = config.customListText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      setPastedCount(lines.length);
    }
  }, [config.customListText, mode]);

  const handleInputChange = (key: keyof NamingConfig, val: any) => {
    onConfigChange({
      ...config,
      [key]: val,
    });
  };

  // Quick helper to preview a sample name in automatic incremental mode
  const getSampleNamePreview = (sequenceIdx: number): string => {
    const formattedNum = formatSequenceNumber(sequenceIdx, config.padding);
    return `${config.prefix}${formattedNum}${config.suffix}.pdf`;
  };

  return (
    <div id="rename_configurator_container" className="rounded bg-white p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 id="rename_configurator_title" className="text-xs font-bold text-slate-450 uppercase tracking-widest">
          2. Naming Sequence
        </h3>
        {originalName && (
          <button
            id="reset_naming_btn"
            type="button"
            onClick={onResetToDefault}
            className="flex items-center gap-1 text-[10px] text-indigo-650 font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
            title="Reset settings based on template file name"
          >
            <RefreshCw className="h-3 w-3" />
            Reset parsing
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 mb-5 bg-slate-100 p-1 rounded">
        <button
          id="tab_mode_incremental"
          type="button"
          onClick={() => onModeChange('incremental')}
          className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
            mode === 'incremental'
              ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
              : 'text-slate-505 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          <Hash className="h-3.5 w-3.5 shrink-0" />
          <span>Incremental Sequence</span>
        </button>
        <button
          id="tab_mode_custom"
          type="button"
          onClick={() => onModeChange('custom_list')}
          className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
            mode === 'custom_list'
              ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
              : 'text-slate-505 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
          <span>Excel Custom List</span>
        </button>
      </div>

      {mode === 'incremental' ? (
        <div id="incremental_mode_form" className="space-y-4 animate-fade-in">
          {/* Prefix & Suffix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input_prefix" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">
                Prefix
              </label>
              <input
                id="input_prefix"
                type="text"
                placeholder="e.g. ABC-"
                value={config.prefix}
                onChange={(e) => handleInputChange('prefix', e.target.value)}
                className="w-full rounded border border-slate-305 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="input_suffix" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">
                Suffix
              </label>
              <input
                id="input_suffix"
                type="text"
                placeholder="e.g. -DRAFT (optional)"
                value={config.suffix}
                onChange={(e) => handleInputChange('suffix', e.target.value)}
                className="w-full rounded border border-slate-305 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Start No, Padding, Step */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div>
              <label htmlFor="input_start" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1 whitespace-nowrap">
                Start At
              </label>
              <input
                id="input_start"
                type="number"
                min="0"
                value={config.startNumber}
                onChange={(e) => handleInputChange('startNumber', Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded border border-slate-305 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="input_padding" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1 whitespace-nowrap">
                Zero Padding
              </label>
              <select
                id="input_padding"
                value={config.padding}
                onChange={(e) => handleInputChange('padding', parseInt(e.target.value, 10))}
                className="w-full rounded border border-slate-305 bg-white px-2 py-2 text-sm text-slate-800 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 outline-none transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <option key={i} value={i}>
                    {i} {i === 1 ? 'digit' : 'digits'} ({'0'.repeat(Math.max(0, i - 1))}1)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="input_step" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1 whitespace-nowrap">
                Step
              </label>
              <input
                id="input_step"
                type="number"
                min="1"
                value={config.step}
                onChange={(e) => handleInputChange('step', Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded border border-slate-305 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Total Copies */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input_count" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                Replicas Limit
              </label>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 rounded">
                {config.count} COPIES
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <input
                id="input_count_slider"
                type="range"
                min="1"
                max="1000"
                value={config.count}
                onChange={(e) => handleInputChange('count', parseInt(e.target.value, 10))}
                className="grow h-1.5 bg-slate-100 rounded appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                id="input_count"
                type="number"
                min="1"
                max="5000"
                value={config.count}
                onChange={(e) => handleInputChange('count', Math.max(1, Math.min(5000, parseInt(e.target.value, 10) || 1)))}
                className="w-20 rounded border border-slate-305 bg-white px-2 py-1 text-center text-sm text-slate-800 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Live Preview Pattern Card */}
          <div className="rounded border border-slate-200 bg-slate-50 p-3 mt-4 text-xs">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
              <span>Pattern Sequence Preview:</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 space-y-1 bg-white p-2.5 border border-slate-150 rounded">
              <div className="flex justify-between">
                <span>First target:</span>
                <span className="text-indigo-600 font-bold">{getSampleNamePreview(config.startNumber)}</span>
              </div>
              {config.count > 1 && (
                <>
                  <div className="flex justify-between">
                    <span>Second target:</span>
                    <span className="text-slate-700">{getSampleNamePreview(config.startNumber + config.step)}</span>
                  </div>
                  {config.count > 2 && <div className="text-center text-slate-300 py-0.5 select-none">...</div>}
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1 font-bold text-slate-800">
                    <span>Final target ({config.count}):</span>
                    <span className="text-indigo-600">{getSampleNamePreview(config.startNumber + (config.count - 1) * config.step)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div id="custom_mode_form" className="space-y-4 animate-fade-in">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="custom_list_textarea" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                Pasted Names (One per line)
              </label>
              <div className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Parsed: <strong className="text-indigo-600">{pastedCount}</strong> files
              </div>
            </div>
            <textarea
              id="custom_list_textarea"
              rows={8}
              placeholder="ABC-001&#10;Contract_Final_Draft&#10;FinanceInvoice_2026_A&#10;Marketing-Review-Q3"
              value={config.customListText}
              onChange={(e) => handleInputChange('customListText', e.target.value)}
              className="w-full rounded border border-slate-305 bg-white px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 outline-none transition-colors"
            />
            <p className="mt-1.5 text-[10px] text-slate-405 leading-normal flex items-start gap-1">
              <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-405 mt-0.5" />
              <span>
                Paste custom names straight from Excel or Sheets rows. Do not write the `.pdf` extension; the systems automatically appends it.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

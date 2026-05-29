/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Copy, HelpCircle, FileCheck, Layers, AlertCircle, Info, Sparkles, Wand2 } from 'lucide-react';
import { SourcePDF, NamingMode, NamingConfig, GeneratedFile } from './types';
import { parseFilename, formatSequenceNumber, generateClonedZip } from './utils/file-helpers';
import UploadZone from './components/UploadZone';
import RenameConfigurator from './components/RenameConfigurator';
import FilePreviewList from './components/FilePreviewList';
import ExportSummary from './components/ExportSummary';

export default function App() {
  const [currentFile, setCurrentFile] = useState<SourcePDF | null>(null);
  const [namingMode, setNamingMode] = useState<NamingMode>('incremental');
  
  // Default Config
  const [namingConfig, setNamingConfig] = useState<NamingConfig>({
    prefix: '',
    suffix: '',
    startNumber: 1,
    padding: 3,
    step: 1,
    count: 10,
    customListText: '',
  });

  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Auto-fill configuration when a PDF is selected
  const handleFileSelected = (file: SourcePDF) => {
    setCurrentFile(file);
    const parsed = parseFilename(file.name);
    
    // Attempt custom list or sequence auto-parsing
    setNamingConfig((prev) => ({
      ...prev,
      prefix: parsed.prefix,
      suffix: parsed.suffix,
      startNumber: parsed.startNumber,
      padding: parsed.padding,
      count: 10, // Default copies counts on a fresh upload
    }));

    setAlert({
      type: 'success',
      message: `Successfully loaded "${file.name}" template. We've auto-parsed your prefix and counter options!`,
    });
  };

  const handleClearFile = () => {
    setCurrentFile(null);
    setFiles([]);
    setNamingConfig({
      prefix: '',
      suffix: '',
      startNumber: 1,
      padding: 3,
      step: 1,
      count: 10,
      customListText: '',
    });
    setAlert(null);
  };

  // Triggered when clicking "Reset parsing" next to the naming options header
  const handleResetToDefault = () => {
    if (!currentFile) return;
    const parsed = parseFilename(currentFile.name);
    setNamingConfig((prev) => ({
      ...prev,
      prefix: parsed.prefix,
      suffix: parsed.suffix,
      startNumber: parsed.startNumber,
      padding: parsed.padding,
    }));
    
    setAlert({
      type: 'info',
      message: 'Reset naming config variables to match the template filename.',
    });
  };

  // Generate our files queue upon naming modes or configuration edits
  useEffect(() => {
    if (!currentFile) {
      setFiles([]);
      return;
    }

    const { prefix, suffix, startNumber, padding, step, count, customListText } = namingConfig;
    const extIdx = currentFile.name.lastIndexOf('.');
    const ext = extIdx !== -1 ? currentFile.name.substring(extIdx) : '.pdf';

    let generatedList: GeneratedFile[] = [];

    if (namingMode === 'incremental') {
      for (let i = 0; i < count; i++) {
        const indexValue = startNumber + i * step;
        const formattedNum = formatSequenceNumber(indexValue, padding);
        const namePart = `${prefix}${formattedNum}${suffix}`;
        
        generatedList.push({
          id: `incremental-${i}-${indexValue}`,
          index: i + 1,
          originalName: currentFile.name,
          name: namePart,
          extension: ext,
        });
      }
    } else {
      // Parse custom list values
      const lines = customListText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      generatedList = lines.map((line, idx) => {
        return {
          id: `custom-${idx}-${line}`,
          index: idx + 1,
          originalName: currentFile.name,
          name: line,
          extension: ext,
        };
      });
    }

    setFiles(generatedList);
  }, [currentFile, namingMode, namingConfig]);

  // Handle single cell edit (amenability on dynamic names)
  const handleUpdateFileName = (id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  };

  // Delete an individual item from output queues
  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Clear current active queue
  const handleClearAll = () => {
    setFiles([]);
    setNamingConfig((prev) => ({
      ...prev,
      count: 0,
      customListText: '',
    }));
    setAlert({
      type: 'info',
      message: 'Cleared all files from current batch queue. Set new parameters to rebuild.',
    });
  };

  // Bulk Find and Replace sequence modifier helper
  const handleBulkUpdate = (findText: string, replaceText: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.name.includes(findText)) {
          return {
            ...f,
            name: f.name.replaceAll(findText, replaceText),
          };
        }
        return f;
      })
    );
    setAlert({
      type: 'success',
      message: `Bulk adjustment complete! Replaced occurrences of "${findText}" with "${replaceText}".`,
    });
  };

  // Main Download ZIP Archive process
  const downloadZipArchive = async () => {
    if (!currentFile || files.length === 0) return;

    try {
      setIsGenerating(true);
      setGenerationProgress({ current: 0, total: files.length });

      // package structure
      const filesToCompile = files.map((f) => ({
        name: f.name,
        extension: f.extension,
      }));

      // trigger in-memory compression helper
      const zipBlob = await generateClonedZip(currentFile.data, filesToCompile, (current, total) => {
        setGenerationProgress({ current, total });
      });

      // download file object triggered
      const rawName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) || 'template';
      const downloadFilename = `${rawName}_cloned_batch.zip`;
      
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setAlert({
        type: 'success',
        message: `Successfully generated and compiled ${files.length} custom cloned PDF files! Saved inside "${downloadFilename}".`,
      });
    } catch (err: any) {
      console.error(err);
      setAlert({
        type: 'error',
        message: `Error archiving files: ${err.message || 'Browser out of memory limits.'}`,
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // Download filename list as text document ledger for logs or records
  const downloadNamesLedger = () => {
    if (!currentFile || files.length === 0) return;

    const fileListText = files.map((f) => `${f.name}${f.extension}`).join('\r\n');
    const blob = new Blob([fileListText], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    
    const rawName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) || 'template';
    const downloadFilename = `${rawName}_filename_ledger.txt`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    setAlert({
      type: 'success',
      message: `Saved ledger containing ${files.length} naming targets down into "${downloadFilename}".`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 select-none selection:bg-indigo-600 selection:text-white font-sans antialiased flex flex-col justify-between">
      {/* Visual Header Grid - Geometric Balance */}
      <header id="app_header" className="h-16 flex items-center justify-between px-6 sm:px-8 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white">
            <Copy className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-lg tracking-tight uppercase select-none">
            Clone<span className="text-indigo-600">PDF</span>.Pro
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline-block">
            ACTIVE WORKSPACE BUFFER
          </span>
        </div>
      </header>

      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col">
        {/* Active Alert Banner System */}
        {alert && (
          <div
            id="status_alert"
            className={`mb-6 p-4 rounded border flex items-start justify-between gap-3 shadow-xs animate-fade-in ${
              alert.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : alert.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {alert.type === 'success' ? (
                <FileCheck className="h-4.5 w-4.5 shrink-0 text-emerald-600 mt-0.5" />
              ) : alert.type === 'error' ? (
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
              ) : (
                <Info className="h-4.5 w-4.5 shrink-0 text-indigo-600 mt-0.5" />
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold leading-normal">{alert.message}</p>
              </div>
            </div>
            <button
              id="close_alert_btn"
              type="button"
              onClick={() => setAlert(null)}
              className="text-[10px] font-bold uppercase tracking-wider hover:opacity-75 shrink-0 select-none cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left panel inputs */}
          <section id="panel_controls" className="lg:col-span-5 space-y-6 flex flex-col justify-start">
            <UploadZone
              currentFile={currentFile}
              onFileSelected={handleFileSelected}
              onClear={handleClearFile}
            />

            <RenameConfigurator
              mode={namingMode}
              onModeChange={setNamingMode}
              config={namingConfig}
              onConfigChange={setNamingConfig}
              originalName={currentFile?.name}
              onResetToDefault={handleResetToDefault}
            />

            <ExportSummary
              currentFile={currentFile}
              files={files}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              onDownloadZip={downloadZipArchive}
              onDownloadLedger={downloadNamesLedger}
            />
          </section>

          {/* Right panel list view */}
          <section id="panel_preview" className="lg:col-span-7 flex flex-col">
            <FilePreviewList
              files={files}
              onUpdateName={handleUpdateFileName}
              onDeleteFile={handleDeleteFile}
              onBulkUpdate={handleBulkUpdate}
              onClearAll={handleClearAll}
            />
          </section>
        </div>
      </main>

      <footer id="app_footer" className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-[10px] font-semibold text-slate-400 select-none uppercase tracking-widest">
        <p>© {new Date().getFullYear()} ClonePDF.Pro • All package aggregation processes occur safely inside your Sandbox context.</p>
      </footer>
    </div>
  );
}

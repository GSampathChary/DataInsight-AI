'use client';

import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api, Dataset } from '@/lib/api';

interface UploadViewProps {
  onUploadSuccess: (dataset: Dataset) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [uploadedDataset, setUploadedDataset] = useState<Dataset | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
        setError('Invalid file format. Please upload a CSV or Excel (.xlsx, .xls) file.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = res.data.data;
      setUploadedDataset(data);

      // Fetch first 10 rows preview
      const prevRes = await api.get(`/dataset-preview/${data.id}?limit=10`);
      setPreviewData(prevRes.data.data);
      onUploadSuccess(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload dataset');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Dataset</h1>
        <p className="text-slate-400 text-sm">Select a CSV or Excel file to begin automated data analysis and machine learning.</p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="glass-panel rounded-2xl p-8 text-center space-y-4 border-2 border-dashed border-emerald-900 hover:border-emerald-500/50 transition-all">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 flex items-center justify-center mx-auto text-emerald-400">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <p className="text-white font-semibold">Drag and drop your dataset here</p>
          <p className="text-slate-400 text-xs">Supports CSV, XLSX, XLS up to 50MB</p>
        </div>

        <div className="pt-2">
          <label className="cursor-pointer inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 text-white font-medium text-sm border border-emerald-900 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Browse Computer</span>
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label>
        </div>

        {file && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-900 inline-flex items-center space-x-3 text-sm text-slate-200">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{file.name}</span>
            <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {file && !uploadedDataset && (
          <div className="pt-4">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Dataset...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Dataset Preview (First 10 Rows) */}
      {previewData && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">First 10 Rows Preview</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {previewData.metadata.rows_count} rows × {previewData.metadata.cols_count} columns
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700">
                <tr>
                  {previewData.columns.map((col: string) => (
                    <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                      {col}
                      <span className="block text-[10px] text-slate-500 font-normal">
                        {previewData.dtypes[col]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {previewData.preview.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    {previewData.columns.map((col: string) => (
                      <td key={col} className="py-2 px-3 whitespace-nowrap">
                        {row[col] === null ? <span className="text-slate-600 italic">null</span> : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

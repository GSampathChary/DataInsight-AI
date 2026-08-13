'use client';

import React, { useState, useEffect } from 'react';
import { 
  TableProperties, 
  Layers, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  ShieldAlert,
  Database
} from 'lucide-react';
import { api, Dataset } from '@/lib/api';

interface OverviewViewProps {
  dataset: Dataset;
  onRefreshDataset: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ dataset, onRefreshDataset }) => {
  const [preview, setPreview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [missingStrategy, setMissingStrategy] = useState('drop');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [columnsToDrop, setColumnsToDrop] = useState<string[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<any | null>(null);

  useEffect(() => {
    fetchPreview();
  }, [dataset.id]);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dataset-preview/${dataset.id}?limit=15`);
      setPreview(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClean = async () => {
    setIsCleaning(true);
    try {
      const res = await api.post('/clean', {
        dataset_id: dataset.id,
        missing_strategy: missingStrategy,
        remove_duplicates: removeDuplicates,
        columns_to_drop: columnsToDrop
      });
      setCleanResult(res.data.data);
      onRefreshDataset();
      fetchPreview();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCleaning(false);
    }
  };

  const toggleColumnDrop = (col: string) => {
    if (columnsToDrop.includes(col)) {
      setColumnsToDrop(columnsToDrop.filter(c => c !== col));
    } else {
      setColumnsToDrop([...columnsToDrop, col]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dataset Overview & Data Cleaning</h1>
        <p className="text-slate-400 text-sm">Inspect data schema, missing values, duplicates, and perform automated preprocessing.</p>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Total Rows</span>
          <p className="text-2xl font-bold text-white">{dataset.rows_count.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Total Columns</span>
          <p className="text-2xl font-bold text-white">{dataset.cols_count}</p>
        </div>
        <div className="glass-card p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Format</span>
          <p className="text-2xl font-bold text-emerald-400 uppercase">{dataset.file_type}</p>
        </div>
        <div className="glass-card p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">File Size</span>
          <p className="text-2xl font-bold text-emerald-400">{(dataset.file_size / 1024).toFixed(1)} KB</p>
        </div>
      </div>

      {/* Preprocessing & Cleaning Controls */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Automated Data Preprocessing Studio</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Missing Value Strategy */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Missing Value Handling</label>
            <select
              value={missingStrategy}
              onChange={(e) => setMissingStrategy(e.target.value)}
              className="w-full bg-emerald-950/70 border border-emerald-900 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="drop">Drop Rows with Missing Values</option>
              <option value="mean">Impute Mean (Numeric)</option>
              <option value="median">Impute Median (Numeric)</option>
              <option value="mode">Impute Mode (Categorical & Numeric)</option>
              <option value="fill_zero">Fill with Zero (0)</option>
            </select>
          </div>

          {/* Remove Duplicates */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Deduplication</label>
            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="dup"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="w-4 h-4 rounded bg-emerald-950 border-emerald-900 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="dup" className="text-sm text-slate-300">Remove Duplicate Rows automatically</label>
            </div>
          </div>

          {/* Execute Button */}
          <div className="flex items-end">
            <button
              onClick={handleApplyClean}
              disabled={isCleaning}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-red-600 hover:from-emerald-500 hover:to-red-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/30"
            >
              {isCleaning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cleaning Data...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Apply Preprocessing</span>
                </>
              )}
            </button>
          </div>
        </div>

        {cleanResult && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Data Cleaning Successfully Applied!</span>
            </p>
            <p>Shape changed from {cleanResult.original_shape.join('×')} to {cleanResult.cleaned_shape.join('×')}. Duplicates removed: {cleanResult.duplicates_removed}. Missing values before: {cleanResult.missing_before}, after: {cleanResult.missing_after}.</p>
          </div>
        )}
      </div>

      {/* Schema & Column List */}
      {preview && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white">Column Details & Schema</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Column Name</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Missing Count</th>
                  <th className="py-2.5 px-3">Drop Column?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {preview.columns.map((col: string) => (
                  <tr key={col} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{col}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{preview.dtypes[col]}</td>
                    <td className="py-2.5 px-3">
                      {preview.missing_counts[col] > 0 ? (
                        <span className="text-amber-400 font-semibold">{preview.missing_counts[col]} missing</span>
                      ) : (
                        <span className="text-emerald-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={columnsToDrop.includes(col)}
                        onChange={() => toggleColumnDrop(col)}
                        className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-red-500"
                      />
                    </td>
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

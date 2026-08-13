'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  TrendingUp,
  Sliders
} from 'lucide-react';
import { api, Dataset, EDAData } from '@/lib/api';

interface EDAViewProps {
  dataset: Dataset;
}

export const EDAView: React.FC<EDAViewProps> = ({ dataset }) => {
  const [eda, setEda] = useState<EDAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEDA();
  }, [dataset.id]);

  const fetchEDA = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/eda', { dataset_id: dataset.id });
      setEda(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate EDA');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400">Performing Exploratory Data Analysis & Statistical Calculations...</p>
      </div>
    );
  }

  if (error || !eda) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        <p className="font-bold">Error loading EDA: {error}</p>
      </div>
    );
  }

  const { summary, descriptive_stats, correlation_matrix, outliers_summary } = eda;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Exploratory Data Analysis (EDA)</h1>
        <p className="text-slate-400 text-sm">Comprehensive statistical profiling, distributions, skewness, kurtosis, and correlation metrics.</p>
      </div>

      {/* Dataset Health Score & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Data Health Score</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{summary.health_score} <span className="text-sm font-normal text-slate-400">/ 100</span></p>
          <p className="text-xs text-slate-500">Based on missingness & duplicates</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Missing Values</span>
          <p className="text-3xl font-bold text-white">{summary.total_missing_values}</p>
          <p className="text-xs text-slate-400">{summary.missing_percentage}% overall rate</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Duplicates</span>
          <p className="text-3xl font-bold text-white">{summary.duplicate_rows}</p>
          <p className="text-xs text-slate-400">Identical records</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Numeric Columns</span>
          <p className="text-3xl font-bold text-emerald-400">{summary.numeric_columns_count}</p>
          <p className="text-xs text-slate-400">Out of {summary.columns} total</p>
        </div>
      </div>

      {/* Descriptive Statistics Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <span>Summary Descriptive Statistics</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Mean</th>
                <th className="py-2.5 px-3">Std Dev</th>
                <th className="py-2.5 px-3">Min</th>
                <th className="py-2.5 px-3">Median</th>
                <th className="py-2.5 px-3">Max</th>
                <th className="py-2.5 px-3">Skewness</th>
                <th className="py-2.5 px-3">Kurtosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {Object.entries(descriptive_stats).map(([col, s]) => (
                <tr key={col} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-white">{col}</td>
                  <td className="py-2.5 px-3">{s.mean ?? 'N/A'}</td>
                  <td className="py-2.5 px-3">{s.std ?? 'N/A'}</td>
                  <td className="py-2.5 px-3">{s.min ?? 'N/A'}</td>
                  <td className="py-2.5 px-3">{s.median ?? 'N/A'}</td>
                  <td className="py-2.5 px-3">{s.max ?? 'N/A'}</td>
                  <td className={`py-2.5 px-3 ${Math.abs(s.skewness) > 1 ? 'text-amber-400 font-bold' : ''}`}>
                    {s.skewness ?? 'N/A'}
                  </td>
                  <td className="py-2.5 px-3">{s.kurtosis ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outliers Summary Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Outlier Detection Analysis (IQR Method)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Lower Bound</th>
                <th className="py-2.5 px-3">Upper Bound</th>
                <th className="py-2.5 px-3">Outlier Count</th>
                <th className="py-2.5 px-3">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {Object.entries(outliers_summary).map(([col, o]) => (
                <tr key={col} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-white">{col}</td>
                  <td className="py-2.5 px-3">{o.lower_bound}</td>
                  <td className="py-2.5 px-3">{o.upper_bound}</td>
                  <td className="py-2.5 px-3">
                    {o.count > 0 ? (
                      <span className="text-amber-400 font-bold">{o.count}</span>
                    ) : (
                      <span className="text-emerald-400">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">{o.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

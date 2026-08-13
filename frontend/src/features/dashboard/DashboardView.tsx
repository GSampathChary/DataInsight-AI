'use client';

import React from 'react';
import { 
  FileSpreadsheet, 
  BarChart3, 
  Sparkles, 
  BrainCircuit, 
  ArrowUpRight,
  Database,
  Search,
  ShieldCheck,
  WifiOff
} from 'lucide-react';
import { Dataset } from '@/lib/api';

interface DashboardViewProps {
  datasets: Dataset[];
  activeDataset: Dataset | null;
  onSelectDataset: (d: Dataset) => void;
  onUploadClick: () => void;
  onNavigateTab: (tab: any) => void;
  backendHealth: 'checking' | 'online' | 'offline';
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  datasets,
  activeDataset,
  onSelectDataset,
  onUploadClick,
  onNavigateTab,
  backendHealth,
  searchQuery,
  onSearchQueryChange
}) => {
  const filteredDatasets = datasets.filter((d) => {
    const haystack = `${d.filename} ${d.file_type} ${d.rows_count} ${d.cols_count}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Dashboard</h1>
          <p className="text-slate-400 text-sm">Overview of your workspace, datasets, and recent analytical operations.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
            backendHealth === 'online'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              : backendHealth === 'offline'
              ? 'bg-red-500/10 text-red-300 border-red-500/20'
              : 'bg-emerald-950/70 text-slate-300 border-emerald-900'
          }`}>
            {backendHealth === 'online' ? <ShieldCheck className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{backendHealth === 'online' ? 'Live backend ready' : backendHealth === 'offline' ? 'Backend unavailable' : 'Checking backend'}</span>
          </div>

          <button
            onClick={onUploadClick}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Upload New Dataset</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Datasets</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{datasets.length}</p>
          <p className="text-xs text-slate-500">Saved in SQLite database</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Dataset</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white truncate">{activeDataset?.filename || 'None Selected'}</p>
          <p className="text-xs text-slate-500">
            {activeDataset ? `${activeDataset.rows_count} rows × ${activeDataset.cols_count} cols` : 'Select dataset to inspect'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Engine</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">Gemini 2.5 Flash</p>
          <p className="text-xs text-slate-500">Free Tier Ready</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AutoML Pipeline</span>
            <BrainCircuit className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-xl font-bold text-red-300">Ready</p>
          <p className="text-xs text-slate-500">Classification & Regression</p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Search</span>
            <Search className="w-4 h-4 text-emerald-400" />
          </div>
          <input
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Filter datasets..."
            className="w-full bg-emerald-950/70 border border-emerald-900 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => activeDataset && onNavigateTab('eda')}
            className={`glass-card p-5 rounded-2xl flex items-center justify-between cursor-pointer ${
              !activeDataset ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Exploratory Data Analysis</p>
                <p className="text-xs text-slate-400">View statistical metrics & health score</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>

          <div 
            onClick={() => activeDataset && onNavigateTab('insights')}
            className={`glass-card p-5 rounded-2xl flex items-center justify-between cursor-pointer ${
              !activeDataset ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">AI Executive Insights</p>
                <p className="text-xs text-slate-400">Generate strategic recommendations</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>

          <div 
            onClick={() => activeDataset && onNavigateTab('ml_studio')}
            className={`glass-card p-5 rounded-2xl flex items-center justify-between cursor-pointer ${
              !activeDataset ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">AutoML Model Studio</p>
                <p className="text-xs text-slate-400">Train & download ML models</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Datasets Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white">Recent Datasets</h2>
        {filteredDatasets.length === 0 ? (
          <div className="text-center py-8 text-slate-500 space-y-2">
            <p>{datasets.length === 0 ? 'No datasets uploaded yet.' : 'No datasets match your search.'}</p>
            <button
              onClick={onUploadClick}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Upload your first dataset
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between pb-3 text-xs text-slate-500">
              <span>{filteredDatasets.length} dataset{filteredDatasets.length === 1 ? '' : 's'} shown</span>
              {searchQuery && <span>Filtered by "{searchQuery}"</span>}
            </div>
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Rows × Cols</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredDatasets.map((d) => {
                  const isSelected = activeDataset?.id === d.id;
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>{d.filename}</span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-xs font-bold text-slate-400">{d.file_type}</td>
                      <td className="py-3.5 px-4">{d.rows_count} × {d.cols_count}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectDataset(d)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-600/20 hover:bg-red-600/30 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Database, FileSpreadsheet, Cpu, Server } from 'lucide-react';
import { Dataset } from '@/lib/api';

interface NavbarProps {
  activeDataset: Dataset | null;
  onSelectDatasetClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeDataset, onSelectDatasetClick }) => {
  return (
    <header className="h-15 border-b border-slate-800 bg-[#0c121e] sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-base tracking-tight text-white">
            DataInsight <span className="text-indigo-400 font-normal">Analytics Studio</span>
          </span>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Workspace Status & Dataset Controls */}
      <div className="flex items-center space-x-4">
        {activeDataset ? (
          <button 
            onClick={onSelectDatasetClick}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs transition-colors text-slate-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-white truncate max-w-[180px]">{activeDataset.filename}</span>
            <span className="text-[10px] text-slate-400">({activeDataset.rows_count} rows × {activeDataset.cols_count} cols)</span>
          </button>
        ) : (
          <button
            onClick={onSelectDatasetClick}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select / Upload Dataset</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-slate-800" />

        <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>FastAPI + SQLite</span>
        </div>
      </div>
    </header>
  );
};

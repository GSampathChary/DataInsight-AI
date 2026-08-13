'use client';

import React from 'react';
import { Database, FileSpreadsheet, Cpu, Server } from 'lucide-react';
import { Dataset } from '@/lib/api';

interface NavbarProps {
  activeDataset: Dataset | null;
  onSelectDatasetClick: () => void;
  backendHealth: 'checking' | 'online' | 'offline';
}

export const Navbar: React.FC<NavbarProps> = ({ activeDataset, onSelectDatasetClick, backendHealth }) => {
  return (
    <header className="h-15 border-b border-emerald-900/80 bg-[#0a1510] sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-base tracking-tight text-white">
            DataInsight <span className="text-emerald-400 font-normal">Analytics Studio</span>
          </span>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-900">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Workspace Status & Dataset Controls */}
      <div className="flex items-center space-x-4">
        {activeDataset ? (
          <button 
            onClick={onSelectDatasetClick}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/50 border border-emerald-900 text-xs transition-colors text-emerald-100"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-white truncate max-w-[180px]">{activeDataset.filename}</span>
            <span className="text-[10px] text-slate-400">({activeDataset.rows_count} rows × {activeDataset.cols_count} cols)</span>
          </button>
        ) : (
          <button
            onClick={onSelectDatasetClick}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select / Upload Dataset</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-emerald-900" />

        <div className="flex items-center space-x-1.5 text-emerald-300 text-xs font-mono">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>FastAPI + SQLite</span>
        </div>

        <div
          className={`flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
            backendHealth === 'online'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : backendHealth === 'offline'
              ? 'bg-red-500/10 text-red-300 border-red-500/30'
              : 'bg-emerald-950/70 text-emerald-200 border-emerald-900'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${
            backendHealth === 'online'
              ? 'bg-emerald-400'
              : backendHealth === 'offline'
              ? 'bg-red-400'
              : 'bg-emerald-500 animate-pulse'
          }`} />
          <span>
            {backendHealth === 'online' ? 'Backend Online' : backendHealth === 'offline' ? 'Backend Offline' : 'Checking...'}
          </span>
        </div>
      </div>
    </header>
  );
};

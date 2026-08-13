'use client';

import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  UploadCloud, 
  TableProperties, 
  BarChart3, 
  PieChart, 
  Sparkles, 
  BrainCircuit, 
  FileText, 
  Settings, 
  Info 
} from 'lucide-react';

export type TabType = 
  | 'landing' 
  | 'dashboard' 
  | 'upload' 
  | 'overview' 
  | 'eda' 
  | 'visualizations' 
  | 'insights' 
  | 'ml_studio' 
  | 'reports' 
  | 'settings' 
  | 'about';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasDataset: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, hasDataset }) => {
  const sections = [
    {
      title: 'PLATFORM WORKSPACE',
      items: [
        { id: 'landing', label: 'Overview', icon: Home, requiresDataset: false },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresDataset: false },
        { id: 'upload', label: 'Upload Dataset', icon: UploadCloud, requiresDataset: false },
      ]
    },
    {
      title: 'DATA ENGINE',
      items: [
        { id: 'overview', label: 'Data Cleaning', icon: TableProperties, requiresDataset: true },
        { id: 'eda', label: 'EDA Statistics', icon: BarChart3, requiresDataset: true },
        { id: 'visualizations', label: 'Visual Studio', icon: PieChart, requiresDataset: true },
      ]
    },
    {
      title: 'INTELLIGENCE & ML',
      items: [
        { id: 'insights', label: 'Executive Insights', icon: Sparkles, requiresDataset: true },
        { id: 'ml_studio', label: 'AutoML Studio', icon: BrainCircuit, requiresDataset: true, badge: 'AutoML' },
        { id: 'reports', label: 'Export Reports', icon: FileText, requiresDataset: true },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, requiresDataset: false },
        { id: 'about', label: 'Architecture', icon: Info, requiresDataset: false },
      ]
    }
  ];

  return (
    <aside className="w-60 border-r border-emerald-900/80 bg-[#0a1510] flex flex-col justify-between py-4 px-3 select-none text-xs">
      <div className="space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono font-semibold text-slate-500 tracking-wider">
              {section.title}
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDisabled = item.requiresDataset && !hasDataset;

              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && onTabChange(item.id as TabType)}
                  disabled={isDisabled}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : isDisabled
                      ? 'opacity-30 cursor-not-allowed text-slate-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-emerald-950/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-900 text-[11px] text-slate-400 space-y-1 font-mono">
        <p className="text-emerald-200 font-semibold">FastAPI + Next.js</p>
        <p className="text-[10px] text-slate-500">Built for Data Science Portfolio</p>
      </div>
    </aside>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, TabType } from '@/components/layout/Sidebar';
import { LandingView } from '@/features/landing/LandingView';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { UploadView } from '@/features/upload/UploadView';
import { OverviewView } from '@/features/overview/OverviewView';
import { EDAView } from '@/features/analysis/EDAView';
import { VisualizationView } from '@/features/visualization/VisualizationView';
import { AIInsightsView } from '@/features/insights/AIInsightsView';
import { MLStudioView } from '@/features/ml/MLStudioView';
import { ReportsView } from '@/features/reports/ReportsView';
import { SettingsView } from '@/features/settings/SettingsView';
import { AboutView } from '@/features/about/AboutView';
import { api, Dataset } from '@/lib/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await api.get('/datasets');
      const list = res.data.data || [];
      setDatasets(list);
      if (list.length > 0 && !activeDataset) {
        setActiveDataset(list[0]);
      }
    } catch (err) {
      console.error('API Server unavailable or starting up...', err);
    }
  };

  const handleSelectDataset = (d: Dataset) => {
    setActiveDataset(d);
    setActiveTab('overview');
  };

  const handleUploadSuccess = (d: Dataset) => {
    setActiveDataset(d);
    fetchDatasets();
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        activeDataset={activeDataset}
        onSelectDatasetClick={() => setActiveTab('upload')}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          hasDataset={!!activeDataset}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'landing' && (
            <LandingView onStartClick={() => setActiveTab('upload')} />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              datasets={datasets}
              activeDataset={activeDataset}
              onSelectDataset={handleSelectDataset}
              onUploadClick={() => setActiveTab('upload')}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'upload' && (
            <UploadView onUploadSuccess={handleUploadSuccess} />
          )}

          {activeTab === 'overview' && activeDataset && (
            <OverviewView
              key={activeDataset.id}
              dataset={activeDataset}
              onRefreshDataset={fetchDatasets}
            />
          )}

          {activeTab === 'eda' && activeDataset && (
            <EDAView key={activeDataset.id} dataset={activeDataset} />
          )}

          {activeTab === 'visualizations' && activeDataset && (
            <VisualizationView key={activeDataset.id} dataset={activeDataset} />
          )}

          {activeTab === 'insights' && activeDataset && (
            <AIInsightsView key={activeDataset.id} dataset={activeDataset} />
          )}

          {activeTab === 'ml_studio' && activeDataset && (
            <MLStudioView key={activeDataset.id} dataset={activeDataset} />
          )}

          {activeTab === 'reports' && activeDataset && (
            <ReportsView key={activeDataset.id} dataset={activeDataset} />
          )}

          {activeTab === 'settings' && <SettingsView />}

          {activeTab === 'about' && <AboutView />}
        </main>
      </div>
    </div>
  );
}

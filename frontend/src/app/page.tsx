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

type BackendHealth = 'checking' | 'online' | 'offline';
const VALID_TABS: TabType[] = [
  'landing',
  'dashboard',
  'upload',
  'overview',
  'eda',
  'visualizations',
  'insights',
  'ml_studio',
  'reports',
  'settings',
  'about',
];

const ACTIVE_TAB_STORAGE_KEY = 'datainsight.activeTab';
const ACTIVE_DATASET_STORAGE_KEY = 'datainsight.activeDatasetId';
const DASHBOARD_SEARCH_STORAGE_KEY = 'datainsight.dashboardSearch';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [backendHealth, setBackendHealth] = useState<BackendHealth>('checking');
  const [dashboardSearch, setDashboardSearch] = useState('');

  useEffect(() => {
    const savedTab = window.localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    const savedDatasetId = window.localStorage.getItem(ACTIVE_DATASET_STORAGE_KEY);
    const savedSearchQuery = window.localStorage.getItem(DASHBOARD_SEARCH_STORAGE_KEY);

    if (savedTab && VALID_TABS.includes(savedTab as TabType)) {
      setActiveTab(savedTab as TabType);
    }

    if (savedSearchQuery) {
      setDashboardSearch(savedSearchQuery);
    }

    fetchDatasets(savedDatasetId);
    fetchBackendHealth();

    const interval = window.setInterval(fetchBackendHealth, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (dashboardSearch.trim()) {
      window.localStorage.setItem(DASHBOARD_SEARCH_STORAGE_KEY, dashboardSearch);
    } else {
      window.localStorage.removeItem(DASHBOARD_SEARCH_STORAGE_KEY);
    }
  }, [dashboardSearch]);

  useEffect(() => {
    if (activeDataset?.id) {
      window.localStorage.setItem(ACTIVE_DATASET_STORAGE_KEY, activeDataset.id);
    } else {
      window.localStorage.removeItem(ACTIVE_DATASET_STORAGE_KEY);
    }
  }, [activeDataset]);

  const fetchBackendHealth = async () => {
    try {
      const res = await api.get('/health');
      setBackendHealth(res.data?.status === 'online' ? 'online' : 'offline');
    } catch (err) {
      setBackendHealth('offline');
    }
  };

  const fetchDatasets = async (preferredDatasetId?: string | null) => {
    try {
      const res = await api.get('/datasets');
      const list = res.data.data || [];
      setDatasets(list);

      if (preferredDatasetId) {
        const preferred = list.find((d: Dataset) => d.id === preferredDatasetId);
        if (preferred) {
          setActiveDataset(preferred);
          return;
        }
      }

      if (list.length > 0 && !activeDataset) {
        setActiveDataset(list[0]);
      }

      if (list.length === 0) {
        setActiveDataset(null);
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
        backendHealth={backendHealth}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          hasDataset={!!activeDataset}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-5 md:p-8">
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
              backendHealth={backendHealth}
              searchQuery={dashboardSearch}
              onSearchQueryChange={setDashboardSearch}
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

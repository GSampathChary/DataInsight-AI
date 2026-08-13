'use client';

import React from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  BarChart2, 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight, 
  Database,
  Layers,
  Cpu,
  ShieldCheck,
  Download
} from 'lucide-react';

interface LandingViewProps {
  onStartClick: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartClick }) => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="text-center pt-8 space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Next-Generation AI Business Intelligence & AutoML</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Transform Raw Datasets into <br />
          <span className="bg-gradient-to-r from-emerald-400 via-lime-400 to-red-400 bg-clip-text text-transparent">
            Actionable AI Business Insights
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-normal">
          Upload CSV/XLSX files to automatically clean data, perform comprehensive EDA, generate interactive visual dashboards, extract Gemini AI insights, and train AutoML models.
        </p>

        <div className="flex items-center justify-center space-x-4 pt-4">
          <button
            onClick={onStartClick}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-red-600 hover:from-emerald-500 hover:to-red-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload Dataset Now</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>

      {/* End-to-End Workflow Diagram */}
      <section className="glass-panel rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Seamless Automated Workflow</h2>
          <p className="text-slate-400 text-sm">From raw dataset upload to trained model binary download in seconds</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center pt-4">
          {[
            { step: '1', title: 'Upload CSV', icon: UploadCloud, color: 'text-emerald-400' },
            { step: '2', title: 'Data Cleaning', icon: Layers, color: 'text-lime-400' },
            { step: '3', title: 'EDA Dashboard', icon: BarChart2, color: 'text-red-400' },
            { step: '4', title: 'AI Insights', icon: Sparkles, color: 'text-emerald-400' },
            { step: '5', title: 'Select Target', icon: Database, color: 'text-lime-300' },
            { step: '6', title: 'Train ML Model', icon: BrainCircuit, color: 'text-red-300' },
            { step: '7', title: 'Download Model', icon: Download, color: 'text-emerald-300' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card rounded-xl p-4 flex flex-col items-center space-y-2 relative">
                <div className={`w-10 h-10 rounded-lg bg-emerald-950/70 flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-400 font-semibold">Step {item.step}</span>
                <span className="text-xs font-bold text-slate-200">{item.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Platform Features Matrix */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Core Platform Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated EDA Engine</h3>
            <p className="text-slate-400 text-sm">
              Calculate summary statistics, missing values, duplicate rows, skewness, kurtosis, correlation heatmaps, and outlier detections automatically.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Gemini AI Executive Insights</h3>
            <p className="text-slate-400 text-sm">
              Receive automated executive summaries, strategic business recommendations, anomaly explanations, and interactive dataset Q&A.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-300">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AutoML & Model Download</h3>
            <p className="text-slate-400 text-sm">
              Select your target column to auto-detect Classification or Regression tasks, compare candidate model accuracies, and download the trained `.joblib` model.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

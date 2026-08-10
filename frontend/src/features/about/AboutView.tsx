'use client';

import React from 'react';
import { Info, Code, Layers, Cpu, Github, ExternalLink } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Info className="w-6 h-6 text-indigo-400" />
          <span>About DataInsight AI</span>
        </h1>
        <p className="text-slate-400 text-sm">AI-Powered Data Analytics, Business Intelligence & AutoML Platform.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Project Vision & Architecture</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            DataInsight AI is designed to bridge the gap between complex raw datasets and strategic business intelligence. 
            By integrating automated exploratory data analysis (EDA), interactive charts, Google Gemini LLMs, and an AutoML training engine, 
            users can upload datasets and receive immediate insights, data health scores, and trained machine learning binary models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="glass-card p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
              <Code className="w-4 h-4" />
              <span>Frontend Stack</span>
            </div>
            <p className="text-xs text-slate-400">
              Next.js 15, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Framer Motion, Axios.
            </p>
          </div>

          <div className="glass-card p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Backend & Machine Learning Engine</span>
            </div>
            <p className="text-xs text-slate-400">
              FastAPI (Python), Pandas, NumPy, Scikit-learn, Google Gemini API, SQLite, Joblib.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Version: 1.0.0 (Production Release)</span>
          <span className="text-indigo-400 font-medium">Built for Portfolio Showcase</span>
        </div>
      </div>
    </div>
  );
};

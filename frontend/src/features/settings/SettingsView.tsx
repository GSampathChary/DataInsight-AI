'use client';

import React, { useState } from 'react';
import { Settings, Key, Moon, Globe, Database, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-slate-400 text-sm">Configure AI Providers, API Keys, and Environment Preferences.</p>
      </div>

      <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Google Gemini API Key</span>
            </label>
            <p className="text-xs text-slate-400">
              Provide your free Gemini API key to enable generative AI responses. If omitted, DataInsight AI uses its built-in analytical engine.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-emerald-950/70 border border-emerald-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-red-400" />
              <span>Default Storage & Database</span>
            </label>
            <input
              type="text"
              disabled
              value="SQLite (datainsight.db)"
              className="w-full bg-emerald-950/50 border border-emerald-900 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/30 w-full sm:w-auto"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Settings className="w-4 h-4" />}
            <span>{saved ? 'Settings Saved!' : 'Save Settings'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

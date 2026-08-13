'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Lightbulb, 
  AlertCircle, 
  FileText, 
  Key 
} from 'lucide-react';
import { api, Dataset } from '@/lib/api';

interface AIInsightsViewProps {
  dataset: Dataset;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ dataset }) => {
  const [promptType, setPromptType] = useState('business_insights');
  const [customQuestion, setCustomQuestion] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [insight, setInsight] = useState<string>('');
  const [usedGemini, setUsedGemini] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string }>>([]);

  useEffect(() => {
    fetchInsight();
  }, [dataset.id, promptType]);

  const fetchInsight = async (question?: string) => {
    setLoading(true);
    try {
      const res = await api.post('/ai-insights', {
        dataset_id: dataset.id,
        prompt_type: promptType,
        custom_question: question || null,
        api_key: apiKey || null
      });

      const data = res.data.data;
      setInsight(data.content);
      setUsedGemini(data.used_gemini);

      if (question) {
        setChatHistory(prev => [...prev, { q: question, a: data.content }]);
        setCustomQuestion('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    fetchInsight(customQuestion);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>AI Executive Insights & Intelligence</span>
          </h1>
          <p className="text-slate-400 text-sm">Powered by Google Gemini API with intelligent heuristic fallback.</p>
        </div>

        {/* API Key Optional Input */}
        <div className="flex items-center space-x-2 glass-card px-3 py-1.5 rounded-xl border border-emerald-900">
          <Key className="w-4 h-4 text-red-400" />
          <input
            type="password"
            placeholder="Gemini API Key (Optional)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-44"
          />
        </div>
      </div>

      {/* Insight Category Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'business_insights', label: 'Strategic Business Insights', icon: Lightbulb },
          { id: 'dataset_summary', label: 'Executive Summary', icon: FileText },
          { id: 'recommendations', label: 'Tactical Action Plan', icon: Sparkles },
          { id: 'anomalies', label: 'Anomaly & Outlier Analysis', icon: AlertCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = promptType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPromptType(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-red-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-emerald-950/70 hover:bg-emerald-900/70 text-slate-300 border border-emerald-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* AI Insight Content Display Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-900 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {promptType.replace('_', ' ')}
          </span>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            usedGemini ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-950 text-slate-400 border border-emerald-900'
          }`}>
            {usedGemini ? 'Live Gemini 2.5 Output' : 'Static Analytical Engine'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 space-x-2">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            <span className="text-sm">Synthesizing Dataset Intelligence...</span>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed whitespace-pre-line font-sans">
            {insight}
          </div>
        )}
      </div>

      {/* Dataset Q&A AI Assistant */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>Ask Questions about Dataset</span>
        </h2>

        {chatHistory.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {chatHistory.map((item, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-950/70 text-emerald-300 font-semibold">
                  Q: {item.q}
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/80 text-slate-200 whitespace-pre-line border border-emerald-900">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAskQuestion} className="flex space-x-2">
          <input
            type="text"
            placeholder="Ask a question about this dataset (e.g. Which columns have high correlation?)"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="flex-1 bg-emerald-950/70 border border-emerald-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/30"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};

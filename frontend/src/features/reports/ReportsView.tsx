'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Copy, Download, Check, Loader2 } from 'lucide-react';
import { api, Dataset } from '@/lib/api';

interface ReportsViewProps {
  dataset: Dataset;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ dataset }) => {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [dataset.id]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/report?dataset_id=${dataset.id}`);
      setReport(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (report?.content) {
      navigator.clipboard.writeText(report.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!report?.content) return;
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executive_Report_${dataset.filename.replace('.', '_')}.md`;
    a.click();
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Executive Business Report Generator</span>
          </h1>
          <p className="text-slate-400 text-sm">Automated end-to-end analytical summary, health metrics, and recommendations.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 text-white font-medium text-xs border border-emerald-900 transition-colors w-full sm:w-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-red-500 text-white font-medium text-xs transition-colors shadow-md shadow-emerald-600/30 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download Report (.md)</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 sm:p-8 rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs">Generating Comprehensive Executive Report...</span>
          </div>
        ) : (
          <div className="prose prose-invert prose-slate max-w-none text-slate-200 leading-relaxed font-sans whitespace-pre-line">
            {report?.content}
          </div>
        )}
      </div>
    </div>
  );
};

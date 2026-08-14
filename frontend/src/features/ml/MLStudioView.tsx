'use client';

import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Target, 
  Download, 
  Trophy, 
  Loader2, 
  CheckCircle2, 
  BarChart2, 
  Zap 
} from 'lucide-react';
import { api, Dataset, MLTrainResult } from '@/lib/api';

interface MLStudioViewProps {
  dataset: Dataset;
}

export const MLStudioView: React.FC<MLStudioViewProps> = ({ dataset }) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('auto');
  const [isTraining, setIsTraining] = useState(false);
  const [result, setResult] = useState<MLTrainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchColumns();
  }, [dataset.id]);

  const fetchColumns = async () => {
    try {
      const res = await api.get(`/dataset-preview/${dataset.id}?limit=1`);
      const cols = res.data.data.columns || [];
      setColumns(cols);
      if (cols.length > 0) setTargetColumn(cols[cols.length - 1]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrainModels = async () => {
    if (!targetColumn) return;
    setIsTraining(true);
    setError(null);
    try {
      const res = await api.post('/train-ml', {
        dataset_id: dataset.id,
        target_column: targetColumn,
        task_type: taskType
      });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Model training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const handleDownloadModel = (modelId: string) => {
    window.open(`http://127.0.0.1:8000/api/download-model/${modelId}`, '_blank');
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <BrainCircuit className="w-6 h-6 text-red-400" />
          <span>AutoML Studio & Model Training Pipeline</span>
        </h1>
        <p className="text-slate-400 text-sm">Select target variable, auto-train multiple algorithms, compare performance metrics, and download the trained binary model.</p>
      </div>

      {/* Model Configuration Form */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-red-400" />
              <span>Select Target Column</span>
            </label>
            <select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full bg-emerald-950/70 border border-emerald-900 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            >
              {columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Task Type</span>
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full bg-emerald-950/70 border border-emerald-900 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="auto">Auto-Detect (Classification vs Regression)</option>
              <option value="classification">Classification</option>
              <option value="regression">Regression</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTrainModels}
              disabled={isTraining || !targetColumn}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-red-600 hover:from-emerald-500 hover:to-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30"
            >
              {isTraining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Training Candidate Models...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Train & Compare Models</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Best Model Banner */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-red-950/30 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase">
                <Trophy className="w-4 h-4" />
                <span>Best Performing Model</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">{result.best_model.model_name}</h2>
              <p className="text-xs text-slate-400">
                Task Type: <span className="text-red-300 font-semibold uppercase">{result.task_type}</span> | Target: <span className="text-white font-semibold">{result.target_column}</span>
              </p>
            </div>

            <button
              onClick={() => handleDownloadModel(result.best_model.model_id)}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-red-600 hover:from-emerald-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all w-full md:w-auto"
            >
              <Download className="w-5 h-5" />
              <span>Download Model (.joblib)</span>
            </button>
          </div>

          {/* Model Comparison Table */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Algorithm Accuracy & Performance Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-4">Algorithm Name</th>
                    {result.task_type === 'classification' ? (
                      <>
                        <th className="py-2.5 px-4">Accuracy</th>
                        <th className="py-2.5 px-4">Precision</th>
                        <th className="py-2.5 px-4">Recall</th>
                        <th className="py-2.5 px-4">F1 Score</th>
                      </>
                    ) : (
                      <>
                        <th className="py-2.5 px-4">R² Score</th>
                        <th className="py-2.5 px-4">MAE</th>
                        <th className="py-2.5 px-4">MSE</th>
                        <th className="py-2.5 px-4">RMSE</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {result.all_models_comparison.map((m, idx) => (
                    <tr key={idx} className={idx === 0 ? 'bg-emerald-950/20 font-bold' : 'hover:bg-slate-800/40'}>
                      <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                        {idx === 0 && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{m.model_name}</span>
                      </td>
                      {result.task_type === 'classification' ? (
                        <>
                          <td className="py-3 px-4 text-emerald-400">{m.metrics.accuracy}</td>
                          <td className="py-3 px-4">{m.metrics.precision}</td>
                          <td className="py-3 px-4">{m.metrics.recall}</td>
                          <td className="py-3 px-4">{m.metrics.f1_score}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-emerald-400">{m.metrics.r2_score}</td>
                          <td className="py-3 px-4">{m.metrics.mae}</td>
                          <td className="py-3 px-4">{m.metrics.mse}</td>
                          <td className="py-3 px-4">{m.metrics.rmse}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

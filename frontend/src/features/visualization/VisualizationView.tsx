'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { PieChart as PieIcon, BarChart2, TrendingUp, ScatterChart as ScatterIcon, Loader2 } from 'lucide-react';
import { api, Dataset } from '@/lib/api';

interface VisualizationViewProps {
  dataset: Dataset;
}

const COLORS = ['#22c55e', '#ef4444', '#84cc16', '#16a34a', '#dc2626', '#4ade80', '#f43f5e'];

export const VisualizationView: React.FC<VisualizationViewProps> = ({ dataset }) => {
  const [chartType, setChartType] = useState('histogram');
  const [colX, setColX] = useState<string>('');
  const [colY, setColY] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchColumns();
  }, [dataset.id]);

  useEffect(() => {
    if (columns.length > 0) {
      fetchChart();
    }
  }, [dataset.id, chartType, colX, colY, columns]);

  const fetchColumns = async () => {
    try {
      const res = await api.get(`/dataset-preview/${dataset.id}?limit=1`);
      const cols = res.data.data.columns || [];
      setColumns(cols);
      if (cols.length > 0 && !colX) setColX(cols[0]);
      if (cols.length > 1 && !colY) setColY(cols[1]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/visualizations', {
        params: {
          dataset_id: dataset.id,
          chart_type: chartType,
          col_x: colX,
          col_y: colY
        }
      });
      setChartData(res.data.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Interactive Chart Studio</h1>
        <p className="text-slate-400 text-sm">Visualize column distributions, relationships, trends, and frequencies using Recharts.</p>
      </div>

      {/* Chart Selector & Controls */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'histogram', label: 'Histogram / Distribution', icon: BarChart2 },
            { id: 'bar', label: 'Bar Chart', icon: BarChart2 },
            { id: 'line', label: 'Line Chart', icon: TrendingUp },
            { id: 'scatter', label: 'Scatter Plot', icon: ScatterIcon },
            { id: 'pie', label: 'Pie Chart', icon: PieIcon },
          ].map((type) => {
            const Icon = type.icon;
            const isActive = chartType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-emerald-950/70 hover:bg-emerald-900/70 text-slate-300 border border-emerald-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">X-Axis / Variable 1</label>
            <select
              value={colX}
              onChange={(e) => setColX(e.target.value)}
              className="w-full bg-emerald-950/70 border border-emerald-900 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {(chartType === 'scatter' || chartType === 'line') && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Y-Axis / Variable 2</label>
              <select
                value={colY}
                onChange={(e) => setColY(e.target.value)}
              className="w-full bg-emerald-950/70 border border-emerald-900 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="glass-panel p-6 rounded-2xl min-h-[420px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center space-y-2 text-slate-400">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs">Rendering Chart...</span>
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-slate-500 text-sm">No valid chart data available for the selected variables.</p>
        ) : (
          <div className="w-full h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'histogram' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#173124" />
                  <XAxis dataKey="bin" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1712', borderColor: '#173124', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#173124" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1712', borderColor: '#173124', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#173124" />
                  <XAxis dataKey="index" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1712', borderColor: '#173124', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="y" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              ) : chartType === 'scatter' ? (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#173124" />
                  <XAxis dataKey="x" name={colX} stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="y" name={colY} stroke="#94a3b8" fontSize={11} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0c1712', borderColor: '#173124', borderRadius: '8px', color: '#fff' }} />
                  <Scatter data={chartData} fill="#ef4444" />
                </ScatterChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0c1712', borderColor: '#173124', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

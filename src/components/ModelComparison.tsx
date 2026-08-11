import React, { useState } from 'react';
import { ModelMetrics, ConfusionMatrix, TrainingEpoch, ModelType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Sliders, RefreshCw, BarChart3, TrendingDown, Grid3X3, Info } from 'lucide-react';

interface ModelComparisonProps {
  metrics: { [key in ModelType]: ModelMetrics };
  confusionMatrices: { [key in ModelType]: ConfusionMatrix };
  logisticHistory: TrainingEpoch[];
  onRetrain: (params: {
    lr: number;
    epochs: number;
    depth: number;
    split: number;
    k: number;
  }) => void;
  currentParams: {
    lr: number;
    epochs: number;
    depth: number;
    split: number;
    k: number;
  };
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  metrics,
  confusionMatrices,
  logisticHistory,
  onRetrain,
  currentParams
}) => {
  // Local hyperparameter state
  const [lr, setLr] = useState(currentParams.lr);
  const [epochs, setEpochs] = useState(currentParams.epochs);
  const [depth, setDepth] = useState(currentParams.depth);
  const [split, setSplit] = useState(currentParams.split);
  const [k, setK] = useState(currentParams.k);

  const [activeTab, setActiveTab] = useState<'metrics' | 'loss' | 'matrix'>('metrics');
  const [isRetraining, setIsRetraining] = useState(false);

  const handleRetrain = () => {
    setIsRetraining(true);
    // Simulate minor delay to give a premium training animation feel
    setTimeout(() => {
      onRetrain({ lr, epochs, depth, split, k });
      setIsRetraining(false);
    }, 600);
  };

  // Format metrics for Recharts
  const chartData = [
    {
      metric: 'Accuracy',
      'Logistic Regression': Number((metrics.logistic.accuracy * 100).toFixed(1)),
      'Decision Tree': Number((metrics.decision_tree.accuracy * 100).toFixed(1)),
      'K-Nearest Neighbors': Number((metrics.knn.accuracy * 100).toFixed(1))
    },
    {
      metric: 'Precision',
      'Logistic Regression': Number((metrics.logistic.precision * 100).toFixed(1)),
      'Decision Tree': Number((metrics.decision_tree.precision * 100).toFixed(1)),
      'K-Nearest Neighbors': Number((metrics.knn.precision * 100).toFixed(1))
    },
    {
      metric: 'Recall',
      'Logistic Regression': Number((metrics.logistic.recall * 100).toFixed(1)),
      'Decision Tree': Number((metrics.decision_tree.recall * 100).toFixed(1)),
      'K-Nearest Neighbors': Number((metrics.knn.recall * 100).toFixed(1))
    },
    {
      metric: 'F1 Score',
      'Logistic Regression': Number((metrics.logistic.f1 * 100).toFixed(1)),
      'Decision Tree': Number((metrics.decision_tree.f1 * 100).toFixed(1)),
      'K-Nearest Neighbors': Number((metrics.knn.f1 * 100).toFixed(1))
    }
  ];

  const lossData = logisticHistory.map(h => ({
    Epoch: h.epoch,
    Loss: Number(h.loss.toFixed(4)),
    Accuracy: Number((h.accuracy * 100).toFixed(1))
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="model-comparison-and-tuning">
      
      {/* Hyperparameter Controls */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between" id="tuning-panel">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
            <Sliders className="h-5 w-5 text-red-500" />
            Hyperparameter Tuning
          </h2>

          <div className="space-y-6">
            {/* Logistic Regression Group */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Logistic Regression</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Learning Rate (α):</span>
                  <span className="font-mono bg-slate-50 border px-1.5 py-0.5 rounded-md text-slate-700">{lr}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={lr}
                  onChange={(e) => setLr(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Gradient Epochs:</span>
                  <span className="font-mono bg-slate-50 border px-1.5 py-0.5 rounded-md text-slate-700">{epochs}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* Decision Tree Group */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Decision Tree</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Max Depth:</span>
                  <span className="font-mono bg-slate-50 border px-1.5 py-0.5 rounded-md text-slate-700">{depth} levels</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="7"
                  step="1"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Min Samples to Split:</span>
                  <span className="font-mono bg-slate-50 border px-1.5 py-0.5 rounded-md text-slate-700">{split} patients</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={split}
                  onChange={(e) => setSplit(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* KNN Group */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">K-Nearest Neighbors</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">K Neighbors (K):</span>
                  <span className="font-mono bg-slate-50 border px-1.5 py-0.5 rounded-md text-slate-700">{k} neighbors</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="2" // standard practice to use odd numbers to avoid tie votes
                  value={k}
                  onChange={(e) => setK(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Train Trigger */}
        <button
          id="btn-retrain"
          onClick={handleRetrain}
          disabled={isRetraining}
          className="mt-6 w-full bg-slate-900 text-white rounded-xl py-3 text-xs font-bold hover:bg-slate-800 disabled:bg-slate-300 transition-colors flex items-center justify-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Rebuilding Models...' : 'Retrain Pipeline'}</span>
        </button>
      </div>

      {/* Model Performance Comparison Output */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between" id="comparison-display">
        <div>
          {/* Subheader and view toggle tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">Evaluation Dashboard</h2>
              <p className="text-xs text-slate-500">Compare testing outputs from 30% pipeline validation split</p>
            </div>

            {/* Evaluation sub-tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl self-start border border-slate-200">
              <button
                id="tab-eval-metrics"
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'metrics' 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Metrics Comparison</span>
              </button>
              <button
                id="tab-eval-loss"
                onClick={() => setActiveTab('loss')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'loss' 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Loss Epochs</span>
              </button>
              <button
                id="tab-eval-matrix"
                onClick={() => setActiveTab('matrix')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'matrix' 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Confusion Matrices</span>
              </button>
            </div>
          </div>

          {/* Render Active Tab */}
          <div className="h-[280px]" id="comparison-tabs-content">
            {activeTab === 'metrics' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value}%`]} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Logistic Regression" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Decision Tree" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="K-Nearest Neighbors" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'loss' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="Epoch" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Gradient Epochs', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'BCE Loss', angle: -90, position: 'insideLeft', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Accuracy (%)', angle: 90, position: 'insideRight', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="Loss" stroke="#ef4444" strokeWidth={2} dot={false} name="Loss" />
                  <Line yAxisId="right" type="monotone" dataKey="Accuracy" stroke="#10b981" strokeWidth={1.5} dot={false} name="Accuracy (%)" />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'matrix' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full" id="confusion-matrices-grid">
                {/* 1. LR Matrix */}
                <div className="flex flex-col justify-between border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <div className="text-center font-bold text-xs text-slate-700">Logistic Regression</div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2 flex-1 items-center font-mono">
                    <div className="bg-white border p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400">TN</div>
                      <div className="text-sm font-bold text-slate-800">{confusionMatrices.logistic.trueNegative}</div>
                    </div>
                    <div className="bg-red-50/40 border border-red-100/50 p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400 text-red-400">FP</div>
                      <div className="text-sm font-bold text-red-600">{confusionMatrices.logistic.falsePositive}</div>
                    </div>
                    <div className="bg-red-50/40 border border-red-100/50 p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400 text-red-400">FN</div>
                      <div className="text-sm font-bold text-red-600">{confusionMatrices.logistic.falseNegative}</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400 text-emerald-600">TP</div>
                      <div className="text-sm font-bold text-emerald-700">{confusionMatrices.logistic.truePositive}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center mt-2">Acc: {(metrics.logistic.accuracy * 100).toFixed(0)}%</div>
                </div>

                {/* 2. DT Matrix */}
                <div className="flex flex-col justify-between border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <div className="text-center font-bold text-xs text-slate-700">Decision Tree</div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2 flex-1 items-center font-mono">
                    <div className="bg-white border p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400">TN</div>
                      <div className="text-sm font-bold text-slate-800">{confusionMatrices.decision_tree.trueNegative}</div>
                    </div>
                    <div className="bg-red-50/40 border border-red-100/50 p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400 text-red-400">FP</div>
                      <div className="text-sm font-bold text-red-600">{confusionMatrices.decision_tree.falsePositive}</div>
                    </div>
                    <div className="bg-red-50/40 border border-red-100/50 p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400 text-red-400">FN</div>
                      <div className="text-sm font-bold text-red-600">{confusionMatrices.decision_tree.falseNegative}</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400 text-emerald-600">TP</div>
                      <div className="text-sm font-bold text-emerald-700">{confusionMatrices.decision_tree.truePositive}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center mt-2">Acc: {(metrics.decision_tree.accuracy * 100).toFixed(0)}%</div>
                </div>

                {/* 3. KNN Matrix */}
                <div className="flex flex-col justify-between border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <div className="text-center font-bold text-xs text-slate-700 font-display">K-Nearest Neighbors</div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2 flex-1 items-center font-mono">
                    <div className="bg-white border p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400">TN</div>
                      <div className="text-sm font-bold text-slate-800">{confusionMatrices.knn.trueNegative}</div>
                    </div>
                    <div className="bg-red-50/40 border border-red-100/50 p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400 text-red-400">FP</div>
                      <div className="text-sm font-bold text-red-600">{confusionMatrices.knn.falsePositive}</div>
                    </div>
                    <div className="bg-red-50/40 border border-red-100/50 p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400 text-red-400">FN</div>
                      <div className="text-sm font-bold text-red-600">{confusionMatrices.knn.falseNegative}</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center">
                      <div className="text-[10px] text-slate-400 text-emerald-600">TP</div>
                      <div className="text-sm font-bold text-emerald-700">{confusionMatrices.knn.truePositive}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center mt-2">Acc: {(metrics.knn.accuracy * 100).toFixed(0)}%</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informative Footer */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start space-x-3">
          <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-700">Classification Metrics Guide:</span> Accuracy measures overall correctness. <span className="font-medium">Precision</span> defines correctness among predicted positives (minimizing false alarms). <span className="font-medium">Recall</span> measures diagnosed diabetic cases among real positives (avoiding missed diagnoses). Retrain to see how changing bounds changes accuracy and precision!
          </div>
        </div>
      </div>
    </div>
  );
};

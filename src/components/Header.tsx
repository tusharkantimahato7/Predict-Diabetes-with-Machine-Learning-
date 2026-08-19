import React from 'react';
import { Activity, ShieldCheck, Database } from 'lucide-react';

interface HeaderProps {
  datasetSize: number;
}

export const Header: React.FC<HeaderProps> = ({ datasetSize }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-red-50 p-2 rounded-lg border border-red-100 flex items-center justify-center">
            <Activity className="h-6 w-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display tracking-tight flex items-center gap-2">
              DiaPredict <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">v1.1</span>
            </h1>
            <p className="text-xs text-slate-500">Clinical Diabetes Risk Predictor & Machine Learning Pipeline</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Active Model: Client-Side ML Sandbox</span>
          </div>
          <div className="flex shrink-0 items-center space-x-2 text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 sm:px-3 py-1.5 rounded-lg font-mono">
            <Database className="h-4 w-4 text-slate-500" />
            <span>N={datasetSize}<span className="hidden sm:inline"> patients</span></span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useMemo } from 'react';
import { PatientData } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell, BarChart, Bar, Legend } from 'recharts';
import { Table, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatasetVisualizerProps {
  dataset: PatientData[];
}

export const DatasetVisualizer: React.FC<DatasetVisualizerProps> = ({ dataset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'healthy' | 'diabetic'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Prepare Scatter Plot data: Glucose vs BMI, colored by Outcome
  const scatterData = useMemo(() => {
    return dataset.map((p, index) => ({
      id: index,
      Glucose: p.Glucose,
      BMI: p.BMI,
      Outcome: p.Outcome,
      Age: p.Age,
      label: p.Outcome === 1 ? 'Diabetic' : 'Healthy'
    }));
  }, [dataset]);

  // 2. Prepare Age Distribution Bar Chart data
  const ageDistribution = useMemo(() => {
    const bins = {
      '21-30': { healthy: 0, diabetic: 0 },
      '31-40': { healthy: 0, diabetic: 0 },
      '41-50': { healthy: 0, diabetic: 0 },
      '51-60': { healthy: 0, diabetic: 0 },
      '61+': { healthy: 0, diabetic: 0 }
    };

    dataset.forEach(p => {
      let bin: keyof typeof bins = '61+';
      if (p.Age <= 30) bin = '21-30';
      else if (p.Age <= 40) bin = '31-40';
      else if (p.Age <= 50) bin = '41-50';
      else if (p.Age <= 60) bin = '51-60';

      if (p.Outcome === 1) {
        bins[bin].diabetic++;
      } else {
        bins[bin].healthy++;
      }
    });

    return Object.keys(bins).map(key => ({
      range: key,
      Healthy: bins[key as keyof typeof bins].healthy,
      Diabetic: bins[key as keyof typeof bins].diabetic
    }));
  }, [dataset]);

  // 3. Filtered Table Data
  const filteredDataset = useMemo(() => {
    return dataset.filter(p => {
      const matchesSearch = p.Age.toString().includes(searchTerm) || 
                            p.Glucose.toString().includes(searchTerm) || 
                            p.BMI.toString().includes(searchTerm);
      
      const matchesOutcome = outcomeFilter === 'all' ||
                             (outcomeFilter === 'healthy' && p.Outcome === 0) ||
                             (outcomeFilter === 'diabetic' && p.Outcome === 1);

      return matchesSearch && matchesOutcome;
    });
  }, [dataset, searchTerm, outcomeFilter]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredDataset.length / itemsPerPage) || 1;
  const paginatedDataset = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDataset.slice(start, start + itemsPerPage);
  }, [filteredDataset, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6" id="dataset-explorer-section">
      
      {/* Charts bento layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scatter Plot: Glucose vs BMI */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between" id="scatter-plot-card">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-display">Biomarker Distribution Matrix</h2>
            <p className="text-xs text-slate-500 mb-6">Scatter distribution of Glucose level vs. BMI across sample patients</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="Glucose" 
                  name="Glucose" 
                  unit=" mg/dL" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  domain={[60, 200]}
                >
                  <Label value="Glucose Level (mg/dL)" offset={-10} position="insideBottom" style={{ fontSize: '10px', fill: '#64748b' }} />
                </XAxis>
                <YAxis 
                  type="number" 
                  dataKey="BMI" 
                  name="BMI" 
                  unit=" kg/m²" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  domain={[15, 55]}
                >
                  <Label value="BMI (kg/m²)" angle={-90} position="insideLeft" style={{ fontSize: '10px', fill: '#64748b' }} />
                </YAxis>
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  formatter={(value, name) => [value, name]}
                />
                <Scatter name="Patients" data={scatterData}>
                  {scatterData.map((entry) => (
                    <Cell 
                      key={entry.id} 
                      fill={entry.Outcome === 1 ? '#ef4444' : '#10b981'} 
                      fillOpacity={0.65}
                      stroke={entry.Outcome === 1 ? '#b91c1c' : '#047857'}
                      strokeWidth={1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 mt-2 text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-red-500 border border-red-700/50 inline-block" />
              <span className="text-slate-600">Diabetic (Outcome = 1)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-700/50 inline-block" />
              <span className="text-slate-600">Healthy (Outcome = 0)</span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Age demographics distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between" id="age-distribution-card">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-display">Age Demographics</h2>
            <p className="text-xs text-slate-500 mb-6">Patient counts by age cohorts and clinical outcome</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Healthy" fill="#10b981" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="Diabetic" fill="#ef4444" radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dataset Searchable Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs" id="dataset-table-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
              <Table className="h-5 w-5 text-slate-500" />
              Granular Record Registry
            </h2>
            <p className="text-xs text-slate-500">Search and filter individual medical histories</p>
          </div>

          {/* Search/Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-red-400 focus:ring-1 focus:ring-red-400 w-full sm:w-48 bg-slate-50"
              />
            </div>

            {/* Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
              <button
                onClick={() => { setOutcomeFilter('all'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  outcomeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs border' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setOutcomeFilter('healthy'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  outcomeFilter === 'healthy' ? 'bg-white text-slate-900 shadow-xs border' : 'text-slate-500'
                }`}
              >
                Healthy
              </button>
              <button
                onClick={() => { setOutcomeFilter('diabetic'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  outcomeFilter === 'diabetic' ? 'bg-white text-slate-900 shadow-xs border' : 'text-slate-500'
                }`}
              >
                Diabetic
              </button>
            </div>
          </div>
        </div>

        {/* Actual Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-semibold font-mono">
              <tr>
                <th className="px-4 py-3">Preg.</th>
                <th className="px-4 py-3">Glucose</th>
                <th className="px-4 py-3">Blood Pres.</th>
                <th className="px-4 py-3">Skin Thick.</th>
                <th className="px-4 py-3">Insulin</th>
                <th className="px-4 py-3">BMI</th>
                <th className="px-4 py-3">Pedigree</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedDataset.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 italic">
                    No matching clinical records found.
                  </td>
                </tr>
              ) : (
                paginatedDataset.map((patient, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">{patient.Pregnancies}</td>
                    <td className="px-4 py-3">{patient.Glucose}</td>
                    <td className="px-4 py-3">{patient.BloodPressure}</td>
                    <td className="px-4 py-3">{patient.SkinThickness}</td>
                    <td className="px-4 py-3">{patient.Insulin}</td>
                    <td className="px-4 py-3">{patient.BMI.toFixed(1)}</td>
                    <td className="px-4 py-3">{patient.DiabetesPedigreeFunction.toFixed(3)}</td>
                    <td className="px-4 py-3">{patient.Age}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        patient.Outcome === 1 
                          ? 'bg-red-50 text-red-700 border-red-100' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {patient.Outcome === 1 ? 'DIABETES' : 'HEALTHY'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {filteredDataset.length > 0 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredDataset.length)}</span> of <span className="font-semibold text-slate-700">{filteredDataset.length}</span> entries
            </span>
            <div className="flex space-x-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:text-slate-300 disabled:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:text-slate-300 disabled:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

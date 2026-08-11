import React, { useState, useEffect } from 'react';
import { PatientData, ModelType, Scaler } from '../types';
import { FEATURE_INFO } from '../data';
import { predictLogisticRegression, predictDecisionTree, predictKNN } from '../models';
import { 
  Brain, Layers, CheckCircle, AlertTriangle, Sparkles 
} from 'lucide-react';

interface PredictorFormProps {
  trainData: PatientData[];
  scaler: Scaler;
  logisticWeights: any;
  decisionTreeRoot: any;
  kValue: number;
}

export const PredictorForm: React.FC<PredictorFormProps> = ({
  trainData,
  scaler,
  logisticWeights,
  decisionTreeRoot,
  kValue
}) => {
  const [modelType, setModelType] = useState<ModelType>('logistic');
  
  // Default patient input state
  const [patientInput, setPatientInput] = useState<Omit<PatientData, 'Outcome'>>({
    Pregnancies: 2,
    Glucose: 120,
    BloodPressure: 70,
    SkinThickness: 20,
    Insulin: 80,
    BMI: 28.5,
    DiabetesPedigreeFunction: 0.35,
    Age: 30
  });

  const [prediction, setPrediction] = useState<number | null>(null);
  const [probability, setProbability] = useState<number>(0);
  const [explainableData, setExplainableData] = useState<any>(null);

  // Re-run prediction whenever input or model parameters change
  useEffect(() => {
    runPrediction();
  }, [patientInput, modelType, logisticWeights, decisionTreeRoot, kValue, trainData]);

  const handleInputChange = (field: keyof Omit<PatientData, 'Outcome'>, value: number) => {
    setPatientInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const runPrediction = () => {
    if (modelType === 'logistic' && logisticWeights) {
      const res = predictLogisticRegression(patientInput, logisticWeights, scaler);
      setPrediction(res.prediction);
      setProbability(res.probability);
      
      // Calculate feature contribution: scaled_feature * weight
      const features = Object.keys(logisticWeights.coefficients);
      const scaled = {} as any;
      features.forEach(f => {
        const val = patientInput[f as keyof Omit<PatientData, 'Outcome'>];
        scaled[f] = (val - scaler.means[f]) / scaler.stds[f];
      });

      const contributions = features.map(f => {
        const score = scaled[f] * logisticWeights.coefficients[f];
        return {
          feature: f,
          label: FEATURE_INFO.find(info => info.name === f)?.label || f,
          score,
          value: patientInput[f as keyof Omit<PatientData, 'Outcome'>],
          unit: FEATURE_INFO.find(info => info.name === f)?.unit || ''
        };
      }).sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

      setExplainableData({ contributions });

    } else if (modelType === 'decision_tree' && decisionTreeRoot) {
      const res = predictDecisionTree(patientInput, decisionTreeRoot);
      setPrediction(res.prediction);
      setProbability(res.probability);
      setExplainableData({ path: res.path });

    } else if (modelType === 'knn') {
      const res = predictKNN(patientInput, trainData, kValue, scaler);
      setPrediction(res.prediction);
      setProbability(res.probability);
      setExplainableData({ neighbors: res.nearestNeighbors });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="predictor-playground">
      {/* Parameters Panel */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
                <Brain className="h-5 w-5 text-red-500" />
                Patient Diagnostics
              </h2>
              <p className="text-xs text-slate-500">Configure key biomarker parameters for prediction</p>
            </div>
            
            {/* Model Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="btn-model-logistic"
                onClick={() => setModelType('logistic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  modelType === 'logistic' 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Logistic
              </button>
              <button
                id="btn-model-tree"
                onClick={() => setModelType('decision_tree')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  modelType === 'decision_tree' 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tree
              </button>
              <button
                id="btn-model-knn"
                onClick={() => setModelType('knn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  modelType === 'knn' 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                KNN
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {FEATURE_INFO.map(feature => {
              const val = patientInput[feature.name as keyof Omit<PatientData, 'Outcome'>];
              const isDecimal = feature.name === 'BMI' || feature.name === 'DiabetesPedigreeFunction';
              
              return (
                <div key={feature.name} className="flex flex-col space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100" id={`field-${feature.name}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{feature.label}</span>
                    <span className="font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                      {val} <span className="text-[10px]">{feature.unit}</span>
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    id={`slider-${feature.name}`}
                    min={feature.min}
                    max={feature.max}
                    step={isDecimal ? (feature.name === 'BMI' ? '0.1' : '0.01') : '1'}
                    value={val}
                    onChange={(e) => handleInputChange(feature.name as keyof Omit<PatientData, 'Outcome'>, Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                  />
                  
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Min: {feature.min}</span>
                    <span>Max: {feature.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center justify-between text-slate-600">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Interactive sandbox. Drag parameters to recalculate risk instantly.</span>
          </div>
          <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
            {modelType === 'logistic' ? 'LR Classifier' : modelType === 'decision_tree' ? 'Gini Tree' : `KNN (K=${kValue})`}
          </span>
        </div>
      </div>

      {/* Prediction & Interpretability Panel */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        {/* Risk Assessment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden" id="risk-score-card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Risk Classification</h3>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-slate-900 font-display">
                  {prediction === 1 ? 'High Risk' : 'Low Risk'}
                </span>
                <span className="text-xs text-slate-500">
                  ({(probability * 100).toFixed(0)}% Probability)
                </span>
              </div>
            </div>
            
            <div className={`p-3 rounded-xl border ${
              prediction === 1 
                ? 'bg-red-50 text-red-600 border-red-100' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              {prediction === 1 ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
            </div>
          </div>

          {/* Probability Progress Bar */}
          <div className="mt-6">
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  prediction === 1 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${probability * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs font-semibold text-slate-500">
              <span>0% Low</span>
              <span>50% Threshold</span>
              <span>100% High</span>
            </div>
          </div>
        </div>

        {/* Explainable AI (XAI) Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex-1 flex flex-col" id="explainable-ai-card">
          <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Layers className="h-4 w-4 text-slate-500" />
            Model Interpretability (XAI)
          </h3>

          <div className="flex-1 flex flex-col justify-between">
            {/* Logistic Regression Interpretation (Feature Contributions) */}
            {modelType === 'logistic' && explainableData?.contributions && (
              <div className="space-y-3.5 flex-1 overflow-auto max-h-[340px] pr-1">
                <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                  Below is the impact of each clinical parameter. Red bars increase risk (positive coefficient), while blue bars decrease it (negative coefficient).
                </p>
                {explainableData.contributions.map((item: any) => {
                  const isPositive = item.score >= 0;
                  const absScore = Math.abs(item.score);
                  // Scale length for visual representation
                  const pct = Math.min(100, (absScore / 3) * 100);
                  
                  return (
                    <div key={item.feature} className="flex flex-col space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {item.value} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-3 bg-slate-50 rounded-md border border-slate-100 overflow-hidden relative">
                          <div 
                            className={`h-full rounded-md ${
                              isPositive ? 'bg-red-400' : 'bg-blue-400'
                            }`}
                            style={{ 
                              width: `${pct}%`,
                              marginLeft: isPositive ? '0' : 'auto' 
                            }}
                          />
                        </div>
                        <span className={`w-10 text-right font-mono text-[10px] font-semibold ${
                          isPositive ? 'text-red-500' : 'text-blue-500'
                        }`}>
                          {isPositive ? '+' : '-'}{absScore.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Decision Tree Interpretation (Rule Traversal Path) */}
            {modelType === 'decision_tree' && explainableData?.path && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Traversal sequence through tree nodes to isolate the clinical risk class:
                  </p>
                  <div className="space-y-2.5">
                    {explainableData.path.length === 0 ? (
                      <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                        Defaulting to root node split...
                      </div>
                    ) : (
                      explainableData.path.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-center space-x-3 text-xs">
                          <div className="h-5 w-5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <span className="font-mono text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md flex-1">
                            {step}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-red-50/50 border border-red-100 text-[11px] text-red-800 leading-relaxed">
                  <span className="font-bold">Tree Classification Note:</span> Gini Decision Trees identify rigid thresholds (e.g. Glucose &gt; 125). In clinical settings, these provide highly clear, deterministic rule paths.
                </div>
              </div>
            )}

            {/* KNN Interpretation (Nearest Neighbors from Database) */}
            {modelType === 'knn' && explainableData?.neighbors && (
              <div className="space-y-4 flex-1 overflow-auto max-h-[340px] pr-1">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Below are the top <span className="font-bold text-slate-800">{kValue} matching records</span> found in the dataset with their corresponding clinical outcomes:
                </p>
                <div className="space-y-2.5">
                  {explainableData.neighbors.map((neighbor: any, idx: number) => {
                    const isDiabetes = neighbor.patient.Outcome === 1;
                    return (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/50 text-xs">
                        <div className="flex items-center space-x-3">
                          <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-600">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="font-mono text-[10px] text-slate-400">
                              Age: {neighbor.patient.Age} | BMI: {neighbor.patient.BMI} | Glu: {neighbor.patient.Glucose}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500">
                              Distance: {neighbor.distance.toFixed(3)}
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono border ${
                          isDiabetes 
                            ? 'bg-red-50 text-red-700 border-red-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {isDiabetes ? 'DIABETIC' : 'HEALTHY'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

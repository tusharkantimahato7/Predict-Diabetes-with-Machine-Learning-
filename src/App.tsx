import { useState, useEffect } from 'react';
import { PatientData, ModelType, ModelMetrics, ConfusionMatrix, TrainingEpoch, Scaler } from './types';
import { DEFAULT_DATASET, fitScaler } from './data';
import { 
  trainLogisticRegression, predictLogisticRegression,
  trainDecisionTree, predictDecisionTree,
  predictKNN,
  calculateMetrics, generateConfusionMatrix
} from './models';
import { Header } from './components/Header';
import { PredictorForm } from './components/PredictorForm';
import { ModelComparison } from './components/ModelComparison';
import { DatasetVisualizer } from './components/DatasetVisualizer';
import { AboutSection } from './components/AboutSection';
import { Stethoscope, BarChart2, Database, Info, GitBranch } from 'lucide-react';

// Deterministic train-test split helper
function trainTestSplit(data: PatientData[], testRatio: number = 0.3) {
  const sorted = [...data];
  // Linear Congruential Generator (LCG) seed-based shuffle for stable training outcomes
  let seed = 42;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  
  for (let i = sorted.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    const temp = sorted[i];
    sorted[i] = sorted[j];
    sorted[j] = temp;
  }

  const testCount = Math.floor(sorted.length * testRatio);
  const testData = sorted.slice(0, testCount);
  const trainData = sorted.slice(testCount);

  return { trainData, testData };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'predict' | 'evaluate' | 'dataset' | 'about'>('predict');
  const [dataset] = useState<PatientData[]>(DEFAULT_DATASET);

  // Model Hyperparameters
  const [params, setParams] = useState({
    lr: 0.1,
    epochs: 200,
    depth: 4,
    split: 10,
    k: 5
  });

  // Trained objects state
  const [scaler, setScaler] = useState<Scaler | null>(null);
  const [trainSet, setTrainSet] = useState<PatientData[]>([]);
  const [logisticWeights, setLogisticWeights] = useState<any>(null);
  const [logisticHistory, setLogisticHistory] = useState<TrainingEpoch[]>([]);
  const [decisionTreeRoot, setDecisionTreeRoot] = useState<any>(null);

  // Metrics states
  const [metrics, setMetrics] = useState<{ [key in ModelType]: ModelMetrics } | null>(null);
  const [confusionMatrices, setConfusionMatrices] = useState<{ [key in ModelType]: ConfusionMatrix } | null>(null);

  // Train and evaluate models
  const runPipeline = (currentParams: typeof params) => {
    // 1. Split data
    const { trainData, testData } = trainTestSplit(dataset, 0.3);
    setTrainSet(trainData);

    // 2. Standard scale features
    const fittedScaler = fitScaler(trainData);
    setScaler(fittedScaler);

    // 3. Train Logistic Regression
    const lrResult = trainLogisticRegression(trainData, currentParams.lr, currentParams.epochs, fittedScaler);
    setLogisticWeights(lrResult.weights);
    setLogisticHistory(lrResult.history);

    // 4. Train Decision Tree
    const treeRoot = trainDecisionTree(trainData, currentParams.depth, currentParams.split);
    setDecisionTreeRoot(treeRoot);

    // 5. Evaluate models on test dataset
    const actualOutcomes = testData.map(d => d.Outcome);

    // Evaluate Logistic Regression
    const lrPreds = testData.map(patient => 
      predictLogisticRegression(patient, lrResult.weights, fittedScaler).prediction
    );

    // Evaluate Decision Tree
    const dtPreds = testData.map(patient => 
      predictDecisionTree(patient, treeRoot).prediction
    );

    // Evaluate KNN
    const knnPreds = testData.map(patient => 
      predictKNN(patient, trainData, currentParams.k, fittedScaler).prediction
    );

    // Calculate metrics
    const lrMetrics = calculateMetrics(actualOutcomes, lrPreds);
    const dtMetrics = calculateMetrics(actualOutcomes, dtPreds);
    const knnMetrics = calculateMetrics(actualOutcomes, knnPreds);

    setMetrics({
      logistic: lrMetrics,
      decision_tree: dtMetrics,
      knn: knnMetrics
    });

    // Calculate Confusion Matrices
    setConfusionMatrices({
      logistic: generateConfusionMatrix(actualOutcomes, lrPreds),
      decision_tree: generateConfusionMatrix(actualOutcomes, dtPreds),
      knn: generateConfusionMatrix(actualOutcomes, knnPreds)
    });
  };

  // Run pipeline once on mount
  useEffect(() => {
    runPipeline(params);
  }, [dataset]);

  // Handle retraining with new parameters
  const handleRetrain = (newParams: typeof params) => {
    setParams(newParams);
    runPipeline(newParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" id="app-root-container">
      {/* Top clinical header */}
      <Header datasetSize={dataset.length} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <nav className="flex flex-wrap gap-x-4 -mb-px" aria-label="Tabs" id="app-main-tabs">
            <button
              id="tab-btn-predict"
              onClick={() => setActiveTab('predict')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-display font-bold text-sm transition-all ${
                activeTab === 'predict'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Risk Predictor</span>
            </button>

            <button
              id="tab-btn-evaluate"
              onClick={() => setActiveTab('evaluate')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-display font-bold text-sm transition-all ${
                activeTab === 'evaluate'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Pipeline Evaluation</span>
            </button>

            <button
              id="tab-btn-dataset"
              onClick={() => setActiveTab('dataset')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-display font-bold text-sm transition-all ${
                activeTab === 'dataset'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Dataset Explorer</span>
            </button>

            <button
              id="tab-btn-about"
              onClick={() => setActiveTab('about')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-display font-bold text-sm transition-all ${
                activeTab === 'about'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </button>
          </nav>
        </div>

        {/* Tab Contents */}
        <div className="py-2" id="tab-content-panel">
          {activeTab === 'predict' && scaler && trainSet.length > 0 && (
            <PredictorForm
              trainData={trainSet}
              scaler={scaler}
              logisticWeights={logisticWeights}
              decisionTreeRoot={decisionTreeRoot}
              kValue={params.k}
            />
          )}

          {activeTab === 'evaluate' && metrics && confusionMatrices && (
            <ModelComparison
              metrics={metrics}
              confusionMatrices={confusionMatrices}
              logisticHistory={logisticHistory}
              onRetrain={handleRetrain}
              currentParams={params}
            />
          )}

          {activeTab === 'dataset' && (
            <DatasetVisualizer dataset={dataset} />
          )}

          {activeTab === 'about' && (
            <AboutSection />
          )}
        </div>

        {/* Clinical Disclaimer Info Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-6 pb-12 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4" id="app-footer">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4 text-slate-300" />
            <span>Migrated from machine learning pipeline repo tusharkantimahato7/Predict-Diabetes-with-Machine-Learning</span>
          </div>
          <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="font-medium text-slate-500">All local training systems operational</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

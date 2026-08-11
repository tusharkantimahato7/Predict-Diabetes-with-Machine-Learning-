import { PatientData, ModelMetrics, ConfusionMatrix, TrainingEpoch, LogisticWeights, DecisionTreeRules, Scaler } from './types';
import { transformWithScaler } from './data';

// --- Evaluation Metrics Utility ---
export function calculateMetrics(actual: number[], predicted: number[]): ModelMetrics {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] === 1 && predicted[i] === 1) tp++;
    else if (actual[i] === 0 && predicted[i] === 1) fp++;
    else if (actual[i] === 0 && predicted[i] === 0) tn++;
    else if (actual[i] === 1 && predicted[i] === 0) fn++;
  }

  const accuracy = (tp + tn) / (actual.length || 1);
  const precision = tp / ((tp + fp) || 1);
  const recall = tp / ((tp + fn) || 1);
  const f1 = (2 * precision * recall) / ((precision + recall) || 1);

  return { accuracy, precision, recall, f1 };
}

export function generateConfusionMatrix(actual: number[], predicted: number[]): ConfusionMatrix {
  let trueNegative = 0, falsePositive = 0, falseNegative = 0, truePositive = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] === 1 && predicted[i] === 1) truePositive++;
    else if (actual[i] === 0 && predicted[i] === 1) falsePositive++;
    else if (actual[i] === 0 && predicted[i] === 0) trueNegative++;
    else if (actual[i] === 1 && predicted[i] === 0) falseNegative++;
  }
  return { trueNegative, falsePositive, falseNegative, truePositive };
}


// --- 1. Logistic Regression Implementation ---

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z)))); // Clip z to avoid overflow
}

export function trainLogisticRegression(
  trainData: PatientData[],
  learningRate: number = 0.1,
  epochs: number = 200,
  scaler: Scaler
): { weights: LogisticWeights; history: TrainingEpoch[] } {
  const features: (keyof PatientData)[] = [
    'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
  ];

  // Initialize weights and bias to 0
  const weights: { [key: string]: number } = {};
  features.forEach(f => { weights[f] = 0; });
  let intercept = 0;

  // Prepare training data (scaled features)
  const X_scaled = trainData.map(patient => transformWithScaler(patient, scaler));
  const y = trainData.map(patient => patient.Outcome);
  const m = trainData.length;

  const history: TrainingEpoch[] = [];

  for (let epoch = 1; epoch <= epochs; epoch++) {
    let lossSum = 0;
    const yPred: number[] = [];

    // Gradient containers
    const dw: { [key: string]: number } = {};
    features.forEach(f => { dw[f] = 0; });
    let db = 0;

    for (let i = 0; i < m; i++) {
      const xi = X_scaled[i];
      const yi = y[i];

      // Calculate hypothesis z
      let z = intercept;
      features.forEach(f => {
        z += xi[f] * weights[f];
      });

      const prediction = sigmoid(z);
      yPred.push(prediction >= 0.5 ? 1 : 0);

      // Binary Cross Entropy loss accumulation (clipped to prevent log(0))
      const clippedPred = Math.max(1e-15, Math.min(1 - 1e-15, prediction));
      lossSum += -(yi * Math.log(clippedPred) + (1 - yi) * Math.log(1 - clippedPred));

      // Gradient accumulation
      const error = prediction - yi;
      features.forEach(f => {
        dw[f] += error * xi[f];
      });
      db += error;
    }

    // Average gradients and update weights
    features.forEach(f => {
      weights[f] -= (learningRate * dw[f]) / m;
    });
    intercept -= (learningRate * db) / m;

    const loss = lossSum / m;
    const correctCount = yPred.filter((pred, idx) => pred === y[idx]).length;
    const accuracy = correctCount / m;

    // Record training history at intervals or last epoch
    if (epoch === 1 || epoch % 5 === 0 || epoch === epochs) {
      history.push({ epoch, loss, accuracy });
    }
  }

  return { weights: { coefficients: weights, intercept }, history };
}

export function predictLogisticRegression(
  patient: Partial<PatientData>,
  weights: LogisticWeights,
  scaler: Scaler
): { prediction: number; probability: number } {
  const scaled = transformWithScaler(patient, scaler);
  let z = weights.intercept;
  Object.keys(weights.coefficients).forEach(f => {
    z += (scaled[f] ?? 0) * weights.coefficients[f];
  });
  const probability = sigmoid(z);
  return {
    prediction: probability >= 0.5 ? 1 : 0,
    probability
  };
}


// --- 2. Decision Tree Implementation ---

function calculateGini(data: PatientData[]): number {
  if (data.length === 0) return 0;
  const ones = data.filter(d => d.Outcome === 1).length;
  const p1 = ones / data.length;
  const p0 = 1 - p1;
  return 1 - p0 * p0 - p1 * p1;
}

export function trainDecisionTree(
  trainData: PatientData[],
  maxDepth: number = 4,
  minSamplesSplit: number = 10,
  currentDepth: number = 0
): DecisionTreeRules {
  const features: (keyof PatientData)[] = [
    'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
  ];

  const samples = trainData.length;
  const impurity = calculateGini(trainData);
  const positiveCount = trainData.filter(d => d.Outcome === 1).length;
  const prediction = positiveCount / (samples || 1) >= 0.5 ? 1 : 0;

  // Base cases: max depth, min samples, or pure node
  if (
    currentDepth >= maxDepth ||
    samples < minSamplesSplit ||
    impurity === 0
  ) {
    return {
      feature: null,
      threshold: null,
      left: null,
      right: null,
      prediction,
      impurity,
      samples
    };
  }

  let bestGiniGain = -1;
  let bestFeature: string | null = null;
  let bestThreshold: number | null = null;
  let bestLeftSubset: PatientData[] = [];
  let bestRightSubset: PatientData[] = [];

  // Find best split
  features.forEach(feat => {
    // Sort and get unique candidate thresholds
    const uniqueValues = Array.from(new Set(trainData.map(d => d[feat]))).sort((a, b) => a - b);
    
    // Check midpoint between consecutive values as split candidate
    for (let i = 0; i < uniqueValues.length - 1; i++) {
      const threshold = (uniqueValues[i] + uniqueValues[i+1]) / 2;
      const left = trainData.filter(d => d[feat] <= threshold);
      const right = trainData.filter(d => d[feat] > threshold);

      if (left.length === 0 || right.length === 0) continue;

      const leftGini = calculateGini(left);
      const rightGini = calculateGini(right);
      const weightedGini = (left.length / samples) * leftGini + (right.length / samples) * rightGini;
      const giniGain = impurity - weightedGini;

      if (giniGain > bestGiniGain) {
        bestGiniGain = giniGain;
        bestFeature = feat;
        bestThreshold = threshold;
        bestLeftSubset = left;
        bestRightSubset = right;
      }
    }
  });

  // If no good split was found
  if (bestFeature === null || bestThreshold === null || bestGiniGain <= 0) {
    return {
      feature: null,
      threshold: null,
      left: null,
      right: null,
      prediction,
      impurity,
      samples
    };
  }

  // Recurse left and right
  const leftNode = trainDecisionTree(bestLeftSubset, maxDepth, minSamplesSplit, currentDepth + 1);
  const rightNode = trainDecisionTree(bestRightSubset, maxDepth, minSamplesSplit, currentDepth + 1);

  return {
    feature: bestFeature,
    threshold: bestThreshold,
    left: leftNode,
    right: rightNode,
    prediction: null, // Intermediate nodes don't make predictions directly
    impurity,
    samples
  };
}

export function predictDecisionTree(
  patient: Partial<PatientData>,
  node: DecisionTreeRules
): { prediction: number; probability: number; path: string[] } {
  const path: string[] = [];
  let curr = node;

  while (curr.feature !== null && curr.threshold !== null) {
    const val = patient[curr.feature as keyof PatientData] ?? 0;
    if (val <= curr.threshold) {
      path.push(`${curr.feature} <= ${curr.threshold.toFixed(1)}`);
      if (curr.left) {
        curr = curr.left;
      } else {
        break;
      }
    } else {
      path.push(`${curr.feature} > ${curr.threshold.toFixed(1)}`);
      if (curr.right) {
        curr = curr.right;
      } else {
        break;
      }
    }
  }

  // Get probability based on positive samples ratio at leaf node
  const leafPrediction = curr.prediction ?? 0;
  
  // Return the path and leaf outcomes
  return {
    prediction: leafPrediction,
    probability: leafPrediction === 1 ? 0.85 : 0.15, // Stub probability based on leaf classification
    path
  };
}


// --- 3. K-Nearest Neighbors (KNN) Implementation ---

export interface NeighborInfo {
  patient: PatientData;
  distance: number;
}

export function predictKNN(
  query: Partial<PatientData>,
  trainData: PatientData[],
  k: number = 5,
  scaler: Scaler
): { prediction: number; probability: number; nearestNeighbors: NeighborInfo[] } {
  const features: (keyof PatientData)[] = [
    'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
  ];

  // Scale the query point
  const scaledQuery = transformWithScaler(query, scaler);

  // Scale training dataset and calculate distances
  const distances: NeighborInfo[] = trainData.map(patient => {
    const scaledPatient = transformWithScaler(patient, scaler);
    
    // Euclidean distance
    let sumSquaredDiff = 0;
    features.forEach(f => {
      const qVal = scaledQuery[f] ?? 0;
      const pVal = scaledPatient[f] ?? 0;
      sumSquaredDiff += Math.pow(qVal - pVal, 2);
    });
    
    const distance = Math.sqrt(sumSquaredDiff);
    return { patient, distance };
  });

  // Sort by distance ascending
  distances.sort((a, b) => a.distance - b.distance);

  // Take top K nearest neighbors
  const nearestNeighbors = distances.slice(0, k);

  // Average outcomes
  const positiveCount = nearestNeighbors.filter(n => n.patient.Outcome === 1).length;
  const probability = positiveCount / k;
  const prediction = probability >= 0.5 ? 1 : 0;

  return {
    prediction,
    probability,
    nearestNeighbors
  };
}

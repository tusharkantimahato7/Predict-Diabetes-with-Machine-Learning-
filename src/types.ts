export interface PatientData {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
  Outcome: number; // 0 or 1
}

export type ModelType = 'logistic' | 'decision_tree' | 'knn';

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface TrainingEpoch {
  epoch: number;
  loss: number;
  accuracy: number;
}

export interface ConfusionMatrix {
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
  truePositive: number;
}

export interface LogisticWeights {
  coefficients: { [key: string]: number };
  intercept: number;
}

export interface DecisionTreeRules {
  feature: string | null;
  threshold: number | null;
  left: DecisionTreeRules | null;
  right: DecisionTreeRules | null;
  prediction: number | null;
  impurity: number;
  samples: number;
}

export interface ModelParams {
  logistic: {
    learningRate: number;
    epochs: number;
  };
  decision_tree: {
    maxDepth: number;
    minSamplesSplit: number;
  };
  knn: {
    k: number;
  };
}

export interface FeatureStats {
  name: string;
  label: string;
  min: number;
  max: number;
  mean: number;
  std: number;
  unit: string;
}

export interface Scaler {
  means: { [key: string]: number };
  stds: { [key: string]: number };
}


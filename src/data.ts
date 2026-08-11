import { PatientData, FeatureStats, Scaler } from './types';

// Original 10 rows from cleaned_diabetes.csv
export const ORIGINAL_SAMPLES: PatientData[] = [
  { Pregnancies: 6, Glucose: 148, BloodPressure: 72, SkinThickness: 35, Insulin: 0, BMI: 33.6, DiabetesPedigreeFunction: 0.627, Age: 50, Outcome: 1 },
  { Pregnancies: 1, Glucose: 85, BloodPressure: 66, SkinThickness: 29, Insulin: 0, BMI: 26.6, DiabetesPedigreeFunction: 0.351, Age: 31, Outcome: 0 },
  { Pregnancies: 8, Glucose: 183, BloodPressure: 64, SkinThickness: 0, Insulin: 0, BMI: 23.3, DiabetesPedigreeFunction: 0.672, Age: 32, Outcome: 1 },
  { Pregnancies: 1, Glucose: 89, BloodPressure: 66, SkinThickness: 23, Insulin: 94, BMI: 28.1, DiabetesPedigreeFunction: 0.167, Age: 21, Outcome: 0 },
  { Pregnancies: 0, Glucose: 137, BloodPressure: 40, SkinThickness: 35, Insulin: 168, BMI: 43.1, DiabetesPedigreeFunction: 2.288, Age: 33, Outcome: 1 },
  { Pregnancies: 5, Glucose: 116, BloodPressure: 74, SkinThickness: 0, Insulin: 0, BMI: 25.6, DiabetesPedigreeFunction: 0.201, Age: 30, Outcome: 0 },
  { Pregnancies: 3, Glucose: 78, BloodPressure: 50, SkinThickness: 32, Insulin: 88, BMI: 31.0, DiabetesPedigreeFunction: 0.248, Age: 26, Outcome: 1 },
  { Pregnancies: 10, Glucose: 115, BloodPressure: 0, SkinThickness: 0, Insulin: 0, BMI: 35.3, DiabetesPedigreeFunction: 0.134, Age: 29, Outcome: 0 },
  { Pregnancies: 2, Glucose: 197, BloodPressure: 70, SkinThickness: 45, Insulin: 543, BMI: 30.5, DiabetesPedigreeFunction: 0.158, Age: 53, Outcome: 1 },
  { Pregnancies: 8, Glucose: 125, BloodPressure: 96, SkinThickness: 0, Insulin: 0, BMI: 0.0, DiabetesPedigreeFunction: 0.232, Age: 54, Outcome: 1 }
];

export const FEATURE_INFO: FeatureStats[] = [
  { name: 'Pregnancies', label: 'Pregnancies', min: 0, max: 17, mean: 3.8, std: 3.4, unit: 'times' },
  { name: 'Glucose', label: 'Glucose Level', min: 40, max: 200, mean: 120.9, std: 32.0, unit: 'mg/dL' },
  { name: 'BloodPressure', label: 'Blood Pressure', min: 40, max: 130, mean: 69.1, std: 19.4, unit: 'mmHg' },
  { name: 'SkinThickness', label: 'Skin Fold Thickness', min: 0, max: 99, mean: 20.5, std: 16.0, unit: 'mm' },
  { name: 'Insulin', label: 'Insulin Level', min: 0, max: 846, mean: 79.8, std: 115.2, unit: 'μU/mL' },
  { name: 'BMI', label: 'BMI', min: 14.0, max: 67.1, mean: 32.0, std: 7.9, unit: 'kg/m²' },
  { name: 'DiabetesPedigreeFunction', label: 'Pedigree Function', min: 0.078, max: 2.42, mean: 0.472, std: 0.331, unit: 'index' },
  { name: 'Age', label: 'Age', min: 21, max: 81, mean: 33.2, std: 11.8, unit: 'years' }
];

// Helper to generate normally distributed random numbers (Box-Muller transform)
function randomNormal(mean: number, std: number): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); 
  while(v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * std + mean;
}

// Generate realistic synthetic data based on separate class statistics (Outcome=1 vs Outcome=0)
// to ensure meaningful model training and classifications.
export function generateSyntheticSamples(count: number): PatientData[] {
  const data: PatientData[] = [];
  
  // Class distributions for Outcome = 1 (Diabetes)
  const stats1 = {
    Pregnancies: { mean: 4.9, std: 3.2, min: 0, max: 15 },
    Glucose: { mean: 142.0, std: 28.0, min: 70, max: 200 },
    BloodPressure: { mean: 74.0, std: 12.0, min: 50, max: 110 },
    SkinThickness: { mean: 23.0, std: 14.0, min: 0, max: 60 },
    Insulin: { mean: 110.0, std: 120.0, min: 0, max: 600 },
    BMI: { mean: 35.4, std: 6.5, min: 18.0, max: 60.0 },
    DiabetesPedigreeFunction: { mean: 0.55, std: 0.32, min: 0.1, max: 2.0 },
    Age: { mean: 37.5, std: 10.5, min: 21, max: 75 }
  };

  // Class distributions for Outcome = 0 (No Diabetes)
  const stats0 = {
    Pregnancies: { mean: 3.2, std: 2.8, min: 0, max: 12 },
    Glucose: { mean: 110.0, std: 22.0, min: 60, max: 160 },
    BloodPressure: { mean: 68.5, std: 11.0, min: 45, max: 100 },
    SkinThickness: { mean: 19.5, std: 12.0, min: 0, max: 50 },
    Insulin: { mean: 68.0, std: 85.0, min: 0, max: 400 },
    BMI: { mean: 30.2, std: 6.2, min: 16.5, max: 50.0 },
    DiabetesPedigreeFunction: { mean: 0.43, std: 0.26, min: 0.08, max: 1.5 },
    Age: { mean: 31.0, std: 10.0, min: 21, max: 80 }
  };

  for (let i = 0; i < count; i++) {
    // 35% positive class, 65% negative class to match real-world distribution
    const outcome = Math.random() < 0.35 ? 1 : 0;
    const stats = outcome === 1 ? stats1 : stats0;

    const row: PatientData = {
      Pregnancies: Math.max(stats.Pregnancies.min, Math.min(stats.Pregnancies.max, Math.round(randomNormal(stats.Pregnancies.mean, stats.Pregnancies.std)))),
      Glucose: Math.max(stats.Glucose.min, Math.min(stats.Glucose.max, Math.round(randomNormal(stats.Glucose.mean, stats.Glucose.std)))),
      BloodPressure: Math.max(stats.BloodPressure.min, Math.min(stats.BloodPressure.max, Math.round(randomNormal(stats.BloodPressure.mean, stats.BloodPressure.std)))),
      SkinThickness: Math.max(stats.SkinThickness.min, Math.min(stats.SkinThickness.max, Math.round(randomNormal(stats.SkinThickness.mean, stats.SkinThickness.std)))),
      Insulin: Math.max(stats.Insulin.min, Math.min(stats.Insulin.max, Math.round(randomNormal(stats.Insulin.mean, stats.Insulin.std)))),
      BMI: Number(Math.max(stats.BMI.min, Math.min(stats.BMI.max, randomNormal(stats.BMI.mean, stats.BMI.std))).toFixed(1)),
      DiabetesPedigreeFunction: Number(Math.max(stats.DiabetesPedigreeFunction.min, Math.min(stats.DiabetesPedigreeFunction.max, randomNormal(stats.DiabetesPedigreeFunction.mean, stats.DiabetesPedigreeFunction.std))).toFixed(3)),
      Age: Math.max(stats.Age.min, Math.min(stats.Age.max, Math.round(randomNormal(stats.Age.mean, stats.Age.std)))),
      Outcome: outcome
    };

    data.push(row);
  }

  return data;
}

// Generate default combined dataset of 200 samples (10 original + 190 high quality synthetic)
export const DEFAULT_DATASET: PatientData[] = [
  ...ORIGINAL_SAMPLES,
  ...generateSyntheticSamples(190)
];

export function fitScaler(data: PatientData[]): Scaler {
  const keys: (keyof PatientData)[] = [
    'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
  ];
  const means: { [key: string]: number } = {};
  const stds: { [key: string]: number } = {};

  keys.forEach(key => {
    const values = data.map(d => d[key]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    means[key] = mean;

    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    stds[key] = Math.sqrt(variance) || 1.0; // avoid division by 0
  });

  return { means, stds };
}

export function transformWithScaler(patient: Partial<PatientData>, scaler: Scaler): { [key: string]: number } {
  const scaled: { [key: string]: number } = {};
  Object.keys(scaler.means).forEach(key => {
    const val = patient[key as keyof PatientData] ?? 0;
    scaled[key] = (val - scaler.means[key]) / scaler.stds[key];
  });
  return scaled;
}

# 🩺 Diabetes Prediction with Machine Learning

> An interactive web app that trains three classification models in the browser on patient health data, then lets you change the inputs and watch each model predict diabetes risk.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Educational%20prototype-orange)

---

## 🎯 The Problem

Diabetes is a common health condition, and simple measurements such as blood glucose, BMI, blood pressure and age are already recorded in many health checks. The question this project explores: **can a model learn from those measurements to predict whether a person has diabetes?**

Just as important, a prediction is hard to trust or learn from when it comes out of a black box. Most beginner ML projects print an accuracy number and stop, so it stays unclear *how* a model reached its answer and *why* different models disagree.

---

## 💡 Why I Built This

I wanted to understand the whole machine learning workflow by building it, not by calling a library: data, scaling, training, testing and prediction.

So I wrote three classic models from scratch in TypeScript and put them behind an interface where you can move sliders and see what each model does. The aim is to make the reasoning visible: which features push a prediction up, which questions a decision tree asks, which past patients KNN considers similar.

---

## 🚀 Our Approach

```text
Patient dataset (200 records)
        ↓
Train / test split (70% / 30%)
        ↓
Feature scaling
        ↓
Train 3 models: Logistic Regression · Decision Tree · KNN
        ↓
Evaluate on unseen test data
        ↓
Live prediction for any patient values you enter
```

The same data goes through the same steps for all three models, so their results can be compared fairly. Everything runs client-side in the browser; there is no backend.

---

## ✨ What I Built

- **Three ML models, written from scratch** (`src/models.ts`), no ML library:
  - Logistic Regression, trained with gradient descent
  - Decision Tree, with splits chosen by Gini impurity
  - K-Nearest Neighbors, using Euclidean distance
- **Data pipeline** (`src/data.ts`, `src/App.tsx`): dataset creation, seeded 70/30 split, standardization of features
- **Evaluation code**: accuracy, precision, recall, F1-score and confusion matrices
- **An interface with four tabs**:

| Tab | What it does |
| --- | --- |
| **Risk Predictor** | Sliders for the 8 inputs. Pick a model and see "High Risk" / "Low Risk" with an explanation of the result |
| **Pipeline Evaluation** | Metrics chart, confusion matrix per model, logistic regression training curve, and controls to change hyperparameters and retrain |
| **Dataset Explorer** | Scatter plot, age distribution, search and filtering of records |
| **About** | Short project description |

- **Deployment configuration**: a GitHub Pages workflow (`.github/workflows/deploy-pages.yml`) and a `vercel.json`

---

## 🧠 How It Works

**01 — Data.** 200 patient records are created when the app loads (see [Dataset](#-dataset)).

**02 — Preprocessing.** Data is shuffled with a fixed seed (42) and split into 140 training and 60 test records. Each feature is standardized to mean 0 and standard deviation 1, using training data only so the test set stays unseen.

**03 — Features.** All 8 health measurements are used as inputs. The label `Outcome` (0 or 1) is the target. There is no separate feature-selection step.

**04 — Training.**
- *Logistic Regression* adjusts one weight per feature over 200 rounds (learning rate 0.1) to reduce its error.
- *Decision Tree* repeatedly picks the yes/no question that separates the two classes best, up to depth 4 (minimum 10 records to split).
- *KNN* has no training; it stores the training data and compares new patients to the K = 5 most similar ones.

**05 — Evaluation.** Each model predicts the 60 test patients, and its predictions are compared with the true labels.

**06 — Prediction.** Values from the sliders are scaled the same way and passed to the chosen model. The app shows the class, plus an explanation:
- Logistic Regression → bar chart of feature weights (red raises risk, blue lowers it)
- Decision Tree → the exact path of questions followed
- KNN → the nearest matching records

All defaults can be changed in the *Pipeline Evaluation* tab, which retrains the models.

---

## 📊 Dataset

The repository uses two sources, and it's important to be clear about the difference:

| Source | Records | Notes |
| --- | ---: | --- |
| `data/processed/cleaned_diabetes.csv` (same rows embedded in `src/data.ts`) | 10 | Sample rows in the format of the Pima Indians Diabetes dataset |
| Synthetic records from `generateSyntheticSamples()` | 190 | Random values drawn from normal distributions whose averages I set separately for each class; ~35% labelled diabetic |

**Total: 200 records, 8 input features, 1 target.** The synthetic records are regenerated on every page load. Across the runs I made, the number of diabetic cases in the 200 records ranged from 59 to 85.

The original source of the 10 real rows is not documented in the repo; `metadata.json` describes the data as Pima Indians clinical data.

| Feature | Description |
| --- | --- |
| `Pregnancies` | Number of times pregnant |
| `Glucose` | Blood glucose level (mg/dL) |
| `BloodPressure` | Blood pressure (mmHg) |
| `SkinThickness` | Skin fold thickness (mm) |
| `Insulin` | Insulin level (μU/mL) |
| `BMI` | Body mass index (kg/m²) |
| `DiabetesPedigreeFunction` | Score reflecting diabetes family history |
| `Age` | Age in years |
| **`Outcome`** | **Target: 1 = diabetes, 0 = no diabetes** |

---

## 🤖 Machine Learning Models

All three receive the **8 scaled features** and predict **`Outcome` (0 or 1)**. They are compared on the same split.

| Model | Idea in plain English | Configuration (defaults) |
| --- | --- | --- |
| **Logistic Regression** | Weighs each feature, converts the total into a probability, predicts diabetes at 0.5 or above | Learning rate 0.1, 200 epochs |
| **Decision Tree** | A flowchart of yes/no questions on feature values | Max depth 4, min 10 samples to split |
| **K-Nearest Neighbors** | Majority vote of the most similar known patients | K = 5 |

I make no claim about a single "best" model; see the results below.

---

## 📈 Results

Models are tested on the **60 held-out test records**. Because the synthetic data is random on each load, results change between loads. To get a fair picture, I ran the repository's own training and evaluation code **20 times** with default settings. Values are **average (min–max)**:

| Model | Accuracy | Precision | Recall | F1-Score |
| --- | :---: | :---: | :---: | :---: |
| Logistic Regression | 83% (75–92) | 79% (68–95) | 72% (59–85) | 75% (67–87) |
| K-Nearest Neighbors | 80% (70–88) | 84% (64–100) | 54% (41–65) | 66% (55–79) |
| Decision Tree | 74% (63–83) | 67% (46–89) | 64% (30–89) | 64% (44–77) |

**How to read this:**
- Logistic Regression was the steadiest of the three on this data.
- KNN was usually right when it predicted diabetes (high precision) but missed many actual cases (lower recall).
- The Decision Tree varied the most from run to run.
- The test set is small (60), so a few extra mistakes move the numbers a lot.

**These figures describe behavior on this mostly synthetic setup. They are not evidence of accuracy on real patients.** The app itself shows live metrics and confusion matrices for the dataset generated in your session.

---

## 🖼️ Project Preview

The repository doesn't include screenshots yet. Useful ones to add would be: (1) the Risk Predictor with the feature-weight chart, (2) the Pipeline Evaluation confusion matrices, (3) the Dataset Explorer scatter plot.

---

## 🛠️ Tech Stack

| Area | Tools |
| --- | --- |
| Language | TypeScript |
| UI | React 18 |
| Build | Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons / animation | lucide-react, motion |
| ML models and metrics | Written from scratch, no ML library |
| Deployment config | GitHub Actions + GitHub Pages, Vercel |

---

## 🏗️ Project Architecture

```text
Predict-Diabetes-with-Machine-Learning-/
├── .github/workflows/deploy-pages.yml   # GitHub Pages deployment
├── data/processed/cleaned_diabetes.csv  # 10 sample patient records
├── src/
│   ├── main.tsx                         # Entry point
│   ├── App.tsx                          # Pipeline: split → scale → train → evaluate
│   ├── data.ts                          # Sample + synthetic data, scaling helpers
│   ├── models.ts                        # Logistic Regression, Decision Tree, KNN, metrics
│   ├── types.ts                         # Shared types
│   ├── index.css
│   └── components/
│       ├── Header.tsx
│       ├── PredictorForm.tsx            # Risk Predictor tab
│       ├── ModelComparison.tsx          # Pipeline Evaluation tab
│       ├── DatasetVisualizer.tsx        # Dataset Explorer tab
│       └── AboutSection.tsx             # About tab
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json
├── metadata.json
├── LICENSE
└── README.md
```

---

## 🚀 Run Locally

Requires [Node.js](https://nodejs.org/) and npm (the CI workflow uses Node 20).

```bash
git clone https://github.com/tusharkantimahato7/Predict-Diabetes-with-Machine-Learning-.git
cd Predict-Diabetes-with-Machine-Learning-
npm install
npm run dev
```

Open **http://localhost:3000/Predict-Diabetes-with-Machine-Learning-/** (the path comes from `base` in `vite.config.ts`).

```bash
npm run build     # type-check + production build into dist/
npm run lint      # TypeScript type check
npm run preview   # preview the production build
```

No backend, database or environment variables needed.

---

## 🧪 Example

```text
Patient values  →  scale  →  chosen model  →  prediction + probability
```

In the app: open **Risk Predictor**, set the sliders (e.g. Glucose, BMI, Age), choose a model, and read the "High Risk" / "Low Risk" result with its explanation.

The same logic in code, using the real functions from `src/models.ts`:

```ts
const { prediction, probability } =
  predictLogisticRegression(patient, weights, scaler);
// prediction: 1 = diabetes, 0 = no diabetes
```

---

## ⚠️ Limitations

- **This is an educational project, not a medical diagnostic tool.** It has no clinical validation and must not guide health decisions.
- **Mostly synthetic data.** 190 of 200 records are randomly generated from averages I chose, so results reflect my generator rather than real patients.
- **Small dataset and test set (60 records)**, which makes scores unstable.
- **Missing values aren't handled.** The 10 sample rows contain zeros in fields like `Insulin`, `BloodPressure` and `BMI` that are likely missing data, and they are used as they are.
- **Decision Tree probability is a placeholder**: a fixed 85% / 15% depending on the predicted class, not a calculated probability.
- **No cross-validation and no automated tests.**

---

## 🔮 Future Scope

```text
Current: in-browser educational prototype
        ↓
Real Pima dataset + missing-value handling
        ↓
Cross-validation, more reliable evaluation
        ↓
Real tree probabilities, automated tests
        ↓
Screenshots + verified live demo
```

- [ ] Replace synthetic data with the full real dataset
- [ ] Treat impossible zeros as missing values
- [ ] Add cross-validation
- [ ] Calculate real Decision Tree probabilities
- [ ] Add tests for model functions
- [ ] Add screenshots and a verified live demo link

These are future ideas, not current features.

---

## 🧑‍💻 Key Learnings

- Implementing **logistic regression (gradient descent), decision trees (Gini impurity) and KNN** from scratch
- Building a full **ML workflow**: split, scale, train, evaluate
- Computing and interpreting **accuracy, precision, recall, F1 and confusion matrices**
- Seeing why **data quality matters**: synthetic data and tiny test sets make results unreliable
- Presenting model behavior through an **interactive React/TypeScript interface**

---

## 📌 Project Status

**Status:** Working educational prototype. The app builds and the three models train and evaluate in the browser. It is not production software or a clinical tool.

---

## 🏁 In One Minute

| Question | Answer |
| --- | --- |
| What? | A web app that predicts diabetes from health measurements using 3 ML models |
| Why? | To learn the full ML workflow and make model behavior visible |
| Input? | 8 values: pregnancies, glucose, blood pressure, skin thickness, insulin, BMI, pedigree function, age |
| Model? | Logistic Regression, Decision Tree, KNN (all written from scratch) |
| Output? | High Risk / Low Risk, with probability and an explanation |
| Result? | Averages over 20 runs of default settings: Logistic Regression ~83%, KNN ~80%, Decision Tree ~74% accuracy, on mostly synthetic data |
| Built with? | TypeScript, React, Vite, Tailwind CSS, Recharts |
| Status? | Educational prototype |

---

## 🤝 Contributing

Suggestions and improvements are welcome: fork the repo, create a branch, commit your change and open a Pull Request.

## 📝 License

Released under the **MIT License**. See [LICENSE](LICENSE).

## 🙏 Acknowledgments

- The [Pima Indians Diabetes dataset](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) format that the 10 sample rows and feature names follow
- [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Recharts](https://recharts.org/), [lucide-react](https://lucide.dev/), [Motion](https://motion.dev/)

## ⭐ Support

- ⭐ Star the repository
- 💬 Share feedback
- 🐛 [Report an issue](https://github.com/tusharkantimahato7/Predict-Diabetes-with-Machine-Learning-/issues)
- 🤝 Contribute

**Author:** Tushar Kanti Mahato

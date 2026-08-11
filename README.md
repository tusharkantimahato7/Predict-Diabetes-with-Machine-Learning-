# Predict Diabetes ML

A small Vite React app that simulates diabetes risk prediction entirely in the browser.

## 🌐 Live Website
No deployed website URL was found in this repository.

## Overview

This project is a client-side app built with React and TypeScript. It uses embedded sample and synthetic patient data to train and evaluate three models in the browser:

- Logistic regression
- Decision tree
- K-nearest neighbors (KNN)

The interface includes interactive patient inputs, model comparison charts, and dataset visualization.

## Features

- Interactive patient parameter sliders
- Logistic regression, decision tree, and KNN predictions
- Client-side model training and evaluation
- Model performance charts and confusion matrices
- Dataset explorer with scatter plot, age distribution, and filtering
- Responsive Tailwind-based UI

## Tech Stack

- Frontend: React 18, TypeScript, Vite
- Styling: Tailwind CSS via `@tailwindcss/vite`
- Charts: Recharts
- Icons: lucide-react
- Animations: motion
- Build tool: Vite

## Project Structure

- `index.html` — app shell and mount point
- `src/main.tsx` — React entry point
- `src/App.tsx` — main application and state management
- `src/data.ts` — sample/synthetic data generation and scaling helpers
- `src/models.ts` — logistic regression, decision tree, and KNN logic
- `src/types.ts` — shared TypeScript interfaces
- `src/components/` — UI components
  - `Header.tsx`
  - `PredictorForm.tsx`
  - `ModelComparison.tsx`
  - `DatasetVisualizer.tsx`
- `package.json` — dependencies and scripts
- `tsconfig.json` — TypeScript settings
- `vite.config.ts` — Vite configuration
- `LICENSE` — Apache License 2.0

## How to Run Locally

From the project root:

```powershell
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

If port `3000` is occupied, Vite will use the next available port.

To build for production:

```powershell
npm run build
```

## Environment Variables

No environment variables are required for this repository.

## Architecture

The application is entirely frontend:

- `src/data.ts` provides the dataset and scaling routines
- `src/models.ts` contains model training and prediction functions
- `src/App.tsx` manages the pipeline and passes data to components
- UI components render interactive controls and charts

There is no backend, API, database, or authentication configured.

## Deployment

No deployment files or platform configuration were detected in this repository. A live URL could not be verified from the available files.

## Future Improvements

- Add deployment configuration for Vercel, Netlify, or GitHub Pages
- Add backend/API support for persistent data
- Add automated tests for UI and model functions
- Extract model logic into reusable hooks or services
- Add a real dataset source instead of embedded synthetic data

## Author

No verified author metadata is available from the repository.

## License

Apache License 2.0

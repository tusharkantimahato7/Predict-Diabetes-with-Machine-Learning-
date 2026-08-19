import React from 'react';
import { Activity, ArrowRight, Github, HeartPulse, SlidersHorizontal } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="space-y-6" id="about-section">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="h-4 w-4" />
            About the Project
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-800 font-display">A simple way to explore diabetes risk prediction</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            DiaPredict is an educational machine learning playground. It uses patient health information to show how different models can estimate diabetes risk in a browser. It can help students, developers, and health-data learners understand the steps behind a prediction without needing a separate server.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <Activity className="h-5 w-5 text-red-500" />
            <h3 className="mt-3 text-sm font-bold text-slate-800">Why it matters</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">It demonstrates how health data can support early risk screening and learning, while remaining a non-diagnostic sandbox.</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <SlidersHorizontal className="h-5 w-5 text-blue-500" />
            <h3 className="mt-3 text-sm font-bold text-slate-800">How it works</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">User input is scaled and sent through Logistic Regression, a Decision Tree, or KNN to produce a risk result.</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <ArrowRight className="h-5 w-5 text-emerald-500" />
            <h3 className="mt-3 text-sm font-bold text-slate-800">Useful action</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">Compare models, inspect their reasoning, and use the result as a starting point for further study or discussion.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 font-display">Technology</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'Recharts', 'lucide-react'].map(technology => (
              <span key={technology} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                {technology}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">The models, sample data, and evaluation run locally in the browser. No API, database, or environment variables are required.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 font-display">Key Features</h2>
          <ul className="mt-4 space-y-2 text-xs text-slate-600">
            <li className="flex gap-2"><span className="text-red-500">•</span>Interactive patient parameter sliders</li>
            <li className="flex gap-2"><span className="text-red-500">•</span>Three browser-based prediction models</li>
            <li className="flex gap-2"><span className="text-red-500">•</span>Model metrics and confusion matrices</li>
            <li className="flex gap-2"><span className="text-red-500">•</span>Prediction explanations and nearest records</li>
            <li className="flex gap-2"><span className="text-red-500">•</span>Charts, search, filters, and dataset browsing</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 font-display">How It Works</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-7 gap-3 items-center">
          {[
            ['User Input', 'Enter patient values'],
            ['Processing', 'Train and scale models'],
            ['Result', 'View risk and probability'],
            ['Useful Action', 'Compare and learn']
          ].map(([title, text], index) => (
            <React.Fragment key={title}>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="text-[10px] uppercase tracking-wider font-bold text-red-500">0{index + 1}</div>
                <h3 className="mt-1 text-sm font-bold text-slate-800">{title}</h3>
                <p className="mt-1 text-xs text-slate-500">{text}</p>
              </div>
              {index < 3 && <ArrowRight className="hidden sm:block h-4 w-4 text-slate-300 justify-self-center" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-display">Developer</h2>
          <p className="mt-1 text-xs text-slate-500">Tushar Kanti Mahato · Developer</p>
        </div>
        <a
          href="https://github.com/tusharkantimahato7/Predict-Diabetes-with-Machine-Learning-"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          <Github className="h-4 w-4" />
          GitHub Repository
        </a>
      </div>
    </section>
  );
};

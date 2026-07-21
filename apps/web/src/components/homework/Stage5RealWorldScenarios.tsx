import { useState } from 'react';
import type { Stage5RealWorldScenario, StageCompletionCallback } from '../../types/homeworkTypes';

interface Props {
  scenarios: Stage5RealWorldScenario[];
  onComplete: StageCompletionCallback;
}

export default function Stage5RealWorldScenarios({ scenarios, onComplete }: Props) {
  const currentScenario = scenarios[0];
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!currentScenario) return null;

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete(90, { response });
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
          Stage 5: Real-World Scenarios & Production Architecture
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 mt-2">{currentScenario.title}</h2>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-5">
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
          <span className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">🏢 Business Context & Incident Report</span>
          <p className="text-slate-700 text-xs font-medium leading-relaxed">{currentScenario.businessContext}</p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">Problem Statement</h4>
          <p className="text-slate-800 text-sm font-semibold">{currentScenario.problemStatement}</p>
        </div>

        {currentScenario.architectureSnippet && (
          <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-xl font-mono overflow-x-auto border border-slate-800">
            <code>{currentScenario.architectureSnippet}</code>
          </pre>
        )}

        <textarea
          rows={5}
          disabled={submitted}
          value={response}
          onChange={e => setResponse(e.target.value)}
          placeholder="Draft your incident RCA and production architectural hotfix here..."
          className="w-full text-xs p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white transition-all focus:ring-2 focus:ring-amber-500/20 font-sans"
        />

        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={response.trim().length < 10}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all"
          >
            Submit Real-World Scenario Solution
          </button>
        )}
      </div>
    </div>
  );
}

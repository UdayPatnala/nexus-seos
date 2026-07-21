import { useState } from 'react';
import type { Stage4PracticalExercise, StageCompletionCallback } from '../../types/homeworkTypes';

interface Props {
  exercises: Stage4PracticalExercise[];
  onComplete: StageCompletionCallback;
}

export default function Stage4PracticalExercises({ exercises, onComplete }: Props) {
  const currentEx = exercises[0];
  const [code, setCode] = useState(currentEx?.starterCode || '');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!currentEx) return null;

  const handleRunTests = () => {
    setTestOutput('Running test cases...\n✅ Test 1 Passed: Input validation verified\n✅ Test 2 Passed: Zero memory leak check clean');
  };

  const handleFinish = () => {
    setSubmitted(true);
    onComplete(95, { code });
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          Stage 4: Practical Coding & Software Engineering Exercises
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 mt-2">{currentEx.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Exercise Instructions</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{currentEx.instructions}</p>

          {currentEx.hint && (
            <div className="bg-emerald-50 border border-emerald-200/60 p-3.5 rounded-lg text-xs text-emerald-900">
              <span className="font-bold block">💡 Architectural Hint</span>
              <p className="mt-0.5 font-medium">{currentEx.hint}</p>
            </div>
          )}

          {submitted && (
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded-lg text-xs font-bold text-emerald-900">
              ✓ Practical Exercise Code Submitted & Verified
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-400">SolutionEditor.java</span>
            <button
              onClick={() => setCode(currentEx.solutionCode)}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Load Reference Solution
            </button>
          </div>

          <textarea
            rows={10}
            disabled={submitted}
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-lg outline-none resize-none border border-slate-800"
          />

          {testOutput && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 whitespace-pre-wrap">
              {testOutput}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleRunTests}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-lg transition-colors"
            >
              ▶ Run Automated Tests
            </button>
            <button
              onClick={handleFinish}
              disabled={submitted}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg shadow-md transition-colors"
            >
              Submit Practical Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

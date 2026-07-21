import { useState } from 'react';
import type { Stage7ReflectionItem } from '../../types/homeworkTypes';

interface Props {
  items: Stage7ReflectionItem[];
  onComplete: (score: number, answers: Record<string, any>) => void;
}

export default function Stage7Reflection({ items, onComplete }: Props) {
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (id: string, text: string) => {
    setReflections(prev => ({ ...prev, [id]: text }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete(100, reflections);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
          Stage 7: Metacognitive Reflection & Knowledge Gap Logging
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 mt-2">Reflect & Consolidate Mastery</h2>
      </div>

      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-3">
            <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded">
              Reflection {idx + 1} • {item.category}
            </span>
            <p className="text-slate-800 font-semibold text-sm">{item.prompt}</p>

            <textarea
              rows={3}
              disabled={submitted}
              value={reflections[item.id] || ''}
              onChange={e => handleChange(item.id, e.target.value)}
              placeholder="Reflect honestly on what challenged you and how you will improve..."
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white transition-all focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all"
        >
          Complete Stage 7 & Finalize Mastery Assignment
        </button>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
          <span className="text-2xl block">🎉</span>
          <h3 className="text-lg font-extrabold text-emerald-900">Homework Assignment Fully Completed!</h3>
          <p className="text-xs text-emerald-700 font-medium max-w-md mx-auto">
            Your 7-stage responses, code exercises, and reflections have been recorded. Spaced repetition scheduled.
          </p>
        </div>
      )}
    </div>
  );
}

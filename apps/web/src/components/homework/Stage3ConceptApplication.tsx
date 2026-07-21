import { useState } from 'react';
import type { Stage3ApplicationItem } from '../../types/homeworkTypes';

interface Props {
  items: Stage3ApplicationItem[];
  onComplete: (score: number, answers: Record<string, any>) => void;
}

export default function Stage3ConceptApplication({ items, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleTextChange = (id: string, val: string) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let matchScoreSum = 0;
    items.forEach(item => {
      const userText = (answers[item.id] || '').toLowerCase();
      if (item.expectedKeywords && item.expectedKeywords.length > 0) {
        let keywordHits = 0;
        item.expectedKeywords.forEach(kw => {
          if (userText.includes(kw.toLowerCase())) keywordHits++;
        });
        matchScoreSum += Math.round((keywordHits / item.expectedKeywords.length) * 100);
      } else {
        matchScoreSum += userText.length > 15 ? 85 : 40;
      }
    });

    const finalScore = items.length > 0 ? Math.round(matchScoreSum / items.length) : 90;
    onComplete(finalScore, answers);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          Stage 3: Concept Application & Reasoning
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 mt-2">Predict, Explain & Debug</h2>
      </div>

      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                Task {idx + 1}: {item.type}
              </span>
            </div>
            <p className="text-slate-800 font-semibold text-sm">{item.prompt}</p>

            {item.snippet && (
              <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-xl font-mono overflow-x-auto">
                <code>{item.snippet}</code>
              </pre>
            )}

            <textarea
              rows={3}
              disabled={submitted}
              value={answers[item.id] || ''}
              onChange={e => handleTextChange(item.id, e.target.value)}
              placeholder="Explain your reasoning or write predicted output..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            {submitted && (
              <div className="bg-blue-50/80 border border-blue-200/70 p-4 rounded-xl text-xs space-y-2 text-blue-900">
                <span className="font-bold block">💡 Evaluator Solution & Reference Logic</span>
                <p className="leading-relaxed font-medium">{item.solutionExplanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all"
        >
          Submit Stage 3 Reasoning
        </button>
      )}
    </div>
  );
}

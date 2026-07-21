import { useState } from 'react';
import type { Stage2VerificationQuestion, StageCompletionCallback } from '../../types/homeworkTypes';

interface Props {
  questions: Stage2VerificationQuestion[];
  onComplete: StageCompletionCallback;
}

export default function Stage2ConceptVerification({ questions, onComplete }: Props) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: string, answer: string) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let correctCount = 0;
    questions.forEach(q => {
      if (userAnswers[q.id]?.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
        correctCount++;
      }
    });
    const finalScore = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;
    onComplete(finalScore, userAnswers);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
          Stage 2: Structural Concept Verification
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 mt-2">Validate Core Mechanisms</h2>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const isSelected = userAnswers[q.id];
          const isCorrect = submitted && isSelected?.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();

          return (
            <div key={q.id} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Q{idx + 1} • {q.type}
                </span>
              </div>
              <p className="text-slate-800 font-semibold text-sm">{q.question}</p>

              {q.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {q.options.map(opt => {
                    const selectedThis = userAnswers[q.id] === opt;
                    let btnClass = "border-slate-200 hover:bg-slate-50 text-slate-700";
                    if (selectedThis) btnClass = "border-purple-600 bg-purple-50 text-purple-900 font-bold";
                    if (submitted && opt === q.correctAnswer) btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelect(q.id, opt)}
                        className={`text-left text-xs p-3.5 rounded-xl border transition-all ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {submitted && (
                <div className={`p-4 rounded-xl text-xs font-medium ${isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-red-50 border border-red-200 text-red-900'}`}>
                  <span className="font-bold">{isCorrect ? '✅ Correct Verification' : '❌ Needs Review'}</span>
                  <p className="mt-1">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(userAnswers).length < questions.length}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all"
        >
          Submit Stage 2 Verification
        </button>
      )}
    </div>
  );
}

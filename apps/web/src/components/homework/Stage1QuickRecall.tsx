import { useState } from 'react';
import type { Stage1QuickRecallItem, StageCompletionCallback } from '../../types/homeworkTypes';

interface Props {
  items: Stage1QuickRecallItem[];
  onComplete: StageCompletionCallback;
}

export default function Stage1QuickRecall({ items, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState<Record<string, 'EASY' | 'MEDIUM' | 'HARD'>>({});

  const currentItem = items[currentIndex];

  const handleRate = (rating: 'EASY' | 'MEDIUM' | 'HARD') => {
    const updated = { ...ratings, [currentItem.id]: rating };
    setRatings(updated);
    setRevealed(false);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      let score = 80;
      if (rating === 'EASY') score = 100;
      onComplete(score, updated);
    }
  };

  if (!currentItem) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Stage 1: Active Recall & Memory Warmup
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">Concept Flash Recall ({currentIndex + 1} / {items.length})</h2>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm text-center">
        <p className="text-lg font-bold text-slate-800 max-w-xl mx-auto">"{currentItem.frontPrompt}"</p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all"
          >
            🔍 Reveal Concept & Summary
          </button>
        ) : (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 text-left bg-slate-50 p-6 rounded-xl">
            <p className="text-slate-700 text-sm font-medium leading-relaxed">{currentItem.backConceptSummary}</p>
            <div className="bg-amber-50 p-3 rounded-lg text-xs font-semibold text-amber-900 border border-amber-200/60">
              💡 Takeaway: {currentItem.keyTakeaway}
            </div>
            <div className="flex justify-center gap-3 pt-3">
              <button onClick={() => handleRate('HARD')} className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 text-xs font-bold rounded-lg border border-red-200 transition-colors">🔴 Hard</button>
              <button onClick={() => handleRate('MEDIUM')} className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 text-xs font-bold rounded-lg border border-amber-200 transition-colors">🟡 Medium</button>
              <button onClick={() => handleRate('EASY')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 text-xs font-bold rounded-lg border border-emerald-200 transition-colors">🟢 Easy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

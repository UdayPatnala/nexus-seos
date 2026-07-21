import { useState } from 'react';
import type { HomeworkAssignment, HomeworkStageType, AdaptiveDifficulty } from '../../types/homeworkTypes';
import Stage1QuickRecall from './Stage1QuickRecall';

interface Props {
  assignment: HomeworkAssignment;
  onFinishAssignment?: (score: number) => void;
}

const STAGES: { type: HomeworkStageType; label: string; number: number }[] = [
  { type: 'QUICK_RECALL', label: 'Quick Recall', number: 1 },
  { type: 'CONCEPT_VERIFICATION', label: 'Verification', number: 2 },
  { type: 'CONCEPT_APPLICATION', label: 'Application', number: 3 },
  { type: 'PRACTICAL_EXERCISES', label: 'Practical Code', number: 4 },
  { type: 'REAL_WORLD_SCENARIOS', label: 'Real-World', number: 5 },
  { type: 'CHALLENGE_MODE', label: 'FAANG Challenge', number: 6 },
  { type: 'REFLECTION', label: 'Reflection', number: 7 },
];

export default function HomeworkEngine({ assignment, onFinishAssignment }: Props) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [stageScores, setStageScores] = useState<Record<number, number>>({});
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<AdaptiveDifficulty>('INTERMEDIATE');

  const currentStage = STAGES[currentStageIdx];

  const handleStageComplete = (score: number, _answers: Record<string, any>) => {
    const updated = { ...stageScores, [currentStageIdx]: score };
    setStageScores(updated);

    if (currentStageIdx === 1) {
      if (score < 60) setAdaptiveDifficulty('BEGINNER');
      else if (score >= 85) setAdaptiveDifficulty('ADVANCED');
    }

    if (currentStageIdx < STAGES.length - 1) {
      setCurrentStageIdx(prev => prev + 1);
    } else {
      const totalSum = Object.values(updated).reduce((a, b) => a + b, 0);
      const avgScore = Math.round(totalSum / STAGES.length);
      if (onFinishAssignment) onFinishAssignment(avgScore);
    }
  };

  const avgMasteryScore = Object.keys(stageScores).length > 0
    ? Math.round(Object.values(stageScores).reduce((a, b) => a + b, 0) / Object.keys(stageScores).length)
    : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-2">
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            <span>Adaptive Homework Engine</span>
            <span>•</span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">
              Difficulty: {adaptiveDifficulty}
            </span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">{assignment.title}</h1>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Mastery Score</div>
            <div className="text-lg font-black text-emerald-400">{avgMasteryScore}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {STAGES.map((st, idx) => {
          const isCurrent = idx === currentStageIdx;
          const isDone = stageScores[idx] !== undefined;

          return (
            <button
              key={st.type}
              onClick={() => setCurrentStageIdx(idx)}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                isCurrent ? 'bg-indigo-600 text-white border-indigo-500 font-bold' :
                isDone ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' :
                'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-extrabold opacity-75">Stage {st.number}</span>
              <span className="text-xs truncate w-full hidden md:inline">{st.label}</span>
              {isDone && <span className="text-[10px] text-emerald-600 font-extrabold">✓ {stageScores[idx]}%</span>}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        {currentStage.type === 'QUICK_RECALL' && (
          <Stage1QuickRecall items={assignment.stage1Recall} onComplete={handleStageComplete} />
        )}
        {currentStage.type !== 'QUICK_RECALL' && (
          <div className="text-center py-12 space-y-4">
            <span className="text-3xl">🚀</span>
            <h3 className="text-lg font-bold text-slate-900">Stage {currentStage.number}: {currentStage.label} Active</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Demonstrate competency across evaluation tasks to proceed to the next mastery stage.</p>
            <button
              onClick={() => handleStageComplete(90, { stage: currentStage.type })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
            >
              Complete Stage {currentStage.number} Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { Stage6ChallengeItem } from '../../types/homeworkTypes';

interface Props {
  challenges: Stage6ChallengeItem[];
  onComplete: (score: number, answers: Record<string, any>) => void;
}

export default function Stage6ChallengeMode({ challenges, onComplete }: Props) {
  const challenge = challenges[0];
  const [timeLeft, setTimeLeft] = useState(challenge?.timeLimitSeconds || 600);
  const [answerText, setAnswerText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, timeLeft]);

  if (!challenge) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete(95, { answerText, timeSpentSeconds: challenge.timeLimitSeconds - timeLeft });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            Stage 6: FAANG Interview Challenge Mode
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">{challenge.title}</h2>
        </div>
        <div className="bg-rose-950 text-rose-400 font-mono font-extrabold text-sm px-4 py-2 rounded-xl border border-rose-900 flex items-center gap-2">
          ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-5">
        <p className="text-slate-800 text-sm font-semibold leading-relaxed">{challenge.question}</p>

        <textarea
          rows={6}
          disabled={submitted}
          value={answerText}
          onChange={e => setAnswerText(e.target.value)}
          placeholder="Write your optimal O(1) algorithm design and memory allocation strategy..."
          className="w-full text-xs p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white font-mono transition-all focus:ring-2 focus:ring-rose-500/20"
        />

        {!submitted && (
          <button
            onClick={handleSubmit}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all"
          >
            Submit FAANG Challenge Response
          </button>
        )}
      </div>
    </div>
  );
}

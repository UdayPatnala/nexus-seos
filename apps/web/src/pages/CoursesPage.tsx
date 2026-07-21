import { useState } from 'react';
import HomeworkEngine from '../components/homework/HomeworkEngine';
import { staticHomeworkAssignments } from '../data/homeworkData';

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'concepts' | 'practice' | 'homework'>('homework');
  const homework = staticHomeworkAssignments['lesson-1'];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Java JVM Memory Architecture & Heap Allocation</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Day 1 • 30-Day SEOS Technical Mastery System</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'concepts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              📚 Core Concepts
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'homework' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              🧠 7-Stage Homework Engine
            </button>
          </div>
        </div>

        {activeTab === 'homework' && homework && (
          <HomeworkEngine assignment={homework} />
        )}

        {activeTab === 'concepts' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">JVM Stack vs Heap Memory Allocation</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Java memory management is divided primarily into Stack memory and Heap memory. Thread execution call frames live on the LIFO call stack, while object instances are allocated on the garbage-collected heap.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

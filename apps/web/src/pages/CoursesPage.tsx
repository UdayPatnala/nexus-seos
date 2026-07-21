import { useState } from 'react';
import HomeworkEngine from '../components/homework/HomeworkEngine';
import { staticHomeworkAssignments } from '../data/homeworkData';

export default function CoursesPage() {
  const [selectedLessonId, setSelectedLessonId] = useState<'lesson-1' | 'lesson-2'>('lesson-1');
  const [activeTab, setActiveTab] = useState<'concepts' | 'homework'>('homework');

  const homework = staticHomeworkAssignments[selectedLessonId];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {selectedLessonId === 'lesson-1'
                ? 'Java JVM Memory Architecture & Heap Allocation'
                : 'Lock-Free Concurrency & CAS (Compare-And-Swap)'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {selectedLessonId === 'lesson-1' ? 'Day 1' : 'Day 2'} • 30-Day SEOS Technical Mastery System
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Lesson Switcher */}
            <select
              value={selectedLessonId}
              onChange={e => setSelectedLessonId(e.target.value as 'lesson-1' | 'lesson-2')}
              className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
            >
              <option value="lesson-1">Lesson 1: JVM Memory & Heap</option>
              <option value="lesson-2">Lesson 2: Lock-Free Concurrency & CAS</option>
            </select>

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
        </div>

        {/* Tab Content */}
        {activeTab === 'homework' && homework && (
          <HomeworkEngine key={selectedLessonId} assignment={homework} />
        )}

        {activeTab === 'concepts' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {selectedLessonId === 'lesson-1' ? 'JVM Stack vs Heap Memory Allocation' : 'Atomic Compare-And-Swap (CAS) Hardware Instructions'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedLessonId === 'lesson-1'
                ? 'Java memory management is divided primarily into Stack memory and Heap memory. Thread execution call frames live on the LIFO call stack, while object instances are allocated on the garbage-collected heap.'
                : 'CAS CPU hardware instructions allow multi-threaded memory updates without acquiring OS mutex locks, providing high throughput for concurrent systems.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

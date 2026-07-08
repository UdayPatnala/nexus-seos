import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

interface Course { id: string; title: string; description: string; difficulty: string; }
interface Lesson { id: string; title: string; }
interface Concept { id: string; title: string; content: string; }

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [activeConcept, setActiveConcept] = useState<Concept | null>(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  useEffect(() => {
    api.courses.list().then(setCourses).catch(() => setCourses([]));
  }, []);

  const selectCourse = async (c: Course) => {
    setSelected(c); setLessons([]); setConcepts([]); setActiveConcept(null);
    const ls = await api.courses.lessons(c.id).catch(() => []);
    setLessons(ls);
  };

  const selectLesson = async (l: Lesson) => {
    setConcepts([]); setActiveConcept(null);
    const cs = await api.courses.concepts(l.id).catch(() => []);
    setConcepts(cs);
  };

  const openConcept = async (c: Concept) => {
    setActiveConcept(c);
    try {
      const n = await api.notes.byConcept(c.id);
      setNote(n?.markdown || '');
    } catch { setNote(''); }
    await api.courses.completeConcept(c.id).catch(() => {});
  };

  const saveNote = async () => {
    if (!activeConcept) return;
    setSavingNote(true);
    try {
      await api.notes.save(activeConcept.id, note);
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 2000);
    } finally { setSavingNote(false); }
  };

  const diffBadge = (d: string) => ({
    BEGINNER: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    INTERMEDIATE: 'bg-amber-100 text-amber-700 border border-amber-200',
    ADVANCED: 'bg-red-100 text-red-700 border border-red-200',
  }[d] || 'bg-slate-100 text-slate-600 border border-slate-200');

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      {/* Courses list */}
      <div className="w-56 border-r border-slate-200 overflow-y-auto p-3 space-y-2 shrink-0 bg-white">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest px-2 mb-2">Courses</div>
        {courses.length === 0
          ? <div className="text-slate-500 text-xs px-2">No courses seeded yet</div>
          : courses.map(c => (
            <button key={c.id} onClick={() => selectCourse(c)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                selected?.id === c.id ? 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}>
              <div className="font-semibold truncate">{c.title}</div>
              <span className={`text-xs px-1.5 py-0.5 rounded mt-1.5 inline-block ${diffBadge(c.difficulty)}`}>{c.difficulty}</span>
            </button>
          ))
        }
      </div>

      {/* Lessons */}
      {selected && (
        <div className="w-48 border-r border-slate-200 overflow-y-auto p-3 space-y-1 shrink-0 bg-white">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest px-2 mb-2">Lessons</div>
          {lessons.map(l => (
            <button key={l.id} onClick={() => selectLesson(l)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all font-medium">
              {l.title}
            </button>
          ))}
        </div>
      )}

      {/* Concepts */}
      {concepts.length > 0 && (
        <div className="w-48 border-r border-slate-200 overflow-y-auto p-3 space-y-1 shrink-0 bg-white">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest px-2 mb-2">Concepts</div>
          {concepts.map(c => (
            <button key={c.id} onClick={() => openConcept(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                activeConcept?.id === c.id ? 'text-indigo-700 bg-indigo-500/10 font-semibold border border-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}>
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Concept detail + Notes */}
      <div className="flex-1 overflow-y-auto p-6 min-w-0 bg-slate-50">
        {!activeConcept ? (
          <div className="text-center text-slate-400 pt-20 text-sm">Select a course → lesson → concept to begin</div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">{activeConcept.title}</h2>
              <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap bg-white rounded-xl p-5 border border-slate-200 shadow-sm markdown-body">
                {activeConcept.content || 'No content yet.'}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">📝 My Notes</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={saveNote}
                  disabled={savingNote}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                    noteSuccess ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20' : 'btn-primary shadow-sm shadow-indigo-500/10'
                  }`}>
                  {noteSuccess ? '✓ Saved' : savingNote ? 'Saving...' : 'Save Note'}
                </motion.button>
              </div>
              <textarea
                className="input-field font-mono text-sm shadow-sm bg-white text-slate-800"
                rows={8}
                placeholder="Write Markdown notes here..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


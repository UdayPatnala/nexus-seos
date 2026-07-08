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
    BEGINNER: 'bg-emerald-500/20 text-emerald-400',
    INTERMEDIATE: 'bg-amber-500/20 text-amber-400',
    ADVANCED: 'bg-red-500/20 text-red-400',
  }[d] || 'bg-gray-600/20 text-gray-400');

  return (
    <div className="flex h-full overflow-hidden">
      {/* Courses list */}
      <div className="w-56 border-r border-gray-800 overflow-y-auto p-3 space-y-2 shrink-0">
        <div className="text-xs text-gray-500 uppercase tracking-widest px-2 mb-2">Courses</div>
        {courses.length === 0
          ? <div className="text-gray-600 text-xs px-2">No courses seeded yet</div>
          : courses.map(c => (
            <button key={c.id} onClick={() => selectCourse(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selected?.id === c.id ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              <div className="font-medium truncate">{c.title}</div>
              <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block ${diffBadge(c.difficulty)}`}>{c.difficulty}</span>
            </button>
          ))
        }
      </div>

      {/* Lessons */}
      {selected && (
        <div className="w-44 border-r border-gray-800 overflow-y-auto p-3 space-y-1 shrink-0">
          <div className="text-xs text-gray-500 uppercase tracking-widest px-2 mb-2">Lessons</div>
          {lessons.map(l => (
            <button key={l.id} onClick={() => selectLesson(l)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              {l.title}
            </button>
          ))}
        </div>
      )}

      {/* Concepts */}
      {concepts.length > 0 && (
        <div className="w-44 border-r border-gray-800 overflow-y-auto p-3 space-y-1 shrink-0">
          <div className="text-xs text-gray-500 uppercase tracking-widest px-2 mb-2">Concepts</div>
          {concepts.map(c => (
            <button key={c.id} onClick={() => openConcept(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                activeConcept?.id === c.id ? 'text-indigo-300 bg-indigo-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Concept detail + Notes */}
      <div className="flex-1 overflow-y-auto p-6 min-w-0">
        {!activeConcept ? (
          <div className="text-center text-gray-600 pt-20 text-sm">Select a course → lesson → concept to begin</div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-bold text-white mb-3">{activeConcept.title}</h2>
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                {activeConcept.content || 'No content yet.'}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">📝 My Notes</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={saveNote}
                  disabled={savingNote}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                    noteSuccess ? 'bg-emerald-500 text-white' : 'btn-primary'
                  }`}>
                  {noteSuccess ? '✓ Saved' : savingNote ? 'Saving...' : 'Save Note'}
                </motion.button>
              </div>
              <textarea
                className="input-field font-mono text-sm"
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


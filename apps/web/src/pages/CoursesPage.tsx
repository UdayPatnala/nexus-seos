import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Course { id: string; title: string; description: string; difficulty: string; }
interface Lesson { id: string; title: string; }
interface Concept { id: string; title: string; content: string; }

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [activeConcept, setActiveConcept] = useState<Concept | null>(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  
  // Mastery scores and certificate state
  const [masteryMap, setMasteryMap] = useState<Record<string, number>>({});
  const [showCertModal, setShowCertModal] = useState(false);
  const [certName, setCertName] = useState(user?.fullName || '');
  const [showCertificate, setShowCertificate] = useState(false);

  const loadMastery = () => {
    api.courses.mastery().then(data => {
      const map: Record<string, number> = {};
      data.courses.forEach((c: any) => {
        map[c.courseId] = c.masteryScore;
      });
      setMasteryMap(map);
    }).catch(() => {});
  };

  const handleInstantComplete = async (courseId: string) => {
    try {
      await api.courses.complete(courseId);
      loadMastery();
      if (selected) {
        // reload lessons list just in case
        const ls = await api.courses.lessons(selected.id).catch(() => []);
        setLessons(ls);
      }
    } catch (e) {
      console.error("Instant complete failed", e);
    }
  };

  useEffect(() => {
    api.courses.list().then(setCourses).catch(() => setCourses([]));
    loadMastery();
  }, []);

  const selectCourse = async (c: Course) => {
    setSelected(c); setLessons([]); setConcepts([]); setActiveConcept(null);
    const ls = await api.courses.lessons(c.id).catch(() => []);
    setLessons(ls);
    loadMastery();
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
    loadMastery();
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

  const courseMastery = selected ? Math.round(masteryMap[selected.id] || 0) : 0;

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
          <div className="max-w-2xl mx-auto py-10">
            {selected ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6"
              >
                <div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${diffBadge(selected.difficulty)}`}>
                    {selected.difficulty}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-3">{selected.title}</h2>
                  <p className="text-slate-500 text-sm mt-1">{selected.description}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-slate-700">
                    <span>Course Mastery</span>
                    <span className="text-indigo-600 font-bold">{courseMastery}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200/50">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${courseMastery}%` }}
                    />
                  </div>
                </div>

                {user?.isDemo && courseMastery < 100 && (
                  <button
                    onClick={() => handleInstantComplete(selected.id)}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>⚡</span>
                    <span>Instant Complete Course (Demo Bypass)</span>
                  </button>
                )}

                {/* Completion state or prompt */}
                {courseMastery === 100 ? (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center space-y-4"
                  >
                    <div className="text-4xl">🎉</div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-indigo-900">Congratulations!</h3>
                      <p className="text-indigo-700 text-xs font-medium max-w-md mx-auto">
                        You have fully mastered all concepts and passed the validation checks for <strong>{selected.title}</strong>.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCertModal(true)}
                      className="btn-primary px-6 py-2.5 text-sm shadow-lg shadow-indigo-500/20"
                    >
                      Claim Certificate of Completion
                    </button>
                  </motion.div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium">
                    ⚡ Study lessons, check concepts, and complete all quizzes to reach 100% mastery and claim your certificate.
                  </div>
                )}

                {/* Summary list of lessons */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Syllabus</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200/60 rounded-xl overflow-hidden bg-slate-50/50">
                    {lessons.map((l, idx) => (
                      <div key={l.id} className="px-4 py-3 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">L{idx + 1}: {l.title}</span>
                        <span className="text-slate-400 font-medium">Completed</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center text-slate-400 pt-20 text-sm">Select a course → lesson → concept to begin</div>
            )}
          </div>
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

      {/* Claim Certificate Modal */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-xl space-y-4"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900">Configure Certificate</h3>
                <p className="text-slate-500 text-xs mt-1">Specify your name as you would like it printed on the certificate.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Full Name</label>
                <input
                  className="input-field shadow-sm bg-white"
                  placeholder="Jane Doe"
                  value={certName}
                  onChange={e => setCertName(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCertModal(false);
                    setShowCertificate(true);
                  }}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  Generate Certificate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Printable Certificate Modal */}
      <AnimatePresence>
        {showCertificate && selected && (
          <div
            id="certificate-print-modal"
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 print:absolute print:inset-0 print:p-0 print:bg-white print:backdrop-blur-none"
          >
            <div className="flex flex-col items-center gap-6 max-w-4xl w-full">
              {/* Controls bar (Hidden during print) */}
              <div className="flex justify-between items-center w-full no-print bg-slate-800/80 backdrop-blur px-5 py-3 rounded-xl border border-slate-700/50 shadow-md">
                <div className="text-white text-xs font-medium flex items-center gap-2">
                  <span>🎓</span>
                  <span>Review Certificate for <strong>{selected.title}</strong></span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
                  >
                    <span>🖨️</span>
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Certificate Canvas */}
              <div
                id="certificate-print-area"
                className="w-full aspect-[1.414/1] bg-white border-[16px] border-slate-100 rounded-2xl p-12 shadow-2xl relative flex flex-col justify-between overflow-hidden print:shadow-none print:border-none print:rounded-none"
              >
                {/* Decorative border */}
                <div className="absolute inset-2 border-2 border-dashed border-slate-300 pointer-events-none rounded-lg" />

                {/* Top Corner Details */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-extrabold text-xl shadow-sm shadow-indigo-500/10">N</div>
                    <div>
                      <span className="brand-flashy text-base font-extrabold tracking-tight">Nexus SEOS</span>
                      <div className="text-[10px] text-slate-400 font-semibold leading-none">Software Engineering OS</div>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    CREDENTIAL ID: {selected.id.substring(0, 8)}-{Math.random().toString(36).substr(2, 6).toUpperCase()}
                  </div>
                </div>

                {/* Certificate Core Content */}
                <div className="text-center space-y-5 my-auto">
                  <div className="space-y-1">
                    <h1 className="brand-flashy text-3xl font-extrabold tracking-widest uppercase">
                      Certificate of Completion
                    </h1>
                    <p className="text-slate-500 italic text-xs font-medium">This is proudly presented to</p>
                  </div>

                  <h2 className="text-4xl font-bold text-slate-900 border-b-2 border-slate-100 pb-2 max-w-md mx-auto brand-font">
                    {certName}
                  </h2>

                  <div className="space-y-2">
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed max-w-lg mx-auto">
                      for successfully mastering the curriculum, completing quiz evaluations, and satisfying the active recall criteria for the course
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selected.title}</h3>
                  </div>

                  {/* Course stats section */}
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center">
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Overall Score</div>
                      <div className="text-sm font-extrabold text-indigo-700 font-mono">{courseMastery}.0% Mastery</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Completed On</div>
                      <div className="text-sm font-extrabold text-slate-700 font-mono">
                        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified Mastery Transcript Section */}
                <div className="border-t border-slate-100 pt-5 mt-auto">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">Verified Syllabus Transcript</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[10px] text-slate-500 font-semibold text-left">
                    {courses.map(c => {
                      const score = Math.round(masteryMap[c.id] || 0);
                      if (score < 100) return null; // Only show completed
                      return (
                        <div key={c.id} className="flex justify-between border-b border-slate-100 pb-0.5">
                          <span className="text-slate-700 truncate max-w-[200px]">✓ {c.title}</span>
                          <span className="font-mono text-indigo-650 shrink-0">{score}% Mastery</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-4">
                  <div className="text-[9px] text-slate-400 font-medium max-w-md text-left">
                    * Awarded for personal development and self-mastery validation. Not an official academic or professional credential.
                  </div>
                  <div className="text-right">
                    <div className="w-24 h-1 border-b border-slate-300 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Nexus Tutor System</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


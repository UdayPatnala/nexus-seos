import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import { staticCourses, Course, Lesson, Concept, ProjectSpec } from '../data/coursesData';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [activeConcept, setActiveConcept] = useState<Concept | null>(null);
  
  // Navigation tabs for concept view: 'concept' | 'practice' | 'project' | 'interview'
  const [activeTab, setActiveTab] = useState<'concept' | 'practice' | 'project' | 'interview'>('concept');
  const [showSolution, setShowSolution] = useState(false);
  const [showDebugSolution, setShowDebugSolution] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

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
        const ls = await api.courses.lessons(selected.id).catch(() => []);
        if (ls && ls.length > 0) {
          setLessons(ls);
        }
      }
    } catch (e) {
      console.error("Instant complete failed", e);
    }
  };

  const downloadCertificate = async () => {
    const element = document.getElementById('certificate-print-area');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${selected?.title.replace(/[^a-z0-9]/gi, '_') || 'Course'}_Certificate.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Certificate download failed", e);
    }
  };

  useEffect(() => {
    setCourses(staticCourses);
    loadMastery();
  }, []);

  const selectCourse = async (c: Course) => {
    setSelected(c);
    setLessons(c.lessons || []);
    setConcepts([]);
    setActiveConcept(null);
    loadMastery();
  };

  const selectLesson = async (l: Lesson) => {
    setConcepts(l.concepts || []);
    setActiveConcept(null);
  };

  const openConcept = async (c: Concept) => {
    setActiveConcept(c);
    setActiveTab('concept');
    setShowSolution(false);
    setShowDebugSolution(false);
    setShowAnswers({});
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
      {/* Sidebar: Courses list */}
      <div className="w-60 border-r border-slate-200 overflow-y-auto p-3 space-y-2 shrink-0 bg-white shadow-sm">
        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2 mb-2">30-Day Master Courses</div>
        {courses.map(c => (
          <button key={c.id} onClick={() => selectCourse(c)}
            className={`w-full text-left px-3.5 py-3 rounded-xl text-sm transition-all ${
              selected?.id === c.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}>
            <div className="font-semibold text-slate-900 truncate">{c.title}</div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffBadge(c.difficulty)}`}>{c.difficulty}</span>
              <span className="text-[11px] text-slate-400 font-medium">30 Days</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lessons List */}
      {selected && (
        <div className="w-52 border-r border-slate-200 overflow-y-auto p-3 space-y-1 shrink-0 bg-white">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2 mb-2">Syllabus Track</div>
          {lessons.map((l, idx) => (
            <button key={l.id} onClick={() => selectLesson(l)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all font-medium border border-transparent hover:border-slate-200">
              <span className="text-indigo-600 font-bold mr-1">Day {l.dayNumber || idx + 1}:</span> {l.title}
            </button>
          ))}
        </div>
      )}

      {/* Concepts List */}
      {concepts.length > 0 && (
        <div className="w-52 border-r border-slate-200 overflow-y-auto p-3 space-y-1 shrink-0 bg-white">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2 mb-2">Concepts</div>
          {concepts.map(c => (
            <button key={c.id} onClick={() => openConcept(c)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                activeConcept?.id === c.id ? 'text-indigo-700 bg-indigo-50 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Learning Canvas */}
      <div className="flex-1 overflow-y-auto p-6 min-w-0 bg-slate-50/50">
        {!activeConcept ? (
          <div className="max-w-3xl mx-auto py-8">
            {selected ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6"
              >
                <div>
                  <span className={`text-xs px-3 py-1 rounded-full font-extrabold uppercase tracking-wider ${diffBadge(selected.difficulty)}`}>
                    {selected.difficulty} Track
                  </span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">{selected.title}</h2>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">{selected.description}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between text-sm font-bold text-slate-800">
                    <span>Course Mastery Progress</span>
                    <span className="text-indigo-600 font-extrabold">{courseMastery}%</span>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-3.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${courseMastery}%` }}
                    />
                  </div>
                </div>

                {user?.isDemo && courseMastery < 100 && (
                  <button
                    onClick={() => handleInstantComplete(selected.id)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span>⚡</span>
                    <span>Instant Complete Course (Demo Fast-Track)</span>
                  </button>
                )}

                {/* Completion certificate */}
                {courseMastery === 100 ? (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl text-center space-y-4"
                  >
                    <div className="text-4xl">🎓</div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-indigo-950">Mastery Certified!</h3>
                      <p className="text-indigo-700 text-xs font-semibold max-w-md mx-auto">
                        You have successfully verified 100% mastery across all concepts and project rubrics for <strong>{selected.title}</strong>.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCertModal(true)}
                      className="btn-primary px-6 py-2.5 text-xs font-bold shadow-md shadow-indigo-500/20"
                    >
                      Claim Verified Certificate
                    </button>
                  </motion.div>
                ) : (
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-800 font-semibold flex items-center gap-3">
                    <span className="text-lg">💡</span>
                    <span>Complete daily lessons, solve debugging tasks, and build capstone projects to achieve 100% mastery.</span>
                  </div>
                )}

                {/* Syllabus breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">30-Day Learning Schedule</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
                    {lessons.map((l, idx) => (
                      <div key={l.id} className="px-5 py-3.5 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">Day {l.dayNumber || idx + 1}: {l.title}</span>
                        <span className="text-indigo-600 font-semibold">{l.concepts.length} Mastery Concepts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center text-slate-400 pt-20 text-sm">Select a course track to begin your 30-day intensive learning plan</div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl mx-auto">
            {/* Master Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeConcept.title}</h2>
                <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1 block">30-Day Technical Mastery Track</span>
              </div>

              {/* Master View Switcher */}
              <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1 border border-slate-200">
                {[
                  { id: 'concept', label: '📖 Concept' },
                  { id: 'practice', label: '⚡ Practice & Debug' },
                  { id: 'project', label: '🛠️ Projects & HW' },
                  { id: 'interview', label: '🎯 Interview & Recall' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: CONCEPT BREAKDOWN & ANALOGY */}
            {activeTab === 'concept' && (
              <div className="space-y-6">
                {/* Learning Objectives */}
                {activeConcept.objectives && activeConcept.objectives.length > 0 && (
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 space-y-2">
                    <div className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎯</span> Learning Objectives
                    </div>
                    <ul className="list-disc list-inside text-xs text-indigo-950 font-medium space-y-1">
                      {activeConcept.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mental Model Analogy */}
                {activeConcept.analogy && (
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 space-y-2">
                    <div className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>💡</span> Mental Model & Real-World Analogy
                    </div>
                    <p className="text-xs text-amber-950 leading-relaxed font-medium">{activeConcept.analogy}</p>
                  </div>
                )}

                {/* Deep Content */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans markdown-body">
                  {activeConcept.content}
                </div>

                {/* Runnable Demonstration Code */}
                {activeConcept.walkthroughCode && (
                  <div className="space-y-2">
                    <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>💻 Executable Code Walkthrough</span>
                      <span className="text-[10px] text-slate-400">Monaco Sandbox Compatible</span>
                    </div>
                    <pre className="bg-slate-900 text-emerald-400 p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 shadow-sm leading-relaxed">
                      {activeConcept.walkthroughCode}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GUIDED EXERCISES & DEBUGGING CHALLENGES */}
            {activeTab === 'practice' && (
              <div className="space-y-6">
                {/* Guided Exercise */}
                {activeConcept.guidedExercise ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        ✍️ Guided Coding Task
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{activeConcept.guidedExercise.prompt}</p>
                    <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800">
                      {activeConcept.guidedExercise.starterCode}
                    </pre>
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      {showSolution ? 'Hide Solution ▲' : 'Reveal Solution Solution ▼'}
                    </button>
                    {showSolution && (
                      <pre className="bg-emerald-950 text-emerald-300 p-4 rounded-xl font-mono text-xs border border-emerald-800">
                        {activeConcept.guidedExercise.solutionCode}
                      </pre>
                    )}
                  </div>
                ) : (
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500">
                    No guided exercise for this concept. Use the Workbench to experiment freely.
                  </div>
                )}

                {/* Debugging Task */}
                {activeConcept.debuggingTask && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-red-700 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
                        🐛 Debugging Challenge (Fix Memory Leak / Syntax)
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold">Hint: {activeConcept.debuggingTask.fixHint}</p>
                    <pre className="bg-slate-900 text-red-300 p-4 rounded-xl font-mono text-xs border border-slate-800">
                      {activeConcept.debuggingTask.brokenCode}
                    </pre>
                    <button
                      onClick={() => setShowDebugSolution(!showDebugSolution)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      {showDebugSolution ? 'Hide Fixed Code ▲' : 'Reveal Fixed Code ▼'}
                    </button>
                    {showDebugSolution && (
                      <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs border border-emerald-800">
                        {activeConcept.debuggingTask.solutionCode}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PROJECTS & HOMEWORK */}
            {activeTab === 'project' && (
              <div className="space-y-6">
                {selected?.projects && selected.projects.length > 0 ? (
                  selected.projects.map(proj => (
                    <div key={proj.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                      <div>
                        <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                          🏆 Real-World Industry Project
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-3">{proj.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                      </div>

                      {/* Requirements */}
                      <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                        <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Functional Requirements</div>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 font-medium">
                          {proj.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Starter Code */}
                      <div className="space-y-1">
                        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Starter Boilerplate</div>
                        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800">
                          {proj.starterCode}
                        </pre>
                      </div>

                      {/* Rubric */}
                      <div className="space-y-2 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                        <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">Evaluation Rubric</div>
                        <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1 font-semibold">
                          {proj.rubric.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 font-medium">
                    Industry project spec is active for this course track. Refer to the Workbench to construct your solution.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: INTERVIEW QUESTIONS & RECALL NOTES */}
            {activeTab === 'interview' && (
              <div className="space-y-6">
                {/* Interview Questions */}
                {activeConcept.interviewQuestions && activeConcept.interviewQuestions.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">FAANG Phone Screen Questions</div>
                    {activeConcept.interviewQuestions.map((iq, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                        <div className="font-bold text-xs text-slate-900">Q{idx + 1}: {iq.question}</div>
                        <button
                          onClick={() => setShowAnswers(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          {showAnswers[idx] ? 'Hide Answer ▲' : 'Reveal Answer ▼'}
                        </button>
                        {showAnswers[idx] && (
                          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-950 font-medium leading-relaxed">
                            {iq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Cheat Sheet */}
                {activeConcept.cheatSheet && (
                  <div className="bg-indigo-950 text-indigo-100 rounded-2xl p-6 space-y-2 border border-indigo-900 shadow-md">
                    <div className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">⚡ Spaced Recall Cheat Sheet</div>
                    <div className="text-xs leading-relaxed font-mono">{activeConcept.cheatSheet}</div>
                  </div>
                )}

                {/* Notes Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">📝 Personal Study Notes</span>
                    <button
                      onClick={saveNote}
                      disabled={savingNote}
                      className={`text-xs px-4 py-1.5 rounded-lg transition-all font-bold ${
                        noteSuccess ? 'bg-emerald-600 text-white shadow-xs' : 'btn-primary shadow-xs'
                      }`}>
                      {noteSuccess ? '✓ Saved' : savingNote ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                  <textarea
                    className="input-field font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 w-full"
                    rows={6}
                    placeholder="Write Markdown notes here..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Certificate Modal */}
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
                <p className="text-slate-500 text-xs mt-1">Enter your full legal name for certificate generation.</p>
              </div>
              <input
                type="text"
                className="input-field text-sm"
                placeholder="Your Full Name"
                value={certName}
                onChange={e => setCertName(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCertModal(false)} className="btn-secondary text-xs px-4 py-2">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCertModal(false);
                    setShowCertificate(true);
                  }}
                  className="btn-primary text-xs px-5 py-2"
                >
                  Generate View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Certificate Full Screen View */}
      <AnimatePresence>
        {showCertificate && selected && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md p-6 flex flex-col items-center justify-center space-y-4">
            <div className="flex gap-4">
              <button
                onClick={downloadCertificate}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span>📥</span> Download Certificate (PNG)
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all"
              >
                Close View
              </button>
            </div>

            {/* Print Area */}
            <div
              id="certificate-print-area"
              className="w-[800px] h-[560px] bg-white border-[12px] border-indigo-900 p-12 text-center flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-900"
            >
              <div className="border-4 border-amber-400 h-full p-8 flex flex-col justify-between relative z-10">
                <div className="space-y-2">
                  <div className="text-indigo-900 font-black text-2xl tracking-widest uppercase">NEXUS SEOS OPERATING SYSTEM</div>
                  <div className="text-amber-600 font-bold text-xs uppercase tracking-widest">Verified Certificate of Technical Mastery</div>
                </div>

                <div className="space-y-3 my-4">
                  <div className="text-slate-400 text-xs uppercase font-semibold">This is to certify that</div>
                  <div className="text-3xl font-black text-slate-900 underline decoration-amber-400 decoration-4 underline-offset-8">
                    {certName || 'Software Engineer'}
                  </div>
                  <div className="text-slate-600 text-xs max-w-lg mx-auto leading-relaxed pt-2">
                    has successfully achieved 100% verified mastery across all theoretical, algorithmic, debugging, and production capstone requirements for
                  </div>
                  <div className="text-xl font-extrabold text-indigo-700">{selected.title}</div>
                </div>

                <div className="flex justify-between items-end text-left border-t border-slate-200 pt-4">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Issued Date</div>
                    <div className="text-xs font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center mx-auto mb-1">
                      🏆
                    </div>
                    <div className="text-[9px] font-black text-indigo-900 uppercase">OFFICIAL SEAL</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Verification Key</div>
                    <div className="text-xs font-mono font-bold text-slate-800">{selected.id.substring(0, 18).toUpperCase()}</div>
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

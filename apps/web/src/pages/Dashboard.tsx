import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CourseMastery { courseId: string; title: string; masteryScore: number; }

const DAILY_CHALLENGES = [
  { title: "GC Root Profiling & Memory Leak Mitigation", desc: "Profile memory leaks inside the JVM and write heap analysis routines in the workbench.", level: "ADVANCED", icon: "⚙️" },
  { title: "Thread-Safe Connection Pool implementation", desc: "Build a thread-safe connection pooling system in Java utilizing double-checked locking.", level: "INTERMEDIATE", icon: "🧵" },
  { title: "Multi-Stage Docker Container Optimization", desc: "Write multi-stage Docker builds to compile Spring Boot apps and minimize JRE footprints.", level: "INTERMEDIATE", icon: "🐳" },
  { title: "Token Bucket Rate Limiting Filter", desc: "Build an API rate limiting filter using Redis token-bucket rules.", level: "ADVANCED", icon: "🛡️" },
  { title: "Composite Index Tuning & SQL Join Optimization", desc: "Create optimal composite indexes to tune execution plans for complex queries.", level: "BEGINNER", icon: "💾" },
  { title: "CI/CD Pipeline Workflow Automation", desc: "Structure a GitHub Actions workflow to run Maven testing and deploy frontend to Vercel.", level: "BEGINNER", icon: "🚀" }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [mastery, setMastery] = useState<{ courses: CourseMastery[]; velocity: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.courses.mastery()
      .then(setMastery)
      .catch(() => setMastery({ courses: [], velocity: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const avgMastery = mastery?.courses.length
    ? mastery.courses.reduce((s, c) => s + c.masteryScore, 0) / mastery.courses.length
    : 0;

  // Calculate cognitive retention index based on user's active progress
  const retentionIndex = Math.min(98.5, Math.max(60.0, 75.0 + (avgMastery * 0.23)));
  const interviewReadiness = Math.min(96.0, Math.max(25.0, (avgMastery * 0.75) + ((mastery?.velocity || 1.2) * 10.0)));

  const masteryColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 50) return 'from-indigo-500 to-purple-500';
    if (score >= 25) return 'from-amber-500 to-orange-400';
    return 'from-slate-400 to-slate-300';
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, <span className="brand-flashy font-extrabold">{user?.fullName?.split(' ')[0] ?? 'Engineer'}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">30-Day Technical Mastery Operating System — Active Session</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 font-bold text-emerald-700">
            ⚡ 30-DAY PLAN: DAY 3 ACTIVE
          </span>
          <div className="text-xs bg-slate-100 border border-slate-200 rounded-full px-3 py-1 font-semibold text-slate-600">
            SYSTEM STATUS: ONLINE
          </div>
        </div>
      </div>

      {/* Spaced Repetition Active Recall Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xl shrink-0">
            🧠
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">Spaced Repetition Queue (SM-2 Scheduler)</div>
            <div className="text-sm font-extrabold text-white">2 Active Recall Concept Reviews Are Due Today</div>
            <p className="text-xs text-indigo-200 leading-relaxed">JVM Heap Allocation & FastAPI Async Event Loops require retrieval practice to maintain memory retention.</p>
          </div>
        </div>
        <Link
          to="/dashboard/courses"
          className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 self-stretch md:self-auto text-center"
        >
          Review Queue Now →
        </Link>
      </motion.div>

      {/* KPI Cards Suite */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Overall Mastery', value: `${avgMastery.toFixed(1)}%`, icon: '🧠', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
          { label: 'Learning Velocity', value: mastery ? `${mastery.velocity.toFixed(2)}x` : '1.20x', icon: '⚡', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label: 'Retention Decay Index', value: `${retentionIndex.toFixed(1)}%`, icon: '📉', bg: 'bg-purple-50 text-purple-600 border-purple-100' },
          { label: 'FAANG Interview Readiness', value: `${interviewReadiness.toFixed(1)}%`, icon: '🎯', bg: 'bg-amber-50 text-amber-600 border-amber-100' },
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-350 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</div>
              <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-0.5">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Daily Task Card */}
      {(() => {
        const userLevel = avgMastery < 35 ? 'BEGINNER' : avgMastery < 75 ? 'INTERMEDIATE' : 'ADVANCED';
        const filtered = DAILY_CHALLENGES.filter(c => c.level === userLevel);
        const list = filtered.length > 0 ? filtered : DAILY_CHALLENGES;
        const dailyChallenge = list[new Date().getDate() % list.length];

        const levelBadge = (level: string) => {
          const colors: Record<string, string> = {
            BEGINNER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            INTERMEDIATE: 'bg-amber-100 text-amber-700 border-amber-200',
            ADVANCED: 'bg-red-100 text-red-700 border-red-200'
          };
          return colors[level] || 'bg-slate-100 text-slate-700 border-slate-200';
        };

        return (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-350 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
                {dailyChallenge.icon}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">🎯 Daily 30-Day Mastery Challenge</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${levelBadge(dailyChallenge.level)}`}>
                    {dailyChallenge.level}
                  </span>
                </div>
                <p className="text-slate-800 font-semibold text-sm">{dailyChallenge.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed max-w-2xl">{dailyChallenge.desc}</p>
              </div>
            </div>
            <Link
              to="/dashboard/workbench"
              className="btn-primary text-xs shrink-0 self-stretch md:self-auto flex items-center justify-center"
            >
              Start Challenge
            </Link>
          </motion.div>
        );
      })()}

      {/* Grid Layout for details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Mastery Grid */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-350 flex flex-col justify-between">
          <div>
            <h2 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-5">Course Mastery Breakdown</h2>
            {loading ? (
              <div className="text-slate-400 text-sm py-4">Loading mastery data...</div>
            ) : mastery?.courses.length === 0 ? (
              <div className="text-slate-400 text-sm py-4">No courses found. Start learning to see your mastery scores.</div>
            ) : (
              <div className="space-y-4">
                {mastery!.courses.map((course) => (
                  <div key={course.courseId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-semibold">{course.title}</span>
                      <span className="text-slate-500 font-mono font-bold">{course.masteryScore.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200/50 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${masteryColor(course.masteryScore)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${course.masteryScore}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cognitive Psychology Guidance Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-350 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-slate-900 font-bold text-sm uppercase tracking-wider">30-Day Cognitive Learning Principles</h2>
            <div className="space-y-3">
              {[
                { title: "Spaced Repetition", desc: "Calculated review intervals prevent memory decay.", icon: "📅" },
                { title: "Active Recall", desc: "Retrieval practice forces neural pathway strengthening.", icon: "🧠" },
                { title: "Interleaved Practice", desc: "Alternating concepts improves problem-solving agility.", icon: "🔀" },
                { title: "Production Projects", desc: "Building capstones converts knowledge into engineering skill.", icon: "🚀" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.title}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

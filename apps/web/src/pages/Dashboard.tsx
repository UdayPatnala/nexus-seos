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
          <p className="text-slate-500 text-sm mt-1">Your engineering learning operating system is active.</p>
        </div>
        <div className="text-xs bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1.5 font-semibold text-slate-600 self-start md:self-auto">
          SYSTEM STATUS: ONLINE
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Overall Mastery', value: `${avgMastery.toFixed(1)}%`, icon: '🧠', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
          { label: 'Learning Velocity', value: mastery ? `${mastery.velocity.toFixed(2)}x` : '—', icon: '⚡', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label: 'Courses Tracked', value: mastery?.courses.length ?? 0, icon: '📚', bg: 'bg-amber-50 text-amber-600 border-amber-100' },
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
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Daily Task Card */}
      {(() => {
        const dailyChallenge = DAILY_CHALLENGES[new Date().getDate() % DAILY_CHALLENGES.length];
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
                  <h3 className="font-bold text-slate-900 text-base">🎯 Daily Mastery Challenge</h3>
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
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Concept Knowledge Graph Preview */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-350">
          <h2 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-5">Concept Knowledge Graph</h2>
          <KnowledgeGraphMini courses={mastery?.courses ?? []} />
        </div>
      </div>
    </div>
  );
}

function KnowledgeGraphMini({ courses }: { courses: CourseMastery[] }) {
  const W = 600, H = 260;
  const centerX = W / 2, centerY = H / 2;
  const radius = 80;

  const masteryColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#6366f1';
    if (score >= 25) return '#f59e0b';
    return '#94a3b8';
  };

  if (!courses.length) {
    return <div className="text-slate-400 text-sm text-center py-12">Complete quizzes to populate the graph</div>;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      <defs>
        <linearGradient id="hub-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4f46e5" />
          <stop offset="100%" stop-color="#db2777" />
        </linearGradient>
      </defs>
      
      {courses.map((c, i) => {
        const angle = (2 * Math.PI * i) / courses.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return (
          <g key={c.courseId} className="kg-node">
            <line x1={centerX} y1={centerY} x2={x} y2={y} className="kg-edge" stroke="#e2e8f0" strokeWidth="1.5" />
            <circle cx={x} cy={y} r={20} fill={masteryColor(c.masteryScore)} opacity={0.9} className="shadow-sm" />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={7.5} fontWeight="700" className="pointer-events-none">
              {c.title.substring(0, 6)}
            </text>
          </g>
        );
      })}
      
      {/* Center hub */}
      <circle cx={centerX} cy={centerY} r={26} fill="url(#hub-grad)" className="shadow-md" />
      <text x={centerX} y={centerY + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={8} fontWeight="800" className="pointer-events-none tracking-widest">NEXUS</text>
    </svg>
  );
}


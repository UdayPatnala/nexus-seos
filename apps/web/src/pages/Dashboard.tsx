import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CourseMastery { courseId: string; title: string; masteryScore: number; }

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
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-indigo-600';
    if (score >= 25) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName?.split(' ')[0] ?? 'Engineer'} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Your engineering learning operating system is active.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Overall Mastery', value: `${avgMastery.toFixed(1)}%`, icon: '🧠', color: 'indigo' },
          { label: 'Learning Velocity', value: mastery ? `${mastery.velocity.toFixed(2)}x` : '—', icon: '⚡', color: 'emerald' },
          { label: 'Courses Tracked', value: mastery?.courses.length ?? 0, icon: '📚', color: 'amber' },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card flex items-center gap-4"
          >
            <div className="text-3xl">{kpi.icon}</div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
              <div className="text-slate-500 text-xs">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Course Mastery Grid */}
      <div className="card">
        <h2 className="text-slate-900 font-semibold mb-4">Course Mastery Breakdown</h2>
        {loading ? (
          <div className="text-slate-400 text-sm">Loading mastery data...</div>
        ) : mastery?.courses.length === 0 ? (
          <div className="text-slate-400 text-sm">No courses found. Start learning to see your mastery scores.</div>
        ) : (
          <div className="space-y-4">
            {mastery!.courses.map((course) => (
              <div key={course.courseId}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-700 font-medium">{course.title}</span>
                  <span className="text-xs text-slate-500 font-mono">{course.masteryScore.toFixed(1)}%</span>
                </div>
                <div className="mastery-bar">
                  <motion.div
                    className={`mastery-bar-fill ${masteryColor(course.masteryScore)}`}
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

      {/* Concept Knowledge Graph Preview */}
      <div className="card">
        <h2 className="text-slate-900 font-semibold mb-4">Concept Knowledge Graph</h2>
        <KnowledgeGraphMini courses={mastery?.courses ?? []} />
      </div>
    </div>
  );
}

function KnowledgeGraphMini({ courses }: { courses: CourseMastery[] }) {
  const W = 600, H = 260;
  const centerX = W / 2, centerY = H / 2;
  const radius = 90;

  const masteryColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#4f46e5';
    if (score >= 25) return '#f59e0b';
    return '#94a3b8';
  };

  if (!courses.length) {
    return <div className="text-slate-400 text-sm text-center py-8">Complete quizzes to populate the graph</div>;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      {courses.map((c, i) => {
        const angle = (2 * Math.PI * i) / courses.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return (
          <g key={c.courseId} className="kg-node">
            <line x1={centerX} y1={centerY} x2={x} y2={y} className="kg-edge" />
            <circle cx={x} cy={y} r={22} fill={masteryColor(c.masteryScore)} opacity={0.9} />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={8} fontWeight="600">
              {c.title.substring(0, 6)}
            </text>
          </g>
        );
      })}
      {/* Center hub */}
      <circle cx={centerX} cy={centerY} r={28} fill="#4f46e5" />
      <text x={centerX} y={centerY + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={9} fontWeight="700">NEXUS</text>
    </svg>
  );
}


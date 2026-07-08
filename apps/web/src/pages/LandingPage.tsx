import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">N</div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Nexus SEOS</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard" className="btn-primary text-sm shadow-md shadow-indigo-500/10">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth" className="text-slate-600 hover:text-slate-900 text-sm font-semibold">
                Sign In
              </Link>
              <Link to="/auth" className="btn-primary text-sm shadow-md shadow-indigo-500/10">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-6 z-10"
        >
          <span className="px-3 py-1 bg-indigo-550/10 text-indigo-750 text-xs font-bold rounded-full uppercase tracking-wider">
            Now Live
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            The Software Engineering <br />
            <span className="text-indigo-600">Operating System</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Accelerate your engineering progression. Learn core concepts from JVM internals to system designs, test yourself via quizzes, and write code in an interactive workspace.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/auth" className="btn-primary px-8 py-3 text-base shadow-lg shadow-indigo-500/15">
              Start Learning Free
            </Link>
            <a href="https://github.com/UdayPatnala/nexus-seos" target="_blank" rel="noopener noreferrer" className="btn-ghost px-8 py-3 text-base font-semibold border border-slate-200 bg-white">
              View Source
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Everything You Need to Master Backend & Core Systems</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">Explore features designed specifically for modern software engineers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Monaco Code Sandbox',
                desc: 'Write and run JavaScript or Python directly in the browser with full console outputs. Zero installation required.',
                icon: '💻'
              },
              {
                title: 'Active Recall Syllabus',
                desc: 'Track overall mastery (0-100%) and learning velocity through seeded concepts and interactive lesson quizzes.',
                icon: '🧠'
              },
              {
                title: 'Gemini Mentorship Team',
                desc: 'Get coaching from specialized AI personas: Tutor (adapt explanations), Debugger (diagnostic traces), and Architect.',
                icon: '🤖'
              }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 border border-slate-100 bg-slate-50 rounded-xl space-y-3"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-slate-900 text-slate-400 border-t border-slate-800 text-center text-sm font-medium">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Nexus SEOS. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/UdayPatnala/nexus-seos" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Vercel
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

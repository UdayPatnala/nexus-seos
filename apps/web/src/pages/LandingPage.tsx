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
          <span className="brand-flashy text-xl font-extrabold tracking-tight">Nexus SEOS</span>
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
            <span className="brand-flashy">Operating System</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Accelerate your engineering progression. Learn core concepts from JVM internals to system designs, test yourself via quizzes, and write code in an interactive workspace.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/auth" className="btn-primary px-8 py-3 text-base shadow-lg shadow-indigo-500/15 font-semibold">
              Start Learning Free
            </Link>
            <a href="https://github.com/UdayPatnala/nexus-seos" target="_blank" rel="noopener noreferrer" className="btn-ghost px-8 py-3 text-base font-semibold border border-slate-200 bg-white">
              View Source
            </a>
          </div>
        </motion.div>

        {/* High-fidelity Mock IDE / Dashboard Container */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="w-full max-w-4xl mt-16 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col h-[400px] z-10"
        >
          {/* Windows Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="text-xs font-semibold text-slate-400 font-mono select-none">
              workspace://nexus-seos/sandbox
            </div>
            <div className="w-12" />
          </div>

          {/* IDE Workspace body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Mock */}
            <div className="w-48 bg-slate-50 border-r border-slate-200 p-3.5 space-y-4 shrink-0 hidden sm:block">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Syllabus</div>
                <div className="text-xs font-semibold text-indigo-650 bg-indigo-50/50 px-2.5 py-1.5 rounded-lg border border-indigo-150/30">
                  📁 JVM_Internals
                </div>
                <div className="text-xs font-medium text-slate-600 px-2.5 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-all">
                  📁 System_Design
                </div>
                <div className="text-xs font-medium text-slate-600 px-2.5 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-all">
                  📁 SQL_Optimization
                </div>
              </div>
            </div>

            {/* Code Workspace Mock */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              {/* Code Tab Bar */}
              <div className="bg-slate-50/50 border-b border-slate-200 px-4 py-1.5 flex items-center text-xs text-slate-500 font-semibold gap-2 select-none">
                <span className="bg-white border-x border-t border-slate-200 px-3 py-1 rounded-t-md text-slate-700 font-bold">
                  🚀 MemoryLeak.java
                </span>
                <span className="px-3 py-1 hover:text-slate-700 cursor-pointer">ThreadPool.py</span>
              </div>
              
              {/* Fake editor code */}
              <div className="flex-1 p-4 font-mono text-xs text-slate-600 space-y-1.5 overflow-hidden bg-slate-50/20 select-none">
                <div><span className="text-purple-600">public class</span> <span className="text-blue-600">MemoryLeak</span> &#123;</div>
                <div className="pl-4"><span className="text-purple-600">public static void</span> <span className="text-blue-600">main</span>(String[] args) &#123;</div>
                <div className="pl-8 text-slate-400">// Seed heap allocations to trigger JVM garbage collection</div>
                <div className="pl-8"><span className="text-purple-600">List</span>&lt;<span className="text-blue-600">byte[]</span>&gt; list = <span className="text-purple-600">new</span> <span className="text-blue-600">ArrayList</span>&lt;&gt;();</div>
                <div className="pl-8"><span className="text-purple-600">while</span>(<span className="text-amber-600">true</span>) &#123;</div>
                <div className="pl-12">list.add(<span className="text-purple-600">new byte</span>[1024 * 1024]); <span className="text-slate-400">// 1MB allocations</span></div>
                <div className="pl-8">&#125;</div>
                <div className="pl-4">&#125;</div>
                <div>&#125;</div>
              </div>

              {/* Mock Terminal Output */}
              <div className="h-28 border-t border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-300 space-y-1 overflow-hidden select-none">
                <div className="text-slate-500 flex justify-between border-b border-slate-800 pb-1 mb-1">
                  <span>TERMINAL CONSOLE</span>
                  <span className="text-emerald-500 font-bold">● ACTIVE</span>
                </div>
                <div className="text-slate-400">$ java MemoryLeak.java</div>
                <div className="text-amber-400">[GC Warn] GC threshold exceeded. Allocation failed.</div>
                <div className="text-red-400">Exception in thread "main" java.lang.OutOfMemoryError: Java heap space</div>
              </div>
            </div>

            {/* Chat Assistant Drawer Mock */}
            <div className="w-64 bg-slate-50 border-l border-slate-200 p-4 flex flex-col justify-between shrink-0 hidden md:flex select-none">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <span className="text-base">🤖</span>
                  <span className="text-xs font-bold text-slate-700">Tutor AI Persona</span>
                </div>
                
                {/* Chat feed */}
                <div className="space-y-3">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-indigo-700">TUTOR</div>
                    <div className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                      Notice the OutOfMemory exception. The heap space ran out because referenced array allocations weren't dereferenced.
                    </div>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-slate-500">STUDENT</div>
                    <div className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      How can I profile heap configuration parameters?
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-8 bg-white border border-slate-200 rounded-lg px-2.5 flex items-center text-slate-400 text-xs">
                Ask tutor a question...
              </div>
            </div>
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

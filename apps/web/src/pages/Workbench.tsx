import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const LANG_OPTIONS = ['javascript', 'python'];

export default function Workbench() {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, Nexus!");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState<{ stdout: string; stderr: string; status: string } | null>(null);
  const [running, setRunning] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Create or get default project
  useEffect(() => {
    api.projects.list().then((projects: any[]) => {
      if (projects.length > 0) {
        setProjectId(projects[0].id);
      } else {
        api.projects.create('My Workspace').then((p: any) => setProjectId(p.id));
      }
    }).catch(() => {});
  }, []);

  const run = async () => {
    if (!projectId || running) return;
    setRunning(true);
    setOutput(null);
    try {
      const result = await api.projects.execute(projectId, code, language);
      setOutput(result);
    } catch (e: any) {
      setOutput({ stdout: '', stderr: e.message, status: 'ERROR' });
    } finally {
      setRunning(false);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 bg-white shrink-0">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="bg-slate-100 border border-slate-300 text-slate-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          {LANG_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={run}
          disabled={running || !projectId}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {running ? (
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : '▶'}
          {running ? 'Running...' : 'Run'}
        </motion.button>
        {output && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            output.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {output.status}
          </span>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={val => setCode(val ?? '')}
          theme="vs"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12 },
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Terminal output */}
      <AnimatePresence>
        {output && (
          <motion.div
            ref={outputRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 border-t border-slate-200 bg-slate-900 font-mono text-sm overflow-auto"
            style={{ maxHeight: '35%' }}
          >
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-slate-800 bg-slate-950">
              <span className="text-slate-400 text-xs">TERMINAL</span>
            </div>
            <div className="px-4 py-3 space-y-1">
              {output.stdout && (
                <pre className="text-slate-100 whitespace-pre-wrap leading-relaxed">{output.stdout}</pre>
              )}
              {output.stderr && (
                <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">{output.stderr}</pre>
              )}
              {!output.stdout && !output.stderr && (
                <span className="text-slate-500">(no output)</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


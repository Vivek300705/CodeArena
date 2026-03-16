import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import {
  Play, Send, Clock, Cpu, ChevronLeft,
  CheckCircle, XCircle, AlertCircle, Code2, Terminal, Loader2
} from 'lucide-react';
import { getProblemById, submitCode } from '../services/problemService.js';
import { useSocket } from '../hooks/useSocket.js';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript (Node.js)', ext: 'js' },
  { id: 'python',     name: 'Python 3',             ext: 'py' },
  { id: 'cpp',        name: 'C++ 17',               ext: 'cpp' },
  { id: 'c',          name: 'C',                    ext: 'c' },
  { id: 'java',       name: 'Java',                 ext: 'java' },
  { id: 'go',         name: 'Go',                   ext: 'go' },
  { id: 'rust',       name: 'Rust',                 ext: 'rs' },
];

const DEFAULT_CODE = {
  javascript: '// Write your solution here\n',
  python:     '# Write your solution here\n',
  cpp:        '// Write your solution here\n',
  c:          '// Write your solution here\n',
  java:       '// Write your solution here\n',
  go:         '// Write your solution here\n',
  rust:       '// Write your solution here\n',
};

const DIFFICULTY_COLOR = {
  easy:   'text-green-400 bg-green-400/10 border-green-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  hard:   'text-red-400 bg-red-400/10 border-red-400/20',
};

const VERDICT_STYLE = {
  Accepted:            { color: 'text-green-500', icon: <CheckCircle className="w-5 h-5" /> },
  'Wrong Answer':      { color: 'text-red-400',   icon: <XCircle className="w-5 h-5" /> },
  'Runtime Error':     { color: 'text-red-400',   icon: <XCircle className="w-5 h-5" /> },
  'Time Limit Exceeded': { color: 'text-yellow-400', icon: <Clock className="w-5 h-5" /> },
};

export default function ProblemDetail() {
  const { id } = useParams();

  // Problem data
  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [problemError, setProblemError] = useState(null);

  // Editor
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE['javascript']);

  // Submission
  const [submissionId, setSubmissionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null); // { status, verdict, runtime, error }
  const [submitError, setSubmitError] = useState(null);

  // Fetch problem from real API
  useEffect(() => {
    setProblemLoading(true);
    getProblemById(id)
      .then((data) => {
        setProblem(data);
        // On initial load, try to set the code to the boilerplate for the initial language ('javascript')
        if (data && data.boilerplates && data.boilerplates.length > 0) {
          const bp = data.boilerplates.find(b => b.language === 'javascript' || b.language === 'node');
          if (bp) {
            setCode(bp.code);
          }
        }
      })
      .catch((err) => setProblemError(err.response?.data?.message || 'Failed to load problem'))
      .finally(() => setProblemLoading(false));
  }, [id]);

  // Socket: receive live verdict update
  const handleVerdictUpdate = useCallback((data) => {
    if (data.submissionId !== submissionId) return;
    setVerdict(data);
    setIsSubmitting(false);
  }, [submissionId]);

  useSocket(handleVerdictUpdate);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    
    // Switch to problem-specific boilerplate if available
    if (problem && problem.boilerplates && problem.boilerplates.length > 0) {
      // Map frontend lang to backend if needed (javascript -> node in backend)
      const mappedLang = lang === 'javascript' ? 'node' : lang;
      const bp = problem.boilerplates.find(b => b.language === mappedLang || b.language === lang);
      if (bp) {
        setCode(bp.code);
        return;
      }
    }
    
    // Fallback locally
    setCode(DEFAULT_CODE[lang]);
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setVerdict(null);
    setSubmitError(null);
    try {
      const submission = await submitCode({
        problemId: problem._id,
        code,
        language: language === 'javascript' ? 'node' : language,
      });
      setSubmissionId(submission._id);
      // Verdict will arrive via WebSocket (handleVerdictUpdate above)
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Submission failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background">
      {/* Left Panel: Problem Description */}
      <div className="w-full md:w-1/2 h-full flex flex-col border-r border-white/5 bg-surface/30">
        <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-background/50">
          <Link to="/problems" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            {problemLoading ? (
              <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
            ) : (
              <h1 className="text-xl font-bold">{problem?.title}</h1>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {problemLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
              ))}
            </div>
          ) : problemError ? (
            <div className="flex items-center gap-2 text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <AlertCircle className="w-5 h-5 shrink-0" /> {problemError}
            </div>
          ) : problem ? (
            <>
              <div className="flex gap-3 mb-6">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wide border ${DIFFICULTY_COLOR[problem.difficulty?.toLowerCase()] || 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'}`}>
                  {capitalize(problem.difficulty)}
                </span>
                {(problem.tags || []).map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 text-zinc-400 bg-white/5 border border-white/10 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="prose prose-invert max-w-none text-zinc-300">
                {(problem.description || '').split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}

                {(problem.examples || []).length > 0 && (
                  <>
                    <h3 className="text-white font-bold text-lg mt-8 mb-4">Examples:</h3>
                    <div className="space-y-6">
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="bg-surface/50 border border-white/10 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                          <div className="mb-2"><span className="text-zinc-500">Input: </span><span className="text-cyan-400">{ex.input}</span></div>
                          <div className="mb-2"><span className="text-zinc-500">Output: </span><span className="text-green-400">{ex.output}</span></div>
                          {ex.explanation && <div><span className="text-zinc-500">Explanation: </span><span className="text-zinc-300 font-sans">{ex.explanation}</span></div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                  <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <Clock className="text-primary w-5 h-5" />
                    <div>
                      <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Time Limit</div>
                      <div className="font-mono text-sm mt-0.5">{problem.timeLimit}s</div>
                    </div>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <Cpu className="text-purple-400 w-5 h-5" />
                    <div>
                      <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Memory Limit</div>
                      <div className="font-mono text-sm mt-0.5">{problem.memoryLimit} MB</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Right Panel: Editor & Console */}
      <div className="w-full md:w-1/2 h-full flex flex-col">
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-white/5 bg-background flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-zinc-500" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-sm font-medium outline-none text-zinc-300 hover:text-white cursor-pointer"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id} className="bg-surface text-foreground">{lang.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleLanguageChange({ target: { value: language } })}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/5 text-zinc-300"
          >
            <Terminal className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              fontLigatures: true,
              lineHeight: 24,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
            }}
          />
        </div>

        {/* Console / Output Area */}
        <div className="h-[200px] border-t border-white/5 bg-background flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface/30">
            <div className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Console
            </div>
            {verdict?.runtime && (
              <div className="flex items-center gap-4 text-zinc-400 font-mono text-xs">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {verdict.runtime} ms</span>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
            {isSubmitting ? (
              <div className="flex items-center justify-center h-full text-zinc-500 gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Judging… waiting for result
              </div>
            ) : submitError ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" /> {submitError}
              </motion.div>
            ) : verdict ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <div className={`font-bold text-lg flex items-center gap-2 ${VERDICT_STYLE[verdict.verdict]?.color || 'text-zinc-300'}`}>
                  {VERDICT_STYLE[verdict.verdict]?.icon}
                  {verdict.verdict}
                </div>
                {verdict.error && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-xs whitespace-pre-wrap">
                    {verdict.error}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 italic">
                Submit code to see the verdict
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/5 bg-surface/30 flex justify-end gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || problemLoading}
              className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

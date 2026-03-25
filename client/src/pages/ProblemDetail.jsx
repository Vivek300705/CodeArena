import { useState, useEffect, useCallback, useRef } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Send, Clock, Cpu, ChevronLeft,
  CheckCircle, XCircle, AlertCircle, Code2, Terminal, Loader2, GitCommit, FileText, Check
} from 'lucide-react';
import { getProblemById, submitCode, getSubmissionById } from '../services/problemService.js';
import { useSocket } from '../hooks/useSocket.js';
import DifficultyBadge from '../components/DifficultyBadge.jsx';
import ForgeButton from '../components/ForgeButton.jsx';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript (Node.js)' },
  { id: 'python',     name: 'Python 3' },
  { id: 'cpp',        name: 'C++ 17' },
  { id: 'c',          name: 'C' },
  { id: 'java',       name: 'Java' },
  { id: 'go',         name: 'Go' },
  { id: 'rust',       name: 'Rust' },
];

const DEFAULT_CODE = {
  javascript: '/**\n * @param {any} input\n * @return {any}\n */\nfunction solve(input) {\n  // forge your solution here\n  \n}\n',
  python:     'class Solution:\n    def solve(self, input):\n        # forge your solution here\n        pass\n',
  cpp:        'class Solution {\npublic:\n    auto solve(auto input) {\n        // forge your solution here\n        \n    }\n};\n',
  c:          '// forge your solution here\nvoid solve() {\n  \n}\n',
  java:       'class Solution {\n    public void solve() {\n        // forge your solution here\n        \n    }\n}\n',
  go:         'func solve() {\n    // forge your solution here\n}\n',
  rust:       'impl Solution {\n    pub fn solve() {\n        // forge your solution here\n    }\n}\n',
};

const VERDICT_STYLE = {
  Accepted:            { color: 'text-[var(--forge-green)]', icon: <CheckCircle className="w-6 h-6" /> },
  'Wrong Answer':      { color: 'text-[var(--forge-red)]',   icon: <XCircle className="w-6 h-6" /> },
  'Runtime Error':     { color: 'text-[var(--forge-red)]',   icon: <AlertCircle className="w-6 h-6" /> },
  'Time Limit Exceeded': { color: 'text-[var(--forge-yellow)]', icon: <Clock className="w-6 h-6" /> },
};

export default function ProblemDetail() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [problemError, setProblemError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('description');

  useDocumentTitle(problem ? `${problem.title} | CodeArena` : 'Forge');

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE['javascript']);

  const [submissionId, setSubmissionId] = useState(null);
  const submissionIdRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [traceLines, setTraceLines] = useState([]);

  useEffect(() => {
    setProblemLoading(true);
    getProblemById(id)
      .then((data) => {
        setProblem(data);
        if (data && data.boilerplates && data.boilerplates.length > 0) {
          const bp = data.boilerplates.find(b => b.language === 'javascript' || b.language === 'node');
          if (bp) setCode(bp.code);
        }
      })
      .catch((err) => setProblemError(err.response?.data?.message || 'Failed to load transmission.'))
      .finally(() => setProblemLoading(false));
  }, [id]);

  const handleVerdictUpdate = useCallback((data) => {
    if (!submissionIdRef.current) return;
    if (data.submissionId !== submissionIdRef.current) return;
    setVerdict(data);
    setIsSubmitting(false);
  }, []);

  useSocket(handleVerdictUpdate);

  useEffect(() => {
    if (!isSubmitting || !submissionIdRef.current) return;
    const interval = setInterval(async () => {
      try {
        const sub = await getSubmissionById(submissionIdRef.current);
        if (sub && sub.status === 'completed') {
          setVerdict({ 
            submissionId: sub._id, verdict: sub.verdict, status: sub.status, 
            error: sub.error, runtime: sub.runtime, testcasesPassed: sub.testcasesPassed, 
            totalTestcases: sub.totalTestcases 
          });
          setIsSubmitting(false);
          clearInterval(interval);
        }
      } catch (e) { /* ignore */ }
    }, 2500);
    return () => clearInterval(interval);
  }, [isSubmitting, submissionId]);

  useEffect(() => {
    if (!isSubmitting) return;
    
    setTraceLines([]);
    const lines = [
      '[SYS] Initializing secure worker enclave...',
      `[SYS] Checking constraints (Memory: ${problem?.memoryLimit || 256}MB) -> OK`,
      `[COMPILER] Build starting for ${language}...`,
      '[COMPILER] Optimization flags: -O3 -march=native',
      '[COMPILER] Build successful. 42ms.',
      '[JUDGE] Connecting to testcase stream...',
      '[JUDGE] Executing against hidden constraints...'
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < lines.length) {
        setTraceLines(prev => [...prev, lines[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isSubmitting, language, problem]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (problem && problem.boilerplates && problem.boilerplates.length > 0) {
      const mappedLang = lang === 'javascript' ? 'node' : lang;
      const bp = problem.boilerplates.find(b => b.language === mappedLang || b.language === lang);
      if (bp) {
        setCode(bp.code);
        return;
      }
    }
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
      submissionIdRef.current = submission._id;
      setSubmissionId(submission._id);
      setActiveTab('submissions');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Transmission failed. Engine overloaded.');
      setIsSubmitting(false);
    }
  };

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-[var(--forge-bg)] font-ui overflow-hidden">
      
      {/* ── LEFT PANEL (PROBLEM DETAILS) ── */}
      <div className="w-full md:w-[40%] flex flex-col border-r border-[var(--forge-border)] bg-[var(--forge-panel)] relative z-10">
        
        {/* Header Tabs */}
        <div className="flex border-b border-[var(--forge-border)] bg-[var(--forge-bg)]">
          <Link to="/problems" className="flex items-center justify-center w-14 border-r border-[var(--forge-border)] text-[var(--forge-steel)] hover:text-[var(--forge-ember)] transition-colors hover:bg-[var(--forge-ember)]/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <button 
            onClick={() => setActiveTab('description')}
            className={`flex-1 py-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'description' ? 'text-[var(--forge-white)] border-b-2 border-[var(--forge-ember)] bg-[#11161B]' : 'text-[var(--forge-steel)] hover:text-[var(--forge-white)] hover:bg-[#11161B]'}`}
          >
            <span className="flex items-center justify-center gap-2"><FileText className="w-4 h-4" /> Description</span>
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`flex-1 py-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'submissions' ? 'text-[var(--forge-white)] border-b-2 border-[var(--forge-ember)] bg-[#11161B]' : 'text-[var(--forge-steel)] hover:text-[var(--forge-white)] hover:bg-[#11161B]'}`}
          >
            <span className="flex items-center justify-center gap-2"><GitCommit className="w-4 h-4" /> Submissions</span>
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
          {activeTab === 'description' ? (
            problemLoading ? (
              <div className="space-y-6">
                <div className="h-8 bg-[var(--forge-border)] rounded-sm animate-pulse w-3/4" />
                <div className="space-y-3">
                  <div className="h-4 bg-[var(--forge-border)] rounded-sm animate-pulse w-full" />
                  <div className="h-4 bg-[var(--forge-border)] rounded-sm animate-pulse w-5/6" />
                  <div className="h-4 bg-[var(--forge-border)] rounded-sm animate-pulse w-4/6" />
                </div>
              </div>
            ) : problemError ? (
              <div className="p-4 border border-[var(--forge-red)]/30 bg-[var(--forge-red)]/5 text-[var(--forge-red)] flex items-center gap-3">
                <AlertCircle className="w-5 h-5" /> {problemError}
              </div>
            ) : problem ? (
              <>
                <h1 className="text-3xl font-display font-black text-[var(--forge-white)] mb-4">{problem.title}</h1>
                <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-[var(--forge-border)]">
                  <DifficultyBadge difficulty={capitalize(problem.difficulty)} />
                  {(problem.tags || []).map(tag => (
                    <span key={tag} className="text-[10px] px-2.5 py-1 text-[var(--forge-steel)] bg-[#0C1015] border border-[var(--forge-border)] font-mono tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="prose prose-invert max-w-none text-zinc-300 font-ui text-base leading-relaxed">
                  {(problem.description || '').split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}

                  {(problem.examples || []).length > 0 && (
                    <div className="mt-10 space-y-6">
                      <h3 className="text-[var(--forge-white)] font-bold text-lg uppercase tracking-widest font-display">Examples</h3>
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="bg-[#0A0D11] border-l-2 border-[var(--forge-border)] p-5 font-mono text-sm shadow-inner relative overflow-hidden group">
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--forge-ember)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="mb-3"><span className="text-[var(--forge-dim)]">input: </span><span className="text-[var(--forge-white)]">{ex.input}</span></div>
                          <div className="mb-3"><span className="text-[var(--forge-dim)]">output: </span><span className="text-[var(--forge-green)] drop-shadow-[0_0_8px_var(--forge-green)] font-bold">{ex.output}</span></div>
                          {ex.explanation && <div><span className="text-[var(--forge-dim)]">explain: </span><span className="text-[var(--forge-steel)] font-sans">{ex.explanation}</span></div>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 mt-10 pt-6 border-t border-[var(--forge-border)]">
                    <div className="flex items-center gap-3">
                      <Clock className="text-[var(--forge-dim)] w-4 h-4" />
                      <span className="text-[var(--forge-steel)] font-mono text-xs">Limit: {problem.timeLimit}s</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Cpu className="text-[var(--forge-dim)] w-4 h-4" />
                      <span className="text-[var(--forge-steel)] font-mono text-xs">Mem: {problem.memoryLimit}MB</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null
          ) : (
            // Submissions Tab
            <div className="font-mono">
              {!submissionId && !verdict && !isSubmitting && (
                <div className="text-center py-20 text-[var(--forge-dim)]">
                  <Terminal className="w-10 h-10 mx-auto mb-4 opacity-50" />
                  <p>Awaiting transmission. Submit your code.</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {isSubmitting && (
                  <motion.div 
                    key="submitting"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 text-[var(--forge-ember)] mb-6 border border-[var(--forge-ember)]/30 bg-[var(--forge-ember)]/10 p-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-bold tracking-widest uppercase">System engaged. Processing...</span>
                    </div>
                    {traceLines.map((line, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                        key={i} className="text-[var(--forge-steel)] text-xs"
                      >
                        {line}
                      </motion.div>
                    ))}
                    <div className="w-4 h-5 bg-[var(--forge-ember)] animate-pulse mt-2" />
                  </motion.div>
                )}

                {!isSubmitting && verdict && (
                  <motion.div 
                    key="verdict"
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className={`p-6 border-l-4 ${verdict.verdict === 'Accepted' ? 'border-[var(--forge-green)] bg-[var(--forge-green)]/5' : 'border-[var(--forge-red)] bg-[var(--forge-red)]/5'}`}>
                      <div className={`font-black text-2xl uppercase tracking-widest flex items-center gap-3 mb-2 ${VERDICT_STYLE[verdict.verdict]?.color || 'text-[var(--forge-white)]'}`}>
                        {VERDICT_STYLE[verdict.verdict]?.icon}
                        {verdict.verdict}
                      </div>

                      {verdict.totalTestcases > 0 && (
                        <div className="mt-6">
                          <div className="flex justify-between text-xs text-[var(--forge-steel)] mb-2 uppercase tracking-widest">
                            <span>Testcase Penetration</span>
                            <span className="text-[var(--forge-white)]">{verdict.testcasesPassed} / {verdict.totalTestcases}</span>
                          </div>
                          <div className="w-full h-1 bg-[var(--forge-border)] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(verdict.testcasesPassed / verdict.totalTestcases) * 100}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={`h-full ${verdict.verdict === 'Accepted' ? 'bg-[var(--forge-green)] drop-shadow-[0_0_8px_var(--forge-green)]' : 'bg-[var(--forge-red)]'}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {verdict.runtime && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[var(--forge-panel)] border border-[var(--forge-border)]">
                          <div className="text-[10px] text-[var(--forge-dim)] uppercase tracking-widest mb-1">Runtime</div>
                          <div className="text-xl text-[var(--forge-white)]">{verdict.runtime} <span className="text-sm text-[var(--forge-steel)]">ms</span></div>
                        </div>
                        <div className="p-4 bg-[var(--forge-panel)] border border-[var(--forge-border)]">
                          <div className="text-[10px] text-[var(--forge-dim)] uppercase tracking-widest mb-1">Status</div>
                          <div className="text-[var(--forge-green)] font-bold">OPTIMIZED</div>
                        </div>
                      </div>
                    )}

                    {verdict.error && (
                      <div className="p-4 bg-[#1A1010] border border-[var(--forge-red)]/30 text-[var(--forge-red)] text-xs overflow-x-auto">
                        <pre>{verdict.error}</pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL (EDITOR) ── */}
      <div className="w-full md:w-[60%] flex flex-col relative bg-[#0D1117]">
        
        {/* Submitting Overlay */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#080A0C]/80 backdrop-blur-sm flex items-center justify-center p-8"
            >
              <div className="text-center font-mono">
                <Terminal className="w-16 h-16 text-[var(--forge-ember)] mx-auto mb-6 animate-pulse" />
                <div className="text-2xl font-black text-[var(--forge-white)] tracking-widest uppercase mb-2">Compiling</div>
                <div className="text-[var(--forge-ember)] text-sm tracking-widest">Executing Instructions...</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor Toolbar */}
        <div className="h-16 border-b border-[var(--forge-border)] bg-[var(--forge-bg)] flex items-center justify-between px-6 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <Code2 className="w-5 h-5 text-[var(--forge-ember)] drop-shadow-[0_0_5px_var(--forge-glow)]" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-sm font-bold font-mono outline-none text-[var(--forge-white)] cursor-pointer py-1 border-b-2 border-transparent focus:border-[var(--forge-ember)] transition-colors"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id} className="bg-[#11161B] text-white py-2">{lang.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <ForgeButton 
              disabled={isSubmitting || problemLoading}
              variant="secondary"
              className="px-6 py-2 border-[var(--forge-border)] text-[var(--forge-steel)] hover:text-white"
            >
              [ RUN ]
            </ForgeButton>
            <ForgeButton 
              onClick={handleSubmit}
              disabled={isSubmitting || problemLoading}
              variant="primary"
              className="px-8 py-2 font-black shadow-[0_0_15px_var(--forge-glow)] flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> [ SUBMIT ]
            </ForgeButton>
          </div>
        </div>

        {/* Monaco Workspace */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: "'Space Mono', 'Fira Code', monospace",
              fontLigatures: true,
              lineHeight: 26,
              padding: { top: 24, bottom: 24 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorWidth: 3,
              renderLineHighlight: 'all',
              wordWrap: 'on'
            }}
            loading={<div className="flex items-center justify-center h-full text-[var(--forge-dim)] font-mono animate-pulse">Initializing editor engine...</div>}
          />
        </div>
      </div>
    </div>
  );
}

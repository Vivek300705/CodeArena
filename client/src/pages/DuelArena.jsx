import { useState, useEffect, useCallback, useRef } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Clock, Cpu, CheckCircle, XCircle, AlertCircle, Code2, Terminal, Loader2, Zap, Swords, Ban, Shield
} from 'lucide-react';
import { getDuel, triggerPowerup, cancelDuel } from '../services/duelService.js';
import { submitCode, getSubmissionById } from '../services/problemService.js';
import { useSocket } from '../hooks/useSocket.js';
import { useAuthStore } from '../store/useAuthStore.js';
import ForgeButton from '../components/ForgeButton.jsx';
import DifficultyBadge from '../components/DifficultyBadge.jsx';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript (Node.js)' },
  { id: 'python',     name: 'Python 3' },
  { id: 'cpp',        name: 'C++ 17' },
  { id: 'java',       name: 'Java' },
];

const DEFAULT_CODE = {
  javascript: '// forge your solution here\n',
  python:     '# forge your solution here\n',
  cpp:        '// forge your solution here\n',
  java:       '// forge your solution here\n',
};

const VERDICT_STYLE = {
  Accepted:            { color: 'text-[var(--forge-green)]', icon: <CheckCircle className="w-5 h-5" /> },
  'Wrong Answer':      { color: 'text-[var(--forge-red)]',   icon: <XCircle className="w-5 h-5" /> },
  'Runtime Error':     { color: 'text-[var(--forge-red)]',   icon: <AlertCircle className="w-5 h-5" /> },
  'Time Limit Exceeded': { color: 'text-[var(--forge-yellow)]', icon: <Clock className="w-5 h-5" /> },
};

export default function DuelArena() {
  useDocumentTitle('Duel Arena | CodeArena');
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  const [duelData, setDuelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);

  // Scoreboard state
  const [scores, setScores] = useState({});
  const [opponentSubmissions, setOpponentSubmissions] = useState([]);

  // Editor State
  const [language, setLanguage] = useState('javascript');
  const [codes, setCodes] = useState({});

  const activeProblem = duelData?.problems[activeProblemIndex]?.problem;
  const currentCode = activeProblem ? (codes[activeProblem._id] ?? "") : "";

  useEffect(() => {
    if (activeProblem && codes[activeProblem._id] === undefined) {
      const langMatch = language === 'javascript' ? 'node' : language;
      const bp = activeProblem.boilerplates?.find(b => b.language === langMatch || b.language === language);
      setCodes(prev => ({ ...prev, [activeProblem._id]: bp ? bp.code : DEFAULT_CODE[language] }));
    }
  }, [activeProblem, language, codes]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCodes({}); 
  };

  // Submission State
  const [submissionId, setSubmissionId] = useState(null);
  const submissionIdRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Fetch Duel
  useEffect(() => {
    setLoading(true);
    getDuel(id)
      .then((data) => {
        setDuelData(data.duel);
        
        const newScores = {};
        data.duel.players.forEach(p => {
           if (p.user) newScores[p.user._id] = p.score;
        });
        
        if (data.activeState) {
           newScores[data.activeState.player1] = parseInt(data.activeState.score1 || 0);
           newScores[data.activeState.player2] = parseInt(data.activeState.score2 || 0);
        }
        setScores(newScores);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Socket setup
  const handleSocketEvents = useCallback((data, type) => {
    if (type === "submission_update") {
       if (!submissionIdRef.current || data.submissionId !== submissionIdRef.current) return;
       setVerdict(data);
       setIsSubmitting(false);
    } else if (type === "duel_score_update") {
       setScores(prev => ({ ...prev, [data.userId]: data.newScore }));
    } else if (type === "duel_submission_update") {
       setOpponentSubmissions(prev => [data, ...prev].slice(0, 5));
    } else if (type === "powerup_used") {
       console.log("Powerup used:", data);
    } else if (type === "match:start") {
       setDuelData(prev => ({ 
         ...prev, 
         status: "active", 
         startTime: data.startTime,
         problems: data.problems.map(p => ({ problem: p }))
       }));
    } else if (type === "duel_cancelled") {
       alert("Matched has been cancelled.");
       navigate("/duel");
    }
  }, [navigate]);

  const socket = useSocket((data) => handleSocketEvents(data, "submission_update"));

  useEffect(() => {
    if (socket && id) {
      socket.emit("join_duel", id);
      
      const hs = (e, t) => handleSocketEvents(e, t);
      socket.on("duel_score_update", e => hs(e, "duel_score_update"));
      socket.on("duel_submission_update", e => hs(e, "duel_submission_update"));
      socket.on("powerup_used", e => hs(e, "powerup_used"));
      socket.on("match:start", e => hs(e, "match:start"));
      socket.on("duel_cancelled", e => hs(e, "duel_cancelled"));
      
      return () => {
         socket.off("duel_score_update");
         socket.off("duel_submission_update");
         socket.off("powerup_used");
         socket.off("match:start");
         socket.off("duel_cancelled");
      }
    }
  }, [socket, id, handleSocketEvents]);

  // Polling fallback
  useEffect(() => {
    if (!isSubmitting || !submissionIdRef.current) return;
    const intervalId = setInterval(async () => {
      try {
        const sub = await getSubmissionById(submissionIdRef.current);
        if (sub && sub.status === 'completed') {
          setVerdict(sub);
          setIsSubmitting(false);
          clearInterval(intervalId);
        }
      } catch (e) { }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [isSubmitting, submissionId]);

  const handleSubmit = async () => {
    if (!activeProblem) return;

    setIsSubmitting(true);
    setVerdict(null);
    setSubmitError(null);
    try {
      const submission = await submitCode({
        problemId: activeProblem._id,
        code: currentCode,
        language: language === 'javascript' ? 'node' : language,
      });
      submissionIdRef.current = submission._id;
      setSubmissionId(submission._id);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Transmission failed. Engine overloaded.');
      setIsSubmitting(false);
    }
  };

  const handleUsePowerup = async (type) => {
    try {
      await triggerPowerup(id, type);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelDuel = async () => {
    if (!window.confirm("Abandon match and forfeit arena points?")) return;
    try {
       await cancelDuel(id);
       navigate("/duel");
    } catch (err) {
       console.error(err);
    }
  };

  if (loading) return (
    <div className="h-[calc(100vh-64px)] bg-[var(--forge-bg)] flex items-center justify-center font-mono text-[var(--forge-ember)]">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
  if (!duelData) return (
    <div className="h-[calc(100vh-64px)] bg-[var(--forge-bg)] flex items-center justify-center font-mono text-[var(--forge-red)]">
      ARENA SIGNATURE NOT FOUND
    </div>
  );

  const opponents = duelData.players.map(p => p.user);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-[var(--forge-bg)] font-ui overflow-hidden">
      
      {/* ── LEFT PANEL: ARENA STATUS & PROBLEM ── */}
      <div className="w-full md:w-[40%] flex flex-col border-r border-[var(--forge-border)] bg-[var(--forge-panel)] z-10 relative">
        
        {/* Scoreboard Header */}
        <div className="p-4 border-b border-[var(--forge-border)] bg-[var(--forge-bg)] grid grid-cols-3 gap-4 items-center relative overflow-hidden">
          <div className="absolute top-0 right-1/2 w-64 h-32 bg-[var(--forge-ember)] blur-[80px] opacity-10 pointer-events-none" />
          
          <div className="text-center bg-[#11161B] p-3 border border-[var(--forge-ember)]/30 relative shadow-[inset_0_0_15px_rgba(249,115,22,0.05)]">
            <div className="text-[10px] uppercase font-black tracking-widest text-[var(--forge-steel)] truncate mb-1">{opponents[0]?.username || "P1"}</div>
            <div className="text-3xl font-black font-display text-[var(--forge-ember)] drop-shadow-[0_0_10px_var(--forge-glow)]">{scores[opponents[0]?._id] || 0}</div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <Swords className="w-8 h-8 text-[var(--forge-red)] mb-1 drop-shadow-[0_0_8px_var(--forge-red)]" />
            <span className="text-[10px] text-[var(--forge-steel)] font-black uppercase tracking-widest font-display">VS</span>
          </div>

          <div className="text-center bg-[#11161B] p-3 border border-[#3b82f6]/30 relative shadow-[inset_0_0_15px_rgba(59,130,246,0.05)]">
            <div className="text-[10px] uppercase font-black tracking-widest text-[var(--forge-steel)] truncate mb-1">
              {opponents[1]?.username || "Awaiting..."}
            </div>
            <div className="text-3xl font-black font-display text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              {opponents[1] ? (scores[opponents[1]?._id] || 0) : "-"}
            </div>
          </div>
        </div>

        {/* Problem Tabs */}
        <div className="flex border-b border-[var(--forge-border)] bg-[#0C1015]">
          {duelData.problems.map((p, i) => (
            <button
              key={p.problem._id}
              onClick={() => setActiveProblemIndex(i)}
              className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-colors border-r border-[var(--forge-border)] last:border-0 ${
                i === activeProblemIndex 
                  ? 'bg-[#11161B] text-[var(--forge-white)] border-b-2 border-b-[var(--forge-ember)]' 
                  : 'text-[var(--forge-steel)] hover:bg-[#14181D] hover:text-[var(--forge-white)]'
              }`}
            >
              PRB_{i+1}
            </button>
          ))}
        </div>

        {/* Problem Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {activeProblem ? (
            <>
              <h1 className="text-3xl font-display font-black text-[var(--forge-white)] mb-4">{activeProblem.title}</h1>
              <div className="flex gap-3 mb-6 pb-6 border-b border-[var(--forge-border)]">
                <DifficultyBadge difficulty={activeProblem.difficulty?.toUpperCase()} />
                {(activeProblem.tags || []).map(tag => (
                  <span key={tag} className="text-[10px] px-2.5 py-1 text-[var(--forge-steel)] bg-[#0C1015] border border-[var(--forge-border)] font-mono tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="prose prose-invert max-w-none text-zinc-300 font-ui text-base leading-relaxed">
                {(activeProblem.description || '').split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                ))}

                {(activeProblem.examples || []).length > 0 && (
                  <div className="mt-10 space-y-6">
                    <h3 className="text-[var(--forge-white)] font-bold text-lg uppercase tracking-widest font-display">Examples</h3>
                    {activeProblem.examples.map((ex, i) => (
                      <div key={i} className="bg-[#0A0D11] border-l-2 border-[var(--forge-border)] p-5 font-mono text-sm shadow-inner relative overflow-hidden group">
                         <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--forge-ember)] opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="mb-3"><span className="text-[var(--forge-dim)]">input: </span><span className="text-[var(--forge-white)]">{ex.input}</span></div>
                         <div className="mb-3"><span className="text-[var(--forge-dim)]">output: </span><span className="text-[var(--forge-green)] drop-shadow-[0_0_8px_var(--forge-green)] font-bold">{ex.output}</span></div>
                         {ex.explanation && <div><span className="text-[var(--forge-dim)]">explain: </span><span className="text-[var(--forge-steel)] font-sans">{ex.explanation}</span></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10 pt-6 border-t border-[var(--forge-border)]">
                <div className="flex items-center gap-3">
                  <Clock className="text-[var(--forge-dim)] w-4 h-4" />
                  <span className="text-[var(--forge-steel)] font-mono text-xs">Limit: {activeProblem?.timeLimit || 1}s</span>
                </div>
                <div className="flex items-center gap-3">
                  <Cpu className="text-[var(--forge-dim)] w-4 h-4" />
                  <span className="text-[var(--forge-steel)] font-mono text-xs">Mem: {activeProblem?.memoryLimit || 256}MB</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-[var(--forge-dim)] text-center py-20 font-mono">
              TARGET_DATA_CORRUPTED
            </div>
          )}

          {/* Powerups */}
          <div className="mt-10 pt-8 border-t border-[var(--forge-border)]">
             <h3 className="text-[10px] font-black tracking-widest text-[var(--forge-dim)] mb-4 uppercase font-display">Combat Utilities</h3>
             <div className="flex gap-3">
                 <button onClick={() => handleUsePowerup('freeze')} className="flex items-center gap-2 px-4 py-2 border border-[#0ea5e9]/30 bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20 transition-colors shadow-[0_0_10px_rgba(14,165,233,0.15)] font-mono text-sm uppercase tracking-wider">
                   <Shield className="w-4 h-4" /> Jam Sensor
                 </button>
                 <button onClick={() => handleUsePowerup('hint')} className="flex items-center gap-2 px-4 py-2 border border-[var(--forge-ember)]/30 bg-[var(--forge-ember)]/10 text-[var(--forge-ember)] hover:bg-[var(--forge-ember)]/20 transition-colors shadow-[0_0_10px_rgba(249,115,22,0.15)] font-mono text-sm uppercase tracking-wider">
                   <Zap className="w-4 h-4" /> Overclock
                 </button>
             </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: EDITOR ── */}
      <div className="w-full md:w-[60%] flex flex-col relative bg-[#0D1117]">
        
        {/* Editor Toolbar */}
        <div className="h-16 border-b border-[var(--forge-border)] bg-[var(--forge-bg)] flex items-center justify-between px-6 z-10 shadow-md">
          <div className="flex items-center gap-4">
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
            <div className="h-6 w-px bg-[var(--forge-border)] mx-2" />
            <button
               onClick={() => {
                 navigator.clipboard.writeText(id);
               }}
               className="flex items-center gap-2 px-3 py-1 bg-[#140b08] text-[var(--forge-steel)] hover:text-[var(--forge-white)] font-mono text-xs uppercase tracking-widest transition-colors border border-[var(--forge-ember)]/30 shadow-inner"
            >
               SIG: <span className="text-[var(--forge-white)]">{id.substring(0, 8)}</span>
            </button>
          </div>
          
          <ForgeButton 
            onClick={handleCancelDuel}
            variant="secondary"
            className="flex items-center gap-2 px-4 py-1.5 border-[var(--forge-red)]/50 text-[var(--forge-red)] hover:bg-[var(--forge-red)]/10 hover:text-[var(--forge-red)] font-mono text-xs uppercase shadow-none"
          >
            <Ban className="w-3.5 h-3.5" /> Abort
          </ForgeButton>
        </div>

        {/* Workspace */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={currentCode}
            onChange={(val) => setCodes(prev => ({ ...prev, [activeProblem?._id]: val }))}
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
            loading={<div className="flex items-center justify-center h-full text-[var(--forge-dim)] font-mono animate-pulse">Initializing execution runtime...</div>}
          />
        </div>

        {/* Forge Console */}
        <div className="h-[220px] shrink-0 border-t border-[var(--forge-border)] bg-[var(--forge-panel)] flex flex-col font-mono text-sm">
          <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--forge-border)] bg-[#11161B]">
            <div className="text-[10px] uppercase font-black tracking-widest text-[var(--forge-steel)]">Output Terminal</div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center text-[var(--forge-ember)] gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" /> 
                  <span className="uppercase tracking-widest text-xs font-bold">Executing combat payload...</span>
                </motion.div>
              ) : submitError ? (
                <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--forge-red)] text-xs border-l-2 border-[var(--forge-red)] pl-3">
                  [SYS_ERR] {submitError}
                </motion.div>
              ) : verdict ? (
                <motion.div key="verdict" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className={`font-black text-xl uppercase tracking-widest flex items-center gap-3 ${VERDICT_STYLE[verdict.verdict]?.color || 'text-[var(--forge-white)]'}`}>
                    {VERDICT_STYLE[verdict.verdict]?.icon}
                    {verdict.verdict}
                  </div>
                  {verdict.error && (
                    <div className="p-3 bg-[#1A1010] border border-[var(--forge-red)]/30 text-[var(--forge-red)] text-xs overflow-x-auto">
                      <pre>{verdict.error}</pre>
                    </div>
                  )}
                  {verdict.runtime && (
                    <div className="text-[10px] uppercase text-[var(--forge-steel)] tracking-widest">
                      Runtime Optimization: <span className="text-[var(--forge-white)]">{verdict.runtime}ms</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-[var(--forge-dim)] text-xs">
                  Awaiting instruction payload...
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-[var(--forge-border)] bg-[#0C1015] flex justify-end">
            <ForgeButton 
              onClick={handleSubmit} 
              disabled={isSubmitting || !activeProblem}
              variant="primary"
              className="px-8 py-2 font-black shadow-[0_0_15px_var(--forge-glow)] flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> [ DEPLOY ]
            </ForgeButton>
          </div>
        </div>
      </div>
    </div>
  );
}

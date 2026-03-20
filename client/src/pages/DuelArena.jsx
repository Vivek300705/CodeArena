import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import {
  Play, Send, Clock, Cpu, ChevronLeft,
  CheckCircle, XCircle, AlertCircle, Code2, Terminal, Loader2, Zap, Swords, Ban
} from 'lucide-react';
import { getDuel, triggerPowerup, cancelDuel } from '../services/duelService.js';
import { submitCode, getSubmissionById } from '../services/problemService.js';
import { useSocket } from '../hooks/useSocket.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript (Node.js)', ext: 'js' },
  { id: 'python',     name: 'Python 3',             ext: 'py' },
  { id: 'cpp',        name: 'C++ 17',               ext: 'cpp' },
  { id: 'java',       name: 'Java',                 ext: 'java' },
];

const DEFAULT_CODE = {
  javascript: '// Write your solution here\n',
  python:     '# Write your solution here\n',
  cpp:        '// Write your solution here\n',
  java:       '// Write your solution here\n',
};

const VERDICT_STYLE = {
  Accepted:            { color: 'text-green-500', icon: <CheckCircle className="w-5 h-5" /> },
  'Wrong Answer':      { color: 'text-red-400',   icon: <XCircle className="w-5 h-5" /> },
  'Runtime Error':     { color: 'text-red-400',   icon: <XCircle className="w-5 h-5" /> },
  'Time Limit Exceeded': { color: 'text-yellow-400', icon: <Clock className="w-5 h-5" /> },
};

export default function DuelArena() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  const [duelData, setDuelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);

  // Scoreboard state
  const [scores, setScores] = useState({}); // userId -> score
  const [opponentSubmissions, setOpponentSubmissions] = useState([]);

  // Editor State
  const [language, setLanguage] = useState('javascript');
  const [codes, setCodes] = useState({}); // problemId -> code string

  const activeProblem = duelData?.problems[activeProblemIndex]?.problem;
  const currentCode = activeProblem ? (codes[activeProblem._id] ?? "") : "";

  // Initialize boilerplate when switching problems or languages
  useEffect(() => {
    if (activeProblem && codes[activeProblem._id] === undefined) {
      const langMatch = language === 'javascript' ? 'node' : language;
      const bp = activeProblem.boilerplates?.find(b => b.language === langMatch || b.language === language);
      setCodes(prev => ({ ...prev, [activeProblem._id]: bp ? bp.code : DEFAULT_CODE[language] }));
    }
  }, [activeProblem, language, codes]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCodes({}); // Reset all local code to new language's boilerplates
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
        
        // Setup initial scores
        const newScores = {};
        data.duel.players.forEach(p => {
           if (p.user) newScores[p.user._id] = p.score;
        });
        
        // If active state exists in Redis, it overrides
        if (data.activeState) {
           newScores[data.activeState.player1] = parseInt(data.activeState.score1 || 0);
           newScores[data.activeState.player2] = parseInt(data.activeState.score2 || 0);
        }
        setScores(newScores);

        // Editor boilerplate is now handled by the useEffect above
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Socket setup
  const socketRef = useRef(null);
  
  const handleSocketEvents = useCallback((data, type) => {
    if (type === "submission_update") {
       if (!submissionIdRef.current || data.submissionId !== submissionIdRef.current) return;
       setVerdict(data);
       setIsSubmitting(false);
    } else if (type === "duel_score_update") {
       setScores(prev => ({ ...prev, [data.userId]: data.newScore }));
    } else if (type === "duel_submission_update") {
       // Opponent or current user submitted
       setOpponentSubmissions(prev => [data, ...prev].slice(0, 5));
    } else if (type === "powerup_used") {
       // Add visual effect
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
  }, []);

  const socket = useSocket((data) => handleSocketEvents(data, "submission_update"));

  useEffect(() => {
    if (socket && id) {
      socket.emit("join_duel", id);
      
      socket.on("duel_score_update", (data) => handleSocketEvents(data, "duel_score_update"));
      socket.on("duel_submission_update", (data) => handleSocketEvents(data, "duel_submission_update"));
      socket.on("powerup_used", (data) => handleSocketEvents(data, "powerup_used"));
      socket.on("match:start", (data) => handleSocketEvents(data, "match:start"));
      socket.on("duel_cancelled", (data) => handleSocketEvents(data, "duel_cancelled"));
      
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
      setSubmitError(err.response?.data?.message || 'Submission failed.');
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
    if (!window.confirm("Are you sure you want to cancel this duel?")) return;
    try {
       await cancelDuel(id);
       navigate("/duel");
    } catch (err) {
       console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading Duel Arena...</div>;
  if (!duelData) return <div className="p-8 text-center text-red-500">Duel not found</div>;

  const opponents = duelData.players.map(p => p.user);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background overflow-hidden">
      
      {/* Left Panel: Duel Status & Problem Description */}
      <div className="w-full h-1/2 md:w-1/2 md:h-full flex flex-col border-r border-white/5 bg-surface/30">
        
        {/* Scoreboard Header */}
        <div className="p-4 border-b border-white/5 bg-surface/50 grid grid-cols-3 gap-4 items-center">
            {/* Player 1 */}
            <div className="text-center bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="text-sm font-bold text-white truncate">{opponents[0]?.username || "Player 1"}</div>
                <div className="text-2xl font-black text-primary">{scores[opponents[0]?._id] || 0}</div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
                <Swords className="w-8 h-8 text-red-500 mb-1" />
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">VS</span>
            </div>

            {/* Player 2 */}
            <div className={`text-center p-2 rounded-xl border transition-all ${opponents[1] ? 'bg-white/5 border-white/10' : 'bg-blue-500/5 border-blue-500/20 border-dashed animate-pulse'}`}>
                <div className="text-sm font-bold text-white truncate">
                  {opponents[1]?.username || "Waiting..."}
                </div>
                <div className="text-2xl font-black text-blue-500">
                  {opponents[1] ? (scores[opponents[1]?._id] || 0) : "-"}
                </div>
            </div>
        </div>

        {/* Problem Tabs */}
        <div className="flex border-b border-white/5">
            {duelData.problems.map((p, i) => (
                <button
                    key={p.problem._id}
                    onClick={() => setActiveProblemIndex(i)}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${
                        i === activeProblemIndex ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                    }`}
                >
                    P{i+1}: {p.problem.title.substring(0, 10)}...
                </button>
            ))}
        </div>

        {/* Problem Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-zinc-300">
          <div className="flex gap-3 mb-6">
             <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border text-zinc-400 bg-white/5 border-white/10">{activeProblem?.difficulty}</span>
             {(activeProblem?.tags || []).map(tag => (
                 <span key={tag} className="text-xs px-2.5 py-1 text-zinc-400 bg-white/5 border border-white/10 rounded-full">
                     {tag}
                 </span>
             ))}
          </div>

          <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed">
             {(activeProblem?.description || '').split('\n\n').map((paragraph, i) => (
                 <p key={i} className="mb-4">{paragraph}</p>
             ))}

             {(activeProblem?.examples || []).length > 0 && (
                 <>
                     <h3 className="text-white font-bold text-lg mt-8 mb-4">Examples:</h3>
                     <div className="space-y-6">
                         {activeProblem.examples.map((ex, i) => (
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
                    <div className="font-mono text-sm mt-0.5">{activeProblem?.timeLimit || 1000}s</div>
                  </div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-3">
                  <Cpu className="text-purple-400 w-5 h-5" />
                  <div>
                    <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Memory Limit</div>
                    <div className="font-mono text-sm mt-0.5">{activeProblem?.memoryLimit || 256} MB</div>
                  </div>
                </div>
             </div>
          </div>
          {/* Powerups Panel */}
          <div className="mt-8 pt-8 border-t border-white/5">
             <h3 className="text-sm font-bold text-zinc-500 mb-4 uppercase">Powerups</h3>
             <div className="flex gap-2">
                 <button onClick={() => handleUsePowerup('freeze')} className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm hover:bg-cyan-500/20"><Zap className="w-4 h-4 inline mr-1"/> Freeze</button>
                 <button onClick={() => handleUsePowerup('hint')} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-sm hover:bg-yellow-500/20 text-sm">Hint</button>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Editor & Console */}
      <div className="w-full h-1/2 md:w-1/2 md:h-full flex flex-col">
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-white/5 bg-background flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-sm font-medium outline-none text-zinc-300 hover:text-white cursor-pointer"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id} className="bg-surface text-foreground">{lang.name}</option>
              ))}
            </select>
            <div className="h-4 w-px bg-white/10" />
            <button
               onClick={() => {
                 navigator.clipboard.writeText(id);
                 alert("Room code copied!");
               }}
               className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-xs font-bold transition-colors border border-white/10"
            >
               Code: <span className="text-primary">{id.substring(0, 8)}...</span>
            </button>
          </div>
          <button 
            onClick={handleCancelDuel}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-colors border border-red-500/20"
          >
            <Ban className="w-3.5 h-3.5" /> Cancel Duel
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={currentCode}
            onChange={(val) => setCodes(prev => ({ ...prev, [activeProblem._id]: val }))}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>

        {/* Console */}
        <div className="h-[200px] border-t border-white/5 bg-background flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface/30 text-sm font-medium text-zinc-400">
            Console
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
             {isSubmitting ? (
              <div className="flex items-center text-zinc-500 gap-3"><Loader2 className="w-4 h-4 animate-spin text-primary" /> Judging...</div>
            ) : submitError ? (
              <div className="text-red-400">{submitError}</div>
            ) : verdict ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={`font-bold text-lg flex items-center gap-2 ${VERDICT_STYLE[verdict.verdict]?.color || 'text-zinc-300'}`}>
                  {verdict.verdict}
                </div>
              </motion.div>
            ) : null}
          </div>
          <div className="p-3 border-t border-white/5 bg-surface/30 flex justify-end gap-3">
             <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-primary text-white rounded-lg font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2">
                <Send className="w-4 h-4" /> Submit
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

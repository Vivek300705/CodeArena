import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useNavigate } from 'react-router-dom';
import { Swords, History, Play, Users, Clock, Trophy, ChevronRight, Zap, Shield, Target } from 'lucide-react';
import { getDuelHistory, challengeUser, acceptChallenge } from '../services/duelService.js';
import { motion } from 'framer-motion';
import ForgeButton from '../components/ForgeButton.jsx';
import DifficultyBadge from '../components/DifficultyBadge.jsx';

export default function DuelDashboard() {
  useDocumentTitle('Duel Arena | CodeArena');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [challengeId, setChallengeId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getDuelHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateChallenge = async () => {
    setIsCreating(true);
    try {
      const { duelId } = await challengeUser();
      navigate(`/duel/${duelId}`);
    } catch {
      alert('Failed to forge standard match. Engine timeout.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptChallenge = async (e) => {
    e.preventDefault();
    if (!challengeId) return;
    try {
      await acceptChallenge(challengeId);
      navigate(`/duel/${challengeId}`);
    } catch {
      alert('Failed to connect to the arena signature.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 font-ui">
      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative mb-12 border border-[var(--forge-border)] bg-[var(--forge-panel)] p-8 md:p-12 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--forge-ember)] blur-[120px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-1000" />
        <div className="absolute top-0 left-0 w-2 h-full bg-[var(--forge-ember)] shadow-[0_0_15px_var(--forge-glow)]" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-3 px-3 py-1 mb-6 border border-[var(--forge-ember)] bg-[#140b08] text-[var(--forge-ember)] font-display font-black text-xs uppercase tracking-widest shadow-[inset_0_0_10px_var(--forge-glow)]">
              <span className="w-2 h-2 rounded-full bg-[var(--forge-ember)] animate-pulse" />
              Live Arena Mode
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display text-[var(--forge-white)] mb-4 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              Proving <span className="text-[var(--forge-ember)] drop-shadow-[0_0_15px_var(--forge-glow)]">Grounds</span>
            </h1>
            <p className="text-[var(--forge-steel)] text-lg max-w-xl font-mono leading-relaxed">
              Challenge a rival. Solve the algorithms faster. Claim the rank. 
              The forge waits for no one.
            </p>
          </div>

          <div className="border border-[var(--forge-border)] bg-[#0C1015] p-5 flex items-center gap-6 shadow-inner shrink-0 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
              <Target className="w-32 h-32 text-[var(--forge-white)]" />
            </div>
            
            <div className="text-center">
              <div className="text-[var(--forge-dim)] font-black text-[10px] tracking-widest uppercase mb-1 drop-shadow-sm">Format</div>
              <div className="text-[var(--forge-white)] font-bold text-lg font-mono tracking-wider">1 V 1</div>
            </div>
            <div className="w-[1px] h-10 bg-[var(--forge-border)]" />
            <div className="text-center">
              <div className="text-[var(--forge-dim)] font-black text-[10px] tracking-widest uppercase mb-1 drop-shadow-sm">Payload</div>
              <div className="text-[var(--forge-ember)] font-bold text-lg font-mono drop-shadow-[0_0_5px_var(--forge-glow)] tracking-wider">3 PROB</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── ACTIONS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Create Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="border border-[var(--forge-border)] bg-[var(--forge-panel)] p-8 h-full flex flex-col items-start relative group overflow-hidden transition-all hover:border-[var(--forge-steel)] hover:bg-[#11161B]">
            <div className="absolute right-0 top-0 text-[180px] text-[var(--forge-border)] opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all pointer-events-none leading-none -mt-8 -mr-8 font-black font-display">
              1
            </div>
            
            <div className="w-12 h-12 flex items-center justify-center border border-[var(--forge-ember)] bg-[#140b08] mb-6 shadow-[0_0_15px_var(--forge-glow)]">
              <Zap className="w-6 h-6 text-[var(--forge-ember)]" />
            </div>
            <h2 className="text-2xl font-black font-display text-[var(--forge-white)] mb-3 uppercase tracking-widest relative z-10">
              Forge a Match
            </h2>
            <p className="text-[var(--forge-steel)] text-sm mb-8 font-mono leading-relaxed relative z-10 max-w-[85%]">
              Initialize a new duel instance. You will receive a secure match signature to transmit to your opponent.
            </p>
            
            <div className="mt-auto w-full relative z-10">
              <ForgeButton 
                onClick={handleCreateChallenge}
                disabled={isCreating}
                variant="primary"
                className="w-full flex justify-between items-center px-6 py-4"
              >
                <span className="font-mono text-sm uppercase tracking-widest">{isCreating ? 'Compiling instance...' : 'Initialize'}</span>
                {isCreating ? <div className="w-4 h-4 bg-white animate-pulse" /> : <Play className="w-4 h-4" />}
              </ForgeButton>
            </div>
          </div>
        </motion.div>

        {/* Join Card */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="border border-[var(--forge-border)] bg-[var(--forge-panel)] p-8 h-full flex flex-col items-start relative group overflow-hidden transition-all hover:border-[var(--forge-steel)] hover:bg-[#11161B]">
            <div className="absolute right-0 top-0 text-[180px] text-[var(--forge-border)] opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all pointer-events-none leading-none -mt-8 -mr-8 font-black font-display">
              2
            </div>

            <div className="w-12 h-12 flex items-center justify-center border border-[#7e22ce] bg-[#1d122e] mb-6 shadow-[0_0_15px_rgba(126,34,206,0.3)]">
              <Shield className="w-6 h-6 text-[#c084fc]" />
            </div>
            <h2 className="text-2xl font-black font-display text-[var(--forge-white)] mb-3 uppercase tracking-widest relative z-10">
              Intercept Match
            </h2>
            <p className="text-[var(--forge-steel)] text-sm mb-8 font-mono leading-relaxed relative z-10 max-w-[85%]">
              Received a match signature? Paste it below to immediately breach the arena and commence the challenge.
            </p>

            <form onSubmit={handleAcceptChallenge} className="mt-auto w-full relative z-10 flex gap-3">
              <input
                type="text"
                placeholder="> INJECT SIGNATURE_"
                value={challengeId}
                onChange={(e) => setChallengeId(e.target.value)}
                className="flex-1 bg-[#0A0D12] border border-[var(--forge-border)] text-[var(--forge-white)] font-mono text-xs px-4 py-3 outline-none focus:border-[var(--forge-steel)] transition-colors placeholder:text-[var(--forge-dim)]"
              />
              <ForgeButton 
                type="submit"
                disabled={!challengeId.trim()}
                variant="secondary"
                className="px-6 shrink-0"
              >
                <span className="font-mono text-sm uppercase tracking-widest">Connect</span>
              </ForgeButton>
            </form>
          </div>
        </motion.div>
      </div>

      {/* ── HISTORY ── */}
      <div>
        <h3 className="text-[var(--forge-dim)] font-bold text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-3 font-display">
          <History className="w-4 h-4" /> Combat Logs
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-[var(--forge-panel)] border border-[var(--forge-border)] animate-pulse" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((match, i) => {
              const date = new Date(match.createdAt).toLocaleDateString();
              const isWin = match.winner;
              return (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/duel/${match._id}`)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[var(--forge-border)] bg-[var(--forge-panel)] hover:border-[var(--forge-steel)] hover:bg-[#11161B] hover:-translate-y-[1px] cursor-pointer transition-all relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] opacity-0 group-hover:opacity-100 transition-opacity ${isWin ? 'bg-[var(--forge-ember)] shadow-[0_0_8px_var(--forge-glow)]' : 'bg-[var(--forge-steel)]'}`} />
                  
                  <div className="flex items-center gap-4 pl-2 mb-4 sm:mb-0">
                    <div className={`w-10 h-10 flex items-center justify-center border ${isWin ? 'border-[var(--forge-ember)] bg-[#140b08]' : 'border-[var(--forge-border)] bg-[#0C1015]'}`}>
                      <Swords className={`w-5 h-5 ${isWin ? 'text-[var(--forge-ember)]' : 'text-[var(--forge-steel)]'}`} />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--forge-white)] flex items-center gap-3">
                        {isWin ? (match.winner.username || 'Victory') : 'Unresolved Combat'}
                        {isWin && <span className="text-[8px] font-black border border-[var(--forge-ember)]/30 text-[var(--forge-ember)] px-1.5 bg-[var(--forge-ember)]/10 font-mono tracking-widest hidden sm:inline-block">WINNER</span>}
                      </div>
                      <div className="text-xs text-[var(--forge-dim)] font-mono mt-0.5">Instance: #{match._id.slice(-6).toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between sm:justify-end pl-2 sm:pl-0">
                    <div className="text-right">
                      <div className="text-[10px] font-black text-[var(--forge-dim)] tracking-widest uppercase mb-0.5">Stardate</div>
                      <div className="text-[var(--forge-steel)] font-mono text-xs">{date}</div>
                    </div>
                    <DifficultyBadge difficulty={match.status === 'completed' ? 'ARCHIVED' : 'ACTIVE_TARGET'} glow={false} />
                    <ChevronRight className="w-5 h-5 text-[var(--forge-dim)] group-hover:text-[var(--forge-ember)] group-hover:translate-x-1 transition-all hidden sm:block" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-[var(--forge-border)] border-dashed bg-[var(--forge-panel)]">
            <Swords className="w-12 h-12 text-[var(--forge-border)] mx-auto mb-4" />
            <div className="text-[var(--forge-white)] font-bold mb-2">No Combat Data Found</div>
            <p className="text-[var(--forge-steel)] text-sm font-mono">Initialize a match to register your first combat log.</p>
          </div>
        )}
      </div>
    </div>
  );
}

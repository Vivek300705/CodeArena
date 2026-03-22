import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useNavigate, Link } from 'react-router-dom';
import { Swords, History, Play, Users, Clock, Trophy, ChevronRight, Zap, Shield } from 'lucide-react';
import { getDuelHistory, challengeUser, acceptChallenge } from '../services/duelService.js';
import { motion, AnimatePresence } from 'framer-motion';
import GlowCard from '../components/ui/GlowCard.jsx';
import { staggerContainer, fadeUp } from '../animations/variants.js';

function EmberParticles() {
  const particles = Array.from({ length: 12 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-0"
          style={{
            left: `${10 + i * 7}%`,
            bottom: `${Math.random() * 30}%`,
            background: i % 2 === 0 ? '#f97316' : '#ef4444',
            boxShadow: '0 0 6px currentColor',
            animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.4 + (i % 3) * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export default function DuelDashboard() {
  useDocumentTitle('Duels');
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
      alert('Failed to create match');
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
      alert('Failed to join match');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative mb-12 rounded-2xl overflow-hidden border border-ember/15 p-8 md:p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(239,68,68,0.05) 50%, rgba(5,5,15,0.9) 100%)',
          boxShadow: '0 0 60px rgba(249,115,22,0.06)',
        }}
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[60px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.1) 0%, transparent 70%)' }} />

        <EmberParticles />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ember/25 bg-ember/8 text-ember text-xs font-bold uppercase tracking-widest mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Live Matchmaking
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-3">
              CodeArena{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                Duel Mode
              </span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl">
              Challenge a player, solve problems faster, and climb the arena rankings.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-ember/20 bg-ember/5">
              <Swords className="w-6 h-6 text-ember" />
              <div>
                <div className="text-xs text-zinc-500 uppercase font-bold">Mode</div>
                <div className="font-bold text-white">1 v 1</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-xs text-zinc-500 uppercase font-bold">Problems</div>
                <div className="font-bold text-white">3 / Match</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Match Cards ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
      >
        {/* Create Match */}
        <motion.div variants={fadeUp}>
          <GlowCard variant="ember" className="border border-ember/15 p-8 relative overflow-hidden h-full group">
            <div className="absolute top-4 right-4 opacity-8 group-hover:opacity-15 transition-opacity">
              <Play className="w-28 h-28 text-ember" />
            </div>
            <div className="p-3 rounded-xl bg-ember/10 border border-ember/20 inline-flex mb-5">
              <Zap className="w-6 h-6 text-ember" />
            </div>
            <h2 className="text-2xl font-black font-display text-white mb-3">Start a Match</h2>
            <p className="text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed">
              Create a new duel room with 3 curated problems. Share the room code and battle your opponent in real-time.
            </p>
            <motion.button
              onClick={handleCreateChallenge}
              disabled={isCreating}
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(249,115,22,0.3)' }}
              whileTap={{ scale: 0.97 }}
              className="btn-shimmer px-8 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', boxShadow: '0 0 20px rgba(249,115,22,0.2)' }}
            >
              {isCreating ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                <><Play className="w-4 h-4" /> Create Room</>
              )}
            </motion.button>
          </GlowCard>
        </motion.div>

        {/* Join Match */}
        <motion.div variants={fadeUp}>
          <GlowCard variant="purple" className="border border-plasma/15 p-8 relative overflow-hidden h-full group">
            <div className="absolute top-4 right-4 opacity-8 group-hover:opacity-15 transition-opacity">
              <Users className="w-28 h-28 text-plasma" />
            </div>
            <div className="p-3 rounded-xl bg-plasma/10 border border-plasma/20 inline-flex mb-5">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-black font-display text-white mb-3">Join Match</h2>
            <p className="text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed">
              Have a room code? Enter it below to join the battle immediately and prove your skills.
            </p>
            <form onSubmit={handleAcceptChallenge} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter Room Code..."
                value={challengeId}
                onChange={(e) => setChallengeId(e.target.value)}
                className="input-glow flex-1 text-sm"
              />
              <motion.button
                type="submit"
                disabled={!challengeId.trim()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-3 rounded-xl font-bold text-white border border-plasma/30 bg-plasma/10 hover:bg-plasma/20 transition-all disabled:opacity-40 text-sm"
              >
                Join
              </motion.button>
            </form>
          </GlowCard>
        </motion.div>
      </motion.div>

      {/* ── Match History ── */}
      <div>
        <h2 className="text-2xl font-black font-display text-white mb-6 flex items-center gap-3">
          <History className="w-5 h-5 text-zinc-500" /> Match History
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : history.length > 0 ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            {history.map((match, i) => (
              <motion.div
                key={match._id}
                variants={fadeUp}
                className="flex items-center justify-between p-5 rounded-xl border border-white/6 hover:border-white/10 transition-all group cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.025)' }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${match.winner ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-zinc-800 border border-white/5'}`}>
                    <Trophy className={`w-4 h-4 ${match.winner ? 'text-yellow-400' : 'text-zinc-600'}`} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {match.winner ? (match.winner.username || 'Victory') : 'Draw / Pending'}
                    </div>
                    <div className="text-xs text-zinc-600 font-mono mt-0.5">{new Date(match.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    match.status === 'completed' ? 'badge-accepted' : 'badge-pending'
                  }`}>{match.status}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed border-white/8"
            style={{ background: 'rgba(255,255,255,0.015)' }}>
            <Swords className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No matches yet</h3>
            <p className="text-zinc-500 text-sm">Create or join a duel to start your battle history.</p>
          </div>
        )}
      </div>
    </div>
  );
}

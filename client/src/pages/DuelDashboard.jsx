import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, History, Play, Users, Clock, Trophy } from 'lucide-react';
import { getDuelHistory, challengeUser, acceptChallenge } from '../services/duelService.js';
import { motion } from 'framer-motion';

export default function DuelDashboard() {
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
      const { duelId } = await challengeUser(); // Random match
      navigate(`/duel/${duelId}`);
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
      alert('Failed to join match');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold">
            <Swords className="w-4 h-4" /> Real-time Matches
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            CodeArena <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Duel Mode</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Challenge players, solve problems faster, and earn rating points.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Create Match */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-surface/50 border border-white/5 p-8 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Play className="w-32 h-32" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Start a Match</h2>
          <p className="text-zinc-400 mb-8 max-w-sm">
            Create a new duel room with 3 curated problems and invite an opponent to join.
          </p>
          <button
            onClick={handleCreateChallenge}
            disabled={isCreating}
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </motion.div>

        {/* Join Match */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-surface/50 border border-white/5 p-8 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-32 h-32" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Join Match</h2>
          <p className="text-zinc-400 mb-8 max-w-sm">
            Have a room code? Enter it below to join the battle immediately.
          </p>
          <form onSubmit={handleAcceptChallenge} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Room Code"
              value={challengeId}
              onChange={(e) => setChallengeId(e.target.value)}
              className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={!challengeId.trim()}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              Join
            </button>
          </form>
        </motion.div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <History className="w-6 h-6 text-zinc-400" /> Match History
        </h2>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((match) => (
              <div key={match._id} className="bg-surface/30 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm text-zinc-500 mb-1">{new Date(match.createdAt).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2">
                    <Trophy className={`w-4 h-4 ${match.winner ? 'text-yellow-500' : 'text-zinc-500'}`} />
                    <span className="font-bold text-white">
                      {match.winner ? (match.winner.username || 'You Won!') : 'Draw / Pending'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400">
                    Status: <span className="uppercase">{match.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface/30 rounded-xl border border-white/5 border-dashed">
            <Clock className="w-12 h-12 text-zinc-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No history</h3>
            <p className="text-zinc-400">You haven't played any duels yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

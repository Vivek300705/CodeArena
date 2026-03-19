import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Loader2, AlertCircle, RefreshCw, User, Star } from 'lucide-react';
import { getLeaderboard, getMyRank } from '../services/leaderboardService.js';
import { useAuthStore } from '../store/useAuthStore.js';

const MEDAL_COLORS = {
  1: 'text-yellow-400',
  2: 'text-slate-300',
  3: 'text-amber-600',
};

const getRankStyle = (rank) => {
  if (rank === 1) return 'bg-yellow-400/10 border-yellow-400/30';
  if (rank === 2) return 'bg-slate-400/10 border-slate-400/20';
  if (rank === 3) return 'bg-amber-600/10 border-amber-600/20';
  return 'bg-white/5 border-white/5';
};

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cached, setCached] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    const promises = [getLeaderboard(50)];
    if (isAuthenticated) promises.push(getMyRank());

    Promise.all(promises)
      .then(([lb, rank]) => {
        setEntries(lb.data || []);
        setCached(lb.cached);
        if (rank) setMyRank(rank);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [isAuthenticated]);

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Trophy className="w-9 h-9 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-zinc-400 mt-1">
            Top coders ranked by accepted problems.{' '}
            {cached && <span className="text-xs text-zinc-600">(cached)</span>}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* My Rank Card — only shown when logged in */}
      {isAuthenticated && myRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-semibold text-white">Your Rank</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-mono">
            <span className="text-zinc-400">
              #{myRank.rank ?? '—'}
            </span>
            <span className="text-primary font-bold text-base">
              {myRank.score ?? 0} pts
            </span>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-600 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            Loading rankings…
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            No scores yet. Be the first to solve a problem!
          </div>
        ) : (
          <AnimatePresence>
            {entries.map((entry, idx) => {
              const isMe = user && (user._id === entry.userId || user.id === entry.userId);
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                  className={`flex items-center px-6 py-4 border-b border-white/5 last:border-0 transition-colors ${getRankStyle(entry.rank)} ${isMe ? 'ring-1 ring-primary/40' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-12 text-center">
                    {entry.rank <= 3 ? (
                      <Medal className={`w-5 h-5 mx-auto ${MEDAL_COLORS[entry.rank]}`} />
                    ) : (
                      <span className="text-sm font-bold text-zinc-500">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar placeholder + User ID */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-white/70" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-zinc-200 font-mono truncate max-w-[200px]">
                        {isMe ? (
                          <span className="text-primary">{entry.userId} <span className="text-xs">(you)</span></span>
                        ) : entry.userId}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className={`text-lg font-bold font-mono ${entry.rank <= 3 ? MEDAL_COLORS[entry.rank] : 'text-zinc-200'}`}>
                      {entry.score}
                    </div>
                    <div className="text-xs text-zinc-600">pts</div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Footer */}
        {!loading && entries.length > 0 && (
          <div className="px-6 py-3 bg-background/50 border-t border-white/5 text-xs text-zinc-600 text-center">
            Showing top {entries.length} users • Updated every 60 seconds
          </div>
        )}
      </div>
    </div>
  );
}

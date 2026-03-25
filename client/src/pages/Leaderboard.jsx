import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Loader2, AlertCircle, RefreshCw, User, Star, Crown } from 'lucide-react';
import { getLeaderboard, getMyRank } from '../services/leaderboardService.js';
import { useAuthStore } from '../store/useAuthStore.js';
import ForgeButton from '../components/ForgeButton.jsx';

const RANK_COLORS = {
  1: 'text-[#fbbf24] drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]', // Gold
  2: 'text-[#e2e8f0] drop-shadow-[0_0_8px_rgba(226,232,240,0.3)]', // Silver
  3: 'text-[#b45309] drop-shadow-[0_0_8px_rgba(180,83,9,0.4)]',   // Bronze
};

const getRowStyle = (rank, isMe) => {
  let base = 'transition-colors border-b border-[var(--forge-border)] hover:bg-[#11161B] relative overflow-hidden group ';
  if (isMe) base += 'bg-[#11161B] border-l-2 border-l-[var(--forge-ember)] ';
  else base += 'bg-[var(--forge-panel)] border-l-2 border-l-transparent ';
  if (rank === 1) base += 'shadow-[inset_0_4px_20px_rgba(251,191,36,0.03)] ';
  return base;
};

export default function Leaderboard() {
  useDocumentTitle('Leaderboard | CodeArena');
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
      .catch((err) => setError(err.response?.data?.message || 'Transmission failed. Failed to load leaderboard.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [isAuthenticated]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl font-ui">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-[var(--forge-ember)] blur-[120px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-3 py-1 mb-4 border border-[var(--forge-ember)] bg-[#140b08] text-[var(--forge-ember)] font-display font-black text-[10px] uppercase tracking-[0.2em] shadow-[inset_0_0_10px_var(--forge-glow)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--forge-ember)] animate-pulse" />
             Global Ranking
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display text-[var(--forge-white)] mb-2 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] flex items-center gap-4">
            <Trophy className="w-10 h-10 text-[var(--forge-ember)] drop-shadow-[0_0_15px_var(--forge-glow)]" />
            Hall of <span className="text-[var(--forge-ember)]">Forge</span>
          </h1>
          <p className="text-[var(--forge-steel)] text-sm font-mono tracking-wide">
            Top operatives ranked by successfully integrated core solutions.{' '}
            {cached && <span className="text-xs text-[var(--forge-dim)]">[CACHE_HIT]</span>}
          </p>
        </div>

        <ForgeButton
          onClick={fetchData}
          disabled={loading}
          variant="secondary"
          className="shrink-0 flex items-center gap-2 group relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[var(--forge-ember)]' : 'text-[var(--forge-steel)] group-hover:text-[var(--forge-white)]'}`} />
          <span>SYNC</span>
        </ForgeButton>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-[#1A1010] border-l-2 border-[var(--forge-red)] text-[var(--forge-red)] flex items-center gap-3 font-mono text-xs uppercase tracking-widest shadow-[inset_0_0_10px_rgba(239,68,68,0.05)]">
          <AlertCircle className="w-4 h-4 shrink-0" /> [SYS_ERR] {error}
        </div>
      )}

      {/* ── MY RANK ── */}
      {isAuthenticated && myRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-[#11161B] border border-[var(--forge-ember)] p-1 flex items-stretch shadow-[0_0_20px_rgba(249,115,22,0.05)] relative overflow-hidden"
        >
          <div className="w-1.5 bg-[var(--forge-ember)] shadow-[0_0_10px_var(--forge-glow)]" />
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 relative z-10">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="w-12 h-12 flex items-center justify-center border border-[var(--forge-ember)]/30 bg-[#140b08]">
                <Star className="w-6 h-6 text-[var(--forge-ember)] drop-shadow-[0_0_5px_var(--forge-glow)]" />
              </div>
              <div>
                <div className="text-[10px] font-black text-[var(--forge-dim)] tracking-[0.2em] uppercase mb-1">Operative Rank</div>
                <div className="text-[var(--forge-white)] font-bold text-lg font-mono">YOUR POSITION</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-[10px] font-black text-[var(--forge-dim)] tracking-[0.2em] uppercase mb-1">Payload Output</div>
                <div className="text-[var(--forge-steel)] font-bold text-2xl font-mono">{myRank.score ?? 0} <span className="text-xs">PTS</span></div>
              </div>
              <div className="w-px h-10 bg-[var(--forge-border)]" />
              <div className="text-center min-w-[80px]">
                <div className="text-[10px] font-black text-[var(--forge-dim)] tracking-[0.2em] uppercase mb-1">Global Pos</div>
                <div className="text-[var(--forge-ember)] font-black text-3xl font-display drop-shadow-[0_0_5px_var(--forge-glow)]">#{myRank.rank ?? '—'}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── LEADERBOARD GRID ── */}
      <div className="bg-[#0A0D11] border border-[var(--forge-border)] shadow-xl relative z-10">
        
        {/* Table Header */}
        <div className="grid grid-cols-[80px_1fr_100px] gap-4 px-6 py-4 border-b border-[var(--forge-steel)] bg-[#11161B] text-[10px] font-black tracking-[0.2em] uppercase text-[var(--forge-dim)]">
          <div className="text-center">RANK</div>
          <div>OPERATIVE</div>
          <div className="text-right">SCORE</div>
        </div>

        {/* Table Body */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[var(--forge-dim)] font-mono text-xs uppercase tracking-widest gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--forge-ember)]" />
              Syncing global rankings...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-24 text-center text-[var(--forge-dim)] font-mono text-xs uppercase tracking-widest">
              [ NO COMBAT DATA RECORDED ]
            </div>
          ) : (
            <AnimatePresence>
              {entries.map((entry, idx) => {
                const isMe = user && (user._id === entry.userId || user.id === entry.userId);
                
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                    className={getRowStyle(entry.rank, isMe)}
                  >
                    <div className="grid grid-cols-[80px_1fr_100px] gap-4 px-6 py-4 items-center">
                      
                      {/* Rank */}
                      <div className="text-center font-display font-black text-xl">
                        {entry.rank === 1 ? (
                          <Crown className={`w-6 h-6 mx-auto ${RANK_COLORS[1]}`} />
                        ) : entry.rank === 2 || entry.rank === 3 ? (
                          <Medal className={`w-6 h-6 mx-auto ${RANK_COLORS[entry.rank]}`} />
                        ) : (
                          <span className="text-[var(--forge-steel)]">#{entry.rank}</span>
                        )}
                      </div>

                      {/* Operative */}
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 flex items-center justify-center border ${isMe ? 'border-[var(--forge-ember)] bg-[#140b08]' : 'border-[var(--forge-border)] bg-[#0C1015]'}`}>
                          <User className={`w-5 h-5 ${isMe ? 'text-[var(--forge-ember)]' : 'text-[var(--forge-steel)]'}`} />
                        </div>
                        <div>
                          <div className={`font-bold font-mono tracking-tight text-base truncate max-w-[200px] md:max-w-xs ${isMe ? 'text-[var(--forge-ember)]' : 'text-[var(--forge-white)]'}`}>
                            {entry.username || "UNKNOWN_OP"}
                          </div>
                          {isMe && <div className="text-[8px] tracking-[0.2em] font-black uppercase text-[var(--forge-ember)] hidden sm:block">CURRENT SESSION</div>}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className={`text-xl font-bold font-mono ${entry.rank <= 3 ? RANK_COLORS[entry.rank] : 'text-[var(--forge-steel)]'}`}>
                          {entry.score}
                        </div>
                        <div className="text-[10px] text-[var(--forge-dim)] uppercase tracking-widest font-black">
                          PTS
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Footer */}
          {!loading && entries.length > 0 && (
            <div className="px-6 py-4 bg-[#0A0D11] border-t border-[var(--forge-border)] text-[10px] font-black text-[var(--forge-dim)] tracking-widest uppercase flex justify-between">
              <span>TOP {entries.length} OPERATIVES</span>
              <span>SYNC RATE: 60s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

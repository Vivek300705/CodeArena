import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore.js';
import { Code2, Target, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubmissions } from '../services/problemService.js';
import { getMyRank } from '../services/leaderboardService.js';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [submissions, setSubmissions] = useState([]);
  const [rankData, setRankData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.allSettled([getSubmissions(), getMyRank()])
      .then(([subsResult, rankResult]) => {
        if (subsResult.status === 'fulfilled') setSubmissions(subsResult.value || []);
        if (rankResult.status === 'fulfilled') setRankData(rankResult.value);
      })
      .finally(() => setLoadingStats(false));
  }, []);

  const accepted = submissions.filter((s) => s.verdict === 'Accepted');
  const uniqueSolved = new Set(accepted.map((s) => s.problemId?._id || s.problemId)).size;
  const recent = submissions.slice(0, 3);

  const stats = [
    { label: 'Problems Solved', value: loadingStats ? '—' : uniqueSolved, icon: <CheckCircle className="text-green-500 w-6 h-6" /> },
    { label: 'Global Rank', value: loadingStats ? '—' : rankData?.rank ? `#${rankData.rank}` : 'Unranked', icon: <Target className="text-primary w-6 h-6" /> },
    { label: 'Total Submissions', value: loadingStats ? '—' : submissions.length, icon: <Clock className="text-zinc-400 w-6 h-6" /> },
  ];

  const LANG_DISPLAY = { python: 'Python 3', javascript: 'JavaScript', node: 'Node.js', cpp: 'C++', c: 'C', java: 'Java', go: 'Go', rust: 'Rust' };
  const timeAgo = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
            {user?.name || user?.username || 'Challenger'}
          </span>
        </h1>
        <p className="text-zinc-400 text-lg">Here's your progress overview.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-surface/50 border border-white/5 backdrop-blur-sm flex items-center gap-5 hover:border-white/10 transition-colors"
          >
            <div className="p-4 bg-background rounded-full shadow-inner border border-white/5">{stat.icon}</div>
            <div>
              <p className="text-sm text-zinc-400 font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">
                {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lower grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface/30 border border-white/5 rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Recent Submissions
            </h2>
            <Link to="/history" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">View all</Link>
          </div>
          <div className="space-y-3">
            {loadingStats ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : recent.length === 0 ? (
              <p className="text-zinc-600 text-sm py-4 text-center">
                No submissions yet.{' '}
                <Link to="/problems" className="text-primary">Start solving!</Link>
              </p>
            ) : (
              recent.map((s) => (
                <div key={s._id} className="flex flex-wrap gap-2 justify-between items-center p-3 bg-background/50 rounded-xl border border-white/5">
                  <div>
                    <h4 className="font-semibold text-zinc-200 text-sm">{s.problemId?.title || 'Unknown Problem'}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {LANG_DISPLAY[s.language] || s.language} • {timeAgo(s.createdAt)}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    s.verdict === 'Accepted'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {s.verdict || s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface/30 border border-white/5 rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" /> Quick Links
            </h2>
            <Link to="/problems" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">Explore</Link>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Duel Mode', desc: 'Real-time competitive coding', to: '/duel' },
              { title: 'Browse Problems', desc: 'Find your next challenge', to: '/problems' },
              { title: 'Leaderboard', desc: 'See where you rank globally', to: '/leaderboard' },
            ].map(({ title, desc, to }, i) => (
              <Link
                key={i}
                to={to}
                className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="p-2 bg-surface rounded-lg border border-white/5 group-hover:border-primary/20">
                  <Code2 className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-sm group-hover:text-white transition-colors">{title}</h4>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

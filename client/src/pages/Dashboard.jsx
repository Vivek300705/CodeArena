import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore.js';
import { Code2, Target, CheckCircle, Clock, Loader2, Zap, TrendingUp, Activity, ChevronRight, Swords, Trophy, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubmissions } from '../services/problemService.js';
import { getMyRank } from '../services/leaderboardService.js';
import GlowCard from '../components/ui/GlowCard.jsx';
import { staggerContainer, fadeUp, fadeLeft, fadeRight } from '../animations/variants.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const LANG_DISPLAY = { python: 'Python', javascript: 'JS', node: 'Node.js', cpp: 'C++', c: 'C', java: 'Java', go: 'Go', rust: 'Rust' };

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ProgressRing({ value, max, size = 100, strokeWidth = 7, color = '#00f5ff' }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
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
  const recent = submissions.slice(0, 5);
  const username = user?.name || user?.username || 'Challenger';
  const initial = username[0].toUpperCase();

  const stats = [
    { label: 'Problems Solved', value: uniqueSolved, icon: <CheckCircle className="w-5 h-5" />, color: 'green', glow: 'rgba(34,197,94,0.12)', textColor: 'text-green-400', border: 'border-green-500/15', ring: '#22c55e' },
    { label: 'Global Rank', value: rankData?.rank ? `#${rankData.rank}` : 'Unranked', icon: <Target className="w-5 h-5" />, color: 'cyan', glow: 'rgba(0,245,255,0.1)', textColor: 'text-neon-cyan', border: 'border-neon-cyan/15', ring: '#00f5ff' },
    { label: 'Total Submissions', value: submissions.length, icon: <Activity className="w-5 h-5" />, color: 'purple', glow: 'rgba(139,92,246,0.1)', textColor: 'text-purple-400', border: 'border-plasma/15', ring: '#8b5cf6' },
  ];

  const quickLinks = [
    { title: 'Duel Mode', desc: 'Real-time competitive coding', to: '/duel', icon: <Swords className="w-4 h-4" />, color: 'ember' },
    { title: 'Browse Problems', desc: 'Find your next challenge', to: '/problems', icon: <Code2 className="w-4 h-4" />, color: 'cyan' },
    { title: 'Leaderboard', desc: 'See where you rank globally', to: '/leaderboard', icon: <Trophy className="w-4 h-4" />, color: 'purple' },
    { title: 'Submission History', desc: 'Review all your attempts', to: '/history', icon: <BarChart2 className="w-4 h-4" />, color: 'green' },
  ];

  const quickLinkColors = {
    ember: { bg: 'bg-ember/10', text: 'text-ember', border: 'border-ember/15', hover: 'hover:border-ember/40 hover:bg-ember/5' },
    cyan: { bg: 'bg-neon-cyan/10', text: 'text-neon-cyan', border: 'border-neon-cyan/15', hover: 'hover:border-neon-cyan/40 hover:bg-neon-cyan/5' },
    purple: { bg: 'bg-plasma/10', text: 'text-purple-400', border: 'border-plasma/15', hover: 'hover:border-plasma/40 hover:bg-plasma/5' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/15', hover: 'hover:border-green-500/40 hover:bg-green-500/5' },
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black font-display"
            style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff', boxShadow: '0 0 20px rgba(0,245,255,0.15)' }}>
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-display">
            Welcome back,{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #00f5ff, #3b82f6)' }}>
              {username}
            </span>
          </h1>
          <p className="text-zinc-500 mt-1">Here's your performance overview.</p>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={fadeUp}>
            <GlowCard variant={stat.color === 'green' ? 'green' : stat.color === 'cyan' ? 'cyan' : 'purple'} className={`border ${stat.border} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.color === 'green' ? 'bg-green-500/10 text-green-400' : stat.color === 'cyan' ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-plasma/10 text-purple-400'}`}>
                  {stat.icon}
                </div>
                {i === 0 && !loadingStats && (
                  <ProgressRing value={uniqueSolved} max={Math.max(uniqueSolved + 20, 50)} size={44} strokeWidth={4} color={stat.ring} />
                )}
              </div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-black font-display ${stat.textColor}`}>
                {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : stat.value}
              </h3>
            </GlowCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Lower Grid ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Submissions — 3 cols */}
        <motion.div variants={fadeLeft} initial="hidden" animate="visible" className="lg:col-span-3">
          <GlowCard variant="cyan" className="border border-neon-cyan/10 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-cyan" /> Recent Submissions
              </h2>
              <Link to="/history" className="text-xs font-bold text-neon-cyan/70 hover:text-neon-cyan transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {loadingStats ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))
              ) : recent.length === 0 ? (
                <div className="text-center py-10">
                  <Code2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-600 text-sm">No submissions yet.</p>
                  <Link to="/problems" className="text-neon-cyan text-sm font-bold hover:underline">Start solving!</Link>
                </div>
              ) : (
                recent.map((s, i) => (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex flex-wrap gap-2 justify-between items-center p-3.5 rounded-xl border transition-colors"
                    style={{ background: 'rgba(255,255,255,0.025)', borderColor: s.verdict === 'Accepted' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', borderLeft: `3px solid ${s.verdict === 'Accepted' ? '#22c55e' : '#ef4444'}` }}
                  >
                    <div>
                      <h4 className="font-semibold text-zinc-200 text-sm">{s.problemId?.title || 'Unknown'}</h4>
                      <p className="text-xs text-zinc-600 mt-0.5">{LANG_DISPLAY[s.language] || s.language} · {timeAgo(s.createdAt)}</p>
                    </div>
                    <span className={s.verdict === 'Accepted' ? 'badge-accepted' : 'badge-rejected'}>
                      {s.verdict || s.status}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </GlowCard>
        </motion.div>

        {/* Quick Links — 2 cols */}
        <motion.div variants={fadeRight} initial="hidden" animate="visible" className="lg:col-span-2">
          <GlowCard variant="purple" className="border border-plasma/10 p-6 h-full">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Zap className="w-4 h-4 text-purple-400" /> Quick Links
            </h2>
            <div className="space-y-2.5">
              {quickLinks.map(({ title, desc, to, icon, color }, i) => {
                const c = quickLinkColors[color];
                return (
                  <Link key={i} to={to}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 group ${c.border} ${c.hover}`}
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div className={`p-2 rounded-lg ${c.bg} ${c.text} flex-shrink-0`}>{icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors">{title}</h4>
                        <p className="text-xs text-zinc-600">{desc}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}

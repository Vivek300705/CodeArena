import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore.js';
import { Code2, Target, CheckCircle, Clock, Loader2, Zap, Activity, ChevronRight, Swords, Trophy, BarChart2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubmissions } from '../services/problemService.js';
import { getMyRank } from '../services/leaderboardService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import ForgeButton from '../components/ForgeButton.jsx';

const LANG_DISPLAY = { python: 'Python', javascript: 'JS', node: 'Node.js', cpp: 'C++', c: 'C', java: 'Java', go: 'Go', rust: 'Rust' };

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ProgressRing({ value, max, size = 100, strokeWidth = 7, color = '#f97316' }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="butt"
        style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 5px ${color}80)` }}
      />
    </svg>
  );
}

export default function Dashboard() {
  useDocumentTitle('Command Center | CodeArena');
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
  const username = user?.name || user?.username || 'OP_UNKNOWN';
  const initial = username[0].toUpperCase();

  const stats = [
    { label: 'Targets Neutralized', value: uniqueSolved, icon: <CheckCircle className="w-5 h-5" />, color: 'var(--forge-green)', bg: 'bg-[#0f1712]' },
    { label: 'Global Ranking', value: rankData?.rank ? `#${rankData.rank}` : 'UNRANKED', icon: <Target className="w-5 h-5" />, color: 'var(--forge-ember)', bg: 'bg-[#140b08]' },
    { label: 'Total Deployments', value: submissions.length, icon: <Activity className="w-5 h-5" />, color: 'var(--forge-steel)', bg: 'bg-[#11161B]' },
  ];

  const quickLinks = [
    { title: 'Arena Combat', desc: 'Secure real-time match', to: '/duel', icon: <Swords className="w-4 h-4" /> },
    { title: 'Target Solutions', desc: 'Engage algorithms', to: '/problems', icon: <Target className="w-4 h-4" /> },
    { title: 'Global Rankings', desc: 'Assess operative standing', to: '/leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { title: 'Mission Logs', desc: 'Review executed payloads', to: '/history', icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl font-ui">
      
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-[var(--forge-panel)] border border-[var(--forge-border)] p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-full bg-[var(--forge-ember)] blur-[100px] opacity-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--forge-ember)] shadow-[0_0_10px_var(--forge-glow)]" />

        <div className="relative">
          <div className="w-16 h-16 flex items-center justify-center text-3xl font-black font-display bg-[#140b08] border border-[var(--forge-ember)] text-[var(--forge-ember)] shadow-[inset_0_0_15px_rgba(249,115,22,0.1)]">
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--forge-green)] border border-[var(--forge-bg)] shadow-[0_0_8px_var(--forge-green)] animate-pulse" />
        </div>
        
        <div className="relative z-10 flex-1">
          <div className="text-[10px] uppercase font-black tracking-widest text-[var(--forge-dim)] mb-1">Authenticated Operative</div>
          <h1 className="text-3xl md:text-5xl font-black font-display text-[var(--forge-white)] uppercase tracking-wider flex items-center gap-3">
            {username} 
            <Shield className="w-6 h-6 text-[var(--forge-ember)] opacity-50" />
          </h1>
          <p className="text-[var(--forge-steel)] mt-2 font-mono text-sm max-w-lg">
            Command center initialized. Telemetry routing active. Awaiting your next payload directive.
          </p>
        </div>
        
        <div className="hidden md:block relative z-10 text-right shrink-0 pr-8">
           <div className="text-[10px] uppercase font-black tracking-widest text-[var(--forge-dim)] mb-1 border-b border-[var(--forge-border)] pb-1">System Status</div>
           <div className="text-[var(--forge-green)] font-mono text-sm uppercase font-bold tracking-widest mt-2 flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-[var(--forge-green)] drop-shadow-[0_0_5px_var(--forge-green)]" /> ONLINE
           </div>
        </div>
      </motion.div>

      {/* ── STAT PANELS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`border border-[var(--forge-border)] p-6 flex flex-col relative overflow-hidden group ${stat.bg}`}
          >
            <div className="absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
              {stat.icon}
            </div>
            
            <div className="flex items-center justify-between mb-8 z-10">
              <div className="p-3 bg-[#0A0D11] border border-[var(--forge-border)]" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              {i === 0 && !loadingStats && (
                <ProgressRing value={uniqueSolved} max={Math.max(uniqueSolved + 10, 50)} size={48} strokeWidth={4} color="var(--forge-green)" />
              )}
            </div>
            
            <div className="mt-auto z-10">
              <p className="text-[10px] font-black text-[var(--forge-dim)] uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black font-display text-[var(--forge-white)] uppercase tracking-wider">
                {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-[var(--forge-steel)]" /> : stat.value}
              </h3>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{ backgroundColor: stat.color, opacity: 0.3 }} />
          </motion.div>
        ))}
      </div>

      {/* ── LOWER GRID ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        
        {/* Recent Deployments */}
        <div className="lg:col-span-3">
          <div className="border border-[var(--forge-border)] bg-[var(--forge-panel)] p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--forge-border)]">
              <h2 className="text-[10px] uppercase font-black text-[var(--forge-dim)] tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--forge-ember)]" /> Deployment Logs
              </h2>
              <Link to="/history" className="text-[10px] uppercase font-black text-[var(--forge-steel)] hover:text-[var(--forge-ember)] transition-colors flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loadingStats ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 bg-[#11161B] border border-[var(--forge-border)] animate-pulse" />
                  ))}
                </div>
              ) : recent.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--forge-border)] bg-[#0C1015]">
                  <Code2 className="w-8 h-8 text-[var(--forge-dim)] mx-auto mb-3" />
                  <p className="text-[var(--forge-steel)] text-sm font-mono uppercase tracking-widest">No data blocks found</p>
                  <Link to="/problems"><ForgeButton className="mt-4 text-[10px]">Assign Target</ForgeButton></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((s, i) => (
                    <motion.div
                      key={s._id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex flex-wrap gap-3 justify-between items-center p-4 border border-[var(--forge-border)] bg-[#11161B] hover:border-[var(--forge-steel)] transition-colors relative group"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${s.verdict === 'Accepted' ? 'bg-[var(--forge-green)]' : 'bg-[var(--forge-red)]'}`} />
                      <div>
                        <h4 className="font-bold text-[var(--forge-white)] font-mono text-sm tracking-tight">{s.problemId?.title || 'Unknown Asset'}</h4>
                        <p className="text-[10px] text-[var(--forge-dim)] uppercase tracking-widest mt-1">
                          {LANG_DISPLAY[s.language] || s.language} <span className="text-[var(--forge-border)] mx-1">/</span> {timeAgo(s.createdAt)}
                        </p>
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 border ${s.verdict === 'Accepted' ? 'border-[var(--forge-green)]/30 text-[var(--forge-green)] bg-[var(--forge-green)]/10' : 'border-[var(--forge-red)]/30 text-[var(--forge-red)] bg-[#1A1010]'}`}>
                        {s.verdict || s.status}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Directives */}
        <div className="lg:col-span-2">
          <div className="border border-[var(--forge-border)] bg-[var(--forge-panel)] p-6 h-full flex flex-col">
            <h2 className="text-[10px] uppercase font-black text-[var(--forge-dim)] tracking-widest flex items-center gap-2 mb-6 pb-4 border-b border-[var(--forge-border)]">
              <Zap className="w-4 h-4 text-[var(--forge-ember)]" /> Directives
            </h2>
            <div className="flex-1 space-y-3">
              {quickLinks.map(({ title, desc, to, icon }, i) => (
                <Link key={i} to={to} className="block group">
                  <div className="flex items-center justify-between p-4 border border-[var(--forge-border)] bg-[#0C1015] group-hover:bg-[#11161B] group-hover:border-[var(--forge-steel)] transition-all relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--forge-ember)] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_var(--forge-glow)]" />
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center border border-[var(--forge-border)] text-[var(--forge-dim)] group-hover:border-[var(--forge-ember)] group-hover:text-[var(--forge-ember)] transition-colors bg-[#0A0D11]">
                        {icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--forge-white)] text-sm uppercase tracking-widest group-hover:text-[var(--forge-ember)] transition-colors">{title}</h4>
                        <p className="text-[10px] text-[var(--forge-steel)] font-mono mt-0.5">{desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--forge-dim)] group-hover:text-[var(--forge-ember)] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

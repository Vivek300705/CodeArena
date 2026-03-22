import { useState, useMemo, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Check, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Code2, Tag } from 'lucide-react';
import { getProblems } from '../services/problemService.js';
import { staggerContainer, fadeUp } from '../animations/variants.js';

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const ITEMS_PER_PAGE = 15;

const diffConfig = {
  Easy: { class: 'badge-easy', border: 'border-l-green-500/60', glow: 'rgba(34,197,94,0.04)' },
  Medium: { class: 'badge-medium', border: 'border-l-yellow-500/60', glow: 'rgba(234,179,8,0.04)' },
  Hard: { class: 'badge-hard', border: 'border-l-orange-500/60', glow: 'rgba(249,115,22,0.04)' },
  Extreme: { class: 'badge-extreme', border: 'border-l-red-500/60', glow: 'rgba(239,68,68,0.06)' },
};

const filterDiffs = ['All', 'Easy', 'Medium', 'Hard'];
const filterDiffColors = {
  All: 'text-zinc-300',
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-orange-400',
};

export default function ProblemList() {
  useDocumentTitle('Problems');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchProblems = () => {
    setLoading(true);
    setError(null);
    getProblems()
      .then((data) => setProblems(data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load problems'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProblems(); }, []);

  const allTags = useMemo(() => {
    const tags = new Set();
    problems.forEach(p => (p.tags || []).forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [problems]);

  const filtered = useMemo(() => {
    return problems.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchDiff = difficultyFilter === 'All' || capitalize(p.difficulty) === difficultyFilter;
      const matchStatus = statusFilter === 'All' ||
        (statusFilter === 'Solved' && p.status === 'solved') ||
        (statusFilter === 'Unsolved' && p.status !== 'solved');
      const matchTag = tagFilter === 'All' || (p.tags && p.tags.includes(tagFilter));
      return matchSearch && matchDiff && matchStatus && matchTag;
    });
  }, [search, difficultyFilter, statusFilter, tagFilter, problems]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-2">Problem Set</h1>
        <p className="text-zinc-500">Master your algorithms. Pick your battlefield.</p>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-glow w-full pl-10 pr-4 text-sm"
            placeholder="Search problems..."
          />
        </div>

        {/* Difficulty pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-white/6" style={{ background: 'rgba(13,13,20,0.7)' }}>
          {filterDiffs.map(diff => (
            <button
              key={diff}
              onClick={() => { setDifficultyFilter(diff); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                difficultyFilter === diff
                  ? `bg-white/10 ${filterDiffColors[diff]} shadow-sm`
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Status & Tag filters */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-glow text-sm py-2 text-zinc-300"
          >
            <option value="All">Status: All</option>
            <option value="Solved">Solved</option>
            <option value="Unsolved">Unsolved</option>
          </select>
          {allTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
              className="input-glow text-sm py-2 text-zinc-300 max-w-[140px]"
            >
              <option value="All">All Tags</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          )}
          <button
            onClick={fetchProblems}
            className="p-2.5 rounded-xl border border-white/8 bg-white/4 text-zinc-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Result count */}
      <div className="text-xs text-zinc-600 mb-4 font-mono">
        {loading ? 'Loading...' : `${filtered.length} problem${filtered.length !== 1 ? 's' : ''} found`}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-500/8 border border-red-500/20 rounded-xl p-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Problem Table (styled) ── */}
      <div className="rounded-2xl border border-white/6 overflow-hidden"
        style={{ background: 'rgba(5,5,15,0.8)', backdropFilter: 'blur(20px)' }}>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-xs font-bold text-zinc-600 uppercase tracking-widest bg-white/2">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-7 md:col-span-6">Title</div>
          <div className="col-span-3 md:col-span-3 hidden md:block">Tags</div>
          <div className="col-span-4 md:col-span-2 text-right">Difficulty</div>
        </div>

        {loading ? (
          <div className="divide-y divide-white/4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center">
                <div className="col-span-1"><div className="w-5 h-5 rounded-full bg-white/5 animate-pulse mx-auto" /></div>
                <div className="col-span-7"><div className="h-4 bg-white/5 rounded animate-pulse w-3/4" /></div>
                <div className="col-span-4 text-right"><div className="h-5 bg-white/5 rounded-full animate-pulse w-16 ml-auto" /></div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="divide-y divide-white/4">
              {paginated.map((problem, idx) => {
                const diff = capitalize(problem.difficulty);
                const cfg = diffConfig[diff] || diffConfig.Easy;
                return (
                  <motion.div
                    key={problem._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                    onClick={() => navigate(`/problems/${problem._id}`)}
                    className={`grid grid-cols-12 gap-4 px-5 py-4 items-center cursor-pointer border-l-2 hover:bg-white/3 transition-all group ${cfg.border}`}
                  >
                    <div className="col-span-1 flex justify-center">
                      {problem.status === 'solved' ? (
                        <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/10" />
                      )}
                    </div>
                    <div className="col-span-7 md:col-span-6">
                      <span className="font-semibold text-zinc-200 group-hover:text-neon-cyan transition-colors text-sm">
                        {problem.title}
                      </span>
                    </div>
                    <div className="col-span-3 hidden md:flex flex-wrap gap-1.5">
                      {(problem.tags || []).slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-white/8 bg-white/4 text-zinc-500 font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="col-span-4 md:col-span-2 flex justify-end">
                      <span className={cfg.class}>{diff}</span>
                    </div>
                  </motion.div>
                );
              })}
              {paginated.length === 0 && (
                <div className="py-16 text-center">
                  <Code2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">No problems match your filters.</p>
                </div>
              )}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/5 bg-white/2 text-sm text-zinc-500">
          <span className="text-xs font-mono">
            {filtered.length === 0 ? '0' : `${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filtered.length)}`} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-white/8 hover:text-white transition-colors disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${p === page ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/25' : 'hover:bg-white/8 text-zinc-400'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-white/8 hover:text-white transition-colors disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Check, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { getProblems } from '../services/problemService.js';

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const getDifficultyColor = (diff) => {
  switch (capitalize(diff)) {
    case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
    default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
  }
};

const ITEMS_PER_PAGE = 10;

export default function ProblemList() {
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

  const filteredProblems = useMemo(() => {
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

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / ITEMS_PER_PAGE));
  const paginated = filteredProblems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Problem Set</h1>
          <p className="text-zinc-400">Master your algorithms. Pick your battlefield.</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-lg border border-white/5 backdrop-blur-sm">
          {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
            <button
              key={diff}
              onClick={() => { setDifficultyFilter(diff); setPage(1); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${difficultyFilter === diff ? 'bg-background text-primary shadow-sm' : 'text-zinc-400 hover:text-foreground'}`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-background border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-foreground placeholder-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
              placeholder="Search problems..."
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-background border border-white/5 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors text-zinc-300"
            >
              <option value="All">Status: All</option>
              <option value="Solved">Solved</option>
              <option value="Unsolved">Unsolved</option>
            </select>
            <select
              value={tagFilter}
              onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
              className="bg-background border border-white/5 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors text-zinc-300 max-w-[150px]"
            >
              <option value="All">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <button
              onClick={fetchProblems}
              className="flex justify-center items-center w-10.5 h-10.5 bg-background p-2.5 border border-white/5 rounded-lg hover:bg-white/5 transition-colors text-zinc-400"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 flex items-center gap-2 text-red-400 bg-red-500/10 border-b border-red-500/20 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/80 text-zinc-400 text-sm border-b border-white/5">
                <th className="py-4 px-6 font-medium w-16">Status</th>
                <th className="py-4 px-6 font-medium">Title</th>
                <th className="py-4 px-6 font-medium w-32">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-4 px-6"><div className="w-5 h-5 rounded-full bg-white/5 animate-pulse" /></td>
                    <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded animate-pulse w-48" /></td>
                    <td className="py-4 px-6"><div className="h-5 bg-white/5 rounded-full animate-pulse w-16" /></td>
                  </tr>
                ))
              ) : (
                <AnimatePresence>
                  {paginated.map((problem, idx) => (
                    <motion.tr
                      key={problem._id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                      onClick={() => navigate(`/problems/${problem._id}`)}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        {problem.status === 'solved' && <Check className="w-5 h-5 text-green-500" />}
                      </td>
                      <td className="py-4 px-6">
                        <Link to={`/problems/${problem._id}`} className="font-medium text-zinc-200 group-hover:text-primary transition-colors">
                          {problem.title}
                        </Link>
                        <div className="flex gap-2 mt-2">
                          {(problem.tags || []).slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/5 text-zinc-400 rounded-full border border-white/5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wide border ${getDifficultyColor(problem.difficulty)}`}>
                          {capitalize(problem.difficulty)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!loading && paginated.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-zinc-500">
                    No problems found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 text-sm bg-background/50">
          <div>
            Showing {filteredProblems.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredProblems.length)} of {filteredProblems.length}
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded font-medium flex items-center justify-center transition-colors ${p === page ? 'bg-primary text-white' : 'hover:bg-white/10 text-zinc-300'}`}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

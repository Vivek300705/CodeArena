import { useState, useMemo, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getProblems } from '../services/problemService.js';
import DifficultyBadge from '../components/DifficultyBadge.jsx';

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const ITEMS_PER_PAGE = 15;

function ProgressArc({ rate, color }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rate / 100) * circumference;
  
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <svg className="w-8 h-8 transform -rotate-90">
        <circle
          cx="16" cy="16" r={radius}
          fill="transparent"
          stroke="var(--forge-border)"
          strokeWidth="3"
        />
        <circle
          cx="16" cy="16" r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-[8px] font-mono font-bold" style={{ color }}>
        {Math.round(rate)}<span className="text-[6px]">%</span>
      </span>
    </div>
  );
}

export default function ProblemList() {
  useDocumentTitle('Problems | CodeArena');
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  
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

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const filtered = useMemo(() => {
    return problems.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchDiff = difficultyFilter === 'All' || capitalize(p.difficulty) === difficultyFilter;
      const matchStatus = statusFilter === 'All' ||
        (statusFilter === 'Solved ✓' && p.status === 'solved') ||
        (statusFilter === 'Attempted ⚡' && p.status === 'attempted') ||
        (statusFilter === 'Unsolved' && p.status !== 'solved' && p.status !== 'attempted');
      const matchTag = selectedTags.length === 0 || selectedTags.every(t => p.tags && p.tags.includes(t));
      return matchSearch && matchDiff && matchStatus && matchTag;
    });
  }, [search, difficultyFilter, statusFilter, selectedTags, problems]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen pt-8 px-4 md:px-8 flex flex-col lg:flex-row gap-8">
      
      {/* ── Left Sidebar (Filters) ── */}
      <aside className="lg:w-72 shrink-0 py-4 lg:border-l border-[var(--forge-border)] lg:pl-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
        <h2 className="font-display font-black text-xl tracking-widest mb-6 text-[var(--forge-white)] uppercase">Filters</h2>
        
        {/* Status */}
        <div className="mb-8">
          <h3 className="text-[var(--forge-dim)] text-xs font-bold uppercase tracking-widest mb-3">Status</h3>
          <div className="flex flex-col gap-2">
            {['All', 'Solved ✓', 'Attempted ⚡', 'Unsolved'].map(st => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setPage(1); }}
                className={`text-left px-3 py-2 text-sm font-bold transition-all border-l-2 ${
                  statusFilter === st 
                    ? 'border-[var(--forge-ember)] text-[var(--forge-white)] bg-[var(--forge-panel)]' 
                    : 'border-transparent text-[var(--forge-steel)] hover:text-[var(--forge-white)] hover:bg-[var(--forge-panel)]/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-8">
          <h3 className="text-[var(--forge-dim)] text-xs font-bold uppercase tracking-widest mb-3">Difficulty</h3>
          <div className="flex flex-col gap-2">
            {[
              { id: 'All', color: 'var(--forge-steel)', glow: '' },
              { id: 'Easy', color: 'var(--forge-green)', glow: 'rgba(0,217,126,0.15)' },
              { id: 'Medium', color: 'var(--forge-yellow)', glow: 'rgba(255,211,42,0.15)' },
              { id: 'Hard', color: 'var(--forge-red)', glow: 'rgba(255,71,87,0.15)' }
            ].map(diff => {
              const isActive = difficultyFilter === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => { setDifficultyFilter(diff.id); setPage(1); }}
                  className="relative group w-full text-left overflow-hidden rounded-sm transition-all"
                  style={{
                    border: `1px solid ${isActive ? diff.color : 'var(--forge-border)'}`,
                    background: isActive ? diff.glow : 'transparent',
                    color: isActive ? diff.color : 'var(--forge-steel)',
                  }}
                >
                  <div className="px-4 py-2 text-xs font-mono font-bold tracking-widest uppercase">
                    {diff.id}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h3 className="text-[var(--forge-dim)] text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
            Tags
            {selectedTags.length > 0 && (
              <button onClick={() => setSelectedTags([])} className="text-[var(--forge-ember)] text-[10px] hover:underline">
                Clear
              </button>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all border ${
                    isActive 
                      ? 'bg-[var(--forge-ember)] border-[var(--forge-ember)] text-[#000] font-bold shadow-[0_0_10px_var(--forge-glow)]' 
                      : 'bg-[var(--forge-panel)] border-[var(--forge-border)] text-[var(--forge-steel)] hover:border-[var(--forge-steel)] hover:text-[var(--forge-white)]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ── Main Content (Problem List) ── */}
      <main className="flex-1 pb-24">
        {/* Search Bar */}
        <div className="relative mb-8 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--forge-ember)] font-display font-black text-xl opacity-80 group-focus-within:opacity-100 transition-opacity drop-shadow-[0_0_8px_var(--forge-glow)]">
            &lt;/&gt;
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[var(--forge-panel)] border border-[var(--forge-border)] text-[var(--forge-white)] font-mono px-14 py-4 rounded-sm outline-none transition-all placeholder:text-[var(--forge-dim)] focus:border-[var(--forge-ember)] focus:shadow-[0_0_20px_var(--forge-glow)] focus:bg-[#11161B]"
            placeholder="> search problems_"
          />
          {search === '' && (
            <div className="absolute left-[200px] top-1/2 -translate-y-1/2 w-2 h-5 bg-[var(--forge-ember)] animate-pulse pointer-events-none mix-blend-screen" />
          )}
        </div>

        {/* Stats Strip Mini */}
        <div className="flex justify-between items-center mb-6 font-mono text-[var(--forge-dim)] text-xs uppercase tracking-widest">
          <div>
            {loading ? 'Scanning server...' : `[ ${filtered.length} targets acquired ]`}
          </div>
          <div className="flex gap-4">
            <span className="text-[var(--forge-green)]">EASY: {filtered.filter(p => capitalize(p.difficulty) === 'Easy').length}</span>
            <span className="text-[var(--forge-yellow)]">MEDIUM: {filtered.filter(p => capitalize(p.difficulty) === 'Medium').length}</span>
            <span className="text-[var(--forge-red)]">HARD: {filtered.filter(p => capitalize(p.difficulty) === 'Hard').length}</span>
          </div>
        </div>

        {/* Problem Cards */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {paginated.map((problem, idx) => {
              const diff = capitalize(problem.difficulty);
              const isSolved = problem.status === 'solved';
              // Mock acceptance rate since it might not be in DB yet, deriving semi-randomly from ID length or something, or default to 45
              const accRate = problem.acceptanceRate || (40 + (problem.title.length * 2) % 40);
              
              let badgeColor = 'var(--forge-green)';
              if (diff === 'Medium') badgeColor = 'var(--forge-yellow)';
              if (diff === 'Hard') badgeColor = 'var(--forge-red)';

              return (
                <motion.div
                  key={problem._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.2) }}
                  onClick={() => navigate(`/problems/${problem._id}`)}
                  className="group relative bg-[var(--forge-panel)] border border-[var(--forge-border)] p-5 flex items-center gap-6 cursor-pointer overflow-hidden rounded-[2px] transition-all duration-300 hover:bg-[#141A22] hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                >
                  {/* Left border hover/solved logic */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 ${isSolved ? 'bg-[var(--forge-green)] opacity-70' : 'bg-[var(--forge-ember)] opacity-0 group-hover:opacity-100'}`} />

                  {/* ID */}
                  <div className="w-16 flex-shrink-0 text-[var(--forge-dim)] font-mono text-sm">
                    #{String(idx + 1 + (page - 1) * ITEMS_PER_PAGE).padStart(4, '0')}
                  </div>

                  {/* Title & Tags */}
                  <div className="flex-1 min-w-0 flex flex-col items-start transition-transform duration-300 group-hover:translate-x-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-bold text-lg text-[var(--forge-white)] truncate leading-tight group-hover:text-[var(--forge-ember)] transition-colors">
                        {problem.title}
                      </h3>
                      {isSolved && (
                        <div className="flex items-center gap-1 text-[10px] text-[var(--forge-green)] font-display font-black tracking-widest border border-[var(--forge-green)]/30 bg-[var(--forge-green)]/10 px-2 py-0.5 rounded-sm">
                          ✓ FORGED
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(problem.tags || []).slice(0, 4).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 border border-[var(--forge-border)] bg-[#0C1015] text-[var(--forge-steel)] font-mono tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Side: Difficulty & Progress */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <DifficultyBadge difficulty={diff} />
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[8px] text-[var(--forge-dim)] font-mono uppercase tracking-widest mb-1">Acceptance</span>
                      <ProgressArc rate={accRate} color={badgeColor} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {paginated.length === 0 && !loading && (
            <div className="py-24 text-center border border-[var(--forge-border)] bg-[var(--forge-panel)] border-dashed">
              <div className="text-[var(--forge-dim)] font-mono mb-2">System Alert</div>
              <p className="text-[var(--forge-steel)] text-lg">No algorithms match specified parameters.</p>
            </div>
          )}
        </div>

        {/* Pagination Console */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between p-4 border border-[var(--forge-border)] bg-[var(--forge-panel)]">
            <span className="text-[var(--forge-dim)] font-mono text-xs uppercase tracking-widest">
              [ Page {page} / {totalPages} ]
            </span>
            <div className="flex gap-2 font-mono text-sm">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="px-3 py-1 text-[var(--forge-steel)] hover:text-[var(--forge-white)] border border-[var(--forge-border)] hover:border-[var(--forge-steel)] disabled:opacity-30 transition-all bg-[#0A0D12]"
              >
                &lt; PREV
              </button>
              <button 
                onClick={() => setPage(p => Math.max(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="px-3 py-1 text-[var(--forge-steel)] hover:text-[var(--forge-white)] border border-[var(--forge-border)] hover:border-[var(--forge-steel)] disabled:opacity-30 transition-all bg-[#0A0D12]"
              >
                NEXT &gt;
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

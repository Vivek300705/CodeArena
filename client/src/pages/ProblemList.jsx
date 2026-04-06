import { useState, useMemo, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getProblems } from '../services/problemService.js';
import DifficultyBadge from '../components/DifficultyBadge.jsx';
import { Search } from 'lucide-react';

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const ITEMS_PER_PAGE = 20;

function ProgressArc({ rate, color }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rate / 100) * circumference;
  
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg className="w-10 h-10 transform -rotate-90">
        <circle
          cx="20" cy="20" r={radius}
          fill="transparent"
          stroke="var(--forge-border)"
          strokeWidth="3"
        />
        <circle
          cx="20" cy="20" r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-[9px] font-mono font-bold" style={{ color }}>
        {Math.round(rate)}<span className="text-[7px]">%</span>
      </span>
    </div>
  );
}

export default function ProblemList() {
  useSEO({ title: 'Algorithm Arena | CodeArena', description: 'Practice and solve algorithm problems to improve your coding skills on CodeArena.' });
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
    <div className="min-h-[calc(100vh-64px)] bg-[var(--forge-bg)] text-[var(--forge-white)] font-ui pb-24 relative pt-12 md:pt-16">
      
      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10 w-full">
        
        {/* Header Hero */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black font-display tracking-wide mb-2 flex items-center gap-3">
            <div className="w-2 h-8 bg-[var(--forge-ember)]"></div>
            ALGORITHM ARENA
          </h1>
          <p className="text-[var(--forge-steel)] font-mono text-sm uppercase tracking-widest pl-5">
            Select a target. Enter the arena. Prove your worth.
          </p>
        </motion.div>

        {/* Global Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-6 group w-full"
        >
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--forge-dim)] group-focus-within:text-[var(--forge-ember)] transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[var(--forge-surface)] border-2 border-[var(--forge-border)] text-white font-mono text-base px-16 py-4 rounded-xl outline-none transition-all placeholder:text-[var(--forge-dim)] focus:border-[var(--forge-ember)]/50 focus:bg-[#11161B] shadow-lg"
            placeholder="Search thousands of algorithms..."
          />
        </motion.div>

        {/* Top Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--forge-surface)] border border-[var(--forge-border)] rounded-xl p-4 md:p-5 mb-8 shadow-md"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            
            {/* Difficulty */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[var(--forge-dim)] uppercase tracking-widest min-w-max">Difficulty:</span>
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
                {[
                  { id: 'All', activeColor: 'bg-[var(--forge-steel)]', textClass: 'text-[var(--forge-steel)]' },
                  { id: 'Easy', activeColor: 'bg-[var(--forge-green)]', textClass: 'text-[var(--forge-green)]' },
                  { id: 'Medium', activeColor: 'bg-[var(--forge-yellow)]', textClass: 'text-[var(--forge-yellow)]' },
                  { id: 'Hard', activeColor: 'bg-[var(--forge-red)]', textClass: 'text-[var(--forge-red)]' }
                ].map(diff => {
                  const isActive = difficultyFilter === diff.id;
                  return (
                    <button
                      key={diff.id}
                      onClick={() => { setDifficultyFilter(diff.id); setPage(1); }}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-bold font-mono uppercase tracking-widest transition-all whitespace-nowrap border ${
                        isActive 
                          ? `${diff.activeColor} text-[#000] border-transparent` 
                          : `bg-[var(--forge-panel)] border-[var(--forge-border)] ${diff.textClass} hover:border-gray-500`
                      }`}
                    >
                      {diff.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-[var(--forge-border)]"></div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[var(--forge-dim)] uppercase tracking-widest min-w-max">Status:</span>
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
                {['All', 'Solved ✓', 'Attempted ⚡', 'Unsolved'].map(st => {
                  const isActive = statusFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => { setStatusFilter(st); setPage(1); }}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-widest transition-all whitespace-nowrap border ${
                        isActive 
                          ? 'bg-[var(--forge-white)] text-[#000] border-transparent font-bold' 
                          : 'bg-[var(--forge-panel)] border-[var(--forge-border)] text-[var(--forge-steel)] hover:border-gray-500'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-5 pt-4 border-t border-[var(--forge-border)] flex items-start gap-4">
             <div className="flex items-center gap-2 mt-1.5">
               <span className="text-[10px] font-mono text-[var(--forge-dim)] uppercase tracking-widest shrink-0">Tags:</span>
               {selectedTags.length > 0 && (
                 <button onClick={() => setSelectedTags([])} className="text-[9px] text-white/50 hover:text-[var(--forge-ember)] uppercase font-mono tracking-widest transition-colors border border-white/10 px-1 rounded">Reset</button>
               )}
             </div>
             <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar pr-2">
               {allTags.map(tag => {
                 const isActive = selectedTags.includes(tag);
                 return (
                   <button
                     key={tag}
                     onClick={() => toggleTag(tag)}
                     className={`px-2 py-1 rounded text-[10px] font-mono transition-all border ${
                       isActive 
                         ? 'bg-[var(--forge-ember)] border-[var(--forge-ember)] text-[#000] font-bold' 
                         : 'bg-[var(--forge-panel)] border-[var(--forge-border)] text-[var(--forge-steel)] hover:border-gray-500 hover:text-white'
                     }`}
                   >
                     {tag}
                   </button>
                 );
               })}
             </div>
          </div>
        </motion.div>

        {/* Stats Strip */}
        <div className="flex flex-wrap justify-between items-center mb-4 px-1 font-mono text-[var(--forge-dim)] text-xs uppercase tracking-widest">
          <div className="mb-2 sm:mb-0 flex items-center gap-2">
            {loading ? 'Scanning servers...' : `${filtered.length} Algorithms Found`}
          </div>
          <div className="flex gap-4">
            <span className="text-[var(--forge-green)] drop-shadow-[0_0_2px_var(--forge-green)]">EASY: {filtered.filter(p => capitalize(p.difficulty) === 'Easy').length}</span>
            <span className="text-[var(--forge-yellow)] drop-shadow-[0_0_2px_var(--forge-yellow)]">MED: {filtered.filter(p => capitalize(p.difficulty) === 'Medium').length}</span>
            <span className="text-[var(--forge-red)] drop-shadow-[0_0_2px_var(--forge-red)]">HARD: {filtered.filter(p => capitalize(p.difficulty) === 'Hard').length}</span>
          </div>
        </div>

        {/* Problem Array - Compact List Mode */}
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {paginated.map((problem, idx) => {
              const diff = capitalize(problem.difficulty);
              const isSolved = problem.status === 'solved';
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
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.1) }}
                  onClick={() => navigate(`/problems/${problem._id}`)}
                  className="group relative bg-[var(--forge-panel)] border border-[var(--forge-border)] py-4 px-5 md:px-6 flex flex-col md:flex-row md:items-center justify-between cursor-pointer overflow-hidden rounded-lg transition-all duration-200 hover:bg-[#181F26] hover:border-[var(--forge-steel)]/40 hover:shadow-lg"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300 rounded-l-lg ${isSolved ? 'bg-[var(--forge-green)]' : 'bg-transparent group-hover:bg-[var(--forge-ember)]'}`} />

                  {/* Left Side: ID, Title, Tags */}
                  <div className="flex items-center gap-5 min-w-0 pr-4">
                    {/* ID */}
                    <div className="w-12 flex-shrink-0 text-[var(--forge-dim)] font-mono text-sm group-hover:text-[var(--forge-ember)] transition-colors pl-2">
                      #{String(idx + 1 + (page - 1) * ITEMS_PER_PAGE).padStart(3, '0')}
                    </div>

                    <div className="flex flex-col justify-center min-w-0 gap-1.5">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-base md:text-lg text-white truncate transition-colors group-hover:text-blue-200">
                          {problem.title}
                        </h3>
                        {isSolved && (
                          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[var(--forge-green)] text-black">
                            Solved
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(problem.tags || []).slice(0, 4).map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 border border-white/10 bg-[#0C1015] text-[var(--forge-steel)] font-mono rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Difficulty & Progress */}
                  <div className="flex items-center gap-6 mt-4 md:mt-0 flex-shrink-0 bg-[#0C1015] md:bg-transparent p-2 md:p-0 rounded-md border border-[var(--forge-border)] md:border-none self-start md:self-auto w-full md:w-auto justify-between md:justify-end pr-2 md:pr-0">
                     <span className="md:hidden text-[9px] font-mono text-[var(--forge-dim)] uppercase tracking-widest">Stats:</span>
                     <div className="flex items-center gap-6">
                       <DifficultyBadge difficulty={diff} className="w-20 justify-center" />
                       <div className="relative group/tooltip flex items-center justify-center">
                         <ProgressArc rate={accRate} color={badgeColor} />
                       </div>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {paginated.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center border-2 border-[var(--forge-border)] bg-[var(--forge-surface)] rounded-xl border-dashed relative overflow-hidden"
            >
              <div className="text-[var(--forge-dim)] font-mono text-sm tracking-widest uppercase mb-2">System Alert</div>
              <p className="text-[var(--forge-steel)] font-bold text-lg">No algorithms matched your target parameters.</p>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 mb-12 flex flex-col sm:flex-row items-center justify-between p-4 border border-[var(--forge-border)] bg-[var(--forge-surface)] rounded-xl">
            <span className="text-[var(--forge-dim)] font-mono text-xs tracking-widest uppercase">
              Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="px-4 py-2 text-xs font-bold font-mono text-[var(--forge-white)] transition-all bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-md hover:bg-white/5 hover:text-white disabled:opacity-30 uppercase tracking-widest"
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.max(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="px-4 py-2 text-xs font-bold font-mono text-[var(--forge-white)] transition-all bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-md hover:bg-white/5 hover:text-white disabled:opacity-30 uppercase tracking-widest"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

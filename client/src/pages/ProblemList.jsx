import { useState, useMemo, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getProblems } from '../services/problemService.js';
import DifficultyBadge from '../components/DifficultyBadge.jsx';
import { Search } from 'lucide-react';

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const ITEMS_PER_PAGE = 15;

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
          className="transition-all duration-1000 ease-out drop-shadow-[0_0_3px_currentColor]"
        />
      </svg>
      <span className="absolute text-[8px] font-mono font-bold tracking-tighter" style={{ color }}>
        {Math.round(rate)}<span className="text-[6px]">%</span>
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
    <div className="min-h-screen bg-[var(--forge-bg)] text-[var(--forge-white)] font-ui pb-24 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--forge-ember)] opacity-5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[var(--forge-steelblue)] opacity-5 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10 pt-32">
        {/* Header Hero */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-4 drop-shadow-[0_0_15px_var(--forge-glow)]">
            THE ALGORITHM <span className="text-[var(--forge-ember)]">ARENA</span>
          </h1>
          <p className="text-[var(--forge-steel)] font-mono text-sm md:text-base uppercase tracking-widest">
            Select a target. Enter the arena. Prove your worth.
          </p>
        </motion.div>

        {/* Global Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative px-4 max-w-4xl mx-auto mb-16 group"
        >
          <div className="absolute inset-0 bg-[var(--forge-ember)] blur-2xl opacity-10 rounded-full group-focus-within:opacity-20 transition-opacity pointer-events-none duration-500"></div>
          <div className="absolute left-10 top-1/2 -translate-y-1/2 text-[var(--forge-ember)] font-display font-black text-xl opacity-80 group-focus-within:opacity-100 transition-opacity duration-300">
            <Search size={24} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#080B10]/80 backdrop-blur-xl border-2 border-white/5 text-white font-mono md:text-lg px-20 py-5 rounded-2xl outline-none transition-all placeholder:text-[var(--forge-dim)] focus:border-[var(--forge-ember)]/50 shadow-2xl focus:shadow-[0_0_40px_var(--forge-glow)]"
            placeholder="Search thousands of algorithms..."
          />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── Left Sidebar (HUD Filters) ── */}
          <aside className="lg:w-80 shrink-0">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0A0D14]/60 backdrop-blur-md border border-[var(--forge-border)] rounded-2xl p-6 shadow-2xl sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-5">
                <div className="relative w-3 h-3 flex items-center justify-center">
                  <div className="absolute w-full h-full bg-[var(--forge-ember)] rounded-full animate-ping opacity-75"></div>
                  <div className="w-1.5 h-1.5 bg-[var(--forge-ember)] rounded-full"></div>
                </div>
                <h2 className="font-mono font-bold text-sm tracking-widest text-[var(--forge-white)] uppercase">Operations Console</h2>
              </div>
              
              {/* Status */}
              <div className="mb-10">
                <h3 className="text-[var(--forge-dim)] text-[10px] font-bold uppercase tracking-widest mb-4">Target Status</h3>
                <div className="flex flex-col gap-2">
                  {['All', 'Solved ✓', 'Attempted ⚡', 'Unsolved'].map(st => {
                    const isActive = statusFilter === st;
                    return (
                      <button
                        key={st}
                        onClick={() => { setStatusFilter(st); setPage(1); }}
                        className={`text-left px-4 py-2.5 text-xs font-mono tracking-widest uppercase transition-all rounded-lg flex items-center gap-3 ${
                          isActive 
                            ? 'bg-[var(--forge-ember)]/10 border border-[var(--forge-ember)]/30 text-[var(--forge-ember)] shadow-[inset_0_0_15px_rgba(255,107,53,0.1)]' 
                            : 'border border-transparent text-[var(--forge-steel)] hover:text-[var(--forge-white)] hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-[var(--forge-ember)]' : 'bg-transparent'}`}></div>
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-10">
                <h3 className="text-[var(--forge-dim)] text-[10px] font-bold uppercase tracking-widest mb-4">Threat Level</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'All', color: 'var(--forge-steel)', glow: 'rgba(143,170,191,0.1)' },
                    { id: 'Easy', color: 'var(--forge-green)', glow: 'rgba(0,217,126,0.1)' },
                    { id: 'Medium', color: 'var(--forge-yellow)', glow: 'rgba(255,211,42,0.1)' },
                    { id: 'Hard', color: 'var(--forge-red)', glow: 'rgba(255,71,87,0.1)' }
                  ].map(diff => {
                    const isActive = difficultyFilter === diff.id;
                    return (
                      <button
                        key={diff.id}
                        onClick={() => { setDifficultyFilter(diff.id); setPage(1); }}
                        className="relative group w-full text-center overflow-hidden rounded-lg transition-all border p-3 hover:scale-[1.02]"
                        style={{
                          borderColor: isActive ? diff.color : 'rgba(255,255,255,0.05)',
                          background: isActive ? diff.glow : 'rgba(255,255,255,0.02)',
                          color: isActive ? diff.color : 'var(--forge-steel)',
                          boxShadow: isActive ? `0 0 15px ${diff.glow}` : 'none'
                        }}
                      >
                        <span className="text-[10px] font-display font-black tracking-widest uppercase relative z-10">
                          {diff.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <h3 className="text-[var(--forge-dim)] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
                  <span>Classifications</span>
                  {selectedTags.length > 0 && (
                    <button onClick={() => setSelectedTags([])} className="text-[var(--forge-ember)] text-[9px] hover:text-white transition-colors bg-[var(--forge-ember)]/10 px-2 py-0.5 rounded">
                      RESET
                    </button>
                  )}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map(tag => {
                    const isActive = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-mono transition-all border ${
                          isActive 
                            ? 'bg-[var(--forge-ember)] border-[var(--forge-ember)] text-[#000] font-bold shadow-[0_0_10px_var(--forge-glow)]' 
                            : 'bg-[#080B10] border-white/5 text-[var(--forge-steel)] hover:border-[var(--forge-steel)] hover:text-[var(--forge-white)]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </aside>

          {/* ── Main Content (Problem List) ── */}
          <main className="flex-1 min-w-0">
            
            {/* Stats Strip Mini */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-between items-center mb-6 px-2 font-mono text-[var(--forge-dim)] text-xs uppercase tracking-widest"
            >
              <div className="mb-2 sm:mb-0 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[var(--forge-steel)] rounded-full"></div>
                {loading ? 'Scanning servers...' : `${filtered.length} Algorithms Available`}
              </div>
              <div className="flex gap-4 p-2 bg-[#0A0D14]/80 backdrop-blur border border-white/5 rounded-lg border-dashed">
                <span className="text-[var(--forge-green)] drop-shadow-[0_0_3px_var(--forge-green)]">EASY: {filtered.filter(p => capitalize(p.difficulty) === 'Easy').length}</span>
                <span className="text-[var(--forge-yellow)] drop-shadow-[0_0_3px_var(--forge-yellow)]">MED: {filtered.filter(p => capitalize(p.difficulty) === 'Medium').length}</span>
                <span className="text-[var(--forge-red)] drop-shadow-[0_0_3px_var(--forge-red)]">HARD: {filtered.filter(p => capitalize(p.difficulty) === 'Hard').length}</span>
              </div>
            </motion.div>

            {/* Problem Grid */}
            <div className="flex flex-col gap-4">
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
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.15) }}
                      onClick={() => navigate(`/problems/${problem._id}`)}
                      className="group relative bg-[#0A0D14]/80 backdrop-blur-md border border-white/5 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:bg-[#111722] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:border-white/10"
                    >
                      {/* Interaction Glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--forge-ember)] to-transparent opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none"></div>

                      {/* Left indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-500 rounded-l-xl ${isSolved ? 'bg-[var(--forge-green)] shadow-[0_0_10px_var(--forge-green)] opacity-80' : 'bg-[var(--forge-ember)] opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_10px_var(--forge-ember)]'}`} />

                      {/* ID Block */}
                      <div className="w-16 flex-shrink-0">
                        <span className="text-[10px] text-[var(--forge-dim)] font-mono uppercase tracking-widest block mb-1">Index</span>
                        <div className="text-[var(--forge-steel)] font-display font-bold text-lg group-hover:text-white transition-colors">
                          #{String(idx + 1 + (page - 1) * ITEMS_PER_PAGE).padStart(4, '0')}
                        </div>
                      </div>

                      {/* Title & Tags */}
                      <div className="flex-1 min-w-0 flex flex-col transition-transform duration-300 group-hover:translate-x-2">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-bold text-xl font-display text-white truncate leading-tight group-hover:text-[var(--forge-ember)] transition-colors drop-shadow-sm">
                            {problem.title}
                          </h3>
                          {isSolved && (
                            <div className="flex items-center gap-1 text-[9px] text-[var(--forge-green)] font-display font-black tracking-widest border border-[var(--forge-green)]/30 bg-[var(--forge-green)]/10 px-2 py-0.5 rounded">
                              ✓ FORGED
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(problem.tags || []).slice(0, 5).map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-1 border border-white/5 bg-[#080B10] text-[var(--forge-dim)] font-mono tracking-widest rounded-md uppercase group-hover:border-white/10 transition-colors">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Side: Difficulty & Progress */}
                      <div className="flex items-center justify-between md:justify-end gap-8 mt-4 md:mt-0 flex-shrink-0 bg-[#080B10] md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none border border-white/5 md:border-none">
                        <div className="flex flex-col items-start md:items-end">
                           <span className="text-[9px] text-[var(--forge-dim)] font-mono uppercase tracking-widest mb-1 md:hidden">Threat Level</span>
                           <DifficultyBadge difficulty={diff} className="shadow-lg" />
                        </div>
                        
                        <div className="flex flex-col items-center md:items-end pl-6 md:pl-0 border-l border-white/5 md:border-none">
                          <span className="text-[9px] text-[var(--forge-dim)] font-mono uppercase tracking-widest mb-1">Clear Rate</span>
                          <ProgressArc rate={accRate} color={badgeColor} />
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
                  className="py-32 text-center border-2 border-[var(--forge-border)] bg-[#0A0D14]/80 backdrop-blur rounded-2xl border-dashed relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
                  <div className="text-[var(--forge-ember)] font-display font-black text-6xl mb-4 opacity-20">404</div>
                  <div className="text-[var(--forge-ember)] font-mono text-sm tracking-widest uppercase mb-2">System Alert</div>
                  <p className="text-[var(--forge-white)] font-bold font-display text-xl">No algorithms matched your target parameters.</p>
                  <p className="text-[var(--forge-dim)] font-mono text-xs mt-4">Adjust your HUD filters or recalibrate the search input.</p>
                </motion.div>
              )}
            </div>

            {/* Pagination Console */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between p-5 border border-white/5 bg-[#0A0D14]/80 backdrop-blur rounded-xl shadow-xl gap-4">
                <span className="text-[var(--forge-steel)] font-display text-sm tracking-widest uppercase font-bold">
                  Sector <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    className="px-6 py-2.5 text-[10px] font-black font-display text-[var(--forge-white)] transition-all bg-[var(--forge-ember)]/10 border border-[var(--forge-ember)]/30 rounded-lg hover:border-[var(--forge-ember)] hover:bg-[var(--forge-ember)] hover:text-black disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-widest shadow-[0_0_15px_var(--forge-glow)]"
                  >
                    PREV
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.max(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    className="px-6 py-2.5 text-[10px] font-black font-display text-[var(--forge-white)] transition-all bg-[var(--forge-ember)]/10 border border-[var(--forge-ember)]/30 rounded-lg hover:border-[var(--forge-ember)] hover:bg-[var(--forge-ember)] hover:text-black disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-widest shadow-[0_0_15px_var(--forge-glow)]"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

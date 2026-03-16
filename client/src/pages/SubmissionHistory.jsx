import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { History, CheckCircle, XCircle, AlertCircle, Clock, Search, Loader2 } from 'lucide-react';
import { getSubmissions } from '../services/problemService.js';

/** Format ISO date as relative time (e.g. "2 hours ago") */
const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getStatusBadge = (status) => {
  const map = {
    Accepted:              { cls: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    'Wrong Answer':        { cls: 'bg-red-500/10 text-red-400 border-red-500/20',       icon: <XCircle className="w-3.5 h-3.5" /> },
    'Time Limit Exceeded': { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
    'Runtime Error':       { cls: 'bg-red-500/10 text-red-400 border-red-500/20',       icon: <XCircle className="w-3.5 h-3.5" /> },
  };
  const { cls, icon } = map[status] || { cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: <AlertCircle className="w-3.5 h-3.5" /> };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cls}`}>
      {icon} {status}
    </span>
  );
};

const LANG_DISPLAY = { python: 'Python 3', javascript: 'JavaScript', node: 'Node.js', cpp: 'C++', c: 'C', java: 'Java', go: 'Go', rust: 'Rust' };

export default function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getSubmissions()
      .then((data) => setSubmissions(data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load submissions'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter(s => {
    const title = s.problemId?.title || '';
    const lang = LANG_DISPLAY[s.language] || s.language;
    const q = search.toLowerCase();
    return title.toLowerCase().includes(q) || lang.toLowerCase().includes(q) || s.verdict?.toLowerCase().includes(q);
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <History className="w-8 h-8 text-primary" /> Submission History
          </h1>
          <p className="text-zinc-400">Review your past attempts and learn from mistakes.</p>
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
            placeholder="Search submissions..."
          />
        </div>
      </div>

      <div className="bg-surface/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        {error && (
          <div className="p-4 flex items-center gap-2 text-red-400 bg-red-500/10 border-b border-red-500/20 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-background/50 text-zinc-400 text-sm border-b border-white/5">
                <th className="py-4 px-6 font-medium">Time Submitted</th>
                <th className="py-4 px-6 font-medium">Problem</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Runtime</th>
                <th className="py-4 px-6 font-medium">Language</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="py-4 px-6"><div className="h-4 bg-white/5 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                <AnimatePresence>
                  {filtered.map((sub, idx) => (
                    <motion.tr
                      key={sub._id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6 text-zinc-400 text-sm">{timeAgo(sub.createdAt)}</td>
                      <td className="py-4 px-6">
                        <Link
                          to={`/problems/${sub.problemId?._id || sub.problemId}`}
                          className="font-medium text-zinc-200 hover:text-primary transition-colors"
                        >
                          {sub.problemId?.title || 'Unknown Problem'}
                        </Link>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(sub.verdict || sub.status)}</td>
                      <td className="py-4 px-6 font-mono text-sm text-zinc-300">
                        {sub.runtime ? `${sub.runtime} ms` : <span className="text-zinc-600">N/A</span>}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm px-2.5 py-1 bg-white/5 text-zinc-300 border border-white/10 rounded-lg">
                          {LANG_DISPLAY[sub.language] || sub.language}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    {submissions.length === 0 ? 'No submissions yet. Go solve something!' : 'No matching submissions found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        {!loading && submissions.length > 0 && (
          <div className="p-4 border-t border-white/5 bg-background/50 flex items-center justify-between text-zinc-400 text-sm">
            <span>Total: {submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
            <span className="text-green-400">
              {submissions.filter(s => s.verdict === 'Accepted').length} Accepted
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

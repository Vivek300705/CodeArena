import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { History, CheckCircle, XCircle, AlertCircle, Clock, Search } from 'lucide-react';

const MOCK_SUBMISSIONS = [
  { id: 'sub_1234', problemId: 1, problemTitle: 'Two Sum', language: 'JavaScript', status: 'Accepted', runtime: '43 ms', memory: '42.1 MB', time: '2 mins ago' },
  { id: 'sub_1235', problemId: 2, problemTitle: 'Add Two Numbers', language: 'Python3', status: 'Wrong Answer', runtime: 'N/A', memory: 'N/A', time: '1 hour ago' },
  { id: 'sub_1236', problemId: 4, problemTitle: 'Median of Two Sorted Arrays', language: 'C++', status: 'Time Limit Exceeded', runtime: 'N/A', memory: 'N/A', time: '3 hours ago' },
  { id: 'sub_1237', problemId: 1, problemTitle: 'Two Sum', language: 'JavaScript', status: 'Compile Error', runtime: 'N/A', memory: 'N/A', time: '1 day ago' },
  { id: 'sub_1238', problemId: 9, problemTitle: 'Palindrome Number', language: 'Python3', status: 'Accepted', runtime: '62 ms', memory: '13.8 MB', time: '2 days ago' },
  { id: 'sub_1239', problemId: 5, problemTitle: 'Longest Palindromic Substring', language: 'JavaScript', status: 'Accepted', runtime: '112 ms', memory: '51.2 MB', time: '3 days ago' },
];

const getStatusBadge = (status) => {
  switch(status) {
    case 'Accepted':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle className="w-3.5 h-3.5" /> Accepted
        </span>
      );
    case 'Wrong Answer':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle className="w-3.5 h-3.5" /> Wrong Answer
        </span>
      );
    case 'Time Limit Exceeded':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <Clock className="w-3.5 h-3.5" /> Time Limit Exceeded
        </span>
      );
    case 'Compile Error':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
          <AlertCircle className="w-3.5 h-3.5" /> Compile Error
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
          <AlertCircle className="w-3.5 h-3.5" /> {status}
        </span>
      );
  }
};

export default function SubmissionHistory() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_SUBMISSIONS.filter(s => 
    s.problemTitle.toLowerCase().includes(search.toLowerCase()) ||
    s.language.toLowerCase().includes(search.toLowerCase()) ||
    s.status.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-background/50 text-zinc-400 text-sm border-b border-white/5">
                <th className="py-4 px-6 font-medium">Time Submitted</th>
                <th className="py-4 px-6 font-medium">Problem</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Runtime</th>
                <th className="py-4 px-6 font-medium">Memory</th>
                <th className="py-4 px-6 font-medium">Language</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((submission, idx) => (
                  <motion.tr
                    key={submission.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-zinc-400 text-sm">
                      {submission.time}
                    </td>
                    <td className="py-4 px-6">
                      <Link to={`/problems/${submission.problemId}`} className="font-medium text-zinc-200 hover:text-primary transition-colors">
                        {submission.problemTitle}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-zinc-300">
                      {submission.runtime !== 'N/A' ? submission.runtime : <span className="text-zinc-600">N/A</span>}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-zinc-300">
                      {submission.memory !== 'N/A' ? submission.memory : <span className="text-zinc-600">N/A</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm px-2.5 py-1 bg-white/5 text-zinc-300 border border-white/10 rounded-lg">
                        {submission.language}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

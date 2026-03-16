import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProblems, deleteProblem } from '../services/problemService.js';
import { Plus, Edit2, Trash2, Loader2, Search } from 'lucide-react';
import ProblemEditor from '../components/ProblemEditor.jsx';

export default function AdminDashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null); // null means "Create" mode

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      // getProblems fetches paginated but for admin we might want all, passing a large limit
      const data = await getProblems();
      setProblems(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await deleteProblem(id);
      setProblems(problems.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete problem');
    }
  };

  const openCreateModal = () => {
    setEditingProblem(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (problem) => {
    setEditingProblem(problem);
    setIsEditorOpen(true);
  };

  const handleEditorClose = (wasSaved) => {
    setIsEditorOpen(false);
    setEditingProblem(null);
    if (wasSaved) {
      fetchProblems(); // Refresh the list
    }
  };

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            Admin <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">Dashboard</span>
          </h1>
          <p className="text-zinc-400 text-lg">Manage platform problems, testcases, and boilerplates.</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Create Problem
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search problems by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 hover:border-white/20 transition-colors rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div className="bg-zinc-950/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex justify-center items-center p-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400 bg-red-500/10 font-medium">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-8 py-5 text-xs font-bold tracking-widest uppercase text-zinc-400">Title</th>
                  <th className="px-8 py-5 text-xs font-bold tracking-widest uppercase text-zinc-400">Difficulty</th>
                  <th className="px-8 py-5 text-xs font-bold tracking-widest uppercase text-zinc-400">Tags</th>
                  <th className="px-8 py-5 text-xs font-bold tracking-widest uppercase text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProblems.map((problem) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={problem._id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-5 font-bold text-white text-lg">
                      {problem.title}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border tracking-widest uppercase ${
                        problem.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        problem.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        {problem.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs font-semibold text-zinc-300 bg-white/10 px-2.5 py-1 rounded-md border border-white/5">
                            {tag}
                          </span>
                        ))}
                        {problem.tags?.length > 3 && (
                          <span className="text-xs font-semibold text-zinc-500 px-1 py-1">+{problem.tags.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(problem)}
                          className="p-2.5 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition-colors"
                          title="Edit Problem"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(problem._id, problem.title)}
                          className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredProblems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-lg text-zinc-500 font-medium">
                      No problems found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEditorOpen && (
        <ProblemEditor 
          problem={editingProblem} 
          onClose={handleEditorClose} 
        />
      )}
    </div>
  );
}

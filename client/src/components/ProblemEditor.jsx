import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProblem, updateProblem } from '../services/problemService.js';
import { X, Plus, Trash2, Loader2, Save } from 'lucide-react';

export default function ProblemEditor({ problem, onClose }) {
  const isEditing = !!problem;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState(problem?.title || '');
  const [description, setDescription] = useState(problem?.description || '');
  const [difficulty, setDifficulty] = useState(problem?.difficulty || 'easy');
  const [tags, setTags] = useState(problem?.tags?.join(', ') || '');
  const [timeLimit, setTimeLimit] = useState(problem?.timeLimit || 1000);
  const [memoryLimit, setMemoryLimit] = useState(problem?.memoryLimit || 256);

  // Arrays State
  const [examples, setExamples] = useState(problem?.examples || []);
  const [testcases, setTestcases] = useState(problem?.testcases || []);
  const [boilerplates, setBoilerplates] = useState(problem?.boilerplates || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      difficulty,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      timeLimit: Number(timeLimit),
      memoryLimit: Number(memoryLimit),
      examples,
      testcases,
      boilerplates
    };

    try {
      if (isEditing) {
        await updateProblem(problem._id, payload);
      } else {
        await createProblem(payload);
      }
      onClose(true); // Close and signal a refresh is needed
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save problem');
      setLoading(false);
    }
  };

  // --- Helpers for Dynamic Arrays ---

  const handleArrayChange = (setter, index, field, value) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addArrayItem = (setter, defaultObj) => {
    setter(prev => [...prev, defaultObj]);
  };

  const removeArrayItem = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-2xl font-bold">{isEditing ? 'Edit Problem' : 'Create New Problem'}</h2>
            <button 
              onClick={() => onClose(false)} 
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <form id="problem-form" onSubmit={handleSubmit} className="space-y-12">
              {/* Basic Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-cyan-400 mb-1">Basic Details</h3>
                  <p className="text-xs text-zinc-500">Core problem information and limits.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Title</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white focus:bg-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Difficulty</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white focus:bg-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Description (Markdown Supported)</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white focus:bg-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono text-sm transition-all custom-scrollbar" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Tags (comma separated)</label>
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Array, Hash Table, Math" className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white focus:bg-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Time Limit (ms)</label>
                    <input type="number" required value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white focus:bg-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Memory Limit (MB)</label>
                    <input type="number" required value={memoryLimit} onChange={e => setMemoryLimit(e.target.value)} className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white focus:bg-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div className="space-y-4">
                <div className="flex justify-between items-end pb-2">
                  <div>
                    <h3 className="text-sm font-bold tracking-widest uppercase text-blue-400 mb-1">Examples</h3>
                    <p className="text-xs text-zinc-500">Visible to users in the problem description.</p>
                  </div>
                  <button type="button" onClick={() => addArrayItem(setExamples, { input: '', output: '', explanation: '' })} className="text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="space-y-4">
                  {examples.map((ex, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl relative group hover:border-white/20 transition-all">
                      <button type="button" onClick={() => removeArrayItem(setExamples, i)} className="absolute top-3 right-3 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <h4 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-wider">Example {i + 1}</h4>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div><label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Input</label><textarea required value={ex.input} onChange={e => handleArrayChange(setExamples, i, 'input', e.target.value)} rows={2} className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:bg-black/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all custom-scrollbar font-mono" /></div>
                        <div><label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Output</label><textarea required value={ex.output} onChange={e => handleArrayChange(setExamples, i, 'output', e.target.value)} rows={2} className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:bg-black/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all custom-scrollbar font-mono" /></div>
                        <div className="md:col-span-2"><label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Explanation (optional)</label><textarea value={ex.explanation} onChange={e => handleArrayChange(setExamples, i, 'explanation', e.target.value)} rows={2} className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:bg-black/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all custom-scrollbar" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testcases */}
              <div className="space-y-4">
                <div className="flex justify-between items-end pb-2">
                  <div>
                    <h3 className="text-sm font-bold tracking-widest uppercase text-purple-400 mb-1">Testcases</h3>
                    <p className="text-xs text-zinc-500">Raw stdio inputs and outputs evaluated by the runner.</p>
                  </div>
                  <button type="button" onClick={() => addArrayItem(setTestcases, { input: '', output: '', isHidden: false })} className="text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="space-y-4">
                  {testcases.map((tc, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl relative group hover:border-white/20 transition-all">
                      <div className="absolute top-4 right-4 flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 cursor-pointer bg-black/40 px-3 py-1.5 rounded-lg">
                          <input type="checkbox" checked={tc.isHidden} onChange={e => handleArrayChange(setTestcases, i, 'isHidden', e.target.checked)} className="rounded border-white/20 bg-black/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0" /> Hide from user
                        </label>
                        <button type="button" onClick={() => removeArrayItem(setTestcases, i)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-wider">Testcase {i + 1}</h4>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div><label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Raw Input String</label><textarea required value={tc.input} onChange={e => handleArrayChange(setTestcases, i, 'input', e.target.value)} rows={4} className="w-full font-mono text-xs bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-4 py-3 text-white focus:bg-black/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all custom-scrollbar" /></div>
                        <div><label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Raw Output String</label><textarea required value={tc.output} onChange={e => handleArrayChange(setTestcases, i, 'output', e.target.value)} rows={4} className="w-full font-mono text-xs bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-4 py-3 text-white focus:bg-black/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all custom-scrollbar" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boilerplates */}
              <div className="space-y-4">
                <div className="flex justify-between items-end pb-2">
                  <div>
                    <h3 className="text-sm font-bold tracking-widest uppercase text-emerald-400 mb-1">Language Boilerplates</h3>
                    <p className="text-xs text-zinc-500">Pre-populated code injected into the editor.</p>
                  </div>
                  <button type="button" onClick={() => addArrayItem(setBoilerplates, { language: 'node', code: '' })} className="text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="space-y-4">
                  {boilerplates.map((bp, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl relative group hover:border-white/20 transition-all">
                      <button type="button" onClick={() => removeArrayItem(setBoilerplates, i)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <h4 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-wider">Snippet {i + 1}</h4>
                      <div className="space-y-5">
                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Language</label>
                          <select value={bp.language} onChange={e => handleArrayChange(setBoilerplates, i, 'language', e.target.value)} className="w-full max-w-[250px] bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:bg-black/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all">
                            <option value="node">Node.js</option>
                            <option value="python">Python 3</option>
                            <option value="cpp">C++ 17</option>
                            <option value="c">C</option>
                            <option value="java">Java</option>
                            <option value="go">Go</option>
                            <option value="rust">Rust</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Starting Code</label>
                          <textarea value={bp.code} onChange={e => handleArrayChange(setBoilerplates, i, 'code', e.target.value)} rows={6} className="w-full font-mono text-xs bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-4 py-3 text-white focus:bg-black/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all custom-scrollbar" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-3xl flex justify-end gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-10">
            <button 
              type="button" 
              onClick={() => onClose(false)} 
              className="px-6 py-2.5 rounded-xl font-semibold text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="problem-form"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all disabled:opacity-70 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isEditing ? 'Save Changes' : 'Create Problem'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

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
          className="relative w-full max-w-4xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-background/50">
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

            <form id="problem-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-cyan-400 border-b border-white/5 pb-2">Basic Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Difficulty</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description (Markdown Supported)</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tags (comma separated)</label>
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Array, Hash Table, Math" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Time Limit (ms)</label>
                    <input type="number" required value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Memory Limit (MB)</label>
                    <input type="number" required value={memoryLimit} onChange={e => setMemoryLimit(e.target.value)} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-lg font-semibold text-cyan-400">Examples (Visible to Users)</h3>
                  <button type="button" onClick={() => addArrayItem(setExamples, { input: '', output: '', explanation: '' })} className="text-sm flex items-center gap-1 text-primary hover:text-cyan-400 transition-colors">
                    <Plus className="w-4 h-4" /> Add Example
                  </button>
                </div>
                {examples.map((ex, i) => (
                  <div key={i} className="p-4 bg-background/50 border border-white/5 rounded-xl relative group">
                    <button type="button" onClick={() => removeArrayItem(setExamples, i)} className="absolute top-2 right-2 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="text-xs text-zinc-500 mb-1 block">Input</label><textarea required value={ex.input} onChange={e => handleArrayChange(setExamples, i, 'input', e.target.value)} rows={2} className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-cyan-500" /></div>
                      <div><label className="text-xs text-zinc-500 mb-1 block">Output</label><textarea required value={ex.output} onChange={e => handleArrayChange(setExamples, i, 'output', e.target.value)} rows={2} className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-cyan-500" /></div>
                      <div className="md:col-span-2"><label className="text-xs text-zinc-500 mb-1 block">Explanation (optional)</label><textarea value={ex.explanation} onChange={e => handleArrayChange(setExamples, i, 'explanation', e.target.value)} rows={1} className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-cyan-500" /></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testcases */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-lg font-semibold text-purple-400">Testcases (Runner Data)</h3>
                  <button type="button" onClick={() => addArrayItem(setTestcases, { input: '', output: '', isHidden: false })} className="text-sm flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors">
                    <Plus className="w-4 h-4" /> Add Testcase
                  </button>
                </div>
                {testcases.map((tc, i) => (
                  <div key={i} className="p-4 bg-background/50 border border-white/5 rounded-xl relative group">
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                        <input type="checkbox" checked={tc.isHidden} onChange={e => handleArrayChange(setTestcases, i, 'isHidden', e.target.checked)} className="rounded border-white/10 bg-background text-purple-500 focus:ring-purple-500" /> Hide from user
                      </label>
                      <button type="button" onClick={() => removeArrayItem(setTestcases, i)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 pt-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div><label className="text-xs text-zinc-500 mb-1 block">Raw Input String</label><textarea required value={tc.input} onChange={e => handleArrayChange(setTestcases, i, 'input', e.target.value)} rows={3} className="w-full font-mono text-xs bg-background border border-white/10 rounded-md px-3 py-2 text-white focus:border-purple-500" /></div>
                      <div><label className="text-xs text-zinc-500 mb-1 block">Raw Output String</label><textarea required value={tc.output} onChange={e => handleArrayChange(setTestcases, i, 'output', e.target.value)} rows={3} className="w-full font-mono text-xs bg-background border border-white/10 rounded-md px-3 py-2 text-white focus:border-purple-500" /></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Boilerplates */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-lg font-semibold text-emerald-400">Language Boilerplates</h3>
                  <button type="button" onClick={() => addArrayItem(setBoilerplates, { language: 'node', code: '' })} className="text-sm flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Plus className="w-4 h-4" /> Add Boilerplate
                  </button>
                </div>
                {boilerplates.map((bp, i) => (
                  <div key={i} className="p-4 bg-background/50 border border-white/5 rounded-xl relative group">
                    <button type="button" onClick={() => removeArrayItem(setBoilerplates, i)} className="absolute top-2 right-2 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-3 mt-2">
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Language</label>
                        <select value={bp.language} onChange={e => handleArrayChange(setBoilerplates, i, 'language', e.target.value)} className="w-full max-w-[200px] bg-background border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:border-emerald-500">
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
                        <label className="text-xs text-zinc-500 mb-1 block">Starting Code</label>
                        <textarea value={bp.code} onChange={e => handleArrayChange(setBoilerplates, i, 'code', e.target.value)} rows={5} className="w-full font-mono text-xs bg-background border border-white/10 rounded-md px-3 py-2 text-white focus:border-emerald-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/5 bg-background/80 backdrop-blur-md flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => onClose(false)} 
              className="px-6 py-2.5 rounded-lg font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="problem-form"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors disabled:opacity-70 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
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

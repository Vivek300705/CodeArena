import { useState } from 'react';
import { createPortal } from 'react-dom';
import { createProblem, updateProblem } from '../services/problemService.js';
import { X, Plus, Trash2, Loader2, Save, ChevronDown } from 'lucide-react';

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-bold tracking-widest uppercase text-zinc-400 mb-2">
      {children}
    </label>
  );
}

function SectionHeader({ color, title, subtitle, onAdd, addLabel }) {
  const colorMap = {
    cyan:   { title: 'text-cyan-400',    btn: 'bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20' },
    blue:   { title: 'text-blue-400',    btn: 'bg-blue-400/10 text-blue-400 hover:bg-blue-400/20' },
    purple: { title: 'text-purple-400',  btn: 'bg-purple-400/10 text-purple-400 hover:bg-purple-400/20' },
    emerald:{ title: 'text-emerald-400', btn: 'bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20' },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className="flex justify-between items-end mb-5">
      <div>
        <h3 className={`text-sm font-black tracking-widest uppercase ${c.title}`}>{title}</h3>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className={`text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${c.btn}`}
        >
          <Plus className="w-4 h-4" /> {addLabel || 'Add'}
        </button>
      )}
    </div>
  );
}

function InputCard({ onRemove, indexLabel, children }) {
  return (
    <div className="relative group bg-black/30 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
      {indexLabel && (
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">{indexLabel}</p>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
}

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
  const [examples, setExamples] = useState(problem?.examples || []);
  const [testcases, setTestcases] = useState(problem?.testcases || []);
  const [boilerplates, setBoilerplates] = useState(problem?.boilerplates || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      title, description, difficulty,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      timeLimit: Number(timeLimit),
      memoryLimit: Number(memoryLimit),
      examples, testcases, boilerplates,
    };
    try {
      if (isEditing) await updateProblem(problem._id, payload);
      else await createProblem(payload);
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save problem');
      setLoading(false);
    }
  };

  const handleArrayChange = (setter, index, field, value) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  const addItem = (setter, obj) => setter(prev => [...prev, obj]);
  const removeItem = (setter, i) => setter(prev => prev.filter((_, j) => j !== i));

  const inputCls = "w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:bg-white/10 focus:border-cyan-500/70 focus:ring-0 focus:outline-none transition-all";
  const monoCls = `${inputCls} font-mono text-sm`;

  const LANGS = ['node', 'python', 'cpp', 'c', 'java', 'go', 'rust'];
  const LANG_LABELS = { node: 'Node.js', python: 'Python 3', cpp: 'C++ 17', c: 'C', java: 'Java', go: 'Go', rust: 'Rust' };
  const DIFFS = [
    { value: 'easy',   label: 'Easy',   color: 'text-green-400 border-green-500/40 bg-green-500/10 hover:bg-green-500/20' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20' },
    { value: 'hard',   label: 'Hard',   color: 'text-red-400 border-red-500/40 bg-red-500/10 hover:bg-red-500/20' },
  ];

  return createPortal(
    <div
      className="modal-overlay flex items-center justify-center bg-black/75"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full mx-4 max-w-4xl bg-[#0d0d14] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white">
              {isEditing ? 'Edit Problem' : 'Create New Problem'}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {isEditing ? `Editing: ${problem.title}` : 'Fill in the fields below to add a new problem.'}
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-8 py-8 space-y-12 flex-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form id="problem-form" onSubmit={handleSubmit} className="space-y-12">

            {/* ── Basic Details ── */}
            <section>
              <SectionHeader color="cyan" title="Basic Details" subtitle="Core metadata for the problem." />
              <div className="space-y-5">
                {/* Title + Difficulty */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Two Sum"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <FieldLabel>Difficulty</FieldLabel>
                    <div className="flex gap-2">
                      {DIFFS.map(d => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDifficulty(d.value)}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                            difficulty === d.value
                              ? d.color
                              : 'border-white/10 text-zinc-500 bg-white/5 hover:bg-white/10 hover:text-zinc-300'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <FieldLabel>Description (Markdown Supported)</FieldLabel>
                  <textarea
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={7}
                    placeholder="Describe the problem here..."
                    className={monoCls}
                  />
                </div>

                {/* Tags */}
                <div>
                  <FieldLabel>Tags (comma separated)</FieldLabel>
                  <input
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="Array, Hash Table, Dynamic Programming"
                    className={inputCls}
                  />
                </div>

                {/* Limits */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Time Limit (ms)</FieldLabel>
                    <input type="number" required value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Memory Limit (MB)</FieldLabel>
                    <input type="number" required value={memoryLimit} onChange={e => setMemoryLimit(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Examples ── */}
            <section>
              <SectionHeader
                color="blue"
                title="Examples"
                subtitle="Visible to users alongside the problem description."
                onAdd={() => addItem(setExamples, { input: '', output: '', explanation: '' })}
              />
              <div className="space-y-4">
                {examples.length === 0 && (
                  <p className="text-sm text-zinc-600 text-center py-6">No examples yet. Click <span className="text-blue-400 font-semibold">+ Add</span> to create one.</p>
                )}
                {examples.map((ex, i) => (
                  <InputCard key={i} indexLabel={`Example ${i + 1}`} onRemove={() => removeItem(setExamples, i)}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Input</FieldLabel>
                        <textarea required value={ex.input} onChange={e => handleArrayChange(setExamples, i, 'input', e.target.value)} rows={3} className={monoCls} />
                      </div>
                      <div>
                        <FieldLabel>Output</FieldLabel>
                        <textarea required value={ex.output} onChange={e => handleArrayChange(setExamples, i, 'output', e.target.value)} rows={3} className={monoCls} />
                      </div>
                      <div className="md:col-span-2">
                        <FieldLabel>Explanation (optional)</FieldLabel>
                        <textarea value={ex.explanation} onChange={e => handleArrayChange(setExamples, i, 'explanation', e.target.value)} rows={2} className={inputCls} />
                      </div>
                    </div>
                  </InputCard>
                ))}
              </div>
            </section>

            {/* ── Testcases ── */}
            <section>
              <SectionHeader
                color="purple"
                title="Testcases"
                subtitle="Raw stdin/stdout passed to the code runner."
                onAdd={() => addItem(setTestcases, { input: '', output: '', isHidden: false })}
              />
              <div className="space-y-4">
                {testcases.length === 0 && (
                  <p className="text-sm text-zinc-600 text-center py-6">No testcases yet. Click <span className="text-purple-400 font-semibold">+ Add</span> to create one.</p>
                )}
                {testcases.map((tc, i) => (
                  <InputCard key={i} indexLabel={`Testcase ${i + 1}`} onRemove={() => removeItem(setTestcases, i)}>
                    <div className="flex items-center gap-3 mb-4">
                      <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer select-none bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={e => handleArrayChange(setTestcases, i, 'isHidden', e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-black text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                        />
                        <span className="font-semibold">Hidden from user</span>
                      </label>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Raw Input String</FieldLabel>
                        <textarea required value={tc.input} onChange={e => handleArrayChange(setTestcases, i, 'input', e.target.value)} rows={5} className={monoCls} />
                      </div>
                      <div>
                        <FieldLabel>Expected Output</FieldLabel>
                        <textarea required value={tc.output} onChange={e => handleArrayChange(setTestcases, i, 'output', e.target.value)} rows={5} className={monoCls} />
                      </div>
                    </div>
                  </InputCard>
                ))}
              </div>
            </section>

            {/* ── Boilerplates ── */}
            <section>
              <SectionHeader
                color="emerald"
                title="Language Boilerplates"
                subtitle="Starter code loaded into the editor per language."
                onAdd={() => addItem(setBoilerplates, { language: 'node', code: '' })}
              />
              <div className="space-y-4">
                {boilerplates.length === 0 && (
                  <p className="text-sm text-zinc-600 text-center py-6">No boilerplates yet. Click <span className="text-emerald-400 font-semibold">+ Add</span> to create one.</p>
                )}
                {boilerplates.map((bp, i) => (
                  <InputCard key={i} indexLabel={`Snippet ${i + 1}`} onRemove={() => removeItem(setBoilerplates, i)}>
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>Language</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                          {LANGS.map(lang => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => handleArrayChange(setBoilerplates, i, 'language', lang)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                                bp.language === lang
                                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                                  : 'border-white/10 text-zinc-500 bg-white/5 hover:text-zinc-300 hover:bg-white/10'
                              }`}
                            >
                              {LANG_LABELS[lang]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Starting Code</FieldLabel>
                        <textarea value={bp.code} onChange={e => handleArrayChange(setBoilerplates, i, 'code', e.target.value)} rows={7} className={monoCls} />
                      </div>
                    </div>
                  </InputCard>
                ))}
              </div>
            </section>

          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/10 bg-black/30 backdrop-blur-xl flex justify-end items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-6 py-2.5 text-zinc-400 hover:text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="problem-form"
            disabled={loading}
            className="flex items-center gap-2.5 px-8 py-2.5 bg-primary text-white font-bold rounded-xl transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:-translate-y-px"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditing ? 'Save Changes' : 'Create Problem'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

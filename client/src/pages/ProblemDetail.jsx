import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Play, Send, Clock, Cpu, ChevronLeft, CheckCircle, XCircle, Code2, Terminal } from 'lucide-react';

const mockProblem = {
  id: 1,
  title: "Two Sum",
  difficulty: "Easy",
  tags: ["Array", "Hash Table"],
  timeLimit: "1.0s",
  memoryLimit: "256 MB",
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
    }
  ],
  defaultCode: {
    javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
    python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
    cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
  }
};

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript (Node.js)' },
  { id: 'python', name: 'Python 3' },
  { id: 'cpp', name: 'C++ 17' },
];

export default function ProblemDetail() {
  const { id } = useParams();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(mockProblem.defaultCode['javascript']);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(mockProblem.defaultCode[lang]);
  };

  const runCode = (isSubmit = false) => {
    setIsRunning(true);
    setOutput(null);
    setTimeout(() => {
      setIsRunning(false);
      if (isSubmit) {
        setOutput({ status: 'Accepted', runtime: '43ms', memory: '42.1 MB', details: 'Beats 98.2% of users with JavaScript' });
      } else {
        setOutput({ status: 'Finished', runtime: '52ms', memory: '41.5 MB', stdout: 'Testcases passed: 3/3' });
      }
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background">
      {/* Left Panel: Problem Description */}
      <div className="w-full md:w-1/2 h-full flex flex-col border-r border-white/5 bg-surface/30">
        <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-background/50">
          <Link to="/problems" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-3">
              1. {mockProblem.title}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="flex gap-3 mb-6">
            <span className="text-xs px-2.5 py-1 rounded-full font-bold tracking-wide border text-green-400 bg-green-400/10 border-green-400/20">
              {mockProblem.difficulty}
            </span>
            <div className="flex gap-2">
              {mockProblem.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 text-zinc-400 bg-white/5 border border-white/10 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-zinc-300">
            {mockProblem.description.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-4">{paragraph}</p>
            ))}

            <h3 className="text-white font-bold text-lg mt-8 mb-4">Examples:</h3>
            <div className="space-y-6">
              {mockProblem.examples.map((ex, i) => (
                <div key={i} className="bg-surface/50 border border-white/10 rounded-xl p-4 font-mono text-sm max-w-full overflow-x-auto">
                  <div className="mb-2"><span className="text-zinc-500 select-none">Input: </span><span className="text-cyan-400">{ex.input}</span></div>
                  <div className="mb-2"><span className="text-zinc-500 select-none">Output: </span><span className="text-green-400">{ex.output}</span></div>
                  {ex.explanation && (
                    <div><span className="text-zinc-500 select-none flex-shrink-0">Explanation: </span><span className="text-zinc-300 font-sans">{ex.explanation}</span></div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
              <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-3">
                <Clock className="text-primary w-5 h-5" />
                <div>
                  <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Time Limit</div>
                  <div className="font-mono text-sm mt-0.5">{mockProblem.timeLimit}</div>
                </div>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-3">
                <Cpu className="text-purple-400 w-5 h-5" />
                <div>
                  <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Memory Limit</div>
                  <div className="font-mono text-sm mt-0.5">{mockProblem.memoryLimit}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Editor & Console */}
      <div className="w-full md:w-1/2 h-full flex flex-col">
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-white/5 bg-background flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-zinc-500" />
            <select 
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-sm font-medium outline-none text-zinc-300 hover:text-white cursor-pointer"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id} className="bg-surface text-foreground">{lang.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/5 text-zinc-300">
              <Terminal className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              fontLigatures: true,
              lineHeight: 24,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              renderLineHighlight: "all",
            }}
          />
        </div>

        {/* Console / Output Area */}
        <div className="h-[200px] border-t border-white/5 bg-background flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface/30">
            <div className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Console
            </div>
            <div className="flex gap-2 text-xs">
              {output && (
                <div className="flex items-center gap-4 text-zinc-400 mr-4 font-mono">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {output.runtime}</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-purple-400" /> {output.memory}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
            {isRunning ? (
              <div className="flex items-center justify-center h-full text-zinc-500 gap-3">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Executing code...
              </div>
            ) : output ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <div className={`font-bold text-lg flex items-center gap-2 ${output.status === 'Accepted' ? 'text-green-500' : 'text-blue-400'}`}>
                  {output.status === 'Accepted' ? <CheckCircle className="w-5 h-5" /> : <Terminal className="w-5 h-5" />} 
                  {output.status}
                </div>
                {output.details && <div className="text-zinc-300 pl-7">{output.details}</div>}
                {output.stdout && <div className="text-zinc-400 pl-7">{output.stdout}</div>}
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
                  Your code ran successfully. Ready for submission.
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 italic">
                Run code or submit to see output
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/5 bg-surface/30 flex justify-end gap-3">
            <button 
              onClick={() => runCode(false)}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              <Play className="w-4 h-4" fill="currentColor" /> Run Code
            </button>
            <button 
              onClick={() => runCode(true)}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <Send className="w-4 h-4" /> Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

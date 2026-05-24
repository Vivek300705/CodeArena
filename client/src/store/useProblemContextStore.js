import { create } from 'zustand';

/**
 * Global store that holds the "active problem" context.
 * ProblemDetail writes into it; the Chatbot reads from it so the AI
 * can see what the user is currently working on.
 */
export const useProblemContextStore = create((set) => ({
  // Current problem metadata
  problem: null,
  // Code the user has typed in the editor
  code: '',
  // Language selected in the editor
  language: '',

  setProblem: (problem) => set({ problem }),
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  clearContext: () => set({ problem: null, code: '', language: '' }),
}));

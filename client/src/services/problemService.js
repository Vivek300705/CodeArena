import { api } from './api.js';

/**
 * Fetch all problems — GET /api/problems
 */
export const getProblems = async () => {
  const res = await api.get('/api/problems');
  return res.data.problems; // Array of problems is under 'problems' key
};

/**
 * Fetch a single problem by its MongoDB _id — GET /api/problems/:id
 */
export const getProblemById = async (id) => {
  const res = await api.get(`/api/problems/${id}`);
  return res.data; // The problem object is sent directly
};

/**
 * Submit code for judging — POST /api/v1/submissions
 * Returns the submission object with _id for polling / socket updates
 */
export const submitCode = async ({ problemId, code, language }) => {
  const res = await api.post('/api/v1/submissions', { problemId, code, language });
  return res.data.data;
};

/**
 * Fetch all submissions for the logged-in user — GET /api/v1/submissions
 */
export const getSubmissions = async () => {
  const res = await api.get('/api/v1/submissions');
  return res.data.data;
};

/**
 * ADMIN: Create a new problem
 * POST /api/problems
 */
export const createProblem = async (problemData) => {
  const res = await api.post('/api/problems', problemData);
  return res.data;
};

/**
 * ADMIN: Update an existing problem
 * PUT /api/problems/:id
 */
export const updateProblem = async (id, problemData) => {
  const res = await api.put(`/api/problems/${id}`, problemData);
  return res.data;
};

/**
 * ADMIN: Delete a problem
 * DELETE /api/problems/:id
 */
export const deleteProblem = async (id) => {
  const res = await api.delete(`/api/problems/${id}`);
  return res.data;
};

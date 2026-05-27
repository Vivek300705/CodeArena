import { GoogleGenAI } from '@google/genai';
import logger from '../config/logger.js';
import Problem from '../models/Problem.model.js';

/* ── Site navigation knowledge ─────────────────────────────── */
const SITE_MAP = `
CODEARENA SITE NAVIGATION:
- / → Landing / Home page
- /problems → Browse all problems (filterable by difficulty, tags, search)
- /problems/:id → Solve a specific problem (code editor + submit)
- /leaderboard → Global leaderboard rankings
- /dashboard → User dashboard (login required) — stats, recent submissions
- /history → Submission history (login required)
- /duel → Duel Arena — 1v1 real-time coding battles (login required)
- /login → Login page
- /register → Register / Sign up
- /forgot-password → Password reset
- /admin → Admin dashboard (admin only) — manage problems
- /about → About CodeArena
- /creator → Meet the Creator (Vivek Kumar Sulaniya)
- /faq → Frequently Asked Questions
- /contact → Contact page
- /terms → Terms & Conditions
- /privacy-policy → Privacy Policy
`;

/* ── Tool declarations for Gemini function calling ─────────── */
const searchProblemsTool = {
  name: 'searchProblems',
  description: 'Search for problems on the CodeArena platform by keyword, tag, or difficulty. Use this when the user asks about finding problems, topics, or wants to know what problems are available.',
  parameters: {
    type: 'OBJECT',
    properties: {
      query: {
        type: 'STRING',
        description: 'Search keyword to match against problem titles and tags (e.g. "array", "two sum", "dynamic programming"). Leave empty to browse all.',
      },
      difficulty: {
        type: 'STRING',
        description: 'Filter by difficulty level: "easy", "medium", or "hard". Leave empty for all difficulties.',
        enum: ['easy', 'medium', 'hard'],
      },
      tag: {
        type: 'STRING',
        description: 'Filter by a specific tag (e.g. "Array", "String", "Graph"). Leave empty for all tags.',
      },
    },
  },
};

/* ── Execute the search against MongoDB ────────────────────── */
async function executeSearch({ query, difficulty, tag }) {
  const filter = { isDeleted: { $ne: true } };

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (tag) {
    filter.tags = { $regex: new RegExp(tag, 'i') };
  }

  if (query) {
    filter.$or = [
      { title: { $regex: new RegExp(query, 'i') } },
      { tags: { $regex: new RegExp(query, 'i') } },
    ];
  }

  const problems = await Problem.find(filter)
    .select('title difficulty tags slug _id')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return problems;
}

/* ── Format search results for the AI ──────────────────────── */
function formatSearchResults(problems) {
  if (!problems || problems.length === 0) {
    return 'No problems found matching the search criteria.';
  }

  let result = `Found ${problems.length} problem(s):\n\n`;
  problems.forEach((p, i) => {
    result += `${i + 1}. **${p.title}** [${p.difficulty.toUpperCase()}] — Tags: ${(p.tags || []).join(', ') || 'None'} — Link: /problems/${p._id}\n`;
  });

  return result;
}

/* ── Build dynamic system instruction ──────────────────────── */
function buildSystemInstruction(problemContext, code, language) {
  let instruction = `You are an expert coding assistant integrated into the CodeArena competitive programming platform.
Your capabilities:
1. Help users solve programming doubts, explain concepts, and debug code
2. Search for problems on the platform by topic, difficulty, or keyword
3. Help users navigate the website and find features
4. Answer questions about problems — what topic they belong to, their difficulty, etc.

Always format code blocks using markdown. Keep responses concise and helpful.
When helping with a problem, guide the user step by step — do NOT give the full solution directly.
When sharing problem links, format them as clickable: [Problem Title](/problems/id)

${SITE_MAP}`;

  if (problemContext) {
    instruction += `\n\n--- ACTIVE PROBLEM CONTEXT ---
The user is currently working on:

**Title:** ${problemContext.title}
**Difficulty:** ${problemContext.difficulty}
**Tags:** ${(problemContext.tags || []).join(', ')}

**Description:**
${problemContext.description}`;

    if (problemContext.examples && problemContext.examples.length > 0) {
      instruction += `\n\n**Examples:**`;
      problemContext.examples.forEach((ex, i) => {
        instruction += `\nExample ${i + 1}: Input: ${ex.input} → Output: ${ex.output}`;
        if (ex.explanation) instruction += ` (${ex.explanation})`;
      });
    }

    instruction += `\n**Constraints:** Time Limit: ${problemContext.timeLimit}ms, Memory Limit: ${problemContext.memoryLimit}MB`;
  }

  if (code && code.trim()) {
    instruction += `\n\n--- USER'S CURRENT CODE (${language || 'unknown'}) ---
\`\`\`${language || ''}
${code}
\`\`\`
When the user asks for help, refer to their code above. Point out issues, suggest improvements, or explain what their code does.`;
  }

  return instruction;
}

/* ── Main handler ──────────────────────────────────────────── */
export const handleChat = async (req, res) => {
  try {
    const { message, history = [], problemContext = null, code = '', language = '' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      logger.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'AI service is currently unavailable' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Format the history for the Gemini API
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add the new message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const systemInstruction = buildSystemInstruction(problemContext, code, language);

    // First call — may trigger a function call
    let response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{
          functionDeclarations: [searchProblemsTool],
        }],
      }
    });

    // Check if the model wants to call a function
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const functionCall = parts.find(p => p.functionCall);

    if (functionCall) {
      const { name, args } = functionCall.functionCall;

      if (name === 'searchProblems') {
        // Execute the search
        const problems = await executeSearch(args || {});
        const searchResults = formatSearchResults(problems);

        // Add the function call and response to the conversation
        contents.push({
          role: 'model',
          parts: [{ functionCall: { name, args: args || {} } }]
        });

        contents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: name,
              response: { result: searchResults }
            }
          }]
        });

        // Second call — model formulates the final response using search results
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            tools: [{
              functionDeclarations: [searchProblemsTool],
            }],
          }
        });
      }
    }

    res.json({ response: response.text });
  } catch (error) {
    logger.error({ err: error }, 'Error in chatbot controller');
    res.status(500).json({ error: error.message || 'Failed to process chat message', details: error });
  }
};

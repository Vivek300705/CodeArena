import { api } from './api';

export const chatbotService = {
  /**
   * Send a message to the chatbot with optional problem context
   * @param {string} message - The new user message
   * @param {Array<{role: string, text: string}>} history - Previous conversation history
   * @param {Object|null} problemContext - The active problem (title, description, examples, etc.)
   * @param {string} code - The user's current code in the editor
   * @param {string} language - The programming language selected
   * @returns {Promise<string>} The AI's response text
   */
  sendMessage: async (message, history = [], problemContext = null, code = '', language = '') => {
    try {
      const response = await api.post('/api/chat', {
        message,
        history,
        problemContext,
        code,
        language,
      });
      return response.data.response;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }
};

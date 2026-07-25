const OpenAI = require('openai');
const env = require('../../config/env');

const openai = new OpenAI({ apiKey: env.ai.openaiKey });

/**
 * Chat completion — used for the SDS chatbot assistant
 */
const chatCompletion = async ({ messages, temperature = 0.3, maxTokens = 1500 }) => {
  const response = await openai.chat.completions.create({
    model: env.ai.openaiModel,
    messages,
    temperature,
    max_tokens: maxTokens,
  });
  return {
    content: response.choices[0].message.content,
    tokensUsed: response.usage?.total_tokens || 0,
    finishReason: response.choices[0].finish_reason,
  };
};

/**
 * Single text completion — used for quick extractions
 */
const complete = async (prompt, { temperature = 0.2, maxTokens = 2000 } = {}) => {
  const response = await openai.chat.completions.create({
    model: env.ai.openaiModel,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0].message.content;
};

module.exports = { chatCompletion, complete, openai };

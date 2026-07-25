const OpenAI = require('openai');
const env = require('../../config/env');

const openai = new OpenAI({ apiKey: env.ai.openaiKey });

/**
 * Main completion — used for SDS generation, compliance audit, SOP generation
 */
const complete = async (prompt, { temperature = 0.2, maxTokens = 4096, system } = {}) => {
  // OpenAI puts the system prompt inside the messages array
  const messages = [];
  if (system) {
    messages.push({ role: 'system', content: system });
  }
  messages.push({ role: 'user', content: prompt });

  const params = {
    model: env.ai.openaiModel,
    max_tokens: maxTokens,
    temperature,
    messages,
  };

  const response = await openai.chat.completions.create(params);
  
  return {
    content: response.choices[0].message.content,
    tokensUsed: response.usage?.total_tokens || 0,
    stopReason: response.choices[0].finish_reason,
  };
};

/**
 * Multi-turn conversation — for complex structured generation with back-and-forth
 */
const conversation = async (messages, { temperature = 0.2, maxTokens = 4096, system } = {}) => {
  // Construct the final message array, inserting the system prompt at the start if provided
  const finalMessages = [];
  if (system) {
    finalMessages.push({ role: 'system', content: system });
  }
  finalMessages.push(...messages);

  const params = {
    model: env.ai.openaiModel,
    max_tokens: maxTokens,
    temperature,
    messages: finalMessages,
  };

  const response = await openai.chat.completions.create(params);
  
  return {
    content: response.choices[0].message.content,
    tokensUsed: response.usage?.total_tokens || 0,
    stopReason: response.choices[0].finish_reason, 
  };
};

module.exports = { complete, conversation, openai };
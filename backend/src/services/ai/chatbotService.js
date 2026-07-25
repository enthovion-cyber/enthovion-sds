const { chatCompletion } = require('./openaiService');

const SYSTEM_PROMPT = `You are SafeBot Compliance Copilot for SafeSheet AI.
You do not only answer; you also reason, decide, and recommend actions.
Your output should help operators execute compliance decisions quickly.

RULES:
- Only answer questions related to the SDS document provided in the context
- If information is not in the SDS, say "This information is not in the current SDS. Please consult your EHS manager."
- Always prioritise worker safety — if in doubt, advise caution
- Keep answers concise and practical — workers need actionable guidance
- Return structured operator output with: compliance_status, reasoning, fix_suggestion, action_label
- For emergency situations, always direct to emergency services first
- Never recommend ignoring safety precautions
- Support questions in multiple languages — respond in the same language as the user's question`;

/**
 * Sends a user message and returns AI response using SDS context
 */
const sendMessage = async ({ userMessage, sdsData, conversationHistory = [], language = 'en' }) => {
  // Build SDS context summary for the AI
  const sdsContext = buildSdsContext(sdsData);

  const messages = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}

CURRENT SDS DOCUMENT CONTEXT:
Chemical: ${sdsData.chemical_name} (CAS: ${sdsData.cas_number || 'N/A'})
${sdsContext}

Response language preference: ${language}
Return JSON only with this schema:
{
  "compliance_status": "Compliant | Not compliant | Needs review",
  "reasoning": "short reasoning with SDS evidence",
  "fix_suggestion": "specific corrective action",
  "action_label": "Auto-fix SDS or empty"
}`,
    },
    // Include conversation history (last 10 messages for context)
    ...conversationHistory.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const result = await chatCompletion({
    messages,
    temperature: 0.3,
    maxTokens: 1000,
  });

  let structured;
  try {
    structured = JSON.parse(result.content);
  } catch {
    structured = null;
  }

  const fallbackMessage = result.content;
  const responseText = structured
    ? [
        `**Decision:** ${structured.compliance_status || 'Needs review'}`,
        structured.reasoning ? `**Reasoning:** ${structured.reasoning}` : null,
        structured.fix_suggestion ? `**Suggested fix:** ${structured.fix_suggestion}` : null,
        structured.action_label ? `**Action:** ${structured.action_label}` : null,
      ].filter(Boolean).join('\n\n')
    : fallbackMessage;

  return {
    response: responseText,
    structured,
    tokensUsed: result.tokensUsed,
    model: 'gpt-4o-mini',
  };
};

/**
 * Builds a focused context string from SDS sections for the AI
 */
const buildSdsContext = (sdsData) => {
  const s = sdsData.sections || {};
  const lines = [];

  if (s.section2?.content) {
    const h = s.section2.content;
    if (h.signal_word) lines.push(`Signal Word: ${h.signal_word}`);
    if (h.hazard_statements?.length) lines.push(`Hazards: ${h.hazard_statements.join('; ')}`);
    if (h.pictograms?.length) lines.push(`GHS Pictograms: ${h.pictograms.join(', ')}`);
  }

  if (s.section4?.content) {
    const fa = s.section4.content;
    lines.push(`First Aid - Inhalation: ${fa.inhalation || 'N/A'}`);
    lines.push(`First Aid - Skin: ${fa.skin_contact || 'N/A'}`);
    lines.push(`First Aid - Eyes: ${fa.eye_contact || 'N/A'}`);
  }

  if (s.section8?.content) {
    const e = s.section8.content;
    if (e.ppe) {
      lines.push(`Required PPE - Gloves: ${e.ppe.hand || 'N/A'}`);
      lines.push(`Required PPE - Eyes: ${e.ppe.eye || 'N/A'}`);
      lines.push(`Required PPE - Respiratory: ${e.ppe.respiratory || 'N/A'}`);
    }
    if (e.exposure_limits?.length) {
      const lim = e.exposure_limits[0];
      lines.push(`Exposure Limit (OSHA PEL): ${lim.osha_pel || 'N/A'}`);
      lines.push(`Exposure Limit (ACGIH TLV): ${lim.acgih_tlv || 'N/A'}`);
    }
  }

  if (s.section7?.content) {
    const hs = s.section7.content;
    if (hs.handling_precautions) lines.push(`Handling: ${hs.handling_precautions}`);
    if (hs.storage_conditions) lines.push(`Storage: ${hs.storage_conditions}`);
  }

 if (s.section5?.content) {
  const fire = s.section5.content;
  const suitable = fire.extinguishing_media?.suitable;

  if (suitable) {
    // [].concat ensures that even if 'suitable' is a string, it becomes [string]
    const joinedMedia = [].concat(suitable).join(', ');
    lines.push(`Fire - Suitable extinguishers: ${joinedMedia}`);
  }
}

  return lines.join('\n');
};

module.exports = { sendMessage };

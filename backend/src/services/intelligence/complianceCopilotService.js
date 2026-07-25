'use strict';
const OpenAI = require('openai');
const env = require('../../config/env');
const { detectConflicts } = require('../compliance/regulatoryEngine');
const { scoreDocument } = require('../validation/aiValidationService');
const client = new OpenAI({ apiKey: env.ai.openaiKey });

const SYSTEM = `You are SafeSheet Copilot — an AI compliance operator.
For every message: 1) Answer directly 2) State COMPLIANT ✅ / NON-COMPLIANT ❌ / PARTIAL ⚠️ if relevant 3) Cite GHS regulation clause 4) List issues found 5) Suggest specific fixes 6) Flag auto-fixable items.`;

const sendCopilotMessage = async ({ userMessage, sdsData, conversationHistory=[], jurisdiction='US_OSHA', language='en' }) => {
  const s=sdsData.sections||{};
  const ctx=[
    `Chemical: ${sdsData.chemical_name} CAS:${sdsData.cas_number||'N/A'}`,
    `Signal: ${s.section2?.content?.signal_word||'N/A'}`,
    `H-statements: ${(s.section2?.content?.hazard_statements||[]).join('; ')}`,
    `PPE: Resp=${s.section8?.content?.respiratory_protection||'N/A'} Hands=${s.section8?.content?.hand_protection||'N/A'} Eyes=${s.section8?.content?.eye_protection||'N/A'}`,
    `Flash point: ${s.section9?.content?.flash_point||'N/A'}`,
    `OELs: ${JSON.stringify((s.section8?.content?.exposure_limits||[]).slice(0,2))}`,
    `Storage: ${s.section7?.content?.storage_conditions||'N/A'}`,
    `UN: ${s.section14?.content?.un_number||'N/A'}`,
  ].join('\n');
  const snap=scoreDocument(sdsData);
  const conflicts=detectConflicts(sdsData);
  const messages=[
    {role:'system',content:`${SYSTEM}\n\nSDS:\n${ctx}\nCompliance: ${snap.overall_score}/100 ${snap.status_label}\nConflicts: ${conflicts.length}\nJurisdiction: ${jurisdiction}\nRespond in: ${language==='ar'?'Arabic':'English'}`},
    ...conversationHistory.slice(-8).map(m=>({role:m.role,content:m.content})),
    {role:'user',content:userMessage},
  ];
  const resp=await client.chat.completions.create({model:env.ai.openaiModel,messages,temperature:0.2,max_tokens:1000});
  const text=resp.choices[0].message.content;
  const autoFixes=[];
  if(text.includes('exposure limit')&&!(s.section8?.content?.exposure_limits?.length)) autoFixes.push({type:'add_field',section:'section8',field:'exposure_limits',description:'Add exposure limits (OELs) to Section 8',auto_fixable:true});
  if(text.includes('flash point')&&!s.section9?.content?.flash_point) autoFixes.push({type:'add_field',section:'section9',field:'flash_point',description:'Add flash point to Section 9',auto_fixable:true});
  if(text.includes('P-statement')&&!(s.section2?.content?.precautionary_statements?.prevention?.length)) autoFixes.push({type:'add_field',section:'section2',field:'precautionary_statements',description:'Add P-statements to Section 2',auto_fixable:true});
  return {response:text,auto_fixes:autoFixes,tokens_used:resp.usage?.total_tokens||0,model:'gpt-4o',has_compliance_issue:text.includes('NON-COMPLIANT')||text.includes('❌'),has_auto_fix:autoFixes.length>0};
};

const generateAutoFix = async (sdsData, { section, field, issue, jurisdiction='US_OSHA' }) => {
  const content=sdsData.sections?.[section]?.content||{};
  const resp=await client.chat.completions.create({model:env.ai.openaiModel,messages:[{role:'user',content:`Fix SDS field for ${sdsData.chemical_name}. Section:${section} Field:${field} Issue:${issue} Current:${JSON.stringify(content[field])} Full section:${JSON.stringify(content).slice(0,500)}\nReturn JSON:{"fixed_value":..., "explanation":"...", "regulation_reference":"..."}`}],temperature:0.1,max_tokens:600,response_format:{type:'json_object'}});
  return {...JSON.parse(resp.choices[0].message.content),section,field,generated_at:new Date().toISOString()};
};

const generateSafetySummary = async (sdsData, language='en') => {
  const s=sdsData.sections||{};
  const resp=await client.chat.completions.create({model:env.ai.openaiModel,messages:[{role:'user',content:`Safety briefing for workers for ${sdsData.chemical_name}. H-statements:${(s.section2?.content?.hazard_statements||[]).join('; ')} PPE:${JSON.stringify({resp:s.section8?.content?.respiratory_protection,hands:s.section8?.content?.hand_protection,eyes:s.section8?.content?.eye_protection})} Storage:${s.section7?.content?.storage_conditions} Language:${language==='ar'?'Arabic':'English'}\nReturn JSON:{"title":"","signal_word":"","key_hazards":[""],"required_ppe":[""],"critical_dont":[""],"emergency_actions":{"skin":"","eyes":"","inhalation":""},"storage_summary":"","worker_instruction":""}`}],temperature:0.2,max_tokens:700,response_format:{type:'json_object'}});
  return JSON.parse(resp.choices[0].message.content);
};

module.exports = { sendCopilotMessage, generateAutoFix, generateSafetySummary };

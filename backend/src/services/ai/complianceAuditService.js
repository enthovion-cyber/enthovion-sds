const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const JURISDICTION_RULES = {
  US_OSHA: {
    name: 'US OSHA HazCom 2012',
    standard: '29 CFR 1910.1200',
  },

  EU_CLP: {
    name: 'EU CLP Regulation',
    standard: 'EC No 1272/2008 + REACH',
  },

  UK_HSE: {
    name: 'UK GB CLP (post-Brexit)',
    standard: 'REACH UK + EH40',
  },

  SA_SASO: {
    name: 'Saudi SASO GHS Rev 7',
    standard: 'GSO-1651',
  },
};

const SYSTEM_PROMPT = `
You are a senior EHS compliance auditor with expert knowledge of GHS SDS regulations.

Audit SDS documents section-by-section.

Return ONLY valid JSON.

Never return markdown.
Never wrap the JSON inside \`\`\`.
`;

const auditSds = async (sdsData, jurisdiction = 'US_OSHA') => {
  try {
    // Validation
    if (!sdsData) {
      return {
        failed: true,
        score: 0,
        status: 'critical',
        summary: 'SDS data not found',
        gaps: [],
        audited_at: new Date().toISOString(),
      };
    }

    if (!sdsData.sections) {
      return {
        failed: true,
        score: 0,
        status: 'critical',
        summary: 'No SDS sections found',
        gaps: [],
        audited_at: new Date().toISOString(),
      };
    }

    const rules =
      JURISDICTION_RULES[jurisdiction] ||
      JURISDICTION_RULES.US_OSHA;

    const prompt = `
Audit this SDS document for compliance with ${rules.name}
(${rules.standard})

SDS DATA:

${JSON.stringify(sdsData.sections, null, 2)}

Chemical: ${sdsData.chemical_name}
CAS: ${sdsData.cas_number || 'N/A'}

Return:

{
  "jurisdiction":"",
  "standard":"",
  "score":0,
  "score_breakdown":{
     "completeness":0,
     "accuracy":0,
     "currency":0,
     "format":0
  },
  "status":"",
  "summary":"",
  "gaps":[],
  "passed_checks":[],
  "recommendations":[]
}

Return ONLY JSON.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_object',
      },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    let report;

    try {
      report = JSON.parse(content);
    } catch (err) {
      console.error('Invalid JSON returned by OpenAI');
      console.log(content);

      return {
        failed: true,
        error: 'Invalid JSON returned by OpenAI',
        score: 0,
        status: 'critical',
        summary: 'Invalid AI response',
        gaps: [],
        audited_at: new Date().toISOString(),
      };
    }

    return {
      ...report,
      sds_id: sdsData.id,
      tokens_used: response.usage?.total_tokens || 0,
      audited_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Audit Logic Failure:');
    console.error(error);

    return {
      failed: true,
      error: error.message,
      score: 0,
      status: 'critical',
      summary: 'Audit failed',
      gaps: [],
      audited_at: new Date().toISOString(),
    };
  }
};

module.exports = {
  auditSds,
};
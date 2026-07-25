const pdfParse = require('pdf-parse');
const { complete } = require('./anthropicService');

const SYSTEM_PROMPT = `You are an expert at extracting structured data from Safety Data Sheet (SDS/MSDS) documents.
You accurately identify all 16 GHS sections, extract their content, and return structured JSON.
You handle legacy MSDS formats, non-standard section ordering, and documents in various languages.
When content is unclear or partially legible, you mark it as [EXTRACTED - VERIFY] rather than guessing.`;

/**
 * Extracts structured SDS data from a PDF buffer
 */
const extractFromPdf = async (fileBuffer, originalName) => {
  // Parse PDF to raw text
  let rawText = '';
  try {
    const pdfData = await pdfParse(fileBuffer);
    rawText = pdfData.text;
  } catch (e) {
    throw new Error(`Failed to parse PDF: ${e.message}`);
  }

  if (!rawText || rawText.trim().length < 100) {
    throw new Error('PDF appears to be a scanned image or has no extractable text. Use image upload instead.');
  }

  return extractFromText(rawText, originalName);
};

/**
 * Extracts structured SDS sections from plain text
 */
const extractFromText = async (rawText, sourceName = 'uploaded document') => {
  // Truncate to 15,000 chars to fit within token limits
  const truncated = rawText.length > 15000
    ? rawText.substring(0, 15000) + '\n... [DOCUMENT TRUNCATED FOR PROCESSING]'
    : rawText;

  const prompt = `Extract all information from this SDS/MSDS document and return it as structured JSON.
Source: ${sourceName}

RAW SDS TEXT:
${truncated}

Extract into this exact JSON structure (same as generated SDS format):
{
  "chemical_name": "extracted name",
  "cas_number": "extracted CAS or null",
  "formula": "extracted formula or null",
  "product_code": "extracted code or null",
  "detected_language": "en|ar|de|fr|etc",
  "detected_jurisdiction": "US_OSHA|EU_CLP|UK_HSE|etc",
  "document_date": "extracted date or null",
  "extraction_confidence": <0-100>,
  "sections": {
    "section1": { "title": "Identification", "content": {}, "confidence": <0-100>, "issues": [] },
    "section2": { "title": "Hazard Identification", "content": {}, "confidence": <0-100>, "issues": [] },
    "section3": { "title": "Composition", "content": {}, "confidence": <0-100>, "issues": [] },
    "section4": { "title": "First-Aid Measures", "content": {}, "confidence": <0-100>, "issues": [] },
    "section5": { "title": "Fire-Fighting Measures", "content": {}, "confidence": <0-100>, "issues": [] },
    "section6": { "title": "Accidental Release Measures", "content": {}, "confidence": <0-100>, "issues": [] },
    "section7": { "title": "Handling and Storage", "content": {}, "confidence": <0-100>, "issues": [] },
    "section8": { "title": "Exposure Controls/PPE", "content": {}, "confidence": <0-100>, "issues": [] },
    "section9": { "title": "Physical and Chemical Properties", "content": {}, "confidence": <0-100>, "issues": [] },
    "section10": { "title": "Stability and Reactivity", "content": {}, "confidence": <0-100>, "issues": [] },
    "section11": { "title": "Toxicological Information", "content": {}, "confidence": <0-100>, "issues": [] },
    "section12": { "title": "Ecological Information", "content": {}, "confidence": <0-100>, "issues": [] },
    "section13": { "title": "Disposal Considerations", "content": {}, "confidence": <0-100>, "issues": [] },
    "section14": { "title": "Transport Information", "content": {}, "confidence": <0-100>, "issues": [] },
    "section15": { "title": "Regulatory Information", "content": {}, "confidence": <0-100>, "issues": [] },
    "section16": { "title": "Other Information", "content": {}, "confidence": <0-100>, "issues": [] }
  },
  "fields_requiring_review": ["list of low-confidence fields"]
}

Return ONLY the JSON object. No markdown.`;

  const result = await complete(prompt, {
    system: SYSTEM_PROMPT,
    maxTokens: 6000,
    temperature: 0.1,
  });

  let extracted;
  try {
    const clean = result.content.replace(/```json|```/g, '').trim();
    extracted = JSON.parse(clean);
  } catch (e) {
    throw new Error('Extraction failed — could not parse AI response. Please try again.');
  }

  return {
    ...extracted,
    source_file: sourceName,
    extracted_at: new Date().toISOString(),
    tokens_used: result.tokensUsed,
  };
};

module.exports = { extractFromPdf, extractFromText };

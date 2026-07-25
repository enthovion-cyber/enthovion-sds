const sdsModel = require('../../models/sdsModel');
const sopModel = require('../../models/sopModel');
const { generateSop } = require('../../services/ai/sopGeneratorService');
const { created, notFound, badRequest } = require('../../utils/responseHelper');

const generateSopController = async (req, res) => {
  try {
    const { sdsId, language = 'en', type = 'handling' } = req.body;

    const sds = await sdsModel.findById(sdsId);
    if (!sds) return notFound(res, 'SDS document not found');
    
    if (sds.status !== 'approved') {
      return badRequest(res, 'SDS must be approved before generating an SOP');
    }

    // Wrap the AI call in a try/catch specifically for AI failures
    let sopContent;
    try {
      sopContent = await generateSop({ sdsData: sds, language, type, sdsId });
    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      return badRequest(res, 'Failed to generate SOP content via AI. Please try again.');
    }

    const saved = await sopModel.create({
      sds_id: sdsId,
      user_id: req.user.userId,
      language,
      type,
      title: sopContent.title || `SOP - ${sds.chemical_name}`,
      content: sopContent, // Ensure your schema accepts the JSON object
      is_rtl: sopContent.is_rtl || false,
      status: 'draft',
      ai_model: 'gpt-4o', // Updated to match your actual service
      tokens_used: sopContent.tokens_used || 0,
    });

    return created(res, saved, 'SOP generated successfully');
  } catch (error) {
    console.error('General Controller Error:', error);
    // Generic catch-all error handling
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = generateSopController;

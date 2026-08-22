const { chatWithAI, generateItinerary } = require('../services/geminiService');

async function handleChat(req, res, next) {
  try {
    const { message, conversationHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message field is required.' });
    }

    const reply = await chatWithAI(message, conversationHistory || []);
    res.json({ reply });
  } catch (error) {
    next(error);
  }
}

async function handleGeneratePlan(req, res, next) {
  try {
    const { destination, days, budget, interests } = req.body;
    const plan = await generateItinerary({
      destination: destination || 'Kyoto',
      days: Number(days) || 3,
      budget: Number(budget) || 60000,
      interests: interests || []
    });

    res.json({ plan });
  } catch (error) {
    next(error);
  }
}

module.exports = { handleChat, handleGeneratePlan };

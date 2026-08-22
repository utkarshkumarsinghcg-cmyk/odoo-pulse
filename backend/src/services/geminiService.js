const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Fallback itinerary generator for demo resilience
 * Used if GEMINI_API_KEY is missing, rate-limited, or fails.
 */
function getFallbackItinerary(destination, days = 3, budget = 50000, interests = []) {
  const destName = destination || 'Kyoto, Japan';
  console.log(`[Gemini AI] Returning fallback itinerary for ${destName} (${days} days)`);

  const sampleDays = [
    {
      dayNumber: 1,
      title: 'Arrival & Cultural Immersion',
      summary: `Welcome to ${destName}! Settle into your boutique stay, explore local markets, and enjoy a traditional dinner.`,
      budget: Math.round(budget / days),
      activities: [
        { name: 'Hotel Check-in & Refresh', description: 'Unpack and settle into your hotel in the central district.', type: 'stay', cost: 0, duration: '1h', time_slot: '14:00', address: 'Central City Center' },
        { name: 'Old Town Heritage Walk', description: 'Stroll through historic cobblestone streets and artisan shops.', type: 'sightseeing', cost: 500, duration: '2h', time_slot: '15:30', address: 'Historic Quarter' },
        { name: 'Welcome Dinner at Local Bistro', description: 'Sample authentic regional cuisine and specialty drinks.', type: 'food', cost: 2500, duration: '2h', time_slot: '19:00', address: 'Bistro Lane' }
      ]
    },
    {
      dayNumber: 2,
      title: 'Iconic Landmarks & Secret Spots',
      summary: `A full day exploring top landmarks, scenic overlooks, and hidden local cafes.`,
      budget: Math.round(budget / days),
      activities: [
        { name: 'Sunrise Vantage Point Walk', description: 'Catch early morning light over the city landscape.', type: 'nature', cost: 0, duration: '1.5h', time_slot: '07:30', address: 'Sunset Hill Path' },
        { name: 'Grand Temple / Monument Tour', description: 'Guided tour of the most famous cultural architecture.', type: 'culture', cost: 1200, duration: '2.5h', time_slot: '10:00', address: 'Heritage Complex' },
        { name: 'Artisan Cafe Lunch', description: 'Relaxed afternoon coffee and organic lunch bowl.', type: 'food', cost: 1200, duration: '1h', time_slot: '13:00', address: 'Garden Cafe' },
        { name: 'Evening Sunset Cruise / Walk', description: 'Unwind along the river promenade as the lights turn on.', type: 'relaxation', cost: 1800, duration: '2h', time_slot: '18:00', address: 'Riverside Walk' }
      ]
    },
    {
      dayNumber: 3,
      title: 'Local Flavors & Farewell',
      summary: `Immerse in local crafts, food tasting, and memorable souvenirs before departure.`,
      budget: Math.round(budget / days),
      activities: [
        { name: 'Morning Food & Spice Market', description: 'Guided market walk sampling seasonal delicacies.', type: 'food', cost: 1500, duration: '2h', time_slot: '09:30', address: 'Central Market' },
        { name: 'Art Museum & Craft Workshop', description: 'Explore contemporary exhibits and local pottery craft.', type: 'culture', cost: 800, duration: '2h', time_slot: '12:00', address: 'Art District' },
        { name: 'Farewell Tasting Menu', description: 'Celebratory multi-course dinner before heading home.', type: 'food', cost: 3500, duration: '2h', time_slot: '19:00', address: 'Skyline Restaurant' }
      ]
    }
  ];

  return {
    destination: destName,
    totalDays: Math.min(days, sampleDays.length),
    currency: '₹',
    totalBudget: budget,
    days: sampleDays.slice(0, days),
    isFallback: true
  };
}

/**
 * Generate Day-by-Day Itinerary using Gemini Flash Model
 */
async function generateItinerary({ destination, days = 3, budget = 60000, interests = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.warn('[Gemini AI] GEMINI_API_KEY missing in .env — using resilient fallback itinerary.');
    return getFallbackItinerary(destination, days, budget, interests);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are SafarSutra's expert AI travel planner ("the thread that guides your journey").
Generate a detailed ${days}-day travel itinerary for "${destination}".
Total Budget: ₹${budget}.
Interests: ${interests.length > 0 ? interests.join(', ') : 'general sightseeing, local food, culture'}.

Return ONLY a strict JSON object matching this structure (no markdown formatting, no code block backticks):
{
  "destination": "${destination}",
  "totalDays": ${days},
  "currency": "₹",
  "totalBudget": ${budget},
  "days": [
    {
      "dayNumber": 1,
      "title": "Day title",
      "summary": "Brief summary",
      "budget": 15000,
      "activities": [
        {
          "name": "Activity Name",
          "description": "Short 1-sentence description",
          "type": "sightseeing|food|culture|stay|transport",
          "cost": 500,
          "duration": "1.5h",
          "time_slot": "09:00",
          "address": "City landmark/street"
        }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Clean potential markdown wrap
    const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    const parsedData = JSON.parse(cleanedJson);

    return {
      ...parsedData,
      isFallback: false
    };

  } catch (error) {
    console.error('[Gemini AI Error]', error.message);
    console.warn('[Gemini AI] Falling back to pre-configured itinerary.');
    return getFallbackItinerary(destination, days, budget, interests);
  }
}

/**
 * Conversational AI assistant for Safar AI ChatBot
 */
async function chatWithAI(userMessage, conversationHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return `Namaste! 🙏 I am Safar AI.\n\nHere is a recommendation for "${userMessage}":\n\n• **Best Time to Visit:** October to March for pleasant weather.\n• **Recommended Stay:** 3 to 4 days for comprehensive sightseeing.\n• **Estimated Daily Budget:** ₹3,500 – ₹7,000 per day including Satvik meals and local heritage passes.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are Safar AI, the intelligent spiritual & global travel guide for SafarSutra / GlobeTrotter.
Provide helpful, formatted advice with bullet points, Aarti pass timings, budget estimates in USD & INR, temple etiquette, and dining recommendations with emojis.\n\nUser Question: ${userMessage}`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('[Gemini AI Chat Error]', err.message);
    return `Namaste! 🙏 For "${userMessage}":\n\n1. **Best Time to Visit:** Oct - Mar\n2. **Suggested Duration:** 3-5 days\n3. **Est. Budget:** $45 - $80 / day\n\nHave a blessed journey!`;
  }
}

module.exports = { generateItinerary, getFallbackItinerary, chatWithAI };


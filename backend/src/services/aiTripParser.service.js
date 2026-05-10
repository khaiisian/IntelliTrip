const Groq = require('groq-sdk');
const { withTimeout } = require('./preferenceParser.service');

const buildFullTripPrompt = (userInput, categories) => `
You are a travel assistant. Extract all trip details from the user's message.
Return ONLY valid JSON with this exact structure:

{
  "trip": {
    "trip_name": "a short descriptive name (max 50 chars)",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "budget": number,
    "start_location_name": "name of start location if explicitly mentioned, otherwise null",
    "end_location_name": "name of end location if explicitly mentioned, otherwise null"
  },
  "schedule": {
    "day_start_time": "HH:MM",
    "day_end_time": "HH:MM"
  },
  "preferences": {
    "category_weights": { ${categories.map(c => `"${c.category_id}": 0.5`).join(', ')} },
    "travel_pace": "relaxed",
    "budget_style": "mid-range",
    "time_preference": "none"
  }
}

Rules:
- Dates must be valid and start_date <= end_date. Use null for missing dates.
- Budget must be a positive number. If not mentioned, use null.
- Schedule day_start_time defaults to "09:00" and day_end_time defaults to "17:00".
- Location names must be null if not explicitly mentioned.
- Category weights: 0.9 for love/enjoy/prefer, 0.1 for hate/dislike/avoid, 0.5 for neutral.
- travel_pace must be one of "relaxed", "moderate", "packed".
- budget_style must be one of "budget", "mid-range", "luxury".
- time_preference must be one of "morning", "afternoon", "evening", "none".

Available categories: ${JSON.stringify(categories.map(c => ({
    id: c.category_id,
    name: c.category_name
})))}

User input: "${userInput}"
`;

exports.parseFullTrip = async (userInput, categories) => {
    if (!process.env.GROQ_API_KEY)
        throw new Error('GROQ_API_KEY is not configured');

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    const completion = await withTimeout(groq.chat.completions.create({
        messages: [{ role: 'user', content: buildFullTripPrompt(userInput, categories) }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' }
    }));

    const content = completion.choices?.[0]?.message?.content;
    if (!content)
        throw new Error('Groq returned an empty full-trip response');

    return JSON.parse(content);
};

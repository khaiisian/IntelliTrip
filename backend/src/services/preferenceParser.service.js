const Groq = require('groq-sdk');

const TIMEOUT_MS = 10000;

const withTimeout = (promise, timeoutMs = TIMEOUT_MS) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Groq preference parsing timed out')), timeoutMs);
        })
    ]);
};

const buildPrompt = (userInput, categories) => `
You are a travel preference parser. Convert the user's request into a JSON object.

User input: "${userInput}"

Available categories: ${JSON.stringify(categories.map(c => ({
    id: c.category_id,
    name: c.category_name
})))}

Rules:
- Assign a weight between 0.0 and 1.0 for each category (0 = dislike, 1 = love).
- If a category is not mentioned, assign a neutral weight of 0.5.
- Detect time preference: one of "morning", "afternoon", "evening", "none".
- Detect budget flexibility: one of "low", "medium", "high", "none".

Return ONLY valid JSON, no explanation. Format:
{
  "category_weights": { "1": 0.9, "2": 0.3 },
  "time_preference": "morning",
  "budget_flexibility": "medium"
}
`;

const createNeutralPreferences = (categories) => ({
    category_weights: categories.reduce((weights, category) => {
        weights[String(category.category_id)] = 0.5;
        return weights;
    }, {}),
    time_preference: 'none',
    budget_flexibility: 'none'
});

exports.parsePreferences = async (userInput, categories) => {
    if (!process.env.GROQ_API_KEY)
        throw new Error('GROQ_API_KEY is not configured');

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    const completion = await withTimeout(groq.chat.completions.create({
        messages: [{ role: 'user', content: buildPrompt(userInput, categories) }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' }
    }));

    const content = completion.choices?.[0]?.message?.content;
    if (!content)
        throw new Error('Groq returned an empty preference response');

    return JSON.parse(content);
};

exports.createNeutralPreferences = createNeutralPreferences;
exports.withTimeout = withTimeout;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  try {
    const { text, unitTitle, prompt } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are a friendly, encouraging A2 English teacher marking written work from adult Somali learners.
Be warm, positive and specific. Keep feedback simple and clear — the learners are A2 level.
Structure your response EXACTLY like this (use these exact headings):

✅ What you did well
[2-3 specific things they got right]

📝 One thing to improve
[One clear grammar or vocabulary point with a corrected example]

⭐ Score: [X/10]

Keep the total response under 150 words.`;

    const userMessage = `Unit: ${unitTitle}
Task: ${prompt}
Student's writing: "${text}"

Please mark this writing.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\n' + userMessage }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      }
    );

    const data = await response.json();
    const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, could not generate feedback. Please try again.';

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ feedback })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  try {
    const { transcript, unitTitle, prompt } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are a friendly, encouraging A2 English speaking teacher marking spoken English from adult Somali learners.
The transcript below was produced by browser speech recognition so may have small errors.
Be warm, positive and specific. Keep feedback simple — these are A2 learners.
Structure your response EXACTLY like this:

✅ What you did well
[2-3 specific things — vocabulary used, sentences attempted, topic covered]

🗣️ One thing to practise
[One pronunciation or grammar point from their speech with a tip]

⭐ Score: [X/10]

Keep the total response under 150 words.`;

    const userMessage = `Unit: ${unitTitle}
Speaking task: ${prompt}
What the student said (transcribed): "${transcript}"

Please give feedback on their spoken English.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
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

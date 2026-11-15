exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  try {
    const { type, unitNumber, unitTitle, content, feedback, learnerName, learnerEmail } = JSON.parse(event.body);
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        type,
        unit_number: unitNumber,
        unit_title: unitTitle,
        content,
        feedback,
        learner_name: learnerName || 'Anonymous',
        learner_email: learnerEmail || null,
        created_at: new Date().toISOString()
      })
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ success: true, id: data[0]?.id })
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

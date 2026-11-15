exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  try {
    const { learnerName, learnerEmail } = JSON.parse(event.body);
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Generate unique certificate ID: SL-YYYY-XXXX
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const certId = `SL-${year}-${random}`;

    const response = await fetch(`${supabaseUrl}/rest/v1/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        cert_id: certId,
        learner_name: learnerName,
        learner_email: learnerEmail || null,
        issued_at: new Date().toISOString(),
        course: 'SimplyLingua A2 English Communication Course',
        level: 'CEFR A2'
      })
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ success: true, certId, issued_at: data[0]?.issued_at })
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

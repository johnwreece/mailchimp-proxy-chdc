const fetch = require('node-fetch');

exports.handler = async (event) => {
  console.info('✅ subscribe.js function triggered');

  // CORS headers for Shopify
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    // Preflight request
    return { statusCode: 200, headers, body: JSON.stringify({}) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (err) {
    console.error("Error parsing JSON:", err);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  const { email_address, firstName, lastName } = data;

  if (!email_address) {
    console.error("❌ No email address provided");
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "No email address provided" })
    };
  }

  console.info("📩 Parsed input:", { email_address, firstName, lastName });

  const LIST_ID = process.env.LIST_ID;
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!LIST_ID || !API_KEY || !SERVER_PREFIX) {
    console.error("❌ Missing Mailchimp environment variables");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server misconfigured" })
    };
  }

  const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

  const body = {
    email_address,
    status: "subscribed", // change to "pending" if using double opt-in
    merge_fields: { FNAME: firstName || "", LNAME: lastName || "" }
  };

  console.info("➡️ Submitting to Mailchimp:", body);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `apikey ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const mcData = await response.json();
    console.info("📬 Mailchimp response:", mcData);

    if (response.status === 200 || response.status === 201) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: "Subscribed successfully!" })
      };
    } else {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: mcData.detail || "Mailchimp error" })
      };
    }
  } catch (err) {
    console.error("❌ Error submitting to Mailchimp:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};




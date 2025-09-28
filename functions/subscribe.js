const fetch = require('node-fetch');

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*", // or your Shopify domain
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    const { email_address, firstName, lastName } = JSON.parse(event.body);

    console.log("Received:", { email_address, firstName, lastName });

    // Mailchimp request
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.LIST_ID;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": `apikey ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email_address,
        status: "subscribed",
        merge_fields: { FNAME: firstName, LNAME: lastName }
      })
    });

    const data = await response.json();
    console.log("Mailchimp response:", data);

    if (!response.ok) {
      return { statusCode: response.status, headers, body: JSON.stringify({ error: data.detail || "Mailchimp error" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};



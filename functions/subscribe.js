const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  // CORS headers for your Shopify store
  const headers = {
    "Access-Control-Allow-Origin": "https://chdcstore.myshopify.com",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    // Parse request body
    const data = JSON.parse(event.body);
    console.log("Received data:", data);

    const email = data.email_address;
    const firstName = data.firstName || "";
    const lastName = data.lastName || "";

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email is required." })
      };
    }

    // Mailchimp API info from environment variables
    const LIST_ID = process.env.LIST_ID;
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!LIST_ID || !API_KEY || !SERVER_PREFIX) {
      console.error("Missing Mailchimp environment variables.");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server configuration error." })
      };
    }

    const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

    // Prepare payload
    const payload = {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    };

    console.log("Submitting to Mailchimp:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `apikey ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    console.log("Mailchimp response:", responseData);

    if (response.status === 200 || response.status === 201) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Subscribed successfully!" })
      };
    } else {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: responseData.detail || "An error occurred."
        })
      };
    }
  } catch (err) {
    console.error("Error in subscribe function:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "An error occurred. Please try later." })
    };
  }
};



// functions/subscribe.js
require("dotenv").config();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { email_address, firstName, lastName } = JSON.parse(event.body);

    // Build Mailchimp URL using your server prefix and list ID from environment
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
    const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;

    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;

    const bodyData = {
      email_address,
      status: "pending", // or "subscribed" if you don't want double opt-in
      merge_fields: {
        FNAME: firstName || "",
        LNAME: lastName || "",
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();

    // Full logging for debugging
    console.log("Mailchimp response status:", response.status);
    console.log("Mailchimp response body:", JSON.stringify(data));

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: "Subscribed successfully!", data }),
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.detail || "Unknown error from Mailchimp", data }),
      };
    }
  } catch (err) {
    console.error("Error in subscribe function:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};




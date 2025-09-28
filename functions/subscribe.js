import fetch from "node-fetch";

console.log("✅ subscribe.js function file loaded"); // Top-level log

export async function handler(event) {
  console.log("➡️ Function triggered");
  console.log("Event body:", event.body);

  try {
    const { email_address, firstName, lastName } = JSON.parse(event.body || "{}");

    console.log("📩 Parsed input:", { email_address, firstName, lastName });

    if (!email_address) {
      console.error("❌ No email address provided");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email address is required" }),
      };
    }

    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
    const LIST_ID = process.env.LIST_ID;

    console.log("🔑 Env check:", {
      API_KEY: API_KEY ? "set" : "missing",
      SERVER_PREFIX,
      LIST_ID,
    });

    if (!API_KEY || !SERVER_PREFIX || !LIST_ID) {
      throw new Error("Missing one or more Mailchimp environment variables");
    }

    const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address,
        status: "subscribed",
        merge_fields: { FNAME: firstName || "", LNAME: lastName || "" },
      }),
    });

    const data = await response.json();
    console.log("📬 Mailchimp API response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.detail || "Failed to subscribe");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error) {
    console.error("🔥 Error in subscribe.js:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Unknown error" }),
    };
  }
}



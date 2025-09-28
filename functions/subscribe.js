// functions/subscribe.js
import fetch from "node-fetch";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email_address, firstName = "", lastName = "" } = JSON.parse(event.body);

    if (!email_address) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email is required" }) };
    }

    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_LIST_ID = process.env.LIST_ID;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

    const response = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address,
          status: "pending",
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Mailchimp response:", data);

    if (response.status === 400 && data.title === "Member Exists") {
      return { statusCode: 200, body: JSON.stringify({ success: false, message: "This email is already subscribed." }) };
    }

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ success: false, message: data.detail || "An error occurred with Mailchimp." }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, message: "Subscribed successfully!" }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "An internal error occurred. Please try later." }) };
  }
};



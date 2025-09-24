export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email_address, FNAME, LNAME } = JSON.parse(event.body);

    if (!email_address) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is required." }),
      };
    }

    // Extract Mailchimp datacenter from API key
    const DATACENTER = process.env.MAILCHIMP_API_KEY.split("-")[1];

    const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address,
        status: "pending", // change to "subscribed" for no double opt-in
        merge_fields: { FNAME, LNAME },
      }),
    });

    const data = await response.json();

    if (response.status === 400 && data.title === "Member Exists") {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: "You are already subscribed." }),
      };
    }

    if (response.status >= 400) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.detail || "Subscription failed." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Check your email to confirm subscription." }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal server error." }),
    };
  }
}



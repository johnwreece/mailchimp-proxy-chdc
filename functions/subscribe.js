export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email_address, firstName, lastName } = JSON.parse(event.body);

    if (!email_address) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email is required" }) };
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address,
        status: "pending", // use "subscribed" if you want no double opt-in
        merge_fields: {
          FNAME: firstName || "",
          LNAME: lastName || "",
        },
      }),
    });

    const data = await response.json();

    console.log("Mailchimp response status:", response.status);
    console.log("Mailchimp response body:", data);

    if (response.status === 400 && data.title === "Member Exists") {
      return { statusCode: 400, body: JSON.stringify({ error: "This email is already subscribed." }) };
    }

    if (response.status >= 400) {
      return { statusCode: response.status, body: JSON.stringify({ error: data.detail || "An error occurred" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: data.id }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Internal Server Error" }) };
  }
};


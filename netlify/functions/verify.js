// netlify/functions/verify.js

let emailStore = {}; // in-memory storage

export async function handler(event, context) {
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { email, success } = body;

      if (!email || success === undefined) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            message: "Email and success are required",
          }),
        };
      }

      // Save email + success flag
      emailStore[email] = success;

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "Stored successfully",
          data: { email, success },
        }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: "Invalid JSON" }),
      };
    }
  }

  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters;
    const email = params.email;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Email is required",
        }),
      };
    }

    const success = emailStore[email];

    if (success === undefined) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          message: "No record found for this email",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: { email, success } }),
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ success: false, message: "Method not allowed" }),
  };
}

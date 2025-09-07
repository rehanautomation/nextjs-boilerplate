// netlify/functions/verify.js

export async function handler(event, context) {
  try {
    if (event.httpMethod === "POST") {
      // Parse request body
      const body = JSON.parse(event.body);

      // Example: extract email + code from body
      const { email, code } = body;

      if (!email || !code) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            message: "Email and code are required.",
          }),
        };
      }

      // Example: verify code (you can replace with real logic)
      if (code === "123456") {
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: "Verification successful!",
            email,
          }),
        };
      } else {
        return {
          statusCode: 401,
          body: JSON.stringify({
            success: false,
            message: "Invalid code.",
          }),
        };
      }
    }

    // Handle unsupported HTTP methods
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: "Method Not Allowed" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Server Error",
        error: error.message,
      }),
    };
  }
}

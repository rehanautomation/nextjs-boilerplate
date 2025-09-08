// netlify/functions/verify.js

let latestResults = {}; 
// in-memory store: { "user@example.com": { success: true/false, message: "...", email: "..." } }
// ⚠️ Note: this resets whenever Netlify redeploys/functions restart

export async function handler(event, context) {
  try {
    // ✅ Handle POST: verify request sent from Framer → forward to GHL
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
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

      // 🔹 Call GoHighLevel webhook here
      // Example placeholder (you must replace with real fetch to GHL API)
      // let ghlResponse = await fetch("https://your-ghl-webhook-url", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, code })
      // });
      // let result = await ghlResponse.json();

      // ❌ TEMP: simulate GHL check
      let result;
      if (code === "123456") {
        result = { success: true, message: "Verification successful!", email };
      } else {
        result = { success: false, message: "Invalid code.", email };
      }

      // Save result in memory (for polling GET requests later)
      latestResults[email] = result;

      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    }

    // ✅ Handle GET: Verify page polling every 2s
    if (event.httpMethod === "GET") {
      const email = event.queryStringParameters?.email;

      if (!email) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            message: "Email is required to fetch result.",
          }),
        };
      }

      const result = latestResults[email];
      if (!result) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            success: false,
            message: "No result found for this email yet.",
            email,
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    }

    // ❌ Unsupported methods
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

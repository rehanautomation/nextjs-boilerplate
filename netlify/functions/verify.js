// pages/api/verify.js

// Temporary in-memory store (resets on server restart)
const verificationResults = {};

export default async function handler(req, res) {
  if (req.method === "POST") {
    let body = req.body;

    // If body is a string (from urlencoded), parse it
    if (typeof body === "string") {
      try {
        body = JSON.parse(body); // If it's actually JSON
      } catch {
        body = Object.fromEntries(new URLSearchParams(body)); // If it's form-encoded
      }
    }

    const { email, status, verificationCode } = body;

    if (!email) {
      console.error("Webhook missing email:", body);
      return res.status(400).json({ message: "Email missing in payload" });
    }

    // Store result for this email
    verificationResults[email] = {
      status,
      verificationCode,
      timestamp: Date.now(),
    };

    console.log(`✅ Stored result for ${email}: ${status}`);

    return res.status(200).json({ message: "Result stored" });
  }

  if (req.method === "GET") {
    const { email } = req.query;

    if (verificationResults[email]) {
      const result = verificationResults[email];
      delete verificationResults[email]; // optional cleanup
      return res.status(200).json(result);
    }

    return res.status(404).json({ message: "No result yet" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}

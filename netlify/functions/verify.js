// In-memory storage (replace with database in production)
let verificationData = new Map();

// Clean up old entries every 10 minutes (optional)
setInterval(() => {
  const now = Date.now();
  for (let [email, data] of verificationData.entries()) {
    if (now - data.timestamp > 600000) { // 10 minutes
      verificationData.delete(email);
    }
  }
}, 600000);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // GoHighLevel sends verification result
    try {
      const { email, success } = req.body;
      
      if (!email || success === undefined) {
        return res.status(400).json({ error: 'Email and success are required' });
      }
      
      // Store the verification result
      verificationData.set(email, {
        success: success,
        timestamp: Date.now()
      });
      
      console.log(`Stored verification for ${email}: ${success}`);
      
      // Respond to GHL (though GHL doesn't need response)
      res.status(200).json({ message: 'Verification result stored' });
      
    } catch (error) {
      console.error('Error storing verification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  else if (req.method === 'GET') {
    // Framer fetches verification result
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
      }
      
      const result = verificationData.get(email);
      
      if (!result) {
        return res.status(404).json({ error: 'No verification result found for this email' });
      }
      
      // Return the verification result
      res.status(200).json({
        email: email,
        success: result.success,
        timestamp: result.timestamp
      });
      
      // Optional: Delete after fetching to prevent reuse
      // verificationData.delete(email);
      
    } catch (error) {
      console.error('Error fetching verification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Store verification results temporarily
const verificationResults = {};

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Receiving result from GHL
    const { email, status, verificationCode } = req.body;
    
    // Store result for this email
    verificationResults[email] = {
      status: status,
      timestamp: Date.now(),
      verificationCode: verificationCode
    };
    
    console.log(`Stored result for ${email}: ${status}`);
    
    return res.status(200).json({ message: 'Result stored' });
  }
  
  if (req.method === 'GET') {
    // React component checking for result
    const { email } = req.query;
    
    if (verificationResults[email]) {
      const result = verificationResults[email];
      // Clean up after sending (optional)
      delete verificationResults[email];
      return res.status(200).json(result);
    }
    
    return res.status(404).json({ message: 'No result yet' });
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}

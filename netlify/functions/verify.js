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

exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod === 'POST') {
    // GoHighLevel sends verification result
    try {
      const body = JSON.parse(event.body);
      const { email, success } = body;
      
      if (!email || success === undefined) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and success are required' })
        };
      }
      
      // Store the verification result
      verificationData.set(email, {
        success: success,
        timestamp: Date.now()
      });
      
      console.log(`Stored verification for ${email}: ${success}`);
      
      // Respond to GHL (though GHL doesn't need response)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Verification result stored' })
      };
      
    } catch (error) {
      console.error('Error storing verification:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
  
  else if (event.httpMethod === 'GET') {
    // Framer fetches verification result
    try {
      const { email } = event.queryStringParameters || {};
      
      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email parameter is required' })
        };
      }
      
      const result = verificationData.get(email);
      
      if (!result) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'No verification result found for this email' })
        };
      }
      
      // Return the verification result
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          email: email,
          success: result.success,
          timestamp: result.timestamp
        })
      };
      
      // Optional: Delete after fetching to prevent reuse
      // verificationData.delete(email);
      
    } catch (error) {
      console.error('Error fetching verification:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
  
  else {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
};

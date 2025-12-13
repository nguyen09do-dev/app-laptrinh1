// Direct test of Mailchimp connection via API endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/integrations/mailchimp/test',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': 2, // Empty JSON body {}
  },
  timeout: 20000,
};

console.log('🧪 Testing Mailchimp connection via API endpoint...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Raw Response:', data);
    console.log('');
    
    try {
      const json = JSON.parse(data);
      
      if (json.success) {
        console.log('✅ SUCCESS! Mailchimp connection is working!');
        console.log(`   Message: ${json.message}\n`);
        process.exit(0);
      } else {
        console.log('❌ FAILED! Connection test failed:');
        console.log(`   Platform: ${json.platform || 'N/A'}`);
        console.log(`   Error Message: ${json.error?.message || 'Unknown error'}`);
        console.log(`   Error Details: ${json.error?.details || 'No details'}\n`);
        
        if (json.error?.message === 'Missing credentials') {
          console.log('💡 SOLUTION: No credentials found in database!');
          console.log('   Please save Mailchimp credentials first:');
          console.log('   1. Go to frontend Settings or Publisher page');
          console.log('   2. Fill in Mailchimp form:');
          console.log('      - API Key');
          console.log('      - Server Prefix (e.g., us1, us21)');
          console.log('      - Audience List ID');
          console.log('   3. Click "Save Credentials"\n');
        } else {
          console.log('💡 Troubleshooting tips:');
          console.log('   1. Verify API key is correct and active');
          console.log('   2. Check server prefix format (e.g., us1, us21, eu1)');
          console.log('   3. Verify internet connection');
          console.log('   4. Check Mailchimp account status\n');
        }
        
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Error parsing response:', e.message);
      console.log('Response might not be JSON. Full response above.\n');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Backend server is not running on port 3001');
    console.log('   Please start backend: cd backend && npm run dev\n');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('\n💡 Request timeout - Mailchimp API is not responding');
  }
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Request timeout after 20 seconds');
  req.destroy();
  process.exit(1);
});

// Send empty JSON body
req.write('{}');
req.end();


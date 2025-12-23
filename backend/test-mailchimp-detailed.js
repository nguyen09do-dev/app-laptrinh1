// Detailed test of Mailchimp connection
const http = require('http');

console.log('🔍 Detailed Mailchimp Connection Test\n');
console.log('=' .repeat(50));

// Test 1: Check if credentials exist
console.log('\n1️⃣ Testing API endpoint...\n');

const testOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/integrations/mailchimp/test',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': 2,
  },
  timeout: 20000,
};

const testReq = http.request(testOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      console.log(`   Status: ${res.statusCode}`);
      
      if (json.success) {
        console.log('   ✅ Connection successful!');
        console.log(`   Message: ${json.message}`);
        console.log(`   Platform: ${json.platform}\n`);
        
        console.log('=' .repeat(50));
        console.log('\n✅ ALL TESTS PASSED!');
        console.log('\n💡 Your Mailchimp configuration is working correctly!');
        console.log('   You can now publish content to Mailchimp from the app.\n');
        
        process.exit(0);
      } else {
        console.log('   ❌ Connection failed');
        console.log(`   Error: ${json.error?.message || 'Unknown'}`);
        console.log(`   Details: ${json.error?.details || 'No details'}\n`);
        
        if (json.error?.message === 'Missing credentials') {
          console.log('💡 SOLUTION:');
          console.log('   No credentials found. Please save credentials first.\n');
        } else {
          console.log('💡 TROUBLESHOOTING:');
          console.log('   1. Check API key is correct');
          console.log('   2. Verify server prefix format (us1, us21, etc.)');
          console.log('   3. Check internet connection');
          console.log('   4. Verify Mailchimp account is active\n');
        }
        
        process.exit(1);
      }
    } catch (e) {
      console.error('   ❌ Error parsing response:', e.message);
      console.log('   Raw:', data);
      process.exit(1);
    }
  });
});

testReq.on('error', (error) => {
  console.error('   ❌ Request error:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Backend server is not running on port 3001');
    console.log('   Start it with: cd backend && npm run dev\n');
  }
  process.exit(1);
});

testReq.on('timeout', () => {
  console.error('   ❌ Request timeout');
  testReq.destroy();
  process.exit(1);
});

testReq.write('{}');
testReq.end();







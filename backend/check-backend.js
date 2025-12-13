// Quick script to check if backend is running
const http = require('http');

console.log('🔍 Checking if backend is running...\n');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET',
  timeout: 5000,
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Backend is running!');
      console.log(`   Status: ${json.status}`);
      console.log(`   Timestamp: ${json.timestamp}\n`);
      process.exit(0);
    } catch (e) {
      console.log('⚠️ Backend responded but response is not JSON');
      console.log('   Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  if (error.code === 'ECONNREFUSED') {
    console.log('❌ Backend is NOT running on port 3001');
    console.log('\n💡 To start backend:');
    console.log('   cd backend');
    console.log('   npm run dev\n');
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Request timeout - backend not responding');
  req.destroy();
  process.exit(1);
});

req.end();


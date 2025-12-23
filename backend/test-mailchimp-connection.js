const { db } = require('./dist/lib/db.js');
const { testMailchimpConnection } = require('./dist/services/mailchimp.service.js');

async function testConnection() {
  try {
    console.log('🔍 Checking Mailchimp credentials in database...\n');
    
    const result = await db.query(
      `SELECT config FROM integration_credentials WHERE platform = 'mailchimp'`
    );

    if (result.rows.length === 0) {
      console.log('❌ No Mailchimp credentials found in database');
      console.log('💡 Please save credentials first using the frontend form\n');
      await db.end();
      process.exit(1);
    }

    const config = result.rows[0].config;
    
    console.log('✅ Found Mailchimp credentials:');
    console.log(`   API Key: ${config.apiKey ? config.apiKey.substring(0, 15) + '...' : 'MISSING'}`);
    console.log(`   Server Prefix: ${config.serverPrefix || 'MISSING'}`);
    console.log(`   Audience List ID: ${config.audienceListId ? config.audienceListId.substring(0, 15) + '...' : 'MISSING'}`);
    console.log('\n🧪 Testing Mailchimp connection...\n');

    const testResult = await testMailchimpConnection(config);

    if (testResult.success) {
      console.log('✅ SUCCESS! Mailchimp connection is working!\n');
      await db.end();
      process.exit(0);
    } else {
      console.log('❌ FAILED! Connection test failed:');
      console.log(`   Error: ${testResult.error}\n`);
      console.log('💡 Troubleshooting tips:');
      console.log('   1. Check if API key is correct and active');
      console.log('   2. Verify server prefix format (e.g., us1, us21, eu1)');
      console.log('   3. Check internet connection');
      console.log('   4. Verify Mailchimp account is active\n');
      await db.end();
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await db.end();
    process.exit(1);
  }
}

testConnection();







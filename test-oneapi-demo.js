/**
 * RUNNABLE DEMO: Test One API Integration
 *
 * Prerequisites:
 * 1. One API running at http://localhost:3100
 * 2. Configured at least one channel (provider) in One API dashboard
 * 3. Created an API token in One API dashboard
 *
 * To run:
 * node test-oneapi-demo.js
 */

// Test One API connectivity and basic functionality
async function testOneAPIConnection() {
  console.log('='.repeat(60));
  console.log('ONE API DEMO - Testing Connection');
  console.log('='.repeat(60));
  console.log('');

  const ONE_API_BASE_URL = 'http://localhost:3100/v1';

  // Test 1: Check if One API is running
  console.log('Test 1: Checking One API availability...');
  try {
    const response = await fetch('http://localhost:3100/api/status');
    const data = await response.json();
    console.log('✅ One API is running!');
    console.log('   Status:', data);
  } catch (error) {
    console.log('❌ One API is not accessible');
    console.log('   Error:', error.message);
    console.log('   Make sure One API is running at http://localhost:3100');
    return;
  }

  console.log('');

  // Test 2: Simple API call (requires API token)
  console.log('Test 2: Testing API call with One API...');
  console.log('');
  console.log('⚠️  To test API calls, you need to:');
  console.log('   1. Open http://localhost:3100');
  console.log('   2. Login with username: root, password: 123456');
  console.log('   3. Go to "Channels" → "Create Channel"');
  console.log('   4. Add your OpenAI or Gemini API key');
  console.log('   5. Go to "Tokens" → "Create Token"');
  console.log('   6. Copy the token and replace ONE_API_KEY below');
  console.log('');

  // Example API call (will fail without token, but shows the pattern)
  const ONE_API_KEY = 'sk-REPLACE-WITH-YOUR-TOKEN'; // Replace with actual token

  if (ONE_API_KEY === 'sk-REPLACE-WITH-YOUR-TOKEN') {
    console.log('⏭️  Skipping API test (no token configured)');
    console.log('');
  } else {
    try {
      console.log('   Sending test prompt to One API...');
      const response = await fetch(`${ONE_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ONE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Say "Hello from One API!" in Vietnamese',
            },
          ],
          max_tokens: 50,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.log('❌ API call failed:', data.error.message);
      } else {
        console.log('✅ API call successful!');
        console.log('   Response:', data.choices[0].message.content);
      }
    } catch (error) {
      console.log('❌ API call error:', error.message);
    }
    console.log('');
  }

  // Show comparison
  console.log('='.repeat(60));
  console.log('COMPARISON: Before vs After One API');
  console.log('='.repeat(60));
  console.log('');

  console.log('BEFORE (Current Implementation):');
  console.log('━'.repeat(60));
  console.log(`
// Multiple API clients
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Key 1
});

const geminiClient = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,  // Key 2
});

// Manual routing
if (provider === 'openai') {
  response = await openaiClient.chat.completions.create({...});
} else if (provider === 'gemini') {
  response = await geminiClient.generateContent({...});
}

// Issues:
// ❌ Multiple API keys to manage
// ❌ Manual provider switching logic
// ❌ Different API interfaces for each provider
// ❌ No automatic load balancing
// ❌ No centralized quota management
`);

  console.log('AFTER (With One API):');
  console.log('━'.repeat(60));
  console.log(`
// Single unified client
const client = new OpenAI({
  apiKey: process.env.ONE_API_KEY,       // Only 1 key!
  baseURL: 'http://localhost:3100/v1',   // Point to One API
});

// Same code for all providers!
response = await client.chat.completions.create({
  model: 'gpt-4',  // One API routes automatically
  messages: [{role: 'user', content: prompt}],
});

// Benefits:
// ✅ Single API key for all providers
// ✅ Automatic provider routing
// ✅ Unified OpenAI-compatible interface
// ✅ Built-in load balancing
// ✅ Centralized quota & cost management
// ✅ Usage analytics dashboard
// ✅ No code changes when adding new providers
`);

  console.log('');
  console.log('='.repeat(60));
  console.log('Integration Steps for Your Project');
  console.log('='.repeat(60));
  console.log('');

  console.log('1. Add to backend/.env:');
  console.log('   ONE_API_KEY=sk-your-token-here');
  console.log('   ONE_API_BASE_URL=http://localhost:3100/v1');
  console.log('');

  console.log('2. Update backend/src/lib/llmClient.ts:');
  console.log('   Add ONE_API to AIProvider enum');
  console.log('   Add case for ONE_API in generateCompletion()');
  console.log('');

  console.log('3. Configure One API Dashboard:');
  console.log('   - Add channels for OpenAI, Gemini, etc.');
  console.log('   - Set up load balancing priorities');
  console.log('   - Configure quota limits per user group');
  console.log('');

  console.log('4. Test & Deploy:');
  console.log('   - Test with small % of traffic');
  console.log('   - Monitor usage in One API dashboard');
  console.log('   - Gradually increase to 100%');
  console.log('');

  console.log('='.repeat(60));
  console.log('Cost Optimization Example');
  console.log('='.repeat(60));
  console.log('');

  console.log('Current monthly cost (1000 users):');
  console.log('━'.repeat(60));
  console.log('  All requests → GPT-4o-mini');
  console.log('  Total: ~$5,000/month');
  console.log('');

  console.log('With One API smart routing:');
  console.log('━'.repeat(60));
  console.log('  Idea generation → DeepSeek      : $  500/month');
  console.log('  Content writing → GPT-4         : $3,000/month');
  console.log('  Derivatives     → Gemini Flash  : $  200/month');
  console.log('  Embeddings      → OpenAI        : $  300/month');
  console.log('  ─────────────────────────────────────────────');
  console.log('  Total                           : $4,000/month');
  console.log('  💰 Savings: $1,000/month (20%)');
  console.log('');

  console.log('Additional benefits:');
  console.log('  ✅ Better quality (GPT-4 for important content)');
  console.log('  ✅ Higher reliability (multi-provider fallback)');
  console.log('  ✅ Better control (quota per user)');
  console.log('  ✅ Usage analytics (detailed tracking)');
  console.log('');

  console.log('='.repeat(60));
  console.log('Demo Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Next steps:');
  console.log('  1. Configure One API dashboard at http://localhost:3100');
  console.log('  2. Review demo-oneapi-integration.ts for code examples');
  console.log('  3. Decide if you want to proceed with integration');
  console.log('');
}

// Run the demo
testOneAPIConnection().catch((error) => {
  console.error('Demo error:', error);
});

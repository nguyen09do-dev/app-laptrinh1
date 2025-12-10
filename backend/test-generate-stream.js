/**
 * Test script for /api/generate-stream endpoint
 * Run: node test-generate-stream.js
 */

const testGenerateStream = async () => {
  const prompt = 'Write a short paragraph about artificial intelligence.';
  
  console.log('🧪 Testing /api/generate-stream endpoint...');
  console.log('Prompt:', prompt);
  console.log('---\n');

  try {
    const response = await fetch('http://localhost:3001/api/generate-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        temperature: 0.7,
        useRAG: false,
      }),
    });

    if (!response.ok) {
      console.error('❌ Response not OK:', response.status, await response.text());
      return;
    }

    console.log('✅ Response OK, reading stream...\n');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            console.log('\n✅ Stream completed');
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              content += parsed.content;
              process.stdout.write(parsed.content);
            }
            if (parsed.error) {
              console.error('\n❌ Stream error:', parsed.error);
              return;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    console.log('\n\n---');
    console.log('✅ Test completed!');
    console.log('Content length:', content.length);
    console.log('Content preview:', content.slice(0, 100) + '...');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run test
testGenerateStream();


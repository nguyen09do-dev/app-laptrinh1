'use client';

import { useState } from 'react';

export default function TestGeneratePage() {
  const [prompt, setPrompt] = useState('Write a short paragraph about AI in marketing');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const testGenerate = async () => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let generatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  generatedText += parsed.content;
                  setResult(generatedText);
                } else if (parsed.error) {
                  setError(parsed.error);
                }
              } catch (e) {
                console.error('Error parsing SSE:', e);
              }
            }
          }
        }
      }

      console.log('✅ Generation completed');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Generate Stream API</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Prompt:</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-4 bg-gray-800 text-white rounded-lg"
              placeholder="Enter your prompt..."
            />
          </div>

          <button
            onClick={testGenerate}
            disabled={isLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Test Generate'}
          </button>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
              <h3 className="text-white font-bold mb-2">Result:</h3>
              <div className="text-gray-200 whitespace-pre-wrap">{result}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


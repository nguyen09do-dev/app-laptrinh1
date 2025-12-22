/**
 * DEMO: One API Integration Comparison
 *
 * This file demonstrates how to integrate One API into the current project
 * and compares the BEFORE vs AFTER implementation.
 */

import OpenAI from 'openai';

// ============================================
// BEFORE: Current Implementation (Multiple Providers)
// ============================================

// File: backend/src/lib/llmClient.ts (CURRENT)
enum AIProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
}

// Current approach: Manage multiple API clients
class LLMClientBefore {
  private openaiClient: OpenAI;
  private geminiClient: any; // GoogleGenerativeAI
  private defaultProvider: AIProvider;

  constructor() {
    // Need to manage multiple API keys
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Key #1
    });

    // Gemini setup (simplified)
    this.geminiClient = {
      apiKey: process.env.GEMINI_API_KEY, // Key #2
    };

    this.defaultProvider = (process.env.DEFAULT_AI_PROVIDER as AIProvider) || AIProvider.GEMINI;
  }

  async generateCompletion(prompt: string, model: string = 'gpt-4o-mini') {
    // Manual routing logic
    if (this.defaultProvider === AIProvider.OPENAI) {
      return this.generateWithOpenAI(prompt, model);
    } else {
      return this.generateWithGemini(prompt, model);
    }
  }

  private async generateWithOpenAI(prompt: string, model: string) {
    const response = await this.openaiClient.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  }

  private async generateWithGemini(prompt: string, model: string) {
    // Gemini implementation
    // Need separate logic for Gemini API
    return "Gemini response...";
  }
}

// ============================================
// AFTER: With One API (Unified Provider)
// ============================================

class LLMClientAfter {
  private client: OpenAI;

  constructor() {
    // Single API key and endpoint!
    this.client = new OpenAI({
      apiKey: process.env.ONE_API_KEY, // Only 1 key needed!
      baseURL: process.env.ONE_API_BASE_URL || 'http://localhost:3100/v1',
    });
  }

  async generateCompletion(prompt: string, model: string = 'gpt-4o-mini') {
    // One API handles routing automatically!
    // No need for manual provider switching
    const response = await this.client.chat.completions.create({
      model: model, // Can be: gpt-4, claude-3, gemini-pro, etc.
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  }

  // Streaming also works the same way
  async *generateCompletionStream(prompt: string, model: string = 'gpt-4o-mini') {
    const stream = await this.client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || '';
    }
  }
}

// ============================================
// COMPARISON: Environment Variables
// ============================================

/**
 * BEFORE (.env):
 * ----------------
 * OPENAI_API_KEY=sk-proj-xxx...
 * GEMINI_API_KEY=AIzaSy...
 * DEFAULT_AI_PROVIDER=gemini
 *
 * AFTER (.env):
 * ----------------
 * ONE_API_KEY=sk-oneapi-xxx
 * ONE_API_BASE_URL=http://localhost:3100/v1
 * # Optional: DEFAULT_MODEL=gpt-4o-mini
 */

// ============================================
// ADVANCED: Smart Routing with One API
// ============================================

/**
 * One API can route different tasks to different providers
 * based on your configuration in the dashboard.
 *
 * Example routing strategy:
 *
 * 1. Idea Generation (cheap, bulk) → DeepSeek (priority 1)
 * 2. Content Writing (quality) → Claude Opus (priority 1) → GPT-4 (priority 2)
 * 3. Derivatives (fast) → Gemini Flash (priority 1) → GPT-3.5 (priority 2)
 * 4. Embeddings → OpenAI text-embedding-3-small
 */

class SmartLLMClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.ONE_API_KEY!,
      baseURL: process.env.ONE_API_BASE_URL || 'http://localhost:3100/v1',
    });
  }

  // Use case specific methods with optimized models
  async generateIdeas(prompt: string): Promise<string> {
    // One API routes to cheapest provider (e.g., DeepSeek)
    return await this.generateCompletion(prompt, 'deepseek-chat');
  }

  async generateContent(prompt: string): Promise<string> {
    // One API routes to best quality provider (e.g., Claude Opus)
    return await this.generateCompletion(prompt, 'claude-opus-4');
  }

  async generateDerivative(prompt: string): Promise<string> {
    // One API routes to fast provider (e.g., Gemini Flash)
    return await this.generateCompletion(prompt, 'gemini-2.5-flash');
  }

  private async generateCompletion(prompt: string, model: string) {
    const response = await this.client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content || '';
  }
}

// ============================================
// BENEFITS SUMMARY
// ============================================

/**
 * BEFORE (Current):
 * - Need to manage 2+ API keys (OpenAI, Gemini)
 * - Manual provider switching logic
 * - Complex error handling for each provider
 * - Hard to add new providers (need new client code)
 * - No built-in load balancing
 * - No centralized quota management
 * - No usage tracking across providers
 *
 * AFTER (With One API):
 * - Single API key (One API manages all providers)
 * - Automatic provider routing & load balancing
 * - Unified error handling
 * - Add new providers via dashboard (no code changes!)
 * - Built-in load balancing across multiple channels
 * - Centralized quota & cost management
 * - Comprehensive usage analytics
 * - Can set different models for different user groups
 * - Fallback logic: if provider A fails → auto switch to provider B
 *
 * CODE CHANGES NEEDED: Minimal!
 * Just update:
 * 1. .env file (add ONE_API_KEY, ONE_API_BASE_URL)
 * 2. llmClient.ts - change baseURL to One API endpoint
 * 3. That's it! 🎉
 */

// ============================================
// MIGRATION GUIDE
// ============================================

/**
 * Step 1: Keep existing code as fallback
 * Step 2: Add One API as new provider option
 * Step 3: Test with small percentage of requests
 * Step 4: Gradually increase to 100%
 * Step 5: Remove old provider code (optional)
 *
 * Example migration code:
 */

class HybridLLMClient {
  private oneApiClient: OpenAI;
  private openaiClient: OpenAI;
  private useOneApi: boolean;

  constructor() {
    // One API client
    this.oneApiClient = new OpenAI({
      apiKey: process.env.ONE_API_KEY!,
      baseURL: 'http://localhost:3100/v1',
    });

    // Direct OpenAI as fallback
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Feature flag to toggle between implementations
    this.useOneApi = process.env.USE_ONE_API === 'true';
  }

  async generateCompletion(prompt: string, model: string = 'gpt-4o-mini') {
    try {
      if (this.useOneApi) {
        // Try One API first
        return await this.generateWithOneApi(prompt, model);
      } else {
        // Fallback to direct OpenAI
        return await this.generateWithOpenAI(prompt, model);
      }
    } catch (error) {
      console.error('One API failed, falling back to OpenAI', error);
      // Auto-fallback on error
      return await this.generateWithOpenAI(prompt, model);
    }
  }

  private async generateWithOneApi(prompt: string, model: string) {
    const response = await this.oneApiClient.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  }

  private async generateWithOpenAI(prompt: string, model: string) {
    const response = await this.openaiClient.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  }
}

// ============================================
// REAL-WORLD EXAMPLE: Content Generation
// ============================================

async function demoContentGeneration() {
  const client = new LLMClientAfter();

  // Example: Generate content idea
  console.log('=== Generating Content Ideas ===');
  const ideasPrompt = `Generate 3 content ideas for a tech blog about AI.`;

  const ideas = await client.generateCompletion(ideasPrompt, 'gpt-4o-mini');
  console.log('Ideas:', ideas);

  // Example: Generate full content
  console.log('\n=== Generating Full Content ===');
  const contentPrompt = `Write a 500-word article about the benefits of AI in healthcare.`;

  const content = await client.generateCompletion(contentPrompt, 'gpt-4');
  console.log('Content:', content);

  // Example: Streaming generation
  console.log('\n=== Streaming Content ===');
  const streamPrompt = `Write a short poem about coding.`;

  for await (const chunk of client.generateCompletionStream(streamPrompt, 'gpt-3.5-turbo')) {
    process.stdout.write(chunk);
  }
  console.log('\n');
}

// ============================================
// COST COMPARISON
// ============================================

/**
 * Scenario: 1000 users generating content monthly
 *
 * BEFORE (Direct OpenAI):
 * - All requests → GPT-4o-mini
 * - Cost: $5,000/month
 *
 * AFTER (One API with smart routing):
 * - Idea generation (bulk) → DeepSeek: $500/month
 * - Content writing → GPT-4: $3,000/month
 * - Derivatives → Gemini Flash: $200/month
 * - Embeddings → OpenAI: $300/month
 * - Total: $4,000/month
 * - **Savings: 20% ($1,000/month)**
 *
 * Plus additional benefits:
 * - Better quality (use GPT-4 for important content)
 * - Higher reliability (multi-provider redundancy)
 * - Better control (quota per user group)
 * - Usage analytics (detailed cost tracking)
 */

export {
  LLMClientBefore,
  LLMClientAfter,
  SmartLLMClient,
  HybridLLMClient,
  demoContentGeneration,
};

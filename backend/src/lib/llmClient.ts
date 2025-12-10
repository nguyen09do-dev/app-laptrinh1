import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Provider enum
 */
export enum AIProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
}

/**
 * LLM Generation Options
 */
export interface LLMOptions {
  provider?: AIProvider | string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Streaming callback type
 */
export type StreamCallback = (chunk: string, done: boolean) => void;

/**
 * LLMClient - Unified interface cho OpenAI và Google Gemini
 */
class LLMClient {
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private defaultProvider: AIProvider;

  constructor() {
    // Initialize OpenAI if API key exists
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Gemini if API key exists
    if (process.env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    // Set default provider
    const defaultProviderEnv = process.env.DEFAULT_AI_PROVIDER?.toLowerCase();
    this.defaultProvider =
      defaultProviderEnv === 'gemini' ? AIProvider.GEMINI : AIProvider.OPENAI;

    console.log(`🤖 LLM Client initialized. Default provider: ${this.defaultProvider}`);
  }

  /**
   * Generate text completion
   */
  async generateCompletion(
    prompt: string,
    options: LLMOptions = {}
  ): Promise<string> {
    const provider =
      typeof options.provider === 'string'
        ? (options.provider.toLowerCase() as AIProvider)
        : options.provider || this.defaultProvider;

    if (provider === AIProvider.GEMINI) {
      return this.generateWithGemini(prompt, options);
    } else {
      return this.generateWithOpenAI(prompt, options);
    }
  }

  /**
   * Generate text completion with streaming (async generator)
   * Yields text chunks as they are generated
   */
  async *generateCompletionStream(
    prompt: string,
    options: LLMOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const provider =
      typeof options.provider === 'string'
        ? (options.provider.toLowerCase() as AIProvider)
        : options.provider || this.defaultProvider;

    if (provider === AIProvider.GEMINI) {
      yield* this.streamWithGemini(prompt, options);
    } else {
      yield* this.streamWithOpenAI(prompt, options);
    }
  }

  /**
   * Stream with OpenAI
   */
  private async *streamWithOpenAI(
    prompt: string,
    options: LLMOptions
  ): AsyncGenerator<string, void, unknown> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.');
    }

    const model = options.model || 'gpt-4o-mini';
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 2000;

    console.log(`🤖 Streaming with OpenAI (${model})...`);
    console.log(`📝 Prompt length: ${prompt.length} chars`);

    try {
      const stream = await this.openaiClient.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      let chunkCount = 0;
      let hasContent = false;

      for await (const chunk of stream) {
        chunkCount++;
        const content = chunk.choices[0]?.delta?.content;
        
        if (content) {
          hasContent = true;
          yield content;
        } else {
          // Log finish reason if available
          const finishReason = chunk.choices[0]?.finish_reason;
          if (finishReason) {
            console.log(`📊 Stream finished. Reason: ${finishReason}, Chunks: ${chunkCount}`);
          }
        }
      }

      if (!hasContent) {
        console.warn(`⚠️ OpenAI stream completed but no content received. Chunks: ${chunkCount}`);
        throw new Error('OpenAI stream returned no content. Check API key and model availability.');
      }

      console.log(`✅ OpenAI stream completed. Chunks: ${chunkCount}`);
    } catch (error) {
      console.error('❌ OpenAI streaming error:', error);
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('OpenAI API key is invalid or missing. Check OPENAI_API_KEY environment variable.');
        }
        if (error.message.includes('model')) {
          throw new Error(`OpenAI model ${model} is not available. Check model name.`);
        }
      }
      throw error;
    }
  }

  /**
   * Stream with Google Gemini
   */
  private async *streamWithGemini(
    prompt: string,
    options: LLMOptions
  ): AsyncGenerator<string, void, unknown> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized. Check GEMINI_API_KEY.');
    }

    // Use the latest stable Gemini model
    let modelName = options.model || 'gemini-1.5-flash-latest';

    // Support common aliases
    if (modelName === 'gemini-flash' || modelName === 'gemini-1.5-flash') {
      modelName = 'gemini-1.5-flash-latest';
    } else if (modelName === 'gemini-pro' || modelName === 'gemini-pro-latest') {
      modelName = 'gemini-1.5-flash-latest'; // Use flash instead of pro (free)
    }

    const temperature = options.temperature ?? 0.7;

    console.log(`🤖 Streaming with Gemini (${modelName})...`);

    const model = this.geminiClient.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens: options.maxTokens || 2000,
      },
    });

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  /**
   * Generate with OpenAI
   */
  private async generateWithOpenAI(
    prompt: string,
    options: LLMOptions
  ): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.');
    }

    const model = options.model || 'gpt-4o-mini';
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 2000;

    console.log(`🤖 Generating with OpenAI (${model})...`);

    const response = await this.openaiClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return content;
  }

  /**
   * Generate with Google Gemini
   */
  private async generateWithGemini(
    prompt: string,
    options: LLMOptions
  ): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized. Check GEMINI_API_KEY.');
    }

    // Use the latest stable Gemini model
    let modelName = options.model || 'gemini-1.5-flash-latest';

    // Support common aliases
    if (modelName === 'gemini-flash' || modelName === 'gemini-1.5-flash') {
      modelName = 'gemini-1.5-flash-latest';
    } else if (modelName === 'gemini-pro' || modelName === 'gemini-pro-latest') {
      modelName = 'gemini-1.5-flash-latest'; // Use flash instead of pro (free)
    }

    const temperature = options.temperature ?? 0.7;

    console.log(`🤖 Generating with Gemini (${modelName})...`);

    const model = this.geminiClient.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens: options.maxTokens || 2000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No content in Gemini response');
    }

    return content;
  }
}

// Export singleton instance
export const llmClient = new LLMClient();

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Enum cho các AI provider
 */
export enum AIProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
}

/**
 * Enum cho các model có sẵn
 */
export enum AIModel {
  // OpenAI models
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo-preview',
  GPT_35_TURBO = 'gpt-3.5-turbo',

  // Gemini models (latest versions)
  GEMINI_PRO_LATEST = 'gemini-pro-latest',
  GEMINI_FLASH_LATEST = 'gemini-flash-latest',

  // Gemini 2.5 models (stable)
  GEMINI_25_PRO = 'gemini-2.5-pro',
  GEMINI_25_FLASH = 'gemini-2.5-flash',

  // Gemini 2.0 models
  GEMINI_20_FLASH = 'gemini-2.0-flash',
}

/**
 * LLMClient - Class để giao tiếp với AI providers (OpenAI, Gemini)
 * Hỗ trợ chuyển đổi linh hoạt giữa các providers
 */
export class LLMClient {
  private openaiClient: OpenAI;
  private geminiClient: GoogleGenerativeAI;
  private defaultProvider: AIProvider;

  constructor() {
    // Khởi tạo OpenAI client
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    // Khởi tạo Gemini client
    this.geminiClient = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || ''
    );

    // Set default provider từ env hoặc mặc định là OpenAI
    const envProvider = process.env.DEFAULT_AI_PROVIDER?.toLowerCase();
    this.defaultProvider = envProvider === 'gemini'
      ? AIProvider.GEMINI
      : AIProvider.OPENAI;
  }

  /**
   * Gọi OpenAI API để generate text
   */
  private async generateWithOpenAI(
    prompt: string,
    model: string,
    temperature: number
  ): Promise<string> {
    const response = await this.openaiClient.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful content strategist. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return content;
  }

  /**
   * Gọi Gemini API để generate text
   */
  private async generateWithGemini(
    prompt: string,
    model: string,
    temperature: number
  ): Promise<string> {
    const geminiModel = this.geminiClient.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: 8000, // Increase for longer content
      },
    });

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;

    // Check if response was blocked
    if (!response || !response.text) {
      const blockReason = response?.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`Gemini blocked response: ${blockReason}`);
      }
      throw new Error('No content in Gemini response');
    }

    const content = response.text();

    if (!content || content.trim().length === 0) {
      throw new Error('Empty content in Gemini response');
    }

    return content;
  }

  /**
   * Gọi AI API để generate text - Hỗ trợ cả OpenAI và Gemini
   * @param prompt - Câu lệnh đầu vào
   * @param modelOrOptions - Model string (legacy) hoặc options object
   * @param temperature - Temperature (chỉ dùng với legacy call)
   * @returns Nội dung response từ AI
   */
  async generateCompletion(
    prompt: string,
    modelOrOptions?: string | {
      provider?: AIProvider;
      model?: AIModel | string;
      temperature?: number;
    },
    temperature?: number
  ): Promise<string> {
    // Xử lý backward compatibility
    let provider: AIProvider;
    let model: string;
    let temp: number;

    if (typeof modelOrOptions === 'string') {
      // Legacy call: generateCompletion(prompt, model, temperature)
      provider = this.defaultProvider;
      model = modelOrOptions;
      temp = temperature ?? 0.7;
    } else {
      // New call: generateCompletion(prompt, { provider, model, temperature })
      provider = modelOrOptions?.provider || this.defaultProvider;
      temp = modelOrOptions?.temperature ?? 0.7;

      if (modelOrOptions?.model) {
        model = modelOrOptions.model;
      } else {
        model = provider === AIProvider.GEMINI
          ? AIModel.GEMINI_25_FLASH
          : AIModel.GPT_35_TURBO;
      }
    }

    try {
      console.log(`🤖 Calling ${provider.toUpperCase()} with model: ${model}`);

      if (provider === AIProvider.OPENAI) {
        return await this.generateWithOpenAI(prompt, model, temp);
      } else {
        return await this.generateWithGemini(prompt, model, temp);
      }
    } catch (error) {
      console.error(`❌ ${provider.toUpperCase()} API Error:`, error);
      throw error;
    }
  }

  /**
   * Lấy danh sách models có sẵn theo provider
   */
  getAvailableModels(provider: AIProvider): string[] {
    if (provider === AIProvider.OPENAI) {
      return [
        AIModel.GPT_4,
        AIModel.GPT_4_TURBO,
        AIModel.GPT_35_TURBO,
      ];
    } else {
      return [
        AIModel.GEMINI_PRO_LATEST,
        AIModel.GEMINI_FLASH_LATEST,
        AIModel.GEMINI_25_PRO,
        AIModel.GEMINI_25_FLASH,
        AIModel.GEMINI_20_FLASH,
      ];
    }
  }

  /**
   * Lấy tất cả models từ tất cả providers
   */
  getAllAvailableModels(): { provider: AIProvider; models: string[] }[] {
    return [
      { provider: AIProvider.OPENAI, models: this.getAvailableModels(AIProvider.OPENAI) },
      { provider: AIProvider.GEMINI, models: this.getAvailableModels(AIProvider.GEMINI) },
    ];
  }

  /**
   * Lấy default provider hiện tại
   */
  getDefaultProvider(): AIProvider {
    return this.defaultProvider;
  }

  /**
   * Thay đổi default provider
   */
  setDefaultProvider(provider: AIProvider): void {
    this.defaultProvider = provider;
  }
}

// Export singleton instance
export const llmClient = new LLMClient();








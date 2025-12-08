import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * EmbeddingService
 * Generates vector embeddings for text using OpenAI or Google Gemini
 * Supports batch processing for efficiency
 */
export class EmbeddingService {
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private defaultProvider: 'openai' | 'gemini' = 'openai';

  constructor() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Gemini if API key is available
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    // Set default provider
    this.defaultProvider = (process.env.DEFAULT_EMBEDDING_PROVIDER as 'openai' | 'gemini') || 'openai';

    if (!this.openai && !this.gemini) {
      console.warn('⚠️  No embedding API keys configured. Embeddings will not work.');
    }
  }

  /**
   * Generate embedding for a single text
   * Uses OpenAI text-embedding-3-small (1536 dimensions) by default
   */
  async generateEmbedding(
    text: string,
    options?: { provider?: 'openai' | 'gemini'; timeout?: number }
  ): Promise<number[]> {
    const provider = options?.provider || this.defaultProvider;
    const timeout = options?.timeout || 30000; // 30 seconds default

    // Trim whitespace and check for empty text
    const cleanText = text.trim();
    if (!cleanText) {
      throw new Error('Cannot generate embedding for empty text');
    }

    // Check if any provider is configured
    if (!this.openai && !this.gemini) {
      throw new Error('No embedding provider configured. Please set OPENAI_API_KEY or GEMINI_API_KEY');
    }

    // Create a promise with timeout
    const embeddingPromise = (async () => {
      try {
        if (provider === 'openai' && this.openai) {
          return await this.generateOpenAIEmbedding(cleanText);
        } else if (provider === 'gemini' && this.gemini) {
          return await this.generateGeminiEmbedding(cleanText);
        } else {
          throw new Error(`Provider ${provider} is not configured`);
        }
      } catch (error) {
        console.error(`❌ Error generating embedding with ${provider}:`, error);

        // Try fallback to other provider
        if (provider === 'openai' && this.gemini) {
          console.log('⚡ Falling back to Gemini for embedding...');
          return await this.generateGeminiEmbedding(cleanText);
        } else if (provider === 'gemini' && this.openai) {
          console.log('⚡ Falling back to OpenAI for embedding...');
          return await this.generateOpenAIEmbedding(cleanText);
        }

        throw error;
      }
    })();

    // Add timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Embedding generation timeout after ${timeout}ms`)), timeout);
    });

    return Promise.race([embeddingPromise, timeoutPromise]);
  }

  /**
   * Generate embeddings for multiple texts in batch
   * More efficient than calling generateEmbedding multiple times
   */
  async generateEmbeddingsBatch(
    texts: string[],
    options?: { provider?: 'openai' | 'gemini'; timeout?: number }
  ): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const provider = options?.provider || this.defaultProvider;
    const timeout = options?.timeout || 60000; // 60 seconds for batch

    // Check if any provider is configured
    if (!this.openai && !this.gemini) {
      throw new Error('No embedding provider configured. Please set OPENAI_API_KEY or GEMINI_API_KEY');
    }

    // Create a promise with timeout
    const batchPromise = (async () => {
      try {
        if (provider === 'openai' && this.openai) {
          return await this.generateOpenAIEmbeddingsBatch(texts);
        } else if (provider === 'gemini' && this.gemini) {
          return await this.generateGeminiEmbeddingsBatch(texts);
        } else {
          throw new Error(`Provider ${provider} is not configured`);
        }
      } catch (error) {
        console.error(`❌ Error generating batch embeddings with ${provider}:`, error);

        // Try fallback
        if (provider === 'openai' && this.gemini) {
          console.log('⚡ Falling back to Gemini for batch embeddings...');
          return await this.generateGeminiEmbeddingsBatch(texts);
        } else if (provider === 'gemini' && this.openai) {
          console.log('⚡ Falling back to OpenAI for batch embeddings...');
          return await this.generateOpenAIEmbeddingsBatch(texts);
        }

        throw error;
      }
    })();

    // Add timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Batch embedding generation timeout after ${timeout}ms`)), timeout);
    });

    return Promise.race([batchPromise, timeoutPromise]);
  }

  /**
   * OpenAI embedding generation
   * Model: text-embedding-3-small (1536 dimensions)
   */
  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  }

  /**
   * OpenAI batch embedding generation
   */
  private async generateOpenAIEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    // OpenAI supports batch up to 2048 texts
    const BATCH_SIZE = 2048;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
        encoding_format: 'float',
      });

      const embeddings = response.data.map(item => item.embedding);
      allEmbeddings.push(...embeddings);
    }

    return allEmbeddings;
  }

  /**
   * Gemini embedding generation
   * Model: text-embedding-004 (768 dimensions)
   * Note: Gemini embeddings are 768D, need to pad to 1536D for compatibility
   */
  private async generateGeminiEmbedding(text: string): Promise<number[]> {
    if (!this.gemini) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.gemini.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);

    // Gemini returns 768 dimensions, pad to 1536 for PostgreSQL vector consistency
    const embedding = result.embedding.values;
    return this.padEmbedding(embedding, 1536);
  }

  /**
   * Gemini batch embedding generation
   */
  private async generateGeminiEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (!this.gemini) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.gemini.getGenerativeModel({ model: 'text-embedding-004' });

    // Gemini batch embedding
    const result = await model.batchEmbedContents({
      requests: texts.map(text => ({ content: { parts: [{ text }] } })),
    });

    return result.embeddings.map(emb => this.padEmbedding(emb.values, 1536));
  }

  /**
   * Pad embedding to target dimension with zeros
   * Used to make Gemini 768D compatible with OpenAI 1536D
   */
  private padEmbedding(embedding: number[], targetDim: number): number[] {
    if (embedding.length >= targetDim) {
      return embedding.slice(0, targetDim);
    }

    const padded = [...embedding];
    while (padded.length < targetDim) {
      padded.push(0);
    }
    return padded;
  }

  /**
   * Calculate cosine similarity between two embeddings
   * Returns value between -1 and 1, where 1 is identical
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();

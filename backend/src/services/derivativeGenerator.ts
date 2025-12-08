/**
 * DerivativeGenerator Service
 * 
 * Generates multi-platform content derivatives from a draft content:
 * - twitter_thread: 10 tweets (array of strings)
 * - linkedin: LinkedIn post (string)
 * - email: Email newsletter (string)
 * - blog_summary: ~200 word summary (string)
 * - seo_description: Short SEO description (string)
 */

import { llmClient, LLMOptions, AIProvider } from '../lib/llmClient.js';
import { db } from '../lib/db.js';

/**
 * Derivative types
 */
export interface ContentDerivatives {
  twitter_thread: string[];
  linkedin: string;
  email: string;
  blog_summary: string;
  seo_description: string;
}

/**
 * Generator options
 */
export interface DerivativeOptions {
  language?: string;
  provider?: AIProvider;
  maxRetries?: number;
}

/**
 * Validation result
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
  fixed?: ContentDerivatives;
}

/**
 * DerivativeGenerator class
 * Handles generation, validation, and storage of content derivatives
 */
export class DerivativeGenerator {
  private readonly MAX_RETRIES = 3;
  private readonly TWITTER_THREAD_COUNT = 10;

  /**
   * Build prompt for generating all derivatives at once
   */
  private buildDerivativesPrompt(draftContent: string, language: string = 'vi'): string {
    const langInstruction = language === 'vi' 
      ? 'Viết tất cả nội dung bằng tiếng Việt.'
      : language === 'en'
      ? 'Write all content in English.'
      : `Write all content in ${language}.`;

    return `Bạn là chuyên gia content marketing. Từ bài viết gốc dưới đây, hãy tạo ra 5 biến thể nội dung cho các nền tảng khác nhau.

${langInstruction}

=== BÀI VIẾT GỐC ===
${draftContent}
=== HẾT BÀI VIẾT GỐC ===

Hãy tạo ra JSON với cấu trúc CHÍNH XÁC như sau (không thêm bất kỳ text nào khác):

{
  "twitter_thread": [
    "Tweet 1: Hook mạnh mẽ thu hút attention (tối đa 280 ký tự)",
    "Tweet 2: Điểm chính thứ nhất",
    "Tweet 3: Điểm chính thứ hai",
    "Tweet 4: Điểm chính thứ ba",
    "Tweet 5: Insight hoặc số liệu thú vị",
    "Tweet 6: Ví dụ cụ thể hoặc case study",
    "Tweet 7: Tips thực hành",
    "Tweet 8: Common mistakes để tránh",
    "Tweet 9: Quick win hoặc action step",
    "Tweet 10: CTA và kết luận (kèm hashtags)"
  ],
  "linkedin": "Bài post LinkedIn chuyên nghiệp (~300-500 từ). Bắt đầu bằng hook, phát triển 3-4 điểm chính với bullet points, kết thúc bằng câu hỏi engage audience. Sử dụng emoji phù hợp.",
  "email": "Email newsletter (~400-600 từ). Subject line hấp dẫn ở đầu (format: Subject: ...), sau đó là body email với greeting, main content, và CTA cuối.",
  "blog_summary": "Tóm tắt blog khoảng 200 từ. Capture được essence của bài viết, highlight 3-5 key takeaways, phù hợp để làm intro hoặc excerpt.",
  "seo_description": "Meta description cho SEO (150-160 ký tự). Ngắn gọn, có keyword, và có CTA."
}

YÊU CẦU QUAN TRỌNG:
1. Trả về ĐÚNG JSON format, không có text thừa trước hoặc sau
2. twitter_thread PHẢI có CHÍNH XÁC 10 tweets
3. Mỗi tweet tối đa 280 ký tự
4. Tất cả các trường KHÔNG được null hoặc empty
5. Nội dung phải relevant với bài viết gốc
6. Giữ tone nhất quán với bài viết gốc

CHỈ trả về JSON, không giải thích gì thêm.`;
  }

  /**
   * Parse and validate LLM response
   */
  private parseResponse(response: string): ContentDerivatives | null {
    try {
      // Clean response - remove markdown code blocks if present
      let cleaned = response.trim();
      
      // Remove ```json and ``` markers
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      // Find JSON object boundaries
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error('❌ No valid JSON object found in response');
        return null;
      }

      const jsonStr = cleaned.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);

      return parsed as ContentDerivatives;
    } catch (error) {
      console.error('❌ Failed to parse LLM response:', error);
      console.log('Raw response:', response.substring(0, 500));
      return null;
    }
  }

  /**
   * Validate derivatives object
   */
  private validateDerivatives(derivatives: ContentDerivatives): ValidationResult {
    const errors: string[] = [];

    // Check all required keys exist
    const requiredKeys: (keyof ContentDerivatives)[] = [
      'twitter_thread',
      'linkedin',
      'email',
      'blog_summary',
      'seo_description'
    ];

    for (const key of requiredKeys) {
      if (!(key in derivatives) || derivatives[key] === null || derivatives[key] === undefined) {
        errors.push(`Missing or null key: ${key}`);
      }
    }

    // Validate twitter_thread
    if (derivatives.twitter_thread) {
      if (!Array.isArray(derivatives.twitter_thread)) {
        errors.push('twitter_thread must be an array');
      } else if (derivatives.twitter_thread.length !== this.TWITTER_THREAD_COUNT) {
        errors.push(`twitter_thread must have exactly ${this.TWITTER_THREAD_COUNT} items, got ${derivatives.twitter_thread.length}`);
      } else {
        // Check each tweet
        derivatives.twitter_thread.forEach((tweet, i) => {
          if (typeof tweet !== 'string' || tweet.trim().length === 0) {
            errors.push(`twitter_thread[${i}] is empty or not a string`);
          }
        });
      }
    }

    // Validate string fields
    const stringFields: (keyof ContentDerivatives)[] = ['linkedin', 'email', 'blog_summary', 'seo_description'];
    for (const field of stringFields) {
      const value = derivatives[field];
      if (value !== undefined && value !== null) {
        if (typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        } else if (value.trim().length === 0) {
          errors.push(`${field} is empty`);
        }
      }
    }

    // Validate seo_description length (should be 150-160 chars, but allow some flexibility)
    if (derivatives.seo_description && derivatives.seo_description.length > 200) {
      // Just warn, don't fail
      console.warn(`⚠️ seo_description is longer than recommended (${derivatives.seo_description.length} chars)`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Attempt to fix common issues in derivatives
   */
  private attemptFix(derivatives: Partial<ContentDerivatives>): ContentDerivatives | null {
    try {
      const fixed: ContentDerivatives = {
        twitter_thread: [],
        linkedin: '',
        email: '',
        blog_summary: '',
        seo_description: ''
      };

      // Fix twitter_thread
      if (Array.isArray(derivatives.twitter_thread)) {
        fixed.twitter_thread = derivatives.twitter_thread
          .filter(t => typeof t === 'string' && t.trim().length > 0)
          .slice(0, this.TWITTER_THREAD_COUNT);
        
        // Pad if needed
        while (fixed.twitter_thread.length < this.TWITTER_THREAD_COUNT) {
          fixed.twitter_thread.push(`Tweet ${fixed.twitter_thread.length + 1}: [Nội dung cần bổ sung]`);
        }
      }

      // Fix string fields
      fixed.linkedin = typeof derivatives.linkedin === 'string' ? derivatives.linkedin : '';
      fixed.email = typeof derivatives.email === 'string' ? derivatives.email : '';
      fixed.blog_summary = typeof derivatives.blog_summary === 'string' ? derivatives.blog_summary : '';
      fixed.seo_description = typeof derivatives.seo_description === 'string' 
        ? derivatives.seo_description.substring(0, 200) 
        : '';

      // Validate the fixed version
      const validation = this.validateDerivatives(fixed);
      if (validation.valid) {
        console.log('✅ Successfully fixed derivatives');
        return fixed;
      }

      console.error('❌ Could not fix derivatives:', validation.errors);
      return null;
    } catch (error) {
      console.error('❌ Error fixing derivatives:', error);
      return null;
    }
  }

  /**
   * Generate derivatives from draft content
   * Main entry point for the service
   */
  async generateDerivativesFromDraft(
    draftContent: string,
    options: DerivativeOptions = {}
  ): Promise<ContentDerivatives> {
    const { language = 'vi', maxRetries = this.MAX_RETRIES } = options;

    if (!draftContent || draftContent.trim().length < 50) {
      throw new Error('Draft content is too short or empty');
    }

    console.log(`🚀 Generating derivatives (language: ${language})...`);

    const prompt = this.buildDerivativesPrompt(draftContent, language);
    
    // Try models in order
    const modelsToTry = [
      { model: 'gemini-1.5-flash-latest', provider: AIProvider.GEMINI },
      { model: 'gpt-4o-mini', provider: AIProvider.OPENAI },
    ];

    let lastError: Error | null = null;

    for (const { model, provider } of modelsToTry) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Attempt ${attempt}/${maxRetries} with ${model}...`);

          const llmOptions: LLMOptions = {
            provider,
            model,
            temperature: 0.7,
            maxTokens: 4000, // Need more tokens for all derivatives
          };

          const response = await llmClient.generateCompletion(prompt, llmOptions);

          // Parse response
          const parsed = this.parseResponse(response);
          if (!parsed) {
            throw new Error('Failed to parse LLM response');
          }

          // Validate
          const validation = this.validateDerivatives(parsed);
          if (validation.valid) {
            console.log('✅ Derivatives generated and validated successfully');
            return parsed;
          }

          // Try to fix
          console.warn(`⚠️ Validation errors: ${validation.errors.join(', ')}`);
          const fixed = this.attemptFix(parsed);
          if (fixed) {
            return fixed;
          }

          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);

        } catch (error: any) {
          lastError = error;
          console.error(`❌ Attempt ${attempt} failed:`, error.message);

          // If quota exceeded, try next model
          if (error.message?.includes('quota') || error.message?.includes('429')) {
            console.log('⚠️ Rate limit hit, trying next model...');
            break;
          }

          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    }

    throw lastError || new Error('Failed to generate derivatives after all retries');
  }

  /**
   * Save derivatives to database
   */
  async saveDerivatives(packId: string, derivatives: ContentDerivatives): Promise<void> {
    try {
      await db.query(
        `UPDATE content_packs 
         SET derivatives = $1::jsonb, updated_at = NOW() 
         WHERE pack_id = $2`,
        [JSON.stringify(derivatives), packId]
      );
      console.log(`✅ Saved derivatives for pack ${packId}`);
    } catch (error) {
      console.error('❌ Failed to save derivatives:', error);
      throw error;
    }
  }

  /**
   * Save derivative version for history
   */
  async saveDerivativeVersion(
    packId: string,
    derivativeType: string,
    content: any
  ): Promise<string> {
    try {
      const result = await db.query(
        `INSERT INTO derivative_versions (pack_id, derivative_type, content)
         VALUES ($1, $2, $3::jsonb)
         RETURNING version_id`,
        [packId, derivativeType, JSON.stringify(content)]
      );
      return result.rows[0].version_id;
    } catch (error) {
      console.error('❌ Failed to save derivative version:', error);
      throw error;
    }
  }

  /**
   * Get derivative versions for a pack
   */
  async getDerivativeVersions(
    packId: string,
    derivativeType?: string
  ): Promise<any[]> {
    try {
      let query = `
        SELECT * FROM derivative_versions 
        WHERE pack_id = $1
      `;
      const params: any[] = [packId];

      if (derivativeType) {
        query += ` AND derivative_type = $2`;
        params.push(derivativeType);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get derivative versions:', error);
      throw error;
    }
  }

  /**
   * Get derivatives from pack
   */
  async getDerivatives(packId: string): Promise<ContentDerivatives | null> {
    try {
      const result = await db.query(
        `SELECT derivatives FROM content_packs WHERE pack_id = $1`,
        [packId]
      );

      if (!result.rows[0]) {
        return null;
      }

      const derivatives = result.rows[0].derivatives;
      if (!derivatives || Object.keys(derivatives).length === 0) {
        return null;
      }

      return derivatives as ContentDerivatives;
    } catch (error) {
      console.error('❌ Failed to get derivatives:', error);
      throw error;
    }
  }

  /**
   * Convert derivatives to Markdown format
   */
  derivativesToMarkdown(derivatives: ContentDerivatives): string {
    let md = '# Content Derivatives\n\n';

    // Twitter Thread
    md += '## 🐦 Twitter Thread\n\n';
    derivatives.twitter_thread.forEach((tweet, i) => {
      md += `**Tweet ${i + 1}:**\n${tweet}\n\n---\n\n`;
    });

    // LinkedIn
    md += '## 💼 LinkedIn Post\n\n';
    md += derivatives.linkedin + '\n\n';

    // Email
    md += '## 📧 Email Newsletter\n\n';
    md += derivatives.email + '\n\n';

    // Blog Summary
    md += '## 📝 Blog Summary\n\n';
    md += derivatives.blog_summary + '\n\n';

    // SEO Description
    md += '## 🔍 SEO Description\n\n';
    md += `> ${derivatives.seo_description}\n`;

    return md;
  }
}

// Export singleton instance
export const derivativeGenerator = new DerivativeGenerator();


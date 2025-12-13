import { db } from '../lib/db.js';
import { llmClient, AIProvider, LLMOptions } from '../lib/llmClient.js';
import { randomUUID } from 'crypto';

/**
 * Pack status type
 */
export type PackStatus = 'draft' | 'review' | 'approved' | 'published';

/**
 * Status transition validation result
 */
export interface StatusTransitionResult {
  passed: boolean;
  error?: string;
}

/**
 * Valid status transitions state machine
 * 
 * Flow: draft → review → approved → published
 *       ↑__________|  (can go back to draft for edits)
 */
const VALID_TRANSITIONS: Record<PackStatus, PackStatus[]> = {
  draft: ['review'],                    // draft can go to review
  review: ['draft', 'approved'],        // review can go back to draft or forward to approved
  approved: ['review', 'published'],    // approved can go back to review or forward to published
  published: ['approved'],              // published can only go back to approved (unpublish)
};

/**
 * Validate pack status transition
 * 
 * @param current - Current status
 * @param next - Target status to transition to
 * @returns Validation result with error message if invalid
 */
export function validatePackStatusTransition(
  current: PackStatus,
  next: PackStatus
): StatusTransitionResult {
  // Same status - no transition needed
  if (current === next) {
    return { passed: true };
  }

  // Check if transition is allowed
  const allowedTransitions = VALID_TRANSITIONS[current];
  
  if (!allowedTransitions) {
    return {
      passed: false,
      error: `Invalid current status: ${current}`,
    };
  }

  if (!allowedTransitions.includes(next)) {
    return {
      passed: false,
      error: `Cannot transition from '${current}' to '${next}'. Allowed: ${allowedTransitions.join(', ')}`,
    };
  }

  return { passed: true };
}

/**
 * Get allowed next statuses for a given status
 */
export function getAllowedNextStatuses(current: PackStatus): PackStatus[] {
  return VALID_TRANSITIONS[current] || [];
}

/**
 * Content derivatives interface
 */
export interface ContentDerivatives {
  twitter_thread: string[];
  linkedin: string;
  email: string;
  blog_summary: string;
  seo_description: string;
}

/**
 * ContentPack entity interface
 */
export interface ContentPack {
  pack_id: string;
  brief_id: number;
  draft_content: string | null;
  word_count: number;
  status: PackStatus;
  derivatives: ContentDerivatives | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Input for creating draft content pack
 */
export interface CreateDraftInput {
  pack_id?: string;
  brief_id: number;
  audience?: string;
  // RAG options
  useRAG?: boolean;
  wordCount?: number;
  style?: string;
  searchFilters?: any;
}

/**
 * Brief data structure (minimal for pack generation)
 */
interface BriefData {
  id: number;
  title: string;
  objective: string;
  target_audience: string;
  key_messages: string[];
  tone_style: string | null;
  content_structure: any;
  seo_keywords: string[];
}

/**
 * PacksService - Business logic for content packs
 * Handles LLM streaming and SSE response
 */
export class PacksService {
  /**
   * Safely parse JSON with fallback
   */
  private safeJsonParse(value: any, fallback: any = null): any {
    if (value === null || value === undefined) return fallback;
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn('Failed to parse JSON in PacksService:', value?.substring?.(0, 100));
      return fallback;
    }
  }

  /**
   * Get brief by ID
   */
  async getBriefById(briefId: number): Promise<BriefData | null> {
    const result = await db.query('SELECT * FROM briefs WHERE id = $1', [briefId]);
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return {
      ...row,
      key_messages: this.safeJsonParse(row.key_messages, []),
      seo_keywords: this.safeJsonParse(row.seo_keywords, []),
      content_structure: this.safeJsonParse(row.content_structure, {})
    };
  }

  /**
   * Build prompt from brief and audience
   */
  buildPromptFromBrief(brief: BriefData, audience?: string): string {
    const targetAudience = audience || brief.target_audience;
    const wordCount = brief.content_structure?.totalWordCount || 600;
    const keyMessages = Array.isArray(brief.key_messages)
      ? brief.key_messages.join('\n   - ')
      : brief.key_messages;
    const keywords = Array.isArray(brief.seo_keywords)
      ? brief.seo_keywords.join(', ')
      : brief.seo_keywords;

    return `Viết bài content chất lượng cao bằng tiếng Việt về: "${brief.title}"

MỤC TIÊU: ${brief.objective}

ĐỐI TƯỢNG MỤC TIÊU: ${targetAudience}

THÔNG ĐIỆP CHÍNH:
   - ${keyMessages}

TONE & STYLE: ${brief.tone_style || 'Chuyên nghiệp, dễ hiểu, thân thiện'}

TỪ KHÓA SEO: ${keywords}

YÊU CẦU:
1. Viết tự nhiên, mạch lạc, thu hút người đọc
2. Cấu trúc rõ ràng với các heading (##) và subheading (###)
3. Sử dụng bullet points khi liệt kê
4. Đưa vào ví dụ cụ thể, số liệu nếu phù hợp
5. Kết thúc với call-to-action phù hợp
6. Độ dài: ~${wordCount} từ
7. Format: Markdown

CHỈ viết nội dung bài viết, KHÔNG thêm giải thích hay metadata.`;
  }

  /**
   * Generate draft content with streaming
   * Returns an async generator that yields text chunks
   */
  async *generateDraftStream(
    input: CreateDraftInput,
    options?: LLMOptions
  ): AsyncGenerator<{ type: 'chunk' | 'done' | 'error'; data: any }, void, unknown> {
    const { pack_id, brief_id, audience } = input;
    const packId = pack_id || randomUUID();

    // 1. Get brief from database
    const brief = await this.getBriefById(brief_id);
    if (!brief) {
      yield { type: 'error', data: { error: 'Brief not found', brief_id } };
      return;
    }

    console.log(`📝 Starting draft generation for brief ${brief_id} (pack: ${packId})`);

    // 2. Build prompt
    const prompt = this.buildPromptFromBrief(brief, audience);

    // 3. Stream from LLM
    let fullContent = '';
    const modelsToTry = [
      'gemini-1.5-flash-latest',
      'gpt-4o-mini',
    ];

    let success = false;
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const provider = model.startsWith('gpt') ? AIProvider.OPENAI : AIProvider.GEMINI;
        console.log(`🔄 Trying model: ${model} (${provider})...`);

        const streamOptions: LLMOptions = {
          ...options,
          provider,
          model,
          temperature: options?.temperature ?? 0.7,
          maxTokens: options?.maxTokens || 2000,
        };

        const stream = llmClient.generateCompletionStream(prompt, streamOptions);

        for await (const chunk of stream) {
          fullContent += chunk;
          yield { type: 'chunk', data: { text: chunk, pack_id: packId } };
        }

        if (fullContent.length > 50) {
          success = true;
          console.log(`✅ Successfully generated content using ${model}`);
          break;
        }
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || '';
        console.error(`❌ Model ${model} failed:`, errorMsg);

        // Reset content if this model failed
        fullContent = '';

        // If quota exceeded or not found, try next model
        if (errorMsg.includes('quota') || errorMsg.includes('429') ||
            errorMsg.includes('404') || errorMsg.includes('not found')) {
          console.log(`⚠️ Trying next model...`);
          continue;
        }
      }
    }

    if (!success) {
      const errorMessage = lastError?.message || 'Failed to generate content';
      yield { type: 'error', data: { error: errorMessage, pack_id: packId } };
      return;
    }

    // 4. Calculate word count
    const wordCount = fullContent.trim().split(/\s+/).filter(w => w.length > 0).length;

    // 5. Upsert to database
    try {
      await this.upsertContentPack({
        pack_id: packId,
        brief_id,
        draft_content: fullContent,
        word_count: wordCount,
        status: 'draft',
      });

      console.log(`✅ Saved content pack ${packId} (${wordCount} words)`);

      yield {
        type: 'done',
        data: {
          pack_id: packId,
          brief_id,
          word_count: wordCount,
          status: 'draft',
        }
      };
    } catch (dbError: any) {
      console.error('❌ Failed to save content pack:', dbError);
      yield { type: 'error', data: { error: 'Failed to save content pack', details: dbError.message } };
    }
  }

  /**
   * Upsert content pack into database
   */
  async upsertContentPack(pack: {
    pack_id: string;
    brief_id: number;
    draft_content: string;
    word_count: number;
    status: string;
  }): Promise<ContentPack> {
    const result = await db.query(
      `INSERT INTO content_packs (pack_id, brief_id, draft_content, word_count, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (pack_id)
       DO UPDATE SET
         draft_content = EXCLUDED.draft_content,
         word_count = EXCLUDED.word_count,
         status = EXCLUDED.status,
         updated_at = NOW()
       RETURNING *`,
      [pack.pack_id, pack.brief_id, pack.draft_content, pack.word_count, pack.status]
    );

    return result.rows[0];
  }

  /**
   * Get all content packs
   * Optimized: Only select necessary columns, parse JSON properly
   */
  async getAllPacks(): Promise<ContentPack[]> {
    const result = await db.query(`
      SELECT 
        cp.pack_id,
        cp.brief_id,
        cp.draft_content,
        cp.word_count,
        cp.status,
        cp.derivatives,
        cp.created_at,
        cp.updated_at,
        b.title as brief_title
      FROM content_packs cp
      LEFT JOIN briefs b ON cp.brief_id = b.id
      ORDER BY cp.created_at DESC
      LIMIT 100
    `);
    
    // Parse JSON derivatives properly
    return result.rows.map((row: any) => ({
      ...row,
      derivatives: this.safeJsonParse(row.derivatives),
    }));
  }

  /**
   * Get content pack by ID
   */
  async getPackById(packId: string): Promise<ContentPack | null> {
    const result = await db.query('SELECT * FROM content_packs WHERE pack_id = $1', [packId]);
    return result.rows[0] || null;
  }

  /**
   * Update draft content of a pack
   */
  async updateDraftContent(packId: string, draftContent: string): Promise<ContentPack | null> {
    // Calculate word count
    const wordCount = draftContent.trim().split(/\s+/).filter(w => w.length > 0).length;

    const result = await db.query(
      `UPDATE content_packs 
       SET draft_content = $1, 
           word_count = $2,
           updated_at = NOW()
       WHERE pack_id = $3
       RETURNING *`,
      [draftContent, wordCount, packId]
    );

    return result.rows[0] || null;
  }

  /**
   * Update pack status (simple - without validation)
   */
  async updatePackStatus(packId: string, status: PackStatus): Promise<ContentPack | null> {
    const result = await db.query(
      `UPDATE content_packs SET status = $1 WHERE pack_id = $2 RETURNING *`,
      [status, packId]
    );
    return result.rows[0] || null;
  }

  /**
   * Update pack status with validation (state machine)
   * 
   * @param packId - Pack UUID
   * @param newStatus - Target status
   * @returns Updated pack or throws error if transition invalid
   */
  async updatePackStatusWithValidation(
    packId: string,
    newStatus: PackStatus
  ): Promise<{ success: boolean; data?: ContentPack; error?: string; content?: any }> {
    // 1. Get current pack
    const pack = await this.getPackById(packId);
    if (!pack) {
      return { success: false, error: 'Content pack not found' };
    }

    // 2. Validate transition
    const validation = validatePackStatusTransition(pack.status, newStatus);
    if (!validation.passed) {
      return { success: false, error: validation.error };
    }

    // 3. Update status
    const updated = await this.updatePackStatus(packId, newStatus);
    if (!updated) {
      return { success: false, error: 'Failed to update status' };
    }

    console.log(`✅ Pack ${packId} status changed: ${pack.status} → ${newStatus}`);

    // 4. If transitioning to 'published', automatically create content
    let createdContent = null;
    if (newStatus === 'published') {
      try {
        // Import contents service dynamically to avoid circular dependency
        const { contentsService } = await import('./contents.service.js');
        createdContent = await contentsService.createContentFromPack(packId);
        console.log(`✅ Auto-created content from pack ${packId}`);
      } catch (error: any) {
        console.error(`⚠️  Failed to auto-create content:`, error.message);
        // Don't fail the status update if content creation fails
        // User can manually create content later
      }
    }

    return { success: true, data: updated, content: createdContent };
  }

  /**
   * Get allowed next statuses for a pack
   */
  async getPackAllowedStatuses(packId: string): Promise<{ current: PackStatus; allowed: PackStatus[] } | null> {
    const pack = await this.getPackById(packId);
    if (!pack) return null;

    return {
      current: pack.status,
      allowed: getAllowedNextStatuses(pack.status),
    };
  }

  /**
   * Generate draft pack and wait for completion (non-streaming wrapper)
   * This method wraps generateDraftStream and waits for completion
   */
  async generateDraftComplete(input: CreateDraftInput): Promise<ContentPack> {
    const { brief_id, pack_id, audience, useRAG, wordCount, style, searchFilters } = input;
    const packId = pack_id || randomUUID();

    console.log(`📦 Generating draft pack (complete) for brief ${brief_id}`, {
      packId,
      useRAG,
      wordCount,
      style,
    });

    let fullContent = '';
    let finalPack: ContentPack | null = null;

    // Collect all chunks from the stream
    for await (const event of this.generateDraftStream(input, { temperature: 0.7, maxTokens: 2000 })) {
      if (event.type === 'chunk') {
        fullContent += event.data.text || '';
      } else if (event.type === 'done') {
        finalPack = event.data as ContentPack;
      } else if (event.type === 'error') {
        throw new Error(event.data.error || 'Draft generation failed');
      }
    }

    if (!finalPack) {
      throw new Error('Draft generation did not complete successfully');
    }

    return finalPack;
  }

  /**
   * Delete pack
   */
  async deletePack(packId: string): Promise<boolean> {
    const result = await db.query('DELETE FROM content_packs WHERE pack_id = $1', [packId]);
    return (result.rowCount ?? 0) > 0;
  }
}

// Export singleton instance
export const packsService = new PacksService();


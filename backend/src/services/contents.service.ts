import { db } from '../lib/db.js';
import { llmClient, AIProvider } from '../lib/llmClient.js';

export interface Content {
  id: number;
  brief_id: number;
  title: string;
  body: string;
  format: string;
  word_count: number;
  status: string;
  author: string | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class ContentsService {
  async getAllContents(): Promise<Content[]> {
    const result = await db.query(`
      SELECT c.*,
             b.title as brief_title,
             i.persona as persona,
             i.industry as industry
      FROM contents c
      JOIN briefs b ON c.brief_id = b.id
      JOIN ideas i ON b.idea_id = i.id
      ORDER BY c.created_at DESC
    `);
    return result.rows;
  }

  async getContentById(id: number): Promise<Content | null> {
    const result = await db.query('SELECT * FROM contents WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * AI-generate content from brief
   */
  async generateContentFromBrief(
    briefId: number,
    options?: { wordCount?: number; style?: string }
  ): Promise<Content> {
    // Get brief
    const briefResult = await db.query('SELECT * FROM briefs WHERE id = $1', [briefId]);
    const brief = briefResult.rows[0];

    if (!brief) {
      throw new Error('Brief not found');
    }

    // Check if content already exists
    const existing = await db.query('SELECT * FROM contents WHERE brief_id = $1', [briefId]);
    if (existing.rows[0]) {
      throw new Error('Content already exists for this brief');
    }

    // Use custom options or defaults
    const targetWordCount = options?.wordCount || brief.content_structure.totalWordCount;
    const style = options?.style || 'professional';

    console.log(`📝 Generating content for brief ${briefId} (${targetWordCount} words, ${style} style)...`);

    // Style-specific instructions
    const styleInstructions = {
      professional: 'Phong cách chuyên nghiệp (formal, khách quan, dùng thuật ngữ chuyên ngành, tránh khô khan)',
      casual: 'Phong cách thân mật, gần gũi (friendly, conversational, dễ hiểu, có thể dùng ngôn ngữ đời sống)',
      academic: 'Phong cách học thuật nghiêm túc (scholarly, research-oriented, trích dẫn nghiên cứu, phân tích sâu)'
    };

    // Enhanced prompt for professional, creative content
    const prompt = `Viết bài essay bằng tiếng Việt về: "${brief.title}"

MỤC TIÊU: ${brief.objective}
ĐỐI TƯỢNG: ${brief.target_audience}

YÊU CẦU:
1. Phong cách: ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.professional}

2. Cấu trúc nội dung:
   - MỞ ĐẦU: Hook hấp dẫn + Background + Luận điểm chính
   - THÂN BÀI: 3-4 đoạn văn, mỗi đoạn tự nhiên kết hợp:
     * Luận điểm rõ ràng
     * Dẫn chứng cụ thể (số liệu, nghiên cứu, ví dụ thực tế)
     * Giải thích và phân tích sâu
     KHÔNG dùng label như "Statement:", "Evidence:", "Explanation:" - chỉ viết tự nhiên
   - KẾT LUẬN: Tóm tắt điểm chính + Hàm ý và triển vọng

3. Định dạng và trình bày:
   - Sử dụng icon/emoji hợp lý (1-3 icon) để làm nổi bật các phần quan trọng, tránh lạm dụng
   - Dùng bullet points (•) hoặc numbering (1., 2., 3.) khi liệt kê các điểm, khái niệm, hoặc bước
   - Có thể dùng heading (##) để phân chia các phần lớn nếu cần
   - Kết hợp đoạn văn và danh sách một cách tự nhiên

4. Độ dài: ~${targetWordCount} từ

5. Sáng tạo: Viết một cách tự nhiên, linh hoạt, không quá cứng nhắc.

CHỈ viết essay văn bản markdown, KHÔNG xuất JSON.`;

    // Try different Gemini models with fallback (using valid model names)
    const modelsToTry = [
      'gemini-2.5-flash',      // Fast and reliable
      'gemini-2.5-pro',        // More capable
      'gemini-2.0-flash',      // Fallback option
      'gemini-flash-latest',   // Latest flash model
      'gemini-pro-latest',     // Latest pro model
    ];

    let body = '';
    let lastError: any = null;
    let modelUsed = '';

    for (const model of modelsToTry) {
      try {
        console.log(`🔄 Trying model: ${model}...`);

        body = await llmClient.generateCompletion(prompt, {
          provider: AIProvider.GEMINI,
          model: model,
          temperature: 0.7,
        });

        if (body && body.trim().length > 100) {
          console.log(`✅ Got valid response from ${model}`);
          modelUsed = model;
          break;
        } else {
          throw new Error('Response too short or empty');
        }
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || '';
        console.error(`❌ Model ${model} failed:`, errorMsg);

        // If quota exceeded, try next model immediately
        if (errorMsg.includes('quota') || errorMsg.includes('429')) {
          console.log(`⚠️ Quota exceeded for ${model}, trying next model...`);
          continue;
        }

        // If model not found, try next model
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          console.log(`⚠️ Model ${model} not available, trying next model...`);
          continue;
        }

        // For other errors, wait a bit before trying next
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!body || body.trim().length < 100) {
      // Check if all models are quota-exceeded
      const isQuotaIssue = lastError?.message?.includes('quota') || lastError?.message?.includes('429');

      if (isQuotaIssue) {
        throw new Error('Gemini API đã hết quota miễn phí. Vui lòng chờ hoặc nâng cấp API key. Chi tiết: https://ai.google.dev/gemini-api/docs/rate-limits');
      }

      throw new Error(`Không thể tạo content: ${lastError?.message || 'Unknown error'}`);
    }

    console.log(`✅ Successfully generated content using ${modelUsed}`);

    // Clean up any JSON artifacts that might appear
    let cleanedBody = body.trim();

    // Remove JSON-like patterns at the start
    if (cleanedBody.startsWith('{') || cleanedBody.startsWith('[')) {
      // Try to extract the actual content from JSON
      try {
        const jsonMatch = cleanedBody.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.content) cleanedBody = parsed.content;
          else if (parsed.body) cleanedBody = parsed.body;
        } else {
          // Remove everything until we find the actual essay text
          const firstParagraphMatch = cleanedBody.match(/(?:^|\n)([A-ZĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ][\s\S]*)/);
          if (firstParagraphMatch) {
            cleanedBody = firstParagraphMatch[1];
          }
        }
      } catch (e) {
        // If can't parse as JSON, look for the first capital letter paragraph
        const match = cleanedBody.match(/(?:^|\n)([A-ZĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ][\s\S]*)/);
        if (match) cleanedBody = match[1];
      }
    }

    const wordCount = cleanedBody.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/min

    const result = await db.query(
      `INSERT INTO contents (brief_id, title, body, format, word_count, status, reading_time, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [briefId, brief.title, cleanedBody, 'markdown', wordCount, 'draft', readingTime]
    );

    console.log(`✅ Academic content generated (${wordCount} words, ${readingTime} min read)`);
    return result.rows[0];
  }

  async updateStatus(id: number, status: string): Promise<Content | null> {
    const result = await db.query(
      `UPDATE contents SET status = $1, updated_at = NOW() RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  }

  async deleteContent(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM contents WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Convert a published Content Pack to Content
   * Only packs with status 'published' can be converted
   */
  async createContentFromPack(packId: string): Promise<Content> {
    // 1. Get the pack
    const packResult = await db.query(
      'SELECT * FROM content_packs WHERE pack_id = $1',
      [packId]
    );
    const pack = packResult.rows[0];

    if (!pack) {
      throw new Error('Content pack not found');
    }

    if (pack.status !== 'published') {
      throw new Error(`Only published packs can be converted to content. Current status: ${pack.status}`);
    }

    // 2. Get the brief for title and other metadata
    const briefResult = await db.query('SELECT * FROM briefs WHERE id = $1', [pack.brief_id]);
    const brief = briefResult.rows[0];

    if (!brief) {
      throw new Error('Brief not found for this pack');
    }

    // 3. Check if content already exists for this brief
    const existingContent = await db.query(
      'SELECT * FROM contents WHERE brief_id = $1',
      [pack.brief_id]
    );
    if (existingContent.rows[0]) {
      throw new Error('Content already exists for this brief');
    }

    // 4. Calculate reading time
    const wordCount = pack.word_count || 0;
    const readingTime = Math.ceil(wordCount / 200);

    // 5. Insert the content
    const result = await db.query(
      `INSERT INTO contents (brief_id, title, body, format, word_count, status, reading_time, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        pack.brief_id,
        brief.title,
        pack.draft_content,
        'markdown',
        wordCount,
        'published',  // Content from pack is already published
        readingTime
      ]
    );

    console.log(`✅ Created content from pack ${packId} for brief ${pack.brief_id}`);
    return result.rows[0];
  }

  /**
   * Get content by brief ID
   */
  async getContentByBriefId(briefId: number): Promise<Content | null> {
    const result = await db.query('SELECT * FROM contents WHERE brief_id = $1', [briefId]);
    return result.rows[0] || null;
  }
}

export const contentsService = new ContentsService();

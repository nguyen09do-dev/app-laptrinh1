import { db } from '../lib/db.js';
import { llmClient, AIProvider } from '../lib/llmClient.js';

export interface Content {
  id: number;
  brief_id: number;
  content_id: string | null; // UUID grouping all versions
  version_number: number;
  title: string;
  body: string;
  format: string;
  word_count: number;
  status: string;
  author: string | null;
  published_at: Date | null;
  pack_id: string | null; // Track which pack created this
  created_at: Date;
  updated_at: Date;
}

export interface ContentVersion {
  version_id: string;
  content_id: string;
  version_number: number;
  brief_id: number;
  title: string;
  body: string;
  format: string;
  word_count: number;
  status: string;
  author: string | null;
  published_at: Date | null;
  pack_id: string | null;
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
      LIMIT 500
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
   * If content already exists, creates a new version instead of throwing error
   */
  async createContentFromPack(packId: string, options?: { replaceExisting?: boolean }): Promise<Content> {
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
    const existingContentResult = await db.query(
      'SELECT * FROM contents WHERE brief_id = $1 ORDER BY version_number DESC LIMIT 1',
      [pack.brief_id]
    );
    const existingContent = existingContentResult.rows[0];

    // 4. Calculate reading time
    const wordCount = pack.word_count || 0;
    const readingTime = Math.ceil(wordCount / 200);

    let contentId: string;
    let versionNumber: number;

    if (existingContent) {
      // Content exists - create new version
      contentId = existingContent.content_id || existingContent.id.toString();
      versionNumber = (existingContent.version_number || 1) + 1;

      // Archive old version to content_versions table
      await db.query(
        `INSERT INTO content_versions (
          content_id, version_number, brief_id, title, body, format, 
          word_count, status, author, published_at, pack_id, created_at, updated_at
        )
        SELECT 
          content_id, version_number, brief_id, title, body, format,
          word_count, status, author, published_at, pack_id, created_at, updated_at
        FROM contents
        WHERE id = $1
        ON CONFLICT (content_id, version_number) DO NOTHING`,
        [existingContent.id]
      );

      console.log(`📝 Creating version ${versionNumber} for existing content (brief ${pack.brief_id})`);

      // If replaceExisting is true, update the existing content instead of creating new
      if (options?.replaceExisting) {
        const result = await db.query(
          `UPDATE contents 
           SET title = $1, body = $2, word_count = $3, version_number = $4,
               pack_id = $5, reading_time = $6, updated_at = NOW()
           WHERE id = $7
           RETURNING *`,
          [brief.title, pack.draft_content, wordCount, versionNumber, packId, readingTime, existingContent.id]
        );
        return result.rows[0];
      }
    } else {
      // New content - generate UUID for content_id
      const uuidResult = await db.query('SELECT gen_random_uuid() as id');
      contentId = uuidResult.rows[0].id;
      versionNumber = 1;
      console.log(`✨ Creating new content (brief ${pack.brief_id})`);
    }

    // 5. Insert the new content/version
    const result = await db.query(
      `INSERT INTO contents (
        brief_id, content_id, version_number, title, body, format, 
        word_count, status, pack_id, reading_time, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *`,
      [
        pack.brief_id,
        contentId,
        versionNumber,
        brief.title,
        pack.draft_content,
        'markdown',
        wordCount,
        'published',  // Content from pack is already published
        packId,
        readingTime
      ]
    );

    console.log(`✅ Created content version ${versionNumber} from pack ${packId} for brief ${pack.brief_id}`);
    return result.rows[0];
  }

  /**
   * Get all versions of a content
   */
  async getContentVersions(contentId: string): Promise<ContentVersion[]> {
    // Get active versions from contents table
    const activeResult = await db.query(
      `SELECT 
        id::text as version_id,
        content_id,
        version_number,
        brief_id,
        title,
        body,
        format,
        word_count,
        status,
        author,
        published_at,
        pack_id,
        created_at,
        updated_at
      FROM contents 
      WHERE content_id = $1
      ORDER BY version_number DESC`,
      [contentId]
    );

    // Get archived versions from content_versions table
    const archivedResult = await db.query(
      `SELECT 
        version_id,
        content_id,
        version_number,
        brief_id,
        title,
        body,
        format,
        word_count,
        status,
        author,
        published_at,
        pack_id,
        created_at,
        updated_at
      FROM content_versions 
      WHERE content_id = $1
      ORDER BY version_number DESC`,
      [contentId]
    );

    // Combine and sort by version_number
    const allVersions = [...activeResult.rows, ...archivedResult.rows];
    allVersions.sort((a, b) => b.version_number - a.version_number);

    return allVersions;
  }

  /**
   * Get content by content_id (returns latest version)
   */
  async getContentByContentId(contentId: string): Promise<Content | null> {
    const result = await db.query(
      'SELECT * FROM contents WHERE content_id = $1 ORDER BY version_number DESC LIMIT 1',
      [contentId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get content by brief ID
   */
  async getContentByBriefId(briefId: number): Promise<Content | null> {
    const result = await db.query('SELECT * FROM contents WHERE brief_id = $1', [briefId]);
    return result.rows[0] || null;
  }

  /**
   * Set a specific version as the active/current version
   * This will:
   * 1. Archive the current active version to content_versions
   * 2. Move the selected version from content_versions to contents (if archived)
   * 3. Or update the existing content in contents table
   */
  async setActiveVersion(contentId: string, versionNumber: number): Promise<Content> {
    console.log(`🔄 Setting version ${versionNumber} as active for content ${contentId}`);
    
    // 1. First check if version exists in contents table (active)
    const activeVersionResult = await db.query(
      `SELECT id, content_id, version_number, brief_id, title, body, format,
              word_count, status, author, published_at, pack_id, reading_time, created_at, updated_at
       FROM contents
       WHERE content_id = $1 AND version_number = $2`,
      [contentId, versionNumber]
    );

    // 2. Check if version exists in content_versions (archived)
    const archivedVersionResult = await db.query(
      `SELECT version_id, content_id, version_number, brief_id, title, body, format,
              word_count, status, author, published_at, pack_id, created_at, updated_at
       FROM content_versions
       WHERE content_id = $1 AND version_number = $2`,
      [contentId, versionNumber]
    );

    if (activeVersionResult.rows.length === 0 && archivedVersionResult.rows.length === 0) {
      throw new Error(`Version ${versionNumber} not found for content ${contentId}`);
    }

    // Determine if target is in contents (active) or content_versions (archived)
    const isInContents = activeVersionResult.rows.length > 0;
    const targetVersion = isInContents ? activeVersionResult.rows[0] : archivedVersionResult.rows[0];
    
    console.log(`📊 Target version found: ${isInContents ? 'in contents' : 'in content_versions'}`);

    // 3. Get current active version
    const currentActiveResult = await db.query(
      'SELECT * FROM contents WHERE content_id = $1 ORDER BY version_number DESC LIMIT 1',
      [contentId]
    );
    const currentActive = currentActiveResult.rows[0];

    console.log(`📊 Current active version: ${currentActive?.version_number || 'none'}`);

    // 4. If target version is already active, return it
    if (currentActive && currentActive.version_number === versionNumber) {
      console.log(`✅ Version ${versionNumber} is already active`);
      return currentActive;
    }

    // 5. Archive current active version to content_versions
    if (currentActive) {
      // Get reading_time from current active (might not exist in old data)
      const readingTime = currentActive.reading_time || Math.ceil((currentActive.word_count || 0) / 200);
      
      await db.query(
        `INSERT INTO content_versions (
          content_id, version_number, brief_id, title, body, format,
          word_count, status, author, published_at, pack_id, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (content_id, version_number) DO UPDATE SET
          title = EXCLUDED.title,
          body = EXCLUDED.body,
          word_count = EXCLUDED.word_count,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at`,
        [
          currentActive.content_id,
          currentActive.version_number,
          currentActive.brief_id,
          currentActive.title,
          currentActive.body,
          currentActive.format,
          currentActive.word_count,
          currentActive.status,
          currentActive.author,
          currentActive.published_at,
          currentActive.pack_id,
          currentActive.created_at,
          currentActive.updated_at,
        ]
      );

      // Delete from contents table
      await db.query('DELETE FROM contents WHERE id = $1', [currentActive.id]);
      console.log(`📦 Archived version ${currentActive.version_number} to content_versions`);
    }

    // 6. If target version is in content_versions (archived), move it to contents
    if (!isInContents) {
      console.log(`🔄 Moving version ${versionNumber} from content_versions to contents`);
      // Move from content_versions to contents
      const archived = targetVersion;
      
      // Calculate reading time
      const readingTime = Math.ceil((archived.word_count || 0) / 200);
      
      console.log(`📊 Inserting version with:`, {
        brief_id: archived.brief_id,
        content_id: archived.content_id,
        version_number: archived.version_number,
        word_count: archived.word_count,
        reading_time: readingTime,
      });
      
      try {
        // Insert into contents
        const result = await db.query(
          `INSERT INTO contents (
            brief_id, content_id, version_number, title, body, format,
            word_count, status, author, published_at, pack_id, reading_time, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *`,
          [
            archived.brief_id,
            archived.content_id,
            archived.version_number,
            archived.title,
            archived.body,
            archived.format || 'markdown',
            archived.word_count || 0,
            archived.status || 'published',
            archived.author || null,
            archived.published_at || null,
            archived.pack_id || null,
            readingTime,
            archived.created_at || new Date(),
            archived.updated_at || new Date(),
          ]
        );

        // Delete from content_versions
        await db.query(
          'DELETE FROM content_versions WHERE version_id = $1',
          [archived.version_id]
        );

        console.log(`✅ Set version ${versionNumber} as active for content ${contentId}`);
        return result.rows[0];
      } catch (insertError: any) {
        console.error('❌ Error inserting version into contents:', insertError);
        console.error('Error details:', {
          message: insertError.message,
          code: insertError.code,
          detail: insertError.detail,
        });
        throw new Error(`Failed to set active version: ${insertError.message}`);
      }
    } else {
      // Target version is already in contents, just update it
      console.log(`✅ Version ${versionNumber} is already in contents, updating...`);
      const result = await db.query(
        `UPDATE contents 
         SET updated_at = NOW()
         WHERE content_id = $1 AND version_number = $2
         RETURNING *`,
        [contentId, versionNumber]
      );

      if (result.rows.length === 0) {
        throw new Error(`Failed to update version ${versionNumber} in contents`);
      }

      console.log(`✅ Version ${versionNumber} is now active for content ${contentId}`);
      return result.rows[0];
    }
  }
}

export const contentsService = new ContentsService();

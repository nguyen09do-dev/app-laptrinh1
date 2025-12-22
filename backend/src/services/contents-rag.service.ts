import { db } from '../lib/db.js';
import { llmClient, AIProvider } from '../lib/llmClient.js';
import { ragService } from './rag.service.js';
import { extractCitationsFromContent } from '../middleware/citationValidator.js';

/**
 * ContentsRAGService
 * Enhanced content generation with RAG (Retrieval Augmented Generation)
 * Generates content using knowledge base context and citations
 */

interface GenerateContentWithRAGOptions {
  briefId: number;
  wordCount?: number;
  style?: string;
  useRAG?: boolean;
  searchFilters?: {
    author?: string;
    tags?: string[];
    match_threshold?: number;
    match_count?: number;
  };
  llmOptions?: {
    model?: string;
    temperature?: number;
  };
}

interface ContentWithRAG {
  content: any;
  rag_context?: {
    sources: Array<{
      index: number;
      doc_id: string;
      chunk_id?: string;
      title: string;
      snippet: string;
      url?: string;
      similarity: number;
    }>;
    citations_used: Array<{
      citation_index: number;
      doc_id: string;
      snippet: string;
      url?: string;
    }>;
  };
}

export class ContentsRAGService {
  /**
   * Generate content from brief with RAG enhancement
   * Retrieves relevant documents and includes citations
   */
  async generateContentWithRAG(
    options: GenerateContentWithRAGOptions
  ): Promise<ContentWithRAG> {
    const { briefId, wordCount, style = 'professional', useRAG = true, searchFilters, llmOptions } = options;

    // Get brief with idea info
    const briefResult = await db.query(`
      SELECT b.*, i.title as idea_title, i.description, i.persona, i.industry
      FROM briefs b
      JOIN ideas i ON b.idea_id = i.id
      WHERE b.id = $1
    `, [briefId]);

    const brief = briefResult.rows[0];

    if (!brief) {
      throw new Error('Brief not found');
    }

    // Check if content already exists
    const existing = await db.query('SELECT * FROM contents WHERE brief_id = $1', [briefId]);
    if (existing.rows[0]) {
      throw new Error('Content already exists for this brief');
    }

    const targetWordCount = wordCount || brief.content_structure?.totalWordCount || 800;

    let ragContext = null;

    if (useRAG) {
      // Build search query from brief
      const searchQuery = `${brief.title}. ${brief.objective}. ${brief.target_audience}`;

      console.log(`🔍 Searching knowledge base for content generation: "${searchQuery}"`);

      // Get RAG context
      ragContext = await ragService.buildContext(searchQuery, {
        match_threshold: searchFilters?.match_threshold || 0.7,
        match_count: searchFilters?.match_count || 8, // More chunks for content generation
        author: searchFilters?.author,
        tags: searchFilters?.tags,
      });

      if (ragContext.sources.length > 0) {
        console.log(`✅ Found ${ragContext.sources.length} relevant documents for content generation`);
      } else {
        console.log('⚠️  No relevant documents found, generating without RAG');
      }
    }

    // Generate content with LLM
    const body = await this.generateContentWithLLM(brief, ragContext, {
      wordCount: targetWordCount,
      style,
      model: llmOptions?.model,
      temperature: llmOptions?.temperature,
    });

    // Calculate metrics
    const actualWordCount = body.split(/\s+/).length;
    const readingTime = Math.ceil(actualWordCount / 200);

    // Store content in database
    const result = await db.query(
      `INSERT INTO contents (brief_id, title, body, format, word_count, status, reading_time, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [briefId, brief.title, body, 'markdown', actualWordCount, 'draft', readingTime]
    );

    const content = result.rows[0];

    // Store citations if RAG was used
    if (ragContext && ragContext.sources.length > 0) {
      const citationsUsed = extractCitationsFromContent(body, ragContext.sources);

      if (citationsUsed.length > 0) {
        await ragService.storeCitations(
          citationsUsed.map(c => ({
            contentId: content.id,
            docId: c.doc_id,
            citationIndex: c.citation_index,
            snippet: c.snippet,
            relevanceScore: ragContext!.sources.find(s => s.doc_id === c.doc_id)?.similarity || 0,
          }))
        );

        console.log(`📚 Stored ${citationsUsed.length} citations for content ${content.id}`);
      }
    }

    return {
      content,
      rag_context: ragContext
        ? {
            sources: ragContext.sources,
            citations_used: ragContext.sources
              .filter((s, idx) => body.includes(`[${idx + 1}]`))
              .map((s, idx) => ({
                citation_index: idx + 1,
                doc_id: s.doc_id,
                snippet: s.snippet,
                url: s.url,
              })),
          }
        : undefined,
    };
  }

  /**
   * Generate content body using LLM with optional RAG context
   */
  private async generateContentWithLLM(
    brief: any,
    ragContext: any | null,
    options: {
      wordCount: number;
      style: string;
      model?: string;
      temperature?: number;
    }
  ): Promise<string> {
    const { wordCount, style, model, temperature = 0.7 } = options;

    // Style-specific instructions
    const styleInstructions = {
      professional: 'Phong cách chuyên nghiệp (formal, khách quan, dùng thuật ngữ chuyên ngành, tránh khô khan)',
      casual: 'Phong cách thân mật, gần gũi (friendly, conversational, dễ hiểu, có thể dùng ngôn ngữ đời sống)',
      academic: 'Phong cách học thuật nghiêm túc (scholarly, research-oriented, trích dẫn nghiên cứu, phân tích sâu)'
    };

    let prompt = '';

    if (ragContext && ragContext.sources.length > 0) {
      // RAG-enhanced prompt with citations
      prompt = `Viết bài essay chi tiết bằng tiếng Việt dựa trên thông tin được cung cấp.

CHỦ ĐỀ: "${brief.title}"
MỤC TIÊU: ${brief.objective}
ĐỐI TƯỢNG: ${brief.target_audience}

${ragContext.context}

YÊU CẦU QUAN TRỌNG:

1. SỬ DỤNG THÔNG TIN TỪ NGUỒN:
   - Bạn PHẢI sử dụng thông tin từ các nguồn được đánh số [1], [2], [3], v.v. ở trên
   - KHI bạn sử dụng thông tin từ một nguồn, PHẢI gắn trích dẫn [số] vào cuối câu hoặc đoạn văn
   - VÍ DỤ: "Theo nghiên cứu gần đây, AI đang thay đổi cách chúng ta làm việc [1]."
   - KHÔNG bịa đặt thông tin - chỉ dùng những gì có trong nguồn hoặc kiến thức chung

2. Phong cách: ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.professional}

3. Cấu trúc nội dung:
   - MỞ ĐẦU: Hook hấp dẫn + Background + Luận điểm chính
   - THÂN BÀI: 3-4 đoạn văn chính, mỗi đoạn:
     * Luận điểm rõ ràng
     * Dẫn chứng cụ thể TỪ CÁC NGUỒN với trích dẫn [1], [2], [3]
     * Giải thích và phân tích sâu
     * Viết tự nhiên, KHÔNG dùng label như "Statement:", "Evidence:"
   - KẾT LUẬN: Tóm tắt + Hàm ý và triển vọng

4. Định dạng và trình bày:
   - Sử dụng icon/emoji hợp lý (1-3 icon) để làm nổi bật
   - Dùng bullet points (•) hoặc numbering khi liệt kê
   - Có thể dùng heading (##) để phân chia các phần lớn
   - Kết hợp đoạn văn và danh sách tự nhiên

5. Độ dài: ~${wordCount} từ

6. DANH SÁCH NGUỒN THAM KHẢO:
   - Ở cuối bài, thêm phần "## Nguồn tham khảo"
   - Liệt kê các nguồn đã sử dụng theo format:
     [1] Tên nguồn - URL (nếu có)
     [2] Tên nguồn - URL (nếu có)

CHỈ viết essay văn bản markdown với citations, KHÔNG xuất JSON.`;
    } else {
      // Standard prompt without RAG
      prompt = `Viết bài essay bằng tiếng Việt về: "${brief.title}"

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

4. Độ dài: ~${wordCount} từ

5. Sáng tạo: Viết một cách tự nhiên, linh hoạt, không quá cứng nhắc.

CHỈ viết essay văn bản markdown, KHÔNG xuất JSON.`;
    }

    // Try different models with fallback
    const modelsToTry = model ? [model] : [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-pro-latest',
    ];

    let body = '';
    let lastError: any = null;
    let modelUsed = '';

    for (const currentModel of modelsToTry) {
      try {
        console.log(`🔄 Generating content with ${currentModel}...`);

        body = await llmClient.generateCompletion(prompt, {
          provider: AIProvider.GEMINI,
          model: currentModel,
          temperature,
        });

        if (body && body.trim().length > 100) {
          console.log(`✅ Got valid response from ${currentModel}`);
          modelUsed = currentModel;
          break;
        } else {
          throw new Error('Response too short or empty');
        }
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || '';
        console.error(`❌ Model ${currentModel} failed:`, errorMsg);

        if (errorMsg.includes('quota') || errorMsg.includes('429')) {
          console.log(`⚠️ Quota exceeded for ${currentModel}, trying next model...`);
          continue;
        }

        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          console.log(`⚠️ Model ${currentModel} not available, trying next model...`);
          continue;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!body || body.trim().length < 100) {
      const isQuotaIssue = lastError?.message?.includes('quota') || lastError?.message?.includes('429');

      if (isQuotaIssue) {
        throw new Error('Gemini API đã hết quota miễn phí. Vui lòng chờ hoặc nâng cấp API key.');
      }

      throw new Error(`Không thể tạo content: ${lastError?.message || 'Unknown error'}`);
    }

    console.log(`✅ Successfully generated content using ${modelUsed}`);

    // Clean up response
    let cleanedBody = body.trim();

    // Remove JSON artifacts
    if (cleanedBody.startsWith('{') || cleanedBody.startsWith('[')) {
      try {
        const jsonMatch = cleanedBody.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.content) cleanedBody = parsed.content;
          else if (parsed.body) cleanedBody = parsed.body;
        } else {
          const firstParagraphMatch = cleanedBody.match(/(?:^|\n)([A-ZĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ][\s\S]*)/);
          if (firstParagraphMatch) {
            cleanedBody = firstParagraphMatch[1];
          }
        }
      } catch {
        const match = cleanedBody.match(/(?:^|\n)([A-ZĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ][\s\S]*)/);
        if (match) cleanedBody = match[1];
      }
    }

    return cleanedBody;
  }

  /**
   * Get content with citations
   */
  async getContentWithCitations(contentId: number): Promise<any> {
    const content = await db.query('SELECT * FROM contents WHERE id = $1', [contentId]);

    if (content.rows.length === 0) {
      return null;
    }

    const citations = await ragService.getCitationsForContent(contentId);

    return {
      ...content.rows[0],
      citations,
    };
  }
}

// Export singleton instance
export const contentsRAGService = new ContentsRAGService();

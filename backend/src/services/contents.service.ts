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
    const prompt = `Bạn là một chuyên gia viết content chuyên nghiệp. Hãy viết một bài essay HOÀN CHỈNH bằng tiếng Việt về: "${brief.title}"

MỤC TIÊU: ${brief.objective}
ĐỐI TƯỢNG: ${brief.target_audience}

YÊU CẦU:
1. Phong cách: ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.professional}

2. CẤU TRÚC BẮT BUỘC (PHẢI ĐẦY ĐỦ CẢ 3 PHẦN):

   ## MỞ ĐẦU (${Math.floor(targetWordCount * 0.2)}-${Math.floor(targetWordCount * 0.25)} từ)
   - Câu mở đầu hấp dẫn (hook) để thu hút người đọc
   - Giới thiệu bối cảnh, vấn đề cần bàn
   - Nêu rõ luận điểm chính của bài viết
   - Làm người đọc hiểu TẠI SAO chủ đề này quan trọng

   ## THÂN BÀI (${Math.floor(targetWordCount * 0.55)}-${Math.floor(targetWordCount * 0.65)} từ - PHẦN DÀI NHẤT)
   Viết 3-4 đoạn văn chi tiết, mỗi đoạn:
   - Bắt đầu với một luận điểm rõ ràng
   - Cung cấp dẫn chứng cụ thể (số liệu, nghiên cứu, ví dụ thực tế)
   - Phân tích sâu, giải thích tại sao dẫn chứng này hỗ trợ luận điểm
   - Kết nối với luận điểm chính của bài

   LƯU Ý: Viết tự nhiên, KHÔNG dùng label như "Statement:", "Evidence:", "Explanation:"
   ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT - cần viết dài, chi tiết và phong phú

   ## KẾT LUẬN (${Math.floor(targetWordCount * 0.15)}-${Math.floor(targetWordCount * 0.2)} từ)
   - Tóm tắt các điểm chính đã trình bày ở THÂN BÀI
   - Nhấn mạnh lại luận điểm chính
   - Đưa ra hàm ý, ý nghĩa thực tiễn
   - Triển vọng tương lai hoặc lời kêu gọi hành động

3. Định dạng và trình bày:
   - BẮT BUỘC phải có đủ 3 phần với đúng tỷ lệ độ dài
   - Sử dụng icon/emoji hợp lý (1-2 icon mỗi phần) để làm nổi bật
   - Dùng bullet points (•) hoặc numbering (1., 2., 3.) khi liệt kê
   - Kết hợp đoạn văn và danh sách một cách tự nhiên
   - QUAN TRỌNG: Tránh sử dụng quá nhiều dấu ngoặc kép ("). Chỉ dùng khi thực sự cần thiết

4. Độ dài tổng: ~${targetWordCount} từ
   - MỞ ĐẦU: ~${Math.floor(targetWordCount * 0.2)} từ (20%)
   - THÂN BÀI: ~${Math.floor(targetWordCount * 0.6)} từ (60% - PHẦN DÀI NHẤT)
   - KẾT LUẬN: ~${Math.floor(targetWordCount * 0.2)} từ (20%)

5. LƯU Ý QUAN TRỌNG:
   - PHẢI viết đầy đủ cả 3 phần, KHÔNG ĐƯỢC bỏ sót phần nào
   - THÂN BÀI phải chiếm 60% tổng số từ (dài nhất)
   - Mỗi phần phải có nội dung đầy đủ, không viết sơ sài
   - Viết tự nhiên, mạch lạc, logic rõ ràng
   - KHÔNG xuất JSON, CHỈ viết essay văn bản markdown thuần túy

HÃY BẮT ĐẦU VIẾT NGAY BÂY GIỜ, ĐẢM BẢO ĐẦY ĐỦ CẢ 3 PHẦN:`;

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

    // Clean up excessive quotation marks
    cleanedBody = this.cleanQuotationMarks(cleanedBody);

    // Validate and normalize content structure
    cleanedBody = this.validateAndNormalizeContent(cleanedBody);

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
   * Clean and update all existing contents in database
   * Removes excessive quotes, normalizes markdown, fixes formatting
   */
  async cleanAllContents(): Promise<{ updated: number; contents: Content[] }> {
    console.log('🧹 Starting cleanup of all existing contents...');
    
    // Get all contents
    const allContents = await this.getAllContents();
    const updatedContents: Content[] = [];
    
    for (const content of allContents) {
      let cleanedBody = content.body;
      
      // Apply cleaning functions
      cleanedBody = this.cleanQuotationMarks(cleanedBody);
      cleanedBody = this.validateAndNormalizeContent(cleanedBody);
      
      // Only update if content changed
      if (cleanedBody !== content.body) {
        const wordCount = cleanedBody.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);
        
        const result = await db.query(
          `UPDATE contents 
           SET body = $1, word_count = $2, reading_time = $3, updated_at = NOW() 
           WHERE id = $4 
           RETURNING *`,
          [cleanedBody, wordCount, readingTime, content.id]
        );
        
        if (result.rows[0]) {
          updatedContents.push(result.rows[0]);
          console.log(`✅ Updated content #${content.id}: ${content.title}`);
        }
      } else {
        console.log(`⏭️ Content #${content.id} already clean, skipping`);
      }
    }
    
    console.log(`🎉 Cleanup complete! Updated ${updatedContents.length} of ${allContents.length} contents`);
    
    return {
      updated: updatedContents.length,
      contents: updatedContents
    };
  }

  /**
   * Clean up excessive quotation marks in content
   */
  cleanQuotationMarks(text: string): string {
    // Remove unnecessary quotation marks around common phrases
    // Keep only when they're actually needed (direct quotes, titles, etc.)
    
    // Replace multiple consecutive quotes with single ones
    text = text.replace(/""+/g, '"');
    text = text.replace(/''+/g, "'");
    
    // Remove quotes around single words that aren't titles or quotes
    // Pattern: "word" -> word (but keep if it's a title or proper noun)
    text = text.replace(/"([^"]{1,20})"/g, (match, content) => {
      // Keep quotes if it's a title, proper noun, or technical term
      if (
        content.match(/^[A-ZĐÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]/) ||
        content.includes(' ') ||
        content.length > 15
      ) {
        return match; // Keep the quotes
      }
      // Remove quotes for simple words
      return content;
    });
    
    // Remove quotes that are used for emphasis (not actual quotes)
    // Pattern: "word" at the end of sentences or in lists
    text = text.replace(/([^"])\s+"([^"]{1,30})"\s+([,\.;:])/g, '$1 $2$3');
    
    return text;
  }

  /**
   * Validate and normalize content structure
   * - Ensure proper section headers (MỞ ĐẦU, THÂN BÀI, KẾT LUẬN)
   * - Normalize numbering and bullet points
   */
  validateAndNormalizeContent(text: string): string {
    // Normalize section headers
    text = text.replace(/^###\s*MỞ\s*ĐẦU/gi, 'MỞ ĐẦU');
    text = text.replace(/^##\s*MỞ\s*ĐẦU/gi, 'MỞ ĐẦU');
    text = text.replace(/^###\s*THÂN\s*BÀI/gi, 'THÂN BÀI');
    text = text.replace(/^##\s*THÂN\s*BÀI/gi, 'THÂN BÀI');
    text = text.replace(/^###\s*KẾT\s*LUẬN/gi, 'KẾT LUẬN');
    text = text.replace(/^##\s*KẾT\s*LUẬN/gi, 'KẾT LUẬN');

    // Normalize numbering patterns
    // Fix inconsistent numbering: 1. 2. 3. or 1) 2) 3) -> 1. 2. 3.
    text = text.replace(/^(\d+)\)\s+/gm, '$1. ');
    
    // Normalize bullet points: -, *, • -> •
    text = text.replace(/^[-*]\s+/gm, '• ');
    
    // Fix spacing after bullets and numbers
    text = text.replace(/^(•|\d+\.)\s{0,1}([^\s])/gm, '$1 $2');
    
    // Ensure proper line breaks before sections
    text = text.replace(/([^\n])(MỞ ĐẦU|THÂN BÀI|KẾT LUẬN)/gi, '$1\n\n$2');
    
    return text.trim();
  }
}

export const contentsService = new ContentsService();

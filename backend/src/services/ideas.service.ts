import { db } from '../lib/db.js';
import { llmClient, AIProvider } from '../lib/llmClient.js';
import { validateGeneratedIdeas } from '../schema/ideaGenerate.schema.js';
import { randomUUID } from 'crypto';

/**
 * Interface cho Idea entity
 */
export interface Idea {
  id: number;
  title: string;
  description: string;
  persona: string;
  industry: string;
  status: 'generated' | 'shortlisted' | 'approved' | 'archived';
  rationale: string | null;
  batch_id: string | null;
  created_at: Date;
}

/**
 * IdeasService - Chứa toàn bộ business logic cho ideas
 * AI-only flow: chỉ generate ideas từ AI, không có manual create/update
 */
export class IdeasService {
  /**
   * Lấy tất cả ideas
   */
  async getAllIdeas(): Promise<Idea[]> {
    const result = await db.query(
      'SELECT * FROM ideas ORDER BY created_at DESC LIMIT 1000'
    );

    // Parse implementation strings to objects
    return result.rows.map(idea => {
      if (idea.implementation && typeof idea.implementation === 'string') {
        try {
          idea.implementation = JSON.parse(idea.implementation);
        } catch (e) {
          console.error(`Failed to parse implementation for idea ${idea.id}:`, e);
        }
      }
      return idea;
    });
  }

  /**
   * Lấy idea theo ID
   */
  async getIdeaById(id: number): Promise<Idea | null> {
    const result = await db.query('SELECT * FROM ideas WHERE id = $1', [id]);
    const idea = result.rows[0];

    // Parse implementation string to object
    if (idea && idea.implementation && typeof idea.implementation === 'string') {
      try {
        idea.implementation = JSON.parse(idea.implementation);
      } catch (e) {
        console.error(`Failed to parse implementation for idea ${id}:`, e);
      }
    }

    return idea || null;
  }

  /**
   * Xóa idea
   */
  async deleteIdea(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM ideas WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Xóa nhiều ideas cùng lúc
   */
  async deleteManyIdeas(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await db.query(
      'DELETE FROM ideas WHERE id = ANY($1::int[])',
      [ids]
    );
    return result.rowCount ?? 0;
  }

  /**
   * Cập nhật status của idea
   * @param id - ID của idea
   * @param status - Status mới: 'shortlisted' | 'approved' | 'archived'
   * @returns Updated idea hoặc null nếu không tìm thấy
   */
  async updateStatus(
    id: number,
    status: 'shortlisted' | 'approved' | 'archived'
  ): Promise<Idea | null> {
    const result = await db.query(
      `UPDATE ideas 
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Helper function để delay (exponential backoff)
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sanitize JSON string - remove control characters and fix common issues
   */
  private sanitizeJsonString(jsonStr: string): string {
    // Remove control characters except newlines, tabs
    let sanitized = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Fix common Vietnamese character issues - remove incomplete UTF-8 sequences
    // This regex finds potential truncated Vietnamese characters at the start of strings
    sanitized = sanitized.replace(/"[\u0300-\u036F]+/g, '"');

    return sanitized;
  }

  /**
   * Extract JSON array từ response text
   * Tìm từ '[' đầu tiên đến ']' cuối cùng
   */
  private extractJsonArray(responseText: string): string {
    const startIdx = responseText.indexOf('[');
    const lastIdx = responseText.lastIndexOf(']');

    if (startIdx === -1 || lastIdx === -1 || lastIdx <= startIdx) {
      throw new Error('No valid JSON array found in response');
    }

    return responseText.substring(startIdx, lastIdx + 1);
  }

  /**
   * Generate ideas bằng AI với retry logic
   * @param persona - Đối tượng mục tiêu
   * @param industry - Ngành nghề
   * @param count - Số lượng ideas cần generate (default: 10)
   * @param provider - AI provider (openai hoặc gemini)
   * @param model - Model name
   * @param language - Ngôn ngữ (vi, en, ja, ko)
   * @returns Danh sách ideas đã lưu vào database
   */
  async generateIdeas(
    persona: string,
    industry: string,
    count?: number,
    provider?: string,
    model?: string,
    language?: string
  ): Promise<Idea[]> {
    // Tạo batch_id cho lần generate này
    const batchId = randomUUID();

    // Xác định số lượng ideas - PHẢI dùng số được truyền vào, chỉ default 5 nếu undefined
    // FIX: Sử dụng nullish coalescing (??) thay vì || để chỉ fallback khi null/undefined
    const ideaCount = count ?? 5;
    console.log(`📊 Service received count: ${count}, using ideaCount: ${ideaCount}`);

    // Xác định ngôn ngữ
    const lang = language || 'vi';
    const languageMap: Record<string, string> = {
      vi: 'Vietnamese',
      en: 'English',
      ja: 'Japanese',
      ko: 'Korean',
    };
    const languageName = languageMap[lang] || 'Vietnamese';

    // System prompt: yêu cầu JSON-only
    const systemPrompt = `You are a content idea generator. Always respond with valid JSON array only. No markdown, no code blocks, no explanations. Each object must have exactly: title (string), description (string), rationale (string). Generate content in ${languageName}.`;

    // User prompt: generate ideas với số lượng động
    const userPrompt = `Generate ${ideaCount} creative content ideas for a ${persona} in ${industry}. Return as JSON array with objects containing: title, description, rationale. All content must be in ${languageName}.`;

    // Debug log
    console.log(`📝 AI Prompt will request ${ideaCount} ideas`);

    // Gộp system prompt vào đầu user prompt
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    let lastError: Error | null = null;
    const maxRetries = 2; // Giảm retry cho mỗi provider

    // Thử Gemini 1.5 Flash (free) trước, nếu fail thì fallback sang OpenAI
    const providers = [
      { provider: AIProvider.GEMINI, model: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash (Free)' },
      { provider: AIProvider.OPENAI, model: 'gpt-4o-mini', name: 'OpenAI GPT-4o-mini' }
    ];

    // Try each provider
    for (const { provider: aiProvider, model: aiModel, name: providerName } of providers) {
      // Retry với exponential backoff cho mỗi provider
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🤖 Trying ${providerName} - attempt ${attempt}/${maxRetries} (batch: ${batchId})`);

          // Gọi LLM với full prompt
          const responseText = await llmClient.generateCompletion(
            fullPrompt,
            {
              provider: aiProvider,
              model: aiModel,
              temperature: 0.7,
            }
          );

        // Extract JSON array từ response (từ '[' đến ']')
        const jsonArrayStr = this.extractJsonArray(responseText);

        // Parse JSON
        let parsedData: unknown;
        try {
          parsedData = JSON.parse(jsonArrayStr);
        } catch (parseError) {
          throw new Error(
            `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
          );
        }

        // Validate với AJV schema
        const validation = validateGeneratedIdeas(parsedData);

        if (!validation.valid) {
          throw new Error(`Invalid AI response format: ${validation.errors}`);
        }

        // Insert tất cả ideas vào database trong một transaction
        const savedIdeas: Idea[] = [];

        for (const item of validation.data!) {
          const result = await db.query(
            `INSERT INTO ideas (title, description, persona, industry, status, rationale, batch_id, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             RETURNING *`,
            [
              item.title,
              item.description,
              persona,
              industry,
              'generated', // Status mặc định cho AI-generated ideas
              item.rationale,
              batchId,
            ]
          );
          savedIdeas.push(result.rows[0]);
        }

        console.log(
          `✅ Successfully generated and saved ${savedIdeas.length} ideas with ${providerName} (batch: ${batchId})`
        );
        return savedIdeas;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ ${providerName} attempt ${attempt} failed:`, lastError.message);

        // Exponential backoff: 1s, 2s
        if (attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Waiting ${delayMs}ms before retry...`);
          await this.delay(delayMs);
        }
      }
    }

      // Nếu provider này fail hết retry, log và thử provider tiếp theo
      console.log(`⚠️ ${providerName} failed after ${maxRetries} attempts, trying next provider...`);
    }

    // Tất cả providers đều fail
    throw new Error(
      `Failed to generate ideas after trying all providers: ${lastError?.message}`
    );
  }

  /**
   * Generate detailed implementation plan for an idea
   * @param ideaId - ID của idea
   * @returns Idea với implementation plan
   */
  async generateImplementation(ideaId: number): Promise<Idea | null> {
    // Get idea
    const idea = await this.getIdeaById(ideaId);
    if (!idea) {
      throw new Error('Idea not found');
    }

    // Simplified prompt - shorter responses = less errors - VIETNAMESE
    const systemPrompt = `Bạn là chuyên gia lập kế hoạch. Trả về JSON hợp lệ. Không dùng markdown. Không giải thích. QUAN TRỌNG: Tất cả nội dung PHẢI viết bằng TIẾNG VIỆT CÓ DẤU.`;

    const userPrompt = `Tạo kế hoạch thực hiện cho ý tưởng: "${idea.title}"

Trả về JSON theo cấu trúc này:
{
  "steps": [
    {"phase": "Giai đoạn 1", "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2"], "resources": ["Nguồn lực 1"], "duration": "4 tuần"}
  ],
  "feasibility": {
    "score": 8,
    "risks": ["Rủi ro 1", "Rủi ro 2"],
    "mitigations": ["Giải pháp 1", "Giải pháp 2"]
  }
}

Yêu cầu:
- 3-4 bước thực hiện (steps)
- Mỗi bước: tên giai đoạn, các nhiệm vụ, nguồn lực cần thiết, thời gian
- Điểm khả thi: 1-10
- 2-3 rủi ro và giải pháp
- TẤT CẢ bằng tiếng Việt CÓ DẤU, nội dung ngắn gọn, đơn giản`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    let lastError: Error | null = null;
    const maxRetries = 3; // Try 3 times for better reliability

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📋 Generating implementation plan for idea ${ideaId} (attempt ${attempt}/${maxRetries})`);

      const responseText = await llmClient.generateCompletion(
        fullPrompt,
        {
          provider: AIProvider.GEMINI,
          model: 'gemini-flash-latest',
          temperature: 0.5, // Lower temperature for more structured output
        }
      );

      // Debug: Log raw response
      console.log(`🔍 Raw AI response length: ${responseText.length} chars`);
      console.log(`🔍 First 500 chars: ${responseText.substring(0, 500)}`);
      console.log(`🔍 Last 500 chars: ${responseText.substring(Math.max(0, responseText.length - 500))}`);

      // Extract JSON - remove markdown code blocks if present
      let cleanedText = responseText.trim();

      // Remove markdown code blocks
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '');
      }

      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error(`❌ No JSON braces found in response`);
        throw new Error('No valid JSON found in response');
      }

      let jsonStr = cleanedText.substring(jsonStart, jsonEnd + 1);
      console.log(`🔍 Extracted JSON length: ${jsonStr.length} chars`);
      console.log(`🔍 JSON preview: ${jsonStr.substring(0, 200)}...`);

      // Sanitize JSON string
      jsonStr = this.sanitizeJsonString(jsonStr);
      console.log(`🔍 After sanitization length: ${jsonStr.length} chars`);

        let implementation;
        try {
          implementation = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error(`❌ JSON parse error: ${parseError instanceof Error ? parseError.message : 'unknown'}`);
          console.error(`❌ Problematic JSON snippet: ${jsonStr.substring(Math.max(0, 2200), Math.min(jsonStr.length, 2400))}`);
          throw parseError;
        }

        // Validate structure
        if (!implementation.steps || !Array.isArray(implementation.steps)) {
          throw new Error('Invalid implementation structure: missing or invalid steps array');
        }
        if (!implementation.feasibility || typeof implementation.feasibility.score !== 'number') {
          throw new Error('Invalid implementation structure: missing or invalid feasibility');
        }

        // Update database
        const result = await db.query(
          `UPDATE ideas
           SET implementation = $1
           WHERE id = $2
           RETURNING *`,
          [JSON.stringify(implementation), ideaId]
        );

        console.log(`✅ Implementation plan generated for idea ${ideaId}`);

        // Parse implementation string back to object for response
        const idea = result.rows[0];
        if (idea && idea.implementation && typeof idea.implementation === 'string') {
          try {
            idea.implementation = JSON.parse(idea.implementation);
          } catch (e) {
            console.error('Failed to parse implementation:', e);
          }
        }

        return idea || null;

      } catch (error) {
        lastError = error as Error;
        const errorMsg = lastError.message;
        console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, errorMsg);

        // If not last attempt, wait before retry with exponential backoff
        if (attempt < maxRetries) {
          // Exponential backoff: 2s, 4s, 8s
          const delayMs = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retrying in ${delayMs / 1000}s (exponential backoff)...`);
          await this.delay(delayMs);
        }
      }
    }

    // All attempts failed
    const errorMsg = lastError?.message || 'Unknown error';
    console.error(`❌ All ${maxRetries} attempts failed. Last error: ${errorMsg}`);
    throw new Error(`Failed to generate implementation after ${maxRetries} attempts: ${errorMsg}`);
  }
}

// Export singleton instance
export const ideasService = new IdeasService();

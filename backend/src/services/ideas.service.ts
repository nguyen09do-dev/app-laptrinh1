import { db } from '../lib/db.js';
import { llmClient, AIProvider } from '../lib/llmClient.js';
import { validateGeneratedIdeas, IdeaItem } from '../schema/ideaGenerate.schema.js';
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
      'SELECT * FROM ideas ORDER BY created_at DESC'
    );
    return result.rows;
  }

  /**
   * Lấy idea theo ID
   */
  async getIdeaById(id: number): Promise<Idea | null> {
    const result = await db.query('SELECT * FROM ideas WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Xóa idea
   */
  async deleteIdea(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM ideas WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
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
   * @param provider - AI provider (openai hoặc gemini)
   * @param model - Model name
   * @param language - Ngôn ngữ (vi, en, ja, ko)
   * @returns Danh sách ideas đã lưu vào database
   */
  async generateIdeas(
    persona: string,
    industry: string,
    provider?: string,
    model?: string,
    language?: string
  ): Promise<Idea[]> {
    // Tạo batch_id cho lần generate này
    const batchId = randomUUID();

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

    // User prompt: generate 10 ideas
    const userPrompt = `Generate 10 creative content ideas for a ${persona} in ${industry}. Return as JSON array with objects containing: title, description, rationale. All content must be in ${languageName}.`;

    // Gộp system prompt vào đầu user prompt
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    let lastError: Error | null = null;
    const maxRetries = 3;

    // Luôn sử dụng Gemini Flash Latest (nhanh, ổn định và miễn phí)
    const aiProvider = AIProvider.GEMINI;
    const aiModel = 'gemini-flash-latest';

    // Retry với exponential backoff
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 AI Generation attempt ${attempt}/${maxRetries} (batch: ${batchId})`);

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
          `✅ Successfully generated and saved ${savedIdeas.length} ideas (batch: ${batchId})`
        );
        return savedIdeas;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Attempt ${attempt} failed:`, lastError.message);

        // Exponential backoff: 1s, 2s, 4s
        if (attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Waiting ${delayMs}ms before retry...`);
          await this.delay(delayMs);
        }
      }
    }

    // Sau 3 lần retry vẫn fail
    throw new Error(
      `Failed to generate ideas after ${maxRetries} attempts: ${lastError?.message}`
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
    const systemPrompt = `Ban la chuyen gia lap ke hoach. Tra ve JSON hop le. Khong dung markdown. Khong giai thich. QUAN TRONG: Tat ca noi dung PHAI viet bang TIENG VIET.`;

    const userPrompt = `Tao ke hoach thuc hien cho y tuong: "${idea.title}"

Tra ve JSON theo cau truc nay:
{
  "steps": [
    {"phase": "Giai doan 1", "tasks": ["Nhiem vu 1", "Nhiem vu 2"], "resources": ["Nguon luc 1"], "duration": "4 tuan"}
  ],
  "feasibility": {
    "score": 8,
    "risks": ["Rui ro 1", "Rui ro 2"],
    "mitigations": ["Giai phap 1", "Giai phap 2"]
  }
}

Yeu cau:
- 3-4 buoc thuc hien (steps)
- Moi buoc: ten giai doan, cac nhiem vu, nguon luc can thiet, thoi gian
- Diem kha thi: 1-10
- 2-3 rui ro va giai phap
- TAT CA bang tieng Viet, noi dung ngan gon, don gian`;

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
        return result.rows[0] || null;

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

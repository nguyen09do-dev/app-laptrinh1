import { db } from '../lib/db.js';

/**
 * Brief entity interface
 */
export interface Brief {
  id: number;
  idea_id: number;
  title: string;
  objective: string;
  target_audience: string;
  key_messages: string[];
  tone_style: string | null;
  content_structure: any;
  seo_keywords: string[];
  status: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * BriefsService - Business logic cho briefs
 * Convert approved ideas thành content briefs
 */
export class BriefsService {
  /**
   * Safely parse JSON with fallback
   */
  private safeJsonParse(value: any, fallback: any = null): any {
    if (value === null || value === undefined) return fallback;
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn('Failed to parse JSON:', value?.substring?.(0, 100));
      return fallback;
    }
  }

  /**
   * Parse brief data from database
   */
  private parseBrief(row: any): Brief {
    return {
      ...row,
      key_messages: this.safeJsonParse(row.key_messages, []),
      seo_keywords: this.safeJsonParse(row.seo_keywords, []),
      content_structure: this.safeJsonParse(row.content_structure, {})
    };
  }

  /**
   * Get all briefs
   */
  async getAllBriefs(): Promise<Brief[]> {
    const result = await db.query(`
      SELECT b.*,
             i.title as idea_title,
             i.persona,
             i.industry
      FROM briefs b
      JOIN ideas i ON b.idea_id = i.id
      ORDER BY b.created_at DESC
    `);
    return result.rows.map(row => this.parseBrief(row));
  }

  /**
   * Get brief by ID
   */
  async getBriefById(id: number): Promise<Brief | null> {
    const result = await db.query('SELECT * FROM briefs WHERE id = $1', [id]);
    return result.rows[0] ? this.parseBrief(result.rows[0]) : null;
  }

  /**
   * Get brief by idea ID
   */
  async getBriefByIdeaId(ideaId: number): Promise<Brief | null> {
    const result = await db.query('SELECT * FROM briefs WHERE idea_id = $1', [ideaId]);
    return result.rows[0] || null;
  }

  /**
   * Create brief from approved idea
   * Simple template-based approach - no AI
   */
  async createBriefFromIdea(ideaId: number): Promise<Brief> {
    // Get the idea
    const ideaResult = await db.query('SELECT * FROM ideas WHERE id = $1', [ideaId]);
    const idea = ideaResult.rows[0];

    if (!idea) {
      throw new Error('Idea not found');
    }

    // Check if idea is approved
    if (idea.status !== 'approved') {
      throw new Error('Only approved ideas can be converted to briefs');
    }

    // Check if brief already exists for this idea
    const existingBrief = await this.getBriefByIdeaId(ideaId);
    if (existingBrief) {
      throw new Error('Brief already exists for this idea');
    }

    // Create brief using template
    const brief = {
      idea_id: ideaId,
      title: idea.title,
      objective: `Tạo nội dung về "${idea.title}" nhằm ${idea.description}`,
      target_audience: `${idea.persona} trong lĩnh vực ${idea.industry}`,
      key_messages: [
        `Thông điệp chính 1: Giới thiệu về ${idea.title}`,
        `Thông điệp chính 2: Lợi ích và giá trị cho ${idea.persona}`,
        `Thông điệp chính 3: Kêu gọi hành động`
      ],
      tone_style: 'Chuyên nghiệp, dễ hiểu, thân thiện',
      content_structure: {
        sections: [
          { name: 'Mở đầu', wordCount: 100, description: 'Giới thiệu chủ đề và thu hút sự chú ý' },
          { name: 'Nội dung chính', wordCount: 400, description: 'Triển khai ý tưởng chi tiết' },
          { name: 'Kết luận', wordCount: 100, description: 'Tổng kết và kêu gọi hành động' }
        ],
        totalWordCount: 600
      },
      seo_keywords: this.generateSeoKeywords(idea.title, idea.industry),
      status: 'draft'
    };

    // Insert into database
    const result = await db.query(
      `INSERT INTO briefs
       (idea_id, title, objective, target_audience, key_messages, tone_style, content_structure, seo_keywords, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        brief.idea_id,
        brief.title,
        brief.objective,
        brief.target_audience,
        brief.key_messages,
        brief.tone_style,
        JSON.stringify(brief.content_structure),
        brief.seo_keywords,
        brief.status
      ]
    );

    console.log(`✅ Created brief for idea ${ideaId}`);
    return result.rows[0];
  }

  /**
   * Generate SEO keywords from title and industry
   */
  private generateSeoKeywords(title: string, industry: string): string[] {
    const keywords: string[] = [];

    // Add title words (remove common words)
    const titleWords = title.split(' ').filter(word =>
      word.length > 3 && !['của', 'cho', 'trong', 'với', 'và', 'the', 'for', 'with', 'and'].includes(word.toLowerCase())
    );
    keywords.push(...titleWords);

    // Add industry
    keywords.push(industry);

    // Add common variations
    keywords.push(`${industry} ${titleWords[0] || ''}`);

    return keywords.slice(0, 5); // Limit to 5 keywords
  }

  /**
   * Delete brief
   */
  async deleteBrief(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM briefs WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete many briefs
   */
  async deleteManyBriefs(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await db.query(
      'DELETE FROM briefs WHERE id = ANY($1::int[])',
      [ids]
    );
    return result.rowCount ?? 0;
  }
}

// Export singleton instance
export const briefsService = new BriefsService();

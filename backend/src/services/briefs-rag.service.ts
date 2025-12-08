import { db } from '../lib/db.js';
import { ragService } from './rag.service.js';
import { llmClient } from '../lib/llmClient.js';
import { extractCitationsFromContent } from '../middleware/citationValidator.js';

/**
 * BriefsRAGService
 * Enhanced brief generation with RAG (Retrieval Augmented Generation)
 * Generates briefs using knowledge base context
 */

interface GenerateBriefWithRAGOptions {
  ideaId: number;
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

interface BriefWithRAG {
  brief: any;
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

export class BriefsRAGService {
  /**
   * Generate brief from idea with RAG enhancement
   * Searches knowledge base for relevant context before generating
   */
  async generateBriefWithRAG(
    options: GenerateBriefWithRAGOptions
  ): Promise<BriefWithRAG> {
    const { ideaId, useRAG = true, searchFilters, llmOptions } = options;

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
    const existingBrief = await db.query(
      'SELECT * FROM briefs WHERE idea_id = $1',
      [ideaId]
    );

    if (existingBrief.rows.length > 0) {
      throw new Error('Brief already exists for this idea');
    }

    let ragContext = null;
    let briefContent: any;

    if (useRAG) {
      // Build search query from idea
      const searchQuery = `${idea.title}. ${idea.description}. ${idea.industry} for ${idea.persona}`;

      console.log(`🔍 Searching knowledge base for: "${searchQuery}"`);

      // Get RAG context
      ragContext = await ragService.buildContext(searchQuery, {
        match_threshold: searchFilters?.match_threshold || 0.7,
        match_count: searchFilters?.match_count || 5,
        author: searchFilters?.author,
        tags: searchFilters?.tags,
      });

      if (ragContext.sources.length > 0) {
        console.log(`✅ Found ${ragContext.sources.length} relevant documents`);

        // Generate brief with RAG context
        briefContent = await this.generateBriefWithLLM(idea, ragContext, llmOptions);
      } else {
        console.log('⚠️  No relevant documents found, generating without RAG');
        briefContent = await this.generateBriefWithLLM(idea, null, llmOptions);
      }
    } else {
      // Generate without RAG
      briefContent = await this.generateBriefWithLLM(idea, null, llmOptions);
    }

    // Store brief in database
    const result = await db.query(
      `INSERT INTO briefs
       (idea_id, title, objective, target_audience, key_messages, tone_style, content_structure, seo_keywords, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        ideaId,
        briefContent.title,
        briefContent.objective,
        briefContent.target_audience,
        briefContent.key_messages,
        briefContent.tone_style,
        JSON.stringify(briefContent.content_structure),
        briefContent.seo_keywords,
        'draft',
      ]
    );

    const brief = result.rows[0];

    // Store citations if RAG was used
    if (ragContext && ragContext.sources.length > 0) {
      // Extract citations from generated content
      const objectiveText = briefContent.objective || '';
      const citationsUsed = extractCitationsFromContent(objectiveText, ragContext.sources);

      if (citationsUsed.length > 0) {
        await ragService.storeCitations(
          citationsUsed.map(c => ({
            briefId: brief.id,
            docId: c.doc_id,
            citationIndex: c.citation_index,
            snippet: c.snippet,
            relevanceScore: ragContext!.sources.find(s => s.doc_id === c.doc_id)?.similarity || 0,
          }))
        );

        console.log(`📚 Stored ${citationsUsed.length} citations for brief ${brief.id}`);
      }
    }

    return {
      brief,
      rag_context: ragContext
        ? {
            sources: ragContext.sources,
            citations_used: ragContext.sources.map((s, idx) => ({
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
   * Generate brief content using LLM with optional RAG context
   */
  private async generateBriefWithLLM(
    idea: any,
    ragContext: any | null,
    llmOptions?: { model?: string; temperature?: number }
  ): Promise<any> {
    let prompt = '';

    if (ragContext && ragContext.sources.length > 0) {
      // RAG-enhanced prompt
      prompt = `You are a professional content strategist creating a detailed content brief.

IDEA INFORMATION:
- Title: ${idea.title}
- Description: ${idea.description}
- Target Persona: ${idea.persona}
- Industry: ${idea.industry}
${idea.rationale ? `- Rationale: ${idea.rationale}` : ''}

${ragContext.context}

INSTRUCTIONS:
1. Use the relevant information from the knowledge base (marked with [1], [2], [3], etc.) to create a comprehensive content brief
2. Include citations [1], [2], [3] where you use information from the sources
3. DO NOT make up information - only use what's provided in the context or general knowledge
4. If the knowledge base doesn't have relevant information for a section, indicate that research is needed

Create a detailed content brief with the following structure as JSON:

{
  "title": "Brief title (same as idea title)",
  "objective": "Clear objective statement with citations where applicable [1][2]",
  "target_audience": "Detailed target audience description based on persona and industry",
  "key_messages": ["Message 1 [citation if applicable]", "Message 2", "Message 3"],
  "tone_style": "Appropriate tone and style for the audience",
  "content_structure": {
    "sections": [
      {"name": "Section name", "wordCount": 150, "description": "What this section covers"},
      ...
    ],
    "totalWordCount": 800
  },
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Return ONLY valid JSON, no markdown formatting.`;
    } else {
      // Standard prompt without RAG
      prompt = `You are a professional content strategist creating a detailed content brief.

IDEA INFORMATION:
- Title: ${idea.title}
- Description: ${idea.description}
- Target Persona: ${idea.persona}
- Industry: ${idea.industry}
${idea.rationale ? `- Rationale: ${idea.rationale}` : ''}

Create a detailed content brief with the following structure as JSON:

{
  "title": "Brief title (same as idea title)",
  "objective": "Clear objective statement",
  "target_audience": "Detailed target audience description based on persona and industry",
  "key_messages": ["Message 1", "Message 2", "Message 3"],
  "tone_style": "Appropriate tone and style for the audience",
  "content_structure": {
    "sections": [
      {"name": "Section name", "wordCount": 150, "description": "What this section covers"},
      ...
    ],
    "totalWordCount": 800
  },
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Return ONLY valid JSON, no markdown formatting.`;
    }

    // Call LLM
    const model = llmOptions?.model || 'gemini-1.5-flash-latest';
    const temperature = llmOptions?.temperature || 0.7;

    console.log(`🤖 Generating brief with ${model}...`);

    const response = await llmClient.generateCompletion(prompt, {
      model,
      temperature,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse LLM response as JSON');
    }

    const briefData = JSON.parse(jsonMatch[0]);

    return briefData;
  }

  /**
   * Get brief with citations
   */
  async getBriefWithCitations(briefId: number): Promise<any> {
    const brief = await db.query('SELECT * FROM briefs WHERE id = $1', [briefId]);

    if (brief.rows.length === 0) {
      return null;
    }

    const citations = await ragService.getCitationsForBrief(briefId);

    return {
      ...brief.rows[0],
      citations,
    };
  }

  /**
   * Regenerate brief with different RAG parameters
   */
  async regenerateBriefWithRAG(
    briefId: number,
    options: {
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
  ): Promise<BriefWithRAG> {
    // Get existing brief to find idea_id
    const briefResult = await db.query('SELECT idea_id FROM briefs WHERE id = $1', [briefId]);

    if (briefResult.rows.length === 0) {
      throw new Error('Brief not found');
    }

    const ideaId = briefResult.rows[0].idea_id;

    // Delete old brief
    await db.query('DELETE FROM briefs WHERE id = $1', [briefId]);

    // Generate new brief with RAG
    return this.generateBriefWithRAG({
      ideaId,
      useRAG: true,
      searchFilters: options.searchFilters,
      llmOptions: options.llmOptions,
    });
  }
}

// Export singleton instance
export const briefsRAGService = new BriefsRAGService();

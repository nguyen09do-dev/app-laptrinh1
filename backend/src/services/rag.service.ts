import { db } from '../lib/db.js';
import { embeddingService } from './embedding.service.js';

/**
 * RAGService
 * Retrieval Augmented Generation service
 * Handles semantic search, context building, and citation management
 */

interface SearchResult {
  doc_id: string;
  chunk_id?: string;
  title: string;
  content: string;
  url?: string;
  author?: string;
  tags?: string[];
  similarity: number;
  chunk_index?: number;
}

interface RAGContext {
  context: string;
  sources: Array<{
    index: number;
    doc_id: string;
    chunk_id?: string;
    title: string;
    snippet: string;
    url?: string;
    similarity: number;
  }>;
}

interface SearchFilters {
  author?: string;
  tags?: string[];
  match_threshold?: number;
  match_count?: number;
}

export class RAGService {
  /**
   * Search documents by semantic similarity
   * Uses full document embeddings
   */
  async searchDocuments(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Call PostgreSQL function for similarity search
    const matchThreshold = filters?.match_threshold || 0.7;
    const matchCount = filters?.match_count || 5;

    const result = await db.query(
      'SELECT * FROM search_documents($1::vector, $2, $3, $4, $5)',
      [
        JSON.stringify(queryEmbedding),
        matchThreshold,
        matchCount,
        filters?.author || null,
        filters?.tags || null,
      ]
    );

    return result.rows.map(row => ({
      doc_id: row.doc_id,
      title: row.title,
      content: row.content,
      url: row.url,
      author: row.author,
      tags: row.tags,
      similarity: parseFloat(row.similarity),
      published_date: row.published_date,
    }));
  }

  /**
   * Search document chunks by semantic similarity
   * More granular than document search - better for specific information
   */
  async searchChunks(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Call PostgreSQL function for chunk similarity search
    const matchThreshold = filters?.match_threshold || 0.7;
    const matchCount = filters?.match_count || 10;

    const result = await db.query(
      'SELECT * FROM search_document_chunks($1::vector, $2, $3, $4, $5)',
      [
        JSON.stringify(queryEmbedding),
        matchThreshold,
        matchCount,
        filters?.author || null,
        filters?.tags || null,
      ]
    );

    return result.rows.map(row => ({
      chunk_id: row.chunk_id,
      doc_id: row.doc_id,
      title: row.title,
      content: row.chunk_text,
      chunk_index: row.chunk_index,
      url: row.url,
      author: row.author,
      tags: row.tags,
      similarity: parseFloat(row.similarity),
    }));
  }

  /**
   * Build RAG context for LLM prompt
   * Retrieves relevant chunks and formats them with citations
   */
  async buildContext(
    query: string,
    filters?: SearchFilters
  ): Promise<RAGContext> {
    const chunks = await this.searchChunks(query, filters);

    if (chunks.length === 0) {
      return {
        context: '',
        sources: [],
      };
    }

    // Format context with numbered citations
    let contextText = 'Relevant information from knowledge base:\n\n';

    const sources = chunks.map((chunk, index) => {
      const citationIndex = index + 1;

      // Add to context with citation number
      contextText += `[${citationIndex}] ${chunk.title}\n`;
      contextText += `${chunk.content}\n`;
      if (chunk.url) {
        contextText += `Source: ${chunk.url}\n`;
      }
      contextText += '\n';

      return {
        index: citationIndex,
        doc_id: chunk.doc_id,
        chunk_id: chunk.chunk_id,
        title: chunk.title,
        snippet: this.truncateSnippet(chunk.content, 200),
        url: chunk.url,
        similarity: chunk.similarity,
      };
    });

    return {
      context: contextText,
      sources,
    };
  }

  /**
   * Validate that all cited document IDs exist in the database
   */
  async validateCitations(docIds: string[]): Promise<{
    valid: boolean;
    missing: string[];
    existing: string[];
  }> {
    if (docIds.length === 0) {
      return { valid: true, missing: [], existing: [] };
    }

    const result = await db.query(
      'SELECT * FROM validate_citation_doc_ids($1::uuid[])',
      [docIds]
    );

    const existing: string[] = [];
    const missing: string[] = [];

    for (const row of result.rows) {
      if (row.exists) {
        existing.push(row.doc_id);
      } else {
        missing.push(row.doc_id);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      existing,
    };
  }

  /**
   * Store citations for a brief or content
   */
  async storeCitations(
    citations: Array<{
      briefId?: number;
      contentId?: number;
      docId: string;
      chunkId?: string;
      citationIndex: number;
      snippet: string;
      relevanceScore: number;
    }>
  ): Promise<void> {
    for (const citation of citations) {
      await db.query(
        `INSERT INTO citations
         (brief_id, content_id, doc_id, chunk_id, citation_index, snippet, relevance_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          citation.briefId || null,
          citation.contentId || null,
          citation.docId,
          citation.chunkId || null,
          citation.citationIndex,
          citation.snippet,
          citation.relevanceScore,
        ]
      );
    }
  }

  /**
   * Get citations for a brief
   */
  async getCitationsForBrief(briefId: number): Promise<any[]> {
    const result = await db.query(
      `SELECT
         c.citation_id,
         c.doc_id,
         c.chunk_id,
         c.citation_index,
         c.snippet,
         c.relevance_score,
         d.title,
         d.url,
         d.author,
         d.published_date
       FROM citations c
       JOIN documents d ON c.doc_id = d.doc_id
       WHERE c.brief_id = $1
       ORDER BY c.citation_index`,
      [briefId]
    );

    return result.rows;
  }

  /**
   * Get citations for content
   */
  async getCitationsForContent(contentId: number): Promise<any[]> {
    const result = await db.query(
      `SELECT
         c.citation_id,
         c.doc_id,
         c.chunk_id,
         c.citation_index,
         c.snippet,
         c.relevance_score,
         d.title,
         d.url,
         d.author,
         d.published_date
       FROM citations c
       JOIN documents d ON c.doc_id = d.doc_id
       WHERE c.content_id = $1
       ORDER BY c.citation_index`,
      [contentId]
    );

    return result.rows;
  }

  /**
   * Hybrid search: combines full-text and semantic search
   * Uses PostgreSQL's full-text search with vector similarity
   */
  async hybridSearch(
    query: string,
    filters?: SearchFilters & {
      fullTextWeight?: number;
      semanticWeight?: number;
    }
  ): Promise<SearchResult[]> {
    const fullTextWeight = filters?.fullTextWeight || 0.3;
    const semanticWeight = filters?.semanticWeight || 0.7;

    // Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Perform hybrid search
    const matchThreshold = filters?.match_threshold || 0.5;
    const matchCount = filters?.match_count || 10;

    const result = await db.query(
      `SELECT
         dc.chunk_id,
         dc.doc_id,
         d.title,
         dc.chunk_text,
         dc.chunk_index,
         d.url,
         d.author,
         d.tags,
         (
           $4::float * ts_rank(to_tsvector('english', dc.chunk_text), plainto_tsquery('english', $6)) +
           $5::float * (1 - (dc.embedding <=> $1::vector))
         ) as combined_score,
         (1 - (dc.embedding <=> $1::vector)) as semantic_similarity
       FROM document_chunks dc
       JOIN documents d ON dc.doc_id = d.doc_id
       WHERE
         d.is_active = true
         AND (
           to_tsvector('english', dc.chunk_text) @@ plainto_tsquery('english', $6)
           OR (1 - (dc.embedding <=> $1::vector)) > $2
         )
         AND ($7::text IS NULL OR d.author = $7)
         AND ($8::text[] IS NULL OR d.tags && $8)
       ORDER BY combined_score DESC
       LIMIT $3`,
      [
        JSON.stringify(queryEmbedding),
        matchThreshold,
        matchCount,
        fullTextWeight,
        semanticWeight,
        query,
        filters?.author || null,
        filters?.tags || null,
      ]
    );

    return result.rows.map(row => ({
      chunk_id: row.chunk_id,
      doc_id: row.doc_id,
      title: row.title,
      content: row.chunk_text,
      chunk_index: row.chunk_index,
      url: row.url,
      author: row.author,
      tags: row.tags,
      similarity: parseFloat(row.semantic_similarity),
      combined_score: parseFloat(row.combined_score),
    }));
  }

  /**
   * Get popular documents by citation count
   */
  async getPopularDocuments(limit: number = 10): Promise<any[]> {
    const result = await db.query(
      `SELECT
         d.doc_id,
         d.title,
         d.url,
         d.author,
         d.tags,
         COUNT(c.citation_id) as citation_count
       FROM documents d
       LEFT JOIN citations c ON d.doc_id = c.doc_id
       WHERE d.is_active = true
       GROUP BY d.doc_id
       ORDER BY citation_count DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  /**
   * Get document usage analytics
   */
  async getDocumentAnalytics(docId: string): Promise<any> {
    const result = await db.query(
      `SELECT
         COUNT(DISTINCT c.brief_id) as used_in_briefs,
         COUNT(DISTINCT c.content_id) as used_in_contents,
         COUNT(c.citation_id) as total_citations,
         AVG(c.relevance_score) as avg_relevance_score,
         MAX(c.created_at) as last_used
       FROM citations c
       WHERE c.doc_id = $1`,
      [docId]
    );

    return result.rows[0];
  }

  /**
   * Truncate snippet to max length
   */
  private truncateSnippet(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    // Try to cut at sentence boundary
    const truncated = text.slice(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');

    if (lastPeriod > maxLength * 0.7) {
      return truncated.slice(0, lastPeriod + 1);
    }

    // Cut at word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      return truncated.slice(0, lastSpace) + '...';
    }

    return truncated + '...';
  }
}

// Export singleton instance
export const ragService = new RAGService();

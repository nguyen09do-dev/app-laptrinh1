import { db } from '../lib/db.js';
import { embeddingService } from './embedding.service.js';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as cheerio from 'cheerio';

/**
 * DocumentsService
 * Handles document ingestion, chunking, embedding, and versioning
 */

interface DocumentMetadata {
  title: string;
  url?: string;
  author?: string;
  published_date?: string;
  tags?: string[];
}

interface DocumentChunk {
  chunk_index: number;
  chunk_text: string;
  token_count: number;
}

interface IngestedDocument {
  doc_id: string;
  title: string;
  chunks_created: number;
  version_number: number;
}

export class DocumentsService {
  /**
   * Ingest a document: store, chunk, embed, and save to database
   */
  async ingestDocument(
    content: string,
    metadata: DocumentMetadata,
    options?: {
      chunkSize?: number;
      chunkOverlap?: number;
      createVersion?: boolean;
    }
  ): Promise<IngestedDocument> {
    const chunkSize = options?.chunkSize || 800;
    const chunkOverlap = options?.chunkOverlap || 50;

    // Check if document already exists (by title and URL)
    const existingDoc = await this.findDocumentByTitleAndUrl(metadata.title, metadata.url);

    let docId: string;
    let versionNumber = 1;
    let isNewDocument = !existingDoc;

    if (existingDoc && options?.createVersion !== false) {
      // Document exists - create new version
      docId = existingDoc.doc_id;
      versionNumber = existingDoc.version_number + 1;

      // Archive old version
      await this.archiveDocumentVersion(docId, existingDoc);

      console.log(`📝 Creating version ${versionNumber} for document: ${metadata.title}`);
    } else if (existingDoc && options?.createVersion === false) {
      // Update existing document without versioning
      docId = existingDoc.doc_id;
      versionNumber = existingDoc.version_number;
      isNewDocument = false;

      // Delete old chunks
      await db.query('DELETE FROM document_chunks WHERE doc_id = $1', [docId]);

      console.log(`♻️  Updating existing document: ${metadata.title}`);
    } else {
      // New document - generate UUID
      const result = await db.query('SELECT uuid_generate_v4() as id');
      docId = result.rows[0].id;

      console.log(`✨ Creating new document: ${metadata.title}`);
    }

    // Generate embedding for full document
    console.log('🔮 Generating document embedding...');
    const documentEmbedding = await embeddingService.generateEmbedding(content);

    // Store or update document
    const publishedDate = metadata.published_date ? new Date(metadata.published_date) : null;

    await db.query(
      `INSERT INTO documents (doc_id, title, url, content, embedding, author, published_date, tags, version_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (doc_id)
       DO UPDATE SET
         title = EXCLUDED.title,
         url = EXCLUDED.url,
         content = EXCLUDED.content,
         embedding = EXCLUDED.embedding,
         author = EXCLUDED.author,
         published_date = EXCLUDED.published_date,
         tags = EXCLUDED.tags,
         version_number = EXCLUDED.version_number,
         updated_at = now()`,
      [
        docId,
        metadata.title,
        metadata.url || null,
        content,
        JSON.stringify(documentEmbedding),
        metadata.author || null,
        publishedDate,
        metadata.tags || [],
        versionNumber,
      ]
    );

    // Chunk the document
    console.log('✂️  Chunking document...');
    const chunks = this.chunkText(content, chunkSize, chunkOverlap);

    // Generate embeddings for all chunks (batch)
    console.log(`🔮 Generating embeddings for ${chunks.length} chunks...`);
    const chunkTexts = chunks.map(c => c.chunk_text);
    const chunkEmbeddings = await embeddingService.generateEmbeddingsBatch(chunkTexts);

    // Store chunks with embeddings
    console.log('💾 Storing chunks to database...');
    for (let i = 0; i < chunks.length; i++) {
      await db.query(
        `INSERT INTO document_chunks (doc_id, chunk_index, chunk_text, embedding, token_count, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          docId,
          chunks[i].chunk_index,
          chunks[i].chunk_text,
          JSON.stringify(chunkEmbeddings[i]),
          chunks[i].token_count,
          JSON.stringify({ title: metadata.title, chunk_index: i }),
        ]
      );
    }

    console.log(`✅ Document ingested successfully! ${chunks.length} chunks created.`);

    return {
      doc_id: docId,
      title: metadata.title,
      chunks_created: chunks.length,
      version_number: versionNumber,
    };
  }

  /**
   * Chunk text into smaller pieces with overlap
   * Uses token-based estimation (rough: 1 token ≈ 4 characters)
   */
  private chunkText(
    text: string,
    chunkSize: number = 800,
    overlap: number = 50
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];

    // Rough token estimation: 1 token ≈ 4 characters
    const CHARS_PER_TOKEN = 4;
    const chunkChars = chunkSize * CHARS_PER_TOKEN;
    const overlapChars = overlap * CHARS_PER_TOKEN;

    // Split by paragraphs first for better semantic boundaries
    const paragraphs = text.split(/\n\n+/);

    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const paragraphWithNewline = paragraph.trim() + '\n\n';

      // If adding this paragraph exceeds chunk size
      if (currentChunk.length + paragraphWithNewline.length > chunkChars) {
        if (currentChunk.length > 0) {
          // Save current chunk
          chunks.push({
            chunk_index: chunkIndex++,
            chunk_text: currentChunk.trim(),
            token_count: Math.ceil(currentChunk.length / CHARS_PER_TOKEN),
          });

          // Start new chunk with overlap
          const overlapText = this.getLastNChars(currentChunk, overlapChars);
          currentChunk = overlapText + paragraphWithNewline;
        } else {
          // Paragraph itself is too long - split it by sentences
          const sentences = paragraph.split(/[.!?]+\s+/);

          for (const sentence of sentences) {
            const sentenceWithSpace = sentence.trim() + '. ';

            if (currentChunk.length + sentenceWithSpace.length > chunkChars) {
              if (currentChunk.length > 0) {
                chunks.push({
                  chunk_index: chunkIndex++,
                  chunk_text: currentChunk.trim(),
                  token_count: Math.ceil(currentChunk.length / CHARS_PER_TOKEN),
                });

                const overlapText = this.getLastNChars(currentChunk, overlapChars);
                currentChunk = overlapText + sentenceWithSpace;
              } else {
                // Sentence is too long - split by words
                const words = sentence.split(/\s+/);
                for (const word of words) {
                  if (currentChunk.length + word.length + 1 > chunkChars) {
                    if (currentChunk.length > 0) {
                      chunks.push({
                        chunk_index: chunkIndex++,
                        chunk_text: currentChunk.trim(),
                        token_count: Math.ceil(currentChunk.length / CHARS_PER_TOKEN),
                      });

                      const overlapText = this.getLastNChars(currentChunk, overlapChars);
                      currentChunk = overlapText + word + ' ';
                    } else {
                      currentChunk = word + ' ';
                    }
                  } else {
                    currentChunk += word + ' ';
                  }
                }
              }
            } else {
              currentChunk += sentenceWithSpace;
            }
          }

          currentChunk += '\n\n';
        }
      } else {
        currentChunk += paragraphWithNewline;
      }
    }

    // Add remaining chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        chunk_index: chunkIndex++,
        chunk_text: currentChunk.trim(),
        token_count: Math.ceil(currentChunk.length / CHARS_PER_TOKEN),
      });
    }

    return chunks;
  }

  /**
   * Get last N characters from text for overlap
   */
  private getLastNChars(text: string, n: number): string {
    if (text.length <= n) return text;
    return text.slice(-n);
  }

  /**
   * Extract text from various file formats
   */
  async extractTextFromFile(
    buffer: Buffer,
    mimeType: string
  ): Promise<string> {
    if (!buffer || buffer.length === 0) {
      throw new Error('File buffer is empty');
    }

    console.log(`📄 Extracting text from file type: ${mimeType}, size: ${buffer.length} bytes`);

    try {
      switch (mimeType) {
        case 'application/pdf':
          console.log('📑 Processing PDF file...');
          return await this.extractFromPDF(buffer);

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          console.log('📝 Processing DOCX file...');
          return await this.extractFromDOCX(buffer);

        case 'text/html':
          console.log('🌐 Processing HTML file...');
          return this.extractFromHTML(buffer.toString('utf-8'));

        case 'text/plain':
          console.log('📄 Processing plain text file...');
          return buffer.toString('utf-8');

        default:
          // Try to detect file type by extension or content
          console.log(`⚠️  Unknown MIME type: ${mimeType}, attempting plain text extraction...`);
          
          // Try as plain text first
          const textContent = buffer.toString('utf-8');
          
          // If it looks like valid text, return it
          if (textContent.length > 0 && /^[\s\S]*$/.test(textContent)) {
            return textContent;
          }
          
          throw new Error(`Unsupported file type: ${mimeType}. Supported types: PDF, DOCX, TXT, HTML`);
      }
    } catch (error) {
      console.error(`❌ Error extracting text from ${mimeType}:`, error);
      throw new Error(
        `Failed to extract text from ${mimeType}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract text from PDF
   */
  private async extractFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      const text = data.text || '';
      
      if (!text || text.trim().length === 0) {
        throw new Error('PDF file appears to be empty or contains no extractable text');
      }
      
      return text;
    } catch (error) {
      console.error('❌ PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from DOCX
   */
  private async extractFromDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || '';
      
      if (!text || text.trim().length === 0) {
        throw new Error('DOCX file appears to be empty or contains no extractable text');
      }
      
      return text;
    } catch (error) {
      console.error('❌ DOCX extraction error:', error);
      throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from HTML
   */
  private extractFromHTML(html: string): string {
    const $ = cheerio.load(html);

    // Remove script and style tags
    $('script, style').remove();

    // Get text content
    return $('body').text().replace(/\s+/g, ' ').trim();
  }

  /**
   * Find document by title and URL
   */
  private async findDocumentByTitleAndUrl(
    title: string,
    url?: string
  ): Promise<any | null> {
    const query = url
      ? 'SELECT * FROM documents WHERE title = $1 AND url = $2 AND is_active = true'
      : 'SELECT * FROM documents WHERE title = $1 AND url IS NULL AND is_active = true';

    const params = url ? [title, url] : [title];
    const result = await db.query(query, params);

    return result.rows[0] || null;
  }

  /**
   * Archive old version of document
   */
  private async archiveDocumentVersion(docId: string, document: any): Promise<void> {
    await db.query(
      `INSERT INTO document_versions
       (doc_id, version_number, title, url, content, embedding, author, published_date, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        docId,
        document.version_number,
        document.title,
        document.url,
        document.content,
        document.embedding,
        document.author,
        document.published_date,
        document.tags,
        JSON.stringify({
          title: document.title,
          author: document.author,
          url: document.url,
          tags: document.tags,
          created_at: document.created_at,
        }),
      ]
    );
  }

  /**
   * Get all documents
   */
  async getAllDocuments(filters?: {
    author?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let query = 'SELECT doc_id, title, url, author, published_date, tags, version_number, created_at FROM documents WHERE is_active = true';
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.author) {
      query += ` AND author = $${paramCount++}`;
      params.push(filters.author);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query += ` AND tags && $${paramCount++}`;
      params.push(filters.tags);
    }

    query += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      query += ` LIMIT $${paramCount++}`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramCount++}`;
      params.push(filters.offset);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get document by ID
   */
  async getDocumentById(docId: string): Promise<any | null> {
    const result = await db.query(
      'SELECT * FROM documents WHERE doc_id = $1 AND is_active = true',
      [docId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(docId: string): Promise<any[]> {
    const result = await db.query(
      'SELECT version_id, version_number, title, author, created_at, metadata FROM document_versions WHERE doc_id = $1 ORDER BY version_number DESC',
      [docId]
    );

    return result.rows;
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(docId: string): Promise<void> {
    await db.query(
      'UPDATE documents SET is_active = false, updated_at = now() WHERE doc_id = $1',
      [docId]
    );
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<any> {
    const result = await db.query(`
      SELECT
        COUNT(DISTINCT doc_id) as total_documents,
        COUNT(DISTINCT author) as total_authors,
        SUM(array_length(tags, 1)) as total_tags,
        (SELECT COUNT(*) FROM document_chunks) as total_chunks
      FROM documents
      WHERE is_active = true
    `);

    return result.rows[0];
  }
}

// Export singleton instance
export const documentsService = new DocumentsService();


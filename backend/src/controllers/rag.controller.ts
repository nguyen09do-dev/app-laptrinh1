import { FastifyRequest, FastifyReply } from 'fastify';
import { documentsService } from '../services/documents.service.js';
import { ragService } from '../services/rag.service.js';

/**
 * RAG Controller
 * Handles document ingestion, search, and RAG operations
 */

interface IngestRequest {
  Body: {
    title: string;
    url?: string;
    author?: string;
    published_date?: string;
    tags?: string[];
    content?: string;
  };
}

interface IngestFileRequest {
  title?: string;
  url?: string;
  author?: string;
  published_date?: string;
  tags?: string[];
}

interface SearchRequest {
  Querystring: {
    query: string;
    author?: string;
    tags?: string;
    match_threshold?: string;
    match_count?: string;
    search_type?: 'documents' | 'chunks' | 'hybrid';
  };
}

interface DocumentListRequest {
  Querystring: {
    author?: string;
    tags?: string;
    limit?: string;
    offset?: string;
  };
}

export class RAGController {
  /**
   * POST /api/rag/ingest
   * Ingest document from text content
   */
  static async ingestDocument(
    request: FastifyRequest<IngestRequest>,
    reply: FastifyReply
  ) {
    try {
      const { title, url, author, published_date, tags, content } = request.body;

      if (!title) {
        return reply.status(400).send({
          error: 'Missing required field: title',
        });
      }

      if (!content) {
        return reply.status(400).send({
          error: 'Missing required field: content',
        });
      }

      const result = await documentsService.ingestDocument(
        content,
        {
          title,
          url,
          author,
          published_date,
          tags,
        },
        {
          chunkSize: 800,
          chunkOverlap: 50,
          createVersion: true, // Enable versioning by default
        }
      );

      reply.send({
        success: true,
        message: 'Document ingested successfully',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error ingesting document:', error);
      reply.status(500).send({
        error: 'Failed to ingest document',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/rag/ingest/file
   * Ingest document from uploaded file (PDF, DOCX, TXT, HTML)
   */
  static async ingestFile(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    let fileData: any = null;
    const metadata: IngestFileRequest = {};

    try {
      console.log('📤 Starting file ingestion...');
      
      // Get file first using request.file()
      fileData = await request.file();
      
      if (!fileData) {
        console.error('❌ No file data received');
        return reply.status(400).send({
          error: 'No file uploaded',
        });
      }

      console.log(`📄 File received: ${fileData.filename}, type: ${fileData.mimetype || 'unknown'}`);

      // Try to get form fields from request.parts() if available
      // But don't block if it fails - we can work without metadata
      try {
        const parts = request.parts();
        let partCount = 0;
        const maxParts = 10; // Safety limit

        for await (const part of parts) {
          partCount++;
          if (partCount > maxParts) {
            console.warn('⚠️  Too many parts, stopping iteration');
            break;
          }

          // Skip the file part we already have
          if ('filename' in part && part.filename === fileData.filename) {
            continue;
          }

          // This is a form field
          if (!('filename' in part) && 'fieldname' in part && 'value' in part) {
            const fieldName = part.fieldname;
            try {
              const fieldValue = await part.value;
              console.log(`📝 Form field: ${fieldName} = ${fieldValue}`);
              
              switch (fieldName) {
                case 'title':
                  metadata.title = fieldValue as string;
                  break;
                case 'url':
                  metadata.url = fieldValue as string;
                  break;
                case 'author':
                  metadata.author = fieldValue as string;
                  break;
                case 'published_date':
                  metadata.published_date = fieldValue as string;
                  break;
                case 'tags':
                  try {
                    metadata.tags = JSON.parse(fieldValue as string);
                  } catch {
                    const tagsArray = (fieldValue as string).split(',').map(t => t.trim()).filter(Boolean);
                    if (tagsArray.length > 0) {
                      metadata.tags = tagsArray;
                    }
                  }
                  break;
              }
            } catch (fieldError) {
              console.warn(`⚠️  Error reading field ${fieldName}:`, fieldError);
            }
          }
        }
      } catch (partsError) {
        console.warn('⚠️  Could not read form fields from parts, continuing without metadata:', partsError);
        // Continue without metadata - filename will be used as title
      }

      if (!fileData) {
        console.error('❌ No file data received');
        return reply.status(400).send({
          error: 'No file uploaded',
        });
      }

      console.log('✅ Metadata extracted:', { ...metadata, tags: metadata.tags ? 'present' : 'none' });

      // Get file buffer
      let buffer: Buffer;
      try {
        buffer = await fileData.toBuffer();
        console.log(`✅ File buffer loaded: ${buffer.length} bytes`);
      } catch (bufferError) {
        console.error('❌ Error reading file buffer:', bufferError);
        throw new Error(`Failed to read file buffer: ${bufferError instanceof Error ? bufferError.message : 'Unknown error'}`);
      }

      // Extract text from file
      let content: string;
      try {
        console.log(`🔍 Extracting text from ${fileData.mimetype || 'unknown'}...`);
        content = await documentsService.extractTextFromFile(
          buffer,
          fileData.mimetype || 'text/plain'
        );
        
        if (!content || content.trim().length === 0) {
          throw new Error('Extracted content is empty. The file might be corrupted or unsupported.');
        }
        
        console.log(`✅ Text extracted: ${content.length} characters`);
      } catch (extractError) {
        console.error('❌ Error extracting text from file:', extractError);
        throw new Error(`Failed to extract text from file: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`);
      }

      // Use filename as title if not provided
      const title = metadata.title || fileData.filename || 'Untitled Document';
      
      if (!title) {
        throw new Error('Title is required but could not be determined from filename or metadata');
      }

      console.log(`📝 Ingesting document: "${title}"`);

      // Ingest document
      const result = await documentsService.ingestDocument(
        content,
        {
          title,
          url: metadata.url,
          author: metadata.author,
          published_date: metadata.published_date,
          tags: metadata.tags,
        },
        {
          chunkSize: 800,
          chunkOverlap: 50,
          createVersion: true,
        }
      );

      console.log(`✅ Document ingested successfully: ${result.chunks_created} chunks created`);

      reply.send({
        success: true,
        message: 'File ingested successfully',
        data: {
          ...result,
          filename: fileData.filename,
          mimetype: fileData.mimetype,
          size: buffer.length,
        },
      });
    } catch (error) {
      console.error('❌ Error ingesting file:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      reply.status(500).send({
        error: 'Failed to ingest file',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.stack : undefined)
          : undefined,
      });
    }
  }

  /**
   * GET /api/rag/search
   * Semantic search across documents or chunks
   */
  static async search(
    request: FastifyRequest<SearchRequest>,
    reply: FastifyReply
  ) {
    try {
      const {
        query,
        author,
        tags,
        match_threshold,
        match_count,
        search_type = 'chunks',
      } = request.query;

      if (!query) {
        return reply.status(400).send({
          error: 'Missing required parameter: query',
        });
      }

      const filters = {
        author,
        tags: tags ? tags.split(',') : undefined,
        match_threshold: match_threshold ? parseFloat(match_threshold) : 0.7,
        match_count: match_count ? parseInt(match_count, 10) : 10,
      };

      let results;

      switch (search_type) {
        case 'documents':
          results = await ragService.searchDocuments(query, filters);
          break;

        case 'chunks':
          results = await ragService.searchChunks(query, filters);
          break;

        case 'hybrid':
          results = await ragService.hybridSearch(query, filters);
          break;

        default:
          return reply.status(400).send({
            error: 'Invalid search_type. Must be: documents, chunks, or hybrid',
          });
      }

      reply.send({
        success: true,
        query,
        search_type,
        filters,
        results,
        count: results.length,
      });
    } catch (error) {
      console.error('❌ Error searching documents:', error);
      reply.status(500).send({
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/rag/documents
   * List all documents with optional filters
   */
  static async listDocuments(
    request: FastifyRequest<DocumentListRequest>,
    reply: FastifyReply
  ) {
    try {
      const { author, tags, limit, offset } = request.query;

      const filters = {
        author,
        tags: tags ? tags.split(',') : undefined,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      };

      const documents = await documentsService.getAllDocuments(filters);

      reply.send({
        success: true,
        filters,
        documents,
        count: documents.length,
      });
    } catch (error) {
      console.error('❌ Error listing documents:', error);
      reply.status(500).send({
        error: 'Failed to list documents',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/rag/documents/:docId
   * Get document by ID
   */
  static async getDocument(
    request: FastifyRequest<{ Params: { docId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { docId } = request.params;

      const document = await documentsService.getDocumentById(docId);

      if (!document) {
        return reply.status(404).send({
          error: 'Document not found',
        });
      }

      reply.send({
        success: true,
        document,
      });
    } catch (error) {
      console.error('❌ Error getting document:', error);
      reply.status(500).send({
        error: 'Failed to get document',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/rag/documents/:docId/versions
   * Get document version history
   */
  static async getDocumentVersions(
    request: FastifyRequest<{ Params: { docId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { docId } = request.params;

      const versions = await documentsService.getDocumentVersions(docId);

      reply.send({
        success: true,
        doc_id: docId,
        versions,
        count: versions.length,
      });
    } catch (error) {
      console.error('❌ Error getting document versions:', error);
      reply.status(500).send({
        error: 'Failed to get document versions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/rag/documents/:docId
   * Delete document (soft delete)
   */
  static async deleteDocument(
    request: FastifyRequest<{ Params: { docId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { docId } = request.params;

      await documentsService.deleteDocument(docId);

      reply.send({
        success: true,
        message: 'Document deleted successfully',
        doc_id: docId,
      });
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      reply.status(500).send({
        error: 'Failed to delete document',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/rag/analytics/popular
   * Get most cited documents
   */
  static async getPopularDocuments(
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : 10;

      const documents = await ragService.getPopularDocuments(limit);

      reply.send({
        success: true,
        documents,
        count: documents.length,
      });
    } catch (error) {
      console.error('❌ Error getting popular documents:', error);
      reply.status(500).send({
        error: 'Failed to get popular documents',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/rag/analytics/document/:docId
   * Get document usage analytics
   */
  static async getDocumentAnalytics(
    request: FastifyRequest<{ Params: { docId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { docId } = request.params;

      const analytics = await ragService.getDocumentAnalytics(docId);

      reply.send({
        success: true,
        doc_id: docId,
        analytics,
      });
    } catch (error) {
      console.error('❌ Error getting document analytics:', error);
      reply.status(500).send({
        error: 'Failed to get document analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/rag/stats
   * Get overall RAG system statistics
   */
  static async getStats(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const stats = await documentsService.getDocumentStats();

      reply.send({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      reply.status(500).send({
        error: 'Failed to get stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

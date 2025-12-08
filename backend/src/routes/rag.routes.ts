import { FastifyInstance } from 'fastify';
import { RAGController } from '../controllers/rag.controller.js';
import { validateCitations, validateCitationsOptional } from '../middleware/citationValidator.js';

/**
 * RAG Routes
 * Document ingestion, search, and knowledge base management
 */

export async function ragRoutes(fastify: FastifyInstance) {
  // Document ingestion
  fastify.post('/api/rag/ingest', RAGController.ingestDocument);
  fastify.post('/api/rag/ingest/file', RAGController.ingestFile);

  // Document search
  fastify.get('/api/rag/search', RAGController.search);

  // Document management
  fastify.get('/api/rag/documents', RAGController.listDocuments);
  fastify.get('/api/rag/documents/:docId', RAGController.getDocument);
  fastify.get('/api/rag/documents/:docId/versions', RAGController.getDocumentVersions);
  fastify.delete('/api/rag/documents/:docId', RAGController.deleteDocument);

  // Analytics
  fastify.get('/api/rag/analytics/popular', RAGController.getPopularDocuments);
  fastify.get('/api/rag/analytics/document/:docId', RAGController.getDocumentAnalytics);
  fastify.get('/api/rag/stats', RAGController.getStats);
}

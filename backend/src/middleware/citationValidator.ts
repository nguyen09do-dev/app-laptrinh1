import { FastifyRequest, FastifyReply } from 'fastify';
import { ragService } from '../services/rag.service.js';

/**
 * Citation Validation Middleware
 * Validates that all cited document IDs exist in the database
 */

interface CitationValidationPayload {
  citations?: Array<{
    doc_id?: string;
    docId?: string;
  }>;
  doc_ids?: string[];
  docIds?: string[];
}

/**
 * Middleware to validate citations in request body
 * Checks that all referenced document IDs exist and are active
 */
export async function validateCitations(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = request.body as CitationValidationPayload;

  if (!body) {
    return; // No body, skip validation
  }

  // Extract doc_ids from various possible formats
  let docIds: string[] = [];

  // Check for direct doc_ids array
  if (body.doc_ids && Array.isArray(body.doc_ids)) {
    docIds = body.doc_ids;
  } else if (body.docIds && Array.isArray(body.docIds)) {
    docIds = body.docIds;
  }

  // Check for citations array
  if (body.citations && Array.isArray(body.citations)) {
    const citationDocIds = body.citations
      .map(c => c.doc_id || c.docId)
      .filter(Boolean) as string[];
    docIds = [...docIds, ...citationDocIds];
  }

  // Remove duplicates
  docIds = [...new Set(docIds)];

  // If no citations to validate, continue
  if (docIds.length === 0) {
    return;
  }

  // Validate UUIDs format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const invalidUuids = docIds.filter(id => !uuidRegex.test(id));

  if (invalidUuids.length > 0) {
    return reply.status(400).send({
      error: 'Invalid citation format',
      message: 'All document IDs must be valid UUIDs',
      invalid_ids: invalidUuids,
    });
  }

  // Validate that all documents exist
  try {
    const validation = await ragService.validateCitations(docIds);

    if (!validation.valid) {
      return reply.status(404).send({
        error: 'Invalid citations',
        message: 'Some referenced documents do not exist or are not active',
        missing_doc_ids: validation.missing,
        existing_doc_ids: validation.existing,
      });
    }

    // Validation passed, continue to route handler
  } catch (error) {
    console.error('❌ Citation validation error:', error);
    return reply.status(500).send({
      error: 'Citation validation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Optional citation validator
 * Only validates if citations are present, otherwise continues
 */
export async function validateCitationsOptional(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = request.body as CitationValidationPayload;

  if (!body) {
    return; // No body, skip
  }

  // Extract doc_ids
  let docIds: string[] = [];

  if (body.doc_ids && Array.isArray(body.doc_ids)) {
    docIds = body.doc_ids;
  } else if (body.docIds && Array.isArray(body.docIds)) {
    docIds = body.docIds;
  }

  if (body.citations && Array.isArray(body.citations)) {
    const citationDocIds = body.citations
      .map(c => c.doc_id || c.docId)
      .filter(Boolean) as string[];
    docIds = [...docIds, ...citationDocIds];
  }

  docIds = [...new Set(docIds)];

  if (docIds.length === 0) {
    return; // No citations, continue without validation
  }

  // If citations exist, validate them
  return validateCitations(request, reply);
}

/**
 * Extract and validate citations from generated content
 * Parses content for [1], [2], [3] style citations
 */
export function extractCitationsFromContent(
  content: string,
  sources: Array<{ index: number; doc_id: string; snippet: string; url?: string }>
): Array<{
  citation_index: number;
  doc_id: string;
  snippet: string;
  url?: string;
}> {
  const citations: Array<{
    citation_index: number;
    doc_id: string;
    snippet: string;
    url?: string;
  }> = [];

  // Find all citation references in content [1], [2], etc.
  const citationRegex = /\[(\d+)\]/g;
  const matches = content.matchAll(citationRegex);

  const usedIndices = new Set<number>();

  for (const match of matches) {
    const index = parseInt(match[1], 10);

    // Avoid duplicates
    if (usedIndices.has(index)) {
      continue;
    }

    usedIndices.add(index);

    // Find corresponding source
    const source = sources.find(s => s.index === index);

    if (source) {
      citations.push({
        citation_index: index,
        doc_id: source.doc_id,
        snippet: source.snippet,
        url: source.url,
      });
    }
  }

  return citations;
}

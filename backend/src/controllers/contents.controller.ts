import { FastifyRequest, FastifyReply } from 'fastify';
import { contentsService } from '../services/contents.service.js';
import { contentsRAGService } from '../services/contents-rag.service.js';

export class ContentsController {
  async getAllContents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const contents = await contentsService.getAllContents();
      return reply.send({ success: true, data: contents, count: contents.length });
    } catch (error) {
      console.error('Error getting contents:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch contents' });
    }
  }

  async getContentById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return reply.status(400).send({ success: false, error: 'Invalid content ID' });
      }

      const content = await contentsService.getContentById(id);
      if (!content) {
        return reply.status(404).send({ success: false, error: 'Content not found' });
      }

      return reply.send({ success: true, data: content });
    } catch (error) {
      console.error('Error getting content:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch content' });
    }
  }

  /**
   * POST /api/contents/from-brief/:briefId - Generate content from brief
   * Body: { wordCount?: number; style?: string; useRAG?: boolean; searchFilters?: {...} }
   */
  async generateContentFromBrief(request: FastifyRequest<{
    Params: { briefId: string };
    Body?: { wordCount?: number; style?: string; useRAG?: boolean; searchFilters?: any }
  }>, reply: FastifyReply) {
    try {
      const briefId = parseInt(request.params.briefId);
      if (isNaN(briefId)) {
        return reply.status(400).send({ success: false, error: 'Invalid brief ID' });
      }

      const { wordCount, style, useRAG = false, searchFilters } = request.body || {};
      // Check if RAG is enabled (default: false for backward compatibility)

      console.log(`📝 Generating content from brief ${briefId}${useRAG ? ' (RAG-enabled)' : ''} with options:`, { wordCount, style });

      let result;
      if (useRAG) {
        // Use RAG-enhanced service
        const ragResult = await contentsRAGService.generateContentWithRAG({
          briefId,
          wordCount,
          style,
          useRAG: true,
          searchFilters,
        });
        result = {
          ...ragResult.content,
          rag_context: ragResult.rag_context,
        };
      } else {
        // Use traditional service (backward compatible)
        result = await contentsService.generateContentFromBrief(briefId, { wordCount, style });
      }

      return reply.send({ 
        success: true, 
        data: result, 
        message: `Content generated successfully${useRAG ? ' with RAG enhancement' : ''}` 
      });
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('not found') || errorMessage.includes('already exists')) {
        return reply.status(400).send({ success: false, error: errorMessage });
      }

      return reply.status(500).send({ success: false, error: `Failed to generate content: ${errorMessage}` });
    }
  }

  async deleteContent(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return reply.status(400).send({ success: false, error: 'Invalid content ID' });
      }

      const deleted = await contentsService.deleteContent(id);
      if (!deleted) {
        return reply.status(404).send({ success: false, error: 'Content not found' });
      }

      return reply.send({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Error deleting content:', error);
      return reply.status(500).send({ success: false, error: 'Failed to delete content' });
    }
  }

  /**
   * POST /api/contents/from-pack/:packId
   * Convert a published content pack to content
   */
  async createContentFromPack(
    request: FastifyRequest<{ Params: { packId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;

      if (!packId) {
        return reply.status(400).send({ success: false, error: 'Pack ID is required' });
      }

      console.log(`📦 Converting pack ${packId} to content...`);
      const content = await contentsService.createContentFromPack(packId);

      return reply.send({
        success: true,
        data: content,
        message: 'Content created from pack successfully',
      });
    } catch (error) {
      console.error('Error creating content from pack:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('not found')) {
        return reply.status(404).send({ success: false, error: errorMessage });
      }

      if (errorMessage.includes('Only published') || errorMessage.includes('already exists')) {
        return reply.status(400).send({ success: false, error: errorMessage });
      }

      return reply.status(500).send({
        success: false,
        error: `Failed to create content from pack: ${errorMessage}`,
      });
    }
  }
}

export const contentsController = new ContentsController();

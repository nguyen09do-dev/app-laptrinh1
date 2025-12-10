import { FastifyRequest, FastifyReply } from 'fastify';
import { packsService, CreateDraftInput, PackStatus, getAllowedNextStatuses } from '../services/packs.service.js';

/**
 * PacksController - Handle HTTP requests for content packs
 * Includes SSE streaming endpoint for draft generation
 */
export class PacksController {
  /**
   * GET /api/packs - Get all content packs
   */
  async getAllPacks(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const packs = await packsService.getAllPacks();
      return reply.send({
        success: true,
        data: packs,
        count: packs.length,
      });
    } catch (error) {
      console.error('Error getting packs:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch content packs',
      });
    }
  }

  /**
   * GET /api/packs/:packId - Get pack by ID
   */
  async getPackById(
    request: FastifyRequest<{ Params: { packId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const pack = await packsService.getPackById(packId);

      if (!pack) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      return reply.send({
        success: true,
        data: pack,
      });
    } catch (error) {
      console.error('Error getting pack:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch content pack',
      });
    }
  }

  /**
   * POST /api/packs/draft - Generate draft content with SSE streaming
   * 
   * Body:
   *   - pack_id (optional): UUID, if not provided will generate new
   *   - brief_id (required): ID of the brief to generate from
   *   - audience (optional): Custom audience override
   * 
   * Response: Server-Sent Events (SSE) stream
   *   - event: chunk  -> data: { text: "...", pack_id: "..." }
   *   - event: done   -> data: { pack_id, brief_id, word_count, status }
   *   - event: error  -> data: { error: "...", ... }
   */
  async generateDraft(
    request: FastifyRequest<{ Body: CreateDraftInput }>,
    reply: FastifyReply
  ) {
    const { pack_id, brief_id, audience, useRAG, wordCount, style, searchFilters } = request.body;

    // Validate required fields
    if (!brief_id) {
      return reply.status(400).send({
        success: false,
        error: 'brief_id is required',
      });
    }

    // Validate brief_id is a number
    const briefIdNum = typeof brief_id === 'string' ? parseInt(brief_id, 10) : brief_id;
    if (isNaN(briefIdNum)) {
      return reply.status(400).send({
        success: false,
        error: 'brief_id must be a valid number',
      });
    }

    console.log(`🚀 Starting SSE draft generation for brief ${briefIdNum}${useRAG ? ' (RAG-enabled)' : ''}`, {
      wordCount,
      style,
      useRAG
    });

    // Set SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Accel-Buffering': 'no', // Disable nginx buffering if present
    });

    // Helper function to send SSE event
    const sendEvent = (event: string, data: any) => {
      const dataStr = JSON.stringify(data);
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${dataStr}\n\n`);
    };

    try {
      // Stream content generation
      const stream = packsService.generateDraftStream(
        { pack_id, brief_id: briefIdNum, audience, useRAG, wordCount, style, searchFilters },
        { temperature: 0.7, maxTokens: 2000 }
      );

      for await (const event of stream) {
        switch (event.type) {
          case 'chunk':
            sendEvent('chunk', event.data);
            break;
          case 'done':
            sendEvent('done', event.data);
            break;
          case 'error':
            sendEvent('error', event.data);
            break;
        }
      }

      // Send final close event
      sendEvent('close', { message: 'Stream completed' });

    } catch (error: any) {
      console.error('❌ SSE stream error:', error);
      sendEvent('error', {
        error: error.message || 'Stream generation failed',
      });
    } finally {
      // End the response
      reply.raw.end();
    }
  }

  /**
   * POST /api/packs/from-brief/:briefId - Generate draft pack (non-streaming)
   * Body: { wordCount?: number; style?: string; useRAG?: boolean; searchFilters?: {...} }
   */
  async generateDraftFromBrief(
    request: FastifyRequest<{
      Params: { briefId: string };
      Body?: { wordCount?: number; style?: string; useRAG?: boolean; searchFilters?: any };
    }>,
    reply: FastifyReply
  ) {
    try {
      const briefId = parseInt(request.params.briefId);
      if (isNaN(briefId)) {
        return reply.status(400).send({ success: false, error: 'Invalid brief ID' });
      }

      const { wordCount, style, useRAG = false, searchFilters } = request.body || {};

      console.log(`📦 Creating draft pack from brief ${briefId}${useRAG ? ' (RAG-enabled)' : ''}`, {
        wordCount,
        style,
      });

      // Call service to generate draft (this will use streaming internally but wait for completion)
      const pack = await packsService.generateDraftComplete({
        brief_id: briefId,
        useRAG,
        wordCount,
        style,
        searchFilters,
      });

      return reply.send({
        success: true,
        data: pack,
        message: `Draft pack created successfully${useRAG ? ' with RAG enhancement' : ''}`,
      });
    } catch (error) {
      console.error('Error generating draft pack:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('not found')) {
        return reply.status(404).send({ success: false, error: errorMessage });
      }

      return reply.status(500).send({
        success: false,
        error: `Failed to generate draft pack: ${errorMessage}`,
      });
    }
  }

  /**
   * PATCH /api/packs/:packId/status - Update pack status
   */
  async updatePackStatus(
    request: FastifyRequest<{
      Params: { packId: string };
      Body: { status: 'draft' | 'review' | 'approved' | 'published' };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const { status } = request.body;

      const validStatuses = ['draft', 'review', 'approved', 'published'];
      if (!validStatuses.includes(status)) {
        return reply.status(400).send({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const pack = await packsService.updatePackStatus(packId, status);

      if (!pack) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      return reply.send({
        success: true,
        data: pack,
        message: `Pack status updated to '${status}'`,
      });
    } catch (error) {
      console.error('Error updating pack status:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update pack status',
      });
    }
  }

  /**
   * DELETE /api/packs/:packId - Delete pack
   */
  async deletePack(
    request: FastifyRequest<{ Params: { packId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const deleted = await packsService.deletePack(packId);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      return reply.send({
        success: true,
        message: 'Content pack deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting pack:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete content pack',
      });
    }
  }

  /**
   * POST /api/packs/update-status - Update pack status with validation
   * 
   * Body:
   *   - pack_id (required): UUID of the pack
   *   - status (required): Target status ('draft' | 'review' | 'approved' | 'published')
   * 
   * Uses state machine validation to ensure valid transitions
   */
  async updateStatusWithValidation(
    request: FastifyRequest<{
      Body: { pack_id: string; status: PackStatus };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id, status } = request.body;

      // Validate required fields
      if (!pack_id) {
        return reply.status(400).send({
          success: false,
          error: 'pack_id is required',
        });
      }

      if (!status) {
        return reply.status(400).send({
          success: false,
          error: 'status is required',
        });
      }

      const validStatuses: PackStatus[] = ['draft', 'review', 'approved', 'published'];
      if (!validStatuses.includes(status)) {
        return reply.status(400).send({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      // Update with validation (state machine)
      const result = await packsService.updatePackStatusWithValidation(pack_id, status);

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          error: result.error,
        });
      }

      // Get allowed next statuses for the new status
      const allowedNext = getAllowedNextStatuses(status);

      return reply.send({
        success: true,
        data: result.data,
        message: `Pack status updated to '${status}'`,
        allowed_transitions: allowedNext,
      });
    } catch (error) {
      console.error('Error updating pack status:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update pack status',
      });
    }
  }

  /**
   * GET /api/packs/:packId/allowed-statuses - Get allowed status transitions
   */
  async getAllowedStatuses(
    request: FastifyRequest<{ Params: { packId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const result = await packsService.getPackAllowedStatuses(packId);

      if (!result) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error getting allowed statuses:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get allowed statuses',
      });
    }
  }

  /**
   * PUT /api/packs/:packId - Update draft content
   */
  async updateDraftContent(
    request: FastifyRequest<{
      Params: { packId: string };
      Body: { draft_content: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const { draft_content } = request.body;

      if (!draft_content) {
        return reply.status(400).send({
          success: false,
          error: 'draft_content is required',
        });
      }

      const pack = await packsService.updateDraftContent(packId, draft_content);

      if (!pack) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      return reply.send({
        success: true,
        data: pack,
        message: 'Draft content updated successfully',
      });
    } catch (error) {
      console.error('Error updating draft content:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update draft content',
      });
    }
  }
}

// Export singleton instance
export const packsController = new PacksController();


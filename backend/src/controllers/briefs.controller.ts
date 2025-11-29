import { FastifyRequest, FastifyReply } from 'fastify';
import { briefsService } from '../services/briefs.service.js';

/**
 * BriefsController - Handle HTTP requests for briefs
 */
export class BriefsController {
  /**
   * GET /api/briefs - Get all briefs
   */
  async getAllBriefs(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const briefs = await briefsService.getAllBriefs();
      return reply.send({
        success: true,
        data: briefs,
        count: briefs.length,
      });
    } catch (error) {
      console.error('Error getting briefs:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch briefs',
      });
    }
  }

  /**
   * GET /api/briefs/:id - Get brief by ID
   */
  async getBriefById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);

      if (isNaN(id)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid brief ID',
        });
      }

      const brief = await briefsService.getBriefById(id);

      if (!brief) {
        return reply.status(404).send({
          success: false,
          error: 'Brief not found',
        });
      }

      return reply.send({
        success: true,
        data: brief,
      });
    } catch (error) {
      console.error('Error getting brief:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch brief',
      });
    }
  }

  /**
   * POST /api/briefs/from-idea/:ideaId - Create brief from approved idea
   */
  async createBriefFromIdea(
    request: FastifyRequest<{ Params: { ideaId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const ideaId = parseInt(request.params.ideaId);

      if (isNaN(ideaId)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid idea ID',
        });
      }

      console.log(`📝 Creating brief from idea ${ideaId}`);

      const brief = await briefsService.createBriefFromIdea(ideaId);

      return reply.send({
        success: true,
        data: brief,
        message: 'Brief created successfully',
      });
    } catch (error) {
      console.error('Error creating brief:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Handle specific errors
      if (errorMessage.includes('not found')) {
        return reply.status(404).send({
          success: false,
          error: errorMessage,
        });
      }

      if (errorMessage.includes('Only approved') || errorMessage.includes('already exists')) {
        return reply.status(400).send({
          success: false,
          error: errorMessage,
        });
      }

      return reply.status(500).send({
        success: false,
        error: `Failed to create brief: ${errorMessage}`,
      });
    }
  }

  /**
   * DELETE /api/briefs/:id - Delete brief
   */
  async deleteBrief(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);

      if (isNaN(id)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid brief ID',
        });
      }

      const deleted = await briefsService.deleteBrief(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Brief not found',
        });
      }

      return reply.send({
        success: true,
        message: 'Brief deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting brief:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete brief',
      });
    }
  }
}

// Export singleton instance
export const briefsController = new BriefsController();

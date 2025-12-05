import { FastifyRequest, FastifyReply } from 'fastify';
import { ideasService } from '../services/ideas.service.js';

/**
 * IdeasController - Xử lý HTTP requests và trả về responses
 * AI-only flow: chỉ hỗ trợ generate từ AI và quản lý status
 */
export class IdeasController {
  /**
   * GET /api/ideas - Lấy tất cả ideas
   */
  async getAllIdeas(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const ideas = await ideasService.getAllIdeas();
      return reply.send({
        success: true,
        data: ideas,
        count: ideas.length,
      });
    } catch (error) {
      console.error('Error getting ideas:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch ideas',
      });
    }
  }

  /**
   * GET /api/ideas/:id - Lấy idea theo ID
   */
  async getIdeaById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);

      if (isNaN(id)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid idea ID',
        });
      }

      const idea = await ideasService.getIdeaById(id);

      if (!idea) {
        return reply.status(404).send({
          success: false,
          error: 'Idea not found',
        });
      }

      return reply.send({
        success: true,
        data: idea,
      });
    } catch (error) {
      console.error('Error getting idea:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch idea',
      });
    }
  }

  /**
   * DELETE /api/ideas/:id - Xóa idea
   */
  async deleteIdea(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);

      if (isNaN(id)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid idea ID',
        });
      }

      const deleted = await ideasService.deleteIdea(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Idea not found',
        });
      }

      return reply.send({
        success: true,
        message: 'Idea deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting idea:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete idea',
      });
    }
  }

  /**
   * POST /api/ideas/bulk-delete - Xóa nhiều ideas cùng lúc
   * Body: { ids: number[] }
   */
  async bulkDeleteIdeas(
    request: FastifyRequest<{ Body: { ids: number[] } }>,
    reply: FastifyReply
  ) {
    try {
      const { ids } = request.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'ids array is required and must not be empty',
        });
      }

      const deletedCount = await ideasService.deleteManyIdeas(ids);

      return reply.send({
        success: true,
        message: `Successfully deleted ${deletedCount} idea(s)`,
        deletedCount,
      });
    } catch (error) {
      console.error('Error bulk deleting ideas:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete ideas',
      });
    }
  }

  /**
   * POST /api/ideas/generate - Generate ideas bằng AI
   * Input: { persona: string, industry: string, count?: number, provider?: string, model?: string, language?: string }
   */
  async generateIdeas(
    request: FastifyRequest<{
      Body: {
        persona: string;
        industry: string;
        count?: number;
        provider?: string;
        model?: string;
        language?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { persona, industry, count, provider, model, language } = request.body;

      // Debug log - CRITICAL for debugging count issue
      console.log('═══════════════════════════════════════════');
      console.log('📥 Request body:', JSON.stringify(request.body, null, 2));
      console.log('📊 Count value:', count, 'Type:', typeof count);
      console.log('═══════════════════════════════════════════');

      // Validate input
      if (!persona || !industry) {
        return reply.status(400).send({
          success: false,
          error: 'persona and industry are required',
        });
      }

      // Ensure count is a valid number between 1-10
      const validatedCount = (typeof count === 'number' && count >= 1 && count <= 10) 
        ? count 
        : 5; // Default to 5 if invalid

      console.log(`🎯 Generating ${validatedCount} ideas for persona: "${persona}", industry: "${industry}"`);

      // Gọi service để generate và lưu ideas - PASS validatedCount không phải count gốc
      const ideas = await ideasService.generateIdeas(
        persona,
        industry,
        validatedCount,  // FIX: Use validated count instead of raw count
        provider,
        model,
        language
      );

      return reply.send({
        success: true,
        data: ideas,
        count: ideas.length,
        message: `Successfully generated ${ideas.length} ideas`,
      });
    } catch (error) {
      console.error('Error generating ideas:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return reply.status(500).send({
        success: false,
        error: `Failed to generate ideas: ${errorMessage}`,
      });
    }
  }

  /**
   * PATCH /api/ideas/:id/status - Cập nhật status của idea
   * Body: { status: "shortlisted" | "approved" | "archived" }
   */
  async updateStatus(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { status: 'shortlisted' | 'approved' | 'archived' };
    }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      const { status } = request.body;

      if (isNaN(id)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid idea ID',
        });
      }

      const idea = await ideasService.updateStatus(id, status);

      if (!idea) {
        return reply.status(404).send({
          success: false,
          error: 'Idea not found',
        });
      }

      return reply.send({
        success: true,
        data: idea,
        message: `Idea status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update status',
      });
    }
  }

  /**
   * POST /api/ideas/:id/implementation - Generate implementation plan
   */
  async generateImplementation(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);

      if (isNaN(id)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid idea ID',
        });
      }

      console.log(`📋 Generating implementation for idea ${id}`);

      const idea = await ideasService.generateImplementation(id);

      if (!idea) {
        return reply.status(404).send({
          success: false,
          error: 'Idea not found',
        });
      }

      return reply.send({
        success: true,
        data: idea,
        message: 'Implementation plan generated successfully',
      });
    } catch (error) {
      console.error('Error generating implementation:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return reply.status(500).send({
        success: false,
        error: `Failed to generate implementation: ${errorMessage}`,
      });
    }
  }
}

// Export singleton instance
export const ideasController = new IdeasController();

/**
 * Derivatives Controller
 * 
 * Handles HTTP requests for content derivatives:
 * - POST /api/packs/derivatives - Generate derivatives
 * - GET /api/packs/:id/derivatives/export - Export derivatives
 * - GET /api/packs/:id/derivatives/versions - Get derivative versions
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { derivativeGenerator, ContentDerivatives } from '../services/derivativeGenerator.js';
import { packsService } from '../services/packs.service.js';

/**
 * Request body for generating derivatives
 */
interface GenerateDerivativesBody {
  pack_id: string;
  language?: string;
}

/**
 * Query params for export
 */
interface ExportQuery {
  format?: 'json' | 'md';
}

/**
 * DerivativesController class
 */
export class DerivativesController {
  /**
   * POST /api/packs/derivatives
   * Generate multi-platform derivatives from a pack's draft content
   * 
   * Body:
   *   - pack_id (required): UUID of the content pack
   *   - language (optional): Output language (vi, en, etc.)
   * 
   * Flow:
   *   1. Get pack by pack_id
   *   2. Extract draft_content
   *   3. Generate derivatives using LLM
   *   4. Save to derivatives JSONB column
   *   5. Save version to derivative_versions table
   *   6. Return derivatives
   */
  async generateDerivatives(
    request: FastifyRequest<{ Body: GenerateDerivativesBody }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id, language = 'vi' } = request.body;

      // Validate pack_id
      if (!pack_id) {
        return reply.status(400).send({
          success: false,
          error: 'pack_id is required',
        });
      }

      console.log(`🚀 Generating derivatives for pack ${pack_id}...`);

      // 1. Get pack from database
      const pack = await packsService.getPackById(pack_id);
      if (!pack) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      // 2. Check if draft_content exists
      if (!pack.draft_content || pack.draft_content.trim().length < 50) {
        return reply.status(400).send({
          success: false,
          error: 'Pack has no draft content or content is too short',
        });
      }

      // 3. Generate derivatives
      const derivatives = await derivativeGenerator.generateDerivativesFromDraft(
        pack.draft_content,
        { language }
      );

      // 4. Save derivatives to pack
      await derivativeGenerator.saveDerivatives(pack_id, derivatives);

      // 5. Save version for history (save all derivatives as one version)
      const versionId = await derivativeGenerator.saveDerivativeVersion(
        pack_id,
        'all',
        derivatives
      );

      console.log(`✅ Derivatives generated and saved for pack ${pack_id}`);

      return reply.send({
        success: true,
        data: {
          pack_id,
          derivatives,
          version_id: versionId,
        },
        message: 'Derivatives generated successfully',
      });

    } catch (error: any) {
      console.error('❌ Error generating derivatives:', error);
      
      // Handle specific errors
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        return reply.status(429).send({
          success: false,
          error: 'AI service rate limit exceeded. Please try again later.',
        });
      }

      if (error.message?.includes('too short')) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: `Failed to generate derivatives: ${error.message}`,
      });
    }
  }

  /**
   * GET /api/packs/:packId/derivatives
   * Get derivatives for a pack
   */
  async getDerivatives(
    request: FastifyRequest<{ Params: { packId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;

      // Get pack to verify it exists
      const pack = await packsService.getPackById(packId);
      if (!pack) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      // Get derivatives
      const derivatives = await derivativeGenerator.getDerivatives(packId);
      
      if (!derivatives) {
        return reply.send({
          success: true,
          data: null,
          message: 'No derivatives generated yet for this pack',
        });
      }

      return reply.send({
        success: true,
        data: {
          pack_id: packId,
          derivatives,
        },
      });

    } catch (error: any) {
      console.error('❌ Error getting derivatives:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get derivatives',
      });
    }
  }

  /**
   * GET /api/packs/:packId/derivatives/export
   * Export derivatives in JSON or Markdown format
   * 
   * Query params:
   *   - format: 'json' (default) or 'md'
   */
  async exportDerivatives(
    request: FastifyRequest<{ 
      Params: { packId: string };
      Querystring: ExportQuery;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const { format = 'json' } = request.query;

      // Get pack
      const pack = await packsService.getPackById(packId);
      if (!pack) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      // Get derivatives
      const derivatives = await derivativeGenerator.getDerivatives(packId);
      if (!derivatives) {
        return reply.status(404).send({
          success: false,
          error: 'No derivatives found for this pack',
        });
      }

      // Export based on format
      if (format === 'md') {
        const markdown = derivativeGenerator.derivativesToMarkdown(derivatives);
        
        reply.header('Content-Type', 'text/markdown; charset=utf-8');
        reply.header('Content-Disposition', `attachment; filename="derivatives-${packId}.md"`);
        
        return reply.send(markdown);
      }

      // Default: JSON format
      reply.header('Content-Type', 'application/json; charset=utf-8');
      reply.header('Content-Disposition', `attachment; filename="derivatives-${packId}.json"`);
      
      return reply.send({
        pack_id: packId,
        exported_at: new Date().toISOString(),
        derivatives,
      });

    } catch (error: any) {
      console.error('❌ Error exporting derivatives:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to export derivatives',
      });
    }
  }

  /**
   * GET /api/packs/:packId/derivatives/versions
   * Get derivative version history
   * 
   * Query params:
   *   - type: Filter by derivative type (optional)
   */
  async getDerivativeVersions(
    request: FastifyRequest<{
      Params: { packId: string };
      Querystring: { type?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const { type } = request.query;

      // Verify pack exists
      const pack = await packsService.getPackById(packId);
      if (!pack) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      // Get versions
      const versions = await derivativeGenerator.getDerivativeVersions(packId, type);

      return reply.send({
        success: true,
        data: versions,
        count: versions.length,
      });

    } catch (error: any) {
      console.error('❌ Error getting derivative versions:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get derivative versions',
      });
    }
  }

  /**
   * POST /api/packs/:packId/derivatives/regenerate
   * Regenerate a specific derivative type
   * 
   * Body:
   *   - type: Derivative type to regenerate (twitter_thread, linkedin, etc.)
   *   - language: Output language (optional)
   */
  async regenerateDerivative(
    request: FastifyRequest<{
      Params: { packId: string };
      Body: { type: keyof ContentDerivatives; language?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const { type, language = 'vi' } = request.body;

      const validTypes = ['twitter_thread', 'linkedin', 'email', 'blog_summary', 'seo_description'];
      if (!validTypes.includes(type)) {
        return reply.status(400).send({
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        });
      }

      // Get pack
      const pack = await packsService.getPackById(packId);
      if (!pack) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      if (!pack.draft_content) {
        return reply.status(400).send({
          success: false,
          error: 'Pack has no draft content',
        });
      }

      // Generate all derivatives (LLM generates all at once)
      const derivatives = await derivativeGenerator.generateDerivativesFromDraft(
        pack.draft_content,
        { language }
      );

      // Get existing derivatives and merge
      const existingDerivatives = await derivativeGenerator.getDerivatives(packId);
      const merged: ContentDerivatives = {
        ...existingDerivatives,
        [type]: derivatives[type],
      } as ContentDerivatives;

      // Save merged derivatives
      await derivativeGenerator.saveDerivatives(packId, merged);

      // Save version for this specific type
      await derivativeGenerator.saveDerivativeVersion(packId, type, derivatives[type]);

      return reply.send({
        success: true,
        data: {
          pack_id: packId,
          type,
          content: derivatives[type],
        },
        message: `${type} regenerated successfully`,
      });

    } catch (error: any) {
      console.error('❌ Error regenerating derivative:', error);
      return reply.status(500).send({
        success: false,
        error: `Failed to regenerate derivative: ${error.message}`,
      });
    }
  }
}

// Export singleton instance
export const derivativesController = new DerivativesController();


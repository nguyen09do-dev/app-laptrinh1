import { FastifyRequest, FastifyReply } from 'fastify';
import { derivativeGenerator } from '../services/derivativeGenerator.js';
import { db } from '../lib/db.js';

/**
 * DerivativesController - Handle HTTP requests for multi-platform derivatives
 */
export class DerivativesController {
  /**
   * POST /api/packs/derivatives
   * Generate multi-platform derivatives from a pack's draft content
   */
  async generateDerivatives(
    request: FastifyRequest<{
      Body: {
        pack_id: string;
        language?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id, language = 'vi' } = request.body;

      // Get pack draft content
      const packResult = await db.query(
        `SELECT pack_id, title, draft_content FROM content_packs WHERE pack_id = $1`,
        [pack_id]
      );

      if (!packResult.rows[0]) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      const pack = packResult.rows[0];

      if (!pack.draft_content || pack.draft_content.trim().length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Pack has no draft content to generate derivatives from',
        });
      }

      console.log(`🚀 Generating derivatives for pack: ${pack.title}`);

      // Generate derivatives
      const derivatives = await derivativeGenerator.generateDerivativesFromDraft(
        pack.draft_content,
        { language }
      );

      // Save to database
      await derivativeGenerator.saveDerivatives(pack_id, derivatives);

      // Save version history for each derivative type
      const versionId = await derivativeGenerator.saveDerivativeVersion(
        pack_id,
        'all',
        derivatives
      );

      return reply.send({
        success: true,
        data: {
          derivatives,
          version_id: versionId,
        },
        message: 'Derivatives generated successfully',
      });
    } catch (error: any) {
      console.error('Error generating derivatives:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to generate derivatives',
      });
    }
  }

  /**
   * GET /api/packs/:packId/derivatives
   * Get derivatives for a pack
   */
  async getDerivatives(
    request: FastifyRequest<{
      Params: {
        packId: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;

      const derivatives = await derivativeGenerator.getDerivatives(packId);

      if (!derivatives) {
        return reply.status(404).send({
          success: false,
          error: 'No derivatives found for this pack',
        });
      }

      return reply.send({
        success: true,
        data: derivatives,
      });
    } catch (error: any) {
      console.error('Error getting derivatives:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get derivatives',
      });
    }
  }

  /**
   * GET /api/packs/:packId/derivatives/export
   * Export derivatives in JSON or Markdown format
   */
  async exportDerivatives(
    request: FastifyRequest<{
      Params: {
        packId: string;
      };
      Querystring: {
        format?: 'json' | 'md';
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const { format = 'json' } = request.query;

      const derivatives = await derivativeGenerator.getDerivatives(packId);

      if (!derivatives) {
        return reply.status(404).send({
          success: false,
          error: 'No derivatives found for this pack',
        });
      }

      if (format === 'md') {
        const markdown = derivativeGenerator.exportAsMarkdown(derivatives);
        reply.header('Content-Type', 'text/markdown');
        reply.header('Content-Disposition', `attachment; filename="derivatives-${packId}.md"`);
        return reply.send(markdown);
      }

      // JSON format
      reply.header('Content-Type', 'application/json');
      reply.header('Content-Disposition', `attachment; filename="derivatives-${packId}.json"`);
      return reply.send({
        success: true,
        data: derivatives,
      });
    } catch (error: any) {
      console.error('Error exporting derivatives:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to export derivatives',
      });
    }
  }

  /**
   * GET /api/packs/:packId/derivatives/versions
   * Get derivative version history
   */
  async getDerivativeVersions(
    request: FastifyRequest<{
      Params: {
        packId: string;
      };
      Querystring: {
        type?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const { type } = request.query;

      const versions = await derivativeGenerator.getDerivativeVersions(
        packId,
        type && type !== 'all' ? type : undefined
      );

      return reply.send({
        success: true,
        data: versions,
        count: versions.length,
      });
    } catch (error: any) {
      console.error('Error getting derivative versions:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get derivative versions',
      });
    }
  }

  /**
   * POST /api/packs/:packId/derivatives/regenerate
   * Regenerate a specific derivative type
   */
  async regenerateDerivative(
    request: FastifyRequest<{
      Params: {
        packId: string;
      };
      Body: {
        type: 'twitter_thread' | 'linkedin' | 'email' | 'blog_summary' | 'seo_description';
        language?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { packId } = request.params;
      const { type, language = 'vi' } = request.body;

      // Get pack draft content
      const packResult = await db.query(
        `SELECT draft_content FROM content_packs WHERE pack_id = $1`,
        [packId]
      );

      if (!packResult.rows[0]) {
        return reply.status(404).send({
          success: false,
          error: 'Content pack not found',
        });
      }

      const pack = packResult.rows[0];

      if (!pack.draft_content || pack.draft_content.trim().length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Pack has no draft content',
        });
      }

      console.log(`🔄 Regenerating ${type} derivative...`);

      // Generate all derivatives first (since we can't generate just one)
      const derivatives = await derivativeGenerator.generateDerivativesFromDraft(
        pack.draft_content,
        { language }
      );

      // Get current derivatives
      const currentDerivatives = await derivativeGenerator.getDerivatives(packId);

      // Merge: update only the requested type
      const updatedDerivatives = {
        ...currentDerivatives,
        [type]: derivatives[type],
      };

      // Save updated derivatives
      await derivativeGenerator.saveDerivatives(packId, updatedDerivatives);

      // Save version history for this specific type
      const versionId = await derivativeGenerator.saveDerivativeVersion(
        packId,
        type,
        derivatives[type]
      );

      return reply.send({
        success: true,
        data: {
          type,
          content: derivatives[type],
          version_id: versionId,
        },
        message: `${type} regenerated successfully`,
      });
    } catch (error: any) {
      console.error('Error regenerating derivative:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to regenerate derivative',
      });
    }
  }
}

// Export singleton instance
export const derivativesController = new DerivativesController();

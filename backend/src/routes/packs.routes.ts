import { FastifyInstance } from 'fastify';
import { packsController } from '../controllers/packs.controller.js';
import { derivativesController } from '../controllers/derivatives.controller.js';

/**
 * Packs Routes - Endpoints for managing content packs
 * Includes SSE streaming endpoint for draft generation
 * Includes Multi-platform Derivatives endpoints
 */
export async function packsRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/packs
   * Get all content packs
   */
  fastify.get('/packs', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            count: { type: 'number' },
          },
        },
      },
    },
    handler: packsController.getAllPacks.bind(packsController),
  });

  /**
   * GET /api/packs/:packId
   * Get content pack by ID
   */
  fastify.get('/packs/:packId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
    },
    handler: packsController.getPackById.bind(packsController),
  });

  /**
   * POST /api/packs/draft
   * Generate draft content with SSE streaming
   *
   * Body:
   *   - pack_id (optional): UUID for the pack, generates new if not provided
   *   - brief_id (required): ID of the brief to generate from
   *   - audience (optional): Custom audience override
   *
   * Response: Server-Sent Events (SSE) stream
   */
  fastify.post('/packs/draft', {
    schema: {
      body: {
        type: 'object',
        properties: {
          pack_id: { type: 'string', format: 'uuid' },
          brief_id: { type: 'number' },
          audience: { type: 'string' },
        },
        required: ['brief_id'],
      },
    },
    handler: packsController.generateDraft.bind(packsController),
  });

  /**
   * POST /api/packs/from-brief/:briefId
   * Generate draft pack from brief (non-streaming, returns JSON)
   * Body: { wordCount?: number; style?: string; useRAG?: boolean; searchFilters?: {...} }
   */
  fastify.post('/packs/from-brief/:briefId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          briefId: { type: 'string' },
        },
        required: ['briefId'],
      },
      body: {
        type: 'object',
        properties: {
          wordCount: { type: 'number' },
          style: { type: 'string' },
          useRAG: { type: 'boolean' },
          searchFilters: { type: 'object' },
        },
      },
    },
    handler: packsController.generateDraftFromBrief.bind(packsController),
  });

  /**
   * PATCH /api/packs/:packId/status
   * Update pack status
   */
  fastify.patch('/packs/:packId/status', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
      body: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['draft', 'review', 'approved', 'published'],
          },
        },
        required: ['status'],
      },
    },
    handler: packsController.updatePackStatus.bind(packsController),
  });

  /**
   * PUT /api/packs/:packId
   * Update draft content
   */
  fastify.put('/packs/:packId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
      body: {
        type: 'object',
        properties: {
          draft_content: { type: 'string' },
        },
        required: ['draft_content'],
      },
    },
    handler: packsController.updateDraftContent.bind(packsController),
  });

  /**
   * DELETE /api/packs/:packId
   * Delete content pack
   */
  fastify.delete('/packs/:packId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
    },
    handler: packsController.deletePack.bind(packsController),
  });

  /**
   * POST /api/packs/update-status
   * Update pack status with state machine validation
   * 
   * Body:
   *   - pack_id (required): UUID of the pack
   *   - status (required): Target status
   */
  fastify.post('/packs/update-status', {
    schema: {
      body: {
        type: 'object',
        properties: {
          pack_id: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: ['draft', 'review', 'approved', 'published'],
          },
        },
        required: ['pack_id', 'status'],
      },
    },
    handler: packsController.updateStatusWithValidation.bind(packsController),
  });

  /**
   * GET /api/packs/:packId/allowed-statuses
   * Get allowed status transitions for a pack
   */
  fastify.get('/packs/:packId/allowed-statuses', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
    },
    handler: packsController.getAllowedStatuses.bind(packsController),
  });

  // ==========================================
  // DERIVATIVES ENDPOINTS
  // Multi-platform content derivatives
  // ==========================================

  /**
   * POST /api/packs/derivatives
   * Generate multi-platform derivatives from a pack's draft content
   * 
   * Body:
   *   - pack_id (required): UUID of the content pack
   *   - language (optional): Output language (vi, en, etc.)
   * 
   * Generates:
   *   - twitter_thread: 10 tweets
   *   - linkedin: LinkedIn post
   *   - email: Email newsletter
   *   - blog_summary: ~200 word summary
   *   - seo_description: Short SEO description
   */
  fastify.post('/packs/derivatives', {
    schema: {
      body: {
        type: 'object',
        properties: {
          pack_id: { type: 'string', format: 'uuid' },
          language: { type: 'string', default: 'vi' },
        },
        required: ['pack_id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                pack_id: { type: 'string' },
                derivatives: {
                  type: 'object',
                  properties: {
                    twitter_thread: { type: 'array', items: { type: 'string' } },
                    linkedin: { type: 'string' },
                    email: { type: 'string' },
                    blog_summary: { type: 'string' },
                    seo_description: { type: 'string' },
                  },
                },
                version_id: { type: 'string' },
              },
            },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: derivativesController.generateDerivatives.bind(derivativesController),
  });

  /**
   * GET /api/packs/:packId/derivatives
   * Get derivatives for a pack
   */
  fastify.get('/packs/:packId/derivatives', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
    },
    handler: derivativesController.getDerivatives.bind(derivativesController),
  });

  /**
   * GET /api/packs/:packId/derivatives/export
   * Export derivatives in JSON or Markdown format
   * 
   * Query params:
   *   - format: 'json' (default) or 'md'
   */
  fastify.get('/packs/:packId/derivatives/export', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'md'], default: 'json' },
        },
      },
    },
    handler: derivativesController.exportDerivatives.bind(derivativesController),
  });

  /**
   * GET /api/packs/:packId/derivatives/versions
   * Get derivative version history
   * 
   * Query params:
   *   - type: Filter by derivative type (optional)
   */
  fastify.get('/packs/:packId/derivatives/versions', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
      querystring: {
        type: 'object',
        properties: {
          type: { 
            type: 'string', 
            enum: ['twitter_thread', 'linkedin', 'email', 'blog_summary', 'seo_description', 'all'],
          },
        },
      },
    },
    handler: derivativesController.getDerivativeVersions.bind(derivativesController),
  });

  /**
   * POST /api/packs/:packId/derivatives/regenerate
   * Regenerate a specific derivative type
   * 
   * Body:
   *   - type: Derivative type to regenerate
   *   - language: Output language (optional)
   */
  fastify.post('/packs/:packId/derivatives/regenerate', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
      body: {
        type: 'object',
        properties: {
          type: { 
            type: 'string',
            enum: ['twitter_thread', 'linkedin', 'email', 'blog_summary', 'seo_description'],
          },
          language: { type: 'string', default: 'vi' },
        },
        required: ['type'],
      },
    },
    handler: derivativesController.regenerateDerivative.bind(derivativesController),
  });
}


import { FastifyInstance } from 'fastify';
import { packsController } from '../controllers/packs.controller.js';

/**
 * Packs Routes - Endpoints for managing content packs
 * Includes SSE streaming endpoint for draft generation
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
}


import { FastifyInstance } from 'fastify';
import { briefsController } from '../controllers/briefs.controller.js';

/**
 * Briefs Routes - Endpoints for managing content briefs
 */
export async function briefsRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/briefs
   * Get all briefs
   */
  fastify.get('/briefs', {
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
    handler: briefsController.getAllBriefs.bind(briefsController),
  });

  /**
   * GET /api/briefs/:id
   * Get brief by ID
   */
  fastify.get('/briefs/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: briefsController.getBriefById.bind(briefsController),
  });

  /**
   * POST /api/briefs/from-idea/:ideaId
   * Create brief from approved idea
   */
  fastify.post('/briefs/from-idea/:ideaId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          ideaId: { type: 'string' },
        },
        required: ['ideaId'],
      },
    },
    handler: briefsController.createBriefFromIdea.bind(briefsController),
  });

  /**
   * DELETE /api/briefs/:id
   * Delete brief
   */
  fastify.delete('/briefs/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: briefsController.deleteBrief.bind(briefsController),
  });
}

import { FastifyInstance } from 'fastify';
import { contentsController } from '../controllers/contents.controller.js';

export async function contentsRoutes(fastify: FastifyInstance) {
  fastify.get('/contents', {
    handler: contentsController.getAllContents.bind(contentsController),
  });

  fastify.get('/contents/:id', {
    handler: contentsController.getContentById.bind(contentsController),
  });

  fastify.post('/contents/from-brief/:briefId', {
    handler: contentsController.generateContentFromBrief.bind(contentsController),
  });

  /**
   * POST /api/contents/from-pack/:packId
   * Convert a published content pack to content
   */
  fastify.post('/contents/from-pack/:packId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          packId: { type: 'string', format: 'uuid' },
        },
        required: ['packId'],
      },
    },
    handler: contentsController.createContentFromPack.bind(contentsController),
  });

  fastify.delete('/contents/:id', {
    handler: contentsController.deleteContent.bind(contentsController),
  });
}

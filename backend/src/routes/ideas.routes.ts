import { FastifyInstance } from 'fastify';
import { ideasController } from '../controllers/ideas.controller.js';
import {
  generateRequestSchema,
  updateStatusSchema,
} from '../schema/ideaGenerate.schema.js';

/**
 * Ideas Routes - Định nghĩa tất cả endpoints cho Ideas API
 * AI-only flow: chỉ hỗ trợ generate từ AI và quản lý status
 */
export async function ideasRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/ideas
   * Lấy danh sách tất cả ideas
   */
  fastify.get('/ideas', {
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
    handler: ideasController.getAllIdeas.bind(ideasController),
  });

  /**
   * GET /api/ideas/:id
   * Lấy idea theo ID
   */
  fastify.get('/ideas/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: ideasController.getIdeaById.bind(ideasController),
  });

  /**
   * DELETE /api/ideas/:id
   * Xóa idea
   */
  fastify.delete('/ideas/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: ideasController.deleteIdea.bind(ideasController),
  });

  /**
   * POST /api/ideas/generate
   * Generate ideas bằng AI
   * ⚠️ Endpoint này phải đặt TRƯỚC /api/ideas/:id để tránh conflict
   */
  fastify.post('/ideas/generate', {
    schema: {
      body: generateRequestSchema,
    },
    handler: ideasController.generateIdeas.bind(ideasController),
  });

  /**
   * PATCH /api/ideas/:id/status
   * Cập nhật status của idea
   */
  fastify.patch('/ideas/:id/status', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: updateStatusSchema,
    },
    handler: ideasController.updateStatus.bind(ideasController),
  });

  /**
   * POST /api/ideas/:id/implementation
   * Generate implementation plan cho idea
   */
  fastify.post('/ideas/:id/implementation', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: ideasController.generateImplementation.bind(ideasController),
  });
}

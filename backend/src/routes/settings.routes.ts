import { FastifyInstance } from 'fastify';
import { settingsController } from '../controllers/settings.controller.js';

/**
 * Settings Routes - Định nghĩa tất cả endpoints cho Settings API
 */
export async function settingsRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/settings
   * Lấy tất cả settings
   */
  fastify.get('/settings', {
    handler: settingsController.getSettings.bind(settingsController),
  });

  /**
   * PUT /api/settings
   * Cập nhật settings
   */
  fastify.put('/settings', {
    schema: {
      body: {
        type: 'object',
        properties: {
          ai: {
            type: 'object',
            properties: {
              defaultProvider: { type: 'string' },
              defaultModel: { type: 'string' },
              temperature: { type: 'number' },
              maxTokens: { type: 'number' },
            },
          },
          content: {
            type: 'object',
            properties: {
              defaultLanguage: { type: 'string' },
              defaultWordCount: { type: 'number' },
              defaultFormat: { type: 'string' },
            },
          },
          notifications: {
            type: 'object',
            properties: {
              emailEnabled: { type: 'boolean' },
              emailAddress: { type: 'string' },
            },
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: settingsController.updateSettings.bind(settingsController),
  });

  /**
   * GET /api/settings/system-info
   * Lấy thông tin hệ thống
   */
  fastify.get('/settings/system-info', {
    handler: settingsController.getSystemInfo.bind(settingsController),
  });
}


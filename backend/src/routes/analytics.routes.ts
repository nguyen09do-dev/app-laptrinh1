import { FastifyInstance } from 'fastify';
import { analyticsController } from '../controllers/analytics.controller.js';

/**
 * Analytics Routes - Định nghĩa tất cả endpoints cho Analytics API
 */
export async function analyticsRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/analytics/overview
   * Lấy tổng quan analytics
   */
  fastify.get('/analytics/overview', {
    handler: analyticsController.getOverview.bind(analyticsController),
  });

  /**
   * GET /api/analytics/timeline
   * Lấy thống kê theo thời gian
   */
  fastify.get('/analytics/timeline', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          days: { type: 'string' },
        },
      },
    },
    handler: analyticsController.getTimeline.bind(analyticsController),
  });

  /**
   * GET /api/analytics/persona-industry
   * Lấy thống kê theo persona và industry
   */
  fastify.get('/analytics/persona-industry', {
    handler: analyticsController.getPersonaIndustry.bind(analyticsController),
  });

  /**
   * GET /api/analytics/content-performance
   * Lấy thống kê về content performance
   */
  fastify.get('/analytics/content-performance', {
    handler: analyticsController.getContentPerformance.bind(analyticsController),
  });

  /**
   * GET /api/analytics/productivity
   * Lấy productivity metrics
   */
  fastify.get('/analytics/productivity', {
    handler: analyticsController.getProductivity.bind(analyticsController),
  });
}


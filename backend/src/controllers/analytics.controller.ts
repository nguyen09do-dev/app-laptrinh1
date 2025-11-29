import { FastifyRequest, FastifyReply } from 'fastify';
import { analyticsService } from '../services/analytics.service.js';

/**
 * AnalyticsController - Xử lý HTTP requests cho analytics
 */
export class AnalyticsController {
  /**
   * GET /api/analytics/overview - Lấy tổng quan analytics
   */
  async getOverview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const overview = await analyticsService.getOverview();
      return reply.send({
        success: true,
        data: overview,
      });
    } catch (error) {
      console.error('Error getting analytics overview:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch analytics overview',
      });
    }
  }

  /**
   * GET /api/analytics/timeline - Lấy thống kê theo thời gian
   */
  async getTimeline(
    request: FastifyRequest<{ Querystring: { days?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const days = request.query.days ? parseInt(request.query.days) : 30;
      const timeline = await analyticsService.getTimelineStats(days);
      return reply.send({
        success: true,
        data: timeline,
      });
    } catch (error) {
      console.error('Error getting timeline stats:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch timeline stats',
      });
    }
  }

  /**
   * GET /api/analytics/persona-industry - Lấy thống kê theo persona và industry
   */
  async getPersonaIndustry(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await analyticsService.getPersonaIndustryStats();
      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting persona/industry stats:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch persona/industry stats',
      });
    }
  }

  /**
   * GET /api/analytics/content-performance - Lấy thống kê về content performance
   */
  async getContentPerformance(request: FastifyRequest, reply: FastifyReply) {
    try {
      const performance = await analyticsService.getContentPerformance();
      return reply.send({
        success: true,
        data: performance,
      });
    } catch (error) {
      console.error('Error getting content performance:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch content performance',
      });
    }
  }

  /**
   * GET /api/analytics/productivity - Lấy productivity metrics
   */
  async getProductivity(request: FastifyRequest, reply: FastifyReply) {
    try {
      const metrics = await analyticsService.getProductivityMetrics();
      return reply.send({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error('Error getting productivity metrics:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch productivity metrics',
      });
    }
  }
}

export const analyticsController = new AnalyticsController();


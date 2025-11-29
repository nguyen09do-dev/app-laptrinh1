import { FastifyRequest, FastifyReply } from 'fastify';
import { settingsService, SystemSettings } from '../services/settings.service.js';

/**
 * SettingsController - Xử lý HTTP requests cho settings
 */
export class SettingsController {
  /**
   * GET /api/settings - Lấy tất cả settings
   */
  async getSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const settings = await settingsService.getSettings();
      return reply.send({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error('Error getting settings:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch settings',
      });
    }
  }

  /**
   * PUT /api/settings - Cập nhật settings
   */
  async updateSettings(
    request: FastifyRequest<{ Body: Partial<SystemSettings> }>,
    reply: FastifyReply
  ) {
    try {
      const updated = await settingsService.updateSettings(request.body);
      return reply.send({
        success: true,
        data: updated,
        message: 'Settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update settings',
      });
    }
  }

  /**
   * GET /api/settings/system-info - Lấy thông tin hệ thống
   */
  async getSystemInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const info = await settingsService.getSystemInfo();
      return reply.send({
        success: true,
        data: info,
      });
    } catch (error) {
      console.error('Error getting system info:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch system info',
      });
    }
  }
}

export const settingsController = new SettingsController();


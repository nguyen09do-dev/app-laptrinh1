import { FastifyInstance } from 'fastify';
import { integrationsController } from '../controllers/integrations.controller.js';

/**
 * Integrations Routes - Endpoints for third-party integrations
 * Supports Mailchimp and WordPress publishing
 */
export async function integrationsRoutes(fastify: FastifyInstance) {
  // ==========================================
  // MAILCHIMP INTEGRATION
  // ==========================================

  /**
   * POST /api/integrations/mailchimp/save
   * Save Mailchimp API credentials
   *
   * Body:
   *   - apiKey: Mailchimp API key
   *   - serverPrefix: Server prefix (e.g., 'us1')
   *   - audienceListId: Audience/List ID
   */
  fastify.post('/integrations/mailchimp/save', {
    schema: {
      body: {
        type: 'object',
        properties: {
          apiKey: { type: 'string' },
          serverPrefix: { type: 'string' },
          audienceListId: { type: 'string' },
        },
        required: ['apiKey', 'serverPrefix', 'audienceListId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            platform: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: integrationsController.saveMailchimpCredentials.bind(integrationsController),
  });

  /**
   * POST /api/integrations/mailchimp/test
   * Test Mailchimp connection using saved credentials
   */
  fastify.post('/integrations/mailchimp/test', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            platform: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: integrationsController.testMailchimpCredentials.bind(integrationsController),
  });

  /**
   * POST /api/integrations/mailchimp/publish
   * Publish email newsletter to Mailchimp
   *
   * Body:
   *   - pack_id: UUID of the content pack
   *
   * Flow:
   *   1. Load pack derivatives
   *   2. Load Mailchimp credentials
   *   3. Create and send campaign
   *
   * Response:
   *   - campaignId: Mailchimp campaign ID
   *   - sent: true/false
   */
  fastify.post('/integrations/mailchimp/publish', {
    schema: {
      body: {
        type: 'object',
        properties: {
          pack_id: { type: 'string', format: 'uuid' },
        },
        required: ['pack_id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            platform: { type: 'string' },
            campaignId: { type: 'string' },
            sent: { type: 'boolean' },
          },
        },
      },
    },
    handler: integrationsController.publishToMailchimp.bind(integrationsController),
  });

  // ==========================================
  // WORDPRESS INTEGRATION
  // ==========================================

  /**
   * POST /api/integrations/wordpress/save
   * Save WordPress credentials
   *
   * Body:
   *   - siteUrl: WordPress site URL
   *   - username: WordPress username
   *   - applicationPassword: Application password
   */
  fastify.post('/integrations/wordpress/save', {
    schema: {
      body: {
        type: 'object',
        properties: {
          siteUrl: { type: 'string' },
          username: { type: 'string' },
          applicationPassword: { type: 'string' },
        },
        required: ['siteUrl', 'username', 'applicationPassword'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            platform: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: integrationsController.saveWordpressCredentials.bind(integrationsController),
  });

  /**
   * POST /api/integrations/wordpress/test
   * Test WordPress connection using saved credentials
   */
  fastify.post('/integrations/wordpress/test', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            platform: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: integrationsController.testWordpressCredentials.bind(integrationsController),
  });

  /**
   * POST /api/integrations/wordpress/publish
   * Publish blog post to WordPress
   *
   * Body:
   *   - pack_id: UUID of the content pack
   *
   * Flow:
   *   1. Load pack derivatives
   *   2. Load WordPress credentials
   *   3. Create blog post
   *
   * Response:
   *   - postId: WordPress post ID
   *   - url: URL of the created post
   */
  fastify.post('/integrations/wordpress/publish', {
    schema: {
      body: {
        type: 'object',
        properties: {
          pack_id: { type: 'string', format: 'uuid' },
        },
        required: ['pack_id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            platform: { type: 'string' },
            postId: { type: 'number' },
            url: { type: 'string' },
          },
        },
      },
    },
    handler: integrationsController.publishToWordpress.bind(integrationsController),
  });
}

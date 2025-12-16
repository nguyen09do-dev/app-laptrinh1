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
   * GET /api/integrations/mailchimp
   * Get Mailchimp credentials (masked)
   */
  fastify.get('/integrations/mailchimp', {
    handler: integrationsController.getMailchimpConfig.bind(integrationsController),
  });

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
          content_id: { type: 'integer' },
        },
        anyOf: [{ required: ['pack_id'] }, { required: ['content_id'] }],
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

  // ==========================================
  // FACEBOOK INTEGRATION
  // ==========================================

  // GET Facebook config
  fastify.get('/integrations/facebook', {
    handler: integrationsController.getFacebookConfig.bind(integrationsController),
  });

  // POST Facebook config (save)
  fastify.post('/integrations/facebook', {
    handler: integrationsController.saveFacebookCredentials.bind(integrationsController),
  });

  // Legacy route for backward compatibility
  fastify.post('/integrations/facebook/save', {
    handler: integrationsController.saveFacebookCredentials.bind(integrationsController),
  });

  // Test Facebook connection
  fastify.post('/integrations/facebook/test', {
    handler: integrationsController.testFacebookConfig.bind(integrationsController),
  });

  fastify.post('/integrations/facebook/publish', {
    handler: integrationsController.publishToFacebookEndpoint.bind(integrationsController),
  });

  // ==========================================
  // INSTAGRAM INTEGRATION
  // ==========================================

  fastify.post('/integrations/instagram/save', {
    handler: integrationsController.saveInstagramCredentials.bind(integrationsController),
  });

  fastify.post('/integrations/instagram/test', {
    handler: integrationsController.testInstagramConfig.bind(integrationsController),
  });

  // ==========================================
  // TWITTER INTEGRATION
  // ==========================================

  fastify.post('/integrations/twitter/save', {
    handler: integrationsController.saveTwitterCredentials.bind(integrationsController),
  });

  fastify.post('/integrations/twitter/test', {
    handler: integrationsController.testTwitterConfig.bind(integrationsController),
  });

  fastify.post('/integrations/twitter/publish', {
    handler: integrationsController.publishToTwitterEndpoint.bind(integrationsController),
  });

  // ==========================================
  // LINKEDIN INTEGRATION
  // ==========================================

  fastify.post('/integrations/linkedin/save', {
    handler: integrationsController.saveLinkedInCredentials.bind(integrationsController),
  });

  fastify.post('/integrations/linkedin/test', {
    handler: integrationsController.testLinkedInConfig.bind(integrationsController),
  });

  fastify.post('/integrations/linkedin/publish', {
    handler: integrationsController.publishToLinkedInEndpoint.bind(integrationsController),
  });

  // ==========================================
  // ZALO INTEGRATION
  // ==========================================

  fastify.post('/integrations/zalo/save', {
    handler: integrationsController.saveZaloCredentials.bind(integrationsController),
  });

  fastify.post('/integrations/zalo/test', {
    handler: integrationsController.testZaloConfig.bind(integrationsController),
  });

  fastify.post('/integrations/zalo/publish', {
    handler: integrationsController.publishToZaloEndpoint.bind(integrationsController),
  });
}

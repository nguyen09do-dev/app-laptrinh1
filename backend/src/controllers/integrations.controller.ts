import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../lib/db.js';
import {
  validateMailchimpConfig,
  testMailchimpConnection,
  publishToMailchimp,
} from '../services/mailchimp.service.js';
import {
  validateWordpressConfig,
  testWordpressConnection,
  publishToWordpress,
} from '../services/wordpress.service.js';

/**
 * IntegrationsController - Handle HTTP requests for third-party integrations
 * Supports Mailchimp and WordPress integrations
 */
export class IntegrationsController {
  // ==========================================
  // MAILCHIMP ENDPOINTS
  // ==========================================

  /**
   * POST /api/integrations/mailchimp/save
   * Save Mailchimp credentials
   */
  async saveMailchimpCredentials(
    request: FastifyRequest<{
      Body: {
        apiKey: string;
        serverPrefix: string;
        audienceListId: string;
        fromName: string;
        fromEmail: string;
        replyToEmail: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { apiKey, serverPrefix, audienceListId, fromName, fromEmail, replyToEmail } = request.body;

      // Auto-split API key if it contains datacenter suffix (e.g., "key-us12" -> "key" + "us12")
      let finalApiKey = apiKey.trim();
      let finalServerPrefix = serverPrefix.trim();

      if (finalApiKey.includes('-') && !finalServerPrefix) {
        const parts = finalApiKey.split('-');
        if (parts.length >= 2) {
          const lastPart = parts[parts.length - 1];
          // Check if last part looks like a datacenter (e.g., us1, us12, eu1)
          if (/^[a-z]{2}\d+$/.test(lastPart)) {
            finalServerPrefix = lastPart;
            finalApiKey = parts.slice(0, -1).join('-');
            console.log(`ℹ️ Auto-detected server prefix "${finalServerPrefix}" from API key`);
          }
        }
      }

      // Validate config
      const validation = validateMailchimpConfig({ 
        apiKey: finalApiKey, 
        serverPrefix: finalServerPrefix, 
        audienceListId,
        fromName,
        fromEmail,
        replyToEmail
      });
      if (!validation.valid) {
        return reply.status(400).send({
          success: false,
          platform: 'mailchimp',
          error: {
            message: 'Invalid configuration',
            details: validation.errors,
          },
        });
      }

      // Prepare config
      const config = {
        apiKey: finalApiKey,
        serverPrefix: finalServerPrefix,
        audienceListId,
        fromName,
        fromEmail,
        replyToEmail,
      };

      // Insert or update credentials
      await db.query(
        `INSERT INTO integration_credentials (platform, config)
         VALUES ('mailchimp', $1)
         ON CONFLICT (platform)
         DO UPDATE SET config = $1, updated_at = NOW()`,
        [JSON.stringify(config)]
      );

      console.log('✅ Mailchimp credentials saved');

      // Optionally test connection after saving
      const testResult = await testMailchimpConnection(config);
      if (!testResult.success) {
        console.warn('⚠️ Mailchimp credentials saved but connection test failed:', testResult.error);
        // Still return success, but include warning
        return reply.send({
          success: true,
          platform: 'mailchimp',
          message: 'Credentials saved successfully',
          warning: testResult.error,
        });
      }

      return reply.send({
        success: true,
        platform: 'mailchimp',
        message: 'Credentials saved and connection verified',
      });
    } catch (error: any) {
      console.error('❌ Error saving Mailchimp credentials:', error);
      return reply.status(500).send({
        success: false,
        platform: 'mailchimp',
        error: {
          message: 'Failed to save credentials',
          details: error.message,
        },
      });
    }
  }

  /**
   * POST /api/integrations/mailchimp/test
   * Test Mailchimp connection
   */
  async testMailchimpCredentials(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      // Load credentials from database
      const result = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'mailchimp'`
      );

      if (result.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          platform: 'mailchimp',
          error: {
            message: 'Missing credentials',
            details: 'Please save Mailchimp credentials first',
          },
        });
      }

      const config = result.rows[0].config;

      // Test connection
      const testResult = await testMailchimpConnection(config);

      if (testResult.success) {
        return reply.send({
          success: true,
          platform: 'mailchimp',
          message: 'Connection successful',
        });
      } else {
        return reply.status(400).send({
          success: false,
          platform: 'mailchimp',
          error: {
            message: 'Connection failed',
            details: testResult.error,
          },
        });
      }
    } catch (error: any) {
      console.error('❌ Error testing Mailchimp connection:', error);
      return reply.status(500).send({
        success: false,
        platform: 'mailchimp',
        error: {
          message: 'Failed to test connection',
          details: error.message,
        },
      });
    }
  }

  /**
   * POST /api/integrations/mailchimp/publish
   * Publish email newsletter to Mailchimp
   */
  async publishToMailchimp(
    request: FastifyRequest<{
      Body: {
        pack_id: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id } = request.body;

      if (!pack_id) {
        return reply.status(400).send({
          success: false,
          platform: 'mailchimp',
          error: {
            message: 'Missing pack_id',
          },
        });
      }

      // Load pack with derivatives
      const packResult = await db.query(
        `SELECT pack_id, draft_content, derivatives FROM content_packs WHERE pack_id = $1`,
        [pack_id]
      );

      if (packResult.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          platform: 'mailchimp',
          error: {
            message: 'Content pack not found',
          },
        });
      }

      const pack = packResult.rows[0];

      // Check if derivatives exist
      if (!pack.derivatives || !pack.derivatives.email) {
        return reply.status(400).send({
          success: false,
          platform: 'mailchimp',
          error: {
            message: 'No derivatives available',
            details: 'Please generate derivatives first',
          },
        });
      }

      // Load Mailchimp credentials
      const credResult = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'mailchimp'`
      );

      if (credResult.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          platform: 'mailchimp',
          error: {
            message: 'Missing credentials',
            details: 'Please save Mailchimp credentials first',
          },
        });
      }

      const config = credResult.rows[0].config;

      // Prepare payload from derivatives
      const emailContent = pack.derivatives.email;
      const payload = {
        subject: `Newsletter: ${pack.draft_content.substring(0, 50)}...`,
        title: `Content Pack ${pack_id.substring(0, 8)}`,
        content: emailContent,
      };

      // Publish to Mailchimp
      const publishResult = await publishToMailchimp(config, payload);

      if (publishResult.success) {
        return reply.send(publishResult);
      } else {
        return reply.status(400).send(publishResult);
      }
    } catch (error: any) {
      console.error('❌ Error publishing to Mailchimp:', error);
      return reply.status(500).send({
        success: false,
        platform: 'mailchimp',
        error: {
          message: 'Failed to publish',
          details: error.message,
        },
      });
    }
  }

  // ==========================================
  // WORDPRESS ENDPOINTS
  // ==========================================

  /**
   * POST /api/integrations/wordpress/save
   * Save WordPress credentials
   */
  async saveWordpressCredentials(
    request: FastifyRequest<{
      Body: {
        // Basic
        name: string;
        siteUrl: string;
        defaultCategory?: string;
        defaultStatus: 'draft' | 'publish' | 'pending' | 'private';
        // Authentication
        username: string;
        applicationPassword: string;
        // Advanced (optional)
        apiBasePath?: string;
        requestTimeoutMs?: number;
        rateLimitPerMinute?: number;
        verifySSL?: boolean;
        allowInsecureHttp?: boolean;
        contentFormat?: 'html' | 'blocks' | 'markdownToHtml';
        featureFlags?: {
          autoCreateCategories?: boolean;
          autoUploadFeaturedImage?: boolean;
        };
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const {
        name,
        siteUrl,
        defaultCategory,
        defaultStatus,
        username,
        applicationPassword,
        apiBasePath,
        requestTimeoutMs,
        rateLimitPerMinute,
        verifySSL,
        allowInsecureHttp,
        contentFormat,
        featureFlags,
      } = request.body;

      // Auto-normalize site URL
      let normalizedSiteUrl = siteUrl.trim();
      if (normalizedSiteUrl.endsWith('/')) {
        normalizedSiteUrl = normalizedSiteUrl.slice(0, -1);
      }

      // Prepare config
      const config: any = {
        name,
        siteUrl: normalizedSiteUrl,
        defaultStatus: defaultStatus || 'draft',
        username,
        applicationPassword,
      };

      // Add optional fields
      if (defaultCategory) config.defaultCategory = defaultCategory;
      if (apiBasePath) config.apiBasePath = apiBasePath;
      if (requestTimeoutMs) config.requestTimeoutMs = requestTimeoutMs;
      if (rateLimitPerMinute) config.rateLimitPerMinute = rateLimitPerMinute;
      if (typeof verifySSL !== 'undefined') config.verifySSL = verifySSL;
      if (typeof allowInsecureHttp !== 'undefined') config.allowInsecureHttp = allowInsecureHttp;
      if (contentFormat) config.contentFormat = contentFormat;
      if (featureFlags) config.featureFlags = featureFlags;

      // Validate config
      const validation = validateWordpressConfig(config);
      if (!validation.valid) {
        return reply.status(400).send({
          success: false,
          platform: 'wordpress',
          error: {
            message: 'Invalid configuration',
            details: validation.errors,
          },
        });
      }

      // Insert or update credentials
      await db.query(
        `INSERT INTO integration_credentials (platform, config)
         VALUES ('wordpress', $1)
         ON CONFLICT (platform)
         DO UPDATE SET config = $1, updated_at = NOW()`,
        [JSON.stringify(config)]
      );

      console.log('✅ WordPress configuration saved');

      // Optionally test connection after saving
      const testResult = await testWordpressConnection(config);
      if (!testResult.success) {
        console.warn('⚠️ WordPress config saved but connection test failed:', testResult.error);
        return reply.send({
          success: true,
          platform: 'wordpress',
          message: 'Configuration saved successfully',
          warning: testResult.error,
        });
      }

      return reply.send({
        success: true,
        platform: 'wordpress',
        message: 'Configuration saved and connection verified',
        userInfo: testResult.userInfo,
      });
    } catch (error: any) {
      console.error('❌ Error saving WordPress credentials:', error);
      return reply.status(500).send({
        success: false,
        platform: 'wordpress',
        error: {
          message: 'Failed to save credentials',
          details: error.message,
        },
      });
    }
  }

  /**
   * POST /api/integrations/wordpress/test
   * Test WordPress connection
   */
  async testWordpressCredentials(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      // Load credentials from database
      const result = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'wordpress'`
      );

      if (result.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          platform: 'wordpress',
          error: {
            message: 'Missing credentials',
            details: 'Please save WordPress credentials first',
          },
        });
      }

      const config = result.rows[0].config;

      // Test connection
      const testResult = await testWordpressConnection(config);

      if (testResult.success) {
        return reply.send({
          success: true,
          platform: 'wordpress',
          message: 'Connection successful',
        });
      } else {
        return reply.status(400).send({
          success: false,
          platform: 'wordpress',
          error: {
            message: 'Connection failed',
            details: testResult.error,
          },
        });
      }
    } catch (error: any) {
      console.error('❌ Error testing WordPress connection:', error);
      return reply.status(500).send({
        success: false,
        platform: 'wordpress',
        error: {
          message: 'Failed to test connection',
          details: error.message,
        },
      });
    }
  }

  /**
   * POST /api/integrations/wordpress/publish
   * Publish blog post to WordPress
   */
  async publishToWordpress(
    request: FastifyRequest<{
      Body: {
        pack_id: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id } = request.body;

      if (!pack_id) {
        return reply.status(400).send({
          success: false,
          platform: 'wordpress',
          error: {
            message: 'Missing pack_id',
          },
        });
      }

      // Load pack with derivatives
      const packResult = await db.query(
        `SELECT pack_id, draft_content, derivatives FROM content_packs WHERE pack_id = $1`,
        [pack_id]
      );

      if (packResult.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          platform: 'wordpress',
          error: {
            message: 'Content pack not found',
          },
        });
      }

      const pack = packResult.rows[0];

      // Check if derivatives exist
      if (!pack.derivatives || !pack.derivatives.blog_summary || !pack.derivatives.seo_description) {
        return reply.status(400).send({
          success: false,
          platform: 'wordpress',
          error: {
            message: 'No derivatives available',
            details: 'Please generate derivatives first',
          },
        });
      }

      // Load WordPress credentials
      const credResult = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'wordpress'`
      );

      if (credResult.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          platform: 'wordpress',
          error: {
            message: 'Missing credentials',
            details: 'Please save WordPress credentials first',
          },
        });
      }

      const config = credResult.rows[0].config;

      // Prepare payload from derivatives
      const payload = {
        title: pack.draft_content.split('\n')[0].replace(/^#+ /, '').substring(0, 100), // Extract title from first line
        content: pack.derivatives.blog_summary,
        excerpt: pack.derivatives.seo_description,
      };

      // Publish to WordPress
      const publishResult = await publishToWordpress(config, payload);

      if (publishResult.success) {
        return reply.send(publishResult);
      } else {
        return reply.status(400).send(publishResult);
      }
    } catch (error: any) {
      console.error('❌ Error publishing to WordPress:', error);
      return reply.status(500).send({
        success: false,
        platform: 'wordpress',
        error: {
          message: 'Failed to publish',
          details: error.message,
        },
      });
    }
  }
}

// Export singleton instance
export const integrationsController = new IntegrationsController();

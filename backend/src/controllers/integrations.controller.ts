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
import {
  publishToFacebook,
} from '../services/facebook.service.js';
import {
  validateInstagramConfig,
  testInstagramConnection,
} from '../services/instagram.service.js';
import {
  validateTwitterConfig,
  testTwitterConnection,
  publishTwitterThread,
} from '../services/twitter.service.js';
import {
  validateLinkedInConfig,
  testLinkedInConnection,
  publishToLinkedIn,
} from '../services/linkedin.service.js';
import {
  validateZaloConfig,
  testZaloConnection,
  publishToZalo,
} from '../services/zalo.service.js';

/**
 * IntegrationsController - Handle HTTP requests for third-party integrations
 * Supports Mailchimp and WordPress integrations
 */
export class IntegrationsController {
  // ==========================================
  // MAILCHIMP ENDPOINTS
  // ==========================================

  /**
   * GET /api/integrations/mailchimp
   * Get Mailchimp credentials (masked for security)
   */
  async getMailchimpConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'mailchimp'`
      );

      if (result.rows.length === 0) {
        return reply.send({
          success: true,
          data: null,
        });
      }

      const config = result.rows[0].config;
      
      // Mask sensitive data
      const maskedConfig = {
        apiKey: config.apiKey ? '••••••••••••••••' : '',
        serverPrefix: config.serverPrefix || '',
        audienceListId: config.audienceListId || '',
        fromName: config.fromName || '',
        fromEmail: config.fromEmail || '',
        replyToEmail: config.replyToEmail || '',
      };

      return reply.send({
        success: true,
        data: maskedConfig,
      });
    } catch (error: any) {
      console.error('❌ Error fetching Mailchimp config:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to fetch config', details: error.message },
      });
    }
  }

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
        pack_id?: string;
        content_id?: number;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id, content_id } = request.body;

      if (!pack_id && !content_id) {
        return reply.status(400).send({
          success: false,
          platform: 'mailchimp',
          error: {
            message: 'Missing pack_id or content_id',
          },
        });
      }

      let derivatives: any;
      let sourceContent: string = '';
      let sourceId: string = '';

      // Load from pack or library content
      if (pack_id) {
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
        derivatives = pack.derivatives;
        sourceContent = pack.draft_content;
        sourceId = pack_id;
      } else if (content_id) {
        const contentResult = await db.query(
          `SELECT id, body, title FROM contents WHERE id = $1`,
          [content_id]
        );

        if (contentResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            platform: 'mailchimp',
            error: {
              message: 'Library content not found',
            },
          });
        }

        const content = contentResult.rows[0];
        // Note: contents table stores final approved content in `body`
        derivatives = null;
        sourceContent = content.body;
        sourceId = `content-${content_id}`;
      }

      // For packs: require derivatives.email. For library contents: use body directly.
      const emailContent =
        pack_id
          ? (derivatives && (derivatives as any).email)
          : sourceContent;

      if (!emailContent || (typeof emailContent === 'string' && emailContent.trim().length === 0)) {
        return reply.status(400).send({
          success: false,
          platform: 'mailchimp',
          error: {
            message: 'No email content available',
            details: pack_id
              ? 'Please generate email derivative first'
              : 'Content body is empty',
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

      // Prepare payload
      const payload = {
        subject: `Newsletter: ${(sourceContent || '').substring(0, 50)}...`,
        title: `Content ${sourceId.substring(0, 12)}`,
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
        pack_id?: string;
        content_id?: number;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id, content_id } = request.body;

      if (!pack_id && !content_id) {
        return reply.status(400).send({
          success: false,
          platform: 'wordpress',
          error: {
            message: 'Missing pack_id or content_id',
          },
        });
      }

      let derivatives: any;
      let sourceContent: string = '';

      // Load from pack or library content
      if (pack_id) {
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
        derivatives = pack.derivatives;
        sourceContent = pack.draft_content;
      } else if (content_id) {
        const contentResult = await db.query(
          `SELECT id, body, final_content, draft_content, derivatives FROM contents WHERE id = $1`,
          [content_id]
        );

        if (contentResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            platform: 'wordpress',
            error: {
              message: 'Library content not found',
            },
          });
        }

        const content = contentResult.rows[0];
        derivatives = content.derivatives;
        sourceContent = content.final_content || content.draft_content;
      }

      // Check if derivatives exist
      if (!derivatives || !derivatives.blog_summary || !derivatives.seo_description) {
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
        title: sourceContent.split('\n')[0].replace(/^#+ /, '').substring(0, 100), // Extract title from first line
        content: derivatives.blog_summary,
        excerpt: derivatives.seo_description,
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

  // ==========================================
  // FACEBOOK ENDPOINTS
  // ==========================================

  /**
   * GET /api/integrations/facebook
   * Get Facebook configuration
   */
  async getFacebookConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'facebook'`
      );

      if (result.rows.length === 0) {
        return reply.send({
          success: true,
          config: {
            appId: '',
            appSecret: '',
            pageId: '',
            pageAccessToken: '',
          },
          status: { connected: false },
        });
      }

      const config = result.rows[0].config;
      
      // Mask sensitive data
      const maskedConfig = {
        appId: config.appId || '',
        appSecret: config.appSecret ? '••••••••••••••••' : '',
        pageId: config.pageId || '',
        pageAccessToken: config.pageAccessToken ? '••••••••••••••••' : '',
      };

      return reply.send({
        success: true,
        config: maskedConfig,
        status: { connected: !!config.pageAccessToken },
      });
    } catch (error: any) {
      console.error('❌ Error fetching Facebook config:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to fetch config', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/facebook
   * Save Facebook configuration
   */
  async saveFacebookCredentials(
    request: FastifyRequest<{
      Body: {
        appId: string;
        appSecret: string;
        pageId: string;
        pageAccessToken: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { appId, appSecret, pageId, pageAccessToken } = request.body;

      // Basic validation
      if (!appId || !appSecret || !pageId || !pageAccessToken) {
        return reply.status(400).send({
          success: false,
          error: { message: 'All fields are required' },
        });
      }

      // Store config (in production, encrypt sensitive data)
      const config = {
        appId,
        appSecret,
        pageId,
        pageAccessToken,
        apiVersion: 'v18.0',
        updatedAt: new Date().toISOString(),
      };

      await db.query(
        `INSERT INTO integration_credentials (platform, config, updated_at)
         VALUES ('facebook', $1, NOW())
         ON CONFLICT (platform) DO UPDATE SET config = $1, updated_at = NOW()`,
        [JSON.stringify(config)]
      );

      console.log('✅ Facebook credentials saved successfully');

      return reply.send({ success: true, message: 'Facebook configuration saved' });
    } catch (error: any) {
      console.error('❌ Error saving Facebook credentials:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to save credentials', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/facebook/test
   * Test Facebook connection by fetching page info
   */
  async testFacebookConfig(
    request: FastifyRequest<{
      Body: {
        pageId: string;
        pageAccessToken: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { pageId, pageAccessToken } = request.body;

      if (!pageId || !pageAccessToken) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Page ID and Page Access Token are required' },
        });
      }

      // Test by fetching page info
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=name,id&access_token=${pageAccessToken}`
      );

      const data: any = await response.json();

      if (data.error) {
        console.error('❌ Facebook API error:', data.error);
        return reply.status(400).send({
          success: false,
          error: {
            message: 'Failed to connect to Facebook',
            details: data.error.message || 'Invalid credentials',
          },
        });
      }

      console.log('✅ Facebook connection test successful:', data.name);

      return reply.send({
        success: true,
        pageName: data.name,
        pageId: data.id,
        message: 'Connection successful',
      });
    } catch (error: any) {
      console.error('❌ Error testing Facebook:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Test failed', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/facebook/publish
   */
  async publishToFacebookEndpoint(
    request: FastifyRequest<{ Body: { pack_id?: number; content_id?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id, content_id } = request.body;
      let message: string = '';

      if (pack_id) {
        const packResult = await db.query(
          `SELECT derivatives FROM content_packs WHERE pack_id = $1`,
          [pack_id]
        );
        if (packResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { message: 'Pack not found' },
          });
        }
        const derivatives = packResult.rows[0].derivatives;
        if (!derivatives || !derivatives.linkedin) {
          return reply.status(400).send({
            success: false,
            error: { message: 'No derivatives available for pack' },
          });
        }
        message = derivatives.linkedin;
      } else if (content_id) {
        // For library content, use body directly (create excerpt for Facebook)
        const contentResult = await db.query(
          `SELECT title, body FROM contents WHERE id = $1`,
          [content_id]
        );
        if (contentResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { message: 'Content not found' },
          });
        }
        
        const { title, body } = contentResult.rows[0];
        // Convert markdown to Facebook-friendly plain text (preserving line breaks)
        const cleanBody = body
          ? body
              // Fix headings stuck to next paragraph (e.g., "### TitleSome text")
              .replace(/(#{1,3}\s*[^\n]+)([A-ZÀ-ỸĐ][a-zà-ỹđ])/g, '$1\n\n$2')
              // H3 -> emoji bullet with proper spacing
              .replace(/^###\s*(.+)$/gm, '\n\n🔹 $1\n')
              // H2 -> pin emoji with proper spacing  
              .replace(/^##\s*(.+)$/gm, '\n\n📌 $1\n')
              // H1 -> megaphone with proper spacing
              .replace(/^#\s*(.+)$/gm, '\n\n📣 $1\n')
              // Bold -> plain but preserve text
              .replace(/\*\*(.+?)\*\*/g, '$1')
              // Italic -> plain
              .replace(/\*(.+?)\*/g, '$1')
              // Bullet points
              .replace(/^[-*]\s+/gm, '• ')
              // Numbered lists
              .replace(/^\d+\.\s+/gm, '➤ ')
              // Clean up excessive line breaks (max 2)
              .replace(/\n{4,}/g, '\n\n\n')
              .replace(/^\n+/, '')  // Remove leading newlines
              .trim()
          : '';
        
        // Facebook allows up to 63,206 chars - post full content
        message = title ? `📢 ${title}\n\n${cleanBody}` : cleanBody;
      } else {
        return reply.status(400).send({
          success: false,
          error: { message: 'Either pack_id or content_id is required' },
        });
      }

      const credResult = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'facebook'`
      );
      if (credResult.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Missing Facebook credentials' },
        });
      }

      const config = credResult.rows[0].config;
      const publishResult = await publishToFacebook(config, { message });

      if (publishResult.success) {
        return reply.send(publishResult);
      } else {
        return reply.status(400).send(publishResult);
      }
    } catch (error: any) {
      console.error('❌ Error publishing to Facebook:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to publish', details: error.message },
      });
    }
  }

  // ==========================================
  // INSTAGRAM ENDPOINTS
  // ==========================================

  /**
   * POST /api/integrations/instagram/save
   */
  async saveInstagramCredentials(
    request: FastifyRequest<{
      Body: {
        userId: string;
        accessToken: string;
        apiVersion?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, accessToken, apiVersion } = request.body;

      const validation = validateInstagramConfig({ userId, accessToken, apiVersion });
      if (!validation.valid) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Validation failed', details: validation.errors.join(', ') },
        });
      }

      await db.query(
        `INSERT INTO integration_credentials (platform, config, updated_at)
         VALUES ('instagram', $1, NOW())
         ON CONFLICT (platform) DO UPDATE SET config = $1, updated_at = NOW()`,
        [JSON.stringify({ userId, accessToken, apiVersion: apiVersion || 'v18.0' })]
      );

      return reply.send({ success: true, message: 'Instagram credentials saved' });
    } catch (error: any) {
      console.error('❌ Error saving Instagram credentials:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to save credentials', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/instagram/test
   */
  async testInstagramConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'instagram'`
      );

      if (result.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          error: { message: 'No Instagram credentials found' },
        });
      }

      const config = result.rows[0].config;
      const testResult = await testInstagramConnection(config);

      return reply.send(testResult);
    } catch (error: any) {
      console.error('❌ Error testing Instagram:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Test failed', details: error.message },
      });
    }
  }

  // ==========================================
  // TWITTER ENDPOINTS
  // ==========================================

  /**
   * POST /api/integrations/twitter/save
   */
  async saveTwitterCredentials(
    request: FastifyRequest<{
      Body: {
        apiKey: string;
        apiSecret: string;
        accessToken: string;
        accessTokenSecret: string;
        bearerToken?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { apiKey, apiSecret, accessToken, accessTokenSecret, bearerToken } = request.body;

      const validation = validateTwitterConfig({
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret,
        bearerToken,
      });
      if (!validation.valid) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Validation failed', details: validation.errors.join(', ') },
        });
      }

      await db.query(
        `INSERT INTO integration_credentials (platform, config, updated_at)
         VALUES ('twitter', $1, NOW())
         ON CONFLICT (platform) DO UPDATE SET config = $1, updated_at = NOW()`,
        [
          JSON.stringify({
            apiKey,
            apiSecret,
            accessToken,
            accessTokenSecret,
            bearerToken,
          }),
        ]
      );

      return reply.send({ success: true, message: 'Twitter credentials saved' });
    } catch (error: any) {
      console.error('❌ Error saving Twitter credentials:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to save credentials', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/twitter/test
   */
  async testTwitterConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'twitter'`
      );

      if (result.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          error: { message: 'No Twitter credentials found' },
        });
      }

      const config = result.rows[0].config;
      const testResult = await testTwitterConnection(config);

      return reply.send(testResult);
    } catch (error: any) {
      console.error('❌ Error testing Twitter:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Test failed', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/twitter/publish
   */
  async publishToTwitterEndpoint(
    request: FastifyRequest<{ Body: { pack_id?: number; content_id?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id, content_id } = request.body;
      let derivatives: any;

      if (pack_id) {
        const packResult = await db.query(
          `SELECT derivatives FROM content_packs WHERE pack_id = $1`,
          [pack_id]
        );
        if (packResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { message: 'Pack not found' },
          });
        }
        derivatives = packResult.rows[0].derivatives;
      } else if (content_id) {
        const contentResult = await db.query(
          `SELECT derivatives FROM contents WHERE id = $1`,
          [content_id]
        );
        if (contentResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { message: 'Content not found' },
          });
        }
        derivatives = contentResult.rows[0].derivatives;
      }

      if (!derivatives || !derivatives.twitter_thread) {
        return reply.status(400).send({
          success: false,
          error: { message: 'No Twitter thread derivatives available' },
        });
      }

      const credResult = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'twitter'`
      );
      if (credResult.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Missing Twitter credentials' },
        });
      }

      const config = credResult.rows[0].config;
      const tweets = Array.isArray(derivatives.twitter_thread)
        ? derivatives.twitter_thread
        : [derivatives.twitter_thread];

      const publishResult = await publishTwitterThread(config, tweets);

      if (publishResult.success) {
        return reply.send(publishResult);
      } else {
        return reply.status(400).send(publishResult);
      }
    } catch (error: any) {
      console.error('❌ Error publishing to Twitter:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to publish', details: error.message },
      });
    }
  }

  // ==========================================
  // LINKEDIN ENDPOINTS
  // ==========================================

  /**
   * POST /api/integrations/linkedin/save
   */
  async saveLinkedInCredentials(
    request: FastifyRequest<{
      Body: {
        personUrn: string;
        accessToken: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { personUrn, accessToken } = request.body;

      const validation = validateLinkedInConfig({ personUrn, accessToken });
      if (!validation.valid) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Validation failed', details: validation.errors.join(', ') },
        });
      }

      await db.query(
        `INSERT INTO integration_credentials (platform, config, updated_at)
         VALUES ('linkedin', $1, NOW())
         ON CONFLICT (platform) DO UPDATE SET config = $1, updated_at = NOW()`,
        [JSON.stringify({ personUrn, accessToken })]
      );

      return reply.send({ success: true, message: 'LinkedIn credentials saved' });
    } catch (error: any) {
      console.error('❌ Error saving LinkedIn credentials:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to save credentials', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/linkedin/test
   */
  async testLinkedInConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'linkedin'`
      );

      if (result.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          error: { message: 'No LinkedIn credentials found' },
        });
      }

      const config = result.rows[0].config;
      const testResult = await testLinkedInConnection(config);

      return reply.send(testResult);
    } catch (error: any) {
      console.error('❌ Error testing LinkedIn:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Test failed', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/linkedin/publish
   */
  async publishToLinkedInEndpoint(
    request: FastifyRequest<{ Body: { pack_id?: number; content_id?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id, content_id } = request.body;
      let derivatives: any;

      if (pack_id) {
        const packResult = await db.query(
          `SELECT derivatives FROM content_packs WHERE pack_id = $1`,
          [pack_id]
        );
        if (packResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { message: 'Pack not found' },
          });
        }
        derivatives = packResult.rows[0].derivatives;
      } else if (content_id) {
        const contentResult = await db.query(
          `SELECT derivatives FROM contents WHERE id = $1`,
          [content_id]
        );
        if (contentResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { message: 'Content not found' },
          });
        }
        derivatives = contentResult.rows[0].derivatives;
      }

      if (!derivatives || !derivatives.linkedin) {
        return reply.status(400).send({
          success: false,
          error: { message: 'No LinkedIn derivatives available' },
        });
      }

      const credResult = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'linkedin'`
      );
      if (credResult.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Missing LinkedIn credentials' },
        });
      }

      const config = credResult.rows[0].config;
      const publishResult = await publishToLinkedIn(config, {
        text: derivatives.linkedin,
      });

      if (publishResult.success) {
        return reply.send(publishResult);
      } else {
        return reply.status(400).send(publishResult);
      }
    } catch (error: any) {
      console.error('❌ Error publishing to LinkedIn:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to publish', details: error.message },
      });
    }
  }

  // ==========================================
  // ZALO ENDPOINTS
  // ==========================================

  /**
   * POST /api/integrations/zalo/save
   */
  async saveZaloCredentials(
    request: FastifyRequest<{
      Body: {
        oaId: string;
        accessToken: string;
        appId?: string;
        appSecret?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { oaId, accessToken, appId, appSecret } = request.body;

      const validation = validateZaloConfig({ oaId, accessToken, appId, appSecret });
      if (!validation.valid) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Validation failed', details: validation.errors.join(', ') },
        });
      }

      await db.query(
        `INSERT INTO integration_credentials (platform, config, updated_at)
         VALUES ('zalo', $1, NOW())
         ON CONFLICT (platform) DO UPDATE SET config = $1, updated_at = NOW()`,
        [JSON.stringify({ oaId, accessToken, appId, appSecret })]
      );

      return reply.send({ success: true, message: 'Zalo credentials saved' });
    } catch (error: any) {
      console.error('❌ Error saving Zalo credentials:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to save credentials', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/zalo/test
   */
  async testZaloConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'zalo'`
      );

      if (result.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          error: { message: 'No Zalo credentials found' },
        });
      }

      const config = result.rows[0].config;
      const testResult = await testZaloConnection(config);

      return reply.send(testResult);
    } catch (error: any) {
      console.error('❌ Error testing Zalo:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Test failed', details: error.message },
      });
    }
  }

  /**
   * POST /api/integrations/zalo/publish
   */
  async publishToZaloEndpoint(
    request: FastifyRequest<{ Body: { pack_id?: number; content_id?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { pack_id, content_id } = request.body;
      let derivatives: any;

      if (pack_id) {
        const packResult = await db.query(
          `SELECT derivatives FROM content_packs WHERE pack_id = $1`,
          [pack_id]
        );
        if (packResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { message: 'Pack not found' },
          });
        }
        derivatives = packResult.rows[0].derivatives;
      } else if (content_id) {
        const contentResult = await db.query(
          `SELECT derivatives FROM contents WHERE id = $1`,
          [content_id]
        );
        if (contentResult.rows.length === 0) {
          return reply.status(404).send({
            success: false,
            error: { message: 'Content not found' },
          });
        }
        derivatives = contentResult.rows[0].derivatives;
      }

      if (!derivatives || !derivatives.linkedin) {
        return reply.status(400).send({
          success: false,
          error: { message: 'No derivatives available for Zalo' },
        });
      }

      const credResult = await db.query(
        `SELECT config FROM integration_credentials WHERE platform = 'zalo'`
      );
      if (credResult.rows.length === 0) {
        return reply.status(400).send({
          success: false,
          error: { message: 'Missing Zalo credentials' },
        });
      }

      const config = credResult.rows[0].config;
      const publishResult = await publishToZalo(config, {
        message: derivatives.linkedin,
      });

      if (publishResult.success) {
        return reply.send(publishResult);
      } else {
        return reply.status(400).send(publishResult);
      }
    } catch (error: any) {
      console.error('❌ Error publishing to Zalo:', error);
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to publish', details: error.message },
      });
    }
  }
}

// Export singleton instance
export const integrationsController = new IntegrationsController();

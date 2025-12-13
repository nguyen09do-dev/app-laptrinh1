/**
 * Mailchimp Integration Service
 * Handles email newsletter campaign creation and sending via Mailchimp API
 */

interface MailchimpConfig {
  apiKey: string;
  serverPrefix: string;
  audienceListId: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
}

interface PublishPayload {
  subject: string;
  title: string;
  content: string;
}

interface MailchimpError {
  status: number;
  detail: string;
  title: string;
}

interface PublishResult {
  success: boolean;
  platform: string;
  campaignId?: string;
  sent?: boolean;
  error?: {
    message: string;
    details?: any;
  };
}

/**
 * Validate Mailchimp configuration
 */
export function validateMailchimpConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Config must be an object');
    return { valid: false, errors };
  }

  if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim() === '') {
    errors.push('apiKey is required and must be a non-empty string');
  }

  if (!config.serverPrefix || typeof config.serverPrefix !== 'string' || config.serverPrefix.trim() === '') {
    errors.push('serverPrefix is required and must be a non-empty string');
  }

  if (!config.audienceListId || typeof config.audienceListId !== 'string' || config.audienceListId.trim() === '') {
    errors.push('audienceListId is required and must be a non-empty string');
  }

  // Validate email defaults
  if (!config.fromName || typeof config.fromName !== 'string' || config.fromName.trim() === '') {
    errors.push('fromName is required and must be a non-empty string');
  }

  if (!config.fromEmail || typeof config.fromEmail !== 'string' || config.fromEmail.trim() === '') {
    errors.push('fromEmail is required and must be a non-empty string');
  } else if (!isValidEmail(config.fromEmail.trim())) {
    errors.push('fromEmail must be a valid email address');
  }

  if (!config.replyToEmail || typeof config.replyToEmail !== 'string' || config.replyToEmail.trim() === '') {
    errors.push('replyToEmail is required and must be a non-empty string');
  } else if (!isValidEmail(config.replyToEmail.trim())) {
    errors.push('replyToEmail must be a valid email address');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Test Mailchimp connection by pinging the API
 */
export async function testMailchimpConnection(config: MailchimpConfig): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate server prefix format (should be like us1, us21, etc.)
    const serverPrefix = config.serverPrefix.trim().toLowerCase();
    if (!/^[a-z]{2}\d+$/.test(serverPrefix)) {
      return {
        success: false,
        error: `Invalid server prefix format. Expected format like "us1", "us21", "eu1". Got: "${config.serverPrefix}"`,
      };
    }

    // Validate API key format (should be a string, typically contains server prefix)
    const apiKey = config.apiKey.trim();
    if (!apiKey || apiKey.length < 10) {
      return {
        success: false,
        error: 'API key appears to be invalid (too short)',
      };
    }

    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/ping`;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      // Try with "apikey" format first (Mailchimp standard)
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If 401, try with Bearer format
      if (response.status === 401) {
        console.log('⚠️ apikey format failed, trying Bearer format...');
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 15000);
        
        response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller2.signal,
        });
        
        clearTimeout(timeoutId2);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.title || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Provide helpful error messages
        if (response.status === 401) {
          return {
            success: false,
            error: `Authentication failed. Please check your API key. Error: ${errorMessage}`,
          };
        }
        if (response.status === 404) {
          return {
            success: false,
            error: `Server prefix "${serverPrefix}" not found. Please verify your server prefix is correct.`,
          };
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();

      // Mailchimp ping returns { "health_status": "Everything's Chimpy!" }
      if (data.health_status) {
        console.log('✅ Mailchimp connection test successful');
        return { success: true };
      }

      return { success: false, error: 'Unexpected response from Mailchimp API' };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          error: 'Connection timeout. Mailchimp API is not responding. Please check your internet connection and try again.',
        };
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error('❌ Mailchimp connection test failed:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Cannot reach Mailchimp API. Please check your internet connection.',
      };
    }
    
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      return {
        success: false,
        error: `DNS error. Cannot resolve "${config.serverPrefix}.api.mailchimp.com". Please verify your server prefix is correct.`,
      };
    }
    
    return {
      success: false,
      error: error.message || 'Unknown network error',
    };
  }
}

/**
 * Create a Mailchimp campaign
 */
async function createCampaign(
  config: MailchimpConfig,
  subject: string,
  title: string
): Promise<{ success: boolean; campaignId?: string; error?: any }> {
  try {
    const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/campaigns`;

    const campaignData = {
      type: 'regular',
      recipients: {
        list_id: config.audienceListId,
      },
      settings: {
        subject_line: subject,
        title: title,
        from_name: config.fromName,
        reply_to: config.replyToEmail,
      },
    };

    // Try apikey format first, fallback to Bearer
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `apikey ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });

    // If 401, try Bearer format
    if (response.status === 401) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Mailchimp create campaign failed:', errorData);
      return {
        success: false,
        error: errorData,
      };
    }

    const data = await response.json();
    return {
      success: true,
      campaignId: data.id,
    };
  } catch (error: any) {
    console.error('❌ Mailchimp create campaign error:', error);
    return {
      success: false,
      error: { message: error.message },
    };
  }
}

/**
 * Set campaign content
 */
async function setCampaignContent(
  config: MailchimpConfig,
  campaignId: string,
  htmlContent: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`;

    // Try apikey format first, fallback to Bearer
    let response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `apikey ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
      }),
    });

    // If 401, try Bearer format
    if (response.status === 401) {
      response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
        }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Mailchimp set content failed:', errorData);
      return {
        success: false,
        error: errorData,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('❌ Mailchimp set content error:', error);
    return {
      success: false,
      error: { message: error.message },
    };
  }
}

/**
 * Send campaign
 */
async function sendCampaign(
  config: MailchimpConfig,
  campaignId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`;

    // Try apikey format first, fallback to Bearer
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `apikey ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // If 401, try Bearer format
    if (response.status === 401) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Mailchimp send campaign failed:', errorData);
      return {
        success: false,
        error: errorData,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('❌ Mailchimp send campaign error:', error);
    return {
      success: false,
      error: { message: error.message },
    };
  }
}

/**
 * Retry wrapper with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  shouldRetry: (error: any) => boolean = () => true
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry on auth errors (401, 403)
      if (error.status === 401 || error.status === 403) {
        throw error;
      }

      // Check if we should retry
      if (attempt < maxRetries && shouldRetry(error)) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * Publish email newsletter to Mailchimp
 *
 * Flow:
 * 1. Create campaign
 * 2. Set campaign content
 * 3. Send campaign
 *
 * Includes retry logic for network errors
 */
export async function publishToMailchimp(
  config: MailchimpConfig,
  payload: PublishPayload
): Promise<PublishResult> {
  console.log('📧 Publishing to Mailchimp...');
  console.log('   Subject:', payload.subject);
  console.log('   Title:', payload.title);

  try {
    // Step 1: Create campaign with retry
    const createResult = await retryOperation(
      async () => {
        const result = await createCampaign(config, payload.subject, payload.title);
        if (!result.success) {
          const error: any = new Error(result.error?.detail || result.error?.title || 'Failed to create campaign');
          error.status = result.error?.status;
          throw error;
        }
        return result;
      },
      2
    );

    if (!createResult.campaignId) {
      return {
        success: false,
        platform: 'mailchimp',
        error: {
          message: 'Campaign created but no ID returned',
        },
      };
    }

    const campaignId = createResult.campaignId;
    console.log('✅ Campaign created:', campaignId);

    // Step 2: Set content with retry
    await retryOperation(
      async () => {
        const result = await setCampaignContent(config, campaignId, payload.content);
        if (!result.success) {
          const error: any = new Error(result.error?.detail || result.error?.title || 'Failed to set content');
          error.status = result.error?.status;
          throw error;
        }
        return result;
      },
      2
    );

    console.log('✅ Content set');

    // Step 3: Send campaign with retry
    await retryOperation(
      async () => {
        const result = await sendCampaign(config, campaignId);
        if (!result.success) {
          const error: any = new Error(result.error?.detail || result.error?.title || 'Failed to send campaign');
          error.status = result.error?.status;
          throw error;
        }
        return result;
      },
      2
    );

    console.log('✅ Campaign sent successfully!');

    return {
      success: true,
      platform: 'mailchimp',
      campaignId,
      sent: true,
    };

  } catch (error: any) {
    console.error('❌ Mailchimp publish failed:', error);

    return {
      success: false,
      platform: 'mailchimp',
      error: {
        message: error.message || 'Unknown error',
        details: error.detail || error.title || error.stack,
      },
    };
  }
}

/**
 * Facebook Graph API Integration Service
 * Handles publishing posts to Facebook Pages
 */

export interface FacebookConfig {
  pageId: string;
  accessToken?: string; // Legacy field
  pageAccessToken?: string; // New field from DB
  apiVersion?: string;
}

export interface FacebookPublishPayload {
  message: string;
  link?: string;
  published?: boolean;
}

interface FacebookErrorResponse {
  error?: {
    message?: string;
    error_user_msg?: string;
  };
}

interface FacebookPageResponse {
  name?: string;
  id?: string;
}

interface FacebookPostResponse {
  id?: string;
}

/**
 * Validate Facebook configuration
 */
export function validateFacebookConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.pageId || typeof config.pageId !== 'string' || config.pageId.trim() === '') {
    errors.push('Page ID is required');
  }

  if (!config.accessToken || typeof config.accessToken !== 'string' || config.accessToken.trim() === '') {
    errors.push('Access Token is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Test Facebook connection
 */
export async function testFacebookConnection(
  config: FacebookConfig
): Promise<{ success: boolean; error?: any }> {
  try {
    const apiVersion = config.apiVersion || 'v18.0';
    // Support both pageAccessToken (new) and accessToken (legacy)
    const token = config.pageAccessToken || config.accessToken;
    const url = `https://graph.facebook.com/${apiVersion}/${config.pageId}?fields=name,id&access_token=${token}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as FacebookErrorResponse;
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.error?.message || `HTTP ${response.status}`,
          details: errorData.error?.error_user_msg || errorData.error?.message,
        },
      };
    }

    const data = await response.json() as FacebookPageResponse;
    console.log('✅ Facebook connection test successful:', data.name);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Facebook connection test failed:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Connection test failed',
        details: error.toString(),
      },
    };
  }
}

/**
 * Publish post to Facebook Page
 */
export async function publishToFacebook(
  config: FacebookConfig,
  payload: FacebookPublishPayload
): Promise<{ success: boolean; postId?: string; error?: any }> {
  try {
    const apiVersion = config.apiVersion || 'v18.0';
    const url = `https://graph.facebook.com/${apiVersion}/${config.pageId}/feed`;
    
    // Support both pageAccessToken (new) and accessToken (legacy)
    const token = config.pageAccessToken || config.accessToken;

    const postData: any = {
      message: payload.message,
      published: payload.published !== false,
      access_token: token,
    };

    if (payload.link) {
      postData.link = payload.link;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as FacebookErrorResponse;
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.error?.message || `HTTP ${response.status}`,
          details: errorData.error?.error_user_msg || errorData.error?.message,
        },
      };
    }

    const data = await response.json() as FacebookPostResponse;
    console.log('✅ Published to Facebook:', data.id);

    return {
      success: true,
      postId: data.id,
    };
  } catch (error: any) {
    console.error('❌ Facebook publish failed:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Publish failed',
        details: error.toString(),
      },
    };
  }
}


/**
 * Instagram Graph API Integration Service
 * Handles publishing posts to Instagram Business Accounts
 */

export interface InstagramConfig {
  userId: string; // Instagram Business Account ID
  accessToken: string;
  apiVersion?: string;
}

export interface InstagramPublishPayload {
  caption: string;
  imageUrl: string; // Instagram requires image URL (must be publicly accessible)
}

/**
 * Validate Instagram configuration
 */
export function validateInstagramConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.userId || typeof config.userId !== 'string' || config.userId.trim() === '') {
    errors.push('Instagram User ID (Business Account) is required');
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
 * Test Instagram connection
 */
export async function testInstagramConnection(
  config: InstagramConfig
): Promise<{ success: boolean; error?: any }> {
  try {
    const apiVersion = config.apiVersion || 'v18.0';
    const url = `https://graph.facebook.com/${apiVersion}/${config.userId}?fields=username,name&access_token=${config.accessToken}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.error?.message || `HTTP ${response.status}`,
          details: errorData.error?.error_user_msg || errorData.error?.message,
        },
      };
    }

    const data = await response.json();
    console.log('✅ Instagram connection test successful:', data.username);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Instagram connection test failed:', error);
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
 * Publish post to Instagram (2-step process: create container, then publish)
 */
export async function publishToInstagram(
  config: InstagramConfig,
  payload: InstagramPublishPayload
): Promise<{ success: boolean; postId?: string; error?: any }> {
  try {
    const apiVersion = config.apiVersion || 'v18.0';

    // Step 1: Create Media Container
    const createUrl = `https://graph.facebook.com/${apiVersion}/${config.userId}/media`;
    const createData = {
      image_url: payload.imageUrl,
      caption: payload.caption,
      access_token: config.accessToken,
    };

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      return {
        success: false,
        error: {
          status: createResponse.status,
          message: errorData.error?.message || `HTTP ${createResponse.status}`,
          details: errorData.error?.error_user_msg || errorData.error?.message || 'Failed to create media container',
        },
      };
    }

    const createResult = await createResponse.json();
    const containerId = createResult.id;

    // Step 2: Publish Media Container
    const publishUrl = `https://graph.facebook.com/${apiVersion}/${config.userId}/media_publish`;
    const publishData = {
      creation_id: containerId,
      access_token: config.accessToken,
    };

    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(publishData),
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json().catch(() => ({}));
      return {
        success: false,
        error: {
          status: publishResponse.status,
          message: errorData.error?.message || `HTTP ${publishResponse.status}`,
          details: errorData.error?.error_user_msg || errorData.error?.message || 'Failed to publish media',
        },
      };
    }

    const publishResult = await publishResponse.json();
    console.log('✅ Published to Instagram:', publishResult.id);

    return {
      success: true,
      postId: publishResult.id,
    };
  } catch (error: any) {
    console.error('❌ Instagram publish failed:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Publish failed',
        details: error.toString(),
      },
    };
  }
}


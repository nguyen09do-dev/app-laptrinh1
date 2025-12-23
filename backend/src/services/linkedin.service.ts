/**
 * LinkedIn API Integration Service
 * Handles publishing posts to LinkedIn
 */

export interface LinkedInConfig {
  personUrn: string; // LinkedIn Person URN (e.g., urn:li:person:ABC123)
  accessToken: string;
}

export interface LinkedInPublishPayload {
  text: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}

interface LinkedInErrorResponse {
  message?: string;
}

interface LinkedInUserResponse {
  localizedFirstName?: string;
}

interface LinkedInPostResponse {
  id?: string;
}

/**
 * Validate LinkedIn configuration
 */
export function validateLinkedInConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.personUrn || typeof config.personUrn !== 'string' || config.personUrn.trim() === '') {
    errors.push('Person URN is required');
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
 * Test LinkedIn connection
 */
export async function testLinkedInConnection(
  config: LinkedInConfig
): Promise<{ success: boolean; error?: any }> {
  try {
    const url = 'https://api.linkedin.com/v2/me';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as LinkedInErrorResponse;
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
          details: errorData.message,
        },
      };
    }

    const data = await response.json() as LinkedInUserResponse;
    console.log('✅ LinkedIn connection test successful:', data.localizedFirstName);

    return { success: true };
  } catch (error: any) {
    console.error('❌ LinkedIn connection test failed:', error);
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
 * Publish post to LinkedIn
 */
export async function publishToLinkedIn(
  config: LinkedInConfig,
  payload: LinkedInPublishPayload
): Promise<{ success: boolean; postId?: string; error?: any }> {
  try {
    const url = 'https://api.linkedin.com/v2/ugcPosts';

    const postData = {
      author: config.personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: payload.text,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': payload.visibility || 'PUBLIC',
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as LinkedInErrorResponse;
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
          details: errorData.message,
        },
      };
    }

    const data = await response.json() as LinkedInPostResponse;
    const postId = data.id;
    console.log('✅ Published to LinkedIn:', postId);

    return {
      success: true,
      postId,
    };
  } catch (error: any) {
    console.error('❌ LinkedIn publish failed:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Publish failed',
        details: error.toString(),
      },
    };
  }
}





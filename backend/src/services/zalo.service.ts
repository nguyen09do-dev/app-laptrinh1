/**
 * Zalo API Integration Service
 * Handles publishing posts to Zalo Official Accounts
 */

export interface ZaloConfig {
  oaId: string; // Official Account ID
  accessToken: string;
  appId?: string;
  appSecret?: string;
}

export interface ZaloPublishPayload {
  message: string;
  link?: string;
  imageUrl?: string;
}

interface ZaloErrorResponse {
  message?: string;
  error_description?: string;
  error?: number;
}

interface ZaloOAResponse {
  error?: number;
  message?: string;
  data?: {
    name?: string;
  };
}

interface ZaloArticleResponse {
  error?: number;
  message?: string;
  data?: {
    id?: string;
  };
}

interface ZaloMessageResponse {
  error?: number;
  message?: string;
  data?: {
    message_id?: string;
  };
}

/**
 * Validate Zalo configuration
 */
export function validateZaloConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.oaId || typeof config.oaId !== 'string' || config.oaId.trim() === '') {
    errors.push('Official Account ID is required');
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
 * Test Zalo connection
 */
export async function testZaloConnection(
  config: ZaloConfig
): Promise<{ success: boolean; error?: any }> {
  try {
    const url = `https://openapi.zalo.me/v2.0/oa/getoa?access_token=${config.accessToken}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as ZaloErrorResponse;
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
          details: errorData.error_description || errorData.message,
        },
      };
    }

    const data = await response.json() as ZaloOAResponse;

    if (data.error !== 0) {
      return {
        success: false,
        error: {
          status: data.error,
          message: data.message || 'Connection test failed',
          details: data.message,
        },
      };
    }

    console.log('✅ Zalo connection test successful:', data.data?.name);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Zalo connection test failed:', error);
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
 * Publish article/post to Zalo Official Account
 */
export async function publishToZalo(
  config: ZaloConfig,
  payload: ZaloPublishPayload
): Promise<{ success: boolean; articleId?: string; error?: any }> {
  try {
    const url = 'https://openapi.zalo.me/v2.0/article/create';

    const articleData: any = {
      access_token: config.accessToken,
      title: payload.message.substring(0, 200), // Use first 200 chars as title
      body: payload.message,
      status: 'show', // or 'hide' for draft
      type: 'normal',
    };

    if (payload.imageUrl) {
      articleData.cover = {
        cover_type: 'photo',
        photo_url: payload.imageUrl,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as ZaloErrorResponse;
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
          details: errorData.error_description || errorData.message,
        },
      };
    }

    const data = await response.json() as ZaloArticleResponse;

    if (data.error !== 0) {
      return {
        success: false,
        error: {
          status: data.error,
          message: data.message || 'Publish failed',
          details: data.message,
        },
      };
    }

    console.log('✅ Published to Zalo:', data.data?.id);

    return {
      success: true,
      articleId: data.data?.id,
    };
  } catch (error: any) {
    console.error('❌ Zalo publish failed:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Publish failed',
        details: error.toString(),
      },
    };
  }
}

/**
 * Send message to Zalo followers (alternative to article publishing)
 */
export async function sendZaloMessage(
  config: ZaloConfig,
  message: string,
  recipientId: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    const url = 'https://openapi.zalo.me/v2.0/oa/message';

    const messageData = {
      recipient: {
        user_id: recipientId,
      },
      message: {
        text: message,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': config.accessToken,
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as ZaloErrorResponse;
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
          details: errorData.error_description || errorData.message,
        },
      };
    }

    const data = await response.json() as ZaloMessageResponse;

    if (data.error !== 0) {
      return {
        success: false,
        error: {
          status: data.error,
          message: data.message || 'Send message failed',
          details: data.message,
        },
      };
    }

    console.log('✅ Sent Zalo message:', data.data?.message_id);

    return {
      success: true,
      messageId: data.data?.message_id,
    };
  } catch (error: any) {
    console.error('❌ Zalo message send failed:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Send message failed',
        details: error.toString(),
      },
    };
  }
}





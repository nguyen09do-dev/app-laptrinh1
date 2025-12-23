/**
 * Twitter API v2 Integration Service
 * Handles publishing tweets and threads to Twitter
 */

export interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken?: string;
}

export interface TwitterPublishPayload {
  text: string;
  replyToTweetId?: string; // For threading
}

interface TwitterErrorResponse {
  title?: string;
  detail?: string;
}

interface TwitterUserResponse {
  data?: {
    username?: string;
  };
}

interface TwitterTweetResponse {
  data?: {
    id?: string;
  };
}

/**
 * Validate Twitter configuration
 */
export function validateTwitterConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim() === '') {
    errors.push('API Key is required');
  }

  if (!config.apiSecret || typeof config.apiSecret !== 'string' || config.apiSecret.trim() === '') {
    errors.push('API Secret is required');
  }

  if (!config.accessToken || typeof config.accessToken !== 'string' || config.accessToken.trim() === '') {
    errors.push('Access Token is required');
  }

  if (!config.accessTokenSecret || typeof config.accessTokenSecret !== 'string' || config.accessTokenSecret.trim() === '') {
    errors.push('Access Token Secret is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate OAuth 1.0a signature for Twitter API
 */
function generateTwitterAuthHeader(
  method: string,
  url: string,
  config: TwitterConfig,
  _params: Record<string, string> = {}
): string {
  // This is a simplified version. For production, use a library like 'oauth-1.0a'
  // For now, we'll use Bearer Token authentication which is simpler
  if (config.bearerToken) {
    return `Bearer ${config.bearerToken}`;
  }

  // OAuth 1.0a implementation would go here
  // For simplicity, returning a placeholder
  return `OAuth oauth_consumer_key="${config.apiKey}", oauth_token="${config.accessToken}"`;
}

/**
 * Test Twitter connection
 */
export async function testTwitterConnection(
  config: TwitterConfig
): Promise<{ success: boolean; error?: any }> {
  try {
    const url = 'https://api.twitter.com/2/users/me';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.bearerToken) {
      headers['Authorization'] = `Bearer ${config.bearerToken}`;
    } else {
      // For OAuth 1.0a, we'd need to generate proper signature
      headers['Authorization'] = generateTwitterAuthHeader('GET', url, config);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as TwitterErrorResponse;
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.title || errorData.detail || `HTTP ${response.status}`,
          details: errorData.detail || errorData.title,
        },
      };
    }

    const data = await response.json() as TwitterUserResponse;
    console.log('✅ Twitter connection test successful:', data.data?.username);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Twitter connection test failed:', error);
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
 * Publish tweet to Twitter
 */
export async function publishToTwitter(
  config: TwitterConfig,
  payload: TwitterPublishPayload
): Promise<{ success: boolean; tweetId?: string; error?: any }> {
  try {
    const url = 'https://api.twitter.com/2/tweets';

    const tweetData: any = {
      text: payload.text,
    };

    if (payload.replyToTweetId) {
      tweetData.reply = {
        in_reply_to_tweet_id: payload.replyToTweetId,
      };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.bearerToken) {
      headers['Authorization'] = `Bearer ${config.bearerToken}`;
    } else {
      headers['Authorization'] = generateTwitterAuthHeader('POST', url, config);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(tweetData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as TwitterErrorResponse;
      return {
        success: false,
        error: {
          status: response.status,
          message: errorData.title || errorData.detail || `HTTP ${response.status}`,
          details: errorData.detail || errorData.title,
        },
      };
    }

    const data = await response.json() as TwitterTweetResponse;
    console.log('✅ Published to Twitter:', data.data?.id);

    return {
      success: true,
      tweetId: data.data?.id,
    };
  } catch (error: any) {
    console.error('❌ Twitter publish failed:', error);
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
 * Publish thread to Twitter
 */
export async function publishTwitterThread(
  config: TwitterConfig,
  tweets: string[]
): Promise<{ success: boolean; tweetIds?: string[]; error?: any }> {
  const tweetIds: string[] = [];
  let replyToId: string | undefined = undefined;

  try {
    for (const tweetText of tweets) {
      const result = await publishToTwitter(config, {
        text: tweetText,
        replyToTweetId: replyToId,
      });

      if (!result.success || !result.tweetId) {
        return {
          success: false,
          error: result.error || { message: 'Failed to publish tweet in thread' },
        };
      }

      tweetIds.push(result.tweetId);
      replyToId = result.tweetId; // Next tweet replies to this one
    }

    console.log('✅ Published Twitter thread:', tweetIds.length, 'tweets');

    return {
      success: true,
      tweetIds,
    };
  } catch (error: any) {
    console.error('❌ Twitter thread publish failed:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Thread publish failed',
        details: error.toString(),
      },
    };
  }
}





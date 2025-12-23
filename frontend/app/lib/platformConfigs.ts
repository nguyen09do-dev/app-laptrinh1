/**
 * Platform-specific configuration fields
 * Used by SocialPlatformConfigModal
 */

interface Field {
  key: string;
  label: string;
  type: 'text' | 'password' | 'textarea';
  placeholder?: string;
  help?: string;
  required?: boolean;
}

interface PlatformConfigDefinition {
  fields: Field[];
  docsUrl?: string;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfigDefinition> = {
  facebook: {
    fields: [
      {
        key: 'pageId',
        label: 'Facebook Page ID',
        type: 'text',
        placeholder: '123456789012345',
        help: 'Find in Page Settings > About',
        required: true,
      },
      {
        key: 'accessToken',
        label: 'Page Access Token',
        type: 'password',
        placeholder: 'EAAxxxxxxxxxxxxx',
        help: 'Generate from Facebook Developers > Tools > Access Token Tool',
        required: true,
      },
      {
        key: 'apiVersion',
        label: 'API Version (optional)',
        type: 'text',
        placeholder: 'v18.0',
        help: 'Leave empty to use default (v18.0)',
        required: false,
      },
    ],
    docsUrl: 'https://developers.facebook.com/docs/graph-api/reference/page/feed',
  },

  instagram: {
    fields: [
      {
        key: 'userId',
        label: 'Instagram Business Account ID',
        type: 'text',
        placeholder: '17841400000000000',
        help: 'Instagram Business Account ID (not username)',
        required: true,
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'EAAxxxxxxxxxxxxx',
        help: 'Generate from Facebook Developers',
        required: true,
      },
      {
        key: 'apiVersion',
        label: 'API Version (optional)',
        type: 'text',
        placeholder: 'v18.0',
        help: 'Leave empty to use default (v18.0)',
        required: false,
      },
    ],
    docsUrl: 'https://developers.facebook.com/docs/instagram-api/guides/content-publishing',
  },

  twitter: {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'text',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxx',
        help: 'From Twitter Developer Portal > Projects & Apps',
        required: true,
      },
      {
        key: 'apiSecret',
        label: 'API Secret',
        type: 'password',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxx',
        required: true,
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'text',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxx',
        required: true,
      },
      {
        key: 'accessTokenSecret',
        label: 'Access Token Secret',
        type: 'password',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxx',
        required: true,
      },
      {
        key: 'bearerToken',
        label: 'Bearer Token (optional)',
        type: 'password',
        placeholder: 'AAAAAAAAAAAAAAAAAAAAAxxxxxxxxxxxxx',
        help: 'Optional: Use Bearer Token for simpler auth',
        required: false,
      },
    ],
    docsUrl: 'https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/introduction',
  },

  linkedin: {
    fields: [
      {
        key: 'personUrn',
        label: 'Person URN',
        type: 'text',
        placeholder: 'urn:li:person:ABC123DEF456',
        help: 'Your LinkedIn Person URN (get from API /v2/me)',
        required: true,
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'AQVxxxxxxxxxxxxx',
        help: 'OAuth 2.0 Access Token with w_member_social scope',
        required: true,
      },
    ],
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api',
  },

  zalo: {
    fields: [
      {
        key: 'oaId',
        label: 'Official Account ID',
        type: 'text',
        placeholder: '1234567890123456789',
        help: 'Zalo Official Account ID',
        required: true,
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxx',
        help: 'Generate from Zalo Developer Console',
        required: true,
      },
      {
        key: 'appId',
        label: 'App ID (optional)',
        type: 'text',
        placeholder: '1234567890',
        required: false,
      },
      {
        key: 'appSecret',
        label: 'App Secret (optional)',
        type: 'password',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxx',
        required: false,
      },
    ],
    docsUrl: 'https://developers.zalo.me/docs/api/official-account-api/phat-trien/gui-tin-nhan-post-4300',
  },
};

export function getPlatformConfig(platformKey: string): PlatformConfigDefinition | undefined {
  return PLATFORM_CONFIGS[platformKey];
}





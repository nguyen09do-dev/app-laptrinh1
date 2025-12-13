/**
 * WordPress Integration Service
 * Handles blog post publishing via WordPress REST API
 */

interface WordpressConfig {
  // Basic
  name: string;
  siteUrl: string;
  defaultCategory?: string;
  defaultStatus: 'draft' | 'publish' | 'pending' | 'private';
  
  // Authentication
  username: string;
  applicationPassword: string;
  
  // Advanced
  apiBasePath?: string;
  requestTimeoutMs?: number;
  rateLimitPerMinute?: number;
  verifySSL?: boolean;
  allowInsecureHttp?: boolean;
  contentFormat?: 'html' | 'blocks' | 'markdownToHtml';
  
  // Feature flags
  featureFlags?: {
    autoCreateCategories?: boolean;
    autoUploadFeaturedImage?: boolean;
  };
}

interface PublishPayload {
  title: string;
  content: string;
  excerpt?: string;
  categories?: string[];
  status?: 'draft' | 'publish' | 'pending' | 'private';
}

interface PublishResult {
  success: boolean;
  platform: string;
  postId?: number;
  postUrl?: string;
  error?: {
    message: string;
    details?: any;
  };
}

/**
 * Validate WordPress configuration
 */
export function validateWordpressConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Config must be an object');
    return { valid: false, errors };
  }

  // Basic validation
  if (!config.name || typeof config.name !== 'string' || config.name.trim() === '') {
    errors.push('name is required and must be a non-empty string');
  }

  if (!config.siteUrl || typeof config.siteUrl !== 'string' || config.siteUrl.trim() === '') {
    errors.push('siteUrl is required and must be a non-empty string');
  } else {
    const url = config.siteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      errors.push('siteUrl must start with http:// or https://');
    }
  }

  if (!config.defaultStatus || !['draft', 'publish', 'pending', 'private'].includes(config.defaultStatus)) {
    errors.push('defaultStatus must be one of: draft, publish, pending, private');
  }

  // Authentication validation
  if (!config.username || typeof config.username !== 'string' || config.username.trim() === '') {
    errors.push('username is required and must be a non-empty string');
  }

  if (!config.applicationPassword || typeof config.applicationPassword !== 'string' || config.applicationPassword.trim() === '') {
    errors.push('applicationPassword is required and must be a non-empty string');
  }

  // Advanced validation (optional fields)
  if (config.apiBasePath && typeof config.apiBasePath !== 'string') {
    errors.push('apiBasePath must be a string');
  }

  if (config.requestTimeoutMs && (typeof config.requestTimeoutMs !== 'number' || config.requestTimeoutMs < 1000)) {
    errors.push('requestTimeoutMs must be a number >= 1000');
  }

  if (config.rateLimitPerMinute && (typeof config.rateLimitPerMinute !== 'number' || config.rateLimitPerMinute < 1)) {
    errors.push('rateLimitPerMinute must be a number >= 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize WordPress site URL
 * Remove trailing slash and path
 */
function normalizeSiteUrl(url: string): string {
  let normalized = url.trim();
  
  // Remove trailing slash
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  // Extract domain only (remove path if present)
  try {
    const urlObj = new URL(normalized);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return normalized;
  }
}

/**
 * Create Basic Auth header
 */
function createBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  return `Basic ${base64Credentials}`;
}

/**
 * Test WordPress connection
 */
export async function testWordpressConnection(
  config: WordpressConfig
): Promise<{ success: boolean; error?: string; userInfo?: any }> {
  try {
    const siteUrl = normalizeSiteUrl(config.siteUrl);
    const apiBasePath = config.apiBasePath || '/wp-json';
    const timeout = config.requestTimeoutMs || 15000;
    
    // Validate SSL if required
    if (!config.allowInsecureHttp && siteUrl.startsWith('http://')) {
      return {
        success: false,
        error: 'Insecure HTTP connection not allowed. Please use HTTPS or enable "Allow Insecure HTTP" in advanced settings.',
      };
    }

    const url = `${siteUrl}${apiBasePath}/wp/v2/users/me`;
    const authHeader = createBasicAuthHeader(config.username, config.applicationPassword);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          return {
            success: false,
            error: 'Authentication failed. Please check your username and application password.',
          };
        }
        
        if (response.status === 404) {
          return {
            success: false,
            error: 'WordPress REST API not found. Please verify your site URL and ensure REST API is enabled.',
          };
        }
        
        if (response.status === 403) {
          return {
            success: false,
            error: 'Access forbidden. REST API might be disabled or your user lacks permissions.',
          };
        }

        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        return {
          success: false,
          error: errorMessage,
        };
      }

      const userInfo = await response.json();
      
      console.log('✅ WordPress connection test successful');
      console.log('   User:', userInfo.name || userInfo.username);
      console.log('   Role:', userInfo.roles?.join(', ') || 'Unknown');

      return {
        success: true,
        userInfo: {
          id: userInfo.id,
          name: userInfo.name,
          username: userInfo.username,
          email: userInfo.email,
          roles: userInfo.roles,
        },
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          error: `Connection timeout after ${timeout/1000}s. Please check your site URL and internet connection.`,
        };
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error('❌ WordPress connection test failed:', error);
    
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      return {
        success: false,
        error: `Cannot resolve domain "${config.siteUrl}". Please verify your site URL is correct.`,
      };
    }
    
    if (error.message?.includes('ECONNREFUSED')) {
      return {
        success: false,
        error: 'Connection refused. Please verify your site is online and accessible.',
      };
    }
    
    if (error.message?.includes('certificate')) {
      return {
        success: false,
        error: 'SSL certificate error. You can disable SSL verification in advanced settings if needed.',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Unknown network error',
    };
  }
}

/**
 * Get or create category by name
 */
async function getOrCreateCategory(
  config: WordpressConfig,
  categoryName: string
): Promise<{ success: boolean; categoryId?: number; error?: string }> {
  try {
    const siteUrl = normalizeSiteUrl(config.siteUrl);
    const apiBasePath = config.apiBasePath || '/wp-json';
    const authHeader = createBasicAuthHeader(config.username, config.applicationPassword);
    
    // Search for existing category
    const searchUrl = `${siteUrl}${apiBasePath}/wp/v2/categories?search=${encodeURIComponent(categoryName)}`;
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (searchResponse.ok) {
      const categories = await searchResponse.json();
      const exactMatch = categories.find((cat: any) => cat.name.toLowerCase() === categoryName.toLowerCase());
      
      if (exactMatch) {
        console.log(`✅ Found existing category: ${categoryName} (ID: ${exactMatch.id})`);
        return { success: true, categoryId: exactMatch.id };
      }
    }

    // Category not found, create if allowed
    if (!config.featureFlags?.autoCreateCategories) {
      return {
        success: false,
        error: `Category "${categoryName}" not found and auto-create is disabled`,
      };
    }

    // Create new category
    const createUrl = `${siteUrl}${apiBasePath}/wp/v2/categories`;
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Failed to create category: HTTP ${createResponse.status}`,
      };
    }

    const newCategory = await createResponse.json();
    console.log(`✅ Created new category: ${categoryName} (ID: ${newCategory.id})`);
    
    return { success: true, categoryId: newCategory.id };
  } catch (error: any) {
    console.error(`❌ Error getting/creating category "${categoryName}":`, error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Publish blog post to WordPress
 */
export async function publishToWordpress(
  config: WordpressConfig,
  payload: PublishPayload
): Promise<PublishResult> {
  console.log('📝 Publishing to WordPress...');
  console.log('   Title:', payload.title);
  console.log('   Site:', config.siteUrl);

  try {
    const siteUrl = normalizeSiteUrl(config.siteUrl);
    const apiBasePath = config.apiBasePath || '/wp-json';
    const authHeader = createBasicAuthHeader(config.username, config.applicationPassword);
    const timeout = config.requestTimeoutMs || 15000;
    
    // Prepare category IDs
    const categoryIds: number[] = [];
    
    if (config.defaultCategory) {
      const result = await getOrCreateCategory(config, config.defaultCategory);
      if (result.success && result.categoryId) {
        categoryIds.push(result.categoryId);
      }
    }
    
    if (payload.categories && payload.categories.length > 0) {
      for (const catName of payload.categories) {
        const result = await getOrCreateCategory(config, catName);
        if (result.success && result.categoryId) {
          categoryIds.push(result.categoryId);
        }
      }
    }

    // Prepare post data
    const postData: any = {
      title: payload.title,
      content: payload.content,
      status: payload.status || config.defaultStatus || 'draft',
    };

    if (payload.excerpt) {
      postData.excerpt = payload.excerpt;
    }

    if (categoryIds.length > 0) {
      postData.categories = categoryIds;
    }

    // Format content if needed
    if (config.contentFormat === 'blocks') {
      // Convert HTML to Gutenberg blocks (simplified)
      postData.content = payload.content;
    } else if (config.contentFormat === 'markdownToHtml') {
      // Assume content is already in HTML format
      postData.content = payload.content;
    }

    // Create post
    const url = `${siteUrl}${apiBasePath}/wp/v2/posts`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ WordPress create post failed:', errorData);
        
        return {
          success: false,
          platform: 'wordpress',
          error: {
            message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            details: errorData,
          },
        };
      }

      const post = await response.json();
      
      console.log('✅ Post created successfully!');
      console.log('   Post ID:', post.id);
      console.log('   Post URL:', post.link);

      return {
        success: true,
        platform: 'wordpress',
        postId: post.id,
        postUrl: post.link,
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          platform: 'wordpress',
          error: {
            message: `Request timeout after ${timeout/1000}s`,
          },
        };
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error('❌ WordPress publish failed:', error);

    return {
      success: false,
      platform: 'wordpress',
      error: {
        message: error.message || 'Unknown error',
        details: error.stack,
      },
    };
  }
}

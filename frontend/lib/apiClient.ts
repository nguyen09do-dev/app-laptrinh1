/**
 * Centralized API client with timeout, retry, and error handling
 * Fixes: "failed to fetch" errors and slow loading times
 */

const API_BASE = 'http://localhost:3001/api';
const DEFAULT_TIMEOUT = 15000; // 15 seconds - increased for slow connections
const MAX_RETRIES = 3; // Increased retries
const RETRY_DELAY = 1500; // 1.5 seconds

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

/**
 * Create a fetch request with timeout
 */
function createFetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, signal, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Combine signals if both provided
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  const fetchPromise = fetch(url, {
    ...fetchOptions,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  }).finally(() => {
    clearTimeout(timeoutId);
  });

  return fetchPromise;
}

/**
 * Retry fetch with exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: FetchOptions = {},
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    return await createFetchWithTimeout(url, options);
  } catch (error: any) {
    // Don't retry on abort or if no retries left
    if (error.name === 'AbortError' || retries === 0) {
      throw error;
    }

    // Don't retry on client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      throw error;
    }

    // Wait before retry with exponential backoff
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));

    return fetchWithRetry(url, options, retries - 1);
  }
}

/**
 * Main API client function
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ success: boolean; data?: T; error?: string; count?: number; message?: string }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      timeout: options.timeout || DEFAULT_TIMEOUT,
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `Server returned ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error: any) {
    // Handle different error types with better messages
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw new Error('Request timeout - Server đang phản hồi chậm. Vui lòng thử lại sau.');
    }
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.message?.includes('Network request failed')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa (port 3001)\n2. Kết nối mạng có ổn định không');
    }

    // Re-throw with original message
    throw error;
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  endpoint: string,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
  const result = await apiClient<T>(endpoint, {
    ...options,
    method: 'GET',
  });

  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data as T;
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<T> {
  const result = await apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data as T;
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<T> {
  const result = await apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data as T;
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = any>(
  endpoint: string,
  body?: any,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<T> {
  const result = await apiClient<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data as T;
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
  const result = await apiClient<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });

  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data as T;
}

/**
 * Create AbortController for use in useEffect cleanup
 */
export function createAbortController(): AbortController {
  return new AbortController();
}


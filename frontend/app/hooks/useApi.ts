import useSWR from 'swr';

const API_BASE = 'http://localhost:3001/api';

// Timeout configuration - increased for slow connections
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;

// Retry with exponential backoff
const fetchWithRetry = async (url: string, retries = MAX_RETRIES): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // Don't retry on 4xx errors (client errors)
      if (res.status >= 400 && res.status < 500) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      if (retries > 0) {
        console.log(`⚠️ Request timeout, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (MAX_RETRIES - retries + 1))); // Exponential backoff
        return fetchWithRetry(url, retries - 1);
      }
      throw new Error('Server không phản hồi. Vui lòng kiểm tra backend đã chạy chưa.');
    }
    
    // Network error or other errors
    if (retries > 0 && (error.message.includes('fetch') || error.message.includes('network'))) {
      console.log(`⚠️ Network error, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry(url, retries - 1);
    }
    
    throw error;
  }
};

const fetcher = async (url: string) => {
  try {
    return await fetchWithRetry(url);
  } catch (error: any) {
    console.error(`❌ API call failed: ${url}`, error);
    throw error;
  }
};

export function useIdeas() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/ideas`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
      onError: (err) => {
        console.error('Ideas fetch error:', err.message);
      },
    }
  );

  return {
    ideas: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useBriefs() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/briefs`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
      onError: (err) => {
        console.error('Briefs fetch error:', err.message);
      },
    }
  );

  return {
    briefs: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useContents() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/contents`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
      onError: (err) => {
        console.error('Contents fetch error:', err.message);
      },
    }
  );

  return {
    contents: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTimeline(days: number = 7) {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/analytics/timeline?days=${days}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
      onError: (err) => {
        console.error('Timeline fetch error:', err.message);
      },
    }
  );

  return {
    timeline: data,
    isLoading,
    isError: error,
  };
}

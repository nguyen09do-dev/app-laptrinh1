import useSWR from 'swr';
import { apiGet } from '@/lib/apiClient';

const API_BASE = 'http://localhost:3001/api';

// Optimized fetcher with timeout and error handling
const fetcher = async (url: string) => {
  try {
    // Extract endpoint from full URL
    const endpoint = url.replace(API_BASE, '');
    return await apiGet(endpoint, { timeout: 15000 }); // Increased timeout
  } catch (error: any) {
    console.error('Fetch error:', error);
    // Better error messages
    if (error.message?.includes('timeout') || error.message?.includes('aborted')) {
      throw new Error('Request timeout - Server đang phản hồi chậm. Vui lòng thử lại.');
    }
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.');
    }
    throw new Error(error.message || 'Failed to fetch documents');
  }
};

export function useDocuments(filters?: {
  author?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.author) queryParams.append('author', filters.author);
  if (filters?.tags?.length) queryParams.append('tags', filters.tags.join(','));
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.offset) queryParams.append('offset', filters.offset.toString());

  const url = `${API_BASE}/rag/documents${queryParams.toString() ? `?${queryParams}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000, // Increased cache time
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    }
  );

  return {
    documents: data?.documents || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useDocumentStats() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE}/rag/stats`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Stats change less frequently
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    }
  );

  return {
    stats: data?.stats || null,
    isLoading,
    isError: error,
  };
}

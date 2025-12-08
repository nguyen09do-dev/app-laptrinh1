import useSWR from 'swr';

const API_BASE = 'http://localhost:3001/api';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('API request failed');
  const data = await res.json();
  return data.success !== false ? data : null;
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
      dedupingInterval: 5000,
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
      dedupingInterval: 10000,
    }
  );

  return {
    stats: data?.stats || null,
    isLoading,
    isError: error,
  };
}

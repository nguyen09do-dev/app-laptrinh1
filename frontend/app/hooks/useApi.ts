import useSWR from 'swr';

const API_BASE = 'http://localhost:3001/api';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('API request failed');
  const data = await res.json();
  return data.success ? data.data : null;
};

export function useIdeas() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/ideas`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
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
    }
  );

  return {
    timeline: data,
    isLoading,
    isError: error,
  };
}

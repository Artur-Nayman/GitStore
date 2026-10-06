import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearchStore } from '../useSearch';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useSearchStore Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useSearchStore.setState({
      results: [],
      isLoading: false,
      isLoadingMore: false,
      error: null,
      hasSearched: false,
      totalAvailable: 0,
      currentPage: 0,
      lastSearchParams: null,
    });
  });

  it('should handle API errors during search and set the error state', async () => {
    const errorMessage = 'API rate limit exceeded';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      headers: new Headers(),
      json: async () => ({ message: errorMessage })
    } as any);

    const store = useSearchStore.getState();
    await store.search('react', 'all', 'all', 'stars', false);

    const updatedStore = useSearchStore.getState();
    expect(updatedStore.isLoading).toBe(false);
    expect(updatedStore.error).toBe(errorMessage);
    expect(updatedStore.results).toEqual([]);
  });

  it('should handle API errors during search with fallback error message if JSON parsing fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      headers: new Headers(),
      json: async () => { throw new Error('Invalid JSON'); }
    } as any);

    const store = useSearchStore.getState();
    await store.search('react', 'all', 'all', 'stars', false);

    const updatedStore = useSearchStore.getState();
    expect(updatedStore.isLoading).toBe(false);
    expect(updatedStore.error).toBe('GitHub API request failed');
  });

  it('should handle network errors (fetch throws) during search', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'));

    const store = useSearchStore.getState();
    await store.search('react', 'all', 'all', 'stars', false);

    const updatedStore = useSearchStore.getState();
    expect(updatedStore.isLoading).toBe(false);
    expect(updatedStore.error).toBe('Network Error');
  });

  it('should handle API errors during loadMore', async () => {
    // Setup initial state so loadMore can run
    useSearchStore.setState({
      lastSearchParams: { query: 'react', category: 'all', platform: 'all', sort: 'stars', hasReleases: false },
      currentPage: 1,
      totalAvailable: 100,
      isLoadingMore: false,
      results: [{ id: 1, full_name: 'test/test', description: null, html_url: '', stargazers_count: 10, language: null, topics: [], avatar_url: '', assets: [], pushed_at: '' }]
    });

    const errorMessage = 'Server Error';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      headers: new Headers(),
      json: async () => ({ message: errorMessage })
    } as any);

    const store = useSearchStore.getState();
    await store.loadMore();

    const updatedStore = useSearchStore.getState();
    expect(updatedStore.isLoadingMore).toBe(false);
    expect(updatedStore.error).toBe(errorMessage);
  });

  it('should handle fetch rejection during loadMore', async () => {
    // Setup initial state so loadMore can run
    useSearchStore.setState({
      lastSearchParams: { query: 'react', category: 'all', platform: 'all', sort: 'stars', hasReleases: false },
      currentPage: 1,
      totalAvailable: 100,
      isLoadingMore: false,
    });

    mockFetch.mockRejectedValueOnce(new Error('Network disconnection'));

    const store = useSearchStore.getState();
    await store.loadMore();

    const updatedStore = useSearchStore.getState();
    expect(updatedStore.isLoadingMore).toBe(false);
    expect(updatedStore.error).toBe('Network disconnection');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSearchStore } from '../useSearch';

describe('useSearchStore', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    useSearchStore.setState({
      results: [],
      isLoading: false,
      isLoadingMore: false,
      error: null,
      hasSearched: false,
      currentPlatform: 'all',
      currentSort: 'stars',
      totalAvailable: 0,
      currentPage: 0,
      lastSearchParams: null,
    });
    vi.resetAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('loadMore error handling', () => {
    it('handles network error in loadMore API call', async () => {
      // Mock network error
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      // Set initial state to allow loadMore
      useSearchStore.setState({
        lastSearchParams: { query: 'test', category: 'all', platform: 'all', sort: 'stars', hasReleases: false },
        currentPage: 1,
        totalAvailable: 100,
        isLoadingMore: false,
      });

      await useSearchStore.getState().loadMore();

      const state = useSearchStore.getState();
      expect(state.isLoadingMore).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('handles API error response with JSON message in loadMore', async () => {
      // Mock API error with JSON
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        headers: new Headers({
          'X-RateLimit-Remaining': '60',
          'X-RateLimit-Reset': '0'
        }),
        json: vi.fn().mockResolvedValue({ message: 'API rate limit exceeded' })
      });

      useSearchStore.setState({
        lastSearchParams: { query: 'test', category: 'all', platform: 'all', sort: 'stars', hasReleases: false },
        currentPage: 1,
        totalAvailable: 100,
        isLoadingMore: false,
      });

      await useSearchStore.getState().loadMore();

      const state = useSearchStore.getState();
      expect(state.isLoadingMore).toBe(false);
      expect(state.error).toBe('API rate limit exceeded');
    });

    it('handles API error response without JSON message in loadMore', async () => {
      // Mock API error without JSON message
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        headers: new Headers({
          'X-RateLimit-Remaining': '60',
          'X-RateLimit-Reset': '0'
        }),
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      });

      useSearchStore.setState({
        lastSearchParams: { query: 'test', category: 'all', platform: 'all', sort: 'stars', hasReleases: false },
        currentPage: 1,
        totalAvailable: 100,
        isLoadingMore: false,
      });

      await useSearchStore.getState().loadMore();

      const state = useSearchStore.getState();
      expect(state.isLoadingMore).toBe(false);
      expect(state.error).toBe('GitHub API request failed');
    });
  });

  describe('loadMore success', () => {
    it('successfully loads more items and updates state', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({
          'X-RateLimit-Remaining': '60',
          'X-RateLimit-Reset': '0'
        }),
        json: vi.fn().mockResolvedValue({
          items: [{
            id: 1,
            full_name: 'test/repo',
            owner: { login: 'test', avatar_url: 'url' },
            description: 'desc',
            html_url: 'url',
            stargazers_count: 10,
            language: 'TS',
            topics: [],
            pushed_at: 'date'
          }],
          total_count: 100
        })
      });

      useSearchStore.setState({
        lastSearchParams: { query: 'test', category: 'all', platform: 'all', sort: 'stars', hasReleases: false },
        currentPage: 1,
        totalAvailable: 100,
        isLoadingMore: false,
        results: [{ id: 0, full_name: 'old/repo', stargazers_count: 5 }] as any[]
      });

      await useSearchStore.getState().loadMore();

      const state = useSearchStore.getState();
      expect(state.isLoadingMore).toBe(false);
      expect(state.error).toBe(null);
      expect(state.currentPage).toBe(2);
      expect(state.results.length).toBe(2);
    });
  });
});

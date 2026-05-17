import { create } from 'zustand';
import { useAuthStore } from '../store/auth';
import { useCacheStore } from '../store/cache';
import { buildTopicQuery } from '../lib/categories';
import { filterAssetsByPlatform, type Platform } from '../lib/platforms';

export interface ReleaseAsset {
  name: string;
  url: string;
}

export interface AppResult {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  avatar_url: string;
  assets: ReleaseAsset[];
}

interface SearchState {
  results: AppResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  currentPlatform: Platform;
  search: (query: string, category: string, platform: Platform) => Promise<void>;
  refresh: () => Promise<void>;
}

const GITHUB_API = 'https://api.github.com';

const buildHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = useAuthStore.getState().token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const parseRateLimit = (response: Response) => {
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '60', 10);
  const reset = parseInt(response.headers.get('X-RateLimit-Reset') || '0', 10);
  useAuthStore.getState().updateRateLimit(remaining, reset);
};

const fetchLatestRelease = async (owner: string, repo: string, platform: Platform): Promise<ReleaseAsset[]> => {
  const repoKey = `${owner}/${repo}`;
  const cached = useCacheStore.getState().getReleaseCache(repoKey);
  if (cached) return cached.data as ReleaseAsset[];

  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/releases/latest`, {
    headers: buildHeaders(),
  });
  parseRateLimit(response);

  if (!response.ok) return [];

  const data = await response.json();
  const assets = filterAssetsByPlatform(
    data.assets || [],
    platform
  );

  useCacheStore.getState().setReleaseCache(repoKey, assets);
  return assets;
};

export const useSearchStore = create<SearchState>((set, get) => ({
  results: [],
  isLoading: false,
  error: null,
  hasSearched: false,
  currentPlatform: 'windows' as Platform,
  search: async (query, category, platform) => {
    if (!query.trim()) return;

    set({ isLoading: true, error: null, currentPlatform: platform });

    const cacheKey = `${query}:${category}:${platform}`;
    const cached = useCacheStore.getState().getSearchCache(cacheKey);

    if (cached) {
      set({ results: cached.data as AppResult[], hasSearched: true, isLoading: false });
    }

    try {
      const topicQuery = buildTopicQuery(category);
      const searchQuery = topicQuery
        ? `${query}+${topicQuery}`
        : query;

      const url = `${GITHUB_API}/search/repositories?q=${searchQuery}&sort=stars&order=desc&per_page=30`;

      const response = await fetch(url, { headers: buildHeaders() });
      parseRateLimit(response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'GitHub API request failed');
      }

      const data = await response.json();
      const repos = data.items || [];

      const resultsWithAssets = await Promise.all(
        repos.map(async (repo: any) => {
          const assets = await fetchLatestRelease(repo.owner.login, repo.name, platform);
          return {
            id: repo.id,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            language: repo.language,
            topics: repo.topics || [],
            avatar_url: repo.owner.avatar_url,
            assets,
          };
        })
      );

      const filtered = resultsWithAssets.filter((r: AppResult) => r.assets.length > 0);

      useCacheStore.getState().setSearchCache(cacheKey, filtered);
      set({ results: filtered, hasSearched: true, isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message || 'Search failed', isLoading: false });
    }
  },
  refresh: async () => {
    useCacheStore.getState().clearCache();
    const state = get();
    if (state.results.length > 0) {
      await state.search('', 'all', 'windows');
    }
  },
}));

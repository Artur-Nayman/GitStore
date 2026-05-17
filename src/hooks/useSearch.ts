import { create } from 'zustand';
import { useAuthStore } from '../store/auth';
import { useCacheStore } from '../store/cache';
import { filterAssetsByPlatform, type Platform } from '../lib/platforms';

export type SortOption = 'stars' | 'updated';

const PAGE_SIZE = 50;

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
  pushed_at: string;
}

interface SearchState {
  results: AppResult[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasSearched: boolean;
  currentPlatform: Platform;
  currentSort: SortOption;
  totalAvailable: number;
  currentPage: number;
  lastSearchParams: { query: string; category: string; platform: Platform; sort: SortOption; hasReleases: boolean } | null;
  search: (query: string, category: string, platform: Platform, sort: SortOption, hasReleases: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
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
  const repoKey = `${owner}/${repo}:${platform}`;
  const cached = useCacheStore.getState().getReleaseCache(repoKey);
  if (cached) return cached.data as ReleaseAsset[];

  try {
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
  } catch {
    return [];
  }
};

const buildSearchQuery = (keyword: string, category: string, platform: Platform, hasReleases: boolean): string => {
  const parts: string[] = [];

  if (keyword.trim()) {
    parts.push(keyword.trim());
  }

  const platformKeywords: Record<Platform, string[]> = {
    all: [],
    windows: ['windows', 'win32', 'win64'],
    linux: ['linux', 'ubuntu', 'debian', 'fedora'],
    android: ['android', 'apk', 'mobile app'],
  };

  const platKw = platformKeywords[platform];
  if (platKw && platKw.length > 0) {
    const platQuery = platKw.map(k => `"${k}"`).join(' OR ');
    if (parts.length > 0) {
      parts.push(platQuery);
    } else {
      parts.push(`stars:>0 ${platQuery}`);
    }
  }

  const categoryKeywords: Record<string, string[]> = {
    'dev-tools': ['developer tools', 'code editor', 'IDE', 'devtools'],
    'media': ['media player', 'audio player', 'video player', 'music player', 'podcast'],
    'communication': ['chat app', 'messaging', 'email client', 'voip', 'IRC client'],
    'utilities': ['file manager', 'system utility', 'clipboard manager', 'app launcher'],
    'games': ['game engine', 'game launcher', 'emulator', 'game client'],
    'security': ['password manager', 'encryption tool', 'firewall', 'privacy tool'],
    'networking': ['vpn client', 'proxy tool', 'web browser', 'DNS', 'torrent client'],
    'productivity': ['note taking', 'task manager', 'calendar app', 'kanban board'],
    'graphics': ['image editor', 'photo editor', 'drawing app', '3D modeling', 'CAD'],
    'science': ['science tool', 'education app', 'math software', 'physics simulation'],
    'finance': ['finance app', 'accounting software', 'budget tracker', 'crypto wallet'],
    'ai-ml': ['machine learning', 'AI tool', 'chatbot', 'neural network', 'LLM'],
    'cloud': ['cloud tool', 'docker tool', 'kubernetes', 'CI/CD', 'monitoring tool', 'backup tool'],
    'terminal': ['terminal emulator', 'shell', 'command line', 'CLI tool', 'REPL'],
    'data': ['database tool', 'data visualization', 'analytics tool', 'ETL'],
  };

  if (category && category !== 'all') {
    const keywords = categoryKeywords[category] || [];
    if (keywords.length > 0) {
      const kwQuery = keywords.map(k => `"${k}"`).join(' OR ');
      parts.push(kwQuery);
    }
  }

  if (hasReleases) {
    if (parts.length === 0) {
      return 'stars:>0 has:releases';
    }
    parts.push('has:releases');
  }

  if (parts.length === 0) {
    return 'stars:>100';
  }

  return parts.join(' ');
};

const processRepos = async (repos: any[], platform: Platform): Promise<AppResult[]> => {
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
        pushed_at: repo.pushed_at,
      };
    })
  );

  return resultsWithAssets.sort((a, b) => b.stargazers_count - a.stargazers_count);
};

export const useSearchStore = create<SearchState>((set, get) => ({
  results: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasSearched: false,
  currentPlatform: 'all' as Platform,
  currentSort: 'stars' as SortOption,
  totalAvailable: 0,
  currentPage: 0,
  lastSearchParams: null,
  search: async (query, category, platform, sort, hasReleases) => {
    set({ isLoading: true, error: null, currentPlatform: platform, currentSort: sort, results: [], currentPage: 0 });

    const searchQuery = buildSearchQuery(query, category, platform, hasReleases);
    const sortParam = sort === 'updated' ? 'updated' : 'stars';

    try {
      const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=${sortParam}&order=desc&per_page=${PAGE_SIZE}&page=1`;

      const response = await fetch(url, { headers: buildHeaders() });
      parseRateLimit(response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'GitHub API request failed');
      }

      const data = await response.json();
      const repos = data.items || [];
      const total = Math.min(data.total_count || 0, 1000);

      let combined = await processRepos(repos, platform);

      if (hasReleases) {
        combined = combined.filter(r => r.assets.length > 0);
      }

      set({
        results: combined,
        totalAvailable: total,
        currentPage: 1,
        hasSearched: true,
        isLoading: false,
        error: null,
        lastSearchParams: { query, category, platform, sort, hasReleases },
      });
    } catch (err: any) {
      console.error('Search error:', err);
      set({ error: err.message || 'Search failed', isLoading: false });
    }
  },
  loadMore: async () => {
    const state = get();
    if (!state.lastSearchParams || state.isLoadingMore) return;

    const nextPage = state.currentPage + 1;
    const maxPages = Math.ceil(Math.min(1000, state.totalAvailable) / PAGE_SIZE);
    if (nextPage > maxPages) return;

    set({ isLoadingMore: true });

    const { query, category, platform, sort, hasReleases } = state.lastSearchParams;
    const searchQuery = buildSearchQuery(query, category, platform, hasReleases);
    const sortParam = sort === 'updated' ? 'updated' : 'stars';

    try {
      const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=${sortParam}&order=desc&per_page=${PAGE_SIZE}&page=${nextPage}`;

      const response = await fetch(url, { headers: buildHeaders() });
      parseRateLimit(response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'GitHub API request failed');
      }

      const data = await response.json();
      const repos = data.items || [];

      let newResults = await processRepos(repos, platform);

      if (hasReleases) {
        newResults = newResults.filter(r => r.assets.length > 0);
      }

      set({
        results: [...state.results, ...newResults],
        currentPage: nextPage,
        isLoadingMore: false,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load more', isLoadingMore: false });
    }
  },
  refresh: async () => {
    useCacheStore.getState().clearCache();
    const state = get();
    if (state.lastSearchParams) {
      const { query, category, platform, sort, hasReleases } = state.lastSearchParams;
      await state.search(query, category, platform, sort, hasReleases);
    }
  },
}));

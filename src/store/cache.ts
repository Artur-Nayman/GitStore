import { create } from 'zustand';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

interface CacheState {
  searchCache: Record<string, CacheEntry>;
  releaseCache: Record<string, CacheEntry>;
  getSearchCache: (query: string) => CacheEntry | null;
  setSearchCache: (query: string, data: unknown, ttl?: number) => void;
  getReleaseCache: (repoKey: string) => CacheEntry | null;
  setReleaseCache: (repoKey: string, data: unknown, ttl?: number) => void;
  clearCache: () => void;
}

const DEFAULT_TTL = 3600 * 1000;

export const useCacheStore = create<CacheState>()((set, get) => ({
  searchCache: {},
  releaseCache: {},
  getSearchCache: (query) => {
    const entry = get().searchCache[query];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      const newCache = { ...get().searchCache };
      delete newCache[query];
      set({ searchCache: newCache });
      return null;
    }
    return entry;
  },
  setSearchCache: (query, data, ttl = DEFAULT_TTL) => {
    set((state) => ({
      searchCache: {
        ...state.searchCache,
        [query]: { data, timestamp: Date.now(), ttl },
      },
    }));
  },
  getReleaseCache: (repoKey) => {
    const entry = get().releaseCache[repoKey];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      const newCache = { ...get().releaseCache };
      delete newCache[repoKey];
      set({ releaseCache: newCache });
      return null;
    }
    return entry;
  },
  setReleaseCache: (repoKey, data, ttl = DEFAULT_TTL) => {
    set((state) => ({
      releaseCache: {
        ...state.releaseCache,
        [repoKey]: { data, timestamp: Date.now(), ttl },
      },
    }));
  },
  clearCache: () => set({ searchCache: {}, releaseCache: {} }),
}));

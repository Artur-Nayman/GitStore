import { create } from 'zustand';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

interface CacheState {
  releaseCache: Record<string, CacheEntry>;
  getReleaseCache: (repoKey: string) => CacheEntry | null;
  setReleaseCache: (repoKey: string, data: unknown, ttl?: number) => void;
  clearCache: () => void;
}

const DEFAULT_TTL = 3600 * 1000;

export const useCacheStore = create<CacheState>()((set, get) => ({
  releaseCache: {},
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
  clearCache: () => set({ releaseCache: {} }),
}));

import { useEffect, useRef, useCallback } from 'react';
import { useSearchStore, type SortOption } from '../hooks/useSearch';
import { initAuth } from '../store/auth';
import { type Platform } from '../lib/platforms';
import SearchBar from '../components/SearchBar';
import AppCard from '../components/AppCard';
import AuthButton from '../components/AuthButton';

export default function Landing() {
  const { results, isLoading, isLoadingMore, error, hasSearched, totalAvailable, search, loadMore } = useSearchStore();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const handleSearch = (query: string, category: string, platform: Platform, sort: SortOption, hasReleases: boolean) => {
    search(query, category, platform, sort, hasReleases);
  };

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !isLoadingMore && results.length > 0) {
      const state = useSearchStore.getState();
      const maxPages = Math.ceil(Math.min(1000, state.totalAvailable) / 50);
      if (state.currentPage < maxPages) {
        loadMore();
      }
    }
  }, [isLoadingMore, results.length, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasSearched) return;

    const observer = new IntersectionObserver(handleObserver, { rootMargin: '400px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasSearched, handleObserver]);

  const loadedCount = results.length;
  const maxPages = Math.ceil(Math.min(1000, totalAvailable) / 50);
  const hasMore = totalAvailable > loadedCount && useSearchStore.getState().currentPage < maxPages;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!hasSearched ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-gitstore-accent mb-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h1 className="text-5xl font-bold mb-4">
              Discover Open Source <span className="text-gitstore-accent">Apps</span>
            </h1>
            <p className="text-xl text-gitstore-muted max-w-2xl">
              Search, filter, and install production-ready applications directly from GitHub.
              Zero infrastructure. 100% privacy.
            </p>
          </div>

          <SearchBar onSearch={handleSearch} />

          <div className="mt-8">
            <AuthButton />
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold mb-1">Smart Search</h3>
              <p className="text-sm text-gitstore-muted">Advanced filters by category and platform</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">Instant Install</h3>
              <p className="text-sm text-gitstore-muted">Direct links to compiled binaries</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold mb-1">Zero Tracking</h3>
              <p className="text-sm text-gitstore-muted">All processing happens locally</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gitstore-danger/10 border border-gitstore-danger rounded-lg text-gitstore-danger">
              {error}
            </div>
          )}

          {isLoading && results.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-gitstore-accent" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gitstore-muted">
                Showing {loadedCount} of {totalAvailable.toLocaleString()} apps
              </p>
              {results.map(app => (
                <AppCard key={app.id} app={app} />
              ))}
              <div ref={sentinelRef} className="flex justify-center py-8">
                {isLoadingMore ? (
                  <div className="flex items-center gap-3 text-gitstore-muted">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading 50 more...
                  </div>
                ) : hasMore ? (
                  <button onClick={loadMore} className="btn-secondary px-8">
                    Load 50 more
                  </button>
                ) : (
                  <p className="text-sm text-gitstore-muted">No more results</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gitstore-muted">No apps found matching your criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

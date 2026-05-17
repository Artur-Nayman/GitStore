import { useEffect } from 'react';
import { useSearchStore } from '../hooks/useSearch';
import { initAuth } from '../store/auth';
import SearchBar from '../components/SearchBar';
import AppCard from '../components/AppCard';
import AuthButton from '../components/AuthButton';

export default function Landing() {
  const { results, isLoading, error, hasSearched, search } = useSearchStore();

  useEffect(() => {
    initAuth();
  }, []);

  const handleSearch = (query: string, category: string, platform: string) => {
    search(query, category, platform as any);
  };

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
                Found {results.length} app{results.length !== 1 ? 's' : ''}
              </p>
              {results.map(app => (
                <AppCard key={app.id} app={app} />
              ))}
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

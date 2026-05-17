import { useAuthStore } from '../store/auth';
import { useCacheStore } from '../store/cache';
import AuthButton from '../components/AuthButton';

export default function Settings() {
  const { isAuthenticated, token } = useAuthStore();
  const { clearCache } = useCacheStore();

  const { searchCache, releaseCache } = useCacheStore();
  const cacheSize = Object.keys(searchCache).length + Object.keys(releaseCache).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gitstore-muted">
                {isAuthenticated ? 'Authenticated with GitHub' : 'Not authenticated'}
              </p>
              {isAuthenticated && (
                <p className="text-sm text-gitstore-muted mt-1 font-mono">
                  Token: {token?.slice(0, 10)}...{token?.slice(-4)}
                </p>
              )}
            </div>
            <AuthButton />
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Cache</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gitstore-muted">
                {cacheSize} entries cached
              </p>
              <p className="text-sm text-gitstore-muted mt-1">
                Search: {Object.keys(searchCache).length} | Releases: {Object.keys(releaseCache).length}
              </p>
            </div>
            <button onClick={clearCache} className="btn-secondary">
              Clear Cache
            </button>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <div className="space-y-2 text-sm text-gitstore-muted">
            <p>Client ID: {import.meta.env.VITE_GITHUB_CLIENT_ID ? 'Configured' : 'Not set'}</p>
            <p>OAuth URL: {import.meta.env.VITE_OAUTH_REDIRECT_URL ? 'Configured' : 'Not set'}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

import { useAuthStore } from '../store/auth';
import { useCacheStore } from '../store/cache';
import AuthButton from '../components/AuthButton';

export default function Settings() {
  const { isAuthenticated, token } = useAuthStore();
  const { searchCache, releaseCache, clearCache } = useCacheStore();

  const cacheSize = Object.keys(searchCache).length + Object.keys(releaseCache).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gitstore-success font-medium">Authenticated</p>
                <p className="text-sm text-gitstore-muted mt-1 font-mono">
                  Token: {token?.slice(0, 8)}...{token?.slice(-4)}
                </p>
                <p className="text-xs text-gitstore-muted mt-1">
                  5,000 requests/hour
                </p>
              </div>
              <AuthButton />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-gitstore-muted">Not authenticated</p>
                <p className="text-sm text-gitstore-muted mt-1">
                  60 requests/hour (unauthenticated limit)
                </p>
              </div>
              <AuthButton />
            </div>
          )}
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
          <h2 className="text-xl font-semibold mb-4">How to get a token</h2>
          <ol className="space-y-2 text-sm text-gitstore-muted list-decimal list-inside">
            <li>Go to <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-gitstore-accent hover:underline">github.com/settings/tokens/new</a></li>
            <li>Give it a name (e.g., "GitStore")</li>
            <li>No scopes needed — leave all unchecked</li>
            <li>Click "Generate token"</li>
            <li>Copy the token and paste it above</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

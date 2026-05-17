import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useRateLimit } from '../hooks/useRateLimit';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuthStore();
  const { rateLimitRemaining, getColor } = useRateLimit();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gitstore-border bg-gitstore-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <svg className="w-8 h-8 text-gitstore-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-xl font-bold text-gitstore-text">GitStore</span>
            </Link>

            <nav className="flex items-center gap-4">
              {isAuthenticated && (
                <div className="flex items-center gap-2 text-sm">
                  <span className={getColor()}>{rateLimitRemaining}</span>
                  <span className="text-gitstore-muted">requests left</span>
                </div>
              )}
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/settings'
                    ? 'bg-gitstore-accent/10 text-gitstore-accent'
                    : 'text-gitstore-muted hover:text-gitstore-text'
                }`}
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gitstore-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gitstore-muted">
            GitStore - Zero-Infrastructure Open Source App Marketplace
          </p>
        </div>
      </footer>
    </div>
  );
}

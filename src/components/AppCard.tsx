import { AppResult } from '../hooks/useSearch';
import InstallButton from './InstallButton';

interface AppCardProps {
  app: AppResult;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

export default function AppCard({ app }: AppCardProps) {
  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <img
          src={app.avatar_url}
          alt=""
          className="w-12 h-12 rounded-lg bg-gitstore-bg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <a
                href={app.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-gitstore-accent hover:text-gitstore-accentHover"
              >
                {app.full_name}
              </a>
              {app.description && (
                <p className="mt-1 text-sm text-gitstore-muted line-clamp-2">
                  {app.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 text-sm text-gitstore-muted shrink-0">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{app.stargazers_count.toLocaleString()}</span>
              </div>
              {app.pushed_at && (
                <div className="flex items-center gap-1 text-xs">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  <span>{formatDate(app.pushed_at)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {app.language && (
              <span className="px-2 py-1 text-xs rounded-full bg-gitstore-bg text-gitstore-muted">
                {app.language}
              </span>
            )}
            {app.topics.slice(0, 3).map(topic => (
              <span
                key={topic}
                className="px-2 py-1 text-xs rounded-full bg-gitstore-accent/10 text-gitstore-accent"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {app.assets.length > 0 ? (
              app.assets.map(asset => (
                <InstallButton key={asset.name} asset={asset} />
              ))
            ) : (
              <a
                href={app.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 text-sm opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span>View on GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

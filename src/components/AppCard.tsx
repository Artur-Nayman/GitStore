import { AppResult } from '../hooks/useSearch';
import InstallButton from './InstallButton';

interface AppCardProps {
  app: AppResult;
}

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
            <div className="flex items-center gap-1 text-sm text-gitstore-muted shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{app.stargazers_count.toLocaleString()}</span>
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
            {app.assets.map(asset => (
              <InstallButton key={asset.name} asset={asset} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

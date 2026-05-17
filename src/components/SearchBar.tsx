import { useState } from 'react';
import { useSearchStore } from '../hooks/useSearch';
import { detectPlatform, platformLabels, type Platform } from '../lib/platforms';
import { categories } from '../lib/categories';

interface SearchBarProps {
  onSearch: (query: string, category: string, platform: Platform) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const { isLoading } = useSearchStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [platform, setPlatform] = useState<Platform>(detectPlatform());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, category, platform);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for apps on GitHub..."
          className="input-primary flex-1"
        />
        <button type="submit" className="btn-primary" disabled={isLoading || !query.trim()}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching
            </span>
          ) : (
            'Search'
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gitstore-muted mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-primary py-2"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gitstore-muted mb-1">Platform</label>
          <div className="flex gap-2">
            {(Object.keys(platformLabels) as Platform[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  platform === p
                    ? 'bg-gitstore-accent text-white'
                    : 'bg-gitstore-surface border border-gitstore-border text-gitstore-muted hover:text-gitstore-text'
                }`}
              >
                {platformLabels[p]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

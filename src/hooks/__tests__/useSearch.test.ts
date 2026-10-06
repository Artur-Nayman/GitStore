import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchLatestRelease } from '../useSearch';
import { useCacheStore } from '../../store/cache';
import { useAuthStore } from '../../store/auth';

describe('fetchLatestRelease', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useCacheStore.getState().clearCache();
    useAuthStore.getState().clearToken();
    global.fetch = vi.fn();
  });

  it('returns cached data if available', async () => {
    const cachedData = [{ name: 'app.exe', url: 'http://example.com/app.exe' }];
    useCacheStore.getState().setReleaseCache('owner/repo:windows', cachedData);

    const result = await fetchLatestRelease('owner', 'repo', 'windows');

    expect(result).toEqual(cachedData);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches from API and returns empty array on non-ok response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      headers: new Headers(),
    });

    const result = await fetchLatestRelease('owner', 'repo', 'windows');

    expect(result).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/releases/latest',
      expect.any(Object)
    );
  });

  it('catches error and returns empty array', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchLatestRelease('owner', 'repo', 'windows');

    expect(result).toEqual([]);
  });

  it('fetches from API and filters assets correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      json: async () => ({
        assets: [
          { name: 'app.exe', browser_download_url: 'http://example.com/app.exe' },
          { name: 'app.dmg', browser_download_url: 'http://example.com/app.dmg' },
        ],
      }),
    });

    const result = await fetchLatestRelease('owner', 'repo', 'windows');

    expect(result).toEqual([{ name: 'app.exe', url: 'http://example.com/app.exe' }]);
    expect(useCacheStore.getState().getReleaseCache('owner/repo:windows')?.data).toEqual([
      { name: 'app.exe', url: 'http://example.com/app.exe' },
    ]);
  });
});

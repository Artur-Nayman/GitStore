import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOAuth } from '../useOAuth';
import { useAuthStore } from '../../store/auth';

describe('useOAuth', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    useAuthStore.setState({ isAuthenticated: false, token: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with empty inputs', () => {
    const { result } = renderHook(() => useOAuth());
    expect(result.current.tokenInput).toBe('');
    expect(result.current.error).toBe('');
  });

  it('should validate token format starting with ghp_', async () => {
    const { result } = renderHook(() => useOAuth());

    await act(async () => {
      result.current.setTokenInput('invalid_token');
    });

    await act(async () => {
      await result.current.submitToken();
    });

    expect(result.current.error).toBe('Token must start with "ghp_" or "github_pat_"');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('should handle successful token submission', async () => {
    const mockResponse = { ok: true };
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse as Response);

    const { result } = renderHook(() => useOAuth());

    await act(async () => {
      result.current.setTokenInput('ghp_valid_token');
    });

    await act(async () => {
      await result.current.submitToken();
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('https://api.github.com/user', {
      headers: {
        'Authorization': 'Bearer ghp_valid_token',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    expect(result.current.error).toBe('');
    expect(result.current.tokenInput).toBe('');
    expect(useAuthStore.getState().token).toBe('ghp_valid_token');
  });

  it('should handle API error (invalid token)', async () => {
    const mockResponse = { ok: false };
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse as Response);

    const { result } = renderHook(() => useOAuth());

    await act(async () => {
      result.current.setTokenInput('ghp_invalid_token');
    });

    await act(async () => {
      await result.current.submitToken();
    });

    expect(result.current.error).toBe('Invalid token. Check GitHub for a valid Personal Access Token.');
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('should handle network error (fetch failure)', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useOAuth());

    await act(async () => {
      result.current.setTokenInput('ghp_token');
    });

    await act(async () => {
      await result.current.submitToken();
    });

    expect(result.current.error).toBe('Failed to validate token. Check your connection.');
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('should clear token and errors on logout', async () => {
    useAuthStore.setState({ isAuthenticated: true, token: 'some_token' });
    const { result } = renderHook(() => useOAuth());

    await act(async () => {
      result.current.setTokenInput('input');
      await result.current.logout();
    });

    expect(result.current.tokenInput).toBe('');
    expect(result.current.error).toBe('');
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

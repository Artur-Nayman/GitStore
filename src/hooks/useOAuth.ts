import { useState } from 'react';
import { useAuthStore } from '../store/auth';

export function useOAuth() {
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');

  const submitToken = async () => {
    if (!tokenInput.trim().startsWith('ghp_') && !tokenInput.trim().startsWith('github_pat_')) {
      setError('Token must start with "ghp_" or "github_pat_"');
      return;
    }

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenInput.trim()}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!response.ok) {
        setError('Invalid token. Check GitHub for a valid Personal Access Token.');
        return;
      }

      setError('');
      useAuthStore.getState().setToken(tokenInput.trim());
      setTokenInput('');
    } catch {
      setError('Failed to validate token. Check your connection.');
    }
  };

  const logout = () => {
    useAuthStore.getState().clearToken();
    setTokenInput('');
    setError('');
  };

  return { tokenInput, setTokenInput, submitToken, logout, error };
}

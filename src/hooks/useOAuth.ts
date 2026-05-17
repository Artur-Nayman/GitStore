import { useState } from 'react';
import { useAuthStore } from '../store/auth';

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const OAUTH_REDIRECT_URL = import.meta.env.VITE_OAUTH_REDIRECT_URL || '';

export function useOAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const startAuth = () => {
    if (!CLIENT_ID) {
      console.error('GitHub Client ID not configured');
      return;
    }

    setIsAuthenticating(true);
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT_URL)}&scope=repo`;

    window.open(authUrl, '_blank');
  };

  const logout = () => {
    useAuthStore.getState().clearToken();
  };

  return { startAuth, logout, isAuthenticating };
}

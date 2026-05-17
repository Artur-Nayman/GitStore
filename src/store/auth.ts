import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  rateLimitRemaining: number;
  rateLimitReset: number;
  setToken: (token: string) => void;
  clearToken: () => void;
  updateRateLimit: (remaining: number, reset: number) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  isAuthenticated: false,
  token: null,
  rateLimitRemaining: 60,
  rateLimitReset: 0,
  setToken: (token) => {
    localStorage.setItem('gitstore_token', token);
    set({ isAuthenticated: true, token });
  },
  clearToken: () => {
    localStorage.removeItem('gitstore_token');
    set({ isAuthenticated: false, token: null, rateLimitRemaining: 60 });
  },
  updateRateLimit: (remaining, reset) => {
    set({ rateLimitRemaining: remaining, rateLimitReset: reset });
  },
}));

export const initAuth = () => {
  const token = localStorage.getItem('gitstore_token');
  if (token) {
    useAuthStore.setState({ isAuthenticated: true, token });
  }
};

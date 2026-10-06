import { create } from 'zustand';
import { load } from '@tauri-apps/plugin-store';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  rateLimitRemaining: number;
  rateLimitReset: number;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  updateRateLimit: (remaining: number, reset: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  rateLimitRemaining: 60,
  rateLimitReset: 0,
  setToken: async (token) => {
    try {
      const store = await load('auth.json');
      await store.set('gitstore_token', token);
      await store.save(); // Ensure it is saved immediately
    } catch (err) {
      console.error('Failed to save token to secure store:', err);
    }
    set({ isAuthenticated: true, token });
  },
  clearToken: async () => {
    try {
      const store = await load('auth.json');
      await store.delete('gitstore_token');
      await store.save(); // Ensure it is saved immediately
    } catch (err) {
      console.error('Failed to remove token from secure store:', err);
    }
    set({ isAuthenticated: false, token: null, rateLimitRemaining: 60 });
  },
  updateRateLimit: (remaining, reset) => {
    set({ rateLimitRemaining: remaining, rateLimitReset: reset });
  },
}));

export const initAuth = async () => {
  try {
    const store = await load('auth.json');

    // Check if we have an old token in localStorage (migration)
    const oldToken = localStorage.getItem('gitstore_token');
    if (oldToken) {
      await store.set('gitstore_token', oldToken);
      await store.save();
      localStorage.removeItem('gitstore_token');
      useAuthStore.setState({ isAuthenticated: true, token: oldToken });
      return;
    }

    // Otherwise, load from secure store
    const token = await store.get<string>('gitstore_token');
    if (token) {
      useAuthStore.setState({ isAuthenticated: true, token });
    }
  } catch (err) {
    console.error('Failed to initialize auth from secure store:', err);
  }
};

import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useAuthStore } from '../store/auth';

export function useDeepLink() {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const setupDeepLink = async () => {
      try {
        const unlisten = await listen('scheme-request-received', (event: any) => {
          const url: string = event.payload;
          if (url.startsWith('gitstore://oauth')) {
            const urlObj = new URL(url);
            const token = urlObj.searchParams.get('token');
            if (token) {
              useAuthStore.getState().setToken(token);
            }
          }
        });

        setIsListening(true);
        return unlisten;
      } catch (error) {
        console.error('Failed to set up deep link listener:', error);
      }
    };

    const unlisten = setupDeepLink();
    return () => {
      unlisten.then(fn => fn?.());
    };
  }, []);

  return { isListening };
}

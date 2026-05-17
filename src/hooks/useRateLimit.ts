import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';

export function useRateLimit() {
  const { rateLimitRemaining, rateLimitReset } = useAuthStore();
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    if (!rateLimitReset) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = rateLimitReset - now;
      if (diff <= 0) {
        setTimeUntilReset('Reset now');
        return;
      }
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeUntilReset(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [rateLimitReset]);

  const getPercentage = () => {
    const max = useAuthStore.getState().token ? 5000 : 60;
    return Math.round((rateLimitRemaining / max) * 100);
  };

  const getColor = () => {
    const pct = getPercentage();
    if (pct > 50) return 'text-gitstore-success';
    if (pct > 20) return 'text-gitstore-warning';
    return 'text-gitstore-danger';
  };

  return { rateLimitRemaining, timeUntilReset, getPercentage, getColor };
}

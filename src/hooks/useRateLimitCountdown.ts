/**
 * Rate Limit Countdown Hook
 * 
 * This hook provides a countdown timer for rate limiting scenarios.
 * It automatically updates the remaining time and provides visual feedback
 * for users when they need to wait before making another request.
 * 
 * Features:
 * - Real-time countdown display
 * - Automatic cleanup when countdown reaches zero
 * - Formatted time display (seconds)
 * - Integration with auth store rate limiting
 * 
 * Usage:
 * - const { remainingTime, isActive } = useRateLimitCountdown()
 * - Display remainingTime in UI when isActive is true
 * - Disable form submissions when isActive is true
 * 
 * Note:
 * - Updates every second for smooth countdown experience
 * - Automatically stops when rate limit expires
 * - Integrates with Zustand auth store
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores';

interface RateLimitCountdown {
  remainingTime: number;
  isActive: boolean;
  formattedTime: string;
}

export const useRateLimitCountdown = (): RateLimitCountdown => {
  const { isRateLimited, rateLimitCooldown, lastAttemptTime } = useAuthStore();
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!isRateLimited) {
      setRemainingTime(0);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const elapsed = (now - lastAttemptTime) / 1000;
      const remaining = Math.max(0, rateLimitCooldown - elapsed);
      
      setRemainingTime(Math.ceil(remaining));
      
      if (remaining <= 0) {
        setRemainingTime(0);
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, rateLimitCooldown, lastAttemptTime]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '0';
    return seconds.toString();
  };

  return {
    remainingTime,
    isActive: isRateLimited && remainingTime > 0,
    formattedTime: formatTime(remainingTime),
  };
};
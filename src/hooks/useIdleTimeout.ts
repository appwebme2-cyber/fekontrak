import { useEffect, useRef, useCallback } from 'react';

const IDLE_MS = 30 * 60 * 1000;      // 30 minutes
const WARN_MS = 2 * 60 * 1000;       // warn 2 minutes before logout

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;

export const useIdleTimeout = (onLogout: () => void, onWarn: () => void, onActive: () => void) => {
  const logoutTimer = useRef<ReturnType<typeof setTimeout>>();
  const warnTimer   = useRef<ReturnType<typeof setTimeout>>();

  const reset = useCallback(() => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warnTimer.current);
    onActive();

    warnTimer.current   = setTimeout(onWarn,   IDLE_MS - WARN_MS);
    logoutTimer.current = setTimeout(onLogout, IDLE_MS);
  }, [onLogout, onWarn, onActive]);

  useEffect(() => {
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(logoutTimer.current);
      clearTimeout(warnTimer.current);
    };
  }, [reset]);
};

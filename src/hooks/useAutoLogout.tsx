
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export const useAutoLogout = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Only set timer if user is logged in
    if (!user) return;

    // Show warning 1 minute before logout
    warningTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Peringatan",
        description: "Anda akan logout otomatis dalam 1 menit karena tidak ada aktivitas.",
        variant: "destructive",
      });
    }, INACTIVITY_TIMEOUT - 60000); // 9 minutes

    // Set logout timer
    timeoutRef.current = setTimeout(async () => {
      toast({
        title: "Logout Otomatis",
        description: "Anda telah logout karena tidak ada aktivitas selama 10 menit.",
        variant: "destructive",
      });
      await signOut();
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Don't track activity if user is not logged in
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user]);

  return { resetTimer };
};

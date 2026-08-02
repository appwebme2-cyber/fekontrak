
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export const useSecurityConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Set security headers via meta tags
    const setSecurityHeaders = () => {
      // Content Security Policy - Hardened for security
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-ancestors 'self' https://*.lovableproject.com; object-src 'none'; base-uri 'self';";
      document.head.appendChild(cspMeta);

      // X-Content-Type-Options
      const noSniffMeta = document.createElement('meta');
      noSniffMeta.httpEquiv = 'X-Content-Type-Options';
      noSniffMeta.content = 'nosniff';
      document.head.appendChild(noSniffMeta);

      // Referrer Policy
      const referrerMeta = document.createElement('meta');
      referrerMeta.httpEquiv = 'Referrer-Policy';
      referrerMeta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(referrerMeta);
    };

    setSecurityHeaders();

    return () => {
      // Cleanup meta tags on unmount
      const metaTags = document.querySelectorAll('meta[http-equiv]');
      metaTags.forEach(tag => tag.remove());
    };
  }, []);

  // Use unified security utilities
  const { sanitizeInput, validateFile: validateFileSecure, detectSuspiciousActivity: detectSuspicious } = 
    require('@/utils/security');

  // Use unified file validation
  const validateFileUpload = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
    try {
      return await validateFileSecure(file);
    } catch (error) {
      return { isValid: false, error: 'File validation failed' };
    }
  };

  // Check for suspicious activity using unified utility
  const detectSuspiciousActivity = (activity: string, data?: any) => {
    const isSuspicious = detectSuspicious(activity, data);

    if (isSuspicious) {
      console.warn('[SECURITY] Suspicious activity detected:', activity);
      toast({
        title: "Security Alert",
        description: "Suspicious activity detected. Action blocked for security.",
        variant: "destructive",
      });
      return true;
    }

    return false;
  };

  return {
    sanitizeInput,
    validateFileUpload,
    detectSuspiciousActivity
  };
};

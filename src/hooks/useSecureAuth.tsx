
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';
import { useSecurityConfig } from './useSecurityConfig';

interface LoginAttempt {
  email: string;
  timestamp: number;
  attempts: number;
}

export const useSecureAuth = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { sanitizeInput, detectSuspiciousActivity } = useSecurityConfig();
  const [loginAttempts, setLoginAttempts] = useState<Map<string, LoginAttempt>>(new Map());

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  const isAccountLocked = useCallback((email: string): boolean => {
    const attempt = loginAttempts.get(email);
    if (!attempt) return false;

    const now = Date.now();
    const timeSinceLastAttempt = now - attempt.timestamp;

    if (timeSinceLastAttempt > LOCKOUT_DURATION) {
      loginAttempts.delete(email);
      setLoginAttempts(new Map(loginAttempts));
      return false;
    }

    return attempt.attempts >= MAX_LOGIN_ATTEMPTS;
  }, [loginAttempts]);

  const recordFailedAttempt = useCallback((email: string) => {
    const sanitizedEmail = sanitizeInput(email);
    const now = Date.now();
    const currentAttempt = loginAttempts.get(sanitizedEmail) || { email: sanitizedEmail, timestamp: now, attempts: 0 };
    
    currentAttempt.attempts += 1;
    currentAttempt.timestamp = now;
    
    loginAttempts.set(sanitizedEmail, currentAttempt);
    setLoginAttempts(new Map(loginAttempts));

    if (currentAttempt.attempts >= MAX_LOGIN_ATTEMPTS) {
      toast({
        title: "Account Temporarily Locked",
        description: `Too many failed login attempts. Account locked for 15 minutes.`,
        variant: "destructive",
      });
    }
  }, [loginAttempts, sanitizeInput, toast]);

  const clearFailedAttempts = useCallback((email: string) => {
    const sanitizedEmail = sanitizeInput(email);
    loginAttempts.delete(sanitizedEmail);
    setLoginAttempts(new Map(loginAttempts));
  }, [loginAttempts, sanitizeInput]);

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a stronger password');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const secureSignIn = async (email: string, password: string) => {
    const sanitizedEmail = sanitizeInput(email);
    
    // Check for suspicious activity
    if (detectSuspiciousActivity(sanitizedEmail) || detectSuspiciousActivity(password)) {
      return { error: { message: 'Suspicious activity detected' } };
    }

    // Check if account is locked
    if (isAccountLocked(sanitizedEmail)) {
      return { 
        error: { 
          message: 'Account temporarily locked due to too many failed attempts. Please try again later.' 
        } 
      };
    }

    try {
      const result = await signIn(sanitizedEmail, password);
      
      if (result.error) {
        recordFailedAttempt(sanitizedEmail);
        return result;
      }

      // Clear failed attempts on successful login
      clearFailedAttempts(sanitizedEmail);
      return result;
    } catch (error) {
      recordFailedAttempt(sanitizedEmail);
      return { error };
    }
  };

  const secureSignUp = async (email: string, password: string, fullName?: string) => {
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedFullName = fullName ? sanitizeInput(fullName) : undefined;
    
    // Check for suspicious activity
    if (detectSuspiciousActivity(sanitizedEmail) || 
        detectSuspiciousActivity(password) || 
        (sanitizedFullName && detectSuspiciousActivity(sanitizedFullName))) {
      return { error: { message: 'Suspicious activity detected' } };
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { 
        error: { 
          message: passwordValidation.errors.join('. ') 
        } 
      };
    }

    try {
      return await signUp(sanitizedEmail, password, sanitizedFullName);
    } catch (error) {
      return { error };
    }
  };

  return {
    secureSignIn,
    secureSignUp,
    validatePassword,
    isAccountLocked
  };
};

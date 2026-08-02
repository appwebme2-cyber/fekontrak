
import { 
  sanitizeInput as securitySanitizeInput, 
  validateUserInput as securityValidateUserInput,
  validateEmail as securityValidateEmail
} from '@/utils/security';

// Legacy functions for backward compatibility
export function sanitizeInput(str: string): string {
  return securitySanitizeInput(str);
}

export function validateEmail(email: string): boolean {
  return securityValidateEmail(email);
}

export function validateUserInput(data: { email?: string; full_name: string; phone?: string }) {
  return securityValidateUserInput(data);
}

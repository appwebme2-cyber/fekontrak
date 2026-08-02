// Unified Security Utilities
// Consolidates all security functions for consistent application-wide use

interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

interface SecurityConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  dangerousExtensions: string[];
  suspiciousPatterns: RegExp[];
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  dangerousExtensions: ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar', '.com', '.pif', '.application'],
  suspiciousPatterns: [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /<script>/i,
    /javascript:/i,
    /eval\(/i,
    /setTimeout\(/i,
    /setInterval\(/i,
    /on\w+\s*=/i
  ]
};

// File signature validation (magic numbers)
const FILE_SIGNATURES: { [key: string]: number[][] } = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
  'image/png': [[0x89, 0x50, 0x4E, 0x47]], // PNG
  'application/msword': [[0xD0, 0xCF, 0x11, 0xE0]], // MS Office
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0x50, 0x4B, 0x03, 0x04]] // ZIP-based
};

/**
 * Enhanced input sanitization with comprehensive XSS protection
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>/"'`]/g, '') // Remove dangerous characters
    .trim();
}

/**
 * Validate email format with enhanced security
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const sanitized = sanitizeInput(email);
  
  return emailRegex.test(sanitized) && sanitized.length <= 254; // RFC 5321 limit
}

/**
 * Validate file using multiple security checks
 */
export async function validateFile(file: File, config: Partial<SecurityConfig> = {}): Promise<FileValidationResult> {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  
  // Size validation
  if (file.size > securityConfig.maxFileSize) {
    return { 
      isValid: false, 
      error: `File size exceeds ${Math.round(securityConfig.maxFileSize / 1024 / 1024)}MB limit` 
    };
  }
  
  // MIME type validation
  if (!securityConfig.allowedFileTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'File type not allowed' 
    };
  }
  
  // Dangerous extension check
  const fileName = file.name.toLowerCase();
  const hasDangerousExtension = securityConfig.dangerousExtensions.some(ext => 
    fileName.endsWith(ext)
  );
  
  if (hasDangerousExtension) {
    return { 
      isValid: false, 
      error: 'File type blocked for security reasons' 
    };
  }
  
  // File signature validation
  const arrayBuffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const isValidSignature = await validateFileSignature(bytes, file.type);
  
  if (!isValidSignature) {
    return { 
      isValid: false, 
      error: 'File content does not match declared type' 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate file signature against expected magic numbers
 */
async function validateFileSignature(bytes: Uint8Array, mimeType: string): Promise<boolean> {
  const expectedSignatures = FILE_SIGNATURES[mimeType];
  if (!expectedSignatures) return true; // No signature check available
  
  return expectedSignatures.some(signature => 
    signature.every((byte, index) => bytes[index] === byte)
  );
}

/**
 * Detect suspicious activity patterns
 */
export function detectSuspiciousActivity(activity: string, data?: any): boolean {
  const content = data ? `${activity} ${JSON.stringify(data)}` : activity;
  
  return DEFAULT_SECURITY_CONFIG.suspiciousPatterns.some(pattern => 
    pattern.test(content)
  );
}

/**
 * Generate secure Content Security Policy
 */
export function generateCSP(allowFraming = true): string {
  const baseCSP = [
    "default-src 'self'",
    "script-src 'self' 'nonce-{NONCE}'", // Remove unsafe-inline/unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Keep for Tailwind
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'"
  ];
  
  if (allowFraming) {
    baseCSP.push("frame-ancestors 'self' https://*.lovableproject.com");
  }
  
  return baseCSP.join('; ');
}

/**
 * Validate user input with comprehensive checks
 */
export function validateUserInput(data: { 
  email?: string; 
  full_name: string; 
  phone?: string; 
}): { valid: boolean; message?: string } {
  const { email, full_name, phone } = data;
  
  // Required field validation
  if (!full_name || !full_name.trim()) {
    return { valid: false, message: "Nama tidak boleh kosong." };
  }
  
  // Sanitize and validate full name
  const sanitizedName = sanitizeInput(full_name);
  if (sanitizedName.length < 2 || sanitizedName.length > 100) {
    return { valid: false, message: "Nama harus antara 2-100 karakter." };
  }
  
  // Email validation if provided
  if (email && !validateEmail(email)) {
    return { valid: false, message: "Format email tidak valid." };
  }
  
  // Phone validation if provided
  if (phone) {
    const sanitizedPhone = sanitizeInput(phone);
    if (sanitizedPhone.length > 25) {
      return { valid: false, message: "Nomor telepon terlalu panjang." };
    }
  }
  
  // Check for suspicious patterns
  const allData = [full_name, email, phone].filter(Boolean).join(' ');
  if (detectSuspiciousActivity(allData)) {
    return { valid: false, message: "Input mengandung karakter tidak diizinkan." };
  }
  
  return { valid: true };
}

/**
 * Create secure filename from user input
 */
export function createSecureFilename(originalName: string): string {
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  
  const sanitizedBase = baseName
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .substring(0, 50);
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `${sanitizedBase}_${timestamp}_${randomSuffix}.${extension}`;
}
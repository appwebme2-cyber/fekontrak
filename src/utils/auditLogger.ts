// Enhanced Audit Logging Utility
import { supabase } from '@/integrations/supabase/client';

interface AuditLogData {
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
}

/**
 * Log security and audit events to the audit_logs table
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const auditLog = {
      ...data,
      user_id: user?.id || null,
      created_at: new Date().toISOString(),
      user_agent: data.user_agent || navigator?.userAgent || null,
      // IP address would need to be captured server-side in a real implementation
      ip_address: data.ip_address || null
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert([auditLog]);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

/**
 * Log user authentication events
 */
export async function logAuthEvent(action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILURE', details?: string): Promise<void> {
  await logAuditEvent({
    action,
    table_name: 'auth_events',
    new_values: { details, timestamp: new Date().toISOString() }
  });
}

/**
 * Log data modification events
 */
export async function logDataEvent(
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  tableName: string,
  recordId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    action,
    table_name: tableName,
    record_id: recordId,
    old_values: oldValues,
    new_values: newValues
  });
}

/**
 * Log security-related events
 */
export async function logSecurityEvent(
  event: 'SUSPICIOUS_ACTIVITY' | 'FILE_UPLOAD' | 'UNAUTHORIZED_ACCESS' | 'SECURITY_VIOLATION',
  details: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    action: event,
    table_name: 'security_events',
    new_values: details
  });
}
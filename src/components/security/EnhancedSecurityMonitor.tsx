import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, Lock, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address?: string;
}

export const EnhancedSecurityMonitor = () => {
  const { userProfile } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Only show to admin users
  if (!userProfile || userProfile.role !== 'admin') {
    return null;
  }

  useEffect(() => {
    fetchSecurityEvents();
    
    // Set up real-time subscription for security events
    const subscription = supabase
      .channel('security_events')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          const newEvent: SecurityEvent = {
            id: payload.new.id,
            type: payload.new.action || 'unknown',
            message: `User action: ${payload.new.action}`,
            timestamp: payload.new.created_at,
            severity: determineSeverity(payload.new.action),
            user_id: payload.new.user_id,
            ip_address: payload.new.ip_address
          };
          setSecurityEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep latest 20
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const events: SecurityEvent[] = auditLogs?.map(log => ({
        id: log.id,
        type: log.action || 'unknown',
        message: `User action: ${log.action} on ${log.table_name}`,
        timestamp: log.created_at,
        severity: determineSeverity(log.action),
        user_id: log.user_id,
        ip_address: log.ip_address
      })) || [];

      setSecurityEvents(events);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineSeverity = (action: string): SecurityEvent['severity'] => {
    if (!action) return 'low';
    
    const criticalActions = ['DELETE', 'DROP', 'TRUNCATE'];
    const highActions = ['UPDATE', 'INSERT', 'LOGIN_FAILURE', 'SUSPICIOUS_ACTIVITY'];
    const mediumActions = ['LOGIN', 'SELECT'];
    
    if (criticalActions.some(a => action.toUpperCase().includes(a))) return 'critical';
    if (highActions.some(a => action.toUpperCase().includes(a))) return 'high';
    if (mediumActions.some(a => action.toUpperCase().includes(a))) return 'medium';
    
    return 'low';
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'login': return <Eye className="h-4 w-4" />;
      case 'logout': return <Lock className="h-4 w-4" />;
      case 'failed_login': return <AlertTriangle className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading security events...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Monitor
          <Badge variant="secondary">{securityEvents.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityEvents.length === 0 ? (
            <p className="text-muted-foreground">No recent security events</p>
          ) : (
            securityEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{event.message}</p>
                  {event.ip_address && (
                    <p className="text-xs text-muted-foreground">
                      IP: {event.ip_address}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
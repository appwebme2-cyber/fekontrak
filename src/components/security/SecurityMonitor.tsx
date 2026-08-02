
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Eye, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'data_access';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const SecurityMonitor = () => {
  const { userProfile } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  // Only show to admin users
  if (!userProfile || userProfile.role !== 'admin') {
    return null;
  }

  useEffect(() => {
    // Simulate loading recent security events
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login_attempt',
        message: 'Successful login from new device',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        severity: 'low'
      },
      {
        id: '2',
        type: 'failed_login',
        message: 'Multiple failed login attempts detected',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        severity: 'medium'
      },
      {
        id: '3',
        type: 'data_access',
        message: 'Financial data accessed by admin user',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        severity: 'low'
      }
    ];

    setSecurityEvents(mockEvents);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_attempt': return <Lock className="h-4 w-4" />;
      case 'failed_login': return <AlertTriangle className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      case 'data_access': return <Eye className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Security Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent security events</p>
          ) : (
            securityEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.message}</p>
                    <p className="text-xs text-gray-500">
                      {event.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge className={getSeverityColor(event.severity)}>
                  {event.severity.toUpperCase()}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

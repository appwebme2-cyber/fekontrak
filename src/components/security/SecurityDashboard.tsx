import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedSecurityMonitor } from './EnhancedSecurityMonitor';

interface SecurityMetric {
  name: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export const SecurityDashboard = () => {
  const { userProfile } = useAuth();

  // Only show to admin users
  if (!userProfile || userProfile.role !== 'admin') {
    return null;
  }

  const securityMetrics: SecurityMetric[] = [
    {
      name: 'Row Level Security',
      status: 'good',
      description: 'RLS policies active on all tables'
    },
    {
      name: 'File Upload Security',
      status: 'good', 
      description: 'Enhanced file validation with signature checking'
    },
    {
      name: 'Input Sanitization',
      status: 'good',
      description: 'Unified input sanitization implemented'
    },
    {
      name: 'Security Headers',
      status: 'good',
      description: 'CSP and security headers configured'
    },
    {
      name: 'Database Version',
      status: 'warning',
      description: 'Security patches available - upgrade recommended'
    },
    {
      name: 'Audit Logging',
      status: 'good',
      description: 'Enhanced audit logging active'
    }
  ];

  const getStatusIcon = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'good': return <Badge className="bg-green-500">Secure</Badge>;
      case 'warning': return <Badge className="bg-yellow-500">Warning</Badge>;
      case 'critical': return <Badge className="bg-red-500">Critical</Badge>;
    }
  };

  const goodCount = securityMetrics.filter(m => m.status === 'good').length;
  const warningCount = securityMetrics.filter(m => m.status === 'warning').length;
  const criticalCount = securityMetrics.filter(m => m.status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{goodCount}</div>
              <div className="text-sm text-green-600">Secure</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-700">{warningCount}</div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
              <div className="text-sm text-red-600">Critical</div>
            </div>
          </div>

          <div className="space-y-3">
            {securityMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metric.status)}
                  <div>
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-sm text-muted-foreground">{metric.description}</div>
                  </div>
                </div>
                {getStatusBadge(metric.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Events Monitor */}
      <EnhancedSecurityMonitor />
    </div>
  );
};
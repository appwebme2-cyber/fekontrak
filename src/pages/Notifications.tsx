
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const notificationsData = [
  {
    id: 1,
    type: 'Contract Expiry',
    title: 'Contract CNT-003 expiring in 7 days',
    description: 'Industrial Maintenance Corp contract expires on June 30, 2024',
    timestamp: '2024-06-13 09:30',
    status: 'unread',
    priority: 'high'
  },
  {
    id: 2,
    type: 'Invoice Due',
    title: 'Invoice INV-002 payment due',
    description: 'Payment term 2 for ABC Industrial Services is due on July 10, 2024',
    timestamp: '2024-06-12 14:15',
    status: 'unread',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'Contract Expiry',
    title: 'Contract CNT-002 expiring in 17 days',
    description: 'XYZ Technical Solutions contract expires on June 30, 2024',
    timestamp: '2024-06-11 10:45',
    status: 'read',
    priority: 'medium'
  },
  {
    id: 4,
    type: 'Approval Required',
    title: 'Invoice INV-002 requires approval',
    description: 'New invoice submission from ABC Industrial Services',
    timestamp: '2024-06-10 16:20',
    status: 'read',
    priority: 'high'
  }
];

const Notifications = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Contract Expiry':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'Invoice Due':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'Approval Required':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    } as const;

    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Manage alerts and notification preferences
        </p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="email-contracts">Contract expiry alerts</Label>
                  </div>
                  <Switch id="email-contracts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="email-invoices">Invoice due reminders</Label>
                  </div>
                  <Switch id="email-invoices" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="email-approvals">Approval requests</Label>
                  </div>
                  <Switch id="email-approvals" defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">WhatsApp Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="whatsapp-urgent">Urgent alerts only</Label>
                  </div>
                  <Switch id="whatsapp-urgent" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="whatsapp-daily">Daily summary</Label>
                  </div>
                  <Switch id="whatsapp-daily" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Reminder Timing</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Contract Expiry Reminders</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">H-30</Badge>
                  <Badge variant="outline">H-7</Badge>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Invoice Due Reminders</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">H-7</Badge>
                  <Badge variant="outline">H-1</Badge>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest alerts and reminders</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Mark All as Read
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationsData.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  notification.status === 'unread' 
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' 
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(notification.priority)}
                      {notification.status === 'unread' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;

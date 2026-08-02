import { Bell, Check, X, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface RealTimeNotificationsProps {
  showConnectionStatus?: boolean;
}

export const RealTimeNotifications = ({ showConnectionStatus = false }: RealTimeNotificationsProps) => {
  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useRealTimeNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'kom_overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'progress_behind':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'contract_ending':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'kom_overdue':
        return 'border-l-red-500 bg-red-50/50';
      case 'progress_behind':
        return 'border-l-yellow-500 bg-yellow-50/50';
      case 'contract_ending':
        return 'border-l-blue-500 bg-blue-50/50';
      default:
        return 'border-l-muted-foreground';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Connection status indicator */}
      {showConnectionStatus && (
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            {connected ? 'Terhubung' : 'Terputus'}
          </span>
        </div>
      )}

      {/* Notifications popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                variant="destructive"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Notifikasi</CardTitle>
                <div className="flex items-center gap-2">
                  {connected && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">Live</span>
                    </div>
                  )}
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-6 px-2"
                    >
                      Tandai Semua Dibaca
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Tidak ada notifikasi
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-1">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div className={`
                          p-3 border-l-2 transition-colors hover:bg-muted/30 cursor-pointer
                          ${getNotificationColor(notification.type)}
                          ${!notification.read ? 'bg-muted/20' : ''}
                        `}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                        {(notification as any).created_at && !isNaN(new Date((notification as any).created_at).getTime())
  ? formatDistanceToNow(new Date((notification as any).created_at), { addSuffix: true, locale: id })
  : 'Baru saja'
}
                                </span>
                                
                                <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                      className="h-5 w-5 p-0"
                                      title="Tandai dibaca"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="h-5 w-5 p-0 text-red-500"
                                    title="Hapus notifikasi"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {index < notifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};
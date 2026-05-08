import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bell, X, ExternalLink, Clock } from 'lucide-react';
import { Notification, getNotificationIcon, formatNotificationTime } from '../data/notificationsData';

interface InlineNotificationsProps {
  filterType?: string;
  maxItems?: number;
  showHeader?: boolean;
  onNavigateToAll?: () => void;
}

export const InlineNotifications: React.FC<InlineNotificationsProps> = ({
  filterType,
  maxItems = 3,
  showHeader = true,
  onNavigateToAll
}) => {
  const { notifications, unreadCount, markAsRead } = useApp();

  // Filter notifications based on type and show only unread ones
  const relevantNotifications = notifications
    .filter(notification => {
      const isUnread = !notification.isRead;
      const matchesType = !filterType || notification.type === filterType;
      return isUnread && matchesType;
    })
    .slice(0, maxItems);

  if (relevantNotifications.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      {showHeader && (
        <div className="p-4 pb-2 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Notificaciones recientes
              </h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  {unreadCount}
                </Badge>
              )}
            </div>
            
            {onNavigateToAll && unreadCount > maxItems && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNavigateToAll}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Ver todas
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        <div className="divide-y divide-blue-200 dark:divide-blue-800">
          {relevantNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
        
        {unreadCount > maxItems && onNavigateToAll && (
          <div className="p-3 border-t border-blue-200 dark:border-blue-800 bg-blue-100/50 dark:bg-blue-900/20">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onNavigateToAll}
              className="w-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Ver {unreadCount - maxItems} notificaciones más
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead 
}) => {
  return (
    <div className="p-3 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-lg shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-blue-900 dark:text-blue-100 text-sm truncate">
                {notification.title}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {formatNotificationTime(notification.createdAt)}
                </span>
                {notification.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs py-0 px-1">
                    Urgente
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              onClick={() => onMarkAsRead(notification.id)}
              title="Marcar como leída"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
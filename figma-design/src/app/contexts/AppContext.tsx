import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User, mockUsers } from '../data/mockData';
import { Notification, mockNotifications } from '../data/notificationsData';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User | null;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('publico');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Get current user based on role
  const currentUser = currentRole === 'publico' ? null : mockUsers.find(user => user.role === currentRole) || null;

  // Load notifications when role changes
  useEffect(() => {
    setNotifications(mockNotifications[currentRole] || []);
  }, [currentRole]);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const refreshNotifications = () => {
    setNotifications(mockNotifications[currentRole] || []);
  };

  const logout = () => {
    setCurrentRole('publico');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    currentRole,
    setCurrentRole,
    currentUser,
    theme,
    setTheme,
    toggleTheme,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    logout,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User, mockUsers } from '../data/mockData';
import { Notification, mockNotifications } from '../data/notificationsData';
import { setAuthToken, toUserRole } from '../lib/api';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User | null;
  setSession: (user: User | null, token?: string) => void;
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
  const loadStoredUser = (): User | null => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed) return null;
      return {
        id: String(parsed.id ?? ''),
        firstName: parsed.firstName ?? '',
        lastName: parsed.lastName ?? '',
        email: parsed.email ?? '',
        role: toUserRole(parsed.role),
        avatar: parsed.avatar,
      } as User;
    } catch (err) {
      console.warn('Failed to parse stored user', err);
      return null;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStoredUser());
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => currentUser?.role ?? 'publico');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  const setSession = (user: User | null, token?: string) => {
    const normalizedUser = user
      ? { ...user, role: toUserRole(user.role) }
      : null;

    if (typeof token !== 'undefined') {
      setAuthToken(token);
    }

    if (normalizedUser) {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem('user');
    }

    setCurrentUser(normalizedUser);
    setCurrentRoleState(normalizedUser?.role ?? 'publico');
  };

  const setCurrentRole = (role: UserRole) => {
    if (role === 'publico') {
      setSession(null, undefined);
      return;
    }

    setCurrentRoleState(role);

    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return;
    }

    const demoUser = mockUsers.find((user) => user.role === role) || null;
    if (demoUser) {
      setCurrentUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
    }
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
    setSession(null, undefined);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    currentRole,
    setCurrentRole,
    currentUser,
    setSession,
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

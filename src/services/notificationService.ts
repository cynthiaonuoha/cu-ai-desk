
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'message' | 'friend_accepted' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Add a notification
  addNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();

    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      duration: 4000,
    });

    return newNotification;
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Subscribe to notifications
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Browser notification methods
  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return window.Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    const permission = await window.Notification.requestPermission();
    return permission;
  }

  showNotification(title: string, options?: NotificationOptions): globalThis.Notification | null {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      return null;
    }

    return new window.Notification(title, {
      icon: '/favicon.ico',
      ...options,
    });
  }
}

export const notificationService = NotificationService.getInstance();

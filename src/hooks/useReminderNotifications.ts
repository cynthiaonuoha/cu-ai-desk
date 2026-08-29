
import { useEffect, useRef } from 'react';
import { notificationService } from '@/services/notificationService';
import { toast } from '@/components/ui/sonner';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  reminder_time: string;
  is_completed: boolean;
}

interface UseReminderNotificationsProps {
  reminders: Reminder[];
  enabled: boolean;
}

export const useReminderNotifications = ({ reminders, enabled }: UseReminderNotificationsProps) => {
  const notifiedReminders = useRef(new Set<string>());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const checkReminders = () => {
      const now = new Date();
      
      reminders.forEach(reminder => {
        if (reminder.is_completed) return;
        if (notifiedReminders.current.has(reminder.id)) return;

        const reminderTime = new Date(reminder.reminder_time);
        const timeDiff = reminderTime.getTime() - now.getTime();
        
        // Notify if reminder is due (within 1 minute)
        if (timeDiff <= 60000 && timeDiff >= 0) {
          notifiedReminders.current.add(reminder.id);
          
          // Try browser notification first
          if (notificationService.getPermission() === 'granted') {
            notificationService.showNotification(
              `⏰ Reminder: ${reminder.title}`,
              {
                body: reminder.description || 'Your reminder is due now!',
                tag: reminder.id,
                requireInteraction: true
              }
            );
          }
          
          // Always show toast as fallback
          toast(`⏰ Reminder: ${reminder.title}`, {
            description: reminder.description || 'Your reminder is due now!',
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => {
                // Focus the reminders page if not already focused
                if (document.hidden) {
                  window.focus();
                }
              }
            }
          });
        }
      });
    };

    // Check every 30 seconds
    intervalRef.current = setInterval(checkReminders, 30000);
    
    // Initial check
    checkReminders();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reminders, enabled]);

  // Clean up notified reminders when reminders change
  useEffect(() => {
    const currentReminderIds = new Set(reminders.map(r => r.id));
    const notifiedIds = Array.from(notifiedReminders.current);
    
    notifiedIds.forEach(id => {
      if (!currentReminderIds.has(id)) {
        notifiedReminders.current.delete(id);
      }
    });
  }, [reminders]);

  return {
    notifiedCount: notifiedReminders.current.size
  };
};

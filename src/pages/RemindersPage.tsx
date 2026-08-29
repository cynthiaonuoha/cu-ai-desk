
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import { useReminders } from '@/hooks/useReminders';
import { RemindersHeader } from '@/components/RemindersHeader';
import { ReminderForm } from '@/components/ReminderForm';
import { RemindersList } from '@/components/RemindersList';

const RemindersPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('reminders-notifications-enabled') === 'true';
  });
  const { user, loading: authLoading } = useAuth();

  const {
    reminders,
    loading,
    addReminder,
    deleteReminder,
    toggleReminder
  } = useReminders({ userId: user?.id });

  // Initialize notification system
  const { notifiedCount } = useReminderNotifications({
    reminders,
    enabled: notificationsEnabled
  });

  // Save notification preference to localStorage
  useEffect(() => {
    localStorage.setItem('reminders-notifications-enabled', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  // Redirect to auth if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <RemindersHeader
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={setNotificationsEnabled}
        />

        <ReminderForm onAddReminder={addReminder} />

        <RemindersList
          reminders={reminders}
          loading={loading}
          onToggle={toggleReminder}
          onDelete={deleteReminder}
        />
      </motion.div>
    </div>
  );
};

export default RemindersPage;


import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReminderCard } from '@/components/ReminderCard';
import { Reminder } from '@/types/reminders';

interface RemindersListProps {
  reminders: Reminder[];
  loading: boolean;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export const RemindersList = ({ reminders, loading, onToggle, onDelete }: RemindersListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Bell size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No reminders set</p>
        <p className="text-gray-400">Create your first reminder to get started</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {reminders.map((reminder, index) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            index={index}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

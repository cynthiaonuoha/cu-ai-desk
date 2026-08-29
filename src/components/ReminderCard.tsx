
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Reminder } from '@/types/reminders';

interface ReminderCardProps {
  reminder: Reminder;
  index: number;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export const ReminderCard = ({ reminder, index, onToggle, onDelete }: ReminderCardProps) => {
  const formatDateTime = (reminderTime: string) => {
    const date = new Date(reminderTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDateTime(reminder.reminder_time);

  return (
    <motion.div
      key={reminder.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`shadow-lg transition-all duration-300 hover:shadow-xl ${
        !reminder.is_completed ? 'bg-white border-purple-100' : 'bg-gray-50 border-gray-200'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ 
                    scale: !reminder.is_completed ? [1, 1.2, 1] : 1,
                    rotate: !reminder.is_completed ? [0, 15, -15, 0] : 0
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: !reminder.is_completed ? Infinity : 0,
                    repeatDelay: 3 
                  }}
                >
                  <Bell size={20} className={!reminder.is_completed ? 'text-amber-500' : 'text-gray-400'} />
                </motion.div>
                <h3 className={`text-lg font-semibold ${
                  !reminder.is_completed ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {reminder.title}
                </h3>
                <Badge className={!reminder.is_completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                  {!reminder.is_completed ? 'Active' : 'Completed'}
                </Badge>
              </div>
              {reminder.description && (
                <p className="text-gray-600 mb-3">{reminder.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {time}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggle(reminder.id, reminder.is_completed)}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                {reminder.is_completed ? 'Mark Pending' : 'Mark Complete'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{reminder.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(reminder.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Reminder, FormData } from '@/types/reminders';

interface UseRemindersProps {
  userId: string | undefined;
}

export const useReminders = ({ userId }: UseRemindersProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      console.log('Fetching reminders for user:', userId);
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reminders:', error);
        throw error;
      }
      
      console.log('Fetched reminders:', data);
      setReminders(data || []);
    } catch (error: any) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to load reminders: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (formData: FormData) => {
    if (!formData.title || !formData.date || !formData.time || !userId) {
      toast.error('Please fill in all required fields');
      return false;
    }

    try {
      console.log('Creating reminder with data:', {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        user_id: userId
      });

      const reminderDateTime = new Date(`${formData.date}T${formData.time}`);
      console.log('Parsed datetime:', reminderDateTime);
      
      if (isNaN(reminderDateTime.getTime())) {
        throw new Error('Invalid date or time format');
      }

      const reminderData = {
        title: formData.title,
        description: formData.description || null,
        reminder_time: reminderDateTime.toISOString(),
        user_id: userId,
        is_completed: false
      };

      console.log('Inserting reminder data:', reminderData);

      const { data, error } = await supabase
        .from('reminders')
        .insert(reminderData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully created reminder:', data);
      setReminders(prev => [data, ...prev]);
      toast.success('Reminder created successfully');
      return true;
    } catch (error: any) {
      console.error('Error adding reminder:', error);
      
      if (error?.message?.includes('row-level security')) {
        toast.error('Authentication error: Please try logging out and back in');
      } else if (error?.message?.includes('violates')) {
        toast.error('Permission denied: Unable to create reminder');
      } else {
        toast.error('Failed to create reminder: ' + (error?.message || 'Unknown error'));
      }
      return false;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      console.log('Deleting reminder:', id);
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting reminder:', error);
        throw error;
      }

      setReminders(prev => prev.filter(reminder => reminder.id !== id));
      toast.success('Reminder deleted successfully');
    } catch (error: any) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder: ' + (error?.message || 'Unknown error'));
    }
  };

  const toggleReminder = async (id: string, currentStatus: boolean) => {
    try {
      console.log('Toggling reminder:', id, 'from', currentStatus, 'to', !currentStatus);
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: !currentStatus })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating reminder:', error);
        throw error;
      }

      setReminders(prev => prev.map(reminder => 
        reminder.id === id ? { ...reminder, is_completed: !currentStatus } : reminder
      ));
      
      toast.success(`Reminder ${!currentStatus ? 'completed' : 'marked as pending'}`);
    } catch (error: any) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder: ' + (error?.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReminders();
    }
  }, [userId]);

  return {
    reminders,
    loading,
    addReminder,
    deleteReminder,
    toggleReminder,
    fetchReminders
  };
};

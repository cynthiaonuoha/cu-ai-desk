
export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  reminder_time: string;
  is_completed: boolean;
  created_at: string;
  user_id: string;
}

export interface FormData {
  title: string;
  description: string;
  date: string;
  time: string;
}

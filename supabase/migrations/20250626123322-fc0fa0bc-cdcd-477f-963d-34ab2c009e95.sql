
-- Add activity tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN is_online BOOLEAN DEFAULT false,
ADD COLUMN show_activity_status BOOLEAN DEFAULT true;

-- Create function to update last_seen timestamp
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.last_seen = now();
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update last_seen on profile updates
CREATE TRIGGER update_profiles_last_seen
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_seen();

-- Enable realtime for profiles table to track presence
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

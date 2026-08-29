
-- Check if RLS is enabled and add proper policies for profiles table
-- First, let's see the current state and add missing policies

-- Enable RLS if not already enabled (safe to run even if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add policy to allow authenticated users to view public profiles
CREATE POLICY "Allow viewing public profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (privacy_level = 'public');

-- Add policy to allow users to view profiles of their friends
CREATE POLICY "Allow viewing friend profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (
    privacy_level = 'friends' AND (
      EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE (requester_id = auth.uid() AND addressee_id = profiles.id AND status = 'accepted')
           OR (addressee_id = auth.uid() AND requester_id = profiles.id AND status = 'accepted')
      )
    )
  );

-- Ensure the existing policy for users to view their own profile still works
-- (This should already exist from previous migrations, but let's make sure)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

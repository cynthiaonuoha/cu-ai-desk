
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Enable RLS on the profiles table (this is safe to run even if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create policy that allows users to INSERT their own profile
CREATE POLICY "Users can create their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create policy that allows users to UPDATE their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Ensure the trigger is properly set up for profile completion calculation
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON public.profiles;
CREATE TRIGGER trigger_update_profile_completion
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

-- Also add a trigger for INSERT to calculate completion on first profile creation
DROP TRIGGER IF EXISTS trigger_insert_profile_completion ON public.profiles;
CREATE TRIGGER trigger_insert_profile_completion
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

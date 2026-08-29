
-- First, ensure the calculate_profile_completion function exists and is properly defined
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_count INTEGER := 0;
    total_fields INTEGER := 12;
BEGIN
    SELECT 
        (CASE WHEN username IS NOT NULL AND username != '' THEN 1 ELSE 0 END) +
        (CASE WHEN display_name IS NOT NULL AND display_name != '' THEN 1 ELSE 0 END) +
        (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) +
        (CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 1 ELSE 0 END) +
        (CASE WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END) +
        (CASE WHEN date_of_birth IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN student_id IS NOT NULL AND student_id != '' THEN 1 ELSE 0 END) +
        (CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END) +
        (CASE WHEN department IS NOT NULL AND department != '' THEN 1 ELSE 0 END) +
        (CASE WHEN level IS NOT NULL AND level != '' THEN 1 ELSE 0 END) +
        (CASE WHEN interests IS NOT NULL AND array_length(interests, 1) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN social_bio IS NOT NULL AND social_bio != '' THEN 1 ELSE 0 END)
    INTO completion_count
    FROM public.profiles
    WHERE id = profile_id;
    
    RETURN COALESCE((completion_count * 100 / total_fields), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the update_profile_completion function with proper error handling
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Use a safe approach to calculate completion percentage
    BEGIN
        NEW.profile_completion_percentage := public.calculate_profile_completion(NEW.id);
    EXCEPTION WHEN OTHERS THEN
        -- If calculation fails, set to 0 and log the error
        NEW.profile_completion_percentage := 0;
        RAISE WARNING 'Failed to calculate profile completion for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert new profile with error handling
    BEGIN
        INSERT INTO public.profiles (id, username, display_name, profile_completion_percentage)
        VALUES (
            NEW.id, 
            NEW.email, 
            SPLIT_PART(NEW.email, '@', 1),
            -- Calculate initial completion percentage (username + display_name = 2/12 fields = ~17%)
            17
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't block user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        -- Still insert a basic profile to prevent foreign key issues
        INSERT INTO public.profiles (id, username, display_name, profile_completion_percentage)
        VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.email, '@', 1), 0)
        ON CONFLICT (id) DO NOTHING;
    END;
    
    RETURN NEW;
END;
$$;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON public.profiles;
DROP TRIGGER IF EXISTS trigger_insert_profile_completion ON public.profiles;

-- Recreate the auth trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Recreate profile completion triggers
CREATE TRIGGER trigger_update_profile_completion
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profile_completion();

CREATE TRIGGER trigger_insert_profile_completion
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profile_completion();

-- Add RLS policies for profiles table if they don't exist
DO $$
BEGIN
    -- Check if policies exist, if not create them
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view public profiles'
    ) THEN
        CREATE POLICY "Users can view public profiles" 
        ON public.profiles 
        FOR SELECT 
        USING (privacy_level = 'public' OR id = auth.uid());
    END IF;
END $$;

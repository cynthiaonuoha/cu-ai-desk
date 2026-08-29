
-- Fix the handle_new_user function to have proper error handling and search path
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

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();
